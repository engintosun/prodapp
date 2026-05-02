// /modules/saha/saha.js
// PRODAPP — Saha Ekranı (Adım 5 — kopyalama, index.html orijinaller yerinde)
//
// Kapsam: nav, arama, renderRecent, bütçe/limit barları, dinamik kategori panelleri,
//         belgesiz modal, imza canvas, sesli giriş, GİB, avans gönder,
//         lightbox, modal sistemi, kısmi onay, harcama detay modalı.
//
// Bağımlılıklar (window globals — henüz index.html'den):
//   notif, renderDonem, renderDeptAvans, _addToDeptBekleyen,
//   _pushNotif, updateNotifBadge, renderSuMesaj,
//   bFotolar, _bFotoRender,                (ocr.js modülünden)
//   _escHtml,                              (sohbet bölümünden)
//   deptOnayla, deptReddet, deptKismi,     (dept bölümünden)
//   accOnayla, accReddet, accKismi         (muhasebe bölümünden)

import { APP }                   from '../core/state.js';
import { _pad, _mkLog, _fmtLogZaman } from '../core/utils.js';
import { saveAppData }           from '../core/services/storage.service.js';
import { KAT_IC, DOT, SD_KAT_LBL, DYN_PANEL_IDS } from '../core/constants.js';

/* ═══ SAHA NAV ═══ */

export function suNav(id, el) {
  document.querySelectorAll('.su-nav .ni').forEach(function(n) { n.classList.remove('on'); });
  if (el) el.classList.add('on');
  document.querySelectorAll('.su-tab').forEach(function(t) { t.classList.remove('on'); });
  if (id === 'ana') {
    document.getElementById('tab-ana').classList.add('on');
  } else if (id === 'donem') {
    document.getElementById('tab-donem').classList.add('on');
    renderDonem(APP.ui.aktifDon);
  } else if (id === 'mesaj') {
    document.getElementById('tab-mesaj').classList.add('on');
    renderSuMesaj();
  }
}

export function openNavSrch() {
  var srch = document.getElementById('nav-srch');
  var nav  = document.getElementById('su-nav');
  srch.classList.add('on');
  nav.style.display = 'none';
  suNav('ana', null);
  document.querySelectorAll('.su-nav .ni').forEach(function(n) { n.classList.remove('on'); });
  setTimeout(function() {
    var inp = document.getElementById('nav-srch-inp');
    if (inp) inp.focus();
  }, 100);
}

export function closeNavSrch() {
  document.getElementById('nav-srch').classList.remove('on');
  document.getElementById('su-nav').style.display = 'flex';
  var inp = document.getElementById('nav-srch-inp');
  if (inp) inp.value = '';
  var drop = document.getElementById('srch-drop');
  drop.classList.remove('on');
  drop.innerHTML = '';
  document.getElementById('ni-ana').classList.add('on');
}

export function srchList(q) {
  var drop = document.getElementById('srch-drop');
  var lq   = (q || '').trim().toLowerCase();
  if (!lq) { drop.classList.remove('on'); drop.innerHTML = ''; return; }

  var results = APP.data.fisler.filter(function(d) {
    return d.satici.toLowerCase().indexOf(lq) > -1
        || d.kat.toLowerCase().indexOf(lq) > -1
        || d.tarih.indexOf(lq) > -1
        || String(d.tutar).indexOf(lq) > -1
        || (d.aciklama && d.aciklama.toLowerCase().indexOf(lq) > -1);
  });

  if (results.length === 0) {
    drop.innerHTML = '<div class="srch-empty">Sonuç bulunamadı</div>';
    drop.classList.add('on');
    return;
  }

  var durumClr = { bekleyen:'var(--am)', 'dept-bekleyen':'var(--am)', 'acc-bekleyen':'var(--am)', onaylandi:'var(--gr)', reddedildi:'var(--rd)' };
  var durumTxt = { bekleyen:'Bekleyen', 'dept-bekleyen':'Bekleyen', 'acc-bekleyen':'Bekleyen', onaylandi:'Onaylandı', reddedildi:'Reddedildi' };

  drop.innerHTML =
    '<div class="srch-hd"><span>' + results.length + ' sonuç</span><span>Tıkla → kayda git</span></div>' +
    results.map(function(d) {
      var dot = durumClr[d.durum] || 'var(--tx3)';
      var dtx = durumTxt[d.durum] || d.durum;
      var bsz = d.belgesiz
        ? ' <span style="font-size:9px;background:rgba(59,130,246,.15);color:var(--bl2);border:1px solid rgba(59,130,246,.3);border-radius:3px;padding:1px 4px;font-weight:700;vertical-align:middle">BSZ</span>'
        : '';
      return '<div class="srch-row" onclick="srchGoTo(' + d.id + ')">' +
        '<div class="srch-dot" style="background:' + dot + '"></div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="srch-name">' + d.satici + bsz + '</div>' +
          '<div class="srch-meta">' + d.tarih + ' · ' + d.kat + ' · D' + d.donem + '</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
          '<div class="srch-amt">&#8378;' + d.tutar.toLocaleString('tr-TR') + '</div>' +
          '<div class="srch-dur" style="color:' + dot + '">' + dtx + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

  drop.classList.add('on');
}

export function srchGoTo(id) {
  var f = APP.data.fisler.find(function(x) { return x.id === id; });
  if (!f) return;
  closeNavSrch();
  suNav('donem', document.getElementById('ni-donem'));
  renderDonem(f.donem);
  setTimeout(function() {
    var _curName = APP.ui.curUser ? APP.ui.curUser.name : 'Mehmet Kaya';
    var myFis = APP.data.fisler.filter(function(x) { return x.donem === f.donem && x.personel === _curName; });
    var rowIdx = -1;
    for (var i = 0; i < myFis.length; i++) {
      if (myFis[i].id === id) { rowIdx = i; break; }
    }
    var rows = document.querySelectorAll('#fis-list .fis-row');
    if (rowIdx >= 0 && rows[rowIdx]) {
      rows[rowIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      rows[rowIdx].classList.add('fis-hl');
      setTimeout(function() { rows[rowIdx].classList.remove('fis-hl'); }, 2000);
    }
  }, 280);
}

/* ═══ FİŞ THUMBNAIL (SVG data URL) ═══ */

export function fisThumbnail(f) {
  var accent = f.durum === 'reddedildi' ? '#EF4444'
             : f.durum === 'onaylandi'  ? '#22C55E'
             : '#E8962E';
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="76" height="96">' +
    '<path d="M0 0 L76 0 L76 82 L63 92 L51 82 L38 92 L25 82 L13 92 L0 82 Z" fill="#F7F4EF"/>' +
    '<rect width="76" height="5" fill="' + accent + '"/>' +
    '<rect x="7" y="13" width="44" height="3" rx="1.5" fill="#C8C2B6"/>' +
    '<rect x="7" y="21" width="28" height="2" rx="1" fill="#D8D2C6"/>' +
    '<rect x="7" y="29" width="62" height="0.5" fill="#E0D8D0"/>' +
    '<rect x="7" y="34" width="36" height="2" rx="1" fill="#DAD4C8"/>' +
    '<rect x="56" y="34" width="13" height="2" rx="1" fill="#DAD4C8"/>' +
    '<rect x="7" y="41" width="40" height="2" rx="1" fill="#DAD4C8"/>' +
    '<rect x="56" y="41" width="13" height="2" rx="1" fill="#DAD4C8"/>' +
    '<rect x="7" y="48" width="28" height="2" rx="1" fill="#DAD4C8"/>' +
    '<rect x="56" y="48" width="13" height="2" rx="1" fill="#DAD4C8"/>' +
    '<rect x="7" y="56" width="62" height="0.5" fill="#C8C2B8"/>' +
    '<rect x="7" y="62" width="52" height="3.5" rx="1.5" fill="#A89880"/>' +
    '<rect x="7" y="70" width="28" height="2" rx="1" fill="#C8C2B6"/>' +
    '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/* ═══ SON HARCAMALAR ═══ */

export function renderSahaButce() {
  var el = document.getElementById('su-butce-bar');
  if (!el) return;
  var b = null;
  for (var bi = 0; bi < APP.data.donemButce.length; bi++) {
    if (APP.data.donemButce[bi].donem === APP.ui.aktifDon) { b = APP.data.donemButce[bi]; break; }
  }
  if (!b || !b.butce) { el.innerHTML = ''; return; }
  var bekTop = 0;
  for (var i = 0; i < APP.data.deptBekleyen.length; i++) bekTop += APP.data.deptBekleyen[i].tutar;
  var committed = b.harcanan + bekTop;
  var kalan     = Math.max(0, b.butce - committed);
  var pct       = Math.min(100, Math.round(committed / b.butce * 100));
  var barClr    = pct >= 100 ? 'var(--rd)' : pct >= 80 ? 'var(--am)' : 'var(--gr)';
  var pctClr    = pct >= 100 ? 'var(--rd2)' : pct >= 80 ? 'var(--am2)' : 'var(--gr2)';
  el.innerHTML =
    '<div class="su-bw">' +
      '<div class="su-bw-hd">' +
        '<span class="su-bw-lbl">Dönem Bütçesi</span>' +
        '<span class="su-bw-pct" style="color:' + pctClr + '">%' + pct + ' · ₺' + b.butce.toLocaleString('tr-TR') + '</span>' +
      '</div>' +
      '<div class="su-bw-track"><div class="su-bw-fill" style="width:' + pct + '%;background:' + barClr + '"></div></div>' +
      '<div class="su-bw-stats">' +
        '<div class="su-bw-stat"><div class="su-bw-sv" style="color:var(--gr2)">₺' + b.harcanan.toLocaleString('tr-TR') + '</div><div class="su-bw-sl">Onaylanan</div></div>' +
        '<div class="su-bw-stat"><div class="su-bw-sv" style="color:var(--am2)">₺' + bekTop.toLocaleString('tr-TR') + '</div><div class="su-bw-sl">Bekleyen</div></div>' +
        '<div class="su-bw-stat"><div class="su-bw-sv" style="color:' + (kalan === 0 ? 'var(--rd2)' : 'var(--tx2)') + '">₺' + kalan.toLocaleString('tr-TR') + '</div><div class="su-bw-sl">Kalan</div></div>' +
      '</div>' +
    '</div>';
}

export function _katHarcanan() {
  var h = {};
  var on = (APP.data.deptGecmis[2] && APP.data.deptGecmis[2].onaylandi) ? APP.data.deptGecmis[2].onaylandi : [];
  for (var i = 0; i < on.length; i++) h[on[i].kat] = (h[on[i].kat] || 0) + on[i].tutar;
  return h;
}

export function _katBekleyen() {
  var b = {};
  for (var i = 0; i < APP.data.deptBekleyen.length; i++) {
    var k = APP.data.deptBekleyen[i].kat;
    b[k] = (b[k] || 0) + APP.data.deptBekleyen[i].tutar;
  }
  return b;
}

export function _checkKatLimit(kat, newTotal) {
  var km = null;
  for (var i = 0; i < APP.seed.katLimit.length; i++) { if (APP.seed.katLimit[i].kat === kat) { km = APP.seed.katLimit[i]; break; } }
  if (!km || !km.limit) return;
  var pct = newTotal / km.limit * 100;
  if (pct >= 100) {
    _pushNotif('d', 'rd', km.lbl + ' Limiti Aşıldı!',
      km.lbl + ' kategorisi ₺' + km.limit.toLocaleString('tr-TR') + ' limitini aştı.',
      'Az önce · Sistem');
    updateNotifBadge();
  } else if (pct >= 80) {
    _pushNotif('d', 'am', km.lbl + ' Kategorisi — %' + Math.round(pct),
      km.lbl + ' kategorisinin %' + Math.round(pct) + "'i kullanıldı.",
      'Az önce · Sistem');
    updateNotifBadge();
  }
}

export function renderSahaKatLimits() {
  var el = document.getElementById('su-kat-bar');
  if (!el) return;
  var katH   = _katHarcanan();
  var katBek = _katBekleyen();
  var rows = [];
  for (var i = 0; i < APP.seed.katLimit.length; i++) {
    var km = APP.seed.katLimit[i];
    if (!km.limit) continue;
    var kTot = (katH[km.kat] || 0) + (katBek[km.kat] || 0);
    if (!kTot) continue;
    rows.push({ km: km, tot: kTot });
  }
  if (!rows.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="su-bw">' +
    '<div class="su-bw-hd"><span class="su-bw-lbl">Kategori Limitleri</span></div>' +
    rows.map(function(r) {
      var pct    = Math.min(100, Math.round(r.tot / r.km.limit * 100));
      var barClr = pct >= 100 ? 'var(--rd)' : pct >= 80 ? 'var(--am)' : r.km.clr;
      var pctClr = pct >= 100 ? 'var(--rd2)' : pct >= 80 ? 'var(--am2)' : 'var(--tx3)';
      return '<div class="su-kat-row">' +
        '<div class="su-kat-dot" style="background:' + r.km.clr + '"></div>' +
        '<span class="su-kat-lbl">' + r.km.lbl + '</span>' +
        '<div class="su-kat-bar"><div class="su-kat-fill" style="width:' + pct + '%;background:' + barClr + '"></div></div>' +
        '<span class="su-kat-pct" style="color:' + pctClr + '">%' + pct + '</span>' +
      '</div>';
    }).join('') +
  '</div>';
}

export function renderRecent() {
  renderSahaButce();
  renderSahaKatLimits();
  var _curName = APP.ui.curUser ? APP.ui.curUser.name : 'Mehmet Kaya';
  var mine = APP.data.fisler.filter(function(d) { return d.personel === _curName && d.donem === APP.ui.aktifDon; });
  var el = document.getElementById('recent-list');
  if (!el) return;
  el.innerHTML = mine.map(function(d) {
    var cls   = 'rc' + (d.duplikat ? ' err' : d.belgesiz ? ' blgsz' : d.uyari ? ' warn' : '');
    var icStr = KAT_IC[d.kat] || KAT_IC.def;
    var icClr = d.duplikat ? 'var(--rd)' : d.belgesiz ? 'var(--bl)' : d.uyari ? 'var(--am)' : 'var(--ac)';
    var icBg  = d.duplikat ? 'rgba(239,68,68,.1)' : d.belgesiz ? 'rgba(59,130,246,.1)' : d.uyari ? 'rgba(245,158,11,.1)' : 'var(--bg3)';
    var media = d.thumb
      ? '<img src="' + d.thumb + '" class="fis-thumb" style="width:100%;height:52px;margin-bottom:6px" onclick="event.stopPropagation();openLBFis(' + d.id + ')" alt="">'
      : '<div class="rc-ic" style="background:' + icBg + ';color:' + icClr + '">' + icStr + '</div>';
    var belgesizTag = d.belgesiz  ? '<div class="rc-blgsz-tag">BELGESİZ</div>' : '';
    var gecIslemTag = d.gecIslem  ? '<div style="font-size:9px;color:var(--am2);font-weight:700;margin-top:1px;line-height:1">⚠ İSTİSNA</div>' : '';
    return '<div class="' + cls + '" onclick="openLBFis(' + d.id + ')">' +
      media +
      '<div class="rc-name">' + d.satici + '</div>' +
      belgesizTag + gecIslemTag +
      '<div class="rc-amt">₺' + d.tutar.toLocaleString('tr-TR') + '</div>' +
      '<div class="rc-dot" style="background:' + (DOT[d.durum] || 'var(--tx3)') + '"></div>' +
    '</div>';
  }).join('');
}

/* ═══ DİNAMİK KATEGORİ PANELLERİ ═══ */

export function _hideAllDynPanels(p) {
  for (var i = 0; i < DYN_PANEL_IDS.length; i++) {
    var el = document.getElementById(p + DYN_PANEL_IDS[i]);
    if (el) el.style.display = 'none';
  }
  var uy = document.getElementById(p + 'ul-uyari');
  if (uy) { uy.style.display = 'none'; uy.innerHTML = ''; }
}

export function _showDynPanel(p, kat) {
  _hideAllDynPanels(p);
  var map = { 'Ulasim':'ul-panel', 'Yiyecek':'ym-panel', 'Konaklama':'ko-panel', 'Kiralama':'ki-panel' };
  var pid = map[kat];
  if (pid) {
    var el = document.getElementById(p + pid);
    if (el) el.style.display = 'block';
  }
  if (kat === 'Ulasim') {
    if (p === 'b-') checkBUlasimLimit(); else checkUlasimLimit();
  }
}

export function _resetDynFields(p) {
  _hideAllDynPanels(p);
  var clears = [
    p+'ul-binis', p+'ul-varis', p+'ul-km',
    p+'ym-kisi',
    p+'ko-gece',  p+'ko-kisi',
    p+'ki-bas',   p+'ki-bit',  p+'ki-gun'
  ];
  for (var i = 0; i < clears.length; i++) {
    var el = document.getElementById(clears[i]);
    if (el) el.value = '';
  }
  var ulTip = document.getElementById(p + 'ul-tip');
  if (ulTip) ulTip.selectedIndex = 0;
  var ymOgun = document.getElementById(p + 'ym-ogun');
  if (ymOgun) ymOgun.selectedIndex = 0;
}

export function _detectKatFromFis(f) {
  var kat = f.kat || '';
  if (kat === 'Konaklama' || kat === 'Kiralama' || kat === 'Ulasim' || kat === 'Yiyecek') return kat;
  var txt = ((f.satici || '') + ' ' + (f.aciklama || '') + ' ' + (f.prev || '')).toLowerCase();
  if (/otel|hotel|konaklama|pansiyon|motel/.test(txt))                         return 'Konaklama';
  if (/kiralık|kiralama|araç kira|rent/.test(txt))                             return 'Kiralama';
  if (/taksi|otobüs|metro|transfer|ulaşım|bilet/.test(txt))                    return 'Ulasim';
  if (/yemek|restoran|lokanta|kahvaltı|pizza|döner|tavuk|cafe|kafe/.test(txt)) return 'Yiyecek';
  return kat;
}

export function onKatChange() {
  var kat = document.getElementById('f-kat');
  if (!kat) return;
  _showDynPanel('', kat.value);
}

export function onBKatChange() {
  var kat = document.getElementById('b-kat');
  if (!kat) return;
  _showDynPanel('b-', kat.value);
}

export function _applyUlasimLimit(kmId, tipId, tutId, uyId) {
  var kmEl  = document.getElementById(kmId);
  var tipEl = document.getElementById(tipId);
  var tutEl = document.getElementById(tutId);
  var uyEl  = document.getElementById(uyId);
  if (!kmEl || !tipEl || !tutEl || !uyEl) return;

  var km  = parseFloat(kmEl.value) || 0;
  var tut = parseFloat((tutEl.value || '').replace(',', '.')) || 0;
  if (km <= 0 || tut <= 0) { uyEl.style.display = 'none'; uyEl.innerHTML = ''; return; }

  var rate  = tipEl.value === 'dis' ? 25 : 15;
  var limit = km * rate;

  if (tut > limit * 2) {
    uyEl.className = 'al al-rd';
    uyEl.innerHTML = '<span>🔴</span><div><strong>Aşırı Yüksek Tutar!</strong> ' +
      km + ' km için üst sınır <strong>₺' + limit.toLocaleString('tr-TR') + '</strong>, ' +
      'girilen tutar sınırın 2 katından fazla. Muhasebe incelemesi zorunlu olabilir.</div>';
    uyEl.style.display = 'flex';
  } else if (tut > limit) {
    uyEl.className = 'al al-am';
    uyEl.innerHTML = '<span>⚠️</span><div>' +
      km + ' km için tavsiye edilen üst sınır <strong>₺' + limit.toLocaleString('tr-TR') + '</strong> ' +
      '(' + rate + ' ₺/km). Girilen tutar bu sınırı aşıyor; kaydedebilirsiniz ancak muhasebe sorabilir.</div>';
    uyEl.style.display = 'flex';
  } else {
    uyEl.style.display = 'none';
    uyEl.innerHTML = '';
  }
}

export function checkUlasimLimit() {
  var kat = document.getElementById('f-kat');
  if (!kat || kat.value !== 'Ulasim') return;
  _applyUlasimLimit('ul-km', 'ul-tip', 'f-tutar', 'ul-uyari');
}

export function checkBUlasimLimit() {
  var kat = document.getElementById('b-kat');
  if (!kat || kat.value !== 'Ulasim') return;
  _applyUlasimLimit('b-ul-km', 'b-ul-tip', 'b-tutar', 'b-ul-uyari');
}

/* ═══ BELGESİZ MODAL ═══ */

var _B_DEPT_MAP  = { yapim:'Yapım', kamera:'Kamera', sanat:'Sanat', ses:'Ses & Müzik', kostum:'Kostüm & Makyaj', diger:'Diğer' };
var _B_DEPT_KEYS = ['yapim','kamera','sanat','ses','kostum','diger'];

export function openBelgesizModal() {
  _resetDynFields('b-');
  var kat = document.getElementById('b-kat');
  if (kat) kat.selectedIndex = 0;
  bFotolar = [];
  _bFotoRender();
  var tarihEl = document.getElementById('b-tarih');
  if (tarihEl) tarihEl.value = new Date().toISOString().slice(0, 10);
  var deptSel = document.getElementById('b-dept');
  if (deptSel) {
    var deptHtml = '';
    for (var di = 0; di < _B_DEPT_KEYS.length; di++) {
      var dk = _B_DEPT_KEYS[di];
      deptHtml += '<option value="' + _B_DEPT_MAP[dk] + '">' + _B_DEPT_MAP[dk] + '</option>';
    }
    deptSel.innerHTML = deptHtml;
    var userDept = APP.ui.curUser ? (APP.ui.curUser.dept || '').toLowerCase() : '';
    var matchLbl = _B_DEPT_MAP[userDept] || '';
    if (matchLbl) deptSel.value = matchLbl;
  }
  openM('mb');
}

export function submitBelgesiz() {
  var t = document.getElementById('b-tutar').value;
  if (!t) { notif('Tutar giriniz', 'red'); return; }
  var fotos = bFotolar.slice();
  closeM('mb');
  if (APP.ui.sdMode) {
    APP.ui.sdMode = false;
    var kat      = document.getElementById('b-kat').value || 'Diger';
    var tutar    = parseFloat(t) || 0;
    var aciklama = (document.getElementById('b-aciklama') || {}).value || '';
    _addToDeptBekleyen('Belgesiz Harcama', kat, tutar, true, aciklama, fotos);
    notif('Belgesiz harcama bekleyene eklendi', 'amber');
  } else {
    var bKat      = document.getElementById('b-kat').value || 'Diger';
    var bTut      = parseFloat(document.getElementById('b-tutar').value || '0') || 0;
    var bAciklama = (document.getElementById('b-aciklama') || {}).value || '';
    var bDept     = (document.getElementById('b-dept')     || {}).value || '';
    var bNeden    = (document.getElementById('b-neden')    || {}).value || '';
    var bPersonel = APP.ui.curUser ? APP.ui.curUser.name : 'Bilinmeyen';
    var bTarihRaw = (document.getElementById('b-tarih')    || {}).value || '';
    var bTarih;
    if (bTarihRaw) {
      var dp = bTarihRaw.split('-');
      bTarih = dp[2] + '.' + dp[1] + '.' + dp[0];
    } else {
      var bd = new Date();
      bTarih = _pad(bd.getDate()) + '.' + _pad(bd.getMonth()+1) + '.' + bd.getFullYear();
    }
    if (bKat === 'Kiralama') {
      var bFisIdK = Date.now();
      APP.data.fisler.unshift({
        id: bFisIdK, tarih: bTarih, personel: bPersonel, satici: 'Belgesiz Kiralama',
        kat: 'Kiralama', tutar: bTut, durum: 'dept-bekleyen', donem: APP.ui.aktifDon,
        uyari: null, thumb: null, belgesiz: true, aciklama: bAciklama, fotos: fotos,
        dept: bDept, neden: bNeden,
        log: [_mkLog('olusturuldu', 'Belgesiz harcama bildirildi')],
        kiraMeta: {
          bas:    (document.getElementById('b-ki-bas').value || ''),
          bit:    (document.getElementById('b-ki-bit').value || ''),
          gunluk: parseFloat(document.getElementById('b-ki-gun').value || '0') || 0
        }
      });
      _addToDeptBekleyen('Belgesiz Kiralama', bKat, bTut, true, bAciklama, fotos, bFisIdK);
      renderRecent();
    } else {
      var bFisId = Date.now();
      APP.data.fisler.unshift({
        id: bFisId, tarih: bTarih, personel: bPersonel, satici: 'Belgesiz Harcama',
        kat: bKat, tutar: bTut, durum: 'dept-bekleyen', donem: APP.ui.aktifDon,
        uyari: null, thumb: null, belgesiz: true, aciklama: bAciklama, fotos: fotos,
        dept: bDept, neden: bNeden,
        log: [_mkLog('olusturuldu', 'Belgesiz harcama bildirildi')]
      });
      _addToDeptBekleyen('Belgesiz Harcama', bKat, bTut, true, bAciklama, fotos, bFisId);
      renderRecent();
    }
    notif('Belgesiz harcama bildirildi', 'amber');
  }
  saveAppData();
  var _clr = function(id) { var el = document.getElementById(id); if (el) el.value = ''; };
  _clr('b-tutar'); _clr('b-aciklama'); _clr('b-neden');
  _clr('b-ul-km'); _clr('b-ul-binis'); _clr('b-ul-varis');
  _clr('b-ym-kisi'); _clr('b-ko-gece'); _clr('b-ko-kisi');
  _clr('b-ki-bas'); _clr('b-ki-bit'); _clr('b-ki-gun');
  var bKatEl2 = document.getElementById('b-kat');
  if (bKatEl2) bKatEl2.value = 'Diger';
  var bTarihEl = document.getElementById('b-tarih');
  if (bTarihEl) bTarihEl.value = new Date().toISOString().slice(0, 10);
  bFotolar = [];
  _bFotoRender();
  clearSig2();
}

/* ═══ AVANS ═══ */

export function submitAvans() {
  var t = document.getElementById('av-tutar').value;
  var g = (document.getElementById('av-gerekce').value || '').trim();
  if (!t) { notif('Tutar giriniz', 'red'); return; }
  if (!g) { notif('Gerekçe giriniz', 'red'); return; }
  var tutar = parseFloat(t) || 0;
  var uye   = APP.ui.curUser ? APP.ui.curUser.name : 'Saha';
  var ini   = APP.ui.curUser ? APP.ui.curUser.ini  : 'SH';
  var fKey  = APP.ui.curUserKey || 's';
  var d     = new Date();
  var tarih = (_pad(d.getDate())) + '.' + (_pad(d.getMonth()+1));
  closeM('mavans');

  APP.data.deptAvans.unshift({ id: Date.now(), uye: uye, ini: ini,
    tutar: tutar, tarih: tarih, gerekce: g, fromKey: fKey });
  renderDeptAvans();

  _pushNotif(fKey, 'bl', 'Avans Talebi Gönderildi',
    '₺' + tutar.toLocaleString('tr-TR') + ' avans talebi dept onayına iletildi.',
    'Az önce · Sistem');
  updateNotifBadge();

  _pushNotif('d', 'am', 'Yeni Avans Talebi',
    uye + ' — ₺' + tutar.toLocaleString('tr-TR') + ' · ' + g,
    'Az önce · ' + uye);

  notif('Avans talebi dept onayına gönderildi', 'green');
  saveAppData();
  document.getElementById('av-tutar').value   = '';
  document.getElementById('av-gerekce').value = '';
}

/* ═══ GİB DOĞRULAMA ═══ */

export function simGIB() {
  var el = document.getElementById('gib-res');
  if (el) el.textContent = 'Bağlanıyor...';
  setTimeout(function() {
    if (el) { el.textContent = '✅ GİB: Doğrulandı'; el.style.color = 'var(--gr2)'; }
    notif('GİB: Fatura doğrulandı', 'green');
  }, 1100);
}

/* ═══ İMZA ═══ */

export function initSig(cid, stid) {
  var c = document.getElementById(cid);
  if (!c) return;
  var ctx = c.getContext('2d');
  ctx.strokeStyle = '#EDF0F5';
  ctx.lineWidth   = 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  var drawing = false;

  function getPos(e) {
    var r = c.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return {
      x: (t.clientX - r.left) * (c.width  / r.width),
      y: (t.clientY - r.top)  * (c.height / r.height)
    };
  }
  function start(e) { drawing = true; var p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
  function draw(e) {
    if (!drawing) return;
    var p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    c.classList.add('signed');
    var st = document.getElementById(stid);
    if (st) st.textContent = '✅ İmzalandı — ' + new Date().toLocaleTimeString('tr-TR');
  }
  function stop() { drawing = false; }

  c.addEventListener('mousedown',  start);
  c.addEventListener('mousemove',  draw);
  c.addEventListener('mouseup',    stop);
  c.addEventListener('mouseleave', stop);
  c.addEventListener('touchstart', function(e) { e.preventDefault(); start(e); }, { passive: false });
  c.addEventListener('touchmove',  function(e) { e.preventDefault(); draw(e);  }, { passive: false });
  c.addEventListener('touchend',   stop, { passive: true });
}

export function clearSig() {
  var c = document.getElementById('sigc');
  if (c) { c.getContext('2d').clearRect(0, 0, c.width, c.height); c.classList.remove('signed'); }
  var st = document.getElementById('sig-st');
  if (st) st.textContent = '✍️ İmzalanmadı';
}

export function clearSig2() {
  var c = document.getElementById('sigc2');
  if (c) { c.getContext('2d').clearRect(0, 0, c.width, c.height); c.classList.remove('signed'); }
  var st = document.getElementById('sig2-st');
  if (st) st.textContent = '✍️ İmzalanmadı';
}

/* ═══ SESLİ GİRİŞ ═══ */

export function toggleVoice() {
  var btn = document.getElementById('vbtn');
  var ic  = document.getElementById('v-ic');
  var lbl = document.getElementById('v-lbl');
  if (!APP.ui.isRec) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      APP.ui.speechRecog = new SR();
      APP.ui.speechRecog.lang = 'tr-TR';
      APP.ui.speechRecog.onresult = function(e) {
        var txt = e.results[0][0].transcript;
        var ac  = document.getElementById('f-aciklama');
        if (ac) ac.value += (ac.value ? ' ' : '') + txt;
        notif('Ses metne çevrildi', 'green');
      };
      APP.ui.speechRecog.onerror = function() { notif('Ses tanıma hatası', 'red'); stopVoice(); };
      APP.ui.speechRecog.onend   = function() { stopVoice(); };
      APP.ui.speechRecog.start();
    } else {
      setTimeout(function() {
        var ac = document.getElementById('f-aciklama');
        if (ac) ac.value += (ac.value ? ' ' : '') + 'Araç yakıt harcaması.';
        notif('Ses çevrildi (simülasyon)', 'green');
        stopVoice();
      }, 2000);
    }
    APP.ui.isRec = true;
    if (btn) btn.classList.add('rec');
    if (ic)  ic.style.stroke = 'var(--rd)';
    if (lbl) lbl.textContent = '● Kayıt alınıyor...';
  } else {
    if (APP.ui.speechRecog) APP.ui.speechRecog.stop();
    stopVoice();
  }
}

export function stopVoice() {
  APP.ui.isRec = false;
  var btn = document.getElementById('vbtn');
  var ic  = document.getElementById('v-ic');
  var lbl = document.getElementById('v-lbl');
  if (btn) btn.classList.remove('rec');
  if (ic)  ic.style.stroke = 'currentColor';
  if (lbl) lbl.textContent = 'Sesli Açıklama';
}

/* ═══ LİGHTBOX ═══ */

export function openLBFis(fid) {
  var f = APP.data.fisler.find(function(x) { return x.id === fid; });
  if (!f) return;
  var src = f.thumb || fisThumbnail(f);
  document.getElementById('lb-img').src = src;
  var durumClr = { onaylandi:'#4ADE80', reddedildi:'#F87171', bekleyen:'#FCD34D', 'dept-bekleyen':'#FCD34D', 'acc-bekleyen':'#FCD34D' };
  var durumIco = { onaylandi:'✅', reddedildi:'❌', bekleyen:'⏳', 'dept-bekleyen':'⏳', 'acc-bekleyen':'⏳' };
  var durumTxt = { onaylandi:'Onaylandı', reddedildi:'Reddedildi', bekleyen:'Bekleyen', 'dept-bekleyen':'Bekleyen', 'acc-bekleyen':'Bekleyen' };
  var clr = durumClr[f.durum] || '#8A9090';
  var det = document.getElementById('lb-detail');
  det.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px">' +
      '<div style="font-size:15px;font-weight:700;color:#EDF0F5;flex:1;margin-right:10px">' + f.satici + '</div>' +
      '<div style="font-size:12px;font-weight:600;color:' + clr + ';white-space:nowrap">' +
        (durumIco[f.durum] || '') + ' ' + (durumTxt[f.durum] || f.durum) +
      '</div>' +
    '</div>' +
    '<div style="font-size:12px;color:#8A9090;margin-bottom:10px">' + f.tarih + ' · ' + f.kat + '</div>' +
    '<div style="font-size:22px;font-weight:700;font-family:monospace;color:#F0C080">&#8378;' + f.tutar.toLocaleString('tr-TR') + '</div>' +
    (f.uyari
      ? '<div style="margin-top:8px;padding:7px 10px;background:rgba(245,158,11,.1);border-radius:7px;font-size:12px;color:#FCD34D">&#9888;&#65039; ' + f.uyari + '</div>'
      : '') +
    (f.belgesiz
      ? '<div style="margin-top:8px;padding:7px 10px;background:rgba(59,130,246,.1);border-radius:7px;font-size:12px;color:#60A5FA">&#128203; Belgesiz giri&#351; &#8212; fi&#351; mevcut de&#287;il</div>'
      : '');
  det.classList.add('on');
  document.getElementById('lb').classList.add('on');
}

export function openLB(src, cap) {
  document.getElementById('lb-img').src = src;
  document.getElementById('lb-detail').classList.remove('on');
  document.getElementById('lb').classList.add('on');
}

export function closeLB() {
  document.getElementById('lb').classList.remove('on');
  document.getElementById('lb-detail').classList.remove('on');
}

document.getElementById('lb').addEventListener('click', function(e) {
  if (e.target === this) closeLB();
});

/* ═══ MODAL SİSTEMİ ═══ */

export function openM(id) { document.getElementById(id).classList.add('on'); }
export function closeM(id) { document.getElementById(id).classList.remove('on'); }

/* ═══ KISMI ONAY ═══ */

var _kismiPending = null;

export function openKismi(kaynak, id) {
  var src = kaynak === 'dept' ? APP.data.deptBekleyen : APP.data.accBekleyen;
  var item = null;
  for (var _ki = 0; _ki < src.length; _ki++) {
    if (src[_ki].id === id) { item = src[_ki]; break; }
  }
  if (!item) return;
  if (kaynak === 'acc' && item.tip === 'avans') {
    notif('Avansta kısmi onay uygulanamaz', 'amber'); return;
  }
  _kismiPending = { id: id, kaynak: kaynak, tutar: item.tutar, satici: item.satici, uye: item.uye };

  document.getElementById('md-kismi-info').textContent =
    item.uye + ' • ' + item.satici + ' • Toplam: ₺' + item.tutar.toLocaleString('tr-TR');
  var inp = document.getElementById('md-kismi-tutar');
  inp.value = '';
  inp.max = item.tutar - 1;
  document.getElementById('md-kismi-red-tutar').textContent = 'Reddedilecek: — TL';
  document.getElementById('md-kismi-neden').value = '';

  var _itemTutar = item.tutar;
  inp.oninput = function() {
    var t = parseFloat(inp.value) || 0;
    var r = _itemTutar - t;
    document.getElementById('md-kismi-red-tutar').textContent =
      (t > 0 && t < _itemTutar)
        ? 'Reddedilecek: ₺' + r.toLocaleString('tr-TR')
        : 'Reddedilecek: — TL (geçersiz tutar)';
  };

  openM('md-kismi');
}

export function kismiOnayla() {
  if (!_kismiPending) return;
  var t = parseFloat(document.getElementById('md-kismi-tutar').value);
  var n = document.getElementById('md-kismi-neden').value.trim();

  if (!t || t <= 0 || t >= _kismiPending.tutar) {
    notif('Onaylanacak tutar 0 ile ' + (_kismiPending.tutar - 1) + ' arasında olmalı', 'amber');
    return;
  }
  if (!n) { notif('Red nedeni zorunlu', 'amber'); return; }

  if (_kismiPending.kaynak === 'dept') {
    deptKismi(_kismiPending.id, t, n);
  } else {
    accKismi(_kismiPending.id, t, n);
  }
  _kismiPending = null;
}

/* ═══ HARCAMA DETAY MODALI ═══ */

var _fisDetCtx = '';
var _fisDetId  = 0;

export function openFisDetay(id, ctx) {
  _fisDetCtx = ctx;
  _fisDetId  = id;

  var f = null;
  if (ctx === 'dept') {
    for (var i = 0; i < APP.data.deptBekleyen.length; i++) {
      if (APP.data.deptBekleyen[i].id === id) { f = APP.data.deptBekleyen[i]; break; }
    }
  } else {
    for (var j = 0; j < APP.data.accBekleyen.length; j++) {
      if (APP.data.accBekleyen[j].id === id) { f = APP.data.accBekleyen[j]; break; }
    }
  }
  if (!f) return;

  var titleEl = document.getElementById('md-fisdet-title');
  if (titleEl) titleEl.textContent = ctx === 'dept' ? 'Harcama Detayı (Dept.)' : 'Harcama Detayı (Muhasebe)';

  var thumbEl = document.getElementById('fdet-thumb');
  if (thumbEl) {
    var isAvans = f.tip === 'avans';
    if (isAvans) {
      thumbEl.innerHTML = '<div class="fdet-thumb-ph">💰</div><div class="fdet-thumb-lbl">Avans Talebi</div>';
    } else if (f.belgesiz) {
      if (f.fotos && f.fotos.length) {
        thumbEl.innerHTML = '<img src="' + f.fotos[0].dataUrl + '" alt="kanıt" style="width:100%;height:100%;object-fit:cover;border-radius:var(--rs);cursor:pointer" onclick="_fdetFotoBuyut(0,' + f.id + ')">';
      } else {
        thumbEl.innerHTML = '<div class="fdet-thumb-ph">📋</div><div class="fdet-thumb-lbl">Belge Yok</div>';
      }
    } else {
      var demoIdx = id % (FIS_DEMO ? FIS_DEMO.length : 1);
      var demo    = FIS_DEMO && FIS_DEMO[demoIdx];
      if (demo && demo.img) {
        thumbEl.innerHTML = '<img src="' + demo.img + '" alt="fiş">';
      } else {
        thumbEl.innerHTML = '<div class="fdet-thumb-ph">🧾</div><div class="fdet-thumb-lbl">' + (f.satici || '—') + '</div>';
      }
    }
  }

  var uyWrap = document.getElementById('fdet-uyari-wrap');
  if (uyWrap) {
    var uyHtml = '';
    if (f.uyari)    uyHtml += '<div class="fdet-uyari">⚠ ' + f.uyari + '</div>';
    if (f.belgesiz) uyHtml += '<div class="fdet-belgesiz">📋 Belgesiz harcama' + (f.aciklama ? ' · ' + f.aciklama : '') + '</div>';
    uyWrap.innerHTML = uyHtml;
  }

  var rows = [];
  if (f.tip === 'avans') {
    rows.push(['Personel', f.uye]);
    rows.push(['Tutar',    '₺' + f.tutar.toLocaleString('tr-TR')]);
    rows.push(['Tarih',    f.tarih || '—']);
    rows.push(['Gerekçe',  f.gerekce || '—']);
    if (f.dept) rows.push(['Dept.', f.dept]);
    rows.push(['Açıklama', f.aciklama || '—']);
  } else {
    rows.push(['Satıcı',   f.satici || '—']);
    rows.push(['Tutar',    '₺' + f.tutar.toLocaleString('tr-TR')]);
    rows.push(['Tarih',    f.tarih || '—']);
    rows.push(['Kategori', SD_KAT_LBL[f.kat] || f.kat || '—']);
    rows.push(['Personel', f.uye || '—']);
    if (f.dept) rows.push(['Dept.', f.dept]);
    rows.push(['Açıklama', f.aciklama || '—']);
  }
  var rowsEl = document.getElementById('fdet-rows');
  if (rowsEl) {
    rowsEl.innerHTML = rows.map(function(r) {
      return '<div class="fdet-row"><div class="fdet-lbl">' + r[0] + '</div><div class="fdet-val">' + r[1] + '</div></div>';
    }).join('');
  }

  var fotosEl = document.getElementById('fdet-fotos');
  if (fotosEl) {
    var fts = f.fotos || [];
    if (fts.length) {
      fotosEl.innerHTML =
        '<div class="fdet-foto-sec">' +
          '<div class="fdet-foto-lbl">İş Kanıtı Fotoğrafları (' + fts.length + ')</div>' +
          '<div class="fdet-foto-grid">' +
          fts.map(function(ft, fi) {
            return '<div class="fdet-foto-item" onclick="_fdetFotoBuyut(' + fi + ',' + id + ')">' +
              '<img src="' + ft.dataUrl + '" alt="kanıt ' + (fi+1) + '">' +
            '</div>';
          }).join('') +
          '</div>' +
        '</div>';
    } else if (f.belgesiz) {
      fotosEl.innerHTML =
        '<div class="fdet-foto-sec">' +
          '<div style="font-size:12px;color:var(--tx3);padding:8px 0">📷 İş kanıtı fotoğrafı eklenmemiş</div>' +
        '</div>';
    } else {
      fotosEl.innerHTML = '';
    }

    var logHtml = '<div class="fdet-log-sec"><div class="fdet-log-lbl">İşlem Geçmişi</div>';
    var logList = f.log || [];
    if (!logList.length) {
      logHtml += '<div class="fdet-log-bos">Geçmiş kaydı yok</div>';
    } else {
      var icoMap = {
        olusturuldu: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--bl)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
        onaylandi:   '<svg viewBox="0 0 24 24" fill="none" stroke="var(--gr)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        reddedildi:  '<svg viewBox="0 0 24 24" fill="none" stroke="var(--rd)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
      };
      for (var li = 0; li < logList.length; li++) {
        var le  = logList[li];
        var ico = icoMap[le.aksiyon] || icoMap['olusturuldu'];
        logHtml += '<div class="fdet-log-item">' +
          '<div class="fdet-log-ico">' + ico + '</div>' +
          '<div class="fdet-log-txt">' +
            '<div class="fdet-log-kisi">' + _escHtml(le.kisi) + ' <span style="font-weight:400;color:var(--tx3)">(' + _escHtml(le.rol) + ')</span></div>' +
            '<div class="fdet-log-time">' + _fmtLogZaman(le.zaman) + '</div>' +
            (le.detay ? '<div class="fdet-log-detay">' + _escHtml(le.detay) + '</div>' : '') +
          '</div>' +
        '</div>';
      }
    }
    logHtml += '</div>';
    fotosEl.innerHTML += logHtml;
  }

  var actsEl = document.getElementById('fdet-acts');
  if (actsEl) {
    var isAvans2 = f.tip === 'avans';
    var kismiBtn = !isAvans2
      ? '<button class="btn" style="background:var(--ac);color:#fff" onclick="_fisDetAksiyon(\'kismi\')">½ Kısmi Onay</button>'
      : '';
    if (ctx === 'dept') {
      actsEl.innerHTML =
        '<button class="btn btn-g" onclick="_fisDetAksiyon(\'onayla\')">✓ Onayla</button>' +
        kismiBtn +
        '<button class="btn btn-r" onclick="_fisDetAksiyon(\'reddet\')">✕ Reddet</button>';
    } else {
      actsEl.innerHTML =
        '<button class="btn btn-g" onclick="_fisDetAksiyon(\'onayla\')">' +
          (isAvans2 ? '✓ Onayla & Aktar' : '✓ Onayla') + '</button>' +
        kismiBtn +
        '<button class="btn btn-r" onclick="_fisDetAksiyon(\'reddet\')">✕ Reddet</button>';
    }
  }

  openM('md-fisdet');
}

export function _fdetFotoBuyut(fotoIdx, fid) {
  var f = null;
  if (_fisDetCtx === 'dept') {
    for (var i = 0; i < APP.data.deptBekleyen.length; i++) if (APP.data.deptBekleyen[i].id === fid) { f = APP.data.deptBekleyen[i]; break; }
  } else {
    for (var j = 0; j < APP.data.accBekleyen.length; j++) if (APP.data.accBekleyen[j].id === fid) { f = APP.data.accBekleyen[j]; break; }
    if (!f) for (var k = 0; k < APP.data.fisler.length; k++) if (APP.data.fisler[k].id === fid) { f = APP.data.fisler[k]; break; }
  }
  if (f && f.fotos && f.fotos[fotoIdx]) openLB(f.fotos[fotoIdx].dataUrl);
}

export function _fisDetAksiyon(tip) {
  closeM('md-fisdet');
  if (_fisDetCtx === 'dept') {
    if      (tip === 'onayla') deptOnayla(_fisDetId);
    else if (tip === 'reddet') deptReddet(_fisDetId);
    else if (tip === 'kismi')  openKismi('dept', _fisDetId);
  } else {
    if      (tip === 'onayla') accOnayla(_fisDetId);
    else if (tip === 'reddet') accReddet(_fisDetId);
    else if (tip === 'kismi')  openKismi('acc', _fisDetId);
  }
}

/* ─── window global uyumluluk (inline onclick) ──────────────────────────── */

window.suNav              = suNav;
window.openNavSrch        = openNavSrch;
window.closeNavSrch       = closeNavSrch;
window.srchList           = srchList;
window.srchGoTo           = srchGoTo;
window.fisThumbnail       = fisThumbnail;
window.renderSahaButce    = renderSahaButce;
window.renderSahaKatLimits = renderSahaKatLimits;
window._katHarcanan       = _katHarcanan;
window._katBekleyen       = _katBekleyen;
window._checkKatLimit     = _checkKatLimit;
window.renderRecent       = renderRecent;
window._hideAllDynPanels  = _hideAllDynPanels;
window._showDynPanel      = _showDynPanel;
window._resetDynFields    = _resetDynFields;
window._detectKatFromFis  = _detectKatFromFis;
window.onKatChange        = onKatChange;
window.onBKatChange       = onBKatChange;
window._applyUlasimLimit  = _applyUlasimLimit;
window.checkUlasimLimit   = checkUlasimLimit;
window.checkBUlasimLimit  = checkBUlasimLimit;
window.openBelgesizModal  = openBelgesizModal;
window.submitBelgesiz     = submitBelgesiz;
window.submitAvans        = submitAvans;
window.simGIB             = simGIB;
window.initSig            = initSig;
window.clearSig           = clearSig;
window.clearSig2          = clearSig2;
window.toggleVoice        = toggleVoice;
window.stopVoice          = stopVoice;
window.openLBFis          = openLBFis;
window.openLB             = openLB;
window.closeLB            = closeLB;
window.openM              = openM;
window.closeM             = closeM;
window.openKismi          = openKismi;
window.kismiOnayla        = kismiOnayla;
window.openFisDetay       = openFisDetay;
window._fdetFotoBuyut     = _fdetFotoBuyut;
window._fisDetAksiyon     = _fisDetAksiyon;
