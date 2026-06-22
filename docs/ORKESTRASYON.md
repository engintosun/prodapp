# KAAPA — ORKESTRASYON (GitHub → Supabase → Vercel) + Secret Haritası
*Üç platformun nasıl bağlandığının + secret'ların nerede yaşadığının operasyonel referansı. Mimari karar: ARCHITECTURE.md §5.6 (bu dosya onun somut haritası).*

## 1. Üç platform — GitHub tek kaynak
- **GitHub** (engintosun/prodapp, `main` = tek kaynak): tüm kod + DB migrations + edge function kaynağı burada.
- **Vercel** (https://prodapp-navy.vercel.app): frontend hosting.
- **Supabase** (proje `owadnnmtnfuzobyxtcxf`, AWS İstanbul / KVKK): DB + RLS + edge functions + auth + storage.

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
