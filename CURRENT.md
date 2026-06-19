# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Butce: kavram + sema + DB temeli + goc CANLI; CFE dilim 1 canli (8/8). 2026-06-15: sablon body jsonb FORMAT + KDV ayristirma (Genis yol) KILITLENDI. 2026-06-19 (oturum 1): KART 1100 ve 1300 KILITLENDI; etap/kart/kalem motoru/coklu-calisma yetki kilitlendi. 2026-06-19 (oturum 2): KART 1400 (Yapimci Birimi) ve 1500 (Yonetmen) KILITLENDI; odeme-statusu boyutu (loan-out/fringe), genel anomali kurallari (cift-fringe/crew-overlap/mahsup/milestone), kart gorunurluk katmanlari (DB tam erisim != UI maske; tam/kismi maske; ATL bas-kase gizli deseni; Master/Owner katmani), Compliance Guard (sablon-baglamli denetim; tehsis+uyari, gizleme recetesi degil) KILITLENDI. Bu oturumlar kod uretmedi (mimari/karar). Detay: docs/butce/KART-KATALOGU.md. Sirada: KART 1600 (Cast) + UYGULAMA: vat_rate sema eki, fn_open_budget zinciri.

## Durum
- HEAD: 8a727e1 (doc). Repo: github.com/engintosun/prodapp · Canli: prodapp-navy.vercel.app.
- KURULU/CALISIYOR: auth + cok-proje login · saha fis girisi · yonlendirme trigger · duzeltme · davet/rol · reviewer onay/red · proje olusturma + butce tablolari + servisler · onboarding UI · BUTCE DB TEMELI (15 tablo + RLS muhasebe-only + iz/updated_at) · BUTCE GOCU CANLI (kart=departman, budget_stages=donem tarihli, budget_item_periods koprusu) · CFE DILIM 1 (saf hesap: brutBirim/satirToplam/kdvAyristir/zincirToplam/dokum; UI/servise bagli degil).
- KART MIMARISI KILITLI (2026-06-19): 5 etap ekseni, kart=departman+"kullanan sahiplenir", gelistirme=recoupable tek kart, kalem motoru (ait-kart/onay-koprusu/risk-bayragi/alias-isaret-eder + odeme-statusu/loan-out + genel anomali kurallari), kart gorunurluk katmanlari (DB tam erisim != UI maske, ATL bas-kase gizli, Master/Owner), Compliance Guard. Kilitli kartlar: 1100, 1300, 1400, 1500. Siradaki: 1600 (Cast). Detay: docs/butce/KART-KATALOGU.md. 2026-06-20 DOSYA DUZENI KARARI: butce domain docs/butce/'a toplandi (MIMARISI -> KART-KATALOGU, GEREKCELER -> KART-GEREKCELERI), CLAUDE.md routing eklendi; sema/teknik (B-serisi, kopru, KDV, percent) TASARIM + SCHEMA'da kaldi.
- KRITIK ACIK: butce UI/servis yok (Dilim 2b+); uyari/anomali motoru yok (kural var, kod yok). TECH-DEBT Acik Borc 5/5 SINIRDA — yeni borc oncesi kapatma.

## Butce — KILITLI kararlar (ozet; detay TASARIM-KARARLARI.md)
- GIRIS YAPISI (06-13): kart=departman; faz=donemin kaba hali (varsayilan 3, inceltilebilir); giris=sakin liste + "ne zaman" her satirda + cogul donem dokun-isaretle; tam gorunum=nakit matrisi (2. yuzey). 6 arayuz ilkesi + 5 veri kurali + yuvarlama sozlesmesi.
- GOC CANLI (06-14, e63fbb0): expense_groups.stage_id dustu + department_id NOT NULL; budget_stages start/end_date nullable; budget_items.quantity -> budget_item_periods koprusu (kalem<->donem, unique(item_id,stage_id), miktar koprude, satir toplami turetilir). "En az bir donem" + "donem tarihli" zorlamalari MUHURDE.
- SEMA B-serisi (B1-B19): hesaplanan deger saklanmaz (B18) · negatif kapidan giremez (B3 CHECK) · degisiklik izi kapida (B19 trigger) · kasa/raf koy-ve-bak (B16/B17) · kalici kalem kodu kimlik · dizi=scope(single/season/episode)+episode_no · RLS her seviyede yalniz muhasebe · yuk=item_burdens+packages (stopaj/SGK/ajans/damga, Turk-yerli) · KDV su an yalniz belge tarafinda.
- PAKETLEME: Model A — butce+harcama tek kod, paketlenebilir iki yuzey; tek temas receipts.budget_item_id.

## Butce — SABLON FORMAT + KDV (06-15, KILITLI; detay TASARIM-KARARLARI.md)
- body SEKLI: TEK sekil tum tur/scope; dizi=iki sablon satiri (season+episode, sema zaten boyle). Tablolari aynalar: stages[] + cards[] (department_code/name/icon/default_unit/default_package) + her kartta items[] (name/detail/unit?/package?/multiplier) + percent_lines[] (contingency/profit varsayilan). B16 kasa ile ayni serilestirici (ref'ler onun icin).
- KOPRU ACILISTA BOS (Model A): sablon kalemi doneme baglamaz; "ne zaman"i kullanici dokun-isaretle ile kurar. unit_net acilista 0; periods bos. (Model B onceden-baglama REDDEDILDI.)
- PAKET-KODU + GUNUN ORANI: sablon yalniz paket kodu tutar; acilista item_burdens'e gunun rate_catalog orani kopyalanir.
- budget_percent_lines DEGISMEZ: contingency+profit duz. "Secilebilir-tabanli markup" GEREKSIZ (geri alindi) — secilebilir-tabanli yuzde makinesi yuk icin zaten item_burdens'te. AICP markup nuansi = bidding/export, Faz 1 cekirdek degil.
- KDV AYRISTIRMA (Genis yol): budget_items'a vat_rate eklenecek (sema eki, uygulama dilimi). body'ye default_vat (kart) + opsiyonel vat (kalem). Kullanici NET veya BRUT girer; CFE kdvAyristir/brutBirim turetir; B18 kirilmaz. Kazanc: nakit matrisi BRUT-nakit; karisik oran (20/10/1/muaf) + serbest-meslek (yuk+KDV birlikte). KDV ile yuk AYRI eksen.

## Siradaki is — UYGULAMA (5-katman dilimleme)
-1. ✅ KART 1400 ve 1500 mimari kararlari: 2026-06-19 kilitlendi. Siradaki: KART 1600 (Cast) — stunt doga-bolmesi ve cocuk oyuncu compliance ile.
0. ⬜ vat_rate sema eki: budget_items.vat_rate (numeric default 20, >=0). Kucuk migration. supabase db push icin "kabul".
1. ⬜ Sablon icerik seed (body FORMAT'inda): film (Engin) + reklam (AICP 11 kart hammaddesi) + dizi (film ortusur, season+episode) + belgesel sonra. System sablonlar.
2. ⬜ fn_open_budget: raftan fotokopi (stages + cards + items[unit_net=0] + percent_lines + paket->item_burdens gunun orani + "Donemsiz" etabi + department_code->department_id cozumu); kopru bos. + ongorulen okuma (kopru + CFE -> matris).
3. ⬜ fn_lock_budget (muhur): CFE toplamlari gomulu fotograf -> budget_baselines. Kapilar: en az bir donem + donem tarihli + "Donemsiz" muafiyeti.
4. ⬜ fn_match_receipt (Dilim 5): B9 oneri + tek dokunus.
Tum RPC: fn_create_project kalibi (SECURITY DEFINER, atomik, Turkce hata, REVOKE/GRANT), canli dogrulanir. Arada gorsel tasarim turu (UI'den once). Sonra Dilim 3 (kart masasi) + Dept/Muhasebe ev+nav (card-desk, TD-10 kapanir). Tam liste: docs/IS-SIRASI.md.

## Acik (kararlasmadi)
- department_code -> department_id cozumu: fn_open_budget'ta; kanonik departman kodu/seed gerekebilir (departmanlar proje-bazli, sistem sablonu projeyi bilmez).
- "Donemsiz" kovasi muhur muafiyeti: budget_stages'e is_undated bayragi? fn_lock_budget'ta.
- Model 1 (hesabi KAAPA acar) · Avans->butce cift sayim (B10) · Gorunen rol etiketi · Tedarikci hafizasi + Arastir Dilim 2 (BIRLIKTE).
- "Modul acik mi" bayragi + faturalama/paket fiyat: sirasi gelince.
- RAPORLAR fazi: icmal PDF · Bakanlik formu birebir esleme · AICP/uluslararasi export · amort/bolum-basi pay raporu · EFC (gerceklesen+taahhut+kalan, "aciklanabilir>tahmin").
- KAPI ACIK (sema oldurmez, Faz 1 yapmaz): taahhut · mesai · doviz (CFE) · satir yorumu.

## Tur sablon arastirmasi (06-15, referans — icerik seed icin)
- REKLAM: AICP Bid Form = 11 kart (harf bolumleri); gun-tipleri Build/Pre-Light/Shoot/Strike; yapi+kalem+yuk aliriz, bidding kapsam disi. AICP asil formlari uye-girisi arkasinda; tam kalem listesi Engin yukler.
- FILM: Movie Magic referans. 4 kova (ATL/BTL/Post/Diger) + ~30 kart; hiyerarsi Topsheet->Kategori->Hesap->Detay = bizde kova-etiketi->kart->kalem; fringe=Turk yuk makinesi (item_burdens). Kanonik kart listesi hammadde; icerik Engin odevi.
- DIZI: yeni model YOK — scope+episode_no ile cozulu; kalemler film ile ortusur; amort/bolum-basi pay = RAPOR isi. Ayri "dizi arastirmasi" gereksiz.
- ORTAK FILTRE: yapi gecer, ABD rakami/sendika gecmez (Turk yapimi; yuk=SGK/stopaj, completion bond yok).

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli) — muhasebe CALISMA ortami (ev/nav); minimal onboarding'a UYGULANMAZ. Daralabilir sol ray + ust baglam cubugu + orta masa + sag referans yuvasi.
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, butce-havuzu uyarisindan AYRI.
- Butce her seviyede YALNIZ muhasebe gorur+yazar. Gorsel estetik commit oncesi G6; butce icin ayrica gorsel tasarim turu.
- Yama yok: cikar-degistir.

## Durable doc'lara tasinanlar (bu commit)
- TASARIM-KARARLARI: "Sablon body FORMAT + KDV ayristirma (2026-06-15)" bolumu eklendi.
- kaapa-devir-2026-06-15.md (yeni devir).

## Butce Sablon Arastirmasi (devam ediyor)
- Durum + acik kararlar: docs/butce/BUTCE-ARASTIRMA-DURUM.md
- Master kalem listesi (4746 tekil) Engin'de, yeni chat'te isaretlenecek (S=sablon / X=sil / bos=kutuphane).
- Kilitli yon: iki-katman (sablon yalin / kutuphane+autocomplete), 2 para-seviyesi derinlik, kart=departman=onay birimi, ekip+ekipman departmana-ozel beraber. KABUL bekleyen detaylar dokumanda.
