/**
 * Unified Navigation System for Cloud-Native Learning Platform
 *
 * This module provides the single source of truth for ALL navigation path generation
 * and asset resolution across the entire application, supporting both build-time
 * menu generation and runtime navigation components.
 *
 * Key Features:
 * - Unified path generation for consistency between build-time and runtime
 * - Zero-padded numbering for proper sorting (01, 01_01, etc.)
 * - Support for unit overview pages as special chapters
 * - Hash-based and route-based URL patterns
 * - Dynamic asset resolution with error handling
 * - Type-safe configuration and results
 *
 * Usage:
 * - Content Menu Generator: generateNavigationPaths() for build-time menu creation
 * - Sidebar Navigation: generateSidebarLink() for navigation links
 * - Search Results: generateSearchResultLink() for search result navigation
 * - Breadcrumbs: generateBreadcrumbTrail() for hierarchical navigation
 * - Asset Loading: resolveAndLoadAsset() for dynamic content imports
 */

import type {
	ChapterType,
	BreadcrumbItem,
	UnifiedPathConfig,
	NavigationPaths,
	ParsedNavigation,
	BaseContent
} from "$types";

/**
 * Zero-pad numbers for consistent sorting and display
 */
function padNumber(num: string | number, length: number = 2): string {
	return String(num).padStart(length, "0");
}

/**
 * Extract chapter number from chapter string (e.g., "1.1" -> "1")
 * Handles both simple numbers ("1") and decimal format ("1.1", "1.10")
 */
function extractChapterNumber(chapterNum: string): string {
	// For formats like "1.1", "1.10" - extract the part after the decimal
	if (chapterNum.includes(".")) {
		const parts = chapterNum.split(".");
		return parts[1] || "1"; // Return chapter part or default to "1"
	}
	// For simple numbers, return as-is
	return chapterNum;
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/\s+/g, "_") // Replace spaces with underscores
		.replace(/__+/g, "_") // Replace multiple underscores with single
		.replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
}

/**
 * Generate consistent file naming based on content type and metadata
 */
function generateFileName(config: UnifiedPathConfig): string {
	const { contentType, unitNum, chapterNum, titleSlug } = config;

	const paddedUnit = padNumber(unitNum);

	// Handle unit-level content (overview, exam)
	if (contentType === "overview") {
		const slug = titleSlug ? `_${generateSlug(titleSlug)}` : "";
		return `${paddedUnit}_00_overview${slug}`;
	}

	if (contentType === "exam") {
		const slug = titleSlug ? `_${generateSlug(titleSlug)}` : "_final_exam";
		return `${paddedUnit}_99_exam${slug}`;
	}

	// Regular chapter content (lesson, study_guide, quiz, project)
	const extractedChapter = chapterNum ? extractChapterNumber(chapterNum) : "1";
	const paddedChapter = padNumber(extractedChapter);
	const chapterPrefix = `${paddedUnit}_${paddedChapter}`;
	const typeInfix = contentType === "lesson" ? "lesson" : contentType;
	const slug = titleSlug ? `_${generateSlug(titleSlug)}` : "";

	return `${chapterPrefix}_${typeInfix}${slug}`;
}

/**
 * CORE FUNCTION: Generate all navigation paths from configuration
 *
 * This is the single source of truth used by both build-time generation
 * and runtime navigation components to ensure consistency.
 */
export function generateNavigationPaths(config: UnifiedPathConfig): NavigationPaths {
	const { contentType, unitNum, chapterNum, titleSlug: _titleSlug } = config;

	const paddedUnit = padNumber(unitNum);
	const extractedChapter = chapterNum ? extractChapterNumber(chapterNum) : "0";
	const paddedChapter = padNumber(extractedChapter);
	const fileName = generateFileName(config);

	// Generate zero-padded ID for sorting and uniqueness
	const id = chapterNum ? `${paddedUnit}_${paddedChapter}` : paddedUnit;

	// Build paths for different contexts
	const htmlPath = `book/unit/${paddedUnit}/${fileName}.html`;
	const dataPath = `book/unit${paddedUnit}/${fileName}.ts`;
	const importPath = `$data/${dataPath}`;

	// Hash-based navigation for SPA behavior
	const hashFragment = chapterNum
		? `unit${paddedUnit}/chapter${paddedChapter}`
		: `unit${paddedUnit}`;
	const hashUrl = `#${hashFragment}`;

	// SvelteKit route patterns
	const routePath = chapterNum
		? `/unit/${paddedUnit}/chapter/${paddedChapter}`
		: `/unit/${paddedUnit}`;
	const spaUrl = `/demo${hashUrl}`;

	// Asset tracking and caching key
	const assetKey = `${paddedUnit}_${paddedChapter}_${contentType}`;

	// Display paths for UI components
	const unitDisplay = `Unit ${unitNum}`;
	const chapterDisplay = chapterNum ? ` › Chapter ${unitNum}.${chapterNum}` : "";
	const typeDisplay = contentType === "lesson" ? "" : ` › ${contentType.replace("_", " ")}`;
	const displayPath = `${unitDisplay}${chapterDisplay}${typeDisplay}`;

	// Short name for compact displays
	const shortName = chapterNum ? `${unitNum}.${chapterNum}` : `Unit ${unitNum}`;

	return {
		htmlPath,
		dataPath,
		hashUrl,
		routePath,
		spaUrl,
		importPath,
		assetKey,
		id,
		displayPath,
		shortName
	};
}

/**
 * Parse navigation URL back to configuration
 *
 * Supports multiple URL formats:
 * - Hash-based: #unit01/chapter01_01
 * - Route-based: /unit/01/chapter/01_01
 * - Legacy: book/unit/01/01_01_lesson_title.html
 */
export function parseNavigationUrl(url: string): ParsedNavigation {
	try {
		let unitNum: string;
		let chapterNum: string | undefined;
		let contentType: ChapterType = "lesson";

		// Parse hash-based URLs (#unit01/chapter01_01)
		const hashMatch = url.match(/#unit(\d+)(?:\/chapter(\d+)_(\d+))?/);
		if (hashMatch) {
			unitNum = hashMatch[1];
			if (hashMatch[2] && hashMatch[3]) {
				const parsedUnit = parseInt(hashMatch[2]);
				const parsedChapter = parseInt(hashMatch[3]);
				chapterNum = String(parsedChapter);
				// Validate unit consistency
				if (parsedUnit !== parseInt(unitNum)) {
					throw new Error(`Unit mismatch in URL: ${url}`);
				}
			}
		}
		// Parse route-based URLs (/unit/01/chapter/01_01)
		else {
			const routeMatch = url.match(/\/unit\/(\d+)(?:\/chapter\/(\d+)_(\d+))?/);
			if (routeMatch) {
				unitNum = routeMatch[1];
				if (routeMatch[2] && routeMatch[3]) {
					const parsedUnit = parseInt(routeMatch[2]);
					const parsedChapter = parseInt(routeMatch[3]);
					chapterNum = String(parsedChapter);
					// Validate unit consistency
					if (parsedUnit !== parseInt(unitNum)) {
						throw new Error(`Unit mismatch in URL: ${url}`);
					}
				}
			}
			// Parse legacy HTML paths
			else {
				const legacyMatch = url.match(/book\/unit\/(\d+)\/(\d+)_(\d+)_(\w+)_.*\.html/);
				if (legacyMatch) {
					const parsedUnit = parseInt(legacyMatch[1]);
					const fileUnit = parseInt(legacyMatch[2]);
					const fileChapter = parseInt(legacyMatch[3]);
					const fileType = legacyMatch[4];

					// Validate consistency
					if (parsedUnit !== fileUnit) {
						throw new Error(`Unit path mismatch in URL: ${url}`);
					}

					unitNum = String(parsedUnit);
					chapterNum = String(fileChapter);
					contentType = fileType as ChapterType;
				} else {
					throw new Error(`Unrecognized URL format: ${url}`);
				}
			}
		}

		const config: UnifiedPathConfig = {
			contentType,
			unitNum: unitNum!,
			chapterNum
		};

		const paths = generateNavigationPaths(config);

		return {
			config,
			paths,
			isValid: true
		};
	} catch (error) {
		return {
			config: {
				contentType: "lesson",
				unitNum: "1"
			},
			paths: generateNavigationPaths({
				contentType: "lesson",
				unitNum: "1"
			}),
			isValid: false,
			error: error instanceof Error ? error.message : "Unknown parsing error"
		};
	}
}

/**
 * Resolve and load asset dynamically with comprehensive error handling
 *
 * Used by navigation handlers to load content when users navigate to new pages.
 */
export async function resolveAndLoadAsset(paths: NavigationPaths): Promise<BaseContent | null> {
	try {
		console.log(`🔄 Loading asset: ${paths.importPath}`);

		// Dynamic import with error handling
		const module = await import(/* @vite-ignore */ paths.importPath);
		const content = module.default || module;

		// Validate content structure
		if (!content || typeof content !== "object") {
			throw new Error(`Invalid content structure in ${paths.importPath}`);
		}

		console.log(`✅ Successfully loaded: ${paths.assetKey}`);
		return content as BaseContent;
	} catch (error) {
		console.error(`❌ Failed to load asset: ${paths.importPath}`, error);

		// Return null to allow graceful fallback handling
		return null;
	}
}

/**
 * Generate sidebar navigation link
 *
 * Used by sidebar components to create consistent navigation links.
 */
export function generateSidebarLink(config: UnifiedPathConfig): string {
	const paths = generateNavigationPaths(config);
	return paths.hashUrl;
}

/**
 * Generate search result navigation link
 *
 * Used by search components to create links to search results.
 */
export function generateSearchResultLink(config: UnifiedPathConfig): string {
	const paths = generateNavigationPaths(config);
	return paths.spaUrl;
}

/**
 * Generate breadcrumb trail for hierarchical navigation
 *
 * Creates a complete breadcrumb path from root to current location.
 */
export function generateBreadcrumbTrail(config: UnifiedPathConfig): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [];

	// Root breadcrumb
	breadcrumbs.push({
		id: "root",
		label: "Home",
		url: "/",
		icon: "Home",
		isClickable: true,
		type: "root"
	});

	// Unit breadcrumb
	const unitConfig: UnifiedPathConfig = {
		contentType: "overview",
		unitNum: config.unitNum
	};
	const unitPaths = generateNavigationPaths(unitConfig);

	breadcrumbs.push({
		id: `unit_${config.unitNum}`,
		label: `Unit ${config.unitNum}`,
		url: unitPaths.hashUrl,
		icon: "Layers",
		isClickable: true,
		type: "unit",
		metadata: {
			unitId: config.unitNum
		}
	});

	// Chapter breadcrumb (if applicable)
	if (config.chapterNum && config.contentType !== "overview") {
		const chapterPaths = generateNavigationPaths(config);

		breadcrumbs.push({
			id: chapterPaths.id,
			label: `Chapter ${config.unitNum}.${config.chapterNum}`,
			url: chapterPaths.hashUrl,
			icon: "BookOpen",
			isClickable: true,
			type: "chapter",
			metadata: {
				unitId: config.unitNum,
				chapterType: config.contentType
			}
		});
	}

	// Mark the last item as active (current page)
	if (breadcrumbs.length > 0) {
		breadcrumbs[breadcrumbs.length - 1].isActive = true;
	}

	return breadcrumbs;
}

/**
 * Utility function to validate configuration
 */
export function validatePathConfig(config: UnifiedPathConfig): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!config.unitNum || isNaN(parseInt(config.unitNum))) {
		errors.push("unitNum must be a valid number");
	}

	if (config.chapterNum && isNaN(parseInt(config.chapterNum))) {
		errors.push("chapterNum must be a valid number when provided");
	}

	if (!config.contentType) {
		errors.push("contentType is required");
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Debug utility to log path generation results
 */
export function debugPaths(config: UnifiedPathConfig): void {
	console.group(`🔍 Navigation Paths Debug: ${config.contentType}`);
	console.log("Config:", config);

	const validation = validatePathConfig(config);
	if (!validation.isValid) {
		console.error("❌ Validation Errors:", validation.errors);
		console.groupEnd();
		return;
	}

	const paths = generateNavigationPaths(config);
	console.log("Generated Paths:", paths);

	const breadcrumbs = generateBreadcrumbTrail(config);
	console.log("Breadcrumbs:", breadcrumbs);

	console.groupEnd();
}
