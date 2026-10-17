# Kart Yapısı Taraması — 1600 Sonrası Kartlar

**İnceleme tarihi:** 14 ve 16 Ekim 2026 · **Kanıt seviyeleri:** `docs/rakip/YONTEM.md` §2 ([A] elde dosya, [B] resmi doküman, [C] üçüncü taraf) · **Izgara boyutu:** 5 (bütçe veri modeli) ve 7 (şablon ve kütüphane mimarisi).

Bu dosya bir fotoğraftır (YONTEM §9): altı aydan eski bulgu, karar gerekçesi olarak kullanılmadan önce tazelenir. Karar evi: `docs/butce/KART-KATALOGU.md` (§3 genel kart düzeni, §7.6 KART 2100); gerekçe `docs/butce/KART-GEREKCELERI.md`. Seyahatin yerine bakan tarama `docs/rakip/GIDER-CESIDI-TARAMASI.md` §3.15'tedir.

## 1. Soru

Yaratıcı kadro kartları (1100–1600) kilitlendi. Geri kalan bütçe hangi kartlara bölünür; kaynaklar nerede uzlaşıyor, nerede ayrışıyor?

## 2. Kaynaklar

- [A] repoda dosyayla okundu: MMB 6.1 örnek hesap planı (`docs/butce/MMB-6.1-ornek-hesap-plani.pdf`), Telefilm Standard Production Budget (`docs/butce/Telefilm-standard-production-budget.xlsx`), Screen Australia A-Z Feature Budget (`docs/butce/ScreenAustralia-A-Z-feature-budget.xlsx`), Eurimages Summary Production Budget 2018 REV3 (`docs/butce/Eurimages-summary-production-budget-2018-REV3.xlsx`), CNC devis cinéma 2018 (`docs/butce/CNC-devis-cinema-2018-5-chiffres.pdf`), BFI Future Takes (`docs/butce/BFI-future-takes-production-budget.xlsx`), AICP Bid Form (`docs/butce/AICP-bid-form.xlsm`, reklam), Koster damıtımı (`docs/butce/KAAPA_damitim_Koster_TUM-BOLUMLER.md`), Master Excel (`docs/butce/kaapa-MASTER-kalem-DUZENLI.xlsx`; 17 departman sayfası, 4746 kalem), Sinema Televizyon Sendikası Çalışma İlkeleri (`docs/butce/Guncel-Calisma-Ilkeleri-Sinema-Televizyon-Sendikasi-10-Ekim-2024.pdf`).
- [B] web: Saturation "Indie Film" şablon sayfası (https://saturation.io/templates/indie-film), MYK meslek haritası (https://stvs.org.tr/myk/meslek-haritasi/), Wrapbook hesap planı yardım sayfası ve StudioBinder ücretsiz bütçe şablonu yazısı (bu ikisinin adresi 14 Ekim turunda kaydedilmedi).
- Saturation'ın 15 şablonu yalnız Master Excel'e birleştirilmiş hâlde duruyor; özgün dışa aktarımlar repoda yok, bu yüzden şablonların bölüm bilgisi okunamıyor.
- Türk bütçeleri (Bodrum Terzisi, Çakırcalı; `docs/butce/BUTCE-ARASTIRMA-DURUM.md` dosyasında "parse edildi" diye geçiyor) repoda yok. Türkiye'deki departman ayrımı Engin'in saha bilgisinden ve §7'deki iki Türkiye kaynağından gelir.

## 3. Matris (departman × kaynak)

Satırların çoğu 14 Ekim 2026 taramasıdır ve bu dilimde yeniden doğrulanmadı. 16 Ekim 2026'da bütün kaynaklarda yeniden okunan satırlar: yapım ekibi, reji ekibi, set operasyonları, yapım ofisi. Saturation sütunu yalnız indie şablon sayfasından gelir; öteki şablonların satır adları Master Excel'de var ama bölümleri okunamıyor (§2).

| Departman | MMB 6.1 | Telefilm | Screen Australia | Eurimages | CNC | BFI | Saturation (indie) | AICP (reklam) | Koster damıtımı / KAAPA kaydı |
|---|---|---|---|---|---|---|---|---|---|
| Yapım ekibi | 2100 Production Staff: yapım müdürü, reji asistanları, koordinatör, script supervisor, yapım muhasebecisi, lokasyon müdürü (2101–2120); aynı hesapta 2123 Safety Officers, 2124 Production Board/Budget, 2125 Office Expenses | 12 Production labour (12.01–12.95): aynı kapsam; ayrıca 12.61 Sustainability/Green Advisor, 12.70 Craft Service/Caterer, 12.85 Health & Safety Coordinator | C Unit Fees & Salaries (bütün ekip tek bölümde, alt bölümlerle): C.1 Production Management, C.2 Production Accountancy | 4.1 Production crew: line producer, production manager, coordinator, assistants, secretary, unit manager, runners, trainees, budget controller, accountant, cashier | 23 Équipe préparation et tournage: 231 yönetim ve idare, 232 régie, 233 reji teknisyenleri (2333–2334 reji asistanları, 2337 scripte); 2314 yapım muhasebesi | 5 Production: 5.1 line producer, 5.2 production manager, 5.3 coordinator, 5.4 assistant, 5.5 runner, 5.6 location manager, 5.7 script supervisor | ? | A/B Crew (aşamaya göre; 33 Safety Officer, 40 Medic, 44 Welfare/Teacher de ekipte) | 2100-01 Yapım Ekibi (16 Ekim 2026); iş sağlığı ve güvenliği Set Operasyonlarına, yapım ofisi genel giderlerin kartına (15 Ekim 2026) |
| Reji ekibi (yardımcı yönetmenler) | 2100 içinde | 12 içinde | C içinde ayrı alt bölüm: C.3 Asst. Directors & Script Supervision | **4.2 Direction crew, ayrı:** assistant directors, 2nd unit director, script supervisor, storyboard, researcher, consultants, casting manager, direction trainee | 23 içinde (233) | **6 Assistant Directors, ayrı** (6.1–6.5); script supervisor 5.7'de, yapımda | ? | A/B içinde | 2100 içinde ayrı grup: 2100-02 Reji Ekibi (16 Ekim 2026); Crowd AD 2105'in eş adı |
| Sanat yönetimi | 2200 Art Direction | 13 Art labour + 36 Art supplies | H.1 Sets & Properties | 4.3 Studio, set design and construction | 24 Équipe décoration | 10 Production design (tek) | **Art department tek** (tasarım, art direction, dekorasyon, aksesuar) | G Labor + H Expenses | Öneri: 4 karta böl (kabul/itiraz sorusu cevapsız) |
| Dekor inşa | 2300 Set Construction | 14 Construction labour + 35 materials | H.1 içinde | 4.3 içinde | 25 Main-d'œuvre + 53 Aménagements | 10 içinde | Art içinde | G/H içinde | |
| Set dekorasyonu | 2400 Set Decoration | 15 Set dressing labour + 37 | H.2 Props & Set Dressing | 4.5 Property | 54 Meubles et accessoires | 10 içinde | Art içinde | G/H içinde | |
| Aksesuar | 2500 Property | 16 Props labour + 38 | H.2 içinde; H.3 Action Props & Vehicles ayrı | 4.5 içinde | 54 içinde | 10 içinde | Art içinde | E Props, Wardrobe & Animals | KAAPA taslağı (Haziran): "Set Dizayn/Yapım" + "Set Grubu (Aksesuar/Giydirme)" |
| Kostüm | 3300 Wardrobe | 19 labour + 41 supplies | F.1 Costumes | 4.7 (makyajla birlikte) | 58 Costumes | 11 Costume | Costume & wardrobe | E içinde | Ayrı kart |
| Saç ve makyaj | 3400 Makeup & Hair | 20 labour + 42 supplies | F.2 Make-up & Hairdressing | 4.7 (kostümle birlikte) | 59 Maquillage et coiffure | 12 Hair and make up | Hair & makeup (ayrı) | — | Ayrı kart |
| Kamera | 2600 Camera | 22 labour + 45 equipment | K.1 Equipment (ekip C'de) | 4.8 Camera & Raw stocks | 71 + 72 (ekip 23'te) | 7 Camera | Camera | I Equipment Rental (hepsi) | Ayrı |
| Işık | 2700 Electric | 23 + 46 | K.3 Lighting | 4.9 Light & Electrical | 74 Éclairage | 8 Lighting | **Lighting & grip birlikte** | I içinde | Electric ile Grip "ikiz, sınır temiz" |
| Grip | 2800 Grip | 24 + 47 | K.4 Grips | 4.10 Grip | 73 Machinerie | — (ayrı bölüm yok) | Lighting & grip içinde | I içinde | Ayrı |
| Set sesi | 2900 Production Sound | 25 + 48 | K.2 Sound | 4.11 Sound | 75 Son | 9 Sound | ? | I içinde | Telsiz: Ses ya da Set Operasyonları |
| Mekanik efekt (+ dublör mekaniği) | 3000 Mechanical Effects | 17 labour + 39 | H.5 Special Effects & Armoury | 4.6 Special effects & Stunts | 57 Effets spéciaux et cascades | — | ? | — | 3000 ile 3100 ayrı; dublör aracı Ulaşım'a (KART-KATALOGU §7.5) |
| Çekimde görsel efekt | 3100 Special Visual Effects | 67 (post) | H.6 VFX shoot only | 6.4 VFX (post) | 84 (post) | — | ? | X | Çoğu post'a kayar |
| Set operasyonları / genel set gideri | 3200 Set Operations: 3204 Craft Service, 3205 First Aid, 3206 Set Security, 3207 Set Firemen, 3208 Office Expenses | 32 Unit expenses: 32.25 First aid/Health & Safety supplies, 32.26 On Set Medic, 32.28 Pay Duty Officers/Traffic Control | K.5 Unit Facilities, K.6 Safety (malzeme); sağlık ve güvenlik ekibi C.17'de | 4.13 Other prod. expenses (stajyer, çekim dışı sağlık ve güvenlik, sağlık muayenesi); sette sağlık ve güvenlik 4.4'te | 69 Régie et divers; doktor ve hemşire 282'de (28 Divers), bekçilik 5154 ve 5222'de | — (sağlık ve güvenlik 13.7, Locations içinde) | ? | K Misc Production | Koster: Set Operations, KAAPA'nın "Genel Giderler" kartının karşılığı (devirdeki beş kartlık dağılım, damıtım satır 478); medic birden çok kartta (2311 ve 3205). KAAPA: Set Operasyonları kartı, içinde Sağlık ve Güvenlik başlığı (15 ve 16 Ekim 2026); yeri başka karta gidenler konuşulurken kesinleşir (Engin, 16 Ekim 2026) |
| Lokasyon | 3500 Location (yol, otel, yemek, catering dahil) | 30 Location office + 31 Location expenses | G.1 Locations | 4.4 Location Dept. | 52 Décors naturels | 13 Locations | Locations (catering dahil) | D Location Expenses | KAAPA ikiye böler: Lokasyon + Seyahat ve Konaklama |
| Ulaşım | 3600 Transportation | 26 labour + 34 Transportation | M Travel & Transport | 4.12 (seyahatle birlikte) | 56 Moyens de transport + 62x | 14 Travel and transport | Transportation | C/D içinde | Tek kart; Picture/Production/Personnel/Self-Drive; oyun aracı tartışmalı |
| Seyahat ve konaklama (ekip) | 3500 içinde | 33 Travel & Living | M + N | 4.12 | 61–66 | 14 + 15 | ? | C/D içinde | Ayrı kart (KART-KATALOGU §3); seyahatin yeri `docs/rakip/GIDER-CESIDI-TARAMASI.md` §3.15, icmal sorusu ertelendi (`docs/EKRAN-MUHASEBE.md` §19) |
| Set yemeği | 3506 Caterer (Lokasyon) | 32 Unit expenses | N Accommodation, Living & Catering | 4.12 / 4.13 | 63/64 Repas collectifs | 15 içinde? | Locations içinde | D içinde | Park: kuran kartın turunda (KART-KATALOGU §8) |
| Stüdyo | 3800 Studio Facilities | 29 Studio expenses | G.2 Stage Rentals | 4.3 içinde | 51 Studio | — | ? | F Studio Costs | |
| Yapım ofisi | 2125 Office Expenses (2100 içinde); Set Operations içinde ayrıca 3208 Office Expenses | 28 Production office; çekim yerinde 30 Location office | P Office Expenses | 7.1 Administrative (production office rentals and costs); sette ofis 4.4'te | 68 Bureaux et frais afférents; stüdyoda 5127 Bureaux | — | ? | — | Koster: ofis, devirde Genel Giderler kartına verilmiş (damıtım satır 66). KAAPA: genel giderlerin kartı (15 Ekim 2026; kartın adı ve yeri kendi turunda); birim ofis aileleri 1105, 1310, 1409, 1507 |
| Medya, lab, DIT | 4000 Film & Lab | 50 Video stock + 51 Lab | ? | 4.8 içinde (kamera ile) | 76 Pellicules et supports | — | ? | J Media | Dijitalde medya + DIT/data |
| Hayvan | 2508 (Aksesuar içinde) | 18 labour + 40 Animals (ayrı) | H.4 Livestock (ayrı) | 3.4 içinde (talent) | 55 Animaux (ayrı) | — | ? | E içinde | Ayrı kart, kabul 6 Ekim 2026 |
| İkinci ekip | 4200 Second Unit | 49 Second unit | Q.1 Offshore shoot (ayrı ünite) | — | — | — | ? | — | Koster: aynalı mini bütçe (alt ünite) |
| Testler | 4100 Tests | — | E(b)1 (cast) | — | 511 Essais | — | ? | — | Deneme çekimi 1610; teknik testler kendi kartında (KART-KATALOGU §7.5) |
| Kurgu ve görüntü post | 5100 Editing + 5200 Lab + 5700 Video | 60–62, 64 | R crew + U.1 Image post | 6.1, 6.2, 6.5, 6.6 | 81, 82, 83 | 16 Post picture | ? | Q, T, W | Taslak: 4 kart mı tek Post mu, açık |
| Post ses | 5300 | 63, 65 | V | 6.7 | 81 içinde | 17 Post sound | ? | S Audio | |
| Müzik | 5400 | 66 | W | 6.3 | 14 + 37 + 38 | 18 Music | ? | — | |
| Post VFX | 5600 Opticals | 67 | U.2 Digital VFX | 6.4 | 84 | — | ? | X | |
| Jenerik, teslim, sürüm | 5500 Titles | 67, 68 Versioning | X.2 Delivery | 6.9 | 85, 86, 87 | — | ? | R Social Versions | |
| Sigorta | 6100 Insurance | 71 General içinde | O Insurances | 7.2 Insurance & legal | 91 Assurances | 21 Insurance | ? | — | Koster: sigorta yüzde satırı (oran × baz); KART-KATALOGU §8 yüzde satırları |
| Hukuk | 6200 Legal | 71 içinde | Y Legal & Business | 7.2 içinde | 93 Frais juridiques | 20 Misc içinde | ? | — | 1308'in onay köprüsü hedefi |
| Finansman | — | 72 Indirect | Y içinde | 7.4, 7.5 | 94 Frais financiers | 20 içinde | ? | — | |
| Tanıtım, pazarlama, dağıtım | 6300 Publicity | 70 Unit publicity | X.1 Publicity & stills | 7.6 Marketing & promotion | 92 Publicité | 19 Publicity | ? | — | Koster: yalnız yapım tarafı; KAAPA 3 Ekim 2026: film son dönemi Dağıtım ve Pazarlama, 1508-05 buraya |
| Muhtelif / genel gider | 6400 Misc | 71, 72 | Z Overheads | 7.7, 8.1 Overheads | 9x | 20 Misc | ? | O Other | Genel gider dip yüzde satırı (5 Ekim 2026); her kartın serbest kalemi x98 |

## 4. Yazılımlar

- Movie Magic, Showbiz, Hot Budget: kart yapısını şablon belirler (MMB tipi ya da AICP); yazılım kendi departman listesini dayatmıyor.
- Saturation indie şablonu [B]: sanat tek bölüm; kamera ayrı; ışık ve grip birlikte; kostüm ile saç-makyaj ayrı; lokasyon (catering dahil) ve ulaşım ayrı. 34'ten fazla şablon var; büyük stüdyo şablonları ayrı ayrı (Master Excel'deki 15 dışa aktarımda bölüm bilgisi yok).
- Wrapbook [B]: varsayılan hesap planı yok; proje kendi planını içe aktarır ya da elle kurar; ATL, BTL ve Post aralıkları.
- StudioBinder [B]: dört üst grup (ATL, Production, Post, Other); departman listesi yazıda yok.
- Yamdu: bütçe Showbiz üzerinden; kendi modülü beta.

## 5. Okuma

- Uzlaşı (altı ya da daha çok kaynak aynı): Kamera, Işık, Grip ve Set Sesi ayrı; Kostüm ile Saç-Makyaj ayrı; Lokasyon ile Ulaşım ayrı; Müzik ayrı; Post Ses ayrı; Tanıtım ayrı; Sigorta ayrı bir yerde.
- Ayrışma: yapım ekibi ile reji ekibi (Eurimages ve BFI ayrı; MMB, Telefilm, CNC ve Screen Australia tek; KAAPA tek kart iki grup, 16 Ekim 2026); sanat (MMB ve Telefilm 4, Eurimages ve Screen Australia 2, BFI ve Saturation 1); post (BFI 3, KAAPA taslağı 4, MMB ve Telefilm 9 hesap); medya ve lab (kamerayla mı, ayrı mı); sigorta (kart mı, dip yüzde mi); ikinci ekip (kart mı, alt ünite mi); yapım ofisinin yeri (KAAPA genel giderlerin kartı, 15 Ekim 2026) ve set yemeğinin yeri (park).
- Sağlık ve güvenlik (16 Ekim 2026, bütün kaynaklar): MMB üç yere dağıtır (2123 Safety Officers yapım ekibinde, 2311 First Aid dekor inşada, 3205–3207 set operasyonlarında). Telefilm koordinatörü yapım ekibinde (12.85), malzemeyi ve sağlık görevlisini birim giderlerinde (32.25, 32.26) tutar. Screen Australia ekibi C.17 Occupational Health & Safety Crew'da, malzemeyi ve sağlık giderini K.6 Safety'de tutar. Eurimages setteki sağlık ve güvenlik danışmanını, paramediği, hemşire ve doktoru, güvenliği, polis ve itfaiyeyi lokasyon departmanının kalemleri arasında sayar (4.4 Location Dept.); çekim dışındaki sağlık ve güvenlik gideri ile sağlık muayenesi 4.13'tedir. BFI'da "Health & Safety" Locations bölümünde tek satırdır (13.7). CNC doktoru ve hemşireyi veterinerle birlikte 282'de (28 Divers), bekçiliği stüdyo ve lokasyon giderlerinde (5154, 5222) tutar. AICP güvenlik görevlisini ve medic'i ekipte (A/B 33, 40), set güvenliğini D'de (117) tutar. Saturation şablonlarında medic satırları var (netflix SET MEDIC ve CONSTRUCTION MEDIC, discovery Studio/Set Medic, hbo FIRST AID/NURSE, disney STANDBY AMBULANCE/FIRETRUCK, bbc Health & Safety Advisor), bölümleri okunamıyor. Okuma: sekiz kaynağın hiçbiri sağlık ve güvenliği tek bölümde toplamıyor; Screen Australia, Telefilm ve AICP kişiyi ekipte, malzemeyi giderde tutar; Eurimages ve BFI lokasyona koyar. KAAPA: Set Operasyonları kartında Sağlık ve Güvenlik başlığı, dekor inşanın ilk yardımcısı Dekor İnşa kartında (KART-KATALOGU §3, 15 ve 16 Ekim 2026); yeri başka karta gidenler konuşulurken kesinleşir (Engin, 16 Ekim 2026).
- Çocuk oyuncunun refahı (16 Ekim 2026, bütün kaynaklar): MMB 1615 Welfare Worker/Teacher (1600 Talent) ve 3905 Welfare Workers/Teachers (3900 Atmosphere); Telefilm 11.80 Tutor(s), 11.81 Children's Coordinator, 11.82 Guardians/Chaperones (11 Background performers); Eurimages Teacher/Chaperon/Nanny (3.4 Other talents expenses); BFI 4.7 Chaperone (4 Cast); Screen Australia C.18 Tuition & Technical Advisers içinde Tutor (cast), Childcare, Chaperone(s); CNC 2345 Responsable des enfants / précepteur (234 uzmanlar); AICP ekipte 44 Welfare/Teacher. Okuma: hiçbir kaynak çocuğun refahını sağlık ve güvenlikte tutmuyor; dördü oyuncu bölümünde, ikisi uzman ve danışmanlarda, AICP ekipte tutar. KAAPA: 1615 Set Öğretmeni ve Psikolog/Pedagog Oyuncu kartında, KART 1600 (Psikolog/Pedagog 16 Ekim 2026, KART-KATALOGU §7.5).

## 6. Yapı farkı: departman mı, emek ve malzeme mi

- Departman başına emek, ekipman ve malzeme bir arada: MMB 6.1, Eurimages (4.x), BFI, Saturation indie.
- Emek ile malzeme ve ekipman ayrı bölümlerde: Telefilm (12–26 emek, 35–48 malzeme ve ekipman), CNC (2 Personnel; 5 ve 7 malzeme ve ekipman), Screen Australia (C bütün ekip ücreti, K ekipman), AICP (A/B ekip; C/D/H/I giderler).
- KAAPA kararı (Haziran 2026, `docs/butce/BUTCE-ARASTIRMA-DURUM.md` "EKIP+EKIPMAN kurali"): departmana özel ekipman departman kartında, ekiple birlikte; MMB ve Eurimages ile aynı model. Emek ve malzeme düzenini isteyen kurum çıktısı doğa ekseninden (İşçilik ve ötekiler) beslenir.

## 7. Türkiye kaynakları (16 Ekim 2026)

- **MYK meslek haritası** [B] (https://stvs.org.tr/myk/meslek-haritasi/, 16 Ekim 2026'da okundu). Sayfada tarih yok; dosya yollarında yıl var: film haritasının görseli 2020/04, ayrıntılı PDF'i 2021/04, TV-radyo görseli 2018/11. Ayrıntılı PDF okunmadı. Film haritasının kapsamı uzun ve kısa metraj, dizi, belgesel, reklam, klip ve animasyondur.
  - Yapım-Yönetim grubu, yapım: Yapımcı, Uygulayıcı Yapımcı, Denetçi Yapımcı, Prodüksiyon (Yapım) Amiri, Prodüksiyon (Yapım) Asistanı, Mekân Sorumlusu, Kast Yönetmeni, Kast Yönetmen Yardımcısı.
  - Yapım-Yönetim grubu, yönetim: Yönetmen, Birinci Yönetmen Yardımcısı, İkinci Yönetmen Yardımcısı, Üçüncü Yönetmen Yardımcısı (Şef Asistan), Devamlılık Asistanı, Time Code Asistanı, Oyuncu Koçu.
  - Öteki gruplar: Kamera Önü (Oyuncu, Figüran, Dublör, Seslendirme Oyuncusu), Yazım, Tasarım (Sanat Yönetimi, Kostüm Tasarımı, Saç-Makyaj), Kamera-Işık-Ses (Kamera, Set (Grip), Işık, Ses), Özel Efekt, Post Prodüksiyon. Set Asistanı, Set (Grip) alt grubundadır. Harita "Figüran" der; KAAPA'da 13 Ekim 2026'dan beri arkaplan oyuncusu denir.
  - TV-radyo haritasının yapım alt grubunda Yapım Koordinatörü ve Yapım Amiri (TV-Radyo) geçer; film haritasında Yapım Koordinatörü ve Yapım Müdürü yok.
  - Okuma: harita meslekleri örgütte durdukları yere göre gruplar (Kast Yönetmeni Yapım grubundadır), bütçe kullanana göre. Kart kararı haritadan çıkmaz, Türkçe ad haritadan alınır (KART-KATALOGU §7.6 ADLAR). Kalan kartların ad turunda Tasarım, Kamera-Işık-Ses, Özel Efekt ve Post Prodüksiyon grupları aynı işi görür.
- **Sinema Televizyon Sendikası Çalışma İlkeleri** [A] (`docs/butce/Guncel-Calisma-Ilkeleri-Sinema-Televizyon-Sendikasi-10-Ekim-2024.pdf`, Ekim 2024). Kart yapısına dokunan hükümler: 4a (proje bazlı çalışan 4A üzerinden sigortalanır), 19.12a ve 1b (yolculuk günü; kurallar şehir içi ve şehir dışı için aynı), 5b ve 5d (iş güvenliği uzmanı ve işyeri hekimi), 20 (Çevre Duyarlılığı ve Yeşil Setler). Kaynaklardan biridir, ana kaynak değildir (Engin, 15 Ekim 2026). Kullanıldığı yerler: KART-KATALOGU §3 ve §7.6, KART-GEREKCELERI KART 2100.

## 8. CNC 234 uzmanları [A]

`docs/butce/CNC-devis-cinema-2018-5-chiffres.pdf`, 234 Conseillers spécialisés: 2341 Animatronicien · 2342 Effets spéciaux (23421 conseiller, 23422 assistant, 23423 autre personnel) · 2343 Conseillers divers (23431 story-boardeur) · 2344 Répétiteur · 2345 Responsable des enfants / précepteur · 2346 Superviseur d'effets physiques · 2347 Assistant effets physiques · 2348 Chorégraphe · 2349 Armes (23491 maître d'armes / armurier) · 234A Animaux (234A1 conseiller équestre / palefrenier, 234A2 dompteur) · 234B Documentation (234B1 documentaliste) · 234C Conseil historique et scientifique (234C1 historique, 234C2 scientifique) · 234Y renfort · 234Z heures supplémentaires. Teknik danışman bu blokta değil, reji teknisyenleri arasındadır (2332 Conseiller technique à la réalisation).

KAAPA'daki yerleri: `docs/butce/KART-GEREKCELERI.md` KART 2100, "Uzmanlar kullanana göre dağılır" (koreograf, oyuncu çalıştırıcı, storyboard, çocuk sorumlusu, özel efekt danışmanı, at danışmanı, hayvan terbiyecisi, silah ustası, teknik danışman). Yeri konuşulmayanlar: animatronik (2341), fiziksel efekt süpervizörü ve asistanı (2346, 2347), belgeleme (234B), tarih ve bilim danışmanı (234C).

Öbür kaynaklarda uzman ve danışmanların yeri: Screen Australia ekip bölümünde ayrı alt bölüm açar (C.18 Tuition & Technical Advisers: silah, dans, koreograf, müzik, oyuncu öğretmeni, erişim koordinatörü, çocuk bakımı, refakatçi); Telefilm yapım ekibinde tek satır (12.62 Advisor(s), e.g. Technical, EDI, Accessibility, Community); MMB yapım ekibinde (2109 Technical Advisor); Eurimages reji ekibinde (4.2 Consultants).

## 9. Okunmamış kaynaklar (16 Ekim 2026)

Engin'in 16 Ekim 2026'da verdiği 31 bağlantı. Hiçbiri okunmadı; okumanın ve bulguları repoya getirmenin maliyeti ayrıca konuşulacak (Engin, 16 Ekim 2026). Adresler verildiği gibidir, yalnız izleme eki (utm_source) çıkarıldı. Gruplama adrese göredir, içeriğe göre değil.

- ABD, üniversite, ders ve örnek bütçe:
  - https://www.wabash.edu/news/docs/ROFL-PROPOSAL-FINAL.pdf
  - https://surface.syr.edu/record/9254
  - https://www.regent.edu/acad/schcom/academics/departments/film_tv/documents/ProductionManual2019/PDFs/PreProdBudget.pdf
  - https://lisacookfilm.wordpress.com/wp-content/uploads/2011/12/budgeting.pdf
  - https://www.scribd.com/document/1058614981/Sample-Film-Budget
  - https://www.adrianpegg.com/templates
- ABD, mahkeme kararı ve SEC belgeleri:
  - https://law.justia.com/cases/federal/district-courts/FSupp/662/798/1392826/
  - https://www.sec.gov/Archives/edgar/data/929351/000092935112000007/summitcreditagreementexhib.htm
  - https://www.sec.gov/Archives/edgar/data/929351/000095012310010448/v55046exv10w72.htm
  - https://www.sec.gov/Archives/edgar/data/2027083/000167025424000708/document_3.pdf
  - https://www.sec.gov/Archives/edgar/data/1934804/000193480423000001/Exhibit_A.pdf
- ABD, vergi ve bordro:
  - https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2023/kpmg-film-tv-tax-guide-united-states-2019.pdf
  - https://www.castandcrew.com/wp-content/uploads/2018/05/LARS47_6007.pdf
- Movie Magic kılavuzları:
  - https://mmb-docs.ep.com/Projects_and_Budgets/templates.html
  - https://mmb-docs.ep.com/Budget_Preferences/Budget_Prefs_Account_Coding.html
  - https://downloads.adc.ep.com/doc/Get_Most_Out_Of_MMB10.pdf
- Kanada:
  - https://www.canada.ca/content/dam/pch/documents/services/funding/cavco-tax-credits/canadian-film-video-production/cptc-cavco-application-guidelines.pdf
  - https://www.canada.ca/en/canadian-heritage/services/funding/cavco-tax-credits/film-video-production-services/application-guidelines.html
  - https://telefilm.ca/wp-content/uploads/accounting-reporting-requirements-2006.pdf
- Avustralya:
  - https://www.screenaustralia.gov.au/resource_subject/budget-template/
- Kuzey Avrupa:
  - https://nordiskfilmogtvfond.com/assets/download/Guidelines_English_2024.pdf
  - https://www.kristiania.no/globalassets/programbeskrivelser/fagskole/2025/produksjonsledelse-for-film-og-tv_studieplan_gyldig-fra-2025.pdf
  - https://www.regjeringen.no/contentassets/f39fb5c2e67d464180d1cef337efeba9/no/pdfa/stm199920000003000dddpdfa.pdf
- Almanya:
  - https://www.ffa.de/files/dfff/Zwischennachweise/DFFF%20Sachbericht%20zum%20Zwischennachweis%202025.pdf
  - https://www.ffa.de/dfff-richtlinie.html
  - https://www.ffa.de/dfff-ii.html
  - https://www.ffa.de/files/ffa/av-dfff/Verfahren-der-Schlusspr%C3%BCfung.pdf
  - https://www.movie-college.de/filmschule/produktion/kalkulation/beispiel-kalkulation
  - https://www.movie-college.de/filmschule/produktion/kalkulation/cinecalc/personalkosten
  - https://www.movie-college.de/filmschule/produktion/kalkulation/cinecalc/kosten-im-detail
  - https://thueringen.de/fileadmin/user_upload/TSK/Themen/Medienpolitik/Kalkulationab2018.pdf
