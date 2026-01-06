# Epic 8 Comprehensive Dictionary Enhancement Plan

**Date Created:** 2025-12-06
**Status:** Ready for Review
**Type:** Bug Fix + Enhancement
**Total Estimated Effort:** 25-35 hours across 4 phases

---

## Executive Summary

Epic 8 addresses dictionary quality issues discovered during the Nov 2025 audit and subsequent user testing. The work spans **four phases** with clear dependencies:

| Phase | Focus | Priority | Story Points | Status |
|-------|-------|----------|--------------|--------|
| **Phase 1** | Fix empty tone marks (248 chars) | ✅ COMPLETE | 3 pts | Migration 010a deployed |
| **Phase 2** | Add zhuyin_variants (136 chars) | ✅ COMPLETE | 8 pts | PR #17 merged |
| **Phase 4** | Fix malformed Migration 009 data | 🔴 HIGH | 5 pts | Ready to start |
| **Phase 3** | Expand to 250+ multi-pronunciation chars | 🟢 Low | 15 pts | After Phase 4 |

**Key Insight:** Phase 4 (fixing Migration 009's malformed data) was discovered AFTER Phase 2 was complete. The current open PR #21 contains a **code workaround** for Phase 4's root cause, but the underlying dictionary data still needs fixing.

---

## Problem Statement

### Root Cause: Migration 009 Bug
Migration 009 (`009_expand_dictionary_hsk1-4.sql`) introduced 912 HSK 1-4 characters, but stored multi-pronunciation characters **incorrectly**:

```sql
-- WRONG (Migration 009 pattern for 43+ characters):
('只', '隻', '[["ㄓ","","ˉ"],["ㄓ","","ˇ"]]'::jsonb, 1265)
--            ^--- TWO pronunciations merged into main zhuyin array

-- CORRECT (Pattern A structure):
zhuyin: '[["ㄓ","","ˉ"]]'::jsonb,                  -- Primary ONLY
zhuyin_variants: '[...]'::jsonb                    -- Alternates with context
```

### User Impact
1. **Drill A shows merged readings** - "ㄓ ㄓˇ" instead of single "ㄓˉ"
2. **Valid alternates appear as wrong answers** - No guardrail for malformed data
3. **Confusing Add Item flow** - No multi-pronunciation selection UI

### Current State
- **PR #21 (open):** Code workaround that detects and splits malformed data at runtime
- **Database:** Still contains malformed data in 43+ characters
- **User entries:** 5 affected entries need their readings updated

---

## Dependency Graph

```
Migration 009 (source of bug)
         ↓
    ┌────┴────┐
    ↓         ↓
Phase 1    Phase 2
(tone marks)  (zhuyin_variants)
    ↓         ↓
    └────┬────┘
         ↓
      Phase 4              ← CURRENT PRIORITY
 (fix Migration 009 data)
         ↓
      Phase 3
 (expand to 250+ chars)
```

---

## Phase 4: Fix Malformed Dictionary Data (HIGH PRIORITY)

### Why This Phase First?
1. **Root cause fix** - PR #21's workaround is defensive but not ideal
2. **User experience** - 5 user entries currently have corrupted readings
3. **Foundation** - Phase 3 expansion depends on clean dictionary data
4. **Technical debt** - Every new affected character adds to the problem

### Scope: 43+ Malformed Characters

**Confirmed malformed (from Issue #20 diagnostic):**
```
同, 号, 呢, 旁, 洗, 冒, 乘, 难, 价, 饮, 丽, 队, 降, 期, 间, 且, 只,
干, 阿, 鲜, 几, 刷, 可, 拉, 系, 调, 都, 重, 量, 觉, 角, 还, 行,
结, 给, 相, 省, 种, 没, 正, 更, 教, 担
```

**Note:** Some of these (行, 重, 都, etc.) already have proper `zhuyin_variants` from Migration 011b. The fix will:
1. Correct the main `zhuyin` array to single pronunciation
2. Preserve existing `zhuyin_variants` where present
3. Add `zhuyin_variants` where missing

### Task Breakdown

#### Task 4.1: Audit & Research (2 pts, 4-6 hours)

**Objective:** For each malformed character, determine correct structure

**Deliverable:** `data/malformed_chars_phase4.json`

**Process:**
1. Run diagnostic script to identify all affected characters
2. Cross-reference with existing 011b data (avoid duplicating work)
3. Research remaining characters using MDBG/Taiwan MOE
4. Document in JSON format with Pattern A structure

**Research Template:**
```json
{
  "char": "只",
  "simp": "只",
  "trad": "隻",
  "current_zhuyin": "[[\\"ㄓ\\",\\"\\",\\"ˉ\\"],[\\"ㄓ\\",\\"\\",\\"ˇ\\"]]",
  "fix": {
    "primary_zhuyin": "[[\\"ㄓ\\",\\"\\",\\"ˉ\\"]]",
    "zhuyin_variants": [
      {"pinyin": "zhī", "zhuyin": [["ㄓ","","ˉ"]], "context_words": ["一只猫"], "meanings": ["measure word"]},
      {"pinyin": "zhǐ", "zhuyin": [["ㄓ","","ˇ"]], "context_words": ["只是","只有"], "meanings": ["only"]}
    ]
  },
  "has_011b_variants": false,
  "research_source": "MDBG"
}
```

#### Task 4.2: Generate Migration 011e (1 pt, 1-2 hours)

**File:** `supabase/migrations/011e_fix_malformed_zhuyin.sql`

**Migration Structure:**
```sql
-- Phase 4: Fix Migration 009 malformed multi-pronunciation data
-- Issue #20: https://github.com/melodykoh/hanzi-dojo/issues/20

BEGIN;

-- STEP 1: Safety check - count affected characters
DO $$
DECLARE
  malformed_count INT;
BEGIN
  SELECT COUNT(*) INTO malformed_count
  FROM dictionary_entries
  WHERE length(simp) = 1
    AND jsonb_array_length(zhuyin) > 1
    AND simp IN ('只', '几', '刷', '可', '拉', /* ... */);

  RAISE NOTICE 'Found % malformed characters to fix', malformed_count;
END $$;

-- STEP 2: Fix each character (example for 只)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄓ","","ˉ"]]'::jsonb,
  zhuyin_variants = '[
    {"pinyin":"zhī","zhuyin":[["ㄓ","","ˉ"]],"context_words":["一只猫","两只手"],"meanings":["measure word"]},
    {"pinyin":"zhǐ","zhuyin":[["ㄓ","","ˇ"]],"context_words":["只是","只有"],"meanings":["only","merely"]}
  ]'::jsonb
WHERE simp = '只' AND length(simp) = 1;

-- ... repeat for all 43+ characters ...

-- STEP 3: Auto-fix affected user readings
UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e, dictionary_entries d
WHERE r.entry_id = e.id
  AND e.simp = d.simp
  AND e.simp IN ('只', '几', '刷', '可', '拉');

-- STEP 4: Verification
DO $$
DECLARE
  remaining_malformed INT;
BEGIN
  SELECT COUNT(*) INTO remaining_malformed
  FROM dictionary_entries
  WHERE length(simp) = 1
    AND jsonb_array_length(zhuyin) > 1;

  IF remaining_malformed > 0 THEN
    RAISE WARNING 'Still have % single-char entries with multi-syllable zhuyin', remaining_malformed;
  ELSE
    RAISE NOTICE 'All malformed entries fixed successfully';
  END IF;
END $$;

COMMIT;
```

#### Task 4.3: Test & Deploy (2 pts, 2-3 hours)

**Pre-deployment:**
1. Run migration on local Supabase
2. Verify all 43+ characters have single-syllable `zhuyin`
3. Test Add Item flow shows multi-pronunciation selection
4. Test Drill A displays single pronunciation per button
5. Verify user readings auto-updated

**Deployment:**
1. Create PR with migration
2. Run on Vercel preview
3. QA with affected characters
4. Merge to production
5. Monitor error logs for 24 hours

**Success Criteria:**
- [ ] All 43+ characters have single-syllable `zhuyin` array
- [ ] All characters have `zhuyin_variants` with Pattern A structure
- [ ] Add Item shows "Multiple Pronunciations Detected"
- [ ] Drill A displays single pronunciation per button
- [ ] 5 user entries auto-updated (no manual delete/re-add needed)
- [ ] Zero production errors after deployment

---

## Phase 3: Dictionary Expansion (LOW PRIORITY)

### Why After Phase 4?
- Clean dictionary foundation required
- Phase 4 establishes patterns for Phase 3
- User feedback may shift priorities

### Scope: Expand from 136 to 250+ Characters

**Target Characters:**
- **Category A (30 chars):** 好, 长, 得, 看, 分, 少, 石, 朝, 薄, 背, etc.
- **Category B (50 chars):** HSK 5-6 level characters
- **Category C (20 chars):** Edge cases, regional variants

### Task Breakdown

#### Phase 3.1 (6 pts): First 15 High-Frequency Characters
- Research: 好, 长, 得, 看, 分, 少, 石, 朝, 薄, 背, 曾, 磨, 难, 要, 处
- Migration 011f
- Timeline: Week 1-2 after Phase 4

#### Phase 3.2 (6 pts): Complete Category A + Start B
- 40 additional characters
- Migration 011g
- Timeline: Week 3-5

#### Phase 3.3 (3 pts): Finalize All Categories
- 45 remaining characters
- Migration 011h
- Final audit: 250+ characters
- Timeline: Week 6-8

**Full details:** See `docs/operational/EPIC_8_PHASE_3_EXPANSION.md`

---

## Open PR Analysis: PR #21

### Current State
PR #21 contains:
1. **4 regression tests** for Issue #20 (merged Zhuyin bug)
2. **Defensive code** in `practiceQueueService.ts` to split malformed data
3. **Documentation** for Phase 4 implementation

### Decision Point

**Option A: Merge PR #21, then do Phase 4 database work**
- Pros: Immediate user protection via code workaround
- Cons: Two separate changes, runtime overhead

**Option B: Combine PR #21 with Phase 4 migration**
- Pros: Single PR fixes root cause + code protection
- Cons: Larger PR, longer review cycle

**Recommended: Option A** (merge PR #21 now, Phase 4 as separate PR)
- Users get immediate protection
- Phase 4 research may take time
- Separates "quick fix" from "proper fix"

---

## 101 Auto-Generated Characters (Future Work)

### Context
Migration 011c added 101 characters with Pattern A structure but **empty `context_words` arrays**. These work but provide suboptimal UX.

### Decision Required
**Should Phase 4 also curate these 101 characters, or is that separate?**

| Option | Pros | Cons |
|--------|------|------|
| Include in Phase 4 | Comprehensive fix | Increases Phase 4 scope (5 pts → 10+ pts) |
| Separate Epic 8.5 | Focused Phase 4 | Technical debt remains longer |
| Defer to user feedback | Prioritize what users report | May never get done |

**Recommendation:** Keep Phase 4 focused on fixing malformed data. Create backlog item for 101 character curation based on user feedback.

---

## Sequencing Recommendation

```
WEEK 1
├── Merge PR #21 (code workaround + tests)
├── Run Migration 014 (处/處 fix from PR #19)
└── Start Phase 4.1 research (audit 43+ characters)

WEEK 2
├── Complete Phase 4.1 research
├── Generate Migration 011e
└── Test locally

WEEK 3
├── Create Phase 4 PR
├── QA in Vercel preview
├── Merge to production
└── Monitor 24-48 hours

WEEK 4+ (Optional)
├── Begin Phase 3.1 if user requests
├── OR prioritize other V1.1 features
└── Track 101-char curation in backlog
```

---

## Files to Create/Modify

### Phase 4 (Immediate)
- `data/malformed_chars_phase4.json` (research output)
- `supabase/migrations/011e_fix_malformed_zhuyin.sql`
- `docs/PROJECT_PLAN.md` (update Epic 8 status)
- `CLAUDE.md` (update current state)
- `SESSION_LOG.md` (session summary)

### Phase 3 (Later)
- `data/multi_pronunciation_phase3a.json` (15 chars)
- `data/multi_pronunciation_phase3b.json` (40 chars)
- `data/multi_pronunciation_phase3c.json` (45 chars)
- `supabase/migrations/011f_dictionary_expansion_phase3a.sql`
- `supabase/migrations/011g_dictionary_expansion_phase3b.sql`
- `supabase/migrations/011h_dictionary_expansion_phase3c.sql`

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Migration 011e breaks existing variants | Query to identify characters with BOTH malformed zhuyin AND existing variants |
| User readings not all auto-updated | Manual verification query, fallback to user notification |
| Phase 4 research takes longer than estimated | Start with highest-impact characters (user-reported 5 first) |
| Phase 3 deprioritized indefinitely | Create GitHub issue to track, revisit quarterly |

---

## Questions for User

1. **PR #21 Timing:** Merge the code workaround now, or wait for Phase 4 database fix?

2. **101 Character Curation:** Include in Phase 4 scope or defer?

3. **Phase 3 Timeline:** Start after Phase 4, or wait for explicit user request?

4. **Character Priority:** Are there specific characters your family encounters that should be prioritized?

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 4 | Malformed characters fixed | 43+ chars → 0 malformed |
| Phase 4 | User entries auto-updated | 5/5 fixed |
| Phase 4 | Production errors | 0 for 48 hours |
| Phase 3 | Multi-pronunciation coverage | 136 → 250+ chars |
| Phase 3 | All new chars have context words | 100% |

---

## References

### GitHub
- Issue #20: Double pronunciation bug
- Issue #18: Missing 4th tone for 处 (fixed, merged)
- Issue #22: Ninjago design system (unrelated)
- PR #21: Regression tests + code workaround (open)
- PR #19: 处 pronunciation fix (merged)
- PR #17: Epic 8 Phase 2 (merged)

### Documentation
- `docs/operational/EPIC_8_PHASE_3_EXPANSION.md` - Phase 3 & 4 details
- `docs/operational/DICTIONARY_REMAINING_WORK.md` - Phase 1 & 2 complete
- `docs/PROJECT_PLAN.md` - Epic 8 section
- `CLAUDE.md` - Current state and priorities

### Code
- `supabase/migrations/009_expand_dictionary_hsk1-4.sql` - Source of bug
- `supabase/migrations/011b_pattern_a_structure.sql` - Pattern A reference
- `scripts/check-affected-readings.cjs` - Diagnostic script
- `src/lib/practiceQueueService.ts` - Workaround code (PR #21)

---

**Plan Author:** Claude (Session 17)
**Last Updated:** 2025-12-06
**Next Action:** User decision on PR #21 + Phase 4 sequencing
