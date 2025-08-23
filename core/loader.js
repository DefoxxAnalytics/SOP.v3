/**
 * ModuleLoader - Dynamic module loading system
 * Handles lazy loading of enhancement modules
 */

export class ModuleLoader {
    constructor(app) {
        this.app = app;
        this.loadedModules = new Map();
        this.loadingModules = new Map();
        this.moduleConfig = app.config.modules || {};
    }
    
    /**
     * Load a module dynamically
     */
    async load(moduleName) {
        // Check if already loaded
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }
        
        // Check if currently loading
        if (this.loadingModules.has(moduleName)) {
            return this.loadingModules.get(moduleName);
        }
        
        // Get module configuration
        const config = this.moduleConfig[moduleName];
        if (!config) {
            throw new Error(`Module ${moduleName} not found in configuration`);
        }
        
        // Start loading
        const loadPromise = this.loadModule(moduleName, config);
        this.loadingModules.set(moduleName, loadPromise);
        
        try {
            const module = await loadPromise;
            this.loadedModules.set(moduleName, module);
            this.loadingModules.delete(moduleName);
            return module;
        } catch (error) {
            this.loadingModules.delete(moduleName);
            throw error;
        }
    }
    
    /**
     * Load module implementation
     */
    async loadModule(moduleName, config) {
        console.log(`📦 Loading module: ${moduleName}`);
        
        // Load module CSS if exists
        if (config.styles) {
            await this.loadModuleStyles(moduleName, config);
        }
        
        // Load module JavaScript
        const entry = config.entry || 'index.js';
        // Use the path from config if available, otherwise map module name to folder
        let folderName;
        if (config.path) {
            folderName = config.path.replace('modules/', '').replace(/\/$/, '');
        } else {
            // Map module names to folder names
            const moduleMapping = {
                'decisionTool': 'decision-tool',
                'healthMonitor': 'health-monitor'
            };
            folderName = moduleMapping[moduleName] || moduleName;
        }
        const modulePath = `../modules/${folderName}/${entry}`;
        
        try {
            const moduleExport = await import(modulePath);
            const module = moduleExport.default || moduleExport;
            
            // Validate module structure
            this.validateModule(module, moduleName);
            
            // Store module metadata
            module._metadata = {
                name: moduleName,
                version: config.version,
                loadedAt: Date.now(),
                config: config
            };
            
            console.log(`✅ Module loaded: ${moduleName} v${config.version}`);
            return module;
            
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw new Error(`Failed to load module ${moduleName}: ${error.message}`);
        }
    }
    
    /**
     * Load module styles
     */
    async loadModuleStyles(moduleName, config) {
        const styleId = `module-styles-${moduleName}`;
        
        // Check if already loaded
        if (document.getElementById(styleId)) {
            return;
        }
        
        // Use the path from config if available, otherwise map module name to folder
        let folderName;
        if (config.path) {
            folderName = config.path.replace('modules/', '').replace(/\/$/, '');
        } else {
            // Map module names to folder names
            const moduleMapping = {
                'decisionTool': 'decision-tool',
                'healthMonitor': 'health-monitor'
            };
            folderName = moduleMapping[moduleName] || moduleName;
        }
        
        // Create link element
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `modules/${folderName}/${config.styles}`;
        
        // Add to document
        document.head.appendChild(link);
        
        // Wait for styles to load
        return new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = () => reject(new Error(`Failed to load styles for ${moduleName}`));
            
            // Timeout after 5 seconds
            setTimeout(() => {
                reject(new Error(`Timeout loading styles for ${moduleName}`));
            }, 5000);
        });
    }
    
    /**
     * Validate module structure
     */
    validateModule(module, moduleName) {
        // Check if module is valid
        if (!module) {
            throw new Error(`Module ${moduleName} is null or undefined`);
        }
        
        // Check required properties (relaxed for singleton modules)
        if (!module.name && !module.constructor) {
            console.warn(`Module ${moduleName} missing name property`);
        }
        
        if (!module.version) {
            console.warn(`Module ${moduleName} missing version property`);
        }
        
        // Check required methods
        if (typeof module.init !== 'function') {
            throw new Error(`Module ${moduleName} missing required method: init`);
        }
        
        return true;
    }
    
    /**
     * Unload a module
     */
    async unload(moduleName) {
        const module = this.loadedModules.get(moduleName);
        
        if (!module) {
            console.warn(`Module ${moduleName} not loaded`);
            return;
        }
        
        // Call module cleanup if exists
        if (module.unload && typeof module.unload === 'function') {
            try {
                await module.unload();
            } catch (error) {
                console.error(`Error unloading module ${moduleName}:`, error);
            }
        }
        
        // Remove module styles
        const styleId = `module-styles-${moduleName}`;
        const styleElement = document.getElementById(styleId);
        if (styleElement) {
            styleElement.remove();
        }
        
        // Remove from loaded modules
        this.loadedModules.delete(moduleName);
        
        console.log(`📦 Module unloaded: ${moduleName}`);
    }
    
    /**
     * Reload a module
     */
    async reload(moduleName) {
        await this.unload(moduleName);
        return this.load(moduleName);
    }
    
    /**
     * Get loaded module
     */
    get(moduleName) {
        return this.loadedModules.get(moduleName);
    }
    
    /**
     * Check if module is loaded
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
    
    /**
     * Get all loaded modules
     */
    getLoadedModules() {
        return Array.from(this.loadedModules.keys());
    }
    
    /**
     * Preload modules for better performance
     */
    async preload(moduleNames) {
        const promises = moduleNames.map(name => {
            const config = this.moduleConfig[name];
            
            // Get the correct folder name
            let folderName;
            if (config && config.path) {
                folderName = config.path.replace('modules/', '').replace(/\/$/, '');
            } else {
                // Map module names to folder names
                const moduleMapping = {
                    'decisionTool': 'decision-tool',
                    'healthMonitor': 'health-monitor'
                };
                folderName = moduleMapping[name] || name;
            }
            
            // Use link rel="modulepreload" for ES6 modules
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            const entry = config?.entry || 'index.js';
            link.href = `modules/${folderName}/${entry}`;
            document.head.appendChild(link);
            
            // Also preload styles
            if (config && config.styles) {
                const styleLink = document.createElement('link');
                styleLink.rel = 'preload';
                styleLink.as = 'style';
                styleLink.href = `modules/${folderName}/${config.styles}`;
                document.head.appendChild(styleLink);
            }
        });
        
        await Promise.all(promises);
        console.log(`📦 Preloaded modules: ${moduleNames.join(', ')}`);
    }
}