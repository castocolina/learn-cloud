<script lang="ts">
	/**
	 * Lesson Renderer Component (Task 7)
	 *
	 * Displays lesson content with:
	 * - Type-specific header with blue gradient and lesson icon (📚)
	 * - Prerequisites and learning objectives
	 * - Rich text content sections with ContentBlock rendering
	 * - Configurable layout based on SETTINGS.ui.content
	 *
	 * Content Structure:
	 * - LessonContent interface with sections array
	 * - Each section contains ContentBlock[] (paragraphs, code, diagrams, etc.)
	 * - Metadata: difficulty, estimatedTime, prerequisites, learningObjectives
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 * - RichTextViewer generic renderer
	 *
	 * @component LessonRenderer
	 */

	import type { LessonContent } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";
	import RichTextViewer from "./RichTextViewer.svelte";

	interface Props {
		content: LessonContent;
	}

	let { content }: Props = $props();

	// Extract content layout configuration
	const { layoutMode, maxWidth, padding } = SETTINGS.ui.content;

	/**
	 * Type guard to ensure content is LessonContent
	 */
	const isLessonContent = $derived(content.type === "lesson");
</script>

{#if isLessonContent}
	<div class="content-renderer">
		<article
			class="renderer-article"
			data-layout={layoutMode}
			data-max-width={maxWidth}
			data-padding={padding}
		>
			<!-- Content Header with Lesson-specific styling -->
			<ContentHeader
				title={content.title}
				chapterType="lesson"
				unitName={content.technologyUnit}
				estimatedTime={content.estimatedTime}
				difficulty={content.difficulty}
				prerequisites={content.prerequisites}
				learningObjectives={content.learningObjectives}
				summary={content.summary}
			/>

			<!-- Lesson Content Sections -->
			<div class="renderer-content">
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
							No lesson content available. Content sections will be added soon.
						</p>
					</div>
				{/if}
			</div>
		</article>
	</div>
{:else}
	<div class="content-renderer">
		<div class="renderer-error">
			<p>Error: Invalid content type. Expected "lesson" but received "{content.type}".</p>
		</div>
	</div>
{/if}
