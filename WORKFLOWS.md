# PRODAPP — Mali İş Akışları

**Son güncelleme:** 24 Nisan 2026  
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
- `APP.data.fisler`: unshift (yeni fiş, `durum='dept-bekleyen'`)
- `APP.data.deptBekleyen`: unshift (dept kuyruğuna)

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
- `APP.data.fisler`: unshift (`durum='dept-bekleyen'`, `belgesiz:true`)
- `APP.data.deptBekleyen`: unshift

**⚠️ BİLİNEN RİSKLER:**
- Belgesiz alt-kategori ağacı yok (STATUS.md'de ertelenmiş)

---

## AKIŞ 2 — Dept Onay (Tekil + Toplu)

### 2A — Tekil onay

**🟢 TETİKLEYİCİ:** Dept kullanıcısı bekleyen fişin üzerindeki onay butonuna tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `deptOnayla(id)` — satır 6779

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptBekleyen`: splice (fişi çıkar)
- `APP.data.deptGecmis[aktifDon].onaylandi`: push (arşiv kaydı)
- `APP.data.accBekleyen`: unshift (muhasebe kuyruğuna — `fisId` referansı korunur)
- `APP.data.donemButce[aktifDon].harcanan`: `+= tutar`

**📬 BİLDİRİMLER:**
- `_pushNotif('m', 'bl', ...)` — muhasebeye "yeni bekleyen"
- `_checkButceUyari()` — bütçe eşiği (%80/%100) geçildiyse dept + muhasebeye otomatik uyarı

**💾 EK KOLEKSIYON GÜNCELLEMESİ (24.04.2026 eklemesi):**
- `APP.data.fisler[i].durum`: `'dept-bekleyen'` → `'acc-bekleyen'` (fisId ile eşleştirme)

---

### 2B — Toplu onay

**🟢 TETİKLEYİCİ:** Dept kullanıcısı çoklu checkbox seçer → "Seçilenleri Onayla"

**📞 FONKSİYON ZİNCİRİ:**
- `deptOnaylaSecili()` — satır 5931

**💾 KOLEKSIYON GÜNCELLEMELERİ:** 2A ile aynı, `APP.ui.sdSec`'teki her seçili fiş için döngü (her fiş için `fisler[i].durum: 'dept-bekleyen' → 'acc-bekleyen'` dahil)

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
- `APP.data.deptBekleyen`: splice
- `APP.data.deptGecmis[aktifDon].reddedildi`: push (`redNedeni` field'ı ile)
- `APP.data.donemButce[aktifDon].reddedildi`: `+= tutar`
- `APP.data.fisler[i].durum`: `'dept-bekleyen'` → `'reddedildi'` (fisId ile eşleştirme)
- `APP.data.fisler[i].uyari`: `redNedeni` yazılır

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

**💾 KOLEKSIYON GÜNCELLEMELERİ:** 3A ile aynı, her seçili fiş için döngü (`fisler[i].durum = 'reddedildi'` ve `fisler[i].uyari = redNedeni` dahil)

**📬 BİLDİRİMLER:**
- Her reddedilen fiş için ayrı `_pushNotif(f.fromKey, 'rd', ...)`

---

## AKIŞ 4 — Muhasebe Kesin Onay

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı bekleyen listede onay butonu

**📞 FONKSİYON ZİNCİRİ:**
- `accOnayla(id)` — satır 9738

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accBekleyen`: filter (fişi çıkar)
- `APP.data.fisler[i].durum`: `'acc-bekleyen'` → `'onaylandi'`  
  (önce `fisId` ile eşleşir; bulamazsa `uye + satici + tutar + tarih` ile fallback)
- Avans ise: `APP.data.accAvansGecmis`'e `durum='ödendi'` ile yazılır (`_avGecmisEkle()`)
- Harcama ise: `APP.data.accGecmis`: push (arşiv kaydı, fisId + snapshot ile)

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
- `APP.data.fisler[parent].durum`: `'bolundu'`
- `APP.data.fisler`: 2 yeni çocuk `unshift` (`parentFisId` + `kismiTip` ile)
- `APP.data.deptBekleyen`: parent `splice`
- `APP.data.deptGecmis[aktifDon]`: `onaylandi` + `reddedildi` push (her biri)
- `APP.data.accBekleyen`: onay çocuğu `unshift`
- `APP.data.donemButce`: `harcanan += onayTutar`, `reddedildi += redTutar`

**📬 BİLDİRİMLER:**
- `_pushNotif('m', 'bl', ...)` — muhasebeye yeni bekleyen
- `_pushNotif(fromKey, 'rd', ...)` — saha'ya kısmi red

**⚠️ BİLİNEN RİSKLER:**
- Parent fiş `'bolundu'` durumunda raporlarda atlanır. Üç rapor fonksiyonunda da `continue` eklendi (`_recomputeAccDepts`, `_computeRaporDeptFis`, `_computeRaporPersonel`).

---

### 4.5B — Muhasebe kısmi onay

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı bekleyen harcamanın ½ butonu (sadece !isAvans)

**📞 FONKSİYON ZİNCİRİ:**
- `openKismi('acc', id)`
- `kismiOnayla()`
- `accKismi(id, onayTutar, redNedeni)`

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.fisler[parent].durum`: `'bolundu'`
- `APP.data.fisler`: 2 yeni çocuk `unshift` (onay çocuğu `durum='onaylandi'`, red çocuğu `durum='reddedildi'`)
- `APP.data.accBekleyen`: parent `splice`
- `APP.data.accGecmis`: 2 kayıt `push` (her çocuk için, `redNedeni` kayıtlı)

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
- `APP.data.fisler[i].durum = 'reddedildi'`, `fisler[i].uyari = redNedeni`
- `_pushNotif(item.fromKey, 'rd', ...)` — saha'ya bildirim

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accBekleyen`: filter
- `APP.data.fisler[i].durum`: `'reddedildi'`
- `APP.data.fisler[i].uyari`: red nedeni metni
- `APP.data.accGecmis`: push (arşiv kaydı, fisId + snapshot ile)

---

### 5B — Avans reddi

**📞 FONKSİYON ZİNCİRİ:**
- `accReddet(id)` — `item.tip === 'avans'` dalı
- → `_avRedPending = { id, kaynak:'acc', _item: item }` yazar
- → `openM('md-av-red')` modal açılır
- → Modaldan "Reddet" → `avansRedOnay()` — satır 5423 (`kaynak:'acc'` dalı)
- → `_avGecmisEkle({durum:'reddedildi'})` — satır 5416

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accBekleyen`: filter
- `APP.data.accAvansGecmis`: unshift (`durum='reddedildi'`, `redNedeni` ile)

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
- `APP.data.deptAvans`: unshift (`{ id, uye, ini, tutar, tarih, gerekce, fromKey }`)

**📬 BİLDİRİMLER:**
- `_pushNotif(fromKey, 'bl', ...)` — saha'ya "talep gönderildi"
- `_pushNotif('d', 'am', ...)` — dept'e "yeni avans talebi"

---

### 6B — Dept avans onay

**🟢 TETİKLEYİCİ:** Dept kullanıcısı avans talebini onaylar

**📞 FONKSİYON ZİNCİRİ:**
- `deptAvansOnayla(id)` — satır 6860

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptAvans`: splice (talebi çıkar)
- `APP.data.accBekleyen`: unshift (`tip:'avans'` ile)

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
- → `_avGecmisEkle({durum:'reddedildi'})` + `_pushNotif(fromKey, 'rd', ...)`

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptAvans`: splice
- `APP.data.accAvansGecmis`: unshift (`durum='reddedildi'`, `redNedeni` ile)

---

### 6D — Muhasebe avans ödeme

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı avans talebini onaylar

**📞 FONKSİYON ZİNCİRİ:**
- `accOnayla(id)` — satır 9738, `item.tip === 'avans'` dalı

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accBekleyen`: filter
- `APP.data.accAvansGecmis`: unshift (`durum='ödendi'`)

**📬 BİLDİRİMLER:**
- `_pushNotif(fromKey, 'gr', ...)` — saha'ya "avans onaylandı"
- `_pushNotif('d', 'gr', ...)` — dept'e (`fromKey !== 'd'` ise)

---

### 6E — Muhasebe → Dept şefi direkt avans (Faz 2)

**⚠️ HENÜZ İMPLEMENTE DEĞİL**
- Muhasebe dept şefine toplu avans gönderir, şef personele dağıtır senaryosu
- `accOnayla`'nın avans dalı yeni avans oluşturmuyor, sadece onaylıyor
- `accBekleyen` filtresi şu an `|| true` geçici kod ile kapsanıyor
- Faz 2'de proper akış yazılacak

---

## AKIŞ 7 — Kiralama

### 7A — Kiralama başlatma

**🟢 TETİKLEYİCİ:** Saha kullanıcısı OCR/Belgesiz formda `kat='Kiralama'` seçer + `kiraMeta` field'larını doldurur

**📞 FONKSİYON ZİNCİRİ:** `submitOCR()` / `submitBelgesiz()` normal akışı (ayrı başlatma fonksiyonu yok)

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.fisler`: unshift (`kiraMeta: { bas, bit, gunluk }` ile — tarihler ISO `YYYY-MM-DD`)
- `APP.data.deptBekleyen`: unshift

**⚠️ BİLİNEN RİSKLER:**
- Ayrı kiralama entity yok, normal fiş olarak sayılıyor — modüler akışta ayrılması gerekebilir

---

### 7B — İade (Dept ve Muhasebe)

**🟢 TETİKLEYİCİ:** Dept veya Muhasebe kullanıcısı "İade Edildi" işaretler

**📞 FONKSİYON ZİNCİRİ:**
- `deptKiraIade(id)` — satır 6338 (dept ekranından)
- `accKiraIade(id)` — satır 6496 (muhasebe ekranından)

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.deptKira[i].iade = true`
- `APP.data.accKiralamalar[j].iade = true`
- (Her iki fonksiyon da her iki diziyi günceller)

---

### 7C — Gecikme ve ceza hesabı

**📞 FONKSİYON ZİNCİRİ (render-time):**
- `_kiraDurum(k)` — satır 6242 — `'iade'` / `'gec'` / `'yak'` / `'normal'` döndürür
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
- Hedef aktif kullanıcıysa `APP.ui.notiflar` referansı güncellenir
- `updateNotifBadge()` çağrılır (rozet sayısı)

---

### 8B — Bildirim okundu

**🟢 TETİKLEYİCİ:** Kullanıcı bildirim modalında bir bildirime tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `markNotifRead(id)` — satır 8014

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.ui.notiflar[i].read = true`
- `updateNotifBadge()` + `renderNotifModal()` çağrılır

---

## AKIŞ 9 — Dönem Yönetimi

Asimetrik kapanış modeli: saha/dept için tam kapanış, muhasebe için soft kapanış (geç işlem işaretli).

### 9A — Yeni Dönem Açma

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı Dönem Yönetimi şeridinde "+ Yeni Dönem" butonuna tıklar

**📞 FONKSİYON ZİNCİRİ:**
- `yeniDonem()` — satır 7648
- → Aktif dönem varsa: sıkı kapanış kontrolü (kiralama hariç bekleyen sayısı)
  - Bekleyen > 0: `confirm()` → `_dnKapamaModal(aktif.id)` açılır
  - Bekleyen = 0: `confirm()` → `donemKapa(aktif.id, sebep)` çalışır, yeni dönem açılır
- → Aktif dönem yoksa: doğrudan yeni dönem oluşturulur

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.seed.donemler`: unshift (yeni dönem objesi — `durum:'aktif'`, yeni id/n/lbl)
- `APP.seed.sdDonemler`: unshift (dept ekranı dönem seçici)
- `APP.seed.saDonemler`: unshift (muhasebe ekranı dönem seçici)
- `APP.data.donemButce`: unshift (yeni dönem bütçe satırı)
- `APP.ui.aktifDon`: yeni id'ye güncellenir

**📬 BİLDİRİMLER:**
- `_pushNotif('s', 'bl', 'Yeni Dönem Açıldı', ...)` — saha'ya
- `_pushNotif('d', 'bl', 'Yeni Dönem Açıldı', ...)` — dept'e

---

### 9B — Dönem Kapama

**🟢 TETİKLEYİCİ:** Muhasebe kullanıcısı "Dönem Kapat" butonu → `_dnKapamaModal(id)` → modalda "Kapat"

**📞 FONKSİYON ZİNCİRİ:**
- `_dnKapamaModal(donemId)` → modal açar (bekleyen sayısı gösterir)
- `_dnKapamaUygula()` → `donemKapa(donemId, sebep)` çağırır
- `donemKapa(donemId, sebep)`:
  1. Rol kontrolü (sadece muhasebe)
  2. Kiralama hariç bekleyen varsa `notif` ile engel + return
  3. Kiralama bekleyen varsa `confirm()` — kullanıcı kararı
  4. Açık avans varsa `_pushNotif('m', 'am', ...)` uyarı
  5. Dönem durumunu günceller (kapali, bitis, kapanmaTarihi, kapayanKisi)

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.seed.donemler[i].durum`: `'kapali'`, `bitis`, `kapanmaTarihi`, `kapayanKisi` güncellenir
- `APP.seed.sdDonemler[i].aktif`: `false`
- `APP.seed.saDonemler[i].aktif`: `false`

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
- `accBekleyen` içindeki her item için (avans ve Kiralama hariç): `olusturmaZamani` kontrolü
  - ≥ 7 gün: `pasifOnaylar` listesine alır → `fisler.durum = 'onaylandi'`, `accGecmis` push, `accBekleyen` splice
  - ≥ 6 gün (7-1): `uyariVerildi` flag'i yoksa muhasebe'ye yaklaşıyor bildirimi

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.fisler[i].durum`: `'onaylandi'`
- `APP.data.accBekleyen`: splice (7 gün dolmuş itemlar)
- `APP.data.accGecmis`: push (`pasifOnay:true` field'ı ile — geç işlem değil)

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
- Callback içinde orijinal işlem + `gecIslem:true` field'ları accGecmis kaydına eklenir

**💾 KOLEKSIYON GÜNCELLEMELERİ:**
- `APP.data.accGecmis`: push — `gecIslem:true`, `gecIslemSebep:string`, `gecIslemDonem:number` field'ları ile
- `APP.seed.donemler[i].gecIslemSayisi`: `+= 1`
- Orijinal işlemin tüm koleksiyon güncellemeleri de yapılır (fisler.durum, accBekleyen splice vb.)

**📬 BİLDİRİMLER:** Orijinal akışın bildirimleri aynen devam eder

**⚠️ KRİTİK KURAL:**
- `gecIslem`, `gecIslemSebep`, `gecIslemDonem` field'ları accGecmis'e yazıldıktan sonra silinemez, override edilemez
- Saha ve dept kapanmış dönemde işlem yapamaz — deptOnayla/deptReddet/deptKismi ve _addToDeptBekleyen'in başında engel var

---

## KRİTİK BULGULAR

Bu akışları yazarken tespit edilen, STATUS.md'ye eklenecek riskler:

1. **Kiralama ceza tutarı persistent değil:** Render-time hesaplanıyor, geçmişe bakmak zor.

2. **Muhasebe → Dept direkt avans akışı eksik:** Faz 2'ye not edildi.

---

*Son teyit: index.html toplam satır sayısı ~10300+ (26.04.2026 itibarıyla).*
