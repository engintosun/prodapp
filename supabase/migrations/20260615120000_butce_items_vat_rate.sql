-- KAAPA Butce 2026-06-15: budget_items.vat_rate (KDV Genis yol, sema eki)
-- Karar: docs/TASARIM-KARARLARI.md bolum "Sablon body FORMAT + KDV ayristirma" (E).
-- Ongorulen taraf kilitce NET; vat_rate satirin KDV oranini tutar (CFE net<->brut turetir).
-- Kardes kolon direct_payments.vat_rate ile ayni tip: numeric(5,2) not null default 20 check (>=0).
-- Tek katman: yalniz sema kolonu. RLS budget_items uzerinde zaten var; B19 iz tetikleyicisi
-- (fn_log_budget_change, to_jsonb tum satir) ve updated_at tetikleyicisi kolonu otomatik kapsar.
-- ON KOSUL: budget_items bos (Dilim 1 yeni, yazan UI yok); NOT NULL default guvenli.

alter table budget_items
  add column vat_rate numeric(5,2) not null default 20 check (vat_rate >= 0);

comment on column budget_items.vat_rate is
  'B-KDV: satir KDV orani yuzde. Ongorulen NET taban; CFE net<->brut turetir. Yuk ile AYRI eksen.';
