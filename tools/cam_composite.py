"""Kamera görüntülerine karakter yerleştirir (CCTV görünümüyle).  Kullanım: python3 tools/cam_composite.py
Karakter kesiti (saydam PNG) gri tonlanır, sahnenin parlaklık/kontrastına uydurulur, gölge + gren + hafif bulanıklık eklenir."""
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps, ImageDraw, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent

def place(bg, cut, cx, foot_y, height, light=1.0, blur=0.6):
    bg = bg.convert('RGB'); W, H = bg.size
    c = cut.copy(); s = height / c.height
    c = c.resize((max(1, round(c.width * s)), round(height)), Image.LANCZOS)
    rgb, a = c.convert('RGB'), c.split()[3]
    g = ImageOps.grayscale(rgb)
    # sahnenin o bölgesinin ton dağılımına uydur
    x0, y0 = round(cx - c.width / 2), round(foot_y - c.height)
    reg = np.asarray(ImageOps.grayscale(bg).crop((max(0, x0), max(0, y0), min(W, x0 + c.width), min(H, y0 + c.height))), float)
    gv = np.asarray(g, float); m = np.asarray(a) > 128
    tgt_mean, tgt_std = reg.mean() * 1.25 * light, max(18, reg.std() * 1.1)
    gv = (gv - gv[m].mean()) / (gv[m].std() + 1e-6) * tgt_std + tgt_mean
    gv += np.random.normal(0, 7, gv.shape)
    g = Image.fromarray(np.clip(gv, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))
    # zemine temas gölgesi
    sh = Image.new('L', (W, H), 0); d = ImageDraw.Draw(sh)
    d.ellipse((cx - c.width * .45, foot_y - c.width * .09, cx + c.width * .45, foot_y + c.width * .09), fill=140)
    sh = sh.filter(ImageFilter.GaussianBlur(c.width * .08))
    out = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), bg, sh)
    a = a.filter(ImageFilter.GaussianBlur(.7))
    # sahnenin renk tonuna boya (yeşil gece görüşü vb.)
    rr = np.asarray(bg.crop((max(0, x0), max(0, y0), min(W, x0 + c.width), min(H, y0 + c.height))), float).reshape(-1, 3).mean(0)
    tint = rr / max(1.0, rr.mean())
    ga = np.asarray(g, float)[..., None] * tint
    out.paste(Image.fromarray(np.clip(ga, 0, 255).astype(np.uint8)), (x0, y0), a)
    return out

def cctv(im):
    """Arka planla aynı gren ve tarama çizgileri."""
    a = np.asarray(im, float); a += np.random.normal(0, 6, a.shape[:2])[..., None]
    a[::3] *= 0.9
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def glow(im, cx, cy, r, strength=1.0):
    """Far/lamba parlaması."""
    a = np.asarray(im, float); H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    g = np.clip(1 - np.hypot(xx - cx, yy - cy) / r, 0, 1) ** 2 * 255 * strength
    return Image.fromarray(np.clip(a + g[..., None], 0, 255).astype(np.uint8))

if __name__ == '__main__':
    np.random.seed(5)
    C = lambda n: Image.open(ROOT / f'img/ref/cut_{n}.png').convert('RGBA')
    B = lambda n: Image.open(ROOT / f'img/cam/{n}.png')
    jobs = [  # (çıktı, arka plan, kesit, merkez x, ayak/alt y, yükseklik, ışık)
        ('corr_pasta', 'corr', 'pasta_full', 345, 238, 112, 1.2),
        ('autopsy_pasta', 'autopsy', 'pasta_full', 436, 204, 148, 1.0),
        ('archive_avukat', 'archive', 'avukat', 322, 286, 165, 1.1),
        ('lift_avukat', 'lift', 'avukat', 402, 258, 150, 1.35),
        ('ventA_sahil', 'ventA', 'sahil', 318, 232, 100, 1.0),
        ('ventB_sahil', 'ventB', 'sahil', 322, 392, 225, .9),
        ('wash_sahil', 'wash', 'sahil', 418, 322, 118, .62),
    ]
    gem = lambda n: any((ROOT / 'img/cam_raw').glob(n + '.*'))   # Gemini görseli varsa o kullanılır (tools/cam_import.py)
    for out, bg, cut, x, y, h, l in jobs:
        if gem(out): continue
        cctv(place(B(bg), C(cut), x, y, h, l)).save(ROOT / f'img/cam/{out}.png'); print(f'img/cam/{out}.png')
    sx, foot, h = 402, 262, 175
    if gem('lift_sultan'): raise SystemExit
    im = place(B('lift'), C('sultan'), sx, foot, h, 1.0)
    im = glow(im, sx, foot - h * .55, 70, .45)
    cctv(im).save(ROOT / 'img/cam/lift_sultan.png'); print('img/cam/lift_sultan.png')
