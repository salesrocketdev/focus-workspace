# UI guidelines — approved concept V4

## Direction
Warm minimalism, inspired by the approved fourth mockup: warm off-white canvas, subtly elevated cream cards, burnt-orange accent, quiet pastel categories. Desktop sidebar with Today, Calendar, Activities, History/Insights, Settings; connection status at bottom. Top title/date and Edit panel. Avoid heavy borders, saturated gradients, dense admin charts and forced illustrations. Brand name/logo in concept (Focora) are provisional.

## Proposed design tokens
| Token | Value |
|---|---|
| canvas | #F6F1EB |
| surface | #FFFCF9 |
| elevated | #FFFFFF |
| border | #E8E0D8 |
| text | #272320 |
| muted | #80746D |
| accent decorative | #DF702C |
| primary action | #B94A16 |
| accent soft | #FBE4D3 |
| green | #83AE8F |
| lavender | #ADA0CD |
| blue | #8BAACB |
| peach | #E9AE90 |

Tokens are proposed, not sampled exactly. Use dark foreground on pastel backgrounds; white text on action orange must pass contrast verification. WCAG AA target, visible focus, reduced motion, semantic labels and non-color status indicators. Inter UI; tabular numerals or Geist Mono for timer. Lucide icons. 4/8px spacing scale, 8/12/16px radii, 16px widget gap desktop, 12px mobile. Touch controls target 44px. Theme light first; dark/system later. Avoid generic neon dashboard aesthetic.

## Layout and state
Desktop: sidebar collapsible, header date/actions, flexible grid. Mobile: bottom nav, stacked or two-column compact cards, large primary actions, safe-area padding. Native window can be narrow; treat container size, not user-agent, as layout input. Provide loading skeleton, empty helpful CTA, inline recoverable error and offline/stale label; no perpetual spinners. Active timer stays visible across routes. Illustration in immersive focus is optional, decorative and must not obscure controls. No mock book covers or provider logos shipped without appropriate rights.


## Shared page header
All standard workspace routes (Today, Calendar, Activities, History, Settings, Dashboard editor) use the same PageHeader and top-anchored content shell. The title must have the same x/y origin and typography at each fixed viewport; actions may wrap onto another row without moving the title. On mobile, the masthead stays present in the editor, matching normal routes. The immersive focus view intentionally retains its own compact toolbar from V4 because it is a distraction-free mode, not a regular workspace route. Its title is still semantic and top anchored. Do not vertically center short route content. Validate header coordinates on desktop, tablet and phone in Playwright.

## Iconography and provider assets
Functional UI uses Lucide, normally 16px card / 18px navigation / 20px mobile navigation with 1.8 stroke. Brand marks use a separate ProviderIcon registry with local SVG assets, fixed square contain boxes, original colors and adjacent service labels. Use Google Calendar for calendar events, never Gmail. Gmail, Meet and Teams are reference assets only; do not imply email or video integrations. Spotify music remains a simulation. The V4 references use legacy Google Calendar/Gmail/Meet and Outlook icon generations; preserve those in the mockup rather than mix versions indiscriminately. Verify current brand permissions and approved artwork before public product release; trademarks are not covered by project MIT. See [provider asset notes](../../prototypes/ui/src/assets/providers/README.md).

## Form, dialog and typography primitives
Use the locally bundled Inter Variable font rather than OS-dependent fallback for visual review. Shared Button/Field/SelectField/Dialog/Notice components set text button heights (36px desktop, 40px mobile), fields (42px/44px), and 44px mobile dialog actions. Use native dialog for focus containment, Escape and restore focus to opener. Keep field labels, hints and native constraints visible; do not silently save invalid reading progress. Illustrative book and music artwork is original SVG scenery, not actual publisher or album art. Use a quiet warm surface, subtle shadows and tabular timer digits.

## V4.14 form controls
Use shared Field, SearchField, TextareaField and SelectField (select-only combobox) rather than native-looking dropdowns. Menus have selected checkmark, keyboard active item, viewport-aware placement and top-layer popover where supported. Controls remain 42px desktop / 44px mobile; compact filters 36px / 40px. Preserve native input validation and labels. ToggleCard represents a persistent binary preference, with full-card activation, role switch, description and animated track; use regular checkboxes for checklist completion and independent calendar filters. Motion follows global accessibility settings. All palettes use semantic form tokens and no new dependencies. Dropdowns may scroll when long; dashboard widgets must not.

## Mobile ergonomics (V4.18)
Prefer 44px touch targets for primary controls; compact widget header exceptions may be narrower to preserve content. Keep bottom navigation available with safe-area inset and reserve page space; reset scroll when navigating between pages. Mobile dialogs use bottom-sheet presentation with native focus semantics and content scrolling when needed. Text inputs use at least 16px on mobile to avoid Safari focus zoom; selects keep custom options. The mobile layout editor uses explicit move buttons, no decorative drag grip, and a single save action. Weekly calendar displays per-day event counts even when event cards are hidden. Test narrow widths and reduced motion; actual iPhone Safari/installed PWA remains a separate release gate.