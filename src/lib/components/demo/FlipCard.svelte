<script lang="ts">
	import { Clock, Eye, RotateCcw, BookOpen, Expand } from "lucide-svelte";
	import * as Dialog from "$ui/dialog";
	import { SETTINGS } from "$config/settings";
	import type {
		FlipCard as FlipCardType,
		FlipCardProgress,
		FlipCardAnimation,
		FlipCardInteraction
	} from "$data/demo/content/flipcards/concept-cards.js";
	import {
		defaultFlipCardAnimation,
		defaultFlipCardInteraction,
		defaultFlipCardProgress
	} from "$data/demo/content/flipcards/concept-cards.js";

	// Props interface for type safety
	interface Props {
		card: FlipCardType;
		className?: string;
		showMetadata?: boolean;
		showProgress?: boolean;
		onFlip?: (cardId: string, isFlipped: boolean) => void;
		onMastered?: (cardId: string, mastered: boolean) => void;
	}

	let {
		card,
		className = "",
		showMetadata = true,
		showProgress = true,
		onFlip,
		onMastered
	}: Props = $props();

	// Svelte 5 runes for state management
	let isFlipped = $state(false);
	let isFlipping = $state(false);
	let isModalOpen = $state(false);
	let progress = $state<FlipCardProgress>({
		...defaultFlipCardProgress,
		...card.progress
	});

	// Derived configuration with fallbacks
	let animation = $derived<FlipCardAnimation>({
		...defaultFlipCardAnimation,
		...card.animation
	});

	let interaction = $derived<FlipCardInteraction>({
		...defaultFlipCardInteraction,
		...card.interaction
	});

	// Keyboard navigation support
	function handleKeydown(event: KeyboardEvent) {
		if (!interaction.keyboardNav) return;

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
			progress.viewed = true;
		}

		if (isFlipped && !progress.flipped) {
			progress.flipped = true;
		}

		progress.viewCount++;
		progress.lastViewed = new Date();

		// Call external flip handler
		onFlip?.(card.id, isFlipped);

		// Reset flipping state after animation
		setTimeout(() => {
			isFlipping = false;
		}, animation.duration);

		// Auto flip back if configured
		if (interaction.autoFlipBack > 0 && isFlipped) {
			setTimeout(() => {
				if (isFlipped) {
					flip();
				}
			}, interaction.autoFlipBack);
		}
	}

	// Handle click interactions
	function handleClick(event: MouseEvent) {
		if (!interaction.clickToFlip) return;

		// Don't flip if clicking on control buttons
		if ((event.target as HTMLElement).closest(".demo-flipcard-button")) {
			return;
		}

		flip();
	}

	// Handle touch interactions for mobile
	function handleTouchStart(event: TouchEvent) {
		if (!interaction.touchToFlip) return;

		// Don't flip if touching control buttons
		if ((event.target as HTMLElement).closest(".demo-flipcard-button")) {
			return;
		}

		flip();
	}

	// Handle hover interactions (desktop only)
	function handleMouseEnter() {
		if (!interaction.hoverToFlip || window.innerWidth < 768) return;
		if (!isFlipped) {
			flip();
		}
	}

	function handleMouseLeave() {
		if (!interaction.hoverToFlip || window.innerWidth < 768) return;
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
	function toggleMastered() {
		progress.mastered = !progress.mastered;
		onMastered?.(card.id, progress.mastered);
	}

	// Handle expand to modal
	function handleExpand() {
		isModalOpen = true;
	}

	// Format category for display
	function formatCategory(category: string): string {
		return category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	}

	// Format complexity for display
	function formatComplexity(complexity: string): string {
		return complexity.charAt(0).toUpperCase() + complexity.slice(1);
	}

	// Get complexity CSS class
	function getComplexityClass(complexity: string): string {
		return `demo-flipcard-badge--${complexity}`;
	}
</script>

<div
	class="demo-flipcard {className} {isFlipped ? 'flipped' : ''} {isFlipping
		? 'demo-flipcard--flipping'
		: ''}"
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
	<div class="demo-flipcard-inner">
		<!-- Front Side -->
		<div class="demo-flipcard-front">
			<div class="demo-flipcard-header">
				<h3 class="demo-flipcard-question">{card.front}</h3>
			</div>

			<div class="demo-flipcard-content">
				<p class="text-sm opacity-75">Click to reveal the answer</p>
			</div>

			{#if showMetadata}
				<div class="demo-flipcard-metadata">
					<span class="demo-flipcard-badge demo-flipcard-badge--category">
						{formatCategory(card.category)}
					</span>
					<span class="demo-flipcard-badge {getComplexityClass(card.complexity)}">
						{formatComplexity(card.complexity)}
					</span>
				</div>
			{/if}

			{#if showProgress}
				<div class="demo-flipcard-progress">
					<div class="flex items-center gap-1">
						<div
							class="demo-flipcard-progress-dot {progress.viewed
								? 'demo-flipcard-progress-dot--viewed'
								: 'demo-flipcard-progress-dot--default'}"
							title="Viewed"
						></div>
						<div
							class="demo-flipcard-progress-dot {progress.flipped
								? 'demo-flipcard-progress-dot--flipped'
								: 'demo-flipcard-progress-dot--default'}"
							title="Flipped"
						></div>
						<div
							class="demo-flipcard-progress-dot {progress.mastered
								? 'demo-flipcard-progress-dot--mastered'
								: 'demo-flipcard-progress-dot--default'}"
							title="Mastered"
						></div>
					</div>
					<span class="demo-flipcard-learning-time">
						<Clock size={12} />
						{card.education.estimatedLearningTime}m
					</span>
				</div>
			{/if}
		</div>

		<!-- Back Side -->
		<div class="demo-flipcard-back">
			<div class="demo-flipcard-header">
				<h3 class="demo-flipcard-answer">Answer</h3>
			</div>

			<div class="demo-flipcard-content">
				<p>{card.back}</p>

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

			{#if card.tags && card.tags.length > 0}
				<div class="demo-flipcard-tags">
					{#each card.tags.slice(0, 3) as tag, index (index)}
						<span class="demo-flipcard-tag">{tag}</span>
					{/each}
					{#if card.tags.length > 3}
						<span class="demo-flipcard-tag">+{card.tags.length - 3}</span>
					{/if}
				</div>
			{/if}

			{#if showProgress}
				<div class="demo-flipcard-progress">
					<div class="flex items-center gap-1">
						<div
							class="demo-flipcard-progress-dot demo-flipcard-progress-dot--viewed"
							title="Viewed"
						></div>
						<div
							class="demo-flipcard-progress-dot demo-flipcard-progress-dot--flipped"
							title="Flipped"
						></div>
						<div
							class="demo-flipcard-progress-dot {progress.mastered
								? 'demo-flipcard-progress-dot--mastered'
								: 'demo-flipcard-progress-dot--default'}"
							title="Mastered"
						></div>
					</div>
					<span class="text-xs">Views: {progress.viewCount}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Control Buttons -->
	<div class="demo-flipcard-controls">
		<button
			type="button"
			class="demo-flipcard-button"
			title="Expand to full view"
			aria-label="Expand card to full view"
			onclick={(e) => {
				e.stopPropagation();
				handleExpand();
			}}
		>
			<Expand size={14} />
		</button>

		<button
			type="button"
			class="demo-flipcard-button"
			title="Reset to front"
			aria-label="Reset card to front side"
			onclick={(e) => {
				e.stopPropagation();
				resetCard();
			}}
		>
			<RotateCcw size={14} />
		</button>

		<button
			type="button"
			class="demo-flipcard-button {progress.mastered ? 'demo-flipcard-button--primary' : ''}"
			title={progress.mastered ? "Mark as not mastered" : "Mark as mastered"}
			aria-label={progress.mastered ? "Mark as not mastered" : "Mark as mastered"}
			onclick={(e) => {
				e.stopPropagation();
				toggleMastered();
			}}
		>
			<Eye size={14} />
		</button>
	</div>
</div>

<!-- Modal Dialog -->
<Dialog.Root bind:open={isModalOpen}>
	<Dialog.Content
		class="demo-flipcard-modal-content"
		style="max-width: {SETTINGS.flipCard.modalPagePercent}vw !important; max-height: {SETTINGS
			.flipCard.modalPagePercent}vh !important; width: {SETTINGS.flipCard
			.modalPagePercent}vw; height: {SETTINGS.flipCard.modalPagePercent}vh;"
	>
		<Dialog.Header>
			<Dialog.Title>{card.front}</Dialog.Title>
			<Dialog.Description>Complete flip card details</Dialog.Description>
		</Dialog.Header>

		<div class="demo-flipcard-modal-body">
			<!-- Card Question -->
			<div class="demo-flipcard-modal-section">
				<h4 class="demo-flipcard-modal-section-title">Question</h4>
				<p class="demo-flipcard-modal-question">{card.front}</p>
			</div>

			<!-- Card Answer -->
			<div class="demo-flipcard-modal-section">
				<h4 class="demo-flipcard-modal-section-title">Answer</h4>
				<p class="demo-flipcard-modal-answer">{card.back}</p>
			</div>

			<!-- Learning Objectives -->
			{#if card.education.learningObjectives && card.education.learningObjectives.length > 0}
				<div class="demo-flipcard-modal-section">
					<h4 class="demo-flipcard-modal-section-title">
						<BookOpen size={16} />
						Learning Objectives
					</h4>
					<ul class="demo-flipcard-modal-objectives">
						{#each card.education.learningObjectives as objective, index (index)}
							<li class="demo-flipcard-modal-objective">
								<span class="demo-flipcard-modal-objective-bullet">•</span>
								<span>{objective}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Metadata and Tags -->
			<div class="demo-flipcard-modal-metadata">
				<div class="demo-flipcard-modal-badges">
					<span class="demo-flipcard-badge demo-flipcard-badge--category">
						{formatCategory(card.category)}
					</span>
					<span class="demo-flipcard-badge {getComplexityClass(card.complexity)}">
						{formatComplexity(card.complexity)}
					</span>
				</div>

				{#if card.tags && card.tags.length > 0}
					<div class="demo-flipcard-modal-tags">
						{#each card.tags as tag, index (index)}
							<span class="demo-flipcard-tag">{tag}</span>
						{/each}
					</div>
				{/if}

				<div class="demo-flipcard-modal-stats">
					<span class="demo-flipcard-modal-stat">
						<Clock size={14} />
						{card.education.estimatedLearningTime}m
					</span>
					<span class="demo-flipcard-modal-stat">
						<Eye size={14} />
						Views: {progress.viewCount}
					</span>
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
