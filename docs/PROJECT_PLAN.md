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

## Epic 7 — Mobile Polish & Field Readiness ☐ PENDING
- **Goal:** Resolve remaining UX polish gaps discovered during device testing and document operational guardrails.
- **Deferred to V1.1:** Multi-character word support (4 pts) - parent can add characters separately for V1
- **Deferred to V2:** Belt animations (2 pts), Summary modal enhancements (2 pts), Grade/week UI fields (2 pts backlog)

---

## Epic 8 — Dictionary Quality Completion ☐ PLANNED
- **Goal:** Complete dictionary quality improvements for remaining 139 multi-pronunciation characters
- **Status:** Planned (Post-V1)
- **Priority:** Medium
- **Total Points:** 20 pts (research-heavy, phased approach)

### Background
**Context:** Nov 2025 comprehensive audit identified 161 characters with malformed multi-pronunciation data (multiple syllables crammed into main array instead of `zhuyin_variants`).

**Migration 010a (Phase 1) Fixed:**
- ✅ 248 empty tone marks → "ˉ" (first tone)
- ✅ 22 critical multi-pronunciation characters (user-reported: 和, 什, plus high-syllable-count cases)
- ✅ Added missing character 麼

**Remaining Work:**
- 139 characters still have malformed data (86% → 100% completion needed)

### Scope - Two Categories Requiring Different Approaches

**Category 1: Known Multi-Pronunciation (37 chars) - HIGH PRIORITY**
```
为, 传, 供, 便, 假, 几, 切, 划, 地, 场, 将, 干, 应, 弹, 扫, 把, 
担, 教, 更, 正, 没, 相, 省, 种, 系, 结, 给, 行, 觉, 角, 调, 
还, 都, 重, 量
```
These are confirmed multi-pronunciation in standard dictionaries (e.g., 行 xíng/háng, 重 zhòng/chóng). Need context word research and proper `zhuyin_variants` structure.

**Category 2: Ambiguous Cases (102 chars) - MEDIUM PRIORITY**
```
且, 丽, 么, 乘, 于, 亚, 些, 亲, 仅, 从, 价, 任, 份, 休, 估, 体,
[... 86 more - see docs/operational/DICTIONARY_REMAINING_WORK.md for full list]
```
These have 2 syllables but unclear if multi-pronunciation or data errors. Requires triage using MDBG/Taiwan MOE dictionaries.

### Task 8.1 — Research & Triage (12 pts)
**8.1.1 (5 pts) — Research Category 1 Characters**
- For each of 37 known multi-pronunciation characters:
  - Document all pronunciation variants (pinyin + zhuyin)
  - Find 2-3 context words per variant
  - Identify most common usage (becomes default)
  - Source: MDBG, Taiwan MOE Dictionary, Pleco
- Output: `data/multi_pronunciation_category1.json`
- Timeline: ~6 hours (37 chars × 10 min each)

**8.1.2 (5 pts) — Triage Category 2 Characters**
- For each of 102 ambiguous characters:
  - Check MDBG/Taiwan MOE for multiple pronunciations
  - Classify as: multi-pronunciation, data error, or regional variant
  - Document decision rationale
  - If multi-pronunciation: research variants as in 8.1.1
  - If data error: identify correct single pronunciation
- Output: `data/multi_pronunciation_category2.json` with classifications
- Timeline: ~8 hours (102 chars × 5 min each)

**8.1.3 (2 pts) — Create Migration Generator Script**
- Node.js script to convert JSON research data → SQL UPDATE statements
- Generate: `supabase/migrations/011_dictionary_quality_phase2.sql`
- Include verification queries and rollback capability
- Timeline: ~2 hours

### Task 8.2 — Apply Migration (5 pts)
**8.2.1 (3 pts) — Test Migration on Staging**
- Apply generated migration to local Supabase instance
- Verify variant selection UI appears in AddItemForm for 20 sample characters
- Test drill generation with corrected pronunciations
- Document any issues discovered
- Timeline: ~2 hours

**8.2.2 (2 pts) — Production Deployment**
- Follow Database Safety Protocol (docs/operational/DICTIONARY_MIGRATION_GUIDE.md)
- Apply Migration 011 to production
- Run verification queries
- Confirm 0 malformed multi-pronunciation characters remaining
- Timeline: ~1 hour

### Task 8.3 — Documentation & Verification (3 pts)
**8.3.1 (2 pts) — End-to-End Testing**
- Test AddItemForm variant selection for 10 chars from each category
- Verify drills use selected pronunciation correctly
- Confirm user can review/change pronunciation in Entry Catalog
- Document in SESSION_LOG.md
- Timeline: ~1.5 hours

**8.3.2 (1 pt) — Update Documentation**
- Mark Epic 8 complete in PROJECT_PLAN.md
- Update CLAUDE.md dictionary status to 100% coverage
- Archive research files in `data/archive/`
- Timeline: ~30 minutes

### Phased Rollout Strategy (Recommended)

**Phase 1 (Week 1-2): High-Value Quick Wins**
- Research top 10 most common Category 1 characters (行, 重, 还, 为, 给, 都, 没, 教, 正, 更)
- Create Migration 011a with just these 10
- Deploy and verify user impact
- **Points:** ~8 pts

**Phase 2 (Week 3-4): Complete Category 1**
- Research remaining 27 Category 1 characters
- Create Migration 011b
- **Points:** ~6 pts

**Phase 3 (Week 5-8): Category 2 Triage & Fix**
- Triage all 102 ambiguous characters
- Create Migration 011c for confirmed multi-pronunciation
- Create Migration 011d to fix data errors
- **Points:** ~6 pts

### Success Criteria
- [ ] All 37 Category 1 characters have proper `zhuyin_variants` with context words
- [ ] All 102 Category 2 characters resolved (either variants or single pronunciation)
- [ ] Comprehensive audit shows 0 malformed multi-pronunciation characters
- [ ] AddItemForm shows variant selection for all true multi-pronunciation characters
- [ ] Dictionary coverage: 1,000 entries, 100% properly structured

### Deliverables
- `data/multi_pronunciation_category1.json` — Researched variant data (37 chars)
- `data/multi_pronunciation_category2.json` — Triaged classification + data (102 chars)
- `supabase/migrations/011_dictionary_quality_phase2.sql` — Complete migration (or 011a/b/c/d if phased)
- Updated `docs/operational/DICTIONARY_REMAINING_WORK.md` — Progress tracking

### Resources & Research Tools
**Dictionaries:**
- MDBG Chinese Dictionary: https://www.mdbg.net/
- Taiwan MOE Dictionary: https://dict.revised.moe.edu.tw/
- Pleco app (iOS/Android)

**Verification Tools:**
- `scripts/verify-multi-pronunciation-complete.js` — Re-run audit after migration
- `scripts/triage-results.json` — Initial audit findings

**Documentation:**
- `docs/operational/DICTIONARY_REMAINING_WORK.md` — Detailed character lists and research checklist
- `docs/operational/DICTIONARY_MIGRATION_GUIDE.md` — Database safety protocol
- `docs/operational/MULTI_PRONUNCIATION_REVIEW.md` — Sample research format

### Risks & Mitigation
**Risk 1: Ambiguous pronunciations**
- Some characters have context-dependent pronunciation that's hard to capture
- **Mitigation:** Use most common pronunciation as default; rely on parent manual selection

**Risk 2: Taiwan vs Mainland differences**
- Regional pronunciation variations exist
- **Mitigation:** Prioritize Taiwan standard (project uses Traditional Chinese); document variants

**Risk 3: Time commitment**
- Research-heavy work requires significant manual effort
- **Mitigation:** Use phased approach; prioritize high-frequency characters first

### Timeline Estimate
- **Research (Category 1):** 6 hours
- **Research (Category 2):** 8 hours  
- **Implementation:** 3 hours
- **Testing & Documentation:** 2 hours
- **Total:** 19 hours (~2-3 weeks part-time work)

### Notes
- Epic 8 is **non-blocking** for V1 production
- Can be completed incrementally (phased approach recommended)
- User can manually override pronunciations in meantime via AddItemForm
- Migration 010a already resolves user's immediate pain points (和, 因, 星, 它, 麼)

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

> Check off subtasks as they’re completed; when all subtasks in a task are done, mark the task, then the epic. Update SESSION_LOG.md after each session to reflect progress and new findings from test runs.
