# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. 2026-06-10 (ucuncu tur): onboarding UI insa edildi — proje ac girisi + kurulum akisi (departman -> donem -> butce -> davet) + eksik butce grantlari. Sirada: muhasebe ev/nav (card-desk).

## Durum
- HEAD (oturum baslangici): `3ca8da6`. Canli: prodapp-navy.vercel.app · Repo: github.com/engintosun/prodapp
- KURULU/CALISIYOR: auth + cok-proje login · saha fis girisi · yonlendirme trigger (fn_route_receipt) · duzeltme mekanigi · davet/rol (canli) · reviewer onay/red (fn_review_receipt) · proje olusturma (fn_create_project) + proje butce tablolari + servisler · YENI: onboarding UI — proje secim ekraninda "Yeni proje ac" (can_create_projects isaretli hesaba; tek-uyelik otomatik atlamasi isaretli hesapta kapali) + kurulum akisi + project_budgets/project_dept_budgets authenticated INSERT/UPDATE granti.
- TEST GECTI (2026-06-10): onboarding uctan-uca canli test edildi — proje ac -> 7 departman -> donem -> butce -> davet linki uretildi -> kabuk; yarida birakip tekrar giriste kurulum acilmadi, dogrudan kabuga dustu (KARAR 2 dogrulandi). BOOTSTRAP-MUSTERI.sql prosedurusi de calisti. · KRITIK ACIK kalan: butce/harcama uyari motoru ve anomali motoru yok (kurallar dosyada, kod yok). · TECH-DEBT iki kovaya ayrildi (KARAR 13): Acik Borc 4/5 (TD-5/8/9/10), Karar Bekleyen 4 (TD-2/3/6/7, butceye sayilmaz).

## Bu oturumda KILITLENEN kararlar (2026-06-10, ucuncu tur)
- AKIS: tek cizgi kurulum departman -> donem -> butce -> davet; departman + donem en az 1 zorunlu, butce + davet atlanabilir ("Simdilik gec").
- DEVAM: yarida kalirsa sonraki giriste eksik ilk zorunlu adimdan; ilerleme kaydi YOK, eksik mevcut veriden okunur (departman var mi / acik donem var mi). Butce/davet giriste dayatilmaz.
- VARIS: kurulum bitince ayri ozet/karsilama ekrani yok, dogrudan muhasebe kabugu; proje acilir acilmaz projeye giris (set-claims) yapilir, kurulum proje icinde kosar.
- GIRIS NOKTASI: "Yeni proje ac" proje secim ekraninda, isaretli hesaba her zaman gorunur (uyeliksiz dogrudan; uyelikli listenin altinda). Isaretsiz + uyeliksiz: "Henuz bir projeye davet edilmediniz" + cikis yolu.
- EKRANLAR: departman = ekle (aninda kayit) + listeden ad duzeltme (silme yok, en az 1 ile devam) · donem = ad (oneri "Donem 1"), numarayi sunucu verir, teslim tarihleri sorulmaz, tek donem · butce = proje toplami (TL sabit, para birimi secici yok) + departman paylari hepsi istege bagli, "Dagitilmamis" satiri yalniz bilgi (engel/uyari yok) · davet = mevcut davet ekrani aynen + "Kurulumu bitir".
- GORUNUM: kurulumda alt gezinme gizli; sade baslik + 4 adimli gosterge. G6 gorsel kurali gecerli (kozmetik yok).
- GRANT: project_budgets + project_dept_budgets authenticated INSERT/UPDATE eksikti (policy vardi, grant yoktu) -> kapatildi. Kural hatirlatma: yeni tablo = GRANT + RLS policy.

## Acik (kararlasmadi — tartisilacak)
- Davet zinciri gozden gecirilecek (Engin notu, 2026-06-10).
- Zengin butce modulu (ertelendi) — kapsam notlari (2026-06-10): hazirlik/produksiyon/post yapisi · ayrintili maliyet kalemleri · KDV/stopaj hesaplari (CFE ile BIRLIKTE tasarlanir) · ongorulen-gerceklesen karsilastirma ekrani · gerceklesenin IKI kaynagi: fisler + muhasebenin dogrudan kaydettigi odemeler (belgeli/belgesiz — ikincisi sistemde kavram olarak YOK, modul oturumunda karara baglanacak) · %80/%100 esik uyarisi. Referans: Saturation.
- Model 1 (hesabi KAAPA acar) yeniden tartisilacak; mekanik bagimsiz.
- Avans -> butce (cift sayim): yon sabit — harcama tuketir, avans ayri acik bakiye; mekanik tartisilacak.
- Tahmini final yontemi (muhasebe-elle mi otomatik mi; "aciklanabilir > tahmin").
- Gorunen rol etiketi (muhasebeci adi dahil) — sonra.
- Tedarikci hafizasi — DUSUNULECEK.

## Siradaki is
1. Dept/Muhasebe ev + navigasyon (reviewer normal akista erisilebilir) — card-desk layout burada.
2. C5 Donem ekrani (kapama + grace + teslim tarihleri girisi — onboarding tarih sormuyor).
3. Tam liste: docs/IS-SIRASI.md.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli) — muhasebe CALISMA ortaminin (ev/nav, #1) tasarimi; minimal onboarding/kurulum akisina UYGULANMAZ:
  - Uc katman: daralabilir sol ray (modul nav) + ust baglam cubugu + orta masa yuzeyi.
  - Sol ray = secili TEK proje adi + modul listesi (proje listesi degil); daralabilir.
  - Badge = gorulmemis birikim; modul-bazli kullanici seen-tracking gerekir.
  - Masa yuzeyi (D-2): birincil kart (tam genislik) + daralabilir sag referans yuvasi (~%30-35, varsayilan kapali); serbest/N-esit pencere yok.
  - Mobil (D-3): tek responsive PWA; her ekran mobil-yetenek etiketi tasir (mobil-tam / salt-okunur / masaustu-onerilir).
- Butce iskelet kurali: ust yapi (proje toplami + departman paylari) sabit; kategori/satir/import sonradan ALTINA eklenir, ust degismez.
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, butce-havuzu uyarisindan AYRI (IS-KURALLARI §7/§13).
- Butce her seviyede YALNIZ muhasebe gorur + yazar; sef avans defteri, saha kendi avansi.
- Gorsel estetik her ekranda commit oncesi G6'da; ertelenmis. Tek yapisal istisna: card-desk.
- Yama yok (CLAUDE.md): yanlis kodun ustune ekleme yok; cikar-degistir.

## Superseded (gecersiz)
- "Onboarding UI yok / proje acma dugmesiz" tespiti: bu commit ile giderildi.

## Durable doc'lara tasinanlar (bu commit)
- AUTH-KARARLARI SK-AUTH-2 yeniden yazildi (4 adim + zorunlu/atlanabilir + devam kurali).
- EKRAN-MUHASEBE §18 kilitli kurulum akisiyla dolduruldu.
- IS-SIRASI #1 kapatildi, liste yeniden numaralandi.
Kalan tasima: yok.
