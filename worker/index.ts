import { searchLyrics } from './lrclib'

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

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
