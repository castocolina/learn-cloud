/**
 * Content Safety Service
 *
 * Implements the safety strategy from PLAN-CONTENT-GENERATION.md Section 4.3
 * for protecting content based on lifecycle status during create/update/delete operations.
 *
 * Safety Rules:
 * - expected: Can be created/updated freely
 * - scaffold: Can be overwritten/deleted freely
 * - draft: Can be modified with warning
 * - review: Can be modified with warning
 * - final: PROTECTED - requires --force-overwrite flag
 * - orphan: Can be modified with warning
 */

import { existsSync, readFileSync } from "fs";
import type { ContentStatus } from "$types";

export interface SafetyCheckOptions {
	dryRun?: boolean;
	forceOverwrite?: boolean;
	verbose?: boolean;
}

export interface SafetyCheckResult {
	success: boolean;
	action: "proceed" | "warn_and_proceed" | "error";
	message?: string;
	warning?: string;
	requiresForce?: boolean;
}

export interface ContentStatusInfo {
	filePath: string;
	exists: boolean;
	status?: ContentStatus;
	parsedContent?: Record<string, unknown>;
}

/**
 * Content Safety Service - Implements repository-level safety checks
 */
export class ContentSafetyService {
	/**
	 * Perform safety check before content operation
	 */
	static checkOperation(
		operation: "create" | "update" | "delete",
		filePath: string,
		options: SafetyCheckOptions = {}
	): SafetyCheckResult {
		const statusInfo = this.getContentStatus(filePath);

		// If file doesn't exist, allow creation
		if (!statusInfo.exists && operation === "create") {
			return {
				success: true,
				action: "proceed",
				message: "Creating new content file"
			};
		}

		// If file doesn't exist but trying to update/delete, error
		if (!statusInfo.exists && (operation === "update" || operation === "delete")) {
			return {
				success: false,
				action: "error",
				message: `Cannot ${operation} non-existent file: ${filePath}`
			};
		}

		// If file exists, check status-based rules
		if (statusInfo.exists && statusInfo.status) {
			return this.checkStatusBasedRules(operation, statusInfo, options);
		}

		// File exists but no status found - treat as orphan with warning
		return {
			success: true,
			action: "warn_and_proceed",
			warning: `File exists but no status found. Treating as orphan content.`,
			message: `Proceeding with ${operation} operation`
		};
	}

	/**
	 * Get content status information from file
	 */
	private static getContentStatus(filePath: string): ContentStatusInfo {
		const info: ContentStatusInfo = {
			filePath,
			exists: existsSync(filePath)
		};

		if (!info.exists) {
			return info;
		}

		try {
			const content = readFileSync(filePath, "utf-8");

			// Try to parse as TypeScript/JavaScript module
			// Match both formats: status: "value" and "status": "value"
			const statusMatch = content.match(/["']?status["']?:\s*["']([^"']+)["']/);
			if (statusMatch) {
				info.status = statusMatch[1] as ContentStatus;
			}

			// Try to extract more content info if needed
			info.parsedContent = this.tryParseContent(content) ?? undefined;
		} catch (error) {
			// File exists but can't be read - handle gracefully
			console.warn(`Warning: Could not read content status from ${filePath}:`, error);
		}

		return info;
	}

	/**
	 * Apply status-based safety rules
	 */
	private static checkStatusBasedRules(
		operation: "create" | "update" | "delete",
		statusInfo: ContentStatusInfo,
		options: SafetyCheckOptions
	): SafetyCheckResult {
		const { status } = statusInfo;
		const { forceOverwrite = false } = options;

		// Operation verb forms for proper grammar
		const operationVerbs = {
			create: "Creating",
			update: "Updating",
			delete: "Deleting"
		};

		const verb = operationVerbs[operation];

		switch (status) {
			case "expected":
				return {
					success: true,
					action: "proceed",
					message: `${verb} expected content`
				};

			case "scaffold":
				return {
					success: true,
					action: "proceed",
					message: `${verb} scaffold content`
				};

			case "draft":
			case "review":
				return {
					success: true,
					action: "warn_and_proceed",
					warning: `⚠️  ${verb} content with '${status}' status.`,
					message: "Proceeding with operation"
				};

			case "final":
				if (!forceOverwrite) {
					return {
						success: false,
						action: "error",
						message: `❌ ERROR: Cannot ${operation} content with 'final' status without --force-overwrite flag.`,
						requiresForce: true
					};
				}
				return {
					success: true,
					action: "warn_and_proceed",
					warning: `🚨 FORCE ${operation.toUpperCase()}: Modifying 'final' content with --force-overwrite flag.`,
					message: "Proceeding with forced operation"
				};

			case "orphan":
				return {
					success: true,
					action: "warn_and_proceed",
					warning: `⚠️  ${verb} orphan content (exists in filesystem but not in content-menu).`,
					message: "Proceeding with operation"
				};

			default:
				return {
					success: true,
					action: "warn_and_proceed",
					warning: `Unknown status '${status}'. Proceeding with caution.`,
					message: `Proceeding with ${operation} operation`
				};
		}
	}

	/**
	 * Try to parse content for additional information
	 */
	private static tryParseContent(content: string): Record<string, unknown> | null {
		try {
			// Try to extract title, type, etc. for better error messages
			// Match both formats: field: "value" and "field": "value"
			const titleMatch = content.match(/["']?title["']?:\s*["']([^"']+)["']/);
			const typeMatch = content.match(/["']?type["']?:\s*["']([^"']+)["']/);
			const idMatch = content.match(/["']?id["']?:\s*["']([^"']+)["']/);

			return {
				title: titleMatch?.[1],
				type: typeMatch?.[1],
				id: idMatch?.[1]
			};
		} catch {
			return null;
		}
	}

	/**
	 * Display safety check result to user
	 */
	static displaySafetyResult(result: SafetyCheckResult, options: SafetyCheckOptions = {}): void {
		if (result.warning) {
			console.warn(result.warning);
		}

		if (result.message && options.verbose) {
			console.log(`ℹ️  ${result.message}`);
		}

		if (!result.success) {
			console.error(result.message);
			if (result.requiresForce) {
				console.error("💡 Hint: Use --force-overwrite to override this protection.");
			}
		}
	}

	/**
	 * Get content status emoji for display
	 */
	static getStatusEmoji(status: ContentStatus): string {
		const statusEmojiMap: Record<ContentStatus, string> = {
			expected: "⏳",
			scaffold: "🚧",
			draft: "📝",
			review: "🔍",
			final: "✅",
			orphan: "🔶"
		};
		return statusEmojiMap[status] || "❓";
	}

	/**
	 * Get content status display name
	 */
	static getStatusDisplay(status: ContentStatus): string {
		return `${this.getStatusEmoji(status)} ${status}`;
	}
}
