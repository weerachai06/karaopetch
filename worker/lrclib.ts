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

const USER_AGENT = 'karaopetch (https://github.com/weerachai06/karaopetch)'

export async function searchLyrics(query: string): Promise<LyricsSearchResult[]> {
  const url = new URL('https://lrclib.net/api/search')
  url.searchParams.set('q', query)

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
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

export interface LyricsDetail {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
  plainLyrics: string | null
}

interface LrclibGetItem {
  id: number
  trackName: string
  artistName: string
  albumName: string | null
  plainLyrics: string | null
}

export async function getLyrics(id: number): Promise<LyricsDetail> {
  const url = new URL(`https://lrclib.net/api/get/${id}`)

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(`LRCLIB get failed with status ${response.status}`)
  }

  const item = (await response.json()) as LrclibGetItem

  return {
    id: item.id,
    trackName: item.trackName,
    artistName: item.artistName,
    albumName: item.albumName,
    plainLyrics: item.plainLyrics,
  }
}
