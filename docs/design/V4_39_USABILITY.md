# V4.39 — First-use and empty-state review

- Optional first-run empty workspace (tasks, books and history cleared only before profile setup; existing profile cannot access the option). Default demonstration remains unchanged, including skip onboarding. Keep category defaults and select a valid category as initial focus context.
- No phantom book: empty library is a valid v1 workspace and backup, empty reading ID allowed; editor renders an empty preview. Creating the first book selects it for the reading widget. No fake progress.
- Empty task and history affordances, first-book creation, no-record recent widget, zero-minute formatting. Task count shows pending items. Onboarding states local storage and simulated integrations explicitly.
- Demo calendar, reference dates and music remain simulated even in empty workspace. No real provider integration or actual-date migration in V4.
- Acceptance gates: one batched release after changes (per CI_BATCH_POLICY), then physical iPhone/Android, keyboard/screen reader and human visual approval. Do not treat CI as a final product acceptance. M1+ remains separate.

Prior V4.38 CI passed on e397845; deployed audit on adbe9a6 failed because the matching deployment was cancelled, not a verified UI regression. No intermediate validation runner requested.

First-use protection compares task and book contents against known fixtures, not the restored snapshot. Existing profile re-onboarding explicitly tested; no destructive reset available. A single release checkpoint triggers validation, deployment and published audit in sequence.
