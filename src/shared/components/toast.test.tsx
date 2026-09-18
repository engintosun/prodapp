// @vitest-environment jsdom
// Uyari balonunun yeri ve suresi (TASARIM-KARARLARI bolum 9, 17 Eylul 2026).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import type { ToastType } from './toast'
import { ToastProvider, useToast, useToastHost } from './toast'

function Trigger({ message, type }: { message: string; type: ToastType }) {
  const { addToast } = useToast()
  return (
    <button type="button" onClick={() => addToast(message, type)}>
      {`tetik-${message}`}
    </button>
  )
}

function Host() {
  const hostRef = useToastHost()
  return <div data-testid="host" ref={hostRef} />
}

function HostToggle() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button type="button" onClick={() => setOpen(false)}>pencereyi-kapat</button>
      {open && <Host />}
    </>
  )
}

describe('toast sure ve yer kurali', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('basari mesaji kendiliginden gider, uyari ve hata kalir', () => {
    render(
      <ToastProvider>
        <Trigger message="basari" type="success" />
        <Trigger message="uyari" type="warning" />
        <Trigger message="hata" type="error" />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByText('tetik-basari'))
    fireEvent.click(screen.getByText('tetik-uyari'))
    fireEvent.click(screen.getByText('tetik-hata'))
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(screen.queryByText('basari')).toBeNull()
    expect(screen.queryByText('uyari')).not.toBeNull()
    expect(screen.queryByText('hata')).not.toBeNull()
  })

  it('uyari kapat dugmesiyle kapanir', () => {
    render(
      <ToastProvider>
        <Trigger message="uyari" type="warning" />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByText('tetik-uyari'))
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
    expect(screen.queryByText('uyari')).toBeNull()
  })

  it('pencere acikken mesaj pencerenin icinde cikar, pencere kapaninca kaybolmaz', () => {
    render(
      <ToastProvider>
        <Trigger message="uyari" type="warning" />
        <HostToggle />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByText('tetik-uyari'))
    expect(screen.getByTestId('host').contains(screen.getByText('uyari'))).toBe(true)
    fireEvent.click(screen.getByText('pencereyi-kapat'))
    expect(screen.queryByTestId('host')).toBeNull()
    expect(screen.queryByText('uyari')).not.toBeNull()
  })
})
