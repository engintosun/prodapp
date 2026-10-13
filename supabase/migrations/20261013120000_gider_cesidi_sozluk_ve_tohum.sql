-- GIDER CESIDI EKSENI, sema ve tohum dilimi (Engin karari, 6 ve 13 Ekim 2026).
-- Karar evi: docs/butce/BUTCE-SEMA-KARARLARI.md GIDER CESIDI EKSENI, KARARLAR madde 1-10;
-- aileler: docs/butce/KART-KATALOGU.md 7.1, 7.2, 7.4, 7.5; calisma belgesi
-- docs/butce/GIDER-CESIDI-ANALIZI.md bolum 10.
-- Ingilizce adlar (13 Ekim 2026, Engin kabul): gider yeri = kart (cost center),
-- gider cesidi = cost_element, maliyet tasiyici = cost_object (canli).
-- 1) Doga tablosu (10 satir) ve sozluk (15 ust, 69 alt); herkese salt okunur.
-- 2) item_library ve budget_items'a cost_element_id; kutuphane bekcisi.
-- 3) 31 yeni kutuphane kalemi (1105-07..09, 1310 ve 1507 ofis aileleri, 1610 ve 1619 parcalari);
--    1310 ve 1507 paket satiri: birim ay, es adlar.
-- 4) Kutuphaneye cesit atamasi (131 kalem).
-- 5) fn_open_budget ve fn_add_budget_item cesidi kopyalar (imzalar ayni; serbest kalem cesitsiz).
-- 6) Film sablonu v8: 1600'de 1610 ve 1619 yerine alti parca satiri.
-- 7) Muhursuz butcelerde kutuphaneden dogmus satirlar cesidini alir (KARARLAR madde 1, sinif
--    duzelten goc kurali); trg_log_items doldurma suresince kapali (emsal 20260819120000).
-- Fise dokunmaz; butce ekraninda degisiklik yok.

-- 1) Doga
create table public.cost_element_natures (
  code       text primary key,
  name       text not null unique,
  sort_order int  not null
);
comment on table public.cost_element_natures is
  'GIDER CESIDI (13 Ekim 2026): alt cesidin tek isareti, alisverisin turu. Kartlar ustu toplamlar (toplam kiralama, toplam iscilik) buradan alinir. Kuresel, salt okunur.';

insert into public.cost_element_natures (code, name, sort_order) values
  ('labor',             'İşçilik',              1),
  ('allowance',         'Ödenek',               2),
  ('rental',            'Kiralama',             3),
  ('purchase',          'Satın Alma',           4),
  ('fabrication',       'İmalat',               5),
  ('service',           'Hizmet',               6),
  ('rights',            'Hak',                  7),
  ('fees_taxes',        'Harç ve Vergi',        8),
  ('finance_insurance', 'Finansman ve Sigorta', 9),
  ('other',             'Diğer',               10);

-- 1b) Sozluk: iki kademe. Ust cesidin dogasi yok, alt cesidin dogasi zorunlu.
create table public.cost_elements (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references public.cost_elements(id),
  name        text not null unique,
  nature_code text references public.cost_element_natures(code),
  description text,
  sort_order  int  not null,
  constraint cost_elements_level_check check ((parent_id is null) = (nature_code is null))
);
comment on table public.cost_elements is
  'GIDER CESIDI SOZLUGU (6 ve 13 Ekim 2026): paranin neyin karsiligi oldugu. Tek, kuresel, kapali; rate_catalog ve item_library gibi herkese salt okunur, yalniz gocle degisir. Kalem yalniz alt cesit tasir; baslik cesit tasimaz.';
comment on column public.cost_elements.description is
  'Kapsam notu (13 Ekim 2026): parantez icleri ve kapsam aciklamalari buraya yazilir.';

alter table public.cost_element_natures enable row level security;
alter table public.cost_elements enable row level security;
create policy sel_cost_element_natures on public.cost_element_natures for select to authenticated using (true);
create policy sel_cost_elements on public.cost_elements for select to authenticated using (true);
grant select on table public.cost_element_natures to authenticated;
grant select on table public.cost_elements to authenticated;
grant all on table public.cost_element_natures to service_role;
grant all on table public.cost_elements to service_role;

-- Ust cesitler (15)
insert into public.cost_elements (name, sort_order)
select t.name, t.ord
  from (values
    ('Ücret ve Kaşe', 1), ('Haklar ve Lisanslar', 2), ('Seyahat ve Konaklama', 3),
    ('Yemek ve İkram', 4), ('Araç ve Nakliye', 5), ('Mekân', 6), ('Ekipman', 7),
    ('Malzeme ve İmalat', 8), ('Hizmet Alımı', 9), ('Ofis ve İdari', 10),
    ('Vergi, Harç ve Resmî Ödemeler', 11), ('Finansman ve Sigorta', 12),
    ('Tanıtım, Festival ve Dağıtım', 13), ('Hayvan', 14), ('Diğer', 15)
  ) as t(name, ord);

-- Alt cesitler (69): ust, ad, doga, sira, aciklama
insert into public.cost_elements (parent_id, name, nature_code, sort_order, description)
select p.id, t.name, t.nature, t.ord, t.descr
  from (values
    ('Ücret ve Kaşe', 'Personel Ücreti', 'labor', 1, null),
    ('Ücret ve Kaşe', 'Fazla Mesai', 'labor', 2, null),
    ('Ücret ve Kaşe', 'Temsilci ve Ajans Komisyonu', 'labor', 3, null),
    ('Ücret ve Kaşe', 'Ödenek ve Kit Kirası', 'allowance', 4, null),
    ('Haklar ve Lisanslar', 'Hak Satın Alma', 'rights', 1, null),
    ('Haklar ve Lisanslar', 'Opsiyon ve Uzatma', 'rights', 2, null),
    ('Haklar ve Lisanslar', 'Hak Devri', 'rights', 3, null),
    ('Haklar ve Lisanslar', 'Tekrar Kullanım Payı', 'rights', 4, null),
    ('Haklar ve Lisanslar', 'Müzik Lisansı', 'rights', 5, null),
    ('Haklar ve Lisanslar', 'Arşiv ve Görüntü Lisansı', 'rights', 6, null),
    ('Seyahat ve Konaklama', 'Ulaşım Bileti', 'service', 1, null),
    ('Seyahat ve Konaklama', 'Konaklama', 'service', 2, null),
    ('Seyahat ve Konaklama', 'Harcırah', 'allowance', 3, null),
    ('Seyahat ve Konaklama', 'Yolculuk Aracı Kiralama', 'rental', 4, null),
    ('Seyahat ve Konaklama', 'Yolculukta Yemek ve Ağırlama', 'service', 5, null),
    ('Seyahat ve Konaklama', 'Vize ve Pasaport', 'fees_taxes', 6, null),
    ('Yemek ve İkram', 'Set Yemeği', 'service', 1, null),
    ('Yemek ve İkram', 'Ara Öğün ve İkram', 'purchase', 2, null),
    ('Yemek ve İkram', 'Mesai Yemeği', 'service', 3, null),
    ('Yemek ve İkram', 'Ağırlama ve Temsil', 'service', 4, null),
    ('Araç ve Nakliye', 'Yapım Aracı Kiralama', 'rental', 1, null),
    ('Araç ve Nakliye', 'Oyun Aracı Kiralama', 'rental', 2, null),
    ('Araç ve Nakliye', 'Yakıt', 'purchase', 3, null),
    ('Araç ve Nakliye', 'Yol, Köprü, Otopark', 'service', 4, null),
    ('Araç ve Nakliye', 'Taksi ve Transfer', 'service', 5, null),
    ('Araç ve Nakliye', 'Nakliye, Kargo, Kurye', 'service', 6, null),
    ('Araç ve Nakliye', 'Araç Bakım-Onarım', 'service', 7, null),
    ('Mekân', 'Lokasyon Kirası', 'rental', 1, null),
    ('Mekân', 'Stüdyo ve Plato Kirası', 'rental', 2, null),
    ('Mekân', 'Ofis Kirası', 'rental', 3, null),
    ('Mekân', 'Depo ve Atölye Kirası', 'rental', 4, null),
    ('Mekân', 'Mekân Giderleri', 'service', 5, 'Mekânın kira dışı giderleri: aidat, elektrik, su, doğalgaz, ısınma (kapsam Lokasyon kartı kurulurken kesinleşir).'),
    ('Ekipman', 'Ekipman Kiralama', 'rental', 1, null),
    ('Ekipman', 'Ekipman Satın Alma', 'purchase', 2, null),
    ('Ekipman', 'Ekipman Bakım-Onarım', 'service', 3, null),
    ('Ekipman', 'Kayıt ve Depolama Medyası', 'purchase', 4, null),
    ('Malzeme ve İmalat', 'Malzeme Satın Alma', 'purchase', 1, null),
    ('Malzeme ve İmalat', 'Malzeme Kiralama', 'rental', 2, null),
    ('Malzeme ve İmalat', 'İmalat ve Atölye İşi', 'fabrication', 3, null),
    ('Malzeme ve İmalat', 'Sarf Malzeme', 'purchase', 4, null),
    ('Hizmet Alımı', 'Hukuk ve Clearance', 'service', 1, null),
    ('Hizmet Alımı', 'Mali Müşavirlik ve Denetim', 'service', 2, null),
    ('Hizmet Alımı', 'Danışmanlık ve Uzmanlık', 'service', 3, null),
    ('Hizmet Alımı', 'Teknik Hizmet', 'service', 4, 'Post, lab, VFX ve çekimde dışarıdan alınan teknik hizmet.'),
    ('Hizmet Alımı', 'Çeviri ve Altyazı', 'service', 5, null),
    ('Hizmet Alımı', 'Tasarım ve Grafik', 'service', 6, null),
    ('Hizmet Alımı', 'Güvenlik', 'service', 7, null),
    ('Hizmet Alımı', 'Sağlık ve Medik', 'service', 8, null),
    ('Hizmet Alımı', 'Cast Hizmeti', 'service', 9, 'Dışarıdan alınan cast hizmeti: cast ajansının hizmet bedeli, arkaplan oyuncusu castingi, dışarıya paket verilen deneme çekimi ve cast süreci.'),
    ('Ofis ve İdari', 'Kırtasiye ve Ofis Sarfı', 'purchase', 1, null),
    ('Ofis ve İdari', 'İletişim', 'service', 2, null),
    ('Ofis ve İdari', 'Yazılım ve Abonelik', 'service', 3, null),
    ('Ofis ve İdari', 'Basım ve Çoğaltma', 'service', 4, null),
    ('Vergi, Harç ve Resmî Ödemeler', 'Noter ve Resmî Harçlar', 'fees_taxes', 1, null),
    ('Vergi, Harç ve Resmî Ödemeler', 'Çekim İzni ve Belediye Harçları', 'fees_taxes', 2, null),
    ('Vergi, Harç ve Resmî Ödemeler', 'Gümrük ve Karnet', 'fees_taxes', 3, null),
    ('Vergi, Harç ve Resmî Ödemeler', 'Damga Vergisi', 'fees_taxes', 4, null),
    ('Finansman ve Sigorta', 'Sigorta Primi', 'finance_insurance', 1, null),
    ('Finansman ve Sigorta', 'Banka, Havale ve Kur Masrafı', 'finance_insurance', 2, null),
    ('Finansman ve Sigorta', 'Faiz ve Finansman Gideri', 'finance_insurance', 3, null),
    ('Finansman ve Sigorta', 'Kayıp ve Hasar', 'finance_insurance', 4, null),
    ('Tanıtım, Festival ve Dağıtım', 'Festival, Market ve Lab Katılımı', 'service', 1, null),
    ('Tanıtım, Festival ve Dağıtım', 'Tanıtım Materyali', 'service', 2, null),
    ('Tanıtım, Festival ve Dağıtım', 'Reklam ve Medya Alımı', 'service', 3, null),
    ('Tanıtım, Festival ve Dağıtım', 'PR ve Basın', 'service', 4, null),
    ('Tanıtım, Festival ve Dağıtım', 'Gösterim ve Kopya', 'service', 5, null),
    ('Hayvan', 'Hayvan Kiralama', 'rental', 1, null),
    ('Hayvan', 'Hayvan Satın Alma', 'purchase', 2, null),
    ('Diğer', 'Beklenmedik Küçük Giderler', 'other', 1, null)
  ) as t(parent, name, nature, ord, descr)
  join public.cost_elements p on p.name = t.parent and p.parent_id is null;

-- 2) Alanlar ve kutuphane bekcisi
alter table public.item_library
  add column cost_element_id uuid references public.cost_elements(id);
comment on column public.item_library.cost_element_id is
  'GIDER CESIDI (13 Ekim 2026): kalemin alt cesidi. Baslik satiri cesit tasimaz; baslik olmayan her kalem tasir (kutuphane_cesit_check).';
alter table public.budget_items
  add column cost_element_id uuid references public.cost_elements(id);
comment on column public.budget_items.cost_element_id is
  'GIDER CESIDI (13 Ekim 2026): kalem butceye eklenince kutuphaneden kopyalanir (catalog_code ve heading_code emsali); serbest kalem cesitsiz doger (null); muhurlu butcede trg_guard_lock_items ile donar.';

create or replace function public.fn_item_library_cost_element_check()
returns trigger
language plpgsql
set search_path = public
as $cefn$
begin
  if new.cost_element_id is null then
    return new;
  end if;
  if new.is_group then
    raise exception 'Başlık satırı gider çeşidi taşımaz: %', new.catalog_code;
  end if;
  if exists (select 1 from cost_elements e where e.id = new.cost_element_id and e.parent_id is null) then
    raise exception 'Kaleme yalnız alt çeşit atanır: %', new.catalog_code;
  end if;
  return new;
end;
$cefn$;

create trigger trg_item_library_cost_element_check
  before insert or update of cost_element_id, is_group on public.item_library
  for each row execute function public.fn_item_library_cost_element_check();

-- 3) Yeni kalemler (31). Ofis aileleri 1105 kardesleriyle ayni ad, birim, statu ve kaynak;
--    1610 ve 1619 parcalari Cast Operasyonu basliginin (1600-04) altinda. Ingilizce ad yalniz
--    kaynagi olan satirda (13 Ekim 2026, Engin kabul); kaynaksizlar bos.
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, card_code, aliases)
select t.code, t.name, t.name_en, t.status, t.unit, t.prov, false, false, false,
       (select h.id from public.item_library h where h.catalog_code = t.heading and h.is_group),
       t.card, '{}'
  from (values
    ('1105-07', 'Ofis Aidat ve Faturaları', 'Utility Costs',                'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1100', '1105'),
    ('1105-08', 'Ofis Donanım Kirası',      'Furniture/Equipment Rental',   'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1100', '1105'),
    ('1105-09', 'Ofis Donanım Alımı',       'Furniture/Equipment Purchase', 'sirket',     'flat',  'Koster/MMB + KAAPA damitim', '1100', '1105'),
    ('1310-01', 'Ofis Kirası',              'Office Rent',                  'kira_sahis', 'month', 'Koster/MMB + KAAPA damitim', '1300', null),
    ('1310-02', 'Kırtasiye-Sarf',           'Office Supplies',              'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1300', null),
    ('1310-03', 'İletişim',                 'Communications',               'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1300', null),
    ('1310-04', 'Kargo-Kurye',              'Shipping & Courier',           'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1300', null),
    ('1310-05', 'Yazılım-Abonelik',         'Software Subscriptions',       'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1300', null),
    ('1310-07', 'Ofis Aidat ve Faturaları', 'Utility Costs',                'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1300', null),
    ('1310-08', 'Ofis Donanım Kirası',      'Furniture/Equipment Rental',   'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1300', null),
    ('1310-09', 'Ofis Donanım Alımı',       'Furniture/Equipment Purchase', 'sirket',     'flat',  'Koster/MMB + KAAPA damitim', '1300', null),
    ('1507-01', 'Ofis Kirası',              'Office Rent',                  'kira_sahis', 'month', 'Koster/MMB + KAAPA damitim', '1500', null),
    ('1507-02', 'Kırtasiye-Sarf',           'Office Supplies',              'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1500', null),
    ('1507-03', 'İletişim',                 'Communications',               'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1500', null),
    ('1507-04', 'Kargo-Kurye',              'Shipping & Courier',           'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1500', null),
    ('1507-05', 'Yazılım-Abonelik',         'Software Subscriptions',       'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1500', null),
    ('1507-07', 'Ofis Aidat ve Faturaları', 'Utility Costs',                'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1500', null),
    ('1507-08', 'Ofis Donanım Kirası',      'Furniture/Equipment Rental',   'sirket',     'month', 'Koster/MMB + KAAPA damitim', '1500', null),
    ('1507-09', 'Ofis Donanım Alımı',       'Furniture/Equipment Purchase', 'sirket',     'flat',  'Koster/MMB + KAAPA damitim', '1500', null),
    ('1610-01', 'Deneme Çekimi Mekânı',     'Screen Tests - Space',         'sirket',     'day',   'KAAPA', '1600', '1600-04'),
    ('1610-02', 'Deneme Çekimi Ekipmanı',   'Screen Tests - Equipment',     'sirket',     'day',   'KAAPA', '1600', '1600-04'),
    ('1610-03', 'Deneme Çekimi Kostümü',    null,                           'sirket',     'flat',  'KAAPA', '1600', '1600-04'),
    ('1610-04', 'Deneme Çekimi Makyajı',    null,                           'sirket',     'flat',  'KAAPA', '1600', '1600-04'),
    ('1610-05', 'Deneme Çekimi Yemeği',     null,                           'yemek',      'day',   'KAAPA', '1600', '1600-04'),
    ('1610-06', 'Deneme Çekimi Ulaşımı',    null,                           'sirket',     'flat',  'KAAPA', '1600', '1600-04'),
    ('1610-07', 'Deneme Çekimi Ekibi',      'Screen Tests - Crew',          'bordro',     'day',   'KAAPA', '1600', '1600-04'),
    ('1619-01', 'Cast Odası',               'Casting Facility',             'sirket',     'day',   'KAAPA', '1600', '1600-04'),
    ('1619-02', 'Cast Kayıt Ekipmanı',      'Video Expenses (Casting)',     'sirket',     'day',   'KAAPA', '1600', '1600-04'),
    ('1619-05', 'Cast Günü İkramı',         'Audition Expenses',            'yemek',      'day',   'KAAPA', '1600', '1600-04'),
    ('1619-06', 'Cast Günü Ulaşımı',        null,                           'sirket',     'flat',  'KAAPA', '1600', '1600-04'),
    ('1619-07', 'Cast Kayıt Ekibi',         null,                           'bordro',     'day',   'KAAPA', '1600', '1600-04')
  ) as t(code, name, name_en, status, unit, prov, card, heading);

-- 1310 ve 1507: hazir ofisin paket satiri (birim ay, es adlar; KART-KATALOGU 7.2 ve 7.4).
update public.item_library
   set default_unit_code = 'month',
       aliases = array['Hazır Ofis','Ortak Çalışma Alanı']
 where catalog_code in ('1310','1507');

-- 4) Cesit atamasi (131 kalem; BUTCE-SEMA-KARARLARI KUTUPHANE ESLEMESI)
update public.item_library l
   set cost_element_id = e.id
  from (values
    ('1101-04','Personel Ücreti'),('1101-06','Personel Ücreti'),('1102-01','Personel Ücreti'),
    ('1102-02','Personel Ücreti'),('1103-01','Personel Ücreti'),('1105-06','Personel Ücreti'),
    ('1107-01','Personel Ücreti'),('1301','Personel Ücreti'),('1302','Personel Ücreti'),
    ('1306','Personel Ücreti'),('1309','Personel Ücreti'),('1313','Personel Ücreti'),
    ('1314','Personel Ücreti'),('1501','Personel Ücreti'),('1502','Personel Ücreti'),
    ('1503','Personel Ücreti'),('1504','Personel Ücreti'),('1506','Personel Ücreti'),
    ('1509','Personel Ücreti'),('1510','Personel Ücreti'),('1601','Personel Ücreti'),
    ('1602','Personel Ücreti'),('1603','Personel Ücreti'),('1604','Personel Ücreti'),
    ('1605','Personel Ücreti'),('1606','Personel Ücreti'),('1607','Personel Ücreti'),
    ('1608','Personel Ücreti'),('1609','Personel Ücreti'),('1610-07','Personel Ücreti'),
    ('1612','Personel Ücreti'),('1613','Personel Ücreti'),('1615','Personel Ücreti'),
    ('1616','Personel Ücreti'),('1619-07','Personel Ücreti'),('3901','Personel Ücreti'),
    ('3902','Personel Ücreti'),('3903','Personel Ücreti'),('3904','Personel Ücreti'),
    ('3914','Personel Ücreti'),('3916','Personel Ücreti'),('3917','Personel Ücreti'),
    ('1611','Fazla Mesai'),
    ('1315','Temsilci ve Ajans Komisyonu'),('1511','Temsilci ve Ajans Komisyonu'),
    ('1618','Temsilci ve Ajans Komisyonu'),('1618-01','Temsilci ve Ajans Komisyonu'),
    ('3910','Ödenek ve Kit Kirası'),
    ('1101-01','Hak Satın Alma'),('1101-02','Opsiyon ve Uzatma'),('1101-03','Opsiyon ve Uzatma'),
    ('1501-01','Hak Devri'),('1620','Hak Devri'),('1614','Tekrar Kullanım Payı'),
    ('1107-03','Arşiv ve Görüntü Lisansı'),
    ('1108-01','Ulaşım Bileti'),('1305-01','Ulaşım Bileti'),('1508-01','Ulaşım Bileti'),
    ('1108-02','Konaklama'),('1305-02','Konaklama'),('1508-02','Konaklama'),
    ('1108-03','Yolculukta Yemek ve Ağırlama'),('1305-03','Yolculukta Yemek ve Ağırlama'),('1508-03','Yolculukta Yemek ve Ağırlama'),
    ('1108-04','Harcırah'),('1305-04','Harcırah'),('1508-04','Harcırah'),
    ('1108-05','Festival, Market ve Lab Katılımı'),('1508-05','Festival, Market ve Lab Katılımı'),
    ('1104-06','Festival, Market ve Lab Katılımı'),
    ('1108-06','Yolculuk Aracı Kiralama'),('1305-06','Yolculuk Aracı Kiralama'),('1508-06','Yolculuk Aracı Kiralama'),
    ('1104-02','Tanıtım Materyali'),('1104-05','Tanıtım Materyali'),
    ('1101-05','Danışmanlık ve Uzmanlık'),('1101-07','Danışmanlık ve Uzmanlık'),('1104-01','Danışmanlık ve Uzmanlık'),
    ('1107-02','Danışmanlık ve Uzmanlık'),('1107-04','Danışmanlık ve Uzmanlık'),('1307','Danışmanlık ve Uzmanlık'),
    ('1312','Danışmanlık ve Uzmanlık'),
    ('1106-01','Hukuk ve Clearance'),('1106-02','Hukuk ve Clearance'),('1308','Hukuk ve Clearance'),
    ('1106-03','Mali Müşavirlik ve Denetim'),('1106-04','Mali Müşavirlik ve Denetim'),
    ('1104-03','Tasarım ve Grafik'),('1104-04','Çeviri ve Altyazı'),
    ('3913','Cast Hizmeti'),('1610','Cast Hizmeti'),('1619','Cast Hizmeti'),
    ('1106-05','Noter ve Resmî Harçlar'),
    ('1105-01','Ofis Kirası'),('1310-01','Ofis Kirası'),('1507-01','Ofis Kirası'),('1310','Ofis Kirası'),('1507','Ofis Kirası'),
    ('1105-02','Kırtasiye ve Ofis Sarfı'),('1310-02','Kırtasiye ve Ofis Sarfı'),('1507-02','Kırtasiye ve Ofis Sarfı'),
    ('1105-03','İletişim'),('1310-03','İletişim'),('1507-03','İletişim'),
    ('1105-04','Nakliye, Kargo, Kurye'),('1310-04','Nakliye, Kargo, Kurye'),('1507-04','Nakliye, Kargo, Kurye'),
    ('1105-05','Yazılım ve Abonelik'),('1310-05','Yazılım ve Abonelik'),('1507-05','Yazılım ve Abonelik'),
    ('1105-07','Mekân Giderleri'),('1310-07','Mekân Giderleri'),('1507-07','Mekân Giderleri'),
    ('1105-08','Ekipman Kiralama'),('1310-08','Ekipman Kiralama'),('1507-08','Ekipman Kiralama'),
    ('1105-09','Ekipman Satın Alma'),('1310-09','Ekipman Satın Alma'),('1507-09','Ekipman Satın Alma'),
    ('1610-01','Stüdyo ve Plato Kirası'),('1619-01','Stüdyo ve Plato Kirası'),
    ('1610-02','Ekipman Kiralama'),('1619-02','Ekipman Kiralama'),
    ('1610-03','Malzeme Kiralama'),('1610-04','Sarf Malzeme'),('1610-05','Set Yemeği'),
    ('1619-05','Ara Öğün ve İkram'),
    ('1610-06','Taksi ve Transfer'),('1619-06','Taksi ve Transfer'),
    ('1190-01','Banka, Havale ve Kur Masrafı'),('1190-02','Beklenmedik Küçük Giderler')
  ) as m(code, element)
  join public.cost_elements e on e.name = m.element and e.parent_id is not null
 where l.catalog_code = m.code;

-- Bekci: baslik olmayan her kalem cesit tasir (KART 1400 ve sonraki tohumlar cesidiyle doger).
alter table public.item_library
  add constraint item_library_cost_element_check check (is_group or cost_element_id is not null);

-- 5) Iki fonksiyonda kopya. Taban: fn_open_budget 20260905150000, fn_add_budget_item
--    20261002120000 icindeki GUNCEL govdeler, birebir; degisen yalniz cesit degiskeni ve insert.
--    Imzalar ayni kaldigi icin drop/grant yok.
create or replace function public.fn_open_budget(
  p_project    uuid,
  p_template   uuid,
  p_scope      text default 'single',
  p_episode_no int  default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $openfn$
declare
  v_uid          uuid := auth.uid();
  v_body         jsonb;
  v_budget       uuid;
  v_today        date := current_date;
  v_stage        jsonb;
  v_card         jsonb;
  v_item         jsonb;
  v_pct          jsonb;
  v_dept         uuid;
  v_group        uuid;
  v_item_id      uuid;
  v_unit         uuid;
  v_item_unit    uuid;
  v_status       text;
  v_comp         uuid;
  v_rate         numeric(7,4);
  v_item_code    int;
  v_catalog_code text;
  v_library_id   uuid;
  v_card_code    text;
  v_misc_prefix  text;
  v_heading      text;
  v_cost_element uuid;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if not fn_is_project_muhasebe(p_project) then
    raise exception 'Bütçe açma yetkisi yok';
  end if;

  select body into v_body from budget_templates
   where id = p_template and is_active
     and (kind = 'system' or owner_project_id = p_project);
  if v_body is null then
    raise exception 'Şablon bulunamadı veya bu projeye kapalı';
  end if;

  if exists (select 1 from budgets where project_id = p_project
               and scope = p_scope and episode_no is not distinct from p_episode_no) then
    raise exception 'Bu kapsam için bütçe zaten açık';
  end if;

  insert into budgets (project_id, scope, episode_no)
  values (p_project, p_scope, p_episode_no)
  returning id into v_budget;

  for v_stage in select * from jsonb_array_elements(coalesce(v_body->'stages', '[]'::jsonb))
  loop
    insert into budget_stages (budget_id, name, sort_order, is_undated)
    values (v_budget, v_stage->>'name',
            coalesce((v_stage->>'sort_order')::int, 0), false);
  end loop;
  insert into budget_stages (budget_id, name, sort_order, is_undated)
  values (v_budget, 'Donemsiz', 9999, true);

  for v_card in select * from jsonb_array_elements(coalesce(v_body->'cards', '[]'::jsonb))
  loop
    insert into departments (project_id, name, code)
    values (p_project, coalesce(v_card->>'name', v_card->>'department_code'),
            v_card->>'department_code')
    on conflict (project_id, code) do nothing;
    select id into v_dept from departments
     where project_id = p_project and code = v_card->>'department_code';

    select id into v_unit from units where code = v_card->>'default_unit';

    v_card_code := v_card->>'card_code';
    if v_card_code is null then
      raise exception 'Şablon kartında card_code eksik: %', v_card->>'name';
    end if;

    -- K-B IPTALI: muhtelif oneki kartin ayri hanesi. Sablon govdesi bu
    -- dilimde acilmadi (KART 1600 sablonu ayri tur); sablonda misc_prefix
    -- yoksa GECICI geri-dusum substr(card_code,1,2) uygular. Geri-dusum
    -- sablon turunde kalkacak.
    v_misc_prefix := coalesce(v_card->>'misc_prefix', substr(v_card_code, 1, 2));

    insert into expense_groups (budget_id, department_id, name, sort_order, card_code, misc_prefix)
    values (v_budget, v_dept, v_card->>'name',
            coalesce((v_card->>'sort_order')::int, 0), v_card_code, v_misc_prefix)
    returning id into v_group;

    for v_item in select * from jsonb_array_elements(coalesce(v_card->'items', '[]'::jsonb))
    loop
      v_item_unit := coalesce(
        (select id from units where code = v_item->>'unit'),
        v_unit
      );
      if v_item_unit is null then
        raise exception 'Birim bulunamadı: kart % kalem %',
          v_card->>'name', v_item->>'name';
      end if;

      v_catalog_code := v_item->>'catalog_code';
      if v_catalog_code is null then
        raise exception 'Şablon kaleminde catalog_code eksik: kart % kalem %',
          v_card->>'name', v_item->>'name';
      end if;
      -- GIDER CESIDI (20261013): cesit kutuphane kaleminden satira kopyalanir.
      select id, cost_element_id into v_library_id, v_cost_element
        from item_library where catalog_code = v_catalog_code;
      if v_library_id is null then
        raise exception 'Katalog kodu kütüphanede yok: %', v_catalog_code;
      end if;

      -- 1600M2: aidiyet kutuphanede VERIDIR (heading_id), koddan turetilmez.
      -- Her tur icin yeniden hesaplanir; atomun heading_id'si null ise
      -- Basliksiz kalir (kutuphanede baslik satiri olmayan kartlar, ör. 1500).
      v_heading := null;
      select h.catalog_code into v_heading
        from item_library h
       where h.id = (select l.heading_id from item_library l where l.id = v_library_id);

      update budgets set item_code_seq = item_code_seq + 1
       where id = v_budget returning item_code_seq into v_item_code;

      insert into budget_items
        (budget_id, group_id, item_code, name, name_en, unit_net,
         unit_id, multiplier, payment_status, sort_order,
         catalog_code, library_item_id, heading_code, cost_element_id)
      values
        (v_budget, v_group, v_item_code, v_item->>'name', v_item->>'detail',
         0, v_item_unit, coalesce((v_item->>'multiplier')::numeric, 1),
         coalesce(v_item->>'payment_status', 'sirket'),
         coalesce((v_item->>'sort_order')::int, 0),
         v_catalog_code, v_library_id, v_heading, v_cost_element)
      returning id into v_item_id;

      -- 3e) Statu -> item_burdens + vat_rate: tek motor.
      perform public.fn_refill_item_burdens(v_item_id);
    end loop;
  end loop;

  if v_body ? 'percent_lines' and jsonb_array_length(v_body->'percent_lines') > 0 then
    for v_pct in select * from jsonb_array_elements(v_body->'percent_lines')
    loop
      insert into budget_percent_lines (budget_id, code, label, rate_percent, is_hidden, sort_order)
      values (v_budget, v_pct->>'code', v_pct->>'label',
              coalesce((v_pct->>'rate_percent')::numeric, 0),
              coalesce((v_pct->>'is_hidden')::boolean, false),
              coalesce((v_pct->>'sort_order')::int, 0));
    end loop;
  else
    insert into budget_percent_lines (budget_id, code, label, rate_percent, sort_order)
    values (v_budget, 'contingency', 'Ongorulemeyen', 10, 1),
           (v_budget, 'profit', 'Kar', 0, 2);
  end if;

  return v_budget;
end;
$openfn$;

create or replace function public.fn_add_budget_item(
  p_group_id         uuid,
  p_catalog_code     text default null,
  p_name             text default null,
  p_payment_status   text default null,
  p_unit_code        text default null,
  p_existing_code    text default null,
  p_person_object_id uuid default null,
  p_parent_item_id   uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $addfn$
declare
  v_uid              uuid := auth.uid();
  v_budget           uuid;
  v_project          uuid;
  v_card_code        text;
  v_misc_prefix      text;
  v_lib              item_library%rowtype;
  v_parent           budget_items%rowtype;
  v_name             text;
  v_status           text;
  v_unit_code        text;
  v_name_en          text;
  v_library_id       uuid;
  v_code             text;
  v_heading          text;
  v_seq              int;
  v_unit             uuid;
  v_item_code        int;
  v_item_id          uuid;
  v_person_project   uuid;
  v_person_row_found boolean;
  v_cost_element     uuid;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  select eg.budget_id, eg.card_code, eg.misc_prefix into v_budget, v_card_code, v_misc_prefix
    from expense_groups eg where eg.id = p_group_id;
  if v_budget is null then
    raise exception 'Kart bulunamadı';
  end if;
  if v_card_code is null then
    raise exception 'Kart kodu tanımsız';
  end if;

  select b.project_id into v_project from budgets b where b.id = v_budget;
  if not fn_is_project_muhasebe(v_project) then
    raise exception 'Kalem ekleme yetkisi yok';
  end if;

  if p_catalog_code is not null then
    -- kutuphane modu
    if p_existing_code is not null then
      raise exception 'Katalog kodu ile mevcut-kod aynı anda verilmez';
    end if;
    if p_name is not null or p_payment_status is not null or p_unit_code is not null then
      raise exception 'Kütüphane modunda isim/statü/birim parametresi verilmez (varsayılan kütüphaneden gelir)';
    end if;
    select * into v_lib from item_library where catalog_code = p_catalog_code;
    if v_lib.id is null then
      raise exception 'Katalog kodu kütüphanede yok: %', p_catalog_code;
    end if;
    -- ASKS_PERSON (20260919): kisiye yapisan atom kisisiz eklenemez.
    if v_lib.asks_person and p_person_object_id is null then
      raise exception 'Bu kalem bir kişiye bağlanmadan eklenemez: %', p_catalog_code;
    end if;
    if v_lib.is_group then
      raise exception 'Başlık satırı kalem olarak eklenemez: %', p_catalog_code;
    end if;
    if v_lib.card_code <> v_card_code then
      raise exception 'Katalog kodu bu kartın aralığından değil: % (kart %)', p_catalog_code, v_card_code;
    end if;
    -- ZIMBA (20261001): altina girecegi kalemleri yazili atom bagli satirsiz eklenemez;
    -- yazili olmayan atom bir satirin altina eklenemez.
    if cardinality(v_lib.attaches_to) > 0 then
      if p_parent_item_id is null then
        raise exception 'Bu kalem bağlanacağı satır seçilmeden eklenemez: %', p_catalog_code;
      end if;
    elsif p_parent_item_id is not null then
      raise exception 'Bu kalem başka bir satırın altına eklenemez: %', p_catalog_code;
    end if;
    v_name       := v_lib.name;
    v_status     := v_lib.default_payment_status;
    v_unit_code  := v_lib.default_unit_code;
    v_name_en    := v_lib.name_en;
    v_library_id := v_lib.id;
    v_code       := p_catalog_code;
    -- GIDER CESIDI (20261013): cesit kutuphane kaleminden satira kopyalanir.
    v_cost_element := v_lib.cost_element_id;
    if p_parent_item_id is not null then
      -- ZIMBA (20261001): bagli satir ayni kartta, etkin ve atomun yazili kodlarindan biri
      -- olmali; baslik bagli satirdan gelir.
      select * into v_parent from budget_items where id = p_parent_item_id;
      if v_parent.id is null then
        raise exception 'Bağlanacak satır bulunamadı: %', p_parent_item_id;
      end if;
      if not v_parent.is_active or v_parent.group_id <> p_group_id then
        raise exception 'Bağlanacak satır bu kartta etkin değil: %', p_parent_item_id;
      end if;
      if not (v_parent.catalog_code = any(v_lib.attaches_to)) then
        raise exception 'Bu kalem bu satırın altına eklenemez: % (satır %)', p_catalog_code, v_parent.catalog_code;
      end if;
      v_heading := v_parent.heading_code;
    elsif v_lib.heading_id is not null then
      -- 1600M2: aidiyet kutuphanede VERIDIR (heading_id), koddan turetilmez.
      -- Kast Operasyonu basligi hem 16xx hem 39xx atom tasidigi icin tire-oncesi
      -- parcadan turetme bu kartta calismazdi.
      select h.catalog_code into v_heading from item_library h
       where h.id = v_lib.heading_id;
    else
      -- ASKS_PERSON (20260919): aidiyeti olmayan atomda baslik kisinin bu karttaki
      -- satirlarindan turer - once gorev satiri (is_duty=true), yoksa en eski satir.
      -- KISISIZ BASLIKSIZ (1 Ekim 2026): kisi verilmemisse kalem BASLIKSIZ eklenir (v_heading null
      -- kalir). Kisi soran atom yukarida ayri kuralla kisisiz eklenemez.
      v_person_row_found := false;
      v_heading := null;
      if p_person_object_id is not null then
      select bi.heading_code into v_heading
        from budget_items bi
        join item_library l on l.id = bi.library_item_id
       where bi.group_id = p_group_id
         and bi.person_object_id = p_person_object_id
         and bi.is_active
         and l.is_duty = true
       order by bi.sort_order
       limit 1;
      if found then
        v_person_row_found := true;
      else
        select bi.heading_code into v_heading
          from budget_items bi
         where bi.group_id = p_group_id
           and bi.person_object_id = p_person_object_id
           and bi.is_active
         order by bi.sort_order
         limit 1;
        if found then
          v_person_row_found := true;
        end if;
      end if;
      if not v_person_row_found then
        raise exception 'Bu kişinin bu kartta satırı yok: %', p_person_object_id;
      end if;
      end if;
    end if;
  else
    -- serbest / mevcut-kod ortak dogrulama (D3c-1'den beri): isim, statu, birim zorunlu.
    if p_person_object_id is not null then
      raise exception 'Serbest kalemde kişi parametresi verilmez';
    end if;
    -- ZIMBA (20261001)
    if p_parent_item_id is not null then
      raise exception 'Serbest kalemde bağlı satır parametresi verilmez';
    end if;
    if p_name is null or p_payment_status is null or p_unit_code is null then
      raise exception 'Serbest kalemde isim, statü ve birim zorunlu';
    end if;
    if p_existing_code is null then
      -- serbest mod: yeni muhtelif alt-kod, sayac ARTAR
      update expense_groups set misc_code_seq = misc_code_seq + 1
       where id = p_group_id returning misc_code_seq into v_seq;
      v_code := v_misc_prefix || '98-' || lpad(v_seq::text, greatest(2, length(v_seq::text)), '0');
    else
      -- D3c-2: mevcut serbest kalem - AYNI KOD ile ikinci satir, sayac ARTMAZ
      if p_existing_code !~ ('^' || v_misc_prefix || '98-[0-9]{2,}$') then
        raise exception 'Mevcut kod bu kartın muhtelif bloğundan değil: % (kart %)', p_existing_code, v_card_code;
      end if;
      perform 1 from budget_items bi
        where bi.group_id = p_group_id and bi.catalog_code = p_existing_code and bi.is_active
        limit 1;
      if not found then
        raise exception 'Mevcut kod bu kartta bulunamadı: %', p_existing_code;
      end if;
      v_code := p_existing_code;
    end if;
    v_name       := p_name;
    v_status     := p_payment_status;
    v_unit_code  := p_unit_code;
    v_name_en    := null;
    v_library_id := null;
    -- GIDER CESIDI (20261013, KARARLAR madde 5): serbest kalem cesitsiz dogar.
    v_cost_element := null;
    -- AIDIYET-1: serbest kalemde aidiyet kullanicinin secimidir, dilim 2'ye kadar bos.
    v_heading    := null;
  end if;

  -- ASKS_PERSON (20260919): kisi etiketi verilmisse projesi kartin projesiyle uyusmali
  -- (fn_add_person_items icindeki ayni kontrol - is distinct from, iki bagimsiz zincir).
  if p_person_object_id is not null then
    select co.project_id into v_person_project from budget_cost_objects co where co.id = p_person_object_id;
    if v_person_project is distinct from v_project then
      raise exception 'Kişi etiketi bu projeye ait değil: %', p_person_object_id;
    end if;
  end if;

  select id into v_unit from units where code = v_unit_code;
  if v_unit is null then
    raise exception 'Birim bulunamadı: %', v_unit_code;
  end if;

  update budgets set item_code_seq = item_code_seq + 1
   where id = v_budget returning item_code_seq into v_item_code;

  -- ZIMBA (20261001): bagli satirla dogan atomda oranlar kutuphaneden hazir gelir.
  -- DUZ SATIR (20261002120000): hak devri oransiz dogar; rakamini kendisi tasir.
  insert into budget_items
    (budget_id, group_id, item_code, name, name_en, unit_net,
     unit_id, multiplier, payment_status, sort_order,
     catalog_code, library_item_id, heading_code, person_object_id,
     parent_item_id, derive_rate, cost_element_id)
  values
    (v_budget, p_group_id, v_item_code, v_name, v_name_en,
     0, v_unit, 1, v_status, 0,
     v_code, v_library_id, v_heading, p_person_object_id,
     p_parent_item_id,
     case when p_parent_item_id is not null then v_lib.default_derive_rate end,
     v_cost_element)
  returning id into v_item_id;

  perform public.fn_refill_item_burdens(v_item_id);

  -- D2-e: kartin tum satirlari kod-sirasina yeniden numaralanir (es kodda item_code ayristirir, K-D bitisiklik).
  -- AIDIYET-1 NOTU: siralama bu dilimde DEGISMEZ, hala catalog_code'a gore. heading_code'un
  -- siralamaya girmesi dilim 2'nin isidir.
  update budget_items bi
     set sort_order = t.rn
    from (select id, row_number() over (order by catalog_code, item_code) as rn
            from budget_items where group_id = p_group_id) t
   where t.id = bi.id
     and bi.sort_order is distinct from t.rn;

  return v_item_id;
end;
$addfn$;

-- 6) Film sablonu v8 (TABAN CANLIDIR). 1600 kartinda 1610 ve 1619 cikar, yerlerine
--    1610-01, 1610-02, 1610-05 ve 1619-01, 1619-02, 1619-05 girer (KART-KATALOGU 7.5).
--    Diger kartlara dokunulmaz.
do $tpl$
declare
  v_body   jsonb;
  v_cards  jsonb := '[]'::jsonb;
  v_card   jsonb;
  v_item   jsonb;
  v_items  jsonb;
  v_code   text;
  v_lib    public.item_library%rowtype;
  v_ord    int;
  v_done   boolean := false;
begin
  select t.body into v_body
    from public.budget_templates t
   where t.kind = 'system' and t.production_type = 'film'
     and t.scope = 'single' and t.is_active;
  if v_body is null then
    raise exception 'Aktif sistem sablonu bulunamadi';
  end if;

  for v_card in select * from jsonb_array_elements(v_body->'cards')
  loop
    if v_card->>'card_code' = '1600' then
      if not exists (select 1 from jsonb_array_elements(v_card->'items') i where i->>'catalog_code' = '1610')
         or not exists (select 1 from jsonb_array_elements(v_card->'items') i where i->>'catalog_code' = '1619') then
        raise exception 'Sablonun 1600 kartinda 1610 ve 1619 bulunamadi';
      end if;
      v_items := '[]'::jsonb;
      v_ord := 0;
      for v_item in select * from jsonb_array_elements(v_card->'items')
      loop
        if v_item->>'catalog_code' in ('1610','1619') then
          foreach v_code in array
            case v_item->>'catalog_code'
              when '1610' then array['1610-01','1610-02','1610-05']
              else array['1619-01','1619-02','1619-05'] end
          loop
            select * into v_lib from public.item_library where catalog_code = v_code;
            if v_lib.id is null or v_lib.card_code <> '1600' then
              raise exception '1600 kalemi degil: %', v_code;
            end if;
            v_ord := v_ord + 1;
            v_items := v_items || jsonb_build_array(jsonb_build_object(
              'ref',            'i' || v_code,
              'name',           v_lib.name,
              'detail',         v_lib.name_en,
              'unit',           v_lib.default_unit_code,
              'payment_status', v_lib.default_payment_status,
              'multiplier',     1,
              'sort_order',     v_ord,
              'catalog_code',   v_code));
          end loop;
        else
          v_ord := v_ord + 1;
          v_items := v_items || jsonb_build_array(jsonb_set(v_item, '{sort_order}', to_jsonb(v_ord)));
        end if;
      end loop;
      v_card := jsonb_set(v_card, '{items}', v_items);
      v_done := true;
    end if;
    v_cards := v_cards || jsonb_build_array(v_card);
  end loop;
  if not v_done then
    raise exception 'Sablonda 1600 karti bulunamadi';
  end if;

  v_body := jsonb_set(v_body, '{cards}', v_cards);

  update public.budget_templates
     set is_active = false
   where kind = 'system' and production_type = 'film'
     and scope = 'single' and is_active;

  insert into public.budget_templates
    (kind, production_type, scope, label, body, is_active)
  values
    ('system','film','single',
     'KAAPA Sistem - Film (Tek) - 1100+1300+1500+1600 v8',
     v_body, true);
end;
$tpl$;

-- 7) Muhursuz butcelerde kutuphaneden dogmus satirlar cesidini alir. Serbest kalem
--    (library_item_id bos) cesitsiz kalir. Muhurlu butceye dokunulmaz (bekci de reddederdi).
--    trg_log_items doldurma suresince kapali: her satira imzasiz denetim kaydi yazardi.
alter table public.budget_items disable trigger trg_log_items;

update public.budget_items bi
   set cost_element_id = l.cost_element_id
  from public.item_library l, public.budgets b
 where l.id = bi.library_item_id
   and b.id = bi.budget_id
   and not coalesce(b.is_locked, false)
   and bi.cost_element_id is distinct from l.cost_element_id;

alter table public.budget_items enable trigger trg_log_items;

-- 8) Dogrulama (NOTICE'e bagli degil; push sonrasi ayrica db query ile kosulur).
do $check$
begin
  if (select count(*) from public.cost_element_natures) <> 10 then
    raise exception 'Doga 10 satir olmali';
  end if;
  if (select count(*) from public.cost_elements where parent_id is null) <> 15 then
    raise exception 'Ust cesit 15 olmali';
  end if;
  if (select count(*) from public.cost_elements where parent_id is not null) <> 69 then
    raise exception 'Alt cesit 69 olmali';
  end if;
  if exists (select 1 from public.cost_elements c join public.cost_elements p on p.id = c.parent_id
              where p.parent_id is not null) then
    raise exception 'Sozluk iki kademeyi asiyor';
  end if;
  if (select count(*) from public.item_library where not is_group) <> 131 then
    raise exception 'Kutuphanede baslik disi kalem 131 olmali';
  end if;
  if exists (select 1 from public.item_library where not is_group and cost_element_id is null) then
    raise exception 'Cesitsiz kutuphane kalemi kaldi';
  end if;
  if exists (select 1 from public.item_library where is_group and cost_element_id is not null) then
    raise exception 'Baslik cesit tasiyor';
  end if;
  if exists (select 1 from public.item_library l join public.cost_elements e on e.id = l.cost_element_id
              where e.parent_id is null) then
    raise exception 'Kaleme ust cesit atanmis';
  end if;
  if (select count(*) from public.item_library where catalog_code ~ '^(1610|1619)-' and heading_id is null) > 0 then
    raise exception '1610 ve 1619 parcalari Cast Operasyonu basliginda olmali';
  end if;
  if (select count(*) from public.item_library where catalog_code in ('1310','1507') and default_unit_code = 'month') <> 2 then
    raise exception '1310 ve 1507 birimi ay olmali';
  end if;
  if exists (select 1 from public.budget_items bi join public.item_library l on l.id = bi.library_item_id
               join public.budgets b on b.id = bi.budget_id
              where not coalesce(b.is_locked, false) and bi.cost_element_id is distinct from l.cost_element_id) then
    raise exception 'Muhursuz butcede cesidi kutuphaneyle uyusmayan satir kaldi';
  end if;
  if exists (select 1 from public.budget_items where library_item_id is null and cost_element_id is not null) then
    raise exception 'Serbest kalem cesit tasiyor';
  end if;
  if (select count(*) from public.budget_templates
       where kind = 'system' and production_type = 'film'
         and scope = 'single' and is_active) <> 1 then
    raise exception 'Aktif sistem sablonu tek olmali';
  end if;
  if (select string_agg(i->>'catalog_code', ',' order by (i->>'sort_order')::int)
        from public.budget_templates t, jsonb_array_elements(t.body->'cards') c, jsonb_array_elements(c->'items') i
       where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
         and t.is_active and c->>'card_code' = '1600')
     is distinct from '1601,1602,1603,1604,1606,1607,3901,3902,3903,3904,3917,1605,1609,1610-01,1610-02,1610-05,1613,1615,1619-01,1619-02,1619-05' then
    raise exception 'Sablonun 1600 karti beklenen 21 kalem degil';
  end if;
end $check$;
