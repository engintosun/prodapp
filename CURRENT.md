# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Butce: kavram + sema + DB temeli + goc CANLI; kart mimarisi 1100-1600 KILITLI.
- 2026-06-21: fn_open_budget CANLI (uctan-uca test).
- 2026-06-24: vergi/yuk modeli GIB ozelgesiyle KILITLENDI; odeme-statusu semasi CANLI.
- 2026-06-25: KART 1500 yapisal 6 kolon + uc eksen vergi modeli + yuk kovasi cins mimarisi KILITLENDI.
- 2026-06-25: DILIM-2a/2b/2c CANLI (cins semasi + statu-fill + CFE cinse gore brut/net).
- 2026-06-25: DILIM-2d CANLI (commit e9dfe58): KART 1500 ekran Net + Brut + KDV ayri kolon; Yasal Yuk = brut-net (TL); kova cinsi servis->UI borusu; bottom-sheet para selalesi (Net -> +KDV = Kisiye banka odemesi / Yasal Yuk -> Brut). CFE kisiyeBanka eklendi (25 test).
- 2026-06-25: DILIM-2e CANLI: statu degisince kova OTOMATIK tazelenir (fn_refill_item_burdens + after-update trigger; fn_open_budget ayni motoru cagirir; mevcut kirli kovalar backfill ile temizlendi). KDV statuden gelir (payment_status_defaults.default_vat_rate). Dokum etiketi cinse gore (bordro->SGK isveren payi / makbuz->stopaj).
- 2026-06-26: Dilim A CANLI — kisiye-banka KDV matrahi brut + statu canli tazeleme + bordro motor-bekliyor etiketi — 24/24 test gecti, CANLI TEYIT BEKLIYOR.
SIRADAKI: m3 Aciklama tikla-genisle -> Statu kisa etiketler (smm/telif/kira/fatura/bordro/konaklama) -> MMB hesap numarasi kutuphane esleme -> DILIM-3 bordro motoru (ILK ADIM: Tanimlar/cetveller sol-ray iskeleti) -> diger kartlar (1100/1300/1400/1600).
- 2026-06-30: Carpan DB kolonu (budget_items.repeat, default 1) — kalici; Adet=multiplier, Carpan=repeat (ikisi DB'de ayri). NET/BRUT artik donem-bazli: her donem net = Birim_net x Miktar x Carpan; ana satir toplami = SUM(donemler). CFE imzasindan multiplier PARAMETRESI CIKTI (netToplamDonemli/brutToplamDonemli sadece donemler[+yukler] alir).
- 2026-06-30: Kolon basliklari: Sebep->Gider, Adet->Miktar (sadece etiket).
- 2026-06-30: Kayan kolon duzeltildi: artik KDV <td> satirdan kaldirildi, thead ile hizalandi.
- 2026-06-30: KDV tamam: brut=net+stopaj/SGK+KDV; dropdown sadece stopaj+KDV satirlari (net/kisiye/brut kaldirildi).
- 2026-06-30: Yasal yuk bottom-sheet: maxHeight 80vh + panel-ici scroll + alt padding; uzun icerik artik kesilmiyor.
- 2026-06-30: DILIM-2f CANLI — donem-bazli geometri (her donem kendi Birim_net/Birim/Miktar/Carpan) + ana satir rol degisimi (tek=giris, cok=salt-okunur ozet) + Birim dropdown (m5+m6 birlikte) + tek<->cok otomatik kopyalama + sil onay + budget_items.repeat muhurleme + kisi birimi seed. Cift-carpma bug otomatik dustu (CFE multiplier parametresi cikti).
- 2026-07-01: DILIM-2f-fix (4bfdacb): Donemler hucresi tek-donem modunda secili donem adini gosterir (onceden hep bos '+ Donem ekle'). Ikinci donem ayni dropdown'dan secilir.
- 2026-07-01: DILIM-2f-fix2 (5b51817): units tablosundan adet/kisi SILINDI (Birim sadece periyot cinsi tasir: gun/hafta/ay/bolum/sabit; adet/kisi Miktar kolonunun konusu). Migration 20260701090000. 3.+ donem eklerken acik baslangic degerleri (Birim_net=0, gorunur Miktar=0, Carpan=1, ilk donemden Birim mirasi).
- 2026-07-01: DILIM-2f-fix3 (aed7cb9): 1->2 donem gecisinde de yeni donem ayni acik degerleri alir (needsExplicitDefaults, esik length>=1). 2->1 cokmede kalan donem satiri KORUNUR (copyLastPeriodToMain — DELETE kaldirildi), boylece tek donem adi ekranda gorunur kalir.
- 2026-07-01: DILIM-2f TAM. CANLI TEYIT: kullanici uretimde dogruladi (donem ekle/sil/gecis + Birim listesi).

## Durum
- HEAD: git log (origin/main) kesin. Repo: github.com/engintosun/prodapp - Canli: prodapp-navy.vercel.app.
- KURULU/CALISIYOR: auth + cok-proje login - saha fis girisi - yonlendirme/duzeltme - davet/rol - reviewer onay/red - proje olusturma + butce tablolari + servisler - onboarding UI - BUTCE DB TEMELI - fn_open_budget CANLI (statu-fill) - CFE (brutBirim/satirToplam/satirToplamDonemli/kdvAyristir/zincirToplam/dokum/brutStopaj/netToplamDonemli/brutToplamDonemli/kisiyeBanka, 28/28) - KART 1500 ekran TAM (donem-bazli geometri + Net+Brut ayri kolon + KDV Yasal Yuk dokumunde selale satiri + Yasal Yuk TL + statu->kova canli senkron + KDV matrahi=brut + bordro motor-bekliyor etiketi).
- ODEME-STATUSU SEMASI CANLI: budget_items.payment_status (6 deger CHECK) + stopaj_rate (null=miras, override) + vat_deductible; budget_item_periods.unit_net_override; payment_status_defaults cetveli (applies_sgk + default_vat_rate; TASLAK, muhasebe teyidi bekliyor).
- YUK KOVASI CINS CANLI (2a-2e): burden_components.kind (additive/deduction); payment_status_burdens eslemesi (smm/kira->stopaj, telif->stopaj_telif; sirket/konaklama bos; bordro motor bekliyor); rate_catalog tek oran evi (stopaj 20, stopaj_telif 17, ... TASLAK). Statu degisince fn_refill + trigger ile kova yeniden snapshot (acilis ve statu-degisimi TEK motor). Servis kovayi kind ile ceker; CFE cinse gore brut (additive x(1+SUM) / deduction /(1-SUM)).
- KART MIMARISI KILITLI: 5 etap, kart=departman + "kullanan sahiplenir", kalem motoru + gorunurluk katmanlari + Compliance Guard. Kilitli kartlar: 1100,1300,1400,1500,1600. Detay: KART-KATALOGU.md.

## VERGI / YUK modeli — KILITLI (2026-06-24/25; detay VERGI-MEVZUATI.md + BUTCE-EKRAN-KARARLARI.md)
- DAYANAK: Istanbul VDB ozelgesi + kaynak-dogrulanmis oranlar. Muhasebe onayi icin PDF chart + MMB 6.1 ornek hesap plani referansta.
- UC EKSEN (KILITLI): Butce "Toplam" = BRUT (yapimci maliyeti). Net ve Brut AYRI kolon. KDV AYRI havuz, geri-alinabilir, maliyete GIRMEZ. (1) SGK/isveren = ekleme (additive); (2) Stopaj = carpan kesinti (deduction); (3) KDV = ayri eksen.
- KISIYE BANKA ODEMESI (2d): Net + KDV (stopaj GIRMEZ - kisiye degil devlete). Ayri kolon DEGIL -> Yasal Yuk bottom-sheet dokumunde selale satiri. CFE kisiyeBanka(net, vatRate) = {kdv, toplam}.
- BIR KALEM = BIR STATU = BIR CINS: bordro (SGK additive) ve makbuz (stopaj deduction) birbirini DISLAR; ayni kalemde ikisi olamaz. Statu degisince kova fn_refill ile o cinse gore bastan dolar (2e).
- YUK KOVASI: item_burdens kalir; icerik statuye gore dolar (esleme klasoru). Her bilesen CINS tasir (burden_components.kind). CFE cinse gore hesaplar. Stopaj kovada (A reddedildi).
- BASIT STATU CARPANLARI: SMM net/0.80 (stopaj20+KDV20); Telif net/0.83 (stopaj17+KDV20); Kira net/0.80 (stopaj20, KDV YOK); Fatura/Sirket net=maliyet (KDV20 havuz); Konaklama (KDV%10 havuz).
- BORDRO: basit % DEGIL, MOTOR (kumulatif matrah + artan GV + SGK tavan/taban + asgari ucret istisnasi + damga). Hardcode YASAK. DILIM-3 fazi; ara donemde bordro kalemleri kova bos = "motor bekliyor".
- SGK ISVEREN: ham %21.75; %19.75 varsayilan / %15.5 bakanlik-bolgesel / %21.75 borclu. Sirket-Profili checkbox DILIM-3.
- B20: standart oranlar veri/cetvel (rate_catalog), koda gomulmez; acilista/statu-degisiminde snapshot; kullanici-guncellenebilir (oran-yonetimi ekrani ERTELENDI).
- MUHASEVIRE ACIK (PDF amber): 2026 oran guncelligi + reklam tevkifati 3/10 mi 10/10 mu + telif tavan teyidi. YAPISAL model kilitli.

## KART 1500 kolon-kolon (MODEL kart)
Kolon seti (KILITLI): Kod - Gider - Aciklama - Statu - Donemler - Birim net - Birim - Miktar - Carpan - Yasal Yuk - Net toplam - Brut toplam.
- Ana satir TEK donemde GIRIS rolu (Birim_net+Birim+Miktar+Carpan girilir), COK donemde SALT-OKUNUR OZET rolu (Birim_net/Birim/Miktar: ayniysa deger, farkliysa "—"; Carpan: SUM; Yasal Yuk/Net/Brut: SUM).
- Donem-satiri ana tabloyla kolon-kolon hizali (12 ayri td, colSpan yok); sadece COK donemde gorunur, TEK donemde gizli. Birim native select (units cetveli); Sil × onay sorar.
- Tek<->cok gecisinde degerler otomatik kopyalanir (ana satir <-> ilk/son donem-satiri). Detay: docs/butce/ (DILIM-2f).
- 1500 model tamam -> diger kartlar (1100/1300/1400/1600) ayni model uzerinden gecilir.

## Butce — KILITLI kararlar (ozet; detay docs/butce/BUTCE-SEMA-KARARLARI.md)
- GIRIS YAPISI (06-13): kart=departman; faz=donemin kaba hali; giris=sakin liste + "ne zaman" dokun-isaretle; tam gorunum=nakit matrisi.
- GOC CANLI (06-14): budget_item_periods koprusu. "En az bir donem" + "donem tarihli" MUHURDE.
- SEMA B1-B20: hesaplanan deger saklanmaz (B18) - negatif kapidan giremez (B3) - degisiklik izi (B19) - kasa/raf dokunulmazlik (B16/B17) - kalici kalem kodu - dis format kodu ayri - RLS yalniz muhasebe - standart oranlar veri/cetvel+snapshot (B20).
- PAKETLEME: Model A. cost_object (4. EKSEN): PARK, DDL ayri dilim.
- SABLON FORMAT + KDV (06-15): body TEK sekil; kopru acilista bos; vat_rate CANLI, CFE turetir (B18). Govde kalem alani: payment_status (paket emekli, 2b).

## Siradaki is
- m5+m6 (Birim dropdown) TAMAM. m2 (donem-satiri hizalama) DILIM-2f icinde TAMAM.
- Kalan UI: m3 (Aciklama tikla-genisle), Statu kisa etiketler (smm/telif/kira/fatura/bordro/konaklama), MMB hesap numarasi kutuphane esleme.
- Sonra DILIM-3 bordro motoru -> diger kartlar (1100/1300/1400/1600) -> backlog. Tam sira: docs/IS-SIRASI.md.

## Acik (kararlasmadi)
- Muhasebe oran teyitleri (amber PDF): reklam tevkifati + 2026 oran guncelligi + telif tavan.
- Tanimlar/cetveller bolumu (sol-ray): rate_catalog + payment_status_defaults + payroll-base + bordro parametreleri burada yasar; DILIM-3 ILK ADIMI (Engin onayli).
- Oran-yonetimi ekrani ERTELENDI (Tanimlar bolumu icinde, IS-SIRASI'da).
- fn_lock_budget muhur mantigi (donemsiz kovasi muafiyeti dahil).
- Model 1 (hesabi KAAPA acar) - Avans->butce cift sayim (B10) - Gorunen rol etiketi - Tedarikci hafizasi.
- "Modul acik mi" bayragi + faturalama/paket fiyat: sirasi gelince.
- Kutuphane resmilestirme + katalog-kodu (cost_object oto-etiketi ve kesin kalem kodlari buna bagli).
- RAPORLAR fazi: icmal PDF - Bakanlik - AICP/export - EFC - cost_object rollup.
- KAPI ACIK (Faz 1 yapmaz): taahhut - mesai - doviz - satir yorumu - breakdown.
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
