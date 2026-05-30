export type UserRole = 'saha' | 'dept' | 'muhasebe'

export type ReceiptStatus =
  | 'draft'
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
  currency: string
  category_id: string | null
  status: ReceiptStatus
  created_at: string
  vendor_name?: string | null
  description?: string | null
  receipt_image_url?: string | null
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
