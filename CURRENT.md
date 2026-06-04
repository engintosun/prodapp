# KAAPA — CURRENT.md

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR. Tarihçe → git log.

## Milestone
M2 — Çekirdek Döngü. Davet/rol akışı (1a + 1b + 1c ✅, canlı doğrulandı).

## Durum
- origin/main HEAD: `2c316f6` (bu doküman commit'inden bir önceki). Repo + canlı senkron.
- Canlı: prodapp-navy.vercel.app · Repo: github.com/engintosun/prodapp
- Davet zinciri uçtan uca ÇALIŞIYOR (saha2 ile test): davet → link → kayıt → şifre → giriş.
- accept-invitation deploy edildi (verify_jwt=false). Ortam/deploy modeli: CLAUDE.md "Ortamlar / deploy".

## Sıradaki
1. Reviewer Onayla/Reddet → statü geçişi + approval_log (şu an stub; döngüyü kapatır).
2. (Sonra) Davet Aşama 3: üye yönetimi (liste / revoke / arşiv — membership_status).
Tam liste: IS-SIRASI.md.

## Açık kararlar / borçlar
- Hata maskeleme: accept-invitation + signup genel mesaj → gerçek hatayı göster.
- Departman oluşturma UI yok (muhasebe onboarding) — davet departman istiyor, şimdilik SQL seed.
- Muhasebe nav layout (Engin tasarlar) + "Davet" sekmesi geçici mount (TODO-SPEC).
- dynamic-action yanlış fonksiyonu Supabase'de — silinebilir.
- G6 görsel · §6 kategori limit değerleri (Engin'den).
