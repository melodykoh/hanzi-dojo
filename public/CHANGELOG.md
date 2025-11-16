# Changelog

All notable updates to Hanzi Dojo are documented here in simple, non-technical language.

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

## January 8, 2025 - Sessions 5-7

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

- **User Feedback System**: Report bugs and request features directly in the app
- **Rolling Changelog**: See what's new when you log in
- **Dictionary Completion**: Filling in remaining 139 characters with proper pronunciations

Have ideas or found a bug? We'd love to hear from you!

---

*Hanzi Dojo is a free, open-source project maintained by parents for parents teaching Chinese to bilingual kids.*
