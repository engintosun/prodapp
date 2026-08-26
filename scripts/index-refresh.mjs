#!/usr/bin/env node
// Refreshes the line-count claims in INDEX.md section "## 2. KOD HARITASI" from the
// real files on disk. Touches ONLY the numeric claims; prose, descriptions and
// ordering are left exactly as they are.
//
// Two claim shapes are recognized, both anchored at the start of a line:
//   A) `path` (N)                      -> N = the file's line count
//   B) `path` - N dosya, M satir       -> N = file count under path, M = total lines
//
// Path resolution: the claimed path is tried relative to the repo root first. If
// that misses, the whole repo (excluding node_modules and .git) is searched for a
// path ENDING with the claim. Exactly one match is required - zero or more than
// one is a hard stop (process.exit(1)), never a silent skip.
//
// Modes:
//   (default) -> rewrites INDEX.md in place, logs every changed line, exit 0
//   --check   -> writes nothing to disk; lists stale lines and exit 1, or exit 0 if clean

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes('--check');
const EXCLUDE_DIRS = new Set(['node_modules', '.git']);

const SECTION_START_RE = /^## 2\. KOD HAR[İI]TASI\s*$/;
const SECTION_END_RE = /^## 3\./;

const PATTERN_A = /^`([^`\n]+)`\s*\((\d+)\)/;
const PATTERN_B = /^`([^`\n]+)`\s+—\s+(\d+)\s+dosya,\s+(\d+)\s+sat[ıi]r/;

function lineCountOf(content) {
  // wc -l semantics: a trailing newline does not add an extra empty line.
  const parts = content.split('\n');
  return parts[parts.length - 1] === '' ? parts.length - 1 : parts.length;
}

function walkAll(dir, files, dirs) {
  let entries;
  try {
    entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      dirs.push(rel);
      walkAll(rel, files, dirs);
    } else if (entry.isFile()) {
      files.push(rel);
    }
  }
}

function resolvePath(rawRel, isDir) {
  const stripped = rawRel.endsWith('/') ? rawRel.slice(0, -1) : rawRel;
  const direct = path.join(ROOT, stripped);
  try {
    const st = fs.statSync(direct);
    if (isDir ? st.isDirectory() : st.isFile()) return { resolved: stripped };
  } catch {
    // falls through to the repo-wide suffix search below
  }
  const files = [];
  const dirs = [];
  walkAll('', files, dirs);
  const pool = isDir ? dirs : files;
  const matches = pool.filter((p) => p === stripped || p.endsWith(`/${stripped}`));
  if (matches.length === 1) return { resolved: matches[0] };
  return { errorCount: matches.length };
}

function countDir(relDir) {
  const files = [];
  const dirs = [];
  walkAll(relDir, files, dirs);
  let totalLines = 0;
  for (const f of files) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
    totalLines += lineCountOf(content);
  }
  return { fileCount: files.length, totalLines };
}

function fail(rawRel, errorCount) {
  const reason = errorCount === 0 ? 'hicbir eslesme bulunamadi' : `${errorCount} eslesme bulundu, TEK olmali`;
  console.error(`HATA: "${rawRel}" cozulemedi - ${reason}. Betik durduruldu.`);
  process.exit(1);
}

const indexPath = path.join(ROOT, 'INDEX.md');
const raw = fs.readFileSync(indexPath, 'utf8');
const lines = raw.split('\n');

const startIdx = lines.findIndex((l) => SECTION_START_RE.test(l));
if (startIdx === -1) {
  console.error('HATA: "## 2. KOD HARITASI" basligi bulunamadi.');
  process.exit(1);
}
let endIdx = lines.length;
for (let i = startIdx + 1; i < lines.length; i += 1) {
  if (SECTION_END_RE.test(lines[i])) {
    endIdx = i;
    break;
  }
}

const changes = [];

for (let i = startIdx + 1; i < endIdx; i += 1) {
  const line = lines[i];

  const mA = PATTERN_A.exec(line);
  if (mA) {
    const rawRel = mA[1];
    const claimed = Number(mA[2]);
    const { resolved, errorCount } = resolvePath(rawRel, false);
    if (!resolved) fail(rawRel, errorCount);
    const content = fs.readFileSync(path.join(ROOT, resolved), 'utf8');
    const real = lineCountOf(content);
    if (real !== claimed) {
      const oldPrefix = mA[0];
      const newPrefix = oldPrefix.replace(/\((\d+)\)/, `(${real})`);
      changes.push({
        lineNo: i + 1,
        rel: rawRel,
        oldText: `${claimed}`,
        newText: `${real}`,
        apply: () => {
          lines[i] = newPrefix + line.slice(oldPrefix.length);
        },
      });
    }
    continue;
  }

  const mB = PATTERN_B.exec(line);
  if (mB) {
    const rawRel = mB[1];
    const claimedFiles = Number(mB[2]);
    const claimedLines = Number(mB[3]);
    const { resolved, errorCount } = resolvePath(rawRel, true);
    if (!resolved) fail(rawRel, errorCount);
    const { fileCount, totalLines } = countDir(resolved);
    if (fileCount !== claimedFiles || totalLines !== claimedLines) {
      const oldPrefix = mB[0];
      const digitsRe = /(\d+)(\s+dosya,\s+)(\d+)(\s+sat[ıi]r)/;
      const newPrefix = oldPrefix.replace(digitsRe, (_w, _n1, mid, _n2, suf) => `${fileCount}${mid}${totalLines}${suf}`);
      changes.push({
        lineNo: i + 1,
        rel: rawRel,
        oldText: `${claimedFiles} dosya, ${claimedLines} satır`,
        newText: `${fileCount} dosya, ${totalLines} satır`,
        apply: () => {
          lines[i] = newPrefix + line.slice(oldPrefix.length);
        },
      });
    }
  }
}

if (CHECK_MODE) {
  if (changes.length === 0) {
    console.log('INDEX bolum 2 taze: bayat satir yok.');
    process.exit(0);
  }
  for (const c of changes) {
    console.log(`satir ${c.lineNo}: ${c.rel}  ${c.oldText} -> ${c.newText}`);
  }
  console.log(`=== ${changes.length} bayat satir ===`);
  process.exit(1);
}

for (const c of changes) {
  c.apply();
  console.log(`satir ${c.lineNo}: ${c.rel}  ${c.oldText} -> ${c.newText}`);
}
if (changes.length > 0) {
  fs.writeFileSync(indexPath, lines.join('\n'), 'utf8');
}
console.log(`=== ${changes.length} satir tazelendi ===`);
process.exit(0);
