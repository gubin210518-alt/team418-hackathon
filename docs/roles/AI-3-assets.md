# AI 3 · 에셋 (그림 · 소리) (`assets/incoming/`)

> 맡는 사람: **최하선** — 코딩을 몰라도 되는 역할이에요. **그림과 소리**를 만들어요.
> 먼저 읽을 것: [README.md](../../README.md) → [roles/README.md](README.md) → [contract.md](contract.md) (**6번 에셋 규격**) → [asset-prompts-v2.md](../asset-prompts-v2.md) ⭐ (프롬프트가 다 들어 있어요)

## AI 에게 이렇게 말하면 돼요 (하선 님용)

```
README.md, docs/roles/README.md, docs/roles/contract.md, docs/roles/AI-3-assets.md,
docs/asset-prompts-v2.md 를 읽어 줘.
너는 TEAM 418 의 AI 3 이야. 나는 코딩을 해 본 적이 없어.
코드 파일(.js, .html)은 고치지 말고, 내가 만든 그림·소리 파일을 assets/incoming/ 에 올리는 일만 같이 하자.
"할 일" 1번부터 하나씩 같이 하고, 하나 끝나면 GitHub Desktop 으로 올리는 법도 알려 줘.
```

- 그림은 **Google Gemini(나노바나나, 무료)** 로 만들어요. AI(Claude 등)는 프롬프트를 고르고 정리하는 걸 도와줘요.
- 모르는 건 단톡에 바로 물어보기. 혼자 막혀 있는 게 제일 손해예요.

## GitHub 에 올리는 법 (3단계)

1. GitHub Desktop 에서 **Fetch origin → Pull** (남이 바꾼 것 받기)
2. 만든 파일을 저장소 폴더의 `assets/incoming/` 안에 넣기 → 왼쪽 아래 **Summary** 에 한국어 한 줄 (예: `배경 컴퓨터실 추가`) → **Commit to main**
3. 위의 **Push origin** 누르기 → 단톡에 "배경 3장 올렸어" 한 줄

## 만드는 규칙 (꼭)

- **새 그림마다 새 채팅**에서 시작해요. (이전 그림이 섞이지 않게)
- 참고 이미지를 **꼭 첨부**해요. 배경은 `assets/backgrounds/office-morning.png`, 캐릭터는 `assets/characters/source/reference_lineup.jpg`
- 글자 · 로고 · 간판 글씨 · 실존 인물 · 유명 캐릭터는 넣지 않아요
- 배경은 16:9, **아래 20%는 대사창이 덮으니까** 중요한 건 위쪽에
- 캐릭터는 단색 초록 배경, 각자 칸 안에서 같은 크기
- 파일 이름은 [asset-prompts-v2.md](../asset-prompts-v2.md) 의 표 이름 그대로 (`computer-room.png` 처럼)
- 모든 그림은 **"AI 생성 이미지"** 라고 표기되니까, 만들 때 쓴 도구 이름(Gemini)을 단톡에 한 번 적어 두기
- **유료 도구(음악 AI 구독 포함)를 써야 할 것 같으면 쓰기 전에 연님에게 먼저 말하기**

## 할 일 (위에서부터 — 급한 순서)

### 1단계 · 배경 (10/24 오후)

- [ ] 새 배경 8장: `computer-room` · `school-gate` · `cafeteria` · `cleaning-area` · `study-hall` · `snack-shop` · `academy` · `teacher-home`
- [ ] 타이틀 `title` · 엔딩 3장 `end-good` · `end-normal` · `end-bad`
- [ ] 발표 표지 `pitch-cover` (연님이 발표 PDF 를 만들 때 써요)
- 기존 배경 5장(교무실 오전/오후 · 복도 · 교실 · 밤 방)은 다시 만들지 않아요

### 2단계 · 새 캐릭터 (10/24 저녁까지)

- [ ] 교감 선생님 + 반장 **기준 그림 1장**(B-0) → 마음에 드는 것을 골라 그걸 참고로 **8컷**(neutral · happy · sad · surprised · upset · call · talk · thanks)
- [ ] 9반 지각생 무리 1컷 `group9`
- 반장의 성별 · 외모는 임시예요. 연님이 정하면 바꿔요.

### 3단계 · 있으면 좋은 것 (10/25, 시간이 남으면)

- [ ] 아이콘: 저녁 메뉴 6종 `food-icons` · 학습지/연습장 `worksheet-notebook-icons` (호진 님의 미니게임이 써요)
- [ ] BGM 7곡 (타이틀 · 쌤 · 학생 · **리듬 110 BPM** · 밤 · 엔딩 좋음/나쁨) — ⚠️ 음악 AI 약관/요금 확인 전에는 만들지 않아요. 연님과 먼저 상의.

### 올리기 전 확인

- [ ] 글자가 그림에 안 들어갔나? (들어갔으면 다시 뽑기)
- [ ] 이름이 표와 같은가?
- [ ] 캐릭터: 초록 배경이 얼룩 없이 단색인가?

## 하면 안 되는 것

- ❌ `.js` · `.html` · `site/` · `server/` 파일 고치기 → 필요하면 단톡에
- ❌ API 키를 받아도 글이나 단톡에 붙여 넣기 (하선 님 역할엔 키가 필요 없어요)
- ❌ 노래 가사 · 남의 그림 · 유명 캐릭터를 넣거나 따라 그리기 (저작권)
- ❌ 유료 결제를 연님에게 말 없이 하기

## 다 됐다는 기준

- [ ] 1단계 그림이 모두 `assets/incoming/` 에 올라가 있음 (png)
- [ ] 2단계 교감 · 반장 8컷이 올라가 있음
- [ ] 단톡에 "○○ 올렸어" 알림을 남김
