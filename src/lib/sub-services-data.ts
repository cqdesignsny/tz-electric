import type { ServicePage } from '@/lib/services-data'

export interface SubServicePage extends ServicePage {
  parent: string
  parentTitle: string
}

export const SUB_SERVICE_PAGES: SubServicePage[] = [

  // ─── ELECTRICAL ────────────────────────────────────────────────────────────

  {
    parent: 'electrical',
    parentTitle: 'Electrical Services',
    slug: 'ev-chargers',
    title: 'EV Charger Installation',
    metaTitle: 'EV Charger Installation Hudson Valley | Licensed Electrician',
    metaDescription:
      'Professional Level 2 EV charger installation in the Hudson Valley. We handle permits, panel assessment, and wiring for all major EV brands. Call (518) 678-1230.',
    heroTitle: 'EV Charger Installation Services',
    heroDescription:
      'Charge smarter at home. Our licensed electricians install Level 2 EV chargers for every major electric vehicle brand — fast, safe, and fully permitted.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'EV charger installation by TZ Electric' },
    features: [
      { title: 'Level 2 Home Charger Installation', description: '240V dedicated circuit installation — charge your EV 5x faster than a standard outlet.' },
      { title: 'Permit & Panel Assessment', description: 'We handle all permits and verify your panel has sufficient capacity before installation.' },
      { title: 'All EV Brands Supported', description: 'Compatible with Tesla, Rivian, Ford, Chevy, BMW, and every other major EV manufacturer.' },
      { title: 'Load Calculation & Wiring', description: 'Properly sized wiring and breaker for your vehicle and daily charging demands.' },
      { title: 'Smart Charger Integration', description: 'WiFi-enabled chargers with app monitoring so you track charging from your phone.' },
      { title: 'Panel Upgrade Coordination', description: 'If your panel needs an upgrade to support a charger, we handle everything in one visit.' },
    ],
    faqs: [
      {
        question: 'Do I need a panel upgrade to install an EV charger?',
        answer: 'Not always. We assess your existing panel capacity first. Many homes already have enough capacity for a Level 2 charger. If an upgrade is needed, we can coordinate both in a single project.',
      },
      {
        question: 'How long does EV charger installation take?',
        answer: 'Most Level 2 EV charger installations are completed in 4–8 hours. If panel work is needed, the project may extend to a full day.',
      },
      {
        question: 'What is a Level 2 charger?',
        answer: 'A Level 2 charger uses a 240V circuit (like a dryer outlet) and can fully charge most EVs overnight. It charges 5x faster than a standard 120V Level 1 outlet.',
      },
    ],
  },

  {
    parent: 'electrical',
    parentTitle: 'Electrical Services',
    slug: 'panel-upgrade',
    title: 'Electrical Panel Upgrade',
    metaTitle: 'Electrical Panel Upgrade Hudson Valley | 200 Amp Service',
    metaDescription:
      'Licensed electrical panel upgrades in the Hudson Valley. Upgrade from 100A to 200A, replace unsafe legacy panels, and meet modern code requirements. Call (518) 678-1230.',
    heroTitle: 'Electrical Panel Upgrades',
    heroDescription:
      'Outdated panels are a safety hazard and can\'t handle modern electrical demands. We upgrade your service panel to 200A — safe, code-compliant, and ready for anything.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'Electrical panel upgrade by TZ Electric' },
    features: [
      { title: '100A to 200A Upgrades', description: 'Handle EV chargers, mini splits, and modern appliances without tripping breakers.' },
      { title: 'Federal Pacific & Zinsco Replacement', description: 'Replace known-hazardous legacy panels with modern, safe equipment.' },
      { title: 'Circuit Breaker Replacement', description: 'Replace faulty or aging breakers that trip frequently or fail to trip when needed.' },
      { title: 'Code Compliance', description: 'All work meets current NEC and local code requirements — we pull all required permits.' },
      { title: 'Service Entrance Upgrade', description: 'Full utility service entrance upgrades where needed, coordinated with your utility company.' },
      { title: 'GFCI & AFCI Protection', description: 'Install ground fault and arc fault protection required by modern code.' },
    ],
    faqs: [
      {
        question: 'How do I know if I need a panel upgrade?',
        answer: 'Signs you need an upgrade: your panel is over 20 years old, breakers trip frequently, you\'re adding a mini split or EV charger, or you have a Federal Pacific or Zinsco panel (which are known fire hazards).',
      },
      {
        question: 'How long does a panel upgrade take?',
        answer: 'Most panel upgrades are completed in a single day (4–8 hours). Your power will be off during the work, but we minimize downtime.',
      },
      {
        question: 'Is a permit required for a panel upgrade?',
        answer: 'Yes, always. We handle all permits and coordinate the required inspection. Never use an electrician who skips the permit — it affects your home\'s insurability and resale.',
      },
    ],
  },

  {
    parent: 'electrical',
    parentTitle: 'Electrical Services',
    slug: 'house-rewire',
    title: 'House Rewiring',
    metaTitle: 'House Rewiring Hudson Valley, NY | Knob & Tube Removal',
    metaDescription:
      'Licensed house rewiring in the Hudson Valley. Remove knob-and-tube, aluminum wiring, and update to modern copper wiring. Safe, code-compliant. Call (518) 678-1230.',
    heroTitle: 'House Rewiring Services',
    heroDescription:
      'Outdated or faulty wiring is the leading cause of residential electrical fires. We safely rewire your home to modern standards — protecting your family and your investment.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'House rewiring service by TZ Electric' },
    features: [
      { title: 'Full Home Rewiring', description: 'Complete replacement of all electrical wiring — the safest option for homes with severely outdated systems.' },
      { title: 'Knob-and-Tube Removal', description: 'Safely remove and replace hazardous knob-and-tube wiring that most insurers won\'t cover.' },
      { title: 'Aluminum Wiring Upgrade', description: 'Convert unsafe aluminum branch circuit wiring to safer copper wiring.' },
      { title: 'Grounded Outlet Installation', description: 'Replace ungrounded 2-prong outlets with modern 3-prong grounded outlets throughout.' },
      { title: 'Partial Rewiring', description: 'Targeted rewiring of specific areas — kitchens, bathrooms, or additions — as needed.' },
      { title: 'Code Compliance & Inspection', description: 'All rewiring work is fully permitted and passes final inspection for your peace of mind.' },
    ],
    faqs: [
      {
        question: 'What are signs I need a house rewire?',
        answer: 'Flickering lights, burning smells near outlets or switches, frequently tripping breakers, visible knob-and-tube or aluminum wiring, or a home built before 1970 that hasn\'t been updated are all signs to have your wiring inspected.',
      },
      {
        question: 'How disruptive is a house rewire?',
        answer: 'We minimize disruption as much as possible. Some drywall work may be required to run new wiring, and we\'ll coordinate the scope with you upfront so there are no surprises.',
      },
      {
        question: 'Will my homeowner\'s insurance cover knob-and-tube wiring?',
        answer: 'Many insurers won\'t write a new policy — or will non-renew an existing one — on homes with active knob-and-tube wiring. Upgrading protects both your coverage and your home\'s value.',
      },
    ],
  },

  {
    parent: 'electrical',
    parentTitle: 'Electrical Services',
    slug: 'home-electrical-services',
    title: 'Home Electrical Services',
    metaTitle: 'Home Electrical Services Hudson Valley | Licensed Electrician',
    metaDescription:
      'Full-service residential electrical in the Hudson Valley. Outlets, lighting, circuits, surge protection, and smart home wiring. Licensed & insured. Call (518) 678-1230.',
    heroTitle: 'Complete Home Electrical Services',
    heroDescription:
      'From a single outlet to whole-home electrical work, our licensed electricians get it done right the first time — safely, cleanly, and up to code.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'Home electrical services by TZ Electric' },
    features: [
      { title: 'Outlet & Switch Installation', description: 'Add outlets, GFCI outlets, USB outlets, and switches anywhere in your home.' },
      { title: 'Lighting Installation', description: 'Recessed, pendant, under-cabinet, track, and exterior lighting — fully wired and installed.' },
      { title: 'Ceiling Fan Installation & Wiring', description: 'Complete installation including new switch and wiring where no existing fixture exists.' },
      { title: 'Dedicated Circuit Installation', description: 'Add dedicated circuits for home offices, appliances, workshops, or hot tubs.' },
      { title: 'Whole-Home Surge Protection', description: 'Panel-level surge protection safeguards your electronics and appliances from power surges.' },
      { title: 'Smart Home Electrical', description: 'Wiring for smart switches, dimmers, smart panels, and home automation systems.' },
    ],
    faqs: [
      {
        question: 'Can you add outlets in any room?',
        answer: 'Yes. We can run new circuits and add outlets wherever you need them — finished rooms, basements, garages, outdoors, or anywhere else.',
      },
      {
        question: 'What is a GFCI outlet and where is it required?',
        answer: 'GFCI (ground fault circuit interrupter) outlets cut power instantly if they detect a fault. They\'re required by code in kitchens, bathrooms, garages, and outdoor locations.',
      },
      {
        question: 'Do you handle electrical work for home additions or renovations?',
        answer: 'Yes, we regularly work alongside contractors and homeowners on renovation projects — rough-in wiring, panel adds, and final trim-out.',
      },
    ],
  },

  {
    parent: 'electrical',
    parentTitle: 'Electrical Services',
    slug: 'indoor-electrical',
    title: 'Indoor Electrical',
    metaTitle: 'Indoor Electrical Services Hudson Valley | Wiring & Lighting',
    metaDescription:
      'Indoor electrical installation and repair in the Hudson Valley. Wiring, lighting, circuits, troubleshooting, and smoke detectors. Licensed & insured. Call (518) 678-1230.',
    heroTitle: 'Indoor Electrical Installation & Repair',
    heroDescription:
      'Whether it\'s a flickering light, a dead outlet, or a full lighting remodel, our licensed electricians handle all your indoor electrical needs quickly and safely.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'Indoor electrical work by TZ Electric' },
    features: [
      { title: 'Indoor Wiring & Rewiring', description: 'Safe, code-compliant wiring for any room — new construction or existing homes.' },
      { title: 'Recessed & Track Lighting', description: 'Transform any room with modern recessed or track lighting, fully installed and dimmer-ready.' },
      { title: 'Circuit Additions', description: 'Add circuits where your existing wiring doesn\'t have capacity for new appliances or devices.' },
      { title: 'Electrical Troubleshooting & Repair', description: 'Diagnose and fix dead outlets, switches, tripped breakers, and intermittent electrical issues.' },
      { title: 'Smoke & CO Detector Installation', description: 'Hardwired interconnected smoke and carbon monoxide detector installation throughout your home.' },
      { title: 'Arc Fault Protection', description: 'AFCI breaker installation to protect against arc faults — required in bedrooms and living spaces by current code.' },
    ],
    faqs: [
      {
        question: 'What causes outlets to stop working?',
        answer: 'Common causes: a tripped GFCI outlet elsewhere on the circuit, a tripped breaker, or a loose wire connection. We diagnose and fix all three.',
      },
      {
        question: 'Can you fix flickering lights?',
        answer: 'Yes. Flickering is usually caused by a loose connection, failing fixture, overloaded circuit, or voltage fluctuation. We identify and fix the root cause.',
      },
      {
        question: 'Do you offer electrical inspections?',
        answer: 'Yes. We offer comprehensive home electrical inspections to identify code violations, safety hazards, and capacity issues — especially useful for older homes or before buying.',
      },
    ],
  },

  // ─── MITSUBISHI MINI SPLITS ───────────────────────────────────────────────

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'installation',
    title: 'Mini Split Installation',
    metaTitle: 'Mini Split Installation Hudson Valley | Mitsubishi Diamond Elite',
    metaDescription:
      'Professional Mitsubishi mini split installation in the Hudson Valley by a Diamond Elite Contractor. Single and multi-zone systems. Free estimates. Call (518) 678-1230.',
    heroTitle: 'Professional Mini Split Installation',
    heroDescription:
      'As a Mitsubishi Diamond Elite Contractor, we install ductless mini split systems to the highest standards — ensuring peak performance and maximum warranty coverage.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Mitsubishi mini split installation by TZ Electric' },
    features: [
      { title: 'Site Assessment & System Selection', description: 'We right-size the system for each room based on square footage, insulation, sun exposure, and your comfort goals.' },
      { title: 'Professional Line Set Installation', description: 'Proper refrigerant line routing and insulation for long-term reliability and efficiency.' },
      { title: 'Dedicated Electrical Circuit', description: 'We install a new dedicated circuit for each system — fully permitted and code-compliant.' },
      { title: 'Multi-Zone Setup & Configuration', description: 'Coordinate temperatures across multiple rooms from a single outdoor unit.' },
      { title: 'Diamond Elite Warranty', description: 'Certified Diamond Elite installation maximizes your Mitsubishi warranty — up to 12 years on parts.' },
      { title: 'Post-Install Training', description: 'We walk you through operation, remote use, and filter maintenance before we leave.' },
    ],
    faqs: [
      {
        question: 'How long does mini split installation take?',
        answer: 'A single-zone system is typically installed in 4–8 hours. Multi-zone systems with 2–4 indoor units usually take 1–2 days.',
      },
      {
        question: 'Do I need to do anything to prepare for installation?',
        answer: 'Just clear access to the installation areas. We handle all the technical preparation, including permits and utility coordination.',
      },
      {
        question: 'What warranty do I get with a Diamond Elite installation?',
        answer: 'Diamond Elite certified installation qualifies for up to 12 years on parts and 12 years on the compressor — the best warranty Mitsubishi offers.',
      },
    ],
  },

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'heat-pump',
    title: 'Mini Split Heat Pump',
    metaTitle: 'Mini Split Heat Pump Hudson Valley | Year-Round Heating & Cooling',
    metaDescription:
      'Mitsubishi mini split heat pumps for the Hudson Valley. Efficient heating down to -13°F. Diamond Elite installation. Free estimates. Call (518) 678-1230.',
    heroTitle: 'Mini Split Heat Pump Systems',
    heroDescription:
      'One system for heating and cooling — year round comfort at up to 40% less energy than electric baseboard. Mitsubishi Hyper-Heat works efficiently even at -13°F.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Mini split heat pump installation by TZ Electric' },
    features: [
      { title: 'Hyper-Heat Technology', description: 'Mitsubishi Hyper-Heat systems operate at full capacity down to 5°F and continue working down to -13°F.' },
      { title: 'Year-Round Comfort', description: 'One system handles both heating in winter and cooling in summer — no separate equipment needed.' },
      { title: 'Up to 40% Energy Savings', description: 'Mini split heat pumps move heat rather than generate it, cutting energy use compared to electric baseboard or oil heat.' },
      { title: 'Zone-by-Zone Control', description: 'Heat only the rooms you\'re using — stop paying to heat empty spaces.' },
      { title: 'No Ductwork Needed', description: 'Works without existing ductwork. Perfect for additions, older homes, and spaces where ducting isn\'t practical.' },
      { title: 'Whisper-Quiet Operation', description: 'Indoor units operate as quietly as 19dB — library-level silence for bedroom and living room installs.' },
    ],
    faqs: [
      {
        question: 'Can a mini split heat pump replace my existing heating system?',
        answer: 'For many Hudson Valley homes, yes. Mitsubishi Hyper-Heat systems handle our winters well. We assess your home and help you decide if a full replacement or supplemental install makes more sense.',
      },
      {
        question: 'How efficient are mini split heat pumps?',
        answer: 'Mitsubishi systems achieve SEER2 ratings of 20+ for cooling and HSPF2 ratings indicating very high heating efficiency — significantly better than older HVAC equipment.',
      },
      {
        question: 'Do they work in the Hudson Valley winter?',
        answer: 'Yes. Mitsubishi Hyper-Heat is engineered for cold climates. The system operates at full heating capacity down to 5°F and continues functioning down to -13°F.',
      },
    ],
  },

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'ductless-heat-pump',
    title: 'Ductless Heat Pump Installation',
    metaTitle: 'Ductless Heat Pump Installation Hudson Valley | No Ductwork',
    metaDescription:
      'Ductless heat pump installation in the Hudson Valley. Efficient heating and cooling without ductwork. Mitsubishi Diamond Elite Contractor. Call (518) 678-1230.',
    heroTitle: 'Ductless Heat Pump Installation',
    heroDescription:
      'All the comfort of a heat pump without the need for ductwork. Our ductless systems are custom-designed for your home and installed by Diamond Elite certified technicians.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Ductless heat pump installation by TZ Electric' },
    features: [
      { title: 'Custom System Design', description: 'We design your ductless system around your home\'s layout, insulation, and usage patterns.' },
      { title: 'Optimal Indoor Unit Placement', description: 'Precise positioning of indoor units for maximum airflow coverage and minimal visual impact.' },
      { title: 'Outdoor Unit Installation', description: 'Proper placement for efficiency, airflow, and noise minimization — away from bedrooms and neighbors.' },
      { title: 'All Electrical & Refrigerant Work', description: 'Complete installation including dedicated circuits, line sets, and refrigerant charging to factory spec.' },
      { title: 'System Commissioning', description: 'Full system testing and configuration — every parameter verified before we call it complete.' },
      { title: 'Expandable Zoning', description: 'Many systems support adding additional indoor zones in the future as your needs change.' },
    ],
    faqs: [
      {
        question: 'What is a ductless heat pump?',
        answer: 'A ductless heat pump moves heat into and out of your home using refrigerant lines — no ductwork required. It heats in winter and cools in summer with a single system.',
      },
      {
        question: 'How is ductless different from central air?',
        answer: 'Central air requires a duct system throughout your home. Ductless systems use small refrigerant lines instead, making them ideal for homes without existing ductwork or for adding comfort to specific areas.',
      },
      {
        question: 'Can I add more zones to my ductless system later?',
        answer: 'Yes. Many Mitsubishi outdoor units support 2–8 indoor zones. If you start with one or two, you can add more indoor units to the same outdoor unit in the future.',
      },
    ],
  },

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'ac-installation',
    title: 'Mini Split AC Installation',
    metaTitle: 'Mini Split AC Installation Hudson Valley | Ductless Cooling',
    metaDescription:
      'Ductless mini split AC installation in the Hudson Valley. Quiet, efficient cooling for any room. Mitsubishi Diamond Elite Contractor. Call (518) 678-1230.',
    heroTitle: 'Mini Split AC Installation',
    heroDescription:
      'Cool any room efficiently without ductwork. Mitsubishi mini split AC systems deliver quiet, targeted cooling with advanced filtration — installed by Diamond Elite certified technicians.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Mini split AC installation by TZ Electric' },
    features: [
      { title: 'Room-by-Room Cooling', description: 'Targeted cooling for any room — additions, sunrooms, finished basements, or rooms that your central system misses.' },
      { title: 'Ultra-Quiet Operation', description: 'Mitsubishi indoor units run as low as 19dB — quieter than a whisper. Perfect for bedrooms and offices.' },
      { title: 'Advanced Air Filtration', description: 'Multi-stage filtration captures dust, allergens, and particles for cleaner, healthier air.' },
      { title: 'Smart Controls', description: 'Control via the kumo cloud® app, wall-mounted controllers, wireless remote, or smart home integration.' },
      { title: 'Fast, Clean Installation', description: 'Most single-zone AC installs are completed in a single day with minimal disruption to your home.' },
      { title: 'Energy-Efficient Cooling', description: 'SEER2 ratings of 20+ on Mitsubishi systems mean lower utility bills compared to window units or older central systems.' },
    ],
    faqs: [
      {
        question: 'How quiet are Mitsubishi mini split AC units?',
        answer: 'Some Mitsubishi models operate as low as 19dB indoors — quieter than a library. Most homeowners barely notice them running.',
      },
      {
        question: 'Can a mini split cool a whole house?',
        answer: 'Yes. A multi-zone system with the right number of indoor units can condition your entire home. We size and design the system to match your needs.',
      },
      {
        question: 'How does mini split AC compare to window units?',
        answer: 'Mini splits are significantly more efficient, much quieter, look better, and provide better air quality. They also heat in winter — something window units can\'t do.',
      },
    ],
  },

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'multi-zone',
    title: 'Multi-Zone Mini Split Systems',
    metaTitle: 'Multi-Zone Mini Split Hudson Valley | Whole-Home Comfort',
    metaDescription:
      'Multi-zone Mitsubishi mini split systems in the Hudson Valley. One outdoor unit, up to 8 zones of independent temperature control. Diamond Elite installer. Call (518) 678-1230.',
    heroTitle: 'Multi-Zone Mini Split Systems',
    heroDescription:
      'One outdoor unit. Multiple zones of independent comfort. Multi-zone mini split systems let every room find its perfect temperature — efficiently and quietly.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Multi-zone mini split system by TZ Electric' },
    features: [
      { title: '2 to 8 Zone Configurations', description: 'One Mitsubishi outdoor unit can power 2–8 indoor zones — ideal for whole-home comfort.' },
      { title: 'Independent Temperature Control', description: 'Each zone has its own thermostat setting. No more fighting over the thermostat.' },
      { title: 'Mix & Match Indoor Units', description: 'Combine wall-mounted, ceiling cassette, floor-mounted, and concealed duct units in the same system.' },
      { title: 'Single Outdoor Unit', description: 'Less exterior equipment for a cleaner look — one unit handles the whole system.' },
      { title: 'Zoned Energy Savings', description: 'Only condition rooms that are occupied — stop paying to heat or cool empty spaces.' },
      { title: 'Whole-Home Replacement Option', description: 'Multi-zone systems can fully replace central HVAC for homes without existing ductwork or with aging equipment.' },
    ],
    faqs: [
      {
        question: 'How many zones can one outdoor unit handle?',
        answer: 'Mitsubishi multi-zone outdoor units support 2–8 indoor units depending on the model. We help you select the right outdoor unit based on your zone count and BTU requirements.',
      },
      {
        question: 'Can I mix different indoor unit styles in one system?',
        answer: 'Yes. You can use wall-mounted units in bedrooms, a ceiling cassette in the living room, and a floor unit in a sunroom — all connected to the same outdoor unit.',
      },
      {
        question: 'Is multi-zone more efficient than central air?',
        answer: 'Often yes. Multi-zone systems eliminate duct losses (which waste 20–30% of conditioned air in typical central systems) and let you condition only occupied zones.',
      },
    ],
  },

  // ─── HVAC ──────────────────────────────────────────────────────────────────

  {
    parent: 'hvac',
    parentTitle: 'HVAC Services',
    slug: 'central-air',
    title: 'Central Air Heating & Cooling',
    metaTitle: 'Central Air Heating & Cooling Hudson Valley | HVAC Installation',
    metaDescription:
      'Central air heating and cooling installation and service in the Hudson Valley. Furnaces, AC, and heat pumps for ducted systems. Call (518) 678-1230.',
    heroTitle: 'Central Air Heating & Cooling',
    heroDescription:
      'Keep your whole home comfortable year-round. We install and service central air heating and cooling systems — from high-efficiency AC to gas furnaces and heat pumps.',
    image: { src: '/images/services/hvac-hero.png', alt: 'Central air HVAC installation by TZ Electric' },
    features: [
      { title: 'Central AC Installation', description: 'Full ducted central air conditioning systems sized and installed for whole-home comfort.' },
      { title: 'Gas & Electric Furnace Installation', description: 'High-efficiency furnace installation for reliable winter heating.' },
      { title: 'Seasonal System Tune-Ups', description: 'Annual maintenance to keep your system running at peak performance and prevent breakdowns.' },
      { title: 'Filter Replacement & Maintenance', description: 'Keep your air clean and your system efficient with regular filter service.' },
      { title: 'Thermostat Upgrades', description: 'Smart thermostat installation for better temperature control and energy savings.' },
      { title: 'Duct Inspection & Sealing', description: 'Inspect and seal duct leaks that waste conditioned air and drive up utility bills.' },
    ],
    faqs: [
      {
        question: 'How often should central air be serviced?',
        answer: 'Annual maintenance is recommended — ideally servicing your cooling system in spring before the season and your heating system in fall.',
      },
      {
        question: 'How long do central HVAC systems last?',
        answer: 'Central AC units typically last 15–20 years. Furnaces can last 20+ years. Regular maintenance is the biggest factor in system longevity.',
      },
      {
        question: 'Do you offer financing on central air systems?',
        answer: 'Yes. We offer flexible financing through Wisetack and Synchrony so you can get a new system now and pay over time.',
      },
    ],
  },

  {
    parent: 'hvac',
    parentTitle: 'HVAC Services',
    slug: 'ducted-systems',
    title: 'Replacement of Ducted Systems',
    metaTitle: 'Ducted HVAC Replacement Hudson Valley | Full System Replacement',
    metaDescription:
      'Replace your aging ducted HVAC system in the Hudson Valley. Full system replacement including ductwork inspection and high-efficiency equipment. Call (518) 678-1230.',
    heroTitle: 'Ducted HVAC System Replacement',
    heroDescription:
      'Aging HVAC systems cost you more every year in repairs and energy. We replace outdated ducted heating and cooling systems with modern, efficient equipment built to last.',
    image: { src: '/images/services/hvac-hero.png', alt: 'Ducted HVAC system replacement by TZ Electric' },
    features: [
      { title: 'Full System Replacement', description: 'Replace aging furnace, AC unit, and air handler with matched high-efficiency equipment.' },
      { title: 'Ductwork Inspection & Repair', description: 'Inspect and seal leaky ductwork before installing new equipment — protecting your investment.' },
      { title: 'Proper Load Calculation', description: 'Accurate Manual J load calculation ensures your new system is correctly sized — not too big, not too small.' },
      { title: 'High-Efficiency Equipment', description: 'We install modern systems with significantly better efficiency ratings than equipment from 10+ years ago.' },
      { title: 'Rebate Assistance', description: 'We help you identify and apply for available utility rebates on high-efficiency equipment.' },
      { title: 'Permit & Inspection Coordination', description: 'All replacement work is fully permitted and passes required inspections.' },
    ],
    faqs: [
      {
        question: 'When should I replace vs. repair my HVAC system?',
        answer: 'If your system is over 15 years old, requires a repair costing more than 50% of replacement value, or is causing consistently high utility bills, replacement is usually the better investment.',
      },
      {
        question: 'How long does a full HVAC replacement take?',
        answer: 'Most full system replacements are completed in 1–2 days. We minimize downtime and work with your schedule.',
      },
      {
        question: 'Will new ductwork be needed?',
        answer: 'Not always. We inspect your existing ductwork first. If it\'s in good condition, we seal and clean it. If it\'s severely damaged or undersized, we\'ll recommend repairs or replacement.',
      },
    ],
  },

  {
    parent: 'hvac',
    parentTitle: 'HVAC Services',
    slug: 'installation',
    title: 'HVAC Installation',
    metaTitle: 'HVAC Installation Hudson Valley | New System Install',
    metaDescription:
      'New HVAC installation in the Hudson Valley. New construction, additions, and replacement systems. Licensed & insured. Free estimates. Call (518) 678-1230.',
    heroTitle: 'New HVAC Installation',
    heroDescription:
      'Whether you\'re building new, finishing a basement, or adding to your home, we design and install the right HVAC system for your specific space and needs.',
    image: { src: '/images/services/hvac-hero.png', alt: 'New HVAC installation by TZ Electric' },
    features: [
      { title: 'New Construction Installation', description: 'Full HVAC systems for new builds — coordinated with your builder from rough-in to final trim.' },
      { title: 'Addition & Finished Space HVAC', description: 'Extend or add HVAC coverage to additions, finished basements, and converted spaces.' },
      { title: 'Ductwork Design & Installation', description: 'Custom duct layout engineered for optimal airflow and even temperature distribution.' },
      { title: 'Equipment Selection Guidance', description: 'We recommend the right system type, brand, and size for your home\'s specific needs and budget.' },
      { title: 'Permit & Inspection Coordination', description: 'We handle all required permits and schedule all required inspections.' },
      { title: 'Startup & Commissioning', description: 'Full system startup, testing, and homeowner walkthrough before project closeout.' },
    ],
    faqs: [
      {
        question: 'What type of HVAC system is best for my home?',
        answer: 'It depends on your home\'s size, existing infrastructure, and budget. We offer free consultations to help you choose between central air, mini splits, heat pumps, or hybrid systems.',
      },
      {
        question: 'Do I need permits for HVAC installation?',
        answer: 'Yes — all new HVAC installations require permits. We handle all permitting and coordinate required inspections.',
      },
      {
        question: 'How long does a new HVAC installation take?',
        answer: 'Typically 1–3 days depending on the system type and scope of work. New construction with ductwork may take longer.',
      },
    ],
  },

  {
    parent: 'hvac',
    parentTitle: 'HVAC Services',
    slug: 'repair',
    title: 'HVAC Repair & Maintenance',
    metaTitle: 'HVAC Repair & Maintenance Hudson Valley | Fast Service',
    metaDescription:
      'Fast HVAC repair and maintenance in the Hudson Valley. Emergency service available. Annual tune-ups, refrigerant service, and all major brands. Call (518) 678-1230.',
    heroTitle: 'HVAC Repair & Maintenance',
    heroDescription:
      'When your heating or cooling stops working, we respond fast. Our technicians diagnose and repair all major HVAC brands — and we offer annual maintenance to prevent problems before they start.',
    image: { src: '/images/services/hvac-hero.png', alt: 'HVAC repair and maintenance by TZ Electric' },
    features: [
      { title: 'Emergency Repair Service', description: 'Fast response when your heating or cooling fails — we prioritize no-heat and no-AC calls.' },
      { title: 'Annual Tune-Up & Inspection', description: 'Comprehensive inspection and tune-up to prevent breakdowns and extend system life.' },
      { title: 'Refrigerant Leak Diagnosis & Repair', description: 'Find and fix refrigerant leaks and recharge systems to manufacturer specifications.' },
      { title: 'Blower, Capacitor & Contactor Repair', description: 'Repair and replace common components that cause HVAC failures.' },
      { title: 'Duct Leak Detection & Sealing', description: 'Identify and seal duct leaks that reduce efficiency and cause uneven temperatures.' },
      { title: 'All Major Brands Serviced', description: 'We service Carrier, Lennox, Trane, Bryant, Goodman, Rheem, and most other brands.' },
    ],
    faqs: [
      {
        question: 'Why is my HVAC blowing warm air instead of cold?',
        answer: 'Common causes include a low refrigerant charge, dirty evaporator coil, failed capacitor, or compressor issue. We diagnose the root cause and fix it properly.',
      },
      {
        question: 'How often should I change my air filter?',
        answer: 'Every 1–3 months depending on filter type, pets, and usage. A clogged filter is one of the most common causes of HVAC problems and reduced efficiency.',
      },
      {
        question: 'Is my HVAC worth repairing?',
        answer: 'If the system is under 10 years old and the repair cost is under 50% of replacement value, repair is usually worthwhile. We give you an honest recommendation either way.',
      },
    ],
  },

  // ─── GENERATORS ──────────────────────────────────────────────────────────

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'whole-home',
    title: 'Whole Home Generator',
    metaTitle: 'Whole Home Generator Installation Hudson Valley | Generac',
    metaDescription:
      'Whole home generator installation in the Hudson Valley. Powers your entire home automatically during outages. Generac Authorized Dealer. Free estimates. Call (518) 678-1230.',
    heroTitle: 'Whole Home Generator Installation',
    heroDescription:
      'Never go without power again. A whole home generator detects outages automatically and powers every circuit in your house within seconds — no manual start, no extension cords.',
    image: { src: '/images/services/generator.webp', alt: 'Whole home generator installation by TZ Electric' },
    features: [
      { title: 'Powers Your Entire Home', description: 'Unlike standby generators that cover essentials, whole-home units power every circuit — HVAC, appliances, outlets, and more.' },
      { title: 'Automatic Startup', description: 'Detects outages and starts within seconds. Power is restored before you even realize the grid went down.' },
      { title: 'Natural Gas or Propane', description: 'Connect to your existing gas line or propane tank — no refueling, no running out of fuel.' },
      { title: 'Professional Sizing', description: 'We calculate your home\'s total electrical load to select the right generator size — typically 22–48kW for whole-home coverage.' },
      { title: 'Full Turnkey Installation', description: 'Site preparation, concrete pad, fuel line connection, automatic transfer switch, and electrical integration — all included.' },
      { title: 'Ongoing Maintenance Plans', description: 'Keep your investment protected with our annual generator maintenance plans.', href: '/maintenance' },
    ],
    faqs: [
      {
        question: 'How large of a generator do I need for a whole home?',
        answer: 'Most homes need 22–48kW for whole-home coverage. The right size depends on your square footage, HVAC system, and which appliances you want to power simultaneously. We perform a free load calculation.',
      },
      {
        question: 'What fuel does a whole home generator use?',
        answer: 'Natural gas or propane. We help you determine which is best for your property based on existing fuel availability and cost.',
      },
      {
        question: 'How often does a whole home generator need maintenance?',
        answer: 'Annual maintenance is recommended, including oil and filter changes, battery check, and full system test. We offer maintenance plans specifically for generator owners.',
      },
    ],
  },

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'generac',
    title: 'Generac Generators',
    metaTitle: 'Generac Generator Installation Hudson Valley | Authorized Dealer',
    metaDescription:
      'Authorized Generac generator dealer in the Hudson Valley. Factory-trained installation and service. Automatic transfer switch, mobile monitoring. Call (518) 678-1230.',
    heroTitle: 'Generac Generator Installation',
    heroDescription:
      'As a Generac Authorized Dealer, we install and service the most-installed home standby generator brand in the country — with factory training, full warranty, and local support.',
    image: { src: '/images/services/generator.webp', alt: 'Generac generator installation by TZ Electric' },
    features: [
      { title: 'Generac Authorized Dealer', description: 'Factory-trained and authorized — we install Generac generators to manufacturer specifications with full warranty support.' },
      { title: 'Automatic Transfer Switch', description: 'The Generac ATS monitors utility power and switches to generator within seconds of detecting an outage.' },
      { title: 'Mobile App Monitoring', description: 'Monitor your generator\'s status, run history, and receive alerts via the Generac Mobile Link app.' },
      { title: 'Wide Model Range', description: 'Generac offers units from 10kW to 150kW+ — we help you select the right model for your home and budget.' },
      { title: 'Factory Warranty', description: 'Full Generac manufacturer\'s warranty on all units we install — backed by our local service team.' },
      { title: 'Certified Service & Repair', description: 'Authorized to perform warranty and non-warranty repairs on all Generac residential models.' },
    ],
    faqs: [
      {
        question: 'Why choose Generac?',
        answer: 'Generac is the most-installed home standby generator brand in North America. Their systems are proven, parts are widely available, and the warranty is among the best in the industry.',
      },
      {
        question: 'Can I monitor my Generac remotely?',
        answer: 'Yes. The Generac Mobile Link app lets you check status, view run history, receive maintenance alerts, and monitor your system from anywhere.',
      },
      {
        question: 'What warranty does Generac offer?',
        answer: 'Most residential Generac models include a 5-year limited warranty. Installation by an authorized dealer like TZ Electric is required to activate the full warranty.',
      },
    ],
  },

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'standby',
    title: 'Standby Generator Installation',
    metaTitle: 'Standby Generator Installation Hudson Valley | Automatic Backup Power',
    metaDescription:
      'Standby generator installation in the Hudson Valley. Automatic backup power for essential circuits. Licensed installation, fully permitted. Call (518) 678-1230.',
    heroTitle: 'Standby Generator Installation',
    heroDescription:
      'A standby generator starts automatically the moment the power goes out — no manual startup, no running to the garage. Protect your home\'s essential systems without lifting a finger.',
    image: { src: '/images/services/generator.webp', alt: 'Standby generator installation by TZ Electric' },
    features: [
      { title: 'Fully Automatic Operation', description: 'Detects outages and starts automatically within seconds — even if you\'re away from home.' },
      { title: 'Essential Circuit Protection', description: 'Keep your HVAC, refrigerator, lights, sump pump, and security system running during outages.' },
      { title: 'Quiet, Low-Vibration Units', description: 'Modern standby generators run at conversation-level noise — far quieter than older portable generators.' },
      { title: 'Weekly Self-Test', description: 'Your generator automatically exercises itself weekly to verify it\'s ready when you need it.' },
      { title: 'Licensed, Permitted Installation', description: 'Fully permitted installation with all required inspections — protecting your home\'s insurability.' },
      { title: 'Load Management', description: 'Smart load management ensures critical circuits are always powered without overloading the generator.' },
    ],
    faqs: [
      {
        question: 'What is the difference between a standby and a portable generator?',
        answer: 'A standby generator is permanently installed, connected to your fuel supply, and starts automatically. A portable generator requires manual setup, has limited run time, and must be operated outdoors.',
      },
      {
        question: 'What can a standby generator power?',
        answer: 'Depends on the size. Smaller units cover essential circuits (HVAC, fridge, lights). Larger units can power your entire home. We help you size it for your priorities.',
      },
      {
        question: 'How long can a standby generator run?',
        answer: 'Indefinitely as long as fuel is available. Connected to a natural gas line, there\'s no practical fuel limit. Propane-powered systems depend on your tank size.',
      },
    ],
  },

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'backup',
    title: 'Backup Generator Installation',
    metaTitle: 'Backup Generator Installation Hudson Valley | Home Backup Power',
    metaDescription:
      'Backup generator installation in the Hudson Valley. Protect your home from power outages. Natural gas or propane. Licensed & insured. Call (518) 678-1230.',
    heroTitle: 'Backup Generator Installation',
    heroDescription:
      'Power outages in the Hudson Valley can last hours or days. A backup generator keeps your home safe, comfortable, and protected — automatically, every time.',
    image: { src: '/images/services/generator.webp', alt: 'Backup generator installation by TZ Electric' },
    features: [
      { title: 'Immediate Power Restoration', description: 'Restore power within seconds of an outage — before food spoils, pipes freeze, or sump pumps fail.' },
      { title: 'Essential Appliance Protection', description: 'Keep your HVAC, refrigerator, medical equipment, and security system running during extended outages.' },
      { title: 'Natural Gas or Propane Options', description: 'We install both fuel types — we help you determine which is best for your property.' },
      { title: 'Automatic Transfer Switch', description: 'The transfer switch safely disconnects your home from the grid and connects to generator power automatically.' },
      { title: 'System Testing & Commissioning', description: 'We perform a full load test before completing your installation — your system is verified to work under real conditions.' },
      { title: 'Financing Available', description: 'Protect your home now and pay over time with flexible financing through Wisetack and Synchrony.' },
    ],
    faqs: [
      {
        question: 'What size backup generator do I need?',
        answer: 'We perform a free load calculation based on your home\'s circuits and priorities. Most homes need 13–22kW for essential circuit coverage.',
      },
      {
        question: 'How quickly does a backup generator start?',
        answer: 'Automatic standby generators start within 10 seconds of detecting an outage. Power is restored before most appliances even notice the interruption.',
      },
      {
        question: 'Do backup generators require permits?',
        answer: 'Yes. All generator installations require permits and utility coordination. We handle all of this for you as part of the installation process.',
      },
    ],
  },

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'emergency-service',
    title: 'Emergency Generator Service',
    metaTitle: 'Emergency Generator Repair Hudson Valley | Fast Response',
    metaDescription:
      'Emergency generator repair in the Hudson Valley. Fast response when your generator fails during an outage. All brands serviced. Call (518) 678-1230.',
    heroTitle: 'Emergency Generator Service & Repair',
    heroDescription:
      'Your generator failed right when you needed it most. We provide priority emergency service for generator failures during power outages — fast diagnosis, fast repair.',
    image: { src: '/images/services/generator.webp', alt: 'Emergency generator repair by TZ Electric' },
    features: [
      { title: 'Priority Emergency Dispatch', description: 'Generator failures during outages are prioritized — we get to you as fast as possible.' },
      { title: 'All Major Brands Serviced', description: 'We service Generac, Kohler, Briggs & Stratton, Cummins, and most other residential generator brands.' },
      { title: 'On-Site Diagnosis & Repair', description: 'Full diagnostic of engine, electrical, transfer switch, and control board issues — most repairs completed on-site.' },
      { title: 'Battery Replacement', description: 'Dead starter battery is the #1 cause of generator failure. We carry replacement batteries and swap them on-site.' },
      { title: 'Overdue Maintenance Catch-Up', description: 'If skipped maintenance caused the failure, we perform a full service to restore reliability before we leave.' },
      { title: 'Transfer Switch Repair', description: 'Diagnose and repair automatic transfer switch failures that prevent your generator from taking over.' },
    ],
    faqs: [
      {
        question: 'Why won\'t my generator start during an outage?',
        answer: 'The most common causes are a dead starter battery, low oil shutdown, stale fuel (in rarely-used generators), or a failed transfer switch. We diagnose all of these on-site.',
      },
      {
        question: 'Do you service all generator brands?',
        answer: 'We primarily service Generac (as an authorized dealer) but work on most major residential generator brands. Call us with your brand and model for confirmation.',
      },
      {
        question: 'How can I avoid generator failures in the future?',
        answer: 'Annual maintenance is the best prevention. We offer generator maintenance plans that include oil changes, filter service, battery checks, and full load testing.',
      },
    ],
  },

  // ─── HOT WATER HEATERS ────────────────────────────────────────────────────

  {
    parent: 'hot-water-heaters',
    parentTitle: 'Hot Water Heater Services',
    slug: 'tankless',
    title: 'Tankless Water Heater Installation',
    metaTitle: 'Tankless Water Heater Installation Hudson Valley | On-Demand Hot Water',
    metaDescription:
      'Tankless water heater installation in the Hudson Valley. Endless hot water, energy savings, 20+ year lifespan. Gas, propane, and electric options. Call (518) 678-1230.',
    heroTitle: 'Tankless Water Heater Installation',
    heroDescription:
      'Never run out of hot water again. Tankless water heaters deliver endless on-demand hot water at up to 40% less energy than traditional tank heaters — with a lifespan of 20+ years.',
    image: { src: '/images/services/water-heater.png', alt: 'Tankless water heater installation by TZ Electric' },
    features: [
      { title: 'Endless On-Demand Hot Water', description: 'Heat water only when you need it — no tank to run out of, no waiting for a tank to reheat.' },
      { title: 'Energy Savings', description: 'Eliminates standby heat loss from a storage tank. Most homeowners see 15–40% reduction in water heating costs.' },
      { title: 'Space-Saving Wall-Mount Design', description: 'Mounts on the wall and frees up the floor space your old tank water heater occupied.' },
      { title: '20+ Year Lifespan', description: 'Tankless units outlast traditional water heaters significantly with proper annual maintenance.' },
      { title: 'Gas, Propane & Electric Options', description: 'We install all fuel types — we help you choose based on your existing setup and hot water demand.' },
      { title: 'Gas Line & Panel Coordination', description: 'If your installation requires a new gas line or panel upgrade, we handle it all in one project.' },
    ],
    faqs: [
      {
        question: 'How much does a tankless water heater installation cost?',
        answer: 'Typically $1,500–$3,500 installed depending on unit type and whether gas line or electrical work is needed. We provide free, detailed estimates.',
      },
      {
        question: 'Can a tankless water heater handle multiple showers at once?',
        answer: 'Yes, if properly sized. We calculate your peak demand during the estimate to ensure the unit you choose can handle simultaneous hot water use.',
      },
      {
        question: 'Do I need a gas line or panel upgrade for a tankless unit?',
        answer: 'Gas units require adequate gas line capacity (often an upgrade from a tank heater). Electric units require a significant amperage draw. We assess your home during the free consultation.',
      },
    ],
  },

  {
    parent: 'hot-water-heaters',
    parentTitle: 'Hot Water Heater Services',
    slug: 'traditional',
    title: 'Traditional Water Heater Replacement',
    metaTitle: 'Water Heater Replacement Hudson Valley | Same-Day Service',
    metaDescription:
      'Traditional tank water heater replacement in the Hudson Valley. Same-day service available. 40–80 gallon gas and electric models. Call (518) 678-1230.',
    heroTitle: 'Traditional Water Heater Replacement',
    heroDescription:
      'When your water heater fails, you don\'t have time to wait. We stock common water heater models and offer same-day replacement service for most Hudson Valley homes.',
    image: { src: '/images/services/water-heater.png', alt: 'Water heater replacement by TZ Electric' },
    features: [
      { title: 'Same-Day Replacement Service', description: 'Most replacements are completed the same day you call — we keep common models in stock.' },
      { title: '40–80 Gallon Options', description: 'We right-size your replacement based on your household size and hot water usage.' },
      { title: 'Gas & Electric Models', description: 'We install both gas and electric tank water heaters from leading brands.' },
      { title: 'Old Unit Removal & Disposal', description: 'We disconnect, remove, and properly dispose of your old unit as part of the installation.' },
      { title: 'Fully Permitted & Inspected', description: 'All water heater installations are permitted and meet current code requirements.' },
      { title: 'Expansion Tank Installation', description: 'Where required by code or needed for your system, we install a thermal expansion tank.' },
    ],
    faqs: [
      {
        question: 'How do I know my water heater needs replacing?',
        answer: 'Signs: over 10–12 years old, rusty or discolored hot water, water pooling under the unit, rumbling/popping noises, or inconsistent hot water temperature.',
      },
      {
        question: 'How long does a water heater replacement take?',
        answer: 'Typically 2–4 hours from arrival to completion, including removal of the old unit.',
      },
      {
        question: 'What size water heater do I need?',
        answer: 'A 40-gallon unit works for 1–3 people. 50 gallons for 3–4 people. 75–80 gallons for larger households. We confirm sizing during the estimate.',
      },
    ],
  },

  {
    parent: 'hot-water-heaters',
    parentTitle: 'Hot Water Heater Services',
    slug: 'repair',
    title: 'Water Heater Repair',
    metaTitle: 'Water Heater Repair Hudson Valley | Fast Diagnosis & Fix',
    metaDescription:
      'Water heater repair in the Hudson Valley. Thermostat, element, anode rod, pressure relief valve, and leak repair. All brands. Call (518) 678-1230.',
    heroTitle: 'Water Heater Repair Services',
    heroDescription:
      'No hot water, strange noises, or a leaking tank? Our technicians diagnose and repair all water heater problems quickly — often the same day you call.',
    image: { src: '/images/services/water-heater.png', alt: 'Water heater repair by TZ Electric' },
    features: [
      { title: 'Thermostat & Heating Element Repair', description: 'Fix inconsistent hot water temperature or no hot water caused by failed thermostats or elements.' },
      { title: 'Pressure Relief Valve Replacement', description: 'Replace faulty T&P valves — a critical safety component that must function properly.' },
      { title: 'Anode Rod Replacement', description: 'Replace the sacrificial anode rod that prevents tank corrosion and significantly extends water heater life.' },
      { title: 'Sediment Flush', description: 'Flush accumulated sediment that causes rumbling noises, reduced efficiency, and shortened lifespan.' },
      { title: 'Leak Diagnosis & Repair', description: 'Identify the source of a water heater leak — connection, valve, or tank — and fix it before it causes water damage.' },
      { title: 'All Brands Serviced', description: 'We repair Rheem, Bradford White, A.O. Smith, State, Navien, Rinnai, and most other brands.' },
    ],
    faqs: [
      {
        question: 'Why is my water heater making a rumbling noise?',
        answer: 'Rumbling or popping sounds are almost always caused by sediment buildup on the tank bottom. A sediment flush usually resolves this and improves efficiency.',
      },
      {
        question: 'Should I repair or replace my water heater?',
        answer: 'If the unit is under 8 years old and the repair is a component (thermostat, element, valve), repair is usually the right call. Older units or tanks with corrosion are better off replaced.',
      },
      {
        question: 'Do you repair tankless water heaters too?',
        answer: 'Yes. We service both tank and tankless water heaters, including diagnostic fault codes and component replacement on Navien, Rinnai, Takagi, and other brands.',
      },
    ],
  },

  {
    parent: 'hot-water-heaters',
    parentTitle: 'Hot Water Heater Services',
    slug: 'maintenance',
    title: 'Water Heater Maintenance',
    metaTitle: 'Water Heater Maintenance Hudson Valley | Annual Service',
    metaDescription:
      'Annual water heater maintenance in the Hudson Valley. Flush, inspect, and tune up your water heater to extend its life and maintain efficiency. Call (518) 678-1230.',
    heroTitle: 'Water Heater Maintenance',
    heroDescription:
      'Annual water heater maintenance is the single best way to extend your unit\'s life, maintain efficiency, and avoid unexpected failures. We make it simple.',
    image: { src: '/images/services/water-heater.png', alt: 'Water heater maintenance by TZ Electric' },
    features: [
      { title: 'Annual Tank Flush & Inspection', description: 'Remove sediment buildup and inspect the tank, connections, and components for early signs of wear.' },
      { title: 'Anode Rod Inspection & Replacement', description: 'Check and replace the sacrificial anode rod that prevents corrosion — the key to long tank life.' },
      { title: 'Temperature & Pressure Testing', description: 'Verify the T&P valve operates correctly and that water temperature is set safely and accurately.' },
      { title: 'Thermostat Calibration', description: 'Confirm your thermostat is accurate — factory settings often drift over time.' },
      { title: 'Connections & Seals Inspection', description: 'Check all water line connections and seals for early signs of leaks or corrosion.' },
      { title: 'Efficiency Assessment', description: 'Evaluate whether your unit is still operating cost-effectively or approaching end-of-life.' },
    ],
    faqs: [
      {
        question: 'How often should a water heater be serviced?',
        answer: 'Annual maintenance is recommended for tank water heaters. Tankless units can go 2–3 years between services but benefit from annual descaling in hard water areas.',
      },
      {
        question: 'What happens if I skip maintenance?',
        answer: 'Sediment accumulates, reducing efficiency and causing overheating. The anode rod depletes, allowing tank corrosion. Small issues go undetected until they become failures.',
      },
      {
        question: 'Can maintenance extend my water heater\'s life?',
        answer: 'Yes, significantly. A well-maintained water heater can last 15+ years. Neglected units often fail before 10 years. The cost of annual maintenance is far less than early replacement.',
      },
    ],
  },
]

export function getSubServicePage(parent: string, slug: string): SubServicePage | undefined {
  return SUB_SERVICE_PAGES.find((s) => s.parent === parent && s.slug === slug)
}

export function getSubServicesByParent(parent: string): SubServicePage[] {
  return SUB_SERVICE_PAGES.filter((s) => s.parent === parent)
}
