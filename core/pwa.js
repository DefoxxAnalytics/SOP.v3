/**
 * PWA Manager - Handles Progressive Web App functionality
 * Service Worker registration, install prompts, and offline support
 */

export class PWAManager {
    constructor(app) {
        this.app = app;
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.serviceWorkerRegistration = null;
    }
    
    /**
     * Initialize PWA features
     */
    async init() {
        // Check if PWA is already installed
        this.checkInstallStatus();
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Monitor online/offline status
        this.monitorNetworkStatus();
        
        // PWA Manager initialized
    }
    
    /**
     * Check if app is already installed
     */
    checkInstallStatus() {
        // Check if running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            // App is running in standalone mode
        }
        
        // Check for iOS
        if (window.navigator.standalone) {
            this.isInstalled = true;
            // App is running on iOS in standalone mode
        }
        
        // Check for related apps (if supported)
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(apps => {
                if (apps.length > 0) {
                    this.isInstalled = true;
                }
            });
        }
    }
    
    /**
     * Register service worker
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers not supported');
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js', {
                scope: './'
            });
            
            this.serviceWorkerRegistration = registration;
            // Service Worker registered
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
            
            // Check for updates periodically (every hour)
            setInterval(() => {
                registration.update();
            }, 3600000);
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }
    
    /**
     * Setup install prompt
     */
    setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent default install prompt
            e.preventDefault();
            
            // Store the event for later use
            this.deferredPrompt = e;
            
            // Show custom install button
            this.showInstallButton();
            
            // Install prompt intercepted
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            // PWA installed successfully
            this.isInstalled = true;
            this.hideInstallButton();
            this.showSuccessToast('App installed successfully!');
        });
    }
    
    /**
     * Show install button in UI
     */
    showInstallButton() {
        // Don't show if already installed
        if (this.isInstalled) return;
        
        // Create install button if it doesn't exist
        let installBtn = document.getElementById('pwa-install-btn');
        if (!installBtn) {
            // Add to header actions
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                installBtn = document.createElement('button');
                installBtn.id = 'pwa-install-btn';
                installBtn.className = 'pwa-install-btn';
                installBtn.innerHTML = `
                    <i class="fas fa-download"></i>
                    <span>Install App</span>
                `;
                installBtn.style.cssText = `
                    background: linear-gradient(135deg, #10b981, #059669);
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                `;
                
                installBtn.addEventListener('click', () => this.promptInstall());
                headerActions.appendChild(installBtn);
            }
        }
        
        // Show with animation
        if (installBtn) {
            installBtn.style.display = 'flex';
            setTimeout(() => {
                installBtn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    installBtn.style.transform = 'scale(1)';
                }, 300);
            }, 100);
        }
    }
    
    /**
     * Hide install button
     */
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.transform = 'scale(0)';
            setTimeout(() => {
                installBtn.style.display = 'none';
            }, 300);
        }
    }
    
    /**
     * Prompt user to install app
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            // No install prompt available
            return;
        }
        
        // Show the prompt
        this.deferredPrompt.prompt();
        
        // Wait for user choice
        const { outcome } = await this.deferredPrompt.userChoice;
        // User responded to install prompt
        
        // Clear the deferred prompt
        this.deferredPrompt = null;
        
        if (outcome === 'accepted') {
            // User accepted the install prompt
        } else {
            // User dismissed the install prompt
        }
    }
    
    /**
     * Show update notification
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-sync-alt" style="font-size: 1.2rem;"></i>
                <div>
                    <strong>Update Available!</strong>
                    <p style="margin: 4px 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                        A new version of the app is available.
                    </p>
                </div>
                <button id="pwa-update-btn" style="
                    background: white;
                    color: #3b82f6;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-left: auto;
                ">Update</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
            z-index: 10000;
            min-width: 350px;
            animation: slideUp 0.3s ease;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Handle update button click
        document.getElementById('pwa-update-btn').addEventListener('click', () => {
            this.updateApp();
        });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(100px)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 10000);
    }
    
    /**
     * Update the app
     */
    updateApp() {
        if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.waiting) {
            // Tell the waiting service worker to take control
            this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Reload once the new service worker takes control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }
    
    /**
     * Monitor network status
     */
    monitorNetworkStatus() {
        // Initial status
        this.updateNetworkStatus(navigator.onLine);
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.updateNetworkStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.updateNetworkStatus(false);
        });
    }
    
    /**
     * Update network status indicator
     */
    updateNetworkStatus(isOnline) {
        const indicator = document.getElementById('network-status') || this.createNetworkIndicator();
        
        if (isOnline) {
            indicator.innerHTML = '<i class="fas fa-wifi"></i> Online';
            indicator.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            indicator.style.display = 'none'; // Hide when online
        } else {
            indicator.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline Mode';
            indicator.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            indicator.style.display = 'flex'; // Show when offline
        }
        
        // Store status
        this.app.state.set('networkStatus', isOnline ? 'online' : 'offline');
    }
    
    /**
     * Create network status indicator
     */
    createNetworkIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'network-status';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            display: none;
            align-items: center;
            gap: 8px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(indicator);
        return indicator;
    }
    
    /**
     * Show success toast
     */
    showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.className = 'pwa-success-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Clear all caches (for debugging/updates)
     */
    async clearCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            // All caches cleared
        }
    }
}