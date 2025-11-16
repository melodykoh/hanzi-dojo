---
status: ready
priority: p2
issue_id: "004"
tags: [security, maintainability, code-simplification, pr-11, xss]
dependencies: []
---

# Replace Custom Markdown Parser with React-Markdown Library

## Problem Statement

Changelog.tsx contains 85 lines of custom regex-based markdown parsing that has XSS risks (JavaScript URL protocol allowed) and is incomplete (no tables, nested lists, blockquotes). This is a maintenance burden when the industry-standard `react-markdown` library (3KB gzipped) provides better security and feature coverage.

## Findings

- Discovered during PR #11 code review (Security audit + Simplicity analysis)
- Location: `src/pages/Changelog.tsx:103-188`
- **Custom parser**: 85 lines of regex-based markdown → HTML conversion
- **Security issue**: No URL protocol validation (JavaScript URLs allowed)
- **Incomplete spec**: Only supports 5 features (bold, italic, code, links, headings)
- **Missing features**: Tables, nested lists, blockquotes, images, horizontal rules

**Security Risk Analysis:**

**Attack Vector: JavaScript URL Protocol**
```markdown
[Click here](javascript:alert('XSS'))
```

Current parser output:
```html
<a href="javascript:alert('XSS')">Click here</a>
```

Result: Clicking link executes JavaScript → XSS vulnerability

**Current Code:**
```typescript
// Lines 175-184: Unsafe link formatting
const formatInlineMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')  // ❌ No validation
}

// Lines 152, 161: Using dangerouslySetInnerHTML
<li dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
<p dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
```

**Current Risk Level: LOW**
- CHANGELOG.md is static file controlled by developers
- No user-generated content
- File committed to repo (code review process protects)

**Future Risk Level: MEDIUM**
- If we add user-contributed changelogs (community updates)
- If we add admin UI to edit changelog
- Developer mistake could introduce malicious link

**Incomplete Feature Coverage:**
```markdown
# Current parser supports:
- **bold**, *italic*, `code`
- [links](url)
- # Headings

# Missing features:
- Tables (| Header | Header |)
- Nested lists (- Item\n  - Subitem)
- Blockquotes (> Quote)
- Images (![alt](url))
- Horizontal rules (---)
- Strikethrough (~~text~~)
```

## Proposed Solutions

### Option 1: Replace with react-markdown Library (Recommended)
- **Pros**:
  - Battle-tested security (100M+ downloads/month)
  - Auto-sanitizes URLs (blocks javascript:, data:, vbscript:)
  - Complete CommonMark spec support
  - Removes 85 lines of custom code
  - Supports extensions (GitHub Flavored Markdown, syntax highlighting)
  - Active maintenance (updated monthly)
  - TypeScript definitions included
- **Cons**:
  - Adds ~3KB gzipped to bundle (acceptable for security + features)
  - One more dependency to maintain (acceptable - stable library)
- **Effort**: Small (30 minutes - install + replace + test)
- **Risk**: Low (drop-in replacement, well-documented)

**Implementation:**
```bash
npm install react-markdown
```

```typescript
// src/pages/Changelog.tsx (simplified)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

export function Changelog() {
  const navigate = useNavigate()
  const [markdown, setMarkdown] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/CHANGELOG.md')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load changelog')
        return res.text()
      })
      .then(text => {
        setMarkdown(text)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error loading changelog:', err)
        setError('Unable to load changelog. Please try again later.')
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚔️</div>
          <p className="text-gray-600">Loading changelog...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 font-bold mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-ninja-gold text-gray-900 rounded font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
```

**Bundle Impact:**
- react-markdown: ~3KB gzipped
- Current custom parser: 0KB (inline code)
- Net cost: +3KB
- Acceptable for security + maintainability

### Option 2: Add URL Validation to Custom Parser (Not Recommended)
- **Pros**: No new dependencies
- **Cons**:
  - Still incomplete (no tables, nested lists)
  - Must maintain custom regex
  - Re-inventing the wheel
  - Security-critical code (high risk)
- **Effort**: Small (15 minutes for URL validation only)
- **Risk**: Medium (easy to miss edge cases in security code)

**Partial Fix:**
```typescript
const formatInlineMarkdown = (text: string): string => {
  return text
    .replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
      // Whitelist safe protocols
      if (!/^(https?|mailto):/.test(url)) {
        return text  // Strip unsafe links
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
    })
}
```

## Recommended Action

Implement **Option 1** - Replace with react-markdown.

**Rationale:**
- Security: Industry-standard library with auto-sanitization
- Maintainability: 85 lines removed, no custom code to maintain
- Features: Full CommonMark spec (tables, nested lists, etc.)
- Bundle cost: 3KB acceptable for security + features
- Future-proof: Library handles edge cases we haven't considered

## Technical Details

- **Affected Files**:
  - `src/pages/Changelog.tsx` (rewrite lines 103-188)
  - `package.json` (add react-markdown dependency)
- **Related Components**: None
- **Database Changes**: No
- **API Changes**: No
- **Breaking Changes**: No (same visual output, better implementation)

**Dependencies to Add:**
```json
{
  "react-markdown": "^9.0.1"
}
```

**CSS Considerations:**
- Add Tailwind Typography plugin for prose styles (optional, improves defaults)
- Or use custom styles matching existing design system

## Resources

- Original finding: PR #11 Code Review - Security Audit + Simplicity Analysis
- react-markdown: https://github.com/remarkjs/react-markdown
- CommonMark spec: https://commonmark.org/
- OWASP XSS Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Related issues: None

## Acceptance Criteria

- [ ] Install `react-markdown` package
- [ ] Replace custom parser with ReactMarkdown component
- [ ] Remove 85 lines of custom markdown parsing code
- [ ] Test changelog renders correctly (headings, lists, bold, italic, code, links)
- [ ] Verify links open in new tab with `rel="noopener noreferrer"`
- [ ] Test error handling (404, network error)
- [ ] Verify no JavaScript URL execution (security test)
- [ ] Check bundle size increase (~3KB expected)
- [ ] Update tests if any (unlikely - component test would benefit)
- [ ] No console errors or warnings

## Work Log

### 2025-11-15 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during PR #11 security audit
- Categorized as P2 IMPORTANT (security + maintainability)
- Estimated effort: Small (30 minutes)
- Marked as ready for immediate work

**Learnings:**
- Custom parsers are security-critical code (high risk)
- Industry-standard libraries provide better security than custom regex
- 3KB bundle cost is acceptable for security + maintainability benefits
- YAGNI: Don't reinvent well-solved problems

**Security Considerations:**
- Current risk: LOW (developer-controlled content)
- Future risk: MEDIUM (if user content added)
- react-markdown auto-blocks dangerous protocols
- Eliminates entire class of XSS vulnerabilities

**Bundle Analysis:**
- Current: 467KB main bundle
- After: 470KB (+3KB = +0.6% increase)
- Acceptable trade-off for security + features

## Notes

Source: PR #11 Code Review Triage Session (2025-11-15)

**Priority Justification:** P2 because it's a security improvement (XSS risk) combined with code simplification (-85 lines). Not P1 because current risk is low (developer-controlled content), but important to fix before adding user-generated changelog features.

**Alternative Libraries Considered:**
- `marked`: 8KB (heavier than react-markdown)
- `markdown-it`: 12KB (even heavier)
- `react-markdown`: 3KB ✅ (lightest, React-native)

**Future Enhancements:**
- Add syntax highlighting for code blocks (react-syntax-highlighter)
- Add GitHub Flavored Markdown support (tables, task lists)
- Add table of contents generation
