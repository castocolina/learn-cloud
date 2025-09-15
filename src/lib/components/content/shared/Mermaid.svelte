<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import type { DiagramBlock } from "$data/types";
	import { Maximize, CircleAlert } from "lucide-svelte";
	import * as Dialog from "$lib/components/ui/dialog";

	interface Props {
		diagram: DiagramBlock;
		class?: string;
	}

	let { diagram, class: className = "" }: Props = $props();

	let diagramElement = $state<HTMLElement>();
	let isLoading = $state(true);
	let hasError = $state(false);
	let errorMessage = $state("");

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
				try {
					await mermaid.default.parse(diagram.definition);
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
				} catch (parseError) {
					const errorMessage =
						parseError instanceof Error ? parseError.message : String(parseError);
					throw new Error(`Invalid Mermaid syntax: ${errorMessage}`);
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
</script>

<div class="mermaid-wrapper {className}">
	{#if diagram.title}
		<div class="diagram-header">
			<h4 class="diagram-title">{diagram.title}</h4>
			<Dialog.Root>
				<Dialog.Trigger
					class="expand-button"
					aria-label="Expand diagram to fullscreen"
					type="button"
				>
					<Maximize size={16} />
				</Dialog.Trigger>
				<Dialog.Content class="mermaid-dialog-content">
					<Dialog.Header>
						<Dialog.Title>{diagram.title}</Dialog.Title>
						{#if diagram.caption}
							<Dialog.Description>{diagram.caption}</Dialog.Description>
						{/if}
					</Dialog.Header>

					<div class="modal-diagram">
						{#if !isLoading && !hasError}
							<div class="diagram-svg-modal">
								{@html diagramElement?.innerHTML || ""}
							</div>
						{:else if isLoading}
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
						{/if}
					</div>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{:else}
		<div class="expand-button-only">
			<Dialog.Root>
				<Dialog.Trigger
					class="expand-button"
					aria-label="Expand diagram to fullscreen"
					type="button"
				>
					<Maximize size={16} />
				</Dialog.Trigger>
				<Dialog.Content class="mermaid-dialog-content">
					<Dialog.Header>
						<Dialog.Title>Diagram</Dialog.Title>
						{#if diagram.caption}
							<Dialog.Description>{diagram.caption}</Dialog.Description>
						{/if}
					</Dialog.Header>

					<div class="modal-diagram">
						{#if !isLoading && !hasError}
							<div class="diagram-svg-modal">
								{@html diagramElement?.innerHTML || ""}
							</div>
						{:else if isLoading}
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
						{/if}
					</div>
				</Dialog.Content>
			</Dialog.Root>
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
