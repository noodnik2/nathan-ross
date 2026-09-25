import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { KnownServiceId } from '../lib/knownServices'
import { ServiceIcon } from './ServiceIcon'

const SERVICE_IDS: KnownServiceId[] = ['spotify', 'apple-music', 'youtube', 'deezer', 'secondhandsongs', 'discogs']

describe('ServiceIcon', () => {
  it.each(SERVICE_IDS)('renders a decorative svg icon for %s', (serviceId) => {
    const { container } = render(<ServiceIcon serviceId={serviceId} />)

    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
