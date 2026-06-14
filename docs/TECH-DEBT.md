# KAAPA — Teknik Borç Takibi (TECH-DEBT)

**Son güncelleme:** 13 Haziran 2026
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

-----

## Karar Bekleyen (milestone'a bağlı yapısal seçim — bütçeye sayılmaz)

|#|Ne|Nerede|Neden kabul edildi|Karar hedefi|Tarih|
|-|--|------|------------------|-----------|-----|
|TD-2|Uyelik yasam dongusu alanlari (`membership_status archived_readonly` dali, `access_until`, `revoked_at`, `projects.status/closed_at/closed_by`) SEKIL olarak var; davranis (cascade, export penceresi, otomatik gecis) YOK|`profiles`, `projects`|M1 kapsam disinda|M2|27 Mayis 2026|
|TD-3|Person isaret eden FK'lar (`receipts.user_id` vb.) `auth.users(id)`'ye bakar, belirli uyelik satirina degil; uyelik baglami (`user_id+project_id`) RLS ile saglanir|`receipts`, `advances`, `exception_permits`, `approval_log`|Bilinçli sadelestirme|M2 gozden gecirme|27 Mayis 2026|
|TD-6|In-app produksiyon proje adi iki yerde tutuluyor (`projects.name` + `company_settings.project_name`); hangisi SSOT secilecek karar verilmedi|`projects`, `company_settings`|Onboarding/marka ekrani henuz yok|M3.5 marka ekrani|29 Mayis 2026|
|TD-7|Ekranlar `src/app/{rol}/` altında organize; ARCHITECTURE.md feature-bazlı organizasyona atıf yapıyor — bu uyumsuzluk milestone gözden geçirmesine bırakıldı|`src/app/`, `docs/ARCHITECTURE.md`|Yapısal karar milestone'a ertelendi|M3 milestone gözden geçirme|06 Haziran 2026|

-----

## Kapatılan Borçlar

|#|Ne|Kapatma tarihi|Nasıl kapatıldı|
|-|--|--------------|---------------|
|TD-1|`projects.is_active` kaldirildi, `status` enum tek kaynak|28 Mayis 2026|refactor(schema) commit ile|
|TD-4|clear-claims Edge Function ic hata detayini (rpcErr.message) response govdesinden cikardi; hata yolu korundu|29 Mayis 2026|fix(functions) commit ile|

-----

## Bütçe Kontrolü

- Açık Borç sayısı: 5 / 5 (TD-5, TD-8, TD-9, TD-10, TD-11)
- Karar Bekleyen: 4 (TD-2, TD-3, TD-6, TD-7) — bütçeye sayılmaz
- Durum: ⚠️ Bütçe SINIRINDA (5/5). Yeni borç eklenirse (6) yeni özellik durur — önce kapatma gerekir.

-----

## Bilgi Notu (karar bekleyen değil)

- `supabase/SUPABASE-SCHEMA.sql` BAYAT: yeni 14 bütçe tablosu yalnız migration'da (`20260613115009_butce_modulu_temel.sql`). schema.sql artık göç sonrası yapıyı da göstermiyor (kart=departman, budget_item_periods yalnız migration'da: `20260614150000_butce_goc_kart_departman_kalem_donem.sql`). "Şemayı migration'dan oku" geçerli. İleride schema.sql emekli, `supabase/sql/full-rebuild.sql` tek kaynak yapılabilir.
