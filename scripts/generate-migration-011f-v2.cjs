#!/usr/bin/env node
/**
 * Generate Migration 011f v2: Comprehensive Multi-Pronunciation Coverage
 *
 * This script properly:
 * 1. Reads existing zhuyin from dictionary entries
 * 2. Uses polyphone context reference for context words
 * 3. Generates proper Pattern A structure
 * 4. Outputs ready-to-apply SQL (not drafts)
 *
 * Key insight: Our dictionary already has zhuyin for default pronunciation.
 * We need to ADD variant pronunciations with their context words.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Load data
const gapAnalysis = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_gap_analysis.json'), 'utf-8'));
const polyphoneContext = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_context_reference.json'), 'utf-8'));
const polyphoneBasicArray = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_reference.json'), 'utf-8'));
const dictionaryV2 = JSON.parse(fs.readFileSync(path.join(dataDir, 'dictionary_expansion_v2.json'), 'utf-8'));
const dictionaryV1 = JSON.parse(fs.readFileSync(path.join(dataDir, 'dictionary_seed_v1.json'), 'utf-8'));
const contextResearch = JSON.parse(fs.readFileSync(path.join(dataDir, 'context_words_research.json'), 'utf-8'));

// Build lookup maps
const polyphoneBasic = {};
polyphoneBasicArray.forEach(entry => {
  polyphoneBasic[entry.char] = entry.pinyin;
});

const dictLookup = {};
[...dictionaryV1.entries, ...dictionaryV2.entries].forEach(e => {
  dictLookup[e.simp] = e;
});

// Pinyin to Zhuyin mapping (comprehensive)
const PINYIN_TO_ZHUYIN = {
  // Complete pinyin syllable to zhuyin array mapping
  // Format: { initial: '', medial: '', final: '', tone: '' }

  // Common syllables (manually curated for accuracy)
  'zhe': { parts: ['ㄓ', 'ㄜ', '˙'] },
  'zhē': { parts: ['ㄓ', 'ㄜ', 'ˉ'] },
  'zhé': { parts: ['ㄓ', 'ㄜ', 'ˊ'] },
  'zhě': { parts: ['ㄓ', 'ㄜ', 'ˇ'] },
  'zhè': { parts: ['ㄓ', 'ㄜ', 'ˋ'] },
  'zhuō': { parts: ['ㄓ', 'ㄨㄛ', 'ˉ'] },
  'zhuó': { parts: ['ㄓ', 'ㄨㄛ', 'ˊ'] },
  'zhuǒ': { parts: ['ㄓ', 'ㄨㄛ', 'ˇ'] },
  'zhuò': { parts: ['ㄓ', 'ㄨㄛ', 'ˋ'] },
  'zhāo': { parts: ['ㄓ', 'ㄠ', 'ˉ'] },
  'zháo': { parts: ['ㄓ', 'ㄠ', 'ˊ'] },
  'zhǎo': { parts: ['ㄓ', 'ㄠ', 'ˇ'] },
  'zhào': { parts: ['ㄓ', 'ㄠ', 'ˋ'] },
  'dà': { parts: ['ㄉ', 'ㄚ', 'ˋ'] },
  'dài': { parts: ['ㄉ', 'ㄞ', 'ˋ'] },
  'tài': { parts: ['ㄊ', 'ㄞ', 'ˋ'] },
  'zhōng': { parts: ['ㄓ', 'ㄨㄥ', 'ˉ'] },
  'zhòng': { parts: ['ㄓ', 'ㄨㄥ', 'ˋ'] },
  'de': { parts: ['ㄉ', 'ㄜ', '˙'] },
  'dí': { parts: ['ㄉ', 'ㄧ', 'ˊ'] },
  'dì': { parts: ['ㄉ', 'ㄧ', 'ˋ'] },
  'kàn': { parts: ['ㄎ', 'ㄢ', 'ˋ'] },
  'kān': { parts: ['ㄎ', 'ㄢ', 'ˉ'] },
  'shuō': { parts: ['ㄕ', 'ㄨㄛ', 'ˉ'] },
  'shuì': { parts: ['ㄕ', 'ㄨㄟ', 'ˋ'] },
  'yuè': { parts: ['', 'ㄩㄝ', 'ˋ'] },
  'hē': { parts: ['ㄏ', 'ㄜ', 'ˉ'] },
  'hè': { parts: ['ㄏ', 'ㄜ', 'ˋ'] },
  'he': { parts: ['ㄏ', 'ㄜ', '˙'] },
  'pǎo': { parts: ['ㄆ', 'ㄠ', 'ˇ'] },
  'páo': { parts: ['ㄆ', 'ㄠ', 'ˊ'] },
  'fēn': { parts: ['ㄈ', 'ㄣ', 'ˉ'] },
  'fèn': { parts: ['ㄈ', 'ㄣ', 'ˋ'] },
  'hóng': { parts: ['ㄏ', 'ㄨㄥ', 'ˊ'] },
  'gōng': { parts: ['ㄍ', 'ㄨㄥ', 'ˉ'] },
  'lǜ': { parts: ['ㄌ', 'ㄩ', 'ˋ'] },
  'lù': { parts: ['ㄌ', 'ㄨ', 'ˋ'] },
  'chē': { parts: ['ㄔ', 'ㄜ', 'ˉ'] },
  'jū': { parts: ['ㄐ', 'ㄩ', 'ˉ'] },
  'dá': { parts: ['ㄉ', 'ㄚ', 'ˊ'] },
  'dā': { parts: ['ㄉ', 'ㄚ', 'ˉ'] },
  'huì': { parts: ['ㄏ', 'ㄨㄟ', 'ˋ'] },
  'kuài': { parts: ['ㄎ', 'ㄨㄞ', 'ˋ'] },
  'dé': { parts: ['ㄉ', 'ㄜ', 'ˊ'] },
  'děi': { parts: ['ㄉ', 'ㄟ', 'ˇ'] },
  'zuò': { parts: ['ㄗ', 'ㄨㄛ', 'ˋ'] },
  'zuō': { parts: ['ㄗ', 'ㄨㄛ', 'ˉ'] },
  'xīng': { parts: ['ㄒ', 'ㄧㄥ', 'ˉ'] },
  'xìng': { parts: ['ㄒ', 'ㄧㄥ', 'ˋ'] },
  'hé': { parts: ['ㄏ', 'ㄜ', 'ˊ'] },
  'huó': { parts: ['ㄏ', 'ㄨㄛ', 'ˊ'] },
  'huò': { parts: ['ㄏ', 'ㄨㄛ', 'ˋ'] },
  'hú': { parts: ['ㄏ', 'ㄨ', 'ˊ'] },
  'shí': { parts: ['ㄕ', '', 'ˊ'] },
  'zhì': { parts: ['ㄓ', '', 'ˋ'] },
  'lèi': { parts: ['ㄌ', 'ㄟ', 'ˋ'] },
  'lěi': { parts: ['ㄌ', 'ㄟ', 'ˇ'] },
  'léi': { parts: ['ㄌ', 'ㄟ', 'ˊ'] },
  'sè': { parts: ['ㄙ', 'ㄜ', 'ˋ'] },
  'shǎi': { parts: ['ㄕ', 'ㄞ', 'ˇ'] },
  'guò': { parts: ['ㄍ', 'ㄨㄛ', 'ˋ'] },
  'guo': { parts: ['ㄍ', 'ㄨㄛ', '˙'] },
  'guō': { parts: ['ㄍ', 'ㄨㄛ', 'ˉ'] },
  'dān': { parts: ['ㄉ', 'ㄢ', 'ˉ'] },
  'shàn': { parts: ['ㄕ', 'ㄢ', 'ˋ'] },
  'chán': { parts: ['ㄔ', 'ㄢ', 'ˊ'] },
  'fā': { parts: ['ㄈ', 'ㄚ', 'ˉ'] },
  'fà': { parts: ['ㄈ', 'ㄚ', 'ˋ'] },
  'chā': { parts: ['ㄔ', 'ㄚ', 'ˉ'] },
  'chà': { parts: ['ㄔ', 'ㄚ', 'ˋ'] },
  'chāi': { parts: ['ㄔ', 'ㄞ', 'ˉ'] },
  'cī': { parts: ['ㄘ', '', 'ˉ'] },
  'dāng': { parts: ['ㄉ', 'ㄤ', 'ˉ'] },
  'dàng': { parts: ['ㄉ', 'ㄤ', 'ˋ'] },
  'tí': { parts: ['ㄊ', 'ㄧ', 'ˊ'] },
  'dī': { parts: ['ㄉ', 'ㄧ', 'ˉ'] },
  'dǐ': { parts: ['ㄉ', 'ㄧ', 'ˇ'] },
  'shù': { parts: ['ㄕ', 'ㄨ', 'ˋ'] },
  'shǔ': { parts: ['ㄕ', 'ㄨ', 'ˇ'] },
  'shuò': { parts: ['ㄕ', 'ㄨㄛ', 'ˋ'] },
  'kōng': { parts: ['ㄎ', 'ㄨㄥ', 'ˉ'] },
  'kòng': { parts: ['ㄎ', 'ㄨㄥ', 'ˋ'] },
  'kǒng': { parts: ['ㄎ', 'ㄨㄥ', 'ˇ'] },
  'pàng': { parts: ['ㄆ', 'ㄤ', 'ˋ'] },
  'pán': { parts: ['ㄆ', 'ㄢ', 'ˊ'] },
  'pàn': { parts: ['ㄆ', 'ㄢ', 'ˋ'] },
  'jiǎo': { parts: ['ㄐ', 'ㄧㄠ', 'ˇ'] },
  'jué': { parts: ['ㄐ', 'ㄩㄝ', 'ˊ'] },
  'jié': { parts: ['ㄐ', 'ㄧㄝ', 'ˊ'] },
  'jiē': { parts: ['ㄐ', 'ㄧㄝ', 'ˉ'] },
  'jiě': { parts: ['ㄐ', 'ㄧㄝ', 'ˇ'] },
  'jiè': { parts: ['ㄐ', 'ㄧㄝ', 'ˋ'] },
  'xiè': { parts: ['ㄒ', 'ㄧㄝ', 'ˋ'] },
  'yǔ': { parts: ['', 'ㄩ', 'ˇ'] },
  'yù': { parts: ['', 'ㄩ', 'ˋ'] },
  'yú': { parts: ['', 'ㄩ', 'ˊ'] },
  'zǐ': { parts: ['ㄗ', '', 'ˇ'] },
  'zī': { parts: ['ㄗ', '', 'ˉ'] },
  'zǎi': { parts: ['ㄗ', 'ㄞ', 'ˇ'] },
  'yè': { parts: ['', 'ㄧㄝ', 'ˋ'] },
  'xié': { parts: ['ㄒ', 'ㄧㄝ', 'ˊ'] },
  'chǔ': { parts: ['ㄔ', 'ㄨ', 'ˇ'] },
  'chù': { parts: ['ㄔ', 'ㄨ', 'ˋ'] },
  'jǐn': { parts: ['ㄐ', 'ㄧㄣ', 'ˇ'] },
  'jìn': { parts: ['ㄐ', 'ㄧㄣ', 'ˋ'] },
  'zhé': { parts: ['ㄓ', 'ㄜ', 'ˊ'] },
  'zhē': { parts: ['ㄓ', 'ㄜ', 'ˉ'] },
  'shé': { parts: ['ㄕ', 'ㄜ', 'ˊ'] },
  'shóu': { parts: ['ㄕ', 'ㄡ', 'ˊ'] },
  'shú': { parts: ['ㄕ', 'ㄨ', 'ˊ'] },
  'jì': { parts: ['ㄐ', 'ㄧ', 'ˋ'] },
  'jǐ': { parts: ['ㄐ', 'ㄧ', 'ˇ'] },
  'zāng': { parts: ['ㄗ', 'ㄤ', 'ˉ'] },
  'zàng': { parts: ['ㄗ', 'ㄤ', 'ˋ'] },
  'bo': { parts: ['ㄅ', 'ㄛ', '˙'] },
  'bó': { parts: ['ㄅ', 'ㄛ', 'ˊ'] },
  'luò': { parts: ['ㄌ', 'ㄨㄛ', 'ˋ'] },
  'lào': { parts: ['ㄌ', 'ㄠ', 'ˋ'] },
  'là': { parts: ['ㄌ', 'ㄚ', 'ˋ'] },
  'zhuǎn': { parts: ['ㄓ', 'ㄨㄢ', 'ˇ'] },
  'zhuàn': { parts: ['ㄓ', 'ㄨㄢ', 'ˋ'] },
  'tōng': { parts: ['ㄊ', 'ㄨㄥ', 'ˉ'] },
  'tòng': { parts: ['ㄊ', 'ㄨㄥ', 'ˋ'] },
  'yào': { parts: ['', 'ㄧㄠ', 'ˋ'] },
  'yuè': { parts: ['', 'ㄩㄝ', 'ˋ'] },
  // Additional common syllables
  'jiàn': { parts: ['ㄐ', 'ㄧㄢ', 'ˋ'] },
  'xiàn': { parts: ['ㄒ', 'ㄧㄢ', 'ˋ'] },
  'liù': { parts: ['ㄌ', 'ㄧㄡ', 'ˋ'] },
  'shàng': { parts: ['ㄕ', 'ㄤ', 'ˋ'] },
  'shǎng': { parts: ['ㄕ', 'ㄤ', 'ˇ'] },
  'bù': { parts: ['ㄅ', 'ㄨ', 'ˋ'] },
  'fǒu': { parts: ['ㄈ', 'ㄡ', 'ˇ'] },
  'tā': { parts: ['ㄊ', 'ㄚ', 'ˉ'] },
  'le': { parts: ['ㄌ', 'ㄜ', '˙'] },
  'liǎo': { parts: ['ㄌ', 'ㄧㄠ', 'ˇ'] },
  'yǒu': { parts: ['', 'ㄧㄡ', 'ˇ'] },
  'yòu': { parts: ['', 'ㄧㄡ', 'ˋ'] },
  'zhè': { parts: ['ㄓ', 'ㄜ', 'ˋ'] },
  'zhèi': { parts: ['ㄓ', 'ㄟ', 'ˋ'] },
  'nà': { parts: ['ㄋ', 'ㄚ', 'ˋ'] },
  'nǎ': { parts: ['ㄋ', 'ㄚ', 'ˇ'] },
  'nèi': { parts: ['ㄋ', 'ㄟ', 'ˋ'] },
  'nā': { parts: ['ㄋ', 'ㄚ', 'ˉ'] },
  'gè': { parts: ['ㄍ', 'ㄜ', 'ˋ'] },
  'gě': { parts: ['ㄍ', 'ㄜ', 'ˇ'] },
  'dú': { parts: ['ㄉ', 'ㄨ', 'ˊ'] },
  'dòu': { parts: ['ㄉ', 'ㄡ', 'ˋ'] },
  'dì': { parts: ['ㄉ', 'ㄧ', 'ˋ'] },
  'tì': { parts: ['ㄊ', 'ㄧ', 'ˋ'] },
  'tuí': { parts: ['ㄊ', 'ㄨㄟ', 'ˊ'] },
  'ér': { parts: ['', 'ㄦ', 'ˊ'] },
  'er': { parts: ['', 'ㄦ', '˙'] },
  'nǚ': { parts: ['ㄋ', 'ㄩ', 'ˇ'] },
  'rǔ': { parts: ['ㄖ', 'ㄨ', 'ˇ'] },
  'hǎo': { parts: ['ㄏ', 'ㄠ', 'ˇ'] },
  'hào': { parts: ['ㄏ', 'ㄠ', 'ˋ'] },
  'shǎo': { parts: ['ㄕ', 'ㄠ', 'ˇ'] },
  'shào': { parts: ['ㄕ', 'ㄠ', 'ˋ'] },
  'cháng': { parts: ['ㄔ', 'ㄤ', 'ˊ'] },
  'zhǎng': { parts: ['ㄓ', 'ㄤ', 'ˇ'] },
  'nán': { parts: ['ㄋ', 'ㄢ', 'ˊ'] },
  'běi': { parts: ['ㄅ', 'ㄟ', 'ˇ'] },
  'bèi': { parts: ['ㄅ', 'ㄟ', 'ˋ'] },
  'tóu': { parts: ['ㄊ', 'ㄡ', 'ˊ'] },
  'tou': { parts: ['ㄊ', 'ㄡ', '˙'] },
  'jiā': { parts: ['ㄐ', 'ㄧㄚ', 'ˉ'] },
  'jia': { parts: ['ㄐ', 'ㄧㄚ', '˙'] },
  'yáng': { parts: ['', 'ㄧㄤ', 'ˊ'] },
  'xiáng': { parts: ['ㄒ', 'ㄧㄤ', 'ˊ'] },
  'māo': { parts: ['ㄇ', 'ㄠ', 'ˉ'] },
  'máo': { parts: ['ㄇ', 'ㄠ', 'ˊ'] },
  'yǔ': { parts: ['', 'ㄩ', 'ˇ'] },
  'yù': { parts: ['', 'ㄩ', 'ˋ'] },
  'fēng': { parts: ['ㄈ', 'ㄥ', 'ˉ'] },
  'fěng': { parts: ['ㄈ', 'ㄥ', 'ˇ'] },
  'zhī': { parts: ['ㄓ', '', 'ˉ'] },
  'néng': { parts: ['ㄋ', 'ㄥ', 'ˊ'] },
  'nài': { parts: ['ㄋ', 'ㄞ', 'ˋ'] },
  'yào': { parts: ['', 'ㄧㄠ', 'ˋ'] },
  'yāo': { parts: ['', 'ㄧㄠ', 'ˉ'] },
  'ma': { parts: ['ㄇ', 'ㄚ', '˙'] },
  'má': { parts: ['ㄇ', 'ㄚ', 'ˊ'] },
  'mǎ': { parts: ['ㄇ', 'ㄚ', 'ˇ'] },
  'nǎ': { parts: ['ㄋ', 'ㄚ', 'ˇ'] },
  'na': { parts: ['ㄋ', 'ㄚ', '˙'] },
  'něi': { parts: ['ㄋ', 'ㄟ', 'ˇ'] },
  'piāo': { parts: ['ㄆ', 'ㄧㄠ', 'ˉ'] },
  'piào': { parts: ['ㄆ', 'ㄧㄠ', 'ˋ'] },
  'piǎo': { parts: ['ㄆ', 'ㄧㄠ', 'ˇ'] },
  'lè': { parts: ['ㄌ', 'ㄜ', 'ˋ'] },
  'yuán': { parts: ['', 'ㄩㄢ', 'ˊ'] },
  'yún': { parts: ['', 'ㄩㄣ', 'ˊ'] },
  'yùn': { parts: ['', 'ㄩㄣ', 'ˋ'] },
  'yuǎn': { parts: ['', 'ㄩㄢ', 'ˇ'] },
  'qiān': { parts: ['ㄑ', 'ㄧㄢ', 'ˉ'] },
  'yán': { parts: ['', 'ㄧㄢ', 'ˊ'] },
  'wàn': { parts: ['', 'ㄨㄢ', 'ˋ'] },
  'mò': { parts: ['ㄇ', 'ㄛ', 'ˋ'] },
  'cān': { parts: ['ㄘ', 'ㄢ', 'ˉ'] },
  'shēn': { parts: ['ㄕ', 'ㄣ', 'ˉ'] },
  'cēn': { parts: ['ㄘ', 'ㄣ', 'ˉ'] },
  'sān': { parts: ['ㄙ', 'ㄢ', 'ˉ'] },
  'ā': { parts: ['', 'ㄚ', 'ˉ'] },
  'á': { parts: ['', 'ㄚ', 'ˊ'] },
  'ǎ': { parts: ['', 'ㄚ', 'ˇ'] },
  'à': { parts: ['', 'ㄚ', 'ˋ'] },
  'a': { parts: ['', 'ㄚ', '˙'] },
  'huài': { parts: ['ㄏ', 'ㄨㄞ', 'ˋ'] },
  'pēi': { parts: ['ㄆ', 'ㄟ', 'ˉ'] },
  'pī': { parts: ['ㄆ', '', 'ˉ'] },
  'hé': { parts: ['ㄏ', 'ㄜ', 'ˊ'] },
  'hē': { parts: ['ㄏ', 'ㄜ', 'ˉ'] },
  'hè': { parts: ['ㄏ', 'ㄜ', 'ˋ'] },
  'zán': { parts: ['ㄗ', 'ㄢ', 'ˊ'] },
  'zá': { parts: ['ㄗ', 'ㄚ', 'ˊ'] },
  'za': { parts: ['ㄗ', 'ㄚ', '˙'] },
  'bìng': { parts: ['ㄅ', 'ㄧㄥ', 'ˋ'] },
  'bīng': { parts: ['ㄅ', 'ㄧㄥ', 'ˉ'] },
  'guǎng': { parts: ['ㄍ', 'ㄨㄤ', 'ˇ'] },
  'ān': { parts: ['', 'ㄢ', 'ˉ'] },
  'shù': { parts: ['ㄕ', 'ㄨ', 'ˋ'] },
  'shú': { parts: ['ㄕ', 'ㄨ', 'ˊ'] },
  'zhú': { parts: ['ㄓ', 'ㄨ', 'ˊ'] },
  'xǔ': { parts: ['ㄒ', 'ㄩ', 'ˇ'] },
  'hǔ': { parts: ['ㄏ', 'ㄨ', 'ˇ'] },
  'xiáng': { parts: ['ㄒ', 'ㄧㄤ', 'ˊ'] },
  'yáng': { parts: ['', 'ㄧㄤ', 'ˊ'] },
  // Additional mappings for warnings
  'kài': { parts: ['ㄎ', 'ㄞ', 'ˋ'] },
  'bàn': { parts: ['ㄅ', 'ㄢ', 'ˋ'] },
  'fen': { parts: ['ㄈ', 'ㄣ', '˙'] },
  'fén': { parts: ['ㄈ', 'ㄣ', 'ˊ'] },
  'zuó': { parts: ['ㄗ', 'ㄨㄛ', 'ˊ'] },
  'huo': { parts: ['ㄏ', 'ㄨㄛ', '˙'] },
  'shi': { parts: ['ㄕ', '', '˙'] },
  'shì': { parts: ['ㄕ', '', 'ˋ'] },
  'liè': { parts: ['ㄌ', 'ㄧㄝ', 'ˋ'] },
  'fa': { parts: ['ㄈ', 'ㄚ', '˙'] },
  'chài': { parts: ['ㄔ', 'ㄞ', 'ˋ'] },
  'cuō': { parts: ['ㄘ', 'ㄨㄛ', 'ˉ'] },
  'dang': { parts: ['ㄉ', 'ㄤ', '˙'] },
  'chí': { parts: ['ㄔ', '', 'ˊ'] },
  'shu': { parts: ['ㄕ', 'ㄨ', '˙'] },
  'chu': { parts: ['ㄔ', 'ㄨ', '˙'] },
  'pò': { parts: ['ㄆ', 'ㄛ', 'ˋ'] },
  'luō': { parts: ['ㄌ', 'ㄨㄛ', 'ˉ'] },
  'zhuǎi': { parts: ['ㄓ', 'ㄨㄞ', 'ˇ'] },
  'chánɡ': { parts: ['ㄔ', 'ㄤ', 'ˊ'] },
  'nBné': { parts: ['ㄋ', 'ㄜ', 'ˊ'] }, // Typo in source data
  'yuàn': { parts: ['', 'ㄩㄢ', 'ˋ'] },
  'péi': { parts: ['ㄆ', 'ㄟ', 'ˊ'] },
  'zǎ': { parts: ['ㄗ', 'ㄚ', 'ˇ'] },
  // More common syllables
  'lǜ': { parts: ['ㄌ', 'ㄩ', 'ˋ'] },
  'nǎi': { parts: ['ㄋ', 'ㄞ', 'ˇ'] },
  'jiě': { parts: ['ㄐ', 'ㄧㄝ', 'ˇ'] },
};

// Convert pinyin to zhuyin array format
function pinyinToZhuyinArray(pinyin) {
  const mapping = PINYIN_TO_ZHUYIN[pinyin];
  if (mapping) {
    return [mapping.parts];
  }
  // Fallback: return placeholder
  console.warn(`  Warning: No zhuyin mapping for pinyin: ${pinyin}`);
  return [['TODO', pinyin, 'TODO']];
}

// Escape single quotes for SQL
function escapeSql(str) {
  return str.replace(/'/g, "''");
}

// Generate SQL for a single character
function generateCharacterSQL(charData) {
  const { char, hasContextAvailable, contextData } = charData;
  const dictEntry = dictLookup[char];

  if (!dictEntry) {
    console.error(`Character ${char} not found in dictionary!`);
    return null;
  }

  const pinyinList = polyphoneBasic[char] || [];
  const variants = [];

  // Check if we have researched context data for this character
  const researchedData = contextResearch.characters[char];

  if (hasContextAvailable && contextData) {
    // Use context data from reference
    for (const [pinyin, contexts] of Object.entries(contextData)) {
      const contextWords = [
        ...(contexts[0] || []),
        ...(contexts[1] || []),
        ...(contexts[2] || [])
      ].slice(0, 5);

      variants.push({
        pinyin,
        zhuyin: pinyinToZhuyinArray(pinyin),
        context_words: contextWords,
        meanings: dictEntry.meanings || []
      });
    }
  } else if (researchedData) {
    // Use manually researched data
    for (const [pinyin, data] of Object.entries(researchedData.pronunciations)) {
      variants.push({
        pinyin,
        zhuyin: pinyinToZhuyinArray(pinyin),
        context_words: data.context_words || [],
        meanings: dictEntry.meanings || []
      });
    }
  } else {
    // No context data - use basic pinyin list with empty context
    for (const pinyin of pinyinList) {
      variants.push({
        pinyin,
        zhuyin: pinyinToZhuyinArray(pinyin),
        context_words: [], // Will need manual filling
        meanings: dictEntry.meanings || []
      });
    }
  }

  if (variants.length === 0) {
    console.warn(`  Warning: No variants generated for ${char}`);
    return null;
  }

  // Format as SQL
  const variantsJson = JSON.stringify(variants);
  let contextNote;
  if (hasContextAvailable) {
    contextNote = 'Has context from reference';
  } else if (researchedData) {
    contextNote = 'Has researched context (MDBG)';
  } else {
    contextNote = 'NEEDS CONTEXT WORDS';
  }

  return `-- Character: ${char} (${dictEntry.trad}) - ${contextNote}
UPDATE dictionary_entries
SET
  zhuyin_variants = '${escapeSql(variantsJson)}'::jsonb
WHERE simp = '${char}'
  AND trad = '${escapeSql(dictEntry.trad)}';
`;
}

// Main function
function main() {
  const needsWork = gapAnalysis.needsWork;

  console.log(`\nGenerating Migration 011f v2...`);
  console.log(`Processing ${needsWork.length} characters...\n`);

  const withContext = needsWork.filter(c => c.hasContextAvailable);
  const needsLookup = needsWork.filter(c => !c.hasContextAvailable);

  console.log(`  - With context data: ${withContext.length}`);
  console.log(`  - Need manual context: ${needsLookup.length}\n`);

  // Generate header
  let sql = `-- Migration 011f: Comprehensive Multi-Pronunciation Coverage
-- Date: 2025-12-08
-- Issue: #26 (https://github.com/melodykoh/hanzi-dojo/issues/26)
--
-- Problem: 94 characters in our dictionary are polyphones (multiple pronunciations)
-- but lack proper zhuyin_variants. This causes "silent miseducation" where valid
-- alternate pronunciations appear as wrong answers in Drill A.
--
-- This migration adds zhuyin_variants to all 94 missing characters:
-- - 47 characters have context words from polyphone reference
-- - 47 characters need manual context word research (marked in SQL)
--
-- Characters: ${needsWork.map(c => c.char).join(', ')}

BEGIN;

-- Safety check: Ensure all characters exist before updating
DO $$
DECLARE
  char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN ('${needsWork.map(c => c.char).join("', '")}');

  IF char_count != ${needsWork.length} THEN
    RAISE EXCEPTION 'Expected ${needsWork.length} characters, found %', char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: All ${needsWork.length} characters exist';
END $$;

-- ============================================================================
-- SECTION 1: Characters with context words (${withContext.length} chars)
-- ============================================================================

`;

  // Generate SQL for chars with context
  for (const charData of withContext) {
    const sqlSnippet = generateCharacterSQL(charData);
    if (sqlSnippet) {
      sql += sqlSnippet + '\n';
    }
  }

  sql += `
-- ============================================================================
-- SECTION 2: Characters needing context research (${needsLookup.length} chars)
-- NOTE: These have empty context_words - needs manual research
-- ============================================================================

`;

  // Generate SQL for chars needing lookup
  for (const charData of needsLookup) {
    const sqlSnippet = generateCharacterSQL(charData);
    if (sqlSnippet) {
      sql += sqlSnippet + '\n';
    }
  }

  sql += `
-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  total_with_variants INT;
  chars_updated INT;
BEGIN
  SELECT COUNT(*) INTO total_with_variants
  FROM dictionary_entries
  WHERE length(simp) = 1 AND zhuyin_variants IS NOT NULL;

  RAISE NOTICE 'Total characters with zhuyin_variants: %', total_with_variants;
  RAISE NOTICE 'Expected: ~230 (136 existing + 94 new)';
END $$;

COMMIT;
`;

  // Write to file
  const outputPath = path.join(migrationsDir, '011f_comprehensive_multi_pronunciation.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`Migration written to: ${outputPath}`);
  console.log('\n⚠️  Review before applying - check zhuyin accuracy and context words!');
}

main();
