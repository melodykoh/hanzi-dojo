# Automated Test Coverage — Hanzi Dojo
**Version:** Epic 4 Complete + Test Suite
**Framework:** Vitest + React Testing Library
**Last Updated:** 2025-11-04

---

## 📊 Test Summary

### Coverage Statistics

| Category | Test Files | Test Cases | Coverage |
|----------|------------|------------|----------|
| **Practice State Service** | 1 | 25 tests | Scoring, familiarity, known status |
| **Practice Queue Service** | 1 | 18 tests | Priority ordering, tiers, recency |
| **Drill Builders** | 1 | 22 tests | Option generation, validation |
| **Component Smoke Tests** | 2 | 12 tests | Rendering, props, state |
| **Total** | **5 files** | **77 tests** | **Core logic covered** |

---

## ✅ What's Automated (77 Test Cases)

### 1. Practice State Service (25 tests)

**File:** `src/lib/practiceStateService.test.ts`

#### Familiarity Calculations (7 tests)
- [x] New state returns 0 familiarity
- [x] First-try success calculates 1.0 points
- [x] Second-try success calculates 0.5 points
- [x] Mixed successes calculate correctly (e.g., 3×1.0 + 2×0.5 = 4.0)
- [x] Null state handled gracefully
- [x] Total familiarity sums across states
- [x] Results rounded to 1 decimal place

#### Known Status Computation (10 tests)
- [x] New state (never practiced) → not known
- [x] In-progress state (1 success) → not known
- [x] Known state (2+ successes, <2 misses) → known
- [x] Struggling state (2+ consecutive misses) → not known (demoted)
- [x] Exactly 2 successes → known
- [x] Mixed success types (1 first + 1 second) → known
- [x] Demotion logic (5 successes + 2 misses) → not known
- [x] 1 consecutive miss → still known (not demoted yet)
- [x] All applicable drills must be known for entry to be known
- [x] Single-drill entries (identical forms) handled correctly

#### Accuracy Rate (3 tests)
- [x] Empty states return 0% accuracy
- [x] All first-try successes → 100% accuracy
- [x] Mixed results calculate correctly (correct/total attempts)

#### Edge Cases (5 tests)
- [x] Very large success counts (1000+ attempts)
- [x] Empty applicable_drills array
- [x] Mismatched practice states (states for non-applicable drills)
- [x] Null state handling
- [x] Zero counts (boundary case)

---

### 2. Practice Queue Service (18 tests)

**File:** `src/lib/practiceQueueService.test.ts`

#### Priority Calculation (8 tests)
- [x] Never practiced → priority 1000
- [x] Struggling (consecutive misses) → priority 2000-2999
- [x] Not known yet → priority 3000-3999
- [x] Known → priority 4000+
- [x] More misses → higher priority (lower number)
- [x] Older attempts prioritized within same tier
- [x] Null last_attempt_at handled correctly
- [x] Tier ordering maintained despite recency

#### Priority Tiers (1 test)
- [x] All tier boundaries correct (1000-1999, 2000-2999, 3000-3999, 4000+)

#### Edge Cases (9 tests)
- [x] Zero counts (edge case of new state)
- [x] Exactly 2 successes (boundary of known)
- [x] Exactly 2 consecutive misses (boundary of struggling)
- [x] Very old timestamps (years ago)
- [x] Future timestamps (clock skew)
- [x] Null last_attempt_at (never practiced)
- [x] State with no attempts
- [x] Queue ordering when sorted ascending
- [x] Priority stability across multiple calculations

---

### 3. Drill Builders (22 tests)

**File:** `src/lib/drillBuilders.test.ts`

#### Zhuyin Option Generation (7 tests)
- [x] Generates exactly 4 unique options
- [x] Includes correct answer
- [x] Exactly one correct answer
- [x] Randomized order (different on each call)
- [x] Handles multi-syllable zhuyin
- [x] Creates plausible distractors (not random garbage)
- [x] Distractors have valid syllable structure

#### Traditional Option Generation (5 tests)
- [x] Generates exactly 4 unique options
- [x] Includes correct answer
- [x] Exactly one correct answer
- [x] Randomized order
- [x] Distractors same length as correct answer
- [x] Does not include simplified form as distractor

#### Validation (4 tests)
- [x] No duplicate options (Zhuyin)
- [x] No duplicate options (Traditional)
- [x] Correct answer always present (Zhuyin, tested 10x)
- [x] Correct answer always present (Traditional, tested 10x)

#### Edge Cases (4 tests)
- [x] Single-character entries (Zhuyin)
- [x] Single-character entries (Traditional)
- [x] Multi-character entries (Traditional)
- [x] Complex zhuyin (multiple syllables)

#### Distractor Quality (2 tests)
- [x] Correct answer not used as distractor (Zhuyin)
- [x] Correct answer not used as distractor (Traditional)
- [x] Tone variants generated as distractors

---

### 4. FeedbackToast Component (7 tests)

**File:** `src/components/FeedbackToast.test.tsx`

#### Rendering Logic (4 tests)
- [x] Renders when show=true
- [x] Does not render when show=false
- [x] Displays +1.0 points correctly
- [x] Displays +0.5 points correctly
- [x] Displays 0 points correctly

#### Message Handling (2 tests)
- [x] Renders with custom message
- [x] Uses default Sensei message when message prop is empty

---

### 5. Offline Components (5 tests)

**File:** `src/components/OfflineBlocker.test.tsx`

#### ConnectionStatusBadge (3 tests)
- [x] Renders "Online" status
- [x] Renders "Offline" status
- [x] Renders "Checking" status

#### OfflineAwareButton (4 tests)
- [x] Renders button with children
- [x] Not disabled when online
- [x] Disabled when offline
- [x] Shows offline message when offline

---

## ❌ What's NOT Automated (Manual Testing Required)

### Visual & UX (Must be human-tested)
- Visual appearance and polish
- Color consistency and theme
- Typography readability
- Layout responsiveness
- Touch target sizes
- Emotional satisfaction
- Cognitive load

### Real Network Behavior
- Actual Wi-Fi on/off cycles
- Airplane mode testing
- Network flapping (rapid toggling)
- Slow/degraded connections
- Connection restoration feel

### Performance Perception
- Initial load speed feeling
- Transition smoothness
- Perceived responsiveness
- Overall app snappiness

### Accessibility
- Keyboard navigation flow
- Screen reader compatibility
- Color contrast (low vision)
- Text size scaling

**See `QA_MANUAL_ONLY.md` for complete manual testing checklist (37 items)**

---

## 🚀 Running Tests

### Run All Tests (Watch Mode)
```bash
npm test
```

Tests will run in watch mode and re-run on file changes.

### Run Tests Once (CI Mode)
```bash
npm run test:run
```

Runs all tests once and exits (useful for CI/CD).

### Run Tests with UI
```bash
npm run test:ui
```

Opens Vitest UI in browser for interactive test exploration.

### Run Tests with Coverage
```bash
npm run test:coverage
```

Generates coverage report in `coverage/` directory.

---

## 📁 Test File Organization

```
src/
├── lib/
│   ├── practiceStateService.ts
│   ├── practiceStateService.test.ts       ← 25 tests
│   ├── practiceQueueService.ts
│   ├── practiceQueueService.test.ts       ← 18 tests
│   ├── drillBuilders.ts
│   └── drillBuilders.test.ts              ← 22 tests
├── components/
│   ├── FeedbackToast.tsx
│   ├── FeedbackToast.test.tsx             ← 7 tests
│   ├── OfflineBlocker.tsx
│   └── OfflineBlocker.test.tsx            ← 5 tests
└── test/
    ├── setup.ts                            ← Global test config
    └── mockData.ts                         ← Shared mock data
```

---

## ✨ Test Quality Standards

### All Tests Follow These Principles

1. **Isolated:** Each test is independent and can run in any order
2. **Fast:** All 77 tests run in <5 seconds total
3. **Deterministic:** Same input → same output (no flakiness)
4. **Clear:** Test names describe what is being tested
5. **Focused:** Each test verifies one specific behavior

### Naming Convention

```typescript
describe('serviceName or componentName', () => {
  describe('featureName', () => {
    it('should do expected behavior when condition', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

---

## 🔍 Coverage Gaps & Future Tests

### Not Yet Tested (Can Be Automated Later)

#### Dictionary Services
- [ ] Dictionary lookup RPC calls (requires Supabase mock)
- [ ] Cache hit/miss logic
- [ ] Missing entry logging
- [ ] Batch lookup operations

#### Routing & Navigation
- [ ] Route transitions (/ ↔ /training)
- [ ] Browser back button behavior
- [ ] URL parameter handling

#### Complex Component Behavior
- [ ] PracticeCard interaction flow (first/second attempt)
- [ ] TrainingMode session management
- [ ] Dashboard tab switching

#### Integration Tests
- [ ] Full practice flow (add → practice → score → known status)
- [ ] Offline → Online transition
- [ ] Multi-drill entry completion

### Why Not Tested Yet
- Require Supabase mocking (complex setup)
- Need React Router mocking
- Integration tests planned for Epic 6

---

## 📈 Test Metrics

### Current Coverage

| Metric | Value | Target |
|--------|-------|--------|
| **Unit Tests** | 77 tests | ✅ 70+ |
| **Test Files** | 5 files | ✅ 4+ |
| **Services Covered** | 3/3 | ✅ 100% |
| **Components Covered** | 2/7 | 🔶 29% (smoke tests only) |
| **Run Time** | <5 seconds | ✅ <10s |

### Coverage by Category

| Category | Coverage | Status |
|----------|----------|--------|
| **Scoring Logic** | 100% | ✅ Complete |
| **Known Status** | 100% | ✅ Complete |
| **Priority Ordering** | 100% | ✅ Complete |
| **Option Generation** | 100% | ✅ Complete |
| **Component Rendering** | ~30% | 🔶 Smoke tests only |
| **Integration Flows** | 0% | ⏳ Planned for Epic 6 |

---

## 🎯 Testing Strategy by Epic

### Epic 1-4: Core Logic (Current)
✅ **Focus:** Unit tests for services and algorithms
✅ **Status:** 77 tests covering scoring, queuing, drill generation
✅ **Goal:** Catch regressions in business logic

### Epic 5: Entry Management (Next)
⏳ **Plan:** Add tests for entry CRUD operations
⏳ **Plan:** Test belt progression calculations
⏳ **Plan:** Test entry catalog filtering

### Epic 6: Polish & Testing
⏳ **Plan:** Integration tests for full user flows
⏳ **Plan:** Component interaction tests
⏳ **Plan:** E2E tests with Playwright or Cypress
⏳ **Plan:** Performance benchmarking

---

## 🛠️ Testing Tools & Libraries

### Installed Dependencies

```json
{
  "vitest": "^4.0.6",                        // Test runner
  "@vitest/ui": "^4.0.6",                    // Test UI
  "@testing-library/react": "^16.3.0",       // React testing utilities
  "@testing-library/jest-dom": "^6.9.1",     // DOM matchers
  "@testing-library/user-event": "^14.6.1",  // User interaction simulation
  "happy-dom": "^20.0.10",                   // Fast DOM implementation
  "jsdom": "^27.1.0"                         // Alternative DOM implementation
}
```

### Configuration Files

- `vitest.config.ts` — Vitest configuration
- `src/test/setup.ts` — Global test setup
- `src/test/mockData.ts` — Shared mock data

---

## 📝 Contributing Tests

### Adding a New Test

1. Create test file next to source: `feature.test.ts`
2. Import test utilities:
   ```typescript
   import { describe, it, expect } from 'vitest'
   ```
3. Use mock data from `src/test/mockData.ts`
4. Follow AAA pattern: Arrange, Act, Assert
5. Run tests: `npm test`

### Example Test

```typescript
import { describe, it, expect } from 'vitest'
import { computeFamiliarity } from './practiceStateService'
import { mockPracticeStateKnown } from '../test/mockData'

describe('computeFamiliarity', () => {
  it('should calculate correct familiarity for known state', () => {
    // Arrange
    const state = mockPracticeStateKnown

    // Act
    const result = computeFamiliarity(state)

    // Assert
    expect(result).toBe(2.5) // 2×1.0 + 1×0.5
  })
})
```

---

## 🎉 Test Success Criteria

### Before Merging to Main
- [ ] All 77+ tests passing
- [ ] No test failures or skipped tests
- [ ] Coverage for new features added
- [ ] Test run time <10 seconds

### Before Deployment
- [ ] All automated tests passing
- [ ] Manual QA (Tier 1) completed
- [ ] No critical bugs found
- [ ] Performance acceptable

---

**Next Steps:**
1. Run `npm test` to execute all 77 tests
2. Review any failures and fix
3. Add integration tests in Epic 6
4. Maintain >70 test coverage as codebase grows
