/* ① 단기기억 (학생 1교시 앞 · 발표 대사 외우기)
   문장을 잠깐 보여 줬다가 가리고, 입력한 글과의 일치율(ratio)을 계산해요. ratio 는 리듬게임 난이도에 쓰여요.
   입력한 글은 저장하지 않고, 화면에 다시 보여 주지도 않아요. */
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
  var POOL = [
    '경청은 상대의 말을 끝까지 듣는 것에서 시작합니다',
    '공감하는 말 한마디가 갈등을 줄입니다',
    '서로의 하루를 알면 오해가 줄어듭니다',
    '질문은 부끄러운 것이 아니라 용기입니다',
    '바쁜 사정을 말하면 기다려 줄 수 있습니다',
    '고맙다는 말은 신뢰를 쌓는 첫걸음입니다'
  ];
  var ROUNDS = 3, SHOW_MS = 2500, PASS = 0.6;

  // 한글 음절을 자모로 나눠서 비교해요 ("갔"↔"갓" 처럼 받침만 틀리면 조금만 깎이게)
  function jamo(s) {
    s = String(s || '').normalize('NFC').replace(/[\s.,!?·…'"~\-]/g, '');
    var out = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xAC00 && c <= 0xD7A3) {
        var n = c - 0xAC00;
        out.push('L' + Math.floor(n / 588), 'V' + Math.floor((n % 588) / 28));
        if (n % 28) out.push('T' + (n % 28));
      } else out.push(s[i]);
    }
    return out;
  }
  function similarity(answer, typed) {
    var a = jamo(answer), b = jamo(typed);
    if (!a.length || !b.length) return 0;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return Math.max(0, 1 - prev[b.length] / Math.max(a.length, b.length));
  }

  var CSS = [
    '.mg-mem-card{min-height:96px;display:flex;align-items:center;justify-content:center;text-align:center;padding:14px;border-radius:12px;',
    'background:#26324a;color:#fff;font-size:19px;font-weight:700;line-height:1.45;position:relative;word-break:keep-all}',
    '.mg-mem-card.mg-hide{background:#e9e4d8;color:#888;font-weight:400;font-size:15px}',
    '.mg-mem-card u{position:absolute;left:0;bottom:0;height:4px;background:#ffb703;width:100%;text-decoration:none}',
    '.mg-mem-form{display:flex;gap:6px;margin-top:10px}',
    '.mg-mem-form input{flex:1;min-width:0;font:inherit;font-size:16px;padding:10px;border:2px solid #cfc8b8;border-radius:10px;user-select:text;-webkit-user-select:text}',
    '.mg-mem-form input:focus{outline:none;border-color:#4f8cff}'
  ].join('');

  K.define('memory', '단기기억', CSS, function (S) {
    var list = K.shuffle(POOL).slice(0, ROUNDS);
    var results = [], i = 0, phase = 'ready', composing = false;

    var card = K.el('div', 'mg-mem-card', '발표 대사를 외워요. 문장이 ' + (SHOW_MS / 1000) + '초 동안 보였다가 사라져요!', S.body);
    var msg = K.el('div', 'mg-msg', '', S.body);
    var form = K.el('div', 'mg-mem-form', null, S.body);
    var input = K.el('input', null, null, form);
    input.type = 'text';
    input.maxLength = 80;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('aria-label', '본 문장 입력');
    input.placeholder = '본 문장을 그대로 쳐 보세요';
    var send = K.button('제출', null, form);
    K.el('div', 'mg-hint', '이름·학번·연락처는 쓰지 마세요 · 입력한 글은 저장되지 않아요', S.body);
    form.hidden = true;

    function show() {
      phase = 'show';
      card.classList.remove('mg-hide');
      card.textContent = list[i];
      var bar = K.el('u', null, null, card);
      if (!S.reduced) {
        bar.style.transition = 'width ' + SHOW_MS + 'ms linear';
        requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.width = '0%'; }); });
      }
      form.hidden = true;
      msg.textContent = (i + 1) + ' / ' + ROUNDS + ' · 잘 봐 두세요!';
      S.sfx('flag');
      S.after(SHOW_MS, hide);
    }
    function hide() {
      phase = 'type';
      card.classList.add('mg-hide');
      card.textContent = '❓ 문장이 가려졌어요';
      form.hidden = false;
      send.disabled = false;
      input.value = '';
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
      msg.textContent = '본 문장을 입력하고 Enter (또는 제출)';
    }
    function submit() {
      if (phase !== 'type') return;
      phase = 'judge';
      var r = similarity(list[i], input.value);
      input.value = '';
      input.blur();
      send.disabled = true;
      results.push(r);
      card.classList.remove('mg-hide');
      card.textContent = list[i];
      msg.textContent = '일치율 ' + Math.round(r * 100) + '%' + (r >= 0.9 ? ' 완벽해요!' : r >= 0.6 ? ' 좋아요' : ' 아쉬워요');
      S.sfx(r >= 0.8 ? 'up' : r >= 0.5 ? 'ok' : 'down');
      i++;
      S.after(1300, i < ROUNDS ? show : end);
    }
    function end() {
      // 못 푼 판은 0 으로 쳐요. 시간이 끝났을 때 입력 중이던 글은 그대로 채점해요.
      if (phase === 'type' && results.length < ROUNDS) results.push(similarity(list[i], input.value));
      input.value = '';
      var sum = 0;
      for (var k = 0; k < ROUNDS; k++) sum += results[k] || 0;
      var ratio = sum / ROUNDS;
      S.finish({ score: ratio * 100, ratio: ratio, pass: ratio >= PASS, extra: { rounds: ROUNDS, answered: results.length } });
    }

    S.on(input, 'compositionstart', function () { composing = true; });
    S.on(input, 'compositionend', function () { composing = false; });
    S.on(send, 'click', submit);
    S.key(function (e) {
      if (e.target !== input) return false;
      if (e.key === 'Enter') {
        // 한글 조합 중 Enter 는 글자를 확정하는 키라서 제출하지 않아요
        if (e.isComposing || composing || e.keyCode === 229) { e.stopPropagation(); return false; }
        submit();
        return true;
      }
      e.stopPropagation(); // 입력칸에서 친 키가 바깥 화면 단축키(1~4 등)로 새지 않게
      return false;
    });

    S.timer(S.limit(60), end);
    msg.textContent = '준비…';
    S.after(1200, show);
  });
})();
