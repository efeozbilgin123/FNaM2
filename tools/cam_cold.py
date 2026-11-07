"""Soğuk oda kamerasının durumları: cold (kapalı), cold_hot (5 aralık, içeriden parmaklar), cold_open (5 açık, Denek 5 oturuyor).
Kaynak: img/cam_src/cold.png.  Kullanım: python3 tools/cam_cold.py  (sonra tools/cam_composite.py)
Koordinatlar 1280x720 çalışma boyutunda; çıktı 640x360."""
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
W, H = 1280, 720
# 5 numaralı çekmece kapağı (menteşe sağda, mandal solda)
TL, TR, BR, BL = (578, 236), (728, 238), (728, 372), (580, 372)

def base():
    im = Image.open(ROOT / 'img/cam_src/cold.png').convert('RGB'); w, h = im.size
    cw = round(h * 16 / 9); x = (w - cw) // 2
    return im.crop((x, 0, x + cw, h)).resize((W, H), Image.LANCZOS)

def coeffs(dst, src):
    """PIL PERSPECTIVE katsayıları: çıktıdaki dst dörtgeni girdideki src dörtgenine eşlenir."""
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; b += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()

def warp(img, src_quad, dst_quad):
    out = img.transform((W, H), Image.PERSPECTIVE, coeffs(dst_quad, src_quad), Image.BICUBIC)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(dst_quad, fill=255)
    return out, m.filter(ImageFilter.GaussianBlur(.8))

def fog(im, cx, cy, rx, ry, k):
    a = np.asarray(im, float); yy, xx = np.mgrid[0:H, 0:W]
    g = np.clip(1 - ((xx - cx) / rx) ** 2 - ((yy - cy) / ry) ** 2, 0, 1) ** 1.5 * k
    return Image.fromarray(np.clip(a + g[..., None] * np.array([150, 175, 165]), 0, 255).astype(np.uint8))

def grain(im, s=5):
    a = np.asarray(im, float) + np.random.normal(0, s, (H, W))[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def save(im, name):
    im.resize((640, 360), Image.LANCZOS).save(ROOT / f'img/cam/{name}.png'); print(f'img/cam/{name}.png')

def hot(src):
    im = src.copy()
    # kapak mandal tarafından ~20px dışarı çıkmış: sol kenarda karanlık aralık, kapak hafif sağa/öne
    door = src.crop((TL[0], TL[1], BR[0], BR[1]))
    gap = [(TL[0] - 2, TL[1] - 2), (TL[0] + 20, TL[1] - 6), (BL[0] + 20, BL[1] + 4), (BL[0] - 2, BL[1] + 2)]
    ImageDraw.Draw(im).polygon(gap, fill=(6, 8, 7))
    d, m = warp(door, [(0, 0), (door.width, 0), (door.width, door.height), (0, door.height)],
                [(TL[0] + 18, TL[1] - 8), (TR[0] + 2, TR[1] - 1), (BR[0] + 2, BR[1] + 1), (BL[0] + 18, BL[1] + 6)])
    im.paste(d, (0, 0), m)
    # aralıktan kapağın kenarını kavrayan solgun parmak uçları (kapağın önüne kıvrılmış)
    fl = Image.new('L', (W, H), 0); fd = ImageDraw.Draw(fl)
    ex = TL[0] + 18                                                   # kapağın yeni sol kenarı
    for y, ln, t in [(281, 15, 8), (293, 17, 8), (305, 16, 8), (317, 12, 7)]:
        fd.rounded_rectangle((ex - 6, y, ex + ln, y + t), t // 2, fill=235)
    fd.polygon([(ex - 16, 276), (ex - 2, 279), (ex - 2, 326), (ex - 16, 334)], fill=150)   # aralıktaki el sırtı
    fl = fl.filter(ImageFilter.GaussianBlur(1.4))
    a = np.asarray(im, float); f = np.asarray(fl, float)[..., None] / 255
    xx = np.arange(W)[None, :, None]; tone = np.clip(1 - (xx - ex) / 40, .55, 1)   # uçlara doğru kararır
    skin = np.array([178, 190, 182])[None, None] * tone
    im = Image.fromarray(np.clip(a * (1 - f) + skin * f, 0, 255).astype(np.uint8))
    dr = ImageDraw.Draw(im)
    for y in (290, 302, 314): dr.line((ex - 4, y, ex + 12, y), fill=(52, 58, 55), width=1)   # parmak araları
    im = fog(im, 600, 360, 110, 70, .35)
    save(grain(im), 'cold_hot')

def opened(src):
    im = src.copy(); dr = ImageDraw.Draw(im)
    door = src.crop((TL[0], TL[1], BR[0], BR[1]))
    # çekmecenin içi: derin karanlık, içe doğru küçülen çerçeve
    dr.polygon([TL, TR, BR, BL], fill=(4, 5, 5))
    inner = [(TL[0] + 22, TL[1] + 18), (TR[0] - 22, TR[1] + 18), (BR[0] - 22, BR[1] - 16), (BL[0] + 22, BL[1] - 16)]
    for a, b in zip([TL, TR, BR, BL], inner): dr.line((a, b), fill=(22, 26, 24), width=2)
    dr.polygon(inner, outline=(18, 22, 20))
    # menteşeden ~75° açılmış kapak (sağda, ince ve perspektifli)
    d, m = warp(door, [(0, 0), (door.width, 0), (door.width, door.height), (0, door.height)],
                [(TR[0], TR[1]), (TR[0] + 46, TR[1] - 26), (BR[0] + 46, BR[1] + 26), (BR[0], BR[1])])
    d = Image.fromarray((np.asarray(d, float) * .8).astype(np.uint8))
    im.paste(d, (0, 0), m)
    # dışarı kaymış tepsi
    tray = [(TL[0] - 4, BL[1] - 10), (TR[0] + 4, BR[1] - 10), (TR[0] + 30, BR[1] + 40), (TL[0] - 30, BL[1] + 40)]
    dr.polygon(tray, fill=(92, 102, 97)); dr.line([tray[3], tray[2]], fill=(170, 184, 176), width=3)
    dr.polygon([tray[3], tray[2], (tray[2][0], tray[2][1] + 10), (tray[3][0], tray[3][1] + 10)], fill=(70, 78, 74))
    # Denek 5: tepside oturmuş, gözleri simsiyah
    c = Image.open(ROOT / 'img/ref/cut_hasan.png').convert('RGBA')
    ed = ImageDraw.Draw(c)
    for x, y in [(170, 175), (266, 175)]: ed.ellipse((x - 17, y - 9, x + 17, y + 10), fill=(0, 0, 0, 255))
    for x, y in [(170, 175), (266, 175)]: ed.line((x - 6, y + 10, x - 9, y + 40), fill=(20, 0, 0, 255), width=5)  # kan izi
    h = 128; c = c.resize((round(c.width * h / c.height), h), Image.LANCZOS)
    g = ImageOps.grayscale(c.convert('RGB'))
    gv = np.asarray(g, float); gv = (gv - gv.mean()) * 1.05 + 92; gv *= np.linspace(.45, 1.05, gv.shape[0])[:, None]; gv += np.random.normal(0, 6, gv.shape); g = Image.fromarray(np.clip(gv, 0, 255).astype(np.uint8))
    cx, foot = (TL[0] + TR[0]) // 2, BL[1] + 14
    a = c.split()[3]
    # alttan tepsiyle kesilsin (beli tepsinin içinde)
    am = np.asarray(a).copy(); am[-12:] = (am[-12:] * np.linspace(1, 0, 12)[:, None]).astype(np.uint8); a = Image.fromarray(am)
    im.paste(Image.merge('RGB', (g, g, g)), (cx - c.width // 2, foot - h), a.filter(ImageFilter.GaussianBlur(1.0)))
    im = im.filter(ImageFilter.GaussianBlur(.4))
    im = fog(im, 650, 420, 160, 60, .4)
    save(grain(im), 'cold_open')

if __name__ == '__main__':
    np.random.seed(7)
    src = base()
    save(src, 'cold'); hot(src); opened(src)
