import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Mic, ListMusic } from 'lucide-react'

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
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-3">
          <Link to="/" search={{ q: '' }} className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <Mic className="size-4.5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              karaopetch
            </span>
          </Link>
          <Link
            to="/cached"
            aria-label="Saved songs"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <ListMusic className="size-4.5" />
            <span className="hidden sm:inline">Saved</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  )
}
