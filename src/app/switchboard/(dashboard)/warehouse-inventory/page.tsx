import type { Metadata } from 'next'
import ModuleInfoPage from '@/components/switchboard/ModuleInfoPage'

export const metadata: Metadata = {
  title: 'Warehouse & Inventory',
}

export default function Page() {
  return <ModuleInfoPage slug="warehouse-inventory" />
}
