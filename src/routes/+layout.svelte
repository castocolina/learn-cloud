<script lang="ts">
	/**
	 * Root Layout - SPA Single Layout Architecture
	 *
	 * Main application layout that:
	 * - Provides SPA structure for all routes
	 * - Integrates ContentRouter for dynamic content
	 * - Placeholder areas for TASK 8 components:
	 *   - TASK 8A: Sidebar
	 *   - TASK 8B: Sticky Header
	 *   - TASK 8C: Breadcrumb (in header)
	 *   - TASK 8L: Sequential Navigation
	 *
	 * ARCHITECTURE:
	 * - Flexbox + Grid Hybrid Layout (shadcn/ui compatible)
	 * - CSS variables for configurable proportions
	 * - Mobile-first responsive design
	 * - Placeholder components for future integration
	 *
	 * LAYOUT PROPORTIONS (configurable via settings.ts):
	 * - Default: 20/80 split (--sidebar-width: 16rem)
	 * - Alternative: 25/75 (20rem), 15/85 (12rem)
	 * - Collapsed: Icon mode (3rem)
	 *
	 * @layout RootLayout
	 */

	import "../app.css";
	import { SETTINGS } from "$config/settings.js";

	let { children } = $props();

	// Extract layout configuration
	const { layout: layoutConfig } = SETTINGS.ui;

	/**
	 * Dynamic CSS variables for layout configuration
	 * These can be overridden by parent components or inline styles
	 */
	const layoutVars = {
		"--sidebar-width": layoutConfig.sidebarWidth,
		"--sidebar-width-mobile": layoutConfig.sidebarWidthMobile,
		"--sidebar-width-icon": layoutConfig.sidebarWidthIcon,
		"--header-height": layoutConfig.headerHeight,
		"--footer-height": layoutConfig.footerHeight
	};
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Cloud-Native Learning Platform</title>
	<meta
		name="description"
		content="Interactive cloud-native technology learning platform with SPA navigation"
	/>
</svelte:head>

<div
	class="app-layout"
	style={Object.entries(layoutVars)
		.map(([key, value]) => `${key}: ${value}`)
		.join("; ")}
>
	<!-- TASK 8A: Sidebar Component will be integrated here -->
	<!-- Compatible with shadcn/ui Sidebar using --sidebar-width CSS variable -->
	<aside class="sidebar-placeholder">
		<div class="placeholder-content">
			<h2>Sidebar</h2>
			<p>TASK 8A</p>
			<small>Navigation menu will be integrated here</small>
			<small>Width: {layoutConfig.sidebarWidth} (configurable in settings.ts)</small>
		</div>
	</aside>

	<div class="main-container">
		<!-- TASK 8B + 8C: Sticky Header with Breadcrumb will be integrated here -->
		<header class="header-placeholder">
			<div class="placeholder-content">
				<strong>Header + Breadcrumb</strong>
				<span>TASK 8B + 8C</span>
			</div>
		</header>

		<main class="content-area">
			{@render children?.()}
		</main>
	</div>
</div>
