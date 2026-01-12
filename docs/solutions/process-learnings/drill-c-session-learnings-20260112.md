---
date: 2026-01-12
problem_type: process_improvement
component: drill_c_word_match
symptoms:
  - UI bugs missed by Playwright MCP testing
  - Data model gaps not surfaced during design
  - Multi-pronunciation context not considered
  - Ambiguous word pair matching possible
root_cause: testing_gaps_and_domain_knowledge
severity: moderate
tags:
  - qa-process
  - data-modeling
  - chinese-language
  - playwright
  - multi-pronunciation
related_issues:
  - https://github.com/melodykoh/hanzi-dojo/issues/34
---

# Session Learnings: Drill C (Word Match) Development

## Overview

During the Drill C (Word Match) implementation (Sessions 22-23), multiple issues were discovered by manual user testing that should have been caught earlier. This document captures the learnings to compound our knowledge for future features.

**Two categories of gaps:**
1. **UI/UX Testing Gaps** - Playwright MCP testing missed visual and state-dependent issues
2. **Data Model Gaps** - Chinese language nuances not considered during design

---

## Part 1: UI/UX Testing Gaps

### Issues Found by User (Not Playwright)

| Issue | Root Cause | Why Playwright Missed It |
|-------|------------|-------------------------|
| Cards reshuffling mid-round | `onError` in useCallback deps caused re-fetch | Snapshot tests verify state, not state stability |
| Missing connecting lines | Feature not implemented | No visual spec verification tests |
| All cards green (wrong default) | CSS class logic error | Accessibility snapshot ignores color |
| Inconsistent column widths | No min-width constraint | Bounding box not compared across columns |
| "No items" flash on drill switch | Loading state race condition | Tests wait for final state, miss transient |
| SVG lines wrong on mobile | Coordinate calculation issue | Desktop-focused testing |

### What Playwright MCP CAN Test

- Element presence/absence
- Text content
- Accessibility tree structure
- Click handlers work
- Navigation flows
- Form submissions
- API call verification

### What Playwright MCP CANNOT Reliably Test

- **Visual stability**: Elements staying in place after state changes
- **Color/styling**: Computed styles, design token usage
- **Animation quality**: Smoothness, timing, reduced motion
- **Transient states**: Flash of incorrect content during loading
- **Mobile touch behavior**: Pull-to-refresh, gesture conflicts
- **Cross-element proportions**: Column width equality

### Required Manual Test Protocol for Drills

```markdown
## Manual QA Checklist (Add to every drill feature)

### State Stability (CRITICAL)
- [ ] Complete 3+ sequential correct answers
- [ ] Verify unselected options did NOT move/reshuffle
- [ ] Test with React StrictMode enabled (double-renders)

### Visual Consistency
- [ ] Compare side-by-side with existing drills (A, B)
- [ ] Verify design tokens used (ninja-green, not #22c55e)
- [ ] Check default state styling matches spec

### Mobile-Specific
- [ ] Test on actual device (not just viewport resize)
- [ ] Portrait AND landscape orientations
- [ ] Pull-to-refresh doesn't interfere
- [ ] Touch targets >= 44px

### Transition States
- [ ] Switch between drills rapidly
- [ ] Verify no error/empty flashes
- [ ] Loading skeleton appears (not blank)
```

### Code Review Checklist (Pre-QA)

```markdown
## useEffect Dependency Review
- [ ] No unstable references in deps (functions from props)
- [ ] Use refs for callbacks that shouldn't trigger re-runs
- [ ] Consider `isRoundActiveRef` pattern for preventing mid-action reloads

## Render Stability
- [ ] No Math.random() or Date.now() in render body
- [ ] Shuffle/randomization happens ONCE on load, not on re-render
- [ ] Array keys are stable (not index-based for reorderable lists)

## Design System Compliance
- [ ] Using Tailwind classes from design system
- [ ] Matches existing drill visual patterns
- [ ] Badge, border color, overlay patterns consistent
```

---

## Part 2: Data Model Gaps

### Gap 1: Ambiguous Word Pairs in Same Round

**Problem:** Character like 太 could match multiple right-column characters (陽→太陽, 長→太長)

**Current Validation:**
```typescript
// Only checks char1 uniqueness
const usedChar1 = new Set<string>()
for (const pair of shuffled) {
  if (!usedChar1.has(pair.char1)) { ... }
}
```

**Missing Validation:**
```typescript
// Should ALSO check char2 uniqueness
const usedChar1 = new Set<string>()
const usedChar2 = new Set<string>() // ADD THIS
for (const pair of shuffled) {
  if (!usedChar1.has(pair.char1) && !usedChar2.has(pair.char2)) { // MODIFY
    usedChar1.add(pair.char1)
    usedChar2.add(pair.char2) // ADD THIS
    ...
  }
}
```

**GitHub Issue:** #34

### Gap 2: Multi-Pronunciation Context Not Used

**Problem:** Characters like 著 have multiple pronunciations with context words:
- 著名 (famous) → zhuó (ㄓㄨㄛˊ)
- 著急 (anxious) → zháo (ㄓㄠˊ)
- 看著 (looking at) → zhe (ㄓㄜ˙)

**Current Behavior:** Shows default pronunciation regardless of word context

**Data Structure Available (Not Used):**
```typescript
// In dictionary_entries.zhuyin_variants
{
  zhuyin: [["ㄓㄠˊ"]],
  context_words: ["著急", "著火"]  // <-- This tells us which pronunciation!
}
```

**Required Fix:** RPC should search `zhuyin_variants[].context_words` to find the word, then return that variant's zhuyin.

### Data Model Design Checklist (Chinese Language Features)

```markdown
## Pre-Design Questions

### Multi-Pronunciation
- [ ] Does this feature display characters with multiple readings?
- [ ] How will the correct reading be determined for display?
- [ ] Is `zhuyin_variants.context_words` sufficient for resolution?

### Context Dependency
- [ ] Is meaning/pronunciation context-dependent?
- [ ] Where is context stored in the schema?
- [ ] Does the RPC/query resolve context correctly?

### Matching/Pairing Features
- [ ] What defines a "correct" match?
- [ ] Could alternative valid matches exist in same round?
- [ ] What uniqueness constraints prevent ambiguity?

### Round Generation
- [ ] What makes each option unique?
- [ ] Are BOTH sides of a pair constrained (not just one)?
- [ ] Is there a validation step for generated rounds?
```

---

## Part 3: Requirements Questions for Chinese Language Features

Ask these questions BEFORE designing any Chinese language learning feature:

### Pronunciation Display
1. "Should pronunciation match the word context or show default?"
2. "How should multi-pronunciation characters (多音字) be handled?"
3. "Should we show all pronunciations or just the contextual one?"

### Matching/Pairing Logic
4. "In a matching exercise, should there be exactly one valid answer?"
5. "What happens if a character could validly pair with multiple options?"
6. "Should we validate rounds for ambiguity before presenting?"

### Data Model
7. "Is pronunciation stored with the word pair, or resolved at query time?"
8. "What uniqueness constraints exist on the data?"
9. "How does this feature interact with existing `zhuyin_variants` structure?"

### Edge Cases
10. "What if a word pair uses a rare pronunciation not in variants?"
11. "Should we filter out pairs that can't be unambiguously displayed?"
12. "How do we handle characters not yet in the dictionary?"

---

## Part 4: Process Improvements

### During Plan Review

- [ ] Require state diagram showing all UI states and transitions
- [ ] Require mobile wireframes (not just desktop)
- [ ] For language features: domain expert review on pronunciation/matching logic

### During Development

- [ ] Test with React StrictMode enabled (catches unstable effects)
- [ ] Simulate parent re-renders (add console.log to spot unnecessary reloads)
- [ ] Compare visual output to existing drills BEFORE PR

### During Code Review

- [ ] Audit useEffect dependencies for stability
- [ ] Check for memoization of expensive computations
- [ ] Verify design system classes used (not raw colors)

### During QA

- [ ] Run state stability protocol (3+ actions, verify no reshuffling)
- [ ] Test on actual mobile device with screen recording
- [ ] Generate 10+ rounds to catch edge case combinations

---

## Appendix: Fixes Applied in This Session

### Fix 1: Prevent Mid-Round Card Reshuffling

```typescript
// Added ref to prevent reload during active round
const isRoundActiveRef = useRef(false)

// Stabilized onError callback with ref
const onErrorRef = useRef(onError)
useEffect(() => { onErrorRef.current = onError }, [onError])

const loadRound = useCallback(async () => {
  if (isRoundActiveRef.current) return // Guard against mid-round reload
  // ...
  isRoundActiveRef.current = true
}, [kidId]) // Removed onError from deps
```

### Fix 2: SVG Lines Hidden on Mobile

```typescript
<svg className="absolute inset-0 pointer-events-none hidden sm:block">
  {/* Lines only render on sm+ screens */}
</svg>
```

### Fix 3: Drill C Accuracy in Selection Modal

```typescript
const getProficiencyInfo = (drill: PracticeDrill) => {
  switch (drill) {
    case DRILLS.ZHUYIN: return recommendation.drillA
    case DRILLS.TRAD: return recommendation.drillB
    case DRILLS.WORD_MATCH: return recommendation.drillC // Added
  }
}
```

---

## Summary: Key Takeaways

1. **Playwright MCP is functional, not visual** - It verifies behavior but cannot catch design/stability issues
2. **Add manual test protocols** - Explicitly test state stability, mobile behavior, and visual consistency
3. **Chinese language features need domain review** - Multi-pronunciation handling must be designed explicitly
4. **Data model design must anticipate context** - Store or resolve context-specific variants, don't assume default works
5. **Round generation needs full uniqueness** - Both sides of matching pairs must be constrained

---

## Related Documentation

- [DRILL_C_WORD_MATCH_SPEC.md](/docs/DRILL_C_WORD_MATCH_SPEC.md) - Original feature spec
- [TECH_AND_LOGIC.md](/docs/TECH_AND_LOGIC.md) - Data model with `zhuyin_variants` structure
- [QA_MANUAL_ONLY.md](/docs/operational/QA_MANUAL_ONLY.md) - Manual testing checklist (to be updated)
- [GitHub Issue #34](https://github.com/melodykoh/hanzi-dojo/issues/34) - Ambiguous word pair prevention
