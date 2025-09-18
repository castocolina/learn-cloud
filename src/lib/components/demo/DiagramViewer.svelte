<script lang="ts">
	import MermaidDiagram from "./MermaidDiagram.svelte";
	import type { MermaidExample } from "../../../data/demo/content/diagrams/mermaid-examples.js";

	interface Props {
		diagram: MermaidExample;
		showMetadata?: boolean;
		className?: string;
		debug?: boolean;
	}

	let { diagram, showMetadata = false, className = "", debug = false }: Props = $props();

	/**
	 * Get complexity badge color class
	 */
	function getComplexityClass(complexity: string): string {
		switch (complexity) {
			case "basic":
				return "demo-badge-basic";
			case "intermediate":
				return "demo-badge-intermediate";
			case "advanced":
				return "demo-badge-advanced";
			default:
				return "demo-badge-basic";
		}
	}
</script>

<div class="diagram-viewer {className}">
	{#if showMetadata}
		<!-- Diagram Metadata Header -->
		<div class="diagram-viewer-header">
			<div class="diagram-viewer-title-section">
				<h3 class="diagram-viewer-title">{diagram.title}</h3>
				<p class="diagram-viewer-description">{diagram.description}</p>
			</div>
			<div class="diagram-viewer-badges">
				<span class="demo-badge demo-badge-type">{diagram.type}</span>
				<span class="demo-badge {getComplexityClass(diagram.complexity)}">
					{diagram.complexity}
				</span>
			</div>
		</div>

		<!-- Tags -->
		{#if diagram.tags.length > 0}
			<div class="diagram-viewer-tags">
				{#each diagram.tags.slice(0, 4) as tag, index (index)}
					<span class="diagram-viewer-tag">{tag}</span>
				{/each}
				{#if diagram.tags.length > 4}
					<span class="diagram-viewer-tag diagram-viewer-tag-more"
						>+{diagram.tags.length - 4} more</span
					>
				{/if}
			</div>
		{/if}
	{/if}

	<!-- Mermaid Diagram Component -->
	<div class="diagram-viewer-diagram">
		<MermaidDiagram
			diagram={diagram.diagram}
			title={showMetadata ? undefined : diagram.title}
			{debug}
			className="diagram-viewer-mermaid"
		/>
	</div>

	{#if showMetadata}
		<!-- Learning Objectives (Collapsible) -->
		{#if diagram.learningObjectives.length > 0}
			<details class="diagram-viewer-section">
				<summary class="diagram-viewer-summary">Learning Objectives</summary>
				<ul class="diagram-viewer-list">
					{#each diagram.learningObjectives as objective, index (index)}
						<li>{objective}</li>
					{/each}
				</ul>
			</details>
		{/if}

		<!-- Use Cases (Collapsible) -->
		{#if diagram.useCases.length > 0}
			<details class="diagram-viewer-section">
				<summary class="diagram-viewer-summary">Use Cases</summary>
				<ul class="diagram-viewer-list">
					{#each diagram.useCases as useCase, index (index)}
						<li>{useCase}</li>
					{/each}
				</ul>
			</details>
		{/if}

		<!-- Explanation (Collapsible) -->
		{#if diagram.explanation}
			<details class="diagram-viewer-section">
				<summary class="diagram-viewer-summary">Explanation</summary>
				<p class="diagram-viewer-explanation">{diagram.explanation}</p>
			</details>
		{/if}
	{/if}
</div>

<style>
	/* Main container */
	.diagram-viewer {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		overflow: hidden;
	}

	/* Header section */
	.diagram-viewer-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem 1.5rem 1rem 1.5rem;
		background: hsl(var(--muted) / 0.3);
		border-bottom: 1px solid hsl(var(--border));
	}

	.diagram-viewer-title-section {
		flex: 1;
		min-width: 0;
	}

	.diagram-viewer-title {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		line-height: 1.3;
	}

	.diagram-viewer-description {
		margin: 0;
		color: hsl(var(--muted-foreground));
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.diagram-viewer-badges {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	/* Badges */
	.demo-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: capitalize;
		white-space: nowrap;
	}

	.demo-badge-type {
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border: 1px solid hsl(var(--primary) / 0.2);
	}

	.demo-badge-basic {
		border: 1px solid;
		background: hsl(142, 76%, 36% / 0.1);
		color: hsl(142, 76%, 36%);
		border-color: hsl(142, 76%, 36% / 0.2);
	}

	.demo-badge-intermediate {
		border: 1px solid;
		background: hsl(45, 93%, 47% / 0.1);
		color: hsl(45, 93%, 47%);
		border-color: hsl(45, 93%, 47% / 0.2);
	}

	.demo-badge-advanced {
		border: 1px solid;
		background: hsl(0, 84%, 60% / 0.1);
		color: hsl(0, 84%, 60%);
		border-color: hsl(0, 84%, 60% / 0.2);
	}

	/* Tags */
	.diagram-viewer-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0 1.5rem 1rem 1.5rem;
		background: hsl(var(--muted) / 0.3);
		border-bottom: 1px solid hsl(var(--border));
	}

	.diagram-viewer-tag {
		padding: 0.25rem 0.5rem;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 4px;
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	.diagram-viewer-tag-more {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
		font-weight: 500;
	}

	/* Diagram container */
	.diagram-viewer-diagram {
		background: hsl(var(--background));
	}

	/* Collapsible sections */
	.diagram-viewer-section {
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--background));
	}

	.diagram-viewer-summary {
		padding: 1rem 1.5rem;
		cursor: pointer;
		font-weight: 500;
		color: hsl(var(--foreground));
		transition: all 0.2s ease;
		user-select: none;
		display: flex;
		align-items: center;
	}

	.diagram-viewer-summary:hover {
		background: hsl(var(--muted) / 0.3);
	}

	.diagram-viewer-summary::marker {
		content: "▶ ";
		color: hsl(var(--primary));
		font-size: 0.8em;
	}

	.diagram-viewer-section[open] .diagram-viewer-summary::marker {
		content: "▼ ";
	}

	.diagram-viewer-list {
		margin: 0 0 1rem 0;
		padding: 0 1.5rem 1rem 3rem;
		color: hsl(var(--muted-foreground));
		line-height: 1.6;
	}

	.diagram-viewer-list li {
		margin-bottom: 0.5rem;
	}

	.diagram-viewer-list li:last-child {
		margin-bottom: 0;
	}

	.diagram-viewer-explanation {
		margin: 0 0 1rem 0;
		padding: 0 1.5rem 1rem 1.5rem;
		color: hsl(var(--muted-foreground));
		line-height: 1.6;
	}

	/* Ensure no margin/border conflicts with MermaidDiagram */
	:global(.diagram-viewer-mermaid) {
		border: none !important;
		border-radius: 0 !important;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.diagram-viewer-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
			padding: 1rem;
		}

		.diagram-viewer-badges {
			flex-direction: row;
			justify-content: flex-start;
		}

		.diagram-viewer-tags {
			padding: 0 1rem 1rem 1rem;
		}

		.diagram-viewer-summary {
			padding: 0.75rem 1rem;
		}

		.diagram-viewer-list {
			padding: 0 1rem 1rem 2rem;
		}

		.diagram-viewer-explanation {
			padding: 0 1rem 1rem 1rem;
		}
	}

	@media (max-width: 480px) {
		.diagram-viewer-header {
			padding: 0.75rem;
		}

		.diagram-viewer-title {
			font-size: 1.125rem;
		}

		.diagram-viewer-description {
			font-size: 0.875rem;
		}

		.diagram-viewer-tags {
			padding: 0 0.75rem 0.75rem 0.75rem;
		}

		.diagram-viewer-badges {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
