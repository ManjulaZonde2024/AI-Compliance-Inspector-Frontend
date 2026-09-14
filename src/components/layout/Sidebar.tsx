import { NavLink, useMatch } from 'react-router-dom'
import { primaryNav } from '../../types/navigation'
import { cn } from '../../utils/cn'

const inspectionSteps = [
  { label: 'Scan', step: 'scan' },
  { label: 'Result', step: 'result' },
  { label: 'Evidence', step: 'evidence' },
  { label: 'Report', step: 'report' },
] as const

type SidebarProps = {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const inspectionMatch = useMatch('/inspections/:id/:step')
  const inspectionId = inspectionMatch?.params.id
  const showInspectionNav = Boolean(inspectionId && inspectionId !== 'new')

  return (
    <div className="flex h-full flex-col bg-navy text-white">
      <div className="border-b border-navy-line px-5 py-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
          Workstation
        </p>
        <p className="mt-1 text-base font-semibold tracking-tight">
          AI Compliance Inspector
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
          Workspace
        </p>
        <ul className="flex flex-col gap-0.5">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.match === 'exact'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md border border-transparent px-3 py-2 text-sm transition-[background-color,border-color,color,transform] duration-150',
                    isActive
                      ? 'border-white/10 bg-white/10 text-white'
                      : 'text-white/70 hover:translate-x-0.5 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {showInspectionNav && inspectionId ? (
          <div className="mt-6">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
              Inspection
            </p>
            <p className="truncate px-2 pb-2 font-mono text-xs text-white/45">
              {inspectionId}
            </p>
            <ul className="flex flex-col gap-0.5">
              {inspectionSteps.map((item) => (
                <li key={item.step}>
                  <NavLink
                    to={`/inspections/${inspectionId}/${item.step}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-md border border-transparent px-3 py-2 text-sm transition-[background-color,border-color,color,transform] duration-150',
                        isActive
                          ? 'border-brand/40 bg-brand text-white'
                          : 'text-white/70 hover:translate-x-0.5 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>

      <div className="border-t border-navy-line px-5 py-4 text-xs text-white/45">
        Compliance review workspace
      </div>
    </div>
  )
}
