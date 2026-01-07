# Chinese Dictionary Data Quality Best Practices

**Research Date:** December 9, 2025
**Context:** Hanzi Dojo multi-pronunciation character data quality improvement

---

## Executive Summary

This research covers authoritative standards for Chinese dictionary data structure, focusing on:
1. How major dictionaries (CC-CEDICT, MDBG, Taiwan MOE) handle multi-pronunciation characters
2. Best practices for polyphone disambiguation and context words
3. Data quality standards for educational applications
4. Recommendations for Hanzi Dojo dictionary improvements

---

## 1. CC-CEDICT Format & Standards

### Overview
CC-CEDICT is the most widely-used open Chinese-English dictionary, continuation of CEDICT (started 1997).

**Current Stats (Dec 2025):**
- 124,185 entries
- UTF-8 format
- Traditional + Simplified Chinese
- Pinyin pronunciation
- American English definitions

### Entry Format

```
Traditional Simplified [pin1 yin1] /English definition 1/English definition 2/
```

**Example:**
```
中國 中国 [Zhong1 guo2] /China/Middle Kingdom/
```

**Key Format Rules:**
- Chinese text without spaces
- Pinyin with tone numbers (1-5) and spaces between syllables
- Definitions separated by forward slashes `/`
- Multiple glosses for one sense separated by semicolons `;` (as of April 2022)

**Sources:**
- [CC-CEDICT Wiki Format Syntax](http://cc-cedict.org/wiki/format:syntax)
- [CC-CEDICT Download (MDBG)](https://www.mdbg.net/chinese/dictionary?page=cedict)
- [The Format of CC-CEDICT](https://mandarinportal.com/cc-cedict/format-cc-cedict-chinese-english-dictionary/)

---

## 2. Polyphone (多音字) Handling

### What Are Polyphones?

**Definition:** Characters with 2+ pronunciations, each with distinct meanings (like English homographs).

**Scale:**
- ~10% of all Chinese characters (~982 polyphones in modern dictionaries)
- Essential for accurate pronunciation and meaning disambiguation

**Sources:**
- [Understanding Polyphones in Mandarin Chinese (DigMandarin)](https://www.digmandarin.com/duo-yin-zi-polyphones-chinese-characters.html)
- [Polyphone / 多音字 (MandarinWOW)](https://mandarinwow.wordpress.com/2021/10/05/polyphone-多音字/)

### CC-CEDICT Polyphone Strategy

**Key Finding:** CC-CEDICT creates **separate entries** for each pronunciation-meaning pair.

**Example Pattern (not actual CC-CEDICT format, illustrative):**
```
长 长 [chang2] /long/length/
长 长 [zhang3] /to grow/chief/elder/
```

**Pronunciation Variants:**
- Taiwan pronunciation variants noted: `Taiwan pr. shu2 shu5`
- Erhua (儿化音) marked when applicable
- Neutral tone (轻声) indicated in writing

**Limitation:** CC-CEDICT V1 syntax documentation does NOT explicitly explain polyphone structure or provide examples of how meanings are associated with alternate pronunciations.

**Sources:**
- [CEDICT Wikipedia](https://en.wikipedia.org/wiki/CEDICT)
- [CC-CEDICT Parser (Go)](https://pkg.go.dev/github.com/purohit/go-cc-cedict)

---

## 3. Common Polyphone Examples with Context

### Educational Best Practice: Provide Context Words

Research shows learners need **example compound words** to disambiguate pronunciations.

### Example 1: 好 (hǎo/hào)

**hǎo (3rd tone)** - good, easy
- 很好 (hěn hǎo) - very good
- 好人 (hǎo rén) - good person

**hào (4th tone)** - to like
- 爱好 (àihào) - hobby
- 好奇 (hàoqí) - curious

### Example 2: 长 (cháng/zhǎng)

**cháng (2nd tone)** - long, length
- 长度 (chángdù) - length
- 长江 (Chángjiāng) - Yangtze River

**zhǎng (3rd tone)** - to grow, chief, elder
- 生长 (shēngzhǎng) - to grow
- 校长 (xiàozhǎng) - principal

### Example 3: 还 (huán/hái)

**huán (2nd tone)** - to return, give back
- 还钱 (huán qián) - return money

**hái (2nd tone)** - still, yet
- 还是 (háishi) - still, or
- 还有 (háiyǒu) - there are still

### Example 4: 和 (hé/hè/huò)

**hé (2nd tone)** - and, with
- 我和你 (wǒ hé nǐ) - you and me

**hè (4th tone)** - to join in
- 和唱 (hèchàng) - join in singing

**huò (4th tone)** - to mix
- 和水 (huò shuǐ) - mix with water

### Example 5: 乐 (lè/yuè)

**lè (4th tone)** - joy, happy
- 快乐 (kuàilè) - happy
- 乐观 (lèguān) - optimistic

**yuè (4th tone)** - music
- 音乐 (yīnyuè) - music
- 乐器 (yuèqì) - musical instrument

### Example 6: 看 (kàn/kān)

**kàn (4th tone)** - to look, to read
- 看电视 (kàn diànshì) - watch TV
- 看书 (kàn shū) - read a book

**kān (1st tone)** - to look after
- 看孩子 (kān háizi) - look after children

### Example 7: 都 (dōu/dū)

**dōu (1st tone)** - all, both
- 都是 (dōu shì) - all are

**dū (1st tone)** - capital city
- 首都 (shǒudū) - capital

**Sources:**
- [Understanding Polyphones (DigMandarin)](https://www.digmandarin.com/duo-yin-zi-polyphones-chinese-characters.html)
- [Chinese Learning Apps Best Practices](https://www.digmandarin.com/best-chinese-language-learning-apps.html)

---

## 4. Polyphone Disambiguation Strategies

### Modern Best Practices (Neural Network Approaches)

#### 1. Context-Based Disambiguation

**Key Finding:** Adjacent characters are most important for disambiguation.

**Research Insight:**
> "The closer to the position of the polyphonic character, the greater the weight of the attention, which indicates that the closer the context information is to the position of the polyphonic character, the more important it is for polyphone disambiguation."

**Practical Application:**
- Use 2-4 character compound words as context
- Prioritize words where polyphone appears at beginning, middle, or end

**Example Data Structure (from research):**
```json
{
  "会": {
    "huì": [
      ["会合"], // at beginning
      [],       // in middle
      ["都会"]  // at end
    ],
    "kuài": [
      ["会计"],
      [],
      ["财会"]
    ]
  }
}
```

**Sources:**
- [Disambiguation of Polyphones with BERT](https://arxiv.org/html/2501.01102v1)
- [Semi-Supervised Learning for Polyphones](https://arxiv.org/html/2102.00621v3)

#### 2. Dictionary-Based Priority

**Strategy:** First pronunciation in list = most frequent/default pronunciation.

**Example (from pinyin_data GitHub project):**
```json
{
  "长": ["zhǎng", "cháng"],
  "長": ["zhǎng", "cháng", "zhàng"]
}
```

**Sources:**
- [pinyin_data GitHub](https://github.com/xiaohk/pinyin_data)

#### 3. Educational App Approaches

**Best Practices from Popular Apps:**

**HelloChinese:**
- HSK-aligned pronunciation
- Speech recognition for tone practice
- Real native speaker audio

**Chinesimple HSK:**
- 11,000+ words (HSK v3)
- Real-time pronunciation analysis
- Clear feedback on tone accuracy

**Pleco:**
- Audio recordings by native speakers (34,000+ words)
- Multiple recordings per word
- Stroke order animations

**Du Chinese:**
- Stories written and recorded by native speakers
- Organized by HSK level
- Professional translations

**Key Takeaway:** High-quality apps provide:
1. Native speaker audio for EVERY pronunciation variant
2. Context-based example sentences
3. Clear visual distinction between variants
4. HSK-level alignment for learning progression

**Sources:**
- [Best Apps to Learn Chinese (FluentU)](https://www.fluentu.com/blog/chinese/best-apps-to-learn-mandarin-chinese/)
- [42 Best Chinese Learning Apps (Joy of Chinese)](https://joyofchinese.com/apps-to-learn-chinese/)

---

## 5. Bopomofo/Zhuyin Standards

### Unicode Standards

**Bopomofo Block:** U+3105–U+312F (added Unicode 1.0, Oct 1991)
**Bopomofo Extended:** U+31A0–U+31BF (added Unicode 3.0, Sep 1999)

### Structure

**3 Symbol Categories:**
1. **Initials** - Consonants
2. **Medials** - Can function as vowel or consonant
3. **Finals** - Vowels

**Syllable Composition:** Initial + Medial + Final (any part can be omitted)

### Zhuyin Format Rules

**Taiwan Standard:**
- 37 characters + 5 tone marks
- Direction: Right-to-left in vertical columns (traditional) OR left-to-right horizontal (modern)
- Tone marks: To the right (vertical) or above (horizontal)
- First tone (ˉ) often omitted in educational materials

**Pinyin-Zhuyin Correspondence:**
- Mostly 1:1 mapping between Pinyin and Zhuyin
- Few exceptions documented in conversion tables

**Sources:**
- [Bopomofo Wikipedia](https://en.wikipedia.org/wiki/Bopomofo)
- [Zhuyin fuhao (Omniglot)](https://www.omniglot.com/writing/zhuyin.htm)
- [PinYin and BoPoMoFo Equivalence (UMD)](https://user.eng.umd.edu/~nSw/chinese/pinyin.htm)

---

## 6. Taiwan Ministry of Education Dictionaries

### Official Resources

**Three Main Dictionaries:**

1. **Revised Mandarin Chinese Dictionary (重編國語辭典修訂本)**
   - 156,710 entries (published 1994)
   - Historical language coverage (Middle Ages to modern)
   - Traditional pronunciation
   - Documentary evidence examples
   - Target: Teachers, researchers, general public
   - URL: https://dict.revised.moe.edu.tw/

2. **Concised Mandarin Chinese Dictionary (國語辭典簡編本)**
   - Streamlined version for general use
   - URL: https://dict.concised.moe.edu.tw/

3. **Dictionary of Chinese Character Variants (異體字字典)**
   - Character variants with same pronunciation/meaning
   - URL: https://dict.variants.moe.edu.tw/

**API Availability:** No public API documented. Web-based interfaces only.

**Sources:**
- [MOE Revised Dictionary](https://dict.revised.moe.edu.tw/?la=1&powerMode=0)
- [MOE Dictionary Wikipedia](https://en.wikipedia.org/wiki/Ministry_of_Education_Mandarin_Chinese_Dictionary)

---

## 7. Data Quality Issues & Solutions

### Common Problems in Dictionary Data

#### Problem 1: Duplicate Meanings Across Variants

**Issue:** Same meaning copied to all pronunciation variants instead of differentiated.

**Solution:**
- Research each pronunciation individually
- Use context words to verify correct meaning
- Cross-reference multiple dictionaries (CC-CEDICT, MOE, MDBG)

#### Problem 2: Missing Context Words

**Issue:** Alternate pronunciations lack example compound words.

**Solution:**
- Add 2-4 example words per pronunciation
- Include words with polyphone at different positions (beginning, middle, end)
- Prioritize HSK-level vocabulary

#### Problem 3: Malformed Zhuyin

**Issue:** Zhuyin arrays with empty middle components.

**Solution:**
- Validate Zhuyin structure: [Initial?, Medial?, Final, Tone]
- Use Unicode validation (U+3105–U+312F range)
- Cross-check with Pinyin-Zhuyin conversion tables

---

## 8. Recommended Data Structure for Hanzi Dojo

### Current Pattern A Structure (Good Foundation)

```typescript
{
  simplified: "长",
  traditional: "長",
  default_zhuyin: ["ㄓ", "ㄤ", "ˇ"],  // zhǎng (most common)
  default_meanings: ["to grow", "elder", "chief"],
  zhuyin_variants: [
    {
      zhuyin: ["ㄓ", "ㄤ", "ˇ"],  // zhǎng
      context_words: [
        { word: "生长", meaning: "to grow" },
        { word: "校长", meaning: "principal" },
        { word: "长大", meaning: "grow up" }
      ],
      specific_meanings: ["to grow", "elder", "chief"]
    },
    {
      zhuyin: ["ㄔ", "ㄤ", "ˊ"],  // cháng
      context_words: [
        { word: "长度", meaning: "length" },
        { word: "长江", meaning: "Yangtze River" },
        { word: "很长", meaning: "very long" }
      ],
      specific_meanings: ["long", "length"]
    }
  ]
}
```

### Improvements Needed

#### 1. Differentiate Meanings Per Pronunciation

**Current Issue:** `default_meanings` may contain meanings for ALL pronunciations.

**Recommendation:**
- Remove `default_meanings` field OR clearly mark it as "most common pronunciation only"
- Store meanings ONLY in `zhuyin_variants[].specific_meanings`
- Ensure no overlap between variant meanings

#### 2. Add Minimum Context Words

**Standard:**
- Minimum 2 context words per pronunciation variant
- Prioritize HSK-level vocabulary
- Include different word positions if possible

#### 3. Validate Zhuyin Structure

**Required Validation:**
```typescript
// Valid zhuyin array: 2-4 components
// [Initial?, Medial?, Final, Tone]
// No empty strings "" in middle of array

function validateZhuyin(zhuyin: string[]): boolean {
  // Remove empty strings
  const filtered = zhuyin.filter(s => s.length > 0);

  // Should have 2-4 components
  if (filtered.length < 2 || filtered.length > 4) return false;

  // Last component must be tone mark (ˉˊˇˋ˙)
  const tones = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙'];
  const lastChar = filtered[filtered.length - 1];
  if (!tones.includes(lastChar)) return false;

  // All non-tone components must be valid Bopomofo Unicode
  for (let i = 0; i < filtered.length - 1; i++) {
    const codePoint = filtered[i].charCodeAt(0);
    if (codePoint < 0x3105 || codePoint > 0x312F) return false;
  }

  return true;
}
```

#### 4. Prioritization Logic

**For Learning Apps:**
1. **First variant** = most common/default pronunciation (matches `default_zhuyin`)
2. **Context words** = HSK-level prioritized
3. **Meanings** = learner-focused (common usage) not exhaustive dictionary coverage

---

## 9. Research Strategy for Fixing Existing Data

### Step 1: Identify Characters Needing Research

**Priority Groups:**
1. **Duplicate meanings** - Same meaning in multiple variants
2. **Missing context** - Variants without example words
3. **Malformed zhuyin** - Empty components or invalid Unicode

### Step 2: Research Sources (In Order of Priority)

#### Primary Sources:
1. **CC-CEDICT** (download latest: https://www.mdbg.net/chinese/dictionary?page=cedict)
   - Parse entries for each pronunciation
   - Extract meanings and example words
   - Note: 124,185 entries, regularly updated

2. **Taiwan MOE Revised Dictionary** (https://dict.revised.moe.edu.tw/)
   - Authoritative for Taiwan Mandarin
   - Historical context and examples
   - Traditional pronunciation standards

3. **Pleco Dictionary** (if API available)
   - Native speaker audio
   - 34,000+ pronunciation recordings
   - Context sentences

#### Secondary Sources:
4. **MDBG Online Dictionary** (https://www.mdbg.net/chinese/dictionary)
   - Based on CC-CEDICT
   - User-friendly web interface
   - Cantonese pronunciations (Yale & Jyutping)

5. **HSK Word Lists**
   - Prioritize context words from HSK 1-4
   - Ensures learner-appropriate examples

### Step 3: Validation Process

For each character:
1. **Cross-reference 2+ sources** to confirm pronunciations
2. **Verify context words** appear in HSK vocabulary
3. **Test meanings** are distinct (no duplicates across variants)
4. **Validate zhuyin** matches pinyin conversion tables

### Step 4: Document Decisions

Create audit log:
```typescript
{
  character: "长",
  research_date: "2025-12-09",
  sources_consulted: ["CC-CEDICT", "MOE Dictionary"],
  changes_made: [
    "Separated meanings: zhǎng (grow/chief) vs cháng (long)",
    "Added 3 context words per variant",
    "Verified zhuyin structure"
  ],
  confidence: "high" // high, medium, low
}
```

---

## 10. Educational Best Practices Summary

### What Learners Need

Based on research into successful Chinese learning apps:

#### 1. Clear Pronunciation Distinction
- Native speaker audio for EVERY variant
- Visual indicators (color coding, icons) for different pronunciations
- Tone marks ALWAYS displayed (except first tone ˉ, per Taiwan convention)

#### 2. Meaningful Context
- 2-4 example compound words per pronunciation
- Examples from learner's current HSK level
- Real-world usage (not obscure literary references)

#### 3. Progressive Disclosure
- Default to most common pronunciation
- Show variants only when relevant
- Mark frequency/commonness of each variant

#### 4. Error Prevention
- Distractors in drills MUST exclude valid alternate pronunciations
- Clear feedback when learner confuses variants
- Spaced repetition tailored per pronunciation

### Quality Metrics

**High-Quality Dictionary Entry:**
- ✅ 2+ context words per pronunciation
- ✅ Distinct meanings (no duplicates)
- ✅ Valid zhuyin structure (no empty components)
- ✅ Source attribution (CC-CEDICT, MOE, etc.)
- ✅ Confidence score (high/medium/low)

**Medium-Quality Entry:**
- ✅ 1 context word per pronunciation
- ✅ Mostly distinct meanings (minor overlap OK)
- ✅ Valid zhuyin
- ⚠️ Single source only

**Low-Quality Entry (Needs Research):**
- ❌ Missing context words
- ❌ Duplicate meanings across variants
- ❌ Malformed zhuyin
- ❌ No source attribution

---

## 11. Action Items for Hanzi Dojo

### Immediate Fixes (P1)

1. **Validate All Zhuyin Arrays**
   - Remove empty string components
   - Verify Unicode range (U+3105–U+312F)
   - Ensure tone mark present and valid

2. **Add Minimum Context Words**
   - 2 context words per pronunciation variant
   - Prioritize HSK 1-4 vocabulary
   - Use CC-CEDICT as primary source

3. **Differentiate Meanings**
   - Review all multi-pronunciation characters
   - Ensure meanings are pronunciation-specific
   - Remove duplicates across variants

### Medium-Term Improvements (P2)

4. **Enhance Drill A Guardrails**
   - Exclude ALL valid alternate pronunciations from distractors
   - Use context words to verify correct pronunciation per word
   - Add pronunciation hints when character appears in compound word

5. **Add Confidence Scoring**
   - Mark data quality: high/medium/low
   - Show data source attribution
   - Allow user feedback on incorrect data

6. **Expand Dictionary Coverage**
   - Target 250+ multi-pronunciation characters (Epic 8 Phase 3)
   - Download latest CC-CEDICT (124,185 entries)
   - Parse and import programmatically

### Long-Term Enhancements (P3)

7. **Native Audio Integration**
   - Record or source native speaker audio for all pronunciations
   - Multiple speakers (male/female voices)
   - Clear tone differentiation

8. **Context-Based Disambiguation**
   - Use compound word context to predict correct pronunciation
   - Implement neural network model (if needed at scale)
   - Leverage user practice data to improve accuracy

9. **User Contribution System**
   - Allow parents to report incorrect pronunciations
   - Community voting on context word relevance
   - Automated validation pipeline

---

## 12. Key Takeaways

### CC-CEDICT Approach
✅ **Separate entries** for each pronunciation-meaning pair
✅ **Simple, parseable format** (Traditional Simplified [pinyin] /meaning/)
⚠️ **No explicit polyphone documentation** in V1 syntax guide
❌ **No programmatic API** (download-only)

### Polyphone Best Practices
✅ **Context words are essential** for disambiguation
✅ **Adjacent characters** most important for prediction
✅ **First pronunciation** = default/most common
✅ **2-4 example words** per pronunciation (beginning/middle/end positions)

### Educational Standards
✅ **Native speaker audio** for every pronunciation variant
✅ **HSK-level aligned** vocabulary for examples
✅ **Clear visual distinction** between variants
✅ **Error prevention** in drills (exclude valid alternates)

### Data Quality Metrics
✅ **Distinct meanings** per pronunciation (no duplicates)
✅ **Valid zhuyin structure** (no empty components, proper Unicode)
✅ **Source attribution** (CC-CEDICT, MOE, etc.)
✅ **Confidence scoring** (high/medium/low)

---

## Sources

### Official Documentation
- [CC-CEDICT Wiki](http://cc-cedict.org/wiki/format:syntax)
- [CC-CEDICT Download (MDBG)](https://www.mdbg.net/chinese/dictionary?page=cedict)
- [Taiwan MOE Revised Dictionary](https://dict.revised.moe.edu.tw/)
- [Taiwan MOE Concised Dictionary](https://dict.concised.moe.edu.tw/)
- [Bopomofo Wikipedia](https://en.wikipedia.org/wiki/Bopomofo)

### Research Papers
- [Disambiguation of Chinese Polyphones with BERT](https://arxiv.org/html/2501.01102v1)
- [Polyphone Disambiguation with Semi-Supervised Learning](https://arxiv.org/html/2102.00621v3)
- [External Knowledge Augmented Polyphone Disambiguation (LLM)](https://arxiv.org/html/2312.11920)

### Educational Resources
- [Understanding Polyphones (DigMandarin)](https://www.digmandarin.com/duo-yin-zi-polyphones-chinese-characters.html)
- [Polyphone Guide (MandarinWOW)](https://mandarinwow.wordpress.com/2021/10/05/polyphone-多音字/)
- [Ultimate Guide to Zhuyin (Speechling)](https://speechling.com/blog/the-ultimate-guide-to-zhuyin-bopomofo-and-how-to-learn-it/)

### Learning Apps Analysis
- [Best Apps to Learn Chinese (FluentU)](https://www.fluentu.com/blog/chinese/best-apps-to-learn-mandarin-chinese/)
- [42 Best Chinese Learning Apps (Joy of Chinese)](https://joyofchinese.com/apps-to-learn-chinese/)
- [Top 7 Free Apps (Nihao Ma)](https://nihaoma-mandarin.com/pedagogy-corner/top-7-free-apps-to-learn-chinese/)

### Technical Resources
- [pinyin_data GitHub](https://github.com/xiaohk/pinyin_data)
- [cedict_utils Python Parser](https://github.com/marcanuy/cedict_utils)
- [go-cc-cedict Parser](https://github.com/purohit/go-cc-cedict)
- [PinYin-Zhuyin Equivalence (UMD)](https://user.eng.umd.edu/~nSw/chinese/pinyin.htm)

---

**Research completed:** December 9, 2025
**Next steps:** Apply recommendations to Hanzi Dojo dictionary migration
