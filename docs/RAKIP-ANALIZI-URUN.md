# KAAPA Rakip Analizi — Yapim Yonetimi Yazilimlari (Urun / Bilgi Mimarisi)

**Tarih:** 4 Agustos 2026
**Amac:** Rakip yazilimlarin bilgi mimarisi, kabuk/gezinme yapisi, yetki modeli ve butce yaklasimi; KAAPA icin alinacak ve kacinilacak desenler.
**Kapsam notu:** Bu dosya URUN ve EKRAN mimarisi eksenidir. Harcama/OCR ekseni ayri dosyada: docs/RAKIP-ANALIZI-OCR.md.
**Yontem:** Kaynak kodlar kapali. Inceleme kod okuma degil DAVRANIS ve VERI MODELI incelemesidir: deneme surumu, ekran goruntusu turu, yardim metinleri.
**Statu:** Bu dosya BULGU tutar, KARAR tutmaz. Buradan dogan kararlar kendi ev dosyalarina yazilir (TASARIM-KARARLARI, BUTCE-EKRAN-KARARLARI, EKRAN-MUHASEBE, IS-SIRASI).

---

## 1. YAMDU

**Kaynak:** app.yamdu.com, ucretsiz deneme hesabi, bos proje (Feature movie) + Yamdu demo projesi ekranlari. 126 ekran goruntusu, 2-3 Agustos 2026.

### 1.1 Kabuk: uc katman, tek ust cubuk
- Uc ayri dunya var: KULLANICI ayarlari (ray yok, duz liste), SIRKET (ornekte "Oropa"), PROJE.
- Ust cubuk uc dunyada da AYNI ve sabit: My Calendar · Projects (acilir) · Sirket adi (acilir) · bildirim · avatar.
- Sirket ve proje dunyalarinin her birinin KENDI sol rayi var; rayin tepesinde cikis dugmesi duruyor ("Exit company" / "Exit project").
- Dunya degistirmek kabugu degistirmiyor, yalniz sol rayin icerigini degistiriyor.
- Proje degistirme ust cubuktaki Projects menusunden: son kullanilan projeler + tum projeler + yeni proje.
- Sirket menusu (sirket dunyasinin kisayolu): Access rights, Address Book, Company Files, Company Tasks, Company Calendar, Production Calendar, Payroll Library, Actor/Location/Costume/Prop Database, Projects, Project Templates, Subscriptions, Settings.

### 1.2 Gezinme uc kademeli
- 1. kademe SOL RAY = modul. Gruplu ve gruplar acilir-kapanir: GENERAL · BREAKDOWNS & MORE · PLANNING · DEPARTMENT SPECIFIC · POST PRODUCTION · MORE. Yaklasik 30 durak tek listede; gruplama olmadan tasinmaz.
- 2. kademe UST SEKME = modulun bolumleri (ornek: Crew > Crew list / Access rights / External contacts / Recruitment / Departments / Units).
- 3. kademe ALT SEKME = bolumun kirilimi (ornek: Production design elements > All / Constructions / Set dressings / Props / Graphics / Vehicles).
- Bazi modullerde 4. kademeye cikiyor (Travel > Accommodation > Accommodation / Vendors).
- Ray tumden daraltilabiliyor; daralinca yerinde dikey ikon seridi kaliyor.
- Ekmek kirintisi ust sekmenin ustunde duruyor (Crew > Crew list).

### 1.3 Menuyu kullanici kendisi duzenliyor
- MORE grubunun altinda "Edit menu" duragi var. Her modul icin uc secenek: yildiz = birinci seviyede gorun, uc nokta = More altina in, goz = bu bolumde yalniz okuma yetkim varsa More altina in.
- Ayar metni "for all your projects" diyor: tercih KULLANICIYA ait, projeye degil.

### 1.4 Tanimlar TEK yerde degil, IKI katmanda
- Module ozgu tanimlar modulun KENDI "Settings" sekmesinde yasiyor: Environment types (DAY-EXT/DAY-INT/NIGHT-EXT/NIGHT-INT, renkleriyle), Breakdown mode (senaryolu / senaryosuz calisma), Production stages (Development, Preproduction, Production, Picturelock, Financing, Postproduction, Sound, Distribution, Marketing — siralanabilir), uretim tasarimi kategorileri, takvim kategorileri, butcede Tools > Fringes / Groups / Globals.
- Projeler arasi ortak tanimlar SIRKET katmaninda: Payroll Library, Actor/Location/Costume/Prop Database, Project Templates.
- KAAPA notu: bu, "tek ortak Tanimlar alani" fikrine KARSI bir emsaldir. Rakip, ekran-ayari ile kurum-kutuphanesini bilincli olarak ayirmis.

### 1.5 Yetki modeli uc seviyeli ve her zaman yuzeyin ICINDE
- Yuzey seviyesi: her ekranin sag ustunde kilit + avatar + sayi rozeti. Tiklaninca "Access rights: <ekran adi>" modali aciliyor; filtre No access / Read / Write, kisi listesi departmana gore gruplu, satirda Admin etiketi.
- Alan-grubu seviyesi: kisi kartinda bloklarin basinda ayri kilit ve aciklama ("yalniz 'sensitive crew information' yetkisi olanlar gorur", "yalniz 'eating habits' yetkisi olanlar gorur"). Beden olculeri, ehliyet, beslenme kisitlari bu sekilde ayri korunuyor.
- Kisi seviyesi ozeti: Crew > Access rights sekmesinde kisi basina "Files & Documents x16 · Sensitive information x10 · Company database x5" sayaclari ve "Project access until" (SURELI erisim).
- Sirket seviyesinde ayrica alan-alan ikon seridi (her alan icin kalem/goz rozeti).
- Pozisyona gore ON DOLU yetki: kullanici projeye eklendiginde pozisyonuna gore otomatik okuma/yazma aliyor, sonradan degistirilebiliyor.
- Destek erisimi: proje ayarlarindan Yamdu destegine 24 saatlik gecici admin yetkisi verilebiliyor, istenirse erken kaldirilabiliyor.

### 1.6 Butce modulu (Budgeting)
- Rayda PLANNING grubunda TEK durak; ayri bir dunya degil.
- Ekranda kalici uyari: ozellik surekli yayilimda ve "yalniz basit butceler" icin dusunulmus.
- Senaryo modeli: Create budget scenario > ad + para birimi (uzun liste, TRY dahil) + Type: Estimate / Actual + Status: Draft / In progress / Final / Locked + "baska bir senaryoyu sablon olarak kullan".
- Senaryo ici: solda Grand Total + kategori agaci, ortada Top sheet tablosu (Account · Name · Subtotal · Fringes total · Total), ust seritte Renumber · Search · Export · Add · Tools · Comments · yetki rozetleri.
- Bos butcede uc yol: Add category · Import Showbiz Budgeting UBX · Import Movie Magic Budgeting XML. Ikisinde de "Only structure" / "Structure and details" secimi ve "XML Advanced olarak disari al, basit XML fringe ve grup atamalarini tasimaz" uyarisi. Ithal edilen tutarlar senaryonun secili para biriminde gosteriliyor.
- Tools uc sekme: Fringes · Groups · Globals. Fringes ayrica disaridan ithal edilebiliyor.
- Detay satirinda ayri pencerede acma ikonu.
- KAAPA karsiliklari: Status=Locked ~ MUHUR; Fringes ~ yasal yuk kovasi; Globals ~ oran katalogu / dinamik deger; senaryo ~ butce versiyonu; Account agaci ~ kart/kalem kodu.

### 1.7 Ayni butce kalibi baska eksende tekrar ediyor
- Sustainability modulunde CO2e butcesi ayni desende: Account · Name of activity · CO2e · Status (Approved / Omit / In review) · Country · Type; ust seritte CO2e toplami, aktivite sayisi, kullanilan hesaplayici profili (KlimAktiv).
- Yani "butce" urunde tek module ait bir ekran degil, tekrar eden bir KALIP.

### 1.8 Finansman ayri modul (Financing plans)
- Finansman ortaklari kart kart: rol (Producer/Capital resources), Status (negotiation / approved), Planned share % · Confirmed share % · Planned amount · Confirmed amount.
- Altta Needed amount / Planned total / Confirmed total ve tek cumlelik ozet ("planin yuzde 40'i guvence altinda") + Analysis bolumu.
- Plan nesnesinin kendi Access rights bloku var: "Editable by" avatar seridi, "Readable by" ayri satir.

### 1.9 Time cards ve onay zinciri
- Uc sekme: Personal time cards (kilitli) · Daily time cards (kilitli) · My time cards. Kilit ikonu sekme adinin yaninda, yetkiye baglilik gorunur.
- Satirda gun tipi, Work status (Off / Work (W) / Prep / Wrap / Travel / Hold / Vacation / Sick / Idle / Rehearsal / Fitting), dort asamali nokta zinciri (Approval progress) ve Status (Draft).
- Haftalik toplu serit: hafta sonu tarihi, gonderilen gun sayisi, onaylanan gun sayisi, calisilan saat, fazla mesai/gece saati ve "haftanin kalan gunlerini onayla" dugmesi.
- Urun tanitiminda zincirin tam hali gorunuyor: kullanici gonderir > departman onayi > yapim onayi > muhasebe dogrulamasi ve kilitleme > odendi isaretleme; her adimda yorum ve gecmis.

### 1.10 Dosyalar, dagitim, ekip
- Files & Documents "oda" mantiginda: yapi proje turune gore OTOMATIK doguyor (Script & Development, Sent Call Sheets, Contracts...), kullanici kendi odasini da kurabiliyor. Odalar ic ice (Contracts > Cast / Crew / Insurance / Locations / Rights / Overall financing / Production design / Misc).
- Her dosya ve oda kendi yuzeyinde: Mark (yildiz), Item seen by, Access rights, Links, My created tasks, Comments.
- Distribution: File distribution · Announcements (Sent / Draft) · Mailing lists · Templates. Sablonlar duyuru, dosya paylasimi, cagri kagidi ve seyahat icin ORTAK.
- Crew: Crew list · Access rights · External contacts · Recruitment · Departments · Units. Departman ayni zamanda bildirim hedefi (yorumda @departman etiketleyince herkese bildirim). External contact = projeye erisimi olmayan ama listede gorunebilen kisi. Kisi karti sekmeleri: General · Contract · Staff form · Time Tracking & Payroll · Note · Notifications.

### 1.11 Proje ayarlari
- Sekmeler: Settings · Payroll · Episodic features · Export · Emails · Subscription · Support.
- Settings icinde "Sections": projede hangi modullerin AKTIF olacagi secilir. Ayrica proje adi, proje rengi (paletten), proje logosu, proje para birimi, calisma takvimi.
- Export sekmesi PDF ustbilgisi ve filigran ayarlarini tutuyor; Emails sekmesi gonderen adi ve e-posta ustundeki logoyu.

### 1.12 Bos durum ve ogretme deseni
- Her modulun bos hali ayni kalipta: tek cumlelik deger onermesi (buyuk punto) + TEK birincil dugme + altinda o modulun DOLU halinin gercek ekran goruntusu.
- Ilk girislerde adim adim balonlu tur (1/8, 1/4, 1/3 sayaclariyla), "hayir tesekkurler, biliyorum" cikisiyla.
- Dashboard'da kapatilabilir "Where to start?" kartlari (Script / Shooting scheduling / Production calendar), altinda My tasks · Marked by me · What's going on? akisi.

### 1.13 KAAPA icin cikarimlar (gozlem, karar DEGIL)
- Sol ray + gruplu basliklar + daraltma: CARD-DESK kararimizi disaridan dogruluyor.
- Ikinci kademe UST SEKME: bugun muhasebe ve butce ekranlarina sizmis alt navigasyonun aradigi cozum bu kademedir.
- "Sections" ayari: bizim "modul acik mi bayragi" acik kaleminin emsali; evi proje ayarlari.
- Tanimlarin iki katmanli olmasi: "tek ortak Tanimlar" egilimimize karsi emsal; ekran-ayari ile kurum-kutuphanesi ayrilmis.
- Yetkinin yuzey icinde ve alan-grubu seviyesinde olmasi: bizim rol/RLS modelimiz bugun daha kaba; kisisel veri (KVKK) tarafinda dogrudan ise yariyor.
- Sureli proje erisimi ve destege gecici admin: bizde hic dusunulmemis iki desen.
- Butce onlarda acikca zayif ve kendileri de soyluyor; KAAPA'nin farklilasma alani tam burasi.

### 1.14 Bu turda GORULMEYENLER (sonraki tura)
- Ikinci kullanici ile gercek yetki davranisi (Read/Write ile ekranlarin daralmasi).
- Butcede kalem ekleme, detay satiri, Fringes/Globals'in bir kaleme baglanmasi.
- Senaryonun Locked haline getirilmesi ve kilitli ekranin davranisi.
- Time card gonderme ve onay adimlarinin fiilen calistirilmasi.
- Sections ile modul kapatmanin raya etkisi.
- Payroll ve Episodic features sekmelerinin icerigi.
- Sirket katmanindaki Payroll Library ve veri tabanlarinin icerigi.

### 1.15 Mobil gorunum (iPhone/Safari, 4 Agustos 2026)

- **Alt sekme cubugu YOK.** Yamdu telefonda ayri bir mobil navigasyon kurmuyor; ayni sol ray CEKMECE olarak yasiyor. Sol ustte hamburger (uc cizgi), tiklaninca ray soldan kayarak geliyor, ekranin yaklasik yuzde 70'ini kapliyor, arkasi karariyor.
- Cekmecenin ici masaustuyle BIREBIR ayni: tepede "Exit project" + proje kimligi (logo + ad + "Feature movie (cinema)"), altinda Dashboard, sonra GENERAL grubu (Crew, Time cards, Files & Documents, Distribution, Tasks, Calendar, Project settings) ve devami. Durak kirpilmasi, mobile ozel kisaltilmis menu YOK.
- **Ust cubuk korunuyor, sariliyor:** bildirim ve avatar ust satirda, My Calendar · Projects · Sirket adi bir alt satirda. Projects menusu masaustuyle ayni (son kullanilan proje + tumu + yeni proje).
- **Sirket menusu mobilde IKI KOLONLU grid'e donuyor** ve basliklaniyor: GENERAL · PLANNING · DATABASES · ADMINISTRATIVE. Masaustunde tek uzun dikey listeydi. Kazanc gruplama, kayip okunabilirlik: etiketler kesiliyor (Access r... / Compan... / Project T... / Prop Dat...). DERS: dar ekranda iki kolon etiket kirpiyor; tek kolon + grup basligi daha guvenli.
- **Icerik tek kolona iniyor, duzen degismiyor.** Dashboard kartlari (My tasks, My created tasks, What's going on?) alt alta diziliyor; kart ici duzen ve metinler masaustuyle ayni. "Creat..." gibi dugme etiketleri burada da kirpiliyor.
- Proje disi ev ekrani telefonda da kisisel pano: "For me" basligi, deneme suresi uyarisi, abonelik karti, "Last used Projects" ve altinda sirket menusu grid'i. Dunya secim ekrani YOK.
- **KAAPA notu:** Bu bulgu, muhasebe/butce tarafinin telefonda cekmece rayla calisabildigini gosterir; ayri bir mobil bilgi mimarisi kurmaya gerek yoktur. KAAPA'nin alt navigasyonu SAHA yuzeyine aittir (Engin karari, tekrar teyit 4 Agustos 2026) ve muhasebede yoktur; Yamdu'nun mobil turu bu karari degistiren bir sey soylemez, cunku Yamdu'nun mobil kullanicisi ofis kullanicisidir, saha kullanicisi degil.

---

## 2. DIGER RAKIPLER

Bu eksende (bilgi mimarisi / kabuk / gezinme) baska rakip henuz incelenmedi. Ama KAAPA'nin aylardir biriken rakip bulgulari VARDIR; hepsi karar dosyalarinin icinde, KARARIN GEREKCESI olarak yasar.

**Tasima yapilmadi (karar, 4 Agustos 2026, Engin):** bu bulgular serbest arastirma notu degil, alinmis kararlarin dayanagidir; yerlerinden cikarilirsa kararlar gerekcesiz kalir, kopyalanirsa iki kaynak olur ve biri bayatlar. Bu bolum TASIMA degil ADRES tutar. Yeni bulgu bir kararla birlikte dogduysa yine kendi karar dosyasina yazilir, buraya yalnizca adresi eklenir.

### 2.1 Nerede ne var

- **docs/RAKIP-ANALIZI-OCR.md** (15 Mayis 2026, 261 satir) — harcama/OCR ekseni: global ve yerel masraf otomasyonu firmalari, OCR dogruluk oranlari, confidence yaklasimlari, onay akislari, KAAPA icin cikarimlar. Urun/ekran mimarisi ICERMEZ.

- **docs/butce/KART-GEREKCELERI.md** — kart yapisinin neden-defteri; en yogun rakip icerigi burada:
  - Koster / MMB SuperBudget omurgasi: hesap plani iskeleti (1100-6400) buradan alindi.
  - Kutuphane kaynak listesi: 4.746 kalem, 18+ kaynak (AICP 2023, Movie Magic, Eurimages, AFI, California Film Commission, 15 adet Saturation.io exportu).
  - ATL/BTL sinirinin konvansiyon oldugu tartismasi (Koster'in kendi metnine dayanir).
  - Figuranin Oyuncu departmani altinda kumelenmesi karari: gerekce "Saturation ve MMB de ayri ust-hesap yapmaz".
  - cost_object karari: emsal "MMB Set / Saturation Tag", endustri standardi; kart sinirini asan maliyetler icin transversal eksen.

- **docs/butce/BUTCE-EKRAN-KARARLARI.md bolum 16** — butce ekrani kararlarinin gerekce hatti:
  - M2 (butce erisimi rol degil ayri yetki ekseni): sektor taramasina dayanir — Saturation erisim modeli, MMB/MMS izin seviyeleri, Hot Budget dosya-paylasimi.
  - Elle siralamanin (surukle-birak) bilincli kapali olmasi: "MMB'de de yok, sektor alisik".
  - Kalem adinin serbest olmasi: melez MMB modeli (satir once bos dogar, sonra adlandirilir) degerlendirildi ve reddedildi.
  - Hizli ekleme odasi deseni: 30 Temmuz 2026 taramasi ayni desenin Showbiz'de zaten var oldugunu gosterdi (yuzey karari kendi basimiza alinmisti, tarama sonradan dogruladi).

- **docs/butce/BUTCE-ARASTIRMA-DURUM.md** — kalem/sablon arastirmasinin sayisal tarafi: 18 kaynagin parse sonuclari (MMB template 457 kalem / 42 hesap, Eurimages 462, AICP 326, AFI 229), ekip+ekipman kuralinin MMB ve Eurimages emsali, uzun kuyrugun kaynaklara yayili gercek dagilimi.

- **docs/butce/KART-KATALOGU.md · BUTCE-SEMA-KARARLARI.md · BUTCE-UI-MIMARISI.md** — tek tuk emsal atiflari (ornegin Saturation globals deseni). Icerikleri bu turda ayrica okunmadi, ihtiyac aninda aranir.

- **docs/TASARIM-KARARLARI.md · docs/ARCHITECTURE.md** — kendi bulgulari yok, yalnizca RAKIP-ANALIZI-OCR.md'ye atif yapar.

### 2.2 Kaydi olmayan tur (uyari)

EKRAN-HİSSİ TURU — BULUNDU (14 Haziran 2026; kayıt: claude.ai/chat/842c8657). Önceki not turun kaybolduğunu söylüyordu, yanlıştı. Turun bulguları:
- Movie Magic Budgeting: sektör standardı. Açılışta anahat + satır satır hesaplar, kat kat detay. Ekran, doldurulacak bir tablo duvarıdır.
- Saturation: bulut tabanlı, daha temiz; omurga aynı — satır tablosu, departmanlar alt alta, hepsi tek ekranda.
- YNAB: hissin ödünç alındığı yer — kategori-önce, sade, kurs gerektirmeyen. Şerh: YNAB de aslında bir liste/tablodur.
- Sonuç: yapı rakiplerden (departman/kategori), giriş hissi onlardan DEĞİL. Kart masasının en yakın akrabası bir bütçe yazılımı değil, telefon uygulamasının ana ekranıdır.
- Kayda geçen takas: tablo duvarı ağır toplu girişte işe yarar; kart odak ve sakinlik verir ama "hepsi tek ekranda"yı feda eder. O gün "hızlı toplu ekleme kolaylığı bir köşede tutulmalı" diye not düşülmüştü — bu endişe D3b hızlı ekleme yüzeyiyle KARŞILANMIŞTIR.
- Kapak rakamına etkisi: kart masası SIFIR rakamla doğmuştur (12 Haziran 2026 wireframe onayı: "sade kartlar — işaret + isim, rakam yok"). Tek rakama çıkış, 4 Ağustos itirazıyla verilmiş bir tavizdir; üçe çıkarmak top sheet'i masaya geri kurmak olurdu.

## 3. MOBIL DESEN TARAMASI (8 Agustos 2026)

KAYNAK UYARISI: asagidaki bulgular ureticilerin kendi pazarlama/karsilastirma sayfalarindan derlendi. Urunler uzerinde BAGIMSIZ GOZLEM YAPILMADI — Yamdu (§1.15) haric. Dogrulanmadan tek basina karar gerekcesi olarak kullanilmaz.

- Saturation: tarayici tabanli, telefonda/iPad'de gerceklesen-butce BAKMA senaryosu.
- Celtx: mobilde inceleme + hafif duzenleme; tam duzenleme bilgisayarda.
- Movie Magic Budgeting: masaustu uygulamasi, mobil yok.
- Wrapbook: mobil = gonder + onayla (puantaj, masraf, fis), butce kurma yok.
- Yamdu: bkz. §1.15 (gozlemlendi — telefonda alt serit yok, sol ray cekmece olarak acilir).
- Genel desen: telefon bakma ve onaylama yuzeyi, masaustu kurma yuzeyi.

KAAPA notu: KABUK-KARARLARI bolum 14 (8 Agustos 2026) bu desenle uyumludur.

§2.2 BAGLANTISI: MMB ve Saturation'a 14 Haziran 2026 "ekran-hissi turunda" daha once bakilmis, bulgular hicbir dosyaya yazilmadigi icin kaybolmustu (§2.2). Yukaridaki iki satir o kaybin kismi telafisidir — ayni urunlere ikinci kez bakildi. Ders: tarama bulgusu ayni oturumda bu dosyaya yazilmazsa yok sayilir.
