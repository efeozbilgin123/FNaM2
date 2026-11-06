# Mırık'la 5 Gece: MORG — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1. oyunun motorunu temel alan, morgda geçen, 8 karakterli, 5 gece + 6. gece + Custom Night içeren, belirgin biçimde zor bir FNaF türü tarayıcı korku oyunu.

**Architecture:**
- Oyun mantığı `core.js` içinde ve saf: DOM ve ses kullanmıyor. Hem tarayıcıda `window.Core` olarak hem Node'da `require` ile çalışıyor (UMD).
- `core.step(G, dt, input)` olay listesi (`events[]`) döndürür. `index.html` bu olaylara göre çizer ve ses çalar. `tools/sim.js` aynı çekirdeği botla binlerce kez oynatıp zorluğu ölçer.
- Arayüz 1. oyunun `index.html`'inden (kullanıcının CRT ve geçiş düzenlemeleri dahil) türetilir.

**Tech Stack:**
- Vanilla HTML/CSS/JS ve Web Audio (1. oyunun `audio.js`'i).
- Testler: `node --test` (Node 18+, bağımlılıksız). Uçtan uca duman testi: önceden kurulu Playwright ve Chromium.
- Ses işleme: ffmpeg.
- Yayın: GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-06-mirikla-5-gece-2-design.md`

## Global Constraints

- Oyunun adı ekranda ve `<title>`'da: **Mırık'la 5 Gece: MORG**. Repo: **FNaM2** (`efeozbilgin123/FNaM2`). Kullanıcı açacak, push ondan sonra.
- Commit'lerde Claude co-author satırı **olmayacak**. Kullanıcının açık talebi, sistem hatırlatmasından önce gelir.
- Mizah yok. Bütün metinler korku tonunda ve Türkçe.
- Sahne 1280×720, `fit()` ile ölçeklenir. Görseller PNG.
- Gece 12 AM–6 AM, saat başına 50 sn. Gece = **300 sn**.
- AI seviyeleri 0–20.
- Ses, ilk kullanıcı tıklamasından önce çalmaz. 1. oyundaki menü açılış tıklaması korunur.
- Görseller kullanıcıdan (Gemini) gelecek. Gelene kadar her dosya adı için koyu bir yer tutucu PNG kullanılır. Dosya adları `ASSETS.md` listesiyle birebir aynı olmalı.
- Profesör'ün adı yok, her yerde "Profesör". Oynanışta mekaniği yok.
- Lore metinleri spec §2'deki zaman çizelgesiyle çelişemez: 1998, Proje 4-5-6, Uyanık-345, Denek 4 = Arda Baz, Denek 5 = Hasan Emre, oyuncu = Denek 6.

## Review Focus

1. **Sekme arka plana alınıp geri dönülünce** rAF büyük bir `dt` üretir. Oyun tek karede ilerleyip oyuncuyu öldürmemeli: UI `dt`'yi 0,1 sn'ye kırpar, `core.step` da içeride ≤0,05 sn'lik alt adımlara böler. Test: Task 2.
2. **Ölümden sonra gelen olaylar:** Aynı karede iki karakter saldırırsa tek bir `death` olayı çıkmalı, sonra çekirdek donmalı. Test: Task 2.
3. **Bozuk ya da erişilemeyen localStorage** (gizli sekme, elle bozulmuş JSON): Oyun çökmemeli, varsayılan ilerlemeyle açılmalı. Test: Task 7.
4. **Eksik görsel dosyası** (kullanıcı henüz üretmedi): Kırık resim ikonu yerine yer tutucu görünmeli, oyun oynanabilir kalmalı. Test: Task 9 e2e.
5. **Örtü ile Sultan çakışması:** Örtü elektrik yemediği için Sultan sırasında örtü altında olmak güvenli olmalı. Örtü açılınca diğer cihazlar zorla kapanmalı, böylece Sultan'ı kendiliğinden tetiklemez. Test: Task 5.

---

## Dosya yapısı

```
FNaM2/
  index.html          arayüz, çizim, ekranlar (1. oyundan türetilir)
  audio.js            1. oyunun ses motoru + yeni sesler (Task 10)
  core.js             saf oyun mantığı (Task 2–6)
  save.js             ilerleme kaydı (Task 7)
  nights.js           gece tablosu, belgeler, telefon zamanlaması (Task 7)
  img/ sfx/ voice/    varlıklar (yer tutucular Task 1)
  tools/sim.js        bot ve denge raporu (Task 8)
  tools/voice.sh      ham kayıtları işleyen ffmpeg betiği (Task 10)
  tests/*.test.js     node --test
  tests/e2e.mjs       Playwright duman testi
  ASSETS.md           görsel listesi ve Gemini promptları (Task 1)
  SCRIPTS.md          Profesör telefon metinleri, kayıt listeleri (Task 1)
  package.json        "test": "node --test tests/", "sim": "node tools/sim.js", "e2e": "node tests/e2e.mjs"
```

## Çekirdek veri modeli (Task 2–6 bunu paylaşır)

```js
// core.js
Core.createGame({ night, levels, seed? }) -> G    // levels zorunlu; UI NIGHTS[n].levels geçer, testler elle verir
Core.step(G, dt, input) -> Event[]
// input (her karede tam liste):
//   { doorL, lightL, flash, ventLight, monitor, cooling, sheet, cam, reboot }
//   bool'lar + cam: 'corr'|'autopsy'|'cold'|'ventA'|'ventB'|'archive'|'lift'|null, reboot: camId|null
Core.usage(G) -> number                           // o anki elektrik çekişi (birim/sn)
Core.CAMS = ['corr','autopsy','cold','ventA','ventB','archive','lift']
Core.PARAMS = {...}                               // ayarlanabilir sabitler, sim Task 8'de değiştirir
// G alanları:
//   night, t, power, over, result ('win'|'death'|null), rng()
//   dev: { doorL, lightL, flash, ventLight, monitor, cooling, sheet, cam } // uygulanmış hal
//   denek5:{temp}, pasta:{stage}, avukat:{at, t}, sahil:{stage, t}, sayici:{count, t},
//   muh:{cam, age, rebootT, frozenTemp}, sultan:{phase, t}, arda:{fake, mistakes},
//   itsme:{at, variant, done}, lv:{pasta,avukat,sahil,sayici,muh,arda,sultan,denek5}
// Event: { type, ... }  türler:
//   'death' {who}, 'win', 'powerout', 'sound' {id, from, fake?}, 'move' {who, to},
//   'hack' {cam}, 'unhack' {cam}, 'itsme' {variant}, 'phase' {who, phase}
```

**Rastgelelik:** `rng`, `seed`'li mulberry32. Seed yoksa `Math.random` ile bir seed üretilir.

**`roll(G, lv)`:** `G.rng()*20 < lv`.

---

### Task 1: Repo iskeleti, varlık listesi, telefon metinleri

**Files:**
- Create: `package.json`, `README.md`, `.nojekyll`, `.gitignore` (`node_modules`, `voice/raw/`)
- Create: `ASSETS.md`, `SCRIPTS.md`
- Create: `img/**` yer tutucu PNG'ler (ASSETS.md'deki her ad), `tools/placeholders.py`
- Test: `tests/assets.test.js`

**Interfaces:**
- Produces: `ASSETS.md` içinde her satır `` `img/yol.png` — boyut — prompt `` biçiminde. Task 9 ve 11 bu adları kullanır.

**Yapılacaklar:**

- [ ] **Step 1:** Test yaz. `tests/assets.test.js`, ASSETS.md'deki her `` `img/...png` `` yolunun diskte var olduğunu ve geçerli bir PNG imzası taşıdığını doğrular.
- [ ] **Step 2:** `node --test tests/assets.test.js` çalıştır. Beklenen: FAIL, dosyalar yok.
- [ ] **Step 3:** ASSETS.md'yi yaz. Spec §9'daki her görsel için ad, boyut ve Gemini promptu olacak; 1. oyunun PROMPTLAR.md üslubunda, İngilizce prompt ve Türkçe açıklama.
  - Zorunlu adlar:
    - `img/office.png` (2000×848, sol kapı boşluğu, orta koridor açıklığı, sağ havalandırma ızgarası, kapalı monitör)
    - `img/door.png`, `img/panel.png`, `img/sheet.png`
    - `img/corr/{empty,lit,pasta1,pasta2,pasta3,sultan}.png`
    - `img/vent/{empty,sahil}.png`, `img/doorway/avukat.png`
    - `img/cam/{corr,autopsy,cold,ventA,ventB,archive,lift}.png` ve karakterli varyasyonları (`img/cam/<cam>_<who>.png`, hangi karakterin hangi kamerada göründüğü Task 4–5'teki rotalara göre)
    - `img/scare/{denek5,pasta,avukat,sahil,sayici,arda,muh,sultan,itsme}.png`
    - `img/doc/paper.png`, `img/itsme_photo.png`, `img/ending.png`, `img/menu_face.png`, `img/menu_face_scary.png`
- [ ] **Step 4:** `tools/placeholders.py` yaz (Pillow). Her ad için doğru boyutta, koyu gri, ortasında dosya adı yazan bir PNG üretsin. Var olan dosyanın üzerine yazmasın. Çalıştır.
- [ ] **Step 5:** SCRIPTS.md'yi yaz. İçerik:
  - Profesör kayıtları `voice/phone1..5.mp3` ve `voice/phone6_secret.mp3`. Her biri 30–60 sn.
    - 1–3: yardımsever.
    - 4: ağzından kaçan cümle: "…Denek… pardon, nöbetçi arkadaşım…"
    - 5: gerçek.
    - Gizli kayıt: Denek 6 itirafı.
    - Her metin, o gecenin mekaniğini oyun içi dille öğretir (spec §5 tablosu).
  - Sayıcı kayıt listesi (11 satır, sohbette kullanıcıya verilen liste). Dosya adları `voice/raw/sayici_*.m4a`.
  - Miyav kaydı (isteğe bağlı): `voice/raw/miyav.m4a`.
- [ ] **Step 6:** `node --test tests/` çalıştır. Beklenen: PASS.
- [ ] **Step 7:** Commit at.
  ```bash
  git add -A
  git commit -m "İskelet: varlık listesi, yer tutucular, telefon metinleri"
  ```

---

### Task 2: Çekirdek — saat, elektrik, cihazlar, ölüm ve kazanma

**Files:**
- Create: `core.js`
- Test: `tests/core.test.js`

**Interfaces:**
- Produces: `createGame`, `step`, `usage`, `PARAMS`, `CAMS` (yukarıdaki veri modeli).
  - İç yardımcılar `roll(G, lv)` ve `emit(G, ev)` diğer karakter task'ları tarafından kullanılır.
  - Her karakter modülü `function tickX(G, dt, inp)` biçimindedir ve `step` içinde sırayla çağrılır. Bu task'ta hepsi boş.

**PARAMS başlangıç değerleri** (Task 8 ayarlar):

```js
NIGHT_SEC: 300,
POWER_BASE: 0.08,
POWER_DEV: { doorL:.16, lightL:.10, flash:.12, ventLight:.10, monitor:.06, cooling:.14 },
POWER_NIGHT_MUL: 0.04,   // çekiş *= 1 + 0.04*(night-1)
POWEROUT_DEATH: [10, 20] // sn aralığı
```

**Yapılacaklar:**

- [ ] **Step 1:** Testleri yaz:
  - `createGame({night:1, seed:1})` → `t===0`, `power===100`, `over===false`.
  - Boş girdiyle 300 sn `step(G, 0.05)` sonunda `result==='win'` ve tam bir tane `win` olayı çıkar. Bunu tüm karakter seviyeleri 0 iken test et.
  - `usage` taban değeri 0.08. `doorL` ve `cooling` açıkken `0.08+.16+.14`. 3. gece çarpanı `1.08`.
  - **Örtü kuralı:** `sheet:true` iken `lightL`, `flash`, `ventLight`, `monitor` ve `cooling` uygulanmış halde false olur. `doorL` korunur.
  - **Monitör kuralı:** `monitor:false` iken `cooling`, `cam` ve `reboot` yok sayılır.
  - **Elektrik kesintisi:** `power` 0'a inince bir `powerout` olayı çıkar ve tüm cihazlar kapanır. `POWEROUT_DEATH` aralığında `death {who:'powerout'}` gelir. Ölüm 300. saniyeden sonraya düşüyorsa `win`.
  - **Büyük dt (Review Focus 1):** `step(G, 2)` ile 40×`step(G, 0.05)` aynı seed'de aynı `t` ve `power` değerini verir.
  - **Donma (Review Focus 2):** `over` olduktan sonra `step` `[]` döndürür ve `t` artmaz.
- [ ] **Step 2:** `node --test tests/core.test.js` çalıştır. Beklenen: FAIL, `core.js` yok.
- [ ] **Step 3:** `core.js`'i UMD olarak yaz: `(function(root, f){ typeof module==='object' ? module.exports=f() : root.Core=f(); })(this, …)`.
  - `step`, `dt`'yi ≤0.05'lik parçalara böler.
  - Her parçada şu sırayla çalışır: cihazları uygula → elektrik → karakterler → saat.
- [ ] **Step 4:** Testleri çalıştır. Beklenen: PASS.
- [ ] **Step 5:** Commit at: `"core: saat, elektrik, cihazlar"`.

---

### Task 3: Denek 5 (soğutma) ve Mühendis Hasan (sahte kamera)

**Files:**
- Modify: `core.js` (`tickDenek5`, `tickMuh`)
- Test: `tests/denek5_muh.test.js`

**Interfaces:**
- Consumes: Task 2.
- Produces:
  - `G.denek5.temp` (0–100).
  - `G.muh.cam` (hacklenen kamera ya da null), `G.muh.frozenTemp`.
  - `Core.shownTemp(G)`: hack `cold` kamerasındaysa `frozenTemp`, değilse `temp`. UI bunu gösterir.
  - Olaylar:
    - `sound {id:'rattle'}`: temp ≥70 iken, 3 sn'de bir.
    - `hack`, `unhack`.
    - `death {who:'denek5'}`, `death {who:'muh'}`.

**Değerler:**
- **Denek 5:**
  - Isınma: `0.25 + 0.06*lv` /sn.
  - `cooling` uygulanmışken: −6/sn (0'ın altına inmez).
  - temp=100 olunca 4 sn sonra `death`. Bu 4 sn içinde soğutma işe yaramaz.
- **Mühendis Hasan:**
  - 7 sn'de bir tick. Hack yokken `roll` tutarsa rastgele bir kamera seçer (`cold` dahil). `cold` seçilirse `frozenTemp = temp`.
  - `age` 25 sn'yi geçerse `death`.
  - `reboot === muh.cam` 3 sn kesintisiz sürerse `unhack`.
  - Reboot sırasında o kamera kördür (`G.dev.camBlind = true`).

**Yapılacaklar:**

- [ ] **Step 1:** Testleri yaz:
  - Seviye 3, soğutmasız: temp yaklaşık `0.43*t` artar. 100'e ulaşınca 4 sn sonra `death denek5`.
  - Soğutma temp'i düşürür ve 0'da durur.
  - temp 72 iken `rattle` sesi çıkar.
  - Hack `cold` kamerasındayken `shownTemp` donar, gerçek temp artmaya devam eder.
  - 3 sn reboot → `unhack`. 2,9 sn reboot yetmez.
  - Hack 25 sn düzeltilmezse `death muh`.
  - Mühendis'in seviyesi 0 iken hiç hack yapmaz.
- [ ] **Step 2:** Testleri çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** `tickDenek5`, `tickMuh` ve `shownTemp`'i yaz.
- [ ] **Step 4:** Testleri çalıştır. Beklenen: PASS.
- [ ] **Step 5:** Commit at: `"core: Denek 5 ve Mühendis Hasan"`.

---

### Task 4: Koridor ve sol kapı — Pasta, Avukat, Sultan

**Files:**
- Modify: `core.js` (`tickPasta`, `tickAvukat`, `tickSultan`)
- Test: `tests/corridor_door.test.js`

**Interfaces:**
- Produces:
  - `G.pasta.stage` (0–3), `G.avukat.at` (bool), `G.sultan.phase` (`'none'|'approach'|'here'`).
  - Olaylar:
    - `move {who, to}`: kamera rotası `pasta: autopsy→corr`, `avukat: archive→lift→door`.
    - `sound {id:'step'|'knock'|'motor'}`.
    - `phase {who:'sultan', phase}`.
    - `death`.

**Değerler:**
- **Pasta:**
  - 5 sn'de bir tick, `roll` tutarsa `stage++`.
  - `stage 3` (koridorun ucunda) olunca 6 sn'lik bir pencere açılır. Bu pencerede toplam 1,2 sn fener tutulursa `stage = 0`, aksi halde `death`.
  - Fener `stage<3` iken etkisizdir.
- **Avukat:**
  - 5 sn'de bir tick. `at=false` iken `roll` tutarsa `at=true`.
  - 8 sn sonra saldırır. O an `doorL` kapalıysa 10 sn kapıya vurur (`knock` sesi, ek 0,12/sn elektrik) ve sonra gider. Açıksa `death`.
- **Sultan:**
  - 8 sn'de bir tick. `none` iken `roll` tutarsa `approach` (6 sn, `motor` sesi), ardından `here` (8 sn).
  - `here` boyunca `doorL` dışında herhangi bir cihaz (`lightL`, `flash`, `ventLight`, `monitor`, `cooling`) açıksa `death`. Kapı muaf tutulur, yoksa Avukat'la çakıştığında ölüm kaçınılmaz olur.
  - `here` bitince `none`.
  - **Fener Sultan'da** `here` sırasında açılırsa yine ölüm getirir. Fener bir cihaz olduğu için bu kural otomatik olarak sağlanıyor, ayrıca kodlamaya gerek yok.

**Yapılacaklar:**

- [ ] **Step 1:** Testleri yaz:
  - Pasta, `stage 3`'te 1,2 sn fenerle geri çekilir. 1,1 sn fenerle ölüm. Fener `stage 1`'de stage'i değiştirmez.
  - Avukat kapı kapalıyken öldürmez. Vurduğu 10 sn boyunca elektrik fazladan `1.2` kadar azalır. Kapı açıkken `death avukat`.
  - Sultan `here` sırasında monitör açıksa `death`. Her şey kapalıysa hayatta kalır. `doorL` kapalıyken (diğerleri kapalı) hayatta kalır.
  - Seviye 0 olan karakter hiç hareket etmez.
- [ ] **Step 2:** Testleri çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** Üç tick fonksiyonunu yaz.
- [ ] **Step 4:** Testleri çalıştır. Beklenen: PASS.
- [ ] **Step 5:** Commit at: `"core: Pasta, Avukat, Sultan"`.

---

### Task 5: Havalandırma ve örtü — Sahil, Sayıcı

**Files:**
- Modify: `core.js` (`tickSahil`, `tickSayici`)
- Test: `tests/vent.test.js`

**Interfaces:**
- Produces:
  - `G.sahil.stage` (0–3), `G.sayici.count` (0, 4 veya 5).
  - Olaylar:
    - `sound {id:'drag'}`: Sahil her ilerlediğinde.
    - `sound {id:'say4'|'say5'|'say6'}`.
    - `move {who:'sahil', to:'ventA'|'ventB'|'mouth'}`.
    - `death`.
  - `G.pending.sheet` (bool): o an gerçekten örtü gerektiren bir tehdit var mı? Task 6'daki Arda bunu okur.

**Değerler:**
- **Sahil:**
  - 5,5 sn'de bir tick, `roll` tutarsa `stage++`. `stage 3` = havalandırmanın ağzı.
  - `stage 3`'te 7 sn sonra saldırır, o an örtü yoksa `death`.
  - Örtü varsa 5 sn örtü altında kalınması gerekir. Sonra `stage = 0`.
  - Örtü erken kaldırılırsa saldırı sayacı 2 sn'ye düşer.
- **Sayıcı:**
  - 6 sn'de bir tick, `roll` tutarsa sayıma başlar: 0 sn'de `say4`, 4 sn'de `say5`, 8 sn'de `say6`.
  - `say6` anında örtü yoksa `death`, varsa sayım biter.
  - Sayım sırasında `ventLight` açıksa sayaç 2 kat hızlı akar.

**Yapılacaklar:**

- [ ] **Step 1:** Testleri yaz:
  - Sahil `stage 3`'te, örtü 7. saniyeden önce çekilip 5 sn tutulursa → `stage 0`.
  - Örtü hiç yoksa → `death sahil`.
  - Örtü erken kaldırılırsa 2 sn sonra `death`.
  - Sayıcı'da `say4`, `say5`, `say6` olayları 4'er sn arayla gelir. Havalandırma ışığı açıkken `say6` yaklaşık 4. saniyede gelir.
  - Örtü altında `say6` → hayatta kalınır.
  - **Review Focus 5:** Sultan `here` iken örtü çekilir ve monitör açık bırakılmışsa uygulanmış monitör kapanır ve ölüm olmaz.
- [ ] **Step 2:** Testleri çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** `tickSahil`, `tickSayici` ve `G.pending` hesabını yaz.
- [ ] **Step 4:** Testleri çalıştır. Beklenen: PASS.
- [ ] **Step 5:** Commit at: `"core: Sahil, Sayıcı, örtü"`.

---

### Task 6: Arda Baz (taklitçi) ve ITS ME

**Files:**
- Modify: `core.js` (`tickArda`, `tickItsMe`)
- Test: `tests/arda_itsme.test.js`

**Interfaces:**
- Consumes: Task 4–5'teki `G.pending` ve ses kimlikleri.
- Produces:
  - Sahte sesler: `sound {id:'drag'|'say4'|'say5'|'knock', fake:true}`. Ardından taklidin son anında `sound {id:'miyav', fake:true}`.
  - `G.arda.mistakes`, `death {who:'arda'}`.
  - `itsme {variant:'cam'|'corr'|'crash'}`.

**Değerler:**
- **Arda Baz:**
  - 6 sn'de bir tick. `roll` tutarsa o gece aktif olan karakterlerden birinin sesini taklit eder (`sahil` → drag, `sayici` → say4 ve say5, `avukat` → knock).
  - Taklit penceresi 6 sn. `miyav` 5,5. saniyede.
  - Pencere içinde gerçek bir tehdit yokken örtü çekilirse ya da kapı kapatılırsa (`G.pending.sheet` / `G.pending.door` false) `mistakes++`. Bir pencerede en fazla bir hata sayılır.
  - `mistakes === 3` → `death arda`.
- **ITS ME:**
  - `createGame` sırasında `rng < 0.03` ise 30–270. saniyeler arasında rastgele bir ana planlanır.
  - Varyant olasılıkları: cam %50, corr %40, crash %10.
  - Bir gecede en fazla bir kez olur.
  - `crash` varyantı oyuncuyu öldürmez. UI tarafından "çökme" ekranıyla ana menüye atılır; çekirdek sadece olayı yayınlar ve `over = true`, `result = 'itsme'` yapar.

**Yapılacaklar:**

- [ ] **Step 1:** Testleri yaz:
  - Sabit seed ile Arda sahte `drag` ve ardından `miyav` üretir.
  - Sahte pencerede örtü çekmek `mistakes`'i 1 artırır. Aynı pencerede ikinci kez çekmek artırmaz.
  - Gerçek Sahil `stage 3`'teyken örtü çekmek hata sayılmaz.
  - 3 hata → `death arda`.
  - ITS ME: 2000 farklı seed'de çıkma oranı %2–4 arası. `crash` → `result === 'itsme'`.
- [ ] **Step 2:** Testleri çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** Fonksiyonları yaz.
- [ ] **Step 4:** Testleri çalıştır. Beklenen: PASS.
- [ ] **Step 5:** Commit at: `"core: Arda Baz, ITS ME"`.

---

### Task 7: Gece tablosu, Custom Night, kayıt

**Files:**
- Create: `nights.js`, `save.js` (ikisi de UMD)
- Test: `tests/nights_save.test.js`

**Interfaces:**
- Produces:
  - `NIGHTS[1..6] = { levels:{…}, doc:'doc1', phone:'voice/phone1.mp3' }`.
  - `docs` metinleri: `DOCS[id] = { title, html }`. Bu metinler spec §5 tablosundaki belgelerdir, korku tonunda ve lore ile tutarlı.
  - `Save.load(storage?) -> { maxNight:1, docs:[], itsme:[], custom2020:false }`.
  - `Save.save(p, storage?)`.
  - `Save.unlock(p, result) -> p`.
  - Custom Night: UI `Core.createGame({night:7, levels:<kullanıcının seçtikleri>})` çağırır.

**Seviye tablosu (başlangıç, Task 8 ayarlar):**

| Gece | pasta | avukat | sahil | sayici | muh | arda | sultan | denek5 |
|---|---|---|---|---|---|---|---|---|
| 1 | 3 | 2 | 0 | 0 | 0 | 0 | 0 | 3 |
| 2 | 5 | 4 | 4 | 0 | 0 | 0 | 0 | 5 |
| 3 | 7 | 6 | 6 | 5 | 5 | 0 | 0 | 7 |
| 4 | 9 | 8 | 8 | 7 | 7 | 6 | 5 | 9 |
| 5 | 12 | 11 | 11 | 10 | 10 | 9 | 9 | 12 |
| 6 | 16 | 15 | 15 | 14 | 14 | 13 | 13 | 16 |

**Açılma kuralları:**
- 5. gece kazanılınca: `maxNight = 6` ve final.
- 6. gece kazanılınca: `maxNight = 7`, Custom Night açılır.
- Custom Night'ta tüm değerler 20 iken kazanılırsa `custom2020 = true`.

**Yapılacaklar:**

- [ ] **Step 1:** Testleri yaz:
  - Tablo değerleri yukarıdaki gibi (Task 8 değiştirirse test de güncellenir).
  - 3. gecede `arda === 0`, 4. gecede `arda > 0`. 3. gecede `muh > 0`.
  - **Review Focus 3:** `Save.load`, bozuk JSON içeren ya da `getItem`'ı hata fırlatan bir storage ile varsayılanı döndürür.
  - `unlock` kuralları.
- [ ] **Step 2:** Testleri çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** `nights.js` ve `save.js`'i yaz. localStorage anahtarı `'m5g_morg'`.
- [ ] **Step 4:** Testleri çalıştır. Beklenen: PASS.
- [ ] **Step 5:** Commit at: `"Gece tablosu, belgeler, kayıt"`.

---

### Task 8: Denge simülasyonu

**Files:**
- Create: `tools/sim.js`
- Modify: `core.js` (`PARAMS`), `nights.js` (seviyeler)
- Test: `tests/balance.test.js` (yavaş; `node --test tests/balance.test.js` ile ayrı çalıştırılır)

**Interfaces:**
- Produces: `simNight(night, {runs, bot}) -> { winRate, deaths:{who:count}, avgPowerLeft }`. CLI olarak `node tools/sim.js` tablo basar.

**Bot ("iyi oyuncu"):**
- Sadece oyuncunun algılayabileceği bilgiyi kullanır: sesler, ışıkla görülen durum, monitördeki `shownTemp` ve hack belirtileri.
- 0,6 sn tepki gecikmesi var ve aynı anda tek bir şeyle uğraşır.
- Öncelik sırası: Sultan > Sayıcı ve Sahil (örtü) > Avukat > Pasta > soğutma (temp >55 iken, monitör açıp 100'e değil 20'ye kadar soğutur) > hack.
- Kapı ışığını 4 sn'de bir, havalandırma ışığını 6 sn'de bir kısa süre yakar.
- Miyavı %70 oranında fark eder. Kalan %30'da sahte sese gerçekmiş gibi tepki verir.

**Hedefler (spec §6):**
- **1. gece:** Kazanma oranı ≥%85. Kazanınca kalan ortalama elektrik %30–40. Pasif bot (hiçbir şey yapmayan) elektrikle değil karakterlerle ölmeli; elektriği hiç kontrol etmeyen "her şeyi açık tutan" bot elektriksiz kalmalı.
- **2. gece:** %70–85.
- **3. gece:** %45–60.
- **4. gece:** %30–45.
- **5. gece:** %8–15.
- **6. gece:** %2–6.
- **20/20:** >0 ve <%1, 20.000 koşuda.

**Yapılacaklar:**

- [ ] **Step 1:** Test yaz. `balance.test.js`, her gece için 2000 koşu (20/20 için 20.000) çalıştırıp hedef aralıkları doğrular.
- [ ] **Step 2:** Testi çalıştır ve mevcut sonuçları kaydet. Beklenen: büyük olasılıkla bazı aralıklar FAIL.
- [ ] **Step 3:** Bot'u ve `simNight`'ı yaz. `PARAMS` ile seviye tablosunu ayarla. Önce elektrik değerlerini oynat, sonra seviyeleri. Her değişiklikten sonra `npm run sim` çalıştır. Hedefler tutana kadar devam et.
- [ ] **Step 4:** Testi çalıştır. Beklenen: PASS. Sim tablosunu commit mesajına ekle.
- [ ] **Step 5:** Commit at: `"Denge: sim botu ve ayarlanmış değerler"`.

---

### Task 9: Ofis görünümü ve kontroller

**Files:**
- Create: `index.html`. 1. oyunun dosyasından türetilir: `fit()`, `show()`, panoramik bakış (`applyLook`/`updateLook`), lamba titremesi, kaydırma kenarları ve dokunma, CRT monitör geçişi (`openCam`/`closeCam`/`zoomTransform`), bezel, `monPower`. Eski karakter mantığı (`ai`, `CHARS`, LoL monitörü, sağ kapı) silinir.
- Create: `tests/e2e.mjs`

**Interfaces:**
- Consumes: `Core`, `NIGHTS`, `Save`, `Audio5`.
- Produces:
  - Oyun döngüsü: `loop` her karede `input` nesnesini toplar, `Core.step` çağırır, olayları `handleEvent(ev)` ile işler.
  - `window.__game` (G'ye test erişimi).

**Panorama yerleşimi (`img/office.png`, 2000×848 koordinat):**
- Sol kapı boşluğu: x 60–380.
- Koridor açıklığı: x 860–1140.
- Havalandırma: x 1640–1940, alt yarıda.

**Kontroller:**
- Sol kapı paneli (kapı ve ışık düğmeleri).
- Koridor fenerine basılı tutma alanı ya da `Shift` / `F` tuşu.
- Havalandırma ışığı düğmesi.
- Alt kenarda iki çubuk: sol **MONİTÖR**, sağ **ÖRTÜ** (FNaF2 gibi üzerine gelince ya da `Space`/`S` ile).
- Masada saat ve elektrik göstergesi. Ekrandaki HUD bunlar dışında boş.

**Görsel tepkiler:**
- **Koridor:** `corr/empty` + fener → `corr/lit` / `corr/pastaN` / `corr/sultan`.
- **Havalandırma ışığı:** `vent/sahil`.
- **Kapı ışığı:** `doorway/avukat`.
- **Örtü:** Açıldığında `img/sheet.png` aşağıdan yukarı kayar, görüş kararır, nefes sesi gelir.
- **Kayıp görsel:** Her `<img>`'de `onerror`, yer tutucuya geçer.

**Yapılacaklar:**

- [ ] **Step 1:** `tests/e2e.mjs`'i yaz. Playwright ile `python3 -m http.server` üzerinden:
  - Sayfa açılır, menü görünür, konsolda hata yok.
  - "Yeni Oyun" ile 1. gece başlar.
  - `F` basılıyken `__game.dev.flash === true`.
  - `S` ile `__game.dev.sheet === true` ve `__game.dev.monitor === false`.
  - **Review Focus 4:** `img/corr/lit.png` isteği route ile 404'e çevrildiğinde konsolda kırık resim yok ve oyun döngüsü sürüyor (`__game.t` artıyor).
- [ ] **Step 2:** `npm run e2e` çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** Ofisi, kontrolleri ve döngüyü yaz. `dt` 0,1 sn'ye kırpılır.
- [ ] **Step 4:** `npm run e2e` çalıştır. Beklenen: PASS. Ayrıca 1280×720'de bir ekran görüntüsü alıp bak.
- [ ] **Step 5:** Commit at: `"Ofis: panorama, kapı, koridor, havalandırma, örtü"`.

---

### Task 10: Kameralar, Soğuk Oda paneli, sahte görüntü

**Files:**
- Modify: `index.html` (kamera ekranı)
- Modify: `tests/e2e.mjs`

**Interfaces:**
- Consumes:
  - `Core.CAMS`, `Core.shownTemp`.
  - `G.muh`, `move` olayları.
- Produces: kamera durumu `ui.cam` ve `ui.rebootHeld`, `input`'a aktarılır.

**Kamera ekranı:**
- 1. oyunun CRT işletim sistemi ekranı yeniden markalanır: `MORG-SEC CCTV`.
- Kroki haritasında 7 oda ve aralarındaki çizgiler. Konumlar:
  - Soğuk Oda ile Otopsi solda.
  - Arşiv ve Asansör üstte.
  - Koridor ortada.
  - Havalandırma A ve B sağda.
  - "SEN" altta.

**Soğuk Oda kamerası:**
- `cold` görüntüsü.
- Sıcaklık çubuğu `shownTemp` değerini gösterir.
- **SOĞUT** düğmesi basılı tutulur (ya da `C` tuşu).
- %70'in üstünde çubuk kırmızı yanıp söner.

**Hack:**
- O kameranın görüntüsü hack anındaki karede donar.
- Saat damgası durur.
- Köşede 0,15 sn'lik "D5" yazısı rastgele belirir.
- **YENİDEN BAŞLAT** düğmesi her kamerada vardır; basılı tutulduğunda 3 sn parazit ve ilerleme çubuğu gösterir.

**Karakterli görüntüler:** `move` olaylarına göre `img/cam/<cam>_<who>.png`.

**Yapılacaklar:**

- [ ] **Step 1:** e2e'ye ekle:
  - Monitör açılır, `cold` seçilir, `C` basılı tutulunca `__game.denek5.temp` düşer.
  - `__game` üzerinden zorla `cold` hack'i verilince ekrandaki sıcaklık değişmez.
  - 3 sn reboot sonrası `__game.muh.cam === null`.
- [ ] **Step 2:** e2e'yi çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** Kamera ekranını yaz.
- [ ] **Step 4:** e2e'yi çalıştır. Beklenen: PASS. Ekran görüntüsüne bak.
- [ ] **Step 5:** Commit at: `"Kameralar, Soğuk Oda, sahte görüntü"`.

---

### Task 11: Ekranlar — menü, belge, telefon, ölüm, 6 AM, final, arşiv, Custom Night

**Files:**
- Modify: `index.html`
- Modify: `tests/e2e.mjs`

**Interfaces:**
- Consumes: `Save`, `NIGHTS`, `DOCS`, olaylar (`death`, `win`, `powerout`, `itsme`).

**Ekranlar** (spec §8):

1. **Menü:**
   - `menu_face` ↔ `menu_face_scary` glitch'i, 1. oyunun `scheduleScare` mantığıyla.
   - Düğmeler: Yeni Oyun, Devam (`maxNight`), 6. Gece (`maxNight≥6`), Custom Night (`maxNight≥7`), Arşiv.
   - Üzerine gelince ses, tıklayınca parazit.
2. **Belge:** `doc/paper.png` üstüne `DOCS[...]` HTML'i. Tıklayınca "Gece X — 12 AM" ekranı.
3. **Telefon:** Gece başladıktan 2 sn sonra `NIGHTS[n].phone` çalar. Masadaki telefonda ışık yanar. Telefona tıklamak kaydı susturur. Dosya yoksa sessizce atlanır.
4. **Ölüm:** `img/scare/<who>.png` jumpscare'i, çığlık, parazit, ardından "OYUN BİTTİ" ekranında yeniden dene ve menü seçenekleri. `powerout` için 1. oyunun karanlık sekansı uyarlanır: karanlıkta 5 numaralı dolaptan Denek 5 gelir.
5. **6 AM:** Ses ve "6 AM" ekranı, ardından `Save.unlock`.
6. **Final:** 5. gece sonrasında `phone6_secret` kaydı çalar, Denek 6 formu (`DOCS.doc5`) yeniden gösterilir, `ending.png` ve son yazı gelir.
7. **ITS ME:**
   - `cam`: kamerada 1 sn'lik bir kare.
   - `corr`: fenerde `itsme_photo`.
   - `crash`: tam ekran `scare/itsme` 1,5 sn, ardından sahte "Aw, Snap" benzeri siyah hata ekranı 2 sn, sonra menü.
   - Arşive kaydedilir.
8. **Arşiv:** Bulunan belgeler, ITS ME kayıtları, 20/20 ödülü (`img/ending.png` + gizli belge).
9. **Custom Night:**
   - 8 karakter kartı, her birinde ‹ › ile 0–20 arası seviye.
   - Hazır ayarlar: "Kolay 5", "Gece 6", "20/20".
   - Başlat.

**Yapılacaklar:**

- [ ] **Step 1:** e2e'ye ekle:
  - Kayıt boşken Custom Night düğmesi gizli. `localStorage` `maxNight:7` iken görünür.
  - 20/20 hazır ayarı tüm değerleri 20 yapar.
  - `__game` ile zorla `death pasta` → jumpscare ekranı, ardından game over.
  - Zorla `win` → 6 AM ekranı ve `maxNight` artışı.
- [ ] **Step 2:** e2e'yi çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** Ekranları yaz.
- [ ] **Step 4:** e2e'yi çalıştır. Beklenen: PASS.
- [ ] **Step 5:** Commit at: `"Ekranlar: menü, belgeler, telefon, ölüm, final, arşiv, Custom Night"`.

---

### Task 12: Ses

**Files:**
- Modify: `audio.js`
- Create: `tools/voice.sh`
- Test: `tests/audio.test.js`

**Interfaces:**
- Produces: `Audio5.sfx` içine yeni sesler:
  - `rattle`, `drag`, `knock`, `motor`, `miyav`, `say(n)`, `reboot`, `phoneRing`, `breath`, `sheet`, `flashClick`.
  - `Audio5.morgAmbience()`: kompresör uğultusu ve damla sesleri.
  - `Audio5.playVoice(url)`.

**Konumlama ve bozulma:**
- Sesler `from` alanına göre stereo panlanır: sol kapı = sol, koridor = orta, havalandırma = sağ.
- `fake:true` olan sesler çok hafif farklı çalınır: perde ±%3 ve sonunda `miyav`. Fark bilerek ince tutulur.

**Kayıt işleme:**
- Sayıcı ve miyav, ham kayıt (`voice/raw/*.m4a`) varsa ondan üretilir: `tools/voice.sh`, ffmpeg ile perdeyi düşürür, yankı ve bozulma ekler, `sfx/sayici_*.mp3` olarak kaydeder.
- Ham kayıt yoksa sentezle yapılır.
- Profesör kayıtları için betik telefon bandı (300–3400 Hz), cızırtı ve kopmalar ekler.

**Yapılacaklar:**

- [ ] **Step 1:** Test yaz. `audio.test.js`, `audio.js`'yi sahte bir `AudioContext` ile yükler (`vm` modülü) ve listedeki her `sfx` fonksiyonunun var olduğunu, hata fırlatmadan çağrılabildiğini doğrular.
- [ ] **Step 2:** Testi çalıştır. Beklenen: FAIL.
- [ ] **Step 3:** Sesleri ve `voice.sh`'i yaz. `voice.sh`'i örnek bir test kaydıyla (ffmpeg ile `sine` üretilen dosya) dene.
- [ ] **Step 4:** Testi ve e2e'yi çalıştır. Beklenen: PASS.
- [ ] **Step 5:** Commit at: `"Ses: morg ambiyansı, karakter sesleri, kayıt işleme"`.

---

### Task 13: Gerçek görselleri ve kayıtları entegre etme, yayın

Kullanıcının Gemini görselleri ve arkadaşların kayıtları geldikçe tekrarlanır.

**Files:**
- Modify: `img/**`, `voice/**`, `sfx/**`

**Yapılacaklar:**

- [ ] **Step 1:** Gelen her görseli ASSETS.md'deki adına göre yerleştir.
  - Karakter görsellerinde arka planı rembg (`u2net_human_seg`) ile sil.
  - Gerekirse boyutlandır.
  - Ofis panoramasında kapı, koridor ve havalandırma koordinatlarını görsele göre güncelle (`index.html` içindeki sabitler).
- [ ] **Step 2:** Kayıtları `tools/voice.sh` ile işle.
- [ ] **Step 3:** `npm test`, `npm run e2e` ve `npm run sim` çalıştır. Beklenen: hepsi PASS. 1280×720'de ekran görüntüsü alıp bak.
- [ ] **Step 4:** Kullanıcı `efeozbilgin123/FNaM2` reposunu açınca `add_repo` ile ekle ve push et. Kullanıcı Pages'i açacak. `https://efeozbilgin123.github.io/FNaM2/` adresini kontrol et.
- [ ] **Step 5:** Commit at ve push et: `"Görseller ve sesler"`. Co-author satırı olmayacak.
