<script lang="ts">
	import { LessonView } from "$lib/components/demo";
	import type { DemoLesson } from "$lib/../data/demo/navigation/demo-sidebar-menu";
	import { DemoContentType, DemoDifficulty } from "$lib/../data/demo/navigation/demo-sidebar-menu";

	// Lesson data for the Code Examples Showcase
	const codeExamplesLesson: DemoLesson = {
		id: "demo-lesson-showcase-2",
		title: "Code Examples Showcase",
		description:
			"Interactive library of 56+ code examples across multiple programming languages and technologies",
		url: "/demo/code-examples",
		contentType: DemoContentType.CODE,
		duration: "60 min",
		difficulty: DemoDifficulty.BEGINNER,
		icon: "💻",
		learningObjectives: [
			"Browse comprehensive code examples across technologies",
			"Filter and search code snippets by language and complexity",
			"Copy and study production-ready code patterns"
		]
	};
</script>

<svelte:head>
	<title>Code Examples Showcase - Cloud-Native Learning Platform</title>
	<meta
		name="description"
		content="Interactive library of 56+ code examples across multiple programming languages and technologies including TypeScript, Python, Go, Java, Rust, and more."
	/>
</svelte:head>

<LessonView lesson={codeExamplesLesson} />
