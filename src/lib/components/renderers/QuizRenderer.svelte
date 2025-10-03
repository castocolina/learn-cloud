<script lang="ts">
	/**
	 * Quiz Renderer Component (Task 7)
	 *
	 * Displays quiz content with:
	 * - Type-specific header with orange gradient and quiz icon (❓)
	 * - Quiz integration (existing demo quiz functionality)
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 *
	 * @component QuizRenderer
	 */

	import type { QuizContent } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";

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
				<div class="renderer-placeholder">
					<p class="renderer-placeholder-text">
						❓ <strong>Task 8I:</strong> Quiz system integration coming soon
					</p>
					{#if content.quiz}
						<p class="renderer-placeholder-text">
							Passing Score: {content.quiz.passingScore}% | Questions: {content.quiz.questions
								.length}
						</p>
					{/if}
				</div>
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
