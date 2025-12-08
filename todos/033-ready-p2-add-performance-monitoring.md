---
status: ready
priority: p2
issue_id: "033"
tags: [code-review, performance, monitoring, pr-24]
dependencies: []
---

# P2: Add Performance Monitoring for Practice Queue

## Problem Statement

The `fetchPracticeQueue` function has validation overhead estimated at 15-30ms for current data volumes, but no instrumentation exists to verify this or detect regression. At 10x scale (500 entries), the overhead could approach the 250ms latency budget.

**Why it matters:** Performance requirements state <250ms drill latency. Without monitoring, we can't detect when we're approaching the budget or if changes cause regression.

## Findings

**Performance Analysis:**

| Scenario | Entries | Estimated Time | Within Budget? |
|----------|---------|----------------|----------------|
| Current (V1) | 50 | 15-30ms | ✅ Yes |
| 10x Growth | 500 | 150-300ms | ⚠️ Borderline |
| 100x Growth | 5,000 | 1.5-3s | ❌ No |

**Hot Paths Identified:**
- `validateZhuyinSyllable()` - Called for every syllable in every pronunciation
- `serializePronunciation()` - String creation for deduplication
- `buildPronunciationList()` - Called once per entry

**Current State:**
- No timing instrumentation in production
- No alerting when approaching budget
- No baseline metrics to compare against

**Agent:** performance-oracle

## Proposed Solutions

### Option 1: Add development timing logs (Recommended first step)
**Pros:** Quick, non-invasive, useful for profiling
**Cons:** Dev-only, not production visibility
**Effort:** Small (15 min)
**Risk:** Low

```typescript
export async function fetchPracticeQueue(
  kidId: string,
  drill: PracticeDrill,
  limit?: number
): Promise<QueueEntry[]> {
  const startTime = import.meta.env.DEV ? performance.now() : 0

  // ... existing code ...

  if (import.meta.env.DEV) {
    const duration = performance.now() - startTime
    console.debug(`[perf] fetchPracticeQueue: ${duration.toFixed(1)}ms for ${queue.length} entries`)
    if (duration > 200) {
      console.warn(`[perf] fetchPracticeQueue approaching budget: ${duration.toFixed(1)}ms`)
    }
  }

  return queue
}
```

### Option 2: Add Sentry performance monitoring
**Pros:** Production visibility, alerting, dashboards
**Cons:** Requires Sentry setup, cost
**Effort:** Medium (1-2 hours)
**Risk:** Low

### Option 3: Add performance test suite
**Pros:** Catches regression in CI
**Cons:** Doesn't monitor production
**Effort:** Medium (1 hour)
**Risk:** Low

```typescript
test('Performance: fetchPracticeQueue with 100 entries', async () => {
  const startTime = performance.now()
  const queue = await fetchPracticeQueue(kidId, 'zhuyin', 100)
  const duration = performance.now() - startTime

  expect(duration).toBeLessThan(250) // Budget requirement
})
```

## Recommended Action

Use Option 1: Add development timing logs with console.debug and warning when approaching 200ms budget. Quick win for profiling during development.

## Technical Details

**Affected Files:**
- `src/lib/practiceQueueService.ts` (add timing)
- `src/lib/practiceQueueService.test.ts` (add performance tests)

**Components Affected:**
- Practice queue service
- Training mode (depends on queue performance)

**Metrics to Track:**
- `fetchPracticeQueue` duration
- Queue size (entries count)
- Validation pass/fail counts

## Acceptance Criteria

- [ ] Development timing logs added
- [ ] Warning when approaching 200ms budget
- [ ] Performance test added to CI
- [ ] Baseline metrics documented

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-12-07 | Created from PR #24 code review | performance-oracle estimated overhead |
| 2025-12-07 | **Approved for work** | Triage approved - P2 important, defer to post-merge cleanup |

## Resources

- PR #24: https://github.com/melodykoh/hanzi-dojo/pull/24
- Performance budget: <250ms (docs/REQUIREMENTS.md)
- Sentry Performance: https://docs.sentry.io/product/performance/
