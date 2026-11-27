import { useState } from 'react'
import type { FormEvent } from 'react'
import { activityPayload, CHOICE, choices, leadPayload, localInput } from './domain'
import type { Activity, ActivityDraft, ActivityKind, Lead, LeadDraft, SalesData } from './domain'
import { errorMessage, saveActivity, saveLead } from './data'
import { Dialog, Field, Icon } from './ui'

function Options({ values }: { values: string[] }) {
  return <>{values.map((name, i) => <option key={name} value={CHOICE + i}>{name}</option>)}</>
}
interface FormProps { data: SalesData; onClose: () => void; onSaved: (message: string) => void }
export function LeadForm({ data, lead, onClose, onSaved }: FormProps & { lead?: Lead }) {
  const option = (n: number | null | undefined) => n == null ? '' : String(n)
  const [draft, setDraft] = useState<LeadDraft>({
    firstName: lead?.firstName ?? '', lastName: lead?.lastName ?? '', company: lead?.company ?? '',
    job: lead?.job ?? '', email: lead?.email ?? '', phone: lead?.phone ?? '', topic: lead?.topic ?? '',
    description: lead?.description ?? '', status: option(lead?.status ?? CHOICE), rating: option(lead?.rating),
    score: lead?.score?.toString() ?? '', value: lead?.value?.toString() ?? '0',
    source: option(lead?.source), product: option(lead?.product), segment: option(lead?.segment),
    accountId: lead?.accountId ?? '', reason: option(lead?.reason),
    currencyId: lead?.currencyId || data.currencies.find(c => c.code === 'USD')?.id || '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const field = (name: keyof LeadDraft) => ({
    value: draft[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDraft(d => ({ ...d, [name]: event.target.value })),
  })
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setError(''); setBusy(true)
    try { await saveLead(leadPayload(draft, lead), lead); onSaved(lead ? 'Lead updated. Keep the conversation going.' : 'Your new lead is ready. Make the first move.') }
    catch (e) { setError(errorMessage(e)); setBusy(false) }
  }
  return <Dialog title="Lead" wide onClose={() => { if (!busy) onClose() }}>
    <div className="form-heading"><h2>{lead ? 'Edit lead' : 'New lead'}</h2><p>Saved to Dataverse as you. Access follows Dataverse permissions and sharing.</p></div>
    <form onSubmit={submit}>
      <fieldset disabled={busy} className="form-grid">
        <Field label="First name *"><input autoFocus required maxLength={50} autoComplete="given-name" {...field('firstName')} /></Field>
        <Field label="Last name *"><input required maxLength={50} autoComplete="family-name" {...field('lastName')} /></Field>
        <Field label="Company *"><input required maxLength={100} {...field('company')} placeholder="Who are they building for?" /></Field>
        <Field label="Job title"><input maxLength={100} {...field('job')} /></Field>
        <Field label="Email"><input type="email" maxLength={100} {...field('email')} /></Field>
        <Field label="Phone"><input type="tel" maxLength={50} {...field('phone')} /></Field>
        <Field label="Conversation topic *" full><input required maxLength={100} {...field('topic')} placeholder="The opportunity you see together" /></Field>
        <Field label="Status"><select {...field('status')}><Options values={choices.status} /></select></Field>
        <Field label="Temperature"><select {...field('rating')}><option value="">Not set</option><Options values={choices.rating} /></select></Field>
        {draft.status === String(CHOICE + 4) && <Field label="Disqualification reason *" full><select required {...field('reason')}><option value="">Choose a reason</option><Options values={choices.reason} /></select></Field>}
        {draft.status === String(CHOICE + 3) && <p className="form-note full">Qualified marks this lead as ready. It does not create an opportunity or change other CRM records.</p>}
        <Field label="Estimated value"><input type="number" min="0" max="100000000000" step="0.01" {...field('value')} /></Field>
        <Field label="Currency *"><select required {...field('currencyId')}><option value="">Choose currency</option>{data.currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}</select></Field>
        <Field label="Lead source"><select {...field('source')}><option value="">Not set</option><Options values={choices.source} /></select></Field>
        <Field label="Lead score (0–100)" hint="Your assessment, not an AI-generated score."><input type="number" min="0" max="100" step="1" {...field('score')} /></Field>
        <Field label="Product interest"><select {...field('product')}><option value="">Not set</option><Options values={choices.product} /></select></Field>
        <Field label="Segment"><select {...field('segment')}><option value="">Not set</option><Options values={choices.segment} /></select></Field>
        <Field label="Link an existing account" full><select {...field('accountId')}><option value="">No account linked yet</option>{data.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
        <Field label="The story so far" full><textarea rows={4} maxLength={2000} {...field('description')} placeholder="What matters to them? What happens next?" /></Field>
      </fieldset>
      {error && <div className="error-box" role="alert">{error}</div>}
      <div className="form-actions"><button type="button" className="button secondary" disabled={busy} onClick={onClose}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Saving…' : lead ? 'Save changes' : 'Create lead'}<Icon name="arrow" size={17} /></button></div>
    </form>
  </Dialog>
}
export function ActivityForm({ data, activity, parent, kind = 'task', onClose, onSaved }: FormProps & { activity?: Activity; parent?: string; kind?: ActivityKind }) {
  const [draft, setDraft] = useState<ActivityDraft>(() => ({
    kind: activity?.kind ?? kind, subject: activity?.name ?? '', description: activity?.description ?? '',
    start: localInput(activity?.start || new Date().toISOString()),
    end: localInput(activity?.end || new Date(Date.now() + 3600000).toISOString()),
    parent: activity?.parentKind ? `${activity.parentKind}:${activity.parentId}` : parent ?? '',
    meetingType: activity?.meetingType?.toString() ?? '', completed: activity?.state === 1,
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const field = (name: Exclude<keyof ActivityDraft, 'kind' | 'completed'>) => ({
    value: draft[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setDraft(d => ({ ...d, [name]: e.target.value })),
  })
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(''); setBusy(true)
    try { await saveActivity(draft.kind, activityPayload(draft, activity), activity); onSaved(activity ? 'Activity updated.' : draft.kind === 'note' ? 'Note saved to the conversation.' : 'Activity saved. You’re one step ahead.') }
    catch (e) { setError(errorMessage(e)); setBusy(false) }
  }
  return <Dialog title="Activity" onClose={() => { if (!busy) onClose() }}>
    <div className="form-heading"><h2>{activity ? 'Edit activity' : 'Log activity'}</h2><p>Saved to Dataverse as you. Access follows Dataverse permissions and sharing.</p></div>
    <form onSubmit={submit}>
      <fieldset disabled={busy} className="form-grid">
        {!activity && <div className="segmented full" aria-label="Activity type">{(['task', 'appointment', 'note'] as ActivityKind[]).map(k => <button key={k} type="button" aria-pressed={draft.kind === k} className={draft.kind === k ? 'active' : ''} onClick={() => setDraft(d => ({ ...d, kind: k }))}><Icon name={k === 'appointment' ? 'activity' : k} size={17} />{k === 'appointment' ? 'Meeting' : k === 'task' ? 'Task' : 'Note'}</button>)}</div>}
        <Field label="Title *" full><input autoFocus required maxLength={200} {...field('subject')} placeholder={draft.kind === 'note' ? 'What did you learn?' : 'What happens next?'} /></Field>
        <Field label="Related to *" full><select required {...field('parent')}><option value="">Choose a lead or opportunity</option><optgroup label="Leads">{data.leads.map(l => <option key={l.id} value={`lead:${l.id}`}>{l.name}</option>)}</optgroup><optgroup label="Shared opportunities">{data.deals.map(d => <option key={d.id} value={`deal:${d.id}`}>{d.name}</option>)}</optgroup></select></Field>
        {draft.kind === 'appointment' && <Field label="Starts *"><input type="datetime-local" required {...field('start')} /></Field>}
        {draft.kind !== 'note' && <Field label={draft.kind === 'appointment' ? 'Ends *' : 'Due *'} full={draft.kind === 'task'}><input type="datetime-local" required {...field('end')} /></Field>}
        {draft.kind === 'appointment' && <Field label="Meeting type" full><select {...field('meetingType')}><option value="">Not set</option><Options values={choices.meeting} /></select></Field>}
        <Field label={draft.kind === 'note' ? 'Notes' : 'Details'} full><textarea rows={5} maxLength={20000} {...field('description')} placeholder="Capture the useful details, not the paperwork." /></Field>
        {draft.kind !== 'note' && <label className="checkbox full"><input type="checkbox" checked={draft.completed} onChange={e => setDraft(d => ({ ...d, completed: e.target.checked }))} />Already happened / completed</label>}
      </fieldset>
      {error && <div className="error-box" role="alert">{error}</div>}
      <div className="form-actions"><button type="button" className="button secondary" disabled={busy} onClick={onClose}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Saving…' : 'Save activity'}<Icon name="check" size={17} /></button></div>
    </form>
  </Dialog>
}
