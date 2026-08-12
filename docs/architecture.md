# Architecture

## Goal

This repository produces two deployable web artifacts that together let a visitor look up a
musician (initially "Nathan Ross") and explore the recording sessions he contributed to,
each linking out to external sources (e.g., streaming, discography sites) for further detail.
See the [README](../README.md) for the project's motivation and background.

## Components

The system is composed of two independently deployed components, both published as
subfolders of the external [noodnik2 GitHub Pages](https://github.com/noodnik2/noodnik2.github.io)
site:

- **Static Assets** — the "Nathan Ross" front-end pages (biography, images, chronology) that
  link into the MSE, passing the artist name as an invocation parameter.
  See [Static Assets](./static-assets.md) for its deployment target and conformance requirements.
- **Music Session Explorer (MSE)** — a Vite + React + TypeScript SPA that takes an artist name
  and displays a browsable list of recordings, drilling down into external links per recording.
  See [Music Session Explorer SPA](./music-session-explorer-spa.md) for its user experience,
  technical stack, and UI conformance target.

The Static Assets invoke the MSE by URL parameter; there is no other coupling between the two
components, and each has its own build/deploy path (see [Developer Notes](./developer-notes.md)
for Makefile-driven build/deploy conventions and source folder layout).

## MSE Internal Design

The MSE owns a provider-agnostic domain model — the Music Catalog Domain (MCD) — so that its UI
and API layers never depend on the shape of any specific external data source. Entities
(`Artist`, `Recording`, `RecordingLink`, ...) and the `Provider`/`ProviderFactory` interfaces
that populate them from external services are fully specified in
[the MCD model](./models/mse-model.md); consult it when adding or modifying domain entities,
provider interfaces, or the entity-ID scheme.

The only Provider implemented (or currently planned as first) is MusicBrainz. Its mapping from
MCD entities to MusicBrainz API calls and JSON responses is specified in
[the MusicBrainz Provider doc](./providers/musicbrainz/client.md); the underlying HTTP call
mechanics (rate-limiting, User-Agent, search/lookup/relationship traversal) are handled by the
`musicbrainz-api` skill referenced from that doc, not reimplemented here.

## Repository Layout

Source folders and their roles are enumerated in [Developer Notes](./developer-notes.md#source-folders);
consult that document (rather than this one) for what belongs where (`mse-spa`, `packages`,
`static`, `cmd`, `notebooks`) and for source-control and deployment workflow conventions.

## Process

Development proceeds by incremental, independently-deployable Milestones — see
[Milestones](./milestones.md) for the current sequencing and scope of each — implemented under a
strict [Test Driven Development](./test-driven-development.md) workflow. Design changes
(including changes to this document) are expected to precede implementation for each Milestone,
per [Developer Notes](./developer-notes.md#plan-the-design-first).

## Status

This document describes the intended architecture the Milestones are building toward, not
necessarily what's implemented yet. For current implementation status, see
[Milestones](./milestones.md) and [TODOs](./todo-list.md) — don't infer status from this doc.
