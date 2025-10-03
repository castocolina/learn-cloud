<script lang="ts">
	/**
	 * Project Renderer Component (Task 7)
	 *
	 * Displays project content with:
	 * - Type-specific header with purple gradient and project icon (🛠️)
	 * - Requirements and deliverables checklists
	 * - Rich text content sections with ContentBlock rendering
	 * - Technologies and estimated hours
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 * - RichTextViewer generic renderer
	 *
	 * @component ProjectRenderer
	 */

	import type { ProjectContent } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";
	import RichTextViewer from "./RichTextViewer.svelte";

	interface Props {
		content: ProjectContent;
	}

	let { content }: Props = $props();

	// Extract content layout configuration
	const { layoutMode, maxWidth, padding } = SETTINGS.ui.content;

	const isProjectContent = $derived(content.type === "project");
</script>

{#if isProjectContent}
	<div class="content-renderer">
		<article
			class="renderer-article"
			data-layout={layoutMode}
			data-max-width={maxWidth}
			data-padding={padding}
		>
			<ContentHeader
				title={content.title}
				chapterType="project"
				unitName={content.technologyUnit}
				estimatedTime={content.estimatedHours ? content.estimatedHours * 60 : undefined}
				difficulty={content.difficulty}
				summary={content.summary}
			/>

			<div class="renderer-content">
				<!-- Requirements Section -->
				{#if content.requirements && content.requirements.length > 0}
					<section class="content-section">
						<h2 class="content-section-title">📋 Requirements</h2>
						<ul class="project-checklist">
							{#each content.requirements as requirement, index (index)}
								<li class="project-checklist-item">{requirement}</li>
							{/each}
						</ul>
					</section>
				{/if}

				<!-- Deliverables Section -->
				{#if content.deliverables && content.deliverables.length > 0}
					<section class="content-section">
						<h2 class="content-section-title">🎯 Deliverables</h2>
						<ul class="project-checklist">
							{#each content.deliverables as deliverable, index (index)}
								<li class="project-checklist-item">{deliverable}</li>
							{/each}
						</ul>
					</section>
				{/if}

				<!-- Technologies Section -->
				{#if content.technologies && content.technologies.length > 0}
					<section class="content-section">
						<h2 class="content-section-title">💻 Technologies</h2>
						<div class="technology-badges">
							{#each content.technologies as tech, index (index)}
								<span class="technology-badge">{tech}</span>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Project Content Sections -->
				{#if content.sections && content.sections.length > 0}
					{#each content.sections as section, index (section.id || `section-${index}`)}
						<section class="content-section" id={section.id}>
							{#if section.title}
								<h2 class="content-section-title">{section.title}</h2>
							{/if}
							<RichTextViewer blocks={section.content} />
						</section>
					{/each}
				{:else}
					<div class="renderer-placeholder">
						<p class="renderer-placeholder-text">
							No project content available. Content sections will be added soon.
						</p>
					</div>
				{/if}
			</div>
		</article>
	</div>
{:else}
	<div class="content-renderer">
		<div class="renderer-error">
			<p>Error: Invalid content type. Expected "project" but received "{content.type}".</p>
		</div>
	</div>
{/if}
