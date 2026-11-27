import { useEffect, useState, type ComponentProps } from 'react'
import { createStore } from 'botframework-webchat'
import { BasicWebChat, Composer } from 'botframework-webchat/component.js'
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme'
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client'
import { openConnection } from './agent.ts'
import { starterPromptMiddleware, welcomeActivity, welcomeMiddleware } from './welcome.ts'

const styleOptions: ComponentProps<typeof Composer>['styleOptions'] = {
  rootHeight: '100%',
  rootWidth: '100%',
  partGroupDefaultOpen: false,
  disableFileUpload: true,
  hideTelephoneKeypadButton: true,
  sendBoxTextWrap: true,
}

interface Live {
  connection: CopilotStudioWebChatConnection
  store: ReturnType<typeof createStore>
}

export interface ChatProps {
  name: string
  getToken: () => Promise<string | undefined>
  onSessionLost: () => void
}

const CONNECTION_LOST = 'Zava Agent lost the connection, or your sign-in expired.'

export default function Chat({ name, getToken, onSessionLost }: ChatProps) {
  const [attempt, setAttempt] = useState(0)
  const [live, setLive] = useState<Live>()
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string>()

  useEffect(() => {
    let cancelled = false
    let connection: CopilotStudioWebChatConnection | undefined
    getToken().then(token => {
      if (cancelled) return
      if (!token) {
        onSessionLost()
        return
      }
      connection = openConnection(token, {
        onBusyChange: value => { if (!cancelled) setBusy(value) },
        onError: () => { if (!cancelled) setProblem(CONNECTION_LOST) },
      })
      const store = createStore({}, welcomeMiddleware(() => welcomeActivity({ name, now: new Date() })), starterPromptMiddleware())
      setLive({ connection, store })
    }, () => {
      if (!cancelled) setProblem('Zava Agent could not connect.')
    })
    return () => {
      cancelled = true
      connection?.end()
    }
  }, [attempt, getToken, name, onSessionLost])

  const restart = () => {
    setLive(undefined)
    setBusy(false)
    setProblem(undefined)
    setAttempt(value => value + 1)
  }

  return (
    <div className="chat">
      {problem && (
        <div className="notice notice--error chat__problem" role="alert">
          <p>{problem} Start a new chat to continue; the earlier conversation can&apos;t be resumed.</p>
          <button type="button" className="button button--primary" onClick={restart}>Start a new chat</button>
        </div>
      )}
      {live ? (
        <div className="chat__surface">
          <FluentThemeProvider variant="copilot">
            <Composer directLine={live.connection} store={live.store} disabled={busy || Boolean(problem)} styleOptions={styleOptions}>
              <BasicWebChat />
            </Composer>
          </FluentThemeProvider>
        </div>
      ) : !problem && (
        <p className="chat__loading" role="status">
          <span className="spinner" aria-hidden="true" />
          Connecting to Zava Agent…
        </p>
      )}
    </div>
  )
}
