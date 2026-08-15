# Changelog

Important changes reflected by evolution of this repository will be documented here
using the format suggested by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]
### Added
- Initial project structure configuration.
- Music Session Explorer "recording list" home page: users can browse a paginated list of mock
  recordings for an artist specified via the `artist` URL query parameter, with an error page shown
  when no artist is given or the artist is not found.
- Music Session Explorer "recording details" page: clicking a recording title in the recording list
  navigates to a details page showing the recording's own title, date, and ID, along with a mocked
  list of "Listen / View on" links.
- Music Session Explorer "recording list" page now fetches real data from the MusicBrainz web service
  instead of a mock catalog: searching for the artist given via the `artist` URL query parameter, then
  listing the recordings they're credited on as an instrument performer. Shows the "not found" error
  page when MusicBrainz has no matching artist, or a general error page when the MusicBrainz service
  can't be reached.
- Music Session Explorer "recording details" page now fetches real data from the MusicBrainz web service
  instead of a mock catalog: showing the recording's title, release date (when known), and "Listen / View
  on" links. The page now resolves entirely from the recording ID in its own URL, so it no longer depends
  on having come from the recording list page — it also works on a direct visit or a page refresh.
- Music Session Explorer "recording details" page now shows each recognized "Listen / View on" link
  (Spotify, Apple Music, YouTube, Deezer, SecondHandSongs, Discogs) as a service icon and name instead
  of the raw URL; links to any other service still show as their raw URL. The application's
  browser-tab icon was also replaced with one designed for the MSE application, in place of the
  default Vite scaffold icon.

### Changed
- Switched client-side routing from `react-router-dom`'s `BrowserRouter` to `HashRouter` (routes now
  live after a `#`, e.g. `.../music-session-explorer/#/recordings/<id>`). GitHub Pages has no
  server-side routing support, so a direct load, refresh, or new-tab open of a recording details URL
  under `BrowserRouter` 404'd; `HashRouter` avoids the problem entirely since the hash portion of a
  URL is never sent to the server. The artist-name invocation parameter now lives inside the hash too
  (e.g. `.../music-session-explorer/#/?artist=<name>`).
