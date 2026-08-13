import { useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { buildMockRecordingLinks, findMockRecordingById } from '../mocks/mockCatalog'
import { ErrorPage } from './ErrorPage'
import './RecordingDetailsPage.css'

export function RecordingDetailsPage() {
  const { recordingId } = useParams()
  const recording = findMockRecordingById(decodeURIComponent(recordingId ?? ''))

  if (!recording) {
    return <ErrorPage message="Recording not found." />
  }

  const links = buildMockRecordingLinks()

  return (
    <div>
      <AppHeader />
      <main className="recording-details">
        <h1>{recording.title}</h1>
        <div className="recording-details__grid">
          <section>
            <dl className="recording-details__fields">
              <div className="recording-details__field">
                <dt>Recording Date</dt>
                <dd>{recording.date}</dd>
              </div>
              <div className="recording-details__field">
                <dt>Recording ID</dt>
                <dd>{recording.id}</dd>
              </div>
            </dl>
            <div className="recording-details__info-box">
              <p className="recording-details__info-box-title">Data from Mock Provider</p>
              <p>Recording dates reflect known sessions and database information.</p>
            </div>
          </section>
          <aside>
            <h2>Listen / View on</h2>
            <ul className="recording-details__links">
              {links.map((link) => (
                <li key={link.id}>
                  <a href={link.url}>{link.url}</a>
                </li>
              ))}
            </ul>
            <div className="recording-details__info-box">
              <p className="recording-details__info-box-title">Links provided by Mock Provider</p>
              <p>Availability may vary by region.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
