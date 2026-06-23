# KAAPA — VERGİ MEVZUATI (Sektörel Referans)

*Bütçe modülünün vergi mantığının (ödeme-statüsü → KDV / stopaj / net-brüt) TEK KAYNAĞI. Türk film/TV/reklam/belgesel yapımında ödeme türlerinin vergisel davranışı. KART-KATALOGU §4.8 (ödeme-statüsü boyutu) ve §4.9 (çift-fringe guard) ile birlikte okunur.*

*Oluşturma: 23 Haziran 2026. Durum: oranlar web-doğrulandı (aşağıda kaynak+tarih). **TASLAK uyarısı:** mevzuat sık değişir; her oran "kaynak-tarihli, mali müşavire doğrulatın" ilkesiyle tutulur (Compliance Guard §6: KAAPA teşhis/uyarı verir, kesin vergi tavsiyesi vermez).*

---

## 0. NEDEN BU BELGE — net toplam ≠ brüt toplam

Bir kaleme yazdığın **net** rakam (örn. yönetmene 100.000) ile o kalemin **işverene maliyeti** ve **nakit çıkışı** çoğu zaman aynı değildir. Aradaki fark üç ayrı vergi mekanizmasından gelir ve bunlar **birbirinden bağımsız eksenlerdir** — tek bir "yük %" çarpanına sıkıştırılamaz:

1. **Stopaj (gelir vergisi tevkifatı):** Genelde brütün **içinden kesilir** (alacaklıya giden azalır). Net anlaşıldıysa brüt yukarı şişer.
2. **SGK işveren payı (bordro):** Netin **üstüne eklenir**, gerçek işveren maliyeti.
3. **KDV:** Netin üstüne eklenir, **nakit ödenir**; koşullara göre indirilir (gerçek maliyet değil) veya indirilemez (gerçek maliyet).

Bu yüzden bütçede **iki toplam** vardır:
- **Net toplam** = bütçe kontrol rakamı (KDV hariç; öngörülen taraf kilitçe NET — bkz. BUTCE-SEMA-KARARLARI §E).
- **Brüt toplam** = fiilen ödenecek / nakit çıkacak rakam (stopaj şişmesi + KDV dahil).

Hesaplanan değer **saklanmaz** (B18); net girilir, brüt CFE'den türetilir.

---

## 1. ÖDEME STATÜSÜ → VERGİ DAVRANIŞI (ana tablo)

Statü, KART-KATALOGU §4.8'deki ödeme-statüsü boyutudur. Her işçilik/hizmet kalemi bir statü taşır; statü KDV + stopaj + fringe davranışını belirler.

| # | Ödeme statüsü | KDV oranı | Stopaj (GV tevkifat) | Net → Brüt (stopaj şişmesi) | SGK fringe | Not |
|---|---|---|---|---|---|---|
| 1 | **Telifli eser — şahıs** (GVK 18) | %0 veya %20 | **%17** (GVK 94/2-a) | Brüt = Net / 0,83 | Binmez | KDV sorumlu sıfatıyla (2 no'lu KDV); eser FSEK kapsamında olmalı |
| 2 | **Serbest meslek — şahıs** (SMM) | %20 | **%20** (GVK 94/2-b) | Brüt = Net / 0,80 | Binmez | Yük faturada; en yaygın şahıs ödemesi |
| 3 | **Şirket faturası** (Ltd/AŞ) | %20 | **%0** | Brüt = Net (KDV ayrı) | Binmez | KDV indirilebilir (koşullu, §3) |
| 4 | **Bordro** (kadrolu) | — (ücret KDV dışı) | Artan tarife (GVK 103) | (basit şişme YOK — ayrı motor) | **Biner** | İşveren SGK payı + damga; gerçek fringe. Fringe motoru §8 PARK |
| 5 | **Konaklama / yemek** | %10 | %0 | Brüt = Net + %10 KDV | Binmez | Operasyonel gider |
| 6 | **Ulaşım — yük taşıma** | %20 | %0 | Brüt = Net + KDV | Binmez | Alıcı kamuysa **2/10 KDV tevkifatı** (§4) |
| 7 | **Şahıs mekan kirası** (GVK 94/5-a) | %0 | **%20** | Brüt = Net / 0,80 | Binmez | Stopajı kiracı keser; şahıs KDV mükellefi değil |

**Şişme formülünün mantığı:** Stopaj brütten kesiliyorsa ve alacaklıya **net** garanti ediliyorsa: Brüt × (1 − stopaj) = Net → **Brüt = Net / (1 − stopaj)**. Örn. %17 → /0,83; %20 → /0,80. (Kaynak doğrulama: GVK 94/2-a telif %17; serbest meslek %20.)

---

## 2. STOPAJ (Gelir Vergisi Tevkifatı) — kim, ne kadar

- **Telif (GVK 18 / 94/2-a): %17.** Sürekli/mutad eser üretiminde geçerli; eserin FSEK'e göre eser sayılması ve İl Kültür Müdürlüğü belgesiyle ispatı gerekir. Telif istisnası sınırı (GVK 103 dördüncü dilim) aşılırsa beyan zorunlu.
- **Serbest meslek (94/2-b): %20.** SMM ile faturalanan şahıs hizmeti.
- **Kira — şahıs işyeri/mekan (94/5-a): %20.** Kiracı (yapım şirketi) keser, muhtasarla beyan eder. *(Geçmişte pandemi döneminde geçici %10 olmuştu; güncel %20 — doğrula.)*
- **Şirket faturası: stopaj YOK** (kurum kendi kurumlar vergisini öder).
- **Bordro:** stopaj değil, artan tarifeli gelir vergisi (GVK 103) + SGK + damga = ayrı bordro motoru (§8 PARK).

---

## 3. KDV — ne zaman gerçek maliyet, ne zaman değil (KRİTİK)

**Genel kural (standart durum):** Yapım şirketi KDV mükellefiyse, ödediği KDV = **indirilecek KDV** → hesapladığı KDV'den düşülür. Yani standart halde KDV **nihai maliyet DEĞİL**. AMA:
- **Nakit anında ÖDENİR** → nakit/brüt akışında görünür (sonra mahsup/iade ile geri döner). Bu yüzden brüt toplam KDV'yi içerir.
- **İstisna/muafiyetli işte indirilemez → GERÇEK MALİYET olur.** Örnekler: KDV'den müstesna teslim/hizmet, ihracat-kayıtlı iş, bazı kamu/fon işleri. Çıktısı KDV'siz olan işte yüklenilen KDV indirilemez, kalemde kalıcı maliyet olarak durur.

**KAAPA kararı (öneri):** Kaleme **"KDV indirilebilir mi?"** bayrağı.
- İndirilebilir → net toplam KDV'siz; KDV yalnız brüt/nakit görünümünde (geçici çıkış).
- İndirilemez → KDV gerçek satır maliyeti, net tarafa da yansır.

**KDV oranları (doğrulandı, 2026):** genel **%20** (07.07.2023'ten); indirimli **%10** (konaklama, yemek, sağlık, eğitim, kültürel); **%1** (temel gıda). Telif eseri %0 veya %20 (kapsamına göre).

### 3.1 Beyan edilen ≠ fiili — asgari ücret pratiği (sektör gerçeği)

Türk yapımında yaygın pratik: resmi evrakta kaşe **asgari ücretten** gösterilir, SGK asgari üstünden resmi kanaldan ödenir, kalan **elden** (makbuz karşılığı) ödenir. Sonuç: gerçek SGK/yük, kalemdeki nominal ücretten hesaplanırsa **gerçekçi olmaz** — fiilen SGK'ya ödenen asgari üstündendir.

**KAAPA modeli (teşhis çerçevesi — §6):** Finansal kontrol gerçek nakdi görmek zorunda (§5.1: muhasebenin göremediği para = denetlenemeyen para). Bu yüzden işçilik kalemi iki rakam taşır:
- **`fiili tutar`** — gerçek anlaşma / fiilen ödenen nakit (bütçe kontrol + nakit akışı bunu görür).
- **`beyan edilen matrah`** — resmi/SGK'ya bildirilen (çoğu zaman asgari ücret).
- **SGK fringe = beyan edilen üstünden** (fiili değil).
- **`elden = fiili − beyan`** → gerçek nakit çıkışı olarak izlenir **VE anomali bayrağıyla işaretlenir** (yasal maruziyet: İş K / SGK / GİB / TCK 230 vb.).

**SINIR (Compliance Guard §6, kilitli):** KAAPA farkı **görünür kılar + riski bildirir** ("elden kısım şu; dışarıdan şöyle görünür; şu mevzuata açıksın"). KAAPA **gizleme/kaçırma yöntemi ÖNERMEZ** ve farkı **muhasebe/denetmenden saklamaz** (§5.1). Araç yapımcıyı korur (gerçek pozisyon + maruziyet görünür), kaçakçılık aracı olmaz. Vergi/yasal sonuç → mali müşavir + hukuk; KAAPA tavsiye vermez, teşhis koyar.

*Bu ayrım fringe motoruna aittir (§8 PARK) — şimdi kurulmaz, model hazır tutulur.*

---

## 4. KDV TEVKİFATI — sektörel kalemler (faturalı hizmet alımı)

KDV tevkifatı = satıcının hesapladığı KDV'nin bir kısmını **alıcının** kesip doğrudan vergi dairesine yatırması (2 no'lu KDV beyannamesi). **Önemli: tevkifat statüden (Bordro/SMM vb.) DEĞİL, faturalı hizmetin TÜRÜNDEN + alıcının kimliğinden + eşikten doğar.** Kalem-bazlı bir "yük" değil, işlem/fatura düzeyinde ayrı bir boyut.

Sinema/TV/reklam sektöründe tetiklenen başlıca kalemler (KDV Genel Uygulama Tebliği, 2026):

| Hizmet türü | Oran | Ne zaman |
|---|---|---|
| **Ticari reklam hizmeti** | **3/10** | Reklam filmi: markaya/ajansa fatura keserken; alt yükleniciden reklam-amaçlı prodüksiyon alırken (tasarım, planlama, yayım, reklam danışmanlığı dahil) |
| **İşgücü temini** | **9/10** | Ajanstan dönemsel asistan / temizlik personeli / bordrosu ajansta olan personel kiralama |
| **Danışmanlık & denetim** | **9/10** | Faturalı hukuk / mali / sektörel danışman |
| **Servis (personel/oyuncu) taşıma** | **5/10** | Faturalı servis/minibüs taşımacılığı |
| **Yük taşıma / nakliye** | **2/10** | Set ekipmanı taşıma |
| **"Diğer hizmetler"** | **5/10** | 5018 cetveli kamu kurumlarına (TRT vb.), döner sermaye, vakıf üniversitesi, BİST şirketleri = **belirlenmiş alıcılara** ifa edilen, tebliğde özel sayılmayan hizmetler |

**Alt sınır: KDV DAHİL 12.000 TL (2026).** Fatura toplamı (matrah değil, KDV dahil) bunu aşarsa tevkifatlı fatura ZORUNLU; altındaysa tevkifat yok, KDV'nin tamamı satıcıya ödenir. *(VUK 588 ile fatura düzenleme sınırına endeksli; her yıl güncellenir.)*

**Çekinceler / tuzaklar:**
- **Reklam tevkifatı: 3/10 kısmi mi, tam mı?** Kaynaklar çelişiyor — bazıları ticari reklamı **tam tevkifat** (sınır aranmaz) sayıyor. **Mali müşavire doğrulat.**
- **"Yapım işleri" tevkifatı (4/10) ≠ FİLM.** Bu **inşaat** yapım işidir (KDV dahil ≥5M TL). Film "yapım"ı ile KARIŞTIRMA — KAAPA'da bu terim film yapımına uygulanmaz; en çok yapılan hata budur.
- Tevkifat **senin kamuya/belirlenmiş alıcıya sattığın** işte (reklam/hizmet faturası) ya da **belirli hizmetleri satın aldığında** (işgücü, taşıma, danışmanlık) çıkar; özel müşteriye sıradan satışta çıkmaz.
- Kira ve GVK 18 telif gibi **tam tevkifat** kalemlerinde 12.000 sınırı aranmaz.

---

## 5. KAAPA'ya BAĞLANIŞ (sonraki şema dilimi — henüz kurulmadı)

Bu belge, kurulacak şema+CFE kolonlarının gerekçesidir. **Önerilen** alanlar (şema diliminde ratifiye edilecek):

- `budget_items.payment_status` — enum: `bordro` / `smm` / `sirket_faturasi` / `telif` / `loan_out` / `kira_sahis` / `konaklama` ... **Kaleme ekli; kütüphane/rol atomundan varsayılan gelir (§4.7), kalemde tıklanabilir hücreyle override edilir.** Statü değişince stopaj/fringe/KDV davranışı yeniden türetilir (örn. kamera asistanı varsayılan `bordro`→SGK biner; fatura kesiyorsa hücreden `smm`/`sirket_faturasi`→fringe sıfırlanır).
- `budget_items.vat_rate` — CANLI (%0/10/20). Vergi hücresi tıklanabilir.
- `budget_items.stopaj_rate` — YENİ (statüden varsayılan; override için alan; B18 — oran girdi, tutar saklanmaz).
- `budget_items.vat_deductible` — YENİ boolean (§3: KDV gerçek maliyet mi).
- **Net/Brüt:** CFE türetir, saklanmaz. Net girilir; brüt = net/(1−stopaj) + KDV katmanı. İki ayrı CFE fonksiyonu: `brutStopaj(net, stopaj)` ve mevcut `kdvAyristir` / `brutBirim`.
- `tevkifat_orani` — OPSİYONEL / ileride (kamu-alıcı senaryosu; Faz 1'de muhtemelen yalnız Compliance Guard uyarısı, hesap değil).
- **`fiili tutar` + `beyan edilen matrah` + `elden`** — beyan≠fiili ayrımı (§3.1). FRINGE MOTORU işidir (§8 PARK); şimdiki şema diliminde DEĞİL. SGK fringe beyan üstünden; elden = fiili−beyan, anomali bayraklı.

**Çift-fringe guard (§4.9 zaten karar):** statü `smm`/`sirket_faturasi`/`loan_out`/`telif` ise SGK fringe SIFIRLANIR (yük faturada/ayrı); yalnız `bordro`da fringe biner.

---

## 6. KAYNAKLAR (doğrulama, Haziran 2026)

- KDV oranları (%1/10/20, genel %20 07.07.2023): GİB / KDV tebliğleri; kdvhesaplama.org, dopigo.com, e-faturamcepte.com (Ocak–Haziran 2026).
- Telif stopajı %17 (GVK 94/2-a) + net/0,83 mekaniği: adenymm.com.tr, muhasebetr.com (GVK 18 + KDV genel tebliği örneği).
- Serbest meslek stopajı %20 (GVK 94/2-b): muhasebedunyasi.com, gureli.com.tr.
- KDV tevkifatı 5/10 (diğer hizmetler, belirlenmiş alıcılar) + yapım işleri = inşaat: ismmmo.org.tr, ey.com/tr, GİB tevkifat tablosu, dkn.com.tr.
- Yük taşıma tevkifatı 2/10: istanbulymmo.org.tr.

**Tüm oranlar TASLAK referanstır.** Gerçek bütçe/fatura öncesi mali müşavire doğrulatılmalıdır (Compliance Guard §6 ilkesi: kaynak-tarihli, "doğrulayın" notlu).
