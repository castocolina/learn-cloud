<script lang="ts">
	import { demoSidebarMenu } from "../../data/demo/navigation/demo-sidebar-menu.js";
	import {
		DemoSidebar,
		WelcomeView,
		UnitView,
		LessonView,
		FloatingNav
	} from "$lib/components/demo";
	import { getContext, onMount } from "svelte";
	import { visitUnit, completeLesson } from "../../lib/stores/progress.js";
	import { useSidebar } from "../../lib/stores/sidebar.js";
	import type {
		DemoUnit,
		DemoLesson,
		DemoNavigationStructure
	} from "../../data/demo/navigation/demo-sidebar-menu.js";

	// Context interface for layout navigation
	interface LayoutNavigationContext {
		navigationData: DemoNavigationStructure | null;
		selectedUnit: DemoUnit | null;
		selectedLesson: DemoLesson | null;
		isLoading: boolean;
		navigationError: { type: string; message: string; details?: string } | null;
		updateSelectedUnit: (unit: DemoUnit | null) => void;
		updateSelectedLesson: (lesson: DemoLesson | null) => void;
	}

	// Navigation state management - use context state instead of local state
	let expandedUnitId: string | null = $state(null);
	let isLoading: boolean = $state(false);
	let error: { type: string; message: string; details?: string } | null = $state(null);

	// Get layout context for navigation state
	const layoutContext = getContext("demo-navigation") as LayoutNavigationContext;

	// Use layout context state directly instead of local state
	const selectedUnit = $derived(layoutContext?.selectedUnit || null);
	const selectedLesson = $derived(layoutContext?.selectedLesson || null);

	// Sidebar state management
	const { isCollapsed, sidebarWidth, init } = useSidebar();

	// Event handlers for sidebar navigation
	function handleUnitSelect(unit: DemoUnit): void {
		// Mark unit as visited
		visitUnit(unit.id);

		// Update URL
		window.location.hash = `/demo/unit/${unit.id}`;

		// Update layout context for breadcrumb and state
		if (layoutContext?.updateSelectedUnit) {
			layoutContext.updateSelectedUnit(unit);
		}
		if (layoutContext?.updateSelectedLesson) {
			layoutContext.updateSelectedLesson(null);
		}

		// Scroll to top smoothly - try multiple containers
		scrollToTop();
	}

	function handleLessonSelect(lesson: DemoLesson): void {
		// Find and set the unit that contains this lesson
		let targetUnit: DemoUnit | null = null;
		for (const unit of demoSidebarMenu.units) {
			if (unit.lessons.some((l) => l.id === lesson.id)) {
				targetUnit = unit;
				break;
			}
		}

		// Mark lesson as completed and unit as visited
		if (targetUnit) {
			visitUnit(targetUnit.id);
			completeLesson(targetUnit.id, lesson.id);
		}

		// Update URL
		if (targetUnit) {
			window.location.hash = `/demo/unit/${targetUnit.id}/lesson/${lesson.id}`;
		}

		// Update layout context for breadcrumb and state
		if (layoutContext?.updateSelectedUnit) {
			layoutContext.updateSelectedUnit(targetUnit);
		}
		if (layoutContext?.updateSelectedLesson) {
			layoutContext.updateSelectedLesson(lesson);
		}

		// Scroll to top smoothly - try multiple containers
		scrollToTop();
	}

	function handleBreadcrumbNavigation(event: CustomEvent): void {
		const { type, unit } = event.detail;

		// Update layout context instead of local state
		if (type === "home") {
			if (layoutContext?.updateSelectedUnit) {
				layoutContext.updateSelectedUnit(null);
			}
			if (layoutContext?.updateSelectedLesson) {
				layoutContext.updateSelectedLesson(null);
			}
		} else if (type === "unit" && unit) {
			if (layoutContext?.updateSelectedUnit) {
				layoutContext.updateSelectedUnit(unit);
			}
			if (layoutContext?.updateSelectedLesson) {
				layoutContext.updateSelectedLesson(null);
			}
		}

		// Scroll to top when navigating via breadcrumb
		scrollToTop();
	}

	// Comprehensive scroll to top function
	function scrollToTop(): void {
		// Try layout main container FIRST since it has the scroll (overflow-y: auto)
		const layoutMain = document.querySelector(".demo-layout-main");
		if (layoutMain) {
			layoutMain.scrollTo({ top: 0, behavior: "smooth" });
		}

		// Try window scroll as fallback
		window.scrollTo({ top: 0, behavior: "smooth" });

		// Try main content container
		const mainContainer = document.querySelector(".demo-content-main");
		if (mainContainer) {
			mainContainer.scrollTo({ top: 0, behavior: "smooth" });
		}

		// Try any scrollable parent as last resort
		const scrollableContainers = document.querySelectorAll("[data-scrollable], .scrollable, main");
		scrollableContainers.forEach((container) => {
			if (container.scrollTop > 0) {
				container.scrollTo({ top: 0, behavior: "smooth" });
			}
		});
	}

	function handleUnitToggle(unitId: string): void {
		expandedUnitId = expandedUnitId === unitId ? null : unitId;
	}

	function handleRetry(): void {
		// Reset error state and reload navigation
		error = null;
		isLoading = true;
		// Simulate retry operation
		setTimeout(() => {
			isLoading = false;
		}, 1000);
	}

	// Set up event listener for breadcrumb navigation and initialize sidebar
	onMount(() => {
		// Initialize sidebar state from localStorage
		init();

		// Set up breadcrumb navigation listener
		const handleEvent = (e: Event) => handleBreadcrumbNavigation(e as CustomEvent);
		document.addEventListener("breadcrumb-navigate", handleEvent);
		return () => document.removeEventListener("breadcrumb-navigate", handleEvent);
	});

	// Determine current view type for content rendering
	const currentView = $derived(() => {
		if (selectedLesson && selectedUnit) return "lesson";
		if (selectedUnit) return "unit";
		return "welcome";
	});
</script>

<svelte:head>
	<title>Interactive Demo - {demoSidebarMenu.metadata.title}</title>
	<meta
		name="description"
		content="Interactive demonstration of the learning platform with dynamic content switching"
	/>
</svelte:head>

<!-- Demo Page Two-Column Layout -->
<div
	class="demo-interactive-layout"
	class:demo-interactive-layout--collapsed={$isCollapsed}
	style="--sidebar-width: {$sidebarWidth}"
>
	<!-- Left Column: Navigation Sidebar -->
	<aside class="demo-content-sidebar" class:demo-content-sidebar--collapsed={$isCollapsed}>
		<DemoSidebar
			navigationData={demoSidebarMenu}
			{selectedUnit}
			{selectedLesson}
			{expandedUnitId}
			{isLoading}
			{error}
			onUnitSelect={handleUnitSelect}
			onLessonSelect={handleLessonSelect}
			onUnitToggle={handleUnitToggle}
			onRetry={handleRetry}
		/>
	</aside>

	<!-- Right Column: Dynamic Content Area -->
	<main class="demo-content-main" class:demo-content-main--sidebar-collapsed={$isCollapsed}>
		{#if currentView() === "lesson" && selectedLesson}
			<!-- Lesson View: When a specific lesson is selected -->
			<LessonView lesson={selectedLesson} />
		{:else if currentView() === "unit" && selectedUnit}
			<!-- Unit View: When a unit is selected -->
			<UnitView unit={selectedUnit} />
		{:else}
			<!-- Welcome View: Default/initial state -->
			<WelcomeView units={demoSidebarMenu.units} />
		{/if}
	</main>
</div>

<!-- Show FloatingNav only when viewing a lesson -->
{#if currentView() === "lesson" && selectedLesson}
	<FloatingNav />
{/if}

<style>
	/* Demo Interactive Layout - Two Column Design with Collapsible Sidebar */
	.demo-interactive-layout {
		display: grid;
		grid-template-columns: var(--sidebar-width, 320px) 1fr;
		gap: 0;
		height: calc(100vh - 4rem); /* Account for layout header */
		max-height: calc(100vh - 4rem);
		overflow: hidden;
		transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Collapsed state */
	.demo-interactive-layout--collapsed {
		grid-template-columns: 60px 1fr;
	}

	/* Left Column: Sidebar */
	.demo-content-sidebar {
		background: hsl(var(--sidebar, 60 9.1% 97.8%));
		border-right: 1px solid hsl(var(--sidebar-border, 220 13% 91%));
		overflow-y: auto;
		position: relative;
		width: var(--sidebar-width, 320px);
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Collapsed sidebar state */
	.demo-content-sidebar--collapsed {
		width: 60px;
		overflow: hidden;
	}

	/* Right Column: Main Content */
	.demo-content-main {
		background: hsl(var(--background));
		overflow-y: auto;
		position: relative;
		padding: 0; /* Let individual views handle their own padding */
		transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Content area adjustment when sidebar is collapsed */
	.demo-content-main--sidebar-collapsed {
		/* Additional content space available when sidebar is collapsed */
		margin-left: 0;
	}

	/* Mobile-First Responsive Design */
	@media (max-width: 768px) {
		.demo-interactive-layout,
		.demo-interactive-layout--collapsed {
			/* Reset grid for mobile - disable collapsible behavior */
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
			height: calc(100vh - 4rem);
			transition: none; /* Disable transition on mobile */
		}

		/* Hide desktop sidebar completely on mobile - use mobile overlay instead */
		.demo-content-sidebar,
		.demo-content-sidebar--collapsed {
			display: none;
			transition: none; /* Disable transition on mobile */
		}

		.demo-content-main,
		.demo-content-main--sidebar-collapsed {
			min-height: 100vh;
			margin-left: 0; /* Reset margin on mobile */
			transition: none; /* Disable transition on mobile */
		}
	}

	/* Tablet Layout */
	@media (min-width: 769px) and (max-width: 1024px) {
		.demo-interactive-layout {
			grid-template-columns: var(--sidebar-width, 280px) 1fr;
		}

		.demo-interactive-layout--collapsed {
			grid-template-columns: 60px 1fr;
		}

		.demo-content-sidebar {
			width: var(--sidebar-width, 280px);
		}

		.demo-content-sidebar--collapsed {
			width: 60px;
		}
	}

	/* Large Desktop Layout */
	@media (min-width: 1280px) {
		.demo-interactive-layout {
			grid-template-columns: var(--sidebar-width, 360px) 1fr;
		}

		.demo-interactive-layout--collapsed {
			grid-template-columns: 60px 1fr;
		}

		.demo-content-sidebar {
			width: var(--sidebar-width, 360px);
		}

		.demo-content-sidebar--collapsed {
			width: 60px;
		}
	}

	/* Dark Mode Support - these styles are used in the component */

	/* Ensure proper scrolling behavior */
	.demo-content-sidebar::-webkit-scrollbar,
	.demo-content-main::-webkit-scrollbar {
		width: 8px;
	}

	.demo-content-sidebar::-webkit-scrollbar-track,
	.demo-content-main::-webkit-scrollbar-track {
		background: transparent;
	}

	.demo-content-sidebar::-webkit-scrollbar-thumb,
	.demo-content-main::-webkit-scrollbar-thumb {
		background: hsl(var(--muted-foreground, 215.4 16.3% 46.9%) / 0.3);
		border-radius: 4px;
	}

	.demo-content-sidebar::-webkit-scrollbar-thumb:hover,
	.demo-content-main::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground, 215.4 16.3% 46.9%) / 0.5);
	}
</style>
