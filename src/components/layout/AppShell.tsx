import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inspections/new': 'New inspection',
  '/history': 'History',
  '/settings': 'Settings',
}

function titleFromPath(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.includes('/scan')) return 'Scan'
  if (pathname.includes('/result')) return 'Result'
  if (pathname.includes('/evidence')) return 'Evidence'
  if (pathname.includes('/report')) return 'Report'
  return 'AI Compliance Inspector'
}

export function AppShell() {
  const location = useLocation()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [location.pathname])

  return (
    <div className="flex min-h-svh bg-bg">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-svh">
          <Sidebar />
        </div>
      </aside>

      {!isDesktop && mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy/40"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-64 max-w-[85vw] shadow-md">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={titleFromPath(location.pathname)}
          showMenuButton={!isDesktop}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
