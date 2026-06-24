# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Butce: kavram + sema + DB temeli + goc CANLI; kart mimarisi 1100-1600 KILITLI.
- 2026-06-21: fn_open_budget CANLI (uctan-uca test).
- 2026-06-23: butce giris UI mekanigi (2b: kalem tablosu + hucre duzenleme + etap-basina miktar) CANLI; vergi/yuk modeli tasarlandi (iki belge).
- 2026-06-24: vergi/yuk modeli GIB ozelgesiyle KILITLENDI; CFE brutStopaj eklendi (9/9 yesil); odeme-statusu semasi CANLI; KART 1500 kolon-kolon model basladi (1. kolon Kalem kilitli).
SIRADAKI: KART 1500 2. kolon (Statu) -> sonra Donemler/KDV/Yuk/Net/Brut. 1500 model olunca diger kartlar (1100/1300/1400/1600...) bunun ustunden gecilir.

## Durum
- HEAD: git log (origin/main) kesin. Repo: github.com/engintosun/prodapp - Canli: prodapp-navy.vercel.app.
- KURULU/CALISIYOR: auth + cok-proje login - saha fis girisi - yonlendirme/duzeltme - davet/rol - reviewer onay/red - proje olusturma + butce tablolari + servisler - onboarding UI - BUTCE DB TEMELI (RLS muhasebe-only + iz/updated_at) - BUTCE GOCU CANLI - fn_open_budget CANLI - CFE (brutBirim/satirToplam/kdvAyristir/zincirToplam/dokum + brutStopaj = net/(1-oran), 9/9) - 2b butce giris UI (kalem tablosu + hucre duzenleme + etap-basina miktar; bu UI vergi/yuk semasi oturunca yeniden kurulacak).
- ODEME-STATUSU SEMASI CANLI (2026-06-24, additive goc): budget_items += payment_status (text+CHECK: bordro/smm/telif_belgeli/sirket/kira_sahis/konaklama) + stopaj_rate (null=miras) + vat_deductible; budget_item_periods += unit_net_override (donem-basina farkli ucret); yeni cetvel payment_status_defaults (statu->varsayilan stopaj/sgk/kdv, valid_from'lu, seed TASLAK) + RLS (authenticated okur, service_role yazar).
- KART MIMARISI KILITLI: 5 etap, kart=departman + "kullanan sahiplenir", kalem motoru (ait-kart/onay-koprusu/risk-bayragi/alias + odeme-statusu + anomali kurallari + cost_object 4. eksen), gorunurluk katmanlari, Compliance Guard. Kilitli kartlar: 1100,1300,1400,1500,1600. Detay: docs/butce/KART-KATALOGU.md.
- KRITIK ACIK: butce okuma yuzeyi + anomali motoru yok (kural var, kod yok). 2b giris UI yeni vergi/yuk modeline gore yeniden kurulacak (sema CANLI; CFE dallanma + fn_open_budget snapshot + UI bekliyor).

## VERGI / YUK modeli — KILITLI (2026-06-24; detay docs/butce/VERGI-MEVZUATI.md + BUTCE-EKRAN-KARARLARI.md)
- DAYANAK: Istanbul VDB ozelgesi 22.08.2013 (...1291) + kaynak-dogrulanmis oranlar. Muhasebe onayi icin PDF chart hazirlandi.
- ILKE: sahada NET anlasilir; kaleme net girilir; Brut = Net + Yuk; yuk'un dogasi statuye gore. Stopaj brutten kesilir -> net garantili: Brut = Net/(1-oran) (brutStopaj, CANLI). SGK net'e EKLENIR (additive, item_burdens). KDV AYRI eksen (gider, indirilir; toplama/yuke girmez). Hesaplanan deger saklanmaz (B18).
- STOPAJ ADDITIVE YUKTEN CIKACAK: stopaj eski burden_components'ta additive @20 idi (YANLIS); statuye bagli carpan (brutStopaj) olacak; SGK/ajans/damga additive kalir. (CFE dallanma + fn_open_budget snapshot + stopaj component'inin paketlerden cikarilmasi = SIRADAKI vergi/yuk dilimi-2.)
- STATU->DAVRANIS (ozet): telif_belgeli (eser belgeli senarist/besteci/YONETMEN) %17 -> Net/0,83; smm (OYUNCU + belgesiz + serbest ekip) %20 -> Net/0,80; bordro artan tarife + SGK biner (fringe motoru §8 PARK); sirket faturasi yok; kira_sahis %20; konaklama/yemek KDV %10.
- KRITIK DUZELTME: OYUNCULUK telif DEGIL -> oyuncu SMM/bordro, %17 ALAMAZ. YONETMEN senarist/besteci grubunda (eser belgesiyle %17). Telif 2026 istisna tavani 5.300.000 TL (asilirsa istisna duser, %40'a kadar + KDV).
- B20: standart oranlar VERI olarak durur (cetvel), koda gomulmez; acilista butceye snapshot (B16); kullanici-guncellenebilir (oran-yonetimi ekrani ERTELENDI).
- MUHASEVIRE ACIK (PDF amber): 2026 oran guncelligi (%17/%20/kira %20) + reklam tevkifati 3/10 mu 10/10 mu (kaynaklar celiskili) + telif tavan teyidi. Kesinlesince oranlar cetvelde guncellenir; YAPISAL model kilitli.

## KART 1500 kolon-kolon (MODEL kart — AKTIF)
Amac: 1500'u kolon kolon kilitle -> diger kartlara model. Kolon seti (kilitli): Kalem - Statu - Donemler - KDV - Yuk - Net toplam - Brut toplam. Kalem acilinca donem-basina birim-net x adet; altta kart toplami + Yasal Yukler (SGK+stopaj; okuma amacli, genel toplama EKLENMEZ).
- 1. kolon KALEM (KILITLI): ad + ac/kapa chevron; "+ kalem ekle" -> kutuphaneden (4746) oto-tamamlama, kutuphane-disi serbest yazim "kutuphane-disi" isaretiyle (dedup/anomali ayirt etsin); satir eylemleri yeniden adlandir/sirala/gizle (soft, B16); kalici kalem kodu gorunmez (B17, ic kimlik); alias kalem rozetle (tutar burada SAYILMAZ).
- UI'den kopuk gidilmiyor: her kolonun mobil davranisi o an karara baglanir (ornek: Yuk dropdown'i mobilde bottom-sheet). Mobile DONULMEDI; masaustu kolon-kolon devam.
- SIRADAKI: 2. kolon STATU (dropdown davranisi + mobil bottom-sheet uyumu).

## Butce — KILITLI kararlar (ozet; detay docs/butce/BUTCE-SEMA-KARARLARI.md)
- GIRIS YAPISI (06-13): kart=departman; faz=donemin kaba hali; giris=sakin liste + "ne zaman" her satirda + cogul donem dokun-isaretle; tam gorunum=nakit matrisi. 6 arayuz ilkesi + 5 veri kurali + yuvarlama sozlesmesi.
- GOC CANLI (06-14): department_id NOT NULL; budget_item_periods koprusu (unique(item_id,stage_id), miktar koprude, satir toplami turetilir). "En az bir donem" + "donem tarihli" MUHURDE.
- SEMA B1-B20: hesaplanan deger saklanmaz (B18) - negatif kapidan giremez (B3) - degisiklik izi (B19) - kasa/raf dokunulmazlik (B16/B17) - kalici kalem kodu kimlik - dis format kodu ayri - RLS yalniz muhasebe - yuk=item_burdens+packages - standart oranlar veri/cetvel + snapshot (B20).
- PAKETLEME: Model A — butce+harcama tek kod, iki yuzey; tek temas receipts.budget_item_id.
- cost_object (4. EKSEN): MMB Set/Saturation Tag; kategori-seviyesi; sema DDL ayri dilim (PARK). Detay KART-KATALOGU §4.10.
- SABLON FORMAT + KDV (06-15): body TEK sekil; kopru acilista bos (Model A); paket-kodu + gunun orani snapshot; KDV ayristirma (Genis yol) vat_rate CANLI, NET/BRUT girisi CFE turetir (B18).

## Siradaki is
Aktif: KART 1500 kolon-kolon (2. kolon Statu). Sonra: VERGI/YUK dilimi-2 = CFE satirToplam dallanma (statu boluyorsa brutStopaj / bordro additive + donem-basina unit_net + cevap-anahtarli test) + fn_open_budget snapshot (payment_status_defaults -> budget_items.stopaj_rate/vat) + stopaj component'inin paketlerden cikarilmasi. Sonra 2b giris UI yeniden-kurulum (yeni model). Tam sira: docs/IS-SIRASI.md.

## Acik (kararlasmadi)
- Muhasebe oran teyitleri: 2026 oran guncelligi + reklam tevkifati 3/10/10/10 + telif tavan (yukarida).
- Oran-yonetimi ekrani ERTELENDI (IS-SIRASI'da).
- fn_lock_budget muhur mantigi (donemsiz kovasi muafiyeti dahil) acik.
- Model 1 (hesabi KAAPA acar) - Avans->butce cift sayim (B10) - Gorunen rol etiketi - Tedarikci hafizasi + Arastir.
- "Modul acik mi" bayragi + faturalama/paket fiyat: sirasi gelince.
- Kutuphane resmilestirme + katalog-kodu (cost_object oto-etiketi ve kesin kalem kodlari buna bagli).
- RAPORLAR fazi: icmal PDF - Bakanlik formu - AICP/export - EFC - cost_object rollup.
- KAPI ACIK (sema oldurmez, Faz 1 yapmaz): taahhut - mesai - doviz (CFE) - satir yorumu - breakdown modulu.
- Onceki devirden devam eden acik: guvenlik DB sifre reset + edge fn deploy mekanizmasi.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli) — muhasebe CALISMA ortami; daralabilir sol ray + ust baglam cubugu + orta masa + sag referans yuvasi. (Calisan UI = bunun islevsel hali; gorsel komp ayri.)
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, butce-havuzu uyarisindan AYRI.
- Butce her seviyede YALNIZ muhasebe gorur+yazar.
- Yama yok: cikar-degistir.

## Referans (icerik seed)
- Tur sablonlari: REKLAM (AICP 11 kart), FILM (Movie Magic, 4 kova ~30 kart, fringe=Turk yuk makinesi, MMB Sets=cost_object), DIZI (scope+episode_no ile cozulu). ORTAK FILTRE: yapi gecer, ABD/sendika rakami gecmez.
- Master kalem listesi: 4746 tekil (Oyuncu-Kast 197 kalem 1600 icin kullanildi).
- Iki-katman: sablon yalin / kutuphane+autocomplete.
