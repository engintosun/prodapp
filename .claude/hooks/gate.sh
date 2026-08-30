#!/usr/bin/env bash
# PreToolUse/Bash gate. Verifies the marker; never runs the gates itself.
set -uo pipefail
cmd=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.command||"")}catch(e){console.log("")}})')
fail(){ printf 'KAPI REDDETTI: %s\n' "$1" >&2; exit 2; }

case "$cmd" in
  *"checkout -b"*|*"switch -c"*)  fail "yeni dal acma yasak (BRANCH YASAK)" ;;
  *"push --force"*|*"push -f"*)   fail "zorla push yasak" ;;
esac
case "$cmd" in *"git commit"*) ;; *) exit 0 ;; esac

[ "$(git branch --show-current 2>/dev/null)" = "main" ] || fail "aktif dal main degil"
[ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = "false" ] || fail "sig klon; git fetch --unshallow gerekli"
[ -f .claude/.gate-ok ] || fail "kapilar kosulmamis: bash .claude/hooks/run-gates.sh calistir"
now=$({ git rev-parse HEAD; git diff --cached; } | sha256sum | cut -d' ' -f1)
[ "$(cat .claude/.gate-ok)" = "$now" ] || fail "damga bayat: kapilardan sonra icerik degisti, run-gates.sh tekrar calistir"

for f in $(git diff --cached --name-only --diff-filter=ACM | grep '\.md$' || true); do
  added=$(git diff --cached -U0 -- "$f" | grep '^+' | grep -v '^+++' || true)
  if printf '%s' "$added" | grep -qiE '\b(icin|calis|degis|gecis|yazil|olcum|karari|acilis|kapanis|dosyasi|uretim|sadelestir)\b'; then
    fail "$f icinde Turkce karaktere dusmemis metin var (TD-32 sinifi)"
  fi
done

# Kod tarafi (TD-32 sinifi, 30 Agustos 2026). Olcum: son 60 commit'te bu suzgecle
# tek isabet cikti, o da TD-32'nin dogdugu satirdi (35a9bf2, title="Baslik").
# -i ZORUNLU: ekranda gorunen metin buyuk harfle baslar (Baslik, Sifre, Olustur);
# harf duyarli filtre tam da yakalamasi gereken satiri kacirir.
# Kapsam disi: *.test.ts(x) test kurgusudur; src/shared/cfe/ motorun ic sart
# hatalaridir. Ikisi de kullaniciya mesaj olarak cikmaz, kural geregi ASCII kalir.
# Yorumla baslayan eklenen satirlar atlanir: kod yorumlari proje adeti geregi ASCII.
# Liste SABITTIR: listede olmayan yeni kelimeyi yakalamaz, kural elle de uygulanir.
for f in $(git diff --cached --name-only --diff-filter=ACM | grep -E '^src/.*\.(ts|tsx)$' | grep -vE '\.test\.(ts|tsx)$' | grep -v '^src/shared/cfe/' || true); do
  added=$(git diff --cached -U0 -- "$f" | grep '^+' | grep -v '^+++' | grep -vE '^\+[[:space:]]*(//|\*|/\*)' || true)
  if printf '%s' "$added" | grep -qiE '\b(baslik|sifre|olustur|bulunamadi|gecerli|eslesmiyor|katiliyor|sablon|yukleniyor|kaydedildi|silindi|gonderildi|secildi|muhurlu|yetkiniz|eklenemez|hesaplanamaz|duzenlenemez)\b'; then
    fail "$f icinde Turkce karaktere dusmemis kullanici metni var (TD-32 sinifi): kullaniciya gorunen metin tam Turkce karakterli yazilir"
  fi
done

defined=$(grep -ohE '^\s*--[a-zA-Z0-9-]+' src/styles/*.css 2>/dev/null | tr -d ' ' | sort -u)
for f in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|css)$' || true); do
  while IFS= read -r tok; do
    [ -n "$tok" ] || continue
    printf '%s' "$defined" | grep -qx -- "$tok" || fail "$f icinde tanimsiz CSS token: $tok (tanimli kume: src/styles/*.css)"
  done < <(git show ":$f" 2>/dev/null | grep -oE 'var\(\s*--[a-zA-Z0-9-]+' | grep -oE '\-\-[a-zA-Z0-9-]+' | sort -u)
done
exit 0
