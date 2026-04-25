import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Reports — TZ Switchboard',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ModuleInfoPage slug="reports" />
}
