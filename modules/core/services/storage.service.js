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
    Object.keys(parsed).forEach(function(k) {
      if (APP.data[k] !== undefined) APP.data[k] = parsed[k];
    });
    /* BUG-2 migration: donem field'ı eksik eski kayıtlara aktifDon ata */
    for (var _mi = 0; _mi < APP.data.deptBekleyen.length; _mi++) {
      if (APP.data.deptBekleyen[_mi].donem === undefined)
        APP.data.deptBekleyen[_mi].donem = APP.ui.aktifDon;
    }
    for (var _mj = 0; _mj < APP.data.accBekleyen.length; _mj++) {
      if (APP.data.accBekleyen[_mj].donem === undefined)
        APP.data.accBekleyen[_mj].donem = APP.ui.aktifDon;
    }
    if (!APP.data.istisnaIzinleri) APP.data.istisnaIzinleri = [];
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
