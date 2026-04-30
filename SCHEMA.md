# PRODAPP — APP Namespace Şeması

**Son güncelleme:** 30 Nisan 2026  
**Kaynak:** index.html  

Bu doküman APP namespace'inin tam yapısını tanımlar. Yeni kod yazarken,
export veya servis katmanı oluştururken field isimlerinde referans budur.

---

## Bu doküman NE ZAMAN güncellenir

Bu şema canlı bir referans. Aşağıdaki durumlarda AYNI commit içinde
SCHEMA.md da güncellenir — kod değişir, şema değişmez olmaz.

- APP.data altına yeni koleksiyon eklenirse
- Mevcut koleksiyondaki bir objeye yeni field eklenirse
- Field adı değişirse (örn. "kat" → "kategori")
- Field tipi değişirse (örn. string → number)
- Enum değerleri değişirse (örn. durum'a yeni bir durum eklenirse)
- APP.ui'ya yeni state field eklenirse
- Yeni bir _compute* fonksiyonu yazılırsa
- Mevcut _compute fonksiyonunun dönüş şeması değişirse

Güncelleme sorumluluğu:
- Kodu yazan commit'te şema güncellenir.
- Commit mesajında "schema updated" ibaresi geçer.
- Yeni oturum başlangıcında Claude SCHEMA.md'yi okur, bağlamı buradan kurar.

---

## BÖLÜM 1 — APP.data (Mali Veri — KRİTİK)

### APP.data.fisler
**Tip:** Array\<Fis\>  
**Kaynak satır:** ~3880 (grep ile doğrula)  
**Kullanım:** Mali işlemlerin ana koleksiyonu — saha girişi, onay zinciri, rapor kaynağı.

#### Fis objesi field listesi

| Field      | Tip     | Değerler / Örnek                                              | Açıklama                                           |
|------------|---------|---------------------------------------------------------------|----------------------------------------------------|
| id         | number  | 1, 2, 7, 20…                                                  | Demo'da sıralı tamsayı; canlıda Date.now() tabanlı |
| tarih      | string  | `"03.04.2026"`                                                | DD.MM.YYYY format                                  |
| personel   | string  | `"Mehmet Kaya"`                                               | Kullanıcı TAM ADI (ad + soyad) — string, obje değil|
| satici     | string  | `"Petrol Ofisi"`, `"Tavuk Dünyası"`                           | Satıcı/tedarikçi adı                               |
| kat        | string  | `"Yakit"`, `"Yiyecek"`, `"Ekipman"`, `"Ulasim"`, `"Sanat"`, `"Diger"`, `"Kiralama"` | Kategori — enum (Türkçe karaktersiz) |
| tutar      | number  | `1000`, `780.5`                                               | TL cinsinden                                       |
| donem      | number  | `1`, `2`                                                      | Dönem numarası                                     |
| durum      | string  | `"dept-bekleyen"`, `"acc-bekleyen"`, `"onaylandi"`, `"reddedildi"`, `"bolundu"` | Onay durumu — enum. `'bolundu'` = kısmi onay sonrası parent fiş işareti; çocuk fişler `parentFisId` ile bağlanır, parent kayıt değişmez (ARCHITECTURE 1.4). Eski `"bekleyen"` fallback olarak korunur. |
| uyari      | string\|null | `"Mükerrer fiş"`, `null`                               | Uyarı mesajı; yoksa null                           |
| thumb      | null    | `null`                                                        | Demo'da her zaman null (görsel yok)                |
| dept       | string  | `"yapim"`, `"kamera"`, `"sanat"`, `"ses"`, `"kostum"`        | Opsiyonel — saha personelinin fişlerinde yok       |
| belgesiz   | boolean | `true`, `false`                                               | Opsiyonel — belge yüklenmeden girilmiş fiş         |
| aciklama   | string  | `"Nakit ödeme, fiş verilmedi"`                                | Opsiyonel — belgesiz fişlerde gerekçe              |
| kiraMeta   | object  | `{ bas:'2026-04-01', bit:'2026-04-05', gunluk:450 }`          | Opsiyonel — sadece kat:'Kiralama' fişlerinde       |
| duplikat   | boolean | `true`                                                        | Opsiyonel — mükerrer fiş işareti                   |
| parentFisId | number\|null | `1`                                                      | Opsiyonel — kısmi onay çocuğu ise parent fişin id'si. ARCHITECTURE 2.3 referansı. |
| kismiTip   | string\|null | `'onay'` / `'red'`                                        | Opsiyonel — kısmi onay çocuk fişlerinde çocuğun rolünü belirtir.  |

#### Bilinen tuzaklar
- Field adı **`kat`**, `kategori` değil
- `personel` **string**'dir (ad + soyad), obje değil — curUser.name ile karşılaştır
- `durum` değerleri: `"dept-bekleyen"` (saha→dept bekliyor) / `"acc-bekleyen"` (dept onayladı, muhasebe bekliyor) / `"onaylandi"` / `"reddedildi"` — `"onay"` veya `"red"` değil. Eski `"bekleyen"` değeri localStorage'daki kayıtlar için fallback olarak korunur.
- `pasifOnay`, `gecIslem`, `gecIslemSebep`, `gecIslemDonem` field'ları sadece accGecmis'te bulunur — fisler'de arama
- **durum ayrıştırıldı (24.04.2026):** `'dept-bekleyen'` saha→dept bekleyen, `'acc-bekleyen'` dept→muhasebe bekleyen. UI'da her ikisi de "Bekleyen" gösterilir.
- `dept` field'ı sadece multi-personel demo fişlerinde var; saha kullanıcısının kendi fişlerinde yok
- `'bolundu'` durumundaki parent fişler raporlarda atlanır (çift sayım önlemi). Çocuklar normal durumlarıyla (`acc-bekleyen`/`onaylandi`/`reddedildi`) sayılır.
- `parentFisId` taşıyan çocuk fişler tekrar bölünmez (1 seviye; Faz 2'de açılabilir)
- `kiraMeta.bas` / `kiraMeta.bit`: ISO `YYYY-MM-DD` format (tarih DD.MM.YYYY'dan farklı!)
- Dönem karşılaştırması için `String(f.donem) === String(aktifDon)` kullan

---

### APP.data.deptBekleyen
**Tip:** Array\<DeptBekleyen\>  
**Kaynak satır:** ~4008 (grep ile doğrula)  
**Kullanım:** Dept ekranında onay bekleyen harcama listesi. Dept onaylayınca accBekleyen'e taşınır.

#### DeptBekleyen objesi field listesi

| Field    | Tip          | Değerler / Örnek                  | Açıklama                              |
|----------|--------------|-----------------------------------|---------------------------------------|
| id       | number       | `101`, `102`                      | Benzersiz kayıt ID'si                 |
| fisId    | number       | `1`, `2`, `8`, `21`               | fisler.id'ye referans (zorunlu — ARCHITECTURE 2.3) |
| uye      | string       | `"Mehmet Kaya"`                   | Personel tam adı                      |
| ini      | string       | `"MK"`, `"OD"`, `"BÇ"`           | İnisiyaller (avatar gösterimi için)   |
| satici   | string       | `"Petrol Ofisi"`                  | Satıcı adı                            |
| kat      | string       | `"Yakit"`, `"Yiyecek"`, `"Ekipman"`, `"Ulasim"`, `"Sanat"` | Kategori — fisler.kat ile aynı enum |
| tutar    | number       | `1000`, `780`                     | TL cinsinden                          |
| tarih    | string       | `"03.04"` (DD.MM — yıl yok)      | Kısa format, sadece gün.ay            |
| uyari    | string\|null | `"Ekip 15 kişi, 10 porsiyon"`    | Uyarı metni; yoksa null               |
| belgesiz | boolean      | `true`, `false`                   | Belgesiz fiş mi?                      |
| aciklama | string       | `"Nakit ödeme, fiş verilmedi"`    | Opsiyonel — belgesiz ise gerekçe      |
| donem    | number       | `2`                               | Dönem numarası (zorunlu)          |
| olusturmaZamani | number | `Date.now() - ...`               | Oluşturma timestamp — pasif onay hesabı için |

#### Bilinen tuzaklar
- `tarih` burada **DD.MM** formatındadır — `fisler.tarih` gibi tam yıl içermez
- `kat` fisler.kat ile aynı enum değerlerini kullanır
- `fisId` ile `fisler[i].id` eşleşmeli; eşleşmezse dept onay/red fisler.durum'u güncelleyemez

---

### APP.data.deptAvans
**Tip:** Array\<DeptAvans\>  
**Kaynak satır:** ~4014 (grep ile doğrula)  
**Kullanım:** Dept ekranında saha personelinin avans talepleri.

| Field    | Tip    | Değerler / Örnek                                | Açıklama                         |
|----------|--------|-------------------------------------------------|----------------------------------|
| id       | number | `201`, `202`                                    | Benzersiz avans ID               |
| uye      | string | `"Okan Demir"`                                  | Avans talep eden personel adı    |
| ini      | string | `"OD"`, `"BÇ"`                                  | İnisiyaller                      |
| tutar    | number | `5000`, `2500`                                  | TL cinsinden                     |
| tarih    | string | `"11.04"` (DD.MM)                               | Talep tarihi — kısa format       |
| gerekce  | string | `"Dış çekim ekipman kira ön ödemesi"`           | Avans gerekçesi                  |
| fromKey  | string | `"s"`, `"d"`                                    | Talebi gönderen kullanıcı anahtarı |

---

### APP.data.accDepts
**Tip:** Array\<AccDept\>  
**Kaynak satır:** ~8643 (grep ile doğrula)  
**Kullanım:** Muhasebe dashboard'unun departman özet kartları. `_recomputeAccDepts()` ile güncellenir.

| Field    | Tip    | Değerler / Örnek                                         | Açıklama                        |
|----------|--------|----------------------------------------------------------|---------------------------------|
| id       | string | `"yapim"`, `"kamera"`, `"sanat"`, `"ses"`, `"kostum"`   | Departman anahtarı (küçük harf) |
| name     | string | `"Yapım"`, `"Kamera"`, `"Ses & Müzik"`                  | Görünen ad (Türkçe, büyük harf) |
| renk     | string | `"#E8962E"`, `"#3B82F6"`                                 | Grafik rengi (hex)              |
| uye      | number | `6`, `4`, `5`                                            | Üye sayısı                      |
| total    | number | `48200`                                                  | Toplam harcama (TL)             |
| onay     | number | `31400`                                                  | Onaylanan tutar (TL)            |
| bekleyen | number | `12600`                                                  | Onay bekleyen tutar (TL)        |
| suphe    | number | `4200`, `0`                                              | Şüpheli harcama tutarı (TL)     |
| butce    | number | `55000`                                                  | Departman bütçe limiti (TL)     |

#### Bilinen tuzaklar
- `total`, `onay`, `bekleyen` `_recomputeAccDepts()` tarafından `APP.data.fisler`'den yeniden hesaplanır — doğrudan yazma
- `id` (dept anahtarı) küçük harf (`"yapim"`), `name` Türkçe büyük harf (`"Yapım"`) — ikisi farklı

---

### APP.data.accBekleyen
**Tip:** Array\<AccBekleyen\>  
**Kaynak satır:** ~8651 (grep ile doğrula)  
**Kullanım:** Muhasebe ekranında onay bekleyen harcama ve avanslar (iki farklı tip karışık).

| Field    | Tip          | Değerler / Örnek                        | Açıklama                                 |
|----------|--------------|-----------------------------------------|------------------------------------------|
| id       | number       | `301`, `401`, `402`                     | Benzersiz ID                             |
| fisId    | number       | `22`, `34`, `40`, `48`                  | fisler.id'ye referans — sadece harcamalarda (zorunlu — ARCHITECTURE 2.3) |
| tip      | string\|undefined | `"avans"` (yoksa harcama)          | Sadece avans kayıtlarında bulunur        |
| dept     | string       | `"Yapım"`, `"Kamera"`                   | Departman adı (Türkçe, görünen ad)       |
| uye      | string       | `"Okan Demir"`                          | Personel tam adı                         |
| ini      | string       | `"OD"`, `"BÇ"`                          | İnisiyaller                              |
| tutar    | number       | `5000`, `4200`                          | TL cinsinden                             |
| tarih    | string       | `"11.04"` (DD.MM)                       | Kısa format                              |
| gerekce  | string       | `"Dış çekim ekipman kira…"`             | Avans gerekçesi — sadece avans kayıtlarında |
| fromKey  | string       | `"d"`                                   | Onaylayan dept key — sadece avanslarda   |
| satici   | string       | `"Petrol Ofisi"`, `"—"`                | Harcama satıcısı — sadece harcamalarda   |
| kat      | string       | `"Ulaşım"`, `"Konaklama"`              | Kategori — sadece harcamalarda           |
| belgesiz | boolean      | `true`, `false`                         | Sadece harcamalarda                      |
| uyari    | string       | `"Km başına 38 TL — limit aşımı"`      | Sadece harcamalarda                      |
| donem    | number       | `2`                               | Dönem numarası                    |
| olusturmaZamani | number | `Date.now() - ...`               | Oluşturma timestamp — pasif onay hesabı için |

#### Bilinen tuzaklar
- `tip === 'avans'` kontrolüyle iki tip ayrıştırılır; `tip` yoksa harcamadır
- Dept adı burada Türkçe görünen addır (`"Yapım"`), accDepts.id gibi key değil
- `fisId` ile `fisler[i].id` eşleşmeli; eşleşmezse accOnayla/accReddet fallback (4 alan) devreye girer

---

### APP.data.accAvansGecmis
**Tip:** Array\<AccAvans\>  
**Kaynak satır:** ~4041 (grep ile doğrula)  
**Kullanım:** Muhasebe avans geçmişi — dönem bazlı, tüm personel.

| Field   | Tip    | Değerler / Örnek                       | Açıklama                                        |
|---------|--------|----------------------------------------|-------------------------------------------------|
| id      | number | `303`, `201`, `101`                    | Benzersiz ID                                    |
| dept    | string | `"Yapım"`, `"Kamera"`                  | Departman adı (Türkçe görünen ad)               |
| uye     | string | `"Mehmet Kaya"`                        | Personel tam adı                                |
| ini     | string | `"MK"`, `"OD"`                         | İnisiyaller                                     |
| tutar   | number | `8000`, `4000`                         | TL cinsinden                                    |
| tarih   | string | `"01.04"` (DD.MM)                      | Ödeme tarihi — kısa format                      |
| durum   | string | `"ödendi"`, `"reddedildi"`             | Avans durumu — `"bekleyen"` yok (geçmiş kayıt) |
| gerekce | string | `"Set kurulum harcamaları"`            | Avans gerekçesi                                 |
| donem   | number | `0`, `1`, `2`                          | Dönem numarası                                  |

---

### APP.data.accGecmis
**Tip:** Array\<AccGecmis\>  
**Kaynak satır:** ~4056 (grep ile doğrula)  
**Kullanım:** Muhasebe kesin onay/red arşivi — sadece append, değiştirilemez (ARCHITECTURE 3.2 + 4).  
Avans işlemleri bu koleksiyona **yazılmaz** — onlar `accAvansGecmis`'e gider.

| Field      | Tip    | Örnek                  | Açıklama                                        |
|------------|--------|------------------------|-------------------------------------------------|
| id         | number | `Date.now()`           | Benzersiz arşiv ID                              |
| fisId      | number | `22`                   | `fisler.id`'ye referans (zorunlu — ARCH 2.3)    |
| islem      | string | `'onay'` / `'red'`     | İşlem tipi                                      |
| onaylayan  | string | `'Selin Yıldız'`       | Muhasebeci tam adı (`curUser.name`)             |
| tarih      | number | `Date.now()` (ms)      | İşlem timestamp                                 |
| tutar      | number | `1500`                 | Fiş tutarı (snapshot — sonraki değişimden bağımsız) |
| kat        | string | `'Yakit'`              | Kategori (snapshot)                             |
| satici     | string | `'Petrol Ofisi'`       | Satıcı (snapshot)                               |
| uye        | string | `'Mehmet Kaya'`        | Personel (snapshot)                             |
| dept       | string | `'Yapım'`              | Departman görünen ad (snapshot)                 |
| donem      | number | `2`                    | Dönem (snapshot)                                |
| redNedeni  | string | `'Mükerrer fiş'`       | Sadece `islem='red'` ise dolu                   |
| pasifOnay      | boolean | `true`                 | Opsiyonel — _checkPasifOnay tarafından otomatik onaylanan   |
| gecIslem       | boolean | `true`                 | Opsiyonel — kapalı döneme yapılan müdahale                  |
| gecIslemSebep  | string  | `'Geç gelen fatura'`  | Opsiyonel — gecIslem:true ise zorunlu (min 10 karakter)     |
| gecIslemDonem  | number  | `1`                    | Opsiyonel — gecIslem:true ise hangi kapalı dönem            |

**Bilinen tuzaklar:**
- Bu koleksiyon SADECE EKLEME kabul eder — silme ve güncelleme yasak
- Snapshot field'lar arşivlenirken kopyalanır; fiş sonradan değişse arşiv değişmez
- `fisId` null olabilir (eski seed fallback kaydı), ama yeni kayıtlarda her zaman dolu olmalı

---

### APP.data.donemButce
**Tip:** Array\<DonemButce\>  
**Kaynak satır:** ~4059 (grep ile doğrula)  
**Kullanım:** Dönem bütçe bilgisi — muhasebe bütçe barı ve raporlarda kullanılır.

| Field       | Tip    | Değerler / Örnek       | Açıklama                                    |
|-------------|--------|------------------------|---------------------------------------------|
| donem       | number | `0`, `1`, `2`          | Dönem numarası                              |
| lbl         | string | `"Dönem #2"`           | Görünen etiket                              |
| butce       | number | `40000`, `60000`       | Toplam dönem bütçesi (TL)                   |
| harcanan    | number | `26500`, `58400`       | Onaylanan harcama toplamı (TL)              |
| reddedildi  | number | `3890`, `5660`         | Reddedilen harcama toplamı (TL)             |
| _lastPct    | number | `0`                    | Internal — son render'daki yüzde değeri     |

---

### APP.data.deptGecmis
**Tip:** Object (dönem ID → { onaylandi: Array, reddedildi: Array })  
**Kaynak satır:** ~4135 (grep ile doğrula)  
**Kullanım:** Dept ekranı — geçmiş dönem onaylı/reddedilmiş harcamaları.

**Yapı:** `APP.data.deptGecmis[donemId].onaylandi` ve `.reddedildi`

Her item (onaylandi):

| Field | Tip    | Örnek              | Açıklama         |
|-------|--------|--------------------|------------------|
| id    | number | `201`              | Kayıt ID         |
| uye   | string | `"Mehmet Kaya"`    | Personel adı     |
| ini   | string | `"MK"`             | İnisiyaller      |
| satici| string | `"Araç Kiralık"`   | Satıcı           |
| kat   | string | `"Ulasim"`, `"Yakit"` | Kategori      |
| tutar | number | `4800`             | TL               |
| tarih | string | `"08.04"` (DD.MM)  | Kısa format      |

Reddedilenlerde ek:

| Field | Tip    | Örnek                          | Açıklama      |
|-------|--------|--------------------------------|---------------|
| sebep | string | `"Limit aşımı — onaysız konaklama"` | Red nedeni |

---

### APP.data.companyInfo
**Tip:** Object  
**Kaynak satır:** ~8699 (grep ile doğrula)  
**Kullanım:** Marka ayarları — PDF başlığı ve footer'da kullanılır.

| Field | Tip          | Örnek  | Açıklama                     |
|-------|--------------|--------|------------------------------|
| name  | string       | `""`   | Şirket/prodüksiyon adı       |
| logo  | string\|null | `null` | Base64 encoded logo görseli  |

---

### APP.data.projNames
**Tip:** Object (proje ID → string)  
**Kaynak satır:** ~8701 (grep ile doğrula)  
**Kullanım:** Kullanıcının özelleştirdiği proje adları (varsayılan: APP.seed.projs'tan).

**Örnek:** `{ ig: "Yeni Proje Adı" }`  
Boş başlar (`{}`), kullanıcı marka ayarlarından doldurur.

---

### Kısa Açıklamalı Koleksiyonlar

**APP.data.globalInbox** — Kullanıcı bazlı bildirim listesi. `{ s: [...], d: [...], m: [...] }` şeklinde key-value. Her öğe: `{ id, tip, title, body, meta, read }`. `tip`: `'gr'`/`'am'`/`'rd'`/`'bl'`. Login sonrası `APP.ui.notiflar = APP.data.globalInbox[curUserKey]` ile bağlanır.

**APP.data.deptKira** — Dept ekranındaki kiralama listesi. Her öğe: `{ id, uye, ini, kat, satici, tutar, gunluk, bas, bit, iade }`. `bas`/`bit` ISO YYYY-MM-DD format. `iade: true/false`.

**APP.data.accKiralamalar** — Muhasebe ekranındaki tüm aktif kiralamalar. deptKira ile aynı yapı + `dept` ve `deptId` field'ları eklenir.

**APP.data.accSuphe** — Muhasebe şüpheli harcama listesi. Her öğe: `{ id, dept, uye, ini, satici, kat, tutar, tarih, sebep, durum }`. `durum`: `'bek'`/`'inc'`.

**APP.data.sohbetler** — Mesajlaşma sohbetleri. Her öğe: `{ id, tip:'bireysel'|'grup', katilimcilar:[], mesajlar:[], grupAdi?, grupDept? }`. Her mesaj: `{ id, gonderen, icerik, tarih:number(ms), okunanlar:[] }`.

**APP.data.avatars** — Kullanıcı avatar fotoğrafları. `{ s: null|base64, d: null|base64, m: null|base64 }`. Canvas 256×256 ile sıkıştırılmış.

**APP.data.projLogos** — Proje logoları. `{ ig: null|base64, mr: null|base64, sr: null|base64 }`. PDF'te kullanılır.

**APP.data.istisnaIzinleri** — Kapanmış döneme kişiye özel giriş izinleri. Boş başlar (`[]`), runtime'da push edilir, localStorage'a kaydedilir. Her öğe:

| Field | Tip | Açıklama |
|---|---|---|
| id | number | `Date.now()` — benzersiz arşiv ID |
| donemId | number | Hangi kapalı dönem |
| kisiKey | string | deptEkip.id (`'mk'`, `'od'` vb.) |
| kisiAd | string | Kişi tam adı (snapshot) |
| sebep | string | Zorunlu, min 10 karakter |
| sure | number | Saat cinsinden izin süresi (varsayılan 8) |
| maxAdet | number\|null | Null = sınırsız belge adedi |
| maxTutar | number\|null | Null = sınırsız TL tutarı |
| verenKisi | string | İzni veren muhasebeci adı |
| verilisTarihi | string | `'DD.MM.YYYY HH:MM'` |
| baslangicTs | number | `Date.now()` — süre hesabı için |
| durum | string | `'aktif'`\|`'sureDoldu'`\|`'adetDoldu'`\|`'tutarDoldu'`\|`'iptal'` |
| girilenAdet | number | 0'dan başlar, her fiş girişinde artar |
| girilenTutar | number | 0'dan başlar, her fiş girişinde artar |

**Bilinen tuzaklar:**
- `kisiKey` deptEkip.id'dir (`'mk'`, `'od'`) — globalInbox user key'i (`'s'`, `'d'`) değil. Bildirim için `APP.seed.users` adı üzerinden eşleşme yapılır.
- `durum` geçişleri Bölüm 2'de (saha tarafı — Faz 1/2) implement edilecek.

---

## BÖLÜM 2 — APP.ui (UI State — KRİTİK)

**Kaynak satır:** ~3816 (grep ile doğrula)

| Field              | Tip          | Başlangıç değeri | Açıklama                                                    |
|--------------------|--------------|------------------|-------------------------------------------------------------|
| curUser            | Object\|null | `null`           | Giriş yapmış kullanıcı OBJESİ — `curUser.name` ile ada eriş |
| curUserKey         | string       | `'s'`            | `APP.seed.users` anahtarı: `'s'`, `'d'`, `'m'`             |
| curProj            | Object\|null | `null`           | Seçili proje objesi (`APP.seed.projs`'tan)                  |
| aktifDon           | number       | `2`              | Aktif dönem numarası                                        |
| sdSec              | Object       | `{}`             | Dept toplu seçim: `{ [fisId]: true }`                       |
| notiflar           | Array        | `[]`             | Aktif kullanıcının bildirim dizisi (globalInbox'tan ref)    |
| sdSeciliDonem      | number       | `2`              | Dept ekranı seçili dönem                                    |
| saSeciliDonem      | number       | `2`              | Muhasebe ekranı seçili dönem                                |
| sdGecmisPnlDonem   | number       | `2`              | Dept geçmiş paneli seçili dönem                             |
| sdAvansFormAcik    | boolean      | `false`          | Dept avans form açık mı?                                    |
| sdMesajKisi        | string       | `''`             | Dept mesaj hedef kişi                                       |
| sdMode             | boolean      | `false`          | Dept ek mod flag (?)                                        |
| saAvansDonem       | number       | `2`              | Muhasebe avans seçili dönem                                 |
| saRaporTip         | string       | `'dept'`         | Muhasebe rapor sekmesi: `'dept'`, `'kat'`, `'personel'`, `'donem'` |
| longTimer          | any\|null    | `null`           | OCR uzun basış timer referansı                              |
| longFired          | boolean      | `false`          | Uzun basış tetiklendi mi?                                   |
| isRec              | boolean      | `false`          | Ses kaydı aktif mi?                                         |
| speechRecog        | any\|null    | `null`           | webkitSpeechRecognition instance                            |

#### curUser objesi şeması (APP.seed.users değerinden)

| Field  | Tip          | Örnek                         | Açıklama              |
|--------|--------------|-------------------------------|-----------------------|
| pass   | string       | `"1234"`                      | Şifre                 |
| name   | string       | `"Mehmet Kaya"`               | Tam ad                |
| ini    | string       | `"MK"`                        | İnisiyaller           |
| role   | string       | `"user"`, `"dept"`, `"acc"`   | Rol — enum            |
| prjs   | Array        | `['ig','mr']`                 | Erişim yetkisi proje IDleri |
| ad     | string       | `"Mehmet"`                    | İsim                  |
| soyad  | string       | `"Kaya"`                      | Soyisim               |
| tel    | string       | `"+90 532 418 76 03"`         | Telefon               |
| email  | string       | `"mehmet.kaya@igfilm.com"`    | E-posta               |
| dept   | string       | `"Saha"`, `"Yapim"`, `"Ofis"` | Departman adı         |
| avatar | string\|null | `null`                        | Base64 avatar görseli |

#### Bilinen tuzaklar
- `curUser` **obje**'dir — kullanıcı adı için `curUser.name`, fisler'de filtre için de `curUser.name` kullan
- `curUserKey` değeri `curUser` ile ayrı tutulur — bildirim, sohbet gibi key-value yapılarda `curUserKey` kullan
- `aktifDon` number'dır ama `fisler.donem` ile karşılaştırırken `String()` ile dönüştür (bazı yerlerde string olarak gelir)
- `saRaporTip` export için kritik: `showExportModal('acc-' + APP.ui.saRaporTip)` ile export tipi belirlenir

---

## BÖLÜM 3 — APP.seed (Başlangıç Verisi — REFERANS)

**Kaynak satırları:** ~3813 (grep ile doğrula)

APP.seed salt-okunur demo/konfigürasyon verisi tutar. Kullanıcılar, projeler ve dönem tanımları burada saklanır. Runtime'da değiştirilmez.

**Ana anahtarlar:**
- `APP.seed.users` — kullanıcı objesi haritası (`s`, `d`, `m` key'leri)
- `APP.seed.umap` — alias → key haritası (`{ saha:'s', dept:'d', muhasebe:'m' }`)
- `APP.seed.projs` — proje listesi (`[{ id, name, type, status, color }]`)
- `APP.seed.donemler` — dönem listesi (`[{ id, n, lbl, tarih, durum, avans, harcama, islem, baslangic, bitis, kapanmaTarihi, kapayanKisi, gecIslemSayisi }]`)
- `APP.seed.deptEkip` — dept ekranı ekip üyeleri (`[{ id, ini, name, rol, tutar }]`)
- `APP.seed.sdDonemler` — dept dönem seçici için (`[{ id, lbl, tarih, aktif }]`)
- `APP.seed.saDonemler` — muhasebe dönem seçici için (`[{ id, lbl, tarih, aktif }]`)

**Faz 2 notu:** Faz 2'de Supabase entegrasyonuyla seed verisi API çağrılarına dönüşecek. Kullanıcı ve proje listesi server-side saklanacak; `APP.seed` kaldırılacak ya da sadece konfigürasyon sabitleri için küçülecek. Yeni özellik eklerken seed'e doğrudan bağımlılık yerine fonksiyon katmanı üzerinden geçilmeli.

---

## BÖLÜM 4 — APP.cache (Runtime Cache — TÜRETİLMİŞ)

**Kaynak satırları:** ~3815 (grep ile doğrula)

APP.cache hesaplanmış verileri tutar; `_compute*` ve `_recompute*` fonksiyonları tarafından doldurulur. Her rapor render çağrısında ilgili fonksiyon cache'i yeniler.

**Ana cache anahtarları:**
- `APP.cache.accDeptKatlar` — departman başına kategori dağılımı (`{ yapim: [{name, tutar, renk}] }`)
- `APP.cache.accRaporPersonel` — personel raporu hesaplanmış listesi (`[{name, ini, dept, deptId, rol, total, onay, bek, avans, donemler, katlar}]`)
- `APP.cache.accDonemKatlar` — dönem başına kategori karşılaştırması (`{ 0:{}, 1:{}, 2:{} }`)
- `APP.cache.uyeGecmis` — dept üye geçmiş bilgisi (`{ mk: { donemler, avanslar } }`)
- `APP.cache.accDeptUyeler` — dept başına üye listesi (`{ yapim: [{ini, name, rol, total, onay, bek}] }`)
- `APP.cache.accDeptDonemler` — dept başına dönem özetleri
- `APP.cache.accDeptAvans` — dept başına avans listesi
- `APP.cache.accDeptGecmis` — dept başına geçmiş fiş listesi
- `APP.cache.accDeptFis` — dept başına canlı hesaplanmış fiş listesi (`_computeRaporDeptFis` doldurur)

Cache'e doğrudan yazılmaz; ilgili `_compute*` / `_recompute*` fonksiyonu çağrılarak güncellenir. Bazı cache değerleri (`accDeptKatlar`, `uyeGecmis`) demo sabit değerlerle başlar ve henüz canlı hesaplanmaz.

---

## BÖLÜM 5 — Kritik Compute Fonksiyonları

### _recomputeAccDepts()
**Satır:** 8239  
**Dönüş tipi:** void — `APP.data.accDepts` dizisini in-place günceller  
**Ne yapar:** `APP.data.fisler`'i okuyarak her departmanın `total`, `onay`, `bekleyen` değerlerini yeniden hesaplar. `APP.cache.accDeptUyeler`'den departman üye listesini alır.  
**Çağrıldığı yer:** `renderAccDash()` başında

---

### _computeRaporDeptFis(deptId)
**Satır:** 8579  
**Dönüş tipi:** Array\<DeptFisItem\>  
**Ne yapar:** `APP.data.fisler`'den verilen `deptId`'ye ait üyelerin fişlerini süzerek tarih+dönem sıralamasıyla döndürür. `APP.cache.accDeptFis[deptId]`'ye kaydedilir.

**Örnek item:**
```json
{
  "ini": "MK",
  "satici": "Petrol Ofisi",
  "kat": "Yakit",
  "tutar": 1000,
  "tarih": "03.04.2026",
  "durum": "bek",
  "donem": 2,
  "uyari": ""
}
```

**Not:** `durum` burada dönüştürülmüş: `"onaylandi"` → `"onay"`, `"reddedildi"` → `"red"`, diğer → `"bek"`.

---

### _computeRaporPersonel()
**Satır:** 8619  
**Dönüş tipi:** Array\<PersonelRapor\>  
**Ne yapar:** `APP.data.fisler` ve `APP.seed.deptEkip`'ten tüm personeli toplar; dönem/kategori dağılımını, avans toplamını hesaplar. `APP.cache.accRaporPersonel`'e kaydedilir.

**Örnek item:**
```json
{
  "name": "Mehmet Kaya",
  "ini": "MK",
  "dept": "Yapım",
  "deptId": "yapim",
  "rol": "Araç Sorumlusu",
  "total": 14200,
  "onay": 10000,
  "bek": 4200,
  "avans": 13000,
  "donemler": [
    { "lbl": "Dönem #2", "total": 11240, "onay": 9240, "bek": 2000 }
  ],
  "katlar": [
    { "name": "Ulaşım", "tutar": 8200, "renk": "#3B82F6" }
  ]
}
```

---

## BÖLÜM 6 — Field İsimlendirme Standartları

Kodda gözlemlenen isimlendirme kuralları:

| Konu              | Standart                                          | Dikkat                                       |
|-------------------|---------------------------------------------------|----------------------------------------------|
| Tarih (tam)       | `"DD.MM.YYYY"` string                             | fisler.tarih, accAvansGecmis yok             |
| Tarih (kısa)      | `"DD.MM"` string                                  | deptBekleyen, deptGecmis, accBekleyen        |
| Tarih (ISO)       | `"YYYY-MM-DD"` string                             | kiraMeta.bas, kiraMeta.bit, deptKira.bas/bit |
| Tutar             | number (TL, virgülsüz)                            | `1000` — string değil                        |
| Dönem             | number (`0`, `1`, `2`)                            | Karşılaştırma için String() ile çevir        |
| Kategori key      | **`kat`** — `"Yakit"`, `"Yiyecek"`, `"Ekipman"`, `"Ulasim"`, `"Sanat"`, `"Diger"`, `"Kiralama"` | `kategori` değil; Türkçe karaktersiz |
| Durum (fisler)    | `"dept-bekleyen"`, `"acc-bekleyen"`, `"onaylandi"`, `"reddedildi"`, `"bolundu"` | 5 değer. Eski `"bekleyen"` localStorage fallback olarak korunur. Hesaplarda `"onay"/"red"/"bek"`'e dönüştürülür |
| Kullanıcı adı     | `personel` (fisler'de), `name` (curUser'da), `uye` (dept*'de) | Hepsi tam ad string               |
| Dept anahtarı     | `"yapim"`, `"kamera"`, `"sanat"`, `"ses"`, `"kostum"` | Küçük harf, Türkçe karaktersiz           |
| İnisiyaller       | `ini`: 2 karakter, büyük harf (`"MK"`, `"BÇ"`)   | Türkçe karakter içerebilir (Ç, Ş vb.)       |
| Export tipi       | `'saha'`, `'acc-dept'`, `'acc-personel'`, `'acc-kat'`, `'acc-donem'`, `'dept-gecmis'`, `'dept-avans'` | showExportModal'a geçilir |

---

*Son teyit: index.html toplam satır sayısı ~10641 (30.04.2026 itibarıyla). Bu dokümandaki satır numaraları eski versiyona aittir, kodda grep ile doğrula.*
