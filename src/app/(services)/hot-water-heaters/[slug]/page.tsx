import { notFound } from 'next/navigation'
import { getSubServicePage, getSubServicesByParent } from '@/lib/sub-services-data'
import { createMetadata } from '@/lib/metadata'
import ServicePageTemplate from '@/components/sections/ServicePageTemplate'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getSubServicesByParent('hot-water-heaters').map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const service = getSubServicePage('hot-water-heaters', slug)
  if (!service) return {}
  return createMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/hot-water-heaters/${slug}`,
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const service = getSubServicePage('hot-water-heaters', slug)
  if (!service) notFound()
  return (
    <ServicePageTemplate
      service={service}
      parentService={{ slug: 'hot-water-heaters', title: 'Hot Water Heater Services' }}
    />
  )
}
