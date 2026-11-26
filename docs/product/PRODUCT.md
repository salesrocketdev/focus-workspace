# Product definition

## Vision and audience
A calm, flexible personal focus workspace for developers, students, readers and anyone who wants to spend attention intentionally. Open the app, see relevant commitments and activities, and start focusing. Avoid turning it into a team/project management suite.

## Principles
Local-first core, optional accounts and sync; privacy by default; open-source distribution and optional self-hosting; provider independence; customization without visual clutter; accessibility; user-defined rhythm rather than forced gamification.

## Requirements
| ID | Requirement | Priority |
|---|---|---|
| P01 | Start, pause, resume, skip or finish Pomodoro, countdown or stopwatch sessions | P0 |
| P02 | Persist active session and recover after reload, sleep or restart | P0 |
| P03 | User-defined activities/categories with icon, color and preferred duration | P0 |
| P04 | Dashboard widgets add/remove/move/resize/configure, save/cancel/reset | P0 |
| P05 | Local tasks and checklists; optional linkage to activities and sessions | P0 |
| P06 | Google and Outlook multiple accounts, selected calendars, read-only automatic event sync | P0 |
| P07 | Upcoming events, meeting links, conflict-aware focus suggestions | P0 |
| P08 | Local history, daily focus total and configurable daily goal | P0 |
| P09 | Reading tracker with page/chapter progress and session history | P1 |
| P10 | Optional music/ambient sounds, official Spotify integration when supported | P1 |
| P11 | Native compact/immersive mode, platform-dependent alerts | P1 |
| P12 | Weekly/monthly insights, activity distribution and export | P1 |
| P13 | Remote/device sync, self-hosting, Android and iOS distribution | P1 |
| P14 | External task providers, notes, multiple dashboards, time-block editing | P2 |

P0 defines the Windows/web first usable milestone, not a claim of implementation. P1 expands the experience; P2 is deferred. Reading is a first-class activity even before its richer tracker ships. Basic local planning should be usable before connections exist.

## Non-goals
Team collaboration, AI scheduling, employee monitoring, complex Kanban, native ebook renderer, streaming service replacement, automatic conversion of all calendar events into tasks, public cloud subscription requirement.

## Success criteria (targets, not measurements)
Start an unlinked session in no more than two intentional actions from the default dashboard; reconnect without duplicate events; offline timer and history survive restart; no data loss on widget removal; user can configure layout without pointer; no forced third-party signup. A meeting is not automatically focused time.

## Scope by platform
Windows + web first; early Android/iOS feasibility spike. Web supports foreground timer and recovery but background alarms are best effort. Native OS focus/DND, always-on-top and notification permissions are capability-gated, not guaranteed on all platforms.
