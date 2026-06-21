# KAAPA — Sistem Altyapı Denetimi (2026-06-21)

Faz 0 tam denetimin bulguları + düzeltme yol haritası. DB + doküman + kod üç katman da CANLI kaynaktan (hafızadan değil) okunarak denetlendi. KAAPA özellik işi (Dilim 2b) bu iş bitene kadar park.

## 1. DB — canlı vs repo (obje-kesin)
Canlı: 39 tablo · 101 policy · 25 trigger · 17 fonksiyon · 86 index. Üç bayat defterle (full-rebuild + migrations + RLS) obje-obje karşılaştırıldı; SQL Editor envanteri (Docker engeli nedeniyle pg_dump yerine) ile.
- İZSİZ TEK OBJE: `rls_auto_enable` fonksiyonu + `ensure_rls` event trigger'ı — canlıda var, hiçbir migration'da yok. İyi huylu RLS güvenlik ağı (yeni public tablosuna otomatik RLS açar). Baseline'a DAHİL edilmeli.
- KÖPRÜ KIRILGANLIĞI: `receipts.budget_item_id` (Model A tek temas noktası) yalnız migration 20260613115009 satır 276'da. Tek-kaynak bağımlılığı — baseline bunu çözer.
- Diğer her şey izli: tüm kolon, 101 policy, 25 trigger, 16 fonksiyon, grant'lar. fn_open_budget gövdesi canlı=repo (06-21 commit'i drift'i kapatmış).
- GÜVENLİK: anon rolünün hiçbir tabloda veri yetkisi yok; authenticated RLS-kapılı; service_role tam. KVKK temiz. Storage RLS (receipts bucket) repoda izli.
- Sonuç: drift YAPISAL risk'ti (tek tekrarlanabilir kaynak yok), içerik sapması tek iyi-huylu objeye indi. Baseline operasyonu DÜŞÜK RİSKLİ.

## 2. Doküman — drift haritası (Faz 1B'de düzeltilecek)
Tasarım sağlam (modüler, tek-ev, kopyalama-referans ver), disiplin sızmış. Düzeltmeler:
- CLAUDE.md kendi içinde ÇELİŞİYOR: "Şema/RLS deploy" bölümü "Engin manuel SQL Editor", "Ortamlar" bölümü "Sonnet CLI, kopyala-yapıştır yok". Sonnet-CLI gerçek; eski bölüm temizlenir.
- ARCHITECTURE.md (29 May, bayat): CFE+bütçeyi "Faz 2/yapılmayacak" diyor (ikisi de CANLI); 17 tablo yazıyor (39); BÖLÜM 1 = CLAUDE.md tekrarı; §5.3 özellik-bazlı yapı emrediyor ama src/features boş. BÖLÜM 1 kalkar, BÖLÜM 2-5 gerçeğe güncellenir.
- TASARIM-KARARLARI.md: başlık "yalnız ekran-arası görsel ilke" ama bütçe-şema çöplüğü olmuş (48→194 satır); "B-serisi tam kayıt → CURRENT.md" (CURRENT.md silinip yazılıyor). Bütçe-şema içeriği docs/butce/ evine taşınır.
- Tek-ev ihlalleri: sıradaki-iş (CURRENT + IS-SIRASI ikisinde), borç (TECH-DEBT kanonik + IS-SIRASI yanlış kopya). Biri kaynak biri referans olur.
- Devir dosyaları (×4) kökte, arşivsiz, git log ile mükerrer → docs/archive/.
- Bozuk referans: README→STATUS.md (yok; doğrusu CURRENT.md); RAKIP "PRODAPP" eski ad; GLOSSARY başlık tarihi (22 May, içerik 19 Haz); AUTH "Dashboard veya CLI" ↔ CLAUDE "ASLA dashboard".
- Propagasyon boşluğu: "düzeltme iste" (31 May kararı) EKRAN-DEPT'e işlenmemiş (SAHA'ya işlenmiş).
- BUTCE-ARASTIRMA-DURUM: KART-KATALOGU'na göre bayat (Efekt&Dublör kartı çözülmüş, kapanmış kararları "açık" sayıyor).
- REPO-DIŞI ALTIN: master 4746-kalem (kaapa-MASTER-kalem-listesi.xlsx) + Koster Katman A/B Engin'de, repoda değil → tek-kaynak kırılganlığı; repoya commit'lenmeli.
- İyi durumda: IS-KURALLARI, KART-KATALOGU, KART-GEREKCELERI, TECH-DEBT, GLOSSARY (etap notu hariç).

## 3. Kod / konteyner (src/, 3.698 satır)
- HARCAMA vs BÜTÇE TEMİZ AYRI. Harcama: tam UI + receipt-service (repository deseni; saha/reviewer supabase'e hiç dokunmuyor), yalın ve güncel. Bütçe: DB+CFE, sıfır UI (park; fn_lock_budget/fn_match_receipt canlıda bile yok). Tek temas noktası receipts.budget_item_id SAĞLAM (tek nullable FK + tek trigger; NULL'da harcama tek başına çalışır — Model A birebir, hiçbir ekran kuplaj yapmıyor).
- ÜÇ "BÜTÇE" var: limit (project/dept/period_budgets) · modül (budget_*) · köprü. GLOSSARY'de "bütçe limiti vs bütçe modülü" ayrımı netleşmeli (kavram yükü).
- CFE saf ve doğru yerde (yalnız decimal.js; DB/UI yok) ama DORMANT (çağıran yok). B18 NÖBETİ: fn_lock_budget (SQL) yazılınca CFE matematiğini SQL'de TEKRAR yazma → frontend hesaplar, donmuş fotoğrafı mühüre geçirir.
- Tip drift'i YOK (domain.ts canlının alt kümesi; tek küçük boşluk ApprovalAction'da 'returned' eksik).
- etap/dönem/stage: kodda TEK esnek eksen (budget_stages); "5 etap" ve "iki nakit ekseni" kavramsal/gelecek, yapısal değil — GLOSSARY bugün doğru. KART-KATALOGU "5 etap"ı sabit eksen gibi sunuyor → doküman netliği işi.
- src/features/ BOŞ iskelet (.gitkeep); kod app/{rol}+shared'da. Rol-bazlı bu boyutta doğru. Boş dizinler silinir, ARCHITECTURE güncellenir (TD-7 yeniden çerçevelenir).

## 4. Düzeltme yol haritası
Faz 1 — DB baseline (düşük risk; canlı≈repo). Gerçek pg_dump (hafif PostgreSQL client tools, Docker'sız) → tek migrations/00000000000000_baseline.sql; rls_auto_enable+ensure_rls DAHİL; köprü artık baseline'da. Üç bayat defter → docs/archive/ (silinmez). db reset ile doğrulanır (39/101/25/17 birebir). Canlıya UYGULANMAZ (baseline yalnız repo-kaynağı + yeni-ortam). Faz 1B — doküman konsolidasyonu (bölüm 2 maddeleri, dosya-bazlı, yama yok). Faz 2 — orkestrasyon doc + secret haritası. Faz 3 — drift disiplini (her db push sonrası git status, domain.ts eşitliği, edge deploy kontrolü). Açık: 0.4 edge deploy senkronu (Faz 1'de hafif kontrol); master kütüphane repoya; fn_lock_budget B18 nöbeti (park işine not). Bu rapor geçici yol haritasıdır; Faz 1-3 bitince arşivlenir.
