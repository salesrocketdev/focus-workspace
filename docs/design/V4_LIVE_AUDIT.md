# Published V4 audit

Independent browser run against https://salesrocketdev.github.io/focus-workspace/ (not the local Vite server). Trigger: changes to the live-audit files on prototype/ui-v4, or workflow dispatch. The audit creates fresh isolated browser contexts with the demo profile and does not access a user's existing workspace.

Matrix: Chromium desktop 1366×768, tablet 768×1024, narrow mobile 320×740, iPhone-sized WebKit. Captures dashboard/editor, agenda, categories/tasks/library, history line and filters, settings subpages, dark appearance and immersive focus. Exercises navigation and timer start/pause/reset. Collects full-page screenshots, JSON measurements, Playwright HTML report and console summary. Checks horizontal overflow, unnamed buttons, uncaught JavaScript errors, same-origin HTTP failures and mobile timer hit targets. Small targets elsewhere and potential clipped headings are heuristic observations, not automatic WCAG failures (spacing and intentionally truncated labels require inspection).

No claim of human visual approval, actual iOS keyboard/notification/audio/Shortcut behavior or screen-reader compliance. The audit does not change the application. Direct browsing from the chat environment failed DNS/access, so GitHub-hosted runners are used for actual URL testing. See the run and artifacts for evidence; the final candidate must still receive maintainer acceptance per V4_ACCEPTANCE.md.


## Mobile geometry follow-up
User reported CSV action misplaced. Root cause: `.history-surface header` overrode `.history-export-header` display. Explicit two-column header, nonshrinking action aligned right and vertically centered, long copy wrapping, 44px mobile target. Added shared mobile matrix for 320×568, 360×640, 375×667, 390×844, 414×896, 430×932, 540×720, 667×375 and 844×390 in Chromium and iPhone WebKit, both local CI and published audit. Assertions cover internal overflow, header action containment/nonoverlap, CSV alignment, all calendar views, history ranges, categories, book search, settings, dialogs and focus. Physical mobile and screen-reader acceptance remain pending.


## Internal geometry defect — second follow-up
Published run 45922905342: the four baseline profiles passed; 16 of 18 mobile matrix cases failed in the history `Hoje` range, across both browsers. Each history row exceeded its internal width by 3px because a 15px disclosure SVG was placed in a 12px grid track. The 8px category mark also had a 7px track. Fix both tracks to exact icon sizes and keep the status label clear of the duration and arrow. Add per-row child containment and overlap assertions and preserve strict 2px internal-overflow threshold; soft assertions collect further independent layout findings before reporting failure. Local run 45922911555 stopped during discovery because a spec imported another spec: configure WebKit testMatch to include both files instead. No changes to timer or session data; follow-up CI/Pages/live audit required.
