// /modules/core/constants.js
// PRODAPP — Sabitler (modülerleşme Adım 1 — kopyalama, index.html orijinaller yerinde)

// ─── Kategoriler ───────────────────────────────────────────────────────────

export var KATEGORILER = [
  'Yakit', 'Yiyecek', 'Ekipman', 'Sanat', 'Ulasim',
  'Konaklama', 'Kiralama', 'Diger'
];

export var KAT_IC = {
  Yakit:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M3 22V6l9-4 9 4v16"/><path d="M10 22V12h4v10"/><path d="M3 9h18"/></svg>',
  Yiyecek: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>',
  def:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>'
};

export var SD_KAT_CLR = {
  Yakit:'var(--am)',  Yiyecek:'var(--gr)',  Ekipman:'var(--bl)',
  Sanat:'var(--ac)',  Ulasim:'var(--bl2)',  Diger:'var(--tx3)',
  Konaklama:'var(--bl)', Kiralama:'var(--am2)'
};

export var SD_KAT_LBL = {
  Yakit:'Yakıt', Yiyecek:'Yiyecek', Ekipman:'Ekipman',
  Sanat:'Sanat',  Ulasim:'Ulaşım',  Diger:'Diğer',
  Konaklama:'Konaklama', Kiralama:'Kiralama'
};

// Kategori varsayılan harcama limitleri (TL) — kullanıcı düzenleyebilir
export var KAT_LIMIT_DEFAULT = [
  { kat:'Yakit',     lbl:'Yakıt',     limit:5000,  clr:'var(--am)'  },
  { kat:'Yiyecek',   lbl:'Yiyecek',   limit:4000,  clr:'var(--gr)'  },
  { kat:'Ekipman',   lbl:'Ekipman',   limit:14000, clr:'var(--bl)'  },
  { kat:'Sanat',     lbl:'Sanat',     limit:4000,  clr:'var(--ac)'  },
  { kat:'Ulasim',    lbl:'Ulaşım',    limit:5000,  clr:'var(--bl2)' },
  { kat:'Konaklama', lbl:'Konaklama', limit:7000,  clr:'var(--bl)'  },
  { kat:'Kiralama',  lbl:'Kiralama',  limit:10000, clr:'var(--am2)' },
  { kat:'Diger',     lbl:'Diğer',     limit:2000,  clr:'var(--tx3)' }
];

// ─── Durum sabitleri ────────────────────────────────────────────────────────

export var FIS_DURUM = {
  DEPT_BEKLEYEN: 'dept-bekleyen',
  ACC_BEKLEYEN:  'acc-bekleyen',
  ONAYLANDI:     'onaylandi',
  REDDEDILDI:    'reddedildi',
  BOLUNDU:       'bolundu'
};

// Durum → CSS renk (dot indicator)
export var DOT = {
  bekleyen:        'var(--am)',
  'dept-bekleyen': 'var(--am)',
  'acc-bekleyen':  'var(--am)',
  onaylandi:       'var(--gr)',
  reddedildi:      'var(--rd)'
};

// ─── Roller ─────────────────────────────────────────────────────────────────

export var ROL = {
  SAHA:      'user',
  DEPT:      'dept',
  MUHASEBE:  'acc'
};

// ─── UI sabitleri ────────────────────────────────────────────────────────────

export var DYN_PANEL_IDS = ['ul-panel', 'ym-panel', 'ko-panel', 'ki-panel'];

export var DEPT_MAP = {
  yapim:  'Yapım',
  kamera: 'Kamera',
  sanat:  'Sanat',
  ses:    'Ses & Müzik',
  kostum: 'Kostüm & Makyaj',
  diger:  'Diğer'
};

export var DEPT_KEYS = ['yapim', 'kamera', 'sanat', 'ses', 'kostum', 'diger'];

// ─── Ulaşım limitleri (₺/km) ─────────────────────────────────────────────

export var UL_SEHIRICI_RATE  = 15;
export var UL_SEHIRDISI_RATE = 25;

// ─── Pasif onay süresi ──────────────────────────────────────────────────────

export var PASIF_ONAY_GUN = 7;                            // gün
export var PASIF_ONAY_MS  = 7 * 24 * 60 * 60 * 1000;    // milisaniye

// ─── Onboarding ─────────────────────────────────────────────────────────────

export var ONB_SVG = {
  Camera:          '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  CalendarDays:    '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><line x1="8" x2="8.01" y1="14" y2="14"/><line x1="12" x2="12.01" y1="14" y2="14"/><line x1="8" x2="8.01" y1="18" y2="18"/><line x1="12" x2="12.01" y1="18" y2="18"/>',
  MessageCircle:   '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  CheckSquare:     '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  BarChart3:       '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  Package:         '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/>',
  LayoutDashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  ClipboardCheck:  '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  FileSpreadsheet: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>'
};

export var ONB_DATA = {
  user: [
    { icon:'Camera',          title:'Fiş Ekle',        desc:'Kamera ile fotoğraf çekin, galeriden seçin veya belgesiz harcama girin.' },
    { icon:'CalendarDays',    title:'Dönem Takibi',    desc:'Fişlerinizin onay durumunu ve avans talebinizi buradan takip edin.' },
    { icon:'MessageCircle',   title:'Mesajlar',        desc:'Departman şefiniz ve muhasebe ile iletişim kurun.' }
  ],
  dept: [
    { icon:'CheckSquare',     title:'Onay Kutusu',     desc:'Ekibinizden gelen fişleri tek tek veya toplu olarak onaylayın, reddedin.' },
    { icon:'BarChart3',       title:'Dönem Yönetimi',  desc:'Bütçe durumunu takip edin, dönemi kapatın.' },
    { icon:'Package',         title:'Kiralama Takibi', desc:'Ekipman kiralamalarını, gecikmeleri ve cezaları görüntüleyin.' }
  ],
  acc: [
    { icon:'LayoutDashboard', title:'Dashboard',       desc:'Departman kartları, harcama özeti ve şüpheli işlemleri görün.' },
    { icon:'ClipboardCheck',  title:'Kesin Onay',      desc:'Departmanlardan gelen fişleri inceleyip son kararı verin.' },
    { icon:'FileSpreadsheet', title:'Raporlar',        desc:'Personel ve departman raporlarına ulaşın, dışa aktarın.' }
  ]
};
