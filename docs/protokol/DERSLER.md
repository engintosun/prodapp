# Süreç Dersleri — Tekrar Eden Kusur Sınıfları

Bu dosyanın tüketicisi Opus'tur. Açılışta OKUNUR (Engin kararı, 9 Eylül 2026; açılış okuma listesine girdi). Ayrıca yeni bir kusur çıktığında "bu sınıf daha önce oldu mu, kapıya bağlanabilir mi" diye bakılır.

Kayıt anlatı değil SINIFTIR: ne oldu değil, hangi tür hata kaç kez tekrarladı ve bugün onu ne tutuyor. Olayların hikâyesi git log'da ve kararın kendi ev dosyasında yaşar. Kuralı başka bir dosyada yaşayan ders burada tek satır kalır ve o dosyaya işaret eder. Engin'in birebir sözleri kısaltılmaz. Diyet: 14 Ekim 2026 (Engin onayı); silinen anlatılar git log'da, `c4b5152` sürümünde tam hâliyle duruyor.

## Kapıya bağlanmış sınıflar

**Sığ klon** — 10 kez (12 Ağustos – 24 Eylül 2026). Yapısal sebep: kural klonun içinde yaşıyordu, oysa klonlamak onu okumanın önkoşulu. Bugün üç yer tutuyor: commit anında `gate.sh`; açılışta açılış protokolünün 1. adımı; klonlama anında hafızadaki açılış satırı ("TAM klonla, `--depth` YASAK; klondan sonraki ilk komut `git rev-parse --is-shallow-repository`, `true` dönerse okuma başlamaz", Engin onayı 24 Eylül 2026).

**Test sayısı kaybı** — `npm test` sekiz test silindiğinde bile exit 0 dönüyordu. **Bugün `run-gates.sh` sayacı `.claude/test-count` ile karşılaştırıyor.**

**ASCII'ye düşmüş .md metni** — TD-32'nin kökü: prompt ASCII yazılmıştı; 22 Ağustos'ta üç kez daha. **Bugün `gate.sh` reddediyor.** Kapının kendi kusurları TD-38 ve TD-42'de.

**Tanımsız CSS token** — tarayıcı sessizce yoksayıyor, build ve eslint görmüyordu (TD-25, 18 Eylül 2026'da kapandı). **Bugün `gate.sh` stage'lenmiş dosyalarda reddediyor.**

**Kapı sırası** — kapılardan sonra tek karakter değişirse damga bayatlar ve commit reddedilir (5 Eylül 2026'da birkaç kez, doğru biçimde). Sıra ve test sayısı değişince ne yapılacağı `docs/protokol/PROMPT.md`'de.

**"Karar verildi" ile "karar uygulandı" ayrı şeylerdir** — 9 Eylül 2026'da beş vaka (AD YERLEŞİMİ, `derivedUnitNets`, temsilci sayısı kadar satır, SİLME KURALI, ajans ve menajer adı), 23 Eylül'de bir tekrar ("1600'ün uygulanmamış kararı yok" dendi, koda bakılınca altı çıktı). Ekranda kusur GİBİ görünmüyordu: satır bir değer gösteriyordu, yanlış olan hangi değerdi. **KAPI (9 Eylül 2026):** öksüz işlev denetimi (`scripts/orphan-check.mjs`, `run-gates.sh` içinde) `src/app/muhasebe/budget` altında hiç çağrılmayan dışa açık işlevi reddeder. Kapının yakalamadığı: çağrılan ama kararı eksik ya da yanlış uygulayan kod. KURAL: bir kartın kararlarına dokunulduğunda karar bloğu baştan okunur ve HER MADDE için kodda karşılık aranır; kısmi uygulama "uygulandı" sayılmaz; kodda karşılığı aranmadan "uygulandı" denmez. ÖBÜR YÜZÜ (10-11 Eylül 2026): bir kusuru "karar verildi ama uygulanmadı" diye teşhis etmek kararın HÂLÂ GEÇERLİ olduğunu varsayar; komisyon tabanı dökümünde karar üç turda zaten tersine dönmüştü, kaynağa dönülünce iş yapılacak değil düşürülecek çıktı. Teşhisten önce kararın bugün de geçerli olduğu sınanır. 15 Ekim 2026: 24 Eylül'ün Psikolog/Pedagog kaydı ("KART 1600'de doğmaz") gerekçesi yazılmamışken sınanmadan uygulandı; Engin'in sorusuyla açıldı.

## Kapısı olmayan sınıflar (açık)

### Kaynağı açmadan iddia kurmak

En sık tekrar eden aile. Ortak kök: iddia kaynağın kendisi yerine bir aramanın, bir özetin ya da hafızanın üstüne kuruluyor. Karşılığı CLAUDE.md'deki iki kuraldır ("çıktı mühürlemeden önce kaynağa dön", "yokluk iddiası da iddiadır"); kapısı yok.

- **Desenden bütünlük.** Grep bulur, "hepsi bu" diyemez. 17, 18, 22 ve 31 Ağustos 2026: bayatlık listesinden dört madde kaçtı; yerinde duran madde "düşürüldü" sanıldı; DROP TABLE satırları görülmedi; hücreleri SAYARAK atlayan iki dosya aramada çıkmadı ve dönem satırları bir hane kaydı; tırnak yüzünden bozuk desen yerinde duran cümleyi "silindi" gösterdi.
- **Desenden yokluk.** "Yok" ya da "karara bağlanmadı" iddiası arama sonucundan kuruluyor. 18 Ağustos'ta beş kez; 17 Eylül, 30 Eylül (iki), 8 Ekim, 13 Ekim ve 14 Ekim 2026'da tekrar. Türkçe büyük İ ve büyük harfli vurgular (DENENMEDİ, CHROME DOĞRULANDI) küçük harfli aramadan kaçıyor. 14 Ekim: PDF maddesinde Chrome doğrulamasının olmadığı küçük harfli aramayla söylendi, kayıt büyük harfle duruyordu; diyet promptu aynı bilgiyi ikinci kez ekletti. KURAL: Türkçe kelime büyük ve küçük biçimiyle ayrı aranır; yokluk arama sonucundan değil kaynağın kendisinden okunur (klasör listesi, tablonun tam sütun kümesi, maddenin tamamı). Engin (birebir, 13 Ekim 2026): "Eurimages bütçesini defalarca yükledim. şimdi sitesine girip bir şey buldum onu da ekledim önceki de bir yerlerde olmalı repoyu kontrol ettin mi? eurimages bütçesine dair pek çok konuşma yaptık, bütün kalemlerin durduğu excel dosyasına da aldın oradan"
- **Kısmi grep çıktısından "yok".** 5 Eylül 2026: bir import satırı görüldü, onu çizen düğme görülmedi; "kişi listesinin kapısı yok" dendi ve kapanış promptu bunun üstüne kuruldu. Sonnet kaynağa dönüp düğmeyi buldu. KURAL: grep çıktısı TAMAMEN okunur; kısmi eşleşme yokluk kanıtı değildir.
- **Ölçülmemiş sayı.** 22 Ağustos (tablo sayısı dört kez değişti; CLAUDE.md tavanı ölçülmeden kondu), 12 Eylül (onay ekranında 44 dendi, 41 çıktı), 19 Eylül (beş dosyalık örnekten "dört" dendi, on çıktı), 13 Ekim (beş dendi, altı çıktı). KURAL: sayı üretildiği kaynaktan sayılır; onay ekranındaki sayı onay ANINDA kaynaktan okunur; örnek sayımı bütünlük iddiası değildir.
- **Kaynak elinin altındayken sormak.** 5 Eylül 2026'da dört soru sorulmuştu, dördünün cevabı repodaydı; 30 Eylül'de repoda duran Master liste ve MMB hesap planı Engin'den istendi. KURAL: soru sormadan önce kaynak açılır; kaynakta yoksa sorulur.
- **Konuya göre değil klasöre göre arama.** 5 Eylül 2026'da üç kez karar, konu klasörünün dışındaki bir dosyadaydı. KURAL: INDEX.md §7.0 konuya göre taranır.
- **İşaret edilen kaynağı açmamak.** 4 Eylül 2026'da üç kez, 6 Ekim'de bir kez: açık dosya cevabı başka bir dosyaya ya da kolona gösteriyordu, o ikincisi açılmadan sonuç söylendi. KURAL: dosyanın kendi metni başka bir kaynağa işaret ediyorsa sonuç o kaynak açılmadan söylenmez; "muhtemelen böyledir" ile "açtım, böyle" aynı cümle değildir.
- **Yarım okunan dosya.** 19 Eylül 2026: arama kutusu okundu, listeyi çizen kısım okunmadı; panelin yanlış tarifi üstüne öneri kuruldu ve geri çekildi. KURAL: davranış iddiası dosyanın TAMAMI okunarak kurulur; okunan bölüm davranışın yalnız bir dalıdır.
- **Bir kez okunan kod, üç tur sonra ezberdir.** 15-16 Eylül 2026: oturum başında okunan silme bloğundan üç kesin ve yanlış iddia kuruldu; komut satırı çıktısındaki tırnaklı değer istemcinin aldığı veri sanıldı. KURAL: nedensel iddia kurulacaksa ilgili blok O TUR yeniden okunur; komut satırı çıktısı istemcinin verisi yerine geçmez; ekran kod okumasıyla çelişiyorsa okuma eksiktir.
- **"Kodda var" ile "canlıda var".** 22 ve 23 Eylül 2026: koddan okunan şey "canlıda" ve "ekranda" diye söylendi, ikisini de Engin ekranla yanlışladı. KURAL: koddan doğrulanan şey "kodda var" diye söylenir; "canlıda" ya da "ekranda" ancak canlı sorgu ya da ekran gözlemiyle söylenir; koddan kurulan ekran cümlesi kodun gösterdiği davranışla sınırlıdır.
- **Doğrulanmamış varsayım.** 19 Ağustos (CLAUDE.md'nin tersi varsayıldı), 22 Ağustos (bir bilgisayar adı kişi sanıldı ve plana madde oldu), 31 Ağustos (ekrandaki ölçü ölçülmeden yazıldı, 1 Eylül ölçümü dört piksel fark gösterdi), 17 Eylül 2026 (tarayıcı turu tarifi, sınanan dalın koşulu koddan okunmadan yazıldı). KURAL: tarayıcı turu tarifi sınanan dalın koşulu kaynaktan okunarak yazılır; ekrandaki metne ya da ölçüye dayanan iddia sandbox tetiğidir (CLAUDE.md).
- **Kapsamı yanlış soruyla ölçmek.** 19 Ağustos 2026: "bu işlevi kim çağırıyor" ölçüldü, "bu tipi kim sıfırdan kuruyor" ölçülmedi; dosya sayısı kapısı çaldı.

### Öneri ve tasarım

**Düzeltmeyi sistemi yazmadan önermek; ekrana öğe uydurmak.** 22 Eylül 2026'da kullanıcı başlığı için üç öneri elendi, çözümü Engin buldu; 23 Eylül'de iki tekrar (özellik tek karta sıkıştırıldı; mühür mesajı olmayan bir adımı söyleyecekti); 30 Eylül'de bütün kartlara önerilen bir kural yan etkileri görülünce geri çekildi. KURAL: öneriden önce kararlaşmış akış yazılır ve var olan kapılar sayılır; yeni öğe ancak var olanların hiçbiri işi taşıyamıyorsa önerilir (`docs/butce/BUTCE-EKRAN-KARARLARI.md` §0 KALABALIK MASA İLKESİ). Bir özellik aksi kararlaştırılmadıkça bütün kartlarda aynıdır; kartın özel durumu önce çizimde çözülür. Kullanıcıya gösterilecek metin modelin ev dosyasından okunur. Yapı önerisinden önce kaynağın yapısı okunur. Engin bunu her oturumda yeniden anlatmak istemiyor.

**Gerekçeyi parayı organize edenden kurmak.** 15 Ekim 2026: KART 2100 turunda iş sağlığı ve güvenliği ile yapım ofisi "yapım ekibi kurar ve yönetir" gerekçesiyle 2100'e önerildi; Engin düzeltti. Kural ve Engin'in sözü: `docs/butce/KART-KATALOGU.md` §2, ORGANİZE EDEN SAHİPLENMEZ.

**Tasarımın normal hâlini arıza sanmak.** 19 Eylül 2026: Başlıksız bloğuna düşen mesai "delik" diye raporlandı ve koruma önerildi; koruma kabul edilseydi çalışan bir hâl hataya çevrilecekti. KURAL: kusur bildirmeden önce o hâlin sistemde zaten bir ADI ve YERİ olup olmadığına bakılır.

**Kaygı, çözüm talebi değil kararı sorgulama çağrısıdır.** 23 Eylül 2026: Engin'in kaygısına doğrudan çözüm önerildi; analiz edilince kararın dayanağının 11 Eylül'de kalktığı çıktı. KURAL: kullanıcı bir davranıştan kaygı duyduğunda önce o davranışı doğuran kararın gerekçesi kaynaktan okunur ve bugün geçerli olup olmadığı sınanır; öneri bu analizden sonra gelir.

**Çözüm, kararın reddettiği yolda duruyor olabilir.** 12 Eylül 2026: cinsin nereye saklanacağı üç tur arandı, üçü reddedildi; doğru cevap 22 Ağustos kararının kendi reddettiği yoldu ve onu Engin söyledi. KURAL: bir karar bir kusurun kök sebebi çıkarsa ilk bakılacak yer o kararın reddettiği alternatiftir.

**Kayıtlı açık soru da bir iddiadır.** 12 Eylül 2026: dosyadaki bir açık soru Engin'e aynen aktarıldı; oysa cevabı ne olursa olsun kusur duruyordu. KURAL: dosyadaki açık soru aktarılmadan önce "bu sorunun cevabı neyi değiştirir" diye sınanır; açık soru da bir uygulama tahmini olabilir.

**Bir pencere için kurulan gerekçeyi ötekilere taşımak.** 25 Eylül 2026: kalem ekleme odasının "No ve Ad açık kalsın" kuralı dört pencerenin hepsine uygulandı; istenen sınır ölçülebilirken kolay ölçü seçildi; hazır mekanizma (`openBlock`) varken "bedel" yazıldı. KURAL: bir pencerenin kuralı ötekine taşınmadan önce her birinde gerekçenin var olup olmadığı sorulur; kolay ölçü istenen ölçünün yerine konmaz; "bedel" yazmadan önce kodda o işi yapan mekanizma aranır.

**Mesajın yerini doğduğu anı okumadan söylemek.** 27 Eylül 2026: uyarılar bulundukları işleve göre gruplandı, 14 çağrının 6'sı pencerede değildi; bir kararın gerekçesi bu yanlış sayıma dayanmıştı. KURAL: mesajın nerede çıkacağı söylenmeden önce çağrının çalıştığı anda ekranda neyin açık, neyin kalkmış olduğu kodda izlenir.

**Kart davranışını bir moda bağlamak.** 1 Ekim 2026: hak devrinin kilidi moda dönüştü, her düzeltme yeni istisna ekledi; Engin durdurdu, mod kaldırıldı. KURAL: kart davranışında mod kurulmaz, bir hücreye yazılanın tek anlamı olur; kurum farkı şablonda, denetimde ve çıktıda çözülür (Hedef Mecra, `docs/butce/KART-KATALOGU.md` §6). Belirti: düzeltme "şu durumda da şöyle olur" diye istisna eklemeye başladıysa kök tasarım sorgulanır.

**Hedef ortamı ölçmeden araç seçmek.** 24 Eylül 2026: PDF paketi hedef tarayıcıdaki desteği ölçülmeden önerildi, Safari yalnız legacy yapıyla destekliydi; ilk sürüm şartına kabuğun cihaz kararına aykırı olarak iPhone yazıldı. KURAL: paket karşılaştırmasına hedef tarayıcıların resmi destek tablosu girer; hedef cihaz kabuğun cihaz kararından okunur, varsayılmaz.

**Devralınan eşlemeyi kalemin kararını okumadan kullanmak.** 13 Ekim 2026: 1614 Tekrar Telifi hak devriyle aynı çeşitteydi; kalemin kendi kararları okunmamıştı. Engin (birebir):

> Neden? Hak devri maaşın bir kısmı gibi görülebilir pratikte, yapımcı hak devri der ikinci taksite mesela, ancak tekrar telifi bütçede değil sözleşmede olan bir şeydir. Hiç oluşmayabilir ya da onlarca defa olabilir. Bundan emin misin, kafa karışmasın

KURAL: devralınan bir eşleme kullanılmadan önce her kalemin kendi karar kaydı okunur.

**Adı kütüphane ve saha sözüyle sınamamak.** 13 Ekim 2026: önerilen adda kütüphanede geçmeyen bir kelime vardı. Engin (birebir):

> figüran kelimesi artık kullanılmıyor sektörde

KURAL: önerilen her ad önce kütüphanedeki kalem adlarıyla ve sahanın sözüyle sınanır.

**Son anılan kaynağı tek ölçü yapmak.** 5-6 Ekim 2026'da MMB ve CNC, 13 Ekim'de Screen Australia tek ölçü yapıldı; iki hüküm geri alındı, üç tanım düzeldi. Engin (birebir, 13 Ekim 2026): "bir şey dikkatimi çekiyor screen Australia yı her yerde görmeye başladım neden. iyi bir model mi yol gösterici mi türkiyeye mi uygun?, saturation yamdu gibileri ise hiç görmüyorum" KURAL: MMB, CNC, Saturation, Showbiz, Wrapbook ve Yamdu birlikte tartılır; tek kaynağa dayanan hüküm tek kaynaklı olduğu söylenerek sunulur. En ayrıntılı kaynak en ağır kaynak değildir. 14 Ekim 2026: 1600 sonrası kart listesi yalnız MMB'nin hesap planından çıkarıldı, seyahat sorusunda önce yalnız CNC ve MMB örneklendi. Engin (birebir): "rakip analizi vb istediğimde bana cnc+mmb ile gelme sadece, saturation, eurimages dahil diğer uygulamaları da tarayarak gel" ve "diğer uygulamalara da bak allah aşkına güdük işler yapıp durma. kosterden damıtıyor, master excelden karşılaştırıyoruz"

**Araştırma kapsamını keyfi daraltmak.** 6 Ekim 2026'da kapsam bölündü ve işin istemediği kurallar önerildi. Engin: "saçma sapan daraltmalar anlamsız kurallar getirme. önce planla sonra yap". 13 Ekim'de Master Excel ilk turda atlandı. Engin (birebir): "saturation un şablonlarını buldum dedin onları da çalışmana kattın mı?" 14 Ekim'de KART 1400 kütüphane listesi Koster damıtımı okunmadan ve Master Excel'in yalnız yapımcı satırlarıyla önerildi. Engin (birebir): "yapımcı kartında mmb hizalama-koster damıtımı ve master excel taraması yapıldı mı kalemler için?" KURAL: araştırma kapsamı işin ihtiyacından çıkar; önce kısa plan, sonra uygulama; toplanan veri tek işte harcanmaz, repoda saklanır.

**Dokümandaki olguyu doğrulamadan dışarı taşımak.** 8 Ekim 2026: iç dokümandaki yanlış veri yeri tanıtım sayfasına girecekti. 13 Ekim'de kaynaksız bir satır iki kez tekrarlandı. Engin (birebir): "Kültür bakanlığının bütçesi diye bir şey yok. nereden çıkardın bunu?" ve "Bakanlık desteğinde bütçe yapımcının kendi biçiminde veriliyor." KURAL: dokümandaki bir olgu sayfaya, forma ya da başvuruya girmeden önce kaynağında doğrulanır; doküman kendi cümlesinin kanıtı değildir.

**Yapım hâlindeki ürünü "kodda var mı" ölçüsüyle tartmak.** 8 Ekim 2026. Engin: "kodda var mı yok mu diye bakman kadar anlamsız bir şey olabilir mi ya? bitmiş bir yazılım değil ki bu." KURAL: bir fikrin değeri karar dosyalarından okunur; kodun durumu yalnız Durum satırında söylenir.

**Ürünü tek özelliğe indirgemek.** 8 Ekim 2026. Engin: "sürekli aynı şeylere takılıyorsun". KURAL: ayırt edici yönler ayrı ayrı ve eşit ağırlıkla sayılır; kullanıcının verdiği örnek listenin yeni merkezi yapılmaz.

**İkinci temayı birinciden türetmek.** 9 Ekim 2026: koyu tema açık temanın renkleri karartılarak üretildi. KURAL: yüzeyi yöneten karar dosyası tasarımdan önce okunur; iki tema eşitse ikisi de ayrı tasarlanır (`docs/TASARIM-KARARLARI.md` §3).

### Spec ve prompt

**Spec içi çelişki.** 31 Ağustos 2026'da üç kez, 5 Eylül'de bir kez: aynı promptta birbirini dışlayan adımlar ve şartlar. Kök: BEKLENENLER önceki prompttan taşınıyordu. KURAL (`docs/protokol/PROMPT.md`): BEKLENENLER her dilim için sıfırdan yazılır; prompt yazıldıktan sonra adımlar birbirine karşı okunur. Kapı kuramaz, çelişki spec'in kendi içinde.

**Kendi yazdığın metni denetime karşı saymamak.** 6 Eylül 2026'da altı yanlış alarm, 25 Eylül'de dört, 27 Eylül'de bir; hepsinde Sonnet haklı olarak durdu. Üç kök: yanlış birim (`grep -c` satır, `grep -o | wc -l` geçiş sayar); spec'in kendi eklediği metin (yorum dahil) sayılmadı; eşleşme semantiği (alt dize, `-A` penceresi). KURAL: spec'e denetim ya da BULMA İFADESİ yazılırken aynı spec'in ve önceki dilimlerin eklediği metin de sayılır; teklik sayılırken ifadenin başka bir ifadenin parçası olarak geçip geçmediğine bakılır. SAYI (Engin kararı, 14 Ekim 2026): promptta beklenen sayı ancak Opus spec'i kendi kopyasında uygulayıp ölçtüyse yazılır; ölçülmemiş sayı yazılmaz (`docs/protokol/PROMPT.md`). Önceki kural "sayı yazılamaz" idi (6 Eylül); yanlış alarmların kökü tahmin edilen sayıydı.

**Çoğaltılmış blokta tekil çapa istemek.** 31 Ağustos 2026'da iki kez matematiksel olarak sağlanamayan çapa istendi. Kural `docs/protokol/PROMPT.md`'de: çapa bloğun içinden değil, bloğu tekilleştiren dışarıdaki işaretten alınır.

**Şemaya değen promptta yalnız doğduğu göçü okumak.** 15 ve 31 Ağustos (tablo), 23 Eylül (işlev), 30 Eylül 2026 (emsal satır). Kural `docs/protokol/PROMPT.md`'de: tablonun TÜM göç geçmişi taranır. Ek: işlevin bugünkü hâli son tanımından okunur; emsal satırın değeri canlıdan ya da o satıra dokunan SON göçten alınır.

**Göç doğrulamasını `raise notice`e bırakmak.** 22 Eylül 2026: doğrulama bloğunun NOTICE'leri `db push` çıktısında görünmedi. Bugünkü usul: yapısal koşullar göçün sonundaki `do $check$` bloğunda `raise exception` ile denetlenir; içeriği göstermek için sorgu Engin'e `!` satırı olarak verilir (`docs/protokol/PROMPT.md`, 3 Ekim 2026).

**Canlı SQL onayında kararı veren satır grep'le istenir.** 12 Eylül 2026: tam metin dört kez kırpıldı, her seferinde kararı veren satırdan; 30 Eylül'de göçe Sonnet'in özetinden itiraz yazıldı, dosya okunmadan. KURAL: canlı veriye dokunan onayda önce kararın bağlı olduğu şart grep ile istenir; göç onayı her zaman dosyanın tam metni üzerinden verilir.

**Bağımlılık sırası.** 5 Eylül 2026: göç, düşürülecek kolona hâlâ bakan dört RLS politikası yüzünden patladı. KURAL: kolon düşürülmeden önce ona bağlı TÜM nesneler çözülür; göç maddeleri bağımlılığa göre dizilir. Katalogdan sorulur: `pg_depend` sorgusu `pg_class`'a JOIN EDİLMEZ (politikalar `pg_policy`'de yaşar), `pg_describe_object` kullanılır; `deptype='n'` elle çözülür, `deptype='a'` kolonla düşer.

**Dilim keserken katman ayırmak.** 5 Eylül 2026: "yalnız şema" dilimi kolonu okuyan servis dosyasını kaçırdı. KURAL: kolon değişen her dilimde o kolona dokunan TS dosyaları da taranır.

**Spec'e ezberden isim yazmak.** 5 Eylül 2026: 15 `name_en` değeri katalogdan kopyalanmadan yazıldı. KURAL: kaynaktan kopyalanmayan isim spec'e girmez.

**Spec'in dosya listesi eksik.** 19 Eylül 2026: dokunulan tip ve verinin yaşadığı iki dosya BEKLENENLER'de yoktu; Sonnet birinde sordu, üçünde sormadan devam etti. KURAL: dokunulacak tip ve verinin hangi dosyada yaşadığı INDEX'ten bakılır; Sonnet için her örnekte DURMAK kuraldır, bir sorunun cevabı sonrakileri kapsamaz.

**Ekransız dilime işlev koymak.** 1 Ekim 2026: çağıranı olmayan iki işlev dilime kondu, imzası değişen işlevin testi okunmadı; Sonnet iki kez durdu. KURAL: dilime giren her dışa açık işlevin o dilimde bir çağıranı olur; imzası değişen işlevin testleri spec yazılmadan okunur.

**Tetiği bağımlılık dizisinde aramamak.** 20 Eylül 2026: spec "efekt tekrar koşar" dedi, oysa bağımlılık dizisi o değeri taşımıyordu; eslint de yakalamaz, çünkü efekt değeri okumuyordu. KURAL: bir efektin ikinci kez koşmasına dayanan her spec o efektin bağımlılık dizisi okunarak yazılır.

**Ölü bir yolu canlandırmak, ona dayanan yalanı görünür kılar.** 20 Eylül 2026: komisyonun açılışta doğması düzelince silme düğmesi yalancı oldu (satır siliniyor, açılışta geri doğuyordu). KURAL: bir tetiği yeniden canlandıran dilimde o tetiğin ürettiği şeye dokunan öteki yüzeyler de taranır.

**Düğmenin işi yanlışsa düğme kalır, işi değişir.** 20 Eylül 2026: silemeyen × düğmesinin kaldırılması önerildi; Engin düzeltti, kaldırmak klavye ızgarasında boş durak bırakacaktı.

**Ekran, işlevin kapılarını bilmiyor.** 22 Ağustos 2026'da üç kez: işlevin reddedeceği satırlara düğme çizildi. Kök: spec "her satıra düğme" diyordu, "işlevin kabul ettiği satırlara" değil.

**Prompt başlığının kuralları.** Spec dışı düzeltmeyle atılan commit (24 Eylül 2026), terminal kapandıktan sonra okuma satırı olmayan prompt (29 Eylül), heredoc ile kırılan uzun metin ve kopyalamada düşen sondaki boşluk (13 Ekim) bugün prompt başlığının kurallarıdır: `docs/protokol/PROMPT.md`.

**CLI çıktısı ayrıştırılmaz.** 5 Eylül 2026: `supabase` CLI çıktısının başındaki JSON olmayan satırlar `node -e` ayrıştırmasını kırdı. KURAL: CLI çıktısı olduğu gibi yapıştırılır ve gözle okunur.

**Sonnet'in oturum özeti birebir metni taşımaz.** 23 Eylül 2026: sıkışan oturumda iki kayıt metni Sonnet'in kendi cümleleriyle yazıldı. KURAL: push'tan sonra eklenen doküman metinleri prompttakiyle BİREBİR karşılaştırılır; eksik düşen metin bir sonraki dilime iliştirilir.

**Kozmetik iş için pahalı prompt.** 6 Ekim 2026: klavye kaymalarını düzelten dilim Engin'in limitinin yaklaşık %30'unu tüketti. KURAL: bir işin değeri ile maliyeti iş önerilmeden önce birlikte söylenir.

### Oturum ve kayıt

**Düşürülen parça.** 22 Ağustos 2026'da iki kez: "ayrı mesajda vereceğim" denen iş geri gelmedi.

**Bir işin TARİFİ, o iş bitmeden budanmaz.** 25 Ağustos 2026: budama beş parçalık işin tarifini sildi, beşinci parça konuşulmadan düştü. KURAL: bir dilimin tarifi o dilim KAPANDIĞI doğrulanmadan budanmaz; budanacaksa önce tarif başka bir dosyaya taşınır.

**Aynı olgunun N yerde yaşaması.** 1 Eylül 2026'da ölçüldü: bir kapanış promptunun 20 düzenlemesi yalnız yedi olgunun suretiydi; bir suret 39 gün kapanmış işi açık gösterdi. Bayat suret yalnız maliyet değil, YANLIŞ DURUM üretir. ÇÖZÜM UYGULANDI (Engin kararı, 9 Eylül 2026): kodun ya da betiğin sahibi olduğu sayı düzyazıda tutulmaz, sahibine işaret edilir (CURRENT.md "SAYILAR BURADA YAŞAMAZ"); kararın gerekçesini anlatan tarihli sayı yerinde kalır.

**Bayat kaydı avlarken tek dosya yetmez.** 12 Eylül 2026: bayatlayan iddia dört dosyada yaşıyordu, spec ikisini kapattı. KURAL: bir kayıt bayatladığında aynı iddiayı taşıyan HER dosya taranır; çapraz referans yazılmadan önce hedefin var olduğu doğrulanır.

**Boş liste "temiz" sayılıyor.** 1 Eylül 2026: index boşken `gate.sh`'in içerik taramaları hiç çalışmıyor ve damga boş liste üzerinden eşleşiyor; `git add -A && git commit` tek satırda birleşince kapı denetlemeden geçiyor. "Kapı geçti" tek başına "içerik denetlendi" demek değildir. Belirti: kapı bir turda reddedip sonraki turda aynı metni kabul ediyorsa ikinci turda denetlememiş olabilir. Kod borcu TD-37; prompt kalıbı bu yüzden `git add` ile commit'i ayrı adımlarda yazar (`docs/protokol/PROMPT.md`).

**Araştırma bulgusunu aynı oturumda kaydetmemek.** 14 Haziran ve 8 Ekim 2026: bulgular sohbette kaldı, bağlam sıkışınca kaynaklı rakamlar kayboldu; 9 Ekim'de dosyaya yazılan notlar sağ kaldı. KURAL: bulgu üretildiği anda bir dosyaya yazılır.

**Yapılacaklar listesini taramadan yazmak.** 12 Ekim 2026: liste akılda kalanlardan yazıldı, yedi dosya gösterdi, gerçekte dokuzdu. Engin: "Yapılacak tüm bu kadar mıydı yapılacak tüm iş ve tarama". KURAL: kapanış ve doküman listesi değişen kavramların repoda taranmasından sonra yazılır; taranmadıysa "taranmadı" denir.

**Açılış okuması.** 5 Eylül 2026'da `.claude/` okunmadığı için kapı ve sandbox tarifleri yanlış yazıldı (9 Eylül'den beri açılış protokolünün 3. adımında); 22 Eylül'de açılışta listenin dışına çıkıldı. KURAL: açılışta açılış protokolünün okuma listesi dışına çıkılmaz; çakışma şüphesi raporda tek cümleyle söylenir.

**Sandbox gerçeği.** Sonnet'in makinesinde Docker yok: `db reset` ve `db dump` talimatı yazılmaz, şema dilimlerinde sandbox turu canlıya karşı salt okuma sorgusudur (CLAUDE.md Ortamlar, `.claude/rules/supabase.md`). Opus'un yerel PostgreSQL sandbox'ının kurulum tarifi: `docs/protokol/SANDBOX.md`.

**Aynı soruyu ikinci kez sormak.** 19 Eylül 2026. Kural CLAUDE.md'de (re-soru yasağı): kullanıcının cevabı kapsadığı bütün parçalar için geçerlidir.

**Kapanışta Engin'in metnini özetlemek.** 1 ve 6 Ekim 2026. Kural kapanış protokolünde (`docs/protokol/`): Engin'in metni ev dosyasına birebir girer.

### Konuşma biçimi

**Bir konuyu çözerken başka konular açmak.** 1 Ekim 2026. Engin: "kabul dediğim nedir onu bile unuttum". KURAL: takılınan yer tek cümleyle söylenir, çözüm tek cümleyle verilir; başka konu ancak takılınan yeri doğrudan değiştiriyorsa açılır; uygulama ayrıntısı karar gibi sunulmaz.

**Bedelleri sıralayıp üstünden geçmek.** 6 Ekim 2026. Engin: "bi dünya tedirgin edici laf edip hadi devam edelim diyorsun". KURAL: söylenen her risk ya da bedel ayrı ayrı ele alınır: ne demek, nasıl çözülür, çözülmüyorsa hangi karar gerekir.

**Kavramı somut sonuç vermeden anlatmak.** 13 Ekim 2026'da iki kez. Engin (birebir):

> kavramsal konuşuyorsun ama net bir sonuç bilgisi yok

> kavramsal bilgi genelde benim konuştuğum, sana verdiğim bilgi olur, sen somut olarak ne yapılacağını bildirirsin ama burada farklı döndü iş

Engin (birebir): "Çok hızlı gidiyorsun ve basite indirgiyorsun nedir bu 10 doğa, baştan beri söylediğim şeyi verecek mi bana, yakıta ne kadar harcamışım? Nakliyeye, yönetmene, ekipmana bu soruların raporlarını alabilecek miyim bu doğa olayı nedir"

KURAL: her öneri satır düzeyinde bir örnekle sunulur: hangi satır, hangi kartta, kullanıcı neyi ekler, raporda ne çıkar. Satırı ya da raporu değiştirmeyen bilgi öneriye eklenmez.

**Resmin bir parçasını tek başına anlatmak.** 9-12 Ekim 2026: gider çeşidi komşu eksenler olmadan anlatıldı, "etiket" kelimesi başka anlamda kullanıldı. Engin (birebir):

> bu chat çok kafamı karıştırdı 1) çok dallandı budaklandı net bir yön yok

KURAL: bir eksen anlatılırken komşu eksenler birlikte konur (kart, çeşit, iş ve kişi etiketi, dönem); terim KAAPA'daki anlamıyla kullanılır.

## Ters yönde kayıtlar

Sonnet'in DUR'u sinyaldir; raporu doğrulama değildir ama DUR'u incelenmeden geçilmez. Kayıtlı vakalar: üç DUR canlıyı korudu (canlıda olmayan tablo, ölü bir işlev overload'ı, kapsam dışı bir testi kıracak zorunlu alan); 31 Ağustos 2026'da beş, 25 Eylül'de dört bildirim, hepsinde haklıydı ve hiçbirinde kendi çözümüyle commit atmadı.

20 Eylül 2026. ONAYLANMIŞ YÖNTEM UYGULANMADAN ÖNCE İKİNCİ KEZ ÖLÇÜLDÜ ve üç delik çıktı: kütüphane gelmeden doğan komisyon satırı oransız doğacaktı, bordro gelmeden bordrolu kişide satır yine doğmayacaktı, satır listesine bağlanan tetik her tuş vuruşunda koşacaktı. Ölçüm yapılmasaydı üçü de canlıya inecekti.

21 Eylül 2026. GECİKMENİN SEBEBİ KAYITTAN SÖYLENİR. "Neden bu kadar uzadı" sorusuna iki kez farklı sebep söylendi; etkinlik kaydı ikisini de tutmadı. Engin buna yalan dedi; doğruydu. KURAL: "neden uzadı" sorusu tahminle değil, o turun komut kaydına bakılarak cevaplanır; itiraz gelince sebep değiştirilmez, kayıt yeniden okunur.

14 Ekim 2026. KOPYADA ÖLÇÜLEN SAYI AKTARIMDA DÜŞEN METNİ YAKALADI: aynı gün kabul edilen sayı kuralıyla promptta DERSLER.md'nin bayt sayısı yazılıydı; Sonnet'in yazdığı dosya 9 bayt eksik çıktı ve Sonnet durdu. Fark bölüm ve satır bayt sayılarıyla tek satıra indi: metin aktarılırken bir cümleden "bu kadar" düşmüştü. Sayı yazılmasaydı eksik metin commit'lenecekti.
