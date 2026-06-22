# KAAPA devir - 2026-06-13 (butce modulu, dilim 2)

## Bu oturumda canliya alinan kod
- CFE dilim 1 + sinav: src/shared/cfe/ (5 saf fonksiyon: brutBirim, satirToplam, kdvAyristir, zincirToplam B12, dokum; decimal.js, ROUND_HALF_UP), 8/8 test yesil. Commit 0b344e1.
- Lint hijyeni: .gitattributes + eslint.config.js override (^_ ignore; set-state-in-effect & only-export-components -> 'warn'), signup-page bos catch yorumu. 0 hata/13 uyari/exit 0. CALISAN ekran kodu degismedi. Commit 33cd25e. Kod HEAD = 33cd25e.

## Bu oturumda kilitlenen karar (detay: TASARIM-KARARLARI.md)
- Butce yapisi: kart = departman; faz = donemin kaba hali (varsayilan 3, inceltilebilir); giris = sakin liste, "ne zaman" her satirda, cogul donem dokun-isaretle (ayri buton yok), uyarlanir dokum; tam gorunum = nakit matrisi (2. yuzey).
- Alti arayuz ilkesi + bes veri kurali + yuvarlama sozlesmesi yazildi. Kritik: donemler tarihli; "ne zaman" iki eksen (ait-donem Faz 1, nakit-donem gerceklesen dilimi, override edilebilir).

## Acik Borc
- 5/5: React efekt hijyeni (toast.tsx). Schema.sql bayat (migration kaynak).

## Siradaki (yeni chat)
1. Dilim 2b: fn_open_budget + ongorulen okuma servisi (ilk blok), sonra fn_lock_budget + fn_match_receipt. fn_create_project kalibi (SECURITY DEFINER, atomik, Turkce hata, REVOKE/GRANT). Canli dogrulanir (UI testi yok).
2. stage_id/ait-donem gocu: ait-donem kaleme; bes katman disiplini (sema->RLS->trigger->servis->UI).
3. Sonra Dilim 3 (kart masasi + kalem tablosu - ONCE gorsel tasarim turu, frontend-design skill), 4 (icmal + gerceklesen + nakit matrisi + KDV doneme gore), 5 (eslesme + dogrudan odeme).
4. Acik tasarim: "hizli ekle" modu; "ne zaman" dokunulabilirligi.
- B9 oneri -> Dilim 5. B10 avans-cift-sayim -> Dilim 4.
- Film tipi sablon icerigi = Engin'in odevi (ayri seed).

## Kurallar (degismedi)
Tek-blok prompt, dil etiketi yok, git checkout/pull + BRANCH YASAK + push, fresh-clone dogrulama, supabase db push icin "kabul". Sormadan yeni dosya uretme.
