<script lang="ts">
	import StudyGuideRenderer from "$lib/components/content/StudyGuideRenderer.svelte";
	import { demoStudyGuide } from "../../../data/demo-study-guide";
</script>

<svelte:head>
	<title>Cloud-Native Architecture Study Guide - Learn Cloud Demo</title>
	<meta
		name="description"
		content="Interactive study guide with flashcards covering cloud-native architecture concepts, Kubernetes, microservices, and DevOps practices."
	/>
</svelte:head>

<StudyGuideRenderer content={demoStudyGuide} />
