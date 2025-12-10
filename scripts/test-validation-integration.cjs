#!/usr/bin/env node
/**
 * Integration test: Verify validation prevents malformed JSONB in migrations
 * 
 * This simulates the migration generation workflow and ensures validation
 * catches errors BEFORE SQL is generated.
 */

const { pinyinToZhuyinArray } = require('./lib/pinyinToZhuyinMapping.cjs');
const { validateVariants } = require('./lib/validation.cjs');
const { escapeSql } = require('./lib/sqlUtils.cjs');

console.log('Testing migration generation workflow with validation...\n');

// Test 1: Valid data should pass through
console.log('Test 1: Valid data');
try {
  const char = '好';
  const variants = [
    { pinyin: 'hǎo', zhuyin: pinyinToZhuyinArray('hǎo'), context_words: ['你好'] },
    { pinyin: 'hào', zhuyin: pinyinToZhuyinArray('hào'), context_words: ['爱好'] }
  ];
  
  validateVariants(variants, char);
  const json = JSON.stringify(variants);
  const escaped = escapeSql(json);
  
  console.log(`✓ Valid data generated SQL successfully`);
  console.log(`  Character: ${char}`);
  console.log(`  Variants: ${variants.length}`);
  console.log(`  JSONB size: ${json.length} chars\n`);
} catch (error) {
  console.error(`✗ Unexpected failure: ${error.message}\n`);
  process.exit(1);
}

// Test 2: Malformed data (empty pinyin) should be caught
console.log('Test 2: Malformed data (empty pinyin)');
try {
  const char = '测';
  const variants = [
    { pinyin: '', zhuyin: pinyinToZhuyinArray('cè'), context_words: [] }
  ];
  
  validateVariants(variants, char);
  const json = JSON.stringify(variants);
  
  console.error(`✗ Validation failed to catch empty pinyin\n`);
  process.exit(1);
} catch (error) {
  console.log(`✓ Validation caught error: ${error.message}\n`);
}

// Test 3: Malformed data (string zhuyin) should be caught
console.log('Test 3: Malformed data (string zhuyin instead of array)');
try {
  const char = '试';
  const variants = [
    { pinyin: 'shì', zhuyin: 'ㄕˋ', context_words: [] } // String instead of array
  ];
  
  validateVariants(variants, char);
  const json = JSON.stringify(variants);
  
  console.error(`✗ Validation failed to catch non-array zhuyin\n`);
  process.exit(1);
} catch (error) {
  console.log(`✓ Validation caught error: ${error.message}\n`);
}

// Test 4: TODO placeholder should be caught
console.log('Test 4: TODO placeholder in zhuyin');
try {
  const char = '验';
  const variants = [
    { pinyin: 'yàn', zhuyin: ['TODO'], context_words: [] }
  ];
  
  validateVariants(variants, char);
  const json = JSON.stringify(variants);
  
  console.error(`✗ Validation failed to catch TODO placeholder\n`);
  process.exit(1);
} catch (error) {
  console.log(`✓ Validation caught error: ${error.message}\n`);
}

// Test 5: Empty zhuyin array should be caught
console.log('Test 5: Empty zhuyin array');
try {
  const char = '证';
  const variants = [
    { pinyin: 'zhèng', zhuyin: [], context_words: [] }
  ];
  
  validateVariants(variants, char);
  const json = JSON.stringify(variants);
  
  console.error(`✗ Validation failed to catch empty zhuyin array\n`);
  process.exit(1);
} catch (error) {
  console.log(`✓ Validation caught error: ${error.message}\n`);
}

console.log('━'.repeat(60));
console.log('✓ All integration tests passed!');
console.log('━'.repeat(60));
console.log('\nValidation successfully prevents malformed JSONB from reaching');
console.log('the database. Migration generators are protected against:');
console.log('  - Empty/missing pinyin');
console.log('  - Non-array zhuyin structures');
console.log('  - Empty zhuyin arrays');
console.log('  - TODO placeholders');
console.log('  - Invalid context_words');
