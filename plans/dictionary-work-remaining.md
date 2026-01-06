# Dictionary Enhancement Work - Complete Inventory

**Date:** 2025-12-06
**Purpose:** Clarify all remaining dictionary work and their relationships

---

## Summary Table

| Work Item | Characters | Issue | Priority | Effort |
|-----------|------------|-------|----------|--------|
| **Bug Fix: Malformed zhuyin** | 43+ chars | Merged pronunciations in main array | 🔴 HIGH | 10-12 hrs |
| **Curation: Empty context_words** | 101 chars | Have zhuyin_variants but no context words | 🟡 MEDIUM | 15-20 hrs |
| **Expansion: New multi-pronunciation** | 100+ chars | Not in dictionary as multi-pronunciation | 🟢 LOW | 15-20 hrs |

---

## 1. Bug Fix: Malformed Migration 009 Data (Phase 4)

**Problem:** 43+ characters have ALL pronunciations merged into main `zhuyin` array instead of using `zhuyin_variants`.

**Characters:**
```
同, 号, 呢, 旁, 洗, 冒, 乘, 难, 价, 饮, 丽, 队, 降, 期, 间, 且, 只,
干, 阿, 鲜, 几, 刷, 可, 拉, 系, 调, 都, 重, 量, 觉, 角, 还, 行,
结, 给, 相, 省, 种, 没, 正, 更, 教, 担
```

**Current state:**
```sql
-- WRONG: Two pronunciations merged in zhuyin
('只', '隻', '[["ㄓ","","ˉ"],["ㄓ","","ˇ"]]'::jsonb)
```

**Fix needed:**
- Split merged pronunciations
- Put primary in `zhuyin`, alternates in `zhuyin_variants`
- Research context words while fixing

**Status:** Plan ready at `plans/fix-malformed-migration009.md`

---

## 2. Curation: 101 Auto-Generated Characters (Epic 8.5)

**Problem:** These characters HAVE `zhuyin_variants` (from Migration 011c) but with EMPTY `context_words` arrays.

**Characters:**
```
干, 且, 丽, 么, 乘, 于, 亚, 些, 亲, 仅, 从, 价, 任, 份, 休, 估, 体,
信, 俩, 倒, 共, 其, 冒, 净, 凉, 别, 刷, 助, 化, 匙, 区, 占, 卡, 压,
句, 可, 台, 号, 各, 合, 同, 否, 吧, 呀, 呢, 咖, 咳, 填, 夫, 奇, 妻,
孙, 底, 度, 弄, 思, 愉, 戏, 打, 择, 拾, 据, 排, 散, 旁, 景, 服, 条,
查, 校, 椅, 汗, 汤, 沙, 洗, 济, 父, 片, 甚, 疑, 研, 硕, 票, 禁, 稍,
约, 肚, 胳, 膏, 苹, 被, 观, 论, 语, 谁, 责, 赚, 趟, 趣, 跳, 钢
```

**Current state:**
```sql
-- Has zhuyin_variants BUT empty context_words
zhuyin_variants = '[
  {"pinyin":"gān","zhuyin":[...],"context_words":[],"meanings":[...]},
  {"pinyin":"gàn","zhuyin":[...],"context_words":[],"meanings":[...]}
]'
```

**Fix needed:**
- Add 2-3 context words per pronunciation variant (**in Traditional Chinese**)
- Example: 干 → gān: ["乾淨", "乾燥"], gàn: ["幹活", "能幹"]

**UX Impact:** Multi-pronunciation modal works but shows no example words to help parent choose.

**Status:** Not started. Can be done incrementally based on user feedback.

---

## 3. Expansion: New Multi-Pronunciation Characters (Phase 3)

**Problem:** Common characters with multiple pronunciations are NOT in the current 136-character set.

**Category A - High Frequency (30 chars):**
```
好, 长, 得, 看, 分, 少, 石, 朝, 薄, 背, 曾, 磨, 难, 要,
处, 数, 发, 间, 过, 的, 觉, 差, 尽, 卷, 当, 空, 冲, 降, 似, 答
```

**Category B - Medium Frequency (50 chars):**
- HSK 5-6 level characters
- To be identified from dictionary research

**Category C - Edge Cases (20 chars):**
- Regional variants, archaic readings
- To be identified

**Current state:** These characters exist in dictionary but only have DEFAULT pronunciation. No `zhuyin_variants` at all.

**Fix needed:**
- Full research: identify all pronunciations
- Create Pattern A structure with context words (**in Traditional Chinese**)
- Add via new migration

**Status:** Plan exists at `docs/operational/EPIC_8_PHASE_3_EXPANSION.md`

---

## Overlap Analysis

**Important:** Some characters appear in multiple lists!

### Characters in BOTH "Malformed" AND "Auto-Generated":
```
干, 且, 丽, 乘, 冒, 价, 号, 同, 呢, 刷, 可, 旁, 洗, 降, 间, 期, 难
```

**What this means:**
- These have malformed main `zhuyin` (merged pronunciations)
- BUT also have `zhuyin_variants` from 011c (with empty context_words)
- Phase 4 fix will correct `zhuyin` AND should add context words at same time

### Characters ONLY in "Malformed" (already have curated 011b data):
```
系, 调, 都, 重, 量, 觉, 角, 还, 行, 结, 给, 相, 省, 种, 没, 正, 更, 教, 担
```

**What this means:**
- These have malformed main `zhuyin`
- BUT have GOOD `zhuyin_variants` from 011b (with context words)
- Phase 4 only needs to fix `zhuyin`, preserve existing variants

---

## Recommended Sequencing

```
1. Phase 4: Fix Malformed Data (43+ chars)     ← Do first (bug fix)
   └── Includes adding context words for overlapping chars
   └── 10-12 hours

2. Epic 8.5: Curate Empty Context Words        ← Do based on user feedback
   └── ~80 chars remaining after Phase 4 overlap is handled
   └── Can be done incrementally (10-20 chars at a time)
   └── 15-20 hours total

3. Phase 3: New Character Expansion            ← Do when users request
   └── 好, 长, 得, 看, 分, etc.
   └── 100+ new characters
   └── 15-20 hours
```

---

## Decision Points for User

1. **Phase 4 scope:** When fixing malformed chars, should we also add context words for the ones that overlap with 011c? (Saves rework later)

2. **Epic 8.5 priority:** Curate 101 empty context_words now, or wait for user feedback about which chars they're actually using?

3. **Phase 3 priority:** Start expansion to 好, 长, 得 now, or wait until Phase 4 + 8.5 complete?

---

## Quick Reference: What Each Migration Contains

| Migration | Characters | Has zhuyin_variants? | Has context_words? |
|-----------|------------|---------------------|-------------------|
| 010a | 22 critical | ✅ Yes | ✅ Yes |
| 011b | 35 curated | ✅ Yes | ✅ Yes |
| 011c | 101 auto-generated | ✅ Yes | ❌ Empty |
| 009 | 43+ malformed | ❌ Wrong structure | N/A |
| (future) 011e | Fix for 009 | ✅ Will add | ✅ Will add |
