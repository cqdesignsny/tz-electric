import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  renderMarkdown,
  formatPostDate,
} from '@/lib/blog'

const BASE_URL = 'https://tzelectricinc.com'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    ...createMetadata({
      title: `${post.title} | TZ Electric Inc`,
      description: post.description,
      path: `/blog/${slug}`,
      image: `${BASE_URL}${post.heroImage}`,
    }),
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${BASE_URL}/blog/${slug}`,
      siteName: COMPANY.name,
      locale: 'en_US',
      type: 'article',
      publishedTime: post.date,
      images: [{ url: `${BASE_URL}${post.heroImage}`, width: 1200, height: 630, alt: post.title }],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const html = await renderMarkdown(post.content)
  const related = getRelatedPosts(slug, 3)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${BASE_URL}${post.heroImage}`,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: COMPANY.name, url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: COMPANY.name,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/logo/tz-logo-main.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${post.slug}` },
    articleSection: post.category,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article>
        {/* Header */}
        <header className="bg-navy pt-10 pb-12 lg:pt-12 lg:pb-16">
          <div className="container-site max-w-3xl">
            <nav className="flex items-center gap-2 text-sm text-gray-400" aria-label="Breadcrumb">
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-gray-300">{post.category}</span>
            </nav>
            <h1 className="mt-4 text-white text-3xl lg:text-4xl font-heading font-bold leading-tight">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300">
              <span className="bg-blue/20 text-blue-light font-semibold px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span>{formatPostDate(post.date)}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readingTimeMinutes} min read</span>
              <span aria-hidden="true">&middot;</span>
              <span>By {post.author}</span>
            </div>
          </div>
        </header>

        {/* Hero image */}
        <div className="container-site max-w-4xl -mt-8 lg:-mt-10 relative z-10">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
        </div>

        {/* Body */}
        <div className="section-padding pt-10 lg:pt-12">
          <div className="container-site max-w-3xl">
            <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />

            {/* Inline CTA */}
            <div className="mt-12 bg-blue/5 border border-blue/20 rounded-2xl p-7 lg:p-8">
              <h2 className="font-heading font-bold text-navy text-xl">
                Need a hand from a licensed pro?
              </h2>
              <p className="mt-2 text-gray-600 leading-relaxed">
                TZ Electric serves homeowners across the Hudson Valley with electrical, HVAC,
                mini split, and generator work. Get a free estimate or talk it through with our team.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/quote"
                  className="inline-flex items-center px-6 py-3 bg-blue text-white font-heading font-semibold rounded-full hover:bg-blue-dark transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  Get a Free Quote
                </Link>
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-navy/15 text-navy font-heading font-semibold rounded-full hover:bg-navy hover:text-white transition-all duration-300"
                >
                  Call {COMPANY.phone}
                </a>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-blue font-heading font-semibold hover:gap-3 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to all articles
              </Link>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="section-padding bg-gray-50">
            <div className="container-site">
              <h2 className="font-heading font-bold text-navy text-2xl mb-8 text-center">
                More from the blog
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue/40 hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={rp.heroImage}
                        alt={rp.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-xs font-semibold text-blue">{rp.category}</span>
                      <h3 className="mt-1 font-heading font-bold text-navy leading-snug group-hover:text-blue transition-colors line-clamp-2">
                        {rp.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  )
}
