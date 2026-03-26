import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Careers at TZ Electric Inc | Join Our Growing Team',
  description: 'Join the TZ Electric team! We are hiring skilled electricians, HVAC technicians, plumbers, and support staff in the Hudson Valley. Competitive pay, benefits, and growth opportunities.',
  path: '/careers',
})

const openings = [
  {
    title: 'Lead Electrician',
    slug: 'lead-electrician',
    type: 'Full-Time',
    description: 'Experienced electrician to lead residential projects including panel upgrades, rewiring, and EV charger installations.',
  },
  {
    title: 'HVAC Project Manager',
    slug: 'hvac-project-manager',
    type: 'Full-Time',
    description: 'Manage and execute HVAC installation projects from start to finish. Experience with Mitsubishi systems a plus.',
  },
  {
    title: 'HVAC Installer',
    slug: 'hvac-installer',
    type: 'Full-Time',
    description: 'Install and service HVAC systems including ductless mini splits, furnaces, and air conditioners.',
  },
  {
    title: 'Estimator',
    slug: 'estimator',
    type: 'Full-Time',
    description: 'Prepare accurate estimates and build relationships with customers. Technical knowledge and customer-facing experience required.',
  },
  {
    title: 'Apprentice',
    slug: 'apprentice',
    type: 'Full-Time',
    description: 'Entry-level position with hands-on training in electrical, HVAC, and plumbing trades. Great career starter.',
  },
  {
    title: 'Office Assistant',
    slug: 'office-assistant',
    type: 'Full-Time',
    description: 'Manage front office operations, customer communications, and scheduling. Organized and friendly personality required.',
  },
]

const benefits = [
  'Competitive Pay',
  'Health Insurance',
  'Paid Time Off',
  'On-the-Job Training',
  'Growth Opportunities',
  'Supportive Team Culture',
  'Modern Tools & Equipment',
  'Year-Round Work',
]

export default function CareersPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Careers', url: '/careers' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-navy py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)',
          }} />
        </div>
        <ElectricCursor />
        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">
              Join Our Team
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Build Your Career with TZ Electric, Plumbing, Heating &amp; Cooling
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              We&apos;re growing and looking for talented people to join our team.
              Work with the Hudson Valley&apos;s most trusted home service company.
            </p>
          </div>
        </div>
      </section>

      {/* Why Work Here */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue text-sm font-semibold uppercase tracking-wider">
                Why TZ Electric?
              </span>
              <h2 className="font-heading font-bold text-navy text-3xl mt-2">
                More Than Just a Job
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                At TZ Electric, you&apos;re joining a family. We invest in our team members
                with training, competitive compensation, and real opportunities for growth.
                Whether you&apos;re a seasoned pro or just starting out, there&apos;s a place for you here.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-200 rounded-xl aspect-[4/3] flex items-center justify-center">
              <span className="text-gray-400 text-sm">Team Photo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue text-sm font-semibold uppercase tracking-wider">
              Open Positions
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl mt-2">
              Current Job Openings
            </h2>
            <p className="mt-3 text-gray-600">
              Find the right role for you. All positions are based in {COMPANY.address.city}, NY.
            </p>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {openings.map((job) => (
              <Card key={job.slug} href={`/${job.slug}`} className="group">
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-bold text-navy group-hover:text-blue transition-colors">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-gray-600 text-sm">{job.description}</p>
                    <span className="inline-block mt-2 bg-blue/10 text-blue text-xs font-medium px-2 py-0.5 rounded-full">
                      {job.type}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Don&apos;t see the right fit? We&apos;re always looking for great people.
            </p>
            <Button href={`mailto:${COMPANY.email}?subject=Career Inquiry`} variant="secondary" className="mt-4">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
