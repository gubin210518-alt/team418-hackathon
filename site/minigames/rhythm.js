/* ② 리듬게임 (학생 1교시 · 화법과 언어 발표 수행평가)
   opts.memoryRatio(단기기억 결과)가 높을수록 쉬워요: 타일이 느리게 내려오고, 판정이 넓고, 타일이 적어요.
   opts.bpm(기본 110)에 맞춰 타일이 떨어져요. 음악 파일이 없어도 메트로놈(SFX)이나 무음으로 돌아가요.
   키보드 D F J K (또는 ← ↓ ↑ →) · 터치는 줄을 톡. */
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
  var KEYS = { d: 0, f: 1, j: 2, k: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
  var LABEL = ['D', 'F', 'J', 'K'];
  var LEAD_BEATS = 4, PASS = 0.6;

  function lerp(a, b, t) { return a + (b - a) * t; }

  var CSS = [
    '.mg-rh-info{display:flex;justify-content:space-between;font-size:13px;color:#555;margin-bottom:6px}',
    '.mg-rh-field{position:relative;height:min(58vh,360px);min-height:260px;display:flex;gap:4px;background:#1d2335;border-radius:12px;overflow:hidden;touch-action:none}',
    '.mg-rh-lane{flex:1;position:relative;background:rgba(255,255,255,.04);border:0;padding:0;margin:0;cursor:pointer;color:inherit;font:inherit}',
    '.mg-rh-lane.mg-hit{background:rgba(255,255,255,.22)}',
    '.mg-rh-lane b{position:absolute;left:0;right:0;bottom:8px;text-align:center;color:#9aa6c8;font-size:15px}',
    '.mg-rh-line{position:absolute;left:0;right:0;height:4px;background:#ffb703;pointer-events:none}',
    '.mg-rh-note{position:absolute;left:8%;width:84%;height:18px;margin-top:-9px;border-radius:6px;top:0;pointer-events:none;will-change:transform}',
    '.mg-rh-note.l0{background:#ef476f}.mg-rh-note.l1{background:#ffd166}.mg-rh-note.l2{background:#06d6a0}.mg-rh-note.l3{background:#4cc9f0}',
    '.mg-rh-judge{position:absolute;left:0;right:0;top:38%;text-align:center;font-size:24px;font-weight:800;color:#fff;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.5)}',
    '.mg-rh-count{position:absolute;left:0;right:0;top:20%;text-align:center;font-size:44px;font-weight:800;color:#fff;pointer-events:none}',
    '.mg-rh-score{display:flex;justify-content:center;gap:14px;font-size:13px;margin-top:6px}'
  ].join('');

  K.define('rhythm', '발표 리듬', CSS, function (S, opts) {
    var m = Number(opts.memoryRatio);
    var hasMem = opts.memoryRatio != null && isFinite(m);
    m = hasMem ? K.clamp(m, 0, 1) : 0.5;
    var bpm = K.clamp(Number(opts.bpm) || 110, 60, 200);
    var beat = 60 / bpm;

    // 난이도: m=1 쉬움 · m=0 어려움
    var approach = lerp(1.15, 2.0, m);     // 타일이 위에서 판정선까지 오는 시간(초)
    var winP = lerp(0.045, 0.08, m);       // Perfect 판정 폭(초)
    var winG = lerp(0.10, 0.17, m);        // Good 판정 폭(초)
    var restP = lerp(0.10, 0.40, m);       // 박자를 쉬는 확률
    var eighthP = lerp(0.40, 0.0, m);      // 8분음표(반 박자) 추가 확률
    var level = m >= 0.7 ? '쉬움' : m >= 0.4 ? '보통' : '어려움';

    // 곡 길이: 기본 32박. timeLimit 이 있으면 거기에 맞춰요
    var lim = Number(opts.timeLimit);
    var beats = lim > 0 ? Math.max(8, Math.floor(lim / beat) - LEAD_BEATS - 2) : 32;
    var notes = [], last = -1;
    for (var b = 0; b < beats; b++) {
      if (Math.random() < restP && b % 4 !== 0) continue;
      var lane = Math.floor(Math.random() * 4);
      if (lane === last && Math.random() < 0.6) lane = (lane + 1 + Math.floor(Math.random() * 3)) % 4;
      last = lane;
      notes.push({ t: (LEAD_BEATS + b) * beat, lane: lane });
      if (Math.random() < eighthP && b < beats - 1) notes.push({ t: (LEAD_BEATS + b + 0.5) * beat, lane: (lane + 2) % 4 });
    }
    var endT = notes.length ? notes[notes.length - 1].t + 1.0 : (LEAD_BEATS + beats) * beat;

    var info = K.el('div', 'mg-rh-info', null, S.body);
    K.el('span', null, (hasMem ? '외운 정도 ' + Math.round(m * 100) + '% → ' : '') + '난이도 ' + level, info);
    K.el('span', null, bpm + ' BPM', info);

    var field = K.el('div', 'mg-rh-field', null, S.body);
    var lanes = [];
    for (var i = 0; i < 4; i++) {
      var ln = K.el('button', 'mg-rh-lane', null, field);
      ln.type = 'button';
      ln.setAttribute('aria-label', (i + 1) + '번 줄 (' + LABEL[i] + ')');
      K.el('b', null, LABEL[i], ln);
      lanes.push(ln);
    }
    var line = K.el('div', 'mg-rh-line', null, field);
    var judge = K.el('div', 'mg-rh-judge', '', field);
    var count = K.el('div', 'mg-rh-count', '', field);
    var sc = K.el('div', 'mg-rh-score', null, S.body);
    var sP = K.el('span', null, 'Perfect 0', sc), sG = K.el('span', null, 'Good 0', sc), sM = K.el('span', null, 'Miss 0', sc);
    K.el('div', 'mg-hint', 'D F J K (또는 ← ↓ ↑ →) · 휴대폰은 줄을 톡! 타일이 노란 선에 닿을 때 눌러요', S.body);

    var P = 0, G = 0, M = 0, t0 = 0, ticked = -1, hitY = 0, judgeTimer = 0;

    function now() { return (performance.now() - t0) / 1000; }
    function showJudge(text, color) {
      judge.textContent = text;
      judge.style.color = color;
      if (judgeTimer) clearTimeout(judgeTimer);
      judgeTimer = S.after(350, function () { judge.textContent = ''; });
    }
    function flash(lane) {
      if (S.reduced) return;
      lanes[lane].classList.add('mg-hit');
      S.after(90, function () { lanes[lane].classList.remove('mg-hit'); });
    }
    function counts() { sP.textContent = 'Perfect ' + P; sG.textContent = 'Good ' + G; sM.textContent = 'Miss ' + M; }
    function judgeNote(n, kind) {
      n.done = true;
      if (n.el) { n.el.remove(); n.el = null; }
      if (kind === 'p') { P++; showJudge('Perfect!', '#ffd166'); }
      else if (kind === 'g') { G++; showJudge('Good', '#06d6a0'); }
      else { M++; showJudge('Miss', '#ef476f'); }
      counts();
    }
    function hit(lane) {
      if (!t0 || S.finished) return;
      flash(lane);
      var t = now(), best = null, bd = 9;
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        if (n.done || n.lane !== lane) continue;
        var d = Math.abs(n.t - t);
        if (d < bd) { bd = d; best = n; }
        if (n.t - t > winG) break;
      }
      if (best && bd <= winG) { judgeNote(best, bd <= winP ? 'p' : 'g'); S.sfx('tap'); }
    }
    function end() {
      var N = notes.length || 1;
      M = notes.length - P - G;
      var ratio = (P + G) / N;
      S.finish({ score: (P + 0.6 * G) / N * 100, ratio: ratio, pass: ratio >= PASS, extra: { perfect: P, good: G, miss: M, level: level } });
    }

    lanes.forEach(function (ln, i) {
      S.on(ln, 'pointerdown', function (e) { e.preventDefault(); hit(i); });
      S.on(ln, 'click', function (e) { if (e.detail === 0) hit(i); }); // 키보드로 버튼을 눌렀을 때(Space/Enter)
    });
    S.key(function (e) {
      if (e.repeat) return KEYS[e.key] != null || KEYS[(e.key || '').toLowerCase()] != null;
      var k = KEYS[e.key] != null ? KEYS[e.key] : KEYS[(e.key || '').toLowerCase()];
      if (k == null) return false;
      hit(k);
      return true;
    });

    S.loop(function () {
      if (!t0) return;
      var t = now();
      hitY = hitY || field.clientHeight - 44;
      line.style.top = hitY + 'px';
      // 메트로놈 + 카운트다운
      var bi = Math.floor(t / beat);
      if (bi !== ticked && t < endT - 0.8) {
        ticked = bi;
        S.sfx(bi < LEAD_BEATS ? 'gtick' : 'click');
        count.textContent = bi < LEAD_BEATS ? (LEAD_BEATS - bi > 3 ? '준비' : String(LEAD_BEATS - bi)) : '';
      }
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        if (n.done) continue;
        var dt = n.t - t;
        if (dt > approach) break;
        if (dt < -winG) { judgeNote(n, 'm'); continue; }
        if (!n.el) n.el = K.el('div', 'mg-rh-note l' + n.lane, null, lanes[n.lane]);
        n.el.style.transform = 'translateY(' + (hitY * (1 - dt / approach)) + 'px)';
      }
      if (t >= endT) { end(); return false; }
    });

    // 시작: 화면 크기가 잡힌 뒤 바로 카운트다운
    S.timer(endT + 0.3, end);
    t0 = performance.now();
  });
})();
