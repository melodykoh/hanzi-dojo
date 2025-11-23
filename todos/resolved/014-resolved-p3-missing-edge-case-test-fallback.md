---
status: resolved
priority: p3
issue_id: "014"
tags: [testing, test-coverage, edge-cases, pr-17]
resolved_date: 2025-11-22
dependencies: []
---

# Missing Edge Case Test - Fallback Pronunciations Usage

## Problem Statement

The test suite doesn't cover the scenario where a character has so many valid pronunciations that they consume all confusion map space, forcing the system to use fallback pronunciations. This edge case is rare but important to verify that the drill builder doesn't fail when confusion maps are exhausted.

## Findings

- **Discovery:** Code review of PR #17 (Kieran TypeScript Reviewer)
- **Location:** `src/lib/drillBuilders.test.ts` (missing test case)
- **Impact:** Gap in test coverage for rare edge case
- **Current Coverage:** 25 tests, but missing fallback pronunciation scenario

**Missing Scenario:**
A character with 4+ valid pronunciations where:
1. All tone variants are valid alternates (can't use as distractors)
2. Initial consonant confusion variants are valid alternates
3. Final vowel confusion variants are valid alternates
4. System must fall back to FALLBACK_PRONUNCIATIONS array

**Why This Matters:**
- Fallback logic exists in code (lines 270-277, 431-458) but isn't tested
- No verification that fallback pronunciations are truly distinct
- Could fail silently if FALLBACK_PRONUNCIATIONS contains valid alternates

## Proposed Solutions

### Option 1: Add Comprehensive Edge Case Test (RECOMMENDED)

```typescript
// Add to src/lib/drillBuilders.test.ts

describe('Edge Cases - Fallback Pronunciations', () => {
  it('should use fallback pronunciations when valid pronunciations consume confusion space', () => {
    // Edge case: Character with 4+ valid pronunciations
    const baseReading = [['ㄉ', 'ㄜ', 'ˊ']]
    const manyVariants = [
      [['ㄉ', 'ㄜ', 'ˇ']],  // Valid alternate 1 (tone variant)
      [['ㄉ', 'ㄜ', 'ˋ']],  // Valid alternate 2 (tone variant)
      [['ㄊ', 'ㄜ', 'ˊ']],  // Valid alternate 3 (consumes initial confusion)
    ]

    const options = buildZhuyinOptions({ zhuyin: baseReading }, manyVariants)

    // Should still generate 4 options
    expect(options).toHaveLength(4)

    // Should not contain any valid variants as distractors
    const variantKeys = new Set([
      JSON.stringify(baseReading),
      ...manyVariants.map(v => JSON.stringify(v))
    ])

    const distractors = options.filter(opt => !opt.isCorrect)
    distractors.forEach(distractor => {
      expect(variantKeys.has(JSON.stringify(distractor.zhuyin))).toBe(false)
    })

    // At least one distractor should be from FALLBACK_PRONUNCIATIONS
    // (verifies fallback logic was triggered)
    const hasUnrelatedDistractor = distractors.some(opt =>
      opt.zhuyin[0][0] !== 'ㄉ' && opt.zhuyin[0][0] !== 'ㄊ'
    )
    expect(hasUnrelatedDistractor).toBe(true)
  })

  it('should handle character with all confusion map variants as valid alternates', () => {
    // Extreme edge case: All confusion map entries are valid pronunciations
    const baseReading = [['ㄓ', 'ㄠ', 'ˊ']]
    const exhaustiveVariants = [
      [['ㄓ', 'ㄠ', 'ˉ']],  // Tone variant 1
      [['ㄓ', 'ㄠ', 'ˇ']],  // Tone variant 2
      [['ㄓ', 'ㄠ', 'ˋ']],  // Tone variant 3
      [['ㄓ', 'ㄠ', '˙']],  // Tone variant 4
      [['ㄗ', 'ㄠ', 'ˊ']],  // Initial confusion variant 1
      [['ㄐ', 'ㄠ', 'ˊ']],  // Initial confusion variant 2
    ]

    const options = buildZhuyinOptions({ zhuyin: baseReading }, exhaustiveVariants)

    expect(options).toHaveLength(4)
    expect(options.filter(opt => opt.isCorrect)).toHaveLength(1)

    // All distractors must be from FALLBACK_PRONUNCIATIONS
    const distractors = options.filter(opt => !opt.isCorrect)
    expect(distractors.length).toBe(3)
  })

  it('should not duplicate fallback pronunciations as distractors', () => {
    // Verify FALLBACK_PRONUNCIATIONS are unique and don't appear multiple times
    const baseReading = [['ㄅ', 'ㄚ', 'ˊ']]
    const variants = [
      [['ㄅ', 'ㄚ', 'ˉ']],
      [['ㄅ', 'ㄚ', 'ˇ']],
      [['ㄅ', 'ㄚ', 'ˋ']],
    ]

    const options = buildZhuyinOptions({ zhuyin: baseReading }, variants)

    // All options should be unique
    const serialized = options.map(opt => JSON.stringify(opt.zhuyin))
    const unique = new Set(serialized)
    expect(unique.size).toBe(4)
  })
})
```

- **Pros:**
  - Verifies fallback logic works correctly
  - Tests rare edge case that could break in production
  - Ensures FALLBACK_PRONUNCIATIONS are truly distinct
- **Cons:** None
- **Effort:** Small (30 minutes)
- **Risk:** Low

### Option 2: Document Known Limitation

Add comment in code noting edge case isn't tested.

- **Pros:** Quick
- **Cons:** Doesn't verify behavior
- **Effort:** Small (5 minutes)
- **Risk:** Low (but doesn't prevent bugs)

## Recommended Action

Apply Option 1:
1. Add new describe block to `src/lib/drillBuilders.test.ts`
2. Implement 3 test cases for fallback pronunciation scenarios
3. Run tests to verify behavior: `npm test src/lib/drillBuilders.test.ts`
4. If tests fail, investigate fallback logic for bugs
5. Document expected behavior in test comments

## Technical Details

- **Affected Files:**
  - `src/lib/drillBuilders.test.ts` (add test cases)
- **Related Components:** Drill builders, confusion maps, fallback pronunciations
- **Database Changes:** No

## Resources

- Original finding: Code Review PR #17 - Kieran TypeScript Reviewer
- FALLBACK_PRONUNCIATIONS definition: `src/lib/drillBuilders.ts:270-277`
- Fallback usage: `src/lib/drillBuilders.ts:431-458`

## Acceptance Criteria

- [ ] New test describe block added: "Edge Cases - Fallback Pronunciations"
- [ ] Test case 1: Fallback used when confusion maps exhausted
- [ ] Test case 2: All confusion variants are valid alternates
- [ ] Test case 3: No duplicate fallback pronunciations
- [ ] All 3 new tests passing
- [ ] Test coverage for FALLBACK_PRONUNCIATIONS code path verified
- [ ] Total test count: 28 tests (25 existing + 3 new)

## Work Log

### 2025-11-22 - Initial Discovery
**By:** Claude Triage System (Kieran TypeScript Reviewer)
**Actions:**
- Issue discovered during comprehensive code review of PR #17
- Categorized as P3 NICE-TO-HAVE (test coverage improvement)
- Estimated effort: Small (30 minutes)
- Identified gap in edge case coverage

**Learnings:**
- Fallback pronunciation logic exists but isn't tested
- Edge case testing important for defensive code verification
- Test coverage should include rare but possible scenarios

## Notes

**Source:** Triage session on 2025-11-22 (PR #17 comprehensive review)

**Context:**
PR #17 introduces multi-pronunciation support which increases the likelihood of this edge case occurring. While rare (character would need 5+ valid pronunciations that exhaust all confusion map entries), it's worth testing to ensure graceful fallback.

**Real-World Example:**
Character '好' (hǎo/hào) has 2 main pronunciations. If both are valid AND their confusion variants are also valid alternates, fallback logic would trigger. This scenario becomes more likely as dictionary expands in Epic 8.

**Testing Priority:**
Low priority (P3) because:
- Edge case is rare in current 1,203 character dictionary
- Fallback logic is defensive (prevents crashes)
- System already handles this case (code exists)
- But worth testing to prevent future regressions
