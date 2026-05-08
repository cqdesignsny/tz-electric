// End-to-end test: submit a test lead via the production form API,
// then read back the HCP estimate to verify lead_source + option.notes
// + tags are all populated correctly.
//
// Run: node --env-file=.env.local scripts/e2e-test-lead.mjs

const KEY = process.env.HOUSECALL_PRO_API_KEY
if (!KEY) { console.error('No HCP key'); process.exit(1) }
const HCP_BASE = 'https://api.housecallpro.com'
const SITE = process.argv[2] || 'https://tzelectricinc.com'

const stamp = new Date().toISOString().replace(/[:.]/g, '-')

// Realistic-shaped payload that mirrors what the actual /quote form posts.
// First name "ZZTest" so Cesar can find and delete it.
const payload = {
  serviceKey: 'mini-split',
  serviceLabel: 'Mini-Split',
  qualification: {
    heatingOrCooling: 'Cooling only',
    scope: 'Whole house',
    urgency: 'This week',
    homeAge: '50-100 years',
    sqft: '1500',
    bedrooms: '3',
  },
  firstName: 'ZZTest',
  lastName: `E2E-${stamp}`,
  email: `zzprobe+${Date.now()}@example.com`,
  phone: '5555550199',
  street: '123 Test Lane',
  city: 'Catskill',
  state: 'NY',
  zip: '12414',
  ownership: 'homeowner',
  customerNotes: 'This is an end-to-end test submission, please delete in HCP cleanup.',
  referralSource: 'Internal e2e probe — please delete',
  tracking: {
    utmSource: 'e2e-test',
    utmMedium: 'probe',
    utmCampaign: 'lead-source-rollout',
    referrer: 'internal-probe',
    landingPage: '/quote',
    landingAt: new Date().toISOString(),
    firstTouch: {
      utmSource: 'e2e-test',
      utmMedium: 'probe',
      utmCampaign: 'lead-source-rollout',
    },
  },
}

console.log(`\n=== 1. POST ${SITE}/api/leads/submit ===\n`)
const submitRes = await fetch(`${SITE}/api/leads/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
const submitBody = await submitRes.text()
console.log(`Status: ${submitRes.status}`)
console.log(`Body: ${submitBody.slice(0, 1500)}`)

let result
try { result = JSON.parse(submitBody) } catch {
  console.error('Could not parse response. Vercel may not have deployed yet.')
  process.exit(1)
}

if (!result.ok || !result.hcpEstimateId) {
  console.error('Submit did not produce an HCP estimate. Check the response above.')
  process.exit(1)
}

const hasInboxLeadField = 'hcpInboxLeadId' in result
console.log(`\nresponse contains hcpInboxLeadId? ${hasInboxLeadField} (should be false on new code)`)
console.log(`Estimate id: ${result.hcpEstimateId}`)
console.log(`Customer id: ${result.hcpCustomerId}`)

console.log(`\n=== 2. Read back the estimate from HCP ===\n`)
const estRes = await fetch(`${HCP_BASE}/estimates/${result.hcpEstimateId}`, {
  headers: { Authorization: `Bearer ${KEY}` },
})
const estimate = await estRes.json()
console.log(`Estimate #${estimate.estimate_number}`)
console.log(`  lead_source: ${JSON.stringify(estimate.lead_source)}`)
console.log(`  estimate_fields: ${JSON.stringify(estimate.estimate_fields)}`)
console.log(`  work_status: ${estimate.work_status}`)
console.log(`  customer: ${estimate.customer?.first_name} ${estimate.customer?.last_name}`)

const opt = estimate.options?.[0]
console.log(`\n  option name: ${opt?.name}`)
console.log(`  option tags (${opt?.tags?.length || 0}):`)
for (const t of opt?.tags || []) console.log(`    - ${t}`)
console.log(`\n  option notes (${opt?.notes?.length || 0}):`)
for (const n of opt?.notes || []) {
  console.log(`    --- note ${n.id} ---`)
  console.log(n.content.split('\n').map(l => '    ' + l).join('\n'))
}

console.log(`\n=== 3. Verdict ===\n`)
const checks = {
  'estimate created': !!estimate.id,
  'lead_source = "Website"': estimate.lead_source === 'Website',
  'option has notes': (opt?.notes?.length || 0) > 0,
  'first tag is summary (Service · City format)': /·/.test(opt?.tags?.[0] || ''),
  'tags include "Web Form"': (opt?.tags || []).includes('Web Form'),
  'old hcpInboxLeadId field gone': !hasInboxLeadField,
}
for (const [k, v] of Object.entries(checks)) {
  console.log(`  ${v ? '✓' : '✗'} ${k}`)
}
const passed = Object.values(checks).filter(Boolean).length
console.log(`\n${passed} / ${Object.keys(checks).length} checks passed.`)

console.log(`\n=== Cleanup IDs (delete these in HCP UI) ===`)
console.log(`Customer: ${estimate.customer?.id}`)
console.log(`Estimate: ${estimate.id} (#${estimate.estimate_number})`)
