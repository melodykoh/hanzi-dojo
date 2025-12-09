# Changelog

All notable updates to Hanzi Dojo are documented here in simple, non-technical language.

---

## December 9, 2025 - Session 19

### 🐛 Bug Fixes
- **Correct Meanings for Multi-Pronunciation Characters**: Fixed 160 characters where all pronunciations incorrectly showed the same meaning. Now each pronunciation displays its distinct definition:
  - 长 cháng: "long, length" vs zhǎng: "to grow, chief"
  - 好 hǎo: "good, well" vs hào: "to like, be fond of"
  - 少 shǎo: "few, little" vs shào: "young"
  - And 157 more characters with correct pronunciation-specific meanings!
- **Grammatical Particles**: Added meanings for 着 (zhe/zhuó/zháo/zhāo) and 了 (le/liǎo) which were previously blank

---

## December 8, 2025 - Session 18

### ✨ Comprehensive Multi-Pronunciation Coverage
- **162 Characters Enhanced**: Added context words and alternate pronunciations for characters that were missing them
- **94 New Multi-Pronunciation Characters**: Characters like 长 (cháng "long" / zhǎng "to grow"), 少 (shǎo "few" / shào "young"), and 好 (hǎo "good" / hào "to like") now have complete pronunciation data
- **68 Context Word Updates**: Filled in example words for characters already marked as multi-pronunciation but missing context, like 禁 (jìn "forbid" / jīn "to restrain oneself"), 散 (sàn "to scatter" / sǎn "loose"), and 咖 (kā "coffee" / gā "curry")
- **Taiwan MOE Cross-Reference**: Used official Taiwan Ministry of Education polyphone list to ensure comprehensive coverage

### 🎨 Improvements
- **Better Drill A Options**: With complete pronunciation data, Drill A now correctly excludes valid alternate readings from wrong answer choices across all 162 characters

---

## December 6, 2025 - Session 17

### 🐛 Bug Fixes
- **Character 处 (chǔ/chù)**: Fixed Drill A incorrectly marking the 4th tone as wrong. Both pronunciations now accepted:
  - chǔ (3rd tone): "to deal with, get along" as in 相处, 处理
  - chù (4th tone): "place, location" as in 办事处, 好处, 到处

---

## November 22, 2025 - Sessions 15-16

### ✨ New Features
- **136 Multi-Pronunciation Characters**: Characters with multiple valid pronunciations now show all readings with example words. Includes common characters like:
  - 行 (xíng "to walk" / háng "row, profession")
  - 重 (zhòng "heavy" / chóng "again")
  - 还 (hái "still" / huán "to return")
  - 为 (wèi "for" / wéi "to be")
  - And 132 more!

### 🎨 Improvements
- **Smarter Drill A**: When practicing characters with multiple pronunciations, alternate valid readings won't appear as wrong answer choices
- **Faster Loading**: Character catalog now loads 30-40% faster

### 🐛 Bug Fixes
- **Input Validation**: App no longer crashes when encountering malformed pronunciation data

---

## November 15, 2025 - Session 14

### ✨ New Features
- **Feedback Tab**: New tab where you can report bugs, request features, or ask questions
  - Available to everyone (even demo mode users!)
  - Three quick action buttons for bug reports, feature ideas, and general feedback
  - Your email auto-fills if you're signed in (optional for demo users)
  - We read every submission and respond within 48 hours for critical bugs

---

## November 14, 2025 - Session 12

### ✨ New Features
- **Ninjago Elemental Theme**: New design with Fire, Lightning, Energy, and Gold colors
- **Spinjitzu Animations**: Success feedback now spins 720° with golden shimmer when you nail a character on first try

### 🎨 Improvements
- **Faster Practice**: Removed artificial 300ms delay between questions (saves 6 seconds per 20-question session!)
- **Mobile Polish**: Practice cards now fill the full width on mobile devices
- **Training Mode Header**: Split into 2 rows on mobile so buttons don't overlap
- **Better Buttons**: Details and Delete buttons in character catalog are easier to tap on mobile

### 🐛 Bug Fixes
- **Critical**: New user signup now automatically creates student profile (fixes "No student profile found" error)
- **Gold Banner**: Success animations now spin correctly when earning 1.0 familiarity points
- **Performance**: Dashboard metrics now calculate much faster with optimized code

---

## November 12, 2025 - Sessions 10-11

### ✨ New Features
- **Multi-Pronunciation Characters**: Characters like 了 (le/liǎo) and 着 (zhe/zhuó) now show all pronunciations with example words
- **Dictionary Expansion**: Added 35 new characters with proper pronunciations

### 🎨 Improvements
- **Mobile Header**: Fixed button wrapping on narrow phone screens
- **Zhuyin Display**: First-tone marker (ˉ) no longer shows (matches Taiwan textbook style)

### 🐛 Bug Fixes
- **Pronunciation Modal**: Fixed missing default pronunciation option when viewing character details
- **Character Entry**: Fixed issue preventing character '干' from being added

---

## November 10, 2025 - Session 8

### ✨ New Features
- **Practice Demo Tab**: Test drills with mock data without affecting your child's real progress
- **Dictionary Lookup Tab**: Check if characters are in our database before adding them

### 🎨 Improvements
- **Entry Catalog Refresh**: Character list now updates immediately after adding new characters
- **Auth Persistence**: You stay logged in even after closing your browser

### 🐛 Bug Fixes
- **Entry Catalog**: Fixed refresh bug when adding new characters
- **Authentication**: Session now persists across browser restarts
- **Practice Demo**: Fixed Zhuyin layout issues in portrait mode
- **Dictionary UI**: Fixed button cutoff on mobile devices
- **Practice Demo**: Now uses mock data correctly (doesn't write to production database)

---

## November 9, 2025 - Sessions 5-7

### 🎉 Major Milestone: V1 Production Launch
Hanzi Dojo is now live at https://hanzi-dojo.vercel.app!

### ✨ Core Features
- **Drill A (Zhuyin Recognition)**: See a character, pick the correct Zhuyin pronunciation
- **Drill B (Simplified → Traditional)**: See simplified character, pick the traditional form
- **Familiarity Scoring**: Earn +1.0 points for first-try success, +0.5 for second-try
- **Belt Progression**: Advance through White → Yellow → Orange → Green belts as you learn
- **Entry Management**: Add characters from your child's curriculum
- **Progress Tracking**: See weekly familiarity gains, accuracy rates, and known character counts

### 📚 Dictionary
- **1,067 Characters**: HSK 1-4 coverage with Zhuyin, Pinyin, Traditional forms
- **86% Data Quality**: Properly structured with pronunciation variants where needed
- **Auto-Lookup**: Type a character and see Zhuyin/Traditional forms automatically

### 🎨 User Experience
- **Full-Screen Training Mode**: Landscape-optimized for tablets with simple "Exit Training" button
- **Parent Dashboard**: Metrics, character management, practice demo, dictionary lookup
- **Email Authentication**: Sign up with email, multi-user ready
- **Mobile Responsive**: Works on phones, tablets, and desktops

---

## What's Next?

We're continuously improving Hanzi Dojo based on your feedback! Upcoming features:

- **Dictionary Expansion**: Adding more multi-pronunciation characters and context words
- **UI Cleanup**: Unifying the design theme across all parts of the app
- **Words & Word Drills**: Introducing the concept of words and word-related drills

Have ideas or found a bug? Use the Feedback tab to let us know!

---

*Hanzi Dojo is a free, open-source project maintained by parents for parents teaching Chinese to bilingual kids.*
