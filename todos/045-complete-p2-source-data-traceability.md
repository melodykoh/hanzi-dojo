---
status: complete
priority: p2
issue_id: "045"
tags: [architecture, documentation, data-quality, auditability]
dependencies: []
---

# Missing Source Data Traceability

## Problem Statement
Pronunciation choices for 68 characters are hardcoded in SQL comments with no versioned data file. Cannot trace decisions back to authoritative reference or validate programmatically.

## Findings
- Location: `supabase/migrations/016_fix_remaining_malformed_zhuyin.sql` (inline comments)
- Comments like "most common usage" or "HSK1" lack source citations
- No external data file to audit or validate
- Future audits cannot answer "Why was this pronunciation chosen?"

## Proposed Solutions

### Option 1: Create Retroactive Data File
- **Pros**: Enables auditing, documents rationale, reusable pattern
- **Cons**: Requires research to reconstruct sources
- **Effort**: Small (1-2 hours)
- **Risk**: Low

Format:
```json
{
  "metadata": {
    "migration": "016",
    "date": "2025-12-15",
    "sources": ["HSK word lists", "Taiwan MOE dictionary"]
  },
  "pronunciations": [
    {
      "simp": "可",
      "chosen_pinyin": "kě",
      "zhuyin": [["ㄎ","ㄜ","ˇ"]],
      "alternates": ["kè"],
      "reason": "HSK1 most common",
      "source": "HSK1 vocabulary list"
    }
  ]
}
```

## Recommended Action
Create `/data/migration_016_pronunciation_choices.json` documenting all 68 character decisions with source citations.

## Technical Details
- **Affected Files**: New file `/data/migration_016_pronunciation_choices.json`
- **Related Components**: None (documentation only)
- **Database Changes**: No

## Resources
- Original finding: PR #30 Code Review (architecture-strategist)
- Related: Issue #044 (DRY violation - same underlying problem)

## Acceptance Criteria
- [x] Data file created with all 68 characters
- [x] Each entry includes: simp, trad, chosen pronunciation, alternates, reason, source
- [x] File is valid JSON

## Work Log

### 2025-12-15 - Resolved
**By:** Claude Code
**Actions:**
- Created `/data/migration_016_pronunciation_choices.json`
- All 68 characters documented with full metadata
- Each entry includes: simp, trad, pinyin, zhuyin, alternates, reason, source
- Sources cited: HSK1-4 vocabulary, Taiwan MOE dictionary, usage frequency

**Files Changed:**
- `data/migration_016_pronunciation_choices.json` (new - merged with #044)

### 2025-12-15 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: ready

**Learnings:**
- Data curation decisions should be documented outside of SQL

## Notes
Source: PR #30 Code Review Triage - 2025-12-15
Merged with #044 as they address related concerns.
