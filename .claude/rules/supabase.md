---
paths:
  - "supabase/**"
---

# Şema ve migration kuralları

> Yükleme etiketi `paths:` olarak yazılır. `globs:` yazımı D2a'da ÖLÇÜLDÜ (22 Ağustos 2026) ve kapsamı UYGULAMIYOR: kapsamı dışındaki oturumda da açılışta yükleniyor. Hata vermez, kapı yakalamaz — yeni kural dosyası açılırken bu satır okunsun.

- Yeni tablo için GRANT ve RLS policy'nin İKİSİ de gerekir. ensure_rls event trigger'ı yeni tabloda RLS'i otomatik açar ama policy yine elle yazılır.
- Güncel şema = baseline + sonraki TÜM göçler. Baseline bayat tabandır; şema ararken göçler kronolojik okunur, yalnız baseline'a güvenilmez.
- Şema/RLS/grant değişikliği UYGULANMADAN ÖNCE Engin onayı gerekir (canlı KVKK verisi). Onay = SQL'i okuyup "kabul" demek. Salt-okuma işlemler onay gerektirmez.
- Edge fonksiyon: canlı kod = repo kodu. Dashboard'dan ASLA deploy edilmez, yalnız CLI (`supabase functions deploy <ad>`). Yeni fonksiyon adı = klasör adı.
- `db dump` ve `db reset` Docker ister, Docker yok; bunlar için doğrudan pg_dump ya da Supabase SQL Editor kullanılır. `db push` Docker'sız çalışır.
