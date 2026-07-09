import { getLyrics, searchLyrics } from './lrclib'

const LYRICS_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30

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

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
