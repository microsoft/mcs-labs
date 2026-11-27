import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, RefObject } from 'react'
import { PANE_ORIGIN, PANE_READY_TIMEOUT_MS, PANE_URL, paneInitMessage, paneNewChatMessage, paneThemeMessage, readPaneMessage } from './paneProtocol'
import type { PaneTheme } from './paneProtocol'
import { clampPaneWidth, keyedPaneWidth, paneLimits } from './paneSize'
import type { PaneLimits } from './paneSize'
import { Icon } from './ui'

type Status = 'loading' | 'ready' | 'stalled' | 'failed'
interface Props {
  open: boolean; objectId: string; loginHint?: string; theme: PaneTheme; focusRequest: number; onClose: () => void
  // The CRM column the pane shares the row with, and the width owner: done is false while dragging.
  crm: RefObject<HTMLElement | null>; width?: number; onResize: (width: number | undefined, done: boolean) => void
}
interface Drag { id: number; x: number; start: number; width: number; limits: PaneLimits; moved: boolean; frame: number }
const RESIZING = 'is-resizing-pane'

// The chat runs on its own origin; this frame only sends it the app user's identity and theme.
// The app draws the pane header so it lines up with the topbar; the chat reports when it has settled.
export function CopilotPane({ open, objectId, loginHint, theme, focusRequest, onClose, crm, width, onResize }: Props) {
  const pane = useRef<HTMLElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const drag = useRef<Drag | undefined>(undefined)
  const [size, setSize] = useState<PaneLimits & { now: number }>()
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [signedIn, setSignedIn] = useState(false)
  const [hostHeader, setHostHeader] = useState(true)
  const sentTheme = useRef<PaneTheme | undefined>(undefined)
  const latest = useRef({ theme, onClose })
  useEffect(() => { latest.current = { theme, onClose } })

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const target = frame.current?.contentWindow
      const message = readPaneMessage(event, target)
      if (!message || !target) return
      if (message.type === 'close') { latest.current.onClose(); return }
      if (message.type === 'state') {
        // Before init the chat has no identity; leave the overlay up so the timeout can offer a retry.
        if (sentTheme.current === undefined) return
        setSignedIn(message.signedIn); setStatus('ready'); return
      }
      try {
        target.postMessage(paneInitMessage({ objectId, loginHint }, latest.current.theme), PANE_ORIGIN)
        sentTheme.current = latest.current.theme
        setHostHeader(message.hostHeader)
        // An older chat draws its own header and never reports its state.
        if (!message.hostHeader) setStatus('ready')
      } catch (e) {
        console.warn('Zava Agent was not started.', e)
        setStatus('failed')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [objectId, loginHint])

  useEffect(() => {
    if (status !== 'loading') return
    const id = window.setTimeout(() => setStatus(s => s === 'loading' ? 'stalled' : s), PANE_READY_TIMEOUT_MS)
    return () => window.clearTimeout(id)
  }, [status, attempt])

  useEffect(() => {
    if (sentTheme.current === undefined || sentTheme.current === theme) return
    frame.current?.contentWindow?.postMessage(paneThemeMessage(theme), PANE_ORIGIN)
    sentTheme.current = theme
  }, [theme])

  useEffect(() => { if (focusRequest > 0) frame.current?.focus() }, [focusRequest])

  // Keep the separator's aria values in step with the real width, which the window and the CSS clamp also change.
  useEffect(() => {
    const aside = pane.current
    if (!open || !aside) return
    const measure = () => {
      const column = crm.current
      if (!column || aside.hidden) return
      const box = aside.getBoundingClientRect()
      const next = { now: Math.round(box.width), ...paneLimits(box.right - column.getBoundingClientRect().left) }
      setSize(s => s && s.now === next.now && s.min === next.min && s.max === next.max ? s : next)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(aside)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [open, crm])

  useEffect(() => () => document.body.classList.remove(RESIZING), [])

  // Dragging sets the width directly on every frame; the owner stores it once the pointer is released.
  function startResize(e: PointerEvent<HTMLDivElement>) {
    const aside = pane.current, column = crm.current
    if (e.button !== 0 || !aside || !column) return
    e.preventDefault()
    const box = aside.getBoundingClientRect()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, x: e.clientX, start: box.width, width: box.width, limits: paneLimits(box.right - column.getBoundingClientRect().left), moved: false, frame: 0 }
    document.body.classList.add(RESIZING)
  }

  function moveResize(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    if (!d.moved && Math.abs(e.clientX - d.x) < 2) return
    d.moved = true
    d.width = clampPaneWidth(d.start + d.x - e.clientX, d.limits)
    if (!d.frame) d.frame = requestAnimationFrame(() => { d.frame = 0; onResize(d.width, false) })
  }

  function endResize(e: PointerEvent<HTMLDivElement>, commit: boolean) {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    drag.current = undefined
    cancelAnimationFrame(d.frame)
    document.body.classList.remove(RESIZING)
    if (d.moved) onResize(commit ? d.width : width, commit)
  }

  function keyResize(e: KeyboardEvent<HTMLDivElement>) {
    const next = size && keyedPaneWidth(e.key, e.shiftKey, size.now, size)
    if (next === undefined) return
    e.preventDefault()
    onResize(next, true)
  }

  function retry() {
    sentTheme.current = undefined
    setStatus('loading'); setSignedIn(false); setHostHeader(true); setAttempt(a => a + 1)
  }

  function newChat() {
    frame.current?.contentWindow?.postMessage(paneNewChatMessage(), PANE_ORIGIN)
    frame.current?.focus()
  }

  const ready = status === 'ready'
  return <aside ref={pane} className="copilot-pane" id="copilot-pane" aria-label="Zava Agent" hidden={!open} onKeyDown={e => { if (e.key === 'Escape' && !e.defaultPrevented) onClose() }}>
    <div className="copilot-pane-resizer" role="separator" aria-orientation="vertical" aria-label="Resize Zava Agent" aria-controls="copilot-pane" aria-valuenow={size?.now} aria-valuemin={size?.min} aria-valuemax={size?.max} tabIndex={0} title="Drag to resize. Double-click to reset."
      onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={e => endResize(e, true)} onPointerCancel={e => endResize(e, false)} onLostPointerCapture={e => endResize(e, true)} onKeyDown={keyResize} onDoubleClick={() => onResize(undefined, true)} />
    {hostHeader && <header className="copilot-pane-header">
      <span className="copilot-pane-mark" aria-hidden="true"><Icon name="sparkle" size={18} /></span>
      <div className="copilot-pane-title"><h2>Zava Agent</h2></div>
      <div className="copilot-pane-tools">
        {ready && signedIn && <button className="icon-button" onClick={newChat} aria-label="New chat" title="New chat"><Icon name="plus" size={18} /></button>}
        <a className="icon-button" href={PANE_URL} target="_blank" rel="noopener noreferrer" aria-label="Open Zava Agent in a new tab" title="Open in a new tab"><Icon name="external" size={16} /></a>
        <button className="icon-button" onClick={onClose} aria-label="Close Zava Agent" title="Close (Esc)"><Icon name="close" size={18} /></button>
      </div>
    </header>}
    <div className={`copilot-pane-body ${ready ? 'is-ready' : ''}`}>
      <iframe key={attempt} ref={frame} src={PANE_URL} title="Zava Agent chat" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" />
      {!ready && <div className="copilot-pane-state" role={status === 'loading' ? 'status' : 'alert'}>
        <span className="copilot-orb"><Icon name="sparkle" size={28} /></span>
        {status === 'loading' ? <>
          <h2>Starting Zava Agent</h2>
          <p>Your sales assistant for pipeline, leads and next steps.</p>
          <span className="copilot-dots" aria-hidden="true"><i /><i /><i /></span>
        </> : <>
          <h2>{status === 'failed' ? 'Zava Agent can’t start here' : 'Zava Agent is taking a while'}</h2>
          <p>{status === 'failed' ? 'Your app identity couldn’t be passed to the assistant. Reload the app or open Zava Agent in a new tab.' : 'It may still be loading, or your organization’s settings may block it inside this app. Try again or open it in a new tab.'}</p>
          <div className="copilot-pane-actions">
            <button className="button primary" onClick={retry}>Try again<Icon name="refresh" size={17} /></button>
            <a className="button secondary" href={PANE_URL} target="_blank" rel="noopener noreferrer">Open in a new tab<Icon name="external" size={15} /></a>
          </div>
        </>}
      </div>}
    </div>
  </aside>
}
