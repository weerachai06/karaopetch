import { useQuery } from '@tanstack/react-query'
import type { LyricsDetail } from '@/lib/lyrics-api'
import { transliterationQueryOptions } from '@/lib/lyrics-queries'

export function LyricsView({ lyrics }: { lyrics: LyricsDetail }) {
  const {
    data: transliteration,
    isFetching: isTransliterationFetching,
    isError: isTransliterationError,
  } = useQuery({
    ...transliterationQueryOptions(lyrics.plainLyrics ?? ''),
    enabled: Boolean(lyrics.plainLyrics),
  })

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold text-foreground">
        {lyrics.trackName}
        {lyrics.artistName ? ` — ${lyrics.artistName}` : ''}
      </h2>

      {lyrics.plainLyrics ? (
        <>
          {isTransliterationFetching && (
            <p className="text-muted-foreground">Transliterating...</p>
          )}
          {isTransliterationError && (
            <p className="text-destructive">Could not transliterate lyrics.</p>
          )}
          {transliteration?.transliterated && transliteration.linePairs ? (
            <ul className="flex flex-col gap-1">
              {transliteration.linePairs.map((pair, i) => (
                <li key={i} className="grid grid-cols-2 gap-4">
                  <span className="text-foreground">{pair.original}</span>
                  <span className="text-muted-foreground">{pair.transliteration ?? '—'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-foreground">
              {lyrics.plainLyrics}
            </pre>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">No lyrics available for this track.</p>
      )}
    </section>
  )
}
