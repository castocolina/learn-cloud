/**
 * Swipe Action - Mobile Touch Gesture Handler for Lesson Navigation
 *
 * This Svelte action enables horizontal swipe gestures on mobile devices
 * to navigate between lessons. It integrates with the global navigation
 * store to provide intuitive touch-based navigation.
 *
 * Features:
 * - Horizontal swipe detection (left/right)
 * - Minimum distance threshold to prevent accidental navigation
 * - Velocity-based gesture recognition
 * - Prevention of vertical scroll interference
 * - Integration with navigation store for lesson transitions
 * - Debounced navigation to prevent rapid-fire gestures
 *
 * Usage:
 * <div use:swipe={{ onSwipeLeft: handlePrevious, onSwipeRight: handleNext }}>
 *   <!-- swipeable content -->
 * </div>
 *
 * Architecture:
 * - Uses TouchEvent API for mobile gesture detection
 * - Integrates with navigation store for URL management
 * - Provides visual feedback during gesture
 * - Handles edge cases (single lesson, first/last lesson)
 */

import { browser } from "$app/environment";
import { goto } from "$app/navigation";

export interface SwipeOptions {
	/**
	 * Minimum horizontal distance (px) required to trigger swipe
	 * @default 50
	 */
	threshold?: number;

	/**
	 * Minimum velocity (px/ms) required to trigger swipe
	 * @default 0.3
	 */
	velocity?: number;

	/**
	 * Maximum vertical movement allowed during horizontal swipe
	 * @default 100
	 */
	verticalTolerance?: number;

	/**
	 * Debounce time (ms) between swipe actions
	 * @default 300
	 */
	debounceTime?: number;

	/**
	 * Callback for left swipe (go to next lesson)
	 */
	onSwipeLeft?: () => void;

	/**
	 * Callback for right swipe (go to previous lesson)
	 */
	onSwipeRight?: () => void;

	/**
	 * Callback when swipe starts (for visual feedback)
	 */
	onSwipeStart?: (direction: "left" | "right" | null) => void;

	/**
	 * Callback when swipe ends (for cleanup)
	 */
	onSwipeEnd?: () => void;

	/**
	 * Enable debug logging
	 * @default false
	 */
	debug?: boolean;
}

interface TouchData {
	startX: number;
	startY: number;
	startTime: number;
	currentX: number;
	currentY: number;
	deltaX: number;
	deltaY: number;
	velocity: number;
	direction: "left" | "right" | null;
}

export function swipe(node: HTMLElement, options: SwipeOptions = {}) {
	if (!browser) {
		return {
			destroy() {}
		};
	}

	// Default configuration
	const config = {
		threshold: 50,
		velocity: 0.3,
		verticalTolerance: 100,
		debounceTime: 300,
		debug: false,
		...options
	};

	let touchData: TouchData | null = null;
	let lastSwipeTime = 0;
	let isSwipeActive = false;

	/**
	 * Log debug information if debug mode is enabled
	 */
	function debugLog(...args: unknown[]): void {
		if (config.debug) {
			console.log("[SwipeAction]", ...args);
		}
	}

	/**
	 * Handle touch start event
	 */
	function handleTouchStart(event: TouchEvent): void {
		if (event.touches.length !== 1) return;

		const touch = event.touches[0];
		const now = Date.now();

		touchData = {
			startX: touch.clientX,
			startY: touch.clientY,
			startTime: now,
			currentX: touch.clientX,
			currentY: touch.clientY,
			deltaX: 0,
			deltaY: 0,
			velocity: 0,
			direction: null
		};

		isSwipeActive = true;

		debugLog("Touch start:", { x: touch.clientX, y: touch.clientY });

		// Call start callback
		config.onSwipeStart?.(null);
	}

	/**
	 * Handle touch move event
	 */
	function handleTouchMove(event: TouchEvent): void {
		if (!touchData || !isSwipeActive || event.touches.length !== 1) return;

		const touch = event.touches[0];

		touchData.currentX = touch.clientX;
		touchData.currentY = touch.clientY;
		touchData.deltaX = touchData.currentX - touchData.startX;
		touchData.deltaY = touchData.currentY - touchData.startY;

		// Calculate velocity
		const deltaTime = Date.now() - touchData.startTime;
		touchData.velocity = Math.abs(touchData.deltaX) / Math.max(deltaTime, 1);

		// Determine direction
		if (Math.abs(touchData.deltaX) > Math.abs(touchData.deltaY)) {
			touchData.direction = touchData.deltaX > 0 ? "right" : "left";
		}

		// Check if we should prevent scroll
		if (
			Math.abs(touchData.deltaX) > 10 &&
			Math.abs(touchData.deltaX) > Math.abs(touchData.deltaY)
		) {
			event.preventDefault();
		}

		debugLog("Touch move:", {
			deltaX: touchData.deltaX,
			deltaY: touchData.deltaY,
			velocity: touchData.velocity,
			direction: touchData.direction
		});

		// Provide visual feedback during swipe
		if (touchData.direction && Math.abs(touchData.deltaX) > config.threshold / 2) {
			config.onSwipeStart?.(touchData.direction);
		}
	}

	/**
	 * Handle touch end event
	 */
	function handleTouchEnd(event: TouchEvent): void {
		if (!touchData || !isSwipeActive) return;

		const now = Date.now();
		const deltaTime = now - touchData.startTime;

		// Check debounce
		if (now - lastSwipeTime < config.debounceTime) {
			debugLog("Swipe debounced");
			resetTouchData();
			return;
		}

		// Validate swipe gesture
		const isValidSwipe =
			touchData.direction &&
			Math.abs(touchData.deltaX) >= config.threshold &&
			Math.abs(touchData.deltaY) <= config.verticalTolerance &&
			touchData.velocity >= config.velocity &&
			deltaTime < 800; // Maximum swipe duration

		debugLog("Touch end validation:", {
			isValidSwipe,
			deltaX: touchData.deltaX,
			deltaY: touchData.deltaY,
			velocity: touchData.velocity,
			deltaTime,
			direction: touchData.direction
		});

		if (isValidSwipe) {
			lastSwipeTime = now;

			// Trigger appropriate callback
			if (touchData.direction === "left" && config.onSwipeLeft) {
				debugLog("Triggering swipe left (next lesson)");
				config.onSwipeLeft();
			} else if (touchData.direction === "right" && config.onSwipeRight) {
				debugLog("Triggering swipe right (previous lesson)");
				config.onSwipeRight();
			}
		}

		resetTouchData();
		config.onSwipeEnd?.();
	}

	/**
	 * Handle touch cancel event
	 */
	function handleTouchCancel(): void {
		resetTouchData();
		config.onSwipeEnd?.();
	}

	/**
	 * Reset touch data and state
	 */
	function resetTouchData(): void {
		touchData = null;
		isSwipeActive = false;
	}

	// Add event listeners with passive: false to allow preventDefault
	node.addEventListener("touchstart", handleTouchStart, { passive: true });
	node.addEventListener("touchmove", handleTouchMove, { passive: false });
	node.addEventListener("touchend", handleTouchEnd, { passive: true });
	node.addEventListener("touchcancel", handleTouchCancel, { passive: true });

	// Return cleanup function
	return {
		/**
		 * Update swipe options
		 */
		update(newOptions: SwipeOptions) {
			Object.assign(config, newOptions);
		},

		/**
		 * Cleanup event listeners
		 */
		destroy() {
			node.removeEventListener("touchstart", handleTouchStart);
			node.removeEventListener("touchmove", handleTouchMove);
			node.removeEventListener("touchend", handleTouchEnd);
			node.removeEventListener("touchcancel", handleTouchCancel);
		}
	};
}

/**
 * Navigation-specific swipe action that integrates with the navigation store
 */
export function navigationSwipe(node: HTMLElement, options: Partial<SwipeOptions> = {}) {
	// Import navigation functions dynamically to avoid circular dependencies
	let navigateToPrevious: (() => void) | null = null;
	let navigateToNext: (() => void) | null = null;

	// Lazy load navigation functions
	async function loadNavigationFunctions() {
		try {
			const navModule = await import("$lib/stores/demo-navigation.svelte.js");
			const { navigationStore } = navModule;

			// Direct access to rune-based store (no subscription needed)
			navigateToPrevious = () => {
				if (navigationStore.previousLessonUrl) {
					if (navigationStore.previousLessonUrl.startsWith("#")) {
						window.location.hash = navigationStore.previousLessonUrl.slice(1);
					} else {
						goto(navigationStore.previousLessonUrl);
					}
				}
			};

			navigateToNext = () => {
				if (navigationStore.nextLessonUrl) {
					if (navigationStore.nextLessonUrl.startsWith("#")) {
						window.location.hash = navigationStore.nextLessonUrl.slice(1);
					} else {
						goto(navigationStore.nextLessonUrl);
					}
				}
			};
		} catch (error) {
			console.warn("Failed to load navigation functions:", error);
		}
	}

	// Load navigation functions
	loadNavigationFunctions();

	// Configure swipe options with navigation callbacks
	const swipeOptions: SwipeOptions = {
		threshold: 80, // Slightly higher threshold for lesson navigation
		velocity: 0.2, // Lower velocity requirement for easier swiping
		verticalTolerance: 120,
		debounceTime: 500, // Longer debounce for lesson navigation
		debug: false,
		...options,
		onSwipeLeft: () => {
			navigateToNext?.();
			options.onSwipeLeft?.();
		},
		onSwipeRight: () => {
			navigateToPrevious?.();
			options.onSwipeRight?.();
		}
	};

	return swipe(node, swipeOptions);
}

/**
 * Type-safe action creator for TypeScript
 */
export type SwipeAction = typeof swipe;
export type NavigationSwipeAction = typeof navigationSwipe;
