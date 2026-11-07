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
    out.paste(Image.merge('RGB', (g, g, g)), (x0, y0), a)
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
        ('corr_pasta', 'corr', 'pasta_full', 262, 230, 110, 1.25),
        ('autopsy_pasta', 'autopsy', 'pasta_full', 212, 198, 150, 1.1),
        ('archive_avukat', 'archive', 'avukat', 468, 262, 170, 1.15),
        ('lift_avukat', 'lift', 'avukat', 410, 300, 200, 1.1),
        ('ventA_sahil', 'ventA', 'sahil', 318, 262, 95, 1.0),
        ('ventB_sahil', 'ventB', 'sahil', 330, 372, 250, .95),
    ]
    for out, bg, cut, x, y, h, l in jobs:
        cctv(place(B(bg), C(cut), x, y, h, l)).save(ROOT / f'img/cam/{out}.png'); print(f'img/cam/{out}.png')
    sx, foot, h = 420, 310, 230
    im = place(B('lift'), C('sultan'), sx, foot, h, 1.0)
    im = glow(im, sx, foot - h * .5, 120, 1.2)
    cctv(im).save(ROOT / 'img/cam/lift_sultan.png'); print('img/cam/lift_sultan.png')
