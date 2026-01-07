# PostgreSQL/Supabase Migration Patterns Research

**Research Date:** 2025-12-08
**Project:** Hanzi Dojo Dictionary Data Migrations
**Focus:** JSONB queries, bulk updates, self-verifying migrations, reference data patterns

---

## Table of Contents

1. [JSONB Query Patterns](#jsonb-query-patterns)
2. [Transaction Control & Rollback Strategies](#transaction-control--rollback-strategies)
3. [Bulk Update Patterns with CTEs](#bulk-update-patterns-with-ctes)
4. [Data Validation & Constraints](#data-validation--constraints)
5. [Self-Verifying Migration Patterns](#self-verifying-migration-patterns)
6. [Supabase-Specific Best Practices](#supabase-specific-best-practices)
7. [Reference Data Migration Strategies](#reference-data-migration-strategies)
8. [Audit & Finding Incomplete Data](#audit--finding-incomplete-data)
9. [Hanzi Dojo Application Examples](#hanzi-dojo-application-examples)

---

## JSONB Query Patterns

### Finding Missing or Incomplete Data

#### Check for NULL or Empty JSONB Fields
```sql
-- Find characters without zhuyin
SELECT simp, trad
FROM dictionary_entries
WHERE zhuyin IS NULL OR zhuyin = '[]'::jsonb;

-- Find characters with empty zhuyin_variants
SELECT simp, trad
FROM dictionary_entries
WHERE zhuyin_variants IS NULL
   OR zhuyin_variants = '[]'::jsonb
   OR zhuyin_variants = 'null'::jsonb;
```

#### Check for Malformed JSONB Structures
```sql
-- Find entries where zhuyin array is present but empty elements exist
SELECT simp, trad, zhuyin
FROM dictionary_entries
WHERE jsonb_array_length(zhuyin) = 0
   OR zhuyin @> '[null]'::jsonb;

-- Find variants with missing required fields
SELECT simp, trad, zhuyin_variants
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL
  AND NOT (
    -- Check that each variant has required keys
    (SELECT bool_and(
      variant ? 'pinyin' AND
      variant ? 'zhuyin' AND
      variant ? 'context_words'
    )
    FROM jsonb_array_elements(zhuyin_variants) AS variant)
  );
```

### JSONB Containment and Existence Queries

#### Using Containment Operators (@>, <@)
```sql
-- Find characters with specific tone marker in any reading
SELECT simp, trad, zhuyin
FROM dictionary_entries
WHERE zhuyin @> '[[null, null, "ˊ"]]'::jsonb;

-- Find multi-pronunciation characters (more than one reading)
SELECT simp, trad, jsonb_array_length(zhuyin) as reading_count
FROM dictionary_entries
WHERE jsonb_array_length(zhuyin) > 1
ORDER BY reading_count DESC;
```

#### Using Existence Operators (?, ?|, ?&)
```sql
-- Check if zhuyin_variants contains any pinyin values
SELECT simp, trad
FROM dictionary_entries
WHERE zhuyin_variants @> '[{"pinyin": "shén"}]'::jsonb;

-- Find entries with specific context words
SELECT simp, trad, zhuyin_variants
FROM dictionary_entries
WHERE zhuyin_variants::text LIKE '%什么%';
```

### JSONB Path Queries (JSONPath)

```sql
-- Find characters where any variant has empty context_words
SELECT simp, trad, zhuyin_variants
FROM dictionary_entries
WHERE jsonb_path_exists(
  zhuyin_variants,
  '$[*] ? (@.context_words.size() == 0)'
);

-- Find variants with null meanings
SELECT simp, trad
FROM dictionary_entries
WHERE jsonb_path_query_array(
  zhuyin_variants,
  '$[*] ? (@.meanings == null)'
) != '[]'::jsonb;
```

### Indexing JSONB for Performance

```sql
-- Default GIN index (supports @>, ?, ?|, ?&, @?)
CREATE INDEX idx_dictionary_zhuyin_gin
ON dictionary_entries USING GIN (zhuyin);

-- Path-specific index for faster containment checks
CREATE INDEX idx_dictionary_zhuyin_path
ON dictionary_entries USING GIN (zhuyin jsonb_path_ops);

-- Expression index for nested queries
CREATE INDEX idx_dictionary_variants_pinyin
ON dictionary_entries USING GIN ((zhuyin_variants -> 'pinyin'));
```

**Performance Notes:**
- `jsonb_ops` (default): Supports all operators, larger index
- `jsonb_path_ops`: Only supports `@>`, smaller and faster for containment
- Expression indexes: Optimize specific nested path queries

---

## Transaction Control & Rollback Strategies

### Savepoints for Partial Rollback

#### Basic Savepoint Pattern
```sql
BEGIN;

-- Initial work
UPDATE dictionary_entries
SET frequency_rank = 1000
WHERE simp = '什';

-- Create savepoint before risky operation
SAVEPOINT before_bulk_update;

-- Risky operation
UPDATE dictionary_entries
SET zhuyin_variants = '...'::jsonb
WHERE simp IN (...);

-- If error occurs, rollback to savepoint (not entire transaction)
ROLLBACK TO SAVEPOINT before_bulk_update;

-- Continue with different approach
UPDATE dictionary_entries
SET zhuyin_variants = '...'::jsonb
WHERE simp = '什';

COMMIT;
```

#### Self-Verifying Migration with Savepoints
```sql
BEGIN;

-- Step 1: Backup current state
CREATE TEMP TABLE backup_dictionary AS
SELECT * FROM dictionary_entries
WHERE simp IN ('什', '为', '了', '着');

SAVEPOINT pre_migration;

-- Step 2: Apply migration
UPDATE dictionary_entries
SET zhuyin_variants = '[...]'::jsonb
WHERE simp = '什';

-- Step 3: Verify results
DO $$
DECLARE
  affected_count INTEGER;
  expected_count INTEGER := 1;
BEGIN
  GET DIAGNOSTICS affected_count = ROW_COUNT;

  IF affected_count != expected_count THEN
    RAISE EXCEPTION
      'Expected % rows affected, got %',
      expected_count,
      affected_count;
  END IF;

  -- Additional validation
  IF NOT EXISTS (
    SELECT 1 FROM dictionary_entries
    WHERE simp = '什'
      AND jsonb_array_length(zhuyin_variants) >= 2
  ) THEN
    RAISE EXCEPTION 'Verification failed: 什 should have 2+ variants';
  END IF;

  RAISE NOTICE 'Verification passed';
END $$;

-- If we reach here, commit. If exception raised, auto-rollback
COMMIT;
```

### Rollback Best Practices

**Point-in-Time Recovery (Production)**
- Use named restore points: `SELECT pg_create_restore_point('pre_migration_2025_12_08');`
- Document restore point name in migration file
- Restore via PITR if needed: `recovery_target_name = 'pre_migration_2025_12_08'`

**Backup-Based Rollback (Reference Data)**
- Export dictionary before migration: `pg_dump -t dictionary_entries > backup.sql`
- For Supabase: Keep source JSON files in `/data/` directory (git-versioned)
- Test restore process in development environment first

**Roll-Forward Only (Modern Approach)**
- Production issues fixed via new migrations (not rollback)
- Development can iterate by resetting local database
- Maintains linear migration history
- Avoids rollback script maintenance burden

---

## Bulk Update Patterns with CTEs

### Batch Updates Using CTEs and ctid

**Problem:** Large updates can lock tables, consume resources, cause replication lag

**Solution:** Process in batches using CTEs with LIMIT

```sql
-- Update 5000 rows at a time
WITH batch AS (
  SELECT w.ctid
  FROM dictionary_entries AS w
  WHERE zhuyin IS NULL OR zhuyin = '[]'::jsonb
  ORDER BY simp
  FOR UPDATE SKIP LOCKED  -- Skip rows locked by other processes
  LIMIT 5000
)
UPDATE dictionary_entries
SET zhuyin = '[["ㄨ","ㄟ","ˋ"]]'::jsonb
FROM batch
WHERE dictionary_entries.ctid = batch.ctid;

-- Repeat until no more rows affected
```

**Key Benefits:**
- Limits resource consumption per batch
- Allows concurrent operations on different batches
- Enables progress monitoring
- Can be paused/resumed safely

### CTE with RETURNING for Logging

```sql
-- Update and log changes
WITH updated AS (
  UPDATE dictionary_entries
  SET zhuyin_variants = '[...]'::jsonb
  WHERE simp IN ('什', '为')
  RETURNING simp, trad, zhuyin_variants, current_timestamp as updated_at
)
INSERT INTO dictionary_audit_log (character, variants, updated_at)
SELECT simp, zhuyin_variants, updated_at FROM updated;
```

### Deduplication with CTEs

```sql
-- Find and remove duplicate entries (keep lowest id)
WITH duplicates AS (
  SELECT simp, MIN(id) as keep_id
  FROM dictionary_entries
  GROUP BY simp
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT d.id
  FROM dictionary_entries d
  JOIN duplicates dup ON d.simp = dup.simp
  WHERE d.id != dup.keep_id
)
DELETE FROM dictionary_entries
WHERE id IN (SELECT id FROM to_delete)
RETURNING simp, trad;
```

---

## Data Validation & Constraints

### CHECK Constraints for Data Quality

#### Column-Level Constraints
```sql
CREATE TABLE dictionary_entries (
  id SERIAL PRIMARY KEY,
  simp TEXT NOT NULL CHECK (length(simp) > 0),
  trad TEXT NOT NULL CHECK (length(trad) > 0),
  zhuyin JSONB NOT NULL CHECK (jsonb_array_length(zhuyin) > 0),
  frequency_rank INTEGER CHECK (frequency_rank > 0)
);
```

#### Table-Level Constraints
```sql
ALTER TABLE dictionary_entries
ADD CONSTRAINT valid_zhuyin_structure
CHECK (
  -- Each zhuyin reading must be array of 3 elements
  (SELECT bool_and(jsonb_array_length(reading) = 3)
   FROM jsonb_array_elements(zhuyin) AS reading)
);

ALTER TABLE dictionary_entries
ADD CONSTRAINT valid_variants_structure
CHECK (
  zhuyin_variants IS NULL OR
  (SELECT bool_and(
    variant ? 'pinyin' AND
    variant ? 'zhuyin' AND
    variant ? 'context_words'
  ) FROM jsonb_array_elements(zhuyin_variants) AS variant)
);
```

### Adding Constraints Without Downtime

#### Use NOT VALID for Existing Data
```sql
-- Add constraint without validating existing data
ALTER TABLE dictionary_entries
ADD CONSTRAINT valid_zhuyin_structure
CHECK (jsonb_array_length(zhuyin) > 0)
NOT VALID;

-- Validate in separate transaction (can be done during maintenance window)
ALTER TABLE dictionary_entries
VALIDATE CONSTRAINT valid_zhuyin_structure;
```

**Benefits:**
- Initial `ADD CONSTRAINT NOT VALID` takes minimal lock time
- Validation (`VALIDATE CONSTRAINT`) uses ShareUpdateExclusive lock
- ShareUpdateExclusive allows INSERT/UPDATE/DELETE to continue
- Can fix invalid data before validation step

### Domain Constraints for Reusable Validation

```sql
-- Create domain for zhuyin arrays
CREATE DOMAIN zhuyin_array AS JSONB
CHECK (
  jsonb_typeof(VALUE) = 'array' AND
  jsonb_array_length(VALUE) > 0
);

-- Use in table definition
CREATE TABLE dictionary_entries (
  simp TEXT PRIMARY KEY,
  zhuyin zhuyin_array NOT NULL
);
```

---

## Self-Verifying Migration Patterns

### Pre-Migration Safety Checks

```sql
-- Migration 011b Pattern: Verify all expected rows exist
DO $$
DECLARE
  char_count INTEGER;
  expected_count INTEGER := 35;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN ('行', '重', '还', ...);

  IF char_count != expected_count THEN
    RAISE EXCEPTION 'Expected % characters, found %',
      expected_count, char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: All % characters exist',
    expected_count;
END $$;
```

### Post-Migration Verification

```sql
-- Verify row count matches expectation
DO $$
DECLARE
  updated_count INTEGER;
  expected_count INTEGER := 35;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM dictionary_entries
  WHERE simp IN ('行', '重', '还', ...)
    AND zhuyin_variants IS NOT NULL
    AND jsonb_array_length(zhuyin_variants) >= 2;

  IF updated_count != expected_count THEN
    RAISE EXCEPTION
      'Verification failed: Expected % updated, found %',
      expected_count,
      updated_count;
  END IF;

  RAISE NOTICE 'Verification passed: % characters updated correctly',
    updated_count;
END $$;
```

### Transaction-Level Self-Verification

```sql
BEGIN;

-- Migration statements
UPDATE dictionary_entries
SET zhuyin_variants = '[...]'::jsonb
WHERE simp = '什';

-- Inline verification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM dictionary_entries
    WHERE simp = '什'
      AND jsonb_array_length(zhuyin_variants) = 2
  ) THEN
    RAISE EXCEPTION 'Migration failed verification';
  END IF;
END $$;

-- Only commits if all verifications pass
COMMIT;
```

### Shadow Database Testing

**Pattern:** Test migration on identical schema before production

```bash
# Supabase local development workflow
supabase migration new fix_dictionary_variants
# Edit migration file
supabase db reset  # Applies all migrations to local instance
supabase test db   # Run pgTAP tests

# If tests pass, deploy to staging
supabase db push --db-url $STAGING_URL

# After staging validation, deploy to production
supabase db push --db-url $PRODUCTION_URL
```

---

## Supabase-Specific Best Practices

### Migration Workflow

#### Local Development
```bash
# Create new migration
supabase migration new dictionary_fix_variants

# Edit supabase/migrations/YYYYMMDDHHMMSS_dictionary_fix_variants.sql

# Apply migration locally
supabase db reset  # Resets database and applies all migrations

# OR apply just new migration
supabase migration up
```

#### Testing with pgTAP
```sql
-- supabase/tests/dictionary_structure.sql
BEGIN;
SELECT plan(5);

-- Test: All entries have zhuyin
SELECT is(
  (SELECT COUNT(*) FROM dictionary_entries WHERE zhuyin IS NULL),
  0::bigint,
  'No entries should have NULL zhuyin'
);

-- Test: Multi-pronunciation characters have variants
SELECT ok(
  (SELECT COUNT(*) FROM dictionary_entries
   WHERE simp IN ('什', '为', '了', '着')
     AND jsonb_array_length(zhuyin_variants) >= 2) = 4,
  'Multi-pronunciation characters have 2+ variants'
);

-- Test: Variant structure is valid
SELECT ok(
  (SELECT bool_and(
     variant ? 'pinyin' AND
     variant ? 'zhuyin' AND
     variant ? 'context_words'
   )
   FROM dictionary_entries,
   LATERAL jsonb_array_elements(zhuyin_variants) AS variant
   WHERE zhuyin_variants IS NOT NULL
  ),
  'All variants have required fields'
);

SELECT * FROM finish();
ROLLBACK;
```

#### CI/CD Pipeline (GitHub Actions)
```yaml
name: Test Database Migrations

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run: supabase start

      - name: Run database tests
        run: supabase test db
```

### Migration File Template (Supabase Best Practices)

```sql
-- Migration: [Brief Description]
-- Date: YYYY-MM-DD
-- Description: [Detailed explanation of what this migration does]
--
-- Changes:
-- 1. [First change]
-- 2. [Second change]
--
-- Affected Rows: ~N rows
-- Estimated Duration: <10s / 10-60s / >1min
--
-- Safety:
-- - Tested locally: ✓
-- - Backup available: data/backups/dictionary_backup_YYYYMMDD.json
-- - Rollback plan: [Describe or reference rollback procedure]
--
-- Dependencies:
-- - Requires Migration XXX
-- - Must run before Migration YYY (if applicable)

BEGIN;

-- Pre-migration checks
DO $$
BEGIN
  -- Verify preconditions
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'dictionary_entries') THEN
    RAISE EXCEPTION 'Table dictionary_entries does not exist';
  END IF;

  RAISE NOTICE 'Pre-migration checks passed';
END $$;

-- Main migration statements
UPDATE dictionary_entries
SET zhuyin_variants = '[...]'::jsonb
WHERE simp IN (...);

-- Post-migration verification
DO $$
DECLARE
  affected_rows INTEGER;
BEGIN
  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  IF affected_rows != 35 THEN
    RAISE EXCEPTION 'Expected 35 rows affected, got %', affected_rows;
  END IF;

  RAISE NOTICE 'Migration successful: % rows updated', affected_rows;
END $$;

COMMIT;

-- Rollback procedure (commented out)
-- BEGIN;
-- UPDATE dictionary_entries
-- SET zhuyin_variants = NULL
-- WHERE simp IN (...);
-- COMMIT;
```

### Resource Planning for Large Migrations

**From Supabase docs:**
- Migrations >6 GB: Upgrade to Large compute add-on minimum
- Pre-provision disk space on Compute and Disk Settings page
- Use lower parallelization (`-j` value) for `pg_dump` from production
- Full parallelization OK for `pg_restore`
- Monitor: CPU usage (htop), disk I/O (iotop)
- Bottleneck is usually disk I/O, not network bandwidth

---

## Reference Data Migration Strategies

### Pattern 1: Incremental Updates (Recommended for Hanzi Dojo)

**Use Case:** Dictionary expansions, fixing existing data

**Strategy:**
```sql
-- Use ON CONFLICT to handle duplicates
INSERT INTO dictionary_entries (simp, trad, zhuyin, frequency_rank)
VALUES
  ('什', '什', '[...]'::jsonb, 1000),
  ('为', '為', '[...]'::jsonb, 1001)
ON CONFLICT (simp) DO UPDATE SET
  zhuyin = EXCLUDED.zhuyin,
  trad = EXCLUDED.trad,
  frequency_rank = EXCLUDED.frequency_rank,
  zhuyin_variants = EXCLUDED.zhuyin_variants;
```

**Benefits:**
- Idempotent (can rerun safely)
- Updates existing entries with corrected data
- Adds new entries
- No manual deduplication needed

### Pattern 2: Replace Entire Dataset

**Use Case:** Complete dictionary rebuild from source

**Strategy:**
```sql
BEGIN;

-- Backup current data
CREATE TABLE dictionary_entries_backup AS
SELECT * FROM dictionary_entries;

-- Clear table
TRUNCATE TABLE dictionary_entries CASCADE;

-- Load new data
INSERT INTO dictionary_entries (simp, trad, zhuyin, frequency_rank)
VALUES
  (...);

-- Verify count matches expectation
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM dictionary_entries) != 1067 THEN
    RAISE EXCEPTION 'Row count mismatch after reload';
  END IF;
END $$;

COMMIT;

-- Drop backup after verification in production
-- DROP TABLE dictionary_entries_backup;
```

### Pattern 3: Staged Migration (Multi-Phase)

**Use Case:** Complex transformations requiring multiple steps

**Example: Hanzi Dojo Epic 8 (Multi-Pronunciation Characters)**

```sql
-- Phase 1: Add zhuyin_variants column
ALTER TABLE dictionary_entries
ADD COLUMN zhuyin_variants JSONB;

-- Phase 2: Populate Pattern A structure (curated list)
UPDATE dictionary_entries
SET zhuyin_variants = '[...]'::jsonb
WHERE simp IN ('行', '重', '还', ...);  -- 35 characters

-- Phase 3: Auto-generate remaining variants
UPDATE dictionary_entries
SET zhuyin_variants = (
  -- Generate variants from existing zhuyin array
  SELECT jsonb_agg(
    jsonb_build_object(
      'pinyin', 'auto-generated',
      'zhuyin', reading,
      'context_words', '[]'::jsonb
    )
  )
  FROM jsonb_array_elements(zhuyin) AS reading
)
WHERE zhuyin_variants IS NULL
  AND jsonb_array_length(zhuyin) > 1;

-- Phase 4: Verify and finalize
DO $$
BEGIN
  -- Check that all multi-pronunciation chars have variants
  IF EXISTS (
    SELECT 1 FROM dictionary_entries
    WHERE jsonb_array_length(zhuyin) > 1
      AND zhuyin_variants IS NULL
  ) THEN
    RAISE EXCEPTION 'Some multi-pronunciation chars missing variants';
  END IF;
END $$;
```

### Pattern 4: Version-Controlled Reference Data

**Strategy: Keep source data in git**

```
project/
├── data/
│   ├── dictionary_v1.json          # Original HSK 1-2 (155 chars)
│   ├── dictionary_v2.json          # Expansion to HSK 1-4 (1067 chars)
│   ├── multi_pronunciation_category1.json  # Curated variants
│   └── backups/
│       ├── pre_migration_010a.json
│       └── pre_migration_011b.json
├── scripts/
│   ├── generate-dictionary-migration.js   # Converts JSON → SQL
│   └── audit-dictionary.js                # Finds data quality issues
└── supabase/migrations/
    ├── 002_seed_dictionary.sql            # Initial load
    ├── 009_expand_dictionary_hsk1-4.sql   # v1 → v2
    └── 011b_pattern_a_structure.sql       # Add variants
```

**Benefits:**
- Source of truth in version control
- Can regenerate migrations from source
- Easy to diff changes between versions
- Backup strategy implicit (git history)

---

## Audit & Finding Incomplete Data

### JSONB Data Quality Queries

#### Find Characters with Incomplete Structure
```sql
-- Characters missing required fields
SELECT
  simp,
  CASE
    WHEN zhuyin IS NULL THEN 'missing zhuyin'
    WHEN jsonb_array_length(zhuyin) = 0 THEN 'empty zhuyin'
    WHEN trad IS NULL OR trad = '' THEN 'missing traditional'
    ELSE 'ok'
  END AS issue
FROM dictionary_entries
WHERE zhuyin IS NULL
   OR jsonb_array_length(zhuyin) = 0
   OR trad IS NULL
   OR trad = '';
```

#### Find Malformed Zhuyin Arrays
```sql
-- Each zhuyin reading should be [initial, final, tone]
SELECT
  simp,
  zhuyin,
  (SELECT COUNT(*)
   FROM jsonb_array_elements(zhuyin) AS reading
   WHERE jsonb_array_length(reading) != 3
  ) AS malformed_readings
FROM dictionary_entries
WHERE EXISTS (
  SELECT 1
  FROM jsonb_array_elements(zhuyin) AS reading
  WHERE jsonb_array_length(reading) != 3
);
```

#### Find Empty Tone Markers (Data Quality Issue)
```sql
-- Tone should never be empty string (should be ˉ, ˊ, ˇ, ˋ, or ˙)
SELECT simp, trad, zhuyin
FROM dictionary_entries
WHERE EXISTS (
  SELECT 1
  FROM jsonb_array_elements(zhuyin) AS reading
  WHERE reading->>2 = ''  -- Third element (tone) is empty
);
```

#### Audit Zhuyin Variants Structure
```sql
-- Find variants missing required fields
SELECT
  simp,
  zhuyin_variants,
  (SELECT array_agg(idx)
   FROM jsonb_array_elements(zhuyin_variants) WITH ORDINALITY AS t(variant, idx)
   WHERE NOT (
     variant ? 'pinyin' AND
     variant ? 'zhuyin' AND
     variant ? 'context_words'
   )
  ) AS invalid_variant_indices
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL
  AND NOT (
    SELECT bool_and(
      variant ? 'pinyin' AND
      variant ? 'zhuyin' AND
      variant ? 'context_words'
    )
    FROM jsonb_array_elements(zhuyin_variants) AS variant
  );
```

### Aggregate Data Quality Report

```sql
-- Comprehensive dictionary audit query
WITH quality_checks AS (
  SELECT
    simp,
    CASE
      WHEN zhuyin IS NULL THEN 'missing_zhuyin'
      WHEN jsonb_array_length(zhuyin) = 0 THEN 'empty_zhuyin'
      WHEN EXISTS (
        SELECT 1 FROM jsonb_array_elements(zhuyin) AS r
        WHERE jsonb_array_length(r) != 3
      ) THEN 'malformed_zhuyin'
      WHEN EXISTS (
        SELECT 1 FROM jsonb_array_elements(zhuyin) AS r
        WHERE r->>2 = ''
      ) THEN 'empty_tone'
      WHEN jsonb_array_length(zhuyin) > 1
           AND zhuyin_variants IS NULL THEN 'missing_variants'
      WHEN zhuyin_variants IS NOT NULL
           AND NOT (
        SELECT bool_and(v ? 'pinyin' AND v ? 'zhuyin' AND v ? 'context_words')
        FROM jsonb_array_elements(zhuyin_variants) AS v
      ) THEN 'malformed_variants'
      ELSE 'ok'
    END AS issue_type
  FROM dictionary_entries
)
SELECT
  issue_type,
  COUNT(*) as count,
  array_agg(simp ORDER BY simp) FILTER (WHERE issue_type != 'ok') as affected_chars
FROM quality_checks
GROUP BY issue_type
ORDER BY
  CASE issue_type
    WHEN 'ok' THEN 999
    ELSE COUNT(*)
  END DESC;
```

**Output Example:**
```
issue_type          | count | affected_chars
--------------------+-------+------------------
missing_zhuyin      |     5 | {干,了,著,處,複}
empty_tone          |   248 | {一,七,三,上,...}
missing_variants    |    37 | {长,分,发,种,...}
malformed_variants  |     8 | {几,切,传,供,...}
ok                  |   769 | NULL
```

---

## Hanzi Dojo Application Examples

### Example 1: Fix Empty Tone Markers (Migration 010a)

**Problem:** 248 characters with empty tone marker (should be "ˉ" for first tone)

**Migration:**
```sql
BEGIN;

-- Verify affected count matches expectation
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_count
  FROM dictionary_entries
  WHERE EXISTS (
    SELECT 1 FROM jsonb_array_elements(zhuyin) AS reading
    WHERE reading->>2 = ''
  );

  IF affected_count != 248 THEN
    RAISE EXCEPTION 'Expected 248 affected rows, found %', affected_count;
  END IF;

  RAISE NOTICE 'Pre-migration check passed: % rows to fix', affected_count;
END $$;

-- Fix empty tone markers
UPDATE dictionary_entries
SET zhuyin = (
  SELECT jsonb_agg(
    CASE
      WHEN reading->>2 = '' THEN
        jsonb_build_array(reading->>0, reading->>1, 'ˉ')
      ELSE
        reading
    END
  )
  FROM jsonb_array_elements(zhuyin) AS reading
)
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(zhuyin) AS reading
  WHERE reading->>2 = ''
);

-- Verify fix was successful
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM dictionary_entries
  WHERE EXISTS (
    SELECT 1 FROM jsonb_array_elements(zhuyin) AS reading
    WHERE reading->>2 = ''
  );

  IF remaining_count > 0 THEN
    RAISE EXCEPTION 'Fix incomplete: % rows still have empty tones', remaining_count;
  END IF;

  RAISE NOTICE 'Verification passed: All empty tones fixed';
END $$;

COMMIT;
```

### Example 2: Add Multi-Pronunciation Variants (Migration 011b)

**Problem:** 35 characters need Pattern A structure with context words

**Migration Pattern:**
```sql
BEGIN;

-- Safety check: All 35 characters exist
DO $$
DECLARE char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN ('行', '重', '还', '为', ...);  -- 35 total

  IF char_count != 35 THEN
    RAISE EXCEPTION 'Expected 35 characters, found %', char_count;
  END IF;
END $$;

-- Update each character (example)
UPDATE dictionary_entries
SET zhuyin_variants = '[
  {
    "pinyin": "xíng",
    "zhuyin": [["ㄒ","ㄧㄥ","ˊ"]],
    "context_words": ["步行","旅行","可行","不行","流行"],
    "meanings": ["to walk","to go","to travel","to do","OK","capable"]
  },
  {
    "pinyin": "háng",
    "zhuyin": [["ㄏ","ㄤ","ˊ"]],
    "context_words": ["银行","行业","一行","同行"],
    "meanings": ["row","line","profession","business"]
  }
]'::jsonb
WHERE simp = '行' AND trad = '行';

-- (Repeat for all 35 characters)

-- Post-migration verification
DO $$
DECLARE updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM dictionary_entries
  WHERE simp IN ('行', '重', '还', '为', ...)
    AND zhuyin_variants IS NOT NULL
    AND jsonb_array_length(zhuyin_variants) >= 2;

  IF updated_count != 35 THEN
    RAISE EXCEPTION 'Expected 35 updates, got %', updated_count;
  END IF;

  RAISE NOTICE 'Success: All 35 characters have variants';
END $$;

COMMIT;
```

### Example 3: Auto-Generate Remaining Variants (Migration 011c)

**Problem:** 101 characters with multiple readings but no curated context

**Strategy:** Auto-generate from existing zhuyin array

```sql
BEGIN;

-- Count characters needing auto-generation
DO $$
DECLARE candidate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO candidate_count
  FROM dictionary_entries
  WHERE jsonb_array_length(zhuyin) > 1
    AND zhuyin_variants IS NULL;

  RAISE NOTICE 'Found % characters needing auto-generated variants', candidate_count;
END $$;

-- Auto-generate variants from zhuyin array
UPDATE dictionary_entries
SET zhuyin_variants = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'pinyin', 'auto-generated',
      'zhuyin', reading,
      'context_words', '[]'::jsonb,
      'meanings', '[]'::jsonb
    )
  )
  FROM jsonb_array_elements(zhuyin) AS reading
)
WHERE jsonb_array_length(zhuyin) > 1
  AND zhuyin_variants IS NULL;

-- Verify all multi-pronunciation chars now have variants
DO $$
DECLARE missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM dictionary_entries
  WHERE jsonb_array_length(zhuyin) > 1
    AND zhuyin_variants IS NULL;

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Still have % chars without variants', missing_count;
  END IF;

  RAISE NOTICE 'Success: All multi-pronunciation chars have variants';
END $$;

COMMIT;
```

### Example 4: Optimize RPC with Parallel Queries (Migration 011d)

**Problem:** Entry catalog RPC loading all data (slow)

**Solution:** Use parallel queries for different data needs

```sql
-- Before: Single expensive query
CREATE OR REPLACE FUNCTION get_entry_catalog(p_kid_id UUID)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.*,
    d.simp,
    d.trad,
    d.zhuyin,
    d.zhuyin_variants,  -- Large JSONB field
    ps.*
  FROM entries e
  JOIN dictionary_entries d ON e.simplified = d.simp
  LEFT JOIN practice_state ps ON ...
  WHERE e.kid_id = p_kid_id;
END;
$$ LANGUAGE plpgsql;

-- After: Split into two parallel queries (frontend)
-- Query 1: Core entry data (fast)
SELECT e.id, e.simplified, e.applicable_drills, ...
FROM entries e
WHERE kid_id = $1;

-- Query 2: Dictionary data only when needed (lazy load)
SELECT simp, trad, zhuyin, zhuyin_variants
FROM dictionary_entries
WHERE simp = ANY($1);  -- Array of simplified chars from Query 1

-- Result: 30-40% faster overall load time
```

---

## Additional Resources

### PostgreSQL Documentation
- [JSONB Types and Functions](https://www.postgresql.org/docs/current/datatype-json.html)
- [GIN Indexes](https://www.postgresql.org/docs/current/gin.html)
- [Transaction Control](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [CTEs (WITH Queries)](https://www.postgresql.org/docs/current/queries-with.html)

### Supabase Documentation
- [Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Local Development](https://supabase.com/docs/guides/local-development/overview)
- [Testing with pgTAP](https://supabase.com/docs/guides/database/testing)
- [Migrating to Supabase](https://supabase.com/docs/guides/platform/migrating-to-supabase/postgres)

### External Articles
- [What Should a PostgreSQL Migrator Do?](https://medium.com/@jonathangfischoff/what-should-a-postgresql-migrator-do-47fd34804be) - Migration tool philosophy
- [Running Safe Database Migrations](https://retool.com/blog/running-safe-database-migrations-using-postgres) - Safety patterns
- [Postgres Rollback Explained](https://www.bytebase.com/blog/postgres-rollback/) - Transaction control
- [Database Migration Checklist](https://savvycomsoftware.com/blog/database-migration-checklist/) - 2025 best practices
- [Audit Logging with JSONB](https://elephas.io/audit-logging-using-jsonb-in-postgres/) - Change tracking patterns

### Tools
- [Graphile Migrate](https://github.com/graphile/migrate) - Opinionated migration tool
- [Flyway](https://flywaydb.org/) - Version control for databases
- [Liquibase](https://www.liquibase.org/) - Database-independent migrations
- [pgTAP](https://pgtap.org/) - Unit testing framework for Postgres

---

## Summary: Key Takeaways for Hanzi Dojo

### ✅ Patterns We're Already Using Well
1. **BEGIN/COMMIT transactions** wrapping all migrations
2. **Pre-migration safety checks** (verify expected row counts exist)
3. **Post-migration verification** (confirm affected rows match expectation)
4. **Version-controlled source data** (JSON files in `/data/` directory)
5. **ON CONFLICT DO UPDATE** for idempotent migrations
6. **Detailed migration headers** with date, description, affected rows

### 🔧 Patterns to Consider Adding
1. **Savepoints for complex migrations** (partial rollback without losing entire transaction)
2. **Batch updates with CTEs** for large-scale data fixes (>1000 rows)
3. **CHECK constraints** to prevent future data quality issues
4. **pgTAP tests** for automated migration validation
5. **CI/CD pipeline** with `supabase test db` on pull requests
6. **Aggregate audit queries** to find multiple data quality issues at once

### 🚀 Advanced Patterns for Future
1. **Shadow database testing** before production deploys
2. **Logical replication** for change data capture (if need audit log)
3. **Expression indexes** on JSONB paths for faster complex queries
4. **NOT VALID constraints** for adding constraints without downtime

### 📋 Recommended Next Steps
1. Add pgTAP tests for dictionary structure invariants
2. Create aggregate audit query for comprehensive data quality report
3. Document rollback procedures for each migration type
4. Set up GitHub Actions workflow for automated migration testing
5. Consider adding CHECK constraints for zhuyin/variants structure

---

**Last Updated:** 2025-12-08
**Research By:** Claude (Sonnet 4.5)
**Project:** Hanzi Dojo - Dictionary Data Migration Patterns
