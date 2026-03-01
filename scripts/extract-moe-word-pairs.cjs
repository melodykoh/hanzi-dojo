#!/usr/bin/env node
/**
 * Extract 2-character word pairs from MOE (教育部重編國語辭典) dictionary data.
 *
 * Input:  data/moe/dict-revised.json (from g0v/moedict-data)
 * Output: data/moe_word_pairs.json
 *
 * Filters to entries where:
 *   - title is exactly 2 characters
 *   - both characters are CJK Unified Ideographs (U+4E00–U+9FFF or U+3400–U+4DBF)
 *   - no encoded placeholders like {[8e40]}
 *
 * Run: node scripts/extract-moe-word-pairs.cjs
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '..', 'data', 'moe', 'dict-revised.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'moe_word_pairs.json');

function isCJK(char) {
  const code = char.codePointAt(0);
  // CJK Unified Ideographs
  if (code >= 0x4E00 && code <= 0x9FFF) return true;
  // CJK Unified Ideographs Extension A
  if (code >= 0x3400 && code <= 0x4DBF) return true;
  return false;
}

function main() {
  console.log('Reading MOE dictionary...');
  const raw = fs.readFileSync(INPUT_PATH, 'utf-8');
  const entries = JSON.parse(raw);
  console.log(`Total entries: ${entries.length}`);

  const seen = new Set();
  const pairs = [];
  let skipped = { notTwoChar: 0, notCJK: 0, duplicate: 0, encoded: 0 };

  for (const entry of entries) {
    const title = entry.title;
    if (!title || title.length !== 2) {
      skipped.notTwoChar++;
      continue;
    }

    // Skip encoded characters like {[8e40]}
    if (title.includes('{') || title.includes('[')) {
      skipped.encoded++;
      continue;
    }

    const char1 = title[0];
    const char2 = title[1];

    if (!isCJK(char1) || !isCJK(char2)) {
      skipped.notCJK++;
      continue;
    }

    if (seen.has(title)) {
      skipped.duplicate++;
      continue;
    }

    seen.add(title);
    pairs.push({ word: title, char1, char2 });
  }

  console.log(`\n=== EXTRACTION RESULTS ===`);
  console.log(`Extracted: ${pairs.length} word pairs`);
  console.log(`Skipped:`);
  console.log(`  Not 2-char: ${skipped.notTwoChar}`);
  console.log(`  Not CJK: ${skipped.notCJK}`);
  console.log(`  Encoded: ${skipped.encoded}`);
  console.log(`  Duplicate: ${skipped.duplicate}`);

  // Spot-check known words
  const spotCheck = ['日記', '日光', '小人', '小學', '這個', '這天', '太陽', '太長'];
  console.log(`\n=== SPOT CHECK ===`);
  for (const word of spotCheck) {
    const found = pairs.some(p => p.word === word);
    console.log(`  ${found ? '✅' : '❌'} ${word}`);
  }

  // Show high-frequency char1 values
  const char1Counts = {};
  for (const p of pairs) {
    char1Counts[p.char1] = (char1Counts[p.char1] || 0) + 1;
  }
  const topChar1 = Object.entries(char1Counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  console.log(`\n=== TOP 15 char1 BY PAIR COUNT ===`);
  for (const [char, count] of topChar1) {
    console.log(`  ${char}: ${count} pairs`);
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(pairs, null, 2), 'utf-8');
  console.log(`\nWritten to: ${OUTPUT_PATH}`);
  console.log(`File size: ${(fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(1)} MB`);
}

main();
