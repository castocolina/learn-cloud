<!--
 * Callout Component
 *
 * Reusable component for rendering callout blocks with icons and styled containers.
 * Eliminates code duplication across RichTextViewer and OverviewRenderer.
 *
 * Features:
 * - Icon mapping for callout types (info, warning, danger, success, tip)
 * - Secure content rendering with RichParagraph component
 * - Type-safe props with CalloutBlock interface
 * - Customizable styling via class prop
 *
 * Usage:
 *   <Callout block={calloutBlock} />
 *   <Callout block={calloutBlock} class="custom-class" />
-->
<script lang="ts">
	import type { CalloutBlock } from "$types";
	import RichParagraph from "$lib/components/renderers/RichParagraph.svelte";

	interface Props {
		/** Callout block data */
		block: CalloutBlock;
		/** Optional CSS class for custom styling */
		class?: string;
	}

	let { block, class: className = "" }: Props = $props();

	/**
	 * Icon mapping for callout styles
	 * Maps CalloutBlock.style to corresponding emoji
	 */
	const CALLOUT_ICONS = {
		info: "ℹ️",
		warning: "⚠️",
		danger: "❌",
		success: "✅",
		tip: "💡"
	} as const;
</script>

<div class="content-block content-block-callout content-callout-{block.style} {className}">
	{#if block.title}
		<div class="content-block-header">
			<span class="callout-icon">{CALLOUT_ICONS[block.style]}</span>
			<h4 class="content-block-title">{block.title}</h4>
		</div>
	{/if}
	<!-- Secure rendering without {@html} using RichParagraph -->
	<RichParagraph nodes={block.content} class="callout-content" />
</div>
