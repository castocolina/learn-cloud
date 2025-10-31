<script lang="ts">
	/**
	 * Rich Paragraph Component
	 *
	 * Clean composition-based renderer for RichTextNode[] arrays.
	 *
	 * Architecture:
	 * - Type-safe discriminated union dispatch (TextNode, LinkNode, HeadingNode)
	 * - Component composition (FormattedText + ExternalLink)
	 * - No code duplication
	 * - Secure rendering with proper escaping
	 *
	 * @component RichParagraph
	 */

	import FormattedText from "./FormattedText.svelte";
	import ExternalLink from "./ExternalLink.svelte";
	import type { RichParagraphProps } from "$types";

	let { nodes, class: className }: RichParagraphProps = $props();
</script>

<p class="rich-paragraph {className || ''}">
	{#each nodes as node, index (index)}
		{#if node.type === "text"}
			<!-- Plain or formatted text -->
			<FormattedText
				content={node.content}
				styles={node.styles}
				color={node.color}
				highlight={node.highlight}
				className={node.className}
				ariaLabel={node.ariaLabel}
			/>
		{:else if node.type === "link"}
			<!-- Hyperlink with formatted text inside -->
			<ExternalLink href={node.href} target={node.target}>
				<FormattedText
					content={node.content}
					styles={node.styles}
					color={node.color}
					highlight={node.highlight}
					className={node.className}
					ariaLabel={node.ariaLabel}
				/>
			</ExternalLink>
		{:else if node.type === "heading"}
			<!-- Semantic heading with formatted text -->
			<svelte:element this={`h${node.level}`}>
				<FormattedText
					content={node.content}
					styles={node.styles}
					color={node.color}
					highlight={node.highlight}
					className={node.className}
					ariaLabel={node.ariaLabel}
				/>
			</svelte:element>
		{/if}
	{/each}
</p>
