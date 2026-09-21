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
      <div className="border-b border-white/10 px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold tracking-tight text-white shadow-sm"
            aria-hidden
          >
            PD
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Workstation
            </p>
            <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-white">
              Packet Decoder
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Primary">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          Workspace
        </p>
        <ul className="flex flex-col gap-1">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.match === 'exact'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg border border-transparent px-3 py-2 text-sm font-medium tracking-[-0.006em] transition-[background-color,border-color,color,box-shadow] duration-150',
                    isActive
                      ? 'border-brand/30 bg-brand/20 text-white shadow-[inset_3px_0_0_0_var(--color-accent)]'
                      : 'text-white/60 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {showInspectionNav && inspectionId ? (
          <div className="mt-7">
            <div className="mb-2 h-px bg-white/10" aria-hidden />
            <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Inspection
            </p>
            <p className="truncate px-3 pb-2 font-mono text-xs text-white/45">
              {inspectionId}
            </p>
            <ul className="flex flex-col gap-1">
              {inspectionSteps.map((item) => (
                <li key={item.step}>
                  <NavLink
                    to={`/inspections/${inspectionId}/${item.step}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-lg border border-transparent px-3 py-2 text-sm font-medium tracking-[-0.006em] transition-[background-color,border-color,color,box-shadow] duration-150',
                        isActive
                          ? 'border-brand/40 bg-brand/25 text-white shadow-[inset_3px_0_0_0_var(--color-accent)]'
                          : 'text-white/60 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white',
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

      <div className="border-t border-white/10 px-5 py-4">
        <p className="flex items-center gap-2 text-xs leading-5 text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Compliance review workspace
        </p>
      </div>
    </div>
  )
}
