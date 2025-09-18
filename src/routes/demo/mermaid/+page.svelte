<script lang="ts">
	import MermaidShowcase from "$lib/components/demo/MermaidShowcase.svelte";
	import { page } from "$app/stores";

	// Get initial filter from URL params
	$: initialFilter = $page.url.searchParams.get("type") || "all";
	$: showDebug = $page.url.searchParams.has("debug");
</script>

<svelte:head>
	<title>Mermaid Diagram Showcase - Learn Cloud</title>
	<meta
		name="description"
		content="Comprehensive collection of educational Mermaid diagrams for cloud-native learning. Explore flowcharts, sequence diagrams, class diagrams, and more."
	/>
	<meta
		name="keywords"
		content="mermaid diagrams, cloud native, microservices, architecture, flowcharts, sequence diagrams"
	/>
</svelte:head>

<div class="demo-mermaid-page">
	<!-- Page Header -->
	<div class="demo-page-header">
		<div class="demo-breadcrumb">
			<a href="/demo" class="demo-breadcrumb-link">Demo</a>
			<span class="demo-breadcrumb-separator">›</span>
			<span class="demo-breadcrumb-current">Mermaid Diagrams</span>
		</div>

		{#if showDebug}
			<div class="demo-debug-notice">
				<span class="demo-debug-icon">🐛</span>
				Debug mode enabled - Check console for detailed error information
			</div>
		{/if}
	</div>

	<!-- Main Content -->
	<div class="demo-page-content">
		<MermaidShowcase {initialFilter} showStats={true} />
	</div>

	<!-- Footer Information -->
	<div class="demo-page-footer">
		<div class="demo-footer-section">
			<h3>About These Diagrams</h3>
			<p>
				This showcase contains 20+ educational Mermaid diagrams designed for cloud-native learning.
				All diagrams follow <strong>mobile-first design principles</strong> with left-to-right layouts
				optimized for narrow screens (≤390px).
			</p>
		</div>

		<div class="demo-footer-section">
			<h3>Debug Mode</h3>
			<p>
				Add <code>?debug=true</code> to the URL to enable debug mode with detailed error logging. This
				helps identify and troubleshoot diagram rendering issues.
			</p>
		</div>

		<div class="demo-footer-section">
			<h3>Technical Standards</h3>
			<p>
				All diagrams follow strict <strong>MERMAID-STANDARDS.md</strong> guidelines including: double-quoted
				text, mobile-optimized layouts, and comprehensive error handling.
			</p>
		</div>
	</div>
</div>
