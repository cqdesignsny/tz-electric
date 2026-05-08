// Try to clean up everything the probe scripts created.

const KEY = process.env.HOUSECALL_PRO_API_KEY
const BASE = 'https://api.housecallpro.com'

async function call(method, path) {
  const res = await fetch(`${BASE}${path}`, {
    method, headers: { Authorization: `Bearer ${KEY}` },
  })
  const text = await res.text()
  return { status: res.status, text: text.slice(0, 200) }
}

// All the test records produced by the probe runs above.
const estimates = [
  'csr_0de49736b6d847e68d09e83252109014', // 19999 (business_unit_id: HVAC)
  'csr_3463bcc84210418f95713dd4a2b186ab', // 20000 (business_unit: HVAC)
  'csr_03a18eb11ac247d3a84b8ed8395e7dd1', // 20001 (business_unit_name: HVAC)
  'csr_41f84d4571024bd0b742e988c90a2928', // 20002 (estimate_fields.business_unit: HVAC)
  'csr_50ea94f3df7a4d94b87acabfab153773', // (job_type_uuid)
]
const leads = [
  'lea_452f8f09ac2b4fe2a901fd5a121144b9', // ZZTest Probe lead #40
]
// We may also have a lead2 from earlier - try to find it by listing leads with our tag

console.log('=== Try DELETE on test estimates ===')
for (const id of estimates) {
  const r = await call('DELETE', `/estimates/${id}`)
  console.log(`DELETE /estimates/${id} → ${r.status} ${r.text.slice(0, 120)}`)
}

console.log('\n=== Try DELETE on test leads ===')
for (const id of leads) {
  const r = await call('DELETE', `/leads/${id}`)
  console.log(`DELETE /leads/${id} → ${r.status} ${r.text.slice(0, 120)}`)
}

console.log('\n=== List ZZ-PROBE-tagged records still present ===')
const list = await fetch(`${BASE}/leads?page=1&page_size=10`, {
  headers: { Authorization: `Bearer ${KEY}` },
})
const j = await list.json()
const probes = (j.leads || []).filter(l =>
  (l.tags || []).some(t => t.startsWith('ZZ-PROBE'))
)
console.log(`Probe-tagged leads remaining: ${probes.length}`)
for (const p of probes) console.log(`  ${p.id} | #${p.number} | ${p.customer.first_name} ${p.customer.last_name}`)
