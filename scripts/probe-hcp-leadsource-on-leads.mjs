// Test if /leads POST accepts lead_source AND if locked presets like
// "Lead Form", "Online Booking", "Reserve with Google" trigger different
// Inbox UI behavior than plain "Website" / "API Leads".

const KEY = process.env.HOUSECALL_PRO_API_KEY
const BASE = 'https://api.housecallpro.com'

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

const stamp = Date.now()
let n = 0

async function tryLead(label, body) {
  n++
  console.log(`\n--- ${n}. ${label} ---`)
  const lead = await api('POST', '/leads', {
    customer: {
      first_name: 'ZZTest',
      last_name: `LSProbe-${stamp}-${n}`,
      mobile_number: '5555550' + String(200 + n).padStart(3, '0'),
      email: `zzls+${stamp}+${n}@example.com`,
    },
    tags: ['ZZ-PROBE-DELETE-ME', label],
    ...body,
  })
  if (!lead?.id) {
    console.log(`  POST failed`)
    return
  }
  const back = await api('GET', `/leads/${lead.id}`)
  console.log(`  lead id: ${lead.id}`)
  console.log(`  read-back lead_source: ${JSON.stringify(back?.lead_source)}`)
  console.log(`  pipeline_status: ${JSON.stringify(back?.pipeline_status)}`)
  // Look for any populated extra fields
  const flat = JSON.stringify(back || {})
  const candidateValues = ['custom-availability-marker', 'custom-summary-marker', 'custom-notes-marker', 'service-details-marker']
  for (const v of candidateValues) {
    if (flat.includes(v)) console.log(`  PERSISTED: "${v}"`)
  }
}

// Try every locked preset as a lead_source value
await tryLead('Lead Form (preset)', {
  lead_source: 'Lead Form',
  notes: 'custom-notes-marker',
  additional_notes: 'custom-notes-marker',
  service_details: 'service-details-marker',
  customer_availability: 'custom-availability-marker',
  summary: 'custom-summary-marker',
})
await tryLead('Online Booking (preset)', {
  lead_source: 'Online Booking',
  notes: 'custom-notes-marker',
})
await tryLead('CSR AI (preset)', {
  lead_source: 'CSR AI',
  notes: 'custom-notes-marker',
  additional_notes: 'custom-notes-marker',
})
await tryLead('Reserve with Google (locked, copying Google)', {
  lead_source: 'Reserve with Google',
  notes: 'custom-notes-marker',
})
// Use the UUID instead of the name for "Lead Form"
await tryLead('Lead Form by UUID', {
  lead_source_id: 'lsrc_020084495efb4e35860fe666cee60b93',
  notes: 'custom-notes-marker',
})
await tryLead('Lead Form by lead_source_uuid', {
  lead_source_uuid: 'lsrc_020084495efb4e35860fe666cee60b93',
  notes: 'custom-notes-marker',
})

console.log('\n=== Cleanup IDs above are tagged ZZ-PROBE-DELETE-ME ===')
