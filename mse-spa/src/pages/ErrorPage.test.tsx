import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorPage } from './ErrorPage'

describe('ErrorPage', () => {
  it('renders the given error message', () => {
    render(<ErrorPage message="No artist name was specified." />)
    expect(screen.getByText('No artist name was specified.')).toBeInTheDocument()
  })

  it('renders the shared application header', () => {
    render(<ErrorPage message="No artist name was specified." />)
    expect(screen.getByText('Music Session Explorer')).toBeInTheDocument()
  })
})
