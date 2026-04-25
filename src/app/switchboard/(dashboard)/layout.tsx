import DashboardShell from '@/components/switchboard/DashboardShell'
import { themeInitScript } from '@/components/switchboard/ThemeProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <DashboardShell>{children}</DashboardShell>
    </>
  )
}
