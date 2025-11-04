<script lang="ts">
	/**
	 * CodeBlock Component (Task 8F)
	 *
	 * Production-ready syntax-highlighted code block with Shiki integration.
	 *
	 * FEATURES:
	 * - Shiki syntax highlighting (200+ languages, bundle-optimized)
	 * - Copy-to-clipboard with IconGrid visual feedback
	 * - Optional Dialog expansion for full-screen view
	 * - Mobile-responsive horizontal scroll
	 * - Theme-aware (light/dark mode support)
	 * - Line numbers support
	 *
	 * BUNDLE OPTIMIZATION:
	 * - Only loads languages from SETTINGS.ui.codeBlock.syntax.enabledLanguages
	 * - ~2MB bundle (14 langs) vs ~6.6MB (200+ langs) = 70% reduction
	 *
	 * USAGE:
	 * ```svelte
	 * <CodeBlock
	 *   code={`console.log("Hello");`}
	 *   language="typescript"
	 *   title="Example Code"
	 *   showExpandButton={true}
	 * />
	 * ```
	 */
	import { onMount, type Component } from "svelte";
	import type { Highlighter } from "shiki";
	import { Copy, Check, Expand, Download } from "lucide-svelte";
	import type { CodeBlockProps, IconItem } from "$types";
	import { SETTINGS } from "$config/settings";
	import IconGrid from "$lib/components/shared/IconGrid.svelte";
	import { openDialog, dialogStore } from "$lib/stores/dialog";
	import CodeBlockFullView from "$lib/components/shared/CodeBlockFullView.svelte";
	import { getHighlighter, ensureLanguageLoaded } from "$lib/utils/shiki";

	// Props with defaults from SETTINGS
	let {
		code,
		language,
		title,
		filename,
		highlightLines: _highlightLines = undefined,
		showLineNumbers: _showLineNumbers = SETTINGS.ui.codeBlock.defaults.showLineNumbers,
		showCopyButton = SETTINGS.ui.codeBlock.defaults.showCopyButton,
		showExpandButton = SETTINGS.ui.codeBlock.defaults.showExpandButton,
		showDownloadButton = SETTINGS.ui.codeBlock.defaults.showDownloadButton,
		maxHeight = SETTINGS.ui.codeBlock.defaults.maxHeight,
		actionGridOrientation = SETTINGS.ui.codeBlock.actionButtons.defaultOrientation,
		class: className = "",
		id = undefined
	}: CodeBlockProps = $props();

	// State
	let highlightedCode = $state("");
	let isLoading = $state(true);
	let copySuccess = $state(false);
	let highlighter = $state<Highlighter | null>(null);

	// Derived state (inline mode)
	let copyIcon = $derived(copySuccess ? Check : Copy);
	let copyLabel = $derived(copySuccess ? "Copied!" : "Copy code");
	let copyState = $derived<"success" | "default">(copySuccess ? "success" : "default");

	// Dialog mode copy feedback state
	let dialogCopySuccess = $state(false);
	let dialogCopyIcon = $derived(dialogCopySuccess ? Check : Copy);
	let dialogCopyLabel = $derived(dialogCopySuccess ? "Copied!" : "Copy code");
	let dialogCopyState = $derived<"success" | "default">(dialogCopySuccess ? "success" : "default");

	/**
	 * Initialize Shiki highlighter on mount
	 * Uses shared singleton instance to prevent WebAssembly memory exhaustion
	 * Falls back to plain text rendering if Shiki fails (e.g., OOM)
	 */
	onMount(async () => {
		try {
			// Get shared highlighter instance (globalThis singleton, HMR-resistant)
			highlighter = await getHighlighter();

			await renderCode();
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Unknown error";
			console.warn(
				`[CodeBlock] Shiki initialization failed: ${errorMsg}. Using plain text fallback.`
			);

			// Graceful fallback to plain text (preserves functionality)
			highlightedCode = `<pre class="fallback-code"><code>${escapeHtml(code)}</code></pre>`;
		} finally {
			isLoading = false;
		}
	});

	/**
	 * Render code with syntax highlighting
	 * Falls back to plain text if language not supported
	 * Lazy-loads language grammar on first use
	 */
	async function renderCode() {
		if (!highlighter) return;

		try {
			// Check if language is supported
			const enabledLanguages = SETTINGS.ui.codeBlock.syntax.enabledLanguages;
			const effectiveLanguage = enabledLanguages.includes(language)
				? language
				: SETTINGS.ui.codeBlock.syntax.fallbackLanguage;

			// Lazy-load language grammar if not already loaded
			await ensureLanguageLoaded(highlighter, effectiveLanguage);

			// Type assertion needed for Shiki's bundled language types
			type BundledLanguage = string;

			highlightedCode = highlighter.codeToHtml(code, {
				lang: effectiveLanguage as BundledLanguage,
				themes: {
					light: SETTINGS.ui.codeBlock.syntax.themes.light,
					dark: SETTINGS.ui.codeBlock.syntax.themes.dark
				},
				defaultColor: "light"
			});
		} catch (error) {
			console.error(`Failed to highlight code for language "${language}":`, error);
			// Fallback to plain text
			highlightedCode = `<pre><code>${escapeHtml(code)}</code></pre>`;
		}
	}

	/**
	 * Copy code to clipboard with visual feedback (inline mode)
	 */
	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(code);
			copySuccess = true;

			// Reset after configured duration
			setTimeout(() => {
				copySuccess = false;
			}, SETTINGS.ui.codeBlock.copyFeedback.duration);
		} catch (error) {
			console.error("Failed to copy code:", error);
		}
	}

	/**
	 * Copy code to clipboard with visual feedback (Dialog mode)
	 * Updates dialogStore to trigger reactive UI changes
	 */
	async function handleDialogCopy() {
		try {
			await navigator.clipboard.writeText(code);
			dialogCopySuccess = true;

			// Update dialogStore to reflect success state
			updateDialogActionButtons();

			// Reset after configured duration
			setTimeout(() => {
				dialogCopySuccess = false;
				updateDialogActionButtons();
			}, SETTINGS.ui.codeBlock.copyFeedback.duration);
		} catch (error) {
			console.error("Failed to copy code:", error);
		}
	}

	/**
	 * Update dialog action buttons with current reactive state
	 * Called after dialogCopySuccess changes to sync UI
	 */
	function updateDialogActionButtons() {
		dialogStore.update((state) => {
			if (!state.actionButtons) return state;

			// Rebuild action buttons with current reactive values
			const updatedIcons = state.actionButtons.icons
				.map((btn) => {
					if (!btn) return null; // Handle null cells in grid

					if (btn.id === "copy") {
						return {
							...btn,
							icon: dialogCopyIcon,
							label: dialogCopyLabel,
							state: dialogCopyState
						};
					}
					return btn;
				})
				.filter((btn): btn is IconItem => btn !== null);

			return {
				...state,
				actionButtons: {
					...state.actionButtons,
					icons: updatedIcons
				}
			};
		});
	}

	/**
	 * Expand code block to full-screen dialog
	 *
	 * ARCHITECTURE (2025-11-01):
	 * - Action buttons (Copy, Download) passed to Dialog via actionButtons API
	 * - Uses Dialog's intelligent positioning system (content-aligned, sticky)
	 * - Unified orientation: actionGridOrientation applies to both inline and Dialog
	 * - CodeBlockFullView simplified to only render code content
	 */
	function handleExpand() {
		// Build action buttons for Dialog (Copy + Download, NO Expand)
		const dialogActionButtons = [
			{
				id: "copy",
				icon: dialogCopyIcon,
				label: dialogCopyLabel,
				onClick: handleDialogCopy,
				variant: "subtle" as const,
				state: dialogCopyState
			},
			{
				id: "download",
				icon: Download,
				label: "Download",
				onClick: () => {
					const blob = new Blob([code], { type: "text/plain" });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = filename || `code.${getFileExtension(language)}`;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				},
				variant: "subtle" as const
			}
		];

		// Type assertion needed for dialog store Component type compatibility
		openDialog({
			title: title || filename || `${language} Code`,
			content: CodeBlockFullView as Component,
			size: "full",
			props: {
				highlightedCode
			},
			actionButtons: {
				icons: dialogActionButtons,
				alignment: SETTINGS.ui.codeBlock.actionButtons.dialog.alignment,
				orientation: actionGridOrientation,
				gap: SETTINGS.ui.codeBlock.actionButtons.gap,
				iconSize: SETTINGS.ui.codeBlock.actionButtons.iconSize
			}
		});
	}

	/**
	 * Download code as file
	 */
	function handleDownload() {
		const blob = new Blob([code], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename || `code.${getFileExtension(language)}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * Get file extension based on language
	 */
	function getFileExtension(lang: string): string {
		const extensions: Record<string, string> = {
			typescript: "ts",
			javascript: "js",
			python: "py",
			rust: "rs",
			go: "go",
			java: "java",
			sql: "sql",
			yaml: "yaml",
			bash: "sh",
			hcl: "tf",
			dockerfile: "Dockerfile",
			graphql: "graphql",
			json: "json",
			svelte: "svelte"
		};
		return extensions[lang] || "txt";
	}

	/**
	 * Escape HTML for plain text fallback
	 */
	function escapeHtml(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	// Build IconGrid items based on enabled features
	let actionIcons = $derived(
		[
			showCopyButton && {
				id: "copy",
				icon: copyIcon,
				label: copyLabel,
				onClick: handleCopy,
				variant: "subtle" as const,
				state: copyState
			},
			showDownloadButton && {
				id: "download",
				icon: Download,
				label: "Download",
				onClick: handleDownload,
				variant: "subtle" as const
			},
			showExpandButton && {
				id: "expand",
				icon: Expand,
				label: "Expand",
				onClick: handleExpand,
				variant: "subtle" as const
			}
		].filter((item): item is Exclude<typeof item, false> => Boolean(item))
	);
</script>

<!-- Wrapper: Ensures single root element for proper spacing in parent contexts -->
<div class="code-block-wrapper">
	<!-- Header: Title or Filename -->
	{#if title || filename}
		<div class="code-block-header">
			{#if title}
				<h3 class="code-block-title">{title}</h3>
			{/if}
			{#if filename}
				<span class="code-block-filename">{filename}</span>
			{/if}
		</div>
	{/if}

	<!-- Code Container -->
	<div
		class="code-block-container {className}"
		class:custom-max-height={maxHeight !== SETTINGS.ui.codeBlock.defaults.maxHeight}
		{id}
		role="region"
		aria-label="Code block"
		style:max-height={maxHeight !== SETTINGS.ui.codeBlock.defaults.maxHeight
			? maxHeight
			: undefined}
	>
		<!-- Action Buttons (IconGrid) -->
		{#if actionIcons.length > 0}
			<IconGrid
				icons={actionIcons}
				positioning="absolute"
				position={SETTINGS.ui.codeBlock.actionButtons.inline.position}
				orientation={actionGridOrientation}
				gap={SETTINGS.ui.codeBlock.actionButtons.gap}
				iconSize={SETTINGS.ui.codeBlock.actionButtons.iconSize}
			/>
		{/if}

		<!-- Loading Skeleton -->
		{#if isLoading}
			<div class="code-block-skeleton" aria-label="Loading code block">
				<div class="skeleton-line"></div>
				<div class="skeleton-line"></div>
				<div class="skeleton-line"></div>
			</div>
		{:else}
			<!-- Rendered Code -->
			<div class="code-block-content">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html highlightedCode}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Root wrapper (.code-block-wrapper) - ensures single root element for proper spacing in parent contexts */
	/* No visual styles needed - structural wrapper only */

	.code-block-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: hsl(var(--muted));
		border: 1px solid hsl(var(--border));
		border-bottom: none;
		border-radius: var(--radius) var(--radius) 0 0;
	}

	.code-block-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.code-block-filename {
		font-size: 0.75rem;
		font-family: var(--font-mono);
		color: hsl(var(--muted-foreground));
	}

	.code-block-container {
		position: relative;
		overflow: auto;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		background: hsl(var(--muted) / 0.3);
	}

	/* Adjust border radius when header is present */
	.code-block-header + .code-block-container {
		border-radius: 0 0 var(--radius) var(--radius);
		border-top: none;
	}

	.code-block-content {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1.7;
	}

	/* Remove default Shiki container padding/margin */
	.code-block-content :global(pre) {
		margin: 0;
		padding: 1rem;
		background: transparent !important;
		overflow-x: auto;
	}

	.code-block-content :global(code) {
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}

	/* Loading skeleton */
	.code-block-skeleton {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-line {
		height: 1rem;
		background: linear-gradient(
			90deg,
			hsl(var(--muted)) 0%,
			hsl(var(--muted-foreground) / 0.1) 50%,
			hsl(var(--muted)) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 0.25rem;
	}

	.skeleton-line:nth-child(1) {
		width: 90%;
	}
	.skeleton-line:nth-child(2) {
		width: 75%;
	}
	.skeleton-line:nth-child(3) {
		width: 85%;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	/* Mobile optimization: horizontal scroll */
	@media (max-width: 640px) {
		.code-block-content :global(pre) {
			padding: 0.75rem;
		}

		.code-block-header {
			padding: 0.5rem 0.75rem;
		}
	}
</style>
