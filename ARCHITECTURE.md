# PRODAPP — Mimari Tasarım

**Son güncelleme:** 17 Mayıs 2026
**Durum:** v3

Bu belge PRODAPP'in veri modelini, sorumluluk sınırlarını ve denetim
motorunu tanımlar. Yeni kod yazarken bu kurallar referans alınır.
Kural ihlali gerektiren bir ihtiyaç doğarsa önce bu belge güncellenir,
sonra kod yazılır.

---

## 1. TASARIM İLKELERİ

Her mimari karar şu dört prensibe göre alınır:

### 1.1. Tek kaynak ilkesi

Her bilgi için **bir kaynak koleksiyon** vardır. Diğer yerler o kaynağı
okuyup görüntüler, kendi kopyasını tutmaz. Örnek: bir fişin durumu
sadece `APP.data.receipts[i].durum`'dur; `deptPending` veya `accPending`
bu durumu kendi içinde tekrar tutmaz, sadece referans verir.

Faz 1'de kaynak localStorage'da (tarayıcı). Faz 2'de Supabase tablosunda.

### 1.2. Referans bütünlüğü ilkesi

Bir koleksiyon başka bir koleksiyondaki kayda referans veriyorsa,
o referans her zaman geçerli olmalı — yetim kayıt olmamalı. Örnek:
`deptPending[i].fisId` mutlaka `APP.data.receipts` içinde var olan
bir id'ye karşılık gelmeli.

### 1.3. Denetim şeffaflığı ilkesi

Her mali işlem iz bırakır. Fiş ne zaman, kim tarafından, hangi durumdan
hangi duruma geçirildi — silinemeyecek şekilde kaydedilir. Denetim
motoru bu iz üzerinden çalışır.

### 1.4. Değiştirilemezlik ilkesi

Bir işlem arşive girdikten sonra **değiştirilemez, silinemez**.
Düzeltme gerekiyorsa ters işlem yapılır (iptal + yeni kayıt).
Bu kural kurumsal denetim gereksinimidir.

### 1.5. Versiyonlama ilkesi

*(Bu bölüm Faz 1.5 modülerleşme ile birlikte detaylandırılacak. Şu an versiyon takibi title tag'inde yapılıyor: `PRODAPP v8.0`.)*

### 1.6. Dönem disiplini ilkesi

Film prodüksiyonunda dönem (çekim bloğu) kapanışı disiplinsiz yürütülürse mali suistimalin kapısı açılır. Saha personeli set koşullarını ve hesap belirsizliklerini bahane ederek dönem kapanışını geciktirebilir; zaman geçtikçe "unutma" beklentisiyle açıkları örtmeye çalışabilir. PRODAPP'in temel iddiası bunu engellemektir.

**Beş ana mekanizma:**

1. **Sıkı kapanış**: Bir dönem açıkken yeni dönem açılamaz. Saha ekibi yeni avans isterse, önce mevcut dönem hesabı kapatılmalıdır. Bu kural muhasebeye dönem disiplini için kaldıraç sağlar ("Dönemi kapat, yeni avansı vereyim").

2. **Pasif onay**: Bekleyen fişler 7 gün içinde işlem görmezse otomatik onaylanmış sayılır. Sorumluluk muhasebededir — "görmedim, atladım" geçerli mazeret değildir.

3. **İstisna izlenebilirliği**: Muhasebe gerektiğinde kapanmış döneme kişiye özel giriş izni verebilir, ama her istisna sistemde işaretlenir ve denetçinin gözünden kaçmaz (özel rozet, log kaydı, denetim raporunda ayrı bölüm).

4. **Kiralama istisnası**: Kiralama (kat:'rental') fişleri ayrı muamele görür. Fatura doğrulama gecikmeleri, kiralama bitiş anlaşmazlıkları (hasar, eksik parça, uzatma ücreti) ve ihtilaf süreçleri nedeniyle belge girişi haftalarca sürebilir — bu suistimal değil, sektör gerçeğidir.

   **Kiralama özel kuralları:**
   - 7 günlük pasif onay kiralamaya UYGULANMAZ
   - Dönem kapanışı kiralama bekleyenleri OTOMATİK engellemez (uyarı verilir ama kapanmaya izin verilir, kiralama sonradan bağlanır)
   - "İhtilaf" durumu ayrı işaretlenebilir (ihtilaf:true + ihtilafNot:string field'ları)
   - Kiralama kapanış zinciri: belge geldi → onay → ihtilaf yok → kayıt kapanır

5. **Asimetrik kapanış**: Dönem kapanışı saha ve dept için tam kapanış, muhasebe için soft kapanış. Saha ve dept kapanmış döneme yazma yapamaz; muhasebe yazmaya devam edebilir, ama her müdahale "geç işlem" olarak işaretlenir.

   **Geç işlem kuralları:**
   - Muhasebe kapanmış döneme her müdahalesinde sebep zorunlu (minimum 10 karakter)
   - Müdahale kaydı gecIslem:true, gecIslemSebep:"..." field'ları taşır
   - Bu field'lar silinemez, override edilemez (ARCHITECTURE 1.4 değiştirilemezlik altında özellikle vurgulu)
   - Denetim raporunda ayrı bölüm: "Kapalı döneme müdahaleler"
   - Şiddet derecesi: kapalı dönemden uzaklığa göre (1 gün düşük, 30 gün orta, 90 gün yüksek)

   **Saha/dept için davranış:**
   - UI'da kapalı dönem sadece okunabilir görünür (yazma butonları gizli)
   - _addToDeptPending kapalı dönemde reddedilir (saha rolü)
   - deptApprove/deptReject kapalı dönemde reddedilir (dept rolü)

   **Muhasebe için davranış:**
   - UI'da kapalı dönem erişilebilir, ama uyarı bandı: "Kapalı dönem — yapacağınız işlemler geç işlem olarak kaydedilir"
   - accOnayla/accReddet/accKismi kapalı dönemde sebep modalıyla geçer
   - Yeni fiş ekleme (geriye dönük): muhasebe-only, sebep zorunlu

Bu ilke ARCHITECTURE 1.3 (denetim şeffaflığı) ve 1.4 (değiştirilemezlik) ile birlikte ürünün rekabet avantajını oluşturur.

---

## 2. VERİ MODELİ

### 2.1. Koleksiyon kategorileri

**A. Kaynak koleksiyonlar**
Gerçeğin yaşadığı yer.
- `APP.data.receipts` — tüm mali işlemlerin ana koleksiyonu
  *(İsim notu: Faz 2'de `islemler` olarak güncellenecek. Fiş dışında
  belgesiz harcama, avans ve kiralamayı da kapsar. Şu an `receipts`.)*
- `APP.data.kullanicilar` (Faz 2'de eklenecek)

**B. Kuyruk koleksiyonlar**
İşlenmeyi bekleyen kayıtların görünümü. Kaynaktan türetilir.
- `APP.data.deptPending`
- `APP.data.accPending`

**C. Arşiv koleksiyonlar**
Değiştirilemez tarihsel kayıt.
- `APP.data.deptHistory`
- `APP.data.accHistory`
- `APP.data.accAdvanceHistory`

**D. Türetilmiş koleksiyonlar**
Kaynak verilerden hesaplanır. Cache amaçlı. Gerçek değil, görüntü.
- `APP.data.accDepartments` — `_recomputeAccDepts()` hesaplar
- `APP.data.periodBudget.harcanan` — receipts'ten hesaplanır
- `APP.cache.*` — tüm cache'ler

**E. Yardımcı koleksiyonlar (Faz 1)**
Faz 1'de eklenen, ana mali akışı destekleyen koleksiyonlar.
- `APP.data.deptAdvances` — dept ekranı avans talepleri
- `APP.data.deptRentals` — dept ekranı kiralama takibi
- `APP.data.accRentals` — muhasebe kiralama takibi
- `APP.data.accSuspicion` — şüpheli harcama listesi (demo, Faz 2'de accDenetim'e dönüşecek)
- `APP.data.globalInbox` — kullanıcı bazlı bildirim kuyrukları
- `APP.data.chats` — mesajlaşma sistemi
- `APP.seed.categoryLimits` — kategori harcama limitleri
- `APP.data.exceptionPermits` — kapanmış döneme kişiye özel giriş izinleri (ARCHITECTURE 1.6 Mekanizma 3)

### 2.2. Koleksiyon bağları

Bağlar tek yönlüdür. Kuyruk ve arşiv koleksiyonlar kaynağa referans verir.

```
receipts  <----  deptPending   (fisId ile)
     ^
     +----  accPending     (fisId ile)
     ^
     +----  deptHistory    (fisId ile)
     ^
     +----  accHistory     (fisId ile)
```

### 2.3. fisId kuralı

Her kuyruk ve arşiv kaydı şu iki alanı içermek zorunda:
- `id` — kaydın kendi benzersiz ID'si
- `fisId` — kaynak `receipts` kaydının ID'sine referans

Bu kural istisnasız. Şu an seed'de eksik, onarım zorunlu.

### 2.4. Vergi alanları ve özel fatura türleri

Türkiye mali mevzuatında bazı fatura türleri özel muamele gerektirir. PRODAPP bu türleri tanır, işaretler ve görünür kılar — ama hesaplama yapmaz. Hesaplama muhasebenin kendi muhasebe yazılımında yapılır (Logo, Mikro vb.). PRODAPP'in işi: belgenin doğru tanınması, muhasebenin uyarılması, denetim için iz bırakılması.

**Tanınan özel türler:**

| Tür | Açıklama | Sektör örneği |
|-----|----------|---------------|
| Tevkifatlı fatura | KDV'nin bir kısmı alıcı tarafından devlete ödenir | Yapım hizmetleri, ekipman kiralama, danışmanlık |
| Stopajlı ödeme | Gelir vergisi kesintisi (genelde gerçek kişi alacak) | Oyuncu telifleri, freelance ücret |
| Self-billing | Alıcı kendi adına fatura kesip karşı tarafa gönderir | Bazı yurtdışı işlemler, taşeron süreçleri |

**receipts şemasına eklenecek field'lar (Faz 2):**

- ozelTip: string|null — 'tevkifat' veya 'stopaj' veya 'selfbilling' veya null
- ozelOran: string|null — "5/10", "9/10" gibi (Faz 2 oran tablosu ile)
- ozelNot: string|null — Muhasebe için açıklama
- malBedeli: number|null — KDV hariç tutar (Faz 2)
- toplamKdv: number|null — Toplam KDV
- ozelKesinti: number|null — Tevkifat/stopaj kesintisi
- odenecekTutar: number — Asıl tutar (= mevcut 'tutar' field'ı)

**Faz 1 yaklaşımı (basit):**
- OCR mock anahtar kelime tespit eder ('tevkifat', 'stopaj', vb.)
- Fişe ozelTip field'ı atar
- Saha karıştırmasın diye detay sormaz
- Muhasebe ekranında işaret + uyarı olarak görünür
- Dönem listesinde "Bu dönemde X tevkifatlı, Y stopajlı belge" özeti

**Faz 2 (gerçek):**
- Oran tablosu eklenir (sektör/kategori bazlı)
- Otomatik kesinti hesabı
- KDV/vergi raporu çıktısı (e-defter, beyanname için)
- Logo/Mikro entegrasyonu

---

## 3. SORUMLULUK SINIRLARI

### 3.1. receipts.durum yazım hakkı

Sadece şu fonksiyonlar `APP.data.receipts[i].durum` yazabilir:

| Fonksiyon        | Yazacağı değer     | Koşul                  |
|------------------|--------------------|------------------------|
| submitOCR        | 'dept-pending'     | Yeni fiş               |
| submitBelgesiz   | 'dept-pending'     | Yeni fiş               |
| deptApprove      | 'acc-pending'      | Dept onay              |
| deptReject       | 'rejected'         | Dept red               |
| accOnayla        | 'approved'         | Muhasebe kesin onay    |
| accReddet        | 'rejected'         | Muhasebe red           |
| deptPartial      | 'split'            | Dept kısmi onay          |
| accKismi         | 'split'            | Muhasebe kısmi onay      |
| _checkPasifOnay  | 'approved'         | 7-gün pasif onay (sistem)|

Başka hiçbir yerde `receipts.durum`'a yazılmaz. Bu kural kod review
kriteridir.

### 3.2. Arşive yazım hakkı

Arşiv koleksiyonları **sadece ekleme (append)** kabul eder.
Güncelleme veya silme yasaktır.

| Koleksiyon               | Yazan fonksiyon(lar)             |
|--------------------------|----------------------------------|
| deptHistory.onaylandi    | deptApprove, deptApproveSelected     |
| deptHistory.reddedildi   | deptReject, deptRejectSelected       |
| accHistory               | accOnayla, accReddet, accKismi, _checkPasifOnay |
| accAdvanceHistory        | accOnayla (avans), avansRedOnay  |

### 3.3. Türetilmiş veriye yazım

Türetilmiş koleksiyonlar kendi hesaplama fonksiyonları dışında
yazılamaz:

| Koleksiyon    | Hesaplayan fonksiyon          |
|---------------|-------------------------------|
| accDepartments | _recomputeAccDepts()          |
| periodBudget  | ilgili işlem fonksiyonları    |
| cache.*       | ilgili _compute* fonksiyonu   |

UI render'ı bu koleksiyonları okuyabilir ama yazamaz.

### 3.4. Workflow merkezileştirme

Şu an durum geçişleri ve izinleri kod içinde dağınık (her fonksiyon
kendi if-else bloğu). Faz 1.5'te (modülerleşme) merkezi bir workflow
config objesi tanımlanacak:

```javascript
// /core/workflow.js
export const FIS_WORKFLOW = {
  states: ['dept-pending', 'acc-pending', 'approved', 'rejected', 'split'],
  transitions: [
    { from: 'dept-pending', to: 'acc-pending', role: 'dept', action: 'onayla' },
    { from: 'dept-pending', to: 'rejected',    role: 'dept', action: 'reddet' },
    { from: 'dept-pending', to: 'split',       role: 'dept', action: 'kismi' },
    { from: 'acc-pending',  to: 'approved',    role: 'acc',  action: 'onayla' },
    { from: 'acc-pending',  to: 'rejected',    role: 'acc',  action: 'reddet' },
    { from: 'acc-pending',  to: 'split',       role: 'acc',  action: 'kismi' }
  ]
};
```

Bölüm 3.1'deki tablo bu config'in görsel temsilcisidir. Modülerleşmeyle
config objesine dönüşecek, fonksiyonlar buradan okuyacak.

ERPNext/Frappe Workflow modülünden alınan fikir.

**Sıra notu:** Naming Batch A+B+C tamamlandı (Mayıs 2026). State isimleri artık İngilizce canonical: `'dept-pending'`, `'acc-pending'`, `'approved'`, `'rejected'`, `'split'`. Workflow config'i yukarıdaki formatta hazır; Faz 1.5 modülerleşmede etkinleştirilecek.

### 3.5. Dönem yazım hakkı

Dönem yönetimi sadece muhasebe rolüne aittir.

| Eylem | Yetkili | Koşul |
|-------|---------|-------|
| Yeni dönem aç | muhasebe | Önceki dönem kapalı veya kapama uyarısı kabul edildi |
| Dönem kapat | muhasebe + sistem | Manuel veya 7 gün pasif onay sonrası otomatik |
| Kapanmış döneme istisna giriş | muhasebe | Sebep zorunlu, kayıt log'a düşer |
| Bütçe değiştir | muhasebe | Kapanmadan önce |
| İhtilaflı kiralama işaretle | muhasebe | Anlaşmazlık varken |

Saha ve dept kullanıcıları dönem yönetiminde yazma yetkisine sahip değildir. UI'da bu yetkilerin görünmemesi yeterli koruma değildir; fonksiyon seviyesinde rol kontrolü zorunludur (Faz 2: backend trigger).

---

## 4. DENETİM MOTORU

PRODAPP'in ayırt edici özelliği. Her mali işlem otomatik kontrolden
geçer ve şüpheli durumlar kayıt altına alınır.

### 4.1. Tetikleme noktaları

Denetim motoru şu üç noktada otomatik çalışır:
1. **Yazım sırasında** — Yeni fiş/avans oluşturulurken
2. **Durum geçişinde** — Onay/red anında
3. **Periyodik tarama** — Dönem kapama öncesi

### 4.2. Kural kategorileri

**A. Limit kuralları** — Kategori/dönem/personel limiti aşıldı mı
**B. Tutarlılık kuralları** — Birim × miktar = tutar, km × TL/km = ulaşım
**C. Tekrar kuralları** — Mükerrer fiş, benzer tutar/satıcı/tarih
**D. Zamanlama kuralları** — Dönem dışı, ileri tarihli, çok eski
**E. Doküman kuralları** — Belgesiz oran, eksik alan, düşük OCR skoru
**F. Desen kuralları** — Aynı personelin tekrarlayan anomalileri

*Her kategorinin spesifik kuralları ayrı belgede: AUDIT-RULES.md — Faz 2'ye ertelendi (accSuspicion otomatik motoru backend ile birlikte tasarlanacak).*

### 4.3. accDenetim koleksiyonu (eklenecek)

Her denetim bulgusu bu koleksiyona yazılır. Yapı:

```
{
  id:         number,
  fisId:      number,
  tip:        string,          // 'limit' | 'tekrar' | ...
  kural:      string,          // 'KAT_LIMIT_ASIM' gibi kural ID
  siddet:     string,          // 'dusuk' | 'orta' | 'yuksek' | 'kritik'
  aciklama:   string,
  detay:      object,
  tarih:      number,
  durum:      string,          // 'acik' | 'inceleniyor' | 'cozuldu' | 'kabul'
  cozumNotu:  string|null,
  cozenKisi:  string|null
}
```

### 4.4. Mevcut accSuspicion ile ilişki

Şu anki `accSuspicion` koleksiyonu demo amaçlıdır. Yeni `accDenetim`
koleksiyonu eklenince `accSuspicion` kaldırılacak veya view'e dönüşecek.

### 4.5. Denetim raporu çıktısı

Kurumsal sunum için zorunlu format:
- Dönem bazlı denetim özeti (PDF)
- Şiddet seviyesine göre sıralı bulgu listesi
- Her bulgu için: fiş detayı + kural + çözüm durumu
- İstatistik: toplam denetlenen, bulgu sayısı, tip dağılımı
- Dashboard canlı görünüm: açık bulgular, kritik seviyedekiler

### 4.6. Dönem kapanış ve özel fatura denetim kuralları

ARCHITECTURE 4.2'deki kural kategorilerine ek iki yeni kategori:

**G. Dönem kuralları**
- KAPANIŞ_BEKLEYEN: Bekleyen fişle dönem kapatılamaz (kiralama hariç)
- AVANS_AÇIK: Dönem sonunda kapanmamış avans varsa muhasebe işaretler
- GEÇ_BELGE: Kapanmış döneme istisna ile eklenen fişler (otomatik flag)
- 7_GÜN_PASİF: Pasif onay devreye girmeden 1 gün önce muhasebeye uyarı
- EKİP_BORCU: Saha borçlu çıkarsa (avans > onaylanan harcama) kayıt
- KIRALAMA_AÇIK: Dönem sonunda hâlâ açık kiralama varsa bilgilendirme (engelleme değil)
- KIRALAMA_İHTİLAF: İhtilaflı kiralamalar denetim raporunda ayrı bölüm
- GEÇ_İŞLEM_KAYIT: Kapanmış döneme her muhasebe müdahalesi gecIslem:true ile arşivlenir
- GEÇ_İŞLEM_SEBEP_EKSİK: Sebep girilmeden geç işlem denenirse engellenir (UI + fonksiyon seviyesi)
- GEÇ_İŞLEM_ŞİDDET_DÜŞÜK: 0-7 gün geç (kapanış sonrası)
- GEÇ_İŞLEM_ŞİDDET_ORTA: 8-30 gün geç
- GEÇ_İŞLEM_ŞİDDET_YÜKSEK: 30+ gün geç
- GEÇ_İŞLEM_PATTERN: Aynı muhasebecinin tekrarlayan geç işlemleri (Faz 2 — desen kuralı, kategori F ile bağlantılı)

**H. Özel fatura kuralları**
- TEVKİFAT_TESPİT: Tevkifatlı fatura tespit edildi, muhasebe uyarısı
- STOPAJ_TESPİT: Stopajlı ödeme tespit edildi, muhasebe uyarısı
- SELF_BILLING_TESPİT: Self-billing belge tespit edildi, muhasebe uyarısı
- TEVKİFAT_DÖNEM_ÖZET: Dönem listesinde tevkifatlı belge sayısı ve toplam tutarı görünür
- ÖZEL_FATURA_İŞARETSIZ: Tedarikçi/kategori özel türe tabi olabilecek (bilinen liste) ama işaret yok — muhasebe doğrulamalı (Faz 2)

**Tetikleme:** ARCHITECTURE 4.1'deki üç noktaya ek olarak:
4. Dönem kapanış anında — manuel kapama veya pasif onay tetiği
5. Pasif onay öncesi — 7 gün dolmadan 1 gün önce muhasebeye uyarı
6. Özel fatura tespit anında — OCR tarama sırasında, fiş yazımı sırasında
7. **Geç işlem anında** — kapanmış döneme yapılan her muhasebe müdahalesi (otomatik flag + sebep zorunluğu)

---

## 5. GÜVENLİK MODELİ

Faz 1'de minimum. Faz 2'de detaylandırılacak.

### 5.1. Roller ve yetkiler
- **Saha**: Kendi fişleri
- **Dept**: Kendi departmanının fişleri
- **Muhasebe**: Tüm fişler, kesin onay
- **Denetçi** (Faz 2): Sadece okuma

### 5.2. Veri erişim kuralları (Faz 2)
- Kullanıcı başka departmanın verisini göremez
- Muhasebe veriyi düzeltemez, sadece işaretler
- Arşiv kayıtları değiştirilemez (bugün kodda yok, eklenecek)

### 5.3. Kimlik doğrulama

Faz 2'de Supabase Auth. Bugün sadece UI katmanında rol.

### 5.4. Denetim motorunun korunması

Denetim motoru ürünün ayırt edici özelliği. Bu yüzden hem atlatılmaya
hem kopyalanmaya karşı korunmalı.

**Faz 1 (bugün):**
- Hiçbir koruma yok. Tüm kod tek HTML dosyada, kullanıcı F12 ile görür.
- Kurallar JS içinde, atlatılabilir.
- Veriye doğrudan müdahale mümkün (`APP.data` üzerinden).
- Bu kabul edilmiş bir sınır — demo amaçlı.

**Faz 2 (Supabase ile):**
- Denetim kuralları **server-side database trigger'ı** olarak çalışır.
- Trigger her yazma işleminde otomatik tetiklenir; kullanıcı atlayamaz.
- Anomali çıktıları (`accDenetim`) kullanıcının yazma yetkisi olmayan
  tabloya yazılır.
- Frontend sadece sonucu görür, kural mantığını görmez.
- Kuralları kapatma/devre dışı bırakma yetkisi sadece sistem yöneticisinde.

**Kopyalanmaya karşı koruma:**
- Frontend kodu açık (HTML/JS) — bu kaçınılmaz, ürünün doğası.
- Ama denetim mantığı backend trigger'larında — kopyalanması zor.
- Kopyalayan birinin **veritabanı şemasını + tüm trigger'ları + kuralları**
  yeniden üretmesi gerekir.
- Asıl koruma: marka, müşteri ilişkisi, sürekli geliştirme,
  veri ağırlığı (müşteri verisi kendi sisteminde).

### 5.5. Maker-Checker kuralı

Bir kayıt oluşturan kişi onu onaylayamaz. Bu denetim için temel
kuraldır.

**Mevcut durumda:**
- Saha kullanıcısı fiş oluşturur, kendi onaylayamaz (rol farkı zaten
  yapıyor — saha rolünde onay butonu yok)
- Dept kullanıcısı kendi adına bir fiş eklerse (ileride mümkün olabilir),
  o fişi kendisi onaylayamaz — başka bir dept üyesi veya muhasebe onaylar
- Muhasebe avans gerekçesi yazıp onaylama riski: tek muhasebeci varsa
  kabul, çok muhasebeci varsa farklı kişiler

**Faz 2 zorlamaları:**
- `receipts.olusturanKey` field'ı eklenecek (kayıt oluşturan kullanıcı key'i)
- Onay fonksiyonları kontrol edecek: `olusturanKey === curUserKey` ise
  onay reddedilir
- Frontend ek: onay butonu kendi kayıtlarında gizlenir
- Backend trigger: aynı kontrol server-side, atlatılamaz

**İstisna:**
- Sistem otomatik kayıtları (denetim trigger'ı, otomatik kategorize, vb.)
  bu kuraldan muaftır — onlar kullanıcı değil

ERPNext/Frappe Accounts modülünden alınan fikir (maker-checker, "self
approval restriction").

---

## 6. FAZ 2 GEÇİŞ NOTU

Bu mimari Supabase'e taşınırken:
- Koleksiyonlar → PostgreSQL tabloları
- Kuyruk koleksiyonlar → VIEW (sorgu, tablo değil)
- Türetilmiş koleksiyonlar → DB function veya materialized view
- Arşiv koleksiyonlar → UPDATE yetkisi olmayan INSERT-only tablo
- Denetim motoru → DB trigger
- fisId referansları → foreign key constraint

Veri modeli değişmez. Sadece depolama katmanı değişir.

---

## 7. POY EKOSİSTEM ENTEGRASYONLARI (FAZ 2)

PRODAPP, POY (Prodüksiyon Otomasyon Yazılımı) ekosisteminin ilk
modülüdür. Faz 2'de diğer POY modülleriyle entegre çalışacak.

### 7.1. Call Sheet & Çekim Takvimi Entegrasyonu

Film prodüksiyonunda "dönem" terimi muhasebe takvimi değil, **çekim
bloğu**dır. Bir blok 1 günden 2 haftaya kadar değişir, sayı dinamiktir
(senaryoya/lokasyona göre 5-20 dönem), call sheet (günlük çağrı belgesi)
ile paralel ilerler.

**Faz 1 yaklaşımı:**
- Dönem manuel açılır/kapanır (basit yönetim)
- Sabit donem field'ı fişlere atanır
- Dönem-çekim bağı YOK

**Faz 2 entegrasyonu (POY Call Sheet modülü hazır olunca):**
- Dönem tanımı zenginleşecek: `{id, lbl, baslangic, bitis, lokasyon, callSheetIds:[]}`
- Fişin tarihi → otomatik dönem önerisi (hangi çekim gününe denk geliyor)
- Call sheet API'sinden çekim takvimi çekilecek
- "Bu fiş hangi sahnede çekildi?" zinciri: fis → tarih → callSheet → sahne

**Kapanmış dönem davranışı:**
- Çekim biter ama belge geç gelebilir (set sonrası 3-7 gün)
- Faz 1: muhasebe onayı + neden ile kapanmış döneme fiş eklenebilir
- Faz 2: otomatik "geç belge" penceresi (örn 7 gün), pencere bitince kilit

**Paralel dönem desteği:**
- 1. ünite + 2. ünite aynı anda farklı lokasyonlarda olabilir
- Faz 1: tek aktif dönem (basit)
- Faz 2: çoklu aktif dönem desteği (call sheet'ten ünite ayrımı gelir)

### 7.2. Diğer POY Modülleri (planlanan)

- **Senaryo & Storyboard** — sahne kırılımı, çekim sırası
- **Cast & Crew** — oyuncu, ekip yönetimi, ödeme bağı PRODAPP'e
- **Lokasyon & Set** — lokasyon kiralama, izinler
- **Post-Production Bütçe** — kurgu, renk, ses, VFX harcamaları PRODAPP'le birleşir

---

## 8. DOKÜMAN SORUMLULUĞU

Bu belge şu durumlarda güncellenir:
- Yeni koleksiyon ekleniyor
- Mevcut koleksiyonun kategorisi değişiyor
- Sorumluluk sınırları değişiyor
- Yeni denetim kural kategorisi tanımlanıyor
- Faz 2 geçiş notu değişiyor

Güncelleme kodla aynı commit'te yapılır.

---

## 9. YARDIM SİSTEMİ NOTU

Yardım sistemi: Faz 1'de sadece onboarding tutorial (3 adım, ilk giriş). Detaylı kullanım kılavuzu Faz 2-3'te ayrı modül olarak planlanacak.

---

## 10. MODÜLERLEŞME STRATEJİSİ

### 10.1. 7A (Kopyalama) vs 7B (Aktive Etme) Ayrımı

Modülerleşme iki ayrı fazda:

**7A — Kopyalama aşaması (tamamlandı, 8 Mayıs 2026):**
Tüm index.html kodu `modules/` ağacına kopyalandı. 14 dosya, 6167 satır. Hiçbir şey silinmedi, hiçbir şey değiştirilmedi. index.html tek çalışan kaynak olmaya devam ediyor. Kopyalar dead code.

```
modules/
  core/
    constants.js     (123 satır)
    state.js         (38 satır — tek aktif: window.APP = APP)
    utils.js         (151 satır)
    services/
      storage.service.js  (46 satır)
      fis.service.js      (362 satır)
      dept.service.js     (113 satır)
      report.service.js   (157 satır)
  dept/dept.js       (1308 satır)
  muhasebe/muhasebe.js (1533 satır)
  saha/
    saha.js          (961 satır)
    donem.js         (593 satır)
  shared/
    export.js        (457 satır)
    ocr.js           (265 satır)
    onboarding.js    (60 satır)
```

**7B — Aktive etme aşaması (tamamlandı, 8 Mayıs 2026):**
Ana `<script>` tag'i `<script type="module">` yapıldı. 14 modül import edildi. ~187 fonksiyon/var `window` üzerine expose edildi. Modüllere taşınmış kod index.html'den silindi (~5470 satır). Marka ayarları ve sohbet sistemi henüz modüle taşınmadı — index.html'de kaldı (7B.1 işi).

### 10.2. Strategy B: Window Exposure Köprüsü (8 Mayıs 2026 — tamamlandı)

**Karar tarihi:** 8 Mayıs 2026  
**Referans:** docs/7B-SCOPE-DISCOVERY.md

**Mevcut durum:**
```html
<script>                      ← tüm uygulama kodu, global scope
  var KAT_IC = {...}
  function deptApprove() {...}
  ...
</script>
<script type="module">        ← sadece import + console.log, pasif
  import * as CONST from './modules/core/constants.js';
  ...
</script>
```

**Hedef durum (Strategy B sonrası):**
```html
<script type="module">        ← tek script bloğu
  import { deptApprove, accOnayla, ... } from './modules/...';
  import { exportManager } from './modules/shared/export.js';
  // 126 expose satırı:
  window.deptApprove = deptApprove;
  window.accOnayla  = accOnayla;
  // ...
</script>
```

**Neden Strategy B, Strategy A değil:**
- Strategy A (tüm onclick → addEventListener): 134 dynamic onclick (innerHTML string'leri) için event delegation altyapısı, 2–3 oturum ek iş.
- Strategy B: 126 mekanik expose satırı, tek tag değişikliği, tek oturum. HTML attribute'lar dokunulmaz.

**Expose sayımı:**
| Tip | Adet |
|---|---|
| Public fonksiyon | 99 |
| Private fonksiyon (HTML'den çağrılan) | 25 |
| `exportManager` objesi | 1 |
| `_gecIslemCb` var (setter) | 1 |
| **Toplam** | **126** |

**Özel durum:** `onclick="closeM('md-gec-islem');_gecIslemCb=null;"` — var ataması içeriyor. `window._gecIslemCb` erişilebilir yapılacak.

Strategy A'ya kademeli geçiş engelli değil — 7B sonrası isteğe bağlı cleanup olarak planlanabilir.

### 10.3. Naming Convention

| Kapsam | Stil |
|---|---|
| JS değişken / fonksiyon | camelCase |
| Supabase tablo / kolon | snake_case |
| ID field'ları | camelCase (`fisId`, `donemId`) |
| Yeni dosya adları | kebab-case |
| Mevcut dosya adları | değiştirilmez |

**Türkçe → İngilizce geçişi:** Namespace key rename ve enum value rename tamamlandı (Batch A-B-C, Mayıs 2026). Field adları (tarih, satici, tutar, kat, durum vb.) Supabase mapping katmanında çözülecek. `toDb()` / `fromDb()` dönüştürücüler service.js katmanında yer alacak — UI kodu veri adlarından bağımsız kalır.

**Mapping katmanı örneği:**
```javascript
function toDb(fis) {
  return { receipt_date: fis.tarih, vendor: fis.satici, amount: fis.tutar, ... };
}
function fromDb(row) {
  return { tarih: row.receipt_date, satici: row.vendor, tutar: row.amount, ... };
}
```

### 10.4. constants.js Durumu (8 Mayıs 2026)

17 export var, 4 kategori. Referans: `7B1-CONSTANTS-DISCOVERY.md`.

**Kategori A — Aktif duplikat (5 adet, iki kaynaktan okunuyor):**
`KAT_IC`, `SD_KAT_CLR`, `SD_KAT_LBL`, `DOT`, `DYN_PANEL_IDS`
→ 7B sonrası index.html `var` tanımları silinecek, modüller import'tan okumaya devam edecek.

**Kategori B — İsim farkıyla duplikat (2 adet, içerik aynı):**
`ONB_SVG` ↔ `_ONB_SVG`, `ONB_DATA` ↔ `_ONB_DATA`
→ 7B sırasında underscore prefix'li index.html versiyonları silinecek.

**Kategori C — Yakın ama farklı (3 adet, dikkat gerektiren):**
- `DEPT_MAP` ↔ `_B_DEPT_MAP` + `_DEPT_LBL_MAP` + `muhasebe.js:deptNm` — üçlü birleşme, `yapim` İngilizce kararı verildikten sonra
- `DEPT_KEYS` ↔ `_B_DEPT_KEYS` — içerik aynı, naming refactor'da birleştirilecek
- `KAT_LIMIT_DEFAULT` ↔ `APP.seed.categoryLimits` — statik default vs runtime mutable, bağlantısı kopuk, Supabase aşamasında çözülecek

**Kategori D — Etkinleştirilmemiş (7 adet, import yok):**
`FIS_DURUM`, `ROL`, `KATEGORILER`, `UL_SEHIRICI_RATE`, `UL_SEHIRDISI_RATE`, `PASIF_ONAY_GUN`, `PASIF_ONAY_MS`
→ Naming refactor tamamlandı (Batch A-B-C, Mayıs 2026). `FIS_DURUM` ve `ROL` key'leri zaten İngilizce, value'lar da artık İngilizce (C1 rename: dept-pending, acc-pending, approved, rejected, split). `KATEGORILER` value'ları da İngilizce (C2 rename: fuel, food, equipment, vb.). Etkinleştirme Faz 1.5 modülerleşmede yapılacak.
