<script lang="ts">
	import type { StudyGuideContent, Flashcard } from "$data/types";
	import { Maximize2, FlipHorizontal } from "lucide-svelte";
	import * as Dialog from "$lib/components/ui/dialog";

	interface Props {
		content: StudyGuideContent;
		class?: string;
	}

	let { content, class: className = "" }: Props = $props();

	// Study guide state (simplified)
	let shuffledCards = $state<Flashcard[]>(content.studyGuide.flashcards);
	let cardFlipStates = $state<boolean[]>(
		new Array(content.studyGuide.flashcards.length).fill(false)
	);
	let selectedCardForModal = $state<Flashcard | null>(null);
	let isModalOpen = $state(false);
	let isFlipped = $state(false); // For modal flip state

	// Derived state
	const totalCards = $derived(shuffledCards.length);

	// Functions
	function flipCard() {
		isFlipped = !isFlipped;
	}

	function flipGridCard(index: number) {
		cardFlipStates[index] = !cardFlipStates[index];
	}

	function openModal(card: Flashcard) {
		selectedCardForModal = card;
		isModalOpen = true;
		isFlipped = false;
	}

	function closeModal() {
		isModalOpen = false;
		selectedCardForModal = null;
		isFlipped = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			flipCard();
		} else if (event.key === "Escape") {
			event.preventDefault();
			closeModal();
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

		<!-- Simplified meta info -->
		<div class="study-guide-meta">
			<div class="flashcards-count">
				{totalCards} flashcards available
			</div>
		</div>
	</header>

	<!-- Flashcards Grid -->
	{#if shuffledCards.length > 0}
		<main class="flashcards-main">
			<div class="flashcards-grid">
				{#each shuffledCards as card, index (index)}
					<div class="flashcard-wrapper">
						<!-- Single unified flashcard component -->
						<div class="flashcard" class:flipped={cardFlipStates[index]}>
							<!-- Front face -->
							<div class="flashcard-face flashcard-front">
								<div class="flashcard-content">
									<div class="card-number">{index + 1}</div>
									<h4 class="card-title">Question</h4>
									<div class="card-text">
										{card.front.length > 80 ? card.front.substring(0, 80) + "..." : card.front}
									</div>
									{#if card.tags?.length}
										<div class="card-tags">
											{#each card.tags.slice(0, 2) as tag (tag)}
												<span class="tag">{tag}</span>
											{/each}
											{#if card.tags.length > 2}
												<span class="tag-more">+{card.tags.length - 2}</span>
											{/if}
										</div>
									{/if}
									<div class="flip-hint">
										<span>Click to reveal answer</span>
									</div>
								</div>
							</div>

							<!-- Back face -->
							<div class="flashcard-face flashcard-back">
								<div class="flashcard-content">
									<div class="card-number">{index + 1}</div>
									<h4 class="card-title">Answer</h4>
									<div class="card-text">
										{card.back.length > 80 ? card.back.substring(0, 80) + "..." : card.back}
									</div>
									<div class="flip-hint">
										<span>Click to see question</span>
									</div>
								</div>
							</div>

							<!-- Flip button (overlays the card) -->
							<button
								class="flip-button"
								onclick={() => flipGridCard(index)}
								aria-label={cardFlipStates[index] ? "Show question" : "Show answer"}
								type="button"
							></button>
						</div>

						<!-- Expand button (separate from card, positioned in top-right corner) -->
						<button
							class="expand-button"
							onclick={() => openModal(card)}
							aria-label="Open fullscreen view"
							type="button"
						>
							<Maximize2 size={16} />
						</button>
					</div>
				{/each}
			</div>
		</main>
	{:else}
		<div class="p-8 text-center">
			<p class="text-muted-foreground text-lg">No flashcards available</p>
		</div>
	{/if}

	<footer class="grid-view-hint">
		<div class="keyboard-hints">
			<span class="hint"
				>Click cards to flip • Expand button for fullscreen view • Esc: Exit fullscreen</span
			>
		</div>
	</footer>
</article>

<!-- Modal for expanded view -->
<Dialog.Root bind:open={isModalOpen}>
	<Dialog.Content class="modal-content">
		<Dialog.Header>
			<Dialog.Title>Flashcard - Fullscreen View</Dialog.Title>
		</Dialog.Header>

		{#if selectedCardForModal}
			<div class="modal-flashcard-container">
				<div class="modal-flashcard" class:flipped={isFlipped}>
					<!-- Modal Front -->
					<div class="modal-flashcard-face modal-flashcard-front">
						<div class="modal-flashcard-content">
							<h3 class="modal-card-title">Question</h3>
							<div class="modal-card-text">
								{selectedCardForModal.front}
							</div>
						</div>
					</div>

					<!-- Modal Back -->
					<div class="modal-flashcard-face modal-flashcard-back">
						<div class="modal-flashcard-content">
							<h3 class="modal-card-title">Answer</h3>
							<div class="modal-card-text">
								{selectedCardForModal.back}
							</div>
						</div>
					</div>

					<!-- Modal Flip Button -->
					<button
						class="modal-flip-button"
						onclick={flipCard}
						aria-label={isFlipped ? "Show question" : "Show answer"}
						type="button"
					></button>
				</div>
			</div>

			<!-- Card tags in modal -->
			{#if selectedCardForModal?.tags?.length}
				<div class="modal-card-tags">
					{#each selectedCardForModal.tags as tag (tag)}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		{/if}

		<Dialog.Footer>
			<div class="modal-controls">
				<button class="modal-control" onclick={flipCard} type="button">
					<FlipHorizontal size={20} />
					<span>Flip Card</span>
				</button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* ===== MAIN CONTAINER ===== */
	.study-guide-container {
		margin: 0 auto;
		max-width: 80rem;
		padding: 1rem;
	}

	.study-guide-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.study-guide-title {
		margin-bottom: 1rem;
		font-size: 1.875rem;
		font-weight: 700;
		color: hsl(var(--foreground));
	}

	.study-guide-summary {
		margin-bottom: 1rem;
		font-size: 1.125rem;
		color: hsl(var(--muted-foreground));
	}

	.study-guide-description {
		margin-bottom: 2rem;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.flashcards-count {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin: 0.5rem 0;
	}

	/* ===== GRID LAYOUT ===== */
	.flashcards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.25rem;
		padding: 1rem 0;
	}

	/* ===== FLASHCARD WRAPPER ===== */
	.flashcard-wrapper {
		position: relative;
		height: 13rem;
	}

	/* ===== FLASHCARD COMPONENT ===== */
	.flashcard {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 0.6s ease-in-out;
		perspective: 1000px;
	}

	.flashcard.flipped {
		transform: rotateY(180deg);
	}

	/* ===== FLASHCARD FACES ===== */
	.flashcard-face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--border));
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
	}

	.flashcard-front {
		background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.1) 100%);
	}

	.flashcard-back {
		background: linear-gradient(
			135deg,
			hsl(var(--primary) / 0.1) 0%,
			hsl(var(--secondary) / 0.2) 100%
		);
		border-color: hsl(var(--primary) / 0.3);
		transform: rotateY(180deg);
	}

	/* ===== FLASHCARD CONTENT ===== */
	.flashcard-content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.card-number {
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		display: flex;
		height: 2rem;
		width: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: hsl(var(--primary));
		font-size: 0.75rem;
		font-weight: 700;
		color: hsl(var(--primary-foreground));
	}

	.card-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: hsl(var(--foreground));
	}

	.card-text {
		font-size: 0.925rem;
		line-height: 1.5;
		flex-grow: 1;
		display: flex;
		align-items: center;
		color: hsl(var(--foreground));
		margin: 0.75rem 0;
	}

	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.tag {
		border-radius: 9999px;
		background-color: hsl(var(--accent));
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: hsl(var(--accent-foreground));
	}

	.tag-more {
		border-radius: 9999px;
		background-color: hsl(var(--muted));
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: hsl(var(--muted-foreground));
	}

	.flip-hint {
		text-align: center;
		opacity: 0.6;
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	/* ===== INTERACTIVE BUTTONS ===== */
	.flip-button {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		z-index: 1;
		border-radius: 0.75rem;
	}

	.flip-button:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
	}

	.expand-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 10;
		border-radius: 50%;
		border: 1px solid hsl(var(--border));
		background-color: hsl(var(--card));
		padding: 0.5rem;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		transition: all 0.2s;
		cursor: pointer;
	}

	.expand-button:hover {
		background-color: hsl(var(--muted));
		transform: scale(1.1);
	}

	.expand-button:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
	}

	/* ===== MODAL STYLES ===== */
	.modal-content {
		height: 90vh;
		max-height: 90vh;
		width: 95vw;
		max-width: 95vw;
		padding: 1.5rem;
	}

	.modal-flashcard-container {
		perspective: 1000px;
		width: 100%;
		height: 75vh;
		min-height: 500px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-flashcard {
		position: relative;
		width: 100%;
		max-width: 50rem;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 0.6s ease-in-out;
	}

	.modal-flashcard.flipped {
		transform: rotateY(180deg);
	}

	.modal-flashcard-face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--border));
		padding: 2rem;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		background-color: hsl(var(--card));
	}

	.modal-flashcard-back {
		background: linear-gradient(
			135deg,
			hsl(var(--primary) / 0.1) 0%,
			hsl(var(--secondary) / 0.2) 100%
		);
		transform: rotateY(180deg);
	}

	.modal-flashcard-content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
	}

	.modal-card-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: hsl(var(--foreground));
	}

	.modal-card-text {
		font-size: 1.3rem;
		line-height: 1.6;
		color: hsl(var(--foreground));
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		max-height: 60vh;
		overflow-y: auto;
		padding: 1rem;
	}

	.modal-flip-button {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		z-index: 1;
		border-radius: 0.75rem;
	}

	.modal-flip-button:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
	}

	.modal-card-tags {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.modal-controls {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.modal-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border));
		background-color: hsl(var(--card));
		color: hsl(var(--foreground));
		cursor: pointer;
		transition: all 0.2s;
	}

	.modal-control:hover {
		background-color: hsl(var(--muted));
	}

	/* ===== FOOTER ===== */
	.grid-view-hint {
		margin-top: 2rem;
		text-align: center;
	}

	.keyboard-hints {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	/* ===== RESPONSIVE DESIGN ===== */
	@media (max-width: 390px) {
		.flashcards-grid {
			grid-template-columns: repeat(1, 1fr);
			gap: 1rem;
		}

		.flashcard-wrapper {
			height: 11rem;
		}

		.flashcard-face {
			padding: 1rem;
		}

		.card-text {
			font-size: 0.85rem;
		}

		.expand-button {
			padding: 0.375rem;
		}

		.modal-content {
			height: 95vh;
			width: 100vw;
			padding: 1rem;
		}

		.modal-flashcard-container {
			height: 70vh;
			min-height: 400px;
		}

		.modal-flashcard-face {
			padding: 1.5rem;
		}

		.modal-card-title {
			font-size: 1.25rem;
		}

		.modal-card-text {
			font-size: 1rem;
		}
	}

	@media (min-width: 768px) and (max-width: 1024px) {
		.flashcards-grid {
			grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		}
	}
</style>
