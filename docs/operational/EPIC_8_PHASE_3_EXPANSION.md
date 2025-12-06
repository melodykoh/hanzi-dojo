# Epic 8 Phases 3-4: Dictionary Quality & Expansion

**Date Created:** 2025-11-22
**Last Updated:** 2025-12-06
**Status:** Phase 4 HIGH PRIORITY, Phase 3 Low Priority
**Story Points:** Phase 4: 5 pts, Phase 3: 15 pts

---

## 📋 **Phase Summary**

| Phase | Scope | Priority | Status |
|-------|-------|----------|--------|
| **Phase 4** | Fix 43+ malformed dictionary entries (Migration 009 bug) | 🔴 HIGH | Ready to start |
| **Phase 3** | Expand multi-pronunciation to 250+ chars | 🟢 Low | Planned |

---

# Epic 8 Phase 4: Fix Malformed Dictionary Data (Migration 009)

**Date Added:** 2025-12-06
**Status:** Ready to implement
**Priority:** HIGH (blocking user experience)
**Story Points:** 5 pts
**GitHub Issue:** #20

---

## 🐛 **Problem Statement**

Migration 009 (`009_expand_dictionary_hsk1-4.sql`) incorrectly stores multi-pronunciation characters with ALL pronunciations merged into the main `zhuyin` array instead of using `zhuyin_variants`.

**Result:** Users who add these characters see merged options in Drill A (e.g., "ㄓ ㄓˇ" instead of single "ㄓˉ").

### Example of Malformed Data

```sql
-- WRONG (current state - 43+ characters):
('只', '隻', '[["ㄓ","","ˉ"],["ㄓ","","ˇ"]]'::jsonb, 1265)
--            ^--- Two pronunciations crammed into main array

-- CORRECT (Pattern A structure):
zhuyin: '[["ㄓ","","ˉ"]]'::jsonb,  -- Primary pronunciation only
zhuyin_variants: '[
  {"pinyin":"zhī","zhuyin":[["ㄓ","","ˉ"]],"context_words":["一只猫"]},
  {"pinyin":"zhǐ","zhuyin":[["ㄓ","","ˇ"]],"context_words":["只是","只有"]}
]'::jsonb
```

---

## 📊 **Affected Characters (43+ identified)**

### Confirmed Malformed (from diagnostic script)
```
同, 号, 呢, 旁, 洗, 冒, 乘, 难, 价, 饮, 丽, 队, 降, 期, 间, 且, 只,
干, 阿, 鲜, 几, 刷, 可, 拉, 系, 调, 都, 重, 量, 觉, 角, 还, 行,
结, 给, 相, 省, 种, 没, 正, 更, 教, 担
```

### User-Impacted Characters (confirmed via readings table)
| Character | User Selected | Correct Primary |
|-----------|---------------|-----------------|
| 几 | (merged) | jǐ (ㄐㄧˇ) |
| 刷 | (merged) | shuā (ㄕㄨㄚˉ) |
| 只 | (merged) | zhī (ㄓˉ) |
| 可 | (merged) | kě (ㄎㄜˇ) |
| 拉 | (merged) | lā (ㄌㄚˉ) |

---

## 🛠️ **Implementation Plan**

### Task 4.1: Research & Document (2 pts)

**For each of the 43+ characters, determine:**
1. Primary (default) pronunciation
2. Context words for primary (2-3 examples)
3. Alternate pronunciation(s)
4. Context words for alternates (2-3 each)
5. English meanings for each variant

**Research Sources:**
- MDBG: https://www.mdbg.net/chinese/dictionary
- Taiwan MOE: https://dict.revised.moe.edu.tw/
- Existing Migration 011b patterns (35 curated chars as reference)

**Output:** `data/malformed_chars_phase4.json`

**Format:**
```json
{
  "char": "只",
  "simp": "只",
  "trad": "隻",
  "default": {
    "pinyin": "zhī",
    "zhuyin": [["ㄓ", "", "ˉ"]],
    "context_words": ["一只猫", "两只手"],
    "meanings": ["measure word (animals, objects)"]
  },
  "variants": [
    {
      "pinyin": "zhǐ",
      "zhuyin": [["ㄓ", "", "ˇ"]],
      "context_words": ["只是", "只有", "只能"],
      "meanings": ["only", "merely", "just"]
    }
  ]
}
```

---

### Task 4.2: Generate Migration (1 pt)

**File:** `supabase/migrations/011e_fix_malformed_zhuyin.sql`

**Migration Pattern:**
```sql
-- Fix malformed character: 只
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄓ","","ˉ"]]'::jsonb,  -- Primary only
  zhuyin_variants = '[
    {"pinyin":"zhī","zhuyin":[["ㄓ","","ˉ"]],"context_words":["一只猫","两只手"],"meanings":["measure word"]},
    {"pinyin":"zhǐ","zhuyin":[["ㄓ","","ˇ"]],"context_words":["只是","只有"],"meanings":["only","merely"]}
  ]'::jsonb
WHERE simp = '只';
```

**Validation Query (post-migration):**
```sql
-- Verify no single-char entries have multi-syllable zhuyin
SELECT simp, jsonb_array_length(zhuyin) as syllable_count
FROM dictionary_entries
WHERE length(simp) = 1
  AND jsonb_array_length(zhuyin) > 1;
-- Expected: 0 rows
```

---

### Task 4.3: Test & Deploy (2 pts)

1. Run migration on staging
2. Verify affected characters show correct behavior in Add Item flow
3. Test Drill A option generation (no merged readings)
4. **Auto-fix existing user readings** (see SQL below)
5. Deploy to production

**Auto-fix User Readings (include in migration):**
```sql
-- After fixing dictionary, update existing user readings to match
-- This eliminates need for users to delete/re-add affected characters
UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e, dictionary_entries d
WHERE r.entry_id = e.id
  AND e.simp = d.simp
  AND e.simp IN ('只', '几', '刷', '可', '拉');
```

**Success Criteria:**
- [ ] All 43+ characters have single-syllable `zhuyin` array
- [ ] `zhuyin_variants` populated with Pattern A structure
- [ ] Add Item shows "Multiple Pronunciations Detected" for these chars
- [ ] Drill A displays single pronunciation per button
- [ ] Existing user entries auto-updated (no manual re-add needed)

---

## 📅 **Timeline**

| Task | Effort | Dependencies |
|------|--------|--------------|
| Task 4.1: Research | 4-6 hours | None |
| Task 4.2: Migration | 1 hour | Task 4.1 |
| Task 4.3: Test/Deploy | 2 hours | Task 4.2 |
| **Total** | **7-9 hours** | |

---

## 🔗 **References**

- **Bug Report:** GitHub Issue #20
- **Bug Fix (code):** `plans/fix-double-pronunciation-bug.md`
- **Diagnostic Script:** `scripts/check-affected-readings.cjs`
- **Pattern A Reference:** Migration 011b (35 curated chars)
- **Source of Bug:** Migration 009 (`009_expand_dictionary_hsk1-4.sql`)

---

# Epic 8 Phase 3: Dictionary Expansion Beyond 136 Characters

**Date Created:** 2025-11-22
**Status:** Planned (after Phase 4)
**Priority:** Low (V1.1+ enhancement)
**Story Points:** 15 pts (research-intensive)

---

## 📊 **Context**

### Current Coverage (After PR #17)
- **Total multi-pronunciation characters:** 136
  - Migration 011b (curated): 35 characters with Pattern A structure + context words ✅
  - Migration 011c (auto-generated): 101 characters with auto-generated data (needs curation) ⏳
- **Dictionary status:** 1,067 characters total, 136 with multi-pronunciation support

### Gap Analysis
Many common characters with multiple pronunciations are **NOT** in the current 136:
- 好 (hǎo/hào) - "good" vs. "to like"
- 长 (cháng/zhǎng) - "long" vs. "to grow"
- 得 (dé/de/děi) - "to get" vs. particle vs. "must"
- 看 (kàn/kān) - "to look" vs. "to watch over"
- 分 (fēn/fèn) - "to divide" vs. "portion"
- 少 (shǎo/shào) - "few" vs. surname
- And many more...

**User Impact:**
- Users adding these characters see only ONE pronunciation option
- No "Multiple Pronunciations Detected" section in Add Item flow
- Valid alternate pronunciations may appear as wrong answers in drills (no guardrail)

---

## 🎯 **Phase 3 Goal**

**Expand multi-pronunciation coverage from 136 to 250+ characters** by:
1. Identifying high-value multi-pronunciation characters beyond current scope
2. Researching context words and meanings for each variant
3. Creating Pattern A structure with curated data
4. Deploying in incremental migration waves

---

## 📋 **Scope - Three Categories**

### **Category A: High-Frequency Multi-Pronunciation (30 chars) - HIGH PRIORITY**

**Selection Criteria:**
- HSK 1-4 level (common in beginner/intermediate study)
- Confirmed multi-pronunciation in MDBG/Taiwan MOE dictionaries
- Distinct meanings (not just regional variants)
- User likely to encounter in daily practice

**Proposed Characters:**
```
好, 长, 得, 看, 分, 少, 石, 朝, 薄, 背, 曾, 磨, 难, 要,
处, 数, 发, 间, 过, 的, 觉, 差, 尽, 卷, 当, 空, 冲, 降, 似, 答
```

**Example Research Entry:**
```json
{
  "char": "好",
  "simp": "好",
  "trad": "好",
  "default": {
    "pinyin": "hǎo",
    "zhuyin": [["ㄏ","ㄠ","ˇ"]],
    "context_words": ["好吃", "很好", "好看"],
    "meanings": ["good", "well", "nice"]
  },
  "variants": [
    {
      "pinyin": "hào",
      "zhuyin": [["ㄏ","ㄠ","ˋ"]],
      "context_words": ["爱好", "喜好", "好奇"],
      "meanings": ["to like", "to be fond of", "hobby"]
    }
  ]
}
```

**Estimated Effort:** 5 hours research (30 chars × 10 min each)

---

### **Category B: Medium-Frequency Multi-Pronunciation (50 chars) - MEDIUM PRIORITY**

**Selection Criteria:**
- HSK 5-6 level or specialized vocabulary
- Less common but still encountered in authentic materials
- Clear pronunciation distinctions

**Sampling Strategy:**
- Review dictionary entries from HSK 5-6 lists
- Check MDBG for characters with multiple pinyin entries
- Prioritize characters appearing in existing user data (if analytics available)

**Estimated Effort:** 8 hours research (50 chars × 10 min each)

---

### **Category C: Edge Cases & Regional Variants (20 chars) - LOW PRIORITY**

**Selection Criteria:**
- Archaic pronunciations still used in specific contexts
- Taiwan-specific vs. Mainland-specific pronunciations
- Literary vs. colloquial readings

**Examples:**
- 血 (xuè/xiě) - "blood" (xuè common, xiě dialectal)
- 剥 (bāo/bō) - "to peel" (both common)
- 膀 (bǎng/páng) - different body parts

**Estimated Effort:** 3 hours research (20 chars × 9 min each)

---

## 🛠️ **Implementation Phases**

### **Phase 3.1: Category A Quick Wins (Week 1-2)**
**Points:** 6 pts

**Tasks:**
1. Research first 15 high-frequency characters (好, 长, 得, 看, 分, 少, 石, 朝, 薄, 背, 曾, 磨, 难, 要, 处)
2. Create `data/multi_pronunciation_phase3a.json` with Pattern A structure
3. Generate Migration 011e with these 15 characters
4. Test in staging: verify "Multiple Pronunciations Detected" appears
5. Deploy to production
6. User feedback collection

**Deliverables:**
- `data/multi_pronunciation_phase3a.json` (15 characters)
- `supabase/migrations/011e_dictionary_expansion_phase3a.sql`
- QA report documenting Add Item flow improvements

**Success Metrics:**
- All 15 characters show multi-pronunciation selection in Add Item
- Context words appear for each variant
- Drill A guardrails exclude valid alternates

---

### **Phase 3.2: Complete Category A + Start B (Week 3-5)**
**Points:** 6 pts

**Tasks:**
1. Research remaining 15 Category A characters
2. Research first 25 Category B characters
3. Create Migration 011f with combined 40 characters
4. Deploy incrementally
5. Monitor for any drill generation issues

**Deliverables:**
- `data/multi_pronunciation_phase3b.json` (40 characters total)
- `supabase/migrations/011f_dictionary_expansion_phase3b.sql`

---

### **Phase 3.3: Complete B & C, Finalize (Week 6-8)**
**Points:** 3 pts

**Tasks:**
1. Research remaining 25 Category B + all 20 Category C characters
2. Create final Migration 011g
3. Comprehensive dictionary audit
4. Update documentation with 250+ character coverage
5. Mark Epic 8 Phase 3 complete

**Deliverables:**
- `data/multi_pronunciation_phase3c.json` (45 characters)
- `supabase/migrations/011g_dictionary_expansion_phase3c.sql`
- Final audit report: 250+ multi-pronunciation characters verified

---

## 📈 **Research Methodology**

### **Step 1: Character Identification**

**Sources:**
- HSK vocabulary lists (levels 1-6)
- Taiwan MOE Dictionary multi-pronunciation index
- MDBG Chinese Dictionary search results
- User-reported feedback (if available)

**Selection Criteria:**
```
✅ Has 2+ distinct pronunciations with different meanings
✅ Not already in Migrations 011b or 011c
✅ Common enough for HSK 1-6 learners
✅ Clear pronunciation distinction (not just tone variants of same syllable)
❌ Skip: Regional variants with identical meanings
❌ Skip: Archaic pronunciations no longer used
```

---

### **Step 2: Research Each Character**

**For each selected character, document:**

1. **All Pronunciation Variants**
   - Pinyin (e.g., hǎo, hào)
   - Zhuyin syllable array (e.g., [["ㄏ","ㄠ","ˇ"]])
   - Tone markers must be accurate

2. **Context Words (2-3 per variant)**
   - Prioritize HSK vocabulary
   - Use words that clearly demonstrate the pronunciation
   - Example: 好吃 (hǎo chī) vs. 爱好 (ài hào)

3. **English Meanings**
   - Concise, beginner-friendly
   - Distinguish variants clearly
   - Example: "good" vs. "to like"

4. **Default Pronunciation**
   - Most common usage should be default
   - Appears first in `zhuyin_variants` array (Pattern A)
   - Example: 好 → hǎo is default (more common than hào)

**Research Tools:**
- MDBG: https://www.mdbg.net/chinese/dictionary
- Taiwan MOE: https://dict.revised.moe.edu.tw/
- Pleco app (comprehensive, offline-capable)
- Wiktionary Chinese: https://en.wiktionary.org/

**Output Format (Pattern A):**
```json
{
  "char": "长",
  "simp": "长",
  "trad": "長",
  "default": {
    "pinyin": "cháng",
    "zhuyin": [["ㄔ","ㄤ","ˊ"]],
    "context_words": ["很长", "长度", "长短"],
    "meanings": ["long", "length"]
  },
  "variants": [
    {
      "pinyin": "zhǎng",
      "zhuyin": [["ㄓ","ㄤ","ˇ"]],
      "context_words": ["成长", "长大", "生长"],
      "meanings": ["to grow", "to increase", "elder"]
    }
  ]
}
```

---

### **Step 3: Quality Verification**

**Before finalizing migration:**

**Checklist:**
- [ ] All characters have at least 2 variants
- [ ] Default pronunciation is first element in `zhuyin_variants`
- [ ] Each variant has 2-3 context words
- [ ] Context words use HSK 1-6 vocabulary (when possible)
- [ ] English meanings are distinct and beginner-friendly
- [ ] Tone markers are correct (ˉˊˇˋ˙)
- [ ] No duplicate characters across migrations
- [ ] Zhuyin syllable arrays follow 3-element structure: [initial, final, tone]

**Validation Script:**
```bash
# Run validation before migration
node scripts/validate-pronunciation-data.js data/multi_pronunciation_phase3a.json

# Expected output:
# ✅ 15 characters validated
# ✅ All variants have 2+ context words
# ✅ Pattern A structure verified
# ✅ No duplicates found
```

---

## 🎯 **Success Criteria**

**Phase 3 Complete When:**
- [ ] 100+ additional multi-pronunciation characters beyond initial 136
- [ ] All additions have Pattern A structure with curated context words
- [ ] Add Item flow shows "Multiple Pronunciations Detected" for all
- [ ] Drill A guardrails work correctly (no valid alternates as distractors)
- [ ] Dictionary audit shows 250+ multi-pronunciation characters
- [ ] Zero data errors or malformed entries
- [ ] User feedback confirms improved pronunciation selection experience

---

## 📊 **Progress Tracking**

### **Category A: High-Frequency (30 chars)**

**Phase 3.1 (15 chars):**
- [ ] 好 (hǎo / hào)
- [ ] 长 (cháng / zhǎng)
- [ ] 得 (dé / de / děi)
- [ ] 看 (kàn / kān)
- [ ] 分 (fēn / fèn)
- [ ] 少 (shǎo / shào)
- [ ] 石 (shí / dàn)
- [ ] 朝 (cháo / zhāo)
- [ ] 薄 (báo / bó)
- [ ] 背 (bèi / bēi)
- [ ] 曾 (céng / zēng)
- [ ] 磨 (mó / mò)
- [ ] 难 (nán / nàn)
- [ ] 要 (yào / yāo)
- [ ] 处 (chù / chǔ)

**Phase 3.2 (15 chars):**
- [ ] 数 (shù / shǔ / shuò)
- [ ] 发 (fā / fà)
- [ ] 间 (jiān / jiàn)
- [ ] 过 (guò / guō)
- [ ] 的 (de / dí / dì)
- [ ] 差 (chà / chā / chāi / cī)
- [ ] 尽 (jìn / jǐn)
- [ ] 卷 (juàn / juǎn)
- [ ] 当 (dāng / dàng)
- [ ] 空 (kōng / kòng)
- [ ] 冲 (chōng / chòng)
- [ ] 降 (jiàng / xiáng)
- [ ] 似 (sì / shì)
- [ ] 答 (dá / dā)
- [ ] 觉 (jué / jiào) - **Note:** Already in 011b? Check before adding

**Progress:** 0 / 30 (0%)

---

### **Category B: Medium-Frequency (50 chars)**
**Status:** Pending character selection from HSK 5-6 lists
**Progress:** 0 / 50 (0%)

---

### **Category C: Edge Cases (20 chars)**
**Status:** Pending triage
**Progress:** 0 / 20 (0%)

---

## 🔧 **Migration Generation Process**

### **Step-by-Step Guide**

**1. Create JSON data file:**
```bash
# Format: data/multi_pronunciation_phase3a.json
# Use Pattern A structure (default first in variants array)
```

**2. Generate migration:**
```bash
node scripts/generate-migration-from-json.js \
  data/multi_pronunciation_phase3a.json \
  supabase/migrations/011e_dictionary_expansion_phase3a.sql
```

**3. Verify migration safety:**
```bash
# Check for character conflicts with existing migrations
grep "WHERE simp = " supabase/migrations/011b*.sql > /tmp/011b_chars.txt
grep "WHERE simp = " supabase/migrations/011c*.sql > /tmp/011c_chars.txt
grep "WHERE simp = " supabase/migrations/011e*.sql > /tmp/011e_chars.txt

# Ensure no duplicates
sort /tmp/011b_chars.txt /tmp/011c_chars.txt /tmp/011e_chars.txt | uniq -d
# Expected: (empty output - no duplicates)
```

**4. Test in staging:**
```sql
-- Run migration on staging database
psql -h staging.supabase.co -U postgres -d hanzi_dojo \
  -f supabase/migrations/011e_dictionary_expansion_phase3a.sql

-- Verify data loaded correctly
SELECT simp, jsonb_array_length(zhuyin_variants) as variant_count
FROM dictionary_entries
WHERE simp = ANY(ARRAY['好','长','得','看','分']);

-- Expected: Each character has 2+ variants
```

**5. QA in Vercel preview:**
- Add each character in Add Item flow
- Verify "Multiple Pronunciations Detected" appears
- Select each variant and verify correct context words display
- Practice in Drill A - verify valid alternates excluded

**6. Deploy to production:**
```bash
# Merge PR with migration
git checkout main
git merge feature/epic8-phase3a
git push origin main

# Supabase auto-runs migration
```

---

## 📚 **Resources**

### **Dictionary APIs & Tools**

**MDBG API (if needed for batch lookup):**
```bash
# Example: Fetch all pronunciations for character
curl "https://www.mdbg.net/chinese/dictionary?wdqb=好"
```

**Pinyin-to-Zhuyin Conversion:**
```javascript
// Already available in project
import { convertPinyinToZhuyin } from '../lib/zhuyin'

const zhuyin = convertPinyinToZhuyin('hǎo')
// Returns: [['ㄏ','ㄠ','ˇ']]
```

**NPM Packages:**
- `pinyin` - Pinyin conversion (already installed)
- `pinyin-zhuyin` - Direct pinyin→zhuyin (if needed)

---

### **Reference Migrations**

**Pattern A Example (Migration 011b):**
```sql
-- Character: 行 (Manual curation with context words)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[
    {
      "pinyin":"xíng",
      "zhuyin":[["ㄒ","ㄧㄥ","ˊ"]],
      "context_words":["行走","可行","不行"],
      "meanings":["to walk","to do","OK"]
    },
    {
      "pinyin":"háng",
      "zhuyin":[["ㄏ","ㄤ","ˊ"]],
      "context_words":["银行","行业","一行"],
      "meanings":["row","line","profession"]
    }
  ]'::jsonb
WHERE simp = '行' AND trad = '行';
```

**Auto-Generated Example (Migration 011c):**
```sql
-- Character: 干 (Auto-generated, needs manual curation)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[
    {"pinyin":"gān","zhuyin":[["ㄍ","ㄢ","ˉ"]],"context_words":[],"meanings":["clean; neat"]},
    {"pinyin":"gàn","zhuyin":[["ㄍ","ㄢ","ˋ"]],"context_words":[],"meanings":["to do; to work"]}
  ]'::jsonb
WHERE simp = '干' AND trad = '干';
```

---

## 🚀 **Quick Start Guide**

**To begin Phase 3.1 work:**

```bash
# 1. Create research tracking file
touch data/multi_pronunciation_phase3a.json

# 2. Research first 5 characters (好, 长, 得, 看, 分)
# Use MDBG + Taiwan MOE dictionaries
# Document in JSON format (see example above)

# 3. Validate format
node scripts/validate-pronunciation-data.js data/multi_pronunciation_phase3a.json

# 4. Generate migration
node scripts/generate-migration-from-json.js \
  data/multi_pronunciation_phase3a.json \
  supabase/migrations/011e_dictionary_expansion_phase3a.sql

# 5. Create feature branch and test
git checkout -b feature/epic8-phase3a
# ... test in staging ...
# ... create PR ...
```

---

## ❓ **FAQ**

**Q: Why not include these characters in the original Epic 8?**
A: Epic 8 focused on the 139 characters identified in the Nov 2025 audit (malformed data requiring fixes). Phase 3 expands beyond that scope to add NEW multi-pronunciation characters not in the original audit.

**Q: How do we prioritize which characters to add?**
A: HSK level + frequency of use. HSK 1-4 characters get highest priority, followed by HSK 5-6, then edge cases.

**Q: Can users still add these characters before Phase 3?**
A: Yes! They'll just see the default pronunciation only (no multi-pronunciation selection). The character works fine, just missing the pronunciation guardrails.

**Q: What's the difference between Pattern A and auto-generated?**
A: Pattern A has curated context words and meanings. Auto-generated has empty `context_words` arrays and generic meanings from dictionary. Pattern A provides better UX in Add Item flow.

**Q: Should we curate the 101 auto-generated characters from 011c first, or add new characters?**
A: **User feedback will guide this.** If users are encountering the 101 characters (为, 什, 传, etc.) and finding the lack of context words confusing, prioritize curation. If they're requesting NEW characters (好, 长, 得), prioritize expansion.

---

**Last Updated:** 2025-11-22
**Owner:** Project maintainer
**Dependencies:** PR #17 must be merged (Migrations 011b, 011c, 011d deployed)
**Tracking:** Epic 8 Phase 3 in `docs/PROJECT_PLAN.md`
