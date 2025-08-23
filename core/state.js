/**
 * StateManager - Centralized state management for the application
 * Handles all application state with localStorage persistence
 */

export class StateManager {
    constructor(app) {
        this.app = app;
        this.state = new Map();
        this.subscribers = new Map();
        this.storageKey = 'sop_v3_state';
    }
    
    /**
     * Initialize state manager
     */
    async init() {
        // Load persisted state
        this.loadPersistedState();
        
        // Set default state
        this.setDefaults();
        
        // Setup auto-save
        this.setupAutoSave();
        
        console.log('✅ State manager initialized');
    }
    
    /**
     * Set default state values
     */
    setDefaults() {
        const defaults = {
            currentSection: 'overview',
            currentProjectDay: 10,
            theme: 'navy-professional',
            sidebarCollapsed: false,
            completedChecklists: [],
            moduleStates: {},
            userPreferences: {
                fontSize: 'medium',
                animations: true,
                autoSave: true
            }
        };
        
        // Apply defaults if not already set
        for (const [key, value] of Object.entries(defaults)) {
            if (!this.state.has(key)) {
                this.state.set(key, value);
            }
        }
    }
    
    /**
     * Get state value
     */
    get(key) {
        return this.state.get(key);
    }
    
    /**
     * Set state value
     */
    set(key, value) {
        const oldValue = this.state.get(key);
        this.state.set(key, value);
        
        // Notify subscribers
        this.notifySubscribers(key, value, oldValue);
        
        // Save to localStorage
        this.saveState();
    }
    
    /**
     * Update nested state
     */
    update(key, updates) {
        const current = this.get(key) || {};
        const updated = { ...current, ...updates };
        this.set(key, updated);
    }
    
    /**
     * Get all state
     */
    getAll() {
        return Object.fromEntries(this.state);
    }
    
    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }
    
    /**
     * Notify subscribers of state change
     */
    notifySubscribers(key, newValue, oldValue) {
        const callbacks = this.subscribers.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error('State subscriber error:', error);
                }
            });
        }
        
        // Also notify wildcard subscribers
        const wildcardCallbacks = this.subscribers.get('*');
        if (wildcardCallbacks) {
            wildcardCallbacks.forEach(callback => {
                try {
                    callback({ key, newValue, oldValue });
                } catch (error) {
                    console.error('Wildcard subscriber error:', error);
                }
            });
        }
    }
    
    /**
     * Load persisted state from localStorage
     */
    loadPersistedState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                for (const [key, value] of Object.entries(parsed)) {
                    this.state.set(key, value);
                }
                console.log('✅ State loaded from localStorage');
            }
        } catch (error) {
            console.error('Failed to load persisted state:', error);
        }
    }
    
    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            const stateObject = this.getAll();
            localStorage.setItem(this.storageKey, JSON.stringify(stateObject));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }
    
    /**
     * Setup auto-save with debouncing
     */
    setupAutoSave() {
        let saveTimeout;
        
        // Override set method to include debounced save
        const originalSet = this.set.bind(this);
        this.set = (key, value) => {
            originalSet(key, value);
            
            // Debounce save
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveState();
            }, 500);
        };
    }
    
    /**
     * Clear all state
     */
    clear() {
        this.state.clear();
        localStorage.removeItem(this.storageKey);
        this.setDefaults();
        this.notifySubscribers('*', null, null);
    }
    
    /**
     * Export state for debugging
     */
    export() {
        return JSON.stringify(this.getAll(), null, 2);
    }
    
    /**
     * Import state for debugging
     */
    import(stateJson) {
        try {
            const parsed = JSON.parse(stateJson);
            for (const [key, value] of Object.entries(parsed)) {
                this.set(key, value);
            }
            return true;
        } catch (error) {
            console.error('Failed to import state:', error);
            return false;
        }
    }
}