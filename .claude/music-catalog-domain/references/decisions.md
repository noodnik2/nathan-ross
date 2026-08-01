# Project Decisions

This file contains the decisions made during the project.

Each decision is recorded in the form of a markdown bullet point,
in a section headed with the decision's date and the decision's author.

## 2026-07-31 noodnik2

Decision made to create this file used to store decisions made during the project.

## 2026-07-31 ChatGPT

See [relevant conversation](https://chatgpt.com/c/6a6a3682-a7a0-83ea-b892-39bf1149828f).

### Model Independence

The application's canonical domain model is independent of MusicBrainz.

React components consume domain entities only.

MusicBrainz is the first implementation of RecordingProvider.

RecordingLinkProvider initially exposes only MusicBrainz URL relationships.

Do not attempt heuristic Apple/Spotify searches until after the MVP.

### ADR-001

The canonical identifier exposed by RecordingProvider is `id`.

Initially

- `id == mbid`

This is intentional so the application can later migrate to a local database without changing React components.

### ADR-007

Do not attempt Spotify or Apple search heuristics until after the MVP.

The MVP uses only MusicBrainz URL relationships.
