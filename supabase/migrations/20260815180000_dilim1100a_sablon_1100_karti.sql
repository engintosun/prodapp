-- KAAPA DILIM 1100-A (bolum 6): sablona 1100 karti + govdenin Turkcesi.
-- Taban: aktif sablonun GUNCEL govdesi (2026-08-15'te canlidan okundu; 20260623120000 seed
-- DEGIL - o govdede catalog_code yoktu, D1/D2 sonradan eklemisti). 1500 seed emsali: eski
-- surum is_active=false, yeni surum insert.

update public.budget_templates
   set is_active = false
 where kind = 'system' and production_type = 'film' and scope = 'single' and is_active;

insert into public.budget_templates (kind, production_type, scope, label, body, is_active)
values (
  'system','film','single',
  'KAAPA Sistem - Film (Tek) - 1100+1500 demo',
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
        {"ref":"i110104","name":"Yazım-Taslaklar","detail":"Screenplay Drafts","unit":"piece","payment_status":"telif_belgeli","multiplier":1,"sort_order":3,"catalog_code":"1101-04"},
        {"ref":"i110201","name":"Yapımcı Geliştirme Ücreti","detail":"Producer Development Fee","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":4,"catalog_code":"1102-01"},
        {"ref":"i110301","name":"Yönetmen Geliştirme Ücreti","detail":"Director Development / Attachment Fee","unit":"flat","payment_status":"telif_belgeli","multiplier":1,"sort_order":5,"catalog_code":"1103-01"},
        {"ref":"i110401","name":"Bütçeleme","detail":"Budget Preparation","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":6,"catalog_code":"1104-01"},
        {"ref":"i110402","name":"Sunum Dosyası","detail":"Pitch Deck / Presentation Package","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":7,"catalog_code":"1104-02"},
        {"ref":"i110501","name":"Ofis Kirası","detail":"Office Rent","unit":"month","payment_status":"kira_sahis","multiplier":1,"sort_order":8,"catalog_code":"1105-01"},
        {"ref":"i110502","name":"Kırtasiye-Sarf","detail":"Office Supplies","unit":"month","payment_status":"sirket","multiplier":1,"sort_order":9,"catalog_code":"1105-02"},
        {"ref":"i110601","name":"Avukatlık-Sözleşme","detail":"Legal Fees / Contracts","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":10,"catalog_code":"1106-01"},
        {"ref":"i110603","name":"Mali Müşavir","detail":"Accounting Fees","unit":"month","payment_status":"smm","multiplier":1,"sort_order":11,"catalog_code":"1106-03"},
        {"ref":"i110701","name":"Saha-Konu Araştırması","detail":"Subject / Field Research","unit":"flat","payment_status":"smm","multiplier":1,"sort_order":12,"catalog_code":"1107-01"},
        {"ref":"i110801","name":"Ulaşım-Uçak","detail":"Air Travel","unit":"piece","payment_status":"sirket","multiplier":1,"sort_order":13,"catalog_code":"1108-01"},
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
begin
  if (
    select jsonb_array_length(t.body->'cards')
      from public.budget_templates t
     where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single' and t.is_active
  ) <> 2 then
    raise exception 'D1100A sablon: aktif govdede 2 kart (1100+1500) bekleniyordu';
  end if;
end $tpl_check$;
