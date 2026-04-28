import DashboardShell from '@/components/switchboard/DashboardShell'
import { themeInitScript } from '@/components/switchboard/ThemeProvider'
import { getCurrentUser } from '@/lib/current-user'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cu = await getCurrentUser()
  const sidebarUser = cu
    ? {
        email: cu.email,
        role: cu.role,
        name: cu.user?.name || null,
        pictureUrl: cu.user?.picture_url || null,
        source: cu.source,
      }
    : null

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <DashboardShell sidebarUser={sidebarUser}>{children}</DashboardShell>
    </>
  )
}
