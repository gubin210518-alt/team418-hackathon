# AI 도구 정리

## NPC 대사 · 점수 AI

- 방식: **LLM API + 캐릭터 설정(시스템 프롬프트) + JSON 출력**
- 받을 모양 (서버가 검사해서, 틀리거나 5초 넘으면 미리 쓴 대본으로 전환)
  ```json
  { "say": "NPC 대사", "trust": 2, "why": "점수 이유 한 줄" }
  ```
  - `trust` 는 -2 ~ 3 정수만 허용
- 후보: Claude · Gemini · ChatGPT API 중 하나 — **아직 미정**
- 고르는 기준: 한국어 자연스러움, JSON 을 잘 지키는지, 응답 5초 이내, 무료 한도 / 요금, 학생 대상 안전성
- 지킬 것: 키는 서버(`server/`)에만, 입력 80자 제한, 최근 대화 6줄만 전송, 개인정보 보내지 않기, 월 사용 한도 걸기
- 다른 AI 의 API 키를 쓸 때는 **쓰기 전에 팀에 말하기**, 결제는 **선생님과 먼저 상의**

### 쓰지 않기로 한 것
| 후보 | 이유 |
|---|---|
| 제타(zeta, 스캐터랩 캐릭터 채팅 앱) | 공식 개발자 API 를 찾지 못함. 비공식 라이브러리는 계정 유출 · 정지 · 약관 위반 위험. 점수(JSON)를 못 받음 |
| "zeb" | 검색해도 해당 AI 를 찾지 못함 |
| 감정 분석 AI (점수만) | NPC 대사를 못 만듦. 점수용 보조로는 가능 |

참고: [제타 App Store](https://apps.apple.com/kr/app/%EC%A0%9C%ED%83%80-zeta-%EC%83%81%EC%83%81%EC%9D%B4-%ED%98%84%EC%8B%A4%EC%9D%B4-%EB%90%98%EB%8A%94-ai-%EC%B1%84%ED%8C%85/id1619030760) · [CIO 기사](https://www.cio.com/article/3517708/%EC%8A%A4%EC%BA%90%ED%84%B0%EB%9E%A9-ai-%EC%8A%A4%ED%86%A0%EB%A6%AC-%ED%94%8C%EB%9E%AB%ED%8F%BC-%EC%A0%9C%ED%83%80-%EC%B6%9C%EC%8B%9C.html)

---

## 그림 AI 비교

### Higgsfield (처음 사용)
- 무료 요금제, 크레딧 1.52 → 1크레딧 사용 → **남은 0.52**
- 모델별 (10/22 확인, 1장 기준)
  | 모델 | 크레딧 | 무료 요금제 |
  |---|---|---|
  | gpt_image_2_5 | 0.25 | ✗ "Basic 이상 필요" |
  | Seedream 5.0 Lite | 1 | ✓ (기본 표정 단체 그림을 이걸로 만듦) |
  | Nano Banana Pro | 2 | 확인 못 함 |
- 영상: seedance 2.0 mini 4초 = 2크레딧, seedance 2.5 8초 = 56크레딧 → 소개 영상은 코드로 직접 만들었어요 (0원)

### 무료 이미지 AI (기사 기준, 실제 한도는 바뀔 수 있음)
| 도구 | 무료 한도 | 가입 | 메모 |
|---|---|---|---|
| **Google Gemini 나노바나나** ✅ 사용 중 | 하루 약 20장 (Pro 는 약 2장) | 구글 계정 | 참고 이미지로 표정 · 자세만 바꾸기 잘 됨. 오른쪽 아래 ✦ AI 표시 |
| ChatGPT 이미지 | 24시간 약 2~3장 | ChatGPT 계정 | 같은 대화에서 수정 가능 |
| Microsoft Designer / Bing | 하루 빠른 생성 15회 | 개인 MS 계정 (학교 계정 X) | |
| Leonardo AI | 하루 150토큰 (약 25~50장) | | 캐릭터 일관성 기능 (무료 포함 여부 미확인) |
| Stable Diffusion (로컬) | 제한 없음 | 설치 필요 | 설정이 어려워 비추천 |

출처: [DataCamp](https://www.datacamp.com/ko/blog/best-free-ai-image-generators) · [braindetox](https://braindetox.kr/posts/free_ai_image_generation_tools_2026_comparison.html)

### SVG(코드 그림) vs AI 그림
| | SVG | AI |
|---|---|---|
| 비용 | 0원 | 크레딧 / 무료 한도 |
| 퀄리티 | 단순 일러스트 | 웹툰 수준 ✅ |
| 표정 바꾸기 | 코드로 즉시 | 표정마다 생성 (참고 이미지로 얼굴 유지) |
| 결론 | 탈락 | **채택** |

비교 페이지: [archive/svg-vs-higgsfield.html](archive/svg-vs-higgsfield.html) (내려받아 브라우저로 열기)

### 주의
- **계정 여러 개로 무료 크레딧 받기 X** — 약관 위반 · 계정 정지 위험
- **AI 생성 표시(✦)는 지우지 않기**, 발표 자료 · 사이트에 "AI 생성 이미지 (Higgsfield Seedream · Google Gemini)" 표기
- 유명 캐릭터 · 로고가 그림에 섞이면 다시 만들기 (저작권)
