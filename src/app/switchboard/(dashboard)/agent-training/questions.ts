export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'currency_range'
  | 'yes_no'
  | 'yes_no_detail'
  | 'multi_select'
  | 'single_select'

export type Question = {
  id: string
  type: QuestionType
  label: string
  hint?: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

export type Section = {
  id: string
  title: string
  intro: string
  questions: Question[]
}

export const SECTIONS: Section[] = [
  {
    id: 'pricing',
    title: 'Pricing & Fees',
    intro:
      'What can the agents quote without putting the customer on hold? Leave blank if it is always a custom quote. Any specific number or range you give lets the agents answer confidently instead of dodging.',
    questions: [
      {
        id: 'service_call_fee',
        type: 'short_text',
        label: 'Standard service call / diagnostic fee',
        placeholder: 'e.g. $89, waived if repair is approved',
        hint: 'Does it get waived if the customer approves the repair?',
      },
      {
        id: 'after_hours_premium',
        type: 'short_text',
        label: 'After-hours / emergency rate premium',
        placeholder: 'e.g. 1.5x standard rate, or flat $150 surcharge',
      },
      {
        id: 'trip_charge',
        type: 'short_text',
        label: 'Trip charge for jobs outside the 5-county core',
        placeholder: 'e.g. $50 outside Greene/Columbia/Ulster/Dutchess/Albany',
      },
      {
        id: 'drain_cleaning',
        type: 'short_text',
        label: 'Drain cleaning published rate',
        placeholder: 'e.g. $189 standard, or "always custom"',
      },
      {
        id: 'outlet_switch',
        type: 'short_text',
        label: 'Standard outlet/switch install rate',
        placeholder: 'e.g. $125 first device, $50 each additional',
      },
      {
        id: 'gfci_smoke',
        type: 'short_text',
        label: 'GFCI / smoke detector replacement',
        placeholder: 'e.g. $175 GFCI, $95 smoke detector',
      },
      {
        id: 'water_heater_install',
        type: 'short_text',
        label: 'Water heater install range (tank vs tankless)',
        placeholder: 'e.g. tank $1,800-$2,800, tankless $3,500-$5,500',
      },
      {
        id: 'ev_charger_install',
        type: 'short_text',
        label: 'EV charger install typical range',
        placeholder: 'e.g. $800-$2,500 depending on panel proximity',
      },
      {
        id: 'rewire_ballpark',
        type: 'short_text',
        label: 'House rewiring ballpark',
        placeholder: 'e.g. per sq ft, or "always custom quote"',
      },
      {
        id: 'hot_tub_pool',
        type: 'short_text',
        label: 'Hot tub / pool wiring range',
        placeholder: 'e.g. $1,500-$3,000',
      },
      {
        id: 'transfer_switch_only',
        type: 'short_text',
        label: 'Generator transfer switch only (no generator)',
        placeholder: 'e.g. $1,200-$2,500 manual, $2,500-$4,000 automatic',
      },
      {
        id: 'whole_home_surge',
        type: 'short_text',
        label: 'Whole-home surge protection',
        placeholder: 'e.g. $450-$750 installed',
      },
    ],
  },
  {
    id: 'warranty_brands_payment',
    title: 'Warranty, Brands & Payment',
    intro:
      'Stuff customers ask before booking that should not require a callback.',
    questions: [
      {
        id: 'labor_warranty',
        type: 'short_text',
        label: 'Labor warranty length on TZ work',
        placeholder: 'e.g. 1 year on all installs, 90 days on repairs',
      },
      {
        id: 'manufacturer_warranty',
        type: 'long_text',
        label: 'Manufacturer warranties',
        placeholder:
          'Who registers them, TZ or the customer? Typical lengths? Anything different for Mitsubishi vs Generac vs other brands?',
      },
      {
        id: 'plan_member_warranty',
        type: 'yes_no_detail',
        label: 'Do Signature Plan members get extended warranty?',
        hint: 'If yes, give us the details so the agents can pitch it.',
      },
      {
        id: 'hvac_brands',
        type: 'long_text',
        label: 'HVAC brands you stock or install beyond Mitsubishi',
        placeholder: 'e.g. Trane, Carrier, Lennox, Bryant, Goodman',
      },
      {
        id: 'water_heater_brands',
        type: 'long_text',
        label: 'Water heater brands',
        placeholder: 'e.g. Rheem, Bradford White, Rinnai, AO Smith',
      },
      {
        id: 'hybrid_heat_pump_model',
        type: 'short_text',
        label: 'Hybrid heat pump water heater model in the $500-off promo',
        placeholder: 'Specific make/model',
      },
      {
        id: 'payment_methods',
        type: 'multi_select',
        label: 'Payment methods accepted',
        options: [
          { value: 'cards', label: 'Credit/debit cards' },
          { value: 'checks', label: 'Checks' },
          { value: 'ach', label: 'ACH / bank transfer' },
          { value: 'cash', label: 'Cash' },
          { value: 'wisetack', label: 'Wisetack financing' },
          { value: 'synchrony', label: 'Synchrony financing' },
        ],
      },
      {
        id: 'deposit_policy',
        type: 'short_text',
        label: 'Deposit required on installs',
        placeholder: 'e.g. 50% on installs over $5,000, none on repairs',
      },
    ],
  },
  {
    id: 'emergency_triage',
    title: 'Emergency Triage & On-Call',
    intro:
      'How the agents decide between true emergency, urgent same-day, and normal scheduling, plus who they wake up.',
    questions: [
      {
        id: 'true_emergencies',
        type: 'multi_select',
        label: 'What counts as a TRUE emergency for AI to escalate immediately',
        options: [
          { value: 'gas_leak', label: 'Gas leak (always 911 first)' },
          { value: 'sparking_panel', label: 'Sparking or smoking panel/outlet' },
          { value: 'no_heat_cold', label: 'No heat below a threshold temperature' },
          { value: 'burst_pipe', label: 'Burst pipe actively flooding' },
          { value: 'total_power_loss', label: 'Total power loss to home' },
          { value: 'gen_failure_outage', label: 'Generator failure during outage' },
          { value: 'sewage_backup', label: 'Sewage backup' },
          { value: 'no_hot_water', label: 'No hot water (winter)' },
        ],
      },
      {
        id: 'no_heat_threshold',
        type: 'short_text',
        label: 'No-heat emergency threshold (outside temperature)',
        placeholder: 'e.g. below 50°F outside = emergency',
      },
      {
        id: 'true_emergency_dispatch',
        type: 'long_text',
        label: 'On a true emergency, who does the AI dispatch and how?',
        placeholder:
          'e.g. text the on-call tech AND text Tyler simultaneously, or call on-call directly',
      },
      {
        id: 'urgent_not_emergency',
        type: 'long_text',
        label: 'Urgent-but-not-emergency examples and how to handle them',
        placeholder:
          'AC out in summer heat, breaker tripping repeatedly, slow drain becoming blockage. Try same-day? Set expectation of next-day?',
      },
      {
        id: 'on_call_rotation',
        type: 'long_text',
        label: 'On-call rotation schedule',
        placeholder:
          'Who is on call by week, by trade? Phone numbers / how the AI reaches them after hours?',
      },
      {
        id: 'tyler_after_hours_pings',
        type: 'single_select',
        label: 'Does Tyler want a ping on every after-hours dispatch, or only serious ones?',
        options: [
          { value: 'every', label: 'Every after-hours dispatch' },
          { value: 'serious', label: 'Only true emergencies' },
          { value: 'daily_summary', label: 'Daily summary, not real-time' },
        ],
      },
    ],
  },
  {
    id: 'customer_lookup',
    title: 'Existing vs New Customer Behavior',
    intro:
      'Should the AI recognize and personalize for existing HCP customers, or treat everyone fresh?',
    questions: [
      {
        id: 'lookup_existing',
        type: 'yes_no_detail',
        label: 'When an existing customer calls, look them up in HCP and greet by name?',
        hint:
          'If yes, should the AI also pull recent job history (last service, equipment installed)?',
      },
      {
        id: 'past_invoice_handling',
        type: 'single_select',
        label: 'If a customer is calling about a past job/invoice, how should AI handle?',
        options: [
          { value: 'always_human', label: 'Always hand to a human' },
          { value: 'basic_lookups', label: 'AI handles "when is my appointment" / status, escalates billing disputes' },
          { value: 'ai_handles_all', label: 'AI handles everything it can' },
        ],
      },
    ],
  },
  {
    id: 'commercial_policy',
    title: 'Commercial, Rentals, Home Warranties',
    intro:
      'Tyler does commercial even though the site is residential-focused. Plus rentals and home warranty company calls.',
    questions: [
      {
        id: 'commercial_trades',
        type: 'multi_select',
        label: 'Which trades does TZ take commercial work for?',
        options: [
          { value: 'electrical', label: 'Electrical' },
          { value: 'hvac', label: 'HVAC / mini split' },
          { value: 'plumbing', label: 'Plumbing' },
          { value: 'generator', label: 'Generator' },
          { value: 'water_heater', label: 'Hot water heater' },
        ],
      },
      {
        id: 'commercial_routing',
        type: 'long_text',
        label: 'How should the AI route commercial inquiries?',
        placeholder:
          'Same intake as residential, or different qualifying questions and a different person?',
      },
      {
        id: 'rental_policy',
        type: 'single_select',
        label: 'Renter or tenant calls, what is the policy?',
        options: [
          { value: 'book_under_tenant', label: 'Book under the tenant, no extra check' },
          { value: 'require_landlord', label: 'Require landlord approval before booking' },
          { value: 'decline', label: 'Decline rentals, refer landlord to call' },
        ],
      },
      {
        id: 'home_warranty',
        type: 'yes_no_detail',
        label: 'Do you work with home warranty companies (AHS, Choice, First American)?',
        hint: 'If yes, which ones? If no, how should AI politely decline?',
      },
    ],
  },
  {
    id: 'intake_qualification',
    title: 'Intake & Qualification per Service',
    intro:
      'What questions does the AI need to ask before creating an HCP record so the dispatcher does not have to call back for missing info?',
    questions: [
      {
        id: 'hcp_required_fields',
        type: 'long_text',
        label: 'Minimum required fields to create a customer record in HCP',
        placeholder: 'Name, address, phone, email. Confirm these are the basics. Any custom fields?',
      },
      {
        id: 'lead_source_tag',
        type: 'short_text',
        label: 'Tag for AI-created records',
        placeholder: 'e.g. "Voice AI" / "SMS AI" / "Web AI" so Tyler can track conversion',
      },
      {
        id: 'intake_hvac',
        type: 'long_text',
        label: 'HVAC / mini split qualifying questions',
        placeholder:
          'Square footage, current system type, age, electrical service size, attic/basement/crawlspace?',
      },
      {
        id: 'intake_generator',
        type: 'long_text',
        label: 'Generator qualifying questions',
        placeholder:
          'Gas/propane available? Approx home size? Whole-home or partial backup?',
      },
      {
        id: 'intake_panel',
        type: 'long_text',
        label: 'Panel upgrade qualifying questions',
        placeholder:
          'Current amperage, fuse box vs breaker, reason for upgrade?',
      },
      {
        id: 'intake_ev',
        type: 'long_text',
        label: 'EV charger qualifying questions',
        placeholder: 'Vehicle make/model, garage vs outdoor, distance from panel?',
      },
      {
        id: 'intake_plumbing_emergency',
        type: 'long_text',
        label: 'Plumbing emergency qualifying questions',
        placeholder: 'Shut-off located? Actively leaking? Water shut off?',
      },
    ],
  },
  {
    id: 'scheduling_handoffs',
    title: 'Scheduling & Handoffs',
    intro:
      'How AI offers appointment windows, and when it stops talking and brings in a human.',
    questions: [
      {
        id: 'dispatch_logic',
        type: 'long_text',
        label: 'How are jobs assigned',
        placeholder:
          'By zip code, by tech skill, by existing route? So the AI knows what window to offer.',
      },
      {
        id: 'arrival_windows',
        type: 'short_text',
        label: 'Standard arrival windows',
        placeholder: 'e.g. 2-hour windows, AM/PM blocks',
      },
      {
        id: 'blackout_dates',
        type: 'long_text',
        label: 'Blackout dates / weeks',
        placeholder: 'Team vacations, training weeks, big seasonal installs',
      },
      {
        id: 'handoff_triggers',
        type: 'long_text',
        label: 'When should AI hand off to a human',
        placeholder:
          'Frustrated/angry, custom commercial, billing dispute, insurance claim, real estate inspection list, fallback for anything not trained',
      },
      {
        id: 'handoff_business_hours',
        type: 'long_text',
        label: 'Business-hours handoff: who answers (now that Averie is gone)?',
        placeholder: 'Terry, Sam, Ty, Tyler? Order of preference / how AI picks?',
      },
      {
        id: 'handoff_after_hours',
        type: 'single_select',
        label: 'After-hours handoff path',
        options: [
          { value: 'on_call_direct', label: 'Ring on-call tech directly' },
          { value: 'voicemail_text_tyler', label: 'Voicemail + text ping to Tyler' },
          { value: 'text_summary', label: 'Text summary to Tyler, he decides' },
        ],
      },
      {
        id: 'spam_handling',
        type: 'single_select',
        label: 'Vendor / telemarketer / spam calls',
        options: [
          { value: 'short_decline', label: 'Short "not interested," end call' },
          { value: 'voicemail', label: 'Route to voicemail' },
          { value: 'block', label: 'Block the number going forward' },
        ],
      },
    ],
  },
  {
    id: 'channel_preferences',
    title: 'Voice, SMS & Web Chat Preferences',
    intro:
      'How the agents sound and behave on each channel.',
    questions: [
      {
        id: 'voice_persona',
        type: 'long_text',
        label: 'Voice persona',
        placeholder:
          'Male/female, accent, formal vs casual? Recommend casual/local-neighborly. Any specific name for the AI?',
      },
      {
        id: 'voice_opening_line',
        type: 'long_text',
        label: 'Opening line, exact preferred wording',
        placeholder: 'e.g. "Thanks for calling TZ Electric, how can I help?"',
      },
      {
        id: 'identify_as_ai',
        type: 'single_select',
        label: 'Should the AI identify itself as AI?',
        hint: 'Strong recommend: yes. Trust + legal safety.',
        options: [
          { value: 'yes_upfront', label: 'Yes, in the opening line' },
          { value: 'yes_if_asked', label: 'Only if directly asked' },
          { value: 'no', label: 'No, present as a human' },
        ],
      },
      {
        id: 'max_call_length',
        type: 'short_text',
        label: 'Max call length before forced handoff',
        placeholder: 'e.g. 4 min, 6 min',
      },
      {
        id: 'post_call_text',
        type: 'long_text',
        label: 'Confirmation text after call',
        placeholder:
          'Enabled? What does it say? e.g. "Thanks for calling. Your appointment is booked for Tuesday between 9 to 11am. Reply STOP to opt out."',
      },
      {
        id: 'sms_first_reply',
        type: 'long_text',
        label: 'First auto-reply wording on inbound SMS',
        placeholder:
          'e.g. "Thanks for texting TZ Electric. I am a smart assistant and can help right now. What service do you need?"',
      },
      {
        id: 'review_request_workflow',
        type: 'long_text',
        label: 'Review request workflow (what Podium used to do)',
        placeholder:
          'When should AI text customers asking for a Google review? After job close? Manually triggered? What is the message?',
      },
      {
        id: 'after_hours_sms',
        type: 'single_select',
        label: 'After-hours SMS behavior',
        options: [
          { value: 'real_time', label: 'AI answers in real time, 24/7' },
          { value: 'morning_response', label: '"We will respond in the morning" auto-reply only' },
          { value: 'ai_real_time_emergency_escalate', label: 'AI answers real time, escalates emergencies' },
        ],
      },
      {
        id: 'web_chat_pages',
        type: 'single_select',
        label: 'Which pages does the chatbot widget appear on?',
        options: [
          { value: 'all', label: 'All pages' },
          { value: 'service_only', label: 'Service pages only' },
          { value: 'all_minus_legal', label: 'All except legal/privacy/policy pages' },
        ],
      },
      {
        id: 'web_chat_proactive',
        type: 'single_select',
        label: 'Chat behavior',
        options: [
          { value: 'proactive_popup', label: 'Proactive popup after ~15 seconds' },
          { value: 'click_to_open', label: 'Click-to-open only' },
          { value: 'proactive_on_exit', label: 'Pop on exit-intent only' },
        ],
      },
      {
        id: 'web_form_followup_scope',
        type: 'long_text',
        label: 'Which form submissions trigger the 60-second text + email follow-up?',
        placeholder:
          'All quote requests, only certain service types, only emergency, etc.',
      },
    ],
  },
  {
    id: 'inconsistencies',
    title: 'Site Inconsistencies to Resolve',
    intro:
      'Stuff on the live site that conflicts or is unclear. Lock these down so the AI does not contradict itself.',
    questions: [
      {
        id: 'delaware_county',
        type: 'yes_no_detail',
        label: 'Delaware County, covered or not?',
        hint:
          'Homepage lists it. Service-areas page does not. Which is correct?',
      },
      {
        id: 'plumbing_staffing',
        type: 'long_text',
        label: 'Plumbing staffing reality',
        placeholder:
          'No plumbers on the team page. Subcontracted? Cross-trained electricians? Should AI promise same-day plumbing or set longer expectations?',
      },
      {
        id: 'hvac_bandwidth',
        type: 'long_text',
        label: 'HVAC bandwidth during heat waves',
        placeholder:
          'Only 2 HVAC techs vs 8 electricians. Realistic same-day HVAC in July, or should AI set 2-3 day expectations?',
      },
      {
        id: 'saturday_hours',
        type: 'single_select',
        label: 'Saturday phone coverage',
        options: [
          { value: 'office_open', label: 'Office answers Saturday' },
          { value: 'emergency_only', label: 'Only emergency line, routed to on-call' },
          { value: 'ai_handles', label: 'AI handles all Saturday calls' },
        ],
      },
      {
        id: 'best_electrician_source',
        type: 'short_text',
        label: '"Voted Best Electrician in the Hudson Valley", by whom?',
        placeholder:
          'Chronogrammies? Year? So AI can cite the source if a customer presses.',
      },
      {
        id: 'anything_else',
        type: 'long_text',
        label: 'Anything else the agents should know that we have not asked?',
        placeholder:
          'Quirks, common customer misconceptions, things you wish customers knew before calling, scripts you use that work.',
      },
    ],
  },
]
