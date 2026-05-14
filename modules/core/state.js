// /modules/core/state.js
// PRODAPP — APP Namespace (modülerleşme Adım 2)
//
// ES modüller DOMContentLoaded'dan sonra çalışır.
// window.APP, inline script tarafından zaten kurulmuş ve loadAppData() ile
// localStorage verileriyle doldurulmuş durumdadır.
// Bu adımda mevcut referansı export ediyoruz.
//
// Adım 4+ (inline silme): state.js gerçek kaynak haline gelecek,
// bu yorum bloğu ve window.APP satırı o zaman kaldırılacak.

// Mevcut runtime APP'i export et — overwrite değil, re-export
export var APP = window.APP;

// Uyumluluk: export edilen APP ile window.APP'in aynı referans olduğunu garantile
// (modüller import'a geçtikçe window.APP kullanımı azalacak)
if (typeof window !== 'undefined') {
  window.APP = APP;
}

// ─── Şema referansı (ilk Adımda kopyalanmadı — Adım 4'te buraya taşınacak) ──
//
// APP.data :  receipts, deptPending, accPending, accHistory, deptHistory,
//             accAdvanceHistory, accDepts, accRentals, accSuspicion, deptAdvances,
//             deptRentals, periodBudget, globalInbox, chats, avatars,
//             companyInfo, projNames, projLogos, exceptionPermits
//
// APP.ui   :  curUser, curUserKey, curProj, activePeriod, deptSelected, notifications,
//             deptSelectedPeriod, accSelectedPeriod, deptHistoryPanelPeriod,
//             deptAdvanceFormOpen, deptMessagePerson, deptMode, accAdvancePeriod,
//             accReportType, longTimer, longFired, isRec, speechRecog
//
// APP.seed :  users, umap, projs, periods, deptCrew, deptPeriods,
//             accPeriods, categoryLimits
//
// APP.cache:  accDeptKatlar, accRaporPersonel, accDonemKatlar,
//             uyeGecmis, accDeptUyeler, accDeptDonemler,
//             accDeptAvans, accDeptGecmis, accDeptFis
