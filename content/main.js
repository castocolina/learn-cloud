/**
 * Main Application - ES6 Modern JavaScript
 * Static-first cloud-native book application
 */

import { NavigationManager } from './navigation.js';
import { SearchManager } from './search.js';

class App {
    constructor() {
        this.navigationManager = null;
        this.searchManager = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Cloud-Native Book App...');
            
            // Initialize navigation first
            this.navigationManager = new NavigationManager();
            
            // Make navigation manager globally available for compatibility
            window.navigationManager = this.navigationManager;
            
            // Initialize search after navigation is ready
            this.searchManager = new SearchManager(this.navigationManager);
            
            // Initialize additional features
            this.initializeMermaid();
            this.initializePrism();
            this.setupMobileMenuCloning();
            this.setupGlobalErrorHandling();
            
            console.log('✅ App initialization complete');
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.handleInitializationError(error);
        }
    }
    
    initializeMermaid() {
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ 
                startOnLoad: false, 
                theme: 'default',
                securityLevel: 'loose'
            });
            console.log('📊 Mermaid initialized');
        }
    }
    
    initializePrism() {
        if (typeof Prism !== 'undefined') {
            // Prism is initialized automatically, just log
            console.log('🎨 Prism syntax highlighting ready');
        }
    }
    
    setupMobileMenuCloning() {
        const desktopMenu = document.getElementById('nav-menu');
        const mobileMenu = document.getElementById('nav-menu-mobile');
        
        if (!desktopMenu || !mobileMenu) {
            console.warn('Desktop or mobile menu not found - skipping menu cloning');
            return;
        }
        
        try {
            // Clone desktop menu content to mobile
            mobileMenu.innerHTML = desktopMenu.innerHTML;
            
            // Update IDs to avoid duplicates
            const mobileElements = mobileMenu.querySelectorAll('[id]');
            mobileElements.forEach(element => {
                if (element.id) {
                    element.id = element.id + '-mobile';
                }
            });
            
            // Update collapse targets
            const mobileCollapseToggles = mobileMenu.querySelectorAll('[data-bs-toggle="collapse"]');
            mobileCollapseToggles.forEach(toggle => {
                const target = toggle.getAttribute('href');
                if (target && target.startsWith('#')) {
                    toggle.setAttribute('href', target + '-mobile');
                    const ariaControls = toggle.getAttribute('aria-controls');
                    if (ariaControls) {
                        toggle.setAttribute('aria-controls', ariaControls + '-mobile');
                    }
                }
            });
            
            console.log('📱 Mobile menu cloned successfully');
            
        } catch (error) {
            console.error('Error cloning menu:', error);
        }
    }
    
    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
        
        // Handle global errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
    }
    
    handleInitializationError(error) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="text-center" style="padding: var(--space-xl); color: var(--color-danger);">
                    <h2>⚠️ Application Error</h2>
                    <p>The application failed to initialize properly.</p>
                    <details style="margin-top: var(--space-md);">
                        <summary>Error Details</summary>
                        <pre style="text-align: left; margin-top: var(--space-sm);">${error.stack}</pre>
                    </details>
                    <button onclick="window.location.reload()" 
                            class="floating-nav-btn" 
                            style="margin-top: var(--space-md);">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
    
    // Public API
    getNavigationManager() {
        return this.navigationManager;
    }
    
    getSearchManager() {
        return this.searchManager;
    }
    
    // Utility methods for external use
    async navigateTo(url, index) {
        if (this.navigationManager) {
            await this.navigationManager.loadContent(url, index);
        }
    }
    
    async search(query) {
        if (this.searchManager) {
            return await this.searchManager.search(query);
        }
        return [];
    }
}

// Initialize the application
const app = new App();

// Make app globally available for debugging
window.app = app;

// Export for potential module usage
export default app;