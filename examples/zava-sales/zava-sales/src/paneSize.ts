// Width of the Zava Agent pane. The CSS clamp in App.css enforces the same limits when the window resizes.
export const PANE_MIN_WIDTH = 320
export const CRM_MIN_WIDTH = 480
export const PANE_WIDTH_KEY = 'zava-copilot-pane-width'
export const PANE_WIDTH_VAR = '--pane-user-width'
const STEP = 16
const BIG_STEP = 64

export interface PaneLimits { min: number; max: number }

// space is the CRM column plus the pane: the pane may grow until the CRM is at its minimum width.
export function paneLimits(space: number): PaneLimits {
  return { min: PANE_MIN_WIDTH, max: Math.max(PANE_MIN_WIDTH, Math.floor(space - CRM_MIN_WIDTH)) }
}

export function clampPaneWidth(width: number, limits: PaneLimits): number {
  return Math.round(Math.min(limits.max, Math.max(limits.min, width)))
}

// Window-splitter keys: the divider moves left (pane grows) or right (pane shrinks); Home and End jump to the limits.
export function keyedPaneWidth(key: string, big: boolean, current: number, limits: PaneLimits): number | undefined {
  const step = big ? BIG_STEP : STEP
  if (key === 'ArrowLeft') return clampPaneWidth(current + step, limits)
  if (key === 'ArrowRight') return clampPaneWidth(current - step, limits)
  if (key === 'Home') return limits.min
  if (key === 'End') return limits.max
  return undefined
}

export function readPaneWidth(storage: Pick<Storage, 'getItem'> | undefined): number | undefined {
  try {
    const value = Number(storage?.getItem(PANE_WIDTH_KEY) ?? NaN)
    return Number.isInteger(value) && value >= PANE_MIN_WIDTH && value <= 4000 ? value : undefined
  } catch { return undefined }
}

// undefined returns the pane to its default width.
export function writePaneWidth(storage: Pick<Storage, 'setItem' | 'removeItem'> | undefined, width: number | undefined): void {
  try {
    if (width === undefined) storage?.removeItem(PANE_WIDTH_KEY)
    else storage?.setItem(PANE_WIDTH_KEY, String(Math.round(width)))
  } catch { /* Storage can be blocked; the width still applies for this visit. */ }
}

export function applyPaneWidth(target: { style: Pick<CSSStyleDeclaration, 'setProperty' | 'removeProperty'> } | null | undefined, width: number | undefined): void {
  if (!target) return
  if (width === undefined) target.style.removeProperty(PANE_WIDTH_VAR)
  else target.style.setProperty(PANE_WIDTH_VAR, `${Math.round(width)}px`)
}

export function localStore(): Storage | undefined {
  try { return window.localStorage } catch { return undefined }
}
