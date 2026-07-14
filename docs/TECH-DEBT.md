# KAAPA — Teknik Borç Takibi (TECH-DEBT)

**Son güncelleme:** 14 Temmuz 2026
**Kural:** Her borç bir milestone'a bağlı. "Bir gün düzeltiriz" yok. **Bütçe sınırı yalnız "Açık Borç" kovasını sayar** (kod/şema ile kapatılacak gerçek borç). "Karar Bekleyen" kalemler milestone'da karara bağlanacak yapısal seçimlerdir, borç sayılmaz. Açık Borç 5'i aşarsa yeni özellik durur.

-----

## Açık Borç (kod/şema kapatır — bütçeye sayılır)

|#|Ne|Nerede|Neden kabul edildi|Ödeme hedefi|Tarih|
|-|--|------|------------------|------------|-----|
|TD-5|`auth-service.signOut()` icindeki `clear-claims` invoke best-effort try/catch ile sessiz kapiyor. Hata olursa kullanici loglardan ogreniyor; UI'da gorunmez.|`src/shared/supabase/auth-service.ts`|signOut tamamen kesilmesin diye|M2|27 Mayis 2026|
|TD-8|`departments.chief_id` kullanılmıyor — `fn_route_receipt` dept şef sorusunu `profiles` tablosundaki aktif `role=dept` kaydının varlığı üzerinden yanıtlıyor; `departments.chief_id` hiç okunmuyor|`departments`|2026-06-09 onboarding 5-katman tasarımında tespit edildi; ya kolon kaldırılır ya da açık atama yoluna kavuşturulur|M3|09 Haziran 2026|
|TD-9|Onboarding davet adimindaki InviteScreen metinleri ASCII (Turkce karaktersiz): "Davet Et", "Davet Olustur", "Davet Olusturuldu", "Davet linki (7 gun gecerli)" vb. KARAR 7 geregi mevcut bilesene dokunulmadi.|`src/app/muhasebe/invite-screen.tsx`|Davet zinciri gozden gecirmesi acik listede; yazim o turda duzelir|Davet zinciri gozden gecirme|10 Haziran 2026|
|TD-10|Muhasebe kabugunda teknik terim sizintisi: bos durumda "acc_pending durumunda fis bulunmuyor" gibi gelistirici dili kullaniciya gorunuyor. Plain-dil kurali ihlali.|`src/app/muhasebe/` (bekleyen liste bos durumu)|Siradaki is muhasebe ev/nav (card-desk); o ekran elden gecerken duzelir|M2 — muhasebe ev/nav|10 Haziran 2026|
|TD-11|React efekt hijyeni: toast.tsx'te addToast useCallback/useMemo ile sabitlenmemis; bu yuzden react-hooks/set-state-in-effect uyarilari (reviewer-screen, receipt-entry-screen + bos-dizi efektli ~5 ekran). Duzeltme: addToast'i sabitle, etkilenen efekt bagimliliklarini duzelt.|`src/shared/components/toast.tsx`|Risk: CALISAN ekranlara dokunur + UI testi yok -> AYRI tur + elle dogrulama gerekir. Bu oturumda KAYIT edildi, duzeltilmedi (lint commit 33cd25e gecici override ile yesil: ^_ ignore + 'warn')|Ayri tur (React efekt hijyeni)|13 Haziran 2026|
|TD-12|Storage upload sahipligi (`owner=auth.uid()`) policy'si canli dogrulanmadi; otomatik test yok|`storage.objects` (receipts bucket)|Storage semasi public pg_dump'a girmiyor (baseline'da yok); saha yukleme calisiyor ama owner zorlamasi test edilmedi|M4 pilot oncesi|22 Haziran 2026|
|TD-13|Alt navigasyon (Masa/Donem/Rapor/Davet/Butce/Tanimlar, 6 sekme) Muhasebe ve Butce ekranlarina siziyor; tasarima gore yalniz harcama-saha yuzeyinde olmali. Kaynak (ortak layout mi sayfa-bazli mi) incelenmedi.|src/app (rota/layout tarafi, henuz tespit edilmedi)|EV/NAV masasi (IS-SIRASI backlog) kurulmadan tespit gecikti; ekran goruntusuyle 2026-07-13'te dogrulandi|EV/NAV masasi VEYA ayri kesif-turu|14 Temmuz 2026|

-----

## Karar Bekleyen (milestone'a bağlı yapısal seçim — bütçeye sayılmaz)

|#|Ne|Nerede|Neden kabul edildi|Karar hedefi|Tarih|
|-|--|------|------------------|-----------|-----|
|TD-2|Uyelik yasam dongusu alanlari (`membership_status archived_readonly` dali, `access_until`, `revoked_at`, `projects.status/closed_at/closed_by`) SEKIL olarak var; davranis (cascade, export penceresi, otomatik gecis) YOK|`profiles`, `projects`|M1 kapsam disinda|M2|27 Mayis 2026|
|TD-3|Person isaret eden FK'lar (`receipts.user_id` vb.) `auth.users(id)`'ye bakar, belirli uyelik satirina degil; uyelik baglami (`user_id+project_id`) RLS ile saglanir|`receipts`, `advances`, `exception_permits`, `approval_log`|Bilinçli sadelestirme|M2 gozden gecirme|27 Mayis 2026|
|TD-6|In-app produksiyon proje adi iki yerde tutuluyor (`projects.name` + `company_settings.project_name`); hangisi SSOT secilecek karar verilmedi|`projects`, `company_settings`|Onboarding/marka ekrani henuz yok|M3.5 marka ekrani|29 Mayis 2026|

-----

## Kapatılan Borçlar

|#|Ne|Kapatma tarihi|Nasıl kapatıldı|
|-|--|--------------|---------------|
|TD-1|`projects.is_active` kaldirildi, `status` enum tek kaynak|28 Mayis 2026|refactor(schema) commit ile|
|TD-4|clear-claims Edge Function ic hata detayini (rpcErr.message) response govdesinden cikardi; hata yolu korundu|29 Mayis 2026|fix(functions) commit ile|
|TD-7|Ekran organizasyonu rol-bazlı (`src/app/{rol}/`) standart kabul edildi; ARCHITECTURE §4.2/§5.3/§5.4 güncellendi + boş `src/features/` iskeleti silindi (feature-bazlı plan terk)|22 Haziran 2026|docs(architecture) + chore commit ile|

-----

## Bütçe Kontrolü

- Açık Borç sayısı: 7 (TD-5, TD-8, TD-9, TD-10, TD-11, TD-12, TD-13)
- Karar Bekleyen: 3 (TD-2, TD-3, TD-6) — bütçeye sayılmaz
- **DURUM: ⚠️ BÜTÇE AŞILDI (7/5) — KARAR VERİLDİ (Engin, 2026-07-15): (a) borç kapatma turu.** Tur planı CURRENT.md Sıradaki iş #1'de: BORÇ-A → BORÇ-B → BORÇ-C → TD-5 dilimi. Hedef: 7 → 2 (kalan: TD-11'in meşru-desen disable'ları hariç tamamı + TD-13 KABUK'ta kapanır). Tur bitince bu bölüm normal sayıma döner.

-----

## Bilgi Notu (karar bekleyen değil)

- `supabase/SUPABASE-SCHEMA.sql` BAYAT: yeni 14 bütçe tablosu yalnız migration'da (`20260613115009_butce_modulu_temel.sql`). schema.sql artık göç sonrası yapıyı da göstermiyor (kart=departman, budget_item_periods yalnız migration'da: `20260614150000_butce_goc_kart_departman_kalem_donem.sql`). "Şemayı migration'dan oku" geçerli. İleride schema.sql emekli, `supabase/sql/full-rebuild.sql` tek kaynak yapılabilir.
- fn_open_budget'ta departman BUL-VEYA-OLUŞTUR `ON CONFLICT (project_id, code) DO NOTHING` ile race-safe (iki muhasebeci aynı anda aynı kodu açarsa ikinci sessiz düşer). cost_object şema dilimi (2f72ecc) + fn_open_budget (13f8e4f) 5-katman disiplinli; max(item_code)+1 spec hatası yakalandı, item_code_seq monoton sayaç ile düzeltildi.
