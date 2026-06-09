import { supabase } from './client'
import type { Department, Period } from '../types/domain'

export async function createDepartment(projectId: string, name: string): Promise<Department> {
  const { data, error } = await supabase
    .from('departments')
    .insert({ project_id: projectId, name })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Department
}

export async function openPeriod(projectId: string, name: string, createdBy: string): Promise<Period> {
  const { data, error } = await supabase
    .from('periods')
    .insert({ project_id: projectId, name, created_by: createdBy })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Period
}

export async function setPeriodBudget(
  periodId: string,
  totalBudget: number,
  currency: string,
  setBy: string
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('period_budgets')
    .upsert(
      {
        period_id: periodId,
        total_budget: totalBudget,
        currency,
        set_by: setBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'period_id' }
    )
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Record<string, unknown>
}

export async function setDeptBudget(
  periodId: string,
  deptId: string,
  amount: number,
  setBy: string
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('dept_budgets')
    .upsert(
      {
        period_id: periodId,
        dept_id: deptId,
        budget_amount: amount,
        set_by: setBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'period_id,dept_id' }
    )
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Record<string, unknown>
}
