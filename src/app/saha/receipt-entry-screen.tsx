import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useToast } from '../../shared/components/toast'
import { getCategories, createReceipt, type ExpenseCategory } from '../../shared/supabase/receipt-service'

interface Props {
  file: File
  onClose: () => void
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-1)',
}
const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 'var(--touch-min)',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '0 var(--space-3)',
  fontSize: 'var(--text-md)',
}

export function ReceiptEntryScreen({ file, onClose }: Props) {
  const { addToast } = useToast()
  const [previewUrl, setPreviewUrl] = useState('')
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [vendorName, setVendorName] = useState('')
  const [amount, setAmount] = useState('')
  const [vatAmount, setVatAmount] = useState('')
  const [receiptDate, setReceiptDate] = useState('')
  const [receiptNo, setReceiptNo] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => addToast((e as Error).message, 'error'))
  }, [])

  async function handleSave() {
    const amountNum = parseFloat(amount.replace(',', '.'))
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      addToast('Tutar zorunlu ve sıfırdan büyük olmalı', 'warning')
      return
    }
    setSubmitting(true)
    try {
      await createReceipt({
        amount: amountNum,
        vatAmount: vatAmount ? parseFloat(vatAmount.replace(',', '.')) : null,
        categoryId: categoryId || null,
        vendorName: vendorName.trim() || null,
        receiptDate: receiptDate || null,
        receiptNo: receiptNo.trim() || null,
        description: description.trim() || null,
        file,
      })
      addToast('Fiş gönderildi', 'success')
      onClose()
    } catch (e) {
      addToast((e as Error).message, 'error')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header — EKRAN-SAHA §4. M2: OCR yok, alanlar elle (State-2 gibi davranir). */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
          Belge ile karşılaştırın
        </span>
        <button onClick={onClose} aria-label="Kapat" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: 'var(--text-xl)', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      {previewUrl && (
        <img src={previewUrl} alt="Fiş" style={{ width: '100%', maxHeight: '40dvh', objectFit: 'contain', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-2)' }} />
      )}

      <div>
        <label style={labelStyle}>Satıcı</label>
        <input style={inputStyle} value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Satıcı adı" />
      </div>

      {/* Tutar + KDV yan yana (§4) */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Tutar (₺) *</label>
          <input style={inputStyle} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>KDV (₺)</label>
          <input style={inputStyle} value={vatAmount} onChange={(e) => setVatAmount(e.target.value)} inputMode="decimal" placeholder="0,00" />
        </div>
      </div>

      {/* Tarih + Fis No yan yana (§4) */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Tarih</label>
          <input style={inputStyle} type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Fiş No</label>
          <input style={inputStyle} value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} placeholder="Fiş/fatura no" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Kategori</label>
        <select style={inputStyle} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Seçiniz</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Açıklama</label>
        {/* TODO-SPEC: inline mikrofon (browser Speech API) — EKRAN-SAHA §4; sonraya. */}
        <textarea style={{ ...inputStyle, minHeight: '80px', padding: 'var(--space-3)', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Harcama açıklaması" />
      </div>

      {/* Aksiyon: Iptal / Kaydet (= submitted INSERT). Taslak yok (EKRAN-SAHA §4). */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
        <button onClick={onClose} disabled={submitting} style={{ flex: 1, minHeight: 'var(--touch-min)', background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-md)', cursor: 'pointer' }}>
          İptal
        </button>
        <button onClick={handleSave} disabled={submitting} style={{ flex: 2, minHeight: 'var(--touch-min)', background: 'var(--color-primary)', color: 'var(--color-primary-text)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
