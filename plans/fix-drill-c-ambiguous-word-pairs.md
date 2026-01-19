# Fix: Drill C Ambiguous Word Pairs

**Issue:** [#34](https://github.com/melodykoh/hanzi-dojo/issues/34)
**Effort:** ~25 lines of code + 2 tests

---

## Problem

During Word Match round generation, a character can form valid words with multiple options:

```
Left:  太, 電, 這, 然, 校
Right: 陽, 燈, 長, 後, 裡

太 → 陽 (太陽 sun) ✅ intended
太 → 長 (太長 too long) ⚠️ also valid - unfair if marked wrong!
```

## Root Cause

`generateRound()` only checks char1 uniqueness:

```typescript
// Current: wordPairService.ts:129-137
const usedChar1 = new Set<string>()
for (const pair of shuffled) {
  if (!usedChar1.has(pair.char1)) {  // ← Only checks char1
    usedChar1.add(pair.char1)
    selected.push(pair)
  }
}
```

**Two gaps:**
1. No char2 uniqueness check (duplicate right-column chars possible)
2. No cross-column conflict check (char1-A can form word with char2-B from different pair)

---

## Solution

Update `generateRound()` in `src/lib/wordPairService.ts`:

```typescript
/**
 * Build lookup Set for O(1) word pair existence checks
 */
function buildWordPairLookup(pairs: WordPairWithZhuyin[]): Set<string> {
  const lookup = new Set<string>()
  for (const pair of pairs) {
    lookup.add(`${pair.char1}|${pair.char2}`)
  }
  return lookup
}

/**
 * Check if adding a pair would create cross-column ambiguity
 */
function hasConflict(
  candidate: WordPairWithZhuyin,
  existingPairs: WordPairWithZhuyin[],
  wordPairLookup: Set<string>
): boolean {
  for (const existing of existingPairs) {
    // Can candidate.char1 form valid word with existing.char2?
    if (wordPairLookup.has(`${candidate.char1}|${existing.char2}`)) {
      return true
    }
    // Can existing.char1 form valid word with candidate.char2?
    if (wordPairLookup.has(`${existing.char1}|${candidate.char2}`)) {
      return true
    }
  }
  return false
}

export function generateRound(eligiblePairs: WordPairWithZhuyin[]): WordPairWithZhuyin[] {
  const shuffled = shuffle([...eligiblePairs])
  const selected: WordPairWithZhuyin[] = []
  const usedChar1 = new Set<string>()
  const usedChar2 = new Set<string>()  // NEW
  const wordPairLookup = buildWordPairLookup(eligiblePairs)  // NEW

  for (const pair of shuffled) {
    // Uniqueness checks
    if (usedChar1.has(pair.char1) || usedChar2.has(pair.char2)) continue  // MODIFIED

    // Cross-column conflict check
    if (hasConflict(pair, selected, wordPairLookup)) continue  // NEW

    usedChar1.add(pair.char1)
    usedChar2.add(pair.char2)  // NEW
    selected.push(pair)
    if (selected.length === MIN_PAIRS_FOR_ROUND) break
  }

  if (selected.length < MIN_PAIRS_FOR_ROUND) {
    throw new InsufficientPairsError(
      `Only found ${selected.length} non-conflicting pairs. Need ${MIN_PAIRS_FOR_ROUND}.`
    )
  }

  return selected
}
```

---

## Tests to Add

In `src/lib/wordPairService.test.ts`:

```typescript
// Test data with duplicate char2
const pairsWithDuplicateChar2 = [
  createMockPair('p1', '月亮', '月', '亮'),
  createMockPair('p2', '日亮', '日', '亮'),  // Same char2
  createMockPair('p3', '太陽', '太', '陽'),
  createMockPair('p4', '電燈', '電', '燈'),
  createMockPair('p5', '這裡', '這', '裡'),
  createMockPair('p6', '然後', '然', '後'),
  createMockPair('p7', '校園', '校', '園'),
]

// Test data with cross-column conflict
const pairsWithCrossConflict = [
  createMockPair('p1', '太陽', '太', '陽'),
  createMockPair('p2', '日長', '日', '長'),
  createMockPair('p3', '太長', '太', '長'),  // 太 can match both 陽 and 長!
  createMockPair('p4', '電燈', '電', '燈'),
  createMockPair('p5', '這裡', '這', '裡'),
  createMockPair('p6', '然後', '然', '後'),
  createMockPair('p7', '校園', '校', '園'),
]

it('should enforce unique char2 values', () => {
  const result = generateRound(pairsWithDuplicateChar2)
  const char2Values = result.map(p => p.char2)
  expect(new Set(char2Values).size).toBe(MIN_PAIRS_FOR_ROUND)
})

it('should prevent cross-column ambiguity', () => {
  for (let i = 0; i < 10; i++) {  // Run multiple times due to shuffle
    const result = generateRound(pairsWithCrossConflict)
    const lookup = new Set(result.map(p => `${p.char1}|${p.char2}`))

    // Verify each char1 has exactly one valid char2 in the round
    for (const pair of result) {
      const matches = result.filter(p => lookup.has(`${pair.char1}|${p.char2}`))
      expect(matches.length).toBe(1)
    }
  }
})
```

---

## Acceptance Criteria

- [ ] No duplicate char2 values in generated rounds
- [ ] No cross-column ambiguous matches possible
- [ ] InsufficientPairsError thrown if pool too small/conflicted
- [ ] All existing tests still pass
- [ ] Manual QA: Generate 10+ rounds, verify no ambiguity

---

## Manual QA

1. Launch training mode with Drill C
2. Play through 10+ rounds
3. Verify no character can validly match multiple options
4. Test with a kid who has limited character pool (edge case)

---

*~100 lines. Ship it.*
