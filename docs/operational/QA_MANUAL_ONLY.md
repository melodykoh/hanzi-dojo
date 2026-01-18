# Hanzi Dojo — Manual Testing Focus (Automation-Filtered)
**Version:** Epic 5 Complete + Drill C Learnings (2026-01-12)
**Purpose:** Manual-only QA items that cannot be easily automated

---

## IMPORTANT: Drill Feature Testing

**For drill-type features (like Drills A, B, C), use the specialized checklist:**
- See: `docs/operational/DRILL_FEATURE_QA_CHECKLIST.md`
- Covers: State stability, mobile-specific tests, animation, data model validation
- Lessons from: Drill C (Word Match) development where Playwright MCP testing missed critical bugs

---

## Testing Philosophy

**What's Automated (Skip These):**
- ✅ TypeScript compilation errors
- ✅ Database CRUD operations
- ✅ API/RPC call responses
- ✅ State management logic (scoring, counters, metrics)
- ✅ Component rendering (unit tests)
- ✅ Build size and linting
- ✅ Cache hit/miss calculations
- ✅ **NEW:** Add Item validation logic (duplicates, tone marks, required fields)
- ✅ **NEW:** Drill applicability detection (Zhuyin/Traditional logic)
- ✅ **NEW:** Dashboard metrics computation (familiarity, accuracy, known count)
- ✅ **NEW:** Sparkline data generation (7-day calculations)

**What Requires Manual Testing (Focus Here):**
- 👁️ Visual appearance and layout quality
- 🖱️ User experience and interaction flows
- 📱 Responsive design and touch targets
- 🎨 Theme consistency and polish
- ⚡ Performance perception (speed, smoothness)
- 🌐 Real network offline/online transitions
- 🧠 Cognitive load and usability
- 📝 **NEW:** Add Item form usability and dictionary lookup UX
- 📊 **NEW:** Dashboard metrics visual clarity and sparkline readability

---

## 📋 Manual Testing Checklist (52 Critical Items - 15 NEW from Epic 5)

## **VISUAL & LAYOUT QUALITY** (8 items)

### VL-1: Dashboard Visual Polish
- [ ] **Test:** Load dashboard, visually inspect header, tabs, buttons
- [ ] **Look for:**
  - Red gradient header looks professional (no color banding)
  - Chinese characters render correctly (漢字道場)
  - Connection status badge is easy to spot (top-right)
  - "Launch Training Mode" button stands out
  - No text overflow or truncation
  - Proper spacing and alignment

### VL-2: Training Mode Full-Screen Immersion
- [ ] **Test:** Launch training mode
- [ ] **Look for:**
  - Full-screen gradient fills entire viewport (no gaps)
  - Top bar feels "stuck" to top (truly fixed, not jumping)
  - Practice card is clearly the focal point
  - No distracting white backgrounds or gaps
  - Exit button is immediately visible

### VL-3: Responsive Dashboard Layout
- [ ] **Test:** Resize browser window: 1920px → 1440px → 1280px → 1024px wide
- [ ] **Look for:**
  - Content stays readable at all widths
  - Tabs wrap or scroll appropriately
  - Buttons don't overlap
  - Connection badge stays in header
  - No horizontal scroll bars (unless tabs overflow intentionally)

### VL-4: Landscape Training Mode Optimization
- [ ] **Test:** Resize browser to landscape (wider than tall) ~1280x720
- [ ] **Look for:**
  - Practice card uses horizontal space well
  - Options spread across width (not cramped vertically)
  - Top bar uses full width effectively
  - Feels optimized for tablet landscape orientation

### VL-5: Touch Target Sizes (Simulated)
- [ ] **Test:** In Training Mode, click all buttons and options with mouse
- [ ] **Look for:**
  - Easy to click without precision (large targets)
  - Options have generous padding
  - Exit button is large enough for quick taps
  - Drill switcher buttons are adequately sized
  - No accidental clicks on nearby elements

### VL-6: Color Theme Consistency
- [ ] **Test:** Navigate through all screens (Dashboard tabs, Training Mode, Modals)
- [ ] **Look for:**
  - Consistent red theme (red-800/red-600 gradients)
  - White content areas are clean
  - Gray backgrounds (gray-50, gray-100) feel cohesive
  - Green = correct, Red = wrong, Blue/Yellow = secondary
  - No jarring color mismatches
  - Dojo theme feels consistent throughout

### VL-7: Typography & Readability
- [ ] **Test:** Read text on all screens at normal viewing distance
- [ ] **Look for:**
  - Zhuyin characters are legible (not too small)
  - Chinese characters are clear and crisp
  - English text is readable (good contrast)
  - Font sizes are appropriate for context
  - No font rendering issues (anti-aliasing looks good)

### VL-8: Visual Hierarchy
- [ ] **Test:** Glance at each screen for 2 seconds, then look away
- [ ] **Ask yourself:**
  - Is it immediately clear what the primary action is?
  - Does your eye go to the right place first?
  - Are important elements (Exit, Launch Training) visually prominent?
  - Is secondary information appropriately de-emphasized?

---

## **USER EXPERIENCE FLOWS** (12 items)

### UX-1: First-Time User Journey (Parent)
- [ ] **Test:** Pretend you've never seen the app before
- [ ] **Flow:** Open app → Explore dashboard tabs → Launch training mode → Exit
- [ ] **Evaluate:**
  - Is it obvious what each tab does?
  - Can you find "Launch Training Mode" quickly?
  - Is the purpose of the app clear from the UI?
  - Any confusion about what to do next?

### UX-2: Kid Training Mode Experience
- [ ] **Test:** Launch Training Mode, imagine you're 6-8 years old
- [ ] **Flow:** Practice 5 cards → Exit training
- [ ] **Evaluate:**
  - Is it fun and engaging (not boring/clinical)?
  - Are instructions clear without reading much text?
  - Is feedback immediate and encouraging?
  - Can a kid find the Exit button when done?
  - Does the Sensei voice feel friendly?

### UX-3: Practice Flow Satisfaction
- [ ] **Test:** Complete 10 practice cards (mix of correct/wrong)
- [ ] **Evaluate:**
  - Does scoring feel fair (+1.0, +0.5, 0)?
  - Is feedback rewarding when correct?
  - Is feedback encouraging when wrong?
  - Does progress feel tangible (stats updating)?
  - Any frustration or confusion during practice?

### UX-4: Drill Switching Experience
- [ ] **Test:** In Training Mode, switch Drill A ↔ Drill B 3 times
- [ ] **Evaluate:**
  - Is it clear what changed when switching?
  - Does the switch feel instant (no lag)?
  - Are you confused about which drill you're on?
  - Does switching disrupt your flow?

### UX-5: Session Completion Satisfaction
- [ ] **Test:** Complete full practice queue (or trigger summary modal)
- [ ] **Evaluate:**
  - Does the celebration feel rewarding?
  - Are stats presented clearly?
  - Do you understand what "Practice Again" vs "Exit" means?
  - Does the modal feel like a natural stopping point?

### UX-6: Offline Experience (Parent Perspective)
- [ ] **Test:** Go offline, observe dashboard and training mode
- [ ] **Evaluate:**
  - Is offline state immediately obvious (connection badge)?
  - Is messaging helpful ("Sensei cannot reach the dojo")?
  - Does it feel reassuring (not alarming)?
  - Is "Retry Connection" button easy to find?
  - Would a parent understand what to do?

### UX-7: Offline Experience (Kid Perspective)
- [ ] **Test:** In Training Mode, go offline mid-practice
- [ ] **Evaluate:**
  - Does the pause feel natural (not jarring)?
  - Is the kid likely to understand why training stopped?
  - Would they know to ask parent for help?
  - Does dojo theme maintain calm/friendly tone?

### UX-8: Connection Restoration Flow
- [ ] **Test:** Go offline → Click Retry (fail) → Go online → Click Retry (succeed)
- [ ] **Evaluate:**
  - Does retry feel responsive (not hanging)?
  - Is loading state clear during check?
  - Does success feel immediate when back online?
  - Can you resume practice seamlessly?

### UX-9: Dictionary Lookup Workflow
- [ ] **Test:** Dashboard → Dictionary tab → Search for 3-4 characters
- [ ] **Evaluate:**
  - Is lookup process straightforward?
  - Are results easy to understand?
  - Is Zhuyin display readable (horizontal format)?
  - Does multi-reading character display make sense?
  - Would a parent understand how to use this?

### UX-10: Navigation Mental Model
- [ ] **Test:** Navigate: Dashboard → Training → Exit → Dashboard → Dictionary → Training
- [ ] **Evaluate:**
  - Is navigation predictable (where you expect to go)?
  - Does browser back button work as expected?
  - Do you ever feel "lost" in the app?
  - Is the two-route structure (/dashboard, /training) clear?

### UX-11: Error Recovery (No Practice Items)
- [ ] **Test:** Launch Training Mode with empty queue
- [ ] **Evaluate:**
  - Is empty state friendly (not an error message)?
  - Does it guide you to next action (add items)?
  - Is Exit button still easy to find?
  - Does emoji (📚) lighten the mood?

### UX-12: Long Session Endurance
- [ ] **Test:** Practice 20+ items in one sitting
- [ ] **Evaluate:**
  - Does the experience stay engaging?
  - Any visual fatigue from colors/contrast?
  - Do stats continue to motivate?
  - Is it easy to take breaks (Exit always visible)?

---

## **PERFORMANCE & PERCEPTION** (6 items)

### PERF-1: Initial Load Speed (Subjective)
- [ ] **Test:** Refresh dashboard (Cmd+R) with cache cleared
- [ ] **Evaluate:**
  - Does it feel instant/fast/acceptable/slow?
  - Any jarring layout shifts during load?
  - Do images/fonts pop in noticeably?
  - Rate: ⚡ Fast | ✅ Acceptable | ⚠️ Slow

### PERF-2: Training Mode Launch Speed
- [ ] **Test:** Click "Launch Training Mode" from dashboard
- [ ] **Evaluate:**
  - How long until full-screen training mode appears?
  - Does it feel responsive (< 1 second)?
  - Any loading spinner needed, or is it instant?
  - Rate: ⚡ Instant | ✅ Fast | ⚠️ Noticeable Delay

### PERF-3: Practice Card Transitions
- [ ] **Test:** Answer 10 cards in quick succession
- [ ] **Evaluate:**
  - Does next card appear smoothly?
  - Any lag between answer → toast → next card?
  - Do animations feel fluid (60fps)?
  - Rate: ⚡ Smooth | ✅ Acceptable | ⚠️ Choppy

### PERF-4: Offline Detection Responsiveness
- [ ] **Test:** Turn Wi-Fi off, count seconds until offline modal appears
- [ ] **Evaluate:**
  - Time to detection: _____ seconds
  - Does it feel too slow (> 10s) or acceptably fast?
  - Rate: ⚡ <5s | ✅ 5-10s | ⚠️ >10s

### PERF-5: Online Restoration Responsiveness
- [ ] **Test:** Turn Wi-Fi on, click Retry, count seconds until modal hides
- [ ] **Evaluate:**
  - Time to reconnect: _____ seconds
  - Does it feel responsive?
  - Rate: ⚡ <3s | ✅ 3-8s | ⚠️ >8s

### PERF-6: Overall App Snappiness
- [ ] **Test:** Use app for 15 minutes, clicking around rapidly
- [ ] **Evaluate:**
  - Does the app feel responsive to clicks?
  - Any noticeable delays or freezes?
  - Does it feel "native" or "web sluggish"?
  - Rate: ⚡ Very Snappy | ✅ Responsive | ⚠️ Sluggish

---

## **REAL NETWORK BEHAVIOR** (4 items)

### NET-1: Actual Wi-Fi Off/On Cycle
- [ ] **Test:** Physical Wi-Fi toggle off → wait → toggle on
- [ ] **Evaluate:**
  - Does app detect offline state reliably?
  - Does reconnection happen automatically or need Retry?
  - Any edge cases (shows online but still offline)?
  - Does badge color change accurately?

### NET-2: Airplane Mode Test (Mobile Device)
- [ ] **Test:** If testing on mobile, enable Airplane Mode
- [ ] **Evaluate:**
  - App detects offline immediately or delays?
  - Modal appears as expected?
  - Retry button works when Airplane Mode disabled?

### NET-3: Flaky Network Simulation
- [ ] **Test:** Toggle Wi-Fi on/off 5 times rapidly (every 3-5 seconds)
- [ ] **Evaluate:**
  - App handles flapping gracefully (no crashes)?
  - Badge updates track with network state?
  - Modal appears/hides rapidly but correctly?
  - Any UI freezes or console errors?

### NET-4: Slow/Degraded Connection
- [ ] **Test:** Use Chrome DevTools → Network → "Slow 3G" throttle
- [ ] **Evaluate:**
  - Does app still function (just slower)?
  - Does Supabase query eventually succeed or timeout?
  - Does loading state persist appropriately?
  - Any false offline detections?

---

## **ACCESSIBILITY & USABILITY** (4 items)

### ACC-1: Keyboard Navigation
- [ ] **Test:** Navigate app using only Tab, Enter, Arrow keys
- [ ] **Evaluate:**
  - Can you tab through all interactive elements?
  - Is tab order logical (top-to-bottom, left-to-right)?
  - Can you press Enter on buttons to activate?
  - Are focused elements visually highlighted?

### ACC-2: Color Contrast (Quick Check)
- [ ] **Test:** Reduce screen brightness to 25%, read all text
- [ ] **Evaluate:**
  - Is all text still readable?
  - Do disabled states (grayed buttons) have enough contrast?
  - Are red/green states distinguishable for colorblind users?
  - Rate: ✅ Excellent | ⚠️ Marginal | ❌ Poor

### ACC-3: Text Size Scaling
- [ ] **Test:** Browser zoom to 150%, then 200%
- [ ] **Evaluate:**
  - Does layout adapt gracefully?
  - Any text truncation or overlaps?
  - Are buttons still clickable?
  - Is content still usable at 200%?

### ACC-4: Error Messages Clarity
- [ ] **Test:** Trigger error states (offline, empty queue, etc.)
- [ ] **Evaluate:**
  - Are error messages in plain language?
  - Do they suggest next steps?
  - Are they reassuring (not alarming)?
  - Would a non-technical parent understand?

---

## **EDGE CASES & POLISH** (3 items)

### EDGE-1: Browser Back Button Behavior
- [ ] **Test:** Dashboard → Training → Browser Back → Browser Forward → Training → Exit → Browser Back
- [ ] **Evaluate:**
  - Does back button work as expected each time?
  - Any double-back needed (unexpected)?
  - Does state reset appropriately?
  - Any broken states after navigation?

### EDGE-2: Tab Switching (Browser Tabs)
- [ ] **Test:** Open Training Mode → Switch browser tab → Wait 30s → Switch back
- [ ] **Evaluate:**
  - Does training mode resume correctly?
  - Any connection issues after tab was inactive?
  - Does offline detection still work?
  - Any stale state?

### EDGE-3: Console Cleanliness (Developer Experience)
- [ ] **Test:** Open browser console (F12), use app normally for 5 minutes
- [ ] **Evaluate:**
  - Any red errors in console?
  - Warnings acceptable or concerning?
  - Network requests look clean?
  - Rate: ✅ Clean | ⚠️ Minor Issues | ❌ Many Errors

---

## **EPIC 5: ADD ITEM FORM** (8 items - NEW)

### AI-1: Dictionary Lookup UX Flow
- [ ] **Test:** Click "➕ Add Item" → Type "陽" (should be in dictionary)
- [ ] **Evaluate:**
  - Does lookup feel responsive (< 500ms)?
  - Is "Found in dictionary" message reassuring?
  - Are auto-filled fields clearly indicated?
  - Is it obvious the data came from dictionary (not manual)?
  - Would a parent trust this auto-fill?

### AI-2: Multi-Pronunciation Selection UX
- [ ] **Test:** Type "了" or "着" (multi-pronunciation character)
- [ ] **Evaluate:**
  - Is it clear there are multiple pronunciations?
  - Are context words helpful for choosing?
  - Is selection UI intuitive (click to select)?
  - Does selected variant feel "chosen" (visual feedback)?
  - Would a parent understand which to pick?

### AI-3: Manual Entry Workflow (Not Found)
- [ ] **Test:** Type a rare/uncommon character not in dictionary
- [ ] **Evaluate:**
  - Is "not found" messaging friendly (not alarming)?
  - Is it clear you need to enter data manually?
  - Can you still proceed to add the item?
  - Does manual override toggle work intuitively?
  - Would a parent feel confident entering manually?

### AI-4: Validation Error Messaging
- [ ] **Test:** Try submitting form with empty fields, invalid Zhuyin, duplicate
- [ ] **Evaluate:**
  - Are error messages in plain language?
  - Do they suggest how to fix (actionable)?
  - Are errors displayed clearly (not hidden)?
  - Is duplicate detection message friendly?
  - Would a parent understand what went wrong?

### AI-5: Drill Applicability Indicators
- [ ] **Test:** Add character with/without Traditional differences
- [ ] **Evaluate:**
  - Is it clear which drills will be enabled?
  - Are "✓ Drill A" / "✓ Drill B" badges obvious?
  - Does it make sense why only Zhuyin shows for 的/得?
  - Is the logic understandable to non-technical parent?

### AI-6: Form Layout & Readability
- [ ] **Test:** Visual inspection of Add Item form on desktop and mobile
- [ ] **Evaluate:**
  - Are input fields appropriately sized?
  - Is Zhuyin pronunciation readable (large enough)?
  - Are labels clear and aligned properly?
  - Does form feel organized (not cluttered)?
  - Is Submit button prominently placed?

### AI-7: Success Feedback Flow
- [ ] **Test:** Successfully add a character
- [ ] **Evaluate:**
  - Is success message satisfying?
  - Does redirect back to dashboard feel natural?
  - Would you know the item was added (confirmation)?
  - Is there a sense of accomplishment?

### AI-8: Add Item → Practice End-to-End
- [ ] **Test:** Add 2 characters → Launch Training → Practice them
- [ ] **Evaluate:**
  - Do newly added items appear in queue immediately?
  - Are drill options correct (match applicability)?
  - Does Zhuyin display match what you entered?
  - Does flow feel seamless (no friction)?

---

## **EPIC 5: DASHBOARD METRICS** (7 items - NEW)

### DM-1: Metrics Tiles Visual Impact
- [ ] **Test:** View "📊 Dashboard" tab with some practice data
- [ ] **Evaluate:**
  - Do tiles stand out (eye-catching colors)?
  - Is tile hierarchy clear (important metrics prominent)?
  - Are gradients (blue, purple, green, red) professional?
  - Does layout feel balanced (not cramped/sparse)?
  - Would a parent immediately understand these metrics?

### DM-2: Metrics Accuracy & Trustworthiness
- [ ] **Test:** Practice 5 items → Check if metrics update
- [ ] **Evaluate:**
  - Does "Weekly Progress" feel accurate?
  - Does "Accuracy %" match your perception?
  - Does "Known" count make sense?
  - Would you trust these numbers to track progress?
  - Any numbers feel "off" or confusing?

### DM-3: Sparkline Visualization Quality
- [ ] **Test:** View 7-day sparkline after practicing
- [ ] **Evaluate:**
  - Is sparkline easy to read at a glance?
  - Are bars proportional (visual accuracy)?
  - Is today's bar clearly identifiable?
  - Does daily breakdown make sense?
  - Would a parent find this motivating?

### DM-4: Zero State / Empty State
- [ ] **Test:** View Dashboard with no practice data
- [ ] **Evaluate:**
  - Do zero/empty states feel appropriate (not broken)?
  - Is "No practice data yet" message friendly?
  - Does it encourage next action (start practicing)?
  - Any confusing zeros (0.0, 0%, 0/0)?

### DM-5: Metrics Responsiveness (Mobile)
- [ ] **Test:** View Dashboard on mobile portrait/landscape
- [ ] **Evaluate:**
  - Do tiles stack/wrap appropriately?
  - Is text still readable at mobile size?
  - Does sparkline adapt to narrow width?
  - Any horizontal scrolling (unintended)?
  - Does layout feel optimized for mobile?

### DM-6: Metrics Motivation Factor
- [ ] **Test:** Practice for 3 days, check metrics daily
- [ ] **Evaluate:**
  - Do numbers feel rewarding (motivating)?
  - Is progress tangible (visible changes)?
  - Would daily check-ins feel satisfying?
  - Do metrics encourage continued practice?
  - Would a parent share these with child?

### DM-7: Metrics vs Practice Tab Consistency
- [ ] **Test:** Compare metrics on Dashboard vs numbers shown in Practice Demo
- [ ] **Evaluate:**
  - Do session stats match dashboard totals?
  - Is accuracy consistent across views?
  - Are point calculations aligned?
  - Any confusing discrepancies?

---

## 🎯 Prioritized Testing Tiers

### **Tier 1: Critical Path (20 min)**
Must work for basic functionality:
- [ ] **AI-8: Add Item → Practice End-to-End** ⭐ NEW - Validates entire Epic 5 integration
- [ ] **DM-2: Metrics Accuracy & Trustworthiness** ⭐ NEW - Ensures calculations are correct
- [ ] VL-2: Training Mode Full-Screen Immersion
- [ ] UX-2: Kid Training Mode Experience
- [ ] UX-3: Practice Flow Satisfaction
- [ ] UX-6: Offline Experience (Parent)
- [ ] PERF-3: Practice Card Transitions
- [ ] NET-1: Actual Wi-Fi Off/On Cycle

### **Tier 2: Quality Assurance (35 min)**
Important for polished experience:
- [ ] **AI-1: Dictionary Lookup UX Flow** ⭐ NEW - Core Add Item feature
- [ ] **AI-4: Validation Error Messaging** ⭐ NEW - User-facing validation feedback
- [ ] **DM-1: Metrics Tiles Visual Impact** ⭐ NEW - First impression of dashboard
- [ ] **DM-3: Sparkline Visualization Quality** ⭐ NEW - Progress tracking clarity
- [ ] VL-1: Dashboard Visual Polish
- [ ] VL-6: Color Theme Consistency
- [ ] UX-1: First-Time User Journey
- [ ] UX-5: Session Completion Satisfaction
- [ ] UX-8: Connection Restoration Flow
- [ ] PERF-1: Initial Load Speed
- [ ] ACC-2: Color Contrast

### **Tier 3: Nice to Have (50 min+)**
Polish and edge cases:
- [ ] **AI-2: Multi-Pronunciation Selection UX** - Multi-reading characters (了, 着)
- [ ] **AI-3: Manual Entry Workflow** - Dictionary miss handling
- [ ] **AI-5: Drill Applicability Indicators** - Visual feedback for enabled drills
- [ ] **AI-6: Form Layout & Readability** - Add Item form visual quality
- [ ] **AI-7: Success Feedback Flow** - Post-submission experience
- [ ] **DM-4: Zero State / Empty State** - Empty dashboard handling
- [ ] **DM-5: Metrics Responsiveness (Mobile)** - Mobile layout adaptation
- [ ] **DM-6: Metrics Motivation Factor** - Emotional/motivational impact
- [ ] **DM-7: Metrics vs Practice Tab Consistency** - Cross-tab data accuracy
- [ ] VL-3: Responsive Dashboard Layout
- [ ] VL-4: Landscape Training Mode Optimization
- [ ] VL-5: Touch Target Sizes
- [ ] UX-9: Dictionary Lookup Workflow
- [ ] UX-12: Long Session Endurance
- [ ] NET-3: Flaky Network Simulation
- [ ] ACC-1: Keyboard Navigation
- [ ] EDGE-1: Browser Back Button Behavior

---

## 📊 Manual Testing Results

### Tier 1 Results (Critical)
**Total:** 8 tests (2 NEW from Epic 5)
**Passed:** [ ]
**Failed:** [ ]
**Blockers:** [ ]

**Critical Issues:**
1. _________________________________
2. _________________________________

### Tier 2 Results (Quality)
**Total:** 11 tests (4 NEW from Epic 5)
**Passed:** [ ]
**Failed:** [ ]

**Quality Issues:**
1. _________________________________
2. _________________________________

### Tier 3 Results (Polish)
**Total:** 17 tests (9 NEW from Epic 5)
**Passed:** [ ]
**Failed:** [ ]

**Minor Issues:**
1. _________________________________
2. _________________________________

---

## 🚀 Quick Manual Validation (7 min)

If you only have 7 minutes, test these 7 items:

1. [ ] **Epic 5 Integration:** Add character → Practice it (AI-8) ⭐ NEW
2. [ ] **Epic 5 Metrics:** Check dashboard metrics update correctly (DM-2) ⭐ NEW
3. [ ] **Visual Check:** Does Training Mode look good full-screen? (VL-2)
4. [ ] **UX Check:** Can a kid practice 3 cards successfully? (UX-2)
5. [ ] **Offline Check:** Go offline → Modal appears → Go online → Modal hides (NET-1)
6. [ ] **Performance Check:** Do card transitions feel smooth? (PERF-3)
7. [ ] **Error Check:** Any console errors when using app? (EDGE-3)

**If all 7 pass:** Build quality is good
**If any fail:** Investigate before proceeding

---

## 💡 Testing Tips

### Mindset
- **Think like a parent:** Would this make sense to a non-technical user?
- **Think like a kid:** Is this fun? Are instructions clear without reading?
- **Think like a designer:** Does this look polished? Professional?

### What to Ignore
- Minor console warnings (unless they impact UX)
- Build size optimization (already checked automatically)
- Database query performance (unless user-perceivable)
- Code quality issues (linting handles this)

### What to Focus On
- **Does it feel good?** (Emotional response matters)
- **Is it clear?** (Cognitive load, confusion)
- **Does it work reliably?** (Real network, real browsers)
- **Would you let your child use this?** (Trust and safety)

---

## 📝 Feedback Format

For each failed test, note:

**Test ID:** [e.g., UX-2]
**Issue:** [What went wrong]
**Severity:** [Critical / Major / Minor]
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot/Video:** [If applicable]

---

**Document Version:** 2.0 (Manual Only - Epic 5)
**Covers:** Epic 4 + Epic 5 Complete Builds
**Total Manual Tests:** 52 (37 from Epic 4, 15 NEW from Epic 5)
**Estimated Time:** 105 minutes (full suite) or 20 minutes (Tier 1 only)
