import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Knowledge Base',
}

export default function Page() {
  return <ModuleInfoPage slug="knowledge-base" />
}
