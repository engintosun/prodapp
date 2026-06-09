# KAAPA — CLAUDE.md

Her oturum bu dosyayla başlar. Yalın tutulur (<120 satır); detay ayrı dosyalarda, ihtiyaç anında okunur. Kayıt sinyali boğmaz: az, net, güncel.

## Oturum protokolü
- **Açılış:** CURRENT.md oku → 4-5 satırlık durum raporu → Engin onaylamadan iş başlamaz. Tam-dosya / tüm-tarihçe okuması YOK.
- **Kapanış:** CURRENT.md'yi baştan YAZ (ekleme değil): milestone · son commit · sıradaki 1-3 iş · açık kararlar. Tarihçe git log'da yaşar.

## Proje kimliği
KAAPA — sinema/TV prodüksiyon harcama yönetimi SaaS. (Repo adı: prodapp; ürün adı her zaman KAAPA.)
Stack: React 19 + TS + Vite PWA · Supabase (AWS İstanbul, KVKK) · Vercel. Canlı: prodapp-navy.vercel.app.
Dil: chat Türkçe; kod İngilizce (değişken/fonksiyon/dosya/commit/yorum); dokümanlar Türkçe.

## Opus / Sonnet
- **Opus (ben):** mimari, plan, karar, spec/prompt. Kod YAZMAM.
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
- Son: `git push origin main` + `git fetch && rev-parse HEAD ile origin/main` eşitlik teyidi.

## Doğrulama
- Hedef: hook ile otomatik (PostToolUse → npm run build/tsc; Stop → git status). Hook varken Sonnet "build ✓"ine güvenilir.
- Hook yoksa veya şüphede: commit'i origin'den doğrula (hash · gerçek build). Rutin elle klonlama YOK — yalnız şüphede.

## Dur kuralları
- >5 dosya / >300 satır / mantık-tekrarı / scope creep / kalıcı-kararı-olmayan-seçim → DUR.
- Engin "dur, sahada işlemez, geçtim" → anında keser.

## Karar disiplini
- **Re-soru yasağı:** karar verildiyse UYGULA; aynı kararı tekrar sorma, kendinle tartışma (entropi/loop). Sıkışırsan DUR ve sor — boğuşma.
- **Gereksizlik uyarısı:** Opus gereksiz gördüğü mekanizmayı — istek Engin'den gelse bile — kurmadan önce söyler; sessizce inşa etmez.
- Karar formatı: 1 karar + 1 cümle + "kabul/itiraz?". Karar Engin'in.
- **Placeholder disiplini:** spec'i olan yüzeye birebir spec değeri yazılır; uydurma değer (etiket/sekme/metin) yok. Zorunlu erteleme → `// TODO-SPEC: <ne + hangi dosya/karar>` + CURRENT.md'ye işle.
- **Doküman kazanır:** kod-doküman çelişkisinde önce doküman güncellenir.
- **5-KATMAN KURALI:** Her özellik, Sonnet'e prompt yazılmadan ÖNCE beş katmanda birlikte tasarlanır: şema → RLS → trigger → servis → UI. Atlanan katman sonradan "planlanmamış iş" olarak patlar; bu, tekrar eden boşlukların kök çözümüdür.
- **KALICILIK KURALI:** Bir sohbette mimari karar/plan üretildiğinde o karar AYNI sohbet içinde CURRENT.md'ye işlenir. "Kapanışta yaparız" ertelemesi yasaktır; context dolunca kararı öldürür.

## Teknik kurallar
- SSOT: Supabase. Client kopya; çakışmada Supabase kazanır.
- Sessiz hata YASAK: throw veya kullanıcıya bildirim. Boş catch / sessiz return yok.
- Katman ayrımı: veri (Supabase) → iş mantığı (saf fonksiyon) → UI → orkestrasyon.
- Supabase client tipsiz → sonuç cast `as unknown as X`. tsconfig: noUnusedLocals + noUnusedParameters AÇIK (kullanılmayan import/değişken bırakma).
- İsim: DB snake_case · JS camelCase · dosya kebab-case. Tehlikeli kökler (gec/tip/durum/kat) kodda Türkçe KULLANMA → GLOSSARY.md.

## Şema/RLS · deploy
- Şema/RLS canlıya MANUEL (Engin SQL Editor) + repo senkron ardışık commit. Yeni tablo → GRANT + RLS policy (ikisi de gerekir).
- Commit sonrası Engin canlıya alır → prodapp-navy.vercel.app'te uçtan-uca test. Edge Function: canlı kod = repo kodu (fark varsa repo güncellenir).

## Context routing
- Mimari → docs/ARCHITECTURE.md · Auth/rol/RLS → docs/AUTH-KARARLARI.md + supabase/SUPABASE-RLS.sql · Şema → SUPABASE-SCHEMA.sql
- İş kuralı/onay/dönem/avans → docs/IS-KURALLARI.md · Ekran → docs/EKRAN-{SAHA,DEPT,MUHASEBE}.md + TASARIM-KARARLARI.md · İsim → GLOSSARY.md · Sıra → IS-SIRASI.md
- Eşleşme yoksa → ARCHITECTURE.md oku, sonra sor.

## Faz 1 kapsamı
Tam liste docs/ARCHITECTURE.md §2.1. Listede yoksa Faz 1'de yoktur.

## Ortamlar / deploy
Sonnet (Claude Code) Engin'in bilgisayarinda terminalde calisir; GitHub + Supabase CLI girisli (girisler tek seferlik yapildi, tekrar login yok). Tek elden:
- **Sonnet yapar:** kod + commit + push + edge deploy (`supabase functions deploy <ad>`) + SQL/sema/RLS uygulama (CLI).
- **Engin onayi:** SADECE sema/RLS/grant degisikligi UYGULANMADAN ONCE (canli KVKK verisi guvenlik gecidi). Onay = SQL'i okuyup "kabul" demek; kopyala-yapistir yok, uygulamayi Sonnet yapar. Kod/edge/normal isler onay gerektirmez.
- **Vercel:** push'ta otomatik deploy, elle dokunma. **GitHub:** ortak hafiza.
- Edge function dashboard'dan ASLA deploy edilmez (rastgele isim + verify_jwt dugmesi yok) -> sadece CLI. Yeni fonksiyon adi = klasor adi.
- Not: Sonnet-CLI ile SQL uygulama ilk seferde dogrulanir; takilirsa yedek = Supabase SQL Editor.
