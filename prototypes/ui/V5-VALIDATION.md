# V5 — Validation gate

Group-end CI uses `[check]` on `prototype/ui-v4`. It runs TypeScript/build, Storybook, Playwright Chromium/WebKit and offline tests without deploying Pages.

## First consolidated checkpoint

G1–G6 have initial implementation changes; none is accepted until CI and visual evidence are reviewed. This first run checks accumulated changes and migrated legacy tests. Known remaining review areas: task/library migration, optional widget fixtures, history filters, habit integration, custom rhythm backup, actual SSO (#43), and full visual review (#42).

Run results must be recorded against the exact tested SHA. Do not mark skipped, queued or failed runs as approved.

## V5 preview publication

Maintainer requested publishing the current preview for hands-on testing. Build and Storybook passed on `6d9c106`; functional/offline CI has not yet completed. Publish the exact same application code with `[publish]` (Pages build and live asset verification), not `[release]`. This is a preview, not a full acceptance or production release. Existing user layouts and local data remain intact.

## Second checkpoint

Preview publication succeeded in run 46004201843. First validation 46003528874: build and Storybook passed; Playwright 108 passed, 43 failed, 18 skipped; offline skipped after failure. Addressed hidden mobile settings action and alternate timer face regression; migrated failing selector and explicit layout fixture contracts for task, calendar, focus, history widgets and geometry. Second full `[check]` run required; no acceptance until reviewed.

## Third checkpoint

Second CI 46005706005: 149 passed, 2 failed, 18 skipped; build/Storybook passed. Both failures are the same ambiguous category selector on desktop and mobile, now scoped to the New Task dialog. Offline stage was skipped. Re-run full `[check]` before accepting or publishing the corrections.

## Fourth checkpoint

Third full CI 46007307196: TypeScript/build, Storybook and all 151 executed functional tests passed (18 skipped). Two offline tests failed because their old Atividades navigation name was not migrated. Updated offline selectors to Biblioteca without weakening cache, timer persistence or offline data assertions. Application source unchanged from second checkpoint. Run full `[check]` again; no full acceptance until offline passes.
