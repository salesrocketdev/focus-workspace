# Authentication and integration boundary (proposed MVP)

## Decision
Guest/local use without an account; optional Google OpenID Connect sign-in for cross-device sync. Microsoft sign-in as a later option; avoid first-party passwords initially (reset, verification, rate limiting, secure hashing and incident handling would expand the MVP). Use an internal immutable user ID with identities keyed by issuer and subject, not email; account linking requires explicit proof of both identities. Self-hosters may configure their own OAuth client/identity provider. Check Apple App Store login rules before iOS release; Sign in with Apple may be needed depending on the distribution and exemptions.

## Security boundary
Login proves identity; each service connection uses independent authorization and minimal scopes. Google calendar read-only access is requested separately, Outlook through Microsoft identity/Graph, Spotify through its supported OAuth flow. Native clients use system browser, authorization code + PKCE, verified redirects; web uses server-side authorization and secure HttpOnly session cookies when backend exists. Validate issuer, audience, state, nonce, expiry and redirect URI as applicable. Keep provider refresh tokens encrypted server-side or in platform secure storage as appropriate; no secrets in frontend/GitHub Pages, no tokens in localStorage. Support revoke and disconnect; account deletion/export. No automatic email-based identity merging.

## Prototype
GitHub Pages is static. Onboarding uses a fictitious profile marker or guest; local preferences are not authenticated or synced. Provider dialogs explicitly simulate permissions and consent, never ask for passwords or real account details. Gmail/Meet/Teams are visual explorations; calendar meeting links need not require separate OAuth. Provider connections do not alter fixture data. Real OAuth is deferred to production architecture and provider review.

## References
- https://developers.google.com/identity/openid-connect/openid-connect
- https://developers.google.com/identity/oauth2/web/guides/overview
- https://developers.google.com/identity/protocols/oauth2/resources/best-practices
- https://datatracker.ietf.org/doc/html/rfc8252
