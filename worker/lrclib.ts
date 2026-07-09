export interface LyricsSearchResult {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
}

interface LrclibSearchItem {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
}

export async function searchLyrics(query: string): Promise<LyricsSearchResult[]> {
  const url = new URL('https://lrclib.net/api/search')
  url.searchParams.set('q', query)

  const response = await fetch(url, {
    headers: { 'User-Agent': 'karaopetch (https://github.com/weerachai06/karaopetch)' },
  })

  if (!response.ok) {
    throw new Error(`LRCLIB search failed with status ${response.status}`)
  }

  const items = (await response.json()) as LrclibSearchItem[]

  return items.map((item) => ({
    id: item.id,
    trackName: item.trackName,
    artistName: item.artistName,
    albumName: item.albumName,
  }))
}
