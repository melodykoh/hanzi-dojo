-- Migration 015c: Convert context words to Traditional Chinese
-- Date: 2025-12-09
-- Converts 73 characters with simplified context words to traditional

BEGIN;

-- 为 (為)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"wèi","zhuyin":[["ㄨ","ㄟ","ˋ"]],"meanings":["for","because of","to"],"context_words":["因為","為了","為什么"]},{"pinyin":"wéi","zhuyin":[["ㄨ","ㄟ","ˊ"]],"meanings":["as","to act as","to serve as","to become","to be"],"context_words":["作為","認為","成為","行為"]}]'::jsonb WHERE simp = '为' AND trad = '為';

-- 没 (沒)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"méi","zhuyin":[["ㄇ","ㄟ","ˊ"]],"meanings":["not","have not","did not"],"context_words":["沒有","沒關系","沒事"]},{"pinyin":"mò","zhuyin":[["ㄇ","ㄛ","ˋ"]],"meanings":["to sink","to drown","to submerge","to die"],"context_words":["淹沒","沉沒","埋沒"]}]'::jsonb WHERE simp = '没' AND trad = '沒';

-- 教 (教)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jiāo","zhuyin":[["ㄐ","ㄧㄠ","ˉ"]],"meanings":["to teach","to instruct"],"context_words":["教书","教會","教給"]},{"pinyin":"jiào","zhuyin":[["ㄐ","ㄧㄠ","ˋ"]],"meanings":["teaching","religion","to cause","to tell"],"context_words":["教育","教室","宗教","教學"]}]'::jsonb WHERE simp = '教' AND trad = '教';

-- 红 (紅)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"gōng","zhuyin":[["ㄍ","ㄨㄥ","ˉ"]],"meanings":["red","popular"],"context_words":["女紅"]},{"pinyin":"hóng","zhuyin":[["ㄏ","ㄨㄥ","ˊ"]],"meanings":["work (variant)"],"context_words":["紅色","紅人"]}]'::jsonb WHERE simp = '红' AND trad = '紅';

-- 还 (還)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"hái","zhuyin":[["ㄏ","ㄞ","ˊ"]],"meanings":["still","yet","even more","also","in addition"],"context_words":["還有","還是","還好"]},{"pinyin":"huán","zhuyin":[["ㄏ","ㄨㄢ","ˊ"]],"meanings":["to return","to give back","to pay back"],"context_words":["還錢","歸還","偿還"]}]'::jsonb WHERE simp = '还' AND trad = '還';

-- 给 (給)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"gěi","zhuyin":[["ㄍ","ㄟ","ˇ"]],"meanings":["to give","for","to allow","by (passive)"],"context_words":["給你","送給","給他"]},{"pinyin":"jǐ","zhuyin":[["ㄐ","ㄧ","ˇ"]],"meanings":["to supply","to provide"],"context_words":["供給","給予"]}]'::jsonb WHERE simp = '给' AND trad = '給';

-- 将 (將)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jiāng","zhuyin":[["ㄐ","ㄧㄤ","ˉ"]],"meanings":["will","shall","just"],"context_words":["将來","将要"]},{"pinyin":"jiàng","zhuyin":[["ㄐ","ㄧㄤ","ˋ"]],"meanings":["general","to command"],"context_words":["将军","大将"]}]'::jsonb WHERE simp = '将' AND trad = '將';

-- 硕 (碩)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shuò","zhuyin":[["ㄕ","ㄨㄛ","ˋ"]],"meanings":["large","big","Masters degree"],"context_words":["碩士","碩大","碩果"]}]'::jsonb WHERE simp = '硕' AND trad = '碩';

-- 扫 (掃)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"sǎo","zhuyin":[["ㄙ","ㄠ","ˇ"]],"meanings":["to sweep","to scan"],"context_words":["掃地","打掃","掃描"]},{"pinyin":"sào","zhuyin":[["ㄙ","ㄠ","ˋ"]],"meanings":["broom"],"context_words":["掃帚"]}]'::jsonb WHERE simp = '扫' AND trad = '掃';

-- 应 (應)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"yīng","zhuyin":[["ㄧ","ㄥ","ˉ"]],"meanings":["should","ought to"],"context_words":["應该","應当"]},{"pinyin":"yìng","zhuyin":[["ㄧ","ㄥ","ˋ"]],"meanings":["to respond","to answer"],"context_words":["答應","反應","應用"]}]'::jsonb WHERE simp = '应' AND trad = '應';

-- 担 (擔)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"dān","zhuyin":[["ㄉ","ㄢ","ˉ"]],"meanings":["to carry","to shoulder","to take responsibility"],"context_words":["擔心","擔任","負擔"]},{"pinyin":"dàn","zhuyin":[["ㄉ","ㄢ","ˋ"]],"meanings":["load","burden (measurement)"],"context_words":["重擔","扁擔"]}]'::jsonb WHERE simp = '担' AND trad = '擔';

-- 重 (重)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhòng","zhuyin":[["ㄓ","ㄨㄥ","ˋ"]],"meanings":["heavy","serious","important","to attach importance to"],"context_words":["重要","体重","重量","嚴重"]},{"pinyin":"chóng","zhuyin":[["ㄔ","ㄨㄥ","ˊ"]],"meanings":["to repeat","again","re-","layer"],"context_words":["重復","重新","重來"]}]'::jsonb WHERE simp = '重' AND trad = '重';

-- 传 (傳)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chuán","zhuyin":[["ㄔ","ㄨㄢ","ˊ"]],"meanings":["to pass on","to spread","to transmit"],"context_words":["傳說","傳統","流傳"]},{"pinyin":"zhuàn","zhuyin":[["ㄓ","ㄨㄢ","ˋ"]],"meanings":["biography","historical narrative"],"context_words":["自傳","傳記"]}]'::jsonb WHERE simp = '传' AND trad = '傳';

-- 划 (劃)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"huá","zhuyin":[["ㄏ","ㄨㄚ","ˊ"]],"meanings":["to row","to paddle","profitable"],"context_words":["劃船","劃算"]},{"pinyin":"huà","zhuyin":[["ㄏ","ㄨㄚ","ˋ"]],"meanings":["to plan","to draw a line"],"context_words":["計劃","規劃","劃分"]}]'::jsonb WHERE simp = '划' AND trad = '劃';

-- 弹 (彈)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"dàn","zhuyin":[["ㄉ","ㄢ","ˋ"]],"meanings":["bullet","bomb","shot"],"context_words":["子彈","炸彈","導彈"]},{"pinyin":"tán","zhuyin":[["ㄊ","ㄢ","ˊ"]],"meanings":["to pluck","to play (instrument)"],"context_words":["彈琴","彈吉他"]}]'::jsonb WHERE simp = '弹' AND trad = '彈';

-- 系 (系)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"xì","zhuyin":[["ㄒ","ㄧ","ˋ"]],"meanings":["system","department","to relate to"],"context_words":["系統","關系","中文系"]},{"pinyin":"jì","zhuyin":[["ㄐ","ㄧ","ˋ"]],"meanings":["to tie","to fasten"],"context_words":["系鞋帶"]}]'::jsonb WHERE simp = '系' AND trad = '系';

-- 省 (省)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shěng","zhuyin":[["ㄕ","ㄥ","ˇ"]],"meanings":["province","to save","to omit"],"context_words":["省錢","河北省","節省"]},{"pinyin":"xǐng","zhuyin":[["ㄒ","ㄧㄥ","ˇ"]],"meanings":["to reflect","to examine"],"context_words":["反省","省察"]}]'::jsonb WHERE simp = '省' AND trad = '省';

-- 量 (量)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"liàng","zhuyin":[["ㄌ","ㄧㄤ","ˋ"]],"meanings":["quantity","amount","capacity"],"context_words":["數量","質量","大量"]},{"pinyin":"liáng","zhuyin":[["ㄌ","ㄧㄤ","ˊ"]],"meanings":["to measure"],"context_words":["測量","量体溫"]}]'::jsonb WHERE simp = '量' AND trad = '量';

-- 什 (什)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shén","zhuyin":[["ㄕ","ㄣ","ˊ"]],"meanings":["what (in 什么)"],"context_words":["什么","為什么"]},{"pinyin":"shí","zhuyin":[["ㄕ","ˊ",null]],"meanings":["ten","assorted"],"context_words":["什錦"]}]'::jsonb WHERE simp = '什' AND trad = '什';

-- 几 (幾)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jǐ","zhuyin":[["ㄐ","ㄧ","ˇ"]],"meanings":["how many","several","a few"],"context_words":["幾个","幾天","好幾"]},{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"meanings":["small table","almost"],"context_words":["茶幾","幾乎"]}]'::jsonb WHERE simp = '几' AND trad = '幾';

-- 叶 (葉)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"xié","zhuyin":[["ㄒ","ㄧㄝ","ˊ"]],"meanings":["leaf","page"],"context_words":["葉韵"]},{"pinyin":"yè","zhuyin":[["","ㄧㄝ","ˋ"]],"meanings":["to rhyme","to harmonize"],"context_words":["葉落","葉公"]}]'::jsonb WHERE simp = '叶' AND trad = '葉';

-- 正 (正)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhèng","zhuyin":[["ㄓ","ㄥ","ˋ"]],"meanings":["correct","upright","proper","main","exactly","just"],"context_words":["正常","正在","正確","正好"]},{"pinyin":"zhēng","zhuyin":[["ㄓ","ㄥ","ˉ"]],"meanings":["first month of the lunar year"],"context_words":["正月"]}]'::jsonb WHERE simp = '正' AND trad = '正';

-- 更 (更)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"gèng","zhuyin":[["ㄍ","ㄥ","ˋ"]],"meanings":["more","even more","further","still"],"context_words":["更好","更多","更加"]},{"pinyin":"gēng","zhuyin":[["ㄍ","ㄥ","ˉ"]],"meanings":["to change","night watch period","watch"],"context_words":["三更","打更","更換"]}]'::jsonb WHERE simp = '更' AND trad = '更';

-- 种 (種)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhǒng","zhuyin":[["ㄓ","ㄨㄥ","ˇ"]],"meanings":["kind","type","species"],"context_words":["種類","各種","這種"]},{"pinyin":"zhòng","zhuyin":[["ㄓ","ㄨㄥ","ˋ"]],"meanings":["to plant","to grow"],"context_words":["種樹","種植","播種"]}]'::jsonb WHERE simp = '种' AND trad = '種';

-- 供 (供)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"gōng","zhuyin":[["ㄍ","ㄨㄥ","ˉ"]],"meanings":["to provide","to supply"],"context_words":["供應","提供","供給"]},{"pinyin":"gòng","zhuyin":[["ㄍ","ㄨㄥ","ˋ"]],"meanings":["offerings","to confess"],"context_words":["供品","供奉"]}]'::jsonb WHERE simp = '供' AND trad = '供';

-- 当 (當)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"dang","zhuyin":[["ㄉ","ㄤ","˙"]],"meanings":["of course","naturally"],"context_words":[]},{"pinyin":"dàng","zhuyin":[["ㄉ","ㄤ","ˋ"]],"meanings":["should","act as","work as"],"context_words":["当日","当年","当真","当铺","一人当两人用"]},{"pinyin":"dāng","zhuyin":[["ㄉ","ㄤ","ˉ"]],"meanings":["to match","sound of bells"],"context_words":["当場","当今","当時","当年","当日"]}]'::jsonb WHERE simp = '当' AND trad = '當';

-- 脏 (髒)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zàng","zhuyin":[["ㄗ","ㄤ","ˋ"]],"meanings":["dirty","filthy"],"context_words":["髒腑","心髒","内髒"]},{"pinyin":"zāng","zhuyin":[["ㄗ","ㄤ","ˉ"]],"meanings":["internal organ"],"context_words":["肮髒"]}]'::jsonb WHERE simp = '脏' AND trad = '髒';

-- 数 (數)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shu","zhuyin":[["ㄕ","ㄨ","˙"]],"meanings":["mathematics","number"],"context_words":[]},{"pinyin":"shuò","zhuyin":[["ㄕ","ㄨㄛ","ˋ"]],"meanings":["to count","to enumerate"],"context_words":["數见不鮮"]},{"pinyin":"shù","zhuyin":[["ㄕ","ㄨ","ˋ"]],"meanings":["frequently","repeatedly"],"context_words":["數字","數目"]},{"pinyin":"shǔ","zhuyin":[["ㄕ","ㄨ","ˇ"]],"meanings":["amount","quantity"],"context_words":["數落","數數"]}]'::jsonb WHERE simp = '数' AND trad = '數';

-- 累 (累)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"liè","zhuyin":[["ㄌ","ㄧㄝ","ˋ"]],"meanings":["tired","exhausted"],"context_words":[]},{"pinyin":"lèi","zhuyin":[["ㄌ","ㄟ","ˋ"]],"meanings":["to accumulate","continuous"],"context_words":["劳累"]},{"pinyin":"léi","zhuyin":[["ㄌ","ㄟ","ˊ"]],"meanings":["to involve","to implicate"],"context_words":["累赘","累赘","累累如丧家之犬","果實累累"]},{"pinyin":"lěi","zhuyin":[["ㄌ","ㄟ","ˇ"]],"meanings":["rope","to bind"],"context_words":["累進","累卵","累年","連篇累牍","罪行累累"]},{"pinyin":"lǜ","zhuyin":[["ㄌ","ㄩ","ˋ"]],"meanings":["many","numerous"],"context_words":[]}]'::jsonb WHERE simp = '累' AND trad = '累';

-- 行 (行)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"xíng","zhuyin":[["ㄒ","ㄧㄥ","ˊ"]],"meanings":["to walk","to go","to travel","to do","OK","capable"],"context_words":["步行","旅行","可行","不行","流行"]},{"pinyin":"háng","zhuyin":[["ㄏ","ㄤ","ˊ"]],"meanings":["row","line","profession","business"],"context_words":["銀行","行業","一行","同行"]}]'::jsonb WHERE simp = '行' AND trad = '行';

-- 切 (切)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"qiē","zhuyin":[["ㄑ","ㄧㄝ","ˉ"]],"meanings":["to cut","to slice"],"context_words":["切菜","切开","切斷"]},{"pinyin":"qiè","zhuyin":[["ㄑ","ㄧㄝ","ˋ"]],"meanings":["close to","eager","definitely"],"context_words":["切實","親切","一切"]}]'::jsonb WHERE simp = '切' AND trad = '切';

-- 地 (地)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"dì","zhuyin":[["ㄉ","ㄧ","ˋ"]],"meanings":["earth","ground","land","place"],"context_words":["地方","土地","地球"]},{"pinyin":"de","zhuyin":[["ㄉ","ㄜ","˙"]],"meanings":["adverbial suffix -ly"],"context_words":["慢慢地","高興地"]}]'::jsonb WHERE simp = '地' AND trad = '地';

-- 场 (場)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chǎng","zhuyin":[["ㄔ","ㄤ","ˇ"]],"meanings":["field","place","stage","classifier"],"context_words":["場地","市場","廣場"]},{"pinyin":"cháng","zhuyin":[["ㄔ","ㄤ","ˊ"]],"meanings":["threshing floor","classifier for events"],"context_words":["一場雨"]}]'::jsonb WHERE simp = '场' AND trad = '場';

-- 结 (結)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jié","zhuyin":[["ㄐ","ㄧㄝ","ˊ"]],"meanings":["knot","to tie","to conclude"],"context_words":["结果","结束","结婚"]},{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"meanings":["to bear fruit"],"context_words":["结果實"]}]'::jsonb WHERE simp = '结' AND trad = '結';

-- 觉 (覺)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jué","zhuyin":[["ㄐ","ㄩㄝ","ˊ"]],"meanings":["to feel","to think"],"context_words":["覺得","感覺","自覺"]},{"pinyin":"jiào","zhuyin":[["ㄐ","ㄧㄠ","ˋ"]],"meanings":["sleep","nap"],"context_words":["睡覺","午覺"]}]'::jsonb WHERE simp = '觉' AND trad = '覺';

-- 角 (角)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jiǎo","zhuyin":[["ㄐ","ㄧㄠ","ˇ"]],"meanings":["corner","angle","horn","dime"],"context_words":["角落","三角","一角錢"]},{"pinyin":"jué","zhuyin":[["ㄐ","ㄩㄝ","ˊ"]],"meanings":["role","character (theater)"],"context_words":["角色","主角","配角"]}]'::jsonb WHERE simp = '角' AND trad = '角';

-- 调 (調)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"tiáo","zhuyin":[["ㄊ","ㄧㄠ","ˊ"]],"meanings":["to adjust","to harmonize","to blend"],"context_words":["調節","調整","强調"]},{"pinyin":"diào","zhuyin":[["ㄉ","ㄧㄠ","ˋ"]],"meanings":["tone","tune","to transfer"],"context_words":["調查","聲調","曲調"]}]'::jsonb WHERE simp = '调' AND trad = '調';

-- 据 (據)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jù","zhuyin":[["ㄐ","ㄩ","ˋ"]],"meanings":["according to","evidence"],"context_words":["根據","據說","證據"]},{"pinyin":"jū","zhuyin":[["ㄐ","ㄩ","ˉ"]],"meanings":["hard up (in 拮据)"],"context_words":["拮據"]}]'::jsonb WHERE simp = '据' AND trad = '據';

-- 着 (著)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhe","zhuyin":[["ㄓ","ㄜ","˙"]],"meanings":["aspect particle (ongoing action)"],"context_words":["看著","走著","聽著"]},{"pinyin":"zhuó","zhuyin":[["ㄓ","ㄨㄛ","ˊ"]],"meanings":["to wear","to apply","to use"],"context_words":["著落","著重","著手","著力","著装"]},{"pinyin":"zháo","zhuyin":[["ㄓ","ㄠ","ˊ"]],"meanings":["to touch","to feel","to catch fire"],"context_words":["著急","著迷","著凉","著忙","著魔"]},{"pinyin":"zhāo","zhuyin":[["ㄓ","ㄠ","ˉ"]],"meanings":["move (chess)","trick","tactic"],"context_words":["著數","失著","高著"]}]'::jsonb WHERE simp = '着' AND trad = '著';

-- 中 (中)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhòng","zhuyin":[["ㄓ","ㄨㄥ","ˋ"]],"meanings":["middle","center","China"],"context_words":["中獎","中靶","中選","看中"]},{"pinyin":"zhōng","zhuyin":[["ㄓ","ㄨㄥ","ˉ"]],"meanings":["to hit","to be hit by","to win (lottery)"],"context_words":["中國","人中"]}]'::jsonb WHERE simp = '中' AND trad = '中';

-- 会 (會)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"huì","zhuyin":[["ㄏ","ㄨㄟ","ˋ"]],"meanings":["can","will","meeting"],"context_words":["會合","都會"]},{"pinyin":"kuài","zhuyin":[["ㄎ","ㄨㄞ","ˋ"]],"meanings":["accounting","to calculate"],"context_words":["會計","財會"]}]'::jsonb WHERE simp = '会' AND trad = '會';

-- 的 (的)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"de","zhuyin":[["ㄉ","ㄜ","˙"]],"meanings":["possessive particle","structural particle"],"context_words":[]},{"pinyin":"dì","zhuyin":[["ㄉ","ㄧ","ˋ"]],"meanings":["truly","indeed"],"context_words":["有的放矢","目的","中的"]},{"pinyin":"dí","zhuyin":[["ㄉ","ㄧ","ˊ"]],"meanings":["target","bulls-eye"],"context_words":["的当","的確","的證"]}]'::jsonb WHERE simp = '的' AND trad = '的';

-- 发 (發)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"fa","zhuyin":[["ㄈ","ㄚ","˙"]],"meanings":["to send","to issue","to develop"],"context_words":[]},{"pinyin":"fà","zhuyin":[["ㄈ","ㄚ","ˋ"]],"meanings":["hair (on head)"],"context_words":["發型","令人發指","理發","结發"]},{"pinyin":"fā","zhuyin":[["ㄈ","ㄚ","ˉ"]],"meanings":["to have a fever"],"context_words":["發表","發端","發窘","發掘","打發"]}]'::jsonb WHERE simp = '发' AND trad = '發';

-- 绿 (綠)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"lù","zhuyin":[["ㄌ","ㄨ","ˋ"]],"meanings":["green"],"context_words":["綠林","鴨綠江"]},{"pinyin":"lǜ","zhuyin":[["ㄌ","ㄩ","ˋ"]],"meanings":["surname Lu"],"context_words":["綠地","綠菌"]}]'::jsonb WHERE simp = '绿' AND trad = '綠';

-- 答 (答)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"dá","zhuyin":[["ㄉ","ㄚ","ˊ"]],"meanings":["to answer","to reply"],"context_words":["答案","答復","答卷"]},{"pinyin":"dā","zhuyin":[["ㄉ","ㄚ","ˉ"]],"meanings":["to respond","to agree"],"context_words":["答理","答應","答腔","答讪","答言"]}]'::jsonb WHERE simp = '答' AND trad = '答';

-- 分 (分)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"bàn","zhuyin":[["ㄅ","ㄢ","ˋ"]],"meanings":["minute","to divide","to separate"],"context_words":[]},{"pinyin":"fen","zhuyin":[["ㄈ","ㄣ","˙"]],"meanings":["part","component"],"context_words":[]},{"pinyin":"fèn","zhuyin":[["ㄈ","ㄣ","ˋ"]],"meanings":["share","portion"],"context_words":["分子","身分"]},{"pinyin":"fén","zhuyin":[["ㄈ","ㄣ","ˊ"]],"meanings":["grave","tomb"],"context_words":[]},{"pinyin":"fēn","zhuyin":[["ㄈ","ㄣ","ˉ"]],"meanings":["one tenth"],"context_words":["分數","区分"]}]'::jsonb WHERE simp = '分' AND trad = '分';

-- 兴 (興)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"xìng","zhuyin":[["ㄒ","ㄧㄥ","ˋ"]],"meanings":["happy","glad","interested"],"context_words":["興趣","興致","豪興","助興","敗興"]},{"pinyin":"xīng","zhuyin":[["ㄒ","ㄧㄥ","ˉ"]],"meanings":["to prosper","to flourish"],"context_words":["興起","興辦","興修","興許","興盛"]}]'::jsonb WHERE simp = '兴' AND trad = '興';

-- 落 (落)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"luò","zhuyin":[["ㄌ","ㄨㄛ","ˋ"]],"meanings":["to fall","to drop","to set"],"context_words":["落魄","著落"]},{"pinyin":"luō","zhuyin":[["ㄌ","ㄨㄛ","ˉ"]],"meanings":["colloquial for falling"],"context_words":[]},{"pinyin":"là","zhuyin":[["ㄌ","ㄚ","ˋ"]],"meanings":["to leave behind","to lag"],"context_words":["落下","丢三落四"]},{"pinyin":"lào","zhuyin":[["ㄌ","ㄠ","ˋ"]],"meanings":["to fall (rain)","village"],"context_words":["落枕","落色"]}]'::jsonb WHERE simp = '落' AND trad = '落';

-- 和 (和)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"he","zhuyin":[["ㄏ","ㄜ","˙"]],"meanings":["and","with","harmony"],"context_words":[]},{"pinyin":"huo","zhuyin":[["ㄏ","ㄨㄛ","˙"]],"meanings":["to respond in singing","to join in"],"context_words":["搀和","搅和"]},{"pinyin":"huò","zhuyin":[["ㄏ","ㄨㄛ","ˋ"]],"meanings":["soft","warm"],"context_words":["和藥","两和"]},{"pinyin":"huó","zhuyin":[["ㄏ","ㄨㄛ","ˊ"]],"meanings":["to mix","to blend"],"context_words":["和面","和泥"]},{"pinyin":"hè","zhuyin":[["ㄏ","ㄜ","ˋ"]],"meanings":["to complete a set (mahjong)"],"context_words":["和诗","應和"]},{"pinyin":"hé","zhuyin":[["ㄏ","ㄜ","ˊ"]],"meanings":["to make peace"],"context_words":["和睦","和谐"]},{"pinyin":"hú","zhuyin":[["ㄏ","ㄨ","ˊ"]],"meanings":["Japan"],"context_words":["和了"]}]'::jsonb WHERE simp = '和' AND trad = '和';

-- 差 (差)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chà","zhuyin":[["ㄔ","ㄚ","ˋ"]],"meanings":["poor","inferior","to lack"],"context_words":["差點儿","差劲"]},{"pinyin":"chài","zhuyin":[["ㄔ","ㄞ","ˋ"]],"meanings":["to send on an errand","job"],"context_words":[]},{"pinyin":"chā","zhuyin":[["ㄔ","ㄚ","ˉ"]],"meanings":["difference","error","to differ"],"context_words":["差錯","差池差可告慰","差强人意","差之毫厘","差別"]},{"pinyin":"chāi","zhuyin":[["ㄔ","ㄞ","ˉ"]],"meanings":["to dispatch","to assign"],"context_words":["差遣","差使差役","出差","聽差"]},{"pinyin":"cuō","zhuyin":[["ㄘ","ㄨㄛ","ˉ"]],"meanings":["uneven","irregular"],"context_words":[]},{"pinyin":"cī","zhuyin":[["ㄘ","","ˉ"]],"meanings":["almost","nearly"],"context_words":["参差"]},{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"meanings":["uneven","varying"],"context_words":[]}]'::jsonb WHERE simp = '差' AND trad = '差';

-- 处 (處)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chu","zhuyin":[["ㄔ","ㄨ","˙"]],"meanings":["everywhere","place"],"context_words":[]},{"pinyin":"chù","zhuyin":[["ㄔ","ㄨ","ˋ"]],"meanings":["advantage","benefit"],"context_words":["處所","處所","處長","妙處","住處"]},{"pinyin":"chǔ","zhuyin":[["ㄔ","ㄨ","ˇ"]],"meanings":["to deal with","to handle"],"context_words":["處罚","處置","處境","處方","處罚"]}]'::jsonb WHERE simp = '处' AND trad = '處';

-- 解 (解)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jiè","zhuyin":[["ㄐ","ㄧㄝ","ˋ"]],"meanings":["to solve","to understand"],"context_words":["解元","解送","押解","起解"]},{"pinyin":"jiě","zhuyin":[["ㄐ","ㄧㄝ","ˇ"]],"meanings":["to relax","to loosen"],"context_words":["解除","解渴","解嘲","解剖","瓦解"]},{"pinyin":"xiè","zhuyin":[["ㄒ","ㄧㄝ","ˋ"]],"meanings":["to escort","to transport"],"context_words":["解县","解不开","浑身解數","姓解"]}]'::jsonb WHERE simp = '解' AND trad = '解';

-- 尽 (盡)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jìn","zhuyin":[["ㄐ","ㄧㄣ","ˋ"]],"meanings":["despite","although"],"context_words":["尽心","尽力","尽職尽責","尽人皆知","人尽其才"]},{"pinyin":"jǐn","zhuyin":[["ㄐ","ㄧㄣ","ˇ"]],"meanings":["to exhaust","completely"],"context_words":["尽早","尽可能","尽著三天辦事","尽前邊","先尽"]}]'::jsonb WHERE simp = '尽' AND trad = '盡';

-- 通 (通)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"tòng","zhuyin":[["ㄊ","ㄨㄥ","ˋ"]],"meanings":["traffic","to pass through"],"context_words":["一通"]},{"pinyin":"tōng","zhuyin":[["ㄊ","ㄨㄥ","ˉ"]],"meanings":["classifier for actions"],"context_words":["通知","通過","交通"]}]'::jsonb WHERE simp = '通' AND trad = '通';

-- 说 (說)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shuì","zhuyin":[["ㄕ","ㄨㄟ","ˋ"]],"meanings":["to say","to speak"],"context_words":["說客","遊說"]},{"pinyin":"shuō","zhuyin":[["ㄕ","ㄨㄛ","ˉ"]],"meanings":["to persuade","to advise"],"context_words":["說话","說辞"]},{"pinyin":"yuè","zhuyin":[["","ㄩㄝ","ˋ"]],"meanings":["pleased","happy (archaic)"],"context_words":["不亦說乎"]}]'::jsonb WHERE simp = '说' AND trad = '說';

-- 车 (車)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chē","zhuyin":[["ㄔ","ㄜ","ˉ"]],"meanings":["vehicle","car"],"context_words":["車馬","車辆"]},{"pinyin":"jū","zhuyin":[["ㄐ","ㄩ","ˉ"]],"meanings":["chariot (in chess)"],"context_words":["象棋"]}]'::jsonb WHERE simp = '车' AND trad = '車';

-- 作 (作)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zuò","zhuyin":[["ㄗ","ㄨㄛ","ˋ"]],"meanings":["work","to do","to make"],"context_words":["工作","习作"]},{"pinyin":"zuó","zhuyin":[["ㄗ","ㄨㄛ","ˊ"]],"meanings":["workshop","to pretend"],"context_words":["作坊"]},{"pinyin":"zuō","zhuyin":[["ㄗ","ㄨㄛ","ˉ"]],"meanings":["yesterday"],"context_words":["作坊","銅器作"]}]'::jsonb WHERE simp = '作' AND trad = '作';

-- 识 (識)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shi","zhuyin":[["ㄕ","","˙"]],"meanings":["to know","knowledge"],"context_words":[]},{"pinyin":"shì","zhuyin":[["ㄕ","","ˋ"]],"meanings":["to recognize","consciousness"],"context_words":["標識"]},{"pinyin":"shí","zhuyin":[["ㄕ","","ˊ"]],"meanings":["to know (Taiwan pron.)"],"context_words":["識別","識字"]},{"pinyin":"zhì","zhuyin":[["ㄓ","","ˋ"]],"meanings":["to record","to note"],"context_words":["標識","强識"]}]'::jsonb WHERE simp = '识' AND trad = '識';

-- 过 (過)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"guo","zhuyin":[["ㄍ","ㄨㄛ","˙"]],"meanings":["to pass","to cross","past experience"],"context_words":[]},{"pinyin":"guò","zhuyin":[["ㄍ","ㄨㄛ","ˋ"]],"meanings":["experiential particle"],"context_words":["經過"]},{"pinyin":"guō","zhuyin":[["ㄍ","ㄨㄛ","ˉ"]],"meanings":["surname Guo"],"context_words":["姓過"]}]'::jsonb WHERE simp = '过' AND trad = '過';

-- 单 (單)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chán","zhuyin":[["ㄔ","ㄢ","ˊ"]],"meanings":["menu","list"],"context_words":["单于"]},{"pinyin":"dān","zhuyin":[["ㄉ","ㄢ","ˉ"]],"meanings":["single","alone"],"context_words":["单獨","簡单"]},{"pinyin":"shàn","zhuyin":[["ㄕ","ㄢ","ˋ"]],"meanings":["surname Shan"],"context_words":["单县","姓单"]}]'::jsonb WHERE simp = '单' AND trad = '單';

-- 空 (空)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"kòng","zhuyin":[["ㄎ","ㄨㄥ","ˋ"]],"meanings":["air conditioning","empty","sky"],"context_words":["空白","空閒","空額","空隙","空暇"]},{"pinyin":"kōng","zhuyin":[["ㄎ","ㄨㄥ","ˉ"]],"meanings":["empty","hollow"],"context_words":["空洞","空想","空忙","領空"]},{"pinyin":"kǒng","zhuyin":[["ㄎ","ㄨㄥ","ˇ"]],"meanings":["free time","blank space"],"context_words":["空白","有空"]}]'::jsonb WHERE simp = '空' AND trad = '空';

-- 转 (轉)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhuàn","zhuyin":[["ㄓ","ㄨㄢ","ˋ"]],"meanings":["to turn","to change","to transfer"],"context_words":["轉動","轉速","轉悠"]},{"pinyin":"zhuǎi","zhuyin":[["ㄓ","ㄨㄞ","ˇ"]],"meanings":["to waddle","to sway"],"context_words":["轉文"]},{"pinyin":"zhuǎn","zhuyin":[["ㄓ","ㄨㄢ","ˇ"]],"meanings":["to revolve","to rotate"],"context_words":["轉運","轉折","轉圜","轉身"]}]'::jsonb WHERE simp = '转' AND trad = '轉';

-- 色 (色)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shǎi","zhuyin":[["ㄕ","ㄞ","ˇ"]],"meanings":["color","appearance"],"context_words":["落色，顏色"]},{"pinyin":"sè","zhuyin":[["ㄙ","ㄜ","ˋ"]],"meanings":["color (colloquial)","dice"],"context_words":["色彩","色泽"]}]'::jsonb WHERE simp = '色' AND trad = '色';

-- 与 (與)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"yù","zhuyin":[["","ㄩ","ˋ"]],"meanings":["and","to give"],"context_words":["與會","與闻","参與"]},{"pinyin":"yú","zhuyin":[["","ㄩ","ˊ"]],"meanings":["to participate"],"context_words":[]},{"pinyin":"yǔ","zhuyin":[["","ㄩ","ˇ"]],"meanings":["(interrogative particle)"],"context_words":["與其","與人","與日","給與"]}]'::jsonb WHERE simp = '与' AND trad = '與';

-- 仔 (仔)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zī","zhuyin":[["ㄗ","","ˉ"]],"meanings":["meticulous","careful"],"context_words":["仔肩"]},{"pinyin":"zǎi","zhuyin":[["ㄗ","ㄞ","ˇ"]],"meanings":["young animal","kid"],"context_words":["打工仔","华仔","胖仔"]},{"pinyin":"zǐ","zhuyin":[["ㄗ","","ˇ"]],"meanings":["son (suffix)"],"context_words":["仔细","仔密","仔雞","仔猪","仔兽"]}]'::jsonb WHERE simp = '仔' AND trad = '仔';

-- 钥 (鑰)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"yuè","zhuyin":[["","ㄩㄝ","ˋ"]],"meanings":["key"],"context_words":["鎖鑰"]},{"pinyin":"yào","zhuyin":[["","ㄧㄠ","ˋ"]],"meanings":["key (variant)"],"context_words":["鑰匙"]}]'::jsonb WHERE simp = '钥' AND trad = '鑰';

-- 熟 (熟)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shóu","zhuyin":[["ㄕ","ㄡ","ˊ"]],"meanings":["familiar","ripe","cooked"],"context_words":["莊稼熟了","飯熟了"]},{"pinyin":"shú","zhuyin":[["ㄕ","ㄨ","ˊ"]],"meanings":["cooked (colloquial)"],"context_words":["熟悉","熟谙","熟稔","熟思","熟习"]}]'::jsonb WHERE simp = '熟' AND trad = '熟';

-- 纪 (紀)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jì","zhuyin":[["ㄐ","ㄧ","ˋ"]],"meanings":["century","record","age"],"context_words":["紀念","紀律"]},{"pinyin":"jǐ","zhuyin":[["ㄐ","ㄧ","ˇ"]],"meanings":["surname Ji"],"context_words":[]}]'::jsonb WHERE simp = '纪' AND trad = '紀';

-- 广 (廣)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"guǎng","zhuyin":[["ㄍ","ㄨㄤ","ˇ"]],"meanings":["broadcast","wide","extensive"],"context_words":["廣大","廣告","廣東"]},{"pinyin":"ān","zhuyin":[["","ㄢ","ˉ"]],"meanings":["lean-to shed","shelter"],"context_words":["廣庵"]}]'::jsonb WHERE simp = '广' AND trad = '廣';

-- 弄 (弄)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"nòng","zhuyin":[["ㄋ","ㄨㄥ","ˋ"]],"meanings":["to do","to manage","to handle"],"context_words":["弄錯","玩弄","擺弄"]},{"pinyin":"lòng","zhuyin":[["ㄌ","ㄨㄥ","ˋ"]],"meanings":["lane","alley"],"context_words":["弄堂","裡弄"]}]'::jsonb WHERE simp = '弄' AND trad = '弄';

-- 员 (員)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"yuán","zhuyin":[["","ㄩㄢ","ˊ"]],"meanings":["member","staff"],"context_words":["會員","演員","人員"]},{"pinyin":"yún","zhuyin":[["","ㄩㄣ","ˊ"]],"meanings":["round (archaic)"],"context_words":["員外"]},{"pinyin":"yùn","zhuyin":[["","ㄩㄣ","ˋ"]],"meanings":["surname Yun"],"context_words":["員外"]}]'::jsonb WHERE simp = '员' AND trad = '員';

-- 胖 (胖)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"pàn","zhuyin":[["ㄆ","ㄢ","ˋ"]],"meanings":["fat","plump"],"context_words":[]},{"pinyin":"pàng","zhuyin":[["ㄆ","ㄤ","ˋ"]],"meanings":["healthy","at ease"],"context_words":["肥胖"]},{"pinyin":"pán","zhuyin":[["ㄆ","ㄢ","ˊ"]],"meanings":["ease of mind"],"context_words":["心廣体胖"]}]'::jsonb WHERE simp = '胖' AND trad = '胖';

-- 节 (節)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jié","zhuyin":[["ㄐ","ㄧㄝ","ˊ"]],"meanings":["section","festival","holiday"],"context_words":["節操","節俭","節制","高風亮節"]},{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"meanings":["knot (in wood)","joint"],"context_words":["節骨眼儿"]}]'::jsonb WHERE simp = '节' AND trad = '節';

COMMIT;
