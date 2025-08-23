/**
 * Router - Client-side routing for the SOP application
 * Handles navigation without page reloads
 */

export class Router {
    constructor(app) {
        this.app = app;
        this.routes = new Map();
        this.currentRoute = null;
    }
    
    /**
     * Initialize router
     */
    init() {
        // Setup routes based on sections
        this.setupRoutes();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });
        
        // Handle link clicks
        document.addEventListener('click', (e) => {
            this.handleLinkClick(e);
        });
        
        // Process initial route
        this.processCurrentRoute();
        
        console.log('✅ Router initialized');
    }
    
    /**
     * Setup routes from configuration
     */
    setupRoutes() {
        const sections = this.app.config.navigation?.sections || [];
        
        // Add route for each section
        sections.forEach(section => {
            this.addRoute(section.id, () => {
                this.app.navigate(section.id);
            });
        });
        
        // Add special routes
        this.addRoute('', () => this.app.navigate('overview')); // Default route
        this.addRoute('home', () => this.app.navigate('overview'));
    }
    
    /**
     * Add a route
     */
    addRoute(path, handler) {
        this.routes.set(path, handler);
    }
    
    /**
     * Navigate to a route
     */
    navigate(path, options = {}) {
        // Don't navigate to same route unless forced
        if (this.currentRoute === path && !options.force) {
            return;
        }
        
        // Update URL without page reload
        const url = path ? `#${path}` : '#';
        
        if (options.replace) {
            history.replaceState({ path }, '', url);
        } else {
            history.pushState({ path }, '', url);
        }
        
        // Process the route
        this.processRoute(path);
    }
    
    /**
     * Process current route from URL
     */
    processCurrentRoute() {
        const hash = window.location.hash.slice(1); // Remove #
        const path = hash || '';
        this.processRoute(path);
    }
    
    /**
     * Process a route
     */
    processRoute(path) {
        console.log(`🔄 Processing route: ${path || '/'}`);
        
        // Store current route
        this.currentRoute = path;
        
        // Find and execute route handler
        const handler = this.routes.get(path);
        
        if (handler) {
            try {
                handler();
                this.app.emit('route:change', { path });
            } catch (error) {
                console.error('Route handler error:', error);
                this.handleRouteError(path, error);
            }
        } else {
            // Try to match section route
            if (this.isSectionRoute(path)) {
                this.app.navigate(path);
                this.app.emit('route:change', { path });
            } else {
                this.handleNotFound(path);
            }
        }
    }
    
    /**
     * Check if path is a valid section
     */
    isSectionRoute(path) {
        const sections = this.app.config.navigation?.sections || [];
        return sections.some(section => section.id === path);
    }
    
    /**
     * Handle popstate event (back/forward buttons)
     */
    handlePopState(event) {
        const path = event.state?.path || '';
        this.processRoute(path);
    }
    
    /**
     * Handle link clicks for client-side routing
     */
    handleLinkClick(event) {
        // Check if it's an internal link with hash
        const link = event.target.closest('a');
        
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Handle hash links
        if (href && href.startsWith('#')) {
            event.preventDefault();
            const path = href.slice(1);
            this.navigate(path);
        }
        
        // Handle data-route attributes
        const route = link.dataset.route;
        if (route) {
            event.preventDefault();
            this.navigate(route);
        }
    }
    
    /**
     * Handle route not found
     */
    handleNotFound(path) {
        console.warn(`Route not found: ${path}`);
        
        // Navigate to overview as fallback
        this.navigate('overview', { replace: true });
        
        // Show notification
        this.app.showToast(`Section "${path}" not found`, 'warning');
    }
    
    /**
     * Handle route error
     */
    handleRouteError(path, error) {
        console.error(`Error processing route ${path}:`, error);
        
        // Show error notification
        this.app.showToast('Navigation error occurred', 'error');
    }
    
    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    /**
     * Go back in history
     */
    back() {
        history.back();
    }
    
    /**
     * Go forward in history
     */
    forward() {
        history.forward();
    }
    
    /**
     * Reload current route
     */
    reload() {
        this.processRoute(this.currentRoute);
    }
}