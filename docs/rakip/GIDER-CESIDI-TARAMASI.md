# Gider Çeşidi Taraması — Kaynak ve Rakip İncelemesi

**İnceleme tarihi:** 6 Ekim 2026 · **Kanıt seviyeleri:** `docs/rakip/YONTEM.md` §2 ([A] elde dosya, [B] resmi doküman, [C] üçüncü taraf) · **Izgara boyutu:** 5 (bütçe veri modeli); 9 (Hedef Mecra) ve 17 (vergi ve yük) ile kesişir.

Bu dosya bir fotoğraftır (YONTEM §9): altı aydan eski bulgu, karar gerekçesi olarak kullanılmadan önce tazelenir. Karar evi: `docs/butce/BUTCE-SEMA-KARARLARI.md` GİDER ÇEŞİDİ EKSENİ.

## 1. Soru

Departman (kart) ekseninden bağımsız bir gider çeşidi ekseni sektörde nasıl çözülüyor? Ad turu, doğa ve tedarik işaretleri ve Hedef Mecra eşlemesi için hangi emsaller var?

## 2. Yöntem notu

Aynı brifle hazırlanan iki dış yapay zekâ raporu (Gemini, ChatGPT) ipucu olarak kullanıldı. Aşağıdaki her bulgu ya birincil kaynaktan bizzat okundu ya da "aktarım, doğrulanmadı" diye işaretlendi.

## 3. Bulgular

### 3.1 Movie Magic Budgeting 6.1 [A] — `docs/butce/MMB-6.1-ornek-hesap-plani.pdf`

- Ayrı bir gider türü alanı yok; hesap planı departman ve birim temelli.
- Seyahat birimlerin içinde dağınık: 1110 Travel/Living (geliştirme), 1305 Travel & Living, 1508 Travel/Living, 1700 A-T-L Travel/Living; Lokasyon bölümünde 3502 Travel Costs, 3503 Per Diem, 3504 Lodging, 3505 Meals. "Toplam seyahat" bu kodları bilip elle toplamayı gerektirir.
- Kiralama ile satın alma hesabın altında detay satırıyla ayrılır: örnekte 42 "Rental" ve 41 "Purchase" detay satırı var (ör. 1107 Office Overhead → Office Furniture → Rental / Purchase).
- Kullanıcı etiketleri Groups, Sets ve Locations'tır (KART-KATALOGU §4.10).

### 3.2 CNC devis détaillé cinéma 2018 [A] — `docs/butce/CNC-devis-cinema-2018-5-chiffres.pdf`

Dokuz bölüm. Üst seviye doğa ağırlıklı, alt seviye departmanla karışık:

1. Droits artistiques (11 Sujet … 19 Agents littéraires et conseils)
2. Personnel (21 Producteurs … 29 Agents artistiques)
3. Équipe artistique (31 Rôles principaux … 39 Agents artistiques)
4. Charges sociales et fiscales (41–46 sosyal yükler, 47 Impôts et taxes imputés au film)
5. Décors, costumes, maquillage, coiffure (51 Studio, 52 Décors naturels, 53 Aménagements décors, 54 Meubles et accessoires, 55 Animaux, 56 Moyens de transports, 57 Effets spéciaux et cascades, 58 Costumes, 59 Maquillage et coiffure)
6. Transports, défraiements, régie (61–66 ulaşım ve konaklama, 67 Transitaire et douane, 68 Bureaux et frais afférents, 69 Régie et divers)
7. Moyens techniques (71 Prise de vues … 76 Pellicules et supports)
8. Postproduction image et son
9. Assurances et divers (91 Assurances, 92 Publicité, promotion et divers, 93 Frais juridiques, frais divers et certifications des comptes, 94 Frais financiers)

### 3.3 AICP Bid Form 2019 [B] — https://aicp.com/assets/editor/AICP_bidform_2019_FINAL.pdf

- Bölümler: A Prep Crew · B Shoot Crew · C Prep & Wrap Expenses · D Location Expenses · E Props, Wardrobe & Animals · F Studio Costs · G Art Department Labor · H Art Department Expenses · I Equipment Rental · J Media · K Miscellaneous Production Costs · L Director's Fees · M Talent · N Talent Expenses · O Other · P (özelleştirilebilir bölümler) · Q Editorial · R Social Versions · S Audio · T Finishing · V Miscellaneous Editorial · W Editorial Labor & Creative Fees · X Visual Effects, Design & Animation, Interactive.
- İşçilik ile gider bölüm düzeyinde ayrılır: A/B ile C/D, G ile H, M ile N, W ile V.
- Tedarik biçimi detay satırında: Prop Rental · Prop Purchase · Prop Fabrication; Wardrobe Rental · Wardrobe Purchase; Set Dressing Rentals · Set Dressing Purchases. Ekipmanın tamamı "I. Equipment Rental" bölümündedir.
- Ödenek türü ayrı kalemdir: Kit Rental, Art Dept Kit Rental, Talent Wardrobe Allowance.

### 3.4 Hot Budget 3 [B] — https://downloads.hotbudget.com/HotBudget_v3.0_UserGuide.pdf

- Tek tür alanı Travel Log'daki "Cost Type" kolonudur ve serbest metindir. Kılavuzun cümlesi: "Could be anything but is commonly used for: Flights, Hotel, Per Diem, Transportation." Sayfanın altındaki "COST TYPE SUMS" aynı türdeki satırları toplar.
- Bütçe sayfasında her satır iki yük kolonu taşır: Fringe 1 (P & W) ve Fringe 2 (Agency Fees).

### 3.5 Saturation [B] — https://saturation.io/budgeting

- Hesap temelli yapı ve serbest etiket. Tanıtım örneğinde "Tags" kolonunda Rental, Purchase ve Allowance duruyor; aynı kolonda IATSE 600 ve Second Unit de var. Tedarik, sendika ve birim bilgisi tek etiket alanında karışıyor.
- Şablonlar kendi hesap yapısı ve numaralamasıyla gelir (Netflix, Disney, HBO, Paramount, AICP, Telefilm ve diğerleri).
- Harcama tarafında masraf kategorilerinin otomatikleştirildiği ve işlemlerin bütçeye kendiliğinden kategorilendiği söyleniyor (https://saturation.io/expense-management). Bu kategorinin bütçe hesabından ayrı bir doğa listesi olup olmadığı doğrulanmadı.

### 3.6 Diğer bütçe ve yapım muhasebesi yazılımları — aktarım, doğrulanmadı

ChatGPT raporuna göre Celtx (category/subcategory), Yamdu, StudioBinder (ATL/BTL ve expense sheet), Entertainment Partners, Cast & Crew, GreenSlate ve Wrapbook (Chart of Accounts ile departman ve hesap temelli maliyet raporu) departmandan bağımsız bir gider türü ekseni yayımlamıyor. MMB ve Showbiz'in güncel resmi kılavuzlarına ulaşılamadı.

### 3.7 Harcama yönetimi yazılımları [B]

- Microsoft Dynamics 365: masraf kategorisi, masrafın yazılacağı ana hesabı belirler; kategoriler tüzel kişi başına tanımlanır (https://learn.microsoft.com/en-us/training/modules/get-started-expense-management/map-expense-categories).
- Dash: işlem kodlanırken harcama kategorisi, muhasebe kodu ve departman ayrı alanlardır (https://help.dash.fi/spend-management/coding-transactions).
- Desen: kapalı kategori listesi harcama tarafında yaygındır, şirket düzeyinde kurulur ve muhasebe hesabına eşlenir.

### 3.8 Türkçe masraf kategorileri [C] — https://kolayik.com/sablonlar/masraf-beyan-formu-excel

Dokuz kategori: Ulaşım · Konaklama · Yemek · Temsil/Ağırlama · Ofis Malzemesi · Kargo/Posta · Eğitim · Yazılım/Abonelik · Diğer. Ad turunda Türkçe adlandırma emsali.

### 3.9 Tekdüzen Hesap Planı 7/B [B]

- Kaynak: 1 Sıra No.lu Muhasebe Sistemi Uygulama Genel Tebliği (Resmî Gazete 26.12.1992, sayı 21447 mükerrer). Tam metin: https://dijital.vergimerkezi.com.tr/mevzuat/teblig/1-sira-no-lu-muhasebe-sistemi-uygulama-genel-tebligi
- 7/A fonksiyon esasına, 7/B çeşit esasına göredir. 7/B'de giderler dönem içinde çeşide göre izlenir, dönem sonunda fonksiyonlara ve gider yerlerine dağıtılır; yani çeşit ile gider yerinin kesişimi. Belli büyüklüğü aşan üretim ve hizmet işletmeleri için 7/A zorunludur; 7/B küçük işletme seçeneğidir.
- Hesaplar: 790 İlk Madde ve Malzeme · 791 · 792 · 793 Dışarıdan Sağlanan Fayda ve Hizmetler · 794 Çeşitli Giderler · 795 Vergi, Resim ve Harçlar · 796 Amortismanlar ve Tükenme Payları · 797 Finansman Giderleri · 798 Gider Çeşitleri Yansıtma · 799 Üretim Maliyet.
- 791 ve 792'nin adı iki kaynakta farklıdır: 1992 asıl metinde 791 İşçi Ücret ve Giderleri, 792 Memur Ücret ve Giderleri; Gelir İdaresi kaynaklı güncel aktarımda 791 Memur Ücret, 792 Personel Ücret, değişiklik dipnotuyla (https://www.muhasebenews.com/?p=134568). Değişiklik metni görülmedi.
- İçerik (Gelir İdaresi kaynaklı açıklama): 793 elektrik, su, gaz, bakım-onarım, haberleşme ve nakliye; 794 sigorta, kira, yolluk, dava-icra-noter, iştirak payı ve aidat.

### 3.10 Kurum formları — erişim durumu

- Dört form 6 Ekim 2026'da `docs/butce/` altına indirildi (kaynaklar `docs/butce/KART-GEREKCELERI.md` ÇAPRAZ-DOĞRULAMA YÖNTEMİ) ve okundu [A]. Eurimages sitesi 403 döndü, ayrıntılı bütçe şablonu alınamadı. **DÜZELTME (13 Ekim 2026):** Eurimages'in sınıflandırması o gün de Master Excel'de kaynak olarak duruyordu (445 satır); özet bütçe dosyası Engin'in eklediği sürümle repoda (§3.14).
- **Screen Australia A-Z Budget (Feature Films)** `docs/butce/ScreenAustralia-A-Z-feature-budget.xlsx`: ATL (A.1 Story & Script … E(a) Cast-Principals) ve BTL. Bütün ekip ücreti tek hesapta: C Unit Fees & Salaries (altında Camera Crew, Lighting Crew, Costume Crew ve diğer ekip alt satırları); yükler ayrı (D Fringes & Workers Comp). Doğa hesapları ayrı: L Rentals & Storage, M Travel & Transport, N Accommodation, Living & Catering, O Insurances, P Office Expenses; post için S ve T; Y Legal & Business (Audit, Bank Fees, Stamp Duty, Exchange Rate Fluctation, Production Legals); Z Overheads. Ayrı sayfalar: 5.Allce (ödenek), 6.Trav, 14.Fringe. Her satır üç kolona bölünür: Exclusions, Non-QAPE (yurt dışı unsur), QAPE (teşvike uygun yerli harcama). **DÜZELTME (13 Ekim 2026):** bu bölümler doğaya değil alana göredir. L Rentals & Storage bütün kiralar değil, çoğunlukla mekân kirasıdır (ofis, atölye, depo, garaj, soyunma odası); ekipman kirası K'da, araç kirası M'de. Kiralama ile satın alma detay satırında ayrılır (Equipment - Hire / - Purchase, Vehicle Hire / Vehicle Purchases); `docs/butce/GIDER-CESIDI-ANALIZI.md` §10.
- **Telefilm Canada Standard Production Budget** `docs/butce/Telefilm-standard-production-budget.xlsx`: A Above the line · B Production · C Post-production · D Other. Her departmanın emeği ve malzemesi ayrı hesaptır (Camera labour / Camera equipment, Wardrobe labour / Wardrobe supplies, Construction labour / Construction materials); Fringe benefits ayrı; Travel & Living expenses ve Transportation kendi hesaplarında.
- **BFI Future Takes Production Budget** `docs/butce/BFI-future-takes-production-budget.xlsx`: departman bölümlü (Story and script, Producer, Director, Cast, Production, Assistant Directors, Camera, Lighting, Sound, Production design, Costume, Hair and make up, Locations); Travel and transport ve Accomodation kendi bölümlerinde; Miscellaneous (Legal fees, Bank charges, Post account and audit); Insurance ve Contingency ayrı. Departman içinde Purchases, Rentals, Box rental, Consumables detay satırları var. Ayrıca Access Budget sayfası ve In kind support tablosu.
- **AICP Bid Form, Excel (2023)** `docs/butce/AICP-bid-form.xlsm`: PDF'teki bölümlerin aynısı (§3.3). Seyahat tek bölümde DEĞİL, bölümlere dağılır: Hotels ve Per Diems C Prep & Wrap Expenses ile D Location Expenses içinde, Air Fares D'de, Director Travel L'de, Talent Air Fares ve Talent Per Diem N'de. Excel'de ayrıca Breakout Labor, Breakout Expenses ve Breakout Talent sayfaları var.
- Eurimages başvuru belgesinin maliyetin ortak yapımcı başına dağılımını istediği aktarıldı (ChatGPT raporu, doğrulanmadı). Doğruysa KAAPA'da ortak yapımcı ekseni yok. **DOĞRULANDI (13 Ekim 2026):** özet bütçe her satırı dört ortak yapımcıya ve ülkeye böler (§3.14).
- Kültür ve Turizm Bakanlığı Sinema Genel Müdürlüğü "Ayrıntılı Bütçe" istiyor; şablon açık sitede yayımlanmıyor. **DÜZELTME (13 Ekim 2026):** Bakanlığın bütçe şablonu yok. Engin (birebir): "Bakanlık desteğinde bütçe yapımcının kendi biçiminde veriliyor."

### 3.11 Keşif (recce) [A] — 11 Ekim 2026

Recce iki anlam taşır: lokasyon keşfi (mekân arama) ve teknik keşif (seçilen mekâna departman başlarıyla gidiş; hazırlık dönemi). Engin'in saha bilgisi birebir `docs/butce/BUTCE-SEMA-KARARLARI.md` GİDER ÇEŞİDİ EKSENİ, KARARLAR madde 9'dadır.

- MMB 6.1: 3501 Survey Costs, 3500 Location Department'ta tek hesap; detay satırları Travel, Accomodations, Per Diem, Car Rentals, Research Expenses, Entertainment, Still film/lab, Video Equipment.
- BFI Future Takes: "Recce costs" iki yerde: 14.10 (Transport) ve 15.3 (Accomodation).
- Screen Australia A-Z: Location Surveys'in yolu M Travel & Transport'ta, otel ve harcırahı N Accommodation, Living & Catering'de; Recce Photographs ayrı satır; yurt dışı keşif ekip satırlarında ayrı (non-QAPE) satır olarak eklenir.
- AICP: 37 Location Scout (A Prep Crew, gün ücreti) ve 104 Scouting Expenses (C Prep & Wrap Expenses; benzin, köprü, sarf).
- CNC 2018: 233A Personnel affecté aux repérages (1. ve 2. reji asistanı); yol ve konaklama bölüm 6'da.
- Koster: Survey/Recce/Scout hazırlık dönemi maliyeti; lokasyon atomları arasında.
- Master Excel: Recce Harcırah, Recce Travel, Survey Hotel, Survey Travel (Lojistik); Mekan Keşif, Mekan Scouting, Scouting Giderler (Mekan); BBC "Fares incl. Recce" ve "Prep Costs & Recce".

Okuma: kaynakların çoğu keşfi cinsine göre dağıtır; tek hesapta tutan MMB de içini detay satırlarına böler.

### 3.12 Deneme çekimi ve cast giderinin yeri [A] — 13 Ekim 2026

- MMB 6.1: 1600 Cast hesabında 1609 Casting Expenses ve 1610 Screen Tests; ayrıca 4100 Tests hesabında 4101 Screen Tests.
- Koster: deneme çekimi 1610'a (Cast) yazıldıysa 4101'de yok sayılır; bazı yapımcılar testler için ayrı hesap açar, bazıları oyuncuya dahil eder. Aynı para iki yere yazılmaz.
- Screen Australia: E(b) Cast & Casting, E(b)1 Casting Fees & Expenses altında Screen Tests Crew ve Screen Tests Equipment ayrı satır; yanlarında Audition Expenses, Audition Call-Backs, Readers Fees, Sundry Expenses, Travel & Accommodation.
- Telefilm: 10 Cast hesabında Casting Director, Casting expenses, Video expenses (casting).
- BFI: 4 Cast bölümünde 4.1 Casting director.
- Master Excel: Casting Expenses; MMB, BBC, BET, HBO ve Netflix bütçelerinde Oyuncu/Kast bölümünde.
- Başka yere koyanlar: CNC 2018 bölüm 5'in Stüdyo başlığında 511 Essais altında 5111 Essais ve 5112 Casting (cast personeli 233B, personel bölümünde); AICP 108 Casting Director ve 109 Casting Facility, C Prep & Wrap Expenses.
- Teknik testler ayrı konudur: MMB kamera, makyaj ve kostüm testlerini kendi departmanlarında tutar (Camera Tests, Makeup Tests, Wardrobe Tests); Netflix tek "TESTS - ALL" hesabında.

Okuma: oyuncu seçimi için deneme çekimi kaynakların çoğunda oyuncu hesabındadır; KAAPA'nın 1610 yeri bu yönde (`docs/butce/KART-KATALOGU.md` §7.5, 13 Ekim 2026).

### 3.13 Deneme Çekimi Taraması [A] — 13 Ekim 2026

Kaynaklar iki düzen gösteriyor: teste özel tutulan ekip test hesabında, hazırlığa girmiş ekip kendi satırında; ayrımı hiçbir araç kendisi yapmıyor. Soru (Engin, 13 Ekim 2026): deneme çekiminde ekibin emeği nerede tutulur, hazırlık ücretiyle çakışma nasıl önlenir, anlaşma belli değilken nasıl bütçelenir, "deneme çekimi bana kaça mal oldu" nasıl cevaplanır. Sözlük turunun çalışma belgesinden taşındı (`docs/butce/GIDER-CESIDI-ANALIZI.md` §10).

#### MMB 6.1 örnek hesap planı (repo: `docs/butce/MMB-6.1-ornek-hesap-plani.pdf`)

- 1600 Talent içinde 1609 Casting Expenses ve 1610 Screen Tests var; örnekte ikisinin de alt satırı yok, boş hesap.
- Ayrıca 4100 Tests diye ayrı bir hesap grubu var: 4101 Screen Tests, 4102 Makeup Tests, 4103 Wardrobe Tests, 4104 Camera Tests. **Dördünün de alt satırı aynı: Crew · Equipment · Film/Lab · Space.** Ekip, test hesabının içinde.
- Makyaj departmanında (3498 Miscellaneous) "Makeup Tests" diye bir ayrıntı satırı daha var; aynı iş iki yerde açılabiliyor.
- Okuma: MMB testi bir iş olarak tutar ve ekibini içine alır; bir testin kaça mal olduğu tek hesaptan okunur. Ekibin test günü, departmanındaki satırda değil, test hesabındaki Crew satırında.

#### CNC 2018 ayrıntılı bütçe formu (repo: `docs/butce/CNC-devis-cinema-2018-5-chiffres.pdf`)

- CNC'de test diye tek bir hesap yok. Test, parçalarının cinsine göre bölümlere dağılır: stüdyo payı 5111 ESSAIS (5 Dekor bölümünün 51 STÜDYO başlığı, yanında 5112 CASTING ve 5113 RÉPÉTITIONS), laboratuvar payı 821 ve 831 TRAVAUX AVANT TOURNAGE / ESSAIS.
- Ekip emeği 2 PERSONNEL bölümünde, görev görev satırlarda durur (235 PRISE DE VUES: 2351 Görüntü Yönetmeni, 2352 Kameraman…). Teste ayrı emek satırı yok.
- İstisna olarak sürece ayrılmış personel kendi satırını alır, ama yine personel bölümünde: 233A Keşfe ayrılan personel (233A1, 233A2 asistanlar), 233B Rol dağıtımına ayrılan personel (cast asistanları).
- Okuma: CNC cinse göre kurulmuş bir formdur (KAAPA'daki çeşit eksenine benzer). Testin toplam maliyeti tek satırdan okunmaz; emek her zaman kişinin görev satırındadır, sürece ayrılmış kişi bile personel bölümünde ayrı satırla görünür.

#### Screen Australia, Telefilm, BFI (repo: `docs/butce/` altındaki üç Excel)

- **Screen Australia (A-Z feature budget):** E(b)1 CASTING FEES & EXPENSES içinde Casting Fees · Audition Expenses · Audition Call-Backs · Readers Fees · **Screen Tests - Crew** · **Screen Tests - Equipment** · Sundry · Travel & Accommodation; aynı dizi yurt dışı için bir kez daha. "Screen Tests - Crew" kendi oranı ve haftasıyla (Pre-prodn / Shoot / Post sütunları) elle yazılan bağımsız satırdır; ekip sayfasına (2.Crew) bağlı değil, yanındaki not sosyal yüklerin (fringe) bu satıra elle katılmasını söylüyor. Ekibin hazırlık haftaları ise 2.Crew'da kişi kişi durur.
- **Telefilm:** 10 Cast hesabında 10.70 Casting Director · 10.75 Casting expenses · 10.77 Video expenses (casting). Test ekibi satırı yok.
- **BFI:** 4.1 Casting director. Test satırı yok.
- Okuma: Screen Australia testi ekibiyle birlikte cast bölümünde tutar, ama ekip hesabıyla bağı yoktur; çift saymayı önlemek bütçeyi yapanın dikkatine kalır.

#### AICP ve Hot Budget, reklam (repo: `docs/butce/AICP-bid-form.xlsm`, `docs/butce/HotBudget-3.0-user-guide.pdf`)

- Emek görev görev ve **aşamaya göre** yazılır: A. Prep Crew bölümünde her görev hazırlık günleriyle, B. Shoot Crew bölümünde aynı görev çekim günleriyle (Gün × Ücret, yanında mesai ve fringe). Aynı kişi iki bölümde iki satırdır.
- Test ya da teknik keşif için ayrı hesap yok; bu günler kişinin hazırlık günleridir. Yalnız teste ya da kuruluma gelen ayrı ekip için ayrı satır var (15 Prep/Strike/Pre Rig Crew; FAQ: çekim ekibinden ayrı, kurulum için getirilen ekip). Keşif için 37 Location Scout (gün) ve 104 Scouting Expenses.
- Cast: C bölümünde 108 Casting Director ve 109 Casting Facility (hazırlık ve çağrı günleri).
- Hot Budget kılavuzu AICP bölümlerini izler, testlere ayrı bir yapı önermez.
- Okuma: reklam dünyası emeği kişinin satırında tutar, aşamayı günle ayırır; KAAPA'daki dönem eksenine (Hazırlık, Çekim) denk düşer. Testin toplamı tek satırdan okunmaz.

#### Master Excel'deki bütçeler (repo: `docs/butce/kaapa-MASTER-kalem-DUZENLI.xlsx`)

| Kaynak | Test satırları | Emek satırı var mı |
| --- | --- | --- |
| MMB | Screen Tests (cast), Tests grubu; Camera Tests, Wardrobe Tests, Makeup Tests departmanlarda | 4100 grubunda Crew alt satırı var (yukarıda) |
| HBO | TEST ALLOWANCE · TEST PURCHASES · TEST RENTALS | Yok; testin içi cinse göre (ödenek, alım, kira) |
| Netflix | TESTS - ALL (tek hesap) | Ayrım yok |
| CBC (dizi) | TESTS AMORT (bölümlere dağıtılan test) | Ayrım yok |
| Eurimages | Tests & Screenings · Technical development & tests · VFX tests & screenings | Yok |

- Okuma: büyük stüdyo ve yayıncı bütçelerinin çoğu testi ayrı bir hesapta tutar. Ama HBO testin içini emek değil cins olarak açar (alım, kira, ödenek); emek satırı açan tek kaynak MMB'nin örnek planı.

#### Koster damıtımı (repo: `docs/butce/KAAPA_damitim_Koster_TUM-BOLUMLER.md`, satır 686–698, 352–361)

- 4101 Screen Tests bugün seyrek kullanılır; rolün ekranda nasıl duracağını görmek gerektiğinde açılır. Bazı yapımcılar testleri ayrı hesapta tutar, bazıları oyuncu hesabına (1610) koyar; **ikisine birden yazılırsa çift sayılır**, biri seçilir.
- Kamera, makyaj, kostüm testleri ayrı işlerdir (4102–4104).
- Görüntü yönetmeninin hazırlığı keşif ve ekipman belirlemeyi kapsar; gaffer ve key grip keşfe onunla gider. Yani hazırlık etkinliklerindeki emek, kişinin hazırlık süresinin içindedir.
- Ekip satırları etap etap yazılır (Prep · Shoot · Prep Distant · Shoot Distant · Wrap).
- Okuma: Koster çift saymayı açıkça uyarır ve hazırlık emeğini kişinin hazırlık süresinde tutar; test hesabı, hazırlık ekibinin dışındaki maliyet için açılır.

#### Yazılımlar ve sektör pratiği (web, 13 Ekim 2026)

- **Sektör pratiği:** ekip hazırlığı üzerine bir yapım yazısı testleri çekim dışı günler sayıyor ve her görevin hazırlık sütununa yazıyor (silah ustası, piroteknik, efekt makyajı, saç-makyaj şefi, VFX süpervizörü); teknik keşfi görüntü yönetmeni, sanat yönetmeni, mekân sorumlusu, gaffer ve key grip için birer gün sayıyor; ücretli hazırlık günlerinin anlaşmada yazıldığını söylüyor. [Pro Video Coalition, Thinking about crew prep](https://www.provideocoalition.com/thinking-about-crew-prep/)
- **MMB Groups:** ayrıntı satırlarına basılan etiketler; maliyeti hesaplar arası toplar, karşılaştırma ve alt bütçe için kullanılır. Etiketi kullanıcı basar; sonradan eklenen satıra kendiliğinden geçmez. [MMB Groups](https://mmb-docs.ep.com/Setup/groups.html)
- **Showbiz:** formüllerde değişken (global) ve senaryo için alt gruplar. [Showbiz Budgeting 9](https://www.mediaservices.com/showbiz-software/showbiz-budgeting-9/)
- **Yamdu:** takvim değişince maliyetleri güncelleyen değişkenler (Dynamic Globals); çekim takvimi Showbiz'e aşama ve hesap seçilerek aktarılıyor. [Yamdu, takvim ve bütçe](https://support.yamdu.com/en/articles/584919-keeping-schedules-and-budgets-in-sync) · [Yamdu, Showbiz aktarımı](https://support.yamdu.com/en/articles/58246-budgeting-with-yamdu)
- **Saturation:** etiket (Tags); bu dosyada zaten kayıtlı (§3.5). **Wrapbook:** teste özgü bir modelleme bulunamadı.
- Okuma: hiçbir araç "test günü hazırlığın içinde mi, ayrıca mı ödeniyor" ayrımını kendisi yapmıyor. Otomasyon değişken (gün, hafta) ve etiketle sınırlı; çift sayımı yakalayan bir denetim görülmedi.

#### Türk tarafı (web, 13 Ekim 2026)

- Bakanlığın sinema destek başvuru belgeleri ktb.gov.tr'de PDF olarak duruyor, ama site otomatik okumaya kapalı; bütçe formu açılamadı. **DÜZELTME (13 Ekim 2026):** Bakanlığın bütçe formu yok. Engin (birebir): "Bakanlık desteğinde bütçe yapımcının kendi biçiminde veriliyor." TRT'nin bütçe formu bulunamadı.
- Türk formlarında deneme çekiminin nasıl durduğu bu turda **taranamadı**. Engin'in saha bilgisi ya da formun kendisi (yüklenirse) bu boşluğu kapatır.
- Not: film yapımında faaliyet tabanlı bütçeleme üzerine Türkçe bir tez var (İstanbul Ticaret Üniversitesi); kaynakları faaliyetlere dağıtma fikri, hazırlıktaki ekibin zamanını teste paylaştırma sorusunun muhasebedeki adıdır. Uygulama ayrıntısı özet sayfasında yok. [Film yapım projelerinde faaliyet tabanlı bütçeleme](https://acikerisim.ticaret.edu.tr/items/f6201084-3ea0-4a40-ba90-2a71ad21be1e/full)

#### Okuma

| Düzen | Kaynaklar | Testin toplamı | Ekibin emeği | Çift sayımı kim önlüyor |
| --- | --- | --- | --- | --- |
| Test hesabı, ekibiyle | MMB 4100 Tests (her testte Crew satırı) · Screen Australia (cast bölümünde Screen Tests - Crew) | Tek hesaptan okunur | Teste özel tutulan ekip test hesabında, elle yazılır | Bütçeyi yapan (Koster'in uyarısı) |
| Emek kişinin hazırlığında | AICP · CNC · Koster etap satırları · sektör pratiği · HBO (test hesabı var, emek satırı yok) | Tek yerden okunmaz; gerekirse etiket (MMB Groups) | Kişinin hazırlık günlerinde | Kendiliğinden, para tek satırda |

- İki düzen çelişmez, iki ayrı ekibi anlatır. Teste özel getirilen ekip test hesabına gider (MMB'nin Crew satırı; AICP'nin "Prep/Pre-Rig Crew" satırı: çekim ekibinden ayrı, bu iş için getirilen ekip). Hazırlığa zaten girmiş ekip kendi satırında kalır.
- Oyuncu deneme çekimi kaynaklarda cast işidir (MMB 1610, Screen Australia cast bölümü). Teknik testler (kamera, makyaj, kostüm) departman işidir ve hazırlıktaki ekiple yapılır (MMB 4102–4104, sektör pratiği).
- Hiçbir araç bu ayrımı kendisi yapmıyor, çift sayım uyarısı da vermiyor.
- KAAPA'daki karşılık: 13 Ekim madde 9 (keşif ekibinin yevmiyesi ailede ayrı satır) ile 12 Ekim cast okuması (ekiplerin emeği kendi satırlarında) bu iki düzenin birlikte uygulanmasıdır. KAAPA'nın farkı otomasyon olabilir: KART-KATALOGU §4.9 Crew Overlap Guard (aynı kişi iki kartta ücret alıyorsa uyarı; karar var, kod yok) çift sayımı bütçeciye bırakmadan yakalar; kişi bağı kurulunca ücret kişinin kendi satırından okunur.

### 3.14 Eurimages özet bütçesi ve Saturation şablonları [A] — 13 Ekim 2026

- **Eurimages Summary Production Budget 2018 REV3** `docs/butce/Eurimages-summary-production-budget-2018-REV3.xlsx` (Engin, 13 Ekim 2026, Eurimages sitesinden): dört sayfa: özet bütçe (her satır CO-PRODUCER 1–4 sütunlarına bölünür, üstte ülke satırı), In-Kind&Deferrals, Limited Expenses, Expenses_Classification (her hesabın altında örnek kalemler). Aynı sınıflandırmanın kalemleri Master Excel'de 445 satırda kaynak olarak duruyor. KAAPA'da ortak yapımcı ekseni yok; Hedef Mecra turunda bakılır (13 Ekim 2026).
- Temsilciler temsil ettikleri kişinin yanında: Literary agent 1.2 Adaptation rights'ta, Director's Agent 2.2'de, Talent agencies 3.4'te.
- Yapımcı ücretlerinin yeri (14 Ekim 2026, KART 1400 turu): Line Producer yapım ekibinde, yapım müdürüyle aynı bölümde sayılır (4.1 Production crew, doğrudan maliyet). Öbür yapımcı ücretleri doğrudan maliyetin altında, genel gider ve öngörülemeyenle birlikte sınırlı gider olarak durur (9.1 Producer's fees; 8.1 Overheads; 10 Contingency). KAAPA'daki karşılığı: KART-KATALOGU §7.3 KURUM FARKLARI.
- Per diem, vize, yakıt, park ve köprü, otel, catering ve araç ödeneği 4.12 Transport, Travel and living'de; Generator & fuel 4.9'da (ışık). Yazılım 7.1'de (Rent of computers, softwares & supplies) ve 5.6'da (Softwares & licenses), haklarda değil. Noter, gümrük ve geri alınamayan vergi 7.2 Insurance & legal costs içinde.
- Loss & Damages dokuz departmanda ayrı satır (dekor, lokasyon, aksesuar, kostüm-makyaj-saç, kamera, ışık, grip, ses, ulaşım); dekor ve lokasyonda adı provision.
- Sözlükte karşılığı olmayanlar: 7.1 Fees for professional associations or unions; 4.3 Site restoration, 4.4 Location restoration, 4.7 Wardrobe cleaning.
- **Saturation şablonları** (Master Excel'deki 15 dışa aktarım; satır adı düzeyinde, şablonun bölüm bilgisi yok): kiralama satırı 15 şablonun hepsinde (218 kalem), satın alma 12'sinde (70), imalat ve yapım 10'unda (28); ödenek 12'sinde (Box Rental, Kit Rental, kişi kişi Per Diem, Car Allowance, DGA Meal Allowance); ajans ve komisyon 9'unda, yeri belli olanlar oyuncu bölümünde; kayıp ve hasar 9'unda, departman departman, bir kısmı onarım ve temizlikle aynı satırda, hiçbiri sigortada değil; yakıt 11'inde; yazılım 10'unda.

Okuma: iki kaynak da alanı bölümle, türü detay satırıyla ayırır. Doğa sınaması `docs/butce/GIDER-CESIDI-ANALIZI.md` §10'da.

### 3.15 Seyahatin yeri: yaratıcı kadro ve ekip [A] ve [B] — 14 Ekim 2026

Soru (Engin, 14 Ekim 2026): yaratıcı kadronun seyahati neden kendi kartının ailesinde duruyor da Seyahat ve Konaklama kartında durmuyor? Kararın geçmişi `docs/butce/KART-KATALOGU.md` §3 (genel kart ile birim aileleri birlikte, 5 Ekim 2026) ve `docs/butce/BUTCE-SEMA-KARARLARI.md` GİDER ÇEŞİDİ EKSENİ içindedir. İcmal gereksinimi ve erteleme `docs/EKRAN-MUHASEBE.md` §19'dadır (14 Ekim 2026, açık).

#### Kurum formları ve hesap planları [A] (repodaki dosyalar)

- **MMB 6.1:** 1110 Travel/Living (geliştirme), 1305 Travel & Living (senaryo) ve 1508 Travel/Living (yönetmen) birimin içinde. Yapımcı ve oyuncu dahil kalan yaratıcı kadro için 1700 A-T-L Travel/Living (1701 Hotels, 1702 Travel, 1703 Per Diem, 1704 Car Rentals, 1705 Misc). Ekip için 3500 Location (3502 Travel Costs, 3503 Per Diem, 3504 Lodging, 3505 Meals); post için 5122 ve 5505. 1600 Talent'ta seyahat yok. Ekip hesaplarındaki "Travel" detay satırı yolculuk gününün ücretidir, masraf değil (KART-KATALOGU §7.6 YOLCULUK GÜNÜ).
- **Telefilm:** 02 Script, 03 Development, 04 Producer(s), 05 Director(s) ve 06 Stars hesaplarının her birinde aynı sonekle .60 Travel expenses ve .65 Living expenses. Ekip ve öteki oyuncular 33 Travel & Living'de (33.01 Fares, 33.10 Accommodations, 33.20 Per diem(s), 33.30 Transfers, 33.35 Overweight baggage). Post'ta kendi satırları var: 60.60 ve 60.65 (kurgu ekibi), 66.50 ve 66.55 (müzik), 67.5 (VFX) altında numarasız iki satır. Yıldız olmayan oyuncuların hesabında (10 Cast) seyahat satırı yok.
- **Screen Australia A-Z:** A.1 Story & Script'te Writers Travel & Transport; A.2 Development'ta yurt içi ve yurt dışı yol ve otel; B.1 Producers, B.2 Directors ve E(a) Principal Cast (yurt dışı ve yerli) bloklarının her birinde Airfares, Accommodation ve Per Diems. Ekip ve geri kalanı M Travel & Transport ile N Accommodation, Living & Catering'de; 6.Trav sayfasındaki "Crew & Cast" seyahat çizelgesi M ve N'yi besler. Casting içinde (E(b)1) ayrıca Travel & Accommodation; post'ta T Post-Prodn. Travel & Accommodation.
- **Eurimages 2018:** merkezde 4.12 Transport, Travel and living (koordinatör, uçak, otel, harcırah). Geliştirme istisnadır: 1.5 "Travel, transportation & living costs for development". Post 6.8'de. 2 Direction ve 3 Talents bölümlerinde seyahat satırı yok.
- **CNC 2018:** merkezde bölüm 6; döneme göre (61 hazırlık, 62 çekim, 66 çekim sonrası) ve bölgeye göre (63 Paris, 64 Paris dışı, 65 yurt dışı) bölünür. Ayrı satırı olan yalnız yapımcı (6111, 6611) ve müzik personeli (6672); yazar, yönetmen ve oyuncu toplu "personel" satırlarında (6121, 6211).
- **BFI Future Takes:** merkezde 14 Travel and transport ve 15 Accommodation (15.1 Hotels, 15.2 Per diem); keşfin iki bölümde de ayrı satırı var (14.1, 15.3). Departmanlarda seyahat yok.
- **AICP** (6 Ekim 2026 taraması): dağıtık. Otel ve harcırah C ve D'de, uçak D'de; yönetmen seyahati L'de (yönetmen bölümü); oyuncunun uçağı ve harcırahı N'de (oyuncu giderleri).
- **Saturation şablonları** (Master Excel'deki 15 dışa aktarım; satır adı düzeyinde, bölüm bilgisi yok): Netflix, HBO, Disney, BET ve Discovery yaratıcı kadronun seyahatini rol rol ayrı satırda tutuyor: WRITER(S) TRAVEL/HOTEL/PER DIEM/AIRFARES (bet, hbo, disney, netflix, screen_australia), PRODUCER(S) (bet, hbo, disney, netflix), DIRECTOR(S) (bet, hbo, disney, netflix, AICP), CAST (disney, hbo, netflix, bet), BITS & STUNTS (disney), COMPOSER (bet), STUDIO EXEC (netflix, georgia). Disney'de ayrıca "ATL TRAVEL & LIVING" var; Discovery Talent ve Crew diye ayırıyor. Satırların hangi hesapta durduğu dosyada yok.

#### Yazılımlar (14 Ekim 2026)

- **Hot Budget 3** [A, `docs/butce/HotBudget-3.0-user-guide.pdf` s. 45–47]: Travel Log ayrı bir liste. Her satır yolcuyu (Traveler), gider türünü (Cost Type, serbest metin: Flights, Hotel, Per Diem, Transportation), adedi, günü, birim fiyatı ve "Line Number"ı taşır; satırın parası bu numarayla bütçenin istenen satırına (ya da CS ile Cost Summary satırına) dağıtılır. Altta COST TYPE SUMS aynı türü toplar.
- **Saturation** [B, https://saturation.io/budgeting]: numaralı iç içe hesaplar, 34'ten fazla şablon. Satıra etiket basılır (IATSE 600, Rental, Second Unit; konum, teşvik uygunluğu) ve etikete göre süzülür; süzülmüş görünümde toplamın verildiği sayfada yazmıyor.
- **Yamdu** [B, "Travel & Living Planning" blog yazısı, ai-info sayfası, Showbiz ortaklığı]: seyahat kişi kişi planlanır (traveler), tek bir seyahat çizelgesinde. Maliyet bacak ve konaklama kaydına girilir; muhasebe görünümünde yolculuk ve konaklama için ayrı sütunlarda gerçekleşene akar. Bütçe hesabı için Showbiz'e aktarılır (takvim); kendi bütçe modülü beta, hesap planı yayımlanmamış.
- **Wrapbook** [B, yardım merkezi]: harcırah ve ödenekler kişinin puantajındadır; hesap kodlaması sayfada yok.
- **Showbiz** [C, BTL News incelemesi]: kategori, hesap ve detay; sütunlar hesaplar arası gruplama yapabilir (genel giderler, şehir bazlı çekim); seyahate özel bir yapı yok.
- **MMB Groups** [B, §3.13]: detay satırına elle basılan etiketle hesaplar arası toplam.

#### Okuma

- Üç düzen var. Yaratıcı kadronun seyahati kendi biriminde, ekibinki merkezde: MMB, Telefilm, Screen Australia ve Saturation'daki stüdyo şablonları. Bütün seyahat merkezde: Eurimages, CNC ve BFI (Eurimages'ta geliştirme, CNC'de yapımcı ayrı satırdır). Bölümlere dağıtık: AICP.
- Toplam seyahat üç yoldan alınıyor: merkezdeki bölümden (Eurimages, CNC, BFI), etiketten (MMB Groups, Saturation) ya da ayrı bir seyahat listesinden (Hot Budget Travel Log, Yamdu).
- KAAPA'daki karşılık: genel kart ile birim aileleri birlikte (KART-KATALOGU §3), kartlar arası toplam gider çeşidi ekseniyle. İcmal diziliminin karttan bağımsız kurulması gereksinimi ve konuşulanlar `docs/EKRAN-MUHASEBE.md` §19'da; karar icmal turunda.

## 4. KAAPA için (YONTEM §6 I satırı; gözlem, karar değil)

- **Bizde var mı:** Gider çeşidi ekseni tasarımda var (BUTCE-SEMA GİDER ÇEŞİDİ EKSENİ), şemada yok.
- **Öğrenilecek:**
  - Tedarik işaretinin üç değeri (kiralama, satın alma, imalat) AICP'de birebir var; MMB'de kiralama ve satın alma detay satırı olarak yaygın.
  - "Ödenek" doğası AICP (Kit Rental, Wardrobe Allowance) ve Saturation (Allowance) emsaliyle destekleniyor.
  - İşçilik ile işçilik dışı ayrımı AICP'de bölüm düzeyinde standart.
  - CNC'nin üst bölümleri doğa ağırlıklı. CNC Hedef Mecra çıktısı, özellikle 6 (Transports, défraiements, régie) ve 9 (Assurances et divers), bütün kartlardaki çeşitten beslenir. Bölüm adları ad turu için emsal.
  - Screen Australia, Telefilm ve BFI seyahat ve konaklamayı kendi bölümünde ister; Screen Australia bütün ekip ücretini de tek hesapta ister. Bu formlara çıktı, bütün kartlardaki seyahatin ve işçiliğin çeşit ve doğa işaretiyle toplanmasıyla verilir: kurum farkı, kart ile çeşidin kesişiminde çözülür. AICP ise seyahati bölümlere dağıtır (MMB ve KAAPA gibi).
  - 7/B karşılığı çeşitten tek başına değil, çeşit ile statünün birlikte okunmasından çıkar: bordrolu emek ile dışarıdan alınan emek farklı hesaplara düşer. Kira ve yolluk 794'te, nakliye 793'tedir.
- **Kaçınılacak:** Tedarik, sendika ve birim bilgisini tek serbest etiket alanında karıştırmak (Saturation örneği); serbest metin tür alanı (Hot Budget).
- **Boşluk:** İncelenen film bütçe yazılımlarında departmandan bağımsız kapalı bir gider türü sözlüğü bulunmadı; KAAPA'nın küratörlü küresel sözlüğü bu alanda emsalsiz, bedeli kalıcı küratörlüktür. Eurimages ortak yapımcı kırılımı doğrulandı (13 Ekim 2026, §3.14): KAAPA'da veri olarak yok. Screen Australia her satırda teşvike uygun yerli harcama (QAPE) ile yurt dışı unsuru ayırır; bu bilgi KAAPA'da yok ve eşlemeyle üretilemez, satırda veri olarak durması gerekir. Türkiye'deki yabancı yapım teşvikinin benzer bir ayrım isteyip istemediği doğrulanmadı; Hedef Mecra turunun konusu.

## 5. Açık kalanlar

- Kurum formlarının satır satır KAAPA verisiyle karşılaştırılması (Hedef Mecra sınavı; formlar okundu, §3.10).
- 7/B'de 791 ve 792'nin güncel adlandırması (değişiklik metni).
- Saturation harcama kategorilerinin bütçe hesabından ayrı olup olmadığı.
- MMB 10 ve Showbiz resmi kılavuzları.
