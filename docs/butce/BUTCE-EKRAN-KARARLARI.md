# KAAPA — BÜTÇE EKRAN & MODEL KARARLARI

*Kalem bütçe ekranının davranış/etkileşim kararları ve bunları doğuran model gerekçeleri. Vergi/oran detayı `VERGI-MEVZUATI.md`'de; şema/RPC kararları `BUTCE-SEMA-KARARLARI.md`'de; bu dosya ikisinin arasındaki EKRAN + MODEL katmanı.*

*Oluşturma: 23 Haziran 2026. Bu kararlar tasarım oturumunda kapatıldı; HENÜZ şema/kod değil — şema dilimi bunlardan türetilecek. Her madde: KARAR + NEDEN.*

---

## 1. Kalem satırı yapısı

**KARAR:** Kolon sırası: **Kalem · Statü · Dönemler · KDV · Yük · Net toplam · Brüt toplam**.
Kalem başta; Net/× (birim-net ve adet) ana satırda DEĞİL — dönem kırılımına indi.

**NEDEN:** Kalem kullanıcının önce gördüğü/aradığı şeydir, başta olmalı. Net/× ana satırdan çıkarıldı çünkü bir kalem birden çok dönemde, dönem-başına farklı ücretle olabilir → tek "Net" hücresi bunu taşıyamaz (yanlış varsayım: "tek birim-net × miktar"). Detay aşağı (kırılıma) indi, ana satır özet kaldı = sade görünüm.

## 2. Statü (ödeme türü)

**KARAR:** Kalem-bazlı dropdown: **Bordro / SMM / Şirket faturası / Telif / Kira(şahıs)**. Kütüphane/rol atomundan varsayılan gelir, kalemde tıklanabilir override.

**NEDEN:** Yük'ün hangi mekanizma olduğunu (SGK mı stopaj mı, KDV var mı) statü belirler. Aynı rol farklı kişide farklı statüde olabilir (kameraman bordrolu da olur, SMM kesen de) → kalemde değiştirilebilmeli. Varsayılan kütüphaneden gelir ki her seferinde elle seçilmesin.

## 3. Net / Brüt ve "Yük"

**KARAR:** Sen **net** rakamı girersin (sahada net anlaşılır). **Brüt = Net + Yük.** "Yük" hücresi = **brüt − net farkı (TL)**, statüye göre motor hesaplar + bütçeci override edebilir:
- Bordro → SGK işveren payı (net'e **eklenir**)
- SMM → stopaj, Brüt = Net / 0,80 → fark
- Telif → stopaj, Brüt = Net / 0,83 → fark
- Şirket faturası → yük 0 (stopaj yok)

**NEDEN:** Sahada anlaşma daima net üzerindendir ("eline 10.000 geçsin"); brütü kimse baştan bilmez, sistem türetmeli. Tek bir "yük %" çarpanı YETMEZ çünkü iki mekanizma ters yönde çalışır: **SGK net'in üstüne EKLENİR**, **stopaj brütün içinden KESİLİR** (Brüt×(1−oran)=Net → Brüt=Net/(1−oran); %20→/0,80, %17→/0,83). Ama ekranda ikisi de "brüt−net farkı" olarak tek "Yük" sütununda tutarlı görünür; matematiği motor doğru kurar.

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

**KARAR:** KDV ana tabloda sütun (oran + "indirilebilir mi?" bayrağı). Personelde (bordro) boş. **Yük'e GİRMEZ, genel toplama GİRMEZ.** Ayrı eksen (nakit/beyanname). İndirilemezse (fon/istisna işi) gerçek maliyet, ayrıca işaretli.

**NEDEN:** Bütçe **gider** tarafıdır, satış geliri yoktur (olursa istisna). Hesaplanan KDV (satış) yokken yalnız indirilecek KDV (alım) vardır → standart halde geri alınır, maliyet değil. KDV'yi brüte/toplama katmak her KDV'li alımı ekstra maliyet gibi gösterir = yanlış, çift gösterim. Ücret zaten KDV'nin konusu değil (bağımlı çalışma) → bordroda boş. **Açık karar:** KDV sütununun ana tabloda görünümü/konumu sonra netleşecek (§Açık).

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
2. **KDV sütununun** ana tablodaki görünümü/konumu — açık (§7).

## ŞEMAYA BAĞLANIŞ (şema dilimine ait, henüz kurulmadı)
Bu kararlardan doğan ve **şema dilimi**nde `BUTCE-SEMA-KARARLARI.md`'ye işlenecek alanlar (öneri):
- `budget_items.payment_status` (enum, kütüphane varsayılanı + override)
- `budget_items.stopaj_rate` (statüden türetilir, override; B18 oran-girdi)
- `budget_items.vat_deductible` (boolean; KDV gerçek maliyet mi)
- `budget_item_periods` → **opsiyonel birim-net override** (dönem-başına farklı ücret)
- Net/Brüt CFE'den türetilir (saklanmaz): `brutStopaj(net, oran)` + mevcut `kdvAyristir`/`brutBirim`
- "Yasal Yükler" = transversal okuma (SGK + stopaj kalemlerden köprü, agregat)
- Beyan/fiili/elden ayrımı = **fringe motoru (§8 PARK)**, bu dilimde değil
