"""Gemini'den gelen kamera görüntülerini oyuna alır: img/cam_raw/<ad>.png -> img/cam/<ad>.png (640x360, ortadan 16:9 kırpma).
Kullanım: python3 tools/cam_import.py [ad ...]   (ad verilmezse GEMINI_KAMERA.md'deki onu da denenir)"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
NAMES = ['corr_pasta', 'autopsy_pasta', 'archive_avukat', 'lift_avukat', 'lift_sultan', 'ventA_sahil', 'ventB_sahil', 'cold_hot', 'cold_open', 'wash_sahil']

for n in sys.argv[1:] or NAMES:
    src = next((p for p in (ROOT / 'img/cam_raw').glob(n + '.*') if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')), None)
    if not src: print('yok:', n); continue
    im = Image.open(src).convert('RGB'); w, h = im.size
    if w / h > 16 / 9: cw = round(h * 16 / 9); im = im.crop(((w - cw) // 2, 0, (w - cw) // 2 + cw, h))
    else: ch = round(w * 9 / 16); im = im.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch))
    im.resize((640, 360), Image.LANCZOS).save(ROOT / f'img/cam/{n}.png'); print('img/cam/' + n + '.png  <-', src.name)
