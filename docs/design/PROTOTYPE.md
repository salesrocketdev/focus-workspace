# Mockup as code — V4

Decision proposed by maintainer and approved for prototyping: isolated React/TypeScript/Vite under prototypes/ui. No Penpot/Figma service required. Preserve V4 reference, reusable tokens and components; compare captured screenshots at fixed viewports, not against the whole collage. No backend/OAuth/native runtime in this phase.

Scope: desktop dashboard/editor/immersive focus and mobile equivalents; interactive widget draft add/remove/reorder/resize/save/cancel/reset, local layout persistence, fixture tasks/reading/music/calendar. Light theme first. Prototype uses CSS grid and native drag with size presets as a low-dependency interaction spike, not a final React Grid Layout decision. Production widget engine still requires its own validation and accessible semantics. Storybook starter catalogue and Playwright capture tests are provided.

Acceptance: #28–#33 and original reference #3. Approve composition, typography, tokens, responsive behavior, interaction and screenshot baselines before production implementation. Do not close issues merely because code exists. Document deliberate departures from V4 and unsupported capabilities. Keep repository private.
