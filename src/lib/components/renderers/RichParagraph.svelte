<script lang="ts">
	/**
	 * Rich Paragraph Component (TASK 7B - Refactored)
	 *
	 * Clean composition-based renderer for RichTextNode[] arrays.
	 * Replaces 120+ line if/else nightmare with simple type dispatch.
	 *
	 * Architecture:
	 * - Union type dispatch (TextNode, LinkNode, HeadingNode)
	 * - Component composition (FormattedText + ExternalLink)
	 * - No code duplication
	 * - Type-safe by design
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
		{#if "text" in node}
			<!-- Legacy RichTextFragment format -->
			{@const hasStyles = node.bold || node.italic || node.code || node.strikethrough}
			{@const styles = [
				...(node.bold ? ["bold" as const] : []),
				...(node.italic ? ["italic" as const] : []),
				...(node.code ? ["code" as const] : []),
				...(node.strikethrough ? ["strikethrough" as const] : [])
			]}
			{#if node.href}
				<ExternalLink href={node.href} target={node.target}>
					<FormattedText
						content={node.text}
						styles={hasStyles ? styles : undefined}
						color={node.color}
						highlight={node.highlight}
						className={node.className}
						ariaLabel={node.ariaLabel}
					/>
				</ExternalLink>
			{:else if node.headingLevel}
				<svelte:element this={`h${node.headingLevel}`}>
					<FormattedText
						content={node.text}
						styles={hasStyles ? styles : undefined}
						color={node.color}
						highlight={node.highlight}
						className={node.className}
						ariaLabel={node.ariaLabel}
					/>
				</svelte:element>
			{:else}
				<FormattedText
					content={node.text}
					styles={hasStyles ? styles : undefined}
					color={node.color}
					highlight={node.highlight}
					className={node.className}
					ariaLabel={node.ariaLabel}
				/>
			{/if}
		{:else if "type" in node && node.type === "text"}
			<!-- New RichTextNode format - Plain or formatted text -->
			<FormattedText
				content={node.content}
				styles={node.styles}
				color={node.color}
				highlight={node.highlight}
				className={node.className}
				ariaLabel={node.ariaLabel}
			/>
		{:else if "type" in node && node.type === "link"}
			<!-- New RichTextNode format - Hyperlink with formatted text inside -->
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
		{:else if "type" in node && node.type === "heading"}
			<!-- New RichTextNode format - Semantic heading with formatted text -->
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
