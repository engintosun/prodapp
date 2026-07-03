# KAAPA — VERGİ MEVZUATI (Sektörel Referans)

*Bütçe modülünün vergi mantığının (ödeme-statüsü → KDV / stopaj / net-brüt) TEK KAYNAĞI. Türk film/TV/reklam/belgesel yapımında ödeme türlerinin vergisel davranışı. KART-KATALOGU §4.8 (ödeme-statüsü boyutu) ve §4.9 (çift-fringe guard) ile birlikte okunur.*

*Oluşturma: 23 Haziran 2026. Durum: oranlar web-doğrulandı (aşağıda kaynak+tarih). **TASLAK uyarısı:** mevzuat sık değişir; her oran "kaynak-tarihli, mali müşavire doğrulatın" ilkesiyle tutulur (Compliance Guard §6: KAAPA teşhis/uyarı verir, kesin vergi tavsiyesi vermez).*

---

## 0. NEDEN BU BELGE — net toplam ≠ brüt toplam

Bir kaleme yazdığın **net** rakam (örn. yönetmene 100.000) ile o kalemin **işverene maliyeti** ve **nakit çıkışı** çoğu zaman aynı değildir. Aradaki fark üç ayrı vergi mekanizmasından gelir ve bunlar **birbirinden bağımsız eksenlerdir** — tek bir "yük %" çarpanına sıkıştırılamaz:

1. **Stopaj (gelir vergisi tevkifatı):** Genelde brütün **içinden kesilir** (alacaklıya giden azalır). Net anlaşıldıysa brüt yukarı şişer.
2. **SGK işveren payı (bordro):** Netin **üstüne eklenir**, gerçek işveren maliyeti.
3. **KDV:** Netin üstüne eklenir, **nakit ödenir**; koşullara göre indirilir (gerçek maliyet değil) veya indirilemez (gerçek maliyet).

Bu yüzden bütçede **iki toplam** vardır:
- **Net toplam** = bütçe kontrol rakamı (KDV hariç; öngörülen taraf kilitçe NET — bkz. BUTCE-SEMA-KARARLARI §E).
- **Brüt toplam** = fiilen ödenecek / nakit çıkacak rakam (stopaj şişmesi + KDV dahil).

Hesaplanan değer **saklanmaz** (B18); net girilir, brüt CFE'den türetilir.

---

## 1. ÖDEME STATÜSÜ → VERGİ DAVRANIŞI (ana tablo)

Statü, KART-KATALOGU §4.8'deki ödeme-statüsü boyutudur. Her işçilik/hizmet kalemi bir statü taşır; statü KDV + stopaj + fringe davranışını belirler.

| # | Ödeme statüsü | KDV oranı | Stopaj (GV tevkifat) | Net → Brüt (stopaj şişmesi) | SGK fringe | Not |
|---|---|---|---|---|---|---|
| 1 | **Telif — eser belgeli** (GVK 18) | %0 veya %20 | **%17** (GVK 94/2-a) | Brüt = Net / 0,83 | Binmez | FSEK uyumlu yazılı eser sözleşmesi önerilir (belge şart değil); senarist/besteci/YÖNETMEN kapsar, OYUNCULUK DEĞİL; tavan 5,3M (§1b); KDV üç halli (bkz. 1b) |
| 2 | **Serbest meslek — şahıs** (SMM) | %20 | **%20** (GVK 94/2-b) | Brüt = Net / 0,80 | Binmez | Yük faturada; en yaygın şahıs ödemesi |
| 3 | **Şirket faturası** (Ltd/AŞ) | %20 | **%0** | Brüt = Net (KDV ayrı) | Binmez | KDV indirilebilir (koşullu, §3) |
| 4 | **Bordro** (kadrolu) | — (ücret KDV dışı) | Artan tarife (GVK 103) | (basit şişme YOK — ayrı motor) | **Biner** | İşveren SGK payı + damga; gerçek fringe. Fringe motoru §8 PARK |
| 5 | **Konaklama / yemek** | %10 | %0 | Brüt = Net + %10 KDV | Binmez | Operasyonel gider |
| 6 | **Ulaşım — yük taşıma** | %20 | %0 | Brüt = Net + KDV | Binmez | Alıcı kamuysa **2/10 KDV tevkifatı** (§4) |
| 7 | **Şahıs mekan kirası** (GVK 94/5-a) | %0 | **%20** | Brüt = Net / 0,80 | Binmez | Stopajı kiracı keser; şahıs KDV mükellefi değil |

**Şişme formülünün mantığı:** Stopaj brütten kesiliyorsa ve alacaklıya **net** garanti ediliyorsa: Brüt × (1 − stopaj) = Net → **Brüt = Net / (1 − stopaj)**. Örn. %17 → /0,83; %20 → /0,80. (Kaynak doğrulama: GVK 94/2-a telif %17; serbest meslek %20.)

### 1b. TELİF KİMDE GEÇERLİ, KİMDE DEĞİL — GİB özelgesi (KİLİT, kaynak doğrulandı 2026-06-24)
Telif kapsamı FSEK md.8'den gelir — sinema eserinde yönetmen, senaryo yazarı, diyalog yazarı ve özgün müzik bestecisi kanunen birlikte eser sahibidir; Kültür Bakanlığı eser belgesi ŞART DEĞİLDİR (kanuni dayanağı yok; Engin düzeltmesi 2026-07-03). FSEK uyumlu yazılı eser sözleşmesi önerilir; filmin kayıt-tescilinde eser sahibi olarak yer almak ispatı tamamlar (tescil yapımcının zorunlu işlemidir). İdare pratiği uyarısı: özelge, eser niteliği belgelenemezse yüzde 20 (94/2-b) öngörür — belgesiz yüzde 17 tarhiyat riskidir (uygunluk uyarısı). Kapsamaz: oyunculuk, seslendirme, dublaj, sunuculuk. Bağımlılık sınırı: emir-talimat + devamlılık + bağlılık varsa ücret sayılır. İstisna tavanı (2026: 5.300.000 TL) ödeme yapanın stopajını DEĞİŞTİRMEZ — GVK 18 son fıkra gereği istisnanın tevkifata şümulü yoktur; tavan aşımı eser sahibinin yıllık beyan konusudur, yapımcı yasal yükünü etkilemez (bilgi notu). Telif KDV üç hal (KDV kişiye asla ödenmez, kişiye banka = NET): (1) arızi teslim KDV konusu dışı, KDV sıfır; (2) sürekli faaliyet + münhasıran GVK 94 mükelleflerine teslim: yapımcı gider pusulası keser, stopaj dahil brüt matrah üzerinden KDV hesaplayıp sorumlu sıfatıyla 2 no'lu beyannameyle devlete öder, aynı dönem 1 no'lu beyannamede indirir; hesaplanan KDV stopaj matrahına girmez; (3) kişi kendi KDV mükellefiyetiyle makbuz keserse kalem telif değil SMM statüsü + stopaj yüzde 17 override olur. Dayanak: satıcıdan alınan üç-halli yazı (tebliğ mekanizması); yazı eksikliği uygunluk uyarısı adayıdır.

### 1c. ÜÇ EKSEN MODELİ + STATÜ → ÇARPAN TABLOSU (KİLİTLİ, 2026-06-25)

Bütçe "Toplam" = **BRÜT** (yapımcı maliyeti). Üç eksen **birleştirilmez**:

| Eksen | Mekanizma | Kime uygulanır | Net→Brüt formülü |
|---|---|---|---|
| **SGK / işveren** | Ekleme (additive): Brüt = Net × (1 + oran) | Yalnız bordro | Net × 1,2175 (varsayılan) |
| **Stopaj** | Çarpan kesinti: Brüt = Net / (1 − oran) | SMM / Telif / Kira | Net/0,80 veya /0,83 veya /0,80 |
| **KDV** | Ayrı havuz, geri alınabilir | Tüm faturalı | Nakit ilkesi: cepten çıkan KDV maliyettir, genel toplama girer; kendi kolonunda ayrı izlenir (bkz. bölüm 3) |

**Statü → Brüt çarpan tablosu (basit):**

| Statü | Stopaj | Brüt formülü | KDV | SGK fringe |
|---|---|---|---|---|
| `smm` (oyuncu+serbest ekip) | %20 | Net / 0,80 | %20 havuz | Binmez |
| `telif_belgeli` (senarist/besteci/yönetmen) | %17 | Net / 0,83 | %20 havuz | Binmez |
| `kira_sahis` | %20 | Net / 0,80 | — | Binmez |
| `sirket` (Ltd/AŞ faturası) | — | Net = maliyet | %20 havuz | Binmez |
| `konaklama` | — | Net = maliyet | %10 havuz | Binmez |
| `bordro` | Artan tarife (motor) | MOTOR (§7) | — | **Biner** |

**Yük kovası mimarisi (karar: "A reddedildi"):** Stopaj kovadan ÇIKARILMAZ. `item_burdens` kalır; içerik statüye göre dolar (bordro→SGK+işsizlik, smm→stopaj20 bileşeni, telif→stopaj17 bileşeni, kira→stopaj20 bileşeni, fatura/konaklama→boş). Her yük bileşeni **cins** taşır (`burden_components.kind`): `additive` (SGK) veya `deduction` (stopaj). CFE cinse göre hesaplar. *DILIM-2a şema eki: cins alanı + statü→bileşen eşlemesi + rate_catalog oranlar.*

---

## 2. STOPAJ (Gelir Vergisi Tevkifatı) — kim, ne kadar

- **Telif (GVK 18 / 94/2-a): %17 — yalnız eser belgeli senarist/besteci/yönetmen (§1b).** OYUNCULUK telif DEĞİL → SMM %20. Eser belgesi: Kültür ve Turizm Bak. yazısı. 2026 istisna tavanı **5.300.000 TL**; aşılırsa istisna düşer (§1b). Reklam tevkifatı 3/10 mü 10/10 mu kaynaklar çelişiyor → müşavire doğrulat.
- **Serbest meslek (94/2-b): %20.** SMM ile faturalanan şahıs hizmeti.
- **Kira — şahıs işyeri/mekan (94/5-a): %20.** Kiracı (yapım şirketi) keser, muhtasarla beyan eder. *(Geçmişte pandemi döneminde geçici %10 olmuştu; güncel %20 — doğrula.)*
- **Şirket faturası: stopaj YOK** (kurum kendi kurumlar vergisini öder).
- **Bordro:** stopaj değil, artan tarifeli gelir vergisi (GVK 103) + SGK + damga = ayrı bordro motoru (§7 aşağıda).
- **SGK işveren oranı:** ham %21,75 (7566 SK sonrası, film/imalat-dışı). Teşvik senaryoları: **%19,75** varsayılan (imalat-dışı 2 puan indirimi, düzenli ödeme şartlı); **%21,75** borçlu/teşviksiz. "%15,5 bakanlık/bölgesel" ifadesi ÖNCEKİ TASLAKTA HATALIYDI — 5225 sayılı Kanun'un Kültür Yatırım/Girişim Belgesi teşviki sabit oran değil, hisse-karşılama mekanizmasıdır (bkz. §7a). Şirket-Profili checkbox = DILIM-3 parametre paneli.

---

## 3. KDV — ne zaman gerçek maliyet, ne zaman değil (KRİTİK)

**KAAPA KARARI (KİLİT, 2026-07-03, Engin):** Bütçe nakit dünyasıdır — projenin cebinden çıkan her tutar, KDV dahil, maliyettir ve genel toplama girer. KDV kendi kolonunda ayrı izlenir; bu ayrım maliyetten düşmek için değil, fon/rapor görünümlerinde KDV'siz toplam türetmek ve finansman planında geri-dönüş bilgisini taşımak içindir. KDV'nin indirilip indirilmemesi bütçe hesabının konusu DEĞİLDİR — muhasebe/finansman dünyasının sonraki olayıdır. Ekran davranışı (2026-06-30: brüt = net + stopaj/SGK + KDV) bu ilkeyle hizalıdır. Fon sunumu: Eurimages giderleri KDV'siz ister (geri alınamayan hariç) — türetilmiş rapor görünümü, RAPORLAR fazı. vat_deductible alanının kaderi motor tartışmasına bırakıldı. Devreden KDV riski proje-düzeyi uyarıdır, kalem hesabına girmez.

**KAAPA KARARI — vat_deductible'ın kaderi (2026-07-03, ikinci tur):** `budget_items.vat_deductible` alanı KORUNUR (Boolean, varsayılan true; mevcut alan, migration gerekmez); bütçe motoru bu alanı OKUMAZ — KDV her durumda toplamdadır. Alan iki türetilmiş fonksiyona girdi verir: (1) fon raporu: genel toplam eksi indirilebilir satırların KDV'si = KDV'siz proje raporu (CFE'den anlık türetim, saklanmaz; indirilemeyen satırların KDV'si raporda maliyet olarak kalır — Eurimages kuralıyla uyumlu); (2) nakit akış projeksiyonu: indirilebilir satırlardan biriken tutar İndirilecek KDV havuzu — geri dönüş çıktı KDV'sine bağlı MAHSUP olarak simüle edilir, nakden iade vaat edilmez; çıktı faturası yoksa devreden KDV olarak taşınır ve dönmeyen KDV uyarısı düşer. Not: binek araç kira/yakıt KDV'si kanunen indirilemez (KDVK 30/b) — ilgili satırda bayrak false olmalı; uygunluk uyarı adayı.

**KDV oranları (doğrulandı, 2026):** genel **%20** (07.07.2023'ten); indirimli **%10** (konaklama, yemek, sağlık, eğitim, kültürel); **%1** (temel gıda). Telif eseri %0 veya %20 (kapsamına göre).

### 3.1 Beyan edilen ≠ fiili — asgari ücret pratiği (sektör gerçeği)

Türk yapımında yaygın pratik: resmi evrakta kaşe **asgari ücretten** gösterilir, SGK asgari üstünden resmi kanaldan ödenir, kalan **elden** (makbuz karşılığı) ödenir. Sonuç: gerçek SGK/yük, kalemdeki nominal ücretten hesaplanırsa **gerçekçi olmaz** — fiilen SGK'ya ödenen asgari üstündendir.

**KAAPA modeli (teşhis çerçevesi — §6):** Finansal kontrol gerçek nakdi görmek zorunda (§5.1: muhasebenin göremediği para = denetlenemeyen para). Bu yüzden işçilik kalemi iki rakam taşır:
- **`fiili tutar`** — gerçek anlaşma / fiilen ödenen nakit (bütçe kontrol + nakit akışı bunu görür).
- **`beyan edilen matrah`** — resmi/SGK'ya bildirilen (çoğu zaman asgari ücret).
- **SGK fringe = beyan edilen üstünden** (fiili değil).
- **`elden = fiili − beyan`** → gerçek nakit çıkışı olarak izlenir **VE anomali bayrağıyla işaretlenir** (yasal maruziyet: İş K / SGK / GİB / TCK 230 vb.).

**SINIR (Compliance Guard §6, kilitli):** KAAPA farkı **görünür kılar + riski bildirir** ("elden kısım şu; dışarıdan şöyle görünür; şu mevzuata açıksın"). KAAPA **gizleme/kaçırma yöntemi ÖNERMEZ** ve farkı **muhasebe/denetmenden saklamaz** (§5.1). Araç yapımcıyı korur (gerçek pozisyon + maruziyet görünür), kaçakçılık aracı olmaz. Vergi/yasal sonuç → mali müşavir + hukuk; KAAPA tavsiye vermez, teşhis koyar.

*Bu ayrım fringe motoruna aittir (§8 PARK) — şimdi kurulmaz, model hazır tutulur.*

---

## 4. KDV TEVKİFATI — sektörel kalemler (faturalı hizmet alımı)

**Kapsam kararı (2026-07-03):** KDV tevkifatı bütçe motorunun kapsamı DIŞINDADIR — toplam maliyeti ve KDV tutarını değiştirmez, yalnız ödeme rotasını böler (satıcı / devlet 2 no'lu); her iki parça da indirilecek KDV havuzuna girer. Eşik (2026: 12.000 TL/işlem) ve oran denetimi fiş/gerçekleşen düzeyinde yaşar (Faz-1 fiş dünyası, receipts.budget_item_id köprüsü + uygunluk uyarı adayı); bütçe tarafında yalnız kalem-türü bazlı pasif bilgi notu olabilir. Zamanlama detayı (tevkif edilen kısım ertesi ay devlete ödenir) cash-flow projeksiyonu notudur.

KDV tevkifatı = satıcının hesapladığı KDV'nin bir kısmını **alıcının** kesip doğrudan vergi dairesine yatırması (2 no'lu KDV beyannamesi). **Önemli: tevkifat statüden (Bordro/SMM vb.) DEĞİL, faturalı hizmetin TÜRÜNDEN + alıcının kimliğinden + eşikten doğar.** Kalem-bazlı bir "yük" değil, işlem/fatura düzeyinde ayrı bir boyut.

Sinema/TV/reklam sektöründe tetiklenen başlıca kalemler (KDV Genel Uygulama Tebliği, 2026):

| Hizmet türü | Oran | Ne zaman |
|---|---|---|
| **Ticari reklam hizmeti** | **3/10** | Reklam filmi: markaya/ajansa fatura keserken; alt yükleniciden reklam-amaçlı prodüksiyon alırken (tasarım, planlama, yayım, reklam danışmanlığı dahil) |
| **İşgücü temini** | **9/10** | Ajanstan dönemsel asistan / temizlik personeli / bordrosu ajansta olan personel kiralama |
| **Danışmanlık & denetim** | **9/10** | Faturalı hukuk / mali / sektörel danışman |
| **Servis (personel/oyuncu) taşıma** | **5/10** | Faturalı servis/minibüs taşımacılığı |
| **Yük taşıma / nakliye** | **2/10** | Set ekipmanı taşıma |
| **"Diğer hizmetler"** | **5/10** | 5018 cetveli kamu kurumlarına (TRT vb.), döner sermaye, vakıf üniversitesi, BİST şirketleri = **belirlenmiş alıcılara** ifa edilen, tebliğde özel sayılmayan hizmetler |

**Alt sınır: KDV DAHİL 12.000 TL (2026).** Fatura toplamı (matrah değil, KDV dahil) bunu aşarsa tevkifatlı fatura ZORUNLU; altındaysa tevkifat yok, KDV'nin tamamı satıcıya ödenir. *(VUK 588 ile fatura düzenleme sınırına endeksli; her yıl güncellenir.)*

**Çekinceler / tuzaklar:**
- **Reklam tevkifatı: 3/10 kısmi mi, tam mı?** Kaynaklar çelişiyor — bazıları ticari reklamı **tam tevkifat** (sınır aranmaz) sayıyor. **Mali müşavire doğrulat.**
- **"Yapım işleri" tevkifatı (4/10) ≠ FİLM.** Bu **inşaat** yapım işidir (KDV dahil ≥5M TL). Film "yapım"ı ile KARIŞTIRMA — KAAPA'da bu terim film yapımına uygulanmaz; en çok yapılan hata budur.
- Tevkifat **senin kamuya/belirlenmiş alıcıya sattığın** işte (reklam/hizmet faturası) ya da **belirli hizmetleri satın aldığında** (işgücü, taşıma, danışmanlık) çıkar; özel müşteriye sıradan satışta çıkmaz.
- Kira ve GVK 18 telif gibi **tam tevkifat** kalemlerinde 12.000 sınırı aranmaz.

---

## 5. KAAPA'ya BAĞLANIŞ (sonraki şema dilimi — henüz kurulmadı)

Bu belge, kurulacak şema+CFE kolonlarının gerekçesidir. **Önerilen** alanlar (şema diliminde ratifiye edilecek):

- `budget_items.payment_status` — enum: `bordro` / `smm` / `telif_belgeli` / `sirket` / `kira_sahis` / `konaklama` ... **Kaleme ekli; kütüphane/rol atomundan varsayılan gelir (§4.7), kalemde tıklanabilir hücreyle override edilir.** Statü değişince stopaj/fringe/KDV davranışı yeniden türetilir (örn. kamera asistanı varsayılan `bordro`→SGK biner; fatura kesiyorsa hücreden `smm`/`sirket`→fringe sıfırlanır).
- `budget_items.vat_rate` — CANLI (%0/10/20). Vergi hücresi tıklanabilir.
- `budget_items.stopaj_rate` — YENİ (statüden varsayılan; override için alan; B18 — oran girdi, tutar saklanmaz).
- `budget_items.vat_deductible` — YENİ boolean (§3: KDV gerçek maliyet mi).
- **Net/Brüt:** CFE türetir, saklanmaz. Net girilir; brüt = net/(1−stopaj) + KDV katmanı. İki ayrı CFE fonksiyonu: `brutStopaj(net, stopaj)` ve mevcut `kdvAyristir` / `brutBirim`.
- `tevkifat_orani` — OPSİYONEL / ileride (kamu-alıcı senaryosu; Faz 1'de muhtemelen yalnız Compliance Guard uyarısı, hesap değil).
- **`fiili tutar` + `beyan edilen matrah` + `elden`** — beyan≠fiili ayrımı (§3.1). FRINGE MOTORU işidir (§8 PARK); şimdiki şema diliminde DEĞİL. SGK fringe beyan üstünden; elden = fiili−beyan, anomali bayraklı.

**Çift-fringe guard (§4.9 zaten karar):** statü `smm`/`sirket`/`telif_belgeli`/`kira_sahis`/`konaklama` ise SGK fringe SIFIRLANIR (yük faturada/ayrı); yalnız `bordro`da fringe biner.

`rate_catalog` = versiyonlu parametre DB'nin veri katmanı; `fn_open_budget` açılışta bütçeye snapshot'lar (B16 — açık yapım donmuş kopyasını korur). Mevzuat değişince tek yer güncellenir, açık yapımlar etkilenmez. Koda oran gömmek YASAK (B20).

---

## 7. BORDRO MOTORU SPESİFİKASYONU (DILIM-3 — henüz kurulmadı)

**KRİTİK:** Bordro basit % DEĞİL, bir motordur. Sabit %42,5 veya benzeri hardcode YANLIŞ ve YASAK.

**Motor girdileri (kişi-başı, aylık):**
- Net ücret (bütçecinin girdiği)
- Kümülatif yıllık matrah (o kişi için, o ay başına kadar)
- Asgari ücret istisnası (2026: kümülatif hesaplanır, aylık SABİT TUTAR DEĞİL — bkz. §7a)

**2026 GVK 103 dilimleri:**

| Matrah dilimi (TL) | Oran | Önceki dilim vergisi |
|---|---|---|
| 0 – 190.000 | %15 | — |
| 190.001 – 400.000 | %20 | 28.500 |
| 400.001 – 1.500.000 | %27 | 70.500 |
| 1.500.001 – 5.300.000 | %35 | 367.500 |
| 5.300.001 + | %40 | — |

**SGK 2026 (taban/tavan KESİNLEŞTİ — 7566 sayılı Kanun, asgari × 9; işveren senaryosu detayı §7a):**
- Taban: 33.030 TL, tavan: 297.270 TL (asgari × 9)
- İşçi SGK %14 + işçi işsizlik %1 = %15 (brütten)
- İşveren SGK %19,75 (film sektörü varsayılan, imalat-dışı 2 puan indirimli) veya %21,75 (indirimsiz) + işveren işsizlik %2 — "%15,5" ÖNCEKİ TASLAKTA HATALIYDI, 5225 farklı mekanizma (bkz. §7a)

**Damga vergisi:** %0,759 (brüt ücret üzerinden)

**Asgari ücret istisnası:** SABİT TUTAR DEĞİL — asgari ücret matrahına isabet eden vergi kadardır, kendi kümülatifini koşar (Ocak–Haziran ~4.211,33 TL/ay, Temmuz dilim geçişi ~4.537,75 TL, Ağustos–Aralık ~5.615,10 TL/ay — bkz. §7a detay).

**Kümülatif matrah algoritması:** Her ay, o kişinin yıl başından beri kümülatif brüt matrahı hesaplanır; dilim atladıkça o ay hangi dilimden hesaplanacağı değişir → fringe oranı her ay farklı olabilir.

**Örnek:** Aylık 400K net, 3 ay → ~%84 fringe (tahmini; matrah kümülatif büyüdükçe oran artar).

**DILIM-3 parametreleri (hardcode yasak, DB'den okunur):**
- Vergi dilimleri ve oranları (versiyonlu, `valid_from`'lu)
- SGK taban/tavan (yıllık güncelleme)
- Asgari ücret tutarı
- SGK işveren senaryosu (Şirket-Profili checkbox)

---

## 6. KAYNAKLAR (doğrulama, Haziran 2026)

**Compliance Guard — ürün konumlandırma (KİLİT, 2026-07-03):** "KAAPA bir ERP ve bütçe planlama aracıdır; kesin beyanname/bordro üreticisi (mali müşavir yazılımları) değildir. Buradaki hesaplamalar teşhis ve simülasyon amaçlıdır; oranlar kaynak-tarihli referanstır, resmi beyan ve bordro öncesi mali müşavirinizce doğrulanmalıdır." Gösterim yeri açık soru 4 kapsamında kararlaştırılacak. Konumlandırma notu: KAAPA resmi kayıt/beyan katmanının rakibi değildir, yapım karar katmanıdır; zincirde ardışıktırlar.

- KDV oranları (%1/10/20, genel %20 07.07.2023): GİB / KDV tebliğleri; kdvhesaplama.org, dopigo.com, e-faturamcepte.com (Ocak–Haziran 2026).
- Telif stopajı %17 (GVK 94/2-a) + net/0,83 mekaniği: adenymm.com.tr, muhasebetr.com (GVK 18 + KDV genel tebliği örneği).
- Serbest meslek stopajı %20 (GVK 94/2-b): muhasebedunyasi.com, gureli.com.tr.
- KDV tevkifatı 5/10 (diğer hizmetler, belirlenmiş alıcılar) + yapım işleri = inşaat: ismmmo.org.tr, ey.com/tr, GİB tevkifat tablosu, dkn.com.tr.
- Yük taşıma tevkifatı 2/10: istanbulymmo.org.tr.

**Tüm oranlar TASLAK referanstır.** Gerçek bütçe/fatura öncesi mali müşavire doğrulatılmalıdır (Compliance Guard §6 ilkesi: kaynak-tarihli, "doğrulayın" notlu).

---

## 7a. DILIM-3 Genişletilmiş Araştırma — TASLAK (2026-07-02, kararlar bekleniyor)

**Durum:** Geniş araştırma tamamlandı (10 web araması; GİB, SGK, Yargıtay, sektör sendikaları, mali müşavir kaynakları). Karar turu (aşağıdaki açık sorular) BAŞLAMADI — yeni oturumda Engin ile konuşulacak. Bu bölüm TASLAK'tır, kilitli değildir; §7 ve §2'deki eski hatalar (yukarıda) bu araştırmada tespit edilip düzeltildi.

**Kapsam genişletme talimatı (Engin, 2026-07-02):** Bordro motoru yalnız vergi/SGK olarak değil, personelin TÜM yasal gideri olarak tasarlanacak (fazla mesai, hafta tatili/UBGT, kısa-süreli istihdama özgü durumlar, sektörel rejimler dahil). Ayrıca: "sektör proje bazlı çalışır, bir iş max 3/6 ay sürer" — motor 12 aylık kadrolu değil, **3-6 aylık proje istihdamı** varsayımıyla kurulacak.

**Mimari/parametre ayrımı ilkesi (2026-07-03):** Motor yalnız mekanizma bilir (kümülatif dilim, ters-bordro denklemi, istisna mahsubu, senaryo formülleri); tüm mevzuat değerleri `rate_catalog`'da yürürlük-dönemli satırlar olarak yaşar (valid_from/valid_to mantığı). Kanun değişikliği cetvele satır eklemektir, matematiksel mimariye dokunulmaz; ay-bazlı hesap o ayın yürürlük parametresiyle yapılır; mühürlü bütçeleri açılışta-snapshot deseni korur.

### Bordro-dışı yasal personel giderleri (yeni katman)
- **Fazla mesai:** %50 zamlı (×1,5); sözleşme 45 saat altındaysa 45'e kadar %25 (×1,25). **Yıllık tavan 270 saat** — "FM ücrete dahildir" sözleşme hükmü bu tavana kadar geçerli, üstü ayrı alacak doğurur (Yargıtay). Günlük 11 saat mutlak tavan, gece (20:00-06:00) 7,5 saat üstü FM sayılır.
- **Hafta tatili çalışması:** +1,5 yevmiye. **UBGT (resmi tatil/bayram) çalışması:** +1 yevmiye, serbest zamanla telafi YASAK.
- **Kısa projede DOĞMAYAN yükler:** kıdem (1 yıl şartı), ihbar (belirli süreli kendiliğinden biter), yıllık izin ücreti (1 yıl şartı) — 3-6 ay penceresinde üçü de sıfır.
- **Maruziyet notu (kapsam dışı ama bilinsin):** zincirleme yenilenen sözleşme belirsize döner → kıdem+izin+ihbar doğar (dizi sektörünün dava klasiği). 270 saat aşımı ayrı alacak riski.

### Sektörel rejimler
- **Set işçileri tam 4857 kapsamında** — sektör istisnası yok.
- **Ek-6 sanatçı kısmi sigortalılığı (5510 ek m.6):** ayda 10 günden az çalışan sanatçı (film/sahne/ses-saz vb., KTB listesi) primini KENDİSİ öder (%32,5 + isteğe bağlı %3 işsizlik) — işverene SGK yükü BİNMEZ. Karşılığında İş Kazası/Meslek Hastalığı güvencesi YOK. Günlük anlaşılan oyuncu pratiğinin resmi karşılığı; bordro motorunun değil, statü taksonomisinin konusu (ileride "oyuncu-Ek6" statü adayı).
- **5225 Kültür Yatırımları/Girişimleri teşviki (§2'deki eski "%15,5"in gerçek hali):** sabit oran DEĞİL, hisse-karşılama mekanizması. Kültür Girişim Belgesi: işveren SGK hissesinin %25'i, 7 yıl Bakanlıkça karşılanır. Kültür Yatırım Belgesi: %50'si, 3 yıl. Sıra: önce puan indirimi (2 puan), sonra kalan hissenin yüzdesi → 2026 efektif SGK ≈ %14,81 (+%2 işsizlik). Şart: kurumlar vergisi mükellefi + KTB belgesi + borçsuzluk, işyeri bazlı. AÇIK SORU: tipik yapım şirketi bu belgeyi taşıyor mu, sahada fiilen kullanılıyor mu (Engin'in sahası).
- Asgari ücret desteği: işverene 1.270 TL/ay/kişi (şartlı, İşsizlik Fonu mahsuplu).

### MMB bağımlılığı (kapandı, karar gerektirmiyor)
Engin'in sorusuna cevap verildi: MMB hesap numarası eşlemesi motor girdilerini tüketmiyor (motor: statü, aylık net, ay sayısı, parametre tabloları yer; MMB: kütüphane kalemlerine dış-format hesap kodu bağlama, raporlama/ihracat tarafı). Teknik bağımlılık yok, sonraya kalması güvenli.

### Açık sorular — yeni oturumda konuşulacak (sırayla)
1. **Kapsam sınırı:** Motor çekirdeği (SGK+GV+damga+istisna) mi, yoksa FM/hafta tatili/UBGT katmanı da motora girsin mi (örn. kaleme "aylık FM saati" parametresi)? Bütçe hangi dünyayı modellesin: resmi/beyan mı, tam-yasal mı, iki mod mu (bkz. §3.1 beyan≠fiili ile kesişim)? AÇIK (sektör-standardı-varsayılan önerisi masada).
2. **Takvim ayı girdisi — KAPANDI (2026-07-03):** Motor penceresi kalemin kendi verisinden türetilir (dönem tarihleri + Birim/Miktar/Çarpan); kümülatif her proje istihdamında sıfırdan ve kişi bazlı koşar (311 No'lu Tebliğ); uzama muhasebe revizyonudur; 12-ay senaryo tasarım hedefi değildir.
3. **5225 / Ek-6 / asgari ücret desteği — KAPANDI (2026-07-03), üç karar:**
   - (a) Şirket-Profili tek SGK senaryosu seçimi: Borçlu %21,75 / Standart %19,75 varsayılan / Kültür Girişim Belgeli / Kültür Yatırım Belgeli; efektif oranlar `rate_catalog` girdilerinden formülle türetilir, sabit yazılmaz; şart-ihlali ve işyeri-kapsam uyarıları uygunluk katmanında.
   - (b) Asgari ücret desteği bütçeye katılmaz, bilgi olarak gösterilir.
   - (c) Ek-6 için `payment_status` taksonomisine dokunulmaz — bordro altında kalem düzeyi `payroll_profile` alanı (varsayılan standart), profiller ve bileşen-ezmeleri cetvelde yaşar, CFE tek genel mekanizmayla uygular; Ek-6 profili SGK/işsizlik bacaklarını düşürür, GV+damga kalır, kişiye banka net; gelecek profiller Emekli-SGDP ve Yabancı.
4. **Kıdem/ihbar/izin/270-saat maruziyeti:** motor kapsamı dışı ama anomali/uyarı notu olarak ekranda görünsün mü (anomali motoru ailesine komşu)? AÇIK.
5. **Menü yeri:** Tanımlar/cetveller nereye yerleşecek (sol-ray iskeleti konusu, ayrı görüşülecek). AÇIK.

**Not (2026-07-03):** Oturum kararlarının insan-okur tam envanteri ayrı belgede tutulmaktadır (KAAPA-personel-yasal-gider-envanteri v2, repo yeri sonraki oturumda kararlaştırılacak). Bordro motorunun kimliği PCCE (Production Cost Compliance Engine — bütçe hesap katmanı + uygunluk/uyarı katmanı) yönünde genişletilme tartışması sonraki oturuma bırakılmıştır.

*Kaynaklar (2026-07-02 arastirmasi): GİB 332 No'lu GV Tebliği, 7566 sayılı Kanun (RG 19.12.2025), SGK teşvik rehberleri (Ocak 2026), Yargıtay 7. ve 9. HD içtihatları, Sinema-TV Sendikası ve Oyuncular Sendikası yayınları, 5225 mevzuat seti, muhasebetr/alomaliye/CottGroup uzman kaynakları.*
