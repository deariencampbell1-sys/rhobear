# App UI kit — RHOBEAR desktop hub

A pixel-faithful recreation of the four core screens of the Tauri desktop hub, cross-linked via the top tab bar.

## Open it

Double-click `index.html`. Click the tabs to navigate.

## Screens

| Tab | File | Pattern |
|---|---|---|
| **Hub** | `index.html` | Full-bleed pixel-art scene (Starship 17-B) with perched crew sprites and floating Crew Chat panel |
| **Agents** | `agents.html` | 3-pane workbench — agents list / active worker view (todos, thread, diff, owner-goal, actions, orchestrator) / live code viewer + terminal tabs |
| **Board** | `board.html` | Kanban with Backlog / Staging / Review / Done columns, group dots (A/B/C/D), per-card assigned crew avatars |
| **Catalog** | `catalog.html` | MCP servers grid with Vetted / Community / Unvetted status pills |

## Components built in `app.css`

- **App chrome** — sticky brand lockup + crumb + tab bar + world picker (SPACE / WEST / NEON) + merge-mode pill + Starship label.
- **Workbench panes** — left agent list with status avatars (`r` ring, `?` question, `!` blocked, `B/C` group), middle agent-card with todo, thread, diff, owner-goal banner and action row, right code-viewer with file tabs and bottom Terminal/Output/Problems tabs.
- **Board card** — group dot, status indicator, title, optional description, footer with assigned-crew avatar + tag pills.
- **Catalog card** — name + Vetted/Community/Unvetted status pill, by-author, description, scope chips, install footer.

## Reduction-of-fidelity notes

This kit cuts these corners:
- World picker doesn't actually re-skin the room (no codebase access to wire the real theme system).
- Drag/drop on board cards is visual only.
- Crew Chat composer doesn't send.
- Catalog filters don't filter.

It's a high-fidelity cosmetic recreation that any designer can paste into a mock or extend into a real component library.

## What's missing

Other tabs visible in the screenshots (Learn, Skills, Vault, CLI, Worlds, Settings) are not built out here — they would each follow the same shell + drop different content into the body. The four built screens cover the structural patterns those would need.
