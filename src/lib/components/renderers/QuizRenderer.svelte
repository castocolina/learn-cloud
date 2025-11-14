<script lang="ts">
	/**
	 * Quiz Renderer Component (Task 7 + Production Quiz Engine Integration)
	 *
	 * Displays quiz content with:
	 * - Type-specific header with orange gradient and quiz icon (❓)
	 * - Full production quiz engine with all 6 question types
	 * - Quiz-specific configuration (learning mode: shows results, allows retry)
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 * - QuizEngine encapsulated component (handles all quiz logic)
	 *
	 * @component QuizRenderer
	 */

	import type { QuizContent } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";
	import QuizEngine from "$lib/components/content/QuizEngine.svelte";

	interface Props {
		content: QuizContent;
	}

	let { content }: Props = $props();

	const { layoutMode, maxWidth, padding } = SETTINGS.ui.content;
	const isQuizContent = $derived(content.type === "quiz");
</script>

{#if isQuizContent}
	<div class="content-renderer">
		<article
			class="renderer-article"
			data-layout={layoutMode}
			data-max-width={maxWidth}
			data-padding={padding}
		>
			<ContentHeader title={content.title} chapterType="quiz" summary={content.summary} />

			<div class="renderer-content">
				{#if content.quiz}
					<!-- Production Quiz Engine (Task 8J) -->
					<QuizEngine
						questionPool={content.quiz.questions}
						config={SETTINGS.content.quiz}
						title={content.title}
					/>
				{:else}
					<div class="renderer-placeholder">
						<p class="renderer-placeholder-text">❓ No quiz data available for this content.</p>
					</div>
				{/if}
			</div>
		</article>
	</div>
{:else}
	<div class="content-renderer">
		<div class="renderer-error">
			<p>Error: Invalid content type. Expected "quiz" but received "{content.type}".</p>
		</div>
	</div>
{/if}
