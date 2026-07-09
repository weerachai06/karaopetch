import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LyricsView } from '@/components/lyrics-view'
import { lyricsDetailQueryOptions } from '@/lib/lyrics-queries'

export const Route = createFileRoute('/songs/$songId')({
  loader: ({ context: { queryClient }, params: { songId } }) =>
    queryClient.ensureQueryData(lyricsDetailQueryOptions(Number(songId))),
  component: SongDetailPage,
})

function SongDetailPage() {
  const { songId } = Route.useParams()
  const {
    data: lyrics,
    isFetching,
    isError,
  } = useQuery(lyricsDetailQueryOptions(Number(songId)))

  return (
    <section className="flex flex-col gap-2">
      {isFetching && <p className="text-muted-foreground">Loading lyrics...</p>}
      {isError && <p className="text-destructive">Could not load lyrics. Try again.</p>}
      {lyrics && <LyricsView lyrics={lyrics} />}
    </section>
  )
}
