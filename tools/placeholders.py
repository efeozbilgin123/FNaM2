"""ASSETS.md'deki her img/*.png için, dosya yoksa koyu gri yer tutucu üretir."""
import re, sys, pathlib
from PIL import Image, ImageDraw
root = pathlib.Path(__file__).resolve().parent.parent
SIZES = [('img/office.png',(2000,848)),('img/door.png',(320,750)),('img/panel.png',(120,300)),
  ('img/sheet.png',(1280,720)),('img/corr/',(560,1000)),('img/itsme_photo.png',(560,1000)),
  ('img/vent/',(600,440)),('img/doorway/',(320,750)),('img/cam/',(640,360)),('img/scare/',(1280,720)),
  ('img/menu_face',(600,800)),('img/doc/paper.png',(900,1200)),('img/ending.png',(1280,720))]
def size(p):
    for pre,s in SIZES:
        if p.startswith(pre): return s
    sys.exit('boyut bilinmiyor: '+p)
md = (root/'ASSETS.md').read_text(encoding='utf8')
paths = sorted(set(re.findall(r'`(img/[^`]+\.png)`', md)))
made = 0
for p in paths:
    f = root/p
    if f.exists(): continue
    f.parent.mkdir(parents=True, exist_ok=True)
    w,h = size(p)
    im = Image.new('RGB',(w,h),(18,20,22)); d = ImageDraw.Draw(im)
    d.rectangle([0,0,w-1,h-1], outline=(40,44,48), width=2)
    d.text((10,10), 'YER TUTUCU '+p, fill=(70,76,80))
    im.save(f, optimize=True); made += 1
print(f'{made} yer tutucu üretildi, toplam {len(paths)} görsel')
