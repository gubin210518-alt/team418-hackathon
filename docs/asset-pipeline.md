# 에셋 만드는 법

## 1. 그림 만들기 (Google Gemini 나노바나나)

1. 기준 그림: `assets/characters/neutral.png` (4명 단체, 초록 배경)
   - 원본: `assets/characters/source/higgsfield-original-2848.png` (Higgsfield Seedream 5.0 Lite 로 만든 첫 그림)
   - Gemini 에 올릴 때는 `assets/characters/source/reference_lineup.jpg` (가벼운 버전)
2. Gemini 에서 이미지 만들기 → 참고 이미지 올리기 → [prompts.md](prompts.md) 문장 붙여 넣기
3. **새 동작 / 표정마다 새 채팅에서** 시작하기 (이전 동작이 섞여 나온 적 있음)
4. 확인할 것
   - 얼굴 · 머리 · 옷 · 소품이 원본과 같은지
   - 4명이 같은 칸(왼쪽부터 박 쌤 · 민준 · 학부모 · 서연)에 있는지
   - 유명 캐릭터 · 로고 · 피규어가 섞이지 않았는지 (밤의 내 방에서 한 번 있었음)
5. `assets/characters/` 또는 `assets/backgrounds/` 에 영어 이름으로 저장 → [assets/README.md](../assets/README.md) 표에 추가

## 2. 웹용으로 자르기 · 배경 지우기

```bash
pip install pillow numpy scipy
python tools/scripts/cutout.py
```

- 결과: `site/img/c/{ssam|minjun|parent|friend}-{neutral|happy|sad|surprised|upset|call|talk|thanks}.webp` 32장, `site/img/bg/*.webp` 5장 (합계 약 2.6MB)
- 겪은 문제와 해결
  - 남색 교복이 반투명하게 비침 → 색 거리만 보지 않고 "초록이 얼마나 센지"와 "빨강 성분"도 같이 봄
  - 머리카락 초록 테두리 → 가장자리 1px 깎기 + 초록 섞인 색 되돌리기
  - 옆 사람 손이 딸려 옴 → 칸 안의 가장 큰 덩어리만 남김
  - Gemini ✦ 표시 → 허리 아래(그림 아래 20%)를 잘라서 캐릭터에는 안 보임. 배경에는 남아 있음 (지우지 않음)

## 3. 소개 영상 (0원)

`tools/intro-video/scene.html` 을 Playwright 로 1/30초씩 캡처 → ffmpeg 로 합침.
```bash
cd tools/intro-video
node cap.js            # f/0000.jpg ~ f/0449.jpg (15초 × 30fps)
ffmpeg -framerate 30 -i f/%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 26 -movflags +faststart intro.mp4
```

## 4. 사이트 배포

- 주소: https://team418.netlify.app (Netlify)
- `site/` 폴더가 그대로 사이트예요. 지금은 연님 Netlify 계정으로 배포해요.
