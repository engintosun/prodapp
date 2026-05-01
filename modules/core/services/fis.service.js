// /modules/core/services/fis.service.js
// PRODAPP — Fiş İş Mantığı Servisi (Adım 3 — kopyalama, silme yok)
// Onay zinciri: deptOnayla, deptReddet, deptKismi, accOnayla, accReddet, accKismi
//
// Bağımlılıklar (hâlâ window globals — index.html'den):
//   notif, prompt, _pushNotif, updateNotifBadge,
//   renderDeptBek, renderDeptEkip, renderDeptOzet, renderDept,
//   renderAccBek, renderRecent, closeM,
//   saveAppData, _isDonemKapali, _gecIslemModal, _recomputeAccDepts,
//   _mkLog, _deptTarih, _checkButceUyari, _katHarcanan, _checkKatLimit,
//   _curDeptName, _avRedPending, openM, _avGecmisEkle

import { APP } from '../state.js';

/* ── Dept Onay ────────────────────────────────────────────────────────────── */

export function deptOnayla(id) {
  for (var i = 0; i < APP.data.deptBekleyen.length; i++) {
    if (APP.data.deptBekleyen[i].id === id) {
      var f = APP.data.deptBekleyen[i];
      var _fDon = f.donem !== undefined ? f.donem : APP.ui.aktifDon;
      if (_isDonemKapali(_fDon)) {
        notif('Bu dönem kapanmış. Dept rolünde işlem yapılamaz. Muhasebeye yönlendirin.', 'red');
        return;
      }
      APP.data.deptBekleyen.splice(i, 1);
      var ob = APP.data.donemButce.find(function(x){ return x.donem === APP.ui.aktifDon; });
      if (ob) {
        ob.harcanan += f.tutar;
        var obt = 0;
        for (var oi = 0; oi < APP.data.deptBekleyen.length; oi++) obt += APP.data.deptBekleyen[oi].tutar;
        _checkButceUyari(ob, obt);
      }
      f.log = f.log || [];
      f.log.push(_mkLog('onaylandi', ''));
      if (!APP.data.deptGecmis[2]) APP.data.deptGecmis[2] = { onaylandi:[], reddedildi:[] };
      APP.data.deptGecmis[2].onaylandi.push({ id:f.id, uye:f.uye||'', ini:f.ini||'', satici:f.satici||'', kat:f.kat||'Diger', tutar:f.tutar, tarih:f.tarih||_deptTarih(), log:f.log });
      var _fi = -1;
      for (var _fli = 0; _fli < APP.data.fisler.length; _fli++) {
        if (APP.data.fisler[_fli].id === f.fisId) { _fi = _fli; break; }
      }
      if (_fi !== -1) APP.data.fisler[_fi].durum = 'acc-bekleyen';
      f.log.push(_mkLog('dept-onayladi', ''));
      APP.data.accBekleyen.unshift({
        id: Date.now() + Math.floor(Math.random()*1000),
        fisId: f.fisId || null,
        dept: _curDeptName(),
        uye: f.uye, ini: f.ini,
        satici: f.satici, kat: f.kat,
        tutar: f.tutar, tarih: f.tarih,
        belgesiz: !!f.belgesiz, uyari: f.uyari || '',
        aciklama: f.aciklama || '', fotos: f.fotos || [],
        fromKey: f.fromKey || 's', log: f.log,
        donem: _fDon,
        olusturmaZamani: Date.now()
      });
      _pushNotif('m', 'bl', 'Dept Onayı — Yeni Harcama',
        f.satici + ' (₺' + f.tutar.toLocaleString('tr-TR') + ') dept onayından geçti.',
        'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
      var newH = _katHarcanan();
      _checkKatLimit(f.kat, newH[f.kat] || 0);
      updateNotifBadge();
      notif(f.satici + ' onaylandı', 'green');
      saveAppData();
      renderDeptBek();
      renderDeptEkip();
      renderDeptOzet();
      renderAccBek();
      return;
    }
  }
}

export function deptReddet(id) {
  for (var i = 0; i < APP.data.deptBekleyen.length; i++) {
    if (APP.data.deptBekleyen[i].id === id) {
      var f = APP.data.deptBekleyen[i];
      var _fDon2 = f.donem !== undefined ? f.donem : APP.ui.aktifDon;
      if (_isDonemKapali(_fDon2)) {
        notif('Bu dönem kapanmış. Dept rolünde işlem yapılamaz. Muhasebeye yönlendirin.', 'red');
        return;
      }
      var redNedeni = (prompt('Red nedeni girin:') || '').trim();
      if (!redNedeni) { notif('Red nedeni zorunludur — iptal edildi', 'amber'); return; }
      f.log = f.log || [];
      f.log.push(_mkLog('reddedildi', redNedeni));
      APP.data.deptBekleyen.splice(i, 1);
      var rb = APP.data.donemButce.find(function(x){ return x.donem === APP.ui.aktifDon; });
      if (rb) rb.reddedildi += f.tutar;
      if (!APP.data.deptGecmis[APP.ui.aktifDon]) APP.data.deptGecmis[APP.ui.aktifDon] = { onaylandi:[], reddedildi:[] };
      APP.data.deptGecmis[APP.ui.aktifDon].reddedildi.push({
        id: f.id, uye: f.uye || '', ini: f.ini || '',
        satici: f.satici || '', kat: f.kat || 'Diger',
        tutar: f.tutar, tarih: f.tarih || _deptTarih(),
        redNedeni: redNedeni, log: f.log
      });
      var _rfi = -1;
      for (var _rfli = 0; _rfli < APP.data.fisler.length; _rfli++) {
        if (APP.data.fisler[_rfli].id === f.fisId) { _rfi = _rfli; break; }
      }
      if (_rfi !== -1) {
        APP.data.fisler[_rfi].durum = 'reddedildi';
        APP.data.fisler[_rfi].uyari = redNedeni;
      }
      _pushNotif(f.fromKey || 's', 'rd', 'Harcama Reddedildi',
        '₺' + f.tutar.toLocaleString('tr-TR') + ' ' + f.satici + ' harcamanız reddedildi. Neden: ' + redNedeni,
        'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
      updateNotifBadge();
      notif(f.satici + ' reddedildi', 'red');
      saveAppData();
      renderDeptBek();
      renderDeptEkip();
      renderDeptOzet();
      return;
    }
  }
}

export function deptKismi(id, onayTutar, redNedeni) {
  var _i = -1;
  for (var _di = 0; _di < APP.data.deptBekleyen.length; _di++) {
    if (APP.data.deptBekleyen[_di].id === id) { _i = _di; break; }
  }
  if (_i < 0) return;
  var f = APP.data.deptBekleyen[_i];
  var _fDon3 = f.donem !== undefined ? f.donem : APP.ui.aktifDon;
  if (_isDonemKapali(_fDon3)) {
    notif('Bu dönem kapanmış. Dept rolünde işlem yapılamaz. Muhasebeye yönlendirin.', 'red');
    return;
  }
  if (!onayTutar || onayTutar <= 0 || onayTutar >= f.tutar) return;
  if (!redNedeni || !redNedeni.trim()) return;
  var redTutar = f.tutar - onayTutar;

  if (f.fisId) {
    for (var _pfi = 0; _pfi < APP.data.fisler.length; _pfi++) {
      if (APP.data.fisler[_pfi].id === f.fisId) { APP.data.fisler[_pfi].durum = 'bolundu'; break; }
    }
  }
  var _maxId = 0;
  for (var _mi = 0; _mi < APP.data.fisler.length; _mi++) {
    if (APP.data.fisler[_mi].id > _maxId) _maxId = APP.data.fisler[_mi].id;
  }
  var _onayId = _maxId + 1;
  var _redId  = _maxId + 2;
  var _parent = null;
  for (var _pfi2 = 0; _pfi2 < APP.data.fisler.length; _pfi2++) {
    if (APP.data.fisler[_pfi2].id === f.fisId) { _parent = APP.data.fisler[_pfi2]; break; }
  }
  var _baseDonem    = _parent ? _parent.donem    : APP.ui.aktifDon;
  var _baseTarih    = _parent ? _parent.tarih    : '';
  var _basePersonel = _parent ? _parent.personel : f.uye;
  var _baseDept     = _parent ? _parent.dept     : null;

  APP.data.fisler.unshift({ id: _onayId, tarih: _baseTarih, personel: _basePersonel, satici: f.satici, kat: f.kat, tutar: onayTutar, durum: 'acc-bekleyen', donem: _baseDonem, uyari: null, thumb: null, dept: _baseDept, parentFisId: f.fisId || null, kismiTip: 'onay' });
  APP.data.fisler.unshift({ id: _redId,  tarih: _baseTarih, personel: _basePersonel, satici: f.satici, kat: f.kat, tutar: redTutar,  durum: 'reddedildi',  donem: _baseDonem, uyari: redNedeni, thumb: null, dept: _baseDept, parentFisId: f.fisId || null, kismiTip: 'red' });

  APP.data.deptBekleyen.splice(_i, 1);
  if (!APP.data.deptGecmis[APP.ui.aktifDon]) APP.data.deptGecmis[APP.ui.aktifDon] = { onaylandi:[], reddedildi:[] };
  APP.data.deptGecmis[APP.ui.aktifDon].onaylandi.push({ id: _onayId, uye: f.uye, ini: f.ini, satici: f.satici, kat: f.kat, tutar: onayTutar, tarih: f.tarih });
  APP.data.deptGecmis[APP.ui.aktifDon].reddedildi.push({ id: _redId, uye: f.uye, ini: f.ini, satici: f.satici, kat: f.kat, tutar: redTutar, tarih: f.tarih, sebep: redNedeni });

  APP.data.accBekleyen.unshift({
    id: _onayId + 1000, fisId: _onayId,
    dept: _parent && _parent.dept ? _parent.dept : (f.uye || ''),
    uye: f.uye, ini: f.ini, satici: f.satici, kat: f.kat,
    tutar: onayTutar, tarih: f.tarih,
    belgesiz: f.belgesiz || false, uyari: '', fromKey: 'd',
    donem: _fDon3, olusturmaZamani: Date.now()
  });

  var _db = APP.data.donemButce.find(function(x) { return x.donem === APP.ui.aktifDon; });
  if (_db) {
    _db.harcanan   += onayTutar;
    _db.reddedildi += redTutar;
    var _bekTop = 0;
    for (var _bti = 0; _bti < APP.data.deptBekleyen.length; _bti++) _bekTop += APP.data.deptBekleyen[_bti].tutar;
    _checkButceUyari(_db, _bekTop);
  }
  _pushNotif('m', 'bl', 'Yeni Bekleyen — Kısmi Onay', f.uye + ' — ₺' + onayTutar.toLocaleString('tr-TR') + ' (' + f.satici + ') muhasebeye iletildi.', 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
  _pushNotif(f.fromKey || 's', 'rd', 'Kısmi Red', f.satici + ' — ₺' + redTutar.toLocaleString('tr-TR') + ' reddedildi. Neden: ' + redNedeni, 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
  updateNotifBadge();
  saveAppData();
  renderDept();
  closeM('md-kismi');
}

/* ── Acc Onay ─────────────────────────────────────────────────────────────── */

export function accOnayla(id, _gecSebep) {
  var item = null;
  for (var i = 0; i < APP.data.accBekleyen.length; i++) {
    if (APP.data.accBekleyen[i].id === id) { item = APP.data.accBekleyen[i]; break; }
  }
  if (!item) return;
  var _aDon = (item.donem !== undefined) ? item.donem : APP.ui.aktifDon;
  if (!item.tip || item.tip !== 'avans') {
    if (_isDonemKapali(_aDon) && !_gecSebep) {
      _gecIslemModal(_aDon, 'onay', function(sebep) { accOnayla(id, sebep); });
      return;
    }
  }
  APP.data.accBekleyen = APP.data.accBekleyen.filter(function(f){ return f.id !== id; });
  renderAccBek();

  if (item && item.tip === 'avans') {
    _avGecmisEkle({ id: Date.now(), dept: item.dept || _curDeptName(), uye: item.uye, ini: item.ini, tutar: item.tutar, tarih: _deptTarih(), durum: 'ödendi', gerekce: item.gerekce || '', donem: APP.ui.aktifDon });
    var fk = item.fromKey || 's';
    _pushNotif(fk, 'gr', 'Avans Talebiniz Onaylandı ✅', '₺' + item.tutar.toLocaleString('tr-TR') + ' avans talebiniz muhasebe tarafından onaylandı.', 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
    if (fk !== 'd') {
      _pushNotif('d', 'gr', 'Avans Onaylandı — ' + item.uye, '₺' + item.tutar.toLocaleString('tr-TR') + ' avans talebi muhasebe tarafından onaylandı.', 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
    }
    updateNotifBadge();
    notif(item.uye + ' avansı onaylandı', 'green');
  } else {
    if (item) {
      var _found = false;
      if (item.fisId) {
        for (var j = 0; j < APP.data.fisler.length; j++) {
          if (APP.data.fisler[j].id === item.fisId) { APP.data.fisler[j].durum = 'onaylandi'; _found = true; break; }
        }
      }
      if (!_found) {
        for (var j2 = 0; j2 < APP.data.fisler.length; j2++) {
          var fj = APP.data.fisler[j2];
          if (fj.personel === item.uye && fj.satici === item.satici && fj.tutar === item.tutar && fj.tarih === item.tarih) { fj.durum = 'onaylandi'; break; }
        }
      }
      var _aGecEntry = { id: Date.now(), fisId: item.fisId || null, islem: 'onay', onaylayan: APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe', tarih: Date.now(), tutar: item.tutar, kat: item.kat || '', satici: item.satici || '', uye: item.uye, dept: item.dept || '', donem: _aDon };
      if (_gecSebep) {
        _aGecEntry.gecIslem = true; _aGecEntry.gecIslemSebep = _gecSebep; _aGecEntry.gecIslemDonem = _aDon;
        var _gd = APP.seed.donemler.find(function(x) { return x.id === _aDon; });
        if (_gd) _gd.gecIslemSayisi = (_gd.gecIslemSayisi || 0) + 1;
      }
      APP.data.accGecmis.push(_aGecEntry);
      _pushNotif(item.fromKey || 's', 'gr', 'Harcama Onaylandı ✅', item.satici + ' — ₺' + item.tutar.toLocaleString('tr-TR') + ' muhasebe onayından geçti.', 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
      updateNotifBadge();
      renderRecent();
    }
    notif('Harcama onaylandı', 'green');
  }
  saveAppData();
}

export function accReddet(id, _gecSebep) {
  var item = null;
  for (var i = 0; i < APP.data.accBekleyen.length; i++) {
    if (APP.data.accBekleyen[i].id === id) { item = APP.data.accBekleyen[i]; break; }
  }
  if (!item) return;
  var _rDon = (item.donem !== undefined) ? item.donem : APP.ui.aktifDon;

  if (item.tip === 'avans') {
    _avRedPending = { id: id, kaynak: 'acc', _item: item };
    var infoEl = document.getElementById('md-av-red-info');
    if (infoEl) infoEl.textContent = item.uye + ' · ₺' + item.tutar.toLocaleString('tr-TR') + ' · Talep: ' + (item.gerekce || '—');
    var ta = document.getElementById('av-red-nedeni');
    if (ta) ta.value = '';
    openM('md-av-red');
  } else {
    if (_isDonemKapali(_rDon) && !_gecSebep) {
      _gecIslemModal(_rDon, 'red', function(sebep) { accReddet(id, sebep); });
      return;
    }
    var redNedeniAcc = (prompt('Red nedeni girin:') || '').trim();
    if (!redNedeniAcc) { notif('Red nedeni zorunludur — iptal edildi', 'amber'); return; }
    item.log = item.log || [];
    item.log.push(_mkLog('reddedildi', redNedeniAcc));
    APP.data.accBekleyen = APP.data.accBekleyen.filter(function(f){ return f.id !== id; });
    renderAccBek();
    var _rfound = false;
    if (item.fisId) {
      for (var ri = 0; ri < APP.data.fisler.length; ri++) {
        if (APP.data.fisler[ri].id === item.fisId) { APP.data.fisler[ri].durum = 'reddedildi'; APP.data.fisler[ri].uyari = redNedeniAcc; _rfound = true; break; }
      }
    }
    if (!_rfound) {
      for (var ri2 = 0; ri2 < APP.data.fisler.length; ri2++) {
        var rf = APP.data.fisler[ri2];
        if (rf.personel === item.uye && rf.satici === item.satici && rf.tutar === item.tutar && rf.tarih === item.tarih) { rf.durum = 'reddedildi'; rf.uyari = redNedeniAcc; break; }
      }
    }
    var _rGecEntry = { id: Date.now(), fisId: item.fisId || null, islem: 'red', onaylayan: APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe', tarih: Date.now(), tutar: item.tutar, kat: item.kat || '', satici: item.satici || '', uye: item.uye, dept: item.dept || '', donem: _rDon, redNedeni: redNedeniAcc };
    if (_gecSebep) {
      _rGecEntry.gecIslem = true; _rGecEntry.gecIslemSebep = _gecSebep; _rGecEntry.gecIslemDonem = _rDon;
      var _rgd = APP.seed.donemler.find(function(x) { return x.id === _rDon; });
      if (_rgd) _rgd.gecIslemSayisi = (_rgd.gecIslemSayisi || 0) + 1;
    }
    APP.data.accGecmis.push(_rGecEntry);
    _pushNotif(item.fromKey || 's', 'rd', 'Harcama Reddedildi (Muhasebe)', item.satici + ' — ₺' + item.tutar.toLocaleString('tr-TR') + ' muhasebe tarafından reddedildi. Neden: ' + redNedeniAcc, 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
    updateNotifBadge();
    renderRecent();
    notif('Harcama reddedildi', 'red');
    saveAppData();
  }
}

export function accKismi(id, onayTutar, redNedeni, _gecSebep) {
  var _i = -1;
  for (var _ai = 0; _ai < APP.data.accBekleyen.length; _ai++) {
    if (APP.data.accBekleyen[_ai].id === id) { _i = _ai; break; }
  }
  if (_i < 0) return;
  var item = APP.data.accBekleyen[_i];
  if (item.tip === 'avans') return;
  var _kDon = (item.donem !== undefined) ? item.donem : APP.ui.aktifDon;
  if (_isDonemKapali(_kDon) && !_gecSebep) {
    _gecIslemModal(_kDon, 'kismi', function(sebep) { accKismi(id, onayTutar, redNedeni, sebep); });
    return;
  }
  if (!onayTutar || onayTutar <= 0 || onayTutar >= item.tutar) return;
  if (!redNedeni || !redNedeni.trim()) return;
  var redTutar = item.tutar - onayTutar;

  if (item.fisId) {
    for (var _pfi = 0; _pfi < APP.data.fisler.length; _pfi++) {
      if (APP.data.fisler[_pfi].id === item.fisId) { APP.data.fisler[_pfi].durum = 'bolundu'; break; }
    }
  }
  var _maxId = 0;
  for (var _mi = 0; _mi < APP.data.fisler.length; _mi++) {
    if (APP.data.fisler[_mi].id > _maxId) _maxId = APP.data.fisler[_mi].id;
  }
  var _onayId = _maxId + 1;
  var _redId  = _maxId + 2;
  var _parent = null;
  for (var _pfi2 = 0; _pfi2 < APP.data.fisler.length; _pfi2++) {
    if (APP.data.fisler[_pfi2].id === item.fisId) { _parent = APP.data.fisler[_pfi2]; break; }
  }
  var _baseDonem    = _parent ? _parent.donem    : APP.ui.aktifDon;
  var _baseTarih    = _parent ? _parent.tarih    : '';
  var _basePersonel = _parent ? _parent.personel : item.uye;
  var _baseDept     = _parent ? _parent.dept     : null;

  APP.data.fisler.unshift({ id: _onayId, tarih: _baseTarih, personel: _basePersonel, satici: item.satici, kat: item.kat, tutar: onayTutar, durum: 'onaylandi',  donem: _baseDonem, uyari: null,      thumb: null, dept: _baseDept, parentFisId: item.fisId || null, kismiTip: 'onay' });
  APP.data.fisler.unshift({ id: _redId,  tarih: _baseTarih, personel: _basePersonel, satici: item.satici, kat: item.kat, tutar: redTutar,  durum: 'reddedildi', donem: _baseDonem, uyari: redNedeni, thumb: null, dept: _baseDept, parentFisId: item.fisId || null, kismiTip: 'red'  });

  APP.data.accBekleyen.splice(_i, 1);

  var _kOnayEntry = { id: Date.now(),     fisId: _onayId, islem: 'onay', onaylayan: APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe', tarih: Date.now(),     tutar: onayTutar, kat: item.kat || '', satici: item.satici || '', uye: item.uye, dept: item.dept || '', donem: _kDon };
  var _kRedEntry  = { id: Date.now() + 1, fisId: _redId,  islem: 'red',  onaylayan: APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe', tarih: Date.now() + 1, tutar: redTutar,  kat: item.kat || '', satici: item.satici || '', uye: item.uye, dept: item.dept || '', donem: _kDon, redNedeni: redNedeni };
  if (_gecSebep) {
    _kOnayEntry.gecIslem = true; _kOnayEntry.gecIslemSebep = _gecSebep; _kOnayEntry.gecIslemDonem = _kDon;
    _kRedEntry.gecIslem  = true; _kRedEntry.gecIslemSebep  = _gecSebep; _kRedEntry.gecIslemDonem  = _kDon;
    var _kgd = APP.seed.donemler.find(function(x) { return x.id === _kDon; });
    if (_kgd) _kgd.gecIslemSayisi = (_kgd.gecIslemSayisi || 0) + 1;
  }
  APP.data.accGecmis.push(_kOnayEntry);
  APP.data.accGecmis.push(_kRedEntry);

  _pushNotif('s', 'gr', 'Kısmi Onay ✅',        item.satici + ' — ₺' + onayTutar.toLocaleString('tr-TR') + ' onaylandı.', 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
  _pushNotif('d', 'gr', 'Kısmi Onay (Muhasebe)', item.uye + ' — ' + item.satici + ' kısmi onaylandı.', 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
  _pushNotif('s', 'rd', 'Kısmi Red',             item.satici + ' — ₺' + redTutar.toLocaleString('tr-TR') + ' reddedildi. Neden: ' + redNedeni, 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
  _pushNotif('d', 'rd', 'Kısmi Red (Muhasebe)',  item.uye + ' — ' + item.satici + ' kısmi reddedildi.', 'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
  updateNotifBadge();

  _recomputeAccDepts();
  renderAccBek();
  renderRecent();
  saveAppData();
  closeM('md-kismi');
}
