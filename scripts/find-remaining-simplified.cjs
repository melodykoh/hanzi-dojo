#!/usr/bin/env node
/**
 * Find all context words that still contain simplified characters
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyze() {
  const { data, error } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin_variants');

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  // Build simp->trad map from dictionary
  const dictMap = {};
  data.forEach(e => {
    if (e.simp !== e.trad) {
      dictMap[e.simp] = e.trad;
    }
  });

  // Find all context words with simplified chars
  const issues = [];
  data.filter(e => e.zhuyin_variants).forEach(entry => {
    entry.zhuyin_variants.forEach((v, i) => {
      if (!v.context_words) return;
      v.context_words.forEach(word => {
        const chars = word.split('');
        const hasSimp = chars.some(c => dictMap[c]);
        if (hasSimp) {
          const converted = chars.map(c => dictMap[c] || c).join('');
          if (converted !== word) {
            issues.push({
              char: entry.simp,
              trad: entry.trad,
              pinyin: v.pinyin,
              original: word,
              shouldBe: converted
            });
          }
        }
      });
    });
  });

  console.log('Context words needing conversion:', issues.length);
  console.log('\nExamples:');
  issues.slice(0, 30).forEach(i => {
    console.log(`  ${i.char} (${i.pinyin}): ${i.original} → ${i.shouldBe}`);
  });

  // List unique simplified chars found
  const simpFound = new Set();
  issues.forEach(i => {
    i.original.split('').forEach(c => {
      if (dictMap[c]) simpFound.add(`${c}→${dictMap[c]}`);
    });
  });
  console.log('\nSimplified chars needing mapping (' + simpFound.size + '):');
  console.log([...simpFound].join(', '));

  // Output as JSON for the generator script
  console.log('\n// Add to simpToTrad mapping:');
  const additions = {};
  [...simpFound].forEach(pair => {
    const [s, t] = pair.split('→');
    additions[s] = t;
  });
  console.log(JSON.stringify(additions, null, 2));
}

analyze();
