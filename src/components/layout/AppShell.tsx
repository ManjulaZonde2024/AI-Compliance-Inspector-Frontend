import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppShell() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [location.pathname])

  return (
    <div className="flex min-h-svh flex-col bg-bg text-ink transition-colors duration-200">
      <Navbar />
      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
