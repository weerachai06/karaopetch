import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface LyricsSearchResult {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
}

async function searchLyrics(query: string): Promise<LyricsSearchResult[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`)
  }
  return response.json()
}

function App() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const { data, isFetching, isError } = useQuery({
    queryKey: ['lyrics-search', submittedQuery],
    queryFn: () => searchLyrics(submittedQuery),
    enabled: submittedQuery.length > 0,
  })

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
        karaopetch
      </h1>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setSubmittedQuery(query.trim())
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song..."
          className="flex-1 rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          className="rounded bg-gray-900 px-4 py-2 text-white dark:bg-gray-100 dark:text-gray-900"
        >
          Search
        </button>
      </form>

      {isFetching && <p className="text-gray-500">Searching...</p>}
      {isError && <p className="text-red-600">Something went wrong. Try again.</p>}
      {!isFetching && !isError && data && data.length === 0 && (
        <p className="text-gray-500">No results found.</p>
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => console.log('selected', result)}
                className="w-full rounded border border-gray-200 px-3 py-2 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {result.trackName}
                </div>
                <div className="text-sm text-gray-500">
                  {result.artistName}
                  {result.albumName ? ` — ${result.albumName}` : ''}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
