<script lang="ts">
	/**
	 * MermaidFullView Component
	 *
	 * Minimal full-view component for Dialog expansion.
	 * Dialog handles scroll/actions, this only renders diagram content.
	 *
	 * REACTIVE ARCHITECTURE:
	 * - Subscribes to zoomStore for real-time zoom updates
	 * - Props are static snapshots (Dialog limitation)
	 * - Store provides reactive bridge from parent to Dialog content
	 *
	 * PATTERN: Extends CodeBlockFullView.svelte pattern
	 * - Receives rendered diagram HTML
	 * - Subscribes to zoom store (not static props)
	 * - Applies transform via inline style
	 * - Dialog manages scroll and action buttons
	 */

	import { zoomStore } from "$lib/stores/zoom.js";

	interface Props {
		/** Rendered diagram HTML (from Mermaid) */
		diagram: string;
	}

	let { diagram }: Props = $props();

	// Reactive state synchronized with zoom store
	let zoomLevel = $state(100);
	let panOffset = $state({ x: 0, y: 0 });

	// Subscribe to zoom store for reactive updates
	// CRITICAL FIX: $derived($zoomStore) is not reactive in Svelte 5 Dialog context
	// Must use $effect with direct subscription for reactivity
	$effect(() => {
		const unsubscribe = zoomStore.subscribe((state) => {
			zoomLevel = state.level;
			panOffset = state.panOffset;
		});
		return unsubscribe;
	});

	// Derived zoom transform (reactive to store changes)
	// CRITICAL: translate() BEFORE scale() so pan is independent of zoom level
	const zoomTransform = $derived(
		`translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`
	);
</script>

<div class="mermaid-full-view">
	<div
		class="mermaid-full-view-content"
		style="transform: {zoomTransform}; transform-origin: center; transition: transform 0.2s ease;"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html diagram}
	</div>
</div>

<style>
	/**
	 * ZOOM/PAN ARCHITECTURE (Hybrid: Fit-to-Container + Fixed Viewport):
	 *
	 * Strategy: Initial fit-to-container with fixed viewport for zoom/pan
	 * - Container (.mermaid-full-view): Fixed viewport, overflow hidden
	 * - Content (.mermaid-full-view-content): Transformable layer (zoom/pan applied here)
	 * - SVG: Scaled to fit initially (100% width/height + object-fit: contain)
	 *
	 * BEHAVIOR:
	 * - Initial load: SVG scaled to fit completely visible (no scroll, no zoom effect)
	 * - Zoom in: Magnifies within viewport, no scroll expansion
	 * - Pan: Moves within viewport, no scroll expansion
	 * - Reset: Returns to initial fit-to-container state
	 *
	 * WHY THIS PATTERN:
	 * - Best of both worlds: clean initial view + controlled zoom/pan
	 * - No scroll confusion (everything contained)
	 * - SVG always visible initially (no cut-off content)
	 */

	.mermaid-full-view {
		width: 100%;
		height: 100%; /* Fixed viewport height */
		overflow: hidden; /* No scroll - zoom/pan handle navigation */
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
	}

	.mermaid-full-view-content {
		/* Transform wrapper: zoom/pan applied via inline style (see line 43) */
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		transform-origin: center;
		transition: transform 0.2s ease;
	}

	/* SVG: Fit to container (complete diagram visible initially) */
	.mermaid-full-view-content :global(svg) {
		max-width: 100%; /* Constrain to container width */
		max-height: 100%; /* Constrain to container height */
		width: auto; /* Maintain aspect ratio */
		height: auto; /* Maintain aspect ratio */
		object-fit: contain; /* Scale to fit, preserve aspect ratio */
	}
</style>
