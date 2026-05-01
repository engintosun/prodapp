// /modules/core/services/dept.service.js
// PRODAPP — Dept/Acc Kuyruk Servisi (Adım 3 — kopyalama, silme yok)
// deptBekleyen ve accBekleyen koleksiyonlarına ekleme/çıkarma primitifleri.
//
// Bağımlılıklar (hâlâ window globals — index.html'den):
//   _isDonemKapali, notif, _checkButceUyari, _mkLog, _deptTarih,
//   _pushNotif, updateNotifBadge, _aktifIstisnaIzni, _istisnaIzniGecerliMi,
//   saveAppData, renderDeptBek, renderDeptEkip, renderDeptOzet

import { APP } from '../state.js';

/* ── deptBekleyen ─────────────────────────────────────────────────────────── */

export function deptBekleyenEkle(satici, kat, tutar, belgesiz, aciklama, fotos, fisId) {
  var uye = APP.ui.curUser ? APP.ui.curUser.name : 'Dept Sorumlusu';
  var ini = APP.ui.curUser ? APP.ui.curUser.ini  : 'DS';

  if (APP.ui.curUser && APP.ui.curUser.role === 'user' && _isDonemKapali(APP.ui.aktifDon)) {
    var _izin = _aktifIstisnaIzni(APP.ui.aktifDon, uye);
    if (!_izin || !_istisnaIzniGecerliMi(_izin)) {
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
        durum: 'acc-bekleyen', donem: APP.ui.aktifDon,
        uyari: null, thumb: null, belgesiz: !!belgesiz, aciklama: aciklama || '',
        gecIslem: true, istisnaIzniId: _izin.id,
        log: [_mkLog('olusturuldu', 'İstisna izniyle kapalı döneme eklendi')]
      };
      APP.data.fisler.unshift(_nf);
      _effFisId = _nf.id;
    } else {
      for (var _fi = 0; _fi < APP.data.fisler.length; _fi++) {
        if (APP.data.fisler[_fi].id === _effFisId) {
          APP.data.fisler[_fi].durum = 'acc-bekleyen';
          APP.data.fisler[_fi].gecIslem = true;
          APP.data.fisler[_fi].istisnaIzniId = _izin.id;
          break;
        }
      }
    }
    accBekleyenEkle({
      id: Date.now() + 1, fisId: _effFisId,
      dept: (APP.ui.curUser && APP.ui.curUser.dept) || '',
      uye: uye, ini: ini,
      satici: satici || 'Yeni Harcama', kat: kat || 'Diger',
      tutar: tutar || 0, tarih: _deptTarih(), belgesiz: !!belgesiz, uyari: '',
      fromKey: APP.ui.curUserKey || 's', donem: APP.ui.aktifDon,
      olusturmaZamani: Date.now(), gecIslem: true, istisnaIzniId: _izin.id
    });
    _izin.girilenAdet++;
    _izin.girilenTutar += (tutar || 0);
    if (_izin.maxAdet  !== null && _izin.girilenAdet  >= _izin.maxAdet)  _izin.durum = 'adetDoldu';
    else if (_izin.maxTutar !== null && _izin.girilenTutar >= _izin.maxTutar) _izin.durum = 'tutarDoldu';
    var _dLbl = (APP.seed.donemler.find(function(x){return x.id===APP.ui.aktifDon;})||{lbl:'Dönem'}).lbl;
    _pushNotif('m', 'am', 'İstisna İzni — Yeni Fiş',
      uye + ', ' + _dLbl + ' için fiş ekledi. (İzinli giriş)', 'Az önce · Sistem');
    updateNotifBadge();
    saveAppData();
    notif('Fiş istisna izniyle muhasebe onayına gönderildi', 'amber');
    return;
  }

  APP.data.deptBekleyen.unshift({
    id: Date.now(), uye: uye, ini: ini, fisId: fisId || null,
    satici: satici || 'Yeni Harcama',
    kat: kat || 'Diger',
    tutar: tutar || 0,
    tarih: _deptTarih(),
    uyari: null,
    belgesiz: !!belgesiz,
    aciklama: aciklama || '',
    fotos: fotos || [],
    donem: APP.ui.aktifDon,
    olusturmaZamani: Date.now(),
    log: [_mkLog('olusturuldu', 'Harcama bildirildi')]
  });
  var _cb = APP.data.donemButce.find(function(x){ return x.donem === APP.ui.aktifDon; });
  if (_cb) {
    var _cbt = 0;
    for (var _ci = 0; _ci < APP.data.deptBekleyen.length; _ci++) _cbt += APP.data.deptBekleyen[_ci].tutar;
    _checkButceUyari(_cb, _cbt);
  }
  renderDeptBek();
  renderDeptEkip();
  renderDeptOzet();
  sdTab('bek', document.getElementById('sdtb-bek'));
}

export function deptBekleyenSil(id) {
  var idx = -1;
  for (var i = 0; i < APP.data.deptBekleyen.length; i++) {
    if (APP.data.deptBekleyen[i].id === id) { idx = i; break; }
  }
  if (idx !== -1) APP.data.deptBekleyen.splice(idx, 1);
}

/* ── accBekleyen ──────────────────────────────────────────────────────────── */

export function accBekleyenEkle(item) {
  APP.data.accBekleyen.unshift(item);
}

export function accBekleyenSil(id) {
  APP.data.accBekleyen = APP.data.accBekleyen.filter(function(f) { return f.id !== id; });
}
