import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import compliLogo from '../../assets/compli-logo.png'
import { primaryNav } from '../../types/navigation'
import { cn } from '../../utils/cn'
import { ThemeToggle } from '../ui/ThemeToggle'

/**
 * Consistent outline icons for the primary routes — 16px, 1.5 stroke,
 * currentColor, matched to the nav text baseline.
 */
const navIcons: Record<string, ReactNode> = {
  '/dashboard': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="2.25" y="2.25" width="4.75" height="4.75" rx="1.2" />
      <rect x="9" y="2.25" width="4.75" height="4.75" rx="1.2" />
      <rect x="2.25" y="9" width="4.75" height="4.75" rx="1.2" />
      <rect x="9" y="9" width="4.75" height="4.75" rx="1.2" />
    </svg>
  ),
  '/inspections/new': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2.2" />
      <path d="M8 5.5v5M5.5 8h5" />
    </svg>
  ),
  '/history': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="5.6" />
      <path d="M8 4.9V8l2.2 1.3" />
    </svg>
  ),
  '/settings': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2.5 4.6h11M2.5 8h11M2.5 11.4h11" />
      <circle cx="5.8" cy="4.6" r="1.7" fill="var(--color-surface)" />
      <circle cx="10.4" cy="8" r="1.7" fill="var(--color-surface)" />
      <circle cx="5" cy="11.4" r="1.7" fill="var(--color-surface)" />
    </svg>
  ),
}

/**
 * Route labels and paths live in `primaryNav` — this only fixes the display
 * casing shown inside the bar so the nav reads exactly as specified.
 */
const displayLabels: Record<string, string> = {
  '/inspections/new': 'New Inspection',
}

/**
 * Shared top navigation: logo (left), primary routes (center),
 * theme toggle (right). The old inspection-level Scan/Result/Report
 * sub-navigation has been removed from the application entirely.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 shadow-sm backdrop-blur-md transition-colors duration-200">
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/45 to-transparent" aria-hidden />
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          aria-label="Compli — go to the dashboard"
          className="-my-1 shrink-0 rounded-lg py-1 transition-transform duration-150 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <img
            src={compliLogo}
            alt="Compli"
            className="block h-8 w-auto max-w-[170px] object-contain sm:h-9"
            width={112}
            height={32}
          />
        </Link>

        <nav aria-label="Primary" className="min-w-0 flex-1">
          <ul className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1 sm:mx-0 sm:justify-center sm:overflow-visible sm:px-0">
            {primaryNav.map((item) => (
              <li key={item.to} className="shrink-0">
                <NavLink
                  to={item.to}
                  end={item.match === 'exact'}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium tracking-[-0.004em] transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-3',
                      isActive ? 'text-ink bg-brand-light/70 shadow-sm' : 'text-muted hover:bg-surface-soft hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={cn('shrink-0 transition-colors duration-150', isActive ? 'text-brand' : 'text-muted')} aria-hidden>
                        {navIcons[item.to]}
                      </span>
                      {displayLabels[item.to] ?? item.label}
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-x-2.5 bottom-1 h-0.5 origin-left rounded-full bg-gradient-to-r from-brand to-accent transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none sm:inset-x-3',
                          isActive ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
