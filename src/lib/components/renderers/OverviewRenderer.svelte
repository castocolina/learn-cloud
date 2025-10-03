<script lang="ts">
	/**
	 * Overview Renderer Component (Task 7)
	 *
	 * Displays unit overview content with:
	 * - Type-specific header with overview icon (📖)
	 * - Chapter cards and navigation
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns
	 * - ContentHeader shared component
	 *
	 * @component OverviewRenderer
	 */

	import type { ContentRendererProps } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import ContentHeader from "$lib/components/shared/ContentHeader.svelte";

	let { content }: ContentRendererProps = $props();

	const { layoutMode, maxWidth, padding } = SETTINGS.ui.content;
</script>

<div class="content-renderer">
	<article
		class="renderer-article"
		data-layout={layoutMode}
		data-max-width={maxWidth}
		data-padding={padding}
	>
		<ContentHeader title={content.title} chapterType="overview" summary={content.summary} />

		<div class="renderer-content">
			<div class="renderer-placeholder">
				<p class="renderer-placeholder-text">TODO: Interactive chapter cards coming soon</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>

				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
				<p class="renderer-placeholder-text">TODO: TASK 7 - Implement Overview rendering</p>
			</div>
		</div>
	</article>
</div>
