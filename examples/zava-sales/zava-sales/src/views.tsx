import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { activityTitle, attention, CHOICE, choices, dateLabel, dateOnly, dealCategory, dealTitle, dimensions, greeting, isPendingActivity, label, money, monthlyOutlook, niceScale, pipelineMetrics, safeWebsite, sellerTimeline, weightedValue } from './domain'
import type { Account, Activity, ActivityKind, Deal, Dimension, Lead, OutlookBucket, Page, RecordKind, SalesData, TimelineItem } from './domain'
import { CompanyLogo, Dialog, Empty, Icon, Pill, Portrait, Score, SectionTitle } from './ui'

export interface ViewProps {
  data: SalesData; deals: Deal[]; name: string
  executive: string; setExecutive: (value: string) => void
  navigate: (page: Page, id?: string) => void
  newLead: () => void
  editLead: (lead: Lead) => void
  log: (parent?: string, kind?: ActivityKind) => void
  editActivity: (activity: Activity) => void
  complete: (activity: Activity) => void
  completing?: string
}
const matches = (search: string, ...values: string[]) => values.join(' ').toLowerCase().includes(search.toLowerCase().trim())
const isActiveLead = (lead: Lead) => lead.status !== CHOICE + 3 && lead.status !== CHOICE + 4
const personName = (lead: Lead) => `${lead.firstName} ${lead.lastName}`.trim() || lead.name
const stageKeys = ['qualify', 'develop', 'propose', 'close']
const seriesColor = (dimension: Dimension, category: string, index: number) =>
  category === 'Not set' ? 'var(--cp-series-none)' : dimension === 'stage' ? `var(--cp-stage-${stageKeys[index] ?? 'close'})` : `var(--cp-series-${index % 6 + 1})`
const statusTone = (status: number | null) => status === CHOICE + 3 ? 'success' : status === CHOICE + 4 ? '' : status === CHOICE ? 'accent' : ''

function Unavailable({ resource, data }: { resource: string; data: SalesData }) {
  const issue = data.issues.find(i => i.resource === resource)
  return issue ? <Empty icon="lock" title={`${resource} isn't available`}>{issue.message}</Empty> : null
}
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = money(value); return }
    node.textContent = money(0)
    let frame = 0
    let start = 0
    const tick = (time: number) => {
      start ||= time
      const progress = Math.min(1, (time - start) / 900)
      node.textContent = money(value * (1 - (1 - progress) ** 3))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <><span ref={ref} aria-hidden="true" /><span className="sr-only">{money(value)}</span></>
}
export function SellerSelect({ executive, setExecutive }: Pick<ViewProps, 'executive' | 'setExecutive'>) {
  return <label className="seller-select">
    {executive ? <Portrait name={label(choices.executive, Number(executive))} size="xs" /> : <Icon name="leads" size={18} />}
    <span className="sr-only">Show deals for</span>
    <select value={executive} onChange={e => setExecutive(e.target.value)}>
      <option value="">All sellers</option>
      {choices.executive.map((seller, i) => <option key={seller} value={String(CHOICE + i)}>{seller}</option>)}
    </select>
    <Icon name="chevron" size={14} />
  </label>
}
function LeadRow({ lead, open, detailed = false }: { lead: Lead; open: () => void; detailed?: boolean }) {
  const person = personName(lead)
  return <button className="row lead-row" onClick={open}>
    <Portrait name={person} size="sm" />
    <span className="record-copy"><strong>{person}</strong><span>{[lead.job, lead.company].filter(Boolean).join(' · ')}</span></span>
    {detailed && <span className="row-topic">{lead.topic}</span>}
    <Pill tone={statusTone(lead.status)}>{label(choices.status, lead.status)}</Pill>
    <Score score={lead.score} />
  </button>
}
export function DealCard({ deal, open }: { deal: Deal; open: () => void }) {
  const warning = attention(deal)[0]
  const seller = label(choices.executive, deal.executive)
  const amount = deal.status === CHOICE + 1 && deal.actualValue ? deal.actualValue : deal.value
  return <button className="deal-card" onClick={open}>
    <span className="deal-account"><CompanyLogo name={deal.accountName || deal.name} size="sm" /><span>{deal.accountName || 'No account linked'}</span></span>
    <strong className="deal-title">{dealTitle(deal).title}</strong>
    <span className="deal-numbers"><b>{money(amount)}</b><span>{deal.probability}%</span></span>
    <span className="progress" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, deal.probability))}%` }} /></span>
    <span className="deal-foot"><span><Icon name="clock" size={14} />{dateLabel(deal.closeDate)}</span><span className="deal-seller" title={seller}><Portrait name={seller} size="xs" />{seller.split(' ')[0]}</span></span>
    {warning && <span className="quiet-alert"><span className="alert-dot" />{warning}</span>}
  </button>
}
export function ActivityList({ activities, editActivity, complete, completing, navigate }: Pick<ViewProps, 'editActivity' | 'complete' | 'completing' | 'navigate'> & { activities: Activity[] }) {
  const now = new Date()
  return <ul className="activity-list">{activities.map(a => {
    const late = a.kind === 'task' && a.state === 0 && !!a.end && new Date(a.end) < now
    const kind = a.kind === 'appointment' ? (a.meetingType ? label(choices.meeting, a.meetingType) : 'Meeting') : a.kind === 'note' ? 'Note' : 'Task'
    return <li key={`${a.kind}:${a.id}`} className={`activity-row ${a.state === 1 ? 'completed' : ''}`}>
      {a.kind === 'task' && a.state === 0
        ? <button className={`task-check ${completing === a.id ? 'spinning' : ''}`} disabled={completing === a.id} title="Complete task" aria-label={`Complete ${a.name}`} onClick={() => complete(a)}>{completing === a.id && <Icon name="refresh" size={14} />}</button>
        : <span className={`activity-icon ${a.kind}`}><Icon name={a.state === 1 ? 'check' : a.kind === 'appointment' ? 'activity' : a.kind} size={18} /></span>}
      <div className="activity-body">
        <button className="activity-name" onClick={() => editActivity(a)}>{activityTitle(a.name)}</button>
        <div className="activity-meta"><span>{kind}{a.state === 1 ? ' · Completed' : a.state === 2 ? ' · Canceled' : ''}</span>{a.parentKind && <button className="text-button" onClick={() => navigate(a.parentKind === 'lead' ? 'leads' : 'pipeline', a.parentId)}>{a.parentName || 'Related record'}</button>}</div>
        {a.description && <p className="activity-description">{a.description}</p>}
      </div>
      <span className={`activity-time ${late ? 'late' : ''}`}>{late && 'Overdue · '}{a.kind === 'note' ? dateLabel(a.created) : dateLabel(a.kind === 'appointment' ? a.start : a.end, true)}</span>
    </li>
  })}</ul>
}

function Pulse({ data, deals, navigate }: Pick<ViewProps, 'data' | 'deals' | 'navigate'>) {
  const metrics = pipelineMetrics(deals)
  const stages = choices.stage.map((stage, i) => {
    const group = metrics.open.filter(d => d.stage === CHOICE + i)
    return { stage, count: group.length, value: group.reduce((sum, d) => sum + d.value, 0) }
  })
  const max = Math.max(1, ...stages.map(s => s.value))
  const blocked = data.issues.some(i => i.resource === 'Pipeline')
  return <section className="panel pulse" aria-label="Pipeline pulse">
    <SectionTitle title="Pipeline pulse" subtitle="Open deals · USD" />
    {blocked ? <Unavailable resource="Pipeline" data={data} /> : <>
      <div className="pulse-total"><CountUp value={metrics.total} /><span>{metrics.open.length} open deals · {money(metrics.weighted)} weighted</span></div>
      <div className="stage-bars">{stages.map((s, i) => <div key={s.stage} className={`stage-bar stage-${i}`}>
        <span className="stage-name"><span className="stage-dot" />{s.stage}<small>{s.count}</small></span>
        <strong>{money(s.value)}</strong>
        <span className="bar-track"><span style={{ width: `${s.value / max * 100}%`, animationDelay: `${i * 70}ms` }} /></span>
      </div>)}</div>
    </>}
    <button className="text-button pulse-link" onClick={() => navigate('pipeline')}>Explore the pipeline<Icon name="arrow" size={16} /></button>
  </section>
}
function bucketTitle(bucket: OutlookBucket) {
  if (bucket.key === 'overdue') return 'Overdue'
  if (bucket.key === 'later') return 'Later'
  const [year, month] = bucket.key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
function Outlook({ data, deals, navigate }: Pick<ViewProps, 'data' | 'deals' | 'navigate'>) {
  const [dimension, setDimension] = useState<Dimension>('stage')
  const [weighted, setWeighted] = useState(false)
  const [picked, setPicked] = useState('')
  const outlook = monthlyOutlook(deals, dimension, { weighted })
  const plotted = outlook.buckets.filter(b => b.key !== 'later')
  const later = outlook.buckets.find(b => b.key === 'later')
  const scale = niceScale(Math.max(0, ...plotted.map(b => b.total)))
  const selected = outlook.buckets.find(b => b.key === picked) ?? plotted.find(b => b.key !== 'overdue' && b.deals.length) ?? plotted.find(b => b.deals.length) ?? later
  const used = outlook.categories.map((category, i) => ({ category, i, total: outlook.buckets.reduce((sum, b) => sum + b.segments[i], 0) })).filter(x => x.total > 0)
  const color = (category: string) => seriesColor(dimension, category, outlook.categories.indexOf(category))
  const firstMonth = plotted.findIndex(b => /^\d{4}-\d{2}$/.test(b.key))
  const blocked = data.issues.some(i => i.resource === 'Pipeline')
  return <section className="panel outlook" aria-label="What's coming">
    <SectionTitle title="What’s coming" subtitle={`Open deals by expected close month · ${money(outlook.total)} ${weighted ? 'weighted' : 'total'}`} action={<div className="segmented compact" role="group" aria-label="Value shown">
      <button className={!weighted ? 'active' : ''} aria-pressed={!weighted} onClick={() => setWeighted(false)}>Total</button>
      <button className={weighted ? 'active' : ''} aria-pressed={weighted} onClick={() => setWeighted(true)}>Weighted</button>
    </div>} />
    <div className="chip-row" role="group" aria-label="Break down by"><span>By</span>{dimensions.map(d => <button key={d.id} className={`chip ${dimension === d.id ? 'active' : ''}`} aria-pressed={dimension === d.id} onClick={() => setDimension(d.id)}>{d.label}</button>)}</div>
    {blocked ? <Unavailable resource="Pipeline" data={data} /> : !outlook.total ? <Empty icon="pipeline" title="No open deals with a close date">Deals appear here by the month they are expected to close.</Empty> : <>
      <div className="chart-scroll"><div className="chart" style={{ '--columns': plotted.length } as CSSProperties}>
        <div className="chart-plot" aria-hidden="true">{scale.ticks.map(t => <span key={t} className="gridline" style={{ bottom: `${t / scale.top * 100}%` }}><small>{money(t)}</small></span>)}</div>
        <div className="chart-columns">{plotted.map((b, bi) => {
          const showYear = bi === firstMonth || (b.label === 'Jan' && /^\d{4}-\d{2}$/.test(b.key))
          return <button key={b.key} className={`chart-column ${selected?.key === b.key ? 'selected' : ''} ${b.key}`} aria-pressed={selected?.key === b.key} aria-label={`${bucketTitle(b)}: ${money(b.total)} from ${b.deals.length} ${b.deals.length === 1 ? 'deal' : 'deals'}`} onClick={() => setPicked(b.key)}>
            <span className="column-bar"><span className="column-stack" style={{ height: `${b.total / scale.top * 100}%`, animationDelay: `${bi * 35}ms` }}>
              {b.total > 0 && <span className="column-value">{money(b.total)}</span>}
              {b.segments.map((value, i) => value > 0 && <span key={outlook.categories[i]} style={{ flexGrow: value, background: color(outlook.categories[i]) }} />)}
            </span></span>
            <span className="column-label">{b.label}{showYear && <small>{b.year}</small>}</span>
          </button>
        })}</div>
      </div></div>
      <div className="chart-foot">
        <ul className="legend">{used.map(({ category }) => <li key={category}><i style={{ background: color(category) }} />{category}</li>)}</ul>
        {later && later.deals.length > 0 && <button className={`later-link ${selected?.key === 'later' ? 'active' : ''}`} aria-pressed={selected?.key === 'later'} onClick={() => setPicked('later')}>Later · {money(later.total)} · {later.deals.length} {later.deals.length === 1 ? 'deal' : 'deals'}</button>}
      </div>
      {selected && <div className="outlook-detail">
        <div className="outlook-detail-head"><h3>{bucketTitle(selected)}</h3><span>{money(selected.total)} · {selected.deals.length} {selected.deals.length === 1 ? 'deal' : 'deals'}{selected.key === 'overdue' && ' · close date passed'}</span></div>
        {selected.deals.length ? <ul className="row-list">{selected.deals.slice(0, 4).map(d => <li key={d.id}><button className="row" onClick={() => navigate('pipeline', d.id)}>
          <CompanyLogo name={d.accountName || d.name} size="sm" />
          <span className="record-copy"><strong>{d.accountName || 'No account linked'}</strong><span>{dealTitle(d).title}</span></span>
          <span className="swatch-label"><i style={{ background: color(dealCategory(d, dimension)) }} />{dealCategory(d, dimension)}</span>
          <span className="row-value"><strong>{money(weighted ? weightedValue(d) : d.value)}</strong><small>{dateLabel(d.closeDate)}</small></span>
        </button></li>)}</ul> : <p className="muted-copy">Nothing expected to close in this period.</p>}
        {selected.deals.length > 4 && <button className="text-button" onClick={() => navigate('pipeline')}>{selected.deals.length - 4} more on the board<Icon name="arrow" size={16} /></button>}
      </div>}
    </>}
  </section>
}
const kindLabels = { appointment: 'Meeting', task: 'Task', close: 'Expected close' } as const
function itemWhen(item: TimelineItem) {
  const date = new Date(item.when)
  const day = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
  return item.kind === 'appointment' ? `${day} · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : day
}
function SellerTimeline({ data, deals, executive, navigate, editActivity }: ViewProps) {
  const [expanded, setExpanded] = useState<string[]>([])
  const { weeks, overdue } = sellerTimeline(data.activities, deals, { dealIds: executive ? new Set(deals.map(d => d.id)) : undefined })
  const open = (item: TimelineItem) => {
    if (item.parentKind && item.parentId) navigate(item.parentKind === 'lead' ? 'leads' : 'pipeline', item.parentId)
    else if (item.activity) editActivity(item.activity)
  }
  return <section className="panel" aria-label="Timeline">
    <SectionTitle title="Timeline" subtitle="Meetings, tasks and expected closes for the next four weeks" action={<div className="title-actions">
      {overdue > 0 && <button className="text-button alert-link" onClick={() => navigate('activity')}><span className="alert-dot" />{overdue} overdue {overdue === 1 ? 'task' : 'tasks'}</button>}
      <button className="text-button" onClick={() => navigate('activity')}>All activity<Icon name="arrow" size={16} /></button>
    </div>} />
    <ul className="legend timeline-key">{(['appointment', 'task', 'close'] as const).map(kind => <li key={kind} className={kind}><i />{kindLabels[kind]}</li>)}</ul>
    <ol className="timeline">{weeks.map(week => {
      const all = expanded.includes(week.start)
      const shown = all ? week.items : week.items.slice(0, 5)
      return <li key={week.start} className="week">
        <div className="week-head"><strong>{week.label}</strong>{week.label !== week.range && <span>{week.range}</span>}<span className="count">{week.items.length}</span></div>
        {week.items.length ? <ul className="week-items">{shown.map(item => {
          const deal = item.deal ?? (item.parentKind === 'deal' ? deals.find(d => d.id === item.parentId) : undefined)
          const account = deal?.accountName ?? ''
          const title = item.kind === 'close' ? item.title : activityTitle(item.title, account)
          const parent = item.kind === 'close' && deal ? [money(deal.value), account].filter(Boolean).join(' · ') : account || item.parentName
          return <li key={item.key}><button className={`tl-item ${item.kind} ${item.late ? 'late' : ''}`} onClick={() => open(item)}>
            <span className="tl-when"><Icon name={item.kind === 'appointment' ? 'activity' : item.kind === 'task' ? 'task' : 'flag'} size={14} />{itemWhen(item)}{item.late && ' · late'}</span>
            <span className="tl-title">{title}</span>
            {parent && <span className="tl-parent">{parent}</span>}
          </button></li>
        })}</ul> : <p className="week-empty">Nothing planned</p>}
        {week.items.length > 5 && <button className="text-button" onClick={() => setExpanded(e => all ? e.filter(x => x !== week.start) : [...e, week.start])}>{all ? 'Show less' : `${week.items.length - 5} more`}</button>}
      </li>
    })}</ol>
  </section>
}
export function Today(props: ViewProps) {
  const { data, deals, name, navigate, newLead, log } = props
  const now = new Date()
  const metrics = pipelineMetrics(deals)
  const blocked = data.issues.some(i => i.resource === 'Pipeline')
  const leadsBlocked = data.issues.some(i => i.resource === 'Leads')
  const flagged = metrics.open.map(deal => ({ deal, reasons: attention(deal, now) })).filter(x => x.reasons.length).sort((a, b) => b.reasons.length - a.reasons.length || b.deal.value - a.deal.value)
  const hot = data.leads.filter(isActiveLead).sort((a, b) => (b.score ?? -1) - (a.score ?? -1)).slice(0, 5)
  const first = name.split(' ')[0]
  return <>
    <header className="page-head">
      <div><h1>{greeting(now)}{first ? `, ${first}` : ''}</h1><p>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p></div>
      <div className="head-actions"><SellerSelect {...props} /><button className="button primary" onClick={newLead}><Icon name="plus" size={18} />New lead</button></div>
    </header>
    <div className="hero-grid">
      <section className="hero" aria-label="Welcome">
        <div className="hero-content">
          <h2>Less admin.<br />More <em>possibility.</em></h2>
          <p>The right people. The next move.<br />A little more room to do what you do best.</p>
          <button className="button hero-button" onClick={() => log()}><Icon name="plus" size={17} />Capture a conversation<Icon name="arrow" size={18} /></button>
        </div>
        <div className="track-art" aria-hidden="true">
          <span className="track-ring" /><span className="track-ring r2" /><span className="track-ring r3" /><span className="track-ring r4" /><span className="track-ring r5" />
          <span className="track-label">MAKE YOUR<br />NEXT MOVE.</span><span className="track-spark">↗</span>
        </div>
      </section>
      <Pulse {...props} />
    </div>
    <Outlook {...props} />
    <SellerTimeline {...props} />
    <div className="split">
      <section className="panel" aria-label="Needs attention">
        <SectionTitle title="Needs attention" subtitle="Open deals that look stalled" action={<button className="text-button" onClick={() => navigate('pipeline')}>Pipeline<Icon name="arrow" size={16} /></button>} />
        {blocked ? <Unavailable resource="Pipeline" data={data} /> : flagged.length ? <ul className="row-list">{flagged.slice(0, 5).map(({ deal, reasons }) => <li key={deal.id}><button className="row" onClick={() => navigate('pipeline', deal.id)}>
          <CompanyLogo name={deal.accountName || deal.name} />
          <span className="record-copy"><strong>{deal.accountName || 'No account linked'}</strong><span>{dealTitle(deal).title}</span><span className="quiet-alert"><span className="alert-dot" />{reasons[0]}{reasons.length > 1 && ` +${reasons.length - 1}`}</span></span>
          <span className="row-value"><strong>{money(deal.value)}</strong><small>{label(choices.stage, deal.stage)}</small></span>
        </button></li>)}</ul> : <Empty title="Nothing looks stalled" icon="check">No open deals have a passed or pushed close date, or two quiet weeks.</Empty>}
      </section>
      <section className="panel" aria-label="Hot leads">
        <SectionTitle title="Hot leads" subtitle="Active leads, highest score first" action={<button className="text-button" onClick={() => navigate('leads')}>Leads<Icon name="arrow" size={16} /></button>} />
        {leadsBlocked ? <Unavailable resource="Leads" data={data} /> : hot.length ? <ul className="row-list">{hot.map(lead => <li key={lead.id}><LeadRow lead={lead} open={() => navigate('leads', lead.id)} /></li>)}</ul> : <Empty title="No leads yet" icon="leads" action={<button className="button primary" onClick={newLead}><Icon name="plus" size={18} />Create a lead</button>}>Leads you have access to in Dataverse, including shared leads, show up here.</Empty>}
      </section>
    </div>
  </>
}
export function Pipeline(props: ViewProps) {
  const { data, deals, navigate } = props
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(CHOICE)
  const metrics = pipelineMetrics(deals)
  const visible = deals.filter(d => d.status === status && matches(query, d.name, d.accountName, d.product))
  const unassigned = visible.some(d => d.stage === null || !choices.stage[d.stage - CHOICE])
  return <>
    <header className="page-head">
      <div><h1>Pipeline</h1><p>{metrics.open.length} open deals · {money(metrics.total)} total · {money(metrics.weighted)} weighted</p></div>
      <div className="head-actions"><span className="readonly"><Icon name="lock" size={15} />Read-only</span><SellerSelect {...props} /></div>
    </header>
    <div className="toolbar">
      <div className="tabs" role="group" aria-label="Deal status">{['Open', 'Won', 'Lost'].map((s, i) => <button key={s} onClick={() => setStatus(CHOICE + i)} aria-pressed={status === CHOICE + i} className={status === CHOICE + i ? 'active' : ''}>{s}<span>{deals.filter(d => d.status === CHOICE + i).length}</span></button>)}</div>
      <label className="search-field"><Icon name="search" size={18} /><input aria-label="Filter deals" placeholder="Company or product" value={query} onChange={e => setQuery(e.target.value)} /></label>
    </div>
    {data.issues.some(i => i.resource === 'Pipeline') ? <Unavailable resource="Pipeline" data={data} /> : visible.length === 0 ? <Empty title="No deals here" icon="pipeline">Try another seller, status or search.</Empty> : status === CHOICE ? <div className="board">{[...choices.stage, ...(unassigned ? ['No stage'] : [])].map((stage, i) => {
      const group = visible.filter(d => i < 4 ? d.stage === CHOICE + i : d.stage === null || !choices.stage[d.stage - CHOICE])
      return <section className={`board-column stage-${i}`} key={stage} aria-label={stage}>
        <header className="column-head"><div><span className="stage-dot" /><h2>{stage}</h2><span className="count">{group.length}</span></div><p><strong>{money(group.reduce((sum, d) => sum + d.value, 0))}</strong> · {money(group.reduce((sum, d) => sum + weightedValue(d), 0))} weighted</p></header>
        <div className="column-cards">{group.map(d => <DealCard key={d.id} deal={d} open={() => navigate('pipeline', d.id)} />)}{!group.length && <p className="lane-empty">No deals</p>}</div>
      </section>
    })}</div> : <div className="deal-grid">{visible.map(d => <DealCard key={d.id} deal={d} open={() => navigate('pipeline', d.id)} />)}</div>}
  </>
}
export function Leads({ data, navigate, newLead }: ViewProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('active')
  const active = data.leads.filter(isActiveLead)
  const filters: [string, string, number][] = [['active', 'Active', active.length], ...choices.status.map((s, i): [string, string, number] => [String(CHOICE + i), s, data.leads.filter(l => l.status === CHOICE + i).length]), ['all', 'All', data.leads.length]]
  const visible = data.leads.filter(l => matches(query, l.name, l.company, l.email, l.topic) && (filter === 'all' || (filter === 'active' ? isActiveLead(l) : l.status === Number(filter)))).sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
  const blocked = data.issues.some(i => i.resource === 'Leads')
  return <>
    <header className="page-head">
      <div><h1>Leads</h1><p>{active.length} active · includes leads shared with you</p></div>
      <button className="button primary" onClick={newLead}><Icon name="plus" size={18} />New lead</button>
    </header>
    <div className="toolbar">
      <div className="tabs scrollable" role="group" aria-label="Lead status">{filters.map(([value, name, count]) => <button key={value} className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{name}<span>{count}</span></button>)}</div>
      <label className="search-field"><Icon name="search" size={18} /><input aria-label="Search leads" placeholder="Person, company or topic" value={query} onChange={e => setQuery(e.target.value)} /></label>
    </div>
    <section className="panel flush">{blocked ? <Unavailable resource="Leads" data={data} /> : visible.length ? <ul className="row-list">{visible.map(l => <li key={l.id}><LeadRow lead={l} detailed open={() => navigate('leads', l.id)} /></li>)}</ul> : <Empty icon="leads" title={data.leads.length ? 'No leads match' : 'No leads yet'} action={<button className="button primary" onClick={newLead}><Icon name="plus" size={18} />Create a lead</button>}>{data.leads.length ? 'Try another status or search.' : 'Leads you have access to in Dataverse, including shared leads, show up here.'}</Empty>}</section>
  </>
}
export function Accounts({ data, navigate }: ViewProps) {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('')
  const accounts = data.accounts.filter(a => matches(query, a.name, a.segment) && (!region || a.region === region))
  return <>
    <header className="page-head">
      <div><h1>Accounts</h1><p>{data.accounts.length} customers · contacts and open deals</p></div>
      <span className="readonly"><Icon name="lock" size={15} />Read-only</span>
    </header>
    <div className="toolbar">
      <label className="search-field"><Icon name="search" size={18} /><input aria-label="Search accounts" placeholder="Company or segment" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <select aria-label="Filter by sales region" value={region} onChange={e => setRegion(e.target.value)}><option value="">All regions</option>{[...new Set(data.accounts.map(a => a.region).filter(Boolean))].sort().map(r => <option key={r}>{r}</option>)}</select>
    </div>
    {data.issues.some(i => i.resource === 'Accounts') ? <Unavailable resource="Accounts" data={data} /> : accounts.length ? <div className="account-grid">{accounts.map(a => {
      const open = data.deals.filter(d => d.accountId === a.id && d.status === CHOICE)
      const contacts = data.contacts.filter(c => c.accountId === a.id)
      const seller = label(choices.executive, a.executive)
      return <button className="account-card" key={a.id} onClick={() => navigate('accounts', a.id)}>
        <span className="account-top"><CompanyLogo name={a.name} size="lg" />{a.tier && <Pill tone={a.tier === 'Strategic' ? 'accent' : ''}>{a.tier}</Pill>}</span>
        <strong className="account-name">{a.name}</strong>
        <span className="account-meta">{[a.segment, a.region].filter(Boolean).join(' · ') || 'Segment not set'}</span>
        <span className="account-stats"><span><b>{money(open.reduce((sum, d) => sum + d.value, 0))}</b><small>{open.length} open {open.length === 1 ? 'deal' : 'deals'}</small></span><span className="face-stack" title={contacts.map(c => c.name).join(', ')}>{contacts.slice(0, 4).map(c => <Portrait key={c.id} name={c.name} size="xs" />)}<small>{contacts.length} contacts</small></span></span>
        <span className="account-owner"><Portrait name={seller} size="xs" />{seller}</span>
      </button>
    })}</div> : <Empty title="No accounts match" icon="accounts">Try another search or region.</Empty>}
  </>
}
export function Activities(props: ViewProps) {
  const { data, log } = props
  const [filter, setFilter] = useState('upcoming')
  const [query, setQuery] = useState('')
  const visible = data.activities.filter(a => matches(query, a.name, a.description, a.parentName) && (filter === 'all' || (filter === 'upcoming' ? isPendingActivity(a) : filter === 'completed' ? a.kind !== 'note' && a.state === 1 : a.kind === filter))).sort((a, b) => filter === 'upcoming' ? (a.start || a.end).localeCompare(b.start || b.end) : b.created.localeCompare(a.created))
  const overdue = data.activities.filter(a => a.kind === 'task' && a.state === 0 && a.end && a.end.slice(0, 10) < dateOnly()).length
  return <>
    <header className="page-head">
      <div><h1>Activity</h1><p>Meetings, tasks and notes you can access · includes shared activity</p></div>
      <button className="button primary" onClick={() => log()}><Icon name="plus" size={18} />Log activity</button>
    </header>
    {overdue > 0 && <div className="banner"><Icon name="clock" size={20} /><span><strong>{overdue} overdue {overdue === 1 ? 'task' : 'tasks'}.</strong> Tick them off or move the due date.</span></div>}
    <div className="toolbar">
      <div className="tabs" role="group" aria-label="Activity filter">{[['upcoming', 'To do'], ['completed', 'Completed'], ['note', 'Notes'], ['all', 'All']].map(([value, name]) => <button key={value} className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{name}</button>)}</div>
      <label className="search-field"><Icon name="search" size={18} /><input aria-label="Search activities" value={query} onChange={e => setQuery(e.target.value)} placeholder="Subject, notes or record" /></label>
    </div>
    <section className="panel flush">{visible.length ? <ActivityList {...props} activities={visible} /> : <Empty title={data.activities.length ? 'Nothing in this view' : 'No activity yet'} icon="activity" action={<button className="button primary" onClick={() => log()}><Icon name="plus" size={18} />Log activity</button>}>{data.activities.length ? 'Try another filter or search.' : 'Activities you have access to in Dataverse, including shared activity, show up here. Log a meeting, a follow-up task or a note to get started.'}</Empty>}</section>
  </>
}
function DetailFacts({ rows }: { rows: [string, ReactNode][] }) {
  return <dl className="detail-facts">{rows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value || 'Not set'}</dd></div>)}</dl>
}
function Seller({ name }: { name: string }) {
  return <span className="person-inline"><Portrait name={name} size="xs" />{name}</span>
}
function StageStepper({ deal }: { deal: Deal }) {
  const current = deal.stage === null ? -1 : deal.stage - CHOICE
  const won = deal.status === CHOICE + 1
  return <ol className="stepper" aria-label="Sales stage">{choices.stage.map((stage, i) => <li key={stage} className={won || i < current ? 'done' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}><span />{stage}</li>)}</ol>
}
export function RecordDetail({ record, kind, onClose, ...props }: ViewProps & { record: Lead | Deal | Account; kind: RecordKind; onClose: () => void }) {
  const { data, navigate, editLead, log } = props
  const lead = kind === 'lead' ? record as Lead : undefined
  const deal = kind === 'deal' ? record as Deal : undefined
  const account = kind === 'account' ? record as Account : data.accounts.find(a => a.id === (lead?.accountId || deal?.accountId))
  const relatedDeals = kind === 'account' ? data.deals.filter(d => d.accountId === record.id) : []
  const relatedLeads = kind === 'account' ? data.leads.filter(l => l.accountId === record.id) : []
  const relatedIds = new Set([record.id, ...relatedDeals.map(d => d.id), ...relatedLeads.map(l => l.id)])
  const history = data.activities.filter(a => relatedIds.has(a.parentId)).sort((a, b) => b.created.localeCompare(a.created))
  const contacts = data.contacts.filter(c => kind === 'account' ? c.accountId === record.id : c.id === deal?.contactId)
  const [tab, setTab] = useState('overview')
  const currency = data.currencies.find(c => c.id === lead?.currencyId)?.code || 'USD'
  const signals = deal ? attention(deal) : []
  const status = deal ? ['Open', 'Won', 'Lost'][(deal.status ?? CHOICE) - CHOICE] : ''
  return <Dialog title={kind === 'lead' ? 'Lead' : kind === 'deal' ? 'Deal' : 'Account'} drawer onClose={onClose}>
    <div className="detail-head">
      <div className="detail-identity">
        {lead ? <Portrait name={personName(lead)} size="lg" /> : <CompanyLogo name={(deal ? deal.accountName : record.name) || record.name} size="lg" />}
        <div>
          <span className="detail-kicker">{lead ? lead.company : deal ? deal.accountName : account?.number}</span>
          <h2>{lead ? personName(lead) : deal ? dealTitle(deal).title : record.name}</h2>
          <p>{lead ? lead.job : deal ? [deal.type, dealTitle(deal).code].filter(Boolean).join(' · ') : account?.segment}</p>
        </div>
        {lead && <Score score={lead.score} />}
      </div>
      <div className="detail-pills">
        {lead && <><Pill tone={statusTone(lead.status)}>{label(choices.status, lead.status)}</Pill><Pill>{label(choices.rating, lead.rating)}</Pill></>}
        {deal && <><Pill tone={status === 'Won' ? 'success' : status === 'Lost' ? 'warning' : 'accent'}>{status}</Pill>{deal.forecast && <Pill>{deal.forecast}</Pill>}</>}
        {kind === 'account' && <>{account?.tier && <Pill tone="accent">{account.tier}</Pill>}{account?.region && <Pill>{account.region}</Pill>}</>}
        {!lead && <span className="readonly"><Icon name="lock" size={14} />Read-only</span>}
      </div>
      {kind !== 'account' && <div className="detail-actions">
        <button className="button primary" onClick={() => log(`${kind}:${record.id}`, 'appointment')}><Icon name="plus" size={16} />Log activity</button>
        <button className="button secondary" onClick={() => log(`${kind}:${record.id}`, 'note')}><Icon name="note" size={16} />Add note</button>
        {lead && <button className="button secondary" onClick={() => editLead(lead)}><Icon name="edit" size={16} />Edit</button>}
      </div>}
    </div>
    <div className="tabs detail-tabs" role="group" aria-label="Record sections"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')} aria-pressed={tab === 'overview'}>Overview</button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')} aria-pressed={tab === 'history'}>Activity<span>{history.length}</span></button></div>
    {tab === 'history' ? <div className="detail-body">{history.length ? <ActivityList {...props} activities={history} /> : <Empty title="No activity yet" icon="note" action={kind !== 'account' ? <button className="button secondary" onClick={() => log(`${kind}:${record.id}`, 'note')}><Icon name="note" size={16} />Add a note</button> : undefined}>Meetings, tasks and notes you have access to for this record show up here, including shared activity.</Empty>}</div> : <div className="detail-body">
      {deal && <>
        {deal.status === CHOICE && <StageStepper deal={deal} />}
        <div className="deal-amount"><strong>{money(deal.status === CHOICE + 1 && deal.actualValue ? deal.actualValue : deal.value, false)}</strong><span>{deal.probability}% probability · {money(weightedValue(deal))} weighted · {deal.status === CHOICE ? 'closes' : 'closed'} {dateLabel(deal.closeDate)}</span></div>
        {signals.length > 0 && <div className="signal-box"><h3>Needs attention</h3>{signals.map(r => <p key={r}><Icon name="info" size={15} />{r}</p>)}</div>}
        <section><h3 className="detail-label">Next step</h3><p className="body-copy">{deal.nextStep || 'No next step recorded.'}</p><button className="text-button" onClick={() => log(`deal:${deal.id}`, 'task')}>Add a follow-up task<Icon name="arrow" size={16} /></button></section>
        <DetailFacts rows={[['Seller', <Seller name={label(choices.executive, deal.executive)} />], ['Product', deal.product], ['Competitor', deal.competitor], ['Last activity', dateLabel(deal.lastActivity)], ['In stage since', dateLabel(deal.stageEntered)], ['Close date pushed', deal.pushes ? `${deal.pushes}×` : 'Never']]} />
      </>}
      {lead && <>
        <section><h3 className="detail-label">Topic</h3><p className="body-copy">{lead.topic || 'No topic yet.'}</p></section>
        <DetailFacts rows={[['Estimated value', `${money(lead.value, false, currency)} ${currency}`], ['Source', label(choices.source, lead.source)], ['Product interest', label(choices.product, lead.product)], ['Segment', label(choices.segment, lead.segment)], ['Email', lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : ''], ['Phone', lead.phone]]} />
        {lead.status === CHOICE + 4 && <div className="signal-box"><h3>Disqualified</h3><p>{label(choices.reason, lead.reason)} · {dateLabel(lead.closedOn)}</p></div>}
      </>}
      {record.description && <section><h3 className="detail-label">Description</h3><p className="body-copy">{record.description}</p></section>}
      {account && kind !== 'account' && <button className="row linked-account" onClick={() => navigate('accounts', account.id)}><CompanyLogo name={account.name} size="sm" /><span className="record-copy"><small>Account</small><strong>{account.name}</strong></span><Icon name="chevron" size={16} /></button>}
      {kind === 'account' && account && <>
        <DetailFacts rows={[['Seller', <Seller name={label(choices.executive, account.executive)} />], ['Phone', account.phone], ['Website', safeWebsite(account.website) ? <a href={safeWebsite(account.website)} target="_blank" rel="noreferrer">{account.website.replace(/^https?:\/\//, '')}<Icon name="external" size={14} /></a> : '']]} />
      </>}
      {contacts.length > 0 && <section><h3 className="detail-label">{kind === 'account' ? `Buying team · ${contacts.length}` : 'Primary contact'}</h3><ul className="contacts">{contacts.map(c => <li key={c.id} className="contact-card"><Portrait name={c.name} size="md" /><div><strong>{c.name}</strong><span>{c.job}</span>{c.role && <Pill tone={c.role === 'Decision maker' ? 'accent' : c.role === 'Champion' ? 'success' : ''}>{c.role}</Pill>}{c.email && <a href={`mailto:${c.email}`}><Icon name="mail" size={14} />{c.email}</a>}</div></li>)}</ul></section>}
      {kind === 'account' && <section><h3 className="detail-label">Deals · {relatedDeals.length}</h3>{relatedDeals.length ? <ul className="row-list">{relatedDeals.map(d => <li key={d.id}><button className="row" onClick={() => navigate('pipeline', d.id)}><span className="record-copy"><strong>{dealTitle(d).title}</strong><span>{label(choices.stage, d.stage)} · {['Open', 'Won', 'Lost'][(d.status ?? CHOICE) - CHOICE] || 'Unknown'}</span></span><span className="row-value"><strong>{money(d.value)}</strong><small>{dateLabel(d.closeDate)}</small></span></button></li>)}</ul> : <p className="muted-copy">No deals for this account.</p>}</section>}
    </div>}
  </Dialog>
}
