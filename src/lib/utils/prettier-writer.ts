/**
 * Prettier Integration Utility
 *
 * Centralized file writing with Prettier formatting support.
 * Supports both readable formatting for development and compressed
 * formatting for production builds to optimize bundle size.
 *
 * Features:
 * - Automatic Prettier configuration detection from project root
 * - Compression mode for production builds
 * - Consistent formatting across all generated files
 * - TypeScript and JavaScript support
 */

import { writeFileSync } from "fs";

/**
 * Write formatted file with Prettier integration
 *
 * @param filePath - Absolute path to write the file
 * @param content - File content to format and write
 * @param options - Formatting options
 */
export async function writeFormattedFile(
	filePath: string,
	content: string,
	options: { compress?: boolean } = {}
): Promise<void> {
	const prettier = await import("prettier");
	const config = await prettier.resolveConfig(process.cwd());

	if (options.compress) {
		// Production mode - compressed formatting for smaller bundle size
		const compressed = await prettier.format(content, {
			...config,
			printWidth: 999999, // Only override printWidth for compression
			filepath: filePath
		});
		writeFileSync(filePath, compressed, "utf8");
	} else {
		// Development mode - readable formatting using project config
		const formatted = await prettier.format(content, {
			...config,
			filepath: filePath
		});
		writeFileSync(filePath, formatted, "utf8");
	}
}

/**
 * Check if we should use compressed formatting based on environment
 */
export function shouldCompress(mode?: string): boolean {
	return mode === "production" || process.env.NODE_ENV === "production";
}
