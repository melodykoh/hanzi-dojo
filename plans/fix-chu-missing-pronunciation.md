# fix: Add missing 4th tone pronunciation for 處/处

## Problem

Character 處/处 shows 4th tone (ㄔㄨˋ) as a wrong answer in Drill A, but it's actually a valid pronunciation:

- **chǔ (3rd tone)** - verb: to deal with, get along with (相处, 处理)
- **chù (4th tone)** - noun: place, location, department (处所, 办事处, 好处)

The database only has the 3rd tone. The 4th tone is missing from `zhuyin_variants`.

## Solution

Add a migration to update 處/处 with both pronunciations using Pattern A structure.

## Implementation

### Migration: `supabase/migrations/014_chu_multi_pronunciation.sql`

```sql
-- Migration 014: Add multi-pronunciation for 處/处
-- Fixes: 4th tone showing as wrong answer in Drill A
-- Pattern A: Both pronunciations in zhuyin_variants with context words

UPDATE dictionary_entries
SET zhuyin_variants = '[
  {"pinyin":"chǔ","zhuyin":[["ㄔ","ㄨ","ˇ"]],"context_words":["相处","处理","处于","处境"],"meanings":["to deal with","to get along","to be in (a state)"]},
  {"pinyin":"chù","zhuyin":[["ㄔ","ㄨ","ˋ"]],"context_words":["处所","办事处","好处","到处"],"meanings":["place","location","department","benefit"]}
]'::jsonb
WHERE simp = '处';
```

## Acceptance Criteria

- [ ] Migration created and applied
- [ ] 處/处 has both pronunciations in `zhuyin_variants`
- [ ] Drill A for 處 no longer shows 4th tone as wrong option
- [ ] Verify in production after deploy

## Effort

~1 story point (single migration file)
