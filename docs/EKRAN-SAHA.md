# EKRAN-SAHA.md

Saha rolü ekranları. Dayanıklı katman (akış, alan, yerleşim, mantık) kayıtlıdır. Kararsız katman (renk, kozmetik) açık slot olarak işaretlidir.

> **Saha arayüzü jeneriktir.** Öğelerin KONUMLARI sabittir. Sadece kozmetik (renk, şekil) geliştirilecek. Kart-merkezli çalışma masası mantığı saha'da UYGULANMAZ — saha kendi aksiyon-merkezli akışında kalır.

---

## 1. Giriş akışı
Mail + şifre → (çoklu proje varsa) proje seçimi → ana ekran. Tek projeli kullanıcıda proje seçimi atlanır.

## 2. Ana ekran (tab 1)
**Header:** avatar (sol, tıklayınca menü) · proje adı + "▼ menü" ipucu (orta) · bildirim badge (sağ)
**Avatar menü:** Profil / Proje Değiştir / Tema / Yardım / Çıkış
**Merkez:** büyük yuvarlak "FİŞ TARA" diski (üstünde KAAPA logosu). Ekranın görsel merkezi, aksiyon önceliği.
- Kısa basış → kamera açılır
- Uzun basış (500ms) → submenu: Fiş Tara / Galeri / Belgesiz / Vazgeç
- İlk açılışta bir kez pulse animasyonu
**Disk altı hızlı butonlar:** Galeri · Belgesiz
**Scroll altı:** bütçe widget (harcanan/kalan/bütçe + progress) · kategori limit barları · son girilen 3 fiş (yatay) · avans/harcanan özeti
- Above-the-fold'da yalnızca disk + hızlı butonlar; özet bilgi scroll altında
- Reddedilenler scroll altında GÖSTERİLMEZ (bildirim + dönem filtresinden görülür)
**Alt floating nav (4 tab):** Ana / Dönem / Ara / Mesajlar

## 3. Fiş giriş yolları
3 yol: **Kamera** (ana buton) · **Galeri** (mevcut foto/dosya) · **Belgesiz** (fotosuz elle).
- E-fatura ayrı yol DEĞİL: genelde muhasebe işler, uygulama dışı. Giren olursa foto çeker → kamera/galeri yoluna düşer.
- PDF dosya hangi protokolle çekilecek → AÇIK KARAR.
- Foto çekilince QR varsa GİB sorgulanır; yoksa OCR. E-fatura OCR'a girmez, QR varsa sorgulanır.

## 4. OCR sonuç formu (kamera/galeri sonrası)
**Header:** "Belge ile karşılaştırın" + ×
**Confidence göstergesi:** Satıcı %XX · Tutar %XX · KDV %XX (yan yana, progress bar)
- Renk eşiği: %80+ yeşil · %60–79 sarı · %60↓ kırmızı
**Ham metin bloğu:** fişten okunan ham OCR metni (monospace)
**Açıklama:** textarea + inline mikrofon (browser Speech API → metne çevirir). Kullanıcı bazen yazmaz, sesle kaydeder.
**"Diğer alanlar" dropdown:** varsayılan KAPALI
- Satıcı · Tutar+KDV (yan yana) · Tarih+Fiş No (yan yana) · Kategori (expense_categories)
- GİB e-Fatura Doğrula butonu + doğrulandı badge
- Dijital imza
**State 1** (tüm alanlar ≥%70): dropdown kapalı, kullanıcı sadece açıklama yazıp gönderir
**State 2** (herhangi alan <%70): "Kontrol gerekli" badge + dropdown otomatik açık + düşük alanlarda uyarı ikonları, elle düzeltilir, düzeltme flag'lenir
**Aksiyon:** İptal · Onaya Gönder (draft → submitted)

> M2 NOTU: OCR yok. Buton kamerayı açar, foto çekilir, OCR yerine alanlar elle doldurulur (form State 2 gibi davranır). OCR geldiğinde aynı yere oturur.

## 5. Belgesiz form
Kamera AÇILMAZ, foto çekilmez. is_documentless=true.
**Uyarı banner:** "Belgesiz harcama muhasebe onayına tabidir ve raporlara işlenir."
**Alanlar:** Tutar + Kategori · Tarih + Departman · Neden dropdown (Fiş verilmedi / Fiş kayboldu / Acil nakit ödeme / Diğer) · Açıklama · İş kanıtı fotoğrafları (Kamera+Galeri, çoklu, opsiyonel) · Dijital imza
**Aksiyon:** Bildir
- Alt kategori (dept_subcategories) departmana göre filtrelenir

## 6. Kategori bazlı ek paneller (OCR + Belgesiz ortak)
Kategoriye göre form ek panel açar:
- **Ulaşım:** biniş/varış noktası + mesafe (km) + güzergah (şehiriçi/şehirdışı) + km başı limit kontrolü + aşım uyarısı
- **Yemek:** kişi sayısı + öğün (kahvaltı/öğle/akşam)
- **Konaklama:** gece sayısı + kişi sayısı
- **Kiralama:** başlangıç/bitiş tarihi + günlük ücret + gecikme cezası uyarısı

> Km limitleri, kişi başı eşikler vb. şirket kurallarından gelir (bkz. IS-KURALLARI.md). Limit aşımı anomali motoruna sinyaldir (bkz. IS-KURALLARI.md §13).

## 7. Dönem ekranı (tab 2)
**Dönem pill seçiciler** (aktif/geçmiş)
**3 özet kart:** toplam harcama · avans bakiye · fiş sayısı
**İlerleme çubuğu:** harcanan / bütçe limiti
**Fiş listesi:** thumbnail (veya belgesiz ikonu) + satıcı + tutar + durum etiketi; tıklayınca fiş detay
**Filtre:** durum (tümü/bekleyen/onaylanan/reddedilen) + kategori
**PDF export ikonu**
**Avans Talep Et butonu** → avans formu
**Dönem kapatma:** kendi kapama submit (period_closings, level=saha); özet hesaplanır (total_amount, advance_balance, receipt_count)
**Kapanmış dönemde:** kapama özeti (onaylanan fiş+₺ / reddedilen fiş+₺ / kullanılan avans / hesaplaşma (alacak/borç) / kapanış tarihi+onaylayan) + "Yüklenen belgeler" (dönem raporu, taranmış fişler, imzalı mutabakat — her biri ✓) + özel belge sayaçları (tevkifat/stopaj/self-billing/geç işlem)

## 8. Arama (tab 3)
Arama input (vendor_name, description). Sonuç satırı: durum dot + satıcı + tarih·kategori·departman + tutar + durum etiketi. Belgesiz için BSZ rozeti. "TIKLA → KAYDA GİT" → sonuç detayına gider.

## 9. Mesajlar (tab 4)
Sohbet listesi → sohbet görünümü (mesaj baloncukları: ben sağ/turuncu, diğer sol/gri; zaman; okundu tikleri; compose bar). Detay bkz. MUHASEBE/ortak mesajlaşma kuralları.

## 10. Fiş detay (saha görünümü)
Thumbnail (veya belgesiz ikonu, lightbox) + alanlar (satıcı/tutar/KDV/tarih/fiş no/kategori/açıklama) + uyarı banner + belgesiz banner + iş kanıtı foto + işlem geçmişi (approval_log timeline: oluşturma → onay/red). Saha: kendi fişi salt görüntüleme; draft ise düzenle/sil.

## 11. Avans (saha tarafı)
Avans talebi (tutar + gerekçe + dönem) · durum takibi (pending/approved/rejected/settled) · bakiye (avans − harcama).

## 12. Bildirimler (saha tarafı)
Liste: onay/red/avans/dönem. Tıklayınca ilgili fişe/avansa git. Okundu işaretleme. Badge sayacı (header). Renk kodu: kırmızı acil/red · sarı uyarı/deadline · gri bilgi/onay. Footer: kaynak (Sistem / kişi+rol).

## 13. Profil
Avatar (foto veya harf fallback) + ad/soyad/telefon/email + rol + departman. Düzenle (ad/soyad/telefon), avatar yükle.

---

## AÇIK SLOTLAR (kararsız katman — ayrı oturumda doldurulacak)
- Renk paleti / tema (G6) — saha dahil tüm renkler baştan belirlenecek
- Kozmetik: buton/disk/kart şekilleri, ikonografi — yerleşim sabit, görünüm geliştirilecek
- Dijital imza tanımının teyidi (G2) — canvas imza + zaman damgası yönünde
- PDF dosya çekme protokolü
