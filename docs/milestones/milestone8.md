# Milestone 8: Slider UI Alternative for "Static Assets" Deployment

The UI currently serving as the "front-end" for the Nathan Ross "static" website's primary page (i.e., a
transformation of the [Visual Chronology](../../docs/visual-chronology.md) document) needs improvement.
A single scrollable document with large, fixed-size images interspersed with plain text is not as readable,
interactive or modern as is desired. 

In this Milestone, we'd like to plan and implement an "Image Slider UI" alternative for viewing this chronology.
The user will continue to be able to scroll forward and backward across the images and related text using (for
example) the mouse or the left/right arrows. However, the user experience (UX) will feel more interactive, modern
and integrated.  

## Designing and Planning for Implementation

A concrete, detailed and validated plan MUST be created before implementation begins. 

I'm proposing to create and leverage an alternate version of the [render.mjs](../../static/scripts/render.mjs)
transformer used to generate the HTML used for the current UI.  A separate (version of that) script would be
used to generate alternate HTML (and necessary subordinate artifacts) supporting the alternate UX depicted for
this Milestone, to be made available to the end-user through its own URL path.

See some online examples such as (but not exclusively) those below to get an idea of what looks good.  Use
these to get a feel for the proposed UX and to help deduce hints for implementing its UI cleanly and efficiently.

- [Carousel Fan-out](https://collectui.com/designs/image-slider-ui-design-inspiration/9f9852a7-5b38-4325-a882-7a6b21f59efb)
- [Coverflow Carousel](https://21st.dev/@ruixen.ui/components/coverflow-carousel)

A single image should always be in focus within a suggestive contextual view of its previous and next "siblings".
For example, the previous / next images could be displayed as rotated or projected in 3-d "angles" as though in a
"carousel," as modeled in the online examples linked above.  In these example carousel cases (depicted above), it's
imagined the user can "scroll" in either direction within the carousel using either the mouse (e.g., swipe left/right
or use the scroll wheel), or by using the left/right arrows on the keyboard.

Also:
- Mandatory: the text related to the image in focus is displayed along with the image in focus.
- Desired: the text area is also scrollable and kept in sync with the image in focus.  The user can "scroll"
  forwards and backwards by interacting with either the text area or the image carousel.
- Desired: the standard, reduced-side images seen in the carousel can be enlarged to their full size e.g., 
  when the user clicks on the image, or maybe even when the user hovers over the image in focus.
