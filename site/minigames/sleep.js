/* ⑤ 졸음참기 (학생 4교시 · 7교시)
   눈꺼풀이 점점 내려와요. 버튼을 연타(또는 Space · Enter)해서 버텨요. 다 감기면 실패.
   opts.period: 4(기본) 또는 7. 7교시는 더 빨리 졸리고 졸음 파도가 자주 와요. pass:false 면 7교시에 학습지를 빼앗겨요. */
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
  var CSS = [
    '.mg-sl-scene{position:relative;height:210px;border-radius:12px;overflow:hidden;background:#2f5d50;color:#fff}',
    '.mg-sl-board{position:absolute;left:8%;right:8%;top:18%;bottom:30%;border:6px solid #8d6e4c;border-radius:6px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:18px;padding:6px}',
    '.mg-sl-lid{position:absolute;left:0;right:0;background:#1a1410;height:0}',
    '.mg-sl-lid.top{top:0;border-radius:0 0 50% 50%/0 0 30px 30px}',
    '.mg-sl-lid.bot{bottom:0;border-radius:50% 50% 0 0/30px 30px 0 0}',
    '.mg-sl-wave{position:absolute;left:0;right:0;bottom:6px;text-align:center;font-weight:700;color:#ffd166;text-shadow:0 1px 4px #000}',
    '.mg-sl-meter{height:12px;background:#e6e1d6;border-radius:6px;overflow:hidden;margin:10px 0 4px}',
    '.mg-sl-meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd166,#ef476f)}',
    '.mg-sl-wake{width:100%;min-height:64px;font-size:18px;margin-top:6px}'
  ].join('');

  K.define('sleep', '졸음참기', CSS, function (S, opts) {
    var p7 = Number(opts.period) === 7;
    var total = S.limit(p7 ? 18 : 15);
    var rate = p7 ? 24 : 16;          // 1초에 졸음이 오르는 양
    var PUSH = 9;                       // 한 번 누를 때 깨는 양
    var d = 20, maxD = d, sum = 0, n = 0, waveEnd = 0, nextWave = 0, last = 0;

    var scene = K.el('div', 'mg-sl-scene', null, S.body);
    K.el('div', 'mg-sl-board', p7 ? '7교시 물질과 에너지\n몰 농도 = 용질의 몰수 / 용액의 부피' : '4교시 역학과 에너지\nF = ma · 운동 에너지 = ½mv²', scene)
      .style.whiteSpace = 'pre-line';
    var top = K.el('div', 'mg-sl-lid top', null, scene);
    var bot = K.el('div', 'mg-sl-lid bot', null, scene);
    var wave = K.el('div', 'mg-sl-wave', '', scene);
    var meter = K.el('div', 'mg-sl-meter', null, S.body);
    var bar = K.el('i', null, null, meter);
    var wake = K.button('😳 정신 차리기! (Space)', null, S.body);
    wake.classList.add('mg-sl-wake');
    K.el('div', 'mg-hint', (p7 ? '7교시라 더 졸려요… ' : '') + total + '초 동안 버티면 성공', S.body);

    function push() {
      if (S.finished) return;
      d = Math.max(0, d - PUSH);
      S.sfx('tap');
      draw();
    }
    function draw() {
      top.style.height = bot.style.height = (d / 2) + '%';
      bar.style.width = d + '%';
      if (!S.reduced) scene.style.filter = d > 50 ? 'blur(' + ((d - 50) / 25).toFixed(1) + 'px)' : '';
    }
    function end(ok) {
      var surv = Math.min(1, (total - S.timeLeft()) / total);
      if (ok) surv = 1;
      var alert = n ? 1 - sum / n / 100 : 0;
      S.finish({ score: surv * 60 + alert * 40 * surv, ratio: surv, pass: !!ok, extra: { period: p7 ? 7 : 4, maxDrowsy: Math.round(maxD) } });
    }

    S.on(wake, 'pointerdown', function (e) { e.preventDefault(); push(); });
    S.on(wake, 'click', function (e) { if (e.detail === 0) push(); });
    S.key(function (e) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') { if (!e.repeat) push(); return true; } // 꾹 누르기는 안 쳐요
      return false;
    });

    S.loop(function (t) {
      if (!last) { last = t; nextWave = t + 2500; return; }
      var dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      if (t > nextWave) { waveEnd = t + 1100; nextWave = t + (p7 ? 2600 : 3800) + Math.random() * 1500; }
      var waving = t < waveEnd;
      wave.textContent = waving ? '😪 졸음이 몰려와요!' : '';
      d += rate * (waving ? 2.2 : 1) * dt;
      maxD = Math.max(maxD, d);
      sum += d; n++;
      draw();
      if (d >= 100) { d = 100; draw(); end(false); return false; }
    });
    S.timer(total, function () { end(true); });
    draw();
  });
})();
