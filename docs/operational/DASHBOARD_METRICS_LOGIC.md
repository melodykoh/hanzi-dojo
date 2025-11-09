# Dashboard Metrics Calculation Logic

**Created:** 2025-11-05  
**Purpose:** Document exact calculation logic for all Dashboard stats to enable QA verification

---

## 📊 Drill Balance Widget (DrillBalanceWidget.tsx)

### Data Source: `drillBalanceService.ts`

#### **Queue Depth**
```sql
-- Count entries that support this drill
SELECT COUNT(*) FROM entries
WHERE kid_id = $kidId
  AND applicable_drills @> ARRAY[$drill]
```

#### **Average Accuracy**
```sql
-- Get last 10 FIRST-TRY attempts for this drill
SELECT is_correct FROM practice_events
WHERE kid_id = $kidId
  AND drill = $drill
  AND attempt_index = 1  -- First try only
ORDER BY created_at DESC
LIMIT 10
```

**Formula:**
```
avgAccuracy = (# correct in last 10 first tries / 10) × 100
```

**Returns:** `null` if no attempts yet, otherwise percentage (0-100)

**Example:**
- Last 10 first tries: 8 correct, 2 wrong
- avgAccuracy = 80%

#### **Struggling Count**
```sql
-- Count entries with 2+ consecutive misses
SELECT COUNT(*) FROM practice_state
WHERE kid_id = $kidId
  AND drill = $drill
  AND consecutive_miss_count >= 2
```

#### **Needs Attention Flag**
Set by recommendation logic (not direct calculation)

---

## 📈 Dashboard Metrics (DashboardMetrics.tsx)

### Data Sources:
- `practice_state` table (scoring counters)
- `entries` table (total count, applicable drills)
- `practice_events` table (7-day sparkline)

### **1. All-Time Familiarity**

**Query:**
```sql
SELECT * FROM practice_state WHERE kid_id = $kidId
```

**Formula:**
```typescript
allTimeFamiliarity = Σ (
  first_try_success_count × 1.0 +
  second_try_success_count × 0.5
)
```

**Example:**
- Entry 1 Drill A: 3 first-try + 2 second-try = 3×1.0 + 2×0.5 = 4.0
- Entry 1 Drill B: 2 first-try + 1 second-try = 2×1.0 + 1×0.5 = 2.5
- Entry 2 Drill A: 5 first-try + 0 second-try = 5×1.0 + 0×0.5 = 5.0
- **Total:** 4.0 + 2.5 + 5.0 = **11.5 points**

---

### **2. Weekly Familiarity**

**Query:**
```sql
SELECT * FROM practice_state
WHERE kid_id = $kidId
  AND last_attempt_at >= NOW() - INTERVAL '7 days'
```

**Formula:**
```typescript
weeklyFamiliarity = Σ (
  first_try_success_count × 1.0 +
  second_try_success_count × 0.5
)
// Only for states where last_attempt_at is within 7 days
```

**⚠️ POTENTIAL BUG:** This counts **ALL** successes for entries practiced in last 7 days, not just successes that occurred in last 7 days.

**Example (potentially wrong):**
- Entry practiced 2 days ago with 10 historic first-try successes
- Shows 10 points in weekly familiarity (even if 8 were from months ago)

**Correct approach would be:**
```sql
SELECT SUM(points_awarded) FROM practice_events
WHERE kid_id = $kidId
  AND created_at >= NOW() - INTERVAL '7 days'
```

---

### **3. Accuracy Percentage**

**Formula:**
```typescript
totalAttempts = Σ (
  first_try_success_count +
  second_try_success_count +
  consecutive_miss_count  // Current miss streak only
)

correctAttempts = Σ (
  first_try_success_count +
  second_try_success_count
)

accuracy = (correctAttempts / totalAttempts) × 100
```

**⚠️ POTENTIAL BUG:** `consecutive_miss_count` only represents current miss streak, not total misses.

**Example (potentially wrong):**
- Entry has: 8 first-try, 2 second-try, 1 consecutive_miss
- Calculated attempts = 8 + 2 + 1 = 11
- But actual attempts could be 15+ if miss streak was reset by a success

**Missing data:** Total miss count not tracked in schema.

**Current behavior:** Accuracy appears **higher** than reality because historical misses aren't counted.

---

### **4. Known Count**

**Logic:**
```typescript
For each entry:
  Get all practice_state records for this entry
  
  For each applicable_drill:
    Check if state exists for this drill
    
    Known criteria:
      - totalSuccesses >= 2 (first_try + second_try)
      - AND consecutive_miss_count < 2
    
  If ALL applicable drills meet criteria:
    knownCount++
```

**Example:**
- Entry has `applicable_drills = ['zhuyin', 'trad']`
- Drill A state: 3 first-try, 1 second-try, 0 misses → **Known** ✓
- Drill B state: 1 first-try, 1 second-try, 3 misses → **Not known** ✗
- Entry **not counted** as known (needs both drills)

---

### **5. Practice Count**

**Formula:**
```typescript
practiceCount = Σ (
  first_try_success_count +
  second_try_success_count +
  consecutive_miss_count
)
```

**⚠️ SAME BUG as Accuracy:** Only counts current miss streak, not historical misses.

---

### **6. Last 7 Days Sparkline**

**Query:**
```sql
SELECT created_at, points_awarded FROM practice_events
WHERE kid_id = $kidId
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at ASC
```

**Formula:**
```typescript
For each of last 7 days:
  familiarity = Σ points_awarded where DATE(created_at) = date
```

**This one is CORRECT** - uses practice_events, not practice_state.

---

## 🐛 Identified Issues

### **Issue 1: Weekly Familiarity Calculation**
**Current:** Sums ALL familiarity for entries practiced in last 7 days (including historical)  
**Should be:** Sum points_awarded from practice_events in last 7 days  
**Impact:** Weekly metric inflated if old entries are re-practiced

### **Issue 2: Accuracy & Practice Count**
**Current:** Only counts current consecutive_miss_count  
**Should track:** Total miss count separately in practice_state  
**Impact:** Accuracy appears higher than actual (missing historical misses)

### **Issue 3: Drill Balance Accuracy Uses Different Logic**
**Drill Balance:** Last 10 first-try attempts from practice_events (✓ correct)  
**Dashboard Accuracy:** Calculated from practice_state counters (⚠️ incomplete)  
**Impact:** Two different accuracy numbers for same drill

---

## 🔧 Recommended Fixes (Epic 6 Task 6.4)

### Dashboard Redesign - Simplify to 4 Actionable Metrics

**User feedback (DM-2 testing):** Current metrics are confusing and not actionable. Redesign for clarity and motivation.

**New 4-tile layout:**
1. **All-Time Points** - Keep current (correct)
2. **Last Practiced** - "X days ago" (replaces weekly familiarity + sparkline)
3. **Accuracy Streak** - "X sessions improving 🔥" + "Y sessions perfect 💯" (replaces single accuracy %)
4. **Characters Mastered** - "X of Y mastered" (add context)

### Fix 1: Remove Weekly Familiarity & Sparkline
**Rationale:** Not actionable. Parents care more about "when did we last practice?" than cumulative weekly points.

### Fix 2: Add Session-Level Accuracy Tracking
**Requirements:**
- Group practice_events by session (continuous practice within 2-hour window)
- Calculate first-try accuracy per session
- Track two streaks:
  - **Improving streak:** Session N accuracy > Session N-1
  - **Perfect streak:** Consecutive sessions with 100% accuracy
- Show both streaks for motivation: "3 sessions improving 🔥, 2 sessions perfect 💯"

### Fix 3: Unify Accuracy Definition to First-Try Only
**Current inconsistency:**
- Drill Balance Widget: First-try only (correct ✓)
- Dashboard Accuracy: All attempts (inconsistent ✗)

**Fix:** Use first-try only everywhere for consistency.

---

## ✅ QA Verification Steps

1. **Drill Balance Accuracy:**
   - Practice a character 10 times (first try)
   - Note how many correct
   - Check Dashboard widget shows matching %

2. **Weekly Familiarity:**
   - Note current weekly value
   - Practice 5 items successfully (should add 5.0 points)
   - Refresh and verify increase
   - **Expected bug:** May show inflated value if practicing old entries

3. **Known Count:**
   - Add new character
   - Practice Drill A twice successfully → Should count as known
   - Add character with both drills → Both need 2+ successes to count

4. **Accuracy:**
   - Calculate manually: (first_try + second_try) / total_attempts
   - Compare with Dashboard
   - **Expected bug:** Dashboard may show higher % (missing historical misses)
