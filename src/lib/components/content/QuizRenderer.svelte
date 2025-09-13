<script lang="ts">
	import { ArrowRight, Check, CircleCheck, CircleX, Clock, RotateCcw } from "lucide-svelte";
	import type { QuizContent } from "$data/types.js";

	interface Props {
		content: QuizContent;
	}

	let { content }: Props = $props();

	// Quiz state
	let currentQuestion = $state(0);
	let answers = $state<Array<number | number[]>>([]);
	let showResults = $state(false);
	let startTime = $state(Date.now());
	let showExplanation = $state(false);
	let showExplanationText = $state(false);

	// Derived state
	const totalQuestions = $derived(content.quiz.questions.length);
	const currentQuestionData = $derived(content.quiz.questions[currentQuestion]);
	const isMultipleChoice = $derived(Array.isArray(currentQuestionData.correct));
	const timeElapsed = $derived(Math.floor((Date.now() - startTime) / 1000));

	const hasAnswer = $derived(() => {
		const answer = answers[currentQuestion];
		if (isMultipleChoice) {
			return Array.isArray(answer) && answer.length > 0;
		}
		return answer !== undefined && answer !== null;
	});

	const score = $derived(() => {
		let correct = 0;
		for (let i = 0; i < content.quiz.questions.length; i++) {
			const userAnswer = answers[i];
			const correctAnswer = content.quiz.questions[i].correct;

			if (Array.isArray(correctAnswer)) {
				// Multiple choice question
				if (Array.isArray(userAnswer)) {
					const sortedUser = [...userAnswer].sort();
					const sortedCorrect = [...correctAnswer].sort();
					if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
						correct++;
					}
				}
			} else {
				// Single choice question
				if (userAnswer === correctAnswer) {
					correct++;
				}
			}
		}
		return Math.round((correct / content.quiz.questions.length) * 100);
	});

	const isPassed = $derived(score() >= content.quiz.passingScore);

	// Functions
	function selectAnswer(optionIndex: number) {
		if (isMultipleChoice) {
			const currentAnswers = (answers[currentQuestion] as number[]) || [];
			const answerIndex = currentAnswers.indexOf(optionIndex);

			if (answerIndex > -1) {
				// Remove answer
				const newAnswers = [...currentAnswers];
				newAnswers.splice(answerIndex, 1);
				answers[currentQuestion] = newAnswers;
			} else {
				// Add answer
				answers[currentQuestion] = [...currentAnswers, optionIndex];
			}
		} else {
			answers[currentQuestion] = optionIndex;
		}

		showExplanation = true;
		showExplanationText = false;
	}

	function isSelected(optionIndex: number): boolean {
		const answer = answers[currentQuestion];
		if (isMultipleChoice) {
			return Array.isArray(answer) && answer.includes(optionIndex);
		}
		return answer === optionIndex;
	}

	function nextQuestion() {
		if (currentQuestion < totalQuestions - 1) {
			currentQuestion++;
			showExplanation = false;
			showExplanationText = false;
		}
	}

	function previousQuestion() {
		if (currentQuestion > 0) {
			currentQuestion--;
			showExplanation = answers[currentQuestion] !== undefined;
			showExplanationText = false;
		}
	}

	function submitQuiz() {
		showResults = true;
	}

	function restartQuiz() {
		currentQuestion = 0;
		answers = [];
		showResults = false;
		startTime = Date.now();
		showExplanation = false;
		showExplanationText = false;
	}

	function toggleExplanation() {
		showExplanationText = !showExplanationText;
	}

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	}
</script>

<!-- Quiz content -->
<article class="quiz-container">
	<!-- Header with progress -->
	<header class="quiz-header">
		<h1 class="quiz-title">{content.title}</h1>
		{#if content.summary}
			<p class="quiz-description">{content.summary}</p>
		{/if}

		<div class="quiz-progress-bar">
			<div class="progress-info">
				<label class="progress-label" for="quiz-progress">Progress</label>
				<div
					class="progress-track"
					role="progressbar"
					aria-valuenow={currentQuestion + 1}
					aria-valuemin={1}
					aria-valuemax={totalQuestions}
					id="quiz-progress"
				>
					<div
						class="progress-fill"
						style="width: {((currentQuestion + 1) / totalQuestions) * 100}%"
					></div>
				</div>
			</div>
			<div class="progress-stats">
				<span>{currentQuestion + 1} of {totalQuestions}</span>
				<Clock size={16} />
				<span>{formatTime(timeElapsed)}</span>
			</div>
		</div>
	</header>

	{#if !showResults}
		<!-- Current question -->
		<section class="question-section" aria-live="polite">
			<div class="question-card">
				<h2 class="question-text">{currentQuestionData.question}</h2>

				<div class="answers-list" role="group" aria-labelledby="question-{currentQuestion}">
					{#each currentQuestionData.options as option, index}
						<button
							type="button"
							class="answer-button {isSelected(index) ? 'selected' : ''}"
							onclick={() => selectAnswer(index)}
							aria-pressed={isSelected(index)}
							aria-describedby="question-{currentQuestion}"
						>
							<div class="answer-indicator">
								{#if isMultipleChoice}
									<div class="checkbox-style {isSelected(index) ? 'selected' : ''}">
										{#if isSelected(index)}
											<Check size={12} />
										{/if}
									</div>
								{:else}
									<div class="radio-style {isSelected(index) ? 'selected' : ''}"></div>
								{/if}
							</div>
							<span class="answer-text">{option}</span>
						</button>
					{/each}
				</div>

				<!-- Show explanation if question is answered -->
				{#if showExplanation && currentQuestionData.explanation}
					<div class="explanation-section">
						<button class="show-explanation" onclick={toggleExplanation} type="button">
							{showExplanationText ? "Hide" : "Show"} Explanation
						</button>
						{#if showExplanationText}
							<div class="explanation-content">
								<p>{currentQuestionData.explanation}</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>

		<!-- Navigation -->
		<nav class="quiz-navigation">
			<button
				type="button"
				class="nav-button secondary"
				onclick={previousQuestion}
				disabled={currentQuestion === 0}
			>
				Previous
			</button>

			<button
				type="button"
				class="nav-button primary"
				onclick={currentQuestion === totalQuestions - 1 ? submitQuiz : nextQuestion}
				disabled={!hasAnswer}
			>
				{currentQuestion === totalQuestions - 1 ? "Submit Quiz" : "Next"}
			</button>
		</nav>
	{:else}
		<!-- Results screen -->
		<section class="results-section" aria-live="polite">
			<header class="results-header">
				<div class="score-icon">
					{#if isPassed}
						<CircleCheck size={48} class="text-green-500" />
						<h2 class="score-text passed">Passed!</h2>
					{:else}
						<CircleX size={48} class="text-red-500" />
						<h2 class="score-text failed">Not Passed</h2>
					{/if}

					<div class="score-details">
						<p class="score-percentage">{score()}%</p>
						<p class="score-info">
							{content.quiz.questions.filter((_, i) => {
								const userAnswer = answers[i];
								const correctAnswer = content.quiz.questions[i].correct;
								if (Array.isArray(correctAnswer)) {
									if (Array.isArray(userAnswer)) {
										return (
											JSON.stringify([...userAnswer].sort()) ===
											JSON.stringify([...correctAnswer].sort())
										);
									}
									return false;
								}
								return userAnswer === correctAnswer;
							}).length} out of {totalQuestions} correct
						</p>
						<p class="time-info">
							Completed in {formatTime(timeElapsed)}
						</p>
					</div>
				</div>
			</header>

			<div class="results-actions">
				<button type="button" class="action-button secondary" onclick={restartQuiz}>
					<RotateCcw size={16} />
					Try Again
				</button>

				{#if isPassed}
					<button
						type="button"
						class="action-button primary"
						onclick={() => {
							// Navigate to next lesson or unit
							console.log("Continue to next lesson");
						}}
					>
						<ArrowRight size={16} />
						Continue
					</button>
				{/if}
			</div>
		</section>
	{/if}
</article>
