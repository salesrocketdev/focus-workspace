# Domain and persistence

| Entity | Key fields / invariants |
|---|---|
| Profile | id, locale, timezone, preferences; local identity independent of external auth |
| Category | id, title, icon, color, defaults |
| Activity | id, categoryId, title, defaults, archivedAt |
| Task | id, activityId?, title, status, dueAt?, checklist |
| Book | id, activityId?, title, author?, totalPages?, currentPage?, chapter?, status |
| FocusSession | id, activityId?, taskId?, bookId?, eventRef?, mode, status, startedAt, endedAt?, phase, revision |
| FocusInterval | id, sessionId, start/end, kind (focus/break/pause); non-overlap; source of metrics |
| ReadingProgress | id, bookId, sessionId?, from/to page?, chapter?, correction flag |
| CalendarConnection | id, provider, accountRef, selected calendars, status; secret reference not raw token |
| CalendarEvent | normalized identity, dates/timezone, state, busy, link, sync metadata |
| SyncCursor | provider/account/calendar/window, opaque token, lastSuccess |
| DashboardLayout | id, version, revision, placements by breakpoint |
| WidgetInstance | stable id, widgetType, version, config |
| Goal | profileId, optional category, period, target minutes |

Events, tasks, sessions and books are separate; link optionally. Session history retains label snapshot if activity renamed/deleted. UTC instants for timed intervals, local date for all-day events, IANA zones for display. IDs generated locally (UUID); migrations versioned. Write timer state and interval atomically; completion idempotent. Persist layouts separately from domain records. Avoid physical deletion until export/sync behavior defined. SQLite/IndexedDB contract tests ensure equivalent behavior. This is conceptual schema, not a DB migration.
