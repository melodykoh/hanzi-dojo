# Design & UI Guide — Hanzi Dojo (漢字道場)

## 🎨 Visual Identity
| Element | Specification |
|----------|----------------|
| **Primary Palette** | Dojo Red `#C6362A`, Gold `#EFC94C`, Ink Black `#1C1C1C`, Rice White `#E9E6D5` |
| **Typography** | English: Noto Sans SC; Chinese: Noto Serif TC |
| **Texture** | Light rice-paper or parchment background |
| **Icons** | Brush, Belt, Bamboo, Lantern |
| **Mascot** | “Sensei Zì” – a friendly panda or fox in a simple gi holding a calligraphy brush as a sword |

The design aesthetic blends the warmth of traditional East Asian brush art with the simplicity of modern educational apps. The goal is calm focus — no overstimulation, just clarity, progression, and beauty.

---

## 🧱 Layout Philosophy
- Keep screens **minimal**, with ample breathing space.  
- Avoid clutter — each screen focuses on one task (train, review, track).  
- Colors reinforce hierarchy (Dojo Red for progress, Gold for achievements).  
- Use **soft transitions** and **brushstroke dividers** for character.  
- Parent console favors vertical layouts; kid training mode targets **horizontal orientation** with oversized touch surfaces.

---

## 🧍 Parent & Kid Modes

- **Parent Console:** Authenticated dashboard with stats, Add Item, and settings. "Start Training" button launches full-screen kid mode.
- **Training Mode:** Full-screen landscape-optimized experience designed for tablets/phones; simple "Exit Training" button returns to dashboard (parent supervision assumed, no passcode needed).
- **Offline Guardrail:** If connectivity drops, display a parchment modal (“Sensei waits for the connection”) and pause training/Add Item flows until the network returns.

---

## 🖥️ Key Screens

### 1️⃣ Training Hall (Practice)
- Header: `Session • X/Y correct · Z pts · [Belt icon]` with familiarity gain callout.
- Central card: defaults to single-character prompt; multi-character words appear only after parent confirmation.
- Options (4): Zhuyin (horizontal layout) or Traditional characters using curated confusion sets.
- Feedback toast: Sensei comments (e.g., “Perfect form!”, “Focus your tone.”).
- Buttons: **Next**, **Exit Training** (returns to dashboard, parent supervision assumed).
- Summary modal: familiarity earned, belt progress bar, gentle review suggestions.

### 2️⃣ Catalog (Dojo Wall)
- **Layout:** Full-screen landscape-optimized for tablets; extra-large touch targets.
- Two-column: Simplified | Traditional.  
- Icons: ⭐ Known / 🔁 Needs Review.  
- Sort by: Newest / Least familiar.  
- Optional filters: grade, week.

### 3️⃣ Dashboard
- Tiles: Known count (dynamic rule), weekly familiarity points, all-time familiarity, belt rank.  
- Accuracy rate treats first- and second-try successes as correct; include a 7-day sparkline of familiarity gains.  
- Belt badge displayed prominently with color transition animation.

### 4️⃣ Add Item
- Primary input accepts Simplified or Traditional. When multiple characters are entered, prompt whether to treat as a word or split.
- Auto-fill counterpart and Zhuyin via Supabase dictionary; show dropdown when multiple readings exist.
- Offer manual fields when no dictionary match is found and log the missing entry for future seeding.
- Optional fields: grade_label, school_week.

### 5️⃣ Auth
- Parent login (magic link).  
- Clean, single-view form.

---

## 🏅 Belt System (Gamification)

| Belt | Color | Points | Sensei Message |
|------|--------|---------|----------------|
| White | ⚪ | 0–25 pts | “Welcome to the dojo.” |
| Yellow | 🟡 | 26–75 pts | “You’ve begun your journey.” |
| Green | 🟢 | 76–150 pts | “Your forms are improving.” |
| Blue | 🔵 | 151–300 pts | “You move with confidence.” |
| Red | 🔴 | 301–500 pts | “Your strokes are strong.” |
| Black | ⚫ | 501+ pts | “You are now a Hanzi Master.” |

Belts are visible in the top-right header during practice, on the dashboard, and at the end of each session.  
They motivate deliberate practice — the child learns that accuracy and focus, not speed, advance progress.

---

## 💬 Microcopy Guidelines
- Replace generic terms like “Start” → “Begin Training.”  
- Positive reinforcement: “Excellent focus.”, “The Sensei nods in approval.”  
- Avoid punitive language; emphasize progress, not failure.  
- Encourage retry with grace: “Every stroke can be improved.”

---

## 🪶 Accessibility & Localization
- English interface with optional bilingual labels (Chinese + Zhuyin).  
- Font contrast: black or dark gray text on light parchment background.  
- Interactive elements large enough for small fingers (mobile-optimized).  
- Simple transitions to avoid motion fatigue.

---

## 🧭 Navigation Summary
Top navigation: **Training | Dojo Wall | Dashboard | Add Word | Parent Login**  
Mobile bottom nav mirrors these with icons.

---

## ✨ UI Components Overview
| Component | Description |
|------------|-------------|
| **DrillCard** | Central practice component. |
| **FeedbackToast** | Animated reward/feedback component. |
| **BeltBadge** | Displays current belt color & name. |
| **StatTile** | Used in Dashboard for metrics. |
| **WordListItem** | Entry for Catalog list. |
| **AddItemModal** | Character-first input with dictionary auto-fill and manual fallback. |
| **OfflineGuard** | Overlay that pauses interactive flows when the network is unavailable. |

---

Hanzi Dojo’s UI is designed to feel **like a place of calm concentration** — every interaction a brushstroke toward mastery.
