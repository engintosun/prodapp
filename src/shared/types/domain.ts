export type UserRole = 'saha' | 'dept' | 'muhasebe'

export type ReceiptStatus =
  | 'submitted'
  | 'dept_pending'
  | 'dept_approved'
  | 'dept_rejected'
  | 'acc_pending'
  | 'acc_approved'
  | 'acc_rejected'
  | 'split'

export type PeriodStatus =
  | 'open'
  | 'partially_closed'
  | 'closing'
  | 'closed'
  | 'permanently_closed'

export type ApprovalAction = 'approved' | 'rejected' | 'split' | 'auto_approved'

export type ApproverRole = 'dept' | 'muhasebe'

export interface Receipt {
  id: string
  project_id: string
  period_id: string
  user_id: string
  amount: number
  vat_amount?: number | null
  currency: string
  category_id: string | null
  status: ReceiptStatus
  created_at: string
  updated_at?: string | null
  vendor_name?: string | null
  description?: string | null
  receipt_image_url?: string | null
  receipt_date?: string | null
  receipt_no?: string | null
  parent_receipt_id?: string | null
  correction_requested: boolean
  correction_note: string | null
}

export interface Period {
  id: string
  project_id: string
  name: string
  status: PeriodStatus
  created_at: string
  close_declared_at?: string | null
  grace_until?: string | null
  saha_deadline?: string | null
  dept_deadline?: string | null
  acc_deadline?: string | null
}

export interface ApprovalLog {
  id: string
  receipt_id: string
  action: ApprovalAction
  approver_id: string
  approver_role: ApproverRole
  created_at: string
  reason?: string | null
  split_amount?: number | null
}

export interface Department {
  id: string
  name: string
}

export interface Invitation {
  id: string
  project_id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  dept_id: string | null
  token: string
  invited_by: string
  status: string
  created_at: string
  expires_at: string
  accepted_at: string | null
}

// kume tek kaynaktir, yeni statu buraya eklenir.
export const PAYMENT_STATUSES = [
  { code: 'bordro', label: 'Bordro', guide: 'Ücretli çalışan. Net ele geçen tutar girilir; SGK ve vergi yükleri üzerine biner, oranlar şirket tanımına ve güncel mevzuata göre hesaplanır.' },
  { code: 'smm', label: 'SMM', guide: 'Serbest meslek makbuzu. Stopaj kesintisi içerir; KDV durumu kişinin mükellefiyetine göre değişir.' },
  { code: 'telif_belgeli', label: 'Telif', guide: 'Senarist, yönetmen, besteci gibi eser sahipleri (oyunculuk DEĞİL). Stopaj kesintisi içerir.' },
  { code: 'sirket', label: 'Fatura', guide: 'Şirketten alınan mal/hizmet. Stopaj yok; KDV genel oranda, kalem bazında değiştirilebilir.' },
  { code: 'kira_sahis', label: 'Kira', guide: 'ŞAHISTAN kiralama (lokasyon, araç vb.). Stopaj var, KDV yok. Şirketten kiralama Fatura kalemine girer.' },
  { code: 'konaklama', label: 'Konaklama', guide: 'Otel, pansiyon, geceleme. İndirimli KDV (%10); stopaj ve SGK yükü yok. Yeme-içme buraya girmez, ayrı statüsü var.' },
  { code: 'yemek', label: 'Yemek', guide: 'Restoran, lokanta, set catering. Alkollü içecekler hariç. İndirimli KDV (%10); stopaj ve SGK yükü yok.' },
  { code: 'resmi_odeme', label: 'Harç/Vergi', guide: 'Kamuya yapılan resmî ödeme: noter, tapu, gümrük harcı. Stopaj yok, SGK yok, KDV yok; net ile brüt aynıdır. Damga vergisi buraya girmez, o bir yüktür ve sözleşme bedelinden oranla hesaplanır.' },
] as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]['code']

export function isPaymentStatus(v: unknown): v is PaymentStatus {
  return typeof v === 'string' && PAYMENT_STATUSES.some((s) => s.code === v)
}
