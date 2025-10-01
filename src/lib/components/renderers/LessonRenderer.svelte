<script lang="ts">
	/**
	 * Lesson Renderer Component
	 *
	 * Displays lesson content with:
	 * - Lesson title and summary
	 * - Content sections
	 * - Code examples (to be enhanced in TASK 7)
	 * - Diagrams (to be enhanced in TASK 7)
	 * - Configurable layout based on SETTINGS.ui.content
	 *
	 * TODO (TASK 7):
	 * - Add rich text rendering
	 * - Integrate CodeBlock component (TASK 8F)
	 * - Integrate Diagram component (TASK 8G)
	 * - Add interactive elements
	 * - Add progress tracking
	 *
	 * @component LessonRenderer
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
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Lesson rendering</p>
			</div>
		</div>
	</article>
</div>
