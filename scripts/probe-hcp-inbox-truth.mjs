// Find out exactly what shows in HCP's Inbox. Is it /leads, /estimates,
// or something else? Try every plausible "inbox" endpoint and see if our
// test estimate #20009 appears anywhere.

const KEY = process.env.HOUSECALL_PRO_API_KEY
const BASE = 'https://api.housecallpro.com'
const OUR_ESTIMATE = 'csr_6dc608d8d2704a3e8cab57fee3505dd2' // #20009 from e2e test
const MONICA_ESTIMATE = 'csr_db18f40077ed42238ab0e24d4a9e9f79' // #19981 Google
const MONICA_CUSTOMER = 'cus_cccef05add4140dca9f71a6b81f5573d'

async function get(path) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${KEY}` } })
  return { status: r.status, json: r.ok ? await r.json() : null, text: r.ok ? null : await r.text() }
}

console.log('\n=== 1. Try every plausible inbox / job-inbox endpoint ===\n')
for (const p of [
  '/job_inbox',
  '/job_inbox_leads',
  '/inbox',
  '/comms',
  '/communications',
  '/jobs/inbox',
  '/leads/inbox',
  '/conversions',
  '/lead_inbox',
]) {
  const r = await get(p)
  console.log(`GET ${p} → ${r.status}`)
  if (r.json) console.log(`  ${JSON.stringify(r.json).slice(0, 200)}`)
}

console.log('\n=== 2. Look for ALL records linked to Monica (the customer with the working Inbox card) ===\n')
const monicaLeads = await get(`/leads?customer_id=${MONICA_CUSTOMER}`)
const monicaEstimates = await get(`/estimates?customer_id=${MONICA_CUSTOMER}`)
const monicaJobs = await get(`/jobs?customer_id=${MONICA_CUSTOMER}`)
console.log(`Monica leads: ${monicaLeads.json?.leads?.length || 0}`)
for (const l of monicaLeads.json?.leads || []) console.log(`  ${l.id} #${l.number} src="${l.lead_source}"`)
console.log(`Monica estimates: ${monicaEstimates.json?.estimates?.length || 0}`)
for (const e of monicaEstimates.json?.estimates || []) console.log(`  ${e.id} #${e.estimate_number} src="${e.lead_source}"`)
console.log(`Monica jobs: ${monicaJobs.json?.jobs?.length || 0}`)
for (const j of monicaJobs.json?.jobs || []) console.log(`  ${j.id} #${j.invoice_number} src="${j.lead_source}"`)

console.log('\n=== 3. Compare: ZZTest customer records ===\n')
const ZZTEST = 'cus_170b17b36d79494aa4ee25c4b50ebf56'
const zzLeads = await get(`/leads?customer_id=${ZZTEST}`)
const zzEstimates = await get(`/estimates?customer_id=${ZZTEST}`)
console.log(`ZZTest leads: ${zzLeads.json?.leads?.length || 0}`)
for (const l of zzLeads.json?.leads || []) console.log(`  ${l.id} #${l.number} src="${l.lead_source}"`)
console.log(`ZZTest estimates (last 5): ${zzEstimates.json?.estimates?.length || 0}`)
for (const e of (zzEstimates.json?.estimates || []).slice(0, 5)) {
  console.log(`  ${e.id} #${e.estimate_number} src="${e.lead_source}" status=${e.work_status}`)
}

console.log('\n=== 4. Read latest 5 leads (the ones Tyler/office definitely sees in Inbox) ===\n')
const latest = await get('/leads?page=1&page_size=5')
for (const l of latest.json?.leads || []) {
  console.log(`  Lead #${l.number} ${l.id}`)
  console.log(`    customer: ${l.customer?.first_name} ${l.customer?.last_name}`)
  console.log(`    lead_source: "${l.lead_source}"`)
  console.log(`    pipeline_status: "${l.pipeline_status}"`)
  console.log(`    created via: customer.created_at=${l.customer?.created_at}`)
}

console.log('\n=== 5. Test: if I create a /leads POST too, does it pair with the estimate? ===\n')
// Don't actually create — just describe. The previous /leads POST flow
// created a separate Inbox entry; reverting to that is the obvious fix.
console.log('Plan: re-add /leads POST alongside the estimate so the Inbox card appears.')
