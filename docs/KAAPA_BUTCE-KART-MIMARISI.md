# KAAPA — BÜTÇE KART MİMARİSİ ve KALEM MEKANİZMASI
*Kalıcı mimari. Bütçe modülünün kart/kalem yapısının ve kalem davranış motorunun TEK KAYNAĞI. Koster damıtımından ve oturum kararlarından damıtıldı. TASARIM-KARARLARI.md'den referanslanır.*
*Oluşturma: 19 Haziran 2026. Güncelleme: 19 Haziran 2026 (KART 1400, 1500 + §4.8 ödeme-statüsü + §4.9 crew overlap + §5.1 görünürlük + §6 Compliance Guard).*
*Durum: KART 1100, 1300, 1400, 1500 KİLİTLİ; 1600 (Cast) ve sonrasından devam edilecek.*

---

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
| Kısmi maske 👁️ | 1300 (1306 hariç), 1500 (1501 hariç) | Yapımcı isterse tek operasyonel satır salt-okunur açılır |
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
Etap: Geliştirme · tüm kart RECOUPABLE · görünürlük: TAM MASKE 🔒 (set rollerine kapalı) · not alanı kalem-seviyesinde · 1108 salt-okunur toplam.
- 1101 Hikâye-Senaryo-Haklar: recoupable · ödeme alt-kolonları · 0-bedel anomali bayrağı · opsiyon→Dağıtım sarkar. Alt: Hak Satın Alma (peşin/vadeli) / Opsiyon / Opsiyon Uzatması / Yazım-Taslaklar (v1-v4) / Danışman-Editör / Sinopsis-Treatment / Script Report-Reader Fee
- 1102 Yapımcı (Producers Unit): recoupable · mahsup denetimi: 1401/1403 ile. Alt: Yapımcı geliştirme ücreti / Ortak-Yardımcı Yapımcı
- 1103 Yönetmen (Directors Unit): recoupable · mahsup denetimi: 1501 ile. Alt: Yönetmen geliştirme/attach ücreti
- 1104 Bütçe ve Dosya Hazırlama: recoupable. Alt: Bütçeleme / Sunum dosyası / Görsel-tasarım / Çeviri-tercüme / Teaser-Mood Video Kurgu ve Telifleri
- 1105 Ofis Genel Giderleri: recoupable. Alt: Ofis kirası / Kırtasiye-sarf / İletişim / Kargo-kurye / Yazılım-abonelik
- 1106 Hukuk ve Muhasebe: recoupable. Alt: Avukatlık-sözleşme / Clearance-izin / Mali müşavir / Fon raporlama-denetim / Noter ve Resmî Harçlar
- 1107 Araştırma ve Danışmanlık: recoupable. Alt: Saha-konu araştırması / Uzman danışman / Arşiv-kaynak-telif
- 1108 Seyahat-Konaklama-Yemek-Harcırah: recoupable · SALT-OKUNUR toplam. Alt: Ulaşım-uçak / Konaklama / Yemek-ağırlama / Harcırah / Festival-pazar katılımı
- 1190 Muhtelif: recoupable. Alt: Banka-havale-kur / Beklenmedik küçük giderler

### 7.2 KART 1300 — SENARYO YAZIM & YASAL TEMİZLİK  [KİLİTLİ]
Etap: Yapım Öncesi · RECOUPABLE DEĞİL · Geliştirme'ye bağı YOK (clearance dahil ayrı hesaplanır) · görünürlük: KISMİ MASKE 👁️ (1306 açılabilir; yazar kaşesi gizli).
- 1301 Senaryo Yazarı · 1302 Senaryo Doktoru/Editör · 1303 Uzman Danışmanlar · 1304 Araştırma · 1305 Senaryo Odası/Operasyon (Typing & Duplication)
- 1306 Yasal Hak Temizleme (Legal Clearances): 3 bağ → ait-kart=Senaryo (para burada) · onay-köprüsü=Hukuk (6200, departman admini onaylar) · risk-bayrağı=E&O (6105). cost_type=Hizmet/Hukuk. Motorun İLK kurulu örneği. Görünürlük: set rollerine açılabilen istisna satırı.
- 1307 Senaryo Süre Analizi (Script Timing) · 1308 Yazım Dönemi Lojistiği (Travel & Living) · 1309 Kaynak Ağırlama (Entertainment)
ÖNEMLİ — 1200 absorbe: Koster "1200 Story & Other Rights" KAAPA'da AYRI kart DEĞİL; geliştirme hakları 1101'de, yazım 1300'de. Ayrı 1200 kartı açılmaz.

### 7.3 KART 1400 — YAPIMCI BİRİMİ ve FİNANSAL HAKLAR  [KİLİTLİ]
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

A. Kreatif Ana İşçilik (İşçilik + ödeme-statüsü)
- 1501 Yönetmen Kaşesi (Director Fee): cost_type=İşçilik(ATL) · ödeme-statüsü: SMM/Loan-Out/Telif · kısmi maskede gizli baş-kaşe 🔒 · milestone denetimi: 5100 Kurgu onay tikleri ile.
- 1502 İkinci Ekip Yönetmeni (Second Unit Director): cost_type=İşçilik(ATL) · haftalık/paket · çapraz: 4200 Second Unit (orası ekip/ekipman; 1502 sadece kaşe).

B. Kreatif Destek Ekibi (İşçilik + ödeme-statüsü)
- 1503 Koreograf (Choreographer): dans/dövüş/hareket. cost_type=İşçilik(ATL).
- 1504 Oyuncu/Diyalog Koçu (Dialogue/Acting Coach): çocuk oyuncu/şive/cast hazırlığı. cost_type=İşçilik(ATL) · Crew Overlap denetimi.
- 1505 Yönetmen Özel Asistanı (Personal Assistant): doğrudan yönetmene bağlı, set reji departmanından ayrı. cost_type=İşçilik · Crew Overlap denetimi.

C. Görselleştirme & Tasarım (İşçilik + ödeme-statüsü)
- 1506 Storyboard & Animatic Sanatçısı: çekim-öncesi kare/dijital canlandırma. cost_type=İşçilik · çapraz: 1300 alias (geliştirmede başladıysa mükerrer denetimi).
- 1507 Konsept Sanatçısı/Moodboard: Kapsam: SADECE yönetmen erken-vizyonu (greenlight öncesi dünya/renk/VFX-planı). Prodüksiyon tasarımı → 2200. cost_type=İşçilik · çapraz: 2200 alias (çift-sayım önler).

D. Lojistik & Temsil (operasyonel gider)
- 1508 Yönetmen Birimi Seyahat/Konaklama (Travel & Living): Kapsam: KENDİ kreatif ekibimizin gideri (festival/reco/çekim — uçak/araç/otel). Genel lojistikten "Yönetmen Dönemi" etiketiyle süzülen roll-up havuz.
- 1509 Kreatif Ağırlama/İş Yemekleri (Entertainment): Kapsam: KARŞI TARAFI ağırlama (oyuncu/DoP rol-revizyon, reji blokaj yemekleri). Ayrım: karşı taraf=1509, kendi yol-yemeği=1508.

Kart-özel anomali kuralları: çift-fringe guard (1501/kreatifler Loan-Out) · milestone uyuşmazlık (1501↔5100) · Crew Overlap (1504/1505 ↔ set ekibi). Genel kurallar §4.9'da.

## 8. AÇIK / PARK (ilgili bölümlere gelince)
- Recoupable + iade/depozito şema/CFE detayı.
- percent_lines (Completion Bond/Contingency/Overhead/Insurance — dışlamalı, satır-bazlı farklı baz). 1404/1405 percent_line adayı; motor buraya gelince açılır.
- Fringe motoru (% + cutoff/SGK tavanı + biçim + risk) — §4.8 ödeme-statüsü boyutuna bağlı; loan-out fringe yönlendirmesi burada hesaplanır.
- compliance_rules veri tablosu (şablon/kalem/sınır%/kaynak-tarih) — Compliance Guard'ın veri kaynağı; koda gömülmez, kaynak-tarihli, "doğrulayın" notlu.
- 1405 kâr-şişirme denetimi (1403 emek + 1405 kâr toplamı fon normunu aşarsa bayrak) — fringe/compliance motoruna bağlı.
- Kur farkı / çok-para-birimi (Türk bağlamı birincil).
- Stunt doğa-bölmesi (performans→Cast/Dublör, araç→Transport, mekanik→Mekanik FX), "Sanat" çok-kart bölünmesi, walkie yuvası — ilgili kartlara gelince.

## 9. UI/EKRAN PARK (bütçe ekran tasarımına gelince)
- Bento Grid görünümü: maskeli kartların asma kilit/flu gösterimi; ağaçta gizleme vs flu seçimi.
- Privacy Toggle arayüzü (yapımcının satır-seviyesi açma/kapama kontrolü).
- "ne zaman" etkileşimi (tap → dönem+tutar atama) ve nakit matrisi yüzeyi — EKRAN-*.md dosyalarına.
