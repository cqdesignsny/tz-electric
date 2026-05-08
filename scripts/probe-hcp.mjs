// One-off HCP API probe to learn field shapes before we wire new write-paths.
// Reads existing records only (no writes) so the office doesn't end up with
// test cruft. Run: `node --env-file=.env.local scripts/probe-hcp.mjs`.

const KEY = process.env.HOUSECALL_PRO_API_KEY
if (!KEY) {
  console.error('HOUSECALL_PRO_API_KEY not set. Source .env.local first.')
  process.exit(1)
}

const BASE = 'https://api.housecallpro.com'

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  })
  const text = await res.text()
  if (!res.ok) {
    console.error(`GET ${path} → ${res.status}`)
    console.error(text.slice(0, 500))
    return null
  }
  try { return JSON.parse(text) } catch { return text }
}

console.log('\n========== Business Units ==========\n')
const bu = await get('/business_units')
console.log(JSON.stringify(bu, null, 2).slice(0, 3000))

console.log('\n========== Most recent lead (top of /leads) ==========\n')
const leads = await get('/leads?page=1&page_size=1')
console.log(JSON.stringify(leads, null, 2).slice(0, 5000))

console.log('\n========== Most recent estimate (top of /estimates) ==========\n')
const ests = await get('/estimates?page=1&page_size=1')
console.log(JSON.stringify(ests, null, 2).slice(0, 6000))

console.log('\n========== Done ==========\n')
