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

interface CatalogData {
  artist: Artist
  recordings: Recording[]
}

export function RecordingListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const resolved = resolveArtistQuery(searchParams)
  const artistName = resolved.ok ? resolved.artistName : null

  const [data, setData] = useState<CatalogData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (artistName === null) {
      return
    }

    let cancelled = false
    setData(null)
    setError(null)

    async function load() {
      try {
        const artists = await musicBrainzProvider.findArtists(artistName as string)
        if (artists.length === 0) {
          if (!cancelled) {
            setError(`Artist '${artistName}' was not found.`)
          }
          return
        }

        const recordings = await musicBrainzProvider.findRecordingsForArtist(artists[0])
        if (!cancelled) {
          setData({ artist: artists[0], recordings })
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatFetchError(err))
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

  if (error) {
    return <ErrorPage message={error} />
  }

  if (!data) {
    return (
      <div>
        <AppHeader />
      </div>
    )
  }

  const { artist, recordings } = data
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
