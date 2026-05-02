// /modules/shared/export.js
// PRODAPP — PDF / Excel / CSV Export Modülü (Adım 4 — kopyalama, index.html orijinaller yerinde)
//
// Bağımlılıklar (CDN / window globals):
//   window.jspdf, window.XLSX, window.html2canvas
//
// index.html'de exportManager `const` + arrow fn + template literal kullanıyor;
// ES6 modül olduğu için bu stil korundu (dönüştürme yapılmadı).

import { APP }                  from '../core/state.js';
import { _computeRaporPersonel } from '../core/services/report.service.js';

/* ═══ EXPORT MANAGER ═══ */

export const exportManager = {
  _getFileName(tip, ext) {
    const now = new Date();
    const tarih = now.toISOString().slice(0, 10);
    return `PRODAPP_${tip}_${tarih}.${ext}`;
  },

  _tr(str) {
    return String(str)
      .replace(/ş/g,'s').replace(/Ş/g,'S')
      .replace(/ı/g,'i').replace(/İ/g,'I')
      .replace(/ğ/g,'g').replace(/Ğ/g,'G')
      .replace(/ü/g,'u').replace(/Ü/g,'U')
      .replace(/ö/g,'o').replace(/Ö/g,'O')
      .replace(/ç/g,'c').replace(/Ç/g,'C');
  },

  _getBrandHeader() {
    return {
      sirket : (APP.data.companyInfo?.name || 'Prodüksiyon'),
      logo   : (APP.data.companyInfo?.logo || null),
      proje  : (() => {
        const pid = APP.state?.aktivProje || APP.state?.projId || null;
        if (!pid) return '';
        return APP.data.projNames?.[pid] || pid;
      })()
    };
  },

  csv(tip) {
    const brand = this._getBrandHeader();
    const now   = new Date().toLocaleDateString('tr-TR');
    let rows = [];

    if (tip === 'saha') {
      const user   = (APP.ui.curUser && APP.ui.curUser.name) || APP.ui.curUser;
      const don    = APP.ui.aktifDon || 1;
      const fisler = (APP.data.fisler || []).filter(f =>
        f.personel === user && String(f.donem) === String(don)
      );
      rows.push(['Tarih','Kategori','Tutar (TL)','Durum','Açıklama']);
      fisler.forEach(f => rows.push([
        f.tarih || '', f.kat || '',
        Number(f.tutar || 0).toFixed(2), f.durum || '', f.aciklama || ''
      ]));

    } else if (tip === 'acc-personel') {
      const data = _computeRaporPersonel();
      rows.push(['Personel','Departman','Toplam (TL)','Onaylı (TL)','Bekleyen (TL)']);
      (data || []).forEach(p => rows.push([
        p.name || '', p.dept || '',
        Number(p.total || 0).toFixed(2),
        Number(p.onay  || 0).toFixed(2),
        Number(p.bek   || 0).toFixed(2)
      ]));

    } else if (tip === 'acc-dept') {
      const depts = APP.data.accDepts || [];
      rows.push(['Departman','Toplam (TL)','Onaylı (TL)','Bekleyen (TL)']);
      depts.forEach(d => rows.push([
        d.ad || '',
        Number(d.toplam   || 0).toFixed(2),
        Number(d.onay     || 0).toFixed(2),
        Number(d.bekleyen || 0).toFixed(2)
      ]));

    } else if (tip === 'acc-donem') {
      const fisler = APP.data.fisler || [];
      rows.push(['Dönem','Personel','Kategori','Tutar (TL)','Durum']);
      fisler.forEach(f => rows.push([
        f.donem || '', f.personel || '', f.kategori || '',
        Number(f.tutar || 0).toFixed(2), f.durum || ''
      ]));

    } else if (tip === 'dept-gecmis') {
      const donId = APP.ui.sdGecmisPnlDonem || APP.ui.sdSeciliDonem || 1;
      const gec   = (APP.data.deptGecmis && APP.data.deptGecmis[donId]) || { onaylandi: [], reddedildi: [] };
      const tumFisler = [
        ...gec.onaylandi.map(f => ({ ...f, durum: 'Onaylı' })),
        ...gec.reddedildi.map(f => ({ ...f, durum: 'Reddedildi' }))
      ];
      rows.push(['Tarih','Personel','Kategori','Tutar (TL)','Durum','Açıklama']);
      tumFisler.forEach(f => rows.push([
        f.tarih || '', f.personel || '', f.kategori || '',
        Number(f.tutar || 0).toFixed(2), f.durum || '', f.aciklama || ''
      ]));

    } else if (tip === 'dept-avans') {
      const tumAvans = [
        ...(APP.data.deptAvans || []),
        ...(APP.data.accAvansGecmis || []).filter(a => a.dept === APP.ui.curDept || true)
      ];
      rows.push(['Tarih','Üye','Tutar (TL)','Durum','Gerekçe']);
      tumAvans.forEach(a => rows.push([
        a.tarih || '', a.uye || '',
        Number(a.tutar || 0).toFixed(2), a.durum || 'Bekleyen', a.gerekce || ''
      ]));

    } else {
      rows.push(['Tarih','Personel','Kategori','Tutar (TL)','Durum']);
      (APP.data.fisler || []).forEach(f => rows.push([
        f.tarih || '', f.personel || '', f.kategori || '',
        Number(f.tutar || 0).toFixed(2), f.durum || ''
      ]));
    }

    const header = [
      [`${brand.sirket}${brand.proje ? ' — ' + brand.proje : ''}`],
      [`PRODAPP Raporu: ${tip}   Tarih: ${now}`],
      []
    ];
    const allRows = [...header, ...rows];
    const csv = allRows.map(r =>
      r.map(cell => {
        const s = String(cell).replace(/"/g, '""');
        return /[,"\n]/.test(s) ? `"${s}"` : s;
      }).join(',')
    ).join('\r\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = this._getFileName(tip, 'csv');
    a.click();
    URL.revokeObjectURL(url);
    closeExportModal();
  },

  excel(tip) {
    const brand = this._getBrandHeader();
    const now   = new Date().toLocaleDateString('tr-TR');
    let rows = [];
    let baslik = '';

    if (tip === 'saha') {
      baslik = 'Saha Harcamaları';
      const user   = (APP.ui.curUser && APP.ui.curUser.name) || APP.ui.curUser;
      const don    = APP.ui.aktifDon || 1;
      const fisler = (APP.data.fisler || []).filter(f =>
        f.personel === user && String(f.donem) === String(don)
      );
      rows.push(['Tarih','Kategori','Tutar (TL)','Durum','Açıklama']);
      fisler.forEach(f => rows.push([
        f.tarih || '', f.kat || '',
        Number(f.tutar || 0), f.durum || '', f.aciklama || ''
      ]));

    } else if (tip === 'acc-personel') {
      baslik = 'Personel Raporu';
      const data = _computeRaporPersonel();
      rows.push(['Personel','Departman','Toplam (TL)','Onaylı (TL)','Bekleyen (TL)']);
      (data || []).forEach(p => rows.push([
        p.name || '', p.dept || '',
        Number(p.total || 0), Number(p.onay || 0), Number(p.bek || 0)
      ]));

    } else if (tip === 'acc-dept') {
      baslik = 'Departman Raporu';
      const depts = APP.data.accDepts || [];
      rows.push(['Departman','Toplam (TL)','Onaylı (TL)','Bekleyen (TL)']);
      depts.forEach(d => rows.push([
        d.ad || '', Number(d.toplam || 0),
        Number(d.onay || 0), Number(d.bekleyen || 0)
      ]));

    } else if (tip === 'acc-donem') {
      baslik = 'Dönem Raporu';
      rows.push(['Dönem','Personel','Kategori','Tutar (TL)','Durum']);
      (APP.data.fisler || []).forEach(f => rows.push([
        f.donem || '', f.personel || '', f.kategori || '',
        Number(f.tutar || 0), f.durum || ''
      ]));

    } else if (tip === 'dept-gecmis') {
      baslik = 'Dept Gecmis';
      const donId = APP.ui.sdGecmisPnlDonem || APP.ui.sdSeciliDonem || 1;
      const gec   = (APP.data.deptGecmis && APP.data.deptGecmis[donId]) || { onaylandi: [], reddedildi: [] };
      const tumFisler = [
        ...gec.onaylandi.map(f => ({ ...f, durum: 'Onaylı' })),
        ...gec.reddedildi.map(f => ({ ...f, durum: 'Reddedildi' }))
      ];
      rows.push(['Tarih','Personel','Kategori','Tutar (TL)','Durum','Açıklama']);
      tumFisler.forEach(f => rows.push([
        f.tarih || '', f.personel || '', f.kategori || '',
        Number(f.tutar || 0), f.durum || '', f.aciklama || ''
      ]));

    } else if (tip === 'dept-avans') {
      baslik = 'Dept Avans';
      const tumAvans = [
        ...(APP.data.deptAvans || []),
        ...(APP.data.accAvansGecmis || []).filter(a => a.dept === APP.ui.curDept || true)
      ];
      rows.push(['Tarih','Üye','Tutar (TL)','Durum','Gerekçe']);
      tumAvans.forEach(a => rows.push([
        a.tarih || '', a.uye || '',
        Number(a.tutar || 0), a.durum || 'Bekleyen', a.gerekce || ''
      ]));

    } else {
      baslik = 'Tüm Harcamalar';
      rows.push(['Tarih','Personel','Kategori','Tutar (TL)','Durum']);
      (APP.data.fisler || []).forEach(f => rows.push([
        f.tarih || '', f.personel || '', f.kategori || '',
        Number(f.tutar || 0), f.durum || ''
      ]));
    }

    if (!window.XLSX) {
      alert('Excel kütüphanesi henüz yüklenmedi. Lütfen GitHub Pages üzerinden deneyin.');
      return;
    }
    const wb = window.XLSX.utils.book_new();
    const wsData = [
      [`${brand.sirket}${brand.proje ? ' — ' + brand.proje : ''}`],
      [`${baslik}   ${now}`],
      [],
      ...rows
    ];
    const ws = window.XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = rows[0] ? rows[0].map(() => ({ wch: 20 })) : [];
    window.XLSX.utils.book_append_sheet(wb, ws, baslik.slice(0, 31));
    window.XLSX.writeFile(wb, this._getFileName(tip, 'xlsx'));
    closeExportModal();
  },

  pdf(tip) {
    if (!window.jspdf) {
      alert('PDF kütüphanesi henüz yüklenmedi. Lütfen GitHub Pages üzerinden deneyin.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const brand = this._getBrandHeader();
    const now   = new Date().toLocaleDateString('tr-TR');
    const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W     = doc.internal.pageSize.getWidth();
    let y       = 15;

    doc.setFillColor(12, 10, 8);
    doc.rect(0, 0, W, 28, 'F');

    if (brand.logo) {
      try { doc.addImage(brand.logo, 'PNG', 10, 5, 18, 18); } catch(e) {}
    }

    doc.setTextColor(232, 150, 46);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(brand.sirket || 'Prodüksiyon', brand.logo ? 32 : 10, 13);
    if (brand.proje) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 190, 175);
      doc.text(brand.proje, brand.logo ? 32 : 10, 20);
    }

    doc.setFontSize(8);
    doc.setTextColor(200, 190, 175);
    doc.text(now, W - 10, 13, { align: 'right' });

    y = 36;

    const basliklar = {
      'saha'         : 'Saha Harcama Raporu',
      'acc-personel' : 'Personel Harcama Raporu',
      'acc-dept'     : 'Departman Raporu',
      'acc-donem'    : 'Dönem Raporu'
    };
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(basliklar[tip] || 'Harcama Raporu', 10, y);
    y += 10;

    let headers  = [];
    let dataRows = [];

    if (tip === 'saha') {
      const user   = (APP.ui.curUser && APP.ui.curUser.name) || APP.ui.curUser;
      const don    = APP.ui.aktifDon || 1;
      const fisler = (APP.data.fisler || []).filter(f =>
        f.personel === user && String(f.donem) === String(don)
      );
      headers  = [this._tr('Tarih'), this._tr('Kategori'), this._tr('Tutar (TL)'), this._tr('Durum')];
      dataRows = fisler.map(f => [
        this._tr(f.tarih || ''), this._tr(f.kat || ''),
        Number(f.tutar || 0).toFixed(2), this._tr(f.durum || '')
      ]);

    } else if (tip === 'acc-personel') {
      const data = _computeRaporPersonel();
      headers  = [this._tr('Personel'), this._tr('Departman'), this._tr('Toplam (TL)'), this._tr('Onaylı (TL)'), this._tr('Bekleyen (TL)')];
      dataRows = (data || []).map(p => [
        this._tr(p.name || ''), this._tr(p.dept || ''),
        Number(p.total || 0).toFixed(2),
        Number(p.onay  || 0).toFixed(2),
        Number(p.bek   || 0).toFixed(2)
      ]);

    } else if (tip === 'acc-dept') {
      headers  = [this._tr('Departman'), this._tr('Toplam (TL)'), this._tr('Onaylı'), this._tr('Bekleyen')];
      dataRows = (APP.data.accDepts || []).map(d => [
        this._tr(d.ad || ''), Number(d.toplam || 0).toFixed(2),
        Number(d.onay || 0).toFixed(2), Number(d.bekleyen || 0).toFixed(2)
      ]);

    } else if (tip === 'acc-donem') {
      headers  = [this._tr('Dönem'), this._tr('Personel'), this._tr('Kategori'), this._tr('Tutar (TL)'), this._tr('Durum')];
      dataRows = (APP.data.fisler || []).map(f => [
        this._tr(String(f.donem || '')), this._tr(f.personel || ''), this._tr(f.kategori || ''),
        Number(f.tutar || 0).toFixed(2), this._tr(f.durum || '')
      ]);

    } else if (tip === 'dept-gecmis') {
      const donId = APP.ui.sdGecmisPnlDonem || APP.ui.sdSeciliDonem || 1;
      const gec   = (APP.data.deptGecmis && APP.data.deptGecmis[donId]) || { onaylandi: [], reddedildi: [] };
      const tumFisler = [
        ...gec.onaylandi.map(f => ({ ...f, durum: 'Onayli' })),
        ...gec.reddedildi.map(f => ({ ...f, durum: 'Reddedildi' }))
      ];
      headers  = [this._tr('Tarih'), this._tr('Personel'), this._tr('Kategori'), this._tr('Tutar (TL)'), this._tr('Durum')];
      dataRows = tumFisler.map(f => [
        this._tr(f.tarih || ''), this._tr(f.personel || ''),
        this._tr(f.kategori || ''), Number(f.tutar || 0).toFixed(2),
        this._tr(f.durum || '')
      ]);

    } else if (tip === 'dept-avans') {
      const tumAvans = [
        ...(APP.data.deptAvans || []),
        ...(APP.data.accAvansGecmis || []).filter(a => a.dept === APP.ui.curDept || true)
      ];
      headers  = [this._tr('Tarih'), this._tr('Üye'), this._tr('Tutar (TL)'), this._tr('Durum'), this._tr('Gerekçe')];
      dataRows = tumAvans.map(a => [
        this._tr(a.tarih || ''), this._tr(a.uye || ''),
        Number(a.tutar || 0).toFixed(2),
        this._tr(a.durum || 'Bekleyen'), this._tr(a.gerekce || '')
      ]);
    }

    const colW = (W - 20) / (headers.length || 1);
    const rowH = 8;

    doc.setFillColor(232, 150, 46);
    doc.rect(10, y, W - 20, rowH, 'F');
    doc.setTextColor(12, 10, 8);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => doc.text(h, 12 + i * colW, y + 5.5));
    y += rowH;

    doc.setFont('helvetica', 'normal');
    dataRows.forEach((row, ri) => {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.setFillColor(
        ri % 2 === 0 ? 248 : 240,
        ri % 2 === 0 ? 246 : 238,
        ri % 2 === 0 ? 242 : 234
      );
      doc.rect(10, y, W - 20, rowH, 'F');
      doc.setTextColor(30, 30, 30);
      row.forEach((cell, i) => {
        const txt = String(cell).slice(0, 22);
        doc.text(txt, 12 + i * colW, y + 5.5);
      });
      y += rowH;
    });

    const fY = doc.internal.pageSize.getHeight() - 8;
    doc.setFillColor(12, 10, 8);
    doc.rect(0, fY - 4, W, 12, 'F');
    doc.setTextColor(232, 150, 46);
    doc.setFontSize(7);
    doc.text('Generated by PRODAPP  •  v8.x', W / 2, fY, { align: 'center' });

    doc.save(this._getFileName(tip, 'pdf'));
    closeExportModal();
  },

  png(elementId) {
    console.log('PNG export hazırlanıyor:', elementId);
  }
};

/* ═══ EXPORT MODAL ═══ */

export const exportModal = {
  _tip  : null,
  _elId : null
};

export function showExportModal(tip, elId) {
  if (elId === undefined) elId = null;
  exportModal._tip  = tip;
  exportModal._elId = elId;
  var dd  = document.getElementById('export-dropdown');
  var btn = window.event ? window.event.currentTarget : null;

  if (!btn) {
    dd.style.top       = '50%';
    dd.style.left      = '50%';
    dd.style.transform = 'translate(-50%, -50%)';
  } else {
    var rect = btn.getBoundingClientRect();
    var vh   = window.innerHeight;
    dd.style.transform = '';
    if (rect.top > vh * 0.6) {
      dd.style.top       = (rect.top - 10) + 'px';
      dd.style.left      = rect.left + 'px';
      dd.style.transform = 'translateY(-100%)';
    } else {
      dd.style.top  = (rect.bottom + 6) + 'px';
      dd.style.left = rect.left + 'px';
    }
  }
  dd.classList.add('on');

  setTimeout(function() {
    document.addEventListener('click', closeExportModalOnce, { once: true });
  }, 0);
}

export function closeExportModal() {
  document.getElementById('export-dropdown').classList.remove('on');
}

export function closeExportModalOnce(e) {
  var dd = document.getElementById('export-dropdown');
  if (dd && !dd.contains(e.target)) {
    closeExportModal();
  } else {
    document.addEventListener('click', closeExportModalOnce, { once: true });
  }
}

/* ─── window global uyumluluk (inline onclick) ──────────────────────────── */

window.exportManager       = exportManager;
window.exportModal         = exportModal;
window.showExportModal     = showExportModal;
window.closeExportModal    = closeExportModal;
window.closeExportModalOnce = closeExportModalOnce;
