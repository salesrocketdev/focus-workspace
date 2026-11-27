# V4 prototype acceptance checklist

Scope: prototypes/ui only. Product implementation stays in M1–M7. Reference: #1, #3, #28–33.

## Automated evidence
- Typecheck, Vite build, Storybook build, Playwright Chromium desktop/mobile and iPhone-sized WebKit.
- Published subpath build tested offline (separate production preview).
- Dashboard/editor, timer recovery, cross-tab writer, calendar, activities, mock books, filters and charts, preferences, notifications, audio, JSON backup/CSV.
- V4.34 adds keyboard skip/navigation, named progress, dialog focus restoration, narrow settings/route geometry and screenshots. CI must pass on the final candidate; artifacts are evidence, not human visual approval.

## Maintainer acceptance (not yet approved)
- [ ] Compare desktop and mobile to V4 reference; record accepted deviations and version source image (#3).
- [ ] Test physical iPhone installed PWA: safe areas, scroll/keyboard, animation, rotation, audio/volume, Shortcut, notification permission, offline reopen, download and import through Files.
- [ ] Test Android installed PWA and desktop keyboard/zoom/forced colors.
- [ ] Confirm local data and backup semantics; close other tabs during restore and update.
- [ ] Review contrast and assistive technology using real screen readers; no WCAG certification asserted.
- [ ] Approve documentation PR #2 and prototype PR #34, close review issues with evidence; keep production feature issues open.

## Known prototype constraints
Fixed demo dates and simulated calendar/music/book provider results; no real OAuth, cross-device sync, guaranteed closed-app alarms, direct native Do Not Disturb API, or transactional storage. Cache may be evicted. Cross-tab synchronization requires Web Locks and a shared storage partition. iOS Shortcuts require explicit setup. Production architecture must use repository contracts and actual dates, accessibility validation and migration tests.
