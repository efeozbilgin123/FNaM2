# Ofis versiyonları: Gemini uygulamasından elle yapılacaklar

Toplam 11 görsel. Her biri yaklaşık 2–3 dakika sürer.

---

## 0. Hazırlık (bir kez)

**İndirilecek dosyalar** (linke tıkla, açılan resme sağ tık → *Resmi farklı kaydet*):

| Kısa ad | Ne | Link |
|---|---|---|
| **OFİS** | Ana ofis fotoğrafı | https://github.com/efeozbilgin123/FNaM2/raw/main/img/office.png |
| **AVUKAT** | Avukat Mırık | https://github.com/efeozbilgin123/FNaM2/raw/main/img/ref/avukat_genis.png |
| **SAHİL** | Sahil Mırık | https://github.com/efeozbilgin123/FNaM2/raw/main/img/ref/sahil_genis.png |
| **PASTA** | Pasta Mırık | https://github.com/efeozbilgin123/FNaM2/raw/main/img/ref/pasta_genis.png |
| **SULTAN** | Sultan Mırık Han | https://github.com/efeozbilgin123/FNaM2/raw/main/img/ref/sultan_genis.png |
| **HASAN** | Hasan Emre (normal) | https://github.com/efeozbilgin123/FNaM2/raw/main/img/ref/hasan_genis.png |

**Açılacak sayfa:** https://gemini.google.com

**Her görselde aynı akış:**
1. **Yeni sohbet** aç. Her görsel için yeni sohbet, yoksa Gemini önceki görselden etkilenir.
2. Tablodaki **"Yüklenecek"** sütunundaki dosya ya da dosyaları sürükle.
3. Promptu kutunun içindekiyle **birebir aynı** yapıştır ve gönder.
4. Çıkan görseli kontrol et:
   - Masa, monitör, telefon, iskelet posteri ve sedye **aynı yerde** mi?
   - Sadece istenen bölge mi değişmiş?
5. Doğruysa görseli indir ve **tablodaki adla** kaydet (örneğin `door_lit.png`).
6. Yanlışsa aynı sohbete şunu yaz:
   ```
   You changed other parts of the image or the camera angle. Edit the ORIGINAL image again and change ONLY the described area. Everything else must stay pixel-identical.
   ```
   İki denemede de olmazsa yeni sohbette baştan dene.

**Karakter resimleri neden geniş:** Gemini çıktının oranını son yüklenen resme göre seçebiliyor. Karakter resmi dikey olursa bütün ofisi dikey çizip baştan oluşturuyor. O yüzden karakterler ofisle aynı genişlikte bir zeminin ortasında. **Önce ofis/versiyon görselini, sonra karakteri yükle.**

**Önemli:** Bazı görseller önceki bir görselin üstüne yapılıyor; "Yüklenecek" sütununda yazıyor. Örneğin önce `corr_lit.png`'yi yapıyorsun, Pasta'lı koridorları da onu yükleyerek yapıyorsun. Böylece koridor her görselde aynı kalıyor.

---

## 1. Sol kapı (3 görsel)

### 1.1 `door_lit.png` ✅ HAZIR, atla
Bu zaten yapıldı. 1.2 için şuradan indir: https://github.com/efeozbilgin123/FNaM2/raw/main/img/office_v/door_lit.png

<details><summary>Eski prompt</summary>

**Yüklenecek:** OFİS
```
Edit this photo. In the open doorway on the far left wall, a harsh cold fluorescent light is now switched on just outside the doorway, lighting up the inside of the door frame and revealing an empty white-tiled hospital hallway beyond it, with some cold light spilling onto the floor just inside the room. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

</details>

### 1.2 `door_avukat.png`
**Yüklenecek:** `door_lit.png` (az önce yaptığın) + AVUKAT
```
Edit the first image. Put the man from the second image into the lit doorway on the far left: he stands in the doorway, half leaning into the room, wearing a black suit with a red tie pulled tight like a noose, holding a thick folder against his chest. Make him terrifying: pale grey skin, completely black glossy eyes with no whites, thin streams of blood running from the eyes, a wide unnatural grin. Keep his face recognizable. He must be lit by the same cold light from the hallway and match the perspective of the doorway. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

### 1.3 `door_closed.png`
**Yüklenecek:** OFİS
```
Edit this photo. The open doorway on the far left wall is now completely closed by a heavy dented stainless steel morgue door that fills the door frame exactly and follows its perspective, with a small round porthole window near the top and a faded biohazard sticker. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

---

## 2. Havalandırma (2 görsel)

### 2.1 `vent_lit.png`
**Yüklenecek:** OFİS
```
Edit this photo. The large rectangular ventilation duct opening low on the right wall, in the bottom right corner, is now lit from inside by a small harsh light, revealing the dusty dented galvanized metal inside of the duct going back into darkness and a trickle of dark water along its floor. The duct is empty. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

### 2.2 `vent_sahil.png`
**Yüklenecek:** `vent_lit.png` + SAHİL
```
Edit the first image. Put the man from the second image inside the lit ventilation duct opening in the bottom right corner: he is crawling out of the duct on his stomach toward the room, head and shoulders coming out of the opening, soaking wet, wearing the same grey coat, wet hair plastered to his face, seawater and seaweed dripping onto the floor. Make him terrifying: pale grey wet skin, completely black glossy eyes, his head twisted at an unnatural angle. Keep his face recognizable. He must match the perspective of the duct. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

---

## 3. Orta koridor (6 görsel)

### 3.1 `corr_lit.png`
**Yüklenecek:** OFİS
```
Edit this photo. The dark arched opening in the center of the back wall is now lit by a single circular flashlight beam shining straight into it, revealing a long narrow abandoned hospital basement corridor behind the arch: cracked white tiles, an old gurney against the left wall, a fallen IV stand, puddles reflecting the light, fading into darkness at the far end. The corridor is empty. Everything outside the arch stays exactly the same, and the desk and computer monitor stay in front. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

### 3.2 `corr_pasta1.png`
**Yüklenecek:** `corr_lit.png` + PASTA
```
Edit the first image. Far away at the very end of the flashlight-lit corridor inside the central arch, add the man from the second image, small in the distance, standing perfectly still and facing the camera, holding a slice of green pistachio cake. Only his silhouette and pale face are visible. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

### 3.3 `corr_pasta2.png`
**Yüklenecek:** `corr_lit.png` + PASTA
```
Edit the first image. Halfway down the flashlight-lit corridor inside the central arch, add the man from the second image standing in the beam of light, wearing the same beige t-shirt, his head tilted unnaturally, holding a rotten slice of green pistachio cake dripping onto the floor. Make him terrifying: pale grey skin, completely black glossy eyes, blood running from the eyes. Keep his face recognizable. He must be inside the corridor with correct perspective and size. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

### 3.4 `corr_pasta3.png`
**Yüklenecek:** `corr_lit.png` + PASTA
```
Edit the first image. Right at the entrance of the central arch, just behind the desk, add the man from the second image, close and large, filling most of the arch opening, lit harshly by the flashlight, mouth stretched open in a scream, holding a rotten slice of green pistachio cake toward the camera. Make him terrifying: pale grey skin, completely black glossy eyes, blood running from the eyes. Keep his face recognizable. The desk and the computer monitor must stay in front of him and unchanged. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

### 3.5 `corr_sultan.png`
**Yüklenecek:** OFİS + SULTAN
```
Edit the first image. Inside the dark arched opening in the center, add the man from the second image as an undead Ottoman sultan in his jeweled turban and fur cloak, riding the white motorcycle straight toward the room down the corridor, one blinding headlight glaring out of the arch and throwing harsh white light onto the floor of the room. His face is barely visible behind the light, with completely black eyes and a wide unnatural grin. The desk and computer monitor stay in front. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area and the headlight glow on the floor. Photorealistic, same color grading as the original. No text.
```

### 3.6 `corr_itsme.png`
**Yüklenecek:** `corr_lit.png` + HASAN
```
Edit the first image. At the far end of the flashlight-lit corridor inside the central arch, add the young man from the second image standing perfectly still and facing the camera, completely expressionless, with hollow black empty eye sockets, slightly faded and grainy like an old 1998 photograph. No blood, no open mouth. Keep his face recognizable. The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

---

## 4. Yükleme

1. Bu sayfayı aç: **https://github.com/efeozbilgin123/FNaM2/upload/main/img/office_v**. Klasör yoksa kendisi oluşur.
2. Kaydettiğin dosyaları sürükle. Adlar tam şöyle olmalı:
   - `door_lit.png`, `door_avukat.png`, `door_closed.png`
   - `vent_lit.png`, `vent_sahil.png`
   - `corr_lit.png`, `corr_pasta1.png`, `corr_pasta2.png`, `corr_pasta3.png`, `corr_sultan.png`, `corr_itsme.png`
3. **Commit changes** de.

Hepsini bitirmen gerekmiyor. Yüklediğin her görseli oyun hemen kullanır, eksikler için eski görüntüler devam eder. Yükleyince bana haber ver: boyutları ayarlar, masa kaymış mı diye kontrol eder, kenar geçişlerini ayarlarım.

**Önerilen sıra:** 1.2 → 2.1 → 2.2 → 3.1 → 3.4 → 1.3 → 3.3 → 3.2 → 3.5 → 3.6
