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
acc_pending fiş kartları. Detay: tüm confidence verileri her zaman görünür. Aksiyon: Onayla → acc_approved · Reddet → acc_rejected (10 red sebebi dropdown + opsiyonel alan seçimi, sebep zorunlu; bkz. IS-KURALLARI.md §3) · **Split (½ kısmi onay):** split_amount belirle, fiş → split status. · **Düzeltme İste:** fiş geçerli ama saha alanı yanlışsa → acc_pending'de KALIR, correction_requested=true + saha'ya not; tek tur, saha düzeltir → muhasebe kabul/reddet (IS-KURALLARI.md §3). approval_log otomatik.

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
Yeni dönem aç (period_number, name, 3 deadline: saha/dept/acc). Durum: open → partially_closed → closing → closed → permanently_closed. Departman bazlı kapatma durumu izleme. Muhasebe seviyesi kapatma onayı. Zorla kapama (override_reason zorunlu). Tekrar açma (reopen_reason zorunlu). Kural dondurma: kapanınca rules_snapshot JSONB'ye yazılır. Deadline aşımı bildirimi. (Kademeli kapanış kuralı bkz. IS-KURALLARI.md.)

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
Kilitli akis (2026-06-10): Giris noktasi proje secim ekrani — can_create_projects isaretli hesaba "Yeni proje ac" her zaman gorunur (uyeliksiz dogrudan, uyelikli listenin altinda; bu yuzden isaretli hesapta tek-uyelik otomatik atlamasi kapali). Isaretsiz + uyeliksiz hesap: "Henuz bir projeye davet edilmediniz" + cikis. Proje ac ekrani alanlari: proje adi + yapim sirketi + ad + soyad (fn_create_project; sonrasi normal projeye giris).
Kurulum modu (REVİZYON 2026-07-10: kilit bilinçli açıldı, tek değişiklik yeni ilk adım): alt gezinme gizli, sade baslik + 5 adimli gosterge (**Şirket Tanımı -> Departman -> Dönem -> Bütçe -> Davet**). Departman: ekle (aninda kayit) + listeden ad duzeltme, silme yok, en az 1 ile devam. Donem: ad (oneri "Donem 1"), numarayi sunucu verir, teslim tarihleri sorulmaz, tek donem. Butce: proje toplami (TL sabit) + departman paylari, hepsi istege bagli, "Dagitilmamis: X TL" yalniz bilgi satiri. Davet: mevcut davet ekrani + "Kurulumu bitir". Zorunlu adimlar tamamsa sonraki girislerde kurulum hic acilmaz.

**Adım 1 — Şirket Tanımı (yeni):** Şirket türü seçimi (Şahıs, Adi Ortaklık, Kollektif, Komandit, Ltd, A.Ş., Kooperatif, Diğer) + üç evet/hayır sorusu (Kültür Girişim Belgesi var mı? / Kültür Yatırım Belgesi var mı? / SGK Borcu Yoktur aktivasyonu var mı? — algoritma: PERSONEL-MEVZUATI B, Senaryo türetme algoritması) + her sorunun altında kısa bilgi metni + sabit dipnot: "Cevaplarınıza göre SGK işveren payı otomatik hesaplanır. Mali müşavirinizle doğrulayın." Adım atlanabilir; atlama varsayılanları: Q1=Hayır, Q2=Hayır, Q3=Evet (katalog varsayılanı Standart ile uyumlu).

**Oran yazmama kuralı (genel kural):** kullanıcıya dönük hiçbir bilgi metninde sabit oran yazılmaz (%19,75 gibi); "oran güncel mevzuata göre otomatik hesaplanır" dili kullanılır. Kapsam: Şirket Tanımı adım metinleri + statü "?" sheet + gelecek tüm bilgi yüzeyleri. Gerekçe: B20, oranlar rate_catalog'da yürürlük-dönemlidir.

## 19. Bütçe modülü ekranları (B-serisi, 2026-06-12 — kilitli)
Ray (yukarıdan aşağı): ① Genel bütçe ② Bütçe girişi ③ Raporlar ④ Gerçekleşen ⑤ —ayraç— Tanımlar.

**Ekran 1 — Genel bütçe (salt okunur icmal):** Üstte görünüm düğmesi: Orijinal | Yürüyen | Gerçekleşen. Tablo: etap satırları (Öngörülen/Gerçekleşen/Fark kolonları); etaba tıklayınca altında harcama grubu satırları açılır. Dipte hesap zinciri (B12): Maliyet toplamı → Öngörülmeyen % → Toplam maliyet → Şirket kârı % (gizlenebilir işaretli) → Genel toplam. Mobil-tam.

**Ekran 2 — Bütçe girişi (kart masası):** Etap başlıkları altında sade kartlar (işaret + isim; RAKAM YOK — rakam icmalin işi). Her etap sonunda "+ Kart ekle". Dipte bütçe sonu yüzdeleri satırı (öngörülmeyen + şirket kârı burada düzenlenir). Dizide üst bağlam çubuğunda bütçe seçici (Sezon / Bölüm 1..n). Masaüstü-önerilir.

**Ekran 3 — Kalem tablosu (kart açılınca masayı kaplar):** Başlık: ← Etap · Grup adı. Kolonlar: Sebep (altında küçük otomatik kod) | Ayrıntı | Birim net | Miktar (sayı+birim) | Adet | Yük (bileşen/paket seçimi) | Toplam (ⓘ döküm) | Gerçekleşen | Fark. Açıklama + fark açıklaması satır detayında. Şablondan gelen boş kalemler soluk, 0, toplama girmez. Son satır "+ Kalem ekle". Altta toplam şeridi: Net · Brüt · Gerçekleşen · Fark. Enter/Tab akışı. Masaüstü-önerilir.

Görsel tasarım (renk/tip/işaret seti) ayrı turda — bu tarifler tel kafestir.

**⑤ Tanımlar (2026-07-10):** iki bölüm.
- **REFERANS** — oran/mevzuat cetvelleri (rate_catalog türetimi), salt-okunur.
- **ŞİRKET TANIMI** — Kurulum Modu Adım 1'deki aynı alanların (şirket türü + 3 evet/hayır sorusu) kalıcı, her zaman düzenlenebilir yüzeyi.

"Bu Bütçenin Ayarları" adı KULLANILMAZ (veri şirket-seviyesidir, bütçe-seviyesinde değil). CARD-DESK sağ referans paneli = kaynak dosyaların bağlamsal özeti.

**İptal notu:** "Bütçe Giriş/Açılış Ekranı" diye ayrı bir ekran/dilim YOKTUR — planlanan dört içerik dağıldı: tarih girişi → mevcut "+ Dönem seç" (K7); SGK senaryo seçimi → Şirket Tanımı adımı; teşvik bilgilendirmesi → soru metinleri; Ocak-varsayımı açıklaması → SNL-TAKVIM-VARSAYILAN sinyali.

---

## AÇIK SLOTLAR
- **Kart-merkezli çalışma masası** — bütçe tarafı §19 ile dolduruldu; EV/NAV masası açık (sıra #2'de)
- Renk paleti / tema (G6)
- Kozmetik biçimlendirme
- Raporlardaki grafik türleri (yatay bar baz; donut vb. geliştirme açık)
- Split ödenmeyen kısım (G10)
