/**
 * Ambient Type Declarations for SvelteKit Virtual Modules
 *
 * SvelteKit provides virtual modules ($app/*) that are resolved at build time.
 * These declarations help TypeScript understand these modules during svelte-check.
 *
 * Virtual modules resolved by Vite:
 * - $app/state - Svelte 5 runes-based reactive page state
 * - $app/environment - Environment detection (browser, dev, building, version)
 *
 * Note: These declarations mirror SvelteKit's internal types for svelte-check compatibility.
 */

declare module "$app/state" {
	import type { Page } from "@sveltejs/kit";

	/**
	 * Reactive page store using Svelte 5 runes
	 * Access current page data, params, route, URL, and navigation state
	 *
	 * Usage:
	 * ```typescript
	 * import { page } from '$app/state';
	 * const currentUrl = $derived(page.url);
	 * ```
	 */
	export const page: Page;
}

declare module "$app/environment" {
	/**
	 * `true` if the app is running in the browser
	 */
	export const browser: boolean;

	/**
	 * Whether the dev server is running. This is not guaranteed to correspond to `NODE_ENV` or `MODE`.
	 */
	export const dev: boolean;

	/**
	 * `true` during prerendering, `false` otherwise
	 */
	export const building: boolean;

	/**
	 * The value of `config.kit.version.name`
	 */
	export const version: string;
}
