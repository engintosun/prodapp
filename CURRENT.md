# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Butce: kavram + sema + DB temeli + goc CANLI; CFE dilim 1 canli (8/8). 2026-06-15: sablon body jsonb FORMAT + KDV ayristirma (Genis yol) KILITLENDI. 2026-06-19 (oturum 1): KART 1100 ve 1300 KILITLENDI; etap/kart/kalem motoru/coklu-calisma yetki kilitlendi. 2026-06-19 (oturum 2): KART 1400 (Yapimci Birimi) ve 1500 (Yonetmen) KILITLENDI; odeme-statusu boyutu (loan-out/fringe), genel anomali kurallari (cift-fringe/crew-overlap/mahsup/milestone), kart gorunurluk katmanlari, Compliance Guard KILITLENDI. 2026-06-20 (oturum 3): KART 1600 (OYUNCU) KILITLENDI — tek kart (Cast+Atmosphere birlesik, 4-kaynak ortusmesi: Saturation/Eurimages/Master/Turk saha), 4 grup (Ana Kast / Dublor / Arkaplan Oyuncusu / Kast Operasyonu), stunt doga-bolmesi (performans Oyuncu, arac Transport, mekanik Mekanik FX; eski "Efekt & Dublor" karti cozuldu), cocuk-compliance (set ogretmeni zorunlu, anomali), terimler Turk sahadan. cost_object (4. EKSEN, MMB Set/Saturation Tag) KARARI: kategori-seviyesi (Stunt/VFX/per-oyuncu), opsiyonel/secici, kutuphaneden oto-etiket, sahne-instance + breakdown KAPSAM-DISI (gelecek modul); sema DDL ayri dilim. Bu oturumlar kod uretmedi (mimari/karar). Detay: docs/butce/KART-KATALOGU.md. SIRADAKI: 2b — TEK kartin calisan giris UI'i (fn_open_budget CANLI, 2026-06-21).

## Durum
- HEAD: git log (origin/main) kesin. Repo: github.com/engintosun/prodapp · Canli: prodapp-navy.vercel.app.
- KURULU/CALISIYOR: auth + cok-proje login · saha fis girisi · yonlendirme trigger · duzeltme · davet/rol · reviewer onay/red · proje olusturma + butce tablolari + servisler · onboarding UI · BUTCE DB TEMELI (15 tablo + RLS muhasebe-only + iz/updated_at) · BUTCE GOCU CANLI (kart=departman, budget_stages=donem tarihli, budget_item_periods koprusu) · CFE DILIM 1 (saf hesap: brutBirim/satirToplam/kdvAyristir/zincirToplam/dokum; UI/servise bagli degil).
- KART MIMARISI KILITLI: 5 etap ekseni, kart=departman+"kullanan sahiplenir", gelistirme=recoupable tek kart, kalem motoru (ait-kart/onay-koprusu/risk-bayragi/alias-isaret-eder + odeme-statusu/loan-out + genel anomali kurallari + cost_object 4. eksen), kart gorunurluk katmanlari (DB tam erisim != UI maske, ATL bas-kase gizli, Master/Owner), Compliance Guard. Kilitli kartlar: 1100, 1300, 1400, 1500, 1600. Siradaki: butce runtime dikey-dilimi (sonra 1700). Detay: docs/butce/KART-KATALOGU.md. 2026-06-20 DOSYA DUZENI KARARI: butce domain docs/butce/'a toplandi (MIMARISI -> KART-KATALOGU, GEREKCELER -> KART-GEREKCELERI), CLAUDE.md routing eklendi; sema/teknik (B-serisi, kopru, KDV, percent) TASARIM + SCHEMA'da kaldi.
- KRITIK ACIK: butce UI/servis yok (Dilim 2b+); uyari/anomali motoru yok (kural var, kod yok). cost_object capraz-butce davranis-testi: gercek veriyle dogrulandi — REDDEDILDI (composite-FK calisiyor, 2026-06-21). TECH-DEBT Acik Borc 5/5 SINIRDA — yeni borc oncesi kapatma.

## Butce — KILITLI kararlar (ozet; detay docs/butce/BUTCE-SEMA-KARARLARI.md)
- GIRIS YAPISI (06-13): kart=departman; faz=donemin kaba hali (varsayilan 3, inceltilebilir); giris=sakin liste + "ne zaman" her satirda + cogul donem dokun-isaretle; tam gorunum=nakit matrisi (2. yuzey). 6 arayuz ilkesi + 5 veri kurali + yuvarlama sozlesmesi.
- GOC CANLI (06-14, e63fbb0): expense_groups.stage_id dustu + department_id NOT NULL; budget_stages start/end_date nullable; budget_items.quantity -> budget_item_periods koprusu (kalem<->donem, unique(item_id,stage_id), miktar koprude, satir toplami turetilir). "En az bir donem" + "donem tarihli" zorlamalari MUHURDE.
- SEMA B-serisi (B1-B19): hesaplanan deger saklanmaz (B18) · negatif kapidan giremez (B3 CHECK) · degisiklik izi kapida (B19 trigger) · kasa/raf koy-ve-bak (B16/B17) · kalici kalem kodu (item_code) kimlik · dis format kodu (external_code, Bakanlik/AICP) ayri alan · dizi=scope(single/season/episode)+episode_no · RLS her seviyede yalniz muhasebe · yuk=item_burdens+packages (stopaj/SGK/ajans/damga, Turk-yerli) · KDV su an yalniz belge tarafinda.
- PAKETLEME: Model A — butce+harcama tek kod, paketlenebilir iki yuzey; tek temas receipts.budget_item_id.
- cost_object (4. EKSEN, 2026-06-20): MMB Set/Saturation Tag; kategori-seviyesi; satir-basina TEK (Faz 1); kontrollu liste (budget_cost_objects, btce-bazli); kutuphaneden oto-etiket (icsel-cross-cut kalem); gerceklesen receipts'ten miras; dusuk-bahis (unutulsa kart toplami dogru kalir); sahne-instance + breakdown KAPSAM-DISI. Sema PARK -> DDL ayri dilim. Detay: KART-KATALOGU §4.10.

## Butce — SABLON FORMAT + KDV (06-15, KILITLI; detay docs/butce/BUTCE-SEMA-KARARLARI.md)
- body SEKLI: TEK sekil tum tur/scope; dizi=iki sablon satiri (season+episode, sema zaten boyle). Tablolari aynalar: stages[] + cards[] (department_code/name/icon/default_unit/default_package) + her kartta items[] (name/detail/unit?/package?/multiplier) + percent_lines[] (contingency/profit varsayilan). B16 kasa ile ayni serilestirici.
- KOPRU ACILISTA BOS (Model A): sablon kalemi doneme baglamaz; "ne zaman"i kullanici dokun-isaretle ile kurar. unit_net acilista 0; periods bos. (Model B onceden-baglama REDDEDILDI.)
- PAKET-KODU + GUNUN ORANI: sablon yalniz paket kodu tutar; acilista item_burdens'e gunun rate_catalog orani kopyalanir.
- budget_percent_lines DEGISMEZ: contingency+profit duz. "Secilebilir-tabanli markup" GEREKSIZ (geri alindi).
- KDV AYRISTIRMA (Genis yol): budget_items'a vat_rate eklenecek (sema eki, uygulama dilimi). body'ye default_vat (kart) + opsiyonel vat (kalem). Kullanici NET veya BRUT girer; CFE turetir; B18 kirilmaz. KDV ile yuk AYRI eksen.

## Siradaki is
Tamamlandi: kart mimari (1100-1600) + cost_object semasi + vat_rate + fn_open_budget (uctan-uca test gecti, 2026-06-21).
Aktif: Dilim 2b — TEK kartin calisan giris UI'i.
Tam sira / dilimler / backlog: docs/IS-SIRASI.md (tek kaynak).
RPC kalibi: fn_create_project (SECURITY DEFINER, atomik, Turkce hata, REVOKE/GRANT), canli dogrulanir.

## Acik (kararlasmadi)
- department_code -> department_id cozumu: COZULDU — departments.code kanonik anahtar (20260620140000), fn_open_budget bul-veya-olustur (ON CONFLICT race-safe).
- "Donemsiz" kovasi muhur muafiyeti: KOLON CANLI — budget_stages.is_undated (20260620140000); muhur MANTIGI fn_lock_budget diliminde (acik).
- Model 1 (hesabi KAAPA acar) · Avans->butce cift sayim (B10) · Gorunen rol etiketi · Tedarikci hafizasi + Arastir Dilim 2 (BIRLIKTE).
- "Modul acik mi" bayragi + faturalama/paket fiyat: sirasi gelince.
- cost_object: kalem-alti tipleme (arac cinsi dropdown) AYRI ozellik -> kutuphane-tasarim fazinda; cogul cost_object/satir (Faz 1 tek).
- RAPORLAR fazi: icmal PDF · Bakanlik formu birebir esleme · AICP/uluslararasi export · amort/bolum-basi pay raporu · EFC · cost_object cross-kart rollup raporu.
- KAPI ACIK (sema oldurmez, Faz 1 yapmaz): taahhut · mesai · doviz (CFE) · satir yorumu · breakdown modulu (cost_object'i oto-besler).

## Tur sablon arastirmasi (06-15, referans — icerik seed icin)
- REKLAM: AICP Bid Form = 11 kart; gun-tipleri Build/Pre-Light/Shoot/Strike; yapi+kalem+yuk aliriz, bidding kapsam disi.
- FILM: Movie Magic referans. 4 kova (ATL/BTL/Post/Diger) + ~30 kart; Topsheet->Kategori->Hesap->Detay = bizde kova-etiketi->kart->kalem; fringe=Turk yuk makinesi (item_burdens). Cross-cut: MMB Sets = bizde cost_object.
- DIZI: yeni model YOK — scope+episode_no ile cozulu; kalemler film ile ortusur.
- ORTAK FILTRE: yapi gecer, ABD rakami/sendika gecmez (Turk yapimi; yuk=SGK/stopaj, completion bond yok).

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli) — muhasebe CALISMA ortami (ev/nav); minimal onboarding'a UYGULANMAZ. Daralabilir sol ray + ust baglam cubugu + orta masa + sag referans yuvasi. (Calisan UI = bunun islevsel hali; gorsel tasarim/komp degil.)
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, butce-havuzu uyarisindan AYRI.
- Butce her seviyede YALNIZ muhasebe gorur+yazar. Butce icin ayrica gorsel tasarim turu.
- Yama yok: cikar-degistir.

## Bu commit'te dokumana islenenler
- KART-KATALOGU: §7.5 OYUNCU (1600 kilitli kart) + §4.10 cost_object (4. eksen) eklendi; §8 PARK stunt satiri guncellendi + cost_object sema PARK eklendi.
- KART-GEREKCELERI: KART 1600 "neden" bolumu + cost_object genel egitim notu eklendi.
- IS-SIRASI: cost_object sema dilimi + butce runtime dikey-dilimi (kart-yuruyusunden oncelikli) + kutuphane katalog-kodu + breakdown=gelecek eklendi.

## Butce Sablon Arastirmasi (devam ediyor)
- Durum + acik kararlar: docs/butce/BUTCE-ARASTIRMA-DURUM.md
- Master kalem listesi (4746 tekil; "Oyuncu-Kast" 197 kalem 1600 icin kullanildi).
- Kilitli yon: iki-katman (sablon yalin / kutuphane+autocomplete), 2 para-seviyesi derinlik, kart=departman=onay birimi. Kutuphane RESMILESTIRME + KATALOG-KODU isi acik (cost_object oto-etiketi ve kesin kalem kodlari ona bagli). KABUL bekleyen detaylar dokumanda.
