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
