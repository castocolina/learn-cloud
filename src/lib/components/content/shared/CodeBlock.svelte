<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import type { CodeBlock } from "$data/types";
	import { Copy, Check } from "lucide-svelte";

	interface Props {
		codeBlock: CodeBlock;
		class?: string;
	}

	let { codeBlock, class: className = "" }: Props = $props();

	let highlightedCode = $state("");
	let isCopied = $state(false);
	let codeElement: HTMLElement;

	// Initialize Shiki highlighter on client-side
	onMount(async () => {
		if (browser) {
			try {
				const { codeToHtml } = await import("shiki");

				highlightedCode = await codeToHtml(codeBlock.code, {
					lang: codeBlock.language,
					theme: "github-light", // Clean theme that matches the project
					structure: "inline"
				});
			} catch (error) {
				console.error("Error highlighting code:", error);
				// Fallback to plain text
				highlightedCode = `<pre><code>${codeBlock.code}</code></pre>`;
			}
		}
	});

	// Copy code to clipboard
	async function copyCode() {
		if (browser && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(codeBlock.code);
				isCopied = true;
				setTimeout(() => {
					isCopied = false;
				}, 2000);
			} catch (error) {
				console.error("Failed to copy code:", error);
			}
		}
	}
</script>

<div class="code-block-wrapper {className}">
	{#if codeBlock.title || codeBlock.filename}
		<div class="code-header">
			<div class="code-info">
				{#if codeBlock.title}
					<h4 class="code-title">{codeBlock.title}</h4>
				{/if}
				{#if codeBlock.filename}
					<span class="code-filename">{codeBlock.filename}</span>
				{/if}
			</div>
			<button
				class="copy-button"
				onclick={copyCode}
				aria-label="Copy code to clipboard"
				type="button"
			>
				{#if isCopied}
					<Check size={16} />
				{:else}
					<Copy size={16} />
				{/if}
			</button>
		</div>
	{:else}
		<div class="copy-button-only">
			<button
				class="copy-button"
				onclick={copyCode}
				aria-label="Copy code to clipboard"
				type="button"
			>
				{#if isCopied}
					<Check size={16} />
				{:else}
					<Copy size={16} />
				{/if}
			</button>
		</div>
	{/if}

	<div class="code-content">
		{#if highlightedCode}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html highlightedCode}
		{:else}
			<!-- Fallback for SSR or if highlighting fails -->
			<pre class="fallback-pre"><code>{codeBlock.code}</code></pre>
		{/if}
	</div>
</div>
