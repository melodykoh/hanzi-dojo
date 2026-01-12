# Hanzi Dojo Project Plan

Status legend: ☐ Pending · ⧖ In Progress · ☑ Completed

---

## Epic 1 — Requirements & Dictionary Foundations ☑ COMPLETE
- **Goal:** Finalize requirements and prepare the initial dictionary dataset.
- **Completed:** 2025-11-03 (Session 1)
- **Total Points:** 17 pts (100% complete)

### Task 1.1 — Requirements Confirmation ☑ COMPLETE (7 pts)
- Subtask 1.1.1 (2 pts) — Document end-to-end parent/child workflow based on user walkthrough ☑
- Subtask 1.1.2 (2 pts) — Capture success metrics, automatic disqualifiers, and edge cases in specs ☑
- Subtask 1.1.3 (3 pts) — Validate character examples and prioritize initial coverage list ☑

### Task 1.2 — Seed Initial Dictionary Dataset ☑ COMPLETE (10 pts)
- Subtask 1.2.1 (3 pts) — Assemble ~150 high-frequency characters with Trad/Zhuyin data (initial seed; expand to 500 in Epic 2+) ☑
- Subtask 1.2.2 (2 pts) — Normalize into versioned JSON for import ☑
- Subtask 1.2.3 (5 pts) — Create Supabase migrations and import strategy for `dictionary_entries`/`dictionary_confusions` ☑

**Deliverables:**
- ✅ `docs/REQUIREMENTS.md` — Complete specification
- ✅ `data/dictionary_seed_v1.json` — 150 characters
- ✅ `data/confusion_maps_v1.json` — Distractor generation rules
- ✅ `supabase/migrations/001_initial_schema.sql` — 14 tables with RLS
- ✅ `supabase/migrations/002_seed_dictionary.sql` — Import template
- ✅ `SESSION_LOG.md` — Session 1 documented

---

## Epic 2 — Supabase Dictionary Services ☑ COMPLETE
- **Goal:** Implement dictionary lookup RPCs, client caching, and missing-entry logging.
- **Status:** Completed 2025-11-03 (Session 2)
- **Total Points:** 16 pts (100% complete)

### Task 2.1 — Dictionary Lookup Pipeline ☑ COMPLETE (3/3 subtasks complete)
- Subtask 2.1.1 (3 pts) — Create migrations for dictionary tables, indexes, and RLS policies ☑ (completed in Session 1)
- Subtask 2.1.2 (4 pts) — Build Supabase RPC returning canonical mapping + confusions ☑
- Subtask 2.1.3 (4 pts) — Integrate frontend dictionary client with caching & fallback ☑

### Task 2.2 — Missing Entry Workflow ☑ COMPLETE (3/3 subtasks complete)
- Subtask 2.2.1 (2 pts) — Log unmatched entries to `dictionary_missing` from Add Item flow ☑
- Subtask 2.2.2 (2 pts) — Surface review queue placeholder (admin view or export) ☑
- Subtask 2.2.3 (1 pt) — Add analytics/telemetry for dictionary hit rate ☑

**Deliverables:**
- ✅ `supabase/migrations/003_import_dictionary_data.sql` — 155 characters imported
- ✅ `supabase/migrations/004_fix_dictionary_rls.sql` — Public read access for dictionary
- ✅ `supabase/migrations/005_dictionary_lookup_rpc.sql` — RPC functions for lookup
- ✅ `src/lib/dictionaryClient.ts` — Client with in-memory caching
- ✅ `src/lib/dictionaryLogger.ts` — Missing entry logging service
- ✅ `src/components/DictionaryDemo.tsx` — Interactive test component
- ✅ `src/components/DictionaryStats.tsx` — Analytics dashboard
- ✅ `src/components/MissingEntriesView.tsx` — Admin review queue

---

## Epic 3 — Practice State & Familiarity Logic ☑ COMPLETE
- **Goal:** Update schema and app logic for per-drill familiarity and dynamic known status.
- **Completed:** 2025-11-04 (Session 3)
- **Total Points:** 19 pts (95% complete - tests deferred to Epic 6)

### Task 3.1 — Practice State Schema Upgrade ☑ COMPLETE (3/3 subtasks complete)
- Subtask 3.1.1 (4 pts) — Migrate `practice_state` to per `(kid, entry, drill)` counters ☑ (already in schema from Session 1)
- Subtask 3.1.2 (3 pts) — Refactor data layer models and Supabase queries ☑
- Subtask 3.1.3 (2 pts) — Backfill or adapt existing records (if any) ☑ (N/A - fresh schema)

### Task 3.2 — Familiarity & Known Computation ☑ COMPLETE (2/3 subtasks complete, 1 deferred)
- Subtask 3.2.1 (4 pts) — Implement scoring updates (+1.0/+0.5) and demotion rules ☑
- Subtask 3.2.2 (3 pts) — Update UI to display familiarity scores and known badges dynamically ☑
- Subtask 3.2.3 (3 pts) — Add unit/integration tests for scoring and queue ordering ☐ (deferred to Epic 6)

**Deliverables:**
- ✅ `src/lib/practiceStateService.ts` — Scoring logic, familiarity computation, known status
- ✅ `src/lib/practiceQueueService.ts` — Priority-based queue fetching and filtering
- ✅ `src/lib/drillBuilders.ts` — Drill A & B option generation with confusion maps
- ✅ `src/components/PracticeCard.tsx` — Interactive drill display with attempt tracking
- ✅ `src/components/FeedbackToast.tsx` — Scoring feedback UI with Sensei messages
- ✅ `src/components/KnownBadge.tsx` — Dynamic known status badges
- ✅ `src/components/PracticeDemo.tsx` — Full practice flow testing interface

---

## Epic 4 — Training Mode UX & Guardrails ☑ COMPLETE
- **Goal:** Deliver landscape-optimized full-screen kid training experience and offline guard.
- **Completed:** 2025-11-04 (Session 4)
- **Total Points:** 14 pts (scope reduced from 17 pts when passcode system removed)

### Task 4.1 — Training Layout & Navigation ☑ COMPLETE
- Subtask 4.1.1 (4 pts) — Implement landscape-first full-screen training layout ☑
- Subtask 4.1.2 (2 pts) — Create `/training` route separate from demo interface ☑
- Subtask 4.1.3 (2 pts) — Add "Exit Training" button to return to dashboard (no passcode needed) ☑

### Task 4.2 — Offline & Error Handling ☑ COMPLETE
- Subtask 4.2.1 (3 pts) — Detect offline state and pause training/Add Item interactions ☑ (OfflineGuard + connection hooks)
- Subtask 4.2.2 (2 pts) — Design and integrate dojo-themed offline modal & messaging ☑
- Subtask 4.2.3 (1 pt) — QA network transitions ☑ (manual checks pending polish for mobile landscape)

**Deliverables:**
- `src/App.tsx`, `src/main.tsx`, `src/components/Dashboard.tsx`, `src/components/TrainingMode.tsx`
- Offline detection system in `src/lib/offlineDetection.ts`, `src/components/OfflineModal.tsx`, `src/components/OfflineBlocker.tsx`
- Routing + full-screen UX verified in code review and smoke tests

**Follow-ups:** Landscape CSS polish for mobile/tablet rotation remains open (tracked under Epic 7).

---

## Epic 5 — Parent Console Enhancements ☑ COMPLETE (Code)
- **Goal:** Upgrade Add Item flow with dictionary auto-fill and refresh dashboard metrics.
- **Completed:** 2025-11-04 (Session 5) — awaiting full QA + automated test alignment
- **Total Points:** 13 pts (Add Item) + 10 pts (Dashboard Metrics)

### Task 5.1 — Add Item Enhancements ☑ COMPLETE
- Subtask 5.1.1 (4 pts) — Auto-fill Simplified/Traditional/Zhuyin with override UI ☑ (`AddItemForm.tsx`)
- Subtask 5.1.2 (3 pts) — Prompt for multi-character confirmation and drill applicability ☑ (drill badge messaging)
- Subtask 5.1.3 (3 pts) — Strengthen validation (duplicate detection, tone checking) ☑

### Task 5.2 — Dashboard Metrics Refresh ☑ COMPLETE
- Subtask 5.2.1 (3 pts) — Implement weekly familiarity and all-time tiles ☑
- Subtask 5.2.2 (3 pts) — Compute accuracy & known counts dynamically from `practice_state` ☑
- Subtask 5.2.3 (4 pts) — Render 7-day familiarity sparkline with responsive design ☑

**Deliverables:**
- `src/components/AddItemForm.tsx`, `DashboardMetrics.tsx`, supporting tests (currently failing, see Epic 6)
- QA documentation updates in `docs/operational/QA_MANUAL_ONLY.md`
- Hardcoded `TEST_KID_ID` workaround in `Dashboard.tsx` documented for removal

**Follow-ups:**
- Automated tests for Add Item & metrics rely on real Supabase; need mocking strategy (Epic 6)
- Manual QA execution (Tier 1 checklist) still required before release (Epic 6)

---

## Epic 5.5 — UX Refinement: Priority Actions & Drill Selection ☑ COMPLETE
- **Goal:** Improve parent workflow by surfacing primary actions and adding explicit drill selection with proficiency-based recommendations.

**Deliverables:**
- Sticky action bar with Add Item and Launch Training always visible in header
- Pre-training drill selection modal with queue depth and proficiency metrics
- Proficiency-based recommendation service (`drillBalanceService.ts`)
- Dashboard drill balance widget showing accuracy comparison
- Auto-selection of recommended drill based on proficiency gap, struggling items, or never-practiced status

**Key Features:**
- Primary actions front-and-center (no scrolling required)
- Explicit drill choice before training starts (no default drill)
- Smart recommendations based on accuracy, not just recency
- Visual proficiency comparison on dashboard

### Task 5.5.1 — Sticky Action Bar ☑ COMPLETE
- Subtask 5.5.1.1 (2 pts) — Move Add Item and Launch Training to persistent header bar; clean up demo tabs ☑

### Task 5.5.2 — Pre-Training Drill Selection Modal ☑ COMPLETE
- Subtask 5.5.2.1 (3 pts) — Create DrillSelectionModal with queue depth display, radio selection, disabled state for empty drills ☑

### Task 5.5.3 — Drill Balance Service (Proficiency-Based) ☑ COMPLETE
- Subtask 5.5.3.1 (4 pts) — Implement drillBalanceService.ts with accuracy calculation and proficiency-based recommendation logic ☑

### Task 5.5.4 — Enhanced Modal with Recommendations ☑ COMPLETE
- Subtask 5.5.4.1 (2 pts) — Add proficiency metrics and smart recommendation display to DrillSelectionModal ☑

### Task 5.5.5 — Dashboard Drill Balance Widget ☑ COMPLETE
- Subtask 5.5.5.1 (1 pt) — Create DrillBalanceWidget showing accuracy comparison and struggling items ☑

---

## Epic 6 — QA, Testing & Release Readiness ☐ PENDING
- **Goal:** Harden the system, align automated tests with implementation, and prepare deployment handoff.

### Task 6.1 — Automated Testing & Validation ☐
- Subtask 6.1.1 (5 pts) — Reconcile Vitest suites with production APIs (update signatures, handle async returns)
- Subtask 6.1.2 (4 pts) — Introduce Supabase client mocks to eliminate network calls during tests
- Subtask 6.1.3 (4 pts) — Add integration tests for Add Item → practice flow and TrainingMode queue progression
- Subtask 6.1.4 (2 pts) — Ensure lint, typecheck, and `npm run test:run` pass in CI without external services
- **Subtask 6.1.5 (3 pts) — ✅ FIXED: Add manual Zhuyin input for missing dictionary entries**
  - ✅ AddItemForm.tsx now has editable Zhuyin input when dictionary lookup fails
  - ✅ Accepts both tone marks (`ㄊㄡˊ`) AND numeric format (`ㄊㄡ2`)
  - ✅ `parseManualZhuyin()` function converts numeric tones (1-5) to symbols (ˉˊˇˋ˙)
  - ✅ Live preview shows converted Zhuyin in green box as user types
  - ✅ Validates complete syllables before submission
  - ✅ Still logs to dictionary_missing for expansion tracking
  - **Location:** `src/components/AddItemForm.tsx` (lines 45, 156-236, 535-566)
- **Subtask 6.1.6 (2 pts) — ✅ FIXED: Exit Training shows summary when clicked mid-session**
  - ✅ `exitTraining()` now checks if user has practiced (`sessionTotal > 0`)
  - ✅ Shows session stats modal with points, accuracy, correct count
  - ✅ Modal offers "Continue Training" or "Exit to Dashboard" options
  - ✅ Only direct exit if no practice completed yet
  - **Location:** `src/components/TrainingMode.tsx` (lines 30, 108-116, 244-289)
- **Subtask 6.1.7 (3 pts) — ✅ FIXED: Drill B duplicate character options prevented**
  - ✅ Uses `Set<string>` deduplication to prevent exact duplicates
  - ✅ 4-strategy fallback system: visual confusion → multi-char tweaks → random fabrication → char swapping
  - ✅ Final fallback adds suffixes (e.g., `頭字` instead of `頭頭`)
  - ✅ Common Traditional characters list provides 30+ substitutes
  - **Location:** `src/lib/drillBuilders.ts` (lines 267, 360-400)

### Task 6.2 — Release Preparation & Authentication ☐
- Subtask 6.2.1 (3 pts) — Implement proper login/signup UI (replace auto-login in Dashboard.tsx)
- Subtask 6.2.2 (3 pts) — Set up seeded test kid/profile data and fixtures for manual QA & demos
- Subtask 6.2.3 (2 pts) — Execute Tier 1 manual QA scenarios; capture issues in SESSION_LOG.md
- Subtask 6.2.4 (2 pts) — Update deployment checklist with new auth/backups requirements; confirm Vercel env vars
- Subtask 6.2.5 (1 pt) — Remove auto-login code from Dashboard.tsx and delete test account `test@hanzidojo.local`

### Task 6.3 — Entry Catalog (Dojo Wall) ☑ COMPLETE **RELEASE BLOCKER RESOLVED**
- **Subtask 6.3.1 (3 pts) — Create EntryCatalog component with sortable/filterable entry list** ☑
  - Card grid view showing: Character (Simp/Trad), Known status (⭐/⚠️), Familiarity score, Last practiced
  - Sort options: Recently added, Familiarity (low to high), Struggling items first
  - Filter options: Show all, Known only, Not known yet, Same form (Simp=Trad), Different forms (Simp≠Trad)
  - Display entry count: "X character(s) added"
  - Responsive grid: 1/2/3 columns based on screen width
- **Subtask 6.3.2 (2 pts) — Add basic entry management actions** ☑
  - Details modal with drill-by-drill practice stats (first-try, second-try, miss streak, known status)
  - Delete entry with confirmation modal (cascades to practice_state and practice_events)
  - "Practice" button opens drill selection modal (same UX as Launch Training)
- **Subtask 6.3.3 (1 pt) — Integrate catalog into Dashboard tabs** ☑
  - Added "📚 My Characters" tab between Dashboard and Practice Demo
  - Empty state: "No Characters Yet - Add your first character to get started!"
  - Passes onLaunchTraining callback for drill selection

### Task 6.4 — Dashboard Metrics Simplification ☑ COMPLETE
- **Subtask 6.4.1 (3 pts) — Streamline dashboard tiles to 4 actionable metrics** ☑
  - **Tile 1:** All-Time Points (🎯) - Total familiarity earned
  - **Tile 2:** Last Practiced (📅) - "Today", "2 days ago", "Never" with motivational message ("Time to practice!" if >3 days)
  - **Tile 3:** Accuracy Streak (🔥) - Shows both "X improving 🔥" AND "Y perfect 💯" simultaneously
  - **Tile 4:** Characters Mastered (⭐) - "X of Y mastered" with congratulatory message when complete
  - Removed: Weekly familiarity tile, 7-day sparkline component
- **Subtask 6.4.2 (2 pts) — Implement session-level accuracy tracking** ☑
  - Sessions grouped by 2-hour window gaps in practice_events
  - First-try accuracy calculated per session (consistent with drill balance)
  - Improving streak: counts consecutive sessions where accuracy increases
  - Perfect streak: counts consecutive 100% accuracy sessions
  - Computed on-demand (no new table needed)
- **Subtask 6.4.3 (1 pt) — Unify accuracy definition across app to first-try only** ☑
  - All accuracy calculations now use first-try attempts only (attempt_index = 1)
  - Consistent across Drill Balance Widget, Dashboard Metrics, and session tracking
  - Documented in DASHBOARD_METRICS_LOGIC.md

---

## Epic 7 — Mobile Polish & Field Readiness ☑ SUBSTANTIALLY COMPLETE
- **Goal:** Resolve remaining UX polish gaps discovered during device testing and document operational guardrails.
- **Status:** Session 12 (Nov 14, 2025) - Ninjago theme + comprehensive mobile optimizations deployed
- **Completed:** Responsive layouts, full-width cards, 2-row headers, Tailwind utilities, Bungee/DM Sans typography
- **Remaining:** Landscape CSS polish for mobile/tablet rotation (minor, optional)
- **Deferred to V1.1:** Multi-character word support (4 pts) - parent can add characters separately for V1
- **Deferred to V2:** Belt animations (2 pts), Summary modal enhancements (2 pts), Grade/week UI fields (2 pts backlog)

---

## Epic 8 — Dictionary Quality Completion ☑ COMPLETE
- **Goal:** Complete dictionary quality improvements for 139 multi-pronunciation characters from Nov 2025 audit
- **Status:** Complete (PR #17 merged 2025-11-22)
- **Priority:** HIGH (blocking for multi-pronunciation support)
- **Total Points:** 20 pts
- **Actual Effort:** ~25 hours (Session 10-15)

### Background
**Context:** Nov 2025 comprehensive audit identified 161 characters with malformed multi-pronunciation data (multiple syllables crammed into main array instead of `zhuyin_variants`).

**Total Coverage After Epic 8:**
- ✅ 136 multi-pronunciation characters deployed (35 curated + 101 auto-generated)
- ✅ Drill A guardrails prevent valid alternates from appearing as wrong answers
- ✅ RPC performance optimized (30-40% faster)
- ✅ Input validation prevents crashes from malformed data

---

## Epic 8 — Phases Complete

### **Phase 1 (Migration 010a) — ☑ COMPLETE (Session 10)**
**Date:** 2025-11-10

**Delivered:**
- ✅ 248 characters with empty tone marks → "ˉ" (first tone)
- ✅ 22 critical multi-pronunciation characters (user-reported: 和, 什, plus high-syllable-count cases)
- ✅ Added missing character 麼

**Deliverable:** `supabase/migrations/010a_fix_empty_tones_and_multi_pronunciation.sql`

---

### **Phase 2 (Migrations 011b, 011c, 011d) — ☑ COMPLETE (PR #17, Session 11-15)**
**Date:** 2025-11-22

**Scope - Two Categories:**

**Category 1: Known Multi-Pronunciation (35 chars) - CURATED ✅**
Characters with manually researched context words and meanings:
```
行, 重, 还, 为, 给, 都, 没, 教, 正, 更, 传, 供, 便, 假, 几, 切, 划, 地, 场, 将,
应, 弹, 扫, 把, 担, 相, 省, 种, 系, 结, 觉, 角, 调, 量, 什
```

**Category 2: Ambiguous Cases (101 chars) - AUTO-GENERATED ✅**
Characters with auto-generated data (needs manual curation in future):
```
干, 且, 丽, 么, 乘, 于, 亚, 些, 亲, 仅, 从, 价, 任, 份, 休, 估, 体, 信, 俩, 倒...
[... 81 more - see docs/operational/DICTIONARY_REMAINING_WORK.md for full list]
```

### **Deliverables (PR #17)**

**Migrations:**
- ✅ `supabase/migrations/011b_pattern_a_structure.sql` — 35 curated characters with context words
- ✅ `supabase/migrations/011c_dictionary_multi_pronunciations.sql` — 101 auto-generated characters
- ✅ `supabase/migrations/011d_pronunciation_rpc.sql` — RPC optimization (30-40% faster)

**Code Quality Improvements (Session 15):**
- ✅ New utility: `src/lib/zhuyinUtils.ts` (pronunciation serialization)
- ✅ Type safety: `ConfusionData` interface replaces `any` types
- ✅ Input validation: `validateZhuyinSyllable()`, `validatePronunciation()`
- ✅ Test coverage: +28 new tests (all passing)
- ✅ Performance: N+1 query pattern eliminated

**Documentation:**
- ✅ `docs/operational/DICTIONARY_REMAINING_WORK.md` — Updated with Phase 1 & 2 complete
- ✅ `docs/operational/EPIC_8_PHASE_3_EXPANSION.md` — Future expansion planning
- ✅ `PR_17_PRE_MERGE_CHECKLIST.md` — Comprehensive pre-merge verification

**Scripts:**
- ✅ `scripts/generate-migration-011c.cjs` — Modified to exclude 35 overlapping characters (todo 009 fix)

**Test Files:**
- ✅ `src/lib/practiceQueueService.validation.test.ts` — 15 validation tests
- ✅ `src/lib/practiceQueueService.integration.test.ts` — 10 integration tests
- ✅ `src/lib/drillBuilders.test.ts` — +3 edge case tests (28 total)

### Success Criteria ☑ ALL MET
- [x] 35 Category 1 characters have Pattern A structure with curated context words
- [x] 101 Category 2 characters deployed with auto-generated data
- [x] Drill A guardrails exclude valid alternate pronunciations
- [x] AddItemForm shows "Multiple Pronunciations Detected" for all 136 characters
- [x] RPC performance improved 30-40%
- [x] All 53 tests passing
- [x] TypeScript compilation clean
- [x] Build successful

### **Sessions & Timeline**
- Session 10 (2025-11-10): Dictionary audit, Migration 010a planning
- Session 11 (2025-11-12): Migration 011b (35 curated characters) + Pattern A structure
- Session 12-14 (2025-11-14 to 2025-11-16): Other features, code quality improvements
- Session 15 (2025-11-22): 6-agent code review, 6 todo resolutions, PR #17 finalization
- **Total Time:** ~25 hours across 6 sessions

### **Key Decisions Made**
1. **Pattern A Structure:** Default pronunciation must be FIRST in `zhuyin_variants` array
2. **Phased Approach:** 35 curated + 101 auto-generated (instead of all 136 curated at once)
3. **Data Corruption Prevention:** Modified script to exclude overlapping characters (todo 009)
4. **Performance First:** RPC optimization in same PR as feature (not deferred)
5. **Defensive Programming:** Input validation added proactively (todo 013)

### **Known Limitations (Future Work)**
- 101 auto-generated characters have empty `context_words` arrays (acceptable for V1)
- Manual curation of these 101 characters deferred to future enhancement
- Characters beyond original 139 (e.g., 好, 长, 得) not yet supported
- See Epic 8 Phase 3 below for expansion planning

---

## Epic 8 Phase 3 — Dictionary Expansion ☐ PLANNED
- **Goal:** Expand multi-pronunciation coverage from 136 to 250+ characters
- **Status:** Planned (V1.1+ enhancement)
- **Priority:** Low (non-blocking)
- **Total Points:** 15 pts
- **Documentation:** `docs/operational/EPIC_8_PHASE_3_EXPANSION.md`

### Scope - New Characters Beyond Original 139

**Why Phase 3?**
Epic 8 Phases 1-2 addressed the 139 characters identified in the Nov 2025 audit (malformed data requiring fixes). Phase 3 expands coverage to include NEW multi-pronunciation characters not in the original audit.

**Target Characters (100+ additional):**
- **Category A (30 chars):** High-frequency HSK 1-4 characters
  - Examples: 好 (hǎo/hào), 长 (cháng/zhǎng), 得 (dé/de/děi), 看 (kàn/kān), 分 (fēn/fèn)
- **Category B (50 chars):** Medium-frequency HSK 5-6 characters
- **Category C (20 chars):** Edge cases and regional variants

### Phased Implementation

**Phase 3.1 (Week 1-2): Quick Wins — 6 pts**
- Research 15 high-frequency characters (好, 长, 得, 看, 分, etc.)
- Create Migration 011e with Pattern A structure
- Deploy and gather user feedback

**Phase 3.2 (Week 3-5): Complete Categories A & B — 6 pts**
- Research remaining 15 Category A + first 25 Category B
- Create Migration 011f with 40 characters

**Phase 3.3 (Week 6-8): Finalize — 3 pts**
- Research remaining 25 Category B + all 20 Category C
- Create Migration 011g
- Final audit: 250+ multi-pronunciation characters verified

### Deliverables
- `data/multi_pronunciation_phase3a.json` — 15 high-frequency characters
- `data/multi_pronunciation_phase3b.json` — 40 additional characters
- `data/multi_pronunciation_phase3c.json` — 45 final characters
- `supabase/migrations/011e_dictionary_expansion_phase3a.sql`
- `supabase/migrations/011f_dictionary_expansion_phase3b.sql`
- `supabase/migrations/011g_dictionary_expansion_phase3c.sql`

### Success Criteria
- [ ] 100+ additional multi-pronunciation characters beyond initial 136
- [ ] All additions have Pattern A structure with curated context words
- [ ] Add Item flow shows multi-pronunciation selection for all new characters
- [ ] Drill A guardrails work correctly (no valid alternates as distractors)
- [ ] Dictionary coverage: 250+ multi-pronunciation characters

### Resources
**Detailed Planning:** `docs/operational/EPIC_8_PHASE_3_EXPANSION.md`
- Character selection methodology
- Research process and tools
- Migration generation guide
- Quality verification checklist

**Dictionaries:**
- MDBG Chinese Dictionary: https://www.mdbg.net/
- Taiwan MOE Dictionary: https://dict.revised.moe.edu.tw/
- Pleco app (iOS/Android)

### Notes
- **Not blocking V1 or V1.1** - Pure enhancement for better coverage
- User can still add characters not in Phase 3 (just won't have multi-pronunciation selection)
- Priority determined by user feedback: if users request specific characters, prioritize those
- Can be done incrementally alongside other V1.1 features

---

### Task 7.1 — Landscape & Responsive Fixes ☐
- **Subtask 7.1.1 (2 pts) — Fix TrainingMode portrait/vertical mode layout issues**
  - **UX Issue:** Next button appears below fold in portrait mode after selecting drill option (requires scrolling)
  - Adjust PracticeCard vertical layout to fit all elements in viewport
  - Reduce spacing or adjust button positioning to eliminate scrolling need
  - Test: All buttons (Exit Training, Next, drill options) visible without scrolling in portrait mode
- Subtask 7.1.2 (2 pts) — Refine TrainingMode layout for tablet/mobile landscape (padding, flex wrap)
- Subtask 7.1.3 (2 pts) — Validate portrait ↔ landscape rotation handling in PracticeCard and top bar

### Task 7.2 — UI Polish & Consistency ☐
- Subtask 7.2.1 (1 pt) — Fix sticky action bar button width inconsistency (Add Item vs Launch Training)
- Subtask 7.2.2 (1 pt) — Tighten session summary modal vertical spacing to fit buttons in viewport
- Subtask 7.2.3 (2 pts) — Document/test connectivity workarounds for restrictive Wi-Fi environments
- Subtask 7.2.4 (3 pts) — Provide Supabase seed script + reset instructions for QA/staging datasets

### Task 7.3 — Analytics & Telemetry Prep ☐
- Subtask 7.3.1 (2 pts) — Add optional logging for offline transitions and dictionary misses (for future monitoring)
- Subtask 7.3.2 (1 pt) — Capture belt progression baseline metrics for parent dashboard handoff

---

> Check off subtasks as they're completed; when all subtasks in a task are done, mark the task, then the epic. Update SESSION_LOG.md after each session to reflect progress and new findings from test runs.

---

## Epic 9 — Word-Level Drills ☑ PHASE 1 COMPLETE
- **Goal:** Introduce word-based practice to reinforce character knowledge in vocabulary context
- **Status:** Phase 1 (Drill C) complete, Phase 2 (Drill D) deferred
- **Completed:** 2026-01-12 (Session 23)
- **Priority:** HIGH (user-requested feature)
- **Total Points:** 17 pts (Phase 1) + TBD (Phase 2)
- **Spec Document:** `docs/DRILL_C_WORD_MATCH_SPEC.md`

### Background
**User Testing (Jan 2026):** Interactive prototypes tested with target user (7yo):
- **Drill C (Word Match):** ⭐ FAVORITE - "More interesting than Drill A, easier than sentences"
- **Drill D (Word Hunt):** Fun but timer causes anxiety - defer with relaxed mode
- **Drill E (Sentence Ninja):** Too difficult for current level - defer

**Data Foundation:**
- CCCC Vocabulary (Taiwan MOE): 1,227 words across 3 levels
- Coverage analysis: 500 word pairs immediately usable (79% of 2-char words)
- Constraint: At least one character in each pair must be from kid's learned set

### Phase 1: Drill C — Word Match (配對高手) — 17 pts ☑ COMPLETE

**Concept:** Match character pairs across two columns to form valid 2-character words.

#### Task 9.1 — Data Foundation (3 pts) ☑
- Subtask 9.1.1 (1 pt) — Create `word_pairs` table migration with indexes ☑
- Subtask 9.1.2 (1 pt) — Extend `practice_drill` enum with `word_match` ☑
- Subtask 9.1.3 (1 pt) — Generate seed data from CCCC analysis (500 pairs) ☑

#### Task 9.2 — Validation Pipeline (2 pts) ☑
- Subtask 9.2.1 (1 pt) — Create `scripts/seed-word-pairs.cjs` with validation ☑
- Subtask 9.2.2 (1 pt) — Generate migration SQL and validation report ☑

#### Task 9.3 — Core Service Layer (4 pts) ☑
- Subtask 9.3.1 (2 pts) — `wordPairService.ts` - fetch eligible pairs, generate rounds ☑
- Subtask 9.3.2 (1 pt) — Update `practiceStateService.ts` for word_match scoring ☑
- Subtask 9.3.3 (1 pt) — Add `word_match` to drill selection logic + minimum pairs check ☑

#### Task 9.4 — UI Components (5 pts) ☑
- Subtask 9.4.1 (3 pts) — `WordMatchDrill.tsx` - main drill component with card matching ☑
- Subtask 9.4.2 (1 pt) — Animation states (selected, matched, wrong shake) ☑
- Subtask 9.4.3 (1 pt) — Completed words badge display ☑

#### Task 9.5 — Integration & Testing (3 pts) ☑
- Subtask 9.5.1 (1 pt) — Add to `DrillSelectionModal.tsx` with enable condition ☑
- Subtask 9.5.2 (1 pt) — Integrate with `TrainingMode.tsx` and session summary ☑
- Subtask 9.5.3 (1 pt) — Unit tests for word pair selection and scoring ☑

### Phase 2: Drill D — Word Hunt (詞語獵人) — TBD pts ☐ DEFERRED

**User Feedback:** Game is fun but timer causes anxiety.

**Concept:** Grid of characters - find hidden 2-character words by tapping pairs.

**Planned Changes from Prototype:**
- Remove timer OR make optional "relaxed mode"
- Use same `word_pairs` table as Drill C
- Different UI: grid search vs column matching

**Status:** Deferred until Drill C is complete. Will revisit based on user feedback.

### Success Criteria (Phase 1) ☑ ALL MET
- [x] Kid can match 5 character pairs to form words
- [x] Scoring: +1.0 first try, +0.5 second try, 0 wrong twice
- [x] At least one character per pair from kid's learned set
- [x] Both characters display Zhuyin
- [x] Drill C in selection modal (disabled if <5 eligible pairs)
- [x] Validation pipeline runs autonomously (no manual review needed)
- [x] 500+ validated word pairs seeded

### Known Issues (Filed for Future)
- **Issue #34:** Ambiguous word pairs possible in same round (e.g., 太 could match 陽 or 長)
- **Pending:** Multi-pronunciation context - should show word-specific pronunciation, not default

### Key Design Decisions
1. **Anchor character requirement:** At least one char must be learned; other can be from dictionary
2. **No familiarity tracking:** Word-based drill, familiarity stays character-based
3. **Scoring matches Drill A/B:** +1.0/+0.5/0 per pair
4. **Fixed column positions:** Left = char1, Right = char2 (not mixed)
5. **Zhuyin always visible:** Helps kid sound out unfamiliar characters
6. **Pre-defined table (Option A):** Validation at build time, not runtime

---
