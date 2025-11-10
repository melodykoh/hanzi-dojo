# Dictionary Migration Guide

This guide documents best practices and lessons learned from dictionary data migrations to prevent common pitfalls.

## Database Safety Protocol

**ALWAYS follow this protocol for production dictionary migrations:**

### 1. READ-ONLY Analysis First
```sql
-- Check for potential conflicts
SELECT simp, trad, COUNT(*)
FROM dictionary_entries
WHERE simp IN ('sample', 'characters')
GROUP BY simp, trad;

-- Check current dictionary size
SELECT COUNT(*) FROM dictionary_entries;
```

### 2. Backup Strategy
- Dictionary is reference data (not user data)
- Keep source JSON files in `/data/` directory versioned in git
- Can be regenerated from HSK source data if needed
- For critical migrations: export current dictionary before applying

### 3. Test Migration Locally First
- Generate migration file
- Review SQL syntax
- Check for duplicates in source data
- Validate JSONB structure

### 4. Apply Migration
- Use Supabase Dashboard SQL Editor for production
- Monitor execution time and errors
- Verify results with COUNT and sample queries

## Common Issues and Solutions

### Issue 1: Duplicate Key Violations

**Error:** `duplicate key value violates unique constraint "dictionary_entries_simp_unique"`

**Cause:** Trying to INSERT a character that already exists

**Solution:** Use `ON CONFLICT DO UPDATE` instead of `ON CONFLICT DO NOTHING`
```sql
INSERT INTO dictionary_entries (simp, trad, zhuyin, frequency_rank) VALUES
  (...)
ON CONFLICT (simp) DO UPDATE SET
  zhuyin = EXCLUDED.zhuyin,
  trad = EXCLUDED.trad,
  frequency_rank = EXCLUDED.frequency_rank;
```

**Why UPDATE instead of NOTHING:** This allows re-running migrations to fix data issues (e.g., adding missing pronunciations to existing entries).

### Issue 2: "Cannot affect row a second time"

**Error:** `ON CONFLICT DO UPDATE command cannot affect row a second time`

**Cause:** Migration file contains duplicate entries for the same simplified character

**Root Cause:** Data generation script didn't deduplicate properly

**Solution:** Add final deduplication step by simplified character
```javascript
// In generation script, AFTER converting all entries:
const finalMap = new Map();

entries.forEach(entry => {
  if (finalMap.has(entry.simp)) {
    // Merge with existing entry
    const existing = finalMap.get(entry.simp);

    // Combine zhuyin readings (deduplicate)
    const zhuyinSet = new Set(
      [...existing.zhuyin, ...entry.zhuyin].map(z => JSON.stringify(z))
    );
    existing.zhuyin = Array.from(zhuyinSet).map(z => JSON.parse(z));

    // Take lower HSK level
    existing.hsk_level = Math.min(existing.hsk_level, entry.hsk_level);
  } else {
    finalMap.set(entry.simp, entry);
  }
});

const dedupedEntries = Array.from(finalMap.values());
```

**Verification:**
```javascript
// Always verify before generating migration
const seen = new Set();
const duplicates = [];
entries.forEach(e => {
  if (seen.has(e.simp)) duplicates.push(e.simp);
  seen.add(e.simp);
});
console.log('Duplicates:', duplicates.length); // Should be 0
```

### Issue 3: Incomplete Multi-Pronunciation Data

**Problem:** Characters with multiple readings (多音字) only getting first pronunciation

**Example:** 什 should have both shí (ㄕˊ) AND shén (ㄕㄣˊ), but only shí was captured

**Root Cause:** Script only converting first pinyin reading to zhuyin

**Solution:** Convert ALL pinyin readings
```javascript
// BAD - Only converts first reading:
const primaryPinyin = char.pinyin[0];
const zhuyinStr = pinyinToZhuyin(primaryPinyin);
const zhuyinParts = parseZhuyin(zhuyinStr);
return { ...char, zhuyin: [zhuyinParts] };

// GOOD - Converts all readings:
const zhuyinReadings = [];
for (const pinyinReading of char.pinyin) {
  const zhuyinStr = pinyinToZhuyin(pinyinReading);
  const zhuyinParts = parseZhuyin(zhuyinStr);
  zhuyinReadings.push(zhuyinParts);
}
return { ...char, zhuyin: zhuyinReadings };
```

**Verification:**
```javascript
// Check multi-pronunciation characters
const multiChars = entries.filter(e => e.zhuyin.length > 1);
console.log(`Multi-pronunciation chars: ${multiChars.length}`);
console.log('Samples:', multiChars.slice(0, 5).map(e =>
  `${e.simp}: ${e.zhuyin.map(z => z.join('')).join(', ')}`
));
```

## Data Generation Best Practices

### 1. Use Character-Level Pinyin Extraction

**Bad:** Extracting pinyin from word-level data (what syllable maps to which character?)
```javascript
// Word: 什么, Pinyin: shénme
// How do we know 什=shén and 么=me? Guesswork!
```

**Good:** Use pinyin library with heteronym support
```javascript
import pinyinModule from 'pinyin';
const pinyin = pinyinModule.default || pinyinModule.pinyin;

const charPinyin = pinyin('什', {
  style: pinyin.STYLE_TONE,
  heteronym: true  // Get ALL pronunciations
});
// Result: [ [ 'shí', 'shén' ] ]
```

### 2. Always Deduplicate at Multiple Stages

1. **During collection:** Use Map with `simp|trad` key
2. **After conversion:** Deduplicate by simplified character only
3. **Before migration:** Verify zero duplicates

### 3. Validate Generated Data

**Before generating migration, always check:**
```bash
# Check for duplicates
node -e "
const data = JSON.parse(require('fs').readFileSync('./data/dictionary_expansion_v2.json', 'utf-8'));
const seen = new Set();
const dups = data.entries.filter(e => seen.has(e.simp) || !seen.add(e.simp));
console.log('Duplicates:', dups.length);
"

# Check multi-pronunciation coverage
node -e "
const data = JSON.parse(require('fs').readFileSync('./data/dictionary_expansion_v2.json', 'utf-8'));
const multi = data.entries.filter(e => e.zhuyin.length > 1);
console.log('Multi-pronunciation:', multi.length);
console.log('Samples:', multi.slice(0, 5).map(e => e.simp + ': ' + e.pinyin));
"

# Check specific important characters
node -e "
const data = JSON.parse(require('fs').readFileSync('./data/dictionary_expansion_v2.json', 'utf-8'));
['什', '为', '了', '着'].forEach(c => {
  const entry = data.entries.find(e => e.simp === c);
  if (entry) {
    console.log(c + ':', entry.zhuyin.length, 'readings -', entry.pinyin);
  } else {
    console.log(c + ': NOT FOUND');
  }
});
"
```

## Migration File Template

```sql
-- Dictionary Expansion Migration
-- Adds N HSK X-Y characters to production dictionary
-- Generated: YYYY-MM-DD
-- Source: [describe source data]
-- Note: Uses ON CONFLICT DO UPDATE to handle duplicates and update pronunciations

INSERT INTO dictionary_entries (simp, trad, zhuyin, frequency_rank) VALUES
  ('char1', 'char1', '[["initial","final","tone"]]'::jsonb, 1000),
  ('char2', 'char2', '[["i","f","t"],["i2","f2","t2"]]'::jsonb, 1001)
ON CONFLICT (simp) DO UPDATE SET
  zhuyin = EXCLUDED.zhuyin,
  trad = EXCLUDED.trad,
  frequency_rank = EXCLUDED.frequency_rank;

-- Migration complete
-- Total characters added/updated: N
-- Dictionary size after migration: ~TOTAL characters
-- Note: Existing entries updated with complete multi-pronunciation data
```

## Lessons Learned (Session 7, 2025-11-09)

### Character Extraction from HSK Word Lists

**Challenge:** HSK provides word-level vocabulary (e.g., 什么), not character-level pinyin

**Initial Approach (Failed):**
- Parse word pinyin by syllable count
- Map syllables to characters positionally
- **Problem:** Multi-character words have ambiguous mappings

**Working Approach:**
- Use `pinyin` npm package for character-level conversion
- Extract each character individually from words
- Use `heteronym: true` to capture all pronunciations
- Deduplicate and merge readings across all word contexts

### Deduplication Complexity

**Why duplicates occurred:**
1. Same character appears in multiple HSK levels (为 in HSK 1, 2, 3)
2. Same character has variant traditional forms in different contexts
3. Initial key was `simp|trad` (too granular)

**Solution hierarchy:**
1. Primary deduplication: `simp|trad` key during collection
2. Final deduplication: `simp` only before output
3. Merge strategy: Combine all readings, take lowest HSK level

### Multi-Pronunciation Characters (多音字)

**Critical for Chinese learning:**
- Common characters: 什 (shí/shén), 为 (wéi/wèi), 了 (le/liǎo), 着 (zhe/zháo/zhuó)
- Must capture ALL readings for drill correctness
- User selects appropriate reading during "Add Item" based on context

**Implementation:**
- Store as array: `[["ㄕ","","ˊ"],["ㄕ","ㄣ","ˊ"]]`
- Loop through ALL pinyin readings during conversion
- Deduplicate zhuyin using JSON.stringify comparison

## Verification Queries After Migration

```sql
-- Check total count
SELECT COUNT(*) FROM dictionary_entries;
-- Expected: ~1067 (155 + 912)

-- Verify specific characters have all pronunciations
SELECT simp, zhuyin FROM dictionary_entries WHERE simp = '什';
-- Expected: [["ㄕ","","ˊ"],["ㄕ","ㄣ","ˊ"]]

SELECT simp, zhuyin FROM dictionary_entries WHERE simp = '为';
-- Expected: [["ㄨ","ㄟ","ˊ"],["ㄨ","ㄟ","ˋ"]]

-- Check for any NULL zhuyin (data quality)
SELECT simp FROM dictionary_entries WHERE zhuyin IS NULL OR zhuyin = '[]'::jsonb;
-- Expected: 0 rows

-- Check distribution by HSK level (if tracking)
SELECT
  jsonb_array_length(zhuyin) as reading_count,
  COUNT(*) as char_count
FROM dictionary_entries
GROUP BY reading_count
ORDER BY reading_count;
-- Shows: how many chars have 1, 2, 3+ pronunciations
```

## Future Improvements

1. **Automated validation:** Add pre-migration checks to CI/CD
2. **Rollback strategy:** Document how to revert if migration fails
3. **Incremental updates:** Support adding only new characters without re-processing existing
4. **Pronunciation context:** Store which words use which reading (for better drill generation)
5. **Frequency data:** Enhance with actual usage frequency, not just HSK rank
