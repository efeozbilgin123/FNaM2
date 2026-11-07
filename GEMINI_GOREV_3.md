# GÖREV 3: Eksik ofis versiyonlarını üret, işle ve repoya yükle

Sen bu repoda (`efeozbilgin123/FNaM2`) çalışan bir yapay zekâ ajansın. Görevin aşağıdaki görselleri image-edit (görsel düzenleme) modeliyle üretmek, verilen betikle işlemek, kontrol etmek ve push etmek. **Oyunun koduna dokunma.**

## 0. Kurallar

1. Sadece şu klasörlere dosya yaz:
   - `img/office_v_raw/`
   - `img/office_v/`
   - `img/cam/`
   - Bitirince ayrıca `img/office_v/URETIM_RAPORU_3.md` yaz.
   - Başka hiçbir dosyayı değiştirme.
2. **Her görsel bir DÜZENLEME:** Verilen TEMEL görseli girdi olarak ver, gerekiyorsa karakter referansını ikinci girdi olarak ekle, sonra promptu yaz. Asla sıfırdan üretme.
3. **Girdi sırası:** Önce TEMEL görsel, sonra karakter referansı, en son metin.
4. **Çıktı yatay olmalı.** Model izin veriyorsa en-boy oranını **21:9** seç. Dikey ya da kare çıkarsa yeniden üret.
5. Her prompta SON EK'i ekle (aşağıda).
6. **Commit mesajı:** `Görseller: ofis versiyonları 3`. Yapay zekâ co-author satırı ekleme. Sonunda `git push origin main`.

### SON EK (her promptun sonuna)
```
The output must be a wide landscape image with exactly the same size and aspect ratio as the first image, never portrait. Keep the exact same camera angle, framing, composition and every other object in the image identical, including the wall monitor, the button panel and the light switch. Only change the described area. Photorealistic, same lighting and color grading as the original. No text.
```

## 1. Hazırlık

```bash
git pull origin main
pip install pillow numpy
```

### Temel görseller (repoda)

| Kod | Dosya |
|---|---|
| OFİS | `img/office.png` (düğmeli, duvar ekranlı ofis; 2000×848) |
| KAPI-IŞIK | `img/office_v_raw/door_lit.png` |
| KORİDOR-IŞIK | `img/office_v_raw/corr_lit.jpg` |
| HAVALANDIRMA-IŞIK | `img/office_v_raw/vent_lit.jpg` |

### Karakter referansları (repoda, geniş zeminli)

`img/ref/avukat_genis.png`, `img/ref/sahil_genis.png`, `img/ref/pasta_genis.png`, `img/ref/sultan_genis.png`, `img/ref/hasan_genis.png`

## 2. Üretilecekler

Her çıktıyı **`img/office_v_raw/<ad>.png`** olarak kaydet. Boyut ya da oran farklı olabilir, işleme betiği düzeltir.

| # | Ad | TEMEL | Ref | Prompt (+ SON EK) |
|---|---|---|---|---|
| 1 | `door_avukat` | KAPI-IŞIK | avukat_genis | Edit the first image. Put the man from the second image into the lit doorway on the far left: he stands just beyond the threshold in the lit hallway, half leaning into the room, wearing a black suit with a red tie pulled tight like a noose, holding a thick folder against his chest. Make him terrifying: pale grey skin, completely black glossy eyes with no whites, thin streams of blood running from the eyes, a wide unnatural grin. Keep his face recognizable. He stays INSIDE the doorway frame, is life-size and no larger than the doorway, lit by the cold hallway light, with correct perspective. |
| 2 | `vent_sahil` | HAVALANDIRMA-IŞIK | sahil_genis | Edit the first image. Put the man from the second image inside the lit ventilation duct opening in the bottom right corner: he is crawling toward the room on his stomach, only his head, shoulders and one hand visible at the opening, the rest of his body still inside the duct. He is soaking wet, wearing the same grey coat, wet hair plastered to his face, seawater and seaweed dripping. Make him terrifying: pale grey wet skin, completely black glossy eyes, head twisted at an unnatural angle. Keep his face recognizable. Nothing of him is outside the duct frame except his hand on the edge. |
| 3 | `corr_pasta1` | KORİDOR-IŞIK | pasta_genis | Edit the first image. Far away at the very end of the flashlight-lit corridor inside the central arch, add the man from the second image, small in the distance, standing perfectly still and facing the camera, holding a slice of green pistachio cake. Only his silhouette and pale face are visible. He stays inside the arch. |
| 4 | `corr_pasta2` | KORİDOR-IŞIK | pasta_genis | Edit the first image. Halfway down the flashlight-lit corridor inside the central arch, add the man from the second image standing in the beam of light, wearing the same beige t-shirt, his head tilted unnaturally, holding a rotten slice of green pistachio cake dripping onto the floor. Make him terrifying: pale grey skin, completely black glossy eyes, blood running from the eyes. Keep his face recognizable. He stays inside the arch with correct perspective and size. |
| 5 | `corr_pasta3` | KORİDOR-IŞIK | pasta_genis | Edit the first image. Right at the entrance of the central arch, just behind the desk, add the man from the second image, close and large, filling most of the arch opening, lit harshly by the flashlight, mouth stretched open in a scream, holding a rotten slice of green pistachio cake toward the camera. Make him terrifying: pale grey skin, completely black glossy eyes, blood running from the eyes. Keep his face recognizable. The desk and the computer monitor stay in front of him and unchanged; he stays inside the arch. |
| 6 | `corr_sultan` | OFİS | sultan_genis | Edit the first image. Inside the dark arched opening in the center, add the man from the second image as an undead Ottoman sultan in his jeweled turban and fur cloak, riding the white motorcycle straight toward the room down the corridor, one blinding headlight glaring out of the arch and throwing harsh white light onto the floor of the room. His face is barely visible behind the light, with completely black eyes and a wide unnatural grin. The desk and computer monitor stay in front. He stays inside the arch. |
| 7 | `corr_itsme` | KORİDOR-IŞIK | hasan_genis | Edit the first image. At the far end of the flashlight-lit corridor inside the central arch, add the young man from the second image standing perfectly still and facing the camera, completely expressionless, with hollow black empty eye sockets, slightly faded and grainy like an old 1998 photograph. No blood, no open mouth. Keep his face recognizable. He stays inside the arch. |

### Ek: iki kamera görüntüsünü yeniden yap (640×360)

Bunlar daha önce fotoğraf birleştirmeyle yapılmıştı ve yapıştırılmış gibi duruyor. TEMEL görsel olarak aynı kameranın boş halini ver.

| # | Dosya | TEMEL | Ref | Prompt |
|---|---|---|---|---|
| 8 | `img/cam/cold_open.png` | `img/cam/cold.png` | hasan_genis | Edit the first image (a grainy black and white CCTV frame of a morgue cold room). Drawer number five in the middle row is now fully pulled out, and a pale naked corpse with a stitched autopsy Y-incision, the young man from the second image, sits upright on it, staring straight up into the camera with black eyes. Keep the same CCTV look, camera angle, grain and every other object identical. No text. |
| 9 | `img/cam/autopsy_pasta.png` | `img/cam/autopsy.png` | pasta_genis | Edit the first image (a grainy black and white CCTV frame of an autopsy room). Add the man from the second image standing beside the steel autopsy table, holding a slice of cake, his head tilted up toward the camera, pale with black eyes. He must look like part of the same CCTV footage: same grain, same lighting, correct size and perspective. Keep everything else identical. No text. |

Kamera görüntülerini doğrudan hedef yola kaydet: tam **640×360**, PNG. Gerekirse ortadan kırpıp ölçekle.

## 3. İşleme

Bütün ofis versiyonları bitince şunu çalıştır:

```bash
python3 tools/variants.py door_avukat vent_sahil corr_pasta1 corr_pasta2 corr_pasta3 corr_sultan corr_itsme
```

- Betik her görseli 2000×848'e getirir, orijinal ofisle karşılaştırıp sadece değişen kısmı bırakır ve `img/office_v/<ad>.png` olarak yazar.
- Her satırda bir "değişen alan" yüzdesi yazar.
- **Kontrol:** Yüzde %2 ile %15 arasında olmalı.
  - %20'den büyükse görselin geneli değişmiş, kamera açısı kaymış demektir. O görseli yeniden üret.
  - %1'den küçükse karakter eklenmemiş demektir.

## 4. Rapor ve push

`img/office_v/URETIM_RAPORU_3.md` dosyasına her görsel için tek satır yaz: ad, deneme sayısı, değişen alan yüzdesi, varsa sorun.

```bash
git add img/office_v_raw img/office_v img/cam
git commit -m "Görseller: ofis versiyonları 3"
git push origin main
```

Push'tan önce `git status` ile bu üç klasörün dışında hiçbir dosyanın değişmediğinden emin ol.
