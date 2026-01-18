# Drill Feature QA Checklist

**Purpose:** Prevention strategies for UI/UX and data model issues based on lessons learned from Drill C (Word Match) development.

**Created:** 2026-01-12
**Last Updated:** 2026-01-12

---

## Overview

This checklist addresses gaps identified during Drill C development where Playwright MCP testing did not catch:
- State-dependent rendering issues (cards reshuffling on state change)
- Visual design consistency between components
- Mobile-specific rendering behaviors
- Animation/transition issues
- Cross-pair validation (ambiguous matches in same round)

---

## Part 1: QA Checklist for Drill-Type Features

### Pre-Development Review

**UI/UX State Analysis:**
- [ ] List all UI states the drill can be in (loading, active, answered, complete, error)
- [ ] For each state transition, document what should change visually
- [ ] Identify what should NOT change during state transitions (stable elements)
- [ ] Document expected animation/transition behaviors with timing

**Data Flow Analysis:**
- [ ] Map data dependencies: What external data does the drill need?
- [ ] Identify which data should be fetched once vs. on each state change
- [ ] Document shuffle/randomization points and when they should (not) re-trigger
- [ ] List all derived state (computed from other state)

**Cross-Component Consistency:**
- [ ] Compare with existing drills (A, B) for consistent patterns
- [ ] Verify header/progress display compatibility
- [ ] Check feedback toast integration
- [ ] Confirm scoring display consistency

### Development Testing

**State Stability Tests (Manual):**
- [ ] **Option stability:** Select an option - do other options move/reshuffle?
- [ ] **Answer reveal:** When answer is revealed, do unrelated elements change?
- [ ] **Transition smoothness:** Animate to next question without visible jumps
- [ ] **Re-render test:** Parent component re-renders - does drill UI change unexpectedly?
- [ ] **StrictMode test:** Run in development mode (React.StrictMode) - double-render stable?

**Mobile-Specific Tests (Manual):**
- [ ] **Portrait orientation:** All elements visible without scrolling to critical actions
- [ ] **Landscape orientation:** Layout optimized, not just scaled portrait
- [ ] **Touch targets:** 44x44px minimum for all interactive elements
- [ ] **Pull-to-refresh:** Does scrolling trigger unintended browser refresh?
- [ ] **Keyboard appearance:** Does soft keyboard push content inappropriately?
- [ ] **Safe area:** Content avoids notch/home indicator on modern devices

**Animation/Transition Tests (Manual):**
- [ ] **Feedback timing:** Points display appears before auto-advancing
- [ ] **Victory/completion:** Celebratory animation plays fully before modal
- [ ] **Error states:** Error message animation doesn't interfere with retry
- [ ] **60fps check:** No janky animations during state changes
- [ ] **Reduced motion:** Respects `prefers-reduced-motion` system setting

**Visual Consistency Tests (Manual):**
- [ ] **Design system compliance:** Check against DESIGN_SYSTEM.md patterns
- [ ] **Typography:** All headers use `font-heading` (Bungee)
- [ ] **Button styles:** Correct ninja-button variants for action type
- [ ] **Color tokens:** Using ninja-* palette, not hardcoded colors
- [ ] **Spacing:** Consistent with existing drill layouts

### Playwright/Automated Testing Gaps

**What Playwright CAN test:**
- [ ] Element presence/absence
- [ ] Text content
- [ ] Click handlers fire
- [ ] Navigation works
- [ ] Form submissions

**What Playwright CANNOT reliably test (require manual verification):**
- [ ] Visual stability (elements not moving unexpectedly)
- [ ] Animation smoothness
- [ ] Design consistency (looks similar to other drills)
- [ ] Mobile touch behaviors
- [ ] Perceived performance

### Post-Development Review

**Code Review Checklist:**
- [ ] `useEffect` dependencies: Are there function references that could cause re-triggers?
- [ ] `useMemo`/`useCallback`: Is derived state properly memoized?
- [ ] Shuffle/random: Only called once per question, not on every render?
- [ ] State updates: Batch related updates to prevent intermediate renders?

**Integration Testing:**
- [ ] Does progress display show correct values? (especially if drill manages own queue)
- [ ] Do session stats (points, accuracy) update correctly?
- [ ] Does existing feedback system work with new drill?
- [ ] Can user switch between drills without state corruption?

---

## Part 2: Data Model Design Checklist for Language Learning Features

### Domain-Specific Validation

**Chinese Language Nuances:**
- [ ] **Multi-pronunciation characters (多音字):** Does model support context-dependent pronunciations?
- [ ] **Pronunciation-word alignment:** Are word pairs linked to specific pronunciations?
- [ ] **Traditional/Simplified variants:** Can same word have different forms?
- [ ] **Tone marks:** Does data include all tone information? Default tones handled?
- [ ] **Zhuyin structure:** Proper [initial, final, tone] tuple format?

**Cross-Entity Relationships:**
- [ ] **Word pairs ambiguity:** Can two words in same round create matching confusion?
  - Example: If round contains 七月 and 七夕, both start with 七
- [ ] **Duplicate detection:** What makes a record unique? Is constraint enforced in DB?
- [ ] **Orphan prevention:** What happens if referenced data is deleted?
- [ ] **Context dependency:** Does meaning depend on another field being set?

### Round Generation Validation

**Selection Constraints:**
- [ ] Document what makes items eligible for a round
- [ ] Identify exclusion rules (duplicate starting chars, ambiguous matches)
- [ ] Define minimum thresholds (e.g., 5 pairs minimum)
- [ ] Handle edge cases when threshold not met

**Ambiguity Prevention:**
- [ ] **Same-character collision:** Can two items in same round share a character?
- [ ] **Valid answer confusion:** Could user select wrong item and still be "right"?
- [ ] **Distractor quality:** Are wrong answers plausibly wrong (not obviously fake)?

### Schema Design Checklist

**Before Creating Tables:**
- [ ] **UNIQUE constraints:** What combinations must be unique?
- [ ] **NOT NULL constraints:** Which fields are truly required?
- [ ] **Foreign keys:** Are relationships enforced at DB level?
- [ ] **Cascading deletes:** What happens when parent records deleted?

**RPC/Query Security:**
- [ ] **Authorization check:** Does function verify user owns requested data?
- [ ] **search_path:** Set explicitly to prevent injection in SECURITY DEFINER functions
- [ ] **RLS alignment:** Does RPC behavior match RLS policies on underlying tables?

### Test Data Requirements

**Minimum Test Cases:**
- [ ] Single-pronunciation character (baseline)
- [ ] Multi-pronunciation character with locked reading
- [ ] Character with no pronunciation lock (legacy/null)
- [ ] Edge case: exactly at minimum threshold
- [ ] Edge case: one below minimum threshold
- [ ] Conflict case: potential ambiguity in same round

---

## Part 3: Requirements Gathering Questions for Chinese Language Features

### Pronunciation & Phonetics

1. **Multi-pronunciation handling:**
   - "Does this character have multiple readings? Which one should the child practice?"
   - "Should the app show all pronunciations or just the one the parent selected?"
   - "If a word uses a different pronunciation than saved, should it still appear?"

2. **Zhuyin display:**
   - "Should tone marks be shown or suppressed (first tone often hidden in Taiwan textbooks)?"
   - "Horizontal or vertical Zhuyin layout?"
   - "How should multi-syllable words display Zhuyin?"

3. **Context words:**
   - "What words demonstrate this pronunciation in context?"
   - "Are context words in Traditional or Simplified?"

### Matching & Drill Logic

4. **Ambiguity tolerance:**
   - "If two words share a character, can they appear in the same round?"
   - "How should the app handle if there's more than one 'correct' match?"
   - "What if the child's vocabulary creates impossible/ambiguous rounds?"

5. **Difficulty progression:**
   - "Should easier pairs come first?"
   - "How should previously-practiced pairs be prioritized?"
   - "What defines a 'struggling' pair for this drill type?"

6. **Eligibility criteria:**
   - "What characters must the child know before this drill is available?"
   - "Should any characters be excluded (incomplete data, etc.)?"
   - "Minimum vocabulary size to enable this drill?"

### Visual & UX

7. **Feedback timing:**
   - "How long should correct/wrong feedback display?"
   - "Should there be celebration animations?"
   - "What happens when the child gets it wrong twice?"

8. **Mobile considerations:**
   - "Will this be used on tablet or phone?"
   - "Portrait or landscape preference?"
   - "Touch target size requirements for the child's age?"

9. **Progress display:**
   - "How should progress be shown? (X/Y, percentage, progress bar?)"
   - "What stats matter for this drill type?"

### Data Model

10. **Uniqueness:**
    - "What makes a word pair unique? (Just the word, or word + characters + category?)"
    - "Can the same word appear multiple times with different meanings?"

11. **Sourcing:**
    - "Where does word pair data come from?"
    - "How do we verify pronunciation accuracy?"
    - "Should missing words be logged for future expansion?"

12. **Lifecycle:**
    - "Can word pairs be deleted? What happens to practice history?"
    - "How do we handle corrections to word pair data?"

---

## Part 4: Process Improvements

### During Plan Creation

1. **State diagram requirement:** Every drill plan must include a state diagram showing:
   - All possible UI states
   - Transition triggers between states
   - What data/display changes at each transition
   - What must remain stable during transitions

2. **Mobile-first design review:** Before coding, sketch/wireframe mobile portrait layout:
   - Verify all critical actions visible without scrolling
   - Check touch target sizes
   - Consider landscape as enhancement, not afterthought

3. **Data model review with domain expert:** For language features, review with someone who understands:
   - Multi-pronunciation nuances (多音字)
   - Traditional/Simplified relationships
   - Common learner confusion patterns

### During Development

4. **StrictMode testing mandate:** All drill components must be tested in React.StrictMode (development default) to catch re-render issues before they reach QA.

5. **Parent re-render test:** Before marking complete, simulate parent re-render and verify:
   - No visual changes to child component
   - No re-fetching of data
   - No reshuffling of options

6. **Design system compliance check:** Before PR, verify against DESIGN_SYSTEM.md:
   - Typography uses defined patterns
   - Buttons use correct variants
   - Colors from ninja-* palette only

### During Code Review

7. **useEffect dependency audit:** Every useEffect must have comment explaining:
   - Why these specific dependencies
   - Why function references (if any) are stable or intentionally unstable

8. **Memoization review:** Identify expensive computations and verify:
   - useMemo wraps derived state
   - useCallback wraps callbacks passed to children
   - Shuffle/random only in memoized value, not render body

9. **Cross-drill consistency check:** Compare new drill with Drills A/B for:
   - Header integration
   - Progress display
   - Feedback system
   - Scoring

### During QA

10. **State stability test protocol:** For every interactive component:
    - Click option, verify others don't move
    - Wait for feedback, verify layout stable
    - Advance to next, verify no flash of different content

11. **Mobile recording:** Record screen on actual device (not simulator) for:
    - Touch target verification
    - Animation smoothness
    - Pull-to-refresh behavior

12. **Edge case round generation:** Test with data that pushes boundaries:
    - Exactly at minimum threshold
    - Characters that create ambiguity
    - Mixed pronunciation locks

---

## Quick Reference: Red Flags to Watch For

### Code Red Flags
- `Math.random()` in render body (not memoized)
- Function in useEffect dependency array
- `key={Date.now()}` or `key={Math.random()}` (forces remount)
- State that should be derived but is stored separately

### Design Red Flags
- New drill looks different from existing drills
- Hardcoded colors instead of ninja-* tokens
- Touch targets under 44px
- Critical button requires scrolling on mobile

### Data Model Red Flags
- No UNIQUE constraint on natural key
- SECURITY DEFINER function without auth check
- Pronunciation data without context words
- Word pairs without pronunciation alignment

---

## Appendix: Lessons Learned from Drill C

### Issue 1: Cards Reshuffling on State Change
**Root cause:** `onError` function in useEffect dependency array. Parent re-render created new function reference, triggering useEffect re-run, which called shuffle again.
**Prevention:** Use useMemo for derived state, avoid function references in dependencies, or stabilize with useCallback.

### Issue 2: Progress Display "1/0"
**Root cause:** Drill C manages its own queue internally, but TrainingMode header reads `currentQueue.length` which is 0 for Drill C.
**Prevention:** Document queue management in plan, design header to handle drill-specific progress.

### Issue 3: Missing UNIQUE Constraint
**Root cause:** Schema created without considering what makes a word pair unique. ON CONFLICT clause ineffective.
**Prevention:** Always document uniqueness requirements in data model review.

### Issue 4: RPC Authorization Missing
**Root cause:** SECURITY DEFINER function didn't verify caller owns requested kid's data.
**Prevention:** Authorization check required in every RPC that takes kid_id parameter.

### Issue 5: Pronunciation-Word Pair Mismatch
**Root cause:** Word pairs seeded independently of pronunciation context. Multi-pronunciation characters could show words using wrong pronunciation.
**Prevention:** Pronunciation filtering in requirements, validate alignment before deployment.

---

**Document Owner:** Development Team
**Review Cycle:** After each drill feature implementation
