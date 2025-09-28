# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resistance Zero is a task management application based on Mark Forster's Resistance Zero System. It's implemented as a vanilla HTML/CSS/JavaScript single-page application with no build system or external dependencies.

## Development Commands

This project has no build, lint, or test commands. It runs directly in the browser as static files.

To develop locally:
- Open `index.html` in a web browser
- Use a local web server if needed (e.g., `python -m http.server` or `npx serve`)

## Architecture

### Core Structure
- **index.html**: Main application markup with mode-based interface
- **app.js**: All application logic in vanilla JavaScript (624 lines)
- **styles.css**: All styling with CSS custom properties and responsive design
- **PRD.md**: Product Requirements Document defining the Resistance Zero methodology

### Application Architecture
The app follows a **mode-based architecture** with five distinct modes that users cycle through:

1. **List Building Mode** (`app.js:27-31`): Task capture with minimal friction
2. **Scanning Mode** (`app.js:32-36`): Full list scanning to identify zero-resistance tasks
3. **Action Mode** (`app.js:37-41`): Taking action on dotted (zero-resistance) tasks
4. **Maintenance Mode** (`app.js:42-46`): Cleaning and archiving tasks
5. **Reflection Mode** (`app.js:47-51`): Reviewing progress and patterns

### State Management
- Uses `localStorage` for persistence (`app.js:592-601`)
- Single global `state` object with tasks, settings, metrics, and daily tracking
- Tasks have rich metadata: resistance levels, touch counts, time logs, re-entries

### Key Data Structures
- **Task object** (`app.js:163-182`): Contains text, resistance, level, dotted status, timestamps, and activity tracking
- **State object** (`app.js:8-19`): Central application state with tasks array and metadata
- **Scan session** (`app.js:212-216`): Tracks current scanning progress and direction

### UI Patterns
- Mode switching via buttons that show/hide panels (`app.js:136-146`)
- Dynamic task cards with contextual actions (`app.js:425-477`)
- Timer functionality for time tracking per task (`app.js:479-525`)
- Re-entry system: incomplete tasks move to end of list (`app.js:527-538`)

## Deployment

GitHub Pages deployment is automated via `.github/workflows/deploy.yml`. The workflow copies all files except `.git`, `.github`, and `dist` to a static site.

## Key Implementation Notes

- **No framework dependencies**: Pure vanilla JavaScript for maximum simplicity
- **Resistance-based workflow**: Tasks are scanned until some feel "effortless" (zero resistance)
- **Re-entry principle**: Incomplete tasks automatically move to list end to reduce resistance over time
- **Direction consistency**: Users choose forward/backward scanning and should stick with it
- **Guidance system**: Contextual tips and coaching embedded throughout the interface
- **Time tracking**: Optional timer system for productivity analysis and billing

## Development Guidelines

- Follow the minimalist philosophy - avoid adding complexity that would undermine the intuitive scanning process
- Preserve the flat, uncategorized task list structure (no hierarchies or priorities)
- Maintain the five-mode workflow cycle as the core interaction pattern
- Keep guidance messages aligned with Mark Forster's Resistance Zero principles in PRD.md