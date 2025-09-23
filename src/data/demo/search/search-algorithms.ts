import type {
	SearchableItem,
	SearchResult,
	SearchFilters,
	SearchOptions
} from "$lib/types/search.js";
import type { ContentType } from "$types";
import { searchConfig, highlightSearchTerms } from "./search-index.js";

export interface RankingWeights {
	titleExactMatch: number;
	titlePartialMatch: number;
	descriptionMatch: number;
	contentMatch: number;
	keywordMatch: number;
	tagMatch: number;
	categoryMatch: number;
	contentTypeWeight: number;
	recencyBoost: number;
	popularityBoost: number;
}

export const defaultRankingWeights: RankingWeights = {
	titleExactMatch: 10.0,
	titlePartialMatch: 5.0,
	descriptionMatch: 3.0,
	contentMatch: 1.0,
	keywordMatch: 4.0,
	tagMatch: 2.0,
	categoryMatch: 1.5,
	contentTypeWeight: 1.0,
	recencyBoost: 0.1,
	popularityBoost: 0.2
};

export interface SearchAnalytics {
	totalSearches: number;
	popularQueries: Map<string, number>;
	clickThroughRates: Map<string, number>;
	resultInteractions: Map<string, number>;
}

export class SearchEngine {
	private analytics: SearchAnalytics;
	protected weights: RankingWeights;

	constructor(weights: RankingWeights = defaultRankingWeights) {
		this.weights = weights;
		this.analytics = {
			totalSearches: 0,
			popularQueries: new Map(),
			clickThroughRates: new Map(),
			resultInteractions: new Map()
		};
	}

	search(
		items: SearchableItem[],
		query: string,
		filters: SearchFilters = {},
		options: SearchOptions = {}
	): SearchResult[] {
		// Track search analytics
		this.trackSearch(query);

		// Validate query
		if (!query || query.length < searchConfig.minQueryLength) {
			return [];
		}

		const searchTerm = query.toLowerCase().trim();
		const searchTerms = searchTerm.split(/\s+/);

		// Filter items based on filters
		const filteredItems = this.applyFilters(items, filters);

		// Score and rank results
		const scoredResults = filteredItems
			.map((item) => this.scoreItem(item, searchTerm, searchTerms))
			.filter((result) => result.score > 0)
			.sort((a, b) => b.score - a.score);

		// Apply highlighting if requested
		const results = options.highlightMatches
			? scoredResults.map((result) => this.highlightMatches(result, query))
			: scoredResults;

		// Apply pagination
		const offset = options.offset || 0;
		const limit = options.limit || searchConfig.maxResults;

		return results.slice(offset, offset + limit);
	}

	private applyFilters(items: SearchableItem[], filters: SearchFilters): SearchableItem[] {
		return items.filter((item) => {
			// Filter by content type
			if (filters.contentType && item.type !== filters.contentType) {
				return false;
			}

			// Filter by category
			if (filters.category && filters.category !== "all" && item.category !== filters.category) {
				return false;
			}

			// Filter by tags
			if (filters.tags && filters.tags.length > 0) {
				const hasMatchingTag = filters.tags.some((tag) => item.tags.includes(tag));
				if (!hasMatchingTag) {
					return false;
				}
			}

			return true;
		});
	}

	protected scoreItem(
		item: SearchableItem,
		searchTerm: string,
		searchTerms: string[]
	): SearchResult {
		let score = 0;

		const title = item.title.toLowerCase();
		const description = item.description.toLowerCase();
		const content = item.content.toLowerCase();
		const keywords = item.keywords.map((k) => k.toLowerCase());
		const tags = item.tags.map((t) => t.toLowerCase());

		// Title scoring
		if (title === searchTerm) {
			score += this.weights.titleExactMatch;
		} else if (title.includes(searchTerm)) {
			score += this.weights.titlePartialMatch;
		} else {
			// Check for partial word matches in title
			const titleWords = title.split(/\s+/);
			const matchingWords = searchTerms.filter((term) =>
				titleWords.some((word) => word.includes(term))
			);
			score += (matchingWords.length / searchTerms.length) * this.weights.titlePartialMatch * 0.5;
		}

		// Description scoring
		if (description.includes(searchTerm)) {
			score += this.weights.descriptionMatch;
		} else {
			const matchingTerms = searchTerms.filter((term) => description.includes(term));
			score += (matchingTerms.length / searchTerms.length) * this.weights.descriptionMatch * 0.7;
		}

		// Content scoring
		if (content.includes(searchTerm)) {
			score += this.weights.contentMatch;
		} else {
			const matchingTerms = searchTerms.filter((term) => content.includes(term));
			score += (matchingTerms.length / searchTerms.length) * this.weights.contentMatch * 0.6;
		}

		// Keywords scoring
		const keywordMatches = keywords.filter(
			(keyword) =>
				keyword.includes(searchTerm) || searchTerms.some((term) => keyword.includes(term))
		);
		score += keywordMatches.length * this.weights.keywordMatch;

		// Tags scoring
		const tagMatches = tags.filter(
			(tag) => tag.includes(searchTerm) || searchTerms.some((term) => tag.includes(term))
		);
		score += tagMatches.length * this.weights.tagMatch;

		// Category scoring
		if (item.category.toLowerCase().includes(searchTerm)) {
			score += this.weights.categoryMatch;
		}

		// Content type weight
		const contentTypeWeight = searchConfig.weights[item.type] || 1.0;
		score *= contentTypeWeight * this.weights.contentTypeWeight;

		// Item weight (from item definition)
		score *= item.weight;

		// Popularity boost (based on analytics)
		const popularityBoost = this.getPopularityBoost(item.id);
		score += popularityBoost * this.weights.popularityBoost;

		return {
			...item,
			score: Math.round(score * 100) / 100
		};
	}

	private highlightMatches(result: SearchResult, query: string): SearchResult {
		const highlightedTitle = highlightSearchTerms(result.title, query);
		const highlightedDescription = highlightSearchTerms(result.description, query);
		const highlightedContent = highlightSearchTerms(result.content, query);

		return {
			...result,
			highlightedTitle: highlightedTitle !== result.title ? highlightedTitle : undefined,
			highlightedDescription:
				highlightedDescription !== result.description ? highlightedDescription : undefined,
			highlightedContent: highlightedContent !== result.content ? highlightedContent : undefined
		};
	}

	private getPopularityBoost(itemId: string): number {
		const interactions = this.analytics.resultInteractions.get(itemId) || 0;
		return Math.log(interactions + 1) * 0.1;
	}

	private trackSearch(query: string): void {
		this.analytics.totalSearches++;
		const currentCount = this.analytics.popularQueries.get(query) || 0;
		this.analytics.popularQueries.set(query, currentCount + 1);
	}

	trackResultClick(query: string, resultId: string): void {
		// Track click-through rate
		const ctrKey = `${query}:${resultId}`;
		const currentCtr = this.analytics.clickThroughRates.get(ctrKey) || 0;
		this.analytics.clickThroughRates.set(ctrKey, currentCtr + 1);

		// Track result interactions
		const currentInteractions = this.analytics.resultInteractions.get(resultId) || 0;
		this.analytics.resultInteractions.set(resultId, currentInteractions + 1);
	}

	getPopularQueries(limit: number = 10): Array<{ query: string; count: number }> {
		return Array.from(this.analytics.popularQueries.entries())
			.map(([query, count]) => ({ query, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, limit);
	}

	getTrendingItems(limit: number = 10): Array<{ itemId: string; interactions: number }> {
		return Array.from(this.analytics.resultInteractions.entries())
			.map(([itemId, interactions]) => ({ itemId, interactions }))
			.sort((a, b) => b.interactions - a.interactions)
			.slice(0, limit);
	}

	getSearchAnalytics(): SearchAnalytics {
		return { ...this.analytics };
	}

	updateWeights(newWeights: Partial<RankingWeights>): void {
		this.weights = { ...this.weights, ...newWeights };
	}
}

// Fuzzy search implementation
export class FuzzySearchEngine extends SearchEngine {
	private calculateLevenshteinDistance(str1: string, str2: string): number {
		const matrix = Array(str2.length + 1)
			.fill(null)
			.map(() => Array(str1.length + 1).fill(null));

		for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
		for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

		for (let j = 1; j <= str2.length; j++) {
			for (let i = 1; i <= str1.length; i++) {
				const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
				matrix[j][i] = Math.min(
					matrix[j][i - 1] + 1, // insertion
					matrix[j - 1][i] + 1, // deletion
					matrix[j - 1][i - 1] + substitutionCost // substitution
				);
			}
		}

		return matrix[str2.length][str1.length];
	}

	private fuzzyMatch(target: string, query: string, threshold: number = 0.7): number {
		const distance = this.calculateLevenshteinDistance(target.toLowerCase(), query.toLowerCase());
		const maxLength = Math.max(target.length, query.length);
		const similarity = 1 - distance / maxLength;

		return similarity >= threshold ? similarity : 0;
	}

	protected scoreItem(
		item: SearchableItem,
		searchTerm: string,
		searchTerms: string[]
	): SearchResult {
		// Get base score from parent class
		const baseResult = super.scoreItem(item, searchTerm, searchTerms);
		let score = baseResult.score;

		// Add fuzzy matching bonus
		const fuzzyTitleMatch = this.fuzzyMatch(item.title, searchTerm);
		const fuzzyDescMatch = this.fuzzyMatch(item.description, searchTerm);

		if (fuzzyTitleMatch > 0) {
			score += fuzzyTitleMatch * this.weights.titlePartialMatch * 0.8;
		}

		if (fuzzyDescMatch > 0) {
			score += fuzzyDescMatch * this.weights.descriptionMatch * 0.6;
		}

		// Fuzzy keyword matching
		const fuzzyKeywordScore = item.keywords.reduce((acc, keyword) => {
			const fuzzyScore = this.fuzzyMatch(keyword, searchTerm);
			return acc + fuzzyScore * this.weights.keywordMatch * 0.7;
		}, 0);

		score += fuzzyKeywordScore;

		return {
			...baseResult,
			score: Math.round(score * 100) / 100
		};
	}
}

// Advanced search with boolean operators
export class AdvancedSearchEngine extends FuzzySearchEngine {
	private parseAdvancedQuery(query: string): {
		required: string[];
		excluded: string[];
		optional: string[];
		exact: string[];
	} {
		const required: string[] = [];
		const excluded: string[] = [];
		const optional: string[] = [];
		const exact: string[] = [];

		// Parse quoted strings (exact matches)
		const quotedRegex = /"([^"]+)"/g;
		let match;
		while ((match = quotedRegex.exec(query)) !== null) {
			exact.push(match[1]);
			query = query.replace(match[0], "");
		}

		// Parse required terms (+term)
		const requiredRegex = /\+(\w+)/g;
		while ((match = requiredRegex.exec(query)) !== null) {
			required.push(match[1]);
			query = query.replace(match[0], "");
		}

		// Parse excluded terms (-term)
		const excludedRegex = /-(\w+)/g;
		while ((match = excludedRegex.exec(query)) !== null) {
			excluded.push(match[1]);
			query = query.replace(match[0], "");
		}

		// Remaining terms are optional
		const remainingTerms = query
			.trim()
			.split(/\s+/)
			.filter((term) => term.length > 0);
		optional.push(...remainingTerms);

		return { required, excluded, optional, exact };
	}

	search(
		items: SearchableItem[],
		query: string,
		filters: SearchFilters = {},
		options: SearchOptions = {}
	): SearchResult[] {
		if (!query || query.length < searchConfig.minQueryLength) {
			return [];
		}

		const parsedQuery = this.parseAdvancedQuery(query);

		// Pre-filter items based on advanced query requirements
		const validItems = items.filter((item) => {
			const searchableText = [
				item.title,
				item.description,
				item.content,
				...item.keywords,
				...item.tags
			]
				.join(" ")
				.toLowerCase();

			// Check excluded terms
			if (parsedQuery.excluded.some((term) => searchableText.includes(term.toLowerCase()))) {
				return false;
			}

			// Check required terms
			if (parsedQuery.required.length > 0) {
				const hasAllRequired = parsedQuery.required.every((term) =>
					searchableText.includes(term.toLowerCase())
				);
				if (!hasAllRequired) {
					return false;
				}
			}

			// Check exact matches
			if (parsedQuery.exact.length > 0) {
				const hasAllExact = parsedQuery.exact.every((term) =>
					searchableText.includes(term.toLowerCase())
				);
				if (!hasAllExact) {
					return false;
				}
			}

			return true;
		});

		// Use the original query for scoring
		return super.search(validItems, query, filters, options);
	}
}

// Create singleton instances
export const defaultSearchEngine = new SearchEngine();
export const fuzzySearchEngine = new FuzzySearchEngine();
export const advancedSearchEngine = new AdvancedSearchEngine();

// Export utility functions
export function createSearchEngine(
	type: "default" | "fuzzy" | "advanced" = "default"
): SearchEngine {
	switch (type) {
		case "fuzzy":
			return new FuzzySearchEngine();
		case "advanced":
			return new AdvancedSearchEngine();
		default:
			return new SearchEngine();
	}
}

export function getSearchSuggestions(
	items: SearchableItem[],
	query: string,
	limit: number = 8
): string[] {
	if (!query || query.length < 2) {
		return [];
	}

	const suggestions = new Set<string>();
	const searchTerm = query.toLowerCase();

	items.forEach((item) => {
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

	return Array.from(suggestions)
		.sort((a, b) => a.length - b.length) // Prefer shorter suggestions
		.slice(0, limit);
}
