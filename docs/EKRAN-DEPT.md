# EKRAN-DEPT.md

Dept (departman şefi) rolü ekranları. Dayanıklı katman kayıtlı, kararsız katman açık slot.

> Kart-merkezli çalışma masası mantığı dept'te KISMEN uygulanabilir (muhasebe kadar değil). Detay açık slot.

---

## 1. Header
Avatar (tıklayınca dept profil) · proje adı · "Dept. Sorumlusu · {departman}" · tema · bildirim · Proje (değiştir). Saha'dan fark: rol+departman görünür, ayarlar dişlisi yok.

## 2. Üst yapı
**Dönem pill seçiciler** (Dönem #2 Aktif / #1 / #0) — tab bar'ın üstünde.
**Tab bar (6 tab, rozetli):** Bekleyen (n) / Ekip / Avanslar (n) / Kiralama (n) / Geçmiş / Mesajlar
**Alt bar (sabit):** Fiş Tara + Belgesiz — **dept fiş girebilir.**

## 3. Bütçe kartı (ekranların üstünde)
Toplam tutar + durum rozeti (ok/uyarı/aşım) + progress bar + 3 stat (onaylanan/bekleyen/red).
**Limit aşımı hâli:** "Limit Aşıldı!" kırmızı rozet + kırmızı banner ("Dönem bütçesi tamamen tükendi — muhasebe ile iletişime geçin") + kırmızı dolu bar + Kalan ₺0 kırmızı.
**Kategori limitleri:** 8 kategori (Yakıt/Yiyecek/Ekipman/Sanat/Ulaşım/Konaklama/Kiralama/Diğer), her biri renk dot + progress + yüzde + "harcanan / limit".
**Eşik renkleri:** yeşil normal · sarı orta (≥%80) · kırmızı aşım (≥%100).

## 4. Bekleyen tab (onay duvarı)
**Toplu işlem:** "Tümünü Seç" checkbox + seçili sayı + "Seçilenleri Onayla" / "Seçilenleri Reddet".
**Fiş kartı:** checkbox + durum dot + satıcı + tutar; alt satır "kişi · kategori · tarih"; anomali uyarısı (sarı, örn "⚠ Ekip 15, 10 porsiyon"); belgesiz mavi etiket (örn "Belgesiz · Ekstra kostüm aksesuarı — nakit ödeme, fiş verilmedi"); kartta Onayla (yeşil) / Reddet (kırmızı).

## 5. Harcama detay (Dept.)
Başlık "Harcama Detayı (Dept.)" + fiş thumbnail (lightbox) + alanlar (satıcı/tutar/tarih/kategori/personel/açıklama) + işlem geçmişi + 3 aksiyon: **Onayla (yeşil) / ½ Kısmi Onay (sarı) / Reddet (kırmızı)**.
- **Onayla:** dept_pending → dept_approved (→ otomatik acc_pending)
- **Reddet:** dept_pending → dept_rejected (sebep zorunlu, serbest metin)
- **İade Et:** 10 iade sebebi dropdown + opsiyonel alan seçimi (bkz. IS-KURALLARI.md)
- **Kategori düzeltme:** iade etmeden tek tıkla kategori değiştir
- approval_log otomatik (trigger)

## 6. Ekip tab
"AKTİF DÖNEM · EKİP HARCAMALARI". Üye satırı: avatar + isim + rol + toplam tutar + bekleyen sayısı ("n bekleyen" sarı / "Bekleyen yok" gri). Footer: "TOPLAM EKİP · n KİŞİ". Üyeye tıklayınca üye detayı (harcama geçmişi, fiş listesi, avans durumu).

## 7. Avanslar tab
3 stat (Bekleyen/Ödendi/Toplam) + "Yeni Avans Talebi" + "Dışa Aktar". "SAHA ONAY BEKLEYEN (n)" altında kart: avatar + isim + "tarihli talep" + gerekçe + **"Onayla → Muhasebe" (yeşil)** / Reddet. Dept onaylayınca avans muhasebeye gider.

## 8. Kiralama tab
"GECİKMİŞ (n)" kırmızı başlık. Kart: ekipman + "kategori · kişi" + "başlangıç → bitiş · ₺/gün" + "n gün gecikmiş" kırmızı rozet + ceza satırı ("⚠ Gecikme: n gün × ₺X = ₺Y olası ceza") + "✓ İade Edildi" durum. Ceza formülü: gün × günlük ücret (bkz. IS-KURALLARI.md).

## 9. Geçmiş tab
Dönem pill seçiciler + dönem özet kartı (toplam/onay/red/fiş) + onaylanan fiş listesi (yeşil dot) + reddedilen fiş listesi (kırmızı dot + sebep).

## 10. Mesajlar tab
Sohbet listesi (ortak mesajlaşma kuralları).

## 11. İstisna izinleri (exception permits)
Kendi departmanı için: geç giriş izni (late_entry) · tekrar açma izni (reopen). Kayıt: granted_by, reason, expires_at.

---

## AÇIK SLOTLAR
- Renk paleti / tema (G6)
- Kart-merkezli sunum dept'te ne kadar uygulanacak — kısmen, detay belirlenecek
- Kozmetik biçimlendirme
- İade status'ü (G1)
