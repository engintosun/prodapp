# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. 2026-06-12 (mimari oturum, kod yok): Zengin butce modulu kavram tasarimi tamamlandi ve kilitlendi (B1-B15). Is sirasi degisti: butce modulu one alindi; muhasebe ev/nav (card-desk) sonrasina. Sirada: butce semasi (B16-B18) -> RLS -> trigger -> servis -> UI.

## Durum
- HEAD (oturum baslangici): c6a0504 — bu oturumda kod degismedi; bu commit yalniz docs. Canli: prodapp-navy.vercel.app · Repo: github.com/engintosun/prodapp
- KURULU/CALISIYOR: auth + cok-proje login · saha fis girisi · yonlendirme trigger (fn_route_receipt) · duzeltme mekanigi · davet/rol (canli) · reviewer onay/red (fn_review_receipt) · proje olusturma (fn_create_project) + proje butce tablolari + servisler · onboarding UI (kurulum akisi, 2026-06-10 canli test gecti).
- KRITIK ACIK: butce/harcama uyari motoru ve anomali motoru yok (kurallar dosyada, kod yok). TECH-DEBT: Acik Borc 4/5 (TD-5/8/9/10) — degismedi; TD-10 card-desk ev/nav isinde (artik sira #2) kapanacak.

## Butce modulu — KILITLI kararlar (B-serisi, 2026-06-12)
ILKELER: 10 dakika kurali (egitimsiz muhasebeci 10 dk'da ilk grubu doldurur) · kart=tek konu · gorunur hesap, dokunulmaz formul (formul hucresi yok; her toplamda dokununca duz Turkce dokum) · uc alan kurali (satir = ad + net + carpan; yuk ve birim gruptan miras) · klavye akisi (Enter/Tab) · kayit dugmesi yok (anlik kayit) · sablondan gelen bos kalem 0'da durur, toplama girmez · degisiklik izi + orijinal kilidi · mobil: giris masaustu-onerilir, ozet/icmal mobil-tam · tamamlilik ilkesi (kullaniciya "bunu neden koymamislar" dedirtme; her erteleme kayitli karar) · gorsel tasarim ayri turda, UI yazilmadan once.
- B1 Yon degisikligi: butce modulu one alindi; card-desk ev/nav sonra.
- B2 Yuk bilesenleri: adlandirilmis (stopaj/SGK/ajans...); satirda COKLU bilesen + hazir paketler ("Ajansli cast" gibi); secim anindaki oran KOPYASI satirda saklanir; satirda duzeltilebilir (iz birakir; mevzuat oranindan sapma sari uyari); merkezi oran katalogu degisince sistem BILDIRIR, muhasebe onaylar; hicbir satir sessiz degismez.
- B3 Uyari 3 seviye: ENGEL (kirmizi; yalniz veri bozulmasi: negatif tutar vb.) / UYARI (sari; durdurmaz, iz birakir: ayni adla ikinci kalem, payi asan grup) / OGRETEN IPUCU (gri; ilk kullanimda bir kez). Kalip: ne oldu + neden onemli + ne yap, tek cumle.
- B4 "Piyasayi arastir" dugmesi: kalem detayinda; yeni sekmede kalem adi + grup baglamiyla hazir arama acar; KAAPA veri tutmaz, firma onermez. Dilim 2 (kuratorlu liste) tedarikci hafizasiyla birlikte DUSUNULECEK.
- B5 Kalem satiri: GIRIS 7 alan = sebep, ayrinti, aciklama, birim net, miktar+birim (kesirli olur), adet, yuk secimi. HESAPLANAN = brut birim (net+yuk), toplam (brut x miktar x adet), gerceklesen, fark (+fark aciklamasi alani). Her kaleme otomatik KALICI KOD. Ongorulen NET kurulur; KDV ongorulene girmez.
- B6 Gerceklesen: IKI kaynak — (a) onay zincirinden fisler, (b) muhasebenin dogrudan odeme kayitlari (fatura, sozlesme, bordro/stopaj, elden/belgesiz; belgeli/belgesiz isaretli; ek istege bagli; onay zinciri YOK; degisiklik izi VAR). Her kayit brut + KDV(oran/tutar) + net tasir; brut girilir, net = brut/(1+KDV). Eslesme kalem KODUYLA. FARK daima net-net; brut/KDV ikincil gorunumde. ("Dogrudan kayit kavram olarak yok" acigi KAPANDI.)
- B7 Cast ayri format degil: ayni kalem kalibi; coklu bilesen + paket cozer (stopaj + ajans + istege bagli damga).
- B8 Yapi: proje kurulumunda TIP secimi (film/dizi/reklam/belgesel) -> tipe uygun sablon. Film/reklam TEK butce; icindeki ETAPLAR: Yaratici kadro & haklar, Hazirlik, Cekim, Post, Genel giderler, istege bagli Tanitim & gosterim ve Teslim. Dizi: sezon butcesi (sezon hazirligi, kapanis, sezon genel giderleri) + BOLUM BASINA tam butce; icmali sistem uretir, elle kurulmaz. Tum listeler duzenlenebilir (ekle/cikar/adlandir). Ust yapi (proje toplami + departman paylari) AYNEN korunur.
- B9 Fis->kalem eslesmesi MUHASEBE ONAYINDA: sistem kategori+departman'dan kalem onerir, tek dokunus onay/degistir; karar verilemeyen fis ESLESMEMIS HAVUZUNA ("gerceklesen + eslesmemis X TL" durust gosterim; sonradan esleme serbest). Sahaya/sefe yeni alan YOK.
- B10 Avans istege bagli butce/bolum etiketi tasir; o avanstan odenen fisler onay ekranina oneriyi hazir getirir; donem alani AYRI kalir (tek alana iki anlam yasak). Mekanik avans oturumunda (cift-sayim kuraliyla birlikte).
- B11 RAY (butce modulu ici, yukaridan asagi): (1) Genel butce — salt okunur icmal; Orijinal|Yuruyen|Gerceklesen gorunum dugmesi icinde (2) Butce girisi — kart masasi (3) Raporlar — yeri ayrilir, ici sira Rapor/Export isinde dolar (4) Gerceklesen — tum kayitlar tek liste, kaynak etiketli (5) ayrac + Tanimlar (oranlar, birimler, proje sabitleri). GIRIS ile OKUMA ayri yuzey: kart yuzu sade (isaret+isim); uc rakam + dolum cubugu ICMAL tarafinda.
- B12 Hesap zinciri: kalemler -> grup toplamlari -> etap toplamlari -> MALIYET TOPLAMI -> + Ongorulmeyen giderler (maliyet toplami x %) = TOPLAM MALIYET -> + Sirket kari (toplam maliyet x %) = GENEL TOPLAM. Kar satiri icmalde gizlenebilir. Grup ici ara toplam cizgisi istege bagli.
- B13 TERIMLER: butce, icmal, etap, harcama grubu (UI adi: kart), harcama kalemi. "Defter" KULLANILMAZ. Butce ici kisma "bolum" DENMEZ — bolum yalniz dizi bolumudur (tehlikeli kokler listesine eklendi). GLOSSARY guncellendi.
- B14 IC SABLON ile DIS FORMAT ayri kavramlar: ic sablon = kurulumda gelen tip bazli Turkiye iskeleti + "sirket sablonu olarak kaydet" (Faz 1 asgari: onceki projeden kopyala). Dis format = finansor sunumu (Bakanlik, Eurimages, platform, AICP) RAPOR katmaninda uretilir; semaya yuk bindirmez (kod-esleme alani haric). Kaynak notu: format projenin tipinden degil paranin kaynagindan dogar.
- B15 TABLO SETI (kabul): budgets · budget_stages · expense_groups (istege bagli departman bagi — B9 onerisinin anahtari) · budget_items · units · burden_components · item_burdens (coklu; oran kopyasi burada) · budget_percent_lines · direct_payments · receipts tablosuna TEK yeni kolon: budget_item_id (null olur = eslesmemis) · rate_catalog (Faz 1'de elle beslenir).
- 3 EKRAN TASLAGI KABUL: icmal + kart masasi + kalem tablosu — tarifler EKRAN-MUHASEBE §19. Gorsel tasarim ayri turda gelistirilecek (Engin notu).

## Acik (kararlasmadi)
- SIRADAKI SEMA KARARLARI: B16 orijinal kilidinin saklanma bicimi · B17 sablonlarin saklanma bicimi (tip + sirket sablonu) · B18 hesaplanan degerlerin yeri (DB generated / view / servis).
- Davet zinciri gozden gecirilecek (TD-9 ASCII metinleri o turda).
- Model 1 (hesabi KAAPA acar) · Avans->butce cift sayim (B10 mekanigi dahil) · Gorunen rol etiketi · Tedarikci hafizasi + Arastir Dilim 2 (BIRLIKTE ele alinacak).
- Tahmini final: dunya standardi EFC = gerceklesen + taahhut + kalan tahmin; rapor fazinda, "aciklanabilir > tahmin" ilkesiyle.
- RAPORLAR fazina notlar: kanala/yapimciya icmal PDF · Bakanlik basvuru formu birebir esleme (guncel form o gun indirilip dogrulanacak; "kendi ayrintili formati var" iddiasi DOGRULANMADI, yalniz form+finansman tablosu dogrulandi) · AICP/uluslararasi export · amort/cross-boarding bolum-basi pay raporu.
- KAPI ACIK (sema oldurmez, Faz 1 yapmaz): taahhut (commit kaydi) · mesai hesabi · doviz (CFE ile) · satir yorumu (mesajlasma ile).

## Siradaki is
1. Butce semasi: B16-B18 kilitle -> 5-katman (sema->RLS->trigger->servis->UI) birlikte kilitle -> Sonnet'e ilk butce prompt'u. (Kalem tablosu ekran tarifi EKRAN-MUHASEBE §19'da.)
2. Sonra: Dept/Muhasebe ev + navigasyon (card-desk) — TD-10 burada kapanir.
Tam liste: docs/IS-SIRASI.md.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli) — muhasebe CALISMA ortaminin (ev/nav) tasarimi; minimal onboarding/kurulum akisina UYGULANMAZ:
  - Uc katman: daralabilir sol ray (modul nav) + ust baglam cubugu + orta masa yuzeyi.
  - Sol ray = secili TEK proje adi + modul listesi (proje listesi degil); daralabilir.
  - Badge = gorulmemis birikim; modul-bazli kullanici seen-tracking gerekir.
  - Masa yuzeyi (D-2): birincil kart (tam genislik) + daralabilir sag referans yuvasi (~%30-35, varsayilan kapali); serbest/N-esit pencere yok.
  - Mobil (D-3): tek responsive PWA; her ekran mobil-yetenek etiketi tasir (mobil-tam / salt-okunur / masaustu-onerilir).
- Butce iskelet kurali: ust yapi (proje toplami + departman paylari) sabit; zengin modul ALTINA eklendi (B8), ust degismedi.
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, butce-havuzu uyarisindan AYRI (IS-KURALLARI §7/§13).
- Butce her seviyede YALNIZ muhasebe gorur + yazar; sef avans defteri, saha kendi avansi.
- Gorsel estetik her ekranda commit oncesi G6'da; butce modulu icin ayrica gorsel tasarim turu sozu var.
- Yama yok (CLAUDE.md): yanlis kodun ustune ekleme yok; cikar-degistir.

## Durable doc'lara tasinanlar (bu commit)
- TASARIM-KARARLARI §8: butce modulu ilkeleri + B-serisi ozet.
- GLOSSARY: butce terimleri + "defter"/"bolum" kurallari.
- EKRAN-MUHASEBE §19: uc ekran tarifi.
- IS-SIRASI: sira degisti (butce #1).
Kalan tasima: yok.
