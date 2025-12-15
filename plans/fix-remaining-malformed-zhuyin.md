# Fix Remaining Malformed Zhuyin Characters

**Status:** ✅ IMPLEMENTED (Migration 016 ready)
**Reviewer consensus:** Migration-only fix (delete Phases 2-3)

---

## Problem

**68 characters** (not 11 as initially thought) have malformed `zhuyin` field containing multiple pronunciations merged:

**Discovery:** Initial inspection found 11 characters (可, 几, 系, 调, 都, 重, 量, 觉, 角, 还, 行), but running the CHECK constraint revealed 57 additional characters.

**Full list of affected characters:**
化, 匙, 区, 占, 卡, 压, 句, 可, 台, 各, 合, 否, 吧, 呀, 咖, 咳, 填, 夫, 奇, 妻, 孙, 底, 度, 弄, 思, 愉, 戏, 打, 择, 拾, 排, 散, 景, 服, 条, 查, 校, 椅, 汗, 汤, 沙, 济, 父, 片, 甚, 疑, 研, 硕, 票, 禁, 稍, 约, 肚, 胳, 膏, 苹, 被, 观, 论, 语, 谁, 责, 赚, 趟, 趣, 跳, 钢

**Bug:** Drill A shows "ㄎㄜˇ ㄎㄜˋ" (merged) instead of "ㄎㄜˇ"
**Root Cause:** Migration 009 stored all pronunciations in main `zhuyin` field instead of `zhuyin_variants`
**Why PR #24 didn't catch them:** Only 43 characters were in the actual Migration 011e SQL, not the full list in PR description

---

## Fix: Migration 016

Single migration with:
1. Backup tables for safety
2. 68 UPDATE statements (one per character)
3. Cascade to user `readings` table
4. CHECK constraint to prevent future malformed data
5. Self-verification query

See: `supabase/migrations/016_fix_remaining_malformed_zhuyin.sql`

---

## Acceptance Criteria

- [ ] Migration 016 runs without errors
- [ ] Drill A shows single pronunciation for 可 (ㄎㄜˇ not "ㄎㄜˇ ㄎㄜˋ")
- [ ] CHECK constraint prevents future malformed data
- [ ] Existing regression tests pass (drillBuilders.test.ts:365-437)

---

## Post-Deployment Verification

```sql
-- Should return 0 rows
SELECT simp, trad, zhuyin
FROM dictionary_entries
WHERE char_length(simp) = 1
  AND jsonb_array_length(zhuyin) > 1;
```

Manual test: Practice Demo → Add character 可 → Drill A → Verify single pronunciation per button

---

## References

- Issue #20: Original bug report
- PR #24: Claimed to fix but missed characters
- PR #30: This fix
- Migration 011e: Pattern for safe dictionary updates

---

## Reviewer Feedback Applied

| Original Plan | Revised | Rationale (from reviewers) |
|---------------|---------|----------------------------|
| Phase 2: Integration Test | DELETED | Duplicates existing regression tests |
| Phase 3: Defensive Code | DELETED | console.warn causes false positives, no consumer |
| QA Process Improvements | DELETED | Process docs don't belong in fix plan |
| `length()` in verification | `char_length()` | length() counts bytes, not characters |
| No backups | Backup tables | Safety pattern from Migration 011e |
| No constraint | CHECK constraint | Prevents future corruption at DB level |
| 11 characters | 68 characters | CHECK constraint revealed full scope |

**Result:** Migration fixes all malformed single-character entries with one comprehensive migration
