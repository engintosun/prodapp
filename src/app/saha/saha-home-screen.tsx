import { useState, useRef } from 'react'
import type { CSSProperties, ChangeEvent } from 'react'
import { useToast } from '../../shared/components/toast'
import { ReceiptEntryScreen } from './receipt-entry-screen'

// Oturum-bazli "ilk acilis" bayragi: pulse yalnizca Ana bu oturumda ilk kez
// mount oldugunda oynar; tab degisiminde tekrar oynamaz (EKRAN-SAHA.md §2).
let pulseShownThisSession = false

export function SahaHomeScreen() {
  const { addToast } = useToast()
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [showPulse] = useState(() => {
    if (pulseShownThisSession) return false
    pulseShownThisSession = true
    return true
  })

  function handlePicked(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = '' // ayni dosya tekrar secilebilsin
    if (f) setPendingFile(f)
  }
  function handleDocumentless() {
    // TODO-SPEC: C3 — belgesiz form; kamera ACILMAZ, is_documentless=true (EKRAN-SAHA.md §5).
    addToast('Belgesiz harcama yakında (C3)', 'info')
  }

  // Foto secildiyse fis giris formu (EKRAN-SAHA §4; M2: OCR yok, alanlar elle).
  if (pendingFile) {
    return <ReceiptEntryScreen file={pendingFile} onClose={() => setPendingFile(null)} />
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-5)',
      paddingTop: 'var(--space-6)',
    }}>
      <style>{`
        @keyframes kaapa-disk-pulse {
          0%   { transform: scale(0.96); }
          55%  { transform: scale(1.045); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Gizli dosya inputlari: kamera (capture=environment) + galeri (EKRAN-SAHA §3). */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePicked} style={{ display: 'none' }} />
      <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePicked} style={{ display: 'none' }} />

      {/* FIS TARA diski: ekranin gorsel merkezi, aksiyon onceligi (EKRAN-SAHA.md §2).
          Disk uzerindeki KAAPA = G6 logo ACIK SLOT (G6'da gercek logo ile swap).
          Uzun-bas YOK (karar 2026-06): gorunur Galeri+Belgesiz submenu'yu gereksiz kildi. */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        aria-label="Fiş tara"
        style={{
          width: 'min(62vw, 240px)',
          height: 'min(62vw, 240px)',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          background: 'var(--color-primary)',
          color: 'var(--color-primary-text)',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          animation: showPulse ? 'kaapa-disk-pulse 900ms ease-out 1' : undefined,
        }}
      >
        {/* G6 ACIK SLOT: logo swap */}
        <span style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-bold)',
          letterSpacing: '0.08em',
          opacity: 0.85,
        }}>
          KAAPA
        </span>
        <span style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--weight-bold)',
        }}>
          FİŞ TARA
        </span>
      </button>

      {/* Disk-alti hizli butonlar: Galeri · Belgesiz — kamera disinda iki giris yolu, her zaman gorunur (EKRAN-SAHA.md §2-3). */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        width: 'min(86vw, 360px)',
      }}>
        <button onClick={() => galleryInputRef.current?.click()} style={quickBtnStyle}>Galeri</button>
        <button onClick={handleDocumentless} style={quickBtnStyle}>Belgesiz</button>
      </div>
    </div>
  )
}

const quickBtnStyle: CSSProperties = {
  flex: 1,
  minHeight: 'var(--touch-min)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: 'var(--text-md)',
  fontWeight: 'var(--weight-medium)',
  cursor: 'pointer',
  padding: '0 var(--space-4)',
}
