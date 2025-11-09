# Hanzi Dojo — Repository Structure

## 📁 Directory Organization

This document defines the canonical file organization for Hanzi Dojo. **All contributors must maintain this structure.**

---

## 🗂️ Root Level

```
/
├── CLAUDE.md                   # Project-specific Claude development context (PRIMARY)
├── SESSION_LOG.md              # Detailed session-by-session progress history
├── REPO_STRUCTURE.md           # This file - canonical structure reference
├── package.json                # NPM dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── tsconfig.json               # TypeScript compiler config
├── tsconfig.node.json          # TypeScript config for Node tooling
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Vitest test runner configuration
├── tailwind.config.js          # Tailwind CSS utility classes
├── postcss.config.js           # PostCSS processing config
├── index.html                  # Vite entry point HTML
├── .env.local                  # Local environment variables (NOT committed)
├── .gitignore                  # Git ignore patterns
└── README.md                   # Public-facing project introduction
```

### Root-Level Guidelines
- **Keep root minimal** - Only config files, package management, and primary docs
- **No scattered markdown** - Session notes, QA checklists belong in `/docs`
- **No source code** - All application code lives in `/src`

---

## 📚 `/docs` — Specifications & Documentation

```
/docs
├── HANZI_DOJO_OVERVIEW.md      # Product definition and objectives
├── REQUIREMENTS.md              # Detailed functional requirements
├── DESIGN_AND_UI.md             # UI/UX specs, dojo theme, visual guidelines
├── TECH_AND_LOGIC.md            # Database schema, scoring logic, algorithms
├── DEVELOPMENT_AND_DEPLOYMENT.md # Setup, testing, deployment procedures
├── ROADMAP.md                   # V1, V1.1, V2+ feature planning
├── PROJECT_PLAN.md              # Implementation epic breakdown
│
├── /operational                 # Operational documentation
│   ├── QA_CHECKLIST.md          # Quality assurance procedures
│   ├── QA_MANUAL_ONLY.md        # Manual testing scenarios
│   ├── TEST_COVERAGE.md         # Testing coverage reports
│   └── TESTING_README.md        # Testing setup and guidelines
│
└── /architecture               # (FUTURE) Architecture decision records (ADRs)
    └── YYYY-MM-DD-decision-title.md
```

### Documentation Guidelines
- **Specifications** (OVERVIEW, REQUIREMENTS, DESIGN, TECH, etc.) live at `/docs` root
- **Operational docs** (QA checklists, testing guides) belong in `/docs/operational`
- **Session history**: Single source of truth is root `SESSION_LOG.md` (append-only, no archives needed)
- **Keep specs synchronized** - Update when requirements or architecture changes
- **Reference format**: Use `docs/FILENAME.md` in all cross-references

---

## 💻 `/src` — Application Source Code

```
/src
├── main.tsx                    # React + Router entry point
├── App.tsx                     # Root application component with routes
├── index.css                   # Global styles and Tailwind imports
├── vite-env.d.ts               # Vite environment type definitions
│
├── /components                 # React UI components
│   ├── Dashboard.tsx           # Parent console main view
│   ├── TrainingMode.tsx        # Full-screen kid training interface
│   ├── PracticeCard.tsx        # Individual drill question card
│   ├── PracticeDemo.tsx        # Practice system demo/playground
│   ├── FeedbackToast.tsx       # Post-attempt Sensei feedback
│   ├── KnownBadge.tsx          # Character mastery indicators
│   ├── OfflineModal.tsx        # Dojo-themed network loss dialog
│   ├── OfflineBlocker.tsx      # Wrapper to disable actions when offline
│   ├── DictionaryDemo.tsx      # Dictionary lookup demo interface
│   ├── DictionaryStats.tsx     # Dictionary coverage analytics
│   └── MissingEntriesView.tsx  # Dictionary gap monitoring
│
├── /lib                        # Services, utilities, business logic
│   ├── supabase.ts             # Supabase client initialization
│   ├── dictionaryClient.ts     # Dictionary lookup with caching
│   ├── dictionaryLogger.ts     # Missing entry logging service
│   ├── practiceStateService.ts # Familiarity scoring and known status
│   ├── practiceQueueService.ts # Priority queue for drills
│   ├── drillBuilders.ts        # Zhuyin/Traditional option generation
│   └── offlineDetection.ts     # Network connectivity monitoring
│
├── /types                      # TypeScript interfaces and type definitions
│   └── index.ts                # Centralized type exports
│
├── /test                       # Test utilities and mocks
│   ├── setup.ts                # Vitest global setup
│   └── mockData.ts             # Shared test fixtures
│
├── /pages                      # (FUTURE) Route-level page components
│   ├── DashboardPage.tsx       # Planned: parent console page
│   ├── TrainingPage.tsx        # Planned: training mode page
│   ├── CatalogPage.tsx         # Planned: entry catalog page
│   └── SettingsPage.tsx        # Planned: configuration page
│
└── /assets                     # (FUTURE) Static resources
    ├── /images                 # Icons, mascot art, backgrounds
    └── /fonts                  # Custom dojo-themed typography
```

### Source Code Guidelines
- **Component co-location**: Test files (`.test.tsx`, `.test.ts`) live next to source files
  - Example: `PracticeCard.tsx` + `PracticeCard.test.tsx` in `/src/components`
  - Example: `drillBuilders.ts` + `drillBuilders.test.ts` in `/src/lib`
- **Service layer**: All Supabase interactions, scoring logic, and queue management in `/lib`
- **Type safety**: Export all shared types from `/src/types/index.ts`
- **Component scope**:
  - `/components` = Reusable UI widgets
  - `/pages` (future) = Full-page route containers
- **No hardcoded values**: Use environment variables (`import.meta.env.VITE_*`) for configs

---

## 🗄️ `/supabase` — Database Migrations & Functions

```
/supabase
├── /migrations                 # Sequentially numbered SQL migration files
│   ├── 001_initial_schema.sql
│   ├── 002_dictionary_tables.sql
│   └── 003_practice_state.sql
│
└── /functions                  # (FUTURE) Edge functions if needed
    └── dictionary-lookup/
```

### Database Guidelines
- **Migration discipline**: All schema changes via numbered migrations
- **Never edit previous migrations** - Create new migration to alter
- **Test migrations** on local Supabase before deploying
- **Document breaking changes** in migration comments

---

## 🧪 Testing Strategy

### Test File Locations
- **Unit tests**: Co-located with source (e.g., `drillBuilders.test.ts` next to `drillBuilders.ts`)
- **Integration tests**: Co-located with components (e.g., `PracticeCard.test.tsx`)
- **Test utilities**: Centralized in `/src/test/` (setup, mocks, fixtures)

### Test Coverage Targets
- **Critical paths**: 80%+ coverage (scoring, queue logic, drill generation)
- **UI components**: Interaction and accessibility tests
- **Services**: Mock Supabase responses, test error handling

---

## 🚫 Files to Ignore

```
# Build outputs
/dist
/node_modules
/.vite

# Environment secrets
.env.local
.env.production

# IDE and OS
.DS_Store
.vscode/ (except shared settings)
.idea/

# Logs and temp files
*.log
*.tsbuildinfo
```

---

## 🔄 Migration Plan (Current → Proposed)

### Files to Relocate
1. **Root → `/docs/operational`**:
   - `QA_CHECKLIST.md`
   - `QA_MANUAL_ONLY.md`
   - `TEST_COVERAGE.md`
   - `TESTING_README.md`

2. **Root cleanup - Delete redundant files**:
   - `SESSION_4_SUMMARY.md` → Content in SESSION_LOG.md, delete
   - `NEXT_SESSION.md` → Merge planning notes into CLAUDE.md or SESSION_LOG.md, then delete
   - `template_CLAUDE.md` → Delete (unused template)

3. **Future expansion** (as features are built):
   - Create `/src/pages` when routing is refactored
   - Create `/src/assets` when images/icons are added
   - Create `/supabase/migrations` when formalizing schema versioning

---

## ✅ Structure Enforcement Checklist

**Before starting each session:**
- [ ] Verify no scattered files in root directory
- [ ] Confirm `/docs` specs are up-to-date with implementation
- [ ] Check `/src/components` and `/src/lib` follow naming conventions
- [ ] Ensure test files are co-located with source
- [ ] Review `SESSION_LOG.md` for structural changes from previous sessions

**When adding new features:**
- [ ] Place UI components in `/src/components` with co-located tests
- [ ] Place services/utilities in `/src/lib` with co-located tests
- [ ] Update type definitions in `/src/types/index.ts`
- [ ] Document architectural decisions in `/docs/TECH_AND_LOGIC.md`
- [ ] Update this `REPO_STRUCTURE.md` if new directories are added

**When documentation grows:**
- [ ] Move operational docs to `/docs/operational/`
- [ ] Keep root-level docs limited to `CLAUDE.md`, `SESSION_LOG.md`, `REPO_STRUCTURE.md`, `README.md`
- [ ] Delete redundant session-specific files (content belongs in SESSION_LOG.md)

---

## 🎯 Philosophy

> **"A well-organized dojo is a disciplined dojo."**

This structure prioritizes:
1. **Clarity**: Every file has one obvious home
2. **Scalability**: Directories expand logically as features grow
3. **Maintainability**: Future contributors find what they need immediately
4. **Discipline**: No exceptions for "just this one file"

---

**Last Updated**: 2025-11-04 (Session 5)
**Maintained By**: Claude + Project Owner
**Review Frequency**: Every session start + whenever new directories are proposed
