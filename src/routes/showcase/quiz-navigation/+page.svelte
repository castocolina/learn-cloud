<!--
Quiz Showcase - Complete Interactive Quiz Demo

Demonstrates the full quiz system with all 6 question types:
- Single Choice
- Multiple Choice
- True/False
- Code Completion
- Drag & Drop
- Short Answer

Uses production QuizEngine + QuestionRenderer + QuizNavigation components
with real question data from question-examples.ts

URL: /showcase/quiz-navigation
-->

<script lang="ts">
	import QuizEngine from "$lib/components/content/QuizEngine.svelte";
	import { questionExamples } from "$data/showcase/question-examples";
	import { CONTENT_SETTINGS } from "$config/settings-content.js";

	// Use centralized quiz configuration with showcase-specific overrides
	const config = {
		...CONTENT_SETTINGS.quiz,
		shuffleQuestions: false, // Keep questions in order for demo
		questionsToShow: 0 // Show all 6 questions (override default 5)
	};

	const title = "Complete Quiz Showcase - All Question Types";
</script>

<svelte:head>
	<title>Quiz Showcase - All Question Types</title>
	<meta
		name="description"
		content="Complete interactive quiz demonstration showing all 6 question types with navigation, progress tracking, and real-time answers"
	/>
</svelte:head>

<div class="container mx-auto max-w-7xl p-6">
	<!-- Header -->
	<header class="mb-8 space-y-4">
		<h1 class="text-4xl font-bold">Quiz Showcase</h1>
		<p class="text-lg text-muted-foreground">
			Complete interactive quiz with all 6 question types: Single Choice, Multiple Choice,
			True/False, Code Completion, Drag & Drop, and Short Answer.
		</p>
		<div class="rounded-lg border border-border bg-accent/30 p-4">
			<p class="text-sm">
				<strong>Components:</strong> QuizEngine + QuestionRenderer + QuizNavigation
			</p>
			<p class="text-sm">
				<strong>Data:</strong> src/data/showcase/question-examples.ts
			</p>
		</div>
	</header>

	<!-- Quiz Engine -->
	<QuizEngine questionPool={questionExamples} {config} {title} />
</div>
