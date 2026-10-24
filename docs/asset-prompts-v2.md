# 에셋 프롬프트 v2 · 일과표 확장판

> 친구에게 이 파일 하나만 주면 돼요. 도구는 **Google Gemini 나노바나나(무료)**. 모든 그림은 "AI 생성 이미지"로 표기해요.
> 기존 그림 스타일은 [prompts.md](prompts.md) 와 같아요. 영어로 쓰는 게 결과가 안정적이에요.

## 공통 규칙

- **새 그림마다 새 채팅**에서 시작해요. (이전 그림이 섞이지 않게)
- **참고 이미지를 꼭 첨부**해요.
  - 새 배경 → `assets/backgrounds/office-morning.png` (그림체 참고용)
  - 새 캐릭터 → 먼저 아래 "캐릭터 기준 그림"부터 만들고, 마음에 드는 1장을 이후 모든 컷의 참고로 써요.
- 글자·로고·간판 글씨·실존 인물·유명 캐릭터는 넣지 않아요. (`No text, no logos`)
- 배경은 16:9. **화면 아래 20%는 대사창이 덮어요.** 중요한 건 위쪽에, 아래 가운데는 비워 두기.
- 캐릭터는 단색 초록 배경, 각자 칸 안에서 같은 크기로 서 있게 (한 명씩 잘라 쓰기 때문).
- 파일 이름은 표의 이름 그대로. 형식은 png 로 저장해서 연님에게 주면 webp 로 바꿔요.
- 유료 도구를 쓰게 되면 **쓰기 전에 연님에게 먼저 말해요.**

---

## A. 새 배경 (파일명 → 쓰는 곳)

모든 배경 프롬프트 맨 앞에 이 공통 문장을 붙여요.

```
Use the attached reference image only for art style (clean Korean webtoon background art, thin dark outlines, soft cel shading, flat pastel colors). Draw an empty background scene with no people, no text, no logos, 16:9. Keep the lower middle area uncluttered because characters will be placed there.
```

아래는 `Scene:` 뒷부분만 적어요. (공통 문장 + Scene)

| 파일명 | 쓰는 곳 | Scene |
|---|---|---|
| `computer-room.png` | 쌤 1·2교시, 학생 데이터과학 수행평가 | `Scene: a Korean high school computer lab in the morning, rows of desktop monitors on long desks, office chairs, a teacher's desk at the front with a projector screen (blank), bright fluorescent light, empty.` |
| `school-gate.png` | 학생 기상 후 등교 (8:30) | `Scene: the front gate of a Korean high school on a slightly rushed morning, school building behind a gate and a short path, blue morning sky, a few trees, empty with no students.` |
| `cafeteria.png` | 점심시간 (쌤 학부모 민원 / 학생 점심) | `Scene: a Korean high school cafeteria at lunchtime, long tables and benches, a serving counter with empty metal trays, warm light, empty.` |
| `cleaning-area.png` | 청소시간 (쌤 청소 감독) | `Scene: a Korean high school back hallway and stairwell in the afternoon with a broom, a mop bucket and a dustpan leaning on the wall, sunlight from a window, empty.` |
| `study-hall.png` | 야자 (16:40~) | `Scene: a Korean high school classroom in the early evening used for night self-study, desks in neat rows, lights on, windows showing a dusky sky, empty.` |
| `snack-shop.png` | 저녁 빨리먹기 | `Scene: a small Korean school-side snack shop and convenience counter in the evening, shelves of snacks and drinks (no readable brand names), warm light, empty.` |
| `academy.png` | 학원 (21:30) | `Scene: a Korean private tutoring academy classroom at night, a whiteboard (blank), small desks with chairs, cool white light and dark windows, empty.` |
| `teacher-home.png` | 쌤 집 (21:30 도착) | `Scene: a tired Korean teacher's small apartment living room at night, a desk with a laptop and stacks of papers, a warm desk lamp, a window with city lights, empty.` |

기존 배경(`office-morning`, `hallway`, `office-afternoon`, `classroom-afternoon`, `bedroom-night`)은 다시 만들지 않아요.

### 타이틀 · 엔딩 · 발표 표지

| 파일명 | 쓰는 곳 | Scene |
|---|---|---|
| `title.png` | 시작 화면 | `Scene: a Korean high school classroom seen from the doorway, a large blank green chalkboard in the center, a teacher's desk on the left and a student desk on the right, warm sunset light across the floor between them, symmetrical and calm.` |
| `end-good.png` | GOOD 엔딩 | `Scene: a Korean high school classroom after school, warm golden sunset light flooding through windows, two chairs facing each other near a window, soft sparkles of dust in the light, hopeful and warm.` |
| `end-normal.png` | NORMAL 엔딩 | `Scene: a Korean high school hallway by a window on a cloudy afternoon, soft gray-blue light, a few lockers, calm and neutral, a little lonely but not sad.` |
| `end-bad.png` | BAD 엔딩 | `Scene: an empty Korean high school hallway at dusk with rain streaking the windows, cold blue-gray tones, a single dim ceiling light, lonely and quiet.` |
| `pitch-cover.png` | 발표 슬라이드 표지 | 아래 별도 프롬프트 |

발표 표지만 공통 문장 대신 이걸 써요. (아래 가운데도 비우지 않아도 돼요. 대신 **글자는 넣지 않아요**, 제목은 슬라이드에서 올려요.)

```
Use the attached reference image only for art style (clean Korean webtoon background art, thin dark outlines, soft cel shading, flat pastel colors). 16:9, no text, no logos. Split composition: the left half shows a Korean high school teachers' office in warm orange light with a desk and papers, the right half shows a Korean high school student's bedroom in cool blue night light with a desk and lamp, the two halves meeting in the middle at a soft diagonal line, no people.
```

---

## B. 새 캐릭터 (교감 선생님 · 반장)

> 외모는 제가 임의로 정했어요. 바꾸고 싶으면 문장 안 단어만 바꾸면 돼요. (반장을 남학생으로 바꾸려면 `girl` → `boy`, `ribbon` → `tie`)

### B-0. 기준 그림 (먼저 이것부터)

참고 이미지로 `assets/characters/source/reference_lineup.jpg` 를 첨부해요.

```
Use the attached reference image only for art style and image format (clean Korean webtoon, thin dark outlines, soft cel shading, flat pastel colors, plain solid dark green background, 16:9, characters standing in their own columns at the same size, upper body to knees, facing viewer). Draw two NEW characters, not the ones in the reference. From left: (1) Korean male vice principal late 50s, gray-streaked black hair combed back, round face, dark gray suit with a dark red tie, hands clasped in front, stern and dignified but with tired eyes. (2) Korean high school class president girl 17, neat black bob haircut with a hairpin, navy blazer uniform with ribbon and a small plain badge, holding a clipboard against her chest, serious and responsible. No text, no logos.
```

→ 마음에 드는 1장을 `vp-prez-neutral.png` 로 저장하고, 아래 컷은 전부 **그 그림을 참고로 첨부**해서 만들어요.

### B-1. 공통 틀

각 컷마다 아래 틀 뒤에 `Change only: …` 를 바꿔 끼워요. (새 채팅 + 기준 그림 첨부)

```
Use the attached image as the character and style reference. Keep exactly the same art style, the same two characters (vice principal on the left, class president on the right: same faces, hairstyles, outfits, props), the same plain green background, the same 16:9 image size and the same two columns. Each character stays inside their own column at the same size so they can be cropped one by one. No text, no watermark. 
```

| 파일명 | 쓰는 곳 | 뒤에 붙일 문장 |
|---|---|---|
| `vp-prez-happy.png` | 신뢰 ▲ | `Change only the facial expressions: both smile warmly, eyes curved happily, the vice principal's stern face softens.` |
| `vp-prez-sad.png` | 신뢰 ▼ | `Change only the facial expressions: both look sad and hurt, eyebrows raised in the middle, eyes looking down, small frown.` |
| `vp-prez-surprised.png` | 예상 못 한 말 | `Change only the facial expressions: both are surprised and a little flustered, wide eyes, small open mouth, one small sweat drop each.` |
| `vp-prez-upset.png` | 신뢰 낮음 | `Change only the facial expressions: both are upset and annoyed, eyebrows lowered, lips pressed together, eyes looking slightly to the side, no tears.` |
| `vp-prez-call.png` | 교감 출근 전화 / 반장 메시지 확인 | `Change only the poses: (1) the vice principal holds a smartphone to his ear with one hand, the other hand on his hip, speaking urgently and sternly; (2) the class president looks down at a smartphone held in both hands, concerned. Neutral expressions otherwise.` |
| `vp-prez-talk.png` | 지시·설명 장면 | `Change only the poses: (1) the vice principal raises one finger as if giving an instruction, serious; (2) the class president holds the clipboard out toward the viewer with both hands, nervous. Neutral expressions otherwise.` |
| `vp-prez-thanks.png` | 마무리·엔딩 | `Change only the poses: (1) the vice principal gives a small nod with a faint relieved smile, one hand at his chest; (2) the class president waves one hand cheerfully, smiling.` |

(neutral 은 B-0 의 기준 그림이 곧 neutral 이에요. → 총 8컷)

### B-2. 9반 지각생 무리 (1컷)

기존 캐릭터와 겹치지 않게 얼굴은 흐릿한 단순한 그림체로 둬요.

```
Use the attached reference image only for art style and image format (clean Korean webtoon, thin dark outlines, soft cel shading, flat pastel colors, plain solid dark green background, 16:9, upper body to knees). Draw a group of three Korean high school students in navy blazer uniforms, hurrying and out of breath, one carrying a bag over his shoulder, one holding his side, one checking a wrist watch, expressions panicked and apologetic. They are different from the reference characters. Keep them in a loose group in the center with space on both sides. No text, no logos, no watermark.
```

→ `group9.png`

---

## C. 아이콘 (미니게임 · 선택)

> 없어도 코드로 대체할 수 있어요. 시간이 남을 때만 만들어요. 배경은 모두 단색 초록, 아이콘 하나가 칸 안에서 같은 크기.

### C-1. 저녁 메뉴 아이콘 (빨리먹기)

```
Use the attached reference image only for art style (clean Korean webtoon, thin dark outlines, soft cel shading, flat pastel colors). Draw a 3 by 2 grid of six food icons on a plain solid dark green background, 16:9, each icon the same size inside its own cell: kimbap rolls on a plate, ramen in a bowl with steam, pork cutlet with sauce, tteokbokki in a paper cup, a sandwich, a triangle rice ball. No text, no logos, no brand names.
```

→ `food-icons.png`

### C-2. 학습지 · 연습장 아이콘

```
Use the attached reference image only for art style (clean Korean webtoon, thin dark outlines, soft cel shading, flat pastel colors). On a plain solid dark green background, 16:9, draw two icons side by side with space between them: (1) a stack of worksheets with a paperclip (blank lines only, no readable text); (2) an open spiral notebook with faint grid lines and a pencil. No text, no logos.
```

→ `worksheet-notebook-icons.png`

---

## D. 배경음악 (Suno 같은 음악 AI)

> ⚠️ **약관을 먼저 확인하세요.** 무료 요금제로 만든 곡을 대회·발표에 써도 되는지는 제가 정확히 몰라요. 결제가 필요하면 선생님과 먼저 상의해요.
> 모두 **instrumental(가사 없음)**, 1~2분, 끝이 자연스럽게 반복되는 곡. 특정 가수·곡 이름은 쓰지 않아요.

| 파일명 | 쓰는 곳 | 프롬프트 |
|---|---|---|
| `bgm-title.mp3` | 타이틀 | `instrumental, warm gentle piano and soft strings, slow tempo 80 BPM, nostalgic school-day feeling, hopeful, loopable` |
| `bgm-ssam.mp3` | 쌤 루트 | `instrumental, light lo-fi beat with muted guitar and soft keys, tired but kind mood, tempo 90 BPM, a busy workday, loopable` |
| `bgm-student.mp3` | 학생 루트 | `instrumental, upbeat light pop with plucked synth and soft drums, youthful and a bit rushed, tempo 100 BPM, loopable` |
| `bgm-rhythm.mp3` | 리듬게임 (발표 수행평가) | `instrumental, clear steady beat, exactly 110 BPM, 4/4 time, bright electronic pop with a strong snare on the 2nd and 4th beat, no tempo changes, no long breaks, loopable` |
| `bgm-night.mp3` | 밤 · 학원 | `instrumental, calm night piano and soft pad, slow tempo 70 BPM, quiet and introspective, loopable` |
| `bgm-end-good.mp3` | GOOD 엔딩 | `instrumental, warm piano and strings swelling gently, hopeful and relieved, 85 BPM, with a soft ending` |
| `bgm-end-bad.mp3` | BAD 엔딩 | `instrumental, sparse minor piano with light rain ambience, lonely and quiet, 65 BPM, with a soft fade ending` |

**리듬게임 곡은 BPM 이 일정해야 해요.** 만든 뒤 박자가 흔들리면 다시 뽑아 달라고 하세요. (박자가 흔들리면 타일과 안 맞아요)

---

## 체크리스트 (친구용)

- [ ] 배경 8장 (A 표)
- [ ] 타이틀 · 엔딩 3장 · 발표 표지 (A 아래 표)
- [ ] 교감 + 반장 기준 그림 → 8컷
- [ ] 9반 무리 1컷
- [ ] (선택) 아이콘 2장
- [ ] (선택) BGM 7곡

## 아직 정해지지 않은 것 (연님이 정하면 이 파일을 고쳐요)

- 반장의 성별 (지금은 여학생으로 가정)
- 반장·교감이 실제 게임에서 몇 장면에 나오는지 (적으면 컷 수를 줄일 수 있어요)
- 대회에서 미리 만든 에셋 사용이 허용되는지 (안내문 확인 필요)
