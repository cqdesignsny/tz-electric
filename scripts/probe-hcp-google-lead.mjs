// Find the Google-sourced lead in HCP and inspect what fields it actually
// has populated. The HCP UI shows it with services, customer_availability,
// summary, and additional_notes — those must come from somewhere.

const KEY = process.env.HOUSECALL_PRO_API_KEY
const BASE = 'https://api.housecallpro.com'

async function get(path) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${KEY}` } })
  if (!r.ok) {
    console.error(`GET ${path} → ${r.status}`)
    return null
  }
  return r.json()
}

// Pull every lead and find non-website ones (lead_source set, or pipeline_status
// suggesting external integration).
let page = 1
const allLeads = []
while (true) {
  const data = await get(`/leads?page=${page}&page_size=20`)
  if (!data?.leads?.length) break
  allLeads.push(...data.leads)
  if (page >= (data.total_pages || 1)) break
  page++
}

console.log(`\nTotal leads in account: ${allLeads.length}\n`)

// Group by lead_source
const sources = new Map()
for (const l of allLeads) {
  const src = l.lead_source || '(null)'
  if (!sources.has(src)) sources.set(src, [])
  sources.get(src).push(l)
}
console.log('=== Leads grouped by lead_source ===')
for (const [src, ls] of sources) {
  console.log(`  "${src}": ${ls.length} leads`)
}

// Now find the Google one — Monica Dalide per screenshot, estimate #19981
console.log('\n=== Searching for Monica Dalide / estimate 19981 ===')
const monica = allLeads.find(l =>
  (l.customer?.first_name || '').toLowerCase() === 'monica' &&
  (l.customer?.last_name || '').toLowerCase().includes('dalide')
)
console.log(`Found by name? ${monica ? 'YES — lead ' + monica.id : 'no'}`)

if (monica) {
  console.log('\n=== Monica lead, full record from /leads/{id} ===')
  const detail = await get(`/leads/${monica.id}`)
  console.log(JSON.stringify(detail, null, 2))
} else {
  // Try fetching estimate 19981 directly to find linked customer/lead
  console.log('\n=== Searching by estimate number 19981 ===')
  let p = 1
  let est = null
  while (p <= 20) {
    const ests = await get(`/estimates?page=${p}&page_size=50`)
    if (!ests?.estimates?.length) break
    est = ests.estimates.find(e => String(e.estimate_number) === '19981')
    if (est) break
    p++
  }
  if (est) {
    console.log(`Found estimate ${est.id}`)
    console.log(JSON.stringify(est, null, 2).slice(0, 4500))

    // Look for any lead linked to this customer
    const linked = allLeads.filter(l => l.customer?.id === est.customer?.id)
    console.log(`\nLeads linked to same customer: ${linked.length}`)
    for (const l of linked) {
      console.log(`  Lead ${l.id} (#${l.number}) lead_source="${l.lead_source}"`)
      const d = await get(`/leads/${l.id}`)
      console.log('  Full keys:', Object.keys(d || {}))
      // print every field with a non-null value
      for (const [k, v] of Object.entries(d || {})) {
        if (v == null) continue
        if (typeof v === 'object' && Object.keys(v).length === 0) continue
        if (Array.isArray(v) && v.length === 0) continue
        const preview = typeof v === 'string' ? v.slice(0, 100)
                      : typeof v === 'object' ? JSON.stringify(v).slice(0, 200)
                      : String(v)
        console.log(`    ${k}: ${preview}`)
      }
    }
  }
}

// Also look for any non-website lead and dump its full shape
console.log('\n=== All leads with lead_source != null, full details ===')
const externalLeads = allLeads.filter(l => l.lead_source)
for (const l of externalLeads.slice(0, 5)) {
  console.log(`\n--- Lead ${l.id} (#${l.number}) source="${l.lead_source}" ---`)
  const d = await get(`/leads/${l.id}`)
  console.log(JSON.stringify(d, null, 2))
}
