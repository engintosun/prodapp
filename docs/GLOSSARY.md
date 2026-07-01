# KAAPA — Domain Terimleri Sözlüğü (GLOSSARY)

**Son güncelleme:** 19 Haziran 2026
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
|Kalemin İngilizce adı|description_en |Köster damıtımından gelen sektör-standart İngilizce ad; ekranda görünmez, ileride İngilizce sunum için arka planda saklanır|
|Yük bileşeni |burden_component      |Stopaj/SGK/ajans gibi net-üstü yük           |
|Doğrudan ödeme|direct_payment       |Muhasebenin fiş dışı gerçekleşen kaydı       |
|Yüzde kalemi |percent_line          |Ara toplam üstüne % (öngörülmeyen, kâr)      |
|Birim        |unit                  |gün/hafta/ay/bölüm/sabit (adet/kişi kaldırıldı — Miktar'ın konusu, DILIM-2f-fix2)|
|Oran kataloğu|rate_catalog          |Merkezi vergi/yük oran kaynağı               |
|Kasa (orijinal)|budget_baseline      |Kilit anında bütçenin donmuş fotoğrafı (koy-ve-bak)|
|Şablon (raf)  |budget_template       |Rakamsız bütçe iskeleti; kurulumda fotokopilenir   |
|Tutanak defteri|budget_change_log    |Her değişikliğin kim/ne zaman/eski→yeni izi        |
|Sınav düzeneği|—                     |Para hesabı kurallarının cevap anahtarlı testi     |
|Kalıcı kalem kodu|item_code          |Bütçe içi artan, geri kullanılmayan kalem kimliği  |
|Maliyet nesnesi|cost_object|Kart sınırını aşan transversal iş/öğe etiketi (Stunt, VFX, "Oyuncu: Ahmet"). Bütçe-bazlı kontrollü liste; rollup için. 4. eksen (§4.10). Satır-başına tek (Faz 1)|
|Dönemsiz etap|undated stage|fn_open_budget'ın yarattığı rezerve etap (is_undated=true); döneme bağlanmamış kalemler önce buraya düşer. Mühür tarih-zorlamasından muaf|
|Kalem kodu sayacı|item_code_seq|budgets üzerinde monoton artan sayaç; kalıcı item_code üretir, geri dönmez (silinen kod tekrar verilmez)|

### Bütçe - dönem/nakit terimleri (2026-06-13)

- **Dönem:** Bütçenin zaman dilimi; çağrı kâğıdına bağlı çekim bloklarıyla hizalı, tarih sınırlı. Varsayılan 3 (Hazırlık/Çekim/Post), inceltilebilir.
- **Etap:** Dönemle eş anlamlı (aynı eksen); bütçede zaman/ödeme etiketi. Beş etap: Geliştirme · Yapım Öncesi · Yapım · Yapım Sonrası · Dağıtım ve Teslimat. Kodda: `stage`.
- **Faz:** Dönemin kaba hali; ayrı yapı değil.
- **Ne zaman (kalem):** Kalemin bağlı olduğu dönem(ler). İki eksen — ait-dönem ve nakit-dönem.
- **Ait-olduğu-dönem:** Kalemin bütçede karşı geldiği dönem (maliyet/karşılaştırma kapısı).
- **Nakdin-çıktığı-dönem:** Paranın fiilen çıktığı/gerektiği dönem (nakit akışı kapısı).
- **Nakit matrisi:** Kalemler x dönemler görünümü; dönem başına nakit ihtiyacı.
- **Yuvarlama sözleşmesi:** Öngörülen taraf tam TL (ROUND_HALF_UP, önce-yuvarla-sonra-topla), gerçekleşen kuruşta. Detay: TASARIM-KARARLARI.md D bölümü.
- **Kalem-dönem köprüsü (budget_item_periods):** Bir kalemi dönemlere bağlayan ara kayıt listesi; her kalem-dönem çifti tek satır, o dönemdeki miktarı tutar. Tek-dönemlik kalem = bu listede tek satır.

### Bütçe - kart mimarisi ve kalem motoru terimleri (2026-06-19)

- **Kullanan sahiplenir:** Bir kaynağı günlük kim kullanıyorsa kalem onun kartına yazılır. "Araç hep Ulaşım'a gider" gibi kategori-bazlı sabit kural YOK; kullanıcı belirler.
- **Recoupable (geri-alınabilir):** Geliştirme döneminde cepten harcanan, greenlight'ta kasadan/yatırımcıdan geri tahsil edilen gider. Geliştirme kartı tamamen recoupable; diğer kartlar değil.
- **Onay-köprüsü:** Kalem davranış motorunun ikinci bağı. Para ait-kartta durur; onay yetkisi başka karta/role köprülenir (harcama-kartı ≠ onay-birimi). Kodda temsil: kalem metadata alanı.
- **Risk-bayrağı:** Kalem davranış motorunun üçüncü bağı. Kalem eksik/hatalıysa otomatik tetiklenen anomali kodu + açıklama notu (örn. E&O = Errors & Omissions riski).
- **Alias / çapraz-eşleme:** Bir kalemin başka kartı İŞARET ETMESİ (kopyalama değil). Tek fatura tek yerde toplanır (çift-sayım önlenir); diğer kart görür ama içine almaz. Çoklu çalışmada çapraz-yetki kanalı olarak da kullanılır.
- **Departman admini:** Kart-bazlı yetki sahibi. Yalnız kendi kartını görür/yazar; alias ile başka karttaki tek ilgili kalemi onaylayabilir (tüm kartı açmadan). Muhasebe her zaman üst yetki.
- **Ödeme-statüsü (loan-out):** Bir işçilik kaleminin ödeme biçimi (Bordro / SMM / Şirket-faturası / Loan-out). Fringe'in hesaplanıp hesaplanmayacağını ve nereye gideceğini belirler. Kodda: kalem metadata boyutu.
- **Loan-out:** Kişinin gelirini şahıs/limited şirketi üzerinden faturalandırması (TR karşılığı: şahıs şirketi/SMM). Fringe yönünü değiştirir.
- **Çift-fringe guard:** Anomali kuralı. Şirket-faturası/SMM/Loan-out statülü kaleme otomatik SGK/Bordro fringe binmesini engeller (çift-vergilendirme önleme).
- **Crew Overlap Guard:** Anomali kuralı. Aynı kişinin iki ayrı kartta maaş/ücret alması (mükerrer personel/çift maaş) taraması. Tüm kartlarda aktif.
- **Milestone uyuşmazlık denetimi:** Hakediş taksitinin bağlı olduğu teslim kilometre taşıyla (örn. yönetmen kaşesi ↔ kurgu onayı) uyum kontrolü; teslim olmadan fatura → erken ödeme uyarısı.
- **Görünürlük maskesi (Privacy Toggle):** Hassas kartın/satırın set rollerine arayüzde maskelenmesi. DB'de Muhasebe erişimi tamdır (kör nokta değildir). "Kör nokta" terimi anomali motoruna aittir, görünürlük için kullanılmaz.
- **Maskeli kart / Tam maske / Kısmi maske:** Kart görünürlük seviyeleri. Tam maske=set rollerine tümü kapalı (1100,1400); Kısmi maske=baş-kaşe gizli, operasyonel satır açılabilir (1300,1500).
- **Gizli satır (hidden row):** Kart açık olsa bile içindeki tek satırın set rollerine gizlenmesi.
- **ATL baş-kaşe deseni:** ATL kartlarında baş-kaşe (yönetmen/yazar/yıldız kaşesi) set rollerine daima gizli; ekip satırları açılabilir. Baş-kaşe çoğul olabilir.
- **Master/Owner:** Muhasebe'nin üstündeki proje sahibi Yapımcı (ve ayrı Denetmen/Auditor) katmanı. 1400 ticari yatak odası bu katmana ait.
- **Compliance Guard:** Şablon-bağlamlı uyumluluk denetimi. Seçili Hedef Mecra'nın (Eurimages/Netflix/TRT/Bakanlık) sınırlarına göre yüzde-kalemleri denetler. Teşhis+uyarı verir, gizleme reçetesi vermez.
- **Hedef Mecra (Bütçe Şablonu):** Bütçenin sunulacağı kurum (Eurimages/Netflix/TRT/Bakanlık). Compliance Guard'ın denetim bağlamını belirler.
- **Rol-etiketi:** Tek kalemin altında gerçek sözleşmesel rol ayrımı (örn. 1401: Executive/Line/Coordinating/Supervising). Kalem katlanır, etiket gerçek ayrım taşır.
- **Salt-okunur toplam:** Kart yüzünde tek toplam gösteren, alt-dökümü arkada tutulan kalem (örn. 1108).

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
