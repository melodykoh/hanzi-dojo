#!/usr/bin/env node
/**
 * Test suite for validation.cjs
 * 
 * Run with: node scripts/lib/validation.test.cjs
 */

const { validateVariant, validateVariants } = require('./validation.cjs');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function expectThrow(fn, errorMatch) {
  try {
    fn();
    throw new Error('Expected function to throw');
  } catch (e) {
    if (!e.message.includes(errorMatch)) {
      throw new Error(`Expected error to include "${errorMatch}", got: ${e.message}`);
    }
  }
}

// validateVariant tests
test('validateVariant: accepts valid variant', () => {
  validateVariant({ 
    pinyin: 'zhāo', 
    zhuyin: ['ㄓ', 'ㄠ'], 
    context_words: ['朝阳'] 
  }, '朝');
});

test('validateVariant: accepts empty context_words', () => {
  validateVariant({ 
    pinyin: 'zhāo', 
    zhuyin: ['ㄓ', 'ㄠ'], 
    context_words: [] 
  }, '朝');
});

test('validateVariant: rejects empty pinyin', () => {
  expectThrow(
    () => validateVariant({ pinyin: '', zhuyin: ['ㄓ'], context_words: [] }, '朝'),
    'Invalid pinyin'
  );
});

test('validateVariant: rejects missing pinyin', () => {
  expectThrow(
    () => validateVariant({ zhuyin: ['ㄓ'], context_words: [] }, '朝'),
    'Invalid pinyin'
  );
});

test('validateVariant: rejects non-array zhuyin', () => {
  expectThrow(
    () => validateVariant({ pinyin: 'zhāo', zhuyin: 'ㄓㄠ', context_words: [] }, '朝'),
    'Invalid zhuyin structure'
  );
});

test('validateVariant: rejects empty zhuyin array', () => {
  expectThrow(
    () => validateVariant({ pinyin: 'zhāo', zhuyin: [], context_words: [] }, '朝'),
    'zhuyin array is empty'
  );
});

test('validateVariant: rejects TODO placeholder in zhuyin', () => {
  expectThrow(
    () => validateVariant({ pinyin: 'zhāo', zhuyin: ['TODO'], context_words: [] }, '朝'),
    'TODO placeholder'
  );
});

test('validateVariant: rejects non-array context_words', () => {
  expectThrow(
    () => validateVariant({ pinyin: 'zhāo', zhuyin: ['ㄓ'], context_words: null }, '朝'),
    'context_words must be array'
  );
});

// validateVariants tests
test('validateVariants: accepts valid variants array', () => {
  validateVariants([
    { pinyin: 'zhāo', zhuyin: ['ㄓ', 'ㄠ'], context_words: ['朝阳'] },
    { pinyin: 'cháo', zhuyin: ['ㄔ', 'ㄠˊ'], context_words: ['朝代'] }
  ], '朝');
});

test('validateVariants: rejects non-array', () => {
  expectThrow(
    () => validateVariants({}, '朝'),
    'Variants must be an array'
  );
});

test('validateVariants: rejects empty array', () => {
  expectThrow(
    () => validateVariants([], '朝'),
    'Variants array is empty'
  );
});

test('validateVariants: rejects invalid variant in array', () => {
  expectThrow(
    () => validateVariants([
      { pinyin: 'zhāo', zhuyin: ['ㄓ', 'ㄠ'], context_words: [] },
      { pinyin: '', zhuyin: ['ㄔ'], context_words: [] }
    ], '朝'),
    'Variant 2/2'
  );
});

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
