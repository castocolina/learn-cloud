<script lang="ts">
	import QuizRenderer from "$lib/components/content/QuizRenderer.svelte";
	import { demoQuiz } from "../../../data/demo-quiz";
</script>

<svelte:head>
	<title>Cloud-Native Architecture Quiz - Learn Cloud Demo</title>
	<meta
		name="description"
		content="Interactive quiz testing knowledge of cloud-native architecture, container orchestration, microservices, and CI/CD practices."
	/>
</svelte:head>

<QuizRenderer content={demoQuiz} />
