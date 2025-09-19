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
	// Future settings can be grouped here (e.g., api, ui, performance)
}

// Export a single, constant object with all settings.
export const SETTINGS: AppSettings = {
	mermaid: {
		debug: true, // Enabled for development - provides detailed error logging
		modalPagePercent: 90 // Default modal viewport percentage
	},
	flipCard: {
		modalPagePercent: 90 // Default modal viewport percentage for flip cards
	}
};

// Export types for use in other parts of the application
export type { AppSettings };
