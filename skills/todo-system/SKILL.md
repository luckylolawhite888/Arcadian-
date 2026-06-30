---
name: todo-system
description: To-do list management with todo.md, marking items done, and list commands
version: 1.0
author: Lola
created: 2026-05-16
---

# To-Do List System

## Files
- `/home/node/.openclaw/workspace/todo.md` — Master task list
- `/home/node/.openclaw/workspace/shopping.md` — Shopping list
- `todo_manager.py` — Python-based todo management
- `mark_done.py` — Mark items as completed

## Commands
```bash
# Mark item as done
python3 mark_done.py <number>

# Or via natural language in Telegram
"todo done 3"
```

## Storage
Markdown-based with checkboxes:
```markdown
- [ ] Task description
- [x] Completed task
```

## Sections
- **Reminders** — Recurring or upcoming tasks
- **Today** — Current day's tasks
- **Upcoming Integrations** — Future tech work
- **Recently Completed** — Archived completions
- **Completed Archive** — Older completions

## Usage
- Displayed in morning briefing as "To-do list"
- Maya can mark items done via Telegram
- Items can be added/removed/edited by either of us

## Shopping List
- Separate file (`shopping.md`) with same markdown format
- Displayed separately in morning briefing
