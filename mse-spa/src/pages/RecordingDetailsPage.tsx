import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { ServiceIcon } from '../components/ServiceIcon'
import type { RecordingDetails } from '../domain/types'
import { formatFetchError } from '../lib/formatFetchError'
import { matchKnownService } from '../lib/knownServices'
import { musicBrainzProvider } from '../providers/musicbrainz/MusicBrainzProvider'
import { ErrorPage } from './ErrorPage'
import './RecordingDetailsPage.css'

const SKELETON_FIELD_COUNT = 2
const SKELETON_LINK_COUNT = 6

function RecordingDetailsSkeleton() {
  return (
    <main className="recording-details" aria-hidden="true">
      <span className="recording-details__skeleton-bar recording-details__skeleton-title" />
      <div className="recording-details__grid">
        <section>
          <dl className="recording-details__fields">
            {Array.from({ length: SKELETON_FIELD_COUNT }, (_, index) => (
              <div key={index} className="recording-details__field" data-testid="recording-details-skeleton-field">
                <span className="recording-details__skeleton-bar" />
              </div>
            ))}
          </dl>
        </section>
        <aside>
          <h2>Listen / View on</h2>
          <ul className="recording-details__links">
            {Array.from({ length: SKELETON_LINK_COUNT }, (_, index) => (
              <li key={index} data-testid="recording-details-skeleton-link">
                <span className="recording-details__skeleton-bar" />
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  )
}

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
        <p className="recording-details__status" role="status">
          Loading recording…
        </p>
        <RecordingDetailsSkeleton />
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
              {details.links.map((link) => {
                const service = matchKnownService(link.url)
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="recording-details__link"
                    >
                      {service ? (
                        <>
                          <ServiceIcon serviceId={service.id} />
                          <span>{service.name}</span>
                        </>
                      ) : (
                        link.url
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}
