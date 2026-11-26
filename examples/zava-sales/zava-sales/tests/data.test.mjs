import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import test from 'node:test'
import { ENVIRONMENT_ID, ORG, TENANT_ID, sellerTimeline } from '../src/domain.ts'

const userId = '00000000-0000-0000-0000-000000000001'
const objectId = '00000000-0000-0000-0000-000000000002'
const otherUserId = '00000000-0000-0000-0000-000000000003'
const teamId = '00000000-0000-0000-0000-000000000004'
const parentId = '00000000-0000-0000-0000-000000000005'
const dataUrl = new URL('../src/data.ts', import.meta.url).href
const sdkUrl = `data:text/javascript,${encodeURIComponent(`
  export const host = {
    getUser: async () => ({ tenantId: '${TENANT_ID}', objectId: '${objectId}' }),
    getContext: async () => ({ app: { environmentId: '${ENVIRONMENT_ID}' } }),
  }
  export const getUser = () => host.getUser()
  export const getContext = () => host.getContext()
  const unexpected = async () => { throw new Error('Unexpected connector operation') }
  export const MicrosoftDataverseService = {
    ListRecords: unexpected, CreateRecord: unexpected, UpdateOnlyRecord: unexpected,
  }
`)}`
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === dataUrl) {
      if (['@microsoft/managed-apps/auth', '@microsoft/managed-apps/app', '../generated/services/MicrosoftDataverseService'].includes(specifier)) {
        return { url: sdkUrl, shortCircuit: true }
      }
      if (specifier === './domain') return { url: new URL('../src/domain.ts', import.meta.url).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})
const { MicrosoftDataverseService: DV, host } = await import(sdkUrl)
const { connect, loadData, saveLead, saveActivity } = await import(dataUrl)
hooks.deregister()

const success = (value, extra = {}) => ({ success: true, data: { value }, ...extra })
const keys = {
  accounts: 'accountid', contacts: 'contactid', zava_opportunities: 'zava_opportunityid',
  zava_leads: 'zava_leadid', tasks: 'activityid', appointments: 'activityid',
  annotations: 'annotationid', transactioncurrencies: 'transactioncurrencyid',
}

test('all CRM lists retain owned, shared-user and team records on every page without owner filters', async t => {
  const calls = []
  t.mock.method(DV, 'ListRecords', async (set, prefer, accept, metadata, select, filter, order, expand, fetchXml, top, token) => {
    calls.push({ set, filter, token })
    const page = token ? Number(token.slice(-1)) : 0
    const row = {
      [keys[set]]: [userId, otherUserId, teamId][page],
      _ownerid_value: [userId, otherUserId, teamId][page],
      subject: `Visible ${set} ${page}`, zava_name: `Visible lead ${page}`,
      '@odata.etag': `W/"${page + 1}"`,
      _regardingobjectid_value: parentId, _objectid_value: parentId,
      '_regardingobjectid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'zava_lead',
      '_objectid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'zava_lead',
      statecode: set === 'appointments' ? 3 : 0,
      scheduledstart: '2026-11-06T12:00:00Z', scheduledend: '2026-11-06T13:00:00Z',
    }
    if (page === 0) return success([row], { skipToken: 'page-1' })
    if (page === 1) return { success: true, data: { value: [row], '@odata.nextLink': `${ORG}/api/data/v9.2/${set}?$skiptoken=page-2` } }
    return success([row])
  })

  const data = await loadData()
  assert.deepEqual(data.issues, [])
  assert.equal(calls.length, Object.keys(keys).length * 3)
  for (const set of Object.keys(keys)) {
    const requests = calls.filter(call => call.set === set)
    assert.deepEqual(requests.map(call => call.token), [undefined, 'page-1', 'page-2'])
    const expectedFilter = set === 'annotations' ? 'isdocument eq false' : set === 'transactioncurrencies' ? 'statecode eq 0' : undefined
    assert.deepEqual(requests.map(call => call.filter), Array(3).fill(expectedFilter), `${set} must rely on Dataverse read access, not ownership`)
  }
  for (const rows of [data.accounts, data.contacts, data.deals, data.leads, data.currencies]) {
    assert.deepEqual(rows.map(row => row.id), [userId, otherUserId, teamId])
  }
  for (const kind of ['task', 'appointment', 'note']) {
    assert.deepEqual(data.activities.filter(row => row.kind === kind).map(row => row.id), [userId, otherUserId, teamId])
  }
  assert.equal(data.activities.filter(row => row.parentId === parentId).length, 9)
  const timeline = sellerTimeline(data.activities, [], { now: new Date('2026-11-06T10:00:00Z') })
  assert.equal(timeline.weeks.flatMap(week => week.items).length, 6)
})

test('Dataverse read denials remain explicit resource errors, without retrying as another identity', async t => {
  const calls = []
  t.mock.method(console, 'error', () => {})
  t.mock.method(DV, 'ListRecords', async set => {
    calls.push(set)
    return set === 'tasks' ? { success: false, error: { status: 403, message: 'Read access denied' } } : success([])
  })
  const data = await loadData()
  assert.equal(data.issues.length, 1)
  assert.equal(data.issues[0].resource, 'Tasks')
  assert.match(data.issues[0].message, /don't have permission/)
  assert.equal(calls.filter(set => set === 'tasks').length, 1)
})

test('connector identity verification still uses the signed-in user filter and rejects mismatches', async t => {
  const calls = []
  const list = t.mock.method(DV, 'ListRecords', async (...args) => {
    calls.push(args)
    return success([{ systemuserid: userId, fullname: 'Workshop user', azureactivedirectoryobjectid: objectId }])
  })
  assert.equal((await connect()).id, userId)
  assert.equal(calls[0][0], 'systemusers')
  assert.equal(calls[0][5], "Microsoft.Dynamics.CRM.EqualUserId(PropertyName='systemuserid')")
  list.mock.mockImplementation(async () => success([{ systemuserid: userId, azureactivedirectoryobjectid: otherUserId }]))
  await assert.rejects(connect(), /different identity/)
  t.mock.method(host, 'getUser', async () => ({ tenantId: otherUserId, objectId }))
  await assert.rejects(connect(), /workshop tenant account/)
})

test('editing a visible shared record preserves ETags and surfaces Dataverse write denials', async t => {
  const calls = []
  const update = t.mock.method(DV, 'UpdateOnlyRecord', async (...args) => {
    calls.push(args)
    return { success: true }
  })
  const record = { id: otherUserId, name: 'Shared record', etag: 'W/"42"' }
  await saveLead({ zava_topic: 'Follow up' }, record)
  for (const kind of ['task', 'appointment', 'note']) await saveActivity(kind, { subject: 'Follow up' }, record)
  assert.deepEqual(calls.map(args => args[3]), ['zava_leads', 'tasks', 'appointments', 'annotations'])
  for (const args of calls) {
    assert.equal(args[2], record.etag)
    assert.equal(args[4], record.id)
    assert.ok(!Object.keys(args[5]).some(key => /owner|caller/i.test(key)))
  }
  t.mock.method(console, 'error', () => {})
  update.mock.mockImplementation(async () => ({ success: false, error: { status: 403, message: 'Write access denied' } }))
  await assert.rejects(saveActivity('task', { statecode: 1, statuscode: 5 }, record), { name: 'DataError', status: 403 })
  await assert.rejects(saveLead({}, { ...record, etag: '' }), /version is missing/)
})
