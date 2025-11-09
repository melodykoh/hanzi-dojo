# Technical & Logic Specification — Hanzi Dojo (漢字道場)

## 🧱 Architecture
- **Frontend:** React + Vite (TypeScript)
- **Backend:** Supabase (Postgres, Auth, RLS, Storage)
- **Hosting:** Vercel (frontend) + Supabase Cloud (backend)
- **Offline:** IndexedDB cache for drill state; interactive flows pause when offline
- **Backups:** Automatic Supabase Storage snapshots planned for V1.1 (no manual export in V1)

---

## 🔐 Auth & Security
- **Auth:** Email/Magic Link (Supabase Auth)
- **RLS:** All tables restricted to `auth.uid()` ownership
- **CORS:** Allow Vercel preview + production domains

---

## 🗄️ Data Model Overview
> Full SQL lives in your migration scripts; below is the definitive shape for implementation.

### Tables
- **kids**: child profiles (V1 auto-creates one per parent; schema ready for multi-child).
- **entries**: learned items (character-first; words supported when explicitly confirmed)
  - `simp text`, `trad text`, `type enum('word','char')`
  - `applicable_drills text[]` (e.g., `{'zhuyin','trad'}` when simplified ≠ traditional)
  - `locked_reading_id uuid null` (chosen for multi-reading chars)
  - `grade_label text null`, `school_week text null`
- **readings**: pronunciation metadata per entry
  - `zhuyin jsonb` (array of syllables; each syllable is `[initial, final, tone]`)
  - `pinyin text null`, `sense text null`, `audio_url text null`
- **practice_state**: per `(kid_id, entry_id, drill)` progression metrics
  - `drill practice_drill`
  - `first_try_success_count int`
  - `second_try_success_count int`
  - `consecutive_miss_count int`
  - `last_attempt_at timestamptz`, `last_success_at timestamptz`
- **practice_events**: immutable per-attempt log
  - `drill practice_drill`, `attempt_index int in (1,2)`, `is_correct bool`, `points_awarded numeric(3,1)`
  - `chosen_option jsonb`, `created_at timestamptz`
- **dictionary_entries**: canonical mappings used for auto-fill & drills
  - `simp text`, `trad text`, `zhuyin jsonb`, optional `pinyin`, `frequency_rank int`
- **dictionary_confusions**: curated distractor data per entry/drill
  - `entry_id uuid`, `drill practice_drill`, `confusions jsonb`
- **dictionary_missing**: log of parent submissions with no dictionary match
  - `simp text`, optional manual `trad`, `zhuyin`, `reported_by uuid`, `created_at timestamptz`
- **test_weeks** + **test_week_items**: optional sets for school tests

### Enums
- `entry_type`: `word` | `char`
- `practice_drill`: `zhuyin` | `trad` | (future drills extend this enum)

### Indexing (recommended)
- `entries(owner_id, created_at desc)`
- `practice_state(kid_id, entry_id, drill)`
- `practice_events(kid_id, created_at desc)`

---

## 🧮 Scoring Model (Both Drills)
| Attempt | Points | Feedback |
|---------|--------|----------|
| 1st correct | **+1.0** | “+1.0 point · first try!” |
| 2nd correct | **+0.5** | “+0.5 point · good recovery” |
| Wrong twice | **0** | “0 points · we’ll see this again” |

- Exactly **one retry** allowed; lock card after second miss.
- Session header: `Session • X/Y correct · Z pts`
- **Known rule:** computed (not stored). An entry is “known” when every applicable drill has `first_try_success_count + second_try_success_count ≥ 2` *and* `consecutive_miss_count < 2`.
- **Demotion:** when `consecutive_miss_count ≥ 2` for a drill, that drill no longer counts toward known status until two new successes are earned.

---

## 🧠 Practice Queue (per drill)
Priority ordering:
1. **Never practiced** (no `last_attempt_at`)
2. **Struggling** (`consecutive_miss_count > 0`, most recent miss first)
3. **Not known yet**, oldest `last_attempt_at`
4. **Known** items (remain in pool but lowest priority)

**Familiarity score (for alt sort in Catalog):**
```
familiarity = first_try_success_count * 1.0 + second_try_success_count * 0.5
sort_key = (is_known ? 1 : 0, consecutive_miss_count desc, familiarity asc, last_attempt_at asc nulls first)
```

---

## 🗣️ Drill A — Zhuyin Recognition (tone required)

### Data Inputs
- `entry` (word or char)
- `correctReading`: multi-syllable **Zhuyin** tokens, e.g. 媽媽 → `[[ㄇ,ㄚ,ˉ],[ㄇ,ㄚ,˙]]`
- `confusions`: curated tone/phoneme variations from `dictionary_confusions` with heuristic fallback when empty

### Option Construction
1. **Correct** option (full sequence)
2. **Tone variants**: change tone on the **last syllable** (preferred). If still short:
3. **Phoneme variants**: swap initial or final using confusion maps.
4. Ensure **4 unique** options; **shuffle**.

**Confusion Maps (examples)**
```json
CONFUSE_INITIAL = { "ㄓ":["ㄗ"], "ㄗ":["ㄓ"], "ㄐ":["ㄑ","ㄒ"], "ㄉ":["ㄊ"], "ㄌ":["ㄋ"] }
CONFUSE_FINAL   = { "ㄢ":["ㄤ"], "ㄤ":["ㄢ"], "ㄣ":["ㄥ"], "ㄥ":["ㄣ"], "ㄚ":["ㄛ"] }
TONES = ["ˉ","ˊ","ˇ","ˋ","˙"]
```

**Pseudocode**
```ts
function buildDrillAOptions(correct: string[][]) {
  const opts: string[][][] = [correct];
  const last = correct.length - 1;
  const [ini, fin, tone] = correct[last];

  for (const t of TONES) {
    if (t === tone) continue;
    const v = structuredClone(correct);
    v[last] = [ini, fin, t];
    if (!exists(opts, v)) opts.push(v);
    if (opts.length === 4) return shuffle(opts);
  }

  if (ini && CONFUSE_INITIAL[ini]) {
    for (const alt of CONFUSE_INITIAL[ini]) {
      const v = structuredClone(correct);
      v[last] = [alt, fin, tone];
      if (!exists(opts, v)) opts.push(v);
      if (opts.length === 4) return shuffle(opts);
    }
  }
  if (CONFUSE_FINAL[fin]) {
    for (const alt of CONFUSE_FINAL[fin]) {
      const v = structuredClone(correct);
      v[last] = [ini, alt, tone];
      if (!exists(opts, v)) opts.push(v);
      if (opts.length === 4) return shuffle(opts);
    }
  }

  // Multi-syllable fallback: tweak earlier tone(s)
  for (let i = 0; i < correct.length && opts.length < 4; i++) {
    if (i === last) continue;
    const [ci, cf, ct] = correct[i];
    for (const t of TONES) {
      if (t === ct) continue;
      const v = structuredClone(correct);
      v[i] = [ci, cf, t];
      if (!exists(opts, v)) opts.push(v);
      if (opts.length === 4) break;
    }
  }

  return shuffle(opts.slice(0, 4));
}
```

**Rendering**
- Each syllable is a column of vertical tokens:
```
ㄇ
ㄚ
ˉ   |  ㄇ
     ㄚ
     ˙
```

---

## 🀄 Drill B — Simplified → Traditional (word-level)

### Data Inputs
- `simpWord`: prompt shown to child
- `tradCorrect`: exact Traditional mapping for that **word**
- `confusions`: curated neighbor characters from `dictionary_confusions` (drill `trad`)

### Distractor Construction
1. Generate candidates by changing **one character** using **visual/phonetic neighbor** maps.
2. Remove the **true mapping** for `simpWord` and any duplicates.
3. Pick **3** closest plausible options; **shuffle** with correct.

**Sample maps**
```json
CONFUSE_TRAD = {
  "头": ["投","夭","矛"],
  "发": ["髮","發","灋"],
  "見": ["現","覺","規"]
}
RADICAL_NEIGHBORS = {
  "髮": ["發","髪"],
  "門": ["問","閂","閃"]
}
```

**Pseudocode**
```ts
function buildDrillBOptions(simp: string, tradCorrect: string, dict: Dict) {
  const set = new Set<string>([tradCorrect]);
  const chars = [...tradCorrect];

  for (let i=0; i<chars.length && set.size<4; i++) {
    const c = chars[i];
    for (const alt of (CONFUSE_TRAD[c] ?? [])) {
      const candidate = replace(chars, i, alt);
      if (candidate === tradCorrect) continue;
      if (dict.isTrueMapping(simp, candidate)) continue;
      set.add(candidate);
      if (set.size === 4) break;
    }
  }

  for (let i=0; i<chars.length && set.size<4; i++) {
    for (const alt of (RADICAL_NEIGHBORS[chars[i]] ?? [])) {
      const candidate = replace(chars, i, alt);
      if (candidate !== tradCorrect && !dict.isTrueMapping(simp, candidate)) {
        set.add(candidate);
        if (set.size === 4) break;
      }
    }
  }

  while (set.size < 4) {
    const fabricated = fabricateNearShape(tradCorrect);
    if (fabricated !== tradCorrect && !dict.isTrueMapping(simp, fabricated)) set.add(fabricated);
  }
  return shuffle([...set]);
}
```

---

## 🔁 State Transitions

**On tap (attempt 1):**
- correct → award +1.0 familiarity, record event, increment `first_try_success_count`, reset `consecutive_miss_count`, stamp `last_attempt_at` + `last_success_at`
- wrong → disable chosen option, increment `consecutive_miss_count`, keep retry enabled

**On tap (attempt 2):**
- correct → award +0.5 familiarity, record event, increment `second_try_success_count`, reset `consecutive_miss_count`, stamp `last_attempt_at` + `last_success_at`
- wrong → award 0, reveal correct, record event, increment `consecutive_miss_count`

**Cleanup job (optional)**
- Nightly job can archive old `practice_events` or recompute familiarity summaries if needed; no day-based known reset required.

---

## 🧪 Telemetry & Logging
- `practice_events` stores every attempt with awarded points and chosen options
- `dictionary_missing` captures parent submissions that lacked canonical data so the seed list can be expanded later
- Client error logs (endpoint, code, message, entity id) → simple `errors` table (optional)

---

## 🔧 Environment Variables
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 🗃️ Backups (V1.1)
- On add/delete/finish-session → upload JSON snapshot to `user_backups/{user_id}/backup_<timestamp>.json`
- Keep last N (5–10) snapshots per user
- Manual restore: parent selects snapshot → upsert into tables

---

## ✅ Acceptance Criteria (Engineering)
- Drill option generators always return **4 unique, curated options**
- Scoring logic matches +1/+0.5/0 with **visible toasts** and updates familiarity totals
- Session header shows **X/Y correct** and **Z pts**
- Known status is computed dynamically from practice_state counters and reflects demotions after two consecutive misses
- Catalog alt sort **Least familiar** uses the updated familiarity formula
- RLS enforced for every table, including dictionary metadata
