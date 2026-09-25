import type { ReactNode } from 'react'
import type { KnownServiceId } from '../lib/knownServices'

interface ServiceIconProps {
  serviceId: KnownServiceId
}

const ICON_PATHS: Record<KnownServiceId, { fill: string; children: ReactNode }> = {
  spotify: {
    fill: '#1DB954',
    children: <path d="M6 10.5c3-1 7-.6 9.5 1M6 13c2.5-.8 6-.5 8 .8M6 15.3c2-.6 4.8-.4 6.6.7" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />,
  },
  'apple-music': {
    fill: '#FA243C',
    children: <path d="M14 5.5v8.3a2.6 2.6 0 1 1-1.4-2.3V8.4L9 9.3v4.5a2.6 2.6 0 1 1-1.4-2.3V7.3L14 5.5Z" fill="#fff" />,
  },
  youtube: {
    fill: '#FF0000',
    children: <path d="M9 7.5 15 11l-6 3.5v-7Z" fill="#fff" />,
  },
  deezer: {
    fill: '#000000',
    children: <path d="M4.5 14h2v2h-2v-2Zm3.4-1.5h2V16h-2v-3.5Zm3.4-1.5h2v5h-2v-5Zm3.4-2h2v7h-2v-7Zm3.4-2h2v9h-2V7Z" fill="#fff" />,
  },
  secondhandsongs: {
    fill: '#3B6FE0',
    children: (
      <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
        S
      </text>
    ),
  },
  discogs: {
    fill: '#000000',
    children: <circle cx="10" cy="10" r="3.2" fill="#fff" stroke="#000" strokeWidth="1" />,
  },
}

export function ServiceIcon({ serviceId }: ServiceIconProps) {
  const { fill, children } = ICON_PATHS[serviceId]
  return (
    <svg
      className="service-icon"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10" cy="10" r="10" fill={fill} />
      {children}
    </svg>
  )
}
