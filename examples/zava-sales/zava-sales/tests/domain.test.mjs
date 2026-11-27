import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  CHOICE, ENVIRONMENT_ID, ORG, activityPayload, attention, choices, dateLabel, dateOnly,
  isPendingActivity, leadPayload, money, nextToken, parseLead, parseDeal, parseActivity, pipelineMetrics, route, safeWebsite,
} from '../src/domain.ts'

const id = '00000000-0000-0000-0000-000000000001'
const now = new Date('2026-11-05T12:00:00Z')
const draft = {
  firstName: 'Alex', lastName: 'Rivera', company: 'Test Sports', job: '', email: 'alex@example.com',
  phone: '', topic: 'Team kit exploration', description: 'A new conversation',
  status: `${CHOICE}`, rating: '', score: '81', value: '52000', currencyId: id,
  source: `${CHOICE + 2}`, product: `${CHOICE + 4}`, segment: '', accountId: '', reason: '',
}
test('live metadata choice values retain the verified 100000000 base', () => {
  assert.equal(choices.status.length, 5)
  assert.equal(choices.executive.length, 6)
  assert.equal(CHOICE, 100000000)
})
test('lead creation has no owner override and uses verified Dataverse columns', () => {
  const payload = leadPayload(draft, undefined, now)
  assert.equal(payload.zava_name, 'Alex Rivera - Test Sports')
  assert.equal(payload.zava_lead_score, 81)
  assert.equal(payload.zava_estimated_value, 52000)
  assert.equal(payload.zava_lead_status, CHOICE)
  assert.equal(payload['transactioncurrencyid@odata.bind'], `/transactioncurrencies(${id})`)
  assert.ok(!Object.keys(payload).some(k => k.startsWith('owner')))
})
test('lead account lookup uses its case-sensitive navigation property', () => {
  assert.equal(leadPayload({ ...draft, accountId: id })['zava_AccountId@odata.bind'], `/accounts(${id})`)
  assert.equal(leadPayload(draft, { accountId: id }).zava_AccountId, null)
})
test('qualifying is status-only, marks closed date and never creates an opportunity', () => {
  const payload = leadPayload({ ...draft, status: `${CHOICE + 3}` }, undefined, now)
  assert.equal(payload.zava_closed_on, '2026-11-05')
  assert.equal(payload.zava_lead_status, CHOICE + 3)
  assert.equal(payload.zava_disqualify_reason, null)
})
test('closed date is preserved when editing a closed lead', () => {
  const previous = { status: CHOICE + 3, closedOn: '2026-10-01T00:00:00Z' }
  assert.equal(leadPayload({ ...draft, status: `${CHOICE + 3}` }, previous, now).zava_closed_on, '2026-10-01')
})
test('reopening clears closed date and disqualification reason', () => {
  const p = leadPayload(draft, { status: CHOICE + 4, closedOn: '2026-11-01' }, now)
  assert.equal(p.zava_closed_on, null)
  assert.equal(p.zava_disqualify_reason, null)
})
test('disqualification requires a valid reason', () => {
  assert.throws(() => leadPayload({ ...draft, status: `${CHOICE + 4}` }), /valid option/)
  assert.equal(leadPayload({ ...draft, status: `${CHOICE + 4}`, reason: `${CHOICE + 2}` }).zava_disqualify_reason, CHOICE + 2)
})
for (const invalid of ['-1', '101', '1.5', 'not-a-number']) {
  test(`lead score rejects ${invalid}`, () => assert.throws(() => leadPayload({ ...draft, score: invalid }), /whole number/))
}
for (const invalid of ['-1', 'Infinity', 'no']) {
  test(`estimated value rejects ${invalid}`, () => assert.throws(() => leadPayload({ ...draft, value: invalid }), /Estimated value/))
}
test('optional score stays unknown rather than becoming zero', () => assert.equal(leadPayload({ ...draft, score: '' }).zava_lead_score, null))
test('lead validation rejects empty required fields, invalid choices and email', () => {
  assert.throws(() => leadPayload({ ...draft, lastName: ' ' }), /first name/)
  assert.throws(() => leadPayload({ ...draft, email: 'not-an-email' }), /email/)
  assert.throws(() => leadPayload({ ...draft, status: '0' }), /valid option/)
  assert.throws(() => leadPayload({ ...draft, currencyId: '' }), /currency/)
  assert.throws(() => leadPayload({ ...draft, company: 'a'.repeat(100) }), /100 characters/)
})
const task = { kind: 'task', subject: 'Follow up', description: 'Details', start: '', end: '2026-11-10T12:00', parent: `lead:${id}`, meetingType: '', completed: false }
test('task payload uses verified activity navigation and status codes', () => {
  const p = activityPayload(task)
  assert.equal(p['regardingobjectid_zava_lead_task@odata.bind'], `/zava_leads(${id})`)
  assert.equal(p.statecode, 0)
  assert.equal(p.statuscode, 2)
  assert.equal(activityPayload({ ...task, completed: true }).statuscode, 5)
})
test('meeting payload has start/end and correct completed status', () => {
  const p = activityPayload({ ...task, kind: 'appointment', start: '2026-11-10T11:00', parent: `deal:${id}`, completed: true })
  assert.equal(p['regardingobjectid_zava_opportunity_appointment@odata.bind'], `/zava_opportunities(${id})`)
  assert.equal(p.statuscode, 3)
  assert.equal(p.statecode, 1)
  const scheduled = activityPayload({ ...task, kind: 'appointment', start: '2026-11-10T11:00' })
  assert.equal(scheduled.statecode, 3)
  assert.equal(scheduled.statuscode, 5)
  assert.throws(() => activityPayload({ ...task, kind: 'appointment', start: '2026-11-10T13:00' }), /end after/)
})
test('scheduled meetings are pending, not silently dropped from the agenda', () => {
  assert.equal(isPendingActivity({ kind: 'appointment', state: 3 }), true)
  assert.equal(isPendingActivity({ kind: 'appointment', state: 0 }), true)
  assert.equal(isPendingActivity({ kind: 'task', state: 0 }), true)
  for (const kind of ['task', 'appointment']) {
    assert.equal(isPendingActivity({ kind, state: 1 }), false)
    assert.equal(isPendingActivity({ kind, state: 2 }), false)
  }
  assert.equal(isPendingActivity({ kind: 'note', state: 0 }), false)
})
test('editing details does not reset canceled, in-progress, or out-of-office status', () => {
  assert.equal(activityPayload(task, { state: 0, status: 3 }).statuscode, 3)
  assert.equal(activityPayload(task, { state: 2, status: 6 }).statecode, 2)
  assert.equal(activityPayload(task, { state: 2, status: 6 }).statuscode, 6)
  assert.equal(activityPayload({ ...task, kind: 'appointment', start: '2026-11-10T11:00' }, { state: 3, status: 6 }).statuscode, 6)
})
test('notes use annotation text and not an activity status', () => {
  const p = activityPayload({ ...task, kind: 'note', end: '' })
  assert.equal(p['objectid_zava_lead@odata.bind'], `/zava_leads(${id})`)
  assert.equal(p.notetext, 'Details')
  assert.ok(!('statecode' in p))
})
test('activities require a valid supported parent and time', () => {
  assert.throws(() => activityPayload({ ...task, parent: `account:${id}` }), /Link this/)
  assert.throws(() => activityPayload({ ...task, parent: 'lead:invalid' }), /Link this/)
  assert.throws(() => activityPayload({ ...task, end: '' }), /due date/)
})
test('attention thresholds are explicit, not generated claims', () => {
  const deal = { status: CHOICE, closeDate: '2026-11-04', pushes: 2, lastActivity: '2026-10-22T12:00:00Z', stageEntered: '2026-10-06T12:00:00Z' }
  assert.equal(attention(deal, now).length, 4)
  assert.equal(attention({ ...deal, status: CHOICE + 1 }, now).length, 0)
  assert.equal(attention({ ...deal, closeDate: '2026-11-05', pushes: 0, lastActivity: '2026-10-23T12:00:00Z', stageEntered: '2026-10-07T12:00:00Z' }, now).length, 0)
})
test('pipeline metrics exclude closed deals and clamp probability', () => {
  const m = pipelineMetrics([{ status: CHOICE, value: 100, probability: 50 }, { status: CHOICE + 1, value: 1000, actualValue: 800 }, { status: CHOICE, value: 200, probability: 120 }])
  assert.equal(m.total, 300)
  assert.equal(m.weighted, 250)
  assert.equal(m.won, 800)
})
test('parsers preserve missing optional choices and record versions', () => {
  const l = parseLead({ zava_leadid: id, zava_name: 'Alex', '@odata.etag': 'W/"12"' })
  assert.equal(l.score, null)
  assert.equal(l.etag, 'W/"12"')
  assert.throws(() => parseLead({ zava_leadid: 'bad' }), /invalid/)
  const d = parseDeal({ zava_opportunityid: id, zava_estimated_revenue: 999, zava_estimated_revenue_base: 100 })
  assert.equal(d.value, 100)
  const a = parseActivity({ activityid: id, '_regardingobjectid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'zava_lead' }, 'task')
  assert.equal(a.parentKind, 'lead')
})
test('pagination accepts only same-environment, same-table continuations', () => {
  const link = `${ORG}/api/data/v9.2/zava_leads?$skiptoken=${encodeURIComponent('<cookie page="2" />')}`
  assert.equal(nextToken({ '@odata.nextLink': link }, undefined, 'zava_leads'), '<cookie page="2" />')
  assert.equal(nextToken({}, 'opaque-sdk-token', 'zava_leads'), 'opaque-sdk-token')
  assert.equal(nextToken({}, undefined, 'zava_leads'), undefined)
  assert.throws(() => nextToken({ '@odata.nextLink': 'https://other.example/zava_leads?$skiptoken=x' }, undefined, 'zava_leads'), /Unexpected/)
  assert.throws(() => nextToken({ '@odata.nextLink': `${ORG}/api/data/v9.2/accounts?$skiptoken=x` }, undefined, 'zava_leads'), /Unexpected/)
  assert.throws(() => nextToken({ '@odata.nextLink': `${ORG}/api/data/v9.2/zava_leads` }, undefined, 'zava_leads'), /Missing/)
})
test('routing validates IDs and external websites reject executable schemes', () => {
  assert.deepEqual(route(`#/leads/${id}`), { page: 'leads', id })
  assert.deepEqual(route('#/leads/not-an-id'), { page: 'leads', id: undefined })
  assert.equal(route('#/anything').page, 'today')
  assert.equal(safeWebsite('javascript:alert(1)'), undefined)
  assert.equal(safeWebsite('https://example.com'), 'https://example.com/')
})
test('dates and money retain clear human labels', () => {
  assert.equal(dateOnly(now), '2026-11-05')
  assert.equal(dateLabel('2026-11-05T00:00:00Z'), 'Nov 5, 2026')
  assert.equal(money(250000), '$250K')
})
test('configuration is delegated, never a shared maker connection', () => {
  const c = JSON.parse(readFileSync(new URL('../ms.config.json', import.meta.url), 'utf8'))
  assert.equal(c.environmentId, ENVIRONMENT_ID)
  assert.equal(c.repoType, 'none')
  assert.equal(c.appSettings.showHeader, false)
  const refs = Object.values(c.connectionReferences)
  assert.equal(refs.length, 1)
  assert.equal(refs[0].id, '/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps')
  assert.ok(!refs[0].sharedConnectionId)
})
test('reads rely on Dataverse permissions while identity checks and writable tables remain restricted', () => {
  const source = readFileSync(new URL('../src/data.ts', import.meta.url), 'utf8')
  assert.match(source, /WRITABLE_SETS = new Set\(\['zava_leads', 'tasks', 'appointments', 'annotations'\]\)/)
  assert.doesNotMatch(source, /OWN_ROWS|PRIVATE_SETS|ownerid/)
  assert.match(source, /if \(!WRITABLE_SETS\.has\(set\)\) throw/)
  assert.match(source, /azureactivedirectoryobjectid.*user\.objectId/)
  assert.match(source, /UpdateOnlyRecord\('return=minimal', JSON_TYPE, record\.etag/)
})
test('all app surfaces describe Dataverse access instead of promising owner-only visibility', () => {
  for (const file of ['App.tsx', 'views.tsx', 'forms.tsx']) {
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /only you can see|you own|your (?:leads|activity|timeline)|private activity/i, file)
  }
  const views = readFileSync(new URL('../src/views.tsx', import.meta.url), 'utf8')
  assert.match(views, />Activity<span>\{history\.length\}<\/span>/)
  assert.match(views, /includes shared activity/)
})
test('host CSP bootstrap is external and branding has no standalone SVG dependency', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /<script src="\/theme\.js"><\/script>/)
  assert.doesNotMatch(html, /<script(?![^>]*src=)[^>]*>[\s\S]+?<\/script>/)
  assert.doesNotMatch(html, /favicon\.svg/)
})
