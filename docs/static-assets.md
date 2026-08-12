# Static Assets

The source static assets serving as the "front-end" for the Nathan Ross website are stored in the
[static](../static) folder and will be deployed as a separate page within the
[noodnik2 GitHub Pages](https://github.com/noodnik2/noodnik2.github.io)
website.

The connection between the "Nathan Ross" (i.e., static) web pages and the Music Session Explorer (MSE)
web application is established by the use of the query string "Nathan Ross" in the URL to invoke the
MSE web application.

## Technical Details

The main "Nathan Ross" website will (at least initially) be hosted for access by its end users
as a separate page within the existing GitHub Pages site whose source code is located at
https://github.com/noodnik2/noodnik2.github.io. Accordingly, only the static assets
can be deployed there.

### Conformance

The Nathan Ross static website must strictly follow the patterns and leverage the technology already
established within the target GitHub pages repository.  See the
[Technical Summary](https://github.com/noodnik2/noodnik2.github.io/blob/main/docs/technical-summary.md)
file for details.

### Build and Deployment

Both the build and deployment actions can be invoked by developers using standard Makefile targets.

## User Experience

End users will access the Nathan Ross web pages at https://noodnik2.github.io/nathan-ross.
