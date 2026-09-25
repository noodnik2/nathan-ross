import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Pagination } from '../components/Pagination'
import type { Artist, Recording } from '../domain/types'
import { formatFetchError } from '../lib/formatFetchError'
import { pageCount, paginate } from '../lib/paginate'
import { resolveArtistQuery } from '../lib/resolveArtistQuery'
import { musicBrainzProvider } from '../providers/musicbrainz/MusicBrainzProvider'
import { ErrorPage } from './ErrorPage'
import './RecordingListPage.css'

const PAGE_SIZE = 10

type LoadState =
  | { phase: 'searching-artist' }
  | { phase: 'loading-recordings'; artist: Artist }
  | { phase: 'ready'; artist: Artist; recordings: Recording[] }
  | { phase: 'error'; message: string }

function RecordingListSkeleton() {
  return (
    <table aria-hidden="true">
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Recording Date</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <tr key={index} className="recording-list__skeleton-row" data-testid="recording-list-skeleton-row">
            <td>
              <span className="recording-list__skeleton-bar" />
            </td>
            <td>
              <span className="recording-list__skeleton-bar" />
            </td>
            <td>
              <span className="recording-list__skeleton-bar" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function RecordingListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const resolved = resolveArtistQuery(searchParams)
  const artistName = resolved.ok ? resolved.artistName : null

  const [state, setState] = useState<LoadState>({ phase: 'searching-artist' })

  useEffect(() => {
    if (artistName === null) {
      return
    }

    let cancelled = false
    setState({ phase: 'searching-artist' })

    async function load() {
      try {
        const artists = await musicBrainzProvider.findArtists(artistName as string)
        if (artists.length === 0) {
          if (!cancelled) {
            setState({ phase: 'error', message: `Artist '${artistName}' was not found.` })
          }
          return
        }

        if (cancelled) {
          return
        }
        setState({ phase: 'loading-recordings', artist: artists[0] })

        const recordings = await musicBrainzProvider.findRecordingsForArtist(artists[0])
        if (!cancelled) {
          setState({ phase: 'ready', artist: artists[0], recordings })
        }
      } catch (err) {
        if (!cancelled) {
          setState({ phase: 'error', message: formatFetchError(err) })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [artistName])

  if (!resolved.ok) {
    return <ErrorPage message={resolved.message} />
  }

  if (state.phase === 'error') {
    return <ErrorPage message={state.message} />
  }

  if (state.phase === 'searching-artist') {
    return (
      <div>
        <AppHeader />
        <main className="recording-list">
          <p className="recording-list__status" role="status">
            Finding artist…
          </p>
        </main>
      </div>
    )
  }

  if (state.phase === 'loading-recordings') {
    return (
      <div>
        <AppHeader breadcrumb={`${state.artist.name} / Recordings`} />
        <main className="recording-list">
          <h1>Recordings by {state.artist.name}</h1>
          <p className="recording-list__status" role="status">
            Loading recordings…
          </p>
          <RecordingListSkeleton />
        </main>
      </div>
    )
  }

  const { artist, recordings } = state
  const totalPages = pageCount(recordings.length, PAGE_SIZE)
  const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1
  const visibleRecordings = paginate(recordings, currentPage, PAGE_SIZE)
  const firstRowNumber = (currentPage - 1) * PAGE_SIZE + 1
  const lastRowNumber = firstRowNumber + visibleRecordings.length - 1

  function handlePageChange(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(page))
      return next
    })
  }

  return (
    <div>
      <AppHeader breadcrumb={`${artist.name} / Recordings`} />
      <main className="recording-list">
        <h1>Recordings by {artist.name}</h1>
        <p className="recording-list__summary">
          Showing {firstRowNumber}-{lastRowNumber} of {recordings.length} recordings
        </p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Recording Date</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecordings.map((recording, index) => (
              <tr key={recording.id}>
                <td>{firstRowNumber + index}</td>
                <td>
                  <Link
                    to={`/recordings/${encodeURIComponent(recording.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {recording.title}
                  </Link>
                </td>
                <td>{recording.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} pageCount={totalPages} onPageChange={handlePageChange} />
      </main>
    </div>
  )
}
