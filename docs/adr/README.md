# Architecture decision records

Status: proposed unless marked accepted after maintainer review/spike.

| ADR | Decision | Status |
|---|---|---|
| 0001 | TypeScript monorepo, React/Vite + Tauri/PWA, optional NestJS | Proposed |
| 0002 | Local-first repositories, SQLite/IndexedDB, optional remote sync | Proposed |
| 0003 | React Grid Layout behind a widget registry, independent breakpoint layouts | Proposed |
| 0004 | Provider adapters and read-only calendar MVP | Proposed |

## Alternatives and validation
0001: Flutter, Electron + Capacitor, Expo. Choose shared web UI due to team TypeScript familiarity; verify native notification, OAuth, window and packaging before binding mobile.
0002: mandatory cloud backend vs local core. Local core reduces login and availability dependencies; costs migration/conflict handling. Validate restart, persistence and browser storage eviction.
0003: custom CSS grid/drag logic vs existing library. RGL offers dragging/resizing/responsive breakpoints; validate keyboard, touch, layout persistence and API version. Do not expose library type as domain model.
0004: direct provider dependencies vs adapters. Adapters isolate pagination/cursor/scopes; avoid false capability parity. Validate Google and Microsoft fixture tests; Spotify not required for MVP.

Create individual ADR files as decisions are reviewed or changed. Include context, options, decision, consequences and evidence.
