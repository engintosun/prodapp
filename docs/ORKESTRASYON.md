# KAAPA — ORKESTRASYON (GitHub → Supabase → Vercel) + Secret Haritası

*Üç platformun nasıl bağlandığının + secret'ların nerede yaşadığının operasyonel referansı. Mimari karar: ARCHITECTURE.md §5.6 (bu dosya onun somut haritası).*

## 1. Üç platform — GitHub tek kaynak
- **GitHub** (engintosun/prodapp, `main` = tek kaynak): tüm kod + DB migrations + edge function kaynağı burada.
- **Vercel** (https://prodapp-navy.vercel.app): frontend hosting.
- **Supabase** (proje `owadnnmtnfuzobyxtcxf`, AWS İrlanda, eu-west-1): DB + RLS + edge functions + auth + storage.

## 2. Deploy akışı — ASİMETRİK (kritik)
**Frontend → Vercel: OTOMATİK.**
- `main`'e her push → Vercel otomatik build + deploy.
- Build: `npm run build` (= `tsc -b && vite build`) → statik PWA.
- Canlı: https://prodapp-navy.vercel.app

**Backend → Supabase: ELLE (otomasyon YOK).**
- CI / GitHub Actions yok → Vercel gibi otomatik değil.
- DB şema: `supabase/migrations/00000000000000_baseline.sql` → Supabase'e elle uygulanır (pg_dump/psql ya da `supabase db push`).
- Edge functions: `supabase/functions/{accept-invitation, clear-claims, set-claims}` → Supabase'e elle deploy.
- ⚠ Risk: repo ile canlı Supabase arasında DRIFT (push edip Supabase'e deploy etmeyi unutmak). Faz 0.4 = bu senkronun kontrolü, Faz 3 = drift disiplini.

## 3. Edge functions
| Fonksiyon | verify_jwt | Ne zaman |
|---|---|---|
| accept-invitation | false | signup öncesi (davet kabul; kullanıcı henüz auth değil) |
| clear-claims | true (varsayılan) | signOut — claim temizleme |
| set-claims | true (varsayılan) | claim atama |

## 4. Secret haritası
| Secret | Nerede | Kim kullanır | Gizli? |
|---|---|---|---|
| VITE_SUPABASE_URL | local `.env` (dev) + Vercel env (prod) | frontend | hayır — public proje URL'i |
| VITE_SUPABASE_ANON_KEY | local `.env` + Vercel env | frontend | hayır — anon key, RLS korur |
| SUPABASE_SERVICE_ROLE_KEY | Supabase platform (edge fn'e oto-enjekte) | edge functions | EVET — RLS bypass; asla client/repoya konmaz |
| SUPABASE_URL | Supabase (oto-enjekte) | edge functions | hayır |
| SUPABASE_ANON_KEY | Supabase (oto-enjekte) | edge functions | hayır |
| DB şifresi (postgres) | Supabase paneli (Settings→Database) | doğrudan pg bağlantısı (pg_dump — Engin) | EVET |

Kurallar:
- `.env` git'te değil (.gitignore). Kodda hiçbir secret değeri yok — yalnız `import.meta.env.*` referansı.
- `VITE_` önekli değerler build'e gömülür = tarayıcıda görünür → yalnız public-güvenli değerler (URL + anon).
- `service_role` ve DB şifresi yalnız sunucuda/panelde; sızarsa reset edilir.

## 5. Bağlantı zinciri (özet)
GitHub `main` → (push) → Vercel build → statik PWA → tarayıcıda çalışır → `VITE_SUPABASE_URL` + `ANON_KEY` ile Supabase'e bağlanır (RLS korur) → hassas işler edge functions (`service_role`) → DB (baseline şema + RLS).

## 6. Açık / bakım
- Edge function deploy mekanizması (CLI `supabase functions deploy` mı panel mi) ve repo↔deployed senkronu: **Faz 0.4**.
- DB şifresi düz metin göründüyse reset (Settings→Database→Reset password); `service_role` kullanan edge fn'ler etkilenmez.
- staging ortamı: M4 (şu an yalnız dev-local + prod-Vercel).
- **KVKK, yurt dışına aktarım (9 Ekim 2026, açık):** Supabase'de Türkiye bölgesi yok; veritabanı bölüm 1'de yazan AWS bölgesinde, Türkiye dışında duruyor. Bu dosyada, CLAUDE.md'de ve INDEX.md'de yazan "AWS İstanbul, KVKK" bilgisi yanlıştı, 9 Ekim 2026'da düzeltildi. Kişisel verinin yurt dışına aktarımına dair KVKK şartları (madde 9) ve KAAPA'nın buna göre ne yapacağı araştırılmadı, karara bağlanmadı. Bugün canlıdaki veri deneme verisidir; konu gerçek kullanıcı verisinden önce ele alınır. Genel KVKK kuralları: `docs/ARCHITECTURE.md` PARKUR NOTLARI.

## 7. Alan adı ve kurumsal posta (7 Ekim 2026)

Kod zincirinin (bölüm 1-5) dışındadır: uygulama hâlâ Vercel adresinde çalışır; bu bölüm alan adlarını, kurumsal postayı ve kaapa.com.tr adresinin ne göstereceğini taşır.

- **Alan adları (Türkticaret, turkticaret.net):** kaapa.com.tr, kaapa.tr, kaapa.info. Ad sunucuları `ns1.turkticaret.net`, `ns2.turkticaret.net`, `ns3.turkticaret.net`. DNS kayıtları Türkticaret panelinde girilir: Domain İşlemleri → DNS Yönetimi → kaapa.com.tr. "Nameserver Yönetimi" ayrı bir ekrandır, ad sunucularını başka firmaya taşır; DNS kaydı için kullanılmaz.
- **Ana adres kaapa.com.tr (Engin kararı, 7 Ekim 2026).** kaapa.tr ve kaapa.info ona yönlenecek; yönlenme henüz KURULMADI.
- **kaapa.com.tr tanıtım sayfasını gösterir (Engin kararı, 7 Ekim 2026).** Uygulama göstermeye hazır olmadığı için sayfa uygulamaya bağlantı vermez; uygulama prodapp-navy.vercel.app adresinde kalır. Uygulama hazır olduğunda kendi alt adresine (önerilen: app.kaapa.com.tr) taşınması ayrıca konuşulur. Sayfa iki dilli olacak (Türkçe ve İngilizce, Engin isteği). Taslağın durumu, görsel yönü, dil seçimi ve G6 ile ilişkisi: `docs/GIRISIM.md` bölüm 1 (9 Ekim 2026).
- **Kurumsal posta: Zoho Mail, ücretsiz plan** (Mail Free: 5 kullanıcıya kadar, kişi başı 5 GB; telefonun kendi posta uygulamasına IMAP bağlantısı yok, Zoho'nun uygulaması ve web ekranı var). Hesap Zoho'nun Amerika veri merkezinde. Gerekçe: taahhütsüz başlangıç ve sağlayıcıyı sonradan değiştirme serbestliği; değiştirilirse adres aynı kalır, yalnız DNS kayıtları değişir. Adres: engin@kaapa.com.tr (süper yönetici; gönderen adı "Engin Tosun", varsayılan imza "Kaapa"). Yönetim paneli mailadmin.zoho.com, posta mail.zoho.com.
- **kaapa.com.tr DNS kayıtları (7 Ekim 2026; posta kayıtlarının hepsi Zoho'da doğrulandı):**
  - TXT `@`: Zoho sahiplik doğrulaması.
  - MX `@`: mx.zoho.com (öncelik 10), mx2.zoho.com (20), mx3.zoho.com (50).
  - TXT `@`: SPF, `v=spf1 include:zohomail.com ~all`.
  - TXT `zmail._domainkey`: DKIM açık anahtarı; değeri Zoho panelinde, Zoho'da DKIM açık.
  - TXT `_dmarc`: DMARC izleme kipi, `p=none`; toplu ve adli raporlar engin@kaapa.com.tr adresine; SPF ve DKIM hizalaması rahat.
  - A `@` ve CNAME `www`: Türkticaret park sayfası; tanıtım sayfası yayına girince Vercel'e bağlanacak.
  Ölçüm: mail-tester.com puanı 10/10 (7 Ekim 2026).
- **DNS yedeği:** Türkticaret DNS Yönetimi sayfasının altında "zohopostatamam" adıyla kayıtlı (7 Ekim 2026). Aynı listedeki isimsiz 13:34 kaydı posta kayıtları girilmeden ÖNCEKİ haldir; geri yüklenirse posta durur.
- **Açık:** (1) A ve CNAME kayıtlarının tanıtım sayfası için Vercel'e bağlanması. (2) kaapa.tr ve kaapa.info yönlenmesi. (3) DMARC izleme kipinde; posta trafiği oturunca sıkılaştırılır.
- Gizli değer repoya girmez: posta şifresi Zoho'da, Türkticaret girişi Engin'de.
