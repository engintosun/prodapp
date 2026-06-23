-- KAAPA 2b-0: Sistem butce sablonu seed (fn_open_budget RAFI).
-- Icerik: KART 1500 alt-kumesi (1501-1505), film/single. Ilk sistem sablonu.
-- Idempotent: e2e'den kalmis olabilecek onceki aktif film/single sistem sablonunu
-- pasifle, yenisini aktif ekle (uq_templates_system_active partial-unique cakismasini onler).
begin;

update public.budget_templates
   set is_active = false
 where kind = 'system' and production_type = 'film' and scope = 'single' and is_active;

insert into public.budget_templates (kind, production_type, scope, label, body, is_active)
values (
  'system','film','single',
  'KAAPA Sistem - Film (Tek) - 1500 demo',
  $json$
{
  "stages": [
    {"ref":"s1","name":"Yapim Oncesi","sort_order":1},
    {"ref":"s2","name":"Yapim","sort_order":2},
    {"ref":"s3","name":"Yapim Sonrasi","sort_order":3}
  ],
  "cards": [
    {
      "ref":"c1500",
      "department_code":"1500",
      "name":"Yonetmen ve Kreatif Reji Ekibi",
      "default_unit":"week",
      "default_package":null,
      "sort_order":1500,
      "items":[
        {"ref":"i1501","name":"Yonetmen Kasesi","detail":"Director Fee","unit":"flat","package":null,"multiplier":1,"sort_order":1},
        {"ref":"i1502","name":"Ikinci Ekip Yonetmeni","detail":"Second Unit Director","unit":"week","package":"bordrolu","multiplier":1,"sort_order":2},
        {"ref":"i1503","name":"Koreograf","detail":"Choreographer","unit":"week","package":null,"multiplier":1,"sort_order":3},
        {"ref":"i1504","name":"Oyuncu/Diyalog Kocu","detail":"Dialogue/Acting Coach","unit":"day","package":null,"multiplier":1,"sort_order":4},
        {"ref":"i1505","name":"Yonetmen Ozel Asistani","detail":"Personal Assistant","unit":"week","package":"bordrolu","multiplier":1,"sort_order":5}
      ]
    }
  ],
  "percent_lines": [
    {"code":"contingency","label":"Ongorulemeyen","rate_percent":10,"is_hidden":false,"sort_order":1},
    {"code":"profit","label":"Kar","rate_percent":0,"is_hidden":false,"sort_order":2}
  ]
}
$json$::jsonb,
  true
);

commit;
