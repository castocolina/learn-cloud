<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { browser } from "$app/environment";
	import {
		BookOpen,
		ChevronRight,
		ChevronDown,
		Menu,
		X,
		CheckCircle2,
		Circle,
		Clock
	} from "lucide-svelte";
	import {
		ContentTypeBadge,
		DifficultyBadge,
		ProgressBar,
		LoadingSpinner,
		ErrorState
	} from "$lib/components/demo";
	import {
		demoSidebarMenu,
		totalLessons,
		type DemoNavigationStructure,
		type DemoUnit,
		type DemoLesson
	} from "../../data/demo/navigation/demo-sidebar-menu.js";
	import {
		getBreadcrumbPath,
		scrollToSection,
		type BreadcrumbConfig
	} from "../../data/demo/navigation/breadcrumbs.js";

	// Layout children prop
	let { children } = $props();

	// Global navigation state - managed at layout level
	let navigationData = $state<DemoNavigationStructure | null>(null);
	let selectedUnit = $state<DemoUnit | null>(null);
	let selectedLesson = $state<DemoLesson | null>(null);
	let isLoading = $state<boolean>(true);
	let isSidebarOpen = $state<boolean>(false);
	let expandedUnitId = $state<string | null>(null); // For accordion behavior

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
		get navigationData() { return navigationData; },
		get selectedUnit() { return selectedUnit; },
		get selectedLesson() { return selectedLesson; },
		get isLoading() { return isLoading; },
		get hasValidSelection() { return selectedUnit && selectedLesson; }
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

	const isValidNavigation = $derived(navigationData && navigationData.units.length > 0);

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
				expandedUnitId = null;
				return;
			}

			const hashParts = hash.split("/");
			if (hashParts.length < 3 || hashParts[1] !== "demo") {
				throw new Error(`Invalid hash format: ${hash}`);
			}

			const unitId = `demo-${hashParts[2]}`;
			const lessonSlug = hashParts[3];

			const unit = navigationData.units.find((u: DemoUnit) => u.id === unitId);
			if (!unit) {
				throw new Error(`Unit not found: ${unitId}`);
			}

			selectedUnit = unit;
			expandedUnitId = unitId; // Auto-expand selected unit

			if (lessonSlug) {
				const lesson = unit.lessons.find((l: DemoLesson) => l.url.includes(lessonSlug));
				if (!lesson) {
					throw new Error(`Lesson not found: ${lessonSlug} in unit ${unitId}`);
				}
				selectedLesson = lesson;
			} else {
				selectedLesson = null;
			}

			navigationError = null;
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Unknown navigation error";
			navigationError = {
				type: "navigation",
				message: "Navigation failed",
				details: errorMsg
			};
			console.error("Hash navigation error:", error);
		}
	}

	/**
	 * Navigate to specific lesson
	 */
	function navigateToLesson(lesson: DemoLesson): void {
		if (!browser) return;
		window.location.hash = lesson.url;
		if (window.innerWidth <= 768) {
			isSidebarOpen = false;
		}
	}

	/**
	 * Toggle sidebar visibility
	 */
	function toggleSidebar(): void {
		isSidebarOpen = !isSidebarOpen;
	}

	/**
	 * Toggle unit expansion (accordion behavior)
	 */
	function toggleUnit(unitId: string): void {
		expandedUnitId = expandedUnitId === unitId ? null : unitId;
	}

	/**
	 * Handle breadcrumb navigation click
	 */
	function handleBreadcrumbClick(breadcrumb: BreadcrumbConfig): void {
		if (!breadcrumb.isClickable || !browser) return;

		if (breadcrumb.url.includes("#")) {
			const hashPart = breadcrumb.url.split("#")[1];
			if (hashPart && !hashPart.startsWith("/")) {
				scrollToSection(hashPart);
				return;
			}
		}

		window.location.href = breadcrumb.url;
	}

	/**
	 * Handle scroll events for sticky header behavior
	 */
	function handleScroll(): void {
		if (!browser || !headerElement) return;
		const shouldBeSticky = window.scrollY > 0;
		if (shouldBeSticky !== isHeaderSticky) {
			isHeaderSticky = shouldBeSticky;
		}
	}

	/**
	 * Get lesson status icon and state for visual indicators
	 */
	function getLessonStatus(
		lesson: DemoLesson,
		unit: DemoUnit
	): {
		icon: typeof CheckCircle2;
		state: "completed" | "current" | "pending";
		className: string;
	} {
		const currentLessonIndex = unit.lessons.findIndex((l) => l.id === selectedLesson?.id);
		const lessonIndex = unit.lessons.findIndex((l) => l.id === lesson.id);

		if (selectedUnit?.id === unit.id && lesson.id === selectedLesson?.id) {
			return { icon: Clock, state: "current", className: "demo-lesson-status--current" };
		} else if (
			selectedUnit?.id === unit.id &&
			currentLessonIndex >= 0 &&
			lessonIndex < currentLessonIndex
		) {
			return { icon: CheckCircle2, state: "completed", className: "demo-lesson-status--completed" };
		} else {
			return { icon: Circle, state: "pending", className: "demo-lesson-status--pending" };
		}
	}

	// Lifecycle management
	onMount(() => {
		loadNavigationData();

		if (browser) {
			handleHashNavigation();

			const handleHashChange = () => handleHashNavigation();
			window.addEventListener("hashchange", handleHashChange);

			const handleResize = () => {
				if (window.innerWidth > 768) {
					isSidebarOpen = false;
				}
			};
			window.addEventListener("resize", handleResize);

			const scrollHandler = () => handleScroll();
			window.addEventListener("scroll", scrollHandler, { passive: true });

			return () => {
				window.removeEventListener("hashchange", handleHashChange);
				window.removeEventListener("resize", handleResize);
				window.removeEventListener("scroll", scrollHandler);
			};
		}
	});
</script>

<svelte:head>
	{#if breadcrumbPath?.pageTitle}
		<title>{breadcrumbPath.pageTitle}</title>
	{/if}
	{#if breadcrumbPath?.description}
		<meta name="description" content={breadcrumbPath.description} />
	{/if}
</svelte:head>

<!-- Demo Layout Structure -->
<div class="demo-app-layout">
	<!-- Sticky Header with Project Branding and Breadcrumbs -->
	<header
		bind:this={headerElement}
		class="demo-layout-header"
		class:demo-layout-header--sticky={isHeaderSticky}
	>
		<div class="demo-header-content">
			<!-- Mobile sidebar toggle -->
			<button
				class="demo-mobile-toggle"
				onclick={toggleSidebar}
				aria-label="Toggle navigation"
				class:demo-mobile-toggle--active={isSidebarOpen}
			>
				{#if isSidebarOpen}
					<X size={20} />
				{:else}
					<Menu size={20} />
				{/if}
			</button>

			<!-- Project Branding -->
			<div class="demo-header-brand">
				<BookOpen size={20} class="demo-brand-icon" />
			</div>

			<!-- Breadcrumb Navigation -->
			{#if breadcrumbPath && breadcrumbPath.items.length > 1}
				<nav class="demo-breadcrumb-nav" aria-label="Breadcrumb navigation">
					<ol class="demo-breadcrumb-list">
						{#each breadcrumbPath.items as breadcrumb, index (breadcrumb.id)}
							<li class="demo-breadcrumb-item">
								{#if breadcrumb.isClickable !== false && !breadcrumb.isActive}
									<button
										class="demo-breadcrumb-button"
										onclick={() => handleBreadcrumbClick(breadcrumb)}
										aria-label={breadcrumb.ariaLabel || `Navigate to ${breadcrumb.label}`}
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
				</nav>
			{/if}
		</div>
	</header>

	<!-- Main Content Area with Sidebar -->
	<div class="demo-content-container">
		<!-- Sidebar Navigation -->
		<aside class="demo-layout-sidebar" class:demo-layout-sidebar--open={isSidebarOpen}>
			{#if isLoading}
				<div class="demo-sidebar-loading">
					<LoadingSpinner size="md" message="Loading navigation..." centered={true} />
				</div>
			{:else if navigationError}
				<div class="demo-sidebar-error">
					<ErrorState
						title={navigationError.message}
						message={navigationError.details}
						onRetry={loadNavigationData}
						retryText="Retry"
						variant="error"
						centered={true}
					/>
				</div>
			{:else if isValidNavigation && navigationData}
				<nav class="demo-sidebar-nav">
					<!-- Navigation Stats -->
					<div class="demo-nav-stats">
						<div class="demo-stat-item">
							<strong>{navigationData.metadata.totalUnits}</strong>
							<span>Units</span>
						</div>
						<div class="demo-stat-item">
							<strong>{totalLessons}</strong>
							<span>Lessons</span>
						</div>
					</div>

					<!-- Units Navigation -->
					<div class="demo-nav-units">
						{#each navigationData.units as unit (unit.id)}
							<div class="demo-nav-unit">
								<!-- Unit Header with Toggle -->
								<button
									class="demo-nav-unit-header"
									class:demo-nav-unit-header--active={selectedUnit?.id === unit.id}
									class:demo-nav-unit-header--expanded={expandedUnitId === unit.id}
									onclick={() => toggleUnit(unit.id)}
									aria-expanded={expandedUnitId === unit.id}
								>
									<div class="demo-nav-unit-icon">{unit.icon}</div>
									<div class="demo-nav-unit-info">
										<h3 class="demo-nav-unit-title">{unit.title}</h3>
										<div class="demo-nav-unit-meta">
											<DifficultyBadge difficulty={unit.difficulty} />
											<span class="demo-nav-unit-duration">{unit.estimatedHours}h</span>
											<span class="demo-nav-unit-count">{unit.lessons.length} lessons</span>
										</div>
										<!-- Progress Indicator -->
										<div class="demo-nav-unit-progress">
											<ProgressBar
												value={selectedUnit?.id === unit.id && selectedLesson
													? unit.lessons.findIndex((l) => l.id === selectedLesson!.id) + 1
													: 0}
												max={unit.lessons.length}
												size="sm"
												variant="primary"
												showLabel={true}
												label={selectedUnit?.id === unit.id && selectedLesson
													? `${unit.lessons.findIndex((l) => l.id === selectedLesson!.id) + 1}/${unit.lessons.length}`
													: `0/${unit.lessons.length}`}
											/>
										</div>
									</div>
									<div class="demo-nav-unit-toggle">
										{#if expandedUnitId === unit.id}
											<ChevronDown size={16} />
										{:else}
											<ChevronRight size={16} />
										{/if}
									</div>
								</button>

								<!-- Unit Lessons (Accordion Content) -->
								{#if expandedUnitId === unit.id}
									<div class="demo-nav-lessons">
										{#each unit.lessons as lesson (lesson.id)}
											{@const lessonStatus = getLessonStatus(lesson, unit)}
											<button
												class="demo-nav-lesson {lessonStatus.className}"
												class:demo-nav-lesson--active={selectedLesson?.id === lesson.id}
												onclick={() => navigateToLesson(lesson)}
											>
												<div class="demo-nav-lesson-status">
													<lessonStatus.icon size={14} />
												</div>
												<span class="demo-nav-lesson-icon">{lesson.icon}</span>
												<div class="demo-nav-lesson-info">
													<h4 class="demo-nav-lesson-title">{lesson.title}</h4>
													<div class="demo-nav-lesson-meta">
														<ContentTypeBadge contentType={lesson.contentType} />
														<span class="demo-nav-lesson-duration">{lesson.duration}</span>
													</div>
												</div>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</nav>
			{/if}
		</aside>

		<!-- Sidebar Overlay for Mobile -->
		{#if isSidebarOpen}
			<div
				class="demo-sidebar-overlay"
				role="button"
				tabindex="0"
				onclick={toggleSidebar}
				onkeydown={(e) => (e.key === "Enter" || e.key === " " ? toggleSidebar() : null)}
				aria-label="Close sidebar"
			></div>
		{/if}

		<!-- Main Page Content -->
		<main class="demo-layout-main">
			{@render children()}
		</main>
	</div>
</div>

<style>
	/* Demo Layout Styles - Using CSS Custom Properties for Z-index */

	.demo-app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	/* Sticky Header */
	.demo-layout-header {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		background: hsl(var(--background));
		border-bottom: 1px solid hsl(var(--border));
		transition: all 0.2s ease;
	}

	.demo-layout-header--sticky {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		background: hsl(var(--background));
	}

	.demo-header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		max-width: 100%;
	}

	/* Mobile toggle */
	.demo-mobile-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.2s ease;
		color: hsl(var(--foreground));
	}

	.demo-mobile-toggle:hover {
		background: hsl(var(--accent));
	}

	/* Project Branding */
	.demo-header-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.demo-brand-icon {
		color: hsl(var(--primary));
	}

	.demo-brand-title {
		font-size: 1.1rem;
		white-space: nowrap;
	}

	/* Breadcrumb Navigation */
	.demo-breadcrumb-nav {
		flex: 1;
		min-width: 0;
		margin-left: 1rem;
	}

	.demo-breadcrumb-list {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
		flex-wrap: wrap;
	}

	.demo-breadcrumb-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-width: 0;
	}

	.demo-breadcrumb-button {
		background: transparent;
		border: none;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
		transition: all 0.2s ease;
		max-width: 200px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.demo-breadcrumb-button:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.demo-breadcrumb-current {
		color: hsl(var(--foreground));
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
		max-width: 200px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.demo-breadcrumb-separator {
		color: hsl(var(--muted-foreground));
		flex-shrink: 0;
	}

	/* Content Container */
	.demo-content-container {
		display: flex;
		flex: 1;
		position: relative;
	}

	/* Sidebar */
	.demo-layout-sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: 280px;
		height: 100vh;
		background: hsl(var(--sidebar));
		border-right: 1px solid hsl(var(--sidebar-border));
		transform: translateX(-100%);
		transition: transform 0.3s ease;
		overflow-y: auto; /* Allow sidebar to scroll if needed */
		z-index: var(--z-sidebar);
		padding-top: 4rem; /* Account for header height */
		/* Ensure solid background on mobile overlay */
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}

	.demo-layout-sidebar--open {
		transform: translateX(0);
	}

	.demo-sidebar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: calc(var(--z-sidebar) - 1);
	}

	/* Sidebar Content */
	.demo-sidebar-loading,
	.demo-sidebar-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
		text-align: center;
	}

	.demo-loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid hsl(var(--border));
		border-top: 3px solid hsl(var(--primary));
		border-radius: 50%;
		animation: demo-spin 1s linear infinite;
	}

	@keyframes demo-spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.demo-sidebar-error {
		background: hsl(var(--destructive) / 0.1);
		border-radius: 8px;
		margin: 1rem;
	}

	.demo-retry-button {
		padding: 0.5rem 1rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	/* Navigation Styles */
	.demo-sidebar-nav {
		padding: 1rem;
	}

	.demo-nav-stats {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: hsl(var(--sidebar-accent));
		border-radius: 8px;
	}

	.demo-stat-item {
		text-align: center;
		flex: 1;
	}

	.demo-stat-item strong {
		display: block;
		font-size: 1.2rem;
		color: hsl(var(--sidebar-primary));
	}

	.demo-stat-item span {
		font-size: 0.75rem;
		color: hsl(var(--sidebar-foreground));
		opacity: 0.8;
	}

	/* Unit Navigation */
	.demo-nav-unit {
		margin-bottom: 0.5rem;
	}

	.demo-nav-unit-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: transparent;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s ease;
		color: hsl(var(--sidebar-foreground));
	}

	.demo-nav-unit-header:hover {
		background: hsl(var(--sidebar-accent) / 0.5);
	}

	.demo-nav-unit-header--active {
		background: hsl(24 9.8% 10% / 0.08);
		border-left: 4px solid hsl(24 9.8% 10%);
		color: hsl(24 9.8% 10%);
		font-weight: 700;
	}

	.dark .demo-nav-unit-header--active {
		background: hsl(210 40% 60% / 0.15);
		border-left: 4px solid hsl(210 40% 60%);
		color: hsl(210 40% 60%);
	}

	.demo-nav-unit-header--expanded {
		background: hsl(var(--sidebar-accent));
	}

	.demo-nav-unit-header--active.demo-nav-unit-header--expanded {
		background: hsl(var(--sidebar-primary) / 0.2);
		color: hsl(var(--sidebar-primary));
	}

	.demo-nav-unit-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.demo-nav-unit-info {
		flex: 1;
		min-width: 0;
	}

	.demo-nav-unit-title {
		font-size: 0.9rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--sidebar-foreground));
		line-height: 1.2;
	}

	.demo-nav-unit-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.demo-nav-unit-duration,
	.demo-nav-unit-count {
		font-size: 0.7rem;
		color: hsl(var(--muted-foreground));
	}

	.demo-nav-unit-progress {
		margin-top: 0.5rem;
	}

	.demo-nav-unit-toggle {
		flex-shrink: 0;
		color: hsl(var(--muted-foreground));
	}

	/* Lesson Navigation */
	.demo-nav-lessons {
		margin-left: 2.25rem;
		border-left: 2px solid hsl(var(--sidebar-border));
		padding-left: 1rem;
		margin-bottom: 1rem;
	}

	.demo-nav-lesson {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		margin-bottom: 0.25rem;
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s ease;
		color: hsl(var(--sidebar-foreground));
	}

	.demo-nav-lesson:hover {
		background: hsl(var(--sidebar-accent) / 0.3);
		transform: translateX(2px);
	}

	.demo-nav-lesson--active {
		background: hsl(24 9.8% 10% / 0.1);
		border-left: 3px solid hsl(24 9.8% 10%);
		transform: translateX(4px);
		box-shadow: 0 1px 3px hsl(24 9.8% 10% / 0.1);
	}

	.demo-nav-lesson--active .demo-nav-lesson-title {
		color: hsl(24 9.8% 10%);
		font-weight: 700;
	}

	.demo-nav-lesson--active .demo-nav-lesson-icon {
		color: hsl(24 9.8% 10%);
	}

	.dark .demo-nav-lesson--active {
		background: hsl(210 40% 60% / 0.15);
		border-left: 3px solid hsl(210 40% 60%);
		box-shadow: 0 1px 3px hsl(210 40% 60% / 0.1);
	}

	.dark .demo-nav-lesson--active .demo-nav-lesson-title {
		color: hsl(210 40% 60%);
	}

	.dark .demo-nav-lesson--active .demo-nav-lesson-icon {
		color: hsl(210 40% 60%);
	}

	.demo-nav-lesson-status {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.25rem;
	}

	.demo-lesson-status--completed .demo-nav-lesson-status {
		color: hsl(var(--chart-2));
	}

	.demo-lesson-status--current .demo-nav-lesson-status {
		color: hsl(var(--sidebar-primary));
	}

	.demo-lesson-status--pending .demo-nav-lesson-status {
		color: hsl(var(--muted-foreground));
		opacity: 0.5;
	}

	.demo-lesson-status--completed .demo-nav-lesson-title {
		color: hsl(var(--chart-2));
		opacity: 0.8;
	}

	.demo-lesson-status--completed .demo-nav-lesson-icon {
		opacity: 0.6;
	}

	.demo-nav-lesson-icon {
		font-size: 1rem;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.demo-nav-lesson-info {
		flex: 1;
		min-width: 0;
	}

	.demo-nav-lesson-title {
		font-size: 0.8rem;
		font-weight: 500;
		margin: 0 0 0.25rem 0;
		color: hsl(var(--sidebar-foreground));
		line-height: 1.3;
	}

	.demo-nav-lesson-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.demo-nav-lesson-duration {
		font-size: 0.7rem;
		color: hsl(var(--muted-foreground));
	}

	/* Main Content */
	.demo-layout-main {
		flex: 1;
		padding: 1rem;
		min-height: calc(100vh - 4rem); /* Account for header */
		width: 100%;
	}

	/* Mobile-specific styles */
	@media (max-width: 480px) {
		.demo-header-content {
			padding: 0.5rem 0.75rem;
			gap: 0.5rem;
		}

		.demo-brand-title {
			font-size: 1rem;
		}

		.demo-breadcrumb-nav {
			margin-left: 0.5rem;
		}

		.demo-breadcrumb-button,
		.demo-breadcrumb-current {
			max-width: 100px;
			font-size: 0.8rem;
		}

		/* Ensure sidebar is completely opaque on mobile */
		.demo-layout-sidebar {
			background: hsl(60 9.1% 97.8%);
			box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
		}

		.dark .demo-layout-sidebar {
			background: hsl(12 6.5% 15.1%);
		}

		/* Enhanced visibility for active states on mobile */
		.demo-nav-unit-header--active {
			background: hsl(24 9.8% 10% / 0.1) !important;
			border-left: 4px solid hsl(24 9.8% 10%) !important;
			color: hsl(24 9.8% 10%) !important;
			font-weight: 700 !important;
		}

		.demo-nav-lesson--active {
			background: hsl(24 9.8% 10% / 0.1) !important;
			border-left: 4px solid hsl(24 9.8% 10%) !important;
			color: hsl(24 9.8% 10%) !important;
		}

		.demo-nav-lesson--active .demo-nav-lesson-title {
			color: hsl(24 9.8% 10%) !important;
			font-weight: 700 !important;
		}

		.dark .demo-nav-unit-header--active {
			background: hsl(210 40% 60% / 0.2) !important;
			border-left: 4px solid hsl(210 40% 60%) !important;
			color: hsl(210 40% 60%) !important;
		}

		.dark .demo-nav-lesson--active {
			background: hsl(210 40% 60% / 0.2) !important;
			border-left: 4px solid hsl(210 40% 60%) !important;
		}

		.dark .demo-nav-lesson--active .demo-nav-lesson-title {
			color: hsl(210 40% 60%) !important;
		}
	}

	/* Desktop styles */
	@media (min-width: 769px) {
		.demo-mobile-toggle {
			display: none;
		}

		.demo-layout-sidebar {
			position: static;
			transform: none;
			padding-top: 1rem;
			width: 280px;
			height: calc(100vh - 4rem);
		}

		.demo-sidebar-overlay {
			display: none;
		}

		.demo-content-container {
			display: flex;
		}

		.demo-layout-main {
			padding: 2rem;
			flex: 1;
			min-width: 0;
		}

		.demo-header-content {
			padding: 1rem 2rem;
		}
	}

	/* Large desktop styles */
	@media (min-width: 1280px) {
		.demo-layout-main {
			padding: 2rem 3rem;
			max-width: 1200px;
		}
	}
</style>
