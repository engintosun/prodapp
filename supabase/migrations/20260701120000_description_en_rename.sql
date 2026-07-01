-- detail alani iki isi karistiriyordu (sablon Ingilizce adi + kullanici serbest metni).
-- description_en olarak yeniden adlandiriliyor: bundan sonra SADECE arka planda
-- sablonun Ingilizce adini tasir, ekranda hicbir kolonda gorunmez.
-- Mevcut canli veride bazi satirlarda kullanici notu olabilir, bazilarinda sablon
-- Ingilizce adi kalmis olabilir -- ikisi ayirt edilmeden tasinir (Engin onayli, kabul edilebilir kayip riski).

alter table budget_items rename column detail to description_en;

-- Baseline'da tanimli ama hic kullanilmayan 'note' kolonu (bos) -- temizle.
alter table budget_items drop column if exists note;
