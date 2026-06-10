import Image from 'next/image'
import Link from 'next/link'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import { getAllPosts, formatPostDate } from '@/lib/blog'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Blog | Expert HVAC & Electrical Tips | TZ Electric Inc',
  description:
    "Expert HVAC and electrical tips from TZ Electric Inc. Mini split maintenance, generator care, energy efficiency, and electrical safety for Hudson Valley homeowners.",
  path: '/blog',
})

export default function BlogIndexPage() {
  const posts = getAllPosts()
  const [featured, ...rest] = posts

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
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
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)',
            }}
          />
        </div>
        <ElectricCursor />
        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">
              TZ Electric Blog
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Expert Tips &amp; Insights
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              Practical advice on HVAC, mini splits, generators, and electrical safety from the
              Hudson Valley&apos;s trusted Mitsubishi Diamond Elite contractor.
            </p>
          </div>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="section-padding">
          <div className="container-site text-center text-gray-600">
            New articles are on the way. Check back soon.
          </div>
        </section>
      ) : (
        <section className="section-padding">
          <div className="container-site">
            {/* Featured (most recent) */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block mb-12 rounded-2xl overflow-hidden border-2 border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-blue/40"
              >
                <div className="grid lg:grid-cols-2">
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
                    <Image
                      src={featured.heroImage}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="bg-blue/10 text-blue font-semibold px-3 py-1 rounded-full">
                        {featured.category}
                      </span>
                      <span className="text-gray-500">{formatPostDate(featured.date)}</span>
                    </div>
                    <h2 className="mt-4 font-heading font-bold text-navy text-2xl lg:text-3xl leading-snug group-hover:text-blue transition-colors">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-gray-600 leading-relaxed line-clamp-3">
                      {featured.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-blue font-heading font-semibold">
                      Read article
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of the rest */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue/40 hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={post.heroImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 text-navy text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatPostDate(post.date)}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{post.readingTimeMinutes} min read</span>
                    </div>
                    <h3 className="mt-2 font-heading font-bold text-navy text-lg leading-snug group-hover:text-blue transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                      {post.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-blue text-sm font-heading font-semibold">
                      Read more
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding bg-navy">
        <div className="container-site text-center">
          <h2 className="font-heading font-bold text-white text-3xl">
            Have a project in mind?
          </h2>
          <p className="mt-3 text-gray-300 max-w-xl mx-auto">
            Whether it&apos;s a mini split, a panel upgrade, or a backup generator, our team is
            ready to help. Get a free estimate today.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center px-7 py-3.5 bg-blue text-white font-heading font-semibold rounded-full hover:bg-blue-dark transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02]"
            >
              Get a Free Quote
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center px-7 py-3.5 border-2 border-white/30 text-white font-heading font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
