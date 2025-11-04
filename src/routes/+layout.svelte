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
	import StickyHeader from "$lib/components/navigation/StickyHeader.svelte";
	import Dialog from "$lib/components/shared/Dialog.svelte";
	import { onMount } from "svelte";
	import { cleanupOldStates } from "$lib/stores/diagram-persistence.js";

	let { children } = $props();

	// Cleanup expired diagram states on app mount
	onMount(() => {
		cleanupOldStates();
	});
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
	<main class="main-content flex flex-1 flex-col">
		<!-- TASK 8B: Sticky Header with Breadcrumb and Search -->
		<StickyHeader />

		<!-- Content area: renders ContentRouter and all route content -->
		<div class="flex-1">
			{@render children?.()}
		</div>
	</main>
</Sidebar.Provider>

<!-- Global Dialog (TASK 8E): Store mode for openDialog() API -->
<Dialog />
