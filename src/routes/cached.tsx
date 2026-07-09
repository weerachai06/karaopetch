import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Music4, ListMusic } from 'lucide-react'
import { cachedSongsQueryOptions } from '@/lib/lyrics-queries'

export const Route = createFileRoute('/cached')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(cachedSongsQueryOptions()),
  component: CachedSongsPage,
})

function CachedSongsPage() {
  const { data: songs, isFetching, isError } = useQuery(cachedSongsQueryOptions())

  return (
    <section className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Cached songs</h1>

      {isFetching && <p className="text-muted-foreground">Loading…</p>}
      {isError && <p className="text-destructive">Could not load cached songs.</p>}

      {songs && songs.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-input py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <ListMusic className="size-6" />
          </span>
          <p className="font-display font-semibold text-foreground">Nothing cached yet</p>
          <p className="text-sm text-muted-foreground">
            Songs you open show up here for a quick encore.
          </p>
        </div>
      )}

      {songs && songs.length > 0 && (
        <ul className="flex flex-col gap-3">
          {songs.map((song) => (
            <li key={song.id}>
              <Link
                to="/songs/$songId"
                params={{ songId: String(song.id) }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-transform active:scale-[0.98]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Music4 className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg font-semibold text-card-foreground">
                    {song.trackName}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {song.artistName}
                    {song.albumName ? ` · ${song.albumName}` : ''}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
