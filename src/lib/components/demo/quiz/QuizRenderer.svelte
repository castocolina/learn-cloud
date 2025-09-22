<!--
@component
Comprehensive Interactive Quiz System for Cloud-Native Learning Platform

QUIZ SYSTEM STANDARDS:

1. QUESTION TYPES SUPPORTED:
   - Multiple Choice (single or multi-select)
   - True/False
   - Drag and Drop
   - Code Completion

2. CODE COMPLETION QUESTION STANDARDS (MANDATORY):
   - Use exactly 5 underscores (_____) for ALL code completion blanks
   - Pattern /(_{3,})/g matches 3+ underscores for forward compatibility
   - NEVER mix different underscore counts in same question
   - Number of blanks must equal number of _____ patterns in code snippet
   - Example: "Complete: kind: _____\nreplicas: _____" requires 2 blank definitions

3. INTERACTIVE QUIZ REQUIREMENTS:
   - Single question display with navigation controls
   - Timer functionality with configurable limits and warnings
   - Automatic scoring with detailed analytics
   - Progress tracking and question navigation
   - Pass/fail determination (80% threshold for quizzes, 70% for exams)
   - Restart functionality that clears all answers

4. NAVIGATION STANDARDS:
   - Previous/Next buttons with smart visibility
   - Submit shown only on last question
   - Progress indicator: "Question X of Y"
   - Keyboard navigation: Arrow keys + Enter
   - Auto-advance for True/False if allowReview=false

5. ASSESSMENT CONFIGURATION:
   - Quizzes: 5 questions, 80% required to pass
   - Unit Final Exams: 10-20 questions, 70% required to pass
   - Question randomization support
   - Option randomization for multiple choice

6. MOBILE-FIRST DESIGN:
   - Touch-friendly navigation buttons (44px+ targets)
   - Responsive layout for narrow screens (≤390px)
   - Swipe gesture support for question navigation
   - Collapsible progress indicators on mobile

7. ACCESSIBILITY FEATURES:
   - ARIA labels and screen reader support
   - Keyboard navigation with focus management
   - High contrast for visual elements
   - Proper semantic markup for questions

This component consumes quiz data from the TypeScript library and provides
a seamless, educational quiz experience following SvelteKit architecture patterns.
-->

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import type {
		Quiz,
		QuizQuestion,
		MultipleChoiceQuestion,
		TrueFalseQuestion,
		DragAndDropQuestion,
		CodeCompletionQuestion
	} from "$data/demo/content/quizzes/quiz-examples";
	import { QuestionType } from "$data/demo/content/quizzes/quiz-examples";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import QuestionRenderer from "./QuestionRenderer.svelte";
	import Timer from "./Timer.svelte";
	import ProgressIndicator from "./ProgressIndicator.svelte";
	import ResultsDisplay from "./ResultsDisplay.svelte";

	interface Props {
		quiz: Quiz;
		onComplete?: (results: QuizResults) => void;
		className?: string;
	}

	interface QuizResults {
		score: number;
		percentage: number;
		correct: number;
		total: number;
		passed: boolean;
		timeSpent: number;
		answers: UserAnswer[];
	}

	interface UserAnswer {
		questionId: string;
		answer: unknown;
		isCorrect: boolean;
		points: number;
		timeSpent: number;
	}

	interface QuizState {
		currentQuestionIndex: number;
		answers: SvelteMap<string, unknown>;
		startTime: number;
		questionStartTime: number;
		timeElapsed: number;
		isCompleted: boolean;
		results: QuizResults | null;
		isStarted: boolean;
	}

	let { quiz, onComplete, className = "" }: Props = $props();

	// Quiz state management using Svelte 5 runes
	let quizState = $state<QuizState>({
		currentQuestionIndex: 0,
		answers: new SvelteMap(),
		startTime: 0,
		questionStartTime: 0,
		timeElapsed: 0,
		isCompleted: false,
		results: null,
		isStarted: false
	});

	// Timer state
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let timeRemaining = $state(quiz.config.timing.timeLimit ? quiz.config.timing.timeLimit * 60 : 0);
	let isTimerExpired = $state(false);

	// Derived state
	let currentQuestion = $derived(quiz.questions[quizState.currentQuestionIndex]);
	let isFirstQuestion = $derived(quizState.currentQuestionIndex === 0);
	let isLastQuestion = $derived(quizState.currentQuestionIndex === quiz.questions.length - 1);
	let canProceed = $derived(
		quizState.answers.has(currentQuestion?.id) || quiz.config.progress.allowReview
	);
	let questionsAnswered = $derived(
		!quizState.isStarted ? 0 : quiz.questions.filter((q) => quizState.answers.has(q.id)).length
	);
	let progressPercentage = $derived(
		!quizState.isStarted ? 0 : (questionsAnswered / quiz.questions.length) * 100
	);

	// Initialize quiz when mounted (but don't start automatically)
	onMount(() => {
		// Just initialize, don't start automatically
	});

	// Cleanup timer on destroy
	onDestroy(() => {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	});

	function startQuiz(): void {
		const now = Date.now();
		quizState.startTime = now;
		quizState.questionStartTime = now;
		quizState.isStarted = true;

		// Randomize questions if configured
		if (quiz.config.progress.randomizeQuestions) {
			quiz.questions = shuffleArray([...quiz.questions]);
		}

		// Randomize options for multiple choice questions if configured
		if (quiz.config.progress.randomizeOptions) {
			quiz.questions.forEach((question) => {
				if (question.type === QuestionType.MULTIPLE_CHOICE) {
					const mcq = question as MultipleChoiceQuestion;
					const shuffled = shuffleOptionsWithCorrectMapping(mcq.options, mcq.correct);
					mcq.options = shuffled.options;
					mcq.correct = shuffled.correct;
				}
			});
		}

		// Start timer if configured
		if (quiz.config.timing.timeLimit && quiz.config.timing.showTimer) {
			startTimer();
		}
	}

	function startTimer(): void {
		if (!quiz.config.timing.timeLimit) return;

		timerInterval = setInterval(() => {
			timeRemaining -= 1;
			quizState.timeElapsed = Math.floor((Date.now() - quizState.startTime) / 1000);

			// Check for time warning
			const warningThreshold = quiz.config.timing.warningThreshold || 5;
			if (timeRemaining <= warningThreshold * 60 && timeRemaining > 0) {
				// Show warning (handled by Timer component)
			}

			// Check for time expiration
			if (timeRemaining <= 0) {
				isTimerExpired = true;
				completeQuiz();
			}
		}, 1000);
	}

	function handleAnswerChange(answer: unknown): void {
		const questionId = currentQuestion.id;
		quizState.answers.set(questionId, answer);

		// Auto-advance for certain question types if configured
		if (!quiz.config.progress.allowReview && currentQuestion.type === QuestionType.TRUE_FALSE) {
			setTimeout(() => {
				if (!isLastQuestion) {
					nextQuestion();
				}
			}, 500);
		}
	}

	function nextQuestion(): void {
		if (quizState.currentQuestionIndex < quiz.questions.length - 1) {
			recordQuestionTime();
			quizState.currentQuestionIndex++;
			quizState.questionStartTime = Date.now();
		}
	}

	function previousQuestion(): void {
		if (quizState.currentQuestionIndex > 0) {
			recordQuestionTime();
			quizState.currentQuestionIndex--;
			quizState.questionStartTime = Date.now();
		}
	}

	function recordQuestionTime(): void {
		// Track time spent on current question for analytics
		// Could store this for detailed analytics
	}

	function completeQuiz(): void {
		if (timerInterval) {
			clearInterval(timerInterval);
		}

		recordQuestionTime();
		const results = calculateResults();
		quizState.results = results;
		quizState.isCompleted = true;

		// Call completion callback if provided
		onComplete?.(results);
	}

	function calculateResults(): QuizResults {
		const userAnswers: UserAnswer[] = [];
		let totalPoints = 0;
		let earnedPoints = 0;

		quiz.questions.forEach((question) => {
			const userAnswer = quizState.answers.get(question.id);
			const isCorrect = checkAnswer(question, userAnswer);
			const points = isCorrect ? question.points : 0;

			userAnswers.push({
				questionId: question.id,
				answer: userAnswer,
				isCorrect,
				points,
				timeSpent: 0 // Could be calculated from stored data
			});

			totalPoints += question.points;
			earnedPoints += points;
		});

		const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
		const passed = percentage >= quiz.config.scoring.passingScore;

		return {
			score: earnedPoints,
			percentage: Math.round(percentage * 10) / 10,
			correct: userAnswers.filter((a) => a.isCorrect).length,
			total: quiz.questions.length,
			passed,
			timeSpent: Math.floor((Date.now() - quizState.startTime) / 1000),
			answers: userAnswers
		};
	}

	function checkAnswer(question: QuizQuestion, userAnswer: unknown): boolean {
		if (!userAnswer) return false;

		switch (question.type) {
			case QuestionType.MULTIPLE_CHOICE: {
				const mcq = question as MultipleChoiceQuestion;
				if (mcq.multipleSelection) {
					const correct = Array.isArray(mcq.correct) ? mcq.correct : [mcq.correct];
					const user = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
					return (
						correct.length === user.length &&
						correct.every((c) => user.includes(c)) &&
						user.every((u) => correct.includes(u))
					);
				} else {
					const correct = Array.isArray(mcq.correct) ? mcq.correct[0] : mcq.correct;
					return userAnswer === correct;
				}
			}
			case QuestionType.TRUE_FALSE: {
				const tfq = question as TrueFalseQuestion;
				return userAnswer === tfq.correct;
			}
			case QuestionType.DRAG_AND_DROP: {
				const ddq = question as DragAndDropQuestion;
				if (!Array.isArray(userAnswer)) return false;
				return ddq.correctMatches.every((match) =>
					(userAnswer as Array<{ itemId: string; targetId: string }>).some(
						(userMatch) =>
							userMatch.itemId === match.itemId && userMatch.targetId === match.targetId
					)
				);
			}
			case QuestionType.CODE_COMPLETION: {
				const ccq = question as CodeCompletionQuestion;
				if (!userAnswer || typeof userAnswer !== "object") return false;
				return ccq.blanks.every(
					(blank) =>
						(userAnswer as Record<string, string>)[blank.id] === blank.options[blank.correct]
				);
			}
			default:
				return false;
		}
	}

	function restartQuiz(): void {
		quizState = {
			currentQuestionIndex: 0,
			answers: new SvelteMap(),
			startTime: 0,
			questionStartTime: 0,
			timeElapsed: 0,
			isCompleted: false,
			results: null,
			isStarted: false
		};
		timeRemaining = quiz.config.timing.timeLimit ? quiz.config.timing.timeLimit * 60 : 0;
		isTimerExpired = false;
		startQuiz();
	}

	// Utility functions
	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function shuffleOptionsWithCorrectMapping(
		options: string[],
		correct: number | number[]
	): { options: string[]; correct: number | number[] } {
		const mapping = options.map((option, index) => ({ option, originalIndex: index }));
		const shuffled = shuffleArray(mapping);

		const newOptions = shuffled.map((item) => item.option);
		const indexMapping = new Map(shuffled.map((item, newIndex) => [item.originalIndex, newIndex]));

		let newCorrect: number | number[];
		if (Array.isArray(correct)) {
			newCorrect = correct.map((index) => indexMapping.get(index)!);
		} else {
			newCorrect = indexMapping.get(correct)!;
		}

		return { options: newOptions, correct: newCorrect };
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent): void {
		if (quizState.isCompleted) return;

		switch (event.key) {
			case "ArrowLeft":
				if (!isFirstQuestion && quiz.config.progress.allowReview) {
					event.preventDefault();
					previousQuestion();
				}
				break;
			case "ArrowRight":
				if (canProceed && !isLastQuestion) {
					event.preventDefault();
					nextQuestion();
				}
				break;
			case "Enter":
				if (isLastQuestion && canProceed) {
					event.preventDefault();
					completeQuiz();
				}
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="demo-quiz-container {className}" role="main" aria-label="Interactive Quiz">
	<!-- Quiz Header Card -->
	<Card class="demo-quiz-header-card">
		<CardHeader class="demo-quiz-card-header">
			<CardTitle class="demo-quiz-card-title">{quiz.title}</CardTitle>
			<p class="demo-quiz-card-description">{quiz.description}</p>

			<!-- Quiz Metadata Badges Row -->
			<div class="demo-quiz-metadata-badges">
				<!-- Difficulty Badge -->
				<Badge
					variant="secondary"
					class="demo-quiz-difficulty-badge demo-quiz-difficulty-{quiz.difficulty.toLowerCase()}"
				>
					{quiz.difficulty}
				</Badge>

				<!-- Category Badge -->
				<Badge variant="outline" class="demo-quiz-category-badge">
					{quiz.category}
				</Badge>

				<!-- Estimated Time Badge -->
				{#if quiz.estimatedTime}
					<Badge variant="outline" class="demo-quiz-time-badge">
						⏱️ {quiz.estimatedTime} min
					</Badge>
				{/if}
			</div>
		</CardHeader>

		<CardContent class="demo-quiz-card-content">
			<!-- Prerequisites -->
			{#if quiz.prerequisites && quiz.prerequisites.length > 0}
				<div class="demo-quiz-info-section">
					<h4 class="demo-quiz-info-title">📋 Prerequisites:</h4>
					<div class="demo-quiz-info-items">
						{#each quiz.prerequisites as prerequisite, index (index)}
							<Badge variant="secondary" class="demo-quiz-prerequisite-badge">
								{prerequisite}
							</Badge>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Learning Objectives -->
			{#if quiz.learningObjectives && quiz.learningObjectives.length > 0}
				<div class="demo-quiz-info-section">
					<h4 class="demo-quiz-info-title">🎯 Learning Objectives:</h4>
					<div class="demo-quiz-info-items">
						{#each quiz.learningObjectives as objective, index (index)}
							<Badge variant="secondary" class="demo-quiz-objective-badge">
								{objective}
							</Badge>
						{/each}
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>

	{#if !quizState.isStarted}
		<!-- Quiz Start Screen -->
		<div class="demo-quiz-start-screen">
			<div class="demo-quiz-info">
				<div class="demo-quiz-stats">
					<div class="demo-quiz-stat">
						<span class="demo-quiz-stat-label">Questions:</span>
						<span class="demo-quiz-stat-value">{quiz.questions.length}</span>
					</div>
					<div class="demo-quiz-stat">
						<span class="demo-quiz-stat-label">Points:</span>
						<span class="demo-quiz-stat-value">
							{quiz.questions.reduce((sum, q) => sum + q.points, 0)}
						</span>
					</div>
					{#if quiz.config.timing.timeLimit}
						<div class="demo-quiz-stat">
							<span class="demo-quiz-stat-label">Time Limit:</span>
							<span class="demo-quiz-stat-value">{quiz.config.timing.timeLimit} minutes</span>
						</div>
					{/if}
					<div class="demo-quiz-stat">
						<span class="demo-quiz-stat-label">Passing Score:</span>
						<span class="demo-quiz-stat-value">{quiz.config.scoring.passingScore}%</span>
					</div>
				</div>
			</div>

			<div class="demo-quiz-start-actions">
				<button
					type="button"
					class="demo-quiz-start-button"
					onclick={startQuiz}
					aria-label="Start quiz"
				>
					Start Quiz
				</button>
			</div>
		</div>
	{:else if !quizState.isCompleted}
		<!-- Quiz Active State -->
		{#if quiz.config.timing.showTimer && quiz.config.timing.timeLimit}
			<div class="demo-quiz-timer-container">
				<Timer
					{timeRemaining}
					timeLimit={quiz.config.timing.timeLimit * 60}
					warningThreshold={(quiz.config.timing.warningThreshold || 5) * 60}
					isExpired={isTimerExpired}
				/>
			</div>
		{/if}

		<!-- Progress Indicator -->
		<ProgressIndicator
			currentQuestion={quizState.currentQuestionIndex + 1}
			totalQuestions={quiz.questions.length}
			percentage={progressPercentage}
			{questionsAnswered}
		/>

		<!-- Question Content Card -->
		<div class="demo-quiz-card">
			<main class="demo-quiz-content">
				<QuestionRenderer
					question={currentQuestion}
					questionNumber={quizState.currentQuestionIndex + 1}
					userAnswer={quizState.answers.get(currentQuestion.id)}
					onAnswerChange={handleAnswerChange}
					allowMultipleSelection={currentQuestion.type === QuestionType.MULTIPLE_CHOICE
						? (currentQuestion as MultipleChoiceQuestion).multipleSelection
						: false}
				/>
			</main>
		</div>

		<!-- Navigation Controls -->
		<footer class="demo-quiz-navigation">
			<div class="demo-quiz-nav-buttons">
				<button
					type="button"
					class="demo-quiz-nav-prev"
					class:demo-quiz-nav-disabled={isFirstQuestion || !quiz.config.progress.allowReview}
					onclick={previousQuestion}
					disabled={isFirstQuestion || !quiz.config.progress.allowReview}
					aria-label="Previous question"
				>
					Previous
				</button>

				<div class="demo-quiz-progress-text">
					<span class="demo-quiz-current">{quizState.currentQuestionIndex + 1}</span>
					<span class="demo-quiz-separator">of</span>
					<span class="demo-quiz-total">{quiz.questions.length}</span>
				</div>

				{#if isLastQuestion}
					<button
						type="button"
						class="demo-quiz-nav-submit"
						class:demo-quiz-nav-disabled={!canProceed}
						onclick={completeQuiz}
						disabled={!canProceed}
						aria-label="Complete quiz"
					>
						Submit Quiz
					</button>
				{:else}
					<button
						type="button"
						class="demo-quiz-nav-next"
						class:demo-quiz-nav-disabled={!canProceed}
						onclick={nextQuestion}
						disabled={!canProceed}
						aria-label="Next question"
					>
						Next
					</button>
				{/if}
			</div>

			{#if quiz.config.progress.allowReview}
				<div class="demo-quiz-instructions">
					<span>Use arrow keys to navigate • Enter to submit</span>
				</div>
			{/if}
		</footer>
	{:else}
		<!-- Results Display -->
		<ResultsDisplay
			{quiz}
			results={quizState.results!}
			onRestart={restartQuiz}
			showCorrectAnswers={quiz.config.scoring.showCorrectAnswers}
		/>
	{/if}
</div>
