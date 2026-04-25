import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Employee Training',
}

export default function Page() {
  return <ModuleInfoPage slug="employee-training" />
}
