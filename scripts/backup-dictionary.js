// Backup Current Dictionary Before Migration
// Creates JSON export of current dictionary state
// Run BEFORE applying Migration 010a
// Usage: node scripts/backup-dictionary.js

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

async function backupDictionary() {
  console.log('💾 Creating Dictionary Backup')
  console.log('=' .repeat(80))
  console.log()
  
  console.log('Fetching all dictionary entries...')
  
  const { data: entries, error } = await supabase
    .from('dictionary_entries')
    .select('*')
    .order('simp')
  
  if (error) {
    console.error('❌ Failed to fetch dictionary:', error.message)
    process.exit(1)
  }
  
  console.log(`✅ Fetched ${entries.length} entries`)
  console.log()
  
  // Create backup object
  const backup = {
    metadata: {
      created_at: new Date().toISOString(),
      entry_count: entries.length,
      purpose: 'Pre-Migration 011 backup',
      migration: '011_dictionary_quality_category1_complete.sql',
      note: 'Backup before adding zhuyin_variants for 37 Category 1 multi-pronunciation characters'
    },
    entries: entries
  }
  
  // Create backups directory if needed
  const backupDir = path.join(process.cwd(), 'data', 'backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
    console.log(`📁 Created backup directory: ${backupDir}`)
  }
  
  // Write backup file with timestamp
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const filename = `dictionary_backup_pre_011_${timestamp}.json`
  const filepath = path.join(backupDir, filename)
  
  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf8')
  
  console.log('✅ Backup created successfully!')
  console.log(`📄 File: ${filepath}`)
  console.log(`📊 Size: ${(fs.statSync(filepath).size / 1024).toFixed(1)} KB`)
  console.log()
  
  // Show sample of what's being backed up
  console.log('Sample entries:')
  entries.slice(0, 3).forEach(e => {
    console.log(`  ${e.simp} (${e.trad}): ${JSON.stringify(e.zhuyin).substring(0, 50)}...`)
  })
  console.log()
  
  console.log('=' .repeat(80))
  console.log('✅ Backup complete - safe to proceed with migration')
  console.log()
  console.log('To restore this backup if needed:')
  console.log(`  Use Supabase Dashboard SQL Editor with backup data`)
  console.log('=' .repeat(80))
  console.log()
}

backupDictionary().catch(console.error)
