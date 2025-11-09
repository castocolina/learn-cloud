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
	import Callout from "$lib/components/content/Callout.svelte";

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
							<li class="text-foreground">{prereq}</li>
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
							<li class="text-foreground">{objective}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Render Sections -->
			{#each sections as section, sectionIndex (sectionIndex)}
				<section class="content-section mb-10">
					<h2 class="mb-6 text-2xl font-bold text-foreground">{section.title}</h2>

					{#each section.content as block, blockIndex (blockIndex)}
						{#if block.type === "paragraph"}
							<p class="mb-4 leading-relaxed text-foreground">
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
										<li class="text-foreground">{item}</li>
									{/each}
								</ol>
							{:else}
								<ul class="mb-4 list-inside list-disc space-y-2">
									{#each block.items as item, itemIndex (itemIndex)}
										<li class="text-foreground">{item}</li>
									{/each}
								</ul>
							{/if}
						{:else if block.type === "callout"}
							<Callout {block} />
						{:else if block.type === "diagram"}
							<div class="diagram-container mb-6">
								{#if block.title}
									<h3 class="mb-2 text-lg font-semibold">{block.title}</h3>
								{/if}
								<div class="mermaid-diagram rounded-lg border bg-card p-4">
									<pre class="text-xs"><code>{block.definition}</code></pre>
								</div>
								{#if block.caption}
									<p class="mt-2 text-sm text-muted-foreground italic">
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
