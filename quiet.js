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
    var len = ac.sampleRate * 4;
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
    return buf;
  }

  /* 雨声：低通白噪声循环（自动播放与手动开关共用） */
  var rainNode = null;
  function startRain(volume) {
    var ac = ctx(); if (!ac) return false;
    var src = ac.createBufferSource();
    src.buffer = getNoise(ac); src.loop = true;
    var filter = ac.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 900;
    var gain = ac.createGain(); gain.gain.value = 0.0;
    src.connect(filter); filter.connect(gain); gain.connect(ac.destination);
    src.start();
    gain.gain.linearRampToValueAtTime(volume || 0.12, ac.currentTime + 1.2);
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

  /* 背景声：参照 rainymood 的温和雨幕——只有低频雨声，没有音符、铃音或气流噪声 */
  var musicNodes = null;
  function startMusic() {
    var ac = ctx(); if (!ac || musicNodes) return false;
    var src = ac.createBufferSource(); src.buffer = getNoise(ac); src.loop = true;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.4;
    var gain = ac.createGain(); gain.gain.value = 0;
    src.connect(lp); lp.connect(gain); gain.connect(ac.destination); src.start();
    gain.gain.linearRampToValueAtTime(0.032, ac.currentTime + 4);

    /* 极慢的呼吸，让雨幕有起伏但不吵 */
    var lfo = ac.createOscillator(); lfo.frequency.value = 0.05;
    var lfoGain = ac.createGain(); lfoGain.gain.value = 0.01;
    lfo.connect(lfoGain); lfoGain.connect(gain.gain); lfo.start();

    musicNodes = { src: src, gain: gain, lfo: lfo };
    return true;
  }
  function stopMusic() {
    if (!musicNodes || !audioCtx) return;
    var m = musicNodes; musicNodes = null;
    try {
      var t = audioCtx.currentTime;
      m.gain.gain.cancelScheduledValues(t);
      m.gain.gain.setValueAtTime(m.gain.gain.value, t);
      m.gain.gain.linearRampToValueAtTime(0, t + 1.2);
    } catch (e) {}
    window.setTimeout(function () {
      try { m.src.stop(); } catch (e) {}
      try { m.lfo.stop(); } catch (e) {}
      try { m.gain.disconnect(); } catch (e) {}
    }, 1400);
  }

  /* 进站即尝试播放：雨声 + 背景音；浏览器拦截时给一次轻提示 */
  var soundBtn = $('soundBtn');
  var soundLabel = $('soundLabel');
  var ambientBtn = $('ambientBtn');
  var soundHint = $('soundHint');
  function syncSoundUI() {
    var on = !!(rainNode || musicNodes);
    if (ambientBtn) ambientBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (soundBtn) {
      soundBtn.setAttribute('aria-pressed', rainNode ? 'true' : 'false');
      soundLabel.textContent = T(rainNode ? '关掉雨声' : '听会儿雨声');
    }
    if (soundHint) soundHint.hidden = on;
  }
  function detachGesture() {
    document.removeEventListener('pointerdown', onFirstGesture);
    document.removeEventListener('keydown', onFirstGesture);
    if (soundHint) soundHint.hidden = true;
  }
  function startAllSounds() {
    startRain(0.055); startMusic(); syncSoundUI(); detachGesture();
  }
  function stopAllSounds() {
    stopRain(); stopMusic(); syncSoundUI();
  }
  function onFirstGesture(e) {
    var t = e.target;
    if (t && t.closest && (t.closest('#ambientBtn') || t.closest('#soundBtn') || t.closest('#soundHint'))) return;
    startAllSounds();
  }
  document.addEventListener('pointerdown', onFirstGesture);
  document.addEventListener('keydown', onFirstGesture);

  if (ambientBtn) {
    ambientBtn.addEventListener('click', function () {
      if (rainNode || musicNodes) stopAllSounds(); else startAllSounds();
    });
  }
  if (soundHint) {
    soundHint.addEventListener('click', function () { startAllSounds(); });
  }
  soundBtn.addEventListener('click', function () {
    if (rainNode) stopRain(); else startRain(0.08);
    syncSoundUI();
    detachGesture();
  });

  (function attemptAutoSound() {
    var ac = ctx(); if (!ac) return;
    var settled = false;
    function decide() {
      if (settled) return; settled = true;
      if (ac.state === 'running') startAllSounds();
      else if (soundHint) soundHint.hidden = false;
    }
    if (ac.state === 'suspended' && ac.resume) {
      try { Promise.resolve(ac.resume()).then(decide, function () { if (soundHint) soundHint.hidden = false; }); } catch (e) {}
      window.setTimeout(decide, 1000);
    } else decide();
  })();

  /* ---------- 声音风景：一图一声（tree.fm 式交互，音源全为现场合成） ---------- */
  var SCAPES = {
    forest: { name: '山林', desc: '林子里有风穿过叶子，偶尔一两声鸟叫。', type: 'bandpass', freq: 1800, q: 0.7, gain: 0.055, sweep: [0.12, 700], event: 'bird', every: 2600 },
    lake:   { name: '湖畔', desc: '水一下一下拍着岸，远处安静得只剩回声。', type: 'lowpass', freq: 700, q: 0.5, gain: 0.07, sweep: [0.16, 260], event: 'drop', every: 3800 },
    rain:   { name: '雨夜', desc: '雨落下来，世界被调成了低音量。', type: 'lowpass', freq: 1100, q: 0.4, gain: 0.07, event: 'none', every: 0 },
    wind:   { name: '风原', desc: '草被风一遍遍抚过，天很宽。', type: 'bandpass', freq: 520, q: 0.9, gain: 0.075, sweep: [0.07, 380], event: 'none', every: 0 },
    fire:   { name: '篝火', desc: '木柴轻轻炸开，暖光一闪一闪。', type: 'lowpass', freq: 420, q: 0.6, gain: 0.04, event: 'crackle', every: 900 }
  };
  var scapeNodes = null;
  var currentScape = null;
  var scapePrevOn = false;
  var scapeOverlay = $('scapeOverlay');
  var scapeArt = $('scapeArt');
  var scapeTitle = $('scapeTitle');
  var scapeDesc = $('scapeDesc');
  var scapeClose = $('scapeClose');

  function scapeEvent(ac, kind, bus) {
    var t = ac.currentTime;
    if (kind === 'bird') {
      var o = ac.createOscillator(); var g = ac.createGain();
      var base = 1700 + Math.random() * 900;
      o.type = 'sine'; o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.12);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.4);
    } else if (kind === 'drop') {
      var o2 = ac.createOscillator(); var g2 = ac.createGain();
      var f = 620 + Math.random() * 260;
      o2.type = 'sine'; o2.frequency.setValueAtTime(f, t);
      o2.frequency.exponentialRampToValueAtTime(f * 0.62, t + 0.24);
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(0.045, t + 0.015);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o2.connect(g2); g2.connect(bus); o2.start(t); o2.stop(t + 0.45);
    } else if (kind === 'crackle') {
      var src = ac.createBufferSource(); src.buffer = getNoise(ac);
      var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
      var g3 = ac.createGain();
      g3.gain.setValueAtTime(0.0001, t);
      g3.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t + 0.008);
      g3.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      src.connect(hp); hp.connect(g3); g3.connect(bus); src.start(t); src.stop(t + 0.1);
    }
  }

  function startScape(key) {
    var ac = ctx();
    var cfg = SCAPES[key];
    if (!ac || !cfg) return false;
    stopScape();
    var src = ac.createBufferSource(); src.buffer = getNoise(ac); src.loop = true;
    var filter = ac.createBiquadFilter();
    filter.type = cfg.type; filter.frequency.value = cfg.freq; filter.Q.value = cfg.q || 0.5;
    var gain = ac.createGain(); gain.gain.value = 0;
    src.connect(filter); filter.connect(gain); gain.connect(ac.destination); src.start();
    gain.gain.linearRampToValueAtTime(cfg.gain, ac.currentTime + 1.4);

    var lfo = null, lfoGain = null, timer = null;
    if (cfg.sweep) {
      lfo = ac.createOscillator(); lfo.frequency.value = cfg.sweep[0];
      lfoGain = ac.createGain(); lfoGain.gain.value = cfg.sweep[1];
      lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
    }
    var bus = ac.createGain(); bus.gain.value = 0.65; bus.connect(ac.destination);
    if (cfg.event !== 'none' && cfg.event && cfg.every) {
      timer = window.setInterval(function () {
        if (scapeNodes && scapeNodes.key === key) scapeEvent(ac, cfg.event, bus);
      }, cfg.every);
    }
    scapeNodes = { src: src, gain: gain, lfo: lfo, timer: timer, bus: bus, key: key };
    currentScape = key;
    return true;
  }

  function stopScape() {
    if (!scapeNodes || !audioCtx) { currentScape = null; return; }
    var m = scapeNodes; scapeNodes = null; currentScape = null;
    window.clearInterval(m.timer);
    try {
      m.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.7);
    } catch (e) {}
    window.setTimeout(function () {
      try { m.src.stop(); } catch (e) {}
      try { if (m.lfo) m.lfo.stop(); } catch (e) {}
      try { m.bus.disconnect(); } catch (e) {}
    }, 900);
  }

  function openScape(btn) {
    var key = btn.getAttribute('data-scape');
    var cfg = SCAPES[key];
    if (!cfg || !scapeOverlay) return;
    scapePrevOn = !!(rainNode || musicNodes);
    stopAllSounds();
    scapeArt.innerHTML = '';
    var svg = btn.querySelector('svg');
    if (svg) scapeArt.appendChild(svg.cloneNode(true));
    scapeTitle.textContent = T(cfg.name);
    scapeDesc.textContent = T(cfg.desc);
    scapeOverlay.hidden = false;
    startScape(key);
    scapeClose.focus();
  }
  function closeScape() {
    stopScape();
    if (scapeOverlay) scapeOverlay.hidden = true;
    if (scapePrevOn) startAllSounds();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.scape-card'), function (card) {
    card.addEventListener('click', function () { openScape(card); });
  });
  if (scapeClose) scapeClose.addEventListener('click', closeScape);
  if (scapeOverlay) {
    scapeOverlay.addEventListener('click', function (e) { if (e.target === scapeOverlay) closeScape(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && scapeOverlay && !scapeOverlay.hidden) closeScape();
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
      syncSoundUI();
      if (currentScape && SCAPES[currentScape]) {
        scapeTitle.textContent = T(SCAPES[currentScape].name);
        scapeDesc.textContent = T(SCAPES[currentScape].desc);
      }
      breathWord.textContent = breathLabel();
      if (timerId === null) timerBtn.textContent = timerIdleLabel();
      if (bubbleArea.children.length) {
        Array.prototype.forEach.call(bubbleArea.children, function (el) { el.setAttribute('aria-label', T('戳破泡泡')); });
      }
      renderSmall();
    });
  }
})();
