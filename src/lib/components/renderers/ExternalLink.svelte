<script lang="ts">
	/**
	 * External Link Component (TASK 7B)
	 *
	 * Intelligent link component with automatic external/internal detection.
	 *
	 * Features:
	 * - Auto-detects external links (http://, https://, //)
	 * - Visual indicator (icon) for external links
	 * - SvelteKit preload for internal links (better UX)
	 * - Security: rel="noopener noreferrer" for external/blank targets
	 * - Accessible: proper ARIA and hover states
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Snippet pattern for children
	 * - Type-safe (LinkTarget from types)
	 *
	 * @component ExternalLink
	 */

	import { ExternalLink as ExternalIcon } from "lucide-svelte";
	import type { Snippet } from "svelte";
	import type { LinkTarget } from "$types";

	interface Props {
		/** Link URL (external or internal path) */
		href: string;
		/** Link target attribute (auto-detected if not specified) */
		target?: LinkTarget;
		/** Link content (Svelte 5 snippet pattern) */
		children: Snippet;
	}

	let { href, target, children }: Props = $props();

	/**
	 * Detect if link is external
	 * External: starts with http://, https://, or //
	 */
	const isExternal = $derived(
		href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")
	);

	/**
	 * Compute target attribute
	 * - If explicitly provided, use it
	 * - If external, default to _blank
	 * - If internal, default to _self
	 */
	const computedTarget = $derived(target || (isExternal ? "_blank" : "_self"));

	/**
	 * Compute rel attribute for security
	 * - External or _blank targets need "noopener noreferrer"
	 * - Internal _self links don't need rel
	 */
	const rel = $derived(
		isExternal || computedTarget === "_blank" ? "noopener noreferrer" : undefined
	);

	/**
	 * SvelteKit preload attribute
	 * - Internal links: preload on hover for better UX
	 * - External links: no preload
	 */
	const preload = $derived(isExternal ? undefined : "hover");
</script>

<a
	{href}
	target={computedTarget}
	{rel}
	data-sveltekit-preload-data={preload}
	class="rich-link"
	class:rich-link-external={isExternal}
>
	{@render children()}
	{#if isExternal}
		<ExternalIcon size={14} class="rich-link-icon" />
	{/if}
</a>
