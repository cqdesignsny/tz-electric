// Probe a lead's note/update endpoints. Re-uses the existing test lead
// created by probe-hcp-write.mjs. Pass the lead id as arg.

const KEY = process.env.HOUSECALL_PRO_API_KEY
if (!KEY) { console.error('No key'); process.exit(1) }
const BASE = 'https://api.housecallpro.com'
const LEAD_ID = process.argv[2]
if (!LEAD_ID) { console.error('Usage: node probe-hcp-lead-notes.mjs <lead_id>'); process.exit(1) }

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, text: await res.text() }
}

console.log(`\n=== Probing endpoints on lead ${LEAD_ID} ===\n`)

// Try POST /leads/{id}/notes
const noteCandidates = [
  { method: 'POST', path: `/leads/${LEAD_ID}/notes`, body: { content: 'POST /leads/:id/notes content' } },
  { method: 'POST', path: `/leads/${LEAD_ID}/notes`, body: { note: 'POST /leads/:id/notes note' } },
  { method: 'POST', path: `/leads/${LEAD_ID}/comments`, body: { content: 'POST /leads/:id/comments content' } },
  // PATCH/PUT to update the lead with notes
  { method: 'PATCH', path: `/leads/${LEAD_ID}`, body: { notes: 'PATCH lead notes' } },
  { method: 'PUT', path: `/leads/${LEAD_ID}`, body: { notes: 'PUT lead notes' } },
  { method: 'PATCH', path: `/leads/${LEAD_ID}`, body: { additional_notes: 'PATCH additional_notes' } },
  { method: 'PATCH', path: `/leads/${LEAD_ID}`, body: { description: 'PATCH description' } },
  { method: 'PATCH', path: `/leads/${LEAD_ID}`, body: { service_details: 'PATCH service_details' } },
  { method: 'PATCH', path: `/leads/${LEAD_ID}`, body: { customer_availability: 'PATCH availability' } },
]

for (const c of noteCandidates) {
  const r = await call(c.method, c.path, c.body)
  const summary = r.text.length > 200 ? r.text.slice(0, 200) + '…' : r.text
  console.log(`${c.method} ${c.path} → ${r.status}`)
  console.log(`  body sent: ${JSON.stringify(c.body)}`)
  console.log(`  resp: ${summary}\n`)
}

console.log('\n=== Final read-back ===\n')
const final = await call('GET', `/leads/${LEAD_ID}`)
console.log(final.text.slice(0, 3500))
