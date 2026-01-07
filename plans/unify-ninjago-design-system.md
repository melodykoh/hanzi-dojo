# Unify Ninjago Design System

**Issue:** #22
**PR:** Close #28, create new comprehensive PR
**Scope:** ~35 CSS class changes across 10 files + design system doc

---

## Problem

DashboardMetrics (logged-in) uses `font-bold/font-black` while DemoDashboard (guest) uses `font-heading`. Buttons mix inline Tailwind with `ninja-button-*` classes. No documented design system for future reference.

---

## Solution

1. Match DemoDashboard.tsx patterns across all components
2. Create `/docs/operational/DESIGN_SYSTEM.md` as single source of truth

---

## File Checklist

### Typography (replace `font-bold` → `font-heading`)
- [ ] DashboardMetrics.tsx (7 changes) - **PRIORITY: Match guest view styling**
- [ ] DrillBalanceWidget.tsx (2 changes)
- [ ] PracticeDemo.tsx (1 change)
- [ ] DictionaryDemo.tsx (1 change)
- [ ] EntryCatalog.tsx (1 change)
- [ ] AddItemForm.tsx (1 change)
- [ ] MissingEntriesView.tsx (1 change)
- [ ] TrainingMode.tsx (2 changes)

### Buttons & Theme (from PR #28)
- [ ] AuthScreen.tsx (6 changes) - Fire gradient, ninja-button-fire, ninja-blue focus
- [ ] DictionaryDemo.tsx (1 change) - ninja-button-lightning
- [ ] OfflineModal.tsx (1 change) - ninja-button-fire
- [ ] TrainingMode.tsx (6 changes) - Fire gradients, drill switcher
- [ ] EntryCatalog.tsx (1 change) - ninja-button-fire delete
- [ ] PracticeDemo.tsx (3 changes) - End Training button, hover states

### Documentation
- [ ] Create `/docs/operational/DESIGN_SYSTEM.md`

---

## Design System Doc Content

```markdown
# Hanzi Dojo Design System

## Typography
- **All section headers:** `font-heading` (Bungee font)
- **Size hierarchy:** 3xl (page) > 2xl (form) > xl (section) > lg (card)
- **Body text:** Default sans-serif (DM Sans)

## Buttons
| Purpose | Class |
|---------|-------|
| Primary (submit, delete, exit) | `ninja-button ninja-button-fire` |
| Secondary (lookup, info) | `ninja-button ninja-button-lightning` |
| Training CTA | `ninja-button ninja-button-gold` |
| Utility (reset, toggle) | `bg-gray-200 text-gray-700 rounded hover:bg-gray-300` |

## Focus States
- **Form inputs:** `focus:border-ninja-blue focus:ring-2 focus:ring-ninja-blue/20`

## Reference Implementation
See `src/components/DemoDashboard.tsx` for the canonical Ninjago theme example.
```

---

## Execution

1. Close PR #28 with comment: "Expanding to include typography unification + design system doc"
2. Create branch: `git checkout -b feature/ninjago-design-system`
3. Apply all changes in one commit
4. Create `/docs/operational/DESIGN_SYSTEM.md`
5. Build check: `npm run build`
6. Visual test: Desktop pass (all screens) + mobile spot-check (Dashboard)
7. Update CHANGELOG.md
8. Create PR

---

## Acceptance Criteria

- [ ] All headers use `font-heading` (Bungee)
- [ ] DashboardMetrics visually matches DemoDashboard
- [ ] All buttons use `ninja-button-*` or standard gray utility
- [ ] `/docs/operational/DESIGN_SYSTEM.md` created
- [ ] Build passes
- [ ] CHANGELOG.md updated
