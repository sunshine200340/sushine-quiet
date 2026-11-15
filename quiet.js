/* 停云 · 一页安静
   本文件只操作当前页面的 DOM，不含任何网络请求或持久化存储调用。
   服务端 _headers 中的 connect-src 'none' 与 form-action 'none' 从浏览器层面硬性保证这一点。 */
(function () {
  'use strict';

  /* 全部出自公有领域古籍，按日期确定性呈现，不随机、不占卜 */
  var LINES = [
    { t: '行到水穷处，坐看云起时。', f: '王维《终南别业》' },
    { t: '采菊东篱下，悠然见南山。', f: '陶渊明《饮酒·其五》' },
    { t: '何夜无月？何处无竹柏？但少闲人如吾两人者耳。', f: '苏轼《记承天寺夜游》' },
    { t: '人间有味是清欢。', f: '苏轼《浣溪沙》' },
    { t: '云无心以出岫，鸟倦飞而知还。', f: '陶渊明《归去来兮辞》' },
    { t: '园日涉以成趣，门虽设而常关。', f: '陶渊明《归去来兮辞》' },
    { t: '木欣欣以向荣，泉涓涓而始流。', f: '陶渊明《归去来兮辞》' },
    { t: '引壶觞以自酌，眄庭柯以怡颜。', f: '陶渊明《归去来兮辞》' },
    { t: '人闲桂花落，夜静春山空。', f: '王维《鸟鸣涧》' },
    { t: '明月松间照，清泉石上流。', f: '王维《山居秋暝》' },
    { t: '众鸟高飞尽，孤云独去闲。', f: '李白《独坐敬亭山》' },
    { t: '相看两不厌，只有敬亭山。', f: '李白《独坐敬亭山》' },
    { t: '晚来天欲雪，能饮一杯无？', f: '白居易《问刘十九》' },
    { t: '绿蚁新醅酒，红泥小火炉。', f: '白居易《问刘十九》' },
    { t: '闲来无事不从容，睡觉东窗日已红。', f: '程颢《秋日》' },
    { t: '万物静观皆自得，四时佳兴与人同。', f: '程颢《秋日》' },
    { t: '惟江上之清风，与山间之明月，取之无禁，用之不竭。', f: '苏轼《赤壁赋》' },
    { t: '莫听穿林打叶声，何妨吟啸且徐行。', f: '苏轼《定风波》' },
    { t: '回首向来萧瑟处，归去，也无风雨也无晴。', f: '苏轼《定风波》' },
    { t: '窗含西岭千秋雪，门泊东吴万里船。', f: '杜甫《绝句》' },
    { t: '留连戏蝶时时舞，自在娇莺恰恰啼。', f: '杜甫《江畔独步寻花》' },
    { t: '天朗气清，惠风和畅。', f: '王羲之《兰亭集序》' },
    { t: '山气日夕佳，飞鸟相与还。', f: '陶渊明《饮酒·其五》' },
    { t: '柴门闻犬吠，风雪夜归人。', f: '刘长卿《逢雪宿芙蓉山主人》' }
  ];

  var SMALL = [
    '把手机翻过去，放三分钟',
    '倒一杯温水，慢慢喝完',
    '看窗外一分钟，只看，不做别的',
    '把桌上一样东西放回它该在的地方',
    '给很久没联系的人发一句「最近还好吗」',
    '走一段不赶时间的路',
    '把今天没做完的事写下来，明天再说',
    '关掉一个不用的通知',
    '听一听此刻最远的那个声音',
    '站起来，伸一次懒腰',
    '允许自己什么都不做五分钟',
    '把灯调暗一点点',
    '洗一次不赶时间的手',
    '把一句想对自己说的话写在纸上',
    '数一数窗外有几种颜色',
    '把椅子挪到有光的地方坐一会儿'
  ];

  var CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  function cn(n) {
    if (n <= 10) return CN[n];
    if (n < 20) return '十' + CN[n - 10];
    if (n === 20) return '二十';
    if (n < 30) return '二十' + CN[n - 20];
    if (n === 30) return '三十';
    return '三十' + CN[n - 30];
  }
  /* 按四立节气近似划分：立春 2/4、立夏 5/6、立秋 8/8、立冬 11/7 */
  function season(m, d) {
    var md = m * 100 + d;
    if (md >= 1107 || md < 204) return '冬';
    if (md < 506) return '春';
    if (md < 808) return '夏';
    return '秋';
  }

  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();

  document.getElementById('today').textContent = season(m, d) + ' · ' + cn(m) + '月' + cn(d) + '日';

  var verse = LINES[(y * 372 + m * 31 + d) % LINES.length];
  document.getElementById('verseText').textContent = verse.t;
  document.getElementById('verseFrom').textContent = '—— ' + verse.f;

  var smallList = document.getElementById('smallList');
  var start = (y * 37 + m * 11 + d * 3) % SMALL.length;
  [0, 5, 11].forEach(function (offset) {
    var li = document.createElement('li');
    li.textContent = SMALL[(start + offset) % SMALL.length];
    smallList.appendChild(li);
  });

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 停一停：呼吸圆环文案与 12 秒节奏同步 */
  var breathWord = document.getElementById('breathWord');
  if (reduced) {
    breathWord.textContent = '按自己的节奏';
  } else {
    var t0 = Date.now();
    window.setInterval(function () {
      var p = ((Date.now() - t0) % 12000) / 1000;
      breathWord.textContent = p < 4 ? '慢慢吸' : (p < 6 ? '停一下' : '慢慢呼');
    }, 200);
  }

  /* 三分钟计时：可随时中止 */
  var timerBtn = document.getElementById('timerBtn');
  var timerText = document.getElementById('timerText');
  var timerEnd = document.getElementById('timerEnd');
  var timerId = null;
  var left = 0;

  timerBtn.addEventListener('click', function () {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
      timerBtn.textContent = '给我三分钟';
      timerText.textContent = '';
      return;
    }
    left = 180;
    timerEnd.hidden = true;
    timerBtn.textContent = '先到这儿';

    function tick() {
      var mm = Math.floor(left / 60);
      var ss = left % 60;
      timerText.textContent = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
      if (left <= 0) {
        window.clearInterval(timerId);
        timerId = null;
        timerText.textContent = '';
        timerBtn.textContent = '再来三分钟';
        timerEnd.hidden = false;
        return;
      }
      left -= 1;
    }
    tick();
    timerId = window.setInterval(tick, 1000);
  });

  /* 放在这里：只改 DOM，写完即散，不留存 */
  var note = document.getElementById('note');
  var writeBox = document.getElementById('writeBox');
  var released = document.getElementById('released');
  var letGoBtn = document.getElementById('letGoBtn');
  var againBtn = document.getElementById('againBtn');

  note.setAttribute('autocomplete', 'off');
  note.value = '';

  note.addEventListener('input', function () {
    letGoBtn.disabled = !note.value.trim();
  });

  letGoBtn.addEventListener('click', function () {
    if (!note.value.trim()) return;
    writeBox.classList.add('dissolve');
    window.setTimeout(function () {
      writeBox.hidden = true;
      released.hidden = false;
      note.value = '';
      letGoBtn.disabled = true;
    }, reduced ? 220 : 1800);
  });

  againBtn.addEventListener('click', function () {
    released.hidden = true;
    writeBox.classList.remove('dissolve');
    writeBox.hidden = false;
    note.focus();
  });
})();
