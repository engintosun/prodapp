# KAAPA — BÜTÇE MODÜLÜ ŞEMA & TEKNİK KARARLAR

⚠ TERMİNOLOJİ: 2026-07-11 öncesi kayıtlarda Miktar=kişi/adet, Çarpan=süre okunur; sonrasında Miktar=süre, X=kişi/adet (bkz. GLOSSARY tarihçe).

*Bütçe modülünün veri modeli / şema / şablon formatı / KDV / RPC kararlarının TEK KAYNAĞI (B-serisi teknik kayıt). Arayüz/UX ilkeleri: docs/TASARIM-KARARLARI.md. Kart/kalem yapısı: docs/butce/KART-KATALOGU.md. Ekran tarifleri: docs/EKRAN-MUHASEBE.md §19.*

### Şema kararları (2026-06-13 — kilitli, DB temeli yazıldı b89d67e)
13. **Hesaplanan değer saklanmaz (B18):** DB'de yalnız girilen sayılar ve belge sayıları durur; tüm toplamlar her bakışta CFE'den doğar. Saklanan türetilmiş tek değer = kasa fotoğrafındaki donmuş toplam (değişmemesi gerektiği için). Aynı formülün iki yerde (TS+SQL) yaşaması yasak; tek hesap makinesi.
14. **Negatif/bozuk değer kapıdan giremez (B3 engel):** DB CHECK kısıtı, tetikleyici değil.
15. **Değişiklik izi kapıda (B19):** tek tutanak defteri + tabloya takılı tetikleyici; paraf insana bırakılmaz, izsiz değişiklik imkansız. İz tutar, hesap yapmaz.
16. **Kasa ve raf koy-ve-bak (B16/B17):** orijinal kilidi ve şablonlar tek jsonb belge; UPDATE/DELETE politikası yok → dokunulmazlık DB seviyesinde. Düzeltme = yeni satır, eskisi durur.
17. **Kalıcı kalem kodu = kimlik:** bütçe içi artan sayaç, geri kullanılmaz, konumdan bağımsız. Dış format (Bakanlık/AICP) kod eşlemesi ayrı alan.
18. **Sınav düzeneği:** para hesaplayan her kural cevap anahtarlı testle mühürlenir; matematiğe dokunan, test geçmeden commit edemez. (CFE dilim 1 ile, 1b.)
20. **Standart oranlar veri olarak durur, koda gomulmez (B20):** stopaj/KDV/SGK/ajans/damga gibi mevzuata bagli oranlar DB'de tarihli bir cetvelde durur (rate_catalog + payment_status_defaults); fn_open_budget acilista butceye snapshot'lar (B16 cizgisi — acik yapim donmus kopyasini korur). Mevzuat degisince tek yer guncellenir, acik yapimlar etkilenmez, ve kullanici arayuzunden duzenlenebilir kalir (oran-yonetimi ekrani ERTELENDI -> IS-SIRASI). Orana kod icine gommek YASAK (kullanici goremez/duzenleyemez + B18 cift-kayit). Odeme-statusu kolonlari CANLI (2026-06-24): budget_items.payment_status (text+CHECK) / stopaj_rate (null=miras) / vat_deductible; budget_item_periods.unit_net_override; payment_status_defaults cetveli (seed TASLAK, muhasebe teyidi bekliyor).
Paketleme: Model A — bütçe ile harcama tek kod tabanında paketlenebilir iki yüzey; tek temas receipts.budget_item_id; "modül açık mı" bayrağı ileride proje düzeyinde tek alan.

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

### F. Şema sonucu
- Döneme bağ KALEMDE durur (kart dönemden bağımsız); matris türetilir. Mevcut budget_stages → "dönem" katmanı (ait-dönem). Nakit-dönem ikinci eksen, gerçekleşen diliminde eklenir. Beş katman disiplini (şema→RLS→trigger→servis→UI) bu göçte uygulanır; küçük migration, erken.

## Bütçe göçü uygulandı + köprü kararları (2026-06-14)
- Göç canlıya alındı (commit e63fbb0, supabase db push): kart=departman (dönemden koptu), budget_stages = "dönem" katmanı (start/end_date eklendi, nullable), miktar budget_items'tan budget_item_periods köprüsüne taşındı.
- YENİ tablo budget_item_periods (kalem<->dönem köprüsü, ait-dönem ekseni): her kalem-dönem çifti tek satır; o dönemdeki miktar köprüde durur. Kalemde birim net / birim / adet / yük SABİT kalır. Satır toplamı = dönem tutarlarının toplamı (türetilir, A kararı).
- Dönem tarihi NULLABLE: iskelet açılırken tarih zorunlu değil. "Dönem tarihli olmalı" zorlaması MÜHÜRDE DEĞİL, harcama fazına geçiş kapısındadır (REVİZE 2026-07-11, MÜHÜR-1) — mühür (fn_lock_budget) tarih istemez, tarihsiz mühür Ocak-varsayımlı çözümü dondurur (calendar_assumption).
- "En az bir dönem" kuralı da MÜHÜRDE (DB'de çocuk-satır-zorunlu kurmadık, kırılgan olurdu): mühür tam/geçerli fotoğraf ister (B16 kasa).

## Şablon body FORMAT + KDV ayrıştırma (kilitlendi 2026-06-15)

### A. body jsonb FORMAT (budget_templates.body)
- Tek şekil tüm türler/scope için. Dizi = iki şablon satırı (season + episode) — budget_templates.scope zaten "çift iskelet" diyor. Tür/scope farkı içerikte, şekilde değil.
- Şekil tabloları aynalar (B16 kasa ile AYNI serileştirici; ref'ler bu round-trip için):
  - stages[]: { ref, name, sort_order } — tarih YOK (açılışta null; "tarihli olmalı" mühürde). + rezerve "Dönemsiz" etabı.
  - cards[]: { ref, department_code, name, icon, default_unit, default_package, sort_order, items[] }
  - items[]: { ref, name (kalem adi, UI: Ad), detail, note, unit? (null=karttan miras), payment_status? (null=sirket), multiplier, sort_order } — unit_net YOK (açılışta 0), periods YOK (köprü boş). NOT (DILIM-2b): paket yolu emekli; kova artik statuden dolar (payment_status_burdens eslemesi). cards[] default_package ve items[] package alanlari okunmaz. ŞERH (D3-ARA, 26 Temmuz 2026): sablon govdesinde anahtar adi `detail` kalmistir, hedef kolon artik `name_en`'dir, hizalama TD-21.
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
- ÖNGÖRÜLEN taraf kilitçe NET (budget_items.unit_net = KDV'siz; KDV indirilebilir). KDV bugün de bütçe tarafında hesaplanıyor (`totals.ts`: brütToplam = brütYük + kdvTl), kaynağı payment_status_burdens kovası değil, CFE'deki kişiyeBanka hesabı ve budget_items.vat_rate alanıdır (21 Ağustos 2026 — kod ile çelişiyordu, koda göre düzeltildi). GÜNCELLEME (22 Ağustos 2026, NET/BRÜT DOKTRİNİ REVİZYONU): KDV artık Yasal Yük'ün İÇİNDE değil, kendi kolonunda çıkar — bkz. dosya sonundaki "NET/BRÜT DOKTRİNİ REVİZYONU" başlığı.
- KARAR: budget_items'a vat_rate eklenir (uygulama dilimi). body'ye default_vat (kart) + opsiyonel vat (kalem); birim/paket mirası gibi.
- Kullanıcı NET veya BRÜT (KDV dahil) girer; satır oranını bilir -> CFE kdvAyristir/brutBirim ile diğeri türetilir. B18 KIRILMAZ (oran girdi, tutar saklanmaz).
- Kazanç: (a) nakit matrisi BRÜT-nakit; (b) karışık oran (20/10/1/muaf); (c) serbest-meslek makbuzu yük+KDV BİRLİKTE -> KDV ile yük AYRI eksen.

### F. fn_open_budget kararları (KİLİTLENDİ 2026-06-21, Dilim 2a)
- department_code -> department_id: ÇÖZÜLDÜ. departments'a `code` kolonu (kanonik anahtar, UNIQUE(project_id,code)); fn_open_budget her şablon kartının department_code'u için projede BUL-VEYA-OLUŞTUR (ON CONFLICT DO NOTHING ile race-safe). Departman proje-bazlı kalır (global raf YOK); name şablondan. İsim-eşleme REDDEDİLDİ (typo bölünmesi).
- "Dönemsiz" etabı: ÇÖZÜLDÜ. budget_stages'e `is_undated` boolean; fn_open_budget her bütçede bir rezerve "Dönemsiz" etabı yaratır (is_undated=true, sort_order 9999). Harcama fazına geçiş kapısı bu etabı "tarihli olmalı"dan MUAF tutar (REVİZE 2026-07-11: zorunluluk mühürden harcama kapısına taşındı); MÜHÜR-1 fn_lock_budget ise calendar_assumption'ı hesaplarken bu rezerve etabı HARİÇ tutar (kolon CANLI).
- fn_open_budget davranış sözleşmesi (Model A): köprü (budget_item_periods) açılışta BOŞ; unit_net=0 (rakamsız iskelet); cost_object boş; paket->item_burdens günün oranı (rate_catalog valid_from<=bugün).
- item_code üretimi: `budgets.item_code_seq` MONOTON artırılır (UPDATE ... RETURNING), `max(item_code)+1` DEĞİL. Gerekçe: max boşluk-doldurur, silinen kodu geri verir -> B-serisi kalıcı kimlik İHLALİ. Sayaç "geri dönmez" (temel migration satır 86).

### G. MUHUR-2 servis okuma çatalı (KİLİTLENDİ 2026-07-11)
- Kilitli bütçe (is_locked=true): oranlar en yüksek version_no'lu budget_versions + budget_rate_snapshot'tan okunur; SGK senaryosu canlı fn_resolve_sgk_scenario DEĞİL, mühürde dönen sgk_component_code'dur; yürürlük tarihi = sealed_at (SABİT). Gerekçe: snapshot katalogun tamamını içerir — yürürlük bugüne göre seçilseydi önceden tohumlanan gelecek-tarihli satır (ör. Temmuz zammı) takvim geçince mühürlü rakamı sessizce oynatırdı.
- Açık bütçe: mevcut canlı yol aynen (rate_catalog + fn_resolve_sgk_scenario, yürürlük = bugün).
- Çatal YALNIZ oran kaynağıdır: kalem/dönem/kova okumaları kilitliyken de canlı tablolardan sürer (guard trigger'lar tabloları donduruyor). Payload okuyucusu MÜHÜR-3 ile gelir (V-sekmeleri, eski versiyonu görüntüleme).
- Doğrulama: kalıcı vitest (5-senaryo + asOf sabitleme + round-trip) + supabase/VERIFY-MUHUR2.sql (linked, begin/rollback, iz bırakmaz).

## KUR-1 — Çok para birimi YERLEŞİM mührü (KİLİTLENDİ 2026-07-12; uygulama ayrı gelecek dilim)
Dört parça, dört ev:
1. Girilen para birimi + tutar = SATIRDA (kalem/dönem alanı) — VERİDİR, saklanır. Şema kolonu bu mühürle AÇILMAZ; gelecek dilim.
2. Kur = KATALOGDA (rate_catalog deseni, valid_from yürürlüklü satırlar; B20). Mühür snapshot cetvelin tamamını kopyaladığı için mühürlü bütçenin kuru sealed_at tarihine sabitlenir — MÜHÜR-1/2 altyapısı ek işsiz karşılar.
3. Çevrim matematiği = CFE saf fonksiyonunda; çevrilmiş toplam SAKLANMAZ (B18).
4. Gösterim birimi = ViewMode / rapor katmanı (icmalde tek birim). Emsal: Saturation faz-başına para birimi; MMB currency aracı.
Refaktöre etkisi (R1'den itibaren): para biçimleme format.ts'te merkezî; satır bileşenlerine TL sembolü gömmek YASAK; fmt imzası ileride currency parametresine açılır.
NEDEN: sahadaki gerçek senaryo — görüntü yönetmenine dolar, asistanlara TL ödenir, icmal tek para biriminde okunur. Eksen disiplini (veri → katalog → motor → görünüm) bozulmadan karşılanır.

### KUR-1 EK (Engin kararı, 13 Ağustos 2026) — üç katman + bütçe kuru
- ÜÇ KATMAN. Aynı ada sahip üç AYRI bilgi vardır, biri ötekinin adayı değildir: (1) GİRİLEN para birimi + tutar = SATIR (veri; KUR-1 madde 1 onaylandı). Testi: kartı değiştirsen, bütçeyi kopyalasan bile o anlaşma dolar kalır. (2) HESAP BİRİMİ + BÜTÇE KURU = BÜTÇE. Bunsuz genel toplam alınamaz; KUR-1'de EKSİK olan katman budur. (3) GÖSTERİM BİRİMİ = GÖRÜNÜM (KUR-1 madde 4 onaylandı). Testi: kapatıp açınca kaybolsa kimse bir şey kaybetmez.
- KART DÜZEYİ VERİ DEĞİLDİR. Yurtdışı çekim bloğu tamamen euro ise kart yeni satırlara euro'yu önceden doldurabilir — bu yalnız VARSAYILAN, gerçek yine satırda kalır. Emsal: kalem kütüphanesindeki "varsayılan statü / varsayılan birim". Bugün gerekmiyor.
- BÜTÇE KURU rate_catalog DESENİNDEN AYRILIR (KUR-1 madde 2'nin düzeltmesi). Gerekçe: tarihli cetvel MEVZUAT için doğrudur — stopaj yüzdesini yapımcı seçmez, devlet açıklar. Bütçe kuru ise YAPIMCININ kararıdır, genelde piyasa üzeri temkinli tutulur. Tarihli cetvel deseni aynı bütçenin mart kalemini başka, nisan kalemini başka kurla çevirir; bütçe kendi içinde tutarsızlaşır. Bütçe TEK kurla toplanır.
- GİRİŞTE ÇEVRİLMEZ. Girilen tutar TL'ye çevrilip saklanırsa sözleşme rakamla değiştirilmiş olur: kur oynayınca o TL sessizce yanlışa döner, düzeltilirse bu sefer anlaşma değişmiş olur. Çevrim yalnız BAKARKEN yapılır; B18 gereği çevrilmiş toplam zaten saklanmaz, kuru değiştirip yeniden hesaplama bu sayede bedava gelir.
- MÜHÜR: belge ile ölçüm ayrılır. Mühür girilen veriyi ve o günkü kuru dondurur — kuruma giden kâğıt odur, değişmez. Aynı mühürlü bütçeye "bugünün kuruyla" bakmak AYRI bir görünümdür, mühürlü rakama DOKUNMAZ. Taslakta kur serbestçe değişir.
- **UYGULAMA NOTU (22 Ağustos 2026 teyidi):** Bütçe tek para birimi üzerinden hesaplanır, sonra kur değiştirilerek farklı para biriminde okunabilir — bunun için kur seçici + kur hesaplayıcı gerekir. Günlük kur internetten (TCMB deseni) çekilir ama BİLGİ KAYNAĞIDIR; bütçe kurunu otomatik değiştirmez — bütçe kuru yapımcının elle onayladığı karardır.
- DIŞ ÇIKTI TEK SATIR GENEL TOPLAM VEREMEZ. Dövizli bir bütçenin dışarıya verilen çıktısı (PDF vb.) kura bağlı kısmı AYRICA gösterir: döviz cinsinden tutarı, kullanılan kuru, o kalemin toplam içindeki payını. Gerekçe sahadan: yatırımcı tek rakam görüp onaylar, kur oynayınca fark istenir; riski hazırlayan bilir, onaylayan bilmez. Bu bir rapor süsü değil, bütçenin dürüstlük şartıdır. Kullanılan kur ve tarihi çıktının üzerinde görünür ("1 USD = X TL, GG.AA.YYYY bütçe kuru").
- AÇIK KALAN, KARARA BAĞLANMADI: bütçe kuru ile FİİLİ ÖDEME kuru farklıdır; fiş gerçek günün kuruyla düşer, bütçe bütçe kuruyla durur, arada kur farkı oluşur. receipts.currency alanı şemada VAR ama bugün hep 'TRY' yazılıyor. Bütçe-fiili karşılaştırmasında bu farkın sapma mı sayılacağı yoksa ayrı satır mı olacağı hiçbir yerde yazılı değil. Ev: KUR dilimi.

## SATIR-EKLEME + KALEM KÜTÜPHANESİ (KİLİTLENDİ 2026-07-21, Opus tasarım oturumu)

### H. İki-kod doktrini (K-A)
- `item_code` AYNEN KALIR: bütçe-yerel monoton kimlik sayacı, silinen kod geri verilmez (mevcut doktrin). Kimliktir, konum söylemez.
- **Katalog kodu** yeni kanonik alan: MMB-uyumlu, kütüphanede doğar, budget_items'a kopyalanır. Görünüm SIRASI katalog kodundan; ekrandaki kolon ise kart-içi düz sıra numarasıdır ("No", 1..N — araya ekleme alttakileri kaydırır). Katalog kodu ekranın HİÇBİR yerinde görünmez, autocomplete dahil (KARAR 2026-07-23 gece-2, Engin: kod muhasebe dilidir ve şemada yaşar; Faz 1 kullanıcı ekranında gürültü ve MMB-kopyası algısıdır). "Kodları göster" görünüm seçeneği ileriye açık kapı — şema kodu taşıdığı için sıfır göç maliyeti.
- Kod biçimi alt-kod taşıyabilir (örn. 1601-03): MMB'de kart altı ~97 numaralı hesap + hesap altı numarasız detay satırları var (MMB-6.1 örnek plan, 1600 Talent: 1601–1617 + 1698 Miscellaneous + 1699 Fringe); KAAPA düz tabloyu korur, derinliği koda gömer. Damıtımda çoğu kalem düz hesaba oturur (kapasite kararı: 2+3 karışımı).
- Pilot şablondaki item ref'leri (i1501–i1505) katalog koduna resmîleşecek — kod sıfırdan icat edilmeyecek.

### I. Aidiyet = kod (K-B)
- Kart aidiyeti ayrı alan DEĞİL, kodun aralığıdır (15xx → KART 1500). SSOT tek: kod.
- Çok-karta uyan kavram her kart için o kartın aralığından ayrı kodla ayrı kütüphane kaydı olur (Stunt Vehicle → TRANSPORT örneğindeki mevcut ilke genelleşti).
- **NOT (22 Ağustos 2026):** KART 1600 iki köken bloğunu birden taşıyor (16xx + 39xx). Bugünkü aidiyet denetimi TEK ARALIK varsayımıyla yazılmış: `library-service.ts`teki `fetchCardLibrary` içinde `catalog_code` LIKE ilk-iki-hane önekiyle çalışır, `fn_add_budget_item` içinde `substr(p_catalog_code,1,2) = substr(v_card_code,1,2)` karşılaştırması da aynı varsayımı taşır. 1600 turunda her ikisi de tek önek yerine aralık KÜMESİ okuyacak şekilde genişleyecek.

### J. Kütüphane tablosu şeması (K-C)
- Kolonlar: katalog kodu (tekil) · isim · varsayılan statü · varsayılan birim · köken (Koster provenance) · eş adlar (autocomplete için, örn. Gaffer/Işık Şefi).
- Grup alanı YOK: şemada grup = kart (şablon body'deki her card tek expense_groups satırı; alt-grup katmanı yok — 2026-07-21 kontrol raporu). İleride kart içi görsel bölüm başlıkları istenirse kod aralığından türetilir, ayrı alan yine gerekmez.
- RLS: rate_catalog gibi herkese açık SALT-OKUNUR küresel referans. Kullanıcının serbest kalemleri bütçesinde yaşar, kütüphaneye yazılmaz; ileride "kendi kütüphanem" istenirse owner alanı göçle eklenir.
- Kütüphane içeriğinin doldurulması (damıtım) ayrı iş — şimdi yalnız şema.

### K. Serbest kalem kodu (K-F) + kütüphane referansı (K-G) + mükerrer (K-D)
- Serbest kalem kartın muhtelif hesabından (x698) bütçe-içi MONOTON alt-kod alır (1698-01, 1698-02…), silinen alt-kod geri verilmez. Gerekçe: MÜHÜR versiyon farkları kod üzerinden eşleşir; kod geri dönerse silme+ekleme yeniden-adlandırma gibi görünür, mühür tutanağı yalan söyler.
- budget_items'a kütüphane referans kolonu eklenir: kütüphaneden gelen kalem referans taşır, serbest kalem NULL. Köken sonradan türetilemez; damıtım geri-beslemesi bu ayrımdan okunur.
- Aynı katalog kalemi bir karta birden çok kez eklenebilir (iki farklı ücretli asistan): kod tekrar eder, item_code ayrıştırır, yerleşim bitişik.

### L. Tek-kalem-ekleme fonksiyonu (spec özeti, uygulama dilimi ayrı)
- fn_open_budget'ın kalem döngüsünün tek kalemlik hali: item_code_seq'ten kimlik + katalog kodu (kütüphaneden ya da muhtelif alt-kod) + group_id = hedef kartın grubu + fn_refill_item_burdens çağrısı. Yerleşim kod sırasından; sort_order kod sırasına göre.
- Mühürlü/kilitli bütçeye ekleme yapısal olarak kapalı (guard trigger'lar), kapı revizyon akışı (MÜHÜR-3).

### M. Uygulama dilimlemesi (KARARLANDI 2026-07-23, Engin onayi)
- Sira: D1 -> D2 -> D3. Gerekce: onay kapisindan gececek SQL'ler ayrik ve okunur kalir; bos-raf yuzunden test edilemeyen dilim dogmaz.
- D1 (sema paketi, bu commit): item_library tablosu (salt-okunur SELECT/authenticated + service_role, rate_catalog deseni) + budget_items.catalog_code (NOT NULL) + library_item_id (NULL = serbest) + mevcut veri backfill + fn_open_budget guncellemesi + 1500 mini seed (5 kalem, sablon body kaynakli; aliases bos dogar, damitim doldurur).
- D1-a isimler: item_library(catalog_code tekil, name, description_en, default_payment_status, default_unit_code, provenance, aliases text[]). Statu/birim metin-kod olarak durur — sablon ve fn_open_budget dili ile ayni, ceviri katmani yok.
- D1-b sablon resmilesmesi: body item'larina ACIK catalog_code alani (1501..1505); ref atil etiket kalir, ref'ten kod turetme sihri YOK. fn_open_budget kodu body'den okur, library_item_id'yi kutuphaneden bulur; kod var ama kutuphane kaydi yok -> exception (sessiz hata yasak).
- D1-c backfill anahtari: sort_order n -> 150n. Isim anahtar OLAMAZ (kullanici hucrede duzenlemis olabilir); sort_order dogumdan beri sabit (elle siralama bilincli kapali, satir ekleme arayuzu hic olmadi).
- D1-d/e: mini seed provenance = Koster/MMB-6.1. Kapsam disi: sort_order yeniden hesabi (mevcut 1..5 kod sirasiyla zaten ortusuyor), Kod kolonu UI gecisi D3'te, serbest alt-kod sayaci D2'de.
- CATAL NOTU (bilincli cift-kayit): catalog_code satira KOPYALANIR; kutuphanede bir kod sonradan duzeltilirse mevcut satirlar eski kodu tasimaya devam eder. Muhur tutanagi tarihi gercegi korumali — "kutuphanede duzelt, her yerde duzelsin" senaryosu bu tasarimla yakalanmaz.
- D2 (siradaki): fn_add_budget_item (item_code_seq + group_id + fn_refill_item_burdens + kod-sirali sort_order) + serbest x698 KALICI monoton alt-kod sayaci (max+1 YASAK: silinen kod geri doner, muhur eslesmesi bozulur). Saf SQL.
- D3: "+ kalem ekle" satiri + autocomplete + mini istasyon + KLV dikisi + TS servis fonksiyonlari + Kod kolonunun catalog_code okumaya gecisi. Buyukluk tasarsa mini istasyon D3b olarak ayrilir (DUR kurali yakalar).
- D2 DETAY (KARARLANDI 2026-07-23 gece, Engin onayi; bu commit): D2-a kartin kod kimligi yapisal olarak expense_groups.card_code kolonunda durur (sablon body card_code alanindan gelir, addan/koddan turetme sihri yok; mevcut kartlar 1500 backfill). D2-b serbest sayac = expense_groups.misc_code_seq (budgets.item_code_seq deseni, kart bazli, monoton). D2-c alt-kod bicimi NN98-01 (iki hane sifir dolgulu; 99 asiminda dogal uzar, teorik). D2-d fn_add_budget_item tek kapi iki mod: kutuphane modunda isim/statu/birim parametresi verilirse exception (sessiz ezme yok) + katalog kodu kart araligi kontrolu (K-E melez durum tanimsiz); serbest modda ucu zorunlu. D2-e ekleme sonrasi kartin tum satirlari catalog_code (es kodda item_code) sirasina yeniden numaralanir. D2-f muhur/kilit kontrolu fonksiyonda TEKRARLANMAZ — trg_guard_lock_* tek bekci (MUHUR-1 teyitli: before insert or update or delete); payment_status gecerliligi budget_items CHECK kisitina emanet.
- D3 BOLUNME (KARARLANDI 2026-07-23 gece, Engin onayi): D3 uc alt-dilim, gerekce tam D3 tek dilimde DUR sinirinin (5 dosya / 300 satir) yaklasik iki kati. D3a veri zemini + Kod kolonu (BudgetItemRow catalogCode/libraryItemId, select/map genislemesi, item-row Kod hucresi catalog_code gosterir, library-service.fetchCardLibrary + budget-service.addBudgetItem sarmalayicilari; UI dikisi yok — bu commit). D3b "+ kalem ekle" satiri + autocomplete + KLV dropdown durumu (K10 matrisine yeni durum, cekirdek testleri) — yalniz kutuphane yolu; eslesme yoksa dropdown SECENEKSIZ kalir (serbest satiri ne gorunur ne disabled — placeholder disiplini), serbest yol D3c'ye kadar fiilen yok. D3c serbest kalem (mini istasyon IPTAL 2026-07-24; yerine hizli ekleme yuzeyi geldi, tasarimi 2026-07-28'de kararlasti - BUTCE-EKRAN-KARARLARI bolum 16). TD-18 birim filtresi = format.ts bordroAllowedUnits, bolum 16'daki notr bilgi notu metni birebir. SIRA: once yuzey (kod), sonra D3c. fn_add_budget_item'in ilk gercek cagrisi D3b tarayici turunda.
- D3c BOLUNME (KARARLANDI 2026-07-31, Engin onayi): D3c uc alt-dilime ayrildi, her biri tek fikir. D3c-1 serbest kalemin dogusu (oda icinde serbest ekleme dugmesi + guvenli varsayilanlar + notr bilgi notu; SQL'e DOKUNMAZ, mevcut serbest mod yeterli). D3c-2 oda listesinin genislemesi: kartin mevcut satirlari listeye girer ve mevcut kodla satir dogurma - fn_add_budget_item'a UCUNCU YOL acilir (kod verilmisse misc_code_seq ARTMAZ, satir o kodla dogar; monotonluk garantisi bozulmaz), Engin SQL onay kapisi burada. D3c-3 capraz-kart bilgisi (tum kutuphanenin arka planda bellege alinmasi + odadaki ikinci bilgi satiri). Sira kaygisi tartisildi ve kabul edildi: D3c-1 once giderse arada dogan serbest kalemler ayri kodlarda kalir, sonraki dilim onlari duzeltmez - gercek kullanici verisi olmadigi icin pratikte bedel degil.
- Bayat satir duzeltmesi (2026-07-31): M bolumunun onceki "SIRA: once yuzey (kod), sonra D3c" ve "fn_add_budget_item'in ilk gercek cagrisi D3b tarayici turunda" cumleleri gerceklesti, tarihsel kayit olarak kalir. Not: addBudgetItem sarmalayicisinin KUTUPHANE modu D3b'den beri canli cagriliyor; hic cagrilmamis olan yalniz SERBEST moddur.
- Muhtelif alt-kod kesme duzeltmesi (KARARLANDI 2026-08-01, Engin — Opus sandbox bulgusu, D3c-2 migrationinda kapatildi): D2-c'deki "iki hane sifir dolgulu" bicimi lpad(v_seq::text,2,'0') ile UYGULANMISTI ve bu ifade iki haneden uzun sayiyi KESIYORDU (lpad('100',2,'0')='10') - 100. serbest kalemden itibaren her kalem daha once kullanilmis bir kodu aliyordu, 23 Temmuz 2026'dan (D2-d) beri. Bicim artik EN AZ iki hane, kesme YOK (01,02...99,100,101...); 99 bir SINIR DEGILDIR. Bedel: 99'u asan kartta muhtelif blogunun kendi ici siralamasi metin sirasina duser (...10,100,101,11,12...) - kart ici, yalniz muhtelif blogunda, kabul edilmistir.

## KART KATALOĞU VE ŞABLON (KARAR 14 Ağustos 2026, Engin)
- İKİ KATMAN, KART SEVİYESİNDE: Şablon kendi TÜRÜNÜN bütün kartlarını getirir. Katalog BÜTÜN TÜRLERİN kartlarını tutar. Ekleme kartının kaynağı ikisi arasındaki farktır: katalogun tamamı eksi bu şablonun kartları. Kalemlerdeki "şablon yalın / kütüphane geniş" deseninin kart karşılığıdır.
- ŞABLON OLUŞTURMA KAPISI ŞEMADA ZATEN AÇIK: budget_templates.kind ∈ {system, company}; owner_project_id ile eşleşme kısıtı mevcut (system ⟺ owner_project_id IS NULL); production_type ∈ {film, dizi, reklam, belgesel}. Kullanıcının kendi şablonunu kurması MİMARİ YENİLİK DEĞİL, çizilmemiş bir YÜZEYDİR. ŞERH: sahiplik alanı owner_project_id, yani şablon şirkete değil PROJEYE bağlıdır — bugünkü hâliyle kullanıcının kurduğu şablon sonraki projede çıkmaz. Bu, şablon yüzeyinin turunda çözülecektir.
- AÇIK KALANLAR (bu turda konuşuldu, karara bağlanmadı): kart kataloğunun evi (yeni global tablo mu, başka mı) · kartın kökeni alanı (şablondan mı, elle mi) · kart silme yolu · kullanıcı-başına kart sırası şeması (çek-bırak bunu şart koşuyor, bugün expense_groups.sort_order bütçe genelidir) · serbest kartın kod aralığı (kalemdeki NN98-01 muhtelif deseninin kart karşılığı) · silinen kartın içindeki kalemlerin akıbeti.

## RESMİ ÖDEME + GÖRSEL GRUP + TEK İMZA DOKTRİNİ (DILIM 1100-A, KARAR 15 Ağustos 2026, Engin)
- **AYRILMA KURALI:** oranla başka bir satırdan türeyen resmî ödeme YÜK'tür (damga vergisi böyledir, burden_components'te kayıtlıdır); tutarı dışarıdan gelen, kendi başına duran resmî ödeme KALEM'dir (noter harcı, tapu harcı, gümrük). resmi_odeme statüsü damgayı KAPSAMAZ.
- **GÖRSEL GRUP:** başlık para taşımaz, veritabanında satırı yoktur, rakamı altındakilerden türer. 2 para-seviyesi doktrini korunur. Şema karşılığı: item_library.is_group boolean; true olan satır kalem ekleme listesinde görünmez, çapraz-kart taramasına girmez, fn_add_budget_item ile eklenemez. Grup üyeliği catalog_code'un tire öncesi parçasından türer (1101-01 → 1101).
- **REVİZYON (17 Ağustos 2026, Engin) — AİDİYET KODDAN ÇIKTI:** yukarıdaki GÖRSEL GRUP maddesinin son cümlesi ("Grup üyeliği catalog_code'un tire öncesi parçasından türer") GEÇERSİZDİR. Aidiyet artık budget_items üzerinde kendi alanında yaşar: **heading_code**, METİN, başlığın katalog kodunu tutar (örnek: 1106), NULL = başlıksız. Kütüphaneden doğan kalemde alan doğumda kodun tire öncesi parçasından KENDİLİĞİNDEN dolar (kullanıcı hiçbir şey görmez); serbest kalemde kullanıcının seçtiği başlık yazılır, seçilmediyse NULL kalır ve SONRADAN DEĞİŞTİRİLEBİLİR. catalog_code DONMUŞ kalır, mühür versiyon eşleşmesi (K-F) bozulmaz. Gerekçe: aidiyet kodun içindeyken yanlış cevabın dönüşü yoktu — tek düzeltme yolu sil-yeniden aç idi ve mühürlü bütçede bu, tutanakta yeniden-adlandırma gibi görünürdü; tam da K-F'nin önlemek için yazıldığı şey. UYGULANDI (d72a9c3, 19 Ağustos 2026): budget_items.heading_code CANLI. Doğumda fn_add_budget_item doldurur (kütüphane modunda tire öncesi parça, o kod item_library'de is_group satırı olarak varsa; yoksa ve serbest modda NULL). Geriye dönük doldurma aynı kuralla yapıldı: 149 kalemin 20'si doldu (KART 1100'ün tamamı), 129'u NULL kaldı (KART 1500'ün kütüphanesinde hiç başlık satırı yok, düz liste). SANDBOX BULGUSU: doldurma UPDATE'i trg_log_items'i tetikleyip her kaleme bir denetim satırı yazıyordu (ölçüm: 502 kalemlik kartta 500 satır / 640 kB, hepsi changed_by NULL); tetik göç süresince kapatılıp sonunda geri açıldı, canlı doğrulama imzasız log üretmediğini gösterdi. EK (4 Eylül 2026, migration 20260904120000): yukarıdaki "Doğumda fn_add_budget_item doldurur" cümlesi yalnız fn_add_budget_item'ı sayıyordu; fn_open_budget kendi kalem döngüsünde heading_code alanını hiçbir tanımında yazmıyordu, dolayısıyla 19 Ağustos'taki doldurmadan SONRA şablondan açılan her bütçede şablon-kaynaklı kalemler Başlıksız kaldı. Bu dilim doğum yolunu fn_add_budget_item ile aynı kurala getirdi ve ikinci bir geriye dönük doldurma çalıştırdı (dolan=30, bos=15, imzasiz_log=25).
- **NEDEN METİN, NEDEN FK DEĞİL:** budget_items bu deseni zaten uyguluyor — catalog_code METİNDİR, library_item_id yalnız köken içindir (K-G). Mühürlü bütçe yaşayan kütüphaneye canlı bağla bağlanmaz: kasa donmuş fotoğraftır, kütüphane büyüyen raftır. NULL kendiliğinden "başlıksız" anlamı taşır; hiç başlığı olmayan kartlarda (KART 1500) boş bir kısıt gerilmez. Bütünlük denetimi (seçilen kod bu kartın aralığında mı ve gerçekten is_group satırı mı) taşıma çağrısının içinde yapılır.
- **AÇIK KALAN (kayıt, MÜHÜR turunun sorusu):** başlığın ADI budget_items'ta durmaz, her çizimde kütüphaneden okunur. Bir başlık yeniden adlandırılırsa mühürlü bütçe yeni adı gösterir. Bu açık metin/FK seçiminden BAĞIMSIZDIR ve bu kararla kapanmamıştır.
- **ŞERH (1600 çok-aralık):** heading_code aralık denetimi iki-hane ön-ek varsayımına GÖMÜLMEZ. KART 1600 iki aralığı birden tanımlar (15xx/16xx + 39xx — KART-KATALOGU 1600/3900 KARARI); library-service.ts iki-hane aidiyet kuralı ve fn_add_budget_item aralık denetimi o turda zaten genişletilecektir, bu alan aynı genişlemeye tabidir.
- **AÇIK ŞEMA SORUSU (21 Ağustos 2026, KART 1600 turundan) — CEVAPLANDI (1 Eylül 2026, KART 1600 M1):** heading_code tek kolondur, oysa KART 1600'ün üç kademeli yapısı (kart grubu → oyuncu özet başlığı → alt kalemler) iki kademe için iki ayrı anahtar gerektiriyor — bugünkü şema bunu karşılamıyor, karara bağlanmadı. Ayrıca oranla türetme (temsilci satırının komisyon oranından türeyen tutar) için alan yok; türetilen sayı TUTAR olarak SAKLANMAZ, ORAN olarak saklanır (B18 ile aynı ilke).
  **CEVAP:**
  - İki kademe için iki ayrı anahtar: birinci kademe heading_code (kütüphane kodu, mevcut), ikinci kademe person_object_id (kişi etiketi, 1 Eylül 2026).
  - Özet başlığı ÇEKİLMEZ, TÜRETİLİR: kişi etiketinin farklı değerlerinden doğar. Kütüphanede karşılığı yoktur ve olmayacaktır.
  - Oranla türetme için derive_rate hanesi açıldı. B18 aynen geçerli: tutar saklanmaz.
  - "NEDEN METİN, NEDEN FK DEĞİL" doktriniyle çelişmez: kişi etiketi bütçe-yerel bir kayıttır, yaşayan kütüphaneye değil bütçenin kendi kontrollü listesine bağlanır.
- **ETİKETİN SINIRI (1 Eylül 2026):**
  - Kişi etiketine ROL hanesi eklenecek (yalnız kind='kisi' olanlarda dolu). AÇIK: henüz yazılmadı.
  - ETİKET İNCE KALIR: yalnız ad, cins, rol. Ücret, ekipman, iletişim bilgisi, şirket künyesi etikete YAZILMAZ — bunlar tedarikçi hafızasının işidir ve iki yerde yaşamamalıdır.
  - Ajansın adı bugün satırda serbest metindir. Bu GEÇİCİ çözümdür; tedarikçi kütüphanesi geldiğinde satır kayda işaret edecek.
  - EKSEN AYRIMI: bizim kind (kişi/iş) ayrımımız ile Saturation'ın kişi/şirket ayrımı AYNI EKSEN DEĞİLDİR. Bizimki "etiket bir kişiyi mi yoksa Stunt gibi bir iş kümesini mi gösteriyor" der; ötekisi "ödeme alan birey mi şirket mi" der. İkinci eksen kütüphane turunda ayrıca doğar, birincinin üstüne bindirilmez.
  - Etiketin bütçe-bazlı KAPSAMI, tedarikçi hafızası geldiğinde yeniden konuşulacak. Yamdu ve Saturation kişiyi projenin üstünde tutuyor.
- **TEMSİLCİ KOMİSYONUNUN EVİ (2 Eylül 2026, KART 1600 M2):** komisyon kendi budget_items satırında yaşar; tutarı saklanmaz, `budget_items.derive_rate` hanesindeki orandan doğar (B18). Taban, aynı kişi etiketindeki `derive_rate` boş satırların Ara toplam değerlerinin toplamıdır; türetilmiş satır tabana girmez. Hesap iki geçişlidir ve `src/app/muhasebe/budget/person-groups.ts` içinde saf fonksiyon olarak yaşar. BAYAT: `docs/IS-SIRASI.md` Backlog bölümündeki "1600 AJANS/MENAJER KOMISYONU DIKISLERI" maddesinin (b) ve (d) şıkları komisyonu `item_burdens` kovasına koyuyordu; M1 şeması (1 Eylül 2026) satır yolunu canlıya aldığı için o öneri geçersizdir. Aynı maddenin (a) şıkkı (`item_burdens.origin` ayracı) konusuz kalmıştır: komisyon kovada olmadığı için `fn_refill_item_burdens` ona hiç dokunmaz.
- **UYUYAN AJANS KOMİSYONU BİLEŞENİ (2 Eylül 2026 bulgusu):** 13 Haziran 2026 göçü `burden_components` içine `ajans_komisyonu` bileşenini, `rate_catalog` içine onun yüzde 10 taslak oranını ve `burden_packages` içine `ajansli_cast` paketini tohumlamıştı; 25 Haziran göçü bileşeni `additive` cinsine bağladı. Bugün hiçbir ödeme statüsü onu çağırmıyor (`payment_status_burdens` içinde satırı yok) ve canlı `fn_open_budget` paketleri hiç okumuyor, yalnız `fn_refill_item_burdens` çağırıyor. BAĞLANMAYACAK: additive bileşen doğrudan Yasal Yük kolonuna yazılır, oysa komisyon yasal bir yük değildir ve kendi satırında KDV taşır. Silinmedi, çünkü canlı veride referansı olabilir; kayıt uyandırılmaması için düşüldü.
- **DİL KURALI:** kod/yorum ASCII; kullanıcıya görünen veri düzgün Türkçe.
- **TEK İMZA DOKTRİNİ:** RPC fonksiyonu tek imza olarak yaşar. Parametre eklendiğinde eski imza AYNI migration'da drop edilir; overload bırakılmaz. Gerekçe: 1 Ağustos 2026'da fn_add_budget_item'a p_existing_code eklendi, 5 parametreli sürüm sessizce canlı kaldı — hatalı kod üretimi taşıyan, korumasız, grant'lı bir kopya olarak. İki overload ayrıca tuzaktır: her davranış değişikliğinde hangisinin canlı olduğu yeniden sorulmak zorunda. (fn_add_budget_item 5→6 parametre geçişinde uygulandı, bkz. migration 20260815150000.)

## NET/BRÜT DOKTRİNİ REVİZYONU (Engin kararı, 22 Ağustos 2026, TÜM kartlarda geçerli)

**UYGULANDI (31 Ağustos 2026, bu commit):** Model koda indi, ama aşağıdaki KOLON ANLAMLARI maddesinin özgün 22 Ağustos taslağından bir noktada FARKLI uygulandı — gerçek kazanır, madde buna göre düzeltildi: "Ara toplam" (eski adı "Net toplam") kolonunun anlamı DEĞİŞMEDİ (çıplak çarpım olarak kaldı); yasal yükü taşıyan ayrı bir **Maliyet** kolonu eklendi. Gerekçe: mevcut Ara toplam kolonunun anlamını geriye dönük değiştirmek yerine ayrı bir Maliyet kolonu eklemek hem eski değeri korudu hem toplama zincirini (Ara toplam → Yasal Yük → Maliyet → KDV → Toplam) tek yönlü ve net bıraktı. Kolon seti 11'den 13'e çıktı; Oran bu sete DAHIL DEĞİLDİR, KART 1600'ün kendi hanesidir (bkz. BUTCE-EKRAN-KARARLARI.md §20).

- **AYRIM ÖLÇÜSÜ GERİ ALINABİLİRLİK.** KDV geri alınır, o yüzden maliyet değildir ve yalnız toplamda yaşar. SGK, işsizlik primi ve stopaj yapımcının cebinden çıkar, geri alınamaz ve mahsup edilemez; brüt maaş / brüt vergili gibi görünseler de NET GİDERDİR.
- Fon ve kurumların istediği "net bütçe" = KDV hariç toplam maliyet.
- **KOLON ANLAMLARI (31 Ağustos 2026'da düzeltildi, yukarıdaki UYGULANDI notuna bkz.):** Ara toplam = birim net × Miktar × X (çıplak çarpım, DEĞİŞMEDİ). Yasal Yük = saf yük (KDV artık içinde değil). Maliyet = Ara toplam + Yasal Yük (YENİ kolon). KDV kendi kolonu. Toplam = Maliyet + KDV.
- Toplam rakamsal olarak DEĞİŞMİYOR; değişen şey Yasal Yük kolonunun anlamı ve iki yeni kolon (Maliyet, KDV).
- Önceki "her nakit çıkışı, KDV dahil, maliyettir" gerekçesi GEÇERSİZ.
- Not: bordrolu satırda KDV sıfır olduğu için Maliyet ile Toplam aynı rakamı gösterir; bu beklenen davranıştır (Engin onayı, 22 Ağustos 2026).
- **SIRA BAĞI (22 Ağustos 2026):** kolon setinin genişlemesi (11 kolondan 13'e; Maliyet ve KDV eklenmesi) MÜHÜR-3'ten ÖNCE inmelidir. Gerekçe B18: hesaplanmış değer saklanmaz, formül kodda yaşar. Mühürleme yüzeyi açıldıktan sonra kolon modeli değişirse mühürlenmiş tutanaktaki rakam ile ekranın gösterdiği rakam ayrışır ve fark geri alınamaz.
- **AÇIK, KARARA BAĞLANMADI (22 Ağustos 2026): "Net toplam" kolonunun ADI.** Model kilitli, ad açık — bordrolu satırda "net" yazan hücrenin değeri, muhasebe dilindeki brüt maaşı aşıyor. Değerlendirilecek adaylar: "Maliyet" ve fon dilindeki "net bütçe" tabiri.
  **KAPANDI (Engin kararı, 31 Ağustos 2026): Ara toplam / Toplam.** Gerekçe: bordro dilinde "net" ve "brüt" ekranda yanlış çağrışım yapıyordu — bordrolu satırda "net" yazan hücrenin değeri muhasebe dilindeki brüt maaşı aşıyor, "brüt" yazan hücre ise brüt maaşı değil işveren maliyeti + KDV'yi gösteriyordu. Sektör emsalindeki Subtotal/Total çiftinin Türkçe karşılığı alındı (Yamdu icmali: Subtotal · Fringes total · Total; MMB detay ızgarasında çivilenen kolon Subtotal). 22 Ağustos'ta aday tutulan iki isim ("Maliyet" ve "net bütçe") bu arada harcandı: "Maliyet" ayrı bir kolon oldu, fonların "net bütçe" dediği rakam da tam olarak o Maliyet kolonudur.
