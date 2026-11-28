# User flows

## First run
Choose language/system default → optional preset (balanced, study, reading, minimal) → dashboard with useful default widgets → start immediately; connect provider only on demand. Skip must work; never require sign-up for local core.

## Focus
Select optional activity/task/book → method and duration (or quick start) → running → pause/resume or finish → summary of actual active time → optional progress/note → return to dashboard. During a session navigation, widget edits and calendar refresh do not reset timer. If a session already runs, offer to resume or explicitly stop before replacing.

## Dashboard editing
Edit panel → draft layout and catalogue → add/move/resize/configure/remove → save validates and commits atomically; cancel restores prior state; reset defaults applies to draft only until saved. Removing widget never deletes data. Mobile offers accessible list ordering and allowed sizes. Empty dashboard has an add action; timer remains available via navigation/global control.

## Calendar
Connect account via provider consent → choose calendars → initial fetch → today/weekly views → sync automatically while supported/online → show last sync and stale state → disconnect/revoke with explicit cache deletion choice. No write permission in MVP. Event click opens detail and trusted meeting URL; optionally start a linked session manually.

## Reading
Create book manually → set total pages if known → select reading activity → run timer → optionally log end page/chapter → review history → continue from current position. Invalid page ranges show error without losing recorded focus session; completion and progress edits are reversible.

## Meeting conflict
Select duration → compare interval against next accepted/busy timed event, with configurable buffer → show warning and suggested shorter session → user can continue or override. No automatic interruption or session creation on arrival of meeting.
