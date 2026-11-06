# Mırık'la 5 Gece: MORG — Tasarım Dokümanı

> Oyunun adı: **Mırık'la 5 Gece: MORG** · Repo: **FNaM2**
> Tarih: 2026-11-06 · Durum: Taslak, kullanıcı onayı bekliyor

## 1. Özet

- **Tür ve platform:** FNaF türünde, tamamen korku odaklı bir tarayıcı oyunu. 1. oyun "Mırık'la 5 Gece"nin devamı.
- **Oyuncular:** Aynı arkadaş grubu oynayacak. Hepsi tıp öğrencisi; mekân ve terimler onlara tanıdık gelecek.
- **Mizah yok:** Oyun tamamen korku. 1. oyunun espri öğeleri karanlık lore detaylarına dönüşüyor. Örnekler: "PASTAYMIŞ" yazısı duvara kazınmış bir yazı oluyor, "dört-beş-altı" bir sayıma dönüşüyor, miyavlama bir ipucuna dönüşüyor.
- **Mekân:** Bir tıp fakültesinin morg ve anatomi katındaki **Morg Nöbetçi Odası**. Oyuncu bu odada 5 gece hayatta kalmaya çalışan bir tıp öğrencisi.
- **Zorluk hedefi:** 1. oyundan belirgin şekilde zor olacak. Elektrik 1. geceden itibaren gerçek bir tehdit. 5. gece ortalama 10–15 denemede geçilmeli.

## 2. Lore

### Zaman çizelgesi

- **1998, Proje 4-5-6:**
  - 3-4-5 Yayınları ile Birey Koleji gizlice **Uyanık-345** adlı bir uyanıklık ilacı deniyor. Amaç, öğrencilerin hiç uyumadan çalışması.
  - **Denek 4:** Arda Baz. Hasan Emre'nin LoL duo'su.
  - **Denek 5:** Hasan Emre Mırık.
- **İlacın etkisi:**
  - Hasan Emre'yi kişiliklere bölüyor.
  - Arda Baz'ı bölmüyor. Onun yerine Arda bir daha hiç uyuyamıyor ve yaşlanmıyor.
- **1. oyun:**
  - Oyuncu "gece etüt görevlisi" diye işe alınıyor, aslında gözlemci olarak çalışıyor. 5 gece hayatta kalıyor.
  - Sınav sabahı Hasan Emre etüt odasında ölü bulunuyor ve olay örtbas ediliyor.
  - 1. oyunda görülen Arda Baz bir kişilik değil, gerçek Arda'ydı. Bu bir retcon değil, 2. oyunda ortaya çıkan bir gerçek.
- **Lanet:**
  - Beden öldü ama kişilikler yaşıyor.
  - Ceset "kimliği belirsiz kadavra" olarak bölgedeki tıp fakültesine gönderiliyor.
  - O günden beri bölge lanetli: ışıklar sönüyor, kadavralar yer değiştiriyor, gece nöbetindeki öğrenciler kayboluyor.
  - Her kişilik binanın bir bölümüne yerleşmiş durumda.
- **2. oyun (günümüz):**
  - Oyuncu, morg katında gece nöbetine yazılan bir tıp öğrencisi.
  - Deneyi yöneten doktor hâlâ fakültede **Profesör** olarak görev yapıyor.
  - Profesör her gece telefonla "yardımcı" mesajlar bırakıyor.
- **Final:**
  - Kişilikler tek bir bedende birleşmek istiyor ve hedefleri oyuncunun bedeni.
  - 5. gecenin sonunda Profesör'ün gizli kaydı açılıyor: oyuncu, nöbete bilerek yazılmış **Denek 6**.
  - 1. oyunun son cümlesi "3-4-5'in avukatları hâlâ seni arıyor"un cevabı burada veriliyor.

### Profesörün belirsizliği

Profesör 5. geceye kadar kesin olarak kötü görünmemeli. Oynanışta hiçbir mekaniği yok, sadece telefonda konuşuyor.

- 1–3. gecelerde yardımsever görünüyor.
- 4. gecede ağzından yanlış bir cümle kaçıyor.
- 5. gecede gerçek ortaya çıkıyor.

## 3. Oda ve kontroller

Görünüm 1. oyundaki gibi panoramik: fare kenara gelince, ok tuşlarıyla ya da dokunarak sağa sola bakılıyor.

| Yer | Tür | Kontrol | Elektrik |
|---|---|---|---|
| **Sol kapı** | FNaF1 tarzı | Kapı düğmesi, kapı ışığı düğmesi | Kapı kapalıyken sürekli; ışık açıkken sürekli |
| **Orta koridor** | FNaF2 tarzı uzun, karanlık koridor | El feneri (basılı tut) | Fener açıkken |
| **Sağ havalandırma** | FNaF2 tarzı | Havalandırma ışığı (basılı tut) | Işık açıkken |
| **Masa** | Eski CRT güvenlik bilgisayarı ve telefon | Monitörü aç/kapa | Monitör açıkken |
| **Örtü** | FNaF2'deki maskenin karşılığı | Kadavra örtüsünü çekip **ölü taklidi** yapmak | Elektrik yemez |

- **Örtü:** Örtü altındayken başka hiçbir şey yapılamaz ve soğutma ısınmaya devam eder.
- **Elektrik:** Tüm sistem tek jeneratörden besleniyor. Elektrik biterse ışıklar söner, kapı açılır ve 1. oyundaki gibi elektrik kesintisi sahnesi oynar.
- **Arayüz:** Görünüm ve kontroller içeriden hissettirmeli. Düğmeler ve paneller sahnenin parçası gibi durmalı; ekrandaki tek arayüz saat, elektrik ve gece göstergesi olmalı. Bu göstergeler de masadaki cihazların üstünde duracak, 1. oyundaki masa saati gibi.

### Kameralar (CRT monitör)

7 kamera var. Kroki tarzı haritada odalar çizgilerle birbirine bağlı.

1. Koridor
2. Otopsi Salonu
3. **Soğuk Oda (morg dolapları)**
4. Havalandırma A
5. Havalandırma B
6. Arşiv
7. Asansör ve Giriş

**Soğuk Oda kamerası (FNaF2'deki Music Box'ın karşılığı):**
- Ekranda bir **sıcaklık göstergesi** ve **SOĞUT** düğmesi var.
- Düğmeye basılı tutmak ısıyı düşürür ama elektrik harcar.
- Isı her gece biraz daha hızlı yükseliyor.
- %70'in üstünde dolaplar takırdamaya başlıyor. Bu sesli bir uyarı.
- %100'e ulaşırsa **5 numaralı çekmece** açılıyor ve Denek 5 geliyor.

## 4. Karakterler

Hasan Emre'nin kişilikleri **altı** tane: Pasta, Avukat, Sahil, Sayıcı, Mühendis ve Sultan. "Dört… beş… **altı**" sayımı da buna bağlanıyor: altıncı kişilik son kişilik.

| # | Karakter | Ne olduğu | Nereden gelir | İpucu | Nasıl atlatılır | İlk gece |
|---|---|---|---|---|---|---|
| 1 | **Denek 5** | Hasan Emre'nin cesedi | Soğuk Oda, çekmece 5 | Isı göstergesi, takırtı | Soğutmayı sürekli dolu tutmak. Çıkarsa durdurulamaz. | 1 |
| 2 | **Pasta Mırık** | Kişilik | Koridor | Koridorda uzak, orta ve yakın aşamalar | Yakın aşamada fenerle birkaç kez ışık tutmak, geri çekilir | 1 |
| 3 | **Avukat Mırık** | Kişilik | Sol kapı | Kapı ışığında görünür | Kapıyı kapatmak. Kapalı kapıya vurdukça elektrik emer, bir süre sonra gider. | 1 |
| 4 | **Sahil Mırık** | Kişilik | Havalandırma | Islak sürünme sesi, havalandırma ışığında görünür | Ölü taklidi. Gidene kadar örtüyü kaldırmamak gerekir. | 2 |
| 5 | **Sayıcı Mırık** | Kişilik (yeni) | Havalandırma | Sadece ses: "dört… beş…" | "Altı"dan önce örtüyü çekmek. Havalandırma ışığı onu hızlandırır. | 3 |
| 6 | **Arda Baz** | Denek 4, gerçek bir insan | Her yerden (ses) | Diğerlerinin seslerini taklit eder. Taklidin sonunda kısa, bozuk bir **miyav** duyulur. | Taklide tepki vermemek. Her yanlış tepki bir sayaç doldurur, 3. hatada Arda gelir. | 4 |
| 7 | **Mühendis Hasan** | Kişilik (yeni): Hasan'ın olamadığı bilgisayar mühendisi | Güvenlik bilgisayarı | Bir kameraya **sahte görüntü** döndürür. Belirtileri: donmuş saat damgası, tekrar eden kare, köşede belli belirsiz "D5" | O kamerada **YENİDEN BAŞLAT**. Kamera 3 saniye kör kalır. Yaklaşık 25 saniye düzeltilmezse monitörden saldırır. | 3 |
| 8 | **Sultan Mırık Han** | Kişilik | Koridor | Uzaktan motor sesi, koridorda tek bir far | Fener işe yaramaz. Motor sesi duyulunca **elektrik kullanan her şey kapatılmalı**: monitör, ışıklar, fener. Karanlıkta beklenir. | 4 |
| — | **Profesör** | Gerçek bir insan | Telefon | — | Oynanış mekaniği yok | 1 |

### Mühendis Hasan'ın belirsiz kalan ayrıntıları
- Sahte görüntü Soğuk Oda kamerasını da etkileyebilir. Gösterge düşük ısı gösterirken gerçek ısı yükseliyor olabilir. Bu en sinsi tuzak.
- Önerilen sınır: Mühendis aynı anda yalnızca bir kamerayı ele geçirebilsin.

### ITS ME (nadir olay)
- Golden Freddy'nin karşılığı.
- Her gecede düşük bir ihtimalle (yaklaşık %3) şu olaylardan biri yaşanır:
  - kamerada bir an duvara "ITS ME" yazısı belirir;
  - koridorda fenerle bakınca Hasan Emre'nin 1998 fotoğrafı görünür;
  - çok nadiren tam ekran bir Hasan Emre yüzüyle "IT'S ME" yazısı çıkar ve oyun **çökmüş gibi** ana menüye atar.
- Bir gecede en fazla bir kez olur. Bulunca arşive kaydedilir.

## 5. Geceler

Gece süresi 12 AM–6 AM. Saat başına yaklaşık **50 saniye**, gece başına yaklaşık 5 dakika.

| Gece | Aktif karakterler | Belge (gece başında) | Telefon |
|---|---|---|---|
| 1 | Pasta, Avukat, Denek 5 (yavaş) | İşe alım yazısı ve 1998 gazete kupürü | Kontrolleri anlatır, yardımsever |
| 2 | + Sahil | Otopsi raporu: "kimliği belirsiz, 1998'den beri çürümemiş" | Ölü taklidini öğretir |
| 3 | + Sayıcı, + Mühendis Hasan | Proje 4-5-6 deney günlüğü: "Denek 5 bilgisayar mühendisi olmak istiyordu" | Kameralara her zaman güvenmemeyi söyler |
| 4 | + Arda Baz, + Sultan | Denek 4 dosyası ("uyumuyor, yaşlanmıyor") ve 3-4-5 Yayınları ile Profesör arasındaki yazışma | Seslere güvenmemeyi söyler. **Ağzından yanlış bir cümle kaçar** |
| 5 | Hepsi en yüksek seviyede | Oyuncunun adıyla doldurulmuş **Denek 6** formu | Gerçeği söyler |
| 6 | Hepsi, 5. geceden de yüksek | — | Gizli kayıt |
| 7 | **Custom Night** | — | — |

**Açılma sırası:**
- 5. gece bitince final sahnesi ve Profesör'ün gizli kaydı oynar, ardından 6. gece açılır.
- 6. gece bitince Custom Night açılır.

**Custom Night:**
- Her karakterin AI seviyesi 0–20 arasında ayarlanır.
- Hazır ayarlar olacak. En zoru **20/20 modu**: herkes 20'de.
- 20/20 modunu geçmek arşive özel bir ödül ekler: bir fotoğraf ve bir belge.
- Profesör'ün oynanışta mekaniği olmadığı için Custom Night'ta seviyesi ayarlanamaz.

**Kayıt:** İlerleme localStorage'da tutulur: açılan geceler, bulunan belgeler, ITS ME kayıtları ve 20/20 ödülü.

## 6. Zorluk ve denge

1. oyundaki sorun: hiçbir şey yapmasan bile pil yaklaşık 1220 saniye gidiyordu, gece ise 240 saniyeydi. Elektrik bu yüzden hiç tehdit oluşturmuyordu.

**Hedefler:**
- **1. gece:** Dikkatli oynayan biri %30–40 elektrikle bitirir. Dikkatsiz oynayan elektriksiz kalır.
- **2–4. gece:** Yeni mekaniğin geldiği ilk denemede ölmek normal. 2–4 denemede geçilmeli.
- **5. gece:** 10–15 deneme.
- **6. gece ve 20/20:** Çok zor ama imkânsız değil.

**Yöntem:**
- Oyun mantığı (`core.js`) çizimden ayrı yazılacak. Böylece Node'da hızlandırılmış olarak çalışabilir.
- `tools/sim.js` basit bir "iyi oyuncu" botuyla her geceyi yüzlerce kez oynayacak ve kazanma oranını raporlayacak.
- **Hedef bot kazanma oranları:** 1. gece yaklaşık %90, 3. gece yaklaşık %50, 5. gece yaklaşık %10–15.
- Değerler bu simülasyonla ayarlanacak, sonra elle test edilecek.

## 7. Ses

- 1. oyunun ses motoru (Web Audio sentezleyici ve örnek ses oynatma) kullanılacak.
- **Yeni sesler:**
  - morg ambiyansı (kompresör uğultusu, damlayan su)
  - dolap takırtısı
  - ıslak sürünme
  - Sayıcı'nın "dört… beş…" kaydı
  - bozuk miyav
  - motor sesi
  - kamera yeniden başlatma sesi
  - telefon cızırtısı
- **Telefon kayıtları:**
  - Profesör'ü kullanıcının arkadaşı seslendirecek.
  - Kayıtlar: gece 1–5, artı 6. geceden önceki gizli kayıt. Her biri 30–60 saniye.
  - Metinleri ben yazarım. Telefonla, sessiz bir odada kaydedilmesi yeterli.
  - Telefon hattı filtresini, cızırtıyı ve kopmaları ben eklerim.
- **Seslendirmesi gerekebilecek ek kayıtlar** (arkadaşlardan): Sayıcı'nın sayması, Arda Baz'ın miyavlaması.
- **Sayıcı kayıt listesi** (bir arkadaş seslendirecek): "Dört…" ×3, "Beş…" ×3, "Altı." ×2, uzaktan mırıldanma ×1, "Kitapta mı…" ×1, nefes ×1. Ses perdesini düşürme, yankı ve bozulma efektlerini ben eklerim.

## 8. Ekranlar

1. **Ana menü:** Müzikli. Arada bir korkunç yüz glitch'i olur, 1. oyundaki gibi. Menüde Yeni Oyun, Devam, 6. Gece, Custom Night ve Arşiv var.
2. **Gece başı:** Belge ekranı, gazete veya rapor görünümünde, okunduktan sonra geçilir. Ardından "Gece X, 12 AM" yazısı.
3. **Oynanış.**
4. **Ölüm:** Jumpscare ve "Game Over" ekranı. Parazitli, CRT efektli.
5. **Gece sonu:** "6 AM" ekranı.
6. **Final:** Profesör'ün kaydı, Denek 6 formu ve kapanış görseli.
7. **Arşiv:** Bulunan belgeler, ITS ME kayıtları ve 20/20 ödülü.

## 9. Görseller (kullanıcı Gemini ile üretecek)

Ben her biri için ayrı bir prompt yazacağım; liste `PROMPTLAR.md` dosyasında olacak.

- **Oda panoraması (21:9):**
  - Sol kapı boşluğu, orta koridor açıklığı ve sağ havalandırma ızgarası boş ve karanlık olacak.
  - Monitörün ekranı kapalı olacak.
  - Kapı, düğmeler ve monitör içeriğini ben üstüne yerleştireceğim.
- **Koridor:** Fenersiz, fenerli ve fener ışığında Pasta ile Sultan versiyonları.
- **Havalandırma iç görünümü:** Boş, Sahil'li.
- **Sol kapı:** Kapı kaplaması, düğme paneli, kapıda Avukat.
- **7 kamera görüntüsü:** Her birinin boş hali ve karakterli varyasyonları.
- **Diğer:** Örtü kaplaması.
- **Jumpscare görselleri:** Denek 5, Pasta, Avukat, Sahil, Sayıcı, Arda Baz, Mühendis Hasan, Sultan, ITS ME.
- **Belgeler:** 6 belge. Yazılarını ben HTML ile basacağım, görselde sadece kâğıt dokusu olacak.
- **Final görseli.**

Mevcut 1. oyun görselleri (karakter fotoğrafları) Gemini'de düzenlemek için başlangıç olarak kullanılabilir. Arka plan silmeyi ben yaparım (rembg).

## 10. Teknik

- **Temel:**
  - 1. oyunun motoru: tek sayfa HTML/CSS/JS, 1280×720 sahne, panoramik bakış, CRT monitör (bombe efekti), ses motoru, arka planda yükleme, localStorage.
  - Kullanıcının 1. oyunda yaptığı CRT ve monitör geçişi düzenlemeleri de korunacak.
- **Dosyalar:**
  - `index.html`: arayüz ve çizim
  - `core.js`: saf oyun mantığı (durum, AI, elektrik), Node'da da çalışır
  - `audio.js`
  - `img/`, `sfx/`, `voice/`
  - `tools/sim.js`
- **Yayın:**
  - Yeni GitHub reposu. Adını kullanıcı belirleyecek ve repoyu kendisi açacak.
  - GitHub Pages ile yayınlanacak.
  - Commit'lerde Claude co-author olarak yer almayacak.

## 11. Kapsam dışı (şimdilik)

- Mini oyunlar (FNaF2'deki 8-bit ölüm sahneleri gibi)
- Mobil için ayrı bir düzen. Dokunmatik kaydırma çalışacak ama mobil için ayrıca optimize edilmeyecek.
- Çoklu dil

## 12. Açık konular

- Miyav sesi: bir arkadaş mı kaydedecek, yoksa sentezle mi yapılacak? Kayıt gelmezse sentezle yapılır.

**Kararlaştırılanlar:**
- Oyunun adı: Mırık'la 5 Gece: MORG
- Repo: FNaM2
- Profesör'ün adı yok, oyunda sadece "Profesör" diye geçiyor.
- Sayıcı'yı bir arkadaş seslendirecek (bkz. §7).
