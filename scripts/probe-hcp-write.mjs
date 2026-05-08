// HCP write-probe. Creates ONE clearly-marked test lead with a bunch of
// candidate field names and reads back which ones persisted. Run:
// `node --env-file=.env.local scripts/probe-hcp-write.mjs`.
//
// After running, Cesar / Tyler can delete the test customer + lead in HCP.
// Look for first_name "ZZTest" + last_name with the timestamp.

const KEY = process.env.HOUSECALL_PRO_API_KEY
if (!KEY) {
  console.error('HOUSECALL_PRO_API_KEY not set.')
  process.exit(1)
}
const BASE = 'https://api.housecallpro.com'

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    console.error(`${method} ${path} → ${res.status}`)
    console.error(text.slice(0, 600))
    return null
  }
  try { return JSON.parse(text) } catch { return text }
}

console.log('\n========== 1. Try variations of business-units endpoint ==========\n')
for (const path of [
  '/business_units',
  '/companies/business_units',
  '/business-units',
  '/job_types',
  '/jobs/types',
  '/companies/job_types',
]) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${KEY}` } })
  console.log(`GET ${path} → ${r.status}`)
}

console.log('\n========== 2. CREATE test lead with candidate field names ==========\n')

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const lead = await api('POST', '/leads', {
  customer: {
    first_name: 'ZZTest',
    last_name: `Probe-${stamp}`,
    mobile_number: '5555550199',
    email: `zzprobe+${Date.now()}@example.com`,
    notes: 'CUSTOMER NOTES: probe test, please delete',
  },
  // Candidate top-level fields. Most will be silently ignored. We GET back
  // and see which ones persisted.
  notes: 'TOP-LEVEL NOTES: Service details. Mini-split install on 1500 sqft cape. Active customer. Wants estimate this week.',
  additional_notes: 'TOP-LEVEL ADDITIONAL_NOTES: same content via additional_notes',
  service_details: 'TOP-LEVEL SERVICE_DETAILS: same content via service_details',
  description: 'TOP-LEVEL DESCRIPTION: short summary line',
  summary: 'TOP-LEVEL SUMMARY: short summary line',
  customer_availability: 'Weekdays after 4pm',
  lead_source: 'TZ AI Agent',
  pipeline_status: 'New Lead',
  tags: ['ZZ-PROBE-DELETE-ME', 'Channel: probe', 'Service: Mini-split'],
  job_fields: {
    job_type_uuid: null,
    business_unit_uuid: null,
  },
  // address omitted for now
})

if (!lead) {
  console.error('Lead create failed. Stopping.')
  process.exit(1)
}

const created = lead?.lead || lead
console.log('Created lead. Returned shape:')
console.log(JSON.stringify(created, null, 2).slice(0, 4000))

const leadId = created?.id
if (!leadId) {
  console.error('No lead id returned, cannot read back.')
  process.exit(1)
}

console.log(`\n========== 3. Read back lead ${leadId} ==========\n`)
const readback = await api('GET', `/leads/${leadId}`)
console.log(JSON.stringify(readback, null, 2).slice(0, 4500))

console.log('\n========== 4. Identify which probe fields stuck ==========\n')
const flat = JSON.stringify(readback || {}, null, 2)
const probes = [
  ['top-level notes', 'TOP-LEVEL NOTES'],
  ['top-level additional_notes', 'TOP-LEVEL ADDITIONAL_NOTES'],
  ['top-level service_details', 'TOP-LEVEL SERVICE_DETAILS'],
  ['top-level description', 'TOP-LEVEL DESCRIPTION'],
  ['top-level summary', 'TOP-LEVEL SUMMARY'],
  ['customer.notes', 'CUSTOMER NOTES'],
  ['customer_availability', 'Weekdays after 4pm'],
  ['lead_source override', 'TZ AI Agent'],
  ['pipeline_status override', 'New Lead'],
]
for (const [label, marker] of probes) {
  const stuck = flat.includes(marker)
  console.log(`${stuck ? '  PERSISTED' : '  dropped  '}: ${label}`)
}

console.log('\n========== Done. Delete this test lead in HCP. ==========')
console.log(`Lead id: ${leadId}`)
console.log(`Customer id: ${created?.customer?.id || 'unknown'}`)
