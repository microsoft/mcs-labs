export interface ExpectedIdentity {
  tenantId: string
  objectId?: string
}

export type IdentityProblem = 'tenant' | 'user'

export const REFRESH_WINDOW_MS = 45 * 60_000

export function identityProblem(claims: Record<string, unknown> | undefined, expected: ExpectedIdentity): IdentityProblem | undefined {
  const tid = typeof claims?.tid === 'string' ? claims.tid.toLowerCase() : ''
  if (tid !== expected.tenantId.toLowerCase()) return 'tenant'
  if (expected.objectId) {
    const oid = typeof claims?.oid === 'string' ? claims.oid.toLowerCase() : ''
    if (oid !== expected.objectId.toLowerCase()) return 'user'
  }
  return undefined
}

// A conversation keeps its first token, so start each one with most of a token lifetime left.
export function needsRefresh(expiresOn: Date | null | undefined, now: Date, windowMs = REFRESH_WINDOW_MS): boolean {
  return !expiresOn || expiresOn.getTime() - now.getTime() < windowMs
}
