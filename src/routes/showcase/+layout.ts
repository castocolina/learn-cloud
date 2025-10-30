/**
 * Showcase Layout Guard
 *
 * Prevents showcase routes from being accessible in production builds.
 * Showcase pages are development-only test pages for E2E tests.
 *
 * Strategy:
 * - prerender: false - Excludes from static builds
 * - ssr: false - Disables server-side rendering
 * - dev guard - Throws 404 when accessed in production
 */

// eslint-disable-next-line import/extensions
import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";

export const prerender = false;
export const ssr = false;

export function load() {
	if (!dev) {
		throw error(404, "Showcase only available in development");
	}
}
