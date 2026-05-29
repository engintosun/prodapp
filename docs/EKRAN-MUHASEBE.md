# EKRAN-MUHASEBE.md

Muhasebe rolü ekranları. Dayanıklı katman kayıtlı, kararsız katman açık slot.

> **Muhasebe sekmesi kart-merkezli çalışma masası olacak.** Her konu (bekleyen, şüpheli, avans, kiralama) kartlardan oluşur; kartlar bir masaya serilir, içinde çalışılır; kartlar bildirimlere ve önceliklere göre otomatik sıralanır (yukarı/aşağı). Bu, aşağıdaki içerikten İLERİ bir sunum geliştirmesidir ve AÇIK SLOT'tur — Engin ayrıntılandıracak. Aşağıdaki yapı bilgi/akış katmanıdır; sunumun kart-masaya nasıl döküleceği ayrı tasarlanacak.

---

## 1. Header
Avatar · proje adı · "Muhasebe · Tüm Departmanlar" · tema · bildirim · **ayarlar dişlisi (marka ayarları)** · Proje. Dept'ten fark: ayarlar dişlisi var.

## 2. Tab bar (7 tab, rozetli)
Dashboard / Bekleyen (n) / Şüpheli (n) / Raporlar / Kiralama (n) / Avanslar / Mesaj

## 3. Dönem yönetimi şeridi (dashboard üstü)
"Dönem #X — Açık/Kapalı" + "+ Yeni Dönem" + "Dönem Kapat" + dönem pill seçiciler.

## 4. Dashboard
**TOPLAM HARCAMA** (büyük) + alt kırılım (Onaylı / Bekleyen / Şüpheli).
**"Bütçeleri Düzenle" butonu.**
**Departman kartları:** renk dot + departman adı + kişi sayısı + 4 stat (Toplam/Onaylı/Bekleyen/Şüpheli) + 2 progress bar (harcama + bütçe %). Kart tıklanabilir → departman drill-down detayı.

## 5. Bekleyen tab
acc_pending fiş kartları. Detay: tüm confidence verileri her zaman görünür. Aksiyon: Onayla → acc_approved · Reddet → acc_rejected (sebep zorunlu) · İade → 10 sebep · **Split (½ kısmi onay):** split_amount belirle, fiş → split status. approval_log otomatik.

## 6. Şüpheli tab
"Otomatik tespit edilen anormal harcamalar. İnceleyip onaylayabilir veya reddedebilirsiniz." Kart: kişi · departman + kural uyarısı (⚠) + satıcı · kategori · tarih + durum etiketi (Beklemede sarı / İnceleniyor mavi) + tutar (kırmızı) + **Temizle (yeşil, temize çıkar)** / Reddet (kırmızı). Kurallar bkz. IS-KURALLARI.md §13.

## 7. Raporlar tab
**4 mod seçici kart:** Departman / Kategori / Personel / Dönem.
- **Departman:** satır (toplam + onaylı/bekleyen + kişi + bütçe progress), drill-down detay
- **Kategori:** yatay bar grafik (her kategori renk + tutar + yüzde) + aktif dönem toplamı + Dışa Aktar
- **Personel:** kişi satırı (avatar + isim + dept·rol + tutar + progress), "DETAY İÇİN TIKLA" → kişi detayı
- **Dönem:** dönem karşılaştırma çoklu-seçici (Dönem #2/#1/#0) + GENEL ÖZET tablo (Dönem / Bütçe / Toplam / Onaylı / Red / %Onay) + BÜTÇE KULLANIM ORANI barlar (aşım kırmızı, %100+ gösterir)

## 8. Kiralama tab
3 stat (Aktif Toplam / Olası Ceza / Gecikmiş n) + DEPARTMAN ÖZETİ tablo (departman + aktif sayı (n geç) + toplam ₺ + gecikme cezası ⚠ kırmızı) + GECİKMİŞ KİRALAMALAR listesi (ekipman + kategori·kişi·dept + tarih aralığı·₺/gün + "n gün geç" + ceza hesabı detayı). Muhasebe tüm departmanların kiralamasını görür.

## 9. Avanslar tab
Dönem seçici + "ONAY BEKLEYEN (n)" kart: avatar + isim + **Dept rozeti** + kategori·tarih + gerekçe + **"Onayla & Aktar" (yeşil)** / Reddet. "ÖDENDİ (n)" bölümü: avatar + isim + kategori·tarih + gerekçe + **paid etiketi** (yeşil). Bekleyen/Ödendi toplamları altta.

## 10. Mesaj tab
Sohbet listesi (ortak mesajlaşma kuralları).

## 11. Dönem yönetimi (detay)
Yeni dönem aç (period_number, name, 3 deadline: saha/dept/acc). Durum: open → partially_closed → closed → permanently_closed. Departman bazlı kapatma durumu izleme. Muhasebe seviyesi kapatma onayı. Zorla kapama (override_reason zorunlu). Tekrar açma (reopen_reason zorunlu). Kural dondurma: kapanınca rules_snapshot JSONB'ye yazılır. Deadline aşımı bildirimi. (Kademeli kapanış kuralı bkz. IS-KURALLARI.md.)

## 12. Departman yönetimi
Oluştur · düzenle · şef ata (chief_id) · liste.

## 13. Kategori yönetimi
Genel kategori (expense_categories, project bazlı) · sistem kategorileri (is_system, silinemez) · departman alt kategorisi (dept_subcategories).

## 14. Bütçe yönetimi
Dönem bütçe limiti (period_budgets) · departman bütçe limiti (dept_budgets) · düzenleme modal · eşik uyarı (sarı ≥%80, kırmızı ≥%100).

## 15. Kullanıcı yönetimi
Davet (email + ad soyad + rol + departman) · durum takibi (pending/accepted/expired/revoked) · iptal (revoke) · soft delete (membership_status + revoked_at) · liste (rol bazlı filtre).

## 16. Kişi detay
Harcama geçmişi + fiş listesi + avans durumu + red geçmişi (kaç kez, hangi sebep) + şüpheli işlem geçmişi.

## 17. Marka ayarları (dişli)
ŞİRKET (ad + logo) + PROJELER (her proje: ad override + logo).

## 18. Müşteri onboarding (admin akışı)
İlk giriş yönlendirmesi: departman oluştur → ilk dönem aç → ilk ekip davet et.

---

## AÇIK SLOTLAR
- **Kart-merkezli çalışma masası sunumu** (öncelik/bildirim bazlı kart sıralama, masaya serme) — Engin ayrıntılandıracak, ayrı oturum
- Renk paleti / tema (G6)
- Kozmetik biçimlendirme
- Raporlardaki grafik türleri (yatay bar baz; donut vb. geliştirme açık)
- İade status'ü (G1) · split ödenmeyen kısım (G10)
