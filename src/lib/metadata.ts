import type { Metadata } from 'next'
import { COMPANY } from './constants'

const BASE_URL = 'https://tzelectricinc.com'

export function createMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const url = `${BASE_URL}${path}`
  const ogImage = image || `${BASE_URL}/images/og-default.jpg`

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: COMPANY.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

// LocalBusiness JSON-LD Schema
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#organization`,
    name: COMPANY.name,
    image: `${BASE_URL}/images/tz-electric-team.jpg`,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    url: BASE_URL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.state,
      postalCode: COMPANY.address.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 42.2168,
      longitude: -73.8632,
    },
    areaServed: COMPANY.counties.map((county) => ({
      '@type': 'AdministrativeArea',
      name: `${county} County, NY`,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: COMPANY.reviews.rating,
      reviewCount: COMPANY.reviews.count,
      bestRating: 5,
    },
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '14:00',
      },
    ],
    sameAs: [
      COMPANY.social.facebook,
      COMPANY.social.instagram,
      COMPANY.social.google,
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Home Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Electrical Services' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'HVAC Services' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mini Split Installation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Generator Installation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Plumbing Services' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hot Water Heater Services' } },
      ],
    },
  }
}

// BreadcrumbList JSON-LD Schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }
}

// FAQ JSON-LD Schema
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
