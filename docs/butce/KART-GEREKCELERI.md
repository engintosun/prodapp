# KAAPA — BÜTÇE KART GEREKÇELERİ ve EĞİTİM NOTLARI
*Bu dosya "NEDEN" dosyasıdır. KART-KATALOGU.md kuru kararı tutar (ne); burası muhakemeyi tutar (neden, sebep, sonuç, gerçek-set örneği, çift-sayım riski).*
*Amaç: eğitim/onboarding — yeni muhasebeci/yapımcı KAAPA'nın kart mantığını buradan öğrenir. "1507 neden 2200'den ayrı?" sorusunun cevabı kararın kendisinde değil, burada.*
*KART-KATALOGU.md ile çapraz: her kart KART-KATALOGU §7.x ile eşleşir. Oluşturma: 19 Haziran 2026. Kapsam: KART 1100, 1300, 1400, 1500.*

---

## ÇAPRAZ-DOĞRULAMA YÖNTEMİ (her kart için)
Kartlar tek kaynaktan değil, iki katmanlı doğrulamayla kuruluyor:
- **Koster (omurga):** Robert Koster MMB SuperBudget'ı tasarladı; KAAPA onu hesap-planı iskeleti alır (1100-6400 yapısı, hesap mantığı). Kart YAPISI Koster'dan gelir.
- **Master Excel (kütüphane eti + çapraz-doğrulama):** 4.746 kalem, 18+ kaynaktan (AICP 2023, Movie Magic, Eurimages, AFI, California Film Commission, 15 Saturation.io export'u [Netflix/BBC/HBO/CBC vb.], iki gerçek Türk yapım bütçesi). Her kalemin "kaç kaynakta geçtiği" sayısı, neyin evrensel neyin tek-kaynak olduğunu söyler.
- **Eurimages + Türk bütçesi (bağlam):** net-of-VAT, fringe-inclusive, sorumlu-tarafa-maliyet konvansiyonu — KAAPA'nın kilitli kararlarıyla örtüşür.

Bir kart kilitlenmeden önce: Koster omurgayı verir → Master Excel kaynak-sayısı doğrular (bu kalem gerçekten evrensel mi?) → Eurimages/Türk bütçesi bağlamı oturtur → sonra kilitlenir.

---

## KART 1100 — PROJE GELİŞTİRME ve HAKLAR  (KART-KATALOGU §7.1)

### Neden tek kart, neden recoupable?
Geliştirme dönemini diğer her şeyden ayıran tek şey **geri-ödeme (recoupable)**: proje henüz onaylanmadan (greenlight öncesi) yapımcı cebinden harcar — opsiyon bedeli, ilk senaryo revizyonu, teaser. Yeşil ışık yanınca bu cepten-harcanan tutar **kasadan/yatırımcıdan geri tahsil edilir**. Geliştirme orada biter; sonrası başka iştir.

**Sonuç:** Tüm geliştirme TEK kartta tutulur, genel kartlara DAĞITILMAZ. Neden? Çünkü greenlight'ta sistem "geri tahsil edilecek toplam: X TL" raporunu temiz üretebilsin diye. Eğer geliştirme harcamaları 15 ayrı karta dağılsaydı, recoupment toplamını toplamak kâbus olurdu. Tek kart = tek temiz toplam.

**Gerçek-set örneği:** Yapımcı 2 yıl önce bir romanın opsiyonunu aldı (50.000 TL), senaryo yazarına ilk taslak için ödeme yaptı (80.000 TL), Berlin'e pitch'e gitti (40.000 TL). Proje greenlight aldığında bu 170.000 TL kasadan yapımcıya geri döner. Bunların hepsi 1100'de durur.

### Neden 1108 (Travel&Living) salt-okunur tek toplam?
Geliştirmede yemek/ulaşım/konaklama set gibi gün/ay/adet kırılımıyla tutulmaz — proje-bazlı paket harcamadır. Kart yüzünde tek toplam görünür ("Seyahat, Toplantı ve Ağırlama"), alt-döküm arkada. Neden? Çünkü geliştirme dönemi seyahatleri (festival, pitch, ortaklık görüşmesi) dağınıktır; her birini ayrı satır yapmak gürültü yaratır, recoupment toplamını okumayı zorlaştırır.

### Neden plan + gerçekleşen ikisi de var?
Plan modu = fon başvurusu/sunum için öngörülen rakam (Eurimages'a "geliştirmeye şu kadar harcayacağız" demek için). Gerçekleşen modu = cepten fiilen çıkan. İkisi ayrı çünkü başvuru anında henüz harcanmamış olabilir ama bütçede görünmesi gerekir.

### Master Excel doğrulaması
Story Rights / Options / Film Rights / Literary Rights kalemleri Master'da geliştirme-hakları kümesinde toplanıyor — 1101'i doğruluyor. "Story & Other Rights" sadece [1k] (tek kaynak) — yani zayıf, ayrı kart hak etmiyor; bu da **1200 absorbe** kararını doğruluyor (aşağıda).

---

## KART 1300 — SENARYO YAZIM & YASAL TEMİZLİK  (KART-KATALOGU §7.2)

### Neden 1100'den ayrı, neden recoupable DEĞİL?
1100 = greenlight ÖNCESİ geliştirme hakları (recoupable). 1300 = fonlama SONRASI asıl yazım işi. Fark: 1300'deki para artık "cepten harcanıp geri alınacak avans" değil, projenin normal bütçe gideri. Bu yüzden recoupable değil ve geliştirmeye bağı yok — ayrı hesaplanır.

**Gerçek-set örneği:** Proje fonlandı. Artık asıl senaryo yazarı çekilebilir senaryoyu yazıyor (kaşe), hikaye editörü taslakları tamir ediyor, yasal temizlik yapılıyor. Bunlar 1300'de — geliştirme döneminin recoupable avansı değil, yapımın normal gideri.

### Neden 1200 (Story & Other Rights) AYRI kart açılmaz?
Koster'da "1200 Story & Other Rights" ayrı bir hesap. KAAPA'da AYRI kart açılmaz çünkü içeriği zaten ikiye bölünüyor: geliştirme-dönemi hakları → 1101 (recoupable), fonlama-sonrası yazım → 1300. Ortada boşta kalan, ayrı kart hak eden bir şey yok. Master Excel doğrular: "Story & Other Rights" sadece [1k]. Ayrı kart açmak boş kart taşımak olurdu.

### 1306 Legal Clearances — motorun İLK kurulu örneği (neden bu kadar önemli?)
Clearance (yasal hak temizleme: marka izinleri, müzik telifleri, görünen logoların izni) kalem davranış motorunun **üç bağının ilk gerçek örneği**:
- **Ait-kart = Senaryo:** Para 1300'de durur (clearance maliyeti senaryo işidir).
- **Onay-köprüsü = Hukuk (6200):** Parayı Senaryo tutar ama ONAYI Hukuk departmanı verir. Çünkü "bu marka izni gerçekten alındı mı?" sorusunu avukat cevaplar, muhasebeci değil. → "harcama-kartı ≠ onay-birimi" ilkesinin doğuşu.
- **Risk-bayrağı = E&O (6105):** Clearance alınmadıysa, E&O (Errors & Omissions) sigortası riski doğar. Film clearance'sız yayınlanamaz. Motor: "clearance eksik → sigorta riski" bayrağı çeker.

**Neden bu mekanizma?** Çünkü gerçek hayatta para bir yerde durur ama onu onaylayan/denetleyen başka biridir. Eski sistemler bunu yapamaz (para neredeyse onay da orada sanır). KAAPA bunu ayırır: tek fatura tek yerde (çift-sayım yok), ama görünürlük/onay başka departmanda.

### Master Excel doğrulaması
Script Clearance [2k], Clearance and Rights → 1306'yı doğruluyor. Writer / Writers Room / Script Polish / Readthrough → 1300 yazım kümesi. **ÖNEMLİ SINIR:** "Script Supervisor" [11k] (en evrensel ATL kalemi!) 1300'e AİT DEĞİL — o set/çekim devamlılığı tutan kişi, yazım değil. → 2100 Production Staff'a gider. Yazım (1300) ≠ çekim devamlılığı (2100). Bu ayrım kritik; karıştırılırsa en yüksek-kaynaklı kalem yanlış karta düşer.

---

## KART 1400 — YAPIMCI BİRİMİ ve FİNANSAL HAKLAR  (KART-KATALOGU §7.3)

### Neden tüm kart TAM MASKE (set rollerine kapalı)?
1400 projenin **"ticari yatak odası"**. İçinde ortaklık payları, şirket kârı (mark-up), overhead ve ajans komisyonları yatar. Set uzasa da, bütçe patlasa da bu kartın içeriğini UPM, 1.AD veya set muhasebecisi görmemeli. Neden? Çünkü bunlar yapımın operasyonel rakamları değil, yapımcının ticari sırları. Bir UPM'in "yapımcı bu projeden ne kadar kâr ediyor" bilgisine ihtiyacı yok — bu bilgi sızarsa pazarlık/moral/rekabet sorunu olur.

**KRİTİK AYRIM (DB ≠ UI):** Bu bir "kör nokta" DEĞİL. Veritabanı seviyesinde Muhasebe rolü 1400'ü tam görür, faturayı işler, KDV'sini girer — çünkü muhasebenin göremediği para = denetlenemeyen para = KVKK/denetim sorunu. Maske sadece ARAYÜZDE, sadece set rollerine. Set alanında bütçe ekranı açıkken istenmeyen gözler hassas rakamı görmesin diye. Muhasebe panelinde 1400 normal görünür; UPM panelinde flu/asma-kilit.

### A/B/C/D gruplaması neden var? (cost_type'a göre)
Gruplar kozmetik değil, **fringe motoruna makine-okunabilir kural** veriyor:
- **A (1401-03) İşçilik kaşeleri:** fringe BİNEBİLİR (kişiye ödeme). Yapımcı emeği.
- **B (1404-05) Şirket geliri/yüzde:** fringe BİNMEZ (şirket faturası). Overhead + kâr.
- **C (1406) Komisyon:** fringe BİNMEZ (ajans faturası).
- **D (1407-09) Operasyonel gider:** seyahat/sekretarya/ağırlama.

Motor "bu kalem hangi grupta?" diye bakıp fringe'i otomatik açar/kapatır. Eğer gruplama olmasaydı, motor şirket faturasına SGK yüklerdi → çift-vergilendirme.

### 1401 neden tek kalem + rol-etiketi?
Koster uyarıyor: yapımcı unvanları (Executive/Line/Coordinating/Supervising) yazım varyantı değil, GERÇEK hukuki rol. Ama Türk bağımsız yapımda çoğu zaman aynı kişi birkaç rolü taşır. Çözüm: tek "Yapımcı" kalemi + rol-etiketi. Pratikte tek kişi → tek etiket; büyük yapım/dizide ayrışırsa → aynı kalemde iki etiket. Katlama doğru ama etiket gerçek ayrımı korur.

- **Executive Producer:** parayı sağlayan/getiren.
- **Line Producer (Uygulayıcı):** estetik ↔ finans köprüsü; seti kurar, bütçeyi yönetir.
- **Coordinating/Supervising:** ara katman yönetim rolleri.

### 1403 ↔ 1405 ayrımı — Eurimages'ın zorladığı incelik
1403 = yapımcının kreatif EMEK bedeli (şirket kârı HARİÇ). 1405 = şirket KÂRI/mark-up. Neden ayrı? Eurimages mantığında emek ≠ kâr ayrışır: fon, yapımcının projeye verdiği şahsi kreatif emeği (1403) bütçelemeyi zorunlu tutar ama bunu şirket kârından (1405) ayrı ister. Aynı yapımcı iki ayrı satırdan alır: emek + kâr.

**Anomali bağı (gizli kâr transferi):** Yapımcı şirketi üzerinden hem 1403 (emek) hem 1405 (kâr) faturalanmışsa, karşı taraf (stüdyo/platform) bunu "gizli kâr transferi" olarak yorumlayabilir. Motor bunu görünür kılar (teşhis) — ama gizleme yöntemi ÖNERMEZ (sınır kuralı, aşağıda).

### 1407 ↔ 1409 sınırı — neden ayırdık? (çift-sayım önleme)
İkisi de yapımcı kartında, ikisi de aynı seyahatte olabilir. Cannes'da yatırımcıyla yenen yemek hangisine? Sınır: **1407 = kendi ekibimizin gideri** (uçak/otel/yol/yol-üstü yemek), **1409 = karşı tarafı ağırlama** (yatırımcıya/platforma ısmarlanan, temsil, hediye). Cannes'da kendi yemeğin → 1407; yatırımcıya ısmarladığın → 1409. Bu net kural olmasaydı aynı seyahat fişi iki yere bölünür → çift-sayım veya kayıp.

**1108 ile çakışma çözümü:** Geliştirme dönemi yapımcı seyahati 1108'e (recoupable), yapım dönemi 1407'ye. Etap ayrımı çözer.

### Compliance Guard — neden "teşhis evet, gizleme hayır"? (KAAPA'nın varlık nedeni)
Yapımcı bir Hedef Mecra seçer (Eurimages/Netflix/TRT/Bakanlık). Motor o şablonun sınırlarına göre denetler. Ama KRİTİK sınır:

**KAAPA riski ve görünürlüğü gösterir, gizleme/kaçırma yöntemi ÖNERMEZ.**
- ✓ "Eurimages overhead %7'yi aşıyor, başvuru reddedilebilir" (teşhis — yapımcıyı hatadan korur)
- ✓ "Bu fark dışarıdan görünür durumda" (görünürlük — rakibin gözünü verir)
- ✗ "Bu %15 fazlayı şu kalemlere böl, platform fark etmesin" (gizleme reçetesi — YAPMAZ)

**Neden bu sınır KAAPA'nın çekirdeği?** KAAPA'nın varlık nedeni şüpheli işlem TESPİTİ. Eğer aynı motor hem "şüpheli işlemi yakala" hem "şüpheli işlemi gizle" yaparsa, ürün kendi kendiyle çelişir. Bir platform/fon, KAAPA'nın "gizleme önerdiğini" duyarsa, KAAPA kullanan HER yapımcının bütçesine güvenmez. Şeffaflık-danışmanı konumu = KAAPA'nın ticari değeri. Gizleme-önerisi tüm kullanıcı tabanının güvenilirliğini zehirler.

**Neden kurallar koda gömülmez?** Netflix politikası, Eurimages oranları yıldan yıla değişir. Koda gömülürse eskir, yanlış uyarı verir, yapımcıyı yanlış yönlendirir → sorumluluk doğar. Bu yüzden `compliance_rules` veri tablosu (güncellenebilir, kaynak-tarihli) + her uyarıda "kaynak X, doğrulayın" notu.

### Production Executive neden gizli alias?
Koster'ın "Production Executive"i (şirket↔stüdyo irtibatı, yapılabilirlik kararı) Türk bağımsız yapımda zayıf karşılık bulur. Tamamen silmek yerine gizli alias: kart yüzünde görünmez (Faz 1 sade kalır), ama dizi/platform yapımında çağrılınca açılır (mimari hazır). Silmek yerine gizlemek — ileride gerekince eklemek kolay olsun diye.

### Master Excel doğrulaması
Producer [10k], Line Producer [9k], Executive Producer [8k], Co-Producer [4k], Supervising/Coordinating Producer [3k/2k] → A-grubu tam doğrulanıyor. D-grubu Master'da kanıtlı (sezgisel değil): Producers Car/Transfers, Producers Living Expense, Producers Entertainment, Producers Secretarial, Producers Assistant, Producer Overhead, Advances (Producers). **SINIR:** Production Coordinator [10k], Production Manager [8k], UPM [4k], Production Secretary [4k], PA/Runner → bunlar 1400 DEĞİL, 2100 Production Staff. 1400 = yapımcı KAŞELERİ; 2100 = yapım OPERASYON ekibi. (UPM zaten görünürlük kararında "set rolü" = 1400'ü göremeyen taraf; tutarlı.)

---

## KART 1500 — YÖNETMEN ve KREATİF REJİ EKİBİ  (KART-KATALOGU §7.4)

### Neden KISMİ MASKE (1501 gizli, ekip açılabilir)?
Yönetmen kaşesi (1501) hassas ATL kreatif maliyet — set rollerine gizli. Ama ekip satırları (koreograf, storyboard, diyalog koçu) operasyoneldir; UPM "koreograf ne zaman geliyor, ne kadar" bilmeli ki planlasın. Bu 1300'ün aynası (1306 açılır, yazar kaşesi gizli) ve bir GENEL DESEN:

**ATL baş-kaşe deseni:** ATL kartlarında baş-kaşe (yönetmen 1501, yazar kaşesi, yıldız kaşesi) set rollerine daima gizli; operasyonel/ekip satırları yapımcı isterse salt-okunur açılır. **Not: baş-kaşe ÇOĞUL olabilir** — birden fazla başrol, hatta birden fazla baş-yönetmen (ortak yönetmenlik) olabilir; hepsi gizli sınıfındadır. Bu desen 1600 Cast'e de uygulanacak (yıldız kaşesi gizli, figüran/set öğretmeni açık).

### Loan-Out / ödeme-statüsü — KAAPA'nın fringe modelinin doğuşu (en önemli kavram)
Koster'ın "loan-out" dediği şey KAAPA için fringe motorunun TEMEL ayrımı. Çoğu yönetmenin/büyük oyuncunun gelirini aldığı bir şirketi vardır; yapımcı kişiyle değil, şirketiyle sözleşir.

**Neden bu KAAPA için yapısal?** Bir kişiye ödeme yapılırken, fringe (SGK işveren payı + stopaj) kişinin çalışma STATÜSÜNE göre değişir:
- **Bordro:** işveren SGK payı + stopaj bütçeye biner (fringe VAR).
- **SMM (Serbest Meslek Makbuzu):** fatura + KDV; fringe BİNMEZ (yük faturada).
- **Şirket-faturası:** fatura + KDV; fringe BİNMEZ.
- **Loan-out (TR: şahıs/limited şirketi):** faturaya öder; bazı durumlarda SGK kişi adına ayrı bildirilir (Koster notu: bazı sendikalar fringe'i doğrudan kendilerine ödetir, üye gelir kaydı doğru olsun diye).

**Sonuç (mimari):** Her işçilik kalemine "ödeme-statüsü" etiketi eklenir. Bu etiket fringe'in hesaplanıp hesaplanmayacağını belirler. Eğer bu boyut olmasaydı, sistem her işçilik kalemine körü körüne %35 fringe eklerdi → fatura kesen yönetmene SGK yükü biner → bütçe yanlış şişer + çift-fringe guard çalışamaz.

**Anomali bağı (çift-fringe guard):** "Fatura kesen kişiye fringe DE Mİ yüklenmiş?" → çift-sayım bayrağı. Bu, 1400'deki çift-fringe guard'ın işçilik tarafındaki kardeşi. Eurimages "fringe-inclusive" kilidiyle doğrudan bağlı.

### 1507 Konsept Sanatçısı — neden 2200'den ayrı? (çift-sayım önleme)
Konsept sanatçısı iki yerde çalışabilir: (a) yönetmen için greenlight öncesi vizyon/moodboard ("filmin dünyası nasıl görünecek"), (b) Sanat Departmanı için prep'te gerçek dekor/set tasarımı. Aynı iş gibi görünür. Sınır koymazsak aynı konsept çalışması hem 1507 hem 2200'e yazılır → çift-sayım. Karar: **1507 = sadece yönetmen erken-vizyonu** (greenlight öncesi), prodüksiyon tasarımı → 2200. İkisi alias ile bağlı (birbirini işaret eder, kopyalamaz).

### Milestone uyuşmazlık denetimi — neden 1501 ↔ 5100?
Koster: "yönetmen EN ÇOK kurgucuyla çalışır." Bu, çekim ile post-prodüksiyon arasındaki köprü. Yönetmen kaşesi genelde taksitli ödenir, taksitler teslim kilometre taşlarına bağlı ("kaba kurgu onayı faturası"). Motor: 1501 hakediş taksiti girildiğinde 5100 Kurgu kartındaki onay tikini denetler. Kaba kurgu teslim edilmeden fatura işlendiyse → erken ödeme/sözleşme ihlali uyarısı. Bu, 1403'teki mahsup denetiminin yönetmen versiyonu.

### Crew Overlap Guard — neden GENEL kural (sadece 1500 değil)?
1504 (diyalog koçu) veya 1505 (özel asistan) paket ücretle çalışırken, set başlayınca operasyonel set ekibinde aynı isim haftalık maaşla listelenirse → aynı kişi iki koldan para alıyor (çift maaş). Ama bu sahtekarlık/hata HER YERDE olur — bir kişi hem kamera hem grip kartında, hem ATL hem BTL'de görünebilir. Bu yüzden Crew Overlap GENEL motor kuralı: tüm kartlarda "aynı isim iki kartta maaş alıyor mu?" taraması. Sadece 1500'e özel değil.

### Master Excel doğrulaması
Storyboard Artist [8k], Script Timing [6k], Dialogue Coach [4k], Choreographer (Koster) → 1500 ekibini doğruluyor. "Storyboard for development" vs "Storyboard Artist" Master'da ayrı geçiyor — tam bizim 1506 ↔ 1300 alias kararı (geliştirmede başlayan storyboard ile yönetmen storyboard'u arasında mükerrer denetimi). 2nd Unit Director → 1502 (kaşe); ekip/ekipman 4200'de (ayrı).

---

## GENEL EĞİTİM NOTLARI (tüm kartlara yayılan kavramlar)

### Kalem davranış motoru — neden "not alanı" sadece metin değil?
Eski sistemlerde bir bütçe satırının yanındaki not alanı serbest metindir ("şunu unutma"). KAAPA'da not alanı kalemin KURAL/UYARI/ALT-YAPI motorudur: üç bağ (ait-kart, onay-köprüsü, risk-bayrağı), alias, ödeme alt-kolonları, recoupable/iade/depozito ailesi, salt-okunur toplam, ödeme-statüsü. Davranış kanonik ATOMDA tanımlıdır; kalem atomu çağırınca otomatik miras alır (her seferinde elle kurulmaz).

### Alias — neden "işaret eder, kopyalamaz"?
Sektörün en sık hatası çift-sayım: aynı para iki kartta toplanınca bütçe şişer. Bir kalem başka kartı kopyalarsa bu olur. Bunun yerine kalem başka kartı İŞARET eder: tek fatura tek yerde (toplam doğru), diğer kart "bakar ama içine almaz". Getirisi: doğru toplam + iki açıdan görünürlük + tek kaynak (rakam tek yerde güncellenir, kopya tutarsızlığı olmaz).

### Etap (dönem) ≠ Kart (departman) — neden iki ayrı eksen?
Kart = NEREYE ait (departman, kalıcı ev). Etap = NE ZAMAN ödeniyor (zaman etiketi). Bunlar çakışmaz. "Geliştirme hem dönem hem kart olamaz" çelişkisi bu ayrımla biter: Geliştirme bir ETAP'tır (zaman), ama harcaması "Proje Geliştirme ve Haklar" KARTI'nda durur (yer). Bir kalem birden çok etaba yayılabilir (hak bedeli Geliştirmede başlar, opsiyon ödemesi Dağıtıma sarkar) ama tek kartta durur.

### Kullanan sahiplenir — neden kategori-bazlı sabit kural YOK?
Bir kaynağı günlük kim kullanıyorsa satır onun kartına yazılır. "Araç hep Ulaşım'a gider" gibi sabit kural YOKTUR: kostüm kamyonu → Kostüm; genel havuz aracı → Ulaşım; vinç şoförü → Grip; inşaat aracı → İnşaat. Neden? Çünkü gerçek sette bir kaynağın maliyeti onu kontrol eden departmanın sorumluluğudur; kategorisi değil kullanımı belirler. Bu, departman bütçe sorumluluğunu gerçeğe uydurur.
