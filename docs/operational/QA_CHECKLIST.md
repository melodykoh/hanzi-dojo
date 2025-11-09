# Hanzi Dojo — Manual QA Spot-Check Checklist
**Version:** Epic 4 Complete (2025-11-04)
**Build:** Training Mode + Offline Guardrails

---

## 🧪 Testing Environment Setup

### Prerequisites
- [ ] Dev server running (`npm run dev`)
- [ ] Browser: Chrome, Safari, or Firefox (latest version)
- [ ] Internet connection active (for online tests)
- [ ] Ability to toggle network on/off (for offline tests)

### Test Data Requirements
- [ ] Supabase project configured with `.env.local`
- [ ] Database migrations applied (001-005)
- [ ] Dictionary seeded with 155 characters
- [ ] At least 1 kid profile created in database
- [ ] At least 5 practice entries added (for testing queues)

---

## 📋 QA Test Cases

## **SECTION 1: Dashboard & Navigation**

### 1.1 Dashboard Loads Correctly
- [ ] Navigate to `http://localhost:5173/`
- [ ] **Expected:** Dashboard loads with red header "漢字道場 Hanzi Dojo"
- [ ] **Expected:** Subtitle shows "Epic 4: Training Mode UX & Guardrails"
- [ ] **Expected:** Connection status badge shows in top-right (green "Online")
- [ ] **Expected:** Six tabs visible: Practice, Dictionary, Analytics, Missing, Badges, Toast
- [ ] **Expected:** "➕ Add Item (Demo)" button visible
- [ ] **Expected:** "🎯 Launch Training Mode" button visible

### 1.2 Tab Navigation Works
- [ ] Click each tab in sequence (Practice → Dictionary → Analytics → Missing → Badges → Toast)
- [ ] **Expected:** Tab content changes for each selection
- [ ] **Expected:** Active tab shows red underline border
- [ ] **Expected:** No console errors
- [ ] **Expected:** URL stays at `/` (no route change)

### 1.3 Launch Training Mode Button
- [ ] From Dashboard, click "🎯 Launch Training Mode"
- [ ] **Expected:** URL changes to `/training`
- [ ] **Expected:** Full-screen training mode loads
- [ ] **Expected:** Dashboard is no longer visible

### 1.4 Browser Back Button
- [ ] While in Training Mode, click browser back button
- [ ] **Expected:** Returns to Dashboard at `/`
- [ ] **Expected:** Dashboard state preserved (same tab active)

---

## **SECTION 2: Dictionary Functionality**

### 2.1 Dictionary Lookup (Found Entry)
- [ ] Navigate to Dashboard → Dictionary tab
- [ ] Enter character: `太` in search field
- [ ] Click "Lookup" button
- [ ] **Expected:** Results show "Found: Yes"
- [ ] **Expected:** Displays Traditional: 太, Simplified: 太
- [ ] **Expected:** Shows Zhuyin horizontally (e.g., ㄊㄞˋ)
- [ ] **Expected:** Shows Pinyin (tài)
- [ ] **Expected:** Shows meanings array
- [ ] **Expected:** "Applicable Drills" shows only `zhuyin` (identical Simp/Trad)

### 2.2 Dictionary Lookup (Multi-Reading Character)
- [ ] Search for character: `着`
- [ ] **Expected:** Shows multiple Zhuyin variants (zháo, zhuó, zhe)
- [ ] **Expected:** Each variant shows context words
- [ ] **Expected:** Applicable drills shows both `zhuyin` and `trad`

### 2.3 Dictionary Lookup (Not Found)
- [ ] Search for character: `龘` (rare character not in seed)
- [ ] **Expected:** Results show "Found: No"
- [ ] **Expected:** Entry logged to `dictionary_missing` table
- [ ] Navigate to Dashboard → Missing tab
- [ ] **Expected:** Character `龘` appears in missing entries list

### 2.4 Cache Performance
- [ ] Search for `太` again (second time)
- [ ] **Expected:** Instant results (cache hit)
- [ ] Check cache stats section
- [ ] **Expected:** Cache hit rate increases
- [ ] **Expected:** Cache size shows number of cached entries

### 2.5 Batch Lookup
- [ ] Click "Batch Test" button (if available) or search multiple characters
- [ ] **Expected:** All characters load successfully
- [ ] **Expected:** Cache size increments for new characters

---

## **SECTION 3: Practice Demo Flow**

### 3.1 Practice Tab Loads
- [ ] Navigate to Dashboard → Practice tab
- [ ] **Expected:** Session stats show: 0 Points, 0% Accuracy, 0/0 Correct
- [ ] **Expected:** "Drill A (Zhuyin)" button selected by default
- [ ] **Expected:** "Use Real Data" or "Use Mock Data" toggle visible
- [ ] **Expected:** Practice card displays with character and 4 options

### 3.2 First Attempt Correct (Drill A - Zhuyin)
- [ ] Read the character displayed
- [ ] Click the **correct** Zhuyin option
- [ ] **Expected:** Selected option turns green
- [ ] **Expected:** Feedback toast appears: "+1.0 points" with Sensei message
- [ ] **Expected:** Session stats update: +1.0 Points, 100% Accuracy, 1/1 Correct
- [ ] **Expected:** Toast auto-hides after 2 seconds
- [ ] **Expected:** Advances to next card automatically

### 3.3 First Attempt Wrong, Second Attempt Correct
- [ ] On a new card, click a **wrong** Zhuyin option
- [ ] **Expected:** Selected option turns red and disables
- [ ] **Expected:** No toast appears yet
- [ ] **Expected:** Other options remain clickable
- [ ] Click the **correct** option
- [ ] **Expected:** Correct option turns green
- [ ] **Expected:** Feedback toast shows "+0.5 points" with recovery message
- [ ] **Expected:** Session stats update accordingly
- [ ] **Expected:** Advances to next card

### 3.4 Both Attempts Wrong
- [ ] On a new card, click a **wrong** option
- [ ] Click another **wrong** option
- [ ] **Expected:** Second wrong option also turns red
- [ ] **Expected:** Correct answer revealed (turns green automatically)
- [ ] **Expected:** Feedback toast shows "0 points" with encouragement message
- [ ] **Expected:** Session stats update: accuracy decreases, total increments
- [ ] **Expected:** Advances to next card

### 3.5 Drill B (Traditional) Switching
- [ ] Click "Drill B (Traditional)" button
- [ ] **Expected:** Card resets with new character
- [ ] **Expected:** Question shows Simplified character
- [ ] **Expected:** Options show 4 different Traditional characters
- [ ] Test correct/wrong scenarios as above
- [ ] **Expected:** Scoring works identically to Drill A

### 3.6 Session Stats Accuracy
- [ ] Complete 5 practice cards (mix of correct/wrong)
- [ ] **Expected:** Points = (first_try_count × 1.0) + (second_try_count × 0.5)
- [ ] **Expected:** Accuracy % = (correct_count / total_count) × 100
- [ ] **Expected:** Correct count matches actual successful attempts

### 3.7 End Training Button
- [ ] Click "End Training" button
- [ ] **Expected:** Modal appears with session summary
- [ ] **Expected:** Shows total points, accuracy %, correct/total
- [ ] **Expected:** Two buttons: "Continue Training" and "New Session"
- [ ] Click "Continue Training"
- [ ] **Expected:** Modal closes, practice resumes
- [ ] Click "End Training" again, then "New Session"
- [ ] **Expected:** Stats reset to 0, new session starts

---

## **SECTION 4: Training Mode (Full-Screen)**

### 4.1 Training Mode Loads
- [ ] From Dashboard, click "🎯 Launch Training Mode"
- [ ] **Expected:** Full-screen red gradient background
- [ ] **Expected:** URL is `/training`
- [ ] **Expected:** Top bar visible with Exit, Stats, Drill switcher
- [ ] **Expected:** Practice card centered in viewport

### 4.2 Top Bar Elements
- [ ] Verify "← Exit Training" button is in top-left
- [ ] **Expected:** Session stats display: Points, Accuracy %, Progress (X/Y)
- [ ] **Expected:** "Drill A" and "Drill B" buttons visible in top-right
- [ ] **Expected:** Top bar stays fixed when scrolling (if content overflows)

### 4.3 Exit Training Button
- [ ] Click "← Exit Training"
- [ ] **Expected:** Returns to Dashboard (`/`)
- [ ] **Expected:** Training session state is lost (expected behavior)
- [ ] **Expected:** No error console messages

### 4.4 Training Mode Practice Flow
- [ ] Complete 3 practice cards in Training Mode
- [ ] **Expected:** Same scoring logic as Practice Demo (1.0, 0.5, 0 points)
- [ ] **Expected:** Stats update in real-time in top bar
- [ ] **Expected:** Progress counter increments (1/20, 2/20, 3/20...)
- [ ] **Expected:** Feedback toast appears for each answer

### 4.5 Drill Switching in Training Mode
- [ ] In Training Mode, click "Drill B"
- [ ] **Expected:** Queue resets, current index returns to 0
- [ ] **Expected:** New character loads for Drill B
- [ ] **Expected:** Stats remain (points/accuracy preserved)
- [ ] Click "Drill A"
- [ ] **Expected:** Switches back to Drill A queue

### 4.6 Session Completion
- [ ] Complete all items in queue (if small queue, or wait until last item)
- [ ] **Expected:** Session summary modal appears
- [ ] **Expected:** Displays final points, accuracy, correct count
- [ ] **Expected:** Options: "Practice Again" or "Exit Training"
- [ ] Click "Practice Again"
- [ ] **Expected:** Queue restarts, stats reset
- [ ] Click "Exit Training" from modal
- [ ] **Expected:** Returns to Dashboard

### 4.7 No Practice Items State
- [ ] Clear all entries from database OR test with empty kid profile
- [ ] Launch Training Mode
- [ ] **Expected:** Shows "No Practice Items" message
- [ ] **Expected:** "📚" emoji and friendly text: "Ask your parent to add some characters!"
- [ ] **Expected:** "Exit Training" button visible
- [ ] Click Exit
- [ ] **Expected:** Returns to Dashboard

---

## **SECTION 5: Offline Detection & Guardrails**

### 5.1 Connection Status Badge (Online)
- [ ] Ensure internet connection is active
- [ ] Refresh Dashboard
- [ ] **Expected:** Badge shows green dot + "Online"
- [ ] **Expected:** No error messages
- [ ] **Expected:** All features functional

### 5.2 Connection Status Badge (Offline)
- [ ] Disable network (turn off Wi-Fi or use browser DevTools: Network → Offline)
- [ ] Wait 5-10 seconds
- [ ] **Expected:** Badge changes to red dot + "Offline"
- [ ] **Expected:** Pulsing red dot animation visible

### 5.3 Add Item Button Blocked (Offline)
- [ ] While offline, observe "➕ Add Item (Demo)" button
- [ ] **Expected:** Button appears grayed out (opacity 50%)
- [ ] **Expected:** Cursor shows "not-allowed" on hover
- [ ] **Expected:** Warning message appears below button: "Offline: Cannot add items while offline"
- [ ] Click button
- [ ] **Expected:** Nothing happens (button disabled)

### 5.4 Add Item Button Enabled (Online)
- [ ] Re-enable network (turn Wi-Fi back on)
- [ ] Wait for connection to restore (~5-30 seconds)
- [ ] **Expected:** Badge changes to green "Online"
- [ ] **Expected:** Add Item button becomes fully opaque
- [ ] **Expected:** Warning message disappears
- [ ] Click button
- [ ] **Expected:** Alert shows: "Add Item functionality (requires online connection)"

### 5.5 Offline Modal in Training Mode (Automatic)
- [ ] Launch Training Mode
- [ ] Start practicing (complete 1-2 cards)
- [ ] Disable network (Wi-Fi off or DevTools offline)
- [ ] Wait ~10 seconds
- [ ] **Expected:** Full-screen modal appears over training mode
- [ ] **Expected:** Dojo mascot visible (🥋💤)
- [ ] **Expected:** Title: "Training Paused"
- [ ] **Expected:** Message: "Sensei cannot reach the dojo right now"
- [ ] **Expected:** Red "Connection Lost" indicator with pulsing dot
- [ ] **Expected:** "Retry Connection" button visible

### 5.6 Offline Modal Retry (Still Offline)
- [ ] While network is still disabled, click "Retry Connection"
- [ ] **Expected:** Button shows loading spinner: "Checking Connection..."
- [ ] **Expected:** After 2-5 seconds, modal remains (still offline)
- [ ] **Expected:** "Connection Lost" status unchanged

### 5.7 Offline Modal Auto-Hide (Connection Restored)
- [ ] While modal is visible, re-enable network
- [ ] Wait for connection restore (may need to click "Retry Connection")
- [ ] **Expected:** Modal disappears automatically
- [ ] **Expected:** Training mode resumes exactly where it left off
- [ ] **Expected:** No data loss (session stats preserved)
- [ ] **Expected:** Green "Online" badge in top bar

### 5.8 Practice Flow During Offline (Edge Case)
- [ ] In Training Mode, go offline
- [ ] **Expected:** Modal blocks interaction with practice card
- [ ] **Expected:** Cannot click options or Exit button (modal overlay blocks)
- [ ] Restore connection
- [ ] **Expected:** Can resume practice immediately

---

## **SECTION 6: Known Badge & Analytics**

### 6.1 Known Badge Display (Dashboard → Badges Tab)
- [ ] Navigate to Dashboard → Badges tab
- [ ] **Expected:** Demo badges display with different states:
  - New (never practiced)
  - In Progress (1/2 successes)
  - ⭐ Known (2+ successes, <2 misses)
  - 🔁 Needs Review (2+ consecutive misses)

### 6.2 Analytics Dashboard
- [ ] Navigate to Dashboard → Analytics tab
- [ ] **Expected:** Displays:
  - Weekly accuracy rate (percentage)
  - Total familiarity points
  - Known count (number of entries marked known)
- [ ] **Expected:** Stats update if you practice and refresh

### 6.3 Missing Entries View
- [ ] Navigate to Dashboard → Missing tab
- [ ] **Expected:** List of characters that failed dictionary lookup
- [ ] **Expected:** Shows character, simplified, traditional, timestamp
- [ ] **Expected:** "Refresh" button available
- [ ] Click Refresh
- [ ] **Expected:** List updates with any new missing entries

---

## **SECTION 7: UI/UX Polish**

### 7.1 Responsive Layout (Desktop)
- [ ] Resize browser window to various desktop sizes (1920x1080, 1440x900, 1280x720)
- [ ] **Expected:** Dashboard tabs scroll horizontally if needed
- [ ] **Expected:** Content stays within max-width container
- [ ] **Expected:** No layout breaks or overlapping elements

### 7.2 Training Mode Landscape Optimization
- [ ] Resize browser to landscape orientation (wider than tall)
- [ ] **Expected:** Practice card uses horizontal space well
- [ ] **Expected:** Options layout spreads across width
- [ ] **Expected:** Top bar spans full width

### 7.3 Touch Target Sizes (Simulated)
- [ ] In Training Mode, observe button sizes
- [ ] **Expected:** All buttons are large (min 44x44px touch target)
- [ ] **Expected:** Drill options have generous padding
- [ ] **Expected:** Easy to click without precision

### 7.4 Color Consistency (Dojo Theme)
- [ ] Verify color scheme throughout app:
  - Red gradient headers (red-800 to red-600)
  - White content areas
  - Gray backgrounds (gray-50, gray-100)
  - Green for correct answers
  - Red for wrong answers
  - Blue/Yellow for secondary actions
- [ ] **Expected:** Consistent theme across all screens

### 7.5 Loading States
- [ ] Refresh Training Mode
- [ ] **Expected:** "Loading practice..." message displays briefly
- [ ] **Expected:** No flash of unstyled content

### 7.6 Error States (No Console Errors)
- [ ] Open browser console (F12 → Console tab)
- [ ] Navigate through all features
- [ ] **Expected:** No red error messages in console
- [ ] **Expected:** Only informational logs (blue/gray)

---

## **SECTION 8: Data Persistence**

### 8.1 Practice State Updates Database
- [ ] Complete 3 practice attempts in Practice Demo (real data mode)
- [ ] Check Supabase dashboard → `practice_state` table
- [ ] **Expected:** Entries exist for completed items
- [ ] **Expected:** Counters updated: `first_try_success_count`, `second_try_success_count`, `consecutive_miss_count`
- [ ] **Expected:** Timestamps updated: `last_attempt_at`

### 8.2 Practice Events Logged
- [ ] After completing practice, check Supabase → `practice_events` table
- [ ] **Expected:** Immutable log entries created for each attempt
- [ ] **Expected:** Each event shows: `kid_id`, `entry_id`, `drill`, `is_correct`, `points_awarded`, `attempt_index`

### 8.3 Dictionary Cache Persistence (Session Only)
- [ ] Lookup character `太` in Dictionary tab
- [ ] Refresh browser (Cmd+R or F5)
- [ ] Lookup `太` again
- [ ] **Expected:** Cache miss (in-memory cache cleared on refresh)
- [ ] **Expected:** Lookup fetches from Supabase again
- [ ] **Note:** This is expected behavior (IndexedDB not yet implemented)

---

## **SECTION 9: Edge Cases & Error Handling**

### 9.1 Empty Queue Handling
- [ ] Remove all entries from database
- [ ] Launch Training Mode
- [ ] **Expected:** "No Practice Items" state displays
- [ ] **Expected:** No JavaScript errors
- [ ] **Expected:** Exit button still functional

### 9.2 Drill with No Applicable Options
- [ ] Add entry with identical Simp/Trad (e.g., `太`)
- [ ] Try to practice Drill B
- [ ] **Expected:** Entry excluded from Drill B queue (only `zhuyin` applicable)
- [ ] **Expected:** Only Drill A shows this character

### 9.3 Network Flapping (On/Off Rapidly)
- [ ] Toggle network on/off 3-4 times quickly
- [ ] **Expected:** Connection badge updates each time
- [ ] **Expected:** Offline modal appears/disappears accordingly
- [ ] **Expected:** No crashes or frozen UI

### 9.4 Long Session Stability
- [ ] Complete 20+ practice items in one session
- [ ] **Expected:** No memory leaks (check browser task manager)
- [ ] **Expected:** Performance remains smooth
- [ ] **Expected:** Stats continue to update correctly

### 9.5 Browser Back/Forward Navigation
- [ ] Navigate: Dashboard → Training → Exit → Training → Browser Back
- [ ] **Expected:** Navigation history works correctly
- [ ] **Expected:** No double-back required
- [ ] **Expected:** State resets appropriately

---

## **SECTION 10: Build & Deployment Readiness**

### 10.1 TypeScript Compilation
- [ ] Run `npm run build` in terminal
- [ ] **Expected:** Build completes with no errors
- [ ] **Expected:** Output shows `dist/` folder with bundled files
- [ ] **Expected:** No TypeScript type errors

### 10.2 Linting
- [ ] Run `npm run lint` in terminal
- [ ] **Expected:** No critical errors
- [ ] **Expected:** Warnings (if any) are acceptable or documented

### 10.3 Production Build Size
- [ ] Check `dist/assets/` folder after build
- [ ] **Expected:** Main JS bundle ~400 KB (acceptable for feature set)
- [ ] **Expected:** CSS bundle ~25 KB
- [ ] **Expected:** Gzip size ~116 KB (reasonable)

### 10.4 Environment Variables
- [ ] Verify `.env.local` exists with valid Supabase credentials
- [ ] **Expected:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set
- [ ] **Expected:** `.env.local` listed in `.gitignore` (not committed)

---

## 📊 QA Summary Template

After completing all tests, fill out this summary:

### Test Results
- **Total Tests:** [   ]
- **Passed:** [   ]
- **Failed:** [   ]
- **Blocked:** [   ]
- **Not Tested:** [   ]

### Critical Issues Found
1. [Description]
2. [Description]
3. [Description]

### Minor Issues Found
1. [Description]
2. [Description]
3. [Description]

### Recommendations
- [ ] Ready for user acceptance testing
- [ ] Needs fixes before UAT
- [ ] Ready for deployment
- [ ] Additional testing required

### Notes
[Any additional observations or feedback]

---

## 🎯 Quick Smoke Test (15 Minutes)

If time is limited, run this abbreviated checklist:

1. [ ] Dashboard loads without errors
2. [ ] Launch Training Mode → Practice 3 cards → Exit
3. [ ] Dictionary lookup finds existing character
4. [ ] Go offline → Verify offline modal appears in Training Mode
5. [ ] Restore connection → Verify modal disappears
6. [ ] Add Item button disabled when offline
7. [ ] Build completes without errors (`npm run build`)
8. [ ] No console errors during navigation

**If all 8 pass:** Build is stable for continued development
**If any fail:** Investigation required before proceeding

---

## 📝 Testing Tips

### Simulating Offline State
**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Change throttle dropdown to "Offline"

**Safari:**
1. Develop → Network Link Conditioner → 100% Loss

**Actual Network:**
1. Turn off Wi-Fi
2. Unplug ethernet cable
3. Enable Airplane Mode (mobile)

### Clearing State
- **Clear cache:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- **Clear all:** DevTools → Application → Clear Storage → Clear site data
- **Reset DB:** Re-run Supabase migrations

### Reporting Bugs
Include in bug reports:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/OS version
5. Console errors (if any)
6. Screenshots/video

---

**Document Version:** 1.0
**Last Updated:** 2025-11-04
**Next Review:** After Epic 5 completion
