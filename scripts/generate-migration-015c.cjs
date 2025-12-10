#!/usr/bin/env node
/**
 * Generate migration to convert context words from Simplified to Traditional Chinese
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive simplified -> traditional mapping
const simpToTrad = {
  '着': '著', '听': '聽', '硕': '碩', '为': '為', '与': '與',
  '会': '會', '传': '傳', '关': '關', '兴': '興', '写': '寫',
  '冲': '沖', '决': '決', '况': '況', '净': '淨', '减': '減',
  '几': '幾', '划': '劃', '则': '則', '别': '別', '办': '辦',
  '动': '動', '务': '務', '医': '醫', '厅': '廳', '发': '發',
  '变': '變', '叶': '葉', '号': '號', '叹': '嘆', '吨': '噸',
  '员': '員', '园': '園', '国': '國', '图': '圖',
  '团': '團', '场': '場', '壮': '壯', '声': '聲', '处': '處',
  '备': '備', '复': '復', '头': '頭', '夹': '夾', '夺': '奪',
  '奋': '奮', '奖': '獎', '妇': '婦', '妈': '媽', '娱': '娛',
  '学': '學', '实': '實', '宝': '寶', '审': '審',
  '导': '導', '层': '層', '属': '屬', '岁': '歲', '岛': '島',
  '币': '幣', '师': '師', '带': '帶', '帮': '幫', '干': '乾',
  '广': '廣', '庄': '莊', '应': '應', '张': '張', '录': '錄',
  '归': '歸', '总': '總', '战': '戰', '报': '報', '护': '護',
  '担': '擔', '择': '擇', '据': '據', '损': '損',
  '换': '換', '摆': '擺', '数': '數',
  '断': '斷', '无': '無', '显': '顯', '时': '時',
  '晓': '曉', '暂': '暫', '术': '術', '机': '機', '权': '權',
  '条': '條', '来': '來', '极': '極', '构': '構', '标': '標',
  '样': '樣', '树': '樹', '业': '業', '检': '檢',
  '欢': '歡', '欧': '歐', '歼': '殲', '残': '殘', '气': '氣',
  '汇': '匯', '汉': '漢', '沟': '溝', '没': '沒', '沪': '滬',
  '济': '濟', '测': '測', '浅': '淺', '浆': '漿', '涌': '湧',
  '润': '潤', '温': '溫', '渐': '漸', '游': '遊',
  '湾': '灣', '满': '滿', '潜': '潛', '点': '點', '炼': '煉',
  '热': '熱', '焕': '煥', '爱': '愛', '牵': '牽', '状': '狀',
  '独': '獨', '狱': '獄', '现': '現', '环': '環', '玛': '瑪',
  '电': '電', '画': '畫', '疗': '療', '监': '監',
  '盘': '盤', '盖': '蓋', '种': '種', '称': '稱', '积': '積',
  '稳': '穩', '窃': '竊', '签': '簽', '简': '簡',
  '类': '類', '粮': '糧', '粤': '粵', '纠': '糾', '红': '紅',
  '纪': '紀', '约': '約', '级': '級', '纯': '純', '纲': '綱',
  '绍': '紹', '经': '經', '绘': '繪', '给': '給', '络': '絡',
  '绝': '絕', '统': '統', '绪': '緒', '继': '繼', '续': '續',
  '综': '綜', '线': '線', '绳': '繩', '维': '維', '绿': '綠',
  '缓': '緩', '编': '編', '缘': '緣', '缩': '縮',
  '网': '網', '罗': '羅', '罢': '罷', '职': '職',
  '联': '聯', '聪': '聰', '肃': '肅', '胀': '脹', '胜': '勝',
  '脑': '腦', '脸': '臉', '脏': '髒', '脱': '脫', '腊': '臘',
  '艰': '艱', '节': '節', '芦': '蘆', '苏': '蘇', '范': '範',
  '药': '藥', '虑': '慮', '虚': '虛', '虽': '雖',
  '补': '補', '观': '觀', '规': '規', '觉': '覺',
  '览': '覽', '誉': '譽', '计': '計', '订': '訂', '认': '認',
  '议': '議', '讯': '訊', '记': '記', '讲': '講', '讨': '討',
  '训': '訓', '设': '設', '许': '許', '论': '論', '识': '識',
  '证': '證', '评': '評', '详': '詳', '语': '語', '误': '誤',
  '说': '說', '课': '課', '调': '調', '谈': '談', '谊': '誼',
  '谢': '謝', '谱': '譜', '贝': '貝', '负': '負', '贡': '貢',
  '财': '財', '责': '責', '败': '敗', '货': '貨', '质': '質',
  '贴': '貼', '费': '費', '资': '資', '赋': '賦', '赚': '賺',
  '赛': '賽', '赞': '讚', '赶': '趕', '趋': '趨', '践': '踐',
  '车': '車', '轨': '軌', '转': '轉', '轮': '輪', '软': '軟',
  '载': '載', '辅': '輔', '输': '輸', '辑': '輯', '边': '邊',
  '达': '達', '过': '過', '运': '運', '还': '還', '这': '這',
  '进': '進', '连': '連', '远': '遠', '适': '適', '选': '選',
  '递': '遞', '逻': '邏', '遗': '遺',
  '邻': '鄰', '郑': '鄭', '释': '釋', '里': '裡', '针': '針',
  '钉': '釘', '钟': '鐘', '钢': '鋼', '钥': '鑰', '钱': '錢',
  '钻': '鑽', '铁': '鐵', '铅': '鉛', '铜': '銅', '银': '銀',
  '销': '銷', '锁': '鎖', '锅': '鍋', '错': '錯', '锦': '錦',
  '键': '鍵', '镇': '鎮', '镜': '鏡', '长': '長', '门': '門',
  '闪': '閃', '闭': '閉', '问': '問', '闲': '閒', '间': '間',
  '阅': '閱', '阵': '陣', '阶': '階', '际': '際', '陆': '陸',
  '险': '險', '随': '隨', '隐': '隱', '难': '難', '云': '雲',
  '雾': '霧', '静': '靜', '顶': '頂',
  '顺': '順', '须': '須', '顾': '顧', '顿': '頓', '颁': '頒',
  '颂': '頌', '预': '預', '领': '領', '颜': '顏', '额': '額',
  '风': '風', '飘': '飄', '饭': '飯', '饮': '飲', '饰': '飾',
  '馆': '館', '马': '馬', '驾': '駕', '验': '驗', '骗': '騙',
  '鱼': '魚', '鲜': '鮮',
  '鸟': '鳥', '鸡': '雞', '鸭': '鴨', '鹅': '鵝', '齐': '齊',
  '龙': '龍', '龟': '龜',
  '确': '確', '亲': '親', '严': '嚴', '弹': '彈',
  '扫': '掃', '窘': '窘', '实': '實', '仔': '仔'
};

function convertToTraditional(word) {
  return word.split('').map(char => simpToTrad[char] || char).join('');
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

async function generateMigration() {
  const { data, error } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin_variants')
    .not('zhuyin_variants', 'is', null);

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  const updates = [];

  data.forEach(entry => {
    let needsUpdate = false;
    const newVariants = entry.zhuyin_variants.map(variant => {
      if (!variant.context_words) return variant;

      const newContextWords = variant.context_words.map(word => {
        const converted = convertToTraditional(word);
        if (converted !== word) needsUpdate = true;
        return converted;
      });

      return { ...variant, context_words: newContextWords };
    });

    if (needsUpdate) {
      updates.push({
        simp: entry.simp,
        trad: entry.trad,
        variants: newVariants
      });
    }
  });

  console.log('-- Migration 015c: Convert context words to Traditional Chinese');
  console.log('-- Date: 2025-12-09');
  console.log('-- Converts ' + updates.length + ' characters with simplified context words to traditional');
  console.log('');
  console.log('BEGIN;');
  console.log('');

  updates.forEach(u => {
    const json = escapeSql(JSON.stringify(u.variants));
    console.log('-- ' + u.simp + ' (' + u.trad + ')');
    console.log("UPDATE dictionary_entries SET zhuyin_variants = '" + json + "'::jsonb WHERE simp = '" + u.simp + "' AND trad = '" + u.trad + "';");
    console.log('');
  });

  console.log('COMMIT;');
}

generateMigration();
