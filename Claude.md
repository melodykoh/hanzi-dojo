# Hanzi Dojo (漢字道場) - Claude Development Context

## 📁 **REPOSITORY ORGANIZATION & SESSION PROTOCOL**

### **MANDATORY: Session Start Organization Check**

**Before ANY work each session:**

1. **Read `REPO_STRUCTURE.md`** — This is the canonical structure reference
2. **Scan root directory** — Flag any scattered files that violate structure
3. **Check for misplaced files:**
   - Root should only have: configs, `CLAUDE.md`, `SESSION_LOG.md`, `REPO_STRUCTURE.md`, `README.md`
   - QA/testing docs belong in `/docs/operational/`
   - Session-specific summaries are redundant (delete them, use `SESSION_LOG.md` instead)
   - All source code belongs in `/src/`
4. **Propose cleanup** before proceeding with feature work

### **Structure Enforcement Principles**

> **"No scattered files. Every file has one obvious home."**

- **Root level**: Minimal — only configs and 4 core docs
- **`/docs`**: Specifications at root, operational docs in `/docs/operational/`
- **`/src`**: All application code with co-located tests
- **Test files**: Always co-located with source (e.g., `drillBuilders.ts` + `drillBuilders.test.ts`)
- **No session archives**: `SESSION_LOG.md` is append-only, single source of truth

### **Documentation Strategy — When to Update Which File**

| File | Purpose | Update When |
|------|---------|-------------|
| **`CLAUDE.md`** | Current state, active priorities, requirements, constraints | • Requirements discovered<br>• Architecture decisions made<br>• Priorities/status change<br>• Known issues evolve |
| **`SESSION_LOG.md`** | Historical narrative, detailed session progress | • Each session: append summary<br>• Major milestones reached<br>• Technical discoveries made<br>• Blockers/resolutions logged |
| **`REPO_STRUCTURE.md`** | Canonical file organization | • New directories added<br>• Structure principles refined<br>• Migration plans created |
| **`/docs/*.md`** | Product specifications | • Requirements finalized<br>• Architecture solidified<br>• Design patterns established |
| **`/docs/operational/*.md`** | QA checklists, testing guides | • Test strategies defined<br>• QA procedures documented<br>• Coverage targets set |

### **Documentation Discipline**

**Always document:**
- ✅ Requirement discoveries → `CLAUDE.md` + `SESSION_LOG.md`
- ✅ Architecture decisions → `CLAUDE.md` + `/docs/TECH_AND_LOGIC.md`
- ✅ Session progress → `SESSION_LOG.md` (append-only)
- ✅ Current priority/status → `CLAUDE.md`

**Never create:**
- ❌ Session-specific summary files (use `SESSION_LOG.md` instead)
- ❌ Scattered markdown files in root
- ❌ Duplicate documentation across multiple files
- ❌ "NEXT_SESSION.md" files (planning belongs in `CLAUDE.md` or `SESSION_LOG.md`)

### **Session Start Checklist**

Before coding:
- [ ] Read `REPO_STRUCTURE.md` to refresh on organization
- [ ] Scan root directory for misplaced files
- [ ] Review `CLAUDE.md` for current priority and constraints
- [ ] Check `SESSION_LOG.md` for recent context
- [ ] Propose cleanup if structure violations found
- [ ] Confirm user's priority for today's session

---

## 🚨 **MANDATORY: Complete Before Any Coding**

### Requirements Gathering Checklist
- [ ] Capture current parent/child practice workflow via user walkthrough
- [ ] Collect 2–3 representative characters/words with expected drill behavior
- [ ] Confirm measurable success metrics (<250 ms drill latency, weekly engagement, data integrity)
- [ ] Enumerate known failure modes (missing dictionary entry, offline usage, duplicate adds)
- [ ] Summarize requirements for user sign-off
- [ ] Define automatic disqualifiers (e.g., characters lacking Zhuyin/Trad pairing)

### Initial Discovery Questions to Ask (if unanswered)
1. How are characters currently tracked and reviewed manually?
2. What constitutes a successful training session for parent and child?
3. Provide examples of tricky characters (tone variants, identical Trad/Simp) we must handle.
4. Which entries should be excluded or deferred?
5. Is accuracy more critical than speed, and what is the tolerance for wrong retries?
6. How should the system react when the child encounters an unsupported character?

---

## 📋 **PROJECT REQUIREMENTS**

### What We're Building
- A React + Supabase dojo-themed trainer where children practice Mandarin characters through Drill A (Zhuyin recognition) and Drill B (Simplified→Traditional) with familiarity scoring (+1.0 / +0.5) driving belt progression.
- Parent console manages entries, monitors analytics (weekly familiarity, accuracy, known count), and launches full-screen kid training mode (landscape-optimized, parent supervision assumed).

### Current Manual Workflow
- Pending user walkthrough; assumption: parent currently curates character lists offline (spreadsheets/flashcards) and coaches pronunciation manually.
- Document actual steps once confirmed; align UI flows with that cadence (add character → practice → review).

### Success Metrics
- **Primary:** Drill interactions respond within <250 ms and familiarity updates correctly.
- **Secondary:** Weekly familiarity gains visible to parents; belts progress without regression; dictionary auto-fill success rate improves over time.
- **Quality thresholds:** No orphaned entries without Supabase dictionary backing; offline guard prevents training without connectivity.

### Automatic Disqualifiers
- Characters lacking Zhuyin or Traditional mapping after manual override
- Entries that duplicate existing ones for the same kid + drill
- “Add Item” attempts while offline (show guardrail instead)

### Edge Cases & Error Handling
- Identical Simplified/Traditional pairs disable Drill B automatically.
- Multi-reading characters require parent confirmation of the intended Zhuyin.
- Missing dictionary results prompt manual entry and are logged in `dictionary_missing`.
- Offline training attempt pauses session with themed modal until network recovers.

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### Design Decision: Adopt Supabase-centric dictionary & per-drill practice state
- Frontend (React + Vite + TS) consumes Supabase RPCs for dictionary lookups and persists familiarity state in IndexedDB for responsiveness.
- Backend (Supabase Postgres) stores per `(kid, entry, drill)` counters, curated confusion maps, and missing-entry logs; RLS ties all data to the authenticated parent.
- Training mode runs full-screen (landscape-optimized) with simple "Exit Training" button to return to dashboard; parent supervision assumed (no passcode needed).

### Component Validation Requirements
- [ ] Validate Add Item inputs (Zhuyin tones, duplicate detection, drill applicability)
- [ ] Validate drill output (4 distinct options, correct answer present)
- [ ] Attach familiarity increment/decrement confidence (first vs second try)
- [ ] Provide fallbacks (manual entry, heuristic distractors, offline guard)
- [ ] Instrument logs (practice events, dictionary misses, error reporting)

### Data Flow
1. Parent adds character → frontend calls Supabase dictionary RPC → receives canonical mapping or “missing” notice → optional manual override → entry stored with `applicable_drills`.
2. Kid training fetches queue per drill ordered by familiarity/struggle state, renders options using confusion data.
3. Each attempt writes to `practice_events`, updates `practice_state` counters, recalculates familiarity in UI.
4. Dashboard aggregates familiarity (weighted sums), accuracy (correct attempts / total), belts (threshold table), known status (computed rule).

---

## ✅ **DEVELOPMENT STANDARDS FOR THIS PROJECT**

### Technical Standards Reference
- Pending `docs/operational/DEVELOPMENT_CHECKLIST.md`; until then, follow this guide and root docs.

### Before Each Feature
1. Confirm requirements with user; list acceptance criteria.
2. Present 2–3 solution options (especially for new drills or data flows).
3. Ship minimal end-to-end path (dictionary lookup → drill render → familiarity update) before enhancements.
4. Test against real characters provided by the user (tones, identical Trad/Simp, multi-reading cases).

### During Development
- Validate inputs at every boundary (forms, RPC payloads).
- Treat external data as untrusted; handle missing/conflicting dictionary data gracefully.
- Surface confidence context in UI copy (e.g., when manual data is used).
- Emit actionable errors (what failed, how it impacts parent/kid experience).
- Exercise offline guard scenarios and training mode transitions.

### Definition of Done
- [ ] Feature works end-to-end with production-like data
- [ ] Input validation catches malformed/duplicate entries
- [ ] Failures map to specific components with recovery paths
- [ ] Logic mirrors agreed manual workflow and dojo narrative
- [ ] User (parent) has reviewed behavior and confirmed acceptance

---

## 📝 **DISCOVERED REQUIREMENTS LOG**
- **2025-11-03 (Session 1):** Familiarity scoring (+1.0/+0.5) replaces stored known flag; known computed per drill with demotion after two misses.
- **2025-11-03 (Session 1):** Supabase dictionary tables (`dictionary_entries`, `dictionary_confusions`, `dictionary_missing`) instituted; missing lookups logged for future seeding.
- **2025-11-03 (Session 1):** Training mode runs full-screen landscape-optimized; manual exports deferred to V1.1 automatic backups.
- **2025-11-04 (Session 3):** Removed parent passcode system - kid won't navigate away, parent supervision assumed; simplified Epic 4 scope.
- **2025-11-03 (Session 1):** User workflow documented: Weekly newsletter → homework → weekend practice → storybook reading ad-hoc entry.
- **2025-11-03 (Session 1):** Multi-pronunciation characters (着/著, 了) require context selection during Add Item with example words.
- **2025-11-03 (Session 1):** Initial dictionary seed: 150 characters (HSK 1-2 + user's Week 1 curriculum); expand to 500 guided by `dictionary_missing`.
- **2025-11-03 (Session 2):** Dictionary client uses in-memory caching (Map) for session; IndexedDB deferred to Epic 4+ if offline persistence needed.
- **2025-11-03 (Session 2):** Dictionary RLS policies allow public reads (reference data) but restrict writes to admin/service role.
- **2025-11-03 (Session 2):** Zhuyin displayed horizontally (ㄓㄠˊ) matching book format, not vertically stacked.
- **2025-11-03 (Session 2):** Missing entry logging deduplicates per session to avoid spam from repeated searches of same character.
- **2025-11-04 (Session 4):** Offline detection uses dual check (navigator.onLine + Supabase test query) to avoid false positives; training pauses automatically with dojo-themed modal.
- **2025-11-04 (Session 4):** React Router navigation implemented: `/` for dashboard, `/training` for full-screen training mode; browser back button supported.
- **2025-11-04 (Session 4):** Add Item and other database operations blocked when offline with visual indicators and clear messaging.
- **2025-11-04 (Session 4):** Landscape CSS needs polish - layout breaks/looks messy when rotating to landscape on mobile devices.
- **2025-11-04 (Session 4):** Automated test infrastructure complete (Vitest + 77 test cases) but tests need function signature alignment before running (deferred to Epic 6).
- **2025-11-04 (Session 5):** Established REPO_STRUCTURE.md as canonical file organization reference; SESSION_LOG.md is single source of truth for session history (no separate summary files).
- **2025-11-04 (Session 5):** Offline mode must block ALL drill interactions via pointer-events-none, not just show badge - prevents data loss from unsynced practice attempts.
- **2025-11-04 (Session 5):** Mobile portrait button layout uses responsive flex-col/flex-row with wrapping to prevent overflow on small screens.
- **2025-11-04 (Session 5):** Landscape training mode requires full-width layout (w-full, responsive padding) and proper rotation handling to prevent layout squeeze bugs.
- **2025-11-04 (Session 5):** Add Item form uses 300ms debounced dictionary lookup to balance responsiveness with API efficiency; manual override enables entry when dictionary lookup fails.
- **2025-11-04 (Session 5):** Dashboard metrics computed client-side from practice_state table for real-time accuracy; sparkline aggregates last 7 days of practice_events for visual progress tracking.
- **2025-11-05 (Session 6 - AI-8 QA):** Real Supabase Auth test account (`test@hanzidojo.local`) replaces hardcoded UUIDs; auto-login enabled for Epic 5 testing.
- **2025-11-05 (Session 6 - AI-8 QA):** Dictionary lookup RPC fixed to search both simplified AND traditional columns; manual override checkbox removed from AddItemForm (always editable now).
- **2025-11-05 (Session 6 - AI-8 QA):** Epic 5.5 scoped and implemented: Primary actions moved to sticky header bar; pre-training drill selection modal with proficiency metrics; recommendation logic prioritizes accuracy over recency; dashboard widget shows drill balance.
- **2025-11-05 (Session 6 - Epic 5.5):** Proficiency-based drill recommendations use: (1) struggling items (consecutive_miss >= 2), (2) never-practiced drills, (3) accuracy gap >= 15%, (4) balanced if similar performance.
- **2025-11-04 (Session 5):** Home network AP isolation blocks mobile testing; desktop mobile simulation provides effective alternative until router configured.

---

## 🎯 **CURRENT PRIORITY**
- **Epic 1 (Requirements & Dictionary Foundations):** ✅ COMPLETE
- **Epic 2 (Supabase Dictionary Services):** ✅ COMPLETE
- **Epic 3 (Practice State & Familiarity Logic):** ✅ COMPLETE
- **Epic 4 (Training Mode UX & Guardrails):** ✅ COMPLETE
- **Epic 5 (Entry Management & Belt System):** ✅ COMPLETE
- **Epic 5.5 (UX Refinement: Priority Actions & Drill Selection):** ✅ COMPLETE
- **Epic 6 (QA, Testing & Release Readiness):** **IN PROGRESS** (34 of 41 pts complete - 83%)

**Status:** Excellent progress on Epic 6! All critical bugs fixed and tested. Repository structure cleaned. README.md created.

**Epic 6 Completed Tasks:**
- ✅ **Task 6.3 - Entry Catalog (6 pts)** - RELEASE BLOCKER RESOLVED
  - Sortable/filterable catalog with 3 sort options, 5 filter options
  - Details modal with drill-by-drill stats
  - Delete with confirmation, Practice button opens drill selection
  - Icon improvement: Changed Drill A from 🔤 to ㄅ (Zhuyin character)
- ✅ **Task 6.4 - Dashboard Metrics Simplification (6 pts)**
  - 4 streamlined tiles: All-Time Points, Last Practiced, Accuracy Streak, Characters Mastered
  - Session-based accuracy tracking (2-hour windows)
  - Dual streaks: improving + perfect sessions
  - Removed confusing weekly familiarity and sparkline
- ✅ **Session 7 Bug Fixes (8 pts equivalent)** - 2025-11-09
  - Fixed Bug 6.1.5: Manual Zhuyin input with numeric tone notation (3 pts)
  - Fixed Bug 6.1.6: Exit Training shows summary mid-session (2 pts)
  - Fixed Bug 6.1.7: Drill B duplicate character options (3 pts)
  - Fixed EntryCatalog details modal "Zhuyin display pending"
  - Fixed Continue Training repeating same character
  - Fixed Zhuyin text wrapping in drill options (UX)
  - Repository cleanup: Deleted scattered session summary file
  - Created comprehensive README.md

**All Original Bugs:** ✅ **RESOLVED & TESTED**

**QA Testing Status:**
- ✅ AI-8: Add Item → Practice flow
- ✅ DM-2: Dashboard Metrics (completed with redesign)
- ✅ NET-1: Offline transitions

**Next Steps:**
1. **Epic 6 Remaining Tasks:**
   - **Priority 1:** Task 6.2 - Authentication & deployment (12 pts)
     - Remove auto-login from Dashboard.tsx
     - Implement proper login/signup UI
     - Deploy to Vercel production
   - **Priority 2:** Task 6.1 - Automated test alignment (15 pts - can defer)
     - Update test signatures to match current code
     - Implement Supabase mocking
     - Integration tests
2. **Epic 7 - Polish** (7 pts - UX improvements)
   - Landscape scrolling fix (layout redesign)
   - Portrait mode spacing
   - Button width consistency

---

## ⚠️ **KNOWN LIMITATIONS & CONSTRAINTS**
- Single child supported in V1; schema allows future multi-child but UI not exposed yet.
- Dictionary seed currently targets ~500 characters; expect manual overrides until backlog processed.
- Offline training blocked; requires connectivity for Supabase RPCs (acceptable per user).
- Audio pronunciation and story/sentence drills deferred to later roadmap.
- **Landscape mode scrolling (Epic 7):** On mobile landscape, Training Mode requires vertical scrolling to see Next button after selecting options. Requires layout redesign to fit all elements in viewport. Deferred to Epic 7 polish phase.

### **⚠️ TEMPORARY: Epic 5 Testing Uses Auto-Login**
For Epic 5 testing, the Dashboard auto-logs in with test credentials:
- **Email:** `test@hanzidojo.local`
- **Password:** `testpassword123`
- **Setup:** See `docs/operational/EPIC5_TESTING_SETUP.md`

**Epic 6 Changes Required:**
- Remove auto-login code from `Dashboard.tsx` useEffect
- Implement proper login/signup UI
- Delete test account from Supabase Auth

---

## 🔄 **FUTURE ENHANCEMENTS**
- V1.1: Automatic Supabase backups, streak tracking, larger dictionary seed, animated belts.
- V2: Story mode, sentence drills, multi-child and teacher cohorts, Sensei Zì interactive guide.
- V3+: Adaptive spacing, analytics dashboards, voice pronunciation, PWA installability.

---

## 📚 **KEY REFERENCES**
- `/docs/HANZI_DOJO_OVERVIEW.md`
- `/docs/DESIGN_AND_UI.md`
- `/docs/TECH_AND_LOGIC.md`
- `/docs/DEVELOPMENT_AND_DEPLOYMENT.md`
- `/docs/ROADMAP.md`
- `SESSION_LOG.md`

---

## 🧭 **DEVELOPMENT GUIDANCE**

### Project-Specific Context
- Training emulates dojo discipline: accuracy over speed, belts as motivation.
- Parent console must remain calm, informative, bilingual-friendly; kid mode emphasizes large touch interaction and Sensei feedback.
- Dictionary-backed auto-fill is core to reducing parent friction; manual entry must feel guided.

### Validation Requirements
- [ ] Graceful handling of incomplete dictionary data (manual override + logging)
- [ ] Confidence indicators when manual data is used
- [ ] Clear attribution when drills fail (dictionary missing vs. Supabase error)
- [ ] End-to-end flows verified with real character samples from the family’s curriculum
- [ ] Success tracked against weekly familiarity gains and belt milestones

### Collaborative Checkpoints
- Before major changes: “Does this align with your family’s study routine?”
- After implementation: “Try this with today’s characters—does it match expectations?”
- When issues arise: “Should we adjust the approach or add safeguards?”
- Before scaling features: “Are we ready to expand dictionary coverage or introduce new drills?”

---

## 📋 **SESSION HISTORY**
- **Session 1 (2025-11-03):** ✅ Epic 1 Complete — Documented requirements, assembled 150-character dictionary seed, created Supabase schema migrations, validated user's Week 1 curriculum characters. See `SESSION_LOG.md` for details.
- **Session 2 (2025-11-03):** ✅ Epic 2 Complete — Set up Supabase + React frontend, imported 155 characters, built dictionary lookup RPCs with caching, implemented missing entry logging and analytics dashboard. See `SESSION_LOG.md` for details.
- **Session 3 (2025-11-04):** ✅ Epic 3 Complete — Built complete practice system: state service with scoring logic, queue service with priority ordering, drill builders for Zhuyin and Traditional with confusion maps, interactive practice UI with attempt tracking, feedback toast with Sensei messages, dynamic known badges. See `SESSION_LOG.md` for details.
- **Session 4 (2025-11-04):** ✅ Epic 4 Complete — Implemented full-screen training mode with React Router navigation, landscape-optimized layout, Exit Training button, offline detection service with Supabase connection checks, dojo-themed pause modal, OfflineGuard wrapper, offline-aware button components, and connection status badge. Successfully built and tested end-to-end. See `SESSION_LOG.md` for details.
- **Session 5 (2025-11-04):** ✅ Epic 5 Complete — Built Add Item form (440 lines) with dictionary auto-fill, multi-pronunciation handling, and validation; implemented Dashboard Metrics (375 lines) with real-time calculations and 7-day sparkline; created 27 automated test cases; updated QA docs to 52 manual tests; fixed import errors (dictionaryClient.lookup, dictionaryLogger.logMissingEntry); implemented temporary hardcoded test kid ID workaround. Code complete, awaiting manual QA next session. See `SESSION_LOG.md` for details.

---

## 🔧 **CLAUDE.MD MAINTENANCE**
1. Update current priority and requirement log entries each session.
2. Record major decisions here; use `SESSION_LOG.md` for detailed narratives.
3. When file grows long, archive older context into `SESSION_LOG.md` to keep this guide concise.
4. Keep requirements, constraints, and checkpoints current so future sessions ramp quickly.
