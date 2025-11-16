# Remove Unused `react-tally` Dependency

**Status:** Pending (Ready to pick up)
**Severity:** 🔴 P1 Critical
**Category:** Dependencies / Code Quality
**Estimated Effort:** Small (2 minutes)
**Created:** 2025-11-16
**Source:** PR #12 Code Review (Session 14)

---

## Description

The `react-tally@0.0.9` package was installed during initial implementation but is no longer used in the final code. The implementation switched from using the `<TallyForm>` component to a direct iframe approach for better control over URL parameters and hidden field population.

## Location

- `package.json:29` - Dependency declaration
- `package-lock.json` - Lock file entries

## Problem Scenario

1. Developer reviews `package.json` dependencies
2. Sees `react-tally` listed as a dependency
3. Searches codebase for usage - finds none
4. Wastes time investigating why it's installed
5. Increases bundle size unnecessarily (even if tree-shaken)
6. Security surface area increases (unused dependencies still receive updates)

## Proposed Solution

Remove the dependency completely:

```bash
npm uninstall react-tally
```

This will update both `package.json` and `package-lock.json` automatically.

## Verification Steps

1. Run `npm uninstall react-tally`
2. Verify `package.json` no longer lists `react-tally`
3. Verify `package-lock.json` has been updated
4. Run `npm run build` to ensure build still works
5. Run `npm test` to ensure tests still pass
6. Verify FeedbackTab still functions correctly with iframe approach

## Additional Context

This dependency was added in PR #12 but became obsolete when the implementation strategy changed from using the React component to a direct iframe embed. The iframe approach provides better control over URL parameters and simplifies the implementation.
