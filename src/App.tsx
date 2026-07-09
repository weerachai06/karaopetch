import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'

interface LyricsSearchResult {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
}

interface LyricsDetail {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
  plainLyrics: string | null
}

async function searchLyrics(query: string): Promise<LyricsSearchResult[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`)
  }
  return response.json()
}

async function fetchLyrics(id: number): Promise<LyricsDetail> {
  const response = await fetch(`/api/lyrics?id=${id}`)
  if (!response.ok) {
    throw new Error(`Lyrics fetch failed with status ${response.status}`)
  }
  return response.json()
}

function App() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data, isFetching, isError } = useQuery({
    queryKey: ['lyrics-search', submittedQuery],
    queryFn: () => searchLyrics(submittedQuery),
    enabled: submittedQuery.length > 0,
  })

  const {
    data: lyrics,
    isFetching: isLyricsFetching,
    isError: isLyricsError,
  } = useQuery({
    queryKey: ['lyrics-detail', selectedId],
    queryFn: () => fetchLyrics(selectedId!),
    enabled: selectedId !== null,
  })

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-semibold text-foreground">karaopetch</h1>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setSubmittedQuery(query.trim())
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
      {!isFetching && !isError && data && data.length === 0 && (
        <p className="text-muted-foreground">No results found.</p>
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((result) => (
            <li key={result.id}>
              <Button
                variant="outline"
                className="h-auto w-full flex-col items-start gap-0.5 text-left"
                onClick={() => setSelectedId(result.id)}
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

      {selectedId !== null && (
        <section className="flex flex-col gap-2">
          {isLyricsFetching && <p className="text-muted-foreground">Loading lyrics...</p>}
          {isLyricsError && <p className="text-destructive">Could not load lyrics. Try again.</p>}
          {!isLyricsFetching && !isLyricsError && lyrics && (
            <>
              <h2 className="text-xl font-semibold text-foreground">
                {lyrics.trackName} — {lyrics.artistName}
              </h2>
              {lyrics.plainLyrics ? (
                <pre className="whitespace-pre-wrap font-sans text-foreground">
                  {lyrics.plainLyrics}
                </pre>
              ) : (
                <p className="text-muted-foreground">No lyrics available for this track.</p>
              )}
            </>
          )}
        </section>
      )}
    </main>
  )
}

export default App
