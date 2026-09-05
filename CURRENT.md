# KAAPA — CURRENT.md

⚠ TERMİNOLOJİ: 2026-07-11 öncesi kayıtlarda Miktar=kişi/adet, Çarpan=süre okunur; sonrasında Miktar=süre, X=kişi/adet (bkz. GLOSSARY tarihçe).

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR. Ne yapıldığı git log'da, kararlar kendi ev dosyalarında yaşar (harita: INDEX.md bölüm 7.0).

## Milestone

M2 — Çekirdek Döngü. Bütçe: kavram + şema + DB temeli + göç CANLI; kart mimarisi 1100-1600 KİLİTLİ; MÜHÜR-3'ün alt yapısı (etiket kopyası + proje kapsamı) CANLI.

- **21 Haziran – 25 Ağustos 2026 (özet; ayrıntı git log, kararlar ev dosyalarında).** Bütçe DB temeli ve `fn_open_budget` canlıya girdi; vergi/yük modeli ile KART 1500 ekranı kilitlendi. DILIM-3 bordro motoru beş dilimde tamamlandı; şirket profili şeması ve `fn_resolve_sgk_scenario` canlı. Terminoloji devrimi uygulandı. MÜHÜR-1 ve MÜHÜR-2 canlı. R1/R2/R3 ekran refaktörü ve KLV klavye motoru kuruldu. AĞUSTOS: KABUK tasarımı `docs/KABUK-KARARLARI.md`yi tek kaynak olarak kurdu (sprint 8-12 Ağustos, tag v0.4-kabuk); doc-check (Denetim A-F) ve INDEX.md yaratıldı; kart masası (db8d5bd) geldi. KART 1100 iki dilimde tamamlandı, aidiyet koddan çıkıp `budget_items.heading_code`'a taşındı. Proje yaşam döngüsü canlıya girdi. NET/BRÜT doktrini revize edildi, KART 1600 üç kademeli tasarımı karara bağlandı.
- **30 Ağustos 2026 — Optimizasyon turu kapandı.** Açılış üçlüsü 90.984 → 19.598 bayt, deterministik kapı 0 → 7. Kolon seti `columns.ts`'e, terim `domain.ts`'e taşındı.
- **31 Ağustos – 4 Eylül 2026 (özet).** Kolon modeli tamamlandı (13 veri kolonu; Açıklama kalktı, Maliyet/KDV ayrıldı; Ara toplam/Toplam adlandırması) — NET/BRÜT doktrini kodda. `yemek` statüsü ayrıldı. Bordro motorunun DB okuması toplu hale geldi, kart kapağı Maliyet'e geçti. DEĞİŞMEZLER yüzeyi açıldı (`docs/DEGISMEZLER.md`, açılış okuma sırasına girdi). AİDİYET-3 göçüyle `fn_open_budget`'ın `heading_code` doğum yolu düzeltildi. KART 1600 katalog kararları (29→28 atom, 3900 kod çakışması düzeltmesi, 1610/1619 ayrımı, statüler) `docs/butce/KART-KATALOGU.md` §7.5'e işlendi. Ayrıntı git log'da.
- **5 Eylül 2026 — KART 1600 canlıya girdi (üç dilim + ekran denemesi).** Kütüphane tohumu (M2: 4 başlık + 28 atom, `heading_id` ile aidiyet, `is_duty` görev bayrağı), K-B doktrini iptali (aidiyet `item_library.card_code`'a taşındı, muhtelif öneki karta ayrıldı), şablon gövdesi (M3: 13 çekirdek atom, `misc_prefix`) sırayla canlıya girdi ve gerçek bir bütçede denendi — kart açılışı, başlık dağılımı, Oyuncular listesi panosu çalışıyor. Bu turda bir teşhis hatası ("kişi listesinin kapısı yok" iddiası, tam okunmamış bir grep çıktısından kuruldu) kaynağa dönülerek düzeltildi — bkz. `docs/protokol/DERSLER.md`. Üç katalog kararı alındı, henüz UYGULANMADI (1620 kalkıyor, kütüphaneden eklenirken kişi soran/sormayan atomlar ayrıldı — asks_person kuralı): tam metin `docs/butce/KART-KATALOGU.md` §7.5.
- **5 Eylül 2026 — MÜHÜR-3 dilim 1-2 canlıya girdi (dac0e0e, 691e637, 78a5cce, 128a7cd).** Kişi/iş etiketleri (`budget_cost_objects`) bütçe kapsamından PROJE kapsamına taşındı; mühürlü bütçe artık kendi etiket kopyasından (`budget_cost_object_snapshot`) okur, canlı tablodan değil. Bir KVKK bulgusu (etiket değişiklik kaydının herkese açık kalması riski) aynı turda yakalanıp düzeltildi. Gerekçe, geri dönüşü ve tam metin: `docs/butce/BUTCE-SEMA-KARARLARI.md`. Bu taşıma Üretim Kayıtları'nın önkoşuluydu; ekranı bugün YAZILMADI, yalnız veri katmanı hazır.
- **5 Eylül 2026 — Üretim Kayıtları tasarımı bitti (Engin).** Bütçe rayında yeni durak, kart mimarisi ve veri sahipliği ilkeleri (VERİNİN SAHİBİ KAAPA'DIR, bütçe değil) karara bağlandı — `docs/KABUK-KARARLARI.md` §12.1b, §4 GEVŞEME, §12.3 KAPSAM. Tasarım BİTTİ; sıradaki oturum doğrudan uygulamaya başlar (bkz. Sıradaki iş).
- **6 Eylül 2026 — Üretim Kayıtları durağı kodda canlıya girdi.** Bütçe rayında Bütçe Girişi'nden hemen sonra yeni durak açıldı (`nav-rail.tsx`, `authenticated-shell.tsx`); kendi ekranı (`production-records-screen.tsx`) masa + Oyuncular listesi olarak kuruldu, listeye giriş buradan yapılıyor. Karttan açılan Oyuncular panosu (`person-list-sheet.tsx`) SALT OKUNUR oldu, yalnız ajans/menajer tikleri karttan işaretlenebilir kaldı — `card-table-screen.tsx`'teki "+ Kişi ekle" ve çağıran taraf temizlendi. Şema dilimi (`budget_cost_objects`'e ajans/menajer haneleri) YAZILDI ama CANLIYA UYGULANMADI — Engin onayı bekliyor (bkz. Sıradaki iş). Servis (`person-label-service.ts`) dört yeni hane ve `countPersonLabels` ile genişledi. Test: 328 → 330. Karar evi: `docs/KABUK-KARARLARI.md` §3/§12.2, `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20.

## Durum

- HEAD: f02e1fd (5 Eylül 2026 — oturum kapanışı). Denetim E gereği burada CURRENT.md'ye dokunan son commit'in EBEVEYNİ yazar; kapanışta YAZMA ANINDAKİ HEAD yazılır, çünkü kapanış commit'i CURRENT.md'ye dokunur ve "son commit" o olur.
- MUHUR-3 CANLIDA ve doğrulandı. Kişi ve iş etiketleri artık PROJE kapsamında.
- ÜRETİM KAYITLARI DURAĞI kodda CANLIDA (bkz. Milestone 6 Eylül). ŞEMA DİLİMİ (ajans/menajer haneleri, `20260906120000_uretim_kayitlari_temsilci_haneleri.sql`) YAZILDI, CANLIYA UYGULANMADI — `npx supabase db push` Engin onayını bekliyor. Onay gelmeden ekrandaki ajans/menajer tikleri canlı DB'de çalışmaz (kolon yok).
- Migration 20260901130000'den 20260905180000'e kadar (KART 1600 M1/M2/M3, K-B iptali, MÜHÜR-3 dilim 1-2 dahil) CANLIDA; 20260906120000 BEKLEMEDE. Kod: 330/330 test. Build geçer, eslint 0 hata. Originde tek dal: main.
- Bütçe kolon modeli: 13 veri kolonu + etiketsiz silme hanesi — No · Ad · Statü · Dönemler · Birim · Birim net · Miktar · X · Ara toplam · Yasal Yük · Maliyet · KDV · Toplam.
- ÇALIŞMA ORTAMI: yedi deterministik kapı kurulu (dal, sığ klon, damga varlığı/tazeliği, ASCII'ye düşmüş .md metni, tanımsız CSS token, test sayısı kaybı) ve `supabase db push` onaya bağlı. Bu ortamda Docker YOK — `db reset`/`db dump` çalışmaz, `db push` ve salt-okuma `db query` çalışır (bkz. DERSLER.md "Sandbox gerçeği"). Ayarlar `.claude/settings.json`, kapılar `.claude/hooks/`.
- KLV KAPANMADI: macOS gerçek cihaz turu yapılmadı. `v0.2-klv` etiketi ATILAMAZ.
- BORÇ DURUMU: `docs/TECH-DEBT.md` tek otoritedir, sayı burada taşınmaz.

## MÜHÜR DURUMU

MUHUR-3'ün ALT YAPISI (etiket kopyası + proje kapsamı) canlıda ve doğrulandı, ama mühürleme YÜZEYİ henüz yok: `fn_lock_budget` RPC'sini uygulama kodu hâlâ hiçbir yerden çağırmıyor, kullanıcının bir bütçeyi kilitleyebileceği bir buton/ekran bugün yok. Bu ayrım önemli: alt yapı hazır bekliyor, tetikleyen yüzey ayrı bir dilimdir.

## Karar evleri (işaretçi)

Aşağıdaki konuların TAM metni kendi ev dosyasındadır; CURRENT.md kopya taşımaz. Tam harita: `INDEX.md` bölüm 7.0.

- Vergi ve yük modeli — üç eksen, statü cetveli, `rate_catalog` → `docs/butce/VERGI-MEVZUATI.md` + `docs/butce/PERSONEL-MEVZUATI.md`
- KART 1500 kolon seti ve terminoloji mührü → `docs/butce/BUTCE-EKRAN-KARARLARI.md` + `docs/GLOSSARY.md`
- KART 1600 üç kademeli tasarım + katalog (28 atom) → `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20 + `docs/butce/KART-KATALOGU.md` §7.5 + `docs/butce/KART-GEREKCELERI.md`
- Bütçe şema kararları (B-serisi), NET/BRÜT doktrini, MÜHÜR-3 (etiket kopyası + proje kapsamı) → `docs/butce/BUTCE-SEMA-KARARLARI.md`
- Bir daha tartışılmayacak değişmezler → `docs/DEGISMEZLER.md`
- Kabuk, sol ray, kart masası, Üretim Kayıtları tasarımı → `docs/KABUK-KARARLARI.md`
- Kart mimarisi ve kilitli kartlar (1100, 1300, 1400, 1500, 1600) → `docs/butce/KART-KATALOGU.md`
- Ödeme statüsü kümesi ve Statü rehberi → `docs/butce/BUTCE-UI-MIMARISI.md` + `docs/butce/BUTCE-EKRAN-KARARLARI.md`

## Sıradaki iş

**MADDE 1: ÜRETİM KAYITLARI ŞEMA ONAYI VE CANLIYA ALMA.** Kod tarafı (ekran, servis, ray, ikon, kabuk) bu oturumda YAZILDI ve testten geçti; eksik olan tek şey canlı DB. Sıradaki oturumun ilk işi:
- `supabase/migrations/20260906120000_uretim_kayitlari_temsilci_haneleri.sql` Engin'e SQL olarak gösterilir, onay alınır, `npx supabase db push` çalıştırılır.
- Push sonrası ekranda ajans/menajer tikleri gerçek veriyle elle denenir (okuma/yazma), CURRENT.md'ye "CANLIDA ve doğrulandı" olarak işlenir.

Tam metin ve gerekçeler: `docs/KABUK-KARARLARI.md` §12.1b/§4/§12.3, `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20 ÜRETİM KAYITLARI — LİSTE KARARLARI.

## Açık kalanlar

Bu bölüm KARAR DEĞİL, henüz karara bağlanmamış açık sorulardır (yalnız bu modülün işi; diğerleri `docs/IS-SIRASI.md` Backlog'a).

- Masadaki kart başlıkları (Oyuncular, Ekip, Mekânlar…) tablo mu kod sabiti mi. Bugün kapsam dışı bırakıldı; ikinci kategori doğunca konuşulur.
- Belgeden kopyalama (içe aktarma): hangi kolonlar, hangi biçim, aynı isim ikinci kez gelirse ne olur. Kendi tasarım turunu ister.
- `fn_check_cost_object_kind` artık ŞARTLI garanti: bileşik FK her yazımda koruyordu, tetik yalnız iki etiket kolonu değiştiğinde koruyor. Kalemin bütçesi sonradan değiştirilirse bağ sessizce projeler arası kalabilir. Bugün böyle bir işlem yok.

Uzun vadeli iş, backlog ve tamamlananlar: `docs/IS-SIRASI.md`.
