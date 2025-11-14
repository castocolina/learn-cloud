<script lang="ts">
	/**
	 * Quiz Engine Component (Task 8I - Production)
	 *
	 * Encapsulated quiz/exam engine that:
	 * - Receives question pool and configuration
	 * - Randomly selects questions (if configured)
	 * - Manages quiz state (current question, answers, score)
	 * - Integrates QuestionRenderer for question display
	 * - Integrates QuizNavigation for navigation
	 * - Calculates scores and shows results
	 * - Handles retry functionality
	 *
	 * Architecture:
	 * - Fully encapsulated - receives pool, renders complete quiz flow
	 * - Reusable for both quizzes and exams
	 * - Svelte 5 runes syntax
	 * - Type-safe with production types
	 *
	 * @component QuizEngine
	 */

	import type { AnyQuestion } from "$types";
	import QuestionRenderer from "./QuestionRenderer.svelte";
	import QuizNavigation from "./QuizNavigation.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { SvelteSet, SvelteMap } from "svelte/reactivity";

	interface QuizConfig {
		passingScore: number; // Percentage required to pass (0-100)
		timeLimit?: number; // Minutes (optional, 0 = unlimited)
		shuffleQuestions: boolean; // Shuffle question order
		showResults: boolean; // Show results screen after submission
		allowRetry: boolean; // Allow retrying the quiz
		questionsToShow: number; // 0 = show all, N = show N random questions
		randomizeOnRetry?: boolean; // Different questions on retry
	}

	interface Props {
		questionPool: AnyQuestion[];
		config: QuizConfig;
		title?: string;
	}

	let { questionPool, config, title = "Quiz" }: Props = $props();

	// ============================================================================
	// STATE MANAGEMENT
	// ============================================================================
	let quizState = $state<"in_progress" | "completed">("in_progress");
	let currentQuestionIndex = $state(0);
	// SvelteMap/SvelteSet are reactive - use .clear() instead of reassignment
	let userAnswers = new SvelteMap<number, unknown>();
	let answered = new SvelteSet<number>();
	let selectedQuestions = $state<AnyQuestion[]>([]);
	let timeRemaining = $state<number | null>(null);
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	// ============================================================================
	// QUESTION SELECTION
	// ============================================================================
	function selectQuestions(): AnyQuestion[] {
		const pool = [...questionPool];

		// If questionsToShow is 0 or >= pool size, use all questions
		if (config.questionsToShow === 0 || config.questionsToShow >= pool.length) {
			return config.shuffleQuestions ? shuffleArray(pool) : pool;
		}

		// Select N random questions
		const shuffled = shuffleArray(pool);
		return shuffled.slice(0, config.questionsToShow);
	}

	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function initializeQuiz() {
		selectedQuestions = selectQuestions();
		currentQuestionIndex = 0;
		userAnswers.clear(); // Use .clear() instead of reassignment for reactivity
		answered.clear();
		quizState = "in_progress";

		// Initialize timer if time limit is set
		if (config.timeLimit && config.timeLimit > 0) {
			timeRemaining = config.timeLimit * 60; // Convert to seconds
			startTimer();
		}
	}

	// Initialize on mount
	$effect(() => {
		if (selectedQuestions.length === 0) {
			initializeQuiz();
		}
	});

	// ============================================================================
	// TIMER MANAGEMENT
	// ============================================================================
	function startTimer() {
		if (timerInterval) clearInterval(timerInterval);

		timerInterval = setInterval(() => {
			if (timeRemaining !== null && timeRemaining > 0) {
				timeRemaining--;
			} else if (timeRemaining === 0) {
				// Time's up - auto submit
				handleSubmit();
			}
		}, 1000);
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	// Cleanup timer on unmount
	$effect(() => {
		return () => {
			if (timerInterval) clearInterval(timerInterval);
		};
	});

	// ============================================================================
	// NAVIGATION HANDLERS
	// ============================================================================
	function handlePrevious() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
		}
	}

	function handleNext() {
		if (currentQuestionIndex < selectedQuestions.length - 1) {
			currentQuestionIndex++;
		}
	}

	function handleSubmit() {
		if (timerInterval) clearInterval(timerInterval);
		quizState = "completed";
	}

	// ============================================================================
	// ANSWER HANDLERS
	// ============================================================================
	function handleAnswerChange(answer: unknown) {
		userAnswers.set(currentQuestionIndex, answer);

		// Update answered set
		if (!answered.has(currentQuestionIndex)) {
			answered.add(currentQuestionIndex);
		}
	}

	// ============================================================================
	// SCORING
	// ============================================================================
	function calculateScore(): { score: number; totalQuestions: number; percentage: number } {
		let correctCount = 0;
		const totalQuestions = selectedQuestions.length;

		selectedQuestions.forEach((question, index) => {
			const userAnswer = userAnswers.get(index);
			if (userAnswer === undefined) return;

			// Check if answer is correct based on question type
			const isCorrect = checkAnswer(question, userAnswer);
			if (isCorrect) correctCount++;
		});

		const percentage = Math.round((correctCount / totalQuestions) * 100);

		return {
			score: correctCount,
			totalQuestions,
			percentage
		};
	}

	function checkAnswer(question: AnyQuestion, userAnswer: unknown): boolean {
		switch (question.type) {
			case "single_choice":
				return userAnswer === question.correctAnswer;

			case "multiple_choice": {
				if (!Array.isArray(userAnswer)) return false;
				const sorted1 = [...userAnswer].sort();
				const sorted2 = [...question.correctAnswers].sort();
				return (
					sorted1.length === sorted2.length && sorted1.every((val, idx) => val === sorted2[idx])
				);
			}

			case "true_false":
				return userAnswer === question.correctAnswer;

			case "code_completion": {
				if (typeof userAnswer !== "object" || userAnswer === null) return false;
				const answers = userAnswer as Record<string, string>;
				return question.blanks.every((blank) => {
					const userBlankAnswer = answers[blank.id]?.trim().toLowerCase();
					const expectedAnswer = blank.expectedAnswer.trim().toLowerCase();
					return userBlankAnswer === expectedAnswer;
				});
			}

			case "short_answer": {
				if (typeof userAnswer !== "string") return false;
				const normalizedUser = question.caseSensitive
					? userAnswer.trim()
					: userAnswer.trim().toLowerCase();
				return question.acceptedAnswers.some((accepted) => {
					const normalizedAccepted = question.caseSensitive
						? accepted.trim()
						: accepted.trim().toLowerCase();
					return normalizedUser === normalizedAccepted;
				});
			}

			case "drag_and_drop": {
				if (typeof userAnswer !== "object" || userAnswer === null) return false;
				const placement = userAnswer as Record<string, string>;
				return question.items.every((item) => placement[item.id] === item.category);
			}

			default:
				return false;
		}
	}

	// ============================================================================
	// RETRY HANDLER
	// ============================================================================
	function handleRetry() {
		initializeQuiz();
	}

	// ============================================================================
	// DERIVED STATE
	// ============================================================================
	let totalQuestions = $derived(selectedQuestions.length);
	let questionsAnswered = $derived(answered.size);
	let isCurrentAnswered = $derived(answered.has(currentQuestionIndex));
	let currentQuestion = $derived(selectedQuestions[currentQuestionIndex]);
	let currentUserAnswer = $derived(userAnswers.get(currentQuestionIndex));

	// Results state
	let scoreData = $derived(quizState === "completed" ? calculateScore() : null);
	let passed = $derived(scoreData ? scoreData.percentage >= config.passingScore : false);
</script>

{#if quizState === "in_progress" && selectedQuestions.length > 0}
	<!-- IN-PROGRESS QUIZ -->
	<div class="quiz-engine">
		<!-- Timer (if enabled) -->
		{#if timeRemaining !== null}
			<div class="quiz-timer" class:timer-warning={timeRemaining < 60}>
				<span class="timer-icon">⏱️</span>
				<span class="timer-text">{formatTime(timeRemaining)}</span>
			</div>
		{/if}

		<!-- Question Area -->
		<Card class="quiz-question-card">
			<CardContent class="quiz-question-content">
				{#if currentQuestion}
					<QuestionRenderer
						question={currentQuestion}
						questionNumber={currentQuestionIndex + 1}
						userAnswer={currentUserAnswer}
						onAnswerChange={handleAnswerChange}
					/>
				{/if}
			</CardContent>
		</Card>

		<!-- Navigation -->
		<QuizNavigation
			{currentQuestionIndex}
			{totalQuestions}
			{questionsAnswered}
			allowReview={true}
			{isCurrentAnswered}
			showKeyboardHints={true}
			onPrevious={handlePrevious}
			onNext={handleNext}
			onSubmit={handleSubmit}
		/>
	</div>
{:else if quizState === "completed" && config.showResults && scoreData}
	<!-- RESULTS SCREEN -->
	<div class="quiz-results">
		<Card class="results-card">
			<CardHeader class="results-header">
				<CardTitle class="results-title">{title} - Results</CardTitle>
			</CardHeader>

			<CardContent class="results-content">
				<!-- Score Summary -->
				<div class="score-summary">
					<div class="score-circle" class:score-passed={passed} class:score-failed={!passed}>
						<div class="score-percentage">{scoreData.percentage}%</div>
						<div class="score-label">{passed ? "PASSED" : "FAILED"}</div>
					</div>

					<div class="score-details">
						<p class="score-detail-item">
							<span class="score-detail-label">Correct Answers:</span>
							<span class="score-detail-value">
								{scoreData.score} / {scoreData.totalQuestions}
							</span>
						</p>
						<p class="score-detail-item">
							<span class="score-detail-label">Passing Score:</span>
							<span class="score-detail-value">{config.passingScore}%</span>
						</p>
					</div>
				</div>

				<!-- Question Review -->
				<div class="question-review">
					<h3 class="review-title">Question Review</h3>
					<div class="review-list">
						{#each selectedQuestions as question, index (question.id)}
							{@const userAnswer = userAnswers.get(index)}
							{@const isCorrect =
								userAnswer !== undefined ? checkAnswer(question, userAnswer) : false}
							{@const wasAnswered = answered.has(index)}

							<div class="review-item">
								<div class="review-item-header">
									<span class="review-item-number">Question {index + 1}</span>
									<Badge
										variant={isCorrect ? "default" : wasAnswered ? "destructive" : "secondary"}
									>
										{isCorrect ? "✓ Correct" : wasAnswered ? "✗ Incorrect" : "○ Skipped"}
									</Badge>
								</div>

								<p class="review-item-question">{question.question}</p>

								{#if question.explanation}
									<div class="review-item-explanation">
										<strong>Explanation:</strong>
										{question.explanation}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- Actions -->
				<div class="results-actions">
					{#if config.allowRetry}
						<Button onclick={handleRetry} variant="default">
							{config.randomizeOnRetry ? "Try New Questions" : "Retry Quiz"}
						</Button>
					{/if}
				</div>
			</CardContent>
		</Card>
	</div>
{:else if quizState === "completed" && !config.showResults}
	<!-- SUBMISSION CONFIRMATION (no results shown) -->
	<div class="quiz-submitted">
		<Card class="submitted-card">
			<CardContent class="submitted-content">
				<div class="submitted-icon">✓</div>
				<h2 class="submitted-title">{title} Submitted</h2>
				<p class="submitted-message">
					Your answers have been submitted successfully. Results will be available later.
				</p>

				{#if config.allowRetry}
					<div class="submitted-actions">
						<Button onclick={handleRetry} variant="default">Take Again</Button>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
{/if}

<style>
	/* ============================================================================ */
	/* QUIZ ENGINE - IN PROGRESS */
	/* ============================================================================ */
	.quiz-engine {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.quiz-timer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: hsl(var(--primary) / 0.1);
		border: 1px solid hsl(var(--primary));
		border-radius: 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: hsl(var(--primary));
	}

	.timer-warning {
		background: hsl(var(--destructive) / 0.1);
		border-color: hsl(var(--destructive));
		color: hsl(var(--destructive));
		animation: pulse 1s ease-in-out infinite;
	}

	/* Timer warning pulse animation - uses color opacity instead of filter to avoid stacking context */
	@keyframes pulse {
		0%,
		100% {
			color: hsl(var(--destructive));
		}
		50% {
			color: hsl(var(--destructive) / 0.7);
		}
	}

	.timer-icon {
		font-size: 1.25rem;
	}

	.timer-text {
		font-variant-numeric: tabular-nums;
	}

	/* ShadCN Card component classes require :global() to apply styles */
	:global(.quiz-question-card) {
		min-height: 300px;
	}

	:global(.quiz-question-content) {
		padding: 2rem;
	}

	/* ============================================================================ */
	/* RESULTS SCREEN */
	/* ============================================================================ */
	.quiz-results {
		display: flex;
		justify-content: center;
		padding: 2rem 0;
	}

	:global(.results-card) {
		width: 100%;
		max-width: 800px;
	}

	:global(.results-header) {
		text-align: center;
		padding: 2rem 2rem 1rem 2rem;
		border-bottom: 1px solid hsl(var(--border));
	}

	:global(.results-title) {
		font-size: 1.5rem;
		font-weight: 700;
		color: hsl(var(--foreground));
	}

	:global(.results-content) {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* Score Summary */
	.score-summary {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.5rem;
	}

	.score-circle {
		flex-shrink: 0;
		width: 120px;
		height: 120px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		border: 4px solid hsl(var(--border));
		background: hsl(var(--background));
	}

	.score-passed {
		border-color: hsl(var(--primary));
		background: hsl(var(--primary) / 0.1);
	}

	.score-failed {
		border-color: hsl(var(--destructive));
		background: hsl(var(--destructive) / 0.1);
	}

	.score-percentage {
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
	}

	.score-passed .score-percentage {
		color: hsl(var(--primary));
	}

	.score-failed .score-percentage {
		color: hsl(var(--destructive));
	}

	.score-label {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	.score-passed .score-label {
		color: hsl(var(--primary));
	}

	.score-failed .score-label {
		color: hsl(var(--destructive));
	}

	.score-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.score-detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		margin: 0;
	}

	.score-detail-label {
		font-weight: 500;
		color: hsl(var(--muted-foreground));
	}

	.score-detail-value {
		font-weight: 600;
		font-size: 1.125rem;
		color: hsl(var(--foreground));
	}

	/* Question Review */
	.question-review {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.review-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.review-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.review-item {
		padding: 1.5rem;
		background: hsl(var(--muted) / 0.2);
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
	}

	.review-item-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.review-item-number {
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.review-item-question {
		margin: 0 0 1rem 0;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: hsl(var(--foreground));
	}

	.review-item-explanation {
		margin-top: 1rem;
		padding: 1rem;
		background: hsl(var(--primary) / 0.05);
		border-left: 3px solid hsl(var(--primary));
		border-radius: 0.25rem;
		font-size: 0.875rem;
		line-height: 1.6;
		color: hsl(var(--muted-foreground));
	}

	.review-item-explanation strong {
		color: hsl(var(--foreground));
	}

	.results-actions {
		display: flex;
		justify-content: center;
		padding-top: 1rem;
	}

	/* ============================================================================ */
	/* SUBMITTED SCREEN */
	/* ============================================================================ */
	.quiz-submitted {
		display: flex;
		justify-content: center;
		padding: 2rem 0;
	}

	:global(.submitted-card) {
		width: 100%;
		max-width: 600px;
	}

	:global(.submitted-content) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 3rem 2rem;
		text-align: center;
	}

	.submitted-icon {
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		color: hsl(var(--primary));
		background: hsl(var(--primary) / 0.1);
		border: 3px solid hsl(var(--primary));
		border-radius: 50%;
	}

	.submitted-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.submitted-message {
		font-size: 1rem;
		color: hsl(var(--muted-foreground));
		max-width: 400px;
		margin: 0;
	}

	.submitted-actions {
		margin-top: 1rem;
	}

	/* ============================================================================ */
	/* MOBILE RESPONSIVE */
	/* ============================================================================ */
	@media (max-width: 390px) {
		:global(.quiz-question-content) {
			padding: 1rem;
		}

		:global(.results-content) {
			padding: 1rem;
		}

		.score-summary {
			flex-direction: column;
			text-align: center;
			padding: 1.5rem;
		}

		.score-circle {
			width: 100px;
			height: 100px;
		}

		.score-percentage {
			font-size: 1.75rem;
		}

		.review-item {
			padding: 1rem;
		}

		:global(.submitted-content) {
			padding: 2rem 1rem;
		}

		.submitted-icon {
			width: 60px;
			height: 60px;
			font-size: 2rem;
		}
	}
</style>
