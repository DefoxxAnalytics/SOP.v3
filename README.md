# Versatex SOP Platform v3.0

## Vendor Spend Analysis Dashboard - Standard Operating Procedures

A modern Progressive Web App (PWA) for managing vendor spend analysis workflows with offline capabilities, real-time progress tracking, and interactive decision support tools.

## 🌐 Live Demo

**Access the application at:** [https://defoxxanalytics.github.io/SOP.v3/](https://defoxxanalytics.github.io/SOP.v3/)

## ✨ Features

### Core Functionality
- **11 Comprehensive SOP Sections** - From data collection to dashboard delivery
- **Dynamic Progress Tracking** - Weighted progress system with critical gates
- **Offline Capable** - Full functionality without internet connection
- **Installable PWA** - Works like a native desktop/mobile app
- **Real-time Search** - Instant content search across all sections
- **Persistent State** - Progress saves automatically

### Interactive Modules
- **Timeline Visualizer** - Interactive Gantt chart for project planning
- **Decision Support Tool** - AI-powered recommendations for analysis decisions
- **Health Monitor** - Real-time project health metrics and KPIs

### Documentation Suite
- **Ultra-Compact Quick Reference** - Tabbed interface with dark mode, search, and keyboard shortcuts
- **Interactive Analysis Checklist** - Phase-based tracking with real-time progress visualization
- **Documentation Hub** - Central access point for all guides and resources

## 🚀 Quick Start

### Option 1: Use GitHub Pages (Recommended)
Simply visit: [https://defoxxanalytics.github.io/SOP.v3/](https://defoxxanalytics.github.io/SOP.v3/)

### Option 2: Clone and Run Locally

```bash
# Clone the repository
git clone https://github.com/DefoxxAnalytics/SOP.v3.git
cd SOP.v3

# Serve with Python 3
python -m http.server 8001

# Or serve with Node.js
npx serve . -p 8001

# Then open http://localhost:8001
```

### Install as PWA

1. Visit [https://defoxxanalytics.github.io/SOP.v3/](https://defoxxanalytics.github.io/SOP.v3/)
2. Click the install icon (➕) in the address bar (Chrome/Edge)
3. Or use the "Install Guide" button in the header
4. Access the PWA guide at [https://defoxxanalytics.github.io/SOP.v3/pwa-info.html](https://defoxxanalytics.github.io/SOP.v3/pwa-info.html)

## 🌐 Browser Support

| Browser | PWA Install | Offline | Service Worker |
|---------|------------|---------|----------------|
| Chrome | ✅ Full | ✅ Yes | ✅ Yes |
| Edge | ✅ Full | ✅ Yes | ✅ Yes |
| Firefox | ❌ No | ✅ Yes | ✅ Yes |
| Safari iOS | ⚠️ Manual | ✅ Yes | ✅ Yes |
| Brave | ✅ Full | ✅ Yes | ✅ Yes |

## 📁 Project Structure

```
SOPv3/
├── index.html           # Main application
├── manifest.json        # PWA manifest
├── service-worker.js    # Offline functionality
├── config.json         # Application configuration
├── pwa-info.html       # PWA installation guide
│
├── 📚 Documentation
│   ├── VENDOR_SPEND_ANALYSIS_GUIDE.md  # Complete 22-day implementation guide
│   ├── QUICK_REFERENCE_GUIDE.md        # Quick reference for analysts
│   └── ANALYSIS_CHECKLIST.md           # Printable checklist for projects
│
├── docs/               # Interactive HTML Documentation
│   ├── index.html     # Documentation hub
│   ├── quick-reference.html    # Ultra-compact reference (9 tabs, dark mode)
│   └── analysis-checklist.html # Interactive checklist with progress
│
├── core/               # Core application modules
│   ├── app.js         # Main application controller
│   ├── navigation.js  # Navigation system
│   ├── progress.js    # Progress tracking
│   ├── pwa.js        # PWA management
│   ├── sections.js   # Section management
│   ├── search.js     # Search functionality
│   ├── state.js      # State management
│   └── storage.js    # Local storage handler
│
├── modules/           # Interactive modules
│   ├── timeline/     # Timeline visualizer
│   ├── decision-tool/# Decision support
│   └── health-monitor/# Project health
│
├── content/          # SOP content (JSON)
├── styles/          # CSS stylesheets
└── assets/          # Images and documents
```

## 🎯 Key Features

### Weighted Progress System
- **Must-Have Fields** (25%) - Critical data requirements
- **Categorization** (20%) - Essential classification steps
- **Other Tasks** (55%) - Supporting analysis activities

### Design System
- **Navy Blue Theme** - Professional color palette (#1e3a5f, #4a7ba7, #00d4ff)
- **Glassmorphism UI** - Modern transparent effects
- **Responsive Layout** - Mobile-first design approach
- **Accessibility** - ARIA labels and keyboard navigation

### Documentation Features

#### Quick Reference (docs/quick-reference.html)
- **9-Tab Interface** - Timeline, Fields, Formulas, Categories, Savings, Red Flags, Power BI, Gates, Pitfalls
- **Dark Mode Toggle** - Eye-friendly reading experience
- **Global Search** - Real-time filtering across all content
- **Copy Buttons** - One-click copy for formulas and SQL queries
- **Keyboard Shortcuts** - Ctrl+K (search), Ctrl+D (dark mode), 1-9 (tabs)
- **Ultra-Compact Design** - Maximum information density (13px base font)

#### Analysis Checklist (docs/analysis-checklist.html)
- **8 Phase Cards** - Collapsible sections for each analysis phase
- **Real-time Progress** - Visual progress bar with shimmer animation
- **Custom Checkboxes** - Styled 18px checkboxes with Navy Blue theme
- **Priority Badges** - Critical, Important, Optional indicators
- **Sticky Header** - Always visible progress tracking
- **Print-Friendly** - Optimized CSS for physical checklists

## 🔑 Critical Data Requirements

### Must-Have Fields for Analysis
1. **Transaction ID/Invoice Number** - Unique identifier
2. **Supplier Name and ID** - Vendor identification
3. **Spend Amount** - With currency specification
4. **Transaction Date** - For temporal analysis
5. **Description** - Product/service details

### 5-Level Categorization Taxonomy
1. **Level 1** - Direct vs Indirect Spend
2. **Level 2** - Category Groups (10-15 groups)
3. **Level 3** - Categories (40-60 categories)
4. **Level 4** - Sub-categories (200-300)
5. **Level 5** - Commodities (1000+)

## 📊 Timeline

**22-Day Implementation Schedule**
- **Days 1-5**: Data Collection & Aggregation
- **Days 6-8**: Quality Assessment & Validation
- **Days 9-11**: Data Cleansing & Standardization
- **Days 12-14**: Categorization & Classification
- **Days 15-17**: Analysis & Insights Generation
- **Days 18-19**: Dashboard Development
- **Day 20**: Review & Quality Assurance
- **Days 21-22**: Delivery & Training

## 🛠️ Development

### Running Locally
```bash
# Python 3
python -m http.server 8001

# Node.js
npx serve . -p 8001

# Then open http://localhost:8001
```

### Testing Offline Mode
1. Open Developer Tools (F12)
2. Go to Application > Service Workers
3. Check "Offline" checkbox
4. Navigate the app - should work without internet

### Deployment to GitHub Pages
```bash
# Push to main branch
git add .
git commit -m "Update: [your changes]"
git push origin main

# GitHub Pages automatically deploys from main branch
```

## 📝 License

© 2025 Versatex Analytics - All Rights Reserved

## 🤝 Support

For support, please contact:
- Email: support@versatex.com
- Documentation: [https://defoxxanalytics.github.io/SOP.v3/docs/](https://defoxxanalytics.github.io/SOP.v3/docs/)

## 🏆 Credits

Built with modern web technologies:
- Vanilla JavaScript (ES6+)
- CSS3 with Custom Properties
- Font Awesome Icons
- Progressive Web App APIs
- Service Workers for offline functionality