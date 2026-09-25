import { http, HttpResponse, delay } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../mocks/server'
import { MusicBrainzClient, MusicBrainzRequestError } from './musicBrainzClient'

const BASE_URL = 'https://mb.test/ws/2'

function fastClient(overrides: Partial<ConstructorParameters<typeof MusicBrainzClient>[0]> = {}) {
  return new MusicBrainzClient({
    baseUrl: BASE_URL,
    userAgent: 'TestAgent/0.1 (test@example.com)',
    baseIntervalMs: 5,
    maxIntervalMs: 20,
    backoffMultiplier: 2,
    recoveryFactor: 1,
    maxRetries: 3,
    timeoutMs: 2000,
    ...overrides,
  })
}

describe('MusicBrainzClient', () => {
  it('sends the User-Agent header and fmt=json, and returns the parsed JSON body on success', async () => {
    let seenUserAgent: string | null = null
    let seenFmt: string | null = null
    server.use(
      http.get(`${BASE_URL}/artist`, ({ request }) => {
        const url = new URL(request.url)
        seenUserAgent = request.headers.get('User-Agent')
        seenFmt = url.searchParams.get('fmt')
        return HttpResponse.json({ artists: [] })
      }),
    )

    const client = fastClient()
    const body = await client.get('artist', { query: 'artist:"Test"' })

    expect(seenUserAgent).toBe('TestAgent/0.1 (test@example.com)')
    expect(seenFmt).toBe('json')
    expect(body).toEqual({ artists: [] })
  })

  it('throttles consecutive requests to at least baseIntervalMs apart', async () => {
    server.use(http.get(`${BASE_URL}/artist`, () => HttpResponse.json({ artists: [] })))

    const client = fastClient({ baseIntervalMs: 40, maxIntervalMs: 40 })
    const start = Date.now()
    await client.get('artist', {})
    await client.get('artist', {})
    const elapsed = Date.now() - start

    expect(elapsed).toBeGreaterThanOrEqual(40)
  })

  it('retries after a 503 response and returns the eventual success', async () => {
    let callCount = 0
    server.use(
      http.get(`${BASE_URL}/artist`, () => {
        callCount += 1
        if (callCount === 1) {
          return new HttpResponse(null, { status: 503 })
        }
        return HttpResponse.json({ artists: [] })
      }),
    )

    const client = fastClient()
    const body = await client.get('artist', {})

    expect(callCount).toBe(2)
    expect(body).toEqual({ artists: [] })
  })

  it('throws MusicBrainzRequestError with status 503 after exhausting retries on repeated 503s', async () => {
    server.use(http.get(`${BASE_URL}/artist`, () => new HttpResponse(null, { status: 503 })))

    const client = fastClient({ maxRetries: 3 })

    await expect(client.get('artist', {})).rejects.toMatchObject({
      name: 'MusicBrainzRequestError',
      status: 503,
    })
  })

  it('throws MusicBrainzRequestError with the response status for a non-503 error, without retrying', async () => {
    let callCount = 0
    server.use(
      http.get(`${BASE_URL}/artist`, () => {
        callCount += 1
        return new HttpResponse(null, { status: 400 })
      }),
    )

    const client = fastClient()

    await expect(client.get('artist', {})).rejects.toMatchObject({
      name: 'MusicBrainzRequestError',
      status: 400,
    })
    expect(callCount).toBe(1)
  })

  it('throws MusicBrainzRequestError without a status when the network request fails', async () => {
    server.use(http.get(`${BASE_URL}/artist`, () => HttpResponse.error()))

    const client = fastClient()
    const error = await client.get('artist', {}).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(MusicBrainzRequestError)
    expect((error as MusicBrainzRequestError).status).toBeUndefined()
    expect((error as MusicBrainzRequestError).url).toContain(`${BASE_URL}/artist`)
  })

  it('throws MusicBrainzRequestError without a status when the request times out', async () => {
    server.use(
      http.get(`${BASE_URL}/artist`, async () => {
        await delay(200)
        return HttpResponse.json({ artists: [] })
      }),
    )

    const client = fastClient({ timeoutMs: 10 })
    const error = await client.get('artist', {}).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(MusicBrainzRequestError)
    expect((error as MusicBrainzRequestError).status).toBeUndefined()
  })
})
