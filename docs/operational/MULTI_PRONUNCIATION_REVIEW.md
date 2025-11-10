# Multi-Pronunciation Characters Requiring Manual Review

**Date:** 2025-11-10  
**Status:** PENDING REVIEW  
**Priority:** HIGH  

## 📋 Overview

The dictionary audit identified **22 characters** with malformed multi-pronunciation data. These characters have multiple readings crammed into a single `zhuyin` array instead of using the proper `zhuyin_variants` structure.

**Impact:**
- AddItemForm doesn't show variant selection UI
- Users cannot choose the intended pronunciation
- Drills may use wrong pronunciation

---

## ✅ **Correct Structure Example** (着)

```json
{
  "simp": "着",
  "zhuyin": [["ㄓ","ㄠ","ˊ"]],  // Default pronunciation
  "zhuyin_variants": [
    {
      "zhuyin": [["ㄓ","ㄠ","ˊ"]],
      "pinyin": "zháo",
      "context_words": ["着急", "睡着"],
      "meanings": ["to touch", "to feel", "to be affected by"]
    },
    {
      "zhuyin": [["ㄓ","ㄨㄛ","ˊ"]],
      "pinyin": "zhuó",
      "context_words": ["着手", "着力"],
      "meanings": ["to wear", "to use", "to apply"]
    },
    {
      "zhuyin": [["","ㄓㄜ","˙"]],
      "pinyin": "zhe",
      "context_words": ["跟着", "看着"],
      "meanings": ["particle indicating continuous state"]
    }
  ]
}
```

---

## 🔴 **Malformed Characters (22 total)**

### High Priority (User Reported)

#### 1. **和 (and, peace, harmony)**
- **Current:** 5 syllables in main array: `[["ㄏ","ㄜ","ˊ"],["ㄏ","ㄜ","ˋ"],["ㄏ","ㄨㄛ","ˊ"],["ㄏ","ㄨㄛ","ˋ"],["ㄏ","ㄨ","ˊ"]]`
- **Expected:**
  - Default: hé (ㄏㄜˊ) - "and" (most common)
  - Variant 1: hè (ㄏㄜˋ) - "to respond", context: 和聲
  - Variant 2: huó (ㄏㄨㄛˊ) - "to mix", context: 和面
  - Variant 3: huò (ㄏㄨㄛˋ) - "to blend", context: 和藥
  - Variant 4: hú (ㄏㄨˊ) - "mahjong term", context: 和牌

---

### Other Affected Characters

#### 2. **乐 (happy, music)**
- **Current:** 4 syllables
- **Pronunciations:** lè (happy), yuè (music), yào, lào
- **Common contexts:** 快乐 (happy), 音乐 (music)

#### 3. **仔 (small, careful)**
- **Current:** 3 syllables  
- **Pronunciations:** zǐ, zǎi, zī
- **Common contexts:** 仔细 (careful), 靓仔 (handsome boy)

#### 4. **何 (what, how)**
- **Current:** 3 syllables
- **Pronunciations:** hé, hè, hē
- **Common contexts:** 何时 (when), 如何 (how)

#### 5. **单 (single, list)**
- **Current:** 3 syllables
- **Pronunciations:** dān, shàn, chán
- **Common contexts:** 单独 (alone), 单于 (Chanyu)

#### 6. **参 (participate, three)**
- **Current:** 4 syllables  
- **Pronunciations:** cān, shēn, cēn, sān
- **Common contexts:** 参加 (participate), 人参 (ginseng)

#### 7. **吗 (question particle)**
- **Current:** 3 syllables
- **Pronunciations:** ma, mǎ, má
- **Common contexts:** 好吗 (good?), 干吗 (what for?)

#### 8. **员 (member, personnel)**
- **Current:** 3 syllables
- **Pronunciations:** yuán, yún, yùn
- **Common contexts:** 员工 (staff), 人员 (personnel)

#### 9. **咱 (we, us)**
- **Current:** 3 syllables
- **Pronunciations:** zán, zá, zǎ
- **Common contexts:** 咱们 (we)

#### 10. **哪 (which, where)**
- **Current:** 4 syllables
- **Pronunciations:** nǎ, něi, na, né
- **Common contexts:** 哪里 (where), 哪个 (which)

#### 11. **啊 (exclamation)**
- **Current:** 5 syllables
- **Pronunciations:** a, á, ǎ, à, a (neutral)
- **Common contexts:** Various tones for different emotions

#### 12. **差 (differ, lack)**
- **Current:** 4 syllables
- **Pronunciations:** chà, chā, chāi, cī
- **Common contexts:** 差不多 (almost), 出差 (business trip)

#### 13. **当 (act as, appropriate)**
- **Current:** 3 syllables
- **Pronunciations:** dāng, dàng, dǎng
- **Common contexts:** 当时 (at that time), 上当 (be fooled)

#### 14. **折 (break, fold)**
- **Current:** 3 syllables
- **Pronunciations:** zhē, zhé, shé
- **Common contexts:** 折叠 (fold), 打折 (discount)

#### 15. **提 (carry, lift)**
- **Current:** 3 syllables
- **Pronunciations:** tí, dī, dǐ
- **Common contexts:** 提高 (improve), 提防 (beware)

#### 16. **数 (number, count)**
- **Current:** 3 syllables
- **Pronunciations:** shù, shǔ, shuò
- **Common contexts:** 数学 (math), 数不清 (countless)

#### 17. **漂 (float, bleach)**
- **Current:** 3 syllables
- **Pronunciations:** piāo, piǎo, piào
- **Common contexts:** 漂亮 (beautiful), 漂流 (drift)

#### 18. **空 (empty, sky)**
- **Current:** 3 syllables
- **Pronunciations:** kōng, kòng, kǒng
- **Common contexts:** 天空 (sky), 空闲 (free time)

#### 19. **累 (tired, accumulate)**
- **Current:** 3 syllables
- **Pronunciations:** lèi, lěi, léi
- **Common contexts:** 疲累 (tired), 累积 (accumulate)

#### 20. **胖 (fat)**
- **Current:** 3 syllables
- **Pronunciations:** pàng, pán, pàn
- **Common contexts:** 胖子 (fat person)

#### 21. **落 (fall, drop)**
- **Current:** 3 syllables
- **Pronunciations:** luò, là, lào
- **Common contexts:** 落下 (fall), 落后 (lag behind)

#### 22. **解 (untie, explain)**
- **Current:** 3 syllables
- **Pronunciations:** jiě, jiè, xiè
- **Common contexts:** 解决 (solve), 解释 (explain)

---

## 🛠️ **Manual Fix Process**

For each character above:

1. **Research common usage**
   - Which pronunciation is most common?
   - What are the typical context words for each reading?

2. **Restructure data:**
   ```sql
   UPDATE dictionary_entries
   SET 
     zhuyin = '[DEFAULT_READING]',
     zhuyin_variants = '[ARRAY_OF_VARIANTS]'
   WHERE simp = 'X';
   ```

3. **Test in AddItemForm:**
   - Variant selection UI should appear
   - Context words should help user choose

---

## 📅 **Action Items**

- [ ] Prioritize 和 (user reported, 5 variants)
- [ ] Research context words for each variant
- [ ] Create migration script for all 22 characters
- [ ] Test variant selection UI with fixed data
- [ ] Document any missing character (麼)

---

## 📚 **Resources**

- Pinyin-Zhuyin converter: `pinyin-zhuyin` npm package
- Context research: MDBG Chinese dictionary, Pleco
- Audit results: `scripts/dictionary-audit-results.json`
