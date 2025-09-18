<script lang="ts">
	import { ChevronRight, ChevronDown, CheckCircle2, Circle, Clock, RotateCcw } from "lucide-svelte";
	import {
		ContentTypeBadge,
		DifficultyBadge,
		ProgressBar,
		LoadingSpinner,
		ErrorState
	} from "$lib/components/demo";
	import {
		type DemoNavigationStructure,
		type DemoUnit,
		type DemoLesson,
		totalLessons
	} from "../../../data/demo/navigation/demo-sidebar-menu.js";
	import {
		progressStore,
		visitUnit,
		completeLesson,
		calculateProgressStats,
		clearProgress,
		isLessonCompleted
	} from "../../stores/progress.js";

	// Props interface for type safety
	interface Props {
		navigationData: DemoNavigationStructure;
		selectedUnit?: DemoUnit | null;
		selectedLesson?: DemoLesson | null;
		expandedUnitId?: string | null;
		isLoading?: boolean;
		error?: { type: string; message: string; details?: string } | null;
		onUnitSelect?: (unit: DemoUnit) => void;
		onLessonSelect?: (lesson: DemoLesson) => void;
		onUnitToggle?: (unitId: string) => void;
		onRetry?: () => void;
	}

	let {
		navigationData,
		selectedUnit = null,
		selectedLesson = null,
		expandedUnitId = null,
		isLoading = false,
		error = null,
		onUnitSelect,
		onLessonSelect,
		onUnitToggle,
		onRetry
	}: Props = $props();

	// Progress tracking
	const progress = $derived($progressStore);
	const progressStats = $derived(() =>
		calculateProgressStats(navigationData.metadata.totalUnits, totalLessons, progress)
	);

	// Show/hide reset dialog
	let showResetDialog = $state(false);
	let resetPopoverElement = $state<HTMLElement | undefined>(undefined);

	/**
	 * Handle clearing progress data
	 */
	function handleClearProgress(): void {
		clearProgress();
		showResetDialog = false;
	}

	/**
	 * Handle click outside popover to close it
	 */
	function handleClickOutside(event: MouseEvent): void {
		if (showResetDialog && resetPopoverElement && event.target) {
			const target = event.target as Node;
			const resetButton = document.querySelector(".demo-reset-btn");

			// Don't close if clicking on the reset button or inside the popover
			if (!resetPopoverElement.contains(target) && !resetButton?.contains(target)) {
				showResetDialog = false;
			}
		}
	}

	// Add click outside listener with delay to avoid immediate closing
	$effect(() => {
		if (typeof window !== "undefined") {
			if (showResetDialog) {
				// Add small delay to prevent immediate closing on button click
				setTimeout(() => {
					document.addEventListener("click", handleClickOutside);
				}, 100);
			} else {
				document.removeEventListener("click", handleClickOutside);
			}
			return () => {
				document.removeEventListener("click", handleClickOutside);
			};
		}
	});

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
		// Get current progress state
		const currentProgress = progress;

		// Check if lesson is currently selected
		if (selectedUnit?.id === unit.id && lesson.id === selectedLesson?.id) {
			return { icon: Clock, state: "current", className: "demo-lesson-status--current" };
		}

		// Check if lesson has been completed (from localStorage)
		if (isLessonCompleted(lesson.id, currentProgress)) {
			return { icon: CheckCircle2, state: "completed", className: "demo-lesson-status--completed" };
		}

		// Default to pending
		return { icon: Circle, state: "pending", className: "demo-lesson-status--pending" };
	}

	/**
	 * Comprehensive scroll to top function
	 */
	function scrollToTop(): void {
		if (typeof window === "undefined") return;

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

	/**
	 * Handle unit header click - can either select unit or toggle expansion
	 */
	function handleUnitClick(unit: DemoUnit): void {
		// First toggle expansion
		if (onUnitToggle) {
			onUnitToggle(unit.id);
		}

		// Then notify parent of unit selection
		if (onUnitSelect) {
			onUnitSelect(unit);
		}

		// Track unit visit
		visitUnit(unit.id);

		// Scroll to top when unit is selected
		scrollToTop();
	}

	/**
	 * Handle lesson selection
	 */
	function handleLessonClick(lesson: DemoLesson): void {
		if (onLessonSelect) {
			onLessonSelect(lesson);
		}

		// Find the unit that contains this lesson and track progress
		for (const unit of navigationData.units) {
			if (unit.lessons.some((l) => l.id === lesson.id)) {
				completeLesson(unit.id, lesson.id);
				break;
			}
		}

		// Scroll to top when lesson is selected
		scrollToTop();
	}

	const isValidNavigation = $derived(() => {
		return navigationData && navigationData.units && navigationData.units.length > 0;
	});
</script>

<!-- Modularized Demo Sidebar Navigation -->
<aside class="demo-sidebar-container">
	{#if isLoading}
		<div class="demo-sidebar-loading">
			<LoadingSpinner size="md" message="Loading navigation..." centered={true} />
		</div>
	{:else if error}
		<div class="demo-sidebar-error">
			<ErrorState
				title={error.message}
				message={error.details}
				{onRetry}
				retryText="Retry"
				variant="error"
				centered={true}
			/>
		</div>
	{:else if isValidNavigation()}
		<nav class="demo-sidebar-nav">
			<!-- Progress & Stats Container -->
			<div class="demo-progress-container">
				<!-- Progress Bar -->
				<div class="demo-progress-section">
					<div class="demo-progress-header">
						<span class="demo-progress-label">Overall Progress</span>
						<div class="demo-progress-actions">
							<span class="demo-progress-percentage">{progressStats().progressPercentage}%</span>
							<div class="demo-reset-container">
								<button
									class="demo-reset-btn"
									onclick={(event) => {
										// CRITICAL: Prevent event bubbling to avoid closing the sidebar
										// when the reset button is clicked. Without this, clicking the reset
										// button would trigger the sidebar's close handler.
										event.stopPropagation();
										showResetDialog = !showResetDialog;
									}}
									aria-label="Reset progress"
									title="Reset progress"
								>
									<RotateCcw size={12} />
								</button>
								{#if showResetDialog}
									<!-- Debug: This should be visible -->
									<div
										bind:this={resetPopoverElement}
										class="demo-reset-popover"
										role="dialog"
										aria-modal="true"
										aria-labelledby="reset-title"
										tabindex="-1"
										onclick={(event) => {
											// CRITICAL: Prevent clicks inside the popover from closing it
											// or triggering sidebar close. This keeps the dialog open when
											// users interact with its content.
											event.stopPropagation();
										}}
										onkeydown={(e) => {
											if (e.key === "Escape") {
												showResetDialog = false;
											}
										}}
									>
										<div class="demo-reset-content">
											<div class="demo-reset-header">
												<h3 id="reset-title" class="demo-reset-title">Reset Progress</h3>
											</div>
											<div class="demo-reset-message">
												This will clear all visited units and completed lessons. This action cannot
												be undone.
											</div>
											<div class="demo-reset-actions">
												<button class="demo-reset-cancel" onclick={() => (showResetDialog = false)}>
													Cancel
												</button>
												<button class="demo-reset-confirm" onclick={handleClearProgress}>
													Clear All
												</button>
											</div>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
					<div class="demo-progress-bar">
						<div
							class="demo-progress-fill"
							style="width: {progressStats().progressPercentage}%"
						></div>
					</div>
				</div>

				<!-- Compact Stats -->
				<div class="demo-nav-stats-compact">
					<div class="demo-stat-item-compact">
						<span class="demo-stat-value"
							>{progressStats().visitedUnits}/{navigationData.metadata.totalUnits}</span
						>
						<span class="demo-stat-label">Units</span>
					</div>
					<div class="demo-stat-separator">•</div>
					<div class="demo-stat-item-compact">
						<span class="demo-stat-value">{progressStats().completedLessons}/{totalLessons}</span>
						<span class="demo-stat-label">Lessons</span>
					</div>
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
							onclick={() => handleUnitClick(unit)}
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
										value={unit.lessons.filter((l) => isLessonCompleted(l.id, progress)).length}
										max={unit.lessons.length}
										size="sm"
										variant="primary"
										showLabel={true}
										label={`${unit.lessons.filter((l) => isLessonCompleted(l.id, progress)).length}/${unit.lessons.length}`}
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
										onclick={() => handleLessonClick(lesson)}
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

<style>
	/* Sidebar Container */
	.demo-sidebar-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: hsl(var(--sidebar, 60 9.1% 97.8%));
	}

	/* Loading & Error States */
	.demo-sidebar-loading,
	.demo-sidebar-error {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 2rem;
	}

	/* Navigation Container */
	.demo-sidebar-nav {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
	}

	/* Sidebar Header */
	.demo-sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid hsl(var(--sidebar-border, 220 13% 91%));
		background: hsl(var(--sidebar-accent, 60 4.8% 95.9%));
		flex-shrink: 0;
	}

	.demo-sidebar-brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.demo-sidebar-title {
		font-size: 1.125rem;
		font-weight: 700;
		margin: 0;
		color: hsl(var(--sidebar-primary, 222.2 84% 4.9%));
		line-height: 1.2;
	}

	.demo-sidebar-description {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
		margin: 0;
		line-height: 1.4;
	}

	/* Progress & Stats Container */
	.demo-progress-container {
		padding: 1rem 1.5rem;
		background: linear-gradient(
			135deg,
			hsl(var(--sidebar-accent, 60 4.8% 95.9%) / 0.6),
			hsl(var(--sidebar-accent, 60 4.8% 95.9%) / 0.3)
		);
		border-bottom: 1px solid hsl(var(--sidebar-border, 220 13% 91%));
		border-top: 1px solid hsl(var(--sidebar-border, 220 13% 91%));
		flex-shrink: 0;
		backdrop-filter: blur(10px);
	}

	/* Progress Section */
	.demo-progress-section {
		margin-bottom: 1rem;
	}

	.demo-progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.demo-progress-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: hsl(var(--sidebar-primary, 222.2 84% 4.9%));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.demo-progress-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.demo-progress-percentage {
		font-size: 0.875rem;
		font-weight: 700;
		color: hsl(var(--primary, 221.2 83.2% 53.3%));
	}

	.demo-reset-container {
		position: relative;
	}

	/* Reset button styling */
	.demo-reset-btn {
		background: transparent;
		border: 1px solid hsl(var(--sidebar-border, 220 13% 91%));
		border-radius: 4px;
		padding: 0.25rem;
		cursor: pointer;
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.demo-reset-btn:hover {
		background: hsl(var(--sidebar-accent, 60 4.8% 95.9%));
		color: hsl(var(--sidebar-primary, 222.2 84% 4.9%));
	}

	/* Reset Popover - positioned near button */
	.demo-reset-popover {
		position: absolute;
		top: 2.5rem;
		right: 0;
		z-index: 99999; /* Increased to ensure it's above all lesson icons */
		animation: slideIn 0.2s ease-out;
		/* Create new stacking context to override opacity elements */
		transform: translateZ(0);
		isolation: isolate;
	}

	.demo-reset-content {
		background: white !important;
		border: 2px solid #333 !important;
		border-radius: 8px !important;
		padding: 1rem !important;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
		width: 280px !important;
		max-width: 90vw !important;
		opacity: 1 !important;
		backdrop-filter: none !important;
	}

	.demo-reset-header {
		margin-bottom: 0.75rem;
	}

	.demo-reset-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--foreground, 222.2 84% 4.9%));
		margin: 0;
	}

	.demo-reset-message {
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
		font-size: 0.75rem;
		line-height: 1.4;
		margin-bottom: 1rem;
	}

	.demo-reset-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	/* Dark mode support */
	:global(.dark) .demo-reset-content {
		background: hsl(222.2 84% 4.9%) !important;
		border-color: hsl(214.3 31.8% 25%) !important;
		opacity: 1 !important;
	}

	:global(.dark) .demo-reset-title {
		color: hsl(210 40% 98%);
	}

	:global(.dark) .demo-reset-message {
		color: hsl(215.4 16.3% 65%);
	}

	/* Animation */
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.demo-reset-popover {
			right: 1rem;
			top: 2.5rem;
			position: absolute;
			left: auto;
		}

		.demo-reset-content {
			width: 240px !important;
			max-width: calc(100vw - 3rem) !important;
			margin: 0 !important;
		}
	}

	.demo-reset-confirm {
		background: hsl(var(--destructive, 0 84.2% 60.2%));
		color: hsl(var(--destructive-foreground, 210 40% 98%));
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		border: none;
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.demo-reset-confirm:hover {
		background: hsl(var(--destructive, 0 84.2% 55%));
	}

	.demo-reset-cancel {
		background: hsl(var(--secondary, 210 40% 96%));
		color: hsl(var(--secondary-foreground, 222.2 84% 4.9%));
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--border, 214.3 31.8% 91.4%));
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.demo-reset-cancel:hover {
		background: hsl(var(--secondary, 210 40% 92%));
	}

	.demo-progress-bar {
		width: 100%;
		height: 6px;
		background: hsl(var(--sidebar-border, 220 13% 91%));
		border-radius: 3px;
		overflow: hidden;
	}

	.demo-progress-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			hsl(var(--primary, 221.2 83.2% 53.3%)),
			hsl(var(--primary, 221.2 83.2% 53.3%) / 0.8)
		);
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	/* Compact Stats */
	.demo-nav-stats-compact {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.demo-stat-item-compact {
		text-align: center;
	}

	.demo-stat-value {
		display: block;
		font-size: 0.875rem;
		font-weight: 700;
		color: hsl(var(--sidebar-primary, 222.2 84% 4.9%));
		line-height: 1;
	}

	.demo-stat-label {
		display: block;
		font-size: 0.625rem;
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.25rem;
	}

	.demo-stat-separator {
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
		font-size: 0.75rem;
	}

	/* Units Navigation */
	.demo-nav-units {
		padding: 1rem;
		flex: 1;
		overflow-y: auto;
	}

	.demo-nav-unit {
		margin-bottom: 0.5rem;
	}

	.demo-nav-unit-header {
		width: 100%;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem;
		background: transparent;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s ease;
		color: hsl(var(--sidebar-foreground, 222.2 84% 4.9%));
	}

	.demo-nav-unit-header:hover {
		background: hsl(var(--sidebar-accent, 60 4.8% 95.9%) / 0.5);
		margin-left: 2px;
	}

	.demo-nav-unit-header--active {
		background: hsl(var(--sidebar-primary, 222.2 84% 4.9%) / 0.1);
		border-left: 4px solid hsl(var(--sidebar-primary, 222.2 84% 4.9%));
		color: hsl(var(--sidebar-primary, 222.2 84% 4.9%));
		margin-left: 4px;
	}

	.demo-nav-unit-header--expanded {
		background: hsl(var(--sidebar-accent, 60 4.8% 95.9%));
	}

	.demo-nav-unit-header--active.demo-nav-unit-header--expanded {
		background: hsl(var(--sidebar-primary, 222.2 84% 4.9%) / 0.15);
	}

	.demo-nav-unit-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.demo-nav-unit-info {
		flex: 1;
		min-width: 0;
	}

	.demo-nav-unit-title {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: inherit;
		line-height: 1.3;
	}

	.demo-nav-unit-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
	}

	.demo-nav-unit-duration,
	.demo-nav-unit-count {
		font-size: 0.7rem;
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.demo-nav-unit-progress {
		margin-top: 0.5rem;
	}

	.demo-nav-unit-toggle {
		flex-shrink: 0;
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
		margin-top: 0.125rem;
	}

	/* Lesson Navigation */
	.demo-nav-lessons {
		margin-left: 2.25rem;
		border-left: 2px solid hsl(var(--sidebar-border, 220 13% 91%));
		padding-left: 1rem;
		margin-bottom: 1rem;
		margin-top: 0.5rem;
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
		transition: all 0.2s ease;
		color: hsl(var(--sidebar-foreground, 222.2 84% 4.9%));
	}

	.demo-nav-lesson:hover {
		background: hsl(var(--sidebar-accent, 60 4.8% 95.9%) / 0.5);
		margin-left: 2px;
	}

	.demo-nav-lesson--active {
		background: hsl(var(--sidebar-primary, 222.2 84% 4.9%) / 0.1);
		border-left: 3px solid hsl(var(--sidebar-primary, 222.2 84% 4.9%));
		margin-left: 4px;
		color: hsl(var(--sidebar-primary, 222.2 84% 4.9%));
	}

	/* Completed lesson styles */
	.demo-nav-lesson.demo-lesson-status--completed {
		background: linear-gradient(
			90deg,
			hsl(142.1 76.2% 36.3% / 0.08),
			hsl(142.1 76.2% 36.3% / 0.04)
		);
		border-left: 3px solid hsl(var(--success, 142.1 76.2% 36.3%));
	}

	.demo-nav-lesson.demo-lesson-status--completed:hover {
		background: linear-gradient(
			90deg,
			hsl(142.1 76.2% 36.3% / 0.12),
			hsl(142.1 76.2% 36.3% / 0.08)
		);
		margin-left: 2px;
	}

	.demo-nav-lesson.demo-lesson-status--completed .demo-nav-lesson-title {
		color: hsl(var(--success, 142.1 76.2% 36.3%));
		font-weight: 600;
	}

	.demo-nav-lesson-status {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		/* Using rgba instead of opacity to avoid stacking context issues */
		color: rgba(0, 0, 0, 0.7);
	}

	.demo-lesson-status--current {
		color: hsl(var(--warning, 38 92% 50%));
	}

	.demo-lesson-status--completed {
		color: hsl(var(--success, 142.1 76.2% 36.3%));
		font-weight: 600;
	}

	.demo-lesson-status--pending {
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
	}

	.demo-nav-lesson-icon {
		font-size: 1rem;
		flex-shrink: 0;
		/* Using rgba instead of opacity to avoid stacking context issues */
		color: rgba(0, 0, 0, 0.8);
	}

	.demo-nav-lesson-info {
		flex: 1;
		min-width: 0;
	}

	.demo-nav-lesson-title {
		font-size: 0.8rem;
		font-weight: 500;
		margin: 0 0 0.25rem 0;
		color: hsl(var(--sidebar-foreground, 222.2 84% 4.9%));
		line-height: 1.3;
	}

	.demo-nav-lesson--active .demo-nav-lesson-title {
		font-weight: 700;
		color: hsl(var(--sidebar-primary, 222.2 84% 4.9%));
	}

	.demo-nav-lesson-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.demo-nav-lesson-duration {
		font-size: 0.7rem;
		color: hsl(var(--muted-foreground, 215.4 16.3% 46.9%));
	}

	/* Scrollbar Styling */
	.demo-sidebar-nav::-webkit-scrollbar,
	.demo-nav-units::-webkit-scrollbar {
		width: 6px;
	}

	.demo-sidebar-nav::-webkit-scrollbar-track,
	.demo-nav-units::-webkit-scrollbar-track {
		background: transparent;
	}

	.demo-sidebar-nav::-webkit-scrollbar-thumb,
	.demo-nav-units::-webkit-scrollbar-thumb {
		background: hsl(var(--muted-foreground, 215.4 16.3% 46.9%) / 0.3);
		border-radius: 3px;
	}

	.demo-sidebar-nav::-webkit-scrollbar-thumb:hover,
	.demo-nav-units::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground, 215.4 16.3% 46.9%) / 0.5);
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.demo-nav-stats {
			flex-direction: column;
			gap: 0.5rem;
		}

		.demo-nav-unit-header {
			padding: 0.75rem;
		}

		.demo-nav-unit-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.demo-nav-lesson {
			padding: 0.5rem;
		}

		.demo-nav-lessons {
			margin-left: 1.5rem;
			padding-left: 0.75rem;
		}
	}
</style>
