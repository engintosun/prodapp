# KAAPA — DEĞİŞMEZLER

Bu dosya 2 KB'i aşamaz. Aşarsa yeni madde girmez; önce bir madde evine geri döner.

Bir daha tartışılmayacak, evi doğrulanmış on karar. Bu bir özet değil, hatırlatma listesidir.

1. `catalog_code` = MMB/Koster uyumlu kanonik kod (item_library'de doğar, tire ile alt kod: 1101-01); `item_code` = KAAPA iç kimliği; `provenance` = kaynak planın adı, kod değil (BUTCE-SEMA-KARARLARI H-L; migration 20260723120000).
2. Aidiyet veridir, türetme değil: `budget_items.heading_code` başlığın katalog kodunu tutar, NULL = Başlıksız (BUTCE-SEMA-KARARLARI, REVİZYON maddesi).
3. Kart aidiyeti ayrı alan değil, kodun aralığıdır (15xx → KART 1500); SSOT tek: kod (BUTCE-SEMA-KARARLARI §I, K-B).
4. Alias işaret eder, kopyalamaz — aynı para iki kartta toplanmaz (KART-GEREKCELERI, "Alias — neden işaret eder").
5. rate_catalog tüm mevzuat değerlerinin tek kaynağı, oran koda gömülmez (B20); hesaplanmış değer saklanmaz (B18); değişiklik izi DB trigger'ıyla (B19) (BUTCE-SEMA-KARARLARI, B-serisi).
6. Kolon zinciri: Ara toplam (çıplak çarpım) → Yasal Yük (saf yük) → Maliyet (Ara toplam+Yasal Yük) → KDV → Toplam (Maliyet+KDV) (BUTCE-SEMA-KARARLARI, NET/BRÜT DOKTRİNİ REVİZYONU).
7. Beş katman disiplini: şema → RLS → trigger → servis → UI (CLAUDE.md 5-KATMAN KURALI).
8. Yama yok: yanlış kod/RLS/veri yamanmaz, sökülür ve doğrusu konur (CLAUDE.md).
9. Tehlikeli Türkçe kökler, toplu değiştirme YASAK: gec, tip, durum, kat, bolum, miktar/carpan, net (GLOSSARY.md, "Tehlikeli Türkçe Kökler").
10. Bütçe modülünü (kart/kalem) şef ve saha hiç görmez; erişim rolle değil, muhasebenin kart-bazlı yetkilendirmesiyle verilir (IS-KURALLARI.md, GÖRÜNÜRLÜK maddesi).
