import { useCallback, useEffect, useRef, useState } from 'react'
import { PARENT_ORIGINS, TENANT_ID } from './config.ts'
import {
  closeMessage, readyMessage, resolveParentOrigin, stateMessage, subscribeToParentMessages, type PaneInit, type Theme,
} from './handshake.ts'

export interface PaneHost {
  embedded: boolean
  blocked: boolean
  ready: boolean
  handshakeTimedOut: boolean
  init?: PaneInit
  theme: Theme
  // True when Zava Sales Hub draws the pane header around this chat.
  hostHeader: boolean
  // Bumped each time the host's New chat button is pressed.
  newChatRequests: number
  reportState: (signedIn: boolean) => void
  close?: () => void
}

const embedded = window.self !== window.top
const darkQuery = '(prefers-color-scheme: dark)'

function systemTheme(): Theme {
  return window.matchMedia(darkQuery).matches ? 'dark' : 'light'
}

export function usePaneHost(): PaneHost {
  const [parentOrigin] = useState(() => embedded
    ? resolveParentOrigin(window.location.ancestorOrigins, document.referrer, PARENT_ORIGINS)
    : undefined)
  const [init, setInit] = useState<PaneInit>()
  const [handshakeTimedOut, setHandshakeTimedOut] = useState(false)
  const [hostTheme, setHostTheme] = useState<Theme>()
  const [system, setSystem] = useState(systemTheme)
  const [newChatRequests, setNewChatRequests] = useState(0)
  const reported = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    const media = window.matchMedia(darkQuery)
    const update = () => setSystem(media.matches ? 'dark' : 'light')
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!parentOrigin) return
    const parent = { origin: parentOrigin, window: window.parent }
    const unsubscribe = subscribeToParentMessages(window, parent, TENANT_ID, {
      onInit: value => {
        setInit(value)
        setHandshakeTimedOut(false)
      },
      onTheme: setHostTheme,
      onNewChat: () => setNewChatRequests(count => count + 1),
      onTimeout: () => setHandshakeTimedOut(true),
    })
    window.parent.postMessage(readyMessage(), parentOrigin)
    return unsubscribe
  }, [parentOrigin])

  const theme = hostTheme ?? system
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const close = useCallback(() => {
    if (parentOrigin) window.parent.postMessage(closeMessage(), parentOrigin)
  }, [parentOrigin])

  // The host can't see keys pressed in this frame, so Escape is forwarded as a close.
  // WebChat consumes Escape itself while it is in use, and that press is left alone.
  useEffect(() => {
    if (!parentOrigin) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && !event.isComposing) close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [parentOrigin, close])

  const hostHeader = Boolean(init?.hostHeader)
  const reportState = useCallback((signedIn: boolean) => {
    if (!parentOrigin || !hostHeader || reported.current === signedIn) return
    reported.current = signedIn
    window.parent.postMessage(stateMessage(signedIn), parentOrigin)
  }, [parentOrigin, hostHeader])

  return {
    embedded,
    blocked: embedded && !parentOrigin,
    ready: !embedded || Boolean(init),
    handshakeTimedOut,
    init,
    theme,
    hostHeader,
    newChatRequests,
    reportState,
    close: parentOrigin ? close : undefined,
  }
}
