# Focus engine, activities and tasks

## Behavior
Modes: Pomodoro defaults 25/5/15 minutes, long break after four completed focus cycles; configurable durations and cycle count, opt-in auto-start; countdown single timed block; stopwatch elapsed time; Flowtime as free session with optional manual break (no forced algorithm initially).
States: idle, running focus, paused focus, running break, paused break, awaiting next phase, finished/cancelled. Only one active session per local profile initially. A session may have no linked activity. Persist phase, startedAt, endsAt (timed), accumulated active duration, pausedAt, cycle index and revision. Recompute from clock when resuming; never trust interval ticks as source of truth. Pauses/breaks excluded from focus totals. When app resumes after deadline, reconcile once; do not invent subsequent cycles if auto-start was not actually supported. Clock jumps and suspension have explicit tests; allow manual correction with audit/history entry. Save before notification side effects; prevent duplicate completions.

Activities have user-defined category, title, optional color/icon, archive flag and default mode/duration. Categories seeded work, study, reading, personal, meeting, other. Tasks: title, optional activity, checklist, due date, priority, status. Mark complete independent of timer; deletion with linked history preserves historical label or archive. Task creation does not auto-create calendar event. Meeting time counts as focus only through deliberate session/log; imported schedule alone is not actual attendance.

## Acceptance
Start without login or task; start/pause/resume/finish from any surface; reload during focus and break; no negative time or double counting; manual early finish records actual active time; cancelled/discarded history clearly distinguished; notification failure never corrupts session; historical records survive archiving categories/tasks. Test DST, midnight, clock changes, crash and duplicate actions.
