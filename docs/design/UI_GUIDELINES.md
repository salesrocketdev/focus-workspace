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
