// 미연시 모든 선택 조합을 돌려서, 엔딩마다 몇 가지 길로 도달하는지 세요.
// 사용법 (저장소 맨 위 폴더에서):  node tools/scripts/check_endings.js
// 대본(site/index.html 안의 ROUTES)을 고친 뒤 "못 보는 엔딩"이 생기지 않았는지 확인할 때 써요.
// 숨겨진 엔딩(말 한마디의 힘)은 직접 입력에 따라 열려서 여기서는 세지 않아요.
const fs = require('fs');
const h = fs.readFileSync('site/index.html', 'utf8');
const s = h.indexOf('/* ===== 미연시 v2');
const body = h.slice(s, h.indexOf('/* ---------- 저장', s));
const { ROUTES } = new Function(body.replace(/^[\s\S]*?var NPC=/, 'var NPC=') + ';return {ROUTES};')();
for (const r of ['s', 'g']) {
  const R = ROUTES[r], hit = {};
  let total = 0;
  (function rec(i, S) {
    if (i === R.scenes.length) {
      total++;
      for (const E of R.endings) if (E.ok(S)) { hit[E.id] = (hit[E.id] || 0) + 1; break; }
      return;
    }
    for (const c of R.scenes[i].ch) {
      if (c.need && !S.F[c.need]) continue;
      const N = { v: { ...S.v }, F: { ...S.F }, total: S.total };
      for (const n in (c.d || {})) if (n in N.v) { N.v[n] += c.d[n]; N.total += c.d[n]; }
      if (c.set) N.F[c.set] = true;
      rec(i + 1, N);
    }
  })(0, { v: Object.fromEntries(R.cast.map(n => [n, 0])), F: {}, total: 0 });
  console.log(R.name, '경우의 수', total);
  for (const E of R.endings) console.log('  ', (hit[E.id] || 0).toString().padStart(4), E.g.padEnd(6), E.t, hit[E.id] ? '' : '  ← 도달 불가!');
}
