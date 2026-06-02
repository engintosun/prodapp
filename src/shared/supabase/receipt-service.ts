import { supabase } from './client'

export interface ExpenseCategory {
  id: string
  name: string
}

export interface NewReceiptInput {
  amount: number
  vatAmount: number | null
  categoryId: string | null
  vendorName: string | null
  receiptDate: string | null
  receiptNo: string | null
  description: string | null
  file: File
}

// Claim'lerden aktif proje + kullanici kimligi.
async function getIdentity(): Promise<{ projectId: string; userId: string }> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) throw new Error('Oturum bulunamadı, tekrar giriş yapın')
  const projectId = data.session.user.app_metadata?.project_id as string | undefined
  if (!projectId) throw new Error('Aktif proje bulunamadı')
  return { projectId, userId: data.session.user.id }
}

// Kategori dropdown (expense_categories, projeye gore).
export async function getCategories(): Promise<ExpenseCategory[]> {
  const { projectId } = await getIdentity()
  const { data, error } = await supabase
    .from('expense_categories')
    .select('id, name')
    .eq('project_id', projectId)
    .order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as ExpenseCategory[]
}

// Foto'yu storage'a yukler + fisi submitted olarak INSERT eder.
// receiptId ONCE uretilir; hem storage path'ine hem receipts.id'ye verilir.
// Donem yonlendirme trigger'i status + dept_id'yi belirler (client SET ETMEZ).
export async function createReceipt(input: NewReceiptInput): Promise<string> {
  const { projectId, userId } = await getIdentity()

  // Aktif donem (open/closing)
  const { data: period, error: pErr } = await supabase
    .from('periods')
    .select('id')
    .eq('project_id', projectId)
    .in('status', ['open', 'closing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (pErr) throw new Error(pErr.message)
  if (!period) throw new Error('Açık dönem yok — fiş girilemez')

  const receiptId = crypto.randomUUID()

  // 1) Storage upload — bucket private; path projectId/receiptId/receipt.<ext>
  //    (RLS: [1]=project_id(), owner=auth.uid() otomatik)
  const ext = (input.file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${projectId}/${receiptId}/receipt.${ext}`
  const { error: upErr } = await supabase.storage
    .from('receipts')
    .upload(path, input.file, {
      contentType: input.file.type || undefined,
      upsert: false,
    })
  if (upErr) throw new Error('Foto yüklenemedi: ' + upErr.message)

  // 2) Fis INSERT — status default submitted; trigger kuyruga atar + dept_id atar
  const { error: insErr } = await supabase.from('receipts').insert({
    id: receiptId,
    project_id: projectId,
    period_id: period.id,
    user_id: userId,
    amount: input.amount,
    currency: 'TRY',
    vat_amount: input.vatAmount,
    category_id: input.categoryId,
    vendor_name: input.vendorName,
    receipt_date: input.receiptDate,
    receipt_no: input.receiptNo,
    description: input.description,
    receipt_image_url: path,
  })
  if (insErr) throw new Error('Fiş kaydedilemedi: ' + insErr.message)

  return receiptId
}
