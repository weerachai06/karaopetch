import { queryOptions } from '@tanstack/react-query'
import { fetchLyrics, fetchTransliteration, searchLyrics } from '@/lib/lyrics-api'

export function searchQueryOptions(query: string) {
  return queryOptions({
    queryKey: ['lyrics-search', query],
    queryFn: () => searchLyrics(query),
    enabled: query.length > 0,
  })
}

export function lyricsDetailQueryOptions(songId: number) {
  return queryOptions({
    queryKey: ['lyrics-detail', songId],
    queryFn: () => fetchLyrics(songId),
  })
}

export function transliterationQueryOptions(lyrics: string) {
  return queryOptions({
    queryKey: ['transliteration', lyrics],
    queryFn: () => fetchTransliteration(lyrics),
  })
}
