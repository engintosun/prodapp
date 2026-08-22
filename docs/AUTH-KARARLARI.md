# KAAPA — Supabase Auth Kararları
**Tarih:** 21 Mayıs 2026
**Kapsam:** Onboarding, davet zinciri, multi-project, silme politikaları

---

## SK-AUTH-1: Müşteri Onboarding

**KARAR (2026-06-10 güncellendi, 2026-07-10 company_profile eki):** KAAPA (operatör) yalnız HESAP açar: Dashboard üzerinden e-posta + geçici şifre, ardından hesaba `can_create_projects: true` işareti (raw_app_meta_data; prosedür: supabase/BOOTSTRAP-MUSTERI.sql). Projeyi müşteri muhasebeci uygulama içinden kendisi açar: `fn_create_project` (SECURITY DEFINER) tek hamlede proje + company_settings (project_name) + company_profile (kullanıcıya 1:1 şirket adı, yoksa oluşturur/varsa farklıysa günceller) + açan kişiye o projede `muhasebe` üyeliği yazar; işlem yarıda kalamaz. `company_settings.company_name` kolonu KALDIRILDI (2026-07-10) — tek kaynak artık `company_profile` (bkz. Şirket Profili Dilimi, CURRENT.md). `projects` tablosuna kullanıcı INSERT izni yoktur. Davetle gelen hesaplar (saha/dept) işaretsizdir, proje açamaz. set-claims / clear-claims yalnız project_id/role/dept_id anahtarlarını yazar/siler; işaret korunur (doğrulandı). Hesap kayıt modeli (Model 1) yeniden tartışılacak — CURRENT.md açık listesi; mekanik değişmez, işareti kim koyar sorusu değişebilir.

Eski model (operatör projeyi elle SQL ile açar) GEÇERSİZDİR.

---

## SK-AUTH-2: Muhasebe Giriş Sonrası İlk Akış

**KARAR (2026-06-10 guncellendi):** Muhasebe ilk giriste kurulum akisina alinir (tek cizgi):
1. Departman olustur — en az 1, zorunlu
2. Donem ac — en az 1, zorunlu; teslim tarihleri sorulmaz, donem ekraninda (C5) girilir
3. Minimal butce — proje toplami (TL) + departman paylari; tamamen atlanabilir
4. Ekip davet — mevcut davet ekrani; atlanabilir
Yarida kalirsa sonraki giriste eksik ilk ZORUNLU adimdan devam edilir; ilerleme kaydi tutulmaz, eksik mevcut veriden okunur (departman var mi / acik donem var mi). Butce ve davet giriste dayatilmaz. Kurulum bitince kullanici dogrudan muhasebe kabuguna duser; ayri tamamlandi ekrani yoktur.
Sirket kurallari (harcama limitleri vb.) Faz 1'de sabit, Faz 2'de yapilandirilabilir (project_rules tablosu).

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

**Kural:** Kullanıcıya yalnızca (a) kendisi için `membership_status = 'active'` olan bir `profiles` kaydı bulunan projeler döndürülür. SK-AUTH-12 ile KALDIRILAN eski (b) şıkkı birebir şudur: `status = 'active'` olan projeler döndürülür.

**Gerekçe — KVKK cross-company izolasyon:** RLS kapalıyken oturum açmış her kullanıcı sistemdeki tüm şirketlerin proje adlarını okuyabiliyordu. `projects_own_list` bu sızıntıyı kapatır; kullanıcı yalnızca kendi üye olduğu projeleri görür.

**Önceki durum:** `projects` tablosunda RLS yoktu; tüm proje kayıtları herkese açıktı.

**INSERT / UPDATE / DELETE:** service_role ile (Admin onboarding ve yönetim); client-side policy tanımlanmadı.

---

## SK-AUTH-9: Departman Zorunlulugu ve Departmansiz Onay Akisi

**Karar tarihi:** 28 Mayis 2026

**Constraint:** `chk_role_dept_id` — `role = 'muhasebe' OR dept_id IS NOT NULL`

Saha ve dept rolleri icin dept_id zorunludur; muhasebe icin null olabilir.

**Departmansiz onay akisi:**

Bir departmanda dept rolu yoksa (yani o departmana atanmis dept kullanicisi bulunmuyorsa), fis onay zincirinde dept adimi atlanir. Fis dogrudan muhasebe onayina duser.

Bu runtime kontroludur, konfigurasyon degildir. Sistem fis submit edildiginde dept_id'ye gore profiles tablosunda aktif dept kullanicisi arar; bulamazsa dept adimini atlar.

**Birden fazla dept kullanicisi:** Ayni departmanda birden fazla dept kullanicisi varsa, herhangi biri onaylayabilir (ilk gelen yapar). Faz 1 icin yeterli.

---

## SK-AUTH-10: Kişi FK'larının hedefi (KİLİTLİ — eski TECH-DEBT TD-3)

Kişiyi gösteren FK'lar (`receipts.user_id`, `advances`, `exception_permits`, `approval_log`) belirli bir üyelik satırına değil doğrudan `auth.users(id)`'ye bakar. Üyelik bağlamı (`user_id + project_id`) FK ile değil RLS ile sağlanır.

Bu bilinçli bir sadeleştirmedir ve karar 27 Mayıs 2026'da verilmiştir — bekleyen bir seçim yoktur. Geriye kalan tek şey gözden geçirme şerhidir: çok-projeli kullanımda üyelik bağlamının yalnız RLS'e emanet olması M2'de bir kez gözden geçirilir. 31 Temmuz 2026'da TECH-DEBT.md'den buraya taşındı (borç değil, verilmiş karar).

---

## SK-AUTH-11: Yapımcı — Master/Owner katmanı (ENGİN KARARI, 8 Ağustos 2026)

- Yapımcı MASTER/OWNER katmanıdır — harcama rolleriyle (saha/dept/muhasebe) aynı eksende DEĞİL, üstündedir. Harcama rol listesi ÜÇ olarak kalır (BUTCE-EKRAN-KARARLARI §15 M2 bozulmaz). Ayrı ekran değildir; sahiplik, görünürlük ve yetki katmanıdır. KART-KATALOGU §5.1'deki "Yapımcı/Denetmen (Master/Owner) = tam açık" sabitinin rol karşılığıdır.
- GÖRÜNÜRLÜK: her şeyi görür, maskesiz. MUHASEBE DE TAM AÇIK KALIR — KART-KATALOGU §5.1 mühürlü kuralı BOZULMAZ (maske yalnız set rollerine karşıdır; "muhasebenin göremediği para = denetlenemeyen para").
- MUHASEBE TARAFI: kayıt giremez. Onay zincirinde adımı yoktur.
- BÜTÇE TARAFI: kayıt girer — bütçeyi çoğu zaman yapımcı yapar. Bütçede onay/red gerektiren konularda karar verir.
- YAPIMCI ONAYI (yeni mekanizma): muhasebeyi aşan durumlarda (tutar büyüklüğü veya işlem şekli) muhasebe, sorumluluğu devretmek için yapımcı onayı İSTER. Onay işlemin yanına ilistirilir, bilgi olarak durur. Fişin statüsünü DEĞİŞTİRMEZ, zincire adım EKLEMEZ. Desen: `correction_requested` bayrağıyla aynı sınıf (durum sabit, bayrak eklenir).
- BUGÜN KODDA YOK (yarın aranmasın diye yazıldı): `UserRole` tipinde yapımcı yok (saha/dept/muhasebe) · `ApproverRole` yalnız dept|muhasebe · yapımcı onayını tutacak kolon yok. Bu karar ŞEMA İŞİ doğurur, ayrı dilim.
- İLİŞKİ: bütçe erişimi M2 gereği ayrı yetki eksenidir; Master/Owner o eksenin üstünde durur ve iki eksen birbirini geçersiz kılmaz.

---

## SK-AUTH-12: Proje Yaşam Döngüsü (ENGİN KARARI, 22 Ağustos 2026)

- **SİL YOK, ARŞİV VAR.** Proje veri olarak yok edilmez; `active` ile `archived` arasında gider gelir. Dayanak sektör deseni (Kantata: içinde bütçe/fatura/harcama olan proje silinemez, yalnız arşivlenir; Flow Production Tracking: proje silme varsayılan kapalı). Dönem tarafındaki `reopened` mekanizması EMSAL DEĞİLDİR — o harcama doktrinine aittir (İKİ DOKTRİN KURALI, docs/rakip/YONTEM.md §3). Proje ikisinin de üstündeki kaptır ve kendi doktrinini kurar.
- **ARŞİV GERİ ALINABİLİR.** Tek yönlü kapı değildir. Geri dönüşü olmayan bir "artık asla" kademesi YOKTUR; istenirse dördüncü bir hâl olarak ayrıca kararlaştırılır.
- **ARŞİVİN İÇİNE GİRİLEMEZ.** Görülür, listelenir, ama açılmaz. Girmek için önce raftan indirmek gerekir. Gerekçe: girilebilseydi arşiv bir hâl değil sadece bir etiket olurdu ve "kapalı projeye fiş girilir mi" sorusu her ekranda yeniden doğardı. (Asana'da arşivli projenin salt-okunur OLMAMASI kullanıcıları şaşırtan noktadır; o tuzak bilinçle kapatıldı.)
- **YETKİ:** muhasebe rolündeki herkes arşivler ve raftan indirir. Ayrı sahiplik kuralı konmadı. "Yalnız açan kişi" seçeneği REDDEDİLDİ: üyelik devre dışı bırakılabildiği için projeyi açan ayrıldığında proje sahipsiz kalırdı. Pin kod seçeneği de REDDEDİLDİ: davetle gelen ikinci muhasebeciyle zaten paylaşılacağı için tek kazancı gecikme olurdu. Bu madde SK-AUTH-11 (Yapımcı Master/Owner katmanı) canlıya girdiğinde YENİDEN AÇILIR — sahiplik aslında o katmanın işidir.
- **GEREKÇE ZORUNLU**, her iki yönde de. Boş gerekçe fonksiyon tarafından reddedilir.
- **İZ AYRI DEFTERDE:** `project_lifecycle_log`. Kolona yazma seçeneği REDDEDİLDİ — aynı proje ikinci kez arşivlenince ilk izin üstüne yazılırdı. Trigger YOKTUR ve gerekmez: tablo üzerinde client UPDATE policy olmadığı için tek giriş kapısı fonksiyondur. `projects.closed_at` ve `closed_by` kolonlarına DOKUNULMAZ; bugün ölü kolonlardır (TD adayı, açılmadı).
- **SK-AUTH-7 KORUNDU:** arşivleme client policy ile değil SECURITY DEFINER fonksiyonla yapılır — `fn_create_project` deseninin aynısı. "INSERT/UPDATE/DELETE service_role ile" kuralı BOZULMADI.
- **SİLME CANLI (22 Ağustos 2026, `fn_delete_project`).** Yalnız ARŞİVDEKİ proje silinebilir — ekranda Sil yalnız arşivde çıkar ama fonksiyon ekrana güvenmez, kendi kapısını kurar. Dört engel, hepsi reddederse Türkçe açıklayıcı hata döner: (1) projede fiş varsa, (2) projede avans varsa (bu engel gate tasarımı bitirilirken eklendi — ilk taslakta yalnız fiş/mühür/üye vardı), (3) projeye bağlı mühürlü bütçe versiyonu varsa, (4) projede kendisi dışında aktif üye varsa. Kapılar geçilince zincir yapraktan köke TEK transaction içinde koşar; eksik bırakılan tablo FK tarafından (RESTRICT/NO ACTION) reddedilir ve işlem tamamen geri sarar. `project_lifecycle_log` da zincirdedir — proje silinince arşiv geçmişi de gider, gerekçesi basit: proje yoksa geçmişinin de anlamı yoktur. **ÖLÇÜM DÜZELTMESİ:** önceki taslak "16 FK" diyordu — bu yalnız `projects.id`'ye DOĞRUDAN bağlanan tabloları sayıyordu, dolaylı torunları (ör. `budget_items` altındaki `item_burdens`, `direct_payments`, `budget_item_periods`) saymıyordu. Migration yazılırken canlı `information_schema` üzerinden tam FK grafiği bağımsız olarak çıkarıldı: gerçek zincir 34 çocuk tablo + `projects`'in kendisi. Verilen ilk tablo listesindeki `budget_baselines` migration `20260711140000`'de zaten DROP edilmiş, canlı şemada YOK — zincirden çıkarıldı, dahil edilseydi migration push anında patlardı. `budget_versions` (ve ondan CASCADE ile giden `budget_rate_snapshot`) zincire ayrıca eklendi: (3) numaralı engel bu tabloyu zaten boş garantiliyor ama zincirin gate'e bağımlı kalmadan kendi başına tamamlanması için açıkça temizleniyor.
- **YER:** aç / arşivle / raftan indir / sil dördü de proje seçim ekranında yaşar; projenin içinde hiçbiri olmaz. Detay KABUK-KARARLARI.
- **SALT-OKUNUR ARŞİV — AYRI DİLİME BIRAKILDI (22 Ağustos 2026, Engin):** arşivdeki projeye girip yalnız okumak (kapanmış işin hesaplaşması, geçmiş kontrolü) bugün mümkün değil — "arşivin içine girilemez" maddesi mutlak. Sektör emsali arşivi salt-okunur tutuyor (Kantata, Webvizio); KAAPA bugün daha katı. Karar: salt-okunur arşiv AYRI bir dilim olarak sıraya alındı, bu dilimde yapılmadı.
