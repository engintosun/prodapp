#!/usr/bin/env node
// Denetim B (faz işareti) bilgi-only: EKRAN başlıklarının [FAZ 1]/[FAZ 2]/[TASLAK] etiketlenmesi
// ekran ekran, Engin kararıyla ayrı bir turda yapılacak; bugün yalnız envanter çıkarılıyor.
// Denetim C (evsiz açık karar) bilgi-only: CURRENT.md Açık kalanlar maddelerine "ev:" yazımı
// ayrı bir turda yapılacak; bugün yalnız envanter çıkarılıyor.
// Denetim E referansı HEAD DEĞİL, CURRENT.md'nin KENDİ son commit'idir: Durum satırı yazıldığı anda
// o anki son commit'i kaydeder, ARDINDAN CURRENT.md commit'lenir — kayıtlı hash her zaman
// "CURRENT.md'ye dokunan son commit'in ebeveyni"dir. Referans HEAD olsaydı, CURRENT.md yazıldıktan
// sonra oturumda kaç commit atıldığı (4 Ağustos'ta sekiz) değişken olduğundan yanlış alarm doğardı.

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

function commandSucceeds(cmd) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
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

// ----- Denetim A: dogrulama tazeligi (BILGI-ONLY) -----
// ESKI HALI (18 Agustos 2026'ya kadar): her dokumanin kendi "Son guncelleme" basligi commit
// tarihiyle karsilastirilirdi. Baslik 24 dosyada elle tutulan ikinci kopyaydi ve duzenlemeyi
// unutmak KIRMIZI uretiyordu; 18 Agustos'ta tek gunde iki fazladan commit'e mal oldu.
// YENI HALI (ARCHITECTURE 4.5 ertelenmis karari uygulandi): tarih INDEX.md bolum 7'de TEK yerde
// yasar ve DUZENLENDIGINDE DEGIL, DOGRULANDIGINDA ilerler.
// BILGI-ONLY (Engin karari 18 Agustos 2026): uyari degil envanterdir. Gerekce: yeni anlamiyla
// bir dokuman her duzenlemede "dogrulanmamis" hale gelir ve yesile donmesi ancak gercek bir okuma
// turuyla olur; surekli kirmizi duran bir denetim insani ona bakmamaya alistirir ve o aliskanlik
// [F] gibi gercekten baglayici denetimlere de bulasir. Denetim B/C ile ayni desen.
// SIRALAMA: en bayattan en tazeye. Listenin basi dogal bir is sirasidir.
const REG_RE = /`([^`\n]+\.md)`\s*\[([^\]]+)\](?:\s*\(dogrulama:\s*(\d{1,2})\s+([A-Za-zÇĞİIÖŞÜçğışöü]+)\s+(\d{4})\))?/gu;
const indexForReg = fs.readFileSync(path.join(ROOT, 'INDEX.md'), 'utf8');
const section7 = indexForReg.split('## 7. DOKUMANTASYON HARITASI')[1]?.split('## 8.')[0] ?? '';
const registry = new Map();
let rm;
while ((rm = REG_RE.exec(section7)) !== null) {
  let verified = null;
  if (rm[3]) {
    const mn = turkishMonthToNumber(rm[4]);
    if (mn) verified = `${rm[5]}-${String(mn).padStart(2, '0')}-${rm[3].padStart(2, '0')}`;
  }
  registry.set(rm[1], verified);
}

const docFiles = walkMarkdown('docs', ['docs/archive'], []);
docFiles.push('CLAUDE.md', 'CURRENT.md');
docFiles.sort();

// Bolum 7 artik KAYIT DEFTERIDIR: orada olmayan dokuman gorunmezdir, bu KIRMIZI kalir.
for (const rel of docFiles) {
  if (!registry.has(rel)) warn('A', `${rel} — INDEX bolum 7'de KAYITLI DEGIL (dokuman haritasina eklenmeli)`);
}

const staleRows = [];
for (const rel of docFiles) {
  if (!registry.has(rel)) continue;
  const verified = registry.get(rel);
  const commitDate = getFileLastRealCommitDate(rel);
  if (!verified) {
    staleRows.push({ key: '0000-00-00', msg: `${rel} — dogrulama tarihi YOK` });
    continue;
  }
  if (!commitDate) continue;
  if (verified < commitDate) {
    staleRows.push({ key: verified, msg: `${rel} — dogrulama ${verified}, o tarihten sonra degisti (son degisiklik ${commitDate})` });
  }
}
staleRows.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
for (const r of staleRows) info('A', r.msg);

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
      // Referans CURRENT.md'ye dokunan SON commit'tir (curCommit), HEAD DEĞİL — bkz. dosya başı yorum.
      const curCommitFull = run('git log -1 --format=%H -- CURRENT.md').trim();
      if (curCommitFull) {
        // '~1' kullanılır, '^' KULLANILMAZ: Windows'ta cmd.exe satır sonundaki '^' karakterini
        // yutuyor (HEAD^ sessizce HEAD'e dönüşüyor), '~1' kabuk-bağımsız aynı ebeveyni verir.
        const curShort = run(`git rev-parse --short ${curCommitFull}`).trim().toLowerCase();
        const curParentShort = run(`git rev-parse --short ${curCommitFull}~1`).trim().toLowerCase();
        const candidates = [curShort, curParentShort].filter(Boolean);
        const matches = candidates.some((c) => {
          const len = Math.min(c.length, found.length);
          return len > 0 && c.slice(0, len) === found.slice(0, len);
        });
        if (!matches) {
          warn(
            'E',
            `CURRENT.md Durum hash uyuşmuyor — beklenen CURRENT.md'nin son commiti=${curShort || '?'} veya onun ebeveyni=${curParentShort || '?'}, bulunan=${found}`
          );
        } else if (!commandSucceeds(`git merge-base --is-ancestor ${found} HEAD`)) {
          warn('E', `Durum satırındaki hash (${found}) HEAD'in atası değil`);
        }
      }
    }
  }
}

// ----- Denetim F: INDEX satir sayisi dogrulugu -----
// INDEX.md bolum 2 her dosya icin `yol` (N) biciminde bir satir sayisi iddiasi tasir. Bu iddialar
// elle yazildigi icin sessizce bayatliyordu: 18 Agustos 2026 taramasinda 56 iddiadan 7'si yanlisti
// ve en buyuk sapma authenticated-shell.tsx idi (INDEX 139 diyordu, gercek 275). INDEX'in kendi
// STATUS RULE'u "mevcut repository durumunu tanimlar" der; olculeri yanlissa o soz tutulmuyor demektir.
// TAM ESLESME (Engin karari 18 Agustos 2026): tolerans bandi YOK. Gerekce: 8 satirlik kucuk sapmalar
// elenirse birikerek 139->275 olur; doc-check kapanista kosuluyor, is sirasinda degil, o yuzden
// "surekli kirmizi" maliyeti pratikte yoktur ([E] de ayni sekilde davranir).
// SAYMA DUZENI — DIKKAT: bu denetim `wc -l` duzenini kullanir (satir sonu KARAKTERI sayar), Denetim D
// ise content.split(/\r?\n/) uzunlugunu kullanir ve satir sonuyla biten dosyalarda BIR FAZLA verir
// (ornek: format.ts, wc -l = 303, split = 304). INDEX'in sayilari tarihsel olarak wc -l duzenindedir;
// F bu duzeni devralmak ZORUNDADIR, yoksa 56 iddianin hepsi birden yanlis gorunur. D'nin sayma
// bicimine DOKUNULMAZ (esigi 300'dur, degistirmek esik davranisini kaydirir).
const indexPath = path.join(ROOT, 'INDEX.md');
let indexRaw = '';
try {
  indexRaw = fs.readFileSync(indexPath, 'utf8');
} catch {
  warn('F', 'INDEX.md okunamadi');
}
if (indexRaw) {
  const claimRe = /`([^`\n]+?)`\s*\((\d+)\)/g;
  let m;
  while ((m = claimRe.exec(indexRaw)) !== null) {
    const claimed = Number(m[2]);
    const rel = m[1].trim();
    // Edge function satirlari INDEX'te kisa yolla yazilir (ornek: accept-invitation/index.ts).
    const candidates = [rel, path.posix.join('supabase/functions', rel)];
    let found = null;
    for (const c of candidates) {
      const abs = path.join(ROOT, c);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        found = abs;
        break;
      }
    }
    if (!found) {
      warn('F', `INDEX.md — ${rel} (${claimed}) — DOSYA BULUNAMADI (silinmis ya da yol yanlis)`);
      continue;
    }
    const content = fs.readFileSync(found, 'utf8');
    // wc -l duzeni: satir sonu karakteri say. Son satir sonuyla bitmiyorsa o son parca da bir satirdir.
    const parts = content.split(/\r?\n/);
    const real = parts[parts.length - 1] === '' ? parts.length - 1 : parts.length;
    if (real !== claimed) {
      warn('F', `INDEX.md — ${rel} — INDEX=${claimed} GERCEK=${real}`);
    }
  }
}

// ----- Rapor -----
console.log('=== KAAPA doc-check ===');
for (const l of warnLines) console.log(l);
for (const l of infoLines) console.log(l);
console.log(`=== Toplam uyari (!): ${warnCount} ===`);

process.exit(0);
