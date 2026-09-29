// TEMPORARY measurement probe (CURRENT.md Siradaki is 1, 29 Sep 2026).
// Measures where the time goes when a budget item or a period is added. Each finished
// operation prints ONE console.info line starting with PROBE; every step shows the
// milliseconds since the previous step. Nothing is shown on screen. This file and every
// probe call are REMOVED in the fix slice, do not build on it.

interface Trace {
  kind: string
  start: number
  last: number
  steps: string[]
}

let current: Trace | null = null

function print(t: Trace, endAt: number, suffix: string): void {
  const total = Math.round(endAt - t.start)
  console.info(`PROBE ${t.kind} | ${t.steps.join(' | ')} | toplam ${total}${suffix}`)
}

export function probeBegin(kind: string): void {
  if (current) print(current, performance.now(), ' | YARIM')
  const now = performance.now()
  current = { kind, start: now, last: now, steps: [] }
}

export function probeMark(step: string): void {
  if (!current) return
  const now = performance.now()
  current.steps.push(`${step} ${Math.round(now - current.last)}`)
  current.last = now
}

export function probeEnd(): void {
  if (!current) return
  const t = current
  current = null
  print(t, performance.now(), '')
}

// Call right after scrollIntoView. No scroll event within 150 ms means the row was already
// in view (block nearest): the step prints as "kayma yok" and the total stops at the call.
// Otherwise the step ends at scrollend (Chrome and Edge 114+); a 3000 ms fallback keeps a
// missing event from leaving the trace open.
export function probeAwaitScroll(): void {
  if (!current) return
  const trace: Trace = current
  const calledAt = performance.now()
  let moved = false
  let closed = false
  const onScroll = (): void => {
    moved = true
  }
  const close = (step: string, endAt: number): void => {
    if (closed) return
    closed = true
    document.removeEventListener('scroll', onScroll, true)
    document.removeEventListener('scrollend', onScrollEnd, true)
    if (current !== trace) return
    current = null
    trace.steps.push(step === 'kayma yok' ? step : `${step} ${Math.round(endAt - trace.last)}`)
    print(trace, endAt, '')
  }
  const onScrollEnd = (): void => {
    close('kayma', performance.now())
  }
  document.addEventListener('scroll', onScroll, true)
  document.addEventListener('scrollend', onScrollEnd, true)
  window.setTimeout(() => {
    if (!moved) close('kayma yok', calledAt)
  }, 150)
  window.setTimeout(() => close('kayma zaman asimi', performance.now()), 3000)
}

// Independent line for work that runs beside the traced operation (bordro batch).
export function probeLog(label: string, startedAt: number, count: number): void {
  console.info(`PROBE ${label} (${count} kalem) | ${Math.round(performance.now() - startedAt)}`)
}
