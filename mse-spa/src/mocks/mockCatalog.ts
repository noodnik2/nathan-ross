import type { Artist, Recording } from '../domain/types'

const MOCK_RECORDINGS: Recording[] = [
  { id: 'mock:1', title: 'What a Wonderful World', date: '1967-09-07' },
  { id: 'mock:2', title: 'Hello, Dolly!', date: '1964-02-25' },
  { id: 'mock:3', title: 'Mack the Knife', date: '1960-07-25' },
  { id: 'mock:4', title: 'La Vie En Rose', date: '1950-12-04' },
  { id: 'mock:5', title: 'Go Down Moses', date: '1958-10-29' },
  { id: 'mock:6', title: 'St. Louis Blues', date: '1925-11-26' },
  { id: 'mock:7', title: 'When the Saints Go Marching In', date: '1923-04-23' },
  { id: 'mock:8', title: 'Jeepers Creepers', date: '1926-11-15' },
  { id: 'mock:9', title: 'Basin Street Blues', date: '1928-12-04' },
  { id: 'mock:10', title: 'Dream a Little Dream of Me', date: '1931-01-19' },
  { id: 'mock:11', title: 'Stardust', date: '1931-11-04' },
  { id: 'mock:12', title: 'On the Sunny Side of the Street', date: '1934-11-07' },
  { id: 'mock:13', title: 'I Get a Kick Out of You', date: '1935-05-21' },
  { id: 'mock:14', title: 'Cheek to Cheek', date: '1936-02-13' },
  { id: 'mock:15', title: 'Pennies from Heaven', date: '1936-10-27' },
  { id: 'mock:16', title: 'A Kiss to Build a Dream On', date: '1951-08-14' },
  { id: 'mock:17', title: 'Blueberry Hill', date: '1949-10-06' },
  { id: 'mock:18', title: 'That Lucky Old Sun', date: '1949-11-15' },
  { id: 'mock:19', title: 'Cool Yule', date: '1953-10-30' },
  { id: 'mock:20', title: 'Summer Song', date: '1955-06-01' },
  { id: 'mock:21', title: 'Mame', date: '1966-04-19' },
  { id: 'mock:22', title: 'Cabaret', date: '1967-01-10' },
  { id: 'mock:23', title: 'Sunny Side of the Street (Live)', date: '1962-05-18' },
  { id: 'mock:24', title: 'Wonderful Town', date: '1957-03-22' },
  { id: 'mock:25', title: 'Ramona', date: '1954-08-09' },
]

export function buildMockCatalog(artistName: string): { artist: Artist; recordings: Recording[] } {
  const artist: Artist = {
    id: `mock:${artistName.trim().toLowerCase().replace(/\s+/g, '-')}`,
    name: artistName,
  }
  return { artist, recordings: MOCK_RECORDINGS }
}
