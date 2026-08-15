-- KAAPA DILIM 1100-A (bolum 2): item_library baslik bayragi.

alter table public.item_library add column is_group boolean not null default false;

comment on column public.item_library.is_group is 'Gorsel grup basligi. true olan satir bir KALEM DEGILDIR: kalem ekleme listesinde gorunmez, capraz-kart taramasina girmez, fn_add_budget_item ile eklenemez. Grup uyeligi catalog_code''un tire oncesi parcasindan turer (1101-01 -> 1101).';
