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

export interface RecordingDetails {
  title: string
  releaseDate?: string
  links: RecordingLink[]
}

export interface Provider {
  findArtists(artistSpec: string): Promise<Artist[]>
  findRecordingsForArtist(artist: Artist): Promise<Recording[]>
  findRecordingDetails(recording: Recording): Promise<RecordingDetails>
}
