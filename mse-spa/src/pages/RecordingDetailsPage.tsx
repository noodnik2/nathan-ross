import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import type { RecordingDetails } from '../domain/types'
import { formatFetchError } from '../lib/formatFetchError'
import { musicBrainzProvider } from '../providers/musicbrainz/MusicBrainzProvider'
import { ErrorPage } from './ErrorPage'
import './RecordingDetailsPage.css'

export function RecordingDetailsPage() {
  const { recordingId } = useParams()
  const id = decodeURIComponent(recordingId ?? '')

  const [details, setDetails] = useState<RecordingDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setDetails(null)
    setError(null)

    async function load() {
      try {
        const result = await musicBrainzProvider.findRecordingDetails({ id, title: '', date: '' })
        if (!cancelled) {
          setDetails(result)
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
  }, [id])

  if (error) {
    return <ErrorPage message={error} />
  }

  if (!details) {
    return (
      <div>
        <AppHeader />
      </div>
    )
  }

  return (
    <div>
      <AppHeader />
      <main className="recording-details">
        <h1>{details.title}</h1>
        <div className="recording-details__grid">
          <section>
            <dl className="recording-details__fields">
              {details.releaseDate && (
                <div className="recording-details__field">
                  <dt>Release Date</dt>
                  <dd>{details.releaseDate}</dd>
                </div>
              )}
              <div className="recording-details__field">
                <dt>Recording ID</dt>
                <dd>{id}</dd>
              </div>
            </dl>
          </section>
          <aside>
            <h2>Listen / View on</h2>
            <ul className="recording-details__links">
              {details.links.map((link) => (
                <li key={link.id}>
                  <a href={link.url}>{link.url}</a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}
