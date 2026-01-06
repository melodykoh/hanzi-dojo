# fix: Drill A mobile layout causes accidental pull-to-refresh on iPhone

## Problem Statement

On iPhone 15 (393×852px viewport), Drill A stacks 4 Zhuyin options **vertically** (1 column), requiring the child to scroll down to see all options and the "Next" button. When the child scrolls, they accidentally trigger iOS Safari's **pull-to-refresh** gesture, causing the page to reload and losing their practice session progress.

**User Report:** "Shrink the height of the drill so my son doesn't accidentally pull down and refresh the page when he is trying to scroll down. Maybe put the multiple choice options side by side (vs vertically stacking) like Drill B?"

**Device:** iPhone 15 (393×852px CSS viewport, ~759px usable after safe areas)

## Root Cause

| Drill | Current Layout | Mobile Behavior |
|-------|---------------|-----------------|
| **Drill A** (Zhuyin) | `grid-cols-1 sm:grid-cols-2` | 1 column on mobile → requires scrolling |
| **Drill B** (Traditional) | `grid-cols-2` | 2×2 grid on all sizes → no scrolling |

**File:** `src/components/PracticeCard.tsx`
- Line 198: Drill A uses `grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6`
- Line 289: Drill B uses `grid grid-cols-2 gap-4 mb-6`

## Proposed Solution

### 1. Unify Drill A layout with Drill B (2×2 grid)
```tsx
// BEFORE (Line 198):
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

// AFTER:
<div className="grid grid-cols-2 gap-4 mb-6">
```

### 2. Prevent pull-to-refresh with CSS
```css
/* Add to training mode container */
.training-mode {
  overscroll-behavior: none;
  touch-action: pan-y pinch-zoom;
}
```

### 3. Ensure content fits in viewport
- Verify all 4 options + Next button visible without scrolling
- Reduce gaps/padding if needed (current: `gap-4` = 16px)

## Acceptance Criteria

### Functional
- [ ] Drill A uses 2×2 grid on **all** screen sizes (no 1-column layout)
- [ ] Pull-to-refresh gesture disabled in training mode on iOS Safari
- [ ] All 4 options + Next button visible without scrolling on iPhone 15 portrait
- [ ] Practice Demo tab uses same 2×2 layout (consistency)

### Visual/UX
- [ ] Each button meets 44×44px minimum touch target (iOS HIG)
- [ ] Zhuyin text does not overflow or wrap in any option
- [ ] Grid maintains visual hierarchy (not cramped)

### Technical
- [ ] CSS changes scoped to PracticeCard/TrainingMode components
- [ ] Remove `sm:grid-cols-2` breakpoint (use `grid-cols-2` only)
- [ ] Existing 17+ component tests pass
- [ ] Manual test on physical iPhone 15

### Regression Prevention
- [ ] Drill B layout unchanged (already 2×2)
- [ ] Desktop/tablet experience unaffected
- [ ] Exit Training button accessible
- [ ] Familiarity scoring unaffected

## Files to Modify

| File | Change |
|------|--------|
| `src/components/PracticeCard.tsx` | Change Drill A grid from `grid-cols-1 sm:grid-cols-2` → `grid-cols-2` |
| `src/components/TrainingMode.tsx` | Add `overscroll-behavior: none` to container |
| `src/index.css` | (Optional) Add `.overscroll-none` utility if needed |

## Edge Cases to Test

1. **Long Zhuyin strings** (e.g., "ㄓㄨㄤˊ") - verify no text overflow
2. **Multi-pronunciation variants** with context words - verify fit
3. **Orientation change mid-drill** - verify layout reflows correctly
4. **iOS 14-15 browsers** - verify pull-to-refresh prevention works

## Viewport Math (iPhone 15 Portrait)

```
Screen height:        852px
- Status bar:         -59px (Dynamic Island)
- Home indicator:     -34px
= Usable height:      759px

Layout breakdown:
- Header/exit:         60px
- Character prompt:   100px
- 2×2 grid (2 rows):  180px (90px × 2)
- Grid gaps:           16px
- Next button:         60px
- Padding:             40px
= Total:              456px < 759px ✓ FITS
```

## Testing Plan

1. **Local dev** - Resize browser to 393×759px, verify no scroll
2. **iOS Simulator** - Test iPhone 15 portrait in Xcode simulator
3. **Physical device** - Deploy to Vercel preview, test on real iPhone 15
4. **Pull-to-refresh test** - Aggressively swipe down at top of training mode

## Related Issues

- **Epic 7.1.1** (PROJECT_PLAN.md): "Fix TrainingMode portrait/vertical mode layout issues"
- **CLAUDE.md Known Limitation**: "Mobile landscape: Next button requires scrolling after option selection"

## References

### Internal
- `src/components/PracticeCard.tsx:198` - Drill A grid class
- `src/components/PracticeCard.tsx:289` - Drill B grid class (reference)
- `docs/PROJECT_PLAN.md:430-434` - Epic 7.1.1 description

### External
- [MDN: overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
- [iOS HIG: Touch Targets](https://developer.apple.com/design/human-interface-guidelines/accessibility#Touch-targets)
- [Tailwind: Touch Action](https://tailwindcss.com/docs/touch-action)

## Estimated Effort

**2 story points** - Simple CSS changes with critical device testing
