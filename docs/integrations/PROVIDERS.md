# Provider architecture

Separate CalendarProvider, TaskProvider, MusicProvider adapters; use normalized contracts and capability flags rather than assuming feature parity. Connect/disconnect, list resources, fetch changes, refresh/reconnect errors, provider-specific cursor and rate-limit handling. Never expose tokens through UI logs, analytics, URLs or persisted layout. OAuth use external browser and PKCE where supported; confidential client secrets only server-side. Verify redirect URI, state, account association and CSRF protections. Local/native secure storage where available; web use secure HttpOnly session cookies via backend where practical; no long-lived tokens in localStorage.

| Provider | Phase | Scope / constraints |
|---|---|---|
| Google Calendar | P0 | read-only calendar/events, OAuth verification and test token expiry to validate |
| Microsoft Graph calendar | P0 | delegated least privilege, personal/work accounts subject to tenant policy |
| Google Tasks / Microsoft To Do | P2 | define explicit read/write strategy and conflict resolution before implementing |
| Spotify | P1 optional | development mode capped at 5 authorized users; Premium developer requirement; distribution depends on policy/approval |
| ICS/CalDAV/GitHub/Jira | later | independent adapters, explicit capabilities |

Sources:
- https://developers.google.com/workspace/calendar/api/guides/sync
- https://learn.microsoft.com/en-us/graph/delta-query-events
- https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide

Recheck provider docs when implementing. No shared credentials or workaround to bypass quotas. Disconnect must clear tokens and offer removal of cached data.
