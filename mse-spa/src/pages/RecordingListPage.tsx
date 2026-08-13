import { Link, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Pagination } from '../components/Pagination'
import { pageCount, paginate } from '../lib/paginate'
import { resolveArtistQuery } from '../lib/resolveArtistQuery'
import { buildMockCatalog } from '../mocks/mockCatalog'
import { ErrorPage } from './ErrorPage'
import './RecordingListPage.css'

const PAGE_SIZE = 10

export function RecordingListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const resolved = resolveArtistQuery(searchParams)
  if (!resolved.ok) {
    return <ErrorPage message={resolved.message} />
  }

  const { artist, recordings } = buildMockCatalog(resolved.artistName)
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
        <div className="recording-list__info-box">
          <p className="recording-list__info-box-title">Mock Data</p>
          <p>Recordings shown here are sample data for demonstration purposes.</p>
        </div>
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
                  <Link to={`/recordings/${encodeURIComponent(recording.id)}`}>{recording.title}</Link>
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
