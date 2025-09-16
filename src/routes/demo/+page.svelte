<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import {
		demoSidebarMenu,
		totalLessons,
		contentTypeDistribution,
		type DemoNavigationStructure,
		type DemoUnit,
		type DemoLesson,
		DemoContentType,
		DemoDifficulty
	} from "../../data/demo/navigation/demo-sidebar-menu.js";

	// Reactive state using Svelte 5 runes
	let navigationData = $state<DemoNavigationStructure | null>(null);
	let currentHash = $state<string>("");
	let selectedUnit = $state<DemoUnit | null>(null);
	let selectedLesson = $state<DemoLesson | null>(null);
	let isLoading = $state<boolean>(true);
	let errorMessage = $state<string>("");
	let isSidebarOpen = $state<boolean>(false);

	// Derived state for navigation
	const isValidNavigation = $derived(navigationData && navigationData.units.length > 0);
	const hasValidSelection = $derived(selectedUnit && selectedLesson);

	interface NavigationError {
		type: "load" | "parse" | "navigation";
		message: string;
		details?: string;
	}

	let navigationError = $state<NavigationError | null>(null);

	/**
	 * Load navigation data with comprehensive error handling
	 */
	async function loadNavigationData(): Promise<void> {
		try {
			isLoading = true;
			navigationError = null;

			// Validate imported data structure
			if (!demoSidebarMenu) {
				throw new Error("Navigation data not found");
			}

			if (!demoSidebarMenu.units || !Array.isArray(demoSidebarMenu.units)) {
				throw new Error("Invalid navigation data structure: units array missing");
			}

			if (demoSidebarMenu.units.length === 0) {
				throw new Error("No units found in navigation data");
			}

			// Validate metadata
			if (!demoSidebarMenu.metadata || !demoSidebarMenu.metadata.title) {
				throw new Error("Invalid navigation metadata");
			}

			// Validate lessons exist
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
			errorMessage = "";
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
			const hash = window.location.hash.slice(1); // Remove #
			currentHash = hash;

			if (!hash || hash === "/demo") {
				// Default to demo overview
				selectedUnit = null;
				selectedLesson = null;
				return;
			}

			// Parse hash format: /demo/unit-X/lesson-slug
			const hashParts = hash.split("/");
			if (hashParts.length < 3 || hashParts[1] !== "demo") {
				throw new Error(`Invalid hash format: ${hash}`);
			}

			const unitId = `demo-${hashParts[2]}`;
			const lessonSlug = hashParts[3];

			// Find unit
			const unit = navigationData.units.find((u: DemoUnit) => u.id === unitId);
			if (!unit) {
				throw new Error(`Unit not found: ${unitId}`);
			}

			selectedUnit = unit;

			if (lessonSlug) {
				// Find lesson by URL slug
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
		// Close sidebar on mobile after navigation
		if (window.innerWidth <= 768) {
			isSidebarOpen = false;
		}
	}

	/**
	 * Navigate to unit overview
	 */
	function navigateToUnit(unit: DemoUnit): void {
		if (!browser) return;
		window.location.hash = `#/demo/${unit.id.replace("demo-", "")}`;
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
	 * Get content type badge styling
	 */
	function getContentTypeBadge(contentType: DemoContentType): string {
		const baseClasses = "demo-content-badge";
		switch (contentType) {
			case DemoContentType.CODE:
				return `${baseClasses} demo-content-badge--code`;
			case DemoContentType.INTERACTIVE:
				return `${baseClasses} demo-content-badge--interactive`;
			case DemoContentType.DIAGRAM:
				return `${baseClasses} demo-content-badge--diagram`;
			case DemoContentType.TEXT:
				return `${baseClasses} demo-content-badge--text`;
			case DemoContentType.MIXED:
				return `${baseClasses} demo-content-badge--mixed`;
			default:
				return baseClasses;
		}
	}

	/**
	 * Get difficulty badge styling
	 */
	function getDifficultyBadge(difficulty: DemoDifficulty): string {
		const baseClasses = "demo-difficulty-badge";
		switch (difficulty) {
			case DemoDifficulty.BEGINNER:
				return `${baseClasses} demo-difficulty-badge--beginner`;
			case DemoDifficulty.INTERMEDIATE:
				return `${baseClasses} demo-difficulty-badge--intermediate`;
			case DemoDifficulty.ADVANCED:
				return `${baseClasses} demo-difficulty-badge--advanced`;
			default:
				return baseClasses;
		}
	}

	// Lifecycle and event handling
	onMount(() => {
		loadNavigationData();

		if (browser) {
			// Handle initial hash
			handleHashNavigation();

			// Listen for hash changes
			const handleHashChange = () => handleHashNavigation();
			window.addEventListener("hashchange", handleHashChange);

			// Handle sidebar responsive behavior
			const handleResize = () => {
				if (window.innerWidth > 768) {
					isSidebarOpen = false;
				}
			};
			window.addEventListener("resize", handleResize);

			return () => {
				window.removeEventListener("hashchange", handleHashChange);
				window.removeEventListener("resize", handleResize);
			};
		}
	});
</script>

<svelte:head>
	<title>
		{navigationData?.metadata.title || "Demo"} - Cloud-Native Learning Platform
	</title>
	<meta
		name="description"
		content={navigationData?.metadata.description ||
			"Interactive demo of cloud-native learning platform navigation"}
	/>
</svelte:head>

<div class="demo-layout">
	<!-- Mobile header with sidebar toggle -->
	<header class="demo-header">
		<button class="demo-sidebar-toggle" onclick={toggleSidebar} aria-label="Toggle navigation">
			<span class="demo-hamburger" class:demo-hamburger--active={isSidebarOpen}></span>
		</button>
		<h1 class="demo-header-title">
			{navigationData?.metadata.title || "Demo Platform"}
		</h1>
	</header>

	<!-- Sidebar navigation -->
	<aside class="demo-sidebar" class:demo-sidebar--open={isSidebarOpen}>
		{#if isLoading}
			<div class="demo-loading">
				<div class="demo-loading-spinner"></div>
				<p>Loading navigation...</p>
			</div>
		{:else if navigationError}
			<div class="demo-error">
				<h3>❌ {navigationError.message}</h3>
				<p>{navigationError.details}</p>
				<button onclick={loadNavigationData} class="demo-retry-button">Retry</button>
			</div>
		{:else if isValidNavigation && navigationData}
			<nav class="demo-navigation">
				<div class="demo-nav-stats">
					<p><strong>{navigationData.metadata.totalUnits}</strong> Units</p>
					<p><strong>{totalLessons}</strong> Lessons</p>
				</div>

				<div class="demo-nav-units">
					{#each navigationData.units as unit (unit.id)}
						<div class="demo-nav-unit">
							<button
								class="demo-nav-unit-header"
								class:demo-nav-unit-header--active={selectedUnit?.id === unit.id}
								onclick={() => navigateToUnit(unit)}
							>
								<span class="demo-nav-unit-icon">{unit.icon}</span>
								<div class="demo-nav-unit-info">
									<h3 class="demo-nav-unit-title">{unit.title}</h3>
									<div class="demo-nav-unit-meta">
										<span class={getDifficultyBadge(unit.difficulty)}>{unit.difficulty}</span>
										<span class="demo-nav-unit-duration">{unit.estimatedHours}h</span>
									</div>
								</div>
							</button>

							{#if selectedUnit?.id === unit.id}
								<div class="demo-nav-lessons">
									{#each unit.lessons as lesson (lesson.id)}
										<button
											class="demo-nav-lesson"
											class:demo-nav-lesson--active={selectedLesson?.id === lesson.id}
											onclick={() => navigateToLesson(lesson)}
										>
											<span class="demo-nav-lesson-icon">{lesson.icon}</span>
											<div class="demo-nav-lesson-info">
												<h4 class="demo-nav-lesson-title">{lesson.title}</h4>
												<div class="demo-nav-lesson-meta">
													<span class={getContentTypeBadge(lesson.contentType)}>
														{lesson.contentType}
													</span>
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

	<!-- Sidebar overlay for mobile -->
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

	<!-- Main content area -->
	<main class="demo-main">
		{#if isLoading}
			<div class="demo-content-loading">
				<div class="demo-loading-spinner"></div>
				<h2>Loading Demo Platform...</h2>
			</div>
		{:else if navigationError}
			<div class="demo-content-error">
				<h2>⚠️ Platform Error</h2>
				<p>{navigationError.message}</p>
				{#if navigationError.details}
					<details class="demo-error-details">
						<summary>Technical Details</summary>
						<pre>{navigationError.details}</pre>
					</details>
				{/if}
			</div>
		{:else if hasValidSelection && selectedUnit && selectedLesson}
			<!-- Selected lesson content -->
			<div class="demo-content-lesson">
				<header class="demo-lesson-header">
					<nav class="demo-breadcrumb">
						<button onclick={() => (window.location.hash = "#/demo")}>Demo</button>
						<span>/</span>
						<button onclick={() => navigateToUnit(selectedUnit!)}>{selectedUnit.title}</button>
						<span>/</span>
						<span>{selectedLesson.title}</span>
					</nav>

					<h1 class="demo-lesson-title">{selectedLesson.title}</h1>
					<p class="demo-lesson-description">{selectedLesson.description}</p>

					<div class="demo-lesson-meta">
						<span class={getContentTypeBadge(selectedLesson.contentType)}>
							{selectedLesson.contentType}
						</span>
						<span class={getDifficultyBadge(selectedLesson.difficulty)}>
							{selectedLesson.difficulty}
						</span>
						<span class="demo-lesson-duration">{selectedLesson.duration}</span>
					</div>
				</header>

				<div class="demo-lesson-content">
					<div class="demo-placeholder-content">
						<h3>📝 Lesson Content Placeholder</h3>
						<p>
							This is where the actual lesson content would be rendered based on the content type:
							<strong>{selectedLesson.contentType}</strong>
						</p>

						{#if selectedLesson.learningObjectives && selectedLesson.learningObjectives.length > 0}
							<div class="demo-learning-objectives">
								<h4>🎯 Learning Objectives</h4>
								<ul>
									{#each selectedLesson.learningObjectives as objective}
										<li>{objective}</li>
									{/each}
								</ul>
							</div>
						{/if}

						{#if selectedLesson.prerequisites && selectedLesson.prerequisites.length > 0}
							<div class="demo-prerequisites">
								<h4>📚 Prerequisites</h4>
								<ul>
									{#each selectedLesson.prerequisites as prerequisite}
										<li>{prerequisite}</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedUnit}
			<!-- Selected unit overview -->
			<div class="demo-content-unit">
				<header class="demo-unit-header">
					<nav class="demo-breadcrumb">
						<button onclick={() => (window.location.hash = "#/demo")}>Demo</button>
						<span>/</span>
						<span>{selectedUnit.title}</span>
					</nav>

					<h1 class="demo-unit-title">
						<span class="demo-unit-icon">{selectedUnit.icon}</span>
						{selectedUnit.title}
					</h1>
					<p class="demo-unit-description">{selectedUnit.description}</p>

					<div class="demo-unit-meta">
						<span class={getDifficultyBadge(selectedUnit.difficulty)}
							>{selectedUnit.difficulty}</span
						>
						<span class="demo-unit-duration">{selectedUnit.estimatedHours} hours</span>
						<span class="demo-unit-lessons-count">{selectedUnit.lessons.length} lessons</span>
					</div>
				</header>

				<div class="demo-unit-content">
					{#if selectedUnit.learningObjectives && selectedUnit.learningObjectives.length > 0}
						<section class="demo-unit-objectives">
							<h2>🎯 Learning Objectives</h2>
							<ul>
								{#each selectedUnit.learningObjectives as objective}
									<li>{objective}</li>
								{/each}
							</ul>
						</section>
					{/if}

					{#if selectedUnit.prerequisites && selectedUnit.prerequisites.length > 0}
						<section class="demo-unit-prerequisites">
							<h2>📚 Prerequisites</h2>
							<ul>
								{#each selectedUnit.prerequisites as prerequisite}
									<li>{prerequisite}</li>
								{/each}
							</ul>
						</section>
					{/if}

					<section class="demo-unit-lessons">
						<h2>📖 Lessons ({selectedUnit.lessons.length})</h2>
						<div class="demo-lessons-grid">
							{#each selectedUnit.lessons as lesson (lesson.id)}
								<button class="demo-lesson-card" onclick={() => navigateToLesson(lesson)}>
									<div class="demo-lesson-card-header">
										<span class="demo-lesson-card-icon">{lesson.icon}</span>
										<div class="demo-lesson-card-meta">
											<span class={getContentTypeBadge(lesson.contentType)}>
												{lesson.contentType}
											</span>
											<span class="demo-lesson-card-duration">{lesson.duration}</span>
										</div>
									</div>
									<h3 class="demo-lesson-card-title">{lesson.title}</h3>
									<p class="demo-lesson-card-description">{lesson.description}</p>
								</button>
							{/each}
						</div>
					</section>
				</div>
			</div>
		{:else}
			<!-- Demo overview/dashboard -->
			<div class="demo-content-overview">
				<header class="demo-overview-header">
					<h1 class="demo-overview-title">
						🚀 {navigationData?.metadata.title || "Demo Platform"}
					</h1>
					<p class="demo-overview-description">
						{navigationData?.metadata.description ||
							"Interactive demo showcasing cloud-native learning platform navigation and content structure."}
					</p>
				</header>

				<div class="demo-overview-stats">
					<div class="demo-stat-card">
						<h3>{navigationData?.metadata.totalUnits || 0}</h3>
						<p>Learning Units</p>
					</div>
					<div class="demo-stat-card">
						<h3>{totalLessons}</h3>
						<p>Total Lessons</p>
					</div>
					<div class="demo-stat-card">
						<h3>
							{Object.values(contentTypeDistribution).reduce((a: number, b: number) => a + b, 0)}
						</h3>
						<p>Content Items</p>
					</div>
				</div>

				<section class="demo-overview-content-types">
					<h2>📊 Content Distribution</h2>
					<div class="demo-content-type-stats">
						<div class="demo-content-type-item">
							<span class={getContentTypeBadge(DemoContentType.CODE)}>Code</span>
							<span class="demo-content-type-count">{contentTypeDistribution.code} lessons</span>
						</div>
						<div class="demo-content-type-item">
							<span class={getContentTypeBadge(DemoContentType.INTERACTIVE)}>Interactive</span>
							<span class="demo-content-type-count">
								{contentTypeDistribution.interactive} lessons
							</span>
						</div>
						<div class="demo-content-type-item">
							<span class={getContentTypeBadge(DemoContentType.DIAGRAM)}>Diagrams</span>
							<span class="demo-content-type-count">{contentTypeDistribution.diagram} lessons</span>
						</div>
						<div class="demo-content-type-item">
							<span class={getContentTypeBadge(DemoContentType.TEXT)}>Text</span>
							<span class="demo-content-type-count">{contentTypeDistribution.text} lessons</span>
						</div>
						<div class="demo-content-type-item">
							<span class={getContentTypeBadge(DemoContentType.MIXED)}>Mixed</span>
							<span class="demo-content-type-count">{contentTypeDistribution.mixed} lessons</span>
						</div>
					</div>
				</section>

				{#if isValidNavigation && navigationData}
					<section class="demo-overview-units">
						<h2>📚 Available Units</h2>
						<div class="demo-units-grid">
							{#each navigationData.units as unit (unit.id)}
								<button class="demo-unit-card" onclick={() => navigateToUnit(unit)}>
									<div class="demo-unit-card-header">
										<span class="demo-unit-card-icon">{unit.icon}</span>
										<span class={getDifficultyBadge(unit.difficulty)}>{unit.difficulty}</span>
									</div>
									<h3 class="demo-unit-card-title">{unit.title}</h3>
									<p class="demo-unit-card-description">{unit.description}</p>
									<div class="demo-unit-card-meta">
										<span class="demo-unit-card-duration">{unit.estimatedHours}h</span>
										<span class="demo-unit-card-lessons">{unit.lessons.length} lessons</span>
									</div>
								</button>
							{/each}
						</div>
					</section>
				{/if}
			</div>
		{/if}
	</main>
</div>

<style>
	/* Demo-specific CSS classes with mobile-first approach */

	/* Layout foundation */
	.demo-layout {
		min-height: 100vh;
		display: grid;
		grid-template-areas:
			"header"
			"main";
		grid-template-rows: auto 1fr;
		background: var(--bg-primary, #ffffff);
		color: var(--text-primary, #1a1a1a);
	}

	/* Mobile header */
	.demo-header {
		grid-area: header;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--bg-secondary, #f8f9fa);
		border-bottom: 1px solid var(--border-color, #e1e5e9);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.demo-header-title {
		font-size: clamp(1.2rem, 3vw, 1.5rem);
		font-weight: 600;
		margin: 0;
		color: var(--text-primary, #1a1a1a);
	}

	/* Hamburger menu */
	.demo-sidebar-toggle {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 44px;
		height: 44px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 8px;
		border-radius: 6px;
		transition: background-color 0.2s ease;
	}

	.demo-sidebar-toggle:hover {
		background: var(--bg-hover, #e9ecef);
	}

	.demo-hamburger {
		position: relative;
		width: 24px;
		height: 2px;
		background: var(--text-primary, #1a1a1a);
		transition: all 0.3s ease;
	}

	.demo-hamburger::before,
	.demo-hamburger::after {
		content: "";
		position: absolute;
		width: 24px;
		height: 2px;
		background: var(--text-primary, #1a1a1a);
		transition: all 0.3s ease;
	}

	.demo-hamburger::before {
		top: -8px;
	}

	.demo-hamburger::after {
		bottom: -8px;
	}

	.demo-hamburger--active {
		background: transparent;
	}

	.demo-hamburger--active::before {
		top: 0;
		transform: rotate(45deg);
	}

	.demo-hamburger--active::after {
		bottom: 0;
		transform: rotate(-45deg);
	}

	/* Sidebar */
	.demo-sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: 280px;
		height: 100vh;
		background: var(--bg-primary, #ffffff);
		border-right: 1px solid var(--border-color, #e1e5e9);
		transform: translateX(-100%);
		transition: transform 0.3s ease;
		overflow-y: auto;
		z-index: 200;
		padding-top: 80px; /* Account for header height */
	}

	.demo-sidebar--open {
		transform: translateX(0);
	}

	.demo-sidebar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: 150;
	}

	/* Navigation */
	.demo-navigation {
		padding: 1rem;
	}

	.demo-nav-stats {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--bg-secondary, #f8f9fa);
		border-radius: 8px;
	}

	.demo-nav-stats p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary, #6c757d);
	}

	.demo-nav-unit {
		margin-bottom: 0.5rem;
	}

	.demo-nav-unit-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: transparent;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s ease;
	}

	.demo-nav-unit-header:hover,
	.demo-nav-unit-header--active {
		background: var(--bg-accent, #e3f2fd);
	}

	.demo-nav-unit-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.demo-nav-unit-title {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: var(--text-primary, #1a1a1a);
	}

	.demo-nav-unit-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.demo-nav-unit-duration {
		font-size: 0.75rem;
		color: var(--text-secondary, #6c757d);
	}

	.demo-nav-lessons {
		margin-left: 1rem;
		border-left: 2px solid var(--border-color, #e1e5e9);
		padding-left: 1rem;
	}

	.demo-nav-lesson {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		margin-bottom: 0.25rem;
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s ease;
	}

	.demo-nav-lesson:hover,
	.demo-nav-lesson--active {
		background: var(--bg-hover, #e9ecef);
	}

	.demo-nav-lesson-icon {
		font-size: 1rem;
		flex-shrink: 0;
	}

	.demo-nav-lesson-title {
		font-size: 0.8rem;
		font-weight: 500;
		margin: 0 0 0.25rem 0;
		color: var(--text-primary, #1a1a1a);
	}

	.demo-nav-lesson-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.demo-nav-lesson-duration {
		font-size: 0.7rem;
		color: var(--text-secondary, #6c757d);
	}

	/* Main content */
	.demo-main {
		grid-area: main;
		padding: 1rem;
		overflow-y: auto;
	}

	/* Loading states */
	.demo-loading,
	.demo-content-loading {
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
		border: 3px solid var(--border-color, #e1e5e9);
		border-top: 3px solid var(--accent-primary, #007bff);
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

	/* Error states */
	.demo-error,
	.demo-content-error {
		padding: 1.5rem;
		background: var(--error-bg, #f8d7da);
		border: 1px solid var(--error-border, #f5c6cb);
		border-radius: 8px;
		color: var(--error-text, #721c24);
	}

	.demo-retry-button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background: var(--accent-primary, #007bff);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.demo-error-details {
		margin-top: 1rem;
	}

	.demo-error-details pre {
		background: rgba(0, 0, 0, 0.1);
		padding: 0.5rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.75rem;
	}

	/* Breadcrumb */
	.demo-breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.demo-breadcrumb button {
		background: transparent;
		border: none;
		color: var(--link-color, #007bff);
		cursor: pointer;
		text-decoration: underline;
	}

	.demo-breadcrumb span {
		color: var(--text-secondary, #6c757d);
	}

	/* Content headers */
	.demo-lesson-header,
	.demo-unit-header,
	.demo-overview-header {
		margin-bottom: 2rem;
	}

	.demo-lesson-title,
	.demo-unit-title,
	.demo-overview-title {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary, #1a1a1a);
	}

	.demo-lesson-description,
	.demo-unit-description,
	.demo-overview-description {
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--text-secondary, #6c757d);
		margin: 0 0 1rem 0;
	}

	.demo-lesson-meta,
	.demo-unit-meta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: center;
	}

	/* Badges */
	.demo-content-badge,
	.demo-difficulty-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.demo-content-badge--code {
		background: var(--code-bg, #e8f4fd);
		color: var(--code-text, #0366d6);
	}

	.demo-content-badge--interactive {
		background: var(--interactive-bg, #f0f8e8);
		color: var(--interactive-text, #28a745);
	}

	.demo-content-badge--diagram {
		background: var(--diagram-bg, #fff3cd);
		color: var(--diagram-text, #856404);
	}

	.demo-content-badge--text {
		background: var(--text-bg, #f8f9fa);
		color: var(--text-text, #6c757d);
	}

	.demo-content-badge--mixed {
		background: var(--mixed-bg, #e2e3e5);
		color: var(--mixed-text, #383d41);
	}

	.demo-difficulty-badge--beginner {
		background: var(--beginner-bg, #d4edda);
		color: var(--beginner-text, #155724);
	}

	.demo-difficulty-badge--intermediate {
		background: var(--intermediate-bg, #fff3cd);
		color: var(--intermediate-text, #856404);
	}

	.demo-difficulty-badge--advanced {
		background: var(--advanced-bg, #f8d7da);
		color: var(--advanced-text, #721c24);
	}

	/* Stats and grids */
	.demo-overview-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.demo-stat-card {
		padding: 1.5rem;
		background: var(--bg-secondary, #f8f9fa);
		border-radius: 8px;
		text-align: center;
	}

	.demo-stat-card h3 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--accent-primary, #007bff);
	}

	.demo-stat-card p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary, #6c757d);
	}

	.demo-content-type-stats {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.demo-content-type-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: var(--bg-secondary, #f8f9fa);
		border-radius: 6px;
	}

	.demo-content-type-count {
		font-weight: 600;
		color: var(--text-primary, #1a1a1a);
	}

	.demo-units-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.demo-lessons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
	}

	/* Cards */
	.demo-unit-card,
	.demo-lesson-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.5rem;
		background: var(--bg-primary, #ffffff);
		border: 1px solid var(--border-color, #e1e5e9);
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s ease;
	}

	.demo-unit-card:hover,
	.demo-lesson-card:hover {
		border-color: var(--accent-primary, #007bff);
		box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
		transform: translateY(-1px);
	}

	.demo-unit-card-header,
	.demo-lesson-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.demo-unit-card-icon,
	.demo-lesson-card-icon {
		font-size: 1.5rem;
	}

	.demo-unit-card-title,
	.demo-lesson-card-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary, #1a1a1a);
	}

	.demo-unit-card-description,
	.demo-lesson-card-description {
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--text-secondary, #6c757d);
		margin: 0;
	}

	.demo-unit-card-meta,
	.demo-lesson-card-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.8rem;
		color: var(--text-secondary, #6c757d);
	}

	/* Placeholder content */
	.demo-placeholder-content {
		padding: 2rem;
		background: var(--bg-secondary, #f8f9fa);
		border-radius: 8px;
		text-align: center;
	}

	.demo-learning-objectives,
	.demo-prerequisites,
	.demo-unit-objectives,
	.demo-unit-prerequisites {
		margin-top: 2rem;
		padding: 1.5rem;
		background: var(--bg-secondary, #f8f9fa);
		border-radius: 8px;
	}

	.demo-learning-objectives h4,
	.demo-prerequisites h4,
	.demo-unit-objectives h2,
	.demo-unit-prerequisites h2 {
		margin: 0 0 1rem 0;
		color: var(--text-primary, #1a1a1a);
	}

	.demo-learning-objectives ul,
	.demo-prerequisites ul,
	.demo-unit-objectives ul,
	.demo-unit-prerequisites ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.demo-learning-objectives li,
	.demo-prerequisites li,
	.demo-unit-objectives li,
	.demo-unit-prerequisites li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
	}

	/* Desktop styles */
	@media (min-width: 769px) {
		.demo-layout {
			grid-template-areas: "sidebar main";
			grid-template-columns: 280px 1fr;
		}

		.demo-header {
			display: none;
		}

		.demo-sidebar {
			position: static;
			transform: none;
			padding-top: 1rem;
			grid-area: sidebar;
		}

		.demo-sidebar-overlay {
			display: none;
		}

		.demo-main {
			padding: 2rem;
		}

		.demo-content-type-stats {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}
	}

	/* Large desktop styles */
	@media (min-width: 1200px) {
		.demo-layout {
			grid-template-columns: 320px 1fr;
		}

		.demo-main {
			padding: 3rem;
			max-width: 1200px;
		}

		.demo-units-grid {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		}
	}
</style>
