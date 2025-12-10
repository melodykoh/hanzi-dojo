/**
 * Validation Utility Functions
 *
 * Validates data structures before insertion into database
 */

/**
 * Validate a zhuyin_variants variant object before JSONB insertion
 *
 * Ensures:
 * - pinyin is a non-empty string
 * - zhuyin is a non-empty array
 * - context_words is an array (can be empty)
 * - No TODO placeholders in zhuyin
 *
 * @param {object} variant - The variant object to validate
 * @param {string} char - Character being validated (for error messages)
 * @throws {Error} If validation fails
 * @returns {boolean} True if valid
 */
function validateVariant(variant, char) {
  // Validate pinyin
  if (!variant.pinyin || typeof variant.pinyin !== 'string') {
    throw new Error(`Invalid pinyin for ${char}: expected non-empty string, got ${typeof variant.pinyin}`);
  }

  // Validate zhuyin
  if (!Array.isArray(variant.zhuyin)) {
    throw new Error(`Invalid zhuyin structure for ${char}: expected array, got ${typeof variant.zhuyin}`);
  }
  if (variant.zhuyin.length === 0) {
    throw new Error(`Invalid zhuyin structure for ${char}: zhuyin array is empty`);
  }

  // Validate context_words
  if (!Array.isArray(variant.context_words)) {
    throw new Error(`context_words must be array for ${char}: got ${typeof variant.context_words}`);
  }

  // Check for TODO placeholders
  const zhuyinStr = JSON.stringify(variant.zhuyin);
  if (zhuyinStr.includes('TODO')) {
    throw new Error(`Incomplete zhuyin for ${char} (${variant.pinyin}): contains TODO placeholder`);
  }

  return true;
}

/**
 * Validate an array of variants
 *
 * @param {Array} variants - Array of variant objects
 * @param {string} char - Character being validated (for error messages)
 * @throws {Error} If any variant is invalid
 * @returns {boolean} True if all valid
 */
function validateVariants(variants, char) {
  if (!Array.isArray(variants)) {
    throw new Error(`Variants must be an array for ${char}: got ${typeof variants}`);
  }

  if (variants.length === 0) {
    throw new Error(`Variants array is empty for ${char}`);
  }

  variants.forEach((variant, index) => {
    try {
      validateVariant(variant, char);
    } catch (error) {
      throw new Error(`Variant ${index + 1}/${variants.length} for ${char}: ${error.message}`);
    }
  });

  return true;
}

module.exports = {
  validateVariant,
  validateVariants
};
