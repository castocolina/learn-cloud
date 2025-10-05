<script lang="ts">
	/**
	 * Formatted Text Component (TASK 7B)
	 *
	 * Renders text with array of formatting styles using recursive pattern.
	 * Eliminates if/else combinatorial explosion by processing styles one at a time.
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Recursive self-reference with <svelte:self>
	 * - Array of styles processed sequentially
	 * - NO {@html} usage - XSS-safe by design
	 *
	 * Benefits:
	 * - 4 simple conditions vs 9 nested combinations
	 * - Type-safe (TextStyle[] from types)
	 * - Extensible (add new styles easily)
	 *
	 * @component FormattedText
	 */

	import Self from "./FormattedText.svelte";
	import type { TextStyle } from "$types";

	interface Props {
		/** Text content to render */
		content: string;
		/** Array of formatting styles to apply */
		styles?: TextStyle[];
		/** Text color (CSS value) */
		color?: string;
		/** Background highlight color (CSS value) */
		highlight?: string;
		/** Additional CSS classes */
		className?: string;
		/** Accessibility label */
		ariaLabel?: string;
	}

	let { content, styles = [], color, highlight, className, ariaLabel }: Props = $props();

	/**
	 * Map TextStyle to HTML tag names
	 * Eliminates if/else chain with simple lookup
	 */
	const STYLE_TAG_MAP: Record<TextStyle, string> = {
		bold: "strong",
		italic: "em",
		code: "code",
		strikethrough: "s"
	};

	// Deconstruct styles array: first style and remaining styles
	const [firstStyle, ...remainingStyles] = styles;
	const hasStyles = styles.length > 0;

	/**
	 * Current tag to render (with fallback to span for unknown styles)
	 */
	const currentTag = $derived(firstStyle ? STYLE_TAG_MAP[firstStyle] || "span" : "span");

	/**
	 * Build inline styles for color and highlight
	 */
	const inlineStyle = $derived.by(() => {
		const styleArray: string[] = [];
		if (color) styleArray.push(`color: ${color}`);
		if (highlight) styleArray.push(`background-color: ${highlight}`);
		return styleArray.length > 0 ? styleArray.join("; ") : undefined;
	});

	/**
	 * Build CSS classes
	 */
	const computedClass = $derived(className ? `rich-fragment ${className}` : "rich-fragment");
</script>

{#if !hasStyles}
	<!-- Base case: no more styles to apply, render final span -->
	<span class={computedClass} style={inlineStyle} aria-label={ariaLabel}>
		{content}
	</span>
{:else}
	<!-- Recursive case: wrap in appropriate tag and recurse with remaining styles -->
	<svelte:element this={currentTag}>
		<Self {content} styles={remainingStyles} {color} {highlight} {className} {ariaLabel} />
	</svelte:element>
{/if}
