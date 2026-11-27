import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { connect, errorMessage, loadData, saveActivity } from './data'
import { CHOICE, dealTitle, emptyData, LEGACY_APP_URL, route } from './domain'
import type { Activity, ActivityKind, Identity, Lead, Page, SalesData } from './domain'
import { Activities, Accounts, Leads, Pipeline, RecordDetail, Today } from './views'
import type { ViewProps } from './views'
import { ActivityForm, LeadForm } from './forms'
import { CompanyLogo, Dialog, Empty, Icon, Mark, Portrait, Skeleton } from './ui'
import { CopilotPane } from './CopilotPane'
import { readPaneOpen, sessionStore, writePaneOpen } from './paneProtocol'
import { applyPaneWidth, localStore, readPaneWidth, writePaneWidth } from './paneSize'
import './App.css'

const navigation: { page: Page; label: string }[] = [
  { page: 'today', label: 'Today' }, { page: 'pipeline', label: 'Pipeline' },
  { page: 'leads', label: 'Leads' }, { page: 'accounts', label: 'Accounts' }, { page: 'activity', label: 'Activity' },
]
type Editor = { type: 'lead'; lead?: Lead } | { type: 'activity'; activity?: Activity; parent?: string; kind?: ActivityKind }
async function fetchWorkspace() {
  const identity = await connect()
  return { identity, data: await loadData() }
}
export default function App() {
  const [location, setLocation] = useState(() => route(window.location.hash))
  const [identity, setIdentity] = useState<Identity>()
  const [data, setData] = useState<SalesData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [fatal, setFatal] = useState('')
  const [executive, setExecutive] = useState('')
  const [editor, setEditor] = useState<Editor>()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<{ text: string; error?: boolean }>()
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const [completing, setCompleting] = useState<string>()
  const [paneOpen, setPaneOpen] = useState(() => readPaneOpen(sessionStore()))
  const [paneMounted, setPaneMounted] = useState(paneOpen)
  const [paneFocus, setPaneFocus] = useState(0)
  const [paneWidth, setPaneWidth] = useState(() => readPaneWidth(localStore()))
  const sequence = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const reload = useCallback(async () => {
    const request = ++sequence.current
    setLoading(true); setFatal('')
    try {
      const fresh = await fetchWorkspace()
      if (request === sequence.current) { setIdentity(fresh.identity); setData(fresh.data) }
    } catch (e) {
      if (request === sequence.current) { setData(emptyData); setIdentity(undefined); setFatal(errorMessage(e)) }
    } finally { if (request === sequence.current) setLoading(false) }
  }, [])
  useEffect(() => {
    let canceled = false
    void fetchWorkspace().then(fresh => {
      if (!canceled) { setIdentity(fresh.identity); setData(fresh.data) }
    }).catch(e => { if (!canceled) setFatal(errorMessage(e)) })
      .finally(() => { if (!canceled) setLoading(false) })
    return () => { canceled = true }
  }, [])
  useEffect(() => {
    const changed = () => { setLocation(route(window.location.hash)); setMenuOpen(false) }
    window.addEventListener('hashchange', changed)
    return () => window.removeEventListener('hashchange', changed)
  }, [])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (!editor) setSearchOpen(s => !s) } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editor])
  useEffect(() => {
    if (!toast || toast.error) return
    const id = window.setTimeout(() => setToast(undefined), 5000)
    return () => window.clearTimeout(id)
  }, [toast])
  const navigate = (page: Page, id?: string) => {
    window.location.hash = `/${page}${id ? `/${id}` : ''}`
    setSearchOpen(false); setMenuOpen(false)
    if (!id) { shellRef.current?.scrollTo(0, 0); mainRef.current?.focus({ preventScroll: true }) }
  }
  const newLead = () => { setSearchOpen(false); setEditor({ type: 'lead' }) }
  const log = (parent?: string, kind?: ActivityKind) => { setSearchOpen(false); setEditor({ type: 'activity', parent, kind }) }
  async function complete(activity: Activity) {
    if (completing) return
    setCompleting(activity.id)
    try { await saveActivity('task', { statecode: 1, statuscode: 5 }, activity); setToast({ text: 'Task completed.' }); await reload() }
    catch (e) { setToast({ text: errorMessage(e), error: true }) }
    finally { setCompleting(undefined) }
  }
  function saved(message: string) { setEditor(undefined); setToast({ text: message }); void reload() }
  const closePane = useCallback(() => {
    setPaneOpen(false); writePaneOpen(sessionStore(), false)
    requestAnimationFrame(() => launcherRef.current?.focus())
  }, [])
  function togglePane() {
    if (paneOpen) { closePane(); return }
    setPaneOpen(true); setPaneMounted(true); setPaneFocus(n => n + 1); writePaneOpen(sessionStore(), true)
  }
  // The pane width is a CSS variable on the shell, so dragging never re-renders the CRM.
  useLayoutEffect(() => applyPaneWidth(rootRef.current, paneWidth), [paneWidth])
  const resizePane = useCallback((width: number | undefined, done: boolean) => {
    applyPaneWidth(rootRef.current, width)
    if (done) { setPaneWidth(width); writePaneWidth(localStore(), width) }
  }, [])
  function toggleTheme() {
    const next = !dark
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    setDark(next)
    try { localStorage.setItem('zava-theme', next ? 'dark' : 'light') }
    catch (e) { console.warn('Theme preference could not be stored.', e); setToast({ text: 'Theme changed for this visit. Your browser blocked saving the preference.' }) }
  }
  const viewProps: ViewProps = {
    data, deals: data.deals.filter(d => !executive || d.executive === Number(executive)),
    name: identity?.name ?? '', executive, setExecutive, navigate, newLead, log,
    editLead: lead => setEditor({ type: 'lead', lead }),
    editActivity: activity => setEditor({ type: 'activity', activity }), complete, completing,
  }
  const { page, id } = location
  const record = id ? (page === 'leads' ? data.leads : page === 'pipeline' ? data.deals : page === 'accounts' ? data.accounts : []).find(r => r.id === id) : undefined
  const q = query.trim().toLowerCase()
  const results: { id: string; name: string; subtitle: string; search: string; page: Page; logo?: string }[] = [
    ...data.leads.map(r => ({ id: r.id, name: `${r.firstName} ${r.lastName}`.trim() || r.name, subtitle: `Lead · ${r.company}`, search: r.name, page: 'leads' as Page })),
    ...data.deals.map(r => ({ id: r.id, name: dealTitle(r).title, subtitle: `Deal · ${r.accountName}`, search: `${r.name} ${r.accountName}`, page: 'pipeline' as Page, logo: r.accountName || r.name })),
    ...data.accounts.map(r => ({ id: r.id, name: r.name, subtitle: `Account · ${r.segment || 'Customer'}`, search: r.name, page: 'accounts' as Page, logo: r.name })),
  ].filter(r => r.search.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)).slice(0, 15)
  const paneVisible = paneOpen && Boolean(identity)
  return <div ref={rootRef} className={`app-shell ${paneVisible ? 'has-pane' : ''}`}>
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); mainRef.current?.focus() }}>Skip to content</a>
    {menuOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <a className="brand" href="#/today"><Mark /><span>Zava<small>Sales Hub</small></span></a>
      <nav aria-label="Main navigation">{navigation.map(item => <a key={item.page} href={`#/${item.page}`} onClick={() => setMenuOpen(false)} className={page === item.page ? 'active' : ''} aria-current={page === item.page ? 'page' : undefined}><Icon name={item.page} /><span>{item.label}</span>{item.page === 'leads' && identity && data.leads.some(l => l.status === CHOICE) && <small>{data.leads.filter(l => l.status === CHOICE).length}</small>}</a>)}</nav>
      <div className="sidebar-bottom"><div className="profile"><Portrait name={identity?.name || 'Zava'} size="sm" /><span><strong>{identity?.name || 'Zava Sales'}</strong><small>{identity ? 'Signed in to Dataverse' : 'Connecting'}</small></span><button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}><Icon name={dark ? 'sun' : 'moon'} size={18} /></button></div></div>
    </aside>
    <div ref={shellRef} className="main-shell">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(s => !s)}><Icon name="menu" /></button><button className="global-search" onClick={() => { setQuery(''); setSearchOpen(true) }} disabled={!identity}><Icon name="search" size={18} /><span>Search leads, deals, accounts</span><kbd>Ctrl K</kbd></button><div className="topbar-actions"><button className={`icon-button ${loading ? 'spinning' : ''}`} onClick={() => void reload()} disabled={loading} aria-label="Refresh CRM data"><Icon name="refresh" size={18} /></button><div className="crm-status"><span className={`live-indicator ${fatal ? 'off' : data.issues.length ? 'partial' : ''}`}><span className="status-dot" />{loading ? 'Syncing' : fatal ? 'Disconnected' : data.issues.length ? 'Partial data' : 'Live CRM'}</span><a className="legacy-link" href={LEGACY_APP_URL} target="_blank" rel="noopener noreferrer" title="Opens the model-driven app on the same Dataverse data in a new tab"><span>Open Zava Sales Hub</span><span className="legacy-tag">Legacy</span><Icon name="external" size={13} /></a></div><button ref={launcherRef} className={`copilot-launcher ${paneVisible ? 'active' : ''}`} onClick={togglePane} disabled={!identity} aria-expanded={paneVisible} aria-controls="copilot-pane" aria-label="Ask Zava Agent" title={paneVisible ? 'Close Zava Agent' : 'Ask Zava Agent about your pipeline, leads and next steps'}><Icon name="sparkle" size={18} /><span className="launcher-label">Ask Zava Agent</span></button></div></header>
      <main ref={mainRef} id="main" tabIndex={-1}>
        {fatal ? <div className="connection-error"><Empty title="Couldn’t connect to Dataverse" icon="lock" action={<button className="button primary" onClick={() => void reload()}>Try again<Icon name="refresh" size={17} /></button>}>{fatal}</Empty></div> : loading ? <Skeleton /> : <>
          {data.issues.length > 0 && <details className="data-issues" open><summary>Some CRM data couldn’t be loaded ({data.issues.length})</summary>{data.issues.map(i => <p key={i.resource}><strong>{i.resource}:</strong> {i.message}</p>)}<button className="text-button" onClick={() => void reload()}>Retry loading<Icon name="refresh" size={15} /></button></details>}
          {page === 'today' && <Today {...viewProps} />}
          {page === 'pipeline' && <Pipeline {...viewProps} />}
          {page === 'leads' && <Leads {...viewProps} />}
          {page === 'accounts' && <Accounts {...viewProps} />}
          {page === 'activity' && <Activities {...viewProps} />}
        </>}
      </main>
    </div>
    {identity && paneMounted && <CopilotPane key={identity.objectId} open={paneVisible} objectId={identity.objectId} loginHint={identity.upn} theme={dark ? 'dark' : 'light'} focusRequest={paneFocus} onClose={closePane} crm={shellRef} width={paneWidth} onResize={resizePane} />}
    {record && !editor && !searchOpen && !loading && <RecordDetail key={`${page}:${id}`} {...viewProps} record={record} kind={page === 'leads' ? 'lead' : page === 'pipeline' ? 'deal' : 'account'} onClose={() => navigate(page)} />}
    {id && !record && !loading && !fatal && !editor && <Dialog title="Record unavailable" onClose={() => navigate(page)}><Empty title="This record isn’t available" icon="lock">It may have been deleted or reassigned, or you may not have permission to see it.</Empty><button className="button secondary" onClick={() => navigate(page)}>Back</button></Dialog>}
    {editor?.type === 'lead' && <LeadForm data={data} lead={editor.lead} onClose={() => setEditor(undefined)} onSaved={saved} />}
    {editor?.type === 'activity' && <ActivityForm data={data} activity={editor.activity} parent={editor.parent} kind={editor.kind} onClose={() => setEditor(undefined)} onSaved={saved} />}
    {searchOpen && <Dialog title="Search" onClose={() => setSearchOpen(false)} wide><label className="command-input"><Icon name="search" /><input autoFocus aria-label="Search CRM" placeholder="Leads, deals, accounts…" value={query} onChange={e => setQuery(e.target.value)} /></label><div className="command-actions"><button onClick={newLead}><Icon name="plus" size={18} />New lead</button><button onClick={() => log()}><Icon name="activity" size={18} />Log activity</button></div><div className="command-results">{results.map(r => <button key={`${r.page}:${r.id}`} onClick={() => navigate(r.page, r.id)}>{r.logo ? <CompanyLogo name={r.logo} size="sm" /> : <Portrait name={r.name} size="sm" />}<span><strong>{r.name}</strong><small>{r.subtitle}</small></span><Icon name="arrow" size={15} /></button>)}{!results.length && <Empty title="No matches" icon="search">Try a company or person’s name.</Empty>}</div><p className="command-hint">Only records your account can see · Enter to open · Esc to close</p></Dialog>}
    {toast && <div className={`toast ${toast.error ? 'error' : ''}`} role={toast.error ? 'alert' : 'status'}><Icon name={toast.error ? 'info' : 'check'} size={20} /><span>{toast.text}</span><button className="icon-button" aria-label="Dismiss notification" onClick={() => setToast(undefined)}><Icon name="close" size={16} /></button></div>}
  </div>
}
