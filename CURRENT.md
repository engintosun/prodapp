# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Butce: kavram + sema + DB temeli + goc CANLI; kart mimarisi 1100-1600 KILITLI.
- 2026-06-21: fn_open_budget CANLI (uctan-uca test).
- 2026-06-24: vergi/yuk modeli GIB ozelgesiyle KILITLENDI; odeme-statusu semasi CANLI.
- 2026-06-25: KART 1500 yapisal 6 kolon kuruldu. Uc eksen vergi modeli + yuk kovasi cins mimarisi KILITLENDI.
- 2026-06-25: DILIM-2a CANLI (burden_components.kind + payment_status_burdens eslemesi + stopaj_telif/17; payment_status_defaults.default_stopaj_rate cikti, tek oran evi rate_catalog).
- 2026-06-25: DILIM-2b CANLI (fn_open_budget kovayi statuden doldurur; 1500 sablonu payment_status tasir; paket yolu emekli).
SIRADAKI: DILIM-2c (CFE cinse gore brut) -> 2d (ekran Net+Brut+KDV) -> UI duzeltmeleri (m2,m3,m5+m6) -> DILIM-3 bordro motoru.

## Durum
- HEAD: git log (origin/main) kesin. Repo: github.com/engintosun/prodapp - Canli: prodapp-navy.vercel.app.
- KURULU/CALISIYOR: auth + cok-proje login - saha fis girisi - yonlendirme/duzeltme - davet/rol - reviewer onay/red - proje olusturma + butce tablolari + servisler - onboarding UI - BUTCE DB TEMELI - fn_open_budget CANLI (statu-fill) - CFE (brutBirim/satirToplam/satirToplamDonemli/kdvAyristir/zincirToplam/dokum/brutStopaj, 13/13) - KART 1500 giris UI (6 kolon).
- ODEME-STATUSU SEMASI CANLI: budget_items.payment_status (6 deger CHECK) + stopaj_rate (null=miras, override) + vat_deductible; budget_item_periods.unit_net_override; payment_status_defaults cetveli (applies_sgk + default_vat_rate; TASLAK, muhasebe teyidi bekliyor).
- YUK KOVASI CINS CANLI (DILIM-2a/2b): burden_components.kind (additive/deduction); payment_status_burdens eslemesi (smm/kira->stopaj, telif->stopaj_telif; sirket/konaklama bos; bordro motor bekliyor); rate_catalog tek oran evi (stopaj 20, stopaj_telif 17, ... TASLAK). fn_open_budget statuye gore item_burdens snapshot.
- KART MIMARISI KILITLI: 5 etap, kart=departman + "kullanan sahiplenir", kalem motoru + gorunurluk katmanlari + Compliance Guard. Kilitli kartlar: 1100,1300,1400,1500,1600. Detay: KART-KATALOGU.md.
- KRITIK ACIK: CFE henuz cinse gore brut hesaplamiyor (DILIM-2c); Net/Brut/KDV ayri kolon yok (DILIM-2d). Mevcut UI "Toplam" = donem-bazli brut (donem-net override + ratesPercent); cins-dallanma ve statu-carpan ekrana henuz baglanmadi.

## VERGI / YUK modeli — KILITLI (2026-06-24/25; detay VERGI-MEVZUATI.md + BUTCE-EKRAN-KARARLARI.md)
- DAYANAK: Istanbul VDB ozelgesi + kaynak-dogrulanmis oranlar. Muhasebe onayi icin PDF chart + MMB 6.1 ornek hesap plani referansta.
- UC EKSEN (KILITLI): Butce "Toplam" = BRUT (yapimci maliyeti). Net ve Brut AYRI kolon. KDV AYRI havuz, geri-alinabilir, maliyete GIRMEZ. (1) SGK/isveren = ekleme (additive); (2) Stopaj = carpan kesinti (deduction); (3) KDV = ayri eksen.
- YUK KOVASI: item_burdens kalir; icerik statuye gore dolar (esleme klasoru). Her bilesen CINS tasir (burden_components.kind). CFE cinse gore hesaplar. Stopaj kovada (A reddedildi).
- BASIT STATU CARPANLARI: SMM net/0.80 (stopaj20+KDV20); Telif net/0.83 (stopaj17+KDV20); Kira net/0.80 (stopaj20, KDV YOK); Fatura/Sirket net=maliyet (KDV20 havuz); Konaklama (KDV%10 havuz).
- BORDRO: basit % DEGIL, MOTOR (kumulatif matrah + artan GV + SGK tavan/taban + asgari ucret istisnasi + damga). Hardcode YASAK. DILIM-3 fazi; ara donemde bordro kalemleri kova bos = "motor bekliyor".
- SGK ISVEREN: ham %21.75; %19.75 varsayilan / %15.5 bakanlik-bolgesel / %21.75 borclu. Sirket-Profili checkbox DILIM-3.
- B20: standart oranlar veri/cetvel (rate_catalog), koda gomulmez; acilista snapshot; kullanici-guncellenebilir (oran-yonetimi ekrani ERTELENDI).
- MUHASEVIRE ACIK (PDF amber): 2026 oran guncelligi + reklam tevkifati 3/10 mi 10/10 mu + telif tavan teyidi. YAPISAL model kilitli.

## KART 1500 kolon-kolon (MODEL kart)
Kolon seti (KILITLI): Kalem - Statu - Aciklama - Donemler - KDV - Yasal Yuk - Net toplam - Brut toplam.
- YAPILDI: Kalem + Aciklama + Statu (6 deger native dropdown kisa etiket) + Donemler (tikla-ekle + donem-net override) + Yasal Yuk (salt-okunur bottom-sheet). Sema: yuk cinsi + statu-esleme + statu-fill CANLI (2a/2b).
- SIRADAKI 2c: CFE brut'u cinse gore (additive x(1+SUMoran); deduction /(1-SUMoran)); Net+Brut ayri CFE; cevap-anahtarli test.
- SIRADAKI 2d: ekran Net + Brut + KDV ayri kolon; Yasal Yuk = brut-net farki (TL); dokum statuye gore.
- SIRADAKI UI (modelden bagimsiz): m2 donem-satiri hizalama; m3 Aciklama tikla-genisle; m5+m6 Birim secilebilir dropdown.
- 1500 model tamam olunca diger kartlar (1100/1300/1400/1600) ayni model uzerinden gecilir.

## Butce — KILITLI kararlar (ozet; detay docs/butce/BUTCE-SEMA-KARARLARI.md)
- GIRIS YAPISI (06-13): kart=departman; faz=donemin kaba hali; giris=sakin liste + "ne zaman" dokun-isaretle; tam gorunum=nakit matrisi.
- GOC CANLI (06-14): budget_item_periods koprusu. "En az bir donem" + "donem tarihli" MUHURDE.
- SEMA B1-B20: hesaplanan deger saklanmaz (B18) - negatif kapidan giremez (B3) - degisiklik izi (B19) - kasa/raf dokunulmazlik (B16/B17) - kalici kalem kodu - dis format kodu ayri - RLS yalniz muhasebe - standart oranlar veri/cetvel+snapshot (B20).
- PAKETLEME: Model A. cost_object (4. EKSEN): PARK, DDL ayri dilim.
- SABLON FORMAT + KDV (06-15): body TEK sekil; kopru acilista bos; vat_rate CANLI, CFE turetir (B18). Govde kalem alani: payment_status (paket emekli, DILIM-2b).

## Siradaki is
Aktif: DILIM-2c (CFE cinse gore brut). Sonra 2d (ekran). Paralel: UI duzeltmeleri m2/m3/m5+m6. Sonra DILIM-3 bordro motoru -> diger kartlar (1100/1300/1400/1600) -> backlog. Tam sira: docs/IS-SIRASI.md.

## Acik (kararlasmadi)
- Muhasebe oran teyitleri (amber PDF): reklam tevkifati + 2026 oran guncelligi + telif tavan.
- Oran-yonetimi ekrani ERTELENDI (IS-SIRASI'da).
- fn_lock_budget muhur mantigi (donemsiz kovasi muafiyeti dahil).
- Model 1 (hesabi KAAPA acar) - Avans->butce cift sayim (B10) - Gorunen rol etiketi - Tedarikci hafizasi.
- "Modul acik mi" bayragi + faturalama/paket fiyat: sirasi gelince.
- Kutuphane resmilestirme + katalog-kodu (cost_object oto-etiketi ve kesin kalem kodlari buna bagli).
- RAPORLAR fazi: icmal PDF - Bakanlik - AICP/export - EFC - cost_object rollup.
- KAPI ACIK (Faz 1 yapmaz): taahhut - mesai - doviz - satir yorumu - breakdown.
- Onceki devirden devam: DB sifre reset + edge fn deploy mekanizmasi.
- Eski paket yapisi (burden_packages tablosu + budget_items.package_id) atil; ileride temizlik dilimi.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli): daralabilir sol ray + ust baglam cubugu + orta masa + sag referans yuvasi.
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, ayri.
- Butce her seviyede YALNIZ muhasebe gorur+yazar.
- Yama yok: cikar-degistir.

## Referans (icerik seed)
- Tur sablonlari: REKLAM (AICP 11 kart), FILM (Movie Magic ~30 kart + MMB 6.1 ornek hesap plani referansta), DIZI (scope+episode_no). Turkce sahadan, ABD/sendika rakami gecmez.
- Master kalem listesi: 4746 tekil (Oyuncu-Kast 197 kalem 1600 icin kullanildi).
- Iki-katman: sablon yalin / kutuphane+autocomplete.
