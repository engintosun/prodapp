// /modules/core/services/storage.service.js
// PRODAPP — Local Storage Servisi (Adım 3 — kopyalama, silme yok)
// index.html'deki orijinal fonksiyonlar yerinde kalır.

import { APP } from '../state.js';

var STORAGE_KEY = 'prodapp-data';

export function saveAppData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(APP.data));
  } catch(e) { console.warn('Kaydetme başarısız:', e); }
}

export function loadAppData() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    var parsed = JSON.parse(raw);
    // --- B1 Migration: eski APP.data key'lerini yenilerine taşı ---
    var _b1Map = {
      fisler:'receipts', deptBekleyen:'deptPending', accBekleyen:'accPending',
      deptGecmis:'deptHistory', accGecmis:'accHistory', accAvansGecmis:'accAdvanceHistory',
      deptAvans:'deptAdvances', deptKira:'deptRentals', accKiralamalar:'accRentals',
      accSuphe:'accSuspicion', donemButce:'periodBudget',
      istisnaIzinleri:'exceptionPermits', sohbetler:'chats'
    };
    for (var _old in _b1Map) {
      if (parsed[_old] !== undefined && parsed[_b1Map[_old]] === undefined) {
        parsed[_b1Map[_old]] = parsed[_old];
        delete parsed[_old];
      }
    }
    // --- /B1 Migration ---
    // --- C1 Migration: receipts.durum enum değerleri Türkçe→İngilizce ---
    var _c1DurumMap = {
      'dept-bekleyen':'dept-pending', 'acc-bekleyen':'acc-pending',
      'onaylandi':'approved', 'reddedildi':'rejected', 'bolundu':'split',
      'bekleyen':'dept-pending'
    };
    if (parsed.receipts && Array.isArray(parsed.receipts)) {
      parsed.receipts.forEach(function(f) {
        if (f.durum && _c1DurumMap[f.durum]) f.durum = _c1DurumMap[f.durum];
      });
    }
    if (parsed.accHistory && Array.isArray(parsed.accHistory)) {
      parsed.accHistory.forEach(function(r) {
        if (r.islem === 'onay') { /* koru — kısa form */ }
        else if (r.islem === 'red') { /* koru — kısa form */ }
      });
    }
    // deptPending ve accPending'de durum field'ı yok — migration gerekmez
    // --- /C1 Migration ---
    // --- C2 Migration: kat enum değerleri Türkçe→İngilizce ---
    var _c2KatMap = {
      'Yakit':'fuel', 'Yiyecek':'food', 'Ekipman':'equipment',
      'Ulasim':'transport', 'Konaklama':'accommodation', 'Kiralama':'rental',
      'Sanat':'art', 'Diger':'other'
    };
    function _c2MigrateKat(arr) {
      if (!Array.isArray(arr)) return;
      arr.forEach(function(item) {
        if (item.kat && _c2KatMap[item.kat]) item.kat = _c2KatMap[item.kat];
      });
    }
    _c2MigrateKat(parsed.receipts);
    _c2MigrateKat(parsed.deptPending);
    _c2MigrateKat(parsed.accPending);
    _c2MigrateKat(parsed.accHistory);
    _c2MigrateKat(parsed.deptRentals);
    _c2MigrateKat(parsed.accRentals);
    _c2MigrateKat(parsed.accSuspicion);
    if (parsed.periodBudget) _c2MigrateKat(parsed.periodBudget);
    if (parsed.categoryLimits) _c2MigrateKat(parsed.categoryLimits);
    // --- /C2 Migration ---
    // --- C3 Migration: avans durum değerleri ---
    var _c3AvansMap = { 'ödendi':'paid', 'bekleyen':'pending' };
    function _c3MigrateAvans(arr) {
      if (!Array.isArray(arr)) return;
      arr.forEach(function(item) {
        if (item.durum && _c3AvansMap[item.durum]) item.durum = _c3AvansMap[item.durum];
      });
    }
    _c3MigrateAvans(parsed.accAdvanceHistory);
    _c3MigrateAvans(parsed.deptAdvances);
    // --- /C3 Migration ---
    // --- C4 Migration: sohbet tip değerleri ---
    if (parsed.chats && Array.isArray(parsed.chats)) {
      parsed.chats.forEach(function(s) {
        if (s.tip === 'bireysel') s.tip = 'direct';
        else if (s.tip === 'grup') s.tip = 'group';
      });
    }
    // --- /C4 Migration ---
    // --- C5 Migration: kira ve dönem durum değerleri ---
    if (parsed.periods && Array.isArray(parsed.periods)) {
      parsed.periods.forEach(function(p) {
        if (p.durum === 'aktif') p.durum = 'active';
      });
    }
    if (parsed.exceptionPermits && Array.isArray(parsed.exceptionPermits)) {
      parsed.exceptionPermits.forEach(function(ex) {
        if (ex.durum === 'aktif') ex.durum = 'active';
      });
    }
    var _c5KiraMap = { 'aktif':'active', 'gec':'overdue', 'yak':'upcoming', 'iade':'returned' };
    function _c5MigrateKira(arr) {
      if (!Array.isArray(arr)) return;
      arr.forEach(function(item) {
        if (item.durum && _c5KiraMap[item.durum]) item.durum = _c5KiraMap[item.durum];
      });
    }
    _c5MigrateKira(parsed.deptRentals);
    _c5MigrateKira(parsed.accRentals);
    // --- /C5 Migration ---
    Object.keys(parsed).forEach(function(k) {
      if (APP.data[k] !== undefined) APP.data[k] = parsed[k];
    });
    /* BUG-2 migration: donem field'ı eksik eski kayıtlara aktifDon ata */
    for (var _mi = 0; _mi < APP.data.deptPending.length; _mi++) {
      if (APP.data.deptPending[_mi].donem === undefined)
        APP.data.deptPending[_mi].donem = APP.ui.activePeriod;
    }
    for (var _mj = 0; _mj < APP.data.accPending.length; _mj++) {
      if (APP.data.accPending[_mj].donem === undefined)
        APP.data.accPending[_mj].donem = APP.ui.activePeriod;
    }
    if (!APP.data.exceptionPermits) APP.data.exceptionPermits = [];
    return true;
  } catch(e) { console.warn('Yükleme başarısız:', e); return false; }
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

/* Geçici global erişim — tüm modüller import'a geçince kaldırılacak */
if (typeof window !== 'undefined') {
  window.saveAppData = saveAppData;
  window.loadAppData = loadAppData;
  window.clearStorage = clearStorage;
}
