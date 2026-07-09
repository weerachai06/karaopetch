import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-semibold text-foreground">karaopetch</h1>
      <Outlet />
    </main>
  )
}
