export interface StarterPrompt {
  title: string
  subtitle: string
  prompt: string
}

export const STARTER_PROMPTS: readonly StarterPrompt[] = [
  {
    title: 'Pipeline by stage',
    subtitle: 'Open deals by stage and forecast',
    prompt: 'Summarize the open pipeline by sales stage and forecast category, with total estimated revenue for each.',
  },
  {
    title: 'Hot leads',
    subtitle: 'Who to call first this week',
    prompt: 'Show my hot leads with a lead score above 70, newest first, and tell me who to call first.',
  },
  {
    title: 'Create a lead',
    subtitle: 'I will ask for the details',
    prompt: 'Help me create a new lead. Ask me for the details you need, then show me the record before you save it.',
  },
  {
    title: 'Deals at risk',
    subtitle: 'Slipping close dates and quiet deals',
    prompt: 'Which open deals have pushed their close date or had no activity in the last 30 days? Suggest a next step for each.',
  },
  {
    title: 'Move a deal forward',
    subtitle: 'Update a stage or next step',
    prompt: 'Help me update one of my open deals: ask which deal, then propose the new sales stage and next step for me to confirm.',
  },
  {
    title: 'Prep my next meeting',
    subtitle: 'Work IQ plus the CRM record',
    prompt: 'Prepare me for my next customer meeting using my calendar, recent emails and chats, and the account and deal records.',
  },
]

// Shown before sign-in: one each for pipeline, leads and creating a record.
export const INTRO_PROMPTS: readonly StarterPrompt[] = STARTER_PROMPTS.slice(0, 3)

export const WELCOME_ID = 'zava-welcome'

const ZAVA_MARK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14B8A6"/><stop offset="1" stop-color="#4F46E5"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g)"/><g fill="#FDE047"><rect x="8" y="19" width="10" height="3" rx="1.5"/><rect x="11" y="30.5" width="14" height="3" rx="1.5"/><rect x="8" y="42" width="10" height="3" rx="1.5"/></g><path d="M21 17H49V24L32 41H49V48H21V41L38 24H21Z" fill="#FFFFFF"/></svg>'

export const ZAVA_MARK_DATA_URL = `data:image/svg+xml,${encodeURIComponent(ZAVA_MARK_SVG)}`

export function firstName(name: string | undefined): string | undefined {
  const first = name?.trim().split(/\s+/)[0]
  return first && /^[\p{L}\p{M}'-]{1,40}$/u.test(first) ? first : undefined
}

export function welcomeText(name?: string): string {
  const greeting = firstName(name) ? `Hi ${firstName(name)}!` : 'Hi there!'
  return `${greeting} Ask me about your **pipeline**, **leads** and **accounts**, bring in context from your meetings, mail and chats with **Work IQ**, or have me **create and update CRM records**. I always show you the change and ask before I save anything.`
}

export function welcomeActivity(options: { name?: string; now: Date }) {
  return {
    type: 'message',
    id: WELCOME_ID,
    from: { id: 'agent', role: 'bot', name: 'Zava Agent' },
    timestamp: options.now.toISOString(),
    channelData: { 'webchat:sequence-id': -1 },
    text: '',
    entities: [{
      type: 'https://schema.org/Message',
      '@context': 'https://schema.org',
      '@id': '',
      '@type': 'Message',
      keywords: ['PreChatMessage'],
      name: 'Zava Agent',
      description: welcomeText(options.name),
      image: ZAVA_MARK_DATA_URL,
    }],
    suggestedActions: {
      to: [],
      actions: STARTER_PROMPTS.map(starter => ({
        type: 'messageBack',
        title: starter.title,
        text: starter.subtitle,
        displayText: starter.prompt,
        value: { starter: starter.title },
      })),
    },
  }
}

// A type alias (not an interface) so it fits redux's index-signature action type.
type IncomingActivityAction = {
  type: 'DIRECT_LINE/INCOMING_ACTIVITY'
  payload: { activity: object }
}

function isConnectFulfilled(action: unknown): boolean {
  return typeof action === 'object' && action !== null
    && (action as { type?: unknown }).type === 'DIRECT_LINE/CONNECT_FULFILLED'
}

// Redux middleware for WebChat's store: show the Zava welcome once the agent connection is up.
export function welcomeMiddleware(build: () => object) {
  let shown = false
  return ({ dispatch }: { dispatch: (action: IncomingActivityAction) => unknown }) =>
    (next: (action: unknown) => unknown) =>
      (action: unknown) => {
        const result = next(action)
        if (!shown && isConnectFulfilled(action)) {
          shown = true
          dispatch({ type: 'DIRECT_LINE/INCOMING_ACTIVITY', payload: { activity: build() } })
        }
        return result
      }
}

type SubmitSendBoxAction = {
  type: 'WEB_CHAT/SUBMIT_SEND_BOX'
  payload: { method: 'keyboard' }
}

function sendBoxText(action: unknown): string | undefined {
  if (typeof action !== 'object' || action === null) return undefined
  const { type, payload } = action as { type?: unknown; payload?: { text?: unknown } }
  return type === 'WEB_CHAT/SET_SEND_BOX' && typeof payload?.text === 'string' ? payload.text : undefined
}

// WebChat's Fluent starter cards only fill the send box; send a starter prompt as soon as it lands there.
export function starterPromptMiddleware(prompts: readonly StarterPrompt[] = STARTER_PROMPTS) {
  const texts = new Set(prompts.map(starter => starter.prompt))
  return ({ dispatch }: { dispatch: (action: SubmitSendBoxAction) => unknown }) =>
    (next: (action: unknown) => unknown) =>
      (action: unknown) => {
        const result = next(action)
        const text = sendBoxText(action)
        if (text !== undefined && texts.has(text)) dispatch({ type: 'WEB_CHAT/SUBMIT_SEND_BOX', payload: { method: 'keyboard' } })
        return result
      }
}
