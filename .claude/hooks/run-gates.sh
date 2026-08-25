#!/usr/bin/env bash
# Runs the real gates once, then stamps a marker bound to the staged content.
set -uo pipefail

npm run build >/dev/null 2>&1 || { echo "build gecmedi" >&2; exit 1; }
npx eslint .  >/dev/null 2>&1 || { echo "eslint gecmedi" >&2; exit 1; }

out=$(npm test 2>&1); rc=$?
[ $rc -eq 0 ] || { echo "test gecmedi" >&2; printf '%s\n' "$out" | tail -20 >&2; exit 1; }

got=$(printf '%s' "$out" | sed 's/\x1b\[[0-9;]*m//g' | grep -oE '^ *Tests +[0-9]+ passed' | grep -oE '[0-9]+' | head -1)
[ -n "$got" ] || { echo "test sayisi vitest ciktisindan okunamadi; kapi aciga dusmesin diye DURDURULDU" >&2; exit 1; }

[ -f .claude/test-count ] || { echo ".claude/test-count yok; beklenen test sayisi bilinmiyor" >&2; exit 1; }
want=$(tr -d '\r\n ' < .claude/test-count)
if [ "$got" != "$want" ]; then
  if [ "$got" -lt "$want" ] 2>/dev/null; then
    echo "TEST KAYBI: $want bekleniyordu, $got gecti. Test silinmis ya da atlanmis." >&2
  else
    echo "TEST ARTTI: $want yaziyor, $got gecti. .claude/test-count AYNI commit'te $got yapilmali." >&2
  fi
  exit 1
fi

{ git rev-parse HEAD; git diff --cached; } | sha256sum | cut -d' ' -f1 > .claude/.gate-ok
echo "KAPILAR GECTI ($got test), damga atildi"
