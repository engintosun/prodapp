# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. 2026-06-13: Butce modulu sema kararlari (B16-B19) + 5-katman kilidi + Dilim 1 (DB temeli) canlida (b89d67e). CFE dilim 1 + sinav duzenegi canlida (0b344e1, 8/8 yesil). Lint hijyeni yesile dondu (33cd25e). Butce GIRIS YAPISI karari kilitlendi: kart=departman, faz=donemin kaba hali, nakit matrisi, alti arayuz ilkesi, bes veri kurali, yuvarlama sozlesmesi (TASARIM-KARARLARI.md). 2026-06-14: Butce GOCU canliya alindi (e63fbb0) — kart=departman, budget_stages=donem (tarihli), budget_item_periods koprusu. Sirada: sablon body format karari -> Engin sablon icerigi -> Dilim 2b RPC'leri.

## Durum
- HEAD: e63fbb0 — Butce goc (kart=departman + donem tarih + kalem-donem koprusu), supabase db push ile canliya alindi, migration list Local=Remote dogrulandi. Canli: prodapp-navy.vercel.app · Repo: github.com/engintosun/prodapp
- KURULU/CALISIYOR: auth + cok-proje login · saha fis girisi · yonlendirme trigger · duzeltme mekanigi · davet/rol (canli) · reviewer onay/red · proje olusturma + proje butce tablolari + servisler · onboarding UI (2026-06-10 canli test gecti) · BUTCE MODULU DB TEMELI (2026-06-13: budgets/stages/expense_groups/budget_items/item_burdens/percent_lines/direct_payments/baselines/templates/change_log + units/burden_components/rate_catalog/burden_packages; receipts'e budget_item_id kolonu; tip kolonu projects'e) · BUTCE GOCU CANLI (2026-06-14): kart=departman, budget_stages=donem (tarihli), budget_items.quantity -> budget_item_periods koprusu (RLS muhasebe-only + iz/updated_at tetikleyicileri). Detay TASARIM-KARARLARI.md. · CFE DILIM 1 (saf hesap fonksiyonlari: brutBirim/satirToplam/kdvAyristir/zincirToplam/dokum, henuz UI/servise baglanmadi).
- KRITIK ACIK: butce/harcama uyari motoru ve anomali motoru yok (kurallar dosyada, kod yok). Butce UI/servis henuz yok (Dilim 2b+). TECH-DEBT: Acik Borc 5/5 (TD-5/8/9/10/11) — SINIRDA; yeni borc eklenmeden once kapatma gerekir. TD-10 card-desk ev/nav isinde (sira #2) kapanacak.

## Butce modulu — giris yapisi karari (kilitlendi 2026-06-13)
Kart = departman; faz = donemin kaba hali (varsayilan 3, inceltilebilir); giris = sakin liste + "ne zaman" her satirda + cogul donem dokun-isaretle (ayri buton yok) + uyarlanir dokum; tam gorunum = nakit matrisi (2. yuzey). Alti arayuz ilkesi + bes veri kurali + yuvarlama sozlesmesi yazildi. Detay: TASARIM-KARARLARI.md "Butce modulu - yapi karari".

## Butce modulu — goc canliya alindi (2026-06-14, e63fbb0)
Kart=departman + budget_stages=donem (start/end_date nullable) + budget_items.quantity -> budget_item_periods koprusu (kalem<->donem, ait-donem ekseni; RLS muhasebe-only + iz/updated_at tetikleyicileri). "Donem tarihli olmali" ve "en az bir donem" zorlamalari MUHURDE (fn_lock_budget), iskelette degil. Detay: TASARIM-KARARLARI.md "Butce gocu uygulandi + kopru kararlari".

## Butce modulu — DB temeli yazildi (Dilim 1, b89d67e)
Sema B-serisi (B1-B19, asagida) + 5-katman kilidine gore kuruldu. Onemli sema kurallari:
- HESAPLANAN DEGER SAKLANMAZ (B18): DB'de yalniz girilen sayilar (net/miktar/adet/oran kopyalari) ve belge sayilari (fis ve direct_payments brut+KDV+net ucu) durur. Brut birim, satir toplami, grup/etap/maliyet/genel toplam DB'de YOK — her bakista CFE hesaplar. Saklanan tek istisna: kasa fotografina gomulu donmus toplamlar.
- NEGATIF DEGER KAPIDAN GIREMEZ (B3 ENGEL = DB CHECK), tetikleyiciyle degil.
- DEGISIKLIK IZI KAPIDA (B19): budget_change_log + 9 tabloya takili after-update/delete tetikleyici (security definer). Iz tutar, HESAP YAPMAZ. receipts.budget_item_id degisimi de loglanir. Insan parafina bagli degil; izsiz degisiklik imkansiz.
- KASA (B16) + RAF (B17): koy-ve-bak — UPDATE/DELETE RLS politikasi YOK; dokunulmazlik DB seviyesinde.
- KALICI KALEM KODU: budgets.item_code_seq sayaci, butce ici artan (#0001), geri kullanilmaz; kalem konum degistirse de kod sabit (kimlik). Bakanlik/AICP kod eslemesi AYRI alan (budget_items.external_code, B14).
- DIZI AYRIMI: her butce satiri scope tasir (single/season/episode + episode_no). Icmal saklanmaz, bakista toplanir.
- GERCEKLESNI OLAN KALEM SILINMEZ: is_active=false pasiflesir; FK RESTRICT korur (B16 yan kural).
- RLS: tum butce tablolari yalniz muhasebe (role='muhasebe' + membership_status='active'), kendi projesinde. Raflar (units/components/rate_catalog/packages) herkes okur, Faz 1'de yazma politikasi YOK (elle beslenir). receipts.budget_item_id'yi ekran dogrudan yazamaz — esleme RPC'siyle Dilim 5'te baglanir.
- SEED: birimler (gun/hafta/ay/bolum/adet/sabit) · yuk bilesenleri (stopaj/SGK/ajans/damga) · oran katalogu TASLAK isaretli (mevzuat dogrulamasi yasal turde) · paketler (Bordrolu, Ajansli cast).
- Sonnet ekleri (kabul): check_function_bodies=off (henuz olmayan tabloya referans veren fonksiyon dogrulamasini erteler, semantik ayni) · GRANT blogu (CLAUDE.md kurali, ben atlamistim) · RLS dosya yolu supabase/SUPABASE-RLS.sql (docs/ degil).

## Butce modulu — KILITLI kavram kararlari (B-serisi)
ILKELER (2026-06-12, TASARIM-KARARLARI §8): 10 dakika kurali · kart=tek konu · gorunur hesap dokunulmaz formul · uc alan kurali · klavye akisi · kayit dugmesi yok · sablon bos kalem 0'da durur · degisiklik izi + orijinal kilidi · mobil ayrimi · uyari 3 seviye · tamamlilik ilkesi · gorsel tasarim ayri turda.
- B1-B15: 2026-06-12'de kilitlendi (kavram). Tam metin git log c6a0504 -> ec0bcf6 commit'inde; ozet TASARIM §8 + EKRAN-MUHASEBE §19 + GLOSSARY.
- B16 ORIJINAL KILIDI: budget_baselines — kilit aninda butcenin tam fotografi (yapi + oran kopyalari + CFE donmus toplamlar) tek jsonb satira; koy-ve-bak. Orijinal gorunum bu JSON'dan cizilir, canli tabloya dokunmaz. version=1 Faz 1; yeniden-kilit kapisi acik.
- B17 SABLONLAR: budget_templates — rakamsiz iskelet (etap/kart/kalem adlari + birim/paket secimleri), B16 ile ayni serilestirici, tek raf (system + company etiketli), koy-ve-bak. Kurulumda iskelet acilir, kalemler 0/soluk, kodlar o an basilir, oranlar GUNUN katalogundan kopyalanir; fotokopi tek yonlu (sablon degisince kurulu butce kipirdamaz). Faz 1: 4 tip iskeleti elle yuklenir; "sirket sablonu kaydet" sonra (raf hazir). "Onceki projeden kopyala" = ayni makine, tek soru (bos/rakamli); rakamli kopyada oranlar yine gunden tazelenir.
- B18 HESAPLANAN DEGER YERI: saklanmaz; CFE dilim 1 saf fonksiyonlari hesaplar (brutBirim, satirToplam, kdvAyristir, zincirToplam B12, dokum). Ekran rakami ile ⓘ dokumu ayni fonksiyonun iki ciktisi. SQL yalniz toplama (gerceklesen/havuz = net SUM, view). Formul SQL'e girmez.
- B19 DEGISIKLIK IZI: tek tutanak defteri budget_change_log; kapidaki tetikleyiciler doldurur (ekran kodu degil). Tek bicim, tum yazilabilir butce tablolari + fis eslesmesi. Okuma muhasebe; duzeltme/silme yok.

## Paketleme karari (2026-06-13) — KILITLI: Model A
Butce ile harcama TEK kod tabaninda, paketlenebilir IKI yuzey: musteri yalniz harcama, ya da harcama+butce alir. AYNI yapim sirketi her iki yuzeyi kullanir (ayri urun/ayri musteri DEGIL — Model B reddedildi). Tek temas: receipts.budget_item_id (NULL ise harcama butceden bagimsiz). Ileride "modul acik mi" bayragi proje duzeyinde tek alan; bugunku mimariyi degistirmez, maliyet ~sifir. Butcenin gucu ongorulen-vs-gerceklesen baginda; bu yuzden butce harcamadan koparilmaz. Faturalama/paket fiyat AYRI konu (Model 1/2 komsusu), semaya bugun yuk bindirmez.

## Siradaki is (5-katman dilimleme)
1. ✅ DB temeli (b89d67e).
2. ✅ CFE dilim 1 (brutBirim/satirToplam/kdvAyristir/zincirToplam/dokum) + SINAV DUZENEGI — 0b344e1, 8/8 yesil.
   ✅ stage_id/ait-donem gocu canliya alindi (e63fbb0, 2026-06-14): kart=departman + budget_stages=donem (tarihli) + budget_item_periods koprusu.
   ⬜ Dilim 2b — servis RPC'leri. fn_open_budget ONCE iki seye bagli: (a) sablon body jsonb FORMAT karari (yeni model: kart=departman + kopru) (b) Engin'in film-sablon icerigi (ayri seed). Sira: (a) format karari -> (b) Engin sablon icerigi -> (c) fn_open_budget + ongorulen okuma -> (d) fn_lock_budget (muhur kapilari: en az bir donem + donem tarihli burada zorlanir) -> (e) fn_match_receipt.
   — Arada kod-disi tur: gorsel tasarim turu (UI'den ONCE).
3. ⬜ Giris yuzeyi: kart masasi + kalem tablosu (EKRAN-MUHASEBE §19). Kuruluma tip secimi eki (B8); eski projelere butce ilk acilista sorar. Acik tasarim notlari: "hizli ekle" modu + "ne zaman" dokunulabilirligi (TASARIM-KARARLARI E).
4. ⬜ Okuma yuzeyi: icmal + gerceklesen listesi + tanimlar.
5. ⬜ Eslesme + dogrudan odeme: onay ekranina kalem onerisi + eslesmemis havuz + odeme girisi + "onceki projeden kopyala".
Sonra: Dept/Muhasebe ev + navigasyon (card-desk, TD-10 burada kapanir). Tam liste: docs/IS-SIRASI.md.

## Acik (kararlasmadi)
- Davet zinciri gozden gecirilecek (TD-9 ASCII metinleri o turda).
- Model 1 (hesabi KAAPA acar) · Avans->butce cift sayim (B10 mekanigi) · Gorunen rol etiketi · Tedarikci hafizasi + Arastir Dilim 2 (BIRLIKTE ele alinacak).
- "Modul acik mi" bayragi (paketleme A kuyrugu) + faturalama/paket fiyat: sirasi geldiginde.
- Tahmini final: dunya standardi EFC = gerceklesen + taahhut + kalan tahmin; rapor fazinda, "aciklanabilir > tahmin" ilkesiyle.
- RAPORLAR fazina notlar: kanala/yapimciya icmal PDF · Bakanlik formu birebir esleme (guncel form o gun indirilip dogrulanacak) · AICP/uluslararasi export · amort/cross-boarding bolum-basi pay raporu.
- KAPI ACIK (sema oldurmez, Faz 1 yapmaz): taahhut (commit kaydi) · mesai hesabi · doviz (CFE ile) · satir yorumu (mesajlasma ile).

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli) — muhasebe CALISMA ortaminin (ev/nav) tasarimi; minimal onboarding/kurulum akisina UYGULANMAZ. Uc katman: daralabilir sol ray (modul nav) + ust baglam cubugu + orta masa yuzeyi. Sol ray = secili TEK proje + modul listesi. Badge = gorulmemis birikim (modul-bazli seen-tracking). Masa: birincil kart (tam genislik) + daralabilir sag referans yuvasi (~%30-35, varsayilan kapali). Mobil: tek responsive PWA; her ekran mobil-yetenek etiketi.
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, butce-havuzu uyarisindan AYRI (IS-KURALLARI §7/§13).
- Butce her seviyede YALNIZ muhasebe gorur + yazar.
- Gorsel estetik her ekranda commit oncesi G6'da; butce modulu icin ayrica gorsel tasarim turu sozu var.
- Yama yok (CLAUDE.md): cikar-degistir.

## Durable doc'lara tasinanlar (bu commit)
- TASARIM-KARARLARI: "Butce gocu uygulandi + kopru kararlari (2026-06-14)" bolumu eklendi.
- GLOSSARY: kalem-donem koprusu (budget_item_periods) terimi eklendi.
- TECH-DEBT: schema.sql bayat notu guncellendi (goc sonrasi yapi da migration'da: 20260614150000).
- kaapa-devir-2026-06-14.md (yeni devir dosyasi).
Kalan tasima: yok.
