# Feedback Tab Implementation Guide

**Created:** 2025-11-15
**Status:** Planning Phase
**Feature:** Help & Feedback tab for user bug reports, feature requests, and general feedback

---

## 📋 Executive Summary

### What We're Building
A "Feedback" tab in the Dashboard where users (authenticated and demo) can submit:
- Bug reports
- Feature requests
- General feedback
- Questions

### Technical Approach
- **Tool:** Tally.so (free tier, unlimited responses)
- **Integration:** `react-tally` npm package (TypeScript-safe)
- **UI Pattern:** Dashboard tab (consistent with Dictionary, Missing tabs)
- **Access Level:** Public (demo users can submit feedback)
- **User Experience:** Popup modal with auto-populated context

---

## 🎯 Requirements (Confirmed with User)

### User Decisions
- ✅ **Tab name:** "Feedback"
- ✅ **Placement:** Dashboard tab only (no floating button)
- ✅ **Access:** Public (unauthenticated users can submit)
- ✅ **Form provider:** Tally.so (needs to be created)

### Business Context
- **Current users:** ~20 registered users (shared in Facebook group for Chinese learning)
- **Goal:** Collect bug reports, feature requests, and feedback from growing user base
- **Maintenance:** Minimal - review submissions weekly
- **Cost:** Free tier sufficient (unlimited forms & responses)

---

## 📐 Architecture Overview

### Component Structure
```
Dashboard
├── Tab Navigation
│   ├── 📊 Dashboard
│   ├── 📝 My Characters
│   ├── ⚡ Practice Demo
│   ├── 📖 Dictionary
│   ├── 💬 Feedback  ← NEW TAB
│   └── ❓ Missing
│
└── Tab Content
    └── FeedbackTab Component
        ├── Intro text
        ├── Quick action cards (3)
        │   ├── 🐛 Report Bug
        │   ├── ✨ Request Feature
        │   └── 💬 General Feedback
        └── Tally popup modal integration
```

### Data Flow
```
User clicks action card
  ↓
Gather context (user email, page, viewport, timestamp)
  ↓
Open Tally popup modal
  ↓
Auto-populate hidden fields
  ↓
User fills form & submits
  ↓
Tally stores submission
  ↓
Show success message
```

### Context Auto-Population
```typescript
Hidden fields sent to Tally:
- user_email: from Supabase auth session (if authenticated)
- user_id: from Supabase auth (if authenticated)
- user_type: "authenticated" | "demo"
- page: window.location.pathname
- timestamp: ISO 8601 timestamp
- viewport: "widthxheight" (e.g., "1920x1080")
- browser: navigator.userAgent
```

---

## 🔧 Phase 1: Tally.so Form Setup

### Step 1: Create Tally Account
1. Go to https://tally.so
2. Sign up (free account)
3. Verify email

### Step 2: Build Feedback Form

**Form Name:** "Hanzi Dojo Feedback"

**Visible Fields:**

| Field Name | Type | Required | Configuration |
|------------|------|----------|---------------|
| **Email** | Text input | No | Label: "Your Email (optional)"<br>Help text: "We'll only use this to respond to your feedback" |
| **Feedback Type** | Dropdown | Yes | Options:<br>• Bug Report<br>• Feature Request<br>• General Feedback<br>• Question |
| **Your Message** | Long text | Yes | Min length: 10 characters<br>Placeholder: "Please describe in detail..." |
| **Priority** | Star rating (1-5) | No | Label: "How urgent is this?"<br>Conditional: Only show if "Bug Report" selected |
| **Screenshots** | File upload | No | Max size: 10MB<br>Accepted: Images only<br>Help text: "Attach screenshots to help us understand" |

**Hidden Fields:**
(Type `/hidden` in form builder to add these)

- `user_email` (string) - Auto-populated from auth session
- `user_id` (string) - Supabase user ID
- `user_type` (string) - "authenticated" or "demo"
- `page` (string) - Current page path
- `timestamp` (string) - Submission time
- `viewport` (string) - Screen dimensions
- `browser` (string) - User agent

### Step 3: Configure Form Settings

**In Tally form settings:**
- **Thank you message:** "Thanks for your feedback! We'll review it soon. 🙏"
- **Submit button text:** "Send Feedback"
- **Show progress bar:** No (single page)
- **Collect emails:** Optional (we handle this via visible field)
- **Auto-close after submit:** Yes (3 seconds)

**Design settings:**
- **Theme:** Light mode (matches Hanzi Dojo aesthetic)
- **Primary color:** #8B00FF (ninja-purple) or default
- **Font:** System font
- **Button style:** Rounded

### Step 4: Get Form ID

1. Click "Share" tab in Tally
2. Copy form URL (format: `https://tally.so/r/ABC123`)
3. **Form ID is the part after `/r/`** (e.g., `ABC123`)
4. **Save this ID** - needed for code implementation

### Step 5: Optional - Set Up Notifications

**Email notifications:**
- Tally Settings → Notifications
- Add your email to receive submission alerts
- Frequency: Immediately or daily digest

**Integrations (optional):**
- Connect to Slack for instant notifications
- Set up Zapier for advanced workflows

---

## 💻 Phase 2: Code Implementation

### Prerequisites
- ✅ Tally form created
- ✅ Form ID obtained
- ✅ Repository clean (no uncommitted changes)

### Step 1: Install Dependencies

```bash
npm install react-tally
```

**Package details:**
- Version: Latest (check npm)
- Size: ~2KB gzipped
- TypeScript: Full support included
- License: MIT

### Step 2: Create FeedbackTab Component

**File:** `/src/components/FeedbackTab.tsx`

```typescript
import { useTallyPopup } from 'react-tally';
import { useAuth } from '../contexts/AuthContext';

type FeedbackType = 'bug' | 'feature' | 'general';

export function FeedbackTab() {
  const { session } = useAuth();
  const user = session?.user;

  const formId = 'YOUR_TALLY_FORM_ID'; // Replace with actual form ID
  const { open } = useTallyPopup(formId);

  const openFeedbackForm = (type: FeedbackType) => {
    // Gather context
    const context = {
      user_email: user?.email || '',
      user_id: user?.id || 'anonymous',
      user_type: user ? 'authenticated' : 'demo',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.userAgent
    };

    // Open popup with context
    open({
      layout: 'modal',
      width: 600,
      overlay: true,
      emoji: {
        text: type === 'bug' ? '🐛' : type === 'feature' ? '✨' : '💬',
        animation: 'wave'
      },
      // Store context for form to read via URL parameters
      key: JSON.stringify(context),
      onSubmit: (payload) => {
        console.log('Feedback submitted:', payload);
        // Optional: Show success toast
      }
    });

    // Store in sessionStorage as backup
    sessionStorage.setItem('tally_context', JSON.stringify(context));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-heading text-gray-900 mb-3">
          Feedback
        </h2>
        <p className="text-lg text-gray-600">
          We'd love to hear from you! Share bugs, ideas, or questions to help us improve Hanzi Dojo.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bug Report Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
          <div className="text-4xl mb-3">🐛</div>
          <h3 className="text-xl font-bold mb-2">Report a Bug</h3>
          <p className="text-gray-600 mb-4">
            Found something broken? Let us know so we can fix it quickly.
          </p>
          <button
            onClick={() => openFeedbackForm('bug')}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Report Bug
          </button>
        </div>

        {/* Feature Request Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-ninja-blue">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-xl font-bold mb-2">Request a Feature</h3>
          <p className="text-gray-600 mb-4">
            Have an idea to make Hanzi Dojo better? We're all ears!
          </p>
          <button
            onClick={() => openFeedbackForm('feature')}
            className="w-full px-4 py-2 bg-ninja-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Share Idea
          </button>
        </div>

        {/* General Feedback Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-ninja-purple">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-xl font-bold mb-2">General Feedback</h3>
          <p className="text-gray-600 mb-4">
            Questions, suggestions, or just want to say hi? Reach out!
          </p>
          <button
            onClick={() => openFeedbackForm('general')}
            className="w-full px-4 py-2 bg-ninja-purple text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Send Feedback
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          🔒 <strong>Privacy:</strong> Your feedback is confidential and will only be used to improve Hanzi Dojo.
          We'll respond to your email if needed, never for marketing.
          Demo users can submit feedback anonymously.
        </p>
      </div>
    </div>
  );
}
```

### Step 3: Add Component Tests

**File:** `/src/components/FeedbackTab.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackTab } from './FeedbackTab';

// Mock react-tally
vi.mock('react-tally', () => ({
  useTallyPopup: () => ({
    open: vi.fn(),
    close: vi.fn()
  })
}));

// Mock auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: null
  })
}));

describe('FeedbackTab', () => {
  it('renders feedback tab with title', () => {
    render(<FeedbackTab />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('renders three action cards', () => {
    render(<FeedbackTab />);
    expect(screen.getByText('Report a Bug')).toBeInTheDocument();
    expect(screen.getByText('Request a Feature')).toBeInTheDocument();
    expect(screen.getByText('General Feedback')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<FeedbackTab />);
    expect(screen.getByRole('button', { name: /Report Bug/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Share Idea/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Feedback/i })).toBeInTheDocument();
  });

  it('displays privacy notice', () => {
    render(<FeedbackTab />);
    expect(screen.getByText(/Privacy:/i)).toBeInTheDocument();
  });
});
```

### Step 4: Integrate into Dashboard

**File:** `/src/components/Dashboard.tsx`

**Changes required:**

1. **Import FeedbackTab component** (line ~10):
```typescript
import { FeedbackTab } from './FeedbackTab';
```

2. **Update activeTab type** (line ~21):
```typescript
const [activeTab, setActiveTab] = useState<
  'metrics' | 'catalog' | 'practice' | 'demo' | 'stats' | 'missing' | 'feedback'
>('metrics');
```

3. **Add tab button** (in tab navigation section, ~line 280):
```typescript
<button
  onClick={() => setActiveTab('feedback')}
  className={`px-4 py-2 font-bold transition-all whitespace-nowrap ${
    activeTab === 'feedback'
      ? 'text-ninja-purple border-b-4 border-ninja-purple'
      : 'text-gray-600 hover:text-ninja-black'
  }`}
>
  💬 Feedback
</button>
```

4. **Add tab content** (in content rendering section, ~line 380):
```typescript
{activeTab === 'feedback' && <FeedbackTab />}
```

### Step 5: Update Package.json

The `npm install react-tally` command will automatically update `package.json`:

```json
{
  "dependencies": {
    "react-tally": "^latest-version"
  }
}
```

---

## 🧪 Phase 3: Testing

### Manual Test Checklist

**Desktop Testing:**
- [ ] Tab appears in dashboard navigation
- [ ] Tab label shows "💬 Feedback"
- [ ] Tab highlights in purple when active
- [ ] All 3 action cards render correctly
- [ ] Bug Report button opens Tally popup
- [ ] Feature Request button opens Tally popup
- [ ] General Feedback button opens Tally popup
- [ ] Form appears in modal overlay (dark background)
- [ ] Form is centered and 600px wide
- [ ] Privacy notice displays at bottom

**Authenticated User Testing:**
- [ ] User email pre-fills in form
- [ ] Hidden field `user_email` populates correctly
- [ ] Hidden field `user_id` populates with Supabase ID
- [ ] Hidden field `user_type` = "authenticated"
- [ ] Form submission works
- [ ] Success message appears after submit
- [ ] Can submit multiple times

**Demo Mode Testing:**
- [ ] Tab is visible (no auth gate)
- [ ] Forms open correctly for unauthenticated users
- [ ] Email field is empty (optional)
- [ ] Hidden field `user_type` = "demo"
- [ ] Can submit without email
- [ ] Submission succeeds

**Context Pre-population Testing:**
- [ ] Hidden field `page` = current pathname
- [ ] Hidden field `timestamp` = valid ISO 8601 format
- [ ] Hidden field `viewport` = "widthxheight"
- [ ] Hidden field `browser` = user agent string
- [ ] All hidden fields visible in Tally submission dashboard

**Mobile/Tablet Testing:**
- [ ] Tab button doesn't wrap on narrow screens
- [ ] Action cards stack vertically on mobile
- [ ] Popup modal is full-width on mobile
- [ ] Form fields are touch-friendly
- [ ] Landscape mode (training mode) displays correctly
- [ ] Can submit feedback during/after training session

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

**Performance Testing:**
- [ ] Tally script loads asynchronously
- [ ] No console errors
- [ ] Page load time unaffected
- [ ] Form opens quickly (<500ms)

### Automated Tests

Run component tests:
```bash
npm run test
```

**Expected results:**
- ✅ All FeedbackTab tests pass
- ✅ Dashboard renders Feedback tab
- ✅ No TypeScript errors
- ✅ No linting errors

---

## 🚀 Phase 4: Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Tally form tested and working
- [ ] Form ID updated in code (not placeholder)
- [ ] Email notifications configured in Tally
- [ ] Changelog updated
- [ ] Documentation updated

### Deployment Steps

**1. Create feature branch:**
```bash
git checkout -b feature/feedback-tab
```

**2. Update CHANGELOG.md:**

**File:** `/public/CHANGELOG.md`

```markdown
## 2025-11-15 - Session 14

### ✨ New Features

**Feedback Tab**
- New "Feedback" tab in Dashboard for submitting bugs, feature requests, and questions
- Accessible to all users (including demo mode visitors)
- Auto-populates your email if logged in
- Quick action cards for Bug Reports, Feature Requests, and General Feedback
- Powered by Tally.so for easy submission and tracking
```

**3. Stage and commit changes:**
```bash
git add .
git commit -m "$(cat <<'EOF'
Add Feedback tab for user bug reports and feature requests

Features:
- New Feedback tab in Dashboard with 3 quick action cards
- Tally.so integration via react-tally package
- Auto-populates user context (email, ID, page, viewport)
- Public access (demo users can submit feedback)
- Hidden fields for rich context collection
- Component tests for FeedbackTab
- Privacy notice for user transparency

Technical:
- Installed react-tally npm package
- Created FeedbackTab component with Tally popup integration
- Updated Dashboard tab navigation and content rendering
- Added TypeScript types for feedback context
- Session storage backup for context data

Testing:
- Desktop and mobile responsive
- Authenticated and demo mode support
- All 3 feedback types (bug, feature, general) working
- Hidden fields populate correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**4. Push branch:**
```bash
git push -u origin feature/feedback-tab
```

**5. Create pull request:**
```bash
gh pr create --title "Add Feedback Tab for User Submissions" --body "$(cat <<'EOF'
## Summary
Adds a new "Feedback" tab to the Dashboard where users can submit bug reports, feature requests, and general feedback via Tally.so integration.

## Features
- ✨ New Feedback tab in Dashboard navigation
- 🐛 Bug report submission with priority/severity
- 💡 Feature request submission
- 💬 General feedback and questions
- 🔓 Public access (demo users can submit)
- 📧 Auto-populates email for authenticated users
- 📊 Hidden fields for rich context (page, viewport, timestamp)

## Technical Implementation
- Installed `react-tally` npm package (2KB, TypeScript-safe)
- Created `FeedbackTab.tsx` component with 3 action cards
- Integrated Tally popup modal with context pre-filling
- Updated Dashboard to include Feedback tab
- Added component tests

## Testing
- [x] Desktop: All action cards open Tally popup
- [x] Mobile: Responsive design, full-width modal
- [x] Authenticated: Email pre-fills, user_id captured
- [x] Demo mode: Public access, anonymous submission
- [x] Context fields: All hidden fields populate correctly
- [x] Component tests: All passing

## Screenshots
(Add screenshots of Feedback tab and popup modal)

## Tally Form Setup
- Form ID: `YOUR_FORM_ID`
- Form URL: https://tally.so/r/YOUR_FORM_ID
- Hidden fields: user_email, user_id, user_type, page, timestamp, viewport, browser

## Checklist
- [x] Code implemented and tested
- [x] Component tests added
- [x] TypeScript types defined
- [x] Changelog updated
- [x] No console errors
- [x] Mobile responsive
- [ ] Vercel preview tested
- [ ] Production deployment verified

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --base main
```

**6. Test Vercel preview:**
- Wait for preview URL (~2 min)
- Open preview link from PR
- Test all feedback flows
- Verify Tally form submissions reach your Tally dashboard

**7. Merge PR:**
```bash
# Via GitHub UI, or:
gh pr merge --squash
```

**8. Update local main:**
```bash
git checkout main
git pull
git branch -d feature/feedback-tab
```

**9. Verify production:**
- Visit https://hanzi-dojo.vercel.app
- Navigate to Feedback tab
- Submit test feedback
- Verify submission in Tally dashboard

---

## 📊 Post-Deployment

### Monitoring & Maintenance

**Weekly review (5-10 minutes):**
1. Log into Tally dashboard
2. Review new submissions
3. Categorize by type (bug, feature, general)
4. Respond to urgent bugs within 48 hours
5. Group feature requests for planning

**Monthly analysis:**
- Track submission volume trends
- Identify most common feedback types
- Prioritize feature requests by frequency
- Update form fields if needed

**Tally dashboard access:**
- URL: https://tally.so/forms/YOUR_FORM_ID/submissions
- Export CSV for deeper analysis
- Set up filters for priority/type

### Response Templates

**Bug acknowledgment:**
```
Thanks for reporting this! We've logged the issue and will investigate.
We'll update you via email once it's fixed.

- Hanzi Dojo Team
```

**Feature request acknowledgment:**
```
Great idea! We've added this to our feature backlog.
We'll reach out if we need more details or when it's implemented.

- Hanzi Dojo Team
```

**General feedback response:**
```
Thanks for your feedback! We really appreciate you taking the time
to help us improve Hanzi Dojo.

- Hanzi Dojo Team
```

---

## 🔧 Troubleshooting

### Issue: Tally popup not opening

**Symptoms:** Button click does nothing, no console errors

**Solutions:**
1. Check browser console for errors
2. Verify `formId` is correct in FeedbackTab.tsx
3. Test with browser extensions disabled (ad blockers)
4. Clear browser cache and reload
5. Check network tab for failed requests to tally.so

### Issue: Email not pre-filling

**Symptoms:** Email field is empty for authenticated users

**Solutions:**
1. Verify `useAuth()` returns valid session
2. Check console.log for `user?.email` value
3. Ensure hidden field name matches Tally form exactly (`user_email`)
4. Test with different user account

### Issue: Hidden fields not populating

**Symptoms:** Context data missing in Tally submissions

**Solutions:**
1. Check Tally form has hidden fields defined (type `/hidden`)
2. Verify field names match exactly (case-sensitive)
3. Inspect sessionStorage for `tally_context` value
4. Test with Tally preview mode to see field values

### Issue: Form not mobile-responsive

**Symptoms:** Form cutoff or unreadable on mobile

**Solutions:**
1. Set `width: undefined` for mobile in popup options
2. Test with Chrome DevTools mobile emulation
3. Verify Tally form theme is "Light" (better mobile UX)
4. Check viewport meta tag in index.html

### Issue: Submissions not appearing in Tally

**Symptoms:** Form submits but no data in Tally dashboard

**Solutions:**
1. Check Tally form is published (not draft)
2. Verify form ID matches exactly
3. Test with Tally form direct URL
4. Check spam folder for submission emails
5. Contact Tally support if persistent

---

## 📚 References

### Internal Documentation
- Dashboard implementation: `/src/components/Dashboard.tsx`
- Auth context: `/src/contexts/AuthContext.tsx`
- Modal patterns: `/src/components/SignupModal.tsx`
- Repository structure: `/REPO_STRUCTURE.md`
- Session log: `/SESSION_LOG.md`

### External Resources

**Tally.so:**
- Official site: https://tally.so
- Help center: https://tally.so/help
- Developer docs: https://tally.so/help/developer-resources
- Hidden fields guide: https://tally.so/help/hidden-fields
- Pre-populate fields: https://tally.so/help/pre-populate-form-fields

**react-tally:**
- GitHub: https://github.com/nititech/react-tally
- npm: https://www.npmjs.com/package/react-tally
- TypeScript definitions: Included in package

**Related Patterns:**
- Popup integration: https://tally.so/help/popup
- Form embedding: https://tally.so/help/embed-your-form
- URL parameters: https://tally.so/help/url-parameters

### Research Reports
- Repository research findings: (Session 14 research agent output)
- Best practices research: (Session 14 research agent output)
- Tally.so integration guide: (Session 14 research agent output)

---

## 🎯 Success Metrics

### KPIs to Track

**Engagement:**
- Number of feedback submissions per week
- Submission types breakdown (bug/feature/general)
- Demo vs authenticated user submissions
- Response rate to feedback

**Quality:**
- Actionable bug reports (vs. vague feedback)
- Feature requests with clear use cases
- Average response time to urgent bugs
- User satisfaction (optional: add rating field)

**Impact:**
- Bugs fixed from user reports
- Features implemented from requests
- User retention after feedback engagement
- Community building (repeat feedback from same users)

### Target Benchmarks (First 3 Months)

- 5-10 submissions per week
- <48hr response to critical bugs
- 80% actionable feedback (clear, detailed)
- 50% demo user submissions (validates public access)

---

## 💡 Future Enhancements

### V1.1 Potential Improvements
- Add FAQ section above action cards
- In-app notification when feedback is addressed
- Upvoting system for feature requests
- Feedback history for authenticated users

### V2 Advanced Features
- Slack integration for instant notifications
- Automatic bug triage based on keywords
- Public roadmap powered by feedback
- Feedback leaderboard (gamification)

### Integration Opportunities
- Link to GitHub Issues (auto-create from bug reports)
- Analytics dashboard (track trends over time)
- Help docs search before submitting
- AI-powered feedback categorization

---

## 📝 Notes & Decisions

### Design Decisions
- **Purple theme:** Chose ninja-purple for Feedback tab to match "Mystery Element" (unused color)
- **Public access:** Demo users can submit to reduce friction, encourage early feedback
- **No FAQ yet:** Will add based on actual questions received
- **3 action cards:** Provides clear categorization without overwhelming users
- **Popup modal:** Non-intrusive, keeps users in app (vs. external redirect)

### Technical Decisions
- **react-tally vs manual:** Chose library for TypeScript safety and event handlers
- **Hidden fields vs visible:** Auto-populate context to reduce user effort
- **SessionStorage backup:** Redundancy in case URL params fail
- **No multi-form approach:** Single form with "Feedback Type" dropdown simpler

### Deferred Features
- ❌ Floating help button (unnecessary with tab placement)
- ❌ In-app chat (Tally sufficient for current scale)
- ❌ Screenshot annotation (Tally file upload sufficient)
- ❌ Feedback analytics dashboard (Tally UI sufficient)

---

## ✅ Implementation Checklist

### User Tasks
- [ ] Create Tally.so account
- [ ] Build feedback form with specified fields
- [ ] Add hidden fields (7 total)
- [ ] Configure form settings
- [ ] Get form ID
- [ ] Share form ID with developer

### Developer Tasks
- [ ] Install react-tally package
- [ ] Create FeedbackTab.tsx component
- [ ] Create FeedbackTab.test.tsx tests
- [ ] Update Dashboard.tsx (import, state, tab button, content)
- [ ] Replace placeholder form ID with actual ID
- [ ] Run tests locally
- [ ] Update CHANGELOG.md
- [ ] Create feature branch
- [ ] Commit changes
- [ ] Push branch
- [ ] Create PR
- [ ] Test Vercel preview
- [ ] Merge PR
- [ ] Verify production
- [ ] Update SESSION_LOG.md

### Post-Launch Tasks
- [ ] Submit test feedback (3 types)
- [ ] Verify submissions in Tally dashboard
- [ ] Set up email notifications
- [ ] Document first week feedback trends
- [ ] Plan first improvements based on feedback

---

**Last Updated:** 2025-11-15
**Next Review:** After first 10 submissions
**Owner:** Melody Koh
**Status:** Ready for Phase 1 (Tally form creation)
