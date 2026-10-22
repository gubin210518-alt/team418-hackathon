# server/ — AI NPC 서버 (AI 1 담당 · 만들 예정)

할 일: [docs/roles/AI-1-server.md](../docs/roles/AI-1-server.md) · 규격: [docs/roles/contract.md](../docs/roles/contract.md)

켜는 법(완성 후): `node --env-file=.env server/index.js` → 브라우저에서 `http://localhost:8787`

브라우저(site) → **이 서버** → AI API 순서로 연결해요. API 키는 이 서버만 알고 있어요.

## 지킬 것

- 키는 저장소 맨 위 `.env` 의 `AI_API_KEY` 에서만 읽기. 코드에 직접 쓰지 않기
- AI 답은 아래 JSON 모양만 받기. 모양이 틀리거나 5초가 넘으면 미리 쓴 대본으로 전환
  ```json
  { "say": "NPC 대사", "trust": 2, "why": "점수 이유 한 줄" }
  ```
  - `trust` 는 -2 ~ 3 사이 정수만 허용
- 플레이어 입력은 80자까지, 최근 대화 6줄만 AI 에 보내기
- 이름 · 학번 · 연락처 같은 개인정보는 보내지 않기
- AI 서비스에 월 사용 한도 걸어 두기
