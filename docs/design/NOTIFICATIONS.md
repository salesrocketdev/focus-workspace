# Notifications and PWA proposal

V4 prototype: internal notification inbox, explicit permission, native notifications via service worker while the page timer executes. No external push endpoints, no background timer promises, no offline caching. PWA manifest scoped to deployment path. Installed iOS Home Screen apps support notifications starting in iOS/iPadOS 16.4; permissions and delivery depend on environment. The worker is event-driven and not a persistent clock.

Production: persist session deadlines independently of view state; reconcile after suspension; use server-scheduled Web Push for reliable closed-app reminders when online, with cancellation/idempotency and explicit opt-in. For local-first guaranteed offline alarms evaluate native wrappers/platform notifications (including OS scheduling limits). Calendar reminder timing, timezones, quiet hours, device-specific permission and subscriptions, deduplication and privacy of notification payloads are release gates.

References:
- https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
- https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- https://web.dev/learn/pwa/service-workers


V4.17: iOS browser explicitly shows Home Screen installation steps; standalone detection uses display-mode and navigator.standalone. Permission request remains directly user-triggered. System notification test uses scoped registration.showNotification; optional Badging API mirrors unread count. No remote push subscription or iOS real-device delivery validation. See https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/.


Local session recovery now reconciles elapsed time on reopening or visibility changes. This is not a background alarm: notifications for an expired session may be delivered only upon return. An overdue focus is logged once in a single running tab and the next phase awaits manual start; no fictional catch-up focus blocks. Multi-tab coordination remains a production requirement.


## Native distraction control (prototype)
Browsers cannot grant or observe OS-level Do Not Disturb access. Provide a voluntary reminder at the start of a new manually initiated focus and a guide accessible from notification settings, immersive focus and quick actions. On iOS, a user-initiated `shortcuts://run-shortcut` link invokes the user's own shortcut `Focora - Silenciar` with numeric text minutes. Configure Set Focus until current date plus input minutes in Shortcuts. No shortcut installation, verification, automatic launch, automatic disabling or claim of active system focus. The user sets allowed contacts/apps and may disable focus via Control Center. Android requires manual quick settings in the PWA; a native app could later evaluate NotificationManager policy access. Device validation required. References: https://support.apple.com/pt-br/105112 ; https://support.apple.com/guide/shortcuts/apd624386f42/ios ; https://developer.android.com/reference/android/app/NotificationManager .


### Opt-in start handoff
The iOS preference `Silenciar notificações ao iniciar foco` is off by default and migrates the prior reminder-only setting. With the preference enabled, a fresh manually initiated focus uses the original user gesture to invoke `Focora - Silenciar`, passing rounded minutes (1–120). Persist the running workspace synchronously before opening Shortcuts; if storage fails, offer the manual guide instead. No launch on refresh, pause/resume or automatic transitions; the user may invoke the existing manual link for those cases. Free focus uses the configured Pomodoro duration as a finite initial silence period. A configured OS Focus may replace another active Focus. No automatic ending or native state claim. User can disable in Control Center. Apple documents the URL scheme at https://support.apple.com/guide/shortcuts/apd624386f42/ios . Physical-device setup and execution remain required.
