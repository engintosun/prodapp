# KAAPA — CURRENT.md

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR. Tarihçe → git log.

## Milestone
M2 — Çekirdek Döngü. Davet/rol akışı (1a + 1b + 1c ✅, canlı doğrulandı).

## Durum
- origin/main HEAD: `6e4dcf9`. Repo + canlı senkron.
- Canlı: prodapp-navy.vercel.app · Repo: github.com/engintosun/prodapp
- Davet zinciri uçtan uca ÇALIŞIYOR (saha2 ile test): davet → link → kayıt → şifre → giriş.
- accept-invitation deploy edildi (verify_jwt=false). Ortam/deploy modeli: CLAUDE.md "Ortamlar / deploy".
- Reviewer onay/red (fn_review_receipt RPC + muhasebe queue dept_approved) TAMAMLANDI.

## Sıradaki
1. Muhasebe onboarding çatısı: departman oluştur → dönem aç → ekip davet et (SK-AUTH-2). Minimal bütçe-limit giriş yolu buraya katlanır.
2. Dept/Muhasebe ev + navigasyon (mevcut reviewer onay/red'i normal akışta erişilebilir yapar).
3. C5 Dönem ekranı (kapama + grace).
Tam liste: IS-SIRASI.md.

## Açık kararlar / borçlar
- Hata maskeleme: accept-invitation + signup genel mesaj → gerçek hatayı göster.
- dynamic-action yanlış fonksiyonu Supabase'de — silinebilir.
- G6 görsel · §6 kategori limit değerleri (Engin'den).

### Onaylanan kararlar (2026-06-06 tasarım oturumu)
- **Setup-first + dikey ince dilim:** Reviewer onay/red yapıldı ama kurulum yolu olmadığı için normal akışta erişilemez; önce onboarding çatısı + Dept/Muhasebe ev/nav ile mevcut parçalar uçtan uca kullanılabilir hale getirilir, sonra dışa açılır.
- **Minimal bütçe-limit yolu:** Tam bütçe modülü Faz 2. Faz 1'de limit tablolarına (period_budgets, dept_budgets) değer girecek minimal yol dönem/muhasebe işine katlanır; yoksa pilotta canlı bütçe kontrolü boş kalır.
- **Görsel tasarım zamanlaması:** Estetik katman (renk, tipografi, ikon, marka) her ekranda commit öncesi G6'da ele alınır, ertelenmiş kalır. Tek yapısal istisna: muhasebe card-desk layout'u (aşağıda kilitli).
- **CARD-DESK LAYOUT (kilitli):**
  - İskelet: üç katman — daralabilir sol ray (modül navigasyonu) + üst bağlam çubuğu + orta "masa yüzeyi".
  - Sol ray: girişte seçilen TEK projenin adını taşır (proje baştan seçilir, muhasebeci yalnızca o projenin içeriğini görür). "Çalışma Dosyaları" ibaresi ve "+" yok. Ray modül listesidir, proje listesi değil. Daralabilir (ikon-only ↔ ikon+metin); kırılma noktaları G6'da.
  - Badge semantiği: badge = yeni/görülmemiş birikim (toplam değil) — görülmemiş fiş, yeni avans talebi, okunmamış mesaj, yeni/yaklaşan kiralama. DATA implikasyonu: her modülde kullanıcı-bazlı görüldü/görülmedi izi gerekir (item'da seen flag ya da kullanıcı×modül son-bakış damgası); ilgili modülün 5-katman tasarımında şemaya konur, atlanırsa planlanmamış iş.
  - Masa yüzeyi (D-2): tek birincil kart (tam genişlik, varsayılan) + daralabilir sağ referans yuvası (~%30-35). Karşılaştırma asimetriktir: aktif iş geniş yüzey ister (birincil), referans dardır (sağ yuva). Referans varsayılan kapalı. Serbest yüzen / N-eşit bölünmüş pencere YOK (Faz 2 lüksü, Faz 1'de tuzak).
  - Mobil (D-3): tek responsive PWA; ayrı mobil sürüm YOK (iki kod tabanı = KVKK yüzeyi iki katı = kaos kalıbı). Responsive uyarlama zaten yapılır (ray collapse, referans tam-ekran katman, çoklu kolon → tek kolon). Her muhasebe ekranı bir mobil-yetenek seviyesi taşır: mobil-tam / mobil-salt-okunur / masaüstü-önerilir. Seviye, ekranın 5-katman tasarımında belirlenir.
