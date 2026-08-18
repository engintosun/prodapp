# KAAPA — Mimari Kararlar Dokümanı

**Durum:** M1 (temel altyapı + auth) kapandı. M2 (çekirdek döngü) aktif — DILIM-2/DILIM-3 (bordro motoru) tamam, R-serisi ekran refaktörü (R1-R3) tamam, KLV (klavye motoru, K1-K13) tamam, MÜHÜR-1/2 (bütçe mühürleme çekirdeği + servis okuma çatalı) tamam. Sıradaki: KABUK (uygulama kabuğu); MÜHÜR-3a/3b KABUK sonrasına alındı (Engin kararı, 4 Ağustos 2026). Detay: CURRENT.md.

-----

## BÖLÜM 1 — ÇALIŞMA SÖZLEŞMESİ
(Çalışma sözleşmesi tek kaynağı CLAUDE.md'dir; buradaki tekrar 2026-06'da kaldırıldı.)

## BÖLÜM 2 — VİZYON KONTROLÜ

### 2.1 Faz 1 Kesin Sınırı

Listede yoksa Faz 1'de yoktur:

- Davetiye ile kullanıcı kaydı
- Rol bazlı erişim (Saha, Departman, Muhasebe)
- Fiş/fatura fotoğrafı yükleme ve OCR ile veri çekme
- Harcama kaydı oluşturma, düzenleme
- Onay zinciri (Saha → Departman → Muhasebe)
- Avans talebi, kapama, bakiye takibi
- Kural bazlı şüpheli işlem tespiti (modüler, genişlemeye hazır)
- Harcama listeleme, filtreleme, arama
- PDF ve Excel export
- Mesajlaşma (onay sürecine bağlı bildirimler)
- Çoklu proje desteği (login'de proje seçimi, veri izolasyonu)
- Bütçe oluşturma ve kart/kalem masası
- CFE hesap çekirdeği
- Bordro motoru
- Mühürleme/versiyonlama

*(Not, 5 Ağustos 2026 doküman denetimi: bu dört madde 2.2 kapsam-dışı listesinden çıkarılmıştı ama 2.1'e hiç eklenmemişti; bu denetimde bulundu.)*

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Belirsiz kapsamın v8'deki scope creep'i tekrarlamaması.

### 2.2 "Hayır" Listesi — Faz 1'de Yapılmayacaklar

(Not: CFE ve bütçe oluşturma modülü ARTIK YAPILDI — listeden çıkarıldı; güncel durum CURRENT.md + docs/butce/.)

- XML e-fatura / GİB entegrasyonu
- Envanter yönetimi
- Departman iş akışı modülleri (sanat, kostüm, prodüksiyon)
- Çoklu dil desteği / lokalizasyon altyapısı

  *Ne ertelendi (kayıt, 6 Ağustos 2026): Hedef diller — Türkçe native, İngilizce
  zorunlu; sonrasında Avrupa dilleri, Arapça, Rusça, Çince, Hintçe. Dil seçim
  ekranı ve rol başına dil tercihi (v8'de tasarlanmıştı). Film/TV uluslararası
  çalışan bir sektör; dil İLERİDE KESİN gelecek. Çözüm yönü kolon değil çeviri
  tablosu (bkz. GLOSSARY). Faz 1'de yapılmayacak kararı değişmedi.*
- Üçüncü parti entegratör (muhasebe yazılımı, ERP)
- Anomali motoru (istatistiksel katman — kural bazlı tespit VAR, istatistiksel YOK)
- Mobil native uygulama (PWA yeterli, Capacitor ile store ileride)
- Super-admin / auditor rolü (ihtiyaç pilotta netleşir)
- Şirketler arası veri paylaşımı (cross-company)
- Mesai / fazla çalışma ücreti — günden güne değişen saat (biri 1 saat, biri 4 saat) × saatlik ücret; mevcut Birim modeli (gün/hafta/ay, sabit-tekrarlı) bunu temsil edemez, ayrı tasarım oturumu gerekir. (Eski TECH-DEBT TD-19; 31 Temmuz 2026'da buraya taşındı — borç değil, faz kapsamı kararı.)

**Karar:** 22.05.2026 (güncelleme 2026-06: CFE+bütçe çıkarıldı) | **Gerekçe:** Açık "hayır" olmadan her şey örtük "belki" olur.

### 2.3 MVP → Pilot Tanımı

Pilota çıkmak için:

- 2.1 listesindeki tüm özellikler çalışır durumda
- Gerçek bir prodüksiyonda 1 hafta kesintisiz kullanılabilecek kararlılıkta

Pilot hazırlık eklentileri (çekirdek sonrası sprint):

- Seed data (test ortamı için)
- Hata raporlama (basit — buton, Supabase'e kayıt)
- Kullanım metrikleri (query bazlı)
- Onboarding rehberi (rol bazlı ilk giriş)
- Admin dashboard (özet ekran)

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Pilota hazır çıkmak — profesyonel ilk izlenim.

### 2.4 Başarı Kriterleri

Pilot "başarılı" eşikleri (başlangıç, pilottan sonra kalibre edilir):

- Pilot süresince günlük aktif kullanıcı sıfıra düşmedi
- Girilen fişlerin en az %80'i onay zincirinden geçti
- Veri kaybı veya yanlış hesaplama: sıfır
- "Anlamadım/kullanamıyorum" deyip bırakan: sıfır veya bir
- Ortalama onay süresi 48 saati geçmedi
- "Kağıda/Excel'e dönmek istiyorum" diyen: yok

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Ölçüsüz pilota girmemek.

### 2.5 Zaman Perspektifi

Milestone bazlı ilerleme (tarih yok, sıralama var):

1. **Temel altyapı** — Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama
1. **Çekirdek döngü** — Fiş girişi → onay zinciri → tamamlanma, tek harcama uçtan uca
1. **Tam Faz 1** — 2.1 listesindeki tüm özellikler
1. **Pilot hazırlık** — Seed data, onboarding, dashboard, metrikler, hata raporlama
1. **Pilot** — Gerçek prodüksiyonda kullanım

Gecikme sinyali: aynı milestone'da 3 session üst üste somut ilerleme yoksa dur, teşhis et.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Gerçekçi olmayan tarih yerine ilerleme bazlı takip.

### 2.6 POY Ekosistem Kökü

KAAPA, POY (Prodüksiyon Otomasyon Yazılımı) ekosisteminin ilk modülü olarak
tasarlandı (kök: v8 ARCHITECTURE bölüm 7). Planlanan kardeş modüller: Senaryo &
Storyboard · Cast & Crew · Lokasyon & Set · Post-Prodüksiyon Bütçesi · Call
Sheet & Çekim Takvimi.

"Mimari çok-modüle göre kurulur" kararı bu köke dayanır. Faz 1'de yalnız iki
kapı açılır (Muhasebe, Bütçe); mimari daha fazlasını taşıyabilecek şekilde
kurulur, bugün fazlası takılmaz.

**Karar tarihi:** 06.08.2026 | **Gerekçe:** POY köküne dayanmayan bir kabuk kararı, tek modüllük bir uygulama gibi tasarlanır ve kardeş modüller geldiğinde yeniden yapılanma gerektirir.

-----

## BÖLÜM 3 — TEKNİK FELSEFE

### 3.1 Tek Gerçek Kaynağı (SSOT)

- Supabase = tek gerçek kaynak. Client = önbellek/kopya.
- UI değişikliği → Supabase'e yaz → başarılıysa UI güncelle. Tersi yok.
- localStorage/sessionStorage veri deposu olarak kullanılmaz. Cache olabilir, ama iş mantığı bağlı olmaz.
- Çakışmada Supabase kazanır, her zaman.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** v8'de localStorage gerçek kaynak olması sistemin çöküş sebebiydi.

### 3.2 Fonksiyon Saflığı ve Sorumluluk Sınırı

- Bir fonksiyon bir iş yapar.
- Saf fonksiyonlar: aynı girdi → aynı çıktı, dış dünyaya dokunmaz. Hesaplama, dönüşüm, validasyon.
- Yan etkiler ayrı katmanda: DB yazma, API çağrısı, bildirim. Saf fonksiyonları çağırır, tersi olmaz.
- Orkestrasyon: saf + yan etki fonksiyonlarını birleştirir, sırayı bilir, detayları bilmez.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** v8'de her fonksiyon her şeyi yapıyordu — hesaplama, DOM, localStorage.

### 3.3 Katman Ayrımı

Dört katman:

1. **Veri erişim** — Supabase ile konuşur. İş kuralı bilmez. RLS DB seviyesinde uygulanır.
1. **İş mantığı** — Saf fonksiyonlar. DB bilmez, UI bilmez.
1. **UI** — Ekranı çizer, etkileşim yakalar. Hesaplama yapmaz, DB'ye gitmez.
1. **Orkestrasyon** — Diğer üçünü birleştirir. Akış sırasını bilir, detayları bilmez.

Oklar tek yönlü: Orkestrasyon → herkesi çağırabilir. UI → sadece orkestrasyon. İş mantığı ve veri erişim → çağrılır, çağırmaz.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Katmanlar arası bağımlılık kontrolü, v8'deki iç içe geçmişliği önleme.

### 3.4 Sessiz Hata Yasağı

- Her başarısız işlem kullanıcıya bildirilir (ne olduğu + ne yapması gerektiği).
- Her başarısız işlem loglanır (Supabase'de hata kaydı).
- `catch(e) {}` veya `catch(e) { console.log(e) }` üretim kodunda bulunmaz.
- Beklenen boşluk → empty state mesajı. Beklenmeyen boşluk → hata bildirimi + log.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** v8'de export.js eski field ismiyle sorgu yapıp sessizce boş döküman üretiyordu.

### 3.5 Test Edilebilirlik

- Saf fonksiyonlar birim test edilir (Vitest).
- Ekran davranışı bileşen testi ile ölçülür (jsdom + Testing Library, TD-23 kararı 02.08.2026): hangi koşulda ne görünür, hangi koşulda ekran susar, tuş ve odak davranışı, eylemin hangi servisi hangi argümanla çağırdığı, eylem sonrası ekranın hali.
- Bileşen testi kapsam dışı: renk, hizalama, boşluk gibi görsel iddialar (UI turunda değişir, testte çürür).
- jsdom GENEL ortam değildir: saf fonksiyon testleri node ortamında kalır (saflık sınırı, bkz. 3.2); ekran testi dosyası ortamı kendi başında açar.
- Manuel tarayıcı turu ölmedi, yeri daraldı: görsel duruş, okunurluk, platform farkı ve canlı veriyle ilk görüş insanda kalır.
- Test yazılacak katman: iş mantığı + ekran davranışı. Yazılmayacak: veri erişim (Supabase çağrısının kendisi), orkestrasyon.
- REVİZYON 02.08.2026 (TD-23): bu bölümün 22.05.2026 hâli ekran katmanının test edilmeyeceğini söylüyordu; davranış kuralları biriktikçe tek tarayıcı turunda baştan sona doğrulama imkânsızlaştı ve son turlarda kaçan hataların hepsi bu katmandaydı.
- Yeni iş mantığı fonksiyonu → testi aynı commit'te. "Sonra yazılır" yok.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Saf fonksiyonların test edilebilirliği en büyük avantajı — kullanılmalı.

### 3.6 "Yeterince İyi" Eşiği

- Over-engineering: somut ihtiyaç yoksa kod yok. "İleride lazım olabilir" → dur sinyali.
- Under-engineering: aynı şey ikinci kez kopyalanıyorsa → ortak fonksiyon.
- Pragmatik istisna: tek satırlık, büyümeyeceği kesin olan DB işlemi için orkestrasyon gerekmez.
- Karar testi: "Bu kodu 3 ay sonra ilk kez gören biri ne anlam çıkarır?"
- Netlik öncelikli, güzellik hoş gelir. Şık ve anlaşılır → mükemmel. Şık ama belirsiz → netlik kazanır.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** v8 hem over-engineering (karmaşık ama kırılgan yapılar) hem under-engineering (kopyala-yapıştır) sorunu yaşadı.

-----

## BÖLÜM 4 — ENTROPİ KORUMASI

### 4.1 İsimlendirme Anayasası

- DB (Supabase): snake_case — `receipt_status`, `created_at`
- JS değişken/fonksiyon: camelCase — `receiptStatus`, `createdAt`
- Dosya adları: kebab-case — `receipt-service.ts`, `approval-chain.ts`
- Domain terimleri: her terim tek İngilizce karşılık, GLOSSARY.md'de
- Tehlikeli Türkçe kökler (gec, tip, durum, kat): GLOSSARY.md'de ayrı bölüm, her bağlam-karşılık çifti listelenir
- Bulk rename yasak — tek tek, kontrollü düzeltme

**Karar tarihi:** 22.05.2026 | **Gerekçe:** v8'de 30+ isim çakışması (gec=3 anlam, tip=4 field, durum=5 value set).

### 4.2 Dosya Yapısı Kuralları

- Rol bazlı dizin yapısı: ekranlar `app/{rol}/` (saha, muhasebe, reviewer, onboarding, auth, layout); paylaşılan kod `shared/` (özellik bazlı değil)
- Her dosya tek sorumluluk
- Dosya başına 300 satır HEDEFTİR, sınır değildir; aşılabilir. Aşan dosya ilk 6 satırında `// BOY: tek iş = ..., sebep = ...` biçiminde tek satır gerekçe taşır. Test dosyaları kuraldan TAMAMEN MUAFTIR — test dosyası yapı değil listedir, bölmek bilgiyi azaltmaz, iki yere baktırır. Gerekçesiz aşım doc-check uyarısıdır (`npm run doc-check`, Denetim D).
- 500 satırı aşan dosyada gerekçe yetmez: dosya adı satır sayısıyla birlikte docs/butce/BUTCE-UI-MIMARISI.md'ye ("Boy aşımı — bölünme bekleyenler") kaydedilir; bölünme planı AYRI bir turda yapılır, bölme o an yapılmaz.
- Boy aşımı TEKNİK BORÇ DEĞİLDİR: TECH-DEBT.md'ye girmez, borç sayacını değiştirmez — TECH-DEBT kendi kuralı gereği yapısal seçimler kendi karar dosyasına yazılır.
- Ekran dosyaları `app/{rol}/*-screen.tsx`; Supabase çağrıları `shared/supabase/*-service.ts`'de toplanır; hesap motoru `shared/cfe/`; ortak bileşenler `shared/components/`; domain tipleri `shared/types/domain.ts`
- Paylaşılan kod: shared/ — "iki yerden çağrılıyor" testi geçmeli
- utils.js, helpers.js, misc.js yasak

**Karar tarihi:** 22.05.2026 (güncelleme 2026-06-22: kod rol-bazlı evrildi — `app/{rol}` ekranları + `shared/` servisleri; özellik-bazlı plan terk, boş `features` dizini silindi, TD-7 kapandı). | **Gerekçe:** Ekran rol'e göre netleşir; ortak servis/motor tek `shared/` altında, tekrar yok.

**REVİZYON 5 Ağustos 2026 (Engin kararı — ESKİ kural "Dosya başına max 300 satır (1.5 ile tutarlı)" idi, SINIR olarak uygulanıyordu):** 300 satır artık HEDEFTİR, sınır değildir; büyüyen bir dosyayı erken bölmek bazen okunabilirliği azaltıyordu, özellikle test dosyalarında (test dosyası yapı değil listedir). Gerekçeli aşım kabul, gerekçesiz aşım doc-check uyarısı; 500+ dosyalar BUTCE-UI-MIMARISI.md'ye ayrıca kayda geçer, TECH-DEBT'e girmez.

### 4.3 Drift Dedektörü

- Session sonu checklist: yeni dosya doğru dizinde mi? 300 satır aşıldı mı? Mantık tekrarı var mı? İsimlendirme uyuldu mu?
- Milestone review: tüm yapı gözden geçirilir — dosya sayısı, katman ihlali, teknik borç
- Kırmızı bayrak: bir dosya 3 farklı session'da değiştiyse → bölünme tartışması
- Sorumlu: Claude kontrol eder, Engin karar verir
- **doc-check çalıştırma zamanı (8 Ağustos 2026):** Denetim A ve E commit tarihine/hash'ine bakar; ikisi de commit ATILDIKTAN SONRA doğru ölçer. Kapıda (commit öncesi) çalıştırılan doc-check bir adım geride ölçer ve o oturumda değiştirilen dosyaları TAZE görür. Kapı olarak çalıştırmak yine değerlidir (önce-sonra farkı görünür), ancak çıktısı ancak commit sonrası kesindir. Sayı raporlanacaksa commit sonrası ölçüm yazılır.
- **Denetim F — INDEX satır sayısı doğruluğu (Engin kararı 18 Ağustos 2026):** INDEX.md bölüm 2'deki her `` `yol` (N) `` iddiası gerçek dosyayla karşılaştırılır; TAM EŞLEŞME beklenir, tolerans bandı YOKTUR. Denetim doğru sayıyı da yazdırır (`INDEX=139 GERÇEK=275`), böylece düzeltme ölçme işi değil kopyala-yapıştır olur. Sonuç: kod dosyasına dokunan her dilimin kapanışı INDEX'i güncellemek ZORUNDADIR — bu kastedilen maliyettir, yan etki değil. Tetikleyici: 18 Ağustos 2026, DILIM 1100-B kapanışından sonra INDEX baştan sona mekanik tarandı ve 56 satır sayısı iddiasından 7'si yanlış çıktı; en büyük sapma authenticated-shell.tsx (INDEX 139, gerçek 275 — dosya iki katına çıkmış ve 300 eşiğine dayanmışken INDEX onu hafif gösteriyordu). Küçük sapmaların (item-row.tsx 337→329) elenmesi tam olarak bu birikmenin yoludur, o yüzden tolerans reddedildi. SAYMA DÜZENİ ŞERHİ: F `wc -l` düzenini kullanır, D ise `split(/\r?\n/)` uzunluğunu — satır sonuyla biten dosyalarda D bir fazla sayar. İki düzen bilerek yan yana durur: INDEX'in sayıları tarihsel olarak `wc -l`, D'nin 300 eşiği ise kendi düzeninde kalibre.

- **VERİ ÖNKOŞULU BİR BAĞIMLILIKTIR (ders, 1 Ağustos 2026 — CURRENT.md'den taşındı 18 Ağustos 2026):** D3c-3 açılış taramasında iş "hiçbir şeye bağlı değil" diye sunuldu; KOD bağımlılığına bakıldı, VERİ bağımlılığına bakılmadı. Özellik yazıldı, canlıya gitti, sonra bugünkü veriyle görülemediği anlaşıldı. Bundan sonra etki analizinde "neye bağlı" sorusu veriyi de kapsar: özelliğin görünür olması için hangi kayıtların var olması gerekir.
- **ÇELİŞKİ GÖZÜYLE OKUMAK AYRI BİR İŞTİR (ders, 7 Ağustos 2026 doküman temizliği oturumu — CURRENT.md Milestone günlüğünden taşındı 18 Ağustos 2026):** mekanik/desen taraması, çelişkinin iki yakası FARKLI KELİMELERLE yazıldıysa onu GÖRMEZ — o oturumdaki renk/font çelişkisini tarama değil Engin yakaladı. Ve "tüm dosyaları okudum" ile "çelişki gözüyle okudum" AYNI ŞEY DEĞİLDİR: ikincisi dosyaları birbirine karşı okumayı gerektirir, tek tek okumak yetmez. Sonuç: bir bütünlük iddiası (bayatlık taraması, çelişki taraması, "hepsi kontrol edildi") grep ya da desen eşleşmesiyle ÜRETİLEMEZ. 18 Ağustos 2026'da aynı hata iki kez daha yaşandı (INDEX bayatlık listesi grep'le çıkarıldı, dört madde kaçtı; "Son güncelleme" kalıntı taraması düz metin geçişlerini ayıramadı) — ders üç kez doğrulanmış sayılır.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Kurallar koyuldu, uygulandığını denetleyecek mekanizma lazım.

### 4.4 Teknik Borç Bütçesi

- Teknik borç kabul edilir, gizlenmez.
- Kayıt: TECH-DEBT.md — ne, nerede, neden, ne zaman ödenmeli
- Her borç bir milestone'a bağlı. "Bir gün düzeltiriz" yok.
- 10'dan fazla açık borç birikirse → yeni özellik durup borç ödenir. Sınır 31 Temmuz 2026'da Engin kararıyla 5'ten 10'a çıkarıldı; sınırın ve açık borç sayısının TEK otoritesi docs/TECH-DEBT.md'dir, bu dosyada sayı taşınmaz.
- Borç bütçesi aşılırsa: düşür, ertele (gerekçeyle), veya parçala

**Karar tarihi:** 22.05.2026 | **Gerekçe:** v8'de fark edilmeden biriken teknik borç sistemi çökertti.

### 4.5 Döküman-Kod Senkronizasyonu

- Kod dokümana aykırıysa → DUR ve söyle, sessizce taraf tutma. Doküman bir KARARI tarif ediyorsa doküman kazanır, kod düzeltilir; doküman kararın UYGULAMA TAHMİNİNİ tarif ediyorsa gerçek kazanır ve doküman düzeltilir. (REVİZE 2026-07-30, Engin kararı — tam metin ve emsal: CLAUDE.md "Doküman kazanır — mutlak DEĞİL".)
- Yaşayan dokümanların TAM listesi CLAUDE.md "Karar nereye yazılır (yol haritası)" bölümündedir; burada tekrarlanmaz (liste burada tutulunca bayatlıyordu — KABUK-KARARLARI, IS-KURALLARI, IS-SIRASI ve docs/butce/ dosyaları hiç eklenmemişti).
- Drift dedektörü session sonunda senkron kontrolü yapar
- Ölü doküman yasağı — kimse okumuyorsa silinir veya arşivlenir
- **ERTELENMİŞ KARAR (8 Ağustos 2026, uygulanmadı, kayıt için):** "Son güncelleme" başlığı elle tutulan ikinci kopyadır, kalkacak. Tarih INDEX.md'de tek yerde "son doğrulama" olarak yaşayacak ve yalnız dosya baştan sona doğruluk gözüyle okunduğunda ilerleyecek, düzenlendiğinde değil. doc-check Denetim A bu tarihe göre yeniden yazılacak (dosya son doğrulamadan sonra değiştiyse uyarır).
- **UYGULANDI (18 Ağustos 2026, Engin kararı):** yukarıdaki ertelenmiş karar hayata geçti. 24 dokümandan `**Son güncelleme:**` başlığı kaldırıldı; tarih INDEX.md bölüm 7'de `(dogrulama: ...)` olarak TEK yerde yaşıyor ve dosya düzenlendiğinde İLERLEMİYOR — yalnız dosya baştan sona doğruluk gözüyle okunduğunda ilerliyor. Denetim A buna göre yeniden yazıldı ve BİLGİ-ONLY'ye çevrildi (uyarı değil envanter), çıktısı en bayattan en tazeye sıralanıyor. Gerekçe: yeni anlamıyla her düzenleme dokümanı "doğrulanmamış" yapar ve yeşile dönüş ancak gerçek bir okuma turuyla olur; sürekli kırmızı duran denetim okunmaz hale gelir ve o alışkanlık bağlayıcı denetimlere (D, E, F) bulaşır. Bölüm 7 artık KAYIT DEFTERİDİR: orada kayıtlı olmayan doküman Denetim A'da KIRMIZI verir. Tohumlama, her dosyanın silinen başlığındaki tarihle yapıldı — bugüne çekmek 24 dosya için yalan olurdu. TETİKLEYİCİ: 18 Ağustos 2026, tek günde iki kez başlık tarihi yüzünden durup fazladan commit atıldı; karar on gün boyunca uygulanmayı bekliyordu.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Doküman-kod uyumsuzluğu yanlış kararlara yol açar.

### 4.6 Geri Dönüş Noktaları

- Her milestone sonunda git tag: `v0.1-auth`, `v0.2-core-loop` vb.
- Tag koşulu: testler geçiyor, dokümanlar senkron, açık kritik borç yok
- Kırılmada en son tag'e dönülür
- main her zaman çalışır durumda kalır
- İş doğrudan main üzerinde yürür ve main'e push'lanmış olarak biter; branch açılsa bile main'e merge edilmeden bırakılmaz (orphan branch yasak). Yarım iş main'e girmez.
- Tag kuralı (Engin kararı 2026-07-15, hafifletilmiş): her dilimde DEĞİL, yalnız BÜYÜK milestone mühürlerinde tag atılır (sıradaki üçü: v0.2-klv KLV kapanışında, v0.3-muhur3 MÜHÜR-3 kapanışında, v0.4-kabuk KABUK kapanışında). Adlandırma deseni: vX.Y-kisa-ad. Uygulama: milestone'un son Sonnet promptunun kapanış bloğuna `git tag vX.Y-ad && git push origin --tags` satırı eklenir. Commit'ler ince geri-dönüşü zaten sağlar; tag insan-okur çapadır.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** v8'de geri dönüş noktası yoktu, her bozulma üstüne yama yazıldı.

-----

## BÖLÜM 5 — MİMARİ YENİDEN YAPILANDIRMA

### 5.1 Korunanlar ve Dondurulmuşlar

**Canlı şema/RLS/fonksiyon tek kaynağı:** supabase/migrations/00000000000000_baseline.sql (39 tablo · 101 policy · 25 trigger · 17 fonksiyon). Eski SUPABASE-SCHEMA/RLS/FUNCTIONS.sql ve full-rebuild.sql → docs/archive/ (bayat, tarihsel referans).

**Korunan referanslar:** BOOTSTRAP-MUSTERI.sql · AUTH-KARARLARI.md · TASARIM-KARARLARI.md · RAKIP-ANALIZI-OCR.md · iş kuralları, domain bilgisi.

**Dondurulan (ham malzeme):** GİB stratejisi, XML export, cross-company, 6 açık "DÜŞÜNÜLECEK" sorusu. (CFE ARTIK YAPILDI — dondurulmuş değil; src/shared/cfe.)

**Sıfırlanan (engintosun/prodapp-archive):** tüm eski JS/CSS/HTML, eski ARCHITECTURE.md, dosya yapısı, naming batch'leri.

**Karar:** 22.05.2026 (güncelleme 2026-06: baseline tek kaynak, 39 tablo, CFE yapıldı) | **Gerekçe:** Düşünce korunur, bozuk implementasyon sıfırlanır.

### 5.2 Frontend Mimarisi

React + TypeScript + Vite

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Sonnet en güçlü React'ta, Supabase birinci sınıf React desteği, ekosistem derinliği, gelecekte devredilirlik.

### 5.3 Modül ve Dosya Yapısı

```
src/
  App.tsx, main.tsx      — kök giriş
  app/                   — rol-bazlı ekranlar
    saha/                — fiş giriş, düzeltme, ana
    muhasebe/            — muhasebe ekranları (onay, davet, bütçe)
      budget/            — bütçe kart/kalem masası ekranları
        components/      — kart tablosu bileşenleri (item-row, add-item-panel, sheet'ler)
        hooks/           — grid navigasyon + edit buffer hook'ları
    reviewer/            — denetmen
    onboarding/          — müşteri kurulum
    auth/                — login, auth guard
    layout/              — sayfa düzeni
  shared/
    supabase/            — client.ts + *-service.ts (Supabase çağrıları)
    cfe/                 — Core Finance Engine (hesap motoru)
    components/          — ortak UI bileşenleri
    types/domain.ts      — TypeScript domain tipleri
    utils/               — ortak yardımcılar
  styles/                — tokens.css (tasarım token'ları: renk, z-katman, odak çerçevesi)
```

4.2 kurallarının somut uygulaması.

**Karar tarihi:** 22.05.2026 (güncelleme 2026-06-22: rol-bazlı gerçeğe hizalandı). | **Gerekçe:** Rol-bazlı ekranlar + ortak `shared/` servis/motor; genişlemeye hazır.

### 5.4 Supabase İletişim Katmanı

- Supabase JS SDK doğrudan kullanılır, ara servis katmanı yok
- Tek client instance: `shared/supabase/client.ts`
- Servis katmanı: `shared/supabase/*-service.ts` dosyalarında SDK çağrıları toplanır (rol ekranları bu servisleri çağırır)
- Realtime: Supabase subscription'ları ile anlık bildirim
- Offline: Faz 1'de yok, bağlantı yoksa kullanıcıya bildirilir

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Gereksiz soyutlama yok, SDK yeterli.

### 5.5 Edge Functions Sınırları

**Sunucuda (Edge Function):**

- OCR işleme (Google Vision API)
- Şüpheli işlem tespiti kuralları
- Bildirim gönderme
- Hassas hesaplamalar (avans bakiye, toplam harcama)
- Davetiye oluşturma ve doğrulama
- Şirket/proje bazlı kuralların uygulanması

**Client'ta:**

- Form, UI etkileşimi
- Fotoğraf çekme/seçme
- Listeleme, filtreleme, arama (Supabase query + RLS)

**Sınır kuralı:** Client'ta çalışan kod herkese açık koddur. Manipüle edilebilecek veya okunarak istismar edilebilecek hiçbir iş mantığı client'ta bulunmaz.

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Güvenlik — kullanıcı manipülasyonu ve dışarıdan kod okuma tehdidi.

### 5.6 Deploy Pipeline

- Hosting: Vercel
- Build: Vite
- Üç ortam: dev / staging / prod
- Branch: main = prod (tek aktif dal). Faz 1'de feature/staging branch kullanılmıyor; staging ortamı M4'te eklenecek.
- main'e push = otomatik deploy (Vercel), tag kurallarına bağlı (4.6)
- Hassas bilgiler: Vercel environment variables, kodda bulunmaz
- Somut deploy akışı + secret haritası: docs/ORKESTRASYON.md

**Karar tarihi:** 22.05.2026 | **Gerekçe:** Standart, güvenilir, React+Supabase ile uyumlu pipeline.

### 5.7 PWA Stratejisi

- PWA olarak çalışır, app store gerekmez (Capacitor ile store ileride)
- Service worker: statik asset cache (HTML, CSS, JS), veri cache'lenmez (SSOT kuralı)
- Offline: Faz 1'de "bağlantı yok" mesajı, Faz 2'de offline kuyruk (öncelikli)
- Kamera erişimi: tarayıcı API'si ile fiş fotoğrafı
- Push notification: Faz 1'de yok, uygulama içi bildirim yeterli

**Karar tarihi:** 22.05.2026 | **Gerekçe:** PWA bu iş için yeterli, native gereksiz.

-----

## PARKUR NOTLARI (Bekleyen Konular)

- **KVKK:** Veri tutma/silme/şifreleme kuralları — mimari somutlaşınca ayrı session. Soft delete, log retention, kişisel veri kapsamı.
- **Offline çalışma:** Saha gerçeği (dağ başı, yer altı). Faz 1'de değil, Faz 2'de öncelikli. Mimari kapı kapatmamalı.
