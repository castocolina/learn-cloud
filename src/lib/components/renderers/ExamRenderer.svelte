<script lang="ts">
	/**
	 * Exam Renderer Component
	 *
	 * Displays exam content with:
	 * - Exam title and instructions
	 * - Questions (to be implemented in TASK 7)
	 * - Timer and navigation (to be implemented in TASK 8I)
	 * - Configurable layout based on SETTINGS.ui.content
	 *
	 * TODO (TASK 7 & 8I):
	 * - Add exam questions rendering
	 * - Integrate exam navigation (TASK 8I)
	 * - Add timer with time limits
	 * - Add progress tracking
	 * - Add scoring and results
	 * - Add exam submission
	 *
	 * @component ExamRenderer
	 */

	import type { ContentRendererProps } from "$types";
	import { SETTINGS } from "$config/settings.js";

	let { content }: ContentRendererProps = $props();

	// Extract content layout configuration
	const { layoutMode, maxWidth, padding } = SETTINGS.ui.content;
</script>

<div class="content-renderer">
	<article
		class="renderer-article"
		data-layout={layoutMode}
		data-max-width={maxWidth}
		data-padding={padding}
	>
		<header class="renderer-header">
			<h1>{content.title}</h1>
			{#if content.summary}
				<p class="text-slate-600 dark:text-slate-400">{content.summary}</p>
			{/if}
		</header>
		<div class="renderer-content">
			<div class="renderer-placeholder">
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Exam rendering</p>
			</div>
		</div>
	</article>
</div>
