import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Web Chat',
}

export default function Page() {
  return <ModuleInfoPage slug="web-chat" />
}
