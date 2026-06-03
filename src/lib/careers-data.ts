// ============================================
// TZ ELECTRIC INC - CAREERS / JOB LISTINGS DATA
// ============================================

export const CAREERS_APPLICATION_URL = 'https://ghfs29y37tj.typeform.com/to/hsBm2HUf'

export interface JobListing {
  title: string
  slug: string
  type: string
  location: string
  pay: string
  description: string
  overview: string[]
  responsibilities: string[]
  qualifications: string[]
  benefits: string[]
  schedule: string[]
}

export const JOB_LISTINGS: JobListing[] = [
  {
    title: 'Lead Electrician',
    slug: 'lead-electrician',
    type: 'Full-Time',
    location: 'Catskill, NY',
    pay: '$25 – $50/hr (experience-based)',
    description: 'Experienced electrician to lead residential projects including panel upgrades, rewiring, and EV charger installations.',
    overview: [
      'TZ Electric Inc. is seeking an experienced Lead Residential Electrician with a minimum of 5 years in the field. This role involves overseeing residential installations, ensuring code compliance, troubleshooting complex electrical systems, and mentoring junior staff.',
      'You\'ll work alongside a supportive team that values technical excellence, personal growth, and doing the job right the first time. If you take pride in your craft and want to lead a crew that does too, this is the role for you.',
    ],
    responsibilities: [
      'Direct and manage residential electrical installations, repairs, and upgrades',
      'Interpret blueprints and electrical codes for accurate execution',
      'Guarantee compliance with local and national electrical standards',
      'Diagnose electrical systems and perform preventive maintenance',
      'Train and supervise apprentices and junior electricians',
      'Coordinate with clients, contractors, and project managers',
      'Document completed work and materials used',
      'Utilize mobile apps and digital tools for job coordination',
    ],
    qualifications: [
      'Minimum 5 years residential electrical experience',
      'Valid electrician license/certification (state/local requirements)',
      'Proficiency reading blueprints and technical diagrams',
      'Knowledge of residential wiring, service upgrades, and lighting systems',
      'Strong communication, leadership, and organizational abilities',
      'Valid driver\'s license with reliable transportation',
      'Smartphone and tablet competency for digital job coordination',
    ],
    benefits: [
      '401(k) with employer matching',
      'Health, dental, and vision insurance',
      'Paid time off',
      'Bonus and overtime pay opportunities',
      'Performance bonuses',
      'Advancement opportunities',
      'Ongoing professional development',
      'Team-oriented environment',
    ],
    schedule: [
      '8-hour shifts, Monday to Friday',
      'On-call availability',
      'Potential overtime during peak seasons',
      'Weekends as needed',
    ],
  },
  {
    title: 'HVAC Project Manager',
    slug: 'hvac-project-manager',
    type: 'Full-Time',
    location: 'Catskill, NY',
    pay: '$28 – $50/hr (experience-based)',
    description: 'Manage and execute HVAC installation projects from start to finish. Experience with Mitsubishi systems a plus.',
    overview: [
      'TZ Electric Inc. is seeking a skilled HVAC Project Manager with expertise in ductless heat pump installation, maintenance, and repair. As a Mitsubishi Diamond Elite Contractor, we specialize in Mitsubishi Hyper Heat systems and need someone who can lead installations from start to finish.',
      'This role requires leadership abilities to oversee projects, mentor junior technicians, and deliver excellent customer service. You\'ll be managing timelines, budgets, and crews while ensuring every installation meets our high standards.',
    ],
    responsibilities: [
      'Lead ductless heat pump installations, including Mitsubishi Hyper Heat systems',
      'Install indoor evaporators, outdoor condensing units, and condensate drainage',
      'Install refrigerant lines, power lines, and control wiring per specifications',
      'Perform electrical work including circuit installation and panel connections',
      'Diagnose and troubleshoot ductless systems and conventional HVAC equipment',
      'Supervise junior HVAC technicians on installations and service jobs',
      'Provide training and mentorship to team members',
      'Coordinate with project managers on timelines and budgets',
      'Interface with customers regarding system operations and recommend upgrades',
      'Ensure compliance with local, state, and national HVAC codes',
    ],
    qualifications: [
      '5+ years HVAC installation and service experience',
      'EPA 608 Universal Certification (preferred)',
      'Strong electrical wiring knowledge',
      'Technical schematic and blueprint interpretation skills',
      'Proven leadership and team management experience',
      'Valid driver\'s license with clean record',
      'Ability to lift 50+ pounds and work at heights',
    ],
    benefits: [
      '401(k) with employer matching',
      'Health, dental, and vision insurance',
      'Paid time off',
      'Full uniform and safety gear provided',
      'Company events and team activities',
      'Bonus and overtime pay opportunities',
      'Advancement opportunities',
    ],
    schedule: [
      '8-hour shifts, Monday to Friday',
      'On-call availability',
      'Weekends as needed',
    ],
  },
  {
    title: 'HVAC Installer',
    slug: 'hvac-installer',
    type: 'Full-Time',
    location: 'Catskill, NY',
    pay: '$22 – $35/hr (experience-based)',
    description: 'Install and service HVAC systems including ductless mini splits, furnaces, and air conditioners.',
    overview: [
      'TZ Electric Inc. is looking for a dedicated HVAC Installer to join our growing team. You\'ll be working on ductless mini split installations, conventional HVAC systems, and heat pumps across the Hudson Valley region.',
      'This is a hands-on role where you\'ll work alongside experienced project managers and technicians. Whether you\'re installing a Mitsubishi Hyper Heat system or servicing a conventional furnace, you\'ll have the support and training to grow your skills.',
    ],
    responsibilities: [
      'Install ductless mini split systems, furnaces, and air conditioning units',
      'Run refrigerant lines, electrical connections, and condensate drainage',
      'Mount indoor and outdoor units according to manufacturer specifications',
      'Perform system startups, testing, and commissioning',
      'Assist with routine maintenance and service calls',
      'Maintain clean and safe work environments on job sites',
      'Communicate professionally with customers and team members',
      'Follow safety protocols for electrical systems and refrigerants',
    ],
    qualifications: [
      '2+ years HVAC installation experience (or equivalent trade school)',
      'Familiarity with ductless mini split systems preferred',
      'Basic electrical wiring knowledge',
      'Ability to read technical schematics',
      'Valid driver\'s license with reliable transportation',
      'Ability to lift 50+ pounds and work at heights',
      'Strong work ethic and team-oriented attitude',
    ],
    benefits: [
      '401(k) with employer matching',
      'Health, dental, and vision insurance',
      'Paid time off',
      'Full uniform and safety gear provided',
      'On-the-job training and mentorship',
      'Bonus and overtime pay opportunities',
      'Career advancement into project management',
    ],
    schedule: [
      '8-hour shifts, Monday to Friday',
      'Potential overtime during peak seasons',
      'Weekends as needed',
    ],
  },
  {
    title: 'Estimator',
    slug: 'estimator',
    type: 'Full-Time',
    location: 'Catskill, NY (Hudson Valley region)',
    pay: '$50,000 base + commission ($90K–$140K potential)',
    description: 'Prepare accurate estimates and build relationships with customers. Technical knowledge and customer-facing experience required.',
    overview: [
      'TZ Electric Inc. is seeking an experienced Estimator & Sales professional with 5–8 years in residential electrical systems. This role combines technical expertise with sales acumen — you\'ll advise homeowners, prepare detailed project estimates, and close projects independently.',
      'You\'ll be the face of TZ Electric in customers\' homes, building trust through honest recommendations and professional presentations. If you know residential electrical inside and out and can close deals with confidence, this role offers serious earning potential.',
    ],
    responsibilities: [
      'Conduct in-home consultations assessing client electrical needs',
      'Prepare detailed project estimates for installations, upgrades, and repairs',
      'Present proposals professionally to earn customer trust and close sales',
      'Maintain current knowledge of local electrical codes and standards',
      'Manage leads and track sales pipeline performance metrics',
      'Collaborate with installation crews on timelines and specifications',
      'Build long-term customer relationships through follow-up and service',
      'Provide occasional evening/weekend on-call support',
    ],
    qualifications: [
      '5–8 years estimating/selling residential electrical services',
      'Strong understanding of residential electrical systems and wiring',
      'Blueprint and schematic interpretation ability',
      'Proficiency with CRM tools, tablets, and estimating software',
      'Excellent communication and presentation skills',
      'Valid driver\'s license with clean driving record',
      'Professional appearance and self-directed work ethic',
    ],
    benefits: [
      'Company vehicle provided',
      'Company credit card',
      'Weekly pay',
      'Health, dental, and vision insurance',
      'Paid time off (vacation, holidays, sick days)',
      'Paid parental leave',
      'Paid training and certifications (OSHA, NEC)',
      'Full uniform and safety gear',
      '401(k) with employer matching',
    ],
    schedule: [
      'Monday to Friday, day shift',
      'Occasional evening/weekend availability',
    ],
  },
  {
    title: 'Apprentice',
    slug: 'apprentice',
    type: 'Full-Time',
    location: 'Catskill, NY',
    pay: 'Competitive (experience-based)',
    description: 'Entry-level position with hands-on training in electrical, HVAC, and plumbing trades. Great career starter.',
    overview: [
      'TZ Electric Inc. is looking for a motivated Apprentice eager to learn the electrical trade and gain hands-on experience. You\'ll work alongside experienced electricians on installations, maintenance, repairs, and job site support in a fast-paced environment.',
      'This is the perfect opportunity to start a rewarding career in the trades. No prior experience is required — just a strong work ethic, a willingness to learn, and a positive attitude. We\'ll provide the training and mentorship to help you grow.',
    ],
    responsibilities: [
      'Assist with electrical installations, repairs, and maintenance work',
      'Prepare and organize tools, materials, and equipment for job sites',
      'Support installation of electrical systems and components',
      'Maintain clean, safe work environments',
      'Follow supervisor instructions and apply safety procedures',
      'Communicate professionally with team members and customers',
      'Perform general labor and support tasks as assigned',
    ],
    qualifications: [
      'Interest in pursuing an electrical trade career',
      'Strong work ethic and positive attitude',
      'Willingness to learn and accept direction',
      'Ability to work effectively in team settings',
      'Basic tool and construction knowledge preferred',
      'Physical capability for job duties in various conditions',
      'Reliable transportation and punctuality required',
    ],
    benefits: [
      'Hands-on training from experienced electricians',
      'Health, dental, and vision insurance',
      'Paid time off',
      '401(k) with employer matching',
      'Full uniform and safety gear provided',
      'Clear path to journeyman electrician',
      'Supportive team environment',
    ],
    schedule: [
      'Full-time, hours vary based on project needs',
      'Monday to Friday',
    ],
  },
  {
    title: 'Office Assistant',
    slug: 'office-assistant',
    type: 'Full-Time',
    location: 'Catskill, NY',
    pay: '$20 – $26/hr (experience-based)',
    description: 'Manage front office operations, customer communications, and scheduling. Organized and friendly personality required.',
    overview: [
      'TZ Electric Inc. is seeking an organized, detail-oriented Office Assistant to provide operational support and keep the front office running smoothly. You\'ll be the first point of contact for customers calling in, handling scheduling, communications, and data entry.',
      'This role is ideal for someone who thrives in a fast-paced environment, enjoys working with people, and takes pride in keeping things organized. You\'ll be a key part of the team that keeps TZ Electric running behind the scenes.',
    ],
    responsibilities: [
      'Manage incoming phone calls and email correspondence',
      'Schedule appointments and manage calendars',
      'Perform client intake documentation using standardized scripts',
      'Process orders and maintain organized records',
      'Manage files and office documentation',
      'Work with Google Suite, Microsoft Office, and CRM software',
      'Support the team with general administrative tasks',
    ],
    qualifications: [
      'High school diploma or equivalent (Associate\'s degree preferred)',
      'Prior administrative or office experience',
      'Strong organizational abilities with prioritization skills',
      'Excellent written and verbal communication',
      'Proficiency in Microsoft Office and Google Suite',
      'Friendly, professional phone demeanor',
      'Ability to multitask in a fast-paced environment',
    ],
    benefits: [
      'Health, dental, and vision insurance',
      '401(k) with employer matching',
      'Paid time off',
      'Career advancement opportunities',
      'Supportive team environment',
      'Professional development resources',
      'Performance bonuses',
      'Overtime pay',
    ],
    schedule: [
      'Monday to Friday, full-time',
      'Weekend/overtime during peak periods',
    ],
  },
  {
    title: 'Warehouse Associate',
    slug: 'warehouse-associate',
    type: 'Full-Time',
    location: 'Catskill, NY',
    pay: '$20 – $28/hr (experience-based)',
    description: 'Keep the warehouse organized and our field crews stocked. Receive inventory, stage materials for daily jobs, and manage stock for our electrical, plumbing, and HVAC teams.',
    overview: [
      'TZ Electric Inc. is looking for a dependable, organized Warehouse Associate to run the heart of our operation. Every job our electrical, plumbing, and HVAC crews complete starts with the right materials staged and ready, and that\'s where you come in.',
      'You\'ll receive and organize inventory, pull and stage materials for the next day\'s jobs, load and unload trucks, and keep the warehouse clean and accurate. It\'s a hands-on role for someone who takes pride in order, hustle, and being the person the whole crew counts on.',
    ],
    responsibilities: [
      'Receive, inspect, log, and shelve incoming materials, parts, and equipment',
      'Pull and stage materials for each day\'s scheduled jobs so crews roll out ready',
      'Load and unload trucks and vans, and help techs find what they need quickly',
      'Keep accurate inventory counts using our warehouse management system',
      'Reorder stock and flag low or out-of-stock items before they hold up a job',
      'Maintain a clean, safe, and well-organized warehouse and yard',
      'Coordinate with the office and field teams on parts availability and pickups',
      'Track tools and equipment in and out, and help with basic upkeep',
    ],
    qualifications: [
      'High school diploma or equivalent',
      'Warehouse, inventory, or trade-materials experience preferred (not required)',
      'Organized and detail-oriented with solid data-entry accuracy',
      'Comfortable lifting 50+ pounds and on your feet throughout the day',
      'Basic computer and tablet skills for inventory tracking',
      'Valid driver\'s license with a clean record for occasional local pickups',
      'Reliable, punctual, and a team player',
    ],
    benefits: [
      'Health, dental, and vision insurance',
      '401(k) with employer matching',
      'Paid time off',
      'Full uniform and safety gear provided',
      'On-the-job training and room to grow',
      'Overtime pay opportunities',
      'Supportive, team-oriented environment',
    ],
    schedule: [
      'Monday to Friday, full-time',
      'Occasional overtime during peak seasons',
    ],
  },
]

export function getJobBySlug(slug: string): JobListing | undefined {
  return JOB_LISTINGS.find((job) => job.slug === slug)
}
