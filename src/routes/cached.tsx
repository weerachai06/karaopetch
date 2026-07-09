import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { cachedSongsQueryOptions } from '@/lib/lyrics-queries'

export const Route = createFileRoute('/cached')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(cachedSongsQueryOptions()),
  component: CachedSongsPage,
})

function CachedSongsPage() {
  const { data: songs, isFetching, isError } = useQuery(cachedSongsQueryOptions())

  return (
    <section className="flex flex-col gap-2">
      {isFetching && <p className="text-muted-foreground">Loading cached songs...</p>}
      {isError && <p className="text-destructive">Could not load cached songs.</p>}
      {songs && songs.length === 0 && (
        <p className="text-muted-foreground">No songs cached yet.</p>
      )}
      {songs && songs.length > 0 && (
        <ul className="flex flex-col gap-2">
          {songs.map((song) => (
            <li key={song.id}>
              <Link
                to="/songs/$songId"
                params={{ songId: String(song.id) }}
                className="flex flex-col gap-0.5 rounded-md border border-input px-3 py-2 hover:bg-accent"
              >
                <span className="font-medium text-foreground">{song.trackName}</span>
                <span className="text-sm text-muted-foreground">
                  {song.artistName}
                  {song.albumName ? ` — ${song.albumName}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
