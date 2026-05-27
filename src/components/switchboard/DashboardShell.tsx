'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar, { type SidebarUser } from './Sidebar'
import TopBar from './TopBar'
import { ThemeProvider } from './ThemeProvider'
import SwitchboardClairePanel from './SwitchboardClairePanel'

type Props = {
  children: React.ReactNode
  sidebarUser?: SidebarUser | null
}

export default function DashboardShell({ children, sidebarUser }: Props) {
  return (
    <ThemeProvider>
      <ShellContent sidebarUser={sidebarUser}>{children}</ShellContent>
    </ThemeProvider>
  )
}

function ShellContent({
  children,
  sidebarUser,
}: {
  children: React.ReactNode
  sidebarUser?: SidebarUser | null
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        onMobileToggle={() => setMobileOpen((v) => !v)}
        mobileOpen={mobileOpen}
      />
      <div className="flex-1 flex relative">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0A1128]">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar user={sidebarUser ?? null} />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-16 bg-black/50 dark:bg-black/70 z-30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <aside className="md:hidden fixed top-16 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#0A1128] z-40 shadow-2xl flex flex-col">
              <Sidebar user={sidebarUser ?? null} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Persistent right-side Claire (admin chat) — owner + admin only.
          Google sign-in required because KB edits need real attribution. */}
      {sidebarUser?.source === 'google' &&
        (sidebarUser.role === 'owner' || sidebarUser.role === 'admin') && (
          <SwitchboardClairePanel
            actorName={sidebarUser.name}
            actorEmail={sidebarUser.email}
            actorRole={sidebarUser.role}
          />
        )}
    </div>
  )
}
