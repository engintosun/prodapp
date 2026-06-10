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

export async function createProject(
  name: string,
  companyName: string,
  firstName: string,
  lastName: string
): Promise<string> {
  const { data, error } = await supabase.rpc('fn_create_project', {
    p_name: name,
    p_company_name: companyName,
    p_first_name: firstName,
    p_last_name: lastName,
  })
  if (error) throw new Error(error.message)
  return data as unknown as string
}

export async function setProjectBudget(
  projectId: string,
  totalBudget: number,
  currency: string,
  setBy: string
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('project_budgets')
    .upsert(
      {
        project_id: projectId,
        total_budget: totalBudget,
        currency,
        set_by: setBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' }
    )
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Record<string, unknown>
}

export async function setProjectDeptBudget(
  projectId: string,
  deptId: string,
  amount: number,
  setBy: string
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('project_dept_budgets')
    .upsert(
      {
        project_id: projectId,
        dept_id: deptId,
        budget_amount: amount,
        set_by: setBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,dept_id' }
    )
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Record<string, unknown>
}

export async function updateDepartmentName(deptId: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('departments')
    .update({ name })
    .eq('id', deptId)
  if (error) throw new Error(error.message)
}

export async function hasOpenPeriod(projectId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('periods')
    .select('id')
    .eq('project_id', projectId)
    .eq('status', 'open')
    .limit(1)
  if (error) throw new Error(error.message)
  return (data ?? []).length > 0
}
