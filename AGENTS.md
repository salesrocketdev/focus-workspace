# Repository instructions

Read README.md, docs/README.md, ROADMAP.md, the relevant specification and ADRs before working on an issue. GitHub Issues are the delivery source of truth. A Project board is a view, not a duplicate backlog.

- Do not implement before the documentation foundation is reviewed. Work one issue at a time; link the PR to it.
- Human-readable, explicit TypeScript; strict typing; no routine any, speculative abstractions, premature microservices or generic repositories. Prefer feature modules and small pure functions.
- Keep timer/domain logic independent of React, network, database and native shell. Provider-specific behavior stays in adapters.
- Respect approved V4 light visual direction, responsive widget variants, keyboard access and i18n. Do not silently replace the UI concept with a generic admin template.
- Use fake fixtures for calendar/music demos; clearly label them. Never commit credentials, personal calendar data or access tokens.
- For behavior changes include tests, docs and acceptance evidence. Record deviations and risks in the PR; do not close issues on partial implementation.
- Do not change repository visibility, publish releases or introduce paid mandatory services without maintainer approval.
- Docs, issue titles and commits in English; app locales en-US and pt-BR. Prefer conventional commits.
