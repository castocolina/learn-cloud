<script lang="ts">
	/**
	 * MermaidDiagram Component
	 *
	 * CRITICAL MERMAID SYNTAX REQUIREMENTS:
	 *
	 * 1. DOUBLE QUOTE ALL TEXT - ALL text in nodes and links MUST be enclosed in double quotes
	 *    ✅ CORRECT: graph TD A["User Login"] --> B{"Valid?"}
	 *    ❌ INCORRECT: graph TD A[User Login] --> B{Valid?}
	 *
	 * 2. ESCAPE SPECIAL CHARACTERS - Use backslashes for quotes within text
	 *    ✅ CORRECT: A["Function: \"getName()\""]
	 *    ❌ INCORRECT: A["Function: "getName()""]
	 *
	 * 3. PREFER RAW SPECIAL CHARACTERS - Use <, >, & directly (not HTML entities)
	 *    ✅ PREFERRED: A["API Call <request>"] --> B["Process & Validate"]
	 *    ⚠️ LESS PREFERRED: A["API Call &lt;request&gt;"] --> B["Process &amp; Validate"]
	 *
	 * 4. MOBILE-FIRST LAYOUT - Prefer LR (Left-Right) for mobile optimization
	 *    ✅ PREFERRED: graph LR (better for narrow screens)
	 *    ⚠️ USE SPARINGLY: graph TD (can cause horizontal scrolling on mobile)
	 *
	 * EXPAND FUNCTIONALITY REQUIREMENTS:
	 * - All Mermaid diagrams MUST include expand-to-modal functionality
	 * - Expand button in top-right corner opens full-screen modal
	 * - Modal size configurable via modalPagePercent prop (default: 95%)
	 * - Expand button hidden when diagram fails to render
	 *
	 * DEBUG CAPABILITIES:
	 * - Accepts debug prop or checks URL parameter ?debug=true
	 * - Logs all rendering errors with full diagram source
	 * - Displays fallback content with diagram source on failures
	 * - Includes retry and copy functionality in debug mode
	 *
	 * KNOWN ISSUES & SOLUTIONS:
	 *
	 * Issue: Mermaid Initial Render Failures
	 * - Cause: Race conditions between DOM availability and Mermaid initialization
	 * - Solution: Check isRendering state in $effect to prevent concurrent renders
	 * - Prevention: Always initialize isRendering to false, not true
	 *
	 * Issue: Orphaned DOM Elements from Failed Renders
	 * - Cause: mermaid.render() creates DOM elements even on syntax errors
	 * - Solution: cleanupOrphanedMermaidElement() removes elements after failures
	 * - Pattern: Elements with IDs like "mermaid-diagram-xxxxxxxx" left in DOM
	 *
	 * Issue: "Cannot read properties of null (reading 'firstChild')"
	 * - Cause: Direct DOM manipulation during connected element rendering
	 * - Solution: Use mermaid.render() API with suppressErrors: true
	 * - Prevention: Never call mermaid.init() on connected DOM elements
	 */
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import mermaid from "mermaid";
	import { Expand, Copy, Check, RotateCcw } from "lucide-svelte";
	import * as Dialog from "$ui/dialog";
	import { SETTINGS } from "$config/settings";

	interface Props {
		diagram: string;
		debug?: boolean;
		title?: string;
		className?: string;
		modalPagePercent?: number;
		showExpandButton?: boolean;
	}

	let {
		diagram,
		debug = false,
		title,
		className = "",
		modalPagePercent = SETTINGS.mermaid.modalPagePercent,
		showExpandButton = true
	}: Props = $props();

	let diagramElement: HTMLElement;
	let modalDiagramElement: HTMLElement;
	let renderError: string | null = $state(null);
	let isRendering = $state(true);
	let isModalOpen = $state(false);
	let copySuccess = $state(false);

	// Check URL parameter for debug mode and global settings
	let debugMode = $derived(debug || $page.url.searchParams.has("debug") || SETTINGS.mermaid.debug);

	// Initialize Mermaid configuration once
	onMount(() => {
		mermaid.initialize({
			startOnLoad: false,
			theme: "default",
			securityLevel: "loose",
			fontFamily: "inherit",
			fontSize: 14,
			logLevel: "error", // Prevent Mermaid from logging its own errors to console
			flowchart: { useMaxWidth: true, htmlLabels: true },
			sequence: { useMaxWidth: true, wrap: true },
			gitGraph: { useMaxWidth: true, mainBranchName: "main" }
		});
	});

	// Clean up any orphaned Mermaid elements created during failed renders
	function cleanupOrphanedMermaidElement(mermaidElementId: string) {
		const orphanedElement = document.getElementById(mermaidElementId);
		if (orphanedElement) {
			orphanedElement.remove();
		}
	}

	// Generic diagram rendering function
	async function renderDiagramInElement(element: HTMLElement, idPrefix: string) {
		if (!element || !diagram) return;

		const mermaidElementId = `${idPrefix}-${Date.now()}`;
		isRendering = idPrefix === "mermaid-diagram"; // Only show loading for main diagram
		renderError = null;

		try {
			if (debugMode) {
				console.log(`Rendering Mermaid diagram: ${title || "Untitled"}`);
			}

			// Use mermaid.render() which is stateless and returns the SVG as a string
			const { svg } = await mermaid.render(mermaidElementId, diagram);
			element.innerHTML = svg;

			// Make SVG responsive and accessible
			const svgElement = element.querySelector("svg");
			if (svgElement) {
				svgElement.style.maxWidth = "100%";
				svgElement.style.height = "auto";
				svgElement.setAttribute("role", "img");
				svgElement.setAttribute("aria-label", title || "Mermaid diagram");
			}
		} catch (error) {
			renderError = (error as Error).message;
			element.innerHTML = ""; // Clear any partial rendering

			// CRITICAL: Clean up the orphaned element Mermaid creates on failure
			cleanupOrphanedMermaidElement(mermaidElementId);

			if (debugMode) {
				console.error("Mermaid render failed:", {
					title: title || "Untitled",
					error: renderError,
					diagram
				});
			}
		} finally {
			if (idPrefix === "mermaid-diagram") {
				isRendering = false;
			}
		}
	}

	// Reset and render the main diagram when the element is ready or diagram changes
	$effect(() => {
		if (diagramElement && diagram) {
			renderDiagramInElement(diagramElement, "mermaid-diagram");
		}
	});

	// Render the modal diagram when it opens
	$effect(() => {
		if (isModalOpen && modalDiagramElement && diagram) {
			renderDiagramInElement(modalDiagramElement, "mermaid-modal");
		}
	});

	// Function to retry rendering if it failed
	function retryRender() {
		if (diagramElement && diagram) {
			renderDiagramInElement(diagramElement, "mermaid-diagram");
		}
	}

	// Handle expand button click
	function handleExpand() {
		isModalOpen = true;
	}

	// Handle copy diagram source
	async function handleCopyDiagram() {
		try {
			await navigator.clipboard.writeText(diagram);
			copySuccess = true;

			// Reset copy success state after 2 seconds
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (error) {
			if (debugMode) {
				console.error("Failed to copy diagram source:", error);
			}
		}
	}
</script>

<div class="mermaid-diagram-container {className}">
	<!-- Header with title and expand button -->
	<div class="mermaid-diagram-header">
		{#if title}
			<h3 class="mermaid-diagram-title">{title}</h3>
		{/if}

		{#if showExpandButton && !renderError}
			<button
				onclick={handleExpand}
				class="mermaid-expand-button"
				title="Expand diagram to full screen"
				aria-label="Expand diagram to full screen"
			>
				<Expand size={16} />
			</button>
		{/if}
	</div>

	<!-- Loading state -->
	{#if isRendering}
		<div class="mermaid-diagram-loading">
			<div class="mermaid-diagram-spinner"></div>
			<span>Rendering diagram...</span>
		</div>
	{/if}

	<!-- Error fallback -->
	{#if renderError}
		<div class="mermaid-diagram-error">
			<div class="mermaid-diagram-error-icon">⚠️</div>
			<div class="mermaid-diagram-error-content">
				<h4>Diagram Rendering Failed</h4>
				<p>{renderError}</p>

				{#if debugMode}
					<details class="mermaid-diagram-debug-details">
						<summary>Debug Information</summary>
						<div class="mermaid-diagram-debug-content">
							<h5>Diagram Source:</h5>
							<pre><code>{diagram}</code></pre>
							<div class="mermaid-error-actions-grid">
								<button
									onclick={retryRender}
									class="mermaid-action-button"
									title="Retry rendering diagram"
									aria-label="Retry rendering diagram"
								>
									<RotateCcw size={14} />
								</button>
								<button
									onclick={handleCopyDiagram}
									class="mermaid-action-button"
									title={copySuccess ? "Copied!" : "Copy diagram source code"}
									aria-label={copySuccess ? "Copied!" : "Copy diagram source code"}
								>
									{#if copySuccess}
										<Check size={14} />
									{:else}
										<Copy size={14} />
									{/if}
								</button>
							</div>
						</div>
					</details>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Diagram container -->
	<div
		bind:this={diagramElement}
		class="mermaid-diagram-content"
		class:mermaid-hidden={isRendering || renderError}
	></div>
</div>

<!-- Modal Dialog -->
<Dialog.Root bind:open={isModalOpen}>
	<Dialog.Content
		class="mermaid-modal-content"
		style="max-width: {modalPagePercent}vw !important; max-height: {modalPagePercent}vh !important; width: {modalPagePercent}vw; height: {modalPagePercent}vh; z-index: var(--z-modal) !important;"
	>
		<Dialog.Header>
			<Dialog.Title>
				{title || "Mermaid Diagram"}
			</Dialog.Title>
			<Dialog.Description>Expanded view of the Mermaid diagram</Dialog.Description>
		</Dialog.Header>

		<!-- Modal diagram container -->
		<div class="mermaid-modal-diagram-container">
			<div bind:this={modalDiagramElement} class="mermaid-modal-diagram-content"></div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Main container */
	.mermaid-diagram-container {
		position: relative;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		overflow: hidden;
	}

	/* Header styling */
	.mermaid-diagram-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: hsl(var(--muted) / 0.3);
		border-bottom: 1px solid hsl(var(--border));
	}

	.mermaid-diagram-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	/* Expand button with subtle styling */
	.mermaid-expand-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mermaid-expand-button:hover {
		background: hsl(var(--muted) / 0.5);
		color: hsl(var(--foreground));
	}

	.mermaid-expand-button:active {
		transform: scale(0.95);
	}

	/* Loading state */
	.mermaid-diagram-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 2rem;
		gap: 1rem;
		color: hsl(var(--muted-foreground));
	}

	.mermaid-diagram-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid hsl(var(--muted));
		border-top: 3px solid hsl(var(--primary));
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Error state styling */
	.mermaid-diagram-error {
		display: flex;
		gap: 1rem;
		padding: 2rem 1.5rem;
		background: hsl(var(--destructive) / 0.1);
		border: 1px solid hsl(var(--destructive) / 0.3);
		border-radius: 8px;
		margin: 1rem;
	}

	.mermaid-diagram-error-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.mermaid-diagram-error-content h4 {
		margin: 0 0 0.5rem 0;
		color: hsl(var(--destructive));
		font-weight: 600;
	}

	.mermaid-diagram-error-content p {
		margin: 0 0 1rem 0;
		color: hsl(var(--muted-foreground));
	}

	.mermaid-diagram-debug-details {
		margin-top: 1rem;
	}

	.mermaid-diagram-debug-details summary {
		cursor: pointer;
		font-weight: 500;
		color: hsl(var(--foreground));
		padding: 0.5rem 0;
	}

	.mermaid-diagram-debug-content {
		margin-top: 1rem;
		padding: 1rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 6px;
	}

	.mermaid-diagram-debug-content h5 {
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.mermaid-diagram-debug-content pre {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 4px;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.875rem;
		margin: 0.5rem 0 1rem 0;
	}

	/* Error actions grid container */
	.mermaid-error-actions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		margin-top: 1rem;
		max-width: 120px;
	}

	.mermaid-action-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 32px;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mermaid-action-button:hover {
		background: hsl(var(--muted) / 0.5);
		color: hsl(var(--foreground));
	}

	.mermaid-action-button:active {
		transform: scale(0.95);
	}

	/* Diagram content */
	.mermaid-diagram-content {
		padding: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
	}

	.mermaid-hidden {
		display: none;
	}

	/* Modal styling */
	:global(.mermaid-modal-content) {
		padding: 1.5rem !important;
		display: flex !important;
		flex-direction: column !important;
		gap: 1rem !important;
	}

	/* Modal diagram container */
	.mermaid-modal-diagram-container {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: auto;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		background: hsl(var(--background));
		padding: 1rem;
	}

	.mermaid-modal-diagram-content {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* Improve shadcn dialog close button styling */
	:global([data-dialog-content] button[data-dialog-close]) {
		cursor: pointer !important;
		transition: all 0.2s ease !important;
		background: hsl(var(--muted)) !important;
		border: 1px solid hsl(var(--border)) !important;
		width: 32px !important;
		height: 32px !important;
		border-radius: 6px !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
	}

	:global([data-dialog-content] button[data-dialog-close]:hover) {
		background: hsl(var(--destructive) / 0.1) !important;
		border-color: hsl(var(--destructive)) !important;
		color: hsl(var(--destructive)) !important;
		transform: scale(1.05) !important;
	}

	:global([data-dialog-content] button[data-dialog-close]:active) {
		transform: scale(0.95) !important;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.mermaid-diagram-header {
			padding: 0.75rem 1rem;
		}

		.mermaid-diagram-content {
			padding: 1rem;
		}

		.mermaid-expand-button {
			width: 36px;
			height: 36px;
		}

		:global(.mermaid-modal-content) {
			padding: 1rem !important;
		}
	}

	@media (max-width: 480px) {
		.mermaid-diagram-header {
			padding: 0.5rem 0.75rem;
		}

		.mermaid-diagram-title {
			font-size: 1rem;
		}

		.mermaid-expand-button {
			width: 32px;
			height: 32px;
		}

		.mermaid-diagram-content {
			padding: 0.75rem;
			min-height: 150px;
		}
	}
</style>
