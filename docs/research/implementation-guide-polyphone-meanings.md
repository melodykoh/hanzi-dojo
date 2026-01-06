# Implementation Guide: Fix Polyphone Meanings in Database
**Date:** 2025-12-09
**Goal:** Update `dictionary_v3` table to differentiate meanings for multi-pronunciation characters

---

## Problem Statement

Currently, all pronunciation variants in `zhuyin_variants` have identical meanings (copied from the default pronunciation). This is incorrect for polyphones where different pronunciations have different meanings.

**Example of Current Bug:**
```json
{
  "simplified": "好",
  "zhuyin_variants": [
    {
      "zhuyin": "ㄏㄠˇ",
      "context": ["很好", "好人"],
      "meanings": ["good", "well", "proper", "good to", "easy to", "very", "so"]
    },
    {
      "zhuyin": "ㄏㄠˋ",
      "context": ["爱好", "好奇"],
      "meanings": ["good", "well", "proper", "good to", "easy to", "very", "so"]
      // ❌ WRONG: Should be ["be fond of", "to like"]
    }
  ]
}
```

---

## Solution Overview

**Use CC-CEDICT to fetch pronunciation-specific meanings**

CC-CEDICT stores separate entries for each pronunciation:
```
好 好 [hao3] /good/well/
好 好 [hao4] /be fond of/
```

**Implementation Steps:**
1. Install `node-cc-cedict` npm package
2. Create Zhuyin → Pinyin converter
3. Query database for all multi-pronunciation characters
4. For each variant, fetch meanings from CC-CEDICT
5. Generate SQL migration to update database

---

## Step 1: Install Dependencies

```bash
cd /path/to/hanzi-dojo
npm install node-cc-cedict
npm install pinyin-utils  # For Zhuyin → Pinyin conversion
```

**Alternative Zhuyin libraries:**
- `zhuyin` - https://www.npmjs.com/package/zhuyin
- `pinyin-converter` - Custom mapping table

---

## Step 2: Create Zhuyin → Pinyin Converter

```javascript
/**
 * Convert Zhuyin to Pinyin with tone numbers
 * Input: ㄏㄠˇ
 * Output: hao3
 */
function zhuyinToPinyin(zhuyin) {
  // Option 1: Use library
  const pinyin = require('pinyin-utils');
  return pinyin.zhuyinToPinyin(zhuyin);

  // Option 2: Custom mapping (if library doesn't work)
  const mapping = {
    'ㄏㄠˇ': 'hao3',
    'ㄏㄠˋ': 'hao4',
    'ㄔㄤˊ': 'chang2',
    'ㄓㄤˇ': 'zhang3',
    // ... complete mapping needed
  };
  return mapping[zhuyin];
}

/**
 * Normalize pinyin for comparison
 * Handles variations: hao3 = hǎo = HAO3
 */
function normalizePinyin(pinyin) {
  return pinyin
    .toLowerCase()
    .replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, function(match) {
      // Convert tone marks to numbers
      const toneMap = {
        'ā': 'a1', 'á': 'a2', 'ǎ': 'a3', 'à': 'a4',
        'ē': 'e1', 'é': 'e2', 'ě': 'e3', 'è': 'e4',
        'ī': 'i1', 'í': 'i2', 'ǐ': 'i3', 'ì': 'i4',
        'ō': 'o1', 'ó': 'o2', 'ǒ': 'o3', 'ò': 'o4',
        'ū': 'u1', 'ú': 'u2', 'ǔ': 'u3', 'ù': 'u4',
        'ǖ': 'v1', 'ǘ': 'v2', 'ǚ': 'v3', 'ǜ': 'v4',
        'ü': 'v'
      };
      return toneMap[match] || match;
    })
    .trim();
}
```

---

## Step 3: Create Data Extraction Script

**File:** `scripts/extract-polyphone-meanings.js`

```javascript
const cedict = require('node-cc-cedict');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to promisify CC-CEDICT search
function searchCEDICT(char) {
  return new Promise((resolve) => {
    cedict.searchByChinese(char, (entries) => {
      resolve(entries);
    });
  });
}

// Main extraction function
async function extractPolyphoneMeanings() {
  console.log('Fetching multi-pronunciation characters from database...\n');

  // 1. Query database for characters with zhuyin_variants
  const { data: characters, error } = await supabase
    .from('dictionary_v3')
    .select('*')
    .not('zhuyin_variants', 'is', null);

  if (error) {
    console.error('Database error:', error);
    return;
  }

  console.log(`Found ${characters.length} multi-pronunciation characters\n`);

  const results = [];

  // 2. Process each character
  for (const char of characters) {
    console.log(`Processing: ${char.simplified} (${char.traditional})`);

    // Fetch all CC-CEDICT entries for this character
    const cedictEntries = await searchCEDICT(char.simplified);

    if (cedictEntries.length === 0) {
      console.log(`  ⚠️  Not found in CC-CEDICT\n`);
      results.push({
        character: char.simplified,
        status: 'not_found',
        variants: char.zhuyin_variants
      });
      continue;
    }

    console.log(`  Found ${cedictEntries.length} CC-CEDICT entries`);

    // 3. Match each variant to CC-CEDICT entry
    const updatedVariants = [];

    for (const variant of char.zhuyin_variants) {
      const pinyin = zhuyinToPinyin(variant.zhuyin);

      if (!pinyin) {
        console.log(`  ⚠️  Could not convert Zhuyin: ${variant.zhuyin}`);
        updatedVariants.push(variant); // Keep original
        continue;
      }

      // Find matching CC-CEDICT entry
      const match = cedictEntries.find(entry =>
        normalizePinyin(entry.pinyin) === normalizePinyin(pinyin)
      );

      if (match) {
        // Extract meanings
        const meanings = match.english
          .split('/')
          .filter(m => m.trim().length > 0)
          .map(m => m.trim());

        console.log(`  ✓ [${variant.zhuyin}] → [${pinyin}] = ${meanings.slice(0, 3).join(', ')}...`);

        updatedVariants.push({
          ...variant,
          meanings: meanings,
          _matched_pinyin: pinyin,
          _raw_cedict: match.english
        });
      } else {
        console.log(`  ⚠️  No match for pinyin: ${pinyin}`);
        updatedVariants.push(variant);
      }
    }

    console.log('');

    results.push({
      character: char.simplified,
      traditional: char.traditional,
      id: char.id,
      status: 'updated',
      original_variants: char.zhuyin_variants,
      updated_variants: updatedVariants
    });
  }

  // 4. Save results to file
  fs.writeFileSync(
    'polyphone-meanings-extracted.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n✓ Extraction complete!');
  console.log(`Results saved to: polyphone-meanings-extracted.json`);

  // 5. Generate summary
  const summary = {
    total: results.length,
    updated: results.filter(r => r.status === 'updated').length,
    not_found: results.filter(r => r.status === 'not_found').length
  };

  console.log('\nSummary:');
  console.log(`  Total characters: ${summary.total}`);
  console.log(`  Successfully updated: ${summary.updated}`);
  console.log(`  Not found in CC-CEDICT: ${summary.not_found}`);

  return results;
}

// Run extraction
extractPolyphoneMeanings()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

**Run the script:**
```bash
node scripts/extract-polyphone-meanings.js
```

**Output:** `polyphone-meanings-extracted.json`

---

## Step 4: Generate SQL Migration

**File:** `scripts/generate-polyphone-migration.js`

```javascript
const fs = require('fs');

// Read extracted data
const data = JSON.parse(fs.readFileSync('polyphone-meanings-extracted.json'));

// Generate SQL UPDATE statements
let sql = `-- Migration: Fix polyphone meanings using CC-CEDICT
-- Generated: ${new Date().toISOString()}
-- Characters updated: ${data.filter(r => r.status === 'updated').length}

BEGIN;

`;

for (const record of data) {
  if (record.status !== 'updated') continue;

  // Escape single quotes in JSON
  const variantsJson = JSON.stringify(record.updated_variants)
    .replace(/'/g, "''");

  sql += `-- ${record.character} (${record.traditional})
UPDATE dictionary_v3
SET zhuyin_variants = '${variantsJson}'::jsonb
WHERE id = ${record.id};

`;
}

sql += `COMMIT;

-- Verify updates
SELECT
  simplified,
  traditional,
  jsonb_array_length(zhuyin_variants) as variant_count,
  zhuyin_variants
FROM dictionary_v3
WHERE zhuyin_variants IS NOT NULL
ORDER BY simplified
LIMIT 10;
`;

// Save migration file
const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
const filename = `supabase/migrations/${timestamp}_fix_polyphone_meanings.sql`;

fs.writeFileSync(filename, sql);

console.log(`✓ Migration generated: ${filename}`);
console.log('\nNext steps:');
console.log('1. Review the migration file');
console.log('2. Test on development database');
console.log('3. Run: supabase db push');
```

**Run the script:**
```bash
node scripts/generate-polyphone-migration.js
```

---

## Step 5: Review and Validate

**Before applying migration:**

1. **Manually review sample characters:**
   ```bash
   cat polyphone-meanings-extracted.json | jq '.[] | select(.character == "好")'
   ```

2. **Check for missing matches:**
   ```bash
   cat polyphone-meanings-extracted.json | jq '.[] | select(.status == "not_found")'
   ```

3. **Validate meanings make sense:**
   - Compare against MDBG online dictionary
   - Check context words align with meanings

---

## Step 6: Apply Migration

**Test on local database first:**
```bash
# Apply migration
supabase db push

# Verify results
psql $DATABASE_URL -c "
  SELECT simplified, zhuyin_variants
  FROM dictionary_v3
  WHERE simplified IN ('好', '长', '行', '乐')
"
```

**Expected output:**
```
 simplified |           zhuyin_variants
------------+-------------------------------------
 好         | [{"zhuyin":"ㄏㄠˇ","meanings":["good","well"],...},
            |  {"zhuyin":"ㄏㄠˋ","meanings":["be fond of"],...}]
```

---

## Step 7: Handle Edge Cases

### Characters Not Found in CC-CEDICT

**Strategy:**
1. Keep existing meanings (don't modify)
2. Log for manual review
3. Consider alternative sources (MDBG scraper, manual entry)

### Pinyin Conversion Issues

**Fallback approach:**
```javascript
// If automatic conversion fails, use manual mapping
const manualMappings = {
  '好': {
    'ㄏㄠˇ': 'hao3',
    'ㄏㄠˋ': 'hao4'
  },
  '长': {
    'ㄔㄤˊ': 'chang2',
    'ㄓㄤˇ': 'zhang3'
  }
  // ... add more as needed
};
```

### Meanings Too Long

**Truncate strategy:**
```javascript
const meanings = match.english
  .split('/')
  .filter(m => m.trim().length > 0)
  .slice(0, 10)  // Limit to 10 most common meanings
  .map(m => m.trim());
```

---

## Complete Script Template

**File:** `scripts/fix-polyphone-meanings-complete.js`

```javascript
#!/usr/bin/env node

const cedict = require('node-cc-cedict');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OUTPUT_JSON = 'polyphone-meanings-extracted.json';
const OUTPUT_SQL = `supabase/migrations/${Date.now()}_fix_polyphone_meanings.sql`;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// [Include all helper functions here: zhuyinToPinyin, normalizePinyin, etc.]

// Main execution
async function main() {
  console.log('🚀 Starting polyphone meanings extraction...\n');

  // Step 1: Extract data
  const results = await extractPolyphoneMeanings();

  // Step 2: Generate migration
  await generateMigration(results);

  console.log('\n✅ Complete! Review files before applying migration.');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

---

## Testing Checklist

Before production:

- [ ] Test extraction script on 5 sample characters
- [ ] Verify Zhuyin → Pinyin conversion accuracy
- [ ] Confirm meanings differ between pronunciations
- [ ] Check edge cases (rare characters, missing entries)
- [ ] Review generated SQL migration
- [ ] Apply to development database
- [ ] Query updated records and verify correctness
- [ ] Test drill generation (ensure distractors work)
- [ ] Backup production database
- [ ] Apply to production with monitoring

---

## Expected Results

**Before Fix:**
```sql
SELECT simplified, zhuyin_variants->>0 as variant1, zhuyin_variants->>1 as variant2
FROM dictionary_v3
WHERE simplified = '好';

-- Both variants have identical meanings ❌
```

**After Fix:**
```sql
-- variant1: {"zhuyin":"ㄏㄠˇ","meanings":["good","well"]}
-- variant2: {"zhuyin":"ㄏㄠˋ","meanings":["be fond of"]}
-- ✓ Meanings are now different and accurate
```

---

## Troubleshooting

### Issue: `node-cc-cedict` not installing

**Solution:** Use alternative package
```bash
npm install parse-cc-cedict
# Download CC-CEDICT file manually
curl -O https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz
gunzip cedict_1_0_ts_utf-8_mdbg.txt.gz
```

### Issue: Zhuyin conversion not working

**Solution:** Create manual mapping table
```javascript
// Export from existing database
const { data } = await supabase.rpc('get_all_pronunciations');
// Build mapping: data.forEach(...)
```

### Issue: Too many meanings per variant

**Solution:** Filter to most common
```javascript
const meanings = match.english
  .split('/')
  .filter(m => !m.includes('(archaic)'))
  .filter(m => !m.includes('(old)'))
  .slice(0, 8);
```

---

## Next Steps After Migration

1. **Update drill builder logic:**
   - Use variant-specific meanings for Drill A distractors
   - Ensure alternate pronunciations excluded from wrong answers

2. **Add meaning display in UI:**
   - Show meanings when parent adds character
   - Display in pronunciation selection modal

3. **Monitor production:**
   - Check drill quality (fewer confusing distractors)
   - User feedback on character meanings

---

## Reference Files

- Main research: `docs/research/cc-cedict-mdbg-api-research.md`
- Code examples: `docs/research/cc-cedict-usage-example.js`
- This guide: `docs/research/implementation-guide-polyphone-meanings.md`

---

**Status:** Ready for implementation
**Estimated effort:** 4-6 hours (including testing)
**Risk level:** Low (read-only query, SQL migration can be reviewed)
