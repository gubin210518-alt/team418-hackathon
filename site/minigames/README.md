# site/minigames/ — 미니게임 7개 (AI 2 · 호진)

연님이 `index.html` 장면에 붙일 때 보는 문서예요. 규격 원본은 [docs/roles/contract.md 5번](../../docs/roles/contract.md#5-미니게임-규격-ai-2-호진-이-만들고-ai-1-이-불러요)이에요.
- 시험: [`test.html`](test.html) (게임 고르기 → opts 바꾸기 → `done` 결과가 로그에 찍혀요)
- **붙이는 예시: [`example-scene.html`](example-scene.html)** — memory → rhythm 으로 이어 주고, 결과를 대사로 바꾸고, 에러가 나도 건너뛰기로 넘어가는 모습까지 있어요. 안의 `playMinigame()` 함수를 그대로 복사해서 쓰면 돼요.

## 붙이는 법

```html
<script src="sfx.js"></script>                 <!-- 있으면 효과음, 없어도 돼요 -->
<script src="minigames/memory.js"></script>    <!-- 쓰는 게임만 불러도 돼요. 파일 하나로 혼자 돌아가요 -->
<script src="minigames/rhythm.js"></script>
```

```js
var box = document.getElementById('mg-box');          // 게임이 그려질 칸 (게임은 이 안에만 그려요)
MG.memory.start(box, { reduced: false, muted: false }, function (r) {
  // r = { score: 0~100 정수, ratio: 0~1, pass: true/false, extra: {...} } — 딱 한 번 와요
  MG.rhythm.start(box, { memoryRatio: r.ratio, bpm: 110 }, function (r2) { /* 다음 장면 */ });
});
// 장면을 중간에 떠날 때: MG.memory.stop()  → 타이머·이벤트 정리 + 화면에서 지움. 이때는 done 이 오지 않아요.
```

- `start` 는 같은 칸에 게임 화면(`.mg-wrap`, 최대 폭 560px)을 붙여요. 끝나면 "끝! ○○점" 이 남아 있고, 지우는 건 `stop()` 이에요.
- `start` 를 다시 부르면 앞 판을 정리하고 새로 시작해요.
- 건너뛰기 버튼을 누르면 `{score:0, ratio:0, pass:false, extra:{skipped:true}}`.
- 게임 코드가 터지면 멈추지 않고 `{score:0, ratio:0, pass:false, extra:{error:true}}` 로 끝나요.

## 모든 게임 공통 opts

| opts | 뜻 |
|---|---|
| `reduced` | true 면 번쩍임 · 흔들림 · 흐림 효과 끄기 |
| `muted` | true 면 `SFX.play` 를 아예 안 불러요 (`window.SFX` 가 없을 때도 조용히 넘어가요) |
| `timeLimit` | 제한 시간(초). 없으면 아래 표의 기본값 |

## 게임별 표

| id | 제목 | 일과표 | 추가 opts | 소요 시간 (보통 / 최대) | 통과(`pass`) 기준 | `ratio` | `extra` |
|---|---|---|---|---|---|---|---|
| `memory` | 단기기억 | 1교시 앞 | — | 약 15초 / 60초 | ratio ≥ 0.6 | 문장 3개의 평균 일치율 | `rounds`, `answered` |
| `rhythm` | 발표 리듬 | 1교시 발표 | `memoryRatio`(0~1, 없으면 0.5) · `bpm`(기본 110) | 약 20초 / 곡 끝까지 (timeLimit 주면 곡을 거기에 맞춰 줄임) | (Perfect+Good)/전체 ≥ 0.6 | (Perfect+Good)/전체 | `perfect`, `good`, `miss`, `level`(쉬움·보통·어려움) |
| `classify` | 정보 분류 | 2교시 데이터과학 | — | 약 8초 / 30초 | 8장 중 5장 이상 | 맞힌 비율 | `correct`, `total` |
| `math` | 미적분 문제 | 3교시 미적분 | — | 약 20초 / 90초 | 3문제 중 2개 이상 | 맞힌 비율 | `correct`, `total` |
| `sleep` | 졸음참기 | 4교시 · 7교시 | `period`(4 또는 7) | 15초(4교시) · 18초(7교시) — 지면 3~12초에 끝 | 끝까지 버팀 | 버틴 시간 비율 | `period`, `maxDrowsy`(0~100) |
| `inquiry` | 기하 탐구 | 6교시 기하 | — | 약 12초 / 40초 | 4문제 중 2개 이상 | 맞힌 비율 | `correct`, `total` |
| `speedeat` | 빨리먹기 | 저녁 | — | 약 8초 / 고르기 15초 + 먹기(급식실 10 · 분식집 8 · 편의점 6초) | 시간 안에 다 먹음 | 먹은 비율 | `menu`(`cafeteria`·`snack`·`store`), `bites` |

- "보통" 시간은 사람이 한 번 할 때를 어림한 값이에요 (재 본 값 아님). "최대" 는 코드에 정한 제한 시간이에요.
- `timeLimit` 을 주면 위의 "최대" 대신 그 시간이 제한 시간이 돼요 (speedeat 은 먹는 시간, rhythm 은 곡 길이).
- 끝난 뒤 "끝! ○○점" 화면은 `stop()` 을 부를 때까지 남아 있어요.

## 화면에 필요한 크기

게임 상자(`.mg-wrap`)는 **받은 칸의 폭 100% (최대 560px)** 를 쓰고, 높이는 아래만큼 아래로 늘어나요. 칸에 높이를 고정하지 말고 `auto` 로 두거나, 모자라면 세로 스크롤이 되게 해 주세요.

| id | 375px 폭 휴대폰 (폭 × 높이) | 넓은 화면 | 메모 |
|---|---|---|---|
| `memory` | 343 × 297 | 560 × 279 | 입력칸에서 휴대폰 키보드가 올라와요 |
| `rhythm` | 343 × 523 | 560 × 505 | 판이 화면 높이의 58% (260~360px). 가장 커요 |
| `classify` | 343 × 311 | 560 × 311 | |
| `math` | 343 × 429 | 560 × 429 | 연습장 170px 포함 |
| `sleep` | 343 × 400 | 560 × 400 | |
| `inquiry` | 343 × 374 | 560 × 374 | |
| `speedeat` | 343 × 317 | 560 × 317 | 고르기 화면은 221 |

(375px 폭 페이지에서 바깥 여백 16px 씩 빼고 잰 값. 화면 크기에 따라 조금 달라져요.)

- **sleep 이 `pass:false` 면 7교시에 옆자리 학습지를 빼앗기는 장면**으로 이어 주세요 (일과표).
- **speedeat 의 `extra.menu`** 로 "어디서 먹었는지" 대사를 바꿀 수 있어요.

## rhythm 난이도 (memoryRatio 에 따라)

10/24 에 브라우저에서 실제로 재 본 값이에요 (timeLimit 12초, 일부러 늦게 눌렀을 때 판정).

| memoryRatio | 난이도 | 타일이 떨어지는 시간 | Perfect 폭 | Good 폭 | 정확히 | 70ms 늦게 | 125ms 늦게 |
|---|---|---|---|---|---|---|---|
| 0.2 | 어려움 | 1.32초 | ±52ms | ±114ms | Perfect | Good | **Miss** |
| 0.5 | 보통 | 1.57초 | ±63ms | ±135ms | Perfect | Good | Good |
| 0.9 | 쉬움 | 1.91초 | ±77ms | ±163ms | Perfect | **Perfect** | Good |

- 외운 게 적을수록 타일이 빨리 오고, 판정이 좁고, 타일 수도 많아요 (20초 곡 기준 쉬움 약 21개 · 어려움 약 42개).
- 음악은 아직 없어요. 지금은 박자마다 `SFX.play('click')`, 카운트다운은 `'gtick'` 이에요. 하선 님 BGM(110 BPM)을 붙이려면 **시작 시각을 맞추는 opts 가 필요해서 규격에 먼저 적어야 해요** → 연님과 상의.

## 키 · 터치

| id | 키보드 | 터치 |
|---|---|---|
| memory | 글 입력 + Enter (한글 조합 중 Enter 는 무시) | 입력칸 · 제출 버튼 |
| rhythm | D F J K 또는 ← ↓ ↑ → | 줄을 톡 |
| classify | ← / 1 = 개인정보, → / 2 = 공개 정보 | 버튼 |
| math | 1 ~ 4 | 버튼 · 연습장에 손가락으로 쓰기 |
| sleep | Space · Enter 연타 (꾹 누르기는 안 쳐요) | 버튼 연타 |
| inquiry | 1 ~ 4 | 버튼 |
| speedeat | 1 ~ 3 고르기 → Space · Enter 연타 | 카드 → 음식 연타 |

- **게임 중에는 위 키를 게임이 먼저 받아요** (`window` capture 단계, `stopPropagation`). 그래서 연님 화면의 1~4 · Enter 단축키가 같이 눌리지 않아요. 게임이 끝나거나 `stop()` 하면 풀려요.

## 효과음 (`window.SFX` 가 있을 때만)

| 이름 | 쓰는 곳 |
|---|---|
| `flag` | memory 문장 보여 줄 때 |
| `up` · `ok` · `down` | 맞음(크게) · 맞음 · 틀림 |
| `gtick` · `click` | rhythm 카운트다운 · 박자 |
| `tap` | rhythm 맞힘 · sleep 깨기 |
| `select` · `pop` | speedeat 메뉴 고르기 · 한 입 |

## 그림

지금은 그림 파일 없이 도형 · CSS · 이모지로 그려요. 하선 님의 음식 · 학습지 아이콘이 `site/img/` 에 들어가면 경로를 받아서 바꿀 예정이에요.

## 지키는 것

- 바닐라 JS, 외부 주소 없음 (인터넷이 끊겨도 돼요)
- 플레이어가 친 글은 저장하지 않고 `innerHTML` 에 넣지 않아요 (`textContent` 만 써요)
- 전역에는 `MG` 만 더해요. `MG._kit` 은 일곱 파일에 똑같이 들어 있는 공통 도구(타이머 · 건너뛰기 · done 한 번)예요. **고칠 때는 7개 파일을 같이 고쳐야 해요.**

## 시험한 것 (10/24, Playwright 브라우저 · 가로 375px · 터치만)

| 게임 | 이겼을 때 | 졌을 때 | 건너뛰기 |
|---|---|---|---|
| memory | 정확히 입력 → pass true · 100점 | 틀리게 입력 → pass false · 5점 | pass false · skipped true |
| rhythm | 타일마다 톡 → true · 100점 | 안 누름 → false · 0점 | 〃 |
| classify | 맞게 분류 → true · 100점 | 반대로 → false · 0점 | 〃 |
| math | 정답 → true · 100점 | 오답 → false · 0점 | 〃 |
| sleep 4교시 / 7교시 | 연타 → true · 99점 | 가만히 → false · 19점 / 13점 | 〃 |
| inquiry | 정답 → true · 100점 | 오답 → false · 0점 | 〃 |
| speedeat | 연타(급식실 · 편의점) → true · 93 / 94점 | 가만히 → false · 0점 | 〃 |

**sleep 난이도** (초당 몇 번 누르면 버티는지)

| period | 가만히 | 초당 1.5번 | 초당 2.5번 | 초당 3.5번 |
|---|---|---|---|---|
| 4 | 3.8초 만에 잠듦 | 11.9초에 잠듦 | 15초 버팀 ✅ | ✅ |
| 7 | 3.3초 만에 잠듦 | 4.3초에 잠듦 | 6.3초에 잠듦 | 18초 버팀 ✅ |

**정리(뒷정리) 시험** — 7개 모두 같은 결과

- 건너뛰기를 두 번 눌러도 `done` 은 1번
- `done` 뒤 · `stop()` 두 번 뒤 · 시작 직후 `stop()` 뒤: 남은 타이머 0 · 애니메이션(rAF) 0 · window/document 이벤트 0
- 시작 직후 `stop()` 하면 `done` 이 오지 않음 (게임 칸도 비워짐)
- 버튼 · 입력칸이 375px 화면 밖으로 나가지 않고, 가로 스크롤이 생기지 않음
- `muted:true` 이면 `SFX.play` 0번, `window.SFX` 를 지워도 14판 모두 오류 없이 끝남
- 브라우저 오류 0건
- example-scene.html: memory(76%) → rhythm "쉬움" 으로 이어지고 결과 · 대사가 나옴. 없는 게임(`oops`)을 불러도 건너뛰기 결과로 이야기가 계속됨
