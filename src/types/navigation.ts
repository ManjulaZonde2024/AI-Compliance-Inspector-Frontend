export type NavItem = {
  label: string
  to: string
  match?: 'exact' | 'prefix'
}

export const primaryNav: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', match: 'exact' },
  { label: 'New inspection', to: '/inspections/new', match: 'exact' },
  { label: 'History', to: '/history', match: 'exact' },
  { label: 'Settings', to: '/settings', match: 'exact' },
]
