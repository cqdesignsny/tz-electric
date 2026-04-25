import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Email Assistant',
}

export default function Page() {
  return <ModuleInfoPage slug="email-assistant" />
}
