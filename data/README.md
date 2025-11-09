# Dictionary Data Files

## Overview
This directory contains the seed data for Hanzi Dojo's dictionary system, which powers auto-fill in the Add Item flow and generates drill distractors.

## Files

### `dictionary_seed_v1.json`
**Purpose:** Canonical character mappings (Simplified ↔ Traditional ↔ Zhuyin)

**Current Coverage:** ~150 characters
- User's child's Week 1 school curriculum (10 characters)
- HSK 1-2 high-frequency characters
- Numbers 1-10
- Family members
- Common verbs, nouns, adjectives
- Directions, colors, time words
- Basic conversational vocabulary

**Target Coverage:** 500 characters (to be expanded)

**Format:**
```json
{
  "simp": "字",
  "trad": "字",
  "zhuyin": [["ㄗ", "", "ˋ"]],
  "pinyin": "zì",
  "frequency_rank": 104,
  "meanings": ["character", "word"]
}
```

**Multi-Reading Characters:**
For characters with multiple pronunciations (e.g., 着, 了), use `zhuyin_variants`:
```json
{
  "simp": "着",
  "trad": "著",
  "zhuyin_variants": [
    {
      "zhuyin": [["ㄓ", "ㄠ", "ˊ"]],
      "pinyin": "zháo",
      "context_words": ["着急", "睡着"],
      "meanings": ["to touch", "to feel"]
    },
    ...
  ]
}
```

### `confusion_maps_v1.json`
**Purpose:** Phonetic and visual similarity maps for generating drill distractors

**Categories:**
1. **zhuyin_initials:** Confusable initial consonants (e.g., ㄓ ↔ ㄗ)
2. **zhuyin_finals:** Confusable final sounds (e.g., ㄢ ↔ ㄤ)
3. **tones:** All five Mandarin tones (ˉˊˇˋ˙)
4. **traditional_visual_confusion:** Characters that look similar (e.g., 門 ↔ 問)
5. **traditional_phonetic_confusion:** Characters that sound similar (e.g., 陽 ↔ 楊)

**Usage:**
- **Drill A (Zhuyin):** Generate tone variants first, then swap initials/finals
- **Drill B (Traditional):** Combine visual + phonetic confusion for plausible multi-character word distractors

## Expansion Strategy

### Phase 1 (Current): 150 characters ✅
- Core HSK 1-2 vocabulary
- User's child's current school curriculum

### Phase 2: Expand to 500 characters
**Sources:**
1. Taiwan Ministry of Education Grade 1-2 curriculum standards
2. Mainland China Grade 1-2 textbook frequency analysis
3. Children's storybook corpus (Traditional Chinese)
4. HSK 3 vocabulary
5. User-reported `dictionary_missing` entries

**Priority Criteria:**
- Frequency in children's literature
- Overlap with school curriculum
- Parent-requested characters from `dictionary_missing` log

### Phase 3: Expand to 1,000+ characters
- HSK 4-5 vocabulary
- Grade 3-4 curriculum
- Automated backfill from `dictionary_missing`

## Data Quality Standards

### Required Fields
- ✅ `simp` and `trad` must be present (can be identical)
- ✅ `zhuyin` or `zhuyin_variants` must be present
- ✅ `frequency_rank` for sorting/prioritization

### Optional but Recommended
- `pinyin` (helpful for parents unfamiliar with Zhuyin)
- `meanings` (English translations)
- `context_words` (for multi-reading characters)

### Validation Rules
1. **Zhuyin format:** `[[initial, final, tone], ...]`
   - `initial`: One of ㄅㄆㄇㄈ... or empty string ""
   - `final`: One of ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥ... or compound like ㄧㄢ, or empty ""
   - `tone`: One of ˉˊˇˋ˙
2. **Multi-syllable words:** Array length matches character count
3. **Frequency rank:** Lower = more common (1-1000+)

## Import Scripts

### Supabase Import
See `../supabase/migrations/` for SQL scripts that:
1. Create `dictionary_entries` table
2. Create `dictionary_confusions` table
3. Populate from JSON files
4. Create indexes for fast lookup

### Manual Testing
Use Supabase Dashboard → SQL Editor:
```sql
-- Test lookup
SELECT simp, trad, zhuyin, pinyin 
FROM dictionary_entries 
WHERE simp = '太' OR trad = '太';

-- Check coverage
SELECT COUNT(*) FROM dictionary_entries;

-- Find multi-reading characters
SELECT simp, trad, zhuyin_variants 
FROM dictionary_entries 
WHERE zhuyin_variants IS NOT NULL;
```

## Maintenance

### Adding New Characters
1. Research canonical mapping (prefer Taiwan Ministry of Education dictionary)
2. Verify Zhuyin with native speaker or authoritative source
3. Add to `dictionary_seed_v1.json` with proper frequency rank
4. For multi-reading: Include ALL common readings with context examples
5. Update confusion maps if new phonetic patterns emerge
6. Re-import via migration script

### Monitoring Coverage Gaps
Query `dictionary_missing` weekly:
```sql
SELECT simp, trad, zhuyin, COUNT(*) as request_count
FROM dictionary_missing
GROUP BY simp, trad, zhuyin
ORDER BY request_count DESC
LIMIT 50;
```

Top-requested missing entries should be added to next seed version.

## Version History

### v1.0.0 (2025-11-03)
- Initial seed: 150 characters
- User's Week 1 school characters: 太, 阳/陽, 黑, 前, 后/後, 着/著, 光, 灯/燈, 亮, 见/見
- HSK 1-2 foundation
- Confusion maps for Drill A/B generation

### Future Versions
- v1.1.0: Expand to 300 characters (HSK 3 overlap)
- v1.2.0: Expand to 500 characters (Grade 1-2 curriculum complete)
- v2.0.0: Expand to 1,000+ characters (HSK 4-5 + Grade 3-4)

---

> **Note for Developers:** These JSON files are the **source of truth** for dictionary data. Database tables are populated FROM these files. When making changes, always:
> 1. Edit JSON first
> 2. Create new migration to sync DB
> 3. Test lookup/drill generation
> 4. Commit both JSON and migration together
