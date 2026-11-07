# Gemini: kamera görüntülerine karakter ekleme

Şu anki karakterli kamera görüntüleri kesip yapıştırma. Avukat ve diğerlerinin bacakları kesik, ışıkları da odaya uymuyor. Bu dosyadaki promptlarla Gemini'ye boş oda görüntüsünün içine karakteri **tam boy** ve **aynı kamera açısıyla** çizdireceğiz.

## Nasıl yapılır

1. Gemini'de yeni bir sohbet aç. Görsel düzenleme modelini seç (Nano Banana / "Görsel oluştur").
2. **İki görsel yükle, sırası önemli:**
   1. Boş oda: `img/cam_src/<oda>.png` (aşağıdaki tabloda yazıyor)
   2. Karakterin fotoğrafı: `img/ref/<karakter>_genis.png`
3. Tablodaki promptu **olduğu gibi** yapıştır (İngilizce kalsın, daha iyi sonuç veriyor).
4. Sonuçta şunları kontrol et:
   - Oda aynı mı?
   - Karakterin ayakları görünüyor mu?
   - Boyu odaya göre doğru mu?

   Beğenmezsen "Try again" de ya da altta yazan düzeltme cümlelerinden birini ekle.
5. Beğendiğin görseli indir ve **tablodaki çıktı adıyla** `img/cam_raw/` klasörüne koy (örnek: `img/cam_raw/archive_avukat.png`). Boyutu dert etme, ben 640×360'a kendim indiririm.
6. Toplam **10 görsel** var. Hepsini yükleyince bana "yükledim" de. `python3 tools/cam_import.py` ile oyuna alırım.

> Bir sohbette en fazla 2–3 görsel yap. Uzayan sohbetlerde Gemini eski görselleri karıştırmaya başlıyor, yeni sohbet aç.

## Her prompta eklenen ortak kurallar

Bu kurallar aşağıdaki promptların içinde zaten var. Elle eklemene gerek yok, sadece neyi istediğimizi bil diye yazıyorum:

- Kamera açısı, oda, eşyalar ve ışık **birebir aynı** kalacak.
- Karakter **ayaklarından başına kadar** görünecek, kadrajdan taşmayacak.
- Karakter yere basacak: ayağının altında gölge olacak, perspektifi ve boyu odaya uyacak.
- Gece görüşü güvenlik kamerası görüntüsü gibi olacak: aynı gren, aynı yeşil-gri ton, hafif bulanıklık.
- Yüzü tanınır kalacak ama korkunç olacak: solgun gri ten, simsiyah gözler.
- Görselde yazı, saat damgası veya filigran olmayacak.

---

## 1. `corr_pasta`: Koridor, Pasta yürüyor

- Oda: `img/cam_src/corr.png`
- Karakter: `img/ref/pasta_genis.png`
- Çıktı: `img/cam_raw/corr_pasta.png`

```
Edit the first image, which is a night-vision security camera frame of a long basement corridor. Keep the camera angle, the corridor, the gurney, the fallen IV stand, the puddles and the lighting exactly the same. Add the man from the second image standing in the middle of the corridor, about halfway between the camera and the dark doorway at the far end, on the right half of the floor. Show his whole body from head to feet, standing on the wet floor with a faint shadow and a reflection in the puddle under him, life-size for that distance (his head roughly at the height of the doorway's top edge). He wears the same beige t-shirt, his head is tilted unnaturally to one side, and he holds a rotten slice of green pistachio cake in one hand. Make him terrifying but keep his face recognizable: pale grey skin, completely black glossy eyes, thin lines of blood under the eyes. He must look like part of the same CCTV footage: same grain, same green-grey night-vision tone, same soft focus. No text, no timestamp, no watermark.
```

## 2. `autopsy_pasta`: Otopsi odası, Pasta kapıda

- Oda: `img/cam_src/autopsy.png`
- Karakter: `img/ref/pasta_genis.png`
- Çıktı: `img/cam_raw/autopsy_pasta.png`

```
Edit the first image, which is a night-vision security camera frame of an autopsy room. Keep the camera angle, the steel autopsy table, the surgical lamp, the sink, the tiles and the lighting exactly the same. Add the man from the second image standing in the open doorway on the far wall, half in the darkness of the doorway, his whole body visible from head to feet, feet on the threshold, life-size for that distance (his head just below the top of the door frame). He wears the same beige t-shirt, stands perfectly still, looks straight up at the camera, and holds a slice of green pistachio cake. Make him terrifying but keep his face recognizable: pale grey skin, completely black glossy eyes. He must look like part of the same CCTV footage: same grain, same night-vision tone, same soft focus. No text, no timestamp, no watermark.
```

## 3. `archive_avukat`: Arşiv, Avukat raflar arasında

- Oda: `img/cam_src/archive.png`
- Karakter: `img/ref/avukat_genis.png`
- Çıktı: `img/cam_raw/archive_avukat.png`

```
Edit the first image, which is a night-vision security camera frame of a basement records archive. Keep the camera angle, the metal shelves full of file boxes, the scattered papers, the desk with the typewriter and the lighting exactly the same. Add the man from the second image standing in the middle of the aisle between the shelves, about one third of the way from the camera to the dark back door, his whole body visible from head to shiny black shoes, feet on the floor among the scattered papers with a soft shadow, life-size for that distance. He wears a black suit with a red tie pulled tight like a noose and holds a thick case folder against his chest. Make him terrifying but keep his face recognizable: pale grey skin, completely black glossy eyes, a thin unnatural smile, staring at the camera. He must look like part of the same CCTV footage: same grain, same night-vision tone, same soft focus. No text, no timestamp, no watermark.
```

## 4. `lift_avukat`: Asansör, Avukat içinde

- Oda: `img/cam_src/lift.png`
- Karakter: `img/ref/avukat_genis.png`
- Çıktı: `img/cam_raw/lift_avukat.png`

```
Edit the first image, which is a night-vision security camera frame of an old freight elevator with its doors open. Keep the camera angle, the elevator, the gurney on the left, the wall and the lighting exactly the same. Add the man from the second image standing inside the elevator car, in the center, facing the camera, under the small ceiling bulb. Show his whole body from head to shiny black shoes, feet on the elevator floor with a shadow under him, life-size for the elevator (his head well below the elevator ceiling). He wears a black suit with a red tie pulled tight like a noose and holds a thick case folder. Make him terrifying but keep his face recognizable: pale grey skin, completely black glossy eyes. He must look like part of the same CCTV footage: same grain, same night-vision tone, same soft focus. No text, no timestamp, no watermark.
```

## 5. `lift_sultan`: Asansör, Sultan motoruyla

- Oda: `img/cam_src/lift.png`
- Karakter: `img/ref/sultan_genis.png`
- Çıktı: `img/cam_raw/lift_sultan.png`

```
Edit the first image, which is a night-vision security camera frame of an old freight elevator with its doors open. Keep the camera angle, the elevator, the gurney, the wall and the lighting exactly the same. Inside the elevator car, add the man from the second image as an undead Ottoman sultan in a jeweled turban and a fur-trimmed cloak, sitting on a white motorcycle that faces the camera, about to ride out of the elevator. Show the whole motorcycle with both wheels on the elevator floor, and the whole rider. The motorcycle's single round headlight is on and glares toward the camera, lighting the floor in front of the elevator, but the glare is small enough that the bike and rider are still visible. Make him terrifying but keep his face recognizable: pale grey skin, completely black glossy eyes, a wide unnatural grin. He must look like part of the same CCTV footage: same grain, same night-vision tone, same soft focus. No text, no timestamp, no watermark.
```

## 6. `ventA_sahil`: Havalandırma A, Sahil uzakta sürünüyor

- Oda: `img/cam_src/ventA.png`
- Karakter: `img/ref/sahil_genis.png`
- Çıktı: `img/cam_raw/ventA_sahil.png`

```
Edit the first image, which is a night-vision security camera frame from inside a long metal ventilation duct. Keep the camera angle, the duct walls, the puddle and the lighting exactly the same. Far down the duct, near the first square frame, add the man from the second image crawling toward the camera on his stomach inside the duct: his head, shoulders, both arms and his torso are visible, the rest of his body disappears into the darkness behind him. He is small because he is far away and he fits inside the duct. He is soaking wet, wearing the same grey coat, wet hair plastered to his face, water and seaweed dripping and leaving a wet trail behind him. Make him terrifying but keep his face recognizable: pale grey wet skin, completely black glossy eyes, head raised to look at the camera. He must look like part of the same CCTV footage: same grain, same night-vision tone, same soft focus. No text, no timestamp, no watermark.
```

## 7. `ventB_sahil`: Havalandırma B, Sahil kameranın dibinde

- Oda: `img/cam_src/ventB.png`
- Karakter: `img/ref/sahil_genis.png`
- Çıktı: `img/cam_raw/ventB_sahil.png`

```
Edit the first image, which is a night-vision security camera frame from inside a metal ventilation duct that ends at a louvered grille. Keep the camera angle, the duct, the grille, the debris and the lighting exactly the same. Add the man from the second image crawling on his stomach on the duct floor very close to the camera, in the lower middle of the frame, head and shoulders large, one hand reaching forward toward the camera, the rest of his body stretching back along the duct toward the grille. His whole crawling body fits inside the duct and inside the frame. He is soaking wet, wearing the same grey coat, wet hair plastered to his face, water and seaweed dripping onto the duct floor. Make him terrifying but keep his face recognizable: pale grey wet skin, completely black glossy eyes, mouth slightly open, looking straight into the camera. He must look like part of the same CCTV footage: same grain, same night-vision tone, same soft focus. No text, no timestamp, no watermark.
```

## 8. `cold_hot`: Soğuk oda, 5 numara aralık (ısı yüksek)

- Oda: `img/cam_src/cold.png`
- Karakter: yok (sadece oda)
- Çıktı: `img/cam_raw/cold_hot.png`

```
Edit this image, which is a night-vision security camera frame of a morgue cold room with a wall of nine steel body drawers in three rows of three. Keep the camera angle, every drawer, the trolley and the lighting exactly the same. Change only the drawer in the exact center of the grid (middle row, middle column): its door is pushed open a few centimeters from the inside, leaving a thin pitch-black gap along its left edge, and four pale thin fingers of a human hand curl around the edge of the door from inside the gap. A little cold mist leaks out of the gap. All other drawers stay closed and unchanged. Same grain, same night-vision tone, same soft focus. No text, no numbers, no timestamp, no watermark.
```

## 9. `cold_open`: Soğuk oda, 5 numara açık, Denek 5 oturuyor

- Oda: `img/cam_src/cold.png`
- Karakter: `img/ref/hasan_genis.png`
- Çıktı: `img/cam_raw/cold_open.png`

```
Edit the first image, which is a night-vision security camera frame of a morgue cold room with a wall of nine steel body drawers in three rows of three. Keep the camera angle, every other drawer, the trolley and the lighting exactly the same. Change only the drawer in the exact center of the grid (middle row, middle column): its door hangs wide open on its hinges and its steel body tray has slid out toward the camera. The young man from the second image is sitting upright on the tray, a white morgue sheet fallen to his waist, his bare pale shoulders visible, hands resting on the edge of the tray, his face turned straight to the camera. Make him terrifying but keep his face recognizable: grey dead skin, completely black glossy eyes with no whites, dried blood under both eyes, lips slightly parted. Cold mist pours out of the open drawer and down to the floor. Same grain, same night-vision tone, same soft focus. No text, no numbers, no timestamp, no watermark.
```

## 10. `wash_sahil`: Yıkama odası, Sahil havalandırmaya gidiyor (YENİ ODA)

- Oda: `img/cam_src/wash.png`
- Karakter: `img/ref/sahil_genis.png`
- Çıktı: `img/cam_raw/wash_sahil.png`

```
Edit the first image, which is a night-vision security camera frame of a morgue body washing room with a steel washing table, a hose, a shower head and a wet tiled floor. Keep the camera angle, the table, the hose, the ventilation grille on the right wall and the lighting exactly the same. Add the man from the second image on the wet floor between the washing table and the ventilation grille, on his hands and knees, crawling toward the grille, his head turned back over his shoulder to stare at the camera. Show his whole body from head to feet, touching the wet floor, with his reflection in the water and ripples around his hands, life-size for that distance. He is soaking wet, wearing the same grey coat, wet hair plastered to his face, seawater and seaweed dripping from him and leaving a wet trail back toward the table. Make him terrifying but keep his face recognizable: pale grey wet skin, completely black glossy eyes. He must look like part of the same CCTV footage: same grain, same night-vision tone, same soft focus. No text, no timestamp, no watermark.
```

---

## Sık çıkan hatalar ve düzeltme cümleleri

Sonuç bozuk gelirse aynı sohbette şu cümlelerden birini yaz:

| Sorun | Yazılacak cümle |
|---|---|
| Ayaklar kesik / karakter kadrajdan taşıyor | `Make him smaller and move him further from the camera so his whole body including both feet is visible inside the frame.` |
| Oda değişti, açı farklı | `Do not change the room or the camera angle at all. Use the first image exactly as the background and only add the person.` |
| Renkli / fazla net, yapıştırılmış gibi | `Make him match the CCTV footage: black and white with the same green-grey tint, the same grain and the same slight blur as the rest of the image.` |
| Yere basmıyor, havada duruyor | `His feet must touch the floor, with a dark contact shadow under them.` |
| Yüz başka biri oldu | `Keep the face of the man from the second image recognizable.` |
| Yazı / saat damgası çıktı | `Remove all text, numbers and timestamps from the image.` |
