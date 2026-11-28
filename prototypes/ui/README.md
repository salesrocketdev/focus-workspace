# V4 UI prototype

Isolated React/Vite mockup-as-code for design review, not the production application. Brand Focora is the provisional V4 wordmark. Fixture date, schedule, goals and media are illustrative; no Google, Outlook or Spotify API is called. Cover art is a simple original SVG placeholder, not the published book cover.

## Run
Node 22 recommended. From this directory:
    npm install
    npm run dev
    npm run build
    npx playwright install chromium
    npm test
    npm run storybook

A lockfile is not yet committed; generate and review it after installation before freezing dependencies. Storybook is a starter catalogue, not a completed design system.

## Try
Dashboard → Edit panel → reorder with drag handle (desktop) or arrow controls, resize P/M/G (or drag corner horizontally), add/remove via catalogue, save/cancel/reset. Layouts persisted in browser, desktop and mobile separate. Start/open focus, pause/resume/end, update reading progress, check tasks, simulated player. Other nav pages are lightweight demo surfaces. Editing card previews are not intended to change domain data. Timer is demo-only (no reliable restart recovery, cycle orchestration, notifications or cross-device sync). No backend, accounts or native runtime.

## Validation
Playwright captures candidate screenshots at desktop/mobile viewport and checks removal/cancel/save/reload and reading progress. These are NOT approved regression baselines; compare with exact V4 source first. Review 1920×1080, 1366×768, 1024×768, 768×1024, 390×844 and 360×800 manually. Record differences (fonts, proportions, responsive behavior). Reference image is a raster concept; exact pixel identity cannot be guaranteed. No production M1 implementation before review.

## Live preview (GitHub Pages)
The prototype-only deployment workflow builds the Vite client with the repository path as its base and uploads only dist/. It runs on pushes to prototype/ui-v4 (and manually once the workflow is available on the default branch). The existing PR checks remain separate. No server, OAuth or real calendar/music data is deployed. Enable Settings → Pages → Source: GitHub Actions, and allow prototype/ui-v4 in the github-pages deployment environment if branch restrictions apply. Private repositories require an eligible GitHub plan; the published site may be public even while source remains private. Do not publish secrets or personal data. Expected default URL: https://salesrocketdev.github.io/focus-workspace/ (confirm actual deployment URL in Actions). If Pages is enabled after a failed run, re-run the deployment or push a new commit to the prototype branch. No default-branch merge is necessary for push-based preview.
