-- KART 1600 M3: sablona 1600 karti (13 cekirdek atom + misc_prefix=39).
-- Taban: aktif sablonun GUNCEL govdesi (5 Eylul 2026'da canlidan okundu,
-- 1100/1500 kartlari AYNEN korunur, KAAPA DILIM 1100-A sablon migration'inin
-- kendi notundaki desenle ayni: eski migration dosyasindan degil, canlidan).
-- 1500 emsali: eski surum is_active=false, yeni surum insert.
--
-- 13 cekirdek atom KART-KATALOGU 7.5'teki [C] isaretinden birebir alindi
-- (dogrulama: tek kullanimlik betik, ADIM 3, capraz kontrol TAM UYUM verdi).
-- Diger 15 atom kutuphaneden eklenir ([K]), sablona GIRMEZ: 1611, 1614,
-- 1616, 1618, 1607, 1608, 3903, 3904, 3916, 3917, 1612, 3910, 3913, 3914, 1620.
-- Baslik satirlari (1600-01..04) govdeye YAZILMAZ - 1100 emsalinde de yok,
-- basliklar fetchCardLibrary'nin ayri listesinden cizilir, kalemin hangi
-- basligin altinda durdugu budget_items.heading_code'dan (dogumda
-- item_library.heading_id'den okunur) gelir.
--
-- misc_prefix ZORUNLU: yazilmazsa fn_open_budget'in gecici geri-dusumu
-- substr(card_code,1,2) = "16" verir, bu da MMB'nin kendi 1600 Talent
-- blogundaki 1698 Miscellaneous / 1699 Fringe hesaplariyla CAKISIR (15
-- Agustos 2026 karari serbest kalemin 39xx almasini tam bu yuzden soyluyor).
--
-- Kartta ETAP HANESI YOK: expense_groups.stage_id 20260614150000 gocuyle
-- dusuruldu (kart = departman, donemden kopar); etap kalem altinda
-- budget_item_periods'ta yasar.

update public.budget_templates
   set is_active = false
 where kind = 'system' and production_type = 'film' and scope = 'single' and is_active;

insert into public.budget_templates (kind, production_type, scope, label, body, is_active)
values (
  'system','film','single',
  'KAAPA Sistem - Film (Tek) - 1100+1500+1600 demo',
  $json$
{
  "stages": [
    {"ref":"s1","name":"Yapım Öncesi","sort_order":1},
    {"ref":"s2","name":"Yapım","sort_order":2},
    {"ref":"s3","name":"Yapım Sonrası","sort_order":3}
  ],
  "cards": [
    {
      "ref":"c1100",
      "department_code":"1100",
      "card_code":"1100",
      "name":"Proje Geliştirme ve Haklar",
      "default_unit":"flat",
      "default_package":null,
      "sort_order":1100,
      "items":[
        {"ref":"i110101","name":"Hak Satın Alma","detail":"Story Rights Purchase","unit":"flat","payment_status":"telif_belgeli","multiplier":1,"sort_order":1,"catalog_code":"1101-01"},
        {"ref":"i110102","name":"Opsiyon","detail":"Story Option","unit":"flat","payment_status":"telif_belgeli","multiplier":1,"sort_order":2,"catalog_code":"1101-02"},
        {"ref":"i110104","name":"Yazım-Taslaklar","detail":"Screenplay Drafts","unit":"flat","payment_status":"telif_belgeli","multiplier":1,"sort_order":3,"catalog_code":"1101-04"},
        {"ref":"i110201","name":"Yapımcı Geliştirme Ücreti","detail":"Producer Development Fee","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":4,"catalog_code":"1102-01"},
        {"ref":"i110301","name":"Yönetmen Geliştirme Ücreti","detail":"Director Development / Attachment Fee","unit":"flat","payment_status":"telif_belgeli","multiplier":1,"sort_order":5,"catalog_code":"1103-01"},
        {"ref":"i110401","name":"Bütçeleme","detail":"Budget Preparation","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":6,"catalog_code":"1104-01"},
        {"ref":"i110402","name":"Sunum Dosyası","detail":"Pitch Deck / Presentation Package","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":7,"catalog_code":"1104-02"},
        {"ref":"i110501","name":"Ofis Kirası","detail":"Office Rent","unit":"month","payment_status":"kira_sahis","multiplier":1,"sort_order":8,"catalog_code":"1105-01"},
        {"ref":"i110502","name":"Kırtasiye-Sarf","detail":"Office Supplies","unit":"month","payment_status":"sirket","multiplier":1,"sort_order":9,"catalog_code":"1105-02"},
        {"ref":"i110601","name":"Avukatlık-Sözleşme","detail":"Legal Fees / Contracts","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":10,"catalog_code":"1106-01"},
        {"ref":"i110603","name":"Mali Müşavir","detail":"Accounting Fees","unit":"month","payment_status":"smm","multiplier":1,"sort_order":11,"catalog_code":"1106-03"},
        {"ref":"i110701","name":"Saha-Konu Araştırması","detail":"Subject / Field Research","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":12,"catalog_code":"1107-01"},
        {"ref":"i110801","name":"Ulaşım-Uçak","detail":"Air Travel","unit":"flat","payment_status":"sirket","multiplier":1,"sort_order":13,"catalog_code":"1108-01"},
        {"ref":"i110802","name":"Konaklama","detail":"Hotels / Accommodation","unit":"day","payment_status":"konaklama","multiplier":1,"sort_order":14,"catalog_code":"1108-02"},
        {"ref":"i119001","name":"Banka-Havale-Kur","detail":"Bank & Transfer Charges","unit":"flat","payment_status":"sirket","multiplier":1,"sort_order":15,"catalog_code":"1190-01"}
      ]
    },
    {
      "ref":"c1500",
      "department_code":"1500",
      "card_code":"1500",
      "name":"Yönetmen ve Kreatif Reji Ekibi",
      "default_unit":"week",
      "default_package":null,
      "sort_order":1500,
      "items":[
        {"ref":"i1501","name":"Yönetmen Kaşesi","detail":"Director Fee","unit":"flat","payment_status":"telif_belgeli","multiplier":1,"sort_order":1,"catalog_code":"1501"},
        {"ref":"i1502","name":"İkinci Ekip Yönetmeni","detail":"Second Unit Director","unit":"week","payment_status":"smm","multiplier":1,"sort_order":2,"catalog_code":"1502"},
        {"ref":"i1503","name":"Koreograf","detail":"Choreographer","unit":"week","payment_status":"smm","multiplier":1,"sort_order":3,"catalog_code":"1503"},
        {"ref":"i1504","name":"Oyuncu/Diyalog Koçu","detail":"Dialogue/Acting Coach","unit":"day","payment_status":"smm","multiplier":1,"sort_order":4,"catalog_code":"1504"},
        {"ref":"i1505","name":"Yönetmen Özel Asistanı","detail":"Personal Assistant","unit":"week","payment_status":"bordro","multiplier":1,"sort_order":5,"catalog_code":"1505"}
      ]
    },
    {
      "ref":"c1600",
      "department_code":"1600",
      "card_code":"1600",
      "name":"Oyuncu",
      "default_unit":"flat",
      "default_package":null,
      "misc_prefix":"39",
      "sort_order":1600,
      "items":[
        {"ref":"i1601","name":"Başrol Oyuncu","detail":"Stars / Principal Roles","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":1,"catalog_code":"1601"},
        {"ref":"i1602","name":"Yardımcı Oyuncu","detail":"Supporting Cast","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":2,"catalog_code":"1602"},
        {"ref":"i1603","name":"Günlük Oyuncu","detail":"Day Players","unit":"flat","payment_status":"bordro","multiplier":1,"sort_order":3,"catalog_code":"1603"},
        {"ref":"i1604","name":"Dublör Koordinatörü","detail":"Stunt Coordinator","unit":"week","payment_status":"smm","multiplier":1,"sort_order":4,"catalog_code":"1604"},
        {"ref":"i1606","name":"Stunt Oyuncusu","detail":"Stunt Performers","unit":"day","payment_status":"bordro","multiplier":1,"sort_order":5,"catalog_code":"1606"},
        {"ref":"i3901","name":"Genel Arkaplan Oyuncusu","detail":"General Extras / Background","unit":"flat","payment_status":"sirket","multiplier":1,"sort_order":6,"catalog_code":"3901"},
        {"ref":"i3902","name":"Stand-In","detail":"Stand-Ins","unit":"flat","payment_status":"sirket","multiplier":1,"sort_order":7,"catalog_code":"3902"},
        {"ref":"i1605","name":"Cast Direktörü","detail":"Casting Director","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":8,"catalog_code":"1605"},
        {"ref":"i1609","name":"Cast Asistanı","detail":"Casting Assistant","unit":"flat","payment_status":"bordro","multiplier":1,"sort_order":9,"catalog_code":"1609"},
        {"ref":"i1610","name":"Deneme Çekimi","detail":"Screen Tests","unit":"flat","payment_status":"sirket","multiplier":1,"sort_order":10,"catalog_code":"1610"},
        {"ref":"i1613","name":"Dublaj","detail":"ADR / Looping","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":11,"catalog_code":"1613"},
        {"ref":"i1615","name":"Set Öğretmeni","detail":"Set Teacher","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":12,"catalog_code":"1615"},
        {"ref":"i1619","name":"Cast Gideri","detail":"Casting Expenses","unit":"flat","payment_status":"sirket","multiplier":1,"sort_order":13,"catalog_code":"1619"}
      ]
    }
  ],
  "percent_lines": [
    {"code":"contingency","label":"Öngörülemeyen","rate_percent":10,"is_hidden":false,"sort_order":1},
    {"code":"profit","label":"Kâr","rate_percent":0,"is_hidden":false,"sort_order":2}
  ]
}
$json$::jsonb,
  true
);

do $tpl_check$
declare v_items_len int;
begin
  if (
    select jsonb_array_length(t.body->'cards')
      from public.budget_templates t
     where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single' and t.is_active
  ) <> 3 then
    raise exception '1600M3 sablon: aktif govdede 3 kart (1100+1500+1600) bekleniyordu';
  end if;

  select jsonb_array_length(c->'items') into v_items_len
    from public.budget_templates t, jsonb_array_elements(t.body->'cards') c
   where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single' and t.is_active
     and c->>'card_code' = '1600';
  if v_items_len <> 13 then
    raise exception '1600M3 sablon: c1600 items uzunlugu 13 bekleniyordu, % geldi', v_items_len;
  end if;

  if (
    select c->>'misc_prefix'
      from public.budget_templates t, jsonb_array_elements(t.body->'cards') c
     where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single' and t.is_active
       and c->>'card_code' = '1600'
  ) <> '39' then
    raise exception '1600M3 sablon: c1600 misc_prefix ''39'' bekleniyordu';
  end if;
end $tpl_check$;
