import { BottomSheet } from './bottom-sheet'

export function StatusInfoSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="Statü rehberi" onClose={onClose}>
      {[
        { label: 'Bordro', text: 'Ücretli çalışan. Net ele geçen tutar girilir; SGK ve vergi yükleri üzerine biner, oranlar şirket tanımına ve güncel mevzuata göre hesaplanır.' },
        { label: 'SMM', text: 'Serbest meslek makbuzu. Stopaj kesintisi içerir; KDV durumu kişinin mükellefiyetine göre değişir.' },
        { label: 'Telif', text: 'Senarist, yönetmen, besteci gibi eser sahipleri (oyunculuk DEĞİL). Stopaj kesintisi içerir.' },
        { label: 'Fatura', text: 'Şirketten alınan mal/hizmet. Stopaj yok; KDV genel oranda, kalem bazında değiştirilebilir.' },
        { label: 'Kira', text: 'ŞAHISTAN kiralama (lokasyon, araç vb.). Stopaj var, KDV yok. Şirketten kiralama Fatura kalemine girer.' },
        { label: 'Konaklama/Yemek', text: 'Otel, pansiyon, set catering, restoran. İndirimli KDV; stopaj ve SGK yükü yok.' },
      ].map(({ label, text }) => (
        <div key={label} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>{label}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{text}</div>
        </div>
      ))}
    </BottomSheet>
  )
}
