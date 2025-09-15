<script lang="ts">
	import type { ContentSection, ContentBlock } from "$data/types";
	import CodeBlock from "./CodeBlock.svelte";
	import Mermaid from "./Mermaid.svelte";
	import { CircleAlert, Info, TriangleAlert, CircleCheck } from "lucide-svelte";

	interface Props {
		section: ContentSection;
		class?: string;
	}

	let { section, class: className = "" }: Props = $props();

	// Map callout types to icons and styles
	const calloutConfig = {
		info: { icon: Info, class: "callout-info" },
		warning: { icon: TriangleAlert, class: "callout-warning" },
		danger: { icon: CircleAlert, class: "callout-danger" },
		success: { icon: CircleCheck, class: "callout-success" }
	};

	// Type guard functions for content blocks
	function isParagraphBlock(block: ContentBlock): block is ContentBlock & { type: "paragraph" } {
		return block.type === "paragraph";
	}

	function isCodeBlock(block: ContentBlock): block is ContentBlock & { type: "code" } {
		return block.type === "code";
	}

	function isDiagramBlock(block: ContentBlock): block is ContentBlock & { type: "diagram" } {
		return block.type === "diagram";
	}

	function isCalloutBlock(block: ContentBlock): block is ContentBlock & { type: "callout" } {
		return block.type === "callout";
	}
</script>

<section class="content-section {className}">
	<!-- Section heading -->
	{#if section.title}
		<h2 class="section-heading">{section.title}</h2>
	{/if}

	<!-- Content blocks -->
	{#if section.content?.length}
		<div class="section-content">
			{#each section.content as block}
				{#if isParagraphBlock(block)}
					<div class="paragraph">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html block.content}
					</div>
				{:else if isCodeBlock(block)}
					<CodeBlock codeBlock={block} />
				{:else if isDiagramBlock(block)}
					<Mermaid diagram={block} />
				{:else if isCalloutBlock(block)}
					{@const config = calloutConfig[block.calloutType]}
					<div class="callout {config.class}">
						<div class="callout-header">
							{#if block.calloutType === "info"}
								<Info size={16} />
							{:else if block.calloutType === "warning"}
								<TriangleAlert size={16} />
							{:else if block.calloutType === "danger"}
								<CircleAlert size={16} />
							{:else if block.calloutType === "success"}
								<CircleCheck size={16} />
							{/if}
							{#if block.title}
								<span class="callout-title">{block.title}</span>
							{/if}
						</div>
						<div class="callout-content">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html block.content}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</section>
