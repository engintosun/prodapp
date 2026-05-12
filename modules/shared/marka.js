/* ═══════════════════════════════════════════════
   MARKA AYARLARI (Brand Settings)
   7B.1a — index.html'den taşındı
   ═══════════════════════════════════════════════ */

// Global dependencies (index.html'den window üzerinden erişilir):
// APP, notif, openM, closeM, saveAppData

var _markaPickType = '';
var _markaPickId   = '';

function openMarka() {
  var co = APP.data.companyInfo || { name: '', logo: null };
  document.getElementById('marka-co-name').value = co.name || '';
  var coRm = document.getElementById('marka-co-rm');
  if (coRm) coRm.style.display = co.logo ? '' : 'none';
  var coPrev = document.getElementById('marka-co-prev');
  if (coPrev) coPrev.innerHTML = co.logo ? '<img src="' + co.logo + '" style="max-height:36px;width:auto">' : '';
  var list = document.getElementById('marka-proj-list');
  if (list) {
    list.innerHTML = APP.seed.projs.map(function(p) {
      var pLogo = APP.data.projLogos && APP.data.projLogos[p.id];
      var pName = APP.data.projNames && APP.data.projNames[p.id] ? APP.data.projNames[p.id] : '';
      return '<div style="padding:10px 0;border-bottom:1px solid var(--bo)">' +
        '<div style="font-size:11px;font-weight:700;color:var(--tx2);margin-bottom:6px">' + p.name + '</div>' +
        '<div class="fg" style="margin-bottom:6px"><label>Ad (override)</label>' +
          '<input class="fgi" id="marka-pn-' + p.id + '" type="text" value="' + pName + '" placeholder="' + p.name + '"></div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<div id="marka-pp-' + p.id + '" style="height:36px;display:flex;align-items:center;flex:1;min-width:0">' +
            (pLogo ? '<img src="' + pLogo + '" style="max-height:36px;width:auto">' : '') +
          '</div>' +
          '<button class="btn btn-sm" onclick="_markaPickLogo(\'proj\',\'' + p.id + '\')">📷 Logo</button>' +
          (pLogo ? '<button class="btn btn-sm btn-r" id="marka-pr-' + p.id + '" onclick="_markaLogoRemove(\'proj\',\'' + p.id + '\')">Kaldır</button>' : '<button class="btn btn-sm btn-r" id="marka-pr-' + p.id + '" onclick="_markaLogoRemove(\'proj\',\'' + p.id + '\')" style="display:none">Kaldır</button>') +
        '</div>' +
      '</div>';
    }).join('');
  }
  openM('m-marka');
}

function _markaPickLogo(type, id) {
  _markaPickType = type;
  _markaPickId   = id;
  var inp = document.getElementById('marka-file-inp');
  if (inp) { inp.value = ''; inp.click(); }
}

function _markaFileChange(inp) {
  if (!inp.files || !inp.files.length) return;
  _markaLogoProcess(inp.files[0], _markaPickType, _markaPickId);
}

function _markaLogoProcess(file, type, id) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var MAX_W = 400, MAX_H = 120;
      var ratio = Math.min(MAX_W / img.width, MAX_H / img.height, 1);
      var w = Math.round(img.width * ratio);
      var h = Math.round(img.height * ratio);
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      var b64 = canvas.toDataURL('image/png', 0.92);
      if (type === 'co') {
        APP.data.companyInfo.logo = b64;
        var coPrev = document.getElementById('marka-co-prev');
        var coRm   = document.getElementById('marka-co-rm');
        if (coPrev) coPrev.innerHTML = '<img src="' + b64 + '" style="max-height:36px;width:auto">';
        if (coRm)   coRm.style.display = '';
      } else {
        APP.data.projLogos[id] = b64;
        var ppEl = document.getElementById('marka-pp-' + id);
        var prEl = document.getElementById('marka-pr-' + id);
        if (ppEl) ppEl.innerHTML = '<img src="' + b64 + '" style="max-height:36px;width:auto">';
        if (prEl) prEl.style.display = '';
      }
      notif('Logo yüklendi', 'green');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function _markaLogoRemove(type, id) {
  if (type === 'co') {
    APP.data.companyInfo.logo = null;
    var coPrev = document.getElementById('marka-co-prev');
    var coRm   = document.getElementById('marka-co-rm');
    if (coPrev) coPrev.innerHTML = '';
    if (coRm)   coRm.style.display = 'none';
  } else {
    APP.data.projLogos[id] = null;
    var ppEl = document.getElementById('marka-pp-' + id);
    var prEl = document.getElementById('marka-pr-' + id);
    if (ppEl) ppEl.innerHTML = '';
    if (prEl) prEl.style.display = 'none';
  }
}

function _markaKaydet() {
  APP.data.companyInfo.name = (document.getElementById('marka-co-name').value || '').trim();
  APP.seed.projs.forEach(function(p) {
    var inp = document.getElementById('marka-pn-' + p.id);
    if (inp) {
      var v = inp.value.trim();
      if (v && v !== p.name) APP.data.projNames[p.id] = v;
      else delete APP.data.projNames[p.id];
    }
  });
  saveAppData();
  /* Header'daki proje adını güncelle */
  if (APP.ui.curProj) {
    var hdPrj = document.getElementById('sa-hd-prj');
    if (hdPrj) hdPrj.textContent = _projName(APP.ui.curProj.id);
  }
  closeM('m-marka');
  notif('Ayarlar kaydedildi', 'green');
}

// === Window Exposure (HTML onclick erişimi için) ===
window.openMarka = openMarka;
window._markaPickLogo = _markaPickLogo;
window._markaLogoRemove = _markaLogoRemove;
window._markaFileChange = _markaFileChange;
window._markaKaydet = _markaKaydet;
