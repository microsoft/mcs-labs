import { isGuid } from './config.ts'

// Version 1 of the message contract between Zava Sales Hub and this pane.
export const PROTOCOL = 1
export const HANDSHAKE_TIMEOUT_MS = 4000

export type Theme = 'light' | 'dark'

export interface PaneInit {
  tenantId: string
  objectId: string
  loginHint?: string
  theme?: Theme
  // The host draws the pane header itself, so the chat leaves its own out.
  hostHeader?: boolean
}

export type ParentMessage =
  | { type: 'init'; init: PaneInit }
  | { type: 'theme'; theme: Theme }
  | { type: 'new-chat' }

export interface ParentWindow {
  origin: string
  window: unknown
}

export interface MessageLike {
  origin: string
  data: unknown
  source: unknown
}

const LOGIN_HINT = /^[^\s@<>"'`]{1,128}@[A-Za-z0-9.-]{1,190}$/

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function isLoginHint(value: unknown): value is string {
  return typeof value === 'string' && LOGIN_HINT.test(value)
}

export function originOf(url: string): string | undefined {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' ? parsed.origin : undefined
  } catch {
    return undefined
  }
}

// The immediate parent is ancestorOrigins[0]; browsers without it fall back to the referrer origin.
export function resolveParentOrigin(
  ancestorOrigins: ArrayLike<string> | undefined, referrer: string, allowed: readonly string[],
): string | undefined {
  const candidate = ancestorOrigins && ancestorOrigins.length > 0 ? ancestorOrigins[0] : originOf(referrer)
  return candidate && allowed.includes(candidate) ? candidate : undefined
}

export function parseParentMessage(event: MessageLike, parent: ParentWindow, tenantId: string): ParentMessage | undefined {
  if (event.origin !== parent.origin || event.source !== parent.window) return undefined
  const data = record(event.data)
  if (data.v !== PROTOCOL) return undefined
  if (data.type === 'zava-pane:theme') return isTheme(data.theme) ? { type: 'theme', theme: data.theme } : undefined
  if (data.type === 'zava-pane:new-chat') return { type: 'new-chat' }
  if (data.type !== 'zava-pane:init') return undefined
  if (!isGuid(data.tenantId) || data.tenantId.toLowerCase() !== tenantId.toLowerCase()) return undefined
  if (!isGuid(data.objectId)) return undefined
  if (data.loginHint !== undefined && !isLoginHint(data.loginHint)) return undefined
  if (data.theme !== undefined && !isTheme(data.theme)) return undefined
  if (data.hostHeader !== undefined && typeof data.hostHeader !== 'boolean') return undefined
  const init: PaneInit = { tenantId: data.tenantId.toLowerCase(), objectId: data.objectId.toLowerCase() }
  if (data.loginHint !== undefined) init.loginHint = data.loginHint
  if (data.theme !== undefined) init.theme = data.theme
  if (data.hostHeader === true) init.hostHeader = true
  return { type: 'init', init }
}

export function subscribeToParentMessages(
  target: Pick<Window, 'addEventListener' | 'removeEventListener'>,
  parent: ParentWindow,
  tenantId: string,
  callbacks: {
    onInit: (init: PaneInit) => void
    onTheme: (theme: Theme) => void
    onNewChat: () => void
    onTimeout: () => void
  },
): () => void {
  let initialized = false
  // A timeout reports missing identity; it never permits sign-in or rejects a valid late init.
  const timer = globalThis.setTimeout(() => callbacks.onTimeout(), HANDSHAKE_TIMEOUT_MS)
  const onMessage = (event: MessageEvent) => {
    const message = parseParentMessage(event, parent, tenantId)
    if (!message) return
    if (message.type === 'theme') {
      callbacks.onTheme(message.theme)
      return
    }
    if (message.type === 'new-chat') {
      if (initialized) callbacks.onNewChat()
      return
    }
    if (initialized) return
    initialized = true
    globalThis.clearTimeout(timer)
    callbacks.onInit(message.init)
    if (message.init.theme) callbacks.onTheme(message.init.theme)
  }
  target.addEventListener('message', onMessage)
  return () => {
    target.removeEventListener('message', onMessage)
    globalThis.clearTimeout(timer)
  }
}

// hostHeader tells the host this chat can hide its header and report its state.
export function readyMessage() {
  return { type: 'zava-pane:ready', v: PROTOCOL, hostHeader: true } as const
}

// Only whether a chat is open; the host shows its own copy of the user's name.
export function stateMessage(signedIn: boolean) {
  return { type: 'zava-pane:state', v: PROTOCOL, signedIn } as const
}

export function closeMessage() {
  return { type: 'zava-pane:close', v: PROTOCOL } as const
}
