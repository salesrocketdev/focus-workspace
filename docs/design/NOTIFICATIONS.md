# Notifications and PWA proposal

V4 prototype: internal notification inbox, explicit permission, native notifications via service worker while the page timer executes. No external push endpoints, no background timer promises, no offline caching. PWA manifest scoped to deployment path. Installed iOS Home Screen apps support notifications starting in iOS/iPadOS 16.4; permissions and delivery depend on environment. The worker is event-driven and not a persistent clock.

Production: persist session deadlines independently of view state; reconcile after suspension; use server-scheduled Web Push for reliable closed-app reminders when online, with cancellation/idempotency and explicit opt-in. For local-first guaranteed offline alarms evaluate native wrappers/platform notifications (including OS scheduling limits). Calendar reminder timing, timezones, quiet hours, device-specific permission and subscriptions, deduplication and privacy of notification payloads are release gates.

References:
- https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
- https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- https://web.dev/learn/pwa/service-workers


V4.17: iOS browser explicitly shows Home Screen installation steps; standalone detection uses display-mode and navigator.standalone. Permission request remains directly user-triggered. System notification test uses scoped registration.showNotification; optional Badging API mirrors unread count. No remote push subscription or iOS real-device delivery validation. See https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/.
