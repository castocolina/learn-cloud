<!--
@component
Quiz Navigation Component - Production Interactive Navigation for Quizzes and Exams

Features:
- Previous/Next/Submit button controls
- Smart button visibility (Submit replaces Next on last question)
- Progress indicator (X of Y questions)
- Answer validation before navigation
- Keyboard navigation support (Arrow keys + Enter)
- Touch-friendly buttons (≥44px for mobile)
- ARIA accessibility attributes
- Mobile-first responsive design

Usage:
	import QuizNavigation from "$lib/components/content/QuizNavigation.svelte";

	<QuizNavigation
		currentQuestionIndex={0}
		totalQuestions={10}
		questionsAnswered={5}
		allowReview={true}
		onPrevious={handlePrevious}
		onNext={handleNext}
		onSubmit={handleSubmit}
	/>
-->
<script lang="ts">
	import { ChevronLeft, ChevronRight, CircleCheckBig } from "lucide-svelte";

	// Props interface for type safety
	interface Props {
		/** Current question index (0-based) */
		currentQuestionIndex: number;

		/** Total number of questions in quiz/exam */
		totalQuestions: number;

		/** Number of questions answered */
		questionsAnswered: number;

		/** Whether user can navigate to previous questions */
		allowReview?: boolean;

		/** Whether current question has been answered (enables Next/Submit) */
		isCurrentAnswered?: boolean;

		/** Custom CSS classes */
		className?: string;

		/** Whether to show keyboard navigation hints */
		showKeyboardHints?: boolean;

		/** Callback for previous question navigation */
		onPrevious?: () => void;

		/** Callback for next question navigation */
		onNext?: () => void;

		/** Callback for quiz/exam submission */
		onSubmit?: () => void;
	}

	let {
		currentQuestionIndex,
		totalQuestions,
		questionsAnswered,
		allowReview = true,
		isCurrentAnswered = false,
		className = "",
		showKeyboardHints = true,
		onPrevious,
		onNext,
		onSubmit
	}: Props = $props();

	// Derived navigation state using Svelte 5 $derived
	let isFirstQuestion = $derived(currentQuestionIndex === 0);
	let isLastQuestion = $derived(currentQuestionIndex === totalQuestions - 1);
	let canGoBack = $derived(!isFirstQuestion && allowReview);
	let canProceed = $derived(isCurrentAnswered || allowReview);
	let progressPercentage = $derived(
		totalQuestions > 0 ? Math.round((questionsAnswered / totalQuestions) * 100) : 0
	);

	// Navigation handlers
	function handlePrevious(): void {
		if (canGoBack && onPrevious) {
			onPrevious();
		}
	}

	function handleNext(): void {
		if (canProceed && !isLastQuestion && onNext) {
			onNext();
		}
	}

	function handleSubmit(): void {
		if (canProceed && isLastQuestion && onSubmit) {
			onSubmit();
		}
	}

	// Keyboard navigation handler
	function handleKeydown(event: KeyboardEvent): void {
		// Only handle keyboard events when not in an input field
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		switch (event.key) {
			case "ArrowLeft":
				if (canGoBack) {
					event.preventDefault();
					handlePrevious();
				}
				break;
			case "ArrowRight":
				if (canProceed && !isLastQuestion) {
					event.preventDefault();
					handleNext();
				}
				break;
			case "Enter":
				if (isLastQuestion && canProceed) {
					event.preventDefault();
					handleSubmit();
				}
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<nav class="quiz-navigation {className}" aria-label="Quiz navigation">
	<!-- Navigation Buttons -->
	<div class="quiz-nav-buttons">
		<!-- Previous Button -->
		<button
			type="button"
			class="quiz-nav-button quiz-nav-previous"
			class:quiz-nav-disabled={!canGoBack}
			onclick={handlePrevious}
			disabled={!canGoBack}
			aria-label="Previous question"
			aria-disabled={!canGoBack}
		>
			<ChevronLeft class="quiz-nav-icon" size={20} aria-hidden="true" />
			<span class="quiz-nav-label">Previous</span>
		</button>

		<!-- Progress Indicator -->
		<div class="quiz-nav-progress" role="status" aria-live="polite" aria-atomic="true">
			<div class="quiz-nav-progress-text">
				<span class="quiz-nav-current">{currentQuestionIndex + 1}</span>
				<span class="quiz-nav-separator">of</span>
				<span class="quiz-nav-total">{totalQuestions}</span>
			</div>
			<div class="quiz-nav-progress-meta">
				<span class="quiz-nav-answered">{questionsAnswered} answered</span>
				<span class="quiz-nav-percentage">({progressPercentage}%)</span>
			</div>
		</div>

		<!-- Next or Submit Button -->
		{#if isLastQuestion}
			<button
				type="button"
				class="quiz-nav-button quiz-nav-submit"
				class:quiz-nav-disabled={!canProceed}
				onclick={handleSubmit}
				disabled={!canProceed}
				aria-label="Submit quiz"
				aria-disabled={!canProceed}
			>
				<span class="quiz-nav-label">Submit</span>
				<CircleCheckBig class="quiz-nav-icon" size={20} aria-hidden="true" />
			</button>
		{:else}
			<button
				type="button"
				class="quiz-nav-button quiz-nav-next"
				class:quiz-nav-disabled={!canProceed}
				onclick={handleNext}
				disabled={!canProceed}
				aria-label="Next question"
				aria-disabled={!canProceed}
			>
				<span class="quiz-nav-label">Next</span>
				<ChevronRight class="quiz-nav-icon" size={20} aria-hidden="true" />
			</button>
		{/if}
	</div>

	<!-- Keyboard Hints (conditional) -->
	{#if showKeyboardHints && allowReview}
		<div class="quiz-nav-hints" aria-label="Keyboard shortcuts">
			<span class="quiz-nav-hint-text">Use arrow keys to navigate • Enter to submit</span>
		</div>
	{/if}

	<!-- Visual Progress Bar -->
	<div
		class="quiz-nav-progress-bar"
		role="progressbar"
		aria-valuenow={progressPercentage}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-label="Quiz progress"
		style="--progress: {progressPercentage}%"
	>
		<div class="quiz-nav-progress-fill"></div>
	</div>
</nav>

<style>
	.quiz-navigation {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		background: hsl(var(--background));
		border-top: 1px solid hsl(var(--border));
	}

	.quiz-nav-buttons {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.quiz-nav-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 44px;
		min-width: 44px;
		padding: 0.75rem 1.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		border-radius: 9999px;
		border: 2px solid;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		touch-action: manipulation;
		letter-spacing: 0.025em;
	}

	.quiz-nav-previous {
		background: linear-gradient(135deg, hsl(var(--slate-600)) 0%, hsl(var(--slate-700)) 100%);
		color: hsl(var(--slate-50));
		border-color: hsl(var(--slate-600));
	}

	.quiz-nav-previous:hover:not(:disabled) {
		background: linear-gradient(135deg, hsl(var(--slate-700)) 0%, hsl(var(--slate-800)) 100%);
		border-color: hsl(var(--slate-700));
		box-shadow: 0 4px 12px hsl(var(--slate-900) / 0.3);
		margin-top: -1px;
		margin-bottom: 1px;
	}

	.quiz-nav-next {
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
		color: hsl(var(--primary-foreground));
		border-color: hsl(var(--primary));
	}

	.quiz-nav-next:hover:not(:disabled) {
		background: linear-gradient(
			135deg,
			hsl(var(--primary) / 0.9) 0%,
			hsl(var(--primary) / 0.7) 100%
		);
		border-color: hsl(var(--primary) / 0.9);
		box-shadow: 0 4px 12px hsl(var(--primary) / 0.4);
		margin-top: -1px;
		margin-bottom: 1px;
	}

	.quiz-nav-submit {
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-2)) 100%);
		color: hsl(var(--primary-foreground));
		border-color: hsl(var(--primary));
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.quiz-nav-submit:hover:not(:disabled) {
		background: linear-gradient(
			135deg,
			hsl(var(--primary) / 0.95) 0%,
			hsl(var(--chart-2) / 0.95) 100%
		);
		border-color: hsl(var(--primary) / 0.9);
		box-shadow: 0 6px 16px hsl(var(--primary) / 0.5);
		margin-top: -2px;
		margin-bottom: 2px;
	}

	.quiz-nav-button:active:not(:disabled) {
		margin-top: 1px;
		margin-bottom: -1px;
	}

	.quiz-nav-button:focus-visible {
		outline: 2px solid hsl(var(--primary));
		outline-offset: 2px;
	}

	.quiz-nav-disabled {
		cursor: not-allowed;
		pointer-events: none;
		color: hsl(var(--muted-foreground));
		border-color: hsl(var(--muted));
		background-color: hsl(var(--muted) / 0.3);
	}

	.quiz-nav-icon {
		flex-shrink: 0;
	}

	.quiz-nav-label {
		white-space: nowrap;
	}

	/* Progress Indicator */
	.quiz-nav-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		text-align: center;
	}

	.quiz-nav-progress-text {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.quiz-nav-current {
		color: hsl(var(--primary));
		font-size: 1.25rem;
	}

	.quiz-nav-separator {
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
	}

	.quiz-nav-total {
		color: hsl(var(--foreground));
	}

	.quiz-nav-progress-meta {
		display: flex;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	/* Keyboard Hints */
	.quiz-nav-hints {
		display: flex;
		justify-content: center;
		padding: 0.5rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.25rem;
	}

	.quiz-nav-hint-text {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		text-align: center;
	}

	/* Progress Bar */
	.quiz-nav-progress-bar {
		width: 100%;
		height: 8px;
		background: hsl(var(--muted));
		border-radius: 9999px;
		overflow: hidden;
	}

	.quiz-nav-progress-fill {
		height: 100%;
		background: hsl(var(--primary));
		transition: width 0.3s ease-in-out;
		border-radius: 9999px;
		width: var(--progress, 0%);
	}

	/* Mobile Responsive (≤390px) */
	@media (max-width: 390px) {
		.quiz-navigation {
			padding: 1rem;
			gap: 0.75rem;
		}

		.quiz-nav-buttons {
			flex-wrap: wrap;
			gap: 0.75rem;
		}

		.quiz-nav-button {
			padding: 0.625rem 1rem;
			font-size: 0.8125rem;
		}

		.quiz-nav-label {
			display: none;
		}

		.quiz-nav-previous,
		.quiz-nav-next,
		.quiz-nav-submit {
			padding: 0.75rem;
		}

		.quiz-nav-progress {
			order: -1;
			width: 100%;
		}

		.quiz-nav-hints {
			display: none;
		}
	}

	/* Tablet and up */
	@media (min-width: 768px) {
		.quiz-navigation {
			padding: 2rem;
		}

		.quiz-nav-button {
			min-width: 120px;
		}
	}
</style>
