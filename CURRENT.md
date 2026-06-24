# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Butce: kavram + sema + DB temeli + goc CANLI; kart mimarisi 1100-1600 KILITLI.
- 2026-06-21: fn_open_budget CANLI (uctan-uca test).
- 2026-06-23: butce giris UI mekanigi + vergi/yuk modeli tasarlandi.
- 2026-06-24: vergi/yuk modeli GIB ozelgesiyle KILITLENDI; CFE brutStopaj (9/9); odeme-statusu semasi CANLI.
- 2026-06-25: KART 1500 yapisal 6 kolon kuruldu (Statu 83951d1 + Aciklama d10ca1b + Donemler-A 3c69456 + Donemler-B1 69eb6b2 + Yuk-dokum B2 9298ac4). Uc eksen vergi modeli + yuk kovasi mimarisi KILITLENDI.
SIRADAKI: DILIM-2 (2a Engin onayi bekliyor) -> UI duzeltmeleri (m2,m3,m5+m6) -> DILIM-3 bordro motoru.

## Durum
- HEAD: git log (origin/main) kesin. Repo: github.com/engintosun/prodapp - Canli: prodapp-navy.vercel.app.
- KURULU/CALISIYOR: auth + cok-proje login - saha fis girisi - yonlendirme/duzeltme - davet/rol - reviewer onay/red - proje olusturma + butce tablolari + servisler - onboarding UI - BUTCE DB TEMELI - fn_open_budget CANLI - CFE (brutBirim/satirToplam/satirToplamDonemli/kdvAyristir/zincirToplam/dokum/brutStopaj, 13/13) - KART 1500 giris UI (6 kolon: Kalem/Aciklama/Statu/Donemler+net-override/KDV/Yasal Yuk bottom-sheet).
- ODEME-STATUSU SEMASI CANLI (additive goc): budget_items += payment_status (bordro/smm/telif_belgeli/sirket/kira_sahis/konaklama) + stopaj_rate + vat_deductible; budget_item_periods += unit_net_override; payment_status_defaults cetveli (TASLAK, muhasebe teyidi bekliyor).
- KART MIMARISI KILITLI: 5 etap, kart=departman + "kullanan sahiplenir", kalem motoru + gorunurluk katmanlari + Compliance Guard. Kilitli kartlar: 1100,1300,1400,1500,1600. Detay: KART-KATALOGU.md.
- KRITIK ACIK: yuk kovasi cinsi yok (additive/kesinti ayrimi DILIM-2a'ya ertelendi); Net/Brut/KDV ayri kolon yok (DILIM-2d sonrasi ekranla gelir). Mevcut UI "Toplam" = donem-bazli brut (donem-net override + ratesPercent), KDV ve statu-carpan henuz entegre edilmedi.

## VERGI / YUK modeli — KILITLI (2026-06-24/25; detay VERGI-MEVZUATI.md + BUTCE-EKRAN-KARARLARI.md)
- DAYANAK: Istanbul VDB ozelgesi + kaynak-dogrulanmis oranlar. Muhasebe onayi icin PDF chart hazirlandi.
- UC EKSEN (KILITLI): Butce "Toplam" = BRUT (yapimci maliyeti), net degil. Net ve Brut AYRI iki kolon. KDV AYRI havuz, maliyete GIRMEZ, geri-alinabilir. Uc eksen BIRLESTIRILEMEZ: (1) SGK/isveren = ekleme (brut=net*(1+oran), sadece bordro); (2) Stopaj = carpan kesinti (brut=net/(1-oran), SMM/telif/kira); (3) KDV = ayri eksen, havuz.
- YUK KOVASI MIMARISI ("A reddedildi" = stopaj kovadan cikarma): Kova (item_burdens) kalir; icerik statuye gore dolar (bordro->SGK+issizlik, SMM->stopaj20, telif->stopaj17, kira->stopaj20, fatura/konaklama->bos). Her yuk bileseni CINS tasir: ekleme mi kesinti mi (burden_components.kind). CFE cinse gore hesaplar. Yama degil.
- BASIT STATU CARPANLARI: SMM brut=net/0.80 (stopaj20+KDV20); Telif brut=net/0.83 (stopaj17+KDV20); Kira brut=net/0.80 (stopaj20, KDV YOK); Fatura/Sirket net=maliyet (KDV20 havuz, stopaj yok); Konaklama (KDV%10 havuz, stopaj yok).
- BORDRO: basit % DEGIL, MOTOR (kumulatif aylik matrah + artan GV dilimleri %15-40 + SGK tavan/taban + asgari ucret istisnasi + damga). Hardcode YASAK. DILIM-3 fazi.
- SGK ISVEREN: ham %21.75; tesvik senaryolari: %19.75 varsayilan (duzenli-odeme), %15.5 bakanlik-bolgesel, %21.75 borclu/tesviksiz (7566 SK + Hazine Tesviki). Sirket-Profili checkbox dilim-3.
- B20: standart oranlar veri/cetvel, koda gomulmez; acilista snapshot; kullanici-guncellenebilir (oran-yonetimi ekrani ERTELENDI, IS-SIRASI'da).
- MUHASEVIRE ACIK (PDF amber): 2026 oran guncelligi + reklam tevkifati 3/10 mi 10/10 mu + telif tavan teyidi. Kesinlesince cetvelde guncellenir; YAPISAL model kilitli.

## KART 1500 kolon-kolon (MODEL kart)
Kolon seti (KILITLI): Kalem - Statu - Aciklama - Donemler - KDV - Yasal Yuk - Net toplam - Brut toplam.
- YAPILDI (2026-06-25): Kalem (KILITLI, oto-tamamlama, alias-rozet) + Aciklama (bos gelir, Ingilizce sablonda kalir) + Statu (6 deger, native dropdown, m4 kisa etiket: SMM/Telif/Kira/Fatura/Bordro/Konaklama) + Donemler (tikla-ekle + donem-net override + donem-bazli total) + Yasal Yuk (bottom-sheet: bileseni goster, salt-okunur).
- SIRADAKI UI DUZELTMELERI (modelden bagimsiz, sira bekliyor): m2 donem-satiri hizalama (net Birim-net altina, miktar Adet altina); m3 Aciklama tikla-genisle; m5+m6 Birim secilebilir dropdown (adet/kisi/gun/hafta/ay, varsayilandan tiklayinca degisir).
- SIRADAKI DILIM-2 (2a Engin onayi sonrasi): 2a kovaya cins alani + statu->bilesen eslemesi + rate_catalog oranlar (SEMA degisikligi, db push); 2b statu sec->kova snapshot; 2c CFE brut'u cinse gore, Net+Brut hesaplari; 2d Net+Brut+KDV ayri kolonlar ekran.
- 1500 model tamam olduktan sonra diger kartlar (1100/1300/1400/1600) ayni model uzerinden gecilir.

## Butce — KILITLI kararlar (ozet; detay docs/butce/BUTCE-SEMA-KARARLARI.md)
- GIRIS YAPISI (06-13): kart=departman; faz=donemin kaba hali; giris=sakin liste + "ne zaman" dokun-isaretle; tam gorunum=nakit matrisi. 6 arayuz ilkesi + 5 veri kurali + yuvarlama sozlesmesi.
- GOC CANLI (06-14): budget_item_periods koprusu. "En az bir donem" + "donem tarihli" MUHURDE.
- SEMA B1-B20: hesaplanan deger saklanmaz (B18) - negatif kapidan giremez (B3) - degisiklik izi (B19) - kasa/raf dokunulmazlik (B16/B17) - kalici kalem kodu kimlik - dis format kodu ayri - RLS yalniz muhasebe - yuk=item_burdens+packages - standart oranlar veri/cetvel+snapshot (B20).
- PAKETLEME: Model A. cost_object (4. EKSEN): PARK, DDL ayri dilim. KART-KATALOGU §4.10.
- SABLON FORMAT + KDV (06-15): body TEK sekil; kopru acilista bos; vat_rate CANLI, CFE turetir (B18).

## Siradaki is
Aktif: DILIM-2 gate (Engin onayi gerekiyor). Paralel yurutulabilir: UI duzeltmeleri m2/m3/m5+m6. Sonra: DILIM-3 bordro motoru -> diger kartlar (1100/1300/1400/1600) -> backlog (m9, Turkce seed, soluk/koyu kontrast). Tam sira: docs/IS-SIRASI.md.

## Acik (kararlasmadi)
- DILIM-2 gate: basit statuler simdi, bordro motoru DILIM-3 ayri faz — 2a oncesi Engin onayi.
- Muhasebe oran teyitleri (amber PDF): reklam tevkifati + 2026 oran guncelligi + telif tavan.
- Oran-yonetimi ekrani ERTELENDI (IS-SIRASI'da).
- fn_lock_budget muhur mantigi (donemsiz kovasi muafiyeti dahil).
- Model 1 (hesabi KAAPA acar) - Avans->butce cift sayim (B10) - Gorunen rol etiketi - Tedarikci hafizasi.
- "Modul acik mi" bayragi + faturalama/paket fiyat: sirasi gelince.
- Kutuphane resmilestirme + katalog-kodu (cost_object oto-etiketi ve kesin kalem kodlari buna bagli).
- RAPORLAR fazi: icmal PDF - Bakanlik - AICP/export - EFC - cost_object rollup.
- KAPI ACIK (Faz 1 yapmaz): taahhut - mesai - doviz - satir yorumu - breakdown.
- Onceki devirden devam: DB sifre reset + edge fn deploy mekanizmasi.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli): daralabilir sol ray + ust baglam cubugu + orta masa + sag referans yuvasi.
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, butce-havuzu uyarisindan AYRI.
- Butce her seviyede YALNIZ muhasebe gorur+yazar.
- Yama yok: cikar-degistir.

## Referans (icerik seed)
- Tur sablonlari: REKLAM (AICP 11 kart), FILM (Movie Magic ~30 kart, fringe=Turk yuk makinesi), DIZI (scope+episode_no). Turkce sahadan, ABD/sendika rakami gecmez.
- Master kalem listesi: 4746 tekil (Oyuncu-Kast 197 kalem 1600 icin kullanildi).
- Iki-katman: sablon yalin / kutuphane+autocomplete.
