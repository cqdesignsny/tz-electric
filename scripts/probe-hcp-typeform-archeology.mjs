// Archeology dig: how did Typeform-era leads land in HCP? Look at old leads
// for any fields/shapes I missed, and probe for non-/leads ingestion paths.

const KEY = process.env.HOUSECALL_PRO_API_KEY
const BASE = 'https://api.housecallpro.com'

async function get(path) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${KEY}` } })
  return { status: r.status, json: r.ok ? await r.json() : null }
}

console.log('\n=== 1. Probe non-/leads ingestion endpoints ===\n')
for (const p of [
  '/online_bookings',
  '/online-bookings',
  '/bookings',
  '/appointments',
  '/booking_requests',
  '/service_requests',
  '/inquiries',
  '/lead_sources',  // list available preset values?
  '/companies/76176a87-d8b1-43b8-9052-90aaa02536a6/lead_sources',
  '/job_inbox_channels',
  '/email_leads',
  '/integrations',
]) {
  const r = await get(p)
  console.log(`GET ${p} → ${r.status}${r.json ? '  ' + JSON.stringify(r.json).slice(0, 200) : ''}`)
}

console.log('\n=== 2. Pull all 35 leads + look for ANY richer field ===\n')
let page = 1
const all = []
while (true) {
  const data = await get(`/leads?page=${page}&page_size=20`)
  if (!data.json?.leads?.length) break
  all.push(...data.json.leads)
  if (page >= (data.json.total_pages || 1)) break
  page++
}
// Sort oldest to newest
all.sort((a, b) => (a.customer?.created_at || '').localeCompare(b.customer?.created_at || ''))

console.log(`Total leads: ${all.length}\n`)
console.log('Lead # | Customer | Created | lead_source | pipeline | tags')
for (const l of all) {
  const created = (l.customer?.created_at || '').slice(0, 10)
  const tags = (l.tags || []).slice(0, 2).join('; ') + (l.tags?.length > 2 ? `... (+${l.tags.length - 2})` : '')
  console.log(`#${String(l.number).padStart(3)} | ${(l.customer?.first_name + ' ' + l.customer?.last_name).slice(0, 25).padEnd(25)} | ${created} | ${(l.lead_source || '(null)').slice(0, 20).padEnd(20)} | ${(l.pipeline_status || '').slice(0, 12).padEnd(12)} | ${tags}`)
}

console.log('\n=== 3. Look at the OLDEST 3 leads in detail (pre-our-integration) ===\n')
for (const l of all.slice(0, 3)) {
  console.log(`\n--- Lead #${l.number} ${l.id} ---`)
  const detail = await get(`/leads/${l.id}`)
  console.log(JSON.stringify(detail.json, null, 2))
}

console.log('\n=== 4. Pull recent estimates that have populated notes (the Typeform-era ones) ===\n')
let page2 = 1
const estimatesWithNotes = []
while (page2 <= 10 && estimatesWithNotes.length < 5) {
  const data = await get(`/estimates?page=${page2}&page_size=20`)
  if (!data.json?.estimates?.length) break
  for (const e of data.json.estimates) {
    const noteCount = e.options?.[0]?.notes?.length || 0
    if (noteCount > 0 && e.lead_source) {
      estimatesWithNotes.push(e)
      if (estimatesWithNotes.length >= 5) break
    }
  }
  page2++
}
console.log(`Found ${estimatesWithNotes.length} estimates with lead_source AND notes:`)
for (const e of estimatesWithNotes) {
  console.log(`\n--- Estimate #${e.estimate_number} src="${e.lead_source}" ---`)
  console.log(`  customer: ${e.customer?.first_name} ${e.customer?.last_name}`)
  console.log(`  created: ${e.created_at}`)
  console.log(`  option name: ${e.options?.[0]?.name}`)
  console.log(`  option tags: ${JSON.stringify(e.options?.[0]?.tags)}`)
  console.log(`  notes:`)
  for (const n of e.options?.[0]?.notes || []) {
    console.log(`    "${n.content.slice(0, 200)}${n.content.length > 200 ? '…' : ''}"`)
  }
}
