# KAAPA — CURRENT.md

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR (eklenmez). Tarihçe → git log.

## Milestone
M2 — Çekirdek Döngü. Davet/rol akışı (Aşama 1a ✅).

## Durum
- origin/main HEAD: `9b42791` (davet 1a). Repo + canlı senkron.
- Canlı: prodapp-navy.vercel.app · Repo (public): github.com/engintosun/prodapp
- Çekirdek döngü canlıda: fiş gir → yönlendirme trigger → reviewer kuyruğu. 3c düzeltme mekaniği canlı. Faz-1 yazma grantları canlı (INSERT 16 / UPDATE 15).

## Son iş (9b42791)
Aşama 1a "Davet Et" ekranı + invitation-service. 5 dosya: domain.ts · invitation-service.ts · invite-screen.tsx · bottom-nav.tsx · authenticated-shell.tsx. Origin'den doğrulandı, build geçti.

## Sıradaki (1-3)
1. **Davet sekmesi mount'u GEÇİCİ** (alt nav, TODO-SPEC) — muhasebe nav tasarımı bekliyor; Engin yerini söyleyecek. Test için `departments` tablosuna SQL ile satır eklenmeli (departman oluşturma UI yok → dropdown boş).
2. **Aşama 1b:** accept-invitation Edge Function (service_role; set-claims kalıbı).
3. **Aşama 1c:** signup ekranı + token-link auth routing (`?invite=token`).
- Sonra: reviewer **Onayla/Reddet** → gerçek statü geçişi + approval_log (şu an stub).

## Açık kararlar
- Muhasebe nav layout (7-tab + kart-masa sunumu) — Engin tasarlayacak.
- G6 görsel: renk/aksan/logo/favicon (yapı hazır, swap edilecek).
- §6 kategori limit değerleri (Ulaşım/Yemek/Konaklama/Kiralama) — Engin'den.
- (Verildi) accept = Edge Function · token = UUID · davet linki = `origin/?invite=token` · expires = 7 gün.
