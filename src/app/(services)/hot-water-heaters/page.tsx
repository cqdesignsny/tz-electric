import { notFound } from 'next/navigation'
import { getServiceBySlug } from '@/lib/services-data'
import { createMetadata } from '@/lib/metadata'
import ServicePageTemplate from '@/components/sections/ServicePageTemplate'

const service = getServiceBySlug('hot-water-heaters')!

export const metadata = createMetadata({
  title: service.metaTitle,
  description: service.metaDescription,
  path: `/${service.slug}`,
})

export default function HotWaterHeatersPage() {
  if (!service) notFound()
  return <ServicePageTemplate service={service} />
}
