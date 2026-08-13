import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RecordingDetailsPage } from './RecordingDetailsPage'

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
  it('shows the title, Recording Date, and Recording ID for the recording matching the (percent-encoded) route id', () => {
    renderAt('/recordings/mock%3A1')

    expect(screen.getByRole('heading', { name: 'What a Wonderful World' })).toBeInTheDocument()
    expect(screen.getByText('Recording Date')).toBeInTheDocument()
    expect(screen.getByText('1967-09-07')).toBeInTheDocument()
    expect(screen.getByText('Recording ID')).toBeInTheDocument()
    expect(screen.getByText('mock:1')).toBeInTheDocument()
  })

  it('does not render a breadcrumb', () => {
    renderAt('/recordings/mock%3A1')

    expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument()
  })

  it('renders each mock recording link as an anchor whose text and href are both the link url', () => {
    renderAt('/recordings/mock%3A1')

    const link = screen.getByRole('link', { name: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC' })
    expect(link).toHaveAttribute('href', 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC')
    expect(screen.getAllByRole('link')).toHaveLength(6)
  })

  it('shows "Mock Provider" wording in the info boxes', () => {
    renderAt('/recordings/mock%3A1')

    expect(screen.getByText('Data from Mock Provider')).toBeInTheDocument()
    expect(screen.getByText('Links provided by Mock Provider')).toBeInTheDocument()
  })

  it('shows an error message for an unknown recording id', () => {
    renderAt('/recordings/mock%3Adoes-not-exist')

    expect(screen.getByText('Recording not found.')).toBeInTheDocument()
  })
})
