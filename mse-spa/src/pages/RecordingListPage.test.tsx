import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RecordingListPage } from './RecordingListPage'

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
  it('shows the recording list heading and first page of recordings for a found artist', () => {
    renderAt('/?artist=Helen+Sight')

    expect(screen.getByRole('heading', { name: 'Recordings by Helen Sight' })).toBeInTheDocument()
    expect(screen.getByText('What a Wonderful World')).toBeInTheDocument()
    expect(screen.getByText('Dream a Little Dream of Me')).toBeInTheDocument()
    expect(screen.queryByText('Stardust')).not.toBeInTheDocument()
  })

  it('advances to the next page of recordings and updates the page query param when Next is clicked', async () => {
    renderAt('/?artist=Helen+Sight')

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Stardust')).toBeInTheDocument()
    expect(screen.queryByText('What a Wonderful World')).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('page=2')
  })

  it('reproduces page 2 directly when loaded at a URL with page=2', () => {
    renderAt('/?artist=Helen+Sight&page=2')

    expect(screen.getByText('Stardust')).toBeInTheDocument()
    expect(screen.queryByText('What a Wonderful World')).not.toBeInTheDocument()
  })

  it('shows the "no artist" error page when the artist param is missing', () => {
    renderAt('/')

    expect(screen.getByText('No artist name was specified.')).toBeInTheDocument()
  })

  it('shows the "not found" error page for the simulated "Phil Inblank" case', () => {
    renderAt('/?artist=Phil+Inblank')

    expect(screen.getByText("Artist 'Phil Inblank' was not found.")).toBeInTheDocument()
  })
})
