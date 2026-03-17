import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import { TEAM_MEMBERS } from '@/lib/team-data'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'About TZ Electric Inc | Hudson Valley Trusted Home Service Experts',
  description: `Learn about TZ Electric Inc — over 20 years of plumbing, HVAC, and electrical expertise in the Hudson Valley. ${COMPANY.reviews.count}+ 5-star reviews. Mitsubishi Diamond Elite & Generac Authorized Dealer.`,
  path: '/about-us',
})

const values = [
  {
    title: 'Quality Craftsmanship',
    description: 'Every job is done right the first time. We take pride in our work and stand behind every installation and repair.',
    icon: (
      <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: 'Honest & Transparent',
    description: 'No hidden fees, no surprise charges. We provide upfront pricing and honest recommendations for every project.',
    icon: (
      <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Licensed & Insured',
    description: 'Our team is fully licensed, insured, and certified. You can trust us with your home and family\'s comfort.',
    icon: (
      <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Community Focused',
    description: 'We live and work in the Hudson Valley. This is our community, and we treat every customer like a neighbor.',
    icon: (
      <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
]

const certifications = [
  { name: 'Mitsubishi Diamond Contractor', description: 'Top-tier certification for ductless mini split installation and service', image: '/images/certifications/diamond-contractor.svg', isSvg: true },
  { name: 'Mitsubishi Electric', description: 'Authorized Mitsubishi Electric heating & cooling dealer', image: '/images/certifications/mitsubishi-electric.svg', isSvg: true },
  { name: 'Generac Authorized Dealer', description: 'Factory-trained and authorized for whole-home generator systems', image: '/images/certifications/generac.webp', isSvg: false },
  { name: 'BBB Accredited Business', description: 'Maintaining the highest standards of trust and business ethics', image: '/images/certifications/bbb.webp', isSvg: false },
]

const founder = TEAM_MEMBERS.filter((m) => m.category === 'founder')
const leadership = TEAM_MEMBERS.filter((m) => m.category === 'leadership')
const technicians = TEAM_MEMBERS.filter((m) => m.category === 'technician')
const mascot = TEAM_MEMBERS.filter((m) => m.category === 'mascot')

export default function AboutPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about-us' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-navy overflow-hidden py-16 lg:py-20">
        {/* Background Image */}
        <Image
          src="/images/hero/tz-team-2025.avif"
          alt=""
          fill
          className="object-cover opacity-15"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/80" />

        {/* Electric Cursor Effect */}
        <ElectricCursor />

        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">
              About Us
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Your Trusted Hudson Valley Home Service Experts
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              For over 20 years, TZ Electric has been the name Hudson Valley homeowners
              trust for plumbing, heating, cooling, and electrical services.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue text-sm font-semibold uppercase tracking-wider">
                Our Story
              </span>
              <h2 className="font-heading font-bold text-navy text-3xl mt-2">
                Built on Hard Work, Driven by Excellence
              </h2>
              <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  TZ Electric started with a simple mission: provide honest, high-quality home
                  services to the Hudson Valley community. What began as a small electrical
                  contracting business has grown into a full-service home comfort company
                  offering plumbing, HVAC, generators, and more.
                </p>
                <p>
                  Today, with {COMPANY.reviews.count}+ five-star Google reviews and a team of
                  skilled technicians, we&apos;re proud to be one of the most trusted names in
                  the region. We serve homeowners across {COMPANY.counties.join(', ')} counties.
                </p>
                <p>
                  Our growth has always been driven by word of mouth — neighbors recommending us
                  to neighbors. That trust is something we never take for granted.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href={TYPEFORM_URL} external>
                  Get a Free Quote
                </Button>
                <Button href={`tel:${COMPANY.phoneRaw}`} variant="secondary">
                  Call {COMPANY.phone}
                </Button>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
              <Image
                src="/images/hero/tz-team-2025.avif"
                alt="The TZ Electric team — Hudson Valley's trusted home service professionals"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <SectionHeader
            label="Our Values"
            title="What Sets Us Apart"
            description="We're not just another contractor. We're your neighbors, committed to delivering exceptional service every time."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-blue/10 rounded-xl flex items-center justify-center mx-auto">
                  {value.icon}
                </div>
                <h3 className="font-heading font-bold text-navy text-lg mt-4">
                  {value.title}
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="section-padding">
        <div className="container-site">
          <SectionHeader
            label="Meet Our Team"
            title="The People Behind the Work"
            description="Our team of skilled professionals is dedicated to delivering exceptional service to every Hudson Valley homeowner."
          />

          {/* Founder — Featured Card */}
          {founder.map((member) => (
            <div
              key={member.name}
              className="mb-12 bg-navy rounded-2xl overflow-hidden grid md:grid-cols-2 gap-0"
            >
              <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[400px]">
                <Image
                  src={member.photo}
                  alt={`${member.name} — ${member.role}`}
                  fill
                  className="object-cover object-[center_30%]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">
                  Founder
                </span>
                <h3 className="font-heading font-bold text-white text-3xl mt-2">
                  {member.name}
                </h3>
                <p className="text-blue-light font-medium text-lg mt-1">
                  {member.role}
                </p>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}

          {/* Leadership / Management */}
          <div className="mb-8">
            <h3 className="font-heading font-bold text-navy text-xl mb-6">
              Leadership &amp; Management
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {leadership.map((member) => (
                <div
                  key={member.name}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={member.photo}
                      alt={`${member.name} — ${member.role}`}
                      fill
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-heading font-bold text-navy">
                      {member.name}
                    </h4>
                    <p className="text-blue text-sm font-medium">
                      {member.role}
                    </p>
                    <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technicians */}
          <div className="mb-8">
            <h3 className="font-heading font-bold text-navy text-xl mb-6">
              Our Technicians
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {technicians.map((member) => (
                <div
                  key={member.name}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={member.photo}
                      alt={`${member.name} — ${member.role}`}
                      fill
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    {/* Bio overlay on hover */}
                    <div className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <p className="text-white text-xs leading-relaxed text-center">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="font-heading font-bold text-navy text-sm">
                      {member.name}
                    </h4>
                    <p className="text-blue text-xs font-medium">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mascot — Fun Element */}
          {mascot.map((member) => (
            <div
              key={member.name}
              className="mt-4 bg-blue/5 border border-blue/20 rounded-2xl overflow-hidden flex flex-col sm:flex-row items-center gap-6 p-6"
            >
              <div className="relative w-32 h-32 shrink-0 rounded-full overflow-hidden ring-4 ring-blue/20">
                <Image
                  src={member.photo}
                  alt={`${member.name} — ${member.role}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-heading font-bold text-navy text-lg">
                  {member.name}
                </h4>
                <p className="text-blue font-medium text-sm">
                  {member.role}
                </p>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed max-w-md">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <SectionHeader
            label="Certifications"
            title="Certified & Recognized"
            description="Our certifications mean you're getting factory-trained expertise and the highest industry standards."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <div key={cert.name} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="w-28 h-28 relative mx-auto flex items-center justify-center">
                  <Image
                    src={cert.image}
                    alt={cert.name}
                    fill
                    className={`object-contain ${cert.isSvg ? '' : ''}`}
                    sizes="112px"
                  />
                </div>
                <h3 className="font-heading font-bold text-navy text-sm mt-4">
                  {cert.name}
                </h3>
                <p className="mt-2 text-gray-500 text-xs leading-relaxed">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
              <Image
                src="/images/misc/service-area-map.avif"
                alt="TZ Electric service area map covering the Hudson Valley region"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <span className="text-blue text-sm font-semibold uppercase tracking-wider">
                Service Area
              </span>
              <h2 className="font-heading font-bold text-navy text-3xl mt-2">
                Serving the Entire Hudson Valley
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                From Catskill to Rhinebeck, Hudson to Woodstock — we proudly serve homeowners
                across the Hudson Valley region.
              </p>
              <div className="mt-6">
                <h3 className="font-semibold text-navy text-sm uppercase tracking-wider mb-3">
                  Counties We Serve
                </h3>
                <div className="flex flex-wrap gap-2">
                  {COMPANY.counties.map((county) => (
                    <span key={county} className="bg-blue/10 text-blue text-sm font-medium px-3 py-1 rounded-full">
                      {county} County
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold text-navy text-sm uppercase tracking-wider mb-3">
                  Key Locations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {COMPANY.locations.map((location) => (
                    <span key={location} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      {location}, NY
                    </span>
                  ))}
                </div>
              </div>
              <Button href="/service-areas" variant="secondary" className="mt-6">
                View All Service Areas
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
