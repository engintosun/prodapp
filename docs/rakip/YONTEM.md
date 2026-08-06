# RAKIP ANALIZI — YONTEM VE CERCEVE

**Karar tarihi:** 6 Agustos 2026 | **Onay:** Engin

Bu dosya rakip analizinin CERCEVESIDIR. Bulgu tutmaz; bulgular urun basina
docs/rakip/<urun>.md dosyalarinda, karsilastirma docs/rakip/MATRIS.md'de yasar.

## 1. AMAC

Rakiplerin ne oldugunu, ne yaptigini, kime hitap ettigini, neyi one cikardigini
ve nerede geride kaldigini sabit bir izgara uzerinden gormek; KAAPA'yi
konumlandirmak; ogrenilecek / kacinilacak / eksik olan listelerini uretmek.

## 2. KANIT SEVIYELERI

Her bulgu satiri seviye etiketi tasir:
- **[A]** Urunu fiilen kullanmak / deneme hesabi / elde dosya
- **[B]** Resmi urun dokumani, yardim merkezi, fiyat sayfasi
- **[C]** Ucuncu taraf yazi, kiyas listesi, pazarlama metni

Kural: [C] tek basina karar gerekcesi olamaz. Bu alandaki kiyas yazilarinin
cogunu rakiplerin kendisi yayinlar.

## 3. IKI DOKTRIN KURALI

KAAPA'nin iki yapisi vardir — **butce** ve **harcama yonetimi**. Bir kopruyle
baglidir ama doktrinleri ayridir. Ikisi kendi icinde tutarli olmak zorundadir;
birbirinin ayni olmak zorunda DEGILDIR.

Izgaradaki karsiligi: B grubu butce doktrinine, C grubu harcama doktrinine
aittir; her iki gruba da uymayan boyutlarda (E, F, G) KAAPA gerekirse iki satir
tasir. Tek satir iki doktrini birbirine bulastirir.

## 4. IZGARANIN TURETILME BICIMI

Bu izgara uydurulmadi; KAAPA'nin kendi karar dosyalarinin baslik haritasi
cikarilip her karar icin "bu hangi boyutta yasiyor" sorusu sorularak TERSTEN
turetildi (6 Agustos 2026). Ev bulamayan kararlar yeni boyut acti.

Izgara SABITTIR. Boyut ekleme Engin karari ile ve tarih dusulerek yapilir;
eklendiginde o boyut icin yapilmis taramalar yeniden acilir.

## 5. GOZLENEBILIRLIK

Her boyut bir gozlenebilirlik etiketi tasir:
- **[G1] Disaridan gorulur** — urun, dokuman, fiyat sayfasi, deneme hesabi yeter
- **[G2] Kismen gorulur** — deneme hesabi + urun iddiasi birlikte, kesin degil
- **[G3] Gorulemez** — rakip icin doldurulamaz; YALNIZ KAAPA oz-degerlendirmesi

**Kural:** [G3] boyutlarda rakip sutunu BOS BIRAKILIR. Doldurma girisimi
pazarlama metnini bulguya cevirir.

## 6. BOYUT IZGARASI (42 boyut)

### A — KIMLIK VE PAZAR
1. Dongudeki yeri — ne yapiyor, hangi asamayi tutuyor [G1]
2. Kime hitap ediyor — rol · yapim turu · ulke · olcek [G1]
3. Is modeli ve fiyat [G1]
4. Yas, sahiplik, olcek / pazar konumu [G1]

### B — BUTCE DOKTRINI
5. Butce veri modeli — hesap plani · hiyerarsi · departman/kart ekseni · etap ekseni · transversal etiket (cost_object) [G1]
6. Kalem davranis motoru — alias/capraz-esleme · odeme statusu · miras · salt-okunur toplam [G2]
7. Sablon ve kutuphane mimarisi — sablon kitupligi · kalem kutuphanesi · kod doktrini [G1]
8. Versiyon, kilit, muhur, snapshot [G2]
9. Uyumluluk denetimi — hedef mecra / fon kurallari (Eurimages, Netflix, TRT, Bakanlik benzeri) [G2]

### C — HARCAMA DOKTRINI
10. Onay zinciri ve is akisi — durum gecisleri · kismi onay · reddet vs duzeltme iste [G1]
11. Donem ve kapanis disiplini — siki kapanis · pasif onay · istisna izlenebilirligi · asimetrik kapanis [G2]
12. Anomali ve kural motoru — sirket kurallari · capraz denetimler · esik uyarilari [G2]
13. Avans, kasa, limit [G1]
14. Ongoru→gerceklesen koprusu — PO · puantaj · maliyet raporu · EFC · hot cost [G1]

### D — HESAP VE MEVZUAT
15. Hesaplama motoru ve dogruluk rejimi — hesaplanan deger saklaniyor mu turetiliyor mu · yuvarlama sozlesmesi · ondalik rejimi [G3]
16. Mevzuat motoru ve guncellenebilirlik — kural degisince kod mu katalog mu degisiyor · yururluk donemi · geriye donuk hesaplarin korunmasi [G2]
17. Vergi ve yuk modeli — stopaj · KDV · tevkifat · fringe/isveren yuku [G1]
18. Yerellesme — para birimi · dil · e-fatura/e-devlet · yerel bordro mevzuati [G1]

### E — DENEYIM
19. Bilgi mimarisi, kabuk, gezinme [G1]
20. Giris hizi, klavye, tablo hissi [G1]
21. Duzenleme vs salt-bakis — iki ayri desen var mi [G1]
22. Bos durum, ogretme, ilk gun [G1]
23. Onboarding ve davet zinciri [G1]
24. Not ve iletisim katmani — ic not / kamu notu · mesajlasma · bildirim [G1]
25. Mobil ve saha [G1]

### F — YETKI VE VERI
26. Yetki ve gorunurluk modeli — DB erisimi ile UI gorunurlugu ayri mi · maskeleme [G2]
27. Coklu proje / kiraci izolasyonu [G2]
28. Uyelik yasam dongusu — davet · devre disi birakma · kalici silme [G2]
29. Guvenlik ve uyum — KVKK/GDPR · sertifikalar (TPN, ISO 27001) · yedekleme ve kurtarma [G2]
30. Veri sahipligi, tasinabilirlik, cikis [G1]

### G — MUHENDISLIK
31. Mimari — masaustu/bulut · dosya/DB · cevrimdisi · gercek zamanli ortak calisma [G1]
32. Denetlenebilirlik ve iz — degisiklik izi · eski/yeni diff · silinemezlik [G2]
33. Hata rejimi — sessiz hata var mi, hata nasil yuzeye cikiyor [G3]
34. Test, surum ve olgunluk — surum sikligi · kirilma gecmisi · geriye uyum [G3]
35. Entropi korumasi — isimlendirme disiplini · drift denetimi · teknik borc butcesi · dokuman-kod senkronu [G3]
36. Genisletilebilirlik ve alan modeli — API · eklenti/otomasyon · sema kullaniciya acik mi [G1]
37. Olcek davranisi — satir sayisi · kullanici sayisi · performans [G2]
38. Dagitim, ortam, sir yonetimi [G3]

### H — EKOSISTEM
39. Ice/disa aktarim ve kilitlenme — hangi formatlar, cikis var mi [G1]
40. Entegrasyonlar — bordro · muhasebe · banka · takvim [G1]
41. Destek, egitim, sablon ekosistemi — akademi · sablon kitupligi · topluluk [G1]
42. Yapay zeka kullanimi — OCR/fis tanima · senaryo analizi · tahmin [G1]

### I — HER BOYUTTA KAAPA (her boyut satirinin altina)
- Bizde var mi, nasil
- Ogrenilecek
- Kacinilacak
- Bosluk (bizde eksik)

## 7. RAKIP LISTESI VE ONCELIK

| Oncelik | Kim |
|---|---|
| 1 | CineCost · Wovie (Workcube) · Saturation |
| 2 | Showbiz · MMB · EP SmartAccounting · PSL+ |
| 3 | Hot Budget · Yamdu (yapildi) · Periscope Apps |
| 4 | Wrapbook · GreenSlate · Gorilla · Celtx · SetHero |
| 5 | Eclipse · PMI · Octopus · Miss Money Penny · MediaWeb (UK/Avrupa muhasebe ailesi) |
| TR masraf ekseni | Masraff · Bizigo · Logo Isbasi · Masraf.AI · Manim |

**Listeden cikarilan:** Croogloo — dagitim/ofis urunu (call sheet, sides, ekip
zaman raporu, TPN sertifikali). Butce ve muhasebe modulu yok.

## 8. FAZ PLANI

- **Faz 0** — Cerceve (bu dosya). TAMAM.
- **Faz 1** — KAAPA tabani (prodapp + v8'den amac/vizyon/kapsam). TAMAM.
- **Faz 2** — Tarama. Oturum basina 3-4 urunluk parti. Ilk parti: CineCost · Wovie · Saturation.
- **Faz 3** — Bosluk, konumlandirma, kararlar.

**Urun ne iddia ediyor cumlesi Faz 3'te kurulur.** Tarama bitmeden tez yazilmaz
(Engin karari, 6 Agustos 2026).

## 9. TAZELEME KURALI

Her urun dosyasi ve MATRIS bir FOTOGRAFTIR; ust satirinda inceleme tarihi ve
kanit seviyesi tasir. Alti aydan eski bir kayit karar gerekcesi olarak
kullanilmadan once tazelenir.

## 10. ADRES HARITASI — dagilmis mevcut bulgular

Bulgular tasinmaz, adresleri burada tutulur:

- docs/RAKIP-ANALIZI-URUN.md — Yamdu turu (urun ekseni)
- docs/RAKIP-ANALIZI-OCR.md — 12 firma (7 global + 5 TR), OCR/confidence ekseni
- docs/butce/KART-GEREKCELERI.md — MMB / Saturation / Showbiz / Hot Budget kart ve kalem yapisi
- docs/butce/BUTCE-ARASTIRMA-DURUM.md — rakip taramasi notlari
- docs/butce/KART-KATALOGU.md — hesap plani karsilastirmasi
- docs/butce/BUTCE-SEMA-KARARLARI.md — cost_object / tag karsilastirmasi
