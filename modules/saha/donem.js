// /modules/saha/donem.js
// PRODAPP — Dönem Yönetimi (Adım 5 — kopyalama, index.html orijinaller yerinde)
//
// Kapsam: renderDonem (saha+dept+acc ortak), yeniDonem, donemKapa,
//         istisna izni, geç işlem modal, _checkPasifOnay.
//
// Çapraz-rol: Bu modül saha/dept/muhasebe üçü tarafından da kullanılır.
//             Adım 5'te saha kapsamında çıkarıldı; dept/acc modülleri
//             bu dosyayı import eder.
//
// Bağımlılıklar (window globals — henüz index.html'den):
//   notif, openM, closeM,
//   renderAccBek, _recomputeAccDepts,
//   _pushNotif, updateNotifBadge,
//   KAT_IC, DOT                       (constants.js'ten — saha.js üzerinden window'a atanmış)

import { APP }       from '../core/state.js';
import { _pad }      from '../core/utils.js';
import { saveAppData } from '../core/services/storage.service.js';
import { KAT_IC, DOT } from '../core/constants.js';

/* ═══ DÖNEM — SAHA GÖRÜNÜMÜ ═══ */

export function renderDonem(did) {
  APP.ui.aktifDon = did;
  var d = APP.seed.donemler.find(function(x) { return x.id === did; });
  if (!d) return;
  var kalan = d.avans - d.harcama;
  var pct   = Math.min(100, Math.round(d.harcama / d.avans * 100));

  /* Kapalı dönem uyarı bandı */
  var kapaliDonBanner = document.getElementById('don-kapali-banner');
  if (kapaliDonBanner) {
    if (d.durum === 'kapali') {
      var _role = APP.ui.curUser ? APP.ui.curUser.role : '';
      if (_role === 'acc') {
        kapaliDonBanner.style.display = 'block';
        kapaliDonBanner.innerHTML = '<div style="background:rgba(232,150,46,.15);border:1px solid rgba(232,150,46,.4);border-radius:8px;padding:9px 12px;font-size:12px;color:var(--ac2);margin-bottom:10px">⚠ Kapalı dönem — yapacağınız işlemler geç işlem olarak kaydedilir ve silinemez işaret taşır.</div>';
      } else {
        kapaliDonBanner.style.display = 'block';
        kapaliDonBanner.innerHTML = '<div style="background:rgba(100,116,139,.1);border:1px solid var(--bo);border-radius:8px;padding:9px 12px;font-size:12px;color:var(--tx3);margin-bottom:10px">🔒 Bu dönem kapanmış. Yeni fiş eklenemez veya işlem yapılamaz.</div>';
      }
    } else {
      kapaliDonBanner.style.display = 'none';
    }
  }

  /* Dönem pill seçici */
  var pillsEl = document.getElementById('don-pills');
  if (pillsEl) {
    pillsEl.innerHTML = APP.seed.donemler.map(function(x) {
      return '<div class="dp' + (x.id === did ? ' on' : '') + '" onclick="renderDonem(' + x.id + ')">' +
        x.n + (x.durum === 'aktif' ? ' Aktif' : ' Kapandı') +
      '</div>';
    }).join('');
  }

  /* İstatistik kartları */
  var statsEl = document.getElementById('don-stats');
  if (statsEl) {
    var items = [
      { lbl:'Avans',    val:'₺' + d.avans.toLocaleString('tr-TR'),   clr:'#F0C080' },
      { lbl:'Harcandı', val:'₺' + d.harcama.toLocaleString('tr-TR'), clr:'var(--tx)' },
      { lbl:'Kalan',    val:'₺' + kalan.toLocaleString('tr-TR'),      clr: kalan > 0 ? 'var(--gr2)' : 'var(--rd2)' }
    ];
    statsEl.innerHTML = items.map(function(it) {
      return '<div class="ds"><div class="ds-lbl">' + it.lbl + '</div><div class="ds-val" style="color:' + it.clr + '">' + it.val + '</div></div>';
    }).join('');
  }

  /* Özel Belgeler + Geç İşlem kartları */
  var ozelEl = document.getElementById('don-ozel-belgeler');
  if (ozelEl) {
    var _tevSay = 0, _stopSay = 0, _selfSay = 0;
    var _donemFisler = APP.data.fisler.filter(function(x) { return x.donem === did; });
    for (var _obi = 0; _obi < _donemFisler.length; _obi++) {
      var _ob = _donemFisler[_obi];
      if (_ob.ozelTip === 'tevkifat')     _tevSay++;
      else if (_ob.ozelTip === 'stopaj')     _stopSay++;
      else if (_ob.ozelTip === 'selfbilling') _selfSay++;
    }
    var _gecSay = d.gecIslemSayisi || 0;
    var _gecClr = _gecSay > 0 ? 'color:var(--am2)' : 'color:var(--tx3)';
    ozelEl.innerHTML =
      '<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Özel Belgeler</div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
        '<span style="font-size:12px;color:var(--tx2)">Tevkifat: <b>' + _tevSay + '</b></span>' +
        '<span style="font-size:12px;color:var(--tx2)">Stopaj: <b>' + _stopSay + '</b></span>' +
        '<span style="font-size:12px;color:var(--tx2)">Self-billing: <b>' + _selfSay + '</b></span>' +
        '<span style="font-size:12px;' + _gecClr + '">Geç İşlem: <b>' + _gecSay + '</b></span>' +
      '</div>';
  }

  /* İlerleme çubuğu */
  var pf = document.getElementById('don-prog-f');
  if (pf) {
    pf.style.width      = pct + '%';
    pf.style.background = pct > 90 ? 'var(--rd)' : pct > 70 ? 'var(--am)' : 'var(--ac)';
  }

  /* Fiş listesi */
  var _curName = APP.ui.curUser ? APP.ui.curUser.name : 'Mehmet Kaya';
  var myFis = APP.data.fisler.filter(function(x) { return x.donem === did && x.personel === _curName; });
  var hdLbl = document.getElementById('fis-hd-lbl');
  var hdCnt = document.getElementById('fis-hd-cnt');
  if (hdLbl) hdLbl.textContent = 'Fişler · ' + d.n;
  if (hdCnt) hdCnt.textContent = myFis.length + ' kayıt';

  var listEl = document.getElementById('fis-list');
  if (!listEl) return;

  if (myFis.length === 0) {
    listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--tx3);font-size:13px">Bu dönemde fiş yok</div>';
    return;
  }

  listEl.innerHTML = myFis.map(function(f, i) {
    var sep    = i < myFis.length - 1 ? 'border-bottom:1px solid var(--bo)' : '';
    var icStr  = KAT_IC[f.kat] || KAT_IC.def;
    var icBg   = f.duplikat ? 'rgba(239,68,68,.1)' : f.belgesiz ? 'rgba(59,130,246,.1)' : f.uyari ? 'rgba(245,158,11,.1)' : 'var(--bg3)';
    var icClr  = f.duplikat ? 'var(--rd)' : f.belgesiz ? 'var(--bl)'  : f.uyari ? 'var(--am)' : 'var(--ac)';
    var amtClr = f.duplikat ? 'color:var(--rd2)' : f.durum === 'reddedildi' ? 'color:var(--rd2);text-decoration:line-through' : '';
    var uyHtml = f.uyari    ? ' <span style="font-size:11px;color:var(--am2)" title="' + f.uyari + '">⚠️</span>' : '';
    var dpHtml = f.duplikat ? ' <span style="font-size:11px;color:var(--rd2)">🔴</span>' : '';
    var blHtml = f.belgesiz ? ' <span style="font-size:10px;background:rgba(59,130,246,.15);color:var(--bl2);border-radius:3px;padding:1px 4px;font-weight:700">BSZ</span>' : '';
    var media;
    if (f.thumb) {
      media = '<img src="' + f.thumb + '" class="fis-thumb" onclick="event.stopPropagation();openLBFis(' + f.id + ')" alt="">';
    } else if (f.belgesiz) {
      media = '<div class="fis-thumb fis-thumb-bsz">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
          '<polyline points="14 2 14 8 20 8"/>' +
          '<line x1="9" y1="13" x2="15" y2="19"/><line x1="15" y1="13" x2="9" y2="19"/>' +
        '</svg>' +
      '</div>';
    } else {
      media = '<img src="' + fisThumbnail(f) + '" class="fis-thumb" onclick="event.stopPropagation();openLBFis(' + f.id + ')" alt="">';
    }
    return '<div class="fis-row" style="' + sep + '" onclick="openLBFis(' + f.id + ')">' +
      media +
      '<div style="flex:1;min-width:0">' +
        '<div class="fis-name">' + f.satici + uyHtml + dpHtml + blHtml + '</div>' +
        '<div class="fis-meta">' + f.tarih + ' · ' + f.kat + '</div>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0">' +
        '<div class="fis-amt" style="' + amtClr + '">₺' + f.tutar.toLocaleString('tr-TR') + '</div>' +
        '<div class="fis-dot" style="background:' + (DOT[f.durum] || 'var(--tx3)') + '"></div>' +
      '</div>' +
    '</div>';
  }).join('');

  /* Kapalı dönem kapama özeti */
  var kapamaEl = document.getElementById('kapama-box');
  if (!kapamaEl) return;
  if (d.durum !== 'kapali') { kapamaEl.style.display = 'none'; return; }

  var onayFis = myFis.filter(function(f) { return f.durum === 'onaylandi'; });
  var redFis  = myFis.filter(function(f) { return f.durum === 'reddedildi'; });
  var onayTop = onayFis.reduce(function(s, f) { return s + f.tutar; }, 0);
  var redTop  = redFis.reduce(function(s, f) { return s + f.tutar; }, 0);
  var iade    = d.avans - onayTop;
  var _isAcc  = APP.ui.curUser && APP.ui.curUser.role === 'acc';
  var _istisnaBtn = '';

  if (_isAcc) {
    var _simdi = Date.now();
    var _donIzinler = APP.data.istisnaIzinleri.filter(function(iz) { return iz.donemId === did; });
    if (_donIzinler.length) {
      var _durumLbl = { aktif:'Aktif', sureDoldu:'Süre Doldu', adetDoldu:'Adet Doldu', tutarDoldu:'Tutar Doldu', iptal:'İptal' };
      _istisnaBtn += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--bo)">' +
        '<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">İstisna İzinleri</div>' +
        _donIzinler.map(function(iz) {
          var gecenSaat = ((_simdi - iz.baslangicTs) / (1000*60*60)).toFixed(1);
          var kalanSaat = Math.max(0, iz.sure - parseFloat(gecenSaat)).toFixed(1);
          var durumClr  = iz.durum === 'aktif' ? 'var(--gr2)' : 'var(--rd2)';
          var durumTxt  = _durumLbl[iz.durum] || iz.durum;
          var iptalBtn  = iz.durum === 'aktif'
            ? '<button class="btn btn-sm btn-r" style="font-size:10px;padding:3px 8px" onclick="istisnaIzniIptal(' + iz.id + ')">İptal</button>'
            : '';
          var limitBilgi = [];
          if (iz.maxAdet  !== null) limitBilgi.push(iz.girilenAdet  + '/' + iz.maxAdet  + ' belge');
          if (iz.maxTutar !== null) limitBilgi.push('₺' + iz.girilenTutar.toLocaleString('tr-TR') + '/₺' + iz.maxTutar.toLocaleString('tr-TR'));
          if (iz.durum === 'aktif') limitBilgi.push(kalanSaat + ' saat kalan');
          return '<div style="background:var(--bg2);border:1px solid var(--bo);border-radius:8px;padding:8px 10px;margin-bottom:6px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
              '<span style="font-size:13px;font-weight:700;color:var(--tx)">' + iz.kisiAd + '</span>' +
              '<div style="display:flex;align-items:center;gap:6px">' +
                '<span style="font-size:11px;font-weight:700;color:' + durumClr + '">' + durumTxt + '</span>' +
                iptalBtn +
              '</div>' +
            '</div>' +
            '<div style="font-size:11px;color:var(--tx3)">' + iz.verilisTarihi + ' · ' + iz.sure + ' saat · ' + iz.sebep + '</div>' +
            (limitBilgi.length ? '<div style="font-size:11px;color:var(--ac2);margin-top:3px">' + limitBilgi.join(' · ') + '</div>' : '') +
          '</div>';
        }).join('') +
      '</div>';
    }
    _istisnaBtn += '<div style="margin-top:8px">' +
      '<button class="btn btn-sm" style="width:100%;justify-content:center;background:rgba(232,150,46,.12);color:var(--ac2);border:1px solid rgba(232,150,46,.3)" onclick="openIstisnaIzniModal(' + did + ')">🔓 İstisna İzni Ver</button>' +
    '</div>';
  }

  kapamaEl.style.display = 'block';
  kapamaEl.innerHTML =
    '<div class="kapama-hd">' +
      '<span style="font-size:15px;font-weight:700;color:var(--tx)">Dönem Kapama Özeti</span>' +
      '<span class="kapama-badge">KAPANDI</span>' +
    '</div>' +
    '<div class="kapama-grid">' +
      '<div class="kapama-stat"><div class="kapama-stat-lbl">Onaylanan</div><div class="kapama-stat-val" style="color:var(--gr2)">' + onayFis.length + ' fiş · ₺' + onayTop.toLocaleString('tr-TR') + '</div></div>' +
      '<div class="kapama-stat"><div class="kapama-stat-lbl">Reddedilen</div><div class="kapama-stat-val" style="color:var(--rd2)">' + redFis.length + ' fiş · ₺' + redTop.toLocaleString('tr-TR') + '</div></div>' +
      '<div class="kapama-stat"><div class="kapama-stat-lbl">Kullanılan Avans</div><div class="kapama-stat-val" style="color:var(--ac2)">₺' + onayTop.toLocaleString('tr-TR') + '</div></div>' +
      '<div class="kapama-stat"><div class="kapama-stat-lbl">İade / Fark</div><div class="kapama-stat-val" style="color:' + (iade >= 0 ? 'var(--gr2)' : 'var(--rd2)') + '">' + (iade >= 0 ? '+' : '') + '₺' + Math.abs(iade).toLocaleString('tr-TR') + '</div></div>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--tx3);margin-bottom:12px">Kapanış: 05.04.2026 · Onaylayan: Ayşe T. (Muhasebe)</div>' +
    '<div class="kapama-docs">' +
      '<div class="kapama-docs-lbl">Yüklenen Belgeler</div>' +
      '<div class="kapama-doc-row"><div class="kapama-doc-ic">📄</div><div style="flex:1"><div style="font-weight:600">D1_Donem_Raporu_final.pdf</div><div style="font-size:11px;color:var(--tx3);margin-top:1px">5 Nis 2026 · 142 KB</div></div><span style="font-size:11px;color:var(--gr2);font-weight:600">✓</span></div>' +
      '<div class="kapama-doc-row"><div class="kapama-doc-ic">🖼</div><div style="flex:1"><div style="font-weight:600">fisler_taranmis_D1.zip</div><div style="font-size:11px;color:var(--tx3);margin-top:1px">4 Nis 2026 · 2.3 MB · 5 fiş</div></div><span style="font-size:11px;color:var(--gr2);font-weight:600">✓</span></div>' +
      '<div class="kapama-doc-row"><div class="kapama-doc-ic">✍️</div><div style="flex:1"><div style="font-weight:600">imzali_mutabakat_D1.pdf</div><div style="font-size:11px;color:var(--tx3);margin-top:1px">5 Nis 2026 · 87 KB · Dept. + Muhasebe imzalı</div></div><span style="font-size:11px;color:var(--gr2);font-weight:600">✓</span></div>' +
    '</div>' +
    _istisnaBtn;
}

/* ═══ DÖNEM YÖNETİMİ (muhasebe yetkili) ═══ */

export function yeniDonem() {
  if (!APP.ui.curUser || APP.ui.curUser.role !== 'acc') {
    notif('Dönem yönetimi sadece muhasebe yetkisindedir.', 'red'); return;
  }
  var aktif = null;
  for (var _ai = 0; _ai < APP.seed.donemler.length; _ai++) {
    if (APP.seed.donemler[_ai].durum === 'aktif') { aktif = APP.seed.donemler[_ai]; break; }
  }
  if (aktif) {
    var deptBek = APP.data.deptBekleyen.filter(function(f) { return f.donem === aktif.id && f.kat !== 'Kiralama'; });
    var accBek  = APP.data.accBekleyen.filter(function(f)  { return f.donem === aktif.id && f.tip !== 'avans' && f.kat !== 'Kiralama'; });
    var bekTop  = deptBek.length + accBek.length;
    if (bekTop > 0) {
      if (confirm(aktif.lbl + ' açık ve ' + bekTop + ' bekleyen var. Önce kapatılmalı. Devam edip kapatma modalını açayım mı?')) {
        _dnKapamaModal(aktif.id);
      }
      return;
    }
    if (!confirm(aktif.lbl + ' açık ama bekleyeni yok. Otomatik kapatıp yeni dönem açayım mı?')) return;
    donemKapa(aktif.id, 'Yeni dönem açılışı için otomatik kapama');
  }
  var _ids  = APP.seed.donemler.map(function(x) { return x.id; });
  var yeniId = Math.max.apply(null, _ids) + 1;
  var yeniN  = yeniId + 1;
  var bugun  = new Date().toLocaleDateString('tr-TR');
  APP.seed.donemler.unshift({
    id: yeniId, n: 'D' + yeniN, lbl: 'Dönem #' + yeniN,
    tarih: bugun + ' →', durum: 'aktif',
    avans: 0, harcama: 0, islem: 0,
    baslangic: bugun, bitis: null, kapanmaTarihi: null, kapayanKisi: null, gecIslemSayisi: 0
  });
  APP.seed.sdDonemler.unshift({ id: yeniId, lbl: 'Dönem #' + yeniN, tarih: bugun, aktif: true });
  for (var _si = 1; _si < APP.seed.sdDonemler.length; _si++) APP.seed.sdDonemler[_si].aktif = false;
  APP.seed.saDonemler.unshift({ id: yeniId, lbl: 'Dönem #' + yeniN, tarih: bugun, aktif: true });
  for (var _sai = 1; _sai < APP.seed.saDonemler.length; _sai++) APP.seed.saDonemler[_sai].aktif = false;
  APP.data.donemButce.unshift({ donem: yeniId, lbl: 'Dönem #' + yeniN, butce: 40000, harcanan: 0, reddedildi: 0, _lastPct: 0 });
  APP.ui.aktifDon = yeniId;
  saveAppData();
  renderDonem(yeniId);
  renderAccBek();
  _recomputeAccDepts();
  _pushNotif('s', 'bl', 'Yeni Dönem Açıldı', 'Dönem #' + yeniN + ' başladı.', 'Az önce · Sistem');
  _pushNotif('d', 'bl', 'Yeni Dönem Açıldı', 'Dönem #' + yeniN + ' başladı.', 'Az önce · Sistem');
  updateNotifBadge();
  notif('Dönem #' + yeniN + ' açıldı', 'green');
}

export function donemKapa(donemId, sebep) {
  if (!APP.ui.curUser || APP.ui.curUser.role !== 'acc') return;
  var d = APP.seed.donemler.find(function(x) { return x.id === donemId; });
  if (!d) return;
  if (d.durum === 'kapali') { notif('Bu dönem zaten kapalı.', 'red'); return; }

  var deptBek = APP.data.deptBekleyen.filter(function(f) {
    if (String(f.donem) !== String(donemId) || f.kat === 'Kiralama') return false;
    var _fis = APP.data.fisler.find(function(x) { return x.id === f.fisId; });
    return _fis && _fis.durum === 'dept-bekleyen';
  });
  var accBek = APP.data.accBekleyen.filter(function(f) {
    if (String(f.donem) !== String(donemId) || f.tip === 'avans' || f.kat === 'Kiralama') return false;
    var _fis = APP.data.fisler.find(function(x) { return x.id === f.fisId; });
    return _fis && _fis.durum === 'acc-bekleyen';
  });
  var bekTop = deptBek.length + accBek.length;
  if (bekTop > 0) {
    notif('Bu dönemde ' + bekTop + ' bekleyen fiş var. Önce işlem yapılmalı.', 'red'); return;
  }

  var kiralamaBek = APP.data.deptBekleyen.filter(function(f) { return f.donem === donemId && f.kat === 'Kiralama'; }).length +
                    APP.data.accBekleyen.filter(function(f)  { return f.donem === donemId && f.tip !== 'avans' && f.kat === 'Kiralama'; }).length;
  if (kiralamaBek > 0) {
    if (!confirm('Bu dönemde ' + kiralamaBek + ' açık kiralama var. Kiralamalar sonradan bağlanabilir. Yine de kapatılsın mı?')) return;
  }

  var acikAvans = (APP.data.accAvansGecmis || []).filter(function(av) { return av.donem === donemId && av.durum !== 'ödendi'; }).length;
  if (acikAvans > 0) {
    _pushNotif('m', 'am', 'Açık Avans Uyarısı', d.lbl + ' kapatıldı — ' + acikAvans + ' avans takipte.', 'Az önce · Sistem');
  }

  var bugun = new Date().toLocaleDateString('tr-TR');
  d.durum = 'kapali';
  d.bitis = bugun;
  d.kapanmaTarihi = bugun;
  d.kapayanKisi   = APP.ui.curUser.name;

  for (var _sdi = 0; _sdi < APP.seed.sdDonemler.length; _sdi++) {
    if (APP.seed.sdDonemler[_sdi].id === donemId) { APP.seed.sdDonemler[_sdi].aktif = false; break; }
  }
  for (var _ssdi = 0; _ssdi < APP.seed.saDonemler.length; _ssdi++) {
    if (APP.seed.saDonemler[_ssdi].id === donemId) { APP.seed.saDonemler[_ssdi].aktif = false; break; }
  }

  saveAppData();
  renderDonem(donemId);
  _recomputeAccDepts();
  _pushNotif('s', 'kp', d.lbl + ' Kapatıldı', d.lbl + ' kapandı.', 'Az önce · Sistem');
  _pushNotif('d', 'kp', d.lbl + ' Kapatıldı', d.lbl + ' kapandı.', 'Az önce · Sistem');
  updateNotifBadge();
  notif(d.lbl + ' kapatıldı', 'green');
}

export function _isDonemKapali(donemId) {
  var d = APP.seed.donemler.find(function(x) { return x.id === donemId; });
  return !!(d && d.durum === 'kapali');
}

/* ═══ İSTİSNA İZNİ ═══ */

var _istisnaDonemId = null;

export function openIstisnaIzniModal(donemId) {
  _istisnaDonemId = donemId;
  var d = APP.seed.donemler.find(function(x) { return x.id === donemId; });
  var dLbl = d ? d.lbl : ('Dönem #' + donemId);
  var infoEl = document.getElementById('istisna-donem-info');
  if (infoEl) infoEl.textContent = dLbl + ' — kapanmış döneme kişiye özel giriş izni';
  var sel = document.getElementById('istisna-kisi-sel');
  if (sel) {
    sel.innerHTML = '<option value="">— Kişi seçin —</option>' +
      APP.seed.deptEkip.map(function(u) {
        return '<option value="' + u.id + '">' + u.name + ' (' + u.rol + ')</option>';
      }).join('');
  }
  var sebepEl = document.getElementById('istisna-sebep');
  if (sebepEl) sebepEl.value = '';
  var sureEl = document.getElementById('istisna-sure');
  if (sureEl) sureEl.value = '8';
  var adetEl = document.getElementById('istisna-max-adet');
  if (adetEl) adetEl.value = '';
  var tutarEl = document.getElementById('istisna-max-tutar');
  if (tutarEl) tutarEl.value = '';
  openM('md-istisna-izni');
}

export function donemIstisnaIzniVer() {
  var donemId  = _istisnaDonemId;
  var sel      = document.getElementById('istisna-kisi-sel');
  var sebepEl  = document.getElementById('istisna-sebep');
  var sureEl   = document.getElementById('istisna-sure');
  var adetEl   = document.getElementById('istisna-max-adet');
  var tutarEl  = document.getElementById('istisna-max-tutar');
  var kisiKey  = sel     ? sel.value.trim()             : '';
  var sebep    = sebepEl ? sebepEl.value.trim()          : '';
  var sure     = sureEl  ? parseInt(sureEl.value, 10)    : 0;
  var maxAdet  = adetEl  && adetEl.value.trim()  !== '' ? parseInt(adetEl.value,  10) : null;
  var maxTutar = tutarEl && tutarEl.value.trim() !== '' ? parseFloat(tutarEl.value)   : null;

  if (!kisiKey)           { notif('Kişi seçilmeli', 'red'); return; }
  if (sebep.length < 10)  { notif('Sebep en az 10 karakter olmalı', 'red'); return; }
  if (!sure || sure <= 0) { notif("Süre 0'dan büyük olmalı", 'red'); return; }

  var d = APP.seed.donemler.find(function(x) { return x.id === donemId; });
  if (!d || d.durum !== 'kapali') { notif('Sadece kapalı dönemlere izin verilebilir', 'red'); return; }

  var uyeObj = null;
  for (var _ui = 0; _ui < APP.seed.deptEkip.length; _ui++) {
    if (APP.seed.deptEkip[_ui].id === kisiKey) { uyeObj = APP.seed.deptEkip[_ui]; break; }
  }
  if (!uyeObj) { notif('Geçersiz kişi', 'red'); return; }

  for (var _ii = 0; _ii < APP.data.istisnaIzinleri.length; _ii++) {
    var _iz = APP.data.istisnaIzinleri[_ii];
    if (_iz.donemId === donemId && _iz.kisiKey === kisiKey && _iz.durum === 'aktif') {
      notif(uyeObj.name + ' için bu dönemde zaten aktif izin var', 'red'); return;
    }
  }

  var now = new Date();
  var _p  = function(n) { return n < 10 ? '0' + n : String(n); };
  var verilisTarihi = _p(now.getDate()) + '.' + _p(now.getMonth() + 1) + '.' + now.getFullYear() +
    ' ' + _p(now.getHours()) + ':' + _p(now.getMinutes());

  APP.data.istisnaIzinleri.push({
    id: Date.now(), donemId: donemId, kisiKey: kisiKey, kisiAd: uyeObj.name,
    sebep: sebep, sure: sure, maxAdet: maxAdet, maxTutar: maxTutar,
    verenKisi: APP.ui.curUser ? APP.ui.curUser.name : 'Muhasebe',
    verilisTarihi: verilisTarihi, baslangicTs: Date.now(), durum: 'aktif',
    girilenAdet: 0, girilenTutar: 0
  });

  var toKey = null;
  for (var _uk in APP.seed.users) {
    if (APP.seed.users[_uk].name === uyeObj.name) { toKey = _uk; break; }
  }
  if (toKey) {
    _pushNotif(toKey, 'am', 'İstisna İzni',
      d.lbl + ' — ' + sure + ' saatlik giriş izniniz var. Sebep: ' + sebep,
      'Az önce · Muhasebe');
    updateNotifBadge();
  }

  saveAppData();
  closeM('md-istisna-izni');
  notif('İstisna izni verildi — ' + uyeObj.name, 'green');
}

export function _aktifIstisnaIzni(donemId, kisiAd) {
  for (var _ai = 0; _ai < APP.data.istisnaIzinleri.length; _ai++) {
    var _iz = APP.data.istisnaIzinleri[_ai];
    if (_iz.donemId === donemId && _iz.kisiAd === kisiAd && _iz.durum === 'aktif') return _iz;
  }
  return null;
}

export function _istisnaIzniGecerliMi(izin) {
  var gecenSaat = (Date.now() - izin.baslangicTs) / (1000 * 60 * 60);
  if (gecenSaat >= izin.sure) { izin.durum = 'sureDoldu'; saveAppData(); return false; }
  if (izin.maxAdet  !== null && izin.girilenAdet  >= izin.maxAdet)  { izin.durum = 'adetDoldu';  saveAppData(); return false; }
  if (izin.maxTutar !== null && izin.girilenTutar >= izin.maxTutar) { izin.durum = 'tutarDoldu'; saveAppData(); return false; }
  return true;
}

export function istisnaIzniIptal(izinId) {
  for (var _ii = 0; _ii < APP.data.istisnaIzinleri.length; _ii++) {
    if (APP.data.istisnaIzinleri[_ii].id === izinId) {
      APP.data.istisnaIzinleri[_ii].durum = 'iptal'; break;
    }
  }
  saveAppData();
  renderDonem(APP.ui.aktifDon);
  notif('İstisna izni iptal edildi', 'amber');
}

/* ═══ GEÇ İŞLEM MODAL ═══ */

var _gecIslemCb      = null;
var _dnKapamaDonemId = null;

export function _gecIslemModal(donemId, islem, callback) {
  _gecIslemCb = callback;
  var d = APP.seed.donemler.find(function(x) { return x.id === donemId; });
  var dLbl = d ? d.lbl : ('Dönem #' + donemId);
  var infoEl = document.getElementById('gec-islem-info');
  if (infoEl) infoEl.textContent = dLbl + ' kapalı. Bu işlem (' + islem + ') geç işlem olarak silinemez şekilde kaydedilecek. Sebep zorunludur (min. 10 karakter).';
  var ta = document.getElementById('gec-islem-sebep');
  if (ta) ta.value = '';
  openM('md-gec-islem');
}

export function _gecIslemUygula() {
  var ta    = document.getElementById('gec-islem-sebep');
  var sebep = ta ? ta.value.trim() : '';
  if (sebep.length < 10) { notif('Sebep en az 10 karakter olmalı', 'red'); return; }
  closeM('md-gec-islem');
  if (_gecIslemCb) { var cb = _gecIslemCb; _gecIslemCb = null; cb(sebep); }
}

export function _dnKapamaModal(donemId) {
  _dnKapamaDonemId = donemId;
  var d = APP.seed.donemler.find(function(x) { return x.id === donemId; });
  var dLbl = d ? d.lbl : ('Dönem #' + donemId);
  var deptBek = APP.data.deptBekleyen.filter(function(f) {
    if (String(f.donem) !== String(donemId) || f.kat === 'Kiralama') return false;
    var _fis = APP.data.fisler.find(function(x) { return x.id === f.fisId; });
    return _fis && _fis.durum === 'dept-bekleyen';
  });
  var accBek = APP.data.accBekleyen.filter(function(f) {
    if (String(f.donem) !== String(donemId) || f.tip === 'avans' || f.kat === 'Kiralama') return false;
    var _fis = APP.data.fisler.find(function(x) { return x.id === f.fisId; });
    return _fis && _fis.durum === 'acc-bekleyen';
  });
  var bekTop = deptBek.length + accBek.length;
  var infoEl = document.getElementById('dn-kapama-info');
  if (infoEl) infoEl.innerHTML =
    '<strong>' + dLbl + '</strong> kapatılacak.<br>' +
    'Saha ve dept için tam kapanış — muhasebe geç işlem olarak müdahale edebilir.<br><br>' +
    (bekTop > 0
      ? '<span style="color:var(--rd)">⚠ ' + bekTop + ' bekleyen (kiralama hariç) var — önce işlenmeli.</span>' +
        '<br><span style="color:var(--rd2);font-size:12px">Bekleyen fişler işlenmeden bu dönem kapatılamaz. Önce muhasebe ekranından her bekleyeni onaylayın veya reddedin.</span>'
      : '<span style="color:var(--gr)">✓ Kiralama hariç bekleyen yok.</span>');
  var ta = document.getElementById('dn-kapama-sebep');
  if (ta) ta.value = '';
  var kapatBtn = document.getElementById('dn-kapama-btn');
  if (kapatBtn) {
    if (bekTop > 0) {
      kapatBtn.disabled = true;
      kapatBtn.style.opacity = '0.4';
      kapatBtn.style.cursor  = 'not-allowed';
      kapatBtn.onclick = null;
    } else {
      kapatBtn.disabled = false;
      kapatBtn.style.opacity = '';
      kapatBtn.style.cursor  = '';
      kapatBtn.onclick = function() { _dnKapamaUygula(); };
    }
  }
  openM('md-donem-kapama');
}

export function _dnKapamaUygula() {
  var ta    = document.getElementById('dn-kapama-sebep');
  var sebep = ta ? ta.value.trim() : '';
  closeM('md-donem-kapama');
  donemKapa(_dnKapamaDonemId, sebep);
}

/* ═══ PASİF ONAY ═══ */

export function _checkPasifOnay() {
  var simdi    = Date.now();
  var yedi_gun = 7 * 24 * 60 * 60 * 1000;
  var bir_gun  = 24 * 60 * 60 * 1000;
  var pasifOnaylar = [];
  var uyarilar = [];

  for (var i = APP.data.accBekleyen.length - 1; i >= 0; i--) {
    var item = APP.data.accBekleyen[i];
    if (item.tip === 'avans') continue;
    if (item.kat === 'Kiralama') continue;
    if (!item.olusturmaZamani) continue;
    var gecen = simdi - item.olusturmaZamani;
    if (gecen >= yedi_gun)              { pasifOnaylar.push({ item: item, idx: i }); }
    else if (gecen >= (yedi_gun - bir_gun)) { uyarilar.push(item); }
  }

  for (var pi = pasifOnaylar.length - 1; pi >= 0; pi--) {
    var po    = pasifOnaylar[pi];
    var pItem = po.item;
    if (pItem.fisId) {
      for (var fi = 0; fi < APP.data.fisler.length; fi++) {
        if (APP.data.fisler[fi].id === pItem.fisId) { APP.data.fisler[fi].durum = 'onaylandi'; break; }
      }
    }
    APP.data.accGecmis.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      fisId: pItem.fisId || null, islem: 'onay',
      onaylayan: 'SİSTEM (7-gün pasif onay)', tarih: Date.now(),
      tutar: pItem.tutar, kat: pItem.kat || '', satici: pItem.satici || '',
      uye: pItem.uye, dept: pItem.dept || '',
      donem: pItem.donem !== undefined ? pItem.donem : APP.ui.aktifDon,
      pasifOnay: true
    });
    APP.data.accBekleyen.splice(po.idx, 1);
    _pushNotif('s', 'gr', 'Pasif Onay',
      (pItem.satici || '') + ' — 7 gün doldu, otomatik onaylandı.', 'Az önce · Sistem');
    _pushNotif('m', 'am', 'Pasif Onay Tetiklendi',
      (pItem.uye || '') + ' — ' + (pItem.satici || '') + ' otomatik onaylandı.', 'Az önce · Sistem');
  }

  for (var ui = 0; ui < uyarilar.length; ui++) {
    var uw = uyarilar[ui];
    if (uw.uyariVerildi) continue;
    uw.uyariVerildi = true;
    _pushNotif('m', 'am', 'Pasif Onay Yaklaşıyor',
      (uw.uye || '') + ' — ' + (uw.satici || '') + ' 1 gün içinde otomatik onaylanacak.', 'Az önce · Sistem');
  }

  if (pasifOnaylar.length > 0) { saveAppData(); _recomputeAccDepts(); updateNotifBadge(); }
}

/* ─── window global uyumluluk (inline onclick) ──────────────────────────── */

window.renderDonem           = renderDonem;
window.yeniDonem             = yeniDonem;
window.donemKapa             = donemKapa;
window._isDonemKapali        = _isDonemKapali;
window.openIstisnaIzniModal  = openIstisnaIzniModal;
window.donemIstisnaIzniVer   = donemIstisnaIzniVer;
window._aktifIstisnaIzni     = _aktifIstisnaIzni;
window._istisnaIzniGecerliMi = _istisnaIzniGecerliMi;
window.istisnaIzniIptal      = istisnaIzniIptal;
window._gecIslemModal        = _gecIslemModal;
window._gecIslemUygula       = _gecIslemUygula;
window._dnKapamaModal        = _dnKapamaModal;
window._dnKapamaUygula       = _dnKapamaUygula;
window._checkPasifOnay       = _checkPasifOnay;
