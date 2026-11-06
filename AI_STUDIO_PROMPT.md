Bu repo bir tarayıcı korku oyunu ("Mırık'la 5 Gece: MORG"). Oyunun koduna DOKUNMA. Senden, ofis arka plan fotoğrafının düzenlenmiş 10 versiyonunu üreten küçük bir araç sayfası istiyorum.

## Yapılacak araç

Repoya YENİ bir sayfa ekle: `tools/office_variants.html` (ve gerekiyorsa yanına bir .js dosyası). Mevcut dosyaların hiçbirini değiştirme (index.html, game.js, core.js, audio.js, nights.js, save.js, img/ altındaki mevcut dosyalar, tests/, docs/).

Sayfa şunları yapsın:

1. Repodaki görselleri yüklesin:
   - `img/office.png` (2000×848, ana ofis fotoğrafı)
   - `img/office_v/door_lit.png` (hazır versiyon, aşağıda temel olarak kullanılacak)
   - Karakter referansları (geniş zeminli): `img/ref/avukat_genis.png`, `img/ref/sahil_genis.png`, `img/ref/pasta_genis.png`, `img/ref/sultan_genis.png`, `img/ref/hasan_genis.png`
2. Aşağıdaki görevleri Gemini API'nin görsel düzenleme modeliyle SIRAYLA çalıştırsın. Erişilebilen en güçlü görsel modeli kullan (Nano Banana Pro / Gemini 3 Pro Image ya da daha yenisi). Bulamazsan Gemini 2.5 Flash Image.
   - Her çağrıda `responseModalities: ["IMAGE"]` ve `imageConfig: { aspectRatio: "21:9" }` ver. Çıktı her zaman geniş yatay olmalı.
   - Girdi sırası: önce "TEMEL" görsel, sonra varsa karakter referansı, en son metin promptu.
   - "TEMEL" başka bir görevin çıktısıysa, o görev bitmeden başlama.
3. Her çıktıyı tarayıcıda canvas ile tam **2000×848** boyutuna getirsin. Oran farklıysa ortadan kırpıp ölçeklesin.
4. Kalite kontrolü:
   - Her çıktıyı `img/office.png` ile karşılaştırsın: aşağıdaki "DEĞİŞMEMELİ" bölgelerinde piksel başına ortalama mutlak RGB farkını hesaplasın.
   - Fark 22'den büyükse görevi en fazla 2 kez daha denesin ve en düşük farklı sonucu tutsun.
   - DEĞİŞMEMELİ bölgeler (2000×848 koordinatlarında x0,y0,x1,y1):
     - masa: `1000,600,1600,848`
     - monitör: `620,490,870,700`
     - poster: `1200,225,1330,395`
   - Ayrıca görevin kendi bölgesi dışında kalan büyük bölgeleri de kontrol etsin:
     - kapı görevlerinde kemer `860,110,1140,560` ve havalandırma `1650,520,1950,820`
     - havalandırma görevlerinde kapı `400,80,575,670` ve kemer
     - koridor görevlerinde kapı ve havalandırma
5. Sonuçları ızgara halinde göstersin. Her kartta şunlar olsun: görsel, dosya adı, fark puanı, "Yeniden üret" düğmesi.
6. **"Hepsini indir (ZIP)"** düğmesi olsun. ZIP'in içinde dosyalar `img/office_v/<ad>.png` yolunda dursun. Dosya adları aşağıdaki tablodakilerle birebir aynı olmalı.
7. Eğer ortamın repoya dosya yazma izni varsa, onaylanan görselleri doğrudan `img/office_v/` klasörüne de kaydetsin. Başka hiçbir klasöre yazmasın.

## Her prompta eklenecek son cümle (SON EK)

```
The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

## Görevler (bu sırayla)

| # | Ad | TEMEL | Karakter ref | Prompt (+ SON EK) |
|---|---|---|---|---|
| 1 | `door_avukat` | `img/office_v/door_lit.png` | avukat_genis | Edit the first image. Put the man from the second image into the lit doorway on the far left: he stands in the doorway, half leaning into the room, wearing a black suit with a red tie pulled tight like a noose, holding a thick folder against his chest. Make him terrifying: pale grey skin, completely black glossy eyes with no whites, thin streams of blood running from the eyes, a wide unnatural grin. Keep his face recognizable. He must be lit by the same cold light from the hallway, be life-size and fit inside the doorway with correct perspective. |
| 2 | `door_closed` | `img/office.png` | — | Edit this photo. The open doorway on the far left wall is now completely closed by a heavy dented stainless steel morgue door that fills the door frame exactly and follows its perspective, with a small round porthole window near the top and a faded biohazard sticker. |
| 3 | `vent_lit` | `img/office.png` | — | Edit this photo. The large rectangular ventilation duct opening low on the right wall, in the bottom right corner, is now lit from inside by a small harsh light, revealing the dusty dented galvanized metal inside of the duct going back into darkness and a trickle of dark water along its floor. The duct is empty. |
| 4 | `vent_sahil` | çıktı #3 (`vent_lit`) | sahil_genis | Edit the first image. Put the man from the second image inside the lit ventilation duct opening in the bottom right corner: he is crawling out of the duct on his stomach toward the room, head and shoulders coming out of the opening, soaking wet, wearing the same grey coat, wet hair plastered to his face, seawater and seaweed dripping onto the floor. Make him terrifying: pale grey wet skin, completely black glossy eyes, his head twisted at an unnatural angle. Keep his face recognizable. He must fit inside the duct with correct perspective and size. |
| 5 | `corr_lit` | `img/office.png` | — | Edit this photo. The dark arched opening in the center of the back wall is now lit by a single circular flashlight beam shining straight into it, revealing a long narrow abandoned hospital basement corridor behind the arch: cracked white tiles, an old gurney against the left wall, a fallen IV stand, puddles reflecting the light, fading into darkness at the far end. The corridor is empty. Everything outside the arch stays exactly the same, and the desk and computer monitor stay in front. |
| 6 | `corr_pasta1` | çıktı #5 (`corr_lit`) | pasta_genis | Edit the first image. Far away at the very end of the flashlight-lit corridor inside the central arch, add the man from the second image, small in the distance, standing perfectly still and facing the camera, holding a slice of green pistachio cake. Only his silhouette and pale face are visible. |
| 7 | `corr_pasta2` | çıktı #5 (`corr_lit`) | pasta_genis | Edit the first image. Halfway down the flashlight-lit corridor inside the central arch, add the man from the second image standing in the beam of light, wearing the same beige t-shirt, his head tilted unnaturally, holding a rotten slice of green pistachio cake dripping onto the floor. Make him terrifying: pale grey skin, completely black glossy eyes, blood running from the eyes. Keep his face recognizable. He must be inside the corridor with correct perspective and size. |
| 8 | `corr_pasta3` | çıktı #5 (`corr_lit`) | pasta_genis | Edit the first image. Right at the entrance of the central arch, just behind the desk, add the man from the second image, close and large, filling most of the arch opening, lit harshly by the flashlight, mouth stretched open in a scream, holding a rotten slice of green pistachio cake toward the camera. Make him terrifying: pale grey skin, completely black glossy eyes, blood running from the eyes. Keep his face recognizable. The desk and the computer monitor must stay in front of him and unchanged. |
| 9 | `corr_sultan` | `img/office.png` | sultan_genis | Edit the first image. Inside the dark arched opening in the center, add the man from the second image as an undead Ottoman sultan in his jeweled turban and fur cloak, riding the white motorcycle straight toward the room down the corridor, one blinding headlight glaring out of the arch and throwing harsh white light onto the floor of the room. His face is barely visible behind the light, with completely black eyes and a wide unnatural grin. The desk and computer monitor stay in front. |
| 10 | `corr_itsme` | çıktı #5 (`corr_lit`) | hasan_genis | Edit the first image. At the far end of the flashlight-lit corridor inside the central arch, add the young man from the second image standing perfectly still and facing the camera, completely expressionless, with hollow black empty eye sockets, slightly faded and grainy like an old 1998 photograph. No blood, no open mouth. Keep his face recognizable. |

## Bittiğinde

- Sayfayı çalıştır ve 10 görevi üret.
- Bana her görselin fark puanını listele.
- Onaylanan görselleri `img/office_v/` klasörüne kaydet ya da ZIP olarak ver.
- Commit atacaksan mesajı `Görseller: ofis versiyonları` olsun ve sadece `img/office_v/` ile `tools/office_variants.*` dosyalarını içersin. Yapay zekâ co-author satırı ekleme.
