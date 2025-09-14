<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import type { DiagramBlock } from "$data/types";
	import { Maximize, CircleAlert } from "lucide-svelte";

	interface Props {
		diagram: DiagramBlock;
		class?: string;
	}

	let { diagram, class: className = "" }: Props = $props();

	let diagramElement = $state<HTMLElement>();
	let isLoading = $state(true);
	let hasError = $state(false);
	let errorMessage = $state("");
	let isExpanded = $state(false);

	onMount(async () => {
		if (browser && diagramElement) {
			try {
				const mermaid = await import("mermaid");

				// Initialize Mermaid with configuration
				mermaid.default.initialize({
					startOnLoad: false,
					theme: "default",
					securityLevel: "sandbox", // Security: prevent XSS
					fontFamily: "ui-sans-serif, system-ui, sans-serif",
					fontSize: 14,
					darkMode: false, // Will be handled via CSS
					flowchart: {
						useMaxWidth: true,
						htmlLabels: true,
						curve: "basis"
					},
					sequence: {
						useMaxWidth: true,
						wrap: true
					}
				});

				// Generate unique ID for this diagram
				const diagramId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

				// Validate and render the diagram
				const isValid = await mermaid.default.parse(diagram.definition);
				if (isValid) {
					const { svg } = await mermaid.default.render(diagramId, diagram.definition);
					diagramElement.innerHTML = svg;

					// Make the diagram responsive
					const svgElement = diagramElement.querySelector("svg");
					if (svgElement) {
						svgElement.setAttribute("width", "100%");
						svgElement.setAttribute("height", "auto");
						svgElement.style.maxWidth = "100%";
						svgElement.style.height = "auto";
					}
				}

				isLoading = false;
			} catch (error) {
				console.error("Mermaid rendering error:", error);
				hasError = true;
				errorMessage = error instanceof Error ? error.message : "Unknown error";
				isLoading = false;
			}
		}
	});

	function toggleExpanded() {
		isExpanded = !isExpanded;
		// Add body scroll lock when expanded
		if (typeof document !== "undefined") {
			document.body.style.overflow = isExpanded ? "hidden" : "";
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape" && isExpanded) {
			isExpanded = false;
			if (typeof document !== "undefined") {
				document.body.style.overflow = "";
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="mermaid-wrapper {className}">
	{#if diagram.title}
		<div class="diagram-header">
			<h4 class="diagram-title">{diagram.title}</h4>
			<button
				class="expand-button"
				onclick={toggleExpanded}
				aria-label="Expand diagram to fullscreen"
				type="button"
			>
				<Maximize size={16} />
			</button>
		</div>
	{:else}
		<div class="expand-button-only">
			<button
				class="expand-button"
				onclick={toggleExpanded}
				aria-label="Expand diagram to fullscreen"
				type="button"
			>
				<Maximize size={16} />
			</button>
		</div>
	{/if}

	<div class="diagram-content">
		{#if isLoading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading diagram...</p>
			</div>
		{:else if hasError}
			<div class="error-state">
				<CircleAlert size={24} />
				<p>Failed to render diagram</p>
				<details>
					<summary>Error details</summary>
					<pre>{errorMessage}</pre>
				</details>
			</div>
		{:else}
			<!-- Mermaid diagram will be rendered here -->
			<div bind:this={diagramElement} class="diagram-svg"></div>
		{/if}
	</div>

	{#if diagram.caption}
		<div class="diagram-caption">
			<p>{diagram.caption}</p>
		</div>
	{/if}
</div>

<!-- Fullscreen modal overlay -->
{#if isExpanded}
	<div
		class="diagram-modal-overlay"
		onclick={toggleExpanded}
		onkeydown={(e) => e.key === "Escape" && toggleExpanded()}
		role="dialog"
		aria-modal="true"
		aria-label="Expanded diagram view"
		tabindex="-1"
	>
		<div
			class="diagram-modal"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					toggleExpanded();
				}
			}}
			role="document"
			tabindex="-1"
		>
			<button
				class="modal-close"
				onclick={toggleExpanded}
				aria-label="Close expanded view"
				type="button"
			>
				×
			</button>

			{#if diagram.title}
				<h3 class="modal-title">{diagram.title}</h3>
			{/if}

			<div class="modal-diagram">
				{#if !isLoading && !hasError}
					<!-- Clone the diagram for modal view -->
					<div class="diagram-svg-modal">
						{diagramElement?.innerHTML || ""}
					</div>
				{/if}
			</div>

			{#if diagram.caption}
				<p class="modal-caption">{diagram.caption}</p>
			{/if}
		</div>
	</div>
{/if}
