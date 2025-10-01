<script lang="ts">
	/**
	 * Root Page - SPA Entry Point with ContentRouter
	 *
	 * This page serves as the main entry point for the SPA:
	 * - Integrates ContentRouter for dynamic content rendering
	 * - Provides floating footer for sequential navigation
	 * - Content naturally flows with browser scroll (no viewport-locked containers)
	 * - Applies configurable layout from SETTINGS.ui.content
	 *
	 * ARCHITECTURE:
	 * - ContentRouter handles hash-based routing and content loading
	 * - Floating footer provides prev/next navigation (TASK 8L)
	 * - Natural document flow allows unlimited content height
	 * - Footer width/alignment matches content layout
	 *
	 * @page RootPage
	 */

	import ContentRouter from "$lib/components/ContentRouter.svelte";
	import { SETTINGS } from "$config/settings.js";

	// Extract content layout configuration
	const { layoutMode, maxWidth } = SETTINGS.ui.content;
</script>

<ContentRouter />

<!-- TASK 8L: Floating Sequential Navigation - Matches Content Layout -->
<footer class="floating-footer">
	<div class="floating-footer-content" data-layout={layoutMode} data-max-width={maxWidth}>
		<button disabled>← Previous</button>
		<span>Sequential Navigation (TASK 8L)</span>
		<button disabled>Next →</button>
	</div>
</footer>
