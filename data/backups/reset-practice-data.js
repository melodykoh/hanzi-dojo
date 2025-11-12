// Reset Practice Data for a Kid
// Deletes all practice_events and practice_state records
// Run with: node scripts/reset-practice-data.js
// IMPORTANT: This is PERMANENT - cannot be undone!

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

loadEnv()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

async function resetPracticeData() {
  console.log('🗑️  Reset Practice Data')
  console.log('=' .repeat(80))
  console.log()
  console.log('⚠️  WARNING: This will PERMANENTLY delete all practice history!')
  console.log('This includes:')
  console.log('  - All practice events (attempt history)')
  console.log('  - All practice state (familiarity counters, known status)')
  console.log()
  console.log('Your entries (character list) will NOT be deleted.')
  console.log('=' .repeat(80))
  console.log()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('❌ Not authenticated. Please log in first.')
    process.exit(1)
  }
  
  console.log(`Authenticated as: ${user.email}`)
  console.log()
  
  // Get kid profile
  const { data: kids, error: kidsError } = await supabase
    .from('kids')
    .select('id, name, belt_rank')
    .eq('owner_id', user.id)
  
  if (kidsError) {
    console.error('❌ Failed to fetch kid profile:', kidsError.message)
    process.exit(1)
  }
  
  if (!kids || kids.length === 0) {
    console.log('❌ No kid profile found')
    process.exit(1)
  }
  
  const kid = kids[0]
  console.log(`Kid Profile: ${kid.name} (${kid.belt_rank} belt)`)
  console.log(`Kid ID: ${kid.id}`)
  console.log()
  
  // Check current data
  const { data: events, error: eventsError } = await supabase
    .from('practice_events')
    .select('id', { count: 'exact' })
    .eq('kid_id', kid.id)
  
  const { data: states, error: statesError } = await supabase
    .from('practice_state')
    .select('id', { count: 'exact' })
    .eq('kid_id', kid.id)
  
  if (eventsError || statesError) {
    console.error('❌ Failed to check existing data')
    process.exit(1)
  }
  
  const eventCount = events?.length || 0
  const stateCount = states?.length || 0
  
  console.log('Current Data:')
  console.log(`  Practice Events: ${eventCount} records`)
  console.log(`  Practice State: ${stateCount} records`)
  console.log()
  
  if (eventCount === 0 && stateCount === 0) {
    console.log('✅ No practice data to delete. Already clean!')
    process.exit(0)
  }
  
  // Confirmation
  const answer = await prompt('Type "DELETE" to confirm permanent deletion: ')
  
  if (answer !== 'DELETE') {
    console.log('\n❌ Cancelled. No data was deleted.')
    process.exit(0)
  }
  
  console.log()
  console.log('🔄 Deleting practice data...')
  console.log()
  
  // Delete practice events
  console.log(`Deleting ${eventCount} practice events...`)
  const { error: deleteEventsError } = await supabase
    .from('practice_events')
    .delete()
    .eq('kid_id', kid.id)
  
  if (deleteEventsError) {
    console.error('❌ Failed to delete practice events:', deleteEventsError.message)
    process.exit(1)
  }
  console.log('✅ Practice events deleted')
  
  // Delete practice state
  console.log(`Deleting ${stateCount} practice state records...`)
  const { error: deleteStatesError } = await supabase
    .from('practice_state')
    .delete()
    .eq('kid_id', kid.id)
  
  if (deleteStatesError) {
    console.error('❌ Failed to delete practice state:', deleteStatesError.message)
    process.exit(1)
  }
  console.log('✅ Practice state deleted')
  
  console.log()
  console.log('=' .repeat(80))
  console.log('✅✅✅ RESET COMPLETE')
  console.log('=' .repeat(80))
  console.log()
  console.log('Your practice data has been reset to zero.')
  console.log('Your character entries are still intact.')
  console.log()
  console.log('Next steps:')
  console.log('1. Refresh the app in your browser')
  console.log('2. Dashboard should show 0 points, 0 practiced')
  console.log('3. Use "Launch Training" to start fresh practice')
  console.log()
}

resetPracticeData().catch(console.error)
