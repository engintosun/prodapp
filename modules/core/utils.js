// /modules/core/utils.js
// PRODAPP — Yardımcı Fonksiyonlar (modülerleşme Adım 2 — kopyalama, silme yok)
// Rol-spesifik (saha/dept/muhasebe) render fonksiyonları bu dosyada YOK.

import { APP } from './state.js';

// ─── Türkçe karakter dönüşümü ───────────────────────────────────────────────

export function _tr(s) {
  return String(s)
    .replace(/ş/g,'s').replace(/Ş/g,'S')
    .replace(/ı/g,'i').replace(/İ/g,'I')
    .replace(/ğ/g,'g').replace(/Ğ/g,'G')
    .replace(/ü/g,'u').replace(/Ü/g,'U')
    .replace(/ö/g,'o').replace(/Ö/g,'O')
    .replace(/ç/g,'c').replace(/Ç/g,'C');
}

// ─── Sayı / tarih yardımcıları ───────────────────────────────────────────────

export function _pad(n) {
  return n < 10 ? '0' + n : String(n);
}

// Bugünü Date objesi olarak döndür (gün başı, 00:00:00)
export function _today() {
  var d = new Date();
  return new Date(d.getFullYear() + '-' + _pad(d.getMonth()+1) + '-' + _pad(d.getDate()) + 'T00:00:00');
}

// Bugünü ISO string olarak döndür (YYYY-MM-DD)
export function _todayISO() {
  var d = new Date();
  return d.getFullYear() + '-' +
    ('0' + (d.getMonth()+1)).slice(-2) + '-' +
    ('0' + d.getDate()).slice(-2);
}

// İki ISO tarih arasındaki gün farkı (b - a); negatif = b geçmişte
export function _gunFarki(a, b) {
  var ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / 86400000);
}

// Dept kısa tarih formatı: "DD.MM"
export function _deptTarih() {
  var d = new Date();
  return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth()+1)).slice(-2);
}

// Kira ISO tarihini okunabilir formata çevir: "2026-04-15" → "15 Nis 2026"
export function _formatKiraTarih(dateStr) {
  var aylar = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var p = (dateStr || '').split('-');
  if (p.length < 3) return dateStr;
  return parseInt(p[2]) + ' ' + (aylar[parseInt(p[1])-1] || p[1]) + ' ' + p[0];
}

// Log timestamp: ms → "DD.MM HH:MM"
export function _fmtLogZaman(ts) {
  var d = new Date(ts);
  return _pad(d.getDate()) + '.' + _pad(d.getMonth()+1) + ' ' + _pad(d.getHours()) + ':' + _pad(d.getMinutes());
}

// ─── APP log kaydı ───────────────────────────────────────────────────────────

export function _mkLog(aksiyon, detay) {
  var u = APP.ui.curUser;
  var rolMap = { user:'saha', dept:'dept', acc:'muhasebe' };
  return {
    zaman:   Date.now(),
    aksiyon: aksiyon,
    kisi:    u ? u.name : 'Bilinmeyen',
    rol:     u ? (rolMap[u.role] || u.role) : 'bilinmeyen',
    detay:   detay || ''
  };
}

// ─── Proje adı ───────────────────────────────────────────────────────────────

export function _projName(id) {
  if (APP.data.projNames && APP.data.projNames[id]) return APP.data.projNames[id];
  var p = APP.seed.projs.find(function(x) { return x.id === id; });
  return p ? p.name : id;
}

// ─── Avatar DOM yardımcısı ───────────────────────────────────────────────────

export function _setAvEl(el, user, userKey) {
  if (!el) return;
  var av = (userKey && APP.data.avatars) ? APP.data.avatars[userKey] : null;
  if (av) {
    el.innerHTML = '<img src="' + av + '" alt="">';
  } else {
    el.innerHTML = '';
    el.textContent = user ? (user.ini || '') : '';
  }
}

// ─── Kiralama ────────────────────────────────────────────────────────────────

// Kiralama durumu: 'iade' | 'gec' | 'yak' | 'ak'
export function _kiraDurum(k) {
  if (k.iade) return 'iade';
  var today = _todayISO();
  var fark  = _gunFarki(today, k.bit);
  if (fark < 0)  return 'gec';
  if (fark <= 2) return 'yak';
  return 'ak';
}

// Kiralama gecikme cezası: { gecGun, ceza }
// İade sonrası kaydedilmiş değeri döndürür; aktif gecikme için anlık hesaplar.
export function _kiraCeza(k) {
  if (k.iade) return { gecGun: k.cezaGun || 0, ceza: k.cezaTutar || 0 };
  if (_kiraDurum(k) !== 'gec') return { gecGun: 0, ceza: 0 };
  var gecGun = Math.abs(_gunFarki(_todayISO(), k.bit));
  return { gecGun: gecGun, ceza: gecGun * k.gunluk };
}

// ─── SVG Donut grafik ────────────────────────────────────────────────────────

// items: [{ tutar: number, renk: string }], size: number (px)
export function _svgDonut(items, size) {
  var total = 0;
  for (var i = 0; i < items.length; i++) total += items[i].tutar;
  if (!total) return '';
  var cx = size / 2, cy = size / 2;
  var ro = size * 0.40, ri = size * 0.24;
  var paths = '';
  var angle = -Math.PI / 2;
  for (var j = 0; j < items.length; j++) {
    var it    = items[j];
    var theta = it.tutar / total * 2 * Math.PI;
    if (theta < 0.005) continue;
    var end = angle + theta;
    var x1o = cx + ro * Math.cos(angle), y1o = cy + ro * Math.sin(angle);
    var x2o = cx + ro * Math.cos(end),   y2o = cy + ro * Math.sin(end);
    var x1i = cx + ri * Math.cos(end),   y1i = cy + ri * Math.sin(end);
    var x2i = cx + ri * Math.cos(angle), y2i = cy + ri * Math.sin(angle);
    var laf  = theta > Math.PI ? 1 : 0;
    paths += '<path d="M ' + x1o.toFixed(1) + ' ' + y1o.toFixed(1) +
      ' A ' + ro + ' ' + ro + ' 0 ' + laf + ' 1 ' + x2o.toFixed(1) + ' ' + y2o.toFixed(1) +
      ' L ' + x1i.toFixed(1) + ' ' + y1i.toFixed(1) +
      ' A ' + ri + ' ' + ri + ' 0 ' + laf + ' 0 ' + x2i.toFixed(1) + ' ' + y2i.toFixed(1) +
      ' Z" fill="' + it.renk + '" stroke="var(--bg)" stroke-width="1.5"/>';
    angle = end;
  }
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="display:block;flex-shrink:0">' +
    paths + '</svg>';
}
