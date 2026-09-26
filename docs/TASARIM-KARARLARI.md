# KAAPA — Tasarım Kararları (Ekranlar-Arası Ortak İlkeler)

**Kapsam:** Bu dosya YALNIZCA tüm ekranlarda ortak geçerli görsel ve etkileşim ilkelerini tutar. Ekran-spesifik içerik (alan/akış/yerleşim) → docs/EKRAN-SAHA|DEPT|MUHASEBE.md. İş mantığı (onay/dönem/avans/reddet/anomali/hot cost) → docs/IS-KURALLARI.md. Görev sırası → docs/IS-SIRASI.md.

---

## 1. Tasarım felsefesi
- **Mobil öncelik yüzey bazlıdır** (Engin kararı, 8 Ağustos 2026 — eski "Mobile-first, desktop responsive açılır" ifadesi ortak ilke gibi okunuyordu, kaldırıldı):
  - **Saha:** mobil-first. Birincil kullanıcı sette: ayakta, tek elle, zaman baskısı, bazen karanlık ortam. Alt şerit korunur.
  - **Dept:** mobil ve masaüstü EŞİT.
  - **Muhasebe + Bütçe:** mobil-first DEĞİL, masaüstü öncelikli. Telefonda çalışır; sınırları docs/KABUK-KARARLARI.md bölüm 14.
- **Aksiyon öncelikli.** Her ekranda birincil eylem görsel merkezde; ikincil bilgi geri planda / scroll altında.
- **Netlik > süs.** Anlaşılırlık her zaman önce gelir.
- **Karmaşık iş, basit kullanım.** Uygulama karmaşık hesap/analiz yapar; ama kullanım, ayar, optimizasyon ve güncelleme kullanıcı-dostu ve basit kalır, uzmanlık gerektirmez. Kullanıcının zaman içinde değiştirmesi gereken veriler (örn. vergi oranları — Türkiye'de sık değişir) uygulama merkezine/geliştiriciye bağlı olmaz; kullanıcı kendi arayüzünden günceller.

## 2. Kart-merkezli arayüz
- **Muhasebe:** TAM kart-merkezli çalışma masası. Her konu (bekleyen / şüpheli / avans / kiralama) bir kart; kartlar masaya serilir, içinde çalışılır; bildirimlere ve önceliklere göre otomatik sıralanır (yukarı/aşağı). Sunum detayı G6'da (EKRAN-MUHASEBE açık slot).
- **Dept:** KISMEN kart-merkezli (muhasebe kadar değil).
- **Saha:** kart-merkezli DEĞİL. Aksiyon-merkezli kendi akışı (FİŞ TARA odaklı). **Saha arayüzü jeneriktir:** öğelerin konumları sabit, yalnızca kozmetik (renk/şekil) geliştirilir.

## 3. Tema ve görsel kimlik (ilke kayıtlı, değerler G6'da)
- **İki tema EŞİTTİR** (Engin kararı, 5 Ağustos 2026 — ESKİ ifade "Dark-mode öncelikli (set ortamı), light mode da bulunur" idi, kaldırıldı): koyu ve açık temadan hiçbiri diğerine öncelikli değildir. Üç sonucu: (a) koyu temada işlev bozulması ertelenebilir kozmetik değildir — diğer bozukluklarla aynı öncelikte ele alınır; (b) tokens.css baştan iki değerli kurulur, sonradan koyu tema eklenmez; (c) G6 görsel turu iki temayı birlikte kapsar, biri sonra eklenmez. Tema tercihi kullanıcı bazlı.
- **Ön plan rengi kaba verilir, tek metne yamanmaz (Engin kararı, 16 Eylül 2026):** renk kapsayan öğe (kart/buton/sheet) üzerinde tanımlanır, içindeki tek tek metinlere ayrı ayrı yamanmaz. Açık zeminli bir kap koyu temanın yazı rengini miras alır.
- **Renk paleti, accent kullanımı, tipografi, ikonografi, logo/favicon → G6 görsel tasarım oturumunda belirlenecek (AÇIK SLOT).**
- tokens.css yapısı placeholder değerlerle kurulur; değerler G6'da swap edilir, yapı değişmez.

## 4. Etkileşim ilkeleri
- Touch target: mobil, tek elle kullanıma uygun minimum boyutlar.
- 100dvh viewport fix (Chrome mobile).
- Floating navigation: tabana yapışık değil, kenar boşluklu, yuvarlak köşeli (saha; yerleşim EKRAN-SAHA §2).
- Durum renkleri (onay/red/bekleyen/uyarı) semantik kullanılır; kesin değerler G6.

## 5. OCR güvenilirlik gösterimi (UX ilkesi)
- Confidence arka planda HER ZAMAN çalışır, tüm veriler Supabase'de. Faz farkı yalnızca kullanıcıya ne gösterildiğidir.
- Confidence renk bantları + eşik gösterimi: ekran detayı EKRAN-SAHA §4. Eşik değerleri pilotta kalibre edilir (referans: docs/RAKIP-ANALIZI-OCR.md — sektör %80-85 başlangıç).
- Onay modeli (3 katmanlı insan kontrolü) iş kuralıdır → docs/IS-KURALLARI.md §1.

## 6. Görsel tasarım işleri (G6 — açık)
Her ekranın görsel tasarımı (renk, kozmetik, dark tema, doku, logo/favicon) commit'ten önce G6 oturumunda belirlenir. Ekran dosyalarındaki "AÇIK SLOT" notları bu oturumda doldurulur.

## 7. Referanslar
- Rakip OCR analizi: docs/RAKIP-ANALIZI-OCR.md
- Domain terimleri: docs/GLOSSARY.md

## 8. Bütçe modülü (2026-06-12 — kilitli)
Şema/teknik karar kaydı (B-serisi): docs/butce/BUTCE-SEMA-KARARLARI.md. Ekran tarifleri: docs/EKRAN-MUHASEBE.md §19. Kalıcı UX ilkeleri:
1. 10 dakika kuralı — eğitimsiz muhasebeci 10 dakikada ilk grubu doldurur; kurs gerektiren her şey tasarım hatası.
2. Kart = tek konu — masada yalnız kartlar; kartın içinde yalnız o grubun satırları.
3. Görünür hesap, dokunulmaz formül — formül hücresi yok; her toplamda tek dokunuşla düz Türkçe döküm ("75.000 net + %33 yük = 99.750 × 1,75 hafta = 174.563").
4. Üç alan kuralı — satır eklemek = ad + net + bir sayısal alan (Miktar veya X; diğeri varsayılan 1'de kalır); yük ve birim gruptan miras.
5. Klavye akışı — Enter/Tab ile Excel hızı.
6. Kayıt düğmesi yok — her hücre anında kaydedilir.
7. Şablondan gelen boş kalem 0'da durur, toplama girmez, gizlenebilir.
8. Güven = değişiklik izi + orijinal kilidi.
9. Mobil: bütçe girişi masaüstü-önerilir; icmal/özet mobil-tam.
10. Uyarı 3 seviye: engel / uyarı / öğreten ipucu ("ne oldu + neden önemli + ne yap").
11. Tamamlılık ilkesi: kullanıcıya "bunu neden koymamışlar" dedirtme; her erteleme kayıtlı karar.
12. Görsel tasarım ayrı turda, UI yazılmadan önce (wireframe ≠ kimlik).
Model bildirisi: omurga dünya standardı (icmal → etap → grup → kalem, hesap kodlu, orijinal/yürüyen/gerçekleşen, EFC kapısı), matematik Türkiye (yük bileşenleri, KDV ayrıştırma, belgeli/belgesiz), sunum KAAPA (kart masası + ray).


## 9. Katman sırası ve odak göstergesi (KARARLAŞTI 2026-07-28, Engin onayı)
Ekranlar-arası ortak ilke — bütçeye özel değildir, her ekran için geçerlidir.
- Katman sırası TEK yerde yaşar: `src/styles/tokens.css`. Bileşen içinde çıplak z-index sayısı YASAK.
- Sıra: `--z-nav` (100) sayfa mobilyası (üst başlık, alt menü) → `--z-dropdown` (150) açılır listeler → `--z-panel` (160, YENİ) odaklı çalışma yüzeyleri, ilk sakini bütçe hızlı ekleme yüzeyi → `--z-modal` (200) alt-sheet ailesi ve tam modallar → `--z-toast` (300) uyarı balonları ve çevrimdışı şeridi, her zaman en üstte.
**UYARI KUTUSUNUN RENK KODLARI (18 Eylül 2026, Engin onayı):** `--color-warning-bg` ve `--color-warning-text` tanımlandı. Değerler iki temada da aynı: zemin `#fff8e1`, yazı `#92400e`. Bunlar üç ekranda (saha ana ekranı, fiş düzeltme, muhasebe inceleme) kodun yanına yedek olarak yazılmış ve bugüne kadar fiilen kullanılan değerlerdi; tanımlanırken hiçbir ekranın görünümü değişmedi ve yedek değerler silindi. GEREKÇE: kodlar tanımsız olduğu için kapı, bu dosyalara dokunan ilk dilimi durduruyordu; ekranlar okunuyordu, yani sorun görünürlük değil yolun tıkalı olmasıydı. AÇIK KALAN: koyu temada kutu açık krem kalıyor, temaya uymuyor; iki değerin temaya göre ayrılması UI turunun işidir. Bu yüzden amber zeminli gönderme düğmesi için üçüncü bir kod AÇILMADI: `--color-warning-text` bugünkü koyu değeriyle o düğmede de okunuyor. Koyu tema değeri değiştirilirse o düğmenin kontrastı önce ölçülür. TUR DÜŞTÜ (18 Eylül 2026): bu değişiklik için yazılan tarayıcı turu yapılmadan düşürüldü. Tanımlanan değerler o güne kadar yedek olarak kullanılan değerlerin birebir aynısı, yani görünümün değişmesi mümkün değil; ayrıca uyarı kutusu ile amber düğme yalnız bekleyen fiş varken çıkıyor, bekleyen fiş yok ve fiş üreten saha ekranı hiçbir yerden açılmıyor.
**UYARI BALONUNUN YERİ VE SÜRESİ (17 Eylül 2026, Engin onayı):** Uyarı ve hata mesajı işin yapıldığı yerde çıkar ve kullanıcı kapatana kadar durur. Açık bir pencere kendi içinde mesaj yeri açmışsa mesaj en üstteki pencerenin içinde, başlığın hemen altında çıkar ve pencere kaydırılsa da yerinde kalır; pencere yoksa ekranın tepesinde çıkar. Pencere kapanınca açık kalan mesaj ekranın tepesine geçer, kaybolmaz. Uyarı ve hatanın yanında kapatma düğmesi (×) durur; mesaja basmak da kapatır. Başarı ve bilgi mesajları eskisi gibi 3,5 saniyede kendiliğinden gider. GEREKÇE: gözün olduğu yere gelmeyen ve kendiliğinden giden uyarı görülmez; görülmeyen uyarı sessiz hatadır. 17 Eylül 2026'da Oyuncular listesinde görüldü: uyarı ekranın tepesinde, listeyle ilgisiz bir yerde çıkıyordu ve ekran büyütülünce hiç görülmüyordu. KAPSAM: mesaj yeri açan yüzeyler alt pencere ailesi (altı pencere) ve hızlı ekleme yüzeyidir; onay kutusu ve üst başlıktaki menüler mesaj yeri açmaz. Mesaj çağrılarına dokunulmadı; yer ve süre ortak bildirim kutusunda belirlenir. Katman sırası değişmedi: pencere içindeki mesaj pencerenin kendi katmanında, içeriğin üstünde durur. SEÇİLMEYEN YOL: mesajı ilgili satırın yanına koymak; her mesaj çağrısını tek tek elden geçirmeyi gerektirirdi. BEDELİ: pencerede mesaj belirince içerik bir satır aşağı kayar; art arda farklı mesajlar gelirse üst üste birikir, her biri ayrı kapatılır.
**AÇILIR PENCERE VE UYARI TETİĞİN YANINDA (24 Eylül 2026, Engin onayı — ilke; tasarım sonraki oturumda):** Bir satırdan ya da hücreden açılan her pencere ve o işin uyarısı tetiğin hemen yanında açılır; tablo kaydırılırsa onunla gider. Ekranın ortası yalnız hiçbir satıra bağlı olmayan işlere kalır (proje seçimi gibi). Mobil düzen bu turda belirleyici değildir: bütçe ve muhasebe ekranları büyük ekran için tasarlanır, mobil uyumlu ekran yapıldığında kendi yerleşimini alır. GEREKÇE: göz tıkladığı yerde durur; pencere oraya gelmezse kullanıcı ya görmez ya arar. BUGÜNKÜ DURUM (24 Eylül 2026 kod okuması): Yasal Yük dökümü, Not, Statü rehberi, Başlık penceresi, "+ Ekle" seçicisi ve Oyuncular listesi ekranın altından, ortadan açılıyor ve arkayı karartıyor; hızlı kalem ekleme ekranın tam ortasında; yedi yerde tarayıcının kendi onay ya da uyarı kutusu kullanılıyor (kalem silme, dönem kaldırma, komisyon silme, Üretim Kayıtları'nda tek ve toplu kişi silme, iki çıkış hatası); bildirim balonu açık pencere yoksa ekranın tepesinde, varsa pencerenin içinde çıkıyor. Tetiğin yanında açılanlar yalnız seçim listeleri (Statü, Birim, Dönem seç), hızlı eklemedeki öneri listesi ve üst şeritteki profil menüsü. DEĞİŞEN GEREKÇELER: 26 Temmuz 2026 Not penceresi kararının "hücreye yapışık pencere mobilde sıkışır" gerekçesi bu ilkeyle düşer (`docs/butce/BUTCE-EKRAN-KARARLARI.md` Not bölümü). Yukarıdaki 17 Eylül 2026 bildirim kararının sözü ("işin yapıldığı yerde çıkar") bu ilkeyle aynıdır; uygulaması (pencere yoksa ekranın tepesi) sözden ayrışmıştı. Katman sırası ve uyarının kapatılana kadar durması DEĞİŞMEZ.

**TETİĞİN YANINDA AÇILMA — K1 (24 Eylül 2026, Engin onayı):** Satırdan ya da hücreden açılan pencere tetiğin hemen altında açılır, sol kenarı tetiğin hizasında durur; ekranın sağından taşacaksa sola kayar; içerik altta sığmıyorsa ve üstte daha çok yer varsa tetiğin üstünde açılır. Boy seçilen taraftaki yerle sınırlıdır, fazlası pencerenin içinde kayar. Arka KARARTILMAZ: okunur kalır, dokunulmaz, dışına tıklamak kapatır (hızlı ekleme odasının davranışı). Klavye kalıbı aynen durur: Esc kapatır, Tab pencerenin içinde döner, kapanışta imleç tetiğe döner. Pencere açıkken ekran kaymaz (24 Eylül 2026, Edge denemesi: tablo kaymıyor, yalnız sayfa esniyor); bu yüzden pencere kaydırmayı izlemez, açıldığı yerde durur. Ekleme satırından açılan pencereler (seçici, kalem ekleme odası, Kime?, Başlık) ekleme satırının üstünde açılır ve sol kenarı Ad sütununun bittiği yerde durur; No ve Ad açıkta kalır ki eklenen kalem ve çerçevesi görünsün. Tetik pencereye açıkça bildirilir: Mac Safari'de tıklanan düğme odak almaz. UYGULAMA: Dilim 1a (24 Eylül 2026) Yasal Yük dökümü (ana ve dönem satırı), Not ve Statü rehberi; ortak pencere parçası tetik verilmezse bugünkü alt-orta, karartmalı biçimde açılır. Dilim 1b ekleme satırı pencereleridir ve Başlık penceresinin Ad sütununun sağına sığıp sığmadığı ölçüldükten sonra yapılır; 1b'de kalem ekleme odası açıkken tablo yeni kaleme kaydığı için odanın satırla gidip gitmeyeceği ayrıca konuşulur. Oyuncular listesinin yeri K2 olarak ayrıca konuşulur; o güne kadar bugünkü gibi kalır. **PENCERENİN DURABİLECEĞİ ALAN (25 Eylül 2026, Engin onayı, Dilim 1a-4):** yer hesabı tarayıcının tamamına göre değil, tablonun görünen alanına göre yapılır: tetiğin içinde durduğu kaydırılan kutuların (kabuğun içerik alanı, varsa tablonun kaydırma kutusu) kaydırma çubukları hariç görünen kısmı. Pencere bu alanın dışına taşmaz; tablonun altındaki kaydırma çubuğunu, kart toplamı satırını ve sağdaki dikey kaydırma çubuğunu örtmez. Yalnız kaydırılan kutular sayılır; yazıyı "…" ile kesen hücreler sayılmaz. **EKLEME SATIRI (25 Eylül 2026, Dilim 1b-1):** Ekleme satırından açılan pencereler işine göre yerleşir (25 Eylül 2026 düzeltmesi, Engin): **"+ Ekle" seçici** genel kurala uyar; "Ekle" yazısının dibinde açılır (altta yer yoksa üstte), içeriği kadar geniştir (en dar 240). Seçici bir şey seçilince kapanır ve açıkken tabloda bir şey değişmez; No ve Ad'ı açık tutmanın seçicide sebebi yoktur. **Başlık penceresi** 568 piksel geniştir (iki sütununun en az genişliği; eskiden 760). Sol kenarı tablodaki not işaretinin sol kenarına yaslanır: ad kutusu açık, not işareti örtülü; kartta kalem yoksa Statü sütununun başı. Önce üstü dener ve satırı örterek açılır: üstte açılırken alt kenarı ekleme satırının alt çizgisine, altta açılırken üst kenarı üst çizgisine oturur. **Kalem ekleme odası** (ve "Kime?" adımı) 340 piksel geniştir (en uzun kütüphane adı tek satırda sığar; eskiden 480). Başlık penceresiyle aynı yere oturur (25 Eylül 2026 düzeltmesi, Engin): sol kenarı not işaretinin başında (ad kutuları açık, not işaretleri örtülü; kartta kalem yoksa Statü sütununun başı), önce üstü dener ve satırı örterek açılır. Oda kendisi kaymaz; kaydırma yalnız listededir, liste odaya sığacak kadar kısalır. Yer yalnız açılışta ve tarayıcı penceresi yeniden boyutlanınca hesaplanır; kalem eklenip ekleme satırı aşağı inse de oda yerinde durur, üstte açılan odanın alt kenarı sabittir (Dilim 1b-2). Ölçüm (25 Eylül 2026, Engin'in ekranı, 1280 piksel genişlik): Ad sütununun sağında 948 piksel yer var, Başlık penceresi sığar; daha dar ekranda pencere sola kayıp Ad sütununun bir kısmını örter (kabul edilen bedel). Kalem ekleme odası açıldığı yerde durur: kalem eklenip tablo kaysa da ekleme satırıyla birlikte kaymaz (25 Eylül 2026, Engin onayı; uygulaması Dilim 1b-2). Tetik odak alamayan bir öğeyse (ekleme satırının boş hücresi) pencere kapanınca imleç, pencere açılmadan önce odakta olan öğeye döner.

**KARTA BAĞLI PENCERE ORTADA — K2 (25 Eylül 2026, Engin onayı):** Oyuncular listesi bir satıra değil bütün karta bağlı iş olduğu için tetiğinin (kartın sağ üstündeki düğme) yanında değil, ekranın alt ortasında ve arkası kararık açılır. Genişliği 940 piksel (BUTCE-EKRAN-KARARLARI §20 madde 7). Panodan getirilen satırın arkada doğmasının karşılığı, liste kapanınca yapılan kaydırma ve çerçevelemedir (23 Eylül kararı).

- **Çalışma yüzeyi (panel) ile modal farkı:** panel karartmaz, altındaki içerik okunur kalır ama dokunulamaz, dışına tıklamak kapatır (Esc ile aynı). Modal/alt-sheet karartır ve odağı içine kilitler. Tetiğin yanında açılan pencere (K1, 24 Eylül 2026) karartmaz ama odağı içine kilitler; arkası panel gibi okunur kalır. İkisi aynı anda açık olmaz.
- Bir yüzeyin İÇİNDEKİ açılır liste kendi yığın bağlamında kalır; global sayı yarışı yoktur.
- **Odak göstergesi:** klavyeyle üstünde durulan her durağın çevresinde ince, vurgu renginde çerçeve belirir. Görünüm (renk, kalınlık, köşe) TEK yerde tanımlanır; G6/UI turunda değiştirildiğinde bütün duraklarda birlikte değişir. Vurgu rengi projenin genel vurgu rengidir — değiştirilirse o rengin göründüğü her yer birlikte değişir.
- **Fare ile klavye ayrımı (tarayıcı teyidi 2026-07-28, Engin: "böyle kalsın"):** kural `:focus-visible` üzerinden işler. Sonuç olarak yazı hücreleri ve seçim hücreleri (Statü, Dönemler, Birim) fareyle tıklandığında da çerçeveyi gösterir; düğmeler (Not, Yasal Yük, satır silme x) yalnızca klavyeyle gelindiğinde gösterir. Bu tarayıcının kendi ayrımıdır, KABUL EDİLDİ ve tutarsızlık SAYILMAZ — ileride "düzeltilmesi gereken fark" diye ele alınmaz. Her durakta fareyle de çerçeve istenirse `:focus-visible` yerine `:focus` kullanılır; bu ayrı bir karardır ve alınmadı. Odak çerçevesinin görünümünü (`--focus-ring` / `--focus-ring-offset`) artık ikinci bir tüketici de kullanır — yeni eklenen kalemin 2 saniyelik hücre işareti (2026-07-31); görünüm yine TEK yerde tanımlıdır, iki sebep aynı token'ları çağırır.

---

## TAŞINAN İÇERİĞİN HARİTASI (navigasyon — bu dosyada artık yok)
Bu dosyada eskiden karışık duran ekran/iş/auth detayları doğru evlerine taşındı:
- Giriş akışı · saha ana ekran · OCR sonuç ekranı · dönem ekranı → **docs/EKRAN-SAHA.md**
- Reddet/iade · dönem disiplini ve kapama · kategori sistemi · kiralama · avans · hot cost · vergi türleri · şirket kuralları · anomali → **docs/IS-KURALLARI.md**
- Onboarding · davet zinciri · multi-project · üyelik/silme → **docs/AUTH-KARARLARI.md**
- Tasarım/görev iş listesi → **docs/IS-SIRASI.md**
- Dil seçimi · mesai hesaplama · denetçi modu → **Faz 2** (CURRENT.md "Faz 2'ye Taşınanlar")

## Bütçe modülü — arayüz felsefesi taşındı (2026-07-14)
Giriş yapısı + altı arayüz ilkesi + açık tasarım notları → docs/butce/BUTCE-EKRAN-KARARLARI.md (§0). Bu dosyada yalnız pointer kalır, ekranlar-arası genel ilke değil bütçeye özel içerikti.

## Bütçe kart mimarisi (kart/kalem yapısı)
TEK KAYNAK: docs/butce/KART-KATALOGU.md — etap ekseni · kart=departman ("kullanan sahiplenir") · kalem davranış motoru (üç bağ + alias) · kilitli kartlar 1100-1600 · cost_object (4. eksen) · Compliance Guard. Gerekçe/eğitim: docs/butce/KART-GEREKCELERI.md.

## Kapandı — KART 1500 isim onarımı (2026-07-09 açıldı, 21 Temmuz 2026 kapandı)
Şablon aslından sapma incelendi; onarım gereksiz çıktı.

## Kapandı — Kalem Kütüphanesi/Kalibrasyon (2026-07-09 açıldı, D3b/D3c ile kapandı)
**KAPANIŞ NOTU (7 Ağustos 2026): bu kapının tahmini GERÇEKLEŞMEDİ — Açıklama kolonu serbest metin olarak KALDI, autocomplete Ad kolonuna gitti (D3-ARA/D3-UI). Kütüphane mimarisinin güncel evi: docs/butce/BUTCE-EKRAN-KARARLARI.md bölüm 16. Aşağıdaki metin tarihsel kayıttır.**
Açıklama kolonu serbest-metinden kontrollü seçime döner; her kütüphane kaydı kendi hesap parametrelerini taşır (statü, yük seti, bordro uygunluğu); yeni kalemler MMB koduna göre otomatik sıralanır. Ön koşul: 1500-serisi için içerik/küratörlük — Engin işi, kod bundan sonra başlar. Bordro'dan bağımsız, ayrı DILIM.

## İPTAL — Brüt/toplam üzerinden anlaşma girişi (2026-07-09)
4-alan giriş mimarisi sökülüyor. Geçici/manuel yol: kullanıcı neti girer, Brüt Toplam'ı izler, anlaşılan brüte oturana kadar neti ayarlar. İleride gerçek ihtiyaç ölçülürse (Zirve tipi "tahakkuk şekli" — kişi/kalem bazında bir kez seçilen sabit alan, canlı seçici DEĞİL) geri gelebilir; şimdi kurulmuyor.

## ✔ YAPILDI — input_mode/input_value mimarisi kaldırıldı (karar 2026-07-09, uygulama DILIM-3e ile tamamlandı)
Bordro kalemi artık istisna değil, DILIM-2f'nin genel deseniyle çalışır — Birim Net dönemsel girilir (budget_item_periods.unit_net_override), Net Toplam/Brüt Toplam her zaman hesaplanan/salt-okunur gösterilir. Gerekçe: üç turluk UI denemesi (segmented-toggle → dropdown) hem görsel hem algısal yük getirdi, kazandırdığı nadir bir ihtiyaç için sık kullanılan ekrana kalıcı karmaşıklık ekliyordu — fayda/maliyet dengesi tutmadı. input_mode/input_value kolonları DILIM-3e-1'de veri-sayım raporu sonrası DROP edilir.

## Ic maliyet tasarim gerekcesi olamaz (KARAR 2026-07-31, Engin)
Ic is yuku ve veri hacmi, kullaniciya GORUNUR bir sonucu yoksa tasarim gerekcesi olarak kullanilamaz. Somut tetikleyici: D3c tasarim oturumunda serbest kalemin "kalici bir muhtelif kodu yakmasi" bir guvenlik gerekcesi gibi sunuldu; oysa bu bizim defterimizdeki bir maliyettir, kullanici bunu hic bilmez. Dogru soru "kaza olursa KULLANICI ne yasar" sorusudur. Ic maliyetin tasarima girebilecegi tek yer, kullaniciya gorunur hale geldigi yerdir (ornekte: silinen kodlar geri verilmedigi icin No kolonunda kod bosluklari olusmasi - kozmetik, karar tasiyacak agirlikta degil).
