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


## Coordinate-grid prototype (V4.08)
At viewport widths >=1151px the prototype uses a 12-column explicit coordinate grid with independent x/y/w/h in row units. Drag the grip, resize the bottom-right corner or right/bottom edges. The ghost indicates valid placement or a collision; blocked gestures leave the original position intact. Arrow keys on grip move in either axis; arrow keys on resize handles change dimensions. P/M/G menu presets remain and can move the resized widget to the first available region if needed. Old order-only local layouts migrate deterministically without losing widgets under the supported catalogue capacity. Empty cells are visible; the add tile uses the first free 3×3 area. Save persists positions and dimensions; cancel discards the draft. Mobile and narrower desktop/tablet views keep responsive order and size presets, not the absolute coordinate editor. The prototype is a lightweight CSS Grid spike, not the final library selection.

## V4.09 — optional push and compact
The default collision policy remains block. In a wide desktop edit session, enable Deslocar vizinhos to preview and push intersecting widgets downward, preserving their columns and dimensions. The same deterministic planner applies to pointer, keyboard and catalogue drop, rejecting the entire operation if a card would exceed the grid bounds. Compactar espaços moves widgets upward without changing columns or dimensions; it is explicit, not automatic. Drag an available catalogue item into a chosen grid cell or click to auto-place as before. Ghosts show planned neighbor destinations. Committed moves animate for 170ms when reduced motion is not requested. All changes remain draft until save; the push toggle resets on entry. Mobile keeps existing presets. Preset changes retain their earlier first-free behavior.