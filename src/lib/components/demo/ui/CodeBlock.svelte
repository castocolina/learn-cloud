<script lang="ts">
	import { onMount } from "svelte";
	import { Copy, Check, Eye, EyeOff } from "lucide-svelte";
	import type { CodeExample, Language } from "../../../../data/demo/content/code/code-examples";
	import { createHighlighter } from "shiki";

	// Props interface for type safety
	interface Props {
		/** Code example to display */
		example: CodeExample;
		/** Whether to show line numbers */
		showLineNumbers?: boolean;
		/** Whether to show copy button */
		showCopyButton?: boolean;
		/** Whether to show metadata */
		showMetadata?: boolean;
		/** Custom CSS class */
		className?: string;
	}

	let {
		example,
		showLineNumbers = true,
		showCopyButton = true,
		showMetadata = true,
		className = ""
	}: Props = $props();

	// State variables
	let highlightedCode = $state("");
	let isLoading = $state(true);
	let copySuccess = $state(false);
	let showCode = $state(true);
	let codeElement = $state<HTMLElement | undefined>(undefined);

	// Language mapping for Shiki
	const languageMap: Record<Language, string> = {
		typescript: "typescript",
		svelte: "svelte",
		javascript: "javascript",
		python: "python",
		go: "go",
		java: "java",
		rust: "rust",
		php: "php",
		hcl: "hcl",
		yaml: "yaml",
		dockerfile: "dockerfile",
		bash: "bash",
		sql: "sql",
		graphql: "graphql",
		cypher: "cypher",
		json: "json",
		proto: "protobuf",
		dynamodb: "bash" // fallback for DynamoDB CLI commands
	};

	// Initialize syntax highlighter
	onMount(async () => {
		try {
			const highlighter = await createHighlighter({
				themes: ["github-light", "github-dark", "vitesse-light", "vitesse-dark"],
				langs: [
					"typescript",
					"svelte",
					"javascript",
					"python",
					"go",
					"java",
					"rust",
					"php",
					"hcl",
					"yaml",
					"dockerfile",
					"bash",
					"sql",
					"graphql",
					"cypher",
					"json",
					"protobuf"
				]
			});

			const shikiLang = languageMap[example.language] || "text";

			highlightedCode = highlighter.codeToHtml(example.code, {
				lang: shikiLang,
				themes: {
					light: "vitesse-light",
					dark: "vitesse-dark"
				},
				defaultColor: false,
				transformers: [
					{
						code(node) {
							// Add line numbers if requested
							if (showLineNumbers) {
								const lines = example.code.split("\n");
								lines.forEach((_, index) => {
									if (node.children[index]) {
										// Add line number data attribute
										if (node.children[index].type === "element") {
											node.children[index].properties = {
												...node.children[index].properties,
												"data-line-number": index + 1
											};
										}
									}
								});
							}
						}
					}
				]
			});

			isLoading = false;
		} catch (error) {
			console.error("Error initializing syntax highlighter:", error);
			// Fallback to plain text with basic formatting
			highlightedCode = `<pre><code>${escapeHtml(example.code)}</code></pre>`;
			isLoading = false;
		}
	});

	// Utility function to escape HTML
	function escapeHtml(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	// Copy to clipboard functionality
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(example.code);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (error) {
			console.error("Failed to copy code:", error);
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = example.code;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		}
	}

	// Toggle code visibility
	function toggleCodeVisibility() {
		showCode = !showCode;
	}

	// Get complexity badge color
	function getComplexityColor(complexity: string): string {
		switch (complexity) {
			case "beginner":
				return "demo-code-complexity-beginner";
			case "intermediate":
				return "demo-code-complexity-intermediate";
			case "advanced":
				return "demo-code-complexity-advanced";
			default:
				return "demo-code-complexity-beginner";
		}
	}

	// Get language badge color
	function getLanguageColor(language: Language): string {
		const colors: Record<Language, string> = {
			typescript: "demo-code-lang-typescript",
			svelte: "demo-code-lang-svelte",
			javascript: "demo-code-lang-javascript",
			python: "demo-code-lang-python",
			go: "demo-code-lang-go",
			java: "demo-code-lang-java",
			rust: "demo-code-lang-rust",
			php: "demo-code-lang-php",
			hcl: "demo-code-lang-hcl",
			yaml: "demo-code-lang-yaml",
			dockerfile: "demo-code-lang-dockerfile",
			bash: "demo-code-lang-bash",
			sql: "demo-code-lang-sql",
			graphql: "demo-code-lang-graphql",
			cypher: "demo-code-lang-cypher",
			json: "demo-code-lang-json",
			proto: "demo-code-lang-proto",
			dynamodb: "demo-code-lang-dynamodb"
		};
		return colors[language] || "demo-code-lang-default";
	}
</script>

<!-- Code Block Container -->
<div class="demo-code-block {className}">
	<!-- Metadata Header -->
	{#if showMetadata}
		<div class="demo-code-header">
			<div class="demo-code-info">
				<h3 class="demo-code-title">{example.title}</h3>
				<p class="demo-code-description">{example.description}</p>

				<div class="demo-code-badges">
					<span
						class="demo-code-badge demo-code-badge-language {getLanguageColor(example.language)}"
					>
						{example.language.toUpperCase()}
					</span>
					<span
						class="demo-code-badge demo-code-badge-complexity {getComplexityColor(
							example.complexity
						)}"
					>
						{example.complexity}
					</span>
				</div>
			</div>

			<div class="demo-code-actions">
				{#if showCopyButton}
					<button
						class="demo-code-action-btn"
						onclick={copyToClipboard}
						title={copySuccess ? "Copied!" : "Copy to clipboard"}
						aria-label={copySuccess ? "Copied to clipboard" : "Copy code to clipboard"}
					>
						{#if copySuccess}
							<Check size={16} />
						{:else}
							<Copy size={16} />
						{/if}
					</button>
				{/if}

				<button
					class="demo-code-action-btn"
					onclick={toggleCodeVisibility}
					title={showCode ? "Hide code" : "Show code"}
					aria-label={showCode ? "Hide code block" : "Show code block"}
				>
					{#if showCode}
						<EyeOff size={16} />
					{:else}
						<Eye size={16} />
					{/if}
				</button>
			</div>
		</div>
	{/if}

	<!-- Code Content -->
	{#if showCode}
		<div class="demo-code-content">
			{#if isLoading}
				<div class="demo-code-loading">
					<div class="demo-code-skeleton">
						<div class="demo-code-skeleton-line"></div>
						<div class="demo-code-skeleton-line"></div>
						<div class="demo-code-skeleton-line"></div>
					</div>
					<p class="demo-code-loading-text">Loading syntax highlighting...</p>
				</div>
			{:else}
				<div
					class="demo-code-highlight-container"
					class:demo-code-line-numbers={showLineNumbers}
					bind:this={codeElement}
				>
					{@html highlightedCode}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Code Block Container */
	.demo-code-block {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		overflow: hidden;
		margin: 1rem 0;
		box-shadow: 0 2px 8px hsl(var(--primary) / 0.1);
	}

	/* Header */
	.demo-code-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem;
		background: hsl(var(--muted) / 0.3);
		border-bottom: 1px solid hsl(var(--border));
	}

	.demo-code-info {
		flex: 1;
		min-width: 0;
	}

	.demo-code-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.demo-code-description {
		font-size: 0.9rem;
		color: hsl(var(--muted-foreground));
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.demo-code-badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.demo-code-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.demo-code-badge-language {
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border: 1px solid hsl(var(--primary) / 0.2);
	}

	.demo-code-badge-complexity {
		border: 1px solid transparent;
	}

	/* Complexity Colors */
	.demo-code-complexity-beginner {
		background: hsl(142 76% 36% / 0.1);
		color: hsl(142 76% 36%);
		border-color: hsl(142 76% 36% / 0.2);
	}

	.demo-code-complexity-intermediate {
		background: hsl(38 92% 50% / 0.1);
		color: hsl(38 92% 50%);
		border-color: hsl(38 92% 50% / 0.2);
	}

	.demo-code-complexity-advanced {
		background: hsl(0 84% 60% / 0.1);
		color: hsl(0 84% 60%);
		border-color: hsl(0 84% 60% / 0.2);
	}

	/* Actions */
	.demo-code-actions {
		display: flex;
		gap: 0.5rem;
	}

	.demo-code-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		color: hsl(var(--muted-foreground));
	}

	.demo-code-action-btn:hover {
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border-color: hsl(var(--primary) / 0.3);
		transform: translateY(-1px);
	}

	/* Code Content */
	.demo-code-content {
		position: relative;
		background: hsl(var(--muted) / 0.2);
		border-radius: 0 0 12px 12px;
	}

	.demo-code-highlight-container {
		font-family: "JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace;
		font-size: 0.9rem;
		line-height: 1.6;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		margin: 1rem;
	}

	/* Global styles for Shiki output */
	.demo-code-highlight-container :global(pre) {
		margin: 0;
		padding: 1.5rem;
		background: hsl(var(--card)) !important;
		border-radius: 8px;
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		overflow-x: visible;
	}

	.demo-code-highlight-container :global(code) {
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		color: hsl(var(--foreground)) !important;
	}

	/* Enhanced syntax highlighting visibility */
	.demo-code-highlight-container :global(.shiki) {
		background: hsl(var(--card)) !important;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
	}

	.demo-code-highlight-container :global(.shiki .line) {
		min-height: 1.6em;
	}

	/* Ensure proper contrast for syntax elements */
	.demo-code-highlight-container :global(.token.keyword),
	.demo-code-highlight-container :global(.token.operator) {
		font-weight: 600;
	}

	.demo-code-highlight-container :global(.token.string),
	.demo-code-highlight-container :global(.token.template-string) {
		font-style: normal;
	}

	.demo-code-highlight-container :global(.token.comment) {
		opacity: 0.7;
		font-style: italic;
	}

	/* Line numbers */
	.demo-code-line-numbers :global(pre) {
		position: relative;
		padding-left: 3.5rem;
	}

	.demo-code-line-numbers :global(.line::before) {
		content: attr(data-line-number);
		position: absolute;
		left: 1rem;
		width: 2rem;
		color: hsl(var(--muted-foreground) / 0.6);
		text-align: right;
		user-select: none;
		font-size: 0.8rem;
	}

	/* Loading State */
	.demo-code-loading {
		padding: 1.5rem;
		text-align: center;
	}

	.demo-code-skeleton {
		margin-bottom: 1rem;
	}

	.demo-code-skeleton-line {
		height: 1rem;
		background: linear-gradient(
			90deg,
			hsl(var(--muted)) 0%,
			hsl(var(--muted) / 0.6) 50%,
			hsl(var(--muted)) 100%
		);
		border-radius: 4px;
		margin-bottom: 0.5rem;
		animation: demo-code-shimmer 2s ease-in-out infinite;
	}

	.demo-code-skeleton-line:nth-child(1) {
		width: 100%;
	}

	.demo-code-skeleton-line:nth-child(2) {
		width: 80%;
	}

	.demo-code-skeleton-line:nth-child(3) {
		width: 60%;
	}

	.demo-code-loading-text {
		color: hsl(var(--muted-foreground));
		font-size: 0.9rem;
		margin: 0;
	}

	@keyframes demo-code-shimmer {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
		100% {
			opacity: 1;
		}
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.demo-code-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.demo-code-actions {
			justify-content: flex-end;
		}

		.demo-code-title {
			font-size: 1rem;
		}

		.demo-code-description {
			font-size: 0.85rem;
		}

		.demo-code-highlight-container {
			font-size: 0.8rem;
		}

		.demo-code-highlight-container :global(pre) {
			padding: 1rem;
		}
	}

	@media (max-width: 480px) {
		.demo-code-header {
			padding: 1rem;
		}

		.demo-code-badges {
			justify-content: flex-start;
		}

		.demo-code-badge {
			font-size: 0.7rem;
			padding: 0.2rem 0.5rem;
		}

		.demo-code-highlight-container {
			font-size: 0.75rem;
		}

		.demo-code-line-numbers :global(pre) {
			padding-left: 3rem;
		}
	}
</style>
