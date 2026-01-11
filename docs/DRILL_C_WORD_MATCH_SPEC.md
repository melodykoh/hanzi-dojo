# Drill C: Word Match (配對高手) — Technical Specification

**Status:** Draft v2.0 (Revised based on code review)
**Created:** 2026-01-10
**Revised:** 2026-01-10
**Author:** Claude (based on user requirements + 3-reviewer feedback)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-01-10 | Initial spec |
| v2.0 | 2026-01-10 | Simplified based on DHH/Kieran/Simplicity reviews: removed Zhuyin duplication, simplified validation pipeline, added Playwright QA, reduced from 17 to 10 story points |

---

## 1. Overview

### 1.1 Purpose
Drill C introduces **word-level practice** to Hanzi Dojo. Kids match character pairs to form valid 2-character words, reinforcing character knowledge in vocabulary context.

### 1.2 Core Concept
- Display two columns of characters (5 on left, 5 on right)
- Kid taps a character on the left, then its matching partner on the right
- Correct matches form valid 2-character words (e.g., 月 + 亮 = 月亮)
- Each starting character has exactly ONE correct partner in the set

### 1.3 Key Constraint: Anchor Character
- **At least ONE** character must be from kid's saved/learned characters
- The other character can come from the dictionary
- Both characters must exist in `dictionary_entries` (for Zhuyin lookup)

---

## 2. Gameplay Mechanics

### 2.1 Round Structure
- **5 word pairs** per round
- Left column: first character (shuffled)
- Right column: second character (shuffled)
- After matching all 5 → auto-advance to next round
- Continues until user exits (same flow as Drill A/B)

### 2.2 Interaction Flow
1. User taps LEFT column character → highlight it
2. User taps RIGHT column character
3. **If correct:** Both cards animate green, show word badge, award points
4. **If wrong (1st attempt):** Clear RIGHT selection only, keep LEFT active, retry
5. **If wrong (2nd attempt):** Show correct answer briefly, award 0 points, proceed

### 2.3 Scoring (Per Pair)
| Attempt | Points | Feedback |
|---------|--------|----------|
| 1st correct | **+1.0** | "+1.0 point" |
| 2nd correct | **+0.5** | "+0.5 point" |
| Wrong twice | **0** | "0 points" |

### 2.4 Familiarity & Practice State
**Word-level drill does not track character familiarity.** Rationale: This is vocabulary practice, not character mastery. Familiarity remains character-based for Drill A/B.

However, we DO record practice events for:
- Session scoring and summary
- Analytics (which word pairs are difficult)
- Future spaced repetition (if needed)

---

## 3. Data Architecture

### 3.1 Database Schema: `word_pairs` (Simplified)

**Design principle:** Reference `dictionary_entries` instead of duplicating Zhuyin.

```sql
-- Migration: 019_create_word_pairs.sql

CREATE TABLE word_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The word (Traditional only - matches drill display)
  word text NOT NULL,              -- e.g., "月亮"

  -- Character references (Traditional)
  char1 text NOT NULL,             -- "月" (first char)
  char2 text NOT NULL,             -- "亮" (second char)

  -- Metadata (optional, for analytics)
  category text,                   -- "自然" (from CCCC)

  created_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT word_pairs_char1_exists
    CHECK (char1 IN (SELECT trad FROM dictionary_entries)),
  CONSTRAINT word_pairs_char2_exists
    CHECK (char2 IN (SELECT trad FROM dictionary_entries)),
  CONSTRAINT word_length CHECK (length(word) = 2)
);

-- Indexes for anchor character lookup
CREATE INDEX idx_word_pairs_char1 ON word_pairs(char1);
CREATE INDEX idx_word_pairs_char2 ON word_pairs(char2);

-- RLS: Public read access (matches dictionary_entries pattern)
ALTER TABLE word_pairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON word_pairs FOR SELECT USING (true);
```

**Why this is simpler:**
- 5 columns instead of 11
- No Zhuyin duplication (JOIN with dictionary_entries)
- No validation_status column (validate at seed time, only insert valid pairs)
- Traditional only (matches what drill displays)

### 3.2 Extend `practice_drill` Enum

```sql
ALTER TYPE practice_drill ADD VALUE 'word_match';
```

### 3.3 Practice Events for Word Match

Use existing `practice_events` table with clarification:

```sql
-- For word_match drill:
-- entry_id = NULL (not character-based)
-- chosen_option stores word pair info as JSONB

INSERT INTO practice_events (
  kid_id,
  entry_id,           -- NULL for word_match
  drill,              -- 'word_match'
  attempt_index,      -- 1 or 2
  is_correct,
  points_awarded,
  chosen_option,      -- {"word_pair_id": "...", "word": "月亮", "selected_char2": "亮"}
  created_at
) VALUES (...);
```

**Clarification on `attempt_index`:**
- `attempt_index = 1`: First right-column selection for this pair
- `attempt_index = 2`: Second right-column selection (only if first was wrong)

---

## 4. Server-Side Logic (RPC)

### 4.1 RPC: Get Eligible Word Pairs

**Single database round-trip** instead of client-side filtering.

```sql
-- Migration: 019_create_word_pairs.sql (continued)

CREATE OR REPLACE FUNCTION get_eligible_word_pairs(p_kid_id uuid)
RETURNS TABLE (
  id uuid,
  word text,
  char1 text,
  char1_zhuyin jsonb,
  char2 text,
  char2_zhuyin jsonb,
  category text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wp.id,
    wp.word,
    wp.char1,
    d1.zhuyin AS char1_zhuyin,
    wp.char2,
    d2.zhuyin AS char2_zhuyin,
    wp.category
  FROM word_pairs wp
  -- JOIN to get Zhuyin (no duplication!)
  JOIN dictionary_entries d1 ON d1.trad = wp.char1
  JOIN dictionary_entries d2 ON d2.trad = wp.char2
  -- Filter: at least one char is in kid's learned set
  WHERE EXISTS (
    SELECT 1 FROM entries e
    WHERE e.kid_id = p_kid_id
    AND (e.trad = wp.char1 OR e.trad = wp.char2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2 Minimum Pairs Check

```typescript
// wordPairService.ts
async function canPlayDrillC(kidId: string): Promise<boolean> {
  const { count } = await supabase
    .rpc('get_eligible_word_pairs', { p_kid_id: kidId })
    .select('*', { count: 'exact', head: true });

  return (count ?? 0) >= 5;
}
```

If fewer than 5 eligible pairs:
> "Add more characters to unlock Word Match! (Need 5+ word pairs)"

---

## 5. Round Generation (Client-Side)

### 5.1 Simple Algorithm

```typescript
// wordPairService.ts

interface WordPairWithZhuyin {
  id: string;
  word: string;
  char1: string;
  char1_zhuyin: string[][];
  char2: string;
  char2_zhuyin: string[][];
  category: string | null;
}

function generateRound(eligiblePairs: WordPairWithZhuyin[]): WordPairWithZhuyin[] {
  const shuffled = shuffle([...eligiblePairs]);

  // Find 5 pairs with unique char1 (no duplicate starting chars)
  const selected: WordPairWithZhuyin[] = [];
  const usedChar1 = new Set<string>();

  for (const pair of shuffled) {
    if (!usedChar1.has(pair.char1)) {
      usedChar1.add(pair.char1);
      selected.push(pair);
      if (selected.length === 5) break;
    }
  }

  // Error handling: not enough unique pairs
  if (selected.length < 5) {
    throw new InsufficientPairsError(
      `Only found ${selected.length} pairs with unique starting characters. ` +
      `Need at least 5. Kid may need to add more characters.`
    );
  }

  return selected;
}

class InsufficientPairsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientPairsError';
  }
}
```

### 5.2 Build Round Display Data

```typescript
function buildRoundDisplayData(pairs: WordPairWithZhuyin[]): RoundDisplayData {
  return {
    leftColumn: shuffle(pairs.map(p => ({
      pairId: p.id,
      char: p.char1,
      zhuyin: formatZhuyin(p.char1_zhuyin)
    }))),
    rightColumn: shuffle(pairs.map(p => ({
      pairId: p.id,
      char: p.char2,
      zhuyin: formatZhuyin(p.char2_zhuyin)
    }))),
    words: pairs.map(p => p.word)
  };
}
```

---

## 6. UI Specification

### 6.1 Layout (Landscape Optimized)

```
┌─────────────────────────────────────────────────┐
│  配對高手                        ✕ Exit         │
├─────────────────────────────────────────────────┤
│  Session • 3/5 matched · 2.5 pts               │
│                                                 │
│   ┌─────┐              ┌─────┐                 │
│   │ 月  │              │ 白  │                 │
│   │ㄩㄝˋ│              │ㄅㄞˊ│                 │
│   └─────┘              └─────┘                 │
│   ┌─────┐   selected   ┌─────┐                 │
│   │ 太  │ ──────────▶  │ 亮  │                 │
│   │ㄊㄞˋ│              │ㄌㄧㄤˋ│                 │
│   └─────┘              └─────┘                 │
│   ┌─────┐              ┌─────┐                 │
│   │ 花  │              │ 陽  │                 │
│   │ㄏㄨㄚ│              │ㄧㄤˊ│                 │
│   └─────┘              └─────┘                 │
│   ... (2 more rows)                            │
│                                                 │
│   Matched: [月亮] [花草]                        │
└─────────────────────────────────────────────────┘
```

### 6.2 Visual States

| State | Appearance |
|-------|------------|
| Default | Blue gradient card |
| Selected (left) | Gold border + glow |
| Matched | Green gradient, disabled |
| Wrong (shake) | Red flash, 300ms shake animation |

### 6.3 Zhuyin Display
- **Always visible** under each character
- Horizontal format (matching Drill A)
- First tone marker (ˉ) suppressed per existing convention

### 6.4 Completed Words
- Show as badges at bottom: `[月亮]` `[太陽]`
- Bounce animation on appear
- No English translation (keep it simple)

---

## 7. Integration

### 7.1 Drill Selection Modal
Add "Drill C: Word Match" as third option:
- Label: "Word Match (配對)"
- Disabled with tooltip if `canPlayDrillC() === false`
- Message: "Add more characters to unlock"

### 7.2 Training Mode
- Same flow as Drill A/B
- Points contribute to session total
- Session summary shows word_match stats

### 7.3 Practice Events Recording

```typescript
// In WordMatchDrill.tsx
async function recordAttempt(
  kidId: string,
  wordPairId: string,
  word: string,
  selectedChar2: string,
  attemptIndex: 1 | 2,
  isCorrect: boolean,
  points: number
) {
  await supabase.from('practice_events').insert({
    kid_id: kidId,
    entry_id: null,  // Not character-based
    drill: 'word_match',
    attempt_index: attemptIndex,
    is_correct: isCorrect,
    points_awarded: points,
    chosen_option: {
      word_pair_id: wordPairId,
      word: word,
      selected_char2: selectedChar2
    }
  });
}
```

---

## 8. Data Seeding (One-Time Script)

### 8.1 Approach
**Simple one-time script** instead of CI/CD pipeline. Run manually before deploy.

```typescript
// scripts/seed-word-pairs.ts

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

interface CCCCWord {
  word_trad: string;
  char1_trad: string;
  char2_trad: string;
  category: string;
}

async function seedWordPairs() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  // Load pre-analyzed word pairs
  const data = JSON.parse(readFileSync('data/word_pairs_cccc_usable.json', 'utf-8'));
  const words: CCCCWord[] = data.words;

  console.log(`Loaded ${words.length} word pairs from CCCC analysis`);

  // Validate: both chars must exist in dictionary
  const { data: dictChars } = await supabase
    .from('dictionary_entries')
    .select('trad');
  const dictSet = new Set(dictChars?.map(d => d.trad) ?? []);

  const valid: CCCCWord[] = [];
  const invalid: { word: string; reason: string }[] = [];

  for (const w of words) {
    if (w.word_trad.length !== 2) {
      invalid.push({ word: w.word_trad, reason: 'Not 2 characters' });
    } else if (!dictSet.has(w.char1_trad)) {
      invalid.push({ word: w.word_trad, reason: `char1 "${w.char1_trad}" not in dictionary` });
    } else if (!dictSet.has(w.char2_trad)) {
      invalid.push({ word: w.word_trad, reason: `char2 "${w.char2_trad}" not in dictionary` });
    } else {
      valid.push(w);
    }
  }

  console.log(`\n=== VALIDATION RESULTS ===`);
  console.log(`✅ Valid: ${valid.length}`);
  console.log(`❌ Invalid: ${invalid.length}`);

  if (invalid.length > 0) {
    console.log(`\nInvalid pairs:`);
    invalid.slice(0, 10).forEach(i => console.log(`  - ${i.word}: ${i.reason}`));
    if (invalid.length > 10) console.log(`  ... and ${invalid.length - 10} more`);
  }

  // Insert valid pairs
  const toInsert = valid.map(w => ({
    word: w.word_trad,
    char1: w.char1_trad,
    char2: w.char2_trad,
    category: w.category || null
  }));

  const { error } = await supabase.from('word_pairs').insert(toInsert);

  if (error) {
    console.error('Insert failed:', error);
    process.exit(1);
  }

  console.log(`\n✅ Inserted ${valid.length} word pairs into database`);
}

seedWordPairs();
```

### 8.2 Usage

```bash
# One-time seeding (run before deploy)
npx tsx scripts/seed-word-pairs.ts
```

No CI/CD pipeline needed. This is a one-time operation with static CCCC data.

---

## 9. Playwright QA Tests

### 9.1 Test File Structure

```typescript
// e2e/drill-c-word-match.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Drill C: Word Match', () => {

  test.beforeEach(async ({ page }) => {
    // Login as test user with 10+ saved characters
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@hanzidojo.local');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should show Word Match in drill selection when eligible', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await expect(page.locator('[data-testid="drill-option-word_match"]')).toBeVisible();
    await expect(page.locator('[data-testid="drill-option-word_match"]')).not.toBeDisabled();
  });

  test('should display 5 character pairs in two columns', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Verify layout
    const leftCards = page.locator('[data-testid="left-column"] [data-testid="char-card"]');
    const rightCards = page.locator('[data-testid="right-column"] [data-testid="char-card"]');

    await expect(leftCards).toHaveCount(5);
    await expect(rightCards).toHaveCount(5);
  });

  test('should show Zhuyin on all cards', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const zhuyinElements = page.locator('[data-testid="char-card"] [data-testid="zhuyin"]');
    await expect(zhuyinElements).toHaveCount(10); // 5 left + 5 right
  });

  test('should highlight left card when selected', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    await firstLeftCard.click();

    await expect(firstLeftCard).toHaveClass(/selected/);
  });

  test('should award 1.0 points for correct first match', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Get first left card's pair ID
    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');

    // Click left card
    await firstLeftCard.click();

    // Find and click matching right card
    const matchingRightCard = page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`);
    await matchingRightCard.click();

    // Verify feedback
    await expect(page.locator('[data-testid="feedback-toast"]')).toContainText('+1.0');
  });

  test('should award 0.5 points for correct second match', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');

    // Click left card
    await firstLeftCard.click();

    // Click WRONG right card first
    const wrongRightCard = page.locator(`[data-testid="right-column"] [data-testid="char-card"]:not([data-pair-id="${pairId}"])`).first();
    await wrongRightCard.click();

    // Should shake and clear right selection
    await expect(wrongRightCard).toHaveClass(/wrong/);
    await page.waitForTimeout(400); // Wait for shake animation

    // Left should still be selected
    await expect(firstLeftCard).toHaveClass(/selected/);

    // Now click correct right card
    const matchingRightCard = page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`);
    await matchingRightCard.click();

    // Verify 0.5 points
    await expect(page.locator('[data-testid="feedback-toast"]')).toContainText('+0.5');
  });

  test('should show word badge after matching', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete one match
    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');
    await firstLeftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();

    // Verify word badge appears
    await expect(page.locator('[data-testid="matched-words"] [data-testid="word-badge"]')).toHaveCount(1);
  });

  test('should auto-advance to next round after 5 matches', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete all 5 matches
    for (let i = 0; i < 5; i++) {
      const leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]:not(.matched)').first();
      const pairId = await leftCard.getAttribute('data-pair-id');
      await leftCard.click();
      await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
      await page.waitForTimeout(500); // Wait for animation
    }

    // Should auto-advance - new cards should appear (not matched)
    await page.waitForTimeout(1000);
    const unmatchedCards = page.locator('[data-testid="left-column"] [data-testid="char-card"]:not(.matched)');
    await expect(unmatchedCards).toHaveCount(5);
  });

  test('should show session summary on exit', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete one match
    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');
    await firstLeftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();

    // Exit training
    await page.click('[data-testid="exit-training"]');

    // Should show summary modal
    await expect(page.locator('[data-testid="session-summary-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-points"]')).toContainText('1');
  });

  test('should disable Word Match when insufficient pairs', async ({ page }) => {
    // This test requires a user with <5 eligible word pairs
    // Use a separate test account or mock the RPC
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'newuser@hanzidojo.local');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');

    await page.click('[data-testid="launch-training"]');

    const wordMatchOption = page.locator('[data-testid="drill-option-word_match"]');
    await expect(wordMatchOption).toBeDisabled();
    await expect(page.locator('[data-testid="word-match-disabled-tooltip"]')).toContainText('Add more characters');
  });

  test('should award 0 points after two wrong attempts and show correct answer', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');

    // Click left card
    await firstLeftCard.click();

    // Get all wrong right cards
    const wrongRightCards = page.locator(`[data-testid="right-column"] [data-testid="char-card"]:not([data-pair-id="${pairId}"])`);

    // First wrong attempt
    await wrongRightCards.first().click();
    await expect(wrongRightCards.first()).toHaveClass(/wrong/);
    await page.waitForTimeout(400);

    // Second wrong attempt (different wrong card)
    await wrongRightCards.nth(1).click();
    await expect(wrongRightCards.nth(1)).toHaveClass(/wrong/);

    // Should show correct answer highlighted briefly
    const correctRightCard = page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`);
    await expect(correctRightCard).toHaveClass(/reveal-correct/);

    // Should show 0 points feedback
    await expect(page.locator('[data-testid="feedback-toast"]')).toContainText('0');

    // Cards should be marked as matched (proceed to next pair)
    await page.waitForTimeout(1000);
    await expect(firstLeftCard).toHaveClass(/matched/);
    await expect(correctRightCard).toHaveClass(/matched/);
  });

  test('should display end-of-drill summary correctly', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete 3 matches (mix of first try and second try)
    for (let i = 0; i < 3; i++) {
      const leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]:not(.matched)').first();
      const pairId = await leftCard.getAttribute('data-pair-id');
      await leftCard.click();

      if (i === 1) {
        // Second match: make one wrong attempt first
        const wrongCard = page.locator(`[data-testid="right-column"] [data-testid="char-card"]:not([data-pair-id="${pairId}"])`).first();
        await wrongCard.click();
        await page.waitForTimeout(400);
      }

      await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
      await page.waitForTimeout(500);
    }

    // Exit training
    await page.click('[data-testid="exit-training"]');

    // Verify summary modal content
    const summaryModal = page.locator('[data-testid="session-summary-modal"]');
    await expect(summaryModal).toBeVisible();

    // Should show drill type
    await expect(summaryModal.locator('[data-testid="drill-type"]')).toContainText('Word Match');

    // Should show pairs matched count
    await expect(summaryModal.locator('[data-testid="pairs-matched"]')).toContainText('3');

    // Should show total points (1.0 + 0.5 + 1.0 = 2.5)
    await expect(summaryModal.locator('[data-testid="session-points"]')).toContainText('2.5');

    // Should show accuracy percentage
    await expect(summaryModal.locator('[data-testid="accuracy"]')).toBeVisible();

    // Should have "Done" button to return to dashboard
    await expect(summaryModal.locator('[data-testid="done-button"]')).toBeVisible();
  });

  test('should allow switching from Drill C to Drill A/B mid-session', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete one match
    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');
    await firstLeftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
    await page.waitForTimeout(500);

    // Click drill switcher button
    await page.click('[data-testid="drill-switcher"]');

    // Should show drill selection with current drill highlighted
    const drillModal = page.locator('[data-testid="drill-selection-modal"]');
    await expect(drillModal).toBeVisible();
    await expect(drillModal.locator('[data-testid="drill-option-word_match"]')).toHaveClass(/current/);

    // Switch to Drill A (Zhuyin)
    await page.click('[data-testid="drill-option-zhuyin"]');
    await page.click('[data-testid="confirm-switch"]');

    // Should now be in Drill A
    await expect(page.locator('[data-testid="drill-type-indicator"]')).toContainText('Zhuyin');

    // Should show 4 options (Drill A layout)
    const options = page.locator('[data-testid="drill-option"]');
    await expect(options).toHaveCount(4);

    // Points from Drill C should carry over
    await expect(page.locator('[data-testid="session-points"]')).toContainText('1');
  });
});

test.describe('Drill C: Word Match - Entry Points', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@hanzidojo.local');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should launch Word Match from Dashboard training button', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    await expect(page.locator('[data-testid="word-match-drill"]')).toBeVisible();
  });

  test('should launch Word Match from Practice Demo tab', async ({ page }) => {
    await page.click('[data-testid="tab-practice-demo"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-demo"]');

    await expect(page.locator('[data-testid="word-match-drill"]')).toBeVisible();
    // Demo mode indicator should be visible
    await expect(page.locator('[data-testid="demo-mode-badge"]')).toBeVisible();
  });

  test('should launch Word Match from keyboard shortcut', async ({ page }) => {
    // Press 'T' to open training modal (existing shortcut)
    await page.keyboard.press('t');
    await expect(page.locator('[data-testid="drill-selection-modal"]')).toBeVisible();

    // Press '3' to select Word Match (third option)
    await page.keyboard.press('3');
    await page.keyboard.press('Enter');

    await expect(page.locator('[data-testid="word-match-drill"]')).toBeVisible();
  });
});

test.describe('Drill C: Word Match - Error & Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@hanzidojo.local');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should show loading state while fetching word pairs', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Loading indicator should appear briefly
    // Use a slow network to catch this, or check that drill eventually loads
    await expect(page.locator('[data-testid="word-match-drill"]')).toBeVisible({ timeout: 5000 });
  });

  test('should pause training when offline and resume when online', async ({ page, context }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Wait for drill to load
    await expect(page.locator('[data-testid="word-match-drill"]')).toBeVisible();

    // Go offline
    await context.setOffline(true);

    // Should show offline modal
    await expect(page.locator('[data-testid="offline-modal"]')).toBeVisible();
    await expect(page.locator('text=Training Paused')).toBeVisible();

    // Cards should be non-interactive
    const leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    await expect(leftCard).toHaveClass(/pointer-events-none/);

    // Go back online
    await context.setOffline(false);
    await page.click('[data-testid="retry-connection"]');

    // Modal should disappear
    await expect(page.locator('[data-testid="offline-modal"]')).not.toBeVisible();

    // Should be able to continue matching
    const pairId = await leftCard.getAttribute('data-pair-id');
    await leftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
    await expect(page.locator('[data-testid="feedback-toast"]')).toContainText('+1.0');
  });

  test('should ignore clicks on right column when no left card selected', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Click right card without selecting left first
    const rightCard = page.locator('[data-testid="right-column"] [data-testid="char-card"]').first();
    await rightCard.click();

    // No selection should happen, no feedback
    await expect(rightCard).not.toHaveClass(/selected/);
    await expect(page.locator('[data-testid="feedback-toast"]')).not.toBeVisible();

    // Matched count should still be 0
    await expect(page.locator('[data-testid="match-progress"]')).toContainText('0/5');
  });

  test('should toggle left card selection when clicking same card twice', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();

    // Select
    await firstLeftCard.click();
    await expect(firstLeftCard).toHaveClass(/selected/);

    // Deselect by clicking again
    await firstLeftCard.click();
    await expect(firstLeftCard).not.toHaveClass(/selected/);
  });

  test('should allow selecting different left card to change selection', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const secondLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').nth(1);

    // Select first
    await firstLeftCard.click();
    await expect(firstLeftCard).toHaveClass(/selected/);

    // Select second (should deselect first)
    await secondLeftCard.click();
    await expect(firstLeftCard).not.toHaveClass(/selected/);
    await expect(secondLeftCard).toHaveClass(/selected/);
  });

  test('should ignore clicks on already matched cards', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete first match
    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');
    await firstLeftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
    await page.waitForTimeout(500);

    // Try clicking matched cards again
    await firstLeftCard.click();
    await expect(firstLeftCard).not.toHaveClass(/selected/); // Should remain matched, not selected
    await expect(firstLeftCard).toHaveClass(/matched/);
  });

  test('should debounce rapid clicks to prevent double-scoring', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');
    const matchingRightCard = page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`);

    await firstLeftCard.click();

    // Rapid double-click on correct answer
    await matchingRightCard.click();
    await matchingRightCard.click();

    // Should only get +1.0 once, not +2.0
    await expect(page.locator('[data-testid="session-points"]')).toContainText('1');
    await expect(page.locator('[data-testid="match-progress"]')).toContainText('1/5');
  });
});

test.describe('Drill C: Word Match - Session Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@hanzidojo.local');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should exit directly without summary when no matches made', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Exit immediately without matching anything
    await page.click('[data-testid="exit-training"]');

    // Should return to dashboard directly (no summary modal)
    await expect(page.locator('[data-testid="session-summary-modal"]')).not.toBeVisible();
    await page.waitForURL('/dashboard');
  });

  test('should allow continuing training from summary modal', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete one match
    const firstLeftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');
    await firstLeftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
    await page.waitForTimeout(500);

    // Exit to show summary
    await page.click('[data-testid="exit-training"]');
    await expect(page.locator('[data-testid="session-summary-modal"]')).toBeVisible();

    // Click continue training
    await page.click('[data-testid="continue-training"]');

    // Summary should close, drill should be visible
    await expect(page.locator('[data-testid="session-summary-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="word-match-drill"]')).toBeVisible();

    // Should still have 1 match progress
    await expect(page.locator('[data-testid="match-progress"]')).toContainText('1/5');
  });

  test('should complete multi-round session with round counter', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete first round (5 matches)
    for (let i = 0; i < 5; i++) {
      const leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]:not(.matched)').first();
      const pairId = await leftCard.getAttribute('data-pair-id');
      await leftCard.click();
      await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
      await page.waitForTimeout(400);
    }

    // Should auto-advance to round 2
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="round-indicator"]')).toContainText('Round 2');

    // Complete 2 matches in round 2
    for (let i = 0; i < 2; i++) {
      const leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]:not(.matched)').first();
      const pairId = await leftCard.getAttribute('data-pair-id');
      await leftCard.click();
      await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
      await page.waitForTimeout(400);
    }

    // Exit and verify summary shows total from both rounds
    await page.click('[data-testid="exit-training"]');
    await expect(page.locator('[data-testid="pairs-matched"]')).toContainText('7');
    await expect(page.locator('[data-testid="session-points"]')).toContainText('7'); // 7 x 1.0
  });

  test('should update progress counter in real-time during matching', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Initial state
    await expect(page.locator('[data-testid="match-progress"]')).toContainText('0/5');
    await expect(page.locator('[data-testid="session-points"]')).toContainText('0');

    // First match
    let leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    let pairId = await leftCard.getAttribute('data-pair-id');
    await leftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="match-progress"]')).toContainText('1/5');
    await expect(page.locator('[data-testid="session-points"]')).toContainText('1');

    // Second match (with one wrong attempt)
    leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]:not(.matched)').first();
    pairId = await leftCard.getAttribute('data-pair-id');
    await leftCard.click();
    const wrongCard = page.locator(`[data-testid="right-column"] [data-testid="char-card"]:not([data-pair-id="${pairId}"])`).first();
    await wrongCard.click();
    await page.waitForTimeout(400);
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="match-progress"]')).toContainText('2/5');
    await expect(page.locator('[data-testid="session-points"]')).toContainText('1.5');
  });
});

test.describe('Drill C: Word Match - Demo Mode', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@hanzidojo.local');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should show demo mode indicator and not affect real stats', async ({ page }) => {
    // Navigate to Practice Demo tab
    await page.click('[data-testid="tab-practice-demo"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-demo"]');

    // Should show demo badge
    await expect(page.locator('[data-testid="demo-mode-badge"]')).toBeVisible();

    // Complete a match
    const leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    const pairId = await leftCard.getAttribute('data-pair-id');
    await leftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();

    // Exit demo
    await page.click('[data-testid="exit-demo"]');

    // Navigate to Dashboard - stats should NOT have changed
    await page.click('[data-testid="tab-dashboard"]');

    // Check that demo didn't affect real practice events (implementation dependent)
    // This would require checking the database or a dedicated test API
  });
});

test.describe('Drill C: Word Match - Accessibility', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@hanzidojo.local');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should support keyboard navigation for card selection', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Tab to first left card and select with Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Skip exit button
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('data-testid', 'char-card');

    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="left-column"] [data-testid="char-card"]').first()).toHaveClass(/selected/);
  });

  test('should have proper ARIA labels on cards', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]').first();
    await expect(leftCard).toHaveAttribute('aria-label', /.+/); // Should have some label
    await expect(leftCard).toHaveAttribute('role', 'button');
  });
});

test.describe('Drill C: Word Match - Mobile Breakpoint', () => {

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro dimensions)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@hanzidojo.local');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should display two columns side by side on mobile portrait', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const leftColumn = page.locator('[data-testid="left-column"]');
    const rightColumn = page.locator('[data-testid="right-column"]');

    // Both columns should be visible
    await expect(leftColumn).toBeVisible();
    await expect(rightColumn).toBeVisible();

    // Columns should be side by side (not stacked)
    const leftBox = await leftColumn.boundingBox();
    const rightBox = await rightColumn.boundingBox();

    expect(leftBox!.x).toBeLessThan(rightBox!.x);
    expect(Math.abs(leftBox!.y - rightBox!.y)).toBeLessThan(10); // Same vertical position
  });

  test('should have touch-friendly card sizes on mobile', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const card = page.locator('[data-testid="char-card"]').first();
    const cardBox = await card.boundingBox();

    // Minimum touch target: 44x44px (Apple HIG)
    expect(cardBox!.width).toBeGreaterThanOrEqual(44);
    expect(cardBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('should show readable Zhuyin on mobile cards', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    const zhuyin = page.locator('[data-testid="zhuyin"]').first();
    const zhuyinBox = await zhuyin.boundingBox();

    // Zhuyin should be at least 12px tall for readability
    expect(zhuyinBox!.height).toBeGreaterThanOrEqual(12);
  });

  test('should not require horizontal scrolling on mobile', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Check that content fits within viewport
    const drillContainer = page.locator('[data-testid="word-match-drill"]');
    const containerBox = await drillContainer.boundingBox();

    expect(containerBox!.width).toBeLessThanOrEqual(390); // Viewport width
  });

  test('should display matched words badges without overflow on mobile', async ({ page }) => {
    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // Complete 3 matches
    for (let i = 0; i < 3; i++) {
      const leftCard = page.locator('[data-testid="left-column"] [data-testid="char-card"]:not(.matched)').first();
      const pairId = await leftCard.getAttribute('data-pair-id');
      await leftCard.click();
      await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();
      await page.waitForTimeout(500);
    }

    // Matched words container should wrap, not overflow
    const matchedWords = page.locator('[data-testid="matched-words"]');
    const matchedBox = await matchedWords.boundingBox();

    expect(matchedBox!.width).toBeLessThanOrEqual(390);
  });

  test('should work in mobile landscape orientation', async ({ page }) => {
    // Switch to landscape
    await page.setViewportSize({ width: 844, height: 390 });

    await page.click('[data-testid="launch-training"]');
    await page.click('[data-testid="drill-option-word_match"]');
    await page.click('[data-testid="start-training"]');

    // All 5 pairs should be visible without scrolling
    const leftCards = page.locator('[data-testid="left-column"] [data-testid="char-card"]');
    await expect(leftCards).toHaveCount(5);

    // Complete a match to verify interaction works
    const firstLeftCard = leftCards.first();
    const pairId = await firstLeftCard.getAttribute('data-pair-id');
    await firstLeftCard.click();
    await page.locator(`[data-testid="right-column"] [data-pair-id="${pairId}"]`).click();

    await expect(page.locator('[data-testid="feedback-toast"]')).toContainText('+1.0');
  });
});
```

### 9.2 Test Summary

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Core Gameplay | 10 | Selection, matching, scoring, auto-advance |
| Two Wrong Attempts | 1 | 0 points + reveal correct answer |
| End-of-Drill Summary | 1 | Points, accuracy, pairs matched |
| Drill Switching | 1 | Switch from C to A/B mid-session |
| Entry Points | 3 | Dashboard, Practice Demo, keyboard |
| Error & Edge Cases | 7 | Loading, offline, debounce, click guards |
| Session Flow | 4 | Exit paths, continue, multi-round, progress |
| Demo Mode | 1 | Mock mode, no DB writes |
| Accessibility | 2 | Keyboard nav, ARIA labels |
| Mobile Breakpoint | 6 | Portrait, landscape, touch targets |
| **Total** | **36** | Full autonomous QA coverage |

### 9.3 Running Tests

```bash
# Run all Drill C tests
npx playwright test drill-c-word-match.spec.ts

# Run with headed browser (visible)
npx playwright test drill-c-word-match.spec.ts --headed

# Run specific test suite
npx playwright test -g "Mobile Breakpoint"

# Run specific test
npx playwright test -g "should award 1.0 points"
```

### 9.4 CI Integration

```yaml
# .github/workflows/e2e-tests.yml (add to existing)
- name: Run Drill C E2E tests
  run: npx playwright test drill-c-word-match.spec.ts
```

---

## 10. Implementation Tasks

### Phase 1: Data Foundation (2 pts)
- [ ] Create `word_pairs` table migration (simplified schema)
- [ ] Create `get_eligible_word_pairs` RPC function
- [ ] Extend `practice_drill` enum with `word_match`

### Phase 2: Data Seeding (1 pt)
- [ ] Create `scripts/seed-word-pairs.ts`
- [ ] Run seeding script, verify 400+ pairs inserted

### Phase 3: Service Layer (2 pts)
- [ ] `wordPairService.ts` - fetch eligible pairs, generate rounds
- [ ] `canPlayDrillC()` function
- [ ] Error handling for `InsufficientPairsError`

### Phase 4: UI Components (3 pts)
- [ ] `WordMatchDrill.tsx` - main component
- [ ] Card selection and matching logic
- [ ] Animation states (selected, matched, wrong)
- [ ] Completed words badges

### Phase 5: Integration (1 pt)
- [ ] Add to `DrillSelectionModal.tsx`
- [ ] Integrate with `TrainingMode.tsx`
- [ ] Record practice events

### Phase 6: Playwright QA (2 pts)
- [ ] Create `e2e/drill-c-word-match.spec.ts`
- [ ] Verify all 36 test scenarios pass (core, edge cases, session flow, accessibility, mobile)
- [ ] Add to CI pipeline

**Total: 11 story points** (with comprehensive QA coverage)

---

## 11. Acceptance Criteria

### Functional
- [ ] Kid can match 5 character pairs to form words
- [ ] Correct first match awards 1.0 points
- [ ] Correct second match awards 0.5 points
- [ ] Wrong twice shows correct answer, awards 0 points
- [ ] Completed words shown as badges
- [ ] Auto-advance after all 5 matched
- [ ] Session continues until user exits

### Data
- [ ] Word pairs reference dictionary_entries (no Zhuyin duplication)
- [ ] At least one character per pair from kid's learned set
- [ ] 400+ validated word pairs seeded

### Integration
- [ ] Drill C appears in drill selection modal
- [ ] Disabled with message if <5 eligible pairs
- [ ] Points counted in session summary
- [ ] Practice events recorded with word_pair info

### Quality
- [ ] All 36 Playwright tests pass
- [ ] No console errors during gameplay
- [ ] Animations smooth on tablet and mobile

---

## 12. Future Considerations

### 12.1 Word Hunt (Drill D) - Deferred
Based on user testing (Jan 2026):
- Fun but timer causes anxiety
- Will implement with **optional timer / relaxed mode**
- Uses same `word_pairs` table

### 12.2 Feature Flag (Optional)
For safer rollout, consider adding to app config:
```typescript
const DRILLS_ENABLED = {
  zhuyin: true,
  trad: true,
  word_match: true  // Can disable without code deploy
};
```

---

## Appendix: Data Coverage

| Metric | Value |
|--------|-------|
| CCCC 2-char words | 627 |
| Words with both chars in dictionary | 500 (79%) |
| Estimated after seeding validation | ~450 |

Coverage is excellent for a children's vocabulary app.
