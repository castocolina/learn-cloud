<!--
@component
Results Display for Interactive Quiz System

Displays comprehensive quiz results with analytics:
- Overall score and percentage with visual indicators
- Pass/fail status with appropriate styling
- Time spent analysis and performance metrics
- Question-by-question breakdown with answers
- Option to restart quiz or view correct answers
- Accessibility support and responsive design

Provides detailed feedback to help users understand their performance.
-->

<script lang="ts">
	import type { Quiz, DragAndDropQuestion } from "$data/demo/content/quizzes/quiz-examples";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";

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

	interface Props {
		quiz: Quiz;
		results: QuizResults;
		onRestart: () => void;
		showCorrectAnswers: boolean;
		className?: string;
	}

	let { quiz, results, onRestart, showCorrectAnswers, className = "" }: Props = $props();

	// Derived state for display
	let performanceLevel = $derived(() => {
		if (results.percentage >= 90) return "excellent";
		if (results.percentage >= 80) return "good";
		if (results.percentage >= 70) return "fair";
		if (results.percentage >= 60) return "poor";
		return "failing";
	});

	let performanceClass = $derived(() => {
		switch (performanceLevel()) {
			case "excellent":
				return "demo-results-excellent";
			case "good":
				return "demo-results-good";
			case "fair":
				return "demo-results-fair";
			case "poor":
				return "demo-results-poor";
			case "failing":
				return "demo-results-failing";
			default:
				return "demo-results-fair";
		}
	});

	let performanceIcon = $derived(() => {
		switch (performanceLevel()) {
			case "excellent":
				return "🌟";
			case "good":
				return "👍";
			case "fair":
				return "👌";
			case "poor":
				return "😐";
			case "failing":
				return "😞";
			default:
				return "📊";
		}
	});

	let performanceMessage = $derived(() => {
		switch (performanceLevel()) {
			case "excellent":
				return "Outstanding performance! You have mastered this topic.";
			case "good":
				return "Great job! You have a strong understanding of the material.";
			case "fair":
				return "Good work! You understand the basics but could improve in some areas.";
			case "poor":
				return "You passed, but there's room for improvement. Consider reviewing the material.";
			case "failing":
				return "You didn't pass this time. Don't worry - review the material and try again!";
			default:
				return "Quiz completed.";
		}
	});

	let timeFormatted = $derived(() => {
		const minutes = Math.floor(results.timeSpent / 60);
		const seconds = results.timeSpent % 60;
		if (minutes > 0) {
			return `${minutes}m ${seconds}s`;
		}
		return `${seconds}s`;
	});

	let averageTimePerQuestion = $derived(() => {
		const avgSeconds = Math.round(results.timeSpent / results.total);
		return `${avgSeconds}s`;
	});

	// Show detailed answers state
	let showDetails = $state(false);

	function getQuestionById(questionId: string) {
		return quiz.questions.find((q) => q.id === questionId);
	}

	function formatUserAnswer(answer: unknown, question: unknown): string {
		if (!question || answer === undefined || answer === null) return "No answer";

		const q = question as any;

		switch (q.type) {
			case "multiple_choice":
				if (!q.options) {
					console.warn("Multiple choice question missing options:", q);
					return "Invalid question structure";
				}
				if (Array.isArray(answer)) {
					return (answer as number[])
						.map((index) => {
							const option = q.options[index];
							if (!option) {
								console.warn("Invalid option index:", index, "for question:", q);
								return `Unknown option (${index})`;
							}
							return option;
						})
						.join(", ");
				}
				const singleOption = q.options[answer as number];
				if (!singleOption) {
					console.warn("Invalid single option index:", answer, "for question:", q);
					return `Unknown option (${answer})`;
				}
				return singleOption;
			case "true_false":
				if (typeof answer === "boolean") {
					return answer ? "True" : "False";
				}
				return "No answer";
			case "drag_and_drop":
				if (Array.isArray(answer) && answer.length > 0) {
					const matches = (answer as Array<{ itemId: string; targetId: string }>).map((match) => {
						const item = q.items?.find((i: any) => i.id === match.itemId);
						const target = q.targets?.find((t: any) => t.id === match.targetId);
						return {
							item: item?.content || "Unknown Item",
							target: target?.label || "Unknown Target"
						};
					});

					return matches.map((match) => `${match.item} → ${match.target}`).join(", ");
				}
				return "No matches";
			case "code_completion":
				if (typeof answer === "object" && answer !== null) {
					const entries = Object.entries(answer as Record<string, string>)
						.filter(([, value]) => value && value.trim() !== "")
						.map(([key, value]) => `${key}: "${value}"`);

					if (entries.length > 0) {
						return entries.join(", ");
					}
				}
				return "No code entered";
			default:
				console.warn("Unknown question type:", q.type);
				return String(answer);
		}
	}

	function getCorrectAnswer(question: unknown): string {
		const q = question as any;

		switch (q.type) {
			case "multiple_choice":
				if (!q.options) return "Invalid question structure";
				if (Array.isArray(q.correct)) {
					return q.correct.map((index: number) => q.options[index] || `Option ${index}`).join(", ");
				}
				return q.options[q.correct] || `Option ${q.correct}`;
			case "true_false":
				return q.correct ? "True" : "False";
			case "drag_and_drop":
				if (!q.correctMatches || !q.items || !q.targets) return "Invalid question structure";
				return q.correctMatches
					.map(
						(match: any) =>
							`${q.items.find((i: any) => i.id === match.itemId)?.content || "Unknown"} → ${q.targets.find((t: any) => t.id === match.targetId)?.content || "Unknown"}`
					)
					.join(", ");
			case "code_completion":
				if (!q.blanks) return "Invalid question structure";
				return q.blanks
					.map((blank: any) => `${blank.id}: ${blank.options?.[blank.correct] || blank.correct}`)
					.join(", ");
			default:
				console.warn("Unknown question type in getCorrectAnswer:", q.type);
				return "N/A";
		}
	}
</script>

<div class="demo-results-display {className}" role="main" aria-label="Quiz results">
	<!-- Results Header -->
	<div class="demo-results-header {performanceClass}">
		<div class="demo-results-icon">{performanceIcon()}</div>
		<div class="demo-results-title-section">
			<h1 class="demo-results-title">Quiz Complete!</h1>
			<p class="demo-results-subtitle">{quiz.title}</p>
		</div>
		<div class="demo-results-status">
			<Badge variant={results.passed ? "default" : "destructive"} class="demo-results-badge">
				{results.passed ? "PASSED" : "FAILED"}
			</Badge>
		</div>
	</div>

	<!-- Performance Message -->
	<div class="demo-results-message {performanceClass}">
		<p>{performanceMessage()}</p>
	</div>

	<!-- Score Overview -->
	<div class="demo-results-overview">
		<Card class="demo-results-score-card">
			<CardHeader>
				<CardTitle class="demo-results-card-title">Your Score</CardTitle>
			</CardHeader>
			<CardContent class="demo-results-score-content">
				<div class="demo-results-score-main">
					<span class="demo-results-score-number {performanceClass}">
						{results.percentage.toFixed(1)}%
					</span>
					<span class="demo-results-score-fraction">
						{results.score} / {quiz.questions.reduce((sum, q) => sum + q.points, 0)} points
					</span>
				</div>
				<div class="demo-results-score-breakdown">
					<div class="demo-results-score-item">
						<span class="demo-results-score-label">Correct</span>
						<span class="demo-results-score-value text-green-600">{results.correct}</span>
					</div>
					<div class="demo-results-score-item">
						<span class="demo-results-score-label">Incorrect</span>
						<span class="demo-results-score-value text-red-600"
							>{results.total - results.correct}</span
						>
					</div>
					<div class="demo-results-score-item">
						<span class="demo-results-score-label">Total</span>
						<span class="demo-results-score-value">{results.total}</span>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="demo-results-time-card">
			<CardHeader>
				<CardTitle class="demo-results-card-title">Time Analysis</CardTitle>
			</CardHeader>
			<CardContent class="demo-results-time-content">
				<div class="demo-results-time-stats">
					<div class="demo-results-time-item">
						<span class="demo-results-time-label">Total Time</span>
						<span class="demo-results-time-value">{timeFormatted()}</span>
					</div>
					<div class="demo-results-time-item">
						<span class="demo-results-time-label">Average per Question</span>
						<span class="demo-results-time-value">{averageTimePerQuestion()}</span>
					</div>
					{#if quiz.config.timing.timeLimit}
						<div class="demo-results-time-item">
							<span class="demo-results-time-label">Time Limit</span>
							<span class="demo-results-time-value">{quiz.config.timing.timeLimit}m</span>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Action Buttons -->
	<div class="demo-results-actions">
		<button
			type="button"
			class="demo-quiz-nav-submit"
			onclick={onRestart}
			aria-label="Restart quiz"
		>
			Take Quiz Again
		</button>

		{#if showCorrectAnswers}
			<button
				type="button"
				class="demo-quiz-nav-prev"
				onclick={() => (showDetails = !showDetails)}
				aria-label={showDetails ? "Hide detailed results" : "Show detailed results"}
			>
				{showDetails ? "Hide Details" : "View Detailed Results"}
			</button>
		{/if}
	</div>

	<!-- Detailed Results -->
	{#if showDetails && showCorrectAnswers}
		<div class="demo-results-details" role="region" aria-label="Detailed quiz results">
			<h2 class="demo-results-details-title">Question by Question Analysis</h2>

			<div class="demo-results-questions">
				{#each results.answers as userAnswer, index (userAnswer.questionId)}
					{@const question = getQuestionById(userAnswer.questionId)}
					{#if question}
						<Card class="demo-results-question-card">
							<CardHeader>
								<div class="demo-results-question-header">
									<CardTitle class="demo-results-question-title">
										Question {index + 1}
									</CardTitle>
									<div class="demo-results-question-status">
										{#if userAnswer.isCorrect}
											<Badge variant="default" class="bg-green-100 text-green-800">✓ Correct</Badge>
										{:else}
											<Badge variant="destructive">✗ Incorrect</Badge>
										{/if}
										<span class="demo-results-question-points">
											{userAnswer.points}/{question.points} pts
										</span>
									</div>
								</div>
							</CardHeader>
							<CardContent class="demo-results-question-content">
								<div class="demo-results-question-text">
									<p class="font-medium">{question.question}</p>
								</div>

								<div class="demo-results-answer-comparison">
									<div class="demo-results-answer-section">
										<h4 class="demo-results-answer-label">Your Answer:</h4>
										{#if question.type === "drag_and_drop" && Array.isArray(userAnswer.answer) && userAnswer.answer.length > 0}
											{@const ddQuestion = question as DragAndDropQuestion}
											<ul
												class="demo-results-drag-matches {userAnswer.isCorrect
													? 'text-green-700'
													: 'text-red-700'}"
											>
												{#each userAnswer.answer as match}
													{@const item = ddQuestion.items?.find((i: any) => i.id === match.itemId)}
													{@const target = ddQuestion.targets?.find(
														(t: any) => t.id === match.targetId
													)}
													<li class="demo-results-drag-match">
														<span class="demo-results-drag-item"
															>{item?.content || "Unknown Item"}</span
														>
														<span class="demo-results-drag-arrow">→</span>
														<span class="demo-results-drag-target"
															>{target?.label || "Unknown Target"}</span
														>
													</li>
												{/each}
											</ul>
										{:else}
											<p
												class="demo-results-answer-value {userAnswer.isCorrect
													? 'text-green-700'
													: 'text-red-700'}"
											>
												{formatUserAnswer(userAnswer.answer, question)}
											</p>
										{/if}
									</div>

									{#if !userAnswer.isCorrect}
										<div class="demo-results-answer-section">
											<h4 class="demo-results-answer-label">Correct Answer:</h4>
											{#if question.type === "drag_and_drop" && question.correctMatches}
												{@const ddQuestion = question as DragAndDropQuestion}
												<ul class="demo-results-drag-matches text-green-700">
													{#each ddQuestion.correctMatches as match}
														{@const item = ddQuestion.items?.find(
															(i: any) => i.id === match.itemId
														)}
														{@const target = ddQuestion.targets?.find(
															(t: any) => t.id === match.targetId
														)}
														<li class="demo-results-drag-match">
															<span class="demo-results-drag-item"
																>{item?.content || "Unknown Item"}</span
															>
															<span class="demo-results-drag-arrow">→</span>
															<span class="demo-results-drag-target"
																>{target?.label || "Unknown Target"}</span
															>
														</li>
													{/each}
												</ul>
											{:else}
												<p class="demo-results-answer-value text-green-700">
													{getCorrectAnswer(question)}
												</p>
											{/if}
										</div>
									{/if}
								</div>

								{#if question.explanation}
									<div class="demo-results-explanation">
										<h4 class="demo-results-explanation-label">Explanation:</h4>
										<p class="demo-results-explanation-text">{question.explanation}</p>
									</div>
								{/if}
							</CardContent>
						</Card>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
