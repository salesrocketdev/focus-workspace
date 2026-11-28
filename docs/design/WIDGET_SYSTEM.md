# Dashboard / widget system

## Core contract
WidgetDefinition: type, titleKey, icon, supportedSizes, defaultSize, min/max dimensions, config schema version, renderer, capability requirements. WidgetInstance: stable id, type, configuration, visibility; layout placements per breakpoint: x,y,w,h. Layout has version and revision. Each instance references domain data; layout never owns tasks/books/session records.

Desktop target 12 columns, tablet 6, mobile 2, with container breakpoints initially 1200/768px (validate in prototype). Compact widgets use semantic sizes S/M/L and render different content via container query. Desktop resize snaps to grid; mobile selects supported presets and reorders by drag handle or up/down controls. Maintain independent breakpoint layouts; deriving an unseen breakpoint must not overwrite existing placements. Persist only validated committed layout. Unknown widget types degrade to removable placeholder; migrate old schema versions.

| Widget | Small | Medium | Large | Phase |
|---|---|---|---|---|
| Timer | countdown + play | activity/method | cycle/settings | P0 |
| Agenda | next event | today list | timeline/free slots | P0 |
| Tasks | count + top item | list | filtered list | P0 |
| Daily goal | total | progress | breakdown | P0 |
| Recent sessions | summary | recent list | grouped history | P0 |
| Reading | progress | cover/pages | sessions/chapter | P1 |
| Music | controls | track + controls | playlist / sound controls | P1 |
| Insights | total | chart | breakdown | P1 |
| Notes | preview | edit | list | P2 |

## Edit behavior
Explicit edit mode, visible handles, grid preview and widget catalogue with search, preview and size. Actions: add, remove, configure, move, resize, reset, save, cancel. Prevent overlaps, enforce bounds and min size, compact deterministically. Do not start a timer accidentally while dragging. Duplicate widgets only where useful (e.g. filtered tasks), singleton timer/music control shared global state. Removal hides widget, not underlying data. Save and cancel must be atomic; unsaved navigation prompts. Keyboard move/resize via controls and live announcements. Allow all widgets removed; show add CTA and global focus entry.

## Acceptance
- Layout survives reload and screen resizing; mobile edits do not erase desktop placement.
- Save/cancel/reset behave predictably; no data deleted on removal.
- Widgets render meaningful compact variants, no clipped controls.
- All editing operations accessible without dragging; mobile scrolling works.
- Disconnected/offline provider widgets show useful CTA or cached timestamp.
- A single running timer remains coherent across duplicated surfaces.

Candidate: React Grid Layout; verify current API and mobile accessibility in a spike. https://github.com/react-grid-layout/react-grid-layout
