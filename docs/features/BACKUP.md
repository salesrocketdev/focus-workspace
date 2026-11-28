# Backup and history export — prototype

Versioned JSON (focora-backup v1), explicit storage-key allowlist, includes workspace, focus preferences, layouts, appearance, notifications/inbox, distraction preferences, demo connections/profile and quick notes. Export committed records, reset timer to idle. No tokens, external data or cache files. Import validates format, schema, references and version, maximum 10 MB, previews counts and requires confirmation. Replace rather than merge. Only writer with idle session can restore; close other tabs first. Native notification opt-in and automatic iOS Shortcut opt-in reset on restore. LocalStorage is not transactional; rollback previous values on write error on a best-effort basis and report failure. Future production repositories should use transactions and migrations. File unencrypted; user controls storage.

CSV from history uses current period/filters (all matches, not just visible pagination). Profile export includes all records, including fixtures; demo date is clearly labeled, duration in seconds. UTF-8 BOM, semicolon separators, quoted cells, spreadsheet formula prefixes neutralized. No cloud sync. Related #8 and #22. Physical iOS Files sharing/download validation pending.


V4.34 additionally validates ISO history dates and HH:MM times before restore. Quick-note changes reach read-only mirrors; shortcut settings follow storage events to avoid stale writes from a reopened tab.
