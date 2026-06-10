import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Department } from '../../shared/types/domain'
import { useToast } from '../../shared/components/toast'
import { getDepartments } from '../../shared/supabase/invitation-service'
import { createDepartment, updateDepartmentName } from '../../shared/supabase/onboarding-service'

interface Props {
  projectId: string
  onDone: () => void
}

const inputStyle: CSSProperties = {
  boxSizing: 'border-box',
  minHeight: 'var(--touch-min)',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '0 var(--space-3)',
  fontSize: 'var(--text-md)',
}

const primaryButtonStyle: CSSProperties = {
  minHeight: 'var(--touch-min)',
  background: 'var(--color-primary)',
  color: 'var(--color-primary-text)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-md)',
  fontWeight: 'var(--weight-bold)',
  padding: '0 var(--space-4)',
  cursor: 'pointer',
}

const secondaryButtonStyle: CSSProperties = {
  minHeight: 'var(--touch-min)',
  background: 'transparent',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  padding: '0 var(--space-3)',
  cursor: 'pointer',
}

export function DepartmentStep({ projectId, onDone }: Props) {
  const { addToast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((e) => addToast((e as Error).message, 'error'))
  }, [])

  async function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed) return
    setAdding(true)
    try {
      const dept = await createDepartment(projectId, trimmed)
      setDepartments((prev) => [...prev, dept])
      setNewName('')
    } catch (e) {
      addToast((e as Error).message, 'error')
    } finally {
      setAdding(false)
    }
  }

  function startEdit(dept: Department) {
    setEditingId(dept.id)
    setEditValue(dept.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  async function handleSaveEdit(deptId: string) {
    const trimmed = editValue.trim()
    if (!trimmed) return
    setSavingEdit(true)
    try {
      await updateDepartmentName(deptId, trimmed)
      setDepartments((prev) => prev.map((d) => (d.id === deptId ? { ...d, name: trimmed } : d)))
      setEditingId(null)
      setEditValue('')
    } catch (e) {
      addToast((e as Error).message, 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
        Departmanlar
      </span>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Departman adı"
        />
        <button
          onClick={handleAdd}
          disabled={adding || newName.trim() === ''}
          style={{ ...primaryButtonStyle, opacity: adding || newName.trim() === '' ? 0.6 : 1, cursor: adding || newName.trim() === '' ? 'default' : 'pointer' }}
        >
          Ekle
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {departments.map((dept) => (
          <div
            key={dept.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {editingId === dept.id ? (
              <>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  onClick={() => handleSaveEdit(dept.id)}
                  disabled={savingEdit || editValue.trim() === ''}
                  style={{ ...secondaryButtonStyle, opacity: savingEdit || editValue.trim() === '' ? 0.6 : 1 }}
                >
                  Kaydet
                </button>
                <button onClick={cancelEdit} disabled={savingEdit} style={secondaryButtonStyle}>
                  Vazgeç
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, color: 'var(--color-text)', fontSize: 'var(--text-md)' }}>{dept.name}</span>
                <button onClick={() => startEdit(dept)} style={secondaryButtonStyle}>
                  Düzelt
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onDone}
        disabled={departments.length === 0}
        style={{ ...primaryButtonStyle, opacity: departments.length === 0 ? 0.6 : 1, cursor: departments.length === 0 ? 'default' : 'pointer' }}
      >
        Devam
      </button>
    </div>
  )
}
