/**
 * Sidebar State Management Store
 *
 * Manages the collapsible state of the desktop sidebar with local storage persistence.
 * This store controls whether the sidebar is expanded or collapsed on desktop devices.
 */

import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";
import { SETTINGS } from "$config/settings.js";

// Sidebar state interface
export interface SidebarState {
	isCollapsed: boolean;
	isAnimating: boolean;
}

// Storage key for persistence
const STORAGE_KEY = "demo-sidebar-collapsed";

// Create the base sidebar state store
function createSidebarStore() {
	// Initialize with default state from global settings
	const initialState: SidebarState = {
		isCollapsed: SETTINGS.ui.sidebar.defaultCollapsed,
		isAnimating: false
	};

	// Create writable store
	const { subscribe, update } = writable<SidebarState>(initialState);

	return {
		subscribe,

		/**
		 * Initialize the store with persisted state from localStorage
		 */
		init() {
			if (!browser) return;

			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored !== null) {
					const isCollapsed = JSON.parse(stored);
					update((state) => ({ ...state, isCollapsed }));
				}
			} catch (error) {
				console.warn("Failed to load sidebar state from localStorage:", error);
			}
		},

		/**
		 * Toggle the sidebar collapsed state
		 */
		toggle() {
			update((state) => {
				const newCollapsed = !state.isCollapsed;

				// Persist to localStorage
				if (browser) {
					try {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(newCollapsed));
					} catch (error) {
						console.warn("Failed to save sidebar state to localStorage:", error);
					}
				}

				return {
					...state,
					isCollapsed: newCollapsed,
					isAnimating: true
				};
			});

			// Reset animation state after transition completes
			setTimeout(() => {
				update((state) => ({ ...state, isAnimating: false }));
			}, 300); // Match CSS transition duration
		},

		/**
		 * Set collapsed state explicitly
		 */
		setCollapsed(collapsed: boolean) {
			update((state) => {
				if (state.isCollapsed === collapsed) return state;

				// Persist to localStorage
				if (browser) {
					try {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
					} catch (error) {
						console.warn("Failed to save sidebar state to localStorage:", error);
					}
				}

				return {
					...state,
					isCollapsed: collapsed,
					isAnimating: true
				};
			});

			// Reset animation state after transition completes
			setTimeout(() => {
				update((state) => ({ ...state, isAnimating: false }));
			}, 300);
		},

		/**
		 * Expand the sidebar
		 */
		expand() {
			this.setCollapsed(false);
		},

		/**
		 * Collapse the sidebar
		 */
		collapse() {
			this.setCollapsed(true);
		}
	};
}

// Export the singleton store instance
export const sidebarStore = createSidebarStore();

// Derived stores for convenient access to specific properties
export const isCollapsed = derived(sidebarStore, (state) => state.isCollapsed);
export const isAnimating = derived(sidebarStore, (state) => state.isAnimating);

// Derived store for sidebar width (for use in CSS or JS calculations)
export const sidebarWidth = derived(sidebarStore, (state) =>
	state.isCollapsed ? "60px" : "320px"
);

// Derived store for main content margin (for responsive adjustments)
export const mainContentMargin = derived(sidebarStore, (state) =>
	state.isCollapsed ? "60px" : "320px"
);

/**
 * Hook for components to easily access sidebar state and actions
 */
export function useSidebar() {
	return {
		// State
		store: sidebarStore,
		isCollapsed,
		isAnimating,
		sidebarWidth,
		mainContentMargin,

		// Actions
		toggle: sidebarStore.toggle,
		expand: sidebarStore.expand,
		collapse: sidebarStore.collapse,
		setCollapsed: sidebarStore.setCollapsed,
		init: sidebarStore.init
	};
}
