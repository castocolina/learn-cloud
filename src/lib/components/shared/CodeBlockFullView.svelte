<script lang="ts">
	/**
	 * CodeBlockFullView Component (Task 8F - Simplified)
	 *
	 * Minimal wrapper for expanded code blocks in Dialog.
	 * Renders Shiki-highlighted HTML with appropriate styling.
	 *
	 * ARCHITECTURE (2025-11-01):
	 * - Dialog handles scroll (via .dialog-content-scroll-wrapper)
	 * - Dialog header is sticky (remains visible during scroll)
	 * - This component only renders code content (minimal wrapper)
	 * - Action buttons handled by Dialog's actionButtons API
	 *
	 * Props passed from parent CodeBlock component via Dialog store.
	 */

	interface Props {
		/** Highlighted HTML code from Shiki */
		highlightedCode: string;
	}

	let { highlightedCode }: Props = $props();
</script>

<div class="code-block-full-view">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html highlightedCode}
</div>

<style>
	.code-block-full-view {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1.7;
		padding: 1rem;
	}

	.code-block-full-view :global(pre) {
		margin: 0;
		padding: 1.5rem;
		background: transparent !important;
	}

	.code-block-full-view :global(code) {
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}

	/* Larger font on desktop */
	@media (min-width: 1024px) {
		.code-block-full-view {
			font-size: 1rem;
		}
	}
</style>
