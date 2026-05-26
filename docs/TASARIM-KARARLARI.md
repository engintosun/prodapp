# PRODAPP — Tasarım Kararları (Tüm Seanslar)
**Son güncelleme:** 17 Mayıs 2026 (Seans 6)
**Amaç:** Tüm tasarım kararlarını tek dosyada toplamak. Sonnet prompt'ları ve Claude Design brief'leri bu dosyayı referans alacak.

---

## 1. GİRİŞ AKIŞI

### 1.1 Tam Sıra
İlk giriş:  Mail → Dil seçimi → Proje seçimi → Tutorial → Ana ekran
Tekrar giriş: Mail → Proje seçimi → Ana ekran (dil + tutorial atlanır)
Tek proje:   Mail → Ana ekran (proje seçimi de atlanır)
Oturum açık: Proje seçimi → Ana ekran (veya tek projeliyse direkt ana ekran)

### 1.2 Dil Seçimi
- Konum: Mail giriş ekranının İÇİNDE — sağ üstte bayraklı dropdown
- Davranış: Kullanıcı dil seçer → ekran o dile döner → mail girer
- İlk girişte bir kez gösterilir, sonra profil ayarlarından değiştirilebilir
- Herkes kendi dilini seçer — Saha, Dept, Muhasebe, Yapımcı/Denetçi dahil
- 10 dil: TR, EN, DE, FR, ES, IT, RU, JA, ZH, KO
- Bayrak + dil adı (kendi dilinde) — bayraklar SVG, ~15 KB toplam
- Alt not: "Profil ayarlarından değiştirebilirsiniz" + İngilizce çevirisi

### 1.3 Proje Seçimi
- Tüm roller görür (birden fazla projesi olan herkes)
- Kart içeriği: Proje avatarı (fotoğraf veya harf fallback) + proje adı + departman · isim
- Proje avatarı: Muhasebe (veya Yapımcı) proje oluştururken yükler. Fotoğraf yoksa otomatik harf avatarı (baş harfler + renk)
- Departman gösterimi: "Sanat · Zeynep Arslan", "Muhasebe · Ayşe Tekin" — rol değil departman
- Tek projeli kullanıcı: Proje seçim ekranı atlanır

### 1.4 Session Persistence ("Beni Hatırla")
- Demo'da yok, Supabase Auth ile implemente edilecek
- JWT session — token geçerliyse login atlanır, doğrudan proje seçimine düşer
- SUPABASE-ONCESI-GOREVLER.md E4 olarak kayıtlı

---

## 2. SAHA ANA EKRAN

> **⚠ GÖRSEL KARARLAR SIFIRLANDI (22 Mayıs 2026)**
> Bu bölümdeki renk, font, neumorphic stil, piksel ölçüler v8 demo dönemine aittir.
> Yeni tasarım session'ında kararlar alınacak. Aşağıdaki görsel detaylar referans olarak durur, geçerli değildir.
> İş akışı kararları (bölüm 1, 3, 4, 5, 6) geçerliliğini korur.

### 2.1 Genel İlkeler
- Aksiyon öncelikli — ilk bakışta sadece FİŞ TARA, geri kalan ikincil
- Set gerçekliği: Ayakta, tek elle, zaman baskısı, bazen karanlık ortam
- Level 3 neumorphic görsel dil — premium, fiziksel nesne hissi
- Dark mode öncelikli (set ortamı), light mode da olmalı

### 2.2 Renk Paleti ve Turuncu Kullanım Kuralı
- Warm black #0C0A08 + orange accent #E8962E
- Turuncu SADECE: FİŞ TARA disk rim + scan ikonu + "FİŞ TARA" yazısı + aktif tab + bildirim badge
- Geri kalan her şey nötr tonlarda — az turuncu = premium, çok turuncu = ucuz
- Font: DM Sans + DM Mono, İkonlar: Lucide SVG

### 2.3 Header (sabit)
- Sol: Kullanıcı avatar (daire, baş harfler veya fotoğraf)
- Orta: Proje adı + "DÖNEM 03 · GÜN 24" alt yazı
- Sağ: Bildirim ikonu + kırmızı badge
- Avatar tıklayınca menü: Profil / Proje Değiştir / Yardım / Çıkış

### 2.4 Above the Fold (scroll öncesi — tertemiz)
- FİŞ TARA diski: Ekranın görsel merkezinde, ~230px, neumorphic gölgeler, specular highlight
- Galeri + Belgesiz butonları: Disk altında, neumorphic pill shape, 18px disk-buton arası
- Scroll hint oku: Butonlardan 44px aşağıda, nötr renk, bounce animasyonu (6px, 2.5s döngü)
- Hiçbir açıklayıcı metin yok — "tara veya uzun bas", "basılı tut" gibi yazılar YOK
- Son fişler above the fold'da HİÇ görünmeyecek — kısmen de değil

### 2.5 Scroll Altı (kaydırınca görünür)
- Sıra: Son girilen fişler → avans/harcanan durumu
- Dönem özeti scroll altına girmez — Dönem tab'ına ait
- Reddedilenler scroll altında yok — bildirim + dönem ekranı filtresi

### 2.6 Alt Navigasyon (4 tab)
- Ana Sayfa / Dönem / Ara / Mesajlar
- Floating bar: Tabana yapışık DEĞİL — 12px margin, yuvarlak köşeli (16px radius), neumorphic gölge
- Yükseklik: 58-62px, ikon boyutu 22-23px
- Aktif tab: Turuncu (#E8962E veya #B07830 light temada)

### 2.7 FİŞ TARA Pulse Animasyonu
- İlk açılışta (onboarding sonrası) bir kez hafif pulse — dikkat çeksin
- Sonraki girişlerde animasyon yok
- İmplementasyon aşamasında yapılacak

### 2.8 Tasarım Durumu (v6d — 16 Mayıs 2026)
- Light tema layout oturdu — disk, butonlar, ok, floating nav dengeli
- Kalan işler (Claude Design limiti açılınca): dark tema, specular highlight, grain dokusu, ikon opacity

---

## 3. OCR SONUÇ EKRANI

> **⚠ GÖRSEL DETAYLAR SIFIRLANDI** — Confidence renk kodları, font ölçüleri, piksel değerleri v8 demo'sundandır. İş akışı mantığı (confidence mimarisi, state 2 davranışı, 3 katmanlı kontrol) geçerlidir.

### 3.1 Confidence Mimarisi (tüm fazlar)
- Confidence arka planda HER ZAMAN çalışır
- Tüm confidence verileri Supabase'de kayıt altında
- Faz farkı sadece kullanıcıya ne gösterildiği

### 3.2 Saha Ekranı — OCR Sonuç Formu

**Header:** "Belge ile karşılaştırın" (× butonunun solunda, ince metin)
- State 2'de yanında "Kontrol gerekli" badge

**Confidence göstergesi (OCR metin bloğunun üstünde):**
- 3 alan yüzdesi yan yana: `Satıcı %92 · Tutar %87 · KDV %84`
- Label: 10px, weight 500, rgba(255,255,255,0.3), uppercase, letter-spacing 1px
- Yüzde: 13px, weight 600, DM Mono, confidence renginde
- Ayraç (·): rgba(255,255,255,0.15)
- Renk: %80+ yeşil (#4ADE80), %60-79 sarı (#F59E0B), %60↓ kırmızı (#EF4444)
- Alt çizgi: 1px solid rgba(255,255,255,0.06)

**OCR raw metin bloğu:** Fişten okunan ham metin (16px, başlık bold 17px). Fiş thumbnail YOK.

**Açıklama alanı:** Label satırında sağ köşede inline mikrofon ikonu (Lucide mic, 18px). Ayrı sesli not butonu YOK.

**"Diğer alanlar" dropdown (kapalı varsayılan):**
- Satıcı
- Tutar (₺) + KDV (₺) yan yana
- Tarih + Fiş No yan yana
- Kategori
- GİB e-Fatura Doğrula (kompakt buton-satır: label solda, "Doğrula →" sağda; doğrulandıysa "✓ Doğrulandı" yeşil badge)
- Dijital İmza

**Alt:** İptal + Onaya Gönder

**State 2 (herhangi alan < 70):**
- "Kontrol gerekli" badge
- Confidence yüzdeleri sarı/kırmızı
- "Diğer alanlar" otomatik açık
- Düşük alanlarda: sarı label + ⚠ ikon + sarı border + uyarı metni

### 3.3 Muhasebe Ekranı — OCR Verileri
- Tüm confidence verileri her zaman görünür (Faz 2'de renk kodlu bantlar + yüzdeler)

### 3.4 OCR Güvenilirlik Yaklaşımı
- %95 eşiği terkedildi — çok yüksek
- Faz 1 (Model D): OCR → Saha kontrol → Dept onay → Muhasebe onay (3 katmanlı insan)
- Faz 2 (Model B): Üç bantlı renk kodlu (yeşil/sarı/kırmızı), pilotta kalibre edilecek
- Eşik değerleri pilotta Türk fişleriyle belirlenecek

---

## 4. REDDET vs İADE ET AKIŞI

### 4.1 İki Ayrı Aksiyon
- Reddet: Kesin karar, fiş geri dönmez
- İade Et: Saha'ya düzeltme için geri gönder
- İkisi de her zaman aktif — sistem kısıtlama yapmaz, şirket kurallarına bırakılır

### 4.2 İade Sebepleri (10 adet)
1. Veri uyuşmazlığı (isteğe bağlı alan seçimi: tutar/tarih/KDV/işyeri)
2. Tutar hatalı
3. Tarih hatalı
4. KDV bilgisi hatalı
5. İşyeri bilgisi hatalı
6. Belge eklenmemiş (belgesiz girişe belge istemi)
7. Mükerrer giriş (fiş değil — aynı harcamanın tekrar girilmesi)
8. Kişisel harcama
9. Harcama limitini aşıyor
10. Diğer (serbest metin, zorunluluk yok)

### 4.3 Kategori İade Sebebi DEĞİL
- Dept tek tıkla kategoriyi düzeltir — iade etmekten çok daha hızlı

### 4.4 Dept Şefi Düzeltme Yapmaz
- Hatayı yapan düzeltir prensibi

### 4.5 Anomali Motoru Bağlantısı
- Her iade sebebi = anomali motoru sinyali
- Supabase'de iade logları: kullanıcı + sebep + alan + tarih + tutar
- Muhasebe dashboardunda "iade pattern analizi" kartı

---

## 5. DÖNEM EKRANI (Saha tab 2)

### 5.1 Filtre
- Dropdown formatında
- İçerik: Duruma göre (tümü / bekleyen / onaylanan / reddedilen / iade edilen) + kategoriye göre
- Detaylı içerik henüz konuşulmadı

### 5.2 Reddedilen Fişlerin Yeri
- Ana ekran scroll altında DEĞİL
- Bildirimden gelir + dönem ekranında durum etiketi
- Filtre ile filtrelenebilir

---

## 6. ŞİRKET KURALLARI
- Supabase şemasında project_rules tablosu
- Faz 1: Sabit varsayılanlar
- Faz 2: Yapılandırılabilir

---

## 7. i18n (Çoklu Dil)

### 7.1 Strateji
- Dil seçimi ekranı tasarlandı (dropdown, mail ekranı içinde)
- i18n implementasyonu (tr.json/en.json) tasarım revizyonu + C13 bittikten sonra

### 7.2 Dil Yönetimi
- Herkes kendi dilini seçer (4 rol)
- Muhasebe proje oluştururken default dil belirleyebilir
- Kullanıcı kendi tercihini override edebilir
- İlk girişte bir kez seçilir, profil ayarlarından değiştirilebilir

---

## 8. YAPILACAK TASARIM İŞLERİ

> **⚠ SIFIRLANDI** — Aşağıdaki liste v8 demo dönemine aittir. Yeni tasarım session'ında sıfırdan planlanacak.

### Tamamlanan
- [x] Giriş akışı kararları
- [x] Dil seçimi ekranı tasarımı
- [x] Saha ana ekran layout (light tema, v6d)
- [x] OCR sonuç ekranı yapısal kararlar
- [x] OCR sonuç ekranı implementasyonu (commit 226d4ae, feacdd2)

### Sıradaki
1. OCR sonuç ekranı görsel tasarım
2. Saha ana ekran dark tema
3. Saha ana ekran doku iyileştirme (grain, specular)
4. Proje seçim ekranı tasarımı
5. Dönem ekranı (filtre dropdown dahil)
6. Dept kart yapısı revizyonu (B3)
7. Muhasebe dashboard + kart yapısı (B4-B5)
8. Kısmi onay UX revizyonu (B11)

---

## 9. RAKİP ANALİZİ REFERANSLARI
- 12 firma analizi (7 global + 5 TR): docs/PRODAPP-RAKIP-ANALIZI-OCR.md
- Masraff (TR) en gelişmiş confidence modeli
- Sektör standardı: %80-85 başlangıç eşiği, üretimde ayarlanır
- PRODAPP farkı: 3 katmanlı insan kontrolü zaten var, ayrı HITL queue gerekmez

---

## Supabase Şema Kararları (20 Mayıs 2026)

### SK-1: Dönem = departman bazlı kapama
Tek bir dönem açılır ama kapama departman bazlı takip edilir. Her saha elemanı kendi kapamasını verir, dept şefi departman kapamasını verir, muhasebe tümünü onaylar. Kademeli kapama zinciri: saha → dept → muhasebe.

### SK-2: Kapama takvimi
Muhasebe dönem açarken üç deadline belirler: saha kapama tarihi, dept kapama tarihi, muhasebe kapama tarihi. Takvim aşımı is_late olarak işaretlenir.

### SK-3: İki katmanlı kategori sistemi
Genel fiş kategorisi (yakıt, yemek, kira — tüm departmanlar ortak) + departman alt kategorisi (sanat → dekor, aksesuar, marangoz). Faz 1: serbest text. Faz 2: yapılandırılmış yönetim.

### SK-4: Kural versiyonlama — geriye dönük uygulanmaz
Kural değişikliği (ör: yemek limiti 100→150 TL) kapanmış dönemlere uygulanmaz. Dönem kapanınca o anki kurallar rules_snapshot olarak dondurulur. periods.rules_snapshot JSONB alanı bu amaçla eklendi.

### SK-5: closed_by_override terminolojisi
"Zorla kapama" yerine endüstri standardı "closed_by_override" kullanılır (NetSuite Override Period Restrictions, Oracle Closed/Permanently Closed referansları). Gerekçe (override_reason) zorunlu.

### SK-6: Dönem statüleri
open → partially_closed → closed → permanently_closed. Ayrıca period_closings seviyesinde: open, submitted, approved, disputed, closed_by_override, reopened.

### SK-7: İstisna izin tipleri (Faz 1)
late_entry (geç giriş), reopen (tekrar açma), limit_override (limit aşımı). İstisna yetki matrisi: saha giremez, dept kendi departmanı için, muhasebe tümü. Faz 2'de genişletilecek.

### SK-8: Project Rules Engine (Faz 2 planı)
Proje bazlı kural matrisi — takvim kuralları, harcama limitleri, yaptırım kuralları, kategori tanımları, istisna kuralları, onay eşikleri. Muhasebe kontrolünde. project_rules tablosu placeholder olarak şemada mevcut.

---

## 10. SUPABASE AUTH

### 10.1 Müşteri Onboarding
- Admin müşteriyi sisteme alır (şirket adı, proje adı, Muhasebe email+ad)
- Sistem: project + user + profile oluşturur, davet maili atar
- App içi minimum veri: şirket adı, proje adı, email, ad soyad

### 10.2 Muhasebe Giriş Sonrası
- Departman oluştur → dönem aç → ekip davet et
- Şirket kuralları Faz 1'de sabit, Faz 2'de yapılandırılabilir

### 10.3 Davet Zinciri
- Admin → Muhasebe → Dept/Saha. Dept → kendi dept Saha (Muhasebe bilgilendirilir)
- Davet: email + ad soyad + rol + dept (invitations tablosu)

### 10.4 Multi-Project
- Aynı kişi farklı projelerde farklı rol alabilir
- Login → proje listesi → seç → claims yazılır → RLS aktif
- profiles_own_list policy: claims'siz kendi profillerini görebilir

### 10.5 Soft Delete
- Muhasebe: is_active=false + soft_deleted_at. Auth hesabı silinmez.
- Başka projelerde aktif kalabilir.

### 10.6 Hard Delete
- Sadece Admin. Mali kayıtlar anonimleştirilir, silinmez. Log zorunlu.
- KVKK md.7: anonimleştirme, TTK 10 yıl saklama.

---

## 11. OTURUM KARARLARI — 26 Mayıs 2026

### G8 — Offline Senaryo
**Karar:** Offline kuyruk uygulanır. Fiş, bağlantı yokken cihazda `draft` statüsüyle saklanır. Bağlantı sağlandığında otomatik sync tetiklenir. Sunucuya ulaşana kadar kayıt taslak sayılır; SSOT ihlali oluşmaz.

### G9 — QR-OCR Akışı
**Karar:** Kamera QR tespit ederse GİB API'ye istek atılır, OCR atlanır. QR okunamazsa veya tespit edilemezse OCR tetiklenir. GİB API için 3 saniye hard timeout; aşılırsa sessizce OCR'a fallback yapılır. Kota riski Milestone 2'de izlenir.

### G10 — Split Ödenmeyen Kısım
**Karar:** Split işleminde ödenmeyen kısım için ayrı bir child receipt oluşturulur. Tek kayıtta alan tutulması yerine parent-child ilişkisi kurulur.

### G11 — Denetçi Modu
**Karar:** Faz 1'de yer almaz. AUTH-KARARLARI.md'deki "sonraya" kararı korunur.

### Dil Seçimi + Onboarding Tutorial
**Karar:** Giriş akışından çıkarıldı. Faz 2'ye taşındı. Faz 1 login ekranı dil seçimi içermez.

---

## 12. BÖLÜM — 26 MAYIS SESSION KARARLARI (2)

### Marka Adı
**Karar:** Uygulama adı KAAPA olarak kesinleşti. Tüm dokümanlarda ve kod tabanında "PRODAPP" ifadesi "KAAPA" olarak kullanılacak.

### Avans Kilitleme ve Kilit Açma
**Karar:** Dekont yüklenip Muhasebe onayladıktan sonra avans kaydı kilitlenir. Hatalı dekont durumunda yalnızca Muhasebe rolü kilidi açabilir. Kilit açma işlemi audit log'a sebep ile birlikte yazılır.

### Saha İtiraz Bildirimi
**Karar:** Saha, kendi avans ekranında "Dekonta İtiraz Et" butonuyla kısa açıklama girer. Muhasebe'ye bildirim gider, Muhasebe inceleyip düzeltir. Sistem dışı iletişim gerekmez.

### Dekont Doğrulama
**Karar:** OCR ile dekont içeriği okunur. IBAN veya tutar uyuşmazsa sistem uyarı gösterir ancak engellemez. Nihai karar Muhasebe'dedir.

### Dept Dekont Yükleme Yetkisi
**Karar:** Dekont yükleme yetkisi Dept'e de verilir. Muhasebe'ye bildirim gider, Muhasebe onaylar veya reddeder. Onayda kayıt kilitlenir.

### Nakit Avans Akışı
**Karar:** Dept nakit avans açar → otomatik aktif olur → Muhasebe bildirim alır, itiraz edebilir (itiraz halinde avans dondurulur) → fiziksel nakit teslimi sistem dışında gerçekleşir → Dept "nakit verildi" işaretler → Saha "nakit alındı" onaylar → çift taraflı teyit tamamlanır.

### Avans Dekont Storage
**Karar:** Supabase Storage, `advances` bucket. RLS ile yalnızca ilgili proje üyeleri erişir. Saha yalnızca kendi avansının dekontunu görür.

### Nakit Avans Muhasebe Onayı
**Karar:** Nakit avansta Muhasebe ön onayı yoktur. Dept açar, otomatik aktif olur. Muhasebe itiraz hakkına sahiptir; itiraz halinde avans dondurulur.

### Hot Cost Zamanlaması
**Karar:** Set wrap saatine bağlıdır, takvim günü değil. Wrap + 2 saat içinde otomatik tetiklenir. Dept kapatmazsa sistem zorla kapatır. Dept "set bitti" diyerek manuel override yapabilir (gece çekimi senaryosu için).

### Hot Cost İçeriği
**Karar:** Tek ekranda rapor formatında: toplam harcanan / bütçeden kalan / departman bazlı dağılım / bütçe sapma yüzdesi. Export edilebilir.

### Hot Cost Görüntüleme Yetkisi
**Karar:** Muhasebe tüm projeyi görür. Dept yalnızca kendi departmanını görür. Saha göremez. Yapımcı rolü Faz 2'de tam yetkiyle eklenecek.

### Mesai Hesaplama
**Karar:** Faz 2'ye taşındı. Expense management kapsamı dışında, HR/payroll alanına giriyor. Tüm ekip listesi (app dışı üyeler dahil) ayrı veri modeli gerektiriyor.
