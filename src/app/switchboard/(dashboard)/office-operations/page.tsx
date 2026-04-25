import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Office Operations',
}

export default function Page() {
  return <ModuleInfoPage slug="office-operations" />
}
