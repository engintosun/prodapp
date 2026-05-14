---
## DURUM: A1–A5 TAMAMLANDI (14 May 2026)
Tüm fonksiyon rename batch'leri uygulandı. Kalan: B (APP.data/APP.ui key rename + localStorage migration), C (enum value rename + migration script).
---

# NAMING INVENTORY — English Refactor

**Tarih:** 2026-05-08 (güncelleme: 2026-05-08)  
**Kapsam:** `index.html` + `modules/` ağacı (muhasebe.js, dept.js, saha.js, donem.js, core/*)  
**Yöntem:** Grep + manuel doğrulama. UI metin stringleri (label, placeholder, toast) kapsam dışıdır.  
**Ek dosyalar:** `CALLMAP-P0.md` (★ fonksiyon çağrı haritası)  
**Kod değişikliği:** Yok — envanter only.

---

## 1. Functions

Tam liste. Öncelik (★) = başka fonksiyon/ID/class ile coupling yüksek, dikkatli rename gerekir.

| Mevcut | Önerilen İngilizce | Notlar |
|---|---|---|
| `renderSahaButce` | `renderFieldBudget` | — |
| `renderSahaKatLimits` | `renderFieldCategoryLimits` | — |
| `renderRecent` | `renderRecent` | ✅ zaten İngilizce |
| `renderDept` | `renderDept` | ✅ |
| `renderDeptDonemSec` | `renderDeptPeriodSelector` | — |
| `sdSetDonem` | `deptSetPeriod` | `sd` prefix → `dept` |
| `openDeptOCR` | `openDeptOCR` | ✅ |
| `openDeptBelgesiz` | `openDeptDocless` | — |
| `_deptTarih` | `_deptDate` | — |
| `_addToDeptBekleyen` | `_addToDeptPending` | ★ çağrı noktaları çok |
| `_checkButceUyari` | `_checkBudgetWarning` | — |
| `renderDeptOzet` | `renderDeptSummary` | — |
| `_renderDeptBekGecmis` | `_renderDeptPendingHistory` | — |
| `renderDeptBek` | `renderDeptPending` | ★ |
| `_sdToggle` | `_deptToggle` | — |
| `_sdToggleAll` | `_deptToggleAll` | — |
| `_sdUpdateToolbar` | `_deptUpdateToolbar` | — |
| `deptOnaylaSecili` | `deptApproveSelected` | ★ onclick |
| `deptReddetSecili` | `deptRejectSelected` | ★ onclick |
| `renderDeptEkip` | `renderDeptCrew` | — |
| `renderDeptAvans` | `renderDeptAdvance` | — |
| `sdAvansFormAc` | `deptAdvanceFormOpen` | — |
| `sdAvansFormKapat` | `deptAdvanceFormClose` | — |
| `sdAvansEkle` | `deptAdvanceAdd` | — |
| `_kiraDurum` | `_rentalStatus` | — |
| `_kiraCeza` | `_rentalPenalty` | — |
| `renderDeptKira` | `renderDeptRental` | — |
| `deptKiraIade` | `deptRentalReturn` | ★ onclick |
| `renderAccKira` | `renderAccRental` | — |
| `accKiraIade` | `accRentalReturn` | ★ onclick |
| `renderAccAvans` | `renderAccAdvance` | — |
| `saAvansSetDonem` | `accAdvanceSetPeriod` | — |
| `accAvansOpenKisi` | `accAdvanceOpenPerson` | — |
| `sdTab` | `deptTab` | — |
| `sdGecmisSetDonem` | `deptHistorySetPeriod` | — |
| `renderDeptGecmis` | `renderDeptHistory` | — |
| `deptOnayla` | `deptApprove` | ★ |
| `deptReddet` | `deptReject` | ★ |
| `deptKismi` | `deptPartial` | ★ |
| `deptAvansOnayla` | `deptAdvanceApprove` | ★ |
| `deptAvansReddet` | `deptAdvanceReject` | ★ |
| `_avSortDesc` | `_advanceSortDesc` | — |
| `_avGecmisEkle` | `_advanceHistoryAdd` | — |
| `avansRedOnay` | `advanceRejectConfirm` | — |
| `avansRedIptal` | `advanceRejectCancel` | — |
| `demoVeriOnay` | `demoDataConfirm` | — |
| `_katHarcanan` | `_categorySpent` | — |
| `_katBekleyen` | `_categoryPending` | — |
| `_checkKatLimit` | `_checkCategoryLimit` | — |
| `renderSohbetListesi` | `renderChatList` | ★ |
| `openSohbet` | `openChat` | ★ |
| `closeSohbet` | `closeChat` | — |
| `_sohbetMarkRead` | `_chatMarkRead` | — |
| `_renderSohbetIci` | `_renderChatBody` | — |
| `sohbetGonder` | `chatSend` | ★ onclick |
| `sicAutoResize` | `chatInputAutoResize` | — |
| `sicKeydown` | `chatInputKeydown` | — |
| `_scrollSonaMesaj` | `_scrollToLatestMsg` | — |
| `_refreshSohbetListeler` | `_refreshChatLists` | — |
| `renderDeptMesaj` | `renderDeptMessages` | — |
| `renderSuMesaj` | `renderFieldMessages` | — |
| `renderAccMesaj` | `renderAccMessages` | — |
| `_yeniSohbetAliciListe` | `_newChatRecipientList` | — |
| `openYeniSohbetModal` | `openNewChatModal` | ★ onclick |
| `_yeniTabSec` | `_newChatTabSelect` | — |
| `_renderYeniSohbetTabs` | `_renderNewChatTabs` | — |
| `_renderBireyselListe` | `_renderDirectList` | — |
| `_renderGrupForm` | `_renderGroupForm` | — |
| `yeniGrupOlustur` | `createNewGroup` | ★ onclick |
| `startYeniSohbet` | `startNewChat` | ★ onclick |
| `_getSohbetAdi` | `_getChatName` | — |
| `_getSohbetOkunmamis` | `_getChatUnread` | — |
| `_getSonMesaj` | `_getLastMessage` | — |
| `_sohbetFiltre` | `_chatFilter` | — |
| `_sohbetAvHtml` | `_chatAvatarHtml` | — |
| `_fmtSohbetZaman` | `_fmtChatTime` | — |
| `renderDonem` | `renderPeriod` | ★ |
| `yeniDonem` | `newPeriod` | ★ onclick |
| `donemKapa` | `closePeriod` | ★ |
| `_isDonemKapali` | `_isPeriodClosed` | — |
| `openIstisnaIzniModal` | `openExceptionPermitModal` | ★ onclick |
| `donemIstisnaIzniVer` | `grantPeriodException` | ★ onclick |
| `_aktifIstisnaIzni` | `_activeException` | — |
| `_istisnaIzniGecerliMi` | `_isExceptionValid` | — |
| `istisnaIzniIptal` | `cancelException` | ★ onclick |
| `_gecIslemModal` | `_lateEntryModal` | — |
| `_gecIslemUygula` | `_lateEntryApply` | ★ onclick |
| `_dnKapamaModal` | `_periodCloseModal` | — |
| `_dnKapamaUygula` | `_periodCloseApply` | ★ onclick |
| `_checkPasifOnay` | `_checkPassiveApproval` | — |
| `accOnayla` | `accApprove` | ★ |
| `accReddet` | `accReject` | ★ |
| `accKismi` | `accPartial` | ★ |
| `accSupheIsle` | `accSuspicionHandle` | ★ onclick |
| `openAccDeptDetay` | `openAccDeptDetail` | ★ onclick |
| `accDeptTab` | `accDeptTab` | ✅ |
| `_renderAdeptEkip` | `_renderAccDeptCrew` | — |
| `_renderAdeptBek` | `_renderAccDeptPending` | — |
| `_renderAdeptDon` | `_renderAccDeptPeriod` | — |
| `_renderAdeptAvans` | `_renderAccDeptAdvance` | — |
| `_renderAdeptGecmis` | `_renderAccDeptHistory` | — |
| `openAccUyeDetay` | `openAccMemberDetail` | ★ onclick |
| `accUyeTab` | `accMemberTab` | — |
| `_renderAccUyeBek` | `_renderAccMemberPending` | — |
| `_renderAccUyeDon` | `_renderAccMemberPeriod` | — |
| `_renderAccUyeAvans` | `_renderAccMemberAdvance` | — |
| `openUyeProfil` | `openMemberProfile` | ★ onclick |
| `renderDeptBekGecmis` | (dahili — yukarıda) | — |
| `renderNotifModal` | `renderNotificationModal` | — |
| `openNotifModal` | `openNotificationModal` | ★ onclick |
| `markNotifRead` | `markNotifRead` | ✅ |
| `updateNotifBadge` | `updateNotifBadge` | ✅ |
| `_pushNotif` | `_pushNotif` | ✅ |
| `_curDeptName` | `_curDeptName` | (kaldırılabilir) |
| `_formatKiraTarih` | `_formatRentalDate` | — |
| `checkKiralamaBit` | `checkRentalExpiry` | ★ onclick |
| `_showDynPanel` | `_showDynPanel` | ✅ |
| `_hideAllDynPanels` | `_hideAllDynPanels` | ✅ |
| `_resetDynFields` | `_resetDynFields` | ✅ |
| `_detectKatFromFis` | `_detectCategoryFromReceipt` | — |
| `onKatChange` | `onCategoryChange` | ★ onchange |
| `onBKatChange` | `onDoclessCategoryChange` | ★ onchange |
| `checkUlasimLimit` | `checkTransportLimit` | — |
| `checkBUlasimLimit` | `checkDoclessTransportLimit` | — |
| `openBelgesizModal` | `openDoclessModal` | ★ onclick |
| `submitBelgesiz` | `submitDocless` | ★ onclick |
| `submitAvans` | `submitAdvance` | ★ onclick |
| `_mkLog` | `_mkLog` | ✅ |
| `_fmtLogZaman` | `_fmtLogTime` | — |
| `_gunFarki` | `_dayDiff` | — |
| `_todayISO` | `_todayISO` | ✅ |
| `_today` | `_today` | ✅ |
| `_deptTarih` | `_deptDate` | — |
| `fisThumbnail` | `receiptThumbnail` | ★ çok kullanılıyor |
| `submitOCR` | `submitOCR` | ✅ |
| `fillOCR` | `fillOCR` | ✅ |
| `renderAcc` | `renderAcc` | ✅ |
| `renderAccDash` | `renderAccDash` | ✅ |
| `renderAccBek` | `renderAccPending` | — |
| `renderAccSuphe` | `renderAccSuspicion` | — |
| `renderAccRapor` | `renderAccReport` | ★ onclick |
| `_renderAccRaporIc` | `_renderAccReportBody` | — |
| `_raporDeptList` | `_reportDeptList` | — |
| `_saRaporDept` | `_accReportDept` | ★ onclick |
| `_raporDeptDetay` | `_reportDeptDetail` | — |
| `_saRaporDeptBack` | `_accReportDeptBack` | ★ onclick |
| `_raporKat` | `_reportCategory` | — |
| `_raporPersonelList` | `_reportPersonnelList` | — |
| `_saRaporKisi` | `_accReportPerson` | ★ onclick |
| `_saRaporKisiFromDept` | `_accReportPersonFromDept` | ★ onclick |
| `_raporKisiDetay` | `_reportPersonDetail` | — |
| `_saRaporKisiBack` | `_accReportPersonBack` | ★ onclick |
| `_raporDonem` | `_reportPeriod` | — |
| `saTab` | `accTab` | — |
| `saSetDonem` | `accSetPeriod` | — |
| `saRaporToggleDonem` | `accReportTogglePeriod` | ★ onclick |
| `_saDonemSecPills` | `_accPeriodSelectPills` | — |
| `_saRaporDeptBack` | (yukarıda) | — |
| `openAccButceDuzenle` | `openAccBudgetEdit` | ★ onclick |
| `accButceKaydet` | `accBudgetSave` | ★ onclick |
| `_recomputeAccDepts` | `_recomputeAccDepts` | ✅ |
| `_computeRaporPersonel` | `_computePersonnelReport` | — |
| `_computeRaporDeptFis` | `_computeDeptReceiptReport` | — |
| `_raporFisRows` | `_reportReceiptRows` | — |
| `_raporFisGrouped` | `_reportReceiptGrouped` | — |
| `_saOnayBar` | `_accApprovalBar` | — |
| `kismiOnayla` | `partialApprove` | ★ onclick |
| `openKismi` | `openPartial` | ★ onclick |
| `openFisDetay` | `openReceiptDetail` | ★ onclick |
| `_fdetFotoBuyut` | `_receiptPhotoZoom` | — |
| `_fisDetAksiyon` | `_receiptDetailAction` | ★ onclick |
| `renderAccRapor` | (yukarıda) | — |
| `_profilFill` | `_profileFill` | — |
| `openProfil` | `openProfile` | ★ onclick |
| `openSdProfil` | `openDeptProfile` | ★ onclick |
| `openSaProfil` | `openAccProfile` | ★ onclick |
| `submitProfil` | `submitProfile` | ★ onclick |
| `openMarka` | `openBrandSettings` | ★ onclick |
| `_markaKaydet` | `_brandSave` | ★ onclick |
| `_markaLogoRemove` | `_brandLogoRemove` | ★ onclick |
| `_projName` | `_projName` | ✅ |
| `selectProj` | `selectProj` | ✅ |
| `renderProjs` | `renderProjs` | ✅ |
| `goProjectSelect` | `goProjectSelect` | ✅ |
| `fillDemo` | `fillDemo` | ✅ |
| `renderDemo` | `renderDemo` | ✅ |
| `doLogin` | `doLogin` | ✅ |
| `goLogin` | `goLogin` | ✅ |
| `srchList` | `searchList` | — |
| `srchGoTo` | `searchGoTo` | — |
| `openNavSrch` | `openNavSearch` | — |
| `closeNavSrch` | `closeNavSearch` | — |
| `suNav` | `fieldNav` | — |
| `openMesaj` | `openMessage` | ★ onclick |
| `sendMesaj` | `sendMessage` | ★ onclick |

---

## 2. APP Namespace Keys

### APP.data (runtime, localStorage'a yazılır)

| Mevcut | Önerilen | Tip |
|---|---|---|
| `fisler` | `receipts` | Array |
| `deptBekleyen` | `deptPending` | Array |
| `accBekleyen` | `accPending` | Array |
| `deptGecmis` | `deptHistory` | Object keyed by period id |
| `accGecmis` | `accHistory` | Array |
| `accAvansGecmis` | `accAdvanceHistory` | Array |
| `deptAvans` | `deptAdvances` | Array |
| `deptKira` | `deptRentals` | Array |
| `accKiralamalar` | `accRentals` | Array |
| `accDepts` | `accDepts` | ✅ |
| `accSuphe` | `accSuspicion` | Array |
| `donemButce` | `periodBudget` | Array |
| `globalInbox` | `globalInbox` | ✅ |
| `istisnaIzinleri` | `exceptionPermits` | Array |
| `sohbetler` | `chats` | Array |
| `avatars` | `avatars` | ✅ |
| `companyInfo` | `companyInfo` | ✅ |
| `projLogos` | `projLogos` | ✅ |
| `projNames` | `projNames` | ✅ |

### APP.ui (ephemeral screen state)

| Mevcut | Önerilen | Notlar |
|---|---|---|
| `curUser` | `curUser` | ✅ |
| `curUserKey` | `curUserKey` | ✅ |
| `curProj` | `curProj` | ✅ |
| `curDept` | `curDept` | ✅ |
| `aktifDon` | `activePeriod` | ★ çok referans |
| `notiflar` | `notifications` | Array |
| `sdSec` | `deptSelected` | seçili fişler Set |
| `sdMode` | `deptMode` | — |
| `sdSeciliDonem` | `deptSelectedPeriod` | — |
| `sdGecmisPnlDonem` | `deptHistoryPanelPeriod` | — |
| `sdAvansFormAcik` | `deptAdvanceFormOpen` | — |
| `sdMesajKisi` | `deptMessagePerson` | — |
| `saSeciliDonem` | `accSelectedPeriod` | — |
| `saAvansDonem` | `accAdvancePeriod` | — |
| `saRaporTip` | `accReportType` | — |
| `isRec` | `isRec` | ✅ |
| `longTimer` | `longTimer` | ✅ |
| `longFired` | `longFired` | ✅ |
| `speechRecog` | `speechRecog` | ✅ |

### APP.seed (static config)

| Mevcut | Önerilen | Notlar |
|---|---|---|
| `users` | `users` | ✅ |
| `umap` | `umap` | ✅ |
| `projs` | `projs` | ✅ |
| `donemler` | `periods` | ★ çok referans |
| `sdDonemler` | `deptPeriods` | — |
| `saDonemler` | `accPeriods` | — |
| `deptEkip` | `deptCrew` | — |
| `katLimit` | `categoryLimits` | — |

### APP.cache

| Mevcut | Önerilen | Notlar |
|---|---|---|
| `accDeptKatlar` | `accDeptCategories` | — |
| `accRaporPersonel` | `accReportPersonnel` | — |
| `accDeptAvans` | `accDeptAdvances` | — |
| `accDeptDonemler` | `accDeptPeriods` | — |
| `accDeptFis` | `accDeptReceipts` | — |
| `accDeptGecmis` | `accDeptHistory` | — |
| `accDeptUyeler` | `accDeptMembers` | — |
| `accDonemKatlar` | `accPeriodCategories` | — |
| `uyeGecmis` | `memberHistory` | — |

---

## 3. Data Object Field Names

### Fis (receipt) object

| Alan | Önerilen | Notlar |
|---|---|---|
| `id` | `id` | ✅ |
| `tarih` | `date` | ★ çok kullanım |
| `personel` | `person` | ★ |
| `satici` | `vendor` | ★ |
| `kat` | `category` | ★ kısa key — risk yüksek |
| `tutar` | `amount` | ★ |
| `durum` | `status` | ★ |
| `donem` | `period` | ★ |
| `aciklama` | `description` | — |
| `uyari` | `warning` | — |
| `belgesiz` | `docless` | — |
| `gecIslem` | `lateEntry` | — |
| `gecIslemSebep` | `lateEntryreason` | — |
| `gecIslemZaman` | `lateEntryTime` | — |
| `gecIslemci` | `lateEntryBy` | — |
| `duplikat` | `duplicate` | — |
| `redNedeni` | `rejectReason` | — |
| `bolundu` | `split` | — |
| `cocuklar` | `children` | (kısmi onay alt fişleri) |
| `parentId` | `parentId` | ✅ |
| `onayTutar` | `approvedAmount` | — |
| `ekSebep` | `additionalReason` | — |
| `kismiOnayci` | `partialApprover` | — |
| `kismiTutar` | `partialAmount` | — |
| `dept` | `dept` | ✅ |
| `tip` | `type` | `'avans'` enum içinde |
| `thumb` | `thumb` | ✅ |
| `fotos` | `photos` | — |
| `fotoRef` | `photoRef` | — |
| `log` | `log` | ✅ |
| `fisId` | `receiptId` | (dept/acc kayıtlarında) |
| `uye` | `member` | dept kayıtlarında |
| `ini` | `initials` | — |
| `fromKey` | `fromKey` | ✅ |
| `devir` | `carryover` | — |
| `aktarilan` | `transferred` | — |
| `olusturmaZamani` | `createdAt` | — |

### Kira (rental) object

| Alan | Önerilen | Notlar |
|---|---|---|
| `uye` | `member` | — |
| `ini` | `initials` | — |
| `kat` | `category` | — |
| `satici` | `vendor` | — |
| `tutar` | `amount` | — |
| `gunluk` | `dailyRate` | — |
| `bas` | `startDate` | — |
| `bit` | `endDate` | — |
| `iade` | `returned` | — |
| `cezaGun` | `penaltyDays` | — |
| `cezaTutar` | `penaltyAmount` | — |
| `dept` | `dept` | ✅ |
| `deptId` | `deptId` | ✅ |

### Avans (advance) object

| Alan | Önerilen | Notlar |
|---|---|---|
| `uye` | `member` | — |
| `ini` | `initials` | — |
| `tutar` | `amount` | — |
| `tarih` | `date` | — |
| `gerekce` | `justification` | — |
| `durum` | `status` | — |
| `redNedeni` | `rejectReason` | — |
| `dept` | `dept` | ✅ |
| `donem` | `period` | — |
| `fromKey` | `fromKey` | ✅ |

### Donem (period) object

| Alan | Önerilen | Notlar |
|---|---|---|
| `id` | `id` | ✅ |
| `n` | `code` | kısa etiket kodu |
| `lbl` | `label` | — |
| `tarih` | `dateRange` | — |
| `durum` | `status` | — |
| `avans` | `advances` | — |
| `harcama` | `spending` | — |
| `islem` | `transactions` | — |
| `aktif` | `active` | — |

### IstisnaIzin (exception permit) object

| Alan | Önerilen | Notlar |
|---|---|---|
| `id` | `id` | ✅ |
| `donemId` | `periodId` | — |
| `kisiKey` | `personKey` | — |
| `kisiAd` | `personName` | — |
| `sebep` | `reason` | — |
| `sure` | `durationHours` | — |
| `maxAdet` | `maxCount` | — |
| `maxTutar` | `maxAmount` | — |
| `verenKisi` | `grantedBy` | — |
| `verilisTarihi` | `grantedDate` | — |
| `baslangicTs` | `startTs` | — |
| `durum` | `status` | — |
| `girilenAdet` | `enteredCount` | — |
| `girilenTutar` | `enteredAmount` | — |

### Sohbet (chat) object

| Alan | Önerilen | Notlar |
|---|---|---|
| `id` | `id` | ✅ |
| `tip` | `type` | `'bireysel'`/`'grup'` |
| `katilimcilar` | `participants` | — |
| `mesajlar` | `messages` | — |
| `okunanlar` | `readBy` | — |
| `grupAdi` | `groupName` | — |
| `gonderen` | `sender` | mesaj içinde |
| `zaman` | `timestamp` | — |

### Log entry object

| Alan | Önerilen | Notlar |
|---|---|---|
| `aksiyon` | `action` | — |
| `detay` | `detail` | — |
| `zaman` | `timestamp` | — |

### Notif object

| Alan | Önerilen | Notlar |
|---|---|---|
| `id` | `id` | ✅ |
| `tip` | `type` | — |
| `title` | `title` | ✅ |
| `body` | `body` | ✅ |
| `meta` | `meta` | ✅ |

---

## 4. Enum / Constant Values

### `durum` (status) değerleri

| Mevcut | Önerilen | Kullanım |
|---|---|---|
| `'bekleyen'` | `'pending'` | eski/compat |
| `'dept-bekleyen'` | `'dept-pending'` | fis durum |
| `'acc-bekleyen'` | `'acc-pending'` | fis durum |
| `'onaylandi'` | `'approved'` | fis durum |
| `'reddedildi'` | `'rejected'` | fis durum |
| `'bolundu'` | `'split'` | fis durum |
| `'aktif'` | `'active'` | donem + istisna durum |
| `'kapali'` | `'closed'` | donem durum |
| `'iptal'` | `'cancelled'` | istisna durum |
| `'ödendi'` | `'paid'` | avans durum |

### `kat` (category) key değerleri

| Mevcut | Önerilen | Notlar |
|---|---|---|
| `'Yakit'` | `'fuel'` | KAT_IC, SD_KAT_CLR, katLimit anahtarı |
| `'Yiyecek'` | `'food'` | — |
| `'Ekipman'` | `'equipment'` | — |
| `'Sanat'` | `'art'` | — |
| `'Ulasim'` | `'transport'` | — |
| `'Konaklama'` | `'accommodation'` | — |
| `'Kiralama'` | `'rental'` | — |
| `'Diger'` | `'other'` | — |

> ⚠️ **Kritik:** `kat` değerleri birden fazla veri yapısında anahtar olarak kullanılıyor (KAT_IC, SD_KAT_CLR, SD_KAT_LBL, katLimit, filtreler). Tek seferde geçiş yapılmalı.

### Kira durum değerleri (`_kiraDurum` return)

| Mevcut | Önerilen |
|---|---|
| `'aktif'` | `'active'` |
| `'yak'` | `'soon'` |
| `'gec'` | `'overdue'` |
| `'iade'` | `'returned'` |

### `tip` (type) enum değerleri

| Mevcut | Önerilen | Kullanım |
|---|---|---|
| `'avans'` | `'advance'` | accBekleyen.tip |
| `'bireysel'` | `'direct'` | sohbet.tip |
| `'grup'` | `'group'` | sohbet.tip |

### Log `aksiyon` değerleri

| Mevcut | Önerilen |
|---|---|
| `'olusturuldu'` | `'created'` |
| `'onaylandi'` | `'approved'` |
| `'dept-onayladi'` | `'dept-approved'` |
| `'reddedildi'` | `'rejected'` |

### Dept key değerleri (`_B_DEPT_MAP` / `deptId`)

| Mevcut | Önerilen |
|---|---|
| `'yapim'` | `'production'` |
| `'kamera'` | `'camera'` |
| `'sanat'` | `'art'` |
| `'ses'` | `'sound'` |
| `'kostum'` | `'costume'` |
| `'diger'` | `'other'` |

### `kaynak` değerleri

| Mevcut | Önerilen | Kullanım |
|---|---|---|
| `'dept'` | `'dept'` | ✅ (role kısaltması) |
| `'acc'` | `'acc'` | ✅ (role kısaltması) |

### Notif / `_pushNotif` tip değerleri

| Mevcut | Önerilen | Renk |
|---|---|---|
| `'gr'` | `'gr'` | ✅ (CSS var --gr) |
| `'am'` | `'am'` | ✅ |
| `'rd'` | `'rd'` | ✅ |
| `'bl'` | `'bl'` | ✅ |

> Bu değerler CSS değişken kısaltmalarıyla eşleşiyor — değiştirmek gerekmez.

---

## 5. Global Constants & Variables

| Mevcut | Önerilen | Notlar |
|---|---|---|
| `FIS_DEMO` | `RECEIPT_DEMO` | demo data array |
| `KAT_IC` | `CATEGORY_ICONS` | icon SVG map |
| `SD_KAT_CLR` | `DEPT_CATEGORY_COLORS` | — |
| `SD_KAT_LBL` | `DEPT_CATEGORY_LABELS` | — |
| `SA_DONEM_DEPTS` | `ACC_PERIOD_DEPTS` | — |
| `_B_DEPT_MAP` | `DOCLESS_DEPT_MAP` | — |
| `_B_DEPT_KEYS` | `DOCLESS_DEPT_KEYS` | — |
| `_DEPT_LBL_MAP` | `DEPT_LABEL_MAP` | — |
| `DOT` | `STATUS_DOT_COLORS` | durum → CSS var map |
| `DYN_PANEL_IDS` | `DYN_PANEL_IDS` | ✅ |
| `_avRedPending` | `_advanceRejectPending` | — |
| `_kismiPending` | `_partialPending` | — |
| `_fisDetCtx` | `_receiptDetailCtx` | — |
| `_istisnaDonemId` | `_exceptionPeriodId` | — |
| `_gecIslemCb` | `_lateEntryCb` | — |
| `_dnKapamaDonemId` | `_periodCloseId` | — |
| `_accDeptId` | `_accDeptId` | ✅ |
| `_aktifSohbetId` | `_activeChatId` | — |
| `_yeniSohbetTab` | `_newChatTab` | — |

---

## 6. HTML Element IDs (Turkish kökler)

Kısa prefix pattern'ı var — prefix anlamları:

| Prefix | Anlam | Önerilen Prefix |
|---|---|---|
| `su-` | saha/field screen | `field-` |
| `sd-` | dept screen | `dept-` |
| `sa-` | acc screen | `acc-` |
| `fis-` | receipt | `receipt-` |
| `don-` | period/donem | `period-` |
| `sic-` | chat inner/sohbet-iç | `chat-` |
| `adept-` | acc dept detail | `acc-dept-` |
| `acuye-` | acc member/uye | `acc-member-` |
| `sdtb-` | dept tab badge | `dept-tab-` |
| `satb-` | acc tab badge | `acc-tab-` |

**Tüm Türkçe ID'ler** (CSS class'larla birlikte — toplam ~130 adet):

`fis-list`, `fis-hd-cnt`, `fis-hd-lbl`, `fis-row`, `don-pills`, `don-prog`, `don-prog-f`, `don-stats`, `don-kapali-banner`, `don-ozel-belgeler`, `su-butce-bar`, `su-kat-bar`, `su-sohbet-liste`, `sd-donem-sec`, `sd-pnl-bek`, `sd-pnl-ekip`, `sd-pnl-avans`, `sd-pnl-kira`, `sd-pnl-gecmis`, `sd-pnl-mesaj`, `sd-bek-ok`, `sd-bek-rd`, `sd-bek-sel-info`, `sd-bek-tb`, `sd-ozet`, `sd-sohbet-liste`, `sdtb-bek`, `sdtb-bek-cnt`, `sdtb-ekip`, `sdtb-avans`, `sdtb-kira`, `sdtb-kira-cnt`, `sdtb-gecmis`, `sdtb-mesaj`, `sdav-tutar`, `sdav-uye`, `sdav-gerekce`, `sa-pnl-bek`, `sa-pnl-avans`, `sa-pnl-kira`, `sa-pnl-rapor`, `sa-pnl-mesaj`, `sa-pnl-suphe`, `sa-pnl-dash`, `sa-sohbet-liste`, `satb-bek`, `satb-bek-cnt`, `satb-avans`, `satb-kira`, `satb-kira-cnt`, `satb-rapor`, `satb-mesaj`, `satb-suphe`, `satb-suphe-cnt`, `satb-dash`, `adept-pnl-bek`, `adept-pnl-ekip`, `adept-pnl-avans`, `adept-pnl-don`, `adept-pnl-gecmis`, `adept-stats`, `adept-title`, `adept-sub`, `adepttb-bek`, `adepttb-ekip`, `adepttb-avans`, `adepttb-don`, `adepttb-gecmis`, `acuye-av`, `acuye-name`, `acuye-rol`, `acuye-stats`, `acuye-pnl-bek`, `acuye-pnl-don`, `acuye-pnl-avans`, `acuyetb-bek`, `acuyetb-don`, `acuyetb-avans`, `tab-donem`, `tab-mesaj`, `b-kat`, `b-tutar`, `b-tarih`, `b-dept`, `b-ko-gece`, `b-ko-kisi`, `b-ym-kisi`, `f-kat`, `f-tutar`, `f-tarih`, `f-fisno`, `av-tutar`, `mbutce`, `mbutce-body`, `mavans`, `mnotif`, `mnotif-body`, `msohbet`, `md-fisdet`, `md-fisdet-title`, `md-donem-kapama`, `md-gec-islem`, `md-istisna-izni`, `md-kismi-tutar`, `md-kismi-red-tutar`, `md-mesaj`, `md-mesaj-kisi`, `md-mesaj-txt`, `md-acc-dept`, `md-acc-uye`, `md-uye`, `gec-islem-info`, `gec-islem-sebep`, `istisna-donem-info`, `istisna-kisi-sel`, `istisna-sebep`, `istisna-sure`, `istisna-max-adet`, `istisna-max-tutar`, `ni-donem`, `ni-mesaj`, `ni-mesaj-dot`, `sic-mesajlar`, `sic-adi`, `sic-av`, `sic-txt`, `uye-av-list`, `uye-don-list`, `uye-hist-list`, `uye-msg-btn`, `uye-prof-av`, `uye-prof-name`, `uye-prof-rol`, `uye-stats`, `galeri-input`, `p-dept`, `p-dept-section`, `p-dept-ekip-list`, `p-dept-sec-hd`, `p-dept-stats`, `kat-inp-*`

---

## 7. CSS Class Names (Turkish kökler)

~200+ class. Prefix pattern aynı (su-, sd-, sa-, fis-, sohbet-, adept-, acuye-).

**Öne çıkan gruplar:**

| Grup | Örnekler | Öneri |
|---|---|---|
| `fis-*` | `fis-row`, `fis-dot`, `fis-amt`, `fis-thumb`, `fis-meta` | `receipt-*` |
| `sd-fis-*` | `sd-fis-row`, `sd-fis-dot`, `sd-fis-tutar`, `sd-fis-satici` | `dept-receipt-*` |
| `sd-butce-*` | `sd-butce-bar-wrap`, `sd-butce-badge`, `sd-butce-kart` | `dept-budget-*` |
| `sd-kat-*` | `sd-kat-kart`, `sd-kat-row`, `sd-kat-dot` | `dept-cat-*` |
| `sd-kira-*` | `sd-kira-card`, `sd-kira-ceza`, `sd-kira-iade` | `dept-rental-*` |
| `sd-gec-*` | `sd-gec-fis-card`, `sd-gec-sebep` | `dept-hist-*` |
| `sd-donem-*` | `sd-donem-pill`, `sd-donem-aktif` | `dept-period-*` |
| `sd-ekip-*` | `sd-ekip-card` | `dept-crew-*` |
| `sohbet-*` | `sohbet-item`, `sohbet-badge`, `sohbet-onizleme` | `chat-*` |
| `don-*` | `don-prog`, `don-pills`, `don-stats` | `period-*` |
| `butce-modal-*` | `butce-modal-row`, `butce-modal-inp` | `budget-modal-*` |
| `avans-btn-*` | `avans-btn`, `avans-btn-sub` | `advance-btn-*` |
| `adept-*` | `adept-uye-row`, `adept-don-card` | `acc-dept-*` |
| `su-kat-*` | `su-kat-bar`, `su-kat-dot`, `su-kat-fill` | `field-cat-*` |

> CSS class rename CSS dosyasında ve innerHTML string'lerinde eş zamanlı yapılmalı.

---

## 8. UI Text Sayımı (Kapsam Dışı)

Türkçe UI string sayısı (label, placeholder, toast, button text):

| Bölge | Tahmini Sayı |
|---|---|
| Modal başlıkları + body text | ~80 |
| Button etiketleri | ~60 |
| Toast mesajları | ~45 |
| Form label / placeholder | ~70 |
| Hata / uyarı metinleri | ~30 |
| **Toplam** | **~285** |

Bu stringler i18n sistemine alınmak üzere ayrı bir pas gerektirir.

---

## 9. Öncelik Matrisi

| Öncelik | Kategori | Risk | İş |
|---|---|---|---|
| P0 | `durum` enum değerleri | 🔴 Yüksek | localStorage'daki verilerle uyumluluk gerekir — migrasyon scripti şart |
| P0 | `kat` enum anahtarları | 🔴 Yüksek | 4 veri yapısında eş zamanlı değişmeli |
| P1 | APP.data.* anahtarları | 🟠 Orta | localStorage key rename → clear veya migration |
| P1 | Function names (★ işaretli) | 🟠 Orta | onclick HTML + JS body birlikte |
| P2 | APP.ui.* / APP.seed.* | 🟡 Düşük | Ephemeral state, localStorage'a yazılmıyor |
| P2 | HTML ID'ler + CSS class'lar | 🟡 Düşük | JS query ve CSS aynı anda |
| P3 | Global constants | 🟢 Minimal | Tek dosya grep-replace |
| P3 | Function names (★ yok) | 🟢 Minimal | — |

---

## 10. Geçiş Notları

1. **localStorage migration:** `durum` enum ve `APP.data.*` key rename'den önce `loadAppData()` içine eski-yeni anahtar şeması migrasyon bloğu ekle.
2. **`kat` key'leri:** `KAT_IC`, `SD_KAT_CLR`, `SD_KAT_LBL`, `katLimit`, tüm `f.kat` filtreleri, dropdown `<option value="">` aynı commit'te.
3. **Modüllerleşme ile koordinasyon:** Adım 7A tamamlandı (muhasebe.js kopyalandı). Rename'ler modül ayrıştırmasından önce mi sonra mı yapılacak kararlaştırılmalı.
4. **Test:** `localStorage.clear()` + hard reload + her 3 rolle tam senaryo.

---

## Section A. Modül Taraması — `modules/` Ağacı

### A.1 muhasebe.js (1533 satır — Adım 7A kopyası)

Tüm fonksiyonlar index.html ile bire bir aynı; sadece export/import katmanı eklenmiş.

**Export edilen fonksiyonlar (21 adet):**

| Fonksiyon | Önerilen | Notlar |
|---|---|---|
| `renderAccKira` | `renderAccRental` | — |
| `accKiraIade` | `accRentalReturn` | onclick bağlı |
| `renderAccAvans` | `renderAccAdvance` | — |
| `saAvansSetDonem` | `accAdvanceSetPeriod` | — |
| `accAvansOpenKisi` | `accAdvanceOpenPerson` | — |
| `saSetDonem` | `accSetPeriod` | — |
| `openAccDeptDetay` | `openAccDeptDetail` | onclick bağlı |
| `accDeptTab` | `accDeptTab` | ✅ |
| `openAccUyeDetay` | `openAccMemberDetail` | onclick bağlı |
| `accUyeTab` | `accMemberTab` | — |
| `renderAcc` | `renderAcc` | ✅ |
| `saTab` | `accTab` | — |
| `openAccButceDuzenle` | `openAccBudgetEdit` | onclick bağlı |
| `accButceKaydet` | `accBudgetSave` | onclick bağlı |
| `renderAccDash` | `renderAccDash` | ✅ |
| `renderAccBek` | `renderAccPending` | — |
| `renderAccSuphe` | `renderAccSuspicion` | — |
| `accSupheIsle` | `accSuspicionHandle` | onclick bağlı |
| `saRaporToggleDonem` | `accReportTogglePeriod` | onclick bağlı |
| `renderAccRapor` | `renderAccReport` | onclick bağlı |
| `renderAccMesaj` | `renderAccMessages` | — |

**Modül-seviyesi değişkenler:**

| Mevcut | Önerilen | Notlar |
|---|---|---|
| `saRaporDeptId` | `accReportDeptId` | — |
| `saRaporKisiIdx` | `accReportPersonIdx` | — |
| `saRaporKisiFrom` | `accReportPersonFrom` | — |
| `saRaporSecilenDonemler` | `accReportSelectedPeriods` | — |
| `_accDeptId` | `_accDeptId` | ✅ |
| `_accUyeName` | `_accMemberName` | — |
| `_accUyeDept` | `_accMemberDept` | — |

**muhasebe.js'de kullanılan APP key'leri** (index.html ile örtüşen — ek fark yok):
`APP.ui.aktifDon` (4 ref), `APP.ui.saSeciliDonem`, `APP.ui.saAvansDonem`, `APP.ui.saRaporTip`, `APP.data.accKiralamalar`, `APP.data.accBekleyen`, `APP.data.accSuphe`, `APP.data.accDepts`, `APP.data.donemButce`, `APP.data.deptKira`, `APP.data.accAvansGecmis`, `APP.seed.donemler`, `APP.seed.saDonemler`, `APP.seed.katLimit`, `APP.cache.*` (8 key)

**muhasebe.js'de kullanılan element ID'leri** (index.html HTML bloğunu referans eder):
`sa-pnl-*` (7), `satb-*` (5), `adept-pnl-*` (5), `adept-*` (4), `acuye-*` (7), `acuyetb-*` (3), `mbutce-body`, `sa-sohbet-liste`

**muhasebe.js'de inline sabit olarak geçen Türkçe literaller:**

```js
var deptler = ['yapim','kamera','sanat','ses','kostum'];
var deptNm  = { yapim:'Yapım', kamera:'Kamera', sanat:'Sanat', ... };
```

Bu local map'ler index.html'deki `_B_DEPT_MAP` ile duplicate — modül geçişinde `constants.js`'teki `DEPT_MAP` ile değiştirilmeli.

**Önemli fark — muhasebe.js'de yeni import bağımlılığı:**
```js
import { _avGecmisEkle, _curDeptName, _avSortDesc } from '../dept/dept.js';
```
Bu üç fonksiyon Türkçe isimli — rename'ler her iki modülde eş zamanlı.

---

### A.2 dept.js — Export edilen fonksiyonlar (36 adet)

index.html ile bire bir; ek fark olarak `deptBekleyenEkle` → `dept.service.js`'e taşındı.

Fonksiyon listesi Section 1'deki tabloyla örtüşüyor. Ek kayıt gerekmez.

---

### A.3 saha.js — Export edilen fonksiyonlar (23 adet)

index.html ile bire bir. `_applyUlasimLimit` ES5 → ES6 geçişinde yeniden adlandırılabilir: `_applyTransportLimit`.

---

### A.4 donem.js — Export edilen fonksiyonlar (12 adet)

| Mevcut | Önerilen |
|---|---|
| `renderDonem` | `renderPeriod` |
| `yeniDonem` | `newPeriod` |
| `donemKapa` | `closePeriod` |
| `_isDonemKapali` | `_isPeriodClosed` |
| `openIstisnaIzniModal` | `openExceptionPermitModal` |
| `donemIstisnaIzniVer` | `grantPeriodException` |
| `_aktifIstisnaIzni` | `_activeException` |
| `_istisnaIzniGecerliMi` | `_isExceptionValid` |
| `istisnaIzniIptal` | `cancelException` |
| `_gecIslemModal` | `_lateEntryModal` |
| `_gecIslemUygula` | `_lateEntryApply` |
| `_dnKapamaModal` | `_periodCloseModal` |
| `_dnKapamaUygula` | `_periodCloseApply` |
| `_checkPasifOnay` | `_checkPassiveApproval` |

---

### A.5 core/utils.js — Export edilen fonksiyonlar (13 adet)

| Mevcut | Önerilen | Notlar |
|---|---|---|
| `_gunFarki` | `_dayDiff` | — |
| `_deptTarih` | `_deptDate` | — |
| `_formatKiraTarih` | `_formatRentalDate` | — |
| `_fmtLogZaman` | `_fmtLogTime` | — |
| `_mkLog(aksiyon, detay)` | `_mkLog(action, detail)` | parametre adları da |
| `_kiraDurum` | `_rentalStatus` | — |
| `_kiraCeza` | `_rentalPenalty` | — |
| `_tr`, `_pad`, `_today`, `_todayISO`, `_projName`, `_setAvEl`, `_svgDonut` | ✅ | değişmez |

---

### A.6 core/services/dept.service.js — Fonksiyonlar (4 adet)

| Mevcut | Önerilen | Notlar |
|---|---|---|
| `deptBekleyenEkle` | `deptPendingAdd` | _addToDeptBekleyen'in servis karşılığı |
| `deptBekleyenSil` | `deptPendingRemove` | — |
| `accBekleyenEkle` | `accPendingAdd` | — |
| `accBekleyenSil` | `accPendingRemove` | — |

---

### A.7 core/services/fis.service.js — Fonksiyonlar (6 adet)

| Mevcut | Önerilen |
|---|---|
| `deptOnayla` | `deptApprove` |
| `deptReddet` | `deptReject` |
| `deptKismi` | `deptPartial` |
| `accOnayla` | `accApprove` |
| `accReddet` | `accReject` |
| `accKismi` | `accPartial` |

---

### A.8 core/services/report.service.js — Fonksiyonlar (3 adet)

| Mevcut | Önerilen |
|---|---|
| `_recomputeAccDepts` | `_recomputeAccDepts` ✅ |
| `_computeRaporDeptFis` | `_computeDeptReceiptReport` |
| `_computeRaporPersonel` | `_computePersonnelReport` |

---

### A.9 core/constants.js — Export edilen sabitler

Mevcut durumda FIS_DURUM objesinin **key'leri** İngilizce ama **value'ları** hâlâ Türkçe:

```js
export var FIS_DURUM = {
  DEPT_BEKLEYEN: 'dept-bekleyen',  // value Türkçe
  ACC_BEKLEYEN:  'acc-bekleyen',
  ONAYLANDI:     'onaylandi',
  REDDEDILDI:    'reddedildi',
  BOLUNDU:       'bolundu'
};
```

Bu yarım geçiş durumu: enum key'leri İngilizce ama kod genelinde `FIS_DURUM` kullanılmıyor, string literal `'onaylandi'` doğrudan yazılıyor. **FIS_DURUM kullanımını tüm koda yayma** P0 önceliğinde.

`DEPT_MAP`, `DEPT_KEYS` value'ları hâlâ Türkçe (`'yapim'`, `'kamera'` vb.) — Section 4'teki dept key rename ile eş zamanlı.

`ROL` objesi: key'ler İngilizce, value'lar role kısaltması (`'user'`, `'dept'`, `'acc'`) — değiştirme gerekmez.

`KATEGORILER` dizisi: value'lar Türkçe key (`'Yakit'`, `'Yiyecek'`...) — kat enum rename ile eş zamanlı.

---

## 11. Çakışma Riski Analizi — Belirsiz Türkçe Kelimeler

Aşağıdaki kelimeler kod içinde **birden fazla bağımsız anlam** taşıyor. Yeniden adlandırma sırasında yanlış bağlamda rename yapılması veri kaybına veya sessiz hataya yol açabilir.

### 11.1 `gec` — 3 farklı anlam

| Kullanım | Mevcut | İngilizce Karşılığı | Örnek |
|---|---|---|---|
| Kira durumu | `'gec'` (kira overdue status) | `'overdue'` | `_kiraDurum(k) === 'gec'` |
| Geçmiş kayıtlar | `gecmis` / `deptGecmis` / `gecmisler` | `history` | `APP.data.deptGecmis` |
| Kapalı döneme geç işlem | `gecIslem` / `_gecIslemModal` | `lateEntry` | `f.gecIslem`, `_gecIslemCb` |

**Risk:** `replace_all` ile `gec` → `overdue` yapılırsa `gecIslem` ve `gecmis` de etkilenir.  
**Kural:** Her üç anlam için farklı arama deseni kullanılmalı. Asla `gec` kökünü tek seferde değiştirme.

### 11.2 `tip` — 4 farklı alan

| Alan | Value örnekleri | İngilizce Karşılığı |
|---|---|---|
| Sohbet tipi | `'bireysel'`, `'grup'` | chat `type` |
| Bekleyen öğe tipi | `'avans'` | item `type` |
| Export tipi | `'saha'`, `'acc-personel'`, `'acc-dept'` | export `type` |
| Rapor tipi | `'dept'`, `'kat'`, `'personel'`, `'donem'` | report `type` |

**Risk:** `tip` her dört alanda da `type` olarak rename edilmeli — ancak value string'lerinin her alan için ayrı enum'a taşınması gerekir; aksi hâlde aynı isimli farklı enum değerleri karışır (örn. `'dept'` hem rapor hem export tipinde var).

### 11.3 `durum` — 5 obje tipinde, farklı value set'leri

| Obje | Olası `durum` değerleri | İngilizce Karşılığı |
|---|---|---|
| `fisler[]` | `dept-bekleyen`, `acc-bekleyen`, `onaylandi`, `reddedildi`, `bolundu` | receipt `status` |
| `seed.donemler[]` | `aktif`, `kapali` | period `status` |
| `istisnaIzinleri[]` | `aktif`, `iptal`, `sureDoldu`, `adetDoldu`, `tutarDoldu` | exception `status` |
| `accAvansGecmis[]` / `deptAvans[]` | `bekleyen`, `ödendi`, `reddedildi` | advance `status` |
| `accSuphe[]` | `bek`, `inc`, `ok`, `red` | suspicion `status` |

**Kritik:** `accSuphe.durum` için `'bek'` ve `'ok'` değerleri **sadece bu objeye özgüdür** ve kısa kısaltmadır; fis'teki `'bekleyen'` ve donem'deki `'aktif'` ile karışmamalı.  
`istisnaIzinleri.durum`'daki `'sureDoldu'`, `'adetDoldu'`, `'tutarDoldu'` değerleri camelCase — diğer objelerdeki snake-style değerlerle tutarsız. Rename sırasında normalize edilebilir: `'duration-exceeded'`, `'count-exceeded'`, `'amount-exceeded'`.

### 11.4 `don` kökü — 2 kavram, aynı prefix

| Kullanım | Örnek | Anlam |
|---|---|---|
| Dönem (period) | `aktifDon`, `sdSeciliDonem`, `donGrp` | financial period |
| Gruplama değişkeni | `var donGrp = {}` | loop grouping temp var |

**Risk:** `donGrp`, `donRec`, `donId` gibi local değişkenler `period`+suffix ile rename edilebilir (`periodGroup`, `periodRecord`, `periodId`) — ancak `donId` element ID prefix'iyle de çakışıyor (`don-pills`, `don-prog`).

### 11.5 `bek` kökü — 3 farklı bağlam

| Kullanım | Örnek | Anlam |
|---|---|---|
| Pending state | `deptBekleyen`, `bekleyen` | waiting/pending |
| Local sayı değişkeni | `var bek = bekMap[u.name] || 0` | count of pending |
| accSuphe kısa kodu | `durum: 'bek'` | suspicion status code |

**Risk:** `bek` → `pending` bulk replace yaparken accSuphe'deki `'bek'` string literal'ı farklı anlam taşıyor — `'pending'` yerine `'flagged'` veya `'open'` daha doğru olabilir.

### 11.6 `kat` kökü — 2 Türkçe anlam, 1 kod anlamı

| Bağlam | Türkçe | Kod anlamı |
|---|---|---|
| `f.kat`, `km.kat` | katman/kategori | expense category key |
| `var kat = document.getElementById('f-kat')` | — | DOM element referansı (yanlış isim; aslında element, değil kategori değeri) |

**Risk düşük** — `kat` kodda yalnızca category anlamında; Türkçedeki "kat" (floor) anlamı hiç kullanılmıyor. Ancak DOM element'i tutan `var kat` değişkeni yanıltıcı — rename: `var katEl`.

---

## 12. Sektörel Terim İncelemesi — İnsan Kararı Gerektiren

Aşağıdaki terimler film prodüksiyon endüstrisine özgü veya uluslararası loan word. Tamamen İngilizleştirme mi, sektörün ortak dili mi kullanılsın — tasarım kararı gerektirir.

### 12.1 Rol adları

| Mevcut (kod) | Mevcut (UI) | Seçenek A (tam İngilizce) | Seçenek B (sektör standardı) | Not |
|---|---|---|---|---|
| `'user'` / `saha` | Saha Personeli | `'field'` / Field Crew | `'crew'` / Crew | "Saha" Türk film endüstrisinde yerleşik |
| `'dept'` / dept | Dept. Sorumlusu | `'dept'` (değişmez) | `'dept'` | Zaten İngilizce kısaltma |
| `'acc'` / muhasebe | Muhasebe | `'acc'` (değişmez) | `'acc'` | Zaten kısaltma |

**Karar noktası:** `'user'` role key'i generik — `'crew'` veya `'field'` daha anlamlı. Ancak localStorage'da `'user'` olarak kayıtlı, migration gerekir.

### 12.2 Departman key'leri

| Mevcut | Seçenek A | Seçenek B | Not |
|---|---|---|---|
| `'yapim'` | `'production'` | `'prod'` | "Yapım" = Production dept |
| `'kamera'` | `'camera'` | `'camera'` | Zaten uluslararası |
| `'sanat'` | `'art'` | `'art'` | Art Dept — uluslararası standart |
| `'ses'` | `'sound'` | `'sound'` | Sound Dept |
| `'kostum'` | `'costume'` | `'costume'` | Costume Dept |
| `'diger'` | `'other'` | `'other'` | — |

**Karar noktası:** `'yapim'` → `'production'` veya `'prod'`? `'prod'` daha kısa ama "production" ile "prodapp" karışabilir.

### 12.3 Kategori key'leri

| Mevcut | Seçenek A | Seçenek B | Not |
|---|---|---|---|
| `'Yakit'` | `'fuel'` | `'fuel'` | Net |
| `'Yiyecek'` | `'food'` | `'catering'` | Film setinde "catering" daha yaygın |
| `'Ekipman'` | `'equipment'` | `'equipment'` | Net |
| `'Sanat'` | `'art'` | `'art-dept'` | "art" tek başına yeterince spesifik mi? |
| `'Ulasim'` | `'transport'` | `'transport'` | Net |
| `'Konaklama'` | `'accommodation'` | `'lodging'` | Her ikisi de yaygın |
| `'Kiralama'` | `'rental'` | `'rental'` | Net |
| `'Diger'` | `'other'` | `'misc'` | "misc" daha kısa |

**Karar noktası:** `'Yiyecek'` → `'food'` mü `'catering'` mi? Film setinde catering ayrı bir departman olduğundan `'food'` daha nötür olabilir.

### 12.4 Loan word'ler — değiştirme gerekmez

| Terim | Neden değişmez |
|---|---|
| `avans` | "advance" ile aynı etimoloji; Türk iş hayatında "avans" standart |
| `fis` | Türkçe "fiş" = receipt; İngilizce karşılığı `receipt` — değişmeli |
| `kira/kiralama` | rental — değişmeli |
| OCR, GIB, PDF | Uluslararası kısaltmalar — değişmez |
| `dept`, `acc` | Zaten İngilizce kısaltma — değişmez |

### 12.5 `GIB` kısaltması

`simGIB()` fonksiyonu ve `GIB` referansları — Gelir İdaresi Başkanlığı (Türk Vergi Otoritesi). Fonksiyon adı İngilizce'ye çevrilmezse anlamını kaybeder:

- `simGIB` → `simTaxVerification` (anlamlı) veya `simGIB` (domain-specific, bırakılabilir)

**Karar noktası:** GIB sistemine özgü bir akış; uluslararası kullanım hedeflenmiyorsa `simGIB` kalabilir, ancak fonksiyon ismi `simulateTaxVerification` daha okunabilir.

### 12.6 `donem` vs "period"

"Dönem" Türk muhasebe terminolojisinde standart. "Period" uluslararası muhasebe terminolojisinde de standart. Bu rename güvenli ve anlamlı.

### 12.7 `satici` — satıcı (vendor)

`f.satici` = receipt vendor/seller. `'vendor'` net ve doğru. Değiştirme gerekli.
