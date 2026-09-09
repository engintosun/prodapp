#!/usr/bin/env node
// Oksuz islev denetimi (9 Eylul 2026): derivedUnitNets uc kez yazildi/test edildi/karar
// dosyasinda "UYGULANDI" yazdi ama hicbir kod satiri onu cagirmiyordu (bkz. DERSLER.md
// "karar verildi ile karar uygulandi ayri seylerdir"). Bu betik src/app/muhasebe/budget
// altinda dista aktarilan (export function) her islevin KENDI DOSYASI VE TEST DOSYALARI
// DISINDA en az bir kullanimi olup olmadigini kontrol eder.
// KAPSAM IKI KATMANLIDIR: taranan ISLEV BILDIRIMLERI yalniz budget klasorunden gelir (repo
// geneli bu turda denetlenmedi, genisletilmez); ama KULLANIM ARAMASI tum src/ agacini tarar -
// aksi halde CardTableScreen/CardDeskScreen gibi rotalama dosyasindan (src/app/auth/
// authenticated-shell.tsx) cagrilan ekran bilesenleri budget klasorunun disindan cagrildigi
// icin yanlis alarm uretirdi (ilk calistirmada fiilen boyle oldu, bu yuzden duzeltildi).
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SCOPE_DIR = path.join(ROOT, 'src', 'app', 'muhasebe', 'budget')
const SEARCH_DIR = path.join(ROOT, 'src')

function listFiles(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...listFiles(full))
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

const isTestFile = (f) => /\.test\.(ts|tsx)$/.test(f)

// Yorum satirlarindan bahis "kullanim" SAYILMAZ - derivedUnitNets vakasinin kok nedeni tam
// budur: kendi ustundeki yorum satiri islevin adini geciriyordu ("ASAGIDA bu islevi CAGIRIR"),
// ilk taslak bunu gercek cagri saniyordu. Basit satir-sonu // yorumu kirpilir (dosyada block
// yorum /* */ kullanilmiyor - bu klasorde gozlemlendi).
function stripLineComments(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n')
}

const declFiles = listFiles(SCOPE_DIR)
const searchFiles = listFiles(SEARCH_DIR)
const rawContents = new Map(searchFiles.map((f) => [f, fs.readFileSync(f, 'utf8')]))
const stripped = new Map(searchFiles.map((f) => [f, stripLineComments(rawContents.get(f))]))

const EXPORT_FN_RE = /export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g

const orphans = []
for (const file of declFiles) {
  if (isTestFile(file)) continue
  const src = stripped.get(file)
  EXPORT_FN_RE.lastIndex = 0
  let m
  while ((m = EXPORT_FN_RE.exec(src))) {
    const name = m[1]
    const usageRe = new RegExp('\\b' + name + '\\b')
    let usedElsewhere = false
    for (const other of searchFiles) {
      if (isTestFile(other)) continue
      const otherSrc = stripped.get(other)
      if (other === file) {
        // Ayni dosya: BILDIRIM ESLEMESI kendisini maskeler, geri kalan her esleme gercek kullanimdir.
        const masked = otherSrc.slice(0, m.index) + ' '.repeat(m[0].length) + otherSrc.slice(m.index + m[0].length)
        if (usageRe.test(masked)) usedElsewhere = true
      } else if (usageRe.test(otherSrc)) {
        usedElsewhere = true
      }
      if (usedElsewhere) break
    }
    if (!usedElsewhere) orphans.push({ file: path.relative(ROOT, file), name })
  }
}

if (orphans.length > 0) {
  console.error('OKSUZ ISLEV (kendi dosyasi ve test dosyalari disinda hic cagrilmiyor):')
  for (const o of orphans) console.error(`  ${o.file}: ${o.name}`)
  process.exit(1)
}
console.log('oksuz islev yok (src/app/muhasebe/budget)')
