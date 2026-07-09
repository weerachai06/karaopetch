import { getLyrics, searchLyrics } from './lrclib'
import { containsHangul, hashText, transliterateLines } from './transliterate'

const LYRICS_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30
const TRANSLITERATION_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return Response.json({ status: 'ok' })
    }

    if (url.pathname === '/api/search') {
      const query = url.searchParams.get('q')?.trim()
      if (!query) {
        return Response.json({ error: 'Missing query parameter "q"' }, { status: 400 })
      }

      const results = await searchLyrics(query)
      return Response.json(results)
    }

    if (url.pathname === '/api/lyrics') {
      const id = url.searchParams.get('id')?.trim()
      if (!id) {
        return Response.json({ error: 'Missing query parameter "id"' }, { status: 400 })
      }

      const cacheKey = `lyrics:${id}`
      const cached = await env.LYRICS_CACHE.get(cacheKey, 'json')
      if (cached) {
        return Response.json(cached)
      }

      const lyrics = await getLyrics(Number(id))
      await env.LYRICS_CACHE.put(cacheKey, JSON.stringify(lyrics), {
        expirationTtl: LYRICS_CACHE_TTL_SECONDS,
      })
      return Response.json(lyrics)
    }

    if (url.pathname === '/api/cached-songs') {
      const list = await env.LYRICS_CACHE.list({ prefix: 'lyrics:' })
      const songs = await Promise.all(
        list.keys.map((key) => env.LYRICS_CACHE.get(key.name, 'json')),
      )
      return Response.json(songs.filter(Boolean))
    }

    if (url.pathname === '/api/transliterate' && request.method === 'POST') {
      const body = (await request.json()) as { lyrics?: string }
      const lyrics = body.lyrics?.trim()
      if (!lyrics) {
        return Response.json({ error: 'Missing "lyrics" in request body' }, { status: 400 })
      }

      if (!containsHangul(lyrics)) {
        return Response.json({ transliterated: false, linePairs: null })
      }

      const cacheKey = `transliteration:v2:${await hashText(lyrics)}`
      const cached = await env.LYRICS_CACHE.get(cacheKey, 'json')
      if (cached) {
        return Response.json({ transliterated: true, linePairs: cached })
      }

      const lines = lyrics.split('\n')
      const linePairs = await transliterateLines(env.AI, lines)
      await env.LYRICS_CACHE.put(cacheKey, JSON.stringify(linePairs), {
        expirationTtl: TRANSLITERATION_CACHE_TTL_SECONDS,
      })
      return Response.json({ transliterated: true, linePairs })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
