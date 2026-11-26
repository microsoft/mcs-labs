import type { Activity } from '@microsoft/agents-activity'
import {
  AgentType, ConnectionSettings, CopilotStudioClient, CopilotStudioWebChat, PowerPlatformCloud,
  type CopilotStudioWebChatConnection, type StartRequest,
} from '@microsoft/agents-copilotstudio-client'
import { AGENT_SCHEMA, ENVIRONMENT_ID } from './config.ts'
import { wrapAgentActivityConnection } from './vendor/agentActivity.ts'

// Like the verified headless runner, start without the start-conversation event:
// no agent greeting turn before the user asks; the pane shows its own welcome.
class QuietStartClient extends CopilotStudioClient {
  override startConversationStreaming(request?: StartRequest | boolean): AsyncGenerator<Activity> {
    if (request === undefined || typeof request === 'boolean') return super.startConversationStreaming(request ?? false)
    return super.startConversationStreaming(request)
  }
}

export interface ConnectionCallbacks {
  onBusyChange: (busy: boolean) => void
  onError: (error: Error) => void
}

export function openConnection(token: string, callbacks: ConnectionCallbacks): CopilotStudioWebChatConnection {
  const settings = new ConnectionSettings({
    environmentId: ENVIRONMENT_ID,
    schemaName: AGENT_SCHEMA,
    cloud: PowerPlatformCloud.Prod,
    copilotAgentType: AgentType.Published,
    enableDiagnostics: false,
  })
  const client = new QuietStartClient(settings, token)
  return wrapAgentActivityConnection(
    CopilotStudioWebChat.createConnection(client, { showTyping: true }),
    { showReasoning: true, showToolCalls: true },
    callbacks,
  )
}
