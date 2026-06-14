# KAAPA — Domain Terimleri Sözlüğü (GLOSSARY)

**Son güncelleme:** 22 Mayıs 2026
**Kural:** Her domain terimi tek İngilizce karşılık alır. Bir terim iki farklı kelimeyle temsil edilmez. Kodda sadece İngilizce karşılık kullanılır.

-----

## Ana Terimler

|Türkçe       |İngilizce (kodda)     |Açıklama                                     |
|-------------|----------------------|---------------------------------------------|
|Fiş          |receipt               |Harcama belgesi (kağıt fiş, fatura fotoğrafı)|
|Fatura       |invoice               |Resmi fatura — fiş'ten ayrı kullanılacaksa   |
|Harcama      |expense               |Genel harcama kaydı                          |
|Avans        |advance               |Ön ödeme, kapanmamış bakiye                  |
|Onay         |approval              |İş akışındaki onay adımı (confirm değil)     |
|Red          |rejection             |Onay zincirinde red                          |
|Düzeltme     |revision              |Geri gönderilen kaydın düzeltilmesi          |
|Departman    |department            |Organizasyon birimi                          |
|Muhasebe     |accounting            |En üst onay rolü (Faz 1)                     |
|Saha         |field                 |Sahada çalışan, fiş giren rol                |
|Proje        |project               |Prodüksiyon projesi (film, dizi, reklam)     |
|Kategori     |category              |Harcama kategorisi (catering, ulaşım vb.)    |
|Bildirim     |notification          |Sistem bildirimi                             |
|Davetiye     |invitation            |Kullanıcı kayıt daveti                       |
|Şüpheli işlem|suspicious_transaction|Kural bazlı tespit sonucu                    |
|Harcırah     |per_diem              |Günlük yolluk/harcırah                       |
|Çıktı        |export                |PDF/Excel dışa aktarım                       |
|Bütçe        |budget                |Öngörülen maliyet planı (dizide bölüm başına)|
|İcmal        |topsheet              |Bütçenin tek sayfa özeti                     |
|Etap         |stage                 |Bütçe içi kısım (Hazırlık/Çekim/Post...)     |
|Harcama grubu|expense_group         |Etap altındaki grup; UI'daki adı "kart"      |
|Harcama kalemi|budget_item          |Grup altındaki bütçe satırı                  |
|Yük bileşeni |burden_component      |Stopaj/SGK/ajans gibi net-üstü yük           |
|Doğrudan ödeme|direct_payment       |Muhasebenin fiş dışı gerçekleşen kaydı       |
|Yüzde kalemi |percent_line          |Ara toplam üstüne % (öngörülmeyen, kâr)      |
|Birim        |unit                  |gün/hafta/ay/bölüm/adet/sabit                |
|Oran kataloğu|rate_catalog          |Merkezi vergi/yük oran kaynağı               |
|Kasa (orijinal)|budget_baseline      |Kilit anında bütçenin donmuş fotoğrafı (koy-ve-bak)|
|Şablon (raf)  |budget_template       |Rakamsız bütçe iskeleti; kurulumda fotokopilenir   |
|Tutanak defteri|budget_change_log    |Her değişikliğin kim/ne zaman/eski→yeni izi        |
|Sınav düzeneği|—                     |Para hesabı kurallarının cevap anahtarlı testi     |
|Kalıcı kalem kodu|item_code          |Bütçe içi artan, geri kullanılmayan kalem kimliği  |

### Bütçe - dönem/nakit terimleri (2026-06-13)

- **Dönem:** Bütçenin zaman dilimi; çağrı kâğıdına bağlı çekim bloklarıyla hizalı, tarih sınırlı. Varsayılan 3 (Hazırlık/Çekim/Post), inceltilebilir.
- **Faz:** Dönemin kaba hali; ayrı yapı değil.
- **Ne zaman (kalem):** Kalemin bağlı olduğu dönem(ler). İki eksen — ait-dönem ve nakit-dönem.
- **Ait-olduğu-dönem:** Kalemin bütçede karşı geldiği dönem (maliyet/karşılaştırma kapısı).
- **Nakdin-çıktığı-dönem:** Paranın fiilen çıktığı/gerektiği dönem (nakit akışı kapısı).
- **Nakit matrisi:** Kalemler x dönemler görünümü; dönem başına nakit ihtiyacı.
- **Yuvarlama sözleşmesi:** Öngörülen taraf tam TL (ROUND_HALF_UP, önce-yuvarla-sonra-topla), gerçekleşen kuruşta. Detay: TASARIM-KARARLARI.md D bölümü.
- **Kalem-dönem köprüsü (budget_item_periods):** Bir kalemi dönemlere bağlayan ara kayıt listesi; her kalem-dönem çifti tek satır, o dönemdeki miktarı tutar. Tek-dönemlik kalem = bu listede tek satır.

-----

## Tehlikeli Türkçe Kökler

Bu kökler birden fazla anlama gelir. Kodda Türkçe kök KULLANILMAZ. Her bağlam ayrı İngilizce karşılık alır.

### `gec` (3 anlam)

|Bağlam         |İngilizce |Örnek kullanım                  |
|---------------|----------|--------------------------------|
|Süresi geçmiş  |overdue   |`isOverdue`, `overdue_count`    |
|Geçmiş kayıtlar|history   |`approvalHistory`, `history_log`|
|Geç giriş      |late_entry|`isLateEntry`, `late_entry_flag`|

### `tip` (4 alan)

|Bağlam        |İngilizce        |Örnek kullanım    |
|--------------|-----------------|------------------|
|Harcama tipi  |expense_type     |`expenseType`     |
|Belge tipi    |document_type    |`documentType`    |
|Bildirim tipi |notification_type|`notificationType`|
|Kullanıcı tipi|user_role        |`userRole`        |

### `durum` (5 değer seti)

|Bağlam          |İngilizce      |Örnek kullanım  |
|----------------|---------------|----------------|
|Fiş durumu      |receipt_status |`receiptStatus` |
|Onay durumu     |approval_status|`approvalStatus`|
|Avans durumu    |advance_status |`advanceStatus` |
|Kullanıcı durumu|user_status    |`userStatus`    |
|Uygulama durumu |app_state      |`appState`      |

### `kat` (çoklu kullanım)

|Bağlam             |İngilizce  |Örnek kullanım|
|-------------------|-----------|--------------|
|Katman (mimari)    |layer      |`dataLayer`   |
|Katılımcı          |participant|`participant` |
|Kat (onay kademesi)|tier       |`approvalTier`|

### `bolum` (2 anlam — YASAK kullanım netleşti)

|Bağlam              |İngilizce|Kural                                        |
|--------------------|---------|---------------------------------------------|
|Dizi bölümü         |episode  |"Bölüm" kelimesi YALNIZ bunu ifade eder      |
|Bütçe içi kısım     |stage    |Türkçesi "etap"; asla "bölüm" denmez         |

**"defter"** terimi kod ve UI'da KULLANILMAZ (2026-06-12, B13).

-----

## Güncelleme Kuralı

Yeni domain terimi eklendiğinde:

1. Önce bu dosyaya eklenir
1. Sonra kodda kullanılır
1. Tehlikeli köklere dikkat — yeni terim mevcut kökle çakışıyorsa ayrı bölüme eklenir
