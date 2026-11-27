import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge'
import './pages.css'

// Sign-in windows and silent frames land here; MSAL hands the response back to the pane, then closes this page.
broadcastResponseToMainFrame().catch(() => {
  const status = document.getElementById('status')
  if (status) status.textContent = 'Sign-in could not finish here. Close this window and try again from Zava Agent.'
})
