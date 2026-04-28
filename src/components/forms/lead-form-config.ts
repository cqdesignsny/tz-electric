/**
 * Lead form configuration. One source of truth for the service catalog,
 * qualification questions per service, and the pricing footnotes shown
 * inline.
 *
 * Question set is kept in lockstep with the old Typeform routing
 * (https://ghfs29y37tj.typeform.com/to/HDLXmnob) so the office and the
 * AI agents (SMS / voice / chat Claire) all collect the same fields.
 * Pricing ranges sourced from docs/agent-training-answers.md.
 * Permits are NOT included in any range (per default 10.6 #9).
 */

export type ServiceKey =
  | 'hvac'
  | 'electrical'
  | 'generator'
  | 'plumbing'
  | 'ev-charger'
  | 'surge'
  | 'other'

export type QuestionType = 'select' | 'radio' | 'text' | 'textarea'

export type Question = {
  id: string
  label: string
  type: QuestionType
  options?: string[]
  required?: boolean
  placeholder?: string
  /**
   * Optional show condition. The question only renders when the
   * specified prior question (`when`) has the answer in `equals`.
   * Used for the underground-conversion follow-up on electrical and
   * the residential / commercial split on generator.
   */
  showWhen?: { when: string; equals: string[] }
}

export type ServiceConfig = {
  key: ServiceKey
  label: string
  blurb: string
  priceFootnote?: string
  questions: Question[]
}

const URGENCY_OPTIONS = [
  'Urgent — needs attention now',
  'This week',
  'This month',
  'Just exploring / planning ahead',
]

const HOME_SIZE_OPTIONS = [
  'Under 1,000 sq ft',
  '1,000–1,500 sq ft',
  '1,500–2,500 sq ft',
  '2,500–3,500 sq ft',
  'Over 3,500 sq ft',
  'Not sure',
]

const SERVICE_SIZE_OPTIONS = [
  '60 amp',
  '100 amp',
  '150 amp',
  '200 amp',
  '320 / 400 amp',
  'Not sure',
]

const UTILITY_OPTIONS = [
  'Central Hudson',
  'NYSEG',
  'National Grid',
  'Orange & Rockland',
  'Other',
  'Not sure',
]

export const SERVICES: ServiceConfig[] = [
  {
    key: 'hvac',
    label: 'HVAC / Mini-Split',
    blurb: 'Heating, cooling, ductless mini-splits, heat pumps. Mitsubishi Diamond Elite installer.',
    priceFootnote: 'Repairs often same-day. New installs typically 1–5 weeks from approval.',
    questions: [
      {
        id: 'heatingOrCooling',
        label: 'Are you interested in just heating or both heating and cooling?',
        type: 'radio',
        required: true,
        options: ['Heating only', 'Cooling only', 'Both heating and cooling'],
      },
      {
        id: 'scope',
        label: 'What are you looking to do?',
        type: 'select',
        required: true,
        options: [
          'Heat and cool a single room',
          'Heat and cool multiple rooms',
          'Whole-home heating and cooling',
          'Replace existing equipment',
          'Repair existing equipment',
        ],
      },
      {
        id: 'coverage',
        label: 'Are you looking to install units throughout the home or in specific rooms?',
        type: 'radio',
        required: false,
        options: ['Throughout the home', 'Specific rooms only', 'Not sure'],
      },
      {
        id: 'homeSize',
        label: 'Approximate home size',
        type: 'select',
        required: true,
        options: HOME_SIZE_OPTIONS,
      },
      {
        id: 'currentSystem',
        label: 'Current heating / cooling system',
        type: 'select',
        required: false,
        options: [
          'Boiler',
          'Furnace',
          'Baseboard heat',
          'Radiators',
          'Central air',
          'Window AC units',
          'Existing mini-splits',
          'No current system',
          'Not sure',
        ],
      },
      {
        id: 'decommission',
        label: 'Are you looking to decommission your existing heating system?',
        type: 'radio',
        required: false,
        options: ['Yes', 'No', 'Not sure'],
      },
      {
        id: 'nyserda',
        label: 'Are you aware of the NYSERDA rebates that might be available?',
        type: 'radio',
        required: false,
        options: ['Yes', 'No', 'Want to learn more'],
      },
      {
        id: 'urgency',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: URGENCY_OPTIONS,
      },
    ],
  },
  {
    key: 'electrical',
    label: 'Electrical',
    blurb: 'Panel upgrades, rewires, lighting, outlets, switches, troubleshooting. Voted #1 in the Hudson Valley.',
    priceFootnote: 'Outlet / switch replacements $180–$380. Panel & service upgrades quoted on-site.',
    questions: [
      {
        id: 'scope',
        label: 'What are you looking to do?',
        type: 'select',
        required: true,
        options: [
          'Panel upgrade or service upgrade',
          'EV charger install',
          'Whole-house rewire',
          'Outlet / switch repair or replacement',
          'Lighting work',
          'Pool / hot tub wiring',
          'Whole-home surge protection',
          'Troubleshooting (something not working)',
          'Other electrical work',
        ],
      },
      {
        id: 'upgradeReason',
        label: 'Why are you looking to upgrade your service at this time?',
        type: 'select',
        required: false,
        options: [
          'Adding a major appliance (EV charger, hot tub, AC, etc.)',
          'Current panel is outdated / undersized',
          'Insurance or inspector required it',
          'Adding a generator',
          'Buying or selling the home',
          'Frequent breaker trips',
          'Other',
        ],
        showWhen: {
          when: 'scope',
          equals: ['Panel upgrade or service upgrade'],
        },
      },
      {
        id: 'serviceStyle',
        label: 'Is your existing service overhead or underground?',
        type: 'radio',
        required: false,
        options: ['Overhead', 'Underground', 'Not sure'],
        showWhen: {
          when: 'scope',
          equals: ['Panel upgrade or service upgrade'],
        },
      },
      {
        id: 'undergroundConversion',
        label: 'Are you looking to change your service from overhead to underground?',
        type: 'radio',
        required: false,
        options: ['Yes', 'No', 'Maybe / open to it'],
        showWhen: { when: 'serviceStyle', equals: ['Overhead'] },
      },
      {
        id: 'serviceSize',
        label: 'Current electrical service size',
        type: 'select',
        required: false,
        options: SERVICE_SIZE_OPTIONS,
      },
      {
        id: 'utility',
        label: 'Who is your utility company?',
        type: 'select',
        required: false,
        options: UTILITY_OPTIONS,
      },
      {
        id: 'urgency',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: URGENCY_OPTIONS,
      },
    ],
  },
  {
    key: 'generator',
    label: 'Standby Generator',
    blurb: 'Generac authorized dealer. Whole-home and essential-circuit standby generators.',
    priceFootnote: 'Manual transfer switches $1,200–$2,500. Automatic transfer switches $2,500–$4,000+. Generators quoted on-site.',
    questions: [
      {
        id: 'propertyType',
        label: 'Is this for a residence or commercial property?',
        type: 'radio',
        required: true,
        options: ['Residential', 'Commercial'],
      },
      {
        id: 'scope',
        label: 'What are you looking to do?',
        type: 'select',
        required: true,
        options: [
          'New standby generator install',
          'Replace existing generator',
          'Transfer switch only (you have a portable)',
          'Service or repair existing generator',
          'Not sure yet, need recommendation',
        ],
      },
      {
        id: 'residentialCoverage',
        label: 'Whole house generator or power specific circuits?',
        type: 'radio',
        required: false,
        options: ['Whole house', 'Specific circuits only', 'Not sure'],
        showWhen: { when: 'propertyType', equals: ['Residential'] },
      },
      {
        id: 'residentialType',
        label: 'Portable (plug it in when there is an outage) or standby (turns on automatically)?',
        type: 'radio',
        required: false,
        options: ['Portable', 'Standby (automatic)', 'Not sure'],
        showWhen: { when: 'propertyType', equals: ['Residential'] },
      },
      {
        id: 'homeSize',
        label: 'Approximate home size',
        type: 'select',
        required: false,
        options: HOME_SIZE_OPTIONS,
        showWhen: { when: 'propertyType', equals: ['Residential'] },
      },
      {
        id: 'commercialCoverage',
        label: 'Power the entire space or just specific circuits?',
        type: 'radio',
        required: false,
        options: ['Entire space', 'Specific circuits only', 'Not sure'],
        showWhen: { when: 'propertyType', equals: ['Commercial'] },
      },
      {
        id: 'commercialGeneratorSize',
        label: 'Do you have a sense of what size generator you are looking for?',
        type: 'select',
        required: false,
        options: [
          'Under 25 kW',
          '25–50 kW',
          '50–100 kW',
          'Over 100 kW',
          'Not sure',
        ],
        showWhen: { when: 'propertyType', equals: ['Commercial'] },
      },
      {
        id: 'serviceSize',
        label: 'Service size currently coming into the property',
        type: 'select',
        required: false,
        options: SERVICE_SIZE_OPTIONS,
      },
      {
        id: 'utility',
        label: 'Who is your utility company?',
        type: 'select',
        required: false,
        options: UTILITY_OPTIONS,
      },
      {
        id: 'fuel',
        label: 'Fuel source available',
        type: 'select',
        required: false,
        options: [
          'Propane on-site',
          'Natural gas',
          'No fuel source yet (interested in adding propane)',
          'Not sure',
        ],
      },
      {
        id: 'medical',
        label: 'Anyone in the home depend on medical equipment?',
        type: 'radio',
        required: false,
        options: ['Yes', 'No'],
        showWhen: { when: 'propertyType', equals: ['Residential'] },
      },
      {
        id: 'urgency',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: URGENCY_OPTIONS,
      },
    ],
  },
  {
    key: 'plumbing',
    label: 'Plumbing',
    blurb: 'Light to moderate residential plumbing. Water heaters, fixtures, leaks, toilets, faucets, garbage disposals.',
    priceFootnote: 'Standard scheduling 1–3 weeks out. Active leaks and emergencies prioritized.',
    questions: [
      {
        id: 'scope',
        label: 'What are you looking to do?',
        type: 'select',
        required: true,
        options: [
          'Water heater replacement',
          'Fixture or faucet replacement',
          'Toilet replacement or repair',
          'Leak repair',
          'Garbage disposal',
          'Drain or clog issue',
          'Other plumbing issue',
        ],
      },
      {
        id: 'urgentNow',
        label: 'Is water actively leaking or causing damage right now?',
        type: 'radio',
        required: true,
        options: ['Yes — active leak', 'No — not leaking'],
      },
      {
        id: 'urgency',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: URGENCY_OPTIONS,
      },
    ],
  },
  {
    key: 'ev-charger',
    label: 'EV Charger Install',
    blurb: 'Residential EV chargers wired to manufacturer specs. Tesla, ChargePoint, Grizzl-E, Emporia, and more.',
    priceFootnote: 'Most installs $900–$4,000+. Standard near-panel install starts ~$950. Permits not included.',
    questions: [
      {
        id: 'serviceSize',
        label: 'Current electrical service size',
        type: 'select',
        required: false,
        options: SERVICE_SIZE_OPTIONS,
      },
      {
        id: 'distance',
        label: 'Distance from electrical panel to charger location',
        type: 'select',
        required: true,
        options: [
          'Within 10 feet',
          '10–30 feet',
          '30–60 feet',
          'Over 60 feet',
          'Detached garage / separate structure',
          'Not sure',
        ],
      },
      {
        id: 'style',
        label: 'Outlet-style (plug-in) or hardwired charger?',
        type: 'radio',
        required: false,
        options: ['Outlet (plug-in)', 'Hardwired', 'Not sure'],
      },
      {
        id: 'supplied',
        label: 'Charger already purchased?',
        type: 'radio',
        required: false,
        options: ['Yes, I have it', 'No, I need it supplied', 'Not sure yet'],
      },
      {
        id: 'urgency',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: URGENCY_OPTIONS,
      },
    ],
  },
  {
    key: 'surge',
    label: 'Whole-Home Surge Protection',
    blurb: 'Protects HVAC, appliances, electronics, and smart home gear from utility and internal surges.',
    priceFootnote: 'Entry-level ~$450. Premium with connected-equipment coverage up to ~$1,200.',
    questions: [
      {
        id: 'panels',
        label: 'How many electrical panels in the home?',
        type: 'radio',
        required: false,
        options: ['1', '2 or more', 'Not sure'],
      },
      {
        id: 'urgency',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: URGENCY_OPTIONS,
      },
    ],
  },
  {
    key: 'other',
    label: 'Something else',
    blurb: "Tell us what you're looking to do. We'll route it to the right team.",
    questions: [
      {
        id: 'description',
        label: 'What can we help with?',
        type: 'textarea',
        required: true,
        placeholder: 'A few sentences about what you need.',
      },
      {
        id: 'urgency',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: URGENCY_OPTIONS,
      },
    ],
  },
]

export const REFERRAL_SOURCES = [
  'Google search',
  'Google Ads',
  'Nextdoor',
  'Facebook',
  'Instagram',
  'YouTube',
  'Referred by a friend or family member',
  'Returning customer',
  'Yard sign / truck',
  'Other',
]

export function findService(key: string | undefined): ServiceConfig | undefined {
  if (!key) return undefined
  return SERVICES.find((s) => s.key === key)
}

/**
 * Whether a question should render given the current answers. Used by the
 * form (to hide irrelevant follow-ups) and validation (to skip "required"
 * checks on hidden questions).
 */
export function isQuestionVisible(
  question: Question,
  answers: Record<string, string>,
): boolean {
  if (!question.showWhen) return true
  const current = answers[question.showWhen.when]
  if (!current) return false
  return question.showWhen.equals.includes(current)
}

/**
 * Human-readable map of question id → label, used when stitching answers
 * into the HCP estimate's private_notes and the office email so labels
 * read naturally instead of camelCase ids.
 */
export function getQuestionLabel(
  service: ServiceConfig,
  questionId: string,
): string {
  return service.questions.find((q) => q.id === questionId)?.label || questionId
}
