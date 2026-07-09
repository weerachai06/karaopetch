import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
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

  return (
    <>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ to: '/', search: { q: query.trim() } })
        }}
      >
        <Field className="flex-1">
          <FieldLabel className="sr-only">Search for a song</FieldLabel>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a song..."
          />
        </Field>
        <Button type="submit">Search</Button>
      </form>

      {isFetching && <p className="text-muted-foreground">Searching...</p>}
      {isError && <p className="text-destructive">Something went wrong. Try again.</p>}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((result) => (
            <li key={result.id}>
              <Button
                variant="outline"
                className="h-auto w-full flex-col items-start gap-0.5 text-left"
                onClick={() =>
                  navigate({ to: '/songs/$songId', params: { songId: String(result.id) } })
                }
              >
                <span className="font-medium text-foreground">{result.trackName}</span>
                <span className="text-sm text-muted-foreground">
                  {result.artistName}
                  {result.albumName ? ` — ${result.albumName}` : ''}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {noResults && (
        <form
          className="flex flex-col gap-2"
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
          <p className="text-muted-foreground">Not found — paste the lyrics yourself.</p>
          <Field>
            <FieldLabel className="sr-only">Paste lyrics</FieldLabel>
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste lyrics here..."
              rows={8}
            />
          </Field>
          <Button type="submit">Use these lyrics</Button>
        </form>
      )}
    </>
  )
}
