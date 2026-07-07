# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Butce: kavram + sema + DB temeli + goc CANLI; kart mimarisi 1100-1600 KILITLI. DILIM-3 (bordro motoru) TAMAMLANDI: 3a iskelet + 3b katalog seed + 3c saf motor + 3d UI kablolamasi hepsi CANLI.
- 2026-06-21..07-02: fn_open_budget CANLI; vergi/yuk modeli KILITLI; odeme-statusu semasi + kova-cins + donem-bazli geometri CANLI; KART 1500 ekran TAM (11 kolon); Not mimarisi CANLI. Detay: git log.
- 2026-07-03: DILIM-3 karar+mimari turlari; K1..K11 MUHURLENDI; PERSONEL-MEVZUATI.md DOGDU; VERGI-MEVZUATI saf vergiye daraldi; terminoloji muhru.
- 2026-07-04: DILIM-3a CANLI (commit 9971771). Sema+davranis, SAYI YOK. item_burdens.rate_percent nullable (K4 iskele); rate_catalog satir turleri (value_kind oran/tutar/tarife + amount_tl + bracket_floor/base_tax; unique nulls not distinct); burden_components.fill_mode (rate/skeleton); payroll_profiles + payroll_profile_burdens tablolari + budget_items.payroll_profile (standart); fn_refill genisledi (iskele NULL-oran + F3 stopaj override okumasi + profil add/remove set mantigi); tetik statu+profil (stopaj_rate tetigi 3d). Backfill davranis bit-ayni (smm/kira/telif degismedi). SQL denetimi: oran-yapismasi hatasi + F3 tel + RLS-acik duzeltmeleri girdi.
- 2026-07-04: DILIM-3b CANLI (commit 55ef4ea). rate_catalog 2026 seed (asgari brüt 33.030 tutar; işçi SGK%14+işsizlik%1; işsizlik işveren%2; SGK işveren 4 senaryo — standart 19,75 DÜZELTİLDİ [eski 22.5 hatalıydı], borçlu 21,75/kültür girişim 14,81/kültür yatırım 9,88 katalogda REFERANS, henüz kovaya bağlı DEĞİL; GVK103 ücret tarifesi 5 basamak; SGK tavan katsayısı 9 [tutar]). burden_components.kind 3. değer 'parameter' (hiçbir kovaya giremez) + 4 guard trigger CANLI (item_burdens/payment_status_burdens/payroll_profile_burdens INSERT+UPDATE + burden_components UPDATE-dönüşüm guard'ı). Bordro iskelet kovası 6 bacak CANLI (sgk_isci/işsizlik_isci/gv_ucret/damga=kesinti; sgk_isveren/işsizlik_isveren=ekleme). payroll_profiles 'ek6' + 4 remove. Backfill uygulandı.
- 2026-07-04: DILIM-3c CANLI (commit 18f0b35). CFE payroll solver saf modül (src/shared/cfe/payroll.ts, Supabase'den bağımsız) + 25 test (toplam 53/53 PASS). K5 parçalı-doğrusal KESİN çözüm (iterasyon/bisection yok) iki yönlü: net_to_gross (ters-bordro, mevcut pratik) + gross_to_net (doğrudan ileri hesap, yeni) — ikisi de PAYLAŞILAN çekirdeği (computeMonthFromGross) çağırır. K10 türetilmiş istisnalar altın fikstürle doğrulandı: deriveMinimumWageExemptionSeries (Oca-Haz 4211.33, Tem 4537.75, Ağu-Ara 5615.10) + deriveStampDutyExemption (250.70). Round-trip toleransı SABİT 1 kuruş DEĞİL, deriveRoundTripTolerance ile TÜRETİLİYOR (standart 3 kuruş / ek6 2 kuruş) — bağımsız HALF_UP yuvarlanan bacak sayısı + brüt-yukarı-yuvarlama tavanının matematiksel bileşkesi (PERSONEL-MEVZUATI.md K5 metni buna göre güncellendi). Geliştirme sırasında çözücüde 2 gerçek hata bulundu+düzeltildi: (1) tam kırılma noktasında epsilon'suz eşik karşılaştırması yanlış tarafa düşüyordu, (2) ay içinde birden fazla vergi dilimi aşıldığında gelir-vergisi istisna eşiği MUTLAK (G=0'dan) değil ARTIMLI (segment-yerel) hesaplanmalıydı.
- 2026-07-08: DILIM-3d CANLI. SEMA: budget_items.input_mode/input_value (4 giris noktasi — null=unit_net, unit_gross, total_net, total_gross; calculation_type YOK, yon input_mode'dan turer) + trg_refill_on_status genisledi (stopaj_rate degisince de kova tazelenir, 3a borcu kapandi). SERVIS: 1a bug duzeltmesi (item_burdens.rate_percent NULL artik Number(null)=0 sessiz-sifire donmuyor, skeleton bacaklar CFE additive/deduction dokumune girmez) + deriveBordroFields (kalemin donem/miktar/carpan verisinden ay listesi kurup resolvePayrollItem'i cagirir; PayrollLegs item_burdens komponent-varligindan, PayrollRates dogrudan rate_catalog'dan turer; coklu-donemde SADECE ILK donem ankorlanir [K7], sonraki donemler ay siniriyla sifirlanmadan kesintisiz devam eder — aradaki gercek bosluk KAAPA kapsami DISINDA, Engin karari 07-07) + updateItemField 4 sanal alan (unitNetInput/unitGrossInput/totalNetInput/totalGrossInput, atomik payload). UI: "motor bekliyor" etiketi KALKTI; bordro kaleminde Birim Net/Birim Brut/Net Toplam/Brut Toplam dordu birlikte gorunur (kaynak alan duzenlenebilir+vurgulu, sabit-olmayan taraf "(ortalama)" etiketli, digerleri salt-okunur); aylik dokum sheet'i CANLI (SS75 iki-gruplu dokum: isveren paylari / net anlasma geregi ustlenilen isci tarafi + SNL-YIL-ASIMI/SNL-MIKTAR-DEGISIM sabit-cumle notlari). Build+53/53 test PASS; gorsel/tarayici goz-kontrolu bu oturumda YAPILAMADI (yerel .env + muhasebe test hesabi yok) — Engin kendi ortaminda dogrulayacak.

## Durum
- HEAD: git log (origin/main) kesin. Repo: github.com/engintosun/prodapp - Canli: prodapp-navy.vercel.app.
- KURULU/CALISIYOR: auth + cok-proje - saha fis girisi - yonlendirme/duzeltme - davet/rol - onay/red - proje+butce+servisler - onboarding - BUTCE DB TEMELI - fn_open_budget CANLI - CFE (28/28) - KART 1500 ekran TAM - odeme-statusu semasi CANLI - yuk kovasi cins CANLI - Not kolonlari CANLI.
- DILIM-3d CANLI (yukarida). Bordro motoru UCTAN UCA kablolu: sema -> servis (deriveBordroFields) -> UI (4-alan + aylik sheet). Motor (CFE) + servis+UI kablolamasi 53/53 test ile korunuyor; tarayici goz-kontrolu Engin'e devredildi.
- KART MIMARISI KILITLI: 1100,1300,1400,1500,1600. Detay: KART-KATALOGU.md.
- MEVZUAT DOSYA DUZENI (K1): PERSONEL-MEVZUATI.md = insana emek/eser (bordro/smm/telif) + bordro-cozucu + G defteri; VERGI-MEVZUATI.md = saf vergi. Statu cetveli iki dosyanin basinda.

## VERGI / YUK modeli — KILITLI (detay: VERGI-MEVZUATI.md + PERSONEL-MEVZUATI.md)
- UC EKSEN (KILITLI): "Toplam" = BRUT. Net/Brut AYRI kolon. KDV nakit ilkesi (cepten cikan KDV maliyet, ayri kolon). (1) SGK/isveren=ekleme; (2) Stopaj=carpan kesinti; (3) KDV=ayri eksen.
- BIR KALEM = BIR STATU = BIR CINS; statu degisince kova fn_refill ile bastan dolar.
- BASIT CARPANLAR: SMM net/0.80; Telif net/0.83; Kira net/0.80; Fatura net=maliyet; Konaklama KDV%10.
- BORDRO: basit % DEGIL MOTOR — doktrin PERSONEL-MEVZUATI §1 + B. Hardcode YASAK. UI kablolamasi 3d'de CANLI (4-alan giris + aylik dokum).
- KATALOG (K5, 3a'da genisledi): standart oranlar rate_catalog'da yururluk-donemli; value_kind ile uc satir turu (oran/tutar/tarife); turetilebilir sayi katalogda DURMAZ (motor turetir); muhurde pencereyi kapsayan satir-KUMESI snapshot.
- MIMARI DESENI: OpenFisca DEGIL. K3 uclu sinir: davranis/matematik KODDA (test edilebilir, kanitlanabilir), eslemeler cetvelde, sayilar katalogda. OpenFisca dis emsal olarak incelendi (formul-DB reddi), taban alinmadi. (MMB'nin OpenFisca kullandigi iddiasi DOGRULANMADI.)
- MUHASEVIRE ACIK (amber): 2026 oran guncelligi + reklam tevkifati 3/10 mu 10/10 mu + telif tavan. YAPISAL model kilitli.

## KART 1500 kolon-kolon (MODEL kart)
Kolon seti (KILITLI, 11): Kod - Aciklama - Statu - Donemler - Birim - Birim net - Miktar - Carpan - Yasal Yuk - Net toplam - Brut toplam.
- TERMINOLOJI MUHRU (K9): Miktar = kisi/adet SAYISI (DB multiplier) · Carpan = SURE (DB repeat) · Birim = periyot CINSI (units). Detay GLOSSARY.md.
- Ana satir TEK donemde GIRIS, COK donemde SALT-OKUNUR OZET. Donem-satiri 11 td hizali. Detay: docs/butce/ (DILIM-2f).
- 1500 model tamam -> diger kartlar ayni modelden gecer.
- Bordro kaleminde Birim net hucresi 2 alana (Net/Brut) genisler; Net toplam/Brut toplam kaynak moda gore duzenlenebilir olur (bkz. DILIM-3d).

## Butce — KILITLI kararlar (ozet; detay BUTCE-SEMA-KARARLARI.md)
- GIRIS: kart=departman; faz=donemin kaba hali; giris=sakin liste + dokun-isaretle; tam gorunum=nakit matrisi.
- GOC CANLI: budget_item_periods koprusu. "En az bir donem" + "donem tarihli" MUHURDE (K7: normal Kaydet ASLA tarih istemez; tarih yalniz Muhur/harcama gecisinde).
- SEMA B1-B20: hesaplanan deger saklanmaz (B18) - degisiklik izi (B19) - kasa/raf dokunulmazlik (B16/B17) - RLS yalniz muhasebe - standart oranlar veri/cetvel+snapshot (B20).
- PAKETLEME: Model A. cost_object: PARK.

## Siradaki is
1. Tarayicida goz-kontrolu (Engin): bordro kalemi ac, 4 alan/aylik sheet/"motor bekliyor" kalkti mi dogrula.
2. Sirket-Profili SGK senaryo secimi ekrani (borclu/kultur girisim/kultur yatirim) — sgk_isveren item_burdens'inda hala NULL/skeleton, motor su an rate_catalog standart (19,75) varsayilanini kullaniyor.
Sonra: PCCE kavrami (K11) + acik sorular 1/4/5 (PERSONEL-MEVZUATI H).

## Acik (kararlasmadi)
- net_to_gross round-trip toleransı (3 kuruş standart / 2 kuruş ek6) muhasebe yazılımı entegrasyonu gündeme geldiğinde yeniden değerlendirilecek — gross_to_net yönünde bu sorun yok (çözüm/arama adımı olmadığı için tolerans kavramı geçerli değil).
- Şirket-Profili SGK senaryo SEÇİMİ altyapısı YOK (proje/şirket düzeyi kolon+ekran); 3b'de yalnız 4 senaryo kataloğa girdi (sgk_isveren=standart KOVAYA bağlı/varsayılan; borçlu/kültür-girişim/kültür-yatırım katalogda REFERANS/bekliyor). Kurulma zamanı: motor (3c) gerçek hesaba başladığında VEYA parametre paneli ekranı (soru 5) açıldığında — hangisi önce gelirse. (3d NOTU: deriveBordroFields bu senaryo secimini item_burdens'inda bulursa kullanir, bulamazsa [her zaman, bugun] rate_catalog standart degerine duser — senaryo mantiginin kendisini bilmez.)
- 1600 AJANS/MENAJER KOMISYONU DIKISLERI (Engin sordu, 3a'da kasitli ertelendi): (a) item_burdens'e origin ('auto'/'manual') ayraci — fn_refill yalniz origin='auto' siler-yeniden-kurar, elle konan komisyonu korur (fn_refill delete cumlesine 'and origin=auto' — tek satir ileri degisiklik, forward-compatible). (b) komisyon evi = ayri kolon DEGIL, ayni additive kova (item_burdens); kalem-bazli oran rate_percent'te; payment_status_burdens'e binmez (her oyuncuda yok, oran degisken -> manual). (c) "Yasal Yuk" mu "Ticari Yuk" mu: komisyon hukuken ticari degil yasal -> burden_components'e category (yasal/ticari) gerekebilir, "Yasal Yuk" toplami temiz kalsin. (d) komisyon AKIS modeli Engin karari: oyucudan kesiliyorsa kovaya girmez (satir eklenmez); yapimci ustleniyorsa additive kova. ajans genelde sirket -> kendi KDV/stopaj. Karar 1600'de.
- vat_rate'in fn_refill icinde sifirlanmasi latent kuplaj (bugun zararsiz: profil yalniz bordroda, bordro KDV=0). Ileride "vat reset'i burden refill'den ayirma" temizlik adayi.
- PCCE: ad, mimari yer, DILIM sinirlari, Faz-2 anomali iliskisi (K11). Girdi: G defteri (PERSONEL-MEVZUATI G). Bu oturumda (07-06) netlesti: Engin'in tarif ettigi "Payroll List" (muhasebe-mudahale edilebilir fiili/beyan ayrimi) muhtemelen PCCE'nin gelecekteki evi - G defterindeki "Beyan != fiili" maddesiyle ayni konu, henuz ayri bir DILIM'e acilmadi.
- Acik sorular 1/4/5: PERSONEL-MEVZUATI H (kapsam siniri / gosterim+Compliance Guard yeri / menu yeri).
- Muhasebe oran teyitleri (amber): reklam tevkifati + 2026 oran + telif tavan.
- Tanimlar/cetveller EKRANI menu yeri (soru 5); altyapisi 3a/3b ile geliyor. Oran-yonetimi ekrani ERTELENDI.
- fn_lock_budget muhur mantigi: K7 tarih kapisi + donemsiz-kova muafiyeti + katalog satir-kumesi snapshot.
- Model 1 (hesabi KAAPA acar) - Avans->butce cift sayim (B10) - Gorunen rol etiketi - Tedarikci hafizasi.
- "Modul acik mi" bayragi + faturalama/paket fiyat.
- Kutuphane resmilestirme + katalog-kodu.
- RAPORLAR fazi: icmal PDF - Bakanlik - AICP/export - EFC - cost_object rollup - Eurimages KDV'siz gorunum (vat_deductible + ayri KDV kolonu bunu bugunden besliyor). Ic dokum (bordro kendi raporu) 3d'de CANLI; dis kurumsal raporlar bu faz.
- KAPI ACIK (Faz 1 yapmaz): taahhut - mesai - doviz - satir yorumu - DIZI (TV/Dijital): 6+ ay pencerede K9+K5 birlikte yeniden acilir (kohort-bazli cizgi adayi). Doktrin: PERSONEL-MEVZUATI §1 Dizi Kaydi.
- Onceki devirden: DB sifre reset + edge fn deploy mekanizmasi.
- Eski paket yapisi (burden_packages + package_id) atil; ileride temizlik.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli): daralabilir sol ray + ust baglam + orta masa + sag referans.
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, ayri.
- Butce her seviyede YALNIZ muhasebe gorur+yazar.
- Yama yok: cikar-degistir.

## Referans (icerik seed)
- Tur sablonlari: REKLAM (AICP 11 kart), FILM (Movie Magic ~30 kart), DIZI (scope+episode_no). Turkce sahadan.
- Master kalem listesi: 4746 tekil (Oyuncu-Kast 197 kalem 1600 icin).
- Iki-katman: sablon yalin / kutuphane+autocomplete.
