/* ═══════════════════════════════════════════════
   SOHBET SİSTEMİ (Mesajlaşma 2.0)
   7B.1b — index.html'den taşındı
   ═══════════════════════════════════════════════ */

// Global dependencies (window üzerinden erişilir):
// APP, notif, openM, closeM, saveAppData, showScr

function _fmtSohbetZaman(ts) {
  if (!ts) return '';
  var d = new Date(ts);
  var now = new Date();
  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var yestStart  = todayStart - 86400000;
  if (ts >= todayStart) {
    var hh = d.getHours(), mm = d.getMinutes();
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }
  if (ts >= yestStart) return 'dün';
  return (d.getDate() < 10 ? '0' : '') + d.getDate() + '.' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1);
}

function _getSohbetAdi(sohbet, userKey) {
  if (sohbet.tip === 'grup') return sohbet.grupAdi || 'Grup';
  var diger = '';
  for (var i = 0; i < sohbet.katilimcilar.length; i++) {
    if (sohbet.katilimcilar[i] !== userKey) { diger = sohbet.katilimcilar[i]; break; }
  }
  var u = APP.seed.users[diger];
  return u ? u.name : diger;
}

function _getSohbetOkunmamis(sohbet, userKey) {
  var cnt = 0;
  var msgs = sohbet.mesajlar || [];
  for (var i = 0; i < msgs.length; i++) {
    var m = msgs[i];
    if (m.gonderen === userKey) continue;
    if (m.okunanlar.indexOf(userKey) === -1) cnt++;
  }
  return cnt;
}

function _getSonMesaj(sohbet) {
  var msgs = sohbet.mesajlar || [];
  return msgs.length ? msgs[msgs.length - 1] : null;
}

function _sohbetFiltre(userKey) {
  var list = APP.data.sohbetler || [];
  if (userKey === 'm') return list;
  /* dept: kendi dept sohbetleri + muhasebeyle olanlar */
  if (userKey === 'd') {
    return list.filter(function(s) {
      return s.katilimcilar.indexOf('d') !== -1;
    });
  }
  /* saha: sadece dept sorumlusuyla bireysel sohbet */
  return list.filter(function(s) {
    return s.tip === 'bireysel' &&
           s.katilimcilar.indexOf('s') !== -1 &&
           s.katilimcilar.indexOf('d') !== -1;
  });
}

function _sohbetAvHtml(sohbet, userKey) {
  if (sohbet.tip === 'grup') {
    return '<div class="sohbet-av sohbet-av-grup">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
    '</div>';
  }
  var adi = _getSohbetAdi(sohbet, userKey);
  var ini = adi.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  return '<div class="sohbet-av">' + ini + '</div>';
}

function renderSohbetListesi(containerEl, userKey) {
  if (!containerEl) return;
  var list = _sohbetFiltre(userKey);
  if (!list.length) {
    containerEl.innerHTML = '<div class="sohbet-bos">Henüz sohbet yok</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var s      = list[i];
    var son    = _getSonMesaj(s);
    var adi    = _getSohbetAdi(s, userKey);
    var okunmamis = _getSohbetOkunmamis(s, userKey);
    var onizleme  = son ? son.icerik : 'Mesaj yok';
    var zaman     = son ? _fmtSohbetZaman(son.tarih) : '';
    html += '<div class="sohbet-item" onclick="openSohbet(\'' + s.id + '\')">' +
      _sohbetAvHtml(s, userKey) +
      '<div class="sohbet-body">' +
        '<div class="sohbet-adi">' + adi + '</div>' +
        '<div class="sohbet-onizleme">' + onizleme + '</div>' +
      '</div>' +
      '<div class="sohbet-meta">' +
        '<div class="sohbet-zaman">' + zaman + '</div>' +
        (okunmamis ? '<div class="sohbet-badge">' + okunmamis + '</div>' : '') +
      '</div>' +
    '</div>';
  }
  containerEl.innerHTML = html;
}

/* ── Sohbet içi ekranı ── */

var _aktifSohbetId = '';
var _sicNearBottom = true;

function _escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function openSohbet(id) {
  var sohbet = null;
  for (var i = 0; i < APP.data.sohbetler.length; i++) {
    if (APP.data.sohbetler[i].id === id) { sohbet = APP.data.sohbetler[i]; break; }
  }
  if (!sohbet) return;
  _aktifSohbetId = id;
  var userKey = APP.ui.curUserKey || 's';

  _sohbetMarkRead(sohbet, userKey);

  var adi = _getSohbetAdi(sohbet, userKey);
  document.getElementById('sic-adi').textContent = adi;

  var avEl = document.getElementById('sic-av');
  if (sohbet.tip === 'grup') {
    avEl.className = 'sic-av sic-av-grup';
    avEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  } else {
    avEl.className = 'sic-av';
    var ini = adi.split(' ').map(function(w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
    avEl.textContent = ini;
  }

  _renderSohbetIci(sohbet, userKey);
  openM('msohbet');

  setTimeout(function() {
    _scrollSonaMesaj(true);
    var txt = document.getElementById('sic-txt');
    if (txt) txt.focus();
  }, 60);

  var mesajlarEl = document.getElementById('sic-mesajlar');
  if (mesajlarEl) {
    mesajlarEl.onscroll = function() {
      _sicNearBottom = (this.scrollHeight - this.scrollTop - this.clientHeight) < 80;
    };
  }
}

function closeSohbet() {
  closeM('msohbet');
  _aktifSohbetId = '';
  _refreshSohbetListeler();
}

function _sohbetMarkRead(sohbet, userKey) {
  var changed = false;
  var msgs = sohbet.mesajlar || [];
  for (var i = 0; i < msgs.length; i++) {
    var m = msgs[i];
    if (m.gonderen !== userKey && m.okunanlar.indexOf(userKey) === -1) {
      m.okunanlar.push(userKey);
      changed = true;
    }
  }
  if (changed) saveAppData();
}

function _renderSohbetIci(sohbet, userKey) {
  var el = document.getElementById('sic-mesajlar');
  if (!el) return;
  var msgs = sohbet.mesajlar || [];
  if (!msgs.length) {
    el.innerHTML = '<div class="sic-bos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;display:block;margin:0 auto 10px;opacity:.4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Henüz mesaj yok<br>İlk mesajını yaz!</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < msgs.length; i++) {
    var m = msgs[i];
    var benMi = (m.gonderen === userKey);
    var zaman = _fmtSohbetZaman(m.tarih);

    /* Okundu göstergesi */
    var okuduHtml = '';
    if (benMi) {
      var okunanlar = m.okunanlar || [];
      var okunanSay = 0;
      var katSay = sohbet.katilimcilar.length;
      for (var k = 0; k < katSay; k++) {
        if (sohbet.katilimcilar[k] !== userKey && okunanlar.indexOf(sohbet.katilimcilar[k]) !== -1) okunanSay++;
      }
      var toplamDiger = katSay - 1;
      if (toplamDiger > 0 && okunanSay >= toplamDiger) {
        okuduHtml = '<span class="sb-okunan">&#10003;&#10003;</span>';
      } else {
        okuduHtml = '<span class="sb-okunan bekliyor">&#10003;</span>';
      }
    }

    /* Grup sohbetinde gönderen adı (karşı taraf için) */
    var gonderenSatir = '';
    if (!benMi && sohbet.tip === 'grup') {
      var gu = APP.seed.users[m.gonderen];
      gonderenSatir = '<div class="sb-gonderen">' + _escHtml(gu ? gu.name : m.gonderen) + '</div>';
    }

    html += '<div class="sb ' + (benMi ? 'ben' : 'diger') + '">' +
      gonderenSatir +
      '<div class="sb-balon">' + _escHtml(m.icerik) + '</div>' +
      '<div class="sb-alt"><span class="sb-zaman">' + _escHtml(zaman) + '</span>' + okuduHtml + '</div>' +
    '</div>';
  }
  el.innerHTML = html;
}

function sohbetGonder() {
  var txtEl = document.getElementById('sic-txt');
  if (!txtEl) return;
  var icerik = txtEl.value.trim();
  if (!icerik) return;

  var userKey = APP.ui.curUserKey || 's';
  var sohbet = null;
  for (var i = 0; i < APP.data.sohbetler.length; i++) {
    if (APP.data.sohbetler[i].id === _aktifSohbetId) { sohbet = APP.data.sohbetler[i]; break; }
  }
  if (!sohbet) return;

  sohbet.mesajlar.push({
    id: 'm' + Date.now(),
    gonderen: userKey,
    icerik: icerik,
    tarih: Date.now(),
    okunanlar: [userKey]
  });
  saveAppData();

  txtEl.value = '';
  txtEl.style.height = '';

  _renderSohbetIci(sohbet, userKey);
  _scrollSonaMesaj(true);
  _refreshSohbetListeler();
}

function sicAutoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function sicKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sohbetGonder();
  }
}

function _scrollSonaMesaj(force) {
  var el = document.getElementById('sic-mesajlar');
  if (!el) return;
  if (force || _sicNearBottom) el.scrollTop = el.scrollHeight;
}

function _refreshSohbetListeler() {
  var userKey = APP.ui.curUserKey || 's';

  /* Saha nav dot */
  var dot = document.getElementById('ni-mesaj-dot');
  if (dot) {
    var sList = _sohbetFiltre('s');
    var sTop = 0;
    for (var i = 0; i < sList.length; i++) sTop += _getSohbetOkunmamis(sList[i], 's');
    dot.style.background = sTop ? 'var(--rd)' : 'transparent';
  }

  /* Saha tab */
  var tabMesaj = document.getElementById('tab-mesaj');
  if (tabMesaj && tabMesaj.classList.contains('on') && userKey === 's') {
    var suListe = document.getElementById('su-sohbet-liste');
    if (suListe) renderSuMesaj();
  }

  /* Dept panel */
  var sdPnl = document.getElementById('sd-pnl-mesaj');
  if (sdPnl && sdPnl.style.display !== 'none') renderDeptMesaj();

  /* Acc sohbet listesi (sadece kısmı) */
  var saListe = document.getElementById('sa-sohbet-liste');
  if (saListe) renderSohbetListesi(saListe, 'm');
}

/* ── Sohbet listeleri — ekrana özel render ── */

function renderDeptMesaj() {
  var el = document.getElementById('sd-pnl-mesaj');
  if (!el) return;
  var userKey = APP.ui.curUserKey || 'd';
  el.innerHTML =
    '<div class="sohbet-sec-hd-row">' +
      '<span class="sohbet-sec-hd">Sohbetler</span>' +
      '<button class="btn btn-sm" onclick="openYeniSohbetModal()" style="padding:4px 10px;font-size:12px">+ Yeni</button>' +
    '</div>' +
    '<div id="sd-sohbet-liste"></div>';
  renderSohbetListesi(document.getElementById('sd-sohbet-liste'), userKey);
}

function renderSuMesaj() {
  var el = document.getElementById('su-sohbet-liste');
  if (!el) return;
  var userKey = APP.ui.curUserKey || 's';
  var list = _sohbetFiltre(userKey);
  el.innerHTML = '<div class="sohbet-sec-hd">Mesajlar</div>';
  var inner = document.createElement('div');
  el.appendChild(inner);
  renderSohbetListesi(inner, userKey);
  /* okunmamış varsa nav dotunu renklendir */
  var toplamOkunmamis = 0;
  for (var i = 0; i < list.length; i++) toplamOkunmamis += _getSohbetOkunmamis(list[i], userKey);
  var dot = document.getElementById('ni-mesaj-dot');
  if (dot) dot.style.background = toplamOkunmamis ? 'var(--rd)' : 'transparent';
}

/* ── Muhasebe Mesaj ── */


/* ═══ YENİ SOHBET BAŞLATMA ═══ */

function _yeniSohbetAliciListe(userKey) {
  var users  = APP.seed.users;
  var iniMap = {};
  for (var k in users) {
    if (users.hasOwnProperty(k)) iniMap[users[k].ini] = k;
  }
  var result = [];
  var seen   = {};

  function addKey(key) {
    if (seen[key] || key === userKey) return;
    var u = users[key];
    if (!u) return;
    seen[key] = true;
    result.push({ key: key, name: u.name, ini: u.ini, rol: u.dept || '' });
  }

  if (userKey === 'm') {
    for (var k in users) {
      if (users.hasOwnProperty(k)) addKey(k);
    }
  } else if (users[userKey] && users[userKey].role === 'dept') {
    var deptK   = (users[userKey].dept || '').toLowerCase();
    var members = APP.cache.accDeptUyeler[deptK] || [];
    for (var i = 0; i < members.length; i++) {
      var mk = iniMap[members[i].ini];
      if (mk) addKey(mk);
    }
    for (var k in users) {
      if (!users.hasOwnProperty(k)) continue;
      if (users[k].role === 'acc' || users[k].role === 'dept') addKey(k);
    }
  }
  return result;
}

var _yeniSohbetTab = 'bireysel';

function openYeniSohbetModal() {
  var userKey = APP.ui.curUserKey || 'm';
  if (userKey === 's') return;
  _yeniSohbetTab = 'bireysel';
  _renderYeniSohbetTabs(userKey);
  openM('myeni');
}

function _yeniTabSec(tab) {
  _yeniSohbetTab = tab;
  _renderYeniSohbetTabs(APP.ui.curUserKey || 'm');
}

function _renderYeniSohbetTabs(userKey) {
  var el = document.getElementById('myeni-liste');
  if (!el) return;
  var isBireysel = _yeniSohbetTab === 'bireysel';
  var html =
    '<div class="yeni-tabs">' +
      '<button class="yeni-tab' + (isBireysel ? ' on' : '') + '" onclick="_yeniTabSec(\'bireysel\')">Bireysel</button>' +
      '<button class="yeni-tab' + (!isBireysel ? ' on' : '') + '" onclick="_yeniTabSec(\'grup\')">Grup Kur</button>' +
    '</div>';
  html += isBireysel ? _renderBireyselListe(userKey) : _renderGrupForm(userKey);
  el.innerHTML = html;
}

function _renderBireyselListe(userKey) {
  var alicilar = _yeniSohbetAliciListe(userKey);
  if (!alicilar.length) {
    return '<div style="padding:16px;color:var(--tx3);text-align:center">Uygun alıcı bulunamadı</div>';
  }
  var html = '';
  for (var i = 0; i < alicilar.length; i++) {
    var a = alicilar[i];
    html += '<div class="yeni-s-row" onclick="startYeniSohbet(\'' + a.key + '\')">' +
      '<div class="sohbet-av">' + a.ini + '</div>' +
      '<div class="yeni-s-info">' +
        '<div class="yeni-s-name">' + a.name + '</div>' +
        '<div class="yeni-s-rol">' + a.rol + '</div>' +
      '</div>' +
    '</div>';
  }
  return html;
}

function _renderGrupForm(userKey) {
  var alicilar = _yeniSohbetAliciListe(userKey);
  var html =
    '<div class="yeni-grup-form">' +
      '<input id="yeni-grup-adi" class="fgi" type="text" placeholder="Grup adı..." style="margin-bottom:12px">' +
      '<div class="yeni-grup-lbl">Üyeler</div>';
  if (!alicilar.length) {
    html += '<div style="padding:8px 0;color:var(--tx3);font-size:13px">Eklenecek üye bulunamadı</div>';
  } else {
    for (var i = 0; i < alicilar.length; i++) {
      var a = alicilar[i];
      html += '<label class="yeni-chk-row">' +
        '<input type="checkbox" class="yeni-chk" value="' + a.key + '">' +
        '<div class="sohbet-av" style="width:32px;height:32px;font-size:12px">' + a.ini + '</div>' +
        '<div class="yeni-s-info">' +
          '<div class="yeni-s-name">' + a.name + '</div>' +
          '<div class="yeni-s-rol">' + a.rol + '</div>' +
        '</div>' +
      '</label>';
    }
  }
  html +=
      '<button class="btn btn-p btn-full" style="margin-top:14px;justify-content:center" onclick="yeniGrupOlustur()">Oluştur</button>' +
    '</div>';
  return html;
}

function yeniGrupOlustur() {
  var userKey  = APP.ui.curUserKey || 'm';
  var adiEl    = document.getElementById('yeni-grup-adi');
  var grupAdi  = adiEl ? adiEl.value.trim() : '';
  if (!grupAdi) { notif('Grup adı boş olamaz', 'amber'); return; }
  var checkboxes = document.querySelectorAll('#myeni-liste .yeni-chk:checked');
  if (checkboxes.length < 2) { notif('En az 2 üye seçin', 'amber'); return; }
  var katilimcilar = [userKey];
  for (var i = 0; i < checkboxes.length; i++) katilimcilar.push(checkboxes[i].value);
  var yeni = { id: 'c' + Date.now(), tip: 'grup', grupAdi: grupAdi, katilimcilar: katilimcilar, mesajlar: [] };
  APP.data.sohbetler.push(yeni);
  saveAppData();
  closeM('myeni');
  openSohbet(yeni.id);
}

function startYeniSohbet(hedefKey) {
  var userKey = APP.ui.curUserKey || 'm';
  var list    = APP.data.sohbetler || [];
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    if (s.tip === 'bireysel' &&
        s.katilimcilar.length === 2 &&
        s.katilimcilar.indexOf(userKey)  !== -1 &&
        s.katilimcilar.indexOf(hedefKey) !== -1) {
      closeM('myeni');
      openSohbet(s.id);
      return;
    }
  }
  var yeni = { id: 'c' + Date.now(), tip: 'bireysel', katilimcilar: [userKey, hedefKey], mesajlar: [] };
  APP.data.sohbetler.push(yeni);
  saveAppData();
  closeM('myeni');
  openSohbet(yeni.id);
}

// === Window Exposure (HTML onclick + muhasebe.js erişimi için) ===
window.renderSohbetListesi = renderSohbetListesi;
window.openSohbet = openSohbet;
window.closeSohbet = closeSohbet;
window.sohbetGonder = sohbetGonder;
window.openYeniSohbetModal = openYeniSohbetModal;
window.startYeniSohbet = startYeniSohbet;
window.yeniGrupOlustur = yeniGrupOlustur;
window._yeniTabSec = _yeniTabSec;
window.sicAutoResize = sicAutoResize;
window.sicKeydown = sicKeydown;
window.renderDeptMesaj = renderDeptMesaj;
window.renderSuMesaj = renderSuMesaj;
window._fmtSohbetZaman = _fmtSohbetZaman;
window._getSohbetAdi = _getSohbetAdi;
window._getSohbetOkunmamis = _getSohbetOkunmamis;
window._getSonMesaj = _getSonMesaj;
window._sohbetFiltre = _sohbetFiltre;
window._sohbetAvHtml = _sohbetAvHtml;
window._escHtml = _escHtml;
window._sohbetMarkRead = _sohbetMarkRead;
window._renderSohbetIci = _renderSohbetIci;
window._scrollSonaMesaj = _scrollSonaMesaj;
window._refreshSohbetListeler = _refreshSohbetListeler;
window._yeniSohbetAliciListe = _yeniSohbetAliciListe;
window._renderYeniSohbetTabs = _renderYeniSohbetTabs;
window._renderBireyselListe = _renderBireyselListe;
window._renderGrupForm = _renderGrupForm;
