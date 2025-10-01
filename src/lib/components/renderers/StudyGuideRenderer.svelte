<script lang="ts">
	/**
	 * Study Guide Renderer Component
	 *
	 * Displays study guide content with:
	 * - Study guide title and summary
	 * - Flashcards (to be implemented in TASK 7)
	 * - Key concepts
	 * - Configurable layout based on SETTINGS.ui.content
	 *
	 * TODO (TASK 7):
	 * - Integrate Flipcard component (TASK 8H)
	 * - Add modal expansion (TASK 8E)
	 * - Add progress tracking
	 * - Add study session management
	 *
	 * @component StudyGuideRenderer
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
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Study Guide rendering</p>
			</div>
		</div>
	</article>
</div>
