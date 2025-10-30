<!--
	Store Dialog Content Component

	Purpose: Demo content for testing Dialog component's global store mode
	Used by: src/routes/showcase/dialog/+page.svelte

	This is a minimal Svelte component that demonstrates dynamic component
	rendering in Dialog store mode (openDialog API).
-->
<script lang="ts">
	/**
	 * Size prop passed from openDialog() call
	 * Demonstrates prop passing in store mode
	 */
	let { size = "md" }: { size?: string } = $props();
</script>

<div>
	<p class="mb-4">This dialog was opened using the global dialog store.</p>
	<p class="mb-4">
		Current size: <strong class="text-primary">{size.toUpperCase()}</strong>
	</p>
	<p class="mb-4">Try opening multiple dialogs - the store handles state globally.</p>

	<div class="rounded-md border border-accent/50 bg-accent/20 p-4">
		<p class="mb-2 font-semibold">Store Mode Benefits:</p>
		<ul class="list-inside list-disc space-y-1">
			<li>Imperative API - call from anywhere</li>
			<li>No local state management needed</li>
			<li>Dynamic component rendering</li>
			<li>Props passing support</li>
		</ul>
	</div>
</div>
