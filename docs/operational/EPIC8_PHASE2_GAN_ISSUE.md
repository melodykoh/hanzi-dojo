# Epic 8 Phase 2: '干/幹/乾' Data Quality Issue

**Status:** 📋 DOCUMENTED - Awaiting Phase 2 Implementation
**Priority:** HIGH (affects 3 distinct HSK characters)
**Date Identified:** 2025-11-12 (Session 10)
**Discovered During:** Migration 011 deployment

---

## 🚨 Problem Summary

The database is **missing entries for two critical HSK characters**:
- **'幹'** (gàn) - "to do, to work" → simplifies to '干'
- **'乾'** (gān) - "dry" → simplifies to '干'

Instead, there is a single **malformed entry** that incorrectly combines both pronunciations:

```json
{
  "id": "189a5874-037f-4018-a8cc-d761a98371d9",
  "simp": "干",
  "trad": "干",
  "zhuyin": [["ㄍ","ㄢ","ˉ"], ["ㄍ","ㄢ","ˋ"]],  // Both gān and gàn mixed together
  "meanings": null,
  "zhuyin_variants": null
}
```

**Impact:**
- Users cannot add '幹' or '乾' as separate entries
- Dictionary lookup fails for these characters
- Parents cannot teach correct traditional forms

---

## 🔍 Root Cause Analysis

### Historical Context
The original dictionary seed likely came from a source that:
1. Used simplified Chinese as the primary key
2. Didn't preserve the distinction between '幹' and '乾'
3. Combined multiple traditional characters into one entry when they share the same simplified form

### Character Background

There are actually **three distinct traditional characters** that relate to '干':

1. **幹** (U+5E79)
   - Pinyin: gàn
   - Zhuyin: ㄍㄢˋ
   - Meanings: "to do", "to work", "capable", "trunk (of tree)"
   - Simplified to: **干**
   - HSK Level: 4
   - Common words: 幹活 (to work), 能幹 (capable), 幹嘛 (what are you doing?)

2. **乾** (U+4E7E)
   - Pinyin: gān
   - Zhuyin: ㄍㄢˉ
   - Meanings: "dry", "clean"
   - Simplified to: **干**
   - HSK Level: 3
   - Common words: 乾燥 (dry), 乾淨 (clean), 乾杯 (cheers/bottoms up)

3. **干** (U+5E72)
   - Pinyin: gān
   - Zhuyin: ㄍㄢˉ
   - Meanings: "shield", "to concern", "to offend"
   - Traditional = Simplified: **干**
   - HSK Level: N/A (rare, mostly used in classical Chinese)
   - Common words: 干涉 (to interfere), 干預 (to intervene)

### Database Reality Check

```bash
# Current state (as of 2025-11-12 backup):
SELECT simp, trad, zhuyin FROM dictionary_entries WHERE simp IN ('干', '幹', '乾') OR trad IN ('干', '幹', '乾');

Result:
simp | trad | zhuyin
-----|------|-------
干   | 干   | [["ㄍ","ㄢ","ˉ"],["ㄍ","ㄢ","ˋ"]]  ← MALFORMED ENTRY
```

**Expected state:**
```sql
simp | trad | zhuyin
-----|------|-------
干   | 幹   | [["ㄍ","ㄢ","ˋ"]]
干   | 乾   | [["ㄍ","ㄢ","ˉ"]]
干   | 干   | [["ㄍ","ㄢ","ˉ"]]  ← Optional, less common
```

---

## ✅ Recommended Solution

### Phase 2a: Data Cleanup (Migration 012)

**Step 1: Delete malformed entry**
```sql
-- Remove the combined entry
DELETE FROM dictionary_entries
WHERE simp = '干' AND trad = '干'
  AND id = '189a5874-037f-4018-a8cc-d761a98371d9';
```

**Step 2: Insert proper entries for '幹' and '乾'**
```sql
-- Entry 1: 幹 (to do, to work)
INSERT INTO dictionary_entries (simp, trad, zhuyin, zhuyin_variants, meanings, frequency_rank)
VALUES (
  '干',
  '幹',
  '[["ㄍ","ㄢ","ˋ"]]'::jsonb,
  '[]'::jsonb,
  '["to do", "to work", "capable", "trunk"]'::jsonb,
  1300
);

-- Entry 2: 乾 (dry)
INSERT INTO dictionary_entries (simp, trad, zhuyin, zhuyin_variants, meanings, frequency_rank)
VALUES (
  '干',
  '乾',
  '[["ㄍ","ㄢ","ˉ"]]'::jsonb,
  '[]'::jsonb,
  '["dry", "clean"]'::jsonb,
  1500
);

-- Entry 3: 干 (shield, to concern) - OPTIONAL
-- Only add if needed for comprehensive coverage
INSERT INTO dictionary_entries (simp, trad, zhuyin, zhuyin_variants, meanings, frequency_rank)
VALUES (
  '干',
  '干',
  '[["ㄍ","ㄢ","ˉ"]]'::jsonb,
  '[]'::jsonb,
  '["shield", "to concern", "to interfere"]'::jsonb,
  5000
);
```

**Step 3: Verify new entries**
```sql
-- Should return 2-3 entries
SELECT simp, trad, zhuyin, meanings
FROM dictionary_entries
WHERE simp = '干'
ORDER BY frequency_rank;
```

---

### Phase 2b: Add Multi-Pronunciation Variants (Migration 013)

After entries exist, add pronunciation variants if needed:

**For '幹' entry:**
```sql
-- If '幹' has alternate readings (research needed)
UPDATE dictionary_entries
SET zhuyin_variants = '[...]'::jsonb
WHERE simp = '干' AND trad = '幹';
```

**For '乾' entry:**
```sql
-- If '乾' has alternate readings (e.g., qián in some contexts)
UPDATE dictionary_entries
SET zhuyin_variants = '[...]'::jsonb
WHERE simp = '干' AND trad = '乾';
```

---

## 📋 Implementation Checklist

### Pre-Migration
- [ ] Research if '幹' or '乾' have additional pronunciations
  - Check MDBG: https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=幹
  - Check MDBG: https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=乾
- [ ] Verify frequency ranks (currently guessed as 1300/1500)
- [ ] Check if any user entries reference the old malformed entry
- [ ] Create backup: `node scripts/backup-dictionary.js`

### Migration 012: Data Cleanup
- [ ] Write migration script: `supabase/migrations/012_fix_gan_entries.sql`
- [ ] Include safety checks (verify old entry exists before deletion)
- [ ] Include verification queries (check 2-3 new entries created)
- [ ] Test locally: `psql < supabase/migrations/012_fix_gan_entries.sql`
- [ ] Review results
- [ ] Deploy to production via Supabase Dashboard

### Migration 013: Add Variants (if needed)
- [ ] Research complete pronunciation variants for '幹' and '乾'
- [ ] Generate migration using existing scripts
- [ ] Test and deploy

### Post-Migration
- [ ] Verify dictionary lookup for '幹' works
- [ ] Verify dictionary lookup for '乾' works
- [ ] Test AddItemForm with both characters
- [ ] Update Epic 8 tracking documents

---

## 🎯 Success Criteria

After implementation:
1. ✅ Database has 2-3 separate entries for '干', '幹', '乾'
2. ✅ Dictionary lookup returns correct entry for '幹' (simplified: '干', traditional: '幹')
3. ✅ Dictionary lookup returns correct entry for '乾' (simplified: '干', traditional: '乾')
4. ✅ Parents can add both '幹' and '乾' as separate practice entries
5. ✅ Traditional forms display correctly in training mode
6. ✅ No orphaned user entries referencing old malformed entry

---

## 📊 Related Work

### Migration 011 Status
- **Deployed:** ✅ 36/37 characters (excluding '干')
- **Characters covered:** 行, 重, 还, 为, 给, 都, 没, 教, 正, 更, 传, 供, 便, 假, 几, 切, 划, 地, 场, 将, 应, 弹, 扫, 把, 担, 相, 省, 种, 系, 结, 觉, 角, 调, 量, 什
- **Note:** '干' intentionally excluded pending Phase 2 cleanup

### Epic 8 Remaining Work
After fixing '干/幹/乾':
- Category 1: **COMPLETE** (all 37 characters resolved)
- Category 2: **102 characters** requiring triage (separate phase)

---

## 🔗 References

### Documentation
- **Epic 8 Overview:** `docs/operational/DICTIONARY_REMAINING_WORK.md`
- **Phase 1 Complete:** `docs/operational/EPIC8_PHASE1_COMPLETE.md`
- **Migration Guide:** `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`

### Data Files
- **Research data:** `data/multi_pronunciation_category1_complete.json` (includes '干' research)
- **Migration 011:** `supabase/migrations/011_dictionary_quality_category1_complete.sql`
- **Backup (pre-011):** `data/backups/dictionary_backup_pre_011_2025-11-12.json`

### Dictionary Sources
- **MDBG Dictionary:** https://www.mdbg.net/chinese/dictionary
- **Context Chinese Dictionary:** https://www.ctcdict.com
- **Arch Chinese:** https://www.archchinese.com

---

## 💡 Lessons Learned

### Data Quality Issues
1. **Simplified Chinese is not a unique key** - Multiple traditional characters can map to same simplified
2. **Zhuyin arrays mixing pronunciations** - Sign of merged entries
3. **Null meanings field** - Red flag for incomplete data

### Prevention Strategy
For future dictionary imports:
- Always use `(simp, trad)` as composite key
- Never merge entries with same simplified but different traditional
- Validate that zhuyin array matches single pronunciation
- Require meanings field to be populated

---

**Next Steps:** Execute Phase 2a (Migration 012) to add proper '幹' and '乾' entries

**Prepared by:** Claude (Session 10)
**Last Updated:** 2025-11-12
