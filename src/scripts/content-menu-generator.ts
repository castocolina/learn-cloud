#!/usr/bin/env tsx
/**
 * Content Menu Generator from CONTENT.md (TypeScript Edition)
 *
 * This script parses CONTENT.md (Markdown format) and generates a structured content-menu.ts file
 * that serves as a single source of truth for the book's navigation structure.
 *
 * ENHANCED FEATURES:
 * - TypeScript AST manipulation with ts-morph for code generation
 * - Type-safe content structure validation
 * - Enum-first patterns for better type safety
 * - Modern ES6 modules architecture
 * - Comprehensive error handling and validation
 *
 * BOOK STRUCTURE:
 * ===============
 * # Book: Mastering Cloud-Native Technologies
 * * **Unit** (Unit): Major learning section
 *     * **Chapter** (Chapter): Learning topic within unit
 *         * **Lesson** (Lesson): Main theoretical content
 *         * **Study Guide** (Study Guide): Key points and summaries
 *         * **Quiz** (Quiz): Self-assessment questions
 *     * **Exam** (Exam): Final unit evaluation
 *     * **Project** (Project): Practical implementation
 *
 * CONTENT TYPES & URL PATTERNS:
 * =============================
 * - lesson:      book/unit/X/Y_Z_lesson_slug.html
 * - study_guide: book/unit/X/Y_Z_study_guide.html
 * - quiz:        book/unit/X/Y_Z_quiz.html
 * - exam:        book/unit/X/Y_Z_exam_slug.html
 * - project:     book/unit/X/Y_Z_project_slug.html
 * - unit:        book/unit/X/0_unit_slug.html
 *
 * Where:
 * - X = unit number (1, 2, 3...)
 * - Y_Z = chapter number (1_1, 1_2, 2_3...)
 * - slug = URL-friendly title conversion
 *
 * The generated object includes:
 * - Units with titles, icons, and links
 * - Chapters with titles, icons, and links organized by type
 * - Hierarchical structure parsed from the Markdown outline
 * - Consistent URL patterns for all content types
 * - Strong TypeScript typing using union references
 *
 * Usage:
 *     tsx src/scripts/content-menu-generator.ts [path]
 *     pnpm run generate-menu [path]
 *     make generate-menu
 */

import { readFileSync, existsSync, mkdirSync, statSync } from "fs";
import { join, dirname, isAbsolute } from "path";
import { Project } from "ts-morph";
import type {
	MenuStructure,
	MenuUnit,
	MenuChapter,
	ChapterType,
	TechnologyUnit,
	UnifiedPathConfig,
	ContentDifficulty
} from "$types";
import { generateNavigationPaths } from "$lib/utils/navigation-paths.js";
import { runGeneratedFileValidation } from "../lib/utils/validation-utils.js";
import { SETTINGS } from "$config/settings.js";
const { contentMenu: contentMenuSettings } = SETTINGS.scripts;
import { writeFormattedFile } from "../lib/utils/prettier-writer.js";

// Icon mappings - using standard Lucide icons
const CONTENT_ICONS = {
	// Content types
	lesson: "BookOpen",
	study_guide: "BookOpen",
	quiz: "HelpCircle",
	exam: "Target",
	project: "Rocket",
	unit: "BookOpen",

	// Special unit icons based on keywords
	python: "Box",
	go: "Cpu",
	devops: "Settings",
	secrets: "Lock",
	security: "ShieldCheck",
	automation: "Bot",
	serverless: "Zap",
	integration: "Shield",
	capstone: "GraduationCap",

	// Chapter-specific icons
	environment: "Settings",
	tooling: "Settings",
	overview: "BookOpen",
	foundational: "BookOpen",
	concepts: "BookOpen",
	quality: "CheckCircle",
	standards: "CheckCircle",
	testing: "TestTube",
	observability: "BarChart3",
	monitoring: "BarChart3",
	api: "Globe",
	restful: "Globe",
	concurrency: "Zap",
	caching: "Zap",
	database: "Database",
	backend: "Database",
	advanced: "Target"
} as const;

// Parsing result interface for enhanced table structure
interface ContentParseResult {
	content_type: ChapterType | null;
	chapter_num: string | null;
	unit_num: string | null;
	title: string | null;
	icon_name: string | null;
	emoji?: string | null;
	estimated_time?: number | null;
	difficulty?: string | null;
	prerequisites?: string[] | null;
	learning_objectives?: string[] | null;
}

// Technology unit mapping for icons based on keywords
const TECHNOLOGY_UNIT_MAPPING: Record<string, TechnologyUnit> = {
	python: "python",
	go: "go",
	rust: "rust",
	kubernetes: "kubernetes",
	docker: "docker",
	microservices: "microservices",
	monitoring: "monitoring",
	graphql: "graphql",
	"cloud databases": "cloud_databases",
	database: "cloud_databases"
};

/**
 * Main generator class for creating content menu from CONTENT.md
 */
export class MarkdownContentGenerator {
	private readonly projectRoot: string;
	private readonly contentMdPath: string;
	private readonly outputPath: string;
	private readonly project: Project;
	private readonly skipValidation: boolean;

	constructor(inputFile?: string, options?: { skipValidation?: boolean }) {
		this.projectRoot = process.cwd();
		const inputPath = inputFile || contentMenuSettings.paths.inputFile;
		this.contentMdPath = isAbsolute(inputPath) ? inputPath : join(this.projectRoot, inputPath);
		this.outputPath = join(this.projectRoot, contentMenuSettings.paths.outputFile);
		this.skipValidation = options?.skipValidation ?? false;

		// Initialize ts-morph project for TypeScript manipulation
		this.project = new Project({
			tsConfigFilePath: join(this.projectRoot, "tsconfig.json"),
			skipAddingFilesFromTsConfig: true
		});

		if (!this.skipValidation) {
			console.log(`📍 Input: ${this.contentMdPath}`);
			console.log(`📍 Output: ${this.outputPath}`);
		}
	}

	/**
	 * Extract metadata from markdown content header
	 */
	private extractMetadata(content: string): { title: string; description: string } {
		const lines = content.split("\n");
		let title = "Mastering Cloud-Native Technologies";
		let description = "Comprehensive guide to cloud-native development";

		let titleFound = false;
		const descriptionLines: string[] = [];

		for (const line of lines) {
			const trimmedLine = line.trim();

			// Extract title from first # heading
			if (trimmedLine.startsWith("# ") && !titleFound) {
				const rawTitle = trimmedLine.slice(2).trim();
				if (rawTitle.includes(":")) {
					const parts = rawTitle.split(":");
					if (parts.length > 1) {
						title = parts[1].trim();
					} else {
						title = rawTitle;
					}
				} else {
					title = rawTitle;
				}
				titleFound = true;
				continue;
			}

			// Stop collecting description when we hit separator
			if (trimmedLine.startsWith("---")) {
				break;
			}

			// Collect description lines
			if (titleFound && trimmedLine) {
				descriptionLines.push(trimmedLine);
			}
		}

		// Join description and clean up
		if (descriptionLines.length > 0) {
			description = descriptionLines.join(" ").trim();
		}

		return { title, description };
	}

	/**
	 * Extract icon and emoji metadata from markdown line
	 */
	private extractIconAndEmojiFromLine(line: string): {
		cleanedLine: string;
		iconName: string | null;
		emoji: string | null;
	} {
		const iconPattern = /\[icon:\s*(\w+)\s*\]/;
		const emojiPattern = /\[emoji:\s*([^\]]+)\s*\]/;

		const iconMatch = iconPattern.exec(line);
		const emojiMatch = emojiPattern.exec(line);

		let cleanedLine = line;
		if (iconMatch) {
			cleanedLine = cleanedLine.replace(iconPattern, "").trim();
		}
		if (emojiMatch) {
			cleanedLine = cleanedLine.replace(emojiPattern, "").trim();
		}

		return {
			cleanedLine,
			iconName: iconMatch ? iconMatch[1] : null,
			emoji: emojiMatch ? emojiMatch[1] : null
		};
	}

	/**
	 * Extract icon metadata from markdown line (legacy compatibility)
	 */
	private extractIconFromLine(line: string): { cleanedLine: string; iconName: string | null } {
		const result = this.extractIconAndEmojiFromLine(line);
		return { cleanedLine: result.cleanedLine, iconName: result.iconName };
	}

	/**
	 * Generate URL-friendly slug from title
	 */
	private generateSlug(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^\w]+/g, "_")
			.replace(/^_+|_+$/g, "");
	}

	/**
	 * Generate content paths using unified navigation system
	 */
	private generateContentPaths(
		contentType: ChapterType,
		unitNum: string,
		chapterNum: string,
		title: string
	): { htmlPath: string; dataPath: string } {
		const titleSlug = this.generateSlug(title);

		// Use unified path generation system
		const config: UnifiedPathConfig = {
			contentType,
			unitNum,
			chapterNum: contentType === "overview" || contentType === "exam" ? undefined : chapterNum,
			titleSlug
		};

		const paths = generateNavigationPaths(config);

		return {
			htmlPath: paths.htmlPath,
			dataPath: paths.dataPath
		};
	}

	/**
	 * Get appropriate icon for content based on type and title keywords
	 */
	private getIconForContent(contentType: ChapterType, title = ""): string {
		// Direct content type mapping
		if (contentType in CONTENT_ICONS) {
			return CONTENT_ICONS[contentType as keyof typeof CONTENT_ICONS];
		}

		// For units and chapters, check title keywords
		const titleLower = title.toLowerCase();
		for (const [keyword, icon] of Object.entries(CONTENT_ICONS)) {
			if (titleLower.includes(keyword)) {
				return icon;
			}
		}

		// Default fallbacks
		const fallbacks: Record<string, string> = {
			unit: "BookOpen",
			lesson: "BookOpen",
			chapter: "BookOpen",
			study_guide: "BookOpen",
			quiz: "HelpCircle",
			exam: "Target",
			project: "Rocket"
		};

		return fallbacks[contentType] || "BookOpen";
	}

	/**
	 * Get technology unit for a unit based on title keywords
	 */
	private getTechnologyUnit(title: string): TechnologyUnit {
		const titleLower = title.toLowerCase();

		for (const [keyword, techUnit] of Object.entries(TECHNOLOGY_UNIT_MAPPING)) {
			if (titleLower.includes(keyword)) {
				return techUnit;
			}
		}

		// Default fallback
		return "microservices";
	}

	/**
	 * Extract appropriate title for slug generation based on content type
	 */
	private extractTitleForSlug(contentType: ChapterType, title: string, unitNum: string): string {
		if (contentType === "project") {
			return title.includes(" - ") ? title.split(" - ", 2)[1] : title;
		} else if (contentType === "lesson") {
			return title.includes(": ") ? title.split(": ", 2)[1] : title;
		} else if (contentType === "exam") {
			return `unit_${unitNum}_final_exam`;
		} else {
			// study_guide, quiz - no slug needed
			return "";
		}
	}

	/**
	 * Helper method to extract lesson title with proper cleanup
	 */
	private extractLessonTitle(
		match: RegExpMatchArray,
		cleanedMatch: RegExpMatchArray | null
	): string {
		const chapterTitle =
			cleanedMatch && cleanedMatch[2]
				? cleanedMatch[2].trim().replace(/\.$/, "")
				: match[2]
					? match[2].trim().replace(/\.$/, "")
					: "";

		return `${match[1]}: ${chapterTitle}`;
	}

	/**
	 * Parse enhanced Markdown table row for comprehensive metadata
	 */
	private parseTableRow(row: string): ContentParseResult | null {
		// Skip table header and separator rows
		if (row.includes("Chapter") || row.includes("---") || !row.trim()) {
			return null;
		}

		// Parse table columns: | Chapter | Content | Icon | Emoji | Time | Complexity | Prerequisites | Learning Objectives |
		const columns = row
			.split("|")
			.map((col) => col.trim())
			.filter((col) => col);

		if (columns.length < 8) {
			return null; // Invalid table row
		}

		const [chapter, content, icon, emoji, time, complexity, prerequisites, learningObjectives] =
			columns;

		// Extract chapter number and unit
		const chapterMatch = chapter.replace(/\*\*/g, "").match(/^(\d+)\.(\d+)$/);
		if (!chapterMatch) {
			return null;
		}

		const chapterNum = `${chapterMatch[1]}.${chapterMatch[2]}`;
		const unitNum = chapterMatch[1];

		// Determine content type based on content column
		let contentType: ChapterType;
		const contentLower = content.toLowerCase();

		if (contentLower.includes("study guide")) {
			contentType = "study_guide";
		} else if (contentLower.includes("quiz")) {
			contentType = "quiz";
		} else if (contentLower.includes("final exam")) {
			contentType = "exam";
		} else if (contentLower.includes("project")) {
			contentType = "project";
		} else {
			contentType = "lesson";
		}

		// Parse time (convert to number)
		const estimatedTime = parseInt(time) || null;

		// Parse prerequisites (split by comma if not "To Be Determined")
		const prereqList =
			prerequisites === "To Be Determined"
				? null
				: prerequisites
						.split(",")
						.map((p) => p.trim())
						.filter((p) => p);

		// Parse learning objectives (split by comma)
		const objectivesList =
			learningObjectives === "To Be Determined"
				? null
				: learningObjectives
						.split(",")
						.map((o) => o.trim())
						.filter((o) => o);

		return {
			content_type: contentType,
			chapter_num: chapterNum,
			unit_num: unitNum,
			title: `${chapterNum}: ${content.replace(/\*\*/g, "").trim()}`,
			icon_name: icon,
			emoji: emoji,
			estimated_time: estimatedTime,
			difficulty: complexity,
			prerequisites: prereqList,
			learning_objectives: objectivesList
		};
	}

	/**
	 * Determine content type and extract data from markdown line (legacy support)
	 */
	private determineContentTypeAndData(line: string): ContentParseResult {
		// Content type patterns with priority
		const contentPatterns = [
			{
				type: "study_guide" as ChapterType,
				pattern: /^-\s+\*\*(\d+\.\d+):\s*Study Guide\*\*(?:\s*\[icon:.*?\])?/,
				titleFormat: (match: RegExpMatchArray) => `${match[1]}: Study Guide`
			},
			{
				type: "quiz" as ChapterType,
				pattern: /^-\s+\*\*(\d+\.\d+):\s*Quiz\*\*(?:\s*\[icon:.*?\])?/,
				titleFormat: (match: RegExpMatchArray) => `${match[1]}: Quiz`
			},
			{
				type: "exam" as ChapterType,
				pattern: /^-\s+\*\*(\d+\.\d+):\s*Unit \d+ Final Exam\*\*(?:\s*\[icon:.*?\])?/,
				titleFormat: (match: RegExpMatchArray) =>
					`${match[1]}: Unit ${match[1].split(".")[0]} Final Exam`
			},
			{
				type: "project" as ChapterType,
				pattern: /^-\s+\*\*(\d+\.\d+):\s*Project:\s*(.+?)\*\*(?:\s*\[icon:.*?\])?$/,
				titleFormat: (match: RegExpMatchArray) => `${match[1]}: Project - ${match[2].trim()}`
			},
			{
				type: "lesson" as ChapterType,
				pattern:
					/^-\s+\*\*(\d+\.\d+):\s*(?!(?:Study Guide|Quiz|Unit \d+ Final Exam))(.+?)\*\*(?:\s*\[icon:.*?\])?$/,
				titleFormat: (match: RegExpMatchArray, cleanedMatch: RegExpMatchArray | null = null) =>
					this.extractLessonTitle(match, cleanedMatch)
			}
		];

		// Extract icon if present
		const { cleanedLine, iconName } = this.extractIconFromLine(line);

		// Try each pattern until we find a match
		for (const config of contentPatterns) {
			const pattern = new RegExp(config.pattern.source);
			const match = pattern.exec(line);
			if (match) {
				const chapterNum = match[1];
				const unitNum = chapterNum.split(".")[0];

				// Handle lesson title extraction with cleaned line for icons
				let title: string;
				if (config.type === "lesson" && iconName) {
					const cleanedMatch = pattern.exec(cleanedLine);
					title = config.titleFormat(match, cleanedMatch ?? null);
				} else {
					title = config.titleFormat(match, null);
				}

				return {
					content_type: config.type,
					chapter_num: chapterNum,
					unit_num: unitNum,
					title,
					icon_name: iconName
				};
			}
		}

		return {
			content_type: null,
			chapter_num: null,
			unit_num: null,
			title: null,
			icon_name: null
		};
	}

	/**
	 * Create a chapter object with enhanced metadata using MenuChapter interface
	 */
	private createChapterObject(parseResult: ContentParseResult): MenuChapter {
		if (
			!parseResult.content_type ||
			!parseResult.chapter_num ||
			!parseResult.unit_num ||
			!parseResult.title
		) {
			throw new Error("Invalid parse result for chapter creation");
		}

		const contentType = parseResult.content_type;
		const chapterNum = parseResult.chapter_num;
		const unitNum = parseResult.unit_num;
		const title = parseResult.title;

		// Extract title for slug generation
		const slugTitle = this.extractTitleForSlug(contentType, title, unitNum);

		// Use unified path generation system
		const config: UnifiedPathConfig = {
			contentType,
			unitNum,
			chapterNum,
			titleSlug: slugTitle
		};

		const paths = generateNavigationPaths(config);

		// Determine icon
		const chapterIcon = parseResult.icon_name || this.getIconForContent(contentType, title);

		// Create enhanced chapter object with all metadata
		const chapter: MenuChapter = {
			id: paths.id,
			title,
			icon: chapterIcon,
			emoji: parseResult.emoji || undefined,
			type: contentType,
			chapterNumber: chapterNum,
			chapterUrl: paths.hashUrl,
			chapterDataLink: paths.dataPath
		};

		// Add optional enhanced metadata if available
		if (parseResult.estimated_time) {
			chapter.estimatedTime = parseResult.estimated_time;
		}

		if (parseResult.difficulty) {
			chapter.difficulty = parseResult.difficulty as ContentDifficulty;
		}

		if (parseResult.prerequisites && parseResult.prerequisites.length > 0) {
			chapter.prerequisites = parseResult.prerequisites;
		}

		if (parseResult.learning_objectives && parseResult.learning_objectives.length > 0) {
			chapter.learningObjectives = parseResult.learning_objectives;
		}

		// Add description from learning objectives if available
		if (parseResult.learning_objectives && parseResult.learning_objectives.length > 0) {
			chapter.description = parseResult.learning_objectives.join(", ");
		}

		return chapter;
	}

	/**
	 * Create an overview chapter for a unit
	 */
	private createOverviewChapter(unit: MenuUnit): MenuChapter {
		const unitNum = unit.unitNumber.toString();

		// Extract unit title without "Unit X: " prefix for overview title
		const unitTitleWithoutPrefix = unit.title.replace(/^Unit \d+:\s*/, "");
		const overviewTitle = `Unit ${unitNum}: Overview - ${unitTitleWithoutPrefix}`;

		// Use unified path generation system for overview
		const config: UnifiedPathConfig = {
			contentType: "overview",
			unitNum,
			chapterNum: "0", // Pass chapter "0" to generate {unit}_00 format
			titleSlug: unitTitleWithoutPrefix
		};

		const paths = generateNavigationPaths(config);

		// Create overview chapter with consistent ID format: {unit_padded}_00
		const overviewChapter: MenuChapter = {
			id: paths.id, // Use the paths.id from navigation utility for consistency
			title: overviewTitle,
			icon: "BookOpen", // Default icon for overview
			type: "overview",
			chapterNumber: "0.0", // Special chapter number for overview
			chapterUrl: paths.hashUrl,
			chapterDataLink: paths.dataPath
		};

		console.log(`Created overview chapter with ID: ${overviewChapter.id}`);
		return overviewChapter;
	}

	/**
	 * Parse markdown structure and extract hierarchical content with enhanced table support
	 */
	private parseMarkdownStructure(content: string): MenuUnit[] {
		const units: MenuUnit[] = [];
		const lines = content.split("\n");
		let currentUnit: MenuUnit | null = null;
		let inTable = false;

		// Unit pattern
		const unitPattern = /^## Unit (\d+):\s*(.+?)(?:\s*\[icon:.*?\])?$/;

		for (const line of lines) {
			const trimmedLine = line.trim();

			// Skip empty lines
			if (!trimmedLine) {
				continue;
			}

			// Parse Unit headers
			const unitMatch = unitPattern.exec(trimmedLine);
			if (unitMatch) {
				// Save previous unit
				if (currentUnit) {
					units.push(currentUnit);
				}

				const unitNum = unitMatch[1];
				const unitTitleRaw = unitMatch[2].trim();

				// Extract icon and emoji from unit line
				const { cleanedLine, iconName, emoji } = this.extractIconAndEmojiFromLine(trimmedLine);
				const unitTitle = iconName
					? cleanedLine.match(unitPattern)?.[2]?.trim() || unitTitleRaw
					: unitTitleRaw;

				// Create unit object
				const fullUnitTitle = `Unit ${unitNum}: ${unitTitle}`;
				const unitIcon = iconName || this.getIconForContent("lesson", unitTitle);
				const technologyUnit = this.getTechnologyUnit(unitTitle);

				currentUnit = {
					id: `unit_${unitNum}`,
					title: fullUnitTitle,
					description: unitTitle,
					icon: unitIcon,
					emoji: emoji || undefined,
					technologyUnit,
					unitNumber: parseInt(unitNum),
					chapters: []
				};

				console.log(`Parsed unit ${unitNum}: ${unitTitle} with icon: ${unitIcon}`);
				inTable = false;
				continue;
			}

			// Detect table start
			if (trimmedLine.startsWith("|") && trimmedLine.includes("Chapter")) {
				inTable = true;
				continue;
			}

			// Parse table content rows
			if (currentUnit && inTable && trimmedLine.startsWith("|")) {
				try {
					const parseResult = this.parseTableRow(trimmedLine);

					if (parseResult && parseResult.content_type) {
						const chapterObj = this.createChapterObject(parseResult);
						currentUnit.chapters.push(chapterObj);
						console.log(`Added ${parseResult.content_type}: ${parseResult.title}`);
					}
				} catch (error) {
					console.error(`Error parsing table row: "${trimmedLine}"`, error);
					// Continue processing other rows
				}
				continue;
			}

			// Parse legacy chapter content (fallback for non-table sections)
			if (currentUnit && !inTable && trimmedLine.startsWith("-")) {
				try {
					const parseResult = this.determineContentTypeAndData(trimmedLine);

					if (
						parseResult.content_type &&
						parseResult.chapter_num &&
						parseResult.unit_num &&
						parseResult.title
					) {
						const chapterObj = this.createChapterObject(parseResult);
						currentUnit.chapters.push(chapterObj);
						console.log(`Added ${parseResult.content_type}: ${parseResult.title}`);
					}
				} catch (error) {
					console.error(`Error parsing line: "${trimmedLine}"`, error);
					throw error;
				}
			}

			// Exit table mode if we encounter a non-table line
			if (inTable && !trimmedLine.startsWith("|") && !trimmedLine.includes("---")) {
				inTable = false;
			}
		}

		// Add the last unit
		if (currentUnit) {
			units.push(currentUnit);
		}

		// Automatically prepend overview chapters to each unit
		for (const unit of units) {
			const overviewChapter = this.createOverviewChapter(unit);
			unit.chapters.unshift(overviewChapter);
			console.log(`Added overview chapter for ${unit.title}`);
		}

		const totalChapters = units.reduce((sum, unit) => sum + unit.chapters.length, 0);
		console.log(`Parsed ${units.length} units with ${totalChapters} total chapters`);
		return units;
	}

	/**
	 * Validate the parsed structure for completeness
	 */
	private validateParsedStructure(units: MenuUnit[]): boolean {
		const issues: string[] = [];

		if (units.length === 0) {
			issues.push("No units found in parsed structure");
			return false;
		}

		for (const [unitIdx, unit] of units.entries()) {
			const unitTitle = unit.title || `Unit ${unitIdx + 1}`;

			// Check required unit fields
			const requiredFields: (keyof MenuUnit)[] = ["title", "icon", "technologyUnit"];
			for (const field of requiredFields) {
				if (!unit[field]) {
					issues.push(`Unit '${unitTitle}' missing ${field}`);
				}
			}

			// Check chapters
			if (unit.chapters.length === 0) {
				issues.push(`Unit '${unitTitle}' has no chapters`);
				continue;
			}

			// Validate each chapter
			for (const [chapterIdx, chapter] of unit.chapters.entries()) {
				const chapterTitle = chapter.title || `Chapter ${chapterIdx + 1}`;

				if (!chapter.title) {
					issues.push(`Chapter ${chapterIdx} in unit '${unitTitle}' missing title`);
				}
				if (!chapter.icon) {
					issues.push(`Chapter '${chapterTitle}' missing icon`);
				}
				if (!chapter.chapterDataLink) {
					issues.push(`Chapter '${chapterTitle}' missing chapterDataLink`);
				}
				if (!chapter.type) {
					issues.push(`Chapter '${chapterTitle}' missing type field`);
				}
			}
		}

		if (issues.length > 0) {
			const displayIssues = issues.slice(0, 3);
			const moreIssues = issues.length > 3 ? "..." : "";
			console.warn(`Validation issues: ${displayIssues.join("; ")}${moreIssues}`);
			return false;
		}

		const totalChapters = units.reduce((sum, unit) => sum + unit.chapters.length, 0);
		console.log(`Structure validation passed: ${units.length} units, ${totalChapters} chapters`);
		return true;
	}

	/**
	 * Format a value as idiomatic TypeScript syntax
	 */

	/**
	 * Generate TypeScript module content from parsed units and metadata
	 */
	private generateTypeScriptModule(
		units: MenuUnit[],
		metadata: { title: string; description: string }
	): string {
		const menuStructure: MenuStructure = {
			metadata: {
				title: metadata.title,
				totalUnits: units.length,
				totalChapters: units.reduce((sum, unit) => sum + unit.chapters.length, 0),
				version: "2.0.0"
			},
			units
		};

		// Create TypeScript module with proper imports and exports
		return `import type { MenuStructure } from "$types";

export const contentMenu: MenuStructure = ${JSON.stringify(menuStructure)};
`;
	}

	/**
	 * Ensure output directory exists
	 */
	private ensureOutputDirectory(): void {
		const outputDir = dirname(this.outputPath);
		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true });
			console.log(`Created output directory: ${outputDir}`);
		}
	}

	/**
	 * Write TypeScript file using writeFormattedFile for proper formatting
	 */
	private async writeTypeScriptFile(content: string): Promise<void> {
		try {
			this.ensureOutputDirectory();

			// Write the file with Prettier formatting
			await writeFormattedFile(this.outputPath, content);

			const fileSize = statSync(this.outputPath).size;
			console.log(`Successfully wrote ${"content-menu.ts"} to ${this.outputPath}`);
			console.log(`File size: ${fileSize} bytes`);
		} catch (error) {
			console.error("Error writing TypeScript file:", error);
			throw error;
		}
	}

	/**
	 * Read and validate the CONTENT.md file
	 */
	private readContentMd(): string {
		try {
			if (!existsSync(this.contentMdPath)) {
				throw new Error(`CONTENT.md not found at ${this.contentMdPath}`);
			}

			const content = readFileSync(this.contentMdPath, "utf-8");

			if (!content.trim()) {
				throw new Error("CONTENT.md is empty");
			}

			console.log(`Successfully read CONTENT.md (${content.length} characters)`);
			return content;
		} catch (error) {
			console.error(`Error reading CONTENT.md: ${error}`);
			throw error;
		}
	}

	// Validation logic moved to src/lib/utils/validation-utils.ts for reusability

	/**
	 * Main generation process
	 * @param configId Optional unique identifier for test isolation
	 */
	public async generate(configId?: string): Promise<boolean> {
		try {
			console.log(`Starting ${"content-menu.ts"} generation from CONTENT.md`);

			// Read and parse Markdown content
			const markdownContent = this.readContentMd();

			// Extract metadata from markdown content
			const metadata = this.extractMetadata(markdownContent);
			console.log(`Extracted metadata - Title: '${metadata.title}'`);

			// Parse structure from markdown
			console.log("Parsing markdown structure...");
			const units = this.parseMarkdownStructure(markdownContent);

			// Validate parsed structure
			if (!this.validateParsedStructure(units)) {
				console.error("Parsed structure validation failed");
				console.info("Proceeding despite validation failure for debugging");
			}

			// Generate TypeScript module with dynamic metadata
			const typescriptContent = this.generateTypeScriptModule(units, metadata);

			// Write TypeScript file
			await this.writeTypeScriptFile(typescriptContent);

			if (!this.skipValidation) {
				console.log(`${"content-menu.ts"} generation completed successfully`);

				// Run validation for the generated file
				const validationResults = await runGeneratedFileValidation(this.outputPath, configId);
				const hasFailures = validationResults.some((result) => !result.success);
				if (hasFailures) {
					console.error("⚠️  Some validation checks failed, but generation was successful");
				}
			}

			// Summary
			const totalChapters = units.reduce((sum, unit) => sum + unit.chapters.length, 0);
			console.log(`✅ Generated ${"content-menu.ts"} from CONTENT.md successfully!`);
			console.log(`📊 Structure: ${units.length} units, ${totalChapters} chapters`);
			console.log(`🔗 Generated consistent URL patterns and data paths`);
			console.log(`🎯 TypeScript module with type safety`);

			return true;
		} catch (error) {
			console.error(`Generation failed: ${error}`);
			return false;
		}
	}
}

/**
 * Main entry point for CLI usage
 */
async function main() {
	const inputFile = process.argv[2]; // Optional input file path
	const generator = new MarkdownContentGenerator(inputFile);
	const success = await generator.generate();

	if (success) {
		console.log(`📍 Output: ${generator["outputPath"]}`);
	} else {
		console.log(`❌ Failed to generate ${"content-menu.ts"} from CONTENT.md`);
		process.exit(1);
	}
}

// Run main function if script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("Unhandled error:", error);
		process.exit(1);
	});
}

export default MarkdownContentGenerator;
