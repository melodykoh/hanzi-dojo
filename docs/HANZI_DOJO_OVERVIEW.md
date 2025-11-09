# Hanzi Dojo (漢字道場) — Overview & Product Definition

## 🎯 Purpose
**Hanzi Dojo (漢字道場)** is a modern Mandarin learning companion that turns every practice session into dojo-style training for character mastery.  
It is designed to help children and parents build consistent progress, recognize Simplified and Traditional forms, and strengthen pronunciation using Zhuyin.

---

## 🧭 Objectives
1. Track Simplified and Traditional words/characters the child has learned.  
2. Reinforce pronunciation accuracy using Zhuyin with tones.  
3. Build recognition of corresponding Traditional characters for Simplified forms.  
4. Motivate with visible progress and belt-based ranks.  
5. Encourage steady, disciplined practice like a real dojo.

---

## 👨‍👩‍👧 Target Users
- **Parent:** Adds new words, monitors progress, motivates practice.  
- **Child:** Engages in drills (training) and earns points and belts.

---

## 🧱 Core Features (V1)
| Feature | Description |
|----------|--------------|
| **Drill A** | Character-first Zhuyin recognition (tone required); 4 curated options. |
| **Drill B** | Simplified → Traditional mapping when applicable; 4 curated options. |
| **Familiarity Scoring** | Weighted progress: +1.0 first try, +0.5 second try; drives belts and dashboards. |
| **Known Status** | Computed dynamically when every applicable drill reaches 2 successes and <2 consecutive misses. |
| **Belt Progression** | White → Yellow → Green → Blue → Red → Black based on cumulative familiarity (no downgrades). |
| **Catalog (Dojo Wall)** | Displays character mastery, familiarity score, and review priority. |
| **Dashboard** | Parent view of weekly points, accuracy, belt status, recent performance. |
| **Training Mode** | Full-screen landscape-optimized kid experience launched from parent console; simple exit button returns to dashboard. |
| **Add Item** | Supabase dictionary-assisted auto-fill with manual override and missing-term logging. |
| **Data Sync** | Supabase cloud source with IndexedDB caching; offline usage gated with guardrails. |

---

## 🪄 Out of Scope (for V1)
- Story or sentence generation.  
- Audio pronunciation playback.  
- Multi-child profiles (planned for V2).  
- Teacher or class-level sharing.  
- Manual JSON export (superseded by V1.1 automatic backups).

---

## 🧩 Success Metrics
- Smooth interaction and drill flow (fast response < 250ms).  
- Data persists reliably between devices.  
- Children maintain engagement through belt progression.  
- Parents can see measurable weekly progress.

---

## 🏗️ Philosophy
> “The dojo is not a game; it’s a place of practice.”  
> Hanzi Dojo’s structure builds a learning habit. The system rewards *focus and accuracy* over guessing.  
Each belt signifies a deeper level of understanding, and each word learned is a lantern lit on the path to mastery.
