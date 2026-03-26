// ============================================
// TZ ELECTRIC INC - TEAM DATA
// ============================================

export type TeamCategory = 'founder' | 'leadership' | 'support' | 'technician' | 'mascot'

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
    role: 'Founder & Owner',
    photo: '/images/team/tyler-zitz.webp',
    bio: 'Tyler Zitz, founder of TZ Electric, brings over 15 years of experience and a proud family legacy of electrical excellence. Inspired by his grandfather\'s career as a distinguished electrical contractor, Tyler launched his own journey in 2006, committed to upholding the values of quality workmanship and client satisfaction. At TZ Electric, he fosters a culture of growth and opportunity while delivering top-tier solutions. Outside of work, Tyler enjoys riding his Ducati motorcycle, fishing, and spending time with his wife Barbara and their young son Grayson, who already shares his passion for hands-on craftsmanship.',
    category: 'founder',
  },

  // Leadership / Management
  {
    name: 'Sam Tigges',
    role: 'Project Manager',
    photo: '/images/team/sam-tigges.webp',
    bio: 'Do you know anything about kinesiology? We don\'t either, but our Project Manager does! With a degree in kinesiology from the University of Maryland and several certificates, Sam is well adept at leading our crews.',
    category: 'leadership',
  },
  {
    name: 'Ty Stein',
    role: 'Project Manager',
    photo: '/images/team/ty-stein.webp',
    bio: 'Introducing our Project Manager, Ty Stein. He is an avid fisherman, which we think is ironic because he fell into the stingray tank at SeaWorld as a child! Ty is easygoing, with the ability to talk to anyone about anything. Just don\'t let him tell you any fish tales!',
    category: 'leadership',
  },
  {
    name: 'Terry Evanson',
    role: 'Executive Assistant',
    photo: '/images/team/terry-evanson.webp',
    bio: 'Meet our lead drummer… I mean Executive Assistant! When she isn\'t managing the office, Terry enjoys playing drums in a local band, gardening, and hiking. Luckily for us, she is also a very good baker! Birthday celebrations have never tasted so good.',
    category: 'leadership',
  },
  // Support Staff
  {
    name: 'Molly Slater',
    role: 'Office Support',
    photo: '/images/team/molly-slater.jpg',
    bio: 'Meet Molly! Compassionate and always ready to lend a helping hand, she puts care into everything she does. When she\'s not busy supporting those around her, you can find her sewing something new for her wardrobe or planning a quilt design. She also has a collection of fish-shaped purses that she\'s hoping to expand!',
    category: 'support',
  },
  {
    name: 'Averie Handschuh',
    role: 'Customer Service',
    photo: '/images/team/averie-handschuh.webp',
    bio: 'When you are calling for a service provider, you want someone friendly and highly effective. That\'s Averie! Did you know that when she was little, she dreamt of being friends with Godzilla? Imagine the size of that friendship bracelet.',
    category: 'support',
  },

  // Technicians
  {
    name: 'Summer Giovene',
    role: 'Apprentice',
    photo: '/images/team/summer-giovene.jpeg',
    bio: 'Meet Summer! She loves hiking and crocheting. Fun fact — she has dyed her hair every color of the rainbow! Her bright personality (and even brighter hair) makes a cheerful addition to the team.',
    category: 'technician',
  },
  {
    name: 'Nick Neville',
    role: 'Electrician',
    photo: '/images/team/nick-neville.webp',
    bio: 'When Nick was young, he wanted to be an electrician or a plumber. Mission accomplished! Nick used to have a gourmet mushroom farm! Now that\'s a fun fact about a fun-guy. (Get it?)',
    category: 'technician',
  },
  {
    name: 'Jimmy Neville',
    role: 'Electrician',
    photo: '/images/team/jimmy-neville.webp',
    bio: 'Meet Jimmy! His hidden talent is unicycling. Unfortunately, he couldn\'t fit all his tools on the unicycle, so he\'ll be rolling up to your job site in one of our trucks. When Jimmy was little, he wanted to be an astronaut. We are lucky he chose to be an electrician instead. Sorry, NASA!',
    category: 'technician',
  },
  {
    name: 'Pat Spencer',
    role: 'Electrical Technician',
    photo: '/images/team/pat-spencer.webp',
    bio: 'Pat has been an electrical technician for 4 years. In his free time, Pat enjoys camping, fishing, and going out with friends. A fun fact about Pat is that he loves cars and trucks. His passion for both his work and his hobbies makes him a great addition to our team.',
    category: 'technician',
  },
  {
    name: 'Ian Foster',
    role: 'Electrician',
    photo: '/images/team/ian-foster.webp',
    bio: 'Meet Ian — when he isn\'t at work, you can often find him clearing his head at the gym. He\'s also an avid fisherman. Fun fact: Ian loves building Lego sets (and we love a guy who can follow the instruction books)!',
    category: 'technician',
  },
  {
    name: 'Devin Green',
    role: 'Electrician',
    photo: '/images/team/devin-green.webp',
    bio: 'Devin\'s superpower is making outdated pop culture references nobody understands. We love that! In his free time, he enjoys watching movies, playing guitar, and singing. When he was a kid, he wanted to be a scientist and work in robotics research and development. Fun fact: Devin never learned to swim.',
    category: 'technician',
  },
  {
    name: 'Angus Guip',
    role: 'Electrician',
    photo: '/images/team/angus-guip.webp',
    bio: 'Meet Angus! His first job was working as a drum tech for his father\'s band, Hot Tuna. Angus is really good at making people laugh. When he\'s not working, you might find him at a rock concert, skiing, or riding his motorcycle.',
    category: 'technician',
  },
  {
    name: 'Tyler Plauger',
    role: 'Electrician',
    photo: '/images/team/tyler-plauger.png',
    bio: 'Meet (the OTHER) Tyler! We have a couple Tylers on the team right now, but you\'ll be able to identify this one by his sarcasm. Fun fact — this one has no feeling in his fingertips! It\'s a gruesome story but feel free to ask him all about it if you catch him on a job site.',
    category: 'technician',
  },
  {
    name: 'Timothy Wing',
    role: 'Electrician',
    photo: '/images/team/timothy-wing.png',
    bio: 'This is Tim, also known as Mr. Cool, Calm and Collected. Tim is a really chill guy, unless you catch him nerding out over muscle cars. He\'s also an avid hiker and absolutely crazy about dogs. Tim is yet another team member who rides motorcycles! Too bad we can\'t fit tools on the back of a bike.',
    category: 'technician',
  },
  {
    name: 'Jonathan Vanderwerken',
    role: 'Electrician',
    photo: '/images/team/jonathan-vanderwerken.jpg',
    bio: 'Meet Jonathan, a man with plenty of miles behind the wheel who, after more than 25 years of driving, has somehow still managed to avoid mastering one skill: driving a stick. In his downtime, he enjoys golfing, camping, and listening to techno music. He has watched every episode of Law & Order and is pretty sure he could pass the Bar tomorrow with no prep or law school required (according to him, at least!).',
    category: 'technician',
  },
  {
    name: 'Christopher Weiner',
    role: 'Team Member',
    photo: '/images/team/christopher-weiner.jpg',
    bio: 'Every team needs someone with a dream superpower, and Christopher\'s happens to be teleportation. If instant travel were possible, he\'d probably use it to squeeze in even more rounds of golf. His fiancée thinks he already has a superpower — the ability to fall asleep just about anywhere.',
    category: 'technician',
  },

  // Mascot
  {
    name: 'Layla',
    role: 'Chief Morale Officer',
    photo: '/images/team/layla-dog.webp',
    bio: 'Our Chief Morale Officer doesn\'t make home visits, but you are welcome to meet her if you stop by our office. Layla might not be very good at answering the phones, but she sure keeps a smile on our faces throughout the day.',
    category: 'mascot',
  },
]
