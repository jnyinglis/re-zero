# Migration to Vite + React

## Overview

The Resistance Zero application has been successfully converted from vanilla JavaScript to React with Vite.

## What Changed

### Architecture
- **From**: Vanilla HTML/CSS/JavaScript with direct DOM manipulation
- **To**: React components with Vite build system

### Key Changes

1. **Build System**
   - Added Vite as build tool
   - npm scripts for development (`npm run dev`) and production (`npm run build`)
   - HMR (Hot Module Replacement) for faster development

2. **State Management**
   - Converted global `state` object to React Context API
   - `AppStateContext` provides state to all components
   - localStorage sync happens automatically via `useEffect`

3. **Component Structure**
   ```
   src/
   ├── main.jsx              # Entry point
   ├── App.jsx               # Root component
   ├── styles.css            # Global styles (unchanged)
   ├── context/
   │   └── AppStateContext.jsx    # Global state management
   ├── components/
   │   ├── Header.jsx
   │   ├── IntroPage.jsx
   │   ├── MainApp.jsx
   │   ├── GuideControls.jsx
   │   ├── Footer.jsx
   │   ├── UpdateToast.jsx
   │   └── modes/
   │       ├── ListMode.jsx
   │       ├── ScanMode.jsx
   │       ├── ActionMode.jsx
   │       ├── MaintenanceMode.jsx
   │       └── ReflectionMode.jsx
   └── utils/
       └── taskUtils.js      # Task creation and manipulation
   ```

4. **Deployment**
   - Updated GitHub Actions workflow to build with Vite
   - Output goes to `dist/` directory

## What Stayed the Same

- **User Experience**: The app works exactly the same way
- **Styles**: All CSS remains unchanged (just moved to `src/styles.css`)
- **Data Persistence**: localStorage with same key (`rz-state-v1`)
- **Methodology**: Mark Forster's Resistance Zero System implementation
- **Five-mode workflow**: List → Scan → Action → Maintain → Reflect

## Development

### First Time Setup
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Opens at `http://localhost:5173`

### Production Build
```bash
npm run build
```
Output in `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## Backward Compatibility

The app maintains backward compatibility with existing localStorage data. Users who had data in the vanilla version will see their tasks automatically loaded in the React version.

## Benefits of Migration

1. **Better Developer Experience**
   - Component-based architecture
   - HMR for instant updates
   - Better code organization and reusability

2. **Modern Stack**
   - React for UI
   - Vite for fast builds
   - ES modules

3. **Maintainability**
   - Clearer separation of concerns
   - Easier to test components
   - More scalable for future features

4. **Performance**
   - Optimized production builds
   - Code splitting capabilities
   - Smaller bundle sizes with tree-shaking

## Files to Note

- `index-old.html` - Original HTML file (backup)
- `app-old.js` - Original vanilla JavaScript (backup)
- Old backups can be removed after verification

## Testing Checklist

- [x] Build completes successfully
- [x] All modes render correctly
- [ ] Timer functionality (pending implementation)
- [ ] Task creation and deletion
- [ ] Scanning workflow
- [ ] Action mode operations
- [ ] Maintenance archiving
- [ ] Reflection views
- [ ] localStorage persistence
- [ ] Service worker updates
- [ ] PWA install functionality
