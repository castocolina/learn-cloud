export type ContentType = "component" | "lesson" | "code" | "diagram" | "interactive";

export interface SearchCategory {
	id: string;
	name: string;
	icon: string;
}

export interface SearchableItem {
	id: string;
	title: string;
	description: string;
	content: string;
	type: ContentType;
	category: string;
	keywords: string[];
	tags: string[];
	nav: {
		unitId?: string;
		lessonId?: string;
		path: string;
	};
	weight: number;
}

export interface SearchFilters {
	contentType?: ContentType;
	category?: string;
	tags?: string[];
}

export interface SearchResult extends SearchableItem {
	score: number;
	highlightedTitle?: string;
	highlightedDescription?: string;
	highlightedContent?: string;
}

export interface SearchState {
	query: string;
	results: SearchResult[];
	suggestions: string[];
	filters: SearchFilters;
	isLoading: boolean;
	hasMore: boolean;
	totalResults: number;
}

export interface SearchOptions {
	limit?: number;
	offset?: number;
	includeContent?: boolean;
	highlightMatches?: boolean;
}

export interface SearchAnalytics {
	query: string;
	resultCount: number;
	clickedResult?: string;
	timestamp: Date;
	userAgent?: string;
}
