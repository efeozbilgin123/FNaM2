// Mırık'la 5 Gece: MORG — monitördeki dosya sistemi ve hikâye dosyaları
(function (root) {
  'use strict';
  const T = (name, text, ico = 'txt') => ({ name, ico, text });
  const DENY = (name, ico, deny) => ({ name, ico, deny });
  const DIR = (name, items, ico = 'folder') => ({ name, ico, dir: items });

  const nobetNotlari = `NÖBET NOTLARI — yazmam söylendi, yazıyorum

1. gece
Soğuk oda, 5 numara. Prof. "ısı yükselirse soğut" dedi.
Sordum, "neden sadece 5 numara?" Cevap vermedi.
Koridorda ayak sesi. Feneri tutunca gitti.

2. gece
Havalandırmadan ıslak bir ses geliyor. Deniz kokusu.
Örtüyü çektim, kıpırdamadım. Gitti. Örtü işe yarıyor.

3. gece
Biri sayıyor. Dört. Beş.
Altıyı duymadım çünkü örtünün altındaydım.
Kameralardan biri 10 dakika aynı kareyi gösterdi.
Saat değişmiyordu.

4. gece
Kedi sesi. Morgda kedi yok.
Telefonda Prof. bana "denek" dedi. Yanlış duydum herhalde.
Uyuyamıyorum. Kahve garip tadıyor.

5. gece
aynaya baktım gözlerim`;

  const sifreler = `MORG-SEC yönetici şifresi: 456456   (DEĞİŞTİRME!)
Kat B-1 kapı paneli: kırmızı = kepenk, beyaz = ışık
PROJE_456 klasörü: sadece Prof. açabilir

not: 5 numaralı çekmecenin anahtarı bende değil.
     kimde olduğunu da sormayın.`;

  const kayit456 = `T.C. ... ÜNİVERSİTESİ TIP FAKÜLTESİ — MORG GİRİŞ KAYDI

Kayıt No    : 98/0456
Geliş       : 14.06.1998  03:12
Gönderen    : Birey Koleji (Samsun)
Kimlik      : BELİRSİZ  (üzerinde "H.E.M." yazan öğrenci kartı)
Yaş         : ~17
Çekmece     : 5

Notlar:
- Ceset soğuk değil. Vücut ısısı 36,4.
- Göz kapakları kapanmıyor. Sklera tamamen siyah.
- Sağ işaret parmağında mürekkeple "4 5 6".
- Geldiğinden beri dudakları kıpırdıyor. Ses yok.

Teslim alan: ________  (imza yok)`;

  const kayit457 = `MORG GİRİŞ KAYDI

Kayıt No    : 98/0457
Geliş       : 14.06.1998  05:40
Gönderen    : Birey Koleji
Kimlik      : Gece etüt görevlisi
Çekmece     : 9

Notlar:
- 3-4-5 Yayınları Hukuk Birimi'nin talimatıyla KAYIT DIŞI.
- Ölüm saati belirlenemedi. Sabah 06.00'da hâlâ nefes alıyordu.
- Ailesine "kayıp" bilgisi verilecek.

!! Bu kayıt sisteme girilmeyecek !!`;

  const nobetDefteri = `MORG KATI GECE NÖBET DEFTERİ (1998 - )

1998  etüt görevlisi (B. Koleji)   5/5   -> çekmece 9
1999  T.K.                          3/5
2001  M.A.                          2/5
2004  S.Y.                          5/5   -> nakil: "Proje 4-5-6"
2008  E.D.                          1/5
2011  B.Ö.                          4/5
2015  K.T.                          5/5   -> izinsiz ayrıldı, bulunamadı
2019  A.S.                          0/5
2023  M.M.                          3/5
bugün ${'\u2588'.repeat(9)}                    ?/5   -> DENEK 6

Her yıl tek bir öğrenci. Her yıl Prof.'un listesinden.`;

  const gunluk = `PROJE 4-5-6 — DENEK 5 GÖZLEM GÜNLÜĞÜ  (silindi)

Gece 6:
Kişilikler birbirleriyle konuşuyor. Biri "kitapta mı" diye
soruyor, öteki "pastaymış" diye cevap veriyor. Biri avukatını
istiyor. Biri ıslak, denizden bahsediyor. Biri hep sayıyor.
Altıncısı makineleri seviyor; kameraları o donduruyor.
Sultan dediğimiz sessiz. En tehlikelisi o.

Gece 7:
Denek 4 (A.B.) yine geldi. Uyumuyor. Denek 5 ile "maç"
oynamak istiyor. Seslerimizi taklit etmeye başladı.
Taklidin sonunda istemsiz bir ses çıkarıyor. Kedi gibi.

Gece 8:
Ceset artık çürümüyor. Kişilikler bir beden arıyor.
Yeni beden için uygun profil:
  - uyumayan
  - ders çalışan
  - "kitapta mı" diye soran
  ▓▓▓▓▓ DOSYA BOZUK ▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓ nöbet listesine yaz ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓`;

  const liste = `NÖBET LİSTESİ — MORG KATI B-1

Pazartesi  : ${'\u2588'.repeat(10)}
Salı       : ${'\u2588'.repeat(8)}
Çarşamba   : ${'\u2588'.repeat(12)}
Perşembe   : ${'\u2588'.repeat(9)}
Cuma       : ${'\u2588'.repeat(11)}

ÖZEL NÖBET (5 gece): ${'\u2588'.repeat(11)}  -> DENEK 6  [x] uygun

Onay: Prof.
Not: Kahveye 345 mg. Her gece.`;

  const FS = [
    DENY('3½ Disket (A:)', 'floppy', 'A:\\ erişilemiyor.\nAygıt hazır değil.'),
    DIR('Yerel Disk (C:)', [
      DIR('Belgelerim', [T('nobet_notlari.txt', nobetNotlari), T('sifreler.txt', sifreler)]),
      DENY('WINNT', 'folder', 'Bu klasöre erişim izniniz yok.'),
      DENY('Program Files', 'folder', 'Bu klasöre erişim izniniz yok.'),
    ], 'drive'),
    DIR('MORG_ARSIV (D:)', [
      DIR('1998', [T('kayit_98_0456.txt', kayit456), T('kayit_98_0457.txt', kayit457)]),
      T('nobet_defteri.txt', nobetDefteri),
      DENY('PROJE_456', 'folder', 'Bu klasör şifreli.\nErişim engellendi.'),
    ], 'drive'),
    DENY('CD Sürücüsü (E:)', 'cd', 'Sürücüde disk yok.'),
  ];
  const BIN = [
    T('proje456_gunluk.doc', gunluk, 'doc'),
    { name: 'denek5_otopsi.bmp', ico: 'img', img: 'img/itsme_photo.png' },
    T('nobet_listesi_DENEK6.xls', liste, 'doc'),
  ];
  root.Lore = { FS, BIN };
})(this);
