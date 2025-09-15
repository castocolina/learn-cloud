<script lang="ts">
	import type { StudyGuideContent, Flashcard } from "$data/types";
	import {
		ChevronLeft,
		ChevronRight,
		RotateCcw,
		Shuffle,
		Maximize2,
		Grid3X3,
		Eye
	} from "lucide-svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Progress } from "$lib/components/ui/progress/index.js";

	interface Props {
		content: StudyGuideContent;
		class?: string;
	}

	let { content, class: className = "" }: Props = $props();

	// Study guide state
	let currentCardIndex = $state(0);
	let isFlipped = $state(false);
	let isShuffled = $state(false);
	let shuffledCards = $state<Flashcard[]>(content.studyGuide.flashcards);
	let viewMode = $state<"single" | "grid">("single");

	const currentCard = $derived(shuffledCards[currentCardIndex] || null);
	const totalCards = $derived(shuffledCards.length);
	const canGoNext = $derived(currentCardIndex < totalCards - 1);
	const canGoPrevious = $derived(currentCardIndex > 0);
	const progress = $derived(totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0);

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

	function toggleViewMode() {
		viewMode = viewMode === "single" ? "grid" : "single";
		// Reset flip state when changing view mode
		isFlipped = false;
	}

	function selectCard(index: number) {
		currentCardIndex = index;
		viewMode = "single";
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
				<Progress
					value={progress}
					max={100}
					class="study-guide-progress"
					aria-label="Study Guide Progress"
				/>
			</div>

			<div class="control-buttons">
				<button
					class="control-button"
					onclick={toggleViewMode}
					class:active={viewMode === "grid"}
					aria-label={viewMode === "single" ? "Show grid view" : "Show single card view"}
					type="button"
				>
					{#if viewMode === "single"}
						<Grid3X3 size={16} />
					{:else}
						<Eye size={16} />
					{/if}
				</button>

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

	<!-- Flashcards Content -->
	{#if shuffledCards.length > 0}
		<main class="flashcards-main">
			{#if viewMode === "single"}
				<!-- Single Card View -->
				{#if currentCard}
					<div class="flashcard-container">
						<div class="flashcard-wrapper">
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

							<!-- Expand button positioned inside flashcard wrapper -->
							<Dialog.Root>
								<Dialog.Trigger
									class="expand-button"
									aria-label="Open fullscreen view"
									type="button"
								>
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
									<div class="modal-flashcard-container">
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
									</div>

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

											<button
												class="modal-nav-button"
												onclick={nextCard}
												disabled={!canGoNext}
												type="button"
											>
												<ChevronRight size={24} />
											</button>
										</div>
									</Dialog.Footer>
								</Dialog.Content>
							</Dialog.Root>
						</div>

						<!-- Card tags -->
						{#if currentCard?.tags?.length}
							<div class="card-tags">
								{#each currentCard.tags as tag (tag)}
									<span class="tag">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<!-- Grid View -->
				<div class="flashcards-grid">
					{#each shuffledCards as card, index (index)}
						<button
							class="grid-card"
							onclick={() => selectCard(index)}
							onkeydown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									selectCard(index);
								}
							}}
							aria-label="View card {index + 1}: {card.front}"
							type="button"
						>
							<div class="grid-card-content">
								<div class="grid-card-number">
									{index + 1}
								</div>
								<h4 class="grid-card-title">Question</h4>
								<p class="grid-card-text">
									{card.front.length > 100 ? card.front.substring(0, 100) + "..." : card.front}
								</p>
								{#if card.tags?.length}
									<div class="grid-card-tags">
										{#each card.tags.slice(0, 2) as tag (tag)}
											<span class="grid-tag">{tag}</span>
										{/each}
										{#if card.tags.length > 2}
											<span class="grid-tag-more">+{card.tags.length - 2}</span>
										{/if}
									</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</main>
	{:else}
		<div class="p-8 text-center">
			<p class="text-lg text-muted-foreground">No flashcards available</p>
		</div>
	{/if}

	<!-- Navigation (only show in single card view) -->
	{#if viewMode === "single"}
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
	{:else}
		<footer class="grid-view-hint">
			<div class="keyboard-hints">
				<span class="hint">Click any card to view in detail mode</span>
			</div>
		</footer>
	{/if}
</article>
