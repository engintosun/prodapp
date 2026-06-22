# KAAPA Butce Sablon & Kalem Arastirmasi - DURUM
> Arastirma durumu. KART 1100/1300/1400/1500/1600 KILITLENDI -> docs/butce/KART-KATALOGU.md (tek kaynak). Asagisi: kapanan oneriler isaretli + kalan acik arastirma.

## Yapilan
- 18 uluslararasi/yerel kaynak parse edildi: AICP (reklam, 326) - MMB template (feature, 457 kalem/42 hesap) - Eurimages classification (Avrupa, 462) + FinalCost + Audit - AFI (229) - California (40 hesap) - 15 Saturation JSON (feature/short/doc/music/post/photo + netflix/hbo/disney/bbc/cbc/bet/discovery/screen_australia/georgia) - 2 gercek Turk butcesi (Bodrum Terzisi=dizi, Cakircali=film).
- MASTER KALEM LISTESI uretildi: 8500 ham -> 4746 tekil (yazim tekrarlari elendi). Dosya Engin'de (kaapa-MASTER-kalem-listesi.xlsx); repoya degil, yeni chat'e tasinacak.

## Oneriler - KABUL EDILDI / KILITLENDI (-> docs/butce/KART-KATALOGU.md)
- IKI KATMAN: Sablon (yalin, kart basina ~10-20 temel kalem) + Kutuphane (4746, karta etiketli, A-Z autocomplete). Sablona girmeyen kalem silinmez, kutuphanede yasar.
- DERINLIK: 2 para-seviyesi (Kart -> Kalem). 3. katman yok. Model/aksesuar detayi = satir notu / yeni satir / autocomplete.
- KART = departman = onay birimi. Ust-grup = gorsel/raporlama katmani (ayri eksen).
- EKIP+EKIPMAN kurali: departmana-ozel ekipman departman kartinda (beraber); paylasilan/genel kaynak kendi kartinda (genel arac Nakliye, yemek Konaklama/Yemek). MMB + Eurimages bunu teyit etti.
- "Harcama Grubu" = kart icin hazir Turkce terim (iki Turk butcesinde de ayni).

## Onerilen kart listesi (ust-grup -> kart) - 1100/1300/1400/1500/1600 KILITLENDI (KART-KATALOGU.md bolum 7); kalan kartlar TASLAK (siradaki: 1700+, Teknik/Sanat/Post/operasyonel)
- GELISTIRME & HAKLAR: Senaryo & Hikaye - Yapimci/Yonetmen
- OYUNCU: Ana Kast - Kast Ekibi
- YAPIM/REJI: Produksiyon/Reji Ekibi
- TEKNIK: Kamera - Isik - Grip - Ses (her biri ekip+ekipman)
- SANAT: Set Dizayn/Yapim - Set Grubu (Aksesuar/Giydirme) - Kostum/Sac&Makyaj
- EFEKT: Efekt & Dublor
- MEKAN & LOJISTIK: Mekan - Nakliye - Konaklama/Yemek
- POST: Kurgu - Muzik - VFX - Ses Post (ya da tek Post)
- IDARI & GENEL: Muhasebe/Idari - Sigorta & Hukuk - Finansman & Tanitim

## Acik kararlar (kalan)
> COZULDU #1: Senaryo/Yapimci/Yonetmen ayri kartlar -> 1100/1300/1400/1500 (KART-KATALOGU.md bolum 7).
1. Post -> 4 kart mi tek "Post" mi (Post kartlari henuz kilitli degil)
2. Efekt&Dublor -> ayri kart mi Teknik altinda mi (Dublor 1600'de kalem; ayri Efekt karti acik)
3. Master listede isaretleme (S=sablon / X=sil / bos=kutuphane) yapilmadi
4. Kart-basi temel kalem + Turkce: 1100/1300/1400/1500/1600 yapildi; kalan kartlar acik

## 2026 yeni-nesil ihtiyaclar (kaynaklarda YOK, KAAPA eklemeli)
Yapay zeka operatoru / AI workflow - virtual production / sanal set / LED volume - dijital teslim (sosyal versiyon, dikey/kare reformat, cok-platform) - DIT/data wrangler one cikarma - intimacy coordinator - surdurulebilirlik.

## Sonraki sira
Kartlari kilitle -> master listede isaretle (S/X) -> kart-basi kalem + Turkce -> 2026 kalemleri ekle -> seed migration (S=yalin sablon, bos=kutuphane; provenance korunur) -> produksiyona ozel template'ler (film -> dizi=film+bolum -> reklam=AICP -> belgesel -> dijital).

## Faz 1 bekleyen (kod)
Gorev sirasi tek kaynak: docs/IS-SIRASI.md. (fn_open_budget KILITLENDI 06-21: department_code->id + is_undated cozuldu; siradaki fn_lock_budget / fn_match_receipt / kart-masasi UI.)

## Onceki yanlis iddialarin duzeltmesi
- MMB = 457 kalem (lean degil; Eurimages 462 ile ayni kapsam). Daha once "269" yanlisti.
- Uzun kuyruk "cogu Disney" DEGIL: discovery 487, bet 415, bbc 379, Eurimages 371, disney 333, MMB 274... tum kaynaklara yayili gercek cesitlilik.
