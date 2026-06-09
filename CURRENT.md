# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. 2026-06-10 oturumu: urun tanimi yeniden hizalandi; butce modeli duzeltildi (butce PROJEYE ait, doneme degil); proje olusturma katmaninin eksik oldugu tespit edildi. Siradaki kavis: butce cekirdegi (minimal) + proje olusturma.

## Durum
- HEAD (oturum baslangici): `4715b80`. Repo + canli senkron. Canli: prodapp-navy.vercel.app · Repo: github.com/engintosun/prodapp
- KURULU/CALISIYOR: auth + cok-proje login · saha fis girisi (foto->form->submitted) · yonlendirme trigger (fn_route_receipt) · duzeltme mekanigi (correction_requested) · davet/rol (canli) · reviewer onay/red (fn_review_receipt).
- KISMEN: onboarding-service.ts var (createDepartment / openPeriod / setPeriodBudget / setDeptBudget) ama UI yok, deger girisi yok.
- KRITIK ACIK (bu oturumda tespit edildi):
  - Butce yanlis yerde: kod butceyi DONEME bagli tutuyor (period_budgets, dept_budgets). Dogrusu butce PROJEYE ait -> sema isi var (proje-toplami yok).
  - Proje olusturma katmani YOK: muhasebeci kendi projesini acamiyor (eski demolarda vardi, yeniden yazimda gelmedi) -> yeni katman.
  - Butce/harcama uyari motoru ve anomali motoru yok (kurallar dosyada yazili, kod yok).

## Bu oturumda KILITLENEN kararlar (2026-06-10)
- Referans = uc kaynak birlikte: "KAAPA Nedir" tanim metni (hedef) + Engin cevaplari (kararlar) + bugunku kod (gercek). Cakisirsa kod gercegi, metin hedefi gosterir.
- Butce PROJEYE ait (master/toplam). Donemler projenin icindeki zaman dilimleri (film haftalik/aylik · dizi bolum · reklam gunluk; donem acarken secilir). Rapor gun/hafta/donem/toplam. Kod doneme bagli -> projeye cekilecek.
- Proje = bir produksiyon (or. "Istanbul Gecesi", "Kaapa Test Projesi", "Test Reklam Filmi"). Bir hesap/sirket cok proje yonetir. Muhasebeci kendi projesini acar (proje olusturma = kullanici katmani; simdi eksik; eklenecek). Proje acilinca acani o projenin muhasebecisi yapan adim gerekir (sadece kayit degil).
- Minimal butce iskeleti SIMDI, zengin modul SONRA:
  - Simdi: proje toplami + departman butceleri. "100 TL butcem var" gecerli, ayrinti zorunlu degil. Onboarding "donem ac + butce" adimina katlanir.
  - Sonra: kategori/satir kalemleri, Excel import, sapma/tahmin paneli, %80/%100 esik uyarisi.
  - MIMARI KURAL: iskelet, kategori/satir/import sonradan ALTINA eklenecek sekilde kurulur — ustu degismeden.
- Iki deger yuzeyi, esit agirlik: (1) harcama operasyonu (saha->dept->muhasebe; kurulu, tek basina degerli) + (2) butce gorunurlugu (sektore ozgu kilan; (1)'in ustune biner). Tanimdaki "deger fis/muhasebe degildir" cumlesi yumusatilacak.
- Anomali = FIS-BAZLI suistimal/mukerrer tespiti; butce-havuzu uyarisindan (%80/%100) AYRI sistem. Karistirilmaz.
- "Muhasebe" rolu = hesap/proje sahibi: proje acar + butce yapilandirir + davet duzenler + nihai finansal kontrol. Tanim bu kapsami eksik yaziyor -> duzeltilecek. Ic rol anahtari (RLS) ayni; gorunen etiket tartismasi sonraya.
- Yapimci = denetci, tek rol. Iliski yazilim disi (emir-komuta), Faz 2. Simdi aksiyon yok; tanima "Faz 2" notu.
- Saha onay zincirinde degil ama beyan/teyit verir: donem kapama beyani · "nakit aldim" · duzeltmede son soz. Tanim guncellenecek.
- Onboarding kapsami (bu milestone): proje olustur + departman + donem + minimal butce (toplam+departman) + davet.
- Tedarikci hafizasi -> DUSUNULECEK (tablo ucuz; asil maliyet isim normallestirme; cekirdegi bloklamaz).

## Acik (kararlasmadi — tartisilacak)
- Avans -> butce (cift sayim): onerilen yon — avans butceyi tuketmez, HARCAMA tuketir; avans ayri "acik bakiye" (verilen - mahsup); para bir kez (harcama) sayilir. Mekanik tartisilacak.
- Tahmini final yontemi: harcanan (var) + onay bekleyen (var, baglanacak) + kalan-tahmin. Kalan-tahmin muhasebe-elle (oneri; "aciklanabilir > otomatik tahmin"e uygun) mi, harcama hizindan otomatik mi? Engin emin degil; uygulanabilirlik konusulacak.
- Gorunen rol etiketi (sonra).

## Siradaki is
1. Onboarding (proje olustur + departman + donem + minimal butce + davet). On-kosul: butce->proje + proje olusturma katmani (sema/servis), sonra UI. Kabuk mekanigi (minimal cerceve / card-desk) ekran tasariminda.
2. Dept/Muhasebe ev + navigasyon (reviewer'i normal akista erisilebilir yapar) — card-desk layout burada.
3. C5 Donem ekrani (kapama + grace). Tam liste: docs/IS-SIRASI.md.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli) — muhasebe CALISMA ortaminin (ev/nav, #2) tasarimi; minimal onboarding/kurulum akisina UYGULANMAZ:
  - Uc katman: daralabilir sol ray (modul nav) + ust baglam cubugu + orta masa yuzeyi.
  - Sol ray = secili TEK proje adi + modul listesi (proje listesi degil); daralabilir.
  - Badge = gorulmemis birikim; modul-bazli kullanici seen-tracking gerekir.
  - Masa yuzeyi (D-2): birincil kart (tam genislik) + daralabilir sag referans yuvasi (~%30-35, varsayilan kapali); serbest/N-esit pencere yok.
  - Mobil (D-3): tek responsive PWA; her ekran mobil-yetenek etiketi tasir (mobil-tam / salt-okunur / masaustu-onerilir).
- Gorsel estetik her ekranda commit oncesi G6'da; ertelenmis. Tek yapisal istisna: card-desk.
- Yama yok (CLAUDE.md): yanlis kodun ustune ekleme yok; cikar-degistir.

## Superseded (gecersiz)
- 2026-06-09 "sema/trigger/servis tamam, yalniz UI kaldi" + "butce grain DDL'de sabit (period_budgets=donem toplami)" cercevesi: butce PROJEYE tasiniyor; proje-toplami + proje olusturma katmani eklenecek. period_budgets/dept_budgets (donem dilimi + dept x donem) kullanimda kalir ama butcenin sahibi PROJE olur. "Yeni tablo yok" artik gecerli degil.

## Durable doc'lara tasinacak (sonra)
- IS-KURALLARI §7 (butce->proje + iki yuzey) · §13 (anomali = fis-bazli, ayri) guncellemesi.
- AUTH-KARARLARI: proje olusturma muhasebeci katmani + "muhasebe" rol kapsami + yapimci/denetci Faz 2.
(Bu kararlar simdilik CURRENT.md'de otoriter; ilgili alan insa edilirken durable doc'a tasinir.)
