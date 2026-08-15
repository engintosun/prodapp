-- KAAPA DILIM 1100-A (bolum 4): 1100 kutuphane tohumu - 9 baslik + 38 atom.
-- Baslik satirlari is_group=true; default_payment_status/default_unit_code NOT NULL
-- oldugu icin 'sirket'/'flat' yazilir ama baslik icin ASLA okunmaz.

insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code, is_group, provenance)
values
  -- BASLIKLAR
  ('1101', 'Hikâye, Senaryo, Haklar',               'Story & Screenplay',                   'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),
  ('1102', 'Yapımcı',                                 'Producers Unit',                       'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),
  ('1103', 'Yönetmen',                                'Directors Unit',                       'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),
  ('1104', 'Bütçe ve Dosya Hazırlama',                 'Budget & Pitch Package',               'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),
  ('1105', 'Ofis Genel Giderleri',                     'Development Office Overhead',          'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),
  ('1106', 'Hukuk ve Muhasebe',                        'Legal & Accounting',                   'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),
  ('1107', 'Araştırma ve Danışmanlık',                 'Research & Consultancy',               'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),
  ('1108', 'Seyahat, Konaklama, Yemek, Harcırah',      'Travel, Accommodation & Living',       'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),
  ('1190', 'Muhtelif',                                 'Miscellaneous',                        'sirket', 'flat', true,  'Koster/MMB + KAAPA damitim'),

  -- 1101 ATOMLARI
  ('1101-01', 'Hak Satın Alma',              'Story Rights Purchase',                 'telif_belgeli', 'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1101-02', 'Opsiyon',                      'Story Option',                          'telif_belgeli', 'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1101-03', 'Opsiyon Uzatması',             'Option Extension',                      'telif_belgeli', 'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1101-04', 'Yazım-Taslaklar',              'Screenplay Drafts',                     'telif_belgeli', 'piece', false, 'Koster/MMB + KAAPA damitim'),
  ('1101-05', 'Danışman-Editör',              'Story Consultant / Editor',             'smm',           'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1101-06', 'Sinopsis-Treatment',           'Synopsis & Treatment',                  'telif_belgeli', 'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1101-07', 'Script Report',                'Script Report / Reader Fee',            'smm',           'piece', false, 'Koster/MMB + KAAPA damitim'),

  -- 1102 ATOMLARI
  ('1102-01', 'Yapımcı Geliştirme Ücreti',    'Producer Development Fee',              'smm', 'flat', false, 'Koster/MMB + KAAPA damitim'),
  ('1102-02', 'Ortak / Yardımcı Yapımcı',     'Co-Producer / Associate Producer',      'smm', 'flat', false, 'Koster/MMB + KAAPA damitim'),

  -- 1103 ATOMLARI
  ('1103-01', 'Yönetmen Geliştirme Ücreti',   'Director Development / Attachment Fee', 'telif_belgeli', 'flat', false, 'Koster/MMB + KAAPA damitim'),

  -- 1104 ATOMLARI
  ('1104-01', 'Bütçeleme',                    'Budget Preparation',                    'smm', 'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1104-02', 'Sunum Dosyası',                'Pitch Deck / Presentation Package',     'smm', 'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1104-03', 'Görsel-Tasarım',               'Graphic Design',                        'smm', 'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1104-04', 'Çeviri-Tercüme',               'Translation',                           'smm', 'piece', false, 'Koster/MMB + KAAPA damitim'),
  ('1104-05', 'Teaser / Mood Video',          'Mood Reel / Sizzle Reel',               'smm', 'flat',  false, 'Koster/MMB + KAAPA damitim'),

  -- 1105 ATOMLARI
  ('1105-01', 'Ofis Kirası',                  'Office Rent',                           'kira_sahis', 'month', false, 'Koster/MMB + KAAPA damitim'),
  ('1105-02', 'Kırtasiye-Sarf',               'Office Supplies',                       'sirket',     'month', false, 'Koster/MMB + KAAPA damitim'),
  ('1105-03', 'İletişim',                     'Communications',                        'sirket',     'month', false, 'Koster/MMB + KAAPA damitim'),
  ('1105-04', 'Kargo-Kurye',                  'Shipping & Courier',                    'sirket',     'month', false, 'Koster/MMB + KAAPA damitim'),
  ('1105-05', 'Yazılım-Abonelik',             'Software Subscriptions',                'sirket',     'month', false, 'Koster/MMB + KAAPA damitim'),
  ('1105-06', 'Sekretarya / İdari Destek',    'Secretarial / Administrative Support',  'bordro',     'month', false, 'Koster/MMB + KAAPA damitim'),

  -- 1106 ATOMLARI
  ('1106-01', 'Avukatlık-Sözleşme',           'Legal Fees / Contracts',                'smm',          'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1106-02', 'Clearance-İzin',               'Clearances & Permissions',              'sirket',       'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1106-03', 'Mali Müşavir',                 'Accounting Fees',                       'smm',          'month', false, 'Koster/MMB + KAAPA damitim'),
  ('1106-04', 'Fon Raporlama-Denetim',        'Fund Reporting & Audit',                'smm',          'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1106-05', 'Noter ve Resmî Harçlar',       'Notary & Statutory Fees',               'resmi_odeme',  'flat',  false, 'Koster/MMB + KAAPA damitim'),

  -- 1107 ATOMLARI
  ('1107-01', 'Saha-Konu Araştırması',        'Subject / Field Research',              'smm',           'flat',  false, 'Koster/MMB + KAAPA damitim'),
  ('1107-02', 'Uzman Danışman',               'Expert Consultant',                     'smm',           'day',   false, 'Koster/MMB + KAAPA damitim'),
  ('1107-03', 'Arşiv-Kaynak-Telif',           'Archive & Source Licensing',            'telif_belgeli', 'piece', false, 'Koster/MMB + KAAPA damitim'),
  ('1107-04', 'Lokasyon Keşfi',               'Location Scouting',                     'sirket',        'day',   false, 'Koster/MMB + KAAPA damitim'),

  -- 1108 ATOMLARI
  ('1108-01', 'Ulaşım-Uçak',                  'Air Travel',                            'sirket',     'piece', false, 'Koster/MMB + KAAPA damitim'),
  ('1108-02', 'Konaklama',                    'Hotels / Accommodation',                'konaklama',  'day',   false, 'Koster/MMB + KAAPA damitim'),
  ('1108-03', 'Yemek-Ağırlama',               'Catering & Hospitality',                'sirket',     'day',   false, 'Koster/MMB + KAAPA damitim'),
  ('1108-04', 'Harcırah',                     'Per Diem',                              'sirket',     'day',   false, 'Koster/MMB + KAAPA damitim'),
  ('1108-05', 'Festival-Pazar Katılımı',      'Festival & Market Attendance',          'sirket',     'piece', false, 'Koster/MMB + KAAPA damitim'),
  ('1108-06', 'Araç Kiralama',                'Car Rentals',                           'sirket',     'day',   false, 'Koster/MMB + KAAPA damitim'),

  -- 1190 ATOMLARI
  ('1190-01', 'Banka-Havale-Kur',             'Bank & Transfer Charges',               'sirket', 'flat', false, 'Koster/MMB + KAAPA damitim'),
  ('1190-02', 'Beklenmedik Küçük Giderler',   'Sundry Expenses',                       'sirket', 'flat', false, 'Koster/MMB + KAAPA damitim');

do $seed_check$
begin
  if (select count(*) from public.item_library where catalog_code like '11%') <> 47 then
    raise exception 'D1100A tohum: 1100 araliginda 47 satir beklenirdi, sayim uymuyor';
  end if;
end $seed_check$;
