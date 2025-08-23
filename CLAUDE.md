# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Versatex SOPv3 is a Progressive Web App (PWA) for vendor spend analysis Standard Operating Procedures. It's a **static, client-side only application** with no build process, no npm packages, and no backend dependencies.

## Technology Stack

- **Frontend:** Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **No Framework:** Pure vanilla JavaScript - no React, Vue, or Angular
- **No Build System:** Direct file editing - no webpack, rollup, or build step
- **No Package Manager:** No npm/yarn - CDN only for external dependencies
- **Storage:** localStorage for state persistence
- **PWA:** Service Workers with offline-first caching
- **External Dependencies:** Font Awesome 6.4.0 (CDN only)

## Development Commands

### Running Locally
```bash
# Python 3 (port 8001 to avoid conflicts)
python -m http.server 8001

# Node.js alternative
npx serve . -p 8001

# Open http://localhost:8001
```

### No Testing Framework
This project has **no automated tests**. All testing is manual through:
1. Browser testing (Chrome, Firefox, Edge)
2. PWA functionality verification
3. Offline mode testing via DevTools
4. Manual progress tracking validation

### No Linting/Formatting
No ESLint, Prettier, or other code quality tools are configured. Follow existing code patterns.

## Core Architecture

### Application Bootstrap Flow
```javascript
// index.html → core/app.js
1. App.init() initializes all core modules
2. State management loads from localStorage
3. Navigation populates from config.json sections
4. Content loads from JSON files in /content/
5. Progress tracker restores checkbox states
6. Service worker registers for offline support
```

### Module System
```javascript
// Dynamic module loading in core/loader.js
const moduleMapping = {
    'timeline': 'modules/timeline/timeline.js',
    'decisionTool': 'modules/decision-tool/decision-tool.js',
    'healthMonitor': 'modules/health-monitor/monitor.js'
};
```

### Weighted Progress Calculation
```javascript
// core/progress.js - Critical for tracking
this.weights = {
    dataCollectionMustHave: 0.25,  // 5 critical fields
    categorization: 0.20,           // 5 categorization tasks
    otherCheckboxes: 0.55          // All other checkboxes
};

// Must-have field IDs (do not change)
this.mustHaveFields = new Set([
    'field-1', 'field-2', 'field-3', 'field-4', 'field-6'
]);
```

### State Persistence Pattern
```javascript
// All state saved to localStorage with 'sop_v3_' prefix
localStorage.setItem('sop_v3_checkbox_states', JSON.stringify(states));
localStorage.setItem('sop_v3_current_section', sectionId);
```

## Critical Implementation Details

### Service Worker Cache Management
```javascript
// service-worker.js - Update version when files change
const CACHE_NAME = 'versatex-sop-v3.0.0'; // Increment for updates
```

### Content Structure
All content is in JSON files under `/content/`:
- Each section has checkboxes with unique IDs
- Checkbox IDs follow patterns: `field-N`, `cat-N`, `prereq-N`, etc.
- Never change existing checkbox IDs (breaks saved progress)

### Theme Variables
```css
/* Maintain these exact color values */
:root {
    --primary-color: #1e3a5f;    /* Navy Blue */
    --secondary-color: #4a7ba7;   /* Light Blue */
    --accent-color: #00d4ff;      /* Cyan */
    --success-color: #10b981;     
    --warning-color: #f59e0b;     
    --danger-color: #ef4444;
}
```

## Documentation Pages

### docs/quick-reference.html
- 9 tabs with keyboard shortcuts (1-9)
- Dark mode toggle (Ctrl+D)
- Global search (Ctrl+K)
- 13px font for density
- Copy buttons for SQL/formulas

### docs/analysis-checklist.html
- 8 phase cards
- Real-time progress bar
- Print-optimized CSS
- 18px custom checkboxes

## Deployment

### GitHub Pages
```bash
# Direct push to main branch auto-deploys
git add .
git commit -m "Update: [description]"
git push origin main

# Live at: https://defoxxanalytics.github.io/SOP.v3/
```

### Important Paths
- All paths must be **relative** for GitHub Pages
- No leading slashes in URLs
- Use `./` prefix for local resources

## Common Tasks

### Adding a New Section
1. Create JSON file in `/content/new-section.json`
2. Add section to `config.json` navigation array
3. Update service worker cache list
4. Increment service worker version

### Modifying Checkboxes
1. Edit JSON in `/content/` directory
2. Keep existing checkbox IDs unchanged
3. Add new checkboxes with unique IDs
4. Test progress calculation

### Updating Module
1. Edit files in `/modules/[module-name]/`
2. Update module version in `config.json`
3. Test dynamic loading via console
4. Clear cache and test offline

## Constraints & Limitations

1. **No build process** - Cannot use JSX, TypeScript, or modern syntax requiring transpilation
2. **No npm packages** - Only CDN-hosted libraries
3. **No backend API** - All data is client-side
4. **localStorage limits** - ~5-10MB maximum
5. **ES6 modules only** - No CommonJS or AMD
6. **GitHub Pages only** - No server-side features

## Testing Checklist

Before any changes:
- [ ] Test in Chrome, Firefox, Edge
- [ ] Verify offline mode works
- [ ] Check progress saves/loads correctly
- [ ] Test PWA installation
- [ ] Validate all navigation links
- [ ] Ensure no console errors
- [ ] Test on mobile viewport
- [ ] Verify service worker updates

## Project Timeline

**22-Day Implementation** (not 6 weeks):
- Days 1-5: Data Collection
- Days 6-8: Quality Assessment  
- Days 9-11: Data Cleansing
- Days 12-14: Categorization
- Days 15-17: Analysis
- Days 18-19: Dashboard Development
- Day 20: Review & QA
- Days 21-22: Delivery & Training