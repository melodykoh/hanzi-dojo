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

### **Deployment Workflow Checklist**

For significant changes (>50 lines or >3 files):
- [ ] Create feature branch: `git checkout -b feature/name`
- [ ] Commit with descriptive message and co-author
- [ ] Push branch: `git push -u origin feature/name`
- [ ] Create PR: `gh pr create --title "..." --body "..." --base main`
- [ ] Wait for Vercel preview (~2 min), test thoroughly
- [ ] Merge via GitHub UI or `gh pr merge <#>`
- [ ] Update local: `git checkout main && git pull`
- [ ] Clean up: `git branch -d feature/name`
- [ ] Verify production at https://hanzi-dojo.vercel.app

**Reference:** `docs/DEVELOPMENT_AND_DEPLOYMENT.md` for full workflow

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

## 🗄️ **DICTIONARY STATUS**

### **Migration 010a (2025-11-10) - Phase 1 Complete**
**Fixed:**
- ✅ 248 characters with empty tone marks → "ˉ" (first tone)
- ✅ 22 critical multi-pronunciation characters with proper `zhuyin_variants`
- ✅ Added missing character 麼

**Deferred to Epic 8 (139 characters):**
- 📋 37 known multi-pronunciation characters (needs context research)
- 📋 102 ambiguous 2-syllable characters (needs triage)

**Coverage:**
- Total entries: 1,000 characters
- Properly structured: 862 characters (86%)
- Known correct variants: 2 characters (了, 着)
- Remaining work: Epic 8 in `docs/PROJECT_PLAN.md` (139 chars, 20 pts, phased approach)

---

## 📝 **KEY ARCHITECTURAL DECISIONS**

**These decisions shape current implementation - historical context in SESSION_LOG.md**

### Scoring & Progression
- Familiarity scoring: +1.0 first try, +0.5 second try, 0 for wrong twice
- Known status: computed dynamically per drill (not stored flag)
- Demotion rule: 2+ consecutive misses removes "known" status until 2 new successes

### Dictionary System
- Multi-pronunciation characters use `zhuyin_variants` with context words (e.g., 着/著: zháo/zhuó/zhe)
- **Pattern A structure:** Default pronunciation included as FIRST element in `zhuyin_variants` array
  - Provides context words for ALL pronunciations (default + alternates)
  - Example: 什 has variants `[{shén, context:["什么"]}, {shí, context:["什锦"]}]`
  - Decision (Session 11): Unify all multi-pronunciation chars to Pattern A for consistency
- Dictionary lookup searches both simplified AND traditional columns
- Missing entries logged to `dictionary_missing` for expansion tracking
- Reference: `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`

### Training Mode UX
- Full-screen landscape-optimized for tablets
- Simple "Exit Training" button (no passcode - parent supervision assumed)
- Offline detection: dual check (navigator.onLine + Supabase test query)
- Training pauses automatically when offline with dojo-themed modal

### Data Architecture
- Per-drill practice state: `(kid_id, entry_id, drill)` with separate counters
- Dictionary: public read-only reference data
- User data: protected by RLS tied to `auth.uid()`
- Practice events: immutable append-only log for analytics

### UI/UX Patterns
- Zhuyin displayed horizontally (ㄓㄠˊ) matching Taiwan textbook format
- Suppress first-tone marker (ˉ) in Zhuyin display to align with common textbook conventions
- 300ms debounced dictionary lookup for responsiveness
- Drill selection modal before training (proficiency-based recommendations)
- Sticky action bar for primary functions (Add Item, Launch Training)

### Dashboard Tabs - User-Facing Features
**Decision (Session 8, Nov 10 2025):** Keep useful tools visible, hide only pure developer metrics

**Visible Tabs (5 total):**
- **Dashboard** - Progress metrics, weekly stats, belt progression
- **My Characters** - Entry catalog management
- **Practice Demo** - Test drills without affecting kid stats (sandbox mode, mockMode=true)
- **Dictionary** - Lookup characters before adding (check if in dictionary, view Zhuyin/variants)
- **Missing** - Track missing dictionary entries (helps plan Epic 8 expansion)

**Hidden Tab:**
- **Analytics** - Cache hit rates, dictionary client stats (developer metrics only, no user value)

**Rationale:** 
- Practice Demo useful for parents to preview drills
- Dictionary Lookup saves time (check before adding)
- Missing Entries helps planning (know what needs seeding)
- Analytics is purely technical (cache performance, not actionable for users)

**Developer access to Analytics:** 
- Uncomment in Dashboard.tsx (lines ~190-200)
- Console: `dictionaryClient.getStats()`

**Other removals:**
- **Batch Test button** - Removed from Dictionary Demo (Session 8, cache testing only)

**For detailed historical context and session-by-session discoveries, see:** `SESSION_LOG.md`

---

## 🎯 **CURRENT STATUS & PRIORITIES**

### **Production Status**
🎉 **V1 DEPLOYED** - https://hanzi-dojo.vercel.app (Nov 2025)
- Supabase Auth: Email confirmation enabled, multi-user ready
- Dictionary: 1,067 characters (HSK 1-4), 86% properly structured
- All core features complete: Drills A/B, familiarity scoring, entry management, training mode

### **Session 9 Complete (Nov 12, 2025)** ✅
**Status:** Mobile polish + repository cleanup complete

**Completed & Deployed:**
1. ✅ **PR #8** - Mobile header uniformity (fixed dashboard action button wrapping/height)
2. ✅ **PR #9** - Hide first-tone marker (ˉ) in Zhuyin display (preserves data integrity, matches textbook format)
3. ✅ **Shared Zhuyin helper** - Created `src/lib/zhuyin.ts` for consistent formatting
4. ✅ **Repository cleanup** - Organized scattered files per REPO_STRUCTURE.md
5. ✅ **PROJECT_PLAN.md updated** - Marked bugs 6.1.5, 6.1.6, 6.1.7 as complete

**Session 8 Complete (Nov 10, 2025):** Migration 010a (248 tone marks + 22 multi-pronunciation + 麼), Multi-pronunciation review UI (PR #1), Bug fixes #2-#7 (5 PRs), Production data cleanup (86 → 9 entries), Dictionary logger validation

**Next Priority:** Epic 8 Phase 1 - Dictionary Quality (10 high-frequency characters, ~3 hrs)

### **Epic Status Overview**
- Epic 1-6: ✅ COMPLETE (V1 production deployed)
- Epic 7: ☐ PENDING (Mobile polish - 7 pts, optional)
- Epic 8: ☐ PLANNED (Dictionary completion - 20 pts, 139 chars, phased over 2-3 weeks)

**Detailed epic breakdown:** `docs/PROJECT_PLAN.md`  
**Session history:** `SESSION_LOG.md`

---

## ⚠️ **KNOWN LIMITATIONS & CONSTRAINTS**

### V1 Scope Boundaries
- **Single child only:** Schema supports multi-child but UI not exposed yet (V2 feature)
- **Offline training blocked:** Requires Supabase connection for practice state (acceptable per user)
- **Dictionary coverage:** 1,067 chars (86% structured), 139 chars deferred to Epic 8
- **No audio/stories:** Audio pronunciation and story drills deferred to V2+

### Open Issues
- **Mobile landscape:** Next button requires scrolling after option selection (Epic 7, optional polish)

### Recently Fixed

**Session 9 (Nov 12, 2025):**
- ✅ Mobile header button wrapping on narrow screens (PR #8)
- ✅ First-tone marker (ˉ) display in Zhuyin (PR #9)

**Session 8 (Nov 10, 2025):**
- ✅ **Bug #2** - Entry Catalog refresh after add character (PR #2)
- ✅ **Bug #4** - Auth persistence across browser restarts (PR #3)
- ✅ **Bug #5** - Practice Demo Zhuyin layout in portrait mode (PR #5)
- ✅ **Bug #6** - Dictionary UI button cutoff on mobile (PR #5)
- ✅ **Bug #7** - Practice Demo writing to production database (PR #4)

**Epic 6 (Pre-Session 8):**
- ✅ **Bug 6.1.5** - Manual Zhuyin input for missing dictionary entries (AddItemForm.tsx)
- ✅ **Bug 6.1.6** - Exit Training summary modal when clicked mid-session (TrainingMode.tsx)
- ✅ **Bug 6.1.7** - Drill B duplicate character options prevented (drillBuilders.ts)

### Test Account (Can be deleted)
- Email: `test@hanzidojo.local`
- Password: `testpassword123`
- Purpose: Used during Epic 5-6 development, production testing complete

---

## 🔄 **FUTURE ENHANCEMENTS**

**Detailed roadmap:** `docs/ROADMAP.md`

### V1.1 (Refinement)
- Bulk character upload with CSV validation workflow
- Automatic Supabase backups to Storage
- Streak tracking and daily practice reminders
- Complete Epic 8 (139 remaining dictionary characters)
- Animated belt progression

### V2 (Expansion)
- Story mode: "Scrolls of Hanzi" using known characters
- Sentence practice drills
- Multi-child profiles per parent
- Teacher/classroom cohort features
- Sensei Zì interactive guide mascot

### V3+ (Intelligence)
- Adaptive spaced repetition
- Voice pronunciation checking
- Parent analytics dashboards
- PWA offline installability

---

## 📚 **DOCUMENTATION MAP**

### Start Here
- **`CLAUDE.md`** (this file) - Current state, active priorities, quick reference
- **`SESSION_LOG.md`** - Detailed session history and technical discoveries
- **`REPO_STRUCTURE.md`** - File organization rules and structure enforcement

### Product Specifications
- **`docs/HANZI_DOJO_OVERVIEW.md`** - Product definition, objectives, core features
- **`docs/REQUIREMENTS.md`** - Functional requirements, user stories, edge cases
- **`docs/DESIGN_AND_UI.md`** - UI/UX specs, dojo theme, component guidelines
- **`docs/TECH_AND_LOGIC.md`** - Database schema, scoring algorithms, drill logic
- **`docs/ROADMAP.md`** - V1/V1.1/V2/V3+ feature planning

### Implementation & Operations
- **`docs/PROJECT_PLAN.md`** - Epic breakdown, task tracking, story points
- **`docs/operational/QA_MANUAL_ONLY.md`** - Manual test scenarios
- **`docs/operational/DICTIONARY_MIGRATION_GUIDE.md`** - Database safety protocol
- **`docs/operational/DICTIONARY_REMAINING_WORK.md`** - Epic 8 tracking (139 chars)

### Development Resources
- **`docs/DEVELOPMENT_AND_DEPLOYMENT.md`** - Setup guide, testing, deployment
- **`scripts/`** - Audit tools, migration generators, verification scripts
- **`data/`** - Dictionary seeds, confusion maps, research outputs

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

## 📋 **QUICK SESSION SUMMARY**

**Most Recent Sessions:**
- **Session 7 (Nov 9, 2025):** V1 production deployed; dictionary expanded 155→1,067 chars
- **Session 8 (Nov 10, 2025):** Dictionary audit (161 malformed chars found); Migration 010a prepared (fixes 270 chars)

**Milestone Sessions:**
- Session 1-2: Requirements + dictionary foundation + Supabase setup
- Session 3: Complete practice system (scoring, queues, drills)
- Session 4-5: Training mode + entry management + dashboard
- Session 6: QA, auth, catalog, production deployment

**Complete session-by-session details:** `SESSION_LOG.md`

---

## 🔧 **CLAUDE.MD MAINTENANCE**
1. Update current priority and requirement log entries each session.
2. Record major decisions here; use `SESSION_LOG.md` for detailed narratives.
3. When file grows long, archive older context into `SESSION_LOG.md` to keep this guide concise.
4. Keep requirements, constraints, and checkpoints current so future sessions ramp quickly.
