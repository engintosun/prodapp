# KAAPA — CURRENT.md

⚠ TERMİNOLOJİ: 2026-07-11 öncesi kayıtlarda Miktar=kişi/adet, Çarpan=süre okunur; sonrasında Miktar=süre, X=kişi/adet (bkz. GLOSSARY tarihçe).

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR. Ne yapıldığı git log'da, kararlar kendi ev dosyalarında yaşar (harita: INDEX.md bölüm 7.0).

## Milestone

M2 — Çekirdek Döngü. Bütçe: kavram + şema + DB temeli + göç CANLI; kart mimarisi 1100-1600 KİLİTLİ.

- **21 Haziran – 25 Ağustos 2026 (özet; ayrıntı git log, kararlar ev dosyalarında).** Bütçe DB temeli ve `fn_open_budget` canlıya girdi; vergi/yük modeli ile KART 1500 ekranı kilitlendi. DILIM-3 bordro motoru beş dilimde tamamlandı (şema → katalog tohumu → saf çözücü → UI kablolaması → genel-desen sökümü); şirket profili şeması ve `fn_resolve_sgk_scenario` canlı. Terminoloji devrimi uygulandı. MÜHÜR-1 ve MÜHÜR-2 canlı, mühürleme yüzeyi MÜHÜR-3'e kaldı. R1/R2/R3 ekran refaktörü ve KLV klavye motoru kuruldu; BORÇ-A ve BORÇ-B turları kapandı. AĞUSTOS: KABUK tasarımı `docs/KABUK-KARARLARI.md`yi tek kaynak olarak kurdu, sprint 8-12 Ağustos'ta kapandı (tag v0.4-kabuk); doc-check (Denetim A-F) ve INDEX.md yaratıldı; tablo genişlik turu, kolon takası ve kart masası (db8d5bd) geldi. KART 1100 iki dilimde tamamlandı (1100-A statü/katalog/tohum, 1100-B başlık çizimi) ve aidiyet koddan çıkıp `budget_items.heading_code` alanına taşındı. Proje yaşam döngüsü (arşiv, geri alma, silme) tasarlandı ve canlıya girdi. NET/BRÜT doktrini revize edildi, KART 1600 üç kademeli tasarımı karara bağlandı. 25 Ağustos'ta optimizasyon turu açıldı.
- Tarih notu: Milestone kayıtlarında "22 Ağustos (4. oturum)" diye geçen oturumun commit'leri 25 Ağustos tarihlidir; özet commit tarihine göre yazıldı.
- **OPTİMİZASYON TURU KAPANDI (30 Ağustos 2026).** Açılış üçlüsü 90.984 → 19.598 bayt (~30.300 jetondan ~6.500'e), deterministik kapı 0 → 7. Son parça D6 Şartname kod olsun: kolon seti columns.ts'e, terim domain.ts'e taşındı. D6'nın vergi-yük parçası YAPILMADAN kapandı — parça kuralın kodda olduğu varsayımıyla yazılmıştı; statü-yük cetveli veritabanında yaşıyor (payment_status_burdens) ve B20/B16 gereği orada kalması doğru. Cetveli bugün hiçbir test korumuyor; koruması, cetveli değiştiren göçün Engin onayından geçmesidir.

## Durum

- HEAD: 1ec93c8 (30 Ağustos 2026 — ödeme statüsü kümesi). Denetim E gereği burada CURRENT.md'ye dokunan son commit'in EBEVEYNİ yazar; kapanışta YAZMA ANINDAKİ HEAD yazılır, çünkü kapanış commit'i CURRENT.md'ye dokunur ve "son commit" o olur.
- Migration 20260822130000, 20260830120000, 20260830130000, 20260830140000 CANLIDA. Kod: 308/308 test, build geçer, eslint 0 hata (2 bilinen react-refresh uyarısı). Originde tek dal: main.
- 30 Ağustos 2026'da İKİ oturum oldu. İlki altı commit (Türkçe metin, dar sayım kararı, TD-32 kapandı, TD-36 üç göçle kapandı) + kapanış 4ba1aec. İkincisi tek commit 1ec93c8: ödeme statüsü kümesi domain.ts'e taşındı, üç yüzey oradan besleniyor, yük cinsi YukCins tipine bağlandı, Statü rehberine Harç/Vergi maddesi eklendi.
- 31 Ağustos 2026: Açıklama kolonu kaldırıldı, `budget_items.description` alanı şemadan düşürüldü (migration 20260831120000), kolon seti 12'den 11'e indi. Servis, grid navigasyonu, edit buffers ve iki karar dosyası (BUTCE-EKRAN-KARARLARI.md, BUTCE-UI-MIMARISI.md) buna göre güncellendi. Aynı gün NET/BRÜT DOKTRİNİ REVİZYONU koda indi: KDV Yasal Yük'ün içinden çıkıp kendi kolonuna geçti, Maliyet kolonu eklendi, kolon seti 11'den 13'e çıktı (tableMinWidth 1146→1370); Brüt toplam rakamsal olarak değişmedi. Aynı gün, ayrı bir turda: "Net toplam" kolon adı "Ara toplam", "Brüt toplam" kolon adı "Toplam" oldu (yalnız İSİM; hiçbir hesap/hücre/genişlik değişmedi). Kod tarafında yalnız `netToplam` tanımlayıcısı `araToplam` oldu (columns.ts, table-styles.ts, card-table-screen.tsx, item-row.tsx); `brutToplam` tanımlayıcısı bilerek korundu (rakam gerçekten brüt). `netToplamDonemli`, CFE parametre adları ve totals.ts'teki yerel `netToplam`/`brutToplam` değişkenleri dokunulmadı.
- 31 Ağustos 2026 (ayrı bir tur): `yemek` statüsü `konaklama`dan ayrıldı (migration 20260831140000 CANLIDA). Vergi rejimi ikisinde de birebir aynı (KDV %10, stopaj yok, SGK yok); ayrım vergi değil anlam ayrımı. Statü kümesi sekize çıktı (bordro/smm/telif_belgeli/sirket/kira_sahis/konaklama/yemek/resmi_odeme). Statü kolonu genişliği (128px) BİLEREK değiştirilmedi — kolon genişliği turu ayrı bir iştir. Not: göç dosyasındaki ilk INSERT taslağı artık var olmayan `default_stopaj_rate` kolonunu referans alıyordu (20260625120000'de düşürülmüştü); uygulama sırasında fark edilip 20260815130000'deki emsale göre düzeltildi.
- 31 Ağustos 2026 (ayrı bir tur): statü kolonu daraltma turu için ölçüm aracı kuruldu (`scripts/statu-genislik-olcumu.html`), rakamlar Engin'e raporlandı, genişlik kararı BEKLİYOR.
- ÇALIŞMA ORTAMI: yedi deterministik kapı kurulu (dal, sığ klon, damga varlığı, damga tazeliği, ASCII'ye düşmüş .md metni, tanımsız CSS token, test sayısı kaybı) ve `supabase db push` onaya bağlı. Ayarlar `.claude/settings.json`, kapılar `.claude/hooks/`.
- KURULU/ÇALIŞIYOR: auth ve çok-proje · saha fiş girişi · yönlendirme/düzeltme · davet/rol · onay/red · proje, bütçe ve servisler · onboarding · bütçe DB temeli · `fn_open_budget` · CFE (28/28) · KART 1500 ekran TAM · KART 1100 başlıklı çizim · ödeme-statüsü şeması · yük kovası cinsi · Not kolonları · kart masası · proje arşiv/geri alma/silme.
- BORDRO MOTORU uçtan uca kablolu: şema → servis (`deriveBordroFields`, dönem-bazlı `periodBreakdown`) → UI (genel dört-alan deseni, bordroya özel dal YOK). Motor ve kablolama 63/63 test ile korunuyor.
- KLV KAPANMADI: Dönemler/Statü select ile Birim net/Miktar/X hizalaması AÇIK (Engin kararıyla duruldu, 2026-07-20); macOS gerçek cihaz turu yapılmadı. `v0.2-klv` etiketi ATILAMAZ.
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

1. **KAPANDI (31 Ağustos 2026): NET/BRÜT DOKTRİNİ KODA İNDİ VE İSİM KARARLARI DA BİTTİ.** Model `totals.ts`'te canlı: Ara toplam = çıplak çarpım (değişmedi), Yasal Yük = saf yük, Maliyet = Ara toplam + Yasal Yük (yeni kolon), KDV kendi kolonu, Toplam = Maliyet + KDV (rakamsal değişmedi). Kolon seti 11'den 13'e çıktı, SIRA BAĞI karşılandı (MÜHÜR-3'ten önce indi). Aynı gün, ayrı bir turda, `docs/butce/BUTCE-SEMA-KARARLARI.md`'de AÇIK duran isim sorusu da kapandı: "Net toplam" → "Ara toplam", "Brüt toplam" → "Toplam". Geriye kalan: yok — bu madde bilerek burada tutulur, git log'da izi bu satırdır.
2. **KART 1600 — MOTOR YARISI.** Dört parça: çok kademeli gruplama, çalışma anında başlık doğması, ikinci başlık anahtarı, oranla türetme. Neye bağlı: hiçbir şey; VERİ yarısından ayrı olarak bugün başlanabilir (sıra bağı `docs/IS-SIRASI.md` MOTOR İŞİ maddesinde). Neyi bloke ediyor: 1300 ve 1400 aynı parçaları isteyecek.

Uzun vadeli iş, backlog ve tamamlananlar: `docs/IS-SIRASI.md`.
