# Engineering standards

Strict TypeScript, explicit domain names, small feature modules, pure rules before framework glue. No generic abstractions without concrete need; no premature service decomposition. Keep platform/provider differences behind narrow contracts; validate all external data. Prefer structured error codes and localized messages. Conventional commits, small PRs, no secrets or personal data in fixtures.

Definition of done: issue acceptance met; tests pass (unit, integration, UI/native as relevant); typecheck/lint/build pass for affected targets; accessibility and narrow/wide viewport checked; loading/empty/error/offline states tested; docs and ADRs updated; no secrets; PR links issue and evidence; review/merge before closure. Docs-only issues require link validation and consistency review, no claim of code tests. Enforce automated checks once scaffold exists. 
