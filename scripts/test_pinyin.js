import pinyinModule from 'pinyin';

const pinyin = pinyinModule.default || pinyinModule.pinyin;

console.log('Testing pinyin library:');
const result = pinyin('什', { style: pinyin.STYLE_TONE, heteronym: true });
console.log('什 (heteronym):', result);

const result2 = pinyin('什麼', { style: pinyin.STYLE_TONE, heteronym: false });
console.log('什麼:', result2);

const result3 = pinyin('人', { style: pinyin.STYLE_TONE });
console.log('人:', result3);
