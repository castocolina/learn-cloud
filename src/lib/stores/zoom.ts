/**
 * Zoom Store - Reactive bridge for MermaidDiagram Dialog zoom controls
 *
 * PROBLEM SOLVED:
 * Props passed to openDialog() are static snapshots, not reactive bindings.
 * When parent's dialogZoomLevel changes, MermaidFullView's zoomLevel prop
 * remains frozen at the initial value (100).
 *
 * SOLUTION:
 * Svelte writable store provides reactive bridge:
 * - MermaidDiagram updates store when zoom buttons clicked
 * - MermaidFullView subscribes to store for real-time updates
 * - Store changes trigger transform recalculation
 *
 * ARCHITECTURE:
 * Follows CodeBlock.svelte pattern but extends it for content transform updates,
 * not just visual feedback (icon/label changes).
 *
 * Related:
 * - src/lib/components/shared/MermaidDiagram.svelte (producer)
 * - src/lib/components/shared/MermaidFullView.svelte (consumer)
 * - src/lib/stores/dialog.ts (Dialog state management)
 */

import { writable } from "svelte/store";
import { SETTINGS } from "$config/settings.js";

/**
 * Zoom state interface
 */
export interface ZoomState {
	/** Current zoom level percentage (50-200) */
	level: number;
	/** Pan offset for diagram positioning */
	panOffset: { x: number; y: number };
}

/**
 * Default zoom state from SETTINGS
 */
const defaultZoomState: ZoomState = {
	level: SETTINGS.ui.mermaid.zoom.defaultLevel,
	panOffset: { x: 0, y: 0 }
};

/**
 * Zoom Store
 *
 * Reactive store for MermaidDiagram zoom state.
 * Provides real-time updates between parent component and Dialog content.
 *
 * Usage (Producer - MermaidDiagram):
 * ```typescript
 * import { zoomStore, updateZoom, resetZoom } from '$lib/stores/zoom';
 *
 * function handleDialogZoomIn() {
 *   updateZoom({ level: $zoomStore.level + 25 });
 * }
 * ```
 *
 * Usage (Consumer - MermaidFullView):
 * ```typescript
 * import { zoomStore } from '$lib/stores/zoom';
 *
 * const zoomLevel = $derived($zoomStore.level);
 * ```
 */
export const zoomStore = writable<ZoomState>(defaultZoomState);

/**
 * Update zoom level and/or pan offset
 *
 * @param partial - Partial zoom state to update
 */
export function updateZoom(partial: Partial<ZoomState>) {
	zoomStore.update((state) => ({
		...state,
		...partial
	}));
}

/**
 * Reset zoom to default level and center position
 */
export function resetZoom() {
	zoomStore.set(defaultZoomState);
}

/**
 * Get current zoom state (snapshot)
 *
 * @returns Current zoom state
 */
export function getZoomState(): ZoomState {
	let state: ZoomState = defaultZoomState;
	const unsubscribe = zoomStore.subscribe((value) => {
		state = value;
	});
	unsubscribe();
	return state;
}
