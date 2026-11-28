# GitHub delivery workflow

GitHub Issues hold work; GitHub Projects is the board view. Use one private Project named Focus Workspace. Recommended status fields: Backlog, Ready, In progress, Review, Done; priority P0/P1/P2 and phase M0–M7 custom fields. Limit active work to one issue per implementer. A blocked issue gets a comment with dependency and remains open. Do not start implementation until foundation review. Branch naming docs/, feat/, fix/; PR body links issue and acceptance checks. Close only completed work; use not planned for consciously deferred items.

Project setup (maintainer if connector lacks Projects access): create a private Board, choose Import items from repository (salesrocketdev/focus-workspace), link Project to repo and configure Auto-add workflow filter is:issue (or is:issue is:open for only open items). Existing issues require initial import; auto-add does not retroactively add unchanged items. Configure closed -> Done and reopened -> Todo/Ready as desired. Table view group by Phase, board by Status, optional roadmap by dates when available. No need to maintain a duplicate spreadsheet or Markdown checkbox backlog.

Official docs:
https://docs.github.com/en/issues/planning-and-tracking-with-projects/creating-projects/creating-a-project
https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically
