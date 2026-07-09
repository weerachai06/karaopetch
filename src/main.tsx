import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, useIsRestoring } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import { createAppRouter } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min fresh
      gcTime: 1000 * 60 * 60 * 24 * 7, // keep 7 days so it can be persisted
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'karaopetch-query-cache',
})

const router = createAppRouter(queryClient)

// Hold route loaders until the persisted cache is restored, so offline
// revisits read from cache instead of firing a doomed network fetch.
function App() {
  const isRestoring = useIsRestoring()
  if (isRestoring) return null
  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === 'success',
        },
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
