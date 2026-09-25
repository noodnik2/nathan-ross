import { AppHeader } from '../components/AppHeader'
import './ErrorPage.css'

interface ErrorPageProps {
  message: string
}

export function ErrorPage({ message }: ErrorPageProps) {
  return (
    <div>
      <AppHeader />
      <main className="error-page">
        <p role="alert" className="error-page__message">
          {message}
        </p>
      </main>
    </div>
  )
}
