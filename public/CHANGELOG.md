# Changelog

All notable updates to Hanzi Dojo are documented here in simple, non-technical language.

---

## January 18, 2026 - Session 26

### 🐛 Bug Fix: Training and Drill C Restored
- **Fixed critical bug**: Training modal was showing "No items available" even when you had characters to practice
  - This was caused by a database error introduced in yesterday's update
  - All three drills (A, B, and C) are now working again
- **Drill C back on dashboard**: Word Match is now visible again in the Drill Proficiency Overview

### 🐛 Bug Fix: Word Pairs Now Appear for Multi-Pronunciation Characters
- **Fixed missing word pairs**: Word pairs like 到處, 因為, 什麼, 怎麼 were not appearing in Drill C for characters with locked pronunciations
  - This was caused by a data mismatch: some saved pronunciation data used simplified Chinese (处, 为, 么) while word pairs use traditional (處, 為, 麼)
  - All 12 affected words have been converted to traditional Chinese
- **Characters fixed**: 處, 著, 為, 什, 麼, 並 now correctly show their word pairs in Drill C

---

## January 17, 2026 - Session 25

### 🎮 Improvement: Easier Word Match for Young Learners
- **Starting characters are now familiar**: Word Match (Drill C) now only shows word pairs where the first character (left column) is one you've already learned
  - Previously, word pairs could appear if you knew either character, which meant seeing unfamiliar characters on the left
  - Now you'll always recognize the starting character, making it easier to figure out the word
- **Less frustration**: Young learners can focus on learning the second character in context, rather than being confused by unknown starting characters

---

## January 12, 2026 - Session 24

### ✨ Enhancement: Smarter Word Pairs for Multi-Pronunciation Characters
- **Pronunciation-aware filtering**: Drill C now only shows word pairs that match the pronunciation you selected when adding a character
  - Example: If you saved 著 with the "zhe" pronunciation (as in 看著 "looking at"), you'll only see word pairs using that pronunciation
  - Previously, you might see 著名 (famous, uses "zhù") even though you're learning the particle form
- **Better learning experience**: Children won't be confused by words using pronunciations they haven't learned yet

### 🔧 Technical
- Added authorization check to word pairs API for improved security
- Fixed duplicate word pairs issue in database

---

## January 12, 2026 - Session 23

### ✨ New Feature: Drill C (Word Match)
- **New Practice Drill!** Match character pairs to form 2-character Chinese words
  - Left column shows first characters, right column shows second characters
  - Tap one character, then tap its pair to form a word (e.g., 太 + 陽 = 太陽)
  - Same scoring as other drills: +1.0 first try, +0.5 second try, 0 for two wrong guesses
  - Zhuyin (pronunciation) shown under each character to help sound out unfamiliar ones
- **Available when ready**: Drill C appears in selection modal when you have at least 5 eligible word pairs
- **Visual feedback**: Matched pairs turn green with connecting lines (on tablet/desktop)

### 🎨 Improvements
- **Drill Proficiency for Drill C**: Dashboard widget now shows accuracy stats for all three drills
- **Drill Selection Modal**: Drill C now displays accuracy percentage and item count (matching Drills A & B)
- **Consistent Design**: Drill C uses the same Ninjago design system as other drills (white cards, green energy theme, badge indicator)

### 🐛 Bug Fixes
- **Mobile Display**: Fixed connecting lines that were rendering incorrectly on phones (hidden on mobile, visible on tablets)
- **Drill Switching**: Fixed brief "No practice items" flash when switching between drills mid-session
- **Card Colors**: Fixed cards to show white/gray by default, green only after successful match

### 📚 Documentation
- Added comprehensive QA checklist for drill features based on session learnings
- Added Chinese language feature requirements checklist to catch multi-pronunciation and matching logic issues earlier

---

## January 7, 2026 - Session 22

### ✨ New Features
- **Drill Proficiency Widget**: New dashboard section showing accuracy and struggling characters per drill
  - Toggle between "Last Week" and "Last 60 Days" to see recent vs. long-term accuracy trends
  - Click on struggling count to see which specific characters need more practice
  - Drill-specific layouts: Drill A shows Zhuyin prominently, Drill B shows Traditional prominently

### 🎨 Improvements
- **Faster Widget Loading**: Drill proficiency data loads 3x faster with parallel database queries
- **Smarter Dictionary Lookups**: Batch lookups now use a single request instead of 50 separate calls
- **Clearer Labels**: "Currently struggling" text clarifies that struggling count reflects present state (not filtered by timeframe)

### 🐛 Bug Fixes
- **Timezone Consistency**: Accuracy calculations now use UTC consistently, fixing off-by-one day errors for users in different timezones
- **Error Handling**: Widget and modal now display helpful error messages instead of showing stale data when API calls fail

---

## January 6, 2026 - Session 21

### 🐛 Bug Fix
- **Drill A Mobile Layout**: Fixed accidental page refresh on iPhone when practicing. Previously, the 4 Zhuyin options were stacked vertically on mobile, requiring scrolling that triggered iOS Safari's pull-to-refresh gesture. Now options display in a 2×2 grid (matching Drill B), so everything fits on screen without scrolling.

---

## December 12, 2025 - Session 20

### 🎨 Design System Unification
- **Consistent Typography**: All section headers now use the Bungee font (Ninjago theme) across the entire app. Dashboard metrics, Practice Demo, My Characters, Dictionary, and Missing tabs all share the same visual style
- **Fire Theme Login**: Sign-in screen now matches the app's fire gradient theme with improved focus states (blue highlight on form inputs)
- **Button Consistency**: Standardized button styles throughout:
  - Fire buttons (red) for primary actions like Delete, End Training, Exit
  - Lightning buttons (blue) for secondary actions like Dictionary Lookup
  - Gray utility buttons for Reset and Toggle controls
- **Unified Backgrounds**: Training mode and auth screens use the same dynamic fire gradient
- **Design System Documentation**: Created internal style guide for maintaining visual consistency in future updates

---

## December 9, 2025 - Session 19

### 🐛 Bug Fixes
- **Correct Meanings for Multi-Pronunciation Characters**: Fixed 160 characters where all pronunciations incorrectly showed the same meaning. Now each pronunciation displays its distinct definition:
  - 长 cháng: "long, length" vs zhǎng: "to grow, chief"
  - 好 hǎo: "good, well" vs hào: "to like, be fond of"
  - 少 shǎo: "few, little" vs shào: "young"
  - And 157 more characters with correct pronunciation-specific meanings!
- **Grammatical Particles**: Added meanings for 着 (zhe/zhuó/zháo/zhāo) and 了 (le/liǎo) which were previously blank
- **Consistent Traditional Context Words**: Unified all 73 characters with mixed simplified/traditional example words to use Traditional Chinese consistently (為了, 沒有, 還是, etc.)

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
