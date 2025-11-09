# Requirements Specification — Hanzi Dojo (漢字道場)

**Status:** Confirmed with user on 2025-11-03  
**Last Updated:** 2025-11-03

---

## 📋 User Workflow (Parent & Child)

### Weekly Routine
1. **Newsletter Input (Weekly)**
   - Teacher shares ~10 characters per week via newsletter
   - Parent reviews list and adds characters to app
   
2. **Homework Supervision (Weekly)**
   - Child receives worksheets with characters + 1-2 word phrases per character
   - Parent supervises writing practice
   - Parent inputs any new characters/words from homework into app
   
3. **Weekend Practice Sessions (Sat/Sun)**
   - Child uses app for interactive drill practice
   - Parent monitors progress via dashboard
   
4. **Storybook Reading (Ad-hoc)**
   - Family reads Traditional Chinese books at home
   - Parent spots common/useful characters
   - Parent adds them to app even if not officially taught at school yet

### Learning Unit Philosophy
- **Primary unit:** Individual characters
- **Context exposure:** 1-2 word phrases that use the character
- **Mixed sources:** School curriculum (Simplified) + home reading (Traditional)

---

## 🎯 User Stories

### Parent Stories
1. **As a parent**, I want to quickly input 10 characters from the weekly newsletter so I can set up weekend practice in under 5 minutes.
2. **As a parent**, I want the app to auto-fill Traditional/Zhuyin mappings so I don't have to look them up manually.
3. **As a parent**, I want to be prompted when a character has multiple pronunciations so I can select the correct one for the context my child is learning.
4. **As a parent**, I want to add characters I spot in storybooks (Traditional form) even if they're not in the school curriculum yet.
5. **As a parent**, I want to see weekly progress (familiarity gains, accuracy, belt advancement) so I can celebrate achievements with my child.
6. **As a parent**, I want to ensure no duplicate characters are added accidentally.
7. **As a parent**, I want confidence that mid-session progress is saved automatically so nothing is lost if the device closes.

### Child Stories
1. **As a child**, I want to practice on weekends (Sat/Sun) when I have free time.
2. **As a child**, I want to see my belt rank go up when I practice correctly so I feel motivated.
3. **As a child**, I want the app to respond quickly (<250ms) so I don't get frustrated waiting.
4. **As a child**, I want clear feedback (Sensei comments) when I get answers right or wrong.

---

## ✅ Success Metrics

### Primary (Must-Have)
- ✅ **Drill latency:** Interactions respond within <250ms
- ✅ **Familiarity scoring:** Updates correctly (+1.0 first try, +0.5 second try)
- ✅ **Data persistence:** Mid-session progress auto-saves to Supabase
- ✅ **Duplicate prevention:** System blocks duplicate entries for same kid + character

### Secondary (Important)
- ✅ **Weekly visibility:** Dashboard shows familiarity gains over past 7 days
- ✅ **Belt progression:** Moves forward without regression
- ✅ **Dictionary hit rate:** Auto-fill success improves over time as seed expands
- ✅ **Offline guard:** Blocks training/Add Item when network unavailable

### Quality Thresholds
- ✅ **No orphaned entries:** Every entry backed by dictionary OR manual override with logging
- ✅ **4 unique drill options:** All drill questions show 4 distinct, plausible answers with correct answer always present
- ✅ **Context-aware pronunciation:** Multi-reading characters handled via word-level context selection

---

## 🚨 Known Failure Modes & Mitigations

| Failure Mode | Mitigation Strategy |
|--------------|---------------------|
| **Duplicate entries** | Pre-add validation checks `(kid_id, simp, trad)` uniqueness; show warning modal if match found |
| **Correct answer missing from drill options** | Validate option builder: assert correct answer in final shuffled array before rendering |
| **Mid-session data lost** | Auto-save practice_state and practice_events after every attempt (not just on "End Training") |
| **Dictionary lookup fails** | Prompt manual entry with clear guidance; log to `dictionary_missing` for future seeding |
| **Network drops mid-practice** | Detect offline state; pause training with dojo-themed modal until connection restored |
| **Wrong tone marked correct** | Strict Zhuyin matching including tone markers (ˉˊˇˋ˙) |
| **Child exits training accidentally** | Full-screen training mode with clear "Exit Training" button; parent supervision assumed |

---

## 🎲 Edge Cases & Handling

### 1. Characters with Identical Simplified/Traditional Forms
**Examples:** 太, 黑, 前, 光, 亮

**Handling:**
- ✅ Allow entry with `simp === trad`
- ✅ Automatically exclude from Drill B (`applicable_drills = ['zhuyin']` only)
- ✅ Show UI indicator: "This character is the same in both forms"

### 2. Characters with Multiple Pronunciations
**Examples:** 着/著 (zhe/zháo/zhuó), 发/發 (fā/fà), 了 (le/liǎo)

**Handling:**
- ✅ Dictionary RPC returns **all readings** as array
- ✅ UI prompts: "Select pronunciation context" with example words
  - 着急 (zháo jí) - worried
  - 睡着 (shuì zháo) - asleep
  - 着手 (zhuó shǒu) - start doing
  - 跟着 (gēn zhe) - follow
- ✅ Store selected `locked_reading_id` in `entries` table
- ✅ Manual override available if dictionary incomplete

### 3. Context-Dependent Pronunciation Selection
**Requirement:** Some characters only have determinable pronunciation when added as multi-character words

**Handling:**
- ✅ When parent enters multi-character sequence (e.g., "着急"), prompt: "Treat as word or split into characters?"
- ✅ If "word": lookup word-level pronunciation, store as single entry with `type='word'`
- ✅ If "split": process each character individually with separate pronunciation prompts
- ✅ Word-level entries participate in drills as complete units

### 4. Mixed Simplified/Traditional Entry
**Scenario:** Parent reads Traditional books but child learns Simplified at school

**Handling:**
- ✅ Accept either Simplified OR Traditional as primary input
- ✅ Auto-fill counterpart from dictionary
- ✅ If counterpart missing, prompt manual entry
- ✅ Store both forms in `entries` table regardless of input method

### 5. Characters Not in Dictionary Seed
**Scenario:** Parent adds rare/advanced character not in initial 500-character seed

**Handling:**
- ✅ Show "Not found in dictionary" message with confidence indicator
- ✅ Provide manual entry fields: Traditional, Zhuyin (with tone picker)
- ✅ Log to `dictionary_missing` with parent `auth.uid()` and timestamp
- ✅ Manual entries fully functional in drills (no degraded experience)
- ✅ Admin periodically reviews `dictionary_missing` to expand seed

---

## 🔧 Automatic Disqualifiers & Rules

### Entry Validation Rules
| Rule | Action |
|------|--------|
| Character already exists for this kid + drill | ❌ Block with "Already added" warning |
| Zhuyin missing after dictionary lookup + manual skip | ❌ Block with "Zhuyin required for Drill A" |
| Traditional missing after dictionary lookup + manual skip | ⚠️ Allow but exclude from Drill B |
| Simplified === Traditional | ✅ Allow, auto-set `applicable_drills = ['zhuyin']` |
| Network offline on Add Item | ❌ Block with "Connect to add items" guard |
| Duplicate Zhuyin reading (multi-pronunciation ambiguity) | 🔄 Prompt user to select context word |

### Drill Applicability Auto-Detection
```typescript
function determineApplicableDrills(simp: string, trad: string, zhuyin: string[][]): Drill[] {
  const drills: Drill[] = [];
  
  // Drill A (Zhuyin) always applicable if zhuyin present
  if (zhuyin && zhuyin.length > 0) {
    drills.push('zhuyin');
  }
  
  // Drill B (Trad) only if Simplified ≠ Traditional
  if (simp !== trad && trad) {
    drills.push('trad');
  }
  
  return drills;
}
```

---

## 📚 Validated Character Examples (Initial Coverage)

### Week 1 Sample (From User's Child's School)
| Simplified | Traditional | Zhuyin | Notes |
|------------|-------------|--------|-------|
| 太 | 太 | ㄊㄞˋ | Identical forms - Drill A only |
| 阳 | 陽 | ㄧㄤˊ | Different forms - Both drills |
| 黑 | 黑 | ㄏㄟ | Identical forms - Drill A only |
| 前 | 前 | ㄑㄧㄢˊ | Identical forms - Drill A only |
| 后 | 後 | ㄏㄡˋ | Different forms - Both drills |
| 着 | 著 | Multiple | Multi-reading - context required |
| 光 | 光 | ㄍㄨㄤ | Identical forms - Drill A only |
| 灯 | 燈 | ㄉㄥ | Different forms - Both drills |
| 亮 | 亮 | ㄌㄧㄤˋ | Identical forms - Drill A only |
| 见 | 見 | ㄐㄧㄢˋ | Different forms - Both drills |

### Multi-Reading Details: 着/著
| Context Word | Pronunciation | Zhuyin | Meaning |
|--------------|---------------|---------|---------|
| 着急 | zháo jí | ㄓㄠˊ ㄐㄧˊ | worried/anxious |
| 睡着 | shuì zháo | ㄕㄨㄟˋ ㄓㄠˊ | fall asleep |
| 着手 | zhuó shǒu | ㄓㄨㄛˊ ㄕㄡˇ | start doing |
| 跟着 | gēn zhe | ㄍㄣ ˙ㄓㄜ | follow |

**Recommendation:** When parent adds 着, show these 4 context options and ask "Which meaning are you teaching?"

---

## 🧩 Priority Coverage List (Initial Seed)

### Tier 1: School Curriculum Foundation (Week 1 confirmed)
✅ 太, 阳/陽, 黑, 前, 后/後, 着/著, 光, 灯/燈, 亮, 见/見

### Tier 2: High-Frequency Characters (HSK 1-2 overlap)
Target ~200 characters covering:
- Numbers (一二三...十)
- Family (爸妈/媽哥姐...)
- Common verbs (是有去来/來看...)
- Common nouns (人水火山...)
- Time/location (上下左右今天...)

### Tier 3: Extended Common Use (HSK 3 + storybook frequency)
Target ~300 additional characters based on:
- Children's book word frequency lists
- Traditional Chinese storybook corpus
- Grade 1-2 Taiwanese/Chinese curriculum standards

### Total Initial Seed: ~500 characters with full Traditional/Zhuyin mappings

---

## 🔄 Workflow State Diagram

```
[Parent sees newsletter/homework] 
    ↓
[Opens app → Add Item]
    ↓
[Enters Simplified OR Traditional]
    ↓
[Dictionary lookup] ─→ [Found] → [Auto-fill + confirm]
    │                               ↓
    └─→ [Not found] → [Manual entry + log to dictionary_missing]
                               ↓
                          [Multi-reading?] ─→ [Yes] → [Prompt context selection]
                               ↓                           ↓
                              [No] ─────────────────────→ [Store entry]
                                                            ↓
                                                    [Applicable drills computed]
                                                            ↓
                                                    [Catalog updated]

[Weekend: Child opens app]
    ↓
[Training Mode (landscape)]
    ↓
[Drill A or B presented based on queue priority]
    ↓
[Attempt 1] ─→ [Correct] → [+1.0 familiarity, next card]
    │
    └─→ [Wrong] → [Disable option, show retry]
                        ↓
                  [Attempt 2] ─→ [Correct] → [+0.5 familiarity, next card]
                        │
                        └─→ [Wrong] → [0 points, reveal correct, next card]
                                              ↓
                                        [Auto-save to practice_state]
                                              ↓
                                        [Session ends] → [Summary modal]
                                              ↓
                                        [Exit Training button → return to dashboard]
```

---

## ✅ Requirements Sign-Off

**Confirmed by:** User  
**Date:** 2025-11-03  
**Next Steps:** 
1. Assemble initial dictionary seed (Task 1.2.1)
2. Design dictionary schema and RPC (Epic 2)
3. Implement Add Item flow with validation (Epic 5)

---

> This document serves as the **source of truth** for Epic 1 and informs all subsequent implementation decisions.
