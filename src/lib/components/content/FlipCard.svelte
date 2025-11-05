<!--
	FlipCard Component - Production Interactive Learning Card

	Features:
	- 3D CSS flip animation with backface-visibility
	- Touch gesture support for mobile devices
	- Keyboard navigation (Space/Enter to flip, Tab for focus)
	- Dialog modal expansion for full-screen study mode
	- Global progress tracking with localStorage persistence
	- ARIA accessibility attributes (WCAG 2.1 AA compliant)
	- Control buttons (Expand, Reset, Mark Mastered)

	Usage:
		import FlipCard from "$lib/components/content/FlipCard.svelte";
		import { conceptCards } from "$data/demo/content/flipcards/concept-cards.js";

		<FlipCard card={conceptCards[0]} />
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { Clock, Eye, RotateCcw, BookOpen, Expand, Tag, Layers, Trophy } from "lucide-svelte";
	import Dialog from "$lib/components/shared/Dialog.svelte";
	import IconGrid from "$lib/components/shared/IconGrid.svelte";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import type {
		FlipCard as FlipCardType,
		InteractiveAnimation,
		InteractiveConfiguration,
		IconItem
	} from "$types";
	import { defaultInteractiveAnimation, defaultInteractiveConfiguration } from "$types";
	import {
		flipCardProgressStore,
		updateCardProgress,
		completeCard,
		toggleCardMastery,
		getCardProgress
	} from "$lib/stores/flipcard-progress";

	// Props interface for type safety
	interface Props {
		card: FlipCardType;
		className?: string;
		showMetadata?: boolean;
		showProgress?: boolean;
		onFlip?: (cardId: string, isFlipped: boolean) => void;
		onComplete?: (cardId: string) => void;
		onMastered?: (cardId: string, mastered: boolean) => void;
	}

	let {
		card,
		className = "",
		showMetadata = true,
		showProgress = true,
		onFlip,
		onComplete,
		onMastered
	}: Props = $props();

	// Svelte 5 runes for state management
	let isFlipped = $state(false);
	let isFlipping = $state(false);
	let isModalOpen = $state(false);
	let timeStarted = $state<number | null>(null);

	// Derived progress from global store
	let progress = $derived(getCardProgress(card.id, $flipCardProgressStore));

	// Derived configuration with fallbacks
	let animation = $derived<InteractiveAnimation>({
		...defaultInteractiveAnimation,
		...card.animation
	});

	let interaction = $derived<InteractiveConfiguration>({
		...defaultInteractiveConfiguration,
		...card.interaction
	});

	// Derived control icons with reactive mastered state
	const controlIcons = $derived<IconItem[]>([
		{
			id: `${card.id}-expand`,
			icon: Expand,
			label: "Expand to full view",
			onClick: (e) => {
				e?.stopPropagation();
				handleExpand();
			},
			variant: "default"
		},
		{
			id: `${card.id}-reset`,
			icon: RotateCcw,
			label: "Reset to front",
			onClick: (e) => {
				e?.stopPropagation();
				resetCard();
			},
			variant: "default"
		},
		{
			id: `${card.id}-mastered`,
			icon: Eye,
			label: progress.mastered ? "Mark as not mastered" : "Mark as mastered",
			onClick: (e) => {
				e?.stopPropagation();
				handleToggleMastered();
			},
			variant: progress.mastered ? "primary" : "default",
			state: progress.mastered ? "active" : "default"
		}
	]);

	// Track time spent when card is visible
	onMount(() => {
		timeStarted = Date.now();

		return () => {
			if (timeStarted) {
				const timeSpent = Math.floor((Date.now() - timeStarted) / 1000);
				if (timeSpent > 0) {
					// Save time spent (will be handled by progress store)
					updateCardProgress(card.id, {
						timeSpent: (progress.timeSpent || 0) + timeSpent
					});
				}
			}
		};
	});

	// Keyboard navigation support
	function handleKeydown(event: KeyboardEvent) {
		if (!interaction.keyboardNavigation) return;

		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			flip();
		}
	}

	// Main flip function with progress tracking
	function flip() {
		if (isFlipping) return;

		isFlipping = true;
		isFlipped = !isFlipped;

		// Update progress tracking
		if (!progress.viewed) {
			updateCardProgress(card.id, {
				viewed: true,
				accessCount: 1
			});
		}

		if (isFlipped && !progress.completed) {
			completeCard(card.id);
			onComplete?.(card.id);
		}

		// Call external flip handler
		onFlip?.(card.id, isFlipped);

		// Reset flipping state after animation
		setTimeout(() => {
			isFlipping = false;
		}, animation.duration);

		// Auto reset if configured
		if (interaction.autoReset > 0 && isFlipped) {
			setTimeout(() => {
				if (isFlipped) {
					flip();
				}
			}, interaction.autoReset);
		}
	}

	// Helper to check if click/touch is on control element
	function isControlElement(target: HTMLElement): boolean {
		return !!(
			target.closest(".flipcard-button") ||
			target.closest(".icon-grid-item") ||
			target.closest(".flipcard-controls-grid") ||
			target.closest(".flipcard-metadata-icons") ||
			target.closest(".flipcard-icon-button")
		);
	}

	// Handle click interactions
	function handleClick(event: MouseEvent) {
		if (!interaction.clickToInteract) return;

		// Don't flip if clicking on control buttons
		if (isControlElement(event.target as HTMLElement)) {
			return;
		}

		flip();
	}

	// Handle touch interactions for mobile
	function handleTouchStart(event: TouchEvent) {
		if (!interaction.touchGestures) return;

		// Don't flip if touching control buttons
		if (isControlElement(event.target as HTMLElement)) {
			return;
		}

		flip();
	}

	// Handle hover interactions (desktop only)
	function handleMouseEnter() {
		if (!interaction.hoverToInteract || window.innerWidth < 768) return;
		if (!isFlipped) {
			flip();
		}
	}

	function handleMouseLeave() {
		if (!interaction.hoverToInteract || window.innerWidth < 768) return;
		if (isFlipped) {
			flip();
		}
	}

	// Reset card to front
	function resetCard() {
		if (isFlipped) {
			flip();
		}
	}

	// Toggle mastered status
	function handleToggleMastered() {
		const newMasteredState = !progress.mastered;
		toggleCardMastery(card.id, newMasteredState);
		onMastered?.(card.id, newMasteredState);
	}

	// Handle expand to modal
	function handleExpand() {
		isModalOpen = true;
	}

	// Format category for display
	function formatCategory(category: string | undefined): string {
		if (!category) return "Uncategorized";
		return category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	}

	// Get difficulty display label
	function getDifficultyLabel(difficulty: string | undefined): string {
		if (!difficulty) return "Unknown";
		return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
	}

	// Get difficulty CSS class
	function getDifficultyClass(difficulty: string | undefined): string {
		if (!difficulty) return "flipcard-badge--beginner";
		return `flipcard-badge--${difficulty}`;
	}

	// Generic helper to get color with opacity (reusable pattern)
	function getColorStyle(colorVar: string, opacity: number): string {
		return `hsl(var(--${colorVar}) / ${opacity})`;
	}

	// Get category color for icons - use theme's info color (blue)
	function getCategoryColor(): string {
		return getColorStyle("info", 1.0); // Info blue - matches category semantic meaning
	}

	// Get difficulty color for icons - use theme's established difficulty colors
	function getDifficultyColor(difficulty: string | undefined): string {
		switch (difficulty) {
			case "beginner":
				return getColorStyle("success", 1.0); // Green - established in theme
			case "intermediate":
				return getColorStyle("warning", 1.0); // Orange - established in theme
			case "advanced":
				return getColorStyle("destructive", 1.0); // Red - established in theme
			default:
				return getColorStyle("muted-foreground", 1.0);
		}
	}

	// Get keywords color for icons - use theme's muted-foreground (matches tag colors)
	function getKeywordsColor(): string {
		return getColorStyle("muted-foreground", 1.0); // Matches flipcard-tag-tooltip color
	}
</script>

<div
	class="flipcard {className} {isFlipped ? 'flipped' : ''} {isFlipping ? 'flipcard--flipping' : ''}"
	role="button"
	tabindex="0"
	aria-label="Flip card: {card.front}"
	aria-pressed={isFlipped}
	onclick={handleClick}
	ontouchstart={handleTouchStart}
	onkeydown={handleKeydown}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<div class="flipcard-inner">
		<!-- Front Side -->
		<div class="flipcard-front">
			<!-- Front: Question truly centered -->
			<div class="flipcard-front-content">
				<h3 class="flipcard-question">{card.front}</h3>
				<p class="flipcard-hint">Click to reveal the answer</p>
			</div>

			{#if showMetadata}
				<div class="flipcard-metadata">
					<span class="flipcard-badge flipcard-badge--category">
						{formatCategory(card.category)}
					</span>
					<span class="flipcard-badge {getDifficultyClass(card.education.difficulty)}">
						{getDifficultyLabel(card.education.difficulty)}
					</span>
				</div>
			{/if}

			{#if showProgress}
				<div class="flipcard-progress">
					<!-- Progress Dots (Status - LEFT) -->
					<div class="flex items-center gap-1">
						<div
							class="flipcard-progress-dot {progress.viewed
								? 'flipcard-progress-dot--viewed'
								: 'flipcard-progress-dot--default'}"
							title="Viewed"
						></div>
						<div
							class="flipcard-progress-dot {progress.completed
								? 'flipcard-progress-dot--completed'
								: 'flipcard-progress-dot--default'}"
							title="Completed"
						></div>
						<div
							class="flipcard-progress-dot {progress.mastered
								? 'flipcard-progress-dot--mastered'
								: 'flipcard-progress-dot--default'}"
							title="Mastered"
						></div>
					</div>

					<!-- Learning Time (Metadata - CENTER-LEFT) -->
					<span class="flipcard-learning-time">
						<Clock size={12} />
						{card.education.estimatedTime ?? 0}m
					</span>

					<!-- Control Buttons (Actions - RIGHT) -->
					<IconGrid
						icons={controlIcons}
						positioning="inline"
						gap="0.25rem"
						iconSize={14}
						showTooltips={true}
						class="flipcard-controls-grid ml-auto"
					/>
				</div>
			{/if}
		</div>

		<!-- Back Side -->
		<div class="flipcard-back">
			<div class="flipcard-header">
				<p class="flipcard-question-inline">
					<span class="flipcard-label-small">QUESTION:</span>
					{card.front}
				</p>
				<h3 class="flipcard-answer-label">Answer</h3>
			</div>

			<div class="flipcard-content">
				<p class="flipcard-answer-text">{card.back}</p>

				{#if card.education.learningObjectives && card.education.learningObjectives.length > 0}
					<div class="mt-4">
						<h4 class="mb-2 flex items-center gap-1 text-sm font-semibold">
							<BookOpen size={14} />
							Learning Objectives
						</h4>
						<ul class="space-y-1 text-sm">
							{#each card.education.learningObjectives as objective, index (index)}
								<li class="flex items-start gap-1">
									<span class="mt-1 text-xs">•</span>
									<span>{objective}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			{#if showProgress}
				<div class="flipcard-progress">
					<!-- LEFT: Progress Dots -->
					<div class="flex items-center gap-1">
						<div class="flipcard-progress-dot flipcard-progress-dot--viewed" title="Viewed"></div>
						<div
							class="flipcard-progress-dot flipcard-progress-dot--completed"
							title="Completed"
						></div>
						<div
							class="flipcard-progress-dot {progress.mastered
								? 'flipcard-progress-dot--mastered'
								: 'flipcard-progress-dot--default'}"
							title="Mastered"
						></div>
					</div>

					<!-- CENTER-LEFT: Metadata Icons -->
					<div class="flipcard-metadata-icons">
						<!-- Category -->
						<Tooltip.Root>
							<Tooltip.Trigger class="flipcard-icon-button" onclick={(e) => e.stopPropagation()}>
								<Layers size={14} style="color: {getCategoryColor()}" />
							</Tooltip.Trigger>
							<Tooltip.Content>
								<span class="tooltip-category-inner">{formatCategory(card.category)}</span>
							</Tooltip.Content>
						</Tooltip.Root>

						<!-- Difficulty -->
						<Tooltip.Root>
							<Tooltip.Trigger class="flipcard-icon-button" onclick={(e) => e.stopPropagation()}>
								<Trophy size={14} style="color: {getDifficultyColor(card.education.difficulty)}" />
							</Tooltip.Trigger>
							<Tooltip.Content>
								<span
									class="tooltip-difficulty-inner tooltip-difficulty-inner--{card.education
										.difficulty}"
								>
									{getDifficultyLabel(card.education.difficulty)}
								</span>
							</Tooltip.Content>
						</Tooltip.Root>

						<!-- Keywords -->
						{#if card.education.keywords && card.education.keywords.length > 0}
							<Tooltip.Root>
								<Tooltip.Trigger class="flipcard-icon-button" onclick={(e) => e.stopPropagation()}>
									<Tag size={14} style="color: {getKeywordsColor()}" />
									<span class="ml-0.5 text-xs">{card.education.keywords.length}</span>
								</Tooltip.Trigger>
								<Tooltip.Content side="top" class="max-w-xs">
									<div class="flex flex-wrap gap-1">
										{#each card.education.keywords as keyword (keyword)}
											<span class="flipcard-tag-tooltip">{keyword}</span>
										{/each}
									</div>
								</Tooltip.Content>
							</Tooltip.Root>
						{/if}
					</div>

					<!-- CENTER-RIGHT: Learning Time -->
					<span class="flipcard-learning-time">
						<Clock size={14} />
						{card.education.estimatedTime ?? 0}m
					</span>

					<!-- RIGHT: Control Buttons -->
					<IconGrid
						icons={controlIcons}
						positioning="inline"
						gap="0.25rem"
						iconSize={12}
						showTooltips={true}
						class="flipcard-controls-grid ml-auto"
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Modal Dialog -->
<Dialog
	bind:open={isModalOpen}
	size="3xl"
	title={card.front}
	description="Complete flip card details"
>
	<div class="flipcard-modal-body">
		<!-- Card Answer -->
		<div class="flipcard-modal-section">
			<h4 class="flipcard-modal-section-title">Answer</h4>
			<p class="flipcard-modal-answer">{card.back}</p>
		</div>

		<hr class="my-4 border-t border-border" />

		<!-- Learning Objectives -->
		{#if card.education.learningObjectives && card.education.learningObjectives.length > 0}
			<div class="flipcard-modal-section">
				<h4 class="flipcard-modal-section-title">
					<BookOpen size={16} />
					Learning Objectives
				</h4>
				<ul class="flipcard-modal-objectives">
					{#each card.education.learningObjectives as objective, index (index)}
						<li class="flipcard-modal-objective">
							<span class="flipcard-modal-objective-bullet">•</span>
							<span>{objective}</span>
						</li>
					{/each}
				</ul>
			</div>

			<hr class="my-4 border-t border-border" />
		{/if}

		<!-- Prerequisites -->
		{#if card.education.prerequisites && card.education.prerequisites.length > 0}
			<div class="flipcard-modal-section">
				<h4 class="flipcard-modal-section-title">Prerequisites</h4>
				<ul class="flipcard-modal-objectives">
					{#each card.education.prerequisites as prerequisite, index (index)}
						<li class="flipcard-modal-objective">
							<span class="flipcard-modal-objective-bullet">•</span>
							<span>{prerequisite}</span>
						</li>
					{/each}
				</ul>
			</div>

			<hr class="my-4 border-t border-border" />
		{/if}

		<!-- Related Concepts -->
		{#if card.education.relatedConcepts && card.education.relatedConcepts.length > 0}
			<div class="flipcard-modal-section">
				<h4 class="flipcard-modal-section-title">Related Concepts</h4>
				<div class="flex flex-wrap gap-2">
					{#each card.education.relatedConcepts as concept, index (index)}
						<span class="flipcard-badge flipcard-badge--category">{concept}</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Metadata and Tags -->
		<div class="flipcard-modal-metadata">
			<div class="flipcard-modal-badges">
				<span class="flipcard-badge flipcard-badge--category">
					{formatCategory(card.category)}
				</span>
				<span class="flipcard-badge {getDifficultyClass(card.education.difficulty)}">
					{getDifficultyLabel(card.education.difficulty)}
				</span>
			</div>

			{#if card.education.keywords && card.education.keywords.length > 0}
				<div class="flipcard-modal-tags">
					{#each card.education.keywords as keyword, index (index)}
						<span class="flipcard-tag">{keyword}</span>
					{/each}
				</div>
			{/if}

			<div class="flipcard-modal-stats">
				<span class="flipcard-modal-stat">
					<Clock size={14} />
					{card.education.estimatedTime ?? 0}m
				</span>
				<span class="flipcard-modal-stat">
					<Eye size={14} />
					Views: {progress.accessCount}
				</span>
				{#if progress.timeSpent > 0}
					<span class="flipcard-modal-stat">
						<Clock size={14} />
						Time: {Math.floor(progress.timeSpent / 60)}m {progress.timeSpent % 60}s
					</span>
				{/if}
			</div>
		</div>
	</div>
</Dialog>
