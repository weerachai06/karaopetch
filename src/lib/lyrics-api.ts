export interface LyricsSearchResult {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
}

export interface LyricsDetail {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
  plainLyrics: string | null
}

export interface LinePair {
  original: string
  transliteration: string | null
}

export interface TransliterateResponse {
  transliterated: boolean
  linePairs: LinePair[] | null
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    throw new Error(`Request to ${input} failed with status ${response.status}`)
  }
  return response.json()
}

export function searchLyrics(query: string): Promise<LyricsSearchResult[]> {
  return request(`/api/search?q=${encodeURIComponent(query)}`)
}

export function fetchLyrics(id: number): Promise<LyricsDetail> {
  return request(`/api/lyrics?id=${id}`)
}

export function fetchTransliteration(lyrics: string): Promise<TransliterateResponse> {
  return request('/api/transliterate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lyrics }),
  })
}
