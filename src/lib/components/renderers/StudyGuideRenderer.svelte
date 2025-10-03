<script lang="ts">
	/**
	 * Study Guide Renderer Component (Task 7)
	 *
	 * Displays study guide content with:
	 * - Type-specific header with green gradient and study guide icon (📋)
	 * - Flashcard integration (placeholder for Task 8H)
	 * - Related lessons display
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 *
	 * @component StudyGuideRenderer
	 */

	import type { StudyGuideContent } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";

	interface Props {
		content: StudyGuideContent;
	}

	let { content }: Props = $props();

	const { layoutMode, maxWidth, padding } = SETTINGS.ui.content;
	const isStudyGuideContent = $derived(content.type === "study_guide");
</script>

{#if isStudyGuideContent}
	<div class="content-renderer">
		<article
			class="renderer-article"
			data-layout={layoutMode}
			data-max-width={maxWidth}
			data-padding={padding}
		>
			<ContentHeader title={content.title} chapterType="study_guide" summary={content.summary} />

			<div class="renderer-content">
				<!-- Study Guide Content Placeholder -->
				<div class="renderer-placeholder">
					<p class="renderer-placeholder-text">
						📋 <strong>Task 8H:</strong> Flashcard integration coming soon
					</p>
					{#if content.relatedLessons && content.relatedLessons.length > 0}
						<div class="related-lessons">
							<h3>Related Lessons:</h3>
							<ul>
								{#each content.relatedLessons as lesson, index (index)}
									<li>{lesson}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>
		</article>
	</div>
{:else}
	<div class="content-renderer">
		<div class="renderer-error">
			<p>Error: Invalid content type. Expected "study_guide" but received "{content.type}".</p>
		</div>
	</div>
{/if}
