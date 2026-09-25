import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders a button for every page', () => {
    render(<Pagination currentPage={1} pageCount={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })

  it('marks the current page', () => {
    render(<Pagination currentPage={2} pageCount={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
  })

  it('disables Previous on the first page', () => {
    render(<Pagination currentPage={1} pageCount={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  })

  it('disables Next on the last page', () => {
    render(<Pagination currentPage={3} pageCount={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('calls onPageChange with the next page number when Next is clicked', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} pageCount={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with the previous page number when Previous is clicked', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={2} pageCount={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with the clicked page number', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} pageCount={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination currentPage={1} pageCount={1} onPageChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
