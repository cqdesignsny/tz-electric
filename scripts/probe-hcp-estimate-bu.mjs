// Probe estimate creation to find the right business_unit + job_type field
// names. Also re-attempts job_fields on the lead via re-creation since the
// existing test customer already has lead #40 attached.

const KEY = process.env.HOUSECALL_PRO_API_KEY
if (!KEY) { console.error('No key'); process.exit(1) }
const BASE = 'https://api.housecallpro.com'
const CUSTOMER_ID = process.argv[2]
if (!CUSTOMER_ID) { console.error('Usage: node probe-hcp-estimate-bu.mjs <customer_id>'); process.exit(1) }

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    console.error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`)
    return null
  }
  try { return JSON.parse(text) } catch { return text }
}

// 1. Get the existing customer record so we know what's there
console.log('\n=== 1. Read customer ===\n')
const cust = await api('GET', `/customers/${CUSTOMER_ID}`)
console.log(JSON.stringify(cust, null, 2).slice(0, 800))

// 2. Look at any existing estimate to learn fields used by the office UI
//    (read the latest estimates list to see if any have job_type / business_unit set)
console.log('\n=== 2. Look at recent estimates to see populated fields ===\n')
const list = await api('GET', '/estimates?page=1&page_size=20')
const populated = (list?.estimates || []).filter(e =>
  (e.estimate_fields?.business_unit) || (e.estimate_fields?.job_type)
)
console.log(`Estimates with business_unit or job_type set: ${populated.length} of ${list?.estimates?.length || 0}`)
for (const e of populated.slice(0, 3)) {
  console.log(`  Estimate #${e.estimate_number}: estimate_fields = ${JSON.stringify(e.estimate_fields)}`)
}

// Try a sample of all 20 to see the field shape when populated
const anyShape = (list?.estimates || []).find(e => e.estimate_fields)?.estimate_fields
console.log(`First estimate.estimate_fields shape: ${JSON.stringify(anyShape)}`)

// 3. Create a test estimate with a bunch of candidate BU/JT field names
console.log('\n=== 3. Create test estimate with candidate field names ===\n')
const est = await api('POST', '/estimates', {
  customer_id: CUSTOMER_ID,
  options: [{ name: 'ZZ-PROBE — please delete', tags: ['ZZ-PROBE-DELETE-ME'] }],
  // Candidate top-level fields
  business_unit: 'HVAC',
  business_unit_id: 'HVAC',
  business_unit_uuid: 'HVAC',
  business_unit_name: 'HVAC',
  job_type: 'Mini-split installation',
  job_type_id: 'Mini-split installation',
  job_type_uuid: 'Mini-split installation',
  job_type_name: 'Mini-split installation',
  estimate_fields: {
    job_type: 'Mini-split installation',
    business_unit: 'HVAC',
    business_unit_uuid: 'HVAC',
  },
  job_fields: {
    job_type_uuid: 'Mini-split installation',
    business_unit_uuid: 'HVAC',
  },
})
console.log('CREATE response:')
console.log(JSON.stringify(est, null, 2).slice(0, 3000))

if (!est?.id) { console.error('No estimate id, abort'); process.exit(1) }

console.log(`\n=== 4. Read back estimate ${est.id} ===\n`)
const back = await api('GET', `/estimates/${est.id}`)
console.log(JSON.stringify(back, null, 2).slice(0, 3500))

// Check what populated
console.log('\n=== 5. What stuck on the estimate? ===\n')
const ef = back?.estimate_fields
console.log(`estimate_fields: ${JSON.stringify(ef)}`)

// 6. Probe the leads endpoint with a job_fields nested object on create
//    (using a new test customer to avoid mixing with the existing lead 40)
console.log('\n=== 6. Re-test /leads with job_fields nested ===\n')
const lead2 = await api('POST', '/leads', {
  customer: {
    first_name: 'ZZTest',
    last_name: `Probe2-${Date.now()}`,
    mobile_number: '5555550299',
    email: `zzprobe2+${Date.now()}@example.com`,
  },
  tags: ['ZZ-PROBE-DELETE-ME'],
  job_fields: {
    job_type_uuid: 'HVAC',
    business_unit_uuid: 'HVAC',
  },
})
console.log(JSON.stringify(lead2, null, 2).slice(0, 1500))
console.log(`\nLead2 job_fields: ${JSON.stringify(lead2?.job_fields)}`)

console.log('\n=== Cleanup IDs to delete: ===')
console.log(`Estimate id: ${est?.id}`)
console.log(`Lead2 id: ${lead2?.id} (customer ${lead2?.customer?.id})`)
