# KAAPA — CURRENT.md

⚠ TERMİNOLOJİ: 2026-07-11 öncesi kayıtlarda Miktar=kişi/adet, Çarpan=süre okunur; sonrasında Miktar=süre, X=kişi/adet (bkz. GLOSSARY tarihçe).

Yalnızca ŞİMDİKİ durumu tutar. Her oturum kapanışında baştan YAZILIR. Ne yapıldığı git log'da, kararlar kendi ev dosyalarında yaşar (harita: INDEX.md bölüm 7.0).

## Milestone

M2 — Çekirdek Döngü. Bütçe: kavram + şema + DB temeli + göç CANLI; kart mimarisi 1100-1600 KİLİTLİ; MÜHÜR-3'ün alt yapısı (etiket kopyası + proje kapsamı) CANLI. Üretim Kayıtları durağı kullanılabilir durumda.

Tamamlanan işin günlüğü git log'dadır; kararlar ve kararın ekranda ya da canlıda doğrulandığı kayıt kendi ev dosyasında, kararın yanında durur (CURRENT.md diyeti, 14 Ekim 2026).

## Durum

- HEAD: ab9fbd8 (16 Ekim 2026 — KART 2100 tasarım kayıtları ve kart yapısı taraması; bu satırı taşıyan commit kayıtların ikinci dilimi)
- **CANLI VERİ DENEME VERİSİDİR (Engin, 31 Ağustos ve 1 Ekim 2026).** KAAPA yapım aşamasında; kimse kullanmıyor, yürüyen bütçe yok. Deneme verisi için çevirme, ölçüm, ara dönem ya da "canlıda dönüşü yok" kaygısı açılmaz; gerekirse deneme verisi silinip yeniden kurulur.
- Migration 20260901130000'den 20261014120000'e kadar CANLIDA. Build geçer, eslint sıfır hata. Originde tek dal: main.
- SAYILAR BURADA YAŞAMAZ: beklenen test sayısı `.claude/test-count` dosyasında, kapı kümesi `.claude/hooks/gate.sh` ve `.claude/hooks/run-gates.sh` içinde yaşar. Bu iki sayı düzyazıda tazelenmez, sahibinden okunur.
- ÇALIŞMA ORTAMI: Docker yok (`db reset` ve `db dump` çalışmaz, `db push` çalışır ve onaya bağlıdır); salt okuma sorgusu `--linked` bayrağıyla çalışır. Ayrıntı: `CLAUDE.md` Ortamlar, `.claude/rules/supabase.md`, `docs/protokol/PROMPT.md` göç sonrası doğrulama sorgusu; Opus sandbox'ı `docs/protokol/DERSLER.md` Sandbox gerçeği.
- BORÇ DURUMU: `docs/TECH-DEBT.md` tek otoritedir, sayı burada taşınmaz.

## MÜHÜR DURUMU

MUHUR-3'ün ALT YAPISI canlıda ve doğrulandı, ama mühürleme YÜZEYİ henüz yok: `fn_lock_budget` RPC'sini uygulama kodu hiçbir yerden çağırmıyor, kullanıcının bir bütçeyi kilitleyebileceği bir buton/ekran bugün yok. Alt yapı hazır bekliyor, tetikleyen yüzey ayrı bir dilimdir. Yeni mühür mesajı ("Mühürlü bütçe değiştirilemez. Değişiklik taslakta yapılır.", göç `20260923130000`) bu yüzden sahada denenmedi; ilk mühürlemede denenir. Yüzey icmalle birlikte ve kartlardan sonra ele alınır (Engin, 30 Eylül ve 5 Ekim 2026): `docs/EKRAN-MUHASEBE.md` §19 Ekran 1.

## Karar evleri (işaretçi)

Aşağıdaki konuların TAM metni kendi ev dosyasındadır; CURRENT.md kopya taşımaz. Tam harita: `INDEX.md` bölüm 7.0.

- Vergi ve yük modeli — üç eksen, statü cetveli, `rate_catalog` → `docs/butce/VERGI-MEVZUATI.md` + `docs/butce/PERSONEL-MEVZUATI.md`
- KART 1500 kolon seti ve terminoloji mührü → `docs/butce/BUTCE-EKRAN-KARARLARI.md` + `docs/GLOSSARY.md`
- KART 1600 üç kademeli tasarım + katalog (29 atom) → `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20 + `docs/butce/KART-KATALOGU.md` §7.5
- Kişi soran kalemler (`asks_person`) ve aidiyet kuralı → `docs/butce/KART-KATALOGU.md` §7.5
- Üretim Kayıtları listesi: sütun genişlikleri, No sütunu, hiyerarşik sıralama, silme ve seç kipi, düğme yerleşimi, içe aktarma (beş biçim + ara ekran + sürükle-bırak) → `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20
- Bütçe şema kararları (B-serisi), NET/BRÜT doktrini, MÜHÜR-3, `code` park kaydı → `docs/butce/BUTCE-SEMA-KARARLARI.md`
- KART 1600 komisyon satırı, getirme yolu, ad yerleşimi ve kartın görünen düzeni → `docs/butce/BUTCE-EKRAN-KARARLARI.md` §20 + `card-view.ts` (kompozisyonun tek kaynağı) + `display-name.ts` (görünen adın tek kaynağı) + `person-groups.ts` (`COMMISSION_CATALOG_BY_KIND` tek kaynağı)
- Bir daha tartışılmayacak değişmezler → `docs/DEGISMEZLER.md`
- Kabuk, sol ray, kart masası, Üretim Kayıtları tasarımı → `docs/KABUK-KARARLARI.md`
- Kart mimarisi ve kilitli kartlar → `docs/butce/KART-KATALOGU.md`
- Gider çeşidi ekseni (bütçe tarafı kabul edildi, fiş tarafı ertelendi; 6 Ekim 2026): kararlar, aday sözlük, kütüphane eşlemesi, sandbox kanıtı, reddedilen yollar → `docs/butce/BUTCE-SEMA-KARARLARI.md` GİDER ÇEŞİDİ EKSENİ · kaynak ve rakip taraması, kurum formlarının okunuşu → `docs/rakip/GIDER-CESIDI-TARAMASI.md` · yönün sınanması, süreç kuralı ve plan → `docs/butce/GIDER-CESIDI-ANALIZI.md`
- KART 1400 Yapımcı Birimi (MMB hizası, genel gider ve kâr, kütüphane ve şablon) → `docs/butce/KART-KATALOGU.md` §7.3, gerekçe `docs/butce/KART-GEREKCELERI.md`
- KART 2100 Yapım ve Reji Ekibi (tek kart iki grup, kütüphane ve şablon, dışarıda kalanlar; tasarımda, göç sıradaki dilimde) → `docs/butce/KART-KATALOGU.md` §7.6, gerekçe `docs/butce/KART-GEREKCELERI.md` KART 2100, kaynak taraması `docs/rakip/KART-YAPISI-TARAMASI.md`
- Ödeme statüsü kümesi ve Statü rehberi → `docs/butce/BUTCE-UI-MIMARISI.md`
- Girişim: tanıtım sayfası, program başvuruları, şirket kuruluşu, BiGG ve destek araştırması → `docs/GIRISIM.md` (araştırma kaynakları `docs/girisim/`)
- İcmal ve dışa aktarım (kalemin koduna göre gruplama, "Kalem — Kişi" ad gösterimi, gösterim seviyesi, dipte Genel Gider satırı, mühür yüzeyinin sırası; henüz uygulanmadı) → `docs/EKRAN-MUHASEBE.md` §19 Ekran 1
- Hedef Mecra (bütçenin sunulacağı kurum; önce Türkiye master şablonu, sonra kurum şablonları; altyapısı henüz yok) → `docs/butce/KART-KATALOGU.md` §6, `docs/GLOSSARY.md`, `docs/butce/KART-GEREKCELERI.md` Compliance Guard
- Genel kart düzeni ve Hayvanlar kartı (henüz kurulmadı) → `docs/butce/KART-KATALOGU.md` §3
- İş etiketi (parkta; yalnız parçaları farklı kartlara dağılan iş için) → `docs/butce/KART-KATALOGU.md` §4.10
- CNC bütçe formu kaynak (Engin sorduğunda şablon ve kalem taramasında bakılır) → `docs/butce/KART-GEREKCELERI.md` kaynaklar
- Alan adı, kurumsal posta ve kaapa.com.tr tanıtım sayfası (yönlenme henüz kurulmadı) → `docs/ORKESTRASYON.md` §7

## Sıradaki iş

**ANA KONU: KART 2100 YAPIM VE REJİ EKİBİ (16 Ekim 2026).** Tasarım kararları kayıtlı: tek kart iki grup (2100-01 Yapım Ekibi, 2100-02 Reji Ekibi), 20 kalemlik kütüphane, 8 kalemlik şablon, dışarıda kalanlar (`docs/butce/KART-KATALOGU.md` §7.6; gerekçe `docs/butce/KART-GEREKCELERI.md` KART 2100; kaynak taraması `docs/rakip/KART-YAPISI-TARAMASI.md`). Sıradaki dilim göçtür: kütüphane tohumu (20 kalem, 2 grup başlığı), 2109 Teknik Danışman'ın KART 1500 kütüphanesine girmesi, film şablonu v10. Şemaya değdiği için önce sandbox turu koşulur, SQL'i Engin okur. Psikolog/Pedagog Oyuncu kartına alındı (16 Ekim 2026, Engin; `docs/butce/KART-KATALOGU.md` §7.5); kalemin bu göçe girip girmeyeceği o dilimde konuşulur. Aynı dilim `docs/butce/BUTCE-ARASTIRMA-DURUM.md` içindeki "siradaki: 1700+" satırını düzeltir (16 Ekim 2026'da beş dosya sınırı yüzünden ertelendi). Engin'le ayrıca konuşulacaklar (16 Ekim 2026): 2100'den başka karta gidenlerin ayrıntısı ve sağlık ve güvenliğin yeri (§7.6 DIŞARIDA KALANLAR ve §3; kaynakların bulguları `docs/rakip/KART-YAPISI-TARAMASI.md` §3 ve §5), Engin'in verdiği 31 bağlantının okunma maliyeti (aynı dosya §9). Gider çeşidi ekseni (13 Ekim 2026, göç `20261013120000`) ve KART 1400 Yapımcı Birimi (14 Ekim 2026, göç `20261014120000`) tamam. 2100'den sonraki kart Engin'le seçilir; her yeni kart kütüphanesini çeşidiyle getirir (`docs/butce/GIDER-CESIDI-ANALIZI.md` §9 sıra 5). Gider çeşidinin kararları ve fiş tarafının bekleyenleri: `docs/butce/BUTCE-SEMA-KARARLARI.md` GİDER ÇEŞİDİ EKSENİ. KART 1400'de bekleyenler: tam maske ve kart-özel denetim kuralları (kart görünürlük katmanı ve denetim motoruyla, §7.3). KART 1300'ün ortak motorlara bağlı kalanları: 1308'in üç bağı (Hukuk 6200 ve Sigorta 6105 kartları ile bağ motoru yok), görünürlük maskesi (kart görünürlük katmanı), ajans adı (1511 ve 1315 için aynı park). Deneme verisindeki eski hak devri satırları 0 görünür, elle yeniden yazılır. 1500'de bekleyenler: ajans adı; mühür yüzeyi (icmalle birlikte, kartlardan sonra); Hedef Mecra (Park listesi); × penceresinde çift tık.

1. **Mac turları — MAKİNE YOK (24 Eylül 2026, Engin).** Mac gerçek cihaz turu (KLV kapanışı ve `v0.2-klv` etiketi buna bağlı) ve Mac Safari'de PDF içe aktarma denemesi (PDF ilk sürümünün tamam sayılması buna bağlı; Chrome'da doğrulandı) yapılamıyor. İkisi askıda; makine bulununca aynı oturumda yapılır.

Giriş ekranında şifre alanı, Claude Code bulut oturumu ve Girişim Engin'in açmasını bekliyor: `docs/IS-SIRASI.md` Backlog, "CURRENT.md'den taşındı (14 Ekim 2026 diyeti)".

## Açık kalanlar

Karara bağlanmamış ekran soruları `docs/butce/BUTCE-EKRAN-KARARLARI.md` §21'de, kart soruları `docs/butce/KART-KATALOGU.md` §8 ve §9'da, bilerek bırakılan kusurlar `docs/TECH-DEBT.md` içinde durur. Uzun vadeli iş, backlog ve tamamlananlar: `docs/IS-SIRASI.md`.

## Park listesi

Bu bölüm, sahada ölçülen bulguların ve tetiğe bağlanmış işlerin listesidir. Her madde kendi TETİĞİYLE durur, tetik gelmeden elle aranmaz; ayrıntısı maddenin evindedir.

- **ELLE SIRALAMA.** 17 Ağustos 2026'da bilinçli kapatıldı; açılırsa boşluk doldurma değil karar çevirmedir. TETİK: kart ya da liste sıralama mekanizmasına dokunan dilim, ya da Engin'in açık talebi. Ev: `docs/butce/BUTCE-EKRAN-KARARLARI.md` §16 (Yerleşim).
- **TD-43 BOY YORUMLARI.** TETİK: o beş dosyadan birine dokunan dilim. Ev: `docs/TECH-DEBT.md` TD-43.
- **PROJE SEÇİM EKRANINDA ÇIPLAK HEX.** TETİK: o ekrana ya da kapı betiğine dokunan dilim. Ev: `docs/TECH-DEBT.md` TD-50.
- **KALEM KÜTÜPHANESİ ÇEKMESİNİN SESSİZ BAŞARISIZLIĞI.** TETİK: `use-card-rows.ts` çekme efektlerine ya da komisyon doğum anına dokunan dilim. Ev: `docs/TECH-DEBT.md` TD-44.
- **KAPI DOSYA ADINA TAKILIYOR.** TETİK: kapı betiğine dokunan dilim. Ev: `docs/TECH-DEBT.md` TD-38.
- **ÇOCUK OYUNCU DENETİMİ (Engin: gözden kaçmasın).** TETİK: genel denetim motorunun kurulması. Ev: `docs/butce/KART-KATALOGU.md` §7.5 ve §8.
- **KİŞİYİ KARTTAN ÇIKARMANIN YOLU YOK.** TETİK: Engin'in açması ya da kişi bloğuna veya getirme yoluna dokunan dilim. Ev: `docs/butce/BUTCE-EKRAN-KARARLARI.md` §21.
- **KOMİSYON SATIRINDA BORDRO SEÇENEĞİ.** TETİK: statü seçicisine ya da komisyon satırına dokunan dilim. Ev: `docs/TECH-DEBT.md` TD-45.
- **TEKRAR TELİFİ VE ADR BLOĞU BÖLÜNÜR.** TETİK: "Kime?" listesine ya da başlık gruplamasına dokunan dilim. Ev: `docs/TECH-DEBT.md` TD-46.
- **GÖREV DEĞİŞİNCE SATIR ESKİ BÖLÜMDE KALIR.** TETİK: görev değişikliğine ya da getirme yoluna dokunan dilim. Ev: `docs/TECH-DEBT.md` TD-47.
- **YER TUTUCUDAKİ RAKAM İSİM GELİNCE SESSİZCE GİDER.** TETİK: getirme yoluna dokunan dilim. Ev: `docs/butce/BUTCE-EKRAN-KARARLARI.md` §21.
- **AÇIK SEKME ESKİ SÜRÜMÜ ÇALIŞTIRIYOR.** TETİK: hatanın tekrarı ya da Engin'in açması. Ev: `docs/TECH-DEBT.md` TD-51.
- **AJANS ADI (1511 ve 1315).** TETİK: Engin'in açması. Ev: `docs/butce/KART-KATALOGU.md` §7.4.
- **HEDEF MECRA.** TETİK: bir şablon kartına gelince ya da Engin'in açması. Ev: `docs/butce/KART-KATALOGU.md` §6.
- **× PENCERESİNDE ÇİFT TIK.** TETİK: Engin'in açması. Ev: `docs/butce/BUTCE-EKRAN-KARARLARI.md` §21.
- **BAŞKA KARTA TAŞINACAK KALEMLER (Festival Katılımı, senaryo çoğaltma).** TETİK: Pazarlama/Dağıtım kartının ve genel giderlerin kartının kurulması (senaryo çoğaltma 2100'e girmez, 15 Ekim 2026). Ev: `docs/butce/KART-KATALOGU.md` §7.2 Boş numaralar ve §7.4.
- **DİZİ VE REKLAM ŞABLONUNDA SON DÖNEM: TESLİM VE KAPANIŞ (Engin: unutulmasın).** TETİK: dizi ya da reklam şablonunun kurulması. Ev: `docs/butce/KART-KATALOGU.md` §1.
- **1610-07 OTOMASYONU.** TETİK: ekip kartları ve ekip listesi. Ev: `docs/butce/KART-KATALOGU.md` §7.5 1610-07 KURALI.
- **EURİMAGES ORTAK YAPIMCI EKSENİ.** TETİK: Hedef Mecra turu. Ev: `docs/rakip/GIDER-CESIDI-TARAMASI.md` §3.14.
- **AĞIRLAMA VE TEMSİL ÇEŞİDİNİ TAŞIYAN KALEM YOK.** TETİK: raporlar turu. Ev: `docs/butce/KART-KATALOGU.md` §8.
