-- Migration 011g: Fill context_words for remaining 011c characters
-- Date: 2025-12-08
-- Issue: #26 (https://github.com/melodykoh/hanzi-dojo/issues/26)
--
-- Migration 011c added zhuyin_variants to 101 characters but with empty context_words.
-- Migration 011e fixed 43 of those (the malformed ones).
-- This migration fills context_words for the remaining 68 characters.
--
-- Source: data/context_words_011c_remaining.json

BEGIN;

-- Character: 么 (麼)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"me","zhuyin":[["ㄇ","ㄜ","˙"]],"context_words":["什麼","怎麼","那麼"],"meanings":["what? (replaces the noun to turn a statement into a question)","how?"]},{"pinyin":"mó","zhuyin":[["ㄇ","ㄛ","ˊ"]],"context_words":["幺麼"],"meanings":["what? (replaces the noun to turn a statement into a question)","how?"]}]'::jsonb
WHERE simp = '么'
  AND trad = '麼';

-- Character: 化 (化)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"huà","zhuyin":[["ㄏ","ㄨㄚ","ˋ"]],"context_words":["變化","文化","化學"],"meanings":["change","culture; civilization"]},{"pinyin":"huā","zhuyin":[["ㄏ","ㄨㄚ","ˉ"]],"context_words":["化子"],"meanings":["change","culture; civilization"]}]'::jsonb
WHERE simp = '化'
  AND trad = '化';

-- Character: 匙 (匙)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chí","zhuyin":[["ㄔ","","ˊ"]],"context_words":["鑰匙","湯匙"],"meanings":["key"]},{"pinyin":"shi","zhuyin":[["ㄕ","","˙"]],"context_words":["鑰匙"],"meanings":["key"]}]'::jsonb
WHERE simp = '匙'
  AND trad = '匙';

-- Character: 区 (區)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qū","zhuyin":[["ㄑ","ㄩ","ˉ"]],"context_words":["地區","區別","區域"],"meanings":["suburbs; outskirts","difference; distinguish"]},{"pinyin":"ōu","zhuyin":[["","ㄡ","ˉ"]],"context_words":["姓氏"],"meanings":["suburbs; outskirts","difference; distinguish"]}]'::jsonb
WHERE simp = '区'
  AND trad = '區';

-- Character: 占 (占)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhàn","zhuyin":[["ㄓ","ㄢ","ˋ"]],"context_words":["佔領","佔用","佔據"],"meanings":["the (phone) line is busy"]},{"pinyin":"zhān","zhuyin":[["ㄓ","ㄢ","ˉ"]],"context_words":["占卜","占卦"],"meanings":["the (phone) line is busy"]}]'::jsonb
WHERE simp = '占'
  AND trad = '占';

-- Character: 卡 (卡)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"kǎ","zhuyin":[["ㄎ","ㄚ","ˇ"]],"context_words":["卡片","信用卡","卡車"],"meanings":["credit card"]},{"pinyin":"qiǎ","zhuyin":[["ㄑ","ㄧㄚ","ˇ"]],"context_words":["關卡","卡住","卡脖子"],"meanings":["credit card"]}]'::jsonb
WHERE simp = '卡'
  AND trad = '卡';

-- Character: 压 (壓)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yā","zhuyin":[["","ㄧㄚ","ˉ"]],"context_words":["壓力","壓迫","血壓"],"meanings":["pressure; stress"]},{"pinyin":"yà","zhuyin":[["","ㄧㄚ","ˋ"]],"context_words":["壓根兒"],"meanings":["pressure; stress"]}]'::jsonb
WHERE simp = '压'
  AND trad = '壓';

-- Character: 句 (句)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jù","zhuyin":[["ㄐ","ㄩ","ˋ"]],"context_words":["句子","造句","一句話"],"meanings":["sentence"]},{"pinyin":"gōu","zhuyin":[["ㄍ","ㄡ","ˉ"]],"context_words":["高句麗"],"meanings":["sentence"]}]'::jsonb
WHERE simp = '句'
  AND trad = '句';

-- Character: 可 (可)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"kě","zhuyin":[["ㄎ","ㄜ","ˇ"]],"context_words":["可以","可能","可是"],"meanings":["possible; maybe","can; may; possible; okay"]},{"pinyin":"kè","zhuyin":[["ㄎ","ㄜ","ˋ"]],"context_words":["可汗"],"meanings":["possible; maybe","can; may; possible; okay"]}]'::jsonb
WHERE simp = '可'
  AND trad = '可';

-- Character: 台 (台)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tái","zhuyin":[["ㄊ","ㄞ","ˊ"]],"context_words":["台灣","電視台","舞台"],"meanings":["platform; Taiwan (abbr.); desk; stage; typhoon; (mw for machines); (classical) you (in letters)"]},{"pinyin":"tāi","zhuyin":[["ㄊ","ㄞ","ˉ"]],"context_words":["天台山"],"meanings":["platform; Taiwan (abbr.); desk; stage; typhoon; (mw for machines); (classical) you (in letters)"]}]'::jsonb
WHERE simp = '台'
  AND trad = '台';

-- Character: 各 (各)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gè","zhuyin":[["ㄍ","ㄜ","ˋ"]],"context_words":["各位","各種","各自"],"meanings":["each; every"]},{"pinyin":"gě","zhuyin":[["ㄍ","ㄜ","ˇ"]],"context_words":["自各兒"],"meanings":["each; every"]}]'::jsonb
WHERE simp = '各'
  AND trad = '各';

-- Character: 合 (合)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"hé","zhuyin":[["ㄏ","ㄜ","ˊ"]],"context_words":["合作","結合","合適"],"meanings":["in keeping with; in accordance with; conform","qualified; up to standard"]},{"pinyin":"gě","zhuyin":[["ㄍ","ㄜ","ˇ"]],"context_words":["公合"],"meanings":["in keeping with; in accordance with; conform","qualified; up to standard"]}]'::jsonb
WHERE simp = '合'
  AND trad = '合';

-- Character: 否 (否)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fǒu","zhuyin":[["ㄈ","ㄡ","ˇ"]],"context_words":["是否","否則","否認"],"meanings":["if not; otherwise; or else","whether (or not); if"]},{"pinyin":"pǐ","zhuyin":[["ㄆ","","ˇ"]],"context_words":["否極泰來"],"meanings":["if not; otherwise; or else","whether (or not); if"]}]'::jsonb
WHERE simp = '否'
  AND trad = '否';

-- Character: 吧 (吧)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"ba","zhuyin":[["ㄅ","ㄚ","˙"]],"context_words":["好吧","走吧","是吧"],"meanings":["particle indicating polite suggestion; | onomatopoeia | bar (serving drinks, providing internet access, etc.)"]},{"pinyin":"bā","zhuyin":[["ㄅ","ㄚ","ˉ"]],"context_words":["酒吧","網吧"],"meanings":["particle indicating polite suggestion; | onomatopoeia | bar (serving drinks, providing internet access, etc.)"]}]'::jsonb
WHERE simp = '吧'
  AND trad = '吧';

-- Character: 呀 (呀)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"ya","zhuyin":[["","ㄧㄚ","˙"]],"context_words":["啊呀","快呀"],"meanings":["ah; oh; (used for 啊 after words ending with a, e, i, o, or ü)"]},{"pinyin":"yā","zhuyin":[["","ㄧㄚ","ˉ"]],"context_words":["呀呀學語"],"meanings":["ah; oh; (used for 啊 after words ending with a, e, i, o, or ü)"]}]'::jsonb
WHERE simp = '呀'
  AND trad = '呀';

-- Character: 咖 (咖)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"kā","zhuyin":[["ㄎ","ㄚ","ˉ"]],"context_words":["咖啡"],"meanings":["coffee"]},{"pinyin":"gā","zhuyin":[["ㄍ","ㄚ","ˉ"]],"context_words":["咖哩"],"meanings":["coffee"]}]'::jsonb
WHERE simp = '咖'
  AND trad = '咖';

-- Character: 咳 (咳)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"ké","zhuyin":[["ㄎ","ㄜ","ˊ"]],"context_words":["咳嗽"],"meanings":["to cough"]},{"pinyin":"hāi","zhuyin":[["ㄏ","ㄞ","ˉ"]],"context_words":["咳聲嘆氣"],"meanings":["to cough"]}]'::jsonb
WHERE simp = '咳'
  AND trad = '咳';

-- Character: 填 (填)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tián","zhuyin":[["ㄊ","ㄧㄢ","ˊ"]],"context_words":["填寫","填空","填補"],"meanings":["fill in the blanks; fill a vacancy"]},{"pinyin":"zhèn","zhuyin":[["ㄓ","ㄣ","ˋ"]],"context_words":["填然"],"meanings":["fill in the blanks; fill a vacancy"]}]'::jsonb
WHERE simp = '填'
  AND trad = '填';

-- Character: 夫 (夫)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fū","zhuyin":[["ㄈ","ㄨ","ˉ"]],"context_words":["丈夫","大夫","農夫"],"meanings":["husband; man","doctor; physician"]},{"pinyin":"fú","zhuyin":[["ㄈ","ㄨ","ˊ"]],"context_words":["夫子"],"meanings":["husband; man","doctor; physician"]}]'::jsonb
WHERE simp = '夫'
  AND trad = '夫';

-- Character: 奇 (奇)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qí","zhuyin":[["ㄑ","ㄧ","ˊ"]],"context_words":["奇怪","奇蹟","好奇"],"meanings":["strange; odd"]},{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"context_words":["奇偶","奇數"],"meanings":["strange; odd"]}]'::jsonb
WHERE simp = '奇'
  AND trad = '奇';

-- Character: 妻 (妻)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qī","zhuyin":[["ㄑ","ㄧ","ˉ"]],"context_words":["妻子","夫妻"],"meanings":["wife"]},{"pinyin":"qì","zhuyin":[["ㄑ","ㄧ","ˋ"]],"context_words":["妻之"],"meanings":["wife"]}]'::jsonb
WHERE simp = '妻'
  AND trad = '妻';

-- Character: 孙 (孫)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"sūn","zhuyin":[["ㄙ","ㄨㄣ","ˉ"]],"context_words":["孫子","外孫","子孫"],"meanings":["grandson; son''s son"]},{"pinyin":"xùn","zhuyin":[["ㄒ","ㄩㄣ","ˋ"]],"context_words":["孫臏"],"meanings":["grandson; son''s son"]}]'::jsonb
WHERE simp = '孙'
  AND trad = '孫';

-- Character: 底 (底)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dǐ","zhuyin":[["ㄉ","ㄧ","ˇ"]],"context_words":["到底","底下","海底"],"meanings":["after all; in the end (used in a question)","bottom; background; base"]},{"pinyin":"de","zhuyin":[["ㄉ","ㄜ","˙"]],"context_words":["你是啥底"],"meanings":["after all; in the end (used in a question)","bottom; background; base"]}]'::jsonb
WHERE simp = '底'
  AND trad = '底';

-- Character: 度 (度)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dù","zhuyin":[["ㄉ","ㄨ","ˋ"]],"context_words":["溫度","程度","速度"],"meanings":["speed; rate; velocity","manner; bearing; attitude"]},{"pinyin":"duó","zhuyin":[["ㄉ","ㄨㄛ","ˊ"]],"context_words":["猜度","忖度"],"meanings":["speed; rate; velocity","manner; bearing; attitude"]}]'::jsonb
WHERE simp = '度'
  AND trad = '度';

-- Character: 弄 (弄)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"nòng","zhuyin":[["ㄋ","ㄨㄥ","ˋ"]],"context_words":["弄錯","玩弄","擺弄"],"meanings":["do; manage; to handle; make"]},{"pinyin":"lòng","zhuyin":[["ㄌ","ㄨㄥ","ˋ"]],"context_words":["弄堂","里弄"],"meanings":["do; manage; to handle; make"]}]'::jsonb
WHERE simp = '弄'
  AND trad = '弄';

-- Character: 思 (思)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"sī","zhuyin":[["ㄙ","","ˉ"]],"context_words":["思想","意思","思考"],"meanings":["meaning; idea; opinion"]},{"pinyin":"sāi","zhuyin":[["ㄙ","ㄞ","ˉ"]],"context_words":["于思"],"meanings":["meaning; idea; opinion"]}]'::jsonb
WHERE simp = '思'
  AND trad = '思';

-- Character: 愉 (愉)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yú","zhuyin":[["","ㄩ","ˊ"]],"context_words":["愉快","愉悅"],"meanings":["happy; cheerful; delightful"]},{"pinyin":"tōu","zhuyin":[["ㄊ","ㄡ","ˉ"]],"context_words":["愉樂"],"meanings":["happy; cheerful; delightful"]}]'::jsonb
WHERE simp = '愉'
  AND trad = '愉';

-- Character: 戏 (戲)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xì","zhuyin":[["ㄒ","ㄧ","ˋ"]],"context_words":["遊戲","戲劇","唱戲"],"meanings":["game; play; recreation"]},{"pinyin":"hū","zhuyin":[["ㄏ","ㄨ","ˉ"]],"context_words":["於戲"],"meanings":["game; play; recreation"]}]'::jsonb
WHERE simp = '戏'
  AND trad = '戲';

-- Character: 打 (打)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dǎ","zhuyin":[["ㄉ","ㄚ","ˇ"]],"context_words":["打電話","打球","打開"],"meanings":["make a phone call","play basketball"]},{"pinyin":"dá","zhuyin":[["ㄉ","ㄚ","ˊ"]],"context_words":["一打"],"meanings":["make a phone call","play basketball"]}]'::jsonb
WHERE simp = '打'
  AND trad = '打';

-- Character: 择 (擇)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zé","zhuyin":[["ㄗ","ㄜ","ˊ"]],"context_words":["選擇","擇業"],"meanings":["select; to pick; choose"]},{"pinyin":"zhái","zhuyin":[["ㄓ","ㄞ","ˊ"]],"context_words":["擇菜","擇不開"],"meanings":["select; to pick; choose"]}]'::jsonb
WHERE simp = '择'
  AND trad = '擇';

-- Character: 拾 (拾)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shí","zhuyin":[["ㄕ","","ˊ"]],"context_words":["拾取","收拾","拾荒"],"meanings":["to tidy; put in order; to repair; to settle with; punish"]},{"pinyin":"shè","zhuyin":[["ㄕ","ㄜ","ˋ"]],"context_words":["拾級而上"],"meanings":["to tidy; put in order; to repair; to settle with; punish"]}]'::jsonb
WHERE simp = '拾'
  AND trad = '拾';

-- Character: 排 (排)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"pái","zhuyin":[["ㄆ","ㄞ","ˊ"]],"context_words":["排隊","排列","安排"],"meanings":["arrange; to plan","queue; stand in line"]},{"pinyin":"pǎi","zhuyin":[["ㄆ","ㄞ","ˇ"]],"context_words":["排子車"],"meanings":["arrange; to plan","queue; stand in line"]}]'::jsonb
WHERE simp = '排'
  AND trad = '排';

-- Character: 散 (散)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"sàn","zhuyin":[["ㄙ","ㄢ","ˋ"]],"context_words":["解散","分散","散步"],"meanings":["to go for a walk"]},{"pinyin":"sǎn","zhuyin":[["ㄙ","ㄢ","ˇ"]],"context_words":["散漫","鬆散","散文"],"meanings":["to go for a walk"]}]'::jsonb
WHERE simp = '散'
  AND trad = '散';

-- Character: 景 (景)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jǐng","zhuyin":[["ㄐ","ㄧㄥ","ˇ"]],"context_words":["風景","景色","背景"],"meanings":["scenery; landscape; scene; view"]},{"pinyin":"yǐng","zhuyin":[["","ㄧㄥ","ˇ"]],"context_words":["景從"],"meanings":["scenery; landscape; scene; view"]}]'::jsonb
WHERE simp = '景'
  AND trad = '景';

-- Character: 服 (服)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fú","zhuyin":[["ㄈ","ㄨ","ˊ"]],"context_words":["衣服","服務","舒服"],"meanings":["clothes","waiter/waitress; server; attendant"]},{"pinyin":"fù","zhuyin":[["ㄈ","ㄨ","ˋ"]],"context_words":["服藥"],"meanings":["clothes","waiter/waitress; server; attendant"]}]'::jsonb
WHERE simp = '服'
  AND trad = '服';

-- Character: 条 (條)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tiáo","zhuyin":[["ㄊ","ㄧㄠ","ˊ"]],"context_words":["條件","一條","條理"],"meanings":["noodles","strip; (mw for long thin objects); item"]},{"pinyin":"tiāo","zhuyin":[["ㄊ","ㄧㄠ","ˉ"]],"context_words":["條風"],"meanings":["noodles","strip; (mw for long thin objects); item"]}]'::jsonb
WHERE simp = '条'
  AND trad = '條';

-- Character: 查 (查)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chá","zhuyin":[["ㄔ","ㄚ","ˊ"]],"context_words":["檢查","查詢","調查"],"meanings":["to check; examine; inspect","investigate; survey; inquiry"]},{"pinyin":"zhā","zhuyin":[["ㄓ","ㄚ","ˉ"]],"context_words":["山查"],"meanings":["to check; examine; inspect","investigate; survey; inquiry"]}]'::jsonb
WHERE simp = '查'
  AND trad = '查';

-- Character: 校 (校)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xiào","zhuyin":[["ㄒ","ㄧㄠ","ˋ"]],"context_words":["學校","校園","校長"],"meanings":["school","principal (of school, college or university); president; headmaster"]},{"pinyin":"jiào","zhuyin":[["ㄐ","ㄧㄠ","ˋ"]],"context_words":["校對","校訂"],"meanings":["school","principal (of school, college or university); president; headmaster"]}]'::jsonb
WHERE simp = '校'
  AND trad = '校';

-- Character: 椅 (椅)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yǐ","zhuyin":[["","ㄧ","ˇ"]],"context_words":["椅子","輪椅","座椅"],"meanings":["chair"]},{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"context_words":["椅桐"],"meanings":["chair"]}]'::jsonb
WHERE simp = '椅'
  AND trad = '椅';

-- Character: 汗 (汗)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"hàn","zhuyin":[["ㄏ","ㄢ","ˋ"]],"context_words":["流汗","汗水","出汗"],"meanings":["sweat; perspiration; Khan"]},{"pinyin":"hán","zhuyin":[["ㄏ","ㄢ","ˊ"]],"context_words":["可汗"],"meanings":["sweat; perspiration; Khan"]}]'::jsonb
WHERE simp = '汗'
  AND trad = '汗';

-- Character: 汤 (湯)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tāng","zhuyin":[["ㄊ","ㄤ","ˉ"]],"context_words":["湯麵","雞湯","湯匙"],"meanings":["soup; broth"]},{"pinyin":"shāng","zhuyin":[["ㄕ","ㄤ","ˉ"]],"context_words":["湯湯水水"],"meanings":["soup; broth"]}]'::jsonb
WHERE simp = '汤'
  AND trad = '湯';

-- Character: 沙 (沙)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shā","zhuyin":[["ㄕ","ㄚ","ˉ"]],"context_words":["沙灘","沙漠","沙發"],"meanings":["sofa"]},{"pinyin":"shà","zhuyin":[["ㄕ","ㄚ","ˋ"]],"context_words":["沙沙聲"],"meanings":["sofa"]}]'::jsonb
WHERE simp = '沙'
  AND trad = '沙';

-- Character: 济 (濟)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jì","zhuyin":[["ㄐ","ㄧ","ˋ"]],"context_words":["經濟","濟南"],"meanings":["economy; economic"]},{"pinyin":"jǐ","zhuyin":[["ㄐ","ㄧ","ˇ"]],"context_words":["濟濟一堂"],"meanings":["economy; economic"]}]'::jsonb
WHERE simp = '济'
  AND trad = '濟';

-- Character: 父 (父)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fù","zhuyin":[["ㄈ","ㄨ","ˋ"]],"context_words":["父親","父母","祖父"],"meanings":["father"]},{"pinyin":"fǔ","zhuyin":[["ㄈ","ㄨ","ˇ"]],"context_words":["漁父"],"meanings":["father"]}]'::jsonb
WHERE simp = '父'
  AND trad = '父';

-- Character: 片 (片)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"piàn","zhuyin":[["ㄆ","ㄧㄢ","ˋ"]],"context_words":["照片","一片","影片"],"meanings":["picture; photograph"]},{"pinyin":"piān","zhuyin":[["ㄆ","ㄧㄢ","ˉ"]],"context_words":["片子"],"meanings":["picture; photograph"]}]'::jsonb
WHERE simp = '片'
  AND trad = '片';

-- Character: 甚 (甚)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shèn","zhuyin":[["ㄕ","ㄣ","ˋ"]],"context_words":["甚至","甚麼"],"meanings":["even (to the point of); so much so that"]},{"pinyin":"shén","zhuyin":[["ㄕ","ㄣ","ˊ"]],"context_words":["什麼"],"meanings":["even (to the point of); so much so that"]}]'::jsonb
WHERE simp = '甚'
  AND trad = '甚';

-- Character: 疑 (疑)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yí","zhuyin":[["","ㄧ","ˊ"]],"context_words":["懷疑","疑問","疑惑"],"meanings":["doubt; to suspect; be skeptical"]},{"pinyin":"nǐ","zhuyin":[["ㄋ","ㄧ","ˇ"]],"context_words":["疑似"],"meanings":["doubt; to suspect; be skeptical"]}]'::jsonb
WHERE simp = '疑'
  AND trad = '疑';

-- Character: 研 (研)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yán","zhuyin":[["","ㄧㄢ","ˊ"]],"context_words":["研究","研發","科研"],"meanings":["to study; to research"]},{"pinyin":"yàn","zhuyin":[["","ㄧㄢ","ˋ"]],"context_words":["研磨"],"meanings":["to study; to research"]}]'::jsonb
WHERE simp = '研'
  AND trad = '研';

-- Character: 硕 (碩)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shuò","zhuyin":[["ㄕ","ㄨㄛ","ˋ"]],"context_words":["碩士","碩大"],"meanings":["Master''s degree (M.A.)"]},{"pinyin":"shí","zhuyin":[["ㄕ","","ˊ"]],"context_words":["碩果"],"meanings":["Master''s degree (M.A.)"]}]'::jsonb
WHERE simp = '硕'
  AND trad = '碩';

-- Character: 票 (票)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"piào","zhuyin":[["ㄆ","ㄧㄠ","ˋ"]],"context_words":["門票","車票","機票"],"meanings":["ticket; bank note; a vote"]},{"pinyin":"piāo","zhuyin":[["ㄆ","ㄧㄠ","ˉ"]],"context_words":["票房"],"meanings":["ticket; bank note; a vote"]}]'::jsonb
WHERE simp = '票'
  AND trad = '票';

-- Character: 禁 (禁)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jìn","zhuyin":[["ㄐ","ㄧㄣ","ˋ"]],"context_words":["禁止","嚴禁","禁令"],"meanings":["to ban; prohibit"]},{"pinyin":"jīn","zhuyin":[["ㄐ","ㄧㄣ","ˉ"]],"context_words":["禁不住","不禁"],"meanings":["to ban; prohibit"]}]'::jsonb
WHERE simp = '禁'
  AND trad = '禁';

-- Character: 稍 (稍)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shāo","zhuyin":[["ㄕ","ㄠ","ˉ"]],"context_words":["稍微","稍等","稍後"],"meanings":["a little bit; slightly"]},{"pinyin":"shào","zhuyin":[["ㄕ","ㄠ","ˋ"]],"context_words":["稍息"],"meanings":["a little bit; slightly"]}]'::jsonb
WHERE simp = '稍'
  AND trad = '稍';

-- Character: 约 (約)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yuē","zhuyin":[["","ㄩㄝ","ˉ"]],"context_words":["約會","大約","約定"],"meanings":["approximately; about","frugal; to save"]},{"pinyin":"yāo","zhuyin":[["","ㄧㄠ","ˉ"]],"context_words":["約量"],"meanings":["approximately; about","frugal; to save"]}]'::jsonb
WHERE simp = '约'
  AND trad = '約';

-- Character: 肚 (肚)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dù","zhuyin":[["ㄉ","ㄨ","ˋ"]],"context_words":["肚子","肚皮"],"meanings":["belly; abdomen; stomach"]},{"pinyin":"dǔ","zhuyin":[["ㄉ","ㄨ","ˇ"]],"context_words":["牛肚","肚兒"],"meanings":["belly; abdomen; stomach"]}]'::jsonb
WHERE simp = '肚'
  AND trad = '肚';

-- Character: 胳 (胳)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gē","zhuyin":[["ㄍ","ㄜ","ˉ"]],"context_words":["胳膊","胳臂"],"meanings":["arm"]},{"pinyin":"gā","zhuyin":[["ㄍ","ㄚ","ˉ"]],"context_words":["胳肢窩"],"meanings":["arm"]}]'::jsonb
WHERE simp = '胳'
  AND trad = '胳';

-- Character: 膏 (膏)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gāo","zhuyin":[["ㄍ","ㄠ","ˉ"]],"context_words":["牙膏","膏藥","藥膏"],"meanings":["toothpaste"]},{"pinyin":"gào","zhuyin":[["ㄍ","ㄠ","ˋ"]],"context_words":["膏肓"],"meanings":["toothpaste"]}]'::jsonb
WHERE simp = '膏'
  AND trad = '膏';

-- Character: 苹 (蘋)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"píng","zhuyin":[["ㄆ","ㄧㄥ","ˊ"]],"context_words":["蘋果","蘋果手機"],"meanings":["apple"]},{"pinyin":"pēng","zhuyin":[["ㄆ","ㄥ","ˉ"]],"context_words":["蘋蘋"],"meanings":["apple"]}]'::jsonb
WHERE simp = '苹'
  AND trad = '蘋';

-- Character: 被 (被)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bèi","zhuyin":[["ㄅ","ㄟ","ˋ"]],"context_words":["被子","被動","被迫"],"meanings":["by (indicates passive voice sentences); a quilt/blanket"]},{"pinyin":"pī","zhuyin":[["ㄆ","","ˉ"]],"context_words":["被服"],"meanings":["by (indicates passive voice sentences); a quilt/blanket"]}]'::jsonb
WHERE simp = '被'
  AND trad = '被';

-- Character: 观 (觀)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"guān","zhuyin":[["ㄍ","ㄨㄢ","ˉ"]],"context_words":["觀看","參觀","觀點"],"meanings":["to visit (a place, such as a tourist spot); inspect","spectator; audience"]},{"pinyin":"guàn","zhuyin":[["ㄍ","ㄨㄢ","ˋ"]],"context_words":["道觀"],"meanings":["to visit (a place, such as a tourist spot); inspect","spectator; audience"]}]'::jsonb
WHERE simp = '观'
  AND trad = '觀';

-- Character: 论 (論)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"lùn","zhuyin":[["ㄌ","ㄨㄣ","ˋ"]],"context_words":["論文","討論","理論"],"meanings":["to discuss; discussion; to talk over","no matter what; regardless of whether..."]},{"pinyin":"lún","zhuyin":[["ㄌ","ㄨㄣ","ˊ"]],"context_words":["論語"],"meanings":["to discuss; discussion; to talk over","no matter what; regardless of whether..."]}]'::jsonb
WHERE simp = '论'
  AND trad = '論';

-- Character: 语 (語)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yǔ","zhuyin":[["","ㄩ","ˇ"]],"context_words":["語言","英語","詞語"],"meanings":["Chinese language","words and expressions; terms"]},{"pinyin":"yù","zhuyin":[["","ㄩ","ˋ"]],"context_words":["不以語人"],"meanings":["Chinese language","words and expressions; terms"]}]'::jsonb
WHERE simp = '语'
  AND trad = '語';

-- Character: 谁 (誰)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shuí","zhuyin":[["ㄕ","ㄨㄟ","ˊ"]],"context_words":["誰的","是誰","誰知道"],"meanings":["who"]},{"pinyin":"shéi","zhuyin":[["ㄕ","ㄟ","ˊ"]],"context_words":["誰都","誰也"],"meanings":["who"]}]'::jsonb
WHERE simp = '谁'
  AND trad = '誰';

-- Character: 责 (責)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zé","zhuyin":[["ㄗ","ㄜ","ˊ"]],"context_words":["責任","負責","責備"],"meanings":["responsible for (something); in charge of","responsibility; blame; duty"]},{"pinyin":"zhài","zhuyin":[["ㄓ","ㄞ","ˋ"]],"context_words":["債務"],"meanings":["responsible for (something); in charge of","responsibility; blame; duty"]}]'::jsonb
WHERE simp = '责'
  AND trad = '責';

-- Character: 赚 (賺)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhuàn","zhuyin":[["ㄓ","ㄨㄢ","ˋ"]],"context_words":["賺錢","賺取"],"meanings":["earn; make a profit"]},{"pinyin":"zuàn","zhuyin":[["ㄗ","ㄨㄢ","ˋ"]],"context_words":["賺頭"],"meanings":["earn; make a profit"]}]'::jsonb
WHERE simp = '赚'
  AND trad = '賺';

-- Character: 趟 (趟)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tàng","zhuyin":[["ㄊ","ㄤ","ˋ"]],"context_words":["走一趟","跑一趟"],"meanings":["(mw for trips times) | to wade"]},{"pinyin":"tāng","zhuyin":[["ㄊ","ㄤ","ˉ"]],"context_words":["趟水"],"meanings":["(mw for trips times) | to wade"]}]'::jsonb
WHERE simp = '趟'
  AND trad = '趟';

-- Character: 趣 (趣)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qù","zhuyin":[["ㄑ","ㄩ","ˋ"]],"context_words":["有趣","興趣","趣味"],"meanings":["be interested in","interesting; fascinating; amusing"]},{"pinyin":"cù","zhuyin":[["ㄘ","ㄨ","ˋ"]],"context_words":["趣趕"],"meanings":["be interested in","interesting; fascinating; amusing"]}]'::jsonb
WHERE simp = '趣'
  AND trad = '趣';

-- Character: 跳 (跳)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tiào","zhuyin":[["ㄊ","ㄧㄠ","ˋ"]],"context_words":["跳舞","跳躍","跳高"],"meanings":["to dance"]},{"pinyin":"táo","zhuyin":[["ㄊ","ㄠ","ˊ"]],"context_words":["跳脫"],"meanings":["to dance"]}]'::jsonb
WHERE simp = '跳'
  AND trad = '跳';

-- Character: 钢 (鋼)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gāng","zhuyin":[["ㄍ","ㄤ","ˉ"]],"context_words":["鋼鐵","鋼琴","鋼筆"],"meanings":["play the piano"]},{"pinyin":"gàng","zhuyin":[["ㄍ","ㄤ","ˋ"]],"context_words":["鋼鋼"],"meanings":["play the piano"]}]'::jsonb
WHERE simp = '钢'
  AND trad = '鋼';


-- Verification
DO $$
DECLARE
  empty_context_count INT;
BEGIN
  -- Count remaining entries with empty context_words
  SELECT COUNT(*) INTO empty_context_count
  FROM dictionary_entries
  WHERE zhuyin_variants IS NOT NULL
    AND length(simp) = 1
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(zhuyin_variants) v
      WHERE v->'context_words' IS NULL
         OR jsonb_array_length(v->'context_words') = 0
    );

  RAISE NOTICE 'Remaining entries with empty context_words: %', empty_context_count;
END $$;

COMMIT;
