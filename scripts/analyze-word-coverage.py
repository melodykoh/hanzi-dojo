#!/usr/bin/env python3
"""
Analyze coverage between CCCC vocabulary and Hanzi Dojo dictionary.
Determines how many 2-character words can be used for Drill C (Word Match).
"""

import json
import pandas as pd
import re

def clean_word(w):
    """Clean CCCC word format: 哥(哥) -> 哥哥, handle / alternatives"""
    if pd.isna(w):
        return ''
    w = str(w)
    # Pattern: X(Y) -> XY
    w = re.sub(r'(.)\((.)\)', r'\\1\\2', w)
    # Remove any remaining parentheses
    w = w.replace('(', '').replace(')', '')
    # Handle / alternatives - take first
    if '/' in w:
        w = w.split('/')[0]
    return w.strip()

def main():
    # Load our dictionary files
    print("Loading Hanzi Dojo dictionary...")

    with open('data/dictionary_expansion_v2.json', 'r') as f:
        v2_data = json.load(f)
    v2_entries = v2_data.get('entries', [])

    with open('data/dictionary_seed_v1.json', 'r') as f:
        v1_data = json.load(f)
    v1_entries = v1_data.get('entries', [])

    all_entries = v2_entries + v1_entries

    print(f"  V1 entries: {len(v1_entries)}")
    print(f"  V2 entries: {len(v2_entries)}")
    print(f"  Combined: {len(all_entries)}")
    print()

    # Build Zhuyin lookup (char -> zhuyin array)
    char_to_zhuyin = {}
    char_to_entry = {}
    for e in all_entries:
        simp = e.get('simp')
        trad = e.get('trad')
        zhuyin = e.get('zhuyin')
        if simp and zhuyin:
            char_to_zhuyin[simp] = zhuyin
            char_to_entry[simp] = e
        if trad and zhuyin and trad != simp:
            char_to_zhuyin[trad] = zhuyin
            char_to_entry[trad] = e

    print(f"Characters with Zhuyin: {len(char_to_zhuyin)}")
    print()

    # Load CCCC vocabulary
    print("Loading CCCC vocabulary...")
    xls = pd.ExcelFile('data sets for drills/CCCC_Vocabulary_2022.xls')

    all_words = []
    for sheet in ['萌芽級', '成長級', '茁壯級']:
        df = pd.read_excel(xls, sheet_name=sheet, header=1)
        df.columns = ['Category', 'Subcategory', 'Traditional', 'Simplified', 'Pinyin', 'POS', 'English', 'Read', 'Write']
        df['Level'] = sheet
        all_words.append(df)

    vocab_df = pd.concat(all_words, ignore_index=True)
    print(f"  Total CCCC entries: {len(vocab_df)}")

    # Clean words
    vocab_df['CleanTrad'] = vocab_df['Traditional'].apply(clean_word)
    vocab_df['CleanSimp'] = vocab_df['Simplified'].apply(clean_word)

    # Filter to exactly 2-character words
    two_char = vocab_df[vocab_df['CleanTrad'].str.len() == 2].copy()
    print(f"  2-character words: {len(two_char)}")
    print()

    # Analyze coverage
    def get_coverage(row):
        trad = row['CleanTrad']
        simp = row['CleanSimp']

        if len(trad) != 2:
            return 'invalid', None, None

        char1_t, char2_t = trad[0], trad[1]
        char1_s = simp[0] if len(simp) >= 1 else ''
        char2_s = simp[1] if len(simp) >= 2 else ''

        # Check if chars have Zhuyin (check both trad and simp versions)
        char1_zhuyin = char_to_zhuyin.get(char1_t) or char_to_zhuyin.get(char1_s)
        char2_zhuyin = char_to_zhuyin.get(char2_t) or char_to_zhuyin.get(char2_s)

        if char1_zhuyin and char2_zhuyin:
            return 'both', char1_zhuyin, char2_zhuyin
        elif char1_zhuyin:
            return 'char1_only', char1_zhuyin, None
        elif char2_zhuyin:
            return 'char2_only', None, char2_zhuyin
        else:
            return 'neither', None, None

    results = two_char.apply(get_coverage, axis=1, result_type='expand')
    two_char['coverage'] = results[0]
    two_char['char1_zhuyin'] = results[1]
    two_char['char2_zhuyin'] = results[2]

    print("=" * 50)
    print("COVERAGE ANALYSIS RESULTS")
    print("=" * 50)
    print()
    print(two_char['coverage'].value_counts().to_string())
    print()

    both = two_char[two_char['coverage'] == 'both']
    char1_only = two_char[two_char['coverage'] == 'char1_only']
    char2_only = two_char[two_char['coverage'] == 'char2_only']
    neither = two_char[two_char['coverage'] == 'neither']

    print(f"✅ IMMEDIATELY USABLE (both chars have Zhuyin): {len(both)} words")
    print(f"⚠️  Char1 only has Zhuyin: {len(char1_only)} words")
    print(f"⚠️  Char2 only has Zhuyin: {len(char2_only)} words")
    print(f"❌ Neither char has Zhuyin: {len(neither)} words")
    print()

    # For Drill C: words usable if AT LEAST ONE char is in dictionary
    # (because kid only needs to have learned ONE char)
    usable_for_drill = two_char[two_char['coverage'].isin(['both', 'char1_only', 'char2_only'])]
    print(f"📊 USABLE FOR DRILL C (at least 1 char): {len(usable_for_drill)} words")
    print()

    print("=" * 50)
    print("SAMPLE IMMEDIATELY USABLE WORDS (both chars)")
    print("=" * 50)
    sample_cols = ['CleanTrad', 'CleanSimp', 'Pinyin', 'English', 'Level']
    print(both[sample_cols].head(40).to_string())
    print()

    print("=" * 50)
    print("WORDS MISSING CHAR2 ZHUYIN (need dictionary expansion)")
    print("=" * 50)
    # Find which chars are missing
    missing_chars = set()
    for _, row in char1_only.iterrows():
        trad = row['CleanTrad']
        if len(trad) == 2:
            missing_chars.add(trad[1])
    for _, row in char2_only.iterrows():
        trad = row['CleanTrad']
        if len(trad) == 2:
            missing_chars.add(trad[0])

    print(f"Missing chars that would unlock more words: {len(missing_chars)}")
    print(f"Chars: {''.join(sorted(missing_chars)[:50])}...")
    print()

    # Save usable words to JSON for later use
    usable_words = []
    for _, row in both.iterrows():
        trad = row['CleanTrad']
        simp = row['CleanSimp']

        char1_t, char2_t = trad[0], trad[1]
        char1_s = simp[0] if len(simp) >= 1 else char1_t
        char2_s = simp[1] if len(simp) >= 2 else char2_t

        # Get Zhuyin for each char
        char1_zy = char_to_zhuyin.get(char1_t) or char_to_zhuyin.get(char1_s)
        char2_zy = char_to_zhuyin.get(char2_t) or char_to_zhuyin.get(char2_s)

        usable_words.append({
            'word_trad': trad,
            'word_simp': simp if simp else trad,
            'char1_trad': char1_t,
            'char1_simp': char1_s,
            'char1_zhuyin': char1_zy,
            'char2_trad': char2_t,
            'char2_simp': char2_s,
            'char2_zhuyin': char2_zy,
            'pinyin': row['Pinyin'],
            'english': row['English'],
            'category': row['Category'],
            'level': row['Level']
        })

    output_file = 'data/word_pairs_cccc_usable.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'version': '1.0.0',
            'source': 'CCCC_Vocabulary_2022 + dictionary_expansion_v2',
            'description': 'Word pairs where BOTH characters have Zhuyin in dictionary',
            'total_words': len(usable_words),
            'words': usable_words
        }, f, ensure_ascii=False, indent=2)

    print(f"✅ Saved {len(usable_words)} usable word pairs to {output_file}")
    print()

    # Summary stats
    print("=" * 50)
    print("SUMMARY FOR DRILL C IMPLEMENTATION")
    print("=" * 50)
    print(f"Total 2-char words in CCCC: {len(two_char)}")
    print(f"Words with BOTH chars having Zhuyin: {len(both)} ({100*len(both)//len(two_char)}%)")
    print(f"Words with at least ONE char: {len(usable_for_drill)} ({100*len(usable_for_drill)//len(two_char)}%)")
    print()
    print("For a kid with N saved characters:")
    print("  - They can play if we find 5+ word pairs where one char is saved")
    print("  - With 557 usable words, coverage should be excellent")

if __name__ == '__main__':
    main()
