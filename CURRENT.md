# KAAPA — CURRENT.md

⚠ TERMİNOLOJİ: 2026-07-11 öncesi kayıtlarda Miktar=kişi/adet, Çarpan=süre okunur; sonrasında Miktar=süre, X=kişi/adet (bkz. GLOSSARY tarihçe).

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR. Ne yapıldığı git log'da, kararlar kendi ev dosyalarında yaşar (harita: INDEX.md bölüm 7.0).

## Milestone

M2 — Çekirdek Döngü. Bütçe: kavram + şema + DB temeli + göç CANLI; kart mimarisi 1100-1600 KİLİTLİ.

- **21 Haziran – 25 Ağustos 2026 (özet; ayrıntı git log, kararlar ev dosyalarında).** Bütçe DB temeli ve `fn_open_budget` canlıya girdi; vergi/yük modeli ile KART 1500 ekranı kilitlendi. DILIM-3 bordro motoru beş dilimde tamamlandı (şema → katalog tohumu → saf çözücü → UI kablolaması → genel-desen sökümü); şirket profili şeması ve `fn_resolve_sgk_scenario` canlı. Terminoloji devrimi uygulandı. MÜHÜR-1 ve MÜHÜR-2 canlı, mühürleme yüzeyi MÜHÜR-3'e kaldı. R1/R2/R3 ekran refaktörü ve KLV klavye motoru kuruldu; BORÇ-A ve BORÇ-B turları kapandı. AĞUSTOS: KABUK tasarımı `docs/KABUK-KARARLARI.md`yi tek kaynak olarak kurdu, sprint 8-12 Ağustos'ta kapandı (tag v0.4-kabuk); doc-check (Denetim A-F) ve INDEX.md yaratıldı; tablo genişlik turu, kolon takası ve kart masası (db8d5bd) geldi. KART 1100 iki dilimde tamamlandı (1100-A statü/katalog/tohum, 1100-B başlık çizimi) ve aidiyet koddan çıkıp `budget_items.heading_code` alanına taşındı. Proje yaşam döngüsü (arşiv, geri alma, silme) tasarlandı ve canlıya girdi. NET/BRÜT doktrini revize edildi, KART 1600 üç kademeli tasarımı karara bağlandı. 25 Ağustos'ta optimizasyon turu açıldı.
- Tarih notu: Milestone kayıtlarında "22 Ağustos (4. oturum)" diye geçen oturumun commit'leri 25 Ağustos tarihlidir; özet commit tarihine göre yazıldı.
- **OPTİMİZASYON TURU KAPANDI (30 Ağustos 2026).** Açılış üçlüsü 90.984 → 19.598 bayt (~30.300 jetondan ~6.500'e), deterministik kapı 0 → 7. Son parça D6 Şartname kod olsun: kolon seti columns.ts'e, terim domain.ts'e taşındı. D6'nın vergi-yük parçası YAPILMADAN kapandı — parça kuralın kodda olduğu varsayımıyla yazılmıştı; statü-yük cetveli veritabanında yaşıyor (payment_status_burdens) ve B20/B16 gereği orada kalması doğru. Cetveli bugün hiçbir test korumuyor; koruması, cetveli değiştiren göçün Engin onayından geçmesidir.
- **31 Ağustos 2026.** Kolon modeli tamamlandı (Açıklama kaldırıldı ve şemadan düşürüldü; KDV ayrıldı, Maliyet eklendi; Ara toplam / Toplam adlandırması) — NET/BRÜT doktrini artık kodda ve SIRA BAĞI MÜHÜR-3'ten önce karşılandı. `yemek` statüsü ayrıldı. Statü kolonu ölçülüp 106px'e indirildi. Bordro motorunun DB okuması toplu hale getirildi ve kart kapağı Maliyet'e geçerek ikinci hesap tanımını ortadan kaldırdı. Ayrıntı git log'da, kararlar ev dosyalarında.

## Durum

- HEAD: 2932276 (1 Eylül 2026 — silme hanesi, kolon hizası ölçümü, doküman tazeleme). Denetim E gereği burada CURRENT.md'ye dokunan son commit'in EBEVEYNİ yazar; kapanışta YAZMA ANINDAKİ HEAD yazılır, çünkü kapanış commit'i CURRENT.md'ye dokunur ve "son commit" o olur.
- Migration 20260822130000, 20260830120000, 20260830130000, 20260830140000, 20260831120000, 20260831140000 CANLIDA. Kod: 312/312 test (bugün 308 → 316 → 312; düşüşün sebebi silinen kartNetToplamlari'nin testleriydi, kapsam kaybı YOK — kart toplamı davranışı totals.test.ts'te cardTotals üzerinden hâlâ test ediliyor). Build geçer, eslint 0 hata (2 bilinen react-refresh uyarısı). Originde tek dal: main.
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

1. **KART 1600 — MOTOR YARISI.** Dört parça: çok kademeli gruplama, çalışma anında başlık doğması, ikinci başlık anahtarı, oranla türetme. Neye bağlı: hiçbir şey; VERİ yarısından ayrı olarak bugün başlanabilir (sıra bağı `docs/IS-SIRASI.md` MOTOR İŞİ maddesinde). Neyi bloke ediyor: 1300 ve 1400 aynı parçaları isteyecek.

Uzun vadeli iş, backlog ve tamamlananlar: `docs/IS-SIRASI.md`.
