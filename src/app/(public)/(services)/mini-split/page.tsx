import { redirect } from 'next/navigation'
import { getServiceBySlug } from '@/lib/services-data'
import { createMetadata } from '@/lib/metadata'

const service = getServiceBySlug('mini-split')!

export const metadata = createMetadata({
  title: service.metaTitle,
  description: service.metaDescription,
  path: `/${service.slug}`,
})

export default function MiniSplitPage() {
  redirect('/mitsubishi')
}
