/* 别慌 · 中英双语模块
   设计约束：不写 Cookie / localStorage / sessionStorage，不发起任何网络请求。
   语言状态只存在于内存中，刷新后回到中文。切换只改当前页面的文本节点与属性。 */
(function () {
  'use strict';

  /* 中文原文 => English。key 与页面中的中文文本逐字对应。 */
  var DICT = {
    /* 页面头部 */
    "向阳而生 · 慢慢变好 | sushine.xyz": "Sunward · Grow Better Slowly | sushine.xyz",
    "给焦虑、迷茫、疲惫的成年人留的一个泄压阀。进站即有柔和的大自然声，可切换细雨、森林、溪流、海浪、夜虫，看看空境、听听声音风景、做 60 秒呼吸、写一句想放下的话。无账号、无统计、无第三方请求。": "A pressure valve for anxious, lost, and tired adults. Gentle nature sounds play on arrival — light rain, forest, stream, ocean waves, night crickets. Watch the quiet scene, explore soundscapes, breathe for 60 seconds, or write a line and let it go. No account, no analytics, no third-party requests.",
    "心里有光，慢慢来。这里不用解决什么，先喘口气。": "Light in your heart, take it easy. You don't have to fix anything here — just breathe.",
    /* 品牌 / 导航 */
    "别慌，慢慢来 · 一个不用慌的角落": "No Rush, Take It Easy · A Quiet Corner",
    "别慌": "No Rush",
    "向阳而生": "Sunward",
    "向阳而生，慢慢变好。": "Grow toward the light, one day at a time.",
    "向阳而生，": "Grow toward the light, ",
    "慢慢变好。": "one day at a time.",
    "别慌，慢慢来。你不是一个人着急。": "No rush, take it easy. You're not the only one feeling this.",
    "sushine.xyz · 一个能喘口气的角落": "sushine.xyz · a corner to catch your breath",
    "向阳而生 · 别慌，慢慢来": "Sunward · No rush, take it easy",
    "一个不用慌的角落": "A corner to catch your breath",
    /* 四种轻体验入口 */
    "现在就试试": "Try one now",
    "60 秒放空": "60-second reset",
    "跟一次呼吸，回到眼前": "One breath, back to the present",
    "听会儿自然声": "Listen to nature",
    "5 种大自然声，随时切换": "5 nature sounds, switch anytime",
    "一图一声，点开就听": "One image, one sound — tap to listen",
    "写一句放下": "Write it down, let it go",
    "即焚，不留底": "Gone in a moment, kept nowhere",
    "少点慌": "Worry less",
    "睡得着": "Sleep better",
    "慢慢活": "Live slowly",
    "常见问题": "FAQ",
    "现在开始": "Start now",
    "慌啥子嘛": "What's the hurry?",
    "分区导航": "Section navigation",
    "Language / 语言": "Language / 语言",
    "开场": "Opening",
    "不管哪种心情，这四件事随便挑一件": "Whatever you're feeling, pick any one of these four",
    "此刻的心情": "How you feel now",
    "选择此刻的心情": "Choose how you feel now",
    "解压方式": "Ways to unwind",
    "切换天色": "Change the sky",
    "选择发泄小游戏": "Choose a release game",
    "写一句想放下的话": "Write one thing to let go",
    "写下来放下": "Write it down, let it go",
    "点击摔碎酒瓶": "Tap to smash the bottle",
    "点击戳破泡泡": "Tap to pop a bubble",
    "点击击打不倒翁木偶": "Tap to hit the weeble",

    /* Hero */
    "别慌，": "No rush, ",
    "慢慢来。": "take it easy.",
    "你不是一个人着急。": "You're not the only one feeling this.",
    "这里不用解决什么，也不用想明白什么。": "You don't have to fix anything or figure anything out here.",
    "先喘口气，剩下的，等喘匀了再说。": "Just breathe for a moment. The rest can wait.",
    "从这里开始": "Start here",
    "看看能做什么": "See what you can do",
    "完全免费 · 不用注册 · 不测不记不上传": "Free · No sign-up · No tracking, no storing, no uploading",

    /* 三大需求分区 */
    "心里发紧、坐不住的那几分钟，先别急着想通。有地方可以先把那口气撒出来。": "When your chest is tight and you can't sit still, don't rush to make sense of it. There's a place to let that breath out first.",
    "说说此刻": "Name this moment",
    "点一下心情，先被接住": "Tap how you feel. Let it be heard.",
    "撒撒气": "Let it out",
    "摔瓶子、戳泡泡、打不倒翁": "Smash bottles, pop bubbles, hit a weeble",
    "做回呼吸": "Come back to your breath",
    "跟着圆圈，慢下来": "Follow the circle. Slow down.",
    "夜里脑子停不下来的时候，换个天色，听会儿大自然的声音，什么都不用想。": "When your mind won't quiet at night, change the sky, listen to nature, and think about nothing.",
    "看看空境": "Watch the quiet view",
    "白天 / 黄昏 / 夜里，慢慢看": "Day / dusk / night — take your time",
    "听会儿雨声": "Listen to the rain",
    "自然声 · 背景音": "Nature · Ambient",
    "轻点开启大自然的声音": "Tap to turn on nature sounds",
    /* 大自然声景切换：细雨 / 森林 / 溪流 / 海浪 / 夜虫 */
    "选择大自然的声音": "Choose a nature sound",
    "细雨": "Light rain",
    "森林": "Forest",
    "溪流": "Stream",
    "海浪": "Waves",
    "夜虫": "Crickets",
    "林鸟": "Forest birds",
    "夏夜": "Summer night",
    "屋檐雨": "Eaves rain",
    "远雷": "Far thunder",
    "实录·": "Rec · ",
    "鸟鸣林": "Bird grove",
    "晨雾林": "Misty woods",
    "水岸鸟语": "Waters",
    "实录·鸟鸣林": "Rec · Bird grove",
    "实录·晨雾林": "Rec · Misty woods",
    "实录·水岸鸟语": "Rec · Waters",
    "鸟叫浓度": "Bird density",
    "关": "Off",
    "轻": "Low",
    "适中": "Mid",
    "浓": "High",
    "自然声以浏览器现场合成为主，不联网；三项「实录」为 tree.fm 收录的森林实地录音（本地 80 秒循环）。": "Most of these are synthesised live in your browser, no network. The three \"field rec\" options are real forest recordings from tree.fm, looping locally (80s).",
    /* 声音风景 */
    "声音风景 · 点一张，听听那里的声音。": "Soundscapes · Pick one and listen.",
    "声音风景": "Soundscapes",
    "山林": "Forest",
    "湖畔": "Lakeside",
    "雨夜": "Rainy night",
    "风原": "Windy field",
    "篝火": "Campfire",
    "正在听：": "Now playing: ",
    "关掉声音，回去": "Close sound & go back",
    "林子里有风穿过叶子，偶尔一两声鸟叫。": "Wind moves through leaves, with an occasional bird call.",
    "水一下一下拍着岸，远处安静得只剩回声。": "Water laps at the shore; far away, only echoes remain.",
    "雨落下来，世界被调成了低音量。": "Rain falls and the world turns itself down.",
    "草被风一遍遍抚过，天很宽。": "Grass is combed by the wind; the sky feels wide.",
    "木柴轻轻炸开，暖光一闪一闪。": "Wood crackles softly; warm light flickers.",
    "浏览器当场合成，无需下载": "Made live in your browser, nothing to download",
    "三分钟呼吸": "Three-minute breathing",
    "不用坚持，随时能停": "No need to keep at it. Stop whenever you like.",
    "想得多、心里乱的时候，写一句想放下的，让它散在风里；或者，就做一件很小的事。": "When your head is busy and your heart is scattered, write one line to let go and watch it drift away. Or just do one tiny thing.",
    "写在风里": "Write it on the wind",
    "即焚，不留底": "Gone in a moment, nothing kept",
    "此刻的小事": "Small things to do now",
    "几件可以试试的事": "A few things you could try",
    "不想一个人待着": "If you don't want to be alone",
    "那头有人守着": "Someone is there to answer",

    /* 情绪签到 */
    "这会儿，你有点……": "Right now, you're feeling...",
    "有点慌": "A little anxious",
    "有点累": "A little tired",
    "有点烦": "A little irritated",
    "有点茫然": "A little lost",
    "还好吧": "I'm okay",

    /* 空境 */
    "一片没人的野外，云在走，鸟在飞，花会开。什么都不用做，看看就好。": "An empty field. Clouds drift, birds fly, flowers bloom. There's nothing to do — just look.",
    "日头正好，慢慢看": "The sun is kind. Take your time.",
    "白天": "Day",
    "黄昏": "Dusk",
    "夜里": "Night",
    "太阳下班了，月亮快上来": "The sun is off duty; the moon is on its way",
    "夜了，安静会儿": "It's night. Be still for a while.",
    "关掉自然声": "Turn off the sound",

    /* 释放馆 */
    "有些情绪，坐着想是想不掉的。这儿有几个虚拟小游戏，点一点、摔一摔，把那口气先撒出来。": "Some feelings can't be thought away. Here are a few little games — tap, smash, and let that breath out.",
    "只是虚拟的小游戏。气可以撒在这儿，别带回生活里，也别对着真人。": "These are just virtual games. Let your frustration out here — not in life, and not at anyone.",
    "摔酒瓶": "Smash bottles",
    "戳泡泡": "Pop bubbles",
    "打木偶": "Hit the doll",
    "点一下酒瓶，让它碎在这儿。": "Tap the bottle and let it shatter here.",
    "已经摔了": "Smashed",
    "个": "",
    "换个新的": "Get a new one",
    "戳破它们，一个也不留。": "Pop them all. Leave none behind.",
    "还剩": "Left",
    "再来一堆": "Give me more",
    "戳破泡泡": "Pop a bubble",
    "这是个不倒翁，打不坏，随便来。": "It's a weeble — you can't break it. Go ahead.",
    "轻轻打，不打疼自己 ·": "Hit gently. Don't hurt yourself. ·",
    "扶正它": "Stand it up",
    "六种小游戏，随便挑一样撒气": "Six little games — pick one and let it out",
    "有些情绪，坐着想是想不掉的。这儿有六个虚拟小游戏，点一点、摔一摔、撕一撕，把那口气先撒出来。": "Some feelings can't be thought away. Here are six little games — tap, smash, tear — and let that breath out.",
    "撕纸片": "Tear paper",
    "揉压力球": "Squish a ball",
    "敲鼓": "Beat a drum",
    "把烦心事写在纸上，一张张撕掉。": "Put it on paper, then tear it away, one sheet at a time.",
    "烦心事": "What's bugging you",
    "烦心事,加班,催稿,对比,失眠,内耗,deadline,油价,房贷,已读不回": "What's bugging you,Overtime,Deadlines,Comparing,Insomnia,Overthinking,The deadline,Rent,Read but no reply,Waiting",
    "已经撕了": "Torn",
    "张": "sheets",
    "再来一张": "Another sheet",
    "按住它，用力揉，松开又弹回来。": "Hold it, squeeze hard, and watch it bounce back.",
    "捏": "Squeeze",
    "已经揉了": "Squeezed",
    "下": "times",
    "揉个新的": "Squeeze again",
    "敲一下鼓，让那口气跟着响声散开。": "Beat the drum and let it out with the sound.",
    "已经敲了": "Beaten",
    "从头敲": "Start over",
    "点击撕掉一张纸": "Tap to tear a sheet",
    "按住揉捏压力球": "Hold to squish the stress ball",
    "点击敲鼓": "Tap to beat the drum",
    "音效同样是当场合成的，不会保存你点了什么。": "Sounds are made live too. What you tap is never saved.",

    /* 呼吸 */
    "跟着圆圈慢慢来。不舒服就随时停，按自己的节奏就好。": "Follow the circle at your own pace. If it feels off, stop anytime.",
    "慢慢吸": "Breathe in",
    "停一下": "Hold",
    "慢慢呼": "Breathe out",
    "按自己的节奏": "At your own pace",
    "给我三分钟": "Give me three minutes",
    "先到这儿": "Stop here",
    "再来三分钟": "Three more minutes",
    "三分钟过去了。可以走了，也可以再坐一会儿。": "Three minutes have passed. You can go, or stay a little longer.",

    /* 写在风里 */
    "写一句此刻最想放下的话。不必完整，也不必给谁看。写完，让它散了。": "Write one thing you want to put down. It doesn't have to be complete, or for anyone. Then let it drift away.",
    "让风带走": "Let the wind take it",
    "放下了。这里没有留底。": "Let go. Nothing was kept here.",
    "再写一次": "Write again",
    "关于你写下的字": "About what you write",
    "它只在这一个页面的内存里。不会上传、不会被保存、不经过任何服务器；刷新或关掉，就没有了。本页不使用账号、Cookie 或任何统计，服务端也已禁止本页主动发起网络请求。": "It stays only in this page's memory. Nothing is uploaded, saved, or sent to any server. Refresh or close the page and it's gone. No accounts, no cookies, no analytics — the server also blocks this page from making network requests.",

    /* 小事 */
    "此刻能做的小事": "Small things you can do now",
    "只是几件可以试试的事，不是建议，也不保证什么。": "Just a few things to try — not advice, and no promises.",
    "换几件": "Show me others",
    "把手机翻过去，放三分钟": "Turn your phone face down for three minutes",
    "倒一杯温水，慢慢喝完": "Pour a glass of warm water and sip it slowly",
    "看窗外一分钟，只看，不做别的": "Look out the window for one minute. Just look.",
    "把桌上一样东西放回它该在的地方": "Put one thing on your desk back where it belongs",
    "给很久没联系的人发一句「最近还好吗」": "Message someone you haven't talked to in a while: \"How have you been?\"",
    "走一段不赶时间的路": "Walk a stretch with nowhere to be",
    "把今天没做完的事写下来，明天再说": "Write down what you didn't finish today. Leave it for tomorrow.",
    "关掉一个不用的通知": "Turn off one notification you don't need",
    "听一听此刻最远的那个声音": "Listen for the farthest sound you can hear",
    "站起来，伸一次懒腰": "Stand up and stretch once",
    "允许自己什么都不做五分钟": "Give yourself five minutes to do nothing",
    "把灯调暗一点点": "Dim the lights a little",
    "洗一次不赶时间的手": "Wash your hands without rushing",
    "把一句想对自己说的话写在纸上": "Write one thing you'd like to hear on paper",
    "数一数窗外有几种颜色": "Count how many colors you can see outside",
    "把椅子挪到有光的地方坐一会儿": "Move your chair into the light and sit a while",
    "把肩膀放下来，松开咬着的牙": "Lower your shoulders and unclench your jaw",
    "出门走一圈，不带目的": "Step outside for a walk with no destination",
    "把一首老歌从头听到尾": "Listen to an old song all the way through",
    "给绿植浇点水": "Water a plant",

    /* 求助 */
    "如果不想一个人待着": "If you don't want to be alone",
    "这一页帮不上真正难的那些时刻。下面的号码，那头有人守着。": "This page can't help through the truly hard moments. Someone is available at the numbers below.",
    "全国统一心理援助热线 · 24 小时 · 免费": "National mental health support hotline · 24 hours · Free",
    "青少年服务台": "Youth service hotline",
    "妇女维权公益热线": "Women's rights support hotline",
    "本站不提供心理咨询、心理治疗或任何医疗建议。若困扰持续，请联系专业人士或就近就医。": "This site offers no counseling, therapy, or medical advice. If difficulties persist, please contact a professional or seek local care.",

    /* 支持 / 变现 */
    "如果这里让你喘匀了一口气": "If this helped you catch your breath",
    "这一页一直免费、无广告。如果你想让它继续做下去，或者想走得更远一点，可以从这里挑一样。": "This page will always be free and ad-free. If you'd like to keep it going — or go a little further — pick one of these.",
    "这一页一直免费、无广告。如果想把这份「慢下来」想得更透，老杨在认知专栏写了更多——可以先免费试读。": "This page is always free and ad-free. If you want to think this idea of slowing down through, Lao Yang wrote more in his thinking column — you can preview it for free first.",
    "读点慢东西": "Read something slow",
    "老杨的认知专栏 · 小报童": "Lao Yang's thinking column · Xiaobaotong",
    "免费试读 · 老杨的认知专栏": "Free preview · Lao Yang's thinking column",
    "找个地方聊": "Find a place to talk",
    "知识星球 · 一起把事推进": "Knowledge Planet · Make progress together",
    "小报童": "Xiaobot",
    "谈个合作": "Work with us",
    "品牌 / 好物 / 场地": "Brands / goods / venues",
    "合作来信：qiangda68@163.com。我们只接与「放松、好睡眠、情绪健康」相关、且不夸大功效的合作。": "Write to qiangda68@163.com. We only take partnerships related to rest, better sleep, and emotional wellbeing — and never overstate effects.",

    /* FAQ */
    "你可能想问的": "You might be wondering",
    "关于这一页": "About this page",
    "这里是什么？": "What is this?",
    "一个纯静态的中文放松页面：一片虚拟的自然空境、几个虚拟发泄小游戏、一段呼吸节奏、一句即焚的书写，还有几件可以做的小事。它借用了当下流行的「别慌、慢慢来」这一情绪母题，但所有文案、画面与代码均为原创。": "A purely static, bilingual relaxation page: a virtual quiet landscape, a few stress-release games, a breathing rhythm, a line of writing that disappears, and some small things to do. It borrows the popular \"no rush, take it easy\" mood — but all words, visuals, and code are original.",
    "它和那首歌有关系吗？": "Is it related to that song?",
    "没有。本页未使用任何歌曲的歌词、旋律、录音或人物形象。「慌啥子嘛」是川渝地区一句通用的日常口语，这里只作为「别着急」的俗语引用，不指向任何具体音乐作品，也不构成对其内容的复制或商业使用。": "No. This site uses no lyrics, melody, recording, or image from any song. \"What's the hurry?\" is a common everyday phrase; here it's used only as \"don't rush,\" not as a reference to any specific work.",
    "关于隐私": "About privacy",
    "我写下的字会被保存吗？": "Will what I write be saved?",
    "不会。它只在这一个页面的内存里，不会上传、不会被保存、不经过任何服务器；刷新或关掉页面，就没有了。": "No. It stays only in this page's memory — never uploaded, saved, or sent to any server. Refresh or close the page and it's gone.",
    "真的没有统计和 Cookie 吗？": "Really no analytics or cookies?",
    "没有账号、没有表单提交、没有评论、没有上传、没有 Cookie、没有第三方统计。游戏互动与书写只存在于当前页面内存；声音以浏览器当场合成为主，另有三段本地实录音频，均不存在第三方请求。服务端设置了 CSP，禁止本页主动发起网络请求。页面中的外部链接需要你主动点击才会打开。": "No accounts, no forms, no comments, no uploads, no cookies, no third-party analytics. Games and writing live only in this page's memory; sounds are mostly synthesized live in your browser, with three local field recordings — no third-party requests either way. The server sets CSP to block outbound requests. External links open only when you click them.",
    "关于边界": "About boundaries",
    "这里提供心理咨询或治疗吗？": "Do you offer counseling or therapy?",
    "不提供。这里不是医疗机构，也不是心理咨询机构，不提供诊断、治疗或咨询，不宣称缓解、改善任何疾病与症状。如果困扰持续，请联系专业人士或就近就医。": "No. This isn't a medical or counseling provider. We offer no diagnosis, treatment, or therapy, and make no claims to cure or improve any condition. If difficulties persist, contact a professional or seek local care.",
    "有没有宗教内容？": "Is there any religious content?",
    "没有。这里不是宗教场所，也不是宗教团体，不提供任何互联网宗教信息服务。页面不含教义教规、宗教知识、宗教活动或仪式，不设祈愿、抽签、占卜、命理、宜忌，也不以任何名义募捐。": "No. This is not a religious site or group, and provides no online religious services. No teachings, rituals, prayers, fortune-telling, or fundraising of any kind.",
    "会给我算命、抽签、看运势吗？": "Do you do fortune-telling or horoscopes?",
    "不会。不做运势、签文、算命与黄历宜忌。当天那句旧诗若出现，也只是依日期呈现的文字，不预测什么。": "No. No horoscopes, fortune sticks, or almanac luck. If an old poem appears, it's simply text shown by date — it predicts nothing.",

    /* 页脚 */
    "老杨的主页": "Lao Yang's homepage",
    "写信给我": "Write to me",
    "别慌，慢慢来": "No rush, take it easy",

    /* 404 页 */
    "这里什么都没有 · 别慌": "Nothing here · No Rush",
    "这一页，": "This page ",
    "不在。": "isn't here.",
    "不找了也行，回去坐一会儿。": "No need to keep looking. Go back and sit a while.",
    "回到那个角落": "Back to that corner",

    /* 动态文案 */
    "慌的时候，先把肩膀放下来。右边那片空境，先看两眼，不着急。": "When you feel panicked, drop your shoulders first. Take a look at the quiet view below. No rush.",
    "累了就别再撑着了。做回呼吸，或者就坐着看会儿云，都算数。": "If you're tired, stop pushing. Come back to your breath, or just sit and watch the clouds. It all counts.",
    "有火气很正常。往下走，摔几个虚拟酒瓶，把它撒在这儿。": "It's normal to feel angry. Scroll down and smash a few virtual bottles. Let it out here.",
    "茫然不是坏事，说明你在重新找方向。先写一句想放下的，轻装上路。": "Feeling lost isn't bad — it means you're finding a new direction. Write one line to let go, and travel lighter.",
    "那挺好。留着这个地方，哪天需要了，回来坐坐就行。": "Good. Keep this place in mind. Come back and sit whenever you need to.",
    "冬": "Winter",
    "春": "Spring",
    "夏": "Summer",
    "秋": "Autumn",
    "月": " ",
    "日": ""
  };

  var lang = 'zh';
  var units = [];   /* 静态文本节点：{node, key, raw} */
  var attrs = [];   /* 需要翻译的属性：{el, name, key, raw} */
  var listeners = [];
  var ATTR_NAMES = ['placeholder', 'aria-label', 'title'];
  /* 这些元素的内容由 quiet.js 动态生成，不走静态采集，避免被覆盖 */
  var SKIP = '#today, #checkinReply, #sceneCaption, #breathWord, #timerBtn, #timerText, #timerEnd, #soundLabel, #bottleCount, #bubbleCount, #smallList';

  function tr(key) {
    return lang === 'en' ? (Object.prototype.hasOwnProperty.call(DICT, key) ? DICT[key] : key) : key;
  }

  function hasHan(s) { return /[\u4e00-\u9fa5]/.test(s || ''); }

  function collect() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var v = node.nodeValue || '';
        if (!hasHan(v)) return NodeFilter.FILTER_REJECT;
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        try { if (p.closest(SKIP)) return NodeFilter.FILTER_REJECT; } catch (e) {}
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var raw = node.nodeValue;
      var key = raw.trim();
      if (key) units.push({ node: node, key: key, raw: raw });
    }
    ATTR_NAMES.forEach(function (name) {
      Array.prototype.forEach.call(document.querySelectorAll('[' + name + ']'), function (el) {
        var raw = el.getAttribute(name);
        if (raw && hasHan(raw)) attrs.push({ el: el, name: name, key: raw.trim(), raw: raw });
      });
    });
  }

  function applyStatic() {
    units.forEach(function (u) {
      var v = tr(u.key);
      u.node.nodeValue = u.raw.replace(u.key, function () { return v; });
    });
    attrs.forEach(function (a) {
      a.el.setAttribute(a.name, a.raw.replace(a.key, function () { return tr(a.key); }));
    });
  }

  function applyHead() {
    var title = document.querySelector('title');
    if (title) {
      var raw = title.getAttribute('data-zh');
      if (!raw) { raw = title.textContent.trim(); title.setAttribute('data-zh', raw); }
      title.textContent = tr(raw);
    }
    var map = {
      'meta[name="description"]': 'description',
      'meta[property="og:title"]': 'og:title',
      'meta[property="og:description"]': 'og:description'
    };
    Object.keys(map).forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !el.getAttribute('content')) return;
      var raw = el.getAttribute('data-zh');
      if (!raw) { raw = el.getAttribute('content'); el.setAttribute('data-zh', raw); }
      el.setAttribute('content', tr(raw));
    });
  }

  function applyButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function set(next) {
    lang = (next === 'en') ? 'en' : 'zh';
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
    applyButtons();
    listeners.forEach(function (fn) { try { fn(lang); } catch (e) {} });
    applyStatic();
    applyHead();
  }

  window.I18N = {
    t: tr,
    get lang() { return lang; },
    set: set,
    on: function (fn) { if (typeof fn === 'function') listeners.push(fn); }
  };

  document.addEventListener('DOMContentLoaded', function () {
    collect();
    applyHead();
    applyButtons();
    Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (b) {
      b.addEventListener('click', function () { set(b.getAttribute('data-lang')); });
    });
  });
})();
