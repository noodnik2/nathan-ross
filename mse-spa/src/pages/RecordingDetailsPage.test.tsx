import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RecordingDetails } from '../domain/types'
import { musicBrainzProvider } from '../providers/musicbrainz/MusicBrainzProvider'
import { MusicBrainzRequestError } from '../providers/musicbrainz/musicBrainzClient'
import { RecordingDetailsPage } from './RecordingDetailsPage'

vi.mock('../providers/musicbrainz/MusicBrainzProvider', () => ({
  musicBrainzProvider: {
    findArtists: vi.fn(),
    findRecordingsForArtist: vi.fn(),
    findRecordingDetails: vi.fn(),
  },
}))

const DETAILS: RecordingDetails = {
  title: 'A Blossom Fell',
  releaseDate: '1955-04-11',
  links: [
    { id: 'mbid:link-1', url: 'https://open.spotify.com/track/2d78J2bnQWINeQj4tk3Ix2' },
    { id: 'mbid:link-2', url: 'https://secondhandsongs.com/performance/420396' },
  ],
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/recordings/:recordingId" element={<RecordingDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RecordingDetailsPage', () => {
  beforeEach(() => {
    vi.mocked(musicBrainzProvider.findRecordingDetails).mockReset()
  })

  it('fetches details using only the recording ID from the route and renders title, release date, Recording ID, and links', async () => {
    vi.mocked(musicBrainzProvider.findRecordingDetails).mockResolvedValue(DETAILS)

    renderAt('/recordings/mbid%3A601a8791-3e90-49ea-884a-0b49bd5a38fd')

    expect(await screen.findByRole('heading', { name: 'A Blossom Fell' })).toBeInTheDocument()
    expect(screen.getByText('Release Date')).toBeInTheDocument()
    expect(screen.getByText('1955-04-11')).toBeInTheDocument()
    expect(screen.getByText('Recording ID')).toBeInTheDocument()
    expect(screen.getByText('mbid:601a8791-3e90-49ea-884a-0b49bd5a38fd')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'Spotify' })
    expect(link).toHaveAttribute('href', DETAILS.links[0].url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: 'SecondHandSongs' })).toHaveAttribute('href', DETAILS.links[1].url)
    expect(screen.getAllByRole('link')).toHaveLength(2)

    expect(vi.mocked(musicBrainzProvider.findRecordingDetails)).toHaveBeenCalledWith({
      id: 'mbid:601a8791-3e90-49ea-884a-0b49bd5a38fd',
      title: '',
      date: '',
    })
  })

  it('does not render a breadcrumb', async () => {
    vi.mocked(musicBrainzProvider.findRecordingDetails).mockResolvedValue(DETAILS)
    renderAt('/recordings/mbid%3A601a8791-3e90-49ea-884a-0b49bd5a38fd')

    await screen.findByRole('heading', { name: 'A Blossom Fell' })
    expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument()
  })

  it('omits the Release Date field when releaseDate is absent', async () => {
    vi.mocked(musicBrainzProvider.findRecordingDetails).mockResolvedValue({
      title: 'Untitled Session',
      links: [],
    })

    renderAt('/recordings/mbid%3Asome-id')

    await screen.findByRole('heading', { name: 'Untitled Session' })
    expect(screen.queryByText('Release Date')).not.toBeInTheDocument()
  })

  it('renders an unrecognized link as its raw URL, alongside recognized-service links', async () => {
    const unrecognizedUrl = 'https://example.com/some-recording'
    vi.mocked(musicBrainzProvider.findRecordingDetails).mockResolvedValue({
      title: 'A Blossom Fell',
      links: [...DETAILS.links, { id: 'mbid:link-3', url: unrecognizedUrl }],
    })

    renderAt('/recordings/mbid%3A601a8791-3e90-49ea-884a-0b49bd5a38fd')

    const link = await screen.findByRole('link', { name: unrecognizedUrl })
    expect(link).toHaveAttribute('href', unrecognizedUrl)
    expect(screen.getByRole('link', { name: 'Spotify' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('renders no links, without an error, when the links list is empty', async () => {
    vi.mocked(musicBrainzProvider.findRecordingDetails).mockResolvedValue({
      title: 'Untitled Session',
      links: [],
    })

    renderAt('/recordings/mbid%3Asome-id')

    await screen.findByRole('heading', { name: 'Untitled Session' })
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a general error page (with status and URL) when the MusicBrainz service is unreachable', async () => {
    vi.mocked(musicBrainzProvider.findRecordingDetails).mockRejectedValue(
      new MusicBrainzRequestError('boom', 'https://musicbrainz.org/ws/2/recording/x', 404),
    )

    renderAt('/recordings/mbid%3Adoes-not-exist')

    expect(
      await screen.findByText('Unable to reach the MusicBrainz service. (HTTP 404 at https://musicbrainz.org/ws/2/recording/x)'),
    ).toBeInTheDocument()
  })
})
