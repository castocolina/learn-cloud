<script lang="ts">
	import LessonRenderer from "$lib/components/content/LessonRenderer.svelte";
	import { demoLesson } from "../../../data/demo-lesson";
</script>

<svelte:head>
	<title>Container Orchestration Lesson - Learn Cloud Demo</title>
	<meta
		name="description"
		content="Interactive lesson demonstrating container orchestration concepts with Kubernetes examples, code blocks, and diagrams."
	/>
</svelte:head>

<LessonRenderer content={demoLesson} />
