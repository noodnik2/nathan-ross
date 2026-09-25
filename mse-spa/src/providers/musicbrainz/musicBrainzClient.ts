export interface MusicBrainzClientConfig {
  baseUrl: string
  userAgent: string
  baseIntervalMs: number
  maxIntervalMs: number
  backoffMultiplier: number
  recoveryFactor: number
  maxRetries: number
  timeoutMs: number
}

export const DEFAULT_CONFIG: MusicBrainzClientConfig = {
  baseUrl: 'https://musicbrainz.org/ws/2',
  userAgent: 'NathanRossQueryAgent/0.1 (noodnik2@gmail.com)',
  baseIntervalMs: 1000,
  maxIntervalMs: 30000,
  backoffMultiplier: 2,
  recoveryFactor: 0.9,
  maxRetries: 5,
  timeoutMs: 60000,
}

export class MusicBrainzRequestError extends Error {
  readonly url: string
  readonly status?: number

  constructor(message: string, url: string, status?: number) {
    super(message)
    this.name = 'MusicBrainzRequestError'
    this.url = url
    this.status = status
  }
}

export class MusicBrainzClient {
  private readonly config: MusicBrainzClientConfig
  private lastRequestTime = 0
  private currentIntervalMs: number

  constructor(config: MusicBrainzClientConfig = DEFAULT_CONFIG) {
    this.config = config
    this.currentIntervalMs = config.baseIntervalMs
  }

  async get(endpoint: string, params: Record<string, string>): Promise<unknown> {
    const url = buildUrl(this.config.baseUrl, endpoint, params)

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      await this.waitForThrottle()

      let response: Response
      try {
        response = await fetch(url, {
          headers: { 'User-Agent': this.config.userAgent },
          signal: AbortSignal.timeout(this.config.timeoutMs),
        })
      } catch {
        throw new MusicBrainzRequestError('Failed to reach the MusicBrainz service.', url)
      }

      if (response.status === 503) {
        this.currentIntervalMs = Math.min(
          this.config.maxIntervalMs,
          this.currentIntervalMs * this.config.backoffMultiplier,
        )
        continue
      }

      if (!response.ok) {
        throw new MusicBrainzRequestError(
          'The MusicBrainz service returned an error response.',
          url,
          response.status,
        )
      }

      this.currentIntervalMs = Math.max(
        this.config.baseIntervalMs,
        this.currentIntervalMs * this.config.recoveryFactor,
      )
      return response.json()
    }

    throw new MusicBrainzRequestError(
      'The MusicBrainz service kept returning 503 (rate limited).',
      url,
      503,
    )
  }

  private async waitForThrottle(): Promise<void> {
    const wait = this.currentIntervalMs - (Date.now() - this.lastRequestTime)
    if (wait > 0) {
      await sleep(wait)
    }
    this.lastRequestTime = Date.now()
  }
}

function buildUrl(baseUrl: string, endpoint: string, params: Record<string, string>): string {
  const url = new URL(`${baseUrl}/${endpoint}`)
  url.searchParams.set('fmt', 'json')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const musicBrainzClient = new MusicBrainzClient()
