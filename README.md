# Nathan Ross Site Builder

This repository contains the code and assets used to build and deploy a tribute website for Nathan Ross.

## Motivation

A son of Nathan Ross would like to create a website to help others (mainly other family members
and more distant relatives) to recall and continue to celebrate his life and works.

## Deployment Targets

Makefile targets are provided to carry out deployment to publicly available URLs:

1. Nathan's [visual chronology](./docs/visual-chronology.md) source document, deployed in two flavors:
   - As a [scrollable document](https://noodnik2.github.io/nathan-ross)
   - In a ["Carousel" Single Page Application (SPA)](https://noodnik2.github.io/nathan-ross/carousel)
2. The [Music Session Explorer](https://noodnik2.github.io/music-session-explorer/#/?artist=Nathan+Ross)
   to retrieve recording sessions in which Nathan participated.

## Components

The website comprises several components, as described briefly below, and in more detail in the
[Architecture](./docs/architecture.md) document.

### Visual Chronology

The main theme of the project is a Visual Chronology used to tell Nathan's story through a series of photographs
collected by his family or from his personal memoirs.  The driving source document of this chronology is the
[docs/visual-chronology](./docs/visual-chronology.md) Markdown file, written in GitHub-compatible Markdown. 

Two main modes of viewing the Chronology in the website are:

#### Scrollable Document

The chronology markdown gets [compiled](static/scripts/render.mjs) into an `index.html` file
at the base URL, and is viewable as a standard, scrollable document.

#### Carousel

This alternate viewing mode renders a swipeable slide deck at the `/carousel` relative URL path in which
the user can scroll back and forth through the chronology to see each picture (slide) and its corresponding
text.  The scrolling can be done either through the text area or through the slides.

The [Carousel](./static/nathan-ross/carousel/README.md) is implemented in its own separate single page
application (SPA) that runs in the user's browser.

### Music Session Explorer

Implemented in its own React Single Page Application (SPA), the [Music Session Explorer](./docs/music-session-explorer-spa.md)
component features a list of recordings by Nathan.  Selecting any recording opens a list of external links where
you can listen to the track and find more information.

## Building and Deployment

The various `Makefile`s at each level of the source tree provide the standard tooling used during the
development and deployment workflow.  Running the `make` or `make help` command in each will bring up
the list of valid targets for each.

## Inspiration & Planning

- See [this ChatGPT](https://chatgpt.com/c/6a6a3682-a7a0-83ea-b892-39bf1149828f) conversation.

## Resources

### Data Sources

To find recordings in which Nate was involved, the following sources have been identified:

- [MusicBrainz](https://musicbrainz.org/doc/Development)
  - [Online API](https://musicbrainz.org/doc/MusicBrainz_API) 
  - [Database Dumps](https://data.metabrainz.org/pub/musicbrainz/data/fullexport)
  - [Database Documentation](https://musicbrainz.org/doc/MusicBrainz_Database)
  - [Covert Art Archive](https://coverartarchive.org/)
    - [Online API](https://musicbrainz.org/doc/Cover_Art_Archive/API)
- [Discogs](https://www.discogs.com/)

### Other Relevant Sites

- Nathan Ross
    - [Discogs](https://www.discogs.com/artist/398631-Nathan-Ross?superFilter=Instruments+%26+Performance)
    - [IMDb](https://www.imdb.com/name/nm18499813/)
    - [Nat King Cole Discography](http://apileocole.alongthehall.com/sessions/session1958.html)
- [Glenn Dicterow Website](https://www.glenndicterow.com/)
- [Dicterow Family](https://benningviolins.com/the-dicterow-family-of-violinists/)
- [Harold Dicterow Epitaph](https://www.latimes.com/archives/la-xpm-2000-dec-01-me-59849-story.html)
  - [Discogs](https://www.discogs.com/artist/657000-Harold-Dicterow?srsltid=AfmBOoqUyqtGmMrcbiR7Y_uicBEZJLkzTZ-6pVq0xKbMSoRaQgcTh3l5)
- [Isaac Stern Wikipedia](https://en.wikipedia.org/wiki/Isaac_Stern)
