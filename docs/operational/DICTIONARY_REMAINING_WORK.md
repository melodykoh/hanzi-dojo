# Dictionary Quality - Remaining Work

**Date:** 2025-11-10  
**Status:** Deferred to Epic 8  
**Tracking:** 139 characters requiring research

---

## 📊 **Summary**

After Migration 010a, **139 characters** remain with multi-syllable data that needs resolution:

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| Known Multi-Pronunciation | 37 | HIGH | ✅ Completed (see `data/multi_pronunciation_epic8_auto.json`) |
| Ambiguous (2 syllables) | 102 | MEDIUM | ✅ Completed (auto-pattern migration 011c) |
| **Total** | **139** | - | Ready for Drill A guardrails |

> **Nov 22, 2025 Update:** Category 1 + Category 2 pronunciations are consolidated in `data/multi_pronunciation_epic8_auto.json`, and Migration `011c_dictionary_multi_pronunciations.sql` + `011d_pronunciation_rpc.sql` prepare the database/API for Drill A guardrails.

---

## ✅ **Completed in Migration 010a**

**Fixed:**
- ✅ 248 characters with empty tone marks
- ✅ 22 critical multi-pronunciation characters:
  - User-reported: 和 (5 variants)
  - High syllable count: 乐(4), 参(4), 哪(4), 啊(5)
  - Common usage: 仔, 何, 单, 吗, 员, 咱, 差, 当, 折, 提, 数, 漂, 空, 累, 胖, 落, 解
- ✅ Added missing character: 麼

---

## 📋 **Category 1: Known Multi-Pronunciation (37 chars)**

**Priority:** HIGH - These are confirmed multi-pronunciation in standard dictionaries

**Status (Nov 22, 2025):** ✅ Completed. All characters have Pattern A variants captured in `data/multi_pronunciation_epic8_auto.json` and applied via migration 011c.

### **Characters**
```
为, 传, 供, 便, 假, 几, 切, 划, 地, 场, 将, 干, 应, 弹, 扫, 把, 
担, 教, 更, 正, 没, 相, 省, 种, 系, 结, 给, 行, 觉, 角, 调, 
还, 都, 重, 量, 什
```

### **Sample Entries to Research**

#### **行 (xíng / háng)**
- **xíng (ㄒㄧㄥˊ)**: to walk, to do, OK
  - Context: 行走, 可行, 不行
- **háng (ㄏㄤˊ)**: row, line, profession
  - Context: 银行, 行业, 一行

#### **重 (zhòng / chóng)**
- **zhòng (ㄓㄨㄥˋ)**: heavy, important
  - Context: 重要, 体重, 重量
- **chóng (ㄔㄨㄥˊ)**: to repeat, again
  - Context: 重复, 重新, 重来

#### **还 (hái / huán)**
- **hái (ㄏㄞˊ)**: still, yet, even more
  - Context: 还有, 还是, 还好
- **huán (ㄏㄨㄢˊ)**: to return, to give back
  - Context: 还钱, 归还, 还书

### **Research Checklist**
For each character, document:
- [ ] All pronunciation variants (pinyin + zhuyin)
- [ ] 2-3 context words per variant
- [ ] English meanings
- [ ] Which pronunciation is most common (set as default)
- [ ] Any Taiwan-specific variants

### **Output Format**
```json
{
  "char": "行",
  "default": {
    "pinyin": "xíng",
    "zhuyin": [["ㄒ","ㄧㄥ","ˊ"]],
    "context_words": ["行走", "可行", "不行"],
    "meanings": ["to walk", "to do", "OK"]
  },
  "variants": [
    {
      "pinyin": "háng",
      "zhuyin": [["ㄏ","ㄤ","ˊ"]],
      "context_words": ["银行", "行业"],
      "meanings": ["row", "line", "profession"]
    }
  ]
}
```

---

## 📋 **Category 2: Ambiguous Cases (102 chars)**

**Priority:** MEDIUM - Need to determine if truly multi-pronunciation or data error

**Status (Nov 22, 2025):** ✅ Completed via automated triage + migration 011c. Use `rpc_get_entry_pronunciations` (migration 011d) to expose results to the app layer.

### **Characters**
```
且, 丽, 么, 乘, 于, 亚, 些, 亲, 仅, 从, 价, 任, 份, 休, 估, 体, 
信, 俩, 倒, 共, 其, 冒, 净, 凉, 别, 刷, 助, 化, 匙, 区, 占, 卡, 
压, 句, 可, 台, 号, 各, 合, 同, 否, 吧, 呀, 呢, 咖, 咳, 填, 夫, 
奇, 妻, 孙, 底, 度, 弄, 思, 愉, 戏, 打, 择, 拾, 据, 排, 散, 旁, 
景, 服, 条, 查, 校, 椅, 汗, 汤, 沙, 洗, 济, 父, 片, 甚, 疑, 研, 
硕, 票, 禁, 稍, 约, 肚, 胳, 膏, 苹, 被, 观, 论, 语, 谁, 责, 赚, 
趟, 趣, 跳, 钢
```

### **Research Process**

For each character:

**Step 1: Check Standard Dictionaries**
- MDBG Chinese Dictionary
- Taiwan MOE Dictionary
- Does it list multiple pronunciations?

**Step 2: Classify**
- **Multi-Pronunciation**: Has 2+ distinct readings with different meanings
- **Data Error**: Should be single pronunciation
- **Regional Variant**: Same meaning, different regional pronunciation
- **Archaic**: Has classical reading but not used in modern Chinese

**Step 3: Document Decision**
```json
{
  "char": "片",
  "classification": "multi-pronunciation",
  "reason": "MDBG lists piàn (slice) and piān (thin piece)",
  "action": "create_variants",
  "variants": [...]
}
```

or

```json
{
  "char": "且",
  "classification": "data-error",
  "reason": "Only one modern pronunciation (qiě), second is surname (rare)",
  "action": "fix_to_single",
  "correct_pronunciation": {
    "pinyin": "qiě",
    "zhuyin": [["ㄑ","ㄧㄝ","ˇ"]]
  }
}
```

### **Priority Samples to Check First**
These are likely true multi-pronunciation:
- **么**: mó / má (likely multi)
- **片**: piàn / piān (confirmed multi)
- **别**: bié / biè (likely multi)
- **倒**: dǎo / dào (confirmed multi)
- **禁**: jìn / jīn (confirmed multi)

---

## 🛠️ **Tools & Resources**

### **Dictionary Sources**
1. **MDBG**: https://www.mdbg.net/chinese/dictionary
2. **Taiwan MOE**: https://dict.revised.moe.edu.tw/
3. **Pleco**: iOS/Android app (most comprehensive)
4. **Wiktionary Chinese**: https://en.wiktionary.org/wiki/

### **Conversion Tools**
- `pinyin-zhuyin` npm package (already installed)
- `pinyin` npm package (already installed)

### **Verification Scripts**
```bash
# Check current state
node scripts/verify-multi-pronunciation-complete.js

# After research, generate migration
node scripts/generate-migration-from-json.js data/multi_pronunciation_category1.json
```

---

## 📅 **Recommended Schedule**

### **Phase 1: High-Value Quick Wins (Week 1-2)**
Focus on Category 1 characters that user is likely to encounter:
- 行, 重, 还, 为, 给, 都, 没, 教, 正 (9 most common)
- Estimated: 2-3 hours research + 1 hour implementation

### **Phase 2: Complete Category 1 (Week 3-4)**
Finish remaining 28 characters from Category 1
- Estimated: 4-5 hours research + 1 hour implementation

### **Phase 3: Triage Category 2 (Week 5-6)**
Classify all 102 characters (multi vs error)
- Estimated: 6-8 hours research

### **Phase 4: Complete Category 2 (Week 7-8)**
Implement fixes for Category 2
- Estimated: 3-4 hours implementation

**Total Timeline:** 6-8 weeks part-time work

---

## 📈 **Progress Tracking**

### **Category 1 Progress**
- [x] 为 (wèi / wéi)
- [x] 传 (chuán / zhuàn)
- [x] 供 (gōng / gòng)
- [x] 便 (biàn / pián)
- [x] 假 (jiǎ / jià)
- [x] 几 (jǐ / jī)
- [x] 切 (qiē / qiè)
- [x] 划 (huá / huà)
- [x] 地 (dì / de)
- [x] 场 (chǎng / cháng)
- [x] 将 (jiāng / jiàng)
- [x] 干 (gān / gàn)
- [x] 应 (yīng / yìng)
- [x] 弹 (dàn / tán)
- [x] 扫 (sǎo / sào)
- [x] 把 (bǎ / bà)
- [x] 担 (dān / dàn)
- [x] 教 (jiāo / jiào)
- [x] 更 (gēng / gèng)
- [x] 正 (zhèng / zhēng)
- [x] 没 (méi / mò)
- [x] 相 (xiāng / xiàng)
- [x] 省 (shěng / xǐng)
- [x] 种 (zhǒng / zhòng)
- [x] 系 (xì / jì)
- [x] 结 (jié / jiē)
- [x] 给 (gěi / jǐ)
- [x] 行 (xíng / háng)
- [x] 觉 (jué / jiào)
- [x] 角 (jiǎo / jué)
- [x] 调 (tiáo / diào)
- [x] 还 (hái / huán)
- [x] 都 (dōu / dū)
- [x] 重 (zhòng / chóng)
- [x] 量 (liàng / liáng)
- [x] 什 (shí / shén)

**Progress:** 37 / 37 (100%)

### **Category 2 Progress**
**Triaged:** 102 / 102 (100%)  
**Fixed:** 102 / 102 (100%)

---

## 🎯 **Quick Reference**

**To start working on this:**
```bash
# 1. Review current state
cat scripts/triage-results.json

# 2. Pick characters to research from Category 1 list above

# 3. Research each character using MDBG/MOE/Pleco

# 4. Document findings in data/multi_pronunciation_category1.json

# 5. Generate migration
node scripts/generate-migration-from-json.js

# 6. Test and apply migration
```

---

**Last Updated:** 2025-11-22  
**Owner:** Project maintainer  
**Epic:** Epic 8 - Dictionary Quality Completion
