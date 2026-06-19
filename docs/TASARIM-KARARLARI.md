# KAAPA — Tasarım Kararları (Ekranlar-Arası Ortak İlkeler)

**Kapsam:** Bu dosya YALNIZCA tüm ekranlarda ortak geçerli görsel ve etkileşim ilkelerini tutar. Ekran-spesifik içerik (alan/akış/yerleşim) → docs/EKRAN-SAHA|DEPT|MUHASEBE.md. İş mantığı (onay/dönem/avans/reddet/anomali/hot cost) → docs/IS-KURALLARI.md. Görev sırası → docs/IS-SIRASI.md.

---

## 1. Tasarım felsefesi
- **Mobile-first.** Birincil kullanıcı sette: ayakta, tek elle, zaman baskısı, bazen karanlık ortam. Desktop responsive olarak açılır.
- **Aksiyon öncelikli.** Her ekranda birincil eylem görsel merkezde; ikincil bilgi geri planda / scroll altında.
- **Netlik > süs.** Anlaşılırlık her zaman önce gelir.

## 2. Kart-merkezli arayüz
- **Muhasebe:** TAM kart-merkezli çalışma masası. Her konu (bekleyen / şüpheli / avans / kiralama) bir kart; kartlar masaya serilir, içinde çalışılır; bildirimlere ve önceliklere göre otomatik sıralanır (yukarı/aşağı). Sunum detayı G6'da (EKRAN-MUHASEBE açık slot).
- **Dept:** KISMEN kart-merkezli (muhasebe kadar değil).
- **Saha:** kart-merkezli DEĞİL. Aksiyon-merkezli kendi akışı (FİŞ TARA odaklı). **Saha arayüzü jeneriktir:** öğelerin konumları sabit, yalnızca kozmetik (renk/şekil) geliştirilir.

## 3. Tema ve görsel kimlik (ilke kayıtlı, değerler G6'da)
- **Dark-mode öncelikli** (set ortamı), light mode da bulunur. Tema tercihi kullanıcı bazlı.
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

## 8. Bütçe modülü (2026-06-12 — kilitli)
Karar kaydının tamamı: CURRENT.md B-serisi (B1-B15). Ekran tarifleri: EKRAN-MUHASEBE §19. Kalıcı ilkeler:
1. 10 dakika kuralı — eğitimsiz muhasebeci 10 dakikada ilk grubu doldurur; kurs gerektiren her şey tasarım hatası.
2. Kart = tek konu — masada yalnız kartlar; kartın içinde yalnız o grubun satırları.
3. Görünür hesap, dokunulmaz formül — formül hücresi yok; her toplamda tek dokunuşla düz Türkçe döküm ("75.000 net + %33 yük = 99.750 × 1,75 hafta = 174.563").
4. Üç alan kuralı — satır eklemek = ad + net + çarpan; yük ve birim gruptan miras.
5. Klavye akışı — Enter/Tab ile Excel hızı.
6. Kayıt düğmesi yok — her hücre anında kaydedilir.
7. Şablondan gelen boş kalem 0'da durur, toplama girmez, gizlenebilir.
8. Güven = değişiklik izi + orijinal kilidi.
9. Mobil: bütçe girişi masaüstü-önerilir; icmal/özet mobil-tam.
10. Uyarı 3 seviye: engel / uyarı / öğreten ipucu ("ne oldu + neden önemli + ne yap").
11. Tamamlılık ilkesi: kullanıcıya "bunu neden koymamışlar" dedirtme; her erteleme kayıtlı karar.
12. Görsel tasarım ayrı turda, UI yazılmadan önce (wireframe ≠ kimlik).
Model bildirisi: omurga dünya standardı (icmal → etap → grup → kalem, hesap kodlu, orijinal/yürüyen/gerçekleşen, EFC kapısı), matematik Türkiye (yük bileşenleri, KDV ayrıştırma, belgeli/belgesiz), sunum KAAPA (kart masası + ray).

### Şema kararları (2026-06-13 — kilitli, DB temeli yazıldı b89d67e)
13. **Hesaplanan değer saklanmaz (B18):** DB'de yalnız girilen sayılar ve belge sayıları durur; tüm toplamlar her bakışta CFE'den doğar. Saklanan türetilmiş tek değer = kasa fotoğrafındaki donmuş toplam (değişmemesi gerektiği için). Aynı formülün iki yerde (TS+SQL) yaşaması yasak; tek hesap makinesi.
14. **Negatif/bozuk değer kapıdan giremez (B3 engel):** DB CHECK kısıtı, tetikleyici değil.
15. **Değişiklik izi kapıda (B19):** tek tutanak defteri + tabloya takılı tetikleyici; paraf insana bırakılmaz, izsiz değişiklik imkansız. İz tutar, hesap yapmaz.
16. **Kasa ve raf koy-ve-bak (B16/B17):** orijinal kilidi ve şablonlar tek jsonb belge; UPDATE/DELETE politikası yok → dokunulmazlık DB seviyesinde. Düzeltme = yeni satır, eskisi durur.
17. **Kalıcı kalem kodu = kimlik:** bütçe içi artan sayaç, geri kullanılmaz, konumdan bağımsız. Dış format (Bakanlık/AICP) kod eşlemesi ayrı alan.
18. **Sınav düzeneği:** para hesaplayan her kural cevap anahtarlı testle mühürlenir; matematiğe dokunan, test geçmeden commit edemez. (CFE dilim 1 ile, 1b.)
Paketleme: Model A — bütçe ile harcama tek kod tabanında paketlenebilir iki yüzey; tek temas receipts.budget_item_id; "modül açık mı" bayrağı ileride proje düzeyinde tek alan.

## 7. Referanslar
- Rakip OCR analizi: docs/RAKIP-ANALIZI-OCR.md
- Domain terimleri: docs/GLOSSARY.md

---

## TAŞINAN İÇERİĞİN HARİTASI (navigasyon — bu dosyada artık yok)
Bu dosyada eskiden karışık duran ekran/iş/auth detayları doğru evlerine taşındı:
- Giriş akışı · saha ana ekran · OCR sonuç ekranı · dönem ekranı → **docs/EKRAN-SAHA.md**
- Reddet/iade · dönem disiplini ve kapama · kategori sistemi · kiralama · avans · hot cost · vergi türleri · şirket kuralları · anomali → **docs/IS-KURALLARI.md**
- Onboarding · davet zinciri · multi-project · üyelik/silme → **docs/AUTH-KARARLARI.md**
- Tasarım/görev iş listesi → **docs/IS-SIRASI.md**
- Dil seçimi · mesai hesaplama · denetçi modu → **Faz 2** (CURRENT.md "Faz 2'ye Taşınanlar")

## Bütçe modülü - yapı kararı (kilitlendi 2026-06-13)

### A. Giriş yapısı
- Kart = departman (ana menü); değişmez. Endüstri/saha standardı; ağrı noktası yapı değil uygulamadır.
- Faz ayrı yapı DEĞİL = dönemin kaba hali. Varsayılan 3 dönem (Hazırlık/Çekim/Post); profesyonel çağrı kâğıdı bloklarına inceltilebilir (Çekim-1, Çekim-2...). Tek dönem ekseni, ayarlanabilir granülerlik.
- Giriş = sakin liste, kalem başına TEK satır; "ne zaman" göstergesi her satırda.
- "Tek-dönemlik / çok-dönemlik" diye iki cins kalem yok; her kalem döneme-bölünebilir, tek-dönem = tek dönemi dolu hali. Baştan sınıflama gerekmez.
- Çoğul dönem girişi: satırdaki "ne zaman"a dokun → dönem işaretle → her seçilene tutar. AYRI "dönem ekle" butonu yok. Az dönemde yan yana hücre, çok dönemde liste (uyarlanır döküm).
- Tam görünüm = nakit matrisi (2. yüzey): kalemler x dönemler, dönem başına nakit ihtiyacı. Gizli toggle değil, bütçeyi hazırlayanın çekirdek aracı.
- İki yüzey: GİRDİĞİN yüzey (kart, liste) != OKUDUĞUN yüzey (matris). Aynı veriden türer.

### B. Altı arayüz ilkesi (KAAPA arayüz anayasası)
1. Tek masada tek iş — ekranda yalnız o an gerekli olan; gerisi bir dokunuş ötede.
2. Makineyi gizle — kullanıcı "Kamera: 318.760" görür, stage_id/fringe değil; varsayılan çalışır, doldurmaya zorlamaz.
3. Derinlik talep üzerine — basit yüzey, güç saklı.
4. Anında ve doğru — her dokunuşta toplam canlı ve doğru (CFE); kırılan formül yok.
5. Sakin yoğunluk — nefes alan boşluk, az ama net.
6. Öngörülebilir — aynı jest her yerde aynı, geri-al kolay, çıkmaz sokak yok.

### C. Beş veri kuralı
1. Satır toplamı her zaman TÜRETİLİR = dönem tutarlarının toplamı. Ayrı elle yazılan toplam alanı YOK.
2. Her kalemin EN AZ BİR dönemi olmalı (yoksa nakit + karşılaştırmadan düşer). Zamansız kalemler (sigorta gibi) için açık "dönemsiz" kovası.
3. "Ne zaman" = nakdin çıktığı/gerektiği dönem (amaç nakit akışı), masrafın işlendiği an değil.
4. Dönemlerin TARİH sınırı olmalı (Hazırlık = şu-bu tarih); gelen fiş hangi döneme düşeceğini bilsin. Dönem = çağrı kâğıdına bağlı çekim blokları (zaten tarihli).
5. "Ne zaman" İKİ EKSEN: ait-olduğu-dönem (maliyet/karşılaştırma kapısı, kalemden miras, Faz 1) != nakdin-çıktığı-dönem (nakit kapısı, gerçekleşen dilimi). Varsayılan eşit, override edilebilir; tarih otomatik tahmin yapar, kilitli değil. Örnek: hazırlık işi, çekimde ödendi → ait=Hazırlık, nakit=Çekim.

### D. Yuvarlama sözleşmesi
- Öngörülen (bütçe) taraf: satır toplamı TAM TL'ye yuvarlanır (ROUND_HALF_UP). Üst toplamlar = yuvarlanmış satırların toplamı (önce-yuvarla-sonra-topla; üstte yeniden yuvarlama yok).
- Gerçekleşen (belge) taraf: KURUŞTA kalır (net + KDV = brüt; belgenin aynası).
- Yalnızca satır toplamı + üst toplamlar yuvarlanır. Birim net, brüt birim, çarpanlar (miktar/adet) DOKUNULMAZ.
- Para hesapları decimal.js ile; JS float YASAK. Kanıt: 8/8 test yeşil (src/shared/cfe/cfe.test.ts), commit 0b344e1.

### E. Açık tasarım notları (yapılacak - unutma)
- Ağır toplu giriş için "hızlı ekle" modu KORUNMALI: kart-cumbasını terk etmeden peş peşe kalem (departman satırda seçilir). Kurulumda bütçe sıfırdan dökülürken gerekir; günlük tek-kalem kullanımda gerekmez.
- "Ne zaman" göstergesinin DOKUNULABİLİR olduğu görsel olarak belli olmalı; yoksa kullanıcı çoğul dönemi hiç keşfetmez.

### F. Şema sonucu
- Döneme bağ KALEMDE durur (kart dönemden bağımsız); matris türetilir. Mevcut budget_stages → "dönem" katmanı (ait-dönem). Nakit-dönem ikinci eksen, gerçekleşen diliminde eklenir. Beş katman disiplini (şema→RLS→trigger→servis→UI) bu göçte uygulanır; küçük migration, erken.

## Bütçe göçü uygulandı + köprü kararları (2026-06-14)
- Göç canlıya alındı (commit e63fbb0, supabase db push): kart=departman (dönemden koptu), budget_stages = "dönem" katmanı (start/end_date eklendi, nullable), miktar budget_items'tan budget_item_periods köprüsüne taşındı.
- YENİ tablo budget_item_periods (kalem<->dönem köprüsü, ait-dönem ekseni): her kalem-dönem çifti tek satır; o dönemdeki miktar köprüde durur. Kalemde birim net / birim / adet / yük SABİT kalır. Satır toplamı = dönem tutarlarının toplamı (türetilir, A kararı).
- Dönem tarihi NULLABLE: iskelet açılırken tarih zorunlu değil. "Dönem tarihli olmalı" zorlaması MÜHÜRDE (fn_lock_budget) — iskelet gevşek, mühür sıkı.
- "En az bir dönem" kuralı da MÜHÜRDE (DB'de çocuk-satır-zorunlu kurmadık, kırılgan olurdu): mühür tam/geçerli fotoğraf ister (B16 kasa).

## Şablon body FORMAT + KDV ayrıştırma (kilitlendi 2026-06-15)

### A. body jsonb FORMAT (budget_templates.body)
- Tek şekil tüm türler/scope için. Dizi = iki şablon satırı (season + episode) — budget_templates.scope zaten "çift iskelet" diyor. Tür/scope farkı içerikte, şekilde değil.
- Şekil tabloları aynalar (B16 kasa ile AYNI serileştirici; ref'ler bu round-trip için):
  - stages[]: { ref, name, sort_order } — tarih YOK (açılışta null; "tarihli olmalı" mühürde). + rezerve "Dönemsiz" etabı.
  - cards[]: { ref, department_code, name, icon, default_unit, default_package, sort_order, items[] }
  - items[]: { ref, name (Sebep), detail, note, unit? (null=karttan miras), package? (null=miras), multiplier, sort_order } — unit_net YOK (açılışta 0), periods YOK (köprü boş).
  - percent_lines[]: { code (contingency|profit), label, rate_percent, is_hidden } — varsayılan contingency 10 / profit 0.

### B. Köprü açılışta BOŞ (Model A)
- Şablon kalemi döneme bağlamaz; budget_item_periods açılışta tek satır bile yaratılmaz. Kullanıcı "ne zaman"a dokunup dönem işaretleyince köprüye satır düşer.
- Gerekçe: rakamsız şablon ilkesi (miktar=rakam, köprü miktarı tutar) + "ne zaman" dokun-işaretle tasarımı; hangi kalem hangi dönemde = işe-özel.
- REDDEDİLEN (Model B): şablon kalemi varsayılan döneme önceden bağlasın (0-miktarlı köprü satırı). Sahte kesinlik.
- "En az bir dönem" kuralı açılışta DEĞİL, mühürde (kalemler o ana kadar 0/soluk).

### C. Yük = paket kodu + günün oranı
- Şablon yalnız paket KODU tutar. Açılışta fn_open_budget paketi bileşenlere açar, item_burdens'e GÜNÜN rate_catalog oranlarını kopyalar. Oran kopyası şablonda yok (fotokopi tek yönlü).

### D. budget_percent_lines DEĞİŞMEZ — seçilebilir-tabanlı markup gereksiz (geri alındı)
- contingency+profit, düz, taban-seçimi yok — AYNEN kalır.
- AICP/film araştırmasındaki "seçilebilir-tabanlı yüzde" ihtiyacı YÜK içindi ve zaten item_burdens+packages ile karşılanıyor (taban = hangi kalem paketi taşır).
- AICP "pass-through hariç markup" = bidding/müşteri-fatura inceliği; KAAPA harcama-kontrol -> düz profit yeter. Gerekirse ileride dış-format/export. Çekirdek şemaya eklenmez.

### E. KDV ayrıştırma — Geniş yol (şema eki gelecek)
- ÖNGÖRÜLEN taraf kilitçe NET (budget_items.unit_net = KDV'siz; KDV indirilebilir). KDV şu an yalnız belge tarafında.
- KARAR: budget_items'a vat_rate eklenir (uygulama dilimi). body'ye default_vat (kart) + opsiyonel vat (kalem); birim/paket mirası gibi.
- Kullanıcı NET veya BRÜT (KDV dahil) girer; satır oranını bilir -> CFE kdvAyristir/brutBirim ile diğeri türetilir. B18 KIRILMAZ (oran girdi, tutar saklanmaz).
- Kazanç: (a) nakit matrisi BRÜT-nakit; (b) karışık oran (20/10/1/muaf); (c) serbest-meslek makbuzu yük+KDV BİRLİKTE -> KDV ile yük AYRI eksen.

### F. Açık bayraklar (uygulama diliminde)
- department_code -> department_id: fn_open_budget'ta; departmanlar proje-bazlı, sistem şablonu projeyi bilmez -> kanonik departman kodu/seed gerekebilir.
- "Dönemsiz" etabı mühür muafiyeti: "dönem tarihli olmalı"dan muaf -> budget_stages.is_undated? fn_lock_budget'ta.

## Bütçe kart mimarisi + kalem mekanizması (kilitlendi 2026-06-19)
Kalıcı mimari. TEK KAYNAK: docs/KAAPA_BUTCE-KART-MIMARISI.md. Aşağısı ÖZET referans; detay o dosyada.

### A. Etap ekseni (5 etap = zaman)
- Etap = ödeme/zaman etiketi; parayı karttan karta TAŞIMAZ. Beş etap: Geliştirme · Yapım Öncesi · Yapım · Yapım Sonrası · Dağıtım ve Teslimat.
- Bir kalem birden çok etaba yayılabilir/bölünebilir.

### B. Kart = departman + "kullanan sahiplenir"
- Kart (= Harcama Grubu = departman) = giderin NEREYE ait olduğu. Kart ve Etap iki ayrı eksen — çakışmazlar.
- Temel kural: bir kaynağı günlük kim kullanıyorsa kalem onun kartına yazılır. "Araç hep Ulaşım'a gider" diye kural YOK.

### C. Geliştirme = recoupable tek kart
- Geliştirme etabının TEK kartı "Proje Geliştirme ve Haklar"; tüm geliştirme bu kartta (genel kartlara DAĞITILMAZ).
- Recoupable = greenlight'ta geri tahsil edilir; genel kartlar etap etiketiyle ayrılır, Geliştirme bilinçli istisna.

### D. Kalem davranış motoru (üç bağ + alias + atom mirası)
- Üç bağ: ait-kart (yer, para burada) · onay-köprüsü (kim onaylar, para yerinde) · risk-bayrağı (anomali tetikleyici).
- Alias / çapraz-eşleme: kalem başka kartı İŞARET EDER, kopyalamaz (kopyalama = çift-sayım, sektörün en sık hatası).
- Davranış ATOMDA yaşar: bağ/bayrak/kolon/flag kanonik atomda tanımlıdır; kalem atomu çağırınca miras alır.
- Ek mekanizmalar: ödeme alt-kolonları (peşin/vadeli, v1-v4) · recoupable/iade/depozito ailesi (brüt/iade/net) · salt-okunur toplam · serbest metin notu.

### E. Çoklu çalışma / yetki
- Kart-bazlı departman admini: yalnız kendi kartını görür/yazar.
- Alias = çapraz-yetki kanalı: departman admini tüm kartı açmadan başka karttaki tek ilgili kalemi onaylayabilir.
- Muhasebe üstünlüğü: nihai finansal kontrol Muhasebe'de; alias-onayı ara katman, son söz değil.

### F. Kilitli kartlar (19 Haziran 2026)
- KART 1100 — PROJE GELİŞTİRME ve HAKLAR: Geliştirme etabı, tüm kart recoupable, 9 kalem (1101-1108 + 1190). 1108 salt-okunur.
- KART 1300 — SENARYO YAZIM & YASAL TEMİZLİK: Yapım Öncesi etabı, recoupable değil. 1306 Legal Clearances = motorun ilk kurulu örneği (3 bağ tam set).
- 1200 absorbe: "Story & Other Rights" ayrı kart DEĞİL; geliştirme hakları 1101'de, yazım 1300'de.
- KART 1400 — YAPIMCI BİRİMİ ve FİNANSAL HAKLAR: ATL, recoupable değil, tam maske 🔒 ("ticari yatak odası"). Dört grup: kreatif kaşeler (1401/1402/1403) · şirket gelirleri (1404 Overhead/1405 Mark-up) · komisyon (1406) · lojistik/temsil (1407-1409). Compliance Guard bağlı (1404/1405 şablon tavanı).
- KART 1500 — YÖNETMEN ve KREATİF REJİ EKİBİ: ATL (Prep→Prod→Post), recoupable değil, kısmi maske 👁️ (1501 baş-kaşe gizli). Dört grup: kreatif ana (1501/1502) · destek ekibi (1503-1505) · görselleştirme (1506/1507) · lojistik/temsil (1508/1509). Milestone denetimi: 1501↔5100.

### G. Yeni mimari kavramlar (19 Haziran 2026 — ek oturum)
- §4.8 Ödeme-statüsü boyutu (loan-out → fringe yönü): Her işçilik kaleminin Bordro/SMM/Şirket-faturası/Loan-out statüsü vardır; bu statü SGK/fringe'in hesaplanıp hesaplanmayacağını ve nereye gideceğini belirler. Motor tanımlı; hesaplama §8 PARK.
- §4.9 Genel anomali kuralları (tüm kartlarda aktif): çift-fringe guard (SMM/Loan-out'a fringe binmesini engeller) · Crew Overlap Guard (aynı kişi iki kartta ücret taraması) · geliştirme mahsup kontrolü (1102/1103↔1401/1403/1501) · milestone uyuşmazlık denetimi (hakediş↔teslim kilometre taşı).
- §5.1 Kart görünürlük katmanları: DB-erişim ≠ UI-görünürlük. Muhasebe DB'de her zaman tam açık (kör nokta yok). Set rollerine: tam maske (1100,1400) / kısmi maske (1300,1500) / departman-açık (2100+). Satır-seviyesi gizleme (hidden row) var. ATL baş-kaşe deseni: baş-kaşe set rollerine daima gizli (çoğul olabilir). Master/Owner katmanı: Muhasebe üstü proje sahibi + Denetmen/Auditor.
- §6 Compliance Guard: Şablon-bağlamlı uyumluluk denetimi. Hedef Mecra seçimi (Eurimages/Netflix/TRT/Bakanlık) + compliance_rules veri tablosu. Sınır kuralı KİLİTLİ: teşhis+uyarı EVET / gizleme reçetesi HAYIR. Üç senaryo: Overhead tavanı, Mark-up tavanı, gizli kâr transferi görünürlüğü.
Detay TEK KAYNAK: docs/KAAPA_BUTCE-KART-MIMARISI.md.
