# Product UX refinements after V4.34

Approved direction: plan, focus, track and personalize. Existing dashboard layout and widget catalogue stay intact.

## V4.35 — Dashboard and contextual navigation
- Task widget shows up to three pending tasks, priorities first, with inline completion, priority and focus preparation. In a small widget show two rows; full list remains reachable. Add a task from the card or command palette, capture a note from the palette even if note widget is absent. No automatic timer start; prepare focus and respect the existing active-session guard.
- Up to three pending priorities; optional Task.priority field remains compatible with version 1 storage and backups. Completing a task clears its priority. Task and book widget links route to the exact Activities tab. Changes are local and respect the workspace writer guard.
- Mobile geometry and functional tests included. No change to saved widget layout, mock providers or demo dates.

## Next planned refinements
- V4.36 — focus lifecycle: finish summary, destructive reset confirmation, optional Zen mode, quick presets. Keep automatic breaks and recovery semantics consistent.
- V4.37 — dashboard editor: presets in editor, undo/redo draft operations, explicit layout target and per-widget settings.
- V4.38 — planning: task estimates and local focus blocks; distinguish mock dates and do not write provider events.
- V4.39 — first-use/empty states and usability audit, including mobile and accessibility. Larger features (full ambient audio, heatmap, real provider connections, production storage changes) remain production roadmap items.

CI, published site audit and physical device review remain the acceptance gates; no claim of production readiness.
