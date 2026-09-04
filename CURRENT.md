# KAAPA — CURRENT.md

⚠ TERMİNOLOJİ: 2026-07-11 öncesi kayıtlarda Miktar=kişi/adet, Çarpan=süre okunur; sonrasında Miktar=süre, X=kişi/adet (bkz. GLOSSARY tarihçe).

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR. Ne yapıldığı git log'da, kararlar kendi ev dosyalarında yaşar (harita: INDEX.md bölüm 7.0).

## Milestone

M2 — Çekirdek Döngü. Bütçe: kavram + şema + DB temeli + göç CANLI; kart mimarisi 1100-1600 KİLİTLİ.

- **21 Haziran – 25 Ağustos 2026 (özet; ayrıntı git log, kararlar ev dosyalarında).** Bütçe DB temeli ve `fn_open_budget` canlıya girdi; vergi/yük modeli ile KART 1500 ekranı kilitlendi. DILIM-3 bordro motoru beş dilimde tamamlandı (şema → katalog tohumu → saf çözücü → UI kablolaması → genel-desen sökümü); şirket profili şeması ve `fn_resolve_sgk_scenario` canlı. Terminoloji devrimi uygulandı. MÜHÜR-1 ve MÜHÜR-2 canlı, mühürleme yüzeyi MÜHÜR-3'e kaldı. R1/R2/R3 ekran refaktörü ve KLV klavye motoru kuruldu; BORÇ-A ve BORÇ-B turları kapandı. AĞUSTOS: KABUK tasarımı `docs/KABUK-KARARLARI.md`yi tek kaynak olarak kurdu, sprint 8-12 Ağustos'ta kapandı (tag v0.4-kabuk); doc-check (Denetim A-F) ve INDEX.md yaratıldı; tablo genişlik turu, kolon takası ve kart masası (db8d5bd) geldi. KART 1100 iki dilimde tamamlandı (1100-A statü/katalog/tohum, 1100-B başlık çizimi) ve aidiyet koddan çıkıp `budget_items.heading_code` alanına taşındı. Proje yaşam döngüsü (arşiv, geri alma, silme) tasarlandı ve canlıya girdi. NET/BRÜT doktrini revize edildi, KART 1600 üç kademeli tasarımı karara bağlandı. 25 Ağustos'ta optimizasyon turu açıldı.
- Tarih notu: Milestone kayıtlarında "22 Ağustos (4. oturum)" diye geçen oturumun commit'leri 25 Ağustos tarihlidir; özet commit tarihine göre yazıldı.
- **OPTİMİZASYON TURU KAPANDI (30 Ağustos 2026).** Açılış üçlüsü 90.984 → 19.598 bayt (~30.300 jetondan ~6.500'e), deterministik kapı 0 → 7. Son parça D6 Şartname kod olsun: kolon seti columns.ts'e, terim domain.ts'e taşındı. D6'nın vergi-yük parçası YAPILMADAN kapandı — parça kuralın kodda olduğu varsayımıyla yazılmıştı; statü-yük cetveli veritabanında yaşıyor (payment_status_burdens) ve B20/B16 gereği orada kalması doğru. Cetveli bugün hiçbir test korumuyor; koruması, cetveli değiştiren göçün Engin onayından geçmesidir.
- **2 ve 3 Eylül 2026.** KART 1600 M2 motoru canlıya girdi (kişi etiketine göre gruplama + iki geçişli oran türetmesi, saf fonksiyon; ekran bağlanmadı). M3 tasarımı kapandı: komisyon satırında dört çarpım hanesi birleşir ve birleşik hücrede yalnız oran durur; özet satırında karakter adı, oyuncunun kendi kaleminde gerçek adı. Oyuncular listesine Görev hanesi eklendi, dublör listeye alındı. Kararların tam metni ev dosyalarındadır.
- **3 Eylül 2026 (M3a + M3b, beş commit).** `a669508` bayat doküman düzeltmesi: IS-SIRASI'ndaki 1600 komisyon dikişlerinin akıbeti yazıldı (komisyonun evi yük kovası değil kendi satırı), 3 Eylül turunun açtığı iki soru bu dosyaya taşındı. `f905234` + `b8595b6` M3a-1: komisyon satırında Birim + Birim net + Miktar + X tek hücrede birleşti, oran `budget_items.derive_rate` hanesine yazılıyor (0 ile 100 arası), hücre KLV ızgarasında `unitNet` eşdeğerlik grubuna girdi; düzeltme commit'i tampon okumasını onardı (ondalık yazılamıyordu). `9b43236` M3a-2: özet satırı aynı kişi etiketinin satır sayısı ikiye çıkınca beliriyor, numarayı özet alıyor, alt kalemlerin No hanesi boşalıyor; katlama üçgeni başlık ve özet satırında, tüm kartlarda. `5a9b6d6` M3b-1: kişi etiketine `role_name` ve `duty_code` haneleri, iş etiketinde boş kalmayı zorlayan kısıt, `person-label-service.ts`, `person_object_id` için yazma yolu. `925459f` M3b-2: Oyuncular listesi panosu (Rol · Oyuncu · Görev) ve kalem satırında Kişi düğmesiyle etiket bağlama.
- **SIRA DERSİ (3 Eylül 2026).** Bu turda beş dilim yazıldı ve hiçbiri ekranda görülemedi, çünkü KART 1600 masada yok: şablon gövdesinde iki kart var (1100 ve 1500), `item_library`'de 16xx aralığından yalnız 1618 tohumlu. Ekran işi kartın kendisinden ÖNCE sıraya alınmıştı. Bundan sonra bir kartın ekran işi sıraya girmeden önce o kartın şablonda ve kütüphanede karşılığı olup olmadığı doğrulanır; "neye bağlı" satırı CURRENT.md'den olduğu gibi aktarılmaz, kaynaktan doğrulanır.
- **4 Eylül 2026 (DEĞİŞMEZLER YÜZEYİ).** 30 Ağustos optimizasyon turunda "Korunan önceki kararlar" bölümü CURRENT.md'den silinip maddeler ev dosyalarına taşınmıştı, ama oturum açılış prosedürü ev haritasını (INDEX.md §7.0) okumuyordu — her oturum doktrini yeniden türetmeye çalışıyordu. Yeni dosya `docs/DEGISMEZLER.md` açıldı (evi doğrulanmış on değişmez madde, tavan 2 KB); açılış prosedürü dosyasının okuma sırasına INDEX.md §7.0 ve bu dosya eklendi; INDEX.md §7 dosya listesine ve §7.0 tablosuna satır girdi. Yeni açılış okuması (CLAUDE.md + CURRENT.md + INDEX.md §4+§7.0 + DEGISMEZLER.md) = 28.440 bayt (eski 19.598'den +8.842; bu dilimin kendi eklediği yalnız ~3.900 bayt — INDEX §7.0'ın okuma kapsamına girmesi + yeni DEGISMEZLER.md; kalan artış CURRENT.md'nin 30 Ağustos'tan bugüne organik büyümesi).
- **4 Eylül 2026 (AİDİYET-3, migration `20260904120000_aidiyet3_fn_open_budget_heading_code.sql`).** `fn_open_budget` doğum yolu `heading_code` yazmıyordu — 17 Ağustos kararı yalnız `fn_add_budget_item`'a konmuştu; 19 Ağustos'taki geriye dönük doldurmadan SONRA açılan bütçelerde KART 1100'ün başlıkları ekrana gelmiyordu. Bu dilim doğum yolunu aynı kurala getirdi ve ikinci bir geriye dönük doldurma çalıştırdı. Doğrulama: `catalog_code like '11%'` sorgusunda dönen 30 satırın tamamı doğru `heading_code` ile geldi (1101→1101, 1102→1102 vb., tire-öncesi kodla birebir); `catalog_code like '15%' and heading_code is not null` sorgusu 0 döndü (KART 1500'ün kütüphanesinde başlık satırı yok, beklenen). KART 1600 tohumu bu dilimin KAPSAMINDA DEĞİL.
- **31 Ağustos 2026.** Kolon modeli tamamlandı (Açıklama kaldırıldı ve şemadan düşürüldü; KDV ayrıldı, Maliyet eklendi; Ara toplam / Toplam adlandırması) — NET/BRÜT doktrini artık kodda ve SIRA BAĞI MÜHÜR-3'ten önce karşılandı. `yemek` statüsü ayrıldı. Statü kolonu ölçülüp 106px'e indirildi. Bordro motorunun DB okuması toplu hale getirildi ve kart kapağı Maliyet'e geçerek ikinci hesap tanımını ortadan kaldırdı. Ayrıntı git log'da, kararlar ev dosyalarında.

## Durum

- HEAD: 925459f (3 Eylül 2026 — KART 1600 M3a ve M3b ekran dilimleri). Denetim E gereği burada CURRENT.md'ye dokunan son commit'in EBEVEYNİ yazar; kapanışta YAZMA ANINDAKİ HEAD yazılır, çünkü kapanış commit'i CURRENT.md'ye dokunur ve "son commit" o olur.
- Migration 20260822130000, 20260830120000, 20260830130000, 20260830140000, 20260831120000, 20260831140000, 20260901130000 CANLIDA. Kod: 328/328 test (3 Eylül 2026 M3a dilimleri 6 test ekledi: KLV dikey gezinme 2, buildRenderRows 4). Build geçer, eslint 0 hata (2 bilinen react-refresh uyarısı). Originde tek dal: main.
- Bütçe kolon modeli bugünkü hâli: 13 veri kolonu + etiketsiz silme hanesi (dizi uzunluğu 14) — No · Ad · Statü · Dönemler · Birim · Birim net · Miktar · X · Ara toplam · Yasal Yük · Maliyet · KDV · Toplam. Ara toplam = çıplak çarpım, Yasal Yük = saf yük, Maliyet = Ara toplam + Yasal Yük, Toplam = Maliyet + KDV; tableMinWidth 1376, kullanılabilir alan ~1169 (fark DURUYOR, çözülmedi). Statü kümesi SEKİZ — `yemek` 31 Ağustos'ta `konaklama`dan ayrıldı, vergi rejimi ikisinde aynı, ayrım anlam ayrımı. Statü kolonu 106px'e indirildi (ölçüm: Windows + Chrome gerçek pencere; MAC'TE DOĞRULANMADI; ölçüm aracı `scripts/statu-genislik-olcumu.html`). Bordro motorunun DB okuması TOPLU (`deriveBordroFieldsBatch`); kart açılışında kalem başına değil bütçe başına altı sorgu; `deriveBordroFields` artık onun ince sarmalayıcısı, iki fetch yolu YOK. Kart kapağındaki rakam MALIYET ve kart tablosunun toplam şeridiyle AYNI fonksiyondan (totals.ts cardTotals) geliyor; `kartNetToplamlari` ve `fetchCardNetTotals` SİLİNDİ, ikinci tanım kalmadı. KOLON HİZASI: salt-okunur özet yazısının payı denetimin TÜRÜNDEN gelir — yazı kutusu 9px, açılır liste 13px (1 Eylül 2026 ölçümü, Windows + Chrome; MAC'TE DOĞRULANMADI). Birim ve Dönemler 13, Birim net / Miktar / X 9. Dönemler hücresi selectTd oldu, çift dolgu kalmadı.
- ÇALIŞMA ORTAMI: yedi deterministik kapı kurulu (dal, sığ klon, damga varlığı, damga tazeliği, ASCII'ye düşmüş .md metni, tanımsız CSS token, test sayısı kaybı) ve `supabase db push` onaya bağlı. Ayarlar `.claude/settings.json`, kapılar `.claude/hooks/`.
- KURULU/ÇALIŞIYOR: auth ve çok-proje · saha fiş girişi · yönlendirme/düzeltme · davet/rol · onay/red · proje, bütçe ve servisler · onboarding · bütçe DB temeli · `fn_open_budget` · CFE (28/28) · KART 1500 ekran TAM · KART 1100 başlıklı çizim · ödeme-statüsü şeması · yük kovası cinsi · Not kolonları · kart masası · proje arşiv/geri alma/silme.
- BORDRO MOTORU uçtan uca kablolu: şema → servis (`deriveBordroFields`, dönem-bazlı `periodBreakdown`) → UI (genel dört-alan deseni, bordroya özel dal YOK). Motor ve kablolama 63/63 test ile korunuyor.
- KLV KAPANMADI: macOS gerçek cihaz turu yapılmadı. `v0.2-klv` etiketi ATILAMAZ.
- BORÇ DURUMU: `docs/TECH-DEBT.md` tek otoritedir, sayı burada taşınmaz.

## MÜHÜR DURUMU

Bu projede mühürlü bütçe yok ve hiçbir kullanıcı bugün bir bütçeyi mühürleyemez. `fn_lock_budget` RPC'sini hiçbir kod çağırmıyor (tek geçtiği yer `payroll-read.ts` içindeki bir hata metni), `budget_versions` tablosunu okuyan tek dosya da odur. Mühürleme yüzeyi MÜHÜR-3 ile gelecek. Bu satır bilerek yazıldı: mühür kısıtı, MÜHÜR-3 canlıya girene kadar yeni tasarımlara engel olarak getirilmez.

## Karar evleri (işaretçi)

Aşağıdaki konuların TAM metni kendi ev dosyasındadır; CURRENT.md kopya taşımaz. Tam harita: `INDEX.md` bölüm 7.0.

- Vergi ve yük modeli — üç eksen, statü cetveli, `rate_catalog` → `docs/butce/VERGI-MEVZUATI.md` + `docs/butce/PERSONEL-MEVZUATI.md`
- KART 1500 kolon seti ve terminoloji mührü → `docs/butce/BUTCE-EKRAN-KARARLARI.md` + `docs/GLOSSARY.md`
- KART 1600 üç kademeli tasarım → `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20 + `docs/butce/KART-KATALOGU.md` 7.5
- Bütçe şema kararları (B-serisi), NET/BRÜT doktrini, sıra bağları → `docs/butce/BUTCE-SEMA-KARARLARI.md`
- Kabuk, sol ray, kart masası → `docs/KABUK-KARARLARI.md`
- Kart mimarisi ve kilitli kartlar (1100, 1300, 1400, 1500, 1600) → `docs/butce/KART-KATALOGU.md`
- Ödeme statüsü kümesi ve Statü rehberi → `docs/butce/BUTCE-UI-MIMARISI.md` + `docs/butce/BUTCE-EKRAN-KARARLARI.md`

## Sıradaki iş

1. **KART 1600 TOHUMU — ÖNCE BU (Engin kabul etti, 3 Eylül 2026).** Kart masada yok; ekran tarafında yazılmış her şey buna bağlı. İki göç, 1100 emsalinin (`20260815160000` kütüphane tohumu + `20260815180000` şablon kartı) birebir deseniyle: (a) `item_library`'ye 16xx ve 39xx atomları, KART-KATALOGU §7.5'teki [Ç] / [K] işaretlerine göre; (b) aktif sistem şablonunun yeni sürümü, eskisi `is_active=false`, gövdeye 1600 kartı ve yalnız [Ç] atomlarından oluşan çekirdek satır seti. **Kapsam kararı (Engin, 3 Eylül 2026):** göç MEVCUT bütçelere dokunmaz, kart yalnızca YENİ açılan bütçelerde doğar — 1100 kartında da böyle yapılmıştı. Şablona GİRMEYECEK atomlar: 1611 Mesai, Ek Çekim, 1618 Temsilci Komisyonu (ilk ikisi blok içi eklemeden, üçüncüsü türetmeden doğar). Dönem varsayılanları KART-KATALOGU §7.5'te yazılı. Göç `supabase db push` gerektirir, yani SQL Engin tarafından okunup kabul edilmeden uygulanmaz. **BAĞLI İŞ:** `library-service.ts`'teki iki hane aidiyet kuralı (`catalogCode.slice(0,2)`) ve `fn_add_budget_item`'daki aralık denetimi tek aralık varsayımıyla yazılmıştı; 1600 iki aralık taşıdığı için (16xx + 39xx) genişletilmesi gerekiyor — KART-KATALOGU §7.5 bunu 15 Ağustos 2026'da kayda geçmiş.
2. **M3b-3 — AJANS VE MENAJER TİKLERİ.** Oyuncular listesinde tik atılınca komisyon satırı doğar (BUTCE-EKRAN-KARARLARI §20, 2 Eylül 2026: tik varsa satır doğar, yoksa hiç doğmaz). Neye bağlı: satırın varsayılan oranı hiçbir yerde saklanmıyor; KART-KATALOGU §7.5 "şablondan %20 varsayılan gelir" diyor ama şablonda böyle bir hane yok. Bu soru karara bağlanmadan tik yazılamaz.
3. **TÜRETİLEN TUTARIN EKRANA BAĞLANMASI.** `derivedUnitNets` yazıldı, test edildi, canlıda ama hiçbir yerden çağrılmıyor; komisyon satırının Ara toplam hanesi orandan doğmuyor. Kişi etiketi artık yazılabildiği için taban doğabiliyor, yani bu iş 1. maddeden sonra yapılabilir.
4. **KÜÇÜK BORÇ.** `use-edit-buffers.ts` içindeki `commitNote` genel alan yazıcısıdır ama hata mesajı sabit "Not kaydedilemedi"; kişi bağlama ya da başlık değiştirme başarısız olursa kullanıcı yanlış metni görür. Tek satır, bir sonraki kod dilimine iliştirilir.

## Açık kalanlar

Bu bölüm KARAR DEĞİL, henüz karara bağlanmamış açık sorulardır (1 ve 3 Eylül 2026 tasarım turları).

- Ek Çekim atomunun katalog kodu atanmadı.
- "baz+ek" ayrımının hangi hanede yaşayacağı.
- Özet satırının numaralandırması (DOOD öneme göre numaralıyor, başrol 1; biz ne yapacağız?)
- Aynı kalemden iki satırın ekran sırası neye göre sabitlenecek.
- Şablonun listeye göre dönüşmesinin teknik yolu.
- Kart aralık genişlemesi (16xx + 39xx) genel ekleme için hâlâ gerekli.
- Oyuncular listesinin Görev hanesinde dublör seçilince satır nereden doğacak (üç yol konuşulmadı: atomlar şablona alınır / mesai ile ek çekim gibi blok içi eklemeden gelir / liste satırı doğurur).
- Dublör koordinatörü ve benzeri dublör işlerine sahada verilen toplu bütçenin kart karşılığı.

Uzun vadeli iş, backlog ve tamamlananlar: `docs/IS-SIRASI.md`.
