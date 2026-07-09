import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold leading-tight text-foreground">
          {lyrics.trackName}
        </h1>
        {lyrics.artistName && (
          <p className="text-muted-foreground">{lyrics.artistName}</p>
        )}
      </header>

      {lyrics.plainLyrics ? (
        <>
          {isTransliterationFetching && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Reading it in Thai…
            </p>
          )}
          {isTransliterationError && (
            <p className="text-destructive">Could not read these lyrics.</p>
          )}
          {transliteration?.transliterated && transliteration.linePairs ? (
            <ol className="flex flex-col gap-1">
              {transliteration.linePairs.map((pair, i) => {
                const blank = !pair.original.trim()
                if (blank) return <li key={i} aria-hidden className="h-3" />
                return (
                  <li
                    key={i}
                    className="animate-rise rounded-xl border-l-[3px] border-primary/70 bg-card/60 py-2.5 pr-3 pl-4"
                    style={{ animationDelay: `${Math.min(i, 20) * 35}ms` }}
                  >
                    <p className="text-sm leading-snug text-muted-foreground">
                      {pair.original}
                    </p>
                    <p className="mt-0.5 font-display text-xl leading-snug font-semibold text-[var(--color-sing)]">
                      {pair.transliteration ?? '—'}
                    </p>
                  </li>
                )
              })}
            </ol>
          ) : (
            !isTransliterationFetching && (
              <pre className="rounded-2xl border border-border bg-card p-4 font-sans text-base leading-relaxed whitespace-pre-wrap text-card-foreground">
                {lyrics.plainLyrics}
              </pre>
            )
          )}
        </>
      ) : (
        <p className="text-muted-foreground">No lyrics available for this track.</p>
      )}
    </section>
  )
}
