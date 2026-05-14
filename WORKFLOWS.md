# PRODAPP — Mali İş Akışları

**Son güncelleme:** 14 Mayıs 2026  
**Kaynak:** index.html + SCHEMA.md

Bu doküman mali işlem akışlarını tanımlar. Her akış: kim tetikler, hangi
fonksiyon çağrılır, hangi koleksiyonlar değişir, hangi bildirim gider.

---

## Bu doküman NE ZAMAN güncellenir

- Yeni mali akış eklendiğinde (ör. iade, mahsup, tahsilat)
- Mevcut akışın fonksiyon zinciri değiştiğinde
- Bildirim hedefleri değiştiğinde
- Koleksiyon güncellemeleri değiştiğinde

Kodu değiştiren commit'te WORKFLOWS.md da güncellenir. Commit mesajında
"workflow updated" ibaresi geçer.

---

## Akış Legend

Her akış şu formatta yazılır:

**🟢 TETİKLEYİCİ:** Hangi kullanıcı ne yapınca başlar  
**📞 FONKSİYON ZİNCİRİ:** Çağrılan fonksiyonlar satır no ile  
**💾 KOLEKSIYON GÜNCELLEMELERİ:** Hangi APP.data alanları nasıl değişir  
**📬 BİLDİRİMLER:** Kime, hangi tip, hangi amaçla  
**⚠️ BİLİNEN RİSKLER:** Field tutarsızlığı, implement edilmemiş, vb.

---

## AKIŞ 1 — Saha Fiş Girişi (OCR + Belgesiz)

### 1A — OCR ile fiş ekleme

**🟢 TETİKLEYİCİ:** Saha kullanıcısı ana ekranda fiş tarar → form doldurur → "Onayla"

**📞 FONKSİYON ZİNCİRİ:**
- `submitOCR()` — satır 5160
- → `_addToDeptBekleyen(satici, kat, tutar, false, '', [], entry.id)` — satır 5609

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.receipts`: unshift (yeni fiş, `durum='dept-pending'`)
- `APP.data.deptPending`: unshift (dept kuyruğuna)

**📬 BİLDİRİMLER:** Yok (henüz dept onayı olmadığı için)

**⚠️ BİLİNEN RİSKLER:**
- Saha yine aynı kullanıcının önceki fişlerini görür — duplicate kontrolü yok
- Kategori field'ı `"kat"` olarak yazılır (`"kategori"` değil — SCHEMA.md'ye bak)

---

### 1B — Belgesiz harcama

**🟢 TETİKLEYİCİ:** Saha kullanıcısı "Belgesiz" tuşu → form doldurur → "Bildir"

**📞 FONKSİYON ZİNCİRİ:**
- `submitBelgesiz()` — satır 7097
- → `_addToDeptBekleyen('Belgesiz Harcama', kat, tutar, true, aciklama, fotos, fisId)` — satır 5609

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.receipts`: unshift (`durum='dept-pending'`, `belgesiz:true`)
- `APP.data.deptPending`: unshift

**⚠️ BİLİNEN RİSKLER:**
- Belgesiz alt-kategori ağacı yok (STATUS.md'de ertelenmiş)

---

## AKIŞ 2 — Dept Onay (Tekil + Toplu)

### 2A — Tekil onay

**🟢 TETİKLEYİCİ:** Dept kullanıcısı bekleyen fişin üzerindeki onay butonuna tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `deptOnayla(id)` — satır 6779

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptPending`: splice (fişi çıkar)
- `APP.data.deptHistory[activePeriod].onaylandi`: push (arşiv kaydı)
- `APP.data.accPending`: unshift (muhasebe kuyruğuna — `fisId` referansı korunur)
- `APP.data.periodBudget[activePeriod].harcanan`: `+= tutar`

**📬 BİLDİRİMLER:**
- `_pushNotif('m', 'bl', ...)` — muhasebeye "yeni bekleyen"
- `_checkButceUyari()` — bütçe eşiği (%80/%100) geçildiyse dept + muhasebeye otomatik uyarı

**💾 EK KOLEKSIYON GÜNCELLEMESİ (24.04.2026 eklemesi):**
- `APP.data.receipts[i].durum`: `'dept-pending'` → `'acc-pending'` (fisId ile eşleştirme)

---

### 2B — Toplu onay

**🟢 TETİKLEYİCİ:** Dept kullanıcısı çoklu checkbox seçer → "Seçilenleri Onayla"

**📞 FONKSİYON ZİNCİRİ:**
- `deptOnaylaSecili()` — satır 5931

**💾 KOLEKSIYON GÜNCELLEMELERİ:** 2A ile aynı, `APP.ui.deptSelected`'teki her seçili fiş için döngü (her fiş için `receipts[i].durum: 'dept-pending' → 'acc-pending'` dahil)

**📬 BİLDİRİMLER:**
- `_pushNotif('m', 'bl', ...)` — muhasebeye toplu sayı ile tek bildirim

---

## AKIŞ 3 — Dept Red (Tekil + Toplu)

### 3A — Tekil red

**🟢 TETİKLEYİCİ:** Dept kullanıcısı red butonuna tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `deptReddet(id)` — satır 6827
- `prompt()` ile red nedeni alınır (zorunlu — boşsa iptal)

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptPending`: splice
- `APP.data.deptHistory[activePeriod].reddedildi`: push (`redNedeni` field'ı ile)
- `APP.data.periodBudget[activePeriod].reddedildi`: `+= tutar`
- `APP.data.receipts[i].durum`: `'dept-pending'` → `'rejected'` (fisId ile eşleştirme)
- `APP.data.receipts[i].uyari`: `redNedeni` yazılır

**📬 BİLDİRİMLER:**
- `_pushNotif(f.fromKey, 'rd', ...)` — saha kullanıcısına red nedeni ile

**⚠️ BİLİNEN RİSKLER:**
- Kısmi red yok — tek fişin bir kısmı onay, kalanı red edilemiyor (STATUS.md P0 olarak bekliyor)

---

### 3B — Toplu red

**🟢 TETİKLEYİCİ:** Dept kullanıcısı çoklu checkbox → "Seçilenleri Reddet"

**📞 FONKSİYON ZİNCİRİ:**
- `deptReddetSecili()` — satır 5981
- `prompt()` tek seferde (aynı red nedeni tüm seçimlere uygulanır)

**💾 KOLEKSIYON GÜNCELLEMELERİ:** 3A ile aynı, her seçili fiş için döngü (`receipts[i].durum = 'rejected'` ve `receipts[i].uyari = redNedeni` dahil)

**📬 BİLDİRİMLER:**
- Her reddedilen fiş için ayrı `_pushNotif(f.fromKey, 'rd', ...)`

---

## AKIŞ 4 — Muhasebe Kesin Onay

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı bekleyen listede onay butonu

**📞 FONKSİYON ZİNCİRİ:**
- `accOnayla(id)` — satır 9738

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accPending`: filter (fişi çıkar)
- `APP.data.receipts[i].durum`: `'acc-pending'` → `'approved'`  
  (önce `fisId` ile eşleşir; bulamazsa `uye + satici + tutar + tarih` ile fallback)
- Avans ise: `APP.data.accAdvanceHistory`'e `durum='paid'` ile yazılır (`_avGecmisEkle()`)
- Harcama ise: `APP.data.accHistory`: push (arşiv kaydı, fisId + snapshot ile)

**📬 BİLDİRİMLER:**
- `_pushNotif(item.fromKey, 'gr', ...)` — saha kullanıcısına "onaylandı"

**⚠️ BİLİNEN RİSKLER:**
- `fisId` yoksa fallback 4 alan eşleşmezse `durum` güncellenmez — sessiz hata

---

## AKIŞ 4.5 — Kısmi Onay (Dept ve Muhasebe)

### 4.5A — Dept kısmi onay

**🟢 TETİKLEYİCİ:** Dept kullanıcısı bekleyen fişin ½ butonuna tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `openKismi('dept', id)` — modal açar, canlı red tutar hesabı
- `kismiOnayla()` — modal'dan parametre alır
- `deptKismi(id, onayTutar, redNedeni)` — gerçek iş

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.receipts[parent].durum`: `'split'`
- `APP.data.receipts`: 2 yeni çocuk `unshift` (`parentFisId` + `kismiTip` ile)
- `APP.data.deptPending`: parent `splice`
- `APP.data.deptHistory[activePeriod]`: `onaylandi` + `reddedildi` push (her biri)
- `APP.data.accPending`: onay çocuğu `unshift`
- `APP.data.periodBudget`: `harcanan += onayTutar`, `reddedildi += redTutar`

**📬 BİLDİRİMLER:**
- `_pushNotif('m', 'bl', ...)` — muhasebeye yeni bekleyen
- `_pushNotif(fromKey, 'rd', ...)` — saha'ya kısmi red

**⚠️ BİLİNEN RİSKLER:**
- Parent fiş `'split'` durumunda raporlarda atlanır. Üç rapor fonksiyonunda da `continue` eklendi (`_recomputeAccDepts`, `_computeRaporDeptFis`, `_computeRaporPersonel`).

---

### 4.5B — Muhasebe kısmi onay

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı bekleyen harcamanın ½ butonu (sadece !isAvans)

**📞 FONKSİYON ZİNCİRİ:**
- `openKismi('acc', id)`
- `kismiOnayla()`
- `accKismi(id, onayTutar, redNedeni)`

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.receipts[parent].durum`: `'split'`
- `APP.data.receipts`: 2 yeni çocuk `unshift` (onay çocuğu `durum='approved'`, red çocuğu `durum='rejected'`)
- `APP.data.accPending`: parent `splice`
- `APP.data.accHistory`: 2 kayıt `push` (her çocuk için, `redNedeni` kayıtlı)

**📬 BİLDİRİMLER:**
- `_pushNotif('s', 'gr', ...)` — saha'ya kısmi onay
- `_pushNotif('d', 'gr', ...)` — dept'e kısmi onay haberi
- `_pushNotif('s', 'rd', ...)` — saha'ya kısmi red
- `_pushNotif('d', 'rd', ...)` — dept'e kısmi red haberi

**⚠️ BİLİNEN RİSKLER:** Yok (muhasebe son durak)

---

## AKIŞ 5 — Muhasebe Red

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı bekleyen listede red butonu

### 5A — Harcama reddi

**📞 FONKSİYON ZİNCİRİ:**
- `accReddet(id)` — satır 9799
- `prompt()` ile red nedeni
- `APP.data.receipts[i].durum = 'rejected'`, `receipts[i].uyari = redNedeni`
- `_pushNotif(item.fromKey, 'rd', ...)` — saha'ya bildirim

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accPending`: filter
- `APP.data.receipts[i].durum`: `'rejected'`
- `APP.data.receipts[i].uyari`: red nedeni metni
- `APP.data.accHistory`: push (arşiv kaydı, fisId + snapshot ile)

---

### 5B — Avans reddi

**📞 FONKSİYON ZİNCİRİ:**
- `accReddet(id)` — `item.tip === 'avans'` dalı
- → `_avRedPending = { id, kaynak:'acc', _item: item }` yazar
- → `openM('md-av-red')` modal açılır
- → Modaldan "Reddet" → `avansRedOnay()` — satır 5423 (`kaynak:'acc'` dalı)
- → `_avGecmisEkle({durum:'rejected'})` — satır 5416

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accPending`: filter
- `APP.data.accAdvanceHistory`: unshift (`durum='rejected'`, `redNedeni` ile)

**📬 BİLDİRİMLER:**
- `_pushNotif(fromKey, 'rd', ...)` — saha'ya
- `_pushNotif('d', 'am', ...)` — dept'e (fromKey !== 'd' ise)

---

## AKIŞ 6 — Avans Talebi (Saha → Dept → Muhasebe)

### 6A — Saha talep oluşturma

**🟢 TETİKLEYİCİ:** Saha kullanıcısı "Avans Talep Et" → form doldur → gönder

**📞 FONKSİYON ZİNCİRİ:**
- `submitAvans()` — satır 7172

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptAdvances`: unshift (`{ id, uye, ini, tutar, tarih, gerekce, fromKey }`)

**📬 BİLDİRİMLER:**
- `_pushNotif(fromKey, 'bl', ...)` — saha'ya "talep gönderildi"
- `_pushNotif('d', 'am', ...)` — dept'e "yeni avans talebi"

---

### 6B — Dept avans onay

**🟢 TETİKLEYİCİ:** Dept kullanıcısı avans talebini onaylar

**📞 FONKSİYON ZİNCİRİ:**
- `deptAvansOnayla(id)` — satır 6860

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptAdvances`: splice (talebi çıkar)
- `APP.data.accPending`: unshift (`tip:'avans'` ile)

**📬 BİLDİRİMLER:**
- `_pushNotif('m', 'am', ...)` — muhasebeye "avans onay bekliyor"

---

### 6C — Dept avans red

**🟢 TETİKLEYİCİ:** Dept kullanıcısı avans talebini reddeder

**📞 FONKSİYON ZİNCİRİ:**
- `deptAvansReddet(id)` — satır 6892
- → `_avRedPending = { id, kaynak:'dept' }` yazar
- → `openM('md-av-red')` modal açılır
- → `avansRedOnay()` — satır 5423 (`kaynak:'dept'` dalı)
- → `_avGecmisEkle({durum:'rejected'})` + `_pushNotif(fromKey, 'rd', ...)`

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptAdvances`: splice
- `APP.data.accAdvanceHistory`: unshift (`durum='rejected'`, `redNedeni` ile)

---

### 6D — Muhasebe avans ödeme

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı avans talebini onaylar

**📞 FONKSİYON ZİNCİRİ:**
- `accOnayla(id)` — satır 9738, `item.tip === 'avans'` dalı

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accPending`: filter
- `APP.data.accAdvanceHistory`: unshift (`durum='paid'`)

**📬 BİLDİRİMLER:**
- `_pushNotif(fromKey, 'gr', ...)` — saha'ya "avans onaylandı"
- `_pushNotif('d', 'gr', ...)` — dept'e (`fromKey !== 'd'` ise)

---

### 6E — Muhasebe → Dept şefi direkt avans (Faz 2)

**⚠️ HENÜZ İMPLEMENTE DEĞİL**
- Muhasebe dept şefine toplu avans gönderir, şef personele dağıtır senaryosu
- `accOnayla`'nın avans dalı yeni avans oluşturmuyor, sadece onaylıyor
- `accPending` filtresi şu an `|| true` geçici kod ile kapsanıyor
- Faz 2'de proper akış yazılacak

---

## AKIŞ 7 — Kiralama

### 7A — Kiralama başlatma

**🟢 TETİKLEYİCİ:** Saha kullanıcısı OCR/Belgesiz formda `kat='rental'` seçer + `kiraMeta` field'larını doldurur

**📞 FONKSİYON ZİNCİRİ:** `submitOCR()` / `submitBelgesiz()` normal akışı (ayrı başlatma fonksiyonu yok)

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.receipts`: unshift (`kiraMeta: { bas, bit, gunluk }` ile — tarihler ISO `YYYY-MM-DD`)
- `APP.data.deptPending`: unshift

**⚠️ BİLİNEN RİSKLER:**
- Ayrı kiralama entity yok, normal fiş olarak sayılıyor — modüler akışta ayrılması gerekebilir

---

### 7B — İade (Dept ve Muhasebe)

**🟢 TETİKLEYİCİ:** Dept veya Muhasebe kullanıcısı "İade Edildi" işaretler

**📞 FONKSİYON ZİNCİRİ:**
- `deptKiraIade(id)` — satır 6338 (dept ekranından)
- `accKiraIade(id)` — satır 6496 (muhasebe ekranından)

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptRentals[i].iade = true`
- `APP.data.accRentals[j].iade = true`
- (Her iki fonksiyon da her iki diziyi günceller)

---

### 7C — Gecikme ve ceza hesabı

**📞 FONKSİYON ZİNCİRİ (render-time):**
- `_rentalStatus(k)` — (satır no güncellenmeli) — `'returned'` / `'overdue'` / `'upcoming'` / `'ak'` döndürür
- `_gunFarki(a, b)` — satır 6236 — `Math.floor((b-a) / 86400000)` ms farkı
- Ceza: `gecGun * k.gunluk` — render esnasında hesaplanır

**⚠️ BİLİNEN RİSKLER:**
- Ceza tutarı hiçbir koleksiyona **yazılmaz** — render-time hesap, geçmişe bakılamaz
- Her render'da yeniden hesaplanır — tutarlılık test edilmeli
- Zaman zonu farkları `gecGun` hesabını bozabilir

---

## AKIŞ 8 — Bildirim Zinciri

### 8A — Bildirim üretme

**📞 FONKSİYON ZİNCİRİ:**
- `_pushNotif(toKey, tip, title, body, meta)` — satır 7985 — TÜM bildirimlerin merkezi fonksiyonu

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.globalInbox[toKey]`: unshift

**Bildirim tipleri:** `'gr'` (onay/başarı), `'rd'` (red/hata), `'am'` (uyarı/bekleyen), `'bl'` (bilgi)

**Otomatik çağrılanlar:**
- `_checkButceUyari()` — bütçe %80 / %100 eşiği geçilince dept + muhasebeye
- `_checkKatLimit()` — kategori limiti aşılınca

**📬 HEDEF:**
- Hedef aktif kullanıcıysa `APP.ui.notifications` referansı güncellenir
- `updateNotifBadge()` çağrılır (rozet sayısı)

---

### 8B — Bildirim okundu

**🟢 TETİKLEYİCİ:** Kullanıcı bildirim modalında bir bildirime tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `markNotifRead(id)` — satır 8014

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.ui.notifications[i].read = true`
- `updateNotifBadge()` + `renderNotifModal()` çağrılır

---

## AKIŞ 9 — Dönem Yönetimi

Asimetrik kapanış modeli: saha/dept için tam kapanış, muhasebe için soft kapanış (geç işlem işaretli).

### 9A — Yeni Dönem Açma

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı Dönem Yönetimi şeridinde "+ Yeni Dönem" butonuna tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `yeniDonem()` — satır 7648
- → Aktif dönem varsa: sıkı kapanış kontrolü (kiralama hariç bekleyen sayısı)
  - Bekleyen > 0: `confirm()` → `_periodCloseModal(aktif.id)` açılır
  - Bekleyen = 0: `confirm()` → `donemKapa(aktif.id, sebep)` çalışır, yeni dönem açılır
- → Aktif dönem yoksa: doğrudan yeni dönem oluşturulur

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.seed.periods`: unshift (yeni dönem objesi — `durum:'active'`, yeni id/n/lbl)
- `APP.seed.deptPeriods`: unshift (dept ekranı dönem seçici)
- `APP.seed.accPeriods`: unshift (muhasebe ekranı dönem seçici)
- `APP.data.periodBudget`: unshift (yeni dönem bütçe satırı)
- `APP.ui.activePeriod`: yeni id'ye güncellenir

**📬 BİLDİRİMLER:**
- `_pushNotif('s', 'bl', 'Yeni Dönem Açıldı', ...)` — saha'ya
- `_pushNotif('d', 'bl', 'Yeni Dönem Açıldı', ...)` — dept'e

---

### 9B — Dönem Kapama

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı "Dönem Kapat" butonu → `_periodCloseModal(id)` → modalda "Kapat"

**📞 FONKSİYON ZİNCİRİ:**
- `_periodCloseModal(donemId)` → modal açar (bekleyen sayısı gösterir)
- `_dnKapamaUygula()` → `donemKapa(donemId, sebep)` çağırır
- `donemKapa(donemId, sebep)`:
  1. Rol kontrolü (sadece muhasebe)
  2. Kiralama hariç bekleyen varsa `notif` ile engel + return
  3. Kiralama bekleyen varsa `confirm()` — kullanıcı kararı
  4. Açık avans varsa `_pushNotif('m', 'am', ...)` uyarı
  5. Dönem durumunu günceller (kapali, bitis, kapanmaTarihi, kapayanKisi)

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.seed.periods[i].durum`: `'kapali'`, `bitis`, `kapanmaTarihi`, `kapayanKisi` güncellenir
- `APP.seed.deptPeriods[i].aktif`: `false`
- `APP.seed.accPeriods[i].aktif`: `false`

**📬 BİLDİRİMLER:**
- `_pushNotif('s', 'kp', ...)` — saha'ya dönem kapatıldı
- `_pushNotif('d', 'kp', ...)` — dept'e dönem kapatıldı

**⚠️ BİLİNEN RİSKLER:**
- Kiralama fişleri bekleyen kalabilir — uyarı verilir ama kapanmaya izin verilir

---

### 9C — Pasif Onay (7 gün)

**🟢 TETİKLEYİCİ:** `_checkPasifOnay()` — her `renderAccBek()`, `renderDept()`, `init()` çağrısında otomatik çalışır

**📞 FONKSİYON ZİNCİRİ:**
- `_checkPasifOnay()` — satır 7797
- `accPending` içindeki her item için (avans ve rental hariç): `olusturmaZamani` kontrolü
  - ≥ 7 gün: `pasifOnaylar` listesine alır → `receipts.durum = 'approved'`, `accHistory` push, `accPending` splice
  - ≥ 6 gün (7-1): `uyariVerildi` flag'i yoksa muhasebe'ye yaklaşıyor bildirimi

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.receipts[i].durum`: `'approved'`
- `APP.data.accPending`: splice (7 gün dolmuş itemlar)
- `APP.data.accHistory`: push (`pasifOnay:true` field'ı ile — geç işlem değil)


**📬 BİLDİRİMLER:**
- `_pushNotif('s', 'gr', 'Pasif Onay', ...)` — saha'ya otomatik onay haberi
- `_pushNotif('m', 'am', 'Pasif Onay Tetiklendi', ...)` — muhasebeye uyarı

---

### 9D — Geç İşlem (Asimetrik Kapanış)

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı kapalı dönemdeki bir harcama üzerinde accOnayla / accReddet / accKismi çağırır

**📞 FONKSİYON ZİNCİRİ:**
- `accOnayla(id)` / `accReddet(id)` / `accKismi(id, ...)` — kapalı dönem kontrolü yapılır
- Kapalı dönem tespit edilirse: `_gecIslemModal(donemId, islem, callback)` açılır
- Muhasebe sebep girer → `_gecIslemUygula()` → callback'i çağırır
- Callback içinde orijinal işlem + `gecIslem:true` field'ları accHistory kaydına eklenir

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accHistory`: push — `gecIslem:true`, `gecIslemSebep:string`, `gecIslemDonem:number` field'ları ile
- `APP.seed.periods[i].gecIslemSayisi`: `+= 1`
- Orijinal işlemin tüm koleksiyon güncellemeleri de yapılır (receipts.durum, accPending splice vb.)

**📬 BİLDİRİMLER:** Orijinal akışın bildirimleri aynen devam eder

**⚠️ KRİTİK KURAL:**
- `gecIslem`, `gecIslemSebep`, `gecIslemDonem` field'ları accHistory'e yazıldıktan sonra silinemez, override edilemez
- Saha ve dept kapanmış dönemde işlem yapamaz — deptOnayla/deptReddet/deptKismi ve _addToDeptBekleyen'in başında engel var

---

### 9E — İstisna İzni

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı kapanmış dönem ekranında "İstisna İzni Ver" butonuna tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `openIstisnaIzniModal(donemId)` — modal açar, deptCrew dropdown doldurur
- Muhasebe formu doldurur (kişi, sebep, süre, max adet/tutar) → "İzin Ver"
- `donemIstisnaIzniVer()` — validasyon, push, bildirim, saveAppData
- **Saha kullanıcısı fişi eklerken:** `_addToDeptPending()` → `_activeException()` + `_isExceptionValid()` → doğrudan accPending'e yönlendir

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.exceptionPermits`: push (muhasebe izin verir)
- `APP.data.receipts`: gecIslem:true, istisnaIzniId, durum:'acc-pending' (saha fişi eklerken)
- `APP.data.accPending`: unshift — gecIslem:true, istisnaIzniId (dept atlanır)
- `izin.girilenAdet++`, `izin.girilenTutar += tutar` — her fiş girişinde
- `izin.durum`: `'active'` → `'sureDoldu'`|`'adetDoldu'`|`'tutarDoldu'`|`'iptal'`

**📬 BİLDİRİMLER:**
- `_pushNotif(toKey, 'am', 'İstisna İzni', ...)` — kişiye izin verildi (donemIstisnaIzniVer)
- `_pushNotif('m', 'am', 'İstisna İzni — Yeni Fiş', ...)` — muhasebe'ye fiş eklendi (_addToDeptBekleyen)

**⚠️ KRİTİK KURALLAR:**
- Dept ATLANIR — fiş doğrudan accPending'e gider
- gecIslem:true ve istisnaIzniId receipts + accPending kayıtlarına eklenir (silinemez)
- Süre/adet/tutar dolunca izin otomatik kapanır, sonraki fiş girişi engellenir
- İptal: muhasebe `istisnaIzniIptal(id)` ile iptal edebilir → renderDonem yenilenir

**Durum:** Tamamlandı (30.04.2026)

---

## KRİTİK BULGULAR

Bu akışları yazarken tespit edilen, STATUS.md'ye eklenecek riskler:

1. **Kiralama ceza tutarı persistent değil:** Render-time hesaplanıyor, geçmişe bakmak zor.

2. **Muhasebe → Dept direkt avans akışı eksik:** Faz 2'ye not edildi.

3. ~~**Bekleyen sayım bug'ı:** Dönem kapama modal'ı yanlış bekleyen sayısı gösterebiliyor.~~ **Düzeltildi (30.04.2026):** `_periodCloseModal` + `donemKapa` — çift cross-check eklendi (`receipts.durum` kontrolü) + `loadAppData` migration (donem field eksik eski kayıtlar). Bkz. BUG-2 + BUG-3.

---

*Son teyit: index.html toplam satır sayısı ~5322 (14.05.2026 itibarıyla — 7B modülerleşme sonrası ~10641'den düştü).*
