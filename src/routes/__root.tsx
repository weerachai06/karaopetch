import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Mic, Search, ListMusic } from 'lucide-react'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center px-5 py-3">
          <Link to="/" search={{ q: '' }} className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <Mic className="size-4.5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              karaopetch
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-stretch gap-1 px-3 pb-[env(safe-area-inset-bottom)]">
          <NavItem to="/" search={{ q: '' }} icon={Search} label="Search" exact />
          <NavItem to="/cached" icon={ListMusic} label="Cached" />
        </div>
      </nav>
    </div>
  )
}

function NavItem({
  to,
  search,
  icon: Icon,
  label,
  exact = false,
}: {
  to: string
  search?: { q: string }
  icon: typeof Search
  label: string
  exact?: boolean
}) {
  return (
    <Link
      to={to}
      search={search}
      activeOptions={{ exact, includeSearch: false }}
      className="group flex flex-1 flex-col items-center gap-1 py-2 text-muted-foreground transition-colors data-[status=active]:text-primary"
    >
      <span className="grid size-9 place-items-center rounded-full transition-colors group-data-[status=active]:bg-secondary">
        <Icon className="size-5" />
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  )
}
