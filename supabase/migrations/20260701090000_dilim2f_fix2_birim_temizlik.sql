-- DILIM-2f-fix2: adet/kisi units satirlari kaldirildi (Birim sadece periyot cinsi tasir: gun/hafta/ay/bolum/sabit; adet/kisi Miktar kolonunun konusu)
delete from units where code in ('piece','person');
