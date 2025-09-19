<script lang="ts">
	import FlipCardShowcase from "$lib/components/demo/FlipCardShowcase.svelte";
</script>

<svelte:head>
	<title>Interactive Flip Cards Showcase - Cloud-Native Learning Platform</title>
	<meta
		name="description"
		content="Master cloud-native concepts with interactive flip cards featuring 3D animations, progress tracking, and comprehensive educational content covering containers, Kubernetes, microservices, and more."
	/>
</svelte:head>

<div class="demo-flipcards-page">
	<FlipCardShowcase showStats={true} maxCards={50} />
</div>
