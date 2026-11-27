# Optional identity — implementation handoff (#43)

The static V5 preview is a local-first guest app. Google and Microsoft buttons are disabled until real provider integration is ready. Legacy google-demo markers load as guest without clearing data. Never treat simulated calendar authorization as identity.

## Proposed production architecture (not yet implemented)
- NestJS API / identity service (separate from the static Pages preview), with an OIDC library, authorization code + PKCE S256, single-use state and nonce, strict redirect allowlist, issuer/audience/expiry validation and provider discovery. No token or client secret embedded in Vite.
- HTTPS API with secure HttpOnly session cookies; CSRF protection on state changes and exact-origin CORS if hosted separately. Prefer same-site frontend/API deployments. Rotate session IDs, enforce expiry and revoke on logout.
- Store identities by issuer + subject, not email; provider tokens server-side only where necessary. Do not auto-link accounts by email. Local guest data remains local until a user explicitly chooses migration, with conflict handling, export and deletion.
- Sign-in scopes: openid profile email only. Calendar/mail consent separately, least privilege, explicit disclosure and revocation.

## Required owner configuration
1. Choose production frontend and API HTTPS origins. Pages preview URL is not an API callback.
2. Register a Google OAuth/OIDC web client and consent screen; configure the exact API callback URL.
3. Register a Microsoft Entra application, choose personal/work-school account support and tenant policy, configure exact API callback. Validate accepted issuers against tenant policy.
4. Provide provider client IDs and client secrets via server-side secret storage (never chat, repository or frontend environment).
5. Deploy API with session store, CSRF, database migrations and audit-safe logging; configure allowed origins. Verify callback, cancel/deny, expiry, logout, isolation, linking, migration and account deletion with test accounts.

No real SSO is claimed by this checkpoint. The guest path, disabled controls and legacy profile normalization are testable in the static preview. #43 remains open pending provider registration, backend implementation and end-to-end verification.
