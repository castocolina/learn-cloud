/**
 * Demo Breadcrumb Configuration for Sticky Header Navigation
 *
 * This file contains the data-driven breadcrumb configuration for the demo route's
 * sticky header component. It provides hierarchical navigation structure and supports
 * SPA hash-based navigation.
 *
 * Usage Pattern:
 * - Home > Demo (root demo page)
 * - Home > Demo > Unit Overview (unit selection)
 * - Home > Demo > Unit > Lesson (lesson content)
 * - Home > Demo > Section (demo sections like overview, layout, interactive)
 */

/**
 * Icon type for breadcrumb items
 * These correspond to common icon libraries (Lucide, Heroicons, etc.)
 */
export type BreadcrumbIcon =
	| "Home"
	| "Layers"
	| "BookOpen"
	| "FileText"
	| "Layout"
	| "Zap"
	| "Eye"
	| "Settings"
	| "Archive"
	| "Navigation"
	| "Monitor"
	| "Smartphone";

/**
 * Individual breadcrumb item configuration
 */
export interface BreadcrumbConfig {
	/** Unique identifier for the breadcrumb item */
	id: string;
	/** Display label for the breadcrumb */
	label: string;
	/** Navigation URL (supports hash-based SPA routing) */
	url: string;
	/** Optional icon identifier */
	icon?: BreadcrumbIcon;
	/** Whether this breadcrumb item is currently active */
	isActive?: boolean;
	/** Optional aria-label for accessibility */
	ariaLabel?: string;
	/** Whether this item should be clickable */
	isClickable?: boolean;
}

/**
 * Breadcrumb path configuration for different demo sections
 */
export interface BreadcrumbPath {
	/** Current section identifier */
	section: string;
	/** Array of breadcrumb items forming the navigation path */
	items: BreadcrumbConfig[];
	/** Page title for the current path */
	pageTitle?: string;
	/** Meta description for the current path */
	description?: string;
}

/**
 * Core breadcrumb items for the demo application
 */
export const demoBreadcrumbs = {
	/** Root navigation items */
	root: {
		home: {
			id: "home",
			label: "Home",
			url: "/",
			icon: "Home" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to homepage"
		},
		demo: {
			id: "demo",
			label: "Demo Platform",
			url: "/demo",
			icon: "Layers" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to demo platform overview"
		}
	},

	/** Demo section navigation items */
	sections: {
		overview: {
			id: "overview",
			label: "Overview",
			url: "/demo#overview",
			icon: "Eye" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to platform overview section"
		},
		layout: {
			id: "layout",
			label: "Layout Demo",
			url: "/demo#layout",
			icon: "Layout" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to layout demonstration section"
		},
		interactive: {
			id: "interactive",
			label: "Interactive Features",
			url: "/demo#interactive",
			icon: "Zap" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to interactive features section"
		},
		navigation: {
			id: "navigation",
			label: "Navigation",
			url: "/demo#navigation",
			icon: "Navigation" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to navigation demonstration section"
		},
		responsive: {
			id: "responsive",
			label: "Responsive Design",
			url: "/demo#responsive",
			icon: "Monitor" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to responsive design section"
		},
		mobile: {
			id: "mobile",
			label: "Mobile Experience",
			url: "/demo#mobile",
			icon: "Smartphone" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to mobile experience section"
		}
	},

	/** Content type breadcrumbs for lessons */
	contentTypes: {
		unit: {
			id: "unit",
			label: "Unit",
			url: "/demo",
			icon: "Archive" as BreadcrumbIcon,
			isClickable: true,
			ariaLabel: "Navigate to unit overview"
		},
		lesson: {
			id: "lesson",
			label: "Lesson",
			url: "/demo",
			icon: "BookOpen" as BreadcrumbIcon,
			isClickable: false,
			ariaLabel: "Current lesson content"
		}
	}
} as const;

/**
 * Predefined breadcrumb paths for different demo scenarios
 */
export const demoBreadcrumbPaths: Record<string, BreadcrumbPath> = {
	/** Default demo overview page */
	default: {
		section: "overview",
		items: [demoBreadcrumbs.root.home, { ...demoBreadcrumbs.root.demo, isActive: true }],
		pageTitle: "Demo Platform Overview",
		description: "Interactive demonstration of cloud-native learning platform features"
	},

	/** Demo overview section */
	overview: {
		section: "overview",
		items: [
			demoBreadcrumbs.root.home,
			demoBreadcrumbs.root.demo,
			{ ...demoBreadcrumbs.sections.overview, isActive: true }
		],
		pageTitle: "Platform Overview - Demo",
		description: "Comprehensive overview of platform capabilities and features"
	},

	/** Layout demonstration section */
	layout: {
		section: "layout",
		items: [
			demoBreadcrumbs.root.home,
			demoBreadcrumbs.root.demo,
			{ ...demoBreadcrumbs.sections.layout, isActive: true }
		],
		pageTitle: "Layout Demo - Demo Platform",
		description: "Responsive layout patterns and component organization"
	},

	/** Interactive features section */
	interactive: {
		section: "interactive",
		items: [
			demoBreadcrumbs.root.home,
			demoBreadcrumbs.root.demo,
			{ ...demoBreadcrumbs.sections.interactive, isActive: true }
		],
		pageTitle: "Interactive Features - Demo Platform",
		description: "Interactive components and user engagement features"
	},

	/** Navigation demonstration */
	navigation: {
		section: "navigation",
		items: [
			demoBreadcrumbs.root.home,
			demoBreadcrumbs.root.demo,
			{ ...demoBreadcrumbs.sections.navigation, isActive: true }
		],
		pageTitle: "Navigation Demo - Demo Platform",
		description: "Navigation patterns and user flow demonstrations"
	},

	/** Responsive design showcase */
	responsive: {
		section: "responsive",
		items: [
			demoBreadcrumbs.root.home,
			demoBreadcrumbs.root.demo,
			{ ...demoBreadcrumbs.sections.responsive, isActive: true }
		],
		pageTitle: "Responsive Design - Demo Platform",
		description: "Mobile-first responsive design implementation showcase"
	},

	/** Mobile experience focus */
	mobile: {
		section: "mobile",
		items: [
			demoBreadcrumbs.root.home,
			demoBreadcrumbs.root.demo,
			{ ...demoBreadcrumbs.sections.mobile, isActive: true }
		],
		pageTitle: "Mobile Experience - Demo Platform",
		description: "Optimized mobile user experience and touch interactions"
	}
};

/**
 * Generate dynamic breadcrumb path for unit content
 * @param unitTitle - The title of the current unit
 * @param unitId - The ID of the current unit
 * @returns Breadcrumb path configuration for unit content
 */
export function generateUnitBreadcrumbPath(unitTitle: string, unitId: string): BreadcrumbPath {
	return {
		section: "unit",
		items: [
			demoBreadcrumbs.root.home,
			demoBreadcrumbs.root.demo,
			{
				...demoBreadcrumbs.contentTypes.unit,
				label: unitTitle,
				url: `/demo#/demo/${unitId.replace("demo-", "")}`,
				isActive: true
			}
		],
		pageTitle: `${unitTitle} - Demo Platform`,
		description: `Unit overview and lesson navigation for ${unitTitle}`
	};
}

/**
 * Generate dynamic breadcrumb path for lesson content
 * @param unitTitle - The title of the parent unit
 * @param unitId - The ID of the parent unit
 * @param lessonTitle - The title of the current lesson
 * @param lessonId - The ID of the current lesson
 * @returns Breadcrumb path configuration for lesson content
 */
export function generateLessonBreadcrumbPath(
	unitTitle: string,
	unitId: string,
	lessonTitle: string,
	lessonId: string
): BreadcrumbPath {
	return {
		section: "lesson",
		items: [
			demoBreadcrumbs.root.home,
			demoBreadcrumbs.root.demo,
			{
				...demoBreadcrumbs.contentTypes.unit,
				label: unitTitle,
				url: `/demo#/demo/${unitId.replace("demo-", "")}`,
				isClickable: true
			},
			{
				...demoBreadcrumbs.contentTypes.lesson,
				label: lessonTitle,
				url: `/demo#/demo/${unitId.replace("demo-", "")}/${lessonId.replace(/^demo-lesson-\d+-\d+$/, lessonId.split("-").slice(-1)[0])}`,
				isActive: true
			}
		],
		pageTitle: `${lessonTitle} - ${unitTitle} - Demo Platform`,
		description: `Lesson content for ${lessonTitle} within ${unitTitle} unit`
	};
}

/**
 * Get breadcrumb path configuration based on current section
 * @param section - Current section identifier
 * @param unitTitle - Optional unit title for dynamic paths
 * @param unitId - Optional unit ID for dynamic paths
 * @param lessonTitle - Optional lesson title for dynamic paths
 * @param lessonId - Optional lesson ID for dynamic paths
 * @returns Appropriate breadcrumb path configuration
 */
export function getBreadcrumbPath(
	section: string,
	unitTitle?: string,
	unitId?: string,
	lessonTitle?: string,
	lessonId?: string
): BreadcrumbPath {
	// Handle dynamic unit/lesson paths
	if (section === "unit" && unitTitle && unitId) {
		return generateUnitBreadcrumbPath(unitTitle, unitId);
	}

	if (section === "lesson" && unitTitle && unitId && lessonTitle && lessonId) {
		return generateLessonBreadcrumbPath(unitTitle, unitId, lessonTitle, lessonId);
	}

	// Return predefined path or default
	return demoBreadcrumbPaths[section] || demoBreadcrumbPaths.default;
}

/**
 * Navigation helper for smooth scroll behavior to sections
 * @param sectionId - Target section ID for scrolling
 * @param offset - Optional scroll offset from target (default: 80px for sticky header)
 */
export function scrollToSection(sectionId: string, offset: number = 80): void {
	if (typeof window === "undefined") return;

	const element = document.getElementById(sectionId);
	if (!element) return;

	const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
	const targetPosition = elementPosition - offset;

	window.scrollTo({
		top: targetPosition,
		behavior: "smooth"
	});
}

/**
 * Export default breadcrumb configuration for easy imports
 */
export default {
	breadcrumbs: demoBreadcrumbs,
	paths: demoBreadcrumbPaths,
	getBreadcrumbPath,
	generateUnitBreadcrumbPath,
	generateLessonBreadcrumbPath,
	scrollToSection
};
