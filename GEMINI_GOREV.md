# GÖREV: "Mırık'la 5 Gece: MORG" oyununun tüm görsellerini üret ve repoya yükle

Sen bu repoda (`efeozbilgin123/FNaM2`) çalışan bir yapay zekâ ajansın. Görevin aşağıdaki **44 görselin** hepsini üretmek, her birini tam olarak belirtilen yola ve boyuta kaydetmek, kontrol etmek ve GitHub'a push etmek. Oyunun kodu başka biri tarafından yazılıyor. Sen **yalnızca `img/` klasörüne** dokunacaksın.

---

## 0. Kurallar (hepsine uy)

1. **Sadece `img/` altındaki PNG'leri değiştir.**
   - Başka hiçbir dosyayı değiştirme, silme veya ekleme: `*.js`, `*.html`, `*.md`, `tests/`, `tools/`, `docs/`.
   - Tek istisna: işin bitince yazacağın `img/URETIM_RAPORU.md`.
2. **Dosyalar zaten var.** Şu an hepsi koyu gri yer tutucu görseller. Her birinin **üzerine yaz**, aynı adı ve aynı klasörü kullan.
3. **Boyut birebir tutmalı.**
   - Ürettiğin görseli, tablodaki piksel boyutuna kırparak ölçekle. Oranı bozma, ortadan kırp. Komut aşağıda (Bölüm 2).
   - Format PNG, RGB.
4. **Görsellerde hiçbir okunabilir yazı, logo, filigran ya da imza olmasın.**
   - İstisnalar: promptta açıkça istenen kazınmış "PASTAYMIŞ" yazısı ve "3-4-5" damgası. Bunlar da okunaksız olursa sorun değil.
5. **Stil tutarlılığı:**
   - Hepsi gerçekçi, çok karanlık bir korku oyunu görseli.
   - Soğuk floresan ve yeşil-mavi tonlar, film greni.
   - Mizah yok, tamamen korkunç.
6. **Karakterler gerçek kişilere dayanıyor.** Referans fotoğrafı verilen her görselde, o fotoğraftaki kişinin **yüzü tanınabilir kalmalı**. Referansı mutlaka görsel girdisi olarak modele ver.
7. Bir görsel kötü çıkarsa (yüz benzemiyor, yazı var, yanlış kompozisyon) **yeniden üret**. Her görsel için en fazla 3 deneme yap, en iyisini seç.
8. **Commit ve push:**
   - Her 10 görselde bir commit at, sonunda push et.
   - Commit mesajı: `Görseller: <bölüm adı>`.
   - Commit'e yapay zekâ co-author satırı **ekleme**.

---

## 1. Hazırlık

```bash
git clone https://github.com/efeozbilgin123/FNaM2.git
cd FNaM2
# Referans fotoğraflar 1. oyunun reposunda:
git clone --depth 1 https://github.com/efeozbilgin123/fnam.git ../fnam
pip install pillow
```

### Referans fotoğraflar
Yollar `../fnam/` içinde:

| Kod | Dosya | Kim |
|---|---|---|
| **REF-HASAN** | `../fnam/img/gece.png` | Hasan Emre Mırık'ın kendisi (normal hali) |
| **REF-HASAN-KORKU** | `../fnam/img/gece_scary.png` | Hasan Emre'nin 1. oyundaki korkunç hali (stil örneği) |
| **REF-PASTA** | `../fnam/img/pasta.png` | Pasta Mırık (bej Jeep tişörtlü) |
| **REF-AVUKAT** | `../fnam/img/avukat.png` | Avukat Mırık (siyah takım, kırmızı kravat) |
| **REF-SAHIL** | `../fnam/img/sahil.png` | Sahil Mırık (gri mont) |
| **REF-SULTAN** | `../fnam/img/sultan.png` | Sultan Mırık Han (sarık, kürk, beyaz motor) |
| **REF-ARDA** | `../fnam/img/lol.png` | Arda Baz (kırmızı tişört, dağınık saç) |

1. oyunun jumpscare görselleri `../fnam/img/scare/*.png` stil örneği olarak kullanılabilir: aynı kişi, simsiyah gözler, gözlerden akan kan, solgun gri ten.

---

## 2. Boyutlandırma komutu

Her görseli kaydettikten sonra şu komutu çalıştır:

```bash
python3 - <<'PY'
import sys
from PIL import Image, ImageOps
src, dst, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src).convert('RGB')
ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, 0.5)).save(dst, optimize=True)
print(dst, Image.open(dst).size)
PY
```

Kullanım: `python3 resize.py uretilen.png img/corr/lit.png 560 1000`. İstersen bu kodu `/tmp/resize.py` olarak kaydet, repoya koyma.

---

## 3. Ortak stil ekleri

Promptlarda geçen kısaltmalar:

- **[STİL]** = `Realistic horror video game, very dark, cold fluorescent and green-blue tones, film grain, no text, no watermark, no logo.`
- **[CCTV]** = `Grainy low-resolution 1990s black and white CCTV security camera footage, high corner angle, slight fisheye distortion, very dark, scan lines, no timestamp, no text, no watermark.`
- **[KORKU-YÜZ]** = `Keep his face clearly recognizable as the person in the reference photo, but with pale grey cracked skin, completely black glossy eyes with no whites, and thin streams of dark blood running from the eyes.`

Promptu modele verirken kısaltmanın yerine metnin tamamını yapıştır.

---

## 4. Görevler

### A. Ofis (4 görsel)

**A1 — `img/office.png` — 2000×848 — referans yok**
Oyunun ana görüntüsü, oyuncu bu odada oturuyor. Kapı, koridor görüntüsü, havalandırma içi ve monitör ekranı kodla üstüne bindirilecek. O yüzden bu üç açıklık **zifiri karanlık ve boş**, monitör **kapalı** olmalı. Yerleri kesin:
- **Sol kapı boşluğu:** Soldan yaklaşık %3–%19 arası, tam boy.
- **Orta koridor açıklığı:** Yatayda %43–%57 arası, masanın arkasında.
- **Sağ havalandırma ağzı:** %82–%97 arası, alt yarıda, yerin hemen üstünde.
```
First-person view from an office chair inside a cramped morgue night-watch room in the basement of an old medical faculty at 3am, ultra-wide 21:9 panoramic horror video game background, symmetrical composition. On the far left wall: a tall empty pitch-black doorway with a heavy stainless steel frame and no door, with a bare tiled wall section right next to it at chest height. In the exact center, behind the desk: a tall open archway leading into a long hospital corridor that is completely pitch black inside. On the far right wall, low near the floor: a large rectangular metal ventilation duct opening with its grille removed, pitch black inside. In the foreground: a worn steel desk with an old beige 1990s CRT computer monitor whose screen is dark and turned off, a beige landline telephone with a small red light, a clipboard, a coffee mug, a box of latex gloves, a thick anatomy textbook. White cracked ceramic wall tiles, a steel autopsy sink, a stretcher in a corner with a white sheet covering a body, an anatomy skeleton wall chart, one flickering fluorescent tube on the ceiling. No people. [STİL]
```

**A2 — `img/door.png` — 320×750 — referans yok**
```
A heavy old stainless steel morgue cold-room door that slides down from the ceiling, seen perfectly straight-on as a flat texture filling the entire image edge to edge. Brushed steel with dents, rust streaks, dried dark stains, a small frosted porthole window near the top, a black rubber seal along the bottom, a faded biohazard sticker. Lit by cold fluorescent light from above. No frame, no wall, no background. Tall vertical image. [STİL]
```

**A3 — `img/panel.png` — 120×300 — referans yok**
```
An old wall-mounted hospital control box seen perfectly straight-on, filling the entire image edge to edge: a worn white-grey painted metal plate with a screw in each corner, holding two large round push buttons stacked vertically, the top one red and the bottom one off-white, each in a scratched chrome ring, both unlit. Rust spots, grime, a strip of yellowed tape. Cold dim light. No background. Tall narrow vertical image. [STİL]
```

**A4 — `img/sheet.png` — 1280×720 — referans yok**
Oyuncu ölü taklidi yapınca ekranı kaplayan görüntü.
```
View from underneath a thin white hospital morgue sheet pulled over the face: the cloth is very close to the camera and fills the entire frame, faint cold light from a ceiling fluorescent tube glowing through the fabric weave, soft wrinkles and folds, a faint yellowed stain, and through the fabric the blurry dark silhouette of a tall figure standing very close. 16:9. [STİL]
```

### B. Koridor (7 görsel)
Hepsi **aynı kamera açısından**: ofisin içinden, kapı açıklığından koridorun derinine bakış. Fener ışığı tam ortada yuvarlak bir halka. Dikey 9:16.

**B1 — `img/corr/empty.png` — 560×1000 — referans yok**
```
A long narrow abandoned hospital basement corridor seen straight down its length from a doorway, almost completely pitch black, only the faintest outlines of wall tiles and a gurney visible. No people. Tall vertical 9:16. [STİL]
```

**B2 — `img/corr/lit.png` — 560×1000 — referans yok**
```
The same long narrow abandoned hospital basement corridor seen straight down its length from a doorway, now lit only by a single circular flashlight beam in the center, everything outside the beam pitch black. Cracked white tiles, a gurney pushed against the left wall, a fallen IV stand, puddles on the floor reflecting the light, the corridor fading into darkness at the far end. Empty, no people. Tall vertical 9:16. [STİL]
```

**B3 — `img/corr/pasta1.png` — 560×1000 — REF-PASTA**
```
Using the person in the reference photo: the same long abandoned hospital basement corridor lit by a single circular flashlight beam. He stands far away at the very end of the corridor, small in the frame, perfectly still, facing the camera, wearing the same beige t-shirt, holding a slice of green pistachio cake. [KORKU-YÜZ] Tall vertical 9:16. [STİL]
```

**B4 — `img/corr/pasta2.png` — 560×1000 — REF-PASTA**
```
Using the person in the reference photo: the same hospital basement corridor lit by a flashlight beam. He stands in the middle of the corridor, halfway to the camera, head tilted unnaturally, holding a rotten slice of green pistachio cake dripping onto the tiles, the word PASTAYMIŞ crudely scratched into the wall tiles behind him. [KORKU-YÜZ] Tall vertical 9:16. [STİL]
```

**B5 — `img/corr/pasta3.png` — 560×1000 — REF-PASTA**
```
Using the person in the reference photo: in the same hospital corridor lit by a harsh flashlight beam, he is right in front of the camera, his face and upper body filling most of the frame, mouth slightly open, holding a rotten dripping green pistachio cake slice up toward the lens. [KORKU-YÜZ] Tall vertical 9:16. [STİL]
```

**B6 — `img/corr/sultan.png` — 560×1000 — REF-SULTAN**
```
Using the person in the reference photo: a terrifying undead Ottoman sultan in his jeweled turban, fur cloak and red velvet robe, riding the white motorcycle down a long dark hospital basement corridor straight toward the camera, one blinding headlight glaring into the lens, his face barely visible behind the light with completely black eyes and a wide unnatural grin. Tall vertical 9:16. [STİL]
```

**B7 — `img/itsme_photo.png` — 560×1000 — REF-HASAN**
```
Using the person in the reference photo: he stands perfectly still at the end of a dark hospital corridor lit by a flashlight beam, in the same clothes as the photo, but he looks like a faded 1998 photograph projected onto the darkness, his face completely blank and expressionless, hollow black eye sockets, staring directly at the viewer. No blood. Very unsettling and quiet. Tall vertical 9:16. [STİL]
```

### C. Havalandırma ve sol kapı (4 görsel)

**C1 — `img/vent/empty.png` — 600×440 — referans yok**
```
Looking into a dark square galvanized metal ventilation duct from its opening, lit by a small harsh light, dusty dented steel walls, a trickle of dark water along the floor, the duct continuing into total blackness. Empty. 4:3. [STİL]
```

**C2 — `img/vent/sahil.png` — 600×440 — REF-SAHIL**
```
Using the person in the reference photo: he is crawling on his stomach inside a dark square metal ventilation duct right at its opening, face toward the camera, soaking wet hair dripping seawater, the same grey coat soaked through, his head twisted at an unnatural angle, seaweed and wet sand on the duct floor, lit by a small harsh light. [KORKU-YÜZ] 4:3. [STİL]
```

**C3 — `img/doorway/empty.png` — 320×750 — referans yok**
```
A tall dark doorway seen straight-on from inside a room, lit by a single harsh lamp from above, showing the empty cold hospital hallway right outside: white tiles, a floor drain, a wet floor sign lying on its side. Empty. Tall vertical. [STİL]
```

**C4 — `img/doorway/avukat.png` — 320×750 — REF-AVUKAT**
```
Using the person in the reference photo: he stands right in a tall dark doorway, lit harshly from above, in the same black suit and white shirt, his red tie pulled tight like a noose, a wide unnatural grin, holding a thick legal folder against his chest, leaning slightly into the room. [KORKU-YÜZ] Tall vertical. [STİL]
```

### D. Güvenlik kameraları (16 görsel, hepsi 640×360, 16:9)
Hepsinin sonuna **[CCTV]** ekle. Karakterli olanlarda referansı ver ve **[KORKU-YÜZ]** ekle; kişi kamerada küçük ve uzakta, ama tanınabilir olsun. Aynı odanın boş ve karakterli versiyonları **aynı kamera açısından** olmalı: önce boşunu üret, karakterliyi onun üstüne düzenleyerek yap.

| # | Dosya | Referans | Sahne (promptun başı) |
|---|---|---|---|
| D1 | `img/cam/corr.png` | — | `A long hospital basement corridor seen from a high corner camera, white tiles, a gurney, puddles, empty.` |
| D2 | `img/cam/corr_pasta.png` | REF-PASTA | `Same corridor from the same camera; a pale figure holding a slice of cake stands at the far end staring up at the camera.` |
| D3 | `img/cam/autopsy.png` | — | `An autopsy room seen from a high corner camera: a stainless steel autopsy table under a round surgical lamp, a tray of instruments, a scale, a floor drain, empty.` |
| D4 | `img/cam/autopsy_pasta.png` | REF-PASTA | `Same autopsy room from the same camera; a pale figure stands beside the steel table holding a slice of cake, head tilted up toward the camera.` |
| D5 | `img/cam/cold.png` | — | `A morgue cold storage room seen from a high corner camera: a wall of nine numbered square stainless steel body drawers in three rows, all closed, frost on the metal, a covered body on a stretcher, a floor drain.` |
| D6 | `img/cam/cold_hot.png` | — | `Same cold storage room from the same camera; the middle drawer (number five) is slightly open and a pale grey human hand hangs out of the gap.` |
| D7 | `img/cam/cold_open.png` | REF-HASAN | `Same cold storage room from the same camera; drawer number five is fully pulled out and on it sits a pale naked corpse with an autopsy Y-incision, the person from the reference photo, staring straight up into the camera.` |
| D8 | `img/cam/ventA.png` | — | `Inside a long dark square metal ventilation duct seen from a small camera mounted at a junction, dusty, dented, empty.` |
| D9 | `img/cam/ventA_sahil.png` | REF-SAHIL | `Same duct from the same camera; far down the duct a soaking wet man in a grey coat is crawling toward the camera, water trailing behind him.` |
| D10 | `img/cam/ventB.png` | — | `Inside a dark metal ventilation duct close to its exit, a small rectangle of faint light at the end, seen from a small mounted camera, empty.` |
| D11 | `img/cam/ventB_sahil.png` | REF-SAHIL | `Same duct from the same camera; a soaking wet man in a grey coat crawls very close to the camera, his twisted face looking up into the lens.` |
| D12 | `img/cam/archive.png` | — | `A basement archive room seen from a high corner camera: tall metal shelves full of dusty cardboard file boxes, some boxes fallen and papers scattered on the floor, empty.` |
| D13 | `img/cam/archive_avukat.png` | REF-AVUKAT | `Same archive room from the same camera; a man in a black suit and red tie stands motionless between the shelves holding a thick folder, staring at the camera.` |
| D14 | `img/cam/lift.png` | — | `A hospital basement freight elevator lobby seen from a high corner camera: an old steel freight elevator with its doors closed, a stretcher parked beside it, a flickering light.` |
| D15 | `img/cam/lift_avukat.png` | REF-AVUKAT | `Same elevator lobby from the same camera; a man in a black suit and red tie stands right in front of the closed elevator doors, facing the camera.` |
| D16 | `img/cam/lift_sultan.png` | REF-SULTAN | `Same elevator lobby from the same camera; the elevator doors are open and inside is a single blinding motorcycle headlight with the silhouette of a figure wearing a large turban.` |

### E. Jumpscare'ler (9 görsel, hepsi 1280×720, 16:9)
Hepsi kameraya doğru atılan, ağzı açık, çok yakın plan, sert flaş ışığı ve hafif hareket bulanıklığı. Mekân karanlık bir morg. Her promptun sonuna **[KORKU-YÜZ]** ve **[STİL]** ekle (E9 hariç).

**E1 — `img/scare/denek5.png` — REF-HASAN**
```
Edit the reference photo into a horror movie jumpscare of the same person: a naked pale corpse with a stitched autopsy Y-incision across the chest bursts out of a steel morgue drawer straight at the camera, a cardboard morgue tag hanging from his neck, mouth stretched open in a scream, frost on his skin, harsh cold flash light.
```

**E2 — `img/scare/pasta.png` — REF-PASTA**
```
Edit the reference photo into a horror movie jumpscare of the same person: he lunges at the camera with his mouth stretched unnaturally wide, pushing a rotten dripping slice of green pistachio cake into the lens, wearing the same beige t-shirt, harsh flash light from below, dark morgue behind him.
```

**E3 — `img/scare/avukat.png` — REF-AVUKAT**
```
Edit the reference photo into a horror movie jumpscare of the same person: he lunges at the camera with both arms reaching out, in the same black suit, his red tie pulled tight like a noose around his neck, a wide unnatural grin, flickering cold light, dark morgue corridor behind him.
```

**E4 — `img/scare/sahil.png` — REF-SAHIL**
```
Edit the reference photo into a horror movie jumpscare of the same person: he bursts out of a dark ventilation duct straight at the camera, soaking wet, seawater pouring from his open mouth, wet hair plastered to his face, the same grey coat, his neck twisted.
```

**E5 — `img/scare/sayici.png` — REF-HASAN**
```
Edit the reference photo into a horror movie jumpscare of the same person: he is right in front of the camera holding up both hands showing six fingers, his lips forming a word, numbers scrawled in black ink all over his face and neck, his head tilted, dim cold light.
```

**E6 — `img/scare/arda.png` — REF-ARDA**
```
Edit the reference photo into a horror movie jumpscare of the same person: a man who has not slept for twenty years, extremely gaunt, deep purple-black circles under his eyes, his eyelids gone, gaming headphones around his neck, the same red t-shirt now filthy, opening his mouth wide like a hissing cat as he lunges at the camera, lit by cold blue monitor glow from below.
```

**E7 — `img/scare/muh.png` — REF-HASAN**
```
Edit the reference photo into a horror movie jumpscare of the same person: his face and upper body are pushing out through the glass of an old CRT computer monitor toward the camera, the image of his face torn by digital glitch artifacts and horizontal scan lines, a faded university ID badge on a lanyard around his neck, green screen glow.
```

**E8 — `img/scare/sultan.png` — REF-SULTAN**
```
Edit the reference photo into a horror movie jumpscare of the same person: the undead sultan in his jeweled turban and fur cloak rides the white motorcycle straight into the camera, the headlight blinding, his wide grin inches from the lens, smoke and fog.
```

**E9 — `img/scare/itsme.png` — REF-HASAN**
Bu tek görselde kan ve çığlık yok. Sessiz ve rahatsız edici.
```
Edit the reference photo: only the face of the same person, perfectly centered, filling the frame, completely expressionless, his eyes replaced by hollow black empty sockets, desaturated grey skin, plain black background, flat dim light. No blood, no open mouth, no text. Realistic, very unsettling, film grain. 16:9.
```

### F. Menü, belge, final (4 görsel)

**F1 — `img/menu_face.png` — 600×800 — REF-HASAN**
```
Edit the reference photo: the same person, recognizable, standing in a dark hospital basement corridor wearing a white doctor's coat over his clothes with a faded faculty ID badge, completely expressionless, cold fluorescent light from above, desaturated, dark background. Vertical 3:4. [STİL]
```

**F2 — `img/menu_face_scary.png` — 600×800 — REF-HASAN**
F1'i **aynı kompozisyonda** düzenleyerek üret: önce F1'i bitir, sonra onu girdi olarak ver.
```
Edit this image into the horror version of the same person in exactly the same pose, framing, white coat and lighting: completely black glossy eyes, blood streaming from the eyes, pale grey cracked skin, a stitched autopsy line across his forehead, his neck bent unnaturally to one side. Vertical 3:4. [STİL]
```

**F3 — `img/doc/paper.png` — 900×1200 — referans yok**
Belgelerin kâğıdı. Yazıyı oyun basacak, kâğıt **boş** olmalı.
```
A single sheet of old yellowed typewriter paper seen perfectly flat from directly above, filling the entire image edge to edge, a coffee ring stain, faint water stains, a rusty paper clip mark at the top, creases from being folded in four, a faded blank red rectangular stamp outline with no letters. Completely blank, no text, no writing, no letters anywhere. Even soft light. Vertical 3:4.
```

**F4 — `img/ending.png` — 1280×720 — REF-HASAN**
```
A cinematic horror ending shot: a morgue cold storage room where all nine steel body drawers are pulled open and empty. In the middle of the floor a young man in a white doctor's coat sits with his back to the camera. Around him stand five pale translucent ghostly copies of the person in the reference photo, looking down at him: one in a black suit and red tie, one soaking wet in a grey coat, one in a jeweled sultan turban, one holding a slice of cake, one with green computer-screen light on his face. 16:9. [STİL]
```

---

## 5. Kontrol

Bütün görseller bitince:

```bash
python3 - <<'PY'
import re, pathlib
from PIL import Image
md = pathlib.Path('ASSETS.md').read_text(encoding='utf8')
SIZES = [('img/office.png',(2000,848)),('img/door.png',(320,750)),('img/panel.png',(120,300)),
  ('img/sheet.png',(1280,720)),('img/corr/',(560,1000)),('img/itsme_photo.png',(560,1000)),
  ('img/vent/',(600,440)),('img/doorway/',(320,750)),('img/cam/',(640,360)),('img/scare/',(1280,720)),
  ('img/menu_face',(600,800)),('img/doc/paper.png',(900,1200)),('img/ending.png',(1280,720))]
bad = 0
for p in sorted(set(re.findall(r'`(img/[^`]+\.png)`', md))):
    want = next(s for pre, s in SIZES if p.startswith(pre))
    im = Image.open(p); px = im.convert('RGB').resize((8, 8)).getdata()
    placeholder = all(abs(r-18) < 6 and abs(g-20) < 6 and abs(b-22) < 6 for r, g, b in px)
    ok = im.size == want and not placeholder
    bad += not ok
    print('OK ' if ok else 'HATA', p, im.size, 'YER TUTUCU KALMIŞ' if placeholder else '')
print('Hatalı:', bad)
PY
npm test
```

- Beklenen: `Hatalı: 0` ve `npm test` sonucunda `fail 0`.
- Hatalı olan varsa düzelt ve kontrolü tekrar çalıştır.

---

## 6. Rapor ve push

`img/URETIM_RAPORU.md` dosyasını yaz. Her görsel için tek satır olacak: dosya adı, kaç denemede çıktığı ve varsa sorun (örneğin "yüz tam benzemedi").

Sonra şunları çalıştır:

```bash
git add img/
git commit -m "Görseller: tamamlandı"
git push origin main
```

Push'tan önce `git status` ile `img/` dışında hiçbir dosyanın değişmediğinden emin ol.
