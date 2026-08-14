export interface Artist {
  id: string
  name: string
}

export interface Recording {
  id: string
  title: string
  date: string
}

export interface RecordingLink {
  id: string
  url: string
}

export interface Provider {
  findArtists(artistSpec: string): Promise<Artist[]>
  findRecordingsForArtist(artist: Artist): Promise<Recording[]>
  findRecordingLinks(recording: Recording): Promise<RecordingLink[]>
}
