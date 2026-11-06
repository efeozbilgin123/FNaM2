# GÖREV 2: Ofis fotoğrafının düzenlenmiş versiyonları

## Neden

Oyunda kapı, koridor ve havalandırmadaki görüntüler ayrı görsellerdi ve ofisin üstüne yapıştırılmış gibi duruyordu. Çözüm: aynı `img/office.png` fotoğrafını düzenleyip versiyonlar üretmek. Hepsi aynı fotoğraftan geldiği için ışık, açı ve gren birebir tutar. Oyun her versiyonun sadece ilgili bölgesini (kapı, kemer ya da havalandırma) keser ve ofisin üstüne yerleştirir.

## Kurallar

1. **Her görevde `img/office.png` dosyasını görsel girdi olarak ver** ve **düzenle** (image edit). Sıfırdan üretme.
   - Gerekirse karakter için ikinci bir referans fotoğraf ekle. Referanslar `../fnam/img/` klasöründe, bkz. 1. görev dosyası.
2. **Sadece söylenen bölge değişsin.** Kamera açısı, kadraj, masa, monitör, duvarlar, ışık ve renkler **birebir aynı** kalmalı. Her promptun sonuna şunu ekle:
   > Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
3. **Çıktı boyutu:** Tam 2000×848 olmalı. Değilse 2000×848'e ölçekle, kırpma.
4. **Kayıt yeri:** `img/office_v/<ad>.png` (klasörü oluştur).
5. Kenarlar biraz kaysa da olur, oyun yumuşak geçişle keser. Ama kapı, kemer ve havalandırma **aynı yerde** kalmalı.
6. **Commit mesajı:** `Görseller: ofis versiyonları`. Yapay zekâ co-author satırı ekleme. `img/office_v/` dışında hiçbir dosyaya dokunma.

## Bölgeler

`office.png` üzerindeki yerleri, 2000×848 piksel ölçüsünde:

- **SOL KAPI:** x 380–600, y 60–690. Soldaki çelik çerçeveli kapı boşluğu.
- **KEMER:** x 840–1160, y 90–580. Ortadaki kemerli koridor.
- **HAVALANDIRMA:** x 1640–1960, y 500–830. Sağ alt köşedeki dikdörtgen havalandırma ağzı.

## Versiyonlar (11 adet)

| # | Dosya | Prompt (İngilizce, olduğu gibi yapıştır) | Ek referans |
|---|---|---|---|
| 1 | `img/office_v/door_lit.png` | `In the open doorway on the far left, a harsh cold fluorescent light is now switched on just outside, lighting the doorway and showing an empty white-tiled hospital hallway beyond it, with light spilling onto the floor inside.` | — |
| 2 | `img/office_v/door_avukat.png` | `Same as a lit doorway on the far left (harsh cold light just outside), and a man in a black suit with a red tie pulled tight like a noose stands in the doorway, half leaning into the room, pale grey skin, completely black glossy eyes, blood running from the eyes, a wide unnatural grin, holding a thick folder. He is the person in the second reference photo.` | `avukat.png` |
| 3 | `img/office_v/door_closed.png` | `The open doorway on the far left is now completely closed by a heavy dented stainless steel morgue door with a small round porthole window and a faded biohazard sticker, fitting the doorway frame exactly in perspective.` | — |
| 4 | `img/office_v/vent_lit.png` | `The rectangular ventilation duct opening in the bottom right corner is now lit from inside by a small harsh light, showing the dusty dented metal inside of the duct going back into darkness, a trickle of dark water on its floor. Empty.` | — |
| 5 | `img/office_v/vent_sahil.png` | `The ventilation duct opening in the bottom right corner is lit from inside by a small harsh light, and a soaking wet man in a grey coat is crawling out of it on his stomach toward the room, head twisted at an unnatural angle, pale grey wet skin, completely black glossy eyes, seawater and seaweed dripping. He is the person in the second reference photo.` | `sahil.png` |
| 6 | `img/office_v/corr_lit.png` | `The dark arched corridor in the center is now lit by a single circular flashlight beam shining down it, revealing a long abandoned hospital basement corridor with cracked tiles, an old gurney against the wall and puddles. Empty. Everything outside the arch stays exactly the same.` | — |
| 7 | `img/office_v/corr_pasta1.png` | `Same flashlight-lit arched corridor in the center, and far away at the very end of the corridor stands a small pale figure holding a slice of green cake, perfectly still.` | `pasta.png` |
| 8 | `img/office_v/corr_pasta2.png` | `Same flashlight-lit arched corridor in the center, and halfway down the corridor stands a pale man in a beige t-shirt with completely black eyes and blood running from them, head tilted, holding a rotten slice of green pistachio cake dripping on the floor. He is the person in the second reference photo.` | `pasta.png` |
| 9 | `img/office_v/corr_pasta3.png` | `In the flashlight-lit arched corridor in the center, a pale man in a beige t-shirt is right at the arch entrance just behind the desk, filling most of the arch, mouth stretched open in a scream, completely black glossy eyes, blood running from the eyes, holding a rotten slice of green pistachio cake. He is the person in the second reference photo. The desk and computer monitor stay in front of him.` | `pasta.png` |
| 10 | `img/office_v/corr_sultan.png` | `In the dark arched corridor in the center, an undead Ottoman sultan in a jeweled turban and fur cloak rides a white motorcycle straight toward the room, one blinding headlight glaring out of the arch and lighting the floor of the room, his face barely visible with black eyes and a wide grin. He is the person in the second reference photo.` | `sultan.png` |
| 11 | `img/office_v/corr_itsme.png` | `Same flashlight-lit arched corridor in the center, and at the end of the corridor stands a young man perfectly still, expressionless, with hollow black empty eye sockets, looking like a faded old photograph. No blood. He is the person in the second reference photo.` | `gece.png` |

## Kontrol

Bütün versiyonlar bittikten sonra şunu çalıştır:

```bash
python3 - <<'PY'
from PIL import Image, ImageChops
import glob
base = Image.open('img/office.png').convert('RGB')
for p in sorted(glob.glob('img/office_v/*.png')):
    im = Image.open(p).convert('RGB')
    ok = im.size == (2000, 848)
    # bölgeler dışındaki ortalama fark küçük olmalı (aynı fotoğraf)
    d = ImageChops.difference(base, im.resize(base.size)).convert('L').crop((1000, 600, 1600, 848))
    diff = sum(d.getdata()) / (600 * 248)
    print('OK ' if ok and diff < 25 else 'HATA', p, im.size, f'masa farkı {diff:.1f}')
PY
```

- Masa bölgesindeki fark (`masa farkı`) 25'ten büyükse, Gemini masayı değiştirmiş demektir. O versiyonu yeniden üret.
- Sonra `img/office_v/URETIM_RAPORU.md` dosyasına her görsel için tek satır yaz ve push et.
