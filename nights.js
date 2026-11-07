// Mırık'la 5 Gece: MORG — gece tablosu ve belgeler
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Nights = factory();
})(this, function () {
  'use strict';
  const L = (pasta, avukat, sahil, sayici, muh, arda, sultan, denek5) => ({ pasta, avukat, sahil, sayici, muh, arda, sultan, denek5 });

  // Seviyeler tools/sim.js ile ayarlandı (npm run sim). Yeni karakter gelen gecelerde
  // eski karakterlerin seviyesi bilerek düşebilir: zorluk karakter sayısından geliyor.
  const NIGHTS = {
    // grace: telefon konuşması bitene kadar (zil ~9 sn + kayıt) kimse hareket etmez
    1: { levels: L(5, 3, 0, 0, 0, 0, 0, 3), doc: 'doc1', phone: 'voice/phone1.mp3', grace: 81 },
    2: { levels: L(14, 15, 14, 0, 0, 0, 0, 8), doc: 'doc2', phone: 'voice/phone2.mp3', grace: 58 },
    3: { levels: L(12, 11, 13, 9, 9, 0, 0, 7), doc: 'doc3', phone: 'voice/phone3.mp3', grace: 67 },
    4: { levels: L(9, 8, 10, 7, 9, 5, 3, 5), doc: 'doc4', phone: 'voice/phone4.mp3', grace: 70 },
    5: { levels: L(9, 9, 9, 7, 12, 5, 5, 6), doc: 'doc5', phone: 'voice/phone5.mp3', grace: 69 },
    6: { levels: L(10, 10, 10, 9, 9, 7, 7, 6), doc: null, phone: 'voice/phone6_secret.mp3' },
  };

  const DOCS = {
    doc1: {
      title: 'Nöbet Görevlendirmesi',
      html: `<div class="hd">T.C. ... ÜNİVERSİTESİ TIP FAKÜLTESİ<br>ANATOMİ ANABİLİM DALI — MORG KATI</div>
<h2>GECE NÖBETİ GÖREVLENDİRMESİ</h2>
<p>Aşağıda adı geçen öğrenci, Anatomi Anabilim Dalı Başkanlığı'nın önerisi üzerine <b>beş (5) gece</b> süreyle morg katı gece nöbetine görevlendirilmiştir. Nöbet saatleri 00.00 – 06.00'dır.</p>
<p>Nöbetçi, nöbet süresince <b>soğuk oda sıcaklığını</b> sürekli kontrol etmekle yükümlüdür. 5 numaralı çekmece hiçbir koşulda açılmayacaktır.</p>
<p>Nöbetçinin nöbet sırasında katı terk etmesi yasaktır.</p>
<p class="sig">Prof. Dr. ———<br><i>Anabilim Dalı Başkanı</i></p>
<div class="clip"><div class="np">SAMSUN GECE POSTASI — 14 HAZİRAN 1998</div>
<b>BİREY KOLEJİ'NDE ÖĞRENCİ ÖLÜ BULUNDU</b><br>
Beş gecedir etüt odasında kaldığı belirtilen H.E.M. (17), sınav sabahı ölü bulundu. Okul yönetimi ölümün "aşırı yorgunluktan" olduğunu açıkladı. Gece etüt görevlisinden ise haber alınamıyor. Cesedin kimlik tespiti için tıp fakültesine gönderildiği öğrenildi.</div>`,
    },
    doc2: {
      title: 'Otopsi Raporu',
      html: `<div class="hd">ADLİ TIP — OTOPSİ RAPORU<br>Kayıt No: 98/0456 — Çekmece: 5</div>
<h2>KİMLİĞİ BELİRSİZ ERKEK</h2>
<p><b>Tahmini yaş:</b> 17. <b>Geliş tarihi:</b> 14.06.1998. <b>Rapor tarihi:</b> bugün.</p>
<p><b>Dış muayene:</b> Ceset 1998'den bu yana soğuk odada tutulmasına rağmen <b>hiçbir çürüme belirtisi göstermemektedir.</b> Göz kapakları kapatılamamaktadır. Gözlerin sklerası tamamen siyahtır. Her iki göz kenarında kurumayan kan izi vardır.</p>
<p><b>İç muayene:</b> Kafatası açılmamıştır. <s>Beyin</s> Muayeneyi yapan asistan ikinci kesiden sonra odayı terk etmiş, geri dönmemiştir.</p>
<p><b>Not:</b> Kadavranın sağ işaret parmağında, yeni gibi duran mürekkeple yazılmış "4 5 6" rakamları bulunmaktadır. Rakamlar silindikçe geri gelmektedir.</p>
<p><b>Not 2:</b> Islak. Ceset her sabah ıslak bulunuyor. Çekmecede kum var.</p>
<p class="sig">Dr. ——— (imza yok)</p>`,
    },
    doc3: {
      title: 'Proje 4-5-6 — Deney Günlüğü',
      html: `<div class="hd">GİZLİ — 3-4-5 YAYINLARI AR-GE / BİREY KOLEJİ<br>PROJE 4-5-6 — UYANIK-345</div>
<h2>DENEY GÜNLÜĞÜ</h2>
<p><b>Gece 1:</b> Denek 4 ve Denek 5'e 345 mg verildi. İkisi de 06.00'ya kadar uyumadı. Verim artışı %40. Denek 5 durmadan "kitapta mı?" diye soruyor.</p>
<p><b>Gece 2:</b> Denek 5 kendi kendine konuşuyor. Kayıtlarda <b>altı ayrı ses tonu</b> tespit edildi. Biri sürekli sayıyor.</p>
<p><b>Gece 3:</b> Denek 5 ile görüşme. Gelecek planlarını sorduk. Cevap: "bilgisayar mühendisi olacaktım." Ardından güvenlik kameralarının tamamı 4 dakika boyunca aynı kareyi gösterdi.</p>
<p><b>Gece 4:</b> Denek 4 uyumayı tamamen bıraktı. Gözleri kapanmıyor. Hâlâ Denek 5'le birlikte bilgisayar oyunu oynamak istiyor.</p>
<p><b>Gece 5:</b> Doz 456 mg'a çıkarıldı.</p>
<p><b>Gece 6:</b> —</p>
<p class="sig">Sorumlu: Dr. ———</p>`,
    },
    doc4: {
      title: 'Denek 4 Dosyası',
      html: `<div class="hd">PROJE 4-5-6 — DENEK DOSYASI</div>
<h2>DENEK 4: ARDA BAZ</h2>
<p><b>Durum (1998):</b> Uyanık-345 sonrası uyku ihtiyacı tamamen ortadan kalktı. Bölünme gözlenmedi.</p>
<p><b>Durum (bugün):</b> Denek yaşlanmamaktadır. Fakülte binasında, özellikle havalandırma kanallarında görüldüğüne dair 14 ihbar var. İhbar edenlerin tamamı "bir kedi sesi" duyduğunu söylüyor.</p>
<p><b>Davranış:</b> Denek, duyduğu sesleri birebir taklit edebilmektedir. Taklit sonunda istemsiz bir ses çıkarmaktadır.</p>
<hr>
<p><b>Kime:</b> 3-4-5 Yayınları Hukuk Birimi<br><b>Konu:</b> Denek 5 cesedi</p>
<p>Ceset hâlâ fakültemizdedir ve "uygun beden" bulunduğu takdirde deneyin son aşamasına geçilebilir. Nöbet listesini ben hazırlıyorum. Avukatlarınızın binaya girmesine gerek yok; <b>zaten içerideler.</b></p>
<p class="sig">Prof. Dr. ———</p>`,
    },
    doc5: {
      title: 'Denek 6 — Kayıt Formu',
      html: `<div class="hd">PROJE 4-5-6 — YENİ DENEK KAYIT FORMU</div>
<h2>DENEK 6</h2>
<p><b>Adı Soyadı:</b> <span class="you">(senin adın)</span></p>
<p><b>Seçilme nedeni:</b> Tıp öğrencisi. Kurul sınavı haftası. Uyumuyor. Sürekli ders çalışıyor. "Kitapta mı?" diye soruyor.</p>
<p><b>Uyanık-345 uygulaması:</b> Nöbet odasındaki kahveye, 5 gece boyunca.</p>
<p><b>Amaç:</b> Denek 5'in kişiliklerinin yeni bedene aktarımı.</p>
<p><b>Gözlem:</b> Denek 5 nöbet sonunda hayatta kalırsa aktarım tamamlanmış sayılır.</p>
<p><b>Ek:</b> Bkz. 1998 etüt görevlisi. Aynı form. Aynı sonuç.</p>
<p class="sig">Onay: Prof. Dr. ———<br>Hukuk onayı: 3-4-5</p>`,
    },
    secret: {
      title: 'Son Not',
      html: `<div class="hd">PROJE 4-5-6 — KAPANIŞ</div>
<h2>DÖRT. BEŞ. ALTI.</h2>
<p>Bu notu okuyorsan altıncı geceyi de bitirdin. Kimse bitirmemişti.</p>
<p>1998'deki etüt görevlisi de beş gece dayanmıştı. 3-4-5'in avukatları yıllarca onu aradı. Ben nerede olduğunu biliyordum: <b>9 numaralı çekmecede.</b> Ona da aynı formu imzalatmıştık.</p>
<p>Yirmi sekiz yıldır her yıl birini nöbete yazıyorum, çünkü onlar istiyor. Pasta, avukat, deniz, sayılar, makineler, taht. Hepsi bir beden istiyor. Sen altı geceyi bitirdin. Demek ki artık seçen sen değilsin.</p>
<p>Sabah aynaya baktığında gözlerin simsiyah olacak.</p>
<p>Kitapta mı? Kitapta.</p>`,
    },
  };

  return { NIGHTS, DOCS };
});
