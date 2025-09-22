/**
 * Application Configuration Settings
 *
 * Centralized, type-safe configuration for the entire application.
 * This file exports a single SETTINGS object that contains all
 * global application parameters.
 */

// Defines the structure for the application settings for type safety.
interface AppSettings {
	mermaid: {
		debug: boolean;
		modalPagePercent: number; // Viewport percentage for modal dialogs (default: 90)
		// Add more Mermaid-specific settings here as needed
	};
	flipCard: {
		modalPagePercent: number; // Viewport percentage for flip card modal dialogs (default: 90)
		// Add more flip card-specific settings here as needed
	};
	ui: {
		breadcrumb: {
			showIcon: boolean; // Whether to show the emoji icon in breadcrumbs (default: true)
		};
		sidebar: {
			collapsible: boolean; // Whether sidebar can be collapsed on desktop (default: true)
			defaultCollapsed: boolean; // Default collapsed state (default: false)
		};
		// Future UI settings can be grouped here
	};
	// Future settings can be grouped here (e.g., api, performance)
}

// Export a single, constant object with all settings.
export const SETTINGS: AppSettings = {
	mermaid: {
		debug: true, // Enabled for development - provides detailed error logging
		modalPagePercent: 90 // Default modal viewport percentage
	},
	flipCard: {
		modalPagePercent: 90 // Default modal viewport percentage for flip cards
	},
	ui: {
		breadcrumb: {
			showIcon: true // Show emoji icon in breadcrumbs by default
		},
		sidebar: {
			collapsible: true, // Enable sidebar collapse functionality
			defaultCollapsed: false // Sidebar expanded by default
		}
	}
};

// Export types for use in other parts of the application
export type { AppSettings };
