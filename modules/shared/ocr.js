// /modules/shared/ocr.js
// PRODAPP — OCR & Kamera/Galeri Modülü (Adım 4 — kopyalama, index.html orijinaller yerinde)
//
// Bağımlılıklar (window globals — henüz index.html'den):
//   FIS_DEMO, notif, openM, closeM, renderRecent, openLB,
//   _resetDynFields, _detectKatFromFis, _showDynPanel, clearSig,
//   _addToDeptBekleyen

import { APP }        from '../core/state.js';
import { _pad, _mkLog } from '../core/utils.js';
import { saveAppData }  from '../core/services/storage.service.js';

/* ═══ OCR UZUN BAS ═══ */

(function() {
  var btn = document.getElementById('ocr-btn');
  if (!btn) return;
  function onStart(e) {
    APP.ui.longFired = false;
    APP.ui.longTimer = setTimeout(function() {
      APP.ui.longFired = true;
      openSub();
    }, 500);
  }
  function onEnd(e) {
    clearTimeout(APP.ui.longTimer);
    if (!APP.ui.longFired) openOCR(0);
  }
  function onCancel() {
    clearTimeout(APP.ui.longTimer);
    APP.ui.longFired = false;
  }
  btn.addEventListener('mousedown',   onStart);
  btn.addEventListener('touchstart',  onStart, { passive: true });
  btn.addEventListener('mouseup',     onEnd);
  btn.addEventListener('touchend',    onEnd,   { passive: true });
  btn.addEventListener('mouseleave',  onCancel);
  btn.addEventListener('touchcancel', onCancel);
  btn.addEventListener('contextmenu', function(e) { e.preventDefault(); });
}());

export function openSub() {
  document.getElementById('ocr-sub').style.display = 'block';
  document.getElementById('qbtns').style.display   = 'none';
  document.getElementById('ocr-hint').textContent  = 'seç veya vazgeç';
}

export function closeSub() {
  document.getElementById('ocr-sub').style.display = 'none';
  document.getElementById('qbtns').style.display   = 'flex';
  document.getElementById('ocr-hint').textContent  = 'tara veya uzun bas';
}

export function doOCR() { closeSub(); openOCR(0, null); }

export function doGaleri() {
  closeSub();
  var inp = document.getElementById('galeri-input');
  inp.value = '';
  inp.click();
}

document.getElementById('galeri-input').addEventListener('change', function(e) {
  var files = e.target.files;
  if (!files || files.length === 0) return;
  var count = files.length;
  var reader = new FileReader();
  reader.onload = function(ev) {
    if (count > 1) notif(count + ' fotoğraf seçildi, ilki işleniyor', 'blue');
    openOCR(0, ev.target.result);
  };
  reader.readAsDataURL(files[0]);
});

/* ═══ OCR MODAL ═══ */

export function openOCR(idx, imgSrc) {
  var f = FIS_DEMO[idx] || FIS_DEMO[0];
  openM('mo');
  document.getElementById('ocr-s1').style.display = 'block';
  document.getElementById('ocr-s2').style.display = 'none';
  var prev = document.getElementById('scan-preview');
  var icon = document.getElementById('scan-icon');
  if (imgSrc) {
    prev.src = imgSrc;
    prev.style.display = 'block';
    icon.style.display = 'none';
    document.getElementById('ocr-mtitle').textContent = '🖼 Fotoğraf İşleniyor';
  } else {
    prev.style.display = 'none';
    icon.style.display = 'block';
    document.getElementById('ocr-mtitle').textContent = '📷 Fiş Taranıyor';
  }
  var wrap = document.getElementById('scan-wrap');
  wrap.classList.add('scanning');
  var steps = ['Görüntü analiz ediliyor...', 'Metin tanıma...', 'Alanlar çıkarılıyor...', 'Tamamlandı ✓'];
  var i = 0;
  var iv = setInterval(function() {
    var el = document.getElementById('scan-txt');
    if (el) el.textContent = steps[i] || '';
    i++;
    if (i >= steps.length) {
      clearInterval(iv);
      wrap.classList.remove('scanning');
      setTimeout(function() {
        document.getElementById('ocr-s1').style.display = 'none';
        document.getElementById('ocr-s2').style.display = 'block';
        document.getElementById('ocr-mtitle').textContent = '✅ OCR Sonucu';
        var pr = document.getElementById('scan-preview');
        pr.src = ''; pr.style.display = 'none';
        document.getElementById('scan-icon').style.display = 'block';
        fillOCR(f);
      }, 300);
    }
  }, 650);
}

export function fillOCR(f) {
  document.getElementById('f-satici').value    = f.satici;
  document.getElementById('f-tutar').value     = f.tutar;
  document.getElementById('f-kdv').value       = f.kdv;
  document.getElementById('f-tarih').value     = f.tarih;
  document.getElementById('f-fisno').value     = f.fisno;
  document.getElementById('f-aciklama').value  = f.aciklama;
  document.getElementById('ocr-prev').innerHTML = f.prev;
  var sel = document.getElementById('f-kat');
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === f.kat) { sel.selectedIndex = i; break; }
  }
  f.c.forEach(function(cf, j) {
    var vEl = document.getElementById('c' + (j+1) + 'v');
    var bEl = document.getElementById('c' + (j+1) + 'b');
    if (vEl) { vEl.textContent = cf.v; vEl.style.color = cf.c; }
    if (bEl) { bEl.style.width = cf.w + '%'; bEl.style.background = cf.c; }
  });
  if (f.uyari) setTimeout(function() { notif(f.uyari, 'amber'); }, 600);
  _resetDynFields('');
  var detectedKat = _detectKatFromFis(f);
  var sel2 = document.getElementById('f-kat');
  if (sel2) {
    for (var k = 0; k < sel2.options.length; k++) {
      if (sel2.options[k].value === detectedKat) { sel2.selectedIndex = k; break; }
    }
  }
  _showDynPanel('', detectedKat);
  clearSig();
  var st = document.getElementById('sig-time');
  if (st) st.textContent = new Date().toLocaleString('tr-TR');
}

export function submitOCR() {
  closeM('mo');
  if (APP.ui.sdMode) {
    APP.ui.sdMode = false;
    var satici = (document.getElementById('f-satici').value || '').trim() || 'Bilinmiyor';
    var kat    = document.getElementById('f-kat').value || 'Diger';
    var tutar  = parseFloat((document.getElementById('f-tutar').value || '0').replace(',', '.')) || 0;
    _addToDeptBekleyen(satici, kat, tutar, false, '');
    notif(satici + ' bekleyene eklendi', 'green');
  } else {
    var kat2   = document.getElementById('f-kat').value || 'Diger';
    var sat2   = (document.getElementById('f-satici').value || '').trim() || 'Bilinmiyor';
    var tut2   = parseFloat((document.getElementById('f-tutar').value || '0').replace(',', '.')) || 0;
    var today2 = new Date();
    var tarih2 = _pad(today2.getDate()) + '.' + _pad(today2.getMonth()+1) + '.' + today2.getFullYear();
    var entry  = {
      id: Date.now(), tarih: tarih2,
      personel: APP.ui.curUser ? APP.ui.curUser.name : 'Bilinmeyen',
      satici: sat2, kat: kat2, tutar: tut2,
      durum: 'dept-bekleyen', donem: APP.ui.aktifDon, uyari: null, thumb: null,
      log: [_mkLog('olusturuldu', 'Harcama sisteme girildi')]
    };
    if (kat2 === 'Kiralama') {
      entry.kiraMeta = {
        bas:    (document.getElementById('ki-bas').value || ''),
        bit:    (document.getElementById('ki-bit').value || ''),
        gunluk: parseFloat(document.getElementById('ki-gun').value || '0') || 0
      };
    }
    APP.data.fisler.unshift(entry);
    _addToDeptBekleyen(sat2, kat2, tut2, false, '', [], entry.id);
    renderRecent();
    notif('Harcama onaya gönderildi', 'green');
  }
  saveAppData();
}

export function openDeptOCR() {
  APP.ui.sdMode = true;
  openOCR(0, null);
}

/* ═══ BELGESİZ FOTOĞRAF ═══ */

export var bFotolar = [];

export function _bFotoKamera() {
  var inp = document.getElementById('b-foto-kamera-in');
  if (inp) { inp.value = ''; inp.click(); }
}

export function _bFotoGaleri() {
  var inp = document.getElementById('b-foto-galeri-in');
  if (inp) { inp.value = ''; inp.click(); }
}

export function _bFotoOnFile(input) {
  var files = input.files;
  if (!files || !files.length) return;
  var MAX = 5;
  for (var fi = 0; fi < files.length; fi++) {
    if (bFotolar.length >= MAX) { notif('En fazla ' + MAX + ' fotoğraf eklenebilir', 'amber'); break; }
    (function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        bFotolar.push({ id: Date.now() + Math.random(), dataUrl: e.target.result });
        _bFotoRender();
      };
      reader.readAsDataURL(file);
    })(files[fi]);
  }
}

export function _bFotoRender() {
  var grid = document.getElementById('b-foto-grid');
  if (!grid) return;
  if (!bFotolar.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = bFotolar.map(function(f) {
    return '<div class="b-foto-thumb" id="bft-' + f.id + '">' +
      '<img src="' + f.dataUrl + '" alt="kanıt" onclick="_bFotoBuyut(' + f.id + ')">' +
      '<div class="b-foto-del" onclick="_bFotoDel(' + f.id + ')">✕</div>' +
    '</div>';
  }).join('');
}

export function _bFotoDel(id) {
  for (var i = 0; i < bFotolar.length; i++) {
    if (bFotolar[i].id === id) { bFotolar.splice(i, 1); break; }
  }
  _bFotoRender();
}

export function _bFotoBuyut(id) {
  for (var i = 0; i < bFotolar.length; i++) {
    if (bFotolar[i].id === id) { openLB(bFotolar[i].dataUrl); return; }
  }
}

/* ─── window global uyumluluk (inline onclick) ──────────────────────────── */

window.openSub      = openSub;
window.closeSub     = closeSub;
window.doOCR        = doOCR;
window.doGaleri     = doGaleri;
window.openOCR      = openOCR;
window.fillOCR      = fillOCR;
window.submitOCR    = submitOCR;
window.openDeptOCR  = openDeptOCR;
window.bFotolar     = bFotolar;
window._bFotoKamera = _bFotoKamera;
window._bFotoGaleri = _bFotoGaleri;
window._bFotoOnFile = _bFotoOnFile;
window._bFotoRender = _bFotoRender;
window._bFotoDel    = _bFotoDel;
window._bFotoBuyut  = _bFotoBuyut;
