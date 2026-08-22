#!/usr/bin/env bash
# Runs the real gates once, then stamps a marker bound to the staged content.
set -uo pipefail
npm run build >/dev/null 2>&1 || { echo "build gecmedi" >&2; exit 1; }
npx eslint .  >/dev/null 2>&1 || { echo "eslint gecmedi" >&2; exit 1; }
npm test      >/dev/null 2>&1 || { echo "test gecmedi" >&2; exit 1; }
{ git rev-parse HEAD; git diff --cached; } | sha256sum | cut -d' ' -f1 > .claude/.gate-ok
echo "KAPILAR GECTI, damga atildi"
