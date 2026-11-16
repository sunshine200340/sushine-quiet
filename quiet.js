/* 别慌 · 一个不用慌的角落
   本文件只操作当前页面的 DOM，并用 Web Audio 当场合成音效。
   不含任何网络请求（fetch/XHR/beacon）或持久化存储（localStorage/cookie）。
   服务端 _headers 的 connect-src 'none' 与 form-action 'none' 从浏览器层面硬性保证。 */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  /* 翻译入口：i18n.js 未就绪时回退为原文 */
  var T = function (s) { return (window.I18N && window.I18N.t) ? window.I18N.t(s) : s; };
  var isEn = function () { return !!(window.I18N && window.I18N.lang === 'en'); };

  /* ---------- 日期 ---------- */
  var CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  var EN_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var EN_SEASON = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];
  function cn(n) {
    if (n <= 10) return CN[n];
    if (n < 20) return '十' + CN[n - 10];
    if (n === 20) return '二十';
    if (n < 30) return '二十' + CN[n - 20];
    if (n === 30) return '三十';
    return '三十' + CN[n - 30];
  }
  function season(m, d) {
    var md = m * 100 + d;
    if (md >= 1107 || md < 204) return '冬';
    if (md < 506) return '春';
    if (md < 808) return '夏';
    return '秋';
  }
  var now = new Date();
  function renderDate() {
    var m = now.getMonth() + 1, d = now.getDate();
    $('today').textContent = isEn()
      ? EN_SEASON[now.getMonth()] + ' · ' + EN_MONTH[now.getMonth()] + ' ' + d
      : season(m, d) + ' · ' + cn(m) + '月' + cn(d) + '日';
  }
  renderDate();

  /* ---------- 情绪签到 ---------- */
  var REPLIES = {
    anxious: '慌的时候，先把肩膀放下来。右边那片空境，先看两眼，不着急。',
    tired: '累了就别再撑着了。做回呼吸，或者就坐着看会儿云，都算数。',
    irritated: '有火气很正常。往下走，摔几个虚拟酒瓶，把它撒在这儿。',
    lost: '茫然不是坏事，说明你在重新找方向。先写一句想放下的，轻装上路。',
    okay: '那挺好。留着这个地方，哪天需要了，回来坐坐就行。'
  };
  var moodBtns = document.querySelectorAll('.mood');
  var reply = $('checkinReply');
  var currentMood = null;
  function showReply(mood) {
    reply.textContent = T(REPLIES[mood] || '');
    reply.hidden = false;
  }
  Array.prototype.forEach.call(moodBtns, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(moodBtns, function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      currentMood = btn.getAttribute('data-mood');
      showReply(currentMood);
    });
  });

  /* ---------- 空境：昼夜切换 ---------- */
  var sceneFrame = $('sceneFrame');
  var sceneCaption = $('sceneCaption');
  var CAPTIONS = {
    day: '日头正好，慢慢看',
    dusk: '太阳下班了，月亮快上来',
    night: '夜了，安静会儿'
  };
  var currentPhase = 'day';
  var phaseBtns = document.querySelectorAll('.phase-btn');
  Array.prototype.forEach.call(phaseBtns, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(phaseBtns, function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      currentPhase = btn.getAttribute('data-phase');
      sceneFrame.setAttribute('data-phase', currentPhase);
      sceneCaption.textContent = T(CAPTIONS[currentPhase] || '');
    });
  });

  /* ---------- Web Audio：当场合成，不加载文件 ---------- */
  var audioCtx = null;
  function ctx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  /* 一段白噪声 buffer（复用） */
  var noiseBuffer = null;
  function getNoise(ac) {
    if (noiseBuffer && noiseBuffer.sampleRate === ac.sampleRate) return noiseBuffer;
    var len = ac.sampleRate * 2;
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
    return buf;
  }

  /* 雨声：低通白噪声循环 */
  var rainNode = null;
  function startRain() {
    var ac = ctx(); if (!ac) return false;
    var src = ac.createBufferSource();
    src.buffer = getNoise(ac); src.loop = true;
    var filter = ac.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 900;
    var gain = ac.createGain(); gain.gain.value = 0.0;
    src.connect(filter); filter.connect(gain); gain.connect(ac.destination);
    src.start();
    gain.gain.linearRampToValueAtTime(0.12, ac.currentTime + 1.2);
    rainNode = { src: src, gain: gain };
    return true;
  }
  function stopRain() {
    if (!rainNode || !audioCtx) return;
    try {
      rainNode.gain.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.6);
      var s = rainNode.src;
      window.setTimeout(function () { try { s.stop(); } catch (e) {} }, 700);
    } catch (e) {}
    rainNode = null;
  }
  var soundBtn = $('soundBtn');
  var soundLabel = $('soundLabel');
  soundBtn.addEventListener('click', function () {
    var on = soundBtn.getAttribute('aria-pressed') === 'true';
    if (on) {
      stopRain(); soundBtn.setAttribute('aria-pressed', 'false'); soundLabel.textContent = T('听会儿雨声');
    } else {
      if (startRain()) { soundBtn.setAttribute('aria-pressed', 'true'); soundLabel.textContent = T('关掉雨声'); }
    }
  });

  /* 短音效：爆裂 / 泡泡 / 闷响 */
  function burst(duration, freq, vol, type) {
    var ac = ctx(); if (!ac) return;
    var t = ac.currentTime;
    if (type === 'tone') {
      var osc = ac.createOscillator(); var g = ac.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, t + duration);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(g); g.connect(ac.destination); osc.start(t); osc.stop(t + duration);
    } else {
      var src = ac.createBufferSource(); src.buffer = getNoise(ac);
      var f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
      var g2 = ac.createGain();
      g2.gain.setValueAtTime(vol, t);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      src.connect(f); f.connect(g2); g2.connect(ac.destination); src.start(t); src.stop(t + duration);
    }
  }

  /* ---------- 释放馆：切换游戏 ---------- */
  var gameTabs = document.querySelectorAll('.game-tab');
  var gamePanels = document.querySelectorAll('.game-panel');
  Array.prototype.forEach.call(gameTabs, function (tab) {
    tab.addEventListener('click', function () {
      Array.prototype.forEach.call(gameTabs, function (t) { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
      var name = tab.getAttribute('data-game');
      Array.prototype.forEach.call(gamePanels, function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-panel') === name);
      });
      if (name === 'bubble') makeBubbles();
    });
  });

  /* 摔酒瓶 */
  var bottleBtn = $('bottleBtn');
  var shards = $('shards');
  var bottleArea = $('bottleArea');
  var bottleCount = 0;
  var bottleCountEl = $('bottleCount');
  function smashBottle() {
    burst(0.28, 3200, 0.22, 'noise');
    bottleCount += 1;
    bottleCountEl.textContent = bottleCount;
    bottleBtn.style.opacity = '0';
    if (reduced) { window.setTimeout(function () { bottleBtn.style.opacity = '1'; }, 200); return; }
    var rect = bottleArea.getBoundingClientRect();
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('div');
      s.className = 'shard';
      s.style.left = (rect.width / 2 - 20) + 'px';
      s.style.top = (rect.height / 2 - 20) + 'px';
      s.style.background = i % 3 === 0 ? '#f4efe3' : '#8fae94';
      shards.appendChild(s);
      (function (el, idx) {
        var ang = (Math.PI * 2 / 12) * idx + Math.random() * 0.4;
        var dist = 70 + Math.random() * 70;
        var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist + 60;
        el.animate([
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (Math.random() * 540 - 270) + 'deg)', opacity: 0 }
        ], { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.2,.7,.3,1)' });
      })(s, i);
    }
    window.setTimeout(function () {
      shards.innerHTML = '';
      bottleBtn.style.opacity = '1';
    }, 900);
  }
  bottleBtn.addEventListener('click', smashBottle);
  $('bottleReset').addEventListener('click', function () {
    bottleCount = 0; bottleCountEl.textContent = '0'; shards.innerHTML = ''; bottleBtn.style.opacity = '1';
  });

  /* 戳泡泡 */
  var bubbleArea = $('bubbleArea');
  var bubbleCountEl = $('bubbleCount');
  var bubbleLeft = 0;
  function makeBubbles() {
    bubbleArea.innerHTML = '';
    bubbleLeft = 14;
    bubbleCountEl.textContent = bubbleLeft;
    var w = bubbleArea.clientWidth || 600;
    var h = bubbleArea.clientHeight || 210;
    for (var i = 0; i < 14; i++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'bubble';
      var size = 30 + Math.random() * 34;
      b.style.width = size + 'px'; b.style.height = size + 'px';
      b.style.left = (8 + Math.random() * (w - size - 24)) + 'px';
      b.style.top = (10 + Math.random() * (h - size - 20)) + 'px';
      b.setAttribute('aria-label', T('戳破泡泡'));
      (function (el) {
        el.addEventListener('click', function () {
          if (el.classList.contains('pop')) return;
          el.classList.add('pop');
          burst(0.12, 520 + Math.random() * 220, 0.16, 'tone');
          bubbleLeft -= 1; bubbleCountEl.textContent = Math.max(bubbleLeft, 0);
          window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
        });
      })(b);
      bubbleArea.appendChild(b);
    }
  }
  $('bubbleReset').addEventListener('click', makeBubbles);

  /* 打木偶 */
  var dollBtn = $('dollBtn');
  dollBtn.addEventListener('click', function () {
    dollBtn.classList.remove('hit');
    void dollBtn.offsetWidth;
    dollBtn.classList.add('hit');
    burst(0.18, 220, 0.25, 'noise');
  });
  $('dollReset').addEventListener('click', function () { dollBtn.classList.remove('hit'); });

  /* ---------- 呼吸 ---------- */
  var breathWord = $('breathWord');
  function breathLabel() {
    if (reduced) return T('按自己的节奏');
    var p = ((Date.now() - t0) % 12000) / 1000;
    return p < 4 ? T('慢慢吸') : (p < 6 ? T('停一下') : T('慢慢呼'));
  }
  var t0 = Date.now();
  if (!reduced) {
    window.setInterval(function () { breathWord.textContent = breathLabel(); }, 200);
  } else {
    breathWord.textContent = breathLabel();
  }

  var timerBtn = $('timerBtn');
  var timerText = $('timerText');
  var timerEnd = $('timerEnd');
  var timerId = null, left = 0;
  function timerIdleLabel() { return timerEnd.hidden ? T('给我三分钟') : T('再来三分钟'); }
  timerBtn.addEventListener('click', function () {
    if (timerId !== null) {
      window.clearInterval(timerId); timerId = null;
      timerBtn.textContent = T('给我三分钟'); timerText.textContent = '';
      return;
    }
    left = 180; timerEnd.hidden = true; timerBtn.textContent = T('先到这儿');
    function tick() {
      var mm = Math.floor(left / 60), ss = left % 60;
      timerText.textContent = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
      if (left <= 0) {
        window.clearInterval(timerId); timerId = null; timerText.textContent = '';
        timerBtn.textContent = T('再来三分钟'); timerEnd.hidden = false; return;
      }
      left -= 1;
    }
    tick(); timerId = window.setInterval(tick, 1000);
  });

  /* ---------- 写在风里 ---------- */
  var note = $('note');
  var writeBox = $('writeBox');
  var released = $('released');
  var letGoBtn = $('letGoBtn');
  var againBtn = $('againBtn');
  note.setAttribute('autocomplete', 'off');
  note.value = '';
  note.addEventListener('input', function () { letGoBtn.disabled = !note.value.trim(); });
  letGoBtn.addEventListener('click', function () {
    if (!note.value.trim()) return;
    writeBox.classList.add('dissolve');
    window.setTimeout(function () {
      writeBox.hidden = true; released.hidden = false;
      note.value = ''; letGoBtn.disabled = true;
    }, reduced ? 220 : 1800);
  });
  againBtn.addEventListener('click', function () {
    released.hidden = true; writeBox.classList.remove('dissolve');
    writeBox.hidden = false; note.focus();
  });

  /* ---------- 此刻能做的小事 ---------- */
  var SMALL = [
    '把手机翻过去，放三分钟', '倒一杯温水，慢慢喝完', '看窗外一分钟，只看，不做别的',
    '把桌上一样东西放回它该在的地方', '给很久没联系的人发一句「最近还好吗」',
    '走一段不赶时间的路', '把今天没做完的事写下来，明天再说', '关掉一个不用的通知',
    '听一听此刻最远的那个声音', '站起来，伸一次懒腰', '允许自己什么都不做五分钟',
    '把灯调暗一点点', '洗一次不赶时间的手', '把一句想对自己说的话写在纸上',
    '数一数窗外有几种颜色', '把椅子挪到有光的地方坐一会儿', '把肩膀放下来，松开咬着的牙',
    '出门走一圈，不带目的', '把一首老歌从头听到尾', '给绿植浇点水'
  ];
  var smallList = $('smallList');
  var smallStart = 0;
  function renderSmall() {
    smallList.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var li = document.createElement('li');
      li.textContent = T(SMALL[(smallStart + i * 3) % SMALL.length]);
      smallList.appendChild(li);
    }
  }
  smallStart = (now.getFullYear() * 37 + (now.getMonth() + 1) * 11 + now.getDate() * 3) % SMALL.length;
  renderSmall();
  $('moreSmall').addEventListener('click', function () { smallStart = (smallStart + 3) % SMALL.length; renderSmall(); });

  /* ---------- 语言切换：重渲染所有动态文案 ---------- */
  if (window.I18N && window.I18N.on) {
    window.I18N.on(function () {
      renderDate();
      if (currentMood) showReply(currentMood);
      sceneCaption.textContent = T(CAPTIONS[currentPhase] || '');
      soundLabel.textContent = soundBtn.getAttribute('aria-pressed') === 'true' ? T('关掉雨声') : T('听会儿雨声');
      breathWord.textContent = breathLabel();
      if (timerId === null) timerBtn.textContent = timerIdleLabel();
      if (bubbleArea.children.length) {
        Array.prototype.forEach.call(bubbleArea.children, function (el) { el.setAttribute('aria-label', T('戳破泡泡')); });
      }
      renderSmall();
    });
  }
})();
