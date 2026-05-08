// Find real business_unit UUIDs by sniffing existing jobs (which the office
// has been using for years) and isolate which estimate field name accepts BU.

const KEY = process.env.HOUSECALL_PRO_API_KEY
if (!KEY) { console.error('No key'); process.exit(1) }
const BASE = 'https://api.housecallpro.com'
const CUSTOMER_ID = process.argv[2]

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  return { ok: res.ok, status: res.status, text, json: text ? safeJson(text) : null }
}
function safeJson(s) { try { return JSON.parse(s) } catch { return null } }

console.log('\n=== 1. Sniff real jobs for business_unit and job_type UUIDs ===\n')
const jobs = await api('GET', '/jobs?page=1&page_size=50')
const found = { business_units: new Map(), job_types: new Map() }
for (const j of (jobs.json?.jobs || [])) {
  const bu = j.business_unit
  const jt = j.job_fields?.job_type || j.job_type
  if (bu && bu.uuid) found.business_units.set(bu.uuid, bu.name || bu)
  if (bu && bu.id) found.business_units.set(bu.id, bu.name || bu)
  if (typeof bu === 'string') found.business_units.set(bu, bu)
  if (jt && jt.uuid) found.job_types.set(jt.uuid, jt.name || jt)
  if (jt && jt.id) found.job_types.set(jt.id, jt.name || jt)
}
console.log(`business_units found across recent jobs: ${found.business_units.size}`)
for (const [id, name] of found.business_units) console.log(`  ${id} → ${name}`)
console.log(`job_types found: ${found.job_types.size}`)
for (const [id, name] of found.job_types) console.log(`  ${id} → ${name}`)

// Show the first job's full shape so we can understand the structure
const sample = jobs.json?.jobs?.[0]
if (sample) {
  console.log('\nFirst job (full shape, top-level keys):')
  console.log(Object.keys(sample))
  if (sample.business_unit) console.log('business_unit:', JSON.stringify(sample.business_unit, null, 2))
  if (sample.job_type) console.log('job_type:', JSON.stringify(sample.job_type, null, 2))
  if (sample.job_fields) console.log('job_fields:', JSON.stringify(sample.job_fields, null, 2))
}

console.log('\n=== 2. Isolate which estimate field accepts business_unit (one at a time) ===\n')
if (!CUSTOMER_ID) {
  console.log('Pass <customer_id> as arg to run write isolation. Skipping writes.')
  process.exit(0)
}

const candidates = [
  { business_unit_uuid: 'HVAC' },
  { business_unit_id: 'HVAC' },
  { business_unit: 'HVAC' },
  { business_unit_name: 'HVAC' },
  { job_fields: { business_unit_uuid: 'HVAC' } },
  { estimate_fields: { business_unit_uuid: 'HVAC' } },
  { estimate_fields: { business_unit: 'HVAC' } },
]

for (const fields of candidates) {
  const r = await api('POST', '/estimates', {
    customer_id: CUSTOMER_ID,
    options: [{ name: 'probe', tags: ['ZZ-PROBE-DELETE-ME'] }],
    ...fields,
  })
  const summary = r.text.length > 250 ? r.text.slice(0, 250) + '…' : r.text
  console.log(`fields=${JSON.stringify(fields)}`)
  console.log(`  → ${r.status} ${r.ok ? '(created, will need cleanup)' : ''}`)
  console.log(`  resp: ${summary}\n`)
}
