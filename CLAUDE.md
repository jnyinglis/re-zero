# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resistance Zero is a task management application based on Mark Forster's Resistance Zero System. It's implemented as a React single-page application built with Vite.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Architecture

### Core Structure
- **src/main.jsx**: React app entry point
- **src/App.jsx**: Root application component
- **src/context/AppStateContext.jsx**: Global state management with React Context
- **src/components/**: Reusable UI components
- **src/components/modes/**: Mode-specific components (List, Scan, Action, Maintenance, Reflection)
- **src/utils/taskUtils.js**: Task creation and manipulation utilities
- **src/styles.css**: All styling with CSS custom properties and responsive design
- **PRD.md**: Product Requirements Document defining the Resistance Zero methodology

### Application Architecture
The app follows a **mode-based architecture** with five distinct modes that users cycle through:

1. **List Building Mode**: Task capture with minimal friction
2. **Scanning Mode**: Full list scanning to identify zero-resistance tasks
3. **Action Mode**: Taking action on dotted (zero-resistance) tasks
4. **Maintenance Mode**: Cleaning and archiving tasks
5. **Reflection Mode**: Reviewing progress and patterns

Each mode has an Instructions and Action component providing guided workflow.

### State Management
- React Context API for global state (`AppStateContext`)
- `useState` and `useEffect` hooks for component state
- `localStorage` for persistence (automatically synced)
- State includes: tasks array, settings, metrics, daily stats, guide progress
- Tasks have rich metadata: resistance levels, touch counts, time logs, re-entries

### Key Data Structures
- **Task object** (`taskUtils.js`): Contains text, resistance, level, dotted status, timestamps, and activity tracking
- **State object** (`AppStateContext`): Central application state with tasks array and metadata
- **Scan session**: Tracks current scanning progress stored in context

### Component Structure
- **App.jsx**: Root component with AppStateProvider
- **Header.jsx**: App header with guidance and install button
- **IntroPage.jsx**: Welcome screen before starting guided flow
- **MainApp.jsx**: Main application with mode routing
- **GuideControls.jsx**: Navigation controls for guided workflow
- **modes/*.jsx**: Each mode has Instructions and Action subcomponents
- **Footer.jsx**: Metrics and coaching tips
- **UpdateToast.jsx**: Service worker update notifications

## Deployment

GitHub Pages deployment is automated via `.github/workflows/deploy.yml`. The workflow builds the Vite app and deploys the `dist` folder.

## Key Implementation Notes

- **React + Vite stack**: Modern React with fast HMR during development
- **Resistance-based workflow**: Tasks are scanned until some feel "effortless" (zero resistance)
- **Re-entry principle**: Incomplete tasks automatically move to list end to reduce resistance over time
- **Direction consistency**: Users choose forward/backward scanning and should stick with it
- **Guidance system**: Contextual tips and coaching embedded throughout the interface
- **Time tracking**: Optional timer system for productivity analysis and billing
- **Context API**: Lightweight state management without external state libraries

## Development Guidelines

- Follow the minimalist philosophy - avoid adding complexity that would undermine the intuitive scanning process
- Preserve the flat, uncategorized task list structure (no hierarchies or priorities)
- Maintain the five-mode workflow cycle as the core interaction pattern
- Keep guidance messages aligned with Mark Forster's Resistance Zero principles in PRD.md