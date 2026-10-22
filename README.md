# 쌤 VS 고딩 · 역지사지 시뮬레이터

> This repository is the team 418's in shinjung high school private repository for 2026 ai hackathon in Ulsan Science Mathmatics and information festival

2026 울산 AI 해커톤 **TEAM 418** (신정고 · 최호진 · 최하선 · 이승민 / 지도교사 박민하)
대회: 2026.10.24(토)~25(일), 울산전시컨벤션센터
주제: 교육공동체 신뢰회복 — **1번 "소통과 공감으로 서로 이해하는 학교"**

> 쌤 루트와 고딩 루트 중 하나를 골라, AI가 연기하는 NPC(학부모·학생·쌤·친구)와 대화하는 웹 미연시예요.
> 내 대답에 따라 **신뢰 게이지(15칸)**가 오르내리고, 엔딩에서 AI가 **"서로 몰랐던 일 TOP 3"**를 알려줘요.

- 소개 사이트: https://team418.netlify.app
- 설계도(화면 · 대본 · 준비물): https://team418.netlify.app/build.html

---

## 폴더 구조

```
team418-hackathon/
├─ README.md            ← 지금 이 파일
├─ .env.example         ← API 키 넣는 양식 (진짜 키는 .env 에, 절대 커밋 X)
├─ .gitignore           ← .env 가 GitHub 에 안 올라가게 막아 둠
├─ assets/
│  ├─ characters/       ← 캐릭터 4명 표정 5종 + 동작 3종 (초록 배경, 16:9)
│  └─ backgrounds/      ← 배경 5종 (사람 없음)
├─ site/                ← 지금 배포된 소개 사이트 (index.html, build.html, 소개 영상)
├─ server/              ← AI NPC 서버 (키를 숨기는 곳) — 만들 예정
├─ tools/
│  ├─ scripts/          ← cutout.py (그림 자르기·배경 지우기), check_endings.js (엔딩 도달 확인)
│  └─ intro-video/      ← 15초 소개 영상 원본 (코드로 만든 영상)
└─ docs/
   ├─ history.md            ← 프로젝트 흐름 · 결정 기록 · 남은 일  ⭐ 처음 오면 여기부터
   ├─ conversation-notes.md ← Claude 와 나눈 대화 정리 (시간 순)
   ├─ vn-design.md          ← 미연시 설계: 인물 6명 · 장면표 · 엔딩 15종 조건
   ├─ ai-tools.md           ← NPC AI(JSON) · 그림 AI 비교 · 크레딧 · 주의점
   ├─ prompts.md            ← Higgsfield · 나노바나나 프롬프트 전체
   ├─ asset-pipeline.md     ← 에셋 만드는 순서 · 배경 지우기 · 영상 · 배포
   └─ archive/              ← 옛 사이트 버전(하드웨어 시절 배선도 포함), SVG vs AI 비교, 프롬프트 페이지
```

## 캐릭터 · 에셋

| 칸(왼→오) | 이름 | 역할 |
|---|---|---|
| 1 | 박 쌤 | 담임 30대. 쌤 루트에선 내가 되고, 고딩 루트에선 대화 상대 |
| 2 | 민준 | 고2. 쌤 루트에서 질문하러 오는 학생, 고딩 루트에선 내가 되는 학생 |
| 3 | 학부모 | 민준이 어머니. 쌤 루트에서 전화를 거는 학부모 |
| 4 | 서연 | 고2 친구. 고딩 루트에서 같이 고민해 주는 친구 |

자세한 파일 목록은 [assets/README.md](assets/README.md) 를 보세요.
모든 그림은 **AI 생성 이미지**예요 (Higgsfield Seedream 5.0 Lite · Google Gemini 나노바나나). 발표 자료에도 꼭 표기해요.

---

## 처음 참여하는 방법 (팀원용)

1. GitHub 가입 → 연님에게 **아이디** 알려주기 → 메일로 온 **초대 수락**
2. [GitHub Desktop](https://desktop.github.com) 설치 → `File > Clone repository` → `team418-hackathon` 선택
3. 내 AI(Claude, ChatGPT 등)에게 이 폴더를 열어 주고 `README.md 읽고 시작해 줘` 라고 말하기

### 같이 작업할 때 약속

- **작업 시작 전 `Fetch / Pull`** 먼저 (남이 바꾼 걸 받아오기)
- **내 담당 폴더만** 고치기 → 충돌이 거의 안 나요
  - 서버(`server/`) · 화면(`site/`) · 대본(`scenes/`) 을 나눠 맡기
- 작게 자주 `Commit` → `Push`. 커밋 메시지는 한국어로 "무엇을 왜" 한 줄
- 남의 파일을 고쳐야 하면 단톡에 먼저 말하기

---

## 🔐 API 키 규칙 (꼭 읽기)

이 저장소는 **비공개(Private)** 예요. 그래도 **API 키는 저장소에 올리지 않아요.**

왜냐하면:
- Git 은 지운 파일도 **기록(히스토리)에 영원히 남아요.** 나중에 실수로 공개로 바꾸거나, 누가 복사해 가면 키가 그대로 새요.
- 키가 새면 **남이 우리 돈으로 AI 를 써요.** 요금 폭탄이 날 수 있어요.

대신 이렇게 해요:

1. `.env.example` 을 복사해서 같은 폴더에 **`.env`** 라는 이름으로 저장
2. `.env` 안에 진짜 키를 붙여 넣기 (`.gitignore` 가 막아 줘서 GitHub 에 안 올라가요)
3. 팀원에게 키를 줄 때는 **카톡 1:1 / 직접** 전달. 단톡·이슈·README·코드에 붙여 넣지 않기
4. 키를 **화면(site/) 코드에 넣지 않기** — 브라우저 코드는 누구나 볼 수 있어요. 키는 `server/` 에서만 읽어요.
5. AI 서비스 관리 페이지에서 **월 사용 한도(예산 상한)** 를 꼭 걸어 두기
6. 키가 샜다고 의심되면 **바로 그 서비스에서 키 삭제(재발급)** 하고 단톡에 알리기

> 결제 · 요금 관련은 반드시 **박민하 선생님과 먼저 상의**해요.

---

## 일정

- 10/22 에셋 완성 · 저장소 준비
- 10/23 미연시 데모에 에셋 연결 · AI 서버 연결 · 발표 PDF
- 10/24~25 대회 (AI 서버가 안 되면 미리 쓴 대본으로 자동 전환)
