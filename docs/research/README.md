# Dictionary Research Documentation

This directory contains comprehensive research on accessing Chinese dictionary data programmatically, specifically for fixing multi-pronunciation character meanings in the Hanzi Dojo database.

---

## Quick Start

**Problem:** All pronunciation variants currently have identical meanings in the database. Characters with multiple pronunciations (polyphones) should have different meanings for each pronunciation.

**Solution:** Use CC-CEDICT dictionary data to fetch pronunciation-specific meanings.

**Read this first:** [`implementation-guide-polyphone-meanings.md`](./implementation-guide-polyphone-meanings.md)

---

## Documents in This Directory

### 1. `cc-cedict-mdbg-api-research.md` (Main Research Document)
**Purpose:** Comprehensive research findings

**Contents:**
- CC-CEDICT format specification and documentation
- MDBG API status (spoiler: no public API exists)
- npm package comparisons (7 libraries reviewed)
- Data extraction examples with real code
- Polyphone examples from actual dictionary

**Key Finding:**
> CC-CEDICT stores separate entries for each pronunciation. A character like 好 has TWO entries:
> - `好 好 [hao3] /good/well/`
> - `好 好 [hao4] /be fond of/`

**When to read:** Comprehensive background on CC-CEDICT, dictionary formats, and available tools.

---

### 2. `implementation-guide-polyphone-meanings.md` (Practical Guide)
**Purpose:** Step-by-step implementation instructions

**Contents:**
- Problem statement with examples
- Complete implementation steps (install → extract → migrate)
- Code templates for extraction script
- SQL migration generation
- Testing checklist
- Troubleshooting guide

**When to read:** When you're ready to implement the database fix.

---

### 3. `cc-cedict-usage-example.js` (Working Code)
**Purpose:** Runnable examples demonstrating CC-CEDICT access

**Contents:**
- 6 complete examples with detailed comments
- Simple lookups, batch processing, filtering by pinyin
- Structured data extraction for database updates
- Zhuyin → Pinyin mapping examples
- Error handling for missing entries

**When to use:**
- Test CC-CEDICT library functionality
- Learn API usage patterns
- Copy code snippets into implementation script

**How to run:**
```bash
npm install node-cc-cedict
node docs/research/cc-cedict-usage-example.js
```

---

### 4. `README.md` (This File)
**Purpose:** Navigation guide for research documentation

---

## Quick Reference

### Key Resources

**CC-CEDICT Official:**
- Download: https://www.mdbg.net/chinese/dictionary?page=cedict
- Latest: 2025-11-18 release (124,133 entries)
- License: Creative Commons BY-SA 4.0 (commercial use OK)

**Recommended npm Package:**
- **node-cc-cedict:** https://www.npmjs.com/package/node-cc-cedict
- Batteries-included (SQLite embedded)
- Asynchronous API
- Auto-handles traditional/simplified

**Alternative Packages:**
- cedict-lookup (requires local file)
- parse-cc-cedict (raw parser)
- hanzi (NLP features)

### Polyphone Examples

**Test these characters to validate implementation:**

| Character | Pronunciations | Meanings |
|-----------|----------------|----------|
| 好 | hǎo / hào | good, well / be fond of |
| 长/長 | cháng / zhǎng | length, long / chief, to grow |
| 行 | háng / xíng / xìng | row, profession / to go, OK / behavior |
| 乐/樂 | lè / yuè | happy / music |
| 了 | le / liǎo | (particle) / to finish |
| 着/著 | zhe / zháo / zhuó | (particle) / to touch / to wear |

---

## Implementation Workflow

**Recommended sequence:**

1. **Research Phase (DONE)**
   - [x] Read `cc-cedict-mdbg-api-research.md`
   - [x] Understand CC-CEDICT format
   - [x] Review available npm packages

2. **Testing Phase**
   - [ ] Run `cc-cedict-usage-example.js`
   - [ ] Test Zhuyin → Pinyin conversion
   - [ ] Verify meanings extraction

3. **Development Phase**
   - [ ] Follow `implementation-guide-polyphone-meanings.md`
   - [ ] Create extraction script
   - [ ] Generate SQL migration

4. **Validation Phase**
   - [ ] Review extracted meanings manually
   - [ ] Test migration on development database
   - [ ] Validate drill quality improvements

5. **Deployment Phase**
   - [ ] Backup production database
   - [ ] Apply migration
   - [ ] Monitor production metrics

---

## FAQ

### Q: Why not use MDBG API?
**A:** MDBG does not provide a public API. The only options are:
1. Download CC-CEDICT file (recommended)
2. Use npm packages that wrap CC-CEDICT
3. Use alternative APIs (different data sources)

### Q: Which npm package should I use?
**A:** **node-cc-cedict** is recommended because:
- Simplest setup (SQLite database included)
- No file management needed
- Well-maintained
- Complete dictionary coverage

### Q: How does CC-CEDICT handle polyphones?
**A:** CC-CEDICT creates **separate entries** for each pronunciation. Same character, different pinyin, different meanings.

### Q: What if a character is not in CC-CEDICT?
**A:** Rare characters may be missing. Strategy:
1. Keep existing meanings (don't modify)
2. Log for manual review
3. Consider manual entry or alternative sources

### Q: How do I convert Zhuyin to Pinyin?
**A:** Options:
1. Use `pinyin-utils` npm package
2. Create manual mapping table (see implementation guide)
3. Use online converter to generate mapping

---

## Code Snippets

### Quick Lookup Example
```javascript
const cedict = require('node-cc-cedict');

cedict.searchByChinese('好', function(entries) {
  entries.forEach(entry => {
    console.log(`[${entry.pinyin}] ${entry.english}`);
  });
});

// Output:
// [hao3] /good/well/
// [hao4] /be fond of/
```

### Extract Meanings by Pinyin
```javascript
function getMeaningsByPinyin(char, targetPinyin) {
  return new Promise((resolve) => {
    cedict.searchByChinese(char, (entries) => {
      const match = entries.find(e => e.pinyin === targetPinyin);
      if (match) {
        const meanings = match.english
          .split('/')
          .filter(m => m.trim().length > 0);
        resolve(meanings);
      } else {
        resolve(null);
      }
    });
  });
}

// Usage:
const meanings = await getMeaningsByPinyin('好', 'hao3');
console.log(meanings); // ["good", "well"]
```

---

## Related Documentation

**Hanzi Dojo Dictionary Docs:**
- Main architecture: `docs/TECH_AND_LOGIC.md`
- Migration guide: `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`
- Remaining work: `docs/operational/DICTIONARY_REMAINING_WORK.md`
- Epic 8 plan: `docs/PROJECT_PLAN.md` (Section: Epic 8)

**Session History:**
- Multi-pronunciation implementation: `SESSION_LOG.md` (Session 11, Nov 12 2025)
- Pattern A structure: `SESSION_LOG.md` (Session 11)

---

## Next Steps

**After completing polyphone meanings fix:**

1. **Improve drill quality**
   - Update Drill A to use variant-specific meanings
   - Ensure alternate pronunciations excluded from distractors

2. **Enhance UI**
   - Show meanings in Add Character modal
   - Display in pronunciation selection

3. **Expand dictionary**
   - Use CC-CEDICT to add more characters
   - Validate existing entries against CC-CEDICT

4. **Consider automation**
   - Auto-update dictionary from CC-CEDICT
   - Periodic sync for new entries

---

## Contributing

When adding new research:

1. **Create new `.md` file** in this directory
2. **Add entry** to this README
3. **Link** from related documentation
4. **Include:**
   - Purpose statement
   - Key findings
   - Code examples
   - References

**Document naming:**
- Use kebab-case: `new-research-topic.md`
- Include date in content: `**Date:** 2025-12-09`
- Add to git: `git add docs/research/`

---

**Last Updated:** 2025-12-09
**Status:** Research complete, ready for implementation
**Estimated Implementation Time:** 4-6 hours
