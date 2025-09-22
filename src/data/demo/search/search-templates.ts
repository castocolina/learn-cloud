import type { ContentType } from "$lib/types";
import type { SearchResult } from "$lib/types";

export interface SearchResultTemplate {
	type: ContentType;
	icon: string;
	badgeColor: string;
	titlePrefix?: string;
	showContent: boolean;
	maxContentLength: number;
	actionLabel: string;
}

export const searchResultTemplates: { [K in ContentType]: SearchResultTemplate } = {
	component: {
		type: "component",
		icon: "🧩",
		badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		titlePrefix: "Component:",
		showContent: true,
		maxContentLength: 120,
		actionLabel: "View Component"
	},
	lesson: {
		type: "lesson",
		icon: "📚",
		badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		titlePrefix: "Lesson:",
		showContent: true,
		maxContentLength: 150,
		actionLabel: "Start Lesson"
	},
	code: {
		type: "code",
		icon: "💻",
		badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
		titlePrefix: "Code:",
		showContent: true,
		maxContentLength: 100,
		actionLabel: "View Code"
	},
	diagram: {
		type: "diagram",
		icon: "📊",
		badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
		titlePrefix: "Diagram:",
		showContent: false,
		maxContentLength: 80,
		actionLabel: "View Diagram"
	},
	interactive: {
		type: "interactive",
		icon: "🎮",
		badgeColor: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
		titlePrefix: "Interactive:",
		showContent: true,
		maxContentLength: 100,
		actionLabel: "Try Interactive"
	},
	text: {
		type: "text",
		icon: "📄",
		badgeColor: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
		titlePrefix: "Text:",
		showContent: true,
		maxContentLength: 200,
		actionLabel: "Read Text"
	},
	mixed: {
		type: "mixed",
		icon: "🔀",
		badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
		titlePrefix: "Mixed:",
		showContent: true,
		maxContentLength: 150,
		actionLabel: "View Content"
	}
};

export interface SearchEmptyState {
	title: string;
	description: string;
	suggestions: string[];
	icon?: string;
}

export const searchEmptyStates = {
	noQuery: {
		title: "Start searching",
		description: "Type in the search box to find components, lessons, code examples, and more.",
		suggestions: [
			'Try searching for "button"',
			'Look for "authentication"',
			'Find "responsive design"',
			'Search for "accessibility"'
		],
		icon: "🔍"
	},
	noResults: {
		title: "No results found",
		description:
			"We couldn't find anything matching your search. Try different keywords or check your spelling.",
		suggestions: [
			"Use more general terms",
			"Check for typos",
			"Try synonyms",
			"Browse categories instead"
		],
		icon: "😔"
	},
	queryTooShort: {
		title: "Search term too short",
		description: "Please enter at least 2 characters to search.",
		suggestions: ["Add more characters", "Be more specific", "Use complete words"],
		icon: "✏️"
	}
};

export function formatSearchResult(result: SearchResult): {
	displayTitle: string;
	displayDescription: string;
	displayContent?: string;
	template: SearchResultTemplate;
} {
	const template = searchResultTemplates[result.type];

	const displayTitle = result.highlightedTitle || result.title;
	const displayDescription = result.highlightedDescription || result.description;

	let displayContent: string | undefined;
	if (template.showContent && result.content) {
		const content = result.highlightedContent || result.content;
		displayContent =
			content.length > template.maxContentLength
				? content.substring(0, template.maxContentLength) + "..."
				: content;
	}

	return {
		displayTitle,
		displayDescription,
		displayContent,
		template
	};
}

export function getResultIcon(contentType: ContentType): string {
	return searchResultTemplates[contentType].icon;
}

export function getResultBadgeColor(contentType: ContentType): string {
	return searchResultTemplates[contentType].badgeColor;
}

export function getActionLabel(contentType: ContentType): string {
	return searchResultTemplates[contentType].actionLabel;
}

export function truncateContent(content: string, maxLength: number): string {
	if (content.length <= maxLength) return content;

	const truncated = content.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");

	// If we can find a word boundary, use it
	if (lastSpace > maxLength * 0.8) {
		return truncated.substring(0, lastSpace) + "...";
	}

	return truncated + "...";
}

export function getSearchResultAriaLabel(result: SearchResult): string {
	const template = searchResultTemplates[result.type];
	return `${template.titlePrefix || ""} ${result.title}. ${result.description}. ${template.actionLabel}`;
}

export function getEmptyStateForContext(
	hasQuery: boolean,
	queryLength: number,
	hasResults: boolean
): SearchEmptyState {
	if (!hasQuery) {
		return searchEmptyStates.noQuery;
	}

	if (queryLength < 2) {
		return searchEmptyStates.queryTooShort;
	}

	if (!hasResults) {
		return searchEmptyStates.noResults;
	}

	// Default fallback
	return searchEmptyStates.noQuery;
}
