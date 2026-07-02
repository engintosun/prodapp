-- Not mimarisi (paragraf 14): kaleme iki serbest-metin not alani.
-- internal_note: denetim/handoff notu; sunumda ASLA gorunmez.
-- public_note: sunuma cikabilen gerekce (RAPORLAR fazinda); Faz 1 yalniz muhasebe gorur/yazar.
-- Eski kullanilmayan note kolonu onceki gocte dusuruldu; bu iki kolon TEMIZ eklemedir.
-- variance_note (B5 fark aciklamasi) AYRI kavram, dokunulmaz.
-- Yeni tablo degil, yeni GRANT/RLS policy gerekmez; mevcut budget_items RLS (yalniz muhasebe) kapsar.
-- Iz: budget_items zaten trg_log_items (B19, full-snapshot) + trg_upd_items (updated_at) tasir; not duzenlemesi otomatik loglanir, yeni trigger yok.

alter table budget_items add column if not exists internal_note text;
alter table budget_items add column if not exists public_note text;

comment on column budget_items.internal_note is 'Ic Not: denetim/handoff; sunumda asla gorunmez.';
comment on column budget_items.public_note is 'Kamu Notu: sunuma cikabilen gerekce (RAPORLAR); Faz 1 yalniz muhasebe.';
