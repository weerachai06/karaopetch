import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronRight, Music4 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { searchQueryOptions } from '@/lib/lyrics-queries'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()
  const navigate = useNavigate()
  const [query, setQuery] = useState(q)
  const [pastedText, setPastedText] = useState('')

  const { data, isFetching, isError } = useQuery(searchQueryOptions(q))

  const noResults = !isFetching && !isError && data && data.length === 0
  const idle = !q && !isFetching

  return (
    <>
      {idle && (
        <div className="pt-2">
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
            Find a song.
            <br />
            <span className="text-primary">Sing it in Thai.</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Search any track and read along with a Thai phonetic reading.
          </p>
        </div>
      )}

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ to: '/', search: { q: query.trim() } })
        }}
      >
        <Field className="flex-1">
          <FieldLabel className="sr-only">Search for a song</FieldLabel>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Song or artist…"
              className="h-14 rounded-full pl-12 text-base"
            />
          </div>
        </Field>
        <Button
          type="submit"
          size="icon"
          aria-label="Search"
          className="size-14 shrink-0 rounded-full"
        >
          <Search className="size-5" strokeWidth={2.5} />
        </Button>
      </form>

      {isFetching && (
        <p className="animate-pulse text-center text-muted-foreground">Searching…</p>
      )}
      {isError && (
        <p className="text-center text-destructive">Something went wrong. Try again.</p>
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.map((result, i) => (
            <li key={result.id} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
              <button
                type="button"
                onClick={() =>
                  navigate({ to: '/songs/$songId', params: { songId: String(result.id) } })
                }
                className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-transform active:scale-[0.98]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Music4 className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg font-semibold text-card-foreground">
                    {result.trackName}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {result.artistName}
                    {result.albumName ? ` · ${result.albumName}` : ''}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {noResults && (
        <form
          className="flex flex-col gap-3 rounded-2xl border border-dashed border-input bg-secondary/40 p-4"
          onSubmit={(e) => {
            e.preventDefault()
            const trimmed = pastedText.trim()
            if (!trimmed) return
            navigate({
              to: '/songs/paste',
              state: { pastedLyrics: { trackName: q, plainLyrics: trimmed } },
            })
          }}
        >
          <p className="font-display font-semibold text-foreground">
            No match for “{q}”.
          </p>
          <p className="text-sm text-muted-foreground">Paste the lyrics and we'll read them for you.</p>
          <Field>
            <FieldLabel className="sr-only">Paste lyrics</FieldLabel>
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste lyrics here…"
              rows={8}
              className="rounded-xl"
            />
          </Field>
          <Button type="submit" className="h-11 rounded-full">
            Read these lyrics
          </Button>
        </form>
      )}
    </>
  )
}
