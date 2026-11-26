import {
  BrowserAuthError, InteractionRequiredAuthError, createStandardPublicClientApplication,
  type AccountInfo, type AuthenticationResult, type IPublicClientApplication,
} from '@azure/msal-browser'
import { AGENT_SCOPE, AUTHORITY, REDIRECT_PATH, RELAY_PATH, TENANT_ID } from './config.ts'
import { identityProblem, needsRefresh, type IdentityProblem } from './identity.ts'

export interface AuthOptions {
  clientId: string
  embedded: boolean
  loginHint?: string
  objectId?: string
}

export interface Session {
  token: string
  name: string
  username: string
  expiresOn: Date | null
}

export class IdentityMismatchError extends Error {
  readonly problem: IdentityProblem
  constructor(problem: IdentityProblem) {
    super(problem === 'tenant' ? 'wrong tenant' : 'different user')
    this.name = 'IdentityMismatchError'
    this.problem = problem
  }
}

const scopes = [AGENT_SCOPE]

function needsInteraction(error: unknown): boolean {
  return error instanceof InteractionRequiredAuthError || error instanceof BrowserAuthError
}

export function describeAuthError(error: unknown): string {
  if (error instanceof IdentityMismatchError) {
    return error.problem === 'tenant'
      ? 'Sign in with your Zava training account to use Zava Agent.'
      : 'Sign in with the same account you use in Zava Sales Hub.'
  }
  const code = error instanceof BrowserAuthError ? error.errorCode : ''
  if (code === 'user_cancelled') return 'Sign-in was cancelled.'
  if (code === 'popup_window_error' || code === 'empty_window_error') {
    return 'Your browser blocked the sign-in window. Allow pop-ups for this page and try again.'
  }
  if (code === 'timed_out' || code === 'monitor_window_timeout') return 'Sign-in timed out. Try again.'
  return 'Sign-in did not complete. Try again.'
}

export async function createAuth(options: AuthOptions): Promise<PaneAuth> {
  const origin = window.location.origin
  const pca = await createStandardPublicClientApplication({
    auth: {
      clientId: options.clientId,
      authority: AUTHORITY,
      redirectUri: origin + REDIRECT_PATH,
      // Inside a cross-origin frame, sign-in popups go through a same-origin, top-level relay page.
      ...(options.embedded ? { popupRelayUri: origin + RELAY_PATH } : {}),
    },
    cache: { cacheLocation: 'sessionStorage' },
  })
  return new PaneAuth(pca, options)
}

export class PaneAuth {
  private readonly pca: IPublicClientApplication
  private readonly options: AuthOptions

  constructor(pca: IPublicClientApplication, options: AuthOptions) {
    this.pca = pca
    this.options = options
  }

  private matches(account: AccountInfo): boolean {
    return account.tenantId.toLowerCase() === TENANT_ID
      && (!this.options.objectId || account.localAccountId.toLowerCase() === this.options.objectId)
  }

  private account(): AccountInfo | undefined {
    const active = this.pca.getActiveAccount()
    return active && this.matches(active) ? active : this.pca.getAllAccounts().find(account => this.matches(account))
  }

  private accept(result: AuthenticationResult): Session {
    const problem = identityProblem(result.idTokenClaims as Record<string, unknown>, {
      tenantId: TENANT_ID, objectId: this.options.objectId,
    })
    if (problem) {
      void this.pca.clearCache({ account: result.account })
      throw new IdentityMismatchError(problem)
    }
    this.pca.setActiveAccount(result.account)
    return {
      token: result.accessToken,
      name: result.account.name || result.account.username,
      username: result.account.username,
      expiresOn: result.expiresOn,
    }
  }

  private async fresh(account: AccountInfo): Promise<Session> {
    let result = await this.pca.acquireTokenSilent({ scopes, account })
    if (needsRefresh(result.expiresOn, new Date())) {
      result = await this.pca.acquireTokenSilent({ scopes, account, forceRefresh: true })
    }
    return this.accept(result)
  }

  // Never shows UI: cached account first, then the host's login hint.
  async silent(): Promise<Session | undefined> {
    const account = this.account()
    if (account) {
      try {
        return await this.fresh(account)
      } catch (error) {
        if (!needsInteraction(error)) throw error
      }
    }
    if (!this.options.loginHint) return undefined
    try {
      return this.accept(await this.pca.ssoSilent({ scopes, loginHint: this.options.loginHint }))
    } catch (error) {
      if (error instanceof IdentityMismatchError || !needsInteraction(error)) throw error
      return undefined
    }
  }

  // Call directly from a click handler: MSAL opens its window before its first await.
  signIn(chooseAccount = false): Promise<Session> {
    const hint = chooseAccount ? undefined : this.options.loginHint
    return this.pca.acquireTokenPopup({
      scopes,
      ...(hint ? { loginHint: hint } : { prompt: 'select_account' }),
    }).then(result => this.accept(result))
  }

  async token(): Promise<string | undefined> {
    return (await this.silent())?.token
  }
}
