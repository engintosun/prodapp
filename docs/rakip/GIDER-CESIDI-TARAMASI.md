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

- Dört form 6 Ekim 2026'da `docs/butce/` altına indirildi (kaynaklar `docs/butce/KART-GEREKCELERI.md` ÇAPRAZ-DOĞRULAMA YÖNTEMİ) ve okundu [A]. Eurimages sitesi 403 döndü, ayrıntılı bütçe şablonu alınamadı.
- **Screen Australia A-Z Budget (Feature Films)** `docs/butce/ScreenAustralia-A-Z-feature-budget.xlsx`: ATL (A.1 Story & Script … E(a) Cast-Principals) ve BTL. Bütün ekip ücreti tek hesapta: C Unit Fees & Salaries (altında Camera Crew, Lighting Crew, Costume Crew ve diğer ekip alt satırları); yükler ayrı (D Fringes & Workers Comp). Doğa hesapları ayrı: L Rentals & Storage, M Travel & Transport, N Accommodation, Living & Catering, O Insurances, P Office Expenses; post için S ve T; Y Legal & Business (Audit, Bank Fees, Stamp Duty, Exchange Rate Fluctation, Production Legals); Z Overheads. Ayrı sayfalar: 5.Allce (ödenek), 6.Trav, 14.Fringe. Her satır üç kolona bölünür: Exclusions, Non-QAPE (yurt dışı unsur), QAPE (teşvike uygun yerli harcama).
- **Telefilm Canada Standard Production Budget** `docs/butce/Telefilm-standard-production-budget.xlsx`: A Above the line · B Production · C Post-production · D Other. Her departmanın emeği ve malzemesi ayrı hesaptır (Camera labour / Camera equipment, Wardrobe labour / Wardrobe supplies, Construction labour / Construction materials); Fringe benefits ayrı; Travel & Living expenses ve Transportation kendi hesaplarında.
- **BFI Future Takes Production Budget** `docs/butce/BFI-future-takes-production-budget.xlsx`: departman bölümlü (Story and script, Producer, Director, Cast, Production, Assistant Directors, Camera, Lighting, Sound, Production design, Costume, Hair and make up, Locations); Travel and transport ve Accomodation kendi bölümlerinde; Miscellaneous (Legal fees, Bank charges, Post account and audit); Insurance ve Contingency ayrı. Departman içinde Purchases, Rentals, Box rental, Consumables detay satırları var. Ayrıca Access Budget sayfası ve In kind support tablosu.
- **AICP Bid Form, Excel (2023)** `docs/butce/AICP-bid-form.xlsm`: PDF'teki bölümlerin aynısı (§3.3). Seyahat tek bölümde DEĞİL, bölümlere dağılır: Hotels ve Per Diems C Prep & Wrap Expenses ile D Location Expenses içinde, Air Fares D'de, Director Travel L'de, Talent Air Fares ve Talent Per Diem N'de. Excel'de ayrıca Breakout Labor, Breakout Expenses ve Breakout Talent sayfaları var.
- Eurimages başvuru belgesinin maliyetin ortak yapımcı başına dağılımını istediği aktarıldı (ChatGPT raporu, doğrulanmadı). Doğruysa KAAPA'da ortak yapımcı ekseni yok.
- Kültür ve Turizm Bakanlığı Sinema Genel Müdürlüğü "Ayrıntılı Bütçe" istiyor; şablon açık sitede yayımlanmıyor.

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
- **Boşluk:** İncelenen film bütçe yazılımlarında departmandan bağımsız kapalı bir gider türü sözlüğü bulunmadı; KAAPA'nın küratörlü küresel sözlüğü bu alanda emsalsiz, bedeli kalıcı küratörlüktür. Eurimages ortak yapımcı kırılımı doğrulanırsa KAAPA'da veri olarak yok. Screen Australia her satırda teşvike uygun yerli harcama (QAPE) ile yurt dışı unsuru ayırır; bu bilgi KAAPA'da yok ve eşlemeyle üretilemez, satırda veri olarak durması gerekir. Türkiye'deki yabancı yapım teşvikinin benzer bir ayrım isteyip istemediği doğrulanmadı; Hedef Mecra turunun konusu.

## 5. Açık kalanlar

- Kurum formlarının satır satır KAAPA verisiyle karşılaştırılması (Hedef Mecra sınavı; formlar okundu, §3.10).
- 7/B'de 791 ve 792'nin güncel adlandırması (değişiklik metni).
- Saturation harcama kategorilerinin bütçe hesabından ayrı olup olmadığı.
- MMB 10 ve Showbiz resmi kılavuzları.
- Bakanlık ayrıntılı bütçe şablonu.
