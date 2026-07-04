# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Butce: kavram + sema + DB temeli + goc CANLI; kart mimarisi 1100-1600 KILITLI.
- 2026-06-21: fn_open_budget CANLI (uctan-uca test).
- 2026-06-24/25: vergi/yuk modeli GIB ozelgesiyle KILITLENDI; odeme-statusu semasi CANLI; KART 1500 uc-eksen + kova-cins mimarisi KILITLENDI; DILIM-2a..2e CANLI (cins semasi, statu-fill, CFE cinse gore brut/net, kisiyeBanka, statu->kova canli tazeleme).
- 2026-06-30/07-01: DILIM-2f donem-bazli geometri TAM + CANLI TEYIT (donem alt-satirlari, Birim periyot-cinsi, tek<->cok gecis, repeat muhurleme, cift-carpma bug dustu); description_en rename; kolon seti 11'e oturdu. Detay: git log + BUTCE-EKRAN-KARARLARI.
- 2026-07-02: Not mimarisi (Ic Not + Kamu Notu) CANLI; Birim/Birim-net kolon swap; Yasal Yuk dokumu donem-bazli oldu (openBurden {itemId, stageId|null}); DILIM-3 genis arastirma (personelin TUM yasal gideri, 3-6 ay proje penceresi) + VERGI-MEVZUATI 3 eski hata duzeltildi + SS7a taslak.
- 2026-07-03 (1. oturum): DILIM-3 karar turu — telif duzeltmeleri, KDV nakit ilkesi, vat_deductible kaderi, tevkifat kapsam-disi, mimari/parametre ayrimi, net-sabit + ters-bordro, 311 Tebligi kumulatif sifirdan, SGK dort-senaryo, payroll_profile, asgari ucret destegi bilgi-amacli, C katmani sektor standardi, Compliance Guard metni. Detay: PERSONEL-MEVZUATI.
- 2026-07-03 (2. oturum): DILIM-3 mimari turu — uclu sinir, tek kapi + iki aile, oransiz iskelet, ay-motoru, sinyal ilkesi; 8 surtunme bulgusu; dis emsal (OpenFisca/MMB); K1..K11 karar seti cikti.
- 2026-07-03 (3. oturum): K1..K11 MUHURLENDI + derin tasarim turu doktrinleri: ZARF sozlesmesi + parametre izi; parcali-dogrusal KESIN cozum + round-trip; kurus doktrini (ic kurus, brut yukari, <=1 kurus assert=HATA); katalog turetim zinciri (yalniz birincil degerler; valid_from-tek desen; muhurde satir-KUMESI snapshot); sinyal v0 (5 kod, metin-yok ilkesi); dilimleme 3a-3d. PERSONEL-MEVZUATI.md DOGDU (envanter v2.1 cekirdek, v3.0); VERGI-MEVZUATI saf vergiye daraldi (1b/7/7a tasindi, statu cetveli); TERMINOLOJI MUHRU (Miktar=kisi/adet, Carpan=sure) GLOSSARY'ye; DIZI KAYDI Faz-siniri olarak islendi (PERSONEL-MEVZUATI §1 + asagida KAPI ACIK).

## Durum
- HEAD: git log (origin/main) kesin. Repo: github.com/engintosun/prodapp - Canli: prodapp-navy.vercel.app.
- KURULU/CALISIYOR: auth + cok-proje login - saha fis girisi - yonlendirme/duzeltme - davet/rol - reviewer onay/red - proje olusturma + butce tablolari + servisler - onboarding UI - BUTCE DB TEMELI - fn_open_budget CANLI (statu-fill) - CFE (brutBirim/satirToplam/satirToplamDonemli/kdvAyristir/zincirToplam/dokum/brutStopaj/netToplamDonemli/brutToplamDonemli/kisiyeBanka, 28/28) - KART 1500 ekran TAM (donem-bazli geometri + Net+Brut ayri kolon + KDV Yasal Yuk dokumunde selale satiri + Yasal Yuk TL + statu->kova canli senkron + KDV matrahi=brut + bordro motor-bekliyor etiketi).
- ODEME-STATUSU SEMASI CANLI: budget_items.payment_status (6 deger CHECK) + stopaj_rate (null=miras, override) + vat_deductible; budget_item_periods.unit_net_override; payment_status_defaults cetveli (applies_sgk + default_vat_rate; TASLAK, muhasebe teyidi bekliyor).
- NOT KOLONLARI CANLI: budget_items.internal_note + public_note (nullable text, goc 20260702120000). Trigger-free. RLS mevcut budget_items (yalniz muhasebe).
- YUK KOVASI CINS CANLI (2a-2e): burden_components.kind (additive/deduction); payment_status_burdens eslemesi; rate_catalog tek oran evi. Statu degisince fn_refill + trigger ile kova yeniden snapshot. Servis kovayi kind ile ceker; CFE cinse gore brut.
- KART MIMARISI KILITLI: 5 etap, kart=departman + "kullanan sahiplenir", kalem motoru + gorunurluk katmanlari + Compliance Guard. Kilitli kartlar: 1100,1300,1400,1500,1600. Detay: KART-KATALOGU.md.
- MEVZUAT DOSYA DUZENI (K1): PERSONEL-MEVZUATI.md = insana emek/eser odemelerinin doktrini (bordro/smm/telif) + bordro-cozucu + G defteri; VERGI-MEVZUATI.md = saf vergi (sirket/kira_sahis/konaklama + KDV rejimi/tevkifat). Statu cetveli iki dosyanin basinda; celiskide mevzuat dosyalari kazanir.

## VERGI / YUK modeli — KILITLI (detay: VERGI-MEVZUATI.md + PERSONEL-MEVZUATI.md)
- UC EKSEN (KILITLI): Butce "Toplam" = BRUT. Net ve Brut AYRI kolon. KDV nakit ilkesi: cepten cikan KDV maliyettir, genel toplama girer; kendi kolonunda ayri izlenir. (1) SGK/isveren = ekleme; (2) Stopaj = carpan kesinti; (3) KDV = ayri eksen.
- KISIYE BANKA ODEMESI: Net + KDV (stopaj GIRMEZ). Yasal Yuk bottom-sheet dokumunde selale satiri. CFE kisiyeBanka.
- BIR KALEM = BIR STATU = BIR CINS: bordro (additive) ve makbuz (deduction) birbirini DISLAR. Statu degisince kova fn_refill ile bastan dolar.
- BASIT STATU CARPANLARI: SMM net/0.80; Telif net/0.83; Kira net/0.80 (KDV yok); Fatura/Sirket net=maliyet; Konaklama KDV%10.
- BORDRO: basit % DEGIL, MOTOR — doktrin PERSONEL-MEVZUATI §1 (muhurler) + B (parametreler). Hardcode YASAK. Ara donemde bordro kovasi bos = "motor bekliyor" (3d'de kalkar).
- B20 + turetim zinciri: standart oranlar rate_catalog'da (yururluk-donemli, valid_from-tek desen); turetilebilir sayi katalogda DURMAZ (tavan TL, istisnalar, efektif senaryo oranlari — motor turetir); muhurde pencereyi kapsayan satir-KUMESI snapshot.
- MUHASEVIRE ACIK (amber): 2026 oran guncelligi + reklam tevkifati 3/10 mu 10/10 mu + telif tavan teyidi. YAPISAL model kilitli.

## KART 1500 kolon-kolon (MODEL kart)
Kolon seti (KILITLI, 11 kolon): Kod - Aciklama - Statu - Donemler - Birim - Birim net - Miktar - Carpan - Yasal Yuk - Net toplam - Brut toplam.
- TERMINOLOJI MUHRU (K9, 2026-07-03): Miktar = kisi/adet SAYISI (DB: multiplier / kopru: quantity) · Carpan = SURE, kac gun/hafta/ay/bolum (DB: repeat / donem: repeat_override) · Birim = periyot CINSI (units cetveli). "Carpan"i kisi sayisi anlaminda kullanmak YASAK. Detay: GLOSSARY.md.
- Ana satir TEK donemde GIRIS rolu, COK donemde SALT-OKUNUR OZET rolu (Birim_net/Birim/Miktar: ayniysa deger, farkliysa "—"; Carpan: SUM; Yasal Yuk/Net/Brut: SUM).
- Donem-satiri ana tabloyla kolon-kolon hizali (11 td); sadece COK donemde gorunur. Birim native select; Sil onay sorar. Tek<->cok gecisinde degerler otomatik kopyalanir. Detay: docs/butce/ (DILIM-2f).
- 1500 model tamam -> diger kartlar (1100/1300/1400/1600) ayni model uzerinden gecilir.

## Butce — KILITLI kararlar (ozet; detay docs/butce/BUTCE-SEMA-KARARLARI.md)
- GIRIS YAPISI: kart=departman; faz=donemin kaba hali; giris=sakin liste + "ne zaman" dokun-isaretle; tam gorunum=nakit matrisi.
- GOC CANLI: budget_item_periods koprusu. "En az bir donem" + "donem tarihli" MUHURDE (K7 sarti: normal Kaydet ASLA tarih istemez; tarih yalniz Muhur/harcama gecisinde — fn_lock_budget).
- SEMA B1-B20: hesaplanan deger saklanmaz (B18) - negatif kapidan giremez (B3) - degisiklik izi (B19) - kasa/raf dokunulmazlik (B16/B17) - kalici kalem kodu - RLS yalniz muhasebe - standart oranlar veri/cetvel+snapshot (B20).
- PAKETLEME: Model A. cost_object (4. EKSEN): PARK. SABLON FORMAT + KDV: body TEK sekil; kopru acilista bos; vat_rate CANLI, CFE turetir.

## Siradaki is
1. DILIM-3a spec (Opus yazar): sema + iskelet dunyasi — item_burdens.rate_percent nullable + katalog satir turleri (oran/TL tutar/tarife basamagi) + payroll_profile kolonu + fn_refill genisleme (iskelet-doldurma) + F3 stopaj_rate teli + F8 profil tetigi. TEK spec (K4 sarti). Sema/RLS icerdigi icin uygulama oncesi Engin SQL onayi.
2. DILIM-3b: rate_catalog 2026 seed — YALNIZ birincil kanun degerleri (asgari brut, isci/isveren oranlari, GVK 103 ucret tarifesi, katsayi 9, damga 7,59, senaryo girdileri) + bordro iskelet cetveli + payroll_profiles.
3. DILIM-3c: CFE bordro-cozucu saf modul + test katmani (altin fiksturler, round-trip property, sinir testleri, parametre-gecis; hedef ~50+ test).
4. DILIM-3d: UI — aylik dokum (Yasal Yuk sheet buyur) + sinyal yuzeyi v0 + "motor bekliyor" kalkar.
Sonra: PCCE kavrami (K11 cercevesi; G defteri girdisi hazir) + acik sorular 1/4/5 (PERSONEL-MEVZUATI H).

## Acik (kararlasmadi)
- PCCE: ad, mimari yeri, DILIM sinirlari, Faz-2 anomali iliskisi — yalniz deterministik uygunluk uzerinden (K11). Girdi: G defteri (PERSONEL-MEVZUATI G) + sinyal ekran on-eskizi (uc yuzey).
- Acik sorular 1/4/5: PERSONEL-MEVZUATI H'de yasar (kapsam siniri / gosterim + Compliance Guard yerlesimi / menu yeri).
- Muhasebe oran teyitleri (amber): reklam tevkifati + 2026 oran guncelligi + telif tavan.
- Tanimlar/cetveller EKRANI: menu yeri acik (soru 5); ALTYAPISI 3a/3b ile geliyor. Oran-yonetimi ekrani ERTELENDI.
- fn_lock_budget muhur mantigi: K7 tarih kapisi + donemsiz-kova muafiyeti + katalog satir-kumesi snapshot buraya baglandi.
- Kart/kalem-granulunde ortak-calisma yetkilendirmesi (public_note sunumu, RAPORLAR seam) — Faz 1 kapali.
- Model 1 (hesabi KAAPA acar) - Avans->butce cift sayim (B10) - Gorunen rol etiketi - Tedarikci hafizasi.
- "Modul acik mi" bayragi + faturalama/paket fiyat: sirasi gelince.
- Kutuphane resmilestirme + katalog-kodu (cost_object oto-etiketi ve kesin kalem kodlari buna bagli).
- RAPORLAR fazi: icmal PDF - Bakanlik - AICP/export - EFC - cost_object rollup.
- KAPI ACIK (Faz 1 yapmaz): taahhut - mesai - doviz - satir yorumu - breakdown - DIZI (TV/Dijital) vizyonu: 6+ ay pencerede K9 tek-cizgi x Miktar VE K5 yil-asimi-sifirlamasizligi BIRLIKTE yeniden acilir (aday mekanizma: kohort-bazli cizgi; Miktar azalisinda son-giren-ilk-cikar ihtiyat konvansiyonu). Doktrin: PERSONEL-MEVZUATI §1 Faz Siniri / Dizi Kaydi.
- Onceki devirden devam: DB sifre reset + edge fn deploy mekanizmasi.
- Eski paket yapisi (burden_packages + budget_items.package_id) atil; ileride temizlik dilimi.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli): daralabilir sol ray + ust baglam cubugu + orta masa + sag referans yuvasi.
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, ayri.
- Butce her seviyede YALNIZ muhasebe gorur+yazar.
- Yama yok: cikar-degistir.

## Referans (icerik seed)
- Tur sablonlari: REKLAM (AICP 11 kart), FILM (Movie Magic ~30 kart + MMB 6.1 ornek hesap plani referansta), DIZI (scope+episode_no). Turkce sahadan, ABD/sendika rakami gecmez.
- Master kalem listesi: 4746 tekil (Oyuncu-Kast 197 kalem 1600 icin kullanildi).
- Iki-katman: sablon yalin / kutuphane+autocomplete.
