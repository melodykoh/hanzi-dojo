// Dictionary Expansion Script
// Processes HSK 1-4 data and generates dictionary entries with zhuyin

import fs from 'fs';
import { pinyinToZhuyin } from 'pinyin-zhuyin';
import pinyinModule from 'pinyin';

const pinyin = pinyinModule.default || pinyinModule.pinyin;

// Read existing dictionary to avoid duplicates
const existingDict = JSON.parse(fs.readFileSync('./data/dictionary_seed_v1.json', 'utf-8'));
const existingChars = new Set();
existingDict.entries.forEach(entry => {
  existingChars.add(entry.simp);
  existingChars.add(entry.trad);
});

console.log(`Existing dictionary has ${existingChars.size} characters`);

// Character pronunciation map: char -> { simp, trad, pinyin, meanings }
const charMap = new Map();

// Process HSK files
for (let level = 1; level <= 4; level++) {
  const filename = `/tmp/hsk${level}.txt`;
  const content = fs.readFileSync(filename, 'utf-8');
  const lines = content.trim().split('\n');

  console.log(`Processing HSK ${level}: ${lines.length} words`);

  lines.forEach(line => {
    const parts = line.split('\t');
    if (parts.length < 5) return;

    const simp = parts[0].trim();
    const trad = parts[1].trim();
    const meanings = parts[4].trim();

    // Extract individual characters
    for (let i = 0; i < simp.length; i++) {
      const simpChar = simp[i];
      const tradChar = trad[i] || simpChar;

      // Skip if already in existing dictionary
      if (existingChars.has(simpChar) || existingChars.has(tradChar)) {
        continue;
      }

      // Skip punctuation, numbers, and non-CJK
      if (!/[\u4e00-\u9fff]/.test(simpChar)) {
        continue;
      }

      const key = `${simpChar}|${tradChar}`;

      if (!charMap.has(key)) {
        charMap.set(key, {
          simp: simpChar,
          trad: tradChar,
          pinyinSet: new Set(),
          meanings: new Set(),
          hsk_level: level
        });
      }

      const entry = charMap.get(key);

      // Use pinyin library to get character-level pinyin
      // Try traditional character first (more accurate), fallback to simplified
      try {
        const charPinyin = pinyin(tradChar, {
          style: pinyin.STYLE_TONE,
          heteronym: true // Get all pronunciations
        });

        // Format is [ [ 'shí', 'shén' ] ] - array of arrays
        if (charPinyin && charPinyin[0] && charPinyin[0][0]) {
          charPinyin[0].forEach(p => entry.pinyinSet.add(p));
        }
      } catch (e) {
        // Fallback: try simplified
        try {
          const charPinyin = pinyin(simpChar, {
            style: pinyin.STYLE_TONE,
            heteronym: true
          });

          if (charPinyin && charPinyin[0] && charPinyin[0][0]) {
            charPinyin[0].forEach(p => entry.pinyinSet.add(p));
          }
        } catch (e2) {
          // Skip if conversion fails
        }
      }

      // Add meaning context
      entry.meanings.add(meanings);
    }
  });
}

console.log(`\nFound ${charMap.size} new unique characters`);

// Filter out characters without pinyin (conversion failed)
const charsWithPinyin = Array.from(charMap.values()).filter(char => char.pinyinSet.size > 0);

console.log(`Characters with pinyin: ${charsWithPinyin.length}`);

// Convert to array and sort by HSK level, then by frequency
const newChars = charsWithPinyin
  .map(char => ({
    ...char,
    pinyin: Array.from(char.pinyinSet),
    meanings: Array.from(char.meanings).slice(0, 3) // Keep top 3 contexts
  }))
  .sort((a, b) => {
    if (a.hsk_level !== b.hsk_level) return a.hsk_level - b.hsk_level;
    return a.simp.localeCompare(b.simp);
  });

// Process all characters with valid pinyin
console.log(`\nConverting pinyin to zhuyin for ${newChars.length} characters...`);

// Helper function to parse zhuyin string into [initial, final, tone] format
function parseZhuyin(zhuyinStr) {
  // Clean up the input
  const clean = zhuyinStr.trim().replace(/\s+/g, '');

  // Tone marks in zhuyin
  const tones = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙'];
  let tone = '';
  let base = clean;

  // Extract tone
  for (const t of tones) {
    if (clean.includes(t)) {
      tone = t;
      base = clean.replace(t, '');
      break;
    }
  }

  // For simplicity, return as [initial, final, tone]
  // A more sophisticated parser would separate initial consonants
  // from finals, but this requires a mapping table

  // If it starts with a consonant, try to split
  const initials = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ'];

  let initial = '';
  let final = base;

  if (base.length > 0 && initials.includes(base[0])) {
    initial = base[0];
    final = base.slice(1);
  }

  return [initial, final, tone];
}

const entries = newChars.map((char, index) => {
  try {
    // Use the first/primary pinyin reading
    const primaryPinyin = char.pinyin[0] || '';

    // Convert to zhuyin
    let zhuyinStr = '';
    try {
      zhuyinStr = pinyinToZhuyin(primaryPinyin);
    } catch (e) {
      console.warn(`Failed to convert pinyin "${primaryPinyin}" for ${char.simp}: ${e.message}`);
      return null;
    }

    // Parse zhuyin into components
    const zhuyinParts = parseZhuyin(zhuyinStr);

    return {
      simp: char.simp,
      trad: char.trad,
      zhuyin: [zhuyinParts],
      pinyin: primaryPinyin,
      hsk_level: char.hsk_level,
      frequency_rank: 1000 + index, // Assign sequential ranks
      meanings: char.meanings.slice(0, 2)
    };
  } catch (e) {
    console.error(`Error processing ${char.simp}:`, e);
    return null;
  }
}).filter(e => e !== null);

console.log(`Successfully converted ${entries.length} characters`);

// Save to new JSON file
const output = {
  version: '2.0.0',
  created: new Date().toISOString().split('T')[0],
  description: `Dictionary expansion - added ${entries.length} HSK 1-4 characters`,
  note: 'Zhuyin converted from Chinese characters via pinyin library. May require manual review for multi-pronunciation characters.',
  entries: entries
};

fs.writeFileSync('./data/dictionary_expansion_v2.json', JSON.stringify(output, null, 2));
console.log(`\n✅ Saved ${entries.length} new characters to data/dictionary_expansion_v2.json`);
console.log(`Total dictionary size will be: ${existingDict.entries.length + entries.length} characters`);

// Print a sample to verify
console.log(`\nSample entries:`);
const samples = ['什', '么', '习', '人', '的'].map(c => entries.find(e => e.simp === c)).filter(Boolean);
samples.forEach(s => {
  console.log(`  ${s.simp} (${s.trad}): ${s.pinyin} → ${s.zhuyin[0].join('')}`);
});
