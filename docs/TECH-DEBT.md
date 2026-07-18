# KAAPA — Teknik Borç Takibi (TECH-DEBT)

**Son güncelleme:** 18 Temmuz 2026
**Kural:** Her borç bir milestone'a bağlı. "Bir gün düzeltiriz" yok. **Bütçe sınırı yalnız "Açık Borç" kovasını sayar** (kod/şema ile kapatılacak gerçek borç). "Karar Bekleyen" kalemler milestone'da karara bağlanacak yapısal seçimlerdir, borç sayılmaz. Açık Borç 5'i aşarsa yeni özellik durur.

-----

## Açık Borç (kod/şema kapatır — bütçeye sayılır)

|#|Ne|Nerede|Neden kabul edildi|Ödeme hedefi|Tarih|
|-|--|------|------------------|------------|-----|
|TD-5|`auth-service.signOut()` icindeki `clear-claims` invoke best-effort try/catch ile sessiz kapiyor. Hata olursa kullanici loglardan ogreniyor; UI'da gorunmez.|`src/shared/supabase/auth-service.ts`|signOut tamamen kesilmesin diye|M2|27 Mayis 2026|
|TD-10|Muhasebe kabugunda teknik terim sizintisi: bos durumda "acc_pending durumunda fis bulunmuyor" gibi gelistirici dili kullaniciya gorunuyordu. Plain-dil kurali ihlali. acc_pending/dept_pending sizintisi BORC-A ile giderildi (15 Temmuz 2026); kalan is muhasebe kabugunun plain-dil taramasi.|`src/app/muhasebe/` (bekleyen liste bos durumu)|Siradaki is muhasebe ev/nav (card-desk); o ekran elden gecerken duzelir|KABUK milestone|10 Haziran 2026|
|TD-12|Storage upload sahipligi (`owner=auth.uid()`) policy'si canli dogrulanmadi; otomatik test yok|`storage.objects` (receipts bucket)|Storage semasi public pg_dump'a girmiyor (baseline'da yok); saha yukleme calisiyor ama owner zorlamasi test edilmedi|M4 pilot oncesi|22 Haziran 2026|
|TD-13|Alt navigasyon (Masa/Donem/Rapor/Davet/Butce/Tanimlar, 6 sekme) Muhasebe ve Butce ekranlarina siziyor; tasarima gore yalniz harcama-saha yuzeyinde olmali. Kaynak bulundu: kod hatasi degil, bilincli stub — sekmeler dilimlerde kayitli/gecici eklendi, EV/NAV masasi hic kurulmadi; cozum nav tasariminin kendisi.|src/app (rota/layout tarafi, henuz tespit edilmedi)|EV/NAV masasi (IS-SIRASI backlog) kurulmadan tespit gecikti; ekran goruntusuyle 2026-07-13'te dogrulandi|KABUK milestone|14 Temmuz 2026|

-----

## Karar Bekleyen (milestone'a bağlı yapısal seçim — bütçeye sayılmaz)

|#|Ne|Nerede|Neden kabul edildi|Karar hedefi|Tarih|
|-|--|------|------------------|-----------|-----|
|TD-2|Uyelik yasam dongusu alanlari (`membership_status archived_readonly` dali, `access_until`, `revoked_at`, `projects.status/closed_at/closed_by`) SEKIL olarak var; davranis (cascade, export penceresi, otomatik gecis) YOK|`profiles`, `projects`|M1 kapsam disinda|M2|27 Mayis 2026|
|TD-3|Person isaret eden FK'lar (`receipts.user_id` vb.) `auth.users(id)`'ye bakar, belirli uyelik satirina degil; uyelik baglami (`user_id+project_id`) RLS ile saglanir|`receipts`, `advances`, `exception_permits`, `approval_log`|Bilinçli sadelestirme|M2 gozden gecirme|27 Mayis 2026|
|TD-6|In-app produksiyon proje adi iki yerde tutuluyor (`projects.name` + `company_settings.project_name`); hangisi SSOT secilecek karar verilmedi|`projects`, `company_settings`|Onboarding/marka ekrani henuz yok|M3.5 marka ekrani|29 Mayis 2026|
|TD-8|`departments.chief_id` kullanılmıyor — `fn_route_receipt` dept şef sorusunu `profiles` tablosundaki aktif `role=dept` kaydının varlığı üzerinden yanıtlıyor; `departments.chief_id` hiç okunmuyor|`departments`|2026-06-09 onboarding 5-katman tasarımında tespit edildi; ya kolon kaldırılır ya da açık atama yoluna kavuşturulur|M3 — EKRAN-MUHASEBE sef atama ekrani karari (kolon DROP mu acik atama mi)|09 Haziran 2026|

-----

## Kapatılan Borçlar

|#|Ne|Kapatma tarihi|Nasıl kapatıldı|
|-|--|--------------|---------------|
|TD-1|`projects.is_active` kaldirildi, `status` enum tek kaynak|28 Mayis 2026|refactor(schema) commit ile|
|TD-4|clear-claims Edge Function ic hata detayini (rpcErr.message) response govdesinden cikardi; hata yolu korundu|29 Mayis 2026|fix(functions) commit ile|
|TD-7|Ekran organizasyonu rol-bazlı (`src/app/{rol}/`) standart kabul edildi; ARCHITECTURE §4.2/§5.3/§5.4 güncellendi + boş `src/features/` iskeleti silindi (feature-bazlı plan terk)|22 Haziran 2026|docs(architecture) + chore commit ile|
|TD-9|InviteScreen metinleri Turkce karakterlere cevrildi|15 Temmuz 2026|BORC-A commit ile|
|TD-11|React efekt hijyeni uc turda kapandi: B1 toast sabitleme + tekillestirme + 10 ekran efekt bagimliligi (3e338af); B2 net-eksik sessiz gosterge + reviewer/receipt-entry kok cozumleri (8b94022); B3 KLV ref yazimlari useLayoutEffect + grid destructure + set-state-in-effect error'a geri alindi + npx eslint kapisi. SIFIR eslint-disable.|16 Temmuz 2026|BORC-B uc-tur commitleri ile (B3 = bu commit)|
|TD-14|Cok donemli bordro kaleminde bir donemin 0/bos birim neti TUM kalemin hesabini dusuruyordu; B2 sessizlestirmesi "hic girilmemis" ile "0 girildi"yi ayirt etmiyordu. Kapanis: commit ananinda net<=0 yakalanir (setZeroNet, hasNonPositiveOverride saf fonksiyonu), kalemin Yasal Yuk hucresinde kalici "Net 0 olamaz" kirmizi gosterge (toast YOK) - "hic girilmemis" donemler taramadan HARIC (missingNet/tire yolu degismedi).|18 Temmuz 2026|KLV kapanis paketi (tus matrisi + TD-14/15/16) commiti ile|
|TD-15|Donem net hucresi (override yoksa kalemden miras gosteriyor) elle girilmis override'dan gorsel olarak ayirt edilemiyordu - ikisi ayni renkte gorunuyordu.|18 Temmuz 2026|period-row.tsx: override=null iken cellInputNumMuted (soluk renk); KLV kapanis paketi commiti ile ayni oturumda acilip kapandi|
|TD-16|Nav modunda sozlesmede olmayan tus/olay (paste, drop, MOD+Z/Y/X/C, Backspace/Delete, AltGr karakteri vb.) reducer'dan gecmeden hucre degerine sizabiliyordu - tek bir tus siniflandiricisi yoktu, davranis use-grid-navigation.ts'e dagilmis tus-ozel if'lerle belirleniyordu.|18 Temmuz 2026|grid-navigation-core.ts: resolveKeyAction (DOM'suz saf siniflandirici, K10 revize) - varsayilan yasak + sayfa-duzeyi kisayol istisnasi; KLV kapanis paketi commiti ile ayni oturumda acilip kapandi|

-----

## Bütçe Kontrolü

- Açık Borç sayısı: 4 (TD-5, TD-10, TD-12, TD-13)
- Karar Bekleyen: 4 (TD-2, TD-3, TD-6, TD-8) — bütçeye sayılmaz
- **DURUM: 4/5.** BORC-A + BORC-B TAMAM. TD-14 kapandi (18 Temmuz 2026, KLV kapanis paketi) — TD-15/TD-16 ayni pakette acilip kapandi, hicbiri Acik Borc'a yansimadi. Sirada: KLV manuel kontrol listesi 2-10 + tus matrisi turu (Engin) -> MUHUR-3a. Detay CURRENT.md.

-----

## Bilgi Notu (karar bekleyen değil)

- `supabase/SUPABASE-SCHEMA.sql` BAYAT: yeni 14 bütçe tablosu yalnız migration'da (`20260613115009_butce_modulu_temel.sql`). schema.sql artık göç sonrası yapıyı da göstermiyor (kart=departman, budget_item_periods yalnız migration'da: `20260614150000_butce_goc_kart_departman_kalem_donem.sql`). "Şemayı migration'dan oku" geçerli. İleride schema.sql emekli, `supabase/sql/full-rebuild.sql` tek kaynak yapılabilir.
- fn_open_budget'ta departman BUL-VEYA-OLUŞTUR `ON CONFLICT (project_id, code) DO NOTHING` ile race-safe (iki muhasebeci aynı anda aynı kodu açarsa ikinci sessiz düşer). cost_object şema dilimi (2f72ecc) + fn_open_budget (13f8e4f) 5-katman disiplinli; max(item_code)+1 spec hatası yakalandı, item_code_seq monoton sayaç ile düzeltildi.
