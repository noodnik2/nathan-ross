import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { musicBrainzProvider } from './providers/musicbrainz/MusicBrainzProvider'

vi.mock('./providers/musicbrainz/MusicBrainzProvider', () => ({
  musicBrainzProvider: {
    findArtists: vi.fn(),
    findRecordingsForArtist: vi.fn(),
    findRecordingLinks: vi.fn(),
  },
}))

describe('App', () => {
  beforeEach(() => {
    vi.mocked(musicBrainzProvider.findArtists).mockReset()
    vi.mocked(musicBrainzProvider.findRecordingsForArtist).mockReset()
  })

  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('routes the home page to the recording list for a given artist', async () => {
    vi.mocked(musicBrainzProvider.findArtists).mockResolvedValue([{ id: 'mbid:test-artist', name: 'Test Artist' }])
    vi.mocked(musicBrainzProvider.findRecordingsForArtist).mockResolvedValue([])
    window.history.pushState({}, '', '/?artist=Test+Artist')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Recordings by Test Artist' })).toBeInTheDocument()
  })

  it('routes the home page to the error page when no artist is given', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByText('No artist name was specified.')).toBeInTheDocument()
  })
})
