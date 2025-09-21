<!--
@route /demo/quiz
Interactive Quiz System Demo Page

Demonstrates the comprehensive quiz system with:
- Multiple quiz examples from the TypeScript library
- Quiz selection interface with difficulty and category filters
- Full quiz experience with timers, scoring, and results
- Mobile-first responsive design with accessibility support
- Integration with the demo navigation system

Showcases the complete quiz functionality for the cloud-native learning platform.
-->

<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import type { Quiz } from "$data/demo/content/quizzes/quiz-examples";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from "$lib/components/ui/select/index.js";
	import QuizRenderer from "$lib/components/demo/quiz/QuizRenderer.svelte";

	// Quiz data
	let quizzes: Quiz[] = $state([]);
	let selectedQuiz: Quiz | null = $state(null);
	let isLoading = $state(true);
	let loadError = $state<string | null>(null);

	// Filters
	let selectedCategoryArray = $state<string[]>(["all"]);
	let selectedDifficultyArray = $state<string[]>(["all"]);

	// Computed single values for filtering logic
	let selectedCategory = $derived(selectedCategoryArray[0] || "all");
	let selectedDifficulty = $derived(selectedDifficultyArray[0] || "all");

	// Derived state
	let categories = $derived(() => {
		const cats = new Set(quizzes.map((quiz) => quiz.category));
		return Array.from(cats).sort();
	});

	let difficulties = $derived(() => {
		const diffs = new Set(quizzes.map((quiz) => quiz.difficulty));
		return Array.from(diffs).sort();
	});

	let filteredQuizzes = $derived(() => {
		return quizzes.filter((quiz) => {
			const categoryMatch = selectedCategory === "all" || quiz.category === selectedCategory;
			const difficultyMatch =
				selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
			return categoryMatch && difficultyMatch;
		});
	});

	// Load quiz data
	onMount(async () => {
		try {
			const { allQuizzes } = await import("$data/demo/content/quizzes/quiz-examples");
			quizzes = allQuizzes;

			// Check if a specific quiz is requested via URL params
			const quizId = $page.url.searchParams.get("quiz");
			if (quizId) {
				const requestedQuiz = quizzes.find((q) => q.id === quizId);
				if (requestedQuiz) {
					selectedQuiz = requestedQuiz;
				}
			}

			isLoading = false;
		} catch (error) {
			console.error("Failed to load quiz data:", error);
			loadError = "Failed to load quiz data. Please try again.";
			isLoading = false;
		}
	});

	function selectQuiz(quiz: Quiz): void {
		selectedQuiz = quiz;
	}

	function backToSelection(): void {
		selectedQuiz = null;
	}

	function handleQuizComplete(results: any): void {
		console.log("Quiz completed:", results);
		// Could store results in localStorage or send to analytics
	}

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty.toLowerCase()) {
			case "beginner":
				return "bg-green-100 text-green-800";
			case "intermediate":
				return "bg-yellow-100 text-yellow-800";
			case "advanced":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	}

	function getCategoryIcon(category: string): string {
		switch (category.toLowerCase()) {
			case "containers":
				return "📦";
			case "kubernetes":
				return "⚙️";
			case "cloud-platforms":
				return "☁️";
			case "devops":
				return "🔧";
			case "security":
				return "🔒";
			case "monitoring":
				return "📊";
			case "networking":
				return "🌐";
			default:
				return "📚";
		}
	}

	function formatDuration(minutes: number): string {
		if (minutes < 60) {
			return `${minutes} min`;
		}
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	}
</script>

<svelte:head>
	<title>Interactive Quiz System - Cloud-Native Learning Platform</title>
	<meta
		name="description"
		content="Test your knowledge with our interactive quiz system featuring multiple question types, timers, and detailed results."
	/>
</svelte:head>

<div class="demo-quiz-page">
	{#if isLoading}
		<div class="demo-quiz-loading" role="status" aria-label="Loading quizzes">
			<div class="demo-quiz-loading-spinner"></div>
			<p class="demo-quiz-loading-text">Loading interactive quizzes...</p>
		</div>
	{:else if loadError}
		<div class="demo-quiz-error" role="alert">
			<h1 class="demo-quiz-error-title">Oops! Something went wrong</h1>
			<p class="demo-quiz-error-message">{loadError}</p>
			<Button onclick={() => window.location.reload()} class="demo-quiz-retry-button">
				Try Again
			</Button>
		</div>
	{:else if selectedQuiz}
		<!-- Quiz Renderer -->
		<div class="demo-quiz-active">
			<div class="demo-quiz-back-nav">
				<Button variant="ghost" onclick={backToSelection} aria-label="Back to quiz selection">
					← Back to Quiz Selection
				</Button>
			</div>
			<QuizRenderer
				quiz={selectedQuiz}
				onComplete={handleQuizComplete}
				className="demo-quiz-renderer"
			/>
		</div>
	{:else}
		<!-- Quiz Selection Interface -->
		<div class="demo-quiz-selection">
			<!-- Page Header -->
			<header class="demo-quiz-header">
				<div class="demo-quiz-title-section">
					<h1 class="demo-quiz-page-title">Interactive Quiz System</h1>
					<p class="demo-quiz-page-description">
						Test your knowledge with our comprehensive quiz system featuring multiple question
						types, timers, progress tracking, and detailed results analysis.
					</p>
				</div>
			</header>

			<!-- Filters -->
			<div class="demo-quiz-filters">
				<div class="demo-quiz-filters-group">
					<label for="category-select" class="demo-quiz-filter-label">Category:</label>
					<Select bind:value={selectedCategoryArray} type="multiple">
						<SelectTrigger id="category-select" class="demo-quiz-filter-select">
							{selectedCategory === "all" ? "All Categories" : selectedCategory}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{#each categories() as category}
								<SelectItem value={category}>
									{getCategoryIcon(category)}
									{category}
								</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>

				<div class="demo-quiz-filters-group">
					<label for="difficulty-select" class="demo-quiz-filter-label">Difficulty:</label>
					<Select bind:value={selectedDifficultyArray} type="multiple">
						<SelectTrigger id="difficulty-select" class="demo-quiz-filter-select">
							{selectedDifficulty === "all" ? "All Levels" : selectedDifficulty}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Levels</SelectItem>
							{#each difficulties() as difficulty}
								<SelectItem value={difficulty}>
									{(difficulty as string).charAt(0).toUpperCase() + (difficulty as string).slice(1)}
								</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
			</div>

			<!-- Quiz Grid -->
			<div class="demo-quiz-grid">
				{#each filteredQuizzes() as quiz}
					<Card class="demo-quiz-card">
						<CardHeader class="demo-quiz-card-header">
							<div class="demo-quiz-card-meta">
								<Badge variant="secondary" class={getDifficultyColor(quiz.difficulty)}>
									{quiz.difficulty}
								</Badge>
								<span class="demo-quiz-card-category">
									{getCategoryIcon(quiz.category)}
									{quiz.category}
								</span>
							</div>
							<CardTitle class="demo-quiz-card-title">{quiz.title}</CardTitle>
						</CardHeader>
						<CardContent class="demo-quiz-card-content">
							<p class="demo-quiz-card-description">{quiz.description}</p>

							<div class="demo-quiz-card-stats">
								<div class="demo-quiz-card-stat">
									<span class="demo-quiz-card-stat-label">Questions:</span>
									<span class="demo-quiz-card-stat-value">{quiz.questions.length}</span>
								</div>
								<div class="demo-quiz-card-stat">
									<span class="demo-quiz-card-stat-label">Points:</span>
									<span class="demo-quiz-card-stat-value">
										{quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0)}
									</span>
								</div>
								{#if quiz.config.timing.timeLimit}
									<div class="demo-quiz-card-stat">
										<span class="demo-quiz-card-stat-label">Time:</span>
										<span class="demo-quiz-card-stat-value">
											{formatDuration(quiz.config.timing.timeLimit)}
										</span>
									</div>
								{/if}
								<div class="demo-quiz-card-stat">
									<span class="demo-quiz-card-stat-label">Pass:</span>
									<span class="demo-quiz-card-stat-value">{quiz.config.scoring.passingScore}%</span>
								</div>
							</div>

							<div class="demo-quiz-card-features">
								{#if quiz.config.timing.showTimer}
									<Badge variant="outline" class="demo-quiz-feature-badge">⏱️ Timed</Badge>
								{/if}
								{#if quiz.config.progress.allowReview}
									<Badge variant="outline" class="demo-quiz-feature-badge">🔄 Review</Badge>
								{/if}
								{#if quiz.config.progress.randomizeQuestions}
									<Badge variant="outline" class="demo-quiz-feature-badge">🔀 Random</Badge>
								{/if}
								{#if quiz.config.scoring.showCorrectAnswers}
									<Badge variant="outline" class="demo-quiz-feature-badge">✅ Answers</Badge>
								{/if}
							</div>

							<Button
								onclick={() => selectQuiz(quiz)}
								class="demo-quiz-start-button"
								aria-label="Start {quiz.title} quiz"
							>
								Start Quiz
							</Button>
						</CardContent>
					</Card>
				{/each}
			</div>

			{#if filteredQuizzes().length === 0}
				<div class="demo-quiz-no-results">
					<div class="demo-quiz-no-results-icon">🔍</div>
					<h3 class="demo-quiz-no-results-title">No quizzes found</h3>
					<p class="demo-quiz-no-results-message">
						Try adjusting your filters or check back later for more quizzes.
					</p>
					<Button
						variant="outline"
						onclick={() => {
							selectedCategory = "all";
							selectedDifficulty = "all";
						}}
						class="demo-quiz-clear-filters"
					>
						Clear Filters
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>
