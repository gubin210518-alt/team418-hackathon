/* ⑦ 빨리먹기 (학생 저녁)
   1) 어디서 먹을지 고르기 (1~3 키 또는 카드) → 2) 음식을 연타해서 시간 안에 다 먹기 (Space · Enter 또는 톡).
   고른 곳마다 먹을 양 · 시간이 달라요. extra.menu 에 고른 곳이 들어가요. */
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
  var MENUS = [
    { id: 'cafeteria', name: '급식실', icon: '🍱', bites: 22, time: 10, note: '양 많음 · 바로 먹기' },
    { id: 'snack', name: '분식집', icon: '🍜', bites: 16, time: 8, note: '걸어가느라 시간 조금 빠듯' },
    { id: 'store', name: '편의점', icon: '🍙', bites: 10, time: 6, note: '양 적음 · 줄 서느라 빠듯' }
  ];

  var CSS = [
    '.mg-se-menus{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}',
    '.mg-se-menus .mg-btn{background:#fff;color:#1f2430;border:2px solid #cfc8b8;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 4px;min-height:120px}',
    '.mg-se-menus .mg-btn span{font-size:34px;line-height:1.1}',
    '.mg-se-menus .mg-btn small{font-size:11px;color:#777;font-weight:400;word-break:keep-all}',
    '.mg-se-food{display:block;margin:6px auto;width:170px;height:170px;border-radius:50%;border:0;background:#fff3d6;box-shadow:0 6px 0 #e3c98f;',
    'font-size:84px;line-height:170px;cursor:pointer;padding:0;transition:transform .05s}',
    '.mg-se-food:active{transform:translateY(4px)}',
    '.mg-se-food.mg-bite{transform:scale(.93)}',
    '.mg-se-plate{height:14px;background:#e6e1d6;border-radius:7px;overflow:hidden;margin:8px 0 2px}',
    '.mg-se-plate i{display:block;height:100%;width:100%;background:#ff8c42}'
  ].join('');

  K.define('speedeat', '빨리먹기', CSS, function (S) {
    var menu = null, left = 0, phase = 'pick';
    var msg = K.el('div', 'mg-msg', '저녁 어디서 먹을까? (1~3)', S.body);
    var grid = K.el('div', 'mg-se-menus', null, S.body);
    var cards = MENUS.map(function (m, k) {
      var b = K.button('', null, grid);
      K.el('span', null, m.icon, b);
      K.el('b', null, (k + 1) + ') ' + m.name, b);
      K.el('small', null, m.note, b);
      S.on(b, 'click', function () { choose(k); });
      return b;
    });
    var food, plate, bar;

    function choose(k) {
      if (phase !== 'pick') return;
      phase = 'eat';
      menu = MENUS[k];
      left = menu.bites;
      S.sfx('select');
      grid.remove();
      msg.textContent = menu.name + '에서 저녁! 시간 안에 다 먹어요 (Space · Enter · 톡톡)';
      food = K.el('button', 'mg-se-food', menu.icon, S.body);
      food.type = 'button';
      food.setAttribute('aria-label', '한 입 먹기');
      plate = K.el('div', 'mg-se-plate', null, S.body);
      bar = K.el('i', null, null, plate);
      S.on(food, 'pointerdown', function (e) { e.preventDefault(); bite(); });
      S.on(food, 'click', function (e) { if (e.detail === 0) bite(); });
      S.timer(S.limit(menu.time), function () { end(false); });
      try { food.focus({ preventScroll: true }); } catch (e) {}
    }
    function bite() {
      if (phase !== 'eat') return;
      left--;
      S.sfx('pop');
      bar.style.width = (left / menu.bites * 100) + '%';
      if (!S.reduced) { food.classList.add('mg-bite'); S.after(60, function () { food.classList.remove('mg-bite'); }); }
      if (left <= 0) end(true);
    }
    function end(ok) {
      phase = 'end';
      var ratio = menu ? (menu.bites - Math.max(0, left)) / menu.bites : 0;
      var speed = ok ? S.timeLeft() / S.limit(menu.time) : 0;
      S.finish({ score: ratio * 80 + speed * 20, ratio: ratio, pass: !!ok, extra: { menu: menu ? menu.id : '', bites: menu ? menu.bites - Math.max(0, left) : 0 } });
    }
    S.key(function (e) {
      if (phase === 'pick') { var n = Number(e.key); if (n >= 1 && n <= 3) { choose(n - 1); return true; } return false; }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') { if (!e.repeat) bite(); return true; }
      return false;
    });
    // 고르는 동안에도 시간은 가요 (오래 고민하면 자동으로 급식실)
    S.timer(15, function () { if (phase === 'pick') choose(0); });
  });
})();
