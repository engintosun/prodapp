# Gider Çeşidi ve İş Etiketi — Analiz ve Plan (9–13 Ekim 2026)

Bu dosya analizdir, karar değildir. Kararlar `docs/butce/BUTCE-SEMA-KARARLARI.md` GİDER ÇEŞİDİ EKSENİ'nde (KARARLAR madde 8 ve 9) ve `docs/butce/KART-KATALOGU.md` §4.10, §7.1, §7.2, §7.4, §7.5'te yaşar. Engin'in saha bilgisi ve itirazı birebir madde 9'dadır.

**Soru (Engin, 9–12 Ekim 2026):** Çeşit doğru yön mü? İş etiketi nerede duruyor? İkisi nasıl planlanır, ne yapılacak?

**Okunanlar:** BUTCE-SEMA GİDER ÇEŞİDİ EKSENİ (tamamı) · `docs/rakip/GIDER-CESIDI-TARAMASI.md` (tamamı) · `docs/RAKIP-ANALIZI-URUN.md` (tamamı) · KART-KATALOGU §1–§4.10, §7.1, §7.2, §7.4, §7.5 · `docs/KABUK-KARARLARI.md` §12.1b · `docs/IS-KURALLARI.md` §6–§9 · göç `20260901130000` (etiket cinsi) · kaynak dosyalar: MMB 6.1, CNC 2018, AICP 2019 ve 2023, BFI, Screen Australia, Telefilm, Master Excel.

## 1. Bir harcamanın beş sorusu

Örnek: bir kovalamaca sahnesinde dublörün günlük ücreti.

| Soru | Cevap | KAAPA'da karşılığı | Bugün |
|---|---|---|---|
| Kimin kasası? | Oyuncu kartı, Dublör bölümü | Kart (gider yeri) | Var |
| Neyin karşılığı? | Personel Ücreti | Gider çeşidi | Tasarımda; şemada yok |
| Hangi iş için? | Köprü kovalamacası | İş etiketi (`cost_object_id`, cins `is`) | Şema var (20 Haziran ve 1 Eylül 2026); ekranı yok, parkta |
| Kimin için? | Dublörün adı | Kişi etiketi (`person_object_id`, cins `kisi`) | KART 1600'de çalışıyor |
| Ne zaman? | Yapım | Dönem | Var |

Para bir kez yazılır, satır tek yerde durur (defter modeli). Her soru ayrı bir rapor verir: Oyuncu kartının harcaması, filmin toplam personel ücreti, sahnenin maliyeti, dublörün maliyeti. Hiçbiri ötekini bozmaz, aynı para iki kez sayılmaz. Bir satır her cinsten en çok bir etiket taşır (göç `20260901130000`): bir iş, bir kişi.

"Hangi iş" sorusunun cevabı çoğu zaman koddan gelir: bir sürecin bütün satırları aynı kartta aynı kodun altındaysa (deneme çekimi 1610, cast 1619) toplamı kod verir. İş etiketi yalnız parçaları farklı kartlara dağılan iş içindir (bölüm 4 ve 5).

## 2. Bu yapı neden doğru

1. **Türk muhasebesinin kendi dili.** Tekdüzen Hesap Planı 7/B giderleri çeşide göre izler, dönem sonunda gider yerlerine dağıtır (TARAMASI §3.9). Maliyet muhasebesinin üç temel kavramı gider yeri, gider çeşidi ve maliyet taşıyıcıdır (BUTCE-SEMA EKSENLERİN HARİTASI). KAAPA'da kart gider yeridir, çeşit gider çeşididir, iş ve kişi etiketi maliyet taşıyıcıdır. İcat değil, mali müşavirin tanıdığı yapı.
2. **Sektör de iki soruyu ayırıyor.** MMB'de kesişen tür raporu Group ile, iş ya da sahne raporu Set ile alınır; ikisi ayrı araçtır. Saturation ikisini tek etiket alanında karıştırır; tarama bunu kaçınılacak diye kaydetti (TARAMASI §4).
3. **KAAPA'nın farkı.** Rakiplerde tür raporu ya kod ezberiyle (MMB) ya da her projede elle etiketlemeyle (Group, Tag) alınır. KAAPA'da kullanıcı kalemi zaten küratörlü kütüphaneden seçer; çeşit atomda durur ve satıra kendiliğinden geçer (KART-KATALOGU §4.7: davranış atomda yaşar). Kullanıcı hiçbir şey seçmeden kartlar arası toplam, projeler arası karşılaştırma, kurum formları (CNC, Screen Australia, Telefilm) ve 7/B karşılığı çıkar. İncelenen rakiplerin hiçbirinde bu birleşim yok.
4. **Alternatifler.**
   - Her kartta ortak son rakam (x05): MMB hizası kırılır, kod iki anlam taşır (DEĞİŞMEZLER 2).
   - Boş bant (x95): aynı sakınca; repo bu yolu iki kez geri aldı.
   - Ayrı seyahat kartı: geliştirme maliyeti ve kişinin toplam maliyeti kaybolur (Engin; KART-KATALOGU §3).
   - Türü etiketle tutmak: kullanıcıya iş yükler; etiket proje bazlı olduğu için projeler arası kati rapor vermez.
   - Çeşidi satıra yazmayıp raporda kütüphaneden okumak: sözlük düzeltmesi mühürlü bütçenin raporunu geriye dönük değiştirir; serbest kalemin yeri olmaz. KAAPA'nın emsali ters yönde: `catalog_code` ve `heading_code` satıra kopyalanır.

## 3. Konunun neden dallandığı

Çeşit tek başına anlatıldı; bir harcamanın soruları birlikte konmadı. Aday sözlüğe "Karma / Süreç Paketi" diye bir üst çeşit girmişti (1107-04 Lokasyon Keşfi, 1610 Deneme Çekimi, 1619 Cast Gideri). Bunlar çeşit değil, iştir: "hangi iş" sorusu çeşidin içine sızmıştı. Recce bunu açığa çıkardı. Recce yeni bir konu değil, eksik resmin parçasıdır.

**Düzeltme:** "Karma / Süreç Paketi" sözlükten kalkar. Çeşit yalnız paranın neyin karşılığı olduğunu söyler; bir sürecin toplamı kod ailesinden, birden çok karta dağılan işin toplamı iş etiketinden gelir.

## 4. Süreç kuralı (13 Ekim 2026'da kesinleşti)

**Her süreç (deneme çekimi, cast, teknik keşif, ofis) kendi ev kartında bir kod ailesidir: tek faturayla satın alınan kısmı ana koddaki paket satırına, içeride kurulan kısmı alt koddaki parça satırlarına yazılır. Sürecin toplamı kodun toplamından, tür toplamı çeşitten gelir.**

Ayrımı kullanıcı gerçeğe bakarak yapar: fatura bir firmadan ya da paket teklif veren bir ekipten geliyorsa paket satırını, prodüksiyon altyapıyı kendisi kuruyorsa parça satırlarını ekler; karışıksa ikisini birlikte. İş değişmez, satırlar değişir; ikisi de aynı kodun altında durur.

Neden doğru: paket satırında para bir hizmetin karşılığıdır (firmanın kendi kamera kirası firmanın işidir, bizim kiramız değildir; 7/B'de 793 Dışarıdan Sağlanan Fayda ve Hizmetler). Parça satırlarında para kendi türünün karşılığıdır (oda kirası, ekipman kiralama, ikram). İki durumda da hem "toplam kiralama" hem sürecin toplamı doğru çıkar.

Emsaller: ana kod satırı ile alt kod satırının birlikte yaşaması 1501 ve 1501-01'de var; paket ya da kırılım seçimi 1108'de var ("kullanıcı ister tek paket kalemi ister ayrı atomlar ekler", KART-KATALOGU §3, 15 Ağustos 2026); MMB 6.1'de 1609 Casting Expenses ve 1610 Screen Tests Cast hesabında ayrı hesaplardır; icmal kalemi koduna göre gruplar (EKRAN-MUHASEBE §19 Ekran 1, 30 Eylül 2026). Alt kodların ana kodun altında toplanması icmal turunda bu kurala bağlanır.

Örnek (deneme çekimi):

| Durum | Satırlar | Çeşit | Deneme çekiminin toplamı | Toplam ekipman kiralamaya etkisi |
|---|---|---|---|---|
| Firma ya da cast ekibi tek fatura keser: 60.000 | 1610 Deneme Çekimi (hizmet) 60.000 | Hizmet Alımı | 60.000 | Yok; kiralayan biz değiliz |
| Prodüksiyon kendisi kurar | 1610-01 Oda/Stüdyo Kirası 20.000 · 1610-02 Ekipman Kiralama 30.000 · 1610-04 Yemek ve İkram 5.000 | Mekân kirası · Ekipman Kiralama · İkram | 55.000 | 30.000 eklenir |

Alt kod numaraları örnektir; kesin adlar ve kodlar sözlük turunda yazılır.

Beş kalemin son hali:

| Kalem | Son hal |
|---|---|
| 1610 Deneme Çekimi (1600, Kast Operasyonu) | Oyuncu kartında kalır (yer ve emsal: KART-KATALOGU §7.5, TARAMASI §3.12). Paket satırı (hizmet) + parça satırları: oda/stüdyo kirası, ekipman kiralama, makyaj ve kostüm, yemek ve ikram, ulaşım; gerekirse teste özel ekip yevmiyesi |
| 1619 Cast Gideri (1600, Kast Operasyonu) | Aynı desen: oda/stüdyo kirası, kayıt ekipmanı, yemek ve ikram, ulaşım ve transfer |
| 1310 Ofis Giderleri (1300) | Aynı desen: paket satırı (toplu ofis hizmeti) + ofis kirası, kırtasiye ve ofis sarfı, iletişim, yazılım ve abonelik (1105 ailesi gibi) |
| 1507 Yönetmen Birimi Ofis Giderleri (1500) | 1310 ile aynı |
| 1107-04 Lokasyon Keşfi (1100) | Değişmez: keşif hizmetini taşır, yolu ve oteli 1108'dedir (1104-06 emsali; 1100'ün geliştirme seyahat ailesi zaten tektir). Bedel: geliştirme keşfinin toplamı koddan ayrılmaz, 1104-06'daki bedelin aynısı |

Beş kaleme yeni çeşit adı aranmaz; paket ve parça satırlarının adları ile şablona hangilerinin gireceği sözlük turunda yazılır. Şablonda bugün 1610 ve 1619 tek satır olarak duruyor; sahada süreç içeride kurulduğu için şablonun hangi satırları taşıyacağı sözlük turunda Engin'e sorulur.

**Teknik keşif de aynı kural:** ev kartında paket satırı + parça satırları: yol, otel, araç, ekipman kiralama, keşif fotoğrafı, keşif ekibinin yevmiyesi (CNC 233A emsali: keşfe ayrılan personel ayrı satır). Ev kartı Lokasyon ve Seyahat-Konaklama kart turlarında kesinleşir: MMB 3501 Survey Costs bunları Lokasyon'da tek hesapta tutar; KAAPA, Koster'in Lokasyon hesabını Lokasyon ve Seyahat-Konaklama diye iki karta böler (Koster damıtımı, 3500). Engin'in "ayrı recce kalemi" pratiği korunur: toplam yine tek yerdedir; fark, kalemin içinin parçalara bölünmesi ve her parçanın kendi türünü taşımasıdır.

10 Ekim'deki daraltma kararı 11 Ekim'de toptan geri çekilmişti. Engin'in bilgisi teknik keşif içindi; geliştirme keşfinde (1107-04) daraltma doğrudur.

Cast sürecinin sahadaki işleyişi (Engin, 12 Ekim 2026): süreç dışarıya paket olarak verilmiyor, içeride yürüyor; ekiplerin emeği zaten kendi satırlarında (cast ekibi Kast Operasyonu'nda, reji ekibi kendi kartında), sürece özel para yapımın kurduğu altyapıdır. Engin'in itirazı (13 Ekim 2026): süreç bir hizmet olarak da satın alınabilir, iş değişmez. Okuma: yönetimin kimde olduğu satırları ve raporları değiştirmez; yalnız ileride onayın kimde olacağını belirler (harcama kartı ile onay birimi ayrı olabilir, KART-KATALOGU §4.1 onay köprüsü; kart bazlı yetki kurulurken bağlanır). Satırları değiştiren tek şey işin nasıl satın alındığıdır; ayrım paket ve parça satırıyla yapılır.

## 5. İş etiketi

- **Durum:** 20 Haziran 2026 kararı (KART-KATALOGU §4.10). Şeması canlı: etiket cinsi `is`, satırda `cost_object_id` (göç `20260901130000`). 24 Eylül 2026'da parka alındı: okuyacak ekran yok. Parkta kalır.
- **Neden süreçler için gerekmiyor:** bir sürecin bütün satırları aynı kartta ve aynı kodun altında durunca toplamı kod verir; ayrıca işaret koymak aynı bilgiyi iki yerde tutmak olur.
- **Görevi:** parçaları farklı kartlara ve birbiriyle ilgisiz kodlara dağılan, tek koda toplanamayan iş. Örnek: bir kovalamaca sahnesi: dublörün ücreti Oyuncu kartında (1606), stunt aracı Ulaşım kartında, rampa ve patlama Mekanik Efekt kartında. "Bu sahne kaça mal oldu" sorusunu yalnız etiket cevaplar. VFX de böyledir.
- **Ne zaman:** o kartlar (Ulaşım, Mekanik Efekt) kurulunca; tetik KART-KATALOGU §7.5 STUNT ETİKETİ PARKTA ile aynı.
- **11 Ekim'deki "iş listesi / sekme" önerisi geri çekildi:** süreçler kodla tutulduğu için gereksiz. Etiketin ekranı, park tetiği geldiğinde tasarlanır.

## 6. Keşif taraması

Kaynak listesi `docs/rakip/GIDER-CESIDI-TARAMASI.md` §3.11'de; deneme çekimi ve cast giderinin yeri §3.12'de.

## 7. Açık konular: neden, nasıl, öneri

1. **Doğa ve tedarik işaretleri.** Neden gerekli: çeşitlerin üstünden kesen toplamlar ("toplam kiralama": ekipman, mekân, araç, hayvan, malzeme) ve kurum formları (Screen Australia L Rentals & Storage; Telefilm emek ve ekipman ayrı; AICP işçilik ve gider ayrı) bunlardan çıkar. Sorun: doğadaki "kira" ile tedarikteki "kiralama" aynı şeyi iki yerde söylüyor; "mal" ile "satın alma" ve "imalat" da öyle. Aynı bilgi iki alanda tutulmaz (KARARLAR madde 7'nin ilkesi). **Öneri:** tek eksen, adı doğa:
   - İşçilik: bir kişinin emeğinin karşılığı; nasıl ödendiğini statü söyler.
   - Hizmet: bir işin sonucunun teslim alınması.
   - Hak: bir eserin ya da kullanımın hakkı.
   - Kiralama: bir şeyin belli süre kullanılması (ekipman, mekân, araç, hayvan, malzeme).
   - Satın Alma: bir şeyin sahibi olmak (sarf dahil).
   - İmalat: bir şeyin yaptırılması (dekor, dikim, atölye işi).
   - Ödenek: kişiye verilen sabit harcama parası (harcırah, kit kirası, kostüm ödeneği).
   - Harç ve Vergi: devlete ödenen.
   - Finansman ve Sigorta: paranın ve riskin bedeli.
   - Diğer.
   Nasıl: sözlük turunda her alt çeşide bir doğa yazılır; sınırdakiler (komisyon, set yemeği, ulaşım bileti) tek tek bakılır. Doğa kendiliğinden gelir, kimseye sorulmaz. 7/B karşılığı doğadan tek başına çıkmaz, çeşit ve statüyle birlikte okunur (AÇIK SORULAR EK, madde 4). Şemayı durdurmaz (sözlük küresel tohum tablosudur, sonradan kolon eklemek ucuzdur); aynı turda bitirmek bir göçü kazandırır.
2. **Hak çeşidinin adı.** Neden: telif çeşit değil statüdür (madde 7); "Hak Devri ve Telif Bedeli" adı senaristin "Telif Bedeli" satır adıyla da çakışıyor. İçinde 1501-01 Yönetmen Hak Devri ve 1620 ADR Hak Devri (devir) ile 1614 Tekrar Telifi (tekrar kullanımın bedeli) var. **Öneri:** "Hak Devri ve Kullanım Bedeli".
3. **Eşlemede sınırdaki iki kalem.** 1104-01 Bütçeleme ve 1101-05 Danışman-Editör. Gri bölge kuralı: işini kendi düzeninde yapıp sonucunu teslim eden Hizmet Alımı'dır (madde 4). İkisi de bir sonuç teslim eder (bütçe, senaryo notu). **Öneri:** bugünkü eşleme (Danışmanlık ve Uzmanlık) kalır, konu kapanır.
4. **Satırda çeşit değiştirme.** Neden: kati (kütüphanenin dediği, projeler arası) ve akışkan (bu bütçenin gerçeği) birlikte (Engin, 6 Ekim 2026). **Öneri:** ilke evet; statü ve birim deseni: kütüphaneden gelir, satırda değişebilir, kütüphane bağı korunur; ayrıştığı satır hesaplanarak görünür, saklanmaz (B18). Şemayı durdurmaz: alan satırda zaten olacak (mühürde donma için), iki durumda da şema aynıdır. Nerede değiştirileceği ekran turunda, kalabalık masa ilkesiyle konuşulur; tabloya yeni kolon önerilmiyor.
5. **Adlar ve saha.** Neden: fiş tarafında set çalışanı seçecek. **Öneri:** adlar sahanın kullandığı kısa kelimelerle konur; listenin sahaya nasıl gösterileceği fiş turunun işidir. Şemayı durdurmaz.
6. **Küratörlük.** Neden: sözlük ve eşleme bakım ister. **Öneri:** süreçle çözülür: her kart turunda yeni kalem çeşidiyle doğar; sözlük değişikliği göçle yapılır, mühürsüz bütçeler güncellenir, mühürlü bütçe donar. Serbest kalemlerin izlenmesi raporlar turunda.

## 8. Ertelenenler ve neden

- **Fiş tarafı:** bütçe tarafı fişe dokunmadan kurulur; sözlük tek olduğu için fiş turu aynı sözlüğe bağlanır. Fiş turunun ilk gereksinimi departman şartıdır (IS-KURALLARI §6).
- **Şirkete özel alt satır:** bugün kart içinde kullanıcı başlığı, kartlar arasında iş etiketi bu ihtiyacı karşılıyor; eksik görülürse açılır.
- **7/B karşılığı:** raporlar turunda, mali müşavir teyidiyle.

## 9. Plan

| Sıra | İş | Kim | Neden bu sırada |
|---|---|---|---|
| 1 | Bu analizi ve kabul edilen kararları repoya yazmak | Opus prompt, Sonnet commit | Kayıp riski |
| 2 | Sözlük turu (tek oturum, kod yok): süreç ailelerinin (1610, 1619, 1310, 1507) parça adları ve şablona girecek satırlar; doğa tanımları ve ataması; hak çeşidinin adı; adların ve eşlemenin son okuması | Opus ve Engin | Tohum bu listeyi yazar |
| 3 | Şema ve tohum dilimi: sözlük tablosu (herkese salt okunur), kütüphaneye ve bütçe satırına birer alan, iki fonksiyonda kopya, kütüphaneye çeşit ataması, 1310, 1507, 1610 ve 1619 ailelerinin tohumu. Sandbox turu zorunlu (canlı şemaya değen SQL). Bütçe ekranında değişiklik yok. | Sonnet; SQL'i Engin okuyup onaylar | 2 bitmeden yazılmaz: sonradan değişen ad yeniden göç ister |
| 4 | KART 1400: kütüphanesi çeşidiyle doğar | Opus, Sonnet | Kütüphane listesi çeşidi bekliyordu |
| 5 | Sonraki kartlar çeşidiyle doğar; Lokasyon kartında teknik keşif ailesi kurulur; Ulaşım ve Mekanik Efekt kurulunca iş etiketi parktan çıkar | — | Satırların düşeceği kartlar gerekli |
| 6 | Raporlar turu: çeşit ve iş raporları, kurum formları, 7/B, serbest kalemlerin sınıflandırılma yeri, alt kodların ana kodun altında toplanması | — | Rapor ekranı kurulunca |
| 7 | Fiş turu: aynı sözlük fişe bağlanır | — | Ertelendi |

**Kullanıcı ne görür:** 3 ve 4'te bütçe ekranında hiçbir şey değişmez; kimse çeşit seçmez. Fark raporlar ekranı geldiğinde görünür (toplam otel, toplam araç kiralama, deneme çekiminin maliyeti).

**Geri dönüş:** 1 ve 2 doküman, geri alınabilir. 3 şemadır; canlı veri bugün deneme verisi olduğu için geri alınabilir, ama sözlük adları sonradan değişirse göç gerekir. Bu yüzden 2 bitmeden 3 yazılmaz.
