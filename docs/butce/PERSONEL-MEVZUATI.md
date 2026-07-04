# KAAPA — PERSONEL MEVZUATI (Bordro-Çözücü ve G Defteri Doktrin Evi)

*Sürüm: v3.0 — 3 Temmuz 2026 (3. oturum). Çekirdek: "Personelin Yasal Gideri — Tam Parametre Envanteri" v2.1 (KİLİTLİ) + DILIM-3 K1–K11 mühürleri ve derin tasarım turu doktrinleri. Bu belge insan-okur doktrin belgesidir; veritabanı formatı değildir.*

*İşaretler: ● önceden kilitli · ★ araştırmayla doğrulandı · ✔ KARAR kilitli karar · ✔ MÜHÜR (K#) DILIM-3 karar turu mührü (3 Temmuz 2026) · ⚠ uygunluk katmanına (G defteri) devredilen uyarı adayı.*

---

## 0. GÖREV SINIRI VE STATÜ CETVELİ (✔ MÜHÜR K1)

- Bu dosya: bir insana EMEĞİ/ESERİ için yapılan ödemelerin tüm yasal doktrini — iş hukuku + SGK + bordro + gelir vergisi mekaniği + sektörel rejimler. Bordro-çözücünün ve G defterinin doktrin evi burasıdır.
- **Statü cetveli (doktrin evi ataması):**
  - `bordro`, `smm`, `telif_belgeli` → **PERSONEL-MEVZUATI.md** (bu dosya)
  - `sirket`, `kira_sahis`, `konaklama` → **VERGI-MEVZUATI.md**
- **Kural:** bir statünün doktrini yalnız kendi evinde yazılır ve güncellenir; diğer dosya yalnız çapraz-referans/özet verir. Çelişkide mevzuat dosyaları diğer dokümanlara karşı kazanır; iki mevzuat dosyası arasında bu cetvel belirler.
- **Çapraz konular:** KDV rejimi, KDV nakit ilkesi, `vat_deductible`, KDV tevkifatı → doktrin evi **VERGI-MEVZUATI.md (§3/§4)**. Bu dosyanın çekirdeğindeki (A bölümü) ilgili pasajlar envanter bütünlüğü için korunan kilitli KAYITTIR; gelecekteki her güncelleme yalnız VERGI-MEVZUATI'da yapılır.
- **G defteri TEK'tir:** vergi kökenli uyarı adayları dahil tüm uygunluk-adayı birikim G bölümünde tutulur (bölünmüş defter drift üretir; PCCE tartışması tek girdiyle başlamalı). PCCE kararında defter kendi dosyasına taşınabilir — bu bir kapıdır, bugün karar değildir.
- ✔ **Compliance Guard ürün metni (KİLİT; kanonik ev burası, gösterim yeri açık soru 4):** "KAAPA bir ERP ve bütçe planlama aracıdır; kesin beyanname/bordro üreticisi (mali müşavir yazılımları) değildir. Buradaki hesaplamalar teşhis ve simülasyon amaçlıdır; oranlar kaynak-tarihli referanstır, resmi beyan ve bordro öncesi mali müşavirinizce doğrulanmalıdır." Konumlandırma: KAAPA resmi kayıt/beyan katmanının (mali müşavir yazılımlarının) rakibi değil, yapım karar katmanıdır — zincirde ardışıktırlar (KAAPA simüle eder, müşavir resmi üretir).

---

## 1. MOTOR DOKTRİNİ — DILIM-3 MÜHÜRLERİ (3 Temmuz 2026)

- ✔ MÜHÜR (K2) — **Tek motor, tek kapı, iki aile:** CFE tek motordur; `hesaplaKalem` tek giriştir; statüye göre kova-yorumlayıcı (mevcut fonksiyonlar, dokunulmaz) veya bordro-çözücü çalışır; ikisi aynı ZARF'ı doldurur. "Fringe motoru" ayrı kimlik olarak emeklidir.
- ✔ **ZARF sözleşmesi:** net toplam · brüt toplam · kova dökümü · aylık seri (bordro ailesi: ay, kişi-başı brüt, SGK-işveren, GV, damga, istisna, kişi-başı maliyet, efektif Miktar, ay toplamı) · sinyaller · parametre izi (kullanılan katalog satırlarının kimlikleri — Compliance Guard "kaynak-tarihli" ilkesinin teknik karşılığı). UI ve servis zarf dışını görmez.
- ✔ MÜHÜR (K3) — **Üçlü sınır:** davranış kütüphanesi KODDA; bileşen-iskelet eşlemesi CETVELDE (payment_status_burdens + payroll_profiles); sayılar YÜRÜRLÜK-DÖNEMLİ KATALOGDA. Formül-DB/DSL reddedilmiştir (iç-platform tuzağı; test edilemez; B18 çürür). Katalog yayını KAAPA admini işidir.
- ✔ MÜHÜR (K4) — **Oransız iskelet:** bordro kovası bileşen+cins+davranış+katalog-anahtarı taşır, SAYI TAŞIMAZ; `fn_refill` tek tazeleme motoru kalır, profili iskelete uygular. Bilinen bedel: `rate_percent` nullable migration + refill davranışı (F2) + kopuk `stopaj_rate` teli (F3) AYNI spec'te (DILIM-3a).
- ✔ MÜHÜR (K5) — **Ay motoru:** pencere kalemin kendi verisinden (dönem tarihleri + Birim + Çarpan[süre]); kümülatif tüm pencere boyunca kesintisiz; takvim-yılı sıfırlaması MODELLENMEZ (yıl-aşımı ihtiyat-lehine + sinyal); kıst ay orantılı (net orantı; SGK taban/tavan prim günüyle orantı, maktu ayda 30 gün kuralı); denklem iskeletten kurulur ve parçalı-doğrusal KESİN çözülür — kırılma noktaları: GV dilim geçişleri, SGK tavanı, istisna tavanı, damga tabanı; tekdüzelik tek kök garanti eder; segment içinde kapalı-form. Her ay brütten-nete round-trip iç doğrulaması. Miktar sonda (K9 terminoloji mührüyle düzeltilmiş ibare; v2.1 metnindeki "Çarpan sonda" eski terimledir). İterasyon yoktur — kuruş sürüklenmesi ve sonsuz döngü sınıf olarak imkânsızdır.
- ✔ **Kuruş doktrini:** iç aritmetik Decimal, hassasiyet kuruş; ara değerde yuvarlama yok; bileşen-ay sonuçları yarım-yukarı; çözülen brüt kuruşa YUKARI yuvarlanır (deterministik ihtiyat); round-trip |net′ − net| ≤ 1 kuruş ASSERT edilir — tutmazsa bu sinyal değil HATA'dır (sessiz-hata yasağının motor içi hali). Zarf kenarında sonuçlar mevcut tam-TL konvansiyonuna teslim edilir.
- ✔ **Katalog türetim zinciri (B18'in katalog yüzü):** katalogda yalnız BİRİNCİL kanun değerleri durur — asgari brüt, işçi/işveren oranları, GVK 103 ücret tarifesi basamakları, tavan katsayısı 9 (7566), damga binde 7,59, senaryo girdileri. Türetilebilen hiçbir sayı katalogda durmaz: tavan TL'si, istisna tutarları (K10), efektif senaryo oranları — motor türetir. Yürürlük deseni: `valid_to` kolonu YOK; yeni satır eskisini kapatır ("valid_from ≤ ay olan en yeni satır") + (anahtar, valid_from) tekilliği. Mühür snapshot'ı: pencereyi kapsayan satır KÜMESİ dondurulur, skaler değil — Temmuz sıçraması mühürlü bütçede de doğru kalır. Katalog TEK evdir: `rate_catalog` genişler (satır türleri: oran · TL tutar · tarife basamağı), ikinci ev açılmaz.
- ✔ MÜHÜR (K6) — **Sinyal ilkesi:** motor hesap-içi gerçekleri nötr sinyal olarak zarfta yayar; yorum/uyarıya çevirme motorun DIŞIdır (sahibi PCCE tartışması). Sinyal kod+veridir, METİN TAŞIMAZ (metin yorum katmanının işidir; motor dil bilmez).
- ✔ **Sinyal envanteri v0:** SNL-TAKVIM-VARSAYILAN (K7) · SNL-YIL-ASIMI (K5) · SNL-BOLUM-ESIT-DAGITIM (K8) · SNL-MIKTAR-DEGISIM (K9) · SNL-EK6-GUN (ayın fiili gün sayısı verisiyle; 10-gün YORUMU uygunluk katmanının).
- ✔ MÜHÜR (K7) — **Tarihsiz dönem:** çözücü bütçe açılış ayından varsayılan takvim kurar + sinyal. ŞART (Engin, aynen): normal Kaydet HİÇBİR koşulda tarih istemez ve engellemez; tarih zorunluluğu yalnız Mühür (Freeze/Lock) ve harcama fazına geçiş kapısında (`fn_lock_budget`). Şema hazır: `budget_stages.start_date/end_date` nullable + `is_undated`.
- ✔ MÜHÜR (K8) — **Sabit/bölüm dağıtımı:** sabit → dönem başlangıç ayına tek vuruş; bölüm → aralığa eşit dağıtım + sinyal. (Bölüm-başı kaşe ile sabit ödemelerin nakit davranışına birebir — Engin teyidi.)
- ✔ MÜHÜR (K9) + **TERMİNOLOJİ MÜHRÜ:** Miktar = kişi/adet SAYISI · Çarpan = SÜRE (kaç gün/hafta/ay/bölüm) · Birim = periyodun CİNSİ. (GLOSSARY'ye işlendi.) Kural: tek-kişi kümülatif zaman çizgisi pencere boyunca çözülür; her ayın kişi-başı maliyeti o ayın EFEKTİF MİKTAR'ıyla çarpılır. Miktar dönemler arasında ARTARSA geç katılan kişi paylaşılan çizginin ilerlemiş kümülatifini devralır → vergi fazla tahmin edilir → sapma HER ZAMAN ihtiyat-lehinedir + SNL-MIKTAR-DEGISIM.
- ⚠ **FAZ SINIRI — DİZİ KAYDI (Engin, 3 Temmuz 2026):** Tek-çizgi × Miktar modeli (K9) ve yıl-aşımı-sıfırlamasızlığı (K5), reklam ve 2-3 aylık butik sinema projelerinde sorunsuzdur (sapma küçük). DİZİ (TV/Dijital) bütçeleme vizyonunda çalışma süreleri 6 ay ve üstüne çıkar; uzun pencerede her iki ihtiyat sapması BÜYÜR (geç katılan kişi modelde yüksek dilimden başlatılır; yılbaşı sıfırlaması kaçırılır). Dizi vizyonu tetiklendiğinde K9 ve K5 bu madde üzerinden BİRLİKTE yeniden açılır — ikisi de aynı "3-6 ay penceresi" varsayımına yaslanır. Aday mekanizma (kayıt, karar değil): kohort-bazlı çizgi — Miktar artışında yeni kohort kendi kümülatifiyle başlar (kesin ve ucuz); Miktar azalışında son-giren-ilk-çıkar konvansiyonu ihtiyat-lehinedir. CURRENT.md "KAPI AÇIK" listesine de işlendi.
- ✔ MÜHÜR (K10) — **İstisnalar türetilir:** asgari-ücret GV ve damga istisnaları katalogda saklanmaz; motor asgari brüt + işçi oranları + tarifeden türetir (asgari kendi kümülatifini koşar). Envanter değerleri ALTIN-TEST fikstürüdür: istisna serisi 4.211,33 / ~4.537,75 / 5.615,10 · damga istisnası 250,70 · standart senaryo referans maliyeti 40.214,03.
- ✔ MÜHÜR (K11) — **Uygunluk ≠ anomali:** uygunluk kural-bazlı/deterministiktir; anomali desen-bazlı şüphedir (Faz-2). PCCE ad/kapsam tartışması yalnız birincinin üzerinden yürür. KAYIT: "aynı kişi iki ayrı kalemde" → G defteri sinyal adayı.
- ✔ **Test/aldanmazlık katmanı:** altın fikstürler (K10 seti + Temmuz geçiş serisi) · round-trip property testi (rastgele net/ay/profil) · sınır testleri (dilim sınırına tam oturan matrah, tavan kesişimi, 1 günlük kıst, dönem ortası Miktar artışı) · parametre-geçiş testi (Haziran→Temmuz). Hedef: 28 → ~50+ test.
- ✔ **Dilimleme:** DILIM-3a şema+iskelet dünyası (rate nullable + katalog satır türleri + payroll_profile + fn_refill genişlemesi + F3/F8 — tek spec; şema/RLS değişikliği: uygulama öncesi Engin SQL onayı) → 3b katalog 2026 seed (yalnız birincil değerler) → 3c CFE bordro-çözücü saf modül + testler → 3d UI (aylık döküm + sinyal yüzeyi v0 + "motor bekliyor" etiketinin kalkışı).

---

## ÇEKİRDEK — Personelin Yasal Gideri: Tam Parametre Envanteri (v2.1, KİLİTLİ)

*Amaç: KAAPA bütçesini etkileyen TÜM yasal personel-gider parametrelerini tek yerde, oranlarıyla görmek. A–H harf yapısı korunur (iç referanslar ve "G defteri" adı bu harflere bağlıdır). Repo yeri sorusu KAPANDI: ev bu dosyadır (K1). İçerik v2.1'dir; yalnız K9 terminoloji mührü ilgili satırda işaretle işlenmiş, Compliance Guard metni §0'a alınmıştır (çift ev açılmaz).*

### A. Ödeme statüleri ve çarpanları (kalem bazında)

- ● **Telif (GVK 18):** stopaj **%17** → Brüt = Net / 0,83. Kapsar: senarist, besteci, yönetmen (FSEK md.8 — sinema eserinin kanunen birlikte sahipleri). KAPSAMAZ: oyunculuk, seslendirme, dublaj, sunuculuk.
- ✔ DÜZELTME (Engin): **Kültür Bakanlığı eser belgesi ŞART DEĞİLDİR** — kanuni dayanağı yok. Doğru formül: **FSEK'e uygun yazılı eser sözleşmesi önerilir** (ispat aracı); filmin kayıt-tescilinde eser sahibi olarak yer almak ispatı tamamlar (tescil zaten yapımcının zorunlu işlemi, yönetmene ayrı belge yükü yok).
- ⚠ İdare pratiği: eser niteliği belgelenemezse özelge %20 (94/2-b) uygulanmasını öngörüyor — belgesiz %17 uygulaması tarhiyat riski taşır. "Sözleşme önerilir" notu bu riski karşılar.
- ✔ DÜZELTME (Engin): **istisna tavanı (2026: 5.300.000 TL) ödeme yapanın stopajını DEĞİŞTİRMEZ.** GVK 18 son fıkra: istisnanın tevkifata şümulü yok — %17 her durumda kesilir. Tavan aşımının sonuçları eser sahibinin yıllık beyan yükümlülüğüdür; yapımcının yasal yüküne etkisi YOKTUR. (Bilgi notu olarak kalır, modele girmez.)
- ⚠ Bağımlılık sınırı: emir-talimat + devamlılık + bağlılık varsa ödeme ÜCRET sayılır (özelge) — telif→bordro dönüşme uyarısı.
- ★ **Telif KDV — üç hal (KDV kişiye ASLA ödenmez; kişiye banka = NET):**
  - **Arızi teslim** → serbest meslek faaliyeti sürekli değilse KDV'nin konusuna girmez; KDV = 0, ne kişiye ne devlete.
  - **Sürekli + münhasıran GVK 94 mükelleflerine teslim** → yapımcı gider pusulası keser; **stopaj dahil brüt** matrah üzerinden KDV hesaplayıp **sorumlu sıfatıyla 2 No'lu beyannameyle devlete** öder; aynı dönem 1 No'lu beyannamede indirir. Hesaplanan KDV stopaj matrahına girmez.
  - **Kişi kendi KDV mükellefiyetiyle makbuz keser** → KAAPA'da bu kalem telif değil, **SMM statüsü + stopaj %17 override** olur (KDV kişiye ödenir, normal SMM akışı).
  - Dayanak: tebliğdeki resmi mekanizma — ödeme yapan, satıcıdan hangi halde olduğunu beyan eden **yazı** talep eder. ⚠ Yazı eksikliği uygunluk uyarısı adayı.
- ● **SMM (serbest meslek, şahıs):** stopaj **%20** → Brüt = Net / 0,80. KDV %20 (kişiye ödenir).
- ● **Şahıs mekân kirası:** stopaj **%20** → Brüt = Net / 0,80. KDV yok.
- ● **Şirket faturası:** stopaj yok. KDV %20.
- ● **Konaklama:** yük 0. KDV **%10**.
- ● **Bordro (kadrolu):** basit çarpan YOK — kümülatif MOTOR (bölüm B). SGK biner, KDV yok.
- ✔ KARAR — **KDV İLKESİ (REVİZE — nakit dünyası):** Bütçe nakit dünyasıdır: projenin cebinden çıkan her tutar — KDV dahil — maliyettir ve **genel toplama girer**. KDV kendi kolonunda ayrı izlenmeye devam eder; bu ayrım maliyetten düşmek için değil, (a) fon/rapor görünümlerinde KDV'siz toplam türetebilmek, (b) finansman planında geri-dönüş bilgisini taşımak içindir. **KDV'nin indirilip indirilmemesi bütçe hesabının konusu DEĞİLDİR** — o, muhasebe/finansman dünyasının sonraki olayıdır (film için alınan araba bütçeye tam bedeliyle yazılır; film bitince satılması bütçenin konusu değildir). KDV matrahı brüt (stopaj dahil bedel); stopaj matrahına KDV girmez. *(Doktrin evi: VERGI-MEVZUATI §3; buradaki pasaj kilitli kayıttır.)*
- ★ Fon sunumu: Eurimages bütçe kılavuzu giderleri KDV'siz ister (geri alınamayan KDV hariç) — bu türetilmiş bir RAPOR görünümüdür (RAPORLAR fazı); KDV kolonu ayrı izlendiği için çıkarılabilir. Türk destek pratiğinde KDV'siz bütçe şartına dair kural bulunamadı; belgeleme fatura (KDV dahil) dünyasıdır.
- ✔ KARAR — **budget_items.vat_deductible KORUNUR** (Boolean, varsayılan true; mevcut alan, migration yok). Bütçe motoru bu alanı OKUMAZ — KDV her durumda toplamda (nakit ilkesi). Alan iki türetilmiş fonksiyona girdi verir: (1) **Fon raporu:** genel toplam − indirilebilir (true) satırların KDV'si = KDV'siz proje raporu (CFE'den anlık türetim, saklanmaz; false satırların KDV'si raporda maliyet olarak kalır — Eurimages kuralıyla birebir); (2) **Nakit akış projeksiyonu:** true satırlardan biriken tutar "İndirilecek KDV havuzu" — geri dönüş çıktı KDV'sine bağlı MAHSUP olarak simüle edilir, nakden iade vaat edilmez; çıktı faturası yoksa devreden KDV olarak taşınır ve "dönmeyen KDV" uyarısı düşer. *(Doktrin evi: VERGI-MEVZUATI §3.)*
- ⚠ Devreden KDV riski (çıktı faturası yok → indirim dönmüyor) proje-düzeyi uyarıdır, kalem hesabına girmez.
- ● **KDV tevkifatı (işlem düzeyi, statüden bağımsız):** işgücü temini **9/10**, belirlenmiş alıcılara diğer hizmetler **5/10**, yük taşıma **2/10**. 12.000 TL işlem eşiği (tam tevkifatta aranmaz). Reklam tevkifatı 3/10 mü 10/10 mu — kaynaklar çelişik, müşavire sorulacak. *(Doktrin evi: VERGI-MEVZUATI §4.)*
- ✔ KARAR — **Tevkifat bütçe motorunun kapsamı DIŞINDADIR:** toplam maliyeti ve KDV tutarını değiştirmez, yalnız ödeme rotasını böler (satıcı / devlet-2 No'lu); her iki parça da indirilecek KDV havuzuna girer. Eşik ve oran denetimi fiş/gerçekleşen düzeyinde yaşar (Faz-1 fiş dünyası, receipts köprüsü + PCCE uyarı adayı — anomali motoruyla ilk somut kesişim). Bütçe tarafında yalnız kalem-türü bazlı pasif bilgi notu olabilir. Zamanlama detayı (tevkif edilen kısım ertesi ay devlete) → cash-flow projeksiyonu notu.
- ✔ KARAR — **Compliance Guard ürün metni:** kanonik metin ve konumlandırma §0'dadır (bu dosya); çift ev açılmaz.

### B. Bordro motoru çekirdeği — 2026 resmi parametreleri

- ✔ İLKE — **Net sabittir:** Birim net / Net toplam mevzuattan etkilenmez; kişiyle konuşulan rakam dokunulmazdır. Tüm bordro mevzuatı **Yasal Yük** kovasında yaşar. Net anlaşma nedeniyle hukuken "işçi kesintisi" olan kalemler de (SGK işçi %14 + işsizlik %1, GV, damga) ekonomik olarak yapımcıdadır — döküm iki grup etiketle gösterilir (işveren payları / net anlaşma gereği üstlenilen işçi tarafı), toplamın tamamı yüktür. Kişiye banka = net (bordroda KDV yok).
- ✔ İLKE — **Ters bordro (gross-up):** standart bordro brütten nete iner; bizimki tersten — net sabit, brüt aranan değer. Kümülatif dilim + asgari ücret istisnası nedeniyle doğrusal formül değil, motorun çözdüğü denklemdir.
- ✔ KARAR — **Mimari/parametre ayrımı:** motor yalnız MEKANİZMA bilir (kümülatif dilim atlama, ters-bordro denklemi, istisna mahsubu, senaryo formülleri); tüm mevzuat değerleri — aşağıdaki 2026 parametreleri dahil — rate_catalog'da **yürürlük-dönemli** satırlar olarak yaşar (valid_from mantığı). Kanun değişikliği = cetvele satır eklemek; matematiksel mimariye dokunulmaz. Ay-bazlı hesap o ayın yürürlük parametresiyle yapılır (Temmuz istisna sıçraması, Ocak taban/tavan değişimi, olası ara zam bu mekanizmayla çözülür); mühürlü bütçeleri açılışta-snapshot deseni korur.
- ★ **Asgari ücret:** brüt **33.030,00** / net **28.075,50** TL/ay (günlük brüt 1.101). Temmuz 2026 ara zammı YOK — yıl boyu tek dönem.
- ★ **İşçi kesintileri:** SGK **%14** + işsizlik **%1** = brütten **%15** (asgaride 4.954,50 TL).
- ★ **GVK 103 ücret tarifesi (2026, kümülatif):**
  - 0 – 190.000 → **%15**
  - 190.000 – 400.000 → **%20** (ilk dilimin vergisi 28.500)
  - 400.000 – 1.500.000 → **%27** (70.500)
  - 1.500.000 – 5.300.000 → **%35** (367.500)
  - 5.300.000 üzeri → **%40** (ücrette taban vergi 1.697.500)
  - Dikkat: ücret tarifesi ile ücret-dışı tarife FARKLI (3. dilim ücrette 1,5M, diğerlerinde 1M). Bordro motoru ÜCRET tarifesini kullanır.
- ★ **Kümülatif matrah mantığı:** vergi, birikmiş matraha göre dilim atlar → aynı net için işveren maliyeti ay ilerledikçe ARTAR; bizde net sabit, yük büyür. Set ücretlerinde dilim atlaması 3-6 aylık pencerede de yaşanır (örn. ~300K/ay matrah 1. ayda %20'yi, 2. ayda %27'yi görür) — motor bu yüzden motor kalır.
- ✔ NOT (Engin): sinema/TV proje bazlıdır, projeler genelde 3-6 ayı aşmaz; sözleşme uzaması bütçenin konusu değildir — 6 ayı aşan proje **muhasebe revizyonuyla** çözülür; 1 yıl sık karşılaşılan durum değildir. **12-ay kadrolu senaryo tasarım hedefi DEĞİLDİR.** *(Dizi vizyonu istisnası: §1 Faz Sınırı / Dizi Kaydı.)*
- ★ **Kümülatif taşıma kuralı (311 No'lu Tebliğ, doğrulandı):** yeni işverende matrah **SIFIRDAN** başlar; kümülatifin devamı ancak çalışanın talebiyle (istisnai). Proje istihdamında "0'dan başlat" hukuken varsayılan davranıştır. ⚠ Net anlaşmada çalışan taşıma talep ederse fark vergi yapımcıya biner — uyarı adayı.
- ✔ KARAR — **Motor penceresi kalemin kendi verisinden türetilir:** dönem tarihleri (başlangıç ayı) + Birim/Miktar/Çarpan (süre). Kullanıcıya ayrıca sorulmaz, saklanmaz (B18). Başlangıç ayı yalnız PARAMETRE seçimi için gerekir (istisna tutarı Temmuz'da, SGK taban/tavan Ocak'ta değişir). Gün/hafta birimli kalemler takvim ayına orantılı dağıtılır (kısmi ay kıst); kümülatif KİŞİ bazlı koşar, sonuç **Miktar (kişi/adet)** ile çarpılır. ✔ TERMİNOLOJİ MÜHRÜ (K9, 3 Temmuz 3. oturum): v2.1'deki "sonuç Çarpan ile çarpılır" ibaresi düzeltildi — Miktar = kişi/adet, Çarpan = süre (bkz. GLOSSARY).
- ★ **Asgari ücret GV istisnası (mekanik):** aylık SABİT DEĞİL. İstisna = asgari ücret matrahına (28.075,50/ay) isabet eden vergi; asgari kendi kümülatifini koşar:
  - Ocak–Haziran: **4.211,33 TL/ay** · Temmuz (dilim geçişi): **~4.537,75 TL** · Ağustos–Aralık: **5.615,10 TL/ay**
  - Kural: istisna o ayda asgari ücret üzerinden hesaplanacak vergiyi aşamaz; birden fazla işverende yalnız EN YÜKSEK ücrete uygulanır.
- ★ **Damga vergisi:** brüt ücret üzerinden **%0,759**. Asgariye isabet eden kısım istisna: **250,70 TL/ay** (3.008,40/yıl).
- ★ **SGK prime esas kazanç:** taban **33.030** / tavan **297.270** TL (asgari × **9**, 7566). İşsizlik primi de tavana tabi. Tavan üstü kazançta SGK/işsizlik kesilmez ama GV + damga tam işler.
- ✔ KARAR — **İşveren SGK senaryoları = Şirket-Profili'nde TEK SEÇİM (dört durum):**
  - **Borçlu/teşviksiz: %21,75** (MYÖ işveren +1 puan dahil)
  - **Standart: %19,75 — VARSAYILAN** (imalat-dışı 2 puan indirimi; borçsuzluk + zamanında bildirge şartlı)
  - **Kültür Girişim Belgeli: ≈%14,81** (kalan işveren hissesinin %25'i, 7 yıl Bakanlıkça)
  - **Kültür Yatırım Belgeli: ≈%9,88** (kalan hissenin %50'si, 3 yıl Bakanlıkça)
  - İşveren işsizlik **%2** her senaryoda üste biner. İmalat 5 puan bize uygulanmaz.
  - Efektif oranlar SABİT YAZILMAZ: motor senaryo formülünü saklar, girdi oranlar rate_catalog'da yaşar (B20); bütçe açılış ve statü-değişim snapshot'ı senaryoyu okur.
  - ⚠ Şart ihlali (borçlanma, geç bildirge → teşvik geri alınır) ve belge işyeri-bazlı olduğu için kapsam teyidi (set lokasyonu ≠ belgeli işyeri) uygunluk katmanında.
  - Referans maliyet: asgari ücretlinin işverene maliyeti standart senaryoda 40.214,03 TL/ay.
- ✔ KARAR — **payroll_profile (kişi-profili katmanı):** Ek-6 ve gelecekteki kişi-profilleri (Emekli-SGDP, Yabancı vb.) **payment_status'a EKLENMEZ** — taksonomi korunur. Bordro statüsü altında kalem-düzeyi payroll_profile alanı (varsayılan: standart); profiller ve bileşen-ezmeleri CETVELDE yaşar (B20), CFE tek genel mekanizmayla uygular (statü temel seti kurar, profil ezer). Yeni profil eklemek = cetvele satır eklemek, core koda dokunuş yok.
- **Ek-6 profili:** SGK/işsizlik bacakları düşer; GV + damga + asgari ücret istisnası + kümülatif KALIR (kova boş değil, küçülür); kişiye banka = net.
- ★ **BES otomatik katılım:** 45 yaş altı, 5+ çalışanlı işyerinde %3 işçi kesintisiyle başlatma zorunlu; **işverene maliyet DEĞİL** — ters-bordro denklemine GİRMEZ, kişi tarafında bilgi satırıdır (kesinti kişinin kendi emeklilik hesabına gider); 2 ay cayma hakkı, kısa istihdamda cayma yaygın.
- ✔ TASARIM NOTU (Engin — bordro parametre paneli/personel girişi, sırası gelince spec'e): 45 yaş altı bordrolu eklendiğinde sistem %3 BES simülasyonunu otomatik yapsın; yanında tooltip: "Bu tutar işverene ek maliyet değildir; işçinin net maaşından kesilerek kendi emeklilik hesabına aktarılır; 2 ay içinde cayma hakkı vardır."
- ⚠ Yükümlülük uyarısı: 5+ bordrolu projede kesip aktarmamak idari para cezası doğurur.

### C. Çalışma süresi katmanı — sektör standardı + yasal çerçeve

- ✔ SEKTÖR STANDARDI (Engin + sendika ilkeleri, bütçe motoru varsayılanı adayı): **günlük çalışma 8 saattir; 8 saatten sonrası mesai hesaplanır; set günü 12 saati aşamaz (yemek araları dahil).** Yasal uyum: 11 saatlik mutlak tavan FİİLİ çalışmadır, ara dinlenmesi sayılmaz — 12 saatlik set günü 1 saat arayla yasal tavana tam oturur (sayma biçimi farkı: kapı-kapı vs fiili).
- ★ Sendika Dizi Çalışma İlkeleri (referans çizgisi): haftalık en fazla 72 saat; ekip onayıyla günlüğe en fazla +4 saat; iki çalışma günü arası İstanbul ≥11 / şehir dışı ≥10 saat; 6 gün çalışma + 1 gün repo; repo ≥36 saat; 14 günde ≥2 repo; özel durumda ardışık en çok 8 gün. Reklamda: çalışma saatleri sınırlı, saat bazlı mesai uygulaması, iki yemek arası ≤6 saat.
- ★ **FM oranı — araştırıldı (Engin'in sorusu):** yeni bir düzenleme/anlayış YOK. %50 zam **emredici asgaridir**, sözleşmeyle altına İNİLEMEZ (üstü kararlaştırılabilir). "FM'i düz saat ücretinden ödeme" pratiği hukuken geçersizdir — fark her zaman alacak doğurur. Hukuka oturan kurgu: **kaşe/yevmiye 12 saatlik set gününü fiyatlar + "FM ücrete dahildir" hükmü** (270 saate kadar geçerli). Sektörde iki rejim: dizi/sinema = kaşe-dahil; reklam = saatlik mesai.
- ★ **Hafta tatili — araştırıldı (Engin'in sorusu):** Yargıtay yerleşik: hafta tatilinde çalışma %50 zamlı; hak edilen 1 yevmiye + çalışma karşılığı 1,5 = **toplam 2,5 yevmiye**. Sektör bunu repo kurumuyla (6+1) çözmüş; repo günü çalışma istisnaidir — olursa yasal kural işler.
- ★ **Gece çalışması (20:00–06:00):** azami 7,5 saat; aşan kısım FM.
- ★ **UBGT çalışması:** +1 yevmiye (toplam 2); serbest zamanla telafi YASAK. Arefe 13:00 sonrası yarım gün.
- ★ **Ara dinlenme:** ≤4 saat → 15 dk · 4–7,5 saat → 30 dk · 7,5 saat üzeri → 1 saat.
- ★ **Yıllık FM tavanı 270 saat:** "FM ücrete dahildir" hükmünün sınırı. ✔ NOT (Engin): proje bazlı işler yıllık hesap gerektirmez, yıllık hesap istisnadır — bütçe motoru 270 takibi YAPMAZ. ⚠ Uygunluk katmanı: kısa projede pro-rata (~22,5 saat/ay) aşımı alacak doğurur.
- ★ **İdari:** FM için yılbaşında yazılı onay (özlük dosyası). İmzalı bordroda FM tahakkuku varsa ve ihtirazi kayıt yoksa fazlası tanıkla ispatlanamaz — düzgün bordro çıktısı yapımcıyı davada korur.
- Model çıkarımı (açık soru 1'in girdisi — KARAR SONRAKİ OTURUM): bütçe motoru varsayılanı = sektör standardı (FM/hafta tatili ayrı bütçe kalemi değil, kaşede fiyatlı); yasal kurallar uygunluk katmanının konusu.

### D. Kısa / proje-bazlı istihdama özgü durumlar (3-6 ay penceresi)

- ★ **Belirli süreli sözleşme:** süre sonunda kendiliğinden biter → ihbar tazminatı YOK.
- ★ **Kıdem tazminatı:** 1 yıl şartı → kısa projede DOĞMAZ.
- ★ **Yıllık ücretli izin:** 1 yıl şartı → kısa projede DOĞMAZ.
- ⚠ **Zincirleme sözleşme riski:** art arda yenilenen belirli süreli sözleşme belirsize dönüşür → kıdem + izin + ihbar DOĞAR. Dizi sektörünün dava klasiği.
- ★ **Ay hesabı:** maktu aylıkta SGK ayı 30 gün; yevmiyelide takvim günü; ay ortası giriş/çıkışta kıst prim.
- ★ **İSG (6331):** setler 2015'ten beri **"tehlikeli" sınıfta** → iş güvenliği uzmanı + işyeri hekimi hizmeti zorunlu (bordro-dışı yasal personel gideri); işe giriş raporu, temel İSG eğitimi. İş kazası 3 işgünü içinde bildirilir — bildirmeme cezaları ağır (tehlikeli sınıfta 2025'te on binlerce TL mertebesi). Set-özel riskler (dublör, silah, yüksekte çalışma) özel sigorta ihtiyacını büyütür.

### E. Sektörel rejimler (sinema/dizi/reklam)

- ★ **Set işçileri tam 4857 kapsamındadır** — sektör istisnası yoktur.
- ★ **Ek-6 sanatçı kısmi sigortalılığı (5510 ek m.6) — doğrulandı ve karara bağlandı (bkz. B, payroll_profile):** ayda **10 günden az** çalışan sanatçı (KTB listesi) primini KENDİSİ öder (%32,5 + isteğe bağlı %3 işsizlik). İşveren tarafı: kişiyi **APHB'de göstermez, ücreti üzerinden hiçbir prim ödemez**; muhtasar tarafı (GV stopajı + damga) devam eder. Kısmi süreli iş sözleşmesi şart ve SGK'ya iletilir. İKMH güvencesi YOK.
- ⚠ Uygunluk dörtlüsü: (1) 10-gün eşiği kalemin kendi geometrisinden (Birim/Miktar) denetlenir — ≥10 gün/ay görünüyorsa "Ek-6 olamaz, 4/a zorunlu"; (2) sözleşmenin SGK'ya iletildiği kanıtlı teyit edilmeli (Ek-6'lılık bozuksa sigortasız işçi riski); (3) yanlışlıkla 4/a girişi kişinin Ek-6'sını BOZAR; (4) İKMH boşluğu → özel kaza/prodüksiyon sigortası sorumluluğu fiilen büyür.
- ✔ **5225 Kültür teşviki:** mekanizma ve karar B bölümünde (SGK senaryo seçimi). Kapsam metni ("film platosu, stüdyo, sinema mekânlarının yapımı/işletilmesi") tipik yapım şirketini kapsar mı — kullanıcıya devredildi: belgesi olan senaryoyu seçer, olmayan bürokrasi görmez.
- ★ **Sendika/sektör standartları:** Sinema-TV Sendikası şablon sözleşmeler ve çalışma ilkeleri yayınlıyor (C bölümü); Oyuncular Sendikası Ek-6 bildirge onayına yetkili. Yasal zorunluluk değil, sektör referans çizgisi.

### F. Yan istisnalar, destekler, küçük kalemler

- ✔ KARAR (Engin) — **Asgari ücret desteği (2026: 1.270 TL/ay/kişi): bütçe hesabına KATILMAZ, bilgi olarak gösterilir.** Gerekçe: giriş-çıkışlar dalgalı, destek prim gününe bağlı → öngörülemez; ihtiyat ilkesiyle uyumlu (bütçe teşviksiz kurulur, gerçekleşen lehe şaşırtır).
- ★ **Teşvik haritası (2026 araştırması) — İLKE: teşvikler kişiye-bağlı şartlıdır (yaş, cinsiyet, belge, işsizlik geçmişi, ilave istihdam, borçsuzluk); bütçe aşamasında kişi belli değildir → bütçeye GİREMEZ; gerçekleşende fırsat uyarısı (PCCE konusu):**
  - **4447 geçici 10 (kadın/genç/belgeli ilave istihdam):** 31.12.2026'ya uzatıldı; ilave istihdamda işveren hissesinin TAMAMI İşsizlik Fonundan (7.184–64.656 TL/ay aralığı). Set demografisine en uygun, en parasal aday — yeni proje şirketinde herkes "ilave" sayılabilir.
  - İşsizlik ödeneği alanın istihdamı (4447/50): destek kişinin kalan ödenek süresinden düşer — sahada hassas.
  - Engelli teşviki; İŞKUR işbaşı eğitim programı.
- ★ **Yemek:** sette catering = **ayni yemek** = yemek firmasının yapımcıya kestiği fatura kalemi; kimsenin eline para geçmez → ücret sayılmaz, GV matrahına ve SGK primine girmez, bordroyla hiç tanışmaz. Bütçede kendi kalemi (fatura statüsü). "Günlük 300 TL GV istisnası" yalnız NAKİT yemek parası ödenen istisnai kurguda devreye girer — uygunluk notu.
- ★ **Yol istisnası:** günlük **158 TL** (2026, toplu taşıma koşullu).
- ★ **TES radarı:** Tamamlayıcı Emeklilik Sistemi (%3 kesinti) 2026 gündeminde — teşvik değil, yeni bordro parametresi ADAYI; yasalaşma durumu müşavir teyidi ister. İzlemede.

### G. Uygunluk katmanı defteri — "G DEFTERİ" (PCCE tartışmasına devredilen birikim)

Bu defter TEK'tir (K1 şerhi, §0): vergi kökenli adaylar dahil tüm uygunluk-adayı birikim burada tutulur. Bunlar bütçe satırı değil, uygunluk/uyarı katmanının konusudur:

- Telif: belgesiz %17 tarhiyat riski · arızi/sürekli KDV yazısı eksikliği · bağımlılık→ücret dönüşmesi.
- Bordro: matrah taşıma talebi (maliyet yapımcıya) · 270 saat pro-rata aşımı · repo / ardışık-8-gün ihlali · zincirleme sözleşme→belirsize dönüş · BES kesinti yükümlülüğü (5+).
- Ek-6 dörtlüsü: 10-gün eşiği (geometriden otomatik denetlenebilir) · sözleşme-SGK teyidi · 4/a girişi bozar · İKMH boşluğu→özel sigorta.
- Şirket düzeyi: 5225 şart ihlali (teşvik geri alınır) + işyeri kapsam teyidi · teşvik fırsatları (4447 g.10 vb.) · devreden KDV proje riski.
- Beyan ≠ fiili (elden ödeme) — anomali bayraklı. ✔ NOT (K2): v2.1'deki "fringe motorunun (§8 PARK) ev sahipliğinde" ibaresi eskidi — fringe kimliği K2 ile emeklidir; bu ailenin ev sahibi PCCE tartışmasında belirlenecek.
- KDV rotası: tevkifat-adayı fatura (işgücü temini/taşıma vb.) eşik üstü + tevkifatsız görünüyorsa uyarı (fiş düzeyi) · binek araç kira/yakıt KDV'si kanunen indirilemez (KDVK 30/b) → ilgili satırda vat_deductible=false olmalı uyarısı (setlerde araç kalemi büyüktür) · dönmeyen/devreden KDV proje-düzeyi uyarısı.
- ✔ KAYIT (K11, 3 Temmuz): **aynı kişi iki ayrı kalemde** → sinyal adayı (Crew Overlap Guard ailesine komşu).

### H. Açık kalanlar (sonraki oturumların gündemi)

- Soru 1 — motor kapsam sınırı (sektör-standardı-varsayılan önerisi masada, C bölümü model çıkarımı; karar yok).
- Soru 4 — maruziyet/uygunluk uyarılarının gösterim şekli + Compliance Guard ürün metninin yerleşimi (Yasal Yük altbilgisi / parametre paneli başlığı / her ikisi). Sinyal ekran ön-eskizi (üç yüzey) PCCE oturumunun girdisidir.
- Soru 5 — Tanımlar/parametre panelinin menü yeri (sol-ray navigasyon konusuyla birlikte). Cetvel ALTYAPISI beklemez: DILIM-3a/3b ile gelir.
- **PCCE** — Production Cost Compliance Engine: ad, mimari yeri (kalem uyarısı / ayrı panel), DILIM sınırları, Faz-2 anomali motoruyla ilişkisi. Çerçeve K11 ile çizildi: tartışma yalnız kural-bazlı/deterministik uygunluk üzerinden yürür; bu defterin (G) birikimi girdisidir.
- Dizi (TV/Dijital) vizyonu tetiği: §1 Faz Sınırı / Dizi Kaydı (K9+K5 birlikte yeniden açılır).
- Bordro motorunun ihtiyaç duyacağı diğer konular (3a-3d spec'leri sırasında çıkanlar buraya işlenir).
- ~~Bu envanterin repo'daki yeri~~ — KAPANDI (K1: ev bu dosyadır).
- ~~vat_deductible alanının kaderi~~ — KAPANDI (bkz. A bölümü kararı; doktrin evi VERGI-MEVZUATI §3).
- ~~K1..K11 karar seti~~ — KAPANDI (3 Temmuz 3. oturum; mühürler §1'de).

---

*v2.1 hazırlanış: 3 Temmuz 2026 oturumu ikinci tur (v1: 2 Temmuz; v2: aynı gün ilk tur). İkinci turda eklenen: vat_deductible kaderi, KDV tevkifatı kapsam-dışı, mimari/parametre ayrımı, Compliance Guard ürün metni. v2.1'de: Engin'in kırmızı-not düzeltmeleri (telif belge/tavan/KDV, KDV nakit ilkesi, proje penceresi, sektör çalışma standardı, asgari ücret desteği, BES onboarding, 5225 senaryo seçimi, Ek-6 profil mimarisi) işlendi; FM oranı ve hafta tatili sektör pratiği araştırılıp doğrulandı; 311 Tebliğ kümülatif kuralı, Ek-6 işveren mekaniği, 2026 teşvik haritası ve Eurimages KDV kuralı web-doğrulandı.*

*v3.0 (3 Temmuz 2026, 3. oturum): envanter v2.1 çekirdek olarak repoya girdi (K1); §0 görev sınırı + statü cetveli, §1 motor doktrini (K2–K11 mühürleri, zarf, kuruş doktrini, katalog türetim zinciri, sinyal v0, dilimleme 3a-3d, Dizi Kaydı) eklendi; K9 terminoloji mührü B bölümüne işaretle işlendi; Compliance Guard kanonik metni §0'a alındı.*

*Kaynaklar: GİB özelgeleri ve tebliğleri (332 No'lu GV Tebliği, 311 No'lu GV Tebliği, KDV Genel Uygulama Tebliği), 5510/4857/GVK/KDVK ve 7566 sayılı Kanun, SGK teşvik rehberleri, Yargıtay 7. ve 9. HD içtihatları, Sinema-TV Sendikası ve Oyuncular Sendikası yayınları, 5225 mevzuat seti, Eurimages bütçe kılavuzu, muhasebetr/alomaliye/CottGroup uzman kaynakları.*
