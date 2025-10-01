<script lang="ts">
	/**
	 * Project Renderer Component
	 *
	 * Displays project content with:
	 * - Project title and description
	 * - Requirements and objectives
	 * - Milestones (to be implemented in TASK 7)
	 * - Configurable layout based on SETTINGS.ui.content
	 *
	 * TODO (TASK 7):
	 * - Add project requirements display
	 * - Add milestone tracking
	 * - Add deliverables checklist
	 * - Add resource links
	 * - Add submission interface
	 *
	 * @component ProjectRenderer
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
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Project rendering</p>
			</div>
		</div>
	</article>
</div>
