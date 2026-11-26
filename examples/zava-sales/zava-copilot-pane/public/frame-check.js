const embedded = window.top !== window.self
const ancestors = Array.from(window.location.ancestorOrigins ?? [])

document.getElementById('embedded').textContent = embedded ? 'Yes, inside another page' : 'No, opened directly'
document.getElementById('ancestors').textContent = embedded
  ? (ancestors.length ? ancestors.join(' → ') : 'Not reported by this browser')
  : 'None'
