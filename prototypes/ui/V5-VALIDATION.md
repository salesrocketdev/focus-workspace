# V5 — Validation gate

Group-end CI uses `[check]` on `prototype/ui-v4`. It runs TypeScript/build, Storybook, Playwright Chromium/WebKit and offline tests without deploying Pages.

## First consolidated checkpoint

G1–G6 have initial implementation changes; none is accepted until CI and visual evidence are reviewed. This first run checks accumulated changes and migrated legacy tests. Known remaining review areas: task/library migration, optional widget fixtures, history filters, habit integration, custom rhythm backup, actual SSO (#43), and full visual review (#42).

Run results must be recorded against the exact tested SHA. Do not mark skipped, queued or failed runs as approved.
