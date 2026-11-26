import assert from 'node:assert/strict'
import test from 'node:test'
import { CHOICE, activityTitle, dealCategory, dealTitle, hashString, logoMotif, monthlyOutlook, niceScale, sellerTimeline, weightedValue } from '../src/domain.ts'

const now = new Date(2026, 10, 5, 12)
const deal = (id, closeDate, value, extra = {}) => ({
  id, name: `Deal ${id}`, accountName: `Account ${id}`, status: CHOICE, stage: CHOICE + 1, executive: CHOICE + 2,
  product: 'Outerwear (Shield)', forecast: 'Best case', type: 'Expansion', probability: 50, closeDate, value, ...extra,
})

test('hashString is stable, so logos and portraits never change between visits', () => {
  assert.equal(hashString('BluePeak Athletics'), hashString('BluePeak Athletics'))
  assert.notEqual(hashString('BluePeak Athletics'), hashString('Bluepeak Athletics'))
  assert.ok(Number.isInteger(hashString('')) && hashString('x') >= 0)
})
test('logoMotif picks a motif from the company name and falls back to a monogram', () => {
  assert.equal(logoMotif('BluePeak Athletics'), 'mountain')
  assert.equal(logoMotif('Harbor Run Co'), 'wave')
  assert.equal(logoMotif('Metro League Sports'), 'shield')
  assert.equal(logoMotif('Zzz Corp'), 'monogram')
})
test('dealTitle drops the account suffix and splits out the deal code', () => {
  assert.deepEqual(dealTitle({ name: 'Team kits rollout - BluePeak Athletics (ZAV-OPP-1042)', accountName: 'BluePeak Athletics' }), { title: 'Team kits rollout', code: 'ZAV-OPP-1042' })
  assert.deepEqual(dealTitle({ name: 'Plain name', accountName: '' }), { title: 'Plain name', code: '' })
})
test('activityTitle drops seeded record codes and redundant parent suffixes', () => {
  assert.equal(activityTitle('Product demo - BluePeak Athletics (ZAV-APPT-012)', 'BluePeak Athletics'), 'Product demo')
  assert.equal(activityTitle('Send revised proposal - opportunity 07 (ZAV-TASK-031)'), 'Send revised proposal')
  assert.equal(activityTitle('Lunch with the buyer - Q3 plan', 'BluePeak Athletics'), 'Lunch with the buyer - Q3 plan')
  assert.equal(activityTitle('Call Alex'), 'Call Alex')
})
test('niceScale returns round ticks that cover the maximum', () => {
  assert.deepEqual(niceScale(0), { top: 1, ticks: [0, 1] })
  const scale = niceScale(930000)
  assert.ok(scale.top >= 930000)
  assert.equal(scale.ticks[0], 0)
  assert.equal(scale.ticks.at(-1), scale.top)
  assert.ok(scale.ticks.length >= 3 && scale.ticks.length <= 6)
})
test('monthlyOutlook buckets open deals by close month with overdue and later buckets', () => {
  const deals = [
    deal('a', '2026-10-20', 100000),
    deal('b', '2026-11-28', 200000, { stage: CHOICE + 3 }),
    deal('c', '2026-12-02', 50000),
    deal('d', '2028-06-01', 80000),
    deal('e', '2026-11-10', 999999, { status: CHOICE + 1 }),
    deal('f', '', 70000),
  ]
  const outlook = monthlyOutlook(deals, 'stage', { now })
  assert.deepEqual(outlook.buckets.map(b => b.key).slice(0, 3), ['overdue', '2026-11', '2026-12'])
  assert.equal(outlook.buckets.at(-1).key, 'later')
  assert.equal(outlook.buckets.length, 14)
  assert.equal(outlook.total, 430000)
  const november = outlook.buckets[1]
  assert.equal(november.total, 200000)
  assert.equal(november.segments[outlook.categories.indexOf('Close')], 200000)
  const weighted = monthlyOutlook(deals, 'stage', { now, weighted: true })
  assert.equal(weighted.total, 215000)
  assert.equal(weightedValue({ value: 200000, probability: 150 }), 200000)
})
test('monthlyOutlook adds a Not set category only when needed', () => {
  assert.ok(!monthlyOutlook([deal('a', '2026-12-01', 1)], 'product', { now }).categories.includes('Not set'))
  const outlook = monthlyOutlook([deal('a', '2026-12-01', 1, { product: '' })], 'product', { now })
  assert.equal(outlook.categories.at(-1), 'Not set')
  assert.equal(dealCategory(deal('x', '', 1, { forecast: '' }), 'forecast'), 'Not set')
})
test('sellerTimeline groups pending work and expected closes into four weeks', () => {
  const activities = [
    { id: '1', kind: 'appointment', state: 0, name: 'Demo', start: '2026-11-06T15:00:00Z', end: '2026-11-06T16:00:00Z', parentKind: 'deal', parentId: 'b', parentName: 'Account b' },
    { id: '2', kind: 'task', state: 0, name: 'Send pricing', start: '', end: '2026-11-04T09:00:00Z', parentKind: 'deal', parentId: 'b', parentName: 'Account b' },
    { id: '3', kind: 'task', state: 0, name: 'Old follow-up', start: '', end: '2026-10-01T09:00:00Z', parentKind: 'deal', parentId: 'b', parentName: 'Account b' },
    { id: '4', kind: 'task', state: 1, name: 'Done', start: '', end: '2026-11-07T09:00:00Z', parentKind: 'deal', parentId: 'b', parentName: 'Account b' },
    { id: '5', kind: 'note', state: 0, name: 'Note', start: '', end: '', parentKind: 'lead', parentId: 'l', parentName: 'Lead' },
    { id: '6', kind: 'appointment', state: 0, name: 'Other seller', start: '2026-11-10T15:00:00Z', end: '', parentKind: 'deal', parentId: 'z', parentName: 'Account z' },
  ]
  const { weeks, overdue } = sellerTimeline(activities, [deal('b', '2026-11-18', 1)], { now })
  assert.equal(weeks.length, 4)
  assert.equal(weeks[0].start, '2026-11-02')
  assert.equal(weeks[0].label, 'This week')
  assert.deepEqual(weeks[0].items.map(i => i.title), ['Send pricing', 'Demo'])
  assert.ok(weeks[0].items[0].late)
  assert.deepEqual(weeks[1].items.map(i => i.kind), ['appointment'])
  assert.deepEqual(weeks[2].items.map(i => i.kind), ['close'])
  assert.equal(overdue, 1)
  const mine = sellerTimeline(activities, [], { now, dealIds: new Set(['b']) })
  assert.equal(mine.weeks[1].items.length, 0)
})
