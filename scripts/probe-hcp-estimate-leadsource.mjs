// Verify that setting lead_source + customer_availability on an /estimates
// POST sticks. If it does, we can drop the redundant /leads POST entirely
// and rely on estimates with rich option.notes.

const KEY = process.env.HOUSECALL_PRO_API_KEY
const BASE = 'https://api.housecallpro.com'
const CUSTOMER_ID = process.argv[2] || 'cus_170b17b36d79494aa4ee25c4b50ebf56'

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) console.error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`)
  try { return JSON.parse(text) } catch { return text }
}

console.log('\n=== Test: estimate with lead_source + customer_availability ===\n')
const candidates = [
  { lead_source: 'Website' },
  { lead_source: 'TZ AI Agent' },
  { lead_source: 'API Leads' },
  { lead_source: 'Web Form' },
  { customer_availability: 'Weekdays 9am-5pm' },
  { customer_availability: 'Thu 5/8 between 9AM-12PM' },
  { lead_source: 'Website', customer_availability: 'Anytime', summary: 'Mini-split estimate for Catskill home' },
]

for (const fields of candidates) {
  const r = await api('POST', '/estimates', {
    customer_id: CUSTOMER_ID,
    options: [{ name: 'ZZ-PROBE-LS — please delete', tags: ['ZZ-PROBE-DELETE-ME'] }],
    ...fields,
  })
  if (!r?.id) continue
  // Read back
  const back = await api('GET', `/estimates/${r.id}`)
  console.log(`SENT: ${JSON.stringify(fields)}`)
  console.log(`  estimate id: ${r.id}`)
  console.log(`  read-back lead_source: ${JSON.stringify(back?.lead_source)}`)
  // dump anything that matches our probe values
  const flat = JSON.stringify(back || {})
  for (const v of Object.values(fields)) {
    if (typeof v === 'string' && flat.includes(v)) {
      console.log(`  PERSISTED value: "${v}"`)
    }
  }
  console.log('')
}
