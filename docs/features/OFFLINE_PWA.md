# Offline PWA — prototype

The V4 prototype is local-first, with a production-build app shell precache. After the first connected visit completes, the application can reopen from the installed service worker without a network connection. Timer restoration, local categories/tasks/books/history/preferences and the demo catalogue continue working. This is not a background alarm, cloud sync or offline access to future real providers.

## Implementation
The build script preserves Vite CLI arguments and hashes the worker template and every emitted file, excluding sw.js. It injects a deterministic version and relative asset inventory into the deployed worker. The worker installs an entire version using Cache Storage, with a scope-specific cache name, same-origin requests and no API/user-data caching. The root navigation uses the versioned shell; known static assets use cache-first. Failed installation rejects the new version. New workers wait for old clients to close rather than force a reload or mix bundles. Activation removes only obsolete caches with the same scope prefix. The development notification worker does not cache HMR assets.

The Profile and panel settings show readiness only after the controlling worker confirms the full cached inventory; offline indicator reflects browser connection status, not reachability of every service. Closing all tabs/windows enables a waiting version. If storage is blocked, evicted or cleared, reconnect to prepare again. No persistent-storage guarantee.

## Verification
CI builds with the actual repository subpath and launches Vite preview on a separate port. Chromium desktop/mobile verify cache readiness, fonts/JS/icons, offline reload, timer persistence and local changes. Physical iPhone installation, airplane mode, storage eviction and update lifecycle remain manual acceptance checks. No app-store package or guaranteed closed-app notifications.

Production follow-up: #8 local storage contracts/migrations, #6 platform capabilities, #24 native packages. Preserve version compatibility and cross-tab coordination before shipping real user data.
