// ============================================
// TZ ELECTRIC INC - TEAM DATA
// ============================================

export type TeamCategory = 'founder' | 'leadership' | 'technician' | 'mascot'

export interface TeamMember {
  name: string
  role: string
  photo: string
  bio: string
  category: TeamCategory
}

export const TEAM_MEMBERS: TeamMember[] = [
  // Founder
  {
    name: 'Tyler Zitz',
    role: 'Founder & CEO',
    photo: '/images/team/tyler-zitz.webp',
    bio: 'Tyler founded TZ Electric with a vision to bring honest, high-quality home services to the Hudson Valley. With over 12 years in the trade, he leads the team with hands-on expertise and an unwavering commitment to customer satisfaction.',
    category: 'founder',
  },

  // Leadership / Management
  {
    name: 'Nick Neville',
    role: 'Operations Manager',
    photo: '/images/team/nick-neville.webp',
    bio: 'Nick keeps the day-to-day running smoothly, coordinating schedules and ensuring every job meets TZ Electric\'s high standards.',
    category: 'leadership',
  },
  {
    name: 'Jimmy Neville',
    role: 'Service Manager',
    photo: '/images/team/jimmy-neville.webp',
    bio: 'Jimmy oversees service operations and quality control, making sure every customer receives top-tier workmanship.',
    category: 'leadership',
  },
  {
    name: 'Molly Slater',
    role: 'Office Manager',
    photo: '/images/team/molly-slater.jpg',
    bio: 'Molly is the friendly voice you hear when you call. She manages scheduling, customer communications, and keeps the office running like clockwork.',
    category: 'leadership',
  },
  {
    name: 'Summer Giovene',
    role: 'Customer Relations',
    photo: '/images/team/summer-giovene.jpeg',
    bio: 'Summer ensures every customer has an outstanding experience from first call to job completion.',
    category: 'leadership',
  },

  // Technicians
  {
    name: 'Pat Spencer',
    role: 'Lead Technician',
    photo: '/images/team/pat-spencer.webp',
    bio: 'Pat brings years of hands-on experience in HVAC and electrical systems, mentoring the team with his deep technical knowledge.',
    category: 'technician',
  },
  {
    name: 'Terry Evanson',
    role: 'Senior Technician',
    photo: '/images/team/terry-evanson.webp',
    bio: 'Terry specializes in complex installations and troubleshooting, with a reputation for getting it right the first time.',
    category: 'leadership',
  },
  {
    name: 'Ian Foster',
    role: 'HVAC Technician',
    photo: '/images/team/ian-foster.webp',
    bio: 'Ian is a certified HVAC specialist with expertise in mini split systems and whole-home comfort solutions.',
    category: 'technician',
  },
  {
    name: 'Devin Green',
    role: 'Electrician',
    photo: '/images/team/devin-green.webp',
    bio: 'Devin handles residential and commercial electrical work with precision and attention to safety.',
    category: 'technician',
  },
  {
    name: 'Ty Stein',
    role: 'Technician',
    photo: '/images/team/ty-stein.webp',
    bio: 'Ty is a versatile technician skilled across plumbing, electrical, and HVAC disciplines.',
    category: 'technician',
  },
  {
    name: 'Sam Tigges',
    role: 'Technician',
    photo: '/images/team/sam-tigges.webp',
    bio: 'Sam tackles every job with enthusiasm and a commitment to clean, quality work.',
    category: 'technician',
  },
  {
    name: 'Angus Guip',
    role: 'Technician',
    photo: '/images/team/angus-guip.webp',
    bio: 'Angus brings a strong work ethic and keen problem-solving skills to every service call.',
    category: 'technician',
  },
  {
    name: 'Tyler Plauger',
    role: 'Technician',
    photo: '/images/team/tyler-plauger.png',
    bio: 'Tyler P. is dedicated to delivering reliable results and excellent customer service on every project.',
    category: 'technician',
  },
  {
    name: 'Averie Handschuh',
    role: 'Technician',
    photo: '/images/team/averie-handschuh.webp',
    bio: 'Averie brings fresh energy and technical skill to the team, specializing in residential service work.',
    category: 'technician',
  },
  {
    name: 'Timothy Wing',
    role: 'Technician',
    photo: '/images/team/timothy-wing.png',
    bio: 'Timothy is a detail-oriented technician who takes pride in thorough, high-quality installations.',
    category: 'technician',
  },
  {
    name: 'Christopher Weiner',
    role: 'Technician',
    photo: '/images/team/christopher-weiner.jpg',
    bio: 'Christopher brings dependability and strong technical skills to every job he takes on.',
    category: 'technician',
  },
  {
    name: 'Jonathan Vanderwerken',
    role: 'Technician',
    photo: '/images/team/jonathan-vanderwerken.jpg',
    bio: 'Jonathan is known for his thorough approach and commitment to getting every detail right.',
    category: 'technician',
  },
  {
    name: 'Damien Beecroft',
    role: 'Technician',
    photo: '/images/team/damien-beecroft.jpg',
    bio: 'Damien is a hard-working technician who delivers consistent, quality results for every customer.',
    category: 'technician',
  },

  // Mascot
  {
    name: 'Layla',
    role: 'Chief Morale Officer',
    photo: '/images/team/layla-dog.webp',
    bio: 'Layla keeps the team\'s spirits high and greets every visitor with a wagging tail. She takes her role as office morale booster very seriously.',
    category: 'mascot',
  },
]
