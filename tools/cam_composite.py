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

if __name__ == '__main__':
    np.random.seed(5)
    pasta = Image.open(ROOT / 'img/ref/cut_pasta.png').convert('RGBA')
    bg = Image.open(ROOT / 'img/cam/corr.png')
    cctv(place(bg, pasta, cx=262, foot_y=228, height=104, light=1.25)).save(ROOT / 'img/cam/corr_pasta.png')
    bg = Image.open(ROOT / 'img/cam/autopsy.png')
    cctv(place(bg, pasta, cx=212, foot_y=196, height=150, light=1.15)).save(ROOT / 'img/cam/autopsy_pasta.png')
    print('img/cam/corr_pasta.png, img/cam/autopsy_pasta.png')
