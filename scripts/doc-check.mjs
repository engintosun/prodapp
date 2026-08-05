#!/usr/bin/env node
// Denetim B (faz işareti) bilgi-only: EKRAN başlıklarının [FAZ 1]/[FAZ 2]/[TASLAK] etiketlenmesi
// ekran ekran, Engin kararıyla ayrı bir turda yapılacak; bugün yalnız envanter çıkarılıyor.
// Denetim C (evsiz açık karar) bilgi-only: CURRENT.md Açık kalanlar maddelerine "ev:" yazımı
// ayrı bir turda yapılacak; bugün yalnız envanter çıkarılıyor.
// Denetim E: hash kapanış commit'i atılınca zorunlu olarak bir commit geride kalır (CURRENT.md
// yazma anında henüz commitlenmemiştir), bu yüzden HEAD ile birlikte ebeveyn (HEAD^) de kabul edilir.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const MONTHS = {
  ocak: 1,
  şubat: 2, subat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5, mayis: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8, agustos: 8,
  eylül: 9, eylul: 9,
  ekim: 10,
  kasım: 11, kasim: 11,
  aralık: 12, aralik: 12,
};

function turkishMonthToNumber(raw) {
  const key = raw.toLocaleLowerCase('tr-TR');
  return MONTHS[key] || null;
}

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' });
  } catch {
    return '';
  }
}

// Denetim A — bugüne kadarki commit geçmişinde bu dosyayı değiştiren, mesajında
// [doc-check-baseline] GEÇMEYEN en son commit'in tarihini döner (baseline commit'ler atlanır).
function getFileLastRealCommitDate(relFile) {
  const out = run(`git log --format=%ad\x1f%s --date=short -- "${relFile}"`);
  if (!out.trim()) return null;
  for (const line of out.trim().split('\n')) {
    const sep = line.indexOf('\x1f');
    if (sep === -1) continue;
    const date = line.slice(0, sep);
    const subject = line.slice(sep + 1);
    if (subject.includes('[doc-check-baseline]')) continue;
    return date;
  }
  return null;
}

function parseHeaderDate(absFile) {
  let content;
  try {
    content = fs.readFileSync(absFile, 'utf8');
  } catch {
    return null;
  }
  const head = content.split(/\r?\n/).slice(0, 14).join('\n');
  const re = /Son\s+g[üu]ncelleme:\**\s*(\d{1,2})\s+([A-Za-zÇĞİIÖŞÜçğışöü]+)\s+(\d{4})/iu;
  const m = head.match(re);
  if (!m) return null;
  const day = m[1].padStart(2, '0');
  const monthNum = turkishMonthToNumber(m[2]);
  if (!monthNum) return null;
  const month = String(monthNum).padStart(2, '0');
  return `${m[3]}-${month}-${day}`;
}

function walkMarkdown(dir, excludePrefixes, results) {
  let entries;
  try {
    entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const rel = `${dir}/${entry.name}`;
    if (excludePrefixes.some((ex) => rel === ex || rel.startsWith(`${ex}/`))) continue;
    if (entry.isDirectory()) {
      walkMarkdown(rel, excludePrefixes, results);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (rel === 'docs/butce/KAAPA_damitim_Koster_TUM-BOLUMLER.md') continue;
      results.push(rel);
    }
  }
  return results;
}

function walkSourceFiles(dir, results) {
  let entries;
  try {
    entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      walkSourceFiles(rel, results);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      if (entry.name.includes('.test.')) continue;
      results.push(rel);
    }
  }
  return results;
}

const infoLines = [];
const warnLines = [];
let warnCount = 0;

function info(section, msg) {
  infoLines.push(`~ [${section}] ${msg}`);
}
function warn(section, msg) {
  warnLines.push(`! [${section}] ${msg}`);
  warnCount += 1;
}

// ----- Denetim A: başlık tazeliği -----
const docFiles = walkMarkdown('docs', ['docs/archive'], []);
docFiles.push('CLAUDE.md', 'CURRENT.md');
docFiles.sort();

for (const rel of docFiles) {
  const abs = path.join(ROOT, rel);
  const headerDate = parseHeaderDate(abs);
  if (!headerDate) {
    info('A', `${rel} — tarihli başlık yok`);
    continue;
  }
  const commitDate = getFileLastRealCommitDate(rel);
  if (!commitDate) continue;
  if (headerDate < commitDate) {
    warn('A', `${rel} — başlık ${headerDate} diyor, son gerçek değişiklik ${commitDate}`);
  }
}

// ----- Denetim B: faz işareti (bilgi-only) -----
const FAZ_TAG_RE = /\[FAZ 1\]|\[FAZ 2\]|\[TASLAK\]/;
const HEADING_RE = /^##\s+\d+\.\s+.+$/;
for (const rel of ['docs/EKRAN-SAHA.md', 'docs/EKRAN-DEPT.md', 'docs/EKRAN-MUHASEBE.md']) {
  const abs = path.join(ROOT, rel);
  let content;
  try {
    content = fs.readFileSync(abs, 'utf8');
  } catch {
    continue;
  }
  for (const line of content.split(/\r?\n/)) {
    if (!HEADING_RE.test(line)) continue;
    if (!FAZ_TAG_RE.test(line)) {
      info('B', `${rel} ${line.trim()} — faz işareti yok`);
    }
  }
}

// ----- Denetim C: evsiz açık karar (bilgi-only) -----
{
  const abs = path.join(ROOT, 'CURRENT.md');
  let content = '';
  try {
    content = fs.readFileSync(abs, 'utf8');
  } catch {
    content = '';
  }
  const lines = content.split(/\r?\n/);
  let inSection = false;
  for (const line of lines) {
    if (/^##\s+.*[Kk]alanlar/.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^##\s+/.test(line)) break;
    if (!inSection) continue;
    if (!line.startsWith('- ')) continue;
    if (/ev:/i.test(line) || /docs\//.test(line)) continue;
    const preview = line.length > 70 ? `${line.slice(0, 70)}…` : line;
    info('C', `CURRENT.md Açık kalanlar: "${preview}" — ev/docs yolu yok`);
  }
}

// ----- Denetim D: dosya boyu -----
const srcFiles = walkSourceFiles('src', []).sort();
for (const rel of srcFiles) {
  const abs = path.join(ROOT, rel);
  let content;
  try {
    content = fs.readFileSync(abs, 'utf8');
  } catch {
    continue;
  }
  const lines = content.split(/\r?\n/);
  const lineCount = lines.length;
  if (lineCount <= 300) continue;
  const head6 = lines.slice(0, 6).join('\n');
  const hasBoy = /\/\/\s*BOY:/.test(head6);
  let msg = `${rel} (${lineCount} satır) — BOY gerekçesi ${hasBoy ? 'var' : 'YOK'}`;
  if (lineCount > 500) msg += ' — 500+ — bölünme planı gerekir';
  if (hasBoy) {
    info('D', msg);
  } else {
    warn('D', msg);
  }
}

// ----- Denetim E: CURRENT.md "## Durum" HEAD hash tazeliği -----
{
  const abs = path.join(ROOT, 'CURRENT.md');
  let content = '';
  try {
    content = fs.readFileSync(abs, 'utf8');
  } catch {
    content = '';
  }
  const lines = content.split(/\r?\n/);
  let inDurum = false;
  let firstItem = null;
  for (const line of lines) {
    if (/^##\s+Durum\s*$/.test(line)) {
      inDurum = true;
      continue;
    }
    if (inDurum && /^##\s+/.test(line)) break;
    if (!inDurum) continue;
    if (line.startsWith('- ')) {
      firstItem = line;
      break;
    }
  }
  if (!firstItem) {
    warn('E', 'CURRENT.md "## Durum" bölümünde madde satırı bulunamadı');
  } else {
    const hashMatch = firstItem.match(/HEAD:\s*([0-9a-f]{7,12})/i);
    if (!hashMatch) {
      warn('E', 'Durum satırı HEAD hash\'i taşımıyor');
    } else {
      const found = hashMatch[1].toLowerCase();
      const headShort = run('git rev-parse --short HEAD').trim().toLowerCase();
      const parentShort = run('git rev-parse --short HEAD^').trim().toLowerCase();
      const candidates = [headShort, parentShort].filter(Boolean);
      const matches = candidates.some((c) => {
        const len = Math.min(c.length, found.length);
        return len > 0 && c.slice(0, len) === found.slice(0, len);
      });
      if (!matches) {
        warn(
          'E',
          `CURRENT.md Durum HEAD hash uyuşmuyor — beklenen HEAD=${headShort || '?'} veya HEAD^=${parentShort || '?'}, bulunan=${found}`
        );
      }
    }
  }
}

// ----- Rapor -----
console.log('=== KAAPA doc-check ===');
for (const l of warnLines) console.log(l);
for (const l of infoLines) console.log(l);
console.log(`=== Toplam uyari (!): ${warnCount} ===`);

process.exit(0);
