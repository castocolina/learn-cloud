<script lang="ts">
	import type { StudyGuideContent, Flashcard } from "$data/types";
	import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Maximize2 } from "lucide-svelte";
	import * as Dialog from "$lib/components/ui/dialog";

	interface Props {
		content: StudyGuideContent;
		class?: string;
	}

	let { content, class: className = "" }: Props = $props();

	// Study guide state
	let currentCardIndex = $state(0);
	let isFlipped = $state(false);
	let isShuffled = $state(false);
	let shuffledCards = $state<Flashcard[]>([]);

	// Initialize cards
	$effect(() => {
		shuffledCards = [...content.studyGuide.flashcards];
	});

	const currentCard = $derived(shuffledCards[currentCardIndex]);
	const totalCards = $derived(shuffledCards.length);
	const canGoNext = $derived(currentCardIndex < totalCards - 1);
	const canGoPrevious = $derived(currentCardIndex > 0);
	const progress = $derived(((currentCardIndex + 1) / totalCards) * 100);

	function nextCard() {
		if (canGoNext) {
			currentCardIndex++;
			isFlipped = false;
		}
	}

	function previousCard() {
		if (canGoPrevious) {
			currentCardIndex--;
			isFlipped = false;
		}
	}

	function flipCard() {
		isFlipped = !isFlipped;
	}

	function resetCards() {
		currentCardIndex = 0;
		isFlipped = false;
	}

	function shuffleCards() {
		if (!isShuffled) {
			// Fisher-Yates shuffle algorithm
			const cards = [...content.studyGuide.flashcards];
			for (let i = cards.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[cards[i], cards[j]] = [cards[j], cards[i]];
			}
			shuffledCards = cards;
			isShuffled = true;
		} else {
			// Reset to original order
			shuffledCards = [...content.studyGuide.flashcards];
			isShuffled = false;
		}
		currentCardIndex = 0;
		isFlipped = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			flipCard();
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			nextCard();
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			previousCard();
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<article class="study-guide-container {className}">
	<!-- Study guide header -->
	<header class="study-guide-header">
		<h1 class="study-guide-title">{content.title}</h1>
		<p class="study-guide-summary">{content.summary}</p>

		{#if content.studyGuide.description}
			<p class="study-guide-description">{content.studyGuide.description}</p>
		{/if}

		<!-- Progress and controls -->
		<div class="study-guide-meta">
			<div class="progress-section">
				<div class="progress-text">
					Card {currentCardIndex + 1} of {totalCards}
				</div>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
			</div>

			<div class="control-buttons">
				<button
					class="control-button"
					onclick={shuffleCards}
					class:active={isShuffled}
					aria-label={isShuffled ? "Reset to original order" : "Shuffle cards"}
					type="button"
				>
					<Shuffle size={16} />
				</button>

				<button
					class="control-button"
					onclick={resetCards}
					aria-label="Reset to first card"
					type="button"
				>
					<RotateCcw size={16} />
				</button>
			</div>
		</div>
	</header>

	<!-- Flashcard -->
	<main class="flashcard-container">
		<button
			class="flashcard"
			class:flipped={isFlipped}
			onclick={flipCard}
			onkeydown={handleKeyDown}
			aria-label={isFlipped ? "Show question side" : "Show answer side"}
			tabindex="0"
			type="button"
		>
			<div class="flashcard-front">
				<div class="card-content">
					<h3 class="card-title">Question</h3>
					<div class="card-text">
						{currentCard.front}
					</div>
				</div>
				<div class="flip-hint">
					<span>Click to reveal answer</span>
				</div>
			</div>

			<div class="flashcard-back">
				<div class="card-content">
					<h3 class="card-title">Answer</h3>
					<div class="card-text">
						{currentCard.back}
					</div>
				</div>
				<div class="flip-hint">
					<span>Click to see question</span>
				</div>
			</div>
		</button>

		<!-- Card tags -->
		{#if currentCard.tags?.length}
			<div class="card-tags">
				{#each currentCard.tags as tag (tag)}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</main>

	<!-- Navigation -->
	<footer class="navigation-controls">
		<button
			class="nav-button"
			onclick={previousCard}
			disabled={!canGoPrevious}
			aria-label="Previous card"
			type="button"
		>
			<ChevronLeft size={20} />
			Previous
		</button>

		<div class="keyboard-hints">
			<span class="hint">Space: Flip • ←→: Navigate • Esc: Exit fullscreen</span>
		</div>

		<button
			class="nav-button"
			onclick={nextCard}
			disabled={!canGoNext}
			aria-label="Next card"
			type="button"
		>
			Next
			<ChevronRight size={20} />
		</button>
	</footer>
</article>

<!-- Fullscreen Dialog Modal -->
<Dialog.Root>
	<Dialog.Trigger class="expand-button" aria-label="Open fullscreen view" type="button">
		<Maximize2 size={20} />
	</Dialog.Trigger>
	<Dialog.Content class="study-guide-dialog-content">
		<Dialog.Header>
			<Dialog.Title>Flashcards - Fullscreen View</Dialog.Title>
			<Dialog.Description>
				Card {currentCardIndex + 1} of {totalCards}
			</Dialog.Description>
		</Dialog.Header>

		<!-- Dialog content mirrors main flashcard -->
		<button
			class="modal-flashcard"
			class:flipped={isFlipped}
			onclick={flipCard}
			onkeydown={handleKeyDown}
			aria-label={isFlipped ? "Show question side" : "Show answer side"}
			tabindex="0"
			type="button"
		>
			<div class="flashcard-front">
				<div class="card-content">
					<h3 class="card-title">Question</h3>
					<div class="card-text">
						{currentCard.front}
					</div>
				</div>
			</div>

			<div class="flashcard-back">
				<div class="card-content">
					<h3 class="card-title">Answer</h3>
					<div class="card-text">
						{currentCard.back}
					</div>
				</div>
			</div>
		</button>

		<Dialog.Footer>
			<div class="modal-navigation">
				<button
					class="modal-nav-button"
					onclick={previousCard}
					disabled={!canGoPrevious}
					type="button"
				>
					<ChevronLeft size={24} />
				</button>

				<div class="modal-controls">
					<button class="modal-control" onclick={shuffleCards} type="button">
						<Shuffle size={20} />
					</button>
					<button class="modal-control" onclick={resetCards} type="button">
						<RotateCcw size={20} />
					</button>
				</div>

				<button class="modal-nav-button" onclick={nextCard} disabled={!canGoNext} type="button">
					<ChevronRight size={24} />
				</button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
