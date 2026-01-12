#!/usr/bin/env node
// Analyze word pair coverage for a user's saved characters
// Usage: node --env-file=.env.local scripts/analyze-word-pair-coverage.cjs

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyze() {
  console.log('='.repeat(60))
  console.log('Word Pair Coverage Analysis for Drill C')
  console.log('='.repeat(60))

  // 1. Get all word pairs
  const { data: allPairs, error: pairsError } = await supabase
    .from('word_pairs')
    .select('id, word, char1, char2, category')

  if (pairsError) {
    console.error('Error fetching word pairs:', pairsError)
    return
  }

  console.log(`\nTotal word pairs in database: ${allPairs.length}`)

  // 2. Get all kids (to find entries)
  const { data: kids, error: kidsError } = await supabase
    .from('kids')
    .select('id, name, owner_id')

  if (kidsError) {
    console.error('Error fetching kids:', kidsError)
    return
  }

  if (!kids || kids.length === 0) {
    console.log('\nNo kids found in database.')
    return
  }

  // 3. For each kid, analyze their entries
  for (const kid of kids) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`Kid: ${kid.name || 'unnamed'} (${kid.id})`)
    console.log('─'.repeat(60))

    // Get kid's entries (saved characters)
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('id, trad, simp')
      .eq('kid_id', kid.id)

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      continue
    }

    console.log(`Saved characters: ${entries?.length || 0}`)

    if (!entries || entries.length === 0) {
      console.log('  (No characters saved yet)')
      continue
    }

    // Create set of saved traditional characters
    const savedTradChars = new Set(entries.map(e => e.trad))
    console.log(`Unique traditional characters: ${savedTradChars.size}`)

    // Find eligible word pairs (at least one char in saved set)
    const eligiblePairs = allPairs.filter(pair =>
      savedTradChars.has(pair.char1) || savedTradChars.has(pair.char2)
    )

    console.log(`\nEligible word pairs for Drill C: ${eligiblePairs.length}`)
    console.log(`  (Need at least 5 to play)`)

    // Break down by coverage type
    const bothCharsKnown = eligiblePairs.filter(pair =>
      savedTradChars.has(pair.char1) && savedTradChars.has(pair.char2)
    )
    const onlyChar1Known = eligiblePairs.filter(pair =>
      savedTradChars.has(pair.char1) && !savedTradChars.has(pair.char2)
    )
    const onlyChar2Known = eligiblePairs.filter(pair =>
      !savedTradChars.has(pair.char1) && savedTradChars.has(pair.char2)
    )

    console.log(`\nBreakdown:`)
    console.log(`  Both characters known: ${bothCharsKnown.length}`)
    console.log(`  Only 1st char known:   ${onlyChar1Known.length}`)
    console.log(`  Only 2nd char known:   ${onlyChar2Known.length}`)

    // Show which saved characters appear in word pairs
    const charsWithPairs = new Set()
    const charsWithoutPairs = new Set()

    for (const trad of savedTradChars) {
      const hasPair = allPairs.some(p => p.char1 === trad || p.char2 === trad)
      if (hasPair) {
        charsWithPairs.add(trad)
      } else {
        charsWithoutPairs.add(trad)
      }
    }

    console.log(`\nCharacter coverage:`)
    console.log(`  Characters WITH word pairs: ${charsWithPairs.size}`)
    console.log(`  Characters WITHOUT word pairs: ${charsWithoutPairs.size}`)

    if (charsWithoutPairs.size > 0 && charsWithoutPairs.size <= 20) {
      console.log(`\n  Characters without pairs: ${[...charsWithoutPairs].join(' ')}`)
    }

    // Show sample of eligible pairs
    if (eligiblePairs.length > 0) {
      console.log(`\nSample eligible pairs (first 10):`)
      eligiblePairs.slice(0, 10).forEach(p => {
        const c1Known = savedTradChars.has(p.char1) ? '✓' : '✗'
        const c2Known = savedTradChars.has(p.char2) ? '✓' : '✗'
        console.log(`  ${p.word} (${p.char1}[${c1Known}] + ${p.char2}[${c2Known}]) - ${p.category || 'no category'}`)
      })
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('Analysis complete')
}

analyze().catch(console.error)
