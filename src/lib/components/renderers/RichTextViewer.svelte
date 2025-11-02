<script lang="ts">
	/**
	 * Rich Text Viewer Component (Task 7)
	 *
	 * Generic renderer for ContentBlock union types with type-safe delegation
	 * to specialized components.
	 *
	 * Supported Block Types:
	 * - ParagraphBlock: Rich text paragraphs with inline formatting
	 * - CodeBlock: Syntax-highlighted code (placeholder for Task 8F)
	 * - DiagramBlock: Mermaid diagrams (placeholder for Task 8G)
	 * - CalloutBlock: Highlighted information boxes
	 * - ImageBlock: Images with captions
	 * - VideoBlock: Video embeds with controls
	 * - InteractiveBlock: Embedded interactive components
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns (ContentBlock union type)
	 * - Type guards for safe block type discrimination
	 * - Centralized CSS in src/styles/components.css
	 *
	 * Note: {@html} is used for rich text rendering with sanitized input from typed content
	 *
	 * @component RichTextViewer
	 */

	import type { ContentBlock, RichTextViewerProps, ProgrammingLanguage } from "$types";
	import RichParagraph from "./RichParagraph.svelte";
	import CodeBlock from "$lib/components/shared/CodeBlock.svelte";

	let { blocks, class: className }: RichTextViewerProps = $props();

	/**
	 * Type guard for ParagraphBlock
	 */
	function isParagraphBlock(
		block: ContentBlock
	): block is Extract<ContentBlock, { type: "paragraph" }> {
		return block.type === "paragraph";
	}

	/**
	 * Type guard for CodeBlock
	 */
	function isCodeBlock(block: ContentBlock): block is Extract<ContentBlock, { type: "code" }> {
		return block.type === "code";
	}

	/**
	 * Type guard for DiagramBlock
	 */
	function isDiagramBlock(
		block: ContentBlock
	): block is Extract<ContentBlock, { type: "diagram" }> {
		return block.type === "diagram";
	}

	/**
	 * Type guard for CalloutBlock
	 */
	function isCalloutBlock(
		block: ContentBlock
	): block is Extract<ContentBlock, { type: "callout" }> {
		return block.type === "callout";
	}

	/**
	 * Type guard for ImageBlock
	 */
	function isImageBlock(block: ContentBlock): block is Extract<ContentBlock, { type: "image" }> {
		return block.type === "image";
	}

	/**
	 * Type guard for VideoBlock
	 */
	function isVideoBlock(block: ContentBlock): block is Extract<ContentBlock, { type: "video" }> {
		return block.type === "video";
	}

	/**
	 * Type guard for InteractiveBlock
	 */
	function isInteractiveBlock(
		block: ContentBlock
	): block is Extract<ContentBlock, { type: "interactive" }> {
		return block.type === "interactive";
	}
</script>

<div class="rich-text-viewer {className || ''}">
	{#each blocks as block, index (block.id || `block-${index}`)}
		{#if isParagraphBlock(block)}
			<!-- Paragraph Block: Rich text with inline formatting (Task 7B - Secure rendering without {@html}) -->
			<RichParagraph nodes={block.content} />
		{:else if isCodeBlock(block)}
			<!-- Code Block: Full syntax highlighting with Shiki (Task 8F) -->
			{#if block.title || block.filename}
				<!-- With header: Use external wrapper (matches showcase design) -->
				<div class="code-block-wrapper">
					<div class="code-block-external-header">
						{#if block.title}
							<h4 class="code-block-external-title">{block.title}</h4>
						{/if}
						{#if block.filename}
							<span class="code-block-external-filename">{block.filename}</span>
						{/if}
					</div>
					<CodeBlock
						code={block.code}
						language={block.language as ProgrammingLanguage}
						showExpandButton={true}
						showCopyButton={true}
						showDownloadButton={true}
					/>
				</div>
			{:else}
				<!-- Without header: Use component standalone -->
				<CodeBlock
					code={block.code}
					language={block.language as ProgrammingLanguage}
					showExpandButton={true}
					showCopyButton={true}
					showDownloadButton={true}
				/>
			{/if}
		{:else if isDiagramBlock(block)}
			<!-- Diagram Block: Placeholder for Task 8G (MermaidDiagram component) -->
			<div class="content-block content-block-diagram">
				{#if block.title}
					<div class="content-block-header">
						<span class="content-block-icon">📊</span>
						<h4 class="content-block-title">{block.title}</h4>
					</div>
				{/if}
				<div class="diagram-placeholder">
					<p class="content-block-note">
						📊 <strong>Task 8G:</strong> Mermaid diagram rendering coming soon
					</p>
					<pre class="diagram-code">{block.definition}</pre>
				</div>
				{#if block.caption}
					<p class="content-block-caption">{block.caption}</p>
				{/if}
			</div>
		{:else if isCalloutBlock(block)}
			<!-- Callout Block: Highlighted information boxes -->
			<div class="content-block content-block-callout content-callout-{block.calloutType}">
				{#if block.title}
					<div class="content-block-header">
						<span class="callout-icon">
							{#if block.calloutType === "info"}ℹ️
							{:else if block.calloutType === "warning"}⚠️
							{:else if block.calloutType === "danger"}❌
							{:else if block.calloutType === "success"}✅
							{:else if block.calloutType === "tip"}💡
							{/if}
						</span>
						<h4 class="content-block-title">{block.title}</h4>
					</div>
				{/if}
				<!-- Task 7B - Secure rendering without {@html} -->
				<RichParagraph nodes={block.content} class="callout-content" />
			</div>
		{:else if isImageBlock(block)}
			<!-- Image Block: Images with captions -->
			<figure class="content-block content-block-image">
				<img
					src={block.src}
					alt={block.alt}
					width={block.width}
					height={block.height}
					class="content-image"
					loading="lazy"
				/>
				{#if block.caption}
					<figcaption class="content-block-caption">{block.caption}</figcaption>
				{/if}
			</figure>
		{:else if isVideoBlock(block)}
			<!-- Video Block: Video embeds with controls -->
			<figure class="content-block content-block-video">
				<!-- svelte-ignore a11y_media_has_caption -->
				<!-- Note: Captions are optional and provided via VideoBlock.tracks when available -->
				<video
					src={block.src}
					poster={block.poster}
					controls={block.controls ?? true}
					autoplay={block.autoplay ?? false}
					class="content-video"
				>
					{#if block.tracks && block.tracks.length > 0}
						{#each block.tracks as track (`${track.src}-${track.srclang}`)}
							<track
								src={track.src}
								kind={track.kind}
								srclang={track.srclang}
								label={track.label}
								default={track.default ?? false}
							/>
						{/each}
					{/if}
					Your browser does not support the video tag.
				</video>
				{#if block.caption}
					<figcaption class="content-block-caption">{block.caption}</figcaption>
				{/if}
			</figure>
		{:else if isInteractiveBlock(block)}
			<!-- Interactive Block: Embedded interactive components -->
			<div class="content-block content-block-interactive">
				{#if block.title}
					<div class="content-block-header">
						<span class="content-block-icon">🎮</span>
						<h4 class="content-block-title">{block.title}</h4>
					</div>
				{/if}
				{#if block.description}
					<p class="content-block-description">{block.description}</p>
				{/if}
				<div class="interactive-placeholder">
					<p class="content-block-note">
						🎮 <strong>Interactive Component:</strong>
						{block.component}
					</p>
					<p class="content-block-note">Component loading coming in future tasks...</p>
				</div>
			</div>
		{:else}
			<!-- Unknown Block Type: Fallback -->
			<div class="content-block content-block-unknown">
				<p class="content-block-note">
					⚠️ <strong>Unknown block type:</strong> Unable to render this content block
				</p>
			</div>
		{/if}
	{/each}
</div>
