# KAAPA — Supabase Auth Kararları
**Tarih:** 21 Mayıs 2026
**Kapsam:** Onboarding, davet zinciri, multi-project, silme politikaları

---

## SK-AUTH-1: Müşteri Onboarding

Admin (Engin) yeni müşteriyi sisteme alır. Minimum veri:
- Şirket adı, proje adı
- Muhasebe sorumlusu: email + ad soyad

Sistem tarafında yapılanlar:
1. `projects` kaydı oluşturulur
2. `company_settings` kaydı oluşturulur
3. `auth.users` oluşturulur (Dashboard veya Edge Function)
4. `raw_app_meta_data` yazılır: `{ project_id, role: 'muhasebe', dept_id: null }`
5. `profiles` kaydı oluşturulur
6. Muhasebe'ye davet/aktivasyon maili atılır

Bootstrap SQL template: `docs/BOOTSTRAP-MUSTERI.sql`

---

## SK-AUTH-2: Muhasebe Giriş Sonrası İlk Akış

Muhasebe giriş yapınca sıra:
1. Departman oluştur
2. Dönem aç
3. Ekip davet et

Şirket kuralları (harcama limitleri vb.) Faz 1'de sabit, Faz 2'de yapılandırılabilir (`project_rules` tablosu).

---

## SK-AUTH-3: Davet Zinciri

```
Admin → Muhasebe → Dept / Saha
                 → Dept → kendi dept Saha (Muhasebe bilgilendirilir)
```

Davet kaydı `invitations` tablosuna yazılır:
- `email`, `first_name`, `last_name`, `role`, `dept_id`
- `token` (UUID, unique) — mail linkinde gönderilir
- `expires_at` — süre aşımında `expired` statüsüne geçer
- `invited_by` → kim davet etti (audit trail)

Davet kabul: Edge Function (`service_role`) ile işlenir.
- `auth.users` oluşturulur
- `profiles` kaydı oluşturulur
- `raw_app_meta_data` yazılır
- `invitations.status` → `'accepted'`, `accepted_at` set edilir

Yetki sınırı:
- Muhasebe: her role (saha, dept, muhasebe)
- Dept: sadece kendi departmanına saha

---

## SK-AUTH-4: Multi-Project Desteği

Aynı kişi farklı projelerde farklı rol alabilir (ör: Zeynep bir projede dept, diğerinde saha).

Giriş akışı:
1. Email + şifre → auth
2. `profiles_own_list` policy → kişinin tüm profilleri listelenir (claims gerektirmez)
3. Kullanıcı projeyi seçer
4. Seçilen profile'ın `project_id + role + dept_id` → JWT custom claims'e yazılır
5. RLS aktif hale gelir

`profiles_own_list` policy: `FOR SELECT USING (id = auth.uid())` — project_id filtresi yok, claims olmadan çalışır. Sadece login sonrası proje seçimi için kullanılır.

**Claims yazma mekanizması:** JWT custom claims, `set-claims` adlı bir Edge Function ile yazılır. Client proje seçince bu function'ı çağırır; function `service_role` ile seçilen profile'ın `project_id + role + dept_id` değerlerini `raw_app_meta_data`'ya yazar. Ardından client `supabase.auth.refreshSession()` çağırarak yeni claims'i içeren token'ı alır. Tek profilli kullanıcıda proje seçim ekranı atlanır, claims doğrudan yazılır.

---

## SK-AUTH-5: Soft Delete

Muhasebe bir kullanıcıyı devre dışı bırakmak istediğinde:
- `profiles.is_active = false`
- `profiles.soft_deleted_at = now()`
- `auth.users` silinmez (başka projelerde aktif kalabilir)

Kullanıcı başka bir projede aktif ise erişimi korunur. Silinen projedeki RLS zaten erişimi keser (`project_id = auth.project_id()` filtresi).

---

## SK-AUTH-6: Hard Delete

Sadece Admin yapabilir.

Mali kayıtlar (receipts, advances, approval_log) **silinmez**, anonimleştirilir:
- `user_id` → anonim UUID (sabit bir "deleted_user" placeholder veya NULL)
- `first_name`, `last_name` → `"[Silindi]"`

Yasal dayanak:
- KVKK md.7: kişisel veriler, işleme amacı ortadan kalkınca silinmeli VEYA anonimleştirilmeli
- TTK 10 yıl saklama yükümlülüğü: mali kayıtlar korunmalı

Hard delete log'u zorunludur (kim sildi, ne zaman, sebep).

---

## SK-AUTH-7: `projects` Görünürlüğü

`projects` tablosuna RLS açıldı (v1.3).

**Policy:** `projects_own_list` — `FOR SELECT`, claim gerektirmez.

**Kural:** Kullanıcıya yalnızca (a) kendisi için aktif ve soft-delete edilmemiş bir `profiles` kaydı bulunan ve (b) `is_active = true` olan projeler döndürülür.

**Gerekçe — KVKK cross-company izolasyon:** RLS kapalıyken oturum açmış her kullanıcı sistemdeki tüm şirketlerin proje adlarını okuyabiliyordu. `projects_own_list` bu sızıntıyı kapatır; kullanıcı yalnızca kendi üye olduğu projeleri görür.

**Önceki durum:** `projects` tablosunda RLS yoktu; tüm proje kayıtları herkese açıktı.

**INSERT / UPDATE / DELETE:** service_role ile (Admin onboarding ve yönetim); client-side policy tanımlanmadı.
