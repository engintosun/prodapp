// /modules/core/services/report.service.js
// PRODAPP — Rapor ve Cache Hesaplama Servisi (Adım 3 — kopyalama, silme yok)

import { APP } from '../state.js';

/* ── Departman Özet (Dashboard) ──────────────────────────────────────────── */

export function _recomputeAccDepts() {
  for (var _ddi = 0; _ddi < APP.data.accDepts.length; _ddi++) {
    var _dept = APP.data.accDepts[_ddi];
    var _mems = APP.cache.accDeptUyeler[_dept.id] || [];
    var _ns = {};
    for (var _mmi = 0; _mmi < _mems.length; _mmi++) _ns[_mems[_mmi].name] = true;
    var _tot = 0, _onay = 0, _bek = 0;
    for (var _ffi = 0; _ffi < APP.data.fisler.length; _ffi++) {
      var _ff = APP.data.fisler[_ffi];
      if (!_ns[_ff.personel]) continue;
      if (_ff.durum === 'bolundu') continue;
      var _tt = _ff.tutar || 0;
      _tot += _tt;
      if      (_ff.durum === 'onaylandi')    _onay += _tt;
      else if (_ff.durum === 'acc-bekleyen') _bek  += _tt;
    }
    _dept.total    = _tot;
    _dept.onay     = _onay;
    _dept.bekleyen = _bek;
  }
}

/* ── Departman Fiş Listesi (Rapor) ──────────────────────────────────────── */

export function _computeRaporDeptFis(deptId) {
  var members = APP.cache.accDeptUyeler[deptId] || [];
  var nameToIni = {};
  for (var _mi = 0; _mi < members.length; _mi++) {
    nameToIni[members[_mi].name] = members[_mi].ini;
  }
  if (!members.length) {
    for (var _ei = 0; _ei < APP.seed.deptEkip.length; _ei++) {
      nameToIni[APP.seed.deptEkip[_ei].name] = APP.seed.deptEkip[_ei].ini;
    }
  }
  var result = [];
  for (var _fi = 0; _fi < APP.data.fisler.length; _fi++) {
    var _f = APP.data.fisler[_fi];
    if (!nameToIni.hasOwnProperty(_f.personel)) continue;
    if (_f.durum === 'bolundu') continue;
    var _dur;
    if      (_f.durum === 'onaylandi')  _dur = 'onay';
    else if (_f.durum === 'reddedildi') _dur = 'red';
    else if (_f.durum === 'dept-bekleyen' || _f.durum === 'acc-bekleyen' || _f.durum === 'bekleyen') _dur = 'bek';
    else _dur = 'bek';
    result.push({
      ini:     nameToIni[_f.personel],
      satici:  _f.satici || '',
      kat:     _f.kat    || 'Diger',
      tutar:   _f.tutar  || 0,
      tarih:   _f.tarih  || '',
      durum:   _dur,
      donem:   _f.donem,
      uyari:   _f.uyari  || '',
      isKismi: !!_f.parentFisId
    });
  }
  var parse = function(t) {
    var p = (t || '').split('.');
    if (p.length !== 3) return 0;
    return new Date(+p[2], +p[1]-1, +p[0]).getTime();
  };
  result.sort(function(a, b) {
    if (a.donem !== b.donem) return b.donem - a.donem;
    return parse(b.tarih) - parse(a.tarih);
  });
  return result;
}

/* ── Personel Raporu ─────────────────────────────────────────────────────── */

export function _computeRaporPersonel() {
  var _katRenkHex = {
    Yakit:'#F59E0B', Yiyecek:'#22C55E', Ekipman:'#3B82F6',
    Sanat:'#E8962E', Ulasim:'#60A5FA', Diger:'#64748B',
    Konaklama:'#8B5CF6', Kiralama:'#F97316', Avans:'#A855F7'
  };
  var _katLblMap = {
    Yakit:'Yakıt', Yiyecek:'Yiyecek', Ekipman:'Ekipman',
    Sanat:'Sanat', Ulasim:'Ulaşım', Diger:'Diğer',
    Konaklama:'Konaklama', Kiralama:'Kiralama', Avans:'Avans'
  };
  var donLbl = {};
  for (var _di = 0; _di < APP.seed.donemler.length; _di++) {
    donLbl[APP.seed.donemler[_di].id] = APP.seed.donemler[_di].lbl;
  }
  var seedMap = {};
  for (var _si = 0; _si < APP.cache.accRaporPersonel.length; _si++) {
    var _sp = APP.cache.accRaporPersonel[_si];
    seedMap[_sp.name] = { ini: _sp.ini, dept: _sp.dept, deptId: _sp.deptId, rol: _sp.rol };
  }
  var nameSet = {};
  for (var _fxi = 0; _fxi < APP.data.fisler.length; _fxi++) {
    var _fpn = APP.data.fisler[_fxi].personel;
    if (_fpn) nameSet[_fpn] = true;
  }
  for (var _exi = 0; _exi < APP.seed.deptEkip.length; _exi++) {
    nameSet[APP.seed.deptEkip[_exi].name] = true;
  }
  var result = [];
  for (var _name in nameSet) {
    var _sd = seedMap[_name] || null;
    var _parts = _name.split(' ');
    var _ini    = _sd ? _sd.ini    : ((_parts[0] ? _parts[0][0] : '') + (_parts[1] ? _parts[1][0] : '')).toUpperCase();
    var _dept   = _sd ? _sd.dept   : 'Yapım';
    var _deptId = _sd ? _sd.deptId : 'yapim';
    var _rol    = _sd ? _sd.rol    : '';
    var _onay = 0, _bek = 0, _red = 0;
    var _donMap = {};
    var _katMap = {};
    for (var _fi = 0; _fi < APP.data.fisler.length; _fi++) {
      var _f = APP.data.fisler[_fi];
      if (_f.personel !== _name) continue;
      if (_f.durum === 'bolundu') continue;
      var _tut = _f.tutar || 0;
      if      (_f.durum === 'onaylandi')  { _onay += _tut; }
      else if (_f.durum === 'reddedildi') { _red  += _tut; }
      else if (_f.durum === 'dept-bekleyen' || _f.durum === 'acc-bekleyen' || _f.durum === 'bekleyen') { _bek += _tut; }
      var _did = _f.donem;
      if (!_donMap[_did]) _donMap[_did] = { total:0, onay:0, bek:0 };
      _donMap[_did].total += _tut;
      if      (_f.durum === 'onaylandi')  _donMap[_did].onay += _tut;
      else if (_f.durum === 'dept-bekleyen' || _f.durum === 'acc-bekleyen' || _f.durum === 'bekleyen') _donMap[_did].bek += _tut;
      var _kn = _f.kat || 'Diger';
      _katMap[_kn] = (_katMap[_kn] || 0) + _tut;
    }
    var _donemler = [];
    for (var _did2 in _donMap) {
      _donemler.push({ _id: +_did2, lbl: donLbl[+_did2] || ('Dönem #' + _did2), total: _donMap[_did2].total, onay: _donMap[_did2].onay, bek: _donMap[_did2].bek });
    }
    _donemler.sort(function(a, b) { return b._id - a._id; });
    for (var _dci = 0; _dci < _donemler.length; _dci++) { delete _donemler[_dci]._id; }
    var _katlar = [];
    for (var _kn2 in _katMap) {
      _katlar.push({ name: _katLblMap[_kn2] || _kn2, tutar: _katMap[_kn2], renk: _katRenkHex[_kn2] || '#64748B' });
    }
    _katlar.sort(function(a, b) { return b.tutar - a.tutar; });
    var _avans = 0;
    for (var _avi = 0; _avi < APP.data.accAvansGecmis.length; _avi++) {
      var _av = APP.data.accAvansGecmis[_avi];
      if (_av.uye === _name && _av.durum === 'ödendi') _avans += _av.tutar;
    }
    result.push({
      name: _name, ini: _ini, dept: _dept, deptId: _deptId, rol: _rol,
      total: _onay + _bek + _red, onay: _onay, bek: _bek, avans: _avans,
      donemler: _donemler, katlar: _katlar
    });
  }
  return result;
}
