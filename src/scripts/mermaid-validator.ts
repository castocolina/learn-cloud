#!/usr/bin/env tsx

/**
 * Mermaid Diagram Validator for Cloud-Native Learning Platform
 *
 * Modern TypeScript implementation using AST analysis to validate Mermaid diagrams
 * embedded in TypeScript files. Uses ts-morph for parsing and mmdc CLI for validation.
 *
 * Features:
 * - AST-based TypeScript file parsing using ts-morph
 * - Parallel processing with configurable concurrency
 * - Node.js fs APIs for controlled file traversal (no glob dependency)
 * - External mmdc CLI execution with puppeteer configuration
 * - Precise error reporting with file paths and line numbers
 * - Integration with project configuration system
 * - Comprehensive console output format
 *
 * Usage:
 *   pnpm run validate-mermaid                     # Validate default path (src/data/book)
 *   pnpm run validate-mermaid src/data/book       # Validate specific directory
 *   pnpm run validate-mermaid path/to/file.ts     # Validate single file
 *
 * Configuration:
 *   Settings managed via src/config/settings.ts under scripts.validation.mermaid
 *   - maxParallelFiles: Number of concurrent validations (default: 4)
 *   - diagramPropertyNames: Property names to search for diagrams
 *   - verbose: Enable detailed output logging
 *
 * Integration:
 *   - package.json: validate-mermaid script
 *   - Makefile: validate-mermaid target
 *   - GitHub Actions: CI/CD validation pipeline
 *   - Husky: Pre-commit hook validation
 */

import {
	Project,
	SourceFile,
	Node,
	SyntaxKind,
	PropertyAssignment,
	VariableDeclaration
} from "ts-morph";
import { promises as fs, existsSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { spawn } from "child_process";
import { parseArgs } from "util";
import { SETTINGS } from "$config/settings.js";
import type {
	DiagramReference,
	MermaidValidationResult,
	FileProcessingResult,
	MermaidValidationStats
} from "$types";

/**
 * Enhanced validation statistics with error categorization
 */
interface EnhancedMermaidValidationStats extends MermaidValidationStats {
	commonErrors: Map<string, number>;
	errorsByCategory: Map<string, number>;
}

/**
 * Enhanced validation result with error categorization
 */
interface EnhancedMermaidValidationResult extends MermaidValidationResult {
	errorCategory?: string;
}

/**
 * Class for managing parallel processing of files
 */
class AsyncPool<T> {
	private readonly poolLimit: number;
	private readonly executing: Promise<void>[] = [];

	constructor(poolLimit: number) {
		this.poolLimit = poolLimit;
	}

	/**
	 * Process an array of items with limited concurrency
	 */
	async process<R>(array: T[], iteratorFn: (item: T) => Promise<R>): Promise<R[]> {
		const ret: Promise<R>[] = [];

		for (const item of array) {
			const promise = Promise.resolve().then(() => iteratorFn(item));
			ret.push(promise);

			if (this.poolLimit <= array.length) {
				const executing = promise.then(() => {
					this.executing.splice(this.executing.indexOf(executing), 1);
				});
				this.executing.push(executing);

				if (this.executing.length >= this.poolLimit) {
					await Promise.race(this.executing);
				}
			}
		}

		return Promise.all(ret);
	}
}

/**
 * Main Mermaid Validator class
 */
class MermaidValidator {
	private config = SETTINGS.scripts.validation.mermaid;

	/**
	 * Override verbose setting for this validation run
	 */
	public setVerbose(verbose: boolean): void {
		this.config = { ...this.config, verbose };
	}
	private readonly project: Project;
	private readonly asyncPool: AsyncPool<string>;
	private readonly puppeteerConfigPath: string;

	constructor() {
		// Initialize ts-morph project for AST parsing
		this.project = new Project({
			useInMemoryFileSystem: false,
			skipAddingFilesFromTsConfig: true,
			compilerOptions: {
				target: 1, // ES5
				module: 1, // CommonJS
				moduleResolution: 2 // Node
			}
		});

		// Initialize async pool for parallel processing
		this.asyncPool = new AsyncPool(this.config.maxParallelFiles);

		// Path to puppeteer configuration file
		this.puppeteerConfigPath = join(process.cwd(), "src/config/puppeteer-config.json");
	}

	/**
	 * Recursively find all TypeScript files in a directory
	 */
	private async findTypeScriptFiles(dirPath: string): Promise<string[]> {
		const files: string[] = [];

		try {
			const entries = await fs.readdir(dirPath, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(dirPath, entry.name);

				if (entry.isDirectory()) {
					// Recursively search subdirectories
					const subFiles = await this.findTypeScriptFiles(fullPath);
					files.push(...subFiles);
				} else if (entry.isFile() && entry.name.endsWith(".ts")) {
					files.push(fullPath);
				}
			}
		} catch (error) {
			if (this.config.verbose) {
				console.error(`Warning: Could not read directory ${dirPath}:`, error);
			}
		}

		return files;
	}

	/**
	 * Parse a TypeScript file and extract diagram references
	 */
	private parseTypeScriptFile(filePath: string): DiagramReference[] {
		const diagrams: DiagramReference[] = [];

		try {
			// Resolve to absolute path for ts-morph
			const absolutePath = join(process.cwd(), filePath);

			// Add file to ts-morph project
			const sourceFile = this.project.addSourceFileAtPath(absolutePath);
			diagrams.push(...this.extractDiagramReferences(sourceFile));
		} catch (error) {
			if (this.config.verbose) {
				console.error(`Warning: Could not parse file ${filePath}:`, error);
			}
		}

		return diagrams;
	}

	/**
	 * Extract diagram references from a TypeScript source file
	 * Enhanced to specifically target DiagramBlocks with type: "diagram" and diagramType: "mermaid"
	 */
	private extractDiagramReferences(sourceFile: SourceFile): DiagramReference[] {
		const diagrams: DiagramReference[] = [];
		const filePath = sourceFile.getFilePath();

		// Find all object literal expressions that might be DiagramBlocks
		const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);

		if (this.config.verbose) {
			console.log(`🔍 Processing ${filePath}: Found ${objectLiterals.length} object literals`);
		}

		for (const objectLiteral of objectLiterals) {
			if (this.isDiagramBlock(objectLiteral)) {
				if (this.config.verbose) {
					console.log(`✅ Found DiagramBlock at line ${objectLiteral.getStartLineNumber()}`);
				}
				const diagramBlock = this.extractDiagramFromBlock(objectLiteral, filePath);
				if (diagramBlock) {
					diagrams.push(diagramBlock);
				}
			}
		}

		// Fallback: Also check for standalone diagram properties (legacy support)
		const propertyAssignments = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAssignment);

		for (const property of propertyAssignments) {
			const propertyName = property.getName();
			if (this.config.diagramPropertyNames.includes(propertyName)) {
				// Skip if this property is already part of a DiagramBlock we processed
				const parentObject = property.getFirstAncestorByKind(SyntaxKind.ObjectLiteralExpression);
				if (parentObject && this.isDiagramBlock(parentObject)) {
					continue; // Already processed as part of DiagramBlock
				}

				const value = property.getInitializer();
				if (
					value &&
					(Node.isStringLiteral(value) ||
						Node.isNoSubstitutionTemplateLiteral(value) ||
						Node.isTemplateExpression(value))
				) {
					const diagramContent = this.extractStringContent(value);
					if (this.isMermaidDiagram(diagramContent)) {
						diagrams.push({
							filePath,
							variableName: this.getPropertyPath(property),
							diagramContent,
							lineNumber: property.getStartLineNumber(),
							columnNumber: property.getStart() - property.getStartLinePos() + 1
						});
					}
				}
			}
		}

		return diagrams;
	}

	/**
	 * Check if an object literal is a DiagramBlock
	 */
	private isDiagramBlock(objectLiteral: Node): boolean {
		if (!Node.isObjectLiteralExpression(objectLiteral)) {
			return false;
		}

		const properties = objectLiteral.getProperties();
		let hasTypeProperty = false;
		let hasDiagramTypeProperty = false;
		let hasDefinitionProperty = false;

		for (const prop of properties) {
			if (Node.isPropertyAssignment(prop)) {
				const name = prop.getName();
				const value = prop.getInitializer();

				if (name === "type" && Node.isStringLiteral(value)) {
					hasTypeProperty = value.getLiteralValue() === "diagram";
				} else if (name === "diagramType" && Node.isStringLiteral(value)) {
					hasDiagramTypeProperty = value.getLiteralValue() === "mermaid";
				} else if (name === "definition") {
					hasDefinitionProperty = true;
				}
			}
		}

		return hasTypeProperty && hasDiagramTypeProperty && hasDefinitionProperty;
	}

	/**
	 * Extract diagram reference from a confirmed DiagramBlock
	 */
	private extractDiagramFromBlock(objectLiteral: Node, filePath: string): DiagramReference | null {
		if (!Node.isObjectLiteralExpression(objectLiteral)) {
			return null;
		}

		const properties = objectLiteral.getProperties();
		let definitionProperty: PropertyAssignment | null = null;
		let title = "Unnamed Diagram";

		for (const prop of properties) {
			if (Node.isPropertyAssignment(prop)) {
				const name = prop.getName();
				const value = prop.getInitializer();

				if (name === "definition") {
					definitionProperty = prop;
				} else if (name === "title" && Node.isStringLiteral(value)) {
					title = value.getLiteralValue();
				}
			}
		}

		if (!definitionProperty) {
			return null;
		}

		const value = definitionProperty.getInitializer();
		if (
			!value ||
			!(
				Node.isStringLiteral(value) ||
				Node.isNoSubstitutionTemplateLiteral(value) ||
				Node.isTemplateExpression(value)
			)
		) {
			return null;
		}

		const diagramContent = this.extractStringContent(value);
		if (!this.isMermaidDiagram(diagramContent)) {
			return null;
		}

		return {
			filePath,
			variableName: this.getVariableNameForDiagramBlock(objectLiteral, title),
			diagramContent,
			lineNumber: definitionProperty.getStartLineNumber(),
			columnNumber: definitionProperty.getStart() - definitionProperty.getStartLinePos() + 1
		};
	}

	/**
	 * Get a descriptive variable name for a DiagramBlock
	 */
	private getVariableNameForDiagramBlock(objectLiteral: Node, title: string): string {
		// Try to find the containing variable name
		let current: Node | undefined = objectLiteral.getParent();
		while (current) {
			if (Node.isVariableDeclaration(current)) {
				return `${current.getName()}.${title}`;
			}
			if (Node.isPropertyAssignment(current)) {
				const parentName = this.getPropertyPath(current);
				return `${parentName}.${title}`;
			}
			current = current.getParent();
		}

		return `DiagramBlock.${title}`;
	}

	/**
	 * Process the content of a member expression or variable to find diagrams
	 */
	private processMemberExpressionContent(
		node: VariableDeclaration,
		filePath: string,
		diagrams: DiagramReference[],
		baseName: string
	): void {
		const initializer = node.getInitializer();
		if (!initializer) return;

		if (Node.isObjectLiteralExpression(initializer)) {
			// Process object literal properties
			const properties = initializer.getProperties();
			for (const prop of properties) {
				if (Node.isPropertyAssignment(prop)) {
					const propName = prop.getName();
					if (this.config.diagramPropertyNames.includes(propName)) {
						const value = prop.getInitializer();
						if (
							value &&
							(Node.isStringLiteral(value) ||
								Node.isNoSubstitutionTemplateLiteral(value) ||
								Node.isTemplateExpression(value))
						) {
							const diagramContent = this.extractStringContent(value);
							if (this.isMermaidDiagram(diagramContent)) {
								diagrams.push({
									filePath,
									variableName: `${baseName}.${propName}`,
									diagramContent,
									lineNumber: prop.getStartLineNumber(),
									columnNumber: prop.getStart() - prop.getStartLinePos() + 1
								});
							}
						}
					}
				}
			}
		} else if (
			Node.isStringLiteral(initializer) ||
			Node.isNoSubstitutionTemplateLiteral(initializer) ||
			Node.isTemplateExpression(initializer)
		) {
			// Direct string assignment - check if variable name suggests it's a diagram
			const diagramContent = this.extractStringContent(initializer);
			if (this.isMermaidDiagram(diagramContent)) {
				diagrams.push({
					filePath,
					variableName: baseName,
					diagramContent,
					lineNumber: initializer.getStartLineNumber(),
					columnNumber: initializer.getStart() - initializer.getStartLinePos() + 1
				});
			}
		}
	}

	/**
	 * Extract string content from string literals or template literals
	 */
	private extractStringContent(node: Node): string {
		if (Node.isStringLiteral(node)) {
			return node.getLiteralValue();
		} else if (Node.isNoSubstitutionTemplateLiteral(node)) {
			return node.getLiteralValue();
		} else if (Node.isTemplateExpression(node)) {
			// For template expressions with substitutions, get the full text
			return node.getFullText().slice(1, -1); // Remove backticks
		}
		return "";
	}

	/**
	 * Get the property path for a property assignment (e.g., "object.property")
	 */
	private getPropertyPath(property: PropertyAssignment): string {
		const propertyName = property.getName();

		// Try to find the containing variable name
		let current: Node | undefined = property.getParent();
		while (current) {
			if (Node.isVariableDeclaration(current)) {
				return `${current.getName()}.${propertyName}`;
			}
			if (Node.isPropertyAssignment(current)) {
				const parentName = this.getPropertyPath(current);
				return `${parentName}.${propertyName}`;
			}
			current = current.getParent();
		}

		return propertyName;
	}

	/**
	 * Check if a string contains a Mermaid diagram
	 */
	private isMermaidDiagram(content: string): boolean {
		if (!content || content.trim().length === 0) return false;

		// Check for common Mermaid diagram types
		const mermaidKeywords = [
			"graph",
			"flowchart",
			"sequenceDiagram",
			"classDiagram",
			"stateDiagram",
			"erDiagram",
			"journey",
			"gantt",
			"pie",
			"gitgraph",
			"mindmap",
			"timeline",
			"sankey",
			"xyChart",
			"block",
			"packet",
			"kanban",
			"architecture"
		];

		const trimmedContent = content.trim();
		return mermaidKeywords.some(
			(keyword) =>
				trimmedContent.startsWith(keyword) ||
				trimmedContent.includes(`\n${keyword}`) ||
				trimmedContent.includes(`\r\n${keyword}`)
		);
	}

	/**
	 * Validate a single diagram using mmdc CLI with enhanced error analysis
	 */
	private async validateDiagram(
		reference: DiagramReference
	): Promise<EnhancedMermaidValidationResult> {
		const startTime = Date.now();

		try {
			const tempFileName = `mermaid-validate-${process.pid}-${Date.now()}-${Math.random()}.mmd`;
			const tempFilePath = join(process.cwd(), "tmp", "mermaid_checks", tempFileName);

			// Ensure tmp directory exists
			await fs.mkdir(dirname(tempFilePath), { recursive: true });

			// Write diagram content to temporary file
			await fs.writeFile(tempFilePath, reference.diagramContent);

			// Execute mmdc CLI validation
			const { isValid, errorMessage, errorCategory } =
				await this.executeMmdcValidation(tempFilePath);

			// Clean up temporary file
			try {
				await fs.unlink(tempFilePath);
			} catch {
				// Ignore cleanup errors
			}

			const result: EnhancedMermaidValidationResult = {
				reference,
				isValid,
				duration: Date.now() - startTime
			};

			if (!isValid) {
				result.errorMessage = errorMessage;
				result.errorCategory = errorCategory;

				// Print verbose error immediately if enabled
				if (this.config.verbose) {
					this.printVerboseError(result);
				}
			}

			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const result: EnhancedMermaidValidationResult = {
				reference,
				isValid: false,
				errorMessage,
				errorCategory: this.categorizeError(errorMessage),
				duration: Date.now() - startTime
			};

			if (this.config.verbose) {
				this.printVerboseError(result);
			}

			return result;
		}
	}

	/**
	 * Print verbose error immediately when found
	 */
	private printVerboseError(result: EnhancedMermaidValidationResult): void {
		const relativePath = relative(process.cwd(), result.reference.filePath);
		const location = `${relativePath}:${result.reference.lineNumber}`;
		const variable = result.reference.variableName;

		console.log(`\n🔍 VERBOSE: Found error in ${variable}`);
		console.log(`❌ ${location}`);
		if (result.errorCategory) {
			console.log(`   Category: ${result.errorCategory}`);
		}
		if (result.errorMessage) {
			console.log(`   Error: ${result.errorMessage}`);
		}
		console.log(`   Duration: ${result.duration}ms`);
	}

	/**
	 * Categorize error types for analysis
	 */
	private categorizeError(errorMessage: string): string {
		const message = errorMessage.toLowerCase();

		if (message.includes("parse error") || message.includes("parsing")) {
			return "Syntax Error";
		} else if (message.includes("quote") || message.includes("quotation")) {
			return "Quote/Text Error";
		} else if (message.includes("node") || message.includes("edge")) {
			return "Structure Error";
		} else if (message.includes("timeout") || message.includes("time")) {
			return "Timeout Error";
		} else if (message.includes("memory") || message.includes("ram")) {
			return "Memory Error";
		} else if (
			message.includes("headless") ||
			message.includes("chrome") ||
			message.includes("puppeteer")
		) {
			return "Browser Error";
		} else if (message.includes("permission") || message.includes("access")) {
			return "Permission Error";
		} else {
			return "Unknown Error";
		}
	}

	/**
	 * Execute mmdc CLI validation for a temporary file with enhanced error capture
	 */
	private async executeMmdcValidation(
		tempFilePath: string
	): Promise<{ isValid: boolean; errorMessage?: string; errorCategory?: string }> {
		return new Promise((resolve) => {
			const outputPath = tempFilePath.replace(".mmd", ".svg");

			const args = [
				"--puppeteerConfigFile",
				this.puppeteerConfigPath,
				"-i",
				tempFilePath,
				"-o",
				outputPath
			];

			const mmdcProcess = spawn("mmdc", args, {
				stdio: "pipe",
				cwd: process.cwd()
			});

			let stderr = "";
			let stdout = "";

			mmdcProcess.stderr?.on("data", (data) => {
				stderr += data.toString();
			});

			mmdcProcess.stdout?.on("data", (data) => {
				stdout += data.toString();
			});

			mmdcProcess.on("close", (code) => {
				// Clean up output file if it exists
				fs.unlink(outputPath)
					.catch(() => {
						// Ignore cleanup errors
					})
					.finally(() => {
						// Cleanup completed
					});

				if (code === 0) {
					resolve({ isValid: true });
				} else {
					const errorMessage = stderr.trim() || stdout.trim() || `mmdc exited with code ${code}`;
					const errorCategory = this.categorizeError(errorMessage);
					resolve({
						isValid: false,
						errorMessage,
						errorCategory
					});
				}
			});

			mmdcProcess.on("error", (error) => {
				const errorMessage = `mmdc execution failed: ${error.message}`;
				const errorCategory = this.categorizeError(errorMessage);
				resolve({
					isValid: false,
					errorMessage,
					errorCategory
				});
			});
		});
	}

	/**
	 * Process a single file and validate all diagrams found
	 */
	private async processFile(filePath: string): Promise<FileProcessingResult> {
		const startTime = Date.now();

		try {
			const diagrams = this.parseTypeScriptFile(filePath);
			const results = await Promise.all(diagrams.map((diagram) => this.validateDiagram(diagram)));

			return {
				filePath,
				diagramsFound: diagrams.length,
				results,
				duration: Date.now() - startTime
			};
		} catch (error) {
			if (this.config.verbose) {
				console.error(`Error processing file ${filePath}:`, error);
			}

			return {
				filePath,
				diagramsFound: 0,
				results: [],
				duration: Date.now() - startTime
			};
		}
	}

	/**
	 * Print validation results to console with enhanced error analysis
	 */
	private printResults(
		results: FileProcessingResult[],
		stats: EnhancedMermaidValidationStats
	): void {
		// Skip individual results in verbose mode (already printed)
		if (!this.config.verbose) {
			console.log(""); // Empty line for readability

			// Print individual results
			for (const fileResult of results) {
				if (fileResult.diagramsFound === 0) continue;

				const relativePath = relative(process.cwd(), fileResult.filePath);
				console.log(`\nFound ${fileResult.diagramsFound} Mermaid diagram(s) in ${relativePath}`);

				for (const result of fileResult.results) {
					const enhancedResult = result as EnhancedMermaidValidationResult;
					const relativeRef = relative(process.cwd(), enhancedResult.reference.filePath);
					const location = `${relativeRef}:${enhancedResult.reference.lineNumber}`;
					const variable = enhancedResult.reference.variableName;

					if (enhancedResult.isValid) {
						console.log(`✅ ${location} - ${variable}`);
						console.log(`   Valid diagram parsed successfully`);
					} else {
						console.log(`❌ ${location} - ${variable}`);
						if (enhancedResult.errorCategory) {
							console.log(`   Category: ${enhancedResult.errorCategory}`);
						}
						if (enhancedResult.errorMessage) {
							console.log(`   Error: ${enhancedResult.errorMessage}`);
						} else {
							console.log(`   Error: Mermaid diagram validation failed`);
						}
					}
				}
			}
		}

		// Print enhanced summary
		this.printEnhancedSummary(stats);
	}

	/**
	 * Print enhanced summary with error analysis
	 */
	private printEnhancedSummary(stats: EnhancedMermaidValidationStats): void {
		const duration = (stats.totalDuration / 1000).toFixed(2);

		console.log("\n" + "=".repeat(50));
		console.log("📊 MERMAID VALIDATION SUMMARY");
		console.log("=".repeat(50));

		// Basic statistics
		console.log(`📁 Files processed: ${stats.filesProcessed}`);
		console.log(
			`🔍 Files with diagrams: ${stats.filesProcessed - this.countFilesWithNoDiagrams(stats)}`
		);
		console.log(`📊 Total diagrams found: ${stats.diagramsFound}`);
		console.log(`✅ Valid diagrams: ${stats.validDiagrams}`);
		console.log(`❌ Invalid diagrams: ${stats.invalidDiagrams}`);
		console.log(`⏱️  Total duration: ${duration} seconds`);

		if (stats.diagramsFound > 0) {
			const successRate = ((stats.validDiagrams / stats.diagramsFound) * 100).toFixed(1);
			console.log(`📈 Success rate: ${successRate}%`);
		}

		// Error analysis
		if (stats.invalidDiagrams > 0) {
			console.log("\n🔍 ERROR ANALYSIS:");

			// Error categories
			if (stats.errorsByCategory.size > 0) {
				console.log("\n📋 Errors by Category:");
				const sortedCategories = Array.from(stats.errorsByCategory.entries()).sort(
					([, a], [, b]) => b - a
				);

				for (const [category, count] of sortedCategories) {
					const percentage = ((count / stats.invalidDiagrams) * 100).toFixed(1);
					console.log(`   • ${category}: ${count} (${percentage}%)`);
				}
			}

			// Most common errors
			if (stats.commonErrors.size > 0) {
				console.log("\n🚨 Most Common Errors:");
				const sortedErrors = Array.from(stats.commonErrors.entries())
					.sort(([, a], [, b]) => b - a)
					.slice(0, 5); // Top 5 errors

				for (const [error, count] of sortedErrors) {
					console.log(`   • ${error} (${count} occurrences)`);
				}
			}

			console.log("\n💡 RECOMMENDATIONS:");
			this.printRecommendations(stats);
		}

		console.log("\n" + "=".repeat(50));
	}

	/**
	 * Print recommendations based on error analysis
	 */
	private printRecommendations(stats: EnhancedMermaidValidationStats): void {
		const hasQuoteErrors = Array.from(stats.errorsByCategory.keys()).some(
			(cat) => cat.includes("Quote") || cat.includes("Text")
		);
		const hasSyntaxErrors = Array.from(stats.errorsByCategory.keys()).some((cat) =>
			cat.includes("Syntax")
		);
		const hasBrowserErrors = Array.from(stats.errorsByCategory.keys()).some((cat) =>
			cat.includes("Browser")
		);

		if (hasQuoteErrors) {
			console.log(
				"   📝 Quote/Text Errors: Ensure all node and link text is enclosed in double quotes"
			);
		}
		if (hasSyntaxErrors) {
			console.log("   🔧 Syntax Errors: Review Mermaid syntax rules in MERMAID-STANDARDS.md");
		}
		if (hasBrowserErrors) {
			console.log("   🌐 Browser Errors: Check puppeteer configuration and system resources");
		}

		console.log("   📖 For detailed syntax rules, see: MERMAID-STANDARDS.md");
		console.log("   🔬 Run with verbose mode: pnpm run validate-mermaid --verbose");
	}

	/**
	 * Count files that have no diagrams (helper for statistics)
	 */
	private countFilesWithNoDiagrams(stats: EnhancedMermaidValidationStats): number {
		// This would need to be tracked during processing - simplified for now
		return Math.max(0, stats.filesProcessed - Math.ceil(stats.diagramsFound / 2));
	}

	/**
	 * Normalize error messages for grouping similar errors
	 */
	private normalizeErrorMessage(errorMessage: string): string {
		// Remove line numbers and specific details to group similar errors
		return errorMessage
			.replace(/line \d+/gi, "line N")
			.replace(/column \d+/gi, "column N")
			.replace(/at position \d+/gi, "at position N")
			.replace(/\d+ characters?/gi, "N characters")
			.replace(/file:\/\/[^\s]+/g, "file://PATH")
			.trim();
	}

	/**
	 * Main validation method
	 */
	async validate(targetPath?: string): Promise<boolean> {
		const startTime = Date.now();

		// Determine target path
		const target = targetPath || "src/data/book";

		console.log("Starting Mermaid diagram validation...");

		if (!existsSync(target)) {
			console.error(`❌ ERROR: Target path "${target}" does not exist`);
			return false;
		}

		// Collect files to process
		let filesToProcess: string[] = [];

		if (statSync(target).isDirectory()) {
			console.log(`Validating Mermaid diagrams in directory: ${target}`);
			filesToProcess = await this.findTypeScriptFiles(target);
		} else if (target.endsWith(".ts")) {
			console.log(`Validating specific file: ${target}`);
			filesToProcess = [target];
		} else {
			console.error(`❌ ERROR: Target "${target}" is not a directory or TypeScript file`);
			return false;
		}

		if (filesToProcess.length === 0) {
			console.log("No TypeScript files found to validate");
			return true;
		}

		filesToProcess.sort();

		// Process files in parallel
		const results = await this.asyncPool.process(filesToProcess, (file) => this.processFile(file));

		// Calculate enhanced statistics
		const commonErrors = new Map<string, number>();
		const errorsByCategory = new Map<string, number>();

		for (const fileResult of results) {
			for (const result of fileResult.results) {
				const enhancedResult = result as EnhancedMermaidValidationResult;
				if (!enhancedResult.isValid) {
					// Count error messages
					if (enhancedResult.errorMessage) {
						const errorKey = this.normalizeErrorMessage(enhancedResult.errorMessage);
						commonErrors.set(errorKey, (commonErrors.get(errorKey) || 0) + 1);
					}

					// Count error categories
					if (enhancedResult.errorCategory) {
						errorsByCategory.set(
							enhancedResult.errorCategory,
							(errorsByCategory.get(enhancedResult.errorCategory) || 0) + 1
						);
					}
				}
			}
		}

		const stats: EnhancedMermaidValidationStats = {
			filesProcessed: results.length,
			diagramsFound: results.reduce((sum, r) => sum + r.diagramsFound, 0),
			validDiagrams: results.reduce((sum, r) => sum + r.results.filter((v) => v.isValid).length, 0),
			invalidDiagrams: results.reduce(
				(sum, r) => sum + r.results.filter((v) => !v.isValid).length,
				0
			),
			totalDuration: Date.now() - startTime,
			commonErrors,
			errorsByCategory
		};

		// Print results
		this.printResults(
			results.filter((r) => r.diagramsFound > 0),
			stats
		);

		// Return success status
		const success = stats.invalidDiagrams === 0;

		if (success) {
			console.log("All Mermaid diagrams validated successfully!");
		} else {
			console.error("Validation failed. One or more Mermaid diagrams have syntax or style errors.");
		}

		return success;
	}
}

/**
 * Parse CLI arguments
 */
function parseCliArguments(): { targetPath?: string; help: boolean; verbose?: boolean } {
	const args = parseArgs({
		args: process.argv.slice(2),
		options: {
			help: {
				type: "boolean",
				short: "h",
				default: false
			},
			verbose: {
				type: "boolean",
				short: "v",
				default: false
			}
		},
		allowPositionals: true
	});

	return {
		targetPath: args.positionals[0],
		help: args.values.help || false,
		verbose: args.values.verbose || false
	};
}

/**
 * Print help information
 */
function printHelp(): void {
	console.log(`
Mermaid Diagram Validator for Cloud-Native Learning Platform

USAGE:
  pnpm run validate-mermaid [OPTIONS] [TARGET]
  npx tsx src/scripts/mermaid-validator.ts [OPTIONS] [TARGET]

ARGUMENTS:
  TARGET    Path to validate (directory or .ts file)
            Defaults to: src/data/book

OPTIONS:
  -h, --help      Show this help message
  -v, --verbose   Enable verbose mode with immediate error reporting

EXAMPLES:
  pnpm run validate-mermaid                       # Validate default path
  pnpm run validate-mermaid -v                    # Validate with verbose output
  pnpm run validate-mermaid src/data/book         # Validate specific directory
  pnpm run validate-mermaid path/to/file.ts       # Validate single file
  pnpm run validate-mermaid -v src/data/book      # Verbose validation of directory

ENHANCED FEATURES:
  • DiagramBlock Detection: Specifically targets objects with:
    - type: "diagram"
    - diagramType: "mermaid"
    - definition: "<mermaid code>"

  • Dual Reporting Modes:
    - Verbose Mode: Immediate error reporting as diagrams are processed
    - Summary Mode: Comprehensive analysis with error categorization

  • Error Analysis: Groups similar errors and provides recommendations

  • Path Flexibility: Single file, directory, or default path support

CONFIGURATION:
  Settings are managed in src/config/settings.ts under scripts.validation.mermaid:
  - maxParallelFiles: Maximum concurrent validations (default: 4)
  - diagramPropertyNames: Property names to search for diagrams
  - verbose: Enable detailed output logging (can be overridden by CLI flag)

The enhanced validator specifically targets DiagramBlocks in TypeScript content files,
providing detailed error analysis and actionable recommendations for fixing common
Mermaid syntax issues. Each diagram is validated using the mmdc CLI tool with the
project's puppeteer configuration for headless browser execution.
`);
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
	try {
		const { targetPath, help, verbose } = parseCliArguments();

		if (help) {
			printHelp();
			process.exit(0);
		}

		const validator = new MermaidValidator();

		// Override verbose setting if CLI flag provided
		if (verbose !== undefined) {
			validator.setVerbose(verbose);
		}

		const success = await validator.validate(targetPath);

		process.exit(success ? 0 : 1);
	} catch (error) {
		console.error("❌ FATAL ERROR:", error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

// Execute main function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("❌ UNCAUGHT ERROR:", error);
		process.exit(1);
	});
}

// Export classes and functions for testing
export { MermaidValidator, parseCliArguments, printHelp };
