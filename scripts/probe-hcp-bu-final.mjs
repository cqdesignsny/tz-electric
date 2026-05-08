// Final BU probe: try every plausible endpoint to find the business_unit
// UUIDs, and verify job_type_uuid sticks with a known-good UUID.

const KEY = process.env.HOUSECALL_PRO_API_KEY
const BASE = 'https://api.housecallpro.com'
const CUSTOMER_ID = process.argv[2]

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null; try { json = JSON.parse(text) } catch {}
  return { ok: res.ok, status: res.status, text, json }
}

console.log('\n=== Try every plausible BU endpoint ===\n')
const endpoints = [
  '/business_units',
  '/businessunits',
  '/v1/business_units',
  '/api/business_units',
  '/companies/76176a87-d8b1-43b8-9052-90aaa02536a6/business_units',
  '/company/business_units',
  '/companies/business_units',
  '/settings/business_units',
  '/employees',
  '/me',
  '/companies',
  '/company',
  '/account',
]
for (const p of endpoints) {
  const r = await api('GET', p)
  console.log(`GET ${p} → ${r.status}${r.ok ? '  ' + JSON.stringify(r.json).slice(0, 200) : ''}`)
}

console.log('\n=== Verify known job_type UUID sticks on estimate ===\n')
if (CUSTOMER_ID) {
  const installJobTypeUuid = 'jbt_49b24744485749d1814e4101904623f9' // "Install"
  const r = await api('POST', '/estimates', {
    customer_id: CUSTOMER_ID,
    options: [{ name: 'ZZ-PROBE — known job_type', tags: ['ZZ-PROBE-DELETE-ME'] }],
    job_type_uuid: installJobTypeUuid,
  })
  console.log(`POST /estimates with job_type_uuid → ${r.status}`)
  if (r.json) {
    console.log('estimate_fields on response:', JSON.stringify(r.json.estimate_fields))
    console.log('estimate id:', r.json.id)
  }

  // Read it back to be sure
  if (r.json?.id) {
    const back = await api('GET', `/estimates/${r.json.id}`)
    console.log('READBACK estimate_fields:', JSON.stringify(back.json?.estimate_fields))
  }

  // Now intentionally trigger a 422 to learn the valid BU UUIDs from the
  // error message (some APIs include valid choices in the error)
  console.log('\n=== Try invalid BU UUID, hope error reveals options ===\n')
  const r2 = await api('POST', '/estimates', {
    customer_id: CUSTOMER_ID,
    options: [{ name: 'probe', tags: ['ZZ-PROBE-DELETE-ME'] }],
    business_unit_uuid: 'not-a-real-uuid',
  })
  console.log(`status: ${r2.status}`)
  console.log(`response: ${r2.text.slice(0, 800)}`)
}
