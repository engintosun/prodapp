# KAAPA — BÜTÇE KART KATALOĞU ve KALEM MEKANİZMASI

*Kalıcı domain kataloğu. Bütçe modülünün kart/kalem yapısının ve kalem davranış motorunun TEK KAYNAĞI. Koster damıtımından ve oturum kararlarından damıtıldı. TASARIM-KARARLARI.md'den referanslanır.*
*Oluşturma: 19 Haziran 2026. Güncelleme: 20 Haziran 2026 (KART 1600 OYUNCU + §4.10 cost_object 4. eksen). Önceki: 19 Haziran (KART 1400/1500 + §4.8/§4.9/§5.1/§6).*
*Durum: KART 1100, 1300, 1400, 1500, 1600 KİLİTLİ; runtime dikey-dilimi (DILIM-3 bordro motoru + genel-desen sökümü) TAMAMLANDI. KÜTÜPHANE TOHUMU 1100 için KAPANDI (DILIM 1100-A, 15 Ağustos 2026, §7.1); 1600 için KAPANDI (KART 1600 M2, 5 Eylül 2026, §7.5 — 4 başlık + 28 atom, heading_id ile); 1300 için KAPANDI (KART 1300 Dilim 1, 3 Ekim 2026, §7.2; 16 atom, kart düz); 1400/1700 tohumu hâlâ sırada.*

---

## 1. ETAP (DÖNEM) EKSENİ — zaman ekseni
Beş etap (etap = dönem, aynı eksen): Geliştirme · Yapım Öncesi · Yapım · Yapım Sonrası · son etap. **Son etabın adı yapım türüne göre değişir (3 Ekim 2026, Engin kararı):** sinema filminde **Dağıtım ve Pazarlama**, dizi ve reklamda **Teslim ve Kapanış**. Gerekçe: dönemin adı, yapımcının o dönemde gerçekten ödediği işi söyler. Sinemada film bittikten sonra yapımcının parası festivale, tanıtıma, kopyaya ve gösterime gider. Dizide ve reklamda dağıtımı kanal, platform ya da ajans yapar; dizide teslim çekim sürerken bölüm bölüm yapılır, son dönemde son teslim, ofisin kapanması, kapanış muhasebesi ve denetim kalır. Dönem adları kodda değil şablonun içinde yazılıdır (`budget_templates.body.stages`) ve şablon yapım türü başına ayrıdır. Film şablonu v7'den beri (göç `20261003150000`) dört dönemle açılır: Yapım Öncesi, Yapım, Yapım Sonrası, Dağıtım ve Pazarlama. Dizi ve reklam şablonları henüz yok; kurulurken son dönemleri Teslim ve Kapanış olur (CURRENT.md Park). Eski ad "Dağıtım ve Teslimat" bu kararla kalktı.
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
- Tüm geliştirme bu kartta tutulur (genel kartlara DAĞITILMAZ) — recoupment toplamı temiz okunsun diye. Yemek/ulaşım/konaklama artık 1108 altında ayrı atomlara bölünmüştür (Ulaşım-Uçak / Konaklama / Yemek-Ağırlama / Harcırah / Festival-Pazar Katılımı / Araç Kiralama — bkz. §7.1 kütüphane tohumu); gün/ay/adet kırılımı İSTEĞE BAĞLIDIR, paket (flat) birimi seçenek olarak kalır. REVİZE (DILIM 1100-A, 15 Ağustos 2026): önceki "tek toplu satır, kırılım YOK" kararı geçerliliğini yitirdi — kütüphane artık kırılımı destekliyor, kullanıcı ister tek paket kalemi ister ayrı atomlar ekler.
- Plan + gerçekleşen ikisi de var; greenlight'ta otomatik "geri tahsil edilecek toplam: X TL" raporu.
- Genel kural farkı (düzeltildi 5 Ekim 2026, Engin): aynı cins ortak kalemlerin (seyahat, konaklama, ağırlama vb.) hem genel bir kartı olur (Seyahat & Konaklama: ekip geneli seyahat, konaklama, harcırah, yemek) hem de gereken kartlarda ayırt edilebilir aileleri (1100 Geliştirme, 1300 Senaryo Yazımı, 1500 Yönetmen birimi). Reddedilen yol, tümünü tek karta toplamaktır: ayrı kartta geliştirme maliyetine eklenemez; bir departmanın ya da kişinin toplam maliyeti kendi seyahatini içermeli; ekip ekonomi, yönetmen business uçar, otel maliyetleri farklıdır, ayrı kartta bunları yeniden ayırmak ek iştir. Geliştirme recoupable olduğu için kendi ailesini taşır. Kartlar arası toplam (toplam seyahat, toplam konaklama) kartla değil gider çeşidi ekseniyle alınır (BUTCE-SEMA-KARARLARI, GİDER ÇEŞİDİ EKSENİ).

- **HAYVANLAR KARTI (6 Ekim 2026, Engin kabulü):** film şablonuna ayrı bir Hayvanlar kartı girer; hayvanla ilgili bütün giderler bu kartta durur: kiralama ya da alım, eğitmen ve bakıcı, nakliye, yem, barınak, veteriner. Kartın kodu, adı ve kütüphanesi kendi turunda. Kaynakların ortak noktası ekosistemi tek yerde tutmalarıdır, ayrıştıkları yer konumdur: MMB 6.1 ve Koster'da Property departmanında ayrı hesap (2508 Animals: Wrangler, Additional Wranglers, Animal Handlers, Training, Animal Rental, Transport, Food, Kennel/Stable/Cage/Box); CNC'de dekor-kostüm bloğunda ayrı başlık (55 Animaux); AICP'de aksesuar ve kostümle birlikte (Props, Wardrobe & Animals); Netflix'te oyun araçlarıyla birlikte kendi hesabı (2600 Picture Vehicles & Animals), HBO'da da aynı satırda. Bakılan kaynakların hiçbiri hayvanı oyuncuların içine koymaz. KAAPA'da tek yer ve tek onaycı kartın tanımıdır; kartı tek kişiye açmanın mekanizması BUTCE-EKRAN-KARARLARI §15'teki kart bazlı yetkidir (kurulmadı). Dublör emsalinden farkı: dublör bir oyuncudur, araç ve mekanik başka departmanların işidir; hayvan ise tek sorumlunun elinde paket olarak gelir. Kart aidiyeti koddan okunmadığı için katalog kodları MMB uyumlu kalabilir (1600'ün 16xx ve 39xx taşıması gibi). Film şablonuna girdiği için her film masasında şablon setiyle sıfır değerle durur. Sözlükteki karşılığı: BUTCE-SEMA-KARARLARI, GİDER ÇEŞİDİ EKSENİ, KARARLAR madde 3. Engin'in gerekçesi (birebir):

> Hayvanlar konusunda ayrı kartm açalım yoksa departman bazlı mı olsun şu an düşünüyorum. kamera önü picture animals casta girebilir. ama bazı durumlarda sanat grubunun altına da gelebilir.
>
> Eğer hayvanı sadece "Sanat" kartının içine eklersek, o hayvanın yemi, ahır kirası veya veteriner faturası sanat yönetmeninin bütçesini şişirecek ve raporlamada kafa karışıklığı yaratacaktır. Aynı şekilde "Cast" içine koyarsak, oyuncu koçu ile hayvan eğitmeni birbirine girecektir.
>
> Ayrı bir ana kart açtığımızda tüm bu ekosistemi tek bir yerde toplayıp, harcama yetkisini (Saturation örneğindeki gibi) tek bir kişiye (Hayvan Eğitmeni veya ilgili prodüksiyon amirine) atayabiliriz. Bu yapım film şablonu için düşündüğüm sen ne diyorsun?

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
### 4.8 Ödeme-statüsü boyutu (loan-out) — YENİ BAĞ
Her işçilik kaleminin bir ödeme-statüsü vardır; bu statü fringe'in (SGK/işveren yükü) nasıl ve nereye hesaplanacağını belirler. Dört statü:
- Bordro: işveren SGK payı + stopaj bütçeye biner (fringe VAR).
- SMM (Serbest Meslek Makbuzu): fatura + KDV; fringe BİNMEZ (yük faturada).
- Şirket-faturası: fatura + KDV; fringe BİNMEZ.
- Loan-out (TR: şahıs/limited şirketi): faturaya öder; bazı durumlarda SGK kişinin adına ayrı bildirilir (işveren payı kuruma gider, şirkete değil).
Kaynak: Koster loan-out kavramı; Eurimages "fringe-inclusive" kilidiyle doğrudan ilişkili. Bu boyut kalem motorunda ŞİMDİ tanımlıdır; fringe HESAPLAMA motoru §8 PARK (henüz açılmadı). Anomali bağı: §4.9 çift-fringe guard.

### 4.9 Genel anomali kuralları (motor, her kartta arka planda aktif)
Aşağıdaki kurallar tek karta değil, TÜM kartlara uygulanır (kart-özel kurallar ilgili kartta belirtilir):
- Çift-fringe / vergi guard: Bir kalemin giriş tipi "Şirket Faturası / Loan-Out / SMM" ise, o satıra otomatik binen SGK/Bordro fringe (%35-40) SIFIRLANIR; sadece KDV/Stopaj dengesi korunur. Çift-vergilendirme uyarısı verilir. (Kaynak: §4.8 ödeme-statüsü.)
- Crew Overlap Guard (ekip çakışma): Aynı kişi (isim/kimlik) iki ayrı kartta maaş/ücret alıyorsa — örn. bir kartta paket ücret, başka kartta haftalık — mükerrer personel/çift maaş uyarısı. ATL↔BTL ve kart↔kart çapraz tarama.
- Geliştirme mahsup kontrolü: Geliştirme etabındaki recoupable avanslar (örn. 1102/1103) ile ana yapım dönemindeki hak edişler (örn. 1401/1403/1501) arasındaki geçiş denetlenir; mahsup edilmemiş avans → mükerrer ödeme uyarısı.
- Milestone uyuşmazlık denetimi: Hakediş taksitleri, bağlı oldukları teslim kilometre taşıyla (örn. 1501 ↔ 5100 Kurgu onay tiki) uyum kontrol edilir; teslim olmadan fatura → erken ödeme/sözleşme ihlali uyarısı.

### 4.10 cost_object (transversal etiket) — DÖRDÜNCÜ EKSEN
Kart=yer, etap=zaman, üst-grup=görsel kart-kümesi'ne EK dördüncü eksen: cost_object = bir maliyetin hangi transversal İŞE/öğeye ait olduğu. Kart sınırını AŞAN toplam içindir (departman toplamı zaten kart'tan bedava gelir; cost_object onun için DEĞİL — bir stunt 3 kartta, bir oyuncu 4 kartta yayıldığında "tüm stunt ne?" için).
- **Model:** MMB "Sets" / Saturation "Tags" (endüstri standardı; MMB Set = satır-başına TEK, Set'e göre rollup/rapor). Satır-başına TEK (Faz 1; çoklu sonra, kapı-açık). Kontrollü liste (budget_cost_objects, bütçe-bazlı) — serbest-metin DEĞİL (typo parçalanması olmaz; "Stunt/stunt" bölünmez).
- **KATEGORİ seviyesi:** "Stunt", "VFX", "Oyuncu: Ahmet", departman-rollup. Sahne-instance (SFX1/SFX2 oto-numara) DEĞİL — o per-sahne ayrım breakdown'ın işidir, KAAPA breakdown KURMAZ (dev ERP kapsamı, kapsam-dışı). Anlamlı isim ("Çatı yangını") raporlanır; "SFX2" kör. Oto-numara + create-uyarı süsü REDDEDİLDİ (MMB/Saturation yapmaz; dropdown kazara tekrarı zaten önler).
- **Oto-etiket:** içsel-cross-cut kütüphane kalemleri kanonik öneri-cost_object taşır (Dublör Koordinatörü / Stunt rig → "Stunt"); eklenince oto-yapışır (bul-veya-oluştur). Bağlama-bağlı kalem (bu sefer stunt'a giden düz kamyon) → opsiyonel dropdown. Çoğu satır boş. **Rutin akışta sıfır zorunlu iş.** (Oto-etiket kütüphane katmanına bağlı; o resmîleşene kadar manuel dropdown.) **PARKTA (24 Eylül 2026, Engin kararı):** oto-etiket de elle seçim de kodda yok. Gerekçe ve tetik: §7.5 24 EYLÜL 2026 KARARLARI, STUNT ETİKETİ PARKTA.
- **Gerçekleşen miras:** receipts.budget_item_id + direct_payments.budget_item_id ZATEN var → fiş kaleme eşleşince cost_object'i miras alır; öngörülen + gerçekleşen tek etiketle dilimlenir, yeni alan yok.
- **Düşük-bahis:** etiket unutulursa bütçe BOZULMAZ — satır kendi kartında doğru durur; sadece opsiyonel cross-cut rollup eksik kalır. Kart toplamları (gerçek bütçe) etiketten bağımsız HER ZAMAN doğru.
- **Şema CANLI (20260620120000, 21 Haziran 2026):** budget_cost_objects (bütçe-bazlı, muhasebe-only) + budget_items.cost_object_id nullable + restrict-silme (kullanımdaki iş silinemez) + B19 iz/updated_at kapsamı + baseline snapshot kapsamı (CFE serializer). Breakdown = gelecek modül (kapı-açık; cost_object'i otomatik besler).

## 5. ÇOKLU ÇALIŞMA / YETKİ
- Kart-bazlı departman admini: her karta admin atanır; admin yalnız kendi kartını görür/yazar.
- Alias = çapraz-yetki kanalı: departman admini başka karttaki tek ilgili kalemi görüp onaylayabilir (tüm kartı açmadan). Para yine tek yerde.
- Muhasebe (proje sahibi) üstünlüğü korunur: nihai finansal kontrol Muhasebe'de; alias-onayı ara katman, son söz değil.

### 5.1 KART GÖRÜNÜRLÜK KATMANLARI — DB-erişim ≠ UI-görünürlük
Çekirdek ilke: Veritabanı seviyesinde Muhasebe rolünün TÜM kartlara tam erişimi vardır (denetim/KVKK için kör nokta YOK — muhasebenin göremediği para = denetlenemeyen para). Arayüzde ise hassas kartlar set rollerine maskelenir (Gizlilik Maskesi / Privacy Toggle) — set alanında bütçe ekranı açıkken istenmeyen gözler hassas rakamları görmesin diye.

NOT: "Kör nokta" terimi bu bağlamda KULLANILMAZ — o terim anomali motoruna ait (sistemin kaçırdığı açık). Burada kullanılan terim: görünürlük maskesi / maskeli kart.

Üç görünürlük seviyesi:

| Seviye | Kartlar | Set rolleri (UPM/Line Producer/1.AD) ne görür |
|---|---|---|
| Tam maske 🔒 | 1100, 1400 | Hiçbir şey — asma kilit, flu kart (veya ağaçta hiç listelenmez) |
| Kısmi maske 👁️ | 1300 (1308 hariç), 1500 (1501 hariç) | Yapımcı isterse tek operasyonel satır salt-okunur açılır |
| Departman-açık | operasyonel kartlar (2100+) | Departman admini kendi kartını görür/yazar |

Üç sabit: Muhasebe = her zaman DB tam açık · Yapımcı/Denetmen (Master/Owner) = tam açık · Anomali motoru = her kartta arka planda her zaman aktif (maske motoru durdurmaz; kör nokta yok).

Satır-seviyesi gizleme (hidden row): Kart açık olsa bile içindeki tek tek satırlar gizlenebilir. Yapımcı, kartın tamamını kapatmak yerine sadece hassas satırları gizleyip operasyonel satırları açar.

ATL baş-kaşe deseni (genel kural): ATL kartlarında baş-kaşe (yönetmen kaşesi 1501, yazar kaşesi, yıldız kaşesi) set rollerine daima gizlidir; operasyonel/ekip satırları (koreograf, storyboard, set öğretmeni, figüran, clearance) yapımcı isterse salt-okunur açılır. Not: baş-kaşe ÇOĞUL olabilir (birden fazla başrol/baş-yönetmen) — hepsi gizli sınıfındadır.

Master/Owner katmanı: Muhasebe'nin üstünde, proje sahibi Yapımcı (ve ayrı Denetmen/Auditor rolü) katmanı. 1400 "ticari yatak odası" (ortaklık payı, mark-up, overhead, komisyon) bu katmana aittir. (Auth tarafı detayı: AUTH-KARARLARI.md.)

## 6. ŞABLON-BAĞLAMLI UYUMLULUK DENETİMİ (Compliance Guard)
Yapımcı bütçeyi kurarken bir Hedef Mecra / Bütçe Şablonu seçer (Eurimages / Netflix / TRT / Bakanlık vb.). Anomali motoru, yüzde-bazlı kalemleri (özellikle 1404 Overhead, 1405 Mark-up) seçili şablonun sınırlarına göre denetler.

Motor felsefesi — SINIR KURALI (kilitli): KAAPA yapımcıya riski ve görünürlüğü gösterir ("bu kalem dışarıdan şöyle görünür", "bu oran şu sınırı aşıyor"). KAAPA gizleme/kaçırma yöntemi ÖNERMEZ ("şuraya böl, fark edilmesin" demez). Sınır: teşhis ve uyarı EVET; gizleme reçetesi HAYIR. Karar her zaman yapımcının.

KAAPA, yapımcının patron olduğunu bilir; onu kısıtlamaz. Sadece dış dünyaya (Netflix/Bakanlık/Eurimages) bütçe sunarken elinin zayıflamasını veya telafi edilemez hata yapmasını engeller.

Üç senaryo (hepsi "teşhis" formatında):
- Overhead tavanı: Eurimages şablonunda 1404+1405 toplamı %7'yi aşarsa → "Hatırlatma: Eurimages'ta Overhead toplam bütçenin %7'sini aşamaz; başvuru reddedilmesin diye kontrol etmek isteyebilirsiniz."
- Mark-up tavanı: Netflix/stüdyo şablonunda 1405 platform tavanını (örn. %10) aşarsa → "Müşteri Politikası Uyarısı: bu platformda genelde max %X Mark-up kabul edilir. Bu fark dışarıdan görünür durumda; nasıl ele alacağınız sizin kararınız."
- Gizli kâr transferi görünürlüğü: Yapımcı şirketi üzerinden hem 1405 (Kâr) hem 1403 (Emek) faturalanmışsa → "Dikkat: karşı tarafın denetim mekanizması bunu 'gizli kâr transferi' olarak yorumlayabilir. Bilginize."

Compliance kuralları = VERİ (koda gömülmez): Şablon sınırları güncellenebilir bir tabloda tutulur (compliance_rules: şablon / kalem / sınır% / kaynak-tarih). Her uyarıda "kaynak: X tarihli kılavuz, doğrulayın" notu — KAAPA'nın verdiği sayı yanlışsa sorumluluk doğmasın diye. (Detay: §8 PARK.)

## 7. KİLİTLİ KARTLAR

### 7.1 KART 1100 — PROJE GELİŞTİRME ve HAKLAR  [KİLİTLİ]
Etap: Geliştirme · tüm kart RECOUPABLE · görünürlük: TAM MASKE 🔒 (set rollerine kapalı) · not alanı kalem-seviyesinde.

**REVİZE (DILIM 1100-A, 15 Ağustos 2026):** Kütüphane tohumu 47 satır (9 başlık + 38 atom). Başlıklar (item_library.is_group=true) para taşımaz, kalem ekleme listesinde görünmez, çapraz-kart taramasına girmez, fn_add_budget_item ile eklenemez — rakamları altındaki atomlardan türer (2 para-seviyesi doktrini, bkz. BUTCE-SEMA-KARARLARI GÖRSEL GRUP). Şablona giren 15 çekirdek atom **S** ile, yalnız kütüphanede kalan 23 atom **K** ile işaretli.

| Kod | Ad | İngilizce | Birim | Ödeme statüsü | S/K |
|---|---|---|---|---|---|
| **1101** | Hikâye, Senaryo, Haklar | Story & Screenplay | — | *(başlık)* | — |
| 1101-01 | Hak Satın Alma | Story Rights Purchase | flat | telif_belgeli | S |
| 1101-02 | Opsiyon | Story Option | flat | telif_belgeli | S |
| 1101-03 | Opsiyon Uzatması | Option Extension | flat | telif_belgeli | K |
| 1101-04 | Yazım-Taslaklar | Screenplay Drafts | flat | telif_belgeli | S |
| 1101-05 | Danışman-Editör | Story Consultant / Editor | flat | smm | K |
| 1101-06 | Sinopsis-Treatment | Synopsis & Treatment | flat | telif_belgeli | K |
| 1101-07 | Script Report | Script Report / Reader Fee | flat | smm | K |
| **1102** | Yapımcı | Producers Unit | — | *(başlık)* | — |
| 1102-01 | Yapımcı Geliştirme Ücreti | Producer Development Fee | flat | smm | S |
| 1102-02 | Ortak / Yardımcı Yapımcı | Co-Producer / Associate Producer | flat | smm | K |
| **1103** | Yönetmen | Directors Unit | — | *(başlık)* | — |
| 1103-01 | Yönetmen Geliştirme Ücreti | Director Development / Attachment Fee | flat | telif_belgeli | S |
| **1104** | Bütçe ve Dosya Hazırlama | Budget & Pitch Package | — | *(başlık)* | — |
| 1104-01 | Bütçeleme | Budget Preparation | flat | smm | S |
| 1104-02 | Sunum Dosyası | Pitch Deck / Presentation Package | flat | smm | S |
| 1104-03 | Görsel-Tasarım | Graphic Design | flat | smm | K |
| 1104-04 | Çeviri-Tercüme | Translation | flat | smm | K |
| 1104-05 | Teaser / Mood Video | Mood Reel / Sizzle Reel | flat | smm | K |
| **1105** | Ofis Genel Giderleri | Development Office Overhead | — | *(başlık)* | — |
| 1105-01 | Ofis Kirası | Office Rent | month | kira_sahis | S |
| 1105-02 | Kırtasiye-Sarf | Office Supplies | month | sirket | S |
| 1105-03 | İletişim | Communications | month | sirket | K |
| 1105-04 | Kargo-Kurye | Shipping & Courier | month | sirket | K |
| 1105-05 | Yazılım-Abonelik | Software Subscriptions | month | sirket | K |
| 1105-06 | Sekretarya / İdari Destek | Secretarial / Administrative Support | month | bordro | K |
| **1106** | Hukuk ve Muhasebe | Legal & Accounting | — | *(başlık)* | — |
| 1106-01 | Avukatlık-Sözleşme | Legal Fees / Contracts | flat | smm | S |
| 1106-02 | Clearance-İzin | Clearances & Permissions | flat | sirket | K |
| 1106-03 | Mali Müşavir | Accounting Fees | month | smm | S |
| 1106-04 | Fon Raporlama-Denetim | Fund Reporting & Audit | flat | smm | K |
| 1106-05 | Noter ve Resmî Harçlar | Notary & Statutory Fees | flat | resmi_odeme | K |
| **1107** | Araştırma ve Danışmanlık | Research & Consultancy | — | *(başlık)* | — |
| 1107-01 | Saha-Konu Araştırması | Subject / Field Research | flat | smm | S |
| 1107-02 | Uzman Danışman | Expert Consultant | day | smm | K |
| 1107-03 | Arşiv-Kaynak-Telif | Archive & Source Licensing | flat | telif_belgeli | K |
| 1107-04 | Lokasyon Keşfi | Location Scouting | day | sirket | K |
| **1108** | Seyahat, Konaklama, Yemek, Harcırah | Travel, Accommodation & Living | — | *(başlık)* | — |
| 1108-01 | Ulaşım-Uçak | Air Travel | flat | sirket | S |
| 1108-02 | Konaklama | Hotels / Accommodation | day | konaklama | S |
| 1108-03 | Yemek-Ağırlama | Catering & Hospitality | flat | sirket | K |
| 1108-04 | Harcırah | Per Diem | day | sirket | K |
| 1108-05 | Festival-Pazar Katılımı | Festival & Market Attendance | flat | sirket | K |
| 1108-06 | Araç Kiralama | Car Rentals | day | sirket | K |
| **1190** | Muhtelif | Miscellaneous | — | *(başlık)* | — |
| 1190-01 | Banka-Havale-Kur | Bank & Transfer Charges | flat | sirket | S |
| 1190-02 | Beklenmedik Küçük Giderler | Sundry Expenses | flat | sirket | K |

Provenance tüm satırlarda: Koster/MMB + KAAPA damıtım. resmi_odeme statüsü (1106-05) yalnız kendi başına duran, tutarı dışarıdan gelen resmî ödemeler içindir — oranla başka bir satırdan türeyen resmî ödeme (damga vergisi gibi) buna girmez, o zaten burden_components'te YÜK olarak kayıtlıdır (bkz. BUTCE-SEMA-KARARLARI AYRILMA KURALI).

**DÜZELTME (DILIM 1100-A kapanışı, 15 Ağustos 2026):** ilk tohum altı atomu (1101-04, 1101-07, 1104-04, 1107-03, 1108-01, 1108-05) `piece` (adet) birimiyle yazmıştı; `piece` 1 Temmuz 2026'da bilinçli olarak kaldırılmış bir birimdi (Birim yalnız periyot cinsi taşır: gün/hafta/ay/bölüm/sabit; adet/kişi Miktar kolonunun konusu — migration 20260701090000). Yukarıdaki tablo ve canlı veri `flat`'e düzeltildi (migration 20260815190000); adet ihtiyacı Miktar/X koluyla karşılanır.

**EK (3 Ekim 2026, Engin kararı; göç `20261003120000`):** 1104-06 Atölye ve Lab Katılımı (Workshop & Lab Fees, flat, sirket, K) 1104 başlığının altına eklendi: Köprüde Buluşmalar, TorinoFilmLab, Sarajevo CineLink gibi geliştirme atölyelerine başvuru ve katılım bedeli; yol ve konaklaması 1108'dedir. Lablar fonlama öncesi işidir, bu yüzden 1300'e değil 1100'e girer (bkz. §7.2 SINIR). Kütüphane 48 satır (9 başlık + 39 atom), şablon değişmedi. Provenance: KAAPA.

### 7.2 KART 1300 — SENARYO YAZIMI  [KİLİTLİ]
Etap: Yapım Öncesi · RECOUPABLE DEĞİL · Geliştirme'ye bağı YOK (clearance dahil ayrı hesaplanır) · görünürlük: KISMİ MASKE 👁️ (1308 açılabilir; yazar kaşesi gizli).

**REVİZE (KART 1300 Dilim 1, 3 Ekim 2026, Engin kararı; göç `20261003120000`):** Kodlar MMB 6.1'e hizalandı (kaynak: `docs/butce/MMB-6.1-ornek-hesap-plani.pdf`, 1300 Continuity & Treatment; Koster damıtımı aynı numaraları kullanır). Bu bölümün önceki numaraları (1302 Senaryo Doktoru, 1303 Danışmanlar, 1304 Araştırma, 1305 Senaryo Odası, 1306 Yasal Hak Temizleme, 1307 Süre Analizi, 1308 Lojistik, 1309 Ağırlama) geçersizdir. Kart DÜZ: kütüphane başlığı YOK (atomlarda `heading_id` boş), sıralama kod sırasıdır. Kütüphane 16 satır (1315 ile, 3 Ekim 2026), şablon 5 kalem. Kart adı "Senaryo Yazımı".

**AD DÜZELTMESİ (3 Ekim 2026, Engin kararı; göç `20261003130000`):** Kartın adı "Senaryo Yazım ve Yasal Temizlik" iken "Senaryo Yazımı", 1308'in adı "Yasal Hak Temizleme" iken "Hukuki Uygunluk Raporu (Clearance)" oldu. Gerekçe: kaynakların hiçbiri bu bölümün adına hukuki ifade koymaz (MMB 6.1 "Continuity & Treatment", Koster damıtımı "senaryo yazım departmanı"); clearance raporu kartın bir kalemidir, kimliği değil. "Yasal Hak Temizleme" Türkçe kaynakta karşılığı olmayan kelime kelime çeviriydi; sektör bu işe "clearance" der, bu yüzden sözcük adın içinde yaşar. Kalem adında "senaryo" sözcüğü yoktur, çünkü kart zaten senaryo kartıdır. Ad 34 harftir, hızlı ekleme odasında tek satıra sığar. İngilizce ad (Legal Clearances) değişmedi. Bu bölümde eski adla geçen tek yer eski numaraların listesidir, o tarihçe olarak durur.

**Kütüphane (16 satır):** S = şablona giren, K = yalnız kütüphanede.

| Kod | Ad | İngilizce | Birim | Ödeme statüsü | S/K |
|---|---|---|---|---|---|
| 1301 | Senaryo Yazarı | Writers | flat | telif_belgeli | S |
| 1302 | Araştırma | Research | flat | smm | S |
| 1305-01 | Ulaşım-Uçak | Air Travel | flat | sirket | K |
| 1305-02 | Konaklama | Hotels / Accommodation | day | konaklama | K |
| 1305-03 | Yemek-Ağırlama | Catering & Hospitality | flat | sirket | K |
| 1305-04 | Harcırah | Per Diem | day | sirket | K |
| 1305-06 | Araç Kiralama | Car Rentals | day | sirket | K |
| 1306 | Senaryo Doktoru/Editör | Story Editor | flat | smm | S |
| 1307 | Uzman Danışmanlar | Consultants | day | smm | K |
| 1308 | Hukuki Uygunluk Raporu (Clearance) | Legal Clearances | flat | sirket | S |
| 1309 | Sekreterya | Secretaries | week | bordro | K |
| 1310 | Ofis Giderleri | Office Expenses | flat | sirket | K |
| 1312 | Senaryo Süre Analizi | Script Timing | flat | smm | S |
| 1313 | Yazar Asistanı | Writer's Assistant | week | bordro | K |
| 1314 | Bölüm/Tretman Yazarı | Episode Writers | episode | telif_belgeli | K |
| 1315 | Yazar Temsilci Komisyonu | Literary Agent | flat | sirket | K |

Eş adlar (`aliases`): 1301 Writers Room · 1306 Script Polish, Dramaturg. Provenance: MMB kalemleri 'Koster/MMB-6.1', 1305-xx 'Koster/MMB + KAAPA damitim', 1313 ve 1314 'KAAPA'.

**Şablon (5 kalem):** 1301, 1302, 1306, 1308, 1312. Kartın `misc_prefix` hanesi `"13"`. Yeni kart yalnız yeni açılan bütçede doğar.

**Boş numaralar:** 1303 Typing (daktilonun bugün karşılığı yok). 1304 Duplication: senaryonun çoğaltılması, dağıtılması ve revizyon basımı Üretim Ofisi/Reji işidir; kalem 2100 kurulurken oraya girer. 1305-05 Festival Katılımı: bitmiş filmin PR, pazarlama ve dağıtım işidir; Pazarlama/Dağıtım kartı kurulurken oraya taşınır, 1500'deki 1508-05 de aynı gerekçeyle taşınacak. 1311 Entertainment: ağırlama 1305-03'tedir (1500'de de 1508-03'e birleşti).

**1305 aile adı: Senaryo/Araştırma Seyahat ve Ağırlama Giderleri.** Başlık satırı açılmaz: kütüphanesinde başlık bulunan kart başlıklı çizilir ve başlığı olmayan kalemler kartın dibindeki Başlıksız bloğuna düşer (BUTCE-EKRAN-KARARLARI, BAŞLIKSIZ BLOĞU). Alt kalemler 1500'deki 1508-01..06 gibi düz durur; ad yalnız bu katalogda aile adıdır, ekranda alt kalemlerin adları görünür. Alt kalemler 1108 ve 1508 setinin aynısıdır, 05 boştur.

- 1308 Hukuki Uygunluk Raporu (Clearance), İngilizce adı Legal Clearances: 3 bağ → ait-kart=Senaryo (para burada) · onay-köprüsü=Hukuk (6200, departman admini onaylar) · risk-bayrağı=E&O (6105). cost_type=Hizmet/Hukuk. Motorun İLK kurulu örneği olacak. Görünürlük: set rollerine açılabilen istisna satırı. BUGÜN (3 Ekim 2026): bağların hiçbiri kurulu değil; 6200 ve 6105 kartları ve bağ motoru yok, kalem düz satır olarak doğar.
- 1309 Sekreterya ve 1310 Ofis Giderleri: sinema bütçesinde genelde kullanılmaz; dizi ve platform işinde Yazar Odası kurulduğu için ayrı ofis ve asistan/sekreter gideri olur. MMB standardı için kütüphanede kalır.
- 1314 Bölüm/Tretman Yazarı: dizi ve platform projelerinde ana senarist dışındaki bölüm ve tretman yazarları; birimi bölüm.
- **1315 Yazar Temsilci Komisyonu ve senaristin hak devri (3 Ekim 2026, Engin kararı; göç `20261003140000`):** 1315 kütüphane kalemidir; şablondan %20 gelir, kullanıcı değiştirir. 1301 Senaryo Yazarı ve 1314 Bölüm/Tretman Yazarı satırlarına bağlanır (`attaches_to`) ve 1500'deki 1511 gibi "Kime?" sorusuyla yazarın altına alt satır olarak düşer. Taban, "ajans var, komisyon yok" (%0) ve silme kuralları 1511 ile aynıdır (§7.4); ajans adı aynı park maddesine tabidir. Komisyon bağlanınca yazarın para satırı "Telif Bedeli" alt adıyla görünür (`name_suffix`; 1500'deki "Hizmet Bedeli" karşılığı, çünkü senaristin ödemesi telif). Senarist için hak devri satırı AÇILMAZ. Gerekçe: CNC (19 Agents littéraires, 1911) ve Eurimages (Literary agent) yazarın ajansını ayrı satırda ister, ama hakkını ücretinden ayırmaz. CNC'de senaristin parası yalnız hak bölümündedir (11, 12); Eurimages'ta tek satırdır (Script Writer & co-writers, fees and rights); MMB 6.1'de 1202 ve 1301 Writers tek kalemdir. Yönetmende ayrım vardır (CNC 13 telif + personel bölümünde ücret); 1500'deki hak devri satırı bu yüzden vardır.
- **KURUM FARKLARI (Hedef Mecra kuralı, 3 Ekim 2026):** kartın davranışı kuruma göre değişmez; farklar Hedef Mecra kurulunca şablonda, denetimde ve çıktıda çözülür. **CNC** (`docs/butce/CNC-devis-cinema-2018-5-chiffres.pdf`): senaristin parası yalnız ilk bölümde, haklar içinde durur (11 Konu, 12 Uyarlama-Diyalog-Yorum); yazarın ajansı ayrı satırdır (19, 1911 Agents littéraires); çeviriler (16) ve metin giderleri (17) de aynı bölümdedir. KAAPA'da bunlar 1315'e, 1104-04'e ve (çoğaltma) 2100'e düşer; CNC çıktısında hak bölümüne gruplanır. **Eurimages:** senarist tek satırdır (Script Writer & co-writers, fees and rights), yazarın ajansı ayrı satırdır (Literary agent). **MMB 6.1:** 1300 Continuity & Treatment; ajans satırı yoktur. **Türkiye:** senaristin ödemesi telif (`telif_belgeli`), ücret ile hak ayrılmaz. Sonuç: 1300'de kurum farkı kartın davranışına değil, çıktıdaki gruplamaya dokunur.
- **SINIR (3 Ekim 2026, Engin kabulü):** 1100/1300 sınırı korunur. Hak satın alma ve opsiyon (1101-01..03), sunum dosyası ve görsel tasarım (1104-02, 1104-03), çeviri (1104-04), noter ve resmî harçlar (1106-05), senaryo raporu (1101-07) 1100'dedir; lab katılımı 1100'e 1104-06 olarak girdi. Fonlama sonrası çalışan dramaturg 1306'nın işidir (eş ad). Gerekçe: hak ve pitch giderleri 1300'e girerse greenlight'taki geri tahsil raporu onları kaçırır (§3).
- **Alınmayan adaylar:** Yazar Primi (platform işi), Deşifre-Çeviri ve Readthrough (kaynakları reklam/post ya da set). Script Supervisor 2100'e aittir (KART-GEREKCELERI).

ÖNEMLİ — 1200 absorbe: Koster "1200 Story & Other Rights" KAAPA'da AYRI kart DEĞİL; geliştirme hakları 1101'de, yazım 1300'de. Ayrı 1200 kartı açılmaz.

**Engin'in metinleri (3 Ekim 2026, BİREBİR; özetlenmez, kısaltılmaz):**

> 1300 kartı tamamen senaryonun yazılması, hikayenin geliştirilmesi ve hakların alınması aşamasıdır. "Festival Katılımı" ise bitmiş filmin PR, pazarlama ve dağıtım (genelde 6000/7000 serisi PR veya Post-Prodüksiyon sonrası) aşamasına aittir. 
> buda bize hem bu kalemin burada olmayacağı hemde post sonrası bir dönem daha koyma ihtimalini veriyor.
> 1305'i sadece "Yazar Araştırma/Seyahat Giderleri" olarak daraltmak kafa karışıklığını önler. Bu kalem kütüphane kalemi olur şablonla gelmez
> Typing çıkacak listeden 21. yüzyıldayız.
> Genelde senaryo aşaması için ayrı bir ofis veya sekreter tutulmaz; bu giderler ana Üretim Ofisi (1500 serisi) altından yürütülür.Dizi / Platform İşleri İçin: "Yazar Odası" (Writer's Room) kurulduğu için ayrı bir ofis ve asistan/sekreter gideri olur.AAPA her ikisine de hizmet edeceği için ve uluslararası MMB (Movie Magic) standardını korumak adına bu iki kalemin kalması doğru. Sadece sinema bütçesi yapan kullanıcılar buraları "0" geçecektir. Bu kalem kütüphaneden çekileceği için gerektiğinde çekilir.  
> 1305'in içindeki "Festival Katılımı"nı çıkarıp Pazarlama/Dağıtım kartlarına taşırız (geldiğinde)  ve 1305'in adını genel ulaşımdan ziyade "Senaryo/Araştırma Seyahat ve Ağırlama Giderleri" olarak netleştirebiliriz. Diğer kısımlar KAAPA'nın yapısına ve MMB standartlarına gayet uygun.

> enaryonun çoğaltılması, oyunculara dağıtılması, revizyonların basılması tamamen Üretim Ofisinin (Production Staff / Office) veya Reji Grubunun operasyonudur.
> 1305 kalemlerini birleştirip bir başlık altında tutalım kapalı gelsin.

(Başlık isteği aynı gün düz alt kalem kararıyla değişti; gerekçe yukarıda, 1305 aile adı maddesinde.)

> Aşağıda sebepleriyle beraber ek birkaç kalem var. bunlar varmıydı bizim listelerde? yoksa bile bunlar günümüzde gerekli olan kalemler diye düşünüyorum. ne diyorsun?
>
> *  Eser / Kitap / Opsiyon Hak Ödemesi (Option & Story Rights) Avukatlık (1308) harici, doğrudan yazar/eser sahibine ödenen telif veya opsiyon bedeli.
> *  Çeviri ve Tercüme Hizmetleri (Translation Services) Fonlar ve ortak yapım marketleri için istenen İngilizce/Fransızca senaryo, tretman ve dosya çevirileri.
> *  Pitch Deck & Görsel Konsept Tasarımı (Pitch Deck & Concept Art) Bakanlık ve market sunumları için hazırlanan moodboard, storyboard ve görsel sunum dosyası tasarım giderleri.
> *  Telif Tescil ve Noter Masrafları (Copyright & Notary Fees) Senaryo tescili, noter tasdikleri ve Telif Hakları Genel Müdürlüğü/MESAM/WGA kayıt masrafları.
> *  Atölye ve Lab Katılım Ücretleri (Workshop & Lab Fees) Köprüde Buluşmalar, TorinoFilmLab, Sarajevo CineLink vb. geliştirme atölyelerine başvuru ve katılım bedelleri.
> *  Senaryo Raporlama / Coverage (Script Coverage / Dramaturg) Senaryo doktorundan (1306) bağımsız olarak, dışarıdan okuyucuya veya dramaturga yaptırılan senaryo analiz/raporlama gideri.
> *  Bölüm / Tretman Yazarları (Episode Writers) Özellikle dizi/platform projelerinde (Yazar Odası - Writer's Room) ana senarist dışındaki bölüm veya tretman yazarları.

### 7.3 KART 1400 — YAPIMCI BİRİMİ ve FİNANSAL HAKLAR  [KİLİTLİ]

**REVİZE (5 Ekim 2026, Engin kararları; KART 1400 açılışı).** Bu bölümün aşağıdaki eski metni 19 Haziran tasarımıdır; numaraları MMB 6.1 ile tutmaz (1300 ve 1500 emsali).

- **MMB 6.1 HİZASI (Karar 1, kabul):** kodlar MMB 6.1'e hizalanır (kaynak: `docs/butce/MMB-6.1-ornek-hesap-plani.pdf`, 1400 Producers Unit). Beş yapımcı rolü ayrı kütüphane kalemidir: 1401 Executive Producer, 1402 Producer, 1403 Co-Producer, 1404 Line Producer, 1405 Associate Producer. Eski "1401 tek kalem + rol etiketi" tasarımı düştü; rol etiketi mekanizması kodda ve şemada yoktur. Çatal: iki rolü taşıyan kişi için kullanıcı tek kalemi seçer, öbürü kütüphanede kalır. 1404 eş adları: Coordinating Producer, Supervising Producer. Gerekçe ve kaynak doğrulaması: `docs/butce/KART-GEREKCELERI.md` KART 1400 REVİZE GEREKÇE.
- **GENEL GİDER VE KÂR KALEM DEĞİL (Karar 2, özü kabul):** eski tarifteki 1404 Genel Gider Payı ve 1405 Yapımcı Kârı kalem olarak açılmaz; ikisi bütçenin dibinde yüzde satırıdır. Uygulaması (dipte Genel Gider satırı, zincirdeki yeri, hangi tutar üzerinden hesaplanacağı) icmal turuna park: `docs/EKRAN-MUHASEBE.md` §19 Ekran 1.
- **ÖNERİLEN KÜTÜPHANE — KARARA BAĞLANMADI (Karar 4 ve 4a, açık):** gider çeşidi sözlüğünden sonra ele alınır; 1400 tohumu bekler. S = şablona girer, K = yalnız kütüphanede. Statüler Opus varsayımıdır, Engin düzeltecek.

| Kod | Ad | EN | Birim | Statü | |
|---|---|---|---|---|---|
| 1401 | Yürütücü Yapımcı | Executive Producer | flat | sirket | S |
| 1402 | Yapımcı | Producer | flat | sirket | S |
| 1403 | Ortak Yapımcı | Co-Producer | flat | sirket | S |
| 1404 | Uygulayıcı Yapımcı | Line Producer | flat | smm | S |
| 1405 | Yardımcı Yapımcı | Associate Producer | week | smm | K |
| 1406-01 | Ulaşım-Uçak | Air Travel | flat | sirket | K |
| 1406-02 | Konaklama | Hotels / Accommodation | day | konaklama | K |
| 1406-03 | Yemek-Ağırlama | Catering & Hospitality | flat | sirket | K |
| 1406-04 | Harcırah | Per Diem | day | sirket | K |
| 1406-05 | Festival Katılımı | Festival Attendance | flat | sirket | K |
| 1406-06 | Araç Kiralama | Car Rentals | day | sirket | K |
| 1407 | Yapım Yöneticisi | Production Executive | week | smm | K |
| 1408 | Sekreterya | Secretaries | week | bordro | K |
| 1409 | Yapımcı Birimi Ofis Giderleri | Office Expenses | flat | sirket | K |
| 1410 | Araştırma | Research | flat | smm | K |
| 1411 | Ajans Paketleme Komisyonu | Packaging Fee | flat | sirket | K |

  Notlar: 1406 MMB'de boştur, numara Opus önerisidir; MMB yapımcı seyahatini 1700 A-T-L Travel/Living hesabında tutar (1701 Hotels, 1702 Travel, 1703 Per Diem, 1704 Car Rentals, 1705 Misc.). Gezi ailesinin kartta kalma gerekçesi: kart onay zinciri birimidir, 1300 ve 1500 seyahatini kendi kartında tutar; MMB 1700 numarası dışa aktarımda kod eşlemesiyle karşılanır. 1406-05 Festival Katılımı, 1508-05 gibi Pazarlama/Dağıtım kartı kurulurken oraya taşınacak kalemlerdendir. 1411'in 1511 ve 1315 komisyon düzenine bağlanıp bağlanmayacağı açıktır. Motor isteyen maddeler kartın tarifinde yazılı kalır, bugün kurulmaz: tam maske, Compliance Guard, 1102 mahsup denetimi, rol etiketi.

Etap: ATL (kart birden çok etaba yayılır) · RECOUPABLE DEĞİL · görünürlük: TAM MASKE 🔒 (tüm kart set rollerine kapalı; "ticari yatak odası") · DB'de Muhasebe tam erişim · anomali her zaman aktif.

A. Kreatif & İdari Yapımcı Kaşeleri (İşçilik/Hizmet — fringe binebilir, ödeme-statüsüne göre)
- 1401 Yürütücü/Hat Yapımcı (Line/Executive Producer Fee): tek kalem + rol-etiketi (Executive / Line / Coordinating / Supervising). cost_type=İşçilik(ATL) · ödeme-statüsü: SMM/Şirket-faturası/bordro · mahsup denetimi: 1102 ile.
- 1402 Ortak Yapımcı Kaşesi (Co-Producer Fee): uluslararası ortaklık/fon getiren ortağın fiili emeği. cost_type=İşçilik(ATL).
- 1403 Yapımcı Kreatif Kaşesi (Producer Fee — Eurimages/fon uyumlu): şirket kârı HARİÇ kreatif emek bedeli. cost_type=İşçilik(ATL) · mahsup denetimi: 1102 ile · gizli-kâr görünürlüğü: 1405 ile (Compliance Guard).

B. Şirket Gelirleri & Gider Payları (yüzde/şirket — fringe BİNMEZ, percent_line adayı)
- 1404 Yapım Şirketi Genel Gider Payı (Company Overhead): Eurimages %5-7 doğrudan, fatura sorulmaz. cost_type=Şirket/Pay · percent_line adayı (§8) · çift-fringe guard · Compliance Guard denetimi.
- 1405 Yapımcı Kârı/Stüdyo Payı (Producer Mark-up): stüdyo işlerinde mark-up motoruyla ezilebilen net kâr%. cost_type=Şirket/Kâr · percent_line adayı (§8) · çift-fringe guard · Compliance Guard (şablon tavanı) · gizli-kâr transferi görünürlük uyarısı.

C. Ticari Bağlantı & Temsil (komisyon — fringe BİNMEZ, doğrudan fatura)
- 1406 Ajans Paketleme/Menajerlik Komisyonu (Packaging Fee): yüzde veya sabit ticari komisyon. cost_type=Hizmet/Komisyon · doğrudan faturalı · çift-fringe guard.

D. Yapımcı Ofisi Lojistik & Temsil (operasyonel gider)
- 1407 Yapımcı Birimi Seyahat/Konaklama (Travel & Living): fonlama/marketler (Cannes, Berlin)/ortaklık görüşmeleri. Kapsam: KENDİ ekibimizin gideri (uçak/otel/yol/yol-üstü yemek). Etap ayrımı: 1108 (Geliştirme/recoupable) ≠ 1407 (sonraki etap).
- 1408 Yapımcı Ofisi Sekretarya/İdari Personel (Secretaries): yapımcı asistanı/şirket sekretaryasının bu projeye mesaisi. cost_type=İşçilik.
- 1409 Kurumsal Ağırlama/İş Geliştirme (Entertainment): Kapsam: KARŞI TARAFI ağırlama (yatırımcı/platform/distribütör ısmarlama, temsil, hediye). Ayrım: karşı taraf=1409, kendi gider=1407.

Gizli alias (kart yüzünde görünmez; dizi/platform yapımında çağrılınca açılır):
- Production Executive: şirket↔stüdyo irtibatı, "yapılabilirlik" kararı. Türk bağımsız Faz 1'de gizli; büyük yapımda aktifleşir.

Kart-özel anomali kuralları: çift-fringe guard (1404/1405/1406) · geliştirme mahsup (1102↔1401/1403) · Compliance Guard (1404/1405 şablon sınırı). Genel kurallar §4.9'da.

### 7.4 KART 1500 — YÖNETMEN ve KREATİF REJİ EKİBİ  [KİLİTLİ]
Etap: ATL (Prep→Prod→Post) · RECOUPABLE DEĞİL · görünürlük: KISMİ MASKE 👁️ (1501 baş-kaşe set rollerine gizli; operasyonel ekip yapımcı isterse açılır) · DB'de Muhasebe tam erişim · anomali aktif.

**REVİZE (KART 1500 Dilim 1, 30 Eylül 2026, Engin kararı; göç `20260930120000`):** Kodlar MMB 6.1'e hizalandı (kaynak: `docs/butce/MMB-6.1-ornek-hesap-plani.pdf`, 1500 Directors Unit). Kart DÜZ: kütüphane başlığı YOK (MMB'de 1500 ara başlıksız tek hesap grubu; atomlarda `heading_id` boş). Sıralama kod sırasıdır. Kütüphane 14 satır, şablon 5 kalem.

**Kütüphane (16 satır):** S = şablona giren, K = yalnız kütüphanede.

| Kod | Ad | İngilizce | Birim | Ödeme statüsü | S/K |
|---|---|---|---|---|---|
| 1501 | Yönetmen (ek: Hizmet Bedeli) | Director Fee | flat | telif_belgeli | S |
| 1501-01 | Yönetmen Hak Devri | | flat | telif_belgeli | K |
| 1502 | Yönetmen Özel Asistanı | Personal Assistant | week | bordro | S |
| 1503 | Koreograf | Choreographer | week | smm | S |
| 1504 | Oyuncu/Diyalog Koçu | Dialogue/Acting Coach | day | smm | S |
| 1506 | Storyboard ve Animatic Sanatçısı | Storyboard & Animatic Artist | week | smm | S |
| 1507 | Yönetmen Birimi Ofis Giderleri | Director's Office Expenses | flat | sirket | K |
| 1508-01 | Ulaşım-Uçak | Air Travel | flat | sirket | K |
| 1508-02 | Konaklama | Hotels / Accommodation | day | konaklama | K |
| 1508-03 | Yemek-Ağırlama | Catering & Hospitality | flat | sirket | K |
| 1508-04 | Harcırah | Per Diem | day | sirket | K |
| 1508-05 | Festival Katılımı | Festival Attendance | flat | sirket | K |
| 1508-06 | Araç Kiralama | Car Rentals | day | sirket | K |
| 1509 | İkinci Ekip Yönetmeni (ek: Hizmet Bedeli) | Second Unit Director | week | smm | K |
| 1510 | Konsept Sanatçısı | Concept Artist | week | smm | K |
| 1511 | Yönetmen Temsilci Komisyonu | | flat | sirket | K |

1505 (MMB: Secretary) BOŞ; işi 1502'nin içinde. 1508-01..06, 1100'deki 1108 ekleriyle aynıdır (05 Festival Katılımı); 1108-03'ün birimi de `flat`'e çekildi (göçle, bkz. §7.1). 1506'nın eş adları (`aliases`): Previz, Previsualization, Animatic; kalem ekleme odasındaki arama eş adı okur. Provenance: 1508-xx 'Koster/MMB + KAAPA damitim', 1510 'KAAPA', diğerleri 'Koster/MMB-6.1'.

**Şablon (5 kalem):** 1501, 1502, 1503, 1504, 1506. Kartın `misc_prefix` hanesi `"15"` (1100 kartınınki `"11"`); değerler `fn_open_budget`'taki geri-düşümün ürettiği değerin aynısıdır, davranış değişmedi (TD-39).

A. Kreatif Ana İşçilik (İşçilik + ödeme-statüsü)
- 1501 Yönetmen (Director Fee; ekranda "Yönetmen Hizmet Bedeli", bkz. aşağıdaki Dilim 2 bloğu): cost_type=İşçilik(ATL) · ödeme-statüsü: SMM/Loan-Out/Telif · kısmi maskede gizli baş-kaşe 🔒 · milestone denetimi: 5100 Kurgu onay tikleri ile.
- 1509 İkinci Ekip Yönetmeni (Second Unit Director): cost_type=İşçilik(ATL) · haftalık/paket · çapraz: 4200 Second Unit (orası ekip/ekipman; 1509 sadece kaşe). Eski kodu 1502'ydi.

B. Kreatif Destek Ekibi (İşçilik + ödeme-statüsü)
- 1502 Yönetmen Özel Asistanı (Personal Assistant): doğrudan yönetmene bağlı, set reji departmanından ayrı. cost_type=İşçilik · Crew Overlap denetimi. Eski kodu 1505'ti.
- 1503 Koreograf (Choreographer): dans/dövüş/hareket. cost_type=İşçilik(ATL).
- 1504 Oyuncu/Diyalog Koçu (Dialogue/Acting Coach): çocuk oyuncu/şive/cast hazırlığı. cost_type=İşçilik(ATL) · Crew Overlap denetimi.

C. Görselleştirme & Tasarım (İşçilik + ödeme-statüsü)
- 1506 Storyboard ve Animatic Sanatçısı: çekim-öncesi kare/dijital canlandırma. cost_type=İşçilik · çapraz: 1300 alias (geliştirmede başladıysa mükerrer denetimi). Previz bu kalemin eş adıdır (`aliases`).
- 1510 Konsept Sanatçısı: Kapsam: SADECE yönetmen erken-vizyonu (greenlight öncesi dünya/renk/VFX-planı). Prodüksiyon tasarımı → 2200. cost_type=İşçilik · çapraz: 2200 alias (çift-sayım önler). Eski kodu 1507'ydi.

D. Lojistik & Temsil (operasyonel gider)
- 1507 Yönetmen Birimi Ofis Giderleri.
- 1508-01..06 Yönetmen birimi seyahat/konaklama/yemek: Kapsam: KENDİ kreatif ekibimizin gideri (festival/reco/çekim — uçak/araç/otel) ve karşı tarafı ağırlama. Eski 1508/1509 ayrımı (kendi yol-yemeği / karşı tarafı ağırlama) KALKTI; ikisi 1508-03 Yemek-Ağırlama'da, birimi sabit (1108-03 ile aynı).

Kart-özel anomali kuralları: çift-fringe guard (1501/kreatifler Loan-Out) · milestone uyuşmazlık (1501↔5100) · Crew Overlap (1504/1502 ↔ set ekibi). Genel kurallar §4.9'da.

**KARARLAŞTI VE UYGULANDI (Dilim 2; 30 Eylül 2026 ve 1 Ekim 2026, Engin kararları):** 1501-01 Yönetmen Hak Devri ve 1511 Yönetmen Temsilci Komisyonu. Uygulama dört adımda tamamlandı (1 Ekim 2026): 1) kayıt yapısı (göç `20261001120000`); 2a) adlar, özet satırı, isim yazma ve "Kime?"; 2b) hak devri bölmesi, oran, kilit ve pay yazımı (göç `20261001130000`); 2c) komisyon tabanı, silme kuralları ve %50 uyarısı.

**Engin'in metni (30 Eylül 2026, BİREBİR; özetlenmez, kısaltılmaz):**

> komisyonun neyin üzerinden hesaplanacağı: komisyon satırı aynı oyuncuda olduğu gibi bir satır yapısı olur, oran hanesi  vardır , şablondan %20 sabit gelir, kullanıcı isterse değiştirir.
>
> Yönetmen hak bedeli konusu:  "Directors rights" Türk bütçelerinde ayrı olarak gösterilmez (genelde) sebebi, bu kalem sözleşmede  hak devirlerinden sözedilse de ayrı olarak hesaplanmamasıdır. mali haklar devir sözleşmesi yapılır. Bu sözleşmede hem hak devri hem de kaşe yi  kapsar. toplam bir rakam yazılır. Kültür bakanlığı filmler için eser işletme belgesi verirken hak devri yapılıp yapılmadığına bakar ama bunun mali karşılığını araştırmaz sorgulamaz. Dolayısıyla Türk bütçelerinde Yönetmenin kazancı tek rakam olarak girilir.
> Bütçe de hak devrinin ayrı ayrı gösterilmesini isteyen kurum ve kuruluşlar CNC Fransa, yönetmen hakları (Droit d'auteur) (kaşe üzerinden ağır sosyal güvenlik primleri kesilirken, telif bedeli farklı ve daha düşük bir vergi dilimine tabidir. Bütçenin doğru hesaplanabilmesi için bu ayrım şarttır.), Almanya'daki FFA veya Medienboard, Belçika'daki Wallimage veya Screen Flanders gibi fonlar da birebir CNC ve Eurimages formatını takip eder. Bütçe formlarında (çoğunlukla excel şablonlarında) bu iki kalem "Director" ana başlığı altında ayrı satırlar olarak (kodları bile farklıdır) sabit olarak gelir.
> Avrupa kamu yayıncıları (Arte,ZDF,CANAL +, vb)  Bu kanallar bir projeye sadece yayın haklarını satın almak için değil, "Ortak Yapımcı" (Co-producer) sıfatıyla ve yapım bütçesine katkı sunarak girdiklerinde, kendi ülkelerinin vergi ve telif yasaları gereği bütçe planında bu ayrımı görmek isterler.
> Euromages  da bu  kalemi şablon bütçesinde ayrı görmek ister.
> Hak devri, kütüphaneden çağrılabilen bir atom/kalem olmalıdır. Tıklandığında, tıpkı oyuncu kartında olduğu gibi "Kime?" sorusunu soran bir liste açılmalıdır (Çünkü birden fazla yönetmen olabilir).
> Bu listede yönetmenin ismi belliyse doğrudan isim yazmalı, isim boşsa kalemin kendi başlığı (Örn: 1. Yönetmen) gösterilmelidir.
> Bu kalem çağrıldığında bağımsız bir satır oluşturmaz; oyuncu kartındaki "Ajans Komisyonu" mantığına benzer şekilde ilgili yönetmenin altında bir alt satır (child) olarak belirir.
>
> ilk hali yönetmen kaşesi 1000 tl
> Hak Devri Eklendikten Sonra: Özet Satır (Parent) = 1000 TL, Yönetmen Kaşesi (Child) = 500 TL, Yönetmen Hak Devri (Child) = 500 TL. (Sistem parayı %50-%50 otomatik böler).
> satırdaki oran  kolonu burada  komisyon veya diğer oranlardan farklı bir davranış gösterecek. komisyonda  oran yönetmen toplam kaşesinin yüzde kaçı olduğunu belirliyorken burada oran kaşe ve hak devrinin yüzdesel olarak nasıl bölüneceğini belirler.
> Burada kullanıcı iki şekilde davranmak isteyecektir. şablondan toplam kilitli bir şekilde gelir. oran satırından değişiklik yapıldığında başta girilen rakam (örneğin 1000 tl) oran satırındaki gösterilen yüzdeye göre bölünür, ancak kullanıcı buna uymak istemez ve hak devri ile kaşeyi bağımsız olarak değiştirmek isterse  serbest düzenlemeye ihtiyaç duyacaktır. bunun için bir  kilit olmalı. bu kilit ayrı bir buton olmak yerine oran inputuna bitişik olmalı ve işi oranı devre dışı bırakmak yada korumak olmalı
>
> * Serbest Düzenleme : Kullanıcı "Yönetmen Hizmet Bedeli"ni 600 TL yaparsa, Parent (Toplam) satırı otomatik olarak 1.100 TL'ye güncellenir. Yani rakamlar özgürdür, üst toplamı etkiler.
> * Toplamı Kilitleme (Lock Total): Kullanıcı "Toplam 1.000 TL param var, bunu aşamam" diyorsa; Hizmet bedelini 600 TL yaptığında, sistem Hak Devrini otomatik olarak 400 TL'ye düşürür. (Bir kilit/zincir ikonu ile )
>
> Ayrıca fransa ve diğer bazı ülkelerde vergi mevzuatından dolayı, yönetmen kaşesi ve hak devri oranları belirli bir seviyede olmalı, hak devri %50 yi geçtiğinde fransız kanunları ve bazı diğer avrupa ülkelerinde bu  durum gizli maaş, dolayısıyla vergi kaçırma olarak görülebileceğinden  bir uyarı  çıkmalı. Hak devri &55 in üstüne çıktığında : ""Telif oranının kaşeden çok daha yüksek olması, Avrupa fonlarında (örn: CNC) 'gizli maaş' (salaire déguisé) denetimlerine takılma riski taşır. Oranı dengede tutmanız önerilir."" gibi

**Engin'in cevapları (30 Eylül 2026, BİREBİR):**

> yönetmen temsilci komisyonu kalacak
> iki kalem içinde ( temsilci ve hak devri) kime  olsun
> kilit  hazır gelen hali  ve açık hali  doğru
> eşik tek bir uyarı eşiği olsun, hak devri %50 geçtiğinde tetiklenir
> türk vergisi,  türkiye  için olan bütçelerde zaten hak devri  kalemi olmayacak, kullanıcı yanlışlıkla girersede sorun değil. her iki durumdada statüsü telif oalcak türkiyede yönetmenin aldığı kaşe telif %17
> komisyon, hak devri eklenmiş bir kalemde kaşe artı hak devrinin toplamından  hesaplanır bu zaten özette yer alacak.

**Teknik tasarım kararları (1 Ekim 2026, Engin kabulü):**
1. ZIMBA: Hak devri ve komisyon, eklendikleri yönetmen satırına (1501 ya da 1509) kayıtta görünmeyen bir bağla zımbalanır (`budget_items.parent_item_id`). Üretim Kayıtları'ndaki kişi kaydı kullanılmaz; kullanılsaydı yönetmen Oyuncular listesine düşerdi.
2. AD DÜZENİ (ekranda): tek yönetmen, alt satır ve isim yoksa tek satır "Yönetmen". İsim yok, alt satır varsa özet "Yönetmen", altında "Yönetmen Hizmet Bedeli", sonra hak devri, sonra komisyon. İsim varsa özet "Yönetmen", altında "Ayşe Yılmaz Hizmet Bedeli", sonra hak devri, sonra komisyon; isim var ama alt satır yoksa da aynı düzen, blok kapalı doğar (1600'deki tek kalemli rol emsali). Birden fazla isimsiz yönetmende özetler "Yönetmen 1", "Yönetmen 2" olur (satır sırasına göre, saklanmaz). "Kime?" listesi özetin adını gösterir ("Yönetmen", "Yönetmen 1" ya da isim). 1509 İkinci Ekip Yönetmeni aynı kurala uyar. Kişi adı satırın kendi hanesinde tutulur (`budget_items.person_name`) ve Ad hücresine yazılır. 1600'de numaralı özet adı reddedilmişti (9 Eylül 2026) çünkü orada ad Üretim Kayıtları'ndan gelir; 1500'de o kaynak yoktur, çelişki yoktur.
3. **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** HAK DEVRİ GİRİŞİ: Engin'in yukarıdaki metni geçerlidir. KİLİTLİ (hazır gelen): toplam sabit; oran değişince toplam yeniden bölünür, bir satır değişince öbürü toplamı tamamlar. AÇIK: oran devre dışı, iki satır serbest, toplam onların toplamı. Kilit ayrı düğme değildir, oran hanesine bitişiktir. Oran şablondan %50 gelir, kullanıcı serbestçe değiştirir.
4. **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** KAYITTA NE TUTULUR (1 Ekim 2026'da Karar 11 ile DEĞİŞTİ; eski metin: "kilitliyken Hizmet Bedeli rakamı ile hak devri oranı; hak devri rakamı ve toplam bu ikisinden hesaplanır"): kilitliyken Hizmet Bedeli satırında kullanıcının girdiği TOPLAM (dönemleriyle) ve hak devri oranı saklanır. Hizmet Bedeli payı = toplam × (100 − oran) / 100; hak devri = toplam − Hizmet Bedeli payı (yuvarlanmaz, kalan neyse odur). Oran kaç kez değişirse değişsin kayda yalnız oran yazılır, toplam kuruş kaymaz. Açıkken oran boştur, iki rakam kendi satırında durur. Kilidin durumu ayrıca saklanmaz: oran doluysa kilitli, boşsa açık.
5. ORANIN HANESİ: hak devri oranı `budget_items.split_rate`'te durur, komisyonun `derive_rate` hanesinde değil. Kod `derive_rate` dolu satırı komisyon sayar (altı dosyada dokuz yer); hak devri oraya yazılsaydı komisyon gibi davranırdı. **(DÜZ SATIR, 2 Ekim 2026: `split_rate` kolonu kalktı; oran saklanmaz, ekranda hesaplanır.)**
6. KİME? LİSTESİNİN KAYNAĞI: kalemin kütüphane kaydında altına girebileceği kalemler yazılıdır (`item_library.attaches_to`: 1501, 1509). Dolu olan kalem seçilince "Kime?" açılır; liste kartta bu kodları taşıyan satırlardan kurulur. Senarist ve besteci kartlarında aynı bilgi yazılarak kullanılır, yeni mekanizma kurulmaz.
7. GÖREV ADI VE EK: 1501'in kütüphane adı "Yönetmen", eki "Hizmet Bedeli" (`item_library.name_suffix`); 1509'un eki de "Hizmet Bedeli". Ekrandaki adlar bu ikisinden kurulur; icmal ve dışa aktarımda kalemin tam adı "Yönetmen Hizmet Bedeli".
8. YÖNETMEN SATIRI SİLİNİRSE: × zımbalı satırları da birlikte siler; soru bugünkü proje penceresiyle sorulur ve silinecekleri adıyla söyler.
9. HAK DEVRİ SİLİNİRSE: kilitliyken toplam korunur, hak devrinin rakamı Hizmet Bedeli'ne döner ve soru bunu söyler; açıkken Hizmet Bedeli olduğu gibi kalır. **(İKİ KURAL, 1 Ekim 2026: "kilitliyken" koşulu kalktı; hak devri silinince rakamı her zaman Hizmet Bedeli'ne döner.)** **(DÜZ SATIR, 2 Ekim 2026: hak devri normal silinir, rakamı hiçbir yere dönmez.)**
- KOMİSYON SİLME: 1511 × ile normal silinir. 1600'deki "oranı 0 yapın" kuralının gerekçesi tikten yeniden doğumdu; 1511 kütüphaneden elle eklenir.
- AJANS VAR, KOMİSYON YOK: komisyon satırı %0 oranla eklenir ve durur (1600 emsali: ajans ücret almasa da sözleşmede taraftır).
- EŞİK: oran cetvelinde "Parametre: Hak devri uyarı eşiği" %50. Uyarı hak devrinin toplam içindeki payına bakar, kilitli ve açık halde aynıdır; metin yukarıdaki Engin metnindeki cümledir. **(DÜZ SATIR, 2 Ekim 2026: eşik %55, oran cetvelinde dilim 2'de değişir; pay = hak devri / (Hizmet Bedeli + hak devri), komisyon hariç.)**
- AJANS ADI PARKTA: 1511 satırında ajansın adı gösterilmez (1 Ekim 2026, Engin); ayrıca değerlendirilecek.
- KARAR 10 (1 Ekim 2026, Engin): numara görev adının göründüğü her yerde aynıdır. Aynı kodda iki ve daha fazla isimsiz yönetmen satırı varsa satır özetsiz de olsa "Yönetmen 1", "Yönetmen 2" yazar; "Kime?" listesi aynı adı gösterir. Tek isimsiz satır numara almaz.
- AD HÜCRESİ (1 Ekim 2026, Engin): yönetmen satırının Ad hücresine girince yalnız kişi adı görünür (yoksa boş), çıkınca kurulmuş ad görünür (sayı hücrelerinin deseni). Yazılan ad hücreden çıkılana kadar kaydedilmez; her harfte özet satırı doğup kaybolmasın. Kullanıcı ismi kendisi yazdığında blok açık doğar. Klavye motoru bu hücreyi ayrı kolon olarak tanır (`personName`), Ad kolonuyla dikey eşdeğerdir.
- **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** KARAR 11 SONUÇLARI (1 Ekim 2026): hak devri eklenirken ve kilitliyken silinirken Hizmet Bedeli'nin kaydına hiçbir şey yazılmaz; ekrandaki pay hesaptır. Hizmet Bedeli dönemliyse hak devri de aynı dönemlere aynı oranla dağılır: her dönemde hak devri = dönemin toplamı − o dönemin Hizmet Bedeli payı. Hak devrinin ödeme zamanı Hizmet Bedeli'nin dönemlerine bağlıdır. Dönem dönem rakam saklanmaz (B18), kayıttaki toplam ve orandan her an aynı sonuçla hesaplanır; nakit akışı ve harcama raporu bu hesabı okur (kodu raporla birlikte yazılır). Bordro statülü Hizmet Bedeli bölünmez; bir yönetmen satırında birden fazla kilitli hak devri varsa yalnız ilki böler.
- **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** KARAR 12 (1 Ekim 2026, Engin): kilitliyken Hizmet Bedeli satırının rakam hücreleri payı gösterir ve payı yazar. Pay değişince toplam sabit kalır, oran yeniden hesaplanır; dönemli Hizmet Bedeli'nde değiştirilen dönemden hesaplanan tek oran bütün dönemlere uygulanır (örnek: hazırlık 200.000 ve çekim 800.000, oran %50; hazırlık payı 120.000 yapılınca oran %40, çekim payı 480.000, hak devri 80.000 ve 320.000). Pay toplamı aşarsa değer kabul edilmez, hücre eski değerine döner ve hücrenin dibinde "Toplam kilitli: Hizmet Bedeli payı toplamı aşamaz. Toplamı değiştirmek için oranın yanındaki kilidi aç." çıkar. Toplamı değiştirmek kilidin işidir: aç, rakamları değiştir, kapat; kapanınca o anki iki rakamın toplamı yeni toplam, hak devrinin payı yeni oran olur.
- **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** KARAR 13 (1 Ekim 2026, Engin): hak devri satırında oran kutusu ve kilit, komisyonun "Oran %20" kutusuyla aynı yerde ("+ Dönem seç"in yerinde) durur; kilit oran kutusunun içinde, sağ yanında. Birim net kutusu normal yerinde. Kilitliyken oran yazılır, Birim net soluk ve hesaplanmış; açıkken Birim net yazılır, oran soluk ve o anki payı gösterir. Hak devri kendi dönemini seçmez, dönem dağılımını Hizmet Bedeli'nden alır; açık halde de tek rakamdır ve Hizmet Bedeli'nin dönem ağırlığıyla dağılır.
- **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** KİLİT AÇILIRKEN (1 Ekim 2026, Engin): önce Hizmet Bedeli'nin payları kayda yazılır, sonra hak devri toplamdan kalan olarak yazılır; birim fiyat yuvarlamasından doğan kuruşu hak devri taşır, toplam kuruşu kuruşuna korunur.
- ORAN HASSASİYETİ (1 Ekim 2026, Engin): kayıttaki hak devri oranı virgülden sonra 8 basamak tutar (göç `20261001130000`). İki basamak kilit kapanırken oranı yuvarlayıp hak devrini zıplatıyordu (612.345 / 387.655 → %38,7655 → %38,77 → hak devri 387.700). Ekranda oran iki basamakla görünür. Kilit kapanırken Hizmet Bedeli'nin rakamları (pay + hak devri) / pay ile büyütülür; oran büyütülmüş gerçek toplamdan hesaplanır, hak devri zıplamaz.
- **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** KİLİT YAZIMI (1 Ekim 2026, Engin): kilit açılırken ve kapanırken Hizmet Bedeli'nin birim ve dönem rakamları, hak devrinin rakamı ve oran tek işlemde yazılır (`fn_set_split_lock`); biri yarıda kalırsa hiçbiri yazılmaz. Rakamları ekran hesaplar (`split-lock.ts`), işlev yalnız doğrular ve yazar. Hizmet Bedeli 0 iken kilit kapanmaz: "Hizmet Bedeli 0 iken toplam kilitlenemez." Kilit açılınca hak devrinin miktarı ve X'i 1'e döner, rakamı Birim net'te durur.
- **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** KARAR 14 (1 Ekim 2026, Engin): kilitliyken Hizmet Bedeli'nin Miktar'ı, X'i ya da dönemi değişebilir; oran sabit kalır, toplam ve iki pay orantılı büyür. "Toplam kilitli" ifadesi "para paylaşımı kilitli" anlamındadır: kilit paranın iki kalem arasındaki paylaşımını korur; Miktar, X ve dönem takvim bilgisidir ve takvim değişince maliyetin büyümesi gerçek maliyettir.
- **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** PAY YAZIMI (1 Ekim 2026, 2b-3): kilitliyken Hizmet Bedeli'nin Birim net hücresine ya da bir dönem satırına yazılan rakam paydır; oran = (1 − yazılan pay / kayıttaki birim rakam) × 100, miktar ve X sadeleşir. Yazarken rakam yalnız hücrede durur. Pay 0 yazılırsa "Hizmet Bedeli payı 0 olamaz." Hak devri satırında Birim, Miktar ve X iki halde de yazılmaz (sabit, 1, 1); açıkken yalnız Birim net yazılır (Karar 13; 2b-2a'da açık hal yanlışlıkla normal satır gibi çizilmişti).
- **KALKTI (1 Ekim 2026, İKİ KURAL — aşağıdaki blok):** 2b PARÇALARI: 2b TAMAMLANDI (1 Ekim 2026). 2b-1 hesap ve gösterim; 2b-2a hak devri satırının görünüşü, oran yazma, kilitli hak devrinde "Bedel 0" uyarısının kalkması (uyarı kayıttaki 0'a bakıp Yasal Yük hanesini kapatıyordu, Engin'in canlı bulgusu); 2b-2b kilidi açıp kapama (göç `20261001130000`); 2b-3 Hizmet Bedeli payını elle değiştirme. Hak devri silinirken sorulacak soru (Karar 9) 2c'ye taşındı; Karar 11 sayesinde silmede kayda bir şey yazılmaz.
- 2c PARÇALARI: 2c TAMAMLANDI (1 Ekim 2026). 2c-1 komisyon tabanı ve silme kuralları: zımbalı komisyon özet toplamından (Hizmet Bedeli + hak devri) × oran; yönetmen satırının ×'i zımbalılarla birlikte tek güncellemede siler ve soru silinecekleri adıyla söyler; zımbalı komisyon × ile normal silinir ("oranı 0 yapın" yalnız 1600'ün tikten doğan komisyonunda); kilitli hak devri silinirken soru "<hak devri> silinecek, <rakam> Hizmet Bedeli'ne eklenecek." der, kayda bir şey yazılmaz. 2c-2 %50 uyarısı: eşiği geçme anında, oran kutusunun dibinde; kart açılışında zaten üstte olanlar için çıkmaz; eşik bulunamazsa uyarı çalışmaz.
- %50 UYARI METNİ (1 Ekim 2026, Engin): 30 Eylül metnindeki "kaşe" sözcüğü güncellenir: "Hak devri oranının Hizmet Bedeli'nden çok daha yüksek olması, Avrupa fonlarında (örn: CNC) 'gizli maaş' (salaire déguisé) denetimlerine takılma riski taşır. Oranı dengede tutmanız önerilir." Uyarı hak devrinin payı eşiği geçtiği ANDA (oran yazınca, pay yazınca, açıkken rakam yazınca, kilit kapanınca) hak devrinin oran kutusunun dibinde çıkar; kart açılırken zaten eşiğin üstünde duran satır için çıkmaz. Eşik oran cetvelinden (`parametre_hak_devri_esik`), mühürlü bütçede mühür anındaki değer.
- %50 UYARISI DÜZELTMESİ (1 Ekim 2026, Engin'in canlı bulgusu): uyarı yalnız kaydedilmiş değerle değerlendirilir. Yazarken her harf satıra işlendiği için 60 → 70 yazarken oran bir an 7 oluyor ve yanlış uyarı çıkıyordu.
- KÜTÜPHANEDEN BAŞLIKSIZ KALEM (1 Ekim 2026, Engin'in canlı bulgusu; göç `20261001140000`): kişi verilmemişse başlığı olmayan kalem başlıksız eklenir. 19 Eylül kuralı (başlıksız kalem yalnız kişiye bağlanarak eklenir) başlığı hiç olmayan 1500 kartında kütüphaneden 1501 Yönetmen eklemeyi kapatıyordu; şablondan geldiği için görülmemişti. Kişi soran kalemlerin kişisiz eklenemez kuralı değişmedi.

**KALKTI (2 Ekim 2026, DÜZ SATIR — aşağıdaki blok):** **HAK DEVRİ İKİ KURAL (1 Ekim 2026 akşamı, Engin kararı; kilit modelinin YERİNE):**
- GEREKÇE: kilit kolaylık olarak istenmişti (oranla otomatik hesap); bir moda dönüştü. Kilitliyken Hizmet Bedeli'nin kaydı toplamı, ekranı payı taşıdı ve aynı hücreye yazılan rakam kilide göre başka anlama geldi: dönem eklenince rakam yazılamadı, toplam 0 iken hiçbir şey yazılamadı, kilit açılınca kuruş çıktı. Engin'in metni (1 Ekim 2026, BİREBİR):
> her açıdan değerlendir. kendini kullanıcı yerine koy, 40 küsur karttan oluşan bir bütçe söz konusu pek çok değişken var. bir davranışı öğrendikten sonra farklı bir karta geçiyorsun, o karttada başka bir davranış var, sonra başka bir kart ve yine farklı.  her kartın kendine has bir yapısı var ona göe değişiklikler olabilir ama sürekli değişimler, farklı satırlar veya algoritmik yapı bir süre sonra enigma şifresi çözüyor hissi yaratır.  kaapada en başından bazı vizyon öerileri konuştuk. ilk konular, uygulamanın basit kolay öğrenilen ve keyifli bir çalışma ortamı sunmasıydı. bundan uzaklaştığımızı hissediyorum. bu kilit mekanizması tuz biberi oldu. yönetmen kaleminin ihtiyaçları sebepleri istenilen sonuçları ile ilgili herşeyi konuştuk. şimdi senden bir gözden geçirme yapmanı istiyorum. bu yapı benim yönlendirmem ile ortaya çıktı fakat , eğer; isediğimiz sonuçları aldıracak, veri veya logic farkı  oluşturmayacak yeni bir tasarım önerin olur mu?, olursa nasıl olur. bu tasarım işe yarar ve ihtiyacı karşılayan tasarımmı, daha az karmaşık ve zihniyetimize , vizyonumuza uygun hale gelebilir mi? yoksa bu iyi mi. Nedir değildir. ciddi bir analiz yapmanı ve bizi sonuca ulaştırmanı istiyorum. sonuçları kısa net ve basit bir şekilde ver
- KURAL: yazılan satır değişir, öbürü kendini ayarlar. Kilit, açık hal ve mod YOK.
  1. Hizmet Bedeli'ne yazılan BÜYÜKLÜĞÜ değiştirir: hak devri = Hizmet Bedeli × oran / (100 − oran). Hizmet Bedeli her zaman kendi rakamını tutar ve gösterir; rakam, dönem, miktar, sıfırdan başlamak her satırdaki gibi çalışır.
  2. Hak devrine yazılan (oran ya da tutar) PAYLAŞIMI değiştirir: toplam sabit kalır, Hizmet Bedeli yeniden yazılır. Oran ve tutar aynı şeyin iki görünüşüdür.
  3. Hak devri eklenince Hizmet Bedeli'ndeki rakam %50 bölünür (paylaşımı 0'dan 50'ye çekmek, 2. kuralın ilk uygulaması). Hak devri silinince rakamı Hizmet Bedeli'ne döner (paylaşımı 0'a çekmek).
- KAYIT: Hizmet Bedeli kendi rakamını, hak devri oranını (`split_rate`, 8 basamak) tutar; hak devrinin rakamı saklanmaz (B18). Hak devri oran 0 ile doğar, %50 bölmeyi ekran yapar; böylece eklemede toplam bir an bile ikiye katlanmaz (göç `20261001150000`). Yeniden yazım tek işlemde: `fn_set_split_share` (silmede hak devri aynı işlemde kapanır). Hizmet Bedeli rakamları tam TL'ye yuvarlanır, oran yazılan gerçek rakamdan hesaplanır, hak devri toplamdan kalanı alır: toplam kaymaz, kuruş çıkmaz. Bordro statülü Hizmet Bedeli bölünmez (net motordan gelir).
- KAYBEDİLEN: "hak devri sabit kalsın, Hizmet Bedeli değişince toplam büyüsün" davranışı; iki yazımla yapılır. 30 Eylül örneğindeki "Hizmet Bedeli 600 → hak devri 400" sonucu hak devrine 400 yazılarak alınır.
- DEĞİŞMEYENLER: Kime?, zımba, adlar ve özet, komisyon tabanı (Hizmet Bedeli + hak devri), %50 uyarısı, silme soruları, oran hassasiyeti (8 basamak).
- UYGULAMA: 2d-1 kayıt ve hesap UYGULANDI (1 Ekim 2026, `fd001ec`). 2d-2 ekran üç dilimde (2 Ekim 2026, Engin kararı): 2d-2a kilidin sökülmesi, hak devrinde oran ve tutar yazımı, silmede rakamın dönüşü UYGULANDI (2 Ekim 2026); 2d-2b eklemede %50 bölme SIRADA; 2d-2c göç (`fn_set_split_lock` kaldırılır, `setSplitLock` servisten çıkar). Gerekçe: kilit kodu dokuz dosyaya dağılmıştı, yarım söküm çalışmayan ekran bırakırdı; 2d-2a bu yüzden beş dosya sınırını bilerek aştı.
- TOPLAMI AŞAN TUTAR (2 Ekim 2026, Engin kararı): hak devrine toplamdan büyük ya da toplama eşit tutar yazılırsa değer kabul edilmez, hücre eski değerine döner ve hücrenin dibinde "Hak devri toplamı aşamaz. Toplamı büyütmek için Hizmet Bedeli'ni değiştir." çıkar. Hizmet Bedeli 0 iken oran yazılırsa yalnız oran kaydedilir; tutar yazılması aynı mesajı verir. Gerekçe: kural 2'de toplam sabit kaldığı için toplamı aşan pay mümkün değil, kullanıcıya bunun neden olmadığı söylenmeli. **(DÜZ SATIR, 2 Ekim 2026: geçersiz; hak devrine yazılan rakam toplamı değiştirmez, kendisidir.)**

**HAK DEVRİ DÜZ SATIR (2 Ekim 2026, Engin kararı; İKİ KURAL bloğunun YERİNE):**
- GEREKÇE: iki kural sahada denendi (2d-2a). Hak devri gelince dönemli Hizmet Bedeli bütün dönemlerinde yarıya iniyordu; hak devri planlanan ödemeyi belirleyen bir araca dönüşüyordu. Dönem rakamı girilince hak devri büyüyüp küçülüyordu. Ödeme planı bir takvim, hak devri aynı paranın vergi/telif sınıflandırması; iki kural bu iki ekseni aynı satıra bağlamıştı. Aynı gün kilitli ve iki modlu bir yapı (açıkken alttan toplama; kapalıyken tavan, tahterevalli ve "Fark" uyarısı) önerildi ve değerlendirildi: kilit 1 Ekim'de kaldırılan modu geri getiriyor, oran değişince dönemleri yine yeniden yazıyordu. Engin kilidi tamamen attı. Engin'in metni (2 Ekim 2026, BİREBİR):
> kilidi tamamen atıyorum. hak devri eklendiğinde sadece oransal bir uyarı çıkacak.
> hizmet bedeli satırı oluştuğunda, özete bu rakam çıkacak, ardından dönem eklemek istediğinde eklediği dönemlere istediği rakamları yazacak ve bu rakam özete eklenecek, vermek istediği rakamı aşarsa, dönemleri kendisi düzenler. hak devri eklendiğinde orada göreceğimiz şimdi olduğu gibi bir satır ve buraya girilen rakam da özete eklenir. oran kolonu, özet satırındaki toplam rakamın yüzde kaçı olduğunu gösteri. % 55 i geçtiğinde uyarı verir. bu kadar.
- KURAL: hak devri düz satırdır; yazılan rakam yalnız kendi satırını değiştirir. Hizmet Bedeli'ne ve dönemlerine hiçbir yazım dokunmaz. Özet satırların toplamıdır. Kilit, mod ve tavan YOK.
- HAK DEVRİ SATIRI: boş (0) gelir. Birim net'e yazılan rakam hak devrinin kendisidir; Birim, Miktar ve X sabit (1, 1). Oran kutusu Dönemler kolonunun yerinde durur, yazılmaz, payı gösterir. Hak devri her satır gibi uyarı alır (0 iken "Bedel 0").
- ORAN TABANI (2 Ekim 2026, Engin kararı): pay = hak devri / (Hizmet Bedeli + hak devri) × 100; komisyon hariç. Gerekçe: komisyonun tabanı zaten bu toplam, CNC'nin baktığı şey de kaşe ile telif arasındaki denge; yönetmen ajansının payı bu dengenin parçası değil. Pay saklanmaz, her an hesaplanır (B18).
- UYARI: pay %55'i geçtiği ANDA oran kutusunun dibinde çıkar; metin ve zamanlama değişmedi (%50 UYARI METNİ, %50 UYARISI DÜZELTMESİ). Pay Hizmet Bedeli değişince de değişir; tetik hangi satırdan gelirse gelsin aynıdır.
- **UYARI HEDEF MECRA'YA BAĞLANDI (3 Ekim 2026, Engin kararı; kodu ayrı dilimde):** hak devri oran uyarısı Hedef Mecra kurulana kadar hiçbir bütçede çıkmaz. Eşik parametresi (%55) ve uyarı metni yerinde kalır; Hedef Mecra'da "yurt dışı fon" seçilince yeniden açılır. Gerekçe: kurum denetimi kartın günlük davranışına değil, Hedef Mecra'ya aittir (1 Ekim 2026 ilkesi). Engin'in metni (3 Ekim 2026, BİREBİR):
> 1500 deki yönetmen kalemine bağlanan hak devri içinde bir ampul yandı kafamda. burada çıkan uyarı (hak devri oran uyarısı) şu an yaptığımız şablonda çıkmamalı, bütçe yurt dışı fonlar için hazırlanıyorsa çıkmalı bu uyarı. türkiyede yönetmen hizmet bedeli de hak devri de aynı vergilendirme diliminde (%17) bu uyarı anlamsız oluyor, bütçe yurtfışı fonlar için hazırlanıyorsa ve vergilendirmenin hak devrinde belirli bir oranı geçmesi durumunda denetime tabii olan region lar için geçerli bu. yine gerekecek ama türkiye için hazırlanan bütçelerde değil

**UYGULANDI (3 Ekim 2026, KART 1300 Dilim 2):** uyarının tek anahtarı `SPLIT_WARN_ACTIVE` (`src/app/muhasebe/budget/split-share.ts`) bugün kapalı: kart açılırken eşik okunmaz, balon çıkmaz. Hak devri satırının oran kutusu (pay) yerinde. Eşik parametresi (%55), uyarı metni ve eşik hesabı duruyor. Hedef Mecra kurulunca anahtarın yerini bütçenin "yurt dışı fon" hanesi alır.
- SİLME: hak devri normal silinir; rakamı hiçbir yere dönmez, özet küçülür.
- UYGULAMA: dilim 1 ekran ve hesap UYGULANDI (2 Ekim 2026): bağ hesabı, yeniden paylaştırma, silmede dönüş ve hesaplanan Birim net söküldü; oran ve uyarı hesaplanan paydan okunur. Dilim 2 göç ve servis UYGULANDI (2 Ekim 2026, göç `20261002120000`): `budget_items.split_rate`, `fn_set_split_share` ve `fn_set_split_lock` kalkar; `fn_add_budget_item` oran yazmaz; eşik 50'den 55'e; hak devri atomunu tanıyan işaret `default_split_rate` yerine `item_library.is_rights_transfer` işaretine geçer; servislerden oran yazımı çıkar (göçten önce veritabanına salt okuma sorgusu, Engin'in SQL onayı). Dilim 1 beş dosya sınırını bilerek aştı: yarım söküm çalışmayan ekran bırakırdı.

**Reddedilen:** kişi listesi modelinin 1500'e taşınması; kütüphane başlıkları (dört grup); tek kalemli başlığın çizilmemesi kuralı.

**Alınmayan adaylar:** Teknik Danışman (2100 turunda), Dialogue Director (post), geliştirme moodboard/konsept (1100'de 1104-03/1104-05), Associate Director / Direction Trainee / Creative Consultant / Assistant Choreographer, Prep/Shoot/Post (etap ekseni), avans/bonus/royalty.

### 7.5 KART 1600 — OYUNCU  [KİLİTLİ]
*Üst-grup: OYUNCU · Etap: Yapım (casting Yapım Öncesi'ne sarkar) · Recoupable DEĞİL · Görünürlük: KISMİ MASKE (baş-kaşe satırları set rollerine gizli/çoğul, gerisi açık) · DB'de muhasebe tam · anomali aktif.*
Tek kart; Koster Cast(1600)+Atmosphere(3900) birleşik (4-kaynak örtüşmesi — gerekçe GEREKCELERI). Kod = Koster köken (provenance); KAAPA item_code ayrı (#0001); [K!] = KAAPA atadı (Koster numarasız); kesin katalog kodu kütüphane resmîleşince (karar 2026-07-21: iki-kod doktrini kilitlendi — item_code kimlik olarak kalır, MMB-uyumlu katalog kodu kanonik alan olarak doğar, aidiyet=kod aralığı, çok-kart=ayrı kod, serbest kalem x698 muhtelif alt-kodu; detay BUTCE-SEMA-KARARLARI §H–L). cost_object=Stunt etiketi içsel-stunt kalemlerde oto (§4.10). PARKTA (24 Eylül 2026), bkz. aşağıdaki 24 EYLÜL 2026 KARARLARI. [Ç]=çekirdek şablon · [K]=kütüphane.

**Dört başlık (KART 1600 M2, 5 Eylül 2026, Engin kararı):** Aidiyet artık kutuphanede VERİDİR (`item_library.heading_id`), koddan türetilmez — Kast Operasyonu başlığı hem 16xx hem 39xx atom taşıdığı için tire-öncesi parçadan türetme bu kartta prensip olarak çalışmaz (bkz. BUTCE-SEMA-KARARLARI, DEĞİŞMEZLER md.2). Dört başlık kodu KAAPA yapısal koddur, Koster kodu değildir (provenance=KAAPA), tire biçimi 1100'ün tire-sonrası atom deseninin TERSİDİR (burada başlık tire taşır, atomlar düz dört haneli kalır):
- 1600-01 Ana Kast — Principal Cast
- 1600-02 Dublör — Stunts
- 1600-03 Arkaplan — Background
- 1600-04 Kast Operasyonu — Casting Operations

**Görev listesi (19 atom, `is_duty=true`):** 1601, 1602, 1603 (Ana Kast) · 1604, 1606, 1607, 1608 (Dublör) · 3901, 3902, 3903, 3904, 3916, 3917 (Arkaplan) · 1605, 1609, 1612, 1613, 1615, 3914 (Kast Operasyonu). Kodda gömülü aralık YOK; `fetchDutyOptions` tek koşulla okur (`is_duty=true`). Görev OLMAYAN 10 atom (12 Eylül 2026'da 1618-01 eklenince 9'dan 10'a çıktı): 1614, 1620 (Ana Kast) · 1610, 1619, 3910, 3913 (Kast Operasyonu) · 1611, 1616, 1618, 1618-01 (aidiyet hanesi BOŞ — başlık kişinin karttaki satırından gelir, bkz. AİDİYET KURALI).

**Şablon (KART 1600 M3, 5 Eylül 2026, Engin kararı; atom sayısı 12 Eylül 2026'da 28'den 29'a çıktı, bkz. aşağıdaki ATOM SAYISI GÜNCELLEMESİ; çekirdek set 12 Eylül 2026'da 13'ten 17'ye çıktı):** Kart aktif sistem şablonuna girdi (üçüncü kart, 1100+1500'ün yanına — mevcut bütçelere dokunmadı, kart yalnız YENİ açılan bütçelerde doğar). 29 atomun 17'si [Ç] işaretli, şablonun çekirdek satır setini oluşturur: 1601, 1602, 1603, 1604, 1606, 1607, 3901, 3902, 3903, 3904, 3917, 1605, 1609, 1610, 1613, 1615, 1619. Kalan 12 atom ([K]) şablona girmez, kütüphaneden elle eklenir: 1611, 1614, 1616, 1618, 1618-01, 1608, 3916, 1612, 3910, 3913, 3914, 1620. Kartın `misc_prefix` hanesi `"39"` — kart kodu `16` değil, çünkü MMB'nin kendi 1600 Talent bloğu 1698 Miscellaneous + 1699 Fringe ile bitiyor ve kart-kodu-öneki muhtelif üretseydi bu ikisiyle çakışırdı (15 Ağustos 2026 kararı zaten bu yüzden serbest kalemi 39xx'e yönlendirmişti).

**Grup 1 — Ana Kast** (ödeme-statüsü §4.8; baz+ek; "on-hold" paket kaşe)
- 1601 Stars / Principal Roles — Başrol Oyuncu: kaşe GİZLİ, normalde çoğul; sette olmasa da anlaşılan tutar ("on-hold"). cost_type=İşçilik. Statü: smm (sözleşmeli oyuncu kendi faturasını keser). [Ç]
- 1602 Supporting Cast — Yardımcı Oyuncu: loan-out şirketi olabilir (istisna). cost_type=İşçilik. Statü: smm (sözleşmeli oyuncu kendi faturasını keser). [Ç]
- 1603 Day Players — Günlük Oyuncu: ≤3 gün replikli küçük roller. cost_type=İşçilik. Statü: bordro. [Ç]
- 1611 Overtime — Mesai: fazla mesai. Turnaround (yetersiz dinlenme telafisi) AYRI kavramdır ve bu atomdan çıkarıldı — bkz. aşağıdaki Turnaround notu. Statü: bordro. Şablona GİRMEZ, genel eklemede "Kime?" adımıyla gelir, 23 Eylül 2026'da blok içi eklemenin yerini aldı (1 Eylül 2026 kararı, bkz. aşağıda). [K]
- 1616 Rehearsal — Prova: çekim öncesi prova ücreti. Statü: bordro. [K]
- 1614 Residuals — Tekrar Telifi: yeniden yayın/gösterimden süregelen ödeme (ayrı maliyet doğası). Statü: telif_belgeli. [K]
- 1618 [K!] Ajans Komisyonu — Agency Commission: oyuncunun ajansına ödenen komisyon; varsayılan statü Fatura, birim sabit, kalem ekleme listesinde görünmez. GRUP 4'TEN BURAYA TAŞINDI (1 Eylül 2026, Engin kararı): satır ekranda oyuncunun özeti altında çizilir; katalog grubunun çizim yerinden farklı olması aynı olguyu iki yerde iki türlü söylerdi. [K]
- 1618-01 [K!] Menajer Komisyonu — Management Commission (12 Eylül 2026, Engin kararı): oyuncunun menajerine ödenen komisyon; heading_id ve default_derive_rate 1618 ile AYNI, varsayılan statü SMM, birim sabit, kalem ekleme listesinde görünmez. 1618'den AYRILDI: cins bugüne kadar 1618'in statüsünden (Fatura/SMM) okunuyordu, kullanıcı statüyü elle değiştirince satırın kimliği bozuluyordu; artık cins atomda yaşıyor, statü yalnız vergi olgusu. [K]

**Grup 2 — Dublör** (stunt PERFORMANS · baz+stunt adjustment · cost_object=Stunt oto, PARKTA 24 Eylül 2026)
- 1604 Stunt Coordinator — Dublör Koordinatörü: stunt'ı tasarlar/yönetir; uzmanlık (su/ateş/motor); başrolün dublörü olabilir. Statü: smm. [Ç]
- 1606 Stunt Performers — Stunt Oyuncusu: genel stunt rolleri (düşen/dövüşen figürler). Statü: bordro. [Ç]
- 1607 Stunt Doubles — Dublör: belirli oyuncuya benzetilip onun yerine tehlikeli çekime giren. Statü: bordro. [K]
- 1608 Stunt Utility — Aksiyon Teknisyeni: belirli double olmayan, genel amaçlı ek stunt iş gücü. Statü: bordro. [K]
- Grup 2'nin ödeme statüleri ONAYLANDI (5 Eylül 2026, Engin'in saha bilgisi) — 4 Eylül 2026'daki "HENÜZ ONAYLANMADI" notu bu maddeyle kapanmıştır.

**Grup 3 — Arkaplan Oyuncusu** (Background Actors · sadece kişiler · AÇIK · baz+premium)
- 3901 General Extras / Background — Genel Arkaplan Oyuncusu: repliksiz, sahneye hayat veren kalabalık. Statü: sirket (figüranı ajans temin ediyor, ajans kendi 4/a'lisini hizmet olarak veriyor, yapımcı ayrıca sigortalı bildirimi yapmıyor). [Ç]
- 3902 Stand-Ins — Stand-In: oyuncu yerinde set ışıklanırken duran; regular'dan fazla kazanır. Statü: sirket (ajans modeli, bkz. 3901). [Ç]
- 3903 Silent Bits — Sessiz Rol: repliksiz ama öne çıkan/eylemli figür; premium. Statü: sirket (ajans modeli, bkz. 3901). [K]
- 3904 Special Ability — Özel Yetenekli Arkaplan: beceri/tehlike (yüzücü/binici); baz + ek. Statü: sirket (ajans modeli, bkz. 3901). [K]
- 3917 [K!] Specialty Background (FR: Silhouette) — Özel Tip: belirli fiziksel tip/görünüm için (dönem yüzü, ayırt edici tip). KAAPA-eklemesi. Statü: sirket (ajans modeli, bkz. 3901). [K]
- 3916 [K!] Dancers — Dansçı: koreografili sahne dansçıları. Statü: smm. [K]

**Grup 4 — Kast Operasyonu** (hizmet/destek, talent değil)
- 1605 [K!] Casting Director — Cast Direktörü: oyuncuları seçen/yöneten kişi. cost_type=Hizmet (DEĞİŞTİ 6 Ekim 2026: gider çeşidi Personel Ücreti, gri bölge kuralı; BUTCE-SEMA-KARARLARI, GİDER ÇEŞİDİ EKSENİ). Statü: smm. [Ç]
- 1609 [K!] Casting Assistant — Cast Asistanı. Statü: bordro. [Ç]
- 1610 Screen Tests — Deneme Çekimi: seçme sürecindeki deneme çekimi gideri (Koster kökeni, damıtım satır 691). Statü: sirket. [Ç]
- 1619 [K!] Casting Expenses — Cast Gideri: seçme sürecinin deneme çekimi dışındaki giderleri (1610'dan ayrıldı, 4 Eylül 2026 — bkz. aşağıdaki 1610/1619 AYRIMI). Statü: sirket. [Ç]
- 1613 ADR / Looping — Dublaj: oyuncunun post diyalog yeniden-seslendirme seansı. Statü: smm (performans ücreti). ÇAPRAZ: 5300 Post Ses alias — stüdyo/miksaj orada (5300 kendi satırı, sadece işaretçi; çift-sayım denetimi). [Ç]
- 1620 [K!] ADR Buyout — ADR Hak Devri: ADR/dublaj seansındaki performansın hak devri bedeli, 1613'ten ayrı satır. Statü: telif_belgeli (hak devri). [K]
- 1615 Set Teacher — Set Öğretmeni: çocuk/minör oyuncuda ZORUNLU (compliance). cost_type=Hizmet (DEĞİŞTİ 6 Ekim 2026: gider çeşidi Personel Ücreti, gri bölge kuralı; BUTCE-SEMA-KARARLARI, GİDER ÇEŞİDİ EKSENİ). Statü: smm. [Ç]
- 1612 Cast Musicians — Müzisyen: sahnede/kayıtta görünen müzisyenler. Statü: smm. [K]
- 3913 Extras Casting — Arkaplan Oyuncusu Castingi: figüran/kalabalık seçim ajansı. Statü: sirket. [K]
- 3914 Crowd Controllers — Kast Sorumlusu: set figüran/kalabalık sevki (Türk saha terimi). Statü: bordro. [K]
- 3910 Extras Wardrobe Allowance — Arkaplan Kostüm Ödeneği: kendi kıyafetini getirmesi için ödenek. Statü: sirket. [K]
- 3915 Payroll Service — Bordro Hizmeti: KART 1600'DEN ÇIKARILDI (5 Eylül 2026, Engin kararı). Kütüphaneye tohumlanmadı, görev listesine girmez.

**Kart dışı (köken kodu ≠ KAAPA Oyuncu kartı):**
- 1617 Contractuals — Sözleşmesel → item_burdens (yüzde/yük, kart gövdesinde değil; percent_line adayı §8).
- Stunt Vehicle — Stunt Aracı → TRANSPORT kartı · cost_object=Stunt (o kartın kodunu alır).
- Stunt Rigging — Stunt Rig / Kurulum → MEKANİK FX kartı · cost_object=Stunt.
- 1503 Choreographer — Koreograf → 1500'de KİLİTLİ (alias; Master Oyuncu'da görse de yeri 1500).
- Crowd AD (reji asistanı) → Prodüksiyon Ekibi / AD kartı (2100+). Ayrım: Kast Sorumlusu (3914) figüranı SEVK eder; Crowd AD sahneyi YÖNETİR (reji). 1500'de YOK (1500 yalnız 1505 yönetmen özel asistanı, set reji departmanından ayrı).

**Stunt = doğa-bölmesi:** tek "Efekt & Dublör" kartı YOK. Performans→Oyuncu (bu kart), araç→Transport, mekanik→Mekanik FX. Üç kartın stunt satırları cost_object=Stunt taşır → CFE tek "Stunt toplam" (§4.10). Gerçekten etkilenen diğer kartlar: Transport, Mekanik FX (5300 değil — alias işaretçi).

**1600/3900 KARARI (DILIM 1100-A, 15 Ağustos 2026, Engin):** 3900 kodları 16xx'e TAŞINMAZ — Grup 3/4'ün 39xx satırları (3901-3915) kendi aralığında kalır. Kartın kütüphanesi İKİ aralığı birden gösterir (16xx + 39xx, iki köken bloğu; ikisi de KART 1600'e aittir — aidiyet kart koduna değil bu kartın tanımladığı ARALIKLAR kümesine bağlanır). Serbest kalem eklenirse 39xx kod alır (16xx değil). Sonuç: mevcut kod-aralığı doktrini (K-B) tek-aralık varsayımıyla yazılmıştı; library-service.ts'teki iki-hane (`catalogCode.slice(0,2)`) aidiyet kuralı ve fn_add_budget_item'daki `substr(p_catalog_code,1,2) = substr(v_card_code,1,2)` aralık denetimi 1600 turunda genişletilecek. BU DİLİMDE YAPILMADI, kayıt olarak düşer.

**Kapandı, 5 Eylül 2026.** Yukarıdaki paragrafın son cümlesi ("BU DİLİMDE YAPILMADI, kayıt olarak düşer") artık eskidir: genişletme değil KALDIRMA yapıldı — K-B doktrini iptal edildi, aidiyet artık `item_library.card_code` alanında veridir, önek aritmetiği dört yerden de söküldü (bkz. BUTCE-SEMA-KARARLARI §I).

**KART 1600 ÜÇ KADEMELİ YAPI KARARI (21 Ağustos 2026, Engin):** Oyuncu satırı, temsilcisi varsa üç kademeli yapıya döner — kart grubu → oyuncu özet başlığı → alt kalemler (temsilci sayısı kadar). Başlık kademesi para taşımaz, altındaki alt kalemlerin toplamını gösterir; temsilcisiz oyuncu tek satır kalır, başlık doğmaz. Her alt kalem kendi ödeme statüsünü taşır (ajans faturası ≠ menajer SMM, farklı statüler tek satıra sığmaz). Detay: CURRENT.md "KART 1600 TASARIM KARARLARI" bölümü.

**KART 1600 TASARIM KARARLARI (22 Ağustos 2026):**
- Menajerlik/temsil komisyonu 1400'de değil, oyuncunun kendi özeti altında yaşar. 1406 paketleme ücreti ayrı kalır.
- Alt kalem sayısı temsilci sayısı kadardır. TERSİNE DÖNDÜ (12 Eylül 2026, Engin kararı): "Ajans ile menajer AYRI ATOM GEREKTİRMEZ; fark statüde yaşar ve statü satır bazında seçilir. Tek bir 'Temsilci Komisyonu' atomu yeterlidir" kuralı KALKTI, yerine fark ATOMDA yaşar — 1618 Ajans Komisyonu ve 1618-01 Menajer Komisyonu iki ayrı atomdur. Gerekçe: statü kullanıcı tarafından değiştirilebilir bir vergi hanesidir, kimlik taşıyamaz.
- Bu atom kataloga eklenecek (emsal: 1100'e üç yeni atom eklenmesi, gerekçesi KART-GEREKÇELERİ.md'ye yazılmıştı). Atom kalem ekleme listesinde GÖRÜNMEZ (is_group desenindeki gibi gizli), çünkü yalnızca türetme ile doğar.
- Komisyon tabanı: oyuncunun TÜM satırlarının (kaşe, mesai, prova, tekrar telifi) çıplak net toplamıdır — tek kalemden değil. Komisyon satırının kendisi tabana dahil EDİLMEZ.
- Komisyon oranı şablondan %20 varsayılan gelir, kullanıcı değiştirebilir. Rekabet Kurulu 21.05.2026 kararı oranı serbest bırakmıştır; piyasa %20 civarında yoğunlaşmıştır. %20 yalnızca kolaylık içindir, zorlama değildir.
- Ajans faturası normal faturadır; komisyonun KDV'si yapımcının maliyetidir ve KDV kolonunda görünür.
- Loan-out şirketi İSTİSNA DEĞİLDİR: statü satır bazında zaten seçilebilir.
- Dönem varsayılanları (yalnızca şablon varsayılanı, yeni bir eksen değil): 1616 Prova → Yapım Öncesi, 1611 Mesai → Yapım, 1614 Tekrar Telifi → Yapım Sonrası. Temsilci satırı dönem seçmez (Dönemsiz). **KAPANDI (24 Eylül 2026, Engin kararı):** dönem varsayılanları uygulanmayacak; bu üç kalemin dönemini kullanıcı satırda seçer. Gerekçe: sözleşmede taahhüt edilen 1616 Prova öngörülen bütçede rol satırına gömülür (11 Eylül 2026 ÖNGÖRÜLEN/GERÇEKLEŞEN ayrımı), 1614 Tekrar Telifi kâr paylaşımının konusudur (19 Eylül 2026 PEKİŞTİRME); geriye yalnız 1611 Mesai kalır. Varsayılanı taşımak için bütün bütçelerde ortak olan kütüphaneye, her bütçede ayrı doğan etabı gösteren bir hane açmak gerekirdi; tek kalemde tek seçimi kurtarmak için şema değişikliği pahalı bulundu. Temsilci satırının dönemsizliği (BUTCE-EKRAN-KARARLARI §20 KOMİSYON SATIRININ DOĞUMU madde 7) bu kapanıştan etkilenmez.
- Satırları bir arada tutan şey kod veya yazılan isim DEĞİL, ETİKETTİR. Mevcut budget_cost_objects tablosu bu iş için kullanılacak (göç yorumunda "Oyuncu: Ahmet" örneği zaten var). Alt-kod yolu (1601-1, 1601-2) REDDEDİLDİ: tire zaten grup üyeliği anlamında kullanılıyor (item_library.catalog_code açıklaması: üyelik tire öncesi parçadan türer).
- ÇÖZÜLDÜ (1 Eylül 2026, KART 1600 M1): budget_items tek bir cost_object taşıyordu; Grup 2 için öngörülen otomatik "Stunt" etiketi ile kişi etiketi aynı alana sığmıyordu. Etikete kind (kişi/iş) kolonu eklendi, kaleme ikinci bağ (person_object_id) açıldı, cins denetimi trg_check_cost_object_kind tetiğiyle korunuyor.
- Birim cetveli yedi değerli olacak: gün / hafta / ay / bölüm / film / saat / sabit. ("film" eklenir, "bölüm" dizi için kalır, "saat" mesai için gerekli.)
- MESAİ ŞABLONDAN GELMEZ (1 Eylül 2026, Engin): kartın şablonuna girmez, genel eklemede "Kime?" adımıyla doğar (23 Eylül 2026 düzeltmesi: blok içi ekleme kapandı, yerini asks_person aldı; bkz. BUTCE-EKRAN-KARARLARI.md §20 İKİ AYRI EKLEME YERİ). 1611 Mesai zaten [K] işaretliydi; bu karar onu doğrular. (Bu satır "Ek Çekim" atomunu da kapsıyordu; o atom 4 Eylül 2026'da kataloğun kendisinden çıkarıldı — bkz. aşağıdaki Ek Çekim notu — bu satırdaki ikinci referans artık konusuz.)
- NOT (1 Eylül 2026): grupların başlığındaki "baz+ek" ifadesi bugün yalnız insanın okuduğu bir cümledir, VERİ DEĞİLDİR. Blok içi ekleme listesinin ek atomları süzebilmesi için bir hane gerekiyor; hangi hanede yaşayacağı AÇIK. **KAPANDI (23 Eylül 2026, Engin kararı):** hane yalnız blok içi ekleme listesinin ek atomları süzmesi için gerekiyordu; blok içi ekleme kapandığı için soru konusuz kaldı, hane açılmaz.
- KAPANDI (12 Eylül 2026, Engin kararı): soru iki ayrı eksene ayrıldı ve ikisi de cevaplandı. (1) SATIR ZATEN DOĞUYOR: 9 Eylül 2026 getirme yolu kişinin Görev hanesindeki kodu `fn_add_person_items` üzerinden `fn_add_budget_item` kütüphane moduna veriyor; bu yol şablon üyeliğine BAKMAZ, yalnız kartın aralığını denetler. "İsimler mevcut satırlara biner, yeni satır açmaz" cümlesi geçersizleşmiş değil, UYGULANMAMIŞ bir karardı; 16 Eylül 2026'da farklı bir biçimde uygulandı, bkz. aşağıdaki YER TUTUCU SATIR İSİM GELİNCE GİDER maddesi. (2) ŞABLON ÜYELİĞİ ayrı bir sorudur — yeni açılan bütçede hangi satırların matbu geleceği — ve karara bağlandı: 1607, 3903, 3904, 3917 çekirdek sete alındı; 1608, 3916, 1612, 3914 kütüphanede kaldı.
- YER TUTUCU SATIR İSİM GELİNCE GİDER (16 Eylül 2026, Engin kararı): Bir görevde isim varsa o görevin yer tutucu satırı durmaz, RAKAMIYLA BİRLİKTE gider; isim yoksa satır durur. Yer tutucunun işi kast belli değilken öngörü rakamını taşımaktır (`docs/butce/KART-KATALOGU.md` §7.5 öngörülen/gerçekleşen ayrımı); isimler gelince o iş biter ve her oyuncu kendi satırında kendi rakamıyla değerlendirilir. YER TUTUCU BİR GİRİŞ YOLU DEĞİLDİR: kişi girişi Oyuncular listesinden ya da "kalem ekle"den yapılır — ajans ve menajer yalnız listeden gelebildiği için yer tutucuya isim yazmak zaten eksik bir giriş olurdu. Uygulama `fn_add_person_items` içinde, kişiler bağlandıktan sonra: o çağrıda kişi gelen her atomun kartta kalan kişisiz satırları pasife çekilir. Kapsam yalnız getirme anıdır; kart üzerinde bir satıra elle kişi iliştirilirse yer tutucu kendiliğinden gitmez. Göç: `20260912140000` — dosya adındaki damga 12 Eylül gösteriyor ama karar 16 Eylül 2026'da alındı ve göç o gün uygulandı; uygulanmış göç yeniden adlandırılmaz, canlıda bu adla kayıtlıdır.
- PARK (3 Eylül 2026): dublör koordinatörü ve benzeri dublör işlerine sahada bazen toplu bütçe veriliyor; bunun kart karşılığı konuşulmadı.

**Turnaround (4 Eylül 2026, Engin kararı):** Turnaround ihlali (yetersiz dinlenme telafisi) bütçeye GİRMEZ — öngörülemez, Türkiye'de cetveli yok; gerçekleşirse muhtelif bloğundan geçer. 1611 Overtime bu kavramdan ayrıştırıldı, yalnız fazla mesaiyi karşılar.

**Ek Çekim (4 Eylül 2026, Engin kararı):** Ek Çekim atomu kataloğun kendisinden ÇIKARILDI. Ne MMB'de ne diğer on altı kaynakta karşılığı çıktı; §7.5'teki satırı ve kod atama açık maddesi bu turda düşer.

**3900 KOD ÇAKIŞMASI DÜZELTMESİ (4 Eylül 2026, Engin):** Dansçı 3905 → 3916, Özel Tip 3906 → 3917. Sebep: Koster'de 3905 Minors'a, 3906 hem Welfare Workers'a hem kendi compliance kuralımızda adı geçen numaraya ait — iki atomumuz bu numaraları çakışmalı kullanıyordu. Diğer 39xx kodları Koster'e uyuyor, toplu düzeltme YOK — yalnız bu iki numara taşındı.

**1610/1619 AYRIMI (4 Eylül 2026, Engin):** 1610 ikiye ayrıldı. Deneme Çekimi 1610'da kalır (Koster kökeni, damıtım satır 691); Cast Gideri yeni kod 1619'u alır.

**ADR BUYOUT (4 Eylül 2026, Engin; kod 5 Eylül 2026'da 1620 atandı):** ADR Hak Devri yeni atom (statü telif_belgeli, hak devri). 1613 ADR/Looping'den ayrı satır — 1613 performans ücretini (smm), ADR Buyout hak devrini karşılar.

**1613 AD ÇAPRAZ KONTROL DÜZELTMESİ (5 Eylül 2026, Engin kararı):** Tohum göçünün ilk yazımında `item_library.name` (Türkçe ad) yanlışlıkla `'Dublaj (ADR/Looping)'` girilmişti; katalog kazandı, tohum `'Dublaj'` olarak düzeltildi. Gerekçe: parantez içindeki bilgi zaten `name_en` hanesinde (`'ADR / Looping'`) duruyor, aynı şeyi iki hanede taşımak kısa-form kararına ters düşerdi.

**İSİM TARAMASI (19 Eylül 2026, Engin kararı):** KART 1600'ün atom adları baştan sona tarandı, altı aday değerlendirildi. Beşi olduğu gibi kalır: **Stand-In** (3902) sektör terimi olarak zaten yerleşik, değişmez. **1606 Stunt Oyuncusu ile 1607 Dublör AYRI şeylerdir** — ikisi de sektörde yerleşiktir, ikisi de kalır. **1605/1609/1619 "Cast" yazımı kalır** — sektörde böyle yazılıyor (Cast Direktörü, Cast Asistanı, Cast Gideri). **1613 Dublaj ile 1620 ADR AYRI şeylerdir** — dublaj genellikle dil değiştirme (yerelleştirme) amacı güder, ADR ise oyuncunun kendi repliklerini aynı dilde ve dudak hareketleriyle stüdyoda yeniden kaydetmesidir; ikisi de kalır. Yalnız kart içi imla çatlağı tekleştirildi: **Kast → Cast** (1600-04 "Cast Operasyonu", 3914 "Cast Sorumlusu" — göç `20260919120000`, bkz. yukarıdaki asks_person maddesi).

**ATOM SAYISI DÜZELTMESİ (5 Eylül 2026, Engin kararı):** 4 Eylül'deki "toplam atom sayısı 29'a çıktı" YANLIŞTI — o sayım Bordro Hizmeti'nin (3915) karttan çıkacağını hesaba katmamıştı. 3915 KART 1600'DEN ÇIKARILDI (bkz. Grup 4'teki not); doğru toplam 4 başlık + 28 atomdur (kütüphane tohumu: KART 1600 M2, 5 Eylül 2026).

**ATOM SAYISI GÜNCELLEMESİ (12 Eylül 2026, Engin kararı):** Yukarıdaki 28 sayısı artık eskidir — 1618 Temsilci Komisyonu ikiye ayrıldı (1618 Ajans Komisyonu, 1618-01 Menajer Komisyonu), toplam 4 başlık + 29 atom oldu. Bu, 5 Eylül'ün 29'u YANLIŞ bulduğu düzeltmeyle ÇELİŞMEZ: o düzeltme 3915'in sayıma yanlışlıkla dahil edilmesini konu ediyordu, bu artış yeni bir atomun gerçekten eklenmesinden doğuyor.

**1620 ADR HAK DEVRİ KARTTAN ÇIKARILIYOR — İPTAL EDİLDİ, aşağıdaki 11 Eylül 2026 kararına bakın (5 Eylül 2026, Engin kararı — HENÜZ UYGULANMADI):** Ekran denemesinde Engin'in saha gerekçesi: Türkiye'de oyuncu sözleşmesi hak devrini zaten kapsıyor; 1613 Dublaj varken 1620'yi ayrı satır tutmanın saha karşılığı yok. Bu, dört Eylül'deki "ADR BUYOUT" kararını (yukarıda) TERSİNE ÇEVİRİR. Uygulama bekliyor: 1620 bugün hâlâ kütüphanede CANLI, hiçbir silme göçü yazılmadı; şablon işareti [K] idi, karar UYGULANINCA konusuz kalacak. Sıradaki oturumun ilk işlerinden biri.

**1614 VE 1620 KÜTÜPHANEDE KALIYOR (11 Eylül 2026, Engin kararı):** İkisi de kütüphanede durur, şablona GİRMEZ, silme göçü YAZILMAZ. Gerekçe: gerçekleşen bütçe çalışılırken gerekebilirler. Bu karar 5 Eylül'ün "1620 karttan çıkarılıyor, uygulama bekliyor" maddesini İPTAL EDER — bekleyen silme işi yoktur, yapılacak kod işi yoktur; ikisi de zaten [K] işaretli olduğu için durum bugünkü durumun aynısıdır. 1614 Tekrar Telifi için ek gerekçe: tekrar telifi yapımın GİDERİ değil HASILATI üzerinden hesaplanır — BİROY'un topladığı yurtdışı gösterim telifi ile sözleşmedeki yurtdışı satış ve VOD payı maddeleri filmin gelirine bağlıdır. **PEKİŞTİRME (19 Eylül 2026, Engin kararı):** tekrar telifinin giderden değil hasılattan hesaplanması bütçenin konusu DEĞİLDİR — bu bir kâr paylaşımı meselesidir, KAAPA'nın harcama-kontrol doktrininin dışında kalır.

**ÖNGÖRÜLEN BÜTÇE İLE GERÇEKLEŞEN BÜTÇENİN ATOM AYRIMI (11 Eylül 2026, Engin kararı):** Kart masası ÖNGÖRÜLEN taraftır (EKRAN-MUHASEBE: "Gerçekleşen ve Fark burada DEĞİL, Genel Bütçe icmalindedir"). Oyuncunun altına öngörülen bütçede giren şey rol satırı ile temsilci komisyonudur. 1611 Mesai baştan bilinemez, öngörülen bütçeye konulamaz; gerçekleştiğinde gerçekleşen bütçeye girer. Ek çekim de aynı sınıftadır. 1616 Prova sözleşmede taahhüt edilmişse prova ile oyunculuk ücreti birlikte hesaplanıp TEK rakam olarak rol satırına yazılır; ekstra prova gerçekleşen bütçeye girer. 1620 ADR Hak Devri sözleşmenin konusudur. Bu ayrım şablonun neden çekirdek bir setle doğduğunu ve kalan atomların neden [K] olduğunu açıklar (sayılar yukarıdaki Şablon maddesinde yaşar, burada tekrarlanmaz): [K] işareti "kütüphanede dursun, öngörülen bütçeye kendiliğinden girmesin" demektir.

**REVİZE (19 Eylül 2026, Engin kararı):** Yukarıdaki paragrafın 1611 Mesai ve 1616 Prova için kurduğu "öngörülen bütçeye konulamaz" yasağı KALKTI. Yerine geçen kural: gerçekleşen bütçe için ayrı bir kart tasarımı yapılmayacak — 1611 ve 1616 de diğerleri gibi AYNI kartta yaşar. Öngörülen/gerçekleşen ayrımı bilgi olarak doğru kalır (hangi rakamın hangi taraftan geldiğini söylemeye devam eder), ama bir atomun hangi bütçeye girebileceğini kısıtlayan bir kapı DEĞİLDİR. **Bu karar KART 1600'ün ÖTESİNE GEÇER:** gerçekleşen bütçe için hiçbir kartta ayrı kart tasarımı yapılmaz; mesai ve prova gerçekleşenin işidir ama aynı kartta yaşar, kullanıcı öngörülene şimdiden koymak isterse kendi bileceği iştir (19 Eylül 2026, Engin).

**GÖREV DIŞI ATOMLARDA KİŞİ SORMA KURALI — asks_person (5 Eylül 2026, Engin kararı; UYGULANDI 19 Eylül 2026, göç `20260919120000_1600_kisi_soran_kalemler.sql`):** Kütüphaneden eklenirken kullanıcıya kişi sorup sormayacağı üç sınıfa ayrıldı:
- **KİŞİ SORAR:** 1611 Mesai, 1616 Prova, 1614 Tekrar Telifi, 1620 ADR Hak Devri — dördü de bir oyuncunun kaleminin yanına doğar, hangi oyuncu olduğu doğumda sorulmalı.
- **GÖREV ATOMLARI SORMAZ** (`is_duty=true` olan 19 atom): kişiyi kendileri yaratır — Oyuncular listesinden kişi zaten atomla birlikte doğuyor, ayrıca sorulmaz.
- **SÜRECE AİT, KİŞİYE DEĞİL, SORMAZ:** 1610 Deneme Çekimi, 1619 Cast Gideri, 3910 Arkaplan Kostüm Ödeneği, 3913 Arkaplan Castingi.
- **1618 Ajans Komisyonu ve 1618-01 Menajer Komisyonu SORMAZ** — kütüphaneden eklenmez, ajans/menajer tikinden doğar (bkz. yukarıdaki 1618/1618-01 satırları).
**AİDİYET KURALI:** kişi soran atomun `heading_id`'si BOŞSA başlık kişinin bu karttaki satırından türer (önce görev satırı, yoksa en eski satır); DOLUYSA bugüne kadarki gibi atomdan gelir. 1611 ve 1616'nın `heading_id`'si boştur (mesai ve prova belli bir bölümün kalemi değildir); 1614 ve 1620 Ana Kast'a (1600-01) bağlıdır. **KOMİSYON ATOMLARININ AİDİYETİ DE BOŞALDI (20 Eylül 2026, Engin kararı; göç `20260920120000`):** 1618 Ajans Komisyonu ve 1618-01 Menajer Komisyonu Ana Kast'a bağlıydı, bu yüzden komisyon satırı kimin için doğarsa doğsun 1600-01 bölümünde doğuyordu; kişi bloğu bölüm sınırını geçemediği için satır sahibinin yanında hiç görünmüyordu (dublörün komisyonu kartın yukarısında Ana Kast içinde kalıyordu). İkisinin de aidiyet hanesi boşaltıldı, canlıda doğmuş aktif satırlar kişinin kendi bölümüne taşındı; ayrıca komisyon satırı artık doğum çağrısında kişiyi taşıyor — önceden satır açılıp kişi sonradan iliştiriliyordu, bu yüzden miras kuralı bu satırda hiç çalışmıyordu. Tarayıcıda DOĞRULANDI: dublörün ve sessiz rol oyuncusunun komisyonu kendi bölümünde, kendi bloğunun sonunda. **1614'ÜN AİDİYETİ SABİTTİR (19 Eylül 2026, Engin kararı):** 1614 Tekrar Telifi'nin aidiyeti Ana Kast'tır ve DEĞİŞMEZ. Gerekçe: tekrar telifinin yönetmen ve senaristi de kapsıyor olması — kâr paylaşımı sözleşmelerinde tekrar telifi tek başrole değil ekibin geniş bir kesimine yayılabilir — bu kartın işi değildir; KART 1600 yalnız oyuncu tarafını tutar, aidiyet o yüzden değişmez. "Kişi kaydının hangi katmanda yaşayacağı çözülmeden yazılamaz" engeli DÜŞTÜ: o çatal 5 Eylül 2026'da kapandı (bkz. BUTCE-EKRAN-KARARLARI.md §20 KİŞİ KAYDI KATMANI ÇATALI), asks_person göçü 19 Eylül 2026'da canlıya girdi — `fn_add_budget_item` `p_person_object_id` parametresiyle bu sınıflamayı uyguluyor, panel (add-item-panel.tsx) ikinci adımda "Kime?" sorusunu soruyor.

**MESAİNİN SAHA KARŞILIĞI (20 Eylül 2026, Engin kararı):** Mesai sahada teknik ekibe ve başta öyle anlaşılmış oyunculara yazılır. Fatura kesene yazılmaz, başta mesai konuşulmamış oyuncuya yazılmaz, sürücüye yazılmaz. FİGÜRASYONA DA YAZILMAZ: figüran belirli bir saat için gelir, üstüne çalışılacaksa bedeli faturaya yansır, ayrı bir mesai kalemi gerekmez. Normal koşulların dışına çıkan saha halleri — mesainin hiç ödenmemesi, olağan ücretin bile güçlükle tahsil edilmesi — KAAPA'nın konusu değildir; kart normal koşulu modeller. Mesai ağırlıkla gerçekleşen bütçenin işidir, ama öngörülene konulması yasak değildir (bkz. yukarıdaki 19 Eylül 2026 REVİZE maddesi).

**MESAİ/PROVA VE KOMİSYON ALABİLECEK GÖREVLER (20 Eylül 2026, Engin kararı):** KART 1600'de mesai ve prova eklenebilmesi gereken görevler: 1604 Dublör Koordinatörü, 1606 Stunt Oyuncusu, 1607 Dublör, 1608 Aksiyon Teknisyeni, 3902 Stand-In, 3904 Özel Yetenekli Arkaplan. Bunların üçü ayrıca ajans ve menajer komisyonu alabilmelidir: 1606, 1607, 3904. YENİ MEKANİZMA GEREKTİRMEZ: mesai ve prova `asks_person` yoluyla, komisyon Oyuncular listesindeki ajans/menajer tikiyle bugün zaten eklenebiliyor — tek şart kişinin Üretim Kayıtları'nda kaydının olmasıdır. AÇIK KALAN KENAR: adı girilmemiş şablon satırına (örneğin kadrosu belli olmayan bir aksiyon işi) bunların hiçbiri eklenemiyor, çünkü kartta bir kaleme iliştirilebilen tek çıpa kişi kaydıdır. Etiket tablosunda iş cinsi (`kind`) hanesi var ama Oyuncular listesi yalnız kişi cinsini okuyor ve yazıyor. Bu ayrı bir turun konusudur, karara bağlanmadı.

**MESAİNİN BLOK İÇİ YERİ KONU DEĞİL (20 Eylül 2026, Engin kararı):** Kişi bloğunda mesainin kaşenin üstünde mi altında mı durduğu tartışma konusu olmaktan çıktı, bugünkü haliyle kalır. Gerekçe: komisyon tabanı oyuncunun toplam kazancı olduğu için mesainin üstte durması hesapça tutarlıdır, ama ajans ve menajer sahada mesaiye karışmaz ve mesai zaten ağırlıkla gerçekleşen bütçenin işidir — sıranın taşıdığı bilgi bu kalemde zayıftır. Türetilmiş satırın blok sonuna alınması bu karardan BAĞIMSIZDIR ve uygulanmıştır (bkz. `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20).

**Kart-özel anomali:** çift-fringe guard (§4.9; loan-out'a fringe de mi yüklendi) · Crew Overlap (§4.9; aynı isim cast + set ekibinde maaş) · ÇOCUK-COMPLIANCE: minör/çocuk oyuncu var + set öğretmeni (1615) yok → bayrak (Compliance Guard §6, teşhis+uyarı). Looping çift-sayım: 1613 ↔ 5300 alias denetimi.

**24 EYLÜL 2026 KARARLARI (Engin):** 23 Eylül 2026'da koddan doğrulanan, kodda karşılığı bulunmayan dört karar tek tek karara bağlandı. Kod değişmedi.
- **STUNT ETİKETİ PARKTA.** Grup 2'ye otomatik Stunt iş etiketi (§4.10 oto-etiket) uygulanmıyor. Gerekçe: etiketi okuyan yüzey yok, kartlar arası stunt toplamı kurulmadı; stunt taşıyacak diğer iki kart (Transport, Mekanik FX) kurulmadı; bugün stunt parasının tamamı bu karttadır ve aynı rakamı 1600-02 Dublör başlığının toplamı zaten verir. TETİK: Transport ya da Mekanik FX kartının kurulması, veya kartlar arası stunt toplamının istenmesi.
- **DÖNEM VARSAYILANLARI KAPANDI.** Tam metin yukarıdaki KART 1600 TASARIM KARARLARI içindeki Dönem varsayılanları maddesinde.
- **GÖREV ATOMLARI EKLEME LİSTESİNDE KALIR.** Tam metin `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20, listeden gelen oyuncu satırları maddesi.
- **ÇOCUK OYUNCU DENETİMİ PARKTA, KAPSAMI GENİŞLEDİ.** Çocuk oyuncu varsa yalnız 1615 Set Öğretmeni değil, Psikolog/Pedagog ve 1504 Oyuncu/Diyalog Koçu da zorunludur (Engin'in saha bilgisi; mevzuat maddesi ve tarihi denetim kurulurken compliance_rules kaynağına eklenir, §8). Denetim ÜÇ KARTI birden okur: 1615 bu kartta, 1504 KART 1500'de, Psikolog/Pedagog aşağıdaki maddedeki kartta. Bugün kişi kaydında çocuk olduğunu gösteren hane yok ve genel denetim motoru parkta (§8); denetim motorla birlikte açılır.
- **PSİKOLOG/PEDAGOG KALEMİ.** Yeni atom: Psikolog/Pedagog. KART 1600'de doğmaz. Yeri Set Operasyonları (Koster 3200; damıtımda başka karta oturmayan işlerin kartı) ya da Sağlık ve Güvenlik kartıdır. İkisi de henüz kurulmadı; Sağlık ve Güvenlik hiçbir kaynakta geçmiyor, seçilirse yeni kart olarak açılır. Hangisi olduğu o kart kurulurken kesinleşir, atom o turda doğar; o güne kadar ücret bu kartta serbest kalem olarak yazılabilir. 1615 Set Öğretmeni KART 1600'de, 1504 Oyuncu/Diyalog Koçu KART 1500'de SABİTTİR.

## 8. AÇIK / PARK (ilgili bölümlere gelince)
- Recoupable + iade/depozito şema/CFE detayı.
- percent_lines (Completion Bond/Contingency/Overhead/Insurance — dışlamalı, satır-bazlı farklı baz). 1404/1405 percent_line adayı; motor buraya gelince açılır.
- ~~Fringe motoru~~ — KAPANDI: "fringe motoru" KİMLİĞİ K2 ile emeklidir (2026-07-03, docs/butce/PERSONEL-MEVZUATI.md §1); motorun kendisi CFE olarak YAPILDI (DILIM-3, bordro-çözücü canlı). Loan-out fringe yönlendirmesi §4.8 ödeme-statüsü boyutunda yaşar.
- compliance_rules veri tablosu (şablon/kalem/sınır%/kaynak-tarih) — Compliance Guard'ın veri kaynağı; koda gömülmez, kaynak-tarihli, "doğrulayın" notlu.
- 1405 kâr-şişirme denetimi (1403 emek + 1405 kâr toplamı fon normunu aşarsa bayrak) — uygunluk katmanına bağlı (PCCE tartışması; girdi: PERSONEL-MEVZUATI G defteri).
- Kur farkı / çok-para-birimi (Türk bağlamı birincil).
- Stunt doğa-bölmesi: performans 1600'de KİLİTLİ (§7.5); araç→Transport, mekanik→Mekanik FX o kartlara gelince. "Sanat" çok-kart bölünmesi, walkie yuvası — ilgili kartlara gelince.
- Stunt iş etiketi (§7.5 24 EYLÜL 2026 KARARLARI, STUNT ETİKETİ PARKTA): Transport ya da Mekanik FX kartı kurulunca, veya kartlar arası stunt toplamı istenince açılır.
- Çocuk oyuncu denetimi (§7.5 24 EYLÜL 2026 KARARLARI): genel denetim motoruyla açılır; üç kartı okur ve kişi kaydında çocuk bilgisi ister.
- 1100 başlık kodları MMB'den sapıyor (30 Eylül 2026, Engin): MMB 6.1'de 1104 Budget Preparation, 1105 Accounting, 1107 Office Overhead, 1108 Transportation, 1110 Travel/Living; KAAPA'da 1104–1108 başka anlamlarda kullanılıyor. TETİK: 1100'e sırası geldiğinde bakılır. Kaynak: `docs/butce/MMB-6.1-ornek-hesap-plani.pdf`.
- Set catering (30 Eylül 2026, Engin): set catering'ini kuran kartın turunda catering kaleminin hazır birimi "gün" olur; mesai ve gece çekimi için "Mesai Yemeği" ayrı kalem olur, birimi "adet". Yönetmen biriminin ağırlaması (1508-03) bundan ayrıdır. TETİK: o kartın turu.

## 9. UI/EKRAN PARK (bütçe ekran tasarımına gelince)
- Bento Grid görünümü: maskeli kartların asma kilit/flu gösterimi; ağaçta gizleme vs flu seçimi.
- Privacy Toggle arayüzü (yapımcının satır-seviyesi açma/kapama kontrolü).
- "ne zaman" etkileşimi (tap → dönem+tutar atama) — EKRAN-*.md dosyalarına. NOT: nakit matrisi yüzeyi KARARA BAĞLANDI (docs/butce/BUTCE-EKRAN-KARARLARI.md bölüm 0.A — "tam görünüm = nakit matrisi"), bu listeden düştü.
