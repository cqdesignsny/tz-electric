import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Call Logs — TZ Switchboard',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ModuleInfoPage slug="call-logs" />
}
