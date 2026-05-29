# KAAPA — Tasarım Kararları (Ekranlar-Arası Ortak İlkeler)

**Kapsam:** Bu dosya YALNIZCA tüm ekranlarda ortak geçerli görsel ve etkileşim ilkelerini tutar. Ekran-spesifik içerik (alan/akış/yerleşim) → docs/EKRAN-SAHA|DEPT|MUHASEBE.md. İş mantığı (onay/dönem/avans/reddet/anomali/hot cost) → docs/IS-KURALLARI.md. Görev sırası → docs/IS-SIRASI.md.

---

## 1. Tasarım felsefesi
- **Mobile-first.** Birincil kullanıcı sette: ayakta, tek elle, zaman baskısı, bazen karanlık ortam. Desktop responsive olarak açılır.
- **Aksiyon öncelikli.** Her ekranda birincil eylem görsel merkezde; ikincil bilgi geri planda / scroll altında.
- **Netlik > süs.** Anlaşılırlık her zaman önce gelir.

## 2. Kart-merkezli arayüz
- **Muhasebe:** TAM kart-merkezli çalışma masası. Her konu (bekleyen / şüpheli / avans / kiralama) bir kart; kartlar masaya serilir, içinde çalışılır; bildirimlere ve önceliklere göre otomatik sıralanır (yukarı/aşağı). Sunum detayı G6'da (EKRAN-MUHASEBE açık slot).
- **Dept:** KISMEN kart-merkezli (muhasebe kadar değil).
- **Saha:** kart-merkezli DEĞİL. Aksiyon-merkezli kendi akışı (FİŞ TARA odaklı). **Saha arayüzü jeneriktir:** öğelerin konumları sabit, yalnızca kozmetik (renk/şekil) geliştirilir.

## 3. Tema ve görsel kimlik (ilke kayıtlı, değerler G6'da)
- **Dark-mode öncelikli** (set ortamı), light mode da bulunur. Tema tercihi kullanıcı bazlı.
- **Renk paleti, accent kullanımı, tipografi, ikonografi, logo/favicon → G6 görsel tasarım oturumunda belirlenecek (AÇIK SLOT).**
- tokens.css yapısı placeholder değerlerle kurulur; değerler G6'da swap edilir, yapı değişmez.

## 4. Etkileşim ilkeleri
- Touch target: mobil, tek elle kullanıma uygun minimum boyutlar.
- 100dvh viewport fix (Chrome mobile).
- Floating navigation: tabana yapışık değil, kenar boşluklu, yuvarlak köşeli (saha; yerleşim EKRAN-SAHA §2).
- Durum renkleri (onay/red/bekleyen/uyarı) semantik kullanılır; kesin değerler G6.

## 5. OCR güvenilirlik gösterimi (UX ilkesi)
- Confidence arka planda HER ZAMAN çalışır, tüm veriler Supabase'de. Faz farkı yalnızca kullanıcıya ne gösterildiğidir.
- Confidence renk bantları + eşik gösterimi: ekran detayı EKRAN-SAHA §4. Eşik değerleri pilotta kalibre edilir (referans: docs/RAKIP-ANALIZI-OCR.md — sektör %80-85 başlangıç).
- Onay modeli (3 katmanlı insan kontrolü) iş kuralıdır → docs/IS-KURALLARI.md §1.

## 6. Görsel tasarım işleri (G6 — açık)
Her ekranın görsel tasarımı (renk, kozmetik, dark tema, doku, logo/favicon) commit'ten önce G6 oturumunda belirlenir. Ekran dosyalarındaki "AÇIK SLOT" notları bu oturumda doldurulur.

## 7. Referanslar
- Rakip OCR analizi: docs/RAKIP-ANALIZI-OCR.md
- Domain terimleri: docs/GLOSSARY.md

---

## TAŞINAN İÇERİĞİN HARİTASI (navigasyon — bu dosyada artık yok)
Bu dosyada eskiden karışık duran ekran/iş/auth detayları doğru evlerine taşındı:
- Giriş akışı · saha ana ekran · OCR sonuç ekranı · dönem ekranı → **docs/EKRAN-SAHA.md**
- Reddet/iade · dönem disiplini ve kapama · kategori sistemi · kiralama · avans · hot cost · vergi türleri · şirket kuralları · anomali → **docs/IS-KURALLARI.md**
- Onboarding · davet zinciri · multi-project · üyelik/silme → **docs/AUTH-KARARLARI.md**
- Tasarım/görev iş listesi → **docs/IS-SIRASI.md**
- Dil seçimi · mesai hesaplama · denetçi modu → **Faz 2** (STATUS.md "Faz 2'ye Taşınanlar")
