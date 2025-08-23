/**
 * Navigation - Handles sidebar navigation and menu interactions
 * Manages the navigation state and active section highlighting
 */

export class Navigation {
    constructor(app) {
        this.app = app;
        this.currentActive = null;
        this.menuItems = new Map();
        this.collapsed = false;
    }
    
    /**
     * Render navigation menu
     */
    async render() {
        const nav = document.getElementById('navigation');
        if (!nav) return;
        
        const sections = this.app.config.navigation?.sections || [];
        
        // Build navigation HTML
        const navHTML = `
            <div class="sidebar-brand">
                <img src="assets/images/vtx_logo_white.png" alt="Versatex" class="sidebar-logo">
                <div class="brand-text">
                    <h2>VERSATEX</h2>
                    <span>Analytics Platform</span>
                </div>
            </div>
            <div class="nav-header">
                <h3>Procurement Analysis</h3>
                <button id="nav-toggle" class="nav-toggle" aria-label="Toggle navigation">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            <ul class="nav-list">
                ${sections.map(section => this.createNavItem(section)).join('')}
            </ul>
            <div class="progress-summary">
                <div class="progress-header">
                    <span class="progress-label">Overall Progress</span>
                    <button id="global-reset-btn" class="global-reset-btn" title="Reset all checkboxes">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="overall-progress"></div>
                </div>
                <span class="progress-percent" id="progress-percent">0%</span>
            </div>
            <div class="nav-footer">
                <div class="sidebar-footer">
                    <div class="footer-content">
                        <p class="version">Version 3.0.0</p>
                        <p class="copyright">© 2025 Versatex Analytics</p>
                        <div style="margin: 10px 0;">
                            <a href="pwa-info.html" target="_blank" style="
                                color: #00d4ff;
                                text-decoration: none;
                                font-size: 0.85rem;
                                display: inline-flex;
                                align-items: center;
                                gap: 5px;
                                padding: 6px 12px;
                                border: 1px solid rgba(0, 212, 255, 0.3);
                                border-radius: 6px;
                                background: rgba(0, 212, 255, 0.05);
                                transition: all 0.3s ease;
                            " onmouseover="this.style.background='rgba(0, 212, 255, 0.15)'" onmouseout="this.style.background='rgba(0, 212, 255, 0.05)'">
                                <i class="fas fa-download"></i> Install as App
                            </a>
                        </div>
                        <p class="support">
                            <i class="fas fa-question-circle"></i>
                            <a href="#" onclick="alert('Contact support@versatex.com'); return false;">Get Support</a>
                        </p>
                        <p class="support" style="margin-top: 10px;">
                            <i class="fas fa-book"></i>
                            <a href="docs/index.html" target="_blank">Documentation</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        nav.innerHTML = navHTML;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update progress
        this.updateProgress();
        
        // Navigation rendered
    }
    
    /**
     * Create navigation item HTML
     */
    createNavItem(section) {
        const icon = section.icon || 'fas fa-file-alt';
        const badge = section.badge ? `<span class="nav-badge">${section.badge}</span>` : '';
        
        return `
            <li class="nav-item" data-section="${section.id}">
                <a href="#${section.id}" class="nav-link" data-route="${section.id}">
                    <i class="${icon}"></i>
                    <span class="nav-text">${section.title}</span>
                    ${badge}
                </a>
            </li>
        `;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle button
        const toggleBtn = document.getElementById('nav-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Global reset button
        const globalResetBtn = document.getElementById('global-reset-btn');
        if (globalResetBtn) {
            globalResetBtn.addEventListener('click', () => {
                if (this.app.progress) {
                    this.app.progress.reset();
                }
            });
        }
        
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            this.menuItems.set(item.dataset.section, item);
            
            item.addEventListener('click', (e) => {
                const section = item.dataset.section;
                if (section) {
                    e.preventDefault();
                    this.app.navigate(section);
                }
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // State subscription
        this.app.state.subscribe('currentSection', (section) => {
            this.setActive(section);
        });
        
        // Progress updates are now handled by ProgressTracker
        // Subscribe to progress updates if needed
        if (this.app.progress) {
            this.app.progress.onProgress((stats) => {
                // Progress is automatically updated by ProgressTracker
            });
        }
    }
    
    /**
     * Set active navigation item
     */
    setActive(sectionId) {
        // Remove previous active
        if (this.currentActive) {
            const prevItem = this.menuItems.get(this.currentActive);
            if (prevItem) {
                prevItem.classList.remove('active');
            }
        }
        
        // Set new active
        const item = this.menuItems.get(sectionId);
        if (item) {
            item.classList.add('active');
            this.currentActive = sectionId;
            
            // Ensure item is visible if sidebar is scrollable
            this.ensureVisible(item);
        }
    }
    
    /**
     * Toggle sidebar collapsed state
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (sidebar && mainContent) {
            this.collapsed = !this.collapsed;
            
            if (this.collapsed) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('sidebar-collapsed');
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('sidebar-collapsed');
            }
            
            // Save state
            this.app.state.set('sidebarCollapsed', this.collapsed);
            
            // Emit event
            this.app.emit('sidebar:toggle', { collapsed: this.collapsed });
        }
    }
    
    /**
     * Ensure nav item is visible
     */
    ensureVisible(item) {
        const nav = document.getElementById('navigation');
        if (!nav) return;
        
        const navRect = nav.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        
        if (itemRect.top < navRect.top) {
            item.scrollIntoView({ block: 'start', behavior: 'smooth' });
        } else if (itemRect.bottom > navRect.bottom) {
            item.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
    }
    
    /**
     * Update overall progress
     * Note: This is now handled by ProgressTracker but kept for compatibility
     */
    updateProgress() {
        // Trigger progress tracker to update if available
        if (this.app.progress) {
            this.app.progress.scanCheckboxes();
            this.app.progress.updateProgress();
        }
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        // Alt + N to focus navigation
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            const firstItem = document.querySelector('.nav-item');
            if (firstItem) {
                firstItem.querySelector('.nav-link').focus();
            }
        }
        
        // Alt + M to toggle sidebar
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            this.toggleSidebar();
        }
    }
    
    /**
     * Get current section
     */
    getCurrentSection() {
        return this.currentActive;
    }
    
    /**
     * Navigate to next section
     */
    navigateNext() {
        const sections = Array.from(this.menuItems.keys());
        const currentIndex = sections.indexOf(this.currentActive);
        
        if (currentIndex < sections.length - 1) {
            this.app.navigate(sections[currentIndex + 1]);
        }
    }
    
    /**
     * Navigate to previous section
     */
    navigatePrevious() {
        const sections = Array.from(this.menuItems.keys());
        const currentIndex = sections.indexOf(this.currentActive);
        
        if (currentIndex > 0) {
            this.app.navigate(sections[currentIndex - 1]);
        }
    }
}