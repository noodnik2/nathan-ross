import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('routes the home page to the recording list for a given artist', () => {
    window.history.pushState({}, '', '/?artist=Test+Artist')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Recordings by Test Artist' })).toBeInTheDocument()
  })

  it('routes the home page to the error page when no artist is given', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByText('No artist name was specified.')).toBeInTheDocument()
  })
})
