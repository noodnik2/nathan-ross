export type KnownServiceId = 'spotify' | 'apple-music' | 'youtube' | 'deezer' | 'secondhandsongs' | 'discogs'

export interface KnownService {
  id: KnownServiceId
  name: string
}

const KNOWN_SERVICES: Record<KnownServiceId, KnownService> = {
  spotify: { id: 'spotify', name: 'Spotify' },
  'apple-music': { id: 'apple-music', name: 'Apple Music' },
  youtube: { id: 'youtube', name: 'YouTube' },
  deezer: { id: 'deezer', name: 'Deezer' },
  secondhandsongs: { id: 'secondhandsongs', name: 'SecondHandSongs' },
  discogs: { id: 'discogs', name: 'Discogs' },
}

const HOSTNAME_TO_SERVICE_ID: Record<string, KnownServiceId> = {
  'spotify.com': 'spotify',
  'music.apple.com': 'apple-music',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'deezer.com': 'deezer',
  'secondhandsongs.com': 'secondhandsongs',
  'discogs.com': 'discogs',
}

export function matchKnownService(url: string): KnownService | undefined {
  let hostname: string
  try {
    hostname = new URL(url).hostname.toLowerCase()
  } catch {
    return undefined
  }

  const bareHostname = hostname.startsWith('www.') ? hostname.slice(4) : hostname

  const matchedHostname = Object.keys(HOSTNAME_TO_SERVICE_ID).find(
    (knownHostname) => bareHostname === knownHostname || bareHostname.endsWith(`.${knownHostname}`),
  )
  if (!matchedHostname) {
    return undefined
  }

  return KNOWN_SERVICES[HOSTNAME_TO_SERVICE_ID[matchedHostname]]
}
