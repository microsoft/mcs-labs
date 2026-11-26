import { getUser } from '@microsoft/managed-apps/auth'
import { getContext } from '@microsoft/managed-apps/app'
import type { IOperationResult } from '@microsoft/managed-apps/data'
import { MicrosoftDataverseService as DV } from '../generated/services/MicrosoftDataverseService'
import {
  ENVIRONMENT_ID, TENANT_ID, emptyData, isRecord, isGuid, text, nextToken,
  parseAccount, parseContact, parseDeal, parseLead, parseActivity,
} from './domain'
import type { Row, Identity, SalesData, BaseRecord, ActivityKind } from './domain'

const JSON_TYPE = 'application/json'
const PREFER = 'odata.include-annotations="*",odata.maxpagesize=250'
const WRITABLE_SETS = new Set(['zava_leads', 'tasks', 'appointments', 'annotations'])
const activitySet = { task: 'tasks', appointment: 'appointments', note: 'annotations' } as const
export class DataError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) { super(message); this.name = 'DataError'; this.status = status }
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
function fail(error: unknown, action: string): DataError {
  console.error(`Dataverse: ${action}`, error)
  const r = isRecord(error) ? error : {}
  const status = Number(r.status ?? r.statusCode ?? (isRecord(r.response) ? r.response.status : undefined))
  const detail = error instanceof Error ? error.message : text(r, 'message')
  if (status === 403 || /403|privilege|access.denied|permission/i.test(detail)) return new DataError(`You don't have permission to ${action}. Your changes have not been saved. Ask your workshop administrator to check your Dataverse role.`, 403)
  if (status === 401) return new DataError('Your Dataverse connection needs sign-in. Reload the app and reconnect with your Zava account.', 401)
  if (status === 412) return new DataError('This record changed elsewhere. Close this form, refresh, then edit the latest version.', 412)
  if (status === 404) return new DataError('This record is no longer available. Refresh to see the latest data.', 404)
  return new DataError(`Couldn't ${action}.${detail ? ` ${detail}` : ' Try again, or check your Dataverse connection.'}`, Number.isFinite(status) ? status : undefined)
}
async function operation<T>(promise: Promise<IOperationResult<T>>, action: string): Promise<IOperationResult<T>> {
  try {
    const result = await promise
    if (!result.success) throw result.error ?? new Error('Dataverse did not confirm the operation.')
    return result
  } catch (error) { throw fail(error, action) }
}
async function list(set: string, key: string, select: string, filter?: string, order = 'createdon desc') {
  const rows: Row[] = []
  const seen = new Set<string>()
  const tokens = new Set<string>()
  let token: string | undefined
  do {
    const result = await operation(DV.ListRecords(set, PREFER, JSON_TYPE, undefined, select, filter, order, undefined, undefined, undefined, token), `load ${set}`)
    if (!isRecord(result.data) || !Array.isArray(result.data.value)) throw new DataError(`Dataverse returned an unexpected response for ${set}.`)
    for (const row of result.data.value) {
      if (!isRecord(row) || !isGuid(text(row, key))) throw new DataError(`Dataverse returned an invalid row for ${set}.`)
      const id = text(row, key).toLowerCase()
      if (!seen.has(id)) { rows.push(row); seen.add(id) }
    }
    if (rows.length > 10000) throw new DataError(`There are more than 10,000 ${set}. Narrow the dataset before loading it in this workspace.`)
    token = nextToken(result.data, result.skipToken, set)
    if (token) {
      if (tokens.has(token) || !result.data.value.length) throw new DataError('Dataverse repeated a page. Refresh and try again.')
      tokens.add(token)
    }
  } while (token)
  return rows
}
export async function connect(): Promise<Identity> {
  const [user, context] = await Promise.all([getUser(), getContext()])
  if (user.tenantId.toLowerCase() !== TENANT_ID || context.app.environmentId.toLowerCase() !== ENVIRONMENT_ID) {
    throw new DataError('Open this app in the Zava Sales environment using your workshop tenant account.')
  }
  const users = await list('systemusers', 'systemuserid', 'systemuserid,fullname,azureactivedirectoryobjectid,domainname', "Microsoft.Dynamics.CRM.EqualUserId(PropertyName='systemuserid')", 'fullname asc')
  if (users.length !== 1 || text(users[0], 'azureactivedirectoryobjectid').toLowerCase() !== user.objectId.toLowerCase()) {
    throw new DataError('Your Dataverse connection belongs to a different identity. Reconnect with the same account you used to open the app. No CRM data was loaded.')
  }
  return { name: text(users[0], 'fullname'), id: text(users[0], 'systemuserid'), objectId: user.objectId, upn: text(users[0], 'domainname') || undefined }
}
const accountSelect = 'accountid,name,accountnumber,telephone1,websiteurl,description,account_segment,account_sales_region,account_account_tier,account_account_executive'
const contactSelect = 'contactid,fullname,_parentcustomerid_value,contact_buying_role,jobtitle,emailaddress1,telephone1'
const leadSelect = 'zava_leadid,zava_name,zava_first_name,zava_last_name,zava_company_name,zava_job_title,zava_email,zava_business_phone,zava_topic,zava_description,zava_lead_status,zava_rating,zava_lead_score,zava_estimated_value,zava_estimated_value_base,zava_lead_source,zava_product_interest,zava_segment,_zava_accountid_value,zava_disqualify_reason,zava_closed_on,createdon,_transactioncurrencyid_value'
const dealSelect = 'zava_opportunityid,zava_name,_zava_account_value,_zava_primary_contact_value,zava_sales_stage,zava_account_executive,zava_deal_status,zava_forecast_category,zava_product_line,zava_deal_type,zava_estimated_revenue_base,zava_actual_revenue_base,zava_probability,zava_estimated_close_date,zava_last_activity_on,zava_stage_entered_on,zava_close_date_pushes,zava_next_step,zava_description,zava_primary_competitor'
const activitySelect = 'activityid,subject,description,scheduledstart,scheduledend,createdon,_regardingobjectid_value,statecode,statuscode'
export async function loadData(): Promise<SalesData> {
  const data: SalesData = { ...emptyData, activities: [], issues: [] }
  const jobs: [string, () => Promise<void>][] = [
    ['Accounts', async () => { data.accounts = (await list('accounts', 'accountid', accountSelect, undefined, 'name asc')).map(parseAccount) }],
    ['Contacts', async () => { data.contacts = (await list('contacts', 'contactid', contactSelect, undefined, 'fullname asc')).map(parseContact) }],
    ['Pipeline', async () => { data.deals = (await list('zava_opportunities', 'zava_opportunityid', dealSelect)).map(parseDeal) }],
    ['Leads', async () => { data.leads = (await list('zava_leads', 'zava_leadid', leadSelect)).map(parseLead) }],
    ['Tasks', async () => { data.activities.push(...(await list('tasks', 'activityid', activitySelect)).map(r => parseActivity(r, 'task'))) }],
    ['Meetings', async () => { data.activities.push(...(await list('appointments', 'activityid', `${activitySelect},zava_meeting_type`)).map(r => parseActivity(r, 'appointment'))) }],
    ['Notes', async () => { data.activities.push(...(await list('annotations', 'annotationid', 'annotationid,subject,notetext,createdon,_objectid_value', 'isdocument eq false')).map(r => parseActivity(r, 'note'))) }],
    ['Currencies', async () => { data.currencies = (await list('transactioncurrencies', 'transactioncurrencyid', 'transactioncurrencyid,isocurrencycode', 'statecode eq 0', 'isocurrencycode asc')).map(r => ({ id: text(r, 'transactioncurrencyid'), code: text(r, 'isocurrencycode') })) }],
  ]
  await Promise.all(jobs.map(async ([resource, run]) => {
    try { await run() } catch (error) { data.issues.push({ resource, message: errorMessage(error) }) }
  }))
  const names = new Map([...data.leads, ...data.deals].map(r => [r.id, r.name]))
  data.activities = data.activities.map(a => ({ ...a, parentName: a.parentName || names.get(a.parentId) || '' }))
  return data
}
async function save(set: string, payload: Row, record?: BaseRecord) {
  if (!WRITABLE_SETS.has(set)) throw new DataError('Accounts, contacts and pipeline records are read-only in this workspace.')
  if (record) {
    if (!isGuid(record.id) || !record.etag) throw new DataError('Refresh this record before editing; its version is missing.')
    await operation(DV.UpdateOnlyRecord('return=minimal', JSON_TYPE, record.etag, set, record.id, payload), 'save this record')
  } else {
    await operation(DV.CreateRecord('return=minimal', JSON_TYPE, set, payload), 'create this record')
  }
}
export const saveLead = (payload: Row, record?: BaseRecord) => save('zava_leads', payload, record)
export const saveActivity = (kind: ActivityKind, payload: Row, record?: BaseRecord) => save(activitySet[kind], payload, record)
