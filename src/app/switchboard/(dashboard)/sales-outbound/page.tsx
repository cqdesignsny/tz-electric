import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Sales & Outbound',
}

export default function Page() {
  return <ModuleInfoPage slug="sales-outbound" />
}
