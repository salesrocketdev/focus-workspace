# Prototype CI budget policy

Repository is public as verified on 2026-11-27. Standard hosted Linux runners are free on public repositories, but runtime and artifact storage still matter. Do not execute browser suites for every iteration.

On prototype/ui-v4:
- Ordinary commits: no runner jobs (workflow entries may be marked skipped).
- [check] in the HEAD commit message: full local build, Storybook, Chromium/WebKit regression and offline tests, no deploy.
- [publish]: typecheck and static Pages build, deploy and HTML/JS smoke check; no browser suite.
- [release]: build, full local validation including Storybook and offline, then deploy only on success, then live audit as a dependent job. No polling/waiting runner for deploy. Do not combine markers.
- Manual workflow dispatch is retained, but GitHub requires the workflow to exist on the default branch. Until the prototype workflows land on main, use the commit markers (an empty checkpoint commit is sufficient; no path filter). Standalone manual live audit tests the currently published site, not necessarily the checkout SHA.

Batch changes and review diffs before a single explicit checkpoint. Do not automatically trigger checkpoints after each assistant turn. For final acceptance use [release]. Ordinary commits do not update the published URL. The last deployed build remains available. Existing in-flight runs may finish; the current connector cannot cancel them. Cache npm downloads (lockfile is not present; use npm ci only when a lockfile exists). Seven-day retention for QA artifacts. No repository visibility, billing or default-branch changes. No runner triggered to test this policy itself; validate at the next approved checkpoint.
