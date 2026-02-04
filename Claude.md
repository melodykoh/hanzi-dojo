# Hanzi Dojo (漢字道場) - Claude Development Context

## 🔁 **TRY: Ralph Loop for Next Atomic Feature**

> **What:** An autonomous bash loop that implements tasks one-by-one in fresh Claude instances, avoiding context limits. Each iteration picks a task, implements it, runs tests, commits on success, and logs gotchas. You sleep; it ships.
>
> **When to use:** When you have a set of **truly atomic tasks** with **clear, machine-verifiable acceptance criteria** (e.g., "change grid from 3-col to 2-col under 768px, verify with screenshot" — NOT "improve mobile layout").
>
> **Good candidates from backlog:** Epic 7 (Mobile Polish) — 7 well-defined story points.

### How to Run

1. **Define tasks** in `ralph-loop/prd.json`:
```json
{
  "tasks": [
    {
      "id": "1",
      "description": "Change drill grid from 3-column to 2-column layout on viewports under 768px",
      "acceptance_criteria": "npm test passes. Grid shows 2 columns on mobile viewport.",
      "status": "pending"
    }
  ]
}
```

2. **Create the loop script** `ralph-loop/run.sh`:
```bash
#!/bin/bash
# Ralph Loop — autonomous task implementation
# Source: Vibe Code Camp (Ryan Carson), Jan 2026

TASKS_FILE="ralph-loop/prd.json"
PROGRESS_FILE="ralph-loop/progress.txt"
touch "$PROGRESS_FILE"

while true; do
  # Pick next pending task (fresh Claude instance each time = no context debt)
  TASK=$(claude --print "Read $TASKS_FILE. Find the first task with status 'pending'. Return ONLY the task id and description as 'ID: [id] | TASK: [description] | CRITERIA: [acceptance_criteria]'. If no pending tasks, return 'ALL_DONE'.")

  if echo "$TASK" | grep -q "ALL_DONE"; then
    echo "All tasks complete!"
    break
  fi

  echo "Working on: $TASK"

  # Implement (each iteration is a fresh context — progress.txt carries forward learnings)
  claude --print "You are implementing a task in Hanzi Dojo.
Read CLAUDE.md for project context.
Read $PROGRESS_FILE for gotchas from previous tasks.

YOUR TASK: $TASK

Steps:
1. Implement the change
2. Run 'npm test' to verify
3. If tests pass, commit with a descriptive message
4. Update $TASKS_FILE to mark this task as 'completed'
5. Write any gotchas or learnings to $PROGRESS_FILE
6. If tests fail, debug and retry up to 3 times. If still failing, mark task as 'blocked' in $TASKS_FILE and write the failure reason to $PROGRESS_FILE."

  echo "---"
  sleep 2
done

echo "Ralph Loop complete. Review changes with: git log --oneline -20"
```

3. **Run it:** `chmod +x ralph-loop/run.sh && ./ralph-loop/run.sh`

### Three-Tier Memory Model
- **Long-term:** CLAUDE.md (read every iteration)
- **Short-term:** progress.txt (gotchas from previous tasks, accumulates during loop)
- **Task state:** prd.json (tracks pending/completed/blocked)

### Important
- Tasks MUST be atomic with machine-verifiable acceptance criteria
- Each iteration spawns a fresh Claude instance (no context degradation)
- Review the git log and all changes after the loop completes before merging
- Consider using Agent Browser (`agent-browser`) for UI acceptance criteria

---

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
- [ ] **CRITICAL: Update `public/CHANGELOG.md` with user-facing changes** ⭐
  - Use plain language (avoid technical jargon)
  - Group by session/date
  - Focus on user benefits ("Faster practice" not "Removed 300ms delay")
  - Include emoji for visual scanning (✨ feature, 🐛 bug, 🎨 improvement)
- [ ] Push branch: `git push -u origin feature/name`
- [ ] Create PR: `gh pr create --title "..." --body "..." --base main`
- [ ] Wait for Vercel preview (~2 min), test thoroughly
- [ ] **CRITICAL: Verify changelog renders correctly at `/changelog`** ⭐
- [ ] ⛔ **STOP: Wait for explicit user approval before merging** ⛔
- [ ] Merge via GitHub UI or `gh pr merge <#>` **(ONLY after user says "merge" or "approve")**
- [ ] Update local: `git checkout main && git pull`
- [ ] Clean up: `git branch -d feature/name`
- [ ] Verify production at https://hanzi-dojo.vercel.app
- [ ] Update `SESSION_LOG.md` with session summary

<!-- DO NOT REMOVE: The changelog steps above were accidentally deleted once (Session 16).
     They are critical for keeping the user-facing "What's New" page current. -->

### **Git & PR Protocol**

⛔ **NEVER merge a PR without explicit user permission** ⛔

| Action | Allowed? |
|--------|----------|
| Creating branches | ✅ OK |
| Pushing commits | ✅ OK |
| Creating PRs | ✅ OK |
| Running QA/tests | ✅ OK |
| **Merging PRs** | ⛔ **REQUIRES EXPLICIT USER APPROVAL** |

**Always present QA results and wait for user to explicitly say "merge", "approve", or similar before running `gh pr merge`.**

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

### Chinese Language Feature Questions (MANDATORY for drill/word features)
> **Lesson Learned (Session 23):** Multi-pronunciation and matching logic caused issues that should have been caught during requirements.

**Multi-Pronunciation (多音字):**
- [ ] Does this feature display characters with multiple readings?
- [ ] How will the correct reading be determined? (Use `zhuyin_variants.context_words`)
- [ ] Should we filter word pairs to match the kid's locked pronunciation?

**Matching/Pairing Features:**
- [ ] What defines a "correct" match vs. a "valid" match?
- [ ] Could alternative valid matches exist in the same round?
- [ ] What uniqueness constraints prevent ambiguity? (Both char1 AND char2 must be unique)

**Round Generation:**
- [ ] Are BOTH sides of a pair constrained for uniqueness?
- [ ] Is there validation for ambiguous rounds before presenting?

**Reference:** `docs/solutions/process-learnings/drill-c-session-learnings-20260112.md`

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
3. **If writing migrations or modifying RPCs:** Check `docs/solutions/database-issues/` for known gotchas.
4. Ship minimal end-to-end path (dictionary lookup → drill render → familiarity update) before enhancements.
5. Test against real characters provided by the user (tones, identical Trad/Simp, multi-reading cases).

### During Development
- Validate inputs at every boundary (forms, RPC payloads).
- Treat external data as untrusted; handle missing/conflicting dictionary data gracefully.
- Surface confidence context in UI copy (e.g., when manual data is used).
- Emit actionable errors (what failed, how it impacts parent/kid experience).
- Exercise offline guard scenarios and training mode transitions.
- **For RPC functions:** Use explicit table aliases (e.g., `k.id` not `id`) to avoid RETURNS TABLE conflicts.

### Definition of Done
- [ ] Feature works end-to-end with production-like data
- [ ] Input validation catches malformed/duplicate entries
- [ ] Failures map to specific components with recovery paths
- [ ] Logic mirrors agreed manual workflow and dojo narrative
- [ ] User (parent) has reviewed behavior and confirmed acceptance

### QA Protocol for Drill Features (MANDATORY)
> **Lesson Learned (Session 23):** Playwright MCP tests pass but miss visual/state stability issues.

**What Playwright MCP CANNOT catch (must test manually):**
- State stability (options staying in place after interactions)
- Visual design consistency (colors, design tokens, matching existing drills)
- Mobile-specific rendering (SVG positioning, column widths)
- Transient states (flash of "no items" during loading)
- Animation/transition smoothness

**Manual QA Checklist for Drills:**
- [ ] Complete 3+ sequential correct answers, verify options didn't reshuffle
- [ ] Compare side-by-side with existing drills for visual consistency
- [ ] Test on actual mobile device (not just viewport resize)
- [ ] Switch between drills rapidly, verify no error flashes
- [ ] Test with React StrictMode enabled (catches unstable effects)

**Code Review Checklist:**
- [ ] No unstable references in useEffect deps (use refs for prop callbacks)
- [ ] No Math.random()/Date.now() in render body
- [ ] Design system classes used (ninja-green, not hardcoded #22c55e)

**Reference:** `docs/solutions/process-learnings/drill-c-session-learnings-20260112.md`

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

### **Session 22 Complete (Jan 7, 2026)** ✅
**Status:** PR #32 merged - Drill Proficiency Widget with clickable struggling count

**PR #32 - Drill Proficiency Widget:**
- ✅ **Accuracy timeframe toggle** - "Last Week" vs "Last 60 Days" per drill
- ✅ **Clickable struggling count** - Opens modal showing which characters need practice
- ✅ **StrugglingCharactersModal** - Drill-specific layouts (Drill A: Zhuyin prominent, Drill B: Traditional prominent)
- ✅ **9 code review fixes** - Performance (3x faster), timezone consistency, error handling
- ✅ **Migration 018** - Composite index for accuracy queries

**Previous Sessions:**
- **Session 21 (Jan 6):** Drill A mobile layout fix - 2x2 grid prevents pull-to-refresh (PR #31)
- **Session 20 (Dec 12):** Ninjago design system unification
- **Session 19 (Dec 9):** Multi-pronunciation meanings fix (160 chars)
- **Session 18 (Dec 8):** Comprehensive multi-pronunciation coverage (162 chars)

**Next Priority:** Monitor production → Epic 7 (Mobile polish) or Epic 8 Phase 3 (Dictionary expansion)

### **Epic Status Overview**
- Epic 1-6: ✅ COMPLETE (V1 production deployed)
- Epic 7: ☐ PENDING (Mobile polish - 7 pts, optional)
- Epic 8 Phase 1-2: ✅ COMPLETE (136 multi-pronunciation chars, PR #17 ready to merge)
- Epic 8 Phase 3: ☐ PLANNED (Expand to 250+ chars, optional enhancement)

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

**Session 14 (Nov 16, 2025):**
- ✅ **Feedback Tab Implementation** - Tally.so embedded form with public access
- ✅ **Unused Dependency** - Removed react-tally package (P1 Critical)
- ✅ **Test Act() Warnings** - Fixed 3 tests with waitFor() wrapper (P2)
- ✅ **Type Safety** - Added explicit AuthChangeEvent type annotation (P2)
- ✅ **Tab Color Inconsistency** - Missing tab now uses ninja-purple (P3)
- ✅ **Duplicate Auth Listener** - Pass session as prop, eliminated redundant subscription (P3)
- ✅ **Performance** - useMemo optimization prevents unnecessary re-renders (P3)
- ✅ **Loading UX** - Sword emoji spinner during iframe load (P3)
- ✅ **Security** - Input sanitization + CSP headers + reduced fingerprinting (P2)

**Session 13 (Nov 15, 2025):**
- ✅ **Auth Session Corruption** - Dashboard now syncs with auth state changes (session expiry, sign out, token refresh)
- ✅ **Dictionary Demo Mode** - Migration 013 enables public dictionary access for unauthenticated users
- ✅ **Slow Auth Loading** - Parallel queries reduce load time 30% (500ms → 350ms)
- ✅ **XSS Vulnerability** - Custom markdown parser replaced with react-markdown library
- ✅ **Dead Code** - 183 lines removed from demoData.ts (84% reduction)
- ✅ **Test Coverage** - 17 component tests added for demo mode features

**Session 12 (Nov 14, 2025):**
- ✅ **Critical Auth Bug** - New users getting "No student profile found" error (Migration 012: database trigger)
- ✅ **Gold Banner Animation** - Spinjitzu not spinning on 1.0 point feedback (CSS animation property conflict)
- ✅ **300ms Dead Time** - Artificial delay between practice questions removed (6s saved per session)
- ✅ **TypeScript Safety** - All `any` types replaced with proper interfaces in DashboardMetrics
- ✅ **Performance** - Added useMemo to 5 expensive calculations (prevents O(e×d×s) on every render)

**Session 11 (Nov 12, 2025):**
- ✅ EntryCatalog pronunciation modal missing default option (Pattern A structure)
- ✅ Migration 011 rollback bug (uncommented statements executing)
- ✅ Character '干' exclusion (malformed database entry)

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
- **`docs/operational/EPIC_8_PHASE_3_EXPANSION.md`** - Future dictionary expansion (250+ chars)
- **`docs/operational/DRILL_FEATURE_QA_CHECKLIST.md`** - QA checklist for drill features

### Solutions & Learnings (CHECK BEFORE IMPLEMENTING)
> **IMPORTANT:** Before writing migrations or modifying RPC functions, check this directory for known issues and prevention patterns.

- **`docs/solutions/database-issues/`** - Database/SQL gotchas and fixes
  - `plpgsql-ambiguous-column-reference.md` - RETURNS TABLE + bare column names (Issue #40)
  - `incomplete-data-fix-scope-discovery-20251215.md` - Migration scope discovery
- **`docs/solutions/process-learnings/`** - Development process insights
  - `drill-c-session-learnings-20260112.md` - Playwright gaps, data model issues

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
