// Apply Migration 010a to Production Database
// Run with: node scripts/apply-migration-010a.js

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

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

async function applyMigration() {
  console.log('🚀 Starting Migration 010a Application')
  console.log('=' .repeat(80))
  console.log('\n⚠️  IMPORTANT: This will modify production database')
  console.log('Migration: 010_comprehensive_dictionary_fix.sql')
  console.log('\nChanges:')
  console.log('  - Fix 248 empty tone marks → "ˉ"')
  console.log('  - Restructure 22 multi-pronunciation characters')
  console.log('  - Add missing character 麼\n')
  
  // Read migration file
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '010_comprehensive_dictionary_fix.sql')
  console.log('📄 Reading migration file:', migrationPath)
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found!')
    process.exit(1)
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
  console.log(`✅ Migration file loaded (${(migrationSQL.length / 1024).toFixed(1)} KB)\n`)
  
  console.log('🔄 Executing migration...')
  console.log('This may take 30-60 seconds for 1,000 entries...\n')
  
  const startTime = Date.now()
  
  // Anon key doesn't have permission to execute arbitrary SQL
  // Must apply via Supabase Dashboard SQL Editor
  console.log('⚠️  Anon key lacks permission for direct SQL execution')
  console.log('\n' + '='.repeat(80))
  console.log('📋 MANUAL APPLICATION INSTRUCTIONS')
  console.log('='.repeat(80))
  console.log('\n1. Go to: https://app.supabase.com')
  console.log('2. Select your Hanzi Dojo project')
  console.log('3. Click "SQL Editor" in left sidebar')
  console.log('4. Click "New query" button')
  console.log('\n5. Copy the entire contents of this file:')
  console.log(`   ${migrationPath}`)
  console.log('\n6. Paste into SQL Editor')
  console.log('7. Click "Run" button (▶️)')
  console.log('\n8. Watch console output for success messages:')
  console.log('   ✅ Part 1 Complete: All 248 empty tone marks fixed')
  console.log('   ✅ Part 2 Complete: All 22 multi-pronunciation characters restructured')
  console.log('   ✅ Part 3 Complete: Added character 麼')
  console.log('   ✅✅✅ MIGRATION COMPLETE - All 3 parts successful!')
  console.log('\n9. Verify migration results:')
  console.log('   node scripts/verify-migration-010a.js')
  console.log('\n' + '='.repeat(80))
  console.log('\n💡 TIP: Keep this terminal open to copy the migration file path\n')
}

applyMigration().catch(console.error)
