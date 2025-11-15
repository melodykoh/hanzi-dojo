# Animation System Guide - Conflict Prevention

## Overview

This guide explains how to use Hanzi Dojo's animation system correctly to **prevent CSS animation property conflicts**.

## The Core Problem

**CSS only allows ONE `animation` property per element.**

If you apply multiple `.animate-*` classes to the same element, only the **LAST** one in the CSS cascade will work:

```tsx
// ❌ WRONG - Only animate-pulse-energy will work!
<div className="animate-spinjitzu animate-pulse-energy">
  This will ONLY pulse, NOT spin!
</div>
```

## Animation Class Reference

### Single-Effect Animations

These modify the `animation` property - **use only ONE per element**:

| Class | Effect | Properties Modified | Use Case |
|-------|--------|-------------------|----------|
| `.animate-spinjitzu` | Spinning entrance | `transform`, `opacity` | Success toasts, dramatic reveals |
| `.animate-pulse-fire` | Red pulsing glow | `filter`, `box-shadow` | Fire element backgrounds |
| `.animate-pulse-lightning` | Blue/yellow pulse | `filter`, `box-shadow` | Lightning element backgrounds |
| `.animate-pulse-energy` | Green/gold pulse | `filter`, `box-shadow` | Energy element backgrounds |
| `.ninja-star-spin` | Clockwise rotation | `transform` | Decorative spinning icons |
| `.ninja-star-spin-reverse` | Counter-clockwise rotation | `transform` | Decorative spinning icons |

### Composite Animations

These combine multiple keyframes into a single animation:

| Class | Combined Effects | Use Case |
|-------|-----------------|----------|
| `.animate-spinjitzu-gold` | Spin + golden shimmer | Perfect score feedback (1.0 points) |

### Pseudo-Element Effects

These are **SAFE to combine** with any `.animate-*` class:

| Class | Effect | Why Safe? |
|-------|--------|-----------|
| `.golden-shimmer` | Moving gold gradient overlay | Uses `::before` pseudo-element, not `animation` property on main element |

## Correct Usage Patterns

### Pattern 1: Single Animation Class

```tsx
// ✅ CORRECT - One animation class
<div className="animate-spinjitzu">
  Success!
</div>
```

### Pattern 2: Animation + Pseudo-Element Effect

```tsx
// ✅ CORRECT - Animation class + pseudo-element effect
<div className="animate-spinjitzu golden-shimmer">
  Perfect Score!
</div>
```

This works because:
- `.animate-spinjitzu` sets the `animation` property on the main element
- `.golden-shimmer` adds a `::before` pseudo-element with its own `animation`
- They don't conflict!

### Pattern 3: Composite Animation Class

```tsx
// ✅ CORRECT - Pre-built composite animation
<div className="animate-spinjitzu-gold">
  Ultimate Golden Power!
</div>
```

This is equivalent to Pattern 2, but packaged as a single class.

## Common Mistakes

### Mistake 1: Stacking Animation Classes

```tsx
// ❌ WRONG - Multiple animation classes
<div className="animate-spinjitzu animate-pulse-fire">
  {/* Only pulse will work, spin is overridden! */}
</div>
```

**Fix:** Choose the most important animation, or create a composite class if both are needed.

### Mistake 2: Confusing Pseudo-Element Classes

```tsx
// ⚠️ CONFUSING - Looks like it might conflict, but actually OK
<div className="animate-spinjitzu golden-shimmer">
  {/* This works! golden-shimmer uses ::before */}
</div>
```

**Note:** `.golden-shimmer` is safe because it uses a pseudo-element.

## How to Create New Animations

### 1. Define Keyframes

```css
@keyframes my-animation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### 2. Create Animation Class

```css
.animate-my-effect {
  animation: my-animation 1s ease-in-out;
}
```

### 3. Document the Class

Add it to this guide and include:
- What properties it modifies
- Whether it's safe to combine with other classes
- Typical use cases

### 4. Add Warning Comment in CSS

```css
/* ========================================
   MY NEW ANIMATION
   ========================================

   Modifies: transform, opacity
   Do NOT combine with other .animate-* classes!

   Use this for...
   ======================================== */
```

## Creating Composite Animations

If you need multiple effects on one element:

### 1. Combine Multiple Keyframes

```css
.animate-spin-and-pulse {
  animation:
    spinjitzu-spin 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    fire-pulse 2s ease-in-out infinite;
}
```

### 2. Consider Pseudo-Elements

If effects conflict, use `::before` or `::after`:

```css
/* Main element animation */
.animate-complex {
  animation: spin 1s linear infinite;
}

/* Pseudo-element for second effect */
.animate-complex::before {
  content: '';
  position: absolute;
  inset: 0;
  animation: glow 2s ease-in-out infinite;
}
```

## Current Implementation: FeedbackToast

The `FeedbackToast` component demonstrates the correct pattern:

```tsx
// Animation class (from state)
const style = {
  animation: 'animate-spinjitzu',  // Single animation class
  shimmer: true                     // Triggers golden-shimmer (pseudo-element)
}

// Applied in JSX
<div className={`${style.animation} ...`}>
  {style.shimmer && <div className="golden-shimmer" />}
</div>
```

**Why this works:**
- Only ONE `.animate-*` class applied to main div
- `.golden-shimmer` is a separate nested div with `::before` pseudo-element
- No conflicts!

## Testing for Conflicts

### Manual Testing

1. Inspect element in DevTools
2. Check the "Computed" tab
3. Look for the `animation` property
4. Verify only ONE animation is active (not multiple stacked)

### Code Review Checklist

- [ ] Is there only ONE `.animate-*` class per element?
- [ ] Are pseudo-element effects (`.golden-shimmer`) used correctly?
- [ ] If multiple effects are needed, is a composite class used?
- [ ] Are animations documented with property modifications?

## Session 12 Bug Fix

**Problem:** `FeedbackToast` applied both `element-energy` and `animate-spinjitzu` to the same element, causing the spin animation to be overridden.

**Root Cause:** CSS only allows one `animation` property per element.

**Solution:** Removed `element-energy` class. The golden shimmer effect uses a separate `<div className="golden-shimmer">` with `::before` pseudo-element, which doesn't conflict.

**Prevention:** This documentation system and CSS comments prevent future conflicts.

## Quick Reference

### Do's ✅

- Use ONE `.animate-*` class per element
- Combine animations with `.golden-shimmer` (pseudo-element)
- Create composite classes for complex animations
- Document new animations with property modifications
- Test in DevTools to verify animations work

### Don'ts ❌

- Apply multiple `.animate-*` classes to same element
- Assume multiple animation classes will stack
- Create animations without documenting conflicts
- Combine animations that modify same properties

---

**Location:** `/Users/melodykoh/Documents/Claude Projects/Hanzi Dojo/docs/operational/ANIMATION_SYSTEM_GUIDE.md`

**Last Updated:** Session 12, Nov 13, 2025

**Related Files:**
- `/src/index.css` - Animation definitions and conflict prevention comments
- `/src/components/FeedbackToast.tsx` - Example implementation
