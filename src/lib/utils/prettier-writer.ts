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
import { join } from "path/posix";

const prettierConfigPath = ".prettierrc"; // Path to Prettier config file

/**
 * Format content string using Prettier (without writing to disk)
 *
 * This is the core formatting function that can be used by any service
 * that needs formatted content without direct file writing.
 *
 * @param content - String content to format
 * @param filePath - File path for parser detection
 * @param options - Formatting options
 * @returns Formatted content string
 */
export async function formatContent(
	content: string,
	filePath: string,
	options: { compress?: boolean } = {}
): Promise<string> {
	const prettier = await import("prettier");
	const config = await prettier.resolveConfig(join(process.cwd(), prettierConfigPath));

	if (options.compress) {
		// Production mode - compressed formatting for smaller bundle size
		return await prettier.format(content, {
			...config,
			printWidth: 999999, // Only override printWidth for compression
			filepath: filePath
		});
	} else {
		// Development mode - readable formatting using project config
		return await prettier.format(content, {
			...config,
			filepath: filePath
		});
	}
}

/**
 * Write formatted file with Prettier integration
 *
 * Convenience wrapper that formats content and writes to disk in one operation.
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
	const formatted = await formatContent(content, filePath, options);
	writeFileSync(filePath, formatted, "utf8");
}

/**
 * Check if we should use compressed formatting based on environment
 */
export function shouldCompress(mode?: string): boolean {
	return mode === "production" || process.env.NODE_ENV === "production";
}
