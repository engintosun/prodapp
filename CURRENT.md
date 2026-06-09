# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. 2026-06-10 (ikinci tur): onboarding on-kosulu insa edildi — butce->proje semasi + proje olusturma memuru (fn_create_project) + servisler. Sirada onboarding UI.

## Durum
- HEAD (oturum baslangici): `24fc285`. Canli: prodapp-navy.vercel.app · Repo: github.com/engintosun/prodapp
- KURULU/CALISIYOR: auth + cok-proje login · saha fis girisi · yonlendirme trigger (fn_route_receipt) · duzeltme mekanigi · davet/rol (canli) · reviewer onay/red (fn_review_receipt) · proje olusturma RPC (fn_create_project) + proje butce tablolari (project_budgets, project_dept_budgets) + servisler (createProject / setProjectBudget / setProjectDeptBudget) — UI YOK.
- KRITIK ACIK: onboarding UI yok (veri+servis hazir) · butce/harcama uyari motoru ve anomali motoru yok (kurallar dosyada, kod yok).

## Bu oturumda KILITLENEN kararlar (2026-06-10, ikinci tur)
- SEMA: project_budgets (proje toplami, proje basina tek satir) + project_dept_budgets (proje x departman payi). Paylarin toplami proje toplamina esit olmak ZORUNDA DEGIL — fark = dagitilmamis pay + departman-disi kalemler (reklam/PR/gosterim/ongorulmeyen); zengin modulde isimli satir olur. Donem tablolari yerinde; sahip PROJE. Iskelet kurali: kategori/satir/import sonradan ALTINA eklenir, ust degismez.
- GORUNURLUK: Butceyi her seviyede (proje toplami, departman payi, donem dilimi) YALNIZ muhasebe gorur ve yazar. Sef/saha butce gormez — anahtar/opsiyon YOK. Sefin gordugu avans defteridir (departmaninin avans toplami + varsa kendi aldiklari), saha kendi avansini gorur — ikisi kurulu, dokunulmadi. Eski donem SELECT'leri (herkes gorur / sef kendi payi) kaldirildi, muhasebe-only.
- PROJE ACMA: projects tablosuna kullanici yazma izni YOK. fn_create_project (SECURITY DEFINER memur) tek hamlede uc satir yazar: proje + company_settings (yapim sirketi) + acan kisi = o projenin muhasebecisi uyeligi; yarida kalamaz. Ekran girdileri: proje adi + yapim sirketi adi + ad-soyad. Sonrasi mevcut projeye-gir (set-claims) akisi — yeni mekanizma yok.
- YETKI ISARETI: proje acma yetkisi = hesapta can_create_projects (raw_app_meta_data), KAAPA hesap acarken koyar. Davetle gelen hesaplar acamaz. set/clear-claims isareti korur (koddan dogrulandi). Kayit modeli degisirse isareti kayit ani koyar; mekanik ayni kalir.
- BOOTSTRAP: eski elle proje+profil sablonu EMEKLI. KAAPA yalniz hesap acar + isaret koyar (yeni prosedur: supabase/BOOTSTRAP-MUSTERI.sql).
- PROJE OMRU: proje cekim bitince degil, filmle ilgili masraf bitince kapanir; kapatan muhasebecidir (mevcut status alani, elle kapama).
- Calisma kurali (CLAUDE.md'ye islendi): Opus gereksiz gordugu mekanizmayi — istek Engin'den gelse bile — kurmadan once soyler.

## Acik (kararlasmadi — tartisilacak)
- Model 1 (hesabi KAAPA acar) Engin'in aklina takiliyor — yeniden tartisilacak. Mekanik bagimsiz: kim acarsa acsin "proje + muhasebe uyeligi tek hamle" ayni.
- Avans -> butce (cift sayim): yon ayni — avans butceyi tuketmez, HARCAMA tuketir; avans ayri acik bakiye. Mekanik tartisilacak.
- Tahmini final yontemi (muhasebe-elle mi otomatik mi; "aciklanabilir > tahmin").
- Gorunen rol etiketi (muhasebeci adi dahil) — sonra.
- Zengin butce modulu + %80/%100 esik uyarisi (ertelendi).
- Tedarikci hafizasi — DUSUNULECEK.

## Siradaki is
1. Onboarding UI: proje ac -> departman -> donem -> minimal butce (toplam + departman) -> davet. Veri+servis HAZIR. Kabuk mekanigi (minimal cerceve / card-desk ayrimi) ekran tasariminda netlesir.
2. Dept/Muhasebe ev + navigasyon (reviewer normal akista erisilebilir) — card-desk layout burada.
3. C5 Donem ekrani (kapama + grace). Tam liste: docs/IS-SIRASI.md.

## Korunan onceki kararlar
- CARD-DESK LAYOUT (kilitli) — muhasebe CALISMA ortaminin (ev/nav, #2) tasarimi; minimal onboarding/kurulum akisina UYGULANMAZ:
  - Uc katman: daralabilir sol ray (modul nav) + ust baglam cubugu + orta masa yuzeyi.
  - Sol ray = secili TEK proje adi + modul listesi (proje listesi degil); daralabilir.
  - Badge = gorulmemis birikim; modul-bazli kullanici seen-tracking gerekir.
  - Masa yuzeyi (D-2): birincil kart (tam genislik) + daralabilir sag referans yuvasi (~%30-35, varsayilan kapali); serbest/N-esit pencere yok.
  - Mobil (D-3): tek responsive PWA; her ekran mobil-yetenek etiketi tasir (mobil-tam / salt-okunur / masaustu-onerilir).
- Iki deger yuzeyi esit: harcama operasyonu + butce gorunurlugu. Anomali = FIS-BAZLI, butce-havuzu uyarisindan AYRI (IS-KURALLARI §7/§13 guncellendi).
- Gorsel estetik her ekranda commit oncesi G6'da; ertelenmis. Tek yapisal istisna: card-desk.
- Yama yok (CLAUDE.md): yanlis kodun ustune ekleme yok; cikar-degistir.

## Superseded (gecersiz)
- "Proje olusturma katmani YOK / butce DONEME bagli" tespitleri: bu commit ile giderildi.
- Eski BOOTSTRAP-MUSTERI sablonu (operator projeyi elle acar): GECERSIZ.

## Durable doc'lara tasinanlar (bu commit)
- IS-KURALLARI §7 (butce->proje + gorunurluk) + §13 (anomali siniri) guncellendi.
- AUTH-KARARLARI SK-AUTH-1 yeniden yazildi (hesap KAAPA + proje muhasebeci + isaret).
Kalan tasima: yok.
