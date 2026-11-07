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
from PIL import Image, ImageFilter

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
FEATHER = 10     # kenar yumuşatma (px)


def fit(im):
    """Oranı farklıysa ortadan kırpıp 2000×848 yapar."""
    w, h = im.size
    target = W / H
    if abs(w / h - target) > 0.01:
        if w / h > target:
            nw = round(h * target); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = round(w / target); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return im.resize((W, H), Image.LANCZOS)


def mask_for(img, base, zone):
    a = np.asarray(img.filter(ImageFilter.GaussianBlur(2)), dtype=np.int16)
    b = np.asarray(base.filter(ImageFilter.GaussianBlur(2)), dtype=np.int16)
    # ortalama ton kaymasını düzelt (Gemini tüm resmi biraz aydınlatıp/karartabiliyor)
    x0, y0, x1, y1 = zone
    outside = np.ones((H, W), bool); outside[y0:y1, x0:x1] = False
    a = a - (a[outside].mean(0) - b[outside].mean(0)).astype(np.int16)
    d = np.abs(a - b).max(2)
    m = np.zeros((H, W), np.uint8); m[y0:y1, x0:x1] = (d[y0:y1, x0:x1] > THRESH) * 255
    mi = Image.fromarray(m)
    mi = mi.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(31))   # benekleri at, deliği kapat
    mi = mi.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))    # kenarı toparla
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
        img = fit(Image.open(src).convert('RGB'))
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
