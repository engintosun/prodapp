import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { Receipt } from '../../shared/types/domain'
import { useToast } from '../../shared/components/toast'
import {
  getCategories,
  submitCorrection,
  type ExpenseCategory,
} from '../../shared/supabase/receipt-service'

interface Props {
  receipt: Receipt
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

export function ReceiptCorrectionScreen({ receipt, onClose }: Props) {
  const { addToast } = useToast()
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [amount, setAmount] = useState(String(receipt.amount))
  const [vatAmount, setVatAmount] = useState(receipt.vat_amount != null ? String(receipt.vat_amount) : '')
  const [vendorName, setVendorName] = useState(receipt.vendor_name ?? '')
  const [receiptDate, setReceiptDate] = useState(receipt.receipt_date ?? '')
  const [receiptNo, setReceiptNo] = useState(receipt.receipt_no ?? '')
  const [categoryId, setCategoryId] = useState(receipt.category_id ?? '')
  const [description, setDescription] = useState(receipt.description ?? '')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => addToast((e as Error).message, 'error'))
  }, [addToast])

  async function handleSubmit() {
    const amountNum = parseFloat(amount.replace(',', '.'))
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      addToast('Tutar zorunlu ve sıfırdan büyük olmalı', 'warning')
      return
    }
    setSubmitting(true)
    try {
      await submitCorrection(receipt.id, {
        amount: amountNum,
        vat_amount: vatAmount ? parseFloat(vatAmount.replace(',', '.')) : null,
        category_id: categoryId || null,
        description: description.trim() || null,
        vendor_name: vendorName.trim() || null,
        receipt_date: receiptDate || null,
        receipt_no: receiptNo.trim() || null,
      })
      addToast('Düzeltme gönderildi', 'success')
      onClose()
    } catch (e) {
      addToast((e as Error).message, 'error')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
          Düzeltme
        </span>
        <button onClick={onClose} aria-label="Kapat" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: 'var(--text-xl)', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      {/* Reviewer notu banner */}
      <div style={{
        background: 'var(--color-warning-bg, #fff8e1)',
        border: '1px solid var(--color-warning, #f59e0b)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
      }}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-warning-text, #92400e)', fontWeight: 'var(--weight-medium)' }}>
          Düzeltme gerekiyor
        </p>
        {receipt.correction_note && (
          <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            {receipt.correction_note}
          </p>
        )}
      </div>

      {receipt.receipt_image_url && (
        <img
          src={`/storage/v1/object/authenticated/${receipt.receipt_image_url}`}
          alt="Fiş"
          style={{ width: '100%', maxHeight: '30dvh', objectFit: 'contain', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-2)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}

      <div>
        <label style={labelStyle}>Satıcı</label>
        <input style={inputStyle} value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Satıcı adı" />
      </div>

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
        <textarea style={{ ...inputStyle, minHeight: '80px', padding: 'var(--space-3)', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Harcama açıklaması" />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
        <button onClick={onClose} disabled={submitting} style={{ flex: 1, minHeight: 'var(--touch-min)', background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-md)', cursor: 'pointer' }}>
          İptal
        </button>
        <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, minHeight: 'var(--touch-min)', background: 'var(--color-primary)', color: 'var(--color-primary-text)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Gönderiliyor…' : 'Duzelt ve Gönder'}
        </button>
      </div>
    </div>
  )
}
