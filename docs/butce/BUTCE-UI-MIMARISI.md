# KAAPA — BÜTÇE UI KOD MİMARİSİ (İ-serisi)

*Bütçe modülü ekran KODUNUN yapı anayasası — bileşen/hook/servis düzeninin TEK KAYNAĞI. Davranış/etkileşim kararları: BUTCE-EKRAN-KARARLARI.md. Şema/teknik: BUTCE-SEMA-KARARLARI.md. Kart/kalem domain: KART-KATALOGU.md. Oluşturma: 12 Temmuz 2026 — monolit teşhisi + rakip taraması (MMB / Saturation / Hot Budget) + doktrin sentezi; karar Engin+Opus.*

## 0. Neden var
budget-card-screen.tsx 1241 satırlık TEK bileşene ulaştı (13 state + ~15 handler + 3 sheet iç içe); hedef ~40 kart. v8 dersi: monolit üstüne özellik dikilmez. Rakip sentezi tek cümle: MMB, Saturation ve Hot Budget aynı iskeleti taşır — tek yeniden-kullanılan grid + seviyeli navigasyon + satırdan bağımsız kesişen motorlar + "mod" olarak versiyon/karşılaştırma. Bu dosya o iskeletin KAAPA karşılığını mühürler; refaktör ve sonraki tüm ekran dilimleri buradan okur.

## 1. Eksen zinciri (mühürlü kararların toplaması)
Bütçe → Versiyon (KL-1 V-sekmeleri) → Yüzey (ray: İcmal ① / Kart masası ② / Raporlar ③ / Gerçekleşen ④ / Tanımlar ⑤; EKRAN-MUHASEBE §19) → Kart (~40; kart açılınca masayı kaplar) → Kalem (11 kolon) → Dönem → Kova. Transversal eksenler: cost_object (4. eksen) + görünürlük maskesi (KART-KATALOGU §5.1). percent_lines AYRI doğa (İ6). Dizi: üst bağlam çubuğunda bütçe seçici (Sezon / Bölüm 1..n) — bölüm ayrı bütçe bağlamıdır, 30 bölüm tek tabloya AKMAZ; ekranda her an tek kartın tablosu vardır.

## 2. İlkeler (İ1–İ7)
- **İ1 — Tek tablo motoru, kart-parametrik, SAF SATIR.** item-row/period-row yalnız veri şeklinden render eder; kart-özel dal (if kart==1500) YASAK; kart farkları günü gelince config prop olarak iner. Satır bileşenleri saf + React.memo. Memo ön koşulu prop stabilitesi: inline closure YASAK; satıra itemId + sabit referanslı (id, field, value) imzalı handler seti gider; buffer haritası tek hücre yazımında diğer satırları tetiklemeyecek şekilde bölünür. Virtualization BUGÜN YOK; bu kurallar kapıyı bedavaya açık tutar (gerekirse ölçülüp eklenir).
- **İ2 — ViewMode tek kapı.** Salt-okunurluğun sebepleri (versiyon görüntüleme, kilitli taslak, görünürlük maskesi) satıra TEK prop olarak iner; sebep→prop çevirisi yalnız view-mode katmanında yapılır. Tip: { kind: draft } | { kind: version, no } — ileride compare varyantı buraya eklenir, grid koduna dokunulmaz. Satır "neden salt-okunur" bilmez.
- **İ3 — Overlay tek aile.** Yasal Yük / statü rehberi / not sheet'leri ortak bottom-sheet primitivinden türer (aynı backdrop+panel+başlık iskeleti). "Mühür eki — [tarih] tarihli cetvel" rozeti sheet başlığına TEK dikişle girer (MÜHÜR-3b).
- **İ4 — Ekran ≠ kabuk.** Kalem tablosu ekranı budgetId / cardId / viewMode değerlerini dışarıdan alabilir; varsayılanlar bugünkü davranıştır (tek bütçe + ilk kart + taslak). CARD-DESK kabuğu (daralabilir sol ray + üst bağlam + orta masa + sağ referans) AYRI iştir (IS-SIRASI sıra #5); V-sekmeleri ve dizi bütçe seçicisi kabuğun üst bağlamına aittir, kart tablosuna sıkıştırılmaz.
- **İ5 — Servis eksen bölünmesi.** Yeni eksen = yeni servis dosyası; mevcut dosya şişirilmez. version-service.ts (MÜHÜR-3a), payroll-read.ts (bordro okuma bloğunun mekanik ayrımı, R3). getFirstCard → getCard(cardId); getFirstCard ince geriye-uyum sarmalayıcı olarak kalır.
- **İ6 — percent_lines bu motordan geçmez.** Satır-kalem geometrisine benzemez (Completion Bond / Contingency / Overhead / Insurance); Ekran ②'nin dibinde kendi ince bileşeni olur. Motoru onları taşımaya zorlamak yanlış soyutlamadır.
- **İ7 — Klavye-birinci tablo motoru.** TASARIM-KARARLARI §8 m5–m6'nın (Enter/Tab Excel hızı; kayıt düğmesi yok) YAPISAL karşılığı. Tablo seviyesinde TEK gezinme denetleyicisi (use-grid-navigation): her hücre (satır, kolon) koordinat sözleşmesi taşır; Enter = kaydet + aşağı, Tab = sağa (satır sonunda sonraki satırın başı), ok tuşları hücre gezinme, yazmaya başlamak düzenlemeye girer, Esc = buffer iptali. Kayıt ASLA odak çalmaz: async dönüş / patch, odaklı hücrenin buffer değerine dokunamaz (öncelik her zaman klavyedeki değerde). Sayısal hücreler inputMode=decimal (tr virgül toleransı). Dokunmatik ve native select yan yana yaşar; kural "fare yasak" değil "fare ŞART değil".
  - **KLV-K6 — Görüntü/taslak ayrımı** (KİLİTLENDİ 2026-07-12, KLV dilimi): grid durağı sayısal hücrelerde nav modu değeri fmt() ile biçimlenmiş gösterir (binlik nokta/virgül); edit moduna girişte (Enter=koru, yazı=üzerine yaz) değer ham sayıya döner; input hiçbir modda unmount edilmez, sadece gösterilen value değişir. Commit mevcut onChange/commit yoluna delege edilir (yeniden yazılmaz).
  - **KLV-K7 — Select hücreler grid durağı DEĞİL** (KİLİTLENDİ 2026-07-12, KLV dilimi): Statü/Dönemler/Birim (native `<select>`) hiçbir grid-navigasyon listener'ı almaz; onlara klavye ile giriş SADECE mouse click ile mümkündür (bir kez tıklanıp select-kümeye girildikten sonra küme içinde native Tab çalışır, çünkü komşu select'lerin arasına listener girmez). Bizim Tab-intercept SADECE `data-grid-cell` (metin/sayısal) hücreden tetiklenir ve preventDefault ile native sırayı iptal ederek doğrudan bir sonraki `data-grid-cell`'e atlar — yani select'ler bir grid hücresinden Tab ile atlanır (kaybolmazlar, sadece o sıçramanın durağı olmazlar). Ok tuşları (spatial) da select'lere hiç uğramaz — native select'in ok-tuşu semantiği (değer değiştirme) ile çakışacağından. Gerekçe: native select ile "edit mode" kavramının çatışması ayrı bir alt-motor gerektirir; bu sessiz basitleştirme değil, kapsamı KLV dilimi içinde tutan bilinçli bir sınırdır.
  - **KLV-K8 — Dikey gezinme semantik eşdeğerlik grubu** (KİLİTLENDİ 2026-07-13, KLV dilimi): Ok yukarı/aşağı ve Enter-sonrası-aşağı artık kolon-İNDEKSİ değil, aktif kolonun ait olduğu eşdeğerlik grubuna göre hedef arar (name↔name, unitNet↔periodNet, repeat↔periodRepeat, multiplier↔periodQty); gruptan hiçbir kolon taşımayan satırlar (araya giren name-only çok-dönemli ItemRow gibi) atlanır. Grup verilmezse (columnGroups undefined) eski index-clamp davranışı değişmeden çalışır (geriye uyum). Bulunan gerçek bug: heterojen satır karışımında (tek-dönemli 4-kolon ItemRow / çok-dönemli isim-only ItemRow / 3-kolon PeriodRow) Enter'la ardışık aşağı inildikçe colIndex 0'a (isim) kilitleniyordu, Birim Net'e hiç erişilemiyordu. use-grid-navigation.ts'e COLUMN_EQUIVALENCE_GROUPS bağlandı; sol/sağ (Tab, ArrowLeft/Right) değişmedi. 6 yeni çekirdek test.
  - **KLV-K9 — Latest-ref yazımı layout-effect'te, hook dönüşü destructure** (KİLİTLENDİ 2026-07-16, BORÇ-B3): İki kural. (1) Render gövdesinde ref'e yazmak YASAK — use-card-rows'taki rowsRef/cardRef/stagesRef/unitLabelByIdRef yazımları bağımlılıksız useLayoutEffect'e taşındı; linter kuralı burada haklıydı (concurrent render'da atılan bir render'ın değeri ref'te kalabilir), layout effect boya öncesi senkron koştuğu ve tüm okuyucular (grid/commit yolları) olay-anında çalıştığı için bayatlık penceresi yoktur. (2) use-grid-navigation dönüşü kullanan bileşen nesneyi bütün almaz, ihtiyacını destructure eder (containerRef/handleKeyDown/handleFocus/isActiveEdit) — nesne containerRef içerdiği için linter tüm nesneyi kirli sayar (taint yayılımı) ve yalnız-state-okuyan isActiveEdit bile suçlanır; destructure taint'i kökten kırar. İ7 motoruna dokunan gelecek işlerde bu iki desen standarttır; eslint-disable YASAK (KLV lint borcu sıfır suppress ile kapandı).
  - **KLV-K10 — Tuş Sözleşmesi (K10 revize + TD-16, 2026-07-18):** Tablo seviyesinde HANGİ tuş/olayın nav/edit modunda ne yaptığı TEK yerde (grid-navigation-core.ts → `resolveKeyAction`, DOM'suz, saf) kararlaştırılır; use-grid-navigation.ts bu kararı aynen uygular (preventDefault + varsa dispatch/kopyalama), kendi tuş-özel dallanma İÇERMEZ. **MOD tanımı:** Windows'ta Ctrl (`event.ctrlKey`), macOS'ta Cmd (`event.metaKey`) — aşağıdaki tabloda MOD geçen her satır iki platformda bu eşlemeyle çalışır.

    | Tuş/olay | Nav modu | Edit modu |
    |---|---|---|
    | Enter | düzenlemeye girer (mevcut ham değerle) | kaydet + K8 grubunda **aşağı** |
    | Shift+Enter | **yutulur** (düzenlemeye girmez) | kaydet + K8 grubunda **yukarı** |
    | MOD+Enter | düz Enter ile aynı (yerinde kalacak bir şey yok) | kaydet + odak **aynı hücrede kalır** (nav'a döner, hedef değişmez) |
    | Tab / Shift+Tab | sağa/sola gezinir | kaydet + sağa/sola (satır sonunda sonraki dolu satıra sarar) |
    | Ok tuşları | hücre gezinme | kaydet + dikey (K8 grubu); yatay (sol/sağ) inputun kendi imleç hareketine bırakılır |
    | Esc | etkisizdir | buffer iptali, nav'a döner |
    | Yazdırılabilir karakter | bos taslakla düzenlemeye girer (üzerine yazar) | inputun doğal davranışı |
    | Backspace / Delete | boş taslakla (`draft=''`) düzenlemeye girer — rakam tuşlamakla AYNI yol | inputun doğal davranışı (dokunulmaz) |
    | Yapıştırma (MOD+V / sağ-tık menüsü — hepsi aynı `paste` DOM olayı) | düzenlemeye girer, pano metni taslağa yazılır, **COMMIT ETMEZ** | native (`onChange` üzerinden taslağa akar) |
    | Sürükle-bırak metni | **engellenir** (`preventDefault`, metin işlenmez) | native (input'un doğal drop davranışı) |
    | MOD+C | odaklı hücrenin **ham** değerini panoya yazar | dokunulmaz (native kopyala) |
    | MOD+X | yutulur | dokunulmaz (native kes) |
    | MOD+Z / MOD+Y | **her iki modda da yutulur** (tarayıcı undo/redo devre dışı; ileride uygulama-düzeyi geri-al için rezerve, şimdilik işlevsiz) | aynı |
    | Home/End/PageUp/PageDown | yutulur | inputun doğal davranışı (Home/End); PageUp/PageDown'ın tanımlı bir etkisi yok |
    | AltGr karakter girişi (Windows: ctrlKey+altKey birlikte + `key.length===1`, örn. TR AltGr+E=`€`) | kısayol DEĞİL karakter girişidir — MOD-kombinasyonu kurallarından ÖNCE değerlendirilir, normal yazı gibi işlenir | native |
    | Sayfa-düzeyi kısayollar (MOD+S, MOD+P, MOD+F, MOD+R, F5 vb.) | **dokunulmaz** — preventDefault YAPILMAZ, tarayıcıya bırakılır | aynı |
    | Sözleşmede olmayan diğer tüm tuşlar | **varsayılan yasak**: hücre değerine işlemez, preventDefault YAPILMAZ | native |

    Dört ilke: **(a) varsayılan yasak** — sözleşmede olmayan hiçbir tuş/olay nav modunda hücre değerine işlemez, reducer'dan geçmeden input değeri değişemez; **(b) sayfa-düzeyi tarayıcı kısayollarına dokunulmaz** — (a)'nın istisnası değil, ayrı ve öncelikli bir kural (hangi tuşun "sayfa kısayolu" sayılacağını programatik ayırt edemeyeceğimiz için tabloda AÇIKÇA LİSTELENMEYEN hiçbir kombinasyon preventDefault almaz); **(c) yeni tuş davranışı ANCAK matrise satır eklenerek doğar** — resolveKeyAction dışında dağınık tuş-özel `if` YASAK; **(d) MOD soyutlaması** — kısayollar kodda `ctrlKey || metaKey` ile tek yerde MOD'a indirgenir, platform dallanması yayılmaz. **SERH:** macOS davranışları (metaKey yolu) kod testleriyle kapsanmıştır (resolveKeyAction'ın hem ctrlKey hem metaKey varyantları test edilir) ancak gerçek Mac cihazında manuel doğrulama HENÜZ YAPILMADI — cihaz bulununca platform turu koşulacak, bu satır o zamana kadar açık kalır. **K10 tarihçesi:** ilk öneri (yatay giriş zinciri — Açıklama→Birim Net→Miktar→X→sonraki satır tek Enter'la) İPTAL edildi; kabul edilen MMB hizası Enter=dikey (K8 grubu), satır-içi giriş=Tab. Fare davranışı (sağ-tık menü tasarımı dahil) BU PAKETİN KAPSAMI DIŞINDA — ayrı çalışma.
  - **KLV-K11 — BottomSheet klavye kalıbı (KİLİTLENDİ 2026-07-24):** Statü rehberi / Not / Yasal Yük sheet'leri (tek ortak parça bottom-sheet.tsx) W3C modal-dialog kalıbı taşır — açılışta odak kapat düğmesine girer; Tab yalnız pencere içinde döner (arkaya sızmaz); Esc kapatır (document-capture dinleyici, olay grid'e sızmaz; Esc = çık, çıkış = mevcut otomatik-kayıt davranışı aynen); kapanışta odak tetikleyen öğeye geri döner (isConnected kontrolüyle). İleride aynı primitiften doğacak her pencere (örneğin D3c mini istasyonu) bu davranışı doğuştan taşır. Sheet açıkken grid tuşları konu dışıdır çünkü odak trap içindedir; K10 matrisine ayrı satır gerekmez.

## 3. Hedef dosya haritası
    src/app/muhasebe/budget/
      card-table-screen.tsx        orkestrasyon (R2'de bugünkü ekrandan doğar)
      view-mode.ts                 ViewMode tipi + readOnly türetimi (MÜHÜR-3a)
      format.ts                    fmt / bordroReasonMessage / itemHasNote / isMultiPeriod / buildDonemler / summarizeSame
      components/
        table-styles.ts            th/td/input/period stil sabitleri
        bottom-sheet.tsx           ortak overlay primitivi (backdrop + panel + başlık + kapat)
        burden-sheet.tsx           Yasal Yük dökümü (bordro 6-bacak + basit statü dalları)
        status-info-sheet.tsx      statü rehberi
        note-sheet.tsx             İç Not / Kamu Notu
        item-row.tsx               ana satır (R2)
        period-row.tsx             dönem alt-satırı (R2)
        version-tabs.tsx           (MÜHÜR-3a)
        seal-controls.tsx          (MÜHÜR-3b)
      hooks/
        use-edit-buffers.ts        buffers/savedRef/commit TEK boğazı (R2)
        use-card-rows.ts           veri yükleme, budgetId+cardId parametreli (R2)
        use-grid-navigation.ts     İ7 motoru (KLV)
    src/shared/supabase/
      budget-service.ts            açılış + kart okuma + kalem yazma (küçülür)
      payroll-read.ts              bordro türetme bloğu (R3)
      version-service.ts           mühür/versiyon okuma-yazma (MÜHÜR-3a)
Gelecek yüzeyler (İcmal, kart masası, kabuk) bu klasöre kardeş ekran olarak gelir; şimdi açılmaz.

## 4. Bilinçli YAPILMIYOR
State kütüphanesi yok (React state + SSOT Supabase yeter). Genel amaçlı DataGrid soyutlaması yok (11 kolon doktrinli ve sabittir; jenerik grid = erken soyutlama). Virtualization yok (ölçmeden kurulmaz; İ1 kapıyı açık tutar). Kart-config sistemi bugün kurulmaz (İ1). Context-provider ormanı yok (prop yeter; prop sızıntısı büyürse tek RowContext'e dönülür).

## 5. Uygulama sırası (R-serisi)
R1 cansız parçalar (stiller + format + bottom-sheet + 3 sheet; mantık TAŞINIR, yeniden yazılmaz) → R2 canlı çekirdek (item-row / period-row / use-edit-buffers / use-card-rows + budgetId/cardId/viewMode parametreleri + ekranın budget/ klasörüne taşınması; İ1 saf-satır kuralları burada kurulur) → R3 servis dikişi (payroll-read.ts + getCard) → KLV klavye motoru (İ7) → MÜHÜR-3a (version-service + version-tabs + view-mode) → MÜHÜR-3b (readOnly inişi + seal-controls + Mühür eki rozeti + revizyon akışı). Her dilim davranış-sıfır ya da tek özellik; kapı = npm run build + tüm testler yeşil + Engin görsel turu.

## 6. Offline boğazı
use-edit-buffers tüm yazmaları tek commit boğazından geçirir; Faz-2 offline outbox (ARCHITECTURE 5.7 + G8 kararı: cihazda kuyruk + bağlantıda otomatik gönderim + çakışmada Supabase kazanır) o boğaza TEK noktadan takılır. Bugün kurulmaz: bütçe girişi masaüstü-önerilir ofis işidir; offline kuyruk önceliği saha fişindedir. Bugünkü davranış: optimistic-with-rollback (UI anında, hata gelirse eski değere dön + toast) — bilinçli Faz-1 davranışıdır.

## 7. KUR-1 işareti
Çok-para-birimi YERLEŞİMİ BUTCE-SEMA-KARARLARI.md KUR-1'de mühürlü: girilen birim+tutar SATIRDA (gelecek şema dilimi), kur KATALOGDA (mühür snapshot'ı kuru da dondurur), çevrim CFE'de, gösterim ViewMode/rapor katmanında. Bu dosyaya etkisi: para biçimleme yalnız format.ts üzerinden; satır bileşenine TL sembolü gömmek YASAK; fmt imzası ileride currency parametresine açılır.
