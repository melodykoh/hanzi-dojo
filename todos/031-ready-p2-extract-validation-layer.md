---
status: ready
priority: p2
issue_id: "031"
tags: [code-review, architecture, refactor, pr-24]
dependencies: []
---

# P2: Extract Validation to Dedicated Layer

## Problem Statement

Pronunciation validation logic is embedded in `practiceQueueService.ts`, conflating queue business logic with data validation concerns. This violates Single Responsibility Principle and prevents reuse of validation across other services (`drillBuilders`, `dictionaryClient`).

**Why it matters:** Code quality and maintainability. Validation logic needs to be applied consistently across services, but current structure makes it difficult to reuse.

## Findings

**Current Architecture:**
```
/src/lib/practiceQueueService.ts (474 lines)
  ├── Queue fetching logic (business logic)
  ├── Priority calculation (business logic)
  ├── validateZhuyinSyllable() (validation) ← MIXED CONCERN
  ├── validatePronunciation() (validation) ← MIXED CONCERN
  └── buildPronunciationList() (validation + data access)
```

**Problems:**
1. `practiceQueueService.ts` handles both queue logic AND data validation (SRP violation)
2. Validation functions not exported, forcing test duplication
3. `drillBuilders.ts` and `dictionaryClient.ts` cannot validate data

**Agents:** architecture-strategist, pattern-recognition-specialist

## Proposed Solutions

### Option 1: Extract to /src/lib/validators/ (Recommended)
**Pros:** Clear separation, reusable, testable
**Cons:** New directory/file
**Effort:** Medium (1-2 hours)
**Risk:** Low

```
/src/lib/validators/
  ├── pronunciationValidator.ts
  │   ├── validateZhuyinSyllable()
  │   ├── validatePronunciation()
  │   └── validatePronunciationArray()
  └── pronunciationValidator.test.ts (co-located)

/src/lib/practiceQueueService.ts
  ├── Import from pronunciationValidator
  └── Focus on queue logic only
```

### Option 2: Extract to /src/lib/validation.ts (Simpler)
**Pros:** Less structure change
**Cons:** May grow unwieldy if more validators added
**Effort:** Small (30-45 min)
**Risk:** Low

### Option 3: Keep inline but export functions
**Pros:** Minimal change
**Cons:** Still violates SRP
**Effort:** Minimal (15 min)
**Risk:** Low (but tech debt remains)

## Recommended Action

Use Option 2: Extract to `/src/lib/validation.ts` (simpler). Start with single file, can split into `/validators/` directory later if needed.

## Technical Details

**Affected Files:**
- `src/lib/practiceQueueService.ts` (extract validation functions)
- `src/lib/drillBuilders.ts` (add validation imports)
- `src/lib/dictionaryClient.ts` (add validation imports)
- New: `src/lib/validators/pronunciationValidator.ts`

**Components Affected:**
- Practice queue service
- Drill generation
- Dictionary client

## Acceptance Criteria

- [ ] Validation functions extracted to dedicated module
- [ ] practiceQueueService imports from validator module
- [ ] drillBuilders uses same validation
- [ ] Tests co-located with validator module
- [ ] No functional changes (pure refactor)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-12-07 | Created from PR #24 code review | architecture-strategist identified SRP violation |
| 2025-12-07 | **Approved for work** | Triage approved - P2 important, defer to post-merge cleanup |

## Resources

- PR #24: https://github.com/melodykoh/hanzi-dojo/pull/24
- SOLID Principles: https://en.wikipedia.org/wiki/Single-responsibility_principle
