/**
 * SectionManager - Manages content sections and their lifecycle
 * Handles section loading, rendering, and state management
 */

export class SectionManager {
    constructor(app) {
        this.app = app;
        this.sections = new Map();
        this.currentSection = null;
        this.sectionCache = new Map();
    }
    
    /**
     * Initialize section manager
     */
    init() {
        // Load section definitions from config
        const sectionConfigs = this.app.config.navigation?.sections || [];
        
        sectionConfigs.forEach(config => {
            this.registerSection(config);
        });
        
        // Setup section container
        this.setupContainer();
        
        console.log('✅ Section manager initialized');
    }
    
    /**
     * Register a section
     */
    registerSection(config) {
        this.sections.set(config.id, {
            id: config.id,
            title: config.title,
            icon: config.icon,
            loaded: false,
            content: null,
            config: config
        });
    }
    
    /**
     * Setup main content container
     */
    setupContainer() {
        const container = document.getElementById('content');
        if (!container) return;
        
        // Add loading indicator
        container.innerHTML = `
            <div id="section-loader" class="section-loader" style="display:none;">
                <div class="loader-spinner"></div>
                <div class="loader-text">Loading section...</div>
            </div>
            <div id="section-content" class="section-content"></div>
        `;
    }
    
    /**
     * Show a section
     */
    async showSection(sectionId) {
        console.log(`📄 Loading section: ${sectionId}`);
        
        // Check if section exists
        if (!this.sections.has(sectionId)) {
            console.error(`Section not found: ${sectionId}`);
            this.showError('Section not found');
            return;
        }
        
        // Show loader
        this.showLoader();
        
        try {
            // Get section data
            const section = this.sections.get(sectionId);
            
            // Load content if not cached
            if (!section.content) {
                await this.loadSectionContent(section);
            }
            
            // Render section
            await this.renderSection(section);
            
            // Update state
            this.currentSection = sectionId;
            section.loaded = true;
            
            // Hide loader
            this.hideLoader();
            
            // Emit event
            this.app.emit('section:loaded', { sectionId });
            
        } catch (error) {
            console.error(`Failed to load section ${sectionId}:`, error);
            this.hideLoader();
            this.showError('Failed to load section');
        }
    }
    
    /**
     * Load section content
     */
    async loadSectionContent(section) {
        // Check cache first
        if (this.sectionCache.has(section.id)) {
            section.content = this.sectionCache.get(section.id);
            console.log(`Loaded ${section.id} from cache:`, section.content);
            return;
        }
        
        // Try to load from content files
        try {
            const response = await fetch(`content/${section.id}.json`);
            if (response.ok) {
                const data = await response.json();
                section.content = data;
                this.sectionCache.set(section.id, data);
                console.log(`Loaded ${section.id} from JSON:`, data);
                console.log(`Checklist items for ${section.id}:`, data.checklistItems);
                return;
            }
        } catch (error) {
            console.log(`No JSON content for ${section.id}, using default`);
        }
        
        // Use default content
        section.content = this.getDefaultContent(section.id);
        this.sectionCache.set(section.id, section.content);
    }
    
    /**
     * Get default content for section
     */
    getDefaultContent(sectionId) {
        // Default content templates
        const defaults = {
            overview: {
                title: "Data Analysis Procedure Overview",
                subtitle: "Vendor Spend Analysis & Dashboard Creation",
                content: `
                    <div class="overview-hero">
                        <h1>Welcome to Versatex SOP Platform</h1>
                        <p>Modern, modular architecture for vendor spend analysis procedures.</p>
                    </div>
                    <div class="overview-features">
                        <div class="feature-card">
                            <i class="fas fa-calendar-check"></i>
                            <h3>22-Day Delivery</h3>
                            <p>Complete analysis in 22 business days (4 weeks + 2 days)</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-layer-group"></i>
                            <h3>5-Level Taxonomy</h3>
                            <p>Industry-standard categorization framework for spend analysis</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-chart-line"></i>
                            <h3>Real-time Progress</h3>
                            <p>Track every step with weighted milestone tracking</p>
                        </div>
                    </div>
                `
            },
            prerequisites: {
                title: "Prerequisites & Setup",
                subtitle: "Initial requirements and configuration",
                content: `<p>Prerequisites content will be loaded here.</p>`
            },
            dataCollection: {
                title: "Data Collection",
                subtitle: "Gathering vendor spend data",
                content: `<p>Data collection procedures will be displayed here.</p>`
            }
        };
        
        return defaults[sectionId] || {
            title: 'Section',
            subtitle: '',
            content: `<p>Content for ${sectionId} will be loaded here.</p>`
        };
    }
    
    /**
     * Render section content
     */
    async renderSection(section) {
        const container = document.getElementById('section-content');
        if (!container) return;
        
        // Check if section has checkboxes
        const hasCheckboxes = section.content.checklistItems && section.content.checklistItems.length > 0;
        console.log(`Section ${section.id} - Has checkboxes: ${hasCheckboxes}, Checklist items:`, section.content.checklistItems);
        
        // Build section HTML
        const html = `
            <article class="section" data-section="${section.id}">
                <header class="section-header">
                    <div class="section-header-main">
                        <h1 class="section-title">
                            <i class="${section.icon || 'fas fa-file-alt'}"></i>
                            ${section.content.title}
                        </h1>
                        ${hasCheckboxes ? this.renderSectionResetButton(section) : ''}
                    </div>
                    ${section.content.subtitle ? 
                        `<p class="section-subtitle">${section.content.subtitle}</p>` : ''}
                </header>
                <div class="section-body">
                    ${section.content.content || ''}
                </div>
                ${this.renderSectionActions(section)}
            </article>
        `;
        
        // Set content
        container.innerHTML = html;
        
        // Process any dynamic content
        await this.processDynamicContent(section);
        
        // Setup section-specific features
        this.setupSectionFeatures(section);
        
        // Setup reset button if present
        if (hasCheckboxes) {
            this.setupSectionResetButton(section);
        }
        
        // Trigger progress tracker to scan new checkboxes
        setTimeout(() => {
            if (this.app.progress) {
                this.app.progress.scanCheckboxes();
            }
        }, 200);
        
        // Scroll to top
        container.scrollTop = 0;
    }
    
    /**
     * Render section reset button
     */
    renderSectionResetButton(section) {
        return `
            <button class="section-reset-btn" id="reset-${section.id}" title="Reset checkboxes in this section">
                <i class="fas fa-undo"></i>
                <span>Reset Section</span>
            </button>
        `;
    }
    
    /**
     * Setup section reset button
     */
    setupSectionResetButton(section) {
        const resetBtn = document.getElementById(`reset-${section.id}`);
        if (!resetBtn) {
            console.warn(`Reset button not found for section: ${section.id}`);
            return;
        }
        
        console.log(`Setting up reset button for section: ${section.id}`);
        
        // Use arrow function to preserve 'this' context
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Reset button clicked for section: ${section.id}`);
            
            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
                this.resetSectionCheckboxes(section);
            }, 100);
        });
    }
    
    /**
     * Reset all checkboxes in a section
     */
    resetSectionCheckboxes(section) {
        const sectionName = section.content.title || section.id;
        
        if (!confirm(`Are you sure you want to reset all checkboxes in "${sectionName}"? This cannot be undone.`)) {
            return;
        }
        
        console.log(`Resetting checkboxes for section ${section.id}`);
        
        // Method 1: Try to find checkboxes by their IDs from config
        const checkboxIds = section.content.checklistItems || [];
        let resetCount = 0;
        let foundByIdCount = 0;
        
        // First try to reset by IDs
        if (checkboxIds.length > 0) {
            checkboxIds.forEach(checkboxId => {
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    foundByIdCount++;
                    if (checkbox.checked) {
                        checkbox.checked = false;
                        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        resetCount++;
                    }
                }
                
                // Also reset in ProgressTracker directly
                if (this.app.progress && this.app.progress.checkboxStates.has(checkboxId)) {
                    this.app.progress.checkboxStates.set(checkboxId, false);
                }
            });
        }
        
        // Method 2: Also find all checkboxes in the current section content
        const sectionContent = document.querySelector('#section-content');
        if (sectionContent) {
            const allCheckboxes = sectionContent.querySelectorAll('input[type="checkbox"]');
            console.log(`Found ${allCheckboxes.length} checkboxes in current section`);
            
            allCheckboxes.forEach(checkbox => {
                // Skip if already processed by ID
                if (checkboxIds.includes(checkbox.id)) {
                    return;
                }
                
                if (checkbox.checked) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    resetCount++;
                }
                
                // Update visual state
                const label = checkbox.id ? document.querySelector(`label[for="${checkbox.id}"]`) : null;
                const parent = checkbox.closest('li') || checkbox.parentElement;
                
                if (label) {
                    label.style.textDecoration = 'none';
                    label.style.opacity = '1';
                }
                if (parent) {
                    parent.classList.remove('completed');
                }
            });
        }
        
        // Save states if progress tracker is available
        if (this.app.progress) {
            this.app.progress.saveStates();
            this.app.progress.updateProgress();
        }
        
        // Show confirmation
        if (resetCount > 0) {
            this.showResetToast(`Reset ${resetCount} checkbox${resetCount > 1 ? 'es' : ''} in ${sectionName}`, '#10b981');
        } else {
            this.showResetToast('All checkboxes were already unchecked', '#3b82f6');
        }
        
        console.log(`Reset summary: ${resetCount} checkboxes reset, ${foundByIdCount} found by ID`);
        
        // Emit event
        this.app.emit('section:reset', { 
            sectionId: section.id, 
            resetCount,
            totalCheckboxes: checkboxIds.length || allCheckboxes?.length || 0
        });
    }
    
    /**
     * Show reset toast notification
     */
    showResetToast(message, color = '#3b82f6') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.reset-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'reset-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
        `;
        
        // Add animation keyframes if not already present
        if (!document.querySelector('#reset-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'reset-toast-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Render section actions
     */
    renderSectionActions(section) {
        const actions = [];
        
        // Add navigation buttons
        const sections = Array.from(this.sections.keys());
        const currentIndex = sections.indexOf(section.id);
        
        if (currentIndex > 0) {
            actions.push(`
                <button class="btn btn-secondary" onclick="SOPApp.navigate('${sections[currentIndex - 1]}')">
                    <i class="fas fa-arrow-left"></i> Previous
                </button>
            `);
        }
        
        if (currentIndex < sections.length - 1) {
            actions.push(`
                <button class="btn btn-primary" onclick="SOPApp.navigate('${sections[currentIndex + 1]}')">
                    Next <i class="fas fa-arrow-right"></i>
                </button>
            `);
        }
        
        if (actions.length > 0) {
            return `
                <footer class="section-footer">
                    <div class="section-actions">
                        ${actions.join('')}
                    </div>
                </footer>
            `;
        }
        
        return '';
    }
    
    /**
     * Process dynamic content
     */
    async processDynamicContent(section) {
        // Process checklists
        const checklists = document.querySelectorAll('.checklist-item');
        checklists.forEach(item => {
            this.setupChecklistItem(item);
        });
        
        // Process collapsibles
        const collapsibles = document.querySelectorAll('.collapsible');
        collapsibles.forEach(item => {
            this.setupCollapsible(item);
        });
        
        // Process code blocks
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            this.setupCodeBlock(block);
        });
    }
    
    /**
     * Setup section-specific features
     */
    setupSectionFeatures(section) {
        // Section-specific module loading
        if (section.config.module) {
            this.app.loadModule(section.config.module);
        }
        
        // Section-specific shortcuts
        if (section.config.shortcuts) {
            this.setupShortcuts(section.config.shortcuts);
        }
    }
    
    /**
     * Setup checklist item
     */
    setupChecklistItem(item) {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (!checkbox) return;
        
        const itemId = item.dataset.id;
        const completed = this.app.state.get('completedChecklists') || [];
        
        // Set initial state
        checkbox.checked = completed.includes(itemId);
        
        // Handle change
        checkbox.addEventListener('change', () => {
            this.toggleChecklistItem(itemId, checkbox.checked);
        });
    }
    
    /**
     * Toggle checklist item
     */
    toggleChecklistItem(itemId, checked) {
        const completed = this.app.state.get('completedChecklists') || [];
        
        if (checked) {
            if (!completed.includes(itemId)) {
                completed.push(itemId);
            }
        } else {
            const index = completed.indexOf(itemId);
            if (index > -1) {
                completed.splice(index, 1);
            }
        }
        
        this.app.state.set('completedChecklists', completed);
        this.app.emit('checklist:toggle', { itemId, checked });
    }
    
    /**
     * Setup collapsible element
     */
    setupCollapsible(element) {
        const toggle = element.querySelector('.collapsible-toggle');
        const content = element.querySelector('.collapsible-content');
        
        if (toggle && content) {
            toggle.addEventListener('click', () => {
                element.classList.toggle('expanded');
                const expanded = element.classList.contains('expanded');
                content.style.display = expanded ? 'block' : 'none';
            });
        }
    }
    
    /**
     * Setup code block
     */
    setupCodeBlock(block) {
        // Add copy button
        const wrapper = block.parentElement;
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'Copy code';
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent);
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
        
        wrapper.style.position = 'relative';
        wrapper.appendChild(copyBtn);
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupShortcuts(shortcuts) {
        shortcuts.forEach(shortcut => {
            document.addEventListener('keydown', (e) => {
                if (this.matchShortcut(e, shortcut.key)) {
                    e.preventDefault();
                    shortcut.action();
                }
            });
        });
    }
    
    /**
     * Match keyboard shortcut
     */
    matchShortcut(event, shortcutKey) {
        const parts = shortcutKey.toLowerCase().split('+');
        return parts.every(part => {
            switch(part) {
                case 'ctrl': return event.ctrlKey;
                case 'alt': return event.altKey;
                case 'shift': return event.shiftKey;
                case 'meta': return event.metaKey;
                default: return event.key.toLowerCase() === part;
            }
        });
    }
    
    /**
     * Show loader
     */
    showLoader() {
        const loader = document.getElementById('section-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }
    
    /**
     * Hide loader
     */
    hideLoader() {
        const loader = document.getElementById('section-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const container = document.getElementById('section-content');
        if (container) {
            container.innerHTML = `
                <div class="section-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Error Loading Section</h2>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Get current section
     */
    getCurrentSection() {
        return this.currentSection;
    }
    
    /**
     * Refresh current section
     */
    async refreshSection() {
        if (this.currentSection) {
            const section = this.sections.get(this.currentSection);
            if (section) {
                section.content = null; // Clear cache
                await this.showSection(this.currentSection);
            }
        }
    }
}