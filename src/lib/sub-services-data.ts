import type { ServicePage } from '@/lib/services-data'

export interface SubServicePage extends ServicePage {
  parent: string
  parentTitle: string
  overview?: string[]
  process?: { step: string; title: string; description: string }[]
  signsList?: { title: string; description: string }[]
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
    heroTitle: 'EV Charger Installation',
    heroDescription:
      'Charge smarter at home. Our licensed electricians install Level 2 EV chargers for every major electric vehicle brand — fast, safe, and fully permitted.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'EV charger installation by TZ Electric' },
    overview: [
      'Owning an electric vehicle is just the beginning — having a proper home charging setup is what makes EV ownership seamless. A Level 2 home charger uses a dedicated 240V circuit and can fully charge most EVs overnight, giving you the range you need every morning without the hassle of public charging stations.',
      'Our licensed electricians assess your existing panel capacity, size the circuit correctly, run the wiring to your garage or driveway, and install the charger — handling all permits and coordinating the required inspection. We support all major EV brands including Tesla, Rivian, Ford, GM, BMW, Hyundai, and more.',
      'If your electrical panel doesn\'t have the capacity for a dedicated EV circuit, we can upgrade your service at the same time. We give you upfront pricing before any work begins so there are no surprises.',
    ],
    process: [
      { step: '1', title: 'Site Assessment', description: 'We evaluate your panel capacity, garage layout, and wiring path to determine the best installation approach.' },
      { step: '2', title: 'Upfront Quote', description: 'You receive a detailed, fixed-price quote covering all labor, materials, and permit fees — no hidden charges.' },
      { step: '3', title: 'Permitted Installation', description: 'We pull the permit, run the 240V circuit, mount the charger, and complete all connections to code.' },
      { step: '4', title: 'Inspection & Sign-Off', description: 'We coordinate the electrical inspection and walk you through your new charger before we leave.' },
    ],
    features: [
      { title: 'Level 2 Home Charger Installation', description: '240V dedicated circuit installation — charge your EV 5x faster than a standard 120V outlet. Most EVs reach a full charge overnight.' },
      { title: 'All EV Brands Supported', description: 'Compatible with Tesla, Rivian, Ford, Chevy, BMW, Hyundai, Kia, and every other major electric vehicle manufacturer.' },
      { title: 'Permit & Panel Assessment', description: 'We handle all permits and verify your panel has sufficient capacity before installation begins — no surprises after the job starts.' },
      { title: 'Smart Charger Integration', description: 'WiFi-enabled chargers with app monitoring so you can track energy usage, schedule charging during off-peak hours, and get alerts from your phone.' },
      { title: 'Load Calculation & Proper Sizing', description: 'Correct wire gauge, breaker size, and conduit routing for your specific vehicle and daily charging demands — done right the first time.' },
      { title: 'Panel Upgrade Coordination', description: 'If your panel needs an upgrade to support a charger, we handle both in a single project — no need to coordinate two separate contractors.' },
    ],
    faqs: [
      {
        question: 'Do I need a panel upgrade to install an EV charger?',
        answer: 'Not always. We assess your existing panel capacity first. Many homes with 200-amp service have available capacity for a dedicated EV circuit. If your panel is older or already near capacity, we can upgrade it at the same time.',
      },
      {
        question: 'How long does EV charger installation take?',
        answer: 'Most Level 2 EV charger installations are completed in 4–8 hours. If panel work is needed, the project may extend to a full day. We work efficiently to minimize disruption.',
      },
      {
        question: 'What is the difference between Level 1 and Level 2 charging?',
        answer: 'Level 1 uses a standard 120V household outlet and adds roughly 3–5 miles of range per hour — fine for plug-in hybrids but too slow for most full EVs. Level 2 uses a 240V dedicated circuit and adds 20–30 miles per hour, giving most EVs a full charge overnight.',
      },
      {
        question: 'Can I install any brand of EV charger?',
        answer: 'Yes. We install all major charger brands including ChargePoint, Enel X JuiceBox, Emporia, and manufacturer-specific units. We recommend chargers based on your vehicle, usage habits, and whether you want smart features.',
      },
      {
        question: 'Is a permit required for EV charger installation?',
        answer: 'Yes, in most municipalities a permit is required for a new 240V circuit. We handle permitting and the required inspection as part of every installation — never use an electrician who skips this step.',
      },
    ],
    signsList: [
      { title: 'You Rely on Public Charging Stations', description: 'If you\'re regularly stopping at public chargers or relying on a slow Level 1 trickle charge at home, a Level 2 home charger eliminates that entirely — wake up to a full battery every morning.' },
      { title: 'You Drive Your EV Daily', description: 'Daily EV drivers need 20–30+ miles of range added each night. Only a Level 2 charger on a 240V circuit can reliably do that overnight for most vehicles.' },
      { title: 'You\'re Getting a New EV', description: 'The best time to install a Level 2 charger is before the vehicle arrives — so your setup is ready on day one. We work with your delivery timeline.' },
      { title: 'Your Current Outlet Is Too Slow', description: 'A standard 120V outlet adds 3–5 miles of range per hour — barely enough for plug-in hybrids, and impractical for full EVs that need 200+ miles replenished overnight.' },
      { title: 'You\'re Adding a Second EV', description: 'Two EVs on one slow outlet creates a charging bottleneck. A dedicated Level 2 circuit — or two — handles both vehicles without compromise.' },
      { title: 'You Want Smart Charging Features', description: 'Modern Level 2 chargers offer app control, usage monitoring, off-peak scheduling, and energy tracking. A proper 240V installation is required to use them.' },
    ],
  },

  {
    parent: 'electrical',
    parentTitle: 'Electrical Services',
    slug: 'panel-upgrade',
    title: 'Electrical Panel Upgrade',
    metaTitle: 'Electrical Panel Upgrade Hudson Valley | 200 Amp Service',
    metaDescription:
      'Licensed electrical panel upgrades in the Hudson Valley. Upgrade from 100A to 200A, replace unsafe legacy panels, and meet modern code. Call (518) 678-1230.',
    heroTitle: 'Electrical Panel Upgrades',
    heroDescription:
      'Outdated panels are a safety hazard and can\'t handle the demands of a modern home. We upgrade your service to 200A — safe, code-compliant, and ready for EV chargers, mini splits, and everything else.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'Electrical panel upgrade by TZ Electric' },
    overview: [
      'Your electrical panel is the heart of your home\'s electrical system — every circuit, outlet, and appliance depends on it. Most older homes were built with 100-amp service at a time when homes used far less electricity. Today, with EV chargers, heat pumps, whole-home generators, and modern appliances, a 200-amp panel isn\'t optional — it\'s necessary.',
      'Federal Pacific and Zinsco panels, found in millions of homes built between the 1950s and 1980s, are known to have serious safety defects. Breakers in these panels can fail to trip during an overload, leading to overheating and electrical fires. Replacing them is one of the most important safety upgrades you can make.',
      'Our licensed electricians handle every aspect of your panel upgrade — from the permit and utility coordination to the installation and final inspection. We give you a fixed-price quote upfront, keep your power outage window as short as possible, and leave your home with a clean, properly labeled panel that meets current code.',
    ],
    process: [
      { step: '1', title: 'Consultation & Assessment', description: 'We review your current panel, service entrance, and electrical load to determine the right upgrade scope for your home.' },
      { step: '2', title: 'Permit & Utility Coordination', description: 'We pull the permit and coordinate with your utility company to schedule the service disconnect — handling all the paperwork for you.' },
      { step: '3', title: 'Panel Replacement', description: 'Your old panel is removed and a new code-compliant panel installed, with all circuits reconnected, labeled, and protected.' },
      { step: '4', title: 'Inspection & Restoration', description: 'We pass the required electrical inspection and restore full power — usually completing the entire job in a single day.' },
    ],
    features: [
      { title: '100A to 200A Service Upgrade', description: 'Handle EV chargers, mini splits, home additions, and modern appliances without tripping breakers or overloading your system.' },
      { title: 'Federal Pacific & Zinsco Replacement', description: 'Replace known-hazardous legacy panels that have documented fire risks. One of the most important safety upgrades for older homes.' },
      { title: 'Circuit Breaker Replacement', description: 'Replace individual faulty or aging breakers that trip frequently, fail to trip under load, or no longer hold their position.' },
      { title: 'GFCI & AFCI Protection', description: 'Install ground fault and arc fault circuit interrupter protection required by modern code — in bathrooms, kitchens, bedrooms, and garages.' },
      { title: 'Service Entrance Upgrade', description: 'Full utility service entrance upgrades where needed, coordinated directly with your utility company to minimize downtime.' },
      { title: 'Full Permit & Inspection', description: 'Every panel upgrade includes permits and a required inspection. We handle all of it — your home\'s insurance and resale value depend on it.' },
    ],
    faqs: [
      {
        question: 'How do I know if I need a panel upgrade?',
        answer: 'Signs you need an upgrade: your panel is over 20 years old, you have a Federal Pacific or Zinsco panel, breakers trip frequently, you\'re adding high-load equipment like an EV charger or mini split, or your home was built before 1980 and still has the original panel.',
      },
      {
        question: 'How long does a panel upgrade take?',
        answer: 'Most panel upgrades are completed in a single day (6–8 hours). Your power will be off during the work, but we minimize the downtime window and restore power before we leave.',
      },
      {
        question: 'What is a Federal Pacific panel and why is it dangerous?',
        answer: 'Federal Pacific Electric (FPE) Stab-Lok panels were installed in millions of US homes from the 1950s through the 1980s. They have a documented defect where breakers can fail to trip during an overload, causing wires to overheat and potentially start a fire. If you have one, replacement is strongly recommended.',
      },
      {
        question: 'Does a panel upgrade require a permit?',
        answer: 'Always. We handle all permitting and coordinate the required inspection. Never use an electrician who skips the permit — it can affect your homeowners insurance, your ability to sell, and most importantly, your safety.',
      },
      {
        question: 'Can I add more circuits after my panel is upgraded?',
        answer: 'Yes. A new 200A panel gives you significantly more capacity and open breaker slots. After the upgrade, adding new circuits for EV chargers, workshop equipment, home additions, or any other purpose is straightforward.',
      },
    ],
    signsList: [
      { title: 'Your Panel Is Over 20 Years Old', description: 'Panels from the 1990s and earlier weren\'t designed for today\'s electrical loads. Age alone isn\'t disqualifying, but combined with any other sign below, it\'s time to evaluate.' },
      { title: 'You Have a Federal Pacific or Zinsco Panel', description: 'These panels have documented safety defects — breakers that fail to trip under overload. Replacement is strongly recommended regardless of age or condition.' },
      { title: 'Breakers Trip Frequently', description: 'Occasional trips are normal. Frequent trips — especially on circuits that shouldn\'t be overloaded — indicate your panel is undersized for your current electrical demand.' },
      { title: 'You\'re Adding High-Load Equipment', description: 'EV chargers, mini splits, electric dryers, whole-home generators, and hot tubs all require dedicated circuits. A 100A panel often can\'t support these additions.' },
      { title: 'You Have Fewer Than 20 Breaker Slots', description: 'A crowded panel with tandem or double-tapped breakers is a code violation and a sign your electrical system has outgrown its capacity.' },
      { title: 'Your Homeowners Insurance Flagged It', description: 'Insurers increasingly require panel upgrades or replacements as a condition of coverage — particularly for Federal Pacific and Zinsco panels. We provide documentation for insurance purposes.' },
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
      'Outdated wiring is the leading cause of residential electrical fires. We safely rewire your home from knob-and-tube or aluminum to modern copper wiring — protecting your family and your investment.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'House rewiring by TZ Electric' },
    overview: [
      'Homes built before 1970 often contain knob-and-tube or aluminum branch circuit wiring that poses serious fire and safety risks. Knob-and-tube wiring has no ground wire, deteriorates with age, and is incompatible with modern insulation. Aluminum branch circuit wiring can loosen at connection points over time, creating heat and fire risk.',
      'Most homeowners insurance companies will no longer insure homes with knob-and-tube wiring, and when they discover it, they often cancel existing policies. Rewiring is not just a safety upgrade — in many cases, it\'s required to keep your home insurable and sellable.',
      'Our licensed electricians minimize disruption during rewiring by working methodically through each room. We use strategic access points to route new wiring with minimal drywall damage, and we coordinate all required permits and inspections. When the job is done, you\'ll have modern grounded wiring throughout, a properly labeled panel, and peace of mind.',
    ],
    process: [
      { step: '1', title: 'Inspection & Assessment', description: 'We inspect your home\'s existing wiring, identify hazardous systems, and map the full scope of work before any quote is provided.' },
      { step: '2', title: 'Detailed Quote & Planning', description: 'You receive a room-by-room breakdown of the rewiring scope with a fixed-price quote and a clear timeline.' },
      { step: '3', title: 'Rewiring Installation', description: 'We route new copper wiring through walls and ceilings using strategic access points, minimizing damage to finished surfaces.' },
      { step: '4', title: 'Panel & Final Inspection', description: 'All new circuits are connected to a properly labeled panel. We coordinate and pass the required electrical inspection.' },
    ],
    features: [
      { title: 'Knob-and-Tube Wiring Removal', description: 'Safely remove and replace hazardous knob-and-tube wiring. Required by most insurance companies and local codes for home sales and renovations.' },
      { title: 'Aluminum Wiring Upgrade', description: 'Convert unsafe aluminum branch circuit wiring to modern copper — eliminating the loose connection and overheating risks that make aluminum wiring dangerous.' },
      { title: 'Full Home Rewiring', description: 'Complete replacement of all electrical wiring in your home, typically done in conjunction with a panel upgrade. The safest option for severely outdated systems.' },
      { title: 'Grounded Outlet Installation', description: 'Replace ungrounded 2-prong outlets with modern 3-prong grounded outlets throughout your home — necessary for modern electronics and appliances.' },
      { title: 'Partial or Room-by-Room Rewiring', description: 'If you\'re renovating a specific area, we can rewire one room or floor at a time, coordinating the work to fit your project schedule.' },
      { title: 'Smoke Detector & Safety Device Updates', description: 'Hardwired, interconnected smoke detectors and carbon monoxide alarms installed to current code as part of your rewiring project.' },
    ],
    faqs: [
      {
        question: 'How do I know if my home has knob-and-tube wiring?',
        answer: 'Knob-and-tube wiring is recognizable by white ceramic knobs (fastening wires to framing) and ceramic tubes (where wires pass through framing). You\'ll often see it in basements and attic spaces of homes built before 1950. An inspection by our electricians can confirm what you have.',
      },
      {
        question: 'Does rewiring require opening walls?',
        answer: 'Some wall access is typically required, but we minimize it by using a "fishing" technique to route new wiring through existing wall cavities. We work to limit damage to finished surfaces and can coordinate with a drywall contractor for repairs if needed.',
      },
      {
        question: 'Will my insurance be affected by rewiring?',
        answer: 'Positively. Homes with knob-and-tube or aluminum wiring are often denied coverage or pay higher premiums. After a full rewire and electrical inspection sign-off, most insurers treat your home as having modern wiring, which can lower your premium.',
      },
      {
        question: 'How long does a full house rewire take?',
        answer: 'A typical single-family home rewire takes 3–7 days depending on the size of the home and the extent of the work. We coordinate a timeline that minimizes how long you\'re without power to specific areas.',
      },
    ],
    signsList: [
      { title: 'Flickering or Dimming Lights', description: 'Lights that flicker when appliances turn on indicate loose connections, overloaded circuits, or deteriorating wiring — all signs your system needs professional attention.' },
      { title: 'Outlets That Feel Warm or Spark', description: 'Warm outlets or visible sparking when plugging in devices are serious warning signs of wiring problems that can lead to electrical fires. Don\'t ignore them.' },
      { title: 'Burning Smell From Outlets or Switches', description: 'A burning plastic or electrical smell near outlets, switches, or the panel is an immediate red flag. Turn off the circuit and call us.' },
      { title: 'Buzzing Sounds From Walls or Outlets', description: 'Electrical systems should be silent. Buzzing or humming from outlets, switches, or the panel indicates arcing or loose connections — a fire risk.' },
      { title: 'Your Home Has Only 2-Prong Outlets', description: 'Ungrounded 2-prong outlets are an indicator of outdated wiring. Modern electronics require 3-prong grounded outlets, and many devices won\'t perform correctly without them.' },
      { title: 'You Have Knob-and-Tube or Aluminum Wiring', description: 'These older wiring types pose safety risks and are rejected by most homeowners insurance carriers. Rewiring eliminates the hazard and restores your insurability.' },
    ],
  },

  {
    parent: 'electrical',
    parentTitle: 'Electrical Services',
    slug: 'home-electrical-services',
    title: 'Home Electrical Services',
    metaTitle: 'Home Electrical Services Hudson Valley | Licensed Electrician',
    metaDescription:
      'Licensed home electrical services in the Hudson Valley. Outlets, lighting, circuits, ceiling fans, surge protection. Expert work. Call (518) 678-1230.',
    heroTitle: 'Home Electrical Services',
    heroDescription:
      'From new outlets and lighting upgrades to whole-home surge protection, our licensed electricians handle every residential electrical job — big or small.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'Home electrical services by TZ Electric' },
    overview: [
      'Most electrical problems homeowners deal with day-to-day don\'t require a full rewire or panel upgrade — but they do require a licensed electrician. Flickering lights, GFCI outlets that won\'t reset, a dead circuit, a ceiling fan that needs to come down, or a new room that needs circuits added are all jobs we handle routinely.',
      'We\'re available for single-trade electrical service calls throughout the Hudson Valley. Whether you need a single outlet added, a kitchen island circuit roughed in, or a whole-home surge protector installed after a storm, our electricians show up on time with the parts needed to get the job done.',
      'Every residential electrical job we do is permitted when required, performed by licensed professionals, and backed by our satisfaction guarantee. We give you honest pricing before work begins — no bill padding, no surprise line items.',
    ],
    features: [
      { title: 'Outlet & Switch Installation', description: 'New outlets, USB outlets, switched outlets, or GFCI/AFCI protection added anywhere in your home — properly wired and code-compliant.' },
      { title: 'Lighting & Ceiling Fan Installation', description: 'Recessed lighting, pendant lights, ceiling fans, under-cabinet lighting, and exterior fixtures — installed and wired correctly the first time.' },
      { title: 'Whole-Home Surge Protection', description: 'Panel-mounted surge protectors that guard every circuit in your home from damaging voltage spikes caused by lightning or utility grid issues.' },
      { title: 'Circuit Additions', description: 'Add dedicated circuits for home offices, workshops, home theaters, kitchen appliances, bathroom exhaust fans, or any other high-demand device.' },
      { title: 'Electrical Troubleshooting', description: 'Dead outlets, tripping breakers, flickering lights, and other unexplained electrical issues diagnosed and repaired by licensed electricians.' },
      { title: 'Smoke & CO Detector Installation', description: 'Hardwired, interconnected smoke detectors and carbon monoxide alarms installed and tested to meet current code requirements.' },
    ],
    faqs: [
      {
        question: 'Can I add an outlet without a permit?',
        answer: 'It depends on your municipality. Some jurisdictions require permits for any new circuit work; others have minimums. We always pull permits when required and advise you upfront. Work done without permits can cause issues with insurance and home sales.',
      },
      {
        question: 'What is whole-home surge protection?',
        answer: 'A whole-home surge protector mounts at your electrical panel and absorbs voltage spikes before they can reach your appliances, electronics, and HVAC equipment. It\'s different from a power strip — it protects every circuit in your home simultaneously. We strongly recommend it after any lightning event in the area.',
      },
      {
        question: 'My GFCI outlet keeps tripping — what is wrong?',
        answer: 'A GFCI outlet that won\'t stay reset usually means it\'s detecting a ground fault somewhere in the circuit — often moisture, a wiring fault, or a failing appliance. In some cases, the outlet itself is defective. Our electricians can trace and fix the issue.',
      },
      {
        question: 'Do you do small jobs or only large projects?',
        answer: 'We handle both. No job is too small if you need a licensed electrician. We schedule efficiently and give you upfront pricing for single-visit service calls as well as larger projects.',
      },
    ],
    signsList: [
      { title: 'Dead Outlets or Switches', description: 'An outlet or switch that stopped working usually points to a tripped GFCI upstream, a failed breaker, or a loose wire — all requiring a licensed electrician to diagnose and fix.' },
      { title: 'Breakers That Trip Repeatedly', description: 'A breaker that trips on the same circuit repeatedly means that circuit is overloaded or has a fault. Adding more outlets or a dedicated circuit is usually the solution.' },
      { title: 'Not Enough Outlets', description: 'If you\'re using power strips everywhere or running extension cords across rooms, your home needs additional outlets — a simple job that eliminates a real fire hazard.' },
      { title: 'You\'re Remodeling or Finishing a Space', description: 'Any renovation that involves new walls, a finished basement, or a home addition needs new wiring, circuits, and outlet placement from a licensed electrician.' },
      { title: 'Outdated Light Fixtures', description: 'Old fixtures may be wired without ground, use outdated lamp types, or simply not support modern LED bulbs correctly. Upgrading to new fixtures also updates the wiring connections.' },
      { title: 'No Surge Protection', description: 'A single power surge from a nearby lightning strike can destroy appliances and electronics throughout your home. A panel-mounted whole-home surge protector solves this for every circuit at once.' },
    ],
  },

  {
    parent: 'electrical',
    parentTitle: 'Electrical Services',
    slug: 'indoor-electrical',
    title: 'Indoor Electrical',
    metaTitle: 'Indoor Electrical Services Hudson Valley | Wiring & Lighting',
    metaDescription:
      'Licensed indoor electrical services in the Hudson Valley. Wiring, recessed lighting, troubleshooting, and code-compliant installations. Call (518) 678-1230.',
    heroTitle: 'Indoor Electrical Services',
    heroDescription:
      'Interior electrical work done right — wiring, recessed lighting, circuit additions, troubleshooting, and code-compliant installations for every room in your home.',
    image: { src: '/images/services/clean-panel.jpeg', alt: 'Indoor electrical work by TZ Electric' },
    overview: [
      'Interior electrical projects require careful planning, proper permitting, and licensed execution — whether you\'re finishing a basement, adding a home office, remodeling a kitchen, or simply upgrading your lighting. Our electricians bring the expertise to handle whatever your interior electrical project requires.',
      'We work closely with homeowners, builders, and contractors on new construction and remodeling projects. From rough-in wiring during framing to trim-out and final connections after drywall, we coordinate our work to keep your project on schedule.',
      'Common indoor electrical jobs include recessed lighting installation, dedicated circuits for appliances, home office wiring, bathroom and kitchen circuit upgrades, electrical troubleshooting, and smoke/CO detector systems. We give you a clear scope and price before we start.',
    ],
    process: [
      { step: '1', title: 'Consultation', description: 'We review your project, assess existing conditions, and identify the right approach — including permit requirements.' },
      { step: '2', title: 'Upfront Pricing', description: 'You receive a detailed, fixed-price quote with no ambiguity. No hourly billing surprises.' },
      { step: '3', title: 'Installation', description: 'Our licensed electricians complete all work cleanly and to code, coordinating with other trades as needed.' },
      { step: '4', title: 'Final Inspection', description: 'We coordinate inspections where required and confirm everything is working correctly before we leave.' },
    ],
    features: [
      { title: 'Recessed Lighting Installation', description: 'LED recessed lighting in living rooms, kitchens, hallways, and bedrooms — properly spaced, switched, and dimmable where desired.' },
      { title: 'Rough-In Wiring', description: 'New construction and remodel rough-in wiring for outlets, switches, circuits, and fixture boxes — coordinated with your build schedule.' },
      { title: 'Kitchen & Bathroom Circuits', description: 'Dedicated and GFCI-protected circuits for kitchen appliances, bathroom fixtures, and exhaust fans — required by modern code.' },
      { title: 'Home Office & Workspace Wiring', description: 'Dedicated circuits, data wiring, and adequate outlet placement for home offices, workshops, and media rooms.' },
      { title: 'Electrical Troubleshooting', description: 'Diagnose and fix dead circuits, tripping breakers, flickering lights, and other unexplained electrical issues — accurately, the first time.' },
      { title: 'Smoke & CO Detector Systems', description: 'Hardwired interconnected smoke and carbon monoxide detectors installed throughout your home to meet current code.' },
    ],
    faqs: [
      {
        question: 'What is rough-in wiring?',
        answer: 'Rough-in wiring is the first phase of electrical work in new construction or remodeling — running wires through walls and ceilings, installing junction boxes, and positioning outlet and switch locations before drywall goes up. It\'s done during the framing phase and inspected before walls are closed.',
      },
      {
        question: 'How many recessed lights do I need in a room?',
        answer: 'As a general rule, plan for one recessed light per 4–6 square feet of ceiling area for ambient lighting, spaced evenly. The exact number depends on ceiling height, light output, and personal preference. We\'ll help you plan the layout during the consultation.',
      },
      {
        question: 'Can you add circuits to a finished room without opening walls?',
        answer: 'Often yes — we use a "fishing" technique to route wire through existing wall cavities. The viability depends on your home\'s construction type and the routing path. We\'ll give you an honest assessment during the initial visit.',
      },
    ],
    signsList: [
      { title: 'You\'re Finishing a Basement or Attic', description: 'Converting unfinished space into livable area requires new circuits, outlets, lighting, and often a dedicated HVAC connection — all requiring a licensed electrician.' },
      { title: 'Your Remodel Involves Moving Walls', description: 'Structural changes almost always mean relocating outlets, switches, and lighting. We coordinate with your contractor to keep the project on schedule.' },
      { title: 'You\'re Adding a Home Office', description: 'A proper home office needs dedicated circuits for computers, monitors, and networking equipment — not shared circuits that trip when other appliances run.' },
      { title: 'Your Lighting Is Outdated or Inadequate', description: 'Old surface-mount fixtures, yellowed covers, or simply not enough light in a room — recessed LED retrofits and new fixture wiring are clean one-visit jobs.' },
      { title: 'You\'re Installing Ceiling Fans', description: 'Ceiling fans require a specific fan-rated electrical box and often a separate switched circuit. Existing light fixture boxes usually aren\'t rated for fan weight and movement.' },
      { title: 'You Need More Outlets in a Room', description: 'Running extension cords to reach devices across a room is both inconvenient and a fire risk. Adding outlets where you actually need them is a straightforward licensed electrical job.' },
    ],
  },

  // ─── MITSUBISHI MINI SPLITS ────────────────────────────────────────────────

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'installation',
    title: 'Mini Split Installation',
    metaTitle: 'Mini Split Installation Hudson Valley | Mitsubishi Diamond Elite',
    metaDescription:
      'Expert Mitsubishi mini split installation in the Hudson Valley. Diamond Elite contractor. Single-zone and multi-zone systems. Free estimates. Call (518) 678-1230.',
    heroTitle: 'Mini Split Installation',
    heroDescription:
      'As a Mitsubishi Diamond Elite Contractor, we install ductless mini split systems with factory-trained precision — the right equipment, sized correctly, installed to last.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Mitsubishi mini split installation by TZ Electric' },
    overview: [
      'A properly installed mini split system delivers years of efficient, quiet heating and cooling — but only if the equipment is correctly sized and the installation is done right. Oversized units short-cycle and fail early. Undersized units run constantly and never reach setpoint. Improper refrigerant charge causes compressor damage. These are common failures from unqualified installers.',
      'As a Mitsubishi Diamond Elite Contractor — the highest tier in Mitsubishi\'s dealer program — our installers have completed Mitsubishi\'s factory training and maintain the installation standards required to offer the best available warranties. Diamond Elite status isn\'t self-reported; Mitsubishi verifies it annually based on training completion and installation quality.',
      'We handle everything from the initial load calculation and equipment selection to refrigerant line routing, electrical connections, and system commissioning. Every installation includes a walkthrough so you know how to operate your system and maximize its efficiency.',
    ],
    process: [
      { step: '1', title: 'Load Calculation', description: 'We calculate the exact heating and cooling load for each zone to select properly sized equipment — not too big, not too small.' },
      { step: '2', title: 'Equipment Selection', description: 'Based on your home, zone count, and goals, we recommend the right Mitsubishi model and configuration for maximum comfort and efficiency.' },
      { step: '3', title: 'Professional Installation', description: 'Factory-trained technicians install the outdoor unit, indoor heads, refrigerant lines, condensate drains, and electrical connections to spec.' },
      { step: '4', title: 'Commissioning & Walkthrough', description: 'We charge the system, verify operation in all modes, and walk you through the remote control and app features before we leave.' },
    ],
    features: [
      { title: 'Factory-Trained Diamond Elite Installation', description: 'Mitsubishi\'s highest contractor tier. Our installations meet the standards required for Mitsubishi\'s best warranty coverage — 12 years on parts and compressor.' },
      { title: 'Single-Zone Systems', description: 'One outdoor unit, one indoor head — ideal for a single room, garage, home office, sunroom, or addition that needs independent temperature control.' },
      { title: 'Multi-Zone Systems', description: 'One outdoor unit serving 2–8 indoor heads in different rooms, each with independent temperature control and its own remote.' },
      { title: 'Hyper-Heating Systems', description: 'Mitsubishi H2i Hyper-Heat units that deliver full heating capacity at 5°F and continue operating down to -13°F — built for Hudson Valley winters.' },
      { title: 'Correct Sizing & Load Calculation', description: 'Properly sized equipment using Manual J load calculations — not guesswork. Correct sizing is the single most important factor in system performance and longevity.' },
      { title: 'Refrigerant Line & Electrical Work', description: 'All refrigerant line sets, electrical connections, and condensate drain routing completed cleanly and to manufacturer specifications.' },
    ],
    faqs: [
      {
        question: 'What does Diamond Elite status mean for me?',
        answer: 'Mitsubishi Diamond Elite is the highest contractor tier — it means our installers have completed factory training and we maintain installation standards that qualify your system for Mitsubishi\'s 12-year parts and compressor warranty (vs. the standard 5-year). This warranty requires registration and installation by a Diamond Elite contractor.',
      },
      {
        question: 'How long does a mini split installation take?',
        answer: 'A single-zone installation typically takes 4–8 hours in one day. Multi-zone systems with 3–4 heads usually take 1–2 days depending on the home layout and refrigerant line routing complexity.',
      },
      {
        question: 'Do I need a permit for mini split installation?',
        answer: 'Yes. Mini split installation requires both a mechanical permit (for the refrigerant system) and an electrical permit. We handle all permitting and coordinate the required inspections.',
      },
      {
        question: 'Will a mini split work in a Hudson Valley winter?',
        answer: 'Yes — Mitsubishi Hyper-Heat (H2i) systems are designed specifically for cold climates. They deliver full rated heating capacity at 5°F and continue operating all the way down to -13°F. Many of our customers use mini splits as their primary heating source year-round.',
      },
    ],
    signsList: [
      { title: 'You Have No Ductwork', description: 'Homes with radiators, baseboard heat, or no central HVAC system are ideal candidates for ductless mini splits — no ductwork required, installation is clean and fast.' },
      { title: 'You Have a Room That\'s Always Too Hot or Cold', description: 'Sunrooms, finished attics, home additions, and bonus rooms that the central system can\'t reach are perfect for a single-zone mini split installation.' },
      { title: 'You\'re Replacing Window AC Units', description: 'Window units are noisy, inefficient, block views, and require seasonal installation and removal. A mini split replaces all of that permanently and runs quieter and cheaper.' },
      { title: 'You Want Zoned Temperature Control', description: 'Mini splits let you set different temperatures in different rooms. If household members disagree on comfort levels, zoned control solves the problem permanently.' },
      { title: 'Your Energy Bills Keep Rising', description: 'Older HVAC systems lose efficiency every year. A new Mitsubishi mini split with inverter technology operates at a fraction of the energy cost of aging equipment.' },
      { title: 'Your Current Heating System Is Failing', description: 'Rather than replacing a failing oil furnace or baseboard system with the same technology, a Mitsubishi heat pump can provide both heating and cooling with better efficiency.' },
    ],
  },

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'heat-pump',
    title: 'Mini Split Heat Pump',
    metaTitle: 'Mini Split Heat Pump Installation Hudson Valley | Mitsubishi',
    metaDescription:
      'Mitsubishi mini split heat pump installation in the Hudson Valley. Efficient heating and cooling in one system. Diamond Elite contractor. Call (518) 678-1230.',
    heroTitle: 'Mini Split Heat Pump Systems',
    heroDescription:
      'Heating and cooling from a single system — Mitsubishi heat pumps deliver year-round comfort with exceptional efficiency, even in Hudson Valley winters.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Mitsubishi mini split heat pump by TZ Electric' },
    overview: [
      'A mini split heat pump does something no traditional system can — it provides both heating and cooling from a single outdoor unit, switching modes based on the season. In summer, it pulls heat out of your home to cool it. In winter, it extracts heat energy from the outdoor air (even cold air) and moves it inside.',
      'The efficiency advantage of a heat pump comes from the fact that it\'s moving heat rather than generating it. A high-efficiency Mitsubishi heat pump can deliver 3–4 units of heat energy for every 1 unit of electrical energy consumed — far more efficient than any resistance heating system.',
      'Mitsubishi\'s Hyper-Heat (H2i) technology extends this advantage into cold climates, maintaining full heating capacity at 5°F and operating down to -13°F. This makes Mitsubishi heat pumps one of the most practical heating solutions available for the Hudson Valley\'s cold winters.',
    ],
    process: [
      { step: '1', title: 'Heating & Cooling Assessment', description: 'We evaluate your current heating system, insulation levels, and zone layout to design the right heat pump solution.' },
      { step: '2', title: 'System Design', description: 'We select the right Mitsubishi heat pump model, capacity, and configuration to meet your full-year heating and cooling needs.' },
      { step: '3', title: 'Diamond Elite Installation', description: 'Factory-trained installation of the outdoor unit, indoor heads, refrigerant lines, and all electrical connections.' },
      { step: '4', title: 'Commissioning & Training', description: 'We verify operation in both heating and cooling modes and walk you through your system settings and controls.' },
    ],
    features: [
      { title: 'Hyper-Heat Cold Climate Operation', description: 'Full heating capacity at 5°F, continued operation to -13°F. Specifically engineered for cold climates like the Hudson Valley — not just a warm-weather system.' },
      { title: 'Heating & Cooling in One System', description: 'Eliminate the need for separate heating and cooling equipment. One outdoor unit handles both — simplifying maintenance and reducing equipment costs.' },
      { title: 'Up to 40% Lower Heating Costs', description: 'By moving heat rather than generating it, Mitsubishi heat pumps are significantly more efficient than electric resistance heat or older HVAC equipment.' },
      { title: 'Whisper-Quiet Operation', description: 'Mitsubishi indoor units operate as quietly as 19 dB — quieter than a whisper. No forced-air noise, no duct rumble, no cycling on and off loudly.' },
      { title: 'Zoned Comfort Control', description: 'Each indoor head has its own remote control. Only heat or cool rooms that are occupied, eliminating the waste of conditioning unused spaces.' },
      { title: 'Improved Indoor Air Quality', description: 'Multi-stage filtration in each indoor head captures dust, allergens, and particles. Some Mitsubishi models include advanced filtration with anti-allergen coatings.' },
    ],
    faqs: [
      {
        question: 'Can a heat pump replace my existing heating system?',
        answer: 'In many cases, yes. Mitsubishi Hyper-Heat systems are capable of handling the full heating load for well-insulated homes in the Hudson Valley. For older homes with poor insulation or very high heat loss, we can design a system that supplements your existing heat rather than fully replacing it.',
      },
      {
        question: 'Are there rebates available for heat pump installation?',
        answer: 'Yes. There are federal tax credits (up to 30% of installed cost under the Inflation Reduction Act), NYSERDA rebates, and utility rebates available for qualifying heat pump installations. We help you identify and apply for available incentives.',
      },
      {
        question: 'How efficient are Mitsubishi heat pumps?',
        answer: 'Mitsubishi\'s top heat pump models achieve SEER2 ratings up to 33 (cooling) and HSPF2 ratings up to 14 (heating). For comparison, a minimum-efficiency system is SEER2 15 / HSPF2 7.5. The efficiency difference translates directly into lower utility bills.',
      },
    ],
    signsList: [
      { title: 'You\'re Paying Too Much for Heat', description: 'Electric baseboard, oil, or propane heating costs far more per BTU than a heat pump. Switching can reduce heating bills by 30–50% in many Hudson Valley homes.' },
      { title: 'Your Heating and Cooling Are Separate Systems', description: 'Maintaining two separate systems — a furnace and a central AC — means two maintenance contracts, two potential failures, and two utility bills. A heat pump does both.' },
      { title: 'Your Home Has No Cooling at All', description: 'Many older homes in the Hudson Valley have heating but no cooling. A mini split heat pump adds both in one installation.' },
      { title: 'You Want to Reduce Your Carbon Footprint', description: 'Heat pumps produce no direct combustion emissions. Paired with renewable electricity, they\'re the most environmentally responsible heating and cooling option available.' },
      { title: 'Your Current System Is 10+ Years Old', description: 'Equipment over a decade old is dramatically less efficient than today\'s models. Replacement pays for itself faster than most homeowners expect through energy savings alone.' },
      { title: 'You\'re Interested in NYSERDA or IRA Incentives', description: 'Federal tax credits (up to 30%) and NYSERDA rebates are available for qualifying heat pump installations. Now is one of the best times financially to make the switch.' },
    ],
  },

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'ductless-heat-pump',
    title: 'Ductless Heat Pump Installation',
    metaTitle: 'Ductless Heat Pump Installation Hudson Valley | No Ductwork',
    metaDescription:
      'Ductless heat pump installation in the Hudson Valley. No ductwork required. Efficient, quiet heating and cooling. Mitsubishi Diamond Elite dealer. Call (518) 678-1230.',
    heroTitle: 'Ductless Heat Pump Installation',
    heroDescription:
      'Efficient heating and cooling without ductwork — ductless heat pumps are the perfect solution for homes without existing ducts, additions, and rooms that central systems can\'t reach.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Ductless heat pump installation by TZ Electric' },
    overview: [
      'Ductless heat pumps solve one of the most persistent comfort problems in older homes: how do you heat or cool a space that has no ductwork and no practical way to add it? Finished basements, converted attics, home additions, garages, and older homes with radiators all fall into this category.',
      'Without ductwork, the traditional answer was electric baseboard heat — expensive to operate and uncomfortable to live with. A ductless heat pump installs with only a small hole through the wall for the refrigerant line set, delivers both heating and cooling, and operates at a fraction of the cost of electric resistance heat.',
      'As a Mitsubishi Diamond Elite Contractor, we install ductless systems with the training and precision to ensure your equipment operates at peak efficiency from day one. Every installation comes with a load calculation, a walkthrough of your controls, and access to Mitsubishi\'s best available warranty.',
    ],
    features: [
      { title: 'No Ductwork Required', description: 'Installation requires only a 3-inch hole through the wall for the refrigerant line set. No tearing into walls, no ductwork design, no major construction.' },
      { title: 'Ideal for Older Homes', description: 'Perfect for homes with radiator, baseboard, or no central heating — add cooling and efficient heating without a major renovation.' },
      { title: 'Additions & Sunrooms', description: 'Home additions and sunrooms are notoriously hard to condition with central systems. A ductless heat pump solves the problem elegantly.' },
      { title: 'Garage & Workshop Conditioning', description: 'Heat and cool detached garages, workshops, and studios independently with their own ductless system.' },
      { title: 'Energy Efficient Operation', description: 'SEER2 ratings up to 33 and HSPF2 ratings up to 14 — dramatically more efficient than window AC units or electric baseboard heaters.' },
      { title: 'Clean, Concealed Installation', description: 'Refrigerant lines can be run through walls or along the exterior with line hide cover — keeping the installation clean and professional-looking.' },
    ],
    faqs: [
      {
        question: 'How is a ductless heat pump different from a window AC unit?',
        answer: 'A ductless heat pump provides both heating and cooling, is significantly more energy efficient, operates much more quietly, doesn\'t block your window, doesn\'t create a security vulnerability, and delivers more even, comfortable air distribution. The upfront cost is higher, but the operating cost and comfort level are substantially better.',
      },
      {
        question: 'Can I use a ductless heat pump as my primary heat source?',
        answer: 'Yes. Mitsubishi Hyper-Heat systems are designed for cold climates and can serve as a primary heat source in well-insulated homes. They continue operating at full capacity in temperatures well below freezing.',
      },
      {
        question: 'How much does ductless heat pump installation cost?',
        answer: 'A single-zone ductless heat pump typically runs $3,500–$5,500 installed, depending on system capacity and installation complexity. Federal tax credits and NYSERDA rebates can offset a significant portion of the cost.',
      },
    ],
    signsList: [
      { title: 'Rooms That Central Systems Can\'t Reach', description: 'Home additions, sunrooms, finished attics, and bonus rooms are chronically uncomfortable because the central system wasn\'t designed to reach them. A ductless unit solves this permanently.' },
      { title: 'You\'re Relying on Window AC or Space Heaters', description: 'Window units and space heaters are stopgap solutions — inefficient, uncomfortable, and often unsafe for long-term use. A ductless system replaces them properly.' },
      { title: 'Your Home Has No Central Ductwork', description: 'Homes with radiators or baseboard heat have no duct infrastructure. Adding ductwork for central AC is invasive and expensive — a ductless system avoids that entirely.' },
      { title: 'You Want Independent Room Control', description: 'A dedicated ductless unit in a bedroom, home office, or guest room means each person controls their own temperature without affecting the rest of the house.' },
      { title: 'Your Garage or Workshop Gets Unbearable', description: 'Detached garages and workshops are easy candidates for ductless installation — one outdoor unit, one indoor head, and you have year-round comfort in a space that had none.' },
      { title: 'You\'re Converting Unfinished Space', description: 'Finishing a basement or attic is much more livable — and valuable — when you have proper heating and cooling. A ductless system handles both without requiring ductwork.' },
    ],
  },

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'ac-installation',
    title: 'Mini Split AC Installation',
    metaTitle: 'Mini Split AC Installation Hudson Valley | Ductless Cooling',
    metaDescription:
      'Ductless mini split AC installation in the Hudson Valley. Quiet, efficient cooling without ductwork. Mitsubishi Diamond Elite contractor. Call (518) 678-1230.',
    heroTitle: 'Mini Split AC Installation',
    heroDescription:
      'Quiet, efficient cooling for any room — mini split AC delivers superior comfort without the noise, energy waste, or installation complexity of window units and central air.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Mini split AC installation by TZ Electric' },
    overview: [
      'For homes without central ductwork, mini split AC is the gold standard for cooling. Unlike window units, mini split systems are whisper quiet, don\'t block windows, don\'t require seasonal removal, and deliver far more efficient, even cooling. And unlike central air, they require no ductwork.',
      'Each indoor unit conditions its own zone independently, so you only cool rooms that are occupied. This targeted approach is not only more comfortable — it\'s dramatically more efficient than running a central system for the whole house when only one or two rooms are in use.',
      'Our Diamond Elite-certified installers properly size each system to your room\'s cooling load, route refrigerant lines cleanly, and commission the system to manufacturer specifications. A properly installed Mitsubishi mini split will deliver reliable, efficient cooling for 15–20 years.',
    ],
    features: [
      { title: 'Whole-Home Cooling Without Ductwork', description: 'A multi-zone system can cool your entire home with multiple indoor heads served by a single outdoor unit — no ductwork required anywhere.' },
      { title: 'Single-Room & Addition Cooling', description: 'One outdoor unit, one indoor head — the most effective solution for a single hot room, garage, home office, or addition.' },
      { title: 'Dramatically Quieter Than Window Units', description: 'Mitsubishi indoor units operate at 19–26 dB — quieter than a library. The compressor and fan are outside. No window unit rattle, ever.' },
      { title: 'No Window Blockage', description: 'Indoor units mount high on the wall. Your windows stay unobstructed, your view intact, and your home more secure year-round.' },
      { title: 'Energy-Efficient Inverter Technology', description: 'Mitsubishi\'s inverter-driven compressors vary speed to match load precisely — no on/off cycling, steadier temperatures, and lower energy bills.' },
      { title: 'WiFi Control & Scheduling', description: 'Control temperature, fan speed, and scheduling from your smartphone via Mitsubishi\'s kumo cloud app — even when you\'re away from home.' },
    ],
    faqs: [
      {
        question: 'How does mini split AC compare to central air?',
        answer: 'Mini split systems are more efficient (no duct losses, which account for 20–30% of energy waste in ducted systems), quieter, and more flexible for zoning. Central air is generally more economical to install in homes with existing ductwork. For homes without ducts, mini splits are usually the better choice.',
      },
      {
        question: 'Can I use a mini split for cooling only without heating?',
        answer: 'Yes. Most Mitsubishi mini splits are heat pumps by default, but you can simply use the cooling mode only and ignore the heating function. Many customers discover they prefer the heat pump mode in shoulder seasons once they experience it.',
      },
      {
        question: 'How many mini split heads do I need to cool my home?',
        answer: 'It depends on your floor plan, insulation, window area, and how open the layout is. An open-plan main floor might be adequately cooled by one head; a multi-story home with bedrooms might need one per floor or one per room. We size the system properly during the initial consultation.',
      },
    ],
    signsList: [
      { title: 'You Have Window Units in Every Room', description: 'If every room has its own window unit, a multi-zone mini split system consolidates all of that into one efficient outdoor unit — quieter, more effective, and no blocked windows.' },
      { title: 'You\'re Cooling Multiple Floors', description: 'A single-zone mini split may not reach upstairs bedrooms effectively. A multi-zone system with dedicated heads on each floor gives you consistent cooling everywhere.' },
      { title: 'Uneven Temperatures Throughout the House', description: 'If some rooms are always warmer or cooler than others despite the central system running, a mini split with per-room control solves the problem definitively.' },
      { title: 'You Want Everyone to Control Their Own Zone', description: 'With independent remotes or app control per zone, no more household disagreements about the thermostat — each person sets their own room to their preference.' },
      { title: 'You\'re Replacing Aging Central AC', description: 'When a central AC system reaches end of life in a home with accessible wall space, a multi-zone mini split is often a better replacement — more efficient and no duct losses.' },
      { title: 'You Have Multiple Problematic Rooms', description: 'If 3 or more rooms in your home are uncomfortable, a multi-zone system is more cost-effective than multiple single-zone installations — one outdoor unit serves all of them.' },
    ],
  },

  {
    parent: 'mitsubishi',
    parentTitle: 'Mitsubishi Mini Splits',
    slug: 'multi-zone',
    title: 'Multi-Zone Mini Split Systems',
    metaTitle: 'Multi-Zone Mini Split Systems Hudson Valley | Mitsubishi',
    metaDescription:
      'Multi-zone mini split installation in the Hudson Valley. One outdoor unit, up to 8 indoor zones. Independent temperature control per room. Call (518) 678-1230.',
    heroTitle: 'Multi-Zone Mini Split Systems',
    heroDescription:
      'One outdoor unit, multiple rooms, independent control — multi-zone mini split systems deliver whole-home comfort with the efficiency and flexibility central systems can\'t match.',
    image: { src: '/images/services/minisplit-install.jpeg', alt: 'Multi-zone mini split system by TZ Electric' },
    overview: [
      'A multi-zone mini split system connects multiple indoor units to a single outdoor compressor — allowing each zone to be controlled independently. Someone in the bedroom can keep it cool while the living room runs warmer. The home office can be conditioned during work hours without running the whole system.',
      'Mitsubishi\'s multi-zone systems are available in 2-zone through 8-zone configurations, supporting a wide variety of indoor unit types in the same system: wall-mounted heads, floor-mounted units, ceiling cassettes, and concealed duct units. This gives you the flexibility to choose the right indoor unit style for each room.',
      'Proper design is critical for multi-zone systems. The outdoor unit must be sized to handle the combined load of all zones, refrigerant line routing must be engineered for the home\'s layout, and the system must be commissioned correctly. As Diamond Elite installers, we have the training and tools to do this right.',
    ],
    features: [
      { title: '2 to 8 Zone Configurations', description: 'A single outdoor unit can serve 2–8 independent indoor zones. Scale from a 2-zone system for a small home to 8 zones for a large multi-story house.' },
      { title: 'Independent Zone Control', description: 'Each indoor unit has its own remote control and temperature setting. No more household thermostat battles — everyone controls their own zone.' },
      { title: 'Mix & Match Indoor Unit Types', description: 'Combine wall-mounted, floor-mounted, ceiling cassette, and concealed duct units in the same system — right unit type for every room\'s layout and aesthetic.' },
      { title: 'Energy Efficiency Across All Zones', description: 'Zones that aren\'t in use aren\'t conditioned, eliminating the waste of heating or cooling empty rooms. Inverter technology ensures the compressor runs at optimal speed.' },
      { title: 'Whole-Home Comfort Without Ductwork', description: 'Replace inefficient zone-by-zone window units or extend an existing ducted system to cover areas it can\'t reach — all from a single efficient outdoor unit.' },
      { title: 'Smart Home Integration', description: 'Control all zones from the Mitsubishi kumo cloud app or integrate with smart home platforms including Amazon Alexa, Google Home, and Ecobee.' },
    ],
    faqs: [
      {
        question: 'Can all indoor units run at different temperatures simultaneously?',
        answer: 'Yes. Each indoor unit in a multi-zone system is independently controlled. However, all indoor units connected to a single outdoor unit must operate in the same mode (all heating or all cooling) at the same time. Mitsubishi also offers simultaneous heating and cooling systems for buildings that need both at once.',
      },
      {
        question: 'How many zones do I need for my home?',
        answer: 'Most single-family homes are well-served by 2–4 zones. Open-plan homes may need fewer; homes with many separate rooms or floors may benefit from more. We assess your floor plan and design the system during the consultation.',
      },
      {
        question: 'Is a multi-zone system more expensive than multiple single-zone units?',
        answer: 'Not necessarily. For 3 or more zones, a properly designed multi-zone system often costs less than installing multiple single-zone systems because you only need one outdoor unit and one refrigerant line connection to the house exterior. Operating costs are also typically lower.',
      },
    ],
    signsList: [
      { title: 'You Need Comfort in 3 or More Rooms', description: 'Once you need three or more zones, a multi-zone system becomes more cost-effective than separate single-zone units — one outdoor compressor instead of three.' },
      { title: 'Different Family Members Need Different Temperatures', description: 'Multi-zone gives everyone independent control — the bedroom can be cold while the living room stays warm, simultaneously, from one system.' },
      { title: 'You Have a Multi-Story Home Without Ductwork', description: 'Multi-story homes without ducts are ideal multi-zone candidates. Run refrigerant lines to heads on each floor for whole-home comfort from a single outdoor unit.' },
      { title: 'Your Central System Leaves Some Rooms Behind', description: 'If your central system handles most of the house fine but 2–3 rooms are always wrong, adding a multi-zone mini split for those specific zones is a clean solution.' },
      { title: 'You\'re Building a New Home or Addition', description: 'New construction is the ideal time to plan a multi-zone system. Routes are clean, installations are easier, and you can design the system around how you actually live.' },
      { title: 'You Want Smart Zone Scheduling', description: 'With Mitsubishi\'s kumo cloud app, you can set different schedules per zone — bedrooms cool overnight, office zone on during work hours, common areas in the evening.' },
    ],
  },

  // ─── HVAC ──────────────────────────────────────────────────────────────────

  {
    parent: 'hvac',
    parentTitle: 'HVAC Services',
    slug: 'central-air',
    title: 'Central Air Heating & Cooling',
    metaTitle: 'Central Air Heating & Cooling Hudson Valley | HVAC Contractor',
    metaDescription:
      'Central air heating and cooling installation in the Hudson Valley. Furnaces, AC, heat pumps, and full system installs. Expert HVAC contractor. Call (518) 678-1230.',
    heroTitle: 'Central Air Heating & Cooling',
    heroDescription:
      'Full central HVAC solutions — furnace, air conditioner, heat pump, and ductwork — installed by experienced technicians to keep your home comfortable year-round.',
    image: { src: '/images/services/hvac-hero.png', alt: 'Central air HVAC system by TZ Electric' },
    overview: [
      'Central air systems remain the most common whole-home heating and cooling solution for homes with existing ductwork. A modern high-efficiency central system can significantly reduce your energy bills compared to aging equipment, while delivering more consistent comfort throughout your home.',
      'Central systems include the outdoor condenser (for cooling), the air handler or furnace (inside), the coil, and the ductwork distribution network. When any component reaches the end of its service life or fails, it can affect the whole system — and in some cases, a full system replacement is more cost-effective than repair.',
      'Signs that it may be time to evaluate your central system: equipment over 12–15 years old, increasing repair frequency, rising utility bills despite normal use, uneven temperatures between rooms, or unusual sounds and smells from the system. Our HVAC technicians provide honest assessments without upselling unnecessary work.',
    ],
    process: [
      { step: '1', title: 'System Assessment', description: 'We evaluate your existing equipment, ductwork, insulation, and comfort complaints to diagnose the issues and identify the best solution.' },
      { step: '2', title: 'Options & Recommendations', description: 'We present repair vs. replacement options with honest cost-benefit analysis — including available rebates for high-efficiency equipment.' },
      { step: '3', title: 'Installation', description: 'Certified HVAC technicians install all equipment to manufacturer specs, including refrigerant charge, airflow balancing, and controls.' },
      { step: '4', title: 'Testing & Commissioning', description: 'We verify correct operation in heating and cooling modes, test airflow, check all safety controls, and walk you through your new system.' },
    ],
    features: [
      { title: 'Central AC Installation & Replacement', description: 'High-efficiency central air conditioners from major manufacturers — properly sized, correctly charged, and installed for maximum performance.' },
      { title: 'Furnace Installation & Replacement', description: 'High-efficiency gas furnaces with up to 98% AFUE — dramatically lower fuel costs than older equipment. Installation with all safety controls and proper venting.' },
      { title: 'Heat Pump Systems', description: 'Ducted heat pumps that provide both heating and cooling through your existing ductwork — available in traditional and cold-climate models.' },
      { title: 'Ductwork Assessment & Repairs', description: 'Leaking or uninsulated ductwork can waste 20–30% of your HVAC energy. We assess, seal, and repair ductwork to improve efficiency and airflow.' },
      { title: 'Smart Thermostat Installation', description: 'Programmable and WiFi-enabled thermostats from Ecobee, Honeywell, and other brands — optimize comfort and reduce energy waste.' },
      { title: 'HVAC System Tune-Up', description: 'Annual maintenance visits including filter replacement, coil cleaning, refrigerant check, safety control testing, and airflow verification.' },
    ],
    faqs: [
      {
        question: 'Should I repair or replace my aging HVAC system?',
        answer: 'A common rule of thumb: if the repair cost exceeds 50% of the replacement cost, and the system is more than 10 years old, replacement is usually more cost-effective. New systems also offer significantly better efficiency, which reduces long-term operating costs. We give you honest guidance — we won\'t push replacement when repair makes more sense.',
      },
      {
        question: 'How long does central HVAC last?',
        answer: 'Central air conditioners typically last 12–15 years with proper maintenance. Gas furnaces often last 15–20 years. Heat pumps are in the 15-year range. Regular annual maintenance extends equipment life significantly.',
      },
      {
        question: 'What SEER rating should I look for in a new AC?',
        answer: 'Current minimum efficiency is SEER2 15.2 (in the Northeast). High-efficiency units run SEER2 18–22+. The higher the SEER2, the lower the operating cost — but there\'s a diminishing return at the top end. We help you find the right balance of upfront cost vs. long-term savings based on your usage.',
      },
    ],
    signsList: [
      { title: 'Your System Is 10+ Years Old', description: 'Equipment over a decade old operates at a fraction of the efficiency of modern systems. Even a system that\'s still running may cost significantly more to operate than a replacement.' },
      { title: 'Uneven Heating or Cooling Between Rooms', description: 'If some rooms are always too hot and others too cold while the system runs continuously, it\'s a sign of an aging, undersized, or duct-leaking system that needs evaluation.' },
      { title: 'Energy Bills Keep Climbing', description: 'Rising utility bills without changes in usage are a classic sign of degrading HVAC efficiency. Modern high-efficiency systems can reduce heating and cooling costs by 20–40%.' },
      { title: 'Strange Noises or Smells', description: 'Rattling, banging, grinding, or a burning smell from vents are warning signs of failing components. These issues worsen quickly and often result in complete system failure at the worst time.' },
      { title: 'Repairs Are Becoming Frequent', description: 'If you\'re calling for HVAC service multiple times per year, you\'re paying more in repair costs than a new system\'s payments would cost. We give you an honest repair-vs-replace analysis.' },
      { title: 'Your System Uses R-22 Refrigerant', description: 'R-22 (Freon) is no longer manufactured and is extremely expensive to recharge. If your AC uses R-22 and loses refrigerant, replacement is almost always more cost-effective than a recharge.' },
    ],
  },

  {
    parent: 'hvac',
    parentTitle: 'HVAC Services',
    slug: 'ducted-systems',
    title: 'Replacement of Ducted Systems',
    metaTitle: 'Ducted HVAC System Replacement Hudson Valley | Heating & Cooling',
    metaDescription:
      'Ducted HVAC system replacement in the Hudson Valley. Replace aging furnaces, AC, and full system upgrades. Expert installation. Call (518) 678-1230.',
    heroTitle: 'Ducted HVAC System Replacement',
    heroDescription:
      'When your existing ducted heating or cooling system reaches the end of its life, we replace it with modern, efficient equipment — properly sized and installed for the next 15–20 years.',
    image: { src: '/images/services/hvac-hero.png', alt: 'HVAC ducted system replacement by TZ Electric' },
    overview: [
      'Replacing a ducted HVAC system is one of the most impactful home investments you can make. Upgrading from a 10-year-old system at 80% efficiency to a modern 96% AFUE furnace, or from an aging SEER 10 AC to a SEER2 18 unit, can reduce heating and cooling costs by 20–40% annually.',
      'Beyond efficiency, aging equipment becomes increasingly unreliable. A system that has been repaired multiple times is more likely to fail at the worst possible time — a cold January night or a peak-summer heat wave. Proactive replacement lets you choose the timing, plan the budget, and take advantage of rebates and financing.',
      'Common signs it\'s time to replace your ducted system: the equipment is 12+ years old, repairs are becoming more frequent or expensive, the system can\'t keep the home comfortable, energy bills keep climbing, or you\'re seeing significant temperature variation between rooms.',
    ],
    process: [
      { step: '1', title: 'Assessment & Load Calc', description: 'We inspect your existing system and calculate your home\'s current heating and cooling load to right-size your new equipment.' },
      { step: '2', title: 'System Recommendation', description: 'We recommend specific equipment with efficiency ratings, warranty details, and estimated annual operating costs.' },
      { step: '3', title: 'Removal & Installation', description: 'Old equipment is removed and properly disposed of. New equipment is installed, connected, and configured to manufacturer specifications.' },
      { step: '4', title: 'Startup & Verification', description: 'We start up the new system, verify correct refrigerant charge, test all safety and comfort controls, and confirm proper airflow throughout the ductwork.' },
    ],
    features: [
      { title: 'Complete System Replacement', description: 'Full replacement of your furnace, air conditioner or heat pump, air handler, and coil — all matched components for maximum efficiency and reliability.' },
      { title: 'High-Efficiency Equipment', description: 'Modern equipment with dramatically better efficiency ratings than systems from even 10 years ago — lower operating costs from day one.' },
      { title: 'Ductwork Inspection & Sealing', description: 'Replacement is the right time to inspect and seal your ductwork. Leaky ducts can lose 20–30% of conditioned air before it reaches the living space.' },
      { title: 'Refrigerant Upgrade Compliance', description: 'New systems use modern refrigerants. We handle proper disposal of old refrigerant and ensure your new system is fully compliant with current regulations.' },
      { title: 'Rebates & Incentive Coordination', description: 'We identify available federal tax credits, NYSERDA rebates, and utility incentives for high-efficiency equipment — and help you capture them.' },
      { title: 'Financing Available', description: 'Equipment replacement is a significant investment. We offer financing through Wisetack and Synchrony to make the upgrade accessible without the wait.' },
    ],
    faqs: [
      {
        question: 'How long does a ducted system replacement take?',
        answer: 'Most residential HVAC replacements are completed in a single day (6–8 hours). More complex projects involving ductwork work or multiple system components may extend to 1–2 days.',
      },
      {
        question: 'Should I replace just the outdoor unit or the whole system?',
        answer: 'Replacing just the outdoor condenser while keeping an old air handler and coil is generally not recommended. Mismatched systems underperform, void warranties, and often fail sooner. Matching all components ensures rated efficiency, proper warranty coverage, and long-term reliability.',
      },
      {
        question: 'Are there rebates for replacing my HVAC system?',
        answer: 'Yes. The Inflation Reduction Act provides federal tax credits up to $600 for high-efficiency AC and furnaces, and up to $2,000 for heat pumps. NYSERDA and utility rebates add additional savings. We help identify and apply for all available incentives.',
      },
    ],
    signsList: [
      { title: 'Your System Is 12–15+ Years Old', description: 'Most ducted HVAC equipment is designed for a 15-year lifespan with proper maintenance. Equipment at or past this threshold is a replacement candidate even if it\'s still running.' },
      { title: 'You\'ve Had Multiple Repairs Recently', description: 'Frequent repair calls on aging equipment signal that other components are nearing failure. At some point, the next repair costs more than a replacement would.' },
      { title: 'The System Can\'t Maintain Temperature', description: 'A system that runs continuously but can\'t reach the thermostat setpoint on hot or cold days has lost capacity — a sure sign it\'s time to evaluate replacement.' },
      { title: 'Your Ductwork Is Leaking or Damaged', description: 'A replacement is the best opportunity to inspect and address ductwork. Leaking ducts waste 20–30% of conditioned air and drive up utility bills significantly.' },
      { title: 'Your Home Feels Dusty or Humid', description: 'Poor indoor air quality, excessive dust, or high indoor humidity despite the AC running are signs the system is no longer moving and filtering air effectively.' },
      { title: 'You\'re Planning a Major Renovation', description: 'Home additions and layout changes affect HVAC load significantly. A renovation is the right time to evaluate whether your existing system is still properly sized.' },
    ],
  },

  {
    parent: 'hvac',
    parentTitle: 'HVAC Services',
    slug: 'installation',
    title: 'HVAC Installation',
    metaTitle: 'HVAC Installation Hudson Valley | New System Installation',
    metaDescription:
      'HVAC installation for new construction and home additions in the Hudson Valley. Properly sized, permitted, and installed. Expert HVAC contractor. Call (518) 678-1230.',
    heroTitle: 'HVAC Installation',
    heroDescription:
      'New HVAC for new construction, home additions, and finished spaces — designed right, sized correctly, and installed to last.',
    image: { src: '/images/services/hvac-hero.png', alt: 'New HVAC installation by TZ Electric' },
    overview: [
      'New HVAC installation — whether for new construction, a home addition, or a space that previously had no mechanical system — requires careful system design before any equipment is selected. The most common mistake in HVAC installation is oversizing: installing equipment that\'s too large for the space. Oversized systems short-cycle, create humidity problems, and fail faster than properly sized equipment.',
      'We follow ACCA Manual J for load calculations and Manual D for ductwork design. This isn\'t just best practice — it\'s how we ensure your system delivers the comfort it\'s rated for and the efficiency you\'re paying for. We select equipment from major manufacturers and provide detailed specifications with every proposal.',
      'For new construction, we coordinate with your builder and other trades to ensure rough-in timing, equipment access, and utility connections are all handled smoothly. For additions and finished spaces, we evaluate the most practical and efficient approach for connecting to existing systems or installing standalone equipment.',
    ],
    features: [
      { title: 'New Construction HVAC', description: 'Complete HVAC design and installation for new builds — from rough-in and ductwork to final equipment installation and commissioning.' },
      { title: 'Home Addition HVAC', description: 'Extend your existing system or install a dedicated mini split or ducted unit for additions, finished basements, and converted spaces.' },
      { title: 'Manual J Load Calculations', description: 'Properly sized equipment using industry-standard load calculations — not rule-of-thumb guesses that lead to oversized, inefficient systems.' },
      { title: 'Ductwork Design & Installation', description: 'New duct systems designed to deliver correct airflow to each room, fabricated and installed by our team or coordinated with sheet metal contractors.' },
      { title: 'Equipment Selection', description: 'We specify equipment from leading manufacturers based on your performance requirements, efficiency goals, and budget.' },
      { title: 'Full Permitting & Inspection', description: 'All mechanical and electrical permits handled by our team. We coordinate inspections and deliver complete documentation for your records.' },
    ],
    faqs: [
      {
        question: 'What is a Manual J calculation?',
        answer: 'Manual J is the industry-standard method for calculating the heating and cooling load of a building — how much BTU capacity is needed to maintain comfort in all conditions. It accounts for insulation, windows, orientation, internal heat gains, and local climate. Properly sized equipment based on Manual J performs better, lasts longer, and costs less to operate than oversized equipment.',
      },
      {
        question: 'Can a mini split handle a new home addition?',
        answer: 'Often yes — and it\'s frequently the simplest and most cost-effective solution. Mini splits don\'t require ductwork, can be installed quickly, and provide zoned control. For additions over 800–1,000 sq ft, we evaluate whether a mini split, ducted extension, or standalone system makes the most sense.',
      },
      {
        question: 'How long does new HVAC installation take for new construction?',
        answer: 'New construction HVAC involves multiple phases. Rough-in (ductwork and equipment platform) happens during framing and takes 1–3 days. Equipment installation and final connections occur after drywall — typically another 1–2 days. Total timeline depends on project scope.',
      },
    ],
    signsList: [
      { title: 'You\'re Building a New Home', description: 'New construction requires HVAC design before framing is complete — ductwork routes, equipment locations, and utility connections all need to be coordinated early in the build.' },
      { title: 'You\'re Adding a Room or Converting Space', description: 'Home additions and converted spaces (basements, attics, garages) need dedicated HVAC solutions. The existing system is rarely sized to handle new square footage.' },
      { title: 'Your Addition Has No Heat or Cooling', description: 'A finished addition that lacks proper climate control is uncomfortable and potentially unsafe in Hudson Valley winters. We design the right system for the space.' },
      { title: 'You\'re Replacing an Entire System in an Older Home', description: 'When replacing aging equipment in a home that hasn\'t had HVAC evaluated in years, we recalculate the load — your needs may have changed significantly since the original system was installed.' },
      { title: 'Your Current System Is Chronically Oversized or Undersized', description: 'Short-cycling (turns on and off too quickly) means oversized equipment. Continuous running without reaching setpoint means undersized. Both shorten equipment life and waste energy.' },
      { title: 'You\'re Upgrading to All-Electric HVAC', description: 'Transitioning from gas or oil to an all-electric heat pump system requires a comprehensive HVAC design review to ensure the new equipment is properly sized for your home\'s heat loss.' },
    ],
  },

  {
    parent: 'hvac',
    parentTitle: 'HVAC Services',
    slug: 'repair',
    title: 'HVAC Repair & Maintenance',
    metaTitle: 'HVAC Repair & Maintenance Hudson Valley | All Brands',
    metaDescription:
      'HVAC repair and maintenance in the Hudson Valley. Emergency repairs, tune-ups, and service contracts for all major brands. Fast response. Call (518) 678-1230.',
    heroTitle: 'HVAC Repair & Maintenance',
    heroDescription:
      'Fast diagnosis and honest repairs for all ducted heating and cooling systems — plus annual maintenance to prevent breakdowns before they happen.',
    image: { src: '/images/services/hvac-hero.png', alt: 'HVAC repair and maintenance by TZ Electric' },
    overview: [
      'Most HVAC failures don\'t happen randomly — they build up over time as components wear, filters clog, refrigerant levels drop, or controls begin to fail. Annual maintenance catches these issues before they cause a breakdown, extends equipment life, and keeps your system running at rated efficiency.',
      'When breakdowns do occur, fast accurate diagnosis is the difference between a minor repair and unnecessary equipment replacement. Our HVAC technicians are trained across all major brands and use manufacturer-specific diagnostic tools to find the real cause of the problem — not just swap parts until something works.',
      'We offer both emergency repair service and scheduled maintenance plans. Emergency calls are prioritized for no-heat and no-cooling situations. Annual tune-up visits include filter replacement, coil cleaning, refrigerant check, safety control testing, and a full operational test in both heating and cooling modes.',
    ],
    features: [
      { title: 'Emergency Heating & Cooling Repair', description: 'Fast-response repair service for no-heat and no-cooling emergencies. We prioritize emergency calls and aim to restore comfort the same day.' },
      { title: 'Diagnostic Troubleshooting', description: 'Accurate, manufacturer-informed diagnosis of HVAC failures — we find the actual cause, not just the symptom, before recommending any repair.' },
      { title: 'Annual Tune-Up & Maintenance', description: 'Complete seasonal tune-up including filter replacement, coil cleaning, refrigerant check, safety testing, and operational verification.' },
      { title: 'Refrigerant Recharge & Leak Repair', description: 'Proper refrigerant handling, leak detection, repair, and recharge for all refrigerant types — EPA 608 certified technicians.' },
      { title: 'All Major Brands Serviced', description: 'We service Carrier, Trane, Lennox, York, Rheem, Goodman, American Standard, and all other major residential HVAC brands.' },
      { title: 'Maintenance Plans', description: 'Annual service agreements that cover seasonal tune-ups, discounted repairs, and priority scheduling — protecting your investment year-round.' },
    ],
    faqs: [
      {
        question: 'How often should I service my HVAC system?',
        answer: 'Annual maintenance is recommended minimum. Service your heating system in fall before the cold season and your cooling system in spring before peak demand. Systems used year-round (heat pumps, for example) benefit from biannual service.',
      },
      {
        question: 'My furnace is running but the house won\'t warm up — what is wrong?',
        answer: 'Common causes include a clogged air filter, dirty evaporator coil, failed heat exchanger, low gas pressure, faulty thermostat, or ductwork leaks. Some of these are simple fixes; others require professional diagnosis. We diagnose accurately before recommending any repair.',
      },
      {
        question: 'Should I repair or replace my old furnace?',
        answer: 'If your furnace is 15+ years old and requires a significant repair (heat exchanger, inducer motor), replacement is usually more cost-effective — especially since a new high-efficiency unit will dramatically lower your fuel bills. We provide honest repair-vs-replace guidance based on your specific situation.',
      },
    ],
    signsList: [
      { title: 'Weak or Uneven Airflow', description: 'Vents barely pushing air indicate a blocked filter, clogged coil, or blower motor issue. Left unaddressed, weak airflow strains the system and accelerates component failure.' },
      { title: 'System Turns On and Off Too Frequently', description: 'Short cycling — where the system turns on, runs briefly, and shuts off repeatedly — is a sign of an oversized system, low refrigerant, or a failing component.' },
      { title: 'Unusual Noises From the System', description: 'Rattling, banging, squealing, or grinding from your HVAC equipment are signs of loose or failing components. These noises almost always get worse if ignored.' },
      { title: 'No Heating or No Cooling', description: 'A system that runs but doesn\'t heat or cool, or won\'t start at all, needs professional diagnosis. The cause could range from a simple thermostat issue to a failed compressor.' },
      { title: 'Skipped Annual Maintenance', description: 'If your system hasn\'t been serviced in more than a year, dirty coils, low refrigerant, and worn components may already be reducing efficiency and shortening equipment life.' },
      { title: 'Higher Energy Bills Without Explanation', description: 'A sudden increase in your utility bills without changes in usage is a clear sign your HVAC system is working harder than it should — typically due to a dirty coil, low refrigerant, or a failing component.' },
    ],
  },

  // ─── GENERATOR ────────────────────────────────────────────────────────────

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'whole-home',
    title: 'Whole Home Generator',
    metaTitle: 'Whole Home Generator Installation Hudson Valley | Generac Dealer',
    metaDescription:
      'Whole home standby generator installation in the Hudson Valley. Authorized Generac dealer. Automatic protection for your entire home. Call (518) 678-1230.',
    heroTitle: 'Whole Home Generator Installation',
    heroDescription:
      'Protect every circuit in your home automatically — a whole home standby generator starts itself within seconds of detecting a power outage and runs until utility power is restored.',
    image: { src: '/images/services/generator.webp', alt: 'Whole home generator installed by TZ Electric' },
    overview: [
      'A whole home standby generator is permanently installed outside your home and connected to your electrical panel and natural gas or propane supply. When a power outage occurs — at 2am, during a blizzard, or while you\'re away — the generator detects the loss of utility power and starts automatically within seconds. You may not even wake up.',
      'Unlike portable generators, whole home units require no fuel storage, no manual startup, and no extension cords. They\'re designed to run for days or weeks if necessary, shutting down only when utility power is fully restored. They protect your entire home — HVAC, refrigerator, sump pump, medical equipment, security systems, and everything else.',
      'As an authorized Generac dealer and installer, we handle every aspect of the project: site assessment, equipment selection, permit applications, propane or gas line coordination, electrical connection to your panel, and the required inspections. We\'re with you from the first call through the final sign-off.',
    ],
    process: [
      { step: '1', title: 'Free In-Home Assessment', description: 'We evaluate your home\'s electrical load, fuel source, and optimal generator placement to size and specify the right system.' },
      { step: '2', title: 'Permit & Utility Coordination', description: 'We handle all permits and coordinate with your gas utility or propane supplier to ensure fuel supply is ready for installation day.' },
      { step: '3', title: 'Installation', description: 'Generator, transfer switch, and all wiring installed by our certified team in a 1–2 day installation with minimal disruption.' },
      { step: '4', title: 'Testing & Handover', description: 'Full system load test, weekly self-test programming, and a complete walkthrough of your generator\'s monitoring and controls.' },
    ],
    features: [
      { title: 'Automatic Standby Operation', description: 'Detects a power outage and starts automatically within seconds — protecting your home even when you\'re asleep or away.' },
      { title: 'Whole-Home Coverage', description: 'Powers every circuit in your home including HVAC, refrigerator, sump pump, well pump, medical devices, and security systems.' },
      { title: 'Natural Gas or Propane Fuel', description: 'Connected to an existing natural gas line or a dedicated propane tank — no fuel storage hassles, no running out during a long outage.' },
      { title: 'Automatic Weekly Self-Test', description: 'Your generator runs a brief self-test each week, verifying it\'s ready without any action from you. You\'ll know it works before you need it.' },
      { title: 'Remote Monitoring via App', description: 'Generac\'s Mobile Link app lets you check your generator\'s status, receive alerts, and view maintenance history from anywhere.' },
      { title: 'Authorized Dealer Warranty', description: 'As an authorized Generac dealer, we install with factory-trained technicians and provide the full manufacturer warranty.' },
    ],
    faqs: [
      {
        question: 'What size generator do I need for my whole home?',
        answer: 'Whole home generators for typical single-family homes range from 14kW to 26kW+. The right size depends on your home\'s square footage, HVAC system, and electrical load. We calculate your actual load during the free assessment — not guessing based on square footage alone.',
      },
      {
        question: 'How long can a whole home generator run?',
        answer: 'Connected to natural gas, a whole home generator can run indefinitely — as long as utility gas service is maintained. On propane, runtime depends on tank size. A 500-gallon propane tank typically provides 7–10 days of continuous operation for a 20kW generator.',
      },
      {
        question: 'How much does whole home generator installation cost?',
        answer: 'Whole home generator installations typically range from $8,000 to $18,000 depending on generator size, fuel type, and site conditions. We provide free in-home estimates with no obligation.',
      },
    ],
    signsList: [
      { title: 'You\'ve Lost Power for Days at a Time', description: 'Hudson Valley ice storms and nor\'easters can knock power out for 3–7 days. If you\'ve lived through that once without backup power, you know exactly why a whole-home generator matters.' },
      { title: 'You Have a Sump Pump', description: 'The most dangerous time to lose power is during the heavy rain that often accompanies outages. A failed sump pump during a storm can mean thousands in flood damage.' },
      { title: 'You Have a Well Pump', description: 'No electricity means no water in homes on well systems. A whole-home generator keeps your water running throughout any outage.' },
      { title: 'Someone in Your Home Depends on Medical Equipment', description: 'CPAP machines, oxygen concentrators, refrigerated medications, and other medical devices require uninterrupted power. A standby generator removes any dependency on the grid.' },
      { title: 'You Travel or Are Away from Home Regularly', description: 'A whole-home generator protects your home automatically when you\'re away — pipes don\'t freeze, sump pumps keep running, and security systems stay active.' },
      { title: 'You Work from Home', description: 'A power outage means lost productivity, missed calls, and potential data loss. Standby power keeps your home office running without any interruption.' },
    ],
  },

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'generac',
    title: 'Generac Generators',
    metaTitle: 'Generac Generator Dealer Hudson Valley | Authorized Installation',
    metaDescription:
      'Authorized Generac generator dealer and installer in the Hudson Valley. Factory-trained installation. Full warranty. Free estimates. Call (518) 678-1230.',
    heroTitle: 'Generac Generator Installation',
    heroDescription:
      'As an authorized Generac dealer, we install America\'s most trusted standby generator brand with factory-trained technicians and the full manufacturer warranty.',
    image: { src: '/images/services/generator.webp', alt: 'Generac generator installation by TZ Electric' },
    overview: [
      'Generac is America\'s #1 selling home standby generator brand — and as an authorized Generac dealer, TZ Electric installs and services the full Generac lineup with factory-trained technicians. This means your installation is done to Generac\'s specifications, backed by Generac\'s full warranty, and eligible for Generac\'s ongoing support and parts availability.',
      'Generac\'s Guardian series covers residential applications from 10kW (essential circuits) through 26kW (whole home for large homes). The PWRCELL battery storage system allows you to pair your generator with solar for clean-energy backup. The Industrial and Commercial lines cover larger properties and businesses.',
      'Being an authorized dealer means we have direct access to Generac parts, training, and technical support — critical for both installation quality and long-term service. An installation by an unauthorized contractor may void your warranty and leave you without factory support when you need it most.',
    ],
    features: [
      { title: 'Full Generac Product Line', description: 'Access to the complete Generac Guardian, PowerPact, PWRCELL, and Commercial lineup — we match the right product to your needs and budget.' },
      { title: 'Factory-Trained Installation', description: 'Our technicians have completed Generac\'s factory training program, ensuring installations meet manufacturer specifications for warranty eligibility.' },
      { title: 'Full Manufacturer Warranty', description: 'Authorized dealer installations qualify for the full Generac warranty — 5 years on residential standby generators, with extended coverage available.' },
      { title: 'Mobile Link Remote Monitoring', description: 'Every Generac we install is set up with Mobile Link — you\'ll receive outage alerts, weekly test reports, and maintenance reminders via the app.' },
      { title: 'Generac Service & Repairs', description: 'We service all Generac models — whether we installed it or not. Authorized dealer service access means genuine Generac parts and factory diagnostic tools.' },
      { title: 'Generac Maintenance Plans', description: 'Annual maintenance plans covering oil changes, spark plug replacement, filter service, and full operational testing to keep your Generac ready.' },
    ],
    faqs: [
      {
        question: 'Why does it matter if I use an authorized Generac dealer?',
        answer: 'Authorized dealers have completed Generac\'s installation training and must meet ongoing certification requirements. Installations by unauthorized contractors can void your factory warranty, may not meet code in your municipality, and leave you without Generac technical support. The authorization matters.',
      },
      {
        question: 'What is the difference between Generac Guardian and PowerPact models?',
        answer: 'The Guardian series (10kW–26kW) is designed for whole-home coverage — powering every circuit. The PowerPact (7kW–10kW) is a cost-effective option that covers essential circuits only. The right choice depends on your home size and what you need to power during an outage.',
      },
      {
        question: 'Does Generac work with natural gas?',
        answer: 'Yes. Generac Guardian units are available in natural gas and liquid propane configurations. Natural gas is the most convenient option where available — no fuel storage required. Propane is used where natural gas service isn\'t available.',
      },
    ],
    signsList: [
      { title: 'You Want the Most Trusted Generator Brand', description: 'Generac is the #1 selling home standby generator brand in the US. Their residential lineup has the widest parts availability, best dealer network, and most extensive warranty support.' },
      { title: 'You Need Remote Monitoring', description: 'Generac\'s Mobile Link app gives you real-time status, outage alerts, weekly test confirmations, and maintenance reminders from anywhere — critical when you travel.' },
      { title: 'You Want Factory Warranty Protection', description: 'Only authorized Generac dealer installations qualify for the full factory warranty. We install to Generac\'s specifications and register your system for complete coverage.' },
      { title: 'You Want Quiet Operation', description: 'Generac Guardian units include advanced sound-dampening enclosures, making them significantly quieter than older generator designs or portable units.' },
      { title: 'You Have Natural Gas Service', description: 'Generac Guardian generators run on natural gas, giving you unlimited runtime during extended outages without fuel storage or delivery concerns.' },
      { title: 'You Need Year-Round Reliability', description: 'Generac generators are engineered for operation in extreme conditions — cold starts, summer heat, and everything the Hudson Valley weather delivers. Weekly self-tests confirm readiness automatically.' },
    ],
  },

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'standby',
    title: 'Standby Generator',
    metaTitle: 'Standby Generator Installation Hudson Valley | Automatic Backup',
    metaDescription:
      'Standby generator installation in the Hudson Valley. Automatic startup within seconds of an outage. Whole-home protection. Free estimates. Call (518) 678-1230.',
    heroTitle: 'Standby Generator Installation',
    heroDescription:
      'Automatic power protection that starts within seconds of an outage — standby generators protect your home without any action required from you.',
    image: { src: '/images/services/generator.webp', alt: 'Standby generator installation by TZ Electric' },
    overview: [
      'A standby generator is permanently installed at your home and connected to your electrical panel via an automatic transfer switch (ATS). When utility power fails, the ATS detects the outage and signals the generator to start — typically within 10–30 seconds. Once the generator reaches operating voltage, the ATS transfers your home\'s electrical load from utility power to the generator. When utility power returns, the process reverses automatically.',
      'The defining advantage of standby power is the automatic, no-intervention operation. You don\'t need to be home. You don\'t need to pull a generator out of the garage, add fuel, and run extension cords. The system responds on its own — protecting your sump pump, HVAC, refrigerator, and security system regardless of when the outage occurs.',
      'Hudson Valley power outages are frequently driven by ice storms, summer thunderstorms, and nor\'easters that can knock out power for days. For homeowners with sump pumps, well pumps, elderly family members, or medical equipment dependencies, standby power isn\'t optional — it\'s essential.',
    ],
    features: [
      { title: 'Automatic Transfer Switch', description: 'The ATS detects a power outage and transfers your home to generator power automatically — no human action required, day or night.' },
      { title: 'Seconds-to-Start Protection', description: 'Standby generators reach operating voltage in 10–30 seconds after an outage — before most electronics even notice the interruption.' },
      { title: 'Sump Pump & Well Pump Protection', description: 'The most critical load most homeowners cite: a standby generator ensures your sump pump keeps running during the heavy rain events that often accompany outages.' },
      { title: 'HVAC System Continuity', description: 'Keep your heating running during a winter storm or your AC running during a summer heat emergency — standby power covers your full HVAC system.' },
      { title: 'No Fuel Storage Required', description: 'Natural gas-connected standby generators require no fuel storage. Propane options are available for homes without natural gas service.' },
      { title: 'Code-Compliant Installation', description: 'Every installation includes all permits, inspections, and utility notification required by your municipality and utility company.' },
    ],
    faqs: [
      {
        question: 'How is a standby generator different from a portable generator?',
        answer: 'A standby generator is permanently installed, starts automatically, connects directly to your panel, and runs on natural gas or propane. A portable generator must be stored, manually started, requires gasoline, and connects via extension cords or a manual transfer switch. Standby is significantly more convenient and provides far better protection — at a higher upfront cost.',
      },
      {
        question: 'Does a standby generator need maintenance?',
        answer: 'Yes. Annual maintenance is recommended and required to maintain your warranty. This includes oil change, spark plug replacement, filter service, and a full load test. Our maintenance plans cover everything.',
      },
      {
        question: 'Can a standby generator power my EV charger?',
        answer: 'Yes, if the generator is sized appropriately. A Level 2 EV charger draws 6–12kW. A whole-home generator (18–26kW) can handle the charger along with the rest of your home\'s load. We account for EV charging in load calculations when it\'s a priority for you.',
      },
    ],
    signsList: [
      { title: 'You\'re Tired of Manual Generator Setup', description: 'Dragging a portable generator out of the garage, adding gasoline, and running extension cords in the dark during a storm is exactly what a standby generator eliminates permanently.' },
      { title: 'Your Outages Are Frequent or Long', description: 'If you\'ve experienced multiple multi-day outages in recent years, the inconvenience and cost of being without power adds up fast compared to the one-time cost of standby protection.' },
      { title: 'You Have Critical Loads That Can\'t Wait', description: 'Sump pumps, well pumps, CPAP machines, refrigerated medications, and medical devices can\'t wait 30 minutes for you to set up a portable generator. Standby acts in seconds.' },
      { title: 'You Want Protection When You\'re Away', description: 'A portable generator only helps when someone is home to set it up. A standby generator protects your home automatically while you\'re at work, traveling, or sleeping.' },
      { title: 'Your Propane or Gas Line Is Already There', description: 'If your home already has natural gas service or a propane tank, a standby generator can be connected to your existing fuel supply — no fuel storage required.' },
      { title: 'You\'re Ready to Stop Worrying About Outages', description: 'The value of a standby generator is largely peace of mind. Knowing that any outage is handled automatically — regardless of timing, weather, or whether you\'re home — is significant.' },
    ],
  },

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'backup',
    title: 'Backup Generator',
    metaTitle: 'Backup Generator Installation Hudson Valley | Home Power Protection',
    metaDescription:
      'Backup generator installation in the Hudson Valley. Protect essential systems and appliances from power outages. Generac dealer. Call (518) 678-1230.',
    heroTitle: 'Backup Generator Installation',
    heroDescription:
      'Don\'t let the next power outage leave you in the dark — a backup generator protects your essential systems and keeps your family comfortable when the grid goes down.',
    image: { src: '/images/services/generator.webp', alt: 'Backup generator installation by TZ Electric' },
    overview: [
      'A backup generator gives you the ability to maintain power to the systems and appliances that matter most during an outage. Depending on the generator size, this can range from a few essential circuits (sump pump, refrigerator, lighting) to your entire home.',
      'The term "backup generator" is often used interchangeably with "standby generator" — but can also refer to generators that power a subset of your home rather than the full load. If a whole-home standby generator is outside your budget, a properly sized essential-load system can still protect the things that matter most at a lower cost.',
      'We help homeowners determine what they actually need to protect during an outage — not just what sounds good in a sales pitch. For some families, essentials mean sump pump, heat, and refrigerator. For others, it means the whole house. We design the system around your real priorities.',
    ],
    features: [
      { title: 'Essential Circuit Coverage', description: 'Protect your sump pump, refrigerator, HVAC, well pump, and critical lighting with a properly sized backup system that fits your budget.' },
      { title: 'Whole-Home Backup Option', description: 'Upgrade to whole-home coverage and power every circuit automatically — the most comprehensive protection available.' },
      { title: 'Automatic Startup', description: 'Automatic transfer switch detects outages and starts the generator within seconds — no manual action required, day or night.' },
      { title: 'Tailored Power Solutions', description: 'We design your system around your actual priorities — identifying which loads matter most and sizing the generator accordingly.' },
      { title: 'Natural Gas & Propane Options', description: 'Connected to natural gas for unlimited runtime, or propane for properties where gas service isn\'t available.' },
      { title: 'Full Installation & Permitting', description: 'Complete installation including transfer switch, all wiring, permits, and coordination with your utility and fuel supplier.' },
    ],
    faqs: [
      {
        question: 'What is the difference between a backup generator and a standby generator?',
        answer: 'The terms are often used interchangeably. In our usage, a "standby generator" typically refers to a whole-home system that powers every circuit. A "backup generator" more broadly refers to any permanently installed generator — including systems sized for essential circuits only. Both use automatic transfer switches.',
      },
      {
        question: 'How do I decide what circuits to back up?',
        answer: 'Think about what you can\'t go without during a multi-day winter outage: heat, refrigerator, sump pump, water (well pump), and medical equipment are typically the top priorities. Lighting and phone charging are secondary. We\'ll help you build a priority list and size the generator accordingly.',
      },
      {
        question: 'How much does a backup generator installation cost?',
        answer: 'Essential-load backup generator installations (7kW–12kW) typically range from $5,000–$10,000 installed. Whole-home systems run higher. We provide free estimates after the in-home assessment.',
      },
    ],
    signsList: [
      { title: 'You Want Protection But Whole-Home Is Too Much', description: 'A properly sized essential-load generator protects what actually matters — sump pump, refrigerator, heating, and key lighting — at a lower cost than full whole-home coverage.' },
      { title: 'You Have a Tight Budget for Generator Installation', description: 'A 7–12kW essential-load backup generator delivers meaningful protection at a significantly lower price point than a full 20–26kW whole-home system.' },
      { title: 'You\'ve Experienced Flooding From Lost Sump Power', description: 'One failed sump pump during a rainstorm can cause tens of thousands in water damage. Backup power for just that circuit alone justifies the investment.' },
      { title: 'You\'re Not Sure What Size You Need', description: 'If you\'re unsure whether to cover essentials or the whole home, start with our free in-home assessment. We calculate your actual load and show you both options with honest cost comparisons.' },
      { title: 'You Want Automatic Protection Without Hassle', description: 'Even a modest essential-load system with an automatic transfer switch means no manual intervention during an outage — the generator handles everything on its own.' },
      { title: 'You\'re on a Propane or Gas System Already', description: 'If your home already has propane for a furnace or range, we can tie into your existing tank to power a backup generator — no new fuel infrastructure required.' },
    ],
  },

  {
    parent: 'generator',
    parentTitle: 'Generator Installation',
    slug: 'emergency-service',
    title: 'Emergency Generator Service',
    metaTitle: 'Emergency Generator Repair Hudson Valley | Fast Generac Service',
    metaDescription:
      'Emergency generator repair in the Hudson Valley. Fast response for Generac and all major brands. Don\'t be without power when you need your generator most. Call (518) 678-1230.',
    heroTitle: 'Emergency Generator Service & Repair',
    heroDescription:
      'Your generator failing during a power outage defeats its purpose. Our emergency service team responds fast to diagnose and repair Generac and all major generator brands.',
    image: { src: '/images/services/generator.webp', alt: 'Emergency generator repair by TZ Electric' },
    overview: [
      'A generator that fails when you need it most is worse than no generator at all — it creates false confidence. The most common reason generators fail during an outage is deferred maintenance: old oil, fouled spark plugs, a dead battery, or a carburetor clogged from sitting without use. These failures are preventable.',
      'When your generator does fail during an active outage, we respond as quickly as possible. Our service technicians carry common Generac parts and diagnostic equipment to diagnose and repair most issues in a single visit. We service all Generac models as well as other major residential generator brands.',
      'After the emergency is resolved, we\'ll discuss a maintenance plan to prevent the same situation from occurring again. Most generator failures during outages are avoidable with annual maintenance — and the cost of an annual service call is a fraction of the cost of an emergency repair.',
    ],
    features: [
      { title: 'Fast Emergency Response', description: 'We prioritize generator service calls during active outages. Our goal is to get your generator running as quickly as possible.' },
      { title: 'Generac-Certified Service', description: 'As an authorized Generac dealer, we carry common Generac parts and use factory diagnostic tools for fast, accurate repair.' },
      { title: 'All Major Brands Serviced', description: 'We service Generac, Kohler, Briggs & Stratton, Cummins, and other major residential generator brands.' },
      { title: 'Battery & Charging System Repair', description: 'Dead or weak batteries are the most common generator failure. We test, diagnose, and replace generator starting batteries.' },
      { title: 'Control Board & Transfer Switch Repair', description: 'Diagnosis and repair of generator control boards, ATS failures, and all electrical components of your backup power system.' },
      { title: 'Post-Repair Maintenance Plan', description: 'After your emergency repair, enroll in our annual maintenance plan to keep your generator ready for the next outage.' },
    ],
    faqs: [
      {
        question: 'Why did my generator fail during an outage?',
        answer: 'The most common causes of generator failure during outages: dead or discharged starting battery, old oil causing startup failure, clogged air filter, fouled spark plugs, low coolant, or a control board fault. Most of these are preventable with annual maintenance.',
      },
      {
        question: 'My generator starts but won\'t take the load — what is wrong?',
        answer: 'A generator that starts but won\'t transfer load or shuts down under load is usually experiencing a governor issue, a fuel delivery problem, a low oil pressure fault, or an overload condition. We diagnose the specific cause with our generator diagnostic equipment.',
      },
      {
        question: 'Do you work on generators you didn\'t install?',
        answer: 'Yes. We service all Generac models and other major brands regardless of who installed them. If you have a generator that hasn\'t been serviced or that failed, call us.',
      },
    ],
    signsList: [
      { title: 'Your Generator Didn\'t Start During the Last Outage', description: 'A generator that fails when you actually need it is the worst outcome. This is almost always preventable with annual maintenance — and repairable with a service call.' },
      { title: 'Your Generator Is Showing Error Codes', description: 'Generac and other brands display fault codes on the control panel. If your generator is showing a code or alarm, it needs diagnosis before the next outage occurs.' },
      { title: 'Your Generator Hasn\'t Run in Over a Year', description: 'Gasoline and oil degrade, batteries discharge, and internal components corrode when generators sit unused. A service call before the next storm season is essential.' },
      { title: 'Your Generator Runs But Then Shuts Off', description: 'A generator that starts and then shuts down under load has a fuel delivery issue, a low oil pressure fault, or a governor problem. All are diagnosable and repairable.' },
      { title: 'You Hear Unusual Noises When It Runs', description: 'Knocking, rattling, or rough running during the weekly self-test are signs of mechanical issues developing. Catching them early prevents a larger failure during an actual outage.' },
      { title: 'It\'s Been More Than a Year Since Service', description: 'Annual maintenance is required to maintain your generator\'s warranty and ensure reliability. Oil, filters, spark plugs, and the battery all have scheduled service intervals.' },
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
      'Tankless water heater installation in the Hudson Valley. Endless on-demand hot water, lower energy costs. Gas and electric models. Call (518) 678-1230.',
    heroTitle: 'Tankless Water Heater Installation',
    heroDescription:
      'Endless hot water on demand, dramatically lower energy bills, and a unit that lasts twice as long as a tank — tankless water heater installation done right.',
    image: { src: '/images/services/water-heater.png', alt: 'Tankless water heater installation by TZ Electric' },
    overview: [
      'A tankless (or on-demand) water heater heats water only when you need it — there\'s no storage tank to maintain at temperature 24 hours a day. When you open a hot water tap, cold water flows through the unit, a gas burner or electric element fires, and hot water is delivered continuously until you shut the tap. There\'s no "running out" of hot water.',
      'The efficiency advantage is significant: traditional tank water heaters lose heat through the tank walls constantly (called standby losses), even when no hot water is being used. A tankless unit has no standby losses. Gas tankless units are typically 24–34% more efficient than comparable gas tanks; electric units can be even more efficient depending on your utility rates.',
      'Tankless units are also compact — most wall-mount gas models are roughly the size of a small suitcase, compared to a 50-gallon tank. They\'re rated for 20+ years of service life with proper maintenance, compared to 8–12 years for tank units.',
    ],
    process: [
      { step: '1', title: 'Load Assessment', description: 'We determine your household\'s peak hot water demand — number of simultaneous fixtures, flow rates, and incoming water temperature.' },
      { step: '2', title: 'Unit Selection', description: 'We specify a properly sized unit in gas or electric based on your fuel source, budget, and demand profile.' },
      { step: '3', title: 'Installation', description: 'Unit mounted, gas or electric supply connected, venting installed (for gas), and all connections made to code.' },
      { step: '4', title: 'Testing & Walkthrough', description: 'We verify correct operation, set the temperature, and show you the maintenance requirements for your new unit.' },
    ],
    features: [
      { title: 'Endless On-Demand Hot Water', description: 'No storage tank means no running out. Hot water is produced on demand as long as you need it — ideal for larger families or high-demand households.' },
      { title: 'Lower Energy Bills', description: 'No standby heat loss. Gas tankless units are 24–34% more efficient than tank units of comparable capacity. Savings accumulate over the 20+ year lifespan.' },
      { title: 'Gas & Electric Models', description: 'We install both natural gas/propane tankless units and electric models. Gas units deliver higher flow rates; electric units are simpler to install in some locations.' },
      { title: 'Space-Saving Wall-Mount Design', description: 'Most tankless units mount on the wall and take a fraction of the floor space of a traditional tank — freeing up mechanical room or basement space.' },
      { title: '20+ Year Service Life', description: 'With annual descaling maintenance, tankless units routinely last 20–25 years — roughly twice the lifespan of a traditional tank water heater.' },
      { title: 'Whole-House & Point-of-Use Options', description: 'Whole-house units handle all fixtures simultaneously. Point-of-use mini tankless units can supplement a single fixture for reduced wait time.' },
    ],
    faqs: [
      {
        question: 'Is a tankless water heater worth the cost?',
        answer: 'For most households, yes — particularly if your existing tank is reaching end of life anyway. The upfront cost is higher than a tank replacement, but lower energy bills (15–30% savings) and a 20+ year lifespan typically make the total cost of ownership lower. The convenience of endless hot water is a significant quality-of-life improvement for larger families.',
      },
      {
        question: 'Can a tankless water heater handle my whole house?',
        answer: 'It depends on your peak demand. A properly sized whole-house gas tankless unit (200,000–199,000 BTU range) can handle 2–3 simultaneous showers in most homes. We size the unit based on your actual peak demand during the assessment.',
      },
      {
        question: 'Does my gas line need to be upgraded for a tankless unit?',
        answer: 'Often yes. Gas tankless water heaters have higher BTU demands than tank units — a ¾" gas line is typically required. We assess your gas line size and pressure during the installation assessment and include any needed upgrades in the quote.',
      },
      {
        question: 'Do tankless water heaters require maintenance?',
        answer: 'Yes — annual descaling is recommended in areas with hard water to prevent mineral buildup inside the heat exchanger. This is a simple service visit that maintains efficiency and extends the unit\'s life. Ignoring it is the most common reason tankless units fail prematurely.',
      },
    ],
    signsList: [
      { title: 'You Run Out of Hot Water Regularly', description: 'If your household frequently exhausts the hot water tank — especially with multiple showers back to back — a tankless unit delivers continuous hot water without limits.' },
      { title: 'Your Water Heater Is Nearing End of Life', description: 'When your tank is 8–12 years old and due for replacement, it\'s the ideal time to upgrade to tankless rather than replace like-for-like. The long-term savings justify the additional upfront cost.' },
      { title: 'You Want Lower Energy Bills', description: 'A tankless water heater eliminates standby heat loss — the energy wasted keeping a tank hot 24 hours a day. Gas tankless units are 24–34% more efficient than tank alternatives.' },
      { title: 'You\'re Remodeling or Adding Space', description: 'A remodel is the right time to reconsider your water heating approach. Tankless units are wall-mounted and take a fraction of the space, freeing up your mechanical room or utility closet.' },
      { title: 'You Have Hard Water Issues', description: 'Hard water accelerates sediment buildup in tank heaters and scale buildup in tankless heat exchangers. Annual descaling on a tankless unit is easier and less damaging than sediment in a tank.' },
      { title: 'You Want a 20-Year Water Heater', description: 'Tank water heaters last 8–12 years. Properly maintained tankless units routinely last 20–25 years — making them a more cost-effective long-term investment despite the higher upfront price.' },
    ],
  },

  {
    parent: 'hot-water-heaters',
    parentTitle: 'Hot Water Heater Services',
    slug: 'traditional',
    title: 'Traditional Water Heater Replacement',
    metaTitle: 'Water Heater Replacement Hudson Valley | Same-Day Service',
    metaDescription:
      'Traditional tank water heater replacement in the Hudson Valley. Gas and electric models in stock. Same-day replacement available. Call (518) 678-1230.',
    heroTitle: 'Traditional Water Heater Replacement',
    heroDescription:
      'Same-day tank water heater replacement when you need it — gas and electric models in stock, proper sizing, and professional installation with full permitting.',
    image: { src: '/images/services/water-heater.png', alt: 'Water heater replacement by TZ Electric' },
    overview: [
      'Traditional storage tank water heaters remain the most common type in American homes — and for good reason. They\'re relatively simple, reliable, and cost-effective to replace. A standard 40–50 gallon gas or electric water heater installed by a qualified plumber or HVAC technician will deliver consistent hot water for 8–12 years.',
      'When your water heater reaches the end of its life, the signs are usually hard to miss: rust-colored water, a rumbling or popping noise during heating cycles, water pooling around the base, or simply no hot water. Many failures come without warning — which is why we keep common models in stock for same-day replacement service.',
      'We size water heaters correctly for your household. A 40-gallon tank that was fine when your kids were young may now be inadequate for a larger family or changing usage patterns. We also evaluate whether a heat pump water heater (hybrid unit) might be a better long-term choice.',
    ],
    features: [
      { title: 'Same-Day Replacement', description: 'We stock common gas and electric models for fast turnaround. Call in the morning, have hot water by evening in most cases.' },
      { title: 'Gas & Electric Models', description: 'Natural gas, propane, and electric tank water heaters from major brands including Rheem, Bradford White, and A.O. Smith.' },
      { title: 'Correct Sizing', description: 'We size your replacement unit based on household size and actual usage patterns — not just replacing like-for-like if a larger unit is appropriate.' },
      { title: 'Proper Venting & Code Compliance', description: 'All gas water heater replacements include proper venting verification and code-compliant installation — not just swapping tanks.' },
      { title: 'Expansion Tank Installation', description: 'Modern code requires expansion tanks on closed-loop systems. We assess your system and install where required.' },
      { title: 'Old Unit Removal & Disposal', description: 'We remove and properly dispose of your old water heater as part of every replacement — no extra charge.' },
    ],
    faqs: [
      {
        question: 'How do I know when to replace my water heater?',
        answer: 'Replace when: the tank is 10+ years old, you\'re seeing rust-colored or discolored hot water, the tank is leaking from the body (not connections), you hear rumbling or popping sounds, or the unit requires frequent repairs. A leaking tank should be replaced immediately — it can fail catastrophically.',
      },
      {
        question: 'What size water heater do I need?',
        answer: 'As a general guide: 40 gallons for 1–3 people, 50 gallons for 3–5 people, 75+ gallons for 5+ people. First-hour rating (FHR) is actually more important than tank size — we use FHR to match the unit to your actual morning peak demand.',
      },
      {
        question: 'Is it worth upgrading to a heat pump water heater?',
        answer: 'If your current replacement is gas, switching to a heat pump (hybrid electric) water heater isn\'t always straightforward. But if you\'re replacing an electric tank unit, a heat pump water heater uses 60–70% less electricity and is often eligible for the federal $300 tax credit. We\'ll help you evaluate the options.',
      },
    ],
    signsList: [
      { title: 'No Hot Water at All', description: 'A complete loss of hot water is the most obvious sign — usually caused by a failed heating element (electric), pilot outage, gas valve failure, or tripped high-limit switch.' },
      { title: 'Water Takes Forever to Reheat', description: 'If your tank takes much longer than it used to for hot water to recover after use, a failing lower heating element or heavy sediment buildup is usually the cause.' },
      { title: 'Water Is Lukewarm, Not Hot', description: 'Consistently lukewarm water often points to a failed upper heating element (electric) or an issue with the gas burner assembly. Both are repairable without replacing the tank.' },
      { title: 'Your Tank Is Leaking From Connections', description: 'Leaking from the inlet/outlet connections or the pressure relief valve is often repairable. Leaking from the tank body itself is a sign the tank needs replacement.' },
      { title: 'Discolored or Rusty Hot Water', description: 'Brown or rusty-looking hot water indicates internal tank corrosion — usually caused by a depleted anode rod. Replacing the anode rod early enough can extend the tank\'s life.' },
      { title: 'Rumbling or Popping Sounds', description: 'Sediment buildup on the bottom of the tank causes water trapped underneath to superheat and pop through it. This is inefficient and stressful to the tank — a flush or replacement may be needed.' },
    ],
  },

  {
    parent: 'hot-water-heaters',
    parentTitle: 'Hot Water Heater Services',
    slug: 'repair',
    title: 'Water Heater Repair',
    metaTitle: 'Water Heater Repair Hudson Valley | All Brands Fast Service',
    metaDescription:
      'Water heater repair in the Hudson Valley. Fast diagnosis and repair for tank, tankless, and hybrid water heaters. All brands. Call (518) 678-1230.',
    heroTitle: 'Water Heater Repair',
    heroDescription:
      'Fast diagnosis and honest repair for all water heater types — tank, tankless, and hybrid. We fix the actual problem, not just the symptom.',
    image: { src: '/images/services/water-heater.png', alt: 'Water heater repair by TZ Electric' },
    overview: [
      'Water heater problems aren\'t always a sign that the unit needs to be replaced. A failed heating element, a faulty thermostat, a tripped reset button, a bad pressure relief valve, or a deteriorated anode rod are all repairable issues that can restore years of service life to an otherwise sound unit.',
      'The key is accurate diagnosis before any repair is recommended. We assess your water heater\'s age, condition, and the nature of the failure before making a recommendation. If the repair cost represents good value relative to the unit\'s remaining life expectancy, we repair it. If the unit is near end of life or the failure suggests deeper issues, we\'ll tell you honestly.',
      'We service all major water heater brands including Rheem, Bradford White, A.O. Smith, Rinnai, Navien, Noritz, and others — both tank and tankless models. For tankless units, we have the manufacturer diagnostic tools to accurately identify electronic and combustion system faults.',
    ],
    features: [
      { title: 'Accurate Diagnosis First', description: 'We identify the actual cause of the failure before recommending any repair — not just replacing parts until something works.' },
      { title: 'Heating Element Replacement', description: 'Replace failed upper or lower heating elements in electric tank water heaters. Usually a straightforward same-visit repair.' },
      { title: 'Thermostat Replacement', description: 'Faulty thermostats cause inconsistent temperatures or no heat. We test and replace gas and electric thermostats as needed.' },
      { title: 'Gas Valve & Burner Service', description: 'Diagnose and repair gas valve failures, pilot assembly issues, and burner problems in natural gas and propane water heaters.' },
      { title: 'Anode Rod Replacement', description: 'The anode rod protects your tank from corrosion. A depleted anode rod is the most common cause of premature tank failure — and it\'s replaceable.' },
      { title: 'Tankless Unit Repair & Descaling', description: 'Electronic fault diagnosis, ignition system repair, flow sensor replacement, and descaling service for gas and electric tankless units.' },
    ],
    faqs: [
      {
        question: 'My hot water runs out quickly — what is wrong?',
        answer: 'For tank units, quick hot water depletion usually means a failed lower heating element (electric) or a sediment buildup that reduces effective tank capacity. For tankless units, it often indicates a partial ignition failure or flow sensor issue. We diagnose the specific cause.',
      },
      {
        question: 'My water heater is making a rumbling noise — should I be worried?',
        answer: 'Yes. Rumbling, popping, or banging sounds from a tank water heater are caused by sediment buildup on the bottom of the tank. Sediment traps water that turns to steam and pops through it. This reduces efficiency, strains the tank, and shortens its life. A tank flush may help; if the buildup is severe, replacement may be more practical.',
      },
      {
        question: 'How do I know whether to repair or replace my water heater?',
        answer: 'If the unit is less than 6–7 years old and the repair is straightforward (element, thermostat, valve), repair usually makes sense. If it\'s 10+ years old, has had multiple issues, or the repair involves the tank itself (corrosion, leaking body), replacement is usually the better investment. We give you an honest assessment.',
      },
    ],
    signsList: [
      { title: 'No Hot Water or Hot Water Has Stopped', description: 'Complete loss of hot water is the most urgent sign — call us. The cause is usually a failed heating element, thermostat, gas valve, or pilot — all repairable in one visit.' },
      { title: 'Inconsistent Water Temperature', description: 'Water that fluctuates between scalding and cool suggests a faulty thermostat or a failing element that works intermittently. Both are straightforward diagnostic and repair jobs.' },
      { title: 'Strange Noises From the Unit', description: 'Popping, rumbling, or banging from your water heater during the heating cycle is sediment buildup. A flush can help; if buildup is severe, we assess whether repair or replacement makes sense.' },
      { title: 'Visible Rust or Corrosion', description: 'Rust on the tank exterior or at fittings indicates moisture exposure and potential internal corrosion. Combined with age or discolored water, this often means replacement is the right call.' },
      { title: 'You Can Smell Gas Near the Unit', description: 'If you smell gas near your water heater, leave the home and call us immediately. A gas valve or connection issue is a serious safety concern that requires immediate professional attention.' },
      { title: 'Your Unit Is Under 10 Years Old and Underperforming', description: 'A water heater under 10 years old that\'s not performing correctly almost always has a repairable component issue — element, thermostat, anode, or gas valve. Replacement isn\'t necessary yet.' },
    ],
  },

  {
    parent: 'hot-water-heaters',
    parentTitle: 'Hot Water Heater Services',
    slug: 'maintenance',
    title: 'Water Heater Maintenance',
    metaTitle: 'Water Heater Maintenance Hudson Valley | Annual Service',
    metaDescription:
      'Water heater maintenance in the Hudson Valley. Annual flush, inspection, anode rod check, and tankless descaling. Extend your unit\'s life. Call (518) 678-1230.',
    heroTitle: 'Water Heater Maintenance',
    heroDescription:
      'Annual maintenance extends your water heater\'s life, maintains efficiency, and catches problems before they become emergencies — for both tank and tankless units.',
    image: { src: '/images/services/water-heater.png', alt: 'Water heater maintenance by TZ Electric' },
    overview: [
      'Water heaters are often the most neglected appliance in a home — set and forgotten until they fail. But like any mechanical system, they benefit from regular maintenance that prevents the gradual buildup of sediment, mineral scale, and corrosion that shortens their service life.',
      'For tank water heaters, annual maintenance includes a tank flush to remove sediment buildup, inspection of the anode rod (which sacrificially protects the tank from corrosion), testing the temperature-pressure relief valve, and verifying correct temperature settings. These steps alone can extend a tank\'s life by several years.',
      'For tankless water heaters, annual descaling is the most critical maintenance task. Mineral deposits (primarily calcium) build up inside the heat exchanger over time, reducing flow rate and heat transfer efficiency — and eventually causing failure. Descaling flushes this buildup out before it can cause damage.',
    ],
    process: [
      { step: '1', title: 'Inspection', description: 'We inspect all visible components — connections, valves, venting, and the unit itself — for signs of leaks, corrosion, or wear.' },
      { step: '2', title: 'Tank Flush or Descale', description: 'Tank units are flushed to remove sediment. Tankless units undergo a full descaling flush to clear mineral buildup from the heat exchanger.' },
      { step: '3', title: 'Component Check', description: 'Anode rod inspection and replacement if depleted. T&P valve test. Thermostat verification. Gas supply check for gas units.' },
      { step: '4', title: 'Report & Recommendations', description: 'We report our findings and advise on any upcoming concerns — so you can plan proactively instead of reacting to a failure.' },
    ],
    features: [
      { title: 'Tank Sediment Flush', description: 'Annual flushing removes mineral sediment that accumulates at the bottom of tank water heaters, reducing efficiency and accelerating tank corrosion.' },
      { title: 'Anode Rod Inspection & Replacement', description: 'The anode rod is the main protection against tank corrosion. We inspect it annually and replace it before it\'s fully depleted — extending tank life significantly.' },
      { title: 'T&P Valve Testing', description: 'The temperature-pressure relief valve is a critical safety device. We test it annually to confirm it operates correctly and won\'t fail under pressure.' },
      { title: 'Tankless Descaling Service', description: 'Circulate descaling solution through your tankless unit to dissolve calcium and mineral buildup in the heat exchanger — restoring efficiency and extending life.' },
      { title: 'Gas Connection & Venting Check', description: 'Verify gas connections for leaks and confirm venting is clear and properly connected — critical safety checks for all gas water heaters.' },
      { title: 'Temperature & Efficiency Verification', description: 'Confirm your unit is delivering water at the correct temperature and operating efficiently — we flag issues before they become service calls.' },
    ],
    faqs: [
      {
        question: 'How often should a water heater be serviced?',
        answer: 'Annual maintenance is recommended for all water heater types. In areas with particularly hard water, tankless units benefit from descaling every 6–12 months depending on water hardness. Annual maintenance is the most cost-effective way to extend your unit\'s life.',
      },
      {
        question: 'What is the anode rod and why does it matter?',
        answer: 'The anode rod is a sacrificial metal rod (usually magnesium or aluminum) inside your tank that corrodes preferentially, protecting the steel tank walls from rust. Once depleted, the tank itself begins to corrode rapidly. Replacing the anode rod before it\'s fully consumed is one of the most impactful maintenance actions for extending tank life.',
      },
      {
        question: 'Can I flush my own water heater?',
        answer: 'A basic tank flush (connecting a hose and draining the tank) is a DIY-possible task, but many homeowners skip it because of the effort involved. For tankless descaling, the process requires a submersible pump and descaling solution — it\'s more involved. We recommend having a professional handle the annual service to ensure all components are inspected at the same time.',
      },
    ],
    signsList: [
      { title: 'Your Water Heater Has Never Been Serviced', description: 'Most water heaters are installed and forgotten until they fail. If yours has never been flushed or inspected, you\'re likely already past the point where sediment and anode depletion are reducing its life.' },
      { title: 'Your Water Heater Is 5+ Years Old', description: 'Annual service should begin in the first year and continue throughout the unit\'s life. By year 5 without maintenance, sediment buildup in a tank unit is typically significant.' },
      { title: 'You Have Hard Water', description: 'Hudson Valley water tends toward the harder side of the spectrum. Hard water accelerates both sediment buildup in tanks and scale buildup in tankless heat exchangers — making annual maintenance even more important.' },
      { title: 'Your Hot Water Doesn\'t Last as Long as It Used To', description: 'Reduced hot water capacity is often caused by sediment taking up volume at the bottom of the tank. A flush typically restores some lost capacity if the tank is otherwise sound.' },
      { title: 'You Hear Popping or Rumbling Sounds', description: 'Sediment-related noise during heating cycles is your tank\'s way of telling you it needs a flush. The longer you wait, the more stress is placed on the tank lining.' },
      { title: 'Your Tankless Unit Has Lower Flow Than It Used To', description: 'Reduced hot water flow rate from a tankless unit is almost always scale buildup in the heat exchanger. Annual descaling restores full flow and efficiency before permanent damage occurs.' },
    ],
  },
]

export function getSubServicePage(parent: string, slug: string): SubServicePage | undefined {
  return SUB_SERVICE_PAGES.find((s) => s.parent === parent && s.slug === slug)
}

export function getSubServicesByParent(parent: string): SubServicePage[] {
  return SUB_SERVICE_PAGES.filter((s) => s.parent === parent)
}
