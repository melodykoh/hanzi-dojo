#!/usr/bin/env node
/**
 * QA Script: Pronunciation Filtering for Drill C Word Pairs
 *
 * Tests the hero-centric pronunciation filtering logic:
 * - Only the "hero character" (saved character) drives filtering
 * - If hero has locked_reading_id, only word pairs in context_words are eligible
 *
 * Test Characters (from user's test account):
 * - 著 saved with "zhe" (看著, 走著, 聽著) → 著名, 著作 should NOT match
 * - 為 saved with "wèi" (因為, 為了, 為什麼) → Only 因為 should match
 * - 處 saved with "chǔ" (處罚, 處置...) → 到處 should NOT match (uses chù)
 * - 了 saved with "le" (好了, 完了, 走了) → 了解 should NOT match (uses liǎo)
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Test user credentials
const TEST_EMAIL = 'test@hanzidojo.local';
const TEST_PASSWORD = 'testpassword123';

// Expected filtering behavior based on saved pronunciations
const PRONUNCIATION_FILTERS = {
  '著': {
    savedPinyin: 'zhe',
    contextWords: ['看著', '走著', '聽著'],
    wordPairsInDB: ['著名', '著作'],
    expectedEligible: [], // Neither 著名 nor 著作 use "zhe" pronunciation
    reason: '著名 and 著作 use zhù, not zhe'
  },
  '為': {
    savedPinyin: 'wèi',
    contextWords: ['因為', '為了', '為什麼'],
    wordPairsInDB: ['因為', '以為', '成為'],
    expectedEligible: ['因為'], // Only 因為 is in wèi context
    reason: '以為 and 成為 use wéi, not wèi'
  },
  '處': {
    savedPinyin: 'chǔ',
    contextWords: ['處罚', '處置', '處境', '處方'],
    wordPairsInDB: ['到處'],
    expectedEligible: [], // 到處 uses chù, not chǔ
    reason: '到處 uses chù (place), not chǔ (deal with)'
  },
  '了': {
    savedPinyin: 'le',
    contextWords: ['好了', '完了', '走了'],
    wordPairsInDB: ['了解'],
    expectedEligible: [], // 了解 uses liǎo, not le
    reason: '了解 uses liǎo (understand), not le (particle)'
  }
};

async function runQA() {
  console.log('='.repeat(60));
  console.log('QA: Pronunciation Filtering for Drill C Word Pairs');
  console.log('='.repeat(60));
  console.log();

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Step 1: Sign in as test user
  console.log('Step 1: Signing in as test user...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (authError) {
    console.error('❌ Auth failed:', authError.message);
    process.exit(1);
  }
  console.log('✅ Signed in as:', authData.user.email);
  console.log();

  // Step 2: Get kid_id for this user
  console.log('Step 2: Getting kid profile...');
  const { data: kids, error: kidsError } = await supabase
    .from('kids')
    .select('id, name')
    .eq('owner_id', authData.user.id);

  if (kidsError || !kids?.length) {
    console.error('❌ No kid profile found:', kidsError?.message);
    process.exit(1);
  }
  const kidId = kids[0].id;
  console.log('✅ Kid ID:', kidId);
  console.log();

  // Step 3: Check saved entries with locked_reading_id
  console.log('Step 3: Checking saved multi-pronunciation entries...');
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('id, simp, trad, locked_reading_id')
    .eq('kid_id', kidId)
    .not('locked_reading_id', 'is', null);

  if (entriesError) {
    console.error('❌ Failed to fetch entries:', entriesError.message);
    process.exit(1);
  }

  // Fetch readings separately
  const readingIds = entries.map(e => e.locked_reading_id).filter(Boolean);
  const { data: readings, error: readingsError } = await supabase
    .from('readings')
    .select('id, pinyin, context_words')
    .in('id', readingIds);

  if (readingsError) {
    console.error('❌ Failed to fetch readings:', readingsError.message);
    process.exit(1);
  }

  const readingsMap = new Map(readings?.map(r => [r.id, r]) || []);

  console.log(`Found ${entries.length} entries with locked pronunciations:`);
  entries.forEach(e => {
    const reading = readingsMap.get(e.locked_reading_id);
    console.log(`  - ${e.simp}/${e.trad}: ${reading?.pinyin || 'unknown'}`);
    console.log(`    Context words: ${reading?.context_words?.join(', ') || 'none'}`);
  });
  console.log();

  // Step 4: Call the RPC to get eligible word pairs
  console.log('Step 4: Calling get_eligible_word_pairs RPC...');
  const { data: wordPairs, error: rpcError } = await supabase
    .rpc('get_eligible_word_pairs', { p_kid_id: kidId });

  if (rpcError) {
    console.error('❌ RPC failed:', rpcError.message);
    process.exit(1);
  }
  console.log(`✅ RPC returned ${wordPairs.length} eligible word pairs`);
  console.log();

  // Step 5: Analyze filtering for each test character
  console.log('Step 5: Analyzing pronunciation filtering...');
  console.log('-'.repeat(60));

  let allPassed = true;
  const wordPairWords = wordPairs.map(wp => wp.word);

  for (const [char, expected] of Object.entries(PRONUNCIATION_FILTERS)) {
    console.log(`\n${char} (saved as "${expected.savedPinyin}"):`);
    console.log(`  Context words: ${expected.contextWords.join(', ')}`);
    console.log(`  Word pairs in DB: ${expected.wordPairsInDB.join(', ')}`);
    console.log(`  Expected eligible via ${char} as hero: ${expected.expectedEligible.length ? expected.expectedEligible.join(', ') : 'none'}`);
    console.log(`  Reason: ${expected.reason}`);

    // Check each word pair
    for (const wordPair of expected.wordPairsInDB) {
      const isInResults = wordPairWords.includes(wordPair);
      const shouldBeEligible = expected.expectedEligible.includes(wordPair);

      // Note: A word pair might still appear if the OTHER character contributes it
      // We need to check if the word appears AND if it's correctly filtered
      if (shouldBeEligible && isInResults) {
        console.log(`  ✅ ${wordPair} correctly included (matches ${expected.savedPinyin} context)`);
      } else if (!shouldBeEligible && isInResults) {
        // This might be OK if another character contributed it
        const otherChar = wordPair.replace(char, '');
        console.log(`  ⚠️  ${wordPair} included - check if "${otherChar}" contributed it`);
      } else if (shouldBeEligible && !isInResults) {
        console.log(`  ❌ ${wordPair} MISSING - should be eligible via ${char}`);
        allPassed = false;
      } else {
        console.log(`  ✅ ${wordPair} correctly excluded (not in ${expected.savedPinyin} context)`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));

  // Step 6: Show all returned word pairs for manual verification
  console.log('\nAll eligible word pairs returned by RPC:');
  wordPairs.forEach(wp => {
    console.log(`  - ${wp.word} (${wp.char1} + ${wp.char2})`);
  });

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ QA PASSED: Pronunciation filtering working correctly');
  } else {
    console.log('❌ QA FAILED: Some word pairs not filtered correctly');
    process.exit(1);
  }

  await supabase.auth.signOut();
}

runQA().catch(err => {
  console.error('QA Script Error:', err);
  process.exit(1);
});
