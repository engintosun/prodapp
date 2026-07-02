# KAAPA — BÜTÇE EKRAN & MODEL KARARLARI

*Kalem bütçe ekranının davranış/etkileşim kararları ve bunları doğuran model gerekçeleri. Vergi/oran detayı `VERGI-MEVZUATI.md`'de; şema/RPC kararları `BUTCE-SEMA-KARARLARI.md`'de; bu dosya ikisinin arasındaki EKRAN + MODEL katmanı.*

*Oluşturma: 23 Haziran 2026. Bu kararlar tasarım oturumunda kapatıldı; HENÜZ şema/kod değil — şema dilimi bunlardan türetilecek. Her madde: KARAR + NEDEN.*

---

## 1. Kalem satırı yapısı

**KARAR (güncel, 2026-07-02, Birim/Birim net swap sonrası):** Kolon sırası: **Kod · Açıklama · Statü · Dönemler · Birim · Birim net · Miktar · Çarpan · Yasal Yük · Net toplam · Brüt toplam** (11 kolon). Eski "Gider" (kalem adı) ve eski "Açıklama" (serbest metin, `detail`) ayrımı KALKTI — tek "Açıklama" kolonu kalemin adını taşır (`budget_items.name`). Eski `detail` alanı `description_en` olarak arka planda yaşıyor (Köster damıtımından gelen İngilizce standart adlar, ileride İngilizce sunum için); ekranda hiçbir kolonda görünmez. Birim/Birim net sırası 2026-07-02'de değişti (Birim önce): sayısal kolonlar (Birim net'ten Brüt toplam'a) artık kesintisiz blok.
KDV AYRI KOLON DEĞİL — Yasal Yük dökümüne indi (§7). Birim/Birim net/Miktar/Çarpan ana satırda görünür; ama rol dönem sayısına göre değişir:
- **Tek dönem:** ana satır GİRİŞ (Birim + Birim_net + Miktar + Çarpan burada girilir).
- **Çok dönem:** ana satır SALT-OKUNUR ÖZET (Birim/Birim_net/Miktar dönemler arası aynıysa değer, farklıysa "—"; Çarpan = SUM; Yasal Yük/Net/Brüt = SUM); giriş dönem satırlarında yapılır.

**NEDEN:** İki ayrı "kalem adı" kolonu (Gider + Açıklama) yanlış kurulmuştu — eski `detail` alanı hem şablonun İngilizce tohum adını hem kullanıcının serbest notunu aynı hücrede taşıyordu, biri diğerinin üstüne yazılınca kayboluyordu. Tek "Açıklama" kolonu = kalemin adı; İngilizce karşılığı arka planda korunur, ayrı kolon açmaz. Bir kalem çok dönemde dönem-başına farklı ücret/miktar/çarpan taşıyabilir → geometri dönem-bazına indi (Net = Birim_net × Miktar × Çarpan, dönem-başına). Ana satır tek dönemde giriş, çok dönemde özet görevi görür. Detay §7.

## 2. Statü (ödeme türü)

**KARAR (güncel, 2026-06-25):** Kalem-bazlı **native dropdown** (m4: ozel kutu YOK — mobilde işletim sisteminin bottom-sheet'i bedavaya gelir). **6 değer** (eski 5-değer liste ASILDI): `bordro` / `smm` / `telif_belgeli` / `sirket` / `kira_sahis` / `konaklama`. **Kısa etiketler** (m4 kararı): SMM · Telif · Kira · Fatura · Bordro · Konaklama. Kütüphane/rol atomundan varsayılan gelir, kalemde override.

**NEDEN:** Yük'ün hangi mekanizma olduğunu (SGK mı stopaj mı, KDV var mı) statü belirler. Aynı rol farklı kişide farklı statüde olabilir (kameraman bordrolu da olur, SMM kesen de) → kalemde değiştirilebilmeli. Varsayılan kütüphaneden gelir ki her seferinde elle seçilmesin. Native select mobilde OS bottom-sheet'i tetikler — özel kutu gereksiz.

## 3. Net / Brüt ve "Yasal Yük" (kolon başlığı güncel)

**KARAR (güncel, 2026-07-01, DILIM-2f sonrası):** Kolon adı = **"Yasal Yük"** (eski "Yük" aşıldı). Bütçe "Toplam" = **Brüt** (yapımcı maliyeti). Net ve Brüt **ayrı iki kolon**. **KDV artık AYRI KOLON DEĞİL** — Yasal Yük dökümünde şelale satırı olarak gösterilir (2026-06-25'te alınan "KDV ayrı kolon" kararı TERSİNE DÖNDÜ; gerekçe §7 güncel). Üç eksen mantığı korunur:

- **Yasal Yük = Brüt − Net (TL farkı)** statüye göre:
  - Bordro → SGK işveren payı (net'e **eklenir**, additive) — bordro motoru DILIM-3'te
  - SMM → stopaj, Brüt = Net / 0,80 (kesinti çarpan)
  - Telif → stopaj, Brüt = Net / 0,83 (kesinti çarpan)
  - Kira → stopaj, Brüt = Net / 0,80 (KDV yok)
  - Şirket faturası → yük 0 (stopaj yok; KDV Yasal Yük dökümünde havuz satırı)
  - Konaklama → yük 0 (KDV %10 Yasal Yük dökümünde havuz satırı)

- **KDV:** Yasal Yük hücresine tıklanınca açılan bottom-sheet dökümünde şelale satırı (Net → +stopaj/SGK → +KDV = kişiye banka ödemesi / brüt). Geri-alınabilir havuz olarak gösterilir; genel toplama GİRMEZ, maliyete GİRMEZ. Bordroda KDV yok, satır atlanır.

**NEDEN:** Sahada anlaşma net üzerindendir; brütü sistem türetir. Tek "yük %" çarpanı yetmez: SGK ekleme, stopaj kesinti — iki farklı yön. Toplam = Brüt çünkü yapımcının cebinden çıkan odur. KDV standart halde geri alınır (maliyet değil). Ayrı kolon fikri (2026-06-25) DILIM-2f'de test edilince fazladan gürültü yarattı: KDV zaten Yasal Yük'ün cins-şelalesi içinde doğal yerini alıyor (stopaj/SGK dökümünün altında son satır). Ayrı kolon kaldırıldı; kavram Yasal Yük dökümünde yaşar. Detay: VERGI-MEVZUATI.md §1c.

## 4. Dönem seçimi ve kırılım

**KARAR:** "Dönemler" hücresi boşsa **"+ Dönem seç"** tetikleyicisi gösterir (sütun BAŞLIĞI "Dönemler" kalır). Tıkla → açılan menüde **yalnız kalan dönemler** (prep/prod/post/Dönemsiz). Bir dönem seç → kırılıma **tek satır** eklenir (birim-net varsayılandan dolu, adet boş), gir. Tekrar tıkla → kalan dönemlerden seç → yeni satır. Satır sonunda **×** ile kaldır (dönem listeye geri döner).

**NEDEN:** Tek-tek-ekle paterni, "hepsini toggle ile aç/kapa"dan daha sade ve az gürültülü. Eklenen dönem listeden düştüğü için tekrar seçilemez, kalabalıklaşmaz. Her ekleme tek satır = ekran şişmez.

## 5. Dönem birim-net override (alt kırılım)

**KARAR:** Her dönem satırı **kendi birim-netini** tutabilir. Kalemde bir **varsayılan birim-net** vardır; dönem farklı ücretliyse satırda üzerine yazılır (override), yoksa varsayılana düşer. Net toplam = dönem ara-toplamlarının toplamı.

**NEDEN:** İki gerçek durum var: (a) aynı ücret çok dönem (kameraman her dönem aynı haftalık) → tek varsayılan ücret, tekrar girmeye gerek yok; (b) farklı ücret (koreograf: keşif gün-ücreti + çekim haftalık) → dönem-başına ücret şart. Override mekanizması ikisini de karşılar, basit durumu bozmaz (geriye uyumlu: override yoksa eski davranış).

## 6. "Yasal Yükler" bilgi panosu

**KARAR:** Transversal pano, tek bölüm / iki alt-grup: **SGK** (bordro işveren payı) + **Stopaj** (SMM/telif kaynak kesintisi). Kalemdeki yük buraya köprüyle yansır. **Genel toplama EKLENMEZ.** Bölüm notu: *"Bu listedeki tutarlar bütçeye kalemlerin brüt toplamı içinde dahildir; burada ikinci kez sayılmaz. Amaç devlete/SGK'ya ödenecek toplam yükümlülüğü tek bakışta göstermek."* Görünürlük: bölümü görmeye yetkili herkes.

**NEDEN:** SGK ve stopaj **gerçek maliyettir** (yapımcı fiilen öder) → kalem brütünde TAM BİR KEZ sayılır → kart → genel toplam. Yasal Yükler aynı rakamın **başka bir merceğidir** (toplam yükümlülüğü + nakit/beyanname planı için), o yüzden tekrar eklenmez = çift sayma yok. "Hiç eklenmesin" de yanlış olurdu (gerçek maliyeti gizlerdi); doğrusu "tek yerde say (kalem brütü), pano bilgi versin". Toplam = brüt − net (tutarlılık kontrolü).

## 7. KDV

**KARAR (güncel, 2026-07-01, DILIM-2f sonrası):** KDV **ayrı kolon DEĞİL** — Yasal Yük hücresinin şelale dökümünde satır olarak yaşar (Net → +stopaj/SGK → +KDV = kişiye banka ödemesi / brüt). Statüden gelir (`payment_status_defaults.default_vat_rate`; taslak, muhasebe onayı bekliyor); indirilebilir bayrağı `budget_items.vat_deductible`. Personelde (bordro) satır atlanır. **Yük'e GİRMEZ, genel toplama GİRMEZ.** Ayrı eksen (nakit/beyanname). İndirilemezse (fon/istisna işi) gerçek maliyet, dökümde ayrıca işaretli.

**NEDEN:** Bütçe **gider** tarafıdır, satış geliri yoktur (olursa istisna). Hesaplanan KDV (satış) yokken yalnız indirilecek KDV (alım) vardır → standart halde geri alınır, maliyet değil. KDV'yi brüte/toplama katmak her KDV'li alımı ekstra maliyet gibi gösterir = yanlış, çift gösterim. Ücret zaten KDV'nin konusu değil (bağımlı çalışma) → bordroda boş. **2026-06-25'te alınan "ayrı sütun" kararı TERSİNE DÖNDÜ:** DILIM-2f'de test edilince ayrı kolon fazladan gürültü yarattı ve statü→cins→şelale mimarisiyle çelişti; KDV Yasal Yük dökümündeki üç eksen şelalesinin doğal son satırı olarak durur (bordroda SGK, SMM/telif/kira'da stopaj, hepsinde son satır KDV). Ana tablo bir kolon daha temiz; kavram tam olarak yerine yerleşti.

## 8. Düzenleme vs salt-bakış: iki ayrı pattern

**KARAR:**
- **Düzenlenen detay** (dönem kırılımı, SGK matrahı) → **satır-içi açılır (accordion)**, aynı anda tek satır açık.
- **Salt-okunur döküm** (yük nasıl hesaplandı) → hücreye yapışık **küçük popover** (3-4 satır: net ÷ oran → brüt, yük, "Yasal Yükler'e git" bağı). Dışına tıkla → kapanır. Mobilde bottom-sheet.

**NEDEN:** Veri girerken yerinde düzenleme + bağlam korunur (accordion); sadece "61.446 nereden çıktı" bakarken tam panel ağır/gürültülü olur, minik kart yeter. İki farklı doğa, iki farklı çözüm — "sade temiz" hedefi.

## 9. Gerçekleşen tarafı (ayrı katman)

**KARAR:** Belgeli (dekont, SMM, para/gider makbuzu) + belgesiz ödemeler **girildikçe oluşur**; sistem öneri YAPMAZ. Plan ile gerçekleşen **otomatik bağlanmaz**; fark varsa anomali motoru **işaretler** (teşhis). Kaşe kapanışı net tamamlanınca; yasal yükler personel kapanışını etkilemez. Gerçekleşen, kilit sonrası salt-okunur.

**NEDEN:** Gerçekleşen = fiili para akışı, plandan bağımsız gerçek. Sisteme öneri/otomatik-doldurma koymak gerçeği saptırır; sen ne girdiysen o. Plan-gerçekleşen farkını bağlamak değil **görünür kılmak** doğru (anomali motoru = KAAPA çekirdek değeri).

## 10. §6 SINIR (kilitli) — asgari ücret / elden ödeme

**KARAR:** Saha gerçeği (resmi asgari ücret + elden ödeme) **modellenir**: kalem net = gerçek; SGK matrahı düzenlenebilir (asgari gösterilebilir); elden = fark, gerçekleşende belgeli/belgesiz girilir + **uyarı bayrağı**. KAAPA farkı görünür kılar ve riski söyler; **gizleme/kaçırma yöntemi ÖNERMEZ, muhasebe/denetmenden saklamaz.**

**NEDEN:** Finansal kontrol gerçek nakdi görmek zorundadır (§5.1: muhasebenin göremediği para = denetlenemeyen para). Hedef = yapımcının cebinden çıkacak parayı doğru hesaplamak; bu, gerçeği göstermektir, yasadışılık önerisi değil. Kurum/kuruluşa giden bütçede resmi-gerçek farkı sorun yaratır → sistem uyarır (teşhis). Compliance Guard'ın kilitli ilkesine sadık.

---

## 11. Tevkifat (KDV tevkifatı) — ayrı boyut, statüden bağımsız

**KARAR:** Tevkifat kalemin **statüsünden (Bordro/SMM/Şirket/Telif) DOĞMAZ.** Faturalı hizmetin **türünden** (reklam 3/10, işgücü temini 9/10, danışmanlık 9/10, servis taşıma 5/10, yük taşıma 2/10) + **alıcının kimliğinden** (belirlenmiş alıcı/kamu) + **eşikten** (KDV dahil 12.000 TL, 2026) doğar. Bu yüzden tevkifat çekirdek net/brüt/yük hesabına GÖMÜLMEZ. Faz 1'de: kalemde **opsiyonel "tevkifat türü" alanı** + **Compliance Guard uyarısı** (eşik aşıldıysa "bu faturada X/10 tevkifat gerekebilir, mali müşavire danış"). Hesaba dahil değil, teşhis/hatırlatma.

**NEDEN:** Tevkifat işlem/fatura düzeyinde bir KDV-sorumluluğu paylaşımıdır; bir kişinin ödeme statüsüyle (nasıl ücret aldığı) ilgisi yok. Aynı kalem türü (örn. faturalı taşıma) statüden bağımsız hep aynı tevkifata tabidir; ücret statüsü (SMM/şirket) bunu değiştirmez. Çekirdeğe gömmek modeli kirletir + yanlış olur (tevkifat KDV'nin kime ödeneceğini değiştirir, maliyeti değil — KDV zaten ayrı eksen, §7). Reklam yapımcısı için kritik (reklam işi 3/10) ama Faz 1 kapsamı için uyarı düzeyinde tutmak yeterli; tam tevkifat motoru ileride. Reklam'ın 3/10 kısmi mi tam mı olduğu kaynaklarda çelişkili → mali müşavir doğrulaması şart (VERGI-MEVZUATI §4).
1. **KAAPA renk/font teması** (warm black #0C0A08 + turuncu #E8962E, DM Sans/Mono) — eski rewrite kararından geliyor, **aday**, kilit değil; değişebilir.

## 12. Birim kolonu (m5+m6 kararı, 2026-06-25; güncelleme 2026-07-01)

**KARAR (güncel, 2026-07-01, DILIM-2f-fix2):** Birim = **seçilebilir dropdown** (gün / hafta / ay / bölüm / sabit). Yalnız periyot cinsi taşır; **adet/kişi units tablosundan SİLİNDİ** — o Miktar kolonunun konusu (kaç birim). Kaleme göre varsayılan gelir (kütüphane/rol atomundan); üstüne tıklayınca değişir. m5 (birim etiketi) + m6 (birim seçim) birleşik. Mobilde native select → OS bottom-sheet bedava. Migration: 20260701090000.

**NEDEN:** Farklı kalemler farklı periyot birimi gerektirir (kameraman haftalık, ekstra günlük, araç aylık, dizi bölüm, paket ücret sabit). "Adet" ve "kişi" ise Miktar kolonunun konusu, birimin değil — ikisini karıştırmak "3 adet × 2 kişi × haftalık" gibi anlamsız üçleme doğuruyordu. Ayrım netleşti: **Birim = zaman/paket cinsi, Miktar = kaç, Çarpan = kaç tekrar**.

## 13. Yük kovası cins mimarisi (kilitlendi 2026-06-25)

**KARAR:** `item_burdens` tablosunda her bileşen **cins** taşır (`burden_components.kind`): `additive` (SGK, işsizlik — net'e eklenir) veya `deduction` (stopaj — brütün içinden kesilir). CFE cinse göre doğru formülü seçer. Statü seçilince kova o statüye göre dolar: bordro→SGK+işsizlik bileşenleri; smm→stopaj20 bileşeni; telif→stopaj17 bileşeni; kira→stopaj20 bileşeni; fatura/konaklama→boş. **DILIM-2a şema eki** bu alana karşılık gelir.

**NEDEN:** "A reddi": stopaj bileşeni kovadan çıkarılıp ayrı bir mekanizmaya alınması önerildi, reddedildi. Tek kova + cins alanı daha temiz: her yük bileşeni kendi cinsini bilir, CFE branching yapar, eski additive testler kırılmaz, genişleme kolaydır.

## ŞEMAYA BAĞLANIŞ (şema dilimine ait, kısmen yapıldı)
- `budget_items.payment_status` — **CANLI** (6 değer, CHECK)
- `budget_items.stopaj_rate` — **CANLI** (null=miras, override için)
- `budget_items.vat_deductible` — **CANLI**
- `budget_item_periods.unit_net_override` — **CANLI** (dönem-başına farklı ücret)
- `burden_components.kind` (additive/deduction) — **DILIM-2a** (henüz yok)
- Net/Brüt CFE'den türetilir (saklanmaz): `brutStopaj(net, oran)` **CANLI**; cinse göre dallanma DILIM-2c
- "Yasal Yükler" = transversal okuma (SGK + stopaj köprü, agregat) — DILIM-2d
- Beyan/fiili/elden ayrımı = **fringe motoru (DILIM-3)**, bu dilimde değil

## 14. Not mimarisi (Ic Not + Kamu Notu) -- YAPILDI 2026-07-02

Kaleme iki serbest-metin not: Ic Not ve Kamu Notu.
- Ic Not (internal_note): denetim/handoff notu. Sunumda ASLA gorunmez.
- Kamu Notu (public_note): sunuma cikabilen gerekce (RAPORLAR fazinda fon/rapor/PDF). Faz 1'de yalniz muhasebe gorur/yazar.

Ekran: Aciklama hucresinde ad yaninda TEK isaret (dolu/bos). Ic Not VEYA Kamu Notu doluysa isaret dolu (aksan rengi), ikisi de bossa soluk. Tiklayinca alt-sheet acilir -- Yasal Yuk panosuyla AYNI doga (backdrop, disina tikla kapanir, paragraf 8 salt-bakis pattern'i). Sheet icinde iki textarea ust uste, ikisi de HEP gorunur (sekme/radio degil): sekme gecisi "hangi not acik, bilgi yanlis nota gitti mi" riski tasir, hep-gorunur ilkesine aykiri.

Realizasyon notu: ilk tasarimda "hucreye yapisik popover" denmisti; 11-kolon yatay-kaydirmali mobil tabloda popover + iki textarea sikisik kaliyor ve ikinci overlay mekanizmasi mevcut Yasal Yuk alt-sheet'iyle tutarsiz olurdu. Alt-sheet ayni salt-bakis dogasini tutarli ve mobil-dogru verir; kalem kimligi sheet basliginda (#kod + ad).

DB: budget_items.internal_note + budget_items.public_note (nullable text, goc 20260702120000). Eski atil note kolonu onceki gocte dusmustu; bu iki kolon temiz eklemedir. variance_note (B5 fark aciklamasi) AYRI kavram, dokunulmadi. Yeni tablo degil, yeni GRANT/RLS yok; mevcut budget_items RLS (yalniz muhasebe) iki kolonu da kapsar. Iz: trg_log_items (B19, full-snapshot) + trg_upd_items (updated_at) not duzenlemesini otomatik loglar; yeni trigger YOK.

Ileri seam (acik karar, CURRENT.md): public_note ileride kart/kalem-granulunde ortak-calisma yetkilendirmesine acilacak (yalniz-muhasebe RLS o granulde asilir) + RAPORLAR fazinda sunuma cikis kapisi. Faz 1'de kapali.
