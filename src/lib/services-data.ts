export interface ServicePage {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  heroTitle: string
  heroDescription: string
  image: { src: string; alt: string }
  features: { title: string; description: string }[]
  faqs: { question: string; answer: string }[]
}

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'electrical',
    title: 'Electrical Services',
    metaTitle: 'Electrician in Hudson Valley, NY | Electrical Services',
    metaDescription:
      'Licensed electrician serving the Hudson Valley. Panel upgrades, rewiring, lighting, EV chargers, whole-home surge protection. Call (518) 678-1230 for a free quote.',
    heroTitle: 'Expert Electrical Services',
    heroDescription:
      'From panel upgrades to whole-home rewiring, our licensed electricians deliver safe, code-compliant electrical work for your home.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'Professional electrical panel upgrade by TZ Electric' },
    features: [
      { title: 'Panel Upgrades', description: '100A to 200A panel upgrades for modern electrical demands.' },
      { title: 'Whole-Home Rewiring', description: 'Safe, code-compliant rewiring for older homes.' },
      { title: 'Lighting Installation', description: 'Indoor, outdoor, recessed, and landscape lighting.' },
      { title: 'EV Charger Installation', description: 'Level 2 home charging stations for electric vehicles.' },
      { title: 'Surge Protection', description: 'Whole-home surge protection to safeguard your electronics.' },
      { title: 'Ceiling Fan Installation', description: 'Professional installation and wiring for ceiling fans.' },
    ],
    faqs: [
      {
        question: 'How do I know if I need a panel upgrade?',
        answer: 'If your home has a 100-amp panel, frequently trips breakers, or you\'re adding major appliances like EV chargers or mini splits, a panel upgrade to 200 amps is recommended.',
      },
      {
        question: 'Do you install EV chargers?',
        answer: 'Yes! We install Level 2 EV chargers for all major electric vehicle brands. We handle the electrical work, permitting, and installation.',
      },
      {
        question: 'How much does rewiring a house cost?',
        answer: 'Rewiring costs vary based on home size and complexity. We provide free, detailed estimates. Contact us for an upfront quote with no hidden fees.',
      },
    ],
  },
  {
    slug: 'hvac',
    title: 'HVAC Services',
    metaTitle: 'HVAC Contractor Hudson Valley, NY | Heating & Cooling',
    metaDescription:
      'Expert HVAC installation, repair & maintenance in the Hudson Valley. Furnaces, AC systems, heat pumps, ductwork. 330+ 5-star reviews. Call (518) 678-1230.',
    heroTitle: 'Heating & Cooling Experts',
    heroDescription:
      'Keep your home comfortable year-round with our expert HVAC services. Installation, repair, and maintenance for all heating and cooling systems.',
    image: { src: '/images/services/hvac-hero.png', alt: 'HVAC system installation and maintenance by TZ Electric' },
    features: [
      { title: 'Furnace Installation & Repair', description: 'High-efficiency furnace installation, repair, and maintenance.' },
      { title: 'Air Conditioning', description: 'Central AC installation, repair, and seasonal tune-ups.' },
      { title: 'Heat Pumps', description: 'Energy-efficient heat pump systems for year-round comfort.' },
      { title: 'Ductwork', description: 'Duct installation, repair, sealing, and cleaning.' },
      { title: 'Maintenance Plans', description: 'Annual maintenance plans to extend system life and prevent breakdowns.' },
    ],
    faqs: [
      {
        question: 'How often should I service my HVAC system?',
        answer: 'We recommend annual maintenance — heating systems in fall and AC systems in spring. Regular maintenance prevents breakdowns and extends equipment life.',
      },
      {
        question: 'Should I repair or replace my furnace?',
        answer: 'If your furnace is over 15 years old, requires frequent repairs, or your energy bills are rising, replacement with a high-efficiency unit is usually more cost-effective.',
      },
      {
        question: 'Do you offer HVAC financing?',
        answer: 'Yes! We offer flexible financing through Wisetack and Synchrony so you can get the comfort you need today and pay over time.',
      },
    ],
  },
  {
    slug: 'mini-split',
    title: 'Mini Split Installation',
    metaTitle: 'Mini Split Installation Hudson Valley | Mitsubishi Diamond Elite',
    metaDescription:
      'Mitsubishi Diamond Elite mini split installer in the Hudson Valley. Ductless heating & cooling for any room. Energy-efficient comfort. Call (518) 678-1230.',
    heroTitle: 'Ductless Mini Split Systems',
    heroDescription:
      'As a Mitsubishi Diamond Elite Contractor, we provide top-tier ductless mini split installation, repair, and maintenance for ultimate comfort and efficiency.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Mitsubishi ductless mini split installation by TZ Electric' },
    features: [
      { title: 'Single-Zone Systems', description: 'Perfect for adding comfort to a single room or addition.' },
      { title: 'Multi-Zone Systems', description: 'Control temperatures independently in multiple rooms.' },
      { title: 'Hyper-Heating', description: 'Mitsubishi Hyper-Heat systems that work efficiently down to -13°F.' },
      { title: 'Concealed Duct Units', description: 'Hidden installation for a clean, seamless look.' },
      { title: 'Repair & Maintenance', description: 'Expert service for all mini split brands and models.' },
      { title: 'Energy Rebates', description: 'We help you maximize available energy efficiency rebates.' },
    ],
    faqs: [
      {
        question: 'What is a Mitsubishi Diamond Elite Contractor?',
        answer: 'Diamond Elite is Mitsubishi\'s highest dealer tier. It means we\'ve completed extensive training, maintain high installation standards, and can offer the best warranties available.',
      },
      {
        question: 'How much does a mini split cost?',
        answer: 'A single-zone mini split typically costs between $3,000-$5,000 installed. Multi-zone systems vary based on the number of indoor units. We provide free, detailed quotes.',
      },
      {
        question: 'Do mini splits work in cold weather?',
        answer: 'Yes! Mitsubishi Hyper-Heat mini splits are designed for cold climates and operate efficiently down to -13°F, making them perfect for Hudson Valley winters.',
      },
    ],
  },
  {
    slug: 'generator',
    title: 'Generator Installation',
    metaTitle: 'Generac Generator Installation Hudson Valley | Authorized Dealer',
    metaDescription:
      'Generac authorized generator dealer in the Hudson Valley. Whole-home standby generators. Automatic power protection. Free estimates. Call (518) 678-1230.',
    heroTitle: 'Whole-Home Generator Solutions',
    heroDescription:
      'As a Generac Authorized Dealer, we provide expert generator installation, maintenance, and repair to keep your home powered during any outage.',
    image: { src: '/images/services/generator.webp', alt: 'Generac whole-home standby generator installed by TZ Electric' },
    features: [
      { title: 'Whole-Home Generators', description: 'Automatic standby generators that power your entire home.' },
      { title: 'Generator Sizing', description: 'Expert load calculation to determine the right generator size.' },
      { title: 'Automatic Transfer Switch', description: 'Seamless automatic power transfer during outages.' },
      { title: 'Maintenance Plans', description: 'Annual maintenance to keep your generator ready when you need it.' },
      { title: 'Repair Service', description: 'Fast repair service for all generator brands.' },
      { title: 'Fuel Options', description: 'Natural gas and propane generator options available.' },
    ],
    faqs: [
      {
        question: 'How much does a whole-home generator cost?',
        answer: 'Whole-home Generac generators typically range from $5,000-$15,000 installed, depending on size and fuel type. We provide free in-home consultations and quotes.',
      },
      {
        question: 'How long does generator installation take?',
        answer: 'Most residential generator installations are completed in 1-2 days, plus time for permitting and utility coordination.',
      },
      {
        question: 'Do generators need maintenance?',
        answer: 'Yes, annual maintenance is recommended. Our maintenance plans include oil changes, filter replacement, and full system testing to ensure reliability.',
      },
    ],
  },
  {
    slug: 'plumbing',
    title: 'Plumbing Services',
    metaTitle: 'Plumber Hudson Valley, NY | Expert Plumbing Services',
    metaDescription:
      'Licensed plumber in the Hudson Valley. Pipe repair, drain cleaning, fixture installation, water line repair. Call (518) 678-1230.',
    heroTitle: 'Full-Service Plumbing Solutions',
    heroDescription:
      'From routine repairs to complete plumbing overhauls, our licensed plumbers deliver reliable, lasting solutions for your home.',
    image: { src: '/images/services/plumbing.jpg', alt: 'Licensed plumbing services by TZ Electric' },
    features: [
      { title: 'Pipe Repair & Replacement', description: 'Fix leaks, burst pipes, and corroded plumbing.' },
      { title: 'Drain Cleaning', description: 'Professional drain cleaning and clog removal.' },
      { title: 'Fixture Installation', description: 'Faucets, sinks, toilets, and shower installation.' },
      { title: 'Water Line Repair', description: 'Main water line repair and replacement.' },
    ],
    faqs: [
      {
        question: 'Do you offer emergency plumbing?',
        answer: 'Yes! We offer 24/7 emergency plumbing service. Burst pipes, sewage backups, and major leaks can\'t wait — call us anytime at (518) 678-1230.',
      },
      {
        question: 'How often should I have my drains cleaned?',
        answer: 'We recommend annual drain cleaning as preventative maintenance. If you notice slow drains, gurgling sounds, or recurring clogs, schedule a professional cleaning right away.',
      },
      {
        question: 'Do you install new fixtures?',
        answer: 'Yes! We handle all fixture installations including faucets, sinks, toilets, showers, and bathtubs. We can also help you choose the right fixtures for your home.',
      },
    ],
  },
  {
    slug: 'hot-water-heaters',
    title: 'Hot Water Heater Services',
    metaTitle: 'Water Heater Installation Hudson Valley | Tankless & Traditional',
    metaDescription:
      'Water heater installation & repair in the Hudson Valley. Tankless, traditional, and hybrid water heaters. Same-day service available. Call (518) 678-1230.',
    heroTitle: 'Hot Water Heater Solutions',
    heroDescription:
      'Expert installation, repair, and replacement for tankless and traditional water heaters. Never run out of hot water again.',
    image: { src: '/images/services/water-heater.png', alt: 'Water heater installation and repair by TZ Electric' },
    features: [
      { title: 'Tankless Water Heaters', description: 'Endless hot water with energy-efficient tankless systems.' },
      { title: 'Traditional Tank Heaters', description: 'Reliable tank water heater installation and replacement.' },
      { title: 'Hybrid Heat Pump Heaters', description: 'Ultra-efficient hybrid water heaters that cut energy costs.' },
      { title: 'Water Heater Repair', description: 'Fast repair service for all brands and models.' },
      { title: 'Annual Maintenance', description: 'Flush and inspect service to extend water heater life.' },
      { title: 'Emergency Replacement', description: 'Same-day water heater replacement when yours fails.' },
    ],
    faqs: [
      {
        question: 'How long do water heaters last?',
        answer: 'Traditional tank water heaters last 8-12 years. Tankless units can last 20+ years with proper maintenance. If yours is over 10 years old, consider upgrading.',
      },
      {
        question: 'Should I get a tankless water heater?',
        answer: 'Tankless water heaters are ideal for homes that need endless hot water and want to save on energy costs. They cost more upfront but save money long-term.',
      },
      {
        question: 'How quickly can you replace a water heater?',
        answer: 'In most cases, we can replace a water heater the same day you call. We keep common models in stock for fast turnaround.',
      },
    ],
  },
  {
    slug: 'emergency',
    title: '24/7 Emergency Services',
    metaTitle: '24/7 Emergency Plumbing, Heating & Electrical | Hudson Valley',
    metaDescription:
      '24/7 emergency plumbing, heating, cooling, and electrical services in the Hudson Valley. Fast response, expert repairs. Call (518) 678-1230 now.',
    heroTitle: '24/7 Emergency Services',
    heroDescription:
      'When emergencies strike, we\'re here. Our team is available around the clock for urgent plumbing, heating, cooling, and electrical repairs.',
    image: { src: '/images/services/emergency-24-7.avif', alt: '24/7 emergency plumbing, heating, and electrical services' },
    features: [
      { title: 'Emergency Plumbing', description: 'Burst pipes, sewage backups, major leaks — we respond fast.' },
      { title: 'No-Heat Calls', description: 'Furnace or boiler failures in winter demand immediate attention.' },
      { title: 'No-AC Emergencies', description: 'AC breakdowns during heat waves — we\'ll get you cool fast.' },
      { title: 'Electrical Emergencies', description: 'Power outages, sparking outlets, and electrical hazards.' },
    ],
    faqs: [
      {
        question: 'What counts as a plumbing emergency?',
        answer: 'Burst pipes, sewage backups, no water, major leaks that can\'t be contained, and gas leaks are all emergencies. Call us immediately at (518) 678-1230.',
      },
      {
        question: 'Is there an extra charge for emergency service?',
        answer: 'Emergency service rates may apply for after-hours calls. We always provide upfront pricing before starting work — no surprises.',
      },
      {
        question: 'How fast can you respond?',
        answer: 'We aim to respond to emergency calls within 1-2 hours in our service area. For life-threatening situations like gas leaks, call 911 first, then call us.',
      },
    ],
  },
]

export function getServiceBySlug(slug: string): ServicePage | undefined {
  return SERVICE_PAGES.find((s) => s.slug === slug)
}
