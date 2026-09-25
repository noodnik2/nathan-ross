import type { Artist, Provider, Recording, RecordingDetails } from '../../domain/types'
import { MusicBrainzClient, musicBrainzClient } from './musicBrainzClient'

const MBID_PREFIX = 'mbid:'

interface MusicBrainzSearchArtist {
  id: string
  name: string
  score?: number
}

interface MusicBrainzRelation {
  type?: string
  'target-type'?: string
  begin?: string | null
  recording?: { id: string; title: string }
  url?: { id: string; resource: string }
}

export class MusicBrainzProvider implements Provider {
  private readonly client: MusicBrainzClient

  constructor(client: MusicBrainzClient = musicBrainzClient) {
    this.client = client
  }

  async findArtists(artistSpec: string): Promise<Artist[]> {
    const data = (await this.client.get('artist', {
      query: `artist:"${escapeLucene(artistSpec)}"`,
    })) as { artists?: MusicBrainzSearchArtist[] }

    const candidates = data.artists ?? []
    if (candidates.length === 0) {
      return []
    }

    const best = candidates.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a))
    return [{ id: MBID_PREFIX + best.id, name: best.name }]
  }

  async findRecordingsForArtist(artist: Artist): Promise<Recording[]> {
    const mbid = stripMbidPrefix(artist.id)
    const data = (await this.client.get(`artist/${mbid}`, { inc: 'recording-rels' })) as {
      relations?: MusicBrainzRelation[]
    }

    const relations = data.relations ?? []
    return relations
      .filter(
        (relation): relation is MusicBrainzRelation & { recording: { id: string; title: string } } =>
          relation['target-type'] === 'recording' && relation.type === 'instrument' && !!relation.recording,
      )
      .map((relation) => ({
        id: MBID_PREFIX + relation.recording.id,
        title: relation.recording.title,
        date: relation.begin ?? '',
      }))
  }

  async findRecordingDetails(recording: Recording): Promise<RecordingDetails> {
    const mbid = stripMbidPrefix(recording.id)
    const data = (await this.client.get(`recording/${mbid}`, { inc: 'url-rels' })) as {
      title: string
      'first-release-date'?: string
      relations?: MusicBrainzRelation[]
    }

    const relations = data.relations ?? []
    const links = relations
      .filter((relation): relation is MusicBrainzRelation & { url: { id: string; resource: string } } =>
        relation['target-type'] === 'url' && !!relation.url,
      )
      .map((relation) => ({
        id: MBID_PREFIX + relation.url.id,
        url: relation.url.resource,
      }))

    return {
      title: data.title,
      ...(data['first-release-date'] ? { releaseDate: data['first-release-date'] } : {}),
      links,
    }
  }
}

function stripMbidPrefix(id: string): string {
  return id.startsWith(MBID_PREFIX) ? id.slice(MBID_PREFIX.length) : id
}

function escapeLucene(value: string): string {
  return value.replace(/([+\-!(){}[\]^"~*?:\\/])/g, '\\$1')
}

export const musicBrainzProvider = new MusicBrainzProvider()
