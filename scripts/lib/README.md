# Script Library Utilities

Shared utility functions for migration generation and data processing.

## Modules

### validation.cjs

JSONB structure validation for dictionary entries before database insertion.

**Prevents:**
- Empty or missing `pinyin` strings
- Non-array `zhuyin` structures
- Empty `zhuyin` arrays
- TODO placeholders in `zhuyin` data
- Non-array `context_words` fields

**Usage:**
```javascript
const { validateVariants } = require('./lib/validation.cjs');

const variants = [
  { pinyin: 'zhāo', zhuyin: ['ㄓ', 'ㄠ'], context_words: ['朝阳'] }
];

// Throws descriptive error if validation fails
validateVariants(variants, '朝');

// Safe to use after validation
const json = JSON.stringify(variants);
```

**Testing:**
```bash
node scripts/lib/validation.test.cjs
```

### sqlUtils.cjs

SQL utility functions for safe string escaping.

**Functions:**
- `escapeSql(str)` - Escapes single quotes for SQL string literals

### pinyinToZhuyinMapping.cjs

Converts pinyin to zhuyin (Bopomofo) notation.

**Functions:**
- `pinyinToZhuyinArray(pinyin)` - Returns array of zhuyin characters

### dictionaryLoader.cjs

Loads and indexes dictionary data files.

**Functions:**
- `loadDictionaries()` - Loads v1 and v2 dictionary JSON files
- `buildCharacterLookup(v1, v2)` - Creates character→entry lookup map

## Integration

All migration generators (`generate-migration-*.cjs`) use these utilities:

1. Load data with `dictionaryLoader.cjs`
2. Convert pinyin with `pinyinToZhuyinMapping.cjs`
3. **Validate with `validation.cjs`** (prevents malformed JSONB)
4. Escape SQL with `sqlUtils.cjs`
5. Generate migration file

## Error Examples

```javascript
// ✗ Empty pinyin
{ pinyin: '', zhuyin: ['ㄓ'], context_words: [] }
// → "Invalid pinyin for 朝: expected non-empty string"

// ✗ String zhuyin (should be array)
{ pinyin: 'zhāo', zhuyin: 'ㄓㄠ', context_words: [] }
// → "Invalid zhuyin structure for 朝: expected array, got string"

// ✗ TODO placeholder
{ pinyin: 'zhāo', zhuyin: ['TODO'], context_words: [] }
// → "Incomplete zhuyin for 朝 (zhāo): contains TODO placeholder"

// ✗ Non-array context_words
{ pinyin: 'zhāo', zhuyin: ['ㄓ'], context_words: null }
// → "context_words must be array for 朝: got object"
```

## Adding New Utilities

1. Create `scripts/lib/yourModule.cjs`
2. Export functions with `module.exports = { ... }`
3. Add tests in `scripts/lib/yourModule.test.cjs`
4. Document in this README
5. Import in migration generators as needed
