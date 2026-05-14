// /modules/dept/dept.js
// PRODAPP — Dept Ekranı (Adım 6 — kopyalama, index.html orijinaller yerinde)
//
// Kapsam: renderDept, fiş listesi (bekleyen/geçmiş), toplu onay/red,
//         tekli onay/red/kısmi, avans yönetimi, kiralama takibi,
//         dönem seçici, ekip listesi, mesaj modal.
//
// Çapraz-rol dönem fonksiyonları modules/saha/donem.js'te.
//
// Bağımlılıklar (window globals — henüz index.html'den):
//   notif, openM, closeM, updateNotifBadge, _pushNotif,
//   _setAvEl,                              (auth bölümünden)
//   _categorySpent, _categoryPending, _checkCategoryLimit,  (saha.js'ten)
//   _checkPassiveApproval, _isPeriodClosed,       (donem.js'ten)
//   _activeException, _isExceptionValid,    (donem.js'ten)
//   openFisDetay, openMemberProfile,           (saha.js'ten)
//   showExportModal,                       (export.js'ten)
//   renderAccBek, renderAccAvans,          (muhasebe bölümünden)
//   renderDeptMessages,                       (sohbet bölümünden)
//   window._avRedPending                          (global var)

import { APP }                              from '../core/state.js';
import { _mkLog, _todayISO, _dayDiff,
         _rentalStatus, _rentalPenalty } from '../core/utils.js';
import { saveAppData }                      from '../core/services/storage.service.js';
import { SD_KAT_CLR, SD_KAT_LBL }          from '../core/constants.js';

/* ═══ YARDIMCILAR ═══ */

var _DEPT_LBL_MAP = {
  Yapim:'Yapım', yapim:'Yapım', Kamera:'Kamera', kamera:'Kamera',
  Sanat:'Sanat', sanat:'Sanat', Ses:'Ses & Müzik', ses:'Ses & Müzik',
  Kostum:'Kostüm & Makyaj', kostum:'Kostüm & Makyaj'
};

export function _curDeptName() {
  if (!APP.ui.curUser) return 'Yapım';
  return _DEPT_LBL_MAP[APP.ui.curUser.dept] || APP.ui.curUser.dept;
}

export function _deptDate() {
  var d = new Date();
  return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth()+1)).slice(-2);
}

export function _advanceSortDesc(arr) {
  return arr.slice().sort(function(a, b) { return (b.id || 0) - (a.id || 0); });
}

export function _advanceHistoryAdd(kayit) {
  APP.data.accAdvanceHistory.unshift(kayit);
  renderDeptAdvance();
  renderAccAvans();
}

/* ═══ AVANS RED MODALI ═══ */

export function advanceRejectConfirm() {
  if (!window._avRedPending) return;
  var ta = document.getElementById('av-red-nedeni');
  var redNedeni = ta ? (ta.value || '').trim() : '';
  if (!redNedeni) { notif('Red nedeni zorunludur', 'red'); return; }

  if (window._avRedPending.kaynak === 'dept') {
    var id = window._avRedPending.id;
    for (var i = 0; i < APP.data.deptAdvances.length; i++) {
      if (APP.data.deptAdvances[i].id === id) {
        var a = APP.data.deptAdvances[i];
        APP.data.deptAdvances.splice(i, 1);
        _advanceHistoryAdd({
          id: Date.now(), dept: _curDeptName(),
          uye: a.uye, ini: a.ini,
          tutar: a.tutar, tarih: _deptDate(),
          durum: 'rejected', gerekce: a.gerekce, redNedeni: redNedeni,
          donem: APP.ui.activePeriod
        });
        _pushNotif(a.fromKey || 's', 'rd', 'Avans Talebi Reddedildi',
          '₺' + a.tutar.toLocaleString('tr-TR') + ' avans talebin dept sorumlusu tarafından reddedildi. Red nedeni: ' + redNedeni,
          'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
        updateNotifBadge();
        notif(a.uye + ' avans talebi reddedildi', 'red');
        break;
      }
    }
  } else if (window._avRedPending.kaynak === 'acc') {
    var item = window._avRedPending._item;
    APP.data.accPending = APP.data.accPending.filter(function(f) { return f.id !== item.id; });
    renderAccBek();
    _advanceHistoryAdd({
      id: Date.now(), dept: item.dept || _curDeptName(),
      uye: item.uye, ini: item.ini,
      tutar: item.tutar, tarih: _deptDate(),
      durum: 'rejected', gerekce: item.gerekce || '', redNedeni: redNedeni,
      donem: APP.ui.activePeriod
    });
    var fkr = item.fromKey || 's';
    _pushNotif(fkr, 'rd', 'Avans Talebiniz Reddedildi',
      '₺' + item.tutar.toLocaleString('tr-TR') + ' avans talebiniz muhasebe tarafından reddedildi. Red nedeni: ' + redNedeni,
      'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
    if (fkr !== 'd') {
      _pushNotif('d', 'am', 'Avans Reddedildi — ' + item.uye,
        '₺' + item.tutar.toLocaleString('tr-TR') + ' avans talebi muhasebe tarafından reddedildi. Red nedeni: ' + redNedeni,
        'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe') + ' (Muhasebe)');
    }
    updateNotifBadge();
    notif(item.uye + ' avansı reddedildi', 'red');
  }

  saveAppData();
  window._avRedPending = null;
  closeM('md-av-red');
}

export function advanceRejectCancel() {
  window._avRedPending = null;
  closeM('md-av-red');
}

export function demoDataConfirm() {
  localStorage.removeItem('prodapp-data');
  location.reload();
}

/* ═══ BÜTÇE EŞİK UYARISI ═══ */

export function _checkBudgetWarning(b, bekTop) {
  var committed = (b.harcanan || 0) + (bekTop || 0);
  var pct  = b.butce > 0 ? (committed / b.butce * 100) : 0;
  var prev = b._lastPct || 0;
  b._lastPct = pct;
  if (pct >= 100 && prev < 100) {
    _pushNotif('d', 'rd', 'Bütçe Limiti Aşıldı!',
      b.lbl + ' bütçesi tamamen tükendi. Yeni harcama yapılmamalı.',
      'Az önce · Sistem');
    _pushNotif('m', 'rd', 'Departman Bütçesi Aşıldı',
      (APP.ui.curUser ? APP.ui.curUser.dept : 'Dept') + ' departmanı ' + b.lbl + ' bütçesini aştı.',
      'Az önce · Sistem');
    updateNotifBadge();
  } else if (pct >= 80 && prev < 80) {
    _pushNotif('d', 'am', 'Bütçe Uyarısı — %' + Math.round(pct),
      b.lbl + ' bütçesinin %' + Math.round(pct) + '\'i kullanıldı. Harcamaları yavaşlatın.',
      'Az önce · Sistem');
    updateNotifBadge();
  }
}

/* ═══ DEPT EKRANI ANA RENDER ═══ */

export function renderDept() {
  _checkPassiveApproval();
  APP.ui.deptSelected = {};
  APP.ui.deptSelectedPeriod = 2;
  var av  = document.getElementById('sd-hd-av');
  var prj = document.getElementById('sd-hd-prj');
  var rol = document.getElementById('sd-hd-role');
  if (APP.ui.curUser && av)  _setAvEl(av, APP.ui.curUser, APP.ui.curUserKey);
  if (APP.ui.curProj && prj) prj.textContent = APP.ui.curProj.name;
  if (APP.ui.curUser && rol) rol.textContent = 'Dept. Sorumlusu · ' + APP.ui.curUser.dept;
  renderDeptPeriodSelector();
  renderDeptSummary();
  renderDeptCrew();
  renderDeptAdvance();
  renderDeptRental();
  deptTab('bek', document.getElementById('sdtb-bek'));
}

/* ── Dönem Seçici ── */

export function renderDeptPeriodSelector() {
  var el = document.getElementById('sd-donem-sec');
  if (!el) return;
  el.innerHTML = APP.seed.deptPeriods.map(function(d) {
    var on  = APP.ui.deptSelectedPeriod === d.id ? ' on' : '';
    var sub = d.aktif
      ? '<div class="sd-donem-aktif">● Aktif</div>'
      : '<div class="sd-donem-pill-sub">' + d.tarih + '</div>';
    return '<button class="sd-donem-pill' + on + '" onclick="deptSetPeriod(' + d.id + ')">' +
      '<div class="sd-donem-pill-lbl">' + d.lbl + '</div>' + sub +
    '</button>';
  }).join('');
}

export function deptSetPeriod(id) {
  APP.ui.deptSelectedPeriod = id;
  renderDeptPeriodSelector();
  renderDeptSummary();
  renderDeptPending();
}

export function openDeptOCR() {
  APP.ui.deptMode = true;
  openOCR(0, null);
}

export function openDeptDocless() {
  APP.ui.deptMode = true;
  openDoclessModal();
}

/* ═══ DEPT BEKLEYENLERİ EKLEME ═══ */

export function _addToDeptPending(satici, kat, tutar, belgesiz, aciklama, fotos, fisId) {
  var uye = APP.ui.curUser ? APP.ui.curUser.name : 'Dept Sorumlusu';
  var ini = APP.ui.curUser ? APP.ui.curUser.ini  : 'DS';

  /* Kapalı dönem — istisna izni kontrolü */
  if (APP.ui.curUser && APP.ui.curUser.role === 'user' && _isPeriodClosed(APP.ui.activePeriod)) {
    var _izin = _activeException(APP.ui.activePeriod, uye);
    if (!_izin || !_isExceptionValid(_izin)) {
      notif('Bu dönem kapanmış. Yeni fiş eklenemez.', 'red'); return;
    }
    /* İzin geçerli — dept atlayarak doğrudan accBekleyen'e */
    var _effFisId = fisId;
    if (!_effFisId) {
      var _d = new Date();
      var _td = ('0'+_d.getDate()).slice(-2)+'.'+('0'+(_d.getMonth()+1)).slice(-2)+'.'+_d.getFullYear();
      var _nf = {
        id: Date.now(), tarih: _td, personel: uye,
        satici: satici || 'Yeni Harcama', kat: kat || 'other', tutar: tutar || 0,
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
    APP.data.accPending.unshift({
      id: Date.now() + 1, fisId: _effFisId,
      dept: (APP.ui.curUser && APP.ui.curUser.dept) || '',
      uye: uye, ini: ini,
      satici: satici || 'Yeni Harcama', kat: kat || 'other',
      tutar: tutar || 0, tarih: _deptDate(), belgesiz: !!belgesiz, uyari: '',
      fromKey: APP.ui.curUserKey || 's', donem: APP.ui.activePeriod,
      olusturmaZamani: Date.now(), gecIslem: true, istisnaIzniId: _izin.id
    });
    _izin.girilenAdet++;
    _izin.girilenTutar += (tutar || 0);
    if      (_izin.maxAdet  !== null && _izin.girilenAdet  >= _izin.maxAdet)  _izin.durum = 'adetDoldu';
    else if (_izin.maxTutar !== null && _izin.girilenTutar >= _izin.maxTutar) _izin.durum = 'tutarDoldu';
    var _dLbl = (APP.seed.periods.find(function(x){ return x.id === APP.ui.activePeriod; }) || { lbl:'Dönem' }).lbl;
    _pushNotif('m', 'am', 'İstisna İzni — Yeni Fiş',
      uye + ', ' + _dLbl + ' için fiş ekledi. (İzinli giriş)', 'Az önce · Sistem');
    updateNotifBadge();
    saveAppData();
    notif('Fiş istisna izniyle muhasebe onayına gönderildi', 'amber');
    return;
  }

  APP.data.deptPending.unshift({
    id: Date.now(), uye: uye, ini: ini, fisId: fisId || null,
    satici: satici || 'Yeni Harcama', kat: kat || 'other',
    tutar: tutar || 0, tarih: _deptDate(), uyari: null,
    belgesiz: !!belgesiz, aciklama: aciklama || '', fotos: fotos || [],
    donem: APP.ui.activePeriod, olusturmaZamani: Date.now(),
    log: [_mkLog('olusturuldu', 'Harcama bildirildi')]
  });

  /* Bütçe eşik kontrolü */
  var _cb = APP.data.periodBudget.find(function(x) { return x.donem === APP.ui.activePeriod; });
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

/* ═══ DEPT ÖZET DASHBOARD ═══ */

export function renderDeptSummary() {
  var el = document.getElementById('sd-ozet');
  if (!el) return;

  /* Aktif dönem — canlı progress + kategori limitleri */
  if (APP.ui.deptSelectedPeriod === 2) {
    var b = APP.data.periodBudget.find(function(x) { return x.donem === APP.ui.activePeriod; });
    if (!b) { el.innerHTML = ''; return; }
    var bekTop = 0;
    for (var i = 0; i < APP.data.deptPending.length; i++) bekTop += APP.data.deptPending[i].tutar;
    var committed = b.harcanan + bekTop;
    var kalan     = Math.max(0, b.butce - committed);
    var pct       = b.butce > 0 ? Math.min(100, Math.round(committed / b.butce * 100)) : 0;
    var pctExact  = b.butce > 0 ? (committed / b.butce * 100).toFixed(1) : '0.0';
    var durum, barClr, kartCls, badgeCls;
    if (pct >= 100)      { durum = 'Limit Aşıldı!';        barClr = 'var(--rd)'; kartCls = 'bk-rd'; badgeCls = 'bk-rd'; }
    else if (pct >= 80)  { durum = '⚠ %' + pct + ' Dolu'; barClr = 'var(--am)'; kartCls = 'bk-am'; badgeCls = 'bk-am'; }
    else                 { durum = '%' + pct + ' Kullanıldı'; barClr = 'var(--gr)'; kartCls = ''; badgeCls = 'bk-ok'; }
    var uyariBan = '';
    if (pct >= 100) {
      uyariBan = '<div class="sd-butce-uyari-ban bk-rd">🔴 Dönem bütçesi tamamen tükendi — muhasebe ile iletişime geçin</div>';
    } else if (pct >= 80) {
      uyariBan = '<div class="sd-butce-uyari-ban bk-am">⚠ Bütçenin %' + pctExact + '\'i kullanıldı — harcamaları yavaşlatın</div>';
    }
    var katH   = _categorySpent();
    var katBek = _categoryPending();
    var katRows = '';
    for (var ki = 0; ki < APP.seed.categoryLimits.length; ki++) {
      var km = APP.seed.categoryLimits[ki];
      if (!km.limit) continue;
      var kHar = katH[km.kat] || 0;
      var kBek = katBek[km.kat] || 0;
      var kTot = kHar + kBek;
      if (!kTot && !km.limit) continue;
      var kPct    = Math.min(100, Math.round(kTot / km.limit * 100));
      var kBarClr = kPct >= 100 ? 'var(--rd)' : kPct >= 80 ? 'var(--am)' : km.clr;
      var kPctClr = kPct >= 100 ? 'var(--rd2)' : kPct >= 80 ? 'var(--am2)' : 'var(--tx3)';
      katRows +=
        '<div class="sd-kat-row">' +
          '<div class="sd-kat-dot" style="background:' + km.clr + '"></div>' +
          '<div class="sd-kat-lbl">' + km.lbl + '</div>' +
          '<div class="sd-kat-bar-wrap"><div class="sd-kat-bar-f" style="width:' + kPct + '%;background:' + kBarClr + '"></div></div>' +
          '<div class="sd-kat-pct" style="color:' + kPctClr + '">%' + kPct + '</div>' +
          '<div class="sd-kat-tutar">₺' + kTot.toLocaleString('tr-TR') + '&nbsp;/&nbsp;₺' + km.limit.toLocaleString('tr-TR') + '</div>' +
        '</div>';
    }
    el.innerHTML =
      '<div class="sd-butce-kart ' + kartCls + '">' +
        '<div class="sd-butce-top">' +
          '<div><div class="sd-butce-lbl">' + b.lbl + ' Bütçesi</div><div class="sd-butce-total">₺' + b.butce.toLocaleString('tr-TR') + '</div></div>' +
          '<span class="sd-butce-badge ' + badgeCls + '">' + durum + '</span>' +
        '</div>' +
        uyariBan +
        '<div class="sd-butce-bar-wrap"><div class="sd-butce-bar-f" style="width:' + pct + '%;background:' + barClr + '"></div></div>' +
        '<div class="sd-butce-stats">' +
          '<div class="sd-butce-stat"><div class="sd-butce-sv" style="color:var(--gr2)">₺' + b.harcanan.toLocaleString('tr-TR') + '</div><div class="sd-butce-sl">Onaylanan</div></div>' +
          '<div class="sd-butce-stat"><div class="sd-butce-sv" style="color:var(--am2)">₺' + bekTop.toLocaleString('tr-TR') + '</div><div class="sd-butce-sl">Bekleyen</div></div>' +
          '<div class="sd-butce-stat"><div class="sd-butce-sv" style="color:' + (kalan === 0 ? 'var(--rd2)' : 'var(--gr2)') + '">₺' + kalan.toLocaleString('tr-TR') + '</div><div class="sd-butce-sl">Kalan</div></div>' +
        '</div>' +
      '</div>' +
      (katRows ? '<div class="sd-kat-kart"><div class="sd-kat-kart-hd">Kategori Limitleri</div>' + katRows + '</div>' : '');
    return;
  }

  /* Geçmiş dönem — statik özet */
  var bp = APP.data.periodBudget.find(function(x) { return x.donem === APP.ui.deptSelectedPeriod; });
  var gec = APP.data.deptHistory[APP.ui.deptSelectedPeriod] || { approved:[], rejected:[] };
  var topOnay = 0, topRed = 0;
  for (var j = 0; j < gec.onaylandi.length;  j++) topOnay += gec.onaylandi[j].tutar;
  for (var k = 0; k < gec.reddedildi.length; k++) topRed  += gec.reddedildi[k].tutar;
  var donRec = null;
  for (var m = 0; m < APP.seed.deptPeriods.length; m++) {
    if (APP.seed.deptPeriods[m].id === APP.ui.deptSelectedPeriod) { donRec = APP.seed.deptPeriods[m]; break; }
  }
  var butce   = bp ? bp.butce   : 0;
  var harcanan = bp ? bp.harcanan : topOnay;
  var pctH    = butce > 0 ? Math.round(harcanan / butce * 100) : 0;

  el.innerHTML =
    '<div class="sd-don-ozet-past">' +
      '<div class="sd-don-ozet-past-lbl">' + (donRec ? donRec.lbl + ' · ' + donRec.tarih : '') + ' — Kapalı Dönem</div>' +
      '<div class="sd-don-stat-grid">' +
        '<div class="sd-don-stat-c"><div class="sd-don-stat-v">₺' + (butce > 0 ? butce.toLocaleString('tr-TR') : '—') + '</div><div class="sd-don-stat-l">Bütçe</div></div>' +
        '<div class="sd-don-stat-c"><div class="sd-don-stat-v" style="color:var(--gr2)">₺' + harcanan.toLocaleString('tr-TR') + '</div><div class="sd-don-stat-l">Onaylanan</div></div>' +
        '<div class="sd-don-stat-c"><div class="sd-don-stat-v" style="color:var(--rd2)">₺' + topRed.toLocaleString('tr-TR') + '</div><div class="sd-don-stat-l">Reddedildi</div></div>' +
        '<div class="sd-don-stat-c"><div class="sd-don-stat-v" style="color:' + (pctH >= 100 ? 'var(--rd2)' : 'var(--tx2)') + '">%' + pctH + '</div><div class="sd-don-stat-l">Kullanım</div></div>' +
      '</div>' +
    '</div>';
}

/* ═══ DEPT BEKLEYENLERİ LİSTESİ ═══ */

export function _renderDeptPendingHistory(el, donemId) {
  var gec = APP.data.deptHistory[donemId] || { approved:[], rejected:[] };
  var on  = gec.onaylandi  || [];
  var red = gec.reddedildi || [];
  var html = '';

  html += '<div class="sd-ges-sec-hd">Onaylananlar (' + on.length + ')</div>';
  if (!on.length) {
    html += '<div style="text-align:center;padding:20px 0;color:var(--tx3);font-size:12px">Onaylanan kayıt yok</div>';
  } else {
    html += on.map(function(f) {
      var lbl = SD_KAT_LBL[f.kat] || f.kat || '';
      return '<div class="sd-ges-row">' +
        '<div class="sd-ges-dot" style="background:var(--gr)"></div>' +
        '<div class="sd-ges-info" style="flex:1">' +
          '<div class="sd-ges-satici">' + f.satici + '</div>' +
          '<div class="sd-ges-meta" style="font-size:11px;color:var(--tx3)">' + f.uye + (lbl ? ' · ' + lbl : '') + ' · ' + f.tarih + '</div>' +
        '</div>' +
        '<div class="sd-ges-right"><div class="sd-ges-tutar" style="font-size:13px;font-weight:700;font-family:var(--mo);color:var(--gr2)">₺' + f.tutar.toLocaleString('tr-TR') + '</div></div>' +
      '</div>';
    }).join('');
  }

  html += '<div class="sd-ges-sec-hd">Reddedilenler (' + red.length + ')</div>';
  if (!red.length) {
    html += '<div style="text-align:center;padding:20px 0;color:var(--tx3);font-size:12px">Reddedilen kayıt yok</div>';
  } else {
    html += red.map(function(f) {
      var lbl = SD_KAT_LBL[f.kat] || f.kat || '';
      return '<div class="sd-ges-row">' +
        '<div class="sd-ges-dot" style="background:var(--rd)"></div>' +
        '<div class="sd-ges-info" style="flex:1">' +
          '<div class="sd-ges-satici">' + f.satici + '</div>' +
          '<div class="sd-ges-meta" style="font-size:11px;color:var(--tx3)">' + f.uye + (lbl ? ' · ' + lbl : '') + ' · ' + f.tarih + '</div>' +
          (f.sebep ? '<div class="sd-ges-sebep">↳ ' + f.sebep + '</div>' : '') +
        '</div>' +
        '<div class="sd-ges-right"><div class="sd-ges-tutar" style="font-size:13px;font-weight:700;font-family:var(--mo);color:var(--rd2)">₺' + f.tutar.toLocaleString('tr-TR') + '</div></div>' +
      '</div>';
    }).join('');
  }

  el.innerHTML = html;
}

export function renderDeptPending() {
  var el  = document.getElementById('sd-pnl-bek');
  if (!el) return;
  var cnt = document.getElementById('sdtb-bek-cnt');

  if (APP.ui.deptSelectedPeriod !== 2) {
    if (cnt) cnt.textContent = '0';
    _renderDeptPendingHistory(el, APP.ui.deptSelectedPeriod);
    return;
  }

  if (cnt) cnt.textContent = APP.data.deptPending.length;

  if (!APP.data.deptPending.length) {
    APP.ui.deptSelected = {};
    el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:13px">✅ Bekleyen harcama yok</div>';
    return;
  }

  var validIds = {};
  for (var vi = 0; vi < APP.data.deptPending.length; vi++) validIds[APP.data.deptPending[vi].id] = true;
  for (var kk in APP.ui.deptSelected) { if (!validIds[kk]) delete APP.ui.deptSelected[kk]; }

  var selCnt = 0, selTop = 0;
  for (var si = 0; si < APP.data.deptPending.length; si++) {
    if (APP.ui.deptSelected[APP.data.deptPending[si].id]) { selCnt++; selTop += APP.data.deptPending[si].tutar; }
  }
  var allSel  = selCnt === APP.data.deptPending.length;
  var partSel = selCnt > 0 && !allSel;
  var infoTxt = selCnt > 0 ? selCnt + ' seçili · ₺' + selTop.toLocaleString('tr-TR') : 'Seçim yok';
  var infoCls = selCnt > 0 ? 'sd-bek-sel-info has-sel' : 'sd-bek-sel-info';
  var btnDis  = selCnt === 0 ? ' disabled style="opacity:.38;pointer-events:none"' : '';
  var cbAllCls = allSel ? 'sd-cb on' : (partSel ? 'sd-cb part' : 'sd-cb');

  var toolbar =
    '<div class="sd-bek-tb" id="sd-bek-tb">' +
      '<div class="sd-bek-tb-r1">' +
        '<div class="sd-bek-cb-row" onclick="_deptToggleAll()">' +
          '<div class="' + cbAllCls + '" id="sd-cb-all"></div>' +
          '<span class="sd-bek-cb-lbl">Tümünü Seç</span>' +
        '</div>' +
        '<span class="' + infoCls + '" id="sd-bek-sel-info">' + infoTxt + '</span>' +
      '</div>' +
      '<div class="sd-bek-tb-r2">' +
        '<button class="sd-ok"' + btnDis + ' onclick="deptApproveSelected()" id="sd-bek-ok">✓ Seçilenleri Onayla</button>' +
        '<button class="sd-rd"' + btnDis + ' onclick="deptRejectSelected()" id="sd-bek-rd">✕ Seçilenleri Reddet</button>' +
      '</div>' +
    '</div>';

  var cards = APP.data.deptPending.map(function(f) {
    var clr    = SD_KAT_CLR[f.kat] || 'var(--tx3)';
    var lbl    = SD_KAT_LBL[f.kat] || f.kat;
    var sel    = !!APP.ui.deptSelected[f.id];
    var cbCls  = 'sd-cb' + (sel ? ' on' : '');
    var fisCls = 'sd-fis' + (sel ? ' secili' : '');
    var extras = '';
    if (f.uyari)    extras += '<div class="sd-fis-uyari">⚠️ ' + f.uyari + '</div>';
    if (f.belgesiz) extras += '<div class="sd-fis-belgesiz">📋 Belgesiz · ' + (f.aciklama || '') + '</div>';
    return '<div class="' + fisCls + '" id="sd-fis-' + f.id + '" onclick="openFisDetay(' + f.id + ',\'dept\')">' +
      '<div class="sd-fis-top">' +
        '<div class="' + cbCls + '" id="sd-cb-' + f.id + '" onclick="event.stopPropagation();_deptToggle(' + f.id + ')"></div>' +
        '<div class="sd-fis-dot" style="background:' + clr + ';margin-top:6px"></div>' +
        '<div class="sd-fis-main">' +
          '<div class="sd-fis-row">' +
            '<div class="sd-fis-satici">' + f.satici + '</div>' +
            '<div class="sd-fis-tutar">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
          '</div>' +
          '<div class="sd-fis-meta">' + f.uye + ' · ' + lbl + ' · ' + f.tarih + '</div>' +
          extras +
        '</div>' +
      '</div>' +
      '<div class="sd-fis-acts">' +
        '<button class="sd-ok" onclick="event.stopPropagation();deptApprove(' + f.id + ')">✓ Onayla</button>' +
        '<button class="sd-rd" onclick="event.stopPropagation();deptReject(' + f.id + ')">✕ Reddet</button>' +
      '</div>' +
    '</div>';
  }).join('');

  el.innerHTML = toolbar + cards;
}

/* ─── Toplu seçim ─── */

export function _deptToggle(id) {
  if (APP.ui.deptSelected[id]) { delete APP.ui.deptSelected[id]; } else { APP.ui.deptSelected[id] = true; }
  var card = document.getElementById('sd-fis-' + id);
  if (card) card.classList.toggle('secili', !!APP.ui.deptSelected[id]);
  var cb = document.getElementById('sd-cb-' + id);
  if (cb) cb.className = 'sd-cb' + (APP.ui.deptSelected[id] ? ' on' : '');
  _deptUpdateToolbar();
}

export function _deptToggleAll() {
  var selCnt = 0;
  for (var i = 0; i < APP.data.deptPending.length; i++) {
    if (APP.ui.deptSelected[APP.data.deptPending[i].id]) selCnt++;
  }
  var selectAll = selCnt < APP.data.deptPending.length;
  APP.ui.deptSelected = {};
  if (selectAll) {
    for (var j = 0; j < APP.data.deptPending.length; j++) APP.ui.deptSelected[APP.data.deptPending[j].id] = true;
  }
  renderDeptPending();
}

export function _deptUpdateToolbar() {
  var selCnt = 0, selTop = 0;
  for (var i = 0; i < APP.data.deptPending.length; i++) {
    if (APP.ui.deptSelected[APP.data.deptPending[i].id]) { selCnt++; selTop += APP.data.deptPending[i].tutar; }
  }
  var allSel  = APP.data.deptPending.length > 0 && selCnt === APP.data.deptPending.length;
  var partSel = selCnt > 0 && !allSel;
  var info    = document.getElementById('sd-bek-sel-info');
  if (info) {
    info.textContent = selCnt > 0 ? selCnt + ' seçili · ₺' + selTop.toLocaleString('tr-TR') : 'Seçim yok';
    info.className   = selCnt > 0 ? 'sd-bek-sel-info has-sel' : 'sd-bek-sel-info';
  }
  var dis = selCnt === 0;
  var ok  = document.getElementById('sd-bek-ok');
  var rd  = document.getElementById('sd-bek-rd');
  if (ok) { ok.disabled = dis; ok.style.opacity = dis ? '.38' : '1'; ok.style.pointerEvents = dis ? 'none' : ''; }
  if (rd) { rd.disabled = dis; rd.style.opacity = dis ? '.38' : '1'; rd.style.pointerEvents = dis ? 'none' : ''; }
  var cbAll = document.getElementById('sd-cb-all');
  if (cbAll) cbAll.className = allSel ? 'sd-cb on' : (partSel ? 'sd-cb part' : 'sd-cb');
}

/* ═══ TOPLU ONAY / RED ═══ */

export function deptApproveSelected() {
  var ids = {};
  for (var kk in APP.ui.deptSelected) { if (APP.ui.deptSelected[kk]) ids[kk] = true; }
  var keys = Object.keys(ids);
  if (!keys.length) { notif('Seçili kayıt yok', 'amber'); return; }
  var cnt = 0, top = 0;
  var ob = APP.data.periodBudget.find(function(x) { return x.donem === APP.ui.activePeriod; });
  if (!APP.data.deptHistory[2]) APP.data.deptHistory[2] = { approved:[], rejected:[] };
  APP.data.deptPending = APP.data.deptPending.filter(function(f) {
    if (!ids[f.id]) return true;
    cnt++; top += f.tutar;
    if (ob) ob.harcanan += f.tutar;
    f.log = f.log || [];
    f.log.push(_mkLog('approved', ''));
    APP.data.deptHistory[2].onaylandi.push({
      id:f.id, uye:f.uye||'', ini:f.ini||'', satici:f.satici||'',
      kat:f.kat||'other', tutar:f.tutar, tarih:f.tarih||_deptDate(), log:f.log
    });
    f.log.push(_mkLog('dept-onayladi', ''));
    APP.data.accPending.unshift({
      id: Date.now() + Math.floor(Math.random()*1000),
      fisId: f.fisId || null, dept: _curDeptName(),
      uye: f.uye, ini: f.ini, satici: f.satici, kat: f.kat,
      tutar: f.tutar, tarih: f.tarih,
      belgesiz: !!f.belgesiz, uyari: f.uyari || '',
      aciklama: f.aciklama || '', fotos: f.fotos || [],
      fromKey: f.fromKey || 's', log: f.log,
      donem: f.donem !== undefined ? f.donem : APP.ui.activePeriod,
      olusturmaZamani: Date.now()
    });
    for (var _fsli = 0; _fsli < APP.data.receipts.length; _fsli++) {
      if (APP.data.receipts[_fsli].id === f.fisId) { APP.data.receipts[_fsli].durum = 'acc-pending'; break; }
    }
    return false;
  });
  if (ob) {
    var bt = 0;
    for (var i = 0; i < APP.data.deptPending.length; i++) bt += APP.data.deptPending[i].tutar;
    _checkBudgetWarning(ob, bt);
  }
  var newH2 = _categorySpent();
  for (var ki = 0; ki < APP.seed.categoryLimits.length; ki++) _checkCategoryLimit(APP.seed.categoryLimits[ki].kat, newH2[APP.seed.categoryLimits[ki].kat] || 0);
  _pushNotif('m', 'bl', 'Dept Onayı — ' + cnt + ' Harcama',
    _curDeptName() + ' departmanı ' + cnt + ' harcamayı (₺' + top.toLocaleString('tr-TR') + ') onayladı. Muhasebe onayına hazır.',
    'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
  APP.ui.deptSelected = {};
  notif(cnt + ' harcama onaylandı · ₺' + top.toLocaleString('tr-TR'), 'green');
  saveAppData();
  renderDeptPending(); renderDeptCrew(); renderDeptSummary(); renderAccBek();
  updateNotifBadge();
}

export function deptRejectSelected() {
  var ids = {};
  for (var kk in APP.ui.deptSelected) { if (APP.ui.deptSelected[kk]) ids[kk] = true; }
  var keys = Object.keys(ids);
  if (!keys.length) { notif('Seçili kayıt yok', 'amber'); return; }
  var redNedeni = (prompt(keys.length + ' harcama için ret nedeni girin:') || '').trim();
  if (!redNedeni) { notif('Red nedeni zorunludur — iptal edildi', 'amber'); return; }
  var cnt = 0, top = 0;
  var rb = APP.data.periodBudget.find(function(x) { return x.donem === APP.ui.activePeriod; });
  if (!APP.data.deptHistory[APP.ui.activePeriod]) APP.data.deptHistory[APP.ui.activePeriod] = { approved:[], rejected:[] };
  var deptAdSoyad = APP.ui.curUser ? APP.ui.curUser.name : 'Dept';
  APP.data.deptPending = APP.data.deptPending.filter(function(f) {
    if (!ids[f.id]) return true;
    cnt++; top += f.tutar;
    if (rb) rb.reddedildi += f.tutar;
    f.log = f.log || [];
    f.log.push(_mkLog('rejected', redNedeni));
    APP.data.deptHistory[APP.ui.activePeriod].reddedildi.push({
      id: f.id, uye: f.uye||'', ini: f.ini||'',
      satici: f.satici||'', kat: f.kat||'other',
      tutar: f.tutar, tarih: f.tarih||_deptDate(), redNedeni: redNedeni, log: f.log
    });
    for (var _srfli = 0; _srfli < APP.data.receipts.length; _srfli++) {
      if (APP.data.receipts[_srfli].id === f.fisId) {
        APP.data.receipts[_srfli].durum = 'rejected';
        APP.data.receipts[_srfli].uyari = redNedeni;
        break;
      }
    }
    _pushNotif(f.fromKey || 's', 'rd', 'Harcama Reddedildi',
      '₺' + f.tutar.toLocaleString('tr-TR') + ' ' + f.satici + ' harcamanız reddedildi. Neden: ' + redNedeni,
      'Az önce · ' + deptAdSoyad + ' (Dept)');
    return false;
  });
  APP.ui.deptSelected = {};
  notif(cnt + ' harcama reddedildi · ₺' + top.toLocaleString('tr-TR'), 'red');
  saveAppData();
  renderDeptPending(); renderDeptCrew(); renderDeptSummary();
}

/* ═══ EKİP LİSTESİ ═══ */

export function renderDeptCrew() {
  var el = document.getElementById('sd-pnl-ekip');
  if (!el) return;
  var bekMap = {};
  for (var i = 0; i < APP.data.deptPending.length; i++) {
    var n = APP.data.deptPending[i].uye;
    bekMap[n] = (bekMap[n] || 0) + 1;
  }
  var rows = APP.seed.deptCrew.map(function(u) {
    var bek = bekMap[u.name] || 0;
    return '<div class="sd-uye" onclick="openMemberProfile(\'' + u.id + '\')">' +
      '<div class="sd-uye-av">' + u.ini + '</div>' +
      '<div>' +
        '<div class="sd-uye-name">' + u.name + '</div>' +
        '<div class="sd-uye-rol">' + u.rol + '</div>' +
      '</div>' +
      '<div class="sd-uye-right">' +
        '<div class="sd-uye-tutar">₺' + u.tutar.toLocaleString('tr-TR') + '</div>' +
        (bek > 0
          ? '<div class="sd-uye-bek">' + bek + ' bekleyen</div>'
          : '<div class="sd-uye-bek0">Bekleyen yok</div>') +
      '</div>' +
    '</div>';
  }).join('');
  el.innerHTML = '<div class="sd-sec">Aktif Dönem · Ekip Harcamaları</div>' +
    '<div class="sd-ekip-card">' + rows + '</div>' +
    '<div class="sd-sec">Toplam Ekip · ' + APP.seed.deptCrew.length + ' kişi</div>';
}

/* ═══ AVANS YÖNETİMİ ═══ */

export function renderDeptAdvance() {
  var el = document.getElementById('sd-pnl-avans');
  if (!el) return;
  var cnt = document.getElementById('sdtb-av-cnt');
  if (cnt) cnt.textContent = APP.data.deptAdvances.length;

  var gecmisAvans = APP.data.accAdvanceHistory.filter(function(av) { return av.dept === 'Yapım'; });
  var gecmisOdendi = 0, gecmisBek = 0, gecmisRed = 0;
  for (var gi = 0; gi < gecmisAvans.length; gi++) {
    var ga = gecmisAvans[gi];
    if (ga.durum === 'paid') gecmisOdendi += ga.tutar;
    else if (ga.durum === 'rejected') gecmisRed += ga.tutar;
    else gecmisBek += ga.tutar;
  }
  var aktifBek = 0;
  for (var ai = 0; ai < APP.data.deptAdvances.length; ai++) aktifBek += APP.data.deptAdvances[ai].tutar;
  var toplamBek = aktifBek + gecmisBek;

  var html =
    '<div class="sd-av-ozet">' +
      '<div class="sd-av-ozet-c"><div class="sd-av-ozet-v" style="color:var(--am2)">₺' + toplamBek.toLocaleString('tr-TR') + '</div><div class="sd-av-ozet-l">Bekleyen</div></div>' +
      '<div class="sd-av-ozet-c"><div class="sd-av-ozet-v" style="color:var(--gr2)">₺' + gecmisOdendi.toLocaleString('tr-TR') + '</div><div class="sd-av-ozet-l">Ödendi</div></div>' +
      '<div class="sd-av-ozet-c"><div class="sd-av-ozet-v">' + (APP.data.deptAdvances.length + gecmisAvans.length) + '</div><div class="sd-av-ozet-l">Toplam</div></div>' +
    '</div>';

  var formHtml;
  if (APP.ui.deptAdvanceFormOpenik) {
    var uyeOpts = APP.seed.deptCrew.map(function(u) {
      return '<option value="' + u.id + '">' + u.name + '</option>';
    }).join('');
    formHtml =
      '<div class="sd-av-form">' +
        '<div class="sd-av-form-hd"><span class="sd-av-form-title">Yeni Avans Talebi</span><button class="btn btn-sm" onclick="deptAdvanceFormClose()" style="padding:4px 10px">✕</button></div>' +
        '<div class="fg"><label class="fg-lbl">Ekip Üyesi</label><select class="fgi" id="sdav-uye" style="width:100%">' + uyeOpts + '</select></div>' +
        '<div class="fg"><label class="fg-lbl">Tutar (₺)</label><input class="fgi" id="sdav-tutar" type="number" placeholder="0" min="0"></div>' +
        '<div class="fg"><label class="fg-lbl">Gerekçe</label><input class="fgi" id="sdav-gerekce" type="text" placeholder="Avans gerekçesi..."></div>' +
        '<button class="btn btn-p btn-full" onclick="deptAdvanceAdd()" style="justify-content:center;margin-top:2px">Avans Talebi Oluştur</button>' +
      '</div>';
  } else {
    formHtml =
      '<button class="btn btn-p" onclick="deptAdvanceFormOpen()" style="margin-bottom:12px;gap:6px">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
        'Yeni Avans Talebi</button>';
  }
  html += formHtml;

  var sortedDeptAv = _advanceSortDesc(APP.data.deptAdvances);
  if (sortedDeptAv.length) {
    var deptAvTop = 0;
    for (var daii = 0; daii < sortedDeptAv.length; daii++) deptAvTop += sortedDeptAv[daii].tutar;
    html += '<div class="sd-sec" style="display:flex;align-items:center;justify-content:space-between;">Saha Onay Bekleyen (' + sortedDeptAv.length + ') · <span style="font-family:var(--mo);color:var(--am2)">₺' + deptAvTop.toLocaleString('tr-TR') + '</span><button style="background:transparent;border:1px solid var(--accent,#E8962E);color:var(--accent,#E8962E);border-radius:8px;padding:4px 10px;font-size:11px;cursor:pointer;" onclick="showExportModal(\'dept-avans\')">⬇ Dışa Aktar</button></div>';
    html += sortedDeptAv.map(function(a) {
      return '<div class="sd-avans-card" id="sd-av-' + a.id + '">' +
        '<div class="sd-av-top">' +
          '<div class="sd-av-kisi"><div class="sd-av-av">' + a.ini + '</div><div class="sd-av-name">' + a.uye + '</div></div>' +
          '<div class="sd-av-tutar">₺' + a.tutar.toLocaleString('tr-TR') + '</div>' +
        '</div>' +
        '<div class="sd-av-meta">' + a.tarih + ' tarihli talep</div>' +
        '<div class="sd-av-gerekce">' + a.gerekce + '</div>' +
        '<div class="sd-fis-acts">' +
          '<button class="sd-ok" onclick="deptAdvanceApprove(' + a.id + ')">✓ Onayla → Muhasebe</button>' +
          '<button class="sd-rd" onclick="deptAdvanceReject(' + a.id + ')">✕ Reddet</button>' +
        '</div>' +
      '</div>';
    }).join('');
    html += '<div style="text-align:right;font-size:11px;color:var(--tx3);padding-bottom:4px">Toplam: <strong style="color:var(--am2)">₺' + deptAvTop.toLocaleString('tr-TR') + '</strong></div>';
  } else {
    html += '<div style="text-align:center;padding:16px 0;color:var(--tx3);font-size:13px">Bekleyen avans talebi yok</div>';
  }

  if (gecmisAvans.length) {
    var donGrp = {};
    for (var di = 0; di < gecmisAvans.length; di++) {
      var dav = gecmisAvans[di];
      var dk  = dav.donem;
      if (!donGrp[dk]) donGrp[dk] = [];
      donGrp[dk].push(dav);
    }
    var donKeys = Object.keys(donGrp).map(Number).sort(function(a,b) { return b-a; });
    var gecmisTopAll = gecmisOdendi + gecmisBek + gecmisRed;
    html += '<div class="sd-av-gec-hd"><span>Avans Geçmişi (' + gecmisAvans.length + ' kayıt)</span><span style="color:var(--tx2)">₺' + gecmisTopAll.toLocaleString('tr-TR') + '</span></div>';
    for (var dki = 0; dki < donKeys.length; dki++) {
      var avDon = donKeys[dki];
      var avRows = _advanceSortDesc(donGrp[avDon]);
      var dkTop = 0;
      for (var ri = 0; ri < avRows.length; ri++) dkTop += avRows[ri].tutar;
      var isAktif = avDon === 2;
      html += '<div class="sd-sec" style="margin-top:10px">Dönem #' + avDon + (isAktif ? ' <span style="color:var(--gr)">● Aktif</span>' : '') + ' · ₺' + dkTop.toLocaleString('tr-TR') + ' · ' + avRows.length + ' avans</div>';
      html += avRows.map(function(av) {
        var clr = av.durum === 'paid' ? 'var(--gr2)' : (av.durum === 'rejected' ? 'var(--rd2)' : 'var(--am2)');
        var ico = av.durum === 'paid' ? '✅' : (av.durum === 'rejected' ? '❌' : '⏳');
        var redSatir = (av.durum === 'rejected' && av.redNedeni)
          ? '<div style="font-size:11px;color:var(--rd2);margin-top:2px">Red nedeni: ' + av.redNedeni + '</div>'
          : '';
        return '<div class="sd-av-gec-row">' +
          '<div class="sd-av-gec-av">' + av.ini + '</div>' +
          '<div class="sd-av-gec-info">' +
            '<div class="sd-av-gec-name">' + av.uye + '</div>' +
            '<div class="sd-av-gec-sub">' + av.tarih + ' · ' + av.gerekce + '</div>' +
            redSatir +
          '</div>' +
          '<div class="sd-av-gec-right">' +
            '<div class="sd-av-gec-tutar">₺' + av.tutar.toLocaleString('tr-TR') + '</div>' +
            '<div class="sd-av-gec-durum" style="color:' + clr + '">' + ico + ' ' + av.durum + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
    html += '<div style="border-top:1px solid var(--bo);padding-top:8px;margin-top:6px;display:flex;justify-content:space-between"><span style="font-size:11px;color:var(--tx3)">Genel Toplam</span><strong style="font-size:12px;font-family:var(--mo)">₺' + gecmisTopAll.toLocaleString('tr-TR') + '</strong></div>';
  }

  el.innerHTML = html;
}

export function deptAdvanceFormOpen()    { APP.ui.deptAdvanceFormOpenik = true;  renderDeptAdvance(); }
export function deptAdvanceFormClose() { APP.ui.deptAdvanceFormOpenik = false; renderDeptAdvance(); }

export function deptAdvanceAdd() {
  var uyeSel    = document.getElementById('sdav-uye');
  var tutarEl   = document.getElementById('sdav-tutar');
  var gerekceEl = document.getElementById('sdav-gerekce');
  if (!uyeSel || !tutarEl || !gerekceEl) return;
  var uyeId   = uyeSel.value;
  var tutar   = parseFloat(tutarEl.value) || 0;
  var gerekce = (gerekceEl.value || '').trim();
  if (!tutar || tutar <= 0) { notif('Tutar giriniz', 'red'); return; }
  if (!gerekce) { notif('Gerekçe giriniz', 'red'); return; }
  var uyeObj = null;
  for (var i = 0; i < APP.seed.deptCrew.length; i++) {
    if (APP.seed.deptCrew[i].id === uyeId) { uyeObj = APP.seed.deptCrew[i]; break; }
  }
  if (!uyeObj) return;

  APP.data.accPending.unshift({
    id: Date.now(), tip: 'avans', dept: _curDeptName(),
    uye: uyeObj.name, ini: uyeObj.ini, satici: 'Avans Talebi (Dept)',
    kat: 'Avans', tutar: tutar, tarih: _deptDate(),
    belgesiz: false, uyari: '', gerekce: gerekce, fromKey: 'd'
  });
  _pushNotif('m', 'am', 'Yeni Avans Talebi (Dept)',
    (APP.ui.curUser ? APP.ui.curUser.name : 'Dept Sorumlusu') + ' · ' + uyeObj.name + ' için ₺' + tutar.toLocaleString('tr-TR') + ' · ' + gerekce,
    'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept'));
  updateNotifBadge();
  APP.ui.deptAdvanceFormOpenik = false;
  renderDeptAdvance();
  renderAccAvans();
  notif('Avans talebi muhasebeye gönderildi', 'green');
  saveAppData();
}

/* ═══ KİRALAMA TAKİBİ ═══ */

export function renderDeptRental() {
  var el = document.getElementById('sd-pnl-kira');
  if (!el) return;
  var today = _todayISO();

  var aktifSay = 0;
  for (var ci = 0; ci < APP.data.deptRentals.length; ci++) {
    if (_rentalStatus(APP.data.deptRentals[ci]) !== 'iade') aktifSay++;
  }
  var cnt = document.getElementById('sdtb-kira-cnt');
  if (cnt) cnt.textContent = aktifSay;

  if (!APP.data.deptRentals.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:13px">Kiralama kaydı yok</div>';
    return;
  }

  var gecmis = [], yaklasan = [], aktif = [], iade = [];
  for (var i = 0; i < APP.data.deptRentals.length; i++) {
    var k   = APP.data.deptRentals[i];
    var dur = _rentalStatus(k);
    if      (dur === 'gec') gecmis.push(k);
    else if (dur === 'yak') yaklasan.push(k);
    else if (dur === 'ak')  aktif.push(k);
    else                    iade.push(k);
  }

  function kiraCard(k) {
    var dur   = _rentalStatus(k);
    var kalan = _dayDiff(today, k.bit);
    var c     = _rentalPenalty(k);
    var tagCls, tagTxt;
    if      (dur === 'gec') { tagCls = 'sd-kira-tag sd-kira-tag-gec'; tagTxt = c.gecGun + ' gün gecikmiş'; }
    else if (dur === 'yak') { tagCls = 'sd-kira-tag sd-kira-tag-yak'; tagTxt = kalan === 0 ? 'Bugün bitiyor' : kalan + ' gün kaldı'; }
    else if (dur === 'ak')  { tagCls = 'sd-kira-tag sd-kira-tag-ak';  tagTxt = kalan + ' gün kaldı'; }
    else                    { tagCls = 'sd-kira-tag sd-kira-tag-iad'; tagTxt = 'İade Edildi'; }
    var cardCls = 'sd-kira-card' + (dur === 'gec' ? ' gec' : dur === 'yak' ? ' yak' : dur === 'iade' ? ' iade' : '');
    var ceza    = dur === 'gec'
      ? '<div class="sd-kira-ceza">⚠ Gecikme: ' + c.gecGun + ' gün × ₺' + k.gunluk.toLocaleString('tr-TR') + ' = ₺' + c.ceza.toLocaleString('tr-TR') + ' olası ceza</div>'
      : '';
    var iadeBtn = dur !== 'iade'
      ? '<button class="sd-ok btn-sm" style="font-size:12px" onclick="deptRentalReturn(' + k.id + ')">✓ İade Edildi</button>'
      : '<span style="font-size:12px;color:var(--tx3)">✓ Teslim Edildi</span>';
    return '<div class="' + cardCls + '">' +
      '<div class="sd-kira-hd">' +
        '<div><div class="sd-kira-sat">' + k.satici + '</div><div class="sd-kira-kat">' + k.kat + ' · ' + k.uye + '</div></div>' +
        '<div class="sd-kira-tutar">₺' + k.tutar.toLocaleString('tr-TR') + '</div>' +
      '</div>' +
      '<div class="sd-kira-meta">' +
        '<span>' + k.bas.split('-').reverse().join('.') + ' → ' + k.bit.split('-').reverse().join('.') + '</span>' +
        '<span>₺' + k.gunluk.toLocaleString('tr-TR') + '/gün</span>' +
        '<span class="' + tagCls + '">' + tagTxt + '</span>' +
      '</div>' +
      ceza +
      '<div class="sd-kira-acts">' + iadeBtn + '</div>' +
    '</div>';
  }

  var html = '';
  if (gecmis.length)   { html += '<div class="sd-kira-sec-hd" style="color:var(--rd2)">🔴 Gecikmiş (' + gecmis.length + ')</div>';   html += gecmis.map(kiraCard).join(''); }
  if (yaklasan.length) { html += '<div class="sd-kira-sec-hd" style="color:var(--am2)">⚠ Bitiş Yaklaşıyor (' + yaklasan.length + ')</div>'; html += yaklasan.map(kiraCard).join(''); }
  if (aktif.length)    { html += '<div class="sd-kira-sec-hd">Aktif (' + aktif.length + ')</div>';                                    html += aktif.map(kiraCard).join(''); }
  if (iade.length)     { html += '<div class="sd-kira-sec-hd">İade Edilmiş (' + iade.length + ')</div>';                              html += iade.map(kiraCard).join(''); }
  el.innerHTML = html;
}

export function deptRentalReturn(id) {
  for (var i = 0; i < APP.data.deptRentals.length; i++) {
    if (APP.data.deptRentals[i].id === id) {
      var _kd = APP.data.deptRentals[i];
      var _cd = _rentalPenalty(_kd);
      _kd.cezaGun = _cd.gecGun; _kd.cezaTutar = _cd.ceza; _kd.iade = true;
      break;
    }
  }
  for (var j = 0; j < APP.data.accRentals.length; j++) {
    if (APP.data.accRentals[j].id === id) {
      var _ka = APP.data.accRentals[j];
      var _ca = _rentalPenalty(_ka);
      _ka.cezaGun = _ca.gecGun; _ka.cezaTutar = _ca.ceza; _ka.iade = true;
      break;
    }
  }
  renderDeptRental();
  notif('Kiralama iadesi işaretlendi', 'green');
  saveAppData();
}

/* ═══ TAB YÖNETİMİ ═══ */

export function deptTab(t, el) {
  var tabs = ['bek', 'ekip', 'avans', 'kira', 'gecmis', 'mesaj'];
  for (var i = 0; i < tabs.length; i++) {
    var btn = document.getElementById('sdtb-' + tabs[i]);
    var pnl = document.getElementById('sd-pnl-' + tabs[i]);
    if (btn) btn.classList.remove('on');
    if (pnl) pnl.style.display = 'none';
  }
  if (el) el.classList.add('on');
  var active = document.getElementById('sd-pnl-' + t);
  if (active) active.style.display = 'block';
  if (t === 'bek')    renderDeptPending();
  if (t === 'avans')  renderDeptAdvance();
  if (t === 'kira')   renderDeptRental();
  if (t === 'gecmis') renderDeptHistory();
  if (t === 'mesaj')  renderDeptMessages();
}

/* ═══ GEÇMİŞ DÖNEM SEKMESİ ═══ */

export function deptHistorySetPeriod(id) {
  APP.ui.deptHistoryPanelPeriod = id;
  renderDeptHistory();
}

export function renderDeptHistory() {
  var el = document.getElementById('sd-pnl-gecmis');
  if (!el) return;
  var gecmisDon = APP.seed.deptPeriods.slice();
  if (!gecmisDon.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:13px">Dönem verisi yok</div>';
    return;
  }
  var donId  = APP.ui.deptHistoryPanelPeriod;
  var donRec = null;
  for (var di = 0; di < gecmisDon.length; di++) {
    if (gecmisDon[di].id === donId) { donRec = gecmisDon[di]; break; }
  }
  if (!donRec) { donId = gecmisDon[0].id; donRec = gecmisDon[0]; APP.ui.deptHistoryPanelPeriod = donId; }

  var html = '<div class="sd-gec-donem-row">';
  for (var pi = 0; pi < gecmisDon.length; pi++) {
    var dp = gecmisDon[pi];
    html += '<button class="sd-gec-don-pill' + (dp.id === donId ? ' on' : '') + '" onclick="deptHistorySetPeriod(' + dp.id + ')">' +
      '<div class="sd-gec-don-pill-lbl">' + dp.lbl + '</div>' +
      '<div class="sd-gec-don-pill-sub">' + dp.tarih + '</div>' +
    '</button>';
  }
  html += '</div>';

  var gec      = APP.data.deptHistory[donId] || { approved:[], rejected:[] };
  var onayTop  = 0, redTop = 0;
  for (var oi = 0; oi < gec.onaylandi.length;  oi++) onayTop += gec.onaylandi[oi].tutar;
  for (var ri = 0; ri < gec.reddedildi.length; ri++) redTop  += gec.reddedildi[ri].tutar;
  var topTutar = onayTop + redTop;

  html += '<div class="sd-gec-stat-row">' +
    '<div class="sd-gec-stat-c"><div class="sd-gec-stat-v">₺' + topTutar.toLocaleString('tr-TR') + '</div><div class="sd-gec-stat-l">Toplam</div></div>' +
    '<div class="sd-gec-stat-c"><div class="sd-gec-stat-v" style="color:var(--gr2)">₺' + onayTop.toLocaleString('tr-TR') + '</div><div class="sd-gec-stat-l">Onaylı</div></div>' +
    '<div class="sd-gec-stat-c"><div class="sd-gec-stat-v" style="color:var(--rd2)">₺' + redTop.toLocaleString('tr-TR') + '</div><div class="sd-gec-stat-l">Reddedildi</div></div>' +
  '</div>';

  if (gec.onaylandi.length) {
    html += '<div class="sd-gec-sec-hd" style="display:flex;align-items:center;justify-content:space-between;">Onaylanan Harcamalar (' + gec.onaylandi.length + ')<button style="background:transparent;border:1px solid var(--accent,#E8962E);color:var(--accent,#E8962E);border-radius:8px;padding:4px 10px;font-size:11px;cursor:pointer;" onclick="showExportModal(\'dept-gecmis\')">⬇ Dışa Aktar</button></div>';
    html += '<div class="sd-gec-fis-card">';
    html += gec.onaylandi.map(function(f) {
      var kat    = SD_KAT_LBL[f.kat] || f.kat;
      var clrDot = SD_KAT_CLR[f.kat] || 'var(--tx3)';
      return '<div class="sd-gec-fis-row">' +
        '<div class="sd-gec-dot" style="background:' + clrDot + '"></div>' +
        '<div class="sd-gec-fis-info">' +
          '<div class="sd-gec-satici">' + f.satici + '</div>' +
          '<div class="sd-gec-meta">' + f.ini + ' · ' + kat + ' · ' + f.tarih + '</div>' +
        '</div>' +
        '<div class="sd-gec-fis-right">' +
          '<div class="sd-gec-fis-tutar">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
          '<div class="sd-gec-fis-tag on">Onaylı</div>' +
        '</div>' +
      '</div>';
    }).join('');
    html += '</div>';
  }

  if (gec.reddedildi.length) {
    html += '<div class="sd-gec-sec-hd">Reddedilen Harcamalar (' + gec.reddedildi.length + ')</div><div class="sd-gec-fis-card">';
    html += gec.reddedildi.map(function(f) {
      var kat = SD_KAT_LBL[f.kat] || f.kat;
      return '<div class="sd-gec-fis-row">' +
        '<div class="sd-gec-dot" style="background:var(--rd2)"></div>' +
        '<div class="sd-gec-fis-info">' +
          '<div class="sd-gec-satici">' + f.satici + '</div>' +
          '<div class="sd-gec-meta">' + f.ini + ' · ' + kat + ' · ' + f.tarih + '</div>' +
          (f.sebep ? '<div class="sd-gec-sebep">Red gerekçesi: ' + f.sebep + '</div>' : '') +
        '</div>' +
        '<div class="sd-gec-fis-right">' +
          '<div class="sd-gec-fis-tutar">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
          '<div class="sd-gec-fis-tag red">Reddedildi</div>' +
        '</div>' +
      '</div>';
    }).join('');
    html += '</div>';
  }

  var donAvans = APP.data.accAdvanceHistory.filter(function(av) { return av.dept === 'Yapım' && av.donem === donId; });
  if (donAvans.length) {
    var avTop = 0;
    for (var avi = 0; avi < donAvans.length; avi++) avTop += donAvans[avi].tutar;
    html += '<div class="sd-gec-sec-hd">Avans Geçmişi — ' + donRec.lbl + ' · ₺' + avTop.toLocaleString('tr-TR') + '</div>';
    html += donAvans.map(function(av) {
      var clr = av.durum === 'paid' ? 'var(--gr2)' : (av.durum === 'rejected' ? 'var(--rd2)' : 'var(--am2)');
      var ico = av.durum === 'paid' ? '✅' : (av.durum === 'rejected' ? '❌' : '⏳');
      return '<div class="sd-av-gec-row">' +
        '<div class="sd-av-gec-av">' + av.ini + '</div>' +
        '<div class="sd-av-gec-info"><div class="sd-av-gec-name">' + av.uye + '</div><div class="sd-av-gec-sub">' + av.tarih + ' · ' + av.gerekce + '</div></div>' +
        '<div class="sd-av-gec-right"><div class="sd-av-gec-tutar">₺' + av.tutar.toLocaleString('tr-TR') + '</div><div class="sd-av-gec-durum" style="color:' + clr + '">' + ico + ' ' + av.durum + '</div></div>' +
      '</div>';
    }).join('');
  }

  if (!gec.onaylandi.length && !gec.reddedildi.length && !donAvans.length) {
    html += '<div style="text-align:center;padding:30px 0;color:var(--tx3);font-size:13px">Bu dönem için veri yok</div>';
  }

  el.innerHTML = html;
}

/* ═══ TEKLİ ONAY / RED / KISMİ ═══ */

export function deptApprove(id) {
  for (var i = 0; i < APP.data.deptPending.length; i++) {
    if (APP.data.deptPending[i].id !== id) continue;
    var f     = APP.data.deptPending[i];
    var _fDon = f.donem !== undefined ? f.donem : APP.ui.activePeriod;
    if (_isPeriodClosed(_fDon)) {
      notif('Bu dönem kapanmış. Dept rolünde işlem yapılamaz. Muhasebeye yönlendirin.', 'red'); return;
    }
    APP.data.deptPending.splice(i, 1);
    var ob = APP.data.periodBudget.find(function(x) { return x.donem === APP.ui.activePeriod; });
    if (ob) {
      ob.harcanan += f.tutar;
      var obt = 0;
      for (var oi = 0; oi < APP.data.deptPending.length; oi++) obt += APP.data.deptPending[oi].tutar;
      _checkBudgetWarning(ob, obt);
    }
    f.log = f.log || [];
    f.log.push(_mkLog('approved', ''));
    if (!APP.data.deptHistory[2]) APP.data.deptHistory[2] = { approved:[], rejected:[] };
    APP.data.deptHistory[2].onaylandi.push({
      id:f.id, uye:f.uye||'', ini:f.ini||'', satici:f.satici||'',
      kat:f.kat||'other', tutar:f.tutar, tarih:f.tarih||_deptDate(), log:f.log
    });
    for (var _fli = 0; _fli < APP.data.receipts.length; _fli++) {
      if (APP.data.receipts[_fli].id === f.fisId) { APP.data.receipts[_fli].durum = 'acc-pending'; break; }
    }
    f.log.push(_mkLog('dept-onayladi', ''));
    APP.data.accPending.unshift({
      id: Date.now() + Math.floor(Math.random()*1000),
      fisId: f.fisId || null, dept: _curDeptName(),
      uye: f.uye, ini: f.ini, satici: f.satici, kat: f.kat,
      tutar: f.tutar, tarih: f.tarih,
      belgesiz: !!f.belgesiz, uyari: f.uyari || '',
      aciklama: f.aciklama || '', fotos: f.fotos || [],
      fromKey: f.fromKey || 's', log: f.log,
      donem: _fDon, olusturmaZamani: Date.now()
    });
    _pushNotif('m', 'bl', 'Dept Onayı — Yeni Harcama',
      f.satici + ' (₺' + f.tutar.toLocaleString('tr-TR') + ') dept onayından geçti.',
      'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
    var newH = _categorySpent();
    _checkCategoryLimit(f.kat, newH[f.kat] || 0);
    updateNotifBadge();
    notif(f.satici + ' onaylandı', 'green');
    saveAppData();
    renderDeptPending(); renderDeptCrew(); renderDeptSummary(); renderAccBek();
    return;
  }
}

export function deptReject(id) {
  for (var i = 0; i < APP.data.deptPending.length; i++) {
    if (APP.data.deptPending[i].id !== id) continue;
    var f      = APP.data.deptPending[i];
    var _fDon2 = f.donem !== undefined ? f.donem : APP.ui.activePeriod;
    if (_isPeriodClosed(_fDon2)) {
      notif('Bu dönem kapanmış. Dept rolünde işlem yapılamaz. Muhasebeye yönlendirin.', 'red'); return;
    }
    var redNedeni = (prompt('Red nedeni girin:') || '').trim();
    if (!redNedeni) { notif('Red nedeni zorunludur — iptal edildi', 'amber'); return; }
    f.log = f.log || [];
    f.log.push(_mkLog('rejected', redNedeni));
    APP.data.deptPending.splice(i, 1);
    var rb = APP.data.periodBudget.find(function(x) { return x.donem === APP.ui.activePeriod; });
    if (rb) rb.reddedildi += f.tutar;
    if (!APP.data.deptHistory[APP.ui.activePeriod]) APP.data.deptHistory[APP.ui.activePeriod] = { approved:[], rejected:[] };
    APP.data.deptHistory[APP.ui.activePeriod].reddedildi.push({
      id: f.id, uye: f.uye||'', ini: f.ini||'',
      satici: f.satici||'', kat: f.kat||'other',
      tutar: f.tutar, tarih: f.tarih||_deptDate(), redNedeni: redNedeni, log: f.log
    });
    for (var _rfli = 0; _rfli < APP.data.receipts.length; _rfli++) {
      if (APP.data.receipts[_rfli].id === f.fisId) {
        APP.data.receipts[_rfli].durum = 'rejected';
        APP.data.receipts[_rfli].uyari = redNedeni;
        break;
      }
    }
    var fKey = f.fromKey || 's';
    _pushNotif(fKey, 'rd', 'Harcama Reddedildi',
      '₺' + f.tutar.toLocaleString('tr-TR') + ' ' + f.satici + ' harcamanız reddedildi. Neden: ' + redNedeni,
      'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
    updateNotifBadge();
    notif(f.satici + ' reddedildi', 'red');
    saveAppData();
    renderDeptPending(); renderDeptCrew(); renderDeptSummary();
    return;
  }
}

export function deptPartial(id, onayTutar, redNedeni) {
  var _i = -1;
  for (var _di = 0; _di < APP.data.deptPending.length; _di++) {
    if (APP.data.deptPending[_di].id === id) { _i = _di; break; }
  }
  if (_i < 0) return;
  var f     = APP.data.deptPending[_i];
  var _fDon3 = f.donem !== undefined ? f.donem : APP.ui.activePeriod;
  if (_isPeriodClosed(_fDon3)) {
    notif('Bu dönem kapanmış. Dept rolünde işlem yapılamaz. Muhasebeye yönlendirin.', 'red'); return;
  }
  if (!onayTutar || onayTutar <= 0 || onayTutar >= f.tutar) return;
  if (!redNedeni || !redNedeni.trim()) return;
  var redTutar = f.tutar - onayTutar;

  if (f.fisId) {
    for (var _pfi = 0; _pfi < APP.data.receipts.length; _pfi++) {
      if (APP.data.receipts[_pfi].id === f.fisId) { APP.data.receipts[_pfi].durum = 'split'; break; }
    }
  }
  var _maxId = 0;
  for (var _mi = 0; _mi < APP.data.receipts.length; _mi++) {
    if (APP.data.receipts[_mi].id > _maxId) _maxId = APP.data.receipts[_mi].id;
  }
  var _onayId = _maxId + 1;
  var _redId  = _maxId + 2;
  var _parent = null;
  for (var _pfi2 = 0; _pfi2 < APP.data.receipts.length; _pfi2++) {
    if (APP.data.receipts[_pfi2].id === f.fisId) { _parent = APP.data.receipts[_pfi2]; break; }
  }
  var _baseDonem    = _parent ? _parent.donem    : APP.ui.activePeriod;
  var _baseTarih    = _parent ? _parent.tarih    : '';
  var _basePersonel = _parent ? _parent.personel : f.uye;
  var _baseDept     = _parent ? _parent.dept     : null;

  APP.data.receipts.unshift({ id: _onayId, tarih: _baseTarih, personel: _basePersonel,
    satici: f.satici, kat: f.kat, tutar: onayTutar,
    durum: 'acc-pending', donem: _baseDonem, uyari: null, thumb: null,
    dept: _baseDept, parentFisId: f.fisId || null, kismiTip: 'onay' });
  APP.data.receipts.unshift({ id: _redId, tarih: _baseTarih, personel: _basePersonel,
    satici: f.satici, kat: f.kat, tutar: redTutar,
    durum: 'rejected', donem: _baseDonem, uyari: redNedeni, thumb: null,
    dept: _baseDept, parentFisId: f.fisId || null, kismiTip: 'red' });
  APP.data.deptPending.splice(_i, 1);

  if (!APP.data.deptHistory[APP.ui.activePeriod]) APP.data.deptHistory[APP.ui.activePeriod] = { approved:[], rejected:[] };
  APP.data.deptHistory[APP.ui.activePeriod].onaylandi.push({ id:_onayId, uye:f.uye, ini:f.ini, satici:f.satici, kat:f.kat, tutar:onayTutar, tarih:f.tarih });
  APP.data.deptHistory[APP.ui.activePeriod].reddedildi.push({ id:_redId, uye:f.uye, ini:f.ini, satici:f.satici, kat:f.kat, tutar:redTutar, tarih:f.tarih, sebep:redNedeni });

  APP.data.accPending.unshift({
    id: _onayId + 1000, fisId: _onayId,
    dept: _parent && _parent.dept ? _parent.dept : (f.uye || ''),
    uye: f.uye, ini: f.ini, satici: f.satici, kat: f.kat,
    tutar: onayTutar, tarih: f.tarih,
    belgesiz: f.belgesiz || false, uyari: '', fromKey: 'd',
    donem: _fDon3, olusturmaZamani: Date.now()
  });

  var _db = APP.data.periodBudget.find(function(x) { return x.donem === APP.ui.activePeriod; });
  if (_db) {
    _db.harcanan   += onayTutar;
    _db.reddedildi += redTutar;
    var _bekTop = 0;
    for (var _bti = 0; _bti < APP.data.deptPending.length; _bti++) _bekTop += APP.data.deptPending[_bti].tutar;
    _checkBudgetWarning(_db, _bekTop);
  }
  _pushNotif('m', 'bl', 'Yeni Bekleyen — Kısmi Onay',
    f.uye + ' — ₺' + onayTutar.toLocaleString('tr-TR') + ' (' + f.satici + ') muhasebeye iletildi.',
    'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
  _pushNotif(f.fromKey || 's', 'rd', 'Kısmi Red',
    f.satici + ' — ₺' + redTutar.toLocaleString('tr-TR') + ' reddedildi. Neden: ' + redNedeni,
    'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
  updateNotifBadge();
  saveAppData();
  renderDept();
  closeM('md-kismi');
}

/* ═══ AVANS ONAY / RED ═══ */

export function deptAdvanceApprove(id) {
  for (var i = 0; i < APP.data.deptAdvances.length; i++) {
    if (APP.data.deptAdvances[i].id !== id) continue;
    var a = APP.data.deptAdvances[i];
    APP.data.deptAdvances.splice(i, 1);
    APP.data.accPending.unshift({
      id: Date.now(), tip: 'avans', dept: _curDeptName(),
      uye: a.uye, ini: a.ini, satici: 'Avans Talebi', kat: 'Avans',
      tutar: a.tutar, tarih: _deptDate(),
      belgesiz: false, uyari: '', gerekce: a.gerekce, fromKey: a.fromKey || 's'
    });
    _pushNotif('m', 'am', 'Avans Onay Bekliyor',
      a.uye + ' — ₺' + a.tutar.toLocaleString('tr-TR') + ' avans talebi dept onayından geçti.',
      'Az önce · ' + (APP.ui.curUser ? APP.ui.curUser.name : 'Dept') + ' (Dept)');
    updateNotifBadge();
    renderDeptAdvance();
    notif(a.uye + ' avansı onaylandı → muhasebede bekliyor', 'green');
    saveAppData();
    return;
  }
}

export function deptAdvanceReject(id) {
  for (var i = 0; i < APP.data.deptAdvances.length; i++) {
    if (APP.data.deptAdvances[i].id !== id) continue;
    var a = APP.data.deptAdvances[i];
    window._avRedPending = { id: id, kaynak: 'dept' };
    var infoEl = document.getElementById('md-av-red-info');
    if (infoEl) infoEl.textContent = a.uye + ' · ₺' + a.tutar.toLocaleString('tr-TR') + ' · Talep: ' + a.gerekce;
    var ta = document.getElementById('av-red-nedeni');
    if (ta) ta.value = '';
    openM('md-av-red');
    return;
  }
}

/* ═══ MESAJ ═══ */

export function openMesaj(name, ini) {
  APP.ui.deptMessagePerson = name;
  var kisiEl = document.getElementById('md-mesaj-kisi');
  var txtEl  = document.getElementById('md-mesaj-txt');
  if (kisiEl) kisiEl.textContent = 'Alıcı: ' + name;
  if (txtEl)  txtEl.value = '';
  openM('md-mesaj');
}

export function sendMesaj() {
  var txt = (document.getElementById('md-mesaj-txt').value || '').trim();
  if (!txt) { notif('Mesaj boş olamaz', 'red'); return; }
  closeM('md-mesaj');
  var gonderen = APP.ui.curUser ? APP.ui.curUser.name : 'Dept. Sorumlusu';
  _pushNotif('s', 'bl', gonderen + ' sana mesaj gönderdi', txt, 'Az önce · ' + gonderen + ' (Dept)');
  notif('Mesaj gönderildi → ' + APP.ui.deptMessagePerson, 'green');
}

/* ─── window global uyumluluk (inline onclick) ──────────────────────────── */

window._curDeptName        = _curDeptName;
window._deptDate          = _deptDate;
window._advanceSortDesc         = _advanceSortDesc;
window._advanceHistoryAdd       = _advanceHistoryAdd;
window.advanceRejectConfirm        = advanceRejectConfirm;
window.advanceRejectCancel       = advanceRejectCancel;
window.demoDataConfirm        = demoDataConfirm;
window._checkBudgetWarning    = _checkBudgetWarning;
window.renderDept          = renderDept;
window.renderDeptPeriodSelector  = renderDeptPeriodSelector;
window.deptSetPeriod          = deptSetPeriod;
window.openDeptOCR         = openDeptOCR;
window.openDeptDocless    = openDeptDocless;
window._addToDeptPending  = _addToDeptPending;
window.renderDeptSummary      = renderDeptSummary;
window._renderDeptPendingHistory = _renderDeptPendingHistory;
window.renderDeptPending       = renderDeptPending;
window._deptToggle           = _deptToggle;
window._deptToggleAll        = _deptToggleAll;
window._deptUpdateToolbar    = _deptUpdateToolbar;
window.deptApproveSelected    = deptApproveSelected;
window.deptRejectSelected    = deptRejectSelected;
window.renderDeptCrew      = renderDeptCrew;
window.renderDeptAdvance     = renderDeptAdvance;
window.deptAdvanceFormOpen       = deptAdvanceFormOpen;
window.deptAdvanceFormClose    = deptAdvanceFormClose;
window.deptAdvanceAdd         = deptAdvanceAdd;
window.renderDeptRental      = renderDeptRental;
window.deptRentalReturn        = deptRentalReturn;
window.deptTab               = deptTab;
window.deptHistorySetPeriod    = deptHistorySetPeriod;
window.renderDeptHistory    = renderDeptHistory;
window.deptApprove          = deptApprove;
window.deptReject          = deptReject;
window.deptPartial           = deptPartial;
window.deptAdvanceApprove     = deptAdvanceApprove;
window.deptAdvanceReject     = deptAdvanceReject;
window.openMesaj           = openMesaj;
window.sendMesaj           = sendMesaj;
