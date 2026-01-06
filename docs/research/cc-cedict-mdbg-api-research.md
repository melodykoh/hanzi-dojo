# CC-CEDICT and MDBG API Research
**Date:** 2025-12-09
**Purpose:** Programmatically fetch differentiated meanings for Chinese polyphones (multi-pronunciation characters)

---

## Executive Summary

### Key Findings
1. **No official MDBG API** - MDBG does not provide a public API for programmatic access
2. **CC-CEDICT uses separate entries** - Characters with multiple pronunciations have distinct dictionary entries (one per pronunciation)
3. **Multiple Node.js libraries available** - At least 7 npm packages provide CC-CEDICT parsing and lookup
4. **Data is freely available** - CC-CEDICT is licensed under Creative Commons BY-SA 4.0
5. **Meanings ARE differentiated** - Each pronunciation has its own English definitions

### Recommended Approach
**Use `node-cc-cedict` npm package** - It's batteries-included with SQLite database, asynchronous API, and automatic traditional/simplified handling.

---

## 1. CC-CEDICT Format Documentation

### Official Sources
- **Wiki/Documentation**: https://cc-cedict.org/wiki/
- **Download Page**: https://www.mdbg.net/chinese/dictionary?page=cedict
- **Format Specification**: http://cc-cedict.org/wiki/format:syntax
- **Latest Release**: 2025-11-18 (124,133 entries)

### Entry Format
```
Traditional Simplified [pin1 yin1] /English meaning 1/meaning 2/.../
```

**Components:**
- Traditional Chinese characters (no spaces)
- Simplified Chinese characters (no spaces)
- Pinyin with tone numbers in brackets (1-5, where 5 = neutral tone)
- English definitions separated by forward slashes

**Example:**
```
漢字 汉字 [han4 zi4] /Chinese character/CL:個|个/
```

### How Multiple Pronunciations Are Handled

**Critical Finding: CC-CEDICT creates SEPARATE ENTRIES for each pronunciation**

Characters with multiple pronunciations (polyphones/多音字) get distinct dictionary entries, each with its own meanings:

#### Example 1: 好 (hǎo / hào)
```
好 好 [hao3] /good/well/
好 好 [hao4] /be fond of/
```

#### Example 2: 長/长 (cháng / zhǎng)
```
長 长 [chang2] /length/long/forever/always/constantly/
長 长 [zhang3] /chief/head/elder/to grow/to develop/
```

#### Example 3: 行 (háng / xíng / xìng)
```
行 行 [hang2] /a row/profession/professional/
行 行 [xing2] /all right/capable/competent/OK/okay/to go/to do/to travel/temporary/to walk/to go/will do/
行 行 [xing4] /behavior/conduct/
```

#### Example 4: 樂/乐 (lè / yuè)
```
樂 乐 [le4] /(surname)/happy/laugh/cheerful/
樂 乐 [yue4] /(surname)/music/
```

### Special Cases

**Taiwan pronunciation variants:**
```
叔叔 叔叔 [shu1 shu5] /(informal) father's younger brother/uncle/Taiwan pr. shu2 shu5/
```
- Taiwan variants are appended with "Taiwan pr." notation
- Does NOT create separate entries for regional variants

**R-ified words (erhua/儿化):**
```
花兒 花儿 [hua1 r5] /flower/
```
- Uses tone 5 when 儿 is attached to preceding syllable

---

## 2. MDBG API/Data Access

### MDBG API Status
**NO PUBLIC API EXISTS**

From research:
> "There is no API for CC-CEDICT integration (neither for submitting edits nor consuming the data). The database export is distributed on a mdbg.net webpage stating that scraping is not allowed."

### Data Access Alternatives

#### Option 1: Direct Download (Recommended for bulk processing)
**Latest Release:** https://www.mdbg.net/chinese/dictionary?page=cedict

**Files Available:**
- `cedict_1_0_ts_utf-8_mdbg.zip` - ZIP archive (124,133 entries)
- `cedict_1_0_ts_utf-8_mdbg.txt.gz` - GZip format

**Licensing:** Creative Commons Attribution-ShareAlike 4.0 International
- ✅ Commercial use allowed
- ✅ Non-commercial use allowed
- ⚠️ Must provide attribution
- ⚠️ Share improvements under same license

#### Option 2: GitHub Mirror (Auto-updated daily)
**Repository:** https://github.com/rhcarvalho/cedict

Features:
- Automatically updated daily (if upstream changes)
- Plain text file: `cedict_1_0_ts_utf8_mdbg.txt`
- Go module available: `github.com/rhcarvalho/cedict`

#### Option 3: Alternative Web API
**Chinese Character Web API:** http://ccdb.hemiola.com/

Features:
- Programmatic character information access
- Uses Unihan Database (Unicode Consortium)
- JSON responses
- CORS enabled for browser access
- Different focus (character metadata vs. dictionary meanings)

---

## 3. Programmatic Access - npm Packages

### Recommended: `node-cc-cedict`

**npm:** https://www.npmjs.com/package/node-cc-cedict
**GitHub:** https://github.com/johnheroy/node-cc-cedict

**Why Choose This:**
- ✅ Batteries-included (SQLite database embedded)
- ✅ Asynchronous JavaScript API
- ✅ Automatic traditional/simplified detection
- ✅ Complete dictionary coverage (all 124k+ entries)

**Installation:**
```bash
npm install node-cc-cedict
```

**Basic Usage:**
```javascript
const cedict = require('node-cc-cedict');

// Search by Chinese characters
cedict.searchByChinese('世界', function(words) {
  console.log(words);
});
```

**Smart Features:**
- Auto-detects traditional vs. simplified
- Defaults to traditional if entire word is traditional
- Otherwise converts to simplified and searches

---

### Alternative: `cedict-lookup`

**npm:** https://www.npmjs.com/package/cedict-lookup
**GitHub:** https://github.com/takumif/cedict-lookup

**Features:**
- Supports both traditional and simplified lookups
- Multiple search methods
- Requires local dictionary file

**Installation:**
```bash
npm install cedict-lookup
```

**Usage:**
```javascript
const cedict = require('cedict-lookup');

// Load dictionary (requires local file)
const dict = cedict.loadTraditional('path/to/cedict_ts.u8');
// OR: const dict = cedict.loadSimplified('path/to/cedict_ts.u8');

// 1. Exact match
const results = dict.getMatch('你好');
// Returns: [ Entry { traditional, simplified, pinyin, english } ]

// 2. Entries starting with prefix
const prefixResults = dict.getEntriesStartingWith('中文');

// 3. Find prefix entries in phrase
const prefixes = dict.getPrefixEntries('小籠包');
// Returns entries for '小' and '小籠包'
```

**Entry Object Structure:**
```javascript
{
  traditional: '你好',
  simplified: '你好',
  pinyin: 'ni3 hao3',
  english: 'Hello!/Hi!/How are you?'
}
```

---

### Other Notable Packages

#### `parse-cc-cedict`
- **npm:** https://www.npmjs.com/package/parse-cc-cedict
- **Purpose:** Raw parser for CC-CEDICT file format
- **Status:** Last published 7 years ago (2.1.0)
- **Use Case:** Building custom dictionary tools

#### `@tykok/cedict-dictionary`
- **npm:** https://www.npmjs.com/package/@tykok/cedict-dictionary
- **Features:** Multiple search methods, auto-updates with new CEDICT versions
- **Format:** Provides CEDICT as JSON

#### `hanzi`
- **GitHub:** https://github.com/nieldlr/hanzi
- **Features:** Dictionary lookup + phonetic regularity + example words
- **Installation:** `npm install hanzi`
- **Uses:** CC-CEDICT for definitions

#### `@alexamies/chinesedict-js`
- **npm:** https://www.npmjs.com/package/@alexamies/chinesedict-js
- **Format:** ES6 browser module
- **Features:** Loads dictionaries from JSON, text parsing, highlighting

#### `chinese-dictionary`
- **npm:** https://www.npmjs.com/package/chinese-dictionary
- **Features:** CC-CEDICT, classify, pinyin, English lookups
- **Version:** 1.1.2

---

## 4. Data Extraction Examples

### Example 1: Extract Meanings for 长 (cháng vs zhǎng)

**Using `node-cc-cedict`:**
```javascript
const cedict = require('node-cc-cedict');

// Search for character
cedict.searchByChinese('长', function(entries) {
  entries.forEach(entry => {
    console.log(`Pronunciation: ${entry.pinyin}`);
    console.log(`Meanings: ${entry.english}`);
    console.log('---');
  });
});

// Expected output:
// Pronunciation: chang2
// Meanings: length/long/forever/always/constantly/
// ---
// Pronunciation: zhang3
// Meanings: chief/head/elder/to grow/to develop/
// ---
```

### Example 2: Extract Meanings for 好 (hǎo vs hào)

**Using `cedict-lookup`:**
```javascript
const cedict = require('cedict-lookup');
const dict = cedict.loadSimplified('cedict_ts.u8');

const results = dict.getMatch('好');

results.forEach(entry => {
  console.log(`${entry.simplified} [${entry.pinyin}]`);
  console.log(`English: ${entry.english}`);
  console.log('');
});

// Expected output:
// 好 [hao3]
// English: good/well/
//
// 好 [hao4]
// English: be fond of/
```

### Example 3: Batch Processing Multiple Polyphones

```javascript
const cedict = require('node-cc-cedict');

const polyphones = ['好', '长', '行', '乐'];

async function fetchAllMeanings(char) {
  return new Promise((resolve) => {
    cedict.searchByChinese(char, (entries) => {
      const meanings = entries.map(e => ({
        char: e.simplified,
        pinyin: e.pinyin,
        english: e.english.split('/').filter(m => m.length > 0)
      }));
      resolve(meanings);
    });
  });
}

async function processBatch() {
  for (const char of polyphones) {
    const meanings = await fetchAllMeanings(char);
    console.log(`\n${char}:`);
    meanings.forEach(m => {
      console.log(`  [${m.pinyin}] ${m.english.join(', ')}`);
    });
  }
}

processBatch();

// Expected output:
// 好:
//   [hao3] good, well
//   [hao4] be fond of
//
// 长:
//   [chang2] length, long, forever, always, constantly
//   [zhang3] chief, head, elder, to grow, to develop
// ...
```

---

## 5. Recommended Implementation Strategy

### For Hanzi Dojo Dictionary Fix

**Goal:** Fetch differentiated meanings for all multi-pronunciation characters in database

**Recommended Approach:**

1. **Use `node-cc-cedict` package** (simplest, batteries-included)
2. **Query database** for all characters with `zhuyin_variants`
3. **For each character + pronunciation:**
   - Query CC-CEDICT for all entries matching the character
   - Filter results by pinyin (convert Zhuyin → Pinyin for matching)
   - Extract English meanings specific to that pronunciation
4. **Update database** with differentiated meanings

**Sample Script Structure:**

```javascript
const cedict = require('node-cc-cedict');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Zhuyin to Pinyin converter (you'll need a library or mapping table)
function zhuyinToPinyin(zhuyin) {
  // Convert ㄓㄠˊ → zhao2
  // Implementation needed
}

async function updatePolyphoneMeanings() {
  // 1. Fetch all multi-pronunciation characters
  const { data: chars } = await supabase
    .from('dictionary_v3')
    .select('*')
    .not('zhuyin_variants', 'is', null);

  for (const char of chars) {
    const variants = char.zhuyin_variants;

    for (const variant of variants) {
      const pinyin = zhuyinToPinyin(variant.zhuyin);

      // 2. Query CC-CEDICT
      const meanings = await new Promise((resolve) => {
        cedict.searchByChinese(char.simplified, (entries) => {
          // Filter by matching pinyin
          const match = entries.find(e =>
            normalizePinyin(e.pinyin) === normalizePinyin(pinyin)
          );
          resolve(match ? match.english : null);
        });
      });

      // 3. Update database
      if (meanings) {
        variant.meanings = meanings.split('/').filter(m => m);
        console.log(`${char.simplified} [${variant.zhuyin}]: ${variant.meanings.join(', ')}`);
      }
    }

    // 4. Save updated variants
    await supabase
      .from('dictionary_v3')
      .update({ zhuyin_variants: variants })
      .eq('id', char.id);
  }
}
```

**Additional Utilities Needed:**
- Zhuyin → Pinyin converter (can use `pinyin-utils` or custom mapping)
- Pinyin normalizer (handle tone marks: háng → hang2)

---

## 6. Testing Data - Real Polyphone Examples

### Test Characters for Validation

```javascript
const testCases = [
  {
    char: '好',
    variants: [
      { zhuyin: 'ㄏㄠˇ', pinyin: 'hao3', expected: ['good', 'well'] },
      { zhuyin: 'ㄏㄠˋ', pinyin: 'hao4', expected: ['be fond of'] }
    ]
  },
  {
    char: '长',
    variants: [
      { zhuyin: 'ㄔㄤˊ', pinyin: 'chang2', expected: ['length', 'long', 'forever', 'always', 'constantly'] },
      { zhuyin: 'ㄓㄤˇ', pinyin: 'zhang3', expected: ['chief', 'head', 'elder', 'to grow', 'to develop'] }
    ]
  },
  {
    char: '行',
    variants: [
      { zhuyin: 'ㄏㄤˊ', pinyin: 'hang2', expected: ['a row', 'profession', 'professional'] },
      { zhuyin: 'ㄒㄧㄥˊ', pinyin: 'xing2', expected: ['all right', 'capable', 'competent', 'OK', 'to go', 'to do'] },
      { zhuyin: 'ㄒㄧㄥˋ', pinyin: 'xing4', expected: ['behavior', 'conduct'] }
    ]
  },
  {
    char: '乐',
    variants: [
      { zhuyin: 'ㄌㄜˋ', pinyin: 'le4', expected: ['happy', 'laugh', 'cheerful'] },
      { zhuyin: 'ㄩㄝˋ', pinyin: 'yue4', expected: ['music'] }
    ]
  }
];
```

---

## 7. Summary & Next Steps

### What We Learned
1. ✅ CC-CEDICT **does differentiate** meanings for different pronunciations
2. ✅ Each pronunciation gets a **separate dictionary entry** with distinct meanings
3. ✅ Multiple **mature npm packages** exist for Node.js access
4. ✅ Data is **freely available** under CC BY-SA 4.0 license
5. ✅ No MDBG API, but **direct file download** is supported

### Recommended Solution
**Use `node-cc-cedict` npm package:**
- Simplest setup (no file management)
- Complete coverage (124k+ entries)
- Asynchronous API
- Active maintenance

### Implementation Steps
1. Install `node-cc-cedict`
2. Create Zhuyin → Pinyin converter utility
3. Query database for multi-pronunciation characters
4. For each character:
   - Fetch all CC-CEDICT entries
   - Match by pinyin pronunciation
   - Extract meaning differences
5. Update `zhuyin_variants.meanings` in database
6. Validate with test cases

### Potential Challenges
- **Pinyin conversion:** Need reliable Zhuyin → Pinyin mapping (tone marks critical)
- **Meaning format:** CC-CEDICT uses `/` delimiters, may need parsing
- **Normalization:** Handle pinyin variants (with/without tone marks, u: vs ü)
- **Missing entries:** Some characters may not be in CC-CEDICT (need fallback strategy)

---

## References

### Official Documentation
- [CC-CEDICT Wiki](https://cc-cedict.org/wiki/)
- [CC-CEDICT Download](https://www.mdbg.net/chinese/dictionary?page=cedict)
- [CC-CEDICT Format Specification](http://cc-cedict.org/wiki/format:syntax)
- [CEDICT - Wikipedia](https://en.wikipedia.org/wiki/CEDICT)

### npm Packages
- [node-cc-cedict](https://www.npmjs.com/package/node-cc-cedict)
- [cedict-lookup](https://github.com/takumif/cedict-lookup)
- [parse-cc-cedict](https://www.npmjs.com/package/parse-cc-cedict)
- [@tykok/cedict-dictionary](https://www.npmjs.com/package/@tykok/cedict-dictionary)
- [hanzi](https://github.com/nieldlr/hanzi)
- [@alexamies/chinesedict-js](https://www.npmjs.com/package/@alexamies/chinesedict-js)
- [chinese-dictionary](https://www.npmjs.com/package/chinese-dictionary)

### GitHub Resources
- [rhcarvalho/cedict](https://github.com/rhcarvalho/cedict) - Auto-updated daily mirror
- [gitpan/Lingua-ZH-CEDICT](https://github.com/gitpan/Lingua-ZH-CEDICT) - Raw dictionary file

### Alternative APIs
- [Chinese Character Web API](http://ccdb.hemiola.com/) - Unihan Database (different focus)

### Chinese Polyphones Resources
- [Chinese Polyphones Guide - Vaia](https://www.vaia.com/en-us/explanations/chinese/chinese-grammar/chinese-polyphones/)
- [30 Chinese Characters with Multiple Pronunciations - Fluent in Mandarin](https://www.fluentinmandarin.com/content/chinese-characters-multiple-pronunciations/)
- [Long in Chinese - Mandarin Blueprint](https://www.mandarinblueprint.com/blog/long-in-chinese/)
- [多音字 Guide - Dig Mandarin](https://www.digmandarin.com/duo-yin-zi-polyphones-chinese-characters.html)

---

**Document Status:** Complete
**Last Updated:** 2025-12-09
**Author:** Claude Code (Framework Documentation Researcher)
