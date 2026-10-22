"""
캐릭터 4명 단체 그림(초록 배경)을 사람별로 자르고 배경을 지워서 웹용 webp 로 저장해요.

사용법 (저장소 맨 위 폴더에서):
    pip install pillow numpy scipy
    python tools/scripts/cutout.py

결과: site/img/c/{ssam|minjun|parent|friend}-{표정/동작}.webp
     site/img/bg/*.webp (배경 압축본)

원리
1. 맨 위 줄 색으로 초록 배경색을 알아내요.
2. 세 가지 기준 중 하나라도 "사람"이면 불투명으로 봐요.
   - 배경색과의 색 거리
   - 초록이 빨강·파랑보다 얼마나 센지 (남색 교복이 비쳐 보이던 문제를 이걸로 해결)
   - 빨강 성분 (배경은 빨강이 거의 0)
3. 가장자리를 1px 깎고, 초록이 섞인 색을 원래 색으로 되돌려요 (초록 테두리 제거).
4. 칸(왼쪽부터 박 쌤·민준·학부모·서연) 안의 가장 큰 덩어리만 남겨서 옆 사람 손이 안 딸려 오게 해요.
5. 그림 아래 20%는 잘라요 (Gemini 반짝이 표시가 있는 곳, 허리 아래).
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os

A = 'assets/'
SRC = {
    'neutral': 'characters/neutral.png', 'happy': 'characters/happy.png', 'sad': 'characters/sad.png',
    'surprised': 'characters/surprised.png', 'upset': 'characters/upset.png',
    'call': 'characters/pose-a-call.png', 'talk': 'characters/pose-b-talk.png', 'thanks': 'characters/pose-c-thanks.png',
}
NAMES = ['ssam', 'minjun', 'parent', 'friend']
CENTERS = [.15, .39, .62, .86]          # 각 사람 칸의 가운데 (그림 폭 비율)
BGS = {'office-morning': 'office-am', 'hallway': 'hall', 'office-afternoon': 'office-pm',
       'classroom-afternoon': 'class-pm', 'bedroom-night': 'night'}

os.makedirs('site/img/c', exist_ok=True)
os.makedirs('site/img/bg', exist_ok=True)

for ex, f in SRC.items():
    im = np.asarray(Image.open(A + f).convert('RGB')).astype(float)
    H, W, _ = im.shape
    im = im[:int(H * .80)]
    H2 = im.shape[0]
    bg = np.median(im[5:40].reshape(-1, 3), axis=0)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    d = np.sqrt(((im - bg) ** 2).sum(-1))
    s = g - np.maximum(r, b)
    sb = bg[1] - max(bg[0], bg[2])
    a = np.maximum.reduce([np.clip((d - 30) / 40, 0, 1),
                           np.clip((sb - 6 - s) / 10, 0, 1),
                           np.clip((r - bg[0] - 14) / 20, 0, 1)])
    a = ndimage.grey_erosion(a, size=(3, 3))
    a = ndimage.gaussian_filter(a, 0.6)
    am = np.maximum(a, 0.15)[..., None]
    fg = np.clip((im - (1 - am) * bg) / am, 0, 255)
    lim = np.maximum(fg[..., 0], fg[..., 2])
    fg[..., 1] = np.where(fg[..., 1] > lim + 8, lim + 8, fg[..., 1])
    lab, n = ndimage.label(a > 0.5)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    coms = ndimage.center_of_mass(a > 0.5, lab, range(1, n + 1))
    for nm, cx in zip(NAMES, CENTERS):
        band = [(k + 1, sz) for k, (sz, (yy, xx)) in enumerate(zip(sizes, coms)) if abs(xx / W - cx) < .11 and sz > 40]
        big = max(band, key=lambda t: t[1])[0]
        keep = ndimage.binary_dilation(np.isin(lab, [k for k, sz in band if sz > 800 or k == big]), iterations=3)
        al = a * keep
        ys, xs = np.where(al > 0.05)
        x0, x1, y0 = xs.min(), xs.max(), ys.min()
        c = Image.fromarray(np.dstack([fg, al * 255]).astype('uint8'), 'RGBA').crop(
            (max(0, x0 - 6), max(0, y0 - 6), min(W, x1 + 6), H2))
        h = 560
        c = c.resize((int(c.width * h / c.height), h), Image.LANCZOS)
        c.save(f'site/img/c/{nm}-{ex}.webp', quality=82, method=4)
    print(ex, 'done')

for f, o in BGS.items():
    Image.open(A + 'backgrounds/' + f + '.png').convert('RGB').resize((1280, 714), Image.LANCZOS) \
        .save(f'site/img/bg/{o}.webp', quality=78, method=4)
print('backgrounds done')
