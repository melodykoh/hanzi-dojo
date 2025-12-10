-- Migration 015c: Convert context words to Traditional Chinese
-- Date: 2025-12-09
-- Converts 37 characters with simplified context words to traditional

BEGIN;

-- 分 (分)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"bàn","zhuyin":[["ㄅ","ㄢ","ˋ"]],"meanings":["minute","to divide","to separate"],"context_words":[]},{"pinyin":"fen","zhuyin":[["ㄈ","ㄣ","˙"]],"meanings":["part","component"],"context_words":[]},{"pinyin":"fèn","zhuyin":[["ㄈ","ㄣ","ˋ"]],"meanings":["share","portion"],"context_words":["分子","身分"]},{"pinyin":"fén","zhuyin":[["ㄈ","ㄣ","ˊ"]],"meanings":["grave","tomb"],"context_words":[]},{"pinyin":"fēn","zhuyin":[["ㄈ","ㄣ","ˉ"]],"meanings":["one tenth"],"context_words":["分數","區分"]}]'::jsonb WHERE simp = '分' AND trad = '分';

-- 和 (和)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"he","zhuyin":[["ㄏ","ㄜ","˙"]],"meanings":["and","with","harmony"],"context_words":[]},{"pinyin":"huo","zhuyin":[["ㄏ","ㄨㄛ","˙"]],"meanings":["to respond in singing","to join in"],"context_words":["搀和","搅和"]},{"pinyin":"huò","zhuyin":[["ㄏ","ㄨㄛ","ˋ"]],"meanings":["soft","warm"],"context_words":["和藥","兩和"]},{"pinyin":"huó","zhuyin":[["ㄏ","ㄨㄛ","ˊ"]],"meanings":["to mix","to blend"],"context_words":["和面","和泥"]},{"pinyin":"hè","zhuyin":[["ㄏ","ㄜ","ˋ"]],"meanings":["to complete a set (mahjong)"],"context_words":["和诗","應和"]},{"pinyin":"hé","zhuyin":[["ㄏ","ㄜ","ˊ"]],"meanings":["to make peace"],"context_words":["和睦","和谐"]},{"pinyin":"hú","zhuyin":[["ㄏ","ㄨ","ˊ"]],"meanings":["Japan"],"context_words":["和了"]}]'::jsonb WHERE simp = '和' AND trad = '和';

-- 差 (差)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chà","zhuyin":[["ㄔ","ㄚ","ˋ"]],"meanings":["poor","inferior","to lack"],"context_words":["差點兒","差劲"]},{"pinyin":"chài","zhuyin":[["ㄔ","ㄞ","ˋ"]],"meanings":["to send on an errand","job"],"context_words":[]},{"pinyin":"chā","zhuyin":[["ㄔ","ㄚ","ˉ"]],"meanings":["difference","error","to differ"],"context_words":["差錯","差池差可告慰","差强人意","差之毫厘","差別"]},{"pinyin":"chāi","zhuyin":[["ㄔ","ㄞ","ˉ"]],"meanings":["to dispatch","to assign"],"context_words":["差遣","差使差役","出差","聽差"]},{"pinyin":"cuō","zhuyin":[["ㄘ","ㄨㄛ","ˉ"]],"meanings":["uneven","irregular"],"context_words":[]},{"pinyin":"cī","zhuyin":[["ㄘ","","ˉ"]],"meanings":["almost","nearly"],"context_words":["參差"]},{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"meanings":["uneven","varying"],"context_words":[]}]'::jsonb WHERE simp = '差' AND trad = '差';

-- 解 (解)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jiè","zhuyin":[["ㄐ","ㄧㄝ","ˋ"]],"meanings":["to solve","to understand"],"context_words":["解元","解送","押解","起解"]},{"pinyin":"jiě","zhuyin":[["ㄐ","ㄧㄝ","ˇ"]],"meanings":["to relax","to loosen"],"context_words":["解除","解渴","解嘲","解剖","瓦解"]},{"pinyin":"xiè","zhuyin":[["ㄒ","ㄧㄝ","ˋ"]],"meanings":["to escort","to transport"],"context_words":["解縣","解不開","浑身解數","姓解"]}]'::jsonb WHERE simp = '解' AND trad = '解';

-- 说 (說)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shuì","zhuyin":[["ㄕ","ㄨㄟ","ˋ"]],"meanings":["to say","to speak"],"context_words":["說客","遊說"]},{"pinyin":"shuō","zhuyin":[["ㄕ","ㄨㄛ","ˉ"]],"meanings":["to persuade","to advise"],"context_words":["說話","說辞"]},{"pinyin":"yuè","zhuyin":[["","ㄩㄝ","ˋ"]],"meanings":["pleased","happy (archaic)"],"context_words":["不亦說乎"]}]'::jsonb WHERE simp = '说' AND trad = '說';

-- 车 (車)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chē","zhuyin":[["ㄔ","ㄜ","ˉ"]],"meanings":["vehicle","car"],"context_words":["車馬","車輛"]},{"pinyin":"jū","zhuyin":[["ㄐ","ㄩ","ˉ"]],"meanings":["chariot (in chess)"],"context_words":["象棋"]}]'::jsonb WHERE simp = '车' AND trad = '車';

-- 作 (作)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zuò","zhuyin":[["ㄗ","ㄨㄛ","ˋ"]],"meanings":["work","to do","to make"],"context_words":["工作","習作"]},{"pinyin":"zuó","zhuyin":[["ㄗ","ㄨㄛ","ˊ"]],"meanings":["workshop","to pretend"],"context_words":["作坊"]},{"pinyin":"zuō","zhuyin":[["ㄗ","ㄨㄛ","ˉ"]],"meanings":["yesterday"],"context_words":["作坊","銅器作"]}]'::jsonb WHERE simp = '作' AND trad = '作';

-- 为 (為)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"wèi","zhuyin":[["ㄨ","ㄟ","ˋ"]],"meanings":["for","because of","to"],"context_words":["因為","為了","為什麼"]},{"pinyin":"wéi","zhuyin":[["ㄨ","ㄟ","ˊ"]],"meanings":["as","to act as","to serve as","to become","to be"],"context_words":["作為","認為","成為","行為"]}]'::jsonb WHERE simp = '为' AND trad = '為';

-- 教 (教)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jiāo","zhuyin":[["ㄐ","ㄧㄠ","ˉ"]],"meanings":["to teach","to instruct"],"context_words":["教書","教會","教給"]},{"pinyin":"jiào","zhuyin":[["ㄐ","ㄧㄠ","ˋ"]],"meanings":["teaching","religion","to cause","to tell"],"context_words":["教育","教室","宗教","教學"]}]'::jsonb WHERE simp = '教' AND trad = '教';

-- 单 (單)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"chán","zhuyin":[["ㄔ","ㄢ","ˊ"]],"meanings":["menu","list"],"context_words":["單於"]},{"pinyin":"dān","zhuyin":[["ㄉ","ㄢ","ˉ"]],"meanings":["single","alone"],"context_words":["單獨","簡單"]},{"pinyin":"shàn","zhuyin":[["ㄕ","ㄢ","ˋ"]],"meanings":["surname Shan"],"context_words":["單縣","姓單"]}]'::jsonb WHERE simp = '单' AND trad = '單';

-- 便 (便)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"biàn","zhuyin":[["ㄅ","ㄧㄢ","ˋ"]],"meanings":["convenient","suitable","informal"],"context_words":["方便","便利","便於"]},{"pinyin":"pián","zhuyin":[["ㄆ","ㄧㄢ","ˊ"]],"meanings":["cheap (in 便宜)"],"context_words":["便宜"]}]'::jsonb WHERE simp = '便' AND trad = '便';

-- 还 (還)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"hái","zhuyin":[["ㄏ","ㄞ","ˊ"]],"meanings":["still","yet","even more","also","in addition"],"context_words":["還有","還是","還好"]},{"pinyin":"huán","zhuyin":[["ㄏ","ㄨㄢ","ˊ"]],"meanings":["to return","to give back","to pay back"],"context_words":["還錢","歸還","償還"]}]'::jsonb WHERE simp = '还' AND trad = '還';

-- 与 (與)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"yù","zhuyin":[["","ㄩ","ˋ"]],"meanings":["and","to give"],"context_words":["與會","與聞","參與"]},{"pinyin":"yú","zhuyin":[["","ㄩ","ˊ"]],"meanings":["to participate"],"context_words":[]},{"pinyin":"yǔ","zhuyin":[["","ㄩ","ˇ"]],"meanings":["(interrogative particle)"],"context_words":["與其","與人","與日","給與"]}]'::jsonb WHERE simp = '与' AND trad = '與';

-- 仔 (仔)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zī","zhuyin":[["ㄗ","","ˉ"]],"meanings":["meticulous","careful"],"context_words":["仔肩"]},{"pinyin":"zǎi","zhuyin":[["ㄗ","ㄞ","ˇ"]],"meanings":["young animal","kid"],"context_words":["打工仔","华仔","胖仔"]},{"pinyin":"zǐ","zhuyin":[["ㄗ","","ˇ"]],"meanings":["son (suffix)"],"context_words":["仔細","仔密","仔雞","仔猪","仔兽"]}]'::jsonb WHERE simp = '仔' AND trad = '仔';

-- 熟 (熟)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shóu","zhuyin":[["ㄕ","ㄡ","ˊ"]],"meanings":["familiar","ripe","cooked"],"context_words":["莊稼熟了","飯熟了"]},{"pinyin":"shú","zhuyin":[["ㄕ","ㄨ","ˊ"]],"meanings":["cooked (colloquial)"],"context_words":["熟悉","熟谙","熟稔","熟思","熟習"]}]'::jsonb WHERE simp = '熟' AND trad = '熟';

-- 将 (將)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jiāng","zhuyin":[["ㄐ","ㄧㄤ","ˉ"]],"meanings":["will","shall","just"],"context_words":["將來","將要"]},{"pinyin":"jiàng","zhuyin":[["ㄐ","ㄧㄤ","ˋ"]],"meanings":["general","to command"],"context_words":["將軍","大將"]}]'::jsonb WHERE simp = '将' AND trad = '將';

-- 应 (應)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"yīng","zhuyin":[["ㄧ","ㄥ","ˉ"]],"meanings":["should","ought to"],"context_words":["應該","應當"]},{"pinyin":"yìng","zhuyin":[["ㄧ","ㄥ","ˋ"]],"meanings":["to respond","to answer"],"context_words":["答應","反應","應用"]}]'::jsonb WHERE simp = '应' AND trad = '應';

-- 重 (重)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhòng","zhuyin":[["ㄓ","ㄨㄥ","ˋ"]],"meanings":["heavy","serious","important","to attach importance to"],"context_words":["重要","體重","重量","嚴重"]},{"pinyin":"chóng","zhuyin":[["ㄔ","ㄨㄥ","ˊ"]],"meanings":["to repeat","again","re-","layer"],"context_words":["重復","重新","重來"]}]'::jsonb WHERE simp = '重' AND trad = '重';

-- 胖 (胖)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"pàn","zhuyin":[["ㄆ","ㄢ","ˋ"]],"meanings":["fat","plump"],"context_words":[]},{"pinyin":"pàng","zhuyin":[["ㄆ","ㄤ","ˋ"]],"meanings":["healthy","at ease"],"context_words":["肥胖"]},{"pinyin":"pán","zhuyin":[["ㄆ","ㄢ","ˊ"]],"meanings":["ease of mind"],"context_words":["心廣體胖"]}]'::jsonb WHERE simp = '胖' AND trad = '胖';

-- 节 (節)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jié","zhuyin":[["ㄐ","ㄧㄝ","ˊ"]],"meanings":["section","festival","holiday"],"context_words":["節操","節俭","節制","高風亮節"]},{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"meanings":["knot (in wood)","joint"],"context_words":["節骨眼兒"]}]'::jsonb WHERE simp = '节' AND trad = '節';

-- 脚 (腳)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jiǎo","zhuyin":[["ㄐ","ㄧㄠ","ˇ"]],"meanings":["foot","leg","base"],"context_words":["腳本","根腳"]},{"pinyin":"jué","zhuyin":[["ㄐ","ㄩㄝ","ˊ"]],"meanings":["role","actor"],"context_words":["腳兒"]}]'::jsonb WHERE simp = '脚' AND trad = '腳';

-- 量 (量)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"liàng","zhuyin":[["ㄌ","ㄧㄤ","ˋ"]],"meanings":["quantity","amount","capacity"],"context_words":["數量","質量","大量"]},{"pinyin":"liáng","zhuyin":[["ㄌ","ㄧㄤ","ˊ"]],"meanings":["to measure"],"context_words":["測量","量體溫"]}]'::jsonb WHERE simp = '量' AND trad = '量';

-- 什 (什)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shén","zhuyin":[["ㄕ","ㄣ","ˊ"]],"meanings":["what (in 什么)"],"context_words":["什麼","為什麼"]},{"pinyin":"shí","zhuyin":[["ㄕ","ˊ",null]],"meanings":["ten","assorted"],"context_words":["什錦"]}]'::jsonb WHERE simp = '什' AND trad = '什';

-- 几 (幾)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jǐ","zhuyin":[["ㄐ","ㄧ","ˇ"]],"meanings":["how many","several","a few"],"context_words":["幾個","幾天","好幾"]},{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"meanings":["small table","almost"],"context_words":["茶幾","幾乎"]}]'::jsonb WHERE simp = '几' AND trad = '幾';

-- 只 (隻)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhī","zhuyin":[["ㄓ","","ˉ"]],"meanings":["classifier for animals, body parts"],"context_words":["一隻貓","兩隻手","一隻鳥"]},{"pinyin":"zhǐ","zhuyin":[["ㄓ","","ˇ"]],"meanings":["only","merely"],"context_words":["隻是","隻有","隻好"]}]'::jsonb WHERE simp = '只' AND trad = '隻';

-- 当 (當)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"dang","zhuyin":[["ㄉ","ㄤ","˙"]],"meanings":["of course","naturally"],"context_words":[]},{"pinyin":"dàng","zhuyin":[["ㄉ","ㄤ","ˋ"]],"meanings":["should","act as","work as"],"context_words":["當日","當年","當真","當铺","一人當兩人用"]},{"pinyin":"dāng","zhuyin":[["ㄉ","ㄤ","ˉ"]],"meanings":["to match","sound of bells"],"context_words":["當場","當今","當時","當年","當日"]}]'::jsonb WHERE simp = '当' AND trad = '當';

-- 脏 (髒)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zàng","zhuyin":[["ㄗ","ㄤ","ˋ"]],"meanings":["dirty","filthy"],"context_words":["髒腑","心髒","內髒"]},{"pinyin":"zāng","zhuyin":[["ㄗ","ㄤ","ˉ"]],"meanings":["internal organ"],"context_words":["肮髒"]}]'::jsonb WHERE simp = '脏' AND trad = '髒';

-- 数 (數)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"shu","zhuyin":[["ㄕ","ㄨ","˙"]],"meanings":["mathematics","number"],"context_words":[]},{"pinyin":"shuò","zhuyin":[["ㄕ","ㄨㄛ","ˋ"]],"meanings":["to count","to enumerate"],"context_words":["數見不鮮"]},{"pinyin":"shù","zhuyin":[["ㄕ","ㄨ","ˋ"]],"meanings":["frequently","repeatedly"],"context_words":["數字","數目"]},{"pinyin":"shǔ","zhuyin":[["ㄕ","ㄨ","ˇ"]],"meanings":["amount","quantity"],"context_words":["數落","數數"]}]'::jsonb WHERE simp = '数' AND trad = '數';

-- 切 (切)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"qiē","zhuyin":[["ㄑ","ㄧㄝ","ˉ"]],"meanings":["to cut","to slice"],"context_words":["切菜","切開","切斷"]},{"pinyin":"qiè","zhuyin":[["ㄑ","ㄧㄝ","ˋ"]],"meanings":["close to","eager","definitely"],"context_words":["切實","親切","一切"]}]'::jsonb WHERE simp = '切' AND trad = '切';

-- 结 (結)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jié","zhuyin":[["ㄐ","ㄧㄝ","ˊ"]],"meanings":["knot","to tie","to conclude"],"context_words":["結果","結束","結婚"]},{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"meanings":["to bear fruit"],"context_words":["結果實"]}]'::jsonb WHERE simp = '结' AND trad = '結';

-- 着 (著)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"zhe","zhuyin":[["ㄓ","ㄜ","˙"]],"meanings":["aspect particle (ongoing action)"],"context_words":["看著","走著","聽著"]},{"pinyin":"zhuó","zhuyin":[["ㄓ","ㄨㄛ","ˊ"]],"meanings":["to wear","to apply","to use"],"context_words":["著落","著重","著手","著力","著装"]},{"pinyin":"zháo","zhuyin":[["ㄓ","ㄠ","ˊ"]],"meanings":["to touch","to feel","to catch fire"],"context_words":["著急","著迷","著涼","著忙","著魔"]},{"pinyin":"zhāo","zhuyin":[["ㄓ","ㄠ","ˉ"]],"meanings":["move (chess)","trick","tactic"],"context_words":["著數","失著","高著"]}]'::jsonb WHERE simp = '着' AND trad = '著';

-- 的 (的)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"de","zhuyin":[["ㄉ","ㄜ","˙"]],"meanings":["possessive particle","structural particle"],"context_words":[]},{"pinyin":"dì","zhuyin":[["ㄉ","ㄧ","ˋ"]],"meanings":["truly","indeed"],"context_words":["有的放矢","目的","中的"]},{"pinyin":"dí","zhuyin":[["ㄉ","ㄧ","ˊ"]],"meanings":["target","bulls-eye"],"context_words":["的當","的確","的證"]}]'::jsonb WHERE simp = '的' AND trad = '的';

-- 发 (發)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"fa","zhuyin":[["ㄈ","ㄚ","˙"]],"meanings":["to send","to issue","to develop"],"context_words":[]},{"pinyin":"fà","zhuyin":[["ㄈ","ㄚ","ˋ"]],"meanings":["hair (on head)"],"context_words":["發型","令人發指","理發","結發"]},{"pinyin":"fā","zhuyin":[["ㄈ","ㄚ","ˉ"]],"meanings":["to have a fever"],"context_words":["發表","發端","發窘","發掘","打發"]}]'::jsonb WHERE simp = '发' AND trad = '發';

-- 落 (落)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"luò","zhuyin":[["ㄌ","ㄨㄛ","ˋ"]],"meanings":["to fall","to drop","to set"],"context_words":["落魄","著落"]},{"pinyin":"luō","zhuyin":[["ㄌ","ㄨㄛ","ˉ"]],"meanings":["colloquial for falling"],"context_words":[]},{"pinyin":"là","zhuyin":[["ㄌ","ㄚ","ˋ"]],"meanings":["to leave behind","to lag"],"context_words":["落下","丟三落四"]},{"pinyin":"lào","zhuyin":[["ㄌ","ㄠ","ˋ"]],"meanings":["to fall (rain)","village"],"context_words":["落枕","落色"]}]'::jsonb WHERE simp = '落' AND trad = '落';

-- 尽 (盡)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"jìn","zhuyin":[["ㄐ","ㄧㄣ","ˋ"]],"meanings":["despite","although"],"context_words":["盡心","盡力","盡職盡責","盡人皆知","人盡其才"]},{"pinyin":"jǐn","zhuyin":[["ㄐ","ㄧㄣ","ˇ"]],"meanings":["to exhaust","completely"],"context_words":["盡早","盡可能","盡著三天辦事","盡前邊","先盡"]}]'::jsonb WHERE simp = '尽' AND trad = '盡';

-- 吗 (嗎)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"ma","zhuyin":[["ㄇ","ㄚ","˙"]],"meanings":["question particle"],"context_words":["你好嗎","是嗎","對嗎"]},{"pinyin":"má","zhuyin":[["ㄇ","ㄚ","ˊ"]],"meanings":["what (dialectal)"],"context_words":["嗎啡"]},{"pinyin":"mǎ","zhuyin":[["ㄇ","ㄚ","ˇ"]],"meanings":["morphine (transliteration)"],"context_words":["嗎啡"]}]'::jsonb WHERE simp = '吗' AND trad = '嗎';

-- 思 (思)
UPDATE dictionary_entries SET zhuyin_variants = '[{"pinyin":"sī","zhuyin":[["ㄙ","","ˉ"]],"meanings":["to think","meaning","idea"],"context_words":["思想","意思","思考"]},{"pinyin":"sāi","zhuyin":[["ㄙ","ㄞ","ˉ"]],"meanings":["(phonetic component)"],"context_words":["於思"]}]'::jsonb WHERE simp = '思' AND trad = '思';

COMMIT;
