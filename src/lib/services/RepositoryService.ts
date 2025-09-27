/**
 * RepositoryService
 *
 * Centralized file and content repository management service with
 * comprehensive safety strategy for content protection.
 *
 * Features:
 * - Safe file operations with backup and rollback capabilities
 * - Content status tracking (scaffold, draft, final)
 * - Force flag handling for protected content
 * - Directory structure management
 * - Transaction-like operations for atomic changes
 * - Integration with ValidationService for pre-operation validation
 */

import { promises as fs, existsSync, statSync } from "fs";
import { join, dirname, basename, extname } from "path";
import type { SafetyCheckResult, ContentStatus, ScaffoldingStats } from "$types/scaffolding";

/**
 * Repository operation modes
 */
export type RepositoryMode = "safe" | "force" | "backup";

/**
 * File operation types
 */
export type FileOperation = "create" | "update" | "delete" | "backup" | "restore";

/**
 * Repository operation configuration
 */
export interface RepositoryConfig {
	mode: RepositoryMode;
	createBackups: boolean;
	validateBeforeWrite: boolean;
	respectContentStatus: boolean;
	backupDirectory: string;
}

/**
 * File operation result
 */
export interface FileOperationResult {
	success: boolean;
	operation: FileOperation;
	filePath: string;
	backupPath?: string;
	error?: string;
	metadata?: {
		originalSize?: number;
		newSize?: number;
		contentStatus?: ContentStatus;
		timestamp?: string;
	};
}

/**
 * Repository transaction for atomic operations
 */
export interface RepositoryTransaction {
	id: string;
	operations: FileOperationResult[];
	startTime: string;
	status: "pending" | "committed" | "rolled_back";
}

/**
 * RepositoryService class for safe content management
 */
export class RepositoryService {
	private config: RepositoryConfig;
	private activeTransactions: Map<string, RepositoryTransaction> = new Map();

	constructor(config?: Partial<RepositoryConfig>) {
		this.config = {
			mode: "safe",
			createBackups: true,
			validateBeforeWrite: true,
			respectContentStatus: true,
			backupDirectory: "tmp/backups",
			...config
		};
	}

	/**
	 * Perform safety check before file operations
	 */
	async performSafetyCheck(filePath: string, operation: FileOperation): Promise<SafetyCheckResult> {
		try {
			const fileExists = existsSync(filePath);

			if (!fileExists && operation !== "create") {
				return {
					canProceed: false,
					requiresForce: false,
					error: `File does not exist: ${filePath}`
				};
			}

			if (fileExists && operation === "create") {
				const contentStatus = await this.detectContentStatus(filePath);

				switch (contentStatus) {
					case "scaffold":
						return {
							canProceed: true,
							requiresForce: false,
							currentStatus: contentStatus,
							warning: "Overwriting scaffold content (safe)"
						};

					case "draft":
						return {
							canProceed: false,
							requiresForce: true,
							currentStatus: contentStatus,
							warning: "Draft content detected - use force flag to overwrite"
						};

					case "final":
						return {
							canProceed: false,
							requiresForce: true,
							currentStatus: contentStatus,
							error: "Final content is protected - requires force flag"
						};
				}
			}

			return {
				canProceed: true,
				requiresForce: false
			};
		} catch (error) {
			return {
				canProceed: false,
				requiresForce: false,
				error: `Safety check failed: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Detect content status from file content
	 */
	async detectContentStatus(filePath: string): Promise<ContentStatus> {
		try {
			if (!existsSync(filePath)) {
				return "scaffold";
			}

			const content = await fs.readFile(filePath, "utf-8");

			// Look for content status markers
			if (content.includes("// STATUS: final") || content.includes("/* STATUS: final */")) {
				return "final";
			}

			if (content.includes("// STATUS: draft") || content.includes("/* STATUS: draft */")) {
				return "draft";
			}

			// Heuristic detection based on content quality
			const lines = content.split("\n");
			const contentLines = lines.filter((line) => line.trim() && !line.trim().startsWith("//"));

			// If file has substantial content (more than 50 lines), consider it draft
			if (contentLines.length > 50) {
				const placeholderPatterns = [
					/TODO:/i,
					/PLACEHOLDER/i,
					/REPLACE.*WITH/i,
					/GENERATED.*CONTENT/i
				];

				const hasPlaceholders = content.match(
					new RegExp(placeholderPatterns.map((p) => p.source).join("|"), "i")
				);

				if (!hasPlaceholders) {
					return "final";
				}

				return "draft";
			}

			return "scaffold";
		} catch (error) {
			console.warn(`Failed to detect content status for ${filePath}:`, error);
			return "scaffold";
		}
	}

	/**
	 * Create a backup of a file
	 */
	async createBackup(filePath: string): Promise<string> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const fileName = basename(filePath, extname(filePath));
		const fileExt = extname(filePath);
		const backupFileName = `${fileName}_${timestamp}${fileExt}`;
		const backupPath = join(this.config.backupDirectory, backupFileName);

		// Ensure backup directory exists
		await fs.mkdir(dirname(backupPath), { recursive: true });

		// Copy file to backup location
		await fs.copyFile(filePath, backupPath);

		return backupPath;
	}

	/**
	 * Write content to file with safety checks
	 */
	async writeFile(
		filePath: string,
		content: string,
		options?: { force?: boolean; contentStatus?: ContentStatus }
	): Promise<FileOperationResult> {
		const force = options?.force || this.config.mode === "force";
		const operation: FileOperation = existsSync(filePath) ? "update" : "create";

		try {
			// Perform safety check
			const safetyCheck = await this.performSafetyCheck(filePath, operation);

			if (!safetyCheck.canProceed && !force) {
				return {
					success: false,
					operation,
					filePath,
					error: safetyCheck.error || safetyCheck.warning || "Safety check failed"
				};
			}

			let backupPath: string | undefined;

			// Create backup if file exists and backups are enabled
			if (existsSync(filePath) && this.config.createBackups) {
				backupPath = await this.createBackup(filePath);
			}

			// Ensure directory exists
			await fs.mkdir(dirname(filePath), { recursive: true });

			// Add content status marker if specified
			let finalContent = content;
			if (options?.contentStatus) {
				finalContent = `// STATUS: ${options.contentStatus}\n${content}`;
			}

			// Get original file size for metadata
			const originalSize = existsSync(filePath) ? statSync(filePath).size : 0;

			// Write the file
			await fs.writeFile(filePath, finalContent, "utf-8");

			// Get new file size
			const newSize = statSync(filePath).size;

			return {
				success: true,
				operation,
				filePath,
				backupPath,
				metadata: {
					originalSize,
					newSize,
					contentStatus: options?.contentStatus,
					timestamp: new Date().toISOString()
				}
			};
		} catch (error) {
			return {
				success: false,
				operation,
				filePath,
				error: `Write operation failed: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Read file content safely
	 */
	async readFile(filePath: string): Promise<{
		success: boolean;
		content?: string;
		error?: string;
		contentStatus?: ContentStatus;
	}> {
		try {
			if (!existsSync(filePath)) {
				return {
					success: false,
					error: `File does not exist: ${filePath}`
				};
			}

			const content = await fs.readFile(filePath, "utf-8");
			const contentStatus = await this.detectContentStatus(filePath);

			return {
				success: true,
				content,
				contentStatus
			};
		} catch (error) {
			return {
				success: false,
				error: `Read operation failed: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Delete file with safety checks
	 */
	async deleteFile(filePath: string, options?: { force?: boolean }): Promise<FileOperationResult> {
		const force = options?.force || this.config.mode === "force";

		try {
			// Perform safety check
			const safetyCheck = await this.performSafetyCheck(filePath, "delete");

			if (!safetyCheck.canProceed && !force) {
				return {
					success: false,
					operation: "delete",
					filePath,
					error: safetyCheck.error || safetyCheck.warning || "Safety check failed"
				};
			}

			let backupPath: string | undefined;

			// Create backup before deletion
			if (existsSync(filePath) && this.config.createBackups) {
				backupPath = await this.createBackup(filePath);
			}

			// Delete the file
			await fs.unlink(filePath);

			return {
				success: true,
				operation: "delete",
				filePath,
				backupPath,
				metadata: {
					timestamp: new Date().toISOString()
				}
			};
		} catch (error) {
			return {
				success: false,
				operation: "delete",
				filePath,
				error: `Delete operation failed: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Start a new transaction for atomic operations
	 */
	startTransaction(): string {
		const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const transaction: RepositoryTransaction = {
			id: transactionId,
			operations: [],
			startTime: new Date().toISOString(),
			status: "pending"
		};

		this.activeTransactions.set(transactionId, transaction);
		return transactionId;
	}

	/**
	 * Add operation to transaction
	 */
	addToTransaction(transactionId: string, operation: FileOperationResult): void {
		const transaction = this.activeTransactions.get(transactionId);
		if (transaction && transaction.status === "pending") {
			transaction.operations.push(operation);
		}
	}

	/**
	 * Commit transaction (mark as completed)
	 */
	commitTransaction(transactionId: string): boolean {
		const transaction = this.activeTransactions.get(transactionId);
		if (transaction && transaction.status === "pending") {
			transaction.status = "committed";
			return true;
		}
		return false;
	}

	/**
	 * Rollback transaction (restore from backups)
	 */
	async rollbackTransaction(transactionId: string): Promise<boolean> {
		const transaction = this.activeTransactions.get(transactionId);
		if (!transaction || transaction.status !== "pending") {
			return false;
		}

		try {
			// Reverse operations in reverse order
			for (let i = transaction.operations.length - 1; i >= 0; i--) {
				const operation = transaction.operations[i];

				if (operation.success && operation.backupPath) {
					// Restore from backup
					await fs.copyFile(operation.backupPath, operation.filePath);
				} else if (operation.operation === "create" && operation.success) {
					// Remove created file
					if (existsSync(operation.filePath)) {
						await fs.unlink(operation.filePath);
					}
				}
			}

			transaction.status = "rolled_back";
			return true;
		} catch (error) {
			console.error(`Failed to rollback transaction ${transactionId}:`, error);
			return false;
		}
	}

	/**
	 * Generate scaffolding statistics
	 */
	generateStats(operations: FileOperationResult[]): ScaffoldingStats {
		const successfulOps = operations.filter((op) => op.success);
		const existingFiles = successfulOps.filter((op) => op.operation === "update").length;
		const newFiles = successfulOps.filter((op) => op.operation === "create").length;
		const errors = operations.filter((op) => !op.success).map((op) => op.error || "Unknown error");

		return {
			totalChapters: successfulOps.length,
			existingFiles,
			newFiles,
			orphanFiles: [], // Could be enhanced to detect orphan files
			errors
		};
	}

	/**
	 * Clean up old backups
	 */
	async cleanupBackups(maxAgeHours = 24): Promise<number> {
		try {
			if (!existsSync(this.config.backupDirectory)) {
				return 0;
			}

			const files = await fs.readdir(this.config.backupDirectory);
			const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
			let cleanedCount = 0;

			for (const file of files) {
				const filePath = join(this.config.backupDirectory, file);
				const stat = await fs.stat(filePath);

				if (stat.mtime.getTime() < cutoffTime) {
					await fs.unlink(filePath);
					cleanedCount++;
				}
			}

			return cleanedCount;
		} catch (error) {
			console.error("Failed to cleanup backups:", error);
			return 0;
		}
	}

	/**
	 * Update repository configuration
	 */
	updateConfig(newConfig: Partial<RepositoryConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}

	/**
	 * Get current configuration
	 */
	getConfig(): RepositoryConfig {
		return { ...this.config };
	}

	/**
	 * Get active transactions
	 */
	getActiveTransactions(): RepositoryTransaction[] {
		return Array.from(this.activeTransactions.values());
	}
}

/**
 * Default RepositoryService instance
 */
export const repositoryService = new RepositoryService();

/**
 * Factory function for creating repository service with custom config
 */
export function createRepositoryService(config?: Partial<RepositoryConfig>): RepositoryService {
	return new RepositoryService(config);
}
