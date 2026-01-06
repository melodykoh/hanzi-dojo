# P3-1: Test Coverage Gap for Detection Logic

**Status:** Pending
**Priority:** P3 (Low)
**Source:** PR #21 Code Review (Session 17)
**Created:** 2025-12-06

## Issue

The defensive logic for Migration 009 malformed data detection in `practiceQueueService.ts` doesn't have direct unit tests. Current tests only cover downstream effects via `drillBuilders.test.ts`.

## File Affected

- `src/lib/practiceQueueService.ts` (buildPronunciationList function)
- `src/lib/practiceQueueService.test.ts` (tests to add)

## Recommendation

Add unit tests specifically for `buildPronunciationList`:

```typescript
describe('buildPronunciationList', () => {
  it('should split malformed Migration 009 data (single char, multiple syllables)', () => {
    const primary = undefined
    const row = {
      entry_id: 'test-1',
      simp: '只',
      dictionary_zhuyin: [['ㄓ', '', 'ˉ'], ['ㄓ', '', 'ˇ']], // Malformed: merged
      dictionary_variants: null,
      manual_readings: null
    }

    const result = buildPronunciationList(primary, row)

    // Should split into two separate pronunciations
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual([['ㄓ', '', 'ˉ']])
    expect(result[1]).toEqual([['ㄓ', '', 'ˇ']])
  })

  it('should NOT split valid multi-syllable words', () => {
    const row = {
      entry_id: 'test-2',
      simp: '学校',
      dictionary_zhuyin: [['ㄒ', 'ㄩㄝ', 'ˊ'], ['ㄒ', 'ㄧㄠ', 'ˋ']], // Valid: 2-char word
      dictionary_variants: null,
      manual_readings: null
    }

    const result = buildPronunciationList(undefined, row)

    // Should keep as single pronunciation
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(2)
  })
})
```

## Acceptance Criteria

- [ ] Add test for malformed single-char data detection
- [ ] Add test confirming valid multi-char words are not split
- [ ] Add test for edge case: empty simp field
- [ ] Export buildPronunciationList (or test via integration)
