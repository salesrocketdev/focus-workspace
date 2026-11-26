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