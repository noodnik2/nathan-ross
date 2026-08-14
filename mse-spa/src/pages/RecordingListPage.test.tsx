import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Artist, Recording } from '../domain/types'
import { musicBrainzProvider } from '../providers/musicbrainz/MusicBrainzProvider'
import { MusicBrainzRequestError } from '../providers/musicbrainz/musicBrainzClient'
import { RecordingListPage } from './RecordingListPage'

vi.mock('../providers/musicbrainz/MusicBrainzProvider', () => ({
  musicBrainzProvider: {
    findArtists: vi.fn(),
    findRecordingsForArtist: vi.fn(),
    findRecordingLinks: vi.fn(),
  },
}))

const ARTIST: Artist = { id: 'mbid:artist-1', name: 'Helen Sight' }

function makeRecordings(count: number): Recording[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `mbid:recording-${i + 1}`,
    title: `Recording ${i + 1}`,
    date: `2000-01-${String((i % 28) + 1).padStart(2, '0')}`,
  }))
}

function mockFoundArtist(recordings: Recording[]) {
  vi.mocked(musicBrainzProvider.findArtists).mockResolvedValue([ARTIST])
  vi.mocked(musicBrainzProvider.findRecordingsForArtist).mockResolvedValue(recordings)
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.search}</div>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RecordingListPage />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

describe('RecordingListPage', () => {
  beforeEach(() => {
    vi.mocked(musicBrainzProvider.findArtists).mockReset()
    vi.mocked(musicBrainzProvider.findRecordingsForArtist).mockReset()
  })

  it('shows the recording list heading and first page of recordings once the fetch resolves', async () => {
    mockFoundArtist(makeRecordings(25))
    renderAt('/?artist=Helen+Sight')

    expect(await screen.findByRole('heading', { name: 'Recordings by Helen Sight' })).toBeInTheDocument()
    expect(screen.getByText('Recording 1')).toBeInTheDocument()
    expect(screen.getByText('Recording 10')).toBeInTheDocument()
    expect(screen.queryByText('Recording 11')).not.toBeInTheDocument()
  })

  it('links each recording title to its recording details page using a percent-encoded id', async () => {
    mockFoundArtist(makeRecordings(1))
    renderAt('/?artist=Helen+Sight')

    const link = await screen.findByRole('link', { name: 'Recording 1' })
    expect(link).toHaveAttribute('href', '/recordings/mbid%3Arecording-1')
  })

  it('advances to the next page of recordings and updates the page query param when Next is clicked', async () => {
    mockFoundArtist(makeRecordings(25))
    renderAt('/?artist=Helen+Sight')
    await screen.findByText('Recording 1')

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Recording 11')).toBeInTheDocument()
    expect(screen.queryByText('Recording 1')).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('page=2')
  })

  it('reproduces page 2 directly when loaded at a URL with page=2', async () => {
    mockFoundArtist(makeRecordings(25))
    renderAt('/?artist=Helen+Sight&page=2')

    expect(await screen.findByText('Recording 11')).toBeInTheDocument()
    expect(screen.queryByText('Recording 1')).not.toBeInTheDocument()
  })

  it('shows the "no artist" error page when the artist param is missing, without calling the provider', () => {
    renderAt('/')

    expect(screen.getByText('No artist name was specified.')).toBeInTheDocument()
    expect(musicBrainzProvider.findArtists).not.toHaveBeenCalled()
  })

  it('shows a "not found" error page when the search finds no matching artist', async () => {
    vi.mocked(musicBrainzProvider.findArtists).mockResolvedValue([])
    renderAt('/?artist=Nobody+At+All')

    expect(await screen.findByText("Artist 'Nobody At All' was not found.")).toBeInTheDocument()
  })

  it('shows a general error page (with status and URL) when the MusicBrainz service is unreachable', async () => {
    vi.mocked(musicBrainzProvider.findArtists).mockRejectedValue(
      new MusicBrainzRequestError('boom', 'https://musicbrainz.org/ws/2/artist?query=x', 503),
    )
    renderAt('/?artist=Helen+Sight')

    expect(
      await screen.findByText(
        'Unable to reach the MusicBrainz service. (HTTP 503 at https://musicbrainz.org/ws/2/artist?query=x)',
      ),
    ).toBeInTheDocument()
  })

  it('shows a general error page without a status when the failure has none', async () => {
    vi.mocked(musicBrainzProvider.findArtists).mockRejectedValue(new Error('network exploded'))
    renderAt('/?artist=Helen+Sight')

    expect(await screen.findByText('Unable to reach the MusicBrainz service.')).toBeInTheDocument()
  })
})
