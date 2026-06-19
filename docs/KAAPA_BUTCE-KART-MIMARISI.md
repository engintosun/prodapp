# KAAPA — BÜTÇE KART MİMARİSİ ve KALEM MEKANİZMASI
*Kalıcı mimari. Bütçe modülünün kart/kalem yapısının ve kalem davranış motorunun TEK KAYNAĞI. TASARIM-KARARLARI.md'den referanslanır.*
*Oluşturma: 19 Haziran 2026. Durum: 1100 ve 1300 KİLİTLİ; 1400'den devam.*

## 1. ETAP (DÖNEM) EKSENİ — zaman ekseni
Beş etap (etap = dönem, aynı eksen): Geliştirme · Yapım Öncesi · Yapım · Yapım Sonrası · Dağıtım ve Teslimat.
- Etap = bir kalemin ödeme/zaman etiketi. Parayı bir karttan başka karta TAŞIMAZ; sadece "ne zaman".
- Her etap ayrı hesaplanır; alt-toplamlar toplanınca genel toplam çıkar.
- Bir kalem birden çok etaba yayılabilir/bölünebilir (örn. hak Geliştirmede başlar, opsiyon ödemesi Dağıtıma sarkar).

## 2. KART = DEPARTMAN (yer)
- Kart (= Harcama Grubu = departman): giderin NEREYE ait olduğu. Kalıcı ev (muhasebe klasörü).
- Kalem: kartın altındaki satır.
- Kart ve Etap iki ayrı eksen, çakışmazlar (Kart=hangi departman; Etap=ne zaman). "Geliştirme hem dönem hem kart olamaz" çelişkisi bu ayrımla biter.
### Temel kural: KULLANAN SAHİPLENİR
Bir kaynağı günlük kim kullanıyorsa kalem onun kartına yazılır. Kostüm kamyonu→Kostüm; genel ekip/havuz aracı→Ulaşım; picture car kontrol Sanat'taysa orada, sürüş/stunt aracıysa Ulaşım; inşaat aracı→İnşaat; vinç şoförü→Grip. "Araç hep Ulaşım'a gider" diye kural YOKTUR.

## 3. GELİŞTİRME — özel durum (recoupable)
- Geliştirme etabının TEK kartı: "Proje Geliştirme ve Haklar".
- Geliştirmeyi ayıran şey geri-ödeme (recoupable): greenlight'ta cepten harcanan kasadan/yatırımcıdan geri tahsil edilir; geliştirme orada biter.
- Tüm geliştirme bu kartta tutulur (genel kartlara DAĞITILMAZ) — recoupment toplamı temiz okunsun diye. Yemek/ulaşım/konaklama = kart içinde tek toplu "Seyahat, Toplantı ve Ağırlama (Travel & Living)" satırı (salt-okunur; alt-döküm arkada). Gün/ay/adet kırılımı YOK; proje-bazlı paket.
- Plan + gerçekleşen ikisi de var; greenlight'ta otomatik "geri tahsil edilecek toplam: X TL" raporu.
- Genel kural farkı: Geliştirme DIŞINDA ortak kalemler kendi genel kartlarında yaşar, etap etiketiyle ayrılır. Geliştirme recoupable olduğu için bilinçli istisna.

## 4. KALEM DAVRANIŞ MOTORU ("not alanı" = davranış)
"Not alanı" sadece serbest metin değil; kalemin kural/uyarı/alt-yapı motoru.
### 4.1 Üç bağ
1. Ait-kart (yer): para tek kartta durur, çift-sayım yok.
2. Onay-köprüsü (kim onaylar): kalem başka karta/role onay köprüsü taşıyabilir; para yerinde, o departman sadece onaylar. → harcama-kartı ≠ onay-birimi.
3. Risk-bayrağı (anomali): kalem eksik/hatalıysa tetiklenen anomali + sade açıklama notu.
### 4.2 Alias / çapraz-eşleme — İŞARET EDER, KOPYALAMAZ
Bir kalem başka kartı işaret eder, kopyalanmaz. Neden: kopyalansa aynı para iki kartta toplanır (çift-sayım, sektörün en sık hatası). İşaret edince tek fatura tek yerde (toplam doğru), diğer kart bakar ama içine almaz. Getirisi: doğru toplam + iki açıdan görünürlük + tek kaynak/tek değişiklik. Çoklu çalışmada anlamı büyür (bkz. §5).
### 4.3 Ödeme alt-kolonları
Kalem ödeme planı taşıyabilir: peşin/vadeli (haklar), v1/v2/v3/v4 (taslaklar); toplam = kolonların toplamı. Opsiyon kuyruk ödemeleri gerçekleşenden sonra gelebilir → Dağıtım/gösterim-sonrası etabına sarkar, o etap son ödemeye kadar kilit dışı.
### 4.4 Recoupable / iade / depozito (aynı aile)
Ortak doğa: para çıkar, bir kısmı/tamamı geri gelir. Üç biçim: geliştirme avansı, iade (kostüm dönüşü/fazla ödeme), depozito/teminat. İzleme: harcamaya bağlı iade/geri-dönüş kaydı; net = ödenen − iade; brüt/iade/net üçü de görünür.
### 4.5 Salt-okunur toplam
Bazı kalemler kart yüzünde tek toplam gösterir; alt-döküm arkada, toplam oradan beslenir.
### 4.6 Serbest metin notu
Yukarıdakilere EK olarak açıklama için serbest metin notu da bulunur.
### 4.7 Miras: davranış ATOMDA yaşar
Bağ/bayrak/kolon/flag seti kanonik atomda tanımlıdır; kalem atomu çağırınca otomatik miras alır. Örn. "Legal Clearances" atomu: cost_type=Hizmet/Hukuk, onay=Hukuk, risk=E&O.

## 5. ÇOKLU ÇALIŞMA / YETKİ
- Kart-bazlı departman admini: her karta admin atanır; admin yalnız kendi kartını görür/yazar.
- Alias = çapraz-yetki kanalı: departman admini başka karttaki tek ilgili kalemi görüp onaylayabilir (tüm kartı açmadan). Para yine tek yerde.
- Muhasebe (proje sahibi) üstünlüğü korunur: nihai finansal kontrol Muhasebe'de; alias-onayı ara katman, son söz değil.

## 6. KİLİTLİ KARTLAR
### 6.1 KART 1100 — PROJE GELİŞTİRME ve HAKLAR  [KİLİTLİ]
Etap: Geliştirme · tüm kart RECOUPABLE · not alanı kalem-seviyesinde · 1108 salt-okunur toplam.
- 1101 Hikâye-Senaryo-Haklar: recoupable · ödeme alt-kolonları · 0-bedel anomali bayrağı · opsiyon→Dağıtım sarkar. Alt: Hak Satın Alma (peşin/vadeli) / Opsiyon / Opsiyon Uzatması / Yazım-Taslaklar (v1-v4) / Danışman-Editör / Sinopsis-Treatment / Script Report-Reader Fee
- 1102 Yapımcı (Producers Unit): recoupable. Alt: Yapımcı geliştirme ücreti / Ortak-Yardımcı Yapımcı
- 1103 Yönetmen (Directors Unit): recoupable. Alt: Yönetmen geliştirme/attach ücreti
- 1104 Bütçe ve Dosya Hazırlama: recoupable. Alt: Bütçeleme / Sunum dosyası / Görsel-tasarım / Çeviri-tercüme / Teaser-Mood Video Kurgu ve Telifleri
- 1105 Ofis Genel Giderleri: recoupable. Alt: Ofis kirası / Kırtasiye-sarf / İletişim / Kargo-kurye / Yazılım-abonelik
- 1106 Hukuk ve Muhasebe: recoupable. Alt: Avukatlık-sözleşme / Clearance-izin / Mali müşavir / Fon raporlama-denetim / Noter ve Resmî Harçlar
- 1107 Araştırma ve Danışmanlık: recoupable. Alt: Saha-konu araştırması / Uzman danışman / Arşiv-kaynak-telif
- 1108 Seyahat-Konaklama-Yemek-Harcırah: recoupable · SALT-OKUNUR toplam. Alt: Ulaşım-uçak / Konaklama / Yemek-ağırlama / Harcırah / Festival-pazar katılımı
- 1190 Muhtelif: recoupable. Alt: Banka-havale-kur / Beklenmedik küçük giderler
### 6.2 KART 1300 — SENARYO YAZIM & YASAL TEMİZLİK  [KİLİTLİ]
Etap: Yapım Öncesi · RECOUPABLE DEĞİL · Geliştirme'ye bağı YOK (clearance dahil ayrı hesaplanır).
- 1301 Senaryo Yazarı · 1302 Senaryo Doktoru/Editör · 1303 Uzman Danışmanlar · 1304 Araştırma · 1305 Senaryo Odası/Operasyon (Typing & Duplication)
- 1306 Yasal Hak Temizleme (Legal Clearances): 3 bağ → ait-kart=Senaryo (para burada) · onay-köprüsü=Hukuk (6200, departman admini onaylar) · risk-bayrağı=E&O (6105). cost_type=Hizmet/Hukuk. Motorun İLK kurulu örneği.
- 1307 Senaryo Süre Analizi (Script Timing) · 1308 Yazım Dönemi Lojistiği (Travel & Living) · 1309 Kaynak Ağırlama (Entertainment)
ÖNEMLİ — 1200 absorbe: Koster "1200 Story & Other Rights" KAAPA'da AYRI kart DEĞİL; geliştirme hakları 1101'de, yazım 1300'de. Ayrı 1200 kartı açılmaz.

## 7. AÇIK / PARK (ilgili bölümlere gelince)
Recoupable+iade/depozito şema/CFE detayı; percent_lines (Completion Bond/Contingency/Overhead/Insurance, dışlamalı satır-bazlı baz); fringe motoru (%+cutoff/SGK tavanı+biçim+risk); kur farkı/çok-para-birimi; stunt doğa-bölmesi, "Sanat" 6-kart, loan-out fringe, walkie yuvası.
