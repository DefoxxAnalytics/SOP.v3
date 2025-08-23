/**
 * StorageManager - Wrapper for localStorage with fallback and quota management
 * Provides a consistent API for client-side storage
 */

export class StorageManager {
    constructor(config = {}) {
        this.prefix = config.prefix || 'sop_v3_';
        this.maxSize = config.maxSize || 5 * 1024 * 1024; // 5MB default
        this.compression = config.compression || false;
        this.available = this.checkAvailability();
        this.fallbackStore = new Map();
    }
    
    /**
     * Check if localStorage is available
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not available, using in-memory fallback');
            return false;
        }
    }
    
    /**
     * Get item from storage
     */
    get(key) {
        const fullKey = this.prefix + key;
        
        try {
            if (this.available) {
                const item = localStorage.getItem(fullKey);
                if (item === null) return null;
                
                // Check if it's a JSON object
                if (item.startsWith('{') || item.startsWith('[')) {
                    return JSON.parse(item);
                }
                return item;
            } else {
                return this.fallbackStore.get(fullKey);
            }
        } catch (error) {
            console.error(`Error getting ${key}:`, error);
            return null;
        }
    }
    
    /**
     * Set item in storage
     */
    set(key, value) {
        const fullKey = this.prefix + key;
        
        try {
            // Convert to string if necessary
            const data = typeof value === 'string' ? value : JSON.stringify(value);
            
            // Check size
            if (data.length > this.maxSize) {
                throw new Error(`Data too large: ${data.length} bytes`);
            }
            
            if (this.available) {
                localStorage.setItem(fullKey, data);
            } else {
                this.fallbackStore.set(fullKey, value);
            }
            
            return true;
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            
            // Try to clear space if quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.clearOldData();
                // Retry once
                try {
                    if (this.available) {
                        localStorage.setItem(fullKey, data);
                        return true;
                    }
                } catch (retryError) {
                    console.error('Failed after clearing space:', retryError);
                }
            }
            
            return false;
        }
    }
    
    /**
     * Remove item from storage
     */
    remove(key) {
        const fullKey = this.prefix + key;
        
        try {
            if (this.available) {
                localStorage.removeItem(fullKey);
            } else {
                this.fallbackStore.delete(fullKey);
            }
            return true;
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Clear all items with prefix
     */
    clear() {
        try {
            if (this.available) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                // Clear fallback store items with prefix
                const keysToDelete = [];
                this.fallbackStore.forEach((value, key) => {
                    if (key.startsWith(this.prefix)) {
                        keysToDelete.push(key);
                    }
                });
                keysToDelete.forEach(key => this.fallbackStore.delete(key));
            }
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
    
    /**
     * Get all keys with prefix
     */
    keys() {
        const keys = [];
        
        if (this.available) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    keys.push(key.substring(this.prefix.length));
                }
            });
        } else {
            this.fallbackStore.forEach((value, key) => {
                if (key.startsWith(this.prefix)) {
                    keys.push(key.substring(this.prefix.length));
                }
            });
        }
        
        return keys;
    }
    
    /**
     * Check if key exists
     */
    has(key) {
        const fullKey = this.prefix + key;
        
        if (this.available) {
            return localStorage.getItem(fullKey) !== null;
        } else {
            return this.fallbackStore.has(fullKey);
        }
    }
    
    /**
     * Get storage size in bytes
     */
    getSize() {
        let size = 0;
        
        if (this.available) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const item = localStorage.getItem(key);
                    if (item) {
                        size += key.length + item.length;
                    }
                }
            });
        } else {
            this.fallbackStore.forEach((value, key) => {
                if (key.startsWith(this.prefix)) {
                    const data = typeof value === 'string' ? value : JSON.stringify(value);
                    size += key.length + data.length;
                }
            });
        }
        
        return size;
    }
    
    /**
     * Get storage quota info
     */
    async getQuota() {
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    usage: estimate.usage || 0,
                    quota: estimate.quota || 0,
                    percentUsed: estimate.quota ? 
                        Math.round((estimate.usage / estimate.quota) * 100) : 0
                };
            } catch (error) {
                console.error('Error getting storage quota:', error);
            }
        }
        
        // Fallback estimation
        return {
            usage: this.getSize(),
            quota: this.maxSize,
            percentUsed: Math.round((this.getSize() / this.maxSize) * 100)
        };
    }
    
    /**
     * Clear old data to free space
     */
    clearOldData() {
        console.log('Clearing old data to free space...');
        
        // Get all items with timestamps
        const items = [];
        const keys = this.keys();
        
        keys.forEach(key => {
            if (key.includes('_timestamp')) {
                const timestamp = this.get(key);
                if (timestamp) {
                    items.push({
                        key: key.replace('_timestamp', ''),
                        timestamp
                    });
                }
            }
        });
        
        // Sort by timestamp (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest 20% of items
        const toRemove = Math.ceil(items.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            this.remove(items[i].key);
            this.remove(items[i].key + '_timestamp');
        }
        
        console.log(`Cleared ${toRemove} old items`);
    }
    
    /**
     * Set item with timestamp
     */
    setWithTimestamp(key, value) {
        const success = this.set(key, value);
        if (success) {
            this.set(key + '_timestamp', Date.now());
        }
        return success;
    }
    
    /**
     * Get item with age check
     */
    getWithAge(key, maxAge) {
        const timestamp = this.get(key + '_timestamp');
        
        if (!timestamp) {
            return null;
        }
        
        const age = Date.now() - timestamp;
        if (age > maxAge) {
            // Data is too old
            this.remove(key);
            this.remove(key + '_timestamp');
            return null;
        }
        
        return this.get(key);
    }
    
    /**
     * Export all data
     */
    export() {
        const data = {};
        const keys = this.keys();
        
        keys.forEach(key => {
            data[key] = this.get(key);
        });
        
        return data;
    }
    
    /**
     * Import data
     */
    import(data) {
        let imported = 0;
        
        Object.entries(data).forEach(([key, value]) => {
            if (this.set(key, value)) {
                imported++;
            }
        });
        
        return imported;
    }
    
    /**
     * Create a namespaced storage instance
     */
    namespace(name) {
        return new StorageManager({
            ...this.config,
            prefix: this.prefix + name + '_'
        });
    }
}