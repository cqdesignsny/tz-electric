import { notFound } from 'next/navigation'
import { getSubServicePage, getSubServicesByParent } from '@/lib/sub-services-data'
import { createMetadata } from '@/lib/metadata'
import SubServicePageTemplate from '@/components/sections/SubServicePageTemplate'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getSubServicesByParent('mitsubishi').map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const service = getSubServicePage('mitsubishi', slug)
  if (!service) return {}
  return createMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/mitsubishi/${slug}`,
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const service = getSubServicePage('mitsubishi', slug)
  if (!service) notFound()
  return <SubServicePageTemplate service={service} />
}
