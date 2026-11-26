# Screen specifications

| Screen | Primary content/action | Responsive behavior |
|---|---|---|
| Today | Date, Edit panel, timer, agenda, tasks, goal, reading/music when enabled | Desktop grid; mobile stacked/two columns |
| Dashboard editor | Draft grid, resize handles, catalogue, restore/cancel/save | Desktop right catalogue; mobile list/order/size editor |
| Focus | Activity title, method/cycle, central timer, pause/stop, optional progress/music/next event | Desktop side cards, mobile single column; distraction-free variant |
| Compact | Time, activity, play/pause, stop or expand | Native always-on-top where supported; web fallback normal mini view |
| Calendar | Today/week/month, account colors, event detail, busy windows | Mobile agenda list first; week/month switch |
| Activities | Categories, tasks, recent items, create/edit/archive | Mobile filter drawer and detail route |
| Reading | Library, book detail, page/chapter progress, history, start | Cover list mobile; no ebook rendering |
| History/Insights | Date range, total active time, session list, category breakdown | Compact summaries before charts; export later |
| Settings | Theme, duration defaults, notification permission, data export/delete, language | Grouped sections |
| Integrations | Account list, scope explanation, calendar selection, last sync, disconnect | Provider errors and reconnect flow |
| Onboarding | Optional preferences and dashboard preset | Skip always available |

## State checklist per screen
Loading/initial, ready, empty, recoverable error, offline where meaningful, permission denied, narrow viewport and keyboard-only. Destructive actions require confirmation when irreversible; widget removal is not destructive. Dialogs return focus to opener. Timer status is announced at transitions rather than every second. Default dashboard follows V4: timer and agenda top, tasks/reading/goal next, music/summary below. Unavailable phase widgets are not fake live data; use an explicit demo or omit. 


## Calendar prototype — V4.10
The Agenda route uses the common PageHeader and a warm calendar surface with day/week/month controls, previous/next period and Today (demo) reset. Fixed 29 January 2025 fixtures intentionally match the V4 dashboard; no live date, accounts or API calls. Day is an ordered event list, week is a seven-day overview with selected-day detail (mobile uses day strip + detail), month is a six-week grid with selectable days and compact markers. Provider filters affect displayed events only; suggested free windows use all fixture calendars to avoid false availability. Event details use the shared native Dialog; no fake join buttons, write permissions or automatic focus starts. Calendar date arithmetic uses UTC civil-day operations solely for the deterministic fixture, not the final timezone model.

## Activities prototype — V4.11
Activities is a single hub with overview, tasks and reading tabs, category cards, search, task status/category filters and a library. Create categories, create/edit/check tasks and add books using shared dialogs. The same in-memory tasks/books feed dashboard and editor previews. Choosing a category or task opens a contextual focus view using the existing timer; the session remains shared across routes and cannot be replaced while running or paused partway through. A task can be marked complete explicitly, never automatically when the timer ends. Reading selects a book and uses its actual fixture page count in the progress modal and dashboard. Data is in memory for this demo; reload resets it. No archive, category editing/deletion, task deletion, book metadata editing, external book search, or production persistence yet.

## V4.12 — onboarding, session preferences and integrations
First-run four-step onboarding: guest or fictitious Google profile, choose balanced/work/study dashboard, customize focus/break/cycle/goal preferences, review. Applying a suggested dashboard is explicit and replaces both layouts. Skip and replay via settings. Profile marker, preferences and simulated provider connection IDs persist locally; no credentials, tokens, account records or provider requests. Each of six provider marks has a labelled demo account selector, permission preview, consent and disconnect; Gmail/Meet/Teams are concept exploration only, not added to MVP. Focus uses shared duration, short/long breaks, cycle count, optional auto-start and daily goal; free mode remains available. Focus configuration in settings and immersive mode, locked during active/paused sessions. Dashboard cards have no internal scrolling; bounded previews and compact styles; full lists live on their pages. Motion uses short opacity/step transitions, existing grid FLIP and reduced-motion support.

## V4.13 — History and appearance
History provides today/7-day/30-day ranges, category/method/status filters, duration and count, average over all selected days, streak, daily evolution, category distribution, daily goal and paged session list with detail dialogs. Streak and today's goal deliberately use all records regardless of filters. Demo dates remain fixed to 29 January 2025. Newly completed focus periods and explicitly stopped sessions are added in memory; interrupted Pomodoros are labeled as such, completed free sessions are logged on stop, pauses are excluded and reset discards the current interval. Dashboard goal, summary and recent widgets share these records. Appearance offers light/dark/system and optional reduced motion; persisted locally. Dark palette is a first pass requiring visual contrast review across all screens.

## V4.15 — Settings navigation and notifications
Reference-inspired desktop settings secondary navigation (Preferences: focus, notifications, appearance; Account/services: integrations, profile). A single section occupies the main content surface; mobile uses compact grouped navigation. Shared page heading coordinates stay unchanged. Notification preferences independently control focus/pause completion and native delivery. Internal inbox persists up to 50 items locally, has unread count, mark all read, clear and test. Native authorization is explicitly user-initiated; delivery uses ServiceWorkerRegistration.showNotification when permission is granted. Manifest and notification-only worker are scoped relative to Vite base for GitHub Pages; no offline cache, push subscription, server scheduler, or closed-app alarms. Fixed demo calendar means real meeting reminders remain future work.

## V4.16 — compact focus and quick actions
A single shared timer can be controlled from a compact dock across routes. Closing the dock does not stop a session; expand returns to immersive focus. On supported secure desktop browsers, a user gesture can request Document Picture-in-Picture and render the same controls in a floating window; the app remains open and unsupported browsers retain the in-app dock. The palette opens with Ctrl/Cmd+K or header search, searches accent-insensitively, supports arrows/Enter/Escape, and disables navigation/timer changes while editing. Native PiP delivery is not guaranteed and needs real desktop testing.