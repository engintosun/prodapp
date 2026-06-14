# KAAPA — Tasarım Kararları (Ekranlar-Arası Ortak İlkeler)

**Kapsam:** Bu dosya YALNIZCA tüm ekranlarda ortak geçerli görsel ve etkileşim ilkelerini tutar. Ekran-spesifik içerik (alan/akış/yerleşim) → docs/EKRAN-SAHA|DEPT|MUHASEBE.md. İş mantığı (onay/dönem/avans/reddet/anomali/hot cost) → docs/IS-KURALLARI.md. Görev sırası → docs/IS-SIRASI.md.

---

## 1. Tasarım felsefesi
- **Mobile-first.** Birincil kullanıcı sette: ayakta, tek elle, zaman baskısı, bazen karanlık ortam. Desktop responsive olarak açılır.
- **Aksiyon öncelikli.** Her ekranda birincil eylem görsel merkezde; ikincil bilgi geri planda / scroll altında.
- **Netlik > süs.** Anlaşılırlık her zaman önce gelir.

## 2. Kart-merkezli arayüz
- **Muhasebe:** TAM kart-merkezli çalışma masası. Her konu (bekleyen / şüpheli / avans / kiralama) bir kart; kartlar masaya serilir, içinde çalışılır; bildirimlere ve önceliklere göre otomatik sıralanır (yukarı/aşağı). Sunum detayı G6'da (EKRAN-MUHASEBE açık slot).
- **Dept:** KISMEN kart-merkezli (muhasebe kadar değil).
- **Saha:** kart-merkezli DEĞİL. Aksiyon-merkezli kendi akışı (FİŞ TARA odaklı). **Saha arayüzü jeneriktir:** öğelerin konumları sabit, yalnızca kozmetik (renk/şekil) geliştirilir.

## 3. Tema ve görsel kimlik (ilke kayıtlı, değerler G6'da)
- **Dark-mode öncelikli** (set ortamı), light mode da bulunur. Tema tercihi kullanıcı bazlı.
- **Renk paleti, accent kullanımı, tipografi, ikonografi, logo/favicon → G6 görsel tasarım oturumunda belirlenecek (AÇIK SLOT).**
- tokens.css yapısı placeholder değerlerle kurulur; değerler G6'da swap edilir, yapı değişmez.

## 4. Etkileşim ilkeleri
- Touch target: mobil, tek elle kullanıma uygun minimum boyutlar.
- 100dvh viewport fix (Chrome mobile).
- Floating navigation: tabana yapışık değil, kenar boşluklu, yuvarlak köşeli (saha; yerleşim EKRAN-SAHA §2).
- Durum renkleri (onay/red/bekleyen/uyarı) semantik kullanılır; kesin değerler G6.

## 5. OCR güvenilirlik gösterimi (UX ilkesi)
- Confidence arka planda HER ZAMAN çalışır, tüm veriler Supabase'de. Faz farkı yalnızca kullanıcıya ne gösterildiğidir.
- Confidence renk bantları + eşik gösterimi: ekran detayı EKRAN-SAHA §4. Eşik değerleri pilotta kalibre edilir (referans: docs/RAKIP-ANALIZI-OCR.md — sektör %80-85 başlangıç).
- Onay modeli (3 katmanlı insan kontrolü) iş kuralıdır → docs/IS-KURALLARI.md §1.

## 6. Görsel tasarım işleri (G6 — açık)
Her ekranın görsel tasarımı (renk, kozmetik, dark tema, doku, logo/favicon) commit'ten önce G6 oturumunda belirlenir. Ekran dosyalarındaki "AÇIK SLOT" notları bu oturumda doldurulur.

## 8. Bütçe modülü (2026-06-12 — kilitli)
Karar kaydının tamamı: CURRENT.md B-serisi (B1-B15). Ekran tarifleri: EKRAN-MUHASEBE §19. Kalıcı ilkeler:
1. 10 dakika kuralı — eğitimsiz muhasebeci 10 dakikada ilk grubu doldurur; kurs gerektiren her şey tasarım hatası.
2. Kart = tek konu — masada yalnız kartlar; kartın içinde yalnız o grubun satırları.
3. Görünür hesap, dokunulmaz formül — formül hücresi yok; her toplamda tek dokunuşla düz Türkçe döküm ("75.000 net + %33 yük = 99.750 × 1,75 hafta = 174.563").
4. Üç alan kuralı — satır eklemek = ad + net + çarpan; yük ve birim gruptan miras.
5. Klavye akışı — Enter/Tab ile Excel hızı.
6. Kayıt düğmesi yok — her hücre anında kaydedilir.
7. Şablondan gelen boş kalem 0'da durur, toplama girmez, gizlenebilir.
8. Güven = değişiklik izi + orijinal kilidi.
9. Mobil: bütçe girişi masaüstü-önerilir; icmal/özet mobil-tam.
10. Uyarı 3 seviye: engel / uyarı / öğreten ipucu ("ne oldu + neden önemli + ne yap").
11. Tamamlılık ilkesi: kullanıcıya "bunu neden koymamışlar" dedirtme; her erteleme kayıtlı karar.
12. Görsel tasarım ayrı turda, UI yazılmadan önce (wireframe ≠ kimlik).
Model bildirisi: omurga dünya standardı (icmal → etap → grup → kalem, hesap kodlu, orijinal/yürüyen/gerçekleşen, EFC kapısı), matematik Türkiye (yük bileşenleri, KDV ayrıştırma, belgeli/belgesiz), sunum KAAPA (kart masası + ray).

### Şema kararları (2026-06-13 — kilitli, DB temeli yazıldı b89d67e)
13. **Hesaplanan değer saklanmaz (B18):** DB'de yalnız girilen sayılar ve belge sayıları durur; tüm toplamlar her bakışta CFE'den doğar. Saklanan türetilmiş tek değer = kasa fotoğrafındaki donmuş toplam (değişmemesi gerektiği için). Aynı formülün iki yerde (TS+SQL) yaşaması yasak; tek hesap makinesi.
14. **Negatif/bozuk değer kapıdan giremez (B3 engel):** DB CHECK kısıtı, tetikleyici değil.
15. **Değişiklik izi kapıda (B19):** tek tutanak defteri + tabloya takılı tetikleyici; paraf insana bırakılmaz, izsiz değişiklik imkansız. İz tutar, hesap yapmaz.
16. **Kasa ve raf koy-ve-bak (B16/B17):** orijinal kilidi ve şablonlar tek jsonb belge; UPDATE/DELETE politikası yok → dokunulmazlık DB seviyesinde. Düzeltme = yeni satır, eskisi durur.
17. **Kalıcı kalem kodu = kimlik:** bütçe içi artan sayaç, geri kullanılmaz, konumdan bağımsız. Dış format (Bakanlık/AICP) kod eşlemesi ayrı alan.
18. **Sınav düzeneği:** para hesaplayan her kural cevap anahtarlı testle mühürlenir; matematiğe dokunan, test geçmeden commit edemez. (CFE dilim 1 ile, 1b.)
Paketleme: Model A — bütçe ile harcama tek kod tabanında paketlenebilir iki yüzey; tek temas receipts.budget_item_id; "modül açık mı" bayrağı ileride proje düzeyinde tek alan.

## 7. Referanslar
- Rakip OCR analizi: docs/RAKIP-ANALIZI-OCR.md
- Domain terimleri: docs/GLOSSARY.md

---

## TAŞINAN İÇERİĞİN HARİTASI (navigasyon — bu dosyada artık yok)
Bu dosyada eskiden karışık duran ekran/iş/auth detayları doğru evlerine taşındı:
- Giriş akışı · saha ana ekran · OCR sonuç ekranı · dönem ekranı → **docs/EKRAN-SAHA.md**
- Reddet/iade · dönem disiplini ve kapama · kategori sistemi · kiralama · avans · hot cost · vergi türleri · şirket kuralları · anomali → **docs/IS-KURALLARI.md**
- Onboarding · davet zinciri · multi-project · üyelik/silme → **docs/AUTH-KARARLARI.md**
- Tasarım/görev iş listesi → **docs/IS-SIRASI.md**
- Dil seçimi · mesai hesaplama · denetçi modu → **Faz 2** (CURRENT.md "Faz 2'ye Taşınanlar")

## Bütçe modülü - yapı kararı (kilitlendi 2026-06-13)

### A. Giriş yapısı
- Kart = departman (ana menü); değişmez. Endüstri/saha standardı; ağrı noktası yapı değil uygulamadır.
- Faz ayrı yapı DEĞİL = dönemin kaba hali. Varsayılan 3 dönem (Hazırlık/Çekim/Post); profesyonel çağrı kâğıdı bloklarına inceltilebilir (Çekim-1, Çekim-2...). Tek dönem ekseni, ayarlanabilir granülerlik.
- Giriş = sakin liste, kalem başına TEK satır; "ne zaman" göstergesi her satırda.
- "Tek-dönemlik / çok-dönemlik" diye iki cins kalem yok; her kalem döneme-bölünebilir, tek-dönem = tek dönemi dolu hali. Baştan sınıflama gerekmez.
- Çoğul dönem girişi: satırdaki "ne zaman"a dokun → dönem işaretle → her seçilene tutar. AYRI "dönem ekle" butonu yok. Az dönemde yan yana hücre, çok dönemde liste (uyarlanır döküm).
- Tam görünüm = nakit matrisi (2. yüzey): kalemler x dönemler, dönem başına nakit ihtiyacı. Gizli toggle değil, bütçeyi hazırlayanın çekirdek aracı.
- İki yüzey: GİRDİĞİN yüzey (kart, liste) != OKUDUĞUN yüzey (matris). Aynı veriden türer.

### B. Altı arayüz ilkesi (KAAPA arayüz anayasası)
1. Tek masada tek iş — ekranda yalnız o an gerekli olan; gerisi bir dokunuş ötede.
2. Makineyi gizle — kullanıcı "Kamera: 318.760" görür, stage_id/fringe değil; varsayılan çalışır, doldurmaya zorlamaz.
3. Derinlik talep üzerine — basit yüzey, güç saklı.
4. Anında ve doğru — her dokunuşta toplam canlı ve doğru (CFE); kırılan formül yok.
5. Sakin yoğunluk — nefes alan boşluk, az ama net.
6. Öngörülebilir — aynı jest her yerde aynı, geri-al kolay, çıkmaz sokak yok.

### C. Beş veri kuralı
1. Satır toplamı her zaman TÜRETİLİR = dönem tutarlarının toplamı. Ayrı elle yazılan toplam alanı YOK.
2. Her kalemin EN AZ BİR dönemi olmalı (yoksa nakit + karşılaştırmadan düşer). Zamansız kalemler (sigorta gibi) için açık "dönemsiz" kovası.
3. "Ne zaman" = nakdin çıktığı/gerektiği dönem (amaç nakit akışı), masrafın işlendiği an değil.
4. Dönemlerin TARİH sınırı olmalı (Hazırlık = şu-bu tarih); gelen fiş hangi döneme düşeceğini bilsin. Dönem = çağrı kâğıdına bağlı çekim blokları (zaten tarihli).
5. "Ne zaman" İKİ EKSEN: ait-olduğu-dönem (maliyet/karşılaştırma kapısı, kalemden miras, Faz 1) != nakdin-çıktığı-dönem (nakit kapısı, gerçekleşen dilimi). Varsayılan eşit, override edilebilir; tarih otomatik tahmin yapar, kilitli değil. Örnek: hazırlık işi, çekimde ödendi → ait=Hazırlık, nakit=Çekim.

### D. Yuvarlama sözleşmesi
- Öngörülen (bütçe) taraf: satır toplamı TAM TL'ye yuvarlanır (ROUND_HALF_UP). Üst toplamlar = yuvarlanmış satırların toplamı (önce-yuvarla-sonra-topla; üstte yeniden yuvarlama yok).
- Gerçekleşen (belge) taraf: KURUŞTA kalır (net + KDV = brüt; belgenin aynası).
- Yalnızca satır toplamı + üst toplamlar yuvarlanır. Birim net, brüt birim, çarpanlar (miktar/adet) DOKUNULMAZ.
- Para hesapları decimal.js ile; JS float YASAK. Kanıt: 8/8 test yeşil (src/shared/cfe/cfe.test.ts), commit 0b344e1.

### E. Açık tasarım notları (yapılacak - unutma)
- Ağır toplu giriş için "hızlı ekle" modu KORUNMALI: kart-cumbasını terk etmeden peş peşe kalem (departman satırda seçilir). Kurulumda bütçe sıfırdan dökülürken gerekir; günlük tek-kalem kullanımda gerekmez.
- "Ne zaman" göstergesinin DOKUNULABİLİR olduğu görsel olarak belli olmalı; yoksa kullanıcı çoğul dönemi hiç keşfetmez.

### F. Şema sonucu
- Döneme bağ KALEMDE durur (kart dönemden bağımsız); matris türetilir. Mevcut budget_stages → "dönem" katmanı (ait-dönem). Nakit-dönem ikinci eksen, gerçekleşen diliminde eklenir. Beş katman disiplini (şema→RLS→trigger→servis→UI) bu göçte uygulanır; küçük migration, erken.

## Bütçe göçü uygulandı + köprü kararları (2026-06-14)
- Göç canlıya alındı (commit e63fbb0, supabase db push): kart=departman (dönemden koptu), budget_stages = "dönem" katmanı (start/end_date eklendi, nullable), miktar budget_items'tan budget_item_periods köprüsüne taşındı.
- YENİ tablo budget_item_periods (kalem<->dönem köprüsü, ait-dönem ekseni): her kalem-dönem çifti tek satır; o dönemdeki miktar köprüde durur. Kalemde birim net / birim / adet / yük SABİT kalır. Satır toplamı = dönem tutarlarının toplamı (türetilir, A kararı).
- Dönem tarihi NULLABLE: iskelet açılırken tarih zorunlu değil. "Dönem tarihli olmalı" zorlaması MÜHÜRDE (fn_lock_budget) — iskelet gevşek, mühür sıkı.
- "En az bir dönem" kuralı da MÜHÜRDE (DB'de çocuk-satır-zorunlu kurmadık, kırılgan olurdu): mühür tam/geçerli fotoğraf ister (B16 kasa).
