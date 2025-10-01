/**
 * SPA Navigation Store
 *
 * Central state management for SPA navigation system.
 * Tracks current chapter, sequential navigation entries, and navigation state.
 *
 * ARCHITECTURE:
 * - Writable store with SPANavigationState interface from $types
 * - Updated by navigateToContent() in utils/spaNavigation.ts
 * - Consumed by Sidebar (8A), Header (8B), ContentRouter
 * - Integrates with flatNavigation for previous/next
 *
 * STATE MANAGEMENT:
 * - currentId: Active chapter ID (e.g., "01_01L")
 * - currentChapterUrl: Active chapterUrl for bookmarking
 * - previousEntry/nextEntry: Sequential navigation references
 * - source: Track navigation origin (sidebar, search, etc.)
 * - isLoading: Loading state for UI feedback
 * - error: Error state for error handling
 *
 * INTEGRATION:
 * - TASK 8A (Sidebar): Use currentId for active highlighting
 * - TASK 8B (Header): Display currentChapterUrl in breadcrumb
 * - TASK 8L (Sequential Nav): Use previousEntry/nextEntry
 * - TASK 8K (Progress): Track navigation events via source
 *
 * @module spaNavigation
 */

import { writable, derived } from "svelte/store";
import type { SPANavigationState } from "$types";

/**
 * Initial navigation state
 */
const initialState: SPANavigationState = {
	currentId: null,
	currentChapterUrl: null,
	previousEntry: null,
	nextEntry: null,
	source: "direct",
	isLoading: false,
	error: null
};

/**
 * Main navigation store
 *
 * Updated by navigateToContent() function
 * Consumed by navigation components
 *
 * @example
 * import { navigationStore } from "$lib/stores/spaNavigation";
 *
 * // In component
 * const currentId = $derived($navigationStore.currentId);
 */
export const navigationStore = writable<SPANavigationState>(initialState);

/**
 * Derived store: Current chapter ID
 *
 * Convenience store for components that only need current ID
 *
 * @example
 * import { currentId } from "$lib/stores/spaNavigation";
 * const id = $currentId; // "01_01L" or null
 */
export const currentId = derived(navigationStore, ($nav) => $nav.currentId);

/**
 * Derived store: Has previous chapter
 *
 * Used by sequential navigation to enable/disable previous button
 *
 * @example
 * import { hasPrevious } from "$lib/stores/spaNavigation";
 * <button disabled={!$hasPrevious}>Previous</button>
 */
export const hasPrevious = derived(navigationStore, ($nav) => $nav.previousEntry !== null);

/**
 * Derived store: Has next chapter
 *
 * Used by sequential navigation to enable/disable next button
 *
 * @example
 * import { hasNext } from "$lib/stores/spaNavigation";
 * <button disabled={!$hasNext}>Next</button>
 */
export const hasNext = derived(navigationStore, ($nav) => $nav.nextEntry !== null);

/**
 * Derived store: Is loading
 *
 * Used by UI components to show loading indicators
 *
 * @example
 * import { isNavigating } from "$lib/stores/spaNavigation";
 * {#if $isNavigating}<LoadingSpinner />{/if}
 */
export const isNavigating = derived(navigationStore, ($nav) => $nav.isLoading);

/**
 * Derived store: Navigation error
 *
 * Used by error boundary components
 *
 * @example
 * import { navigationError } from "$lib/stores/spaNavigation";
 * {#if $navigationError}<ErrorMessage message={$navigationError} />{/if}
 */
export const navigationError = derived(navigationStore, ($nav) => $nav.error);
