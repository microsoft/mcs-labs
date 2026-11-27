import { runPopupRelay } from '@azure/msal-browser/popup-relay'
import { LOGIN_ORIGIN } from './config.ts'
import './pages.css'

const status = document.getElementById('status')
const button = document.getElementById('continue')

function show(text: string): void {
  if (status) status.textContent = text
}

const hasRequest = Boolean(new URLSearchParams(window.location.hash.slice(1)).get('req'))

if (!(button instanceof HTMLButtonElement) || !window.opener || !hasRequest) {
  show('This page only works as part of Zava Agent sign-in. You can close it.')
} else {
  // Opening the Microsoft sign-in window needs a click on this top-level page, or the browser blocks it.
  button.hidden = false
  button.addEventListener('click', () => {
    button.disabled = true
    try {
      runPopupRelay({ allowedAuthorityOrigins: [LOGIN_ORIGIN] })
      show('Finish signing in in the Microsoft window. This window closes by itself.')
    } catch {
      show('Sign-in could not start. Close this window and try again from Zava Agent.')
    }
  }, { once: true })
}
