/* ═══════════════════════════════════════════════════════════════
   MUHASEBE MODÜLÜ — modules/muhasebe/muhasebe.js
   Adım 7A: index.html'den kopyalandı (silme yok)
   ═══════════════════════════════════════════════════════════════ */

import { APP }                                from '../core/state.js';
import { _todayISO, _dayDiff, _deptTarih,
         _projName, _setAvEl,
         _kiraDurum, _kiraCeza,
         _svgDonut, _mkLog }                  from '../core/utils.js';
import { saveAppData }                         from '../core/services/storage.service.js';
import { accOnayla, accReddet, accKismi }      from '../core/services/fis.service.js';
import { _recomputeAccDepts,
         _computeRaporDeptFis,
         _computeRaporPersonel }              from '../core/services/report.service.js';
import { _avGecmisEkle,
         _curDeptName, _avSortDesc }           from '../dept/dept.js';

/* ── Modül değişkenleri ──────────────────────────────────────── */
var _accDeptId            = '';
var _accUyeName           = '';
var _accUyeDept           = '';
var saRaporDeptId         = '';
var saRaporKisiIdx        = -1;
var saRaporKisiFrom       = '';
var saRaporSecilenDonemler = [2, 1, 0];

/* ── Global bağımlılıklar (index.html global scope'tan erişilir)
   notif, openM, closeM, _pushNotif, updateNotifBadge,
   renderRecent, renderFieldBudget, renderDeptSummary,
   openFisDetay, _checkPassiveApproval, _isPeriodClosed,
   _lateEntryModal, newPeriod, _periodCloseModal,
   showExportModal, SA_DONEM_DEPTS, _avRedPending,
   renderSohbetListesi, openYeniSohbetModal              ────── */


/* ═══ KİRA ═══════════════════════════════════════════════════ */

export function renderAccKira() {
  var el = document.getElementById('sa-pnl-kira');
  if (!el) return;
  var today = _todayISO();

  var deptler = ['yapim','kamera','sanat','ses','kostum'];
  var deptNm  = { yapim:'Yapım', kamera:'Kamera', sanat:'Sanat', ses:'Ses & Müzik', kostum:'Kostüm & Makyaj' };
  var deptClr = { yapim:'#E8962E', kamera:'#3B82F6', sanat:'#22C55E', ses:'#A855F7', kostum:'#EC4899' };

  var topAktif = 0, topGec = 0, gecSay = 0, iadeSay = 0;
  for (var i = 0; i < APP.data.accKiralamalar.length; i++) {
    var k = APP.data.accKiralamalar[i];
    var dur = _kiraDurum(k);
    if (dur !== 'iade') topAktif += k.tutar;
    if (dur === 'gec') { var _oc = _kiraCeza(k); topGec += _oc.ceza; gecSay++; }
    if (dur === 'iade') iadeSay++;
  }
  var aktifSay = APP.data.accKiralamalar.length - iadeSay;
  var cnt = document.getElementById('satb-kira-cnt');
  if (cnt) cnt.textContent = aktifSay;

  var html =
    '<div class="sa-kira-ozet">' +
      '<div class="sa-kira-ozet-c"><div style="font-size:14px;font-weight:800;font-family:var(--mo)">₺' + topAktif.toLocaleString('tr-TR') + '</div><div style="font-size:9px;text-transform:uppercase;color:var(--tx3);margin-top:3px">Aktif Toplam</div></div>' +
      '<div class="sa-kira-ozet-c"><div style="font-size:14px;font-weight:800;font-family:var(--mo);color:var(--rd2)">₺' + topGec.toLocaleString('tr-TR') + '</div><div style="font-size:9px;text-transform:uppercase;color:var(--tx3);margin-top:3px">Olası Ceza</div></div>' +
      '<div class="sa-kira-ozet-c"><div style="font-size:14px;font-weight:800;font-family:var(--mo);color:' + (gecSay > 0 ? 'var(--rd2)' : 'var(--gr2)') + '">' + gecSay + '</div><div style="font-size:9px;text-transform:uppercase;color:var(--tx3);margin-top:3px">Gecikmiş</div></div>' +
    '</div>';

  html += '<div class="sa-kira-sec-hd">Departman Özeti</div>';
  html += '<div class="sa-dept-card" style="padding:0;overflow:hidden;margin-bottom:14px">';
  html += '<table class="sa-kira-dept-tbl">';
  html += '<thead><tr><th>Departman</th><th>Aktif</th><th>Toplam ₺</th><th>Gecikme Cezası</th></tr></thead><tbody>';
  for (var dti = 0; dti < deptler.length; dti++) {
    var dId = deptler[dti];
    var dKiralar = APP.data.accKiralamalar.filter(function(k){ return k.deptId === dId; });
    if (!dKiralar.length) continue;
    var dAktif = 0, dTop = 0, dCeza = 0, dGec = 0;
    for (var dki2 = 0; dki2 < dKiralar.length; dki2++) {
      var dk2 = dKiralar[dki2];
      var dkDur = _kiraDurum(dk2);
      if (dkDur !== 'iade') { dAktif++; dTop += dk2.tutar; }
      if (dkDur === 'gec') { dGec++; var _dc = _kiraCeza(dk2); dCeza += _dc.ceza; }
    }
    html += '<tr>' +
      '<td class="nm"><div class="sa-kira-dept-dot" style="background:' + deptClr[dId] + '"></div>' + deptNm[dId] + '</td>' +
      '<td class="num">' + dAktif + (dGec > 0 ? ' <span style="color:var(--rd2);font-size:10px">(' + dGec + ' geç)</span>' : '') + '</td>' +
      '<td class="num">₺' + dTop.toLocaleString('tr-TR') + '</td>' +
      '<td class="' + (dCeza > 0 ? 'ceza' : 'num') + '">' + (dCeza > 0 ? '⚠ ₺' + dCeza.toLocaleString('tr-TR') : '—') + '</td>' +
    '</tr>';
  }
  html += '</tbody></table></div>';

  var gecmisler = APP.data.accKiralamalar.filter(function(k){ return _kiraDurum(k) === 'gec'; });
  if (gecmisler.length) {
    html += '<div class="sa-kira-sec-hd" style="color:var(--rd2)">🔴 Gecikmiş Kiralamalar (' + gecmisler.length + ')</div>';
    html += gecmisler.map(function(k) {
      var kalan = _dayDiff(today, k.bit);
      var c = _kiraCeza(k);
      var gecGun = c.gecGun;
      var topCeza = c.ceza;
      return '<div class="sa-kira-card gec">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">' +
          '<div>' +
            '<div style="font-size:13px;font-weight:700;color:var(--tx)">' + k.satici + '</div>' +
            '<div style="font-size:11px;color:var(--tx3);margin-top:2px">' + deptNm[k.deptId] + ' · ' + k.uye + ' · ' + k.kat + '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div style="font-size:14px;font-weight:800;font-family:var(--mo)">₺' + k.tutar.toLocaleString('tr-TR') + '</div>' +
            '<span class="sd-kira-tag sd-kira-tag-gec" style="margin-top:3px;display:inline-block">' + gecGun + ' gün geç</span>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--tx3);margin-top:5px">' + k.bas.split('-').reverse().join('.') + ' → ' + k.bit.split('-').reverse().join('.') + ' · ₺' + k.gunluk.toLocaleString('tr-TR') + '/gün</div>' +
        '<div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:8px 10px;margin-top:8px">' +
          '<div style="font-size:12px;font-weight:700;color:var(--rd2)">Gecikme Cezası Hesabı</div>' +
          '<div style="font-size:11px;color:var(--tx2);margin-top:4px">' + gecGun + ' gün × ₺' + k.gunluk.toLocaleString('tr-TR') + ' = <strong style="color:var(--rd2)">₺' + topCeza.toLocaleString('tr-TR') + '</strong></div>' +
          '<div style="font-size:10px;color:var(--tx3);margin-top:2px">İade tarihine kadar her gün ₺' + k.gunluk.toLocaleString('tr-TR') + ' eklenir</div>' +
        '</div>' +
        '<button class="btn btn-g btn-sm" style="margin-top:8px" onclick="accKiraIade(' + k.id + ')">✓ İade Alındı</button>' +
      '</div>';
    }).join('');
  }

  html += '<div class="sa-kira-sec-hd">Tüm Kiralamalar — Departman Bazlı</div>';
  deptler.forEach(function(dId) {
    var dKiralar = APP.data.accKiralamalar.filter(function(k){ return k.deptId === dId; });
    if (!dKiralar.length) return;

    dKiralar.sort(function(a, b) {
      var da = _kiraDurum(a), db = _kiraDurum(b);
      var ord = { gec:0, yak:1, ak:2, iade:3 };
      return (ord[da] || 0) - (ord[db] || 0);
    });

    html += '<div class="sa-kira-dept-hd">' +
      '<div style="width:10px;height:10px;border-radius:50%;background:' + deptClr[dId] + ';flex-shrink:0"></div>' +
      '<span>' + deptNm[dId] + '</span>' +
      '<span style="color:var(--tx3);font-size:10px">(' + dKiralar.length + ' kayıt)</span>' +
    '</div>';

    html += dKiralar.map(function(k) {
      var dur   = _kiraDurum(k);
      var kalan = _dayDiff(today, k.bit);
      var c     = _kiraCeza(k);
      var tagCls, tagTxt;
      if (dur === 'gec') { tagCls = 'sd-kira-tag sd-kira-tag-gec'; tagTxt = c.gecGun + ' gün geç'; }
      else if (dur === 'yak') { tagCls = 'sd-kira-tag sd-kira-tag-yak'; tagTxt = kalan === 0 ? 'Bugün' : kalan + ' gün'; }
      else if (dur === 'ak') { tagCls = 'sd-kira-tag sd-kira-tag-ak'; tagTxt = kalan + ' gün kaldı'; }
      else { tagCls = 'sd-kira-tag sd-kira-tag-iad'; tagTxt = 'İade'; }

      var cezaTxt = dur === 'gec'
        ? '<div style="font-size:11px;color:var(--rd2);font-weight:600;margin-top:5px">Gecikme cezası: ₺' + c.ceza.toLocaleString('tr-TR') + ' (' + c.gecGun + ' gün × ₺' + k.gunluk.toLocaleString('tr-TR') + ')</div>'
        : '';
      var iadeBtn = dur !== 'iade'
        ? '<button class="btn btn-g btn-sm" style="margin-top:8px" onclick="accKiraIade(' + k.id + ')">✓ İade Alındı</button>'
        : '<span style="font-size:11px;color:var(--tx3);display:block;margin-top:6px">✓ İade edildi</span>';
      return '<div class="sa-kira-card' + (dur === 'gec' ? ' gec' : dur === 'yak' ? ' yak' : '') + '">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">' +
          '<div>' +
            '<div style="font-size:13px;font-weight:700;color:var(--tx)">' + k.satici + '</div>' +
            '<div style="font-size:11px;color:var(--tx3);margin-top:2px">' + k.uye + ' · ' + k.kat + '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div style="font-size:14px;font-weight:800;font-family:var(--mo)">₺' + k.tutar.toLocaleString('tr-TR') + '</div>' +
            '<span class="' + tagCls + '" style="margin-top:3px;display:inline-block">' + tagTxt + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--tx3);margin-top:5px">' +
          k.bas.split('-').reverse().join('.') + ' → ' + k.bit.split('-').reverse().join('.') +
          ' · ₺' + k.gunluk.toLocaleString('tr-TR') + '/gün' +
          (k.gunluk && kalan !== 0 && dur !== 'iade' ? ' · <strong>' + Math.abs(kalan) + (kalan < 0 ? ' gün geç' : ' gün kaldı') + '</strong>' : '') +
        '</div>' +
        cezaTxt + iadeBtn +
      '</div>';
    }).join('');
  });

  el.innerHTML = html;
}

export function accKiraIade(id) {
  for (var i = 0; i < APP.data.accKiralamalar.length; i++) {
    if (APP.data.accKiralamalar[i].id === id) {
      var _ki = APP.data.accKiralamalar[i];
      var _ci = _kiraCeza(_ki);
      _ki.cezaGun = _ci.gecGun; _ki.cezaTutar = _ci.ceza;
      _ki.iade = true; break;
    }
  }
  for (var j = 0; j < APP.data.deptKira.length; j++) {
    if (APP.data.deptKira[j].id === id) {
      var _kj = APP.data.deptKira[j];
      var _cj = _kiraCeza(_kj);
      _kj.cezaGun = _cj.gecGun; _kj.cezaTutar = _cj.ceza;
      _kj.iade = true; break;
    }
  }
  renderAccKira();
  notif('İade alındı olarak işaretlendi', 'green');
  saveAppData();
}

/* ═══ AVANS ══════════════════════════════════════════════════ */

export function renderAccAvans() {
  var el = document.getElementById('sa-pnl-avans');
  if (!el) return;

  var aktifAv = _avSortDesc(APP.data.accBekleyen.filter(function(a){ return a.tip === 'avans'; }));

  var donBar = '<div class="sa-donem-bar" style="margin-bottom:14px">';
  for (var di = 0; di < APP.seed.saDonemler.length; di++) {
    var dp = APP.seed.saDonemler[di];
    var dpOn = APP.ui.saAvansDonem === dp.id ? ' on' : '';
    donBar += '<button class="sa-donem-pill' + dpOn + '" onclick="saAvansSetDonem(' + dp.id + ')">' +
      '<div style="font-size:12px;font-weight:700;color:' + (APP.ui.saAvansDonem === dp.id ? 'var(--ac2)' : 'var(--tx2)') + '">' + dp.lbl + '</div>' +
      (dp.aktif ? '<div style="font-size:9px;color:var(--gr);font-weight:700;margin-top:1px">● Aktif</div>' : '<div style="font-size:10px;color:var(--tx3);margin-top:1px">' + dp.tarih + '</div>') +
    '</button>';
  }
  donBar += '</div>';
  var html = donBar;

  if (aktifAv.length) {
    var bekTop = aktifAv.reduce(function(s,a){ return s + a.tutar; }, 0);
    html += '<div class="sa-av-don-hd"><span style="color:var(--am2)">⏳ Onay Bekleyen (' + aktifAv.length + ')</span><span style="color:var(--am2)">₺' + bekTop.toLocaleString('tr-TR') + '</span></div>';
    html += aktifAv.map(function(av) {
      var kaynakTag = av.fromKey === 'd'
        ? '<span style="font-size:10px;background:rgba(59,130,246,.12);color:var(--bl2);border-radius:5px;padding:1px 6px;margin-left:6px">Dept</span>'
        : '<span style="font-size:10px;background:rgba(232,150,46,.12);color:var(--ac2);border-radius:5px;padding:1px 6px;margin-left:6px">Saha</span>';
      return '<div class="sa-dept-card" style="margin-bottom:8px">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
          '<div class="sa-av-av" style="background:rgba(232,150,46,.15);color:var(--ac2)">' + av.ini + '</div>' +
          '<div style="flex:1"><div class="sa-av-name">' + av.uye + kaynakTag + '</div><div class="sa-av-sub">' + av.dept + ' · ' + av.tarih + '</div></div>' +
          '<div class="sa-av-tutar" style="color:var(--ac2)">₺' + av.tutar.toLocaleString('tr-TR') + '</div>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--tx2);margin-bottom:10px">Gerekçe: ' + (av.gerekce || '—') + '</div>' +
        '<div style="display:flex;gap:8px">' +
          '<button class="btn btn-g btn-sm" style="flex:1;justify-content:center" onclick="accOnayla(' + av.id + ')">✓ Onayla & Aktar</button>' +
          '<button class="btn btn-r btn-sm" style="flex:1;justify-content:center" onclick="accReddet(' + av.id + ')">Reddet</button>' +
        '</div>' +
      '</div>';
    }).join('');
    html += '<div style="text-align:right;font-size:11px;color:var(--tx3);padding:2px 2px 12px">Bekleyen toplam: <strong style="color:var(--am2)">₺' + bekTop.toLocaleString('tr-TR') + '</strong></div>';
  }

  var gecmisDonem = _avSortDesc(APP.data.accAvansGecmis.filter(function(av){ return av.donem === APP.ui.saAvansDonem; }));

  if (!gecmisDonem.length && !aktifAv.length) {
    el.innerHTML = html + '<div style="text-align:center;padding:30px 0;color:var(--tx3);font-size:13px">Bu dönem için avans kaydı yok</div>';
    return;
  }

  var bek  = gecmisDonem.filter(function(a){ return a.durum === 'bekleyen'; });
  var ode  = gecmisDonem.filter(function(a){ return a.durum === 'ödendi'; });
  var red  = gecmisDonem.filter(function(a){ return a.durum === 'reddedildi'; });

  function avRow(av) {
    var clr = av.durum === 'ödendi' ? 'sa-av-durum-ok' : (av.durum === 'reddedildi' ? 'sa-av-durum-red' : 'sa-av-durum-bek');
    var ico = av.durum === 'ödendi' ? '✅' : (av.durum === 'reddedildi' ? '❌' : '⏳');
    var redSatirAcc = (av.durum === 'reddedildi' && av.redNedeni)
      ? '<div style="font-size:11px;color:var(--rd2);margin-top:2px">Red nedeni: ' + av.redNedeni + '</div>'
      : '';
    return '<div class="sa-av-row" style="cursor:pointer" onclick="accAvansOpenKisi(\'' + av.uye.replace(/'/g, '\\x27') + '\')">' +
      '<div class="sa-av-av">' + av.ini + '</div>' +
      '<div class="sa-av-info">' +
        '<div class="sa-av-name">' + av.uye + '</div>' +
        '<div class="sa-av-sub">' + av.dept + ' · ' + av.tarih + '</div>' +
        '<div style="font-size:11px;color:var(--tx3);margin-top:2px">' + av.gerekce + '</div>' +
        redSatirAcc +
      '</div>' +
      '<div class="sa-av-right">' +
        '<div class="sa-av-tutar">₺' + av.tutar.toLocaleString('tr-TR') + '</div>' +
        '<div class="sa-av-durum ' + clr + '">' + ico + ' ' + av.durum + '</div>' +
      '</div>' +
    '</div>';
  }

  if (bek.length) {
    var bTop = bek.reduce(function(s,a){ return s + a.tutar; }, 0);
    html += '<div class="sa-av-don-hd"><span style="color:var(--am2)">⏳ Bekleyen (' + bek.length + ')</span><span>₺' + bTop.toLocaleString('tr-TR') + '</span></div>';
    html += bek.map(avRow).join('');
    html += '<div style="text-align:right;font-size:10px;color:var(--tx3);padding-bottom:8px">Toplam: ₺' + bTop.toLocaleString('tr-TR') + '</div>';
  }
  if (ode.length) {
    var oTop = ode.reduce(function(s,a){ return s + a.tutar; }, 0);
    html += '<div class="sa-av-don-hd"><span style="color:var(--gr2)">✅ Ödendi (' + ode.length + ')</span><span>₺' + oTop.toLocaleString('tr-TR') + '</span></div>';
    html += ode.map(avRow).join('');
    html += '<div style="text-align:right;font-size:10px;color:var(--tx3);padding-bottom:8px">Toplam: ₺' + oTop.toLocaleString('tr-TR') + '</div>';
  }
  if (red.length) {
    var rTop = red.reduce(function(s,a){ return s + a.tutar; }, 0);
    html += '<div class="sa-av-don-hd"><span style="color:var(--rd2)">❌ Reddedildi (' + red.length + ')</span><span>₺' + rTop.toLocaleString('tr-TR') + '</span></div>';
    html += red.map(avRow).join('');
    html += '<div style="text-align:right;font-size:10px;color:var(--tx3);padding-bottom:8px">Toplam: ₺' + rTop.toLocaleString('tr-TR') + '</div>';
  }

  if (gecmisDonem.length) {
    var donTop = gecmisDonem.reduce(function(s,a){ return s + a.tutar; }, 0);
    html += '<div style="border-top:1px solid var(--bo);padding-top:10px;margin-top:4px;display:flex;justify-content:space-between;align-items:center">' +
      '<span style="font-size:11px;color:var(--tx3)">Dönem Toplamı (' + gecmisDonem.length + ' kayıt)</span>' +
      '<strong style="font-size:13px;font-family:var(--mo)">₺' + donTop.toLocaleString('tr-TR') + '</strong>' +
    '</div>';
  }

  el.innerHTML = html;
}

export function saAvansSetDonem(id) {
  APP.ui.saAvansDonem = id;
  renderAccAvans();
}

export function accAvansOpenKisi(name) {
  var idx = -1;
  for (var i = 0; i < APP.cache.accRaporPersonel.length; i++) {
    if (APP.cache.accRaporPersonel[i].name === name) { idx = i; break; }
  }
  if (idx < 0) { notif('Personel raporu bulunamadı', 'amber'); return; }
  APP.ui.saRaporTip = 'personel';
  saRaporDeptId     = '';
  saRaporKisiIdx    = idx;
  saRaporKisiFrom   = 'list';
  saTab('rapor', document.getElementById('satb-rapor'));
}

export function saSetDonem(id) {
  APP.ui.saSeciliDonem = id;
  renderAccDash();
}

/* ═══ DEPT DETAY MODALI ══════════════════════════════════════ */

export function openAccDeptDetay(deptId) {
  _accDeptId = deptId;
  var d = null;
  for (var i = 0; i < APP.data.accDepts.length; i++) {
    if (APP.data.accDepts[i].id === deptId) { d = APP.data.accDepts[i]; break; }
  }
  if (!d) return;

  var titleEl = document.getElementById('adept-title');
  var subEl   = document.getElementById('adept-sub');
  if (titleEl) titleEl.textContent = d.name + ' Departmanı';
  if (subEl)   subEl.textContent   = d.uye + ' kişi · Aktif dönem';

  var statsEl = document.getElementById('adept-stats');
  if (statsEl) {
    statsEl.innerHTML =
      '<div class="adept-stat-c"><div class="adept-stat-val">₺' + d.total.toLocaleString('tr-TR') + '</div><div class="adept-stat-lbl">Toplam</div></div>' +
      '<div class="adept-stat-c"><div class="adept-stat-val" style="color:var(--gr2)">₺' + d.onay.toLocaleString('tr-TR') + '</div><div class="adept-stat-lbl">Onaylı</div></div>' +
      '<div class="adept-stat-c"><div class="adept-stat-val" style="color:var(--am2)">₺' + d.bekleyen.toLocaleString('tr-TR') + '</div><div class="adept-stat-lbl">Bekleyen</div></div>' +
      '<div class="adept-stat-c"><div class="adept-stat-val" style="color:' + (d.suphe > 0 ? 'var(--rd2)' : 'var(--tx3)') + '">₺' + d.suphe.toLocaleString('tr-TR') + '</div><div class="adept-stat-lbl">Şüpheli</div></div>';
  }

  accDeptTab('ekip', document.getElementById('adepttb-ekip'));
  openM('md-acc-dept');
}

export function accDeptTab(t, el) {
  var tabs = ['ekip','bek','don','avans','gecmis'];
  for (var i = 0; i < tabs.length; i++) {
    var p = document.getElementById('adept-pnl-' + tabs[i]);
    if (p) p.style.display = (tabs[i] === t) ? 'block' : 'none';
    var b = document.getElementById('adepttb-' + tabs[i]);
    if (b) b.classList.remove('on');
  }
  if (el) el.classList.add('on');
  if (t === 'ekip')   _renderAdeptEkip(_accDeptId);
  if (t === 'bek')    _renderAdeptBek(_accDeptId);
  if (t === 'don')    _renderAdeptDon(_accDeptId);
  if (t === 'avans')  _renderAdeptAvans(_accDeptId);
  if (t === 'gecmis') _renderAdeptGecmis(_accDeptId);
}

function _renderAdeptEkip(deptId) {
  var el   = document.getElementById('adept-pnl-ekip');
  var list = APP.cache.accDeptUyeler[deptId] || [];
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div style="padding:20px 16px;color:var(--tx3);font-size:13px">Ekip verisi yok</div>'; return; }
  el.innerHTML = list.map(function(u) {
    return '<div class="adept-uye-row" onclick="openAccUyeDetay(\'' + u.name.replace(/'/g, "\\'") + '\',\'' + deptId + '\')">' +
      '<div class="adept-uye-av">' + u.ini + '</div>' +
      '<div>' +
        '<div class="adept-uye-name">' + u.name + '</div>' +
        '<div class="adept-uye-rol">' + u.rol + '</div>' +
      '</div>' +
      '<div class="adept-uye-right">' +
        '<div class="adept-uye-total">₺' + u.total.toLocaleString('tr-TR') + '</div>' +
        (u.bek > 0
          ? '<div class="adept-uye-bek">₺' + u.bek.toLocaleString('tr-TR') + ' bekleyen</div>'
          : '<div class="adept-uye-ok">Bekleyen yok</div>') +
      '</div>' +
    '</div>';
  }).join('');
}

function _renderAdeptBek(deptId) {
  var el = document.getElementById('adept-pnl-bek');
  if (!el) return;
  var deptName = '';
  for (var i = 0; i < APP.data.accDepts.length; i++) if (APP.data.accDepts[i].id === deptId) { deptName = APP.data.accDepts[i].name; break; }
  var items = APP.data.accBekleyen.filter(function(f) { return f.dept === deptName; });
  if (!items.length) { el.innerHTML = '<div style="padding:20px 16px;color:var(--tx3);font-size:13px">Bekleyen harcama yok</div>'; return; }
  el.innerHTML = items.map(function(f) {
    var uyHtml = f.uyari ? '<div style="font-size:11px;color:var(--am2);margin-top:3px">⚠ ' + f.uyari + '</div>' : '';
    return '<div class="uye-hist-row" style="cursor:pointer" onclick="closeM(\'md-acc-dept\');openFisDetay(' + f.id + ',\'acc\')">' +
      '<div class="uye-hist-dot" style="background:var(--am)"></div>' +
      '<div class="uye-hist-info">' +
        '<div class="uye-hist-satici">' + (f.belgesiz ? '📋 ' : '') + (f.satici || '—') + '</div>' +
        '<div class="uye-hist-meta">' + f.uye + ' · ' + f.kat + ' · ' + f.tarih + '</div>' +
        uyHtml +
      '</div>' +
      '<div class="uye-hist-tutar">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
    '</div>';
  }).join('');
}

function _renderAdeptDon(deptId) {
  var el   = document.getElementById('adept-pnl-don');
  var list = APP.cache.accDeptDonemler[deptId] || [];
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div style="padding:20px 16px;color:var(--tx3);font-size:13px">Dönem verisi yok</div>'; return; }
  el.innerHTML = list.map(function(d) {
    var redClr = d.red > 0 ? 'var(--rd2)' : 'var(--tx3)';
    return '<div class="adept-don-card">' +
      '<div class="adept-don-lbl">' + d.lbl + '</div>' +
      '<div class="adept-don-grid">' +
        '<div class="adept-don-cell"><div class="adept-don-val">₺' + d.total.toLocaleString('tr-TR') + '</div><div class="adept-don-sub">Toplam</div></div>' +
        '<div class="adept-don-cell"><div class="adept-don-val" style="color:var(--gr2)">₺' + d.onay.toLocaleString('tr-TR') + '</div><div class="adept-don-sub">Onaylı</div></div>' +
        '<div class="adept-don-cell"><div class="adept-don-val" style="color:' + (d.bek > 0 ? 'var(--am2)' : 'var(--tx3)') + '">₺' + d.bek.toLocaleString('tr-TR') + '</div><div class="adept-don-sub">Bekleyen</div></div>' +
        '<div class="adept-don-cell"><div class="adept-don-val" style="color:' + redClr + '">₺' + d.red.toLocaleString('tr-TR') + '</div><div class="adept-don-sub">Reddedildi</div></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function _renderAdeptAvans(deptId) {
  var el   = document.getElementById('adept-pnl-avans');
  var list = APP.cache.accDeptAvans[deptId] || [];
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div style="padding:20px 16px;color:var(--tx3);font-size:13px">Avans kaydı yok</div>'; return; }
  el.innerHTML = list.map(function(a) {
    var tagCls = a.durum === 'ödendi' ? 'uye-av-tag uye-av-tag-ok' : 'uye-av-tag uye-av-tag-bek';
    return '<div class="adept-av-row">' +
      '<div class="adept-av-av">' + a.ini + '</div>' +
      '<div class="adept-av-info">' +
        '<div class="adept-av-name">' + a.name + '</div>' +
        '<div class="adept-av-tarih">' + a.tarih + ' · ' + a.gerekce + '</div>' +
      '</div>' +
      '<div class="adept-av-right">' +
        '<div class="adept-av-tutar">₺' + a.tutar.toLocaleString('tr-TR') + '</div>' +
        '<div class="' + tagCls + '" style="margin-top:3px;display:inline-block">' + a.durum + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function _renderAdeptGecmis(deptId) {
  var el   = document.getElementById('adept-pnl-gecmis');
  var list = APP.cache.accDeptGecmis[deptId] || [];
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div style="padding:20px 16px;color:var(--tx3);font-size:13px">Geçmiş işlem yok</div>'; return; }
  el.innerHTML = list.map(function(g) {
    var isOnay = g.durum === 'onay';
    var isInc  = g.durum === 'inc';
    var dotClr = isOnay ? 'var(--gr)' : (isInc ? 'var(--am)' : 'var(--rd)');
    var tag    = isOnay ? 'Onaylandı' : (isInc ? 'İnceleniyor' : 'Reddedildi');
    var tagClr = isOnay ? 'var(--gr2)' : (isInc ? 'var(--am2)' : 'var(--rd2)');
    return '<div class="adept-gc-row">' +
      '<div class="adept-gc-dot" style="background:' + dotClr + '"></div>' +
      '<div class="adept-gc-info">' +
        '<div class="adept-gc-satici">' + g.ini + ' — ' + g.satici + '</div>' +
        '<div class="adept-gc-meta">' + g.tarih + (g.sebep ? ' · ' + g.sebep : '') + '</div>' +
      '</div>' +
      '<div class="adept-gc-right">' +
        '<div class="adept-gc-tutar">₺' + g.tutar.toLocaleString('tr-TR') + '</div>' +
        '<div class="adept-gc-sebep" style="color:' + tagClr + '">' + tag + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ═══ ÜYE DETAY MODALI ═══════════════════════════════════════ */

export function openAccUyeDetay(uyeName, deptId) {
  _accUyeName = uyeName;
  _accUyeDept = deptId;

  var list = APP.cache.accDeptUyeler[deptId] || [];
  var u = null;
  for (var i = 0; i < list.length; i++) {
    if (list[i].name === uyeName) { u = list[i]; break; }
  }
  if (!u) return;

  var deptName = '';
  for (var j = 0; j < APP.data.accDepts.length; j++) if (APP.data.accDepts[j].id === deptId) { deptName = APP.data.accDepts[j].name; break; }

  var avEl   = document.getElementById('acuye-av');
  var nameEl = document.getElementById('acuye-name');
  var rolEl  = document.getElementById('acuye-rol');
  if (avEl)   avEl.textContent   = u.ini;
  if (nameEl) nameEl.textContent = u.name;
  if (rolEl)  rolEl.textContent  = u.rol + ' · ' + deptName;

  var statsEl = document.getElementById('acuye-stats');
  if (statsEl) {
    statsEl.innerHTML =
      '<div class="uye-stat-c"><div class="uye-stat-val">₺' + u.total.toLocaleString('tr-TR') + '</div><div class="uye-stat-lbl">Toplam</div></div>' +
      '<div class="uye-stat-c"><div class="uye-stat-val" style="color:var(--gr)">₺' + u.onay.toLocaleString('tr-TR') + '</div><div class="uye-stat-lbl">Onaylanan</div></div>' +
      '<div class="uye-stat-c"><div class="uye-stat-val" style="color:' + (u.bek > 0 ? 'var(--am2)' : 'var(--tx3)') + '">₺' + u.bek.toLocaleString('tr-TR') + '</div><div class="uye-stat-lbl">Bekleyen</div></div>';
  }

  accUyeTab('bek', document.getElementById('acuyetb-bek'));
  openM('md-acc-uye');
}

export function accUyeTab(t, el) {
  var tabs = ['bek','don','avans'];
  for (var i = 0; i < tabs.length; i++) {
    var p = document.getElementById('acuye-pnl-' + tabs[i]);
    if (p) p.style.display = (tabs[i] === t) ? 'block' : 'none';
    var b = document.getElementById('acuyetb-' + tabs[i]);
    if (b) b.classList.remove('on');
  }
  if (el) el.classList.add('on');
  if (t === 'bek')   _renderAccUyeBek();
  if (t === 'don')   _renderAccUyeDon();
  if (t === 'avans') _renderAccUyeAvans();
}

function _renderAccUyeBek() {
  var el = document.getElementById('acuye-pnl-bek');
  if (!el) return;
  var items = APP.data.accBekleyen.filter(function(f) { return f.uye === _accUyeName; });
  if (!items.length) {
    el.innerHTML = '<div style="padding:20px 16px;color:var(--tx3);font-size:13px">Bekleyen harcama yok</div>';
    return;
  }
  el.innerHTML = items.map(function(f) {
    var uyHtml = f.uyari ? '<div style="font-size:11px;color:var(--am2);margin-top:2px">⚠ ' + f.uyari + '</div>' : '';
    return '<div class="uye-hist-row" style="cursor:pointer" onclick="closeM(\'md-acc-uye\');openFisDetay(' + f.id + ',\'acc\')">' +
      '<div class="uye-hist-dot" style="background:var(--am)"></div>' +
      '<div class="uye-hist-info">' +
        '<div class="uye-hist-satici">' + (f.belgesiz ? '📋 ' : '') + (f.satici || '—') + '</div>' +
        '<div class="uye-hist-meta">' + f.kat + ' · ' + f.tarih + '</div>' +
        uyHtml +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">' +
        '<div class="uye-hist-tutar">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
        '<div class="uye-hist-tag uye-hist-tag-bek">Bekleyen</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function _renderAccUyeDon() {
  var el = document.getElementById('acuye-pnl-don');
  if (!el) return;
  var donList = APP.cache.accDeptDonemler[_accUyeDept] || [];
  if (!donList.length) { el.innerHTML = '<div style="padding:20px 16px;color:var(--tx3);font-size:13px">Dönem verisi yok</div>'; return; }
  el.innerHTML = donList.map(function(d) {
    return '<div class="adept-don-card">' +
      '<div class="adept-don-lbl">' + d.lbl + '</div>' +
      '<div class="adept-don-grid">' +
        '<div class="adept-don-cell"><div class="adept-don-val">₺' + d.total.toLocaleString('tr-TR') + '</div><div class="adept-don-sub">Dept. Toplamı</div></div>' +
        '<div class="adept-don-cell"><div class="adept-don-val" style="color:var(--gr2)">₺' + d.onay.toLocaleString('tr-TR') + '</div><div class="adept-don-sub">Onaylı</div></div>' +
        '<div class="adept-don-cell"><div class="adept-don-val" style="color:' + (d.bek > 0 ? 'var(--am2)' : 'var(--tx3)') + '">₺' + d.bek.toLocaleString('tr-TR') + '</div><div class="adept-don-sub">Bekleyen</div></div>' +
        '<div class="adept-don-cell"><div class="adept-don-val" style="color:' + (d.red > 0 ? 'var(--rd2)' : 'var(--tx3)') + '">₺' + d.red.toLocaleString('tr-TR') + '</div><div class="adept-don-sub">Reddedildi</div></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function _renderAccUyeAvans() {
  var el = document.getElementById('acuye-pnl-avans');
  if (!el) return;
  var deptAvans = APP.cache.accDeptAvans[_accUyeDept] || [];
  var items = deptAvans.filter(function(a) { return a.name === _accUyeName; });
  if (!items.length) { el.innerHTML = '<div style="padding:20px 16px;color:var(--tx3);font-size:13px">Avans kaydı yok</div>'; return; }
  el.innerHTML = items.map(function(a) {
    var tagCls = a.durum === 'ödendi' ? 'uye-av-tag uye-av-tag-ok' : 'uye-av-tag uye-av-tag-bek';
    return '<div class="uye-av-row">' +
      '<div class="uye-av-info">' +
        '<div class="uye-av-tutar">₺' + a.tutar.toLocaleString('tr-TR') + '</div>' +
        '<div class="uye-av-gerekce">' + a.gerekce + '</div>' +
        '<div class="uye-av-meta">' + a.tarih + '</div>' +
      '</div>' +
      '<div class="' + tagCls + '">' + a.durum + '</div>' +
    '</div>';
  }).join('');
}

/* ═══ ANA EKRAN ══════════════════════════════════════════════ */

export function renderAcc() {
  if (!APP.ui.curUser || !APP.ui.curProj) return;
  _setAvEl(document.getElementById('sa-hd-av'), APP.ui.curUser, APP.ui.curUserKey);
  document.getElementById('sa-hd-prj').textContent = _projName(APP.ui.curProj.id);
  var bCnt = document.getElementById('satb-bek-cnt');
  if (bCnt) bCnt.textContent = APP.data.accBekleyen.length;
  var sCnt = document.getElementById('satb-suphe-cnt');
  if (sCnt) sCnt.textContent = APP.data.accSuphe.filter(function(s){ return s.durum === 'bek' || s.durum === 'inc'; }).length;
  renderAccDash();
  renderAccBek();
  renderAccSuphe();
  renderAccRapor(APP.ui.saRaporTip);
  renderAccKira();
  renderAccMesaj();
  saTab('dash', document.getElementById('satb-dash'));
}

export function saTab(t, el) {
  var panels = ['dash','bek','suphe','rapor','kira','avans','mesaj'];
  for (var i = 0; i < panels.length; i++) {
    var p = document.getElementById('sa-pnl-' + panels[i]);
    if (p) p.style.display = (panels[i] === t) ? 'block' : 'none';
  }
  var btns = document.querySelectorAll('.sa-tb');
  for (var j = 0; j < btns.length; j++) btns[j].classList.remove('on');
  if (el) el.classList.add('on');
  if (t === 'kira')  renderAccKira();
  if (t === 'avans') renderAccAvans();
}

export function openAccButceDuzenle() {
  var el = document.getElementById('mbutce-body');
  if (!el) return;
  var deptRows = '<div class="butce-modal-sec-hd">Departman Bütçeleri</div>' +
    APP.data.accDepts.map(function(d) {
      return '<div class="butce-modal-row">' +
        '<div class="butce-modal-dot" style="background:' + d.renk + '"></div>' +
        '<div class="butce-modal-name">' + d.name + '</div>' +
        '<input class="butce-modal-inp" id="butce-inp-' + d.id + '" type="number" min="0" step="1000" value="' + (d.butce || 0) + '">' +
      '</div>';
    }).join('');
  var katRows = '<div class="butce-modal-sec-hd">Kategori Limitleri</div>' +
    APP.seed.katLimit.map(function(km) {
      return '<div class="butce-modal-row">' +
        '<div class="butce-modal-dot" style="background:' + km.clr + '"></div>' +
        '<div class="butce-modal-name">' + km.lbl + '</div>' +
        '<input class="butce-modal-inp" id="kat-inp-' + km.kat + '" type="number" min="0" step="500" value="' + (km.limit || 0) + '">' +
      '</div>';
    }).join('');
  el.innerHTML = deptRows + katRows;
  openM('mbutce');
}

export function accButceKaydet() {
  for (var i = 0; i < APP.data.accDepts.length; i++) {
    var di = document.getElementById('butce-inp-' + APP.data.accDepts[i].id);
    if (di) { var dv = parseInt(di.value, 10); if (!isNaN(dv) && dv >= 0) APP.data.accDepts[i].butce = dv; }
  }
  var toplamButce = 0;
  for (var t = 0; t < APP.data.accDepts.length; t++) toplamButce += APP.data.accDepts[t].butce || 0;
  for (var b = 0; b < APP.data.donemButce.length; b++) {
    if (APP.data.donemButce[b].donem === APP.ui.aktifDon) { APP.data.donemButce[b].butce = toplamButce; break; }
  }
  for (var j = 0; j < APP.seed.katLimit.length; j++) {
    var ki = document.getElementById('kat-inp-' + APP.seed.katLimit[j].kat);
    if (ki) { var kv = parseInt(ki.value, 10); if (!isNaN(kv) && kv >= 0) APP.seed.katLimit[j].limit = kv; }
  }
  closeM('mbutce');
  renderAccDash();
  renderFieldBudget();
  renderDeptSummary();
  notif('Bütçe ve kategori limitleri güncellendi', 'green');
  saveAppData();
}

/* ═══ DASHBOARD ══════════════════════════════════════════════ */

export function renderAccDash() {
  _recomputeAccDepts();
  var el = document.getElementById('sa-pnl-dash');
  if (!el) return;

  var donBar = '<div class="sa-donem-bar">';
  for (var di = 0; di < APP.seed.saDonemler.length; di++) {
    var dp = APP.seed.saDonemler[di];
    var dpOn = APP.ui.saSeciliDonem === dp.id ? ' on' : '';
    var dpSub = dp.aktif
      ? '<div style="font-size:9px;color:var(--gr);font-weight:700;margin-top:1px">● Aktif</div>'
      : '<div style="font-size:10px;color:var(--tx3);margin-top:1px">' + dp.tarih + '</div>';
    donBar += '<button class="sa-donem-pill' + dpOn + '" onclick="saSetDonem(' + dp.id + ')">' +
      '<div style="font-size:12px;font-weight:700;color:' + (APP.ui.saSeciliDonem === dp.id ? 'var(--ac2)' : 'var(--tx2)') + '">' + dp.lbl + '</div>' +
      dpSub +
    '</button>';
  }
  donBar += '</div>';

  var depts = APP.ui.saSeciliDonem === 2 ? APP.data.accDepts : (window.SA_DONEM_DEPTS[APP.ui.saSeciliDonem] || []);
  var donRec = null;
  for (var dri = 0; dri < APP.seed.saDonemler.length; dri++) if (APP.seed.saDonemler[dri].id === APP.ui.saSeciliDonem) { donRec = APP.seed.saDonemler[dri]; break; }
  var isAktif = APP.ui.saSeciliDonem === 2;

  var totalTop = 0, totalOnay = 0, totalBek = 0, totalRed = 0;
  for (var i = 0; i < depts.length; i++) {
    totalTop  += depts[i].total;
    totalOnay += depts[i].onay;
    totalBek  += (depts[i].bekleyen || 0);
    totalRed  += (depts[i].red || 0);
  }

  var aktifDon = APP.seed.donemler.find(function(x) { return x.id === APP.ui.aktifDon; });
  var donYonHtml = '<div style="display:flex;align-items:center;gap:8px;padding:10px 0 4px;margin-bottom:8px;border-bottom:1px solid var(--bo)">' +
    '<span style="font-size:12px;font-weight:700;color:var(--tx2)">Dönem Yönetimi</span>' +
    '<span style="flex:1;font-size:12px;color:var(--tx3)">' +
      (aktifDon ? aktifDon.lbl + ' — <span style="color:var(--gr2)">Açık</span>' : 'Dönem yok') +
    '</span>' +
    '<button class="btn btn-sm btn-p" onclick="newPeriod()" style="font-size:11px;padding:4px 10px">+ Yeni Dönem</button>' +
    (aktifDon ? '<button class="btn btn-sm" onclick="_periodCloseModal(' + APP.ui.aktifDon + ')" style="font-size:11px;padding:4px 10px;background:rgba(239,68,68,.12);color:var(--rd2);border:1px solid rgba(239,68,68,.3)">Dönem Kapat</button>' : '') +
  '</div>';

  var html = donYonHtml + donBar;

  html += '<div class="sa-genel">';
  html += '<div class="sa-genel-lbl">Toplam Harcama</div>';
  html += '<div class="sa-genel-total">₺' + totalTop.toLocaleString('tr-TR') + '</div>';
  html += '<div class="sa-genel-sub">' + APP.ui.curProj.name + ' · ' + (donRec ? donRec.lbl + (isAktif ? ' — Aktif' : ' — Kapalı') : '') + '</div>';
  html += '<div class="sa-genel-row">';
  html += '<div class="sa-genel-stat"><div class="sa-genel-stat-val" style="color:var(--gr2)">₺' + totalOnay.toLocaleString('tr-TR') + '</div><div class="sa-genel-stat-lbl">Onaylı</div></div>';
  if (isAktif) {
    html += '<div class="sa-genel-stat"><div class="sa-genel-stat-val" style="color:var(--am2)">₺' + totalBek.toLocaleString('tr-TR') + '</div><div class="sa-genel-stat-lbl">Bekleyen</div></div>';
    html += '<div class="sa-genel-stat"><div class="sa-genel-stat-val" style="color:var(--rd2)">' + APP.data.accSuphe.length + '</div><div class="sa-genel-stat-lbl">Şüpheli</div></div>';
  } else {
    html += '<div class="sa-genel-stat"><div class="sa-genel-stat-val" style="color:var(--rd2)">₺' + totalRed.toLocaleString('tr-TR') + '</div><div class="sa-genel-stat-lbl">Reddedildi</div></div>';
    var pctKul = totalTop > 0 ? Math.round(totalOnay / totalTop * 100) : 0;
    html += '<div class="sa-genel-stat"><div class="sa-genel-stat-val" style="color:var(--tx2)">%' + pctKul + '</div><div class="sa-genel-stat-lbl">Onay Oranı</div></div>';
  }
  html += '</div></div>';

  if (isAktif) {
    html += '<div style="display:flex;justify-content:flex-end;margin-bottom:10px">' +
      '<button class="sa-edit-butce-btn" onclick="openAccButceDuzenle()">✏ Bütçeleri Düzenle</button>' +
    '</div>';
  }

  for (var k = 0; k < depts.length; k++) {
    var d = depts[k];
    var pct = totalTop > 0 ? Math.round(d.total / totalTop * 100) : 0;
    var clickHandler = isAktif ? 'onclick="openAccDeptDetay(\'' + d.id + '\')"' : '';
    html += '<div class="sa-dept-card" style="cursor:' + (isAktif ? 'pointer' : 'default') + '" ' + clickHandler + '>';
    html += '<div class="sa-dc-hd"><div class="sa-dc-dot" style="background:' + d.renk + '"></div><div class="sa-dc-name">' + d.name + '</div><div class="sa-dc-uye">' + d.uye + ' kişi' + (isAktif ? ' ›' : '') + '</div></div>';
    html += '<div class="sa-dc-stats">';
    html += '<div><div class="sa-dc-stat-lbl">Toplam</div><div class="sa-dc-stat-val">₺' + d.total.toLocaleString('tr-TR') + '</div></div>';
    html += '<div><div class="sa-dc-stat-lbl">Onaylı</div><div class="sa-dc-stat-val" style="color:var(--gr2)">₺' + d.onay.toLocaleString('tr-TR') + '</div></div>';
    if (isAktif) {
      html += '<div><div class="sa-dc-stat-lbl">Bekleyen</div><div class="sa-dc-stat-val" style="color:var(--am2)">₺' + (d.bekleyen || 0).toLocaleString('tr-TR') + '</div></div>';
      html += '<div><div class="sa-dc-stat-lbl">Şüpheli</div><div class="sa-dc-stat-val" style="color:' + ((d.suphe || 0) > 0 ? 'var(--rd2)' : 'var(--tx3)') + '">₺' + (d.suphe || 0).toLocaleString('tr-TR') + '</div></div>';
    } else {
      html += '<div><div class="sa-dc-stat-lbl">Reddedildi</div><div class="sa-dc-stat-val" style="color:var(--rd2)">₺' + (d.red || 0).toLocaleString('tr-TR') + '</div></div>';
      var dPct = d.total > 0 ? Math.round(d.onay / d.total * 100) : 0;
      html += '<div><div class="sa-dc-stat-lbl">Onay %</div><div class="sa-dc-stat-val" style="color:var(--tx2)">%' + dPct + '</div></div>';
    }
    html += '</div>';
    html += '<div class="sa-dc-bar"><div class="sa-dc-bar-f" style="width:' + pct + '%;background:' + d.renk + '"></div></div>';
    if (isAktif && d.butce) {
      var bPct = Math.min(100, Math.round(d.total / d.butce * 100));
      var bClr = bPct >= 100 ? 'var(--rd)' : bPct >= 80 ? 'var(--am)' : d.renk;
      var bPctClr = bPct >= 100 ? 'var(--rd2)' : bPct >= 80 ? 'var(--am2)' : 'var(--tx3)';
      html += '<div class="sa-dc-butce" onclick="event.stopPropagation()">' +
        '<div class="sa-dc-butce-row">' +
          '<span class="sa-dc-butce-lbl">Bütçe</span>' +
          '<span class="sa-dc-butce-pct" style="color:' + bPctClr + '">%' + bPct + ' · ₺' + d.total.toLocaleString('tr-TR') + ' / ₺' + d.butce.toLocaleString('tr-TR') + '</span>' +
        '</div>' +
        '<div class="sa-dc-butce-track"><div class="sa-dc-butce-fill" style="width:' + bPct + '%;background:' + bClr + '"></div></div>' +
      '</div>';
    }
    html += '</div>';
  }

  if (!isAktif && window.SA_DONEM_DEPTS[APP.ui.saSeciliDonem]) {
    var prevId = APP.ui.saSeciliDonem - 1;
    var prevDepts = window.SA_DONEM_DEPTS[prevId] || null;
    if (prevDepts) {
      var prevTotal = 0, curTotal = totalTop;
      for (var pi = 0; pi < prevDepts.length; pi++) prevTotal += prevDepts[pi].total;
      var prevDonRec = null;
      for (var pri = 0; pri < APP.seed.saDonemler.length; pri++) if (APP.seed.saDonemler[pri].id === prevId) { prevDonRec = APP.seed.saDonemler[pri]; break; }
      var diff = curTotal - prevTotal;
      var diffSign = diff >= 0 ? '+' : '';
      var diffClr  = diff > 0 ? 'var(--rd2)' : 'var(--gr2)';
      html += '<div class="sa-don-cmp-card">';
      html += '<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Dönem Karşılaştırması</div>';
      html += '<div class="sa-don-cmp-row"><span style="font-size:13px;color:var(--tx2)">' + (donRec ? donRec.lbl : '') + '</span><span style="font-size:14px;font-weight:700;font-family:var(--mo)">₺' + curTotal.toLocaleString('tr-TR') + '</span></div>';
      html += '<div class="sa-don-cmp-row"><span style="font-size:13px;color:var(--tx2)">' + (prevDonRec ? prevDonRec.lbl : 'Önceki') + '</span><span style="font-size:14px;font-weight:700;font-family:var(--mo)">₺' + prevTotal.toLocaleString('tr-TR') + '</span></div>';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 4px">';
      html += '<span style="font-size:12px;color:var(--tx3)">Fark</span>';
      html += '<span style="font-size:14px;font-weight:700;font-family:var(--mo);color:' + diffClr + '">' + diffSign + diff.toLocaleString('tr-TR') + ' ₺</span>';
      html += '</div>';
      html += '</div>';
    }
  }

  el.innerHTML = html;
}

/* ═══ BEKLEYEN ═══════════════════════════════════════════════ */

export function renderAccBek() {
  _checkPassiveApproval();
  var el = document.getElementById('sa-pnl-bek');
  if (!el) return;
  var bCnt = document.getElementById('satb-bek-cnt');
  if (bCnt) bCnt.textContent = APP.data.accBekleyen.length;
  if (!APP.data.accBekleyen.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:13px">Bekleyen harcama yok</div>';
    return;
  }
  el.innerHTML = APP.data.accBekleyen.map(function(f) {
    var isAvans = f.tip === 'avans';
    var avTag   = isAvans ? '<span style="margin-left:5px;font-size:10px;font-weight:700;background:rgba(232,150,46,.15);color:var(--ac2);border:1px solid rgba(232,150,46,.3);border-radius:5px;padding:1px 6px">💰 AVANS</span>' : '';
    var bgsz    = (!isAvans && f.belgesiz) ? '<span class="tag-am" style="margin-left:4px;font-size:10px">Belgesiz</span>' : '';
    var gecTag  = f.gecIslem ? '<span style="margin-left:4px;font-size:10px;font-weight:700;background:rgba(245,158,11,.15);color:var(--am2);border:1px solid rgba(245,158,11,.3);border-radius:5px;padding:1px 6px" title="Kapanmış döneme istisna izniyle girildi">⚠ İSTİSNA</span>' : '';
    var uyHtml  = (!isAvans && f.uyari) ? '<div style="font-size:11px;color:var(--am2);margin-top:4px">⚠ ' + f.uyari + '</div>' : '';
    var desc    = isAvans
      ? '<div style="font-size:12px;color:var(--tx2);margin-bottom:4px">Gerekçe: ' + (f.gerekce || '—') + '</div>'
      : '<div style="font-size:12px;color:var(--tx2);margin-bottom:4px">' + f.satici + ' <span style="color:var(--tx3)">· ' + f.kat + '</span></div>';
    var avBorder = isAvans ? 'border-color:rgba(232,150,46,.35);' : '';
    return '<div class="sa-dept-card" style="' + avBorder + 'cursor:pointer" onclick="openFisDetay(' + f.id + ',\'acc\')">' +
      '<div class="sa-dc-hd" style="margin-bottom:8px">' +
        '<div style="width:32px;height:32px;border-radius:9px;background:' + (isAvans ? 'rgba(232,150,46,.15)' : 'var(--bg3)') + ';color:' + (isAvans ? 'var(--ac2)' : 'var(--tx2)') + ';font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + f.ini + '</div>' +
        '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--tx)">' + f.uye + avTag + bgsz + gecTag + '</div><div style="font-size:11px;color:var(--tx3)">' + f.dept + ' · ' + f.tarih + '</div></div>' +
        '<div style="font-size:15px;font-weight:800;font-family:var(--mo);color:' + (isAvans ? 'var(--ac2)' : 'var(--tx)') + '">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
      '</div>' +
      desc + uyHtml +
      '<div style="display:flex;gap:8px;margin-top:10px">' +
        '<button class="btn btn-g btn-sm" style="flex:1;justify-content:center" onclick="event.stopPropagation();accOnayla(' + f.id + ')">' + (isAvans ? '✓ Onayla & Aktar' : 'Onayla') + '</button>' +
        '<button class="btn btn-r btn-sm" style="flex:1;justify-content:center" onclick="event.stopPropagation();accReddet(' + f.id + ')">Reddet</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ═══ ŞÜPHELİ ════════════════════════════════════════════════ */

export function renderAccSuphe() {
  var el = document.getElementById('sa-pnl-suphe');
  if (!el) return;
  var sCnt = document.getElementById('satb-suphe-cnt');
  var aktif = APP.data.accSuphe.filter(function(s){ return s.durum !== 'red' && s.durum !== 'ok'; });
  if (sCnt) sCnt.textContent = aktif.length;
  if (!APP.data.accSuphe.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:13px">Şüpheli kayıt yok</div>';
    return;
  }
  var html = '<div style="font-size:12px;color:var(--tx3);margin-bottom:12px">Otomatik olarak tespit edilen anormal harcamalar. İnceleyip onaylayabilir veya reddedebilirsiniz.</div>';
  html += APP.data.accSuphe.map(function(f) {
    var tagCls = f.durum === 'bek' ? 'sa-suphe-tag-bek' : (f.durum === 'inc' ? 'sa-suphe-tag-inc' : 'sa-suphe-tag-red');
    var tagTxt = f.durum === 'bek' ? 'Beklemede' : (f.durum === 'inc' ? 'İnceleniyor' : (f.durum === 'ok' ? 'Temiz' : 'Reddedildi'));
    return '<div class="sa-suphe-card">' +
      '<div class="sa-suphe-hd">' +
        '<div><div class="sa-suphe-kisi">' + f.uye + ' <span style="font-size:11px;color:var(--tx3)">· ' + f.dept + '</span></div></div>' +
        '<div class="sa-suphe-tutar">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
      '</div>' +
      '<div class="sa-suphe-sebep">⚠ ' + f.sebep + '</div>' +
      '<div class="sa-suphe-meta">' + f.satici + ' · ' + f.kat + ' · ' + f.tarih + '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between">' +
        '<span class="sa-suphe-tag ' + tagCls + '">' + tagTxt + '</span>' +
        '<div style="display:flex;gap:6px">' +
          '<button class="btn btn-g btn-sm" onclick="accSupheIsle(' + f.id + ',\'ok\')">Temizle</button>' +
          '<button class="btn btn-r btn-sm" onclick="accSupheIsle(' + f.id + ',\'red\')">Reddet</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  el.innerHTML = html;
}

export function accSupheIsle(id, action) {
  for (var i = 0; i < APP.data.accSuphe.length; i++) {
    if (APP.data.accSuphe[i].id === id) { APP.data.accSuphe[i].durum = action; break; }
  }
  renderAccSuphe();
  notif(action === 'ok' ? 'Kayıt temiz olarak işaretlendi' : 'Harcama reddedildi', action === 'ok' ? 'green' : 'red');
  saveAppData();
}

/* ═══ RAPOR HELPERS ══════════════════════════════════════════ */

function _saOnayBar(onay, bek, red, total) {
  if (!total) return '';
  var pO = Math.round(onay / total * 100);
  var pB = Math.round(bek  / total * 100);
  var pR = 100 - pO - pB;
  if (pR < 0) pR = 0;
  var html = '<div class="sa-onay-bar-wrap">' +
    '<div class="sa-onay-bar-row">';
  if (pO > 0) html += '<div class="sa-onay-bar-seg" style="width:' + pO + '%;background:rgba(34,197,94,.22);color:var(--gr2)">' + (pO >= 16 ? '%' + pO : '') + '</div>';
  if (pB > 0) html += '<div class="sa-onay-bar-seg" style="width:' + pB + '%;background:rgba(245,158,11,.22);color:var(--am2)">' + (pB >= 16 ? '%' + pB : '') + '</div>';
  if (pR > 0) html += '<div class="sa-onay-bar-seg" style="width:' + pR + '%;background:rgba(239,68,68,.22);color:var(--rd2)">' + (pR >= 16 ? '%' + pR : '') + '</div>';
  html += '</div><div class="sa-onay-bar-legs">' +
    (pO > 0 ? '<div class="sa-onay-bar-li"><div class="sa-onay-bar-ld" style="background:var(--gr2)"></div>Onaylı %' + pO + '</div>' : '') +
    (pB > 0 ? '<div class="sa-onay-bar-li"><div class="sa-onay-bar-ld" style="background:var(--am2)"></div>Bekleyen %' + pB + '</div>' : '') +
    (pR > 0 ? '<div class="sa-onay-bar-li"><div class="sa-onay-bar-ld" style="background:var(--rd2)"></div>Reddedildi %' + pR + '</div>' : '') +
  '</div></div>';
  return html;
}

function _raporFisRows(liste) {
  if (!liste.length) return '<div style="text-align:center;padding:14px 0;color:var(--tx3);font-size:12px">Kayıt bulunamadı</div>';
  return liste.map(function(f) {
    var durCls = f.durum === 'onay' ? 'sa-fis-dur-on' : (f.durum === 'red' ? 'sa-fis-dur-red' : (f.durum === 'inc' ? 'sa-fis-dur-inc' : 'sa-fis-dur-bek'));
    var durTxt = { onay:'Onaylandı', red:'Reddedildi', inc:'İnceleniyor', bek:'Bekleyen' }[f.durum] || f.durum;
    var uyWarn = f.uyari ? ' · <span style="color:var(--am2)">' + f.uyari + '</span>' : '';
    return '<div class="sa-fis-item">' +
      '<div class="sa-fis-ini">' + f.ini + '</div>' +
      '<div class="sa-fis-mid">' +
        '<div class="sa-fis-satici">' + f.satici + (f.isKismi ? '<span class="kismi-badge">½</span>' : '') + '</div>' +
        '<div class="sa-fis-meta">' + f.kat + ' · ' + f.tarih + uyWarn + '</div>' +
      '</div>' +
      '<div class="sa-fis-right">' +
        '<div class="sa-fis-tutar">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
        '<div class="sa-fis-durum ' + durCls + '">' + durTxt + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function _raporFisGrouped(liste) {
  var donLbls = { 2:'Dönem #2 (Nisan 2026)', 1:'Dönem #1 (Mart 2026)', 0:'Dönem #0 (Şubat 2026)' };
  var groups  = {};
  var order   = [];
  for (var i = 0; i < liste.length; i++) {
    var d = liste[i].donem;
    if (!groups[d]) { groups[d] = []; order.push(d); }
    groups[d].push(liste[i]);
  }
  order.sort(function(a, b) { return b - a; });
  var html = '';
  for (var gi = 0; gi < order.length; gi++) {
    var did = order[gi];
    var grp = groups[did];
    var top = 0;
    for (var fi = 0; fi < grp.length; fi++) top += grp[fi].tutar;
    html += '<div class="sa-fis-group-hd">' +
      '<span>' + (donLbls[did] || 'Dönem #' + did) + '</span>' +
      '<span style="font-family:var(--mo);color:var(--tx2)">₺' + top.toLocaleString('tr-TR') + '</span>' +
    '</div>';
    html += _raporFisRows(grp);
  }
  return html;
}

function _saDonemSecPills() {
  var donems = [
    { id:2, lbl:'Dönem #2' },
    { id:1, lbl:'Dönem #1' },
    { id:0, lbl:'Dönem #0' }
  ];
  var html = '<div class="sa-don-sec">';
  for (var i = 0; i < donems.length; i++) {
    var d  = donems[i];
    var on = saRaporSecilenDonemler.indexOf(d.id) >= 0;
    html += '<div class="sa-don-sec-pill' + (on ? ' on' : '') + '" onclick="saRaporToggleDonem(' + d.id + ')">' +
      '<div class="sa-don-sec-chk">✓</div>' + d.lbl +
    '</div>';
  }
  html += '</div>';
  return html;
}

export function saRaporToggleDonem(did) {
  var idx = saRaporSecilenDonemler.indexOf(did);
  if (idx >= 0) {
    if (saRaporSecilenDonemler.length <= 2) { notif('En az 2 dönem seçili olmalı', 'amber'); return; }
    saRaporSecilenDonemler.splice(idx, 1);
  } else {
    saRaporSecilenDonemler.push(did);
    saRaporSecilenDonemler.sort(function(a,b){ return b-a; });
  }
  _renderAccRaporIc();
}

export function renderAccRapor(tip) {
  APP.ui.saRaporTip = tip;
  saRaporDeptId     = '';
  saRaporKisiIdx    = -1;
  _renderAccRaporIc();
}

/* ═══ RAPOR — DEPT ═══════════════════════════════════════════ */

function _renderAccRaporIc() {
  APP.cache.accRaporPersonel = _computeRaporPersonel();
  APP.cache.accDeptFis = {};
  var _rDepts = ['yapim','kamera','sanat','ses','kostum'];
  for (var _rdi = 0; _rdi < _rDepts.length; _rdi++) {
    APP.cache.accDeptFis[_rDepts[_rdi]] = _computeRaporDeptFis(_rDepts[_rdi]);
  }
  var el = document.getElementById('sa-pnl-rapor');
  if (!el) return;

  var btns = '<div class="sa-rapor-btns">' +
    ['dept','kat','personel','donem'].map(function(t) {
      var icons = { dept:'🏢', kat:'🏷', personel:'👤', donem:'📅' };
      var lbls  = { dept:'Departman', kat:'Kategori', personel:'Personel', donem:'Dönem' };
      return '<button class="sa-rapor-btn' + (t === APP.ui.saRaporTip ? ' on' : '') + '" onclick="renderAccRapor(\'' + t + '\')">' +
        '<div class="sa-rapor-btn-ic">' + icons[t] + '</div>' +
        '<div class="sa-rapor-btn-lbl">' + lbls[t] + '</div>' +
      '</button>';
    }).join('') +
  '</div>';

  var content = '';
  if      (APP.ui.saRaporTip === 'dept')     content = saRaporDeptId   ? _raporDeptDetay()    : _raporDeptList();
  else if (APP.ui.saRaporTip === 'kat')      content = _raporKat();
  else if (APP.ui.saRaporTip === 'personel') content = saRaporKisiIdx >= 0 ? _raporKisiDetay() : _raporPersonelList();
  else if (APP.ui.saRaporTip === 'donem')    content = _raporDonem();

  el.innerHTML = btns + content +
    '<button class="sa-pdf-btn" onclick="showExportModal(\'acc-\' + APP.ui.saRaporTip)">📥 Dışa Aktar</button>';
}

function _raporDeptList() {
  var maxD = 0;
  for (var i = 0; i < APP.data.accDepts.length; i++) if (APP.data.accDepts[i].total > maxD) maxD = APP.data.accDepts[i].total;
  var html = '<div class="sa-rep-hd"><span>Departmana göre</span><span style="font-weight:400;font-size:11px">Detay için tıkla</span></div>';
  html += APP.data.accDepts.map(function(d) {
    var pct = maxD > 0 ? Math.round(d.total / maxD * 100) : 0;
    return '<div class="sa-rep-dept-row" onclick="_saRaporDept(\'' + d.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div class="sa-dc-dot" style="background:' + d.renk + '"></div>' +
        '<div style="flex:1;font-size:13px;font-weight:700;color:var(--tx)">' + d.name + '</div>' +
        '<div style="font-size:14px;font-weight:800;font-family:var(--mo)">₺' + d.total.toLocaleString('tr-TR') + '</div>' +
        '<div style="font-size:13px;color:var(--tx3);margin-left:2px">›</div>' +
      '</div>' +
      '<div class="sa-bar-wrap"><div class="sa-bar-f" style="width:' + pct + '%;background:' + d.renk + '"></div></div>' +
      '<div style="display:flex;justify-content:space-between;margin-top:6px">' +
        '<span style="font-size:11px;color:var(--gr2)">Onaylı ₺' + d.onay.toLocaleString('tr-TR') + '</span>' +
        '<span style="font-size:11px;color:var(--am2)">Bekleyen ₺' + d.bekleyen.toLocaleString('tr-TR') + '</span>' +
        '<span style="font-size:11px;color:var(--tx3)">' + d.uye + ' kişi</span>' +
      '</div>' +
    '</div>';
  }).join('');
  return html;
}

function _saRaporDept(id) {
  saRaporDeptId = id;
  _renderAccRaporIc();
}

function _raporDeptDetay() {
  var dept = null;
  for (var i = 0; i < APP.data.accDepts.length; i++) if (APP.data.accDepts[i].id === saRaporDeptId) { dept = APP.data.accDepts[i]; break; }
  if (!dept) return '';

  var uyeler   = APP.cache.accDeptUyeler[saRaporDeptId]   || [];
  var katlar   = APP.cache.accDeptKatlar[saRaporDeptId]   || [];
  var donemler = APP.cache.accDeptDonemler[saRaporDeptId] || [];
  var avanslar = APP.cache.accDeptAvans[saRaporDeptId]    || [];
  var fisler   = APP.cache.accDeptFis[saRaporDeptId]      || [];

  var totalRed = 0;
  for (var ri = 0; ri < donemler.length; ri++) totalRed += (donemler[ri].red || 0);

  var html = '<div class="sa-rep-drill-hd">' +
    '<button class="sa-rep-back" onclick="_saRaporDeptBack()">← Geri</button>' +
    '<div style="flex:1">' +
      '<div class="sa-rep-drill-title">' + dept.name + '</div>' +
      '<div style="font-size:11px;color:var(--tx3)">' + dept.uye + ' kişi · ' + donemler.length + ' dönem</div>' +
    '</div>' +
    '<div class="sa-rep-kisi-av" style="background:' + dept.renk + ';color:#fff;font-size:10px">' + dept.uye + '</div>' +
  '</div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
  html += '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v">₺' + dept.total.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Toplam</div></div>';
  html += '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--gr2)">₺' + dept.onay.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Onaylı</div></div>';
  html += '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--am2)">₺' + dept.bekleyen.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Bekleyen</div></div>';
  html += '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--rd2)">₺' + totalRed.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Reddedildi</div></div>';
  html += '</div>';

  html += _saOnayBar(dept.onay, dept.bekleyen, totalRed, dept.total);

  html += '<div class="sa-rep-sec-hd">Kişi Bazlı Döküm</div>';
  var maxU = 0;
  for (var ui = 0; ui < uyeler.length; ui++) if (uyeler[ui].total > maxU) maxU = uyeler[ui].total;
  html += uyeler.map(function(u) {
    var upct = maxU > 0 ? Math.round(u.total / maxU * 100) : 0;
    var kisiIdx = -1;
    for (var ki = 0; ki < APP.cache.accRaporPersonel.length; ki++) {
      if (APP.cache.accRaporPersonel[ki].name === u.name) { kisiIdx = ki; break; }
    }
    return '<div class="sa-rep-kisi-row" onclick="' + (kisiIdx >= 0 ? '_saRaporKisiFromDept(' + kisiIdx + ')' : '') + '">' +
      '<div class="sa-rep-kisi-av">' + u.ini + '</div>' +
      '<div class="sa-rep-kisi-info">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
          '<div class="sa-rep-kisi-name">' + u.name + '</div>' +
          '<div class="sa-rep-kisi-tutar">₺' + u.total.toLocaleString('tr-TR') + '</div>' +
        '</div>' +
        '<div class="sa-rep-kisi-sub">' + u.rol + '</div>' +
        '<div style="margin-top:5px"><div class="sa-bar-wrap"><div class="sa-bar-f" style="width:' + upct + '%;background:' + dept.renk + '"></div></div></div>' +
        '<div style="display:flex;gap:10px;margin-top:3px">' +
          '<span style="font-size:10px;color:var(--gr2)">₺' + u.onay.toLocaleString('tr-TR') + ' onaylı</span>' +
          (u.bek > 0 ? '<span style="font-size:10px;color:var(--am2)">₺' + u.bek.toLocaleString('tr-TR') + ' bek.</span>' : '') +
        '</div>' +
      '</div>' +
      '<div style="color:var(--tx3);font-size:12px;flex-shrink:0">' + (kisiIdx >= 0 ? '›' : '') + '</div>' +
    '</div>';
  }).join('');

  if (katlar.length) {
    var katTotal = 0;
    for (var ki2 = 0; ki2 < katlar.length; ki2++) katTotal += katlar[ki2].tutar;
    html += '<div class="sa-rep-sec-hd">Kategori Dağılımı</div>';
    html += '<div class="sa-donut-wrap">' +
      _svgDonut(katlar, 110) +
      '<div class="sa-donut-legend">';
    for (var kl = 0; kl < katlar.length; kl++) {
      var kt = katlar[kl];
      var kpct = katTotal > 0 ? (kt.tutar / katTotal * 100).toFixed(0) : 0;
      html += '<div class="sa-donut-leg-item">' +
        '<div class="sa-donut-leg-dot" style="background:' + kt.renk + '"></div>' +
        '<div class="sa-donut-leg-name">' + kt.name + '</div>' +
        '<div class="sa-donut-leg-pct">%' + kpct + '</div>' +
        '<div class="sa-donut-leg-val">₺' + (kt.tutar/1000).toFixed(0) + 'K</div>' +
      '</div>';
    }
    html += '</div></div>';
  }

  if (fisler.length) {
    html += '<div class="sa-rep-sec-hd">Harcama Detayları</div>';
    html += _raporFisGrouped(fisler);
  }

  if (donemler.length) {
    html += '<div class="sa-rep-sec-hd">Dönem Bazlı Özet</div>';
    html += '<table class="sa-don-tbl"><thead><tr><th>Dönem</th><th>Toplam</th><th>Onaylı</th><th>Bekleyen</th><th>Red</th></tr></thead><tbody>';
    html += donemler.map(function(d) {
      return '<tr><td>' + d.lbl + '</td>' +
        '<td>₺' + d.total.toLocaleString('tr-TR') + '</td>' +
        '<td class="pos">₺' + d.onay.toLocaleString('tr-TR') + '</td>' +
        '<td style="color:var(--am2)">₺' + (d.bek || 0).toLocaleString('tr-TR') + '</td>' +
        '<td class="neg">₺' + (d.red || 0).toLocaleString('tr-TR') + '</td></tr>';
    }).join('');
    html += '</tbody></table>';
  }

  if (avanslar.length) {
    var topAv = 0;
    for (var avi = 0; avi < avanslar.length; avi++) topAv += avanslar[avi].tutar;
    html += '<div class="sa-rep-sec-hd">Avans Özeti · ₺' + topAv.toLocaleString('tr-TR') + ' toplam</div>';
    html += avanslar.map(function(av) {
      var clr = av.durum === 'ödendi' ? 'var(--gr2)' : (av.durum === 'bekleyen' ? 'var(--am2)' : 'var(--rd2)');
      return '<div class="sa-rep-row">' +
        '<div class="sa-rep-left"><div>' + av.name + '</div><div class="sa-rep-sub">' + av.gerekce + ' · ' + av.tarih + '</div></div>' +
        '<div style="text-align:right"><div class="sa-rep-val">₺' + av.tutar.toLocaleString('tr-TR') + '</div><div style="font-size:10px;color:' + clr + '">' + av.durum + '</div></div>' +
      '</div>';
    }).join('');
  }

  return html;
}

function _saRaporDeptBack() {
  saRaporDeptId  = '';
  saRaporKisiIdx = -1;
  _renderAccRaporIc();
}

/* ═══ RAPOR — KATEGORİ ═══════════════════════════════════════ */

function _raporKat() {
  var katlar = APP.cache.accDonemKatlar[2] || [];
  var total = 0;
  for (var i = 0; i < katlar.length; i++) total += katlar[i].tutar;
  var maxK = 0;
  for (var ki = 0; ki < katlar.length; ki++) if (katlar[ki].tutar > maxK) maxK = katlar[ki].tutar;
  var html = '<div class="sa-rep-hd"><span>Kategoriye göre</span><span style="font-weight:400;font-size:11px">Aktif dönem · ₺' + total.toLocaleString('tr-TR') + '</span></div>';
  html += katlar.map(function(k) {
    var pct    = maxK  > 0 ? Math.round(k.tutar / maxK  * 100) : 0;
    var pctTop = total > 0 ? (k.tutar / total * 100).toFixed(1) : '0.0';
    return '<div class="sa-bar-row">' +
      '<div class="sa-bar-lbl">' + k.name + '</div>' +
      '<div class="sa-bar-wrap"><div class="sa-bar-f" style="width:' + pct + '%;background:' + k.renk + '"></div></div>' +
      '<div style="text-align:right;flex-shrink:0;min-width:96px">' +
        '<div class="sa-bar-val">₺' + k.tutar.toLocaleString('tr-TR') + '</div>' +
        '<div style="font-size:10px;color:var(--tx3)">%' + pctTop + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  return html;
}

/* ═══ RAPOR — PERSONEL ═══════════════════════════════════════ */

function _raporPersonelList() {
  var sorted = APP.cache.accRaporPersonel.slice().sort(function(a,b){ return b.total - a.total; });
  var maxP = sorted[0] ? sorted[0].total : 0;
  var html = '<div class="sa-rep-hd"><span>Personele göre</span><span style="font-weight:400;font-size:11px">Detay için tıkla</span></div>';
  html += sorted.map(function(p) {
    var origIdx = -1;
    for (var i = 0; i < APP.cache.accRaporPersonel.length; i++) if (APP.cache.accRaporPersonel[i].name === p.name) { origIdx = i; break; }
    var pct = maxP > 0 ? Math.round(p.total / maxP * 100) : 0;
    return '<div class="sa-rep-kisi-row" onclick="_saRaporKisi(' + origIdx + ')">' +
      '<div class="sa-rep-kisi-av">' + p.ini + '</div>' +
      '<div class="sa-rep-kisi-info">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
          '<div class="sa-rep-kisi-name">' + p.name + '</div>' +
          '<div class="sa-rep-kisi-tutar">₺' + p.total.toLocaleString('tr-TR') + '</div>' +
        '</div>' +
        '<div class="sa-rep-kisi-sub">' + p.dept + ' · ' + p.rol + '</div>' +
        '<div style="margin-top:5px"><div class="sa-bar-wrap"><div class="sa-bar-f" style="width:' + pct + '%"></div></div></div>' +
      '</div>' +
      '<div style="color:var(--tx3);font-size:12px;flex-shrink:0">›</div>' +
    '</div>';
  }).join('');
  return html;
}

function _saRaporKisi(idx) {
  saRaporKisiFrom = 'list';
  saRaporKisiIdx  = idx;
  _renderAccRaporIc();
}

function _saRaporKisiFromDept(idx) {
  saRaporKisiFrom = 'dept';
  saRaporKisiIdx  = idx;
  _renderAccRaporIc();
}

function _raporKisiDetay() {
  var p = APP.cache.accRaporPersonel[saRaporKisiIdx];
  if (!p) return '';

  var totalRed = p.total - p.onay - p.bek;
  if (totalRed < 0) totalRed = 0;

  var kisiAvanslar = APP.data.accAvansGecmis.filter(function(av) { return av.uye === p.name; });
  var avansTop = 0;
  for (var ai = 0; ai < kisiAvanslar.length; ai++) avansTop += kisiAvanslar[ai].tutar;

  var kisiIni  = p.ini;
  var kisFisler = (APP.cache.accDeptFis[p.deptId] || []).filter(function(f) { return f.ini === kisiIni; });

  var onayFis = 0, bekFis = 0, redFis = 0, totalFis = 0;
  for (var fi = 0; fi < kisFisler.length; fi++) {
    totalFis++;
    if      (kisFisler[fi].durum === 'onay') onayFis++;
    else if (kisFisler[fi].durum === 'red')  redFis++;
    else                                      bekFis++;
  }

  var backLabel = saRaporKisiFrom === 'dept' ? '← ' + p.dept : '← Geri';
  var deptRenk  = { yapim:'#E8962E', kamera:'#3B82F6', sanat:'#22C55E', ses:'#A855F7', kostum:'#EC4899' }[p.deptId] || 'var(--ac)';

  var html = '<div class="sa-rep-drill-hd">' +
    '<button class="sa-rep-back" onclick="_saRaporKisiBack()">' + backLabel + '</button>' +
    '<div style="display:flex;align-items:center;gap:10px;flex:1">' +
      '<div class="sa-rep-kisi-av" style="background:' + deptRenk + ';color:#fff">' + p.ini + '</div>' +
      '<div><div class="sa-rep-drill-title">' + p.name + '</div><div style="font-size:11px;color:var(--tx3)">' + p.dept + ' · ' + p.rol + '</div></div>' +
    '</div>' +
  '</div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
  html += '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v">₺' + p.total.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Toplam Harcama</div></div>';
  html += '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--gr2)">₺' + p.onay.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Onaylı</div></div>';
  html += '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--am2)">₺' + p.bek.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Bekleyen</div></div>';
  html += '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--bl2)">₺' + (avansTop || p.avans || 0).toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Toplam Avans</div></div>';
  html += '</div>';

  html += '<div class="sa-rep-sec-hd">Onay / Red Oranı</div>';
  html += _saOnayBar(p.onay, p.bek, totalRed, p.total);
  if (totalFis > 0) {
    var pctOnayFis = Math.round(onayFis / totalFis * 100);
    var pctRedFis  = Math.round(redFis  / totalFis * 100);
    html += '<div style="display:flex;gap:10px;margin-top:4px;margin-bottom:10px">' +
      '<span style="font-size:11px;color:var(--tx3)">' + totalFis + ' fiş · </span>' +
      '<span style="font-size:11px;color:var(--gr2)">%' + pctOnayFis + ' onay oranı</span>' +
      (pctRedFis > 0 ? '<span style="font-size:11px;color:var(--rd2)">%' + pctRedFis + ' red</span>' : '') +
    '</div>';
  }

  if (p.katlar && p.katlar.length) {
    var katTop = 0;
    for (var kto = 0; kto < p.katlar.length; kto++) katTop += p.katlar[kto].tutar;
    html += '<div class="sa-rep-sec-hd">Kategori Dağılımı</div>';
    html += '<div class="sa-donut-wrap">' + _svgDonut(p.katlar, 100) + '<div class="sa-donut-legend">';
    for (var kl = 0; kl < p.katlar.length; kl++) {
      var kt   = p.katlar[kl];
      var kpct = katTop > 0 ? (kt.tutar / katTop * 100).toFixed(0) : 0;
      html += '<div class="sa-donut-leg-item">' +
        '<div class="sa-donut-leg-dot" style="background:' + kt.renk + '"></div>' +
        '<div class="sa-donut-leg-name">' + kt.name + '</div>' +
        '<div class="sa-donut-leg-pct">%' + kpct + '</div>' +
        '<div class="sa-donut-leg-val">₺' + (kt.tutar/1000).toFixed(0) + 'K</div>' +
      '</div>';
    }
    html += '</div></div>';
  }

  if (p.donemler && p.donemler.length) {
    html += '<div class="sa-rep-sec-hd">Dönem Bazlı Harcama Özeti</div>';
    html += '<table class="sa-don-tbl"><thead><tr><th>Dönem</th><th>Toplam</th><th>Onaylı</th><th>Bekleyen</th><th>%Onay</th></tr></thead><tbody>';
    html += p.donemler.map(function(d) {
      var pctO = d.total > 0 ? Math.round(d.onay / d.total * 100) : 0;
      return '<tr><td>' + d.lbl + '</td>' +
        '<td>₺' + d.total.toLocaleString('tr-TR') + '</td>' +
        '<td class="pos">₺' + d.onay.toLocaleString('tr-TR') + '</td>' +
        '<td style="color:' + (d.bek > 0 ? 'var(--am2)' : 'var(--tx3)') + '">₺' + d.bek.toLocaleString('tr-TR') + '</td>' +
        '<td style="color:' + (pctO >= 80 ? 'var(--gr2)' : 'var(--am2)') + '">%' + pctO + '</td></tr>';
    }).join('');
    html += '</tbody></table>';
  }

  if (kisFisler.length) {
    html += '<div class="sa-rep-sec-hd">Tüm Dönemler — Harcama Geçmişi</div>';
    html += _raporFisGrouped(kisFisler);
  }

  var avansOdendi = 0, avansBek = 0, avansRed = 0;
  for (var avo = 0; avo < kisiAvanslar.length; avo++) {
    var avx = kisiAvanslar[avo];
    if (avx.durum === 'ödendi') avansOdendi += avx.tutar;
    else if (avx.durum === 'reddedildi') avansRed += avx.tutar;
    else avansBek += avx.tutar;
  }

  if (kisiAvanslar.length) {
    html += '<div class="sa-rep-sec-hd">Avans Geçmişi · ₺' + avansTop.toLocaleString('tr-TR') + ' toplam · ' + kisiAvanslar.length + ' kayıt</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">' +
      '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--am2)">₺' + avansBek.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Bekleyen</div></div>' +
      '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--gr2)">₺' + avansOdendi.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Ödendi</div></div>' +
      '<div class="sa-rep-stat-c"><div class="sa-rep-stat-v" style="color:var(--rd2)">₺' + avansRed.toLocaleString('tr-TR') + '</div><div class="sa-rep-stat-l">Reddedildi</div></div>' +
    '</div>';

    var avGrp     = {};
    for (var avgi = 0; avgi < kisiAvanslar.length; avgi++) {
      var avg  = kisiAvanslar[avgi];
      var avdk = avg.donem;
      if (!avGrp[avdk]) avGrp[avdk] = [];
      avGrp[avdk].push(avg);
    }
    var avDonKeys = Object.keys(avGrp).map(Number).sort(function(a,b){ return b-a; });
    for (var adk = 0; adk < avDonKeys.length; adk++) {
      var avdk2  = avDonKeys[adk];
      var avRows = avGrp[avdk2];
      var avDkTop = 0;
      for (var avri = 0; avri < avRows.length; avri++) avDkTop += avRows[avri].tutar;
      html += '<div style="font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin:10px 0 6px;border-top:1px solid var(--bo);padding-top:8px">' +
        'Dönem #' + avdk2 + (avdk2 === 2 ? ' <span style="color:var(--gr)">● Aktif</span>' : '') +
        ' · ₺' + avDkTop.toLocaleString('tr-TR') + ' · ' + avRows.length + ' avans' +
      '</div>';
      html += avRows.map(function(av) {
        var clr = av.durum === 'ödendi' ? 'var(--gr2)' : (av.durum === 'reddedildi' ? 'var(--rd2)' : 'var(--am2)');
        var ico = av.durum === 'ödendi' ? '✅' : (av.durum === 'reddedildi' ? '❌' : '⏳');
        return '<div class="sa-rep-row">' +
          '<div class="sa-rep-left">' +
            '<div style="font-size:13px;font-weight:700;color:var(--tx)">₺' + av.tutar.toLocaleString('tr-TR') + '</div>' +
            '<div class="sa-rep-sub">' + av.gerekce + '</div>' +
            '<div class="sa-rep-sub">' + av.tarih + ' · ' + av.dept + '</div>' +
          '</div>' +
          '<div style="text-align:right;flex-shrink:0">' +
            '<div style="font-size:12px;font-weight:700;color:' + clr + '">' + ico + ' ' + av.durum + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  } else if (p.avans > 0) {
    html += '<div class="sa-rep-sec-hd">Avans Geçmişi</div>';
    html += '<div style="text-align:center;padding:12px;color:var(--tx3);font-size:12px">Kayıt bulunamadı</div>';
  }

  return html;
}

function _saRaporKisiBack() {
  saRaporKisiIdx = -1;
  if (saRaporKisiFrom === 'dept') {
    saRaporKisiFrom = '';
    _renderAccRaporIc();
  } else {
    saRaporKisiFrom = '';
    saRaporDeptId   = '';
    _renderAccRaporIc();
  }
}

/* ═══ RAPOR — DÖNEM ══════════════════════════════════════════ */

function _raporDonem() {
  var sel = saRaporSecilenDonemler.slice().sort(function(a,b){ return b-a; });
  var selCount = sel.length;
  var html = '<div class="sa-rep-hd"><span>Dönem Karşılaştırması</span><span style="font-weight:400;font-size:11px">' + selCount + ' dönem seçili</span></div>';

  html += _saDonemSecPills();

  if (selCount < 1) {
    html += '<div class="sa-don-sec-min-warn">⚠ Lütfen en az bir dönem seçin.</div>';
    return html;
  }

  function _getDonemData(did) {
    var depts = did === 2 ? APP.data.accDepts : (window.SA_DONEM_DEPTS[did] || []);
    var t = 0, o = 0, r = 0, bek = 0;
    for (var i = 0; i < depts.length; i++) {
      t   += depts[i].total;
      o   += depts[i].onay;
      r   += (depts[i].red || 0);
      bek += (depts[i].bekleyen || 0);
    }
    var brec = null;
    for (var bi = 0; bi < APP.data.donemButce.length; bi++) if (APP.data.donemButce[bi].donem === did) { brec = APP.data.donemButce[bi]; break; }
    if (did === 2 && brec && !r) r = brec.reddedildi || 0;
    return { total:t, onay:o, red:r, bek:bek, butce:brec ? brec.butce : 0, lbl:'Dönem #' + did };
  }

  html += '<div class="sa-rep-sec-hd">Genel Özet</div>';
  html += '<table class="sa-don-tbl"><thead><tr><th>Dönem</th><th>Bütçe</th><th>Toplam</th><th>Onaylı</th><th>Red</th><th>%Onay</th></tr></thead><tbody>';
  for (var si = 0; si < sel.length; si++) {
    var did = sel[si];
    var dd  = _getDonemData(did);
    var aktifBadge = did === 2 ? ' <span style="font-size:9px;color:var(--gr)">●</span>' : '';
    html += '<tr>' +
      '<td>' + dd.lbl + aktifBadge + '</td>' +
      '<td>₺' + dd.butce.toLocaleString('tr-TR') + '</td>' +
      '<td>₺' + dd.total.toLocaleString('tr-TR') + '</td>' +
      '<td class="pos">₺' + dd.onay.toLocaleString('tr-TR') + '</td>' +
      '<td class="neg">₺' + dd.red.toLocaleString('tr-TR') + '</td>' +
      '<td style="color:' + (dd.total > 0 && Math.round(dd.onay/dd.total*100) >= 80 ? 'var(--gr2)' : 'var(--am2)') + '">%' + (dd.total > 0 ? Math.round(dd.onay/dd.total*100) : 0) + '</td>' +
    '</tr>';
  }
  html += '</tbody></table>';

  html += '<div class="sa-rep-sec-hd">Bütçe Kullanım Oranı</div>';
  for (var bi2 = 0; bi2 < sel.length; bi2++) {
    var bdd  = _getDonemData(sel[bi2]);
    var bpct = bdd.butce > 0 ? Math.min(100, Math.round(bdd.total / bdd.butce * 100)) : 0;
    var bclr = bpct > 90 ? 'var(--rd)' : (bpct > 75 ? 'var(--am)' : 'var(--gr)');
    html += '<div style="margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx2);margin-bottom:4px">' +
        '<span>' + bdd.lbl + '</span>' +
        '<span style="font-family:var(--mo)">₺' + bdd.total.toLocaleString('tr-TR') + ' / ₺' + bdd.butce.toLocaleString('tr-TR') + ' (%' + bpct + ')</span>' +
      '</div>' +
      '<div class="sa-bar-wrap" style="height:8px"><div class="sa-bar-f" style="width:' + bpct + '%;background:' + bclr + '"></div></div>' +
    '</div>';
  }

  if (sel.length >= 2) {
    var colDids    = sel.slice(0, 4);
    var thCols     = colDids.map(function(d){ return '<th>#' + d + '</th>'; }).join('');
    var deltaLabel = 'Δ ' + colDids[0] + '–' + colDids[1];
    html += '<div class="sa-rep-sec-hd">Departman Bazlı Karşılaştırma</div>';
    html += '<table class="sa-don-tbl"><thead><tr><th>Dept</th>' + thCols + '<th>' + deltaLabel + '</th></tr></thead><tbody>';
    for (var di = 0; di < APP.data.accDepts.length; di++) {
      var dept0   = APP.data.accDepts[di];
      var colVals = colDids.map(function(ddid) {
        if (ddid === 2) return dept0.total;
        var srcArr = window.SA_DONEM_DEPTS[ddid] || [];
        for (var si2 = 0; si2 < srcArr.length; si2++) if (srcArr[si2].id === dept0.id) return srcArr[si2].total;
        return 0;
      });
      var delta = colVals[0] - colVals[1];
      var dSign = delta >= 0 ? '+' : '';
      var dClr  = delta > 0 ? 'var(--rd2)' : (delta < 0 ? 'var(--gr2)' : 'var(--tx3)');
      var tds   = colVals.map(function(v){ return '<td>₺' + (v/1000).toFixed(0) + 'K</td>'; }).join('');
      html += '<tr><td>' + dept0.name + '</td>' + tds +
        '<td style="color:' + dClr + '">' + dSign + (delta/1000).toFixed(0) + 'K</td>' +
      '</tr>';
    }
    html += '</tbody></table>';

    html += '<div class="sa-rep-sec-hd">Kategori Karşılaştırması</div>';
    var baseKatlar = APP.cache.accDonemKatlar[colDids[0]] || [];
    var katThs     = colDids.map(function(d){ return '<th>#' + d + '</th>'; }).join('');
    html += '<table class="sa-don-tbl"><thead><tr><th>Kategori</th>' + katThs + '<th>Δ ' + colDids[0] + '–' + colDids[1] + '</th></tr></thead><tbody>';
    for (var ki = 0; ki < baseKatlar.length; ki++) {
      var bk    = baseKatlar[ki];
      var kVals = colDids.map(function(ddid) {
        var klist = APP.cache.accDonemKatlar[ddid] || [];
        for (var kj = 0; kj < klist.length; kj++) if (klist[kj].name === bk.name) return klist[kj].tutar;
        return 0;
      });
      var kdiff  = kVals[0] - kVals[1];
      var kdSign = kdiff >= 0 ? '+' : '';
      var kdClr  = kdiff > 0 ? 'var(--rd2)' : (kdiff < 0 ? 'var(--gr2)' : 'var(--tx3)');
      var ktds   = kVals.map(function(v){ return '<td>₺' + v.toLocaleString('tr-TR') + '</td>'; }).join('');
      html += '<tr><td>' + bk.name + '</td>' + ktds +
        '<td style="color:' + kdClr + '">' + kdSign + kdiff.toLocaleString('tr-TR') + '</td>' +
      '</tr>';
    }
    html += '</tbody></table>';
  }

  return html;
}

/* ═══ MESAJ ══════════════════════════════════════════════════ */

export function renderAccMesaj() {
  var el = document.getElementById('sa-pnl-mesaj');
  if (!el) return;
  el.innerHTML =
    '<div class="sohbet-sec-hd-row">' +
      '<span class="sohbet-sec-hd">Sohbetler</span>' +
      '<button class="btn btn-sm" onclick="openYeniSohbetModal()" style="padding:4px 10px;font-size:12px">+ Yeni</button>' +
    '</div>' +
    '<div id="sa-sohbet-liste"></div>';
  window.renderSohbetListesi(document.getElementById('sa-sohbet-liste'), 'm');
}

/* ═══ WINDOW EXPORTS (inline onclick uyumluluğu) ═════════════ */
window.renderAcc              = renderAcc;
window.saTab                  = saTab;
window.saSetDonem             = saSetDonem;
window.openAccButceDuzenle    = openAccButceDuzenle;
window.accButceKaydet         = accButceKaydet;
window.renderAccDash          = renderAccDash;
window.renderAccBek           = renderAccBek;
window.renderAccSuphe         = renderAccSuphe;
window.renderAccKira          = renderAccKira;
window.renderAccAvans         = renderAccAvans;
window.saAvansSetDonem        = saAvansSetDonem;
window.accAvansOpenKisi       = accAvansOpenKisi;
window.accKiraIade            = accKiraIade;
window.openAccDeptDetay       = openAccDeptDetay;
window.accDeptTab             = accDeptTab;
window.openAccUyeDetay        = openAccUyeDetay;
window.accUyeTab              = accUyeTab;
window.renderAccRapor         = renderAccRapor;
window.saRaporToggleDonem     = saRaporToggleDonem;
window.accSupheIsle           = accSupheIsle;
window.renderAccMesaj         = renderAccMesaj;
/* fis.service.js'den re-export */
window.accOnayla              = accOnayla;
window.accReddet              = accReddet;
window.accKismi               = accKismi;
/* rapor drill-down (onclick inline) */
window._saRaporDept           = _saRaporDept;
window._saRaporDeptBack       = _saRaporDeptBack;
window._saRaporKisi           = _saRaporKisi;
window._saRaporKisiFromDept   = _saRaporKisiFromDept;
window._saRaporKisiBack       = _saRaporKisiBack;
