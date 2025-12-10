/**
 * Dictionary Loading Utilities
 *
 * Shared utilities for loading and processing dictionary data files
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');

/**
 * Load both dictionary files (V1 and V2)
 * @returns {{ v1: Object, v2: Object }} Dictionary V1 and V2 data
 */
function loadDictionaries() {
  // Validate required files exist
  const requiredFiles = [
    'dictionary_seed_v1.json',
    'dictionary_expansion_v2.json'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: Required file not found: ${filePath}`);
      process.exit(1);
    }
  });

  const dictionaryV1 = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'dictionary_seed_v1.json'), 'utf-8')
  );
  const dictionaryV2 = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'dictionary_expansion_v2.json'), 'utf-8')
  );

  return { v1: dictionaryV1, v2: dictionaryV2 };
}

/**
 * Build a character lookup map from dictionary entries
 * @param {Object} dictionaryV1 - Dictionary V1 data
 * @param {Object} dictionaryV2 - Dictionary V2 data
 * @returns {Object} Lookup map with simplified characters as keys
 */
function buildCharacterLookup(dictionaryV1, dictionaryV2) {
  const lookup = {};
  [...dictionaryV1.entries, ...dictionaryV2.entries].forEach(entry => {
    lookup[entry.simp] = entry;
  });
  return lookup;
}

module.exports = {
  loadDictionaries,
  buildCharacterLookup
};
