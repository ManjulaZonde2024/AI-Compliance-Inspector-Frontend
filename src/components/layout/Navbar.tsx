import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'

type NavbarProps = {
  title: string
  onMenuClick: () => void
  showMenuButton: boolean
}

export function Navbar({ title, onMenuClick, showMenuButton }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[4.25rem] items-center gap-3 border-b border-border bg-surface/85 px-4 shadow-sm backdrop-blur-md transition-colors duration-200 sm:px-8 lg:px-10">
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
      <span className="h-5 w-1 shrink-0 rounded-full bg-brand" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
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
