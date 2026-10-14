# Opus Sandbox Tarifi — Yerel PostgreSQL

Bu dosyanın tüketicisi Opus'tur. Açılışta okunmaz; CLAUDE.md'deki sandbox tetiği çekildiğinde, sandbox kurulmadan önce okunur. 14 Ekim 2026'da DERSLER diyetiyle oradan taşındı (Engin onayı). Sonnet'in makinesinin gerçeği (Docker yok, `db reset` ve `db dump` çalışmaz) DERSLER "Sandbox gerçeği" maddesinde ve CLAUDE.md Ortamlar bölümündedir.

## Tarif (5 Ekim 2026)

Opus'un konteynerinde yerel PostgreSQL 16 kurulabiliyor ve repodaki göç zincirinin tamamı baştan uygulanabiliyor; şema TASARIMI gerçek fonksiyonlarla (`fn_open_budget`, `fn_add_budget_item`, `fn_lock_budget`) böyle sınanır. Gerekenler: Supabase rolleri (anon, authenticated, service_role, supabase_admin) ve auth şeması (users tablosu, uid ve jwt işlevleri) taklit edilir; baseline'daki PG17'ye özgü `transaction_timeout` satırı ve MAINTAIN yetkisi ayıklanır; `CREATE SCHEMA public` satırı atlanır; baseline'ın zaten içerdiği ilk yedi göç hata verir, bu beklenir; birim tohumu bu yedi göçten birinde yaşadığı için elle eklenir. Kanıt raporlandıktan sonra sandbox silinir; uygulama yine Sonnet'tedir. İlk kullanım: gider çeşidi ekseni sınavı (BUTCE-SEMA-KARARLARI, GİDER ÇEŞİDİ EKSENİ).

## Ek (14 Ekim 2026, KART 1400 sınavı)

Üç takılma tarifte yoktu. (1) MAINTAIN yetkisi yalnız baseline'da değil, sonraki göçlerin yetki satırlarında da geçiyor; hepsinden ayıklanır. (2) Birim tohumu 13 Haziran göçünün (`20260613115009`) tohum bölümünden elle koşulur. (3) Veritabanı klasörü oturumun geçici çalışma klasörüne konmaz: o klasörün izinleri oturum sırasında sıfırlanıyor ve sunucu çöküyor; kalıcı bir klasör kullanılır (`/var/lib/postgresql/` altı).
