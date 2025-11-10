# Roadmap — Hanzi Dojo (漢字道場)

## 🚀 V1 — Core Release
**Focus:** Foundational dojo experience.

### Included
- Core drills:  
  - **Drill A:** Zhuyin recognition (tone required).  
  - **Drill B:** Simplified → Traditional mapping.  
- Points & belt progression system powered by familiarity scoring (+1.0 / +0.5).  
- Dojo-themed UI and Sensei feedback.  
- Supabase dictionary-assisted Add Item with missing-term logging.  
- Full-screen landscape-optimized kid training mode (parent supervision, no passcode needed).  
- Offline guardrails (training paused when offline with dojo-themed modal).  
- Parent login and single-child support.  

### Goals
- Establish core loop: Train → Earn points → Rank up.  
- Validate Supabase schema, dictionary RPCs, and familiarity scoring model.  
- Ensure <250ms latency per interaction.

---

## 🔄 V1.1 — Refinement & Resilience
**Focus:** Data durability, motivation, and consistency.

### Additions
- **Bulk character upload:** CSV import with validation workflow for batch entry management.
- Automatic Supabase backups (JSON snapshot) with parent-initiated restore.
- Expand dictionary seed beyond 1,000 entries guided by `dictionary_missing`.
- **Multiple entries per character:** Allow adding same character with different pronunciations (e.g., 和 as "hé" and "huó") with visual indicators on Entry Catalog cards to distinguish them.
- Daily training streaks and badge indicators.
- Animated belt transitions and visual polish.
- Minor UX tuning (faster drill loading, smoother transitions).

### Goals
- Reduce friction for parents managing large character lists.
- Guarantee data persistence across sessions/devices.
- Reinforce positive habit-building through streaks.

### Bulk Upload Feature Design
**Rationale:** Deferred from V1 due to validation complexity. Even with CSV upload, each character requires human review for:
- Multi-pronunciation selection (着/著, 了, etc.)
- Manual Zhuyin entry when dictionary lookup fails
- Drill applicability confirmation (identical simp/trad cases)

**Planned Implementation:**
- CSV template download (columns: simplified, traditional, zhuyin, notes)
- Batch dictionary lookup with preview
- Character-by-character validation queue
- Bulk insert after approval  

---

## 🌱 V2 — Expansion: Story & Sentence Mode
**Focus:** Contextual learning and creative engagement.

### New Features
- **Story Mode:** “Scrolls of Hanzi” — short tales generated using known words.  
- **Sentence Practice:** Fill-in or match-the-word sentence tasks.  
- **Sensei Zì Mascot:** Interactive guide offering tips and encouragement.  
- **Teacher/Class Dojo Mode:** Optional multi-user cohort view (for families or classrooms).  
- **Multi-child profiles:** Parents can switch between learners easily.

### Goals
- Increase immersion and retention.  
- Connect learned characters with context and storytelling.  

---

## ⚙️ V3 — Personalization & Intelligence
**Focus:** Smart adaptation and performance analytics.

### Concepts
- Personalized word review queues (spaced repetition).  
- Adaptive difficulty (auto-skip well-known words).  
- Detailed analytics for parents (accuracy trends, focus areas).  
- Voice pronunciation check (stretch goal).  
- PWA offline installable mode.

### Goals
- Reduce repetition fatigue.  
- Introduce adaptive learning logic.  
- Deliver teacher/parent insight dashboards.

---

## 🧭 Long-Term Vision — “Path to Mastery”
**Hanzi Dojo (漢字道場)** aims to become the most engaging bilingual tool for character acquisition by blending structured repetition with joyful mastery.

### Vision Themes
- Cross-device continuity (desktop, tablet, phone).  
- Bilingual (English + Chinese + Zhuyin) UI.  
- Gamified dojo world with new ranks and environments.  
- Expand to community and co-learning spaces (“Family Dojo”).  

---

## 🪄 Guiding Principle
> *“Every stroke practiced with focus is progress made.”*  
> Hanzi Dojo is not about rote memorization — it’s about **discipline, delight, and discovery**.
