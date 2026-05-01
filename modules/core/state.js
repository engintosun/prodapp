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
// APP.data :  fisler, deptBekleyen, accBekleyen, accGecmis, deptGecmis,
//             accAvansGecmis, accDepts, accKiralamalar, accSuphe, deptAvans,
//             deptKira, donemButce, globalInbox, sohbetler, avatars,
//             companyInfo, projNames, projLogos, istisnaIzinleri
//
// APP.ui   :  curUser, curUserKey, curProj, aktifDon, sdSec, notiflar,
//             sdSeciliDonem, saSeciliDonem, sdGecmisPnlDonem,
//             sdAvansFormAcik, sdMesajKisi, sdMode, saAvansDonem,
//             saRaporTip, longTimer, longFired, isRec, speechRecog
//
// APP.seed :  users, umap, projs, donemler, deptEkip, sdDonemler,
//             saDonemler, katLimit
//
// APP.cache:  accDeptKatlar, accRaporPersonel, accDonemKatlar,
//             uyeGecmis, accDeptUyeler, accDeptDonemler,
//             accDeptAvans, accDeptGecmis, accDeptFis
