# Polyphone Data Structure Recommendations for Hanzi Dojo

**Date:** December 9, 2025
**Purpose:** Actionable guidance for fixing dictionary data quality issues

---

## Problem Statement

Current Hanzi Dojo dictionary has three data quality issues:

1. **Duplicate meanings** - Same meanings copied to all pronunciation variants
2. **Missing context words** - Alternate pronunciations lack example compound words
3. **Malformed zhuyin** - Some zhuyin arrays have empty middle components

---

## Recommended Data Structure (Enhanced Pattern A)

### Complete Example: 长/長

```typescript
{
  simplified: "长",
  traditional: "長",

  // DEFAULT PRONUNCIATION (most common)
  default_zhuyin: ["ㄓ", "ㄤ", "ˇ"],  // zhǎng
  default_pinyin: "zhǎng",
  default_meanings: ["to grow", "elder", "chief"],  // ONLY for default pronunciation

  // ALL PRONUNCIATION VARIANTS (including default)
  zhuyin_variants: [
    {
      // Variant 1: zhǎng (DEFAULT - must match default_zhuyin)
      zhuyin: ["ㄓ", "ㄤ", "ˇ"],
      pinyin: "zhǎng",

      // SPECIFIC meanings for THIS pronunciation only
      specific_meanings: ["to grow", "elder", "chief"],

      // REQUIRED: 2+ context words showing usage
      context_words: [
        {
          word: "生长",
          pinyin: "shēngzhǎng",
          meaning: "to grow"
        },
        {
          word: "校长",
          pinyin: "xiàozhǎng",
          meaning: "principal"
        },
        {
          word: "长大",
          pinyin: "zhǎngdà",
          meaning: "grow up"
        }
      ],

      // OPTIONAL: Data quality tracking
      source: "CC-CEDICT",
      confidence: "high",  // high, medium, low
      hsk_level: 1,
      frequency_rank: 1  // 1 = most common, 2 = second most common, etc.
    },
    {
      // Variant 2: cháng (ALTERNATE)
      zhuyin: ["ㄔ", "ㄤ", "ˊ"],
      pinyin: "cháng",

      // DIFFERENT meanings for THIS pronunciation
      specific_meanings: ["long", "length"],

      context_words: [
        {
          word: "长度",
          pinyin: "chángdù",
          meaning: "length"
        },
        {
          word: "长江",
          pinyin: "Chángjiāng",
          meaning: "Yangtze River"
        },
        {
          word: "很长",
          pinyin: "hěn cháng",
          meaning: "very long"
        }
      ],

      source: "CC-CEDICT",
      confidence: "high",
      hsk_level: 1,
      frequency_rank: 2
    }
  ],

  // METADATA
  hsk_level: 1,  // Lowest HSK level where character appears
  total_strokes: 4,  // For simplified
  radical: "长"
}
```

---

## Key Principles

### 1. Meaning Differentiation

**RULE:** Each pronunciation variant must have DISTINCT meanings.

**Bad Example (Current Problem):**
```typescript
{
  default_meanings: ["to grow", "long", "elder", "chief", "length"],
  zhuyin_variants: [
    {
      zhuyin: ["ㄓ", "ㄤ", "ˇ"],  // zhǎng
      specific_meanings: ["to grow", "long", "elder", "chief", "length"]  // ❌ Duplicate
    },
    {
      zhuyin: ["ㄔ", "ㄤ", "ˊ"],  // cháng
      specific_meanings: ["to grow", "long", "elder", "chief", "length"]  // ❌ Duplicate
    }
  ]
}
```

**Good Example:**
```typescript
{
  default_meanings: ["to grow", "elder", "chief"],  // Only for default pronunciation
  zhuyin_variants: [
    {
      zhuyin: ["ㄓ", "ㄤ", "ˇ"],  // zhǎng
      specific_meanings: ["to grow", "elder", "chief"]  // ✅ Specific to zhǎng
    },
    {
      zhuyin: ["ㄔ", "ㄤ", "ˊ"],  // cháng
      specific_meanings: ["long", "length"]  // ✅ Specific to cháng
    }
  ]
}
```

### 2. Context Words Are Essential

**RULE:** Minimum 2 context words per pronunciation variant.

**Why Context Words Matter:**
- Help learners understand WHEN to use each pronunciation
- Provide drill distractor guardrails (exclude valid alternates)
- Enable disambiguation in compound words
- Support future AI-powered pronunciation prediction

**Example: 好 (hǎo/hào)**
```typescript
{
  zhuyin_variants: [
    {
      zhuyin: ["ㄏ", "ㄠ", "ˇ"],  // hǎo
      specific_meanings: ["good", "easy"],
      context_words: [
        { word: "很好", pinyin: "hěn hǎo", meaning: "very good" },
        { word: "好人", pinyin: "hǎo rén", meaning: "good person" },
        { word: "好吃", pinyin: "hǎo chī", meaning: "delicious" }
      ]
    },
    {
      zhuyin: ["ㄏ", "ㄠ", "ˋ"],  // hào
      specific_meanings: ["to like"],
      context_words: [
        { word: "爱好", pinyin: "àihào", meaning: "hobby" },
        { word: "好奇", pinyin: "hàoqí", meaning: "curious" },
        { word: "好学", pinyin: "hàoxué", meaning: "eager to learn" }
      ]
    }
  ]
}
```

### 3. Valid Zhuyin Structure

**RULE:** Zhuyin arrays must have 2-4 components, no empty strings.

**Structure:** `[Initial?, Medial?, Final, Tone]`

**Bad Examples:**
```typescript
["ㄓ", "", "ㄤ", "ˇ"]  // ❌ Empty string in middle
["ㄓ", "ㄤ"]          // ❌ Missing tone mark
["ㄓ", "ㄤ", "ˇ", ""] // ❌ Empty string at end
```

**Good Examples:**
```typescript
["ㄓ", "ㄤ", "ˇ"]        // ✅ zhǎng (Initial + Final + Tone)
["ㄉ", "ㄜ", "˙"]        // ✅ de (Initial + Final + Neutral tone)
["ㄧ", "ˉ"]              // ✅ yi (Final only + Tone)
["ㄨ", "ㄛ", "ˇ"]        // ✅ wǒ (Medial + Final + Tone)
```

**Validation Function:**
```typescript
function validateZhuyin(zhuyin: string[]): boolean {
  // Remove empty strings
  const filtered = zhuyin.filter(s => s && s.length > 0);

  // Should have 2-4 components
  if (filtered.length < 2 || filtered.length > 4) return false;

  // Last component must be tone mark
  const tones = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙'];
  const lastChar = filtered[filtered.length - 1];
  if (!tones.includes(lastChar)) return false;

  // All non-tone components must be valid Bopomofo Unicode (U+3105–U+312F)
  for (let i = 0; i < filtered.length - 1; i++) {
    const codePoint = filtered[i].charCodeAt(0);
    if (codePoint < 0x3105 || codePoint > 0x312F) return false;
  }

  return true;
}
```

### 4. Default Pronunciation Priority

**RULE:** First variant in `zhuyin_variants` MUST match `default_zhuyin`.

**Why:**
- Default = most common pronunciation learners encounter first
- Drill A should prioritize default pronunciation
- Entry catalog should display default by default

**Example:**
```typescript
{
  default_zhuyin: ["ㄓ", "ㄤ", "ˇ"],  // zhǎng
  zhuyin_variants: [
    {
      zhuyin: ["ㄓ", "ㄤ", "ˇ"],  // ✅ First variant matches default
      frequency_rank: 1
    },
    {
      zhuyin: ["ㄔ", "ㄤ", "ˊ"],  // ✅ Alternate pronunciations after
      frequency_rank: 2
    }
  ]
}
```

---

## Research Strategy

### Step-by-Step Process for Fixing Data

#### Step 1: Identify Characters Needing Research

Run audit script to find:
- Characters with duplicate meanings across variants
- Characters missing context words
- Characters with malformed zhuyin arrays

#### Step 2: Download CC-CEDICT (Primary Source)

**Latest Release:** December 9, 2025 (124,185 entries)

**Download:**
- URL: https://www.mdbg.net/chinese/dictionary?page=cedict
- Format: `cedict_1_0_ts_utf-8_mdbg.txt.gz`

**Entry Format:**
```
Traditional Simplified [pin1 yin1] /English definition 1/definition 2/
```

**Key Insight:** CC-CEDICT creates **separate entries** for each pronunciation.

**Example (hypothetical):**
```
长 长 [zhang3] /to grow/elder/chief/
长 长 [chang2] /long/length/
```

#### Step 3: Parse CC-CEDICT for Each Character

**Algorithm:**
```python
def extract_pronunciations(character):
    """
    Search CC-CEDICT for all entries matching character.
    Each entry = one pronunciation with specific meanings.
    """
    entries = []

    for line in cedict_file:
        trad, simp, pinyin, meanings = parse_line(line)

        # Match simplified OR traditional
        if simp == character or trad == character:
            entries.append({
                'pinyin': pinyin,
                'meanings': meanings,
                'traditional': trad,
                'simplified': simp
            })

    return entries

# Example usage:
entries = extract_pronunciations("长")
# Result:
# [
#   { pinyin: "zhang3", meanings: ["to grow", "elder", "chief"], ... },
#   { pinyin: "chang2", meanings: ["long", "length"], ... }
# ]
```

#### Step 4: Convert Pinyin to Zhuyin

**Use Conversion Table:**
- Source: https://user.eng.umd.edu/~nSw/chinese/pinyin.htm
- Mapping: 1:1 correspondence (with few exceptions)

**Example Conversions:**
- `zhang3` → `["ㄓ", "ㄤ", "ˇ"]`
- `chang2` → `["ㄔ", "ㄤ", "ˊ"]`
- `le5` → `["ㄌ", "ㄜ", "˙"]` (neutral tone)
- `liao3` → `["ㄌ", "ㄧ", "ㄠ", "ˇ"]`

#### Step 5: Find Context Words

**Sources (in priority order):**

1. **Search CC-CEDICT for Compound Words**
   ```python
   def find_context_words(character, pinyin):
       """Find compound words containing character with specific pronunciation."""
       context_words = []

       for line in cedict_file:
           trad, simp, word_pinyin, meanings = parse_line(line)

           # Multi-character word containing our character
           if len(simp) > 1 and character in simp:
               # Check if pronunciation matches
               if pronunciation_matches(character, pinyin, word_pinyin):
                   context_words.append({
                       'word': simp,
                       'pinyin': word_pinyin,
                       'meaning': meanings[0]  # First meaning
                   })

       return context_words[:3]  # Return top 3
   ```

2. **HSK Word Lists**
   - Prioritize HSK 1-4 vocabulary
   - Ensures learner-appropriate examples
   - Source: https://github.com/xiaohk/pinyin_data

3. **Taiwan MOE Dictionary (Manual Lookup)**
   - URL: https://dict.revised.moe.edu.tw/
   - Search character, view example compounds
   - Copy example sentences showing pronunciation

#### Step 6: Determine Frequency/Default

**Heuristics:**
1. **Character frequency** in HSK lists (lower HSK = more common)
2. **Word frequency** in corpus (if available)
3. **CC-CEDICT entry order** (often most common first)
4. **Manual judgment** for edge cases

**Default Pronunciation Selection:**
- Most frequent in learner materials
- Matches primary meaning in HSK lists
- Appears in more compound words

#### Step 7: Validate and Document

**Checklist:**
- ✅ Meanings are distinct (no duplicates across variants)
- ✅ 2+ context words per variant
- ✅ Zhuyin structure valid (no empty components)
- ✅ Default pronunciation marked correctly
- ✅ Source attribution added
- ✅ Confidence score assigned

**Create Audit Log:**
```typescript
{
  character: "长",
  research_date: "2025-12-09",
  sources_consulted: ["CC-CEDICT", "HSK 1 word list"],
  changes_made: [
    "Separated meanings: zhǎng (grow/chief) vs cháng (long)",
    "Added 3 context words per variant from CC-CEDICT",
    "Verified zhuyin structure matches pinyin conversion"
  ],
  confidence: "high",
  reviewed_by: "human"  // or "automated"
}
```

---

## Common Polyphone Examples (Reference)

### High-Priority Characters (HSK 1-2)

| Character | Pronunciations | Meanings | Context Words |
|-----------|----------------|----------|---------------|
| 长 | zhǎng, cháng | grow/chief, long | 生长/校长, 长度/长江 |
| 好 | hǎo, hào | good, to like | 很好/好人, 爱好/好奇 |
| 还 | huán, hái | return, still | 还钱, 还是/还有 |
| 了 | le, liǎo | (particle), finish | 好了/去了, 了解/不了 |
| 着 | zhe, zháo, zhuó | (particle), touch, wear | 看着/走着, 着火, 穿着 |
| 得 | de, dé, děi | (particle), obtain, must | 说得好, 得到, 得去 |
| 中 | zhōng, zhòng | middle/China, hit target | 中国/中间, 中奖 |
| 重 | zhòng, chóng | heavy, repeat | 重要, 重新/重复 |
| 都 | dōu, dū | all, capital | 都是, 首都 |
| 为 | wèi, wéi | for, become | 为了, 因为/成为 |

### Research Priority: HSK Level

**Priority 1 (HSK 1-2):** 10 characters above
**Priority 2 (HSK 3-4):** ~50 additional characters
**Priority 3 (HSK 5-6):** ~80 additional characters

Total: ~140 multi-pronunciation characters in HSK 1-6 curriculum.

---

## Drill A Guardrail Strategy

### Problem: Valid Alternates as Distractors

**Current Issue:** Drill A might show 长 (cháng) as WRONG answer when testing 长 (zhǎng).

**Solution: Context-Based Exclusion**

#### Strategy 1: Exclude All Variants (Simple)

```typescript
function buildDrillAOptions(entry: Entry, allEntries: Entry[]) {
  const correctAnswer = entry.default_zhuyin;

  // Get all valid pronunciations for this character
  const validZhuyins = entry.zhuyin_variants.map(v => v.zhuyin);

  // Build distractor pool (exclude ALL valid variants)
  const distractorPool = allEntries
    .map(e => e.default_zhuyin)
    .filter(z => !validZhuyins.some(valid => arraysEqual(z, valid)));

  // Select 3 random distractors
  const distractors = shuffle(distractorPool).slice(0, 3);

  return shuffle([correctAnswer, ...distractors]);
}
```

#### Strategy 2: Context-Aware (Advanced)

```typescript
function buildDrillAOptions(entry: Entry, contextWord?: string) {
  const correctAnswer = entry.default_zhuyin;

  // If practicing in context of compound word, determine correct pronunciation
  let correctVariant = entry.zhuyin_variants[0];  // default

  if (contextWord) {
    // Find variant whose context_words include this compound word
    const matchingVariant = entry.zhuyin_variants.find(v =>
      v.context_words.some(cw => cw.word === contextWord)
    );
    if (matchingVariant) {
      correctVariant = matchingVariant;
      correctAnswer = matchingVariant.zhuyin;
    }
  }

  // Exclude ALL pronunciations (including correct one initially)
  const allValidZhuyins = entry.zhuyin_variants.map(v => v.zhuyin);

  // Build distractor pool
  const distractorPool = allEntries
    .map(e => e.default_zhuyin)
    .filter(z => !allValidZhuyins.some(valid => arraysEqual(z, valid)));

  // Select 3 random distractors
  const distractors = shuffle(distractorPool).slice(0, 3);

  return shuffle([correctAnswer, ...distractors]);
}
```

#### Strategy 3: Separate "Default Drill" vs "Variant Drill"

**Default Drill Mode:**
- Only test default pronunciation
- Exclude all variants from distractors
- 90% of practice time

**Variant Drill Mode:**
- Explicitly test alternate pronunciations
- Show context word: "How do you pronounce 长 in 长江?"
- 10% of practice time (advanced learners)

---

## Migration Plan

### Phase 1: Fix Critical Issues (P1)

**Goal:** Validate all existing data, fix structural errors.

**Tasks:**
1. Run audit script to identify:
   - Malformed zhuyin arrays → Fix structure
   - Missing context words → Flag for research
   - Duplicate meanings → Flag for research

2. Validate zhuyin structure:
   - Remove empty strings
   - Verify Unicode range
   - Ensure tone mark present

**Estimated:** 2-3 hours (automated script)

### Phase 2: Add Context Words (P1)

**Goal:** Minimum 2 context words per pronunciation variant.

**Strategy:**
1. Parse CC-CEDICT for compound words containing each character
2. Match pronunciation using pinyin
3. Extract 2-3 most common compound words per variant

**Estimated:** 4-6 hours (semi-automated with manual review)

### Phase 3: Differentiate Meanings (P2)

**Goal:** Ensure meanings are pronunciation-specific.

**Strategy:**
1. For each multi-pronunciation character:
   - Look up separate CC-CEDICT entries
   - Extract meanings per pronunciation
   - Remove duplicates across variants

2. Manual review for ambiguous cases

**Estimated:** 6-8 hours (manual research + validation)

### Phase 4: Enhance Metadata (P3)

**Goal:** Add source attribution, confidence scores, HSK levels.

**Tasks:**
1. Add `source` field to all variants
2. Assign confidence scores based on sources consulted
3. Look up HSK level from word lists
4. Calculate frequency rank (order variants by commonness)

**Estimated:** 2-3 hours (automated with manual spot-checks)

---

## Quality Assurance

### Automated Tests

```typescript
describe('Dictionary Data Quality', () => {
  test('All zhuyin arrays are valid', () => {
    const entries = getDictionaryEntries();

    entries.forEach(entry => {
      entry.zhuyin_variants.forEach(variant => {
        expect(validateZhuyin(variant.zhuyin)).toBe(true);
      });
    });
  });

  test('All variants have minimum 2 context words', () => {
    const entries = getDictionaryEntries();

    entries.forEach(entry => {
      entry.zhuyin_variants.forEach(variant => {
        expect(variant.context_words.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  test('Meanings are not duplicated across variants', () => {
    const entries = getDictionaryEntries();

    entries.forEach(entry => {
      if (entry.zhuyin_variants.length > 1) {
        const variant1 = entry.zhuyin_variants[0];
        const variant2 = entry.zhuyin_variants[1];

        // Check for overlap in meanings
        const overlap = variant1.specific_meanings.filter(m =>
          variant2.specific_meanings.includes(m)
        );

        expect(overlap.length).toBe(0);  // No duplicates
      }
    });
  });

  test('Default pronunciation is first variant', () => {
    const entries = getDictionaryEntries();

    entries.forEach(entry => {
      if (entry.zhuyin_variants.length > 0) {
        const defaultZhuyin = entry.default_zhuyin;
        const firstVariantZhuyin = entry.zhuyin_variants[0].zhuyin;

        expect(arraysEqual(defaultZhuyin, firstVariantZhuyin)).toBe(true);
      }
    });
  });
});
```

### Manual Review Checklist

For each character:
- [ ] Meanings make sense for each pronunciation
- [ ] Context words are real, common compound words
- [ ] Zhuyin matches pinyin conversion table
- [ ] Default pronunciation is most common for learners
- [ ] Source attribution is present
- [ ] Confidence score reflects data quality

---

## Tools & Resources

### Download Links

**CC-CEDICT (Primary Source):**
- Latest: https://www.mdbg.net/chinese/dictionary?page=cedict
- Format: UTF-8 text file (gzip)
- Size: ~20 MB compressed
- Entries: 124,185 (as of Dec 2025)

**Pinyin-Zhuyin Conversion Table:**
- https://user.eng.umd.edu/~nSw/chinese/pinyin.htm
- https://www.yellowbridge.com/chinese/zhuyin.php

**HSK Word Lists:**
- https://github.com/xiaohk/pinyin_data
- HSK 1-6 official vocabulary

### Parsing Libraries

**Python:**
- `cedict_utils`: https://github.com/marcanuy/cedict_utils
- `pinyin`: https://github.com/lxyu/pinyin

**JavaScript/TypeScript:**
- `pinyin`: https://www.npmjs.com/package/pinyin
- `cc-cedict`: Parser TBD (may need to write custom)

**Go:**
- `go-cc-cedict`: https://github.com/purohit/go-cc-cedict

### Manual Lookup

**Taiwan MOE Dictionary:**
- https://dict.revised.moe.edu.tw/ (most authoritative)

**MDBG Online:**
- https://www.mdbg.net/chinese/dictionary (CC-CEDICT web interface)

**Pleco App:**
- iOS/Android app (excellent for pronunciation audio)

---

## Next Steps

1. **Review this document** with user to confirm approach
2. **Download CC-CEDICT** latest release
3. **Write parsing script** to extract pronunciation/meaning pairs
4. **Run audit** on current 136 multi-pronunciation characters
5. **Fix Phase 1** issues (malformed zhuyin)
6. **Research Phase 2** (add context words)
7. **Validate Phase 3** (differentiate meanings)
8. **Deploy migration** with updated data

**Estimated Total Time:** 15-20 hours over 2-3 sessions

---

**Document Created:** December 9, 2025
**For:** Hanzi Dojo Epic 8 dictionary quality improvements
**References:** See `DICTIONARY_DATA_QUALITY_BEST_PRACTICES.md` for full research
