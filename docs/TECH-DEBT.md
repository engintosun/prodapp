# KAAPA — Teknik Borç Takibi (TECH-DEBT)

**Son güncelleme:** 22 Mayıs 2026
**Kural:** Her borç bir milestone'a bağlı. "Bir gün düzeltiriz" yok. 5'ten fazla açık borç birikirse yeni özellik durur.

-----

## Açık Borçlar

|#|Ne            |Nerede|Neden kabul edildi|Ödeme hedefi|Tarih|
|-|--------------|------|------------------|------------|-----|
|TD-1|`projects` tablosunda `is_active` (bool) ile yeni `status` (enum) ikilisi var|`projects` tablosu|`projects` baska tablolarca FK'lendigi icin bu remodelde birlestirilmedi|M2 oncesi|27 Mayis 2026|
|TD-2|Uyelik yasam dongusu alanlari (`membership_status archived_readonly` dali, `access_until`, `revoked_at`, `projects.status/closed_at/closed_by`) SEKIL olarak var; davranis (cascade, export penceresi, otomatik gecis) YOK|`profiles`, `projects`|M1 kapsam disinda|M2|27 Mayis 2026|
|TD-3|Person isaret eden FK'lar (`receipts.user_id` vb.) `auth.users(id)`'ye bakar, belirli uyelik satirina degil; uyelik baglami (`user_id+project_id`) RLS ile saglanir|`receipts`, `advances`, `exception_permits`, `approval_log`|Bilinçli sadelestirme|M2 gozden gecirme|27 Mayis 2026|

-----

## Kapatılan Borçlar

|#|Ne                      |Kapatma tarihi|Nasıl kapatıldı|
|-|------------------------|--------------|---------------|
|—|Henüz kapatılan borç yok|—             |—              |

-----

## Bütçe Kontrolü

- Açık borç sayısı: 3 / 5
- Durum: ✅ Bütçe içinde
