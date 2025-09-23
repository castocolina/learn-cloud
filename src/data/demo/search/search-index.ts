import type { ContentType } from "$types";
import { CONTENT_TYPES } from "$types";
import type { SearchableItem, SearchCategory } from "$types";

export interface SearchConfiguration {
	debounceMs: number;
	minQueryLength: number;
	maxResults: number;
	highlightTags: {
		open: string;
		close: string;
	};
	weights: { [K in ContentType]: number };
	categories: SearchCategory[];
}

export const searchConfig: SearchConfiguration = {
	debounceMs: 300,
	minQueryLength: 2,
	maxResults: 50,
	highlightTags: {
		open: '<mark class="bg-yellow-200 dark:bg-yellow-600">',
		close: "</mark>"
	},
	weights: {
		component: 1.0,
		lesson: 0.9,
		code: 0.8,
		diagram: 0.7,
		interactive: 0.85,
		text: 0.6,
		mixed: 0.75
	},
	categories: [
		{ id: "all", name: "All Content", icon: "search" },
		{ id: "components", name: "Components", icon: "component" },
		{ id: "lessons", name: "Lessons", icon: "book" },
		{ id: "code", name: "Code Examples", icon: "code" },
		{ id: "diagrams", name: "Diagrams", icon: "diagram" },
		{ id: "interactive", name: "Interactive", icon: "play" }
	]
};

export const searchIndex: SearchableItem[] = [
	// Component items (35 items)
	{
		id: "btn-primary",
		title: "Primary Button",
		description: "Main action button with primary styling and hover effects",
		content:
			"Primary button component for main user actions. Features accessible design patterns, focus management, and responsive sizing.",
		type: "component",
		category: "ui-components",
		keywords: ["button", "primary", "action", "click", "ui", "interactive"],
		tags: ["shadcn", "accessible", "responsive"],
		nav: {
			unitId: "ui-components",
			lessonId: "button-primary",
			path: "#/demo/unit/ui-components/lesson/button-primary"
		},
		weight: 1.0
	},
	{
		id: "btn-secondary",
		title: "Secondary Button",
		description: "Alternative action button with secondary styling",
		content:
			"Secondary button for supporting actions. Maintains visual hierarchy while providing clear interactive feedback.",
		type: "component",
		category: "ui-components",
		keywords: ["button", "secondary", "alternative", "action", "ui"],
		tags: ["shadcn", "accessible"],
		nav: {
			unitId: "ui-components",
			lessonId: "button-secondary",
			path: "#/demo/unit/ui-components/lesson/button-secondary"
		},
		weight: 0.9
	},
	{
		id: "input-text",
		title: "Text Input Field",
		description: "Standard text input with validation and accessibility features",
		content:
			"Text input component with built-in validation, error handling, and ARIA compliance for form accessibility.",
		type: "component",
		category: "form-controls",
		keywords: ["input", "text", "form", "validation", "accessibility", "aria"],
		tags: ["form", "validation", "accessible"],
		nav: {
			unitId: "form-controls",
			lessonId: "input-text",
			path: "#/demo/unit/form-controls/lesson/input-text"
		},
		weight: 1.0
	},
	{
		id: "select-dropdown",
		title: "Select Dropdown",
		description: "Custom select dropdown with search and multi-select capabilities",
		content:
			"Advanced select component supporting search, multi-selection, and keyboard navigation with full accessibility support.",
		type: "component",
		category: "form-controls",
		keywords: ["select", "dropdown", "multi-select", "search", "keyboard", "navigation"],
		tags: ["form", "search", "accessible", "keyboard"],
		nav: {
			unitId: "form-controls",
			lessonId: "select-dropdown",
			path: "#/demo/unit/form-controls/lesson/select-dropdown"
		},
		weight: 1.0
	},
	{
		id: "modal-dialog",
		title: "Modal Dialog",
		description: "Accessible modal dialog with focus management and escape handling",
		content:
			"Modal dialog component with proper focus trapping, escape key handling, and backdrop click management for optimal UX.",
		type: "component",
		category: "overlays",
		keywords: ["modal", "dialog", "overlay", "focus", "trap", "escape", "backdrop"],
		tags: ["overlay", "accessible", "focus-management"],
		nav: {
			unitId: "overlays",
			lessonId: "modal-dialog",
			path: "#/demo/unit/overlays/lesson/modal-dialog"
		},
		weight: 1.0
	},
	{
		id: "toast-notification",
		title: "Toast Notification",
		description: "Non-intrusive notification system with auto-dismiss",
		content:
			"Toast notification component for user feedback with configurable duration, positioning, and multiple severity levels.",
		type: "component",
		category: "feedback",
		keywords: ["toast", "notification", "alert", "feedback", "auto-dismiss", "severity"],
		tags: ["notification", "feedback", "auto-dismiss"],
		nav: {
			unitId: "feedback",
			lessonId: "toast-notification",
			path: "#/demo/unit/feedback/lesson/toast-notification"
		},
		weight: 0.9
	},
	{
		id: "loading-spinner",
		title: "Loading Spinner",
		description: "Animated loading indicator with accessibility announcements",
		content:
			"Loading spinner with ARIA live regions for screen reader announcements and customizable size and color options.",
		type: "component",
		category: "feedback",
		keywords: ["loading", "spinner", "progress", "aria", "screen-reader", "animation"],
		tags: ["loading", "accessible", "animation"],
		nav: {
			unitId: "feedback",
			lessonId: "loading-spinner",
			path: "#/demo/unit/feedback/lesson/loading-spinner"
		},
		weight: 0.8
	},
	{
		id: "progress-bar",
		title: "Progress Bar",
		description: "Determinate and indeterminate progress indicators",
		content:
			"Progress bar component supporting both determinate and indeterminate states with smooth animations and value announcements.",
		type: "component",
		category: "feedback",
		keywords: ["progress", "bar", "determinate", "indeterminate", "animation", "value"],
		tags: ["progress", "animation", "accessible"],
		nav: {
			unitId: "feedback",
			lessonId: "progress-bar",
			path: "#/demo/unit/feedback/lesson/progress-bar"
		},
		weight: 0.8
	},
	{
		id: "data-table",
		title: "Data Table",
		description: "Sortable, filterable data table with pagination",
		content:
			"Comprehensive data table with sorting, filtering, pagination, and row selection. Includes keyboard navigation and screen reader support.",
		type: "component",
		category: "data-display",
		keywords: ["table", "data", "sort", "filter", "pagination", "selection", "keyboard"],
		tags: ["table", "data", "sortable", "filterable", "accessible"],
		nav: {
			unitId: "data-display",
			lessonId: "data-table",
			path: "#/demo/unit/data-display/lesson/data-table"
		},
		weight: 1.0
	},
	{
		id: "card-container",
		title: "Card Container",
		description: "Flexible card layout with header, content, and footer sections",
		content:
			"Card component with customizable sections, shadow effects, and responsive design patterns for content organization.",
		type: "component",
		category: "layout",
		keywords: ["card", "container", "layout", "header", "footer", "shadow", "responsive"],
		tags: ["layout", "container", "responsive"],
		nav: {
			unitId: "layout",
			lessonId: "card-container",
			path: "#/demo/unit/layout/lesson/card-container"
		},
		weight: 0.9
	},
	{
		id: "navigation-menu",
		title: "Navigation Menu",
		description: "Multi-level navigation with mobile responsiveness",
		content:
			"Navigation menu supporting nested items, mobile hamburger menu, and keyboard navigation with ARIA compliance.",
		type: "component",
		category: "navigation",
		keywords: ["navigation", "menu", "mobile", "hamburger", "nested", "keyboard", "aria"],
		tags: ["navigation", "mobile", "accessible", "responsive"],
		nav: {
			unitId: "navigation",
			lessonId: "navigation-menu",
			path: "#/demo/unit/navigation/lesson/navigation-menu"
		},
		weight: 1.0
	},
	{
		id: "breadcrumb-nav",
		title: "Breadcrumb Navigation",
		description: "Hierarchical navigation breadcrumbs with structured data",
		content:
			"Breadcrumb navigation component with JSON-LD structured data for SEO and proper ARIA navigation landmarks.",
		type: "component",
		category: "navigation",
		keywords: ["breadcrumb", "navigation", "hierarchy", "seo", "json-ld", "aria", "landmark"],
		tags: ["navigation", "seo", "accessible", "hierarchy"],
		nav: {
			unitId: "navigation",
			lessonId: "breadcrumb-nav",
			path: "#/demo/unit/navigation/lesson/breadcrumb-nav"
		},
		weight: 0.8
	},
	{
		id: "tab-interface",
		title: "Tab Interface",
		description: "Accessible tab component with keyboard navigation",
		content:
			"Tab interface following ARIA authoring practices with proper focus management and keyboard arrow navigation.",
		type: "component",
		category: "navigation",
		keywords: ["tabs", "interface", "aria", "keyboard", "focus", "navigation", "arrow"],
		tags: ["tabs", "accessible", "keyboard", "aria"],
		nav: {
			unitId: "navigation",
			lessonId: "tab-interface",
			path: "#/demo/unit/navigation/lesson/tab-interface"
		},
		weight: 0.9
	},
	{
		id: "accordion-panel",
		title: "Accordion Panel",
		description: "Expandable content panels with smooth animations",
		content:
			"Accordion component with smooth expand/collapse animations, keyboard support, and proper ARIA states.",
		type: "component",
		category: "content",
		keywords: ["accordion", "panel", "expand", "collapse", "animation", "keyboard", "aria"],
		tags: ["accordion", "animation", "accessible", "expandable"],
		nav: {
			unitId: "content",
			lessonId: "accordion-panel",
			path: "#/demo/unit/content/lesson/accordion-panel"
		},
		weight: 0.9
	},
	{
		id: "tooltip-popup",
		title: "Tooltip Popup",
		description: "Contextual tooltip with smart positioning",
		content:
			"Tooltip component with automatic positioning, collision detection, and both hover and focus trigger support.",
		type: "component",
		category: "overlays",
		keywords: ["tooltip", "popup", "positioning", "collision", "hover", "focus", "contextual"],
		tags: ["tooltip", "overlay", "positioning", "accessible"],
		nav: {
			unitId: "overlays",
			lessonId: "tooltip-popup",
			path: "#/demo/unit/overlays/lesson/tooltip-popup"
		},
		weight: 0.8
	},
	{
		id: "date-picker",
		title: "Date Picker",
		description: "Accessible date selection with calendar interface",
		content:
			"Date picker with calendar grid, keyboard navigation, and internationalization support for date formatting.",
		type: "component",
		category: "form-controls",
		keywords: ["date", "picker", "calendar", "keyboard", "i18n", "internationalization"],
		tags: ["form", "date", "calendar", "accessible", "i18n"],
		nav: {
			unitId: "form-controls",
			lessonId: "date-picker",
			path: "#/demo/unit/form-controls/lesson/date-picker"
		},
		weight: 1.0
	},
	{
		id: "file-uploader",
		title: "File Uploader",
		description: "Drag-and-drop file upload with progress tracking",
		content:
			"File upload component with drag-and-drop, progress indicators, file validation, and multiple file support.",
		type: "component",
		category: "form-controls",
		keywords: ["file", "upload", "drag", "drop", "progress", "validation", "multiple"],
		tags: ["form", "upload", "drag-drop", "progress"],
		nav: {
			unitId: "form-controls",
			lessonId: "file-uploader",
			path: "#/demo/unit/form-controls/lesson/file-uploader"
		},
		weight: 1.0
	},
	{
		id: "image-gallery",
		title: "Image Gallery",
		description: "Responsive image gallery with lightbox functionality",
		content:
			"Image gallery with responsive grid layout, lazy loading, and lightbox modal for full-size viewing.",
		type: "component",
		category: "media",
		keywords: ["image", "gallery", "responsive", "grid", "lazy", "loading", "lightbox", "modal"],
		tags: ["media", "gallery", "responsive", "lazy-loading"],
		nav: {
			unitId: "media",
			lessonId: "image-gallery",
			path: "#/demo/unit/media/lesson/image-gallery"
		},
		weight: 0.9
	},
	{
		id: "video-player",
		title: "Video Player",
		description: "Custom video player with accessibility controls",
		content:
			"Video player component with custom controls, captions support, and keyboard navigation for accessibility.",
		type: "component",
		category: "media",
		keywords: ["video", "player", "controls", "captions", "keyboard", "accessibility"],
		tags: ["media", "video", "accessible", "captions"],
		nav: {
			unitId: "media",
			lessonId: "video-player",
			path: "#/demo/unit/media/lesson/video-player"
		},
		weight: 0.9
	},
	{
		id: "search-input",
		title: "Search Input",
		description: "Enhanced search input with autocomplete suggestions",
		content:
			"Search input component with real-time suggestions, keyboard navigation, and result highlighting.",
		type: "component",
		category: "form-controls",
		keywords: ["search", "input", "autocomplete", "suggestions", "keyboard", "highlighting"],
		tags: ["search", "form", "autocomplete", "accessible"],
		nav: {
			unitId: "form-controls",
			lessonId: "search-input",
			path: "#/demo/unit/form-controls/lesson/search-input"
		},
		weight: 1.0
	},
	{
		id: "code-editor",
		title: "Code Editor",
		description: "Syntax-highlighted code editor with line numbers",
		content:
			"Code editor component with syntax highlighting, line numbers, and keyboard shortcuts for code editing.",
		type: "component",
		category: "editor",
		keywords: ["code", "editor", "syntax", "highlighting", "line", "numbers", "shortcuts"],
		tags: ["code", "editor", "syntax", "development"],
		nav: {
			unitId: "editor",
			lessonId: "code-editor",
			path: "#/demo/unit/editor/lesson/code-editor"
		},
		weight: 0.9
	},
	{
		id: "markdown-renderer",
		title: "Markdown Renderer",
		description: "Markdown to HTML renderer with custom styling",
		content:
			"Markdown renderer component with custom styling, syntax highlighting for code blocks, and link handling.",
		type: "component",
		category: "content",
		keywords: ["markdown", "renderer", "html", "styling", "syntax", "code", "blocks", "links"],
		tags: ["markdown", "content", "renderer", "styling"],
		nav: {
			unitId: "content",
			lessonId: "markdown-renderer",
			path: "#/demo/unit/content/lesson/markdown-renderer"
		},
		weight: 0.8
	},
	{
		id: "chart-visualization",
		title: "Chart Visualization",
		description: "Interactive charts and graphs for data visualization",
		content:
			"Chart component supporting various chart types with interactive features and accessibility for data visualization.",
		type: "component",
		category: "data-display",
		keywords: ["chart", "visualization", "graph", "interactive", "data", "accessibility"],
		tags: ["chart", "data", "visualization", "interactive"],
		nav: {
			unitId: "data-display",
			lessonId: "chart-visualization",
			path: "#/demo/unit/data-display/lesson/chart-visualization"
		},
		weight: 0.9
	},
	{
		id: "form-wizard",
		title: "Form Wizard",
		description: "Multi-step form with progress tracking and validation",
		content:
			"Form wizard component with step navigation, progress tracking, field validation, and data persistence.",
		type: "component",
		category: "form-controls",
		keywords: ["form", "wizard", "multi-step", "progress", "validation", "persistence"],
		tags: ["form", "wizard", "multi-step", "validation"],
		nav: {
			unitId: "form-controls",
			lessonId: "form-wizard",
			path: "#/demo/unit/form-controls/lesson/form-wizard"
		},
		weight: 1.0
	},
	{
		id: "sidebar-layout",
		title: "Sidebar Layout",
		description: "Responsive sidebar layout with collapsible navigation",
		content:
			"Sidebar layout component with responsive behavior, collapsible navigation, and main content area management.",
		type: "component",
		category: "layout",
		keywords: ["sidebar", "layout", "responsive", "collapsible", "navigation", "content"],
		tags: ["layout", "sidebar", "responsive", "navigation"],
		nav: {
			unitId: "layout",
			lessonId: "sidebar-layout",
			path: "#/demo/unit/layout/lesson/sidebar-layout"
		},
		weight: 0.9
	},
	{
		id: "header-navigation",
		title: "Header Navigation",
		description: "Fixed header with responsive navigation and user menu",
		content:
			"Header navigation component with fixed positioning, responsive menu, user dropdown, and scroll behavior.",
		type: "component",
		category: "navigation",
		keywords: ["header", "navigation", "fixed", "responsive", "menu", "user", "dropdown", "scroll"],
		tags: ["header", "navigation", "responsive", "fixed"],
		nav: {
			unitId: "navigation",
			lessonId: "header-navigation",
			path: "#/demo/unit/navigation/lesson/header-navigation"
		},
		weight: 0.9
	},
	{
		id: "footer-content",
		title: "Footer Content",
		description: "Site footer with links, social media, and contact information",
		content:
			"Footer component with organized content sections, social media links, and responsive layout for site navigation.",
		type: "component",
		category: "layout",
		keywords: ["footer", "links", "social", "media", "contact", "responsive", "navigation"],
		tags: ["footer", "layout", "social", "responsive"],
		nav: {
			unitId: "layout",
			lessonId: "footer-content",
			path: "#/demo/unit/layout/lesson/footer-content"
		},
		weight: 0.7
	},
	{
		id: "grid-system",
		title: "Grid System",
		description: "Flexible CSS Grid layout system with breakpoints",
		content:
			"Grid system component with responsive breakpoints, flexible sizing, and gap management for layout design.",
		type: "component",
		category: "layout",
		keywords: ["grid", "system", "css", "responsive", "breakpoints", "flexible", "sizing", "gap"],
		tags: ["grid", "layout", "responsive", "css"],
		nav: {
			unitId: "layout",
			lessonId: "grid-system",
			path: "#/demo/unit/layout/lesson/grid-system"
		},
		weight: 0.8
	},
	{
		id: "theme-switcher",
		title: "Theme Switcher",
		description: "Dark/light theme toggle with system preference detection",
		content:
			"Theme switcher component with dark/light mode toggle, system preference detection, and smooth transitions.",
		type: "component",
		category: "ui-components",
		keywords: [
			"theme",
			"switcher",
			"dark",
			"light",
			"toggle",
			"system",
			"preference",
			"transitions"
		],
		tags: ["theme", "dark-mode", "toggle", "system-preference"],
		nav: {
			unitId: "ui-components",
			lessonId: "theme-switcher",
			path: "#/demo/unit/ui-components/lesson/theme-switcher"
		},
		weight: 0.8
	},
	{
		id: "language-selector",
		title: "Language Selector",
		description: "Internationalization language selection dropdown",
		content:
			"Language selector for internationalization with flag icons, language names, and locale switching.",
		type: "component",
		category: "ui-components",
		keywords: [
			"language",
			"selector",
			"i18n",
			"internationalization",
			"flags",
			"locale",
			"switching"
		],
		tags: ["i18n", "language", "selector", "locale"],
		nav: {
			unitId: "ui-components",
			lessonId: "language-selector",
			path: "#/demo/unit/ui-components/lesson/language-selector"
		},
		weight: 0.7
	},
	{
		id: "pagination-controls",
		title: "Pagination Controls",
		description: "Page navigation with numbered pages and jump controls",
		content:
			"Pagination component with numbered pages, previous/next controls, and direct page jumping for large datasets.",
		type: "component",
		category: "navigation",
		keywords: ["pagination", "controls", "pages", "navigation", "jump", "datasets"],
		tags: ["pagination", "navigation", "controls"],
		nav: {
			unitId: "navigation",
			lessonId: "pagination-controls",
			path: "#/demo/unit/navigation/lesson/pagination-controls"
		},
		weight: 0.8
	},
	{
		id: "skeleton-loader",
		title: "Skeleton Loader",
		description: "Placeholder loading animation for content areas",
		content:
			"Skeleton loader component providing placeholder animations while content loads, improving perceived performance.",
		type: "component",
		category: "feedback",
		keywords: ["skeleton", "loader", "placeholder", "animation", "loading", "performance"],
		tags: ["loading", "skeleton", "animation", "placeholder"],
		nav: {
			unitId: "feedback",
			lessonId: "skeleton-loader",
			path: "#/demo/unit/feedback/lesson/skeleton-loader"
		},
		weight: 0.8
	},
	{
		id: "error-boundary",
		title: "Error Boundary",
		description: "Error handling component with fallback UI and reporting",
		content:
			"Error boundary component for graceful error handling with fallback UI and optional error reporting.",
		type: "component",
		category: "error-handling",
		keywords: ["error", "boundary", "handling", "fallback", "ui", "reporting"],
		tags: ["error", "boundary", "fallback", "handling"],
		nav: {
			unitId: "error-handling",
			lessonId: "error-boundary",
			path: "#/demo/unit/error-handling/lesson/error-boundary"
		},
		weight: 0.9
	},
	{
		id: "virtual-scroll",
		title: "Virtual Scroll",
		description: "Performance-optimized virtual scrolling for large lists",
		content:
			"Virtual scrolling component for handling large datasets efficiently with viewport-based rendering.",
		type: "component",
		category: "performance",
		keywords: ["virtual", "scroll", "performance", "large", "lists", "viewport", "rendering"],
		tags: ["performance", "virtual", "scroll", "optimization"],
		nav: {
			unitId: "performance",
			lessonId: "virtual-scroll",
			path: "#/demo/unit/performance/lesson/virtual-scroll"
		},
		weight: 0.9
	},
	{
		id: "drag-drop-list",
		title: "Drag & Drop List",
		description: "Sortable list with drag and drop functionality",
		content:
			"Drag and drop list component with sortable items, visual feedback, and keyboard accessibility support.",
		type: "component",
		category: "interactive",
		keywords: ["drag", "drop", "list", "sortable", "feedback", "keyboard", "accessibility"],
		tags: ["drag-drop", "sortable", "interactive", "accessible"],
		nav: {
			unitId: "interactive",
			lessonId: "drag-drop-list",
			path: "#/demo/unit/interactive/lesson/drag-drop-list"
		},
		weight: 0.9
	},

	// Lesson items (45 items)
	{
		id: "intro-sveltekit",
		title: "Introduction to SvelteKit",
		description: "Getting started with SvelteKit framework and its core concepts",
		content:
			"Learn the fundamentals of SvelteKit, including file-based routing, server-side rendering, and the component-based architecture that makes modern web development efficient.",
		type: "lesson",
		category: "framework-basics",
		keywords: ["sveltekit", "introduction", "framework", "routing", "ssr", "components"],
		tags: ["beginner", "framework", "getting-started"],
		nav: {
			unitId: "framework-basics",
			lessonId: "intro-sveltekit",
			path: "#/demo/unit/framework-basics/lesson/intro-sveltekit"
		},
		weight: 1.0
	},
	{
		id: "svelte-reactivity",
		title: "Svelte Reactivity System",
		description: "Understanding Svelte's reactive declarations and state management",
		content:
			"Deep dive into Svelte's reactivity system, including reactive statements, derived values, and the new runes syntax in Svelte 5.",
		type: "lesson",
		category: "advanced-concepts",
		keywords: ["svelte", "reactivity", "state", "management", "runes", "derived"],
		tags: ["intermediate", "reactivity", "state"],
		nav: {
			unitId: "advanced-concepts",
			lessonId: "svelte-reactivity",
			path: "#/demo/unit/advanced-concepts/lesson/svelte-reactivity"
		},
		weight: 0.9
	},
	{
		id: "component-communication",
		title: "Component Communication Patterns",
		description: "Props, events, and stores for component interaction",
		content:
			"Learn various patterns for component communication including props, custom events, context API, and Svelte stores for state sharing.",
		type: "lesson",
		category: "component-patterns",
		keywords: ["components", "communication", "props", "events", "stores", "context"],
		tags: ["intermediate", "components", "patterns"],
		nav: {
			unitId: "component-patterns",
			lessonId: "component-communication",
			path: "#/demo/unit/component-patterns/lesson/component-communication"
		},
		weight: 0.9
	},
	{
		id: "sveltekit-routing",
		title: "SvelteKit Routing System",
		description: "File-based routing, dynamic routes, and route parameters",
		content:
			"Master SvelteKit's file-based routing system including dynamic routes, optional parameters, rest parameters, and route matching.",
		type: "lesson",
		category: "routing",
		keywords: ["sveltekit", "routing", "dynamic", "parameters", "file-based"],
		tags: ["intermediate", "routing", "navigation"],
		nav: {
			unitId: "routing",
			lessonId: "sveltekit-routing",
			path: "#/demo/unit/routing/lesson/sveltekit-routing"
		},
		weight: 0.9
	},
	{
		id: "data-loading",
		title: "Data Loading and API Integration",
		description: "Loading data with load functions and API routes",
		content:
			"Learn how to load data efficiently using SvelteKit's load functions, API routes, and form actions for full-stack applications.",
		type: "lesson",
		category: "data-handling",
		keywords: ["data", "loading", "api", "load", "functions", "routes", "forms"],
		tags: ["intermediate", "data", "api"],
		nav: {
			unitId: "data-handling",
			lessonId: "data-loading",
			path: "#/demo/unit/data-handling/lesson/data-loading"
		},
		weight: 1.0
	},
	{
		id: "form-handling",
		title: "Form Handling and Validation",
		description: "Progressive enhancement and form validation strategies",
		content:
			"Implement robust form handling with progressive enhancement, server-side validation, and error management in SvelteKit.",
		type: "lesson",
		category: "forms",
		keywords: ["forms", "validation", "progressive", "enhancement", "errors"],
		tags: ["intermediate", "forms", "validation"],
		nav: {
			unitId: "forms",
			lessonId: "form-handling",
			path: "#/demo/unit/forms/lesson/form-handling"
		},
		weight: 0.9
	},
	{
		id: "authentication-auth",
		title: "Authentication and Authorization",
		description: "Implementing user authentication and access control",
		content:
			"Build secure authentication systems with session management, JWT tokens, and role-based authorization in SvelteKit applications.",
		type: "lesson",
		category: "security",
		keywords: ["authentication", "authorization", "security", "jwt", "sessions", "roles"],
		tags: ["advanced", "security", "authentication"],
		nav: {
			unitId: "security",
			lessonId: "authentication-auth",
			path: "#/demo/unit/security/lesson/authentication-auth"
		},
		weight: 1.0
	},
	{
		id: "performance-optimization",
		title: "Performance Optimization Techniques",
		description: "Code splitting, lazy loading, and performance monitoring",
		content:
			"Optimize your SvelteKit applications with code splitting, lazy loading, image optimization, and performance monitoring strategies.",
		type: "lesson",
		category: "performance",
		keywords: ["performance", "optimization", "code-splitting", "lazy-loading", "monitoring"],
		tags: ["advanced", "performance", "optimization"],
		nav: {
			unitId: "performance",
			lessonId: "performance-optimization",
			path: "#/demo/unit/performance/lesson/performance-optimization"
		},
		weight: 0.9
	},
	{
		id: "testing-strategies",
		title: "Testing Strategies and Best Practices",
		description: "Unit testing, integration testing, and E2E testing approaches",
		content:
			"Comprehensive testing strategies including unit tests with Vitest, component testing, and end-to-end testing with Playwright.",
		type: "lesson",
		category: "testing",
		keywords: ["testing", "unit", "integration", "e2e", "vitest", "playwright"],
		tags: ["intermediate", "testing", "quality"],
		nav: {
			unitId: "testing",
			lessonId: "testing-strategies",
			path: "#/demo/unit/testing/lesson/testing-strategies"
		},
		weight: 0.9
	},
	{
		id: "deployment-strategies",
		title: "Deployment and Production Strategies",
		description: "Deploying SvelteKit apps to various platforms and environments",
		content:
			"Learn deployment strategies for SvelteKit applications including static hosting, serverless functions, and containerized deployments.",
		type: "lesson",
		category: "deployment",
		keywords: ["deployment", "production", "hosting", "serverless", "containers"],
		tags: ["advanced", "deployment", "devops"],
		nav: {
			unitId: "deployment",
			lessonId: "deployment-strategies",
			path: "#/demo/unit/deployment/lesson/deployment-strategies"
		},
		weight: 0.8
	},
	{
		id: "accessibility-fundamentals",
		title: "Web Accessibility Fundamentals",
		description: "Building accessible web applications with ARIA and best practices",
		content:
			"Master web accessibility principles including ARIA attributes, keyboard navigation, screen reader support, and inclusive design patterns.",
		type: "lesson",
		category: "accessibility",
		keywords: ["accessibility", "aria", "keyboard", "screen-reader", "inclusive", "wcag"],
		tags: ["intermediate", "accessibility", "inclusive"],
		nav: {
			unitId: "accessibility",
			lessonId: "accessibility-fundamentals",
			path: "#/demo/unit/accessibility/lesson/accessibility-fundamentals"
		},
		weight: 1.0
	},
	{
		id: "css-architecture",
		title: "CSS Architecture and Styling Strategies",
		description: "Modern CSS approaches including CSS-in-JS and utility frameworks",
		content:
			"Explore modern CSS architecture patterns including CSS modules, styled components, Tailwind CSS, and component-scoped styling.",
		type: "lesson",
		category: "styling",
		keywords: ["css", "architecture", "styling", "tailwind", "modules", "components"],
		tags: ["intermediate", "css", "styling"],
		nav: {
			unitId: "styling",
			lessonId: "css-architecture",
			path: "#/demo/unit/styling/lesson/css-architecture"
		},
		weight: 0.8
	},
	{
		id: "responsive-design",
		title: "Responsive Design Principles",
		description: "Mobile-first design and responsive layout techniques",
		content:
			"Learn responsive design principles including mobile-first approach, CSS Grid, Flexbox, and media queries for all device sizes.",
		type: "lesson",
		category: "design",
		keywords: ["responsive", "design", "mobile-first", "grid", "flexbox", "media-queries"],
		tags: ["beginner", "design", "responsive"],
		nav: {
			unitId: "design",
			lessonId: "responsive-design",
			path: "#/demo/unit/design/lesson/responsive-design"
		},
		weight: 0.9
	},
	{
		id: "progressive-enhancement",
		title: "Progressive Enhancement Strategies",
		description: "Building resilient web applications with progressive enhancement",
		content:
			"Implement progressive enhancement to ensure your applications work across all devices and network conditions with graceful degradation.",
		type: "lesson",
		category: "web-standards",
		keywords: ["progressive", "enhancement", "resilient", "graceful", "degradation"],
		tags: ["intermediate", "web-standards", "resilience"],
		nav: {
			unitId: "web-standards",
			lessonId: "progressive-enhancement",
			path: "#/demo/unit/web-standards/lesson/progressive-enhancement"
		},
		weight: 0.8
	},
	{
		id: "web-apis",
		title: "Modern Web APIs and Browser Features",
		description: "Leveraging browser APIs for enhanced user experiences",
		content:
			"Explore modern web APIs including Service Workers, Web Workers, IndexedDB, and emerging browser features for rich applications.",
		type: "lesson",
		category: "web-apis",
		keywords: ["web-apis", "service-workers", "indexeddb", "browser", "features"],
		tags: ["advanced", "apis", "browser"],
		nav: {
			unitId: "web-apis",
			lessonId: "web-apis",
			path: "#/demo/unit/web-apis/lesson/web-apis"
		},
		weight: 0.8
	},
	{
		id: "state-management",
		title: "Advanced State Management",
		description: "Complex state management patterns and solutions",
		content:
			"Master advanced state management techniques including global stores, state machines, and reactive programming patterns.",
		type: "lesson",
		category: "state-management",
		keywords: ["state", "management", "stores", "machines", "reactive", "programming"],
		tags: ["advanced", "state", "patterns"],
		nav: {
			unitId: "state-management",
			lessonId: "state-management",
			path: "#/demo/unit/state-management/lesson/state-management"
		},
		weight: 0.9
	},
	{
		id: "typescript-integration",
		title: "TypeScript Integration and Best Practices",
		description: "Using TypeScript effectively in SvelteKit projects",
		content:
			"Learn TypeScript best practices for SvelteKit including type definitions, generic components, and advanced typing patterns.",
		type: "lesson",
		category: "typescript",
		keywords: ["typescript", "types", "definitions", "generics", "patterns"],
		tags: ["intermediate", "typescript", "types"],
		nav: {
			unitId: "typescript",
			lessonId: "typescript-integration",
			path: "#/demo/unit/typescript/lesson/typescript-integration"
		},
		weight: 0.9
	},
	{
		id: "error-handling-patterns",
		title: "Error Handling and Recovery Patterns",
		description: "Robust error handling strategies for production applications",
		content:
			"Implement comprehensive error handling including error boundaries, graceful fallbacks, and user-friendly error messaging.",
		type: "lesson",
		category: "error-handling",
		keywords: ["error", "handling", "recovery", "boundaries", "fallbacks", "messaging"],
		tags: ["intermediate", "errors", "resilience"],
		nav: {
			unitId: "error-handling",
			lessonId: "error-handling-patterns",
			path: "#/demo/unit/error-handling/lesson/error-handling-patterns"
		},
		weight: 0.8
	},
	{
		id: "security-best-practices",
		title: "Web Security Best Practices",
		description: "Securing web applications against common vulnerabilities",
		content:
			"Learn essential web security practices including XSS prevention, CSRF protection, content security policies, and secure authentication.",
		type: "lesson",
		category: "security",
		keywords: ["security", "xss", "csrf", "csp", "authentication", "vulnerabilities"],
		tags: ["advanced", "security", "best-practices"],
		nav: {
			unitId: "security",
			lessonId: "security-best-practices",
			path: "#/demo/unit/security/lesson/security-best-practices"
		},
		weight: 1.0
	},
	{
		id: "internationalization-i18n",
		title: "Internationalization and Localization",
		description: "Building multilingual applications with i18n support",
		content:
			"Implement internationalization including translation management, locale detection, date/number formatting, and RTL support.",
		type: "lesson",
		category: "i18n",
		keywords: ["i18n", "internationalization", "localization", "translation", "locale", "rtl"],
		tags: ["intermediate", "i18n", "localization"],
		nav: {
			unitId: "i18n",
			lessonId: "internationalization-i18n",
			path: "#/demo/unit/i18n/lesson/internationalization-i18n"
		},
		weight: 0.8
	},
	{
		id: "seo-optimization",
		title: "SEO Optimization Techniques",
		description: "Search engine optimization for SvelteKit applications",
		content:
			"Optimize your SvelteKit applications for search engines including meta tags, structured data, sitemaps, and performance metrics.",
		type: "lesson",
		category: "seo",
		keywords: ["seo", "optimization", "meta-tags", "structured-data", "sitemaps", "performance"],
		tags: ["intermediate", "seo", "optimization"],
		nav: {
			unitId: "seo",
			lessonId: "seo-optimization",
			path: "#/demo/unit/seo/lesson/seo-optimization"
		},
		weight: 0.8
	},
	{
		id: "pwa-development",
		title: "Progressive Web App Development",
		description: "Building PWAs with offline functionality and app-like experiences",
		content:
			"Create Progressive Web Apps with service workers, offline functionality, push notifications, and installable experiences.",
		type: "lesson",
		category: "pwa",
		keywords: ["pwa", "progressive", "offline", "service-workers", "notifications", "installable"],
		tags: ["advanced", "pwa", "offline"],
		nav: {
			unitId: "pwa",
			lessonId: "pwa-development",
			path: "#/demo/unit/pwa/lesson/pwa-development"
		},
		weight: 0.9
	},
	{
		id: "animation-transitions",
		title: "Animations and Transitions",
		description: "Creating smooth animations and transitions for better UX",
		content:
			"Master CSS and JavaScript animations including Svelte transitions, spring animations, and performance-optimized motion design.",
		type: "lesson",
		category: "animations",
		keywords: ["animations", "transitions", "motion", "spring", "performance", "ux"],
		tags: ["intermediate", "animations", "ux"],
		nav: {
			unitId: "animations",
			lessonId: "animation-transitions",
			path: "#/demo/unit/animations/lesson/animation-transitions"
		},
		weight: 0.8
	},
	{
		id: "microinteractions",
		title: "Microinteractions and User Feedback",
		description: "Designing meaningful microinteractions for enhanced user experience",
		content:
			"Design and implement microinteractions including hover effects, loading states, and feedback mechanisms that delight users.",
		type: "lesson",
		category: "ux-design",
		keywords: ["microinteractions", "feedback", "hover", "loading", "ux", "design"],
		tags: ["intermediate", "ux", "interactions"],
		nav: {
			unitId: "ux-design",
			lessonId: "microinteractions",
			path: "#/demo/unit/ux-design/lesson/microinteractions"
		},
		weight: 0.7
	},
	{
		id: "design-systems",
		title: "Building Design Systems",
		description: "Creating consistent design systems and component libraries",
		content:
			"Build scalable design systems including component libraries, design tokens, documentation, and style guides for team collaboration.",
		type: "lesson",
		category: "design-systems",
		keywords: ["design", "systems", "components", "tokens", "documentation", "style-guides"],
		tags: ["advanced", "design", "systems"],
		nav: {
			unitId: "design-systems",
			lessonId: "design-systems",
			path: "#/demo/unit/design-systems/lesson/design-systems"
		},
		weight: 0.9
	},
	{
		id: "api-design",
		title: "RESTful API Design Principles",
		description: "Designing and implementing robust RESTful APIs",
		content:
			"Learn RESTful API design principles including resource modeling, HTTP methods, status codes, versioning, and documentation.",
		type: "lesson",
		category: "api-design",
		keywords: ["api", "rest", "design", "http", "resources", "versioning", "documentation"],
		tags: ["intermediate", "api", "backend"],
		nav: {
			unitId: "api-design",
			lessonId: "api-design",
			path: "#/demo/unit/api-design/lesson/api-design"
		},
		weight: 0.9
	},
	{
		id: "graphql-integration",
		title: "GraphQL Integration and Best Practices",
		description: "Implementing GraphQL APIs and client-side integration",
		content:
			"Master GraphQL including schema design, resolvers, client-side querying, caching strategies, and real-time subscriptions.",
		type: "lesson",
		category: "graphql",
		keywords: ["graphql", "schema", "resolvers", "queries", "caching", "subscriptions"],
		tags: ["advanced", "graphql", "api"],
		nav: {
			unitId: "graphql",
			lessonId: "graphql-integration",
			path: "#/demo/unit/graphql/lesson/graphql-integration"
		},
		weight: 0.8
	},
	{
		id: "real-time-features",
		title: "Real-time Features with WebSockets",
		description: "Building real-time applications with WebSocket connections",
		content:
			"Implement real-time features using WebSockets including chat systems, live updates, and collaborative editing experiences.",
		type: "lesson",
		category: "real-time",
		keywords: ["real-time", "websockets", "chat", "live", "updates", "collaborative"],
		tags: ["advanced", "real-time", "websockets"],
		nav: {
			unitId: "real-time",
			lessonId: "real-time-features",
			path: "#/demo/unit/real-time/lesson/real-time-features"
		},
		weight: 0.9
	},
	{
		id: "database-integration",
		title: "Database Integration Patterns",
		description: "Connecting to databases and managing data persistence",
		content:
			"Learn database integration patterns including ORM usage, query optimization, migrations, and connection pooling strategies.",
		type: "lesson",
		category: "database",
		keywords: ["database", "orm", "queries", "migrations", "connection", "pooling"],
		tags: ["intermediate", "database", "backend"],
		nav: {
			unitId: "database",
			lessonId: "database-integration",
			path: "#/demo/unit/database/lesson/database-integration"
		},
		weight: 0.9
	},
	{
		id: "caching-strategies",
		title: "Caching Strategies and Performance",
		description: "Implementing effective caching for improved performance",
		content:
			"Master caching strategies including browser caching, CDN usage, service worker caching, and server-side caching patterns.",
		type: "lesson",
		category: "performance",
		keywords: ["caching", "performance", "cdn", "service-worker", "server-side"],
		tags: ["advanced", "performance", "caching"],
		nav: {
			unitId: "performance",
			lessonId: "caching-strategies",
			path: "#/demo/unit/performance/lesson/caching-strategies"
		},
		weight: 0.8
	},
	{
		id: "monitoring-observability",
		title: "Application Monitoring and Observability",
		description: "Implementing monitoring, logging, and observability practices",
		content:
			"Set up comprehensive monitoring including error tracking, performance metrics, logging, and alerting for production applications.",
		type: "lesson",
		category: "monitoring",
		keywords: ["monitoring", "observability", "logging", "metrics", "alerting", "production"],
		tags: ["advanced", "monitoring", "devops"],
		nav: {
			unitId: "monitoring",
			lessonId: "monitoring-observability",
			path: "#/demo/unit/monitoring/lesson/monitoring-observability"
		},
		weight: 0.8
	},
	{
		id: "ci-cd-pipelines",
		title: "CI/CD Pipeline Setup and Best Practices",
		description: "Setting up continuous integration and deployment workflows",
		content:
			"Build robust CI/CD pipelines including automated testing, code quality checks, security scanning, and deployment automation.",
		type: "lesson",
		category: "devops",
		keywords: ["ci-cd", "pipelines", "automation", "testing", "quality", "security", "deployment"],
		tags: ["advanced", "devops", "automation"],
		nav: {
			unitId: "devops",
			lessonId: "ci-cd-pipelines",
			path: "#/demo/unit/devops/lesson/ci-cd-pipelines"
		},
		weight: 0.8
	},
	{
		id: "cloud-deployment",
		title: "Cloud Deployment and Scaling",
		description: "Deploying applications to cloud platforms with auto-scaling",
		content:
			"Deploy and scale applications on cloud platforms including containerization, orchestration, load balancing, and auto-scaling.",
		type: "lesson",
		category: "cloud",
		keywords: ["cloud", "deployment", "scaling", "containers", "orchestration", "load-balancing"],
		tags: ["advanced", "cloud", "scaling"],
		nav: {
			unitId: "cloud",
			lessonId: "cloud-deployment",
			path: "#/demo/unit/cloud/lesson/cloud-deployment"
		},
		weight: 0.8
	},
	{
		id: "serverless-architecture",
		title: "Serverless Architecture Patterns",
		description: "Building applications with serverless functions and services",
		content:
			"Explore serverless architecture including function-as-a-service, event-driven design, and serverless database solutions.",
		type: "lesson",
		category: "serverless",
		keywords: ["serverless", "functions", "event-driven", "faas", "architecture"],
		tags: ["advanced", "serverless", "architecture"],
		nav: {
			unitId: "serverless",
			lessonId: "serverless-architecture",
			path: "#/demo/unit/serverless/lesson/serverless-architecture"
		},
		weight: 0.8
	},
	{
		id: "edge-computing",
		title: "Edge Computing and CDN Strategies",
		description: "Leveraging edge computing for improved performance and user experience",
		content:
			"Implement edge computing strategies including edge functions, CDN optimization, and geographic content distribution.",
		type: "lesson",
		category: "edge-computing",
		keywords: ["edge", "computing", "cdn", "performance", "geographic", "distribution"],
		tags: ["advanced", "edge", "performance"],
		nav: {
			unitId: "edge-computing",
			lessonId: "edge-computing",
			path: "#/demo/unit/edge-computing/lesson/edge-computing"
		},
		weight: 0.7
	},
	{
		id: "web-performance",
		title: "Web Performance Optimization Deep Dive",
		description: "Advanced techniques for optimizing web application performance",
		content:
			"Master advanced performance optimization including Core Web Vitals, resource loading strategies, and performance budgets.",
		type: "lesson",
		category: "performance",
		keywords: ["performance", "optimization", "core-web-vitals", "loading", "budgets"],
		tags: ["advanced", "performance", "optimization"],
		nav: {
			unitId: "performance",
			lessonId: "web-performance",
			path: "#/demo/unit/performance/lesson/web-performance"
		},
		weight: 0.9
	},
	{
		id: "accessibility-testing",
		title: "Accessibility Testing and Auditing",
		description: "Comprehensive testing strategies for web accessibility compliance",
		content:
			"Learn accessibility testing techniques including automated tools, manual testing, screen reader testing, and WCAG compliance.",
		type: "lesson",
		category: "accessibility",
		keywords: ["accessibility", "testing", "auditing", "wcag", "compliance", "screen-reader"],
		tags: ["intermediate", "accessibility", "testing"],
		nav: {
			unitId: "accessibility",
			lessonId: "accessibility-testing",
			path: "#/demo/unit/accessibility/lesson/accessibility-testing"
		},
		weight: 0.8
	},
	{
		id: "user-research",
		title: "User Research and Usability Testing",
		description: "Conducting user research to inform design and development decisions",
		content:
			"Learn user research methodologies including usability testing, user interviews, A/B testing, and data-driven design decisions.",
		type: "lesson",
		category: "user-research",
		keywords: ["user", "research", "usability", "testing", "interviews", "ab-testing"],
		tags: ["intermediate", "research", "ux"],
		nav: {
			unitId: "user-research",
			lessonId: "user-research",
			path: "#/demo/unit/user-research/lesson/user-research"
		},
		weight: 0.7
	},
	{
		id: "data-visualization",
		title: "Data Visualization Techniques",
		description: "Creating effective data visualizations for web applications",
		content:
			"Master data visualization including chart selection, interactive visualizations, accessibility in data display, and storytelling with data.",
		type: "lesson",
		category: "data-viz",
		keywords: ["data", "visualization", "charts", "interactive", "storytelling", "accessibility"],
		tags: ["intermediate", "data", "visualization"],
		nav: {
			unitId: "data-viz",
			lessonId: "data-visualization",
			path: "#/demo/unit/data-viz/lesson/data-visualization"
		},
		weight: 0.8
	},
	{
		id: "machine-learning-web",
		title: "Machine Learning in Web Applications",
		description: "Integrating machine learning models into web applications",
		content:
			"Learn to integrate machine learning including TensorFlow.js, model deployment, real-time inference, and privacy-preserving ML.",
		type: "lesson",
		category: "machine-learning",
		keywords: ["machine-learning", "tensorflow", "models", "inference", "privacy"],
		tags: ["advanced", "ml", "ai"],
		nav: {
			unitId: "machine-learning",
			lessonId: "machine-learning-web",
			path: "#/demo/unit/machine-learning/lesson/machine-learning-web"
		},
		weight: 0.7
	},
	{
		id: "blockchain-integration",
		title: "Blockchain and Web3 Integration",
		description: "Building decentralized applications with blockchain technology",
		content:
			"Explore blockchain integration including wallet connections, smart contract interaction, and decentralized application architecture.",
		type: "lesson",
		category: "blockchain",
		keywords: ["blockchain", "web3", "decentralized", "smart-contracts", "wallet"],
		tags: ["advanced", "blockchain", "web3"],
		nav: {
			unitId: "blockchain",
			lessonId: "blockchain-integration",
			path: "#/demo/unit/blockchain/lesson/blockchain-integration"
		},
		weight: 0.6
	},
	{
		id: "mobile-development",
		title: "Mobile-First Development Strategies",
		description: "Building responsive applications with mobile-first approach",
		content:
			"Master mobile-first development including touch interactions, responsive images, mobile performance, and native app integration.",
		type: "lesson",
		category: "mobile",
		keywords: ["mobile", "responsive", "touch", "performance", "native", "integration"],
		tags: ["intermediate", "mobile", "responsive"],
		nav: {
			unitId: "mobile",
			lessonId: "mobile-development",
			path: "#/demo/unit/mobile/lesson/mobile-development"
		},
		weight: 0.9
	},
	{
		id: "cross-platform",
		title: "Cross-Platform Development with Web Technologies",
		description: "Building applications that work across web, mobile, and desktop",
		content:
			"Learn cross-platform development using web technologies including Electron, Capacitor, and Progressive Web Apps for multiple platforms.",
		type: "lesson",
		category: "cross-platform",
		keywords: ["cross-platform", "electron", "capacitor", "pwa", "desktop", "mobile"],
		tags: ["advanced", "cross-platform", "electron"],
		nav: {
			unitId: "cross-platform",
			lessonId: "cross-platform",
			path: "#/demo/unit/cross-platform/lesson/cross-platform"
		},
		weight: 0.8
	},
	{
		id: "version-control",
		title: "Advanced Git and Version Control",
		description: "Mastering Git workflows and collaboration strategies",
		content:
			"Advanced Git techniques including branching strategies, conflict resolution, code review processes, and team collaboration workflows.",
		type: "lesson",
		category: "git",
		keywords: ["git", "version-control", "branching", "collaboration", "workflows", "review"],
		tags: ["intermediate", "git", "collaboration"],
		nav: {
			unitId: "git",
			lessonId: "version-control",
			path: "#/demo/unit/git/lesson/version-control"
		},
		weight: 0.8
	},
	{
		id: "code-quality",
		title: "Code Quality and Maintainability",
		description: "Writing clean, maintainable, and scalable code",
		content:
			"Learn code quality principles including clean code practices, refactoring techniques, code reviews, and technical debt management.",
		type: "lesson",
		category: "code-quality",
		keywords: ["code", "quality", "maintainability", "clean", "refactoring", "debt"],
		tags: ["intermediate", "quality", "maintainability"],
		nav: {
			unitId: "code-quality",
			lessonId: "code-quality",
			path: "#/demo/unit/code-quality/lesson/code-quality"
		},
		weight: 0.9
	},

	// Code example items (25 items)
	{
		id: "reactive-todo-app",
		title: "Reactive Todo Application",
		description: "Complete todo app demonstrating Svelte reactivity and state management",
		content:
			"Full-featured todo application showcasing Svelte's reactivity system, local storage persistence, and component composition patterns.",
		type: "code",
		category: "complete-examples",
		keywords: ["todo", "reactive", "state", "management", "local-storage", "components"],
		tags: ["example", "reactive", "complete"],
		nav: {
			unitId: "complete-examples",
			lessonId: "reactive-todo-app",
			path: "#/demo/unit/complete-examples/lesson/reactive-todo-app"
		},
		weight: 1.0
	},
	{
		id: "authentication-flow",
		title: "Authentication Flow Implementation",
		description: "Complete authentication system with login, signup, and session management",
		content:
			"Comprehensive authentication implementation including JWT tokens, password hashing, session management, and route protection.",
		type: "code",
		category: "authentication",
		keywords: ["authentication", "jwt", "login", "signup", "session", "security"],
		tags: ["auth", "security", "backend"],
		nav: {
			unitId: "authentication",
			lessonId: "authentication-flow",
			path: "#/demo/unit/authentication/lesson/authentication-flow"
		},
		weight: 1.0
	},
	{
		id: "data-fetching-patterns",
		title: "Data Fetching Patterns",
		description: "Various data fetching approaches with error handling and loading states",
		content:
			"Multiple data fetching patterns including server-side rendering, client-side fetching, optimistic updates, and error boundaries.",
		type: "code",
		category: "data-handling",
		keywords: ["data", "fetching", "ssr", "client-side", "optimistic", "error-handling"],
		tags: ["data", "fetching", "patterns"],
		nav: {
			unitId: "data-handling",
			lessonId: "data-fetching-patterns",
			path: "#/demo/unit/data-handling/lesson/data-fetching-patterns"
		},
		weight: 0.9
	},
	{
		id: "form-validation-example",
		title: "Advanced Form Validation",
		description: "Complex form with real-time validation and custom validation rules",
		content:
			"Advanced form validation showcasing real-time validation, custom rules, field dependencies, and accessibility features.",
		type: "code",
		category: "forms",
		keywords: ["form", "validation", "real-time", "custom", "rules", "accessibility"],
		tags: ["forms", "validation", "accessibility"],
		nav: {
			unitId: "forms",
			lessonId: "form-validation-example",
			path: "#/demo/unit/forms/lesson/form-validation-example"
		},
		weight: 0.9
	},
	{
		id: "responsive-layout-grid",
		title: "Responsive CSS Grid Layout",
		description: "Flexible grid system with responsive breakpoints and dynamic content",
		content:
			"CSS Grid layout system with responsive breakpoints, dynamic content areas, and mobile-first design principles.",
		type: "code",
		category: "layout",
		keywords: ["css", "grid", "responsive", "breakpoints", "mobile-first", "layout"],
		tags: ["css", "grid", "responsive"],
		nav: {
			unitId: "layout",
			lessonId: "responsive-layout-grid",
			path: "#/demo/unit/layout/lesson/responsive-layout-grid"
		},
		weight: 0.8
	},
	{
		id: "api-integration-example",
		title: "REST API Integration",
		description: "Complete API integration with CRUD operations and error handling",
		content:
			"Full REST API integration demonstrating CRUD operations, error handling, loading states, and optimistic updates.",
		type: "code",
		category: "api-integration",
		keywords: ["api", "rest", "crud", "integration", "error-handling", "optimistic"],
		tags: ["api", "rest", "crud"],
		nav: {
			unitId: "api-integration",
			lessonId: "api-integration-example",
			path: "#/demo/unit/api-integration/lesson/api-integration-example"
		},
		weight: 0.9
	},
	{
		id: "real-time-chat",
		title: "Real-time Chat Application",
		description: "WebSocket-based chat with rooms, typing indicators, and message history",
		content:
			"Real-time chat application using WebSockets with chat rooms, typing indicators, message history, and user presence.",
		type: "code",
		category: "real-time",
		keywords: ["chat", "websocket", "real-time", "rooms", "typing", "presence"],
		tags: ["chat", "websocket", "real-time"],
		nav: {
			unitId: "real-time",
			lessonId: "real-time-chat",
			path: "#/demo/unit/real-time/lesson/real-time-chat"
		},
		weight: 1.0
	},
	{
		id: "image-upload-gallery",
		title: "Image Upload and Gallery",
		description: "Image upload with preview, compression, and gallery management",
		content:
			"Image upload system with drag-and-drop, preview generation, client-side compression, and gallery management features.",
		type: "code",
		category: "file-handling",
		keywords: ["image", "upload", "gallery", "compression", "drag-drop", "preview"],
		tags: ["upload", "images", "gallery"],
		nav: {
			unitId: "file-handling",
			lessonId: "image-upload-gallery",
			path: "#/demo/unit/file-handling/lesson/image-upload-gallery"
		},
		weight: 0.9
	},
	{
		id: "search-filter-pagination",
		title: "Search, Filter, and Pagination",
		description: "Complete data table with search, filtering, sorting, and pagination",
		content:
			"Comprehensive data table implementation with real-time search, multi-column filtering, sorting, and server-side pagination.",
		type: "code",
		category: "data-display",
		keywords: ["search", "filter", "pagination", "table", "sorting", "server-side"],
		tags: ["search", "table", "pagination"],
		nav: {
			unitId: "data-display",
			lessonId: "search-filter-pagination",
			path: "#/demo/unit/data-display/lesson/search-filter-pagination"
		},
		weight: 1.0
	},
	{
		id: "theme-switcher-implementation",
		title: "Theme Switcher Implementation",
		description: "Dark/light theme toggle with system preference detection",
		content:
			"Theme switching system with dark/light modes, system preference detection, smooth transitions, and persistent user choice.",
		type: "code",
		category: "theming",
		keywords: ["theme", "dark", "light", "system", "preference", "transitions"],
		tags: ["theme", "dark-mode", "toggle"],
		nav: {
			unitId: "theming",
			lessonId: "theme-switcher-implementation",
			path: "#/demo/unit/theming/lesson/theme-switcher-implementation"
		},
		weight: 0.8
	},
	{
		id: "animation-examples",
		title: "CSS and JavaScript Animations",
		description: "Various animation techniques including CSS transitions and JS animations",
		content:
			"Collection of animation examples including CSS transitions, keyframes, Svelte transitions, and JavaScript-driven animations.",
		type: "code",
		category: "animations",
		keywords: ["animation", "css", "javascript", "transitions", "keyframes", "svelte"],
		tags: ["animation", "css", "javascript"],
		nav: {
			unitId: "animations",
			lessonId: "animation-examples",
			path: "#/demo/unit/animations/lesson/animation-examples"
		},
		weight: 0.8
	},
	{
		id: "accessibility-examples",
		title: "Accessibility Implementation Examples",
		description: "ARIA patterns, keyboard navigation, and screen reader optimization",
		content:
			"Accessibility implementation showcasing ARIA patterns, keyboard navigation, focus management, and screen reader optimization.",
		type: "code",
		category: "accessibility",
		keywords: ["accessibility", "aria", "keyboard", "focus", "screen-reader", "wcag"],
		tags: ["accessibility", "aria", "keyboard"],
		nav: {
			unitId: "accessibility",
			lessonId: "accessibility-examples",
			path: "#/demo/unit/accessibility/lesson/accessibility-examples"
		},
		weight: 0.9
	},
	{
		id: "performance-optimization-examples",
		title: "Performance Optimization Examples",
		description: "Code splitting, lazy loading, and performance monitoring implementations",
		content:
			"Performance optimization techniques including code splitting, lazy loading, image optimization, and performance monitoring.",
		type: "code",
		category: "performance",
		keywords: ["performance", "optimization", "code-splitting", "lazy-loading", "monitoring"],
		tags: ["performance", "optimization", "lazy-loading"],
		nav: {
			unitId: "performance",
			lessonId: "performance-optimization-examples",
			path: "#/demo/unit/performance/lesson/performance-optimization-examples"
		},
		weight: 0.8
	},
	{
		id: "error-handling-examples",
		title: "Error Handling and Recovery",
		description: "Error boundaries, fallback UI, and graceful error recovery patterns",
		content:
			"Error handling patterns including error boundaries, fallback UI components, retry mechanisms, and user-friendly error messages.",
		type: "code",
		category: "error-handling",
		keywords: ["error", "handling", "boundary", "fallback", "retry", "recovery"],
		tags: ["error", "handling", "recovery"],
		nav: {
			unitId: "error-handling",
			lessonId: "error-handling-examples",
			path: "#/demo/unit/error-handling/lesson/error-handling-examples"
		},
		weight: 0.8
	},
	{
		id: "testing-examples",
		title: "Testing Implementation Examples",
		description: "Unit tests, component tests, and integration testing patterns",
		content:
			"Comprehensive testing examples including unit tests, component testing, integration tests, and end-to-end testing strategies.",
		type: "code",
		category: "testing",
		keywords: ["testing", "unit", "component", "integration", "e2e", "strategies"],
		tags: ["testing", "unit", "integration"],
		nav: {
			unitId: "testing",
			lessonId: "testing-examples",
			path: "#/demo/unit/testing/lesson/testing-examples"
		},
		weight: 0.8
	},
	{
		id: "state-management-examples",
		title: "State Management Patterns",
		description: "Various state management approaches including stores and context",
		content:
			"State management examples showcasing Svelte stores, context API, global state patterns, and reactive programming.",
		type: "code",
		category: "state-management",
		keywords: ["state", "management", "stores", "context", "global", "reactive"],
		tags: ["state", "stores", "context"],
		nav: {
			unitId: "state-management",
			lessonId: "state-management-examples",
			path: "#/demo/unit/state-management/lesson/state-management-examples"
		},
		weight: 0.9
	},
	{
		id: "routing-examples",
		title: "Advanced Routing Patterns",
		description: "Dynamic routing, nested routes, and route guards implementation",
		content:
			"Advanced routing examples including dynamic routes, nested routing, route guards, and programmatic navigation.",
		type: "code",
		category: "routing",
		keywords: ["routing", "dynamic", "nested", "guards", "navigation", "programmatic"],
		tags: ["routing", "navigation", "guards"],
		nav: {
			unitId: "routing",
			lessonId: "routing-examples",
			path: "#/demo/unit/routing/lesson/routing-examples"
		},
		weight: 0.8
	},
	{
		id: "component-patterns",
		title: "Advanced Component Patterns",
		description: "Reusable component patterns including composition and higher-order components",
		content:
			"Advanced component patterns including composition patterns, render props, higher-order components, and component communication.",
		type: "code",
		category: "component-patterns",
		keywords: ["components", "patterns", "composition", "higher-order", "communication"],
		tags: ["components", "patterns", "composition"],
		nav: {
			unitId: "component-patterns",
			lessonId: "component-patterns",
			path: "#/demo/unit/component-patterns/lesson/component-patterns"
		},
		weight: 0.9
	},
	{
		id: "custom-hooks-utilities",
		title: "Custom Utilities and Helpers",
		description: "Reusable utility functions and custom helper implementations",
		content:
			"Collection of custom utilities including data formatters, validation helpers, API utilities, and common helper functions.",
		type: "code",
		category: "utilities",
		keywords: ["utilities", "helpers", "formatters", "validation", "api", "functions"],
		tags: ["utilities", "helpers", "functions"],
		nav: {
			unitId: "utilities",
			lessonId: "custom-hooks-utilities",
			path: "#/demo/unit/utilities/lesson/custom-hooks-utilities"
		},
		weight: 0.7
	},
	{
		id: "progressive-enhancement-examples",
		title: "Progressive Enhancement Examples",
		description: "Building resilient applications with progressive enhancement",
		content:
			"Progressive enhancement examples showing graceful degradation, feature detection, and resilient application architecture.",
		type: "code",
		category: "progressive-enhancement",
		keywords: ["progressive", "enhancement", "degradation", "detection", "resilient"],
		tags: ["progressive", "enhancement", "resilient"],
		nav: {
			unitId: "progressive-enhancement",
			lessonId: "progressive-enhancement-examples",
			path: "#/demo/unit/progressive-enhancement/lesson/progressive-enhancement-examples"
		},
		weight: 0.7
	},
	{
		id: "internationalization-examples",
		title: "Internationalization Implementation",
		description: "i18n setup with translations, locale detection, and formatting",
		content:
			"Internationalization implementation with translation management, locale detection, date/number formatting, and RTL support.",
		type: "code",
		category: "i18n",
		keywords: ["i18n", "internationalization", "translations", "locale", "formatting", "rtl"],
		tags: ["i18n", "translations", "locale"],
		nav: {
			unitId: "i18n",
			lessonId: "internationalization-examples",
			path: "#/demo/unit/i18n/lesson/internationalization-examples"
		},
		weight: 0.7
	},
	{
		id: "pwa-implementation",
		title: "Progressive Web App Implementation",
		description: "Service worker setup, offline functionality, and installable PWA",
		content:
			"Complete PWA implementation with service workers, offline functionality, background sync, and app installation features.",
		type: "code",
		category: "pwa",
		keywords: ["pwa", "service-worker", "offline", "sync", "installation"],
		tags: ["pwa", "offline", "service-worker"],
		nav: {
			unitId: "pwa",
			lessonId: "pwa-implementation",
			path: "#/demo/unit/pwa/lesson/pwa-implementation"
		},
		weight: 0.8
	},
	{
		id: "data-visualization-charts",
		title: "Interactive Data Visualization",
		description: "Chart implementations with D3.js and custom visualization components",
		content:
			"Interactive data visualization examples using D3.js, custom chart components, and accessibility-focused data display.",
		type: "code",
		category: "data-visualization",
		keywords: ["data", "visualization", "d3", "charts", "interactive", "accessibility"],
		tags: ["data", "visualization", "charts"],
		nav: {
			unitId: "data-visualization",
			lessonId: "data-visualization-charts",
			path: "#/demo/unit/data-visualization/lesson/data-visualization-charts"
		},
		weight: 0.8
	},
	{
		id: "security-implementation",
		title: "Security Best Practices Implementation",
		description: "XSS prevention, CSRF protection, and secure authentication patterns",
		content:
			"Security implementation examples including XSS prevention, CSRF protection, secure headers, and authentication security.",
		type: "code",
		category: "security",
		keywords: ["security", "xss", "csrf", "authentication", "headers", "protection"],
		tags: ["security", "protection", "authentication"],
		nav: {
			unitId: "security",
			lessonId: "security-implementation",
			path: "#/demo/unit/security/lesson/security-implementation"
		},
		weight: 0.9
	},
	{
		id: "microinteractions-examples",
		title: "Microinteractions and Feedback",
		description: "Subtle animations and feedback mechanisms for enhanced UX",
		content:
			"Microinteraction examples including hover effects, loading animations, form feedback, and delightful user interactions.",
		type: "code",
		category: "microinteractions",
		keywords: ["microinteractions", "animations", "feedback", "hover", "loading", "ux"],
		tags: ["microinteractions", "animations", "ux"],
		nav: {
			unitId: "microinteractions",
			lessonId: "microinteractions-examples",
			path: "#/demo/unit/microinteractions/lesson/microinteractions-examples"
		},
		weight: 0.7
	},

	// Diagram items (15 items)
	{
		id: "sveltekit-architecture-diagram",
		title: "SvelteKit Architecture Overview",
		description: "Complete SvelteKit application architecture and data flow visualization",
		content:
			"Comprehensive diagram showing SvelteKit architecture including routing, data loading, server-side rendering, and component lifecycle.",
		type: "diagram",
		category: "architecture",
		keywords: ["sveltekit", "architecture", "routing", "ssr", "lifecycle", "data-flow"],
		tags: ["architecture", "sveltekit", "overview"],
		nav: {
			unitId: "architecture",
			lessonId: "sveltekit-architecture-diagram",
			path: "#/demo/unit/architecture/lesson/sveltekit-architecture-diagram"
		},
		weight: 1.0
	},
	{
		id: "component-lifecycle-diagram",
		title: "Svelte Component Lifecycle",
		description: "Visual representation of Svelte component lifecycle hooks and states",
		content:
			"Detailed lifecycle diagram showing component creation, mounting, updating, and destruction phases with hook timing.",
		type: "diagram",
		category: "components",
		keywords: ["component", "lifecycle", "hooks", "mounting", "updating", "destruction"],
		tags: ["component", "lifecycle", "hooks"],
		nav: {
			unitId: "components",
			lessonId: "component-lifecycle-diagram",
			path: "#/demo/unit/components/lesson/component-lifecycle-diagram"
		},
		weight: 0.9
	},
	{
		id: "reactivity-flow-diagram",
		title: "Svelte Reactivity System Flow",
		description: "Visualization of Svelte's reactivity system and state propagation",
		content:
			"Reactivity flow diagram illustrating how state changes propagate through components and trigger updates.",
		type: "diagram",
		category: "reactivity",
		keywords: ["reactivity", "state", "propagation", "updates", "flow", "system"],
		tags: ["reactivity", "state", "flow"],
		nav: {
			unitId: "reactivity",
			lessonId: "reactivity-flow-diagram",
			path: "#/demo/unit/reactivity/lesson/reactivity-flow-diagram"
		},
		weight: 0.9
	},
	{
		id: "data-loading-flow",
		title: "Data Loading Flow Diagram",
		description: "SvelteKit data loading patterns and server-client interaction flow",
		content:
			"Data loading flow showing server-side and client-side data fetching patterns in SvelteKit applications.",
		type: "diagram",
		category: "data-flow",
		keywords: ["data", "loading", "server", "client", "fetching", "flow"],
		tags: ["data", "loading", "flow"],
		nav: {
			unitId: "data-flow",
			lessonId: "data-loading-flow",
			path: "#/demo/unit/data-flow/lesson/data-loading-flow"
		},
		weight: 0.8
	},
	{
		id: "authentication-flow-diagram",
		title: "Authentication Flow Diagram",
		description: "User authentication and authorization process visualization",
		content:
			"Authentication flow diagram showing login, token management, route protection, and session handling processes.",
		type: "diagram",
		category: "authentication",
		keywords: ["authentication", "authorization", "login", "tokens", "session", "protection"],
		tags: ["authentication", "security", "flow"],
		nav: {
			unitId: "authentication",
			lessonId: "authentication-flow-diagram",
			path: "#/demo/unit/authentication/lesson/authentication-flow-diagram"
		},
		weight: 0.9
	},
	{
		id: "api-integration-diagram",
		title: "API Integration Architecture",
		description: "REST API integration patterns and error handling strategies",
		content:
			"API integration diagram showing request/response cycles, error handling, caching, and retry mechanisms.",
		type: "diagram",
		category: "api",
		keywords: ["api", "integration", "rest", "error-handling", "caching", "retry"],
		tags: ["api", "integration", "architecture"],
		nav: {
			unitId: "api",
			lessonId: "api-integration-diagram",
			path: "#/demo/unit/api/lesson/api-integration-diagram"
		},
		weight: 0.8
	},
	{
		id: "state-management-diagram",
		title: "State Management Patterns",
		description: "Various state management approaches and data flow patterns",
		content:
			"State management diagram comparing local state, stores, context, and global state management patterns.",
		type: "diagram",
		category: "state-management",
		keywords: ["state", "management", "stores", "context", "global", "patterns"],
		tags: ["state", "management", "patterns"],
		nav: {
			unitId: "state-management",
			lessonId: "state-management-diagram",
			path: "#/demo/unit/state-management/lesson/state-management-diagram"
		},
		weight: 0.8
	},
	{
		id: "routing-system-diagram",
		title: "SvelteKit Routing System",
		description: "File-based routing structure and route resolution process",
		content:
			"Routing system diagram showing file-based routing, dynamic routes, layout hierarchy, and route resolution.",
		type: "diagram",
		category: "routing",
		keywords: ["routing", "file-based", "dynamic", "layout", "hierarchy", "resolution"],
		tags: ["routing", "navigation", "system"],
		nav: {
			unitId: "routing",
			lessonId: "routing-system-diagram",
			path: "#/demo/unit/routing/lesson/routing-system-diagram"
		},
		weight: 0.8
	},
	{
		id: "deployment-pipeline-diagram",
		title: "Deployment Pipeline Architecture",
		description: "CI/CD pipeline and deployment strategy visualization",
		content:
			"Deployment pipeline diagram showing build process, testing stages, deployment strategies, and monitoring setup.",
		type: "diagram",
		category: "deployment",
		keywords: ["deployment", "pipeline", "ci-cd", "build", "testing", "monitoring"],
		tags: ["deployment", "pipeline", "devops"],
		nav: {
			unitId: "deployment",
			lessonId: "deployment-pipeline-diagram",
			path: "#/demo/unit/deployment/lesson/deployment-pipeline-diagram"
		},
		weight: 0.7
	},
	{
		id: "performance-optimization-diagram",
		title: "Performance Optimization Strategy",
		description: "Performance optimization techniques and measurement points",
		content:
			"Performance diagram showing optimization strategies, measurement points, and performance monitoring approaches.",
		type: "diagram",
		category: "performance",
		keywords: ["performance", "optimization", "measurement", "monitoring", "strategies"],
		tags: ["performance", "optimization", "monitoring"],
		nav: {
			unitId: "performance",
			lessonId: "performance-optimization-diagram",
			path: "#/demo/unit/performance/lesson/performance-optimization-diagram"
		},
		weight: 0.7
	},
	{
		id: "error-handling-diagram",
		title: "Error Handling Strategy",
		description: "Error boundary patterns and error recovery mechanisms",
		content:
			"Error handling diagram showing error boundaries, fallback mechanisms, error reporting, and recovery strategies.",
		type: "diagram",
		category: "error-handling",
		keywords: ["error", "handling", "boundary", "fallback", "reporting", "recovery"],
		tags: ["error", "handling", "strategy"],
		nav: {
			unitId: "error-handling",
			lessonId: "error-handling-diagram",
			path: "#/demo/unit/error-handling/lesson/error-handling-diagram"
		},
		weight: 0.7
	},
	{
		id: "security-architecture-diagram",
		title: "Security Architecture Overview",
		description: "Application security layers and protection mechanisms",
		content:
			"Security architecture diagram showing protection layers, authentication flow, authorization checks, and security headers.",
		type: "diagram",
		category: "security",
		keywords: [
			"security",
			"architecture",
			"protection",
			"authentication",
			"authorization",
			"headers"
		],
		tags: ["security", "architecture", "protection"],
		nav: {
			unitId: "security",
			lessonId: "security-architecture-diagram",
			path: "#/demo/unit/security/lesson/security-architecture-diagram"
		},
		weight: 0.8
	},
	{
		id: "testing-strategy-diagram",
		title: "Testing Strategy Overview",
		description: "Testing pyramid and comprehensive testing approach visualization",
		content:
			"Testing strategy diagram showing testing pyramid, unit tests, integration tests, and end-to-end testing approaches.",
		type: "diagram",
		category: "testing",
		keywords: ["testing", "strategy", "pyramid", "unit", "integration", "e2e"],
		tags: ["testing", "strategy", "pyramid"],
		nav: {
			unitId: "testing",
			lessonId: "testing-strategy-diagram",
			path: "#/demo/unit/testing/lesson/testing-strategy-diagram"
		},
		weight: 0.7
	},
	{
		id: "accessibility-compliance-diagram",
		title: "Accessibility Compliance Framework",
		description: "WCAG compliance levels and accessibility implementation strategy",
		content:
			"Accessibility diagram showing WCAG compliance levels, implementation strategies, and testing approaches for inclusive design.",
		type: "diagram",
		category: "accessibility",
		keywords: ["accessibility", "wcag", "compliance", "implementation", "testing", "inclusive"],
		tags: ["accessibility", "wcag", "compliance"],
		nav: {
			unitId: "accessibility",
			lessonId: "accessibility-compliance-diagram",
			path: "#/demo/unit/accessibility/lesson/accessibility-compliance-diagram"
		},
		weight: 0.7
	},
	{
		id: "microservices-architecture-diagram",
		title: "Microservices Architecture Pattern",
		description: "Microservices communication patterns and service organization",
		content:
			"Microservices architecture diagram showing service boundaries, communication patterns, data flow, and orchestration strategies.",
		type: "diagram",
		category: "architecture",
		keywords: ["microservices", "architecture", "communication", "boundaries", "orchestration"],
		tags: ["microservices", "architecture", "pattern"],
		nav: {
			unitId: "architecture",
			lessonId: "microservices-architecture-diagram",
			path: "#/demo/unit/architecture/lesson/microservices-architecture-diagram"
		},
		weight: 0.7
	},

	// Interactive items (15 items)
	{
		id: "interactive-component-playground",
		title: "Component Playground",
		description: "Interactive environment for testing and customizing components",
		content:
			"Interactive playground allowing real-time component testing, prop modification, and style customization with live preview.",
		type: "interactive",
		category: "development-tools",
		keywords: ["playground", "components", "testing", "props", "customization", "preview"],
		tags: ["playground", "components", "testing"],
		nav: {
			unitId: "development-tools",
			lessonId: "interactive-component-playground",
			path: "#/demo/unit/development-tools/lesson/interactive-component-playground"
		},
		weight: 1.0
	},
	{
		id: "code-sandbox-editor",
		title: "Code Sandbox Editor",
		description: "In-browser code editor with live preview and syntax highlighting",
		content:
			"Full-featured code editor with syntax highlighting, autocomplete, live preview, and shareable code snippets.",
		type: "interactive",
		category: "development-tools",
		keywords: ["editor", "code", "syntax", "highlighting", "preview", "snippets"],
		tags: ["editor", "code", "sandbox"],
		nav: {
			unitId: "development-tools",
			lessonId: "code-sandbox-editor",
			path: "#/demo/unit/development-tools/lesson/code-sandbox-editor"
		},
		weight: 0.9
	},
	{
		id: "responsive-design-tester",
		title: "Responsive Design Tester",
		description: "Tool for testing responsive designs across different screen sizes",
		content:
			"Interactive tool for testing responsive layouts with device presets, custom dimensions, and orientation switching.",
		type: "interactive",
		category: "design-tools",
		keywords: ["responsive", "design", "testing", "screen", "sizes", "devices"],
		tags: ["responsive", "testing", "design"],
		nav: {
			unitId: "design-tools",
			lessonId: "responsive-design-tester",
			path: "#/demo/unit/design-tools/lesson/responsive-design-tester"
		},
		weight: 0.8
	},
	{
		id: "accessibility-checker",
		title: "Accessibility Checker Tool",
		description: "Interactive tool for testing and improving web accessibility",
		content:
			"Accessibility testing tool with WCAG compliance checks, color contrast analysis, and keyboard navigation testing.",
		type: "interactive",
		category: "accessibility-tools",
		keywords: ["accessibility", "testing", "wcag", "contrast", "keyboard", "compliance"],
		tags: ["accessibility", "testing", "wcag"],
		nav: {
			unitId: "accessibility-tools",
			lessonId: "accessibility-checker",
			path: "#/demo/unit/accessibility-tools/lesson/accessibility-checker"
		},
		weight: 0.9
	},
	{
		id: "performance-analyzer",
		title: "Performance Analyzer",
		description: "Interactive performance monitoring and optimization tool",
		content:
			"Performance analysis tool with metrics visualization, bottleneck identification, and optimization recommendations.",
		type: "interactive",
		category: "performance-tools",
		keywords: ["performance", "analysis", "metrics", "bottlenecks", "optimization"],
		tags: ["performance", "analysis", "monitoring"],
		nav: {
			unitId: "performance-tools",
			lessonId: "performance-analyzer",
			path: "#/demo/unit/performance-tools/lesson/performance-analyzer"
		},
		weight: 0.8
	},
	{
		id: "color-palette-generator",
		title: "Color Palette Generator",
		description: "Interactive tool for creating and testing color schemes",
		content:
			"Color palette generator with accessibility checking, contrast ratios, and export options for design systems.",
		type: "interactive",
		category: "design-tools",
		keywords: ["color", "palette", "generator", "accessibility", "contrast", "design"],
		tags: ["color", "palette", "design"],
		nav: {
			unitId: "design-tools",
			lessonId: "color-palette-generator",
			path: "#/demo/unit/design-tools/lesson/color-palette-generator"
		},
		weight: 0.7
	},
	{
		id: "css-grid-generator",
		title: "CSS Grid Generator",
		description: "Visual CSS Grid layout builder with interactive controls",
		content:
			"Interactive CSS Grid generator with visual layout builder, responsive controls, and code export functionality.",
		type: "interactive",
		category: "development-tools",
		keywords: ["css", "grid", "generator", "layout", "visual", "builder"],
		tags: ["css", "grid", "generator"],
		nav: {
			unitId: "development-tools",
			lessonId: "css-grid-generator",
			path: "#/demo/unit/development-tools/lesson/css-grid-generator"
		},
		weight: 0.8
	},
	{
		id: "animation-timeline-editor",
		title: "Animation Timeline Editor",
		description: "Interactive tool for creating and editing CSS animations",
		content:
			"Animation timeline editor with keyframe management, easing controls, and real-time preview for CSS animations.",
		type: "interactive",
		category: "animation-tools",
		keywords: ["animation", "timeline", "editor", "keyframes", "easing", "css"],
		tags: ["animation", "timeline", "editor"],
		nav: {
			unitId: "animation-tools",
			lessonId: "animation-timeline-editor",
			path: "#/demo/unit/animation-tools/lesson/animation-timeline-editor"
		},
		weight: 0.7
	},
	{
		id: "api-testing-console",
		title: "API Testing Console",
		description: "Interactive API testing tool with request builder and response viewer",
		content:
			"API testing console with request builder, authentication options, response formatting, and request history.",
		type: "interactive",
		category: "development-tools",
		keywords: ["api", "testing", "console", "requests", "responses", "authentication"],
		tags: ["api", "testing", "console"],
		nav: {
			unitId: "development-tools",
			lessonId: "api-testing-console",
			path: "#/demo/unit/development-tools/lesson/api-testing-console"
		},
		weight: 0.8
	},
	{
		id: "form-builder-tool",
		title: "Dynamic Form Builder",
		description: "Interactive form builder with drag-and-drop field creation",
		content:
			"Form builder tool with drag-and-drop interface, field validation options, and form preview with code generation.",
		type: "interactive",
		category: "development-tools",
		keywords: ["form", "builder", "drag-drop", "validation", "preview", "generation"],
		tags: ["form", "builder", "generator"],
		nav: {
			unitId: "development-tools",
			lessonId: "form-builder-tool",
			path: "#/demo/unit/development-tools/lesson/form-builder-tool"
		},
		weight: 0.8
	},
	{
		id: "regex-pattern-tester",
		title: "Regular Expression Tester",
		description: "Interactive tool for testing and debugging regular expressions",
		content:
			"Regex testing tool with pattern visualization, match highlighting, test case management, and explanation generator.",
		type: "interactive",
		category: "development-tools",
		keywords: ["regex", "regular", "expression", "testing", "pattern", "visualization"],
		tags: ["regex", "testing", "pattern"],
		nav: {
			unitId: "development-tools",
			lessonId: "regex-pattern-tester",
			path: "#/demo/unit/development-tools/lesson/regex-pattern-tester"
		},
		weight: 0.7
	},
	{
		id: "json-data-formatter",
		title: "JSON Data Formatter",
		description: "Interactive JSON formatter, validator, and viewer",
		content:
			"JSON tools including formatting, validation, minification, and interactive tree view with search capabilities.",
		type: "interactive",
		category: "development-tools",
		keywords: ["json", "formatter", "validator", "tree", "view", "search"],
		tags: ["json", "formatter", "validator"],
		nav: {
			unitId: "development-tools",
			lessonId: "json-data-formatter",
			path: "#/demo/unit/development-tools/lesson/json-data-formatter"
		},
		weight: 0.7
	},
	{
		id: "markdown-preview-editor",
		title: "Markdown Preview Editor",
		description: "Live markdown editor with real-time preview and syntax highlighting",
		content:
			"Markdown editor with live preview, syntax highlighting, table editor, and export options for documentation.",
		type: "interactive",
		category: "content-tools",
		keywords: ["markdown", "editor", "preview", "syntax", "highlighting", "documentation"],
		tags: ["markdown", "editor", "preview"],
		nav: {
			unitId: "content-tools",
			lessonId: "markdown-preview-editor",
			path: "#/demo/unit/content-tools/lesson/markdown-preview-editor"
		},
		weight: 0.7
	},
	{
		id: "browser-compatibility-checker",
		title: "Browser Compatibility Checker",
		description: "Tool for checking feature support across different browsers",
		content:
			"Browser compatibility checker with feature detection, polyfill suggestions, and support matrix visualization.",
		type: "interactive",
		category: "development-tools",
		keywords: ["browser", "compatibility", "feature", "support", "polyfill", "matrix"],
		tags: ["browser", "compatibility", "support"],
		nav: {
			unitId: "development-tools",
			lessonId: "browser-compatibility-checker",
			path: "#/demo/unit/development-tools/lesson/browser-compatibility-checker"
		},
		weight: 0.6
	},
	{
		id: "seo-audit-tool",
		title: "SEO Audit Tool",
		description: "Interactive SEO analysis and optimization recommendations",
		content:
			"SEO audit tool with page analysis, meta tag checking, performance metrics, and optimization recommendations.",
		type: "interactive",
		category: "seo-tools",
		keywords: ["seo", "audit", "analysis", "meta", "tags", "optimization"],
		tags: ["seo", "audit", "optimization"],
		nav: {
			unitId: "seo-tools",
			lessonId: "seo-audit-tool",
			path: "#/demo/unit/seo-tools/lesson/seo-audit-tool"
		},
		weight: 0.7
	}
];

export function getSearchableContent(): SearchableItem[] {
	return searchIndex;
}

export function searchContent(
	query: string,
	contentType?: ContentType,
	category?: string
): SearchableItem[] {
	if (!query || query.length < searchConfig.minQueryLength) {
		return [];
	}

	const searchTerm = query.toLowerCase();
	const results = searchIndex.filter((item) => {
		// Filter by content type if specified
		if (contentType && item.type !== contentType) {
			return false;
		}

		// Filter by category if specified
		if (category && category !== "all" && item.category !== category) {
			return false;
		}

		// Search in title, description, content, and keywords
		const searchableText = [
			item.title,
			item.description,
			item.content,
			...item.keywords,
			...item.tags
		]
			.join(" ")
			.toLowerCase();

		return searchableText.includes(searchTerm);
	});

	// Sort by relevance (title matches first, then description, then content)
	results.sort((a, b) => {
		const aTitle = a.title.toLowerCase().includes(searchTerm) ? 3 : 0;
		const aDesc = a.description.toLowerCase().includes(searchTerm) ? 2 : 0;
		const aKeywords = a.keywords.some((k) => k.includes(searchTerm)) ? 1 : 0;
		const aScore = aTitle + aDesc + aKeywords + (a.weight || 1);

		const bTitle = b.title.toLowerCase().includes(searchTerm) ? 3 : 0;
		const bDesc = b.description.toLowerCase().includes(searchTerm) ? 2 : 0;
		const bKeywords = b.keywords.some((k) => k.includes(searchTerm)) ? 1 : 0;
		const bScore = bTitle + bDesc + bKeywords + (b.weight || 1);

		return bScore - aScore;
	});

	return results.slice(0, searchConfig.maxResults);
}

export function highlightSearchTerms(text: string, query: string): string {
	if (!query || query.length < searchConfig.minQueryLength) {
		return text;
	}

	const regex = new RegExp(`(${query})`, "gi");
	return text.replace(
		regex,
		`${searchConfig.highlightTags.open}$1${searchConfig.highlightTags.close}`
	);
}

export function getSearchSuggestions(query: string): string[] {
	if (!query || query.length < 2) {
		return [];
	}

	const suggestions = new Set<string>();
	const searchTerm = query.toLowerCase();

	searchIndex.forEach((item) => {
		// Add matching keywords
		item.keywords.forEach((keyword) => {
			if (keyword.toLowerCase().includes(searchTerm) && keyword.length > query.length) {
				suggestions.add(keyword);
			}
		});

		// Add matching tags
		item.tags.forEach((tag) => {
			if (tag.toLowerCase().includes(searchTerm) && tag.length > query.length) {
				suggestions.add(tag);
			}
		});

		// Add partial title matches
		if (item.title.toLowerCase().includes(searchTerm) && item.title.length > query.length) {
			suggestions.add(item.title);
		}
	});

	return Array.from(suggestions).slice(0, 8);
}
