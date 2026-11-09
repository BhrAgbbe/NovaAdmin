# Admin Figma handoff

One route and set of screen components represents each locale, theme, and request state. The native frame definitions supplied measurements and the original SVG geometry. Representative screenshots were captured from the running app against the exact Figma fixture imagery.

| Figma section            | Frames | Web mapping                                                                                 |
| ------------------------ | -----: | ------------------------------------------------------------------------------------------- |
| Core journey · FA        |      5 | `/login`, `/products`, `/users`, `/products/new`, `/users/new`                              |
| Sign-in feedback         |      3 | Required-field, invalid-credentials, and submitting states on `/login`                      |
| Search and list feedback |     12 | Search match, no match, loading, empty dataset, fetch error, and created state on each list |
| Create form feedback     |      6 | Validation, pending, and submission failure on each create route                            |
| English · LTR            |      5 | The core five routes with English dictionary and left-to-right layout                       |
| Dark · FA                |      5 | The core five routes with the dark palette                                                  |

The visual target is 1440px wide. The layout was also checked at 1280px. The Figma Starter tool limit blocked connector extraction, so implementation used the approved Desktop handoff. Representative visual checks do not constitute a pixel-diff certification of every frame.
