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

`profiles_own_list` policy: `FOR SELECT USING (user_id = auth.uid())` — project_id filtresi yok, claims olmadan çalışır. Sadece login sonrası proje seçimi için kullanılır.

profiles artık üyelik tablosudur; `id` surrogate UUID, `user_id` auth.users'a bağlanır, `UNIQUE(user_id, project_id)` ile aynı kişi aynı projede tek üyeliğe sahiptir; bir kişi N projede N üyelik satırına sahip olabilir.

**Claims yazma mekanizması:** JWT custom claims, `set-claims` adlı bir Edge Function ile yazılır. Client proje seçince bu function'ı çağırır; function `service_role` ile seçilen profile'ın `project_id + role + dept_id` değerlerini `raw_app_meta_data`'ya yazar. Ardından client `supabase.auth.refreshSession()` çağırarak yeni claims'i içeren token'ı alır. Tek profilli kullanıcıda proje seçim ekranı atlanır, claims doğrudan yazılır.

**`set-claims` güvenlik modeli:**
- Çağıranın kimliğini JWT'den alır (`Authorization` header → `auth.getUser()`); body'deki `project_id` dışında hiçbir veriye güvenmez.
- `role` ve `dept_id` her zaman `profiles` satırından okunur; client bunları gönderemez.
- Sahiplik doğrulaması: `user_id = uid AND project_id = istenen AND membership_status = 'active'` — eşleşme yoksa 403 döner. `(user_id, project_id)` unique olduğu için tam bir satır döner.
- Tek profilli kullanıcıda proje seçim ekranını atlama mantığı frontend'dedir; fonksiyon proje-agnostiktir.
- Deploy: manuel (Supabase Dashboard veya CLI). `verify_jwt` açık olmalıdır (default açık, kapatılmamalı).
- Kaynak: `supabase/functions/set-claims/index.ts`

---

## SK-AUTH-5: Üyelik Devre Dışı Bırakma (eski: Soft Delete)

Muhasebe bir kullanıcının üyeliğini devre dışı bırakmak istediğinde `membership_status` güncellemesi yapılır:
- `membership_status = 'revoked'` + `revoked_at = now()` — erişim tamamen kapatılır
- `auth.users` silinmez (başka projelerde aktif üyelik kalabilir)

Kullanıcı başka bir projede aktif ise erişimi korunur; her üyelik ayrı satır olduğundan o projedeki üyelik etkilenmez. Devre dışı bırakılan projedeki RLS erişimi keser (`membership_status = 'active'` filtresi).

---

## SK-AUTH-8: Üyelik Yaşam Döngüsü

`membership_status` üç değer alır:

- **`active`** — Üyelik açık, erişim tam, bitiş tarihi yok.
- **`archived_readonly`** — Giriş kapalı; `access_until` tarihine kadar kullanıcı SADECE kendi kapama raporlarını okuyabilir. `access_until` ZORUNLUDUR (`chk_readonly_access_until` constraint).
- **`revoked`** — Erişim tamamen kapalı; `revoked_at` damgalanır.

Geçiş kuralları:
- Muhasebe belirler.
- `archived_readonly` atlanıp `active → revoked` doğrudan yapılabilir.
- `revoked`, KVKK/TTK hard-delete (SK-AUTH-6) DEĞİLDİR: kayıt ve mali veri durur.

Export kapsamı: saha kendi kapamaları; dept kendi + departman kapamaları.

Proje sonu: `projects.status = 'archived'` → o projenin tüm üyelikleri `archived_readonly + access_until` (cascade). **NOT:** Bu alanlar v2.0'da ŞEKIL olarak eklendi; cascade/export/otomatik geçiş LOGİK'i M2'ye ertelendi (bkz. TECH-DEBT TD-2).

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

**Kural:** Kullanıcıya yalnızca (a) kendisi için `membership_status = 'active'` olan bir `profiles` kaydı bulunan ve (b) `status = 'active'` olan projeler döndürülür.

**Gerekçe — KVKK cross-company izolasyon:** RLS kapalıyken oturum açmış her kullanıcı sistemdeki tüm şirketlerin proje adlarını okuyabiliyordu. `projects_own_list` bu sızıntıyı kapatır; kullanıcı yalnızca kendi üye olduğu projeleri görür.

**Önceki durum:** `projects` tablosunda RLS yoktu; tüm proje kayıtları herkese açıktı.

**INSERT / UPDATE / DELETE:** service_role ile (Admin onboarding ve yönetim); client-side policy tanımlanmadı.
