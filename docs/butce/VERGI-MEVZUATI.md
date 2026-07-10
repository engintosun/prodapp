# KAAPA — VERGİ MEVZUATI (Sektörel Referans)

*Bütçe modülünün vergi mantığının (ödeme-statüsü → KDV / stopaj / net-brüt) TEK KAYNAĞI. Türk film/TV/reklam/belgesel yapımında ödeme türlerinin vergisel davranışı. KART-KATALOGU §4.8 (ödeme-statüsü boyutu) ve §4.9 (çift-fringe guard) ile birlikte okunur.*

*Oluşturma: 23 Haziran 2026. Durum: oranlar web-doğrulandı (aşağıda kaynak+tarih). **TASLAK uyarısı:** mevzuat sık değişir; her oran "kaynak-tarihli, mali müşavire doğrulatın" ilkesiyle tutulur (Compliance Guard — kanonik metin: PERSONEL-MEVZUATI.md §0; KAAPA teşhis/uyarı verir, kesin vergi tavsiyesi vermez).*

---

## GÖREV SINIRI VE STATÜ CETVELİ (✔ MÜHÜR K1, 2026-07-03)

Bu dosya SAF VERGİ doktrinidir. Personelin yasal giderinin tamamı (iş hukuku + SGK + bordro + kişiye ödeme vergi mekaniği + sektörel rejimler) **docs/butce/PERSONEL-MEVZUATI.md**'ye taşındı — bordro-çözücünün ve G defterinin doktrin evi orasıdır.

- **Statü cetveli:** `sirket`, `kira_sahis`, `konaklama` → doktrin evi BU DOSYA. `bordro`, `smm`, `telif_belgeli` → doktrin evi PERSONEL-MEVZUATI.md.
- **Kural:** bir statünün doktrini yalnız kendi evinde yazılır ve güncellenir; diğer dosya yalnız çapraz-referans/özet verir. Çelişkide mevzuat dosyaları diğer dokümanlara karşı kazanır; iki mevzuat dosyası arasında bu cetvel belirler.
- **Bu dosyanın evi olan çapraz konular:** KDV rejimi ve nakit ilkesi (§3), vat_deductible (§3), KDV tevkifatı (§4).

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

*Not (K1): personel-statülerinin (bordro/smm/telif_belgeli) DOKTRİNİ PERSONEL-MEVZUATI'dadır; buradaki satırları özet-referanstır.*

| # | Ödeme statüsü | KDV oranı | Stopaj (GV tevkifat) | Net → Brüt (stopaj şişmesi) | SGK fringe | Not |
|---|---|---|---|---|---|---|
| 1 | **Telif — eser belgeli** (GVK 18) | %0 veya %20 | **%17** (GVK 94/2-a) | Brüt = Net / 0,83 | Binmez | FSEK uyumlu yazılı eser sözleşmesi önerilir (belge şart değil); senarist/besteci/YÖNETMEN kapsar, OYUNCULUK DEĞİL; tavan 5,3M ve KDV üç hal: PERSONEL-MEVZUATI A |
| 2 | **Serbest meslek — şahıs** (SMM) | %20 | **%20** (GVK 94/2-b) | Brüt = Net / 0,80 | Binmez | Yük faturada; en yaygın şahıs ödemesi (doktrin: PERSONEL-MEVZUATI A) |
| 3 | **Şirket faturası** (Ltd/AŞ) | %20 | **%0** | Brüt = Net (KDV ayrı) | Binmez | KDV indirilebilir (koşullu, §3) |
| 4 | **Bordro** (kadrolu) | — (ücret KDV dışı) | Artan tarife (GVK 103) | (basit şişme YOK — ayrı motor) | **Biner** | İşveren SGK payı + damga; gerçek fringe. Motor: PERSONEL-MEVZUATI §1 + B |
| 5 | **Konaklama / yemek** | %10 | %0 | Brüt = Net + %10 KDV | Binmez | Operasyonel gider |
| 6 | **Ulaşım — yük taşıma** | %20 | %0 | Brüt = Net + KDV | Binmez | Alıcı kamuysa **2/10 KDV tevkifatı** (§4) |
| 7 | **Şahıs mekan kirası** (GVK 94/5-a) | %0 | **%20** | Brüt = Net / 0,80 | Binmez | Stopajı kiracı keser; şahıs KDV mükellefi değil |

**Şişme formülünün mantığı:** Stopaj brütten kesiliyorsa ve alacaklıya **net** garanti ediliyorsa: Brüt × (1 − stopaj) = Net → **Brüt = Net / (1 − stopaj)**. Örn. %17 → /0,83; %20 → /0,80. (Kaynak doğrulama: GVK 94/2-a telif %17; serbest meslek %20.)

### 1b. TELİF DOKTRİNİ — TAŞINDI (✔ K1, 2026-07-03)

Telif kapsamı, eser belgesi düzeltmesi (belge ŞART DEĞİL), istisna tavanının yapımcıya etkisizliği, bağımlılık sınırı ve KDV üç-hal mekanizması → **PERSONEL-MEVZUATI.md A bölümü** (kilitli, Engin düzeltmeleri işlenmiş güncel hal).

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
| `bordro` | Artan tarife (motor) | MOTOR (PERSONEL-MEVZUATI) | — | **Biner** |

**Yük kovası mimarisi (karar: "A reddedildi"):** Stopaj kovadan ÇIKARILMAZ. `item_burdens` kalır; içerik statüye göre dolar (bordro→SGK+işsizlik, smm→stopaj20 bileşeni, telif→stopaj17 bileşeni, kira→stopaj20 bileşeni, fatura/konaklama→boş). Her yük bileşeni **cins** taşır (`burden_components.kind`): `additive` (SGK) veya `deduction` (stopaj). CFE cinse göre hesaplar. *DILIM-2a şema eki: cins alanı + statü→bileşen eşlemesi + rate_catalog oranlar.*

---

## 2. STOPAJ (Gelir Vergisi Tevkifatı) — kim, ne kadar

- **Telif (GVK 18 / 94/2-a): %17.** Kapsam, belge/sözleşme kuralı (eser belgesi şart değil), tavan (yapımcı stopajını değiştirmez) ve üç-hal KDV: **PERSONEL-MEVZUATI A**. OYUNCULUK telif DEĞİL → SMM %20. Reklam tevkifatı 3/10 mü 10/10 mu kaynaklar çelişiyor → müşavire doğrulat.
- **Serbest meslek (94/2-b): %20.** SMM ile faturalanan şahıs hizmeti. (Doktrin: PERSONEL-MEVZUATI A.)
- **Kira — şahıs işyeri/mekan (94/5-a): %20.** Kiracı (yapım şirketi) keser, muhtasarla beyan eder. *(Geçmişte pandemi döneminde geçici %10 olmuştu; güncel %20 — doğrula.)*
- **Şirket faturası: stopaj YOK** (kurum kendi kurumlar vergisini öder).
- **Bordro:** stopaj değil, artan tarifeli gelir vergisi (GVK 103) + SGK + damga = ayrı bordro motoru (**PERSONEL-MEVZUATI §1 + B**).
- **SGK işveren oranı:** ham %21,75 (7566 SK sonrası, film/imalat-dışı). Teşvik senaryoları: **%19,75** varsayılan (imalat-dışı 2 puan indirimi, düzenli ödeme şartlı); **%21,75** borçlu/teşviksiz. "%15,5 bakanlık/bölgesel" ifadesi ÖNCEKİ TASLAKTA HATALIYDI — 5225 sayılı Kanun'un Kültür Yatırım/Girişim Belgesi teşviki sabit oran değil, hisse-karşılama mekanizmasıdır (dört-senaryo kararı: **PERSONEL-MEVZUATI B/E**). Şirket-Profili checkbox = DILIM-3 parametre paneli.

---

## 3. KDV — ne zaman gerçek maliyet, ne zaman değil (KRİTİK)

**KAAPA KARARI (KİLİT, 2026-07-03, Engin):** Bütçe nakit dünyasıdır — projenin cebinden çıkan her tutar, KDV dahil, maliyettir ve genel toplama girer. KDV kendi kolonunda ayrı izlenir; bu ayrım maliyetten düşmek için değil, fon/rapor görünümlerinde KDV'siz toplam türetmek ve finansman planında geri-dönüş bilgisini taşımak içindir. KDV'nin indirilip indirilmemesi bütçe hesabının konusu DEĞİLDİR — muhasebe/finansman dünyasının sonraki olayıdır. Ekran davranışı (2026-06-30: brüt = net + stopaj/SGK + KDV) bu ilkeyle hizalıdır. Fon sunumu: Eurimages giderleri KDV'siz ister (geri alınamayan hariç) — türetilmiş rapor görünümü, RAPORLAR fazı. Devreden KDV riski proje-düzeyi uyarıdır, kalem hesabına girmez.

**KAAPA KARARI — vat_deductible'ın kaderi (2026-07-03, ikinci tur):** `budget_items.vat_deductible` alanı KORUNUR (Boolean, varsayılan true; mevcut alan, migration gerekmez); bütçe motoru bu alanı OKUMAZ — KDV her durumda toplamdadır. Alan iki türetilmiş fonksiyona girdi verir: (1) fon raporu: genel toplam eksi indirilebilir satırların KDV'si = KDV'siz proje raporu (CFE'den anlık türetim, saklanmaz; indirilemeyen satırların KDV'si raporda maliyet olarak kalır — Eurimages kuralıyla uyumlu); (2) nakit akış projeksiyonu: indirilebilir satırlardan biriken tutar İndirilecek KDV havuzu — geri dönüş çıktı KDV'sine bağlı MAHSUP olarak simüle edilir, nakden iade vaat edilmez; çıktı faturası yoksa devreden KDV olarak taşınır ve dönmeyen KDV uyarısı düşer. Not: binek araç kira/yakıt KDV'si kanunen indirilemez (KDVK 30/b) — ilgili satırda bayrak false olmalı; uygunluk uyarı adayı.

**KDV oranları (doğrulandı, 2026):**

- **%20 — genel oran (varsayılan).** 07.07.2023'ten geçerli.
- **%10 — indirimli:**
  - Yeme-içme hizmetleri (restoran, lokanta, set catering; alkollü içecekler hariç).
  - Konaklama (otel/pansiyon geceleme).
  - Sağlık / ilaç / tıbbi cihaz.
  - **Tekstil-giyim** (kumaş, giyim eşyası, ayakkabı, çanta, iplik) — **kostüm departmanı alımları bu gruba düşer.**
  - Kültür-eğlence giriş biletleri (sinema, tiyatro, opera, bale, müze).
- **%1 — temel gıda maddeleri** (ham malzeme; hizmet olarak alınan catering %10'dur).
- Telif eseri %0 veya %20 (kapsamına göre, bkz. §1 satır 1).

*Not: bu liste referanstır; kalem bazında `vat_rate` override her zaman mümkündür (§5).*

### 3.1 Beyan edilen ≠ fiili — asgari ücret pratiği (sektör gerçeği)

Türk yapımında yaygın pratik: resmi evrakta kaşe **asgari ücretten** gösterilir, SGK asgari üstünden resmi kanaldan ödenir, kalan **elden** (makbuz karşılığı) ödenir. Sonuç: gerçek SGK/yük, kalemdeki nominal ücretten hesaplanırsa **gerçekçi olmaz** — fiilen SGK'ya ödenen asgari üstündendir.

**KAAPA modeli (teşhis çerçevesi):** Finansal kontrol gerçek nakdi görmek zorunda (§5.1: muhasebenin göremediği para = denetlenemeyen para). Bu yüzden işçilik kalemi iki rakam taşır:
- **`fiili tutar`** — gerçek anlaşma / fiilen ödenen nakit (bütçe kontrol + nakit akışı bunu görür).
- **`beyan edilen matrah`** — resmi/SGK'ya bildirilen (çoğu zaman asgari ücret).
- **SGK fringe = beyan edilen üstünden** (fiili değil).
- **`elden = fiili − beyan`** → gerçek nakit çıkışı olarak izlenir **VE anomali bayrağıyla işaretlenir** (yasal maruziyet: İş K / SGK / GİB / TCK 230 vb.).

**SINIR (Compliance Guard, kilitli — kanonik metin PERSONEL-MEVZUATI §0):** KAAPA farkı **görünür kılar + riski bildirir** ("elden kısım şu; dışarıdan şöyle görünür; şu mevzuata açıksın"). KAAPA **gizleme/kaçırma yöntemi ÖNERMEZ** ve farkı **muhasebe/denetmenden saklamaz** (§5.1). Araç yapımcıyı korur (gerçek pozisyon + maruziyet görünür), kaçakçılık aracı olmaz. Vergi/yasal sonuç → mali müşavir + hukuk; KAAPA tavsiye vermez, teşhis koyar.

*Bu ayrım eski "fringe motoru (§8 PARK)" kimliğine park edilmişti; kimlik K2 ile emeklidir (2026-07-03) — ailenin ev sahibi PCCE tartışmasında belirlenecek (G defteri: PERSONEL-MEVZUATI G). Şimdi kurulmaz, model hazır tutulur.*

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
- **`fiili tutar` + `beyan edilen matrah` + `elden`** — beyan≠fiili ayrımı (§3.1). Eski fringe kimliğine parktı; kimlik K2 ile emekli, ev sahibi PCCE tartışması — şimdiki şema diliminde DEĞİL. SGK fringe beyan üstünden; elden = fiili−beyan, anomali bayraklı.

**Çift-fringe guard (§4.9 zaten karar):** statü `smm`/`sirket`/`telif_belgeli`/`kira_sahis`/`konaklama` ise SGK fringe SIFIRLANIR (yük faturada/ayrı); yalnız `bordro`da fringe biner.

`rate_catalog` = versiyonlu parametre DB'nin veri katmanı; `fn_open_budget` açılışta bütçeye snapshot'lar (B16 — açık yapım donmuş kopyasını korur). Mevzuat değişince tek yer güncellenir, açık yapımlar etkilenmez. Koda oran gömmek YASAK (B20). Katalog türetim zinciri ve satır türleri (oran/tutar/tarife): PERSONEL-MEVZUATI §1.

---

## 7. BORDRO MOTORU — TAŞINDI (✔ K1, 2026-07-03)

Bordro motoru spesifikasyonu, 2026 parametreleri, kümülatif algoritma, SGK senaryoları ve payroll_profile mimarisi → **PERSONEL-MEVZUATI.md §1 (motor doktrini) + B bölümü (parametre envanteri)**. Bu dosyada bordro doktrini tutulmaz.

---

## 6. KAYNAKLAR (doğrulama, Haziran 2026)

**Compliance Guard — ürün konumlandırma (KİLİT, 2026-07-03):** kanonik metin ve konumlandırma **PERSONEL-MEVZUATI.md §0**'dadır; gösterim yeri açık soru 4 kapsamında kararlaştırılacak.

- KDV oranları (%1/10/20, genel %20 07.07.2023): GİB / KDV tebliğleri; kdvhesaplama.org, dopigo.com, e-faturamcepte.com (Ocak–Haziran 2026).
- Telif stopajı %17 (GVK 94/2-a) + net/0,83 mekaniği: adenymm.com.tr, muhasebetr.com (GVK 18 + KDV genel tebliği örneği).
- Serbest meslek stopajı %20 (GVK 94/2-b): muhasebedunyasi.com, gureli.com.tr.
- KDV tevkifatı 5/10 (diğer hizmetler, belirlenmiş alıcılar) + yapım işleri = inşaat: ismmmo.org.tr, ey.com/tr, GİB tevkifat tablosu, dkn.com.tr.
- Yük taşıma tevkifatı 2/10: istanbulymmo.org.tr.

**Tüm oranlar TASLAK referanstır.** Gerçek bütçe/fatura öncesi mali müşavire doğrulatılmalıdır (Compliance Guard ilkesi: kaynak-tarihli, "doğrulayın" notlu).

---

## 7a. DILIM-3 GENİŞLETİLMİŞ ARAŞTIRMA — TAŞINDI (✔ K1, 2026-07-03)

Araştırma birikimi ve karar seti **PERSONEL-MEVZUATI.md**'ye taşındı (çekirdek: envanter v2.1). Açık sorular 1/4/5 artık orada, H bölümünde yaşar. Bu dosyada personel doktrini tutulmaz.
