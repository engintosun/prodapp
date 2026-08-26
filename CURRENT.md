# KAAPA — CURRENT.md

⚠ TERMİNOLOJİ: 2026-07-11 öncesi kayıtlarda Miktar=kişi/adet, Çarpan=süre okunur; sonrasında Miktar=süre, X=kişi/adet (bkz. GLOSSARY tarihçe).

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR. Ne yapıldığı git log'da, kararlar kendi ev dosyalarında yaşar (harita: INDEX.md bölüm 7.0).

## Milestone

M2 — Çekirdek Döngü. Bütçe: kavram + şema + DB temeli + göç CANLI; kart mimarisi 1100-1600 KİLİTLİ.

- **21 Haziran – 25 Ağustos 2026 (özet; ayrıntı git log, kararlar ev dosyalarında).** Bütçe DB temeli ve `fn_open_budget` canlıya girdi; vergi/yük modeli ile KART 1500 ekranı kilitlendi. DILIM-3 bordro motoru beş dilimde tamamlandı (şema → katalog tohumu → saf çözücü → UI kablolaması → genel-desen sökümü); şirket profili şeması ve `fn_resolve_sgk_scenario` canlı. Terminoloji devrimi uygulandı. MÜHÜR-1 ve MÜHÜR-2 canlı, mühürleme yüzeyi MÜHÜR-3'e kaldı. R1/R2/R3 ekran refaktörü ve KLV klavye motoru kuruldu; BORÇ-A ve BORÇ-B turları kapandı. AĞUSTOS: KABUK tasarımı `docs/KABUK-KARARLARI.md`yi tek kaynak olarak kurdu, sprint 8-12 Ağustos'ta kapandı (tag v0.4-kabuk); doc-check (Denetim A-F) ve INDEX.md yaratıldı; tablo genişlik turu, kolon takası ve kart masası (db8d5bd) geldi. KART 1100 iki dilimde tamamlandı (1100-A statü/katalog/tohum, 1100-B başlık çizimi) ve aidiyet koddan çıkıp `budget_items.heading_code` alanına taşındı. Proje yaşam döngüsü (arşiv, geri alma, silme) tasarlandı ve canlıya girdi. NET/BRÜT doktrini revize edildi, KART 1600 üç kademeli tasarımı karara bağlandı. 25 Ağustos'ta optimizasyon turu açıldı.
- Tarih notu: Milestone kayıtlarında "22 Ağustos (4. oturum)" diye geçen oturumun commit'leri 25 Ağustos tarihlidir; özet commit tarihine göre yazıldı.

## OPTİMİZASYON TURU (Engin kararı, 22 Ağustos 2026 — tur boyunca ürün işi durur)

Amaç: çalışma ortamının sadeleştirilmesi ve hızlandırılması. Kaynak: Anthropic bağlam mühendisliği rehberi (24 Temmuz 2026) ve yönlendirme rehberi (18 Haziran 2026).

TABAN ÖLÇÜM (HEAD 1819316): açılış üçlüsü 90.984 bayt (~30.300 jeton) · CLAUDE.md 22.302 · CURRENT.md 66.522 · dayatılan kapı 9, deterministik olan 0.

- **D0 Emniyet** — KAPANDI (79bff5e; geri dönüş etiketi `v0.4.1-tur-oncesi`).
- **D1 Zemin** — KAPANDI (76a351c): `.claude/` repoya girdi. Hook kapıları koşmaz, içeriğe bağlı damgayı doğrular; 36 saniyelik kapı zinciri hook içinde koşsaydı zaman aşımında kapı sessizce açığa düşerdi. D1b (7f179f1): tanımsız CSS token kapısı, yalnız stage'lenmiş dosyalarda.
- **D2 Söküm** — KAPANDI: D2a kurallar (211a102), D2ara test sayacı (66a1b24), D2b protokoller ve karar-ev haritası (dc41613), D2c CLAUDE.md 22.199 → 8.194 bayt (d992231, tavan 10 KB).
- **D3 Prompt şablonu + onay haritası** — AÇIK. Hangi onay Engin'de kalır, hangisi kapıya geçer; hiçbir yerde yazılı değil.
- **D4a Ders evi** — KAPANDI (4d22995): `docs/protokol/DERSLER.md`, on sınıf (dördü kapıya bağlı, altısı açık).
- **D4b Durum daraltma** — bu commit. DAMITMANIN TANIMI (Engin kararı, 25 Ağustos 2026): ölçüt kayıt SAYISI değil KONUDUR — Milestone'da yalnız aktif milestone tanımı ve başka evi olmayan konular kalır. Evler önce açıldı (735f4bb, 21ab18e, 9291a28), budama sonra yapıldı; KALICILIK KURALI gereği hiçbir madde evi hazır olmadan budanmadı. Beşinci parça (INDEX bölüm 2 betikle üretilir hale gelir) ayrı commit'te tamamlandı: `scripts/index-refresh.mjs` satır sayılarını gerçek dosyalardan tazeliyor, `--check` kipi bayatlığı sıfırdan farklı çıkışla bildiriyor. D4b KAPANDI.
- **D5 Kapanış sınaması** — AÇIK. Yeni düzen gerçek bir ürün borcuyla sınanır (TD-26 ya da TD-30), dört sayı ikinci kez ölçülür. Geçmezse tur bitmemiştir.
- **D6 Şartname kod olsun** — AÇIK, bağımsız. Kolon seti tipe, vergi ve yük teste, terim `domain.ts` içine.

SIRA: D0 > D1 > (D2, D3) > D4 > D5. D6 bağımsız. D2 asla D1'den önce gelmez; kontrol, yerine geçecek mekanizma çalışır görülmeden kaldırılmaz.

## Durum

- HEAD: 80053fd (25 Ağustos 2026 — D4b budama). Denetim E gereği burada CURRENT.md'ye dokunan son commit'in EBEVEYNİ yazar; kapanışta YAZMA ANINDAKİ HEAD yazılır, çünkü kapanış commit'i CURRENT.md'ye dokunur ve "son commit" o olur.
- Migration 20260822130000 CANLIDA. Kod: 299/299 test, build geçer, eslint 0 hata (2 bilinen react-refresh uyarısı). Originde tek dal: main.
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

## Sıradaki iş

0. **DOKÜMAN TEMİZLEME TURU** — optimizasyon turu olarak açık, yukarıdaki bölüme bakınız. Turun altı başlığından CURRENT.md daraltması, CLAUDE.md sağlaması ve Anthropic dokümanlarının incelenmesi yapıldı; TECH-DEBT dar sayımı (muhasebe modülüne ait borçların sayım dışı kalması) HENÜZ YAPILMADI.
1. **PROJE AÇMA YOLU** — uygulama içinden proje seçim ekranına dönüş yolu yok. Bayraklı kullanıcı ikinci projesini açabiliyor (`signOut` önce `clear-claims` çağırdığı için tekrar girişte seçim ekranına düşülüyor); bayrağın elle konması arıza değil SK-AUTH-1 kararıdır, prosedürü `BOOTSTRAP-MUSTERI.sql`. Gerçek eksik, üst bağlam seçicisidir. Neye bağlı: hiçbir şey. Neyi bloke ediyor: her şablon değişikliğinin gözle doğrulanması.

Uzun vadeli iş, backlog ve tamamlananlar: `docs/IS-SIRASI.md`.

## Açık kalanlar

Bu bölüm 25 Ağustos 2026'da D4b ile boşaltıldı. Her madde ya kendi ev dosyasına taşındı, ya `docs/IS-SIRASI.md` Backlog'una aktı, ya da evinde zaten yazılı olduğu için silindi. Yeni bir açık soru doğduğunda buraya yazılmaz: önce evi bulunur (INDEX bölüm 7.0), karar o dosyada yaşar.

## Korunan önceki kararlar

- CARD-DESK yerleşimi (kilitli): daralabilir sol ray + üst bağlam + orta masa + sağ referans.
- İki değer yüzeyi eşittir: harcama operasyonu ve bütçe görünürlüğü. Anomali FİŞ-BAZLIDIR, ayrıdır.
- Bütçeyi her seviyede YALNIZ muhasebe görür ve yazar.
- Yama yok: çıkar-değiştir.

## Referans (içerik tohumu)

- Tür şablonları: REKLAM (AICP 11 kart), FİLM (Movie Magic ~30 kart), DİZİ (scope + episode_no). Türkçe sahadan.
- Master kalem listesi: 4746 tekil (Oyuncu-Kast 197 kalem, 1600 için).
- İki katman: şablon yalın, kütüphane autocomplete ile.
