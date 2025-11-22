#!/usr/bin/env node

/**
 * Build Epic 8 multi-pronunciation dataset (Category 1 + Category 2)
 *
 * Reads canonical dictionary expansion data and synthesizes Pattern A friendly
 * pronunciation payloads for every pending character (139 total).
 *
 * Output: data/multi_pronunciation_epic8_auto.json
 */

const fs = require('fs')
const path = require('path')

const category1Chars = [
  '为','传','供','便','假','几','切','划','地','场','将','干','应','弹','扫','把','担','教','更','正','没','相','省','种','系','结','给','行','觉','角','调','还','都','重','量','什'
]

const category2Chars = [
  '且','丽','么','乘','于','亚','些','亲','仅','从','价','任','份','休','估','体','信','俩','倒','共','其','冒','净','凉','别','刷','助','化','匙','区','占','卡','压','句','可','台','号','各','合','同','否','吧','呀','呢','咖','咳','填','夫','奇','妻','孙','底','度','弄','思','愉','戏','打','择','拾','据','排','散','旁','景','服','条','查','校','椅','汗','汤','沙','洗','济','父','片','甚','疑','研','硕','票','禁','稍','约','肚','胳','膏','苹','被','观','论','语','谁','责','赚','趟','趣','跳','钢'
]

const allChars = Array.from(new Set([...category1Chars, ...category2Chars]))

const dictionaryPath = path.join(__dirname, '../data/dictionary_expansion_v2.json')
const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'))

const dictionaryBySimp = new Map()
for (const entry of dictionary.entries) {
  if (!dictionaryBySimp.has(entry.simp)) {
    dictionaryBySimp.set(entry.simp, [])
  }
  dictionaryBySimp.get(entry.simp).push(entry)
}

function normalizeTone(tone) {
  return tone && tone.trim() ? tone.trim() : 'ˉ'
}

function cloneZhuyinTuple(tuple) {
  const [initial = '', final = '', tone = 'ˉ'] = tuple
  return [initial, final, normalizeTone(tone)]
}

function parsePinyinString(pinyin, expectedLength) {
  if (!pinyin) {
    return Array(expectedLength).fill('')
  }
  const tokens = pinyin
    .split(/[,/;、]|\bor\b/i)
    .map(token => token.trim())
    .filter(Boolean)
  if (tokens.length === 0) tokens.push('')
  while (tokens.length < expectedLength) {
    tokens.push(tokens[tokens.length - 1] || tokens[0] || '')
  }
  return tokens.slice(0, expectedLength)
}

function pickDictionaryEntry(char) {
  const matches = dictionaryBySimp.get(char)
  if (!matches || matches.length === 0) {
    throw new Error(`No dictionary entry found for ${char}`)
  }
  const singleCharEntry = matches.find(entry => entry.simp.length === 1)
  return singleCharEntry || matches[0]
}

function buildCharacterPayload(char) {
  const entry = pickDictionaryEntry(char)
  const zhuyinList = (entry.zhuyin || []).map(cloneZhuyinTuple)

  if (zhuyinList.length < 2) {
    console.warn(`⚠️  Character ${char} only has ${zhuyinList.length} zhuyin entries; skipping variant build`)
  }

  const pinyinList = parsePinyinString(entry.pinyin || '', zhuyinList.length)

  const defaultPronunciation = {
    pinyin: pinyinList[0] || entry.pinyin || '',
    zhuyin: zhuyinList[0] ? [zhuyinList[0]] : [],
    context_words: [],
    meanings: entry.meanings || []
  }

  const variants = []
  for (let i = 1; i < zhuyinList.length; i++) {
    variants.push({
      pinyin: pinyinList[i] || '',
      zhuyin: [zhuyinList[i]],
      context_words: [],
      meanings: entry.meanings || []
    })
  }

  return {
    simp: entry.simp,
    trad: entry.trad || entry.simp,
    default_pronunciation: defaultPronunciation,
    variants,
    notes: 'Auto-generated from dictionary_expansion_v2.json (no manual context words)',
    source: entry.frequency_rank ? `HSK frequency #${entry.frequency_rank}` : 'dictionary_expansion_v2'
  }
}

const characters = allChars.map(buildCharacterPayload)

const payload = {
  phase: 'Epic 8 - Category 1 + 2 auto-generated pronunciations',
  date: new Date().toISOString().split('T')[0],
  character_count: characters.length,
  description: 'Auto-generated pronunciations for remaining multi-tone characters prior to Drill A guardrails.',
  characters
}

const outputPath = path.join(__dirname, '../data/multi_pronunciation_epic8_auto.json')
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2))

console.log('✅ Multi-pronunciation dataset written to', outputPath)
console.log(`📊 Characters processed: ${characters.length}`)
