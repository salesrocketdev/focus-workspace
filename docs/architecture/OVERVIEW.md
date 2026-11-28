# Architecture (proposed baseline)

React + Vite + TypeScript client; Tauri 2 native shell, PWA web; Tailwind/shadcn UI, Lucide, Zustand for ephemeral client state, TanStack Query for network state, Zod for validation; pnpm workspace, Turborepo only when helpful. React Grid Layout candidate. Shared pure TypeScript domain/core. Local SQLite native / IndexedDB web through repository-specific storage ports. Optional NestJS modular backend + PostgreSQL/Drizzle for OAuth and device sync; Docker Compose self-hosting. No backend needed for basic local focus and tasks. Web provider OAuth may need backend earlier; decide after spike. Avoid microservices/Redis until justified.

    apps/client/        React features + platform adapters + src-tauri
    apps/api/           optional NestJS modules
    packages/core/      domain, timer and scheduling rules
    packages/contracts/ shared schemas and DTOs
    packages/ui/        shared design primitives when actually needed
    docs/               product, design, architecture, decisions

Dependency direction: React/native/API adapters depend on domain contracts, domain does not depend on framework. Storage and notifications via narrow interfaces. A single timer service/store shared by dashboard and immersive/compact surfaces; no one timer per component. Platform capabilities: notifications, secure store, deep links, always-on-top, background execution; unsupported feature has clear fallback. Tauri mobile is proposed, not proven. Validate Windows + web + Android/iOS feasibility early; iOS native builds require macOS/Xcode. PWA does not guarantee background timing or native window controls.

Test strategy: pure unit tests with injected clock; integration tests for repositories/provider fixtures; Playwright keyboard, resize and reload; native smoke tests for notification/sleep/OAuth. Pin supported versions after prototype, document decisions. ADRs are proposed until reviewed.
