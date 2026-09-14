import { Button } from '../ui/Button'

type NavbarProps = {
  title: string
  onMenuClick: () => void
  showMenuButton: boolean
}

export function Navbar({ title, onMenuClick, showMenuButton }: NavbarProps) {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-surface px-5 shadow-sm sm:px-8 lg:px-10">
      {showMenuButton ? (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 px-2"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </Button>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{title}</p>
      </div>
    </header>
  )
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 4.5h12M3 9h12M3 13.5h12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
