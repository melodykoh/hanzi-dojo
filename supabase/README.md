# Supabase Setup Guide

## Overview
This directory contains database migrations and setup scripts for Hanzi Dojo's Supabase backend.

## Prerequisites
1. Supabase account (free tier works fine)
2. New Supabase project created at [supabase.com](https://supabase.com)
3. Project URL and `anon` key copied to `.env.local`

## Quick Start

### 1. Create Supabase Project
```bash
# Login and create project via Supabase Dashboard
# Or use Supabase CLI:
supabase init
supabase start
```

### 2. Apply Migrations
**Option A: Supabase Dashboard (Recommended for first-time setup)**
1. Go to your project → SQL Editor
2. Copy contents of `migrations/001_initial_schema.sql`
3. Paste and run
4. Verify tables created in Table Editor

**Option B: Supabase CLI**
```bash
supabase db push
```

### 3. Seed Dictionary Data
**Option A: Import Script (Recommended)**
```bash
cd ..
node scripts/import_dictionary.js
```

**Option B: Manual SQL**
1. SQL Editor → Paste contents of `migrations/002_seed_dictionary.sql`
2. Run sample inserts (covers ~20 characters)
3. For full 150-character import, use script method

### 4. Verify Setup
Run these queries in SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check dictionary entries loaded
SELECT COUNT(*) as total_entries FROM dictionary_entries;

-- Test lookup for user's Week 1 characters
SELECT simp, trad, zhuyin, pinyin 
FROM dictionary_entries 
WHERE simp IN ('太', '阳', '黑', '前', '后', '着', '光', '灯', '亮', '见');

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Expected results:
- ✅ 14+ tables created (kids, entries, readings, practice_state, practice_events, dictionary_*, test_*)
- ✅ 150 dictionary entries (if full import completed)
- ✅ All 10 user's Week 1 characters present
- ✅ RLS enabled (`rowsecurity = true`) on all tables

## Migration Files

### `001_initial_schema.sql`
**Purpose:** Core database schema

**Creates:**
- Enums: `entry_type`, `practice_drill`
- Tables: `kids`, `entries`, `readings`, `practice_state`, `practice_events`
- Dictionary tables: `dictionary_entries`, `dictionary_confusions`, `dictionary_missing`
- Test prep tables: `test_weeks`, `test_week_items`
- RLS policies for all tables
- Indexes for performance
- Triggers for auto-updating `updated_at`

**RLS Summary:**
- `kids`, `entries`, `readings`, `practice_state`, `practice_events`: Owner-only access via `auth.uid()`
- `dictionary_entries`, `dictionary_confusions`: Read-only for authenticated users
- `dictionary_missing`: Users can only see their own reports

### `002_seed_dictionary.sql`
**Purpose:** Import initial dictionary data

**Coverage:**
- User's school Week 1: 太, 阳/陽, 黑, 前, 后/後, 着/著, 光, 灯/燈, 亮, 见/見
- Numbers 1-10
- Common HSK 1-2 vocabulary (family, pronouns, verbs, etc.)
- Sample confusion mappings for drill generation

**Note:** This migration provides template + samples. Full 150-character import should use programmatic script (see below).

## Import Scripts

### Node.js Import (Recommended)
Create `scripts/import_dictionary.js`:

```js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Get from project settings

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importDictionary() {
  const seed = JSON.parse(fs.readFileSync('./data/dictionary_seed_v1.json', 'utf8'));
  
  console.log(`Importing ${seed.entries.length} characters...`);
  
  for (const entry of seed.entries) {
    const { simp, trad, zhuyin, zhuyin_variants, pinyin, meanings, frequency_rank } = entry;
    
    const { data, error } = await supabase
      .from('dictionary_entries')
      .upsert({
        simp,
        trad,
        zhuyin: zhuyin || null,
        zhuyin_variants: zhuyin_variants || null,
        pinyin,
        meanings,
        frequency_rank
      }, { onConflict: 'simp' });
    
    if (error) {
      console.error(`Error importing ${simp}:`, error);
    } else {
      console.log(`✓ ${simp} (${trad})`);
    }
  }
  
  console.log('Dictionary import complete!');
}

importDictionary();
```

Run:
```bash
npm install @supabase/supabase-js
SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/import_dictionary.js
```

### Import Confusion Maps
Create `scripts/import_confusions.js`:

```js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function importConfusions() {
  const maps = JSON.parse(fs.readFileSync('./data/confusion_maps_v1.json', 'utf8'));
  
  // For each dictionary entry, generate confusion data
  const { data: entries } = await supabase
    .from('dictionary_entries')
    .select('id, simp, trad');
  
  for (const entry of entries) {
    // Zhuyin confusions (tone variants)
    const zhuyinConfusions = generateZhuyinConfusions(entry, maps);
    await supabase.from('dictionary_confusions').upsert({
      entry_id: entry.id,
      drill: 'zhuyin',
      confusions: zhuyinConfusions
    }, { onConflict: 'entry_id,drill' });
    
    // Traditional confusions (visual + phonetic)
    if (entry.simp !== entry.trad) {
      const tradConfusions = generateTradConfusions(entry, maps);
      await supabase.from('dictionary_confusions').upsert({
        entry_id: entry.id,
        drill: 'trad',
        confusions: tradConfusions
      }, { onConflict: 'entry_id,drill' });
    }
    
    console.log(`✓ Confusions for ${entry.simp}`);
  }
}

function generateZhuyinConfusions(entry, maps) {
  // Use maps.tones to generate tone variants
  // Use maps.zhuyin_initials / zhuyin_finals for phonetic variants
  return { tone_variants: [], phonetic_variants: [] };
}

function generateTradConfusions(entry, maps) {
  const visual = maps.traditional_visual_confusion[entry.trad] || [];
  const phonetic = maps.traditional_phonetic_confusion[entry.trad] || [];
  return { visual, phonetic };
}

importConfusions();
```

## Environment Variables

### `.env.local` (Frontend)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### `.env.local` (Import Scripts)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Security:** Never commit `SUPABASE_SERVICE_ROLE_KEY` to git. It has admin privileges.

## Auth Setup

### Enable Email Auth
1. Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates (optional but recommended)

### Add Redirect URLs
1. Authentication → URL Configuration
2. Add:
   - `http://localhost:5173/**` (local dev)
   - `https://your-app.vercel.app/**` (production)

## Storage Setup (Future: V1.1+)

### Create Backup Bucket
```sql
-- Run in SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_backups', 'user_backups', false);

-- Add RLS policy for user_backups
CREATE POLICY user_backups_owner_policy ON storage.objects
  FOR ALL USING (
    bucket_id = 'user_backups' AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Troubleshooting

### RLS Blocks My Queries
If testing from SQL Editor and getting zero results:
```sql
-- Option 1: Temporarily disable RLS (testing only!)
ALTER TABLE kids DISABLE ROW LEVEL SECURITY;

-- Option 2: Use service role key in scripts
-- Option 3: Test from authenticated frontend where auth.uid() is set
```

### Dictionary Import Fails
```sql
-- Check for duplicate simp values
SELECT simp, COUNT(*) FROM dictionary_entries GROUP BY simp HAVING COUNT(*) > 1;

-- Clear and reimport
TRUNCATE dictionary_entries CASCADE;
-- Then re-run import script
```

### Migration Order Issues
Migrations must run in order (001, 002, ...). If you skip one:
```bash
# Reset database (CAUTION: Deletes all data)
supabase db reset

# Or manually reapply missed migration
```

## Maintenance

### Expanding Dictionary
1. Edit `data/dictionary_seed_v1.json` (add new entries)
2. Update version to `v1.1.0`, `v1.2.0`, etc.
3. Run import script with `upsert` (updates existing, adds new)
4. Create new migration `003_expand_dictionary.sql` documenting the expansion

### Monitoring Missing Entries
```sql
-- Weekly review: What characters are parents trying to add that aren't in dictionary?
SELECT simp, COUNT(*) as request_count
FROM dictionary_missing
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY simp
ORDER BY request_count DESC
LIMIT 20;
```

Add top-requested characters to next dictionary seed version.

### Backup & Restore
**Backup (future V1.1):**
```bash
# Automated via Supabase Storage in app code
# Manual: Dashboard → Database → Backups
```

**Restore:**
```bash
# Download backup SQL from Supabase Dashboard
psql -h db.your-project.supabase.co -U postgres -f backup.sql
```

## Support

- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **RLS Guide:** [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
- **Supabase CLI:** [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

---

> **Next Steps After Setup:**
> 1. Verify all tables and RLS policies via queries above
> 2. Test dictionary lookup from frontend Add Item form
> 3. Create first test kid and entry to validate flows
> 4. Monitor `dictionary_missing` table for coverage gaps
