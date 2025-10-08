<script lang="ts">
	/**
	 * Root Layout - SPA Single Layout Architecture (TASK 8A Complete)
	 *
	 * Main application layout that:
	 * - Integrates shadcn-svelte Sidebar.Provider for global sidebar state
	 * - Uses MainSidebar component with content-menu.ts (129 chapters, 9 units)
	 * - Provides collapsible sidebar with emoji icon mode
	 * - Sticky header with breadcrumb placeholder (TASK 8B+8C)
	 * - ContentRouter for dynamic content loading
	 *
	 * ARCHITECTURE:
	 * - shadcn Sidebar Provider Pattern (manages state + shortcuts)
	 * - Mobile-first responsive design (offcanvas on mobile, icon mode on desktop)
	 * - Natural scroll behavior (no overflow hidden)
	 * - CSS variables for configurable dimensions
	 *
	 * SIDEBAR MODES:
	 * - Expanded: 16rem (256px) with full navigation
	 * - Collapsed: 3rem (48px) showing unit emojis only
	 * - Mobile: 18rem offcanvas overlay (Sheet component)
	 *
	 * @layout RootLayout
	 */

	import "../app.css";
	import { SETTINGS } from "$config/settings.js";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import MainSidebar from "$lib/components/navigation/MainSidebar.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Cloud-Native Learning Platform</title>
	<meta
		name="description"
		content="Interactive cloud-native technology learning platform with SPA navigation"
	/>
</svelte:head>

<!-- Sidebar Provider: manages global sidebar state, keyboard shortcuts (Cmd/Ctrl+B), and cookie persistence -->
<Sidebar.Provider>
	<!-- MainSidebar: 9 units with 129 chapters, collapsible accordion units, emoji icon mode -->
	<MainSidebar collapsible={SETTINGS.ui.sidebar.collapsibleMode} />

	<!-- Main content area with natural scroll -->
	<main class="flex flex-1 flex-col">
		<!-- TASK 8B + 8C: Sticky Header with Breadcrumb (placeholder) -->
		<header
			class="sticky top-0 z-10 flex h-16 items-center gap-2 border-b bg-white px-4 dark:bg-slate-950"
		>
			<!-- Mobile trigger (hamburger menu) - visible only on mobile (<768px) -->
			<Sidebar.Trigger class="mobile-trigger md:hidden" />

			<div class="flex-1">
				<span class="text-sm text-muted-foreground">Header + Breadcrumb (TASK 8B+8C)</span>
			</div>
		</header>

		<!-- Content area: renders ContentRouter and all route content -->
		<div class="flex-1">
			{@render children?.()}
		</div>
	</main>
</Sidebar.Provider>
