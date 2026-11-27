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

## Validated preview baseline

CI run 46008582449 on 5fd0b44 succeeded in all steps, including functional and offline regression suites. Publish identical application source using `[publish]`; visual approval and outstanding G4–G6 scope remain pending. This does not close #33, #42 or #43.

## G4 — semantic surfaces and states

Baseline deploy 46011176066 passed, including live asset verification. G4 first checkpoint: design-system-v5.css centralizes neutral surface, interaction, typography and cover styles; flatten history metrics without changing grid geometry; secondary hover and focus-visible states reuse theme tokens. Theme regression now selects the real app appearance setting, asserts data-theme, checks history surfaces and horizontal fit, and captures both Home and History in light/dark. No screenshots reviewed yet, no physical device or maintainer signoff. Run `[check]` on the group-end commit before publication or G4 acceptance.

G4 automated validation passed: run 46019136485 on 41e0169, including build, Storybook, functional and offline suites. Publish identical G4 application source for manual review. Screenshot/physical-device signoff remains pending.

## G5 — History and calendar UX

G4 preview deploy 46020396163 succeeded. G5 replaces the permanent desktop filter bar with the same transactional filter dialog used on mobile (category, method, status; apply/cancel/clear; active filter count). Corrected singular/plural wording and demo date/calendar disclosures, retaining local blocks and hidden-calendar conflict checks. Existing keyboard/touch chart interactions retained. Updated functional regression tests for shared dialog, cancellation, clearing, and calendar day/week/month. Fixed-date prototype remains intentional until real data integration. Run full group-end CI before publication.

G5 first validation 46020603561: 149 passed, 2 failed, 18 skipped. Both desktop history scenarios retained a mobile-only Apply guard from V4. Corrected those guards to apply the dialog draft on all viewports, preserving assertions. Offline not reached; rerun full suite before publication.

## G5–G7 integrated release candidate

Maintainer requested completing the remaining groups together. G5 second test run 46022741810 was still running when this candidate was prepared. G6: guest-first onboarding, unavailable provider disclosure, legacy google-demo normalization without data loss, regression test and SSO-SETUP.md handoff. Real SSO remains blocked on #43; no simulated identity is accepted as authenticated. G7: deployed audit now uses V5 navigation and shared filters, checks actual dark mode and active focus, captures responsive evidence on desktop/tablet/mobile/WebKit.

Use the existing `[release]` gate for this combined candidate: Pages typecheck/build, Storybook, functional suite and offline tests must pass before deploy; verify live React assets and run published audit afterward. No acceptance until results are inspected. Physical-device review and maintainer visual signoff still required. Keep #33, #42 and #43 open. Optional widgets, local data and user layouts must remain intact.
