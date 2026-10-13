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
| 1610 Deneme Çekimi (1600, Cast Operasyonu) | Oyuncu kartında kalır (yer ve emsal: KART-KATALOGU §7.5, TARAMASI §3.12). Paket satırı (hizmet) + parça satırları: oda/stüdyo kirası, ekipman kiralama, makyaj ve kostüm, yemek ve ikram, ulaşım; gerekirse teste özel ekip yevmiyesi |
| 1619 Cast Gideri (1600, Cast Operasyonu) | Aynı desen: oda/stüdyo kirası, kayıt ekipmanı, yemek ve ikram, ulaşım ve transfer |
| 1310 Ofis Giderleri (1300) | Aynı desen: paket satırı (toplu ofis hizmeti) + ofis kirası, kırtasiye ve ofis sarfı, iletişim, yazılım ve abonelik (1105 ailesi gibi) |
| 1507 Yönetmen Birimi Ofis Giderleri (1500) | 1310 ile aynı |
| 1107-04 Lokasyon Keşfi (1100) | Değişmez: keşif hizmetini taşır, yolu ve oteli 1108'dedir (1104-06 emsali; 1100'ün geliştirme seyahat ailesi zaten tektir). Bedel: geliştirme keşfinin toplamı koddan ayrılmaz, 1104-06'daki bedelin aynısı |

Beş kaleme yeni çeşit adı aranmaz; paket ve parça satırlarının adları ile şablona hangilerinin gireceği sözlük turunda yazılır. Şablonda bugün 1610 ve 1619 tek satır olarak duruyor; sahada süreç içeride kurulduğu için şablonun hangi satırları taşıyacağı sözlük turunda Engin'e sorulur.

**Teknik keşif de aynı kural:** ev kartında paket satırı + parça satırları: yol, otel, araç, ekipman kiralama, keşif fotoğrafı, keşif ekibinin yevmiyesi (CNC 233A emsali: keşfe ayrılan personel ayrı satır). Ev kartı Lokasyon ve Seyahat-Konaklama kart turlarında kesinleşir: MMB 3501 Survey Costs bunları Lokasyon'da tek hesapta tutar; KAAPA, Koster'in Lokasyon hesabını Lokasyon ve Seyahat-Konaklama diye iki karta böler (Koster damıtımı, 3500). Engin'in "ayrı recce kalemi" pratiği korunur: toplam yine tek yerdedir; fark, kalemin içinin parçalara bölünmesi ve her parçanın kendi türünü taşımasıdır.

10 Ekim'deki daraltma kararı 11 Ekim'de toptan geri çekilmişti. Engin'in bilgisi teknik keşif içindi; geliştirme keşfinde (1107-04) daraltma doğrudur.

Cast sürecinin sahadaki işleyişi (Engin, 12 Ekim 2026): süreç dışarıya paket olarak verilmiyor, içeride yürüyor; ekiplerin emeği zaten kendi satırlarında (cast ekibi Cast Operasyonu'nda, reji ekibi kendi kartında), sürece özel para yapımın kurduğu altyapıdır. Engin'in itirazı (13 Ekim 2026): süreç bir hizmet olarak da satın alınabilir, iş değişmez. Okuma: yönetimin kimde olduğu satırları ve raporları değiştirmez; yalnız ileride onayın kimde olacağını belirler (harcama kartı ile onay birimi ayrı olabilir, KART-KATALOGU §4.1 onay köprüsü; kart bazlı yetki kurulurken bağlanır). Satırları değiştiren tek şey işin nasıl satın alındığıdır; ayrım paket ve parça satırıyla yapılır.

## 5. İş etiketi

- **Durum:** 20 Haziran 2026 kararı (KART-KATALOGU §4.10). Şeması canlı: etiket cinsi `is`, satırda `cost_object_id` (göç `20260901130000`). 24 Eylül 2026'da parka alındı: okuyacak ekran yok. Parkta kalır.
- **Neden süreçler için gerekmiyor:** bir sürecin bütün satırları aynı kartta ve aynı kodun altında durunca toplamı kod verir; ayrıca işaret koymak aynı bilgiyi iki yerde tutmak olur.
- **Görevi:** parçaları farklı kartlara ve birbiriyle ilgisiz kodlara dağılan, tek koda toplanamayan iş. Örnek: bir kovalamaca sahnesi: dublörün ücreti Oyuncu kartında (1606), stunt aracı Ulaşım kartında, rampa ve patlama Mekanik Efekt kartında. "Bu sahne kaça mal oldu" sorusunu yalnız etiket cevaplar. VFX de böyledir.
- **Ne zaman:** o kartlar (Ulaşım, Mekanik Efekt) kurulunca; tetik KART-KATALOGU §7.5 STUNT ETİKETİ PARKTA ile aynı.
- **11 Ekim'deki "iş listesi / sekme" önerisi geri çekildi:** süreçler kodla tutulduğu için gereksiz. Etiketin ekranı, park tetiği geldiğinde tasarlanır.

## 6. Keşif taraması

Kaynak listesi `docs/rakip/GIDER-CESIDI-TARAMASI.md` §3.11'de; deneme çekimi ve cast giderinin yeri §3.12'de.

## 7. Açık konular: neden, nasıl, öneri

1. **Doğa ve tedarik işaretleri.** Neden gerekli: çeşitlerin üstünden kesen toplamlar ("toplam kiralama": ekipman, mekân, araç, hayvan, malzeme) ve kurum formları (Screen Australia L Rentals & Storage; Telefilm emek ve ekipman ayrı; AICP işçilik ve gider ayrı; DÜZELTME 13 Ekim 2026: Screen Australia L bütün kiralar değil, çoğunlukla mekân kirasıdır; kiralama ile satın alma her formda detay satırında ayrılır, §10) bunlardan çıkar. Sorun: doğadaki "kira" ile tedarikteki "kiralama" aynı şeyi iki yerde söylüyor; "mal" ile "satın alma" ve "imalat" da öyle. Aynı bilgi iki alanda tutulmaz (KARARLAR madde 7'nin ilkesi). **Öneri:** tek eksen, adı doğa:
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
   Nasıl: sözlük turunda her alt çeşide bir doğa yazılır; sınırdakiler (komisyon, set yemeği, ulaşım bileti) tek tek bakılır. Doğa kendiliğinden gelir, kimseye sorulmaz. 7/B karşılığı doğadan tek başına çıkmaz, çeşit ve statüyle birlikte okunur (AÇIK SORULAR EK, madde 4). Şemayı durdurmaz (sözlük küresel tohum tablosudur, sonradan kolon eklemek ucuzdur); aynı turda bitirmek bir göçü kazandırır. **KAPANDI (13 Ekim 2026, Engin kabul):** tek işaret, adı doğa, on değer; tanımlar kurum formlarıyla sınandı, komisyon İşçilik'e geçti, Kiralama'nın emsali düzeltildi, Hak daraltıldı. Ayrıntı §10.
2. **Hak çeşidinin adı.** Neden: telif çeşit değil statüdür (madde 7); "Hak Devri ve Telif Bedeli" adı senaristin "Telif Bedeli" satır adıyla da çakışıyor. İçinde 1501-01 Yönetmen Hak Devri ve 1620 ADR Hak Devri (devir) ile 1614 Tekrar Telifi (tekrar kullanımın bedeli) var. **Öneri:** "Hak Devri ve Kullanım Bedeli". **KAPANDI (13 Ekim 2026, Engin kabul):** öneri geri çekildi; hak çeşidi ikiye ayrıldı: Hak Devri (1501-01, 1620) ve Tekrar Kullanım Payı (1614). Gerekçe ve Engin'in itirazı §10'da.
3. **Eşlemede sınırdaki iki kalem.** 1104-01 Bütçeleme ve 1101-05 Danışman-Editör. Gri bölge kuralı: işini kendi düzeninde yapıp sonucunu teslim eden Hizmet Alımı'dır (madde 4). İkisi de bir sonuç teslim eder (bütçe, senaryo notu). **Öneri:** bugünkü eşleme (Danışmanlık ve Uzmanlık) kalır, konu kapanır. **KAPANDI (13 Ekim 2026, Engin kabul):** öneri kabul edildi, eşleme §10'da.
4. **Satırda çeşit değiştirme.** Neden: kati (kütüphanenin dediği, projeler arası) ve akışkan (bu bütçenin gerçeği) birlikte (Engin, 6 Ekim 2026). **Öneri:** ilke evet; statü ve birim deseni: kütüphaneden gelir, satırda değişebilir, kütüphane bağı korunur; ayrıştığı satır hesaplanarak görünür, saklanmaz (B18). Şemayı durdurmaz: alan satırda zaten olacak (mühürde donma için), iki durumda da şema aynıdır. Nerede değiştirileceği ekran turunda, kalabalık masa ilkesiyle konuşulur; tabloya yeni kolon önerilmiyor.
5. **Adlar ve saha.** Neden: fiş tarafında set çalışanı seçecek. **Öneri:** adlar sahanın kullandığı kısa kelimelerle konur; listenin sahaya nasıl gösterileceği fiş turunun işidir. Şemayı durdurmaz. **KAPANDI (13 Ekim 2026, Engin kabul):** adlar sözlük turunda kondu (§10).
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

**Durum (13 Ekim 2026):** 1 ve 2 tamamlandı; sözlük turunun kararları §10'da. Sıra 3'e iki ek: sözlük tablosuna doğa ve açıklama haneleri girer; 1105 ailesine üç yeni kalem (1105-07, 1105-08, 1105-09) tohumda eklenir. **3 TAMAM (13 Ekim 2026, göç `20261013120000`).**

## 10. Sözlük turu (13 Ekim 2026)

Gider çeşidi sözlük turu 13 Ekim 2026'da tek oturumda, kod yazılmadan yapıldı. Kararlar `docs/butce/BUTCE-SEMA-KARARLARI.md` GİDER ÇEŞİDİ EKSENİ KARARLAR madde 10'da, kod aileleri `docs/butce/KART-KATALOGU.md` §7.1, §7.2, §7.4 ve §7.5'te. Aşağıdaki metin oturumun çalışma belgesidir, birebir taşındı.

### Süreç aileleri

Her ailenin ana kodu, tek faturayla alınan paket satırıdır; içeride kurulan kısım alt kodlu parça satırlarına yazılır (KARARLAR madde 9). Kod kullanıcıya görünmez: kalem ekleme odasında yalnız ad yazar, No sütunu sıra numarasıdır. Bu yüzden parça adı sürecin adıyla başlar. Kartta satırlar katalog koduna göre dizildiği için (`card-view.ts`) aile kartta yan yana durur.

#### 1610 Deneme Çekimi — KABUL (Engin, 13 Ekim 2026)

| Kod | Ad | Çeşit | Birim | Statü | Şablonda | Not |
| --- | --- | --- | --- | --- | --- | --- |
| 1610 | Deneme Çekimi (adı aynı kalır) | Cast Hizmeti | sabit | Şirket | Hayır (bugün evet) | Tek faturayla alınan deneme çekimi |
| 1610-01 | Deneme Çekimi Mekânı | Stüdyo ve Plato Kirası | gün | Şirket | Evet | Stüdyo ya da oda |
| 1610-02 | Deneme Çekimi Ekipmanı | Ekipman Kiralama | gün | Şirket | Evet | Kamera, ışık, ses |
| 1610-03 | Deneme Çekimi Kostümü | Malzeme Kiralama | sabit | Şirket | Hayır | Teste giyilen kostüm; kostüm testi değildir |
| 1610-04 | Deneme Çekimi Makyajı | Sarf Malzeme | sabit | Şirket | Hayır | Malzeme; makyözün emeği 1610-07'de |
| 1610-05 | Deneme Çekimi Yemeği | Set Yemeği | gün | Yemek | Evet | Yemek ve ikram |
| 1610-06 | Deneme Çekimi Ulaşımı | Taksi ve Transfer | sabit | Şirket | Hayır | Oyuncu ve ekip transferi |
| 1610-07 | Deneme Çekimi Ekibi | Personel Ücreti | gün | Bordro | Hayır | Yalnız teste tutulan ekip; hazırlıktaki ekibin emeği kendi kartında |

**Kullanıcı ne görür:** yeni film bütçesinde Cast Operasyonu altında tek "Deneme Çekimi" satırı yerine üç boş satır: Mekânı, Ekipmanı, Yemeği. Paket alındıysa üçü silinir, "+ Ekle"den "Deneme Çekimi" eklenir; karışıksa ikisi birlikte.

**Raporda ne çıkar:**

| Durum | Satırlar | Deneme çekiminin toplamı | Tür raporuna etkisi |
| --- | --- | --- | --- |
| İçeride kuruldu | Mekânı 20.000 · Ekipmanı 30.000 · Yemeği 5.000 | 55.000 | Stüdyo kirası +20.000 · Ekipman kiralama +30.000 · Set yemeği +5.000 |
| Paket alındı | Deneme Çekimi 60.000 | 60.000 | Cast Hizmeti +60.000; kiralamaya etkisi yok |

**Neden:** süreç Türkiye'de içeride kuruluyor (Engin, 12 Ekim 2026), şablon en sık gerçeği taşır. Kostüm ile makyaj ayrı satır, çünkü bir satır tek çeşit taşır: kostüm kiralanır, makyaj sarftır.

**Bedel:** Oyuncu kartının şablonu bu süreç için bir satır yerine üç satırla doğar. Ana kodun adı değişmez, çünkü ailenin de adıdır; adı tek faturalık hizmet olduğunu söylemez, şablonda olmadığı için yalnız bilerek eklenir.

**Geri dönüş:** bugün doküman kararıdır. Tohumdan sonra deneme verisi olduğu için geri alınır; ad değişirse göç gerekir.

Statü ve birim emsalden: kiralık mekân ve ekipman Şirket, yemek satırı 31 Ağustos AYRILMA kararıyla Yemek statüsü, ekip satırı aynı karttaki 1608 ve 1609 gibi Bordro. İngilizce adlar tohum hazırlığında kaynaktan alınır (Screen Australia: Screen Tests Crew, Screen Tests Equipment); kaynağı olmayan ad ezberden yazılmaz.

**1610-07 KURALI (Engin kabul, 13 Ekim 2026):** 1610-07 yalnız teste özel tutulan ekibi taşır; hazırlığa girmiş ekibin emeği kendi kartında kalır. Ayrım takvimden gelir: kişi yalnız test için getirildiyse ya da test onun hazırlığı başlamadan yapılıyorsa 1610-07, hazırlığın içindeyse kendi kartı. Bütçeci emin değilse 1610-07'ye yazar. Dayanak: kaynakların ortak ayrımı (teste özel ekip test hesabında: MMB 4100 Crew, Screen Australia Screen Tests - Crew; hazırlıktaki ekip kendi satırında: AICP, CNC, Koster) ve "kullanan sahiplenir". Tarama: `docs/rakip/GIDER-CESIDI-TARAMASI.md` §3.13

Engin'in saha bilgisi (birebir):

> Deneme çekiminin kiminle yapılacağı değişken, genellikle var olan ekip, bazen dışarıdan.

**Nasıl yazılır:** teste özel gelen her kişi (ya da aynı ücretle aynı gün çalışan grup) için "Deneme Çekimi Ekibi" bir kez eklenir; Ad hücresine görevi ya da adı yazılır (görev atomu olmayan satırın adı düzenlenebilir, `display-name.ts`). Birim net = anlaşılan günlük ücret, Miktar = gün, X = aynı ücretle çalışan kişi sayısı, Statü = nasıl ödendiği. Örnek: hazırlıktaki görüntü yönetmeni ve asistanı 1610-07'de yok, kendi kartlarında; dışarıdan gelen ışık şefi 4.000 × 1 gün, Şirket statüsüyle 1610-07'de.

**Deneme çekiminin toplamı:** 1610 ailesinin toplamıdır, yani test için ayrıca ödenen her şey. Hazırlıktaki ekibin zamanını teste paylaştırmak para değil dağıtım raporudur (iş etiketi).

**Otomasyon (park; tetik: ekip kartları ve ekip listesi):** KART-KATALOGU §4.9 Crew Overlap Guard aynı kişiyi 1610-07'de ve kendi kartında ücretli görünce sorar; kişi bağı kurulunca 1610-07 "Kime?" sorar ve ücret kişinin kendi satırından gelir. O güne kadar 1610-07 elle yazılır ve şablona girmez.

#### 1619 Cast Gideri — KABUL (Engin, 13 Ekim 2026)

| Kod | Ad | Çeşit | Birim | Statü | Şablonda | Kaynak |
| --- | --- | --- | --- | --- | --- | --- |
| 1619 | Cast Gideri (adı aynı kalır) | Cast Hizmeti | sabit | Şirket | Hayır (bugün evet) | Paket: cast giderlerini tek faturayla kesen ajans |
| 1619-01 | Cast Odası | Stüdyo ve Plato Kirası | gün | Şirket | Evet | AICP 109 Casting Facility · CNC 5112 Casting |
| 1619-02 | Cast Kayıt Ekipmanı | Ekipman Kiralama | gün | Şirket | Evet | Telefilm 10.77 Video expenses (casting) |
| 1619-05 | Cast Günü İkramı | Ara Öğün ve İkram | gün | Yemek | Evet | Screen Australia Audition Expenses |
| 1619-06 | Cast Günü Ulaşımı | Taksi ve Transfer | sabit | Şirket | Hayır | Screen Australia Travel & Accommodation |
| 1619-07 | Cast Kayıt Ekibi | Personel Ücreti | gün | Bordro | Hayır | Screen Australia Readers Fees ve Screen Tests - Crew; 1610-07 kuralı |

Sonekler 1610 ile hizalı (-01 mekân, -02 ekipman, -05 yemek ve ikram, -06 ulaşım, -07 ekip); kostüm ve makyaj seçmede yok, -03 ve -04 boş.

**Emek:** cast ekibinin emeği zaten bu kartta, kendi görev satırlarında (1605 Cast Direktörü, 1609 Cast Asistanı); reji ekibi 1500'de. 1619-07 yalnız cast günleri için dışarıdan tutulan kişiyi taşır (örneğin kayıt için gelen kameraman); fazladan bir cast asistanı ise 1609 satırıdır. Kural 1610-07 ile aynı.

**Ad:** "Cast" KAAPA'da seçme sürecinin kelimesi (Cast Direktörü, Cast Operasyonu); oyuncular "Kast" (Ana Kast). Ulaşım ve ikram satırları "Cast Günü" ile başlar, çünkü "cast ulaşımı" sette oyuncu ulaşımı diye okunabilir.

**Kullanıcı ne görür:** yeni film bütçesinde Cast Operasyonu altında tek "Cast Gideri" satırı yerine üç boş satır: Cast Odası, Cast Kayıt Ekipmanı, Cast Günü İkramı.

**Raporda ne çıkar:**

| Durum | Satırlar | Cast sürecinin toplamı | Tür raporuna etkisi |
| --- | --- | --- | --- |
| İçeride kuruldu (3 cast günü) | Cast Odası 3 × 2.500 · Kayıt Ekipmanı 3 × 1.500 · İkramı 3 × 1.000 | 15.000 | Stüdyo kirası +7.500 · Ekipman kiralama +4.500 · Ara öğün ve ikram +3.000 |
| Ajans giderleri tek faturayla kesti | Cast Gideri 20.000 | 20.000 | Cast Hizmeti +20.000 |

**Ajansın tek faturası:** cast direktörünün ücreti fatura ajanstan gelse de 1605'te durur (Şirket statüsüyle; gri bölge kuralı: ekipte çalışanın bedeli Personel Ücreti), giderler 1619'da.

**Bedel:** şablonda Cast Operasyonu bölümü 1610 ile birlikte 6 satırdan 10 satıra çıkar; kullanılmayan satır silinir.

**Geri dönüş:** bugün doküman kararı; tohumdan sonra deneme verisi olduğu için geri alınır, ad değişirse göç gerekir.

#### 1310 ve 1507 ofis aileleri (1105 ile birlikte) — KABUL (Engin, 13 Ekim 2026)

Üç ofis ailesi aynı parça setini taşır: 1105 (Geliştirme, başlık), 1310 (Senaryo Yazımı), 1507 (Yönetmen). Sonekler 1105'le aynı; 1310 ve 1507'de -06 boş, çünkü sekreterya 1309 ve 1502'de.

| Sonek | Ad | Çeşit | Birim | Statü | Durum | Kaynak |
| --- | --- | --- | --- | --- | --- | --- |
| ana kod (1310, 1507) | adı aynı kalır; eş ad: Hazır Ofis, Ortak Çalışma Alanı | Ofis Kirası | ay (bugün sabit) | Şirket | Paket satırı | Hazır ofisin tek faturası |
| -01 | Ofis Kirası | Ofis Kirası | ay | Kira (şahıs) | 1105'te var | MMB Office Rental · Telefilm 28.01 · CNC 6811 · Screen Australia Office Rent |
| -02 | Kırtasiye-Sarf | Kırtasiye ve Ofis Sarfı | ay | Şirket | 1105'te var | MMB Office Supplies, Stationery · Telefilm 28.15 · CNC 6813 |
| -03 | İletişim | İletişim | ay | Şirket | 1105'te var | MMB Telephone, Mobile · Telefilm 28.20, 28.21 · CNC 6912 |
| -04 | Kargo-Kurye | Nakliye, Kargo, Kurye | ay | Şirket | 1105'te var | MMB Postage · Telefilm 28.30 · CNC 6911, 6913 |
| -05 | Yazılım-Abonelik | Yazılım ve Abonelik | ay | Şirket | 1105'te var | MMB Computer Charges · Telefilm 28.35 · CNC 6922 |
| -07 | Ofis Aidat ve Faturaları | Mekân Giderleri | ay | Şirket | **Yeni, üç aileye** | MMB Utility Costs · Telefilm 28.03 Heating/Electricity · CNC 682 Eau-Gaz-Électricité · Screen Australia P. Office Expenses: Electricity |
| -08 | Ofis Donanım Kirası | Ekipman Kiralama | ay | Şirket | **Yeni, üç aileye** | MMB Furniture/Equipment Rental · Telefilm 28.05, 28.07 · Screen Australia Furniture Hire, Equipment Hire |
| -09 | Ofis Donanım Alımı | Ekipman Satın Alma | sabit | Şirket | **Yeni, üç aileye** | MMB Furniture/Equipment Purchase · Screen Australia Furniture Purchase, Equipment Purchase |

**Paket satırının çeşidi:** Ofis Kirası. Para, bir ofisi belli süre kullanmanın karşılığıdır; faturanın hizmet olması statüyü belirler (Şirket), çeşidi değil (gri bölge kuralı). Deneme çekimi paketinden farkı budur: orada satın alınan bir işin sonucudur (hizmet), burada bir mekânın kullanımıdır.

**Sınır:** yapım şirketinin kendi ofisi bu satırlara yazılmaz. O şirketin genel gideridir ve bütçenin dibinde yüzde satırıyla taşınır (KART-KATALOGU §7.3, genel gider kalem değil). Bu ailelere yalnız proje için ayrıca tutulan ofis girer.

**Donanım iki satır:** kiralık ile satın alınan farklı çeşittir; "toplam kiralama" raporu bunu ayırmak için var. MMB ve Screen Australia kiralık ile alımı ayrı satırda tutuyor; Telefilm ve CNC tek satırda.

**Kaynaklarda olup eklenmeyenler:** ofis ikramı (Telefilm 28.40, Screen Australia Office Refreshments), temizlik ve bakım (CNC 683), güvenlik (MMB, Screen Australia). Her kaynakta yok; sahada gerekirse eklenir.

**Raporda ne çıkar (dizi yazar odası, 6 ay):** Ofis Kirası 6 × 30.000 · Aidat ve Faturaları 6 × 6.000 · İletişim 6 × 1.500 · Donanım Kirası 6 × 4.000 → yazar odasının toplamı 249.000 (1310 ailesi). Tür raporunda ofis kirası 1105 ve 1507'deki ofis kiralarıyla birlikte toplanır. Hazır ofis tutulduysa: Ofis Giderleri 6 × 45.000 = 270.000, Ofis Kirası çeşidinde.

**Kullanıcı ne görür:** bugünkü ekranda değişiklik yok; 1310 ve 1507 şablonda değil, kalemler "+ Ekle" odasında. 1100 kartında 1105 başlığının altına üç yeni kalem gelir.

**Bedel:** 1100 kilitli bir kart; değişiklik yalnız ekleme, mevcut satırlara dokunulmaz. Her ofis ailesi kütüphanede üç kalem uzar.

**Geri dönüş:** bugün doküman kararı; tohumdan sonra deneme verisi olduğu için geri alınır.

**Not (KART 1400 turu):** KART-KATALOGU §7.3 tablosunda 1409 Yapımcı Birimi Ofis Giderleri var; aynı aile orada da kurulur. Aynı bölümün anlatısında 1409 hâlâ "Kurumsal Ağırlama" diye geçiyor; o tur çözülür.

### Hak çeşidinin adı — KABUL (Engin, 13 Ekim 2026)

İlk öneri (geri çekildi, aşağıda düzeltildi): **Hak Devri ve Tekrar Kullanım** (bugünkü aday adı "Hak Devri ve Telif Bedeli"; analizdeki öneri "Hak Devri ve Kullanım Bedeli").

| Kalem | Ne için ödeniyor | Çeşit |
| --- | --- | --- |
| 1501-01 Yönetmen Hak Devri | Yönetmenin mali haklarının devri | Hak Devri ve Tekrar Kullanım |
| 1620 ADR Hak Devri | Oyuncunun ADR kaydındaki haklarının devri | Hak Devri ve Tekrar Kullanım |
| 1614 Tekrar Telifi | Oyuncunun icrasının yeniden kullanımı (tekrar yayın) | Hak Devri ve Tekrar Kullanım |

**Neden bu ad:**

- Üç kalemin kendi adlarını taşır: ikisi hak devri, biri tekrar kullanım. "Hak devri" sahanın kelimesi (Engin, 30 Eylül 2026: mali haklar devir sözleşmesi).
- "Kullanım bedeli" denseydi kardeş çeşitlerle karışırdı: Müzik Lisansı ve Arşiv ve Görüntü Lisansı da hazır bir eserin kullanım bedelidir. Ayrım şu: lisans dışarıdaki bir eserin kullanım izni; bu çeşit, projede çalışan kişinin kendi işi üzerindeki hakkı.
- Hak Satın Alma'dan farkı: o kaynak eserin (roman, öykü) hakkı; bu, projede çalışan kişinin hakkı.
- "Telif" çeşit adına girmez (KARARLAR madde 7); telif olduğu statüden okunur. Kalem adı "Tekrar Telifi" yerinde kalır.

**Kaynak:** Telefilm her oyuncu satırının ve ADR satırının altında "Rights payment (%)" satırı açıyor (Stars, ADR/Looping, Principals, Actors): kişinin ücretine bağlı hak ödemesi, KAAPA'daki hak devri satırlarının karşılığı. CNC yönetmenin hakkını ayrı başlıkta tutuyor (13 Droits d'auteur réalisation). Screen Australia'daki "Buyout Fees" geliştirme fonuyla ilgili, bu çeşide girmez.

**Raporda ne çıkar:** yönetmen Hizmet Bedeli 500.000 (Personel Ücreti) ve Hak Devri 500.000; dizi oyuncusunun Tekrar Telifi 40.000; ADR Hak Devri 15.000 → "Hak Devri ve Tekrar Kullanım" toplamı 555.000. Telif statüsündeki bütün ödemeler ise statüden ayrıca okunur.

**Geri dönüş:** sözlük adı; tohumdan önce değişirse bedelsiz, sonra değişirse göç.

**Öneri düzeltildi:** iki ayrı alt çeşit (Haklar ve Lisanslar altında).

| Alt çeşit | Kalemler | Bütçede mi |
| --- | --- | --- |
| Hak Devri | 1501-01 Yönetmen Hak Devri · 1620 ADR Hak Devri | Evet; kişinin ücretinin ayrılmış parçası |
| Tekrar Kullanım Payı | 1614 Tekrar Telifi | Hayır; ödeme olursa gerçekleşende bu adla görünür |

**Neden ayrıldı:** tekrar telifi giderden değil hasılattan hesaplanır, kâr paylaşımıdır ve harcama-kontrol doktrininin dışındadır (Engin, 11 ve 19 Eylül 2026, KART-KATALOGU §7.5); 1614 kütüphanede yalnız gerçekleşen çalışılırken gerekebileceği için durur. Hak devri ise bütçede yazılan, kesin bir ödemedir. İkisini aynı çeşitte toplamak, bütçelenen bir giderle hiç oluşmayabilecek bir payı aynı rapora koyardı. 6 Ekim eşlemesi üçünü birlikte koymuştu, 1614'ün kararları okunmadan.

Engin'in itirazı (birebir):

> Neden? Hak devri maaşın bir kısmı gibi görülebilir pratikte, yapımcı hak devri der ikinci taksite mesela, ancak tekrar telifi bütçede değil sözleşmede olan bir şeydir. Hiç oluşmayabilir ya da onlarca defa olabilir. Bundan emin misin, kafa karışmasın

**Hak devri neden Personel Ücreti değil:** satır ancak ücret ikiye ayrıldığında doğar; ayırmanın sebebi vergi (telif statüsü) ve kurum formlarıdır (Engin, 30 Eylül 2026: CNC, Eurimages ayrı ister). Ayrılmazsa para Hizmet Bedeli'nde, Personel Ücreti'ndedir. Kişinin toplamında ikisi birlikte görünür (kişi etiketi); KARARLAR madde 7 aynen kalır.

**Raporda:** yönetmen Hizmet Bedeli 500.000 Personel Ücreti'nde; Hak Devri 500.000 ve ADR Hak Devri 15.000 → Hak Devri toplamı 515.000. Tekrar Kullanım Payı bütçede yok, gerçekleşende ödendikçe görünür.

**Haklar ve Lisanslar üst çeşidinin düzeni (Engin sordu, 13 Ekim 2026):** para bir eser üzerindeki hakkın karşılığıysa buraya girer; altında üç ilişki var.

| Kimin eseri | Alt çeşit | Kalem |
| --- | --- | --- |
| Filmin dayandığı kaynak eser (roman, öykü) | Hak Satın Alma · Opsiyon ve Uzatma | 1101-01 · 1101-02, 1101-03 |
| Projede çalışan kişinin kendi işi | Hak Devri · Tekrar Kullanım Payı | 1501-01, 1620 · 1614 |
| Dışarıdaki hazır eser (şarkı, arşiv görüntüsü) | Müzik Lisansı · Arşiv ve Görüntü Lisansı | müzik kartı kurulmadı · 1107-03 Arşiv-Kaynak-Telif |

Devir ile lisans farkı (FSEK): devirde mali hak yapımcıya geçer; lisansta hak sahibinde kalır, yapımcı yalnız kullanma izni alır. [Erdem & Erdem, Eser sahibinin mali haklarının devri](https://www.erdem-erdem.av.tr/bilgi-bankasi/eser-sahibinin-mali-haklarinin-devri) · CNC formunun 1. bölümü (DROITS ARTISTIQUES) aynı grubu tutar: 11 konu, 12 uyarlama ve diyalog, 13 yönetmenin yazarlık hakkı, 14 müzik hakları, 15 diğer haklar (arşiv görüntüleri, fotoğraf hakları, clearance).

### Sözlük adları ve kütüphane eşlemesi

#### 5a. Adlar — KABUL (Engin, 13 Ekim 2026)

15 üst, 69 alt çeşit (hak çeşidi ikiye ayrıldıktan sonra). Değişiklik önerilenler kalın.

| Üst çeşit | Alt çeşitler |
| --- | --- |
| Ücret ve Kaşe | Personel Ücreti · Fazla Mesai · Temsilci ve Ajans Komisyonu · Ödenek ve Kit Kirası |
| Haklar ve Lisanslar | Hak Satın Alma · Opsiyon ve Uzatma · Hak Devri · Tekrar Kullanım Payı · Müzik Lisansı · Arşiv ve Görüntü Lisansı |
| Seyahat ve Konaklama | Ulaşım Bileti · Konaklama · Harcırah · Yolculuk Aracı Kiralama · Yolculukta Yemek ve Ağırlama · Vize ve Pasaport |
| Yemek ve İkram | Set Yemeği · Ara Öğün ve İkram · Mesai Yemeği · Ağırlama ve Temsil |
| Araç ve Nakliye | Yapım Aracı Kiralama · Oyun Aracı Kiralama · Yakıt · Yol, Köprü, Otopark · Taksi ve Transfer · Nakliye, Kargo, Kurye · Araç Bakım-Onarım |
| Mekân | Lokasyon Kirası · Stüdyo ve Plato Kirası · Ofis Kirası · Depo ve Atölye Kirası · **Mekân Giderleri** (ad kalır, açıklama hanesi eklenir) |
| Ekipman | Ekipman Kiralama · Ekipman Satın Alma · Ekipman Bakım-Onarım · Kayıt ve Depolama Medyası |
| Malzeme ve İmalat | Malzeme Satın Alma · Malzeme Kiralama · İmalat ve Atölye İşi · Sarf Malzeme |
| Hizmet Alımı | Hukuk ve Clearance · Mali Müşavirlik ve Denetim · Danışmanlık ve Uzmanlık · **Teknik Hizmet** (parantez açıklamaya) · **Çeviri ve Altyazı** (bugün: Çeviri, Altyazı, Dublaj) · Tasarım ve Grafik · Güvenlik · Sağlık ve Medik · **Cast Hizmeti** (bugün: Ajans Hizmeti) |
| Ofis ve İdari | Kırtasiye ve Ofis Sarfı · İletişim · Yazılım ve Abonelik · Basım ve Çoğaltma |
| Vergi, Harç ve Resmî Ödemeler | Noter ve Resmî Harçlar · Çekim İzni ve Belediye Harçları · Gümrük ve Karnet · Damga Vergisi |
| Finansman ve Sigorta | Sigorta Primi · Banka, Havale ve Kur Masrafı · Faiz ve Finansman Gideri · Kayıp ve Hasar (Ekipman'dan taşındı) |
| Tanıtım, Festival ve Dağıtım | Festival, Market ve Lab Katılımı · Tanıtım Materyali · Reklam ve Medya Alımı · PR ve Basın · Gösterim ve Kopya |
| Hayvan | Hayvan Kiralama · Hayvan Satın Alma |
| Diğer | Beklenmedik Küçük Giderler |

**Değişikliklerin gerekçesi:**

1. **Mekân Giderleri: ad kalır, açıklama hanesi eklenir. KABUL (Engin, 13 Ekim 2026).** İlk öneri "Aidat ve Faturalar" idi, geri çekildi: "fatura" muhasebede her giderin belgesidir, çeşit listesinde faturalı giderler diye okunur. Bu çeşidin asıl sahibi Lokasyon kartı olacak (lokasyonun kira dışı giderleri); adı ofise göre daraltmak erken. Açıklama hanesine "mekânın kira dışı giderleri: aidat, elektrik, su, doğalgaz, ısınma" yazılır (kaynaklarda Utility Costs, Heating/Electricity, Eau-Gaz-Électricité); kapsam Lokasyon kartı kurulurken kesinleşir. Ofis kalemlerinin adı (Ofis Aidat ve Faturaları) yerinde kalır, "ofis" bağlamı faturayı fatura gideri yapar.
2. **Çeviri, Altyazı, Dublaj → Çeviri ve Altyazı. KABUL (Engin, 13 Ekim 2026).** Kütüphanede 1613 "Dublaj" oyuncunun seslendirme ücretidir, Personel Ücreti'nde durur; çeşit adında da "Dublaj" geçince raporda dublaj parası eksik sanılır. Dublaj stüdyosunun hizmeti Teknik Hizmet'e, seslendiren oyuncunun ücreti Personel Ücreti'ne gider.
3. **Teknik Hizmet (post, lab, VFX) → Teknik Hizmet. KABUL (Engin, 13 Ekim 2026).** Parantez içi sözlük tablosunda açıklama hanesine yazılır; şema diliminde sözlüğe bir açıklama hanesi eklenir. Teknik Hizmet bilerek geniş bir çeşit (post, lab, VFX ve çekimde dışarıdan alınan teknik hizmet); adı tek başına da doğru okunur.
4. **Ajans Hizmeti (casting, figüran temini) → Cast Hizmeti. KABUL (Engin, 13 Ekim 2026).** "Ajans" sahada reklam ajansı, PR ajansı, oyuncu ajansı da demek; oyuncu ajansının ve menajerin komisyonu ayrı çeşitte (Temsilci ve Ajans Komisyonu). Parantez atılınca hangi ajans olduğu kaybolur. İlk düzeltme "Cast ve Figüran Hizmeti" idi; Engin: "figüran kelimesi artık kullanılmıyor sektörde". KAAPA da kullanmıyor: başlık 1600-03 Arkaplan, kalemler 3901 Genel Arkaplan Oyuncusu ve 3913 Arkaplan Oyuncusu Castingi. Yeni ad satıcıyı değil satın alınanı söyler; "Cast" kütüphanenin bu süreçteki sözüdür (1600-04 Cast Operasyonu, 1605 Cast Direktörü, 1609 Cast Asistanı, 1619 Cast Gideri, 3914 Cast Sorumlusu). İçinde 3913 ile 1610 ve 1619'un paket satırları var. Açıklama hanesi: "dışarıdan alınan cast hizmeti: cast ajansının hizmet bedeli, arkaplan oyuncusu castingi, dışarıya paket verilen deneme çekimi ve cast süreci". Cast direktörünün, cast asistanının, cast sorumlusunun ve arkaplan oyuncularının ücreti ajans faturalasa da Personel Ücreti'nde kalır (KARARLAR madde 4).

**Değişmeyenler:** geri kalan bütün adlar sahanın kelimesi ve kardeşlerinden ayrışıyor; telif kelimesi hiçbirinde yok (madde 7), departman adı yok (madde 2).

#### 5b. Eşleme — KABUL (Engin, 13 Ekim 2026)

6 Ekim eşlemesi bugünkü kararlarla güncellenir: 100 kütüphane kalemi ve 31 yeni parça satırı, 131 kalemin hepsi bir alt çeşitte. Her kalemin statüsü çeşidiyle karşılaştırıldı (1100, 1300 ve 1500 KART-KATALOGU tablolarından, 1600 tohum göçünden): madde 4 ve 7'nin bilerek bıraktıkları dışında çelişki yok (ekipte çalışıp faturayla ya da telif belgesiyle ödenen kişi Personel Ücreti'nde).

- **Personel Ücreti:** 1101-04, 1101-06, 1102-01, 1102-02, 1103-01, 1105-06, 1107-01, 1301, 1302, 1306, 1309, 1313, 1314, 1501, 1502, 1503, 1504, 1506, 1509, 1510, 1601–1609, 1610-07, 1612, 1613, 1615, 1616, 1619-07, 3901–3904, 3914, 3916, 3917. **Fazla Mesai:** 1611. **Temsilci ve Ajans Komisyonu:** 1315, 1511, 1618, 1618-01. **Ödenek ve Kit Kirası:** 3910.
- **Hak Satın Alma:** 1101-01. **Opsiyon ve Uzatma:** 1101-02, 1101-03. **Hak Devri:** 1501-01, 1620. **Tekrar Kullanım Payı:** 1614. **Arşiv ve Görüntü Lisansı:** 1107-03.
- **Seyahat aileleri (1108, 1305, 1508):** -01 Ulaşım Bileti, -02 Konaklama, -03 Yolculukta Yemek ve Ağırlama, -04 Harcırah, -05 Festival, Market ve Lab Katılımı, -06 Yolculuk Aracı Kiralama. 1305'te -05 yok (6 Ekim metni aile kuralıyla onu da sayıyordu).
- **Festival, Market ve Lab Katılımı:** 1104-06 (ayrıca 1108-05, 1508-05). **Tanıtım Materyali:** 1104-02, 1104-05.
- **Danışmanlık ve Uzmanlık:** 1101-05, 1101-07, 1104-01, 1107-02, 1107-04, 1307, 1312. **Hukuk ve Clearance:** 1106-01, 1106-02, 1308. **Mali Müşavirlik ve Denetim:** 1106-03, 1106-04. **Tasarım ve Grafik:** 1104-03. **Çeviri ve Altyazı:** 1104-04. **Cast Hizmeti:** 3913; 1610 ve 1619 paket satırları. **Noter ve Resmî Harçlar:** 1106-05.
- **Ofis aileleri (1105, 1310, 1507):** -01 Ofis Kirası, -02 Kırtasiye ve Ofis Sarfı, -03 İletişim, -04 Nakliye, Kargo, Kurye, -05 Yazılım ve Abonelik, -07 Mekân Giderleri, -08 Ekipman Kiralama, -09 Ekipman Satın Alma; 1105-06 Sekretarya Personel Ücreti'nde. 1310 ve 1507 paket satırı: Ofis Kirası.
- **Deneme çekimi ve cast parçaları:** 1610-01 ve 1619-01 Stüdyo ve Plato Kirası · 1610-02 ve 1619-02 Ekipman Kiralama · 1610-03 Malzeme Kiralama · 1610-04 Sarf Malzeme · 1610-05 Set Yemeği · 1619-05 Ara Öğün ve İkram · 1610-06 ve 1619-06 Taksi ve Transfer · 1610-07 ve 1619-07 Personel Ücreti.
- **Banka, Havale ve Kur Masrafı:** 1190-01. **Beklenmedik Küçük Giderler:** 1190-02.
- **Başlıklar çeşit taşımaz (madde 6):** 1101–1108, 1190 ve 1600'ün dört başlığı.
- **Sınırdakiler (madde 4'ün ölçüsüyle tek tek):** 1104-01 Bütçeleme ve 1101-05 Danışman-Editör Danışmanlık ve Uzmanlık'ta kalır, ikisi de sonucunu teslim eder (bütçe, senaryo notu). 1306 Senaryo Doktoru/Editör Personel Ücreti'nde kalır: fonlama sonrası yazım sürecinde ekiple çalışan dramaturgdur (KART-KATALOGU §7.2 SINIR); rapor teslim eden dışarıdaki dramaturg 1101-07'dir.
- **6 Ekim'den değişenler:** 1501-01 ve 1620 Hak Devri'ne, 1614 Tekrar Kullanım Payı'na; 3913 ile 1610 ve 1619 paketi Cast Hizmeti'ne; 1104-04 Çeviri ve Altyazı'ya (ad); 1310 ve 1507 paketi Ofis Kirası'na; 1305-05 metinden düştü.
- **KART 1400:** kalemleri kütüphanede henüz yok; KART 1400 turunda çeşidiyle doğar (Analiz §9 sıra 4).

### Doğa işareti — KABUL (Engin, 13 Ekim 2026); kurum formlarıyla sınandı

Her alt çeşit tek bir doğa işareti taşır, on değerden biri; kimseye sorulmaz, çeşitle gelir. Çeşit paranın hangi alana gittiğini söyler (yakıt, konaklama, ekipman); doğa o alışverişin türünü söyler (emek, kira, satın alma, hizmet). Formlar da böyle kurulu: bölümleri alana göredir (Screen Australia M Travel & Transport, N Accommodation; CNC 6 Transports), türü detay satırında ayırırlar (Hire / Purchase, labour / materials, kit, per diem).

**Değişen kural (KARARLAR madde 2), eski ve yeni:**

- Eski (6 Ekim 2026): "Her alt çeşit doğa ve tedarik işaretini kendiliğinden taşır." Aday sözlük: doğa (işçilik, hizmet, mal, kira, hak, harç, finansman, ödenek, diğer) ve tedarik (kiralama, satın alma, imalat). "Kiralama üst çeşit olmaz; ilgili alt çeşitlerde yaşar, toplamı tedarik işaretinden alınır."
- Yeni: her alt çeşit tek işaret taşır, doğa (aşağıdaki on değer). "Kiralama üst çeşit olmaz; ilgili alt çeşitlerde yaşar, toplamı doğa işaretinden alınır." Eski doğadaki "mal" Satın Alma ile İmalat'a, "kira" Kiralama'ya ayrılır; "finansman" Finansman ve Sigorta olur. Neden: "kira" ile "kiralama", "mal" ile "satın alma, imalat" aynı bilgiyi iki alanda tutuyordu (madde 7'nin ilkesi).

**Sınamanın ilk öneriden düzelttikleri:**

- Temsilci ve Ajans Komisyonu Hizmet'ten İşçilik'e geçti. Kaynakların hepsi komisyonu temsil edilen kişinin yanında tutuyor: AICP M Talent'ta 266 Talent Agency Fees; CNC'de 19, 29 ve 39 Agents, temsil ettikleri kişilerin bölümünde; Hot Budget'ta Agency Fees, ücrete eklenen ikinci yük (Fringe 2). Screen Australia, Telefilm ve BFI'da ayrı satır yok.
- Kiralama'nın emsali düzeltildi. Screen Australia L Rentals & Storage bütün kiralar değil, çoğunlukla mekân kirasıdır (ofis, atölye, depo, garaj, soyunma odası); ekipman kirası K'da, araç kirası M'de. Kiralama ile satın alma ayrımı ise her formda detay satırında var: Screen Australia Equipment - Hire / - Purchase, Vehicle Hire / Vehicle Purchases; AICP Wardrobe Rental / Purchase ve I Equipment Rental; Telefilm Rentals / Purchases; BFI Purchases / Rentals; MMB Rental / Purchase. Toplam kiralama bir form bölümü değil, KAAPA'nın kendi raporudur (madde 2).
- Hak tanımı daraltıldı: filmde kullanılan eserin, icranın ya da görüntünün hakkı. Yazılım lisansı formlarda ofis gideridir (Screen Australia P Computer Hire/Software, Telefilm Computer services/Rentals/Software, BFI 21.4 Software licences).

| Doğa | Paranın karşılığı | Formlardaki karşılığı |
| --- | --- | --- |
| İşçilik | Yapım için çalışan kişinin bedeli: ücret, mesai ve ona bağlı temsilci komisyonu; nasıl ödendiğini statü söyler (madde 4) | Screen Australia C Unit Fees & Salaries · Telefilm labour hesapları · AICP A, B, G, W ve M Talent · CNC 2, 3 |
| Ödenek | Kişiye kendi harcaması için verilen sabit para: harcırah, kit, kostüm ve araç ödeneği | Telefilm Kit fees · Screen Australia 5.Allce · AICP Kit Rental, Talent Wardrobe Allowance, Per Diems · BFI Box rental, Per diem · CNC 6152, 6153 |
| Kiralama | Bir şeyi belli süre kullanmak: ekipman, mekân, araç, hayvan, malzeme | Hire / Rental detay satırları |
| Satın Alma | Bir şeyin sahibi olmak; sarf, yakıt ve medya dahil | Purchase detay satırları · BFI Consumables · 7/B 790 |
| İmalat | Bir şeyi yapıma özel yaptırmak: dekor, dikim, atölye işi | AICP Prop Fabrication · Telefilm Construction labour / materials · Screen Australia H.1 Construction |
| Hizmet | Dışarıdan alınan iş ya da hizmet: mesleki hizmet, taşıma, konaklama, yemek servisi, bakım-onarım, iletişim, enerji | 7/B 793 |
| Hak | Filmde kullanılan eserin, icranın ya da görüntünün hakkı | CNC 1 Droits artistiques · Screen Australia A.1 Story & Script, J Archival |
| Harç ve Vergi | Devlete ve kamu kurumlarına ödenen | CNC 47 · Screen Australia Y Stamp Duty, M Visas & Departure Taxes · 7/B 795 |
| Finansman ve Sigorta | Paranın ve riskin bedeli; kayıp ve hasar dahil | CNC 91, 94 · Screen Australia O Insurances (Deductibles dahil), Y Bank Fees |
| Diğer | Hiçbirine girmeyen küçük giderler | MMB x98 Miscellaneous |

**Atama (69 alt çeşit):**

| Üst çeşit | Alt çeşit → doğa |
| --- | --- |
| Ücret ve Kaşe | Personel Ücreti, Fazla Mesai, Temsilci ve Ajans Komisyonu → İşçilik · Ödenek ve Kit Kirası → Ödenek |
| Haklar ve Lisanslar | altısı da → Hak |
| Seyahat ve Konaklama | Ulaşım Bileti, Konaklama, Yolculukta Yemek ve Ağırlama → Hizmet · Harcırah → Ödenek · Yolculuk Aracı Kiralama → Kiralama · Vize ve Pasaport → Harç ve Vergi |
| Yemek ve İkram | Set Yemeği, Mesai Yemeği, Ağırlama ve Temsil → Hizmet · Ara Öğün ve İkram → Satın Alma |
| Araç ve Nakliye | Yapım Aracı Kiralama, Oyun Aracı Kiralama → Kiralama · Yakıt → Satın Alma · Yol, Köprü, Otopark; Taksi ve Transfer; Nakliye, Kargo, Kurye; Araç Bakım-Onarım → Hizmet |
| Mekân | dört kira → Kiralama · Mekân Giderleri → Hizmet |
| Ekipman | Ekipman Kiralama → Kiralama · Ekipman Satın Alma, Kayıt ve Depolama Medyası → Satın Alma · Ekipman Bakım-Onarım → Hizmet |
| Malzeme ve İmalat | Malzeme Satın Alma, Sarf Malzeme → Satın Alma · Malzeme Kiralama → Kiralama · İmalat ve Atölye İşi → İmalat |
| Hizmet Alımı | dokuzu da → Hizmet |
| Ofis ve İdari | Kırtasiye ve Ofis Sarfı → Satın Alma · İletişim, Yazılım ve Abonelik, Basım ve Çoğaltma → Hizmet |
| Vergi, Harç ve Resmî Ödemeler | dördü de → Harç ve Vergi |
| Finansman ve Sigorta | dördü de (Kayıp ve Hasar dahil) → Finansman ve Sigorta |
| Tanıtım, Festival ve Dağıtım | beşi de → Hizmet |
| Hayvan | Hayvan Kiralama → Kiralama · Hayvan Satın Alma → Satın Alma |
| Diğer | Beklenmedik Küçük Giderler → Diğer |

Dağılım: Hizmet 29 · Kiralama 10 · Satın Alma 8 · Hak 6 · Harç ve Vergi 5 · Finansman ve Sigorta 4 · İşçilik 3 · Ödenek 2 · İmalat 1 · Diğer 1.

**Sınama tablosu (sınırdakiler; kaynaklar `docs/butce` altındaki formlar ve 7/B):**

| Çeşit | Kaynaklarda nerede | Doğa | Neden |
| --- | --- | --- | --- |
| Temsilci ve Ajans Komisyonu | AICP M 266 Talent Agency Fees · CNC 19, 29, 39 · Hot Budget Fringe 2 · Screen Australia, Telefilm, BFI'da ayrı satır yok | İşçilik | Hepsi kişinin yanında tutuyor |
| Ödenek ve Kit Kirası | Telefilm Kit fees emek hesabının içinde · Screen Australia 5.Allce C ve M'ye dağıtır · AICP D 137 Kit Rental, H 184 Art Dept Kit Rental (giderlerde) · BFI 12.6 Box rental · MMB 2514 Box Rentals | Ödenek | Formlar emek mi gider mi diye ayrışıyor; ayrı doğa her forma kendi yerini verdirir |
| Harcırah | Screen Australia N Per diems · AICP C 102, D 131, N 272 · BFI 15.2 · CNC 6152, 6153 · MMB Per Diem | Ödenek | Kişiye verilen sabit para |
| Konaklama, Ulaşım Bileti | Screen Australia M Airfares, N Accommodation · AICP C ve D Hotels, D Air Fares · BFI 14, 15 · CNC 61, 62 | Hizmet | Taşıyıcı ve otel hizmet satar; formlar kendi bölümünde ister |
| Set Yemeği · Ara Öğün ve İkram | Screen Australia N Catering, Craft Services · Telefilm Catering, Craft service · BFI 13.4 · CNC 6151 Repas, 6154 Casse-croûtes et boissons | Hizmet · Satın Alma | Yemek firması hizmet satar; ikram çoğunlukla marketten alınan sarf. Formların ikisini bir arada tutması üst çeşitten gelir (Yemek ve İkram) |
| Yakıt | Screen Australia M Petrol/Oil/Diesel (araç ve jeneratör) · Telefilm Gas/diesel · AICP D 127 · CNC 626 Carburant | Satın Alma | Formlar ulaşım bölümünde tutar; o okuma çeşitten (Yakıt) ve üst çeşitten (Araç ve Nakliye) gelir |
| Yol, Köprü, Otopark | Screen Australia M Parking & Tolls · Telefilm Parking · AICP D 127 · BFI 13.3 · CNC 6271, 6273 | Hizmet | Yolun ve park yerinin kullanım bedeli |
| Kayıp ve Hasar | Screen Australia H.2 Loss/Damages/Repairs, O Deductibles · Telefilm 45.85 Loss and damage (ekipman hesabında) · CNC 6274 Entretien, réparations, franchises · MMB x97, 19 departmanda | Finansman ve Sigorta | Formlar bölümde tutar, o okuma kart ve üst çeşitten gelir; doğa riskin bedelini toplar (muafiyeti sigorta bölümünde tutan yalnız Screen Australia; seçim kaynaktan değil yargıdan; Eurimages dekor ve lokasyonda provision der, şablonların bir kısmı onarım ve temizlikle aynı satırda tutar) |
| Yazılım ve Abonelik | Screen Australia P Computer Hire/Software · Telefilm Computer services/Rentals/Software · BFI 21.3, 21.4 | Hizmet | Ofis gideri, filmin hakkı değil |
| Mekân Giderleri | Screen Australia L Air conditioning, Cleaning; P Electricity · Telefilm Heating/Electricity · 7/B 793 (elektrik, su, gaz), 794 (aidat) | Hizmet | Enerji ve bina hizmeti |
| Vize ve Pasaport · Gümrük ve Karnet | Screen Australia M Visas & Departure Taxes, Customs Charges & Agency Fees · Telefilm Customs/Brokerage · CNC 67 Transitaire et douane | Harç ve Vergi | Paranın çoğu devlete; komisyoncu payı küçük |

**Yazılımlar (tanık):** Saturation hesap temelli bütçe ve serbest etiket kullanır; tanıtım örneğinde etiketler Rental, Purchase ve Allowance, yani Kiralama, Satın Alma ve Ödenek elle etiketleniyor. Aynı alanda IATSE 600 ve Second Unit de duruyor: tür, sendika ve birim karışıyor, repo bunu kaçınılacak örnek olarak yazdı (`docs/rakip/GIDER-CESIDI-TARAMASI.md` §3.5). Saturation'ın 15 şablon dışa aktarımı (Netflix, BBC, HBO, Disney, CBC ve diğerleri) Master Excel'in kaynakları arasındadır (KART-GEREKCELERI). Yamdu bütçede MMB'nin araçlarını taşır: hesap ağacı, Fringes, Groups, Globals; MMB'den grup atamalarıyla içe aktarır (`docs/RAKIP-ANALIZI-URUN.md` §1.6). MMB kesişen raporu Groups ile alır. Hiçbirinde sabit bir tür listesi yok; ihtiyaç kullanıcının elle kurduğu etiket ve grupla karşılanıyor, KAAPA'da doğa kimseye sorulmadan gelir.

**Eurimages (Summary Production Budget 2018 REV3, Expenses\_Classification sayfası; Engin 13 Ekim 2026'da ekledi; aynı sınıflandırmanın kalemleri Master Excel'de 445 satırda kaynak olarak duruyor):** temsilcileri temsil ettikleri kişinin yanında tutar: Literary agent 1.2 Adaptation rights'ta, Director's Agent 2.2'de (yönetmen), Talent agencies 3.4'te (oyuncular); komisyonun İşçilik olmasını destekler. Per diem, vize, yakıt, park ve köprü, otel, catering ve araç ödeneği 4.12 Transport, Travel and living'de; Generator & fuel 4.9'da (ışık). Bunlar alan okumasıdır, doğayı değiştirmez. Yazılım 7.1 (Rent of computers, softwares & supplies) ve 5.6'da (Softwares & licenses), haklarda değil. Loss & Damages dokuz departmanda ayrı satır (dekor, lokasyon, aksesuar, kostüm-makyaj-saç, kamera, ışık, grip, ses, ulaşım), dekor ve lokasyonda adı provision (karşılık): aşağıdaki açık notu doğrular. Noter, gümrük ve geri alınamayan vergi 7.2 Insurance & legal costs içinde (alan okuması). Sözlükte karşılığı olmayan: 7.1 Fees for professional associations or unions (meslek birliği ve sendika aidatı). Her satır dört ortak yapımcıya ve ülkeye bölünür: tarama raporunun "doğrulanmadı" dediği ortak yapımcı kırılımı doğrulandı, KAAPA'da bu eksen yok (Hedef Mecra konusu, doğayı etkilemez).

**Saturation şablonları (Master Excel'deki 15 dışa aktarım; satır adı düzeyinde, şablonun bölüm bilgisi yok, yalnız dosyanın "olası kart" tahmini var):** kiralama satırı 15 şablonun hepsinde (218 kalem), satın alma 12'sinde (70), imalat ve yapım 10'unda (28). Ödenek 12 şablonda: Box Rental ve Kit Rental (Netflix, HBO, Disney, BET, CBC, Georgia), kişi kişi harcırah (Cast, Director, Producer Per Diem), Car Allowance, DGA Meal Allowance. Ajans ve komisyon 9 şablonda; yeri belli olanlar oyuncu bölümünde (Discovery "Agency Comissions (for actors)", Disney "Casting Commissions"); Casting Agency satırları Cast Hizmeti'ne, CBC "Agency Packaging Fee" KART 1400'ün paketleme komisyonuna denk. Kayıp ve hasar 9 şablonda, departman departman (Camera, Wardrobe, Prop, Set Dressing); bir kısmı onarım ve temizlikle aynı satırda (Netflix "Loss, Damage, and Repair", "Wardrobe Loss, Damage, Cleaning"); hiçbiri sigortada değil. Yakıt 11 şablonda, ulaşımda ve ışıkta (Generator & fuel). Yazılım 10 şablonda (Computer Software, Editing Software, Subscriptions); müzik lisansları ayrı satır.

Açık not (KAPANDI, Engin kabul 13 Ekim 2026: Kayıp ve Hasar Finansman ve Sigorta üst çeşidine taşındı, departman karttan okunur): Kayıp ve Hasar yalnız ekipmanda olmuyor (MMB 19 departmanda x97 tutar), bugün Ekipman üst çeşidinin altında; kostüm ya da dekor hasarı da Ekipman toplamına girer. Doğa kararını değiştirmez; üst çeşit yeri ayrı konu.

**Raporda:** doğa toplamları bütün kartlardan gelir. Toplam kiralama: ekipman, mekân, araç, hayvan, malzeme ve yolculuk aracı kiraları. Toplam işçilik: bütün kartlardaki ücret, mesai ve temsilci komisyonu (Screen Australia C, Telefilm labour, AICP Talent). Ödenekler: harcırah, kit, kostüm ve araç ödeneği. Kullanıcı hiçbir şey seçmez. Alan soruları (yakıta, nakliyeye, ekipmana ne gitti) çeşitten cevaplanır; doğa onların yerine geçmez.

**7/B:** doğadan tek başına çıkmaz, alt çeşit ile statü birlikte okunur (AÇIK SORULAR EK madde 4). Örnek: Mekân Giderleri'nin elektriği 793'e, aidatı 794'e; Finansman ve Sigorta'nın primi 794'e, faizi 797'ye düşer.

**Geri dönüş:** doküman kararı. Şema diliminde sözlük tablosuna iki yerine tek kolon girer; sonradan değişen doğa bir göç ister (bugün deneme verisi).

### Bu oturumda alınan kararlar

1. **1610 Deneme Çekimi ailesi (Engin kabul, 13 Ekim 2026).** Yedi parça satırı (1610-01 Mekânı · 1610-02 Ekipmanı · 1610-03 Kostümü · 1610-04 Makyajı · 1610-05 Yemeği · 1610-06 Ulaşımı · 1610-07 Ekibi), çeşitleri yukarıdaki tabloda. Ana kod paket satırıdır (Cast Hizmeti), adı değişmez. Şablona 1610-01, 1610-02 ve 1610-05 girer; 1610 şablondan çıkar. Parça adı sürecin adıyla başlar, çünkü kod kullanıcıya görünmez.
2. **1610-07 kuralı (Engin kabul, 13 Ekim 2026).** Yalnız teste özel tutulan ekip; hazırlığa girmiş ekibin emeği kendi kartında; ayrım takvimden gelir, emin olunamazsa 1610-07. Çakışmayı §4.9 Crew Overlap Guard yakalar, ücret kişi bağıyla kişinin satırından gelir (ikisi park). Ayrıntı ve saha bilgisi yukarıda.
3. **1619 Cast Gideri ailesi (Engin kabul, 13 Ekim 2026).** Parça satırları: 1619-01 Cast Odası · 1619-02 Cast Kayıt Ekipmanı · 1619-05 Cast Günü İkramı · 1619-06 Cast Günü Ulaşımı · 1619-07 Cast Kayıt Ekibi (1610-07 kuralı); çeşitleri ve kaynakları yukarıdaki tabloda. Ana kod paket satırıdır (Cast Hizmeti), adı değişmez. Şablona 1619-01, 1619-02 ve 1619-05 girer; 1619 şablondan çıkar. Cast direktörünün ücreti ajans faturalasa da 1605'te kalır.
4. **Ofis aileleri: 1105, 1310, 1507 (Engin kabul, 13 Ekim 2026).** Üçü aynı parça setini taşır: -01 Ofis Kirası · -02 Kırtasiye-Sarf · -03 İletişim · -04 Kargo-Kurye · -05 Yazılım-Abonelik · -07 Ofis Aidat ve Faturaları (yeni) · -08 Ofis Donanım Kirası (yeni) · -09 Ofis Donanım Alımı (yeni); -06 yalnız 1105'te (Sekretarya). 1310 ve 1507 ana kodu paket satırıdır: hazır ofis, çeşidi Ofis Kirası, birimi ay, eş adı Hazır Ofis. Yapım şirketinin kendi ofisi bu ailelere yazılmaz, genel giderdir. 1100'de değişiklik yalnız ekleme. 1409 aynı aileyi KART 1400 turunda alır.
5. **Hak çeşidi ikiye ayrıldı (Engin kabul, 13 Ekim 2026).** "Hak Devri ve Telif Bedeli" yerine Haklar ve Lisanslar altında iki alt çeşit: **Hak Devri** (1501-01 Yönetmen Hak Devri, 1620 ADR Hak Devri; bütçede yazılan, ücretin ayrılmış parçası) ve **Tekrar Kullanım Payı** (1614 Tekrar Telifi; bütçeye yazılmaz, hasılattan hesaplanan kâr paylaşımıdır, 11 ve 19 Eylül 2026 kararları; ödenirse gerçekleşende görünür). KARARLAR madde 7 aynen kalır. Engin'in itirazı birebir yukarıda.
6. **Sözlük adları, 5a (Engin kabul, 13 Ekim 2026).** Dört ad: Mekân Giderleri adı kalır, açıklama hanesine mekânın kira dışı giderleri yazılır (kapsam Lokasyon kartında kesinleşir) · Çeviri, Altyazı, Dublaj → Çeviri ve Altyazı · Teknik Hizmet (post, lab, VFX) → Teknik Hizmet · Ajans Hizmeti (casting, figüran temini) → Cast Hizmeti. Parantez içleri ve kapsam notları sözlüğün açıklama hanesine yazılır; şema diliminde sözlüğe açıklama hanesi eklenir. Sektörde ve KAAPA'da "figüran" yerine arkaplan oyuncusu denir (Engin); repo metinleri kapanışta düzeltilir.
7. **Kütüphane eşlemesi, 5b (Engin kabul, 13 Ekim 2026).** 131 kalemin hepsi bir alt çeşitte (100 kütüphane kalemi, 31 yeni parça satırı); tam liste yukarıda, repodaki eşleme biçiminde. Her kalemin statüsü çeşidiyle karşılaştırıldı, çelişki yok. Sınırdakiler yerinde: 1104-01 ve 1101-05 Danışmanlık ve Uzmanlık'ta, 1306 Personel Ücreti'nde. 1305-05 6 Ekim metninden düştü (öyle bir satır yok). KART 1400 kalemleri kendi turunda çeşidiyle doğar.
8. **Doğa işareti (Engin kabul, 13 Ekim 2026).** Her alt çeşit tek doğa işareti taşır: İşçilik, Ödenek, Kiralama, Satın Alma, İmalat, Hizmet, Hak, Harç ve Vergi, Finansman ve Sigorta, Diğer; tedarik ayrı işaret olmaz (KARARLAR madde 2 değişir, eski ve yeni yukarıda). Atama ve sınama tablosu yukarıda; sınanan kaynaklar: Screen Australia, Telefilm, BFI, AICP, CNC, MMB, Hot Budget, Eurimages, Master Excel'deki 15 Saturation şablonu ve 7/B. Sınama ilk öneriden üç şeyi değiştirdi: komisyon İşçilik'e geçti, Kiralama'nın emsali düzeltildi, Hak daraltıldı (filmde kullanılan). Kayıp ve Hasar Finansman ve Sigorta'da; kaynaklar onu departmanda tutar, seçim yargıdır.
9. **Kayıp ve Hasar'ın yeri (Engin kabul, 13 Ekim 2026).** Ekipman üst çeşidinden Finansman ve Sigorta'ya taşındı. Kayıp ve hasar her departmanda olur (MMB 19 departmanda x97, Eurimages 9 departmanda, Saturation şablonları, Telefilm, Screen Australia); Ekipman'ın altında kostüm, dekor ve lokasyon hasarı ekipman toplamına giriyordu. Departman karttan okunur. Ekipman 4, Finansman ve Sigorta 4 alt çeşit; toplam 69.

**Kapanış notları:** (1) 13 Ekim metinleri (KART-KATALOGU §7.5 1610 VE 1619 SÜREÇ AİLESİ, analiz §4) başlığı "Kast Operasyonu" yazıyor; canlıda 19 Eylül 2026 göçünden beri "Cast Operasyonu". (2) Analiz §7'nin 4. (satırda çeşit değiştirme) ve 6. (küratörlük) konuları bu turda değil; şema dilimini durdurmuyorlar. (3) Deneme Çekimi Taraması sekmesi `docs/rakip/GIDER-CESIDI-TARAMASI.md`'ye yeni bölüm olarak taşınır. (4) Park listesine: 1610-07 otomasyonu (Crew Overlap Guard, kişi bağı, ücretin kişinin satırından gelmesi); tetik ekip kartları ve ekip listesi. (5) BUTCE-SEMA madde 9'daki "keşif ekibinin yevmiyesi de o ailede ayrı satırdır" cümlesine aynı ayrım eklenir (keşfe özel tutulan ekip ailede, hazırlıktaki ekip kendi kartında); kapanış promptunda Engin'e eski ve yeni cümle yan yana gösterilir.

**Kapanış notları, ek (13 Ekim akşamı):** (6) Eurimages Summary Production Budget 2018 REV3 dosyası `docs/butce/` altına girer; tarama raporuna Eurimages bölümü yazılır. (7) Tarama raporu §3.10'da iki satır düzeltilir, eski ve yeni yan yana: "Kültür ve Turizm Bakanlığı Sinema Genel Müdürlüğü 'Ayrıntılı Bütçe' istiyor" (Engin, 13 Ekim 2026: "Bakanlık desteğinde bütçe yapımcının kendi biçiminde veriliyor.") ve "Eurimages sitesi 403 döndü, ayrıntılı bütçe şablonu alınamadı" (sınıflandırma Master Excel'de vardı); §4'teki "ortak yapımcı kırılımı doğrulanmadı" notu doğrulandı olur. Hedef Mecra listelerindeki Bakanlık (CURRENT, KART-GEREKCELERI, IS-SIRASI, YONTEM) aynı cümleyle düzeltilir: Bakanlığın şablonu yok, bütçe yapımcının kendi biçimindedir. (8) DERSLER: repoya bakmadan "kaynak yok" demek (Eurimages, Saturation şablonları); kaynak sınamasında kart yönteminin çapraz doğrulama katmanı olan Master Excel'i atlamak; en ayrıntılı kaynağı en ağır kaynak gibi kullanmak (Screen Australia); kaynağı belirtilmemiş bir repo satırını doğrulamadan tekrarlamak (Bakanlık).

(9) Sözlükte karşılığı olmayan iki kalem, ilgili kart turlarında sözlük genişler (madde 3'ün "sözlük kartların hepsi yazıldığında genişleyebilir" kuralı): meslek birliği ve sendika aidatı (Eurimages 7.1 Fees for professional associations or unions; İdari) ve temizlik ve restorasyon (Eurimages 4.3 Site restoration, 4.4 Location restoration, 4.7 Wardrobe cleaning; Saturation şablonlarında Damage & Cleaning; Lokasyon, Sanat, Kostüm). (10) CURRENT.md Park listesine: Eurimages özet bütçesi her satırı dört ortak yapımcıya ve ülkeye böler; KAAPA'da ortak yapımcı ekseni yok (Hedef Mecra).
