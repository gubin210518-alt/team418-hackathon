/* ④ 수학문제 (학생 3교시 · 미적분 수행평가)
   객관식 3문제 + 연습장(손가락/마우스로 낙서). 1~4 키 또는 버튼. */
/* ---- 공통 도구 · 모든 미니게임 파일 맨 위에 똑같이 들어 있어요 (먼저 읽힌 것 하나만 써요) ----
   MG._kit.define(id, 제목, css, run) 으로 게임을 만들면 규격(start / stop / done 한 번)을 자동으로 지켜요. */
(function () {
  var MG = window.MG = window.MG || {};
  if (MG._kit) return;

  var BASE_CSS = [
    '.mg-wrap{box-sizing:border-box;width:100%;max-width:560px;margin:0 auto;padding:12px;border-radius:16px;background:#fffdf7;color:#1f2430;',
    'font:15px/1.5 system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.12);position:relative;overflow:hidden;',
    'user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
    '.mg-wrap *{box-sizing:border-box}',
    '.mg-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}',
    '.mg-title{font-size:16px;white-space:nowrap}',
    '.mg-time{flex:1;height:8px;background:#e6e1d6;border-radius:4px;overflow:hidden}',
    '.mg-time i{display:block;height:100%;width:100%;background:#4f8cff;transition:width .1s linear}',
    '.mg-time.mg-low i{background:#ef476f}',
    '.mg-tnum{font-size:13px;min-width:34px;text-align:right;color:#666}',
    '.mg-btn,.mg-skip{font:inherit;border:0;border-radius:10px;cursor:pointer;min-height:44px;padding:8px 14px}',
    '.mg-skip{background:#ebe7de;color:#444;font-size:13px;min-height:36px}',
    '.mg-btn{background:#4f8cff;color:#fff;font-weight:600}',
    '.mg-btn.mg-alt{background:#ff8c42}',
    '.mg-btn:disabled,.mg-skip:disabled{opacity:.45;cursor:default}',
    '.mg-btn:focus-visible,.mg-skip:focus-visible{outline:3px solid #ffb703;outline-offset:2px}',
    '.mg-msg{text-align:center;margin:8px 0;min-height:1.5em}',
    '.mg-big{font-size:22px;font-weight:700;text-align:center}',
    '.mg-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
    '.mg-hint{font-size:12px;color:#777;text-align:center;margin-top:6px}',
    '.mg-end{text-align:center;padding:28px 0;font-size:18px}',
    '.mg-end b{display:block;font-size:30px;color:#4f8cff}',
    '@keyframes mg-pop{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}',
    '.mg-pop{animation:mg-pop .22s ease-out}',
    '@keyframes mg-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
    '.mg-shake{animation:mg-shake .2s}',
    '.mg-reduced *,.mg-reduced{animation:none!important;transition:none!important}'
  ].join('');

  function css(id, text) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id;
    s.textContent = text;
    document.head.appendChild(s);
  }
  function clamp(v, a, b) { v = Number(v); if (!isFinite(v)) v = a; return Math.min(b, Math.max(a, v)); }
  function el(tag, cls, text, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function button(text, cls, parent) { var b = el('button', 'mg-btn' + (cls ? ' ' + cls : ''), text, parent); b.type = 'button'; return b; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // 게임 한 판(세션). 타이머 · 이벤트를 모두 기억했다가 cleanup 에서 한 번에 지워요.
  function session(root, opts, done, info) {
    var S = { opts: opts, alive: true, finished: false, reduced: !!opts.reduced };
    var timers = [], offs = [], raf = 0;

    S.after = function (ms, fn) { var id = setTimeout(function () { if (S.alive) fn(); }, ms); timers.push(id); return id; };
    S.every = function (ms, fn) { var id = setInterval(function () { if (S.alive) fn(); }, ms); timers.push(id); return id; };
    S.loop = function (fn) {
      function f(t) { if (!S.alive) return; if (fn(t) === false) return; raf = requestAnimationFrame(f); }
      raf = requestAnimationFrame(f);
    };
    S.on = function (t, type, fn, o) { t.addEventListener(type, fn, o || false); offs.push(function () { t.removeEventListener(type, fn, o || false); }); };
    // 키 입력: 게임 중에는 연님 화면의 단축키보다 먼저 받아요 (fn 이 true 를 돌려주면 그 키는 게임이 씀)
    S.key = function (fn) {
      S.on(window, 'keydown', function (e) {
        if (!S.alive || S.finished) return;
        if (fn(e) === true) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    };
    S.sfx = function (name) {
      if (opts.muted || !window.SFX || typeof window.SFX.play !== 'function') return;
      try { window.SFX.play(name); } catch (e) {}
    };
    S.limit = function (def) { var t = Number(opts.timeLimit); return t > 0 ? t : def; };

    var wrap = el('div', 'mg-wrap mg-' + info.id + (S.reduced ? ' mg-reduced' : ''));
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', info.title + ' 미니게임');
    var head = el('div', 'mg-head', null, wrap);
    el('b', 'mg-title', info.title, head);
    var tbox = el('div', 'mg-time', null, head);
    var tbar = el('i', null, null, tbox);
    var tnum = el('span', 'mg-tnum', '', head);
    var skip = el('button', 'mg-skip', '건너뛰기', head);
    skip.type = 'button';
    S.body = el('div', 'mg-body', null, wrap);
    S.wrap = wrap;
    root.appendChild(wrap);
    S.on(skip, 'click', function () { S.finish({ score: 0, ratio: 0, pass: false, extra: { skipped: true } }); });

    // 제한 시간: S.timer(초, 끝났을 때 함수). 다시 부르면 새로 시작해요.
    var limit = 0, t0 = 0, onUp = null, tid = 0;
    function tick() {
      var left = Math.max(0, limit - (performance.now() - t0));
      tbar.style.width = (left / limit * 100) + '%';
      tbox.classList.toggle('mg-low', left < 4000);
      tnum.textContent = Math.ceil(left / 1000) + '초';
      if (left <= 0 && onUp) { var c = onUp; onUp = null; c(); }
    }
    S.timer = function (sec, cb) {
      if (tid) clearInterval(tid);
      limit = Math.max(1, sec) * 1000; t0 = performance.now(); onUp = cb;
      tick(); tid = S.every(100, tick);
    };
    S.timeLeft = function () { return limit ? Math.max(0, limit - (performance.now() - t0)) / 1000 : 0; };

    S.cleanup = function (remove) {
      S.alive = false;
      timers.forEach(function (i) { clearTimeout(i); clearInterval(i); });
      timers = [];
      offs.forEach(function (f) { f(); });
      offs = [];
      if (raf) cancelAnimationFrame(raf);
      if (remove && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    };

    // 끝: 값을 규격 범위로 잘라서 done 을 딱 한 번 불러요.
    S.finish = function (r) {
      if (S.finished) return;
      S.finished = true;
      r = r || {};
      var extra = {};
      if (r.extra) Object.keys(r.extra).forEach(function (k) {
        var v = r.extra[k];
        if (typeof v === 'number' && isFinite(v)) extra[k] = v;
        else if (typeof v === 'boolean') extra[k] = v;
        else if (typeof v === 'string') extra[k] = v.slice(0, 40);
      });
      var out = { score: Math.round(clamp(r.score, 0, 100)), ratio: Math.round(clamp(r.ratio, 0, 1) * 1000) / 1000, pass: !!r.pass, extra: extra };
      S.cleanup(false);
      skip.disabled = true;
      S.body.textContent = '';
      var end = el('div', 'mg-end mg-pop', extra.skipped ? '건너뛰었어요' : '끝!', S.body);
      if (!extra.skipped) el('b', null, out.score + '점', end);
      if (typeof done === 'function') { try { done(out); } catch (e) { if (window.console) console.error(e); } }
    };
    return S;
  }

  MG._kit = {
    clamp: clamp, el: el, button: button, shuffle: shuffle,
    define: function (id, title, gameCss, run) {
      var cur = null;
      MG[id] = {
        title: title,
        start: function (root, opts, done) {
          this.stop();
          if (!root) return;
          css('mg-base-css', BASE_CSS);
          if (gameCss) css('mg-css-' + id, gameCss);
          var S = cur = session(root, opts || {}, done, { id: id, title: title });
          try { run(S, opts || {}); }
          catch (e) {
            if (window.console) console.error(e);
            S.finish({ score: 0, ratio: 0, pass: false, extra: { error: true } });
          }
        },
        stop: function () { if (cur) { cur.cleanup(true); cur = null; } }
      };
    }
  };
})();

(function () {
  var K = window.MG._kit;
  var QS = [
    ['f(x) = x² 일 때, f′(3) 은?', '6', ['9', '3', '2']],
    ['f(x) = x³ 일 때, f′(2) 은?', '12', ['8', '6', '4']],
    ['∫₀² 2x dx 의 값은?', '4', ['2', '8', '1']],
    ['lim(x→2) (x² − 4) / (x − 2) 의 값은?', '4', ['0', '2', '없다']],
    ['f(x) = 2x² + 3x 일 때, f′(1) 은?', '7', ['5', '4', '10']],
    ['y = x² 위의 점 (1, 1) 에서 접선의 기울기는?', '2', ['1', '0', '4']],
    ['∫₀¹ 3x² dx 의 값은?', '1', ['3', '1/3', '3/2']]
  ];
  var COUNT = 3, PASS = 0.6;

  var CSS = [
    '.mg-ma-q{font-size:18px;font-weight:700;text-align:center;margin:4px 0 10px;min-height:2.8em;word-break:keep-all}',
    '.mg-ma-opts{display:grid;grid-template-columns:1fr 1fr;gap:6px}',
    '.mg-ma-opts .mg-btn{background:#fff;color:#1f2430;border:2px solid #cfc8b8;font-size:17px}',
    '.mg-ma-opts .mg-btn.mg-ok{background:#06d6a0;border-color:#06d6a0;color:#fff}',
    '.mg-ma-opts .mg-btn.mg-no{background:#ef476f;border-color:#ef476f;color:#fff}',
    '.mg-ma-pad{margin-top:10px;position:relative}',
    '.mg-ma-pad canvas{display:block;width:100%;height:170px;background:#fff;border:2px dashed #cfc8b8;border-radius:10px;touch-action:none;cursor:crosshair}',
    '.mg-ma-clear{position:absolute;right:6px;top:6px;font:inherit;font-size:13px;border:0;border-radius:10px;background:#ebe7de;color:#444;min-height:36px;padding:6px 12px;cursor:pointer}',
    '.mg-ma-pad span{position:absolute;left:10px;top:6px;font-size:12px;color:#aaa;pointer-events:none}'
  ].join('');

  K.define('math', '미적분 문제', CSS, function (S) {
    var list = K.shuffle(QS).slice(0, COUNT), i = 0, right = 0, busy = false;
    var prog = K.el('div', 'mg-hint', '', S.body);
    var q = K.el('div', 'mg-ma-q', '', S.body);
    var opts = K.el('div', 'mg-ma-opts', null, S.body);
    var btns = [];
    for (var k = 0; k < 4; k++) {
      (function (k) {
        var b = K.button('', null, opts);
        S.on(b, 'click', function () { pick(k); });
        btns.push(b);
      })(k);
    }

    // 연습장: canvas 에 그리기 (저장하지 않아요)
    var pad = K.el('div', 'mg-ma-pad', null, S.body);
    var cv = K.el('canvas', null, null, pad);
    K.el('span', null, '✏️ 연습장', pad);
    var clr = K.el('button', 'mg-ma-clear', '지우기', pad);
    clr.type = 'button';
    var ctx = cv.getContext('2d'), drawing = false;
    function fit() {
      var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      cv.width = Math.max(1, Math.round(r.width * d));
      cv.height = Math.max(1, Math.round(r.height * d));
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#26324a';
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    S.on(cv, 'pointerdown', function (e) {
      e.preventDefault(); drawing = true;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      var p = pos(e); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + 0.1, p[1]); ctx.stroke();
    });
    S.on(cv, 'pointermove', function (e) { if (!drawing) return; var p = pos(e); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
    S.on(cv, 'pointerup', function () { drawing = false; });
    S.on(cv, 'pointercancel', function () { drawing = false; });
    S.on(clr, 'click', function () { ctx.clearRect(0, 0, cv.width, cv.height); });
    S.on(window, 'resize', fit);

    var answerIdx = 0;
    function show() {
      var item = list[i];
      var choices = K.shuffle([item[1]].concat(item[2]));
      answerIdx = choices.indexOf(item[1]);
      prog.textContent = (i + 1) + ' / ' + COUNT + ' · 1~4 키로도 골라요';
      q.textContent = item[0];
      btns.forEach(function (b, k) { b.textContent = (k + 1) + ') ' + choices[k]; b.className = 'mg-btn'; b.disabled = false; });
      busy = false;
    }
    function pick(k) {
      if (busy) return;
      busy = true;
      var ok = k === answerIdx;
      if (ok) right++;
      btns.forEach(function (b) { b.disabled = true; });
      btns[answerIdx].className = 'mg-btn mg-ok';
      if (!ok) btns[k].className = 'mg-btn mg-no';
      S.sfx(ok ? 'ok' : 'down');
      i++;
      S.after(800, i < COUNT ? show : end);
    }
    function end() {
      var ratio = right / COUNT;
      S.finish({ score: ratio * 100, ratio: ratio, pass: ratio >= PASS, extra: { correct: right, total: COUNT } });
    }
    S.key(function (e) {
      var n = Number(e.key);
      if (n >= 1 && n <= 4) { pick(n - 1); return true; }
      return false;
    });
    S.timer(S.limit(90), end);
    show();
    fit();
  });
})();
