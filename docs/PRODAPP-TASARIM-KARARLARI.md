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

### 3.1 Confidence Mimarisi (tüm fazlar)
- Confidence arka planda HER ZAMAN çalışır
- Tüm confidence verileri Supabase'de kayıt altında
- Faz farkı sadece kullanıcıya ne gösterildiği

### 3.2 Saha Ekranı — OCR Sonuç Formu

**State 1 — Yüksek Confidence (varsayılan görünüm, üstten alta):**
1. "Belge ile karşılaştırın" — ince metin, minimal, ikon yok (13px, soluk renk)
2. Tek confidence bar — OCR metin bloğunun üstünde (3px, border-radius 2px, doluluk = genel confidence ortalaması, sağ ucunda yüzde yazısı 10px)
   - Renk: %80+ yeşil (#4ADE80), %60-79 sarı (#F59E0B), %60 altı kırmızı (#EF4444)
3. OCR raw metin bloğu — fişten okunan ham metin (font-size 16px, başlık bold 17px)
   - Fiş thumbnail/önizleme YOK — fiş zaten kullanıcının elinde, OCR metni yeterli
4. Açıklama alanı — label satırında sağ köşede inline mikrofon ikonu (Lucide mic, 18px)
   - Ayrı sesli not butonu YOK
   - "Sesli Açıklama" yazısı YOK — sadece ikon
5. "Diğer alanlar ▼" — kapalı, tıklayınca açılır
6. İptal + Onaya Gönder butonları

**"Diğer alanlar" içeriği (açılınca, sırasıyla):**
- Satıcı (düzenlenebilir text input)
- Tutar (₺) + KDV (₺) yan yana
- Tarih + Fiş No yan yana
- Kategori (dropdown)
- GİB e-Fatura Doğrula
- Dijital İmza

**State 2 — Düşük Confidence (herhangi bir alan < 70):**
- Aynı yapı + "Kontrol gerekli" badge ("Belge ile karşılaştırın" yanında, sarı pill)
- Confidence bar sarı veya kırmızı
- "Diğer alanlar" otomatik açık
- Düşük confidence'lı alanların label'ı sarı (#F59E0B) + ⚠ ikonu
- Düşük confidence'lı alanların border'ı sarı (1.5px solid rgba(245,158,11,0.4))
- Alan altında uyarı metni: "Tutar okunurluğu düşük — kontrol edin" gibi

**Confidence hesaplama:**
- Genel confidence = tüm alan confidence değerlerinin ortalaması
- constants.js'teki OCR_CONFIDENCE_THRESHOLD (70) ve OCR_CONFIDENCE_COLORS değişmez
- State tetikleme: herhangi bir alan < 70 → State 2

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

## 8. YAPILACAK TASARIM İŞLERİ (öncelik sırasıyla)

### Tamamlanan
- [x] Giriş akışı kararları
- [x] Dil seçimi ekranı tasarımı
- [x] Saha ana ekran layout (light tema, v6d)
- [x] OCR sonuç ekranı yapısal kararlar
- [x] OCR sonuç ekranı implementasyonu (State 1 + State 2, confidence bar, inline mic)

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
