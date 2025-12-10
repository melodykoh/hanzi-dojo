#!/usr/bin/env node
/**
 * Dictionary Data Quality Audit Script
 *
 * Runs comprehensive audit queries against the dictionary to identify:
 * - P1: Data corruption (TODO placeholders, malformed structures)
 * - P2: Incorrect data (duplicate meanings, wrong values)
 * - P3: Missing data (empty fields that should have values)
 *
 * Usage: node --env-file=.env.local scripts/audit-dictionary-quality.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const AUDITS = [
  {
    id: 'todo-placeholders',
    name: 'TODO Placeholders in Data',
    severity: 'P1',
    description: 'Incomplete data with TODO markers that slipped through validation',
    query: `
      SELECT simp, trad, zhuyin_variants
      FROM dictionary_entries
      WHERE zhuyin_variants::text LIKE '%TODO%'
    `
  },
  {
    id: 'empty-zhuyin-middle',
    name: 'Empty Zhuyin Middle Component',
    severity: 'P1',
    description: 'Zhuyin arrays with empty string in middle position',
    query: `
      SELECT simp, trad, v->>'pinyin' as pinyin, v->'zhuyin' as zhuyin
      FROM dictionary_entries,
           jsonb_array_elements(zhuyin_variants) v
      WHERE zhuyin_variants IS NOT NULL
        AND v->'zhuyin'->0->>1 = ''
    `
  },
  {
    id: 'duplicate-meanings',
    name: 'Duplicate Meanings Across Variants',
    severity: 'P2',
    description: 'Multi-pronunciation characters where all variants have identical meanings',
    query: `
      SELECT simp, trad,
             jsonb_array_length(zhuyin_variants) as variant_count,
             zhuyin_variants->0->>'meanings' as meanings_sample
      FROM dictionary_entries
      WHERE zhuyin_variants IS NOT NULL
        AND jsonb_array_length(zhuyin_variants) > 1
        AND (
          SELECT COUNT(DISTINCT v->>'meanings')
          FROM jsonb_array_elements(zhuyin_variants) v
        ) = 1
    `
  },
  {
    id: 'empty-meanings',
    name: 'Empty Meanings Arrays',
    severity: 'P3',
    description: 'Variants with empty meanings arrays',
    query: `
      SELECT simp, trad, v->>'pinyin' as pinyin
      FROM dictionary_entries,
           jsonb_array_elements(zhuyin_variants) v
      WHERE zhuyin_variants IS NOT NULL
        AND (v->'meanings' = '[]'::jsonb OR v->'meanings' IS NULL)
    `
  },
  {
    id: 'empty-alternate-context',
    name: 'Non-Default Pronunciations Missing Context',
    severity: 'P2',
    description: 'Alternate pronunciations (not first) with empty context_words',
    query: `
      SELECT simp, trad, v->>'pinyin' as pinyin, idx as position
      FROM dictionary_entries,
           jsonb_array_elements(zhuyin_variants) WITH ORDINALITY arr(v, idx)
      WHERE zhuyin_variants IS NOT NULL
        AND idx > 1
        AND (v->'context_words' = '[]'::jsonb OR v->'context_words' IS NULL)
    `
  },
  {
    id: 'variant-count-distribution',
    name: 'Variant Count Distribution',
    severity: 'INFO',
    description: 'Distribution of pronunciation variant counts',
    query: `
      SELECT
        jsonb_array_length(zhuyin_variants) as variant_count,
        COUNT(*) as char_count,
        array_agg(simp ORDER BY simp) as characters
      FROM dictionary_entries
      WHERE zhuyin_variants IS NOT NULL
      GROUP BY jsonb_array_length(zhuyin_variants)
      ORDER BY variant_count DESC
    `
  },
  {
    id: 'total-coverage',
    name: 'Total Dictionary Coverage',
    severity: 'INFO',
    description: 'Overall dictionary statistics',
    query: `
      SELECT
        COUNT(*) as total_entries,
        COUNT(CASE WHEN zhuyin_variants IS NOT NULL THEN 1 END) as with_variants,
        COUNT(CASE WHEN zhuyin_variants IS NULL THEN 1 END) as without_variants
      FROM dictionary_entries
    `
  }
];

async function runAudit(audit) {
  console.log(`\nRunning: ${audit.name} (${audit.severity})...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: audit.query });

    if (error) {
      // Fallback: try direct query for simpler cases
      const { data: directData, error: directError } = await supabase
        .from('dictionary_entries')
        .select('simp, trad, zhuyin_variants')
        .not('zhuyin_variants', 'is', null)
        .limit(1000);

      if (directError) {
        return { ...audit, error: error.message, results: [] };
      }

      // Process based on audit type
      return { ...audit, error: 'RPC not available, using fallback', results: directData || [] };
    }

    return { ...audit, results: data || [] };
  } catch (e) {
    return { ...audit, error: e.message, results: [] };
  }
}

async function runAllAudits() {
  console.log('='.repeat(60));
  console.log('DICTIONARY DATA QUALITY AUDIT');
  console.log('='.repeat(60));
  console.log(`Date: ${new Date().toISOString()}`);

  // Get all entries with variants for local analysis
  const { data: entries, error } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin_variants, meanings, pinyin')
    .not('zhuyin_variants', 'is', null);

  if (error) {
    console.error('Failed to fetch dictionary entries:', error.message);
    process.exit(1);
  }

  console.log(`\nLoaded ${entries.length} entries with zhuyin_variants`);

  const results = {
    timestamp: new Date().toISOString(),
    total_entries_with_variants: entries.length,
    findings: {}
  };

  // Audit 1: TODO placeholders
  const todoFindings = entries.filter(e =>
    JSON.stringify(e.zhuyin_variants).includes('TODO')
  );
  results.findings['todo-placeholders'] = {
    severity: 'P1',
    count: todoFindings.length,
    items: todoFindings.map(e => ({ simp: e.simp, trad: e.trad }))
  };
  console.log(`\n[P1] TODO Placeholders: ${todoFindings.length}`);

  // Audit 2: Empty zhuyin middle component
  const emptyMiddleFindings = [];
  entries.forEach(e => {
    e.zhuyin_variants.forEach(v => {
      if (v.zhuyin && v.zhuyin[0] && v.zhuyin[0][1] === '') {
        emptyMiddleFindings.push({ simp: e.simp, trad: e.trad, pinyin: v.pinyin });
      }
    });
  });
  results.findings['empty-zhuyin-middle'] = {
    severity: 'P1',
    count: emptyMiddleFindings.length,
    items: emptyMiddleFindings
  };
  console.log(`[P1] Empty Zhuyin Middle: ${emptyMiddleFindings.length}`);

  // Audit 3: Duplicate meanings
  const duplicateMeaningsFindings = entries.filter(e => {
    if (e.zhuyin_variants.length <= 1) return false;
    const meanings = e.zhuyin_variants.map(v => JSON.stringify(v.meanings || []));
    return new Set(meanings).size === 1 && meanings[0] !== '[]';
  });
  results.findings['duplicate-meanings'] = {
    severity: 'P2',
    count: duplicateMeaningsFindings.length,
    items: duplicateMeaningsFindings.map(e => ({
      simp: e.simp,
      trad: e.trad,
      variant_count: e.zhuyin_variants.length,
      meanings: e.zhuyin_variants[0]?.meanings || []
    }))
  };
  console.log(`[P2] Duplicate Meanings: ${duplicateMeaningsFindings.length}`);

  // Audit 4: Empty meanings
  const emptyMeaningsFindings = [];
  entries.forEach(e => {
    e.zhuyin_variants.forEach(v => {
      if (!v.meanings || v.meanings.length === 0) {
        emptyMeaningsFindings.push({ simp: e.simp, trad: e.trad, pinyin: v.pinyin });
      }
    });
  });
  results.findings['empty-meanings'] = {
    severity: 'P3',
    count: emptyMeaningsFindings.length,
    items: emptyMeaningsFindings.slice(0, 50), // Limit for readability
    total: emptyMeaningsFindings.length
  };
  console.log(`[P3] Empty Meanings: ${emptyMeaningsFindings.length}`);

  // Audit 5: Non-default with empty context
  const emptyContextFindings = [];
  entries.forEach(e => {
    e.zhuyin_variants.forEach((v, idx) => {
      if (idx > 0 && (!v.context_words || v.context_words.length === 0)) {
        emptyContextFindings.push({ simp: e.simp, trad: e.trad, pinyin: v.pinyin, position: idx + 1 });
      }
    });
  });
  results.findings['empty-alternate-context'] = {
    severity: 'P2',
    count: emptyContextFindings.length,
    items: emptyContextFindings
  };
  console.log(`[P2] Empty Alternate Context: ${emptyContextFindings.length}`);

  // Audit 6: Variant count distribution
  const variantCounts = {};
  entries.forEach(e => {
    const count = e.zhuyin_variants.length;
    if (!variantCounts[count]) variantCounts[count] = [];
    variantCounts[count].push(e.simp);
  });
  results.findings['variant-distribution'] = {
    severity: 'INFO',
    distribution: Object.entries(variantCounts).map(([count, chars]) => ({
      variant_count: parseInt(count),
      char_count: chars.length,
      sample: chars.slice(0, 10)
    })).sort((a, b) => b.variant_count - a.variant_count)
  };
  console.log(`[INFO] Variant Distribution: ${Object.keys(variantCounts).length} different counts`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const p1Count = (results.findings['todo-placeholders']?.count || 0) +
                  (results.findings['empty-zhuyin-middle']?.count || 0);
  const p2Count = (results.findings['duplicate-meanings']?.count || 0) +
                  (results.findings['empty-alternate-context']?.count || 0);
  const p3Count = results.findings['empty-meanings']?.count || 0;

  console.log(`P1 (Critical):  ${p1Count} issues`);
  console.log(`P2 (Important): ${p2Count} issues`);
  console.log(`P3 (Minor):     ${p3Count} issues`);
  console.log(`Total:          ${p1Count + p2Count + p3Count} issues`);

  results.summary = { p1: p1Count, p2: p2Count, p3: p3Count, total: p1Count + p2Count + p3Count };

  // Save results
  const outputPath = path.join(__dirname, '..', 'data', `audit-results-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);

  return results;
}

runAllAudits().catch(console.error);
