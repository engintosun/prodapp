// /modules/core/services/dept.service.js
// PRODAPP — Dept/Acc Kuyruk Servisi (Adım 3 — kopyalama, silme yok)
// deptBekleyen ve accBekleyen koleksiyonlarına ekleme/çıkarma primitifleri.
//
// Bağımlılıklar (hâlâ window globals — index.html'den):
//   _isPeriodClosed, notif, _checkBudgetWarning, _mkLog, _deptDate,
//   _pushNotif, updateNotifBadge, _activeException, _isExceptionValid,
//   saveAppData, renderDeptPending, renderDeptCrew, renderDeptSummary

import { APP } from '../state.js';

/* ── deptBekleyen ─────────────────────────────────────────────────────────── */

export function deptPendingAdd(satici, kat, tutar, belgesiz, aciklama, fotos, fisId) {
  var uye = APP.ui.curUser ? APP.ui.curUser.name : 'Dept Sorumlusu';
  var ini = APP.ui.curUser ? APP.ui.curUser.ini  : 'DS';

  if (APP.ui.curUser && APP.ui.curUser.role === 'user' && _isPeriodClosed(APP.ui.activePeriod)) {
    var _izin = _activeException(APP.ui.activePeriod, uye);
    if (!_izin || !_isExceptionValid(_izin)) {
      notif('Bu dönem kapanmış. Yeni fiş eklenemez.', 'red');
      return;
    }
    /* İzin geçerli — dept atlayarak doğrudan accBekleyen'e */
    var _effFisId = fisId;
    if (!_effFisId) {
      var _d = new Date();
      var _td = ('0'+_d.getDate()).slice(-2)+'.'+('0'+(_d.getMonth()+1)).slice(-2)+'.'+_d.getFullYear();
      var _nf = {
        id: Date.now(), tarih: _td, personel: uye,
        satici: satici || 'Yeni Harcama', kat: kat || 'Diger', tutar: tutar || 0,
        durum: 'acc-pending', donem: APP.ui.activePeriod,
        uyari: null, thumb: null, belgesiz: !!belgesiz, aciklama: aciklama || '',
        gecIslem: true, istisnaIzniId: _izin.id,
        log: [_mkLog('olusturuldu', 'İstisna izniyle kapalı döneme eklendi')]
      };
      APP.data.receipts.unshift(_nf);
      _effFisId = _nf.id;
    } else {
      for (var _fi = 0; _fi < APP.data.receipts.length; _fi++) {
        if (APP.data.receipts[_fi].id === _effFisId) {
          APP.data.receipts[_fi].durum = 'acc-pending';
          APP.data.receipts[_fi].gecIslem = true;
          APP.data.receipts[_fi].istisnaIzniId = _izin.id;
          break;
        }
      }
    }
    accPendingAdd({
      id: Date.now() + 1, fisId: _effFisId,
      dept: (APP.ui.curUser && APP.ui.curUser.dept) || '',
      uye: uye, ini: ini,
      satici: satici || 'Yeni Harcama', kat: kat || 'Diger',
      tutar: tutar || 0, tarih: _deptDate(), belgesiz: !!belgesiz, uyari: '',
      fromKey: APP.ui.curUserKey || 's', donem: APP.ui.activePeriod,
      olusturmaZamani: Date.now(), gecIslem: true, istisnaIzniId: _izin.id
    });
    _izin.girilenAdet++;
    _izin.girilenTutar += (tutar || 0);
    if (_izin.maxAdet  !== null && _izin.girilenAdet  >= _izin.maxAdet)  _izin.durum = 'adetDoldu';
    else if (_izin.maxTutar !== null && _izin.girilenTutar >= _izin.maxTutar) _izin.durum = 'tutarDoldu';
    var _dLbl = (APP.seed.periods.find(function(x){return x.id===APP.ui.activePeriod;})||{lbl:'Dönem'}).lbl;
    _pushNotif('m', 'am', 'İstisna İzni — Yeni Fiş',
      uye + ', ' + _dLbl + ' için fiş ekledi. (İzinli giriş)', 'Az önce · Sistem');
    updateNotifBadge();
    saveAppData();
    notif('Fiş istisna izniyle muhasebe onayına gönderildi', 'amber');
    return;
  }

  APP.data.deptPending.unshift({
    id: Date.now(), uye: uye, ini: ini, fisId: fisId || null,
    satici: satici || 'Yeni Harcama',
    kat: kat || 'Diger',
    tutar: tutar || 0,
    tarih: _deptDate(),
    uyari: null,
    belgesiz: !!belgesiz,
    aciklama: aciklama || '',
    fotos: fotos || [],
    donem: APP.ui.activePeriod,
    olusturmaZamani: Date.now(),
    log: [_mkLog('olusturuldu', 'Harcama bildirildi')]
  });
  var _cb = APP.data.periodBudget.find(function(x){ return x.donem === APP.ui.activePeriod; });
  if (_cb) {
    var _cbt = 0;
    for (var _ci = 0; _ci < APP.data.deptPending.length; _ci++) _cbt += APP.data.deptPending[_ci].tutar;
    _checkBudgetWarning(_cb, _cbt);
  }
  renderDeptPending();
  renderDeptCrew();
  renderDeptSummary();
  deptTab('bek', document.getElementById('sdtb-bek'));
}

export function deptPendingRemove(id) {
  var idx = -1;
  for (var i = 0; i < APP.data.deptPending.length; i++) {
    if (APP.data.deptPending[i].id === id) { idx = i; break; }
  }
  if (idx !== -1) APP.data.deptPending.splice(idx, 1);
}

/* ── accBekleyen ──────────────────────────────────────────────────────────── */

export function accPendingAdd(item) {
  APP.data.accPending.unshift(item);
}

export function accPendingRemove(id) {
  APP.data.accPending = APP.data.accPending.filter(function(f) { return f.id !== id; });
}
