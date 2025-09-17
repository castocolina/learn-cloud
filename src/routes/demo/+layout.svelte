<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { browser } from "$app/environment";
	import { ChevronRight, Menu, X } from "lucide-svelte";
	import {
		demoSidebarMenu,
		type DemoNavigationStructure,
		type DemoUnit,
		type DemoLesson
	} from "../../data/demo/navigation/demo-sidebar-menu.js";
	import { getBreadcrumbPath } from "../../data/demo/navigation/breadcrumbs.js";
	import { visitUnit, completeLesson } from "../../lib/stores/progress.js";
	import DemoSidebar from "../../lib/components/demo/DemoSidebar.svelte";
	import ThemeSwitch from "../../lib/components/ThemeSwitch.svelte";

	// Layout children prop
	let { children } = $props();

	// Global navigation state - managed at layout level for context
	let navigationData = $state<DemoNavigationStructure | null>(null);
	let selectedUnit = $state<DemoUnit | null>(null);
	let selectedLesson = $state<DemoLesson | null>(null);
	let isLoading = $state<boolean>(true);
	let isMobileMenuOpen = $state<boolean>(false);

	// Sticky header state
	let isHeaderSticky = $state<boolean>(false);
	let headerElement = $state<HTMLElement | null>(null);

	// Error handling
	interface NavigationError {
		type: "load" | "parse" | "navigation";
		message: string;
		details?: string;
	}
	let navigationError = $state<NavigationError | null>(null);

	// Set context for child components to access navigation state
	setContext("demo-navigation", {
		get navigationData() {
			return navigationData;
		},
		get selectedUnit() {
			return selectedUnit;
		},
		get selectedLesson() {
			return selectedLesson;
		},
		get isLoading() {
			return isLoading;
		},
		get navigationError() {
			return navigationError;
		},
		// Allow child components to update selected items for breadcrumb
		updateSelectedUnit: (unit: DemoUnit | null) => {
			selectedUnit = unit;
		},
		updateSelectedLesson: (lesson: DemoLesson | null) => {
			selectedLesson = lesson;
		}
	});

	// Derived state for breadcrumb tracking
	const currentSection = $derived.by(() => {
		if (selectedLesson && selectedUnit) return "lesson";
		if (selectedUnit) return "unit";
		return "default";
	});

	const breadcrumbPath = $derived.by(() => {
		return getBreadcrumbPath(
			currentSection,
			selectedUnit?.title,
			selectedUnit?.id,
			selectedLesson?.title,
			selectedLesson?.id
		);
	});

	/**
	 * Load navigation data with comprehensive error handling
	 */
	async function loadNavigationData(): Promise<void> {
		try {
			isLoading = true;
			navigationError = null;

			if (!demoSidebarMenu || !demoSidebarMenu.units || !Array.isArray(demoSidebarMenu.units)) {
				throw new Error("Invalid navigation data structure");
			}

			if (demoSidebarMenu.units.length === 0) {
				throw new Error("No units found in navigation data");
			}

			const lessonsCount = demoSidebarMenu.units.reduce((total: number, unit: DemoUnit) => {
				if (!unit.lessons || !Array.isArray(unit.lessons)) {
					throw new Error(`Invalid lessons array in unit: ${unit.title}`);
				}
				return total + unit.lessons.length;
			}, 0);

			if (lessonsCount === 0) {
				throw new Error("No lessons found in navigation data");
			}

			navigationData = demoSidebarMenu;
		} catch (error) {
			const errorMsg =
				error instanceof Error ? error.message : "Unknown error loading navigation data";
			navigationError = {
				type: "load",
				message: "Failed to load navigation data",
				details: errorMsg
			};
			console.error("Navigation data loading error:", error);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Parse hash and navigate to appropriate content
	 */
	function handleHashNavigation(): void {
		if (!browser || !navigationData) return;

		try {
			const hash = window.location.hash.slice(1);

			if (!hash || hash === "/demo") {
				selectedUnit = null;
				selectedLesson = null;
				return;
			}

			const pathParts = hash.split("/").filter(Boolean);
			// Expected formats:
			// /demo
			// /demo/unit/unitId
			// /demo/unit/unitId/lesson/lessonId

			if (pathParts.length < 2) {
				console.warn("Invalid hash format:", hash);
				return;
			}

			// Parse the new URL format
			if (pathParts[0] === "demo" && pathParts[1] === "unit" && pathParts[2]) {
				const unitId = pathParts[2];
				const unit = navigationData.units.find((u) => u.id === unitId);
				if (unit) {
					selectedUnit = unit;

					// Mark unit as visited
					visitUnit(unitId);

					// Check if there's a lesson part
					if (pathParts[3] === "lesson" && pathParts[4]) {
						const lessonId = pathParts[4];
						const lesson = unit.lessons.find((l) => l.id === lessonId);
						if (lesson) {
							selectedLesson = lesson;
							// Mark lesson as completed
							completeLesson(unitId, lessonId);
						} else {
							selectedLesson = null;
							console.warn(`Lesson not found: ${lessonId}`);
						}
					} else {
						selectedLesson = null;
					}
				} else {
					console.warn(`Unit not found: ${unitId}`);
				}
			} else {
				// Fallback to old format for backward compatibility
				const [, unitId, lessonId] = pathParts;

				if (unitId) {
					const unit = navigationData.units.find((u) => u.id === unitId);
					if (unit) {
						selectedUnit = unit;

						// Mark unit as visited
						visitUnit(unitId);

						if (lessonId) {
							const lesson = unit.lessons.find((l) => l.id === lessonId);
							if (lesson) {
								selectedLesson = lesson;
								// Mark lesson as completed
								completeLesson(unitId, lessonId);
							} else {
								selectedLesson = null;
								console.warn(`Lesson not found: ${lessonId}`);
							}
						} else {
							selectedLesson = null;
						}
					} else {
						console.warn(`Unit not found: ${unitId}`);
					}
				}
			}
		} catch (error) {
			console.error("Hash navigation error:", error);
		}
	}

	/**
	 * Toggle mobile menu visibility
	 */
	function toggleMobileMenu(): void {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	/**
	 * Close mobile menu (called when clicking outside or navigating)
	 */
	function closeMobileMenu(): void {
		isMobileMenuOpen = false;
	}

	/**
	 * Handle breadcrumb navigation clicks
	 */
	function handleBreadcrumbClick(breadcrumbId: string): void {
		// Navigate based on breadcrumb ID
		if (breadcrumbId === "demo") {
			// Navigate to home/welcome - reset both layout and trigger page reset
			selectedUnit = null;
			selectedLesson = null;
			// Update URL
			window.location.hash = "/demo";
			// Dispatch a custom event to notify child components
			const event = new CustomEvent("breadcrumb-navigate", {
				detail: { type: "home", unit: null, lesson: null }
			});
			document.dispatchEvent(event);
		} else if (breadcrumbId === "unit") {
			// Navigate to current unit (from lesson back to unit overview)
			if (selectedUnit) {
				selectedLesson = null; // Clear lesson but keep unit
				// Update URL
				window.location.hash = `/demo/unit/${selectedUnit.id}`;
				// Dispatch event to notify child components
				const event = new CustomEvent("breadcrumb-navigate", {
					detail: { type: "unit", unit: selectedUnit, lesson: null }
				});
				document.dispatchEvent(event);
			}
		}

		// Scroll to top smoothly - try layout main container first since it has the scroll
		const layoutMain = document.querySelector(".demo-layout-main");
		if (layoutMain) {
			layoutMain.scrollTo({ top: 0, behavior: "smooth" });
		}

		// Fallback to window scroll
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	/**
	 * Handle sticky header on scroll
	 */
	function handleScroll(): void {
		if (headerElement) {
			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			isHeaderSticky = scrollTop > 0;
		}
	}

	// Lifecycle hooks
	onMount(() => {
		loadNavigationData();

		if (browser) {
			// Handle initial hash navigation
			handleHashNavigation();

			// Listen for hash changes
			const handleHashChange = () => handleHashNavigation();
			window.addEventListener("hashchange", handleHashChange);

			// Handle scroll for sticky header
			window.addEventListener("scroll", handleScroll, { passive: true });

			return () => {
				window.removeEventListener("hashchange", handleHashChange);
				window.removeEventListener("scroll", handleScroll);
			};
		}
	});
</script>

<svelte:head>
	<title>Demo Layout - Cloud-Native Learning Platform</title>
	<meta name="description" content="Interactive demo of the cloud-native learning platform" />
</svelte:head>

<!-- Main Demo Layout Container -->
<div class="demo-app-layout">
	<!-- Demo Header -->
	<header
		bind:this={headerElement}
		class="demo-layout-header"
		class:demo-layout-header--sticky={isHeaderSticky}
	>
		<div class="demo-header-container">
			<div class="demo-header-content">
				<!-- Mobile Menu Toggle (Hidden on Desktop) -->
				<button
					class="demo-mobile-menu-toggle"
					onclick={toggleMobileMenu}
					aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
					aria-expanded={isMobileMenuOpen}
				>
					{#if isMobileMenuOpen}
						<X size={24} />
					{:else}
						<Menu size={24} />
					{/if}
				</button>

				<!-- Breadcrumb Navigation (moved inside header content) -->
				{#if breadcrumbPath && breadcrumbPath.items.length > 1}
					<nav class="demo-breadcrumbs" aria-label="Breadcrumb navigation">
						<div class="demo-breadcrumb-container">
							<!-- Book Emoji Icon -->
							<span class="demo-breadcrumb-icon">📚</span>
							<ol class="demo-breadcrumb-list">
								{#each breadcrumbPath.items as breadcrumb, index (breadcrumb.id)}
									<li class="demo-breadcrumb-item">
										{#if breadcrumb.isClickable && !breadcrumb.isActive}
											<button
												class="demo-breadcrumb-link"
												onclick={() => handleBreadcrumbClick(breadcrumb.id)}
												aria-label={`Navigate to ${breadcrumb.label}`}
											>
												{breadcrumb.label}
											</button>
										{:else}
											<span
												class="demo-breadcrumb-current"
												aria-current={breadcrumb.isActive ? "page" : undefined}
											>
												{breadcrumb.label}
											</span>
										{/if}

										{#if index < breadcrumbPath.items.length - 1}
											<ChevronRight size={14} class="demo-breadcrumb-separator" />
										{/if}
									</li>
								{/each}
							</ol>
						</div>
					</nav>
				{/if}

				<!-- Theme Switch -->
				<div class="demo-header-theme">
					<ThemeSwitch />
				</div>
			</div>
		</div>
	</header>

	<!-- Mobile Sidebar Overlay -->
	{#if isMobileMenuOpen}
		<div
			class="demo-mobile-sidebar-overlay"
			onclick={closeMobileMenu}
			onkeydown={(e) => {
				if (e.key === "Escape") {
					closeMobileMenu();
				}
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Mobile navigation menu"
			tabindex="-1"
		>
			<div class="demo-mobile-sidebar">
				<!-- Mobile Sidebar Header with Close Button -->
				<div class="demo-mobile-sidebar-header">
					<div class="demo-mobile-sidebar-title">
						<span class="demo-mobile-sidebar-icon">📚</span>
						<h2>Navigation</h2>
					</div>
					<button
						class="demo-mobile-sidebar-close"
						onclick={closeMobileMenu}
						aria-label="Close navigation menu"
						type="button"
					>
						<X size={20} />
					</button>
				</div>

				<!-- Sidebar Content -->
				<div class="demo-mobile-sidebar-content">
					{#if navigationData}
						<DemoSidebar
							{navigationData}
							{selectedUnit}
							{selectedLesson}
							expandedUnitId={selectedUnit?.id || null}
							{isLoading}
							error={navigationError}
							onUnitSelect={(unit) => {
								selectedUnit = unit;
								selectedLesson = null;
								window.location.hash = `/demo/unit/${unit.id}`;
								closeMobileMenu();
							}}
							onLessonSelect={(lesson) => {
								selectedLesson = lesson;
								if (selectedUnit) {
									window.location.hash = `/demo/unit/${selectedUnit.id}/lesson/${lesson.id}`;
								}
								closeMobileMenu();
							}}
						/>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Main Content Area -->
	<div class="demo-content-container">
		<!-- Main Page Content -->
		<main class="demo-layout-main">
			{@render children()}
		</main>
	</div>
</div>

<style>
	/* Demo Layout Styles */
	.demo-app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: hsl(var(--background));
	}

	/* Header Styles */
	.demo-layout-header {
		background: hsl(var(--background));
		border-bottom: 1px solid hsl(var(--border));
		transition: all 0.3s ease;
		z-index: 100;
		position: relative;
	}

	.demo-layout-header--sticky {
		position: sticky;
		top: 0;
		backdrop-filter: blur(8px);
		background: hsl(var(--background) / 0.95);
		box-shadow: 0 2px 8px hsl(var(--foreground) / 0.1);
	}

	.demo-header-container {
		max-width: 100%;
		margin: 0 auto;
		padding: 1rem 2rem;
	}

	.demo-header-content {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
	}

	/* Mobile Menu Toggle */
	.demo-mobile-menu-toggle {
		display: none;
		background: transparent;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		padding: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		color: hsl(var(--foreground));
		margin-left: auto; /* Push to right since brand is gone */
	}

	.demo-mobile-menu-toggle:hover {
		background: hsl(var(--accent));
		border-color: hsl(var(--accent-foreground));
	}

	/* Mobile Sidebar Overlay */
	.demo-mobile-sidebar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: var(--z-overlay, 200);
		display: flex;
		justify-content: flex-start;
		align-items: stretch;
	}

	.demo-mobile-sidebar {
		width: 90vw;
		max-width: 400px;
		height: 100vh;
		background: hsl(var(--background));
		border-right: 1px solid hsl(var(--border));
		box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		animation: slideInFromLeft 0.3s ease-out;
		display: flex;
		flex-direction: column;
	}

	/* Mobile Sidebar Header */
	.demo-mobile-sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--sidebar-accent, 60 4.8% 95.9%));
		flex-shrink: 0;
	}

	.demo-mobile-sidebar-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.demo-mobile-sidebar-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.demo-mobile-sidebar-title h2 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: hsl(var(--sidebar-primary, 222.2 84% 4.9%));
	}

	.demo-mobile-sidebar-close {
		background: transparent;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		padding: 0.5rem;
		cursor: pointer;
		color: hsl(var(--muted-foreground));
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.demo-mobile-sidebar-close:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
		border-color: hsl(var(--accent-foreground));
	}

	/* Mobile Sidebar Content */
	.demo-mobile-sidebar-content {
		flex: 1;
		overflow-y: auto;
	}

	@keyframes slideInFromLeft {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}

	/* Breadcrumb Navigation */
	.demo-breadcrumbs {
		justify-self: center;
	}

	/* Theme Toggle */
	.demo-header-theme {
		justify-self: end;
		display: flex;
		align-items: center;
	}

	.demo-breadcrumb-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.demo-breadcrumb-icon {
		flex-shrink: 0;
		font-size: 1rem;
		line-height: 1;
	}

	.demo-breadcrumb-list {
		display: flex;
		align-items: center;
		list-style: none;
		margin: 0;
		padding: 0;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.demo-breadcrumb-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.demo-breadcrumb-link {
		background: transparent;
		border: none;
		color: hsl(var(--muted-foreground));
		text-decoration: underline;
		cursor: pointer;
		font-size: 0.875rem;
		padding: 0;
		transition: color 0.2s ease;
	}

	.demo-breadcrumb-link:hover {
		color: hsl(var(--foreground));
	}

	.demo-breadcrumb-current {
		color: hsl(var(--foreground));
		font-weight: 500;
		font-size: 0.875rem;
	}

	.demo-breadcrumb-separator {
		color: hsl(var(--muted-foreground));
		opacity: 0.5;
	}

	/* Content Container */
	.demo-content-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.demo-layout-main {
		flex: 1;
		overflow-y: auto;
		background: hsl(var(--background));
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.demo-mobile-menu-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.demo-header-container {
			padding: 1rem;
		}

		.demo-header-content {
			grid-template-columns: auto 1fr auto;
			gap: 0.5rem;
		}

		.demo-breadcrumb-list {
			font-size: 0.8rem;
		}

		.demo-mobile-sidebar {
			width: 85vw;
		}
	}

	/* Tablet Styles */
	@media (min-width: 769px) and (max-width: 1024px) {
		.demo-header-container {
			padding: 1.5rem;
		}
	}

	/* Large Desktop Styles */
	@media (min-width: 1280px) {
		.demo-header-container {
			max-width: 1400px;
			padding: 1.5rem 2rem;
		}
	}
</style>
