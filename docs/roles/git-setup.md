# 협업 시작하기 (GitHub · 내 AI) — 처음 하는 사람용

목표: **세 사람이 같은 저장소에 각자 AI 와 같이 글 · 코드를 올리는 것.**

## 0. 연님이 할 일 (한 번만)
- 저장소 → **Settings → Collaborators → Add people** → `backchun0911`(호진) · `happy-haseon`(하선) 추가
  - 초대한 아이디가 본인 계정이 맞는지 확인하기 (비공개 저장소라서)
- 두 사람에게 알리기: **GitHub 에서 초대 수락하세요** (메일 또는 https://github.com/gubin210518-alt/team418-hackathon/invitations)

## 1. 각자 할 일 (한 번만)
1. GitHub 가입 → **초대 수락** (본인 계정으로 로그인한 상태에서)
2. [GitHub Desktop](https://desktop.github.com) 설치 → GitHub 계정으로 로그인
3. `File → Clone repository → team418-hackathon` 선택 → 폴더 위치 정하기
   - 목록에 안 보이면: 초대 수락이 안 된 거예요 (1번 다시)
4. **내 AI 가 그 폴더를 열 수 있게** 하기
   - Claude Code 를 쓰면: 터미널에서 그 폴더로 이동해서 `claude` 실행 → 폴더 안의 `CLAUDE.md` 를 자동으로 읽어서 역할을 물어봐요
   - Claude 데스크톱 앱 / 다른 AI 를 쓰면: 그 앱의 "폴더 열기 · 폴더 연결" 기능으로 이 폴더를 연결하고, 첫 메시지로 **"CLAUDE.md 를 읽고 시작해 줘"**
   - 웹 채팅(폴더를 못 여는 경우)이면: 역할별 묶음 파일을 첨부하는 방법이 있어요 (연님에게 요청)

> ⚠️ AI 가 `git push` 로 직접 올리려면 그 컴퓨터에 GitHub 로그인(인증)이 돼 있어야 해요. 어려우면 **AI 는 파일만 고치고, 올리기(Commit → Push)는 GitHub Desktop 으로** 해도 돼요. 그게 제일 쉬워요.

## 2. 매번 일할 때
1. GitHub Desktop → **Fetch origin → Pull** (최신으로 받기)
2. 내 AI 와 내 역할 문서의 할 일을 하나 하기 (내 폴더만)
3. GitHub Desktop → 바뀐 파일 확인 (`.env` 가 보이면 **올리지 말고** 연님에게 말하기) → Summary 한 줄 → **Commit to main** → **Push origin**
4. 단톡에 "○○ 올렸어" 한 줄

## 3. 안 될 때
| 증상 | 이유 · 해결 |
|---|---|
| 저장소가 목록에 없음 / 404 | 초대 수락 전이거나 다른 계정으로 로그인함 |
| Push 가 거절됨 | 먼저 Pull 하기. 충돌이 나면 멋대로 고치지 말고 연님에게 |
| AI 가 파일을 못 읽음 | 폴더를 AI 에 연결했는지 확인 (1-4번) |
| AI 가 키를 달라고 함 | 주지 말기. 키는 호진(서버)만 `.env` 에 갖고 있어요 |
