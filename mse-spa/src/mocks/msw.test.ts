import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from './server'

describe('MSW test harness', () => {
  it('intercepts fetch and returns a mocked JSON response', async () => {
    server.use(
      http.get('https://example.test/ping', () => HttpResponse.json({ status: 'ok' })),
    )

    const response = await fetch('https://example.test/ping')

    await expect(response.json()).resolves.toEqual({ status: 'ok' })
  })
})
