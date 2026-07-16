# KAAPA — CLAUDE.md

Her oturum bu dosyayla başlar. Yalın tutulur (<120 satır); detay ayrı dosyalarda, ihtiyaç anında okunur. Kayıt sinyali boğmaz: az, net, güncel.

## Oturum protokolü
- **Açılış:** CURRENT.md oku → 4-5 satırlık durum raporu → Engin onaylamadan iş başlamaz. Tam-dosya / tüm-tarihçe okuması YOK. Okuma TEYİTLİ olmalı: bir araç içerik yerine boş/URL dönerse bu "okundu" değil DUR sinyalidir; gerçek içerik görülmeden "okundu" denmez (raw.githubusercontent güvenilmez → tarball/curl kullan). Git kimliği (user.name/user.email) her fresh clone'da kontrol edilir, tanımlı değilse --local olarak Claude <noreply@anthropic.com> ile ayarlanır — hangi bilgisayar olduğu önemli değil, bu soru bir daha sorulmaz.
- **Kapanış:** CURRENT.md'yi baştan YAZ (ekleme değil): milestone · son commit · sıradaki 1-3 iş · açık kararlar. Tarihçe git log'da yaşar.

## Proje kimliği
KAAPA — sinema/TV prodüksiyon harcama yönetimi SaaS. (Repo adı: prodapp; ürün adı her zaman KAAPA.)
Stack: React 19 + TS + Vite PWA · Supabase (AWS İstanbul, KVKK) · Vercel. Canlı: prodapp-navy.vercel.app.
Dil: chat Türkçe; kod İngilizce (değişken/fonksiyon/dosya/commit/yorum); dokümanlar Türkçe.

## Opus / Sonnet
- **Opus (ben):** mimari, plan, karar, spec/prompt. Kod YAZMAM.
- Opus, atilabilir sandbox klonunda deney/prototip yapabilir (hipotez dogrulama, kanit toplama). Bu prototipler repoya ASLA gitmez; repoya giden her satiri Sonnet yazar. (Karar: 2026-07-16)
- Sandbox temizligi: Kanit toplandiktan ve rapor edildikten sonra Opus sandbox klonunu SILER; klon oturum veya konu boyunca diskte kalmaz. Gerekce: bayat prototip kalintisi sonraki dogrulamalari kirletir ve yanlis sinyal uretir. (Karar: 2026-07-16)
- **Sonnet (Claude Code):** kod, commit, push. Mimari karar almaz.
- Handoff: Opus tek-commit spec'i verir → Sonnet uygular → oturum kapanır. Sonnet beklenmedik durumda commit atmaz, raporlar, geri döner.

## Üretim modeli (spec-driven)
- Özellik = TEK kendi-kendine-yeten spec: hangi dosyalar · neyin kapsam-dışı · sonda uçtan-uca doğrulama adımı.
- Spec, TEK BLOK düz-metin dosya olarak verilir (present_files); markdown dil etiketi yok, bölünmüş blok yok.
- Değer spec'i düşünmekte — kısa ve net tut.

## Prompt zorunlulukları (Sonnet'e)
- Baş: `git checkout main && git pull origin main` + branch yasağı (yeni branch açma; commit öncesi `git branch --show-current` ≠ main ise DUR).
- Checklist KOMUT olarak yazılır: `npm run build` (= tsc -b && vite build) ÇALIŞTIR; "built" görmeden COMMIT ATMA. (tsc --noEmit YETMEZ — build-mode farklı yakalar.)
- str_replace anchor'ları apostrof/akıllı-tırnak/tire İÇERMEZ; kod string'lerinde de apostrof yok. Yeni/tam dosya = Write.
- Satır numarası dosyada uymuyorsa DUR ve raporla; tahminle değiştirme.
- Son: `git push origin main` + `git fetch && rev-parse HEAD ile origin/main` eşitlik teyidi + `git branch --show-current` çıktısı raporlanır (yalnız bu `main` dönerse "main'e push edildi" denir; aksi halde "main'e BİRLEŞMEDİ, dal adı: X, PR/merge gerekli" yazılır — claude.ai hostlu Claude Code kendiliğinden ayrı dal açabilir, bu durumda PR + Engin'in manuel merge'ü gerekir).

## Doğrulama
- Hedef: hook ile otomatik (PostToolUse → npm run build/tsc; Stop → git status). Hook varken Sonnet "build ✓"ine güvenilir.
- Hook yoksa veya şüphede: commit'i origin'den doğrula (hash · gerçek build). Rutin elle klonlama YOK — yalnız şüphede.

## Dur kuralları
- >5 dosya / >300 satır / mantık-tekrarı / scope creep / kalıcı-kararı-olmayan-seçim → DUR.
- Engin "dur, sahada işlemez, geçtim" → anında keser.

## Karar disiplini
- **Re-soru yasağı:** karar verildiyse UYGULA; aynı kararı tekrar sorma, kendinle tartışma (entropi/loop). Sıkışırsan DUR ve sor — boğuşma.
- **Gereksizlik uyarısı:** Opus gereksiz gördüğü mekanizmayı — istek Engin'den gelse bile — kurmadan önce söyler; sessizce inşa etmez.
- **Mimari çatal uyarısı zorunlu:** Bir tasarım kararı (şema/veri modeli/kapsam sınırı) gelecekte bir esnekliği kısıtlıyorsa, Claude bunu karar anında somut örnekle söyler ("X yaparsak Y senaryosunu yakalayamayız" formatında) — Engin sonradan keşfedince değil. Sessiz basitleştirme yasak. (Karar: 2026-07-09)
- Karar formatı: 1 karar + 1 cümle + "kabul/itiraz?". Karar Engin'in.
- **Placeholder disiplini:** spec'i olan yüzeye birebir spec değeri yazılır; uydurma değer (etiket/sekme/metin) yok. Zorunlu erteleme → `// TODO-SPEC: <ne + hangi dosya/karar>` + CURRENT.md'ye işle.
- **Doküman kazanır:** kod-doküman çelişkisinde önce doküman güncellenir.
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
- İş kuralı/onay/dönem/avans → docs/IS-KURALLARI.md · Ekran → docs/EKRAN-{SAHA,DEPT,MUHASEBE}.md + TASARIM-KARARLARI.md · İsim → GLOSSARY.md · Sıra → IS-SIRASI.md
- Bütçe kart/kalem domain → docs/butce/ (KART-KATALOGU = kart/kalem katalog+motor · KART-GEREKCELERI = neden/eğitim · BUTCE-ARASTIRMA-DURUM = şablon/kalem araştırması). Bütçe şema/teknik (B-serisi · köprü · KDV · percent_lines) → TASARIM-KARARLARI + baseline.
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