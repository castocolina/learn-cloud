<script lang="ts">
	/**
	 * Overview Renderer Component (Task 7)
	 *
	 * Displays unit overview content with:
	 * - Type-specific header with overview icon (📖)
	 * - Rich content sections (paragraphs, lists, callouts, diagrams)
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 *
	 * @component OverviewRenderer
	 */

	import type { OverviewContent } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";

	interface Props {
		content: OverviewContent;
	}

	let { content }: Props = $props();

	const { layoutMode, maxWidth, padding } = SETTINGS.ui.content;

	// Type guard for overview content
	const sections = content.sections || [];
</script>

<div class="content-renderer">
	<article
		class="renderer-article"
		data-layout={layoutMode}
		data-max-width={maxWidth}
		data-padding={padding}
	>
		<ContentHeader title={content.title} chapterType="overview" summary={content.summary} />

		<div class="renderer-content">
			<!-- Render Prerequisites if available -->
			{#if content.prerequisites && content.prerequisites.length > 0}
				<div class="prerequisites-section mb-8">
					<h2 class="mb-4 text-2xl font-bold">Prerequisites</h2>
					<ul class="list-inside list-disc space-y-2">
						{#each content.prerequisites as prereq, index (index)}
							<li class="text-gray-700 dark:text-gray-300">{prereq}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Render Learning Objectives if available -->
			{#if content.learningObjectives && content.learningObjectives.length > 0}
				<div class="objectives-section mb-8">
					<h2 class="mb-4 text-2xl font-bold">Learning Objectives</h2>
					<ul class="list-inside list-disc space-y-2">
						{#each content.learningObjectives as objective, index (index)}
							<li class="text-gray-700 dark:text-gray-300">{objective}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Render Sections -->
			{#each sections as section, sectionIndex (sectionIndex)}
				<section class="content-section mb-10">
					<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">{section.title}</h2>

					{#each section.content as block, blockIndex (blockIndex)}
						{#if block.type === "paragraph"}
							<p class="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
								{#each block.content as textPart, textIndex (textIndex)}
									{@const text = "text" in textPart ? textPart.text : textPart.content}
									{@const isBold =
										"bold" in textPart
											? textPart.bold
											: "styles" in textPart && textPart.styles?.includes("bold")}
									{#if isBold}
										<strong>{text}</strong>
									{:else}
										{text}
									{/if}
								{/each}
							</p>
						{:else if block.type === "list"}
							{#if block.ordered}
								<ol class="mb-4 list-inside list-decimal space-y-2">
									{#each block.items as item, itemIndex (itemIndex)}
										<li class="text-gray-700 dark:text-gray-300">{item}</li>
									{/each}
								</ol>
							{:else}
								<ul class="mb-4 list-inside list-disc space-y-2">
									{#each block.items as item, itemIndex (itemIndex)}
										<li class="text-gray-700 dark:text-gray-300">{item}</li>
									{/each}
								</ul>
							{/if}
						{:else if block.type === "callout"}
							<div class="callout callout-{block.calloutType} mb-4 rounded-lg border-l-4 p-4">
								{#if block.title}
									<h3 class="mb-2 font-semibold">{block.title}</h3>
								{/if}
								<p class="text-sm">
									{#each block.content as textPart, textIndex (textIndex)}
										{@const text = "text" in textPart ? textPart.text : textPart.content}
										{@const isBold =
											"bold" in textPart
												? textPart.bold
												: "styles" in textPart && textPart.styles?.includes("bold")}
										{#if isBold}
											<strong>{text}</strong>
										{:else}
											{text}
										{/if}
									{/each}
								</p>
							</div>
						{:else if block.type === "diagram"}
							<div class="diagram-container mb-6">
								{#if block.title}
									<h3 class="mb-2 text-lg font-semibold">{block.title}</h3>
								{/if}
								<div class="mermaid-diagram rounded-lg border bg-white p-4 dark:bg-gray-800">
									<pre class="text-xs"><code>{block.definition}</code></pre>
								</div>
								{#if block.caption}
									<p class="mt-2 text-sm text-gray-600 italic dark:text-gray-400">
										{block.caption}
									</p>
								{/if}
							</div>
						{/if}
					{/each}
				</section>
			{/each}

			{#if sections.length === 0}
				<div class="renderer-placeholder">
					<p class="renderer-placeholder-text">No content sections available.</p>
				</div>
			{/if}
		</div>
	</article>
</div>

<style>
	.callout {
		background-color: var(--callout-bg);
		border-left-color: var(--callout-border);
	}

	.callout-info {
		--callout-bg: rgb(219 234 254 / 0.5);
		--callout-border: rgb(59 130 246);
	}

	.callout-warning {
		--callout-bg: rgb(254 243 199 / 0.5);
		--callout-border: rgb(245 158 11);
	}

	.callout-tip {
		--callout-bg: rgb(220 252 231 / 0.5);
		--callout-border: rgb(34 197 94);
	}

	.callout-danger {
		--callout-bg: rgb(254 226 226 / 0.5);
		--callout-border: rgb(239 68 68);
	}

	:global(.dark) .callout-info {
		--callout-bg: rgb(30 58 138 / 0.3);
	}

	:global(.dark) .callout-warning {
		--callout-bg: rgb(120 53 15 / 0.3);
	}

	:global(.dark) .callout-tip {
		--callout-bg: rgb(20 83 45 / 0.3);
	}

	:global(.dark) .callout-danger {
		--callout-bg: rgb(127 29 29 / 0.3);
	}
</style>
