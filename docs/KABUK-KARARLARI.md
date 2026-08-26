# KAAPA — KABUK KARARLARI

*Uygulama kabuğunun (Application Shell) TEK KAYNAĞI. Oluşturma: 4 Ağustos 2026, KABUK tasarım oturumu (Engin + Opus, doküman-only). Girdiler: Engin'in Application Shell metni + KAAPA çalışma masası mockup'ı + Yamdu rakip turu (RAKIP-ANALIZI-URUN) + kilitli ekran kararları (EKRAN-MUHASEBE §18/§19, BUTCE-UI-MIMARISI İ4).*

**Bu dosya mevcut ekran kararlarını DEĞİŞTİRMEZ.** EKRAN-MUHASEBE ve BUTCE-EKRAN-KARARLARI'nda tanımlı ekranlar aynen korunur; buradaki iş o ekranları ortak bir kabuğa yerleştirmek ve aralarındaki gezinmeyi kurmaktır. Tek istisna bölüm 9'dur (kart kapak rakamı) ve o bilinçli bir revizyon önerisidir.

**ENGİN KARARI (4 Ağustos 2026) — mockup'ın statüsü:** KAAPA çalışma masası mockup görseli KABUK turunun girdisidir ve TASARIM DİLİ örneğidir; içeriği, ray duraklarının isimleri ve kart aidiyeti BAĞLAYICI DEĞİLDİR. Bu dosyadaki maddeler mockup'ı değil alınan kararları yansıtır.

**STATÜ OKUMASI:** Her maddenin başında durumu yazılıdır — `KİLİTLİ` (daha önce mühürlenmiş, burada yalnız tekrarlanıyor), `ENGİN ONAYINA SUNULU` (4 Ağustos oturumunda önerildi, kabul/itiraz ALINMADI), `ENGİN KARARI` (bu oturumda Engin söyledi), `AÇIK` (karara bağlanmadı).

---

## 1. TASARIM TEZİ

**ENGİN KARARI (8 Ağustos 2026) (K1).** Tez tek cümle: **rakipler ekran yapıyor, KAAPA masa yapmalı.**

Gerekçe zinciri:
- Rakip haritası boşluğu gösteriyor: MMB bir hesap makinesi (uzman ister, korkutur), Yamdu bir dosya dolabı (her çekmecesi dolu, kademeli, kalabalık), Wrapbook/GreenSlate bordro gişesi. Hiçbiri "yapım ofisinin kendisi" olmaya çalışmıyor.
- KAAPA'nın kelime dağarcığı zaten fizikseldir: kart, masa, dönem, kasa, mühür. Bu tesadüf değil, ürünün ruhudur; tasarımın işi onu hissettirmektir.
- Kategori SaaS'ları birbirinin kopyası (koyu zemin, mor vurgu, sıkışık liste). Sıcak kâğıt zemini + Türk yapım dünyasının dili bu pazarda kimsede yok.
- İki kapılı kabuk tezin taşıyıcısıdır: rakiplerin hepsi döngünün tek yarısını tutar (MMB öngörüyü, bordro servisleri gerçekleşeni). KAAPA'da öngörü ile gerçek AYNI MASADA oturur; Muhasebe ve Bütçe kapıları bunun görünür hâli, Gerçekleşen durağı köprüsüdür.

Tezin dört sonucu:
1. **Nesne dili.** Kart bir klasördür, fiş bir fiştir, mühür bir kaşedir.
2. **Görsel imza: MÜHÜR damgası.** İ3'te işlevsel rozet olarak kararlaştırılmış "Mühür eki" markanın imza anına terfi eder — bütçe mühürlendiğinde sürüm yüzeyinde gerçek bir kaşe izi görünür. Kaşe kültürünün olduğu bir ülkede hiçbir rakipte "mühürlenmiş" hissi yok; bizde adı bile hazır.
3. **Klavye kimliği.** KLV en büyük mühendislik yatırımıdır, gizli kalmaz: "kayıt düğmesi yok, Excel hızında" bir gurur cümlesi olarak hissedilir. Yamdu'da form doldurulur, KAAPA'da yazılır.
4. **Bilen yardımcı.** Sağ referans paneli, masanın kenarında duran tecrübeli yapım muhasebecisidir: gerekçeyi, mevzuatı, mühür durumunu o fısıldar. Oran-yazmama kuralıyla (EKRAN-MUHASEBE §18) birebir uyumludur.

**Zemin disiplini:** sıcaklık ciddiyeti yumuşatmaz. Para güven ister; çözüm zanaattedir — beyaz iş yüzeyinde sıkı hizalar, para kolonlarında eş-genişlik rakam (₺ değerleri alt alta dizilir).

**Sınır:** Bu tez YENİ DİLİM AÇMAZ. KABUK sprintinin içeriğini değiştirmez; G6 dahil bundan sonraki her tasarım kararının pusulasıdır, iş listesi değildir.

**Özgünlük dökümü (dürüstlük kaydı, 4 Ağustos):** Tezin çoğu damıtmadır, icat değil. Masa metaforu, ferahlık gerekçesi, sıcak kâğıt dili, iki değer yüzeyinin eşitliği — hepsi Engin'in daha önce kilitlediği kararlardır; Opus'un katkısı bunları tek teze bağlamak ve adlandırmaktır. İcat olan üç şey: mühür damgasının marka imzasına terfisi, kapak rakamı uzlaşması (bölüm 9), çalışma/icmal modu fikri (bölüm 9 notu). Eş-genişlik rakam ve sıkı hiza vizyon değil zanaat standardıdır, öyle sunulmaz.

---

## 2. KABUK ANATOMİSİ — DÖRT BÖLGE

**KİLİTLİ** (CARD-DESK, BUTCE-UI-MIMARISI İ4 + CURRENT.md Korunan kararlar). Kabuk dört bölgeden oluşur ve yerleşimi hiçbir modülde değişmez:

| Bölge | İş |
|---|---|
| **Sol ray** (daralabilir) | Aktif modülün ekranlarına gezinme |
| **Üst bağlam** | Uygulama seviyesi + "neredeyim" bilgisi |
| **Orta masa** | Bütün ekranlar yalnız burada açılır |
| **Sağ referans** | Aktif ekranın kaynak/bağlam özeti |

**ENGİN KARARI (4 Ağustos):** Hiçbir ekran kendi yerleşimini kurmaz ve hiçbir modül kendi menü yapısını üretmez. Bugünkü alt navigasyon (Dashboard/Dönem/Rapor/Davet/Bütçe/Tanımlar) muhasebe ve bütçe yüzeylerinde tamamen kaldırılır.

---

## 2A. ADRES ŞEMASI VE DURAK GERÇEKLİĞİ (8-9 Ağustos 2026 KABUK Dilim 1/2 kararları — CURRENT.md Milestone günlüğünden taşındı 18 Ağustos 2026)

- **Adres şeması (Engin kararı):** ekran seçimi ADRESTEN okunur, bileşen state'inden değil. `/muhasebe/{bekleyen,donem,rapor,davet}` · `/butce` · `/butce/tanimlar` · `/saha/:key` · `/dept/bekleyen`. Rol ile adres uyuşmazsa kullanıcı kendi ilk durağına yönlendirilir. Tanımsız adreste "Adres bulunamadı" gösterilir — SESSİZ HATA YASAĞI: bilinmeyen adres boş ekrana ya da varsayılan ekrana düşmez. Tanımlar `/muhasebe/tanimlar`'dan `/butce/tanimlar`'a TAŞINDI (DefinitionsScreen bütçe tanımlarıdır), eski adres kaldırıldı. Uygulama: react-router-dom (kendi ince router'ımız tartışıldı, paket seçildi); SPA rewrite için vercel.json gerekir — yoksa canlıda sayfa yenilenince 404 döner (Dilim 1'de yaşandı).
- **BOŞ DURAK UYDURULMAZ (Engin kararı, ilke):** ray yalnız KODDA BUGÜN VAR OLAN durağı taşır. Hedef akışta Dashboard vardır ama kodda yoktur, bu yüzden raya konmaz ve ilk açılış ekranı BEKLEYEN'dir. Dashboard yazıldığı gün ilk ekran olur. Aynı ilkenin ikinci uygulaması: basınca hiçbir şey yapmayan kutu konmaz (12 Ağustos'ta boş bildirim zili kabuk dalından bu gerekçeyle kaldırıldı, classic/saha dalına dokunulmadı — bölüm 12.4).

## 3. SOL RAY

> REVİZYON (6 Ağustos 2026): bu bölümdeki "rayda rozet/sayaç yok" kararı değişmiştir; ray canlıdır, rozet ve renk taşır. Gerekçe ve tam kural bölüm 12.2'dedir.

**ENGİN KARARI (2 Ağustos, 4 Ağustos'ta pekişti):** Muhasebenin uygulama-seviyesi gezinmesi SOL RAYDIR. EKRAN-MUHASEBE bölüm 2'deki yedi sekmelik tab bar tarifi GEÇERSİZDİR. Sekme yalnız modül İÇİ ikinci kademe olarak kalır.

**Ray içeriği aktif modüle göre değişir, yerleşimi değişmez.**

**KİLİTLİ — Ray deseni:** iş durakları üstte · ayraç · **Tanımlar** altta. Bu desen §19'da bütçe için zaten mühürlüdür; muhasebe rayı da aynı deseni kullanır.

**KİLİTLİ — Tanımlar TEK duraktır.** Bölümleri (REFERANS, ŞİRKET TANIMI ve muhasebe tarafındaki Dönem Yönetimi / Departman / Kategori / Kullanıcı / Marka) ekranın İÇİNDE yaşar, raya dizilmez. Bu, "Tanımlar tek mi ayrı mı" açık sorusunu şöyle kapatır: **her modülün kendi Tanımlar durağı vardır, aynı desenle.** Yamdu'nun iki-katmanlı tanım bulgusuyla (RAKIP-ANALIZI-URUN 1.4) uyumludur. ŞİRKET TANIMI şirket-seviyesi veri olduğu için bütçe Tanımlar'ında kalır — §19 bozulmaz.

**Hedef ray içerikleri:**

| Muhasebe (6 satır) | Bütçe (5 satır) |
|---|---|
| Dashboard · Bekleyen · Şüpheli · Avanslar · Raporlar | Genel Bütçe · Bütçe Girişi · Raporlar · Gerçekleşen |
| — ayraç — | — ayraç — |
| Tanımlar | Tanımlar |

Bugünkü "Davet" ekranı hedefte **Kullanıcı** durağının içidir (EKRAN-MUHASEBE §15 zaten öyle tarif eder).

**ENGİN KARARI — REDDEDİLENLER:**
- **Kalıcı ikon şeridi (VS Code deseni) YOK.** 4 Ağustos'ta Opus önerdi, aynı oturumda GERİ ÇEKTİ: iki kapı için kalıcı ikon koridoru ihtiyaçtan önce kurulmuş mekanizmadır ve çizimi Yamdu'ya benzeten sebeplerden biriydi. Modül geçişi üst bağlamda tek sade öğedir; ikon şeridi ancak modül sayısı büyüyünce doğar (virtualization gibi, kapısı açık tutulur).
  - **NOT (ENGİN KARARI, 12 Ağustos 2026):** Bölüm 12.2'deki kapalı-ray ikon dönüşü bu reddi KAPSAMAZ. Reddedilen, ray AÇIKKEN yanında duran İKİNCİ, KALICI bir ikon koridoruydu. 12.2'de dönen yalnız rayın KAPALI hâlinin gösterimi — ray kapanınca duraklar tamamen kaybolmak yerine kendi ikonlarıyla görünüyor. Ret hâlâ yürürlüktedir.
- **Düz alt alta liste YOK.** Ray ferah yerleşir: nefes alan satır aralığı, tanınabilir işaretler.

**ENGİN KARARI — FERAHLIK YERLEŞİM İŞİDİR, KOZMETİK DEĞİLDİR.** G6 görsel kimlik turuna ertelenemez; kabuk kararlarının içindedir. Kuruluş gerekçesi bu: *"ekranda her an TEK kartın tablosu vardır"* (İ4/İ1), kart masasında kartlar sadedir, kart açılınca masayı kaplar. Masaya az şey gelir, bir anda bir iş yapılır.

---

## 4. MODÜL KAPILARI

**ENGİN KARARI (8 Ağustos 2026).** Faz 1'de kabuk **iki kapı** taşır: **Muhasebe** ve **Bütçe**. Satın Alma / Kart & Banka / Arşiv (mockup'ta örnek olarak var) Faz 1 listesinde yoktur — **boş kapı konmaz**. Mimari çok-modüle göre kurulur, içerik bugünkü gerçeğe göre doldurulur.

**Raporlar birinci seviyeye ÇIKMAZ:** kilitli yapıda modül-içidir (muhasebe §7, bütçe rayı ③). Modüller-üstü rapor merkezi ileride ihtiyaç doğarsa açılır.

---

## 5. ÜST BAĞLAM

**ENGİN KARARI (8 Ağustos 2026).** Üst bağlamın güncel iki-şerit yapısı (üst şerit + ince şerit) ve içerikleri bölüm 12.4'tedir; bu bölümdeki maddeler onun üzerine kuruludur.

**Proje bağlamı — KİLİTLİ giriş akışıyla birleşme (EKRAN-MUHASEBE §18, 2026-06-10):** İlk giriş proje seçim ekranından geçer (`can_create_projects` işaretli hesapta "Yeni proje aç" her zaman görünür; işaretsiz + üyeliksiz hesapta "Henüz bir projeye davet edilmediniz" + çıkış). Üst bağlamdaki seçici, içerideyken hızlı geçiş kapısıdır — akışın yerine geçmez.

**ENGİN KARARI (8 Ağustos 2026) — kural:** **Proje değişimi TAM BAĞLAM SIFIRLAMASIDIR.** Gerekçe: veri izolasyonu ve `fn_open_budget` tek projeye bağlıdır; Faz 1'de yumuşatılmaz. (Mockup'ta proje bir tablo KOLONUDUR — çok-projeli masa ima eder; bu bağlayıcı değildir ve kilitli akışa aykırıdır. Proje bağlam olduğu için ekran tablolarında kolon olarak tekrar etmez.) Projeler arası karşılaştırma raporlar modülünün konusudur, salt-okunur, Faz 1 kapsamında değildir. Şart: karşılaştırılan bütçelerin aynı katalogla kurulmuş olması; farklı kart yapısı/dönem geometrisi/tarife yılı karşılaştırmayı yanıltıcı kılar.

**PROJE MENÜSÜ — ENGİN KARARI (25 Ağustos 2026):** Üst bağlamdaki proje adı tıklanınca açılır menü verir; doğrudan projeden çıkarmaz. Menü içeriği: kullanıcının diğer AKTİF projeleri (tıklanınca o projeye geçilir), altında ayraç, en altta "Tüm projeler…" (proje seçim ekranına gider). Gerekçe: proje adının yanındaki üçgen menü vaat ediyordu ama çıkış yapıyordu; yanlışlıkla tıklayan kullanıcı projeye baştan girmek zorunda kalıyordu. Yukarıdaki iki kilit BOZULMADI — ilk giriş hâlâ seçim ekranından geçer ve proje değişimi hâlâ tam bağlam sıfırlamasıdır; menüden proje seçmek de adresi köke alıp iddiaları yeniden yazar. Emsal: Yamdu üst çubuktaki Projects menüsünde son kullanılanları, tümünü ve yeniyi verir (docs/RAKIP-ANALIZI-URUN.md, [A] seviyesi). Movie Magic 10 seçim ekranını korur ama dönüşü üç ayrı yerden verir. Kapısı olan da olmayan da kullanıcıyı kapana kısmaz.

**KÖK ADRES — KARAR (25 Ağustos 2026):** `/` adresi artık kullanıcının rolüne göre ilk durağına yönlendirir. Öncesinde `/` ne bir duraktı ne de tanınan adres listesindeydi; kökte kalan kullanıcı "Adres bulunamadı" ekranı görüyordu. Proje değişimi bu yönlendirmeye dayanır: eski projenin `?budgetId=` ve `?cardId=` değerleri yeni projeye taşınmasın diye adres önce köke alınır, sonra bağlam değişir.

**Dönem AYRIMI — ENGİN KARARI (8 Ağustos 2026):** İki ayrı şey vardır ve adları karıştırılmaz. **Dönem BAĞLAMI** ("şu an hangi dönemdeyim") üst bağlama aittir — İ4'ün bütçe seçicisini üst bağlama koyması gibi. **Dönem YÖNETİMİ** (aç/kapat/deadline, EKRAN-MUHASEBE §11) rayda bir ekrandır, yeri muhasebe modülü turunda kararlaşır (bkz. 12.1: dönem Tanımlar'a ait değildir). Ayrılmazsa ikisi tek ekrana sıkışır.

**ÇELİŞKİ DÜZELTMESİ GEREKÇESİ (8 Ağustos 2026):** Bu maddenin eski metni "Tanımlar içindedir" diyordu; bölüm 12.1 ise aynı dosyada "Dönem (hesap dönemi) ve departman Tanımlar'a AİT DEĞİLDİR" diyor. İki cümle birbirini yalanlıyordu. Baş/yönetim ayrımının kendisi (dönem bağlamı üst bağlamda, dönem yönetimi rayda bir ekran) doğru ve korunuyor; yalnız o ekranın Tanımlar'ın içi mi yoksa kendi durağı mı olacağı henüz kararlaşmadı, bu yüzden "yeri muhasebe modülü turunda kararlaşır" ifadesi kondu.

---

## 6. SAĞ REFERANS

**KİLİTLİ (EKRAN-MUHASEBE §19 son satırı):** CARD-DESK sağ referans paneli = kaynak dosyaların bağlamsal özeti. **Varsayılan kapalıdır.**

**ENGİN KARARI (8 Ağustos 2026) — disiplin:** Panel **aktif ekranın** bağlamıdır, global akış değildir. Mockup'taki "bekleyen onaylar / son işlemler" içeriği Dashboard'ı çoğaltır; panel ikinci bir dashboard olursa aynı bilgi iki yerde senkron tutulmak zorunda kalır. Faz 1 kapsamı: panel iskeleti + boşken kapalı başlama davranışı + yalnız bütçe masasının özeti (kart gerekçesi, katalog, mühür durumu). Muhasebe içerikleri ekran ekran sonra dolar.

**ENGİN KARARI (12 Ağustos 2026) — bu sprintte çizilmez:** Sağ referans dört bölgeden biri olarak KİLİTLİ kalır, yeri ayrılır; ama ilk gerçek sakini doğana kadar öğe konmaz. Emsal: arama ve bildirim (bkz. 12.4) — "basınca hiçbir şey yapmayan kutu konmaz" kuralı sağ referans için de geçerlidir.

**Gerekçe:** Bölge önce kilitlenmiş, içeriği sonra aranmıştır. 12.5'teki post-it'ler panelin SEBEBİ değil, boşluğunun ÇARESİYDİ. Panelin güçlü işi REFERANS'tır — muhasebede fişin kendisi ve bağlamı (`receipts.receipt_image_url` ve `invoice_file_url` şemada VAR ama reviewer ekranında çizilmiyor), bütçede kart gerekçesi + katalog. İlk sakin adayı budur; post-it'ler değil.

---

## 7. KAPSAM SINIRI — SAHA VE DEPT

**KİLİTLİ.** Bu kabuk **muhasebe + bütçe masaüstü yüzeyinin** kabuğudur.

- **Saha:** EKRAN-SAHA.md başında mühürlü — *"kart-merkezli çalışma masası mantığı saha'da UYGULANMAZ"*. FİŞ TARA diski + 4 sekmeli floating alt nav AYNEN KALIR. "Alt navigasyonu kaldır" talimatı sahayı KAPSAMAZ.
- **Dept:** bugünkü telefon-biçimli hâlinde kalır (6 sekme + alt bar). Kabuğa taşınması ayrı ve ileriki bir karardır.

Bu sınır sprint komutuna yazılmazsa uygulayıcı saha diskini söker.

---

## 8. GELECEK-KORUMA (sekme/Workbench yerine)

**ENGİN KARARI (8 Ağustos 2026).** Engin'in metni Workbench/Tab Manager için "ileride destekleyecek esneklikte kurulmalı" diyor. Opus itirazı: bu cümle bir uygulayıcıya verilirse **spekülatif altyapı** üretir (TabContext, keep-alive önbelleği, çoklu-kopya state). Gelecek-korumasının somut karşılığı üç maddedir ve biri zaten kilitli kuraldır:

1. **Ekranlar parametrelerini dışarıdan alır** (İ4 — zaten kilitli). **DÜZELTME (18 Ağustos 2026):** kodda 2/3 — viewMode prop olarak geçmiyor (6 Ağustos 2026 tespiti, CURRENT.md Bayat kayıtlar C grubu).
2. **Ekran durumu ekranın içinde veya adreste yaşar**, modül tekilinde değil.
3. **Her ekranın bir URL adresi vardır** (`/muhasebe/bekleyen`, `/butce/kalemler?kart=…`).

Bu üçü varsa Tab Manager yarın kabuğa eklenir, ekranlara dokunulmaz. Sprint tarifine "esneklik" cümlesi değil **bu üç madde** girer.

**Adres şeması sprintin görünmez ana işidir.** Engin'in metninde hiç geçmiyor; kabuk refactor'ı URL kararı olmadan yapılırsa geri tuşu, yenileme ve derin bağlantı çalışmaz.

**AÇIK — çoklu sekme günü geldiğinde:** aynı kalem tablosunun iki kopyası açıkken edit buffer'lar, realtime abonelikler ve KLV odağının kime ait olduğu ayrı bir tasarım oturumu ister. Bugünden "desteklenir" diye söz verilmez.

---

## 9. KART KAPAK RAKAMI — §19 REVİZYON ÖNERİSİ

> KARARA BAĞLANDI (6 Ağustos 2026): kartın yüzeyinde toplam bulunur; kart/katalog numarası görünmez. Ayrıntı bölüm 12.3'tedir. REVİZE (14 Ağustos 2026): kapakta TEK rakam durur, o da NET toplamdır — aşağıdaki karara bakınız.

**Bugünkü kilitli kural (§19, 12 Haziran 2026):** Kart masasında kartlar sadedir — *"işaret + isim; RAKAM YOK — rakam icmalin işi"*.

**Engin itirazı (4 Ağustos):** Her bütçe kartının üstünde özet rakam olmalı.

**Teşhis:** İki AYRI ihtiyaç var ve kilitli karar ikisini "ya hep ya hiç" diye karşı karşıya koymuş. **Çalışırken sükûnet** (kilitli kararın koruduğu) ve **bakarken yön bulma** (yapımcı masaya baktığında ağırlığı görmek ister: hangi kart büyük, para nerede). İkincisi icmale sürgün edilmiş — sık yapılan bir iş için fazladan bir yol.

**KARAR (14 Ağustos 2026, Engin):** Kapakta TEK rakam durur, o da NET toplamdır. Rakamın net olduğu kapakta BELİRTİLİR (nasıl belirtileceği çizim anında kararlaşır). Bölüm 9'un brüt önerisi düşmüştür.

**KAPI AÇIK:** Koşullar değişirse brüt ve/veya yasal yük kapağa eklenebilir. Bugün girmez.

**Kapsam dışı (bilinçli):** istatistik yok, progress bar yok, fark rengi yok, gerçekleşen yok. Gerekçe: fark ve gerçekleşen kartın üstüne çıkarsa masa rapora döner ve ferahlık ölür. O iş icmalin işidir. **Rakam kartta bilgidir; masada matematik yapılmaz.** Bir rakam sükûneti bozmaz, dört rakam bozar.

**AÇIK — çalışma/icmal modu:** masanın iki görünüm modu (sakin çalışma / rakamlı icmal) ileride açılabilir. Bugün kurulmaz; virtualization gibi kapısı açık tutulur.

**Mekanik:** Kabul edilirse EKRAN-MUHASEBE §19 Ekran 2 tarifi ve BUTCE-EKRAN-KARARLARI güncellenir. Kendiliğinden uygulanmaz.

---

## 10. İLK SPRİNT KAPSAMI

**ENGİN KARARI:** İlk aşamada YENİ EKRAN GELİŞTİRİLMEZ. Yapılacak:
- Mevcut alt navigasyon kaldırılır (muhasebe + bütçe yüzeylerinde; saha/dept hariç)
- Kabuk kurulur (dört bölge + ray + üst bağlam + sağ referans iskeleti)
- Bugün CANLI olan dört ekran kabuğa taşınır: Masa/Reviewer · Davet · Bütçe · Tanımlar
- Mevcut işlevsellik korunur, yeni özellik eklenmez

**DÜZELTME (18 Ağustos 2026):** bu satır 6 Ağustos 2026'da kodla tutmadığı tespit edilmiş, düzeltilmeden bekliyordu (CURRENT.md Bayat kayıtlar C grubu). Kaynak: kodda dört ekran canlı; Dönem ve Rapor EmptyState. DİLİM 2 sonrası durak dağılımı da değişti (muhasebe 4 durak + bütçe 2 durak, Tanımlar bütçeye taşındı) — bölüm 10'un durak tablosu bu tura göre YENİDEN OKUNMALIDIR, bu düzeltme yalnız ekran SAYISINI kapatır.

**ENGİN KARARI (8 Ağustos 2026) — sprint disiplini:** Ray **hedef yerleşimi** dokümanda tutar, **koda bugün var olanı** listeler. Aksi hâlde uygulayıcı henüz ayrışmamış duraklar (Şüpheli, Marka gibi) için boş ekran uydurur. Hangi durağın bugün ayrı ekranı olduğu, hangisinin sonra ayrışacağı sprint dokümanında tek tek eşlenir.

**Durak tablosu (8 Ağustos 2026, hedef/bugün ayrımının somut hâli):**

| Durak | Durum | Neye bağlı |
|---|---|---|
| Dashboard | [ABSENT] | dönem yönetimi + limitler (period_budgets/dept_budgets: şema var, kod yok) |
| Bekleyen | [ACTIVE] | reviewer-screen.tsx çalışıyor |
| — kısmi onay / pasif onay / tekrar giriş | [SCHEMA_ONLY] | şemada değer var, tetikleyen kod yok |
| Şüpheli | [ABSENT] | anomali motoru (IS-KURALLARI §13) — motor yok |
| Avanslar | [ABSENT] | avans şeması yok |
| Raporlar | [ABSENT] | dönem kapanışı + gerçekleşen verisi |
| Tanımlar | [PARTIAL] | definitions-screen.tsx var, içi az |

---

## 11. ADLANDIRMA

**ENGİN KARARI (8 Ağustos 2026).** Kod adları İngilizce: `AppShell`, `NavRail`, `TopBar`, `Workspace`, `ContextPanel`. Doküman dili mevcut Türkçe terimlerle devam eder: kabuk, sol ray, üst bağlam, çalışma masası / orta masa, sağ referans. Eşleme GLOSSARY.md'ye işlenir.

Ray içeriği koda gömülmez, bildirimsel bir tanımdan gelir — ileride Yamdu-vari kullanıcı düzenlemesine (RAKIP-ANALIZI-URUN 1.3) kapı açık kalır, bugün sabittir.

---

## 12. AYRINTI TURU KARARLARI (6 Ağustos 2026)

Bu bölüm 1-11 arasındaki ana hatların ayrıntısıdır. İki maddede önceki kararı DEĞİŞTİRİR; değişenler açıkça işaretlidir.

### 12.1 Ray içeriği
- OTORİTE NOTU: aşağıdaki iki ray listesi bölüm 3'teki tabloyla da gösterilir; ikisi BİRLİKTE güncellenir. (7 Ağustos 2026: bu eşleme yapılmadığı için bölüm 3 bir süre "Harcamalar" durağını taşımaya devam etmişti.)
- Muhasebe rayı: Dashboard · Bekleyen · Şüpheli · Avanslar · Raporlar — ayraç — Tanımlar
- "Harcamalar" durağı YOKTUR. Mockup'ta görünmesi hataydı; v8'de de yoktu.
- Kiralama Faz 2'dir, rayda yer almaz.
- Mesajlar rayda DEĞİL, üst şeritte sağdadır.
- Bütçe rayı: Genel Bütçe · Bütçe Girişi · Raporlar · Gerçekleşen — ayraç — Tanımlar
- TANIMLAR = MODÜLÜN KENDİ TANIMLARI. İki rayda birden görünmesinin sebebi budur: bütçe tanımları ile muhasebe tanımları ayrı şeylerdir, ortak bir "ayarlar" ekranı değildir. Her modülün Tanımlar içeriği kendi turunda kararlaşır. Dönem (hesap dönemi) ve departman Tanımlar'a AİT DEĞİLDİR — dönem muhasebenin, departman proje yapısının konusudur; yerleri ayrıca karara bağlanacaktır.

### 12.2 Sol ray — görünüm ve durum
- Zemin sıcak kâğıt tonundadır. Renkli klasör simgeleri raydan VE kartlardan kaldırılmıştır.
- Durum rengi TEK TONLUDUR: iş yoksa normal görünüm, iş varsa durak yumuşak kırmızı alır (koyu/kıpkırmızı değil). Rozette sayı görünür.
- REVİZYON — 4 Ağustos 2026 kararı DEĞİŞTİ. Eski karar: "Rayda rozet/sayaç YOK — rozet rayı iş kuyruğuna çevirir." Yeni karar: ray canlıdır, rozet ve renk taşır. Gerekçe: o karar bütçe masasının sükûneti ("rakam icmalin işidir") ilkesinden türetilmişti; muhasebe rayında iş yükünün görünmesi UX konusudur, bütçe ilkesiyle ilgisi yoktur. İki alan ayrılmıştır.
- SAYAÇ VAR OLANI DEĞİL BAKILMAMIŞI SAYAR. Sıfırlanabilir olmayan hiçbir şey sayılmaz. Aksi hâlde durak (örn. Avanslar) sürekli renkli kalır, renk anlamını yitirir. "Bakılmamış"ın tanımı her durağın kendi ekranı tasarlanırken yapılır.
- Sayaç taşıyanlar: iş/veri bekleyen duraklar + Tanımlar (oran/mevzuat değişikliği kaçmasın diye). Dashboard ve Raporlar sayaç TAŞIMAZ.
- Aktif durak KOYU MÜREKKEP TONUNDADIR: zemin rengi almaz, yazısı koyulaşır ve kalınlaşır, sol kenarında ince mürekkep çizgisi belirir. Kural: RENK = DURUM, KOYULUK = KONUM. Aktif durak yeşil değildir.
- Aktif durak kırmızısını BIRAKMAZ — bir durağa girmek oradaki işi bitirmez.
- Tazeleme: ekran açılışında ve durağa her girişte. Canlı/sürekli bağlantı YOK.
- Tanımlar rayın en dibindedir, ayraçtan sonra.
- REVİZYON (ENGİN KARARI, 12 Ağustos 2026) — Daraltma düğmesi RAYIN DEĞİL, KABUĞUN öğesidir. Eski madde "Daraltma düğmesi rayın ÜSTÜNDEDİR" diyordu; doğrusu ray sütununun SAĞ ÜST köşesidir — rayın masayla birleştiği kenarın en üstü. Ray kapanınca düğme AYNI EKRAN NOKTASINDA kalır (kapalı sütunun sağ üst köşesi), zıplamaz. Durum localStorage'da hatırlanır (emsal: `shared/theme.ts`'teki `useTheme` deseni).
- KARAR DÖNÜŞÜ (ENGİN KARARI, 12 Ağustos 2026) — kapalı rayda duraklar İKONLA görünür ve tıklanabilir kalır. Bu maddenin eski hâlindeki "kısmi daralma yok, simge olmadığı için daralmış rayın gösterecek şeyi yoktur" gerekçesi DÜŞMÜŞTÜR — simge yapıldı. Gerekçe: canlı kullanımda bomboş bir kapalı ray kullanılamıyor. (Bu dönüş bölüm 3'ün "kalıcı ikon şeridi YOK" kararını KAPSAMAZ — bkz. bölüm 3 notu.)
- İKON DİLİ (ENGİN KARARI, 12 Ağustos 2026): hepsi KÂĞITTIR — çizgili föy (içine yazılan form, Bütçe Girişi), sekmeli kart destesi (tanım/katalog, Tanımlar), ayağında kalın toplam çizgisi olan föy (Genel Bütçe), yırtık kenarlı fiş (Gerçekleşen), köşesi kıvrık föy (Raporlar). Tek renk, `currentColor`, elle yazılmış SVG; ikon kütüphanesi kurulmaz (emsal: `app-header.tsx` BellIcon). Tanımlar'da DİŞLİ KULLANILMAZ — dişli marka ayarlarınındır. Yeni durak eklendiğinde sorulacak soru: o durakta hangi kâğıt var.
- Ray seyrek durur, satırlar nefes alır. Duraklar/çerçeve/kartlar çevresinde çok hafif gölge.
- Rayın tepesinde modül adı KALIR — rayın başlığıdır, üstteki modül anahtarının tekrarı değildir.
- Puanlama motoru (yaş × tutar × tip) SONRAKİ DÖNEMLERİN İŞİDİR. Bugün kurulmaz: kalibre edecek gerçek veri yoktur ve adet ≠ önem olduğu için adede göre boyanan çok tonlu skala kullanıcıyı yanlış durağa çağırır. Ray dışarıdan durak başına SAYI + AĞIRLIK alır; bugün ağırlık ikilidir (0 / işaretli), motor gelince aynı yerden gerçek puan gelir ve kabuk değişmez.
- OTOMATİK DARALMA — KARARA BAĞLANDI, UYGULAMA ERTELENDİ (Engin kararı, 14 Ağustos 2026). Davranış: kart tablosuna girildiğinde ray AÇIK gelir · tablodaki bir hücreye tıklanınca ray KAPANIR · karttan çıkınca ray GERİ AÇILIR · elle açma istisnası YOKTUR (kullanıcı rayı elle açsa bile sonraki hücre tıklaması yine kapatır). Amaç: gezinirken ray durur, çalışırken çekilir; kart tablosuna 100px kazandırır (ray 168 → 68). İstisna neden yok: "kullanıcı kart tablosunda rayı neden açık tutmak istesin" sorusuna somut bir kullanım bulunamadı — bütçe rayının iki durağı da "başka yere git" demek, kalem girerken kimse başka yere gitmiyor, kapalı rayda ikonlar zaten tıklanabilir. İhtiyaç doğarsa istisna o zaman eklenir (ihtiyaçtan önce mekanizma kurulmaz). Tıklamada tablonun 100px sola kayması tek seferliktir ve tıklama gerçekleştikten SONRA olur; yanlış hücreye düşme riski yoktur (bu itiraz oturum içinde kuruldu ve Engin tarafından çürütüldü). ERTELEME GEREKÇESİ (Engin kararı, aynı gün): aynı oturumda yapılan kolon takası "Net toplam görünsün" ihtiyacını zaten karşıladı (ray açıkken bile görünüyor), otomatik daralmanın kalan kazancı Yasal Yük'ün de görünmesi — ikincil. Buna karşılık maliyet büyüdü, bkz. aşağıdaki not. **UYGULAMA NOTU — TURUN ÇÖZMESİ GEREKEN:** `src/shared/rail-state.ts` bugün `useState` ile kuruluyor, paylaşılan bir bağlam DEĞİL; her çağıran kendi state'ini alır. Bugün tek çağıran var (`app-shell.tsx`), sorun çıkmıyor. Kart tablosu ikinci çağıran olursa kendi ayrı state'ini alır, `setCollapsed` kabuktaki rayı KIPIRDATMAZ — hata vermez, test kırmazi, özellik sessizce çalışmaz. Ayrıca ray durumu localStorage'a KALICI kullanıcı tercihi olarak yazılıyor; otomatik daralma bu tercihi ezip yazmamalı, oturumluk durum ile kalıcı tercih AYRILMALIDIR. Tur bu iki şeyi çözmeden davranışı yazmaya kalkarsa çalışmaz. (Bu not TECH-DEBT'e ayrı borç olarak AÇILMADI — Engin kararı: tuzak yalnız bu tur açıldığında tetikleniyor ve tur bu dosyayı zaten baştan yazacak.)

- **AÇIK, KARARA BAĞLANMADI — İŞARET DİLİNİN KART YARISI:** rayın ikon dili karara bağlandı (hepsi kâğıttır). Kartın işareti ise açık: kart içeriğine uygun işaret bir nesne dili olur ve bu, rayın kâğıt ailesinden AYRI bir ailedir. İki ailenin bir arada nasıl duracağı konuşulmadı.

### 12.3 Kart masası
- Masa TEK AKIŞTIR. Etap/dönem başlığı YOKTUR — kartlar dönemle dizilmez; dönem kalem seviyesinde yaşar.
- Kart kapağında: işaret + kart adı + tek rakam (net toplam). Kart veya katalog NUMARASI hiçbir yerde görünmez (BUTCE-SEMA-KARARLARI ve BUTCE-EKRAN-KARARLARI'ndaki kayıtlı kural aynen geçerlidir).
- REVİZYON — bölüm 9 (K2) karara bağlandı: kartın yüzeyinde toplam BULUNUR. Böylece EKRAN-MUHASEBE §19'daki "işaret + isim; RAKAM YOK" ifadesi kart kapağı için geçersizdir. Kaç rakam duracağı 14 Ağustos 2026'da karara bağlanmıştır: tek rakam, net.
- Karta tıklanınca kart masayı kaplar. Dönüş iki yoldan: üst ince şeritteki "‹ Kart adı" ve sol raydaki durak. Esc BAĞLANMAZ (Esc hücrede eski değeri geri getirir, KLV).
- Kartlar ilk açılışta kod sırasında gelir; kullanıcı istediği kartı istediği yere taşıyabilir. Diziliş KİŞİYE ÖZELDİR — davetli kendi görebildiği kartları kendi düzeninde görür, başkasının masasını etkilemez.
- Masadaki diziliş GENEL BÜTÇE'Yİ ETKİLEMEZ. İcmal sırası sabittir ve kod sırasındadır; ATL/BTL ayrımı kod prefiksinde yaşadığı için icmalin sabit sırası o ayrımı korur. Masa çalışma alanıdır, sunum yüzeyi değildir.
- Sonradan eklenen kart EN SONA düşer.
- "İlk düzene dön" düğmesi masanın üst sağındadır ve YALNIZ masa taşınmışsa görünür. (İsim geçici.)
- MÜHÜR MASANIN DİZİLİŞİNİ DONDURMAZ. Mühür bütçeyi dondurur; kimin kartı nerede duruyor sunumun parçası değildir.
- Kart sayısı artınca kart küçülmez; masa aşağı uzar ve kaydırılır.
- Kart ekleme: masanın EN SONUNDA, diğer kartlarla AYNI biçimde duran bir ekleme kartı. Basınca ortada seçim odası açılır (kalem eklemedeki düzenin aynısı), katalogdan masada olmayan kartlar listelenir, seçilen kart masada doğar. SERBEST (katalog dışı, kullanıcının adlandırdığı) KART FAZ 1'DE YOKTUR. Serbest KART değerlendirmesi tüm kartlar ve kalemler hazırlandıktan sonra yapılacaktır. Serbest KALEM bu kapsamda DEĞİLDİR — D3c ile yapıldı ve canlıdır (1 Ağustos 2026). Ekleme kartı, işlem gerçekten çalışır olmadan çizilmez.
- Bütçe sonu yüzdeleri şeridi (Öngörülmeyen %, Şirket Kârı %) masada DEĞİL, Genel Bütçe icmalindedir.

**MASA — KARARLAR (14 Ağustos 2026, Engin)**
- Masa TEK AKIŞTIR; etap/dönem başlığı YOKTUR. (Teyit.)
- Diziliş IZGARA'dır. Sabit değildir: kartlar çek-bırak ile taşınır. Diziliş KİŞİYE ÖZELDİR.
- Şablonun BÜTÜN kartları masaya serilir; çekirdek alt küme DEĞİL. Gerekçe: daha önce bütçe hazırlamamış kullanıcı neye ihtiyacı olduğunu bilmez, keşif sükûnetin önüne geçer. Bu, "masaya az şey gelir" ilkesiyle BİLİNÇLİ bir gerilimdir ve keşif lehine çözülmüştür.
- Kapak öğeleri: İŞARET + KART ADI + TEK RAKAM (net). Başka öğe yoktur.
- İşaret KART BAŞINADIR ve o kartın içeriğine uygundur.
- TEK HESAP İKİ YÜZEY: Kapaktaki net, kart açılınca toplam şeridinde görünen netin AYNISIDIR. İkinci bir tanım yoktur. (Çapraz: BUTCE-EKRAN-KARARLARI bölüm 18.)
- KAPAK RAKAMININ HESABI (ENGİN KARARI, 15 Ağustos 2026): net = birim net x miktar x X. Kalem kalem hesaplanır, kartına göre toplanır. BORDRO MOTORU ÇAĞRILMAZ. Gerekçe kaynakta doğrulandı: motorun net çıktısı da aynı çarpıma iner (resolvePayrollMonth net olarak hedef netin yuvarlanmış halini döndürür); motorun gün/ay iskeleti ve iteratif brüt çözümü YALNIZ YASAL YÜK için gereklidir. Yasal yük ve brüt kapağa girmediği için o maliyet de girmez. Kod: budget-service.kartNetToplamlari (hesap netToplamDonemli üzerinden gider, ikinci tanım yok) + fetchCardNetTotals (iki sorgu: kalemler + dönemler, kart başına sorgu YOK).
- MASA CANLI (15 Ağustos 2026, commit db8d5bd): /butce adresi cardId taşımıyorsa masa, taşıyorsa o kart açılır. cardId expense_groups.id (UUID) olduğu için kart NUMARASI adres çubuğuna da düşmez. Kartlar card_code sırasında gelir. Kod: app/muhasebe/budget/card-desk-screen.tsx + auth/authenticated-shell.tsx.
- BU TURDA ÇİZİLMEYENLER (Engin kararı, 15 Ağustos 2026): işaret, kişiye özel diziliş (çek-bırak + ilk düzene dön), icmal seçimi / soluk kart. Üçünün de kararı yukarıda aynen geçerlidir; üçü de veri ister ve o veri bugün yoktur. Yazılacakları gün buradan devam edilir.
- Karttan masaya dönüşün İKİNCİ yolu (ince şeritte "‹ Kart adı") bu turda YAPILMADI; ray ile dönüş çalışıyor. Ayrı turda ele alınacak — app-shell.tsx ve app-header.tsx dosyalarına dokunur.
- EKLEME KARTI — Faz 1 kapsamı: Yalnız BAŞKA ŞABLONLARDA bulunan kartı bu masaya çağırır. Serbest (katalog dışı, kullanıcının adlandırdığı) kart Faz 1'de YOKTUR; mevcut koşul aynen geçerlidir: "tüm kartlar ve kalemler hazırlandıktan sonra". Faz numarası VERİLMEZ, koşul geçerlidir.
- SİLME: Kullanıcının masaya eklediği kartlar silinebilir. Şablondan doğan kart silinmez.
- İCMAL SEÇİMİ: Kullanıcı hangi kartın icmale gireceğini belirler. İşaretsiz kart KAPSAM DIŞIDIR — parası genel toplama GİRMEZ.
- KONTROL İCMALDE, İZ MASADA: İşaretleme Genel Bütçe icmalinde yapılır. Kapsam dışı kart masada soluk/işaretli görünür; kapağı yalan söylemez. Emsal: BUTCE-EKRAN-KARARLARI bölüm 18'in "süzülmüş toplamı açıkça söyle" şartı.
- İKİ EKSEN KARIŞMAZ: İcmal seçimi = KAPSAM (toplama girer mi). Silme = VARLIK (masada durur mu). Ayrı şeylerdir, birbirinin yerine geçmez.
- Masa, sol raydaki "Bütçe Girişi" durağının İÇİDİR. Rayda ayrı "kart masası" durağı yoktur.

**ÇELİŞKİ KAPANIŞI (14 Ağustos 2026, Engin):** EKRAN-MUHASEBE bölüm 19 Ekran 2 ile üç çelişki KABUK lehine kapatılmıştır — tek akış, ekleme kartının yeri, bütçe sonu yüzdelerinin icmalde olması. EKRAN-MUHASEBE bu turda düzeltilmiştir.

- **AÇIK, KARARA BAĞLANMADI — KAPAK RAKAMININ KAYNAĞI:** kapakta duran net toplamın hangi yoldan doğacağı mimari çataldır. Bugün iki sorguyla türetiliyor ve bordro motoru çağrılmıyor (15 Ağustos 2026, db8d5bd); motoru çağıran yol ile çağırmayan yol arasındaki fark karara bağlanmadı.
- **AÇIK, KARARA BAĞLANMADI — KART ADININ DEĞİŞTİRİLMESİ:** kart adı bugün salt-okunurdur. Sonradan değiştirilebilmesi hiç konuşulmadı.

### 12.4 Üst bağlam
- KABUK HER MODÜLDE BİREBİR AYNIDIR. Modüle göre değişen yalnız iki şeydir: rayın durakları ve ince şeridin içeriği. Bölge sırası, yükseklik ve yerleşim değişmez; modül geçişinde ekran zıplamaz.
- Üst şerit sırası: modül anahtarı · proje · (boşluk) · arama · bildirim · mesajlar · kullanıcı. Arama ve bildirimin YERİ AYRILMIŞTIR, öğe henüz ÇİZİLMEZ — basınca hiçbir şey yapmayan kutu konmaz; geldikleri gün kendi yerlerine oturur ve kabuk yeniden düzenlenmez.
- İKİ ARAMA İKİ AYRI İŞTİR ve asla aynı yerde durmaz: kabuk araması (uygulamada bir şey bul) üst şerittedir; liste süzme (şu anki listeyi filtrele) ekrana aittir ve her ekranda AYNI YERDE, tablonun üstünde solda durur.
- İnce şerit KALIR (tek filmde bütçe tarafında bugün boş görünse de) — ileriye altyapı, modüller arası geçişte zıplama olmaması için.
- İnce şeritte yol yazısı ("Bütçe / Bütçe Girişi") YOKTUR: sol ray zaten konumu gösterir ve aynı kelime üç kez tekrarlanır.
- SÜRÜM PİLİ YOKTUR. Kartlar mühürlenmez, kartın sürümü olmaz; sürüm ve mühür Genel Bütçe'nin kavramıdır. Mühürlü bütçenin tam listesi zaten salt-okunur görünür, kart masasını çağırmak anlamsızdır. (İcmalde bölüm başlığına tıklanınca o bölümün kart görünümünün ayrı blok olarak açılması ayrı bir konudur, icmal turunda ele alınır.)
- REVİZYON (ENGİN KARARI, 12 Ağustos 2026) — "Bölüm" pili İNCE ŞERİDE AİT DEĞİLDİR, ekranın içindedir. Eski konum ima eden madde ("Bölüm" pili YALNIZ dizide görünür; tek film ve reklamda hiç yoktur) yanıltıcıydı. V-SEKMELERİ de aynı şekilde ekranın içindedir: icmaller yan yana dizilir, sekmeler onların ÜSTÜNDE durur. Tam yerleşim sırası geldiğinde kararlaşacak.
- Muhasebe tarafında ince şeritte dönem seçici bulunur. Kapalı bir döneme geçildiğinde şerit bunu AÇIKÇA söyler (yanlışlıkla kapalı döneme kayıt girilmemesi için). Kapalı döneme erişim istisnadır: late_entry / reopen izinleri, süreli ve gerekçelidir (IS-KURALLARI).
- DÜŞTÜ (ENGİN KARARI, 12 Ağustos 2026) — KAYDETME DURUMU maddesi kaldırıldı. Eski madde şöyleydi: *"İnce şeridin sağ ucunda küçük, gri, sessiz bir yazı — yazarken 'kaydediliyor', olunca 'kaydedildi HH:MM' (öylece kalır), olmazsa 'kaydedilemedi' kırmızı ve kalıcı."* Gerekçe: KAAPA belge değil DEFTER modelidir; her hücre kendi işlemidir, kaydedilmemiş bir bütçe hâli oluşmaz. Hata zaten yüksek sesle bildiriliyor (değer eski hâline döner + "Kaydedilemedi" uyarısı), dolayısıyla sessizlik zaten kaydedildi demektir. Ayrıca kalıcı bir "kaydedildi" yazısı bütçedeki TEK gerçek kayıt anını — icmalin mühürlenmesini — gölgeler.
- YÜKLEME MASANIN İÇİNDE olur; kabuk (ray, şeritler) asla kaybolmaz. Her ekran kendi yükleme biçimini icat etmez.
- SONUÇ (12 Ağustos 2026): yukarıdaki iki düzeltmeyle ince şeridin bilinen sakinleri şunlara iner: **"‹ Kart adı"** (bütçe, kart masayı kaplayınca) ve **dönem seçici** (muhasebe). Şerit bugün boş kalır, ileriye altyapı olarak durur.

### 12.5 Sağ referans paneli
> ERTELENDİ (ENGİN KARARI, 12 Ağustos 2026): panelin kendisi bu sprintte çizilmiyor (bkz. bölüm 6). Aşağıdaki üç post-it kararı DÜŞMEDİ, ertelendi — panel gerçekten kurulduğunda buradan devam edilir. Ek not: genel not ve kişisel not kendi ŞEMASINI ister — bugün bütçe seviyesinde ayrı bir not tablosu YOKTUR, bugünkü notlar `budget_items.internal_note` / `public_note`, yani KALEM seviyesindedir. Bu notların bütçe mühürlenince donup donmayacağı da karara bağlanmamıştır.

- Panelde ÜÇ POST-İT ALANI vardır: (1) kişisel not — yalnız sahibinin gördüğü karalama alanı; (2) genel not — bütçeye ait, yazanı ve zamanı taşır, davetliler görür; (3) üçüncü alan — görevi HENÜZ ATANMAMIŞTIR, yeri ayrılmıştır.
- Sayı SABİT ÜÇTÜR. Dördüncü kutu ihtiyacı doğarsa panel tasarımı yeniden açılır; ekran kendi kendine kutu eklemez.
- İçeriği olmayan kutu boş çerçeve olarak çizilmez. Üçü de boşsa panel zaten kapalıdır.
- PANEL İŞ YAPTIRMAZ AMA NOT TUTAR: içine düğme, form, onaylanacak öğe girmez; yazı yazılan kâğıt girer. Panel ikinci bir çalışma alanına dönmez.
- Varsayılan kapalıdır, kulakçıkla açılır. Açılınca MASA DARALIR — panel masanın üstüne binmez, çünkü panelin işi karta bakarken yanında durmaktır.
- Mockup'taki MÜHÜR kutusu düşmüştür (bkz. 12.4).

## 13. AÇIK KALANLAR

- Tanımlar'ın modül modül içeriği (bütçe tanımları / muhasebe tanımları ayrı ayrı)
- Dönem yönetiminin yeri (hesap dönemi — muhasebeye ait, Tanımlar'a değil)
- Departman, kategori, kullanıcı yönetimi ve bütçe limitlerinin yeri
- Marka/şirket ayarlarının yeri (v8'de üst seviyede ayrı pencereydi)
- "Gerçekleşen" ekranının hangi modülde yaşayacağı (muhasebe ile bütçe aynı veriye iki dilden bakıyor)
- Kart açıkken kabuğun davranışı (ray, panel, klavyeyle kesintisiz yazma)
- Boş masa / ilk giriş durumları
- Modüller arası geçişte masa neyi hatırlar (Bütçe'den Muhasebe'ye geçip dönünce aynı kartta mı)
- Ray kapalıyken yeni iş doğduğunda haberin nasıl ulaşacağı
- Rayın duraklarının yetkiye göre değişip değişmeyeceği (davetli yalnız görebildiği durakları mı görür)
- Yapım dönemleri listesi (Geliştirme · Ön Hazırlık · Çekim · Post Prodüksiyon · Dağıtım ve Yayın + Finansman + Kapanış/Tasfiye) — ayrı etapta ele alınacak
- Renk paleti ve tonların kendisi (G6)
- Toplu onay telefonda mı (rakip deseni: tablette toplu, telefonda teker teker) — karara bağlanmadı.

## 14. MOBİL DAVRANIŞ

**ENGİN KARARI (8 Ağustos 2026).**

- TEK KABUK. Ray telefonda gizlenir, bir düğmeyle kayarak açılır. Dept, muhasebe ve bütçe için aynı. Gerekçe: kaplanacak alan sorunu ekran değişince değişmez.
- SAHA İSTİSNADIR: saha tasarımında ALT ŞERİT korunur, ray YOKTUR. (bottom-nav.tsx saha için KALIR; bölüm 2'nin alt-navigasyon kaldırma kararı muhasebe ve bütçe yüzeylerine aittir.)
- Telefonda YAZILIR: fiş girişi (saha) · onay/red/düzeltme iste (dept, muhasebe) · yapımcı onayı · rapor süzme/filtre (kayıt değil sorgu).
- Telefonda YALNIZ OKUNUR: bütçe kalem tablosu · Tanımlar · dönem kapatma.
- Telefonda TAM ÇALIŞIR: Dashboard · Raporlar · Genel Bütçe icmali · kart kapakları.
- Bütçe kalem tablosu notu: telefonda AÇILIR ve okunur, düzenlenmez. Dar ekranda kolon azaltma + satıra dokununca alttan tam döküm (mevcut bottom-sheet deseni) BÜTÇE EKRAN TURUNUN işidir, kabuk sprintinin değil. "Şimdilik" — telefonda işlem yapmanın yolu ileride ayrı tasarım turunda aranır, kapı kapalı değildir.
- KLV DÜZELTMESİ: KLV klavyeyi ZORUNLU kılmaz. Mouse hiç kaldırılmadı; dokunmatik ekranda parmak mouse'un yerine geçer. Telefon kısıtının gerekçesi klavye yokluğu DEĞİL, dar ekranda yanlış hücreye dokunup kalıcı kaydı bozma riskidir.
- Kabuk sprintinin ihtiyacı: ekranın "telefonda salt-okunur" bayrağını taşıyabilmesi.

RAKİP EMSALİ: mobil desen bulguları için bkz. docs/RAKIP-ANALIZI-URUN.md bölüm 3 (Yamdu mobil turu: §1.15).

Yapımcı rolü: AUTH-KARARLARI SK-AUTH-11.

---

## Proje yaşam döngüsünün yeri (ENGİN KARARI, 22 Ağustos 2026)

**Proje BAĞLAMI** ("şu an hangi projedeyim") üst bağlama aittir. **Proje YÖNETİMİ** (aç / arşivle / raftan indir) proje seçim ekranında yaşar. Ayrılmazsa ikisi tek ekrana sıkışır — 8 Ağustos 2026 dönem kararının aynı kalıbı.

- "Yeni proje aç" zaten seçim ekranındaydı; bu karar hiçbir şeyi taşımaz, iki kardeşini yanına koyar.
- Arşivlenen proje aktif listeden düşer, ayrı bir Arşiv bölmesinde listelenir, içine girilemez.
- Raftan indirme her zaman listeden yapılır — rakiplerde istisnasız böyledir (Asana "arşivlenmişleri göster", Webvizio ayrı sekme, Kantata ayrı sütun); mantık zaten zorlar, arşivlediğin projenin içinde değilsindir.
- BEDELİ: bir projeyi arşivlemek için önce o projeden çıkmak gerekir. Asana içeriden arşivlemeye izin verir, KAAPA vermez. Karşılığında yaşam döngüsünün tek evi olur.
- Üst bağlamdaki proje seçici yalnız geçiş kapısıdır ve bu dilimin KAPSAMI DIŞINDADIR (`authenticated-shell.tsx` bugün `onSwitchProject={undefined}` yolluyor, öyle kalır).
