import { createFileRoute, useLocation } from '@tanstack/react-router'
import { LyricsView } from '@/components/lyrics-view'

export const Route = createFileRoute('/songs/paste')({
  component: PastedLyricsPage,
})

function PastedLyricsPage() {
  const { state } = useLocation()
  const pastedLyrics = state.pastedLyrics

  if (!pastedLyrics) {
    return (
      <p className="text-muted-foreground">
        No lyrics to show — go back and paste some first.
      </p>
    )
  }

  return (
    <LyricsView
      lyrics={{
        id: -1,
        trackName: pastedLyrics.trackName,
        artistName: '',
        albumName: null,
        plainLyrics: pastedLyrics.plainLyrics,
      }}
    />
  )
}
