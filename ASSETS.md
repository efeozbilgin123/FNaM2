# Görsel listesi ve Gemini promptları — Mırık'la 5 Gece: MORG

**Nasıl kullanılır:**
- Her satırda dosyanın oyundaki adı, boyutu ve Gemini'ye yapıştıracağın metin var.
- "📷" olanlarda önce fotoğraf yükle. Ya 1. oyundaki karakter fotoğrafı ya da senin elindeki gerçek fotoğraf olabilir.
- Üretilen görseli bana dosya adıyla birlikte at ("bu img/corr/lit.png *(kullanılmıyor, kaldırıldı)*" gibi). Arka planları ben silerim, boyutları ben ayarlarım.
- Görsel gelene kadar oyunda o adla koyu gri bir yer tutucu duruyor; oyun yine oynanabiliyor.

Bütün promptlarda aynı stil korunsun diye sonuna şunu eklemen yeterli (zaten ekli):
*realistic horror video game, very dark, cold fluorescent and green-blue tones, film grain, no text, no watermark.*

---

## 1. Ofis (Morg Nöbetçi Odası)

### `img/office.png` — 2000×848 (21:9 panorama)
Kapıyı, koridor görüntüsünü, havalandırma içini ve monitör ekranını ben üstüne koyacağım; o yüzden o boşluklar karanlık ve boş olmalı.
```
First-person view from an office chair inside a cramped morgue night-watch room in the basement of an old medical faculty, 3am, ultra-wide 21:9 panoramic horror video game background. On the far left wall: a tall empty pitch-black doorway with a heavy steel frame and no door, with a bare wall section next to it at chest height. In the exact center behind the desk: a tall open archway leading into a long pitch-black hospital corridor, completely dark inside. On the far right wall, low near the floor: a large rectangular metal ventilation duct opening with its grille removed, pitch-black inside. In front: a worn steel desk with an old beige 1990s CRT monitor whose screen is dark and turned off, a beige rotary landline telephone with a small red light, a clipboard, a coffee mug, latex gloves, an anatomy textbook. White cracked ceramic wall tiles, a steel autopsy sink, a stretcher with a white sheet covering a body in a corner, a wall chart of the human skeleton, flickering fluorescent tube on the ceiling. Realistic horror video game, very dark, cold fluorescent and green-blue tones, film grain, no people visible, no text, no watermark.
```

### img/door.png *(kullanılmıyor, kaldırıldı)* — 320×750
```
A heavy old steel morgue cold-room door that slides down from the ceiling, seen perfectly straight-on like a flat texture filling the whole image edge to edge. Brushed stainless steel with dents, rust streaks, dried stains, a small frosted porthole window, rubber seal at the bottom, a faded biohazard sticker. Very dark, lit by cold fluorescent light from above. Realistic horror video game texture, tall vertical 3:7 image, no wall, no background, no text.
```

### img/panel.png *(kullanılmıyor, kaldırıldı)* — 120×300
```
An old wall-mounted hospital control box seen perfectly straight-on, filling the entire image: worn white-grey painted metal plate with a screw in each corner, two large round push buttons stacked vertically, top red, bottom off-white, each in a scratched chrome ring, unlit. Rust spots, grime, yellowed tape. Very dark, cold light. Realistic horror video game texture, tall vertical 2:5 image, no background, no text.
```

### img/sheet.png *(kullanılmıyor, kaldırıldı)* — 1280×720
Örtü çekilince ekrana gelen görüntü: içeriden bakıyormuşsun gibi.
```
View from underneath a thin white hospital morgue sheet pulled over the face, the cloth very close to the camera filling the entire frame, faint cold light from a fluorescent tube glowing through the fabric weave, wrinkles and folds, a faint yellowed stain, a vague dark silhouette of something standing nearby visible through the fabric. Realistic horror video game, very dark, cold fluorescent and green-blue tones, film grain, no text, no watermark. 16:9.
```

## 2. Koridor (fenerle bakılan orta açıklık)

Hepsi aynı açıdan: ofisten koridorun derinine bakış, el feneri ışık halkası ortada.

### img/corr/lit.png *(kullanılmıyor, kaldırıldı)* — 560×1000
```
A long narrow abandoned hospital basement corridor seen straight down its length from the doorway, lit only by a single circular flashlight beam in the center, everything outside the beam pitch black. Cracked white tiles, a gurney pushed against the wall, a fallen IV stand, puddles reflecting the light, a sign for MORG too blurry to read. Empty, no people. Realistic horror video game, very dark, cold fluorescent and green-blue tones, film grain, no text, no watermark. Tall vertical 9:16.
```

### img/corr/empty.png *(kullanılmıyor, kaldırıldı)* — 560×1000
```
The same long abandoned hospital basement corridor, completely dark, only very faint shapes visible, no flashlight. Realistic horror video game, almost pitch black, film grain, no text. Tall vertical 9:16.
```

### img/corr/pasta1.png *(kullanılmıyor, kaldırıldı)*, img/corr/pasta2.png *(kullanılmıyor, kaldırıldı)*, img/corr/pasta3.png *(kullanılmıyor, kaldırıldı)* — 560×1000 📷
1. oyundaki Pasta Mırık fotoğrafını yükle. 1 = koridorun en ucunda, 2 = ortada, 3 = hemen dibinde.
```
Using the person in this photo, place him in a long abandoned hospital basement corridor lit by a single flashlight beam. He stands [far at the end of the corridor, small | in the middle of the corridor | very close to the camera, filling most of the frame], pale grey skin, completely black glossy eyes, blood running from the eyes, head slightly tilted, holding a rotten slice of green pistachio cake dripping onto the floor, the word PASTAYMIŞ scratched into the tiles behind him. Realistic horror video game, very dark, cold green-blue tones, film grain, no other text. Tall vertical 9:16.
```

### img/corr/sultan.png *(kullanılmıyor, kaldırıldı)* — 560×1000 📷
1. oyundaki Sultan Mırık Han fotoğrafı.
```
Using the person in this photo, a terrifying undead Ottoman sultan with a jeweled turban and fur cloak riding a white motorcycle down a long dark hospital basement corridor straight toward the camera, one blinding headlight glaring, face barely visible behind the light with completely black eyes and a wide grin. Realistic horror video game, very dark, harsh headlight glare, film grain, no text. Tall vertical 9:16.
```

### `img/itsme_photo.png` — 560×1000 📷
Hasan Emre'nin 1. oyundaki gazete fotoğrafı (düğün bahçesindeki).
```
Using the person in this photo, he stands perfectly still at the end of a dark hospital corridor lit by a flashlight beam, wearing the same clothes as in the photo, but the image looks like a faded 1998 photograph projected onto the corridor, his face blank and expressionless with hollow black eyes, staring directly at the viewer. Realistic horror, very dark, film grain, no text. Tall vertical 9:16.
```

## 3. Havalandırma (sağdaki açıklık, ışık yakınca)

### img/vent/empty.png *(kullanılmıyor, kaldırıldı)* — 600×440
```
Looking into a dark square metal ventilation duct from its opening, lit by a small harsh light, dusty galvanized steel walls, dents, a drip of dark water, the duct continuing into blackness. Empty. Realistic horror video game, very dark, cold tones, film grain, no text. 4:3.
```

### img/vent/sahil.png *(kullanılmıyor, kaldırıldı)* — 600×440 📷
1. oyundaki Sahil Mırık fotoğrafı.
```
Using the person in this photo, he is crawling on his stomach inside a dark square metal ventilation duct right at the opening, face toward the camera, soaked wet hair dripping seawater, grey coat soaked, pale grey wet skin, completely black glossy eyes, head twisted at an unnatural angle, seaweed and wet sand on the duct floor. Lit by a small harsh light. Realistic horror video game, very dark, cold tones, film grain, no text. 4:3.
```

## 4. Sol kapı (kapı ışığı yakınca)

### img/doorway/empty.png *(kullanılmıyor, kaldırıldı)* — 320×750
```
A tall dark doorway seen straight-on from inside a room, lit by a single harsh lamp from above, showing an empty cold hospital hallway right outside, white tiles, a drain in the floor. Empty. Realistic horror video game, very dark, cold tones, film grain, no text. Tall vertical 3:7.
```

### img/doorway/avukat.png *(kullanılmıyor, kaldırıldı)* — 320×750 📷
1. oyundaki Avukat Mırık fotoğrafı.
```
Using the person in this photo, he stands right in a tall dark doorway lit harshly from above, black suit, white shirt, red tie pulled tight like a noose, pale grey skin, completely black glossy eyes, a wide unnatural grin, holding a thick legal folder stamped 3-4-5, leaning slightly into the room. Realistic horror video game, very dark, cold tones, film grain, no other text. Tall vertical 3:7.
```

## 5. Kameralar (CRT monitör)

Bütün kamera görüntüleri: eski güvenlik kamerası, yüksekten bakış, siyah-beyaza yakın, düşük çözünürlük.
Her prompta şunu ekle: *grainy low-resolution 1990s black and white CCTV security camera footage, high corner angle, fisheye, very dark.*

| Dosya | Ne |
|---|---|
| `img/cam/corr.png` | Koridor, yukarıdan, boş |
| `img/cam/corr_pasta.png` 📷 | Koridorun ucunda Pasta Mırık |
| `img/cam/autopsy.png` | Otopsi salonu: çelik masa, lamba, aletler, boş |
| `img/cam/autopsy_pasta.png` 📷 | Otopsi masasının yanında dikilen Pasta Mırık |
| `img/cam/cold.png` | Soğuk oda: duvarda numaralı çelik morg çekmeceleri (1–9), hepsi kapalı |
| `img/cam/cold_hot.png` | Aynı oda, 5 numaralı çekmece hafifçe aralık, içinden soluk bir el sarkıyor |
| `img/cam/cold_open.png` 📷 | 5 numaralı çekmece tamamen açık, üstünde oturan Hasan Emre'nin solgun cesedi kameraya bakıyor |
| `img/cam/ventA.png` | Havalandırma kanalı A, içeriden bir kamera, boş |
| `img/cam/ventA_sahil.png` 📷 | Kanalda sürünen ıslak Sahil Mırık, uzakta |
| `img/cam/ventB.png` | Havalandırma kanalı B, ofise yakın kısım, boş |
| `img/cam/ventB_sahil.png` 📷 | Kanal B'de çok yakın Sahil Mırık |
| `img/cam/archive.png` | Arşiv: raflarda tozlu dosyalar, "PROJE 4-5-6" kutuları, boş |
| `img/cam/archive_avukat.png` 📷 | Rafların arasında dikilen Avukat Mırık |
| `img/cam/lift.png` | Asansör ve giriş: eski yük asansörü, kapıları kapalı |
| `img/cam/lift_avukat.png` 📷 | Asansörün önünde Avukat Mırık |
| `img/cam/lift_sultan.png` 📷 | Asansör kapıları açık, içinde motorun farı ve Sultan'ın silüeti |

Örnek prompt (`img/cam/cold.png`, 640×360):
```
Grainy low-resolution 1990s black and white CCTV security camera footage, high corner angle, fisheye, very dark: a morgue cold storage room with a wall of nine numbered stainless steel body drawers, frost on the metal, a drain in the tiled floor, a single flickering ceiling light, a stretcher with a covered body. Timestamp area left empty. No text, no watermark. 16:9.
```
Diğerlerinde ortadaki sahne tarifini tablodaki "Ne" sütunuyla değiştir. 📷 olanlarda fotoğrafı yükleyip başına *"Using the person in this photo, pale grey skin, completely black glossy eyes,"* ekle.

Hepsi 640×360.

## 6. Jumpscare'ler — 1280×720 📷

Hepsi kameraya doğru atılan, ağız açık, simsiyah gözlü, gözlerinden kan akan bir yakın plan. 1. oyundaki jumpscare'lerle aynı tarz ama mekân morg.

| Dosya | Fotoğraf | Ekstra tarif |
|---|---|---|
| `img/scare/denek5.png` | Hasan Emre | Otopsi kesikli (Y-incision) çıplak gövde, morg etiketi ayak parmağında değil boynunda "DENEK 5", çekmeceden fırlıyor |
| `img/scare/pasta.png` | Pasta Mırık | Çürük pasta dilimini kameraya bastırıyor |
| `img/scare/avukat.png` | Avukat Mırık | Kravatı ilmik gibi, kollarını uzatmış |
| `img/scare/sahil.png` | Sahil Mırık | Havalandırmadan sırılsıklam çıkıyor, ağzından deniz suyu akıyor |
| `img/scare/sayici.png` | Hasan Emre | Elleriyle altı parmak gösteriyor, dudakları "altı" diye açılmış, yüzüne kalemle 4-5-6 yazılmış |
| `img/scare/arda.png` | Arda Baz | Hiç uyumamış: gözaltları mosmor, göz kapakları yok, kulaklıklı, ağzını kedi gibi açıp tıslıyor |
| `img/scare/muh.png` | Hasan Emre | CRT monitörün içinden çıkıyor, yüzü parazitli tarama çizgileriyle bozuk, mühendis kimlik kartı takılı |
| `img/scare/sultan.png` | Sultan Mırık Han | Motorla kameranın üstüne geliyor, far gözü kör ediyor |
| `img/scare/itsme.png` | Hasan Emre | Sadece yüz, ifadesiz, gözler boş siyah çukur; bu tek görselde kan yok, çok sessiz ve rahatsız edici |

Örnek prompt (`img/scare/pasta.png`):
```
Edit this photo into a horror movie jumpscare of the same person, set in a dark hospital morgue. Keep his face recognizable. He lunges at the camera with his mouth stretched unnaturally wide, completely black glossy eyes, blood running from the eyes, pale grey skin, pushing a rotten dripping slice of green pistachio cake toward the lens. Harsh cold flash light from below, motion blur, realistic horror film style, very dark background. No text. 16:9.
```

## 7. Menü ve diğer

### `img/menu_face.png` — 600×800 📷
Hasan Emre'nin normal bir fotoğrafı.
```
Edit this photo: the same person standing in a dark hospital basement corridor, wearing a white doctor's coat over his clothes with a faded faculty ID badge, expressionless, cold fluorescent light from above, desaturated, plain dark background. Realistic, film grain, no text. Vertical 3:4.
```

### `img/menu_face_scary.png` — 600×800 📷
Aynı fotoğraf.
```
Edit this photo into the horror version of the same person in the same pose and white doctor's coat: completely black glossy eyes, blood streaming from the eyes, pale grey cracked skin, an autopsy stitch line across his forehead, neck bent unnaturally. Same framing and lighting. Realistic horror, plain dark background, no text. Vertical 3:4.
```

### `img/doc/paper.png` — 900×1200
Belgelerin kâğıdı. Yazıyı ben basacağım.
```
A single sheet of old yellowed paper seen perfectly flat from above filling the entire image, coffee ring, faint water stains, a rusty paper clip mark at the top, a faded red CONFIDENTIAL style stamp shape with no readable letters, creases from being folded in four. Completely blank, no text, no writing. Even soft light. 3:4.
```

### `img/ending.png` — 1280×720 📷
Hasan Emre fotoğrafı.
```
A cinematic horror ending shot: a morgue cold room, all nine steel drawers are open and empty, in the middle of the room a young man in a white doctor's coat sits on the floor with his back to the camera, and five pale translucent ghostly copies of the same person from the photo stand around him looking down at him, one in a suit, one soaking wet, one in a sultan turban, one holding cake, one with glowing monitor light on his face. Realistic horror, very dark, cold tones, film grain, no text. 16:9.
```
