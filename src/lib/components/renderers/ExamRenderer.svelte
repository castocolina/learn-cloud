<script lang="ts">
	/**
	 * Exam Renderer Component (Task 7 + Production Quiz Engine Integration)
	 *
	 * Displays exam content with:
	 * - Type-specific header with red gradient and exam icon (🎯)
	 * - Full production quiz engine with all 6 question types
	 * - Exam-specific configuration (formal assessment: hides results, no retry)
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 * - QuizEngine encapsulated component (handles all exam logic)
	 *
	 * @component ExamRenderer
	 */

	import type { ExamContent } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";
	import QuizEngine from "$lib/components/content/QuizEngine.svelte";

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
				{#if content.exam}
					<!-- Production Quiz Engine (Task 8J) -->
					<QuizEngine
						questionPool={content.exam.questions}
						config={SETTINGS.content.exam}
						title={content.title}
					/>
				{:else}
					<div class="renderer-placeholder">
						<p class="renderer-placeholder-text">🎯 No exam data available for this content.</p>
					</div>
				{/if}
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
