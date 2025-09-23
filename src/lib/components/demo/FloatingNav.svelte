<!--
FloatingNav.svelte - Floating Navigation Component

This component provides persistent Previous/Next navigation buttons that float
at the bottom of the screen. It integrates with the global navigation store
to provide seamless lesson-to-lesson navigation.

Features:
- Semi-transparent background with blur effect
- Previous/Next buttons with proper disabled states
- Progress indicator showing current lesson
- Mobile-optimized touch targets (44px minimum)
- Smooth transitions and hover effects
- Z-index management to stay above content
- Responsive design for mobile/tablet/desktop

Architecture:
- Subscribes to navigationStore for reactive state
- Uses shadcn-svelte Button components for consistency
- Integrates with SvelteKit's goto() for navigation
- Provides visual feedback for current progress
-->

<script lang="ts">
	import { Button } from "$ui/button";
	import { ChevronLeft, ChevronRight } from "lucide-svelte";
	import { unifiedNavigation } from "$lib/stores/unified-navigation.js";
	import { browser } from "$app/environment";

	// Subscribe to unified navigation store for reactive state
	const navigation = unifiedNavigation;

	// State for tracking which button is being hovered
	let hoveredButton = $state<"previous" | "next" | null>(null);

	/**
	 * Get current navigation state - no filtering needed as unified navigation handles this
	 */
	const navigationState = $derived(() => $navigation);

	/**
	 * Navigate to previous lesson using unified navigation
	 */
	async function goToPrevious(): Promise<void> {
		if (!browser) return;
		await navigation.navigateToPrevious();
	}

	/**
	 * Navigate to next lesson using unified navigation
	 */
	async function goToNext(): Promise<void> {
		if (!browser) return;
		await navigation.navigateToNext();
	}

	/**
	 * Handle keyboard shortcuts for navigation
	 */
	function handleKeydown(event: KeyboardEvent): void {
		// Only handle shortcuts when FloatingNav is visible (i.e., on a lesson page)
		if (navigationState().currentLesson) {
			if (event.key === "ArrowLeft" && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				goToPrevious();
			} else if (event.key === "ArrowRight" && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				goToNext();
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Only show floating navigation when we're on a lesson page -->
{#if navigationState().currentLesson}
	<nav class="floating-nav" aria-label="Lesson navigation">
		<div class="floating-nav-container">
			<!-- Previous Button -->
			<Button
				variant="outline"
				size="default"
				disabled={!navigationState().canNavigatePrevious}
				onclick={goToPrevious}
				class="floating-nav-button floating-nav-button--previous"
				aria-label={navigationState().canNavigatePrevious
					? "Go to previous lesson"
					: "No previous lesson"}
				title={navigationState().canNavigatePrevious
					? "Previous lesson (Ctrl + ←)"
					: "No previous lesson"}
				onmouseenter={() => (hoveredButton = "previous")}
				onmouseleave={() => (hoveredButton = null)}
			>
				<ChevronLeft size={16} />
				<span class="floating-nav-text">Previous</span>
			</Button>

			<!-- Progress Indicator -->
			<div class="floating-nav-progress" aria-live="polite">
				<span class="floating-nav-progress-text">
					{(navigationState().currentLessonIndex ?? -1) + 1}
					of {navigationState().totalLessons}
				</span>
				<div class="floating-nav-progress-bar">
					<div
						class="floating-nav-progress-fill"
						style:width="{navigationState().completionPercentage}%"
						aria-label="Progress: {navigationState().completionPercentage}% complete"
					></div>
				</div>
			</div>

			<!-- Next Button -->
			<Button
				variant="outline"
				size="default"
				disabled={!navigationState().canNavigateNext}
				onclick={goToNext}
				class="floating-nav-button floating-nav-button--next"
				aria-label={navigationState().canNavigateNext ? "Go to next lesson" : "No next lesson"}
				title={navigationState().canNavigateNext ? "Next lesson (Ctrl + →)" : "No next lesson"}
				onmouseenter={() => (hoveredButton = "next")}
				onmouseleave={() => (hoveredButton = null)}
			>
				<span class="floating-nav-text">Next</span>
				<ChevronRight size={16} />
			</Button>
		</div>

		<!-- Dynamic navigation tooltip -->
		{#if hoveredButton === "previous" && navigationState().previousLesson}
			<div class="floating-nav-tooltip" role="tooltip">
				<div class="floating-nav-lesson-info">
					<span class="floating-nav-lesson-direction">← Previous</span>
					<span class="floating-nav-lesson-title">{navigationState().previousLesson?.title}</span>
					<span class="floating-nav-lesson-unit">
						{navigationState().previousLesson?.isUnitOverview
							? "Unit Overview"
							: navigationState().previousLesson?.unitTitle}
					</span>
				</div>
			</div>
		{:else if hoveredButton === "next" && navigationState().nextLesson}
			<div class="floating-nav-tooltip" role="tooltip">
				<div class="floating-nav-lesson-info">
					<span class="floating-nav-lesson-direction">Next →</span>
					<span class="floating-nav-lesson-title">{navigationState().nextLesson?.title}</span>
					<span class="floating-nav-lesson-unit">
						{navigationState().nextLesson?.isUnitOverview
							? "Unit Overview"
							: navigationState().nextLesson?.unitTitle}
					</span>
				</div>
			</div>
		{:else if navigationState().currentLesson && !hoveredButton}
			<div class="floating-nav-tooltip" role="tooltip">
				<div class="floating-nav-lesson-info">
					<span class="floating-nav-lesson-direction">Current</span>
					<span class="floating-nav-lesson-title">{navigationState().currentLesson?.title}</span>
					<span class="floating-nav-lesson-unit">
						{navigationState().currentLesson?.isUnitOverview
							? "Unit Overview"
							: navigationState().currentLesson?.unitTitle}
					</span>
				</div>
			</div>
		{/if}
	</nav>
{/if}

<style>
	/* Floating Navigation Container */
	.floating-nav {
		position: fixed;
		bottom: 1.5rem;
		/* Center relative to content area, not viewport */
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		justify-content: center;
		z-index: 90;
		/* Fully transparent wrapper */
		background: transparent;
	}

	.floating-nav-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.625rem 1rem;
		/* More transparent background */
		background: hsl(var(--background) / 0.65);
		backdrop-filter: blur(16px);
		border: 1px solid hsl(var(--border) / 0.3);
		border-radius: 16px;
		box-shadow:
			0 8px 32px hsl(var(--foreground) / 0.08),
			0 4px 16px hsl(var(--foreground) / 0.04);

		/* Smooth appearance animation */
		animation: slideUpFade 0.3s ease-out;
	}

	@keyframes slideUpFade {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Navigation Buttons */
	:global(.floating-nav-button) {
		min-width: 44px; /* Mobile touch target */
		min-height: 44px;
		cursor: pointer;
		transition: all 0.25s ease;
		border: 1px solid hsl(var(--primary) / 0.2) !important;
		background: hsl(var(--primary) / 0.05) !important;
		color: hsl(var(--primary)) !important;
		box-shadow:
			0 2px 8px hsl(var(--primary) / 0.1),
			0 1px 3px hsl(var(--foreground) / 0.05);
	}

	:global(.floating-nav-button:hover:not(:disabled)) {
		transform: translateY(-2px);
		background: hsl(var(--primary) / 0.1) !important;
		border-color: hsl(var(--primary) / 0.4) !important;
		box-shadow:
			0 4px 16px hsl(var(--primary) / 0.2),
			0 2px 8px hsl(var(--foreground) / 0.1);
		color: hsl(var(--primary)) !important;
	}

	:global(.floating-nav-button:active:not(:disabled)) {
		transform: translateY(-1px);
		background: hsl(var(--primary) / 0.15) !important;
	}

	:global(.floating-nav-button:disabled) {
		opacity: 0.3;
		cursor: not-allowed;
		background: hsl(var(--muted) / 0.5) !important;
		border-color: hsl(var(--border) / 0.3) !important;
		color: hsl(var(--muted-foreground)) !important;
		transform: none;
	}

	.floating-nav-text {
		font-weight: 500;
		font-size: 0.875rem;
	}

	/* Progress Indicator */
	.floating-nav-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		min-width: 80px;
	}

	.floating-nav-progress-text {
		font-size: 0.75rem;
		font-weight: 500;
		color: hsl(var(--muted-foreground));
		white-space: nowrap;
	}

	.floating-nav-progress-bar {
		width: 100%;
		height: 3px;
		background: hsl(var(--muted));
		border-radius: 2px;
		overflow: hidden;
	}

	.floating-nav-progress-fill {
		height: 100%;
		background: hsl(var(--primary));
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	/* Lesson Info Tooltip */
	.floating-nav-tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		box-shadow: 0 2px 8px hsl(var(--foreground) / 0.1);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
		white-space: nowrap;
		z-index: 100;
	}

	.floating-nav:hover .floating-nav-tooltip {
		opacity: 1;
	}

	.floating-nav-lesson-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		text-align: center;
	}

	.floating-nav-lesson-direction {
		font-size: 0.75rem;
		font-weight: 600;
		color: hsl(var(--primary));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.floating-nav-lesson-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
	}

	.floating-nav-lesson-unit {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.floating-nav {
			/* On mobile, center in full viewport since sidebar is hidden */
			bottom: 1rem;
			left: 50%;
			transform: translateX(-50%);
			width: calc(100% - 2rem);
			max-width: 400px;
		}

		.floating-nav-container {
			padding: 0.5rem 0.875rem;
			gap: 0.75rem;
			background: hsl(var(--background) / 0.75);
		}

		.floating-nav-text {
			display: none; /* Hide text on small screens */
		}

		:global(.floating-nav-button) {
			min-width: 48px; /* Larger touch target on mobile */
			min-height: 48px;
		}

		.floating-nav-progress {
			min-width: 60px;
		}

		.floating-nav-progress-text {
			font-size: 0.7rem;
		}

		/* Hide tooltip on mobile to save space */
		.floating-nav-tooltip {
			display: none;
		}
	}

	/* Tablet Responsiveness */
	@media (min-width: 769px) and (max-width: 1024px) {
		.floating-nav {
			left: 50%;
			transform: translateX(-50%);
		}

		.floating-nav-container {
			gap: 0.875rem;
			padding: 0.625rem 1rem;
		}

		.floating-nav-progress {
			min-width: 70px;
		}
	}

	/* Large Desktop */
	@media (min-width: 1280px) {
		.floating-nav {
			bottom: 2rem;
			left: 50%;
			transform: translateX(-50%);
		}

		.floating-nav-container {
			padding: 0.75rem 1.25rem;
			gap: 1.25rem;
		}

		.floating-nav-progress {
			min-width: 100px;
		}
	}

	/* Dark Mode Enhancements */
	@media (prefers-color-scheme: dark) {
		.floating-nav-container {
			background: hsl(var(--background) / 0.9);
			backdrop-filter: blur(16px);
		}

		:global(.floating-nav-button) {
			box-shadow: 0 1px 3px hsl(0 0% 0% / 0.2);
		}

		:global(.floating-nav-button:hover:not(:disabled)) {
			box-shadow: 0 2px 8px hsl(0 0% 0% / 0.3);
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.floating-nav-container {
			border-width: 2px;
		}

		.floating-nav-progress-fill {
			background: hsl(var(--accent-foreground));
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.floating-nav-container {
			animation: none;
		}

		:global(.floating-nav-button) {
			transition: none;
		}

		.floating-nav-progress-fill {
			transition: none;
		}

		:global(.floating-nav-button:hover:not(:disabled)) {
			transform: none;
		}
	}
</style>
