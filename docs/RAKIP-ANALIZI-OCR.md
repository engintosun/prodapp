# KAAPA Rakip Analizi — OCR Tabanlı Harcama Otomasyonu

**Tarih:** 15 Mayıs 2026  
**Amaç:** OCR doğruluk oranları, confidence score yaklaşımları, onay akışları ve KAAPA için çıkarımlar  
**Kaynak:** Web araştırması — vendor sayfaları, bağımsız benchmarklar, kullanıcı incelemeleri

---

## 1. GLOBAL FİRMALAR (7 Firma)

### 1.1 Expensify (ABD)
- **Ürün:** SmartScan — mobil fiş tarama + masraf yönetimi
- **OCR yaklaşımı:** Kendi OCR + parser kütüphanesi + insan doğrulaması (HITL)
- **Doğruluk iddiası:** %98.6 (pazarlama). CSO itirafı: "Dünyadaki en iyi OCR bile gerçek dünya fişlerinde %85'in üzerinde güvenilir sonuç veremiyor"
- **Confidence score:** Kullanıcıya gösterilmiyor. Arka planda karar veriliyor
- **OCR sonrası akış:** OCR dene → güvenmiyorsan insana gönder → insan doğrulasın
- **İnsan katmanı:** 2009'dan beri Amazon Mechanical Turk kullanmış, sonra özel iç ekibe taşımış. Düşük güvenilirlikte "güvenli teknisyenler" devreye giriyor
- **Onay:** Özelleştirilebilir politika motoru, otomatik kategorizasyon
- **Güçlü:** Devasa veri seti (milyonlarca fiş), sürekli öğrenme, marka bilinirliği
- **Zayıf:** İnsan maliyeti, KVKK/GDPR riskleri (3. parti işçilere kişisel veri), Türkçe fiş desteği sınırlı
- **KAAPA için:** İnsan katmanı modeli uygulanamaz (maliyet + KVKK). Ama "OCR tek başına yetmez" gerçeği önemli

### 1.2 Veryfi (ABD, API-first)
- **Ürün:** Receipt OCR API — geliştirici odaklı
- **OCR yaklaşımı:** Deterministic AI, çoklu model
- **Doğruluk iddiası:** %98+ genel, %99.56 satır bazlı (kendi benchmark). Gerçek dünya: %90+ alan bazlı
- **Confidence score:** İki katmanlı — OCR skoru (metin doğru okundu mu?) + alan skoru (doğru alana eşleşti mi?)
- **Eşik önerisi:** Minimum 0.7-0.9 arası, kullanım senaryosuna bağlı. "Körü körüne güvenme" uyarısı
- **OCR sonrası akış:** API sonucu + confidence skorları → müşteri kendi iş kurallarını üzerine kurar
- **Güçlü:** İki katmanlı skor sistemi (OCR + alan), hız (<3 sn), sahte fiş tespiti, 91 para birimi / 38 dil
- **Zayıf:** Sadece API — UI yok, iş akışı yok, onay mekanizması yok. Müşteri kendisi kurmalı
- **KAAPA için:** İki katmanlı confidence modeli mimari referans olabilir. Alan skoru konsepti (tutar doğru alana mı düştü?) KAAPA için geçerli

### 1.3 Dext (İngiltere, eski Receipt Bank)
- **Ürün:** Muhasebeci odaklı belge yakalama + muhasebe yazılımı entegrasyonu
- **OCR yaklaşımı:** Template tabanlı + AI
- **Doğruluk iddiası:** %99.9 (pazarlama). Bağımsız test (Zerentry, 200 belge): %82-95 alan bazlı
- **Confidence score:** Kullanıcıya gösterilmiyor. İstisna bazlı bayrak kaldırma
- **OCR sonrası akış:** OCR oku → doğru kabul et → kural ihlali/tutarsızlık varsa bayrak kaldır → istisnalar insana
- **Onay:** Muhasebeci kontrol eder, özelleştirilebilir kurallar
- **Güçlü:** 700K+ müşteri, 320M+ yıllık belge, 11.500+ banka/platform entegrasyonu, toplu işleme
- **Zayıf:** Pazarlama vaadi ile bağımsız test sonucu arasında ciddi fark (%99.9 vs %82-95). Template tabanlı — standart dışı formatlarda düşüyor
- **KAAPA için:** Pazarlama iddialarına güvenme, pilotta kendi testini yap. Template tabanlı yaklaşım Türk fişlerinin çeşitliliği için riskli

### 1.4 Klippa DocHorizon (Hollanda)
- **Ürün:** OCR SDK + API, belge işleme platformu
- **OCR yaklaşımı:** AI tabanlı, template'siz
- **Doğruluk iddiası:** %99'a kadar (iyi yapılandırılmış fişlerde). Kendi itirafı: "Hiçbir OCR %100'e ulaşamaz"
- **Confidence score:** Var, ama detay paylaşılmıyor
- **OCR sonrası akış:** Mobil SDK'da gerçek zamanlı geri bildirim ("belgeyi yaklaştır", "ortam çok karanlık", "kamerayı sabit tut") → OCR → sonuç
- **Çekim anında kalite kontrolü:** En farklılaştırıcı özelliği bu — fotoğraf çekilmeden önce kullanıcıyı yönlendiriyor
- **Güçlü:** Sahte fiş tespiti (QR/barkod doğrulama), çoklu dil, GDPR uyumlu, çekim anı yönlendirmesi
- **Zayıf:** Fiyatlandırma şeffaf değil, kurumsal satış odaklı
- **KAAPA için:** Çekim anında kalite kontrolü konsepti çok değerli. Set ortamında kötü ışık/bulanık fotoğraf sık — çekmeden önce uyarı vermek fiş kalitesini artırır ve OCR doğruluğunu yükseltir. Faz 2 feature

### 1.5 Mindee (Fransa)
- **Ürün:** Document AI API — geliştirici odaklı
- **OCR yaklaşımı:** Ensemble model — birden fazla model aynı alanı okur, uyuşma derecesi = güven skoru
- **Doğruluk iddiası:** Kendi benchmark'ında 1000 fiş üzerinde toplam tutar alanında %86.1 (±%3.2 hata payı). En dürüst veriyi paylaşan firma
- **Confidence score:** 3 renk kodlu bant — Yüksek (yeşil, otomatik geç), Orta (sarı, koşullu mantık), Düşük (kırmızı, insana gönder)
- **OCR sonrası akış:** Yüksek confidence → otomatik onay → ERP'ye. Orta → koşullu mantık veya insan. Düşük → insan incelemesi. Düzeltmeler geri besleme ile modeli iyileştiriyor (RAG)
- **Güçlü:** En şeffaf doğruluk verileri, renk kodlu 3 bant modeli sektör standardı, sürekli öğrenme, ücretsiz benchmark aracı
- **Zayıf:** Bağımsız benchmark karşılaştırması yok (kendi verisi), API odaklı — UI/iş akışı yok
- **KAAPA için:** 3 bantlı renk kodlu model KAAPA'nın Faz 2 confidence mimarisi için referans. Ensemble yaklaşımı (çoklu model uyuşması) güvenilirliği artırıyor

### 1.6 Nanonets (Hindistan/ABD)
- **Ürün:** ML tabanlı belge işleme API
- **OCR yaklaşımı:** Deep learning, özel eğitim ile iyileşen
- **Doğruluk iddiası:** Kutudan çıktığı haliyle %93-96, özel eğitimle %98+
- **Confidence score:** Var ama detay sınırlı
- **OCR sonrası akış:** API sonucu → müşteri kendi iş akışını kurar. İstisna yönetimi UI'ı rakiplere göre zayıf
- **Güçlü:** Fiyat/performans oranı iyi ($499-999/ay), özel eğitim ile hızla iyileşiyor, API-first
- **Zayıf:** Exception handling UI zayıf, teknik ekip gerektirir, müşteri desteği eleştirileri
- **KAAPA için:** "Başlangıçta düşük, kullanıldıkça öğrenen" model ilginç — KAAPA pilotta aynı mantıkla kalibre edebilir

### 1.7 Rossum (Çekya/AB)
- **Ürün:** Cognitive data capture — fatura/belge işleme platformu
- **OCR yaklaşımı:** Spatial OCR + neural network, template'siz, insan gibi okuma
- **Doğruluk iddiası:** %95-98 alan bazlı, sürekli öğrenme ile iyileşiyor. 40+ dil
- **Confidence score:** Ayarlanabilir eşik. Örnek kullanıcı (FINN): %80 eşik → üstü otomatik, altı insana
- **OCR sonrası akış:** OCR → confidence eşiği kontrolü → üstü otomatik geçer → altı "validation station"da insan inceler → düzeltmeler modele geri beslenir → zamanla otomatik oran artar
- **Onay:** Sınırsız workflow adımı, koşullu yönlendirme (tutar bazlı, departman bazlı), otomatik + insan karma
- **Güçlü:** En gelişmiş HITL modeli, sürekli öğrenme kanıtlanmış, SAP/Oracle/NetSuite entegrasyonu, 276 dil
- **Zayıf:** Kurumsal fiyatlandırma (KOBİ için pahalı), ilk eğitim süresi, özelleştirme sınırlı olabilir
- **KAAPA için:** Confidence eşiği + validation station + geri besleme döngüsü en olgun model. %80 başlangıç eşiği sektör pratiği

---

## 2. TÜRKİYE FİRMALARI (5 Firma)

### 2.1 Masraff (masraff.ai / masraff.co)
- **Ürün:** Kurumsal masraf yönetimi platformu — Türkiye'nin en gelişmişi
- **OCR yaklaşımı:** Çoklu model — birincil çıkarma + ikincil doğrulama, çapraz kontrol
- **Doğruluk iddiası:** Yüksek doğruluk (termal fişler, POS, faturalar). Yeni formatlarda düşük başlar, öğrenerek yükselir
- **Confidence score:** VAR — AI güven skoru düşük alanlar otomatik işaretleniyor, kullanıcıdan doğrulama isteniyor
- **OCR sonrası akış:** OCR → güven skoru kontrolü → düşük alanlar vurgulanır → kullanıcı doğrular (ort. 5 sn) → her düzeltme modeli eğitir → onay akışına girer
- **Onay:** 4 seviyeli onay zinciri, vekalet desteği, 4 politika seviyesi (uyarı → engelleme), 16 durumlu yaşam döngüsü, alan bazlı revizyon talebi, değişmez denetim izi
- **Entegrasyon:** SAP, Oracle, Logo, Mikro, Xero dahil 23+ ERP/muhasebe sistemi
- **Güçlü:** Türkçe fiş konusunda en güçlü, confidence score tabanlı akıllı yönlendirme (TR'de tek), sürekli öğrenme, kapsamlı onay mekanizması, çoklu dil desteği
- **Zayıf:** Kurumsal fiyatlandırma (KOBİ erişimi?), sektöre özel değil (genel masraf yönetimi)
- **KAAPA için:** En ciddi rakip/referans. Confidence score yaklaşımı + 4 seviyeli onay + sürekli öğrenme modeli KAAPA'nın hedeflediği yapıya en yakın. Fark: KAAPA sektöre özel (film prodüksiyon), Masraff genel kurumsal

### 2.2 Bizigo (bizigo.com)
- **Ürün:** Kurumsal seyahat + masraf yönetimi — Türkiye'nin ilk masraf kartı (VISA)
- **OCR yaklaşımı:** OCR ile fiş üzerinden tutar, fiş numarası, KDV otomatik çekilir
- **Doğruluk iddiası:** "Yüksek doğruluk oranı" — spesifik rakam paylaşılmıyor
- **Confidence score:** YOK — her fişte kullanıcı doğrulaması yapılıyor
- **OCR sonrası akış:** Fotoğraf çek → OCR oku → sonucu kullanıcıya göster → kullanıcı doğrula → onaya gönder. Fiş eklenmezse kart kapanıyor (zorunlu belge politikası)
- **Onay:** Rol, limit ve matris bazlı esnek onay akışları, politika motoru, bütçe etkisi görünürlüğü
- **Entegrasyon:** ERP ve muhasebe sistemlerine doğrudan aktarım
- **Güçlü:** Masraf kartı entegrasyonu (kart işlemi = otomatik taslak), seyahat yönetimi ile tek platform, güçlü politika motoru
- **Zayıf:** OCR teknik detay/doğruluk paylaşmıyor, confidence score yok, sektöre özel değil
- **KAAPA için:** Kart entegrasyonu KAAPA için geçerli değil (film sektöründe avans sistemi farklı). Ama politika motoru ve zorunlu belge kuralı konsepti referans olabilir

### 2.3 Logo İşbaşı (isbasi.com)
- **Ürün:** KOBİ'lere yönelik ön muhasebe platformu (Logo Yazılım)
- **OCR yaklaşımı:** Basit OCR — fotoğraf çek, oku, gider kaydı oluştur
- **Doğruluk iddiası:** Paylaşılmıyor
- **Confidence score:** YOK
- **OCR sonrası akış:** Fotoğraf çek → OCR oku → gider kaydı oluştur → görsel arşivle → Mali Müşavir Panelinden görüntüle. Kullanıcı kontrol edip gerekirse düzeltir
- **Onay:** Basit — kurumsal onay akışı yok, mali müşavir paneli ile kontrol
- **Entegrasyon:** Logo ekosistemi (e-fatura, e-arşiv, banka, CRM)
- **Güçlü:** Ücretsiz fiş okuma özelliği, Logo ekosistemi ile doğal entegrasyon, KOBİ erişilebilirliği, mali müşavir paneli
- **Zayıf:** Confidence score yok, kurumsal onay akışı yok, basit OCR, sektöre özel değil
- **KAAPA için:** KOBİ segmenti hedef kitle değil. Ama "ücretsiz fiş okuma + mali müşavir paneli" modeli Muhasebe rolü için referans olabilir

### 2.4 Masraf.AI (masraf.ai)
- **Ürün:** Yapay zeka tabanlı masraf yönetimi — WhatsApp entegrasyonu ile farklılaşıyor
- **OCR yaklaşımı:** Görüntü ön işleme (kontrast, perspektif düzeltme, eğik fiş düzleştirme) + OCR + yapay zeka alan eşleştirme
- **Doğruluk iddiası:** Paylaşılmıyor
- **Confidence score:** YOK — her fişte kullanıcı doğrulaması
- **OCR sonrası akış:** Fotoğraf (kamera veya WhatsApp) → ön işleme → OCR → kullanıcıya göster → kullanıcı doğrula
- **Güçlü:** WhatsApp kanalı (Türkiye'de yaygın kullanım), görüntü ön işleme detaylı, kullanımı kolay
- **Zayıf:** Confidence score yok, kurumsal onay akışı detayları sınırlı, sektöre özel değil
- **KAAPA için:** WhatsApp kanalı film setlerinde işe yarar mı? Set ortamında WhatsApp zaten yoğun kullanılıyor — Faz 2+ düşünülebilir. Görüntü ön işleme teknikleri (perspektif düzeltme) KAAPA'ya da uygulanmalı

### 2.5 Manim (manim.com.tr)
- **Ürün:** Muhasebeci odaklı toplu fiş tarama + muhasebe yazılımı entegrasyonu
- **OCR yaklaşımı:** Yapay zeka tabanlı fiş tarama, otomatik kategorizasyon ve muhasebe hesabı eşleştirme
- **Doğruluk iddiası:** "Hatalı veri girişlerini minimize eder" — spesifik rakam yok
- **Confidence score:** YOK
- **OCR sonrası akış:** Toplu fiş yükle → OCR oku → kategori eşleştir → muhasebe hesabına ata → Luca/Uyumsoft/Logo/Netsis'e aktar → muhasebeci kontrol eder
- **Entegrasyon:** Luca, Uyumsoft, Logo, Netsis
- **Güçlü:** Muhasebeci iş akışına özel (toplu işleme), Türk muhasebe yazılımları ile tam entegrasyon
- **Zayıf:** Saha kullanıcısı yok (doğrudan muhasebeci kullanıyor), confidence score yok, mobil deneyim zayıf
- **KAAPA için:** Farklı segment (B2B muhasebeci aracı). Ama Muhasebe rolü için Türk ERP entegrasyonu referansı

---

## 3. BAĞIMSIZ BENCHMARK VERİLERİ

### Alan Bazlı Doğruluk (Zerentry testi, 200 gerçek belge)
| Firma | Alan Bazlı Doğruluk |
|-------|---------------------|
| Zerentry (AI/LLM tabanlı) | %97-99 |
| ABBYY FineReader | %88-96 |
| Dext | %82-95 |
| AutoEntry | %73-93 |
| Hubdoc | %65-90 |

### Genel OCR Metin Doğruluğu (AIMultiple testi)
| Motor | Genel Doğruluk | Basılı Metin | El Yazısı |
|-------|----------------|--------------|-----------|
| Google Cloud Vision | %98.0 | %99.2+ | Düşük |
| AWS Textract | %99.3 (el yazısı hariç) | %99.2+ | Düşük |
| ABBYY | Yüksek | %99.2+ | Orta |
| Tesseract (açık kaynak) | İyi | %99.2+ | Düşük |

### LLM Tabanlı OCR (AIMultiple testi, Claude 3.5 Sonnet)
- Ortalama başarı oranı: %97 (yüksek + düşük kalite karışık)

### Gerçek Dünya Koşullarında Düşüş
| Koşul | Doğruluk Aralığı |
|-------|------------------|
| Temiz, yüksek çözünürlük | %95-98 |
| Solmuş termal fiş | %80-85 |
| Düşük ışık telefon fotoğrafı | %70-85 |
| El yazısı eklemeler | %80-88 |
| Buruşmuş/kırışmış fiş | %80-85 |

---

## 4. SEKTÖR YAKLAŞIM MODELLERİ

### Model A — Sessiz İnsan Katmanı (Expensify)
- OCR dene → güvenmiyorsan arka planda insana gönder → kullanıcı farkında değil
- **KAAPA için uygun değil:** İnsan maliyeti, KVKK riski, ölçeklenemez

### Model B — Confidence Eşiği + Yönlendirme (Rossum, Mindee, Veryfi, Masraff)
- Eşik üstü otomatik geç, altı insana gönder veya kullanıcıya doğrulat
- Düzeltmeler modele geri beslenir, zamanla otomatik oran artar
- Başlangıç eşiği: genelde %80-85
- **Sektör standardı — KAAPA Faz 2 hedefi**

### Model C — Otomatik Güven + İstisna Yönetimi (Dext)
- OCR sonucu = doğru kabul et, sadece kural ihlalinde bayrak kaldır
- En agresif yaklaşım, bağımsız testlerde doğruluk iddiaları tutmamış
- **KAAPA için riskli**

### Model D — OCR + Kullanıcı Doğrulaması (Bizigo, Logo İşbaşı, Masraf.AI, Manim)
- OCR oku → sonucu kullanıcıya/muhasebeciye göster → insan doğrulasın
- Confidence score yok, her fiş insan kontrolünden geçer
- **Türkiye pazarı standardı — KAAPA Faz 1 yaklaşımı**

---

## 5. KAAPA İÇİN ÇIKARIMLAR VE KARARLAR

### Faz 1 (Pilot)
- **Model D** ile git: OCR sonucunu Saha kullanıcısına göster → kullanıcı kontrol edip onaylasın → Dept onaylasın → Muhasebe onaylasın
- 3 katmanlı insan incelemesi zaten mevcut akışa gömülü
- Pilotta gerçek Türk fişleriyle Google Vision'ı test et, veri topla
- %95 eşiği terkedildi — çok fazla fişi belgesiz tarafa atar

### Faz 2 (Confidence Bantları)
- **Model B**'ye geç: 3 bantlı renk kodlu sistem (Mindee referans)
  - Yeşil (%90+): OCR sonucu gösterilir, kullanıcı hızlı onay
  - Sarı (%70-90): Düşük güvenilirlikli alanlar vurgulanır, kullanıcı kontrol eder
  - Kırmızı (%70 altı): "Bu fiş okunamadı" — tekrar çek veya belgesiz girişe dönüştür
- Eşik değerleri pilottaki gerçek verilerle kalibre edilecek
- Supabase şemasında `project_rules` tablosunda confidence eşikleri tutulabilir

### Faz 2+ (Gelişmiş Özellikler)
- Çekim anında kalite kontrolü (Klippa referans) — "kamerayı sabit tut", "ortam karanlık" uyarıları
- Sürekli öğrenme (Masraff/Rossum referans) — kullanıcı düzeltmeleri modeli eğitir
- WhatsApp fiş gönderimi kanalı (Masraf.AI referans) — set ortamında değerlendirilmeli
- Sahte/mükerrer fiş tespiti (Masraff/Klippa referans)

### KAAPA'nın Farklılaştırıcı Konumu
- **Sektöre özel:** Hiçbir rakip film prodüksiyona özel değil. Hepsi genel kurumsal masraf yönetimi
- **3 katmanlı insan incelemesi doğal:** Saha → Dept → Muhasebe zaten sektörün iş akışı
- **Set ortamı gerçekliği:** Düşük ışık, acele, tek elle çekim — çekim anı yönlendirmesi kritik
- **Avans sistemi:** Film sektörüne özel avans-harcama döngüsü, rakiplerde yok
- **GİB entegrasyonu:** Türk fişlerine özel QR/karekod doğrulama, rakiplerde sınırlı

---

## 6. project_rules / company_policies TABLOSU (Supabase Notu)

### Faz 1 — Sabit Varsayılanlar
```
project_rules (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  rule_key TEXT NOT NULL,        -- örn: 'ocr_confidence_green', 'approval_levels', 'receipt_required'
  rule_value JSONB NOT NULL,     -- örn: {"threshold": 0.90}, {"levels": 3}, {"required": true}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```
Faz 1'de bu tablo sabit seed verisiyle doldurulur, UI'dan değiştirilemez.

### Faz 2 — Yapılandırılabilir
- Muhasebe rolü proje kurallarını UI'dan düzenleyebilir
- Onay eşikleri, kategori kısıtlamaları, harcama limitleri, confidence bantları şirket bazlı ayarlanabilir
- Değişiklik loglanır (audit trail)

---

*Bu dosya canlı tutulacak — yeni rakip bulguları, pilot sonuçları ve mimari kararlar eklendikçe güncellenecek.*
