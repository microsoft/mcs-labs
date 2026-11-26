import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { createAuth, describeAuthError, IdentityMismatchError, type PaneAuth, type Session } from './auth.ts'
import { configuredClientId } from './config.ts'
import { usePaneHost } from './usePaneHost.ts'
import { INTRO_PROMPTS } from './welcome.ts'

type Phase =
  | { kind: 'starting' }
  | { kind: 'signed-out'; notice?: string }
  | { kind: 'signing-in' }
  | { kind: 'chat'; session: Session }
  | { kind: 'mismatch'; notice: string }
  | { kind: 'failed'; notice: string }

const clientId = configuredClientId(import.meta.env.VITE_ZAVA_PANE_CLIENT_ID)

// WebChat is several MB; keep it out of the intro so sign-in shows immediately.
const loadChat = () => import('./Chat.tsx')
const Chat = lazy(loadChat)

const CAPABILITIES = [
  { title: 'Pipeline', text: 'Open deals by stage, forecast and risk' },
  { title: 'Leads', text: 'Hot leads, scores and who to call next' },
  { title: 'Work IQ', text: 'Your meetings, mail and chats as context' },
  { title: 'Create and update', text: 'New leads and deal changes, with your OK' },
]

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ICONS = {
  newChat: 'M10 4v12M4 10h12',
  popOut: 'M11 4h5v5M16 4l-7 7M14 12v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3',
  close: 'M5 5l10 10M15 5L5 15',
}

function ChatLoading() {
  return (
    <div className="chat">
      <p className="chat__loading" role="status">
        <span className="spinner" aria-hidden="true" />
        Connecting to Zava Agent…
      </p>
    </div>
  )
}

export default function App() {
  const host = usePaneHost()
  const [auth, setAuth] = useState<PaneAuth>()
  const [phase, setPhase] = useState<Phase>({ kind: 'starting' })
  const [chatKey, setChatKey] = useState(0)
  const loginHint = host.init?.loginHint
  const objectId = host.init?.objectId

  useEffect(() => {
    if (!clientId || host.blocked || !host.ready) return
    let cancelled = false
    void loadChat().catch(() => undefined)
    createAuth({ clientId, embedded: host.embedded, loginHint, objectId })
      .then(async created => {
        if (cancelled) return
        setAuth(created)
        const session = await created.silent()
        if (!cancelled) setPhase(session ? { kind: 'chat', session } : { kind: 'signed-out' })
      })
      .catch(error => {
        if (cancelled) return
        setPhase(error instanceof IdentityMismatchError
          ? { kind: 'mismatch', notice: describeAuthError(error) }
          : { kind: 'failed', notice: 'Zava Agent could not start sign-in. Reload the pane to try again.' })
      })
    return () => { cancelled = true }
  }, [host.blocked, host.ready, host.embedded, loginHint, objectId])

  // Runs inside the click: the sign-in window must open before anything awaits.
  const signIn = (chooseAccount = false) => {
    if (!auth) return
    setPhase({ kind: 'signing-in' })
    auth.signIn(chooseAccount).then(
      session => setPhase({ kind: 'chat', session }),
      error => setPhase(error instanceof IdentityMismatchError
        ? { kind: 'mismatch', notice: describeAuthError(error) }
        : { kind: 'signed-out', notice: describeAuthError(error) }),
    )
  }

  const getToken = useCallback(() => auth ? auth.token() : Promise.resolve(undefined), [auth])
  const onSessionLost = useCallback(() => {
    setPhase({ kind: 'signed-out', notice: 'Your sign-in expired. Sign in again to continue.' })
  }, [])

  const popOut = () => {
    window.open(`${window.location.origin}/`, '_blank', 'noopener')
  }

  const inChat = phase.kind === 'chat'
  // The host keeps its loading state up until sign-in has settled, so the pane opens straight onto the intro or the chat.
  const settled = !clientId || phase.kind !== 'starting'
  const { reportState } = host
  useEffect(() => {
    if (settled) reportState(inChat)
  }, [settled, inChat, reportState])

  return (
    <div className="pane">
      {!host.hostHeader && (
        <header className="pane__header">
          <img className="pane__mark" src="/zava-mark.svg" alt="" width="32" height="32" />
          <div className="pane__title">
            <h1>Zava Agent</h1>
            <p>{inChat ? phase.session.username : 'Pipeline, leads and Work IQ'}</p>
          </div>
          <div className="pane__actions">
            {inChat && (
              <button type="button" className="icon-button" onClick={() => setChatKey(key => key + 1)} title="New chat" aria-label="New chat">
                <Icon path={ICONS.newChat} />
              </button>
            )}
            {host.embedded && !host.blocked && (
              <button type="button" className="icon-button" onClick={popOut} title="Open in a new tab" aria-label="Open Zava Agent in a new tab">
                <Icon path={ICONS.popOut} />
              </button>
            )}
            {host.close && (
              <button type="button" className="icon-button" onClick={host.close} title="Close" aria-label="Close Zava Agent">
                <Icon path={ICONS.close} />
              </button>
            )}
          </div>
        </header>
      )}
      <main className="pane__body">
        {inChat
          ? (
              <Suspense fallback={<ChatLoading />}>
                <Chat key={chatKey + host.newChatRequests} name={phase.session.name} getToken={getToken} onSessionLost={onSessionLost} />
              </Suspense>
            )
          : <Intro phase={phase} blocked={host.blocked} handshakeTimedOut={host.handshakeTimedOut} configured={Boolean(clientId)} embedded={host.embedded} onSignIn={signIn} />}
      </main>
    </div>
  )
}

interface IntroProps {
  phase: Phase
  blocked: boolean
  handshakeTimedOut: boolean
  configured: boolean
  embedded: boolean
  onSignIn: (chooseAccount?: boolean) => void
}

function Intro({ phase, blocked, handshakeTimedOut, configured, embedded, onSignIn }: IntroProps) {
  return (
    <div className="intro">
      <section className="hero" aria-labelledby="hero-title">
        <h2 id="hero-title">Your Zava sales agent</h2>
        <p>Ask about your pipeline and leads, pull in context from your work with Work IQ, and create or update CRM records.</p>
      </section>
      <ul className="capabilities">
        {CAPABILITIES.map(item => (
          <li key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <section className="examples" aria-labelledby="examples-title">
        <h3 id="examples-title">Try asking</h3>
        <ul>
          {INTRO_PROMPTS.map(starter => <li key={starter.title}>{starter.prompt}</li>)}
        </ul>
      </section>
      <div className="intro__footer">
        <IntroFooter phase={phase} blocked={blocked} handshakeTimedOut={handshakeTimedOut} configured={configured} embedded={embedded} onSignIn={onSignIn} />
      </div>
    </div>
  )
}

function IntroFooter({ phase, blocked, handshakeTimedOut, configured, embedded, onSignIn }: IntroProps) {
  if (blocked) {
    return <p className="notice" role="alert">Zava Agent only opens inside Zava Sales Hub.</p>
  }
  if (!configured) {
    return (
      <p className="notice" role="status">
        Sign-in isn&apos;t set up for this copy of Zava Agent yet. It needs its approved app registration before anyone can sign in.
      </p>
    )
  }
  if (handshakeTimedOut) {
    return (
      <p className="notice notice--error" role="alert">
        Zava Sales Hub hasn&apos;t identified your account. Sign-in is paused until it does. Reopen the pane if this continues.
      </p>
    )
  }
  switch (phase.kind) {
    case 'starting':
      return <p className="status" role="status"><span className="spinner" aria-hidden="true" />Checking your sign-in…</p>
    case 'signing-in':
      return (
        <p className="status" role="status">
          <span className="spinner" aria-hidden="true" />
          {embedded ? 'Finish in the sign-in window. Select Continue there if asked.' : 'Finish in the sign-in window.'}
        </p>
      )
    case 'mismatch':
      return (
        <>
          <p className="notice notice--error" role="alert">{phase.notice}</p>
          <button type="button" className="button button--primary" onClick={() => onSignIn(true)}>Use a different account</button>
        </>
      )
    case 'failed':
      return <p className="notice notice--error" role="alert">{phase.notice}</p>
    case 'signed-out':
      return (
        <>
          {phase.notice && <p className="notice notice--error" role="alert">{phase.notice}</p>}
          <button type="button" className="button button--primary" onClick={() => onSignIn()}>Sign in to start</button>
          <p className="fine-print">Use your Zava training account. Zava Agent asks before it saves any change.</p>
        </>
      )
    default:
      return null
  }
}
