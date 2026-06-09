# KAAPA — Teknik Borç Takibi (TECH-DEBT)

**Son güncelleme:** 29 Mayıs 2026
**Kural:** Her borç bir milestone'a bağlı. "Bir gün düzeltiriz" yok. 5'ten fazla açık borç birikirse yeni özellik durur.

-----

## Açık Borçlar

|#|Ne            |Nerede|Neden kabul edildi|Ödeme hedefi|Tarih|
|-|--------------|------|------------------|------------|-----|
|TD-2|Uyelik yasam dongusu alanlari (`membership_status archived_readonly` dali, `access_until`, `revoked_at`, `projects.status/closed_at/closed_by`) SEKIL olarak var; davranis (cascade, export penceresi, otomatik gecis) YOK|`profiles`, `projects`|M1 kapsam disinda|M2|27 Mayis 2026|
|TD-3|Person isaret eden FK'lar (`receipts.user_id` vb.) `auth.users(id)`'ye bakar, belirli uyelik satirina degil; uyelik baglami (`user_id+project_id`) RLS ile saglanir|`receipts`, `advances`, `exception_permits`, `approval_log`|Bilinçli sadelestirme|M2 gozden gecirme|27 Mayis 2026|
|TD-5|`auth-service.signOut()` icindeki `clear-claims` invoke best-effort try/catch ile sessiz kapiyor. Hata olursa kullanici loglardan ogreniyor; UI'da gorunmez.|`src/shared/supabase/auth-service.ts`|signOut tamamen kesilmesin diye|M2|27 Mayis 2026|
|TD-6|In-app produksiyon proje adi iki yerde tutuluyor (`projects.name` + `company_settings.project_name`); hangisi SSOT secilecek karar verilmedi|`projects`, `company_settings`|Onboarding/marka ekrani henuz yok|M3.5 marka ekrani|29 Mayis 2026|

-----

## Kapatılan Borçlar

|#|Ne                      |Kapatma tarihi|Nasıl kapatıldı|
|-|------------------------|--------------|---------------|
|TD-1|`projects.is_active` kaldirildi, `status` enum tek kaynak|28 Mayis 2026|refactor(schema) commit ile|
|TD-4|clear-claims Edge Function ic hata detayini (rpcErr.message) response govdesinden cikardi; hata yolu korundu|29 Mayis 2026|fix(functions) commit ile|

-----

|TD-7|Ekranlar `src/app/{rol}/` altında organize; ARCHITECTURE.md feature-bazlı organizasyona atıf yapıyor — bu uyumsuzluk milestone gözden geçirmesine bırakıldı, şimdi dokunulmadı|`src/app/`, `docs/ARCHITECTURE.md`|Yapısal karar milestone'a ertelendi|M3 milestone gözden geçirme|06 Haziran 2026|
|TD-8|`departments.chief_id` kullanılmıyor — `fn_route_receipt` "dept şef sorusunu" `profiles` tablosundaki aktif `role=dept` kaydının varlığı üzerinden yanıtlıyor; `departments.chief_id` hiç okunmuyor|`departments`|2026-06-09 onboarding 5-katman tasarımında tespit edildi; ya kolon kaldırılır ya da açık atama yoluna kavuşturulur|M3|09 Haziran 2026|

-----

## Bütçe Kontrolü

- Açık borç sayısı: 6 / 5
- Durum: ⚠️ Bütçe aşıldı — yeni özellik öncesi en az 2 borç kapat
