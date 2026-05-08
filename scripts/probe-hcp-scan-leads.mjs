// Pull every lead and look for any with populated note/detail fields. If
// the office has manually added a lead with "Service details" filled in,
// that lead's API response should show us where in the schema those notes
// land.

const KEY = process.env.HOUSECALL_PRO_API_KEY
const BASE = 'https://api.housecallpro.com'

async function get(path) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${KEY}` } })
  return r.ok ? r.json() : null
}

let page = 1
const allLeads = []
while (true) {
  const data = await get(`/leads?page=${page}&page_size=20`)
  if (!data?.leads?.length) break
  allLeads.push(...data.leads)
  if (page >= (data.total_pages || 1)) break
  page++
}
console.log(`\nFetched ${allLeads.length} leads. Looking for any with populated optional fields…\n`)

// Collect every key that ever has a non-null/non-empty value
const fieldsSeen = new Map()
for (const lead of allLeads) {
  for (const [k, v] of Object.entries(lead)) {
    if (v == null) continue
    if (typeof v === 'object' && Object.keys(v).length === 0) continue
    if (Array.isArray(v) && v.length === 0) continue
    if (!fieldsSeen.has(k)) fieldsSeen.set(k, [])
    fieldsSeen.get(k).push({ id: lead.id, num: lead.number, sample: typeof v === 'string' ? v.slice(0, 80) : v })
  }
}

console.log('=== Top-level fields with at least one non-empty value across all leads ===')
for (const [k, hits] of fieldsSeen) {
  console.log(`  ${k}: ${hits.length} leads`)
}

// Specifically look for any lead whose lead_source is non-null. Tyler's
// screenshot shows "Lead Source: API Leads" so the UI must be deriving it
// from somewhere even when the API returns null.
console.log('\n=== Leads with non-null lead_source ===')
const sourced = allLeads.filter(l => l.lead_source)
console.log(`Count: ${sourced.length}`)
sourced.slice(0, 5).forEach(l => console.log(`  #${l.number} (${l.id}): "${l.lead_source}"`))

// Also dump any lead that has fields beyond the standard set we already know
const STANDARD_KEYS = new Set([
  'id', 'number', 'customer', 'address', 'lead_source', 'status',
  'pipeline_status', 'tags', 'total_amount', 'assigned_employee',
  'conversions', 'lost_at', 'job_fields', 'company_name', 'company_id',
])
console.log('\n=== Leads with NON-STANDARD top-level keys ===')
for (const lead of allLeads) {
  const extra = Object.keys(lead).filter(k => !STANDARD_KEYS.has(k))
  if (extra.length > 0) {
    console.log(`  #${lead.number}: extra keys = ${JSON.stringify(extra)}`)
  }
}

// Read one lead in detail (not via list) to see if list endpoint trims fields
const detailed = await get(`/leads/${allLeads[0].id}`)
console.log('\n=== First lead, fetched via /leads/{id} (not list) ===')
console.log('Top-level keys:', Object.keys(detailed || {}).join(', '))
console.log('Full:', JSON.stringify(detailed, null, 2).slice(0, 2000))

// Look at one lead with the most tags (likely an office-added one with rich data)
const richest = [...allLeads].sort((a, b) => (b.tags?.length || 0) - (a.tags?.length || 0))[0]
console.log(`\n=== Richest-tagged lead: #${richest.number} (${richest.tags?.length || 0} tags) ===`)
const richDetail = await get(`/leads/${richest.id}`)
console.log(JSON.stringify(richDetail, null, 2).slice(0, 2500))
