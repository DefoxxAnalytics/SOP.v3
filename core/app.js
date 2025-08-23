/**
 * SOPApplication - Core application controller
 * Version: 3.0.0
 * 
 * This is the main application class that bootstraps the SOP platform,
 * manages modules, handles state, and coordinates all components.
 */

import { Router } from './router.js';
import { StateManager } from './state.js';
import { ModuleLoader } from './loader.js';
import { Navigation } from './navigation.js';
import { SectionManager } from './sections.js';
import { SearchEngine } from './search.js';
import { StorageManager } from './storage.js';
import { ProgressTracker } from './progress.js';
import { PWAManager } from './pwa.js';

export class SOPApplication {
    constructor(config) {
        this.config = config;
        this.version = config.app?.version || '3.0.0';
        this.modules = new Map();
        this.state = null;
        this.eventBus = new EventTarget();
        this.initialized = false;
        
        // Platform initialization
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading progress
            this.updateLoadProgress(10, 'Initializing core...');
            
            // Initialize core components
            await this.initializeCore();
            this.updateLoadProgress(30, 'Loading content...');
            
            // Load SOP content
            await this.loadContent();
            this.updateLoadProgress(50, 'Setting up navigation...');
            
            // Setup UI components
            await this.setupUI();
            this.updateLoadProgress(70, 'Loading modules...');
            
            // Load auto-load modules
            await this.loadAutoModules();
            this.updateLoadProgress(90, 'Finalizing...');
            
            // Final setup
            this.setupEventListeners();
            this.initializeRouter();
            
            // Mark as initialized
            this.initialized = true;
            this.updateLoadProgress(100, 'Ready!');
            
            // Hide loader and show app
            setTimeout(() => {
                this.hideLoader();
                this.showApp();
                this.emit('app:ready');
            }, 500);
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    /**
     * Initialize core components
     */
    async initializeCore() {
        // Initialize state manager
        this.state = new StateManager(this);
        await this.state.init();
        
        // Initialize storage
        this.storage = new StorageManager(this.config.storage);
        
        // Initialize module loader
        this.moduleLoader = new ModuleLoader(this);
        
        // Initialize navigation
        this.navigation = new Navigation(this);
        
        // Initialize section manager
        this.sections = new SectionManager(this);
        this.sections.init();
        
        // Initialize search
        this.search = new SearchEngine(this);
        
        // Initialize progress tracker
        this.progress = new ProgressTracker(this);
        this.progress.init();
        
        // Initialize PWA manager
        this.pwa = new PWAManager(this);
        await this.pwa.init();
        
        // Initialize router
        this.router = new Router(this);
    }
    
    /**
     * Load SOP content
     */
    async loadContent() {
        try {
            // In production, this would load from content/*.json files
            // For now, we'll create mock content
            this.content = {
                sections: this.config.navigation.sections,
                data: {
                    overview: {
                        title: "Data Analysis Procedure",
                        subtitle: "Vendor Spend Analysis & Dashboard Creation",
                        content: "Welcome to SOP v3.0 - Modern modular architecture"
                    }
                    // Additional sections would be loaded from JSON files
                }
            };
            
            // Store in state
            this.state.set('content', this.content);
            
        } catch (error) {
            console.error('Failed to load content:', error);
            throw error;
        }
    }
    
    /**
     * Setup UI components
     */
    async setupUI() {
        // Initialize navigation menu
        await this.navigation.render();
        
        // Setup module shortcuts
        this.setupModuleShortcuts();
        
        // Setup search
        this.search.init();
        
        // Setup floating action button
        this.setupFAB();
    }
    
    /**
     * Load auto-load modules
     */
    async loadAutoModules() {
        const modules = this.config.modules;
        const promises = [];
        
        for (const [name, config] of Object.entries(modules)) {
            if (config.enabled && config.autoLoad) {
                promises.push(this.loadModule(name));
            }
        }
        
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }
    
    /**
     * Load a module
     */
    async loadModule(moduleName) {
        try {
            // Check if already loaded
            if (this.modules.has(moduleName)) {
                // Module already loaded
                return this.modules.get(moduleName);
            }
            
            // Loading module
            
            // Load the module
            const module = await this.moduleLoader.load(moduleName);
            
            // Store module reference
            this.modules.set(moduleName, module);
            
            // Initialize module
            if (module.init) {
                await module.init(this);
            }
            
            // Emit event
            this.emit('module:loaded', { name: moduleName, module });
            
            // Module loaded successfully
            return module;
            
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            this.emit('module:error', { name: moduleName, error });
            throw error;
        }
    }
    
    /**
     * Setup module shortcuts
     */
    setupModuleShortcuts() {
        const shortcuts = document.querySelectorAll('.module-btn');
        shortcuts.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const moduleName = e.currentTarget.dataset.module;
                if (moduleName) {
                    await this.loadModule(moduleName);
                    this.emit('module:activated', { name: moduleName });
                }
            });
        });
    }
    
    /**
     * Setup floating action button
     */
    setupFAB() {
        const fabMain = document.getElementById('fab-main');
        const fabMenu = document.getElementById('fab-menu');
        
        if (fabMain && fabMenu) {
            fabMain.addEventListener('click', () => {
                fabMenu.classList.toggle('active');
                fabMain.classList.toggle('active');
            });
            
            // Setup FAB items
            const fabItems = document.querySelectorAll('.fab-item');
            fabItems.forEach(item => {
                item.addEventListener('click', async (e) => {
                    const action = e.currentTarget.dataset.action;
                    fabMenu.classList.remove('active');
                    fabMain.classList.remove('active');
                    
                    switch(action) {
                        case 'timeline':
                            await this.loadModule('timeline');
                            break;
                        case 'decision':
                            await this.loadModule('decisionTool');
                            break;
                        case 'export':
                            this.exportReport();
                            break;
                    }
                });
            });
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.emit('window:resize');
        });
        
        // Online/offline
        window.addEventListener('online', () => {
            this.emit('app:online');
        });
        
        window.addEventListener('offline', () => {
            this.emit('app:offline');
        });
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.emit('visibility:change', { 
                hidden: document.hidden 
            });
        });
    }
    
    /**
     * Initialize router
     */
    initializeRouter() {
        this.router.init();
        
        // Navigate to initial section
        const initialSection = this.state.get('currentSection') || 'overview';
        this.navigate(initialSection);
    }
    
    /**
     * Navigate to a section
     */
    navigate(sectionId) {
        // Navigate to section
        this.state.set('currentSection', sectionId);
        this.sections.showSection(sectionId);
        this.navigation.setActive(sectionId);
        this.emit('navigation:change', { section: sectionId });
    }
    
    /**
     * Update loading progress
     */
    updateLoadProgress(percent, message) {
        const progressBar = document.getElementById('load-progress');
        const loaderText = document.querySelector('.loader-text');
        
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        
        if (loaderText && message) {
            loaderText.textContent = message;
        }
    }
    
    /**
     * Hide loader
     */
    hideLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }
    
    /**
     * Show app
     */
    showApp() {
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'flex';
            setTimeout(() => {
                app.style.opacity = '1';
            }, 50);
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const loaderText = document.querySelector('.loader-text');
        if (loaderText) {
            loaderText.textContent = message;
            loaderText.style.color = '#ef4444';
        }
    }
    
    /**
     * Export report
     */
    exportReport() {
        // Export report
        this.showToast('Report export coming soon!', 'info');
    }
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    /**
     * Emit event
     */
    emit(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        this.eventBus.dispatchEvent(event);
    }
    
    /**
     * Subscribe to event
     */
    on(eventName, callback) {
        this.eventBus.addEventListener(eventName, callback);
    }
    
    /**
     * Unsubscribe from event
     */
    off(eventName, callback) {
        this.eventBus.removeEventListener(eventName, callback);
    }
    
    /**
     * Get current state
     */
    getState() {
        return this.state.getAll();
    }
    
    /**
     * Public API
     */
    get api() {
        return {
            loadModule: this.loadModule.bind(this),
            navigate: this.navigate.bind(this),
            getState: this.getState.bind(this),
            showToast: this.showToast.bind(this),
            on: this.on.bind(this),
            off: this.off.bind(this),
            emit: this.emit.bind(this)
        };
    }
}