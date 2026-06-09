# KAAPA — CURRENT.md

Yalnizca SIMDIKI durumu tutar. Her oturum kapanisinda bastan YAZILIR. Tarihce -> git log.

## Milestone
M2 — Cekirdek Dongu. Muhasebe onboarding altyapisi (sema + trigger + servis) tamamlandi; UI siradaki.

## Durum
- origin/main HEAD: `b7dc4c5`. Repo + canli senkron.
- Canli: prodapp-navy.vercel.app · Repo: github.com/engintosun/prodapp
- Davet zinciri CALISIYOR (saha2 test). Reviewer onay/red TAMAMLANDI.
- Onboarding altyapisi UYGULANDI:
  - Sema: period_budgets UNIQUE(period_id), dept_budgets UNIQUE(period_id,dept_id) + updated_at, periods UNIQUE(project_id,period_number).
  - Trigger: fn_assign_period_number (DB-otoriter period_number, BEFORE INSERT).
  - Servis: src/shared/supabase/onboarding-service.ts (createDepartment, openPeriod, setPeriodBudget upsert, setDeptBudget upsert).

## Siradaki
1. Muhasebe onboarding UI (departman + donem + minimal butce limit + ekip davet) — card-desk iskeletine oturtulur; mobil-yetenek etiketleri ekran basi belirlenir; badge seen-tracking onboarding ekranlarina uygulanmaz (ev/nav isidir).
2. Dept/Muhasebe ev + navigasyon (mevcut reviewer onay/red normal akista erisilebilir hale gelir).
3. C5 Donem ekrani (kapama + grace).
Tam liste: IS-SIRASI.md.

## Acik kararlar / borclar
- Hata maskeleme: accept-invitation + signup genel mesaj -> gercek hatayi goster.
- dynamic-action yanlis fonksiyonu Supabase'de — silinebilir.
- G6 gorsel · §6 kategori limit degerleri (Engin'den).

### Onaylanan kararlar (2026-06-06 tasarim oturumu)
- **Setup-first + dikey ince dilim:** Reviewer onay/red yapildi ama kurulum yolu olmadigi icin normal akista erisilemez; once onboarding catisi + Dept/Muhasebe ev/nav ile mevcut parcalar uctan uca kullanilabilir hale getirilir, sonra disa acilir.
- **Minimal butce-limit yolu:** Tam butce modulu Faz 2. Faz 1'de limit tablolarina (period_budgets, dept_budgets) deger girecek minimal yol donem/muhasebe isine katlanir; yoksa pilotta canli butce kontrolu bos kalir.
- **Gorsel tasarim zamanlamas:** Estetik katman (renk, tipografi, ikon, marka) her ekranda commit oncesi G6'da ele alinir, ertelenmis kalir. Tek yapsal istisna: muhasebe card-desk layout'u (asagida kilitli).
- **CARD-DESK LAYOUT (kilitli):**
  - Iskelet: uc katman — daralabilir sol ray (modul navigasyonu) + ust baglam cubugu + orta "masa yuzeyi".
  - Sol ray: girisde secilen TEK projenin adini tasir (proje bastan secilir, muhasebeci yalnizca o projenin icerigini gorur). "Calisma Dosyalari" ibaresi ve "+" yok. Ray modul listesidir, proje listesi degil. Daralabilir (ikon-only <-> ikon+metin); kirilma noktalari G6'da.
  - Badge semantigi: badge = yeni/gorulmemis birikim (toplam degil) — gorulmemis fis, yeni avans talebi, okunmamis mesaj, yeni/yaklasan kiralama. DATA implikasyonu: her modulde kullanici-bazli goruldu/gorulmedi izi gerekir (item'da seen flag ya da kullanici x modul son-bakis dampas); ilgili modulun 5-katman tasariminda semaya konur, atlanirsa planlanmamis is.
  - Masa yuzeyi (D-2): tek birincil kart (tam genislik, varsayilan) + daralabilir sag referans yuvasi (~%30-35). Karsilastirma asimetriktir: aktif is genis yuzey ister (birincil), referans dardir (sag yuva). Referans varsayilan kapali. Serbest yuzen / N-esit bolunmus pencere YOK (Faz 2 luksu, Faz 1'de tuzak).
  - Mobil (D-3): tek responsive PWA; ayri mobil surum YOK (iki kod tabani = KVKK yuzeyi iki kati = kaos kalibi). Responsive uyarlama zaten yapilir (ray collapse, referans tam-ekran katman, coklu kolon -> tek kolon). Her muhasebe ekrani bir mobil-yetenek seviyesi tasir: mobil-tam / mobil-salt-okunur / masaustu-onerilir. Seviye, ekranin 5-katman tasariminda belirlenir.

### Onaylanan kararlar (2026-06-09 onboarding 5-katman)
- **SEMA:** Yeni tablo yok; 5 yuzey mevcut (departments/periods/invitations/period_budgets/dept_budgets). Sema sirayi zorluyor (profiles.chk_role_dept_id -> dept'siz davet yok). Butce grain DDL'de sabit: period_budgets=donem toplami, dept_budgets=dept x donem (kategori degil; §6 ayri). Delta A (butce UNIQUE'leri + dept_budgets.updated_at) + Delta B (periods UNIQUE project_id,period_number) uygulandi. Butce giris noktasi "donem ac" adimi (dept_budgets.period_id NOT NULL). departments.created_by SIRA #9'a ertelendi; gerceke: bu ozelligin dogrulugu icin gerekli degil + denetci/yapimci rolu zaten ertelendigi icin simdi eklemek scope creep.
- **RLS:** Mevcut policy'ler yeterli, degisiklik yok. Upsert uyumu dogrulandi (ON CONFLICT DO UPDATE hem INSERT WITH CHECK hem UPDATE USING'i geciyor; conflict anahtari degismez, ikisi de period-proje-ici + muhasebe'ye bakar). dept_budgets cross-project sikilastirmasi ertelendi (dusuk etki + UI proje-ici dept sunar).
- **TRIGGER/SERVIS:** Donem acma = direct INSERT + yeni trigger fn_assign_period_number (period_number=max+1, DB-otoriter); RPC yok; created_by servis auth.uid(). Chief isi yok — profiles + fn_route_receipt zaten yonlendiriyor (chief sorusu profiles dept-rol varligi uzerinden cevaplaniyor, departments.chief_id okunmuyor); chief_id kullanilmiyor -> TECH-DEBT. Yazma servisleri direct Supabase/RLS; butce = upsert.
