"""Gemini'nin düzenlediği ofis versiyonlarını oyuna hazırlar.  Kullanım: python3 tools/variants.py

img/office_v_raw/<ad>.(png|jpg|webp)  ->  img/office_v/<ad>.webp + variants.json (sadece değişen bölge, kırpılmış)

Gemini bütün fotoğrafı hafifçe yeniden çizdiği için tüm görüntü birkaç ton farklıdır. Bu betik
orijinal office.png ile farkı ölçer, gerçekten değişen bölgeyi (karakter, ışık, kapı, zemine taşan
su/ışık) bulur ve geri kalanını saydam yapar. Böylece oyunda sadece değişen kısım görünür, ne kadar
taşarsa taşsın kesilmez; kenarlar yumuşak geçer.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW, OUT = ROOT / 'img/office_v_raw', ROOT / 'img/office_v'
W, H = 2000, 848
# Her bölgenin değişebileceği geniş alan (x0, y0, x1, y1). Bunun dışındaki farklar gürültü sayılır.
ZONES = {
    'door': (250, 0, 900, 848),
    'vent': (1400, 380, 2000, 848),
    'corr': (700, 40, 1300, 848),
}
THRESH = 34      # renk farkı eşiği (0-255)
# Ofiste sonradan eklenen sabit parçalar: versiyonlar bunları asla örtmez (ofisin kendi hali görünür).
KEEP = [
    (40, 205, 342, 506),     # duvardaki MIRIKVISION ekranı
    (582, 286, 672, 452),    # kapı paneli (girintide)
    (1756, 392, 1838, 500),  # havalandırma ışık düğmesi
]
FEATHER = 10     # kenar yumuşatma (px)


def _place(g, sx, sy, dx, dy, W_, H_):
    """g'yi (sx, sy) ölçekleyip (dx, dy) kaydırarak W_xH_ tuvale koyar."""
    G = g.resize((max(1, round(g.size[0] * sx)), max(1, round(g.size[1] * sy))), Image.LANCZOS)
    out = Image.new(g.mode, (W_, H_)); out.paste(G, (dx, dy)); return out


def fit(im, base=None):
    """2000x848'e getirir. Flow/Antigravity görüntüyü 16:9'a ESNETİP biraz kaydırabiliyor (yeniden çizmez):
    o durumda yatay+dikey ölçek ve kaymayı ofisle en iyi örtüşecek şekilde arar (kaba->ince)."""
    w, h = im.size
    if base is None or abs(w / h - W / H) < 0.01:   # oran doğruysa (21:9) düz ölçekle; esnetilmemiş
        return im.resize((W, H), Image.LANCZOS)
    g0 = im.resize((W, round(h * W / w)), Image.LANCZOS)
    def err(k, sx, sy, dx, dy, B, g):
        P = np.asarray(_place(g, sx, sy, round(dx / k), round(dy / k), B.shape[1], B.shape[0]), float)
        m = P > 0
        return np.abs(P - B)[m].mean() if m.mean() > .7 else 1e9
    # 1) hızlı kaba arama: satır ve sütun ortalama profilleri (1B) ile eksenleri ayrı ayrı hizala
    Bf = np.asarray(base.convert('L'), float); Gf = np.asarray(g0.convert('L'), float)
    def fit1d(pb, pg, scales, shifts):
        best1 = None
        for sc in scales:
            n = round(len(pg) * sc); q = np.interp(np.linspace(0, len(pg) - 1, n), np.arange(len(pg)), pg)
            for sh in shifts:
                lo, hi = max(0, sh), min(len(pb), sh + n)
                if hi - lo < len(pb) * .85: continue
                e = np.abs(pb[lo:hi] - q[lo - sh:hi - sh]).mean()
                if best1 is None or e < best1[0]: best1 = (e, sc, sh)
        return best1
    _, sy0, dy0 = fit1d(Bf.mean(1), Gf.mean(1), np.arange(.66, .90, .0025), range(-120, 121, 2))
    _, sx0, dx0 = fit1d(Bf.mean(0), Gf.mean(0), np.arange(.78, 1.22, .0025), range(-260, 261, 2))
    best = (1e9, sx0, sy0, dx0, dy0)
    _, sx0, sy0, dx0, dy0 = best
    k = 4; B = np.asarray(base.convert('L').resize((W // k, H // k)), float); g = g0.convert('L').resize((W // k, g0.size[1] // k))
    for sx in np.arange(sx0 - .02, sx0 + .021, .005):
        for sy in np.arange(sy0 - .01, sy0 + .011, .0025):
            for dx in range(dx0 - 16, dx0 + 17, 4):
                for dy in range(dy0 - 16, dy0 + 17, 4):
                    e = err(k, sx, sy, dx, dy, B, g)
                    if e < best[0]: best = (e, sx, sy, dx, dy)
    e, sx, sy, dx, dy = best
    print(f'  hizalandı: ölçek x{sx:.3f} y{sy:.3f}, kayma ({dx},{dy}) px, hata {e:.1f}')
    out = _place(g0, sx, sy, dx, dy, W, H)
    cov = _place(Image.new('L', g0.size, 255), sx, sy, dx, dy, W, H)   # görselin kapsadığı alan
    out.info['coverage'] = cov
    return out


def mask_for(img, base, zone):
    a = np.asarray(img.filter(ImageFilter.GaussianBlur(2)), dtype=np.int16)
    b = np.asarray(base.filter(ImageFilter.GaussianBlur(2)), dtype=np.int16)
    # ortalama ton kaymasını düzelt (Gemini tüm resmi biraz aydınlatıp/karartabiliyor)
    x0, y0, x1, y1 = zone
    outside = np.ones((H, W), bool); outside[y0:y1, x0:x1] = False
    a = a - (a[outside].mean(0) - b[outside].mean(0)).astype(np.int16)
    d = np.abs(a - b).max(2)
    m = np.zeros((H, W), np.uint8); m[y0:y1, x0:x1] = (d[y0:y1, x0:x1] > THRESH) * 255
    cov = img.info.get('coverage')
    if cov is not None: m = m * (np.asarray(cov.filter(ImageFilter.MinFilter(9))) > 0)   # kenardaki boş şerit sayılmaz
    mi = Image.fromarray(m.astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(31))   # benekleri at, deliği kapat
    mi = mi.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))    # kenarı toparla
    d = ImageDraw.Draw(mi)
    for box in KEEP: d.rectangle(box, fill=0)
    return mi.filter(ImageFilter.GaussianBlur(FEATHER)), float((np.asarray(mi) > 0).mean())


def main(names=None):
    # versiyonlar eski ofisten üretildi; karşılaştırma onunla yapılır (yeni ofiste düğmeler/ekran var)
    bp = RAW / '_base.png'
    base = Image.open(bp if bp.exists() else ROOT / 'img/office.png').convert('RGB')
    OUT.mkdir(exist_ok=True)
    for src in sorted(RAW.iterdir()):
        name = src.stem
        if name.startswith('_'): continue
        if names and name not in names: continue
        zone = next((z for k, z in ZONES.items() if name.startswith(k)), None)
        if not zone: print('bölge bilinmiyor, atlandı:', src.name); continue
        img = fit(Image.open(src).convert('RGB'), base)
        alpha, cover = mask_for(img, base, zone)
        out = img.convert('RGBA'); out.putalpha(alpha)
        out.save(OUT / f'{name}.png', optimize=True)
        print(f'img/office_v/{name}.png  değişen alan %{cover * 100:.1f}')


def pack():
    """img/office_v/*.png -> sadece görünen bölgeye kırpılmış WebP + variants.json (x, y, w, h).
    Tam boy saydam PNG'ler büyük ve ilk gösterimde takılıyordu; kırpılmış WebP onda biri boyutunda."""
    import json
    man = {}
    for f in sorted(OUT.glob('*.png')):
        im = Image.open(f).convert('RGBA'); box = im.split()[3].point(lambda v: 255 if v > 3 else 0).getbbox()
        if not box: continue
        im.crop(box).save(OUT / (f.stem + '.webp'), quality=86, method=6)
        man[f.stem] = [box[0], box[1], box[2] - box[0], box[3] - box[1]]
        f.unlink()
        print(f'img/office_v/{f.stem}.webp  {box}')
    old = json.loads((OUT / 'variants.json').read_text()) if (OUT / 'variants.json').exists() else {}
    old.update(man)
    (OUT / 'variants.json').write_text(json.dumps(old, indent=1) + '\n')


if __name__ == '__main__':
    main(sys.argv[1:] or None)
    pack()
