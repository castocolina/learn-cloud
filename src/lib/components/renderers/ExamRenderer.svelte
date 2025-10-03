<script lang="ts">
	/**
	 * Exam Renderer Component (Task 7)
	 *
	 * Displays exam content with:
	 * - Type-specific header with red gradient and exam icon (🎯)
	 * - Exam system integration (placeholder for Task 8I)
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 *
	 * @component ExamRenderer
	 */

	import type { ExamContent } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";

	interface Props {
		content: ExamContent;
	}

	let { content }: Props = $props();

	const { layoutMode, maxWidth, padding } = SETTINGS.ui.content;
	const isExamContent = $derived(content.type === "exam");
</script>

{#if isExamContent}
	<div class="content-renderer">
		<article
			class="renderer-article"
			data-layout={layoutMode}
			data-max-width={maxWidth}
			data-padding={padding}
		>
			<ContentHeader
				title={content.title}
				chapterType="exam"
				estimatedTime={content.duration}
				prerequisites={content.prerequisites}
				summary={content.summary}
			/>

			<div class="renderer-content">
				<div class="renderer-placeholder">
					<p class="renderer-placeholder-text">
						🎯 <strong>Task 8I:</strong> Exam system integration coming soon
					</p>
					{#if content.exam}
						<p class="renderer-placeholder-text">
							Duration: {content.duration} min | Passing Score: {content.exam.passingScore}% |
							Questions: {content.exam.questions.length}
						</p>
					{/if}
				</div>
			</div>
		</article>
	</div>
{:else}
	<div class="content-renderer">
		<div class="renderer-error">
			<p>Error: Invalid content type. Expected "exam" but received "{content.type}".</p>
		</div>
	</div>
{/if}
