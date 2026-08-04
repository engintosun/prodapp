# KAAPA — KABUK KARARLARI

*Uygulama kabuğunun (Application Shell) TEK KAYNAĞI. Oluşturma: 4 Ağustos 2026, KABUK tasarım oturumu (Engin + Opus, doküman-only). Girdiler: Engin'in Application Shell metni + KAAPA çalışma masası mockup'ı + Yamdu rakip turu (RAKIP-ANALIZI-URUN) + kilitli ekran kararları (EKRAN-MUHASEBE §18/§19, BUTCE-UI-MIMARISI İ4).*

**Bu dosya mevcut ekran kararlarını DEĞİŞTİRMEZ.** EKRAN-MUHASEBE ve BUTCE-EKRAN-KARARLARI'nda tanımlı ekranlar aynen korunur; buradaki iş o ekranları ortak bir kabuğa yerleştirmek ve aralarındaki gezinmeyi kurmaktır. Tek istisna bölüm 9'dur (kart kapak rakamı) ve o bilinçli bir revizyon önerisidir.

**STATÜ OKUMASI:** Her maddenin başında durumu yazılıdır — `KİLİTLİ` (daha önce mühürlenmiş, burada yalnız tekrarlanıyor), `ENGİN ONAYINA SUNULU` (4 Ağustos oturumunda önerildi, kabul/itiraz ALINMADI), `ENGİN KARARI` (bu oturumda Engin söyledi), `AÇIK` (karara bağlanmadı).

---

## 1. TASARIM TEZİ

**ENGİN ONAYINA SUNULU (K1).** Tez tek cümle: **rakipler ekran yapıyor, KAAPA masa yapmalı.**

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

## 3. SOL RAY

**ENGİN KARARI (2 Ağustos, 4 Ağustos'ta pekişti):** Muhasebenin uygulama-seviyesi gezinmesi SOL RAYDIR. EKRAN-MUHASEBE bölüm 2'deki yedi sekmelik tab bar tarifi GEÇERSİZDİR. Sekme yalnız modül İÇİ ikinci kademe olarak kalır.

**Ray içeriği aktif modüle göre değişir, yerleşimi değişmez.**

**KİLİTLİ — Ray deseni:** iş durakları üstte · ayraç · **Tanımlar** altta. Bu desen §19'da bütçe için zaten mühürlüdür; muhasebe rayı da aynı deseni kullanır.

**KİLİTLİ — Tanımlar TEK duraktır.** Bölümleri (REFERANS, ŞİRKET TANIMI ve muhasebe tarafındaki Dönem Yönetimi / Departman / Kategori / Kullanıcı / Marka) ekranın İÇİNDE yaşar, raya dizilmez. Bu, "Tanımlar tek mi ayrı mı" açık sorusunu şöyle kapatır: **her modülün kendi Tanımlar durağı vardır, aynı desenle.** Yamdu'nun iki-katmanlı tanım bulgusuyla (RAKIP-ANALIZI-URUN 1.4) uyumludur. ŞİRKET TANIMI şirket-seviyesi veri olduğu için bütçe Tanımlar'ında kalır — §19 bozulmaz.

**Hedef ray içerikleri:**

| Muhasebe (7 satır) | Bütçe (5 satır) |
|---|---|
| Dashboard · Bekleyen · Şüpheli · Avanslar · Harcamalar · Raporlar | Genel Bütçe · Bütçe Girişi · Raporlar · Gerçekleşen |
| — ayraç — | — ayraç — |
| Tanımlar | Tanımlar |

Bugünkü "Davet" ekranı hedefte **Kullanıcı** durağının içidir (EKRAN-MUHASEBE §15 zaten öyle tarif eder).

**ENGİN KARARI — REDDEDİLENLER:**
- **Rayda rozet/sayaç YOK.** Gerekçe: rozet rayı iş kuyruğuna çevirir, bütün bekleyen işleri kalıcı olarak göz ucuna asar; "rakam icmalin işidir" ilkesine aykırıdır. (Mockup'ta rozet vardı, bağlayıcı değildir. Yamdu'da da yoktur.)
- **Kalıcı ikon şeridi (VS Code deseni) YOK.** 4 Ağustos'ta Opus önerdi, aynı oturumda GERİ ÇEKTİ: iki kapı için kalıcı ikon koridoru ihtiyaçtan önce kurulmuş mekanizmadır ve çizimi Yamdu'ya benzeten sebeplerden biriydi. Modül geçişi üst bağlamda tek sade öğedir; ikon şeridi ancak modül sayısı büyüyünce doğar (virtualization gibi, kapısı açık tutulur).
- **Düz alt alta liste YOK.** Ray ferah yerleşir: nefes alan satır aralığı, tanınabilir işaretler.

**ENGİN KARARI — FERAHLIK YERLEŞİM İŞİDİR, KOZMETİK DEĞİLDİR.** G6 görsel kimlik turuna ertelenemez; kabuk kararlarının içindedir. Kuruluş gerekçesi bu: *"ekranda her an TEK kartın tablosu vardır"* (İ4/İ1), kart masasında kartlar sadedir, kart açılınca masayı kaplar. Masaya az şey gelir, bir anda bir iş yapılır.

---

## 4. MODÜL KAPILARI

**ENGİN ONAYINA SUNULU.** Faz 1'de kabuk **iki kapı** taşır: **Muhasebe** ve **Bütçe**. Satın Alma / Kart & Banka / Arşiv (mockup'ta örnek olarak var) Faz 1 listesinde yoktur — **boş kapı konmaz**. Mimari çok-modüle göre kurulur, içerik bugünkü gerçeğe göre doldurulur.

**Raporlar birinci seviyeye ÇIKMAZ:** kilitli yapıda modül-içidir (muhasebe §7, bütçe rayı ③). Modüller-üstü rapor merkezi ileride ihtiyaç doğarsa açılır.

---

## 5. ÜST BAĞLAM

**ENGİN ONAYINA SUNULU.** Uygulama seviyesindeki öğeler burada yaşar: modül anahtarı · proje seçici · genel arama · bildirim · kullanıcı menüsü. Hiçbiri bir modüle ait değildir.

**Proje bağlamı — KİLİTLİ giriş akışıyla birleşme (EKRAN-MUHASEBE §18, 2026-06-10):** İlk giriş proje seçim ekranından geçer (`can_create_projects` işaretli hesapta "Yeni proje aç" her zaman görünür; işaretsiz + üyeliksiz hesapta "Henüz bir projeye davet edilmediniz" + çıkış). Üst bağlamdaki seçici, içerideyken hızlı geçiş kapısıdır — akışın yerine geçmez.

**ENGİN ONAYINA SUNULU — kural:** **Proje değişimi TAM BAĞLAM SIFIRLAMASIDIR.** Gerekçe: veri izolasyonu ve `fn_open_budget` tek projeye bağlıdır; Faz 1'de yumuşatılmaz. (Mockup'ta proje bir tablo KOLONUDUR — çok-projeli masa ima eder; bu bağlayıcı değildir ve kilitli akışa aykırıdır. Proje bağlam olduğu için ekran tablolarında kolon olarak tekrar etmez.)

**Dönem AYRIMI — ENGİN ONAYINA SUNULU:** İki ayrı şey vardır ve adları karıştırılmaz. **Dönem BAĞLAMI** ("şu an hangi dönemdeyim") üst bağlama aittir — İ4'ün bütçe seçicisini üst bağlama koyması gibi. **Dönem YÖNETİMİ** (aç/kapat/deadline, EKRAN-MUHASEBE §11) rayda bir ekrandır, Tanımlar içindedir. Ayrılmazsa ikisi tek ekrana sıkışır.

---

## 6. SAĞ REFERANS

**KİLİTLİ (EKRAN-MUHASEBE §19 son satırı):** CARD-DESK sağ referans paneli = kaynak dosyaların bağlamsal özeti. **Varsayılan kapalıdır.**

**ENGİN ONAYINA SUNULU — disiplin:** Panel **aktif ekranın** bağlamıdır, global akış değildir. Mockup'taki "bekleyen onaylar / son işlemler" içeriği Dashboard'ı çoğaltır; panel ikinci bir dashboard olursa aynı bilgi iki yerde senkron tutulmak zorunda kalır. Faz 1 kapsamı: panel iskeleti + boşken kapalı başlama davranışı + yalnız bütçe masasının özeti (kart gerekçesi, katalog, mühür durumu). Muhasebe içerikleri ekran ekran sonra dolar.

---

## 7. KAPSAM SINIRI — SAHA VE DEPT

**KİLİTLİ.** Bu kabuk **muhasebe + bütçe masaüstü yüzeyinin** kabuğudur.

- **Saha:** EKRAN-SAHA.md başında mühürlü — *"kart-merkezli çalışma masası mantığı saha'da UYGULANMAZ"*. FİŞ TARA diski + 4 sekmeli floating alt nav AYNEN KALIR. "Alt navigasyonu kaldır" talimatı sahayı KAPSAMAZ.
- **Dept:** bugünkü telefon-biçimli hâlinde kalır (6 sekme + alt bar). Kabuğa taşınması ayrı ve ileriki bir karardır.

Bu sınır sprint komutuna yazılmazsa uygulayıcı saha diskini söker.

---

## 8. GELECEK-KORUMA (sekme/Workbench yerine)

**ENGİN ONAYINA SUNULU.** Engin'in metni Workbench/Tab Manager için "ileride destekleyecek esneklikte kurulmalı" diyor. Opus itirazı: bu cümle bir uygulayıcıya verilirse **spekülatif altyapı** üretir (TabContext, keep-alive önbelleği, çoklu-kopya state). Gelecek-korumasının somut karşılığı üç maddedir ve biri zaten kilitli kuraldır:

1. **Ekranlar parametrelerini dışarıdan alır** (İ4 — zaten kilitli).
2. **Ekran durumu ekranın içinde veya adreste yaşar**, modül tekilinde değil.
3. **Her ekranın bir URL adresi vardır** (`/muhasebe/bekleyen`, `/butce/kalemler?kart=…`).

Bu üçü varsa Tab Manager yarın kabuğa eklenir, ekranlara dokunulmaz. Sprint tarifine "esneklik" cümlesi değil **bu üç madde** girer.

**Adres şeması sprintin görünmez ana işidir.** Engin'in metninde hiç geçmiyor; kabuk refactor'ı URL kararı olmadan yapılırsa geri tuşu, yenileme ve derin bağlantı çalışmaz.

**AÇIK — çoklu sekme günü geldiğinde:** aynı kalem tablosunun iki kopyası açıkken edit buffer'lar, realtime abonelikler ve KLV odağının kime ait olduğu ayrı bir tasarım oturumu ister. Bugünden "desteklenir" diye söz verilmez.

---

## 9. KART KAPAK RAKAMI — §19 REVİZYON ÖNERİSİ

**ENGİN ONAYINA SUNULU (K2).** Bu, mühürlü bir kararın bilinçli revizyonudur.

**Bugünkü kilitli kural (§19, 12 Haziran 2026):** Kart masasında kartlar sadedir — *"işaret + isim; RAKAM YOK — rakam icmalin işi"*.

**Engin itirazı (4 Ağustos):** Her bütçe kartının üstünde özet rakam olmalı.

**Teşhis:** İki AYRI ihtiyaç var ve kilitli karar ikisini "ya hep ya hiç" diye karşı karşıya koymuş. **Çalışırken sükûnet** (kilitli kararın koruduğu) ve **bakarken yön bulma** (yapımcı masaya baktığında ağırlığı görmek ister: hangi kart büyük, para nerede). İkincisi icmale sürgün edilmiş — sık yapılan bir iş için fazladan bir yol.

**Öneri — KAPAK RAKAMI:** Her kartın üstünde **tek, sessiz rakam**: brüt toplam, küçük, soluk, köşede. Klasör kapağına kurşun kalemle yazılmış toplam gibi. Sadece o.

**Kapsam dışı (bilinçli):** istatistik yok, progress bar yok, fark rengi yok, gerçekleşen yok. Gerekçe: fark ve gerçekleşen kartın üstüne çıkarsa masa rapora döner ve ferahlık ölür. O iş icmalin işidir. **Rakam kartta bilgidir; masada matematik yapılmaz.** Bir rakam sükûneti bozmaz, dört rakam bozar.

**AÇIK — çalışma/icmal modu:** masanın iki görünüm modu (sakin çalışma / rakamlı icmal) ileride açılabilir. Bugün kurulmaz; virtualization gibi kapısı açık tutulur.

**Mekanik:** Kabul edilirse EKRAN-MUHASEBE §19 Ekran 2 tarifi ve BUTCE-EKRAN-KARARLARI güncellenir. Kendiliğinden uygulanmaz.

---

## 10. İLK SPRİNT KAPSAMI

**ENGİN KARARI:** İlk aşamada YENİ EKRAN GELİŞTİRİLMEZ. Yapılacak:
- Mevcut alt navigasyon kaldırılır (muhasebe + bütçe yüzeylerinde; saha/dept hariç)
- Kabuk kurulur (dört bölge + ray + üst bağlam + sağ referans iskeleti)
- Bugün CANLI olan altı ekran kabuğa taşınır: Dashboard · Dönem · Rapor · Davet · Bütçe · Tanımlar
- Mevcut işlevsellik korunur, yeni özellik eklenmez

**ENGİN ONAYINA SUNULU — sprint disiplini:** Ray **hedef yerleşimi** dokümanda tutar, **koda bugün var olanı** listeler. Aksi hâlde uygulayıcı henüz ayrışmamış duraklar (Şüpheli, Marka gibi) için boş ekran uydurur. Hangi durağın bugün ayrı ekranı olduğu, hangisinin sonra ayrışacağı sprint dokümanında tek tek eşlenir.

---

## 11. ADLANDIRMA

**ENGİN ONAYINA SUNULU.** Kod adları İngilizce: `AppShell`, `NavRail`, `TopBar`, `Workspace`, `ContextPanel`. Doküman dili mevcut Türkçe terimlerle devam eder: kabuk, sol ray, üst bağlam, çalışma masası / orta masa, sağ referans. Eşleme GLOSSARY.md'ye işlenir.

Ray içeriği koda gömülmez, bildirimsel bir tanımdan gelir — ileride Yamdu-vari kullanıcı düzenlemesine (RAKIP-ANALIZI-URUN 1.3) kapı açık kalır, bugün sabittir.

---

## 12. AÇIK KALANLAR

- **K1 (tasarım tezi) ve K2 (kapak rakamı) Engin onayı bekliyor.** Kabul/itiraz alınmadı.
- **Bölüm 4/5/6/8/10/11'deki "ONAYA SUNULU" maddeler** 4 Ağustos oturumunda önerildi, madde madde onaylanmadı.
- **Boş masa / öğretme deseni:** Yamdu turunda bulgu olarak yazıldı (1.12), bizim boş durumlarımız YOK. İlk kez giren muhasebeci masada ne görür — tasarlanmadı.
- **Yoğunluk davranışı:** ferahlık beş satırla kolaydır; sekiz yüz fişle, kırk kartla zordur. Masa metaforu yoğunlukla ilk kez orada boğuşacak; yoğunluk davranışları tasarlanmadı.
- **Alt-navın kaynağı** (ortak layout mı, sayfa-bazlı mı) kod tarafında hâlâ incelenmedi — sprint keşfinin ilk adımı.
- **İki davet kapısının fiziksel yeri** (M1 yalnız yüzey aidiyetini mühürledi) — sol ray / üst bağlam / kart üstü / sağ panel seçimi bu turda yapılacaktı, YAPILMADI.
- **G6 görsel kimlik** (renk paleti, tipografi, işaret seti) ayrı tur.
- **TD-13 ve TD-10** fiili kapanışı bu milestone'a bağlı.
