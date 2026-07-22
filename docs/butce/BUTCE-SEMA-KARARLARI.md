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
  - items[]: { ref, name (Sebep), detail, note, unit? (null=karttan miras), payment_status? (null=sirket), multiplier, sort_order } — unit_net YOK (açılışta 0), periods YOK (köprü boş). NOT (DILIM-2b): paket yolu emekli; kova artik statuden dolar (payment_status_burdens eslemesi). cards[] default_package ve items[] package alanlari okunmaz.
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

## SATIR-EKLEME + KALEM KÜTÜPHANESİ (KİLİTLENDİ 2026-07-21, Opus tasarım oturumu)

### H. İki-kod doktrini (K-A)
- `item_code` AYNEN KALIR: bütçe-yerel monoton kimlik sayacı, silinen kod geri verilmez (mevcut doktrin). Kimliktir, konum söylemez.
- **Katalog kodu** yeni kanonik alan: MMB-uyumlu, kütüphanede doğar, budget_items'a kopyalanır. Görünüm sırası ve UI "Kod" kolonu katalog kodundan okunur.
- Kod biçimi alt-kod taşıyabilir (örn. 1601-03): MMB'de kart altı ~97 numaralı hesap + hesap altı numarasız detay satırları var (MMB-6.1 örnek plan, 1600 Talent: 1601–1617 + 1698 Miscellaneous + 1699 Fringe); KAAPA düz tabloyu korur, derinliği koda gömer. Damıtımda çoğu kalem düz hesaba oturur (kapasite kararı: 2+3 karışımı).
- Pilot şablondaki item ref'leri (i1501–i1505) katalog koduna resmîleşecek — kod sıfırdan icat edilmeyecek.

### I. Aidiyet = kod (K-B)
- Kart aidiyeti ayrı alan DEĞİL, kodun aralığıdır (15xx → KART 1500). SSOT tek: kod.
- Çok-karta uyan kavram her kart için o kartın aralığından ayrı kodla ayrı kütüphane kaydı olur (Stunt Vehicle → TRANSPORT örneğindeki mevcut ilke genelleşti).

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
