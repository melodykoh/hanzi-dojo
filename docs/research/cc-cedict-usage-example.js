/**
 * CC-CEDICT Usage Example
 * Demonstrates how to fetch differentiated meanings for Chinese polyphones
 *
 * Installation:
 *   npm install node-cc-cedict
 *
 * Purpose:
 *   Show how to programmatically retrieve different meanings for characters
 *   with multiple pronunciations (e.g., 好 hǎo "good" vs 好 hào "to like")
 */

const cedict = require('node-cc-cedict');

// ============================================================================
// Example 1: Simple Character Lookup
// ============================================================================

function example1_simpleLookup() {
  console.log('\n=== Example 1: Simple Lookup for 好 ===\n');

  cedict.searchByChinese('好', function(entries) {
    entries.forEach((entry, index) => {
      console.log(`Entry ${index + 1}:`);
      console.log(`  Traditional: ${entry.traditional}`);
      console.log(`  Simplified: ${entry.simplified}`);
      console.log(`  Pinyin: ${entry.pinyin}`);
      console.log(`  English: ${entry.english}`);
      console.log('');
    });
  });
}

// ============================================================================
// Example 2: Processing Multiple Polyphones
// ============================================================================

function example2_batchProcessing() {
  console.log('\n=== Example 2: Batch Processing Polyphones ===\n');

  const polyphones = ['好', '长', '行', '乐', '了', '着'];

  // Helper to promisify the callback-based API
  function searchPromise(char) {
    return new Promise((resolve) => {
      cedict.searchByChinese(char, (entries) => {
        resolve(entries);
      });
    });
  }

  // Process all characters
  (async function() {
    for (const char of polyphones) {
      const entries = await searchPromise(char);

      console.log(`Character: ${char}`);
      entries.forEach(entry => {
        // Extract clean meanings (remove empty strings)
        const meanings = entry.english
          .split('/')
          .filter(m => m.trim().length > 0)
          .slice(0, 5); // Show first 5 meanings only

        console.log(`  [${entry.pinyin}] ${meanings.join('; ')}`);
      });
      console.log('');
    }
  })();
}

// ============================================================================
// Example 3: Filtering by Pinyin (for specific pronunciation)
// ============================================================================

function example3_filterByPinyin() {
  console.log('\n=== Example 3: Filter by Specific Pinyin ===\n');

  // Helper to promisify
  function searchPromise(char) {
    return new Promise((resolve) => {
      cedict.searchByChinese(char, (entries) => resolve(entries));
    });
  }

  // Normalize pinyin for comparison (remove tone numbers/marks)
  function normalizePinyin(pinyin) {
    return pinyin.toLowerCase().replace(/[0-9]/g, '').trim();
  }

  (async function() {
    // Get only the hao3 pronunciation of 好
    const entries = await searchPromise('好');
    const hao3Entry = entries.find(e => normalizePinyin(e.pinyin) === 'hao');

    if (hao3Entry) {
      console.log('Found 好 [hao3]:');
      console.log(`  Meanings: ${hao3Entry.english}`);
    }

    console.log('');

    // Get only the zhang3 pronunciation of 长
    const changEntries = await searchPromise('长');
    const zhang3Entry = changEntries.find(e => e.pinyin.includes('zhang3'));

    if (zhang3Entry) {
      console.log('Found 长 [zhang3]:');
      console.log(`  Meanings: ${zhang3Entry.english}`);
    }
  })();
}

// ============================================================================
// Example 4: Extract Structured Data (for database updates)
// ============================================================================

function example4_structuredExtraction() {
  console.log('\n=== Example 4: Extract Structured Data ===\n');

  function searchPromise(char) {
    return new Promise((resolve) => {
      cedict.searchByChinese(char, (entries) => resolve(entries));
    });
  }

  (async function() {
    const char = '长';
    const entries = await searchPromise(char);

    // Transform to structured format suitable for database
    const structuredData = entries.map(entry => {
      return {
        character: entry.simplified,
        traditional: entry.traditional,
        pinyin: entry.pinyin,
        meanings: entry.english
          .split('/')
          .filter(m => m.trim().length > 0)
          .map(m => m.trim()),
        rawEntry: entry.english
      };
    });

    console.log('Structured data for database update:');
    console.log(JSON.stringify(structuredData, null, 2));
  })();
}

// ============================================================================
// Example 5: Map Zhuyin to CC-CEDICT Pinyin (for Hanzi Dojo)
// ============================================================================

function example5_zhuyinToPinyinMapping() {
  console.log('\n=== Example 5: Zhuyin to Pinyin Mapping ===\n');

  // Sample mapping (you'll need a complete library for production)
  const zhuyinToPinyinMap = {
    'ㄏㄠˇ': 'hao3',
    'ㄏㄠˋ': 'hao4',
    'ㄔㄤˊ': 'chang2',
    'ㄓㄤˇ': 'zhang3',
    'ㄒㄧㄥˊ': 'xing2',
    'ㄏㄤˊ': 'hang2',
    'ㄌㄜˋ': 'le4',
    'ㄩㄝˋ': 'yue4'
  };

  function zhuyinToPinyin(zhuyin) {
    return zhuyinToPinyinMap[zhuyin] || null;
  }

  function searchPromise(char) {
    return new Promise((resolve) => {
      cedict.searchByChinese(char, (entries) => resolve(entries));
    });
  }

  (async function() {
    // Simulate Hanzi Dojo database record
    const dbRecord = {
      simplified: '好',
      zhuyin_variants: [
        { zhuyin: 'ㄏㄠˇ', context: ['很好', '好人'] },
        { zhuyin: 'ㄏㄠˋ', context: ['爱好', '好奇'] }
      ]
    };

    // Fetch all entries from CC-CEDICT
    const entries = await searchPromise(dbRecord.simplified);

    // Map each variant to its meanings
    for (const variant of dbRecord.zhuyin_variants) {
      const pinyin = zhuyinToPinyin(variant.zhuyin);

      // Find matching entry
      const matchedEntry = entries.find(e => e.pinyin === pinyin);

      if (matchedEntry) {
        variant.meanings = matchedEntry.english
          .split('/')
          .filter(m => m.trim().length > 0);

        console.log(`${dbRecord.simplified} [${variant.zhuyin}] = [${pinyin}]`);
        console.log(`  Meanings: ${variant.meanings.join(', ')}`);
        console.log(`  Context: ${variant.context.join(', ')}`);
        console.log('');
      }
    }

    console.log('Updated database record:');
    console.log(JSON.stringify(dbRecord, null, 2));
  })();
}

// ============================================================================
// Example 6: Handle Missing Entries
// ============================================================================

function example6_handleMissingEntries() {
  console.log('\n=== Example 6: Handle Missing/Rare Characters ===\n');

  function searchPromise(char) {
    return new Promise((resolve) => {
      cedict.searchByChinese(char, (entries) => resolve(entries));
    });
  }

  (async function() {
    const testChars = ['好', '僾', '㑇']; // Mix of common and rare

    for (const char of testChars) {
      const entries = await searchPromise(char);

      if (entries.length === 0) {
        console.log(`⚠️  No entries found for: ${char}`);
        console.log('   Strategy: Keep existing meanings or mark for manual review');
      } else {
        console.log(`✓ Found ${entries.length} entries for: ${char}`);
      }
      console.log('');
    }
  })();
}

// ============================================================================
// Run All Examples
// ============================================================================

console.log('CC-CEDICT Usage Examples');
console.log('========================');

// Uncomment to run individual examples:
// example1_simpleLookup();
// example2_batchProcessing();
// example3_filterByPinyin();
// example4_structuredExtraction();
// example5_zhuyinToPinyinMapping();
// example6_handleMissingEntries();

// Run all examples in sequence
setTimeout(() => example1_simpleLookup(), 100);
setTimeout(() => example2_batchProcessing(), 500);
setTimeout(() => example3_filterByPinyin(), 3000);
setTimeout(() => example4_structuredExtraction(), 4000);
setTimeout(() => example5_zhuyinToPinyinMapping(), 5000);
setTimeout(() => example6_handleMissingEntries(), 6000);

// ============================================================================
// Usage Notes
// ============================================================================

/*
 * KEY TAKEAWAYS:
 *
 * 1. CC-CEDICT separates entries by pronunciation
 *    - Same character gets multiple entries
 *    - Each entry has distinct pinyin and meanings
 *
 * 2. node-cc-cedict auto-handles traditional/simplified
 *    - Detects which variant you're searching
 *    - Returns all matching entries
 *
 * 3. For Hanzi Dojo integration:
 *    - Convert Zhuyin → Pinyin (need separate library)
 *    - Match by pinyin to get correct meanings
 *    - Update zhuyin_variants.meanings field
 *
 * 4. Edge cases to handle:
 *    - Characters not in CC-CEDICT (rare chars)
 *    - Pinyin normalization (tone marks)
 *    - Multiple pinyin formats (u: vs ü)
 *
 * 5. Alternative approach (if node-cc-cedict doesn't work):
 *    - Download raw CC-CEDICT file
 *    - Use parse-cc-cedict to parse it
 *    - Build custom lookup logic
 */
