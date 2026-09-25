import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  it('renders the application brand name', () => {
    render(<AppHeader />)
    expect(screen.getByText('Music Session Explorer')).toBeInTheDocument()
  })

  it('renders a breadcrumb when one is given', () => {
    render(<AppHeader breadcrumb="Helen Sight / Recordings" />)
    expect(screen.getByText('Helen Sight / Recordings')).toBeInTheDocument()
  })

  it('renders no breadcrumb region when none is given', () => {
    render(<AppHeader />)
    expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument()
  })
})
