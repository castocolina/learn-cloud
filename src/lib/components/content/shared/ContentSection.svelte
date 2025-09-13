<script lang="ts">
	import type { ContentSection } from "$data/types";
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
</script>

<section class="content-section {className}">
	<!-- Section heading -->
	{#if section.heading}
		<h2 class="section-heading">{section.heading}</h2>
	{/if}

	<!-- Paragraphs -->
	{#if section.paragraphs?.length}
		<div class="section-paragraphs">
			{#each section.paragraphs as paragraph}
				<div class="paragraph">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html paragraph}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Code blocks -->
	{#if section.codeBlocks?.length}
		<div class="section-code-blocks">
			{#each section.codeBlocks as codeBlock}
				<CodeBlock {codeBlock} />
			{/each}
		</div>
	{/if}

	<!-- Diagrams -->
	{#if section.diagrams?.length}
		<div class="section-diagrams">
			{#each section.diagrams as diagram}
				<Mermaid {diagram} />
			{/each}
		</div>
	{/if}

	<!-- Callouts -->
	{#if section.callouts?.length}
		<div class="section-callouts">
			{#each section.callouts as callout}
				{@const config = calloutConfig[callout.type]}
				<div class="callout {config.class}">
					<div class="callout-header">
						{#if callout.type === "info"}
							<Info size={16} />
						{:else if callout.type === "warning"}
							<TriangleAlert size={16} />
						{:else if callout.type === "danger"}
							<CircleAlert size={16} />
						{:else if callout.type === "success"}
							<CircleCheck size={16} />
						{/if}
						{#if callout.title}
							<span class="callout-title">{callout.title}</span>
						{/if}
					</div>
					<div class="callout-content">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html callout.content}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
