# PRODAPP — CLAUDE.md

**Amaç:** Her session bu dosyayla başlar. Context routing tablosu hangi görev tipinde hangi dosyaların okunacağını belirler.

-----

## Proje Kimliği

PRODAPP — Sinema/TV sektörü için prodüksiyon harcama yönetimi SaaS platformu.
Tech stack: React + TypeScript + Vite + Supabase + Vercel

-----

## Context Routing Tablosu

|Görev tipi                  |Okunacak dosyalar                                                       |
|----------------------------|------------------------------------------------------------------------|
|Mimari karar                |docs/ARCHITECTURE.md                                                    |
|Kod yazma (herhangi feature)|docs/ARCHITECTURE.md → ilgili feature dizini → docs/GLOSSARY.md         |
|İsimlendirme                |docs/GLOSSARY.md                                                        |
|Teknik borç                 |docs/TECH-DEBT.md                                                       |
|Auth / rol / izin           |docs/AUTH-KARARLARI.md + supabase/SUPABASE-RLS.sql                      |
|DB şeması                   |supabase/SUPABASE-SCHEMA.sql                                            |
|Tasarım / UI                |docs/TASARIM-KARARLARI.md                                               |
|Yeni özellik                |docs/ARCHITECTURE.md (Bölüm 2 — kapsam kontrolü) → ilgili feature dizini|
|Bug fix                     |İlgili feature dizini → docs/TECH-DEBT.md                               |
|Deploy                      |docs/ARCHITECTURE.md (Bölüm 5.6)                                        |

-----

## Çalışma Kuralları Özeti

- **Opus:** Mimari, planlama, prompt yazma. Kod yazmaz.
- **Sonnet:** Kod, commit, push. Mimari karar almaz.
- **Commit:** `tip(kapsam): açıklama` — bir commit = bir iş
- **Dur sinyalleri:** 5+ dosya, 300+ satır, mantık tekrarı, scope creep, belirsiz karar
- **Dil:** Chat Türkçe, kod İngilizce, dokümanlar Türkçe
- **SSOT:** Supabase tek gerçek kaynak
- **Sessiz hata yasak**
- **Doküman kazanır:** Kod-doküman çelişkisinde önce doküman güncellenir

-----

## Meta-prensip

> Hiçbir şey "öyle olmaz." Her şey bilinçli karar ile olur, kaydedilir, denetlenebilir.
