<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
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

	// Debug flag detection from URL query parameters
	let debugMode = $state(false);

	onMount(async () => {
		if (browser && diagramElement) {
			// Detect debug mode from URL query parameters
			debugMode = $page.url.searchParams.get("debug-mermaid") === "true";

			if (debugMode) {
				console.log("[DEBUG-MERMAID] Debug mode enabled via URL flag");
				console.log("[DEBUG-MERMAID] Diagram definition:", diagram.definition);
				console.log("[DEBUG-MERMAID] Diagram type:", diagram.diagramType);
			}

			try {
				const mermaid = await import("mermaid");

				if (debugMode) {
					console.log("[DEBUG-MERMAID] Mermaid module loaded successfully");
				}

				// Initialize Mermaid with configuration - conditional logging level
				const mermaidConfig = {
					startOnLoad: false,
					theme: "default",
					securityLevel: "sandbox", // Security: prevent XSS
					fontFamily: "ui-sans-serif, system-ui, sans-serif",
					fontSize: 14,
					darkMode: false, // Will be handled via CSS
					logLevel: debugMode ? 1 : 5, // 1 = debug (verbose), 5 = error (production-safe)
					flowchart: {
						useMaxWidth: true,
						htmlLabels: true,
						curve: "basis"
					},
					sequence: {
						useMaxWidth: true,
						wrap: true
					}
				};

				if (debugMode) {
					console.log("[DEBUG-MERMAID] Mermaid config:", mermaidConfig);
				}

				mermaid.default.initialize(mermaidConfig);

				// Generate unique ID for this diagram
				const diagramId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

				if (debugMode) {
					console.log("[DEBUG-MERMAID] Generated diagram ID:", diagramId);
					console.log("[DEBUG-MERMAID] Starting diagram parsing...");
				}

				// Validate and render the diagram
				try {
					await mermaid.default.parse(diagram.definition);

					if (debugMode) {
						console.log("[DEBUG-MERMAID] Diagram parsed successfully");
						console.log("[DEBUG-MERMAID] Starting diagram rendering...");
					}

					const { svg } = await mermaid.default.render(diagramId, diagram.definition);

					if (debugMode) {
						console.log("[DEBUG-MERMAID] Diagram rendered successfully");
						console.log("[DEBUG-MERMAID] SVG length:", svg.length);
					}

					diagramElement.innerHTML = svg;

					// Make the diagram responsive
					const svgElement = diagramElement.querySelector("svg");
					if (svgElement) {
						svgElement.setAttribute("width", "100%");
						svgElement.setAttribute("height", "auto");
						svgElement.style.maxWidth = "100%";
						svgElement.style.height = "auto";

						if (debugMode) {
							console.log("[DEBUG-MERMAID] SVG made responsive");
						}
					}
				} catch (parseError) {
					const errorMessage =
						parseError instanceof Error ? parseError.message : String(parseError);
					const fullError = `Invalid Mermaid syntax: ${errorMessage}`;

					if (debugMode) {
						console.error("[DEBUG-MERMAID] Parse error:", parseError);
						console.error("[DEBUG-MERMAID] Error message:", fullError);
					}

					throw new Error(fullError);
				}

				if (debugMode) {
					console.log("[DEBUG-MERMAID] Diagram rendering completed successfully");
				}

				isLoading = false;
			} catch (error) {
				console.error("Mermaid rendering error:", error);

				if (debugMode) {
					console.error("[DEBUG-MERMAID] Full error details:", error);
					console.error(
						"[DEBUG-MERMAID] Error stack:",
						error instanceof Error ? error.stack : "No stack trace"
					);
				}

				hasError = true;
				errorMessage = error instanceof Error ? error.message : String(error);
				isLoading = false;
			}
		}
	});
</script>

<div class="mermaid-wrapper {className}">
	{#if debugMode}
		<div
			class="debug-indicator mb-2 rounded border border-yellow-300 bg-yellow-100 p-2 text-sm text-yellow-800"
		>
			🐛 <strong>DEBUG MODE:</strong> Verbose logging enabled. Check browser console for detailed output.
		</div>
	{/if}

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
