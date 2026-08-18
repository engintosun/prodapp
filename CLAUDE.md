# KAAPA — CLAUDE.md

**Son güncelleme:** 18 Ağustos 2026

Her oturum bu dosyayla başlar. Yalın tutulur (<120 satır); detay ayrı dosyalarda, ihtiyaç anında okunur. Kayıt sinyali boğmaz: az, net, güncel.

## Oturum protokolü
- **Açılış:** CURRENT.md oku → 4-5 satırlık durum raporu → Engin onaylamadan iş başlamaz. Durum raporu ayrıca BAYATLIK TARAMASI içerir: o oturumda çalışılacak konunun kendi karar dosyası ile CURRENT.md birbirini tutuyor mu, tek satırla söylenir (genel tarama değil, yalnız o günkü konu). Durum raporunda hicbir is CIPLAK sunulmaz: onerilen her isin yaninda NEYE BAGLI oldugu ve NEYI BLOKE ETTIGI yazilir; taranmadiysa "taranmadi" denir. Menu sunmadan (hangisinden baslayalim demeden) once bagimlilik taranir. Onceki oturumda alinan kararlar CURRENT.md Milestone gunlugunun son kaydinda GOZDEN GECIRILECEK KARARLAR basligiyla duruyorsa, durum raporunda madde madde sunulur ve Engin onaylamadan is baslamaz. Tam-dosya / tüm-tarihçe okuması YOK. Okuma TEYİTLİ olmalı: bir araç içerik yerine boş/URL dönerse bu "okundu" değil DUR sinyalidir; gerçek içerik görülmeden "okundu" denmez (raw.githubusercontent güvenilmez → tarball/curl kullan). Git kimliği (user.name/user.email) her fresh clone'da kontrol edilir, tanımlı değilse --local olarak Claude <noreply@anthropic.com> ile ayarlanır — hangi bilgisayar olduğu önemli değil, bu soru bir daha sorulmaz. Açılışta okunan üçlü = CLAUDE.md + CURRENT.md + INDEX.md BÖLÜM 4. INDEX.md'nin bölüm 2 ve 7'si açılışta okunmaz, arandığında açılır. Ayrıca: çelişkide sıra repo > CURRENT.md > INDEX.md. **SIĞ KLON YASAK:** repo `--depth 1` ile klonlanmaz. Sığ klonda git tek commit tanır; doc-check her dokümanın son değişiklik tarihini o commit'e eşitler, [A] uyarıları şişer ve [E] hash denetimi yanlış tetiklenir. Tarihe ve geçmişe dayanan HER denetim sığ klonda yanlış sonuç verir. Beş oturumda beş kez tekrarlandı (12-13-14-15-17 Ağustos 2026), her seferinde fark edilip `git fetch --unshallow` ile düzeltildi; uyarı CURRENT.md'de duruyordu ama açılışta okunmuyordu, 17 Ağustos 2026'da Engin kararıyla buraya taşındı.
- **Kapanış:** CURRENT.md'yi baştan YAZ (ekleme değil): milestone · son commit · sıradaki 1-3 iş · açık kararlar. Tarihçe git log'da yaşar. Kapanışta `npm run doc-check` çalıştırılır, çıktısı kapanış promptuna girer; betik uyarır, build'i kırmaz. CURRENT.md "## Durum" bölümünün ilk satırı "HEAD: <kısa hash> (<tarih> — <oturum adı>)" biçimiyle başlar; hash kapanış commit'inin kısa hash'idir ve doc-check Denetim E bunu denetler. **Diyet (zorunlu):** Milestone günlüğünde son 10 kayıt kalır; daha eskiler tek paragraflık "buraya kadar ne kuruldu" özetine iner. Özete inen kaydın taşıdığı kararın özel-ev dosyasında karşılığı yoksa, budamadan ÖNCE oraya taşınır (KALICILIK KURALI). Dosya tavanı 120 satır — aşılıyorsa önce özet paragrafı sıkıştırılır, mühürlü/kilitli kararlar budanmaz.
- **Git komut sözdizimi:** ebeveyn commit gösterimi `HEAD~1` ile yazılır, `HEAD^` KULLANILMAZ — Windows'ta cmd.exe satır sonundaki caret karakterini yutar ve `HEAD^` sessizce `HEAD`'e dönüşür; bu yalnız yanlış uyarı değil YANLIŞ-NEGATİF de üretir (5 Ağustos 2026 doc-check Denetim E bulgusu). Kural tüm betikler ve tek seferlik komutlar için geçerlidir.
- **Okuma zorunluluğu (Engin kararı 2026-07-31):** CLAUDE.md, CURRENT.md ve işe konu olan dosyalar OKUNUR; maliyetli olması mazeret değildir. Bir tabloya veya listeye kayıt eklenecekse tablonun TAMAMI ve varsa sayaç/özet satırları okunur — boş numara aramak okumak DEĞİLDİR. Grep dosyayı veya satırı BULMAK içindir, içeriği anlamak için yetersizdir. Yukarıdaki "tam-dosya okuması YOK" kuralı İLGİSİZ dosyalar içindir; dokunulacak dosyanın dokunulacak bölümü her zaman baştan sona okunur. Token bütçesi gereksiz iş yapmamak ve loopa girmemek içindir, okumamak için DEĞİL. OKUNANLAR satırı SOHBETTE, prompt bloğunun hemen üstünde yazılır — bloğun İÇİNE girmez, çünkü Sonnet'e hitap etmez; denetim Engin'dedir: hangi dosya, hangi satır aralığı. Tetikleyici: 31 Temmuz 2026, TECH-DEBT.md'ye kayıt eklenirken yalnız boş TD numarası arandı, tablo ve sayaç satırları okunmadı; sayacın 28 Temmuz'dan beri bayat olduğu ve borç sınırının fiilen dolduğu ancak Sonnet çalışmanın ortasındayken ortaya çıktı.

## Karar nereye yazılır (yol haritası)
KALICILIK KURALI gereği her karar CURRENT.md'ye VE kendi özel-ev dosyasına yazılır. Ev adresleri:
- Bir ekranın davranışı (ne görünür, ne olur) → o ekranın kararlar dosyası (bütçe: docs/butce/BUTCE-EKRAN-KARARLARI.md)
- Ekranlar-arası ortak ilke (renk, katman sırası, odak görünümü, etkileşim) → docs/TASARIM-KARARLARI.md
- Uygulama kabuğu (dört bölge, sol ray, üst bağlam, sağ referans, modül kapıları, adres şeması) → docs/KABUK-KARARLARI.md
- Veri yapısı (tablo, kolon, fonksiyon) → docs/butce/BUTCE-SEMA-KARARLARI.md
- Kodun nerede duracağı → docs/butce/BUTCE-UI-MIMARISI.md
- Terim ve adlandırma → docs/GLOSSARY.md
- Hesap ve iş kuralı → docs/IS-KURALLARI.md
- Bilerek bırakılan borç → docs/TECH-DEBT.md
- Sıradaki iş → CURRENT.md · Tamamlananlar ve uzun vadeli backlog → docs/IS-SIRASI.md
Emin olunamayan durumda dosya listesine BAKILIR, tahmin edilmez.

## Proje kimliği
KAAPA — sinema/TV prodüksiyon harcama yönetimi SaaS. (Repo adı: prodapp; ürün adı her zaman KAAPA.)
Stack: React 19 + TS + Vite PWA · Supabase (AWS İstanbul, KVKK) · Vercel. Canlı: prodapp-navy.vercel.app.
Dil: chat Türkçe; kod İngilizce (değişken/fonksiyon/dosya/commit/yorum); dokümanlar Türkçe.

## Opus / Sonnet
- **Opus (ben):** mimari, plan, karar, spec/prompt. Kod YAZMAM.
- Opus, atilabilir sandbox klonunda deney/prototip yapabilir (hipotez dogrulama, kanit toplama). Bu prototipler repoya ASLA gitmez; repoya giden her satiri Sonnet yazar. (Karar: 2026-07-16)
- Sandbox temizligi: Kanit toplandiktan ve rapor edildikten sonra Opus sandbox klonunu SILER; klon oturum veya konu boyunca diskte kalmaz. Gerekce: bayat prototip kalintisi sonraki dogrulamalari kirletir ve yanlis sinyal uretir. (Karar: 2026-07-16)
- **Araç orantısı (Karar: 2026-07-17):** Sandbox/klon yalnız davranış kanıtı (lint/build/test sonucu) veya çok-dosyalı kod keşfi için; tek dosya okuma/anchor teyidi API'den yapılır. Klon en ağır araçtır, ilk araç değil.
- **Sandbox turu zorunlu (Engin karari 2026-08-02):** Spec'te OKUYARAK dogrulanamayan bir varsayim varsa, prompt Sonnet'e GITMEDEN once sandbox turu kosulur. Uc tetik: yeni paket/arac davranisi, canli semaya degen SQL, ekrandaki metne dayanan iddia. Bilinen desende kod duzenleyen dilimler (hizalama, kolon dikisi, servis cagrisi) tetigi CEKMEZ. Tur bitince klon silinir (ustteki temizlik maddesi). Tetikleyici: TD-23 promptu kanitsiz teslim edilmisti; tur iki bulgu uretti (kurulumun bastigi guvenlik uyarisi Sonnet'i kapsam disina sapabilirdi; testler mutasyonla sinanip gercekten kirmiziya donduklari kanitlandi).
- **Sonnet (Claude Code):** kod, commit, push. Mimari karar almaz.
- Handoff: Opus tek-commit spec'i verir → Sonnet uygular → oturum kapanır. Sonnet beklenmedik durumda commit atmaz, raporlar, geri döner.

## Üretim modeli (spec-driven)
- Özellik = TEK kendi-kendine-yeten spec: hangi dosyalar · neyin kapsam-dışı · sonda uçtan-uca doğrulama adımı.
- Prompt/spec, SOHBET İÇİNDE tek KOD BLOĞU olarak verilir (kopyala düğmesi olan kutu). Dosya veya indirme bağlantısı olarak VERİLMEZ, satır içi düz metin olarak da verilmez. Markdown dil etiketi yok, bölünmüş blok yok; bloğun içine kullanıcının ayrıca yazması gereken talimat konmaz — blok tek başına yapıştırılabilir olmalı. Cevap tek kelimeyse blok gerekmez. (Engin kararı 2026-08-01; önceki "düz-metin dosya, present_files" biçimi 3 Haziran 2026'da 40893ae ile girmişti, geçersizdir.)
- Değer spec'i düşünmekte — kısa ve net tut.
- **Yalın spec (Karar: 2026-07-17):** Tören (branch yasağı, kapı komutları, push+hash+dal teyidi, DUR kuralları) yalnız bu dosyada yaşar, spec'e kopyalanmaz. Spec şunları taşır: başta 2 satır sigorta ("CLAUDE.md'yi oku ve uygula; kapılar geçmeden commit yok") · 1 cümle amaç · ESKİ/YENİ blokları · kapsam dışı · işe özgü beklenenler · commit mesajı. İstisna: claude.ai hostlu Claude Code bu dosyayı okumaz → hosted oturumda tam tören spec'e geri döner. CLAUDE.md oturum ortasında değişirse spec'e "yeniden oku" satırı konur.

## Prompt zorunlulukları (Sonnet'e)
- Baş: `git checkout main && git pull origin main` + branch yasağı (yeni branch açma; commit öncesi `git branch --show-current` ≠ main ise DUR).
- Checklist KOMUT olarak yazılır: `npm run build` (= tsc -b && vite build) ÇALIŞTIR; "built" görmeden COMMIT ATMA. (tsc --noEmit YETMEZ — build-mode farklı yakalar.)
- `npx eslint .` KOMUT olarak checklist'e girer: 0 HATA görmeden COMMIT ATMA (warning bloklamaz; mevcut 2 react-refresh uyarısı bilinen/kapsam dışı). Kapı yeşil doğdu: BORÇ-B3, 2026-07-16.
- `npm test` KOMUT olarak checklist'e girer: CURRENT.md'deki güncel test sayısı TAM geçmeden COMMIT ATMA (sayı bu dosyada değil CURRENT.md'de yaşar).
- Commit öncesi `git diff --stat` ÇALIŞTIRILIR: yalnız spec'te beklenen dosyalar değişmiş olmalı; fazlası varsa DUR ve raporla.
- str_replace anchor'ları apostrof/akıllı-tırnak/tire İÇERMEZ; kod string'lerinde de apostrof yok. Yeni/tam dosya = Write.
- Satır numarası dosyada uymuyorsa DUR ve raporla; tahminle değiştirme.
- `react-hooks/exhaustive-deps` uyarısı bağımlılık dizisi GENİŞLETİLEREK susturulmaz: kullanılan değer hook'un dışına çıkarılır (primitive bağımlılık). Nesnenin tamamı bağımlılık olur ancak gerçekten tamamı kullanılıyorsa. Gerekçe: her yenilemede yeni referansla doğan nesne (`card` gibi) hesabı boşuna tekrarlatır ve linter FAZLA bağımlılığı yakalamaz — yeşile en kısa yol yanlış yoldur. Tetikleyici: D3c-3, 1 Ağustos 2026, aynı hata tek dilimde iki kez.
- Son: `git push origin main` + `git fetch && rev-parse HEAD ile origin/main` eşitlik teyidi + `git branch --show-current` çıktısı raporlanır (yalnız bu `main` dönerse "main'e push edildi" denir; aksi halde "main'e BİRLEŞMEDİ, dal adı: X, PR/merge gerekli" yazılır — claude.ai hostlu Claude Code kendiliğinden ayrı dal açabilir, bu durumda PR + Engin'in manuel merge'ü gerekir).

## Doğrulama
- **Push doğrulama (zorunlu — Engin kararı 2026-08-01):** Opus, Sonnet'in raporuna GÜVENMEDEN her push'u origin'den bağımsız doğrular: hash eşitliği (HEAD = origin/main), dal adı, `git ls-remote --heads` ile başıboş dal taraması, commit'te değişen dosya listesi. Ayrıca commit'te değişen HER dosyanın İÇERİĞİ origin'den okunur ve spec ile karşılaştırılır; bu adım şüphe koşuluna bağlı DEĞİLDİR (Engin kararı 4 Ağustos 2026: değişen dosya listesi yalnız doğru dosyaya dokunulduğunu gösterir, doğru yazıldığını göstermez). Rapor doğrulama DEĞİLDİR — "main'e gitti / kapılar yeşil" ancak doğrulandıktan sonra denir. Doğrulama `git ls-remote` veya sığ fetch ile yapılır, tam klon gerektirmez; "rutin elle klonlama yok" ve araç orantısı kuralları bu görevi KAPSAMAZ.
- Kod-seviyesi şüphe varsa (diff gerçekten spec kadar mı, kapılar gerçekten geçiyor mu) taze klon + kapıların bağımsız koşulması eklenir.
- Hook (PostToolUse → build/tsc; Stop → git status) bir HEDEFTİR, kurulu değildir; kurulsa bile Sonnet'in KENDİ kapısıdır ve Opus'un doğrulama yükümlülüğünü kaldırmaz. TARİHÇE: bu madde 3 Haziran 2026'da 40893ae ("CLAUDE.md yalinlastirildi") ile kaldırıldı; gerekçe doğrulamanın hook'a devredilmesiydi, hook hiç kurulmadı. Kaldırma, Claude Code'un kendiliğinden dal açtığının keşfinden iki gün sonraya denk geldi. 1 Ağustos 2026'da origin'de dört başıboş dal bulununca Engin kararıyla geri kondu.
- **Çıktı mühürlemeden önce kaynağa dön.** "Tamam / sabit / kapandı / mühürlendi" diye sunulan her çıktı — liste, tablo, "şu yapıldı" tespiti, prompta girecek sayı veya kural adı — o çıktıyı üreten kaynaktan (dosya bölümü ya da kodun ilgili yeri) DOĞRULANMIŞ olmalıdır. Dönülmediyse o kelimeler kullanılmaz, "doğrulamadım" denir. Liste üretirken önce KAYNAK SAYILIR: kaç kaynak var, hangileri tarandı; liste hepsinden geçmediyse "eksik olabilir" diye işaretlenir. Sohbet içi yorum bu kuralın dışındadır. (Kural 6 Ağustos 2026'da kondu; o oturumda beş ihlal üst üste yaşandı: üst şerit iki şerit yerine tek sanıldı, GLOSSARY alias satırı bölüm başlığı görülmeden bütçe yerine harcama doktrini sanıldı, durum geçişleri koda bakılmadan "servise dağılmış" denildi, rakip ızgarası üç kez "sabit" diye sunulup üç kez eksik çıktı, promptta "5-madde kuralı" yazıldı ama TECH-DEBT'in kendi tavanı 10.)

- **Yokluk iddiası da iddiadır (Engin kararı 18 Ağustos 2026):** "karar yok / açık / karara bağlanmamış / kaynak yok" demeden ÖNCE INDEX.md bölüm 7 (DOKUMANTASYON HARITASI) açılır ve konuya bakan dosya oradan bulunur; açılmadıysa "karar yok" denmez, "bakmadım" denir. Gerekçe: yukarıdaki "çıktı mühürlemeden önce kaynağa dön" maddesi yalnız OLUMLU iddiaları (tamam/kapandı/mühürlendi) tutuyordu; yokluk iddiasının simetrik karşılığı yoktu ve bir kararın var olduğunu görmemek, olmayan bir kararı uydurmakla aynı maliyeti üretiyor. 14 Ağustos 2026'da konan "doküman YAZMADAN önce bölüm 7 açılır" kuralı yalnız yazma yönünü tutar; bu madde OKUMA yönünü tutar. Tetikleyici: 18 Ağustos 2026, DILIM 1100-B açılışı — Opus dört soruyu "karara bağlanmamış" diye Engin'e getirdi, ikisinin cevabı BUTCE-UI-MIMARISI bölüm 3 hedef dosya haritasında zaten yazılıydı (grup anahtarının evi format.ts, başlık satırı bileşeni components/ altında) ve bölüm 7'nin tek satırı doğrudan o dosyaya götürüyordu; oturumun yarısı harcandı.

## Dur kuralları
- >5 dosya / >300 satır / mantık-tekrarı / scope creep / kalıcı-kararı-olmayan-seçim → DUR.
- Engin "dur, sahada işlemez, geçtim" → anında keser.

## Karar disiplini
- **Re-soru yasağı:** karar verildiyse UYGULA; aynı kararı tekrar sorma, kendinle tartışma (entropi/loop). Sıkışırsan DUR ve sor — boğuşma.
- **Gereksizlik uyarısı:** Opus gereksiz gördüğü mekanizmayı — istek Engin'den gelse bile — kurmadan önce söyler; sessizce inşa etmez.
- **Mimari çatal uyarısı zorunlu:** Bir tasarım kararı (şema/veri modeli/kapsam sınırı) gelecekte bir esnekliği kısıtlıyorsa, Claude bunu karar anında somut örnekle söyler ("X yaparsak Y senaryosunu yakalayamayız" formatında) — Engin sonradan keşfedince değil. Sessiz basitleştirme yasak. (Karar: 2026-07-09)
- Karar formatı: 1 karar + 1 cümle + "kabul/itiraz?". Karar Engin'in.
- **Prompt ancak AÇIK onaydan sonra yazılır (Engin kararı 2026-08-04, daha önce sözlü olarak defalarca söylendi ve dosyaya hiç girmemişti):** Sonnet'e gidecek hiçbir spec/prompt bloğu Engin açıkça onay vermeden yazılmaz. Onay varsayımı yasak; "son kontrol", "düzeltilmiş hâli", "sadece şu adımı güncelledim" gerekçeleriyle blok üretmek de yasak. Onay verilen prompt teslim edildikten sonra yeni bir teknik gözlem çıkarsa, o ayrıca konuşulur — önceki onay yeni parçaya genişlemez.
- **Placeholder disiplini:** spec'i olan yüzeye birebir spec değeri yazılır; uydurma değer (etiket/sekme/metin) yok. Zorunlu erteleme → `// TODO-SPEC: <ne + hangi dosya/karar>` + CURRENT.md'ye işle.
- **Doküman kazanır — mutlak DEĞİL (revize 2026-07-30, Engin kararı):** doküman standarttır, kutsal kitap değildir; yetersiz kalabilir ya da yeni bir durumda yanlış olabilir, körü körüne uygulanmaz. (1) Kod-doküman çelişkisi bulunursa DUR ve söyle; sessizce taraf tutma. (2) Doküman bir KARARI tarif ediyorsa doküman kazanır, kod düzeltilir. (3) Doküman kararın UYGULAMA TAHMİNİNİ tarif ediyorsa gerçek kazanır, doküman düzeltilir ve gerekçesi tek cümle yazılır. Somut emsal: bölüm 16'nın "cellKind combobox DEĞİŞMEZ" satırı (2) değil (3) çıktı.
- **Kaldırma "ekleme" olarak sunulamaz (Engin kararı 2026-08-01):** doküman değişikliği onaya sunulurken KALDIRILAN her kural birebir gösterilir; yerine yenisi geliyorsa eski ve yeni yan yana yazılır, toplu sadeleştirmede silinen madde listesi ayrıca verilir. Tetikleyici: 3 Haziran 2026, 206 satır silen rewrite bir madde listesiyle onaylatıldı ve silinen zorunlu doğrulama maddesinin adı hiç geçmedi.
- **Hedefe dayanarak kontrol kaldırılmaz (Engin kararı 2026-08-01):** var olan bir kontrol, henüz kurulmamış bir mekanizmaya dayanarak kaldırılamaz; yerine geçecek mekanizma ÇALIŞIR halde görülmeden eski kontrol durur. Dosyada "hedef" diye yazılmış hiçbir şey yürürlükteki bir kuralı iptal edemez.
- **5-KATMAN KURALI:** Her özellik, Sonnet'e prompt yazılmadan ÖNCE beş katmanda birlikte tasarlanır: şema → RLS → trigger → servis → UI. Atlanan katman sonradan "planlanmamış iş" olarak patlar; bu, tekrar eden boşlukların kök çözümüdür.
- **KALICILIK KURALI:** Bir sohbette mimari karar/plan üretildiğinde o karar AYNI sohbet içinde CURRENT.md'ye VE (eğer karar bir özel-ev dosyasının konusuysa — GLOSSARY/ARCHITECTURE/TECH-DEBT/IS-SIRASI/docs/butce/* vb.) O DOSYAYA DA işlenir. Yalnız CURRENT.md'ye yazıp özel-ev dosyasını atlamak yasaktır (2026-07-14 MD denetiminde ARCHITECTURE/GLOSSARY/TECH-DEBT/IS-SIRASI'nın haftalarca dokunulmadığı, CURRENT.md'nin tek yazım yeri haline geldiği tespit edildi — bu madde o tekrarı önler). "Kapanışta yaparız" ertelemesi yasaktır; context dolunca kararı öldürür.

## Teknik kurallar
- SSOT: Supabase. Client kopya; çakışmada Supabase kazanır.
- Sessiz hata YASAK: throw veya kullanıcıya bildirim. Boş catch / sessiz return yok.
- Katman ayrımı: veri (Supabase) → iş mantığı (saf fonksiyon) → UI → orkestrasyon.
- Supabase client tipsiz → sonuç cast `as unknown as X`. tsconfig: noUnusedLocals + noUnusedParameters AÇIK (kullanılmayan import/değişken bırakma).
- İsim: DB snake_case · JS camelCase · dosya kebab-case. Tehlikeli kökler (gec/tip/durum/kat) kodda Türkçe KULLANMA → GLOSSARY.md.

## Context routing
- Mimari → docs/ARCHITECTURE.md · Auth/rol/RLS → docs/AUTH-KARARLARI.md (canlı RLS tanımı baseline'da) · Şema → supabase/migrations/ TÜMÜ (baseline = BAYAT taban; güncel şema = baseline + sonraki tüm göçler; şema ararken göçleri kronolojik oku, yalnız baseline'a güvenme)
- İş kuralı/onay/dönem/avans → docs/IS-KURALLARI.md · Ekran → docs/EKRAN-{SAHA,DEPT,MUHASEBE}.md + TASARIM-KARARLARI.md · İsim → GLOSSARY.md · Sıradaki iş → CURRENT.md · Tamamlananlar/backlog → IS-SIRASI.md
- Bütçe kart/kalem domain → docs/butce/ (KART-KATALOGU = kart/kalem katalog+motor · KART-GEREKCELERI = neden/eğitim · BUTCE-ARASTIRMA-DURUM = şablon/kalem araştırması). Bütçe şema/teknik (B-serisi · köprü · KDV · percent_lines) → BUTCE-SEMA-KARARLARI + baseline. Bütçe ekran davranışı → BUTCE-EKRAN-KARARLARI · bütçe kod yapısı → BUTCE-UI-MIMARISI · uygulama kabuğu → KABUK-KARARLARI.
- Not: eski supabase/SUPABASE-{SCHEMA,RLS,FUNCTIONS}.sql ve full-rebuild.sql artık docs/archive/'te (bayat, tarihsel referans). Canlı şema/RLS/fonksiyon/trigger/grant tek kaynağı baseline'dır.
- Eşleşme yoksa → ARCHITECTURE.md oku, sonra sor.

## Faz 1 kapsamı
Tam liste docs/ARCHITECTURE.md §2.1. Listede yoksa Faz 1'de yoktur.

## Ortamlar / deploy
Sonnet (Claude Code) Engin'in bilgisayarında terminalde çalışır; GitHub + Supabase CLI girişli (girişler tek seferlik yapıldı, tekrar login yok). Tek elden:
- **Sonnet yapar:** kod + commit + push + edge deploy (`supabase functions deploy <ad>`) + SQL/şema/RLS uygulama (CLI, `supabase db push`).
- **Engin onayı:** SADECE şema/RLS/grant değişikliği UYGULANMADAN ÖNCE (canlı KVKK verisi güvenlik geçidi). Onay = SQL'i okuyup "kabul" demek; kopyala-yapıştır yok, uygulamayı Sonnet yapar. Kod/edge/normal işler onay gerektirmez. Salt-okuma (dump/inceleme) onay gerektirmez.
- **Yeni tablo → GRANT + RLS policy (ikisi de gerekir).** ensure_rls event trigger'ı yeni tabloya RLS'i otomatik açar ama policy yine elle yazılır.
- **Edge:** canlı kod = repo kodu (fark varsa repo güncellenir). Dashboard'dan ASLA deploy edilmez (rastgele isim + verify_jwt düğmesi yok) → sadece CLI. Yeni fonksiyon adı = klasör adı.
- **Vercel:** push'ta otomatik deploy, elle dokunma. **GitHub:** ortak hafıza.
- Not: bazı CLI işlemleri (`db dump` / `db reset`) Docker ister; Engin'de Docker yok → bunlar için Docker'sız yedek kullanılır (doğrudan `pg_dump` / Supabase SQL Editor). `db push` (migration uygulama) Docker'sız çalışır.