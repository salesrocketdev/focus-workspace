# Production implementation

The approved visual reference is commit [47ec6c5](https://github.com/salesrocketdev/focus-workspace/commit/47ec6c5f85773449b136adc2f12a746fbee6c594), with [release evidence](https://github.com/salesrocketdev/focus-workspace/actions/runs/46049177559). Prototype stays in `prototypes/ui` and is not part of the pnpm workspace.

## M1 / issue #5
Node 22, pnpm 10, TypeScript, React/Vite, ESLint, Vitest. Start with two packages only; add API, contracts or UI packages when a concrete feature requires them. The initial client is an explicit foundation placeholder, not the approved final interface. No external service or credentials required.

```sh
corepack enable
pnpm install
pnpm dev
pnpm check
```

First CI resolves the initial lockfile and archives it; commit the generated lockfile before merging #5 and require frozen installs thereafter. No claim of clean-checkout validation until CI completes.

## Delivery sequence
- #5 workspace/CI; #7 application shell and reusable visual primitives; #8 local storage and migrations.
- #11 timer domain vertical slice, #12 shared UI controls, #9/#10 widget registry/editor; #13/#14 tasks/history.
- #39/#40 offline and coordination; #43 optional identity and #23 sync after storage contracts; #15–#18 actual agenda providers.
- #19–#22/#35 reading, insights, music and immersive experiences; #24 native packaging, #25 release review.

Existing issue IDs and roadmap remain the source of truth. #6 capability spike informs native and OAuth choices. Physical device checks, exact original concept image (#3), board setup (#4), and remaining prototype checklist (#42) are tracked separately. Production must not inherit fake dates, example metrics, or unlabelled simulated integrations.
