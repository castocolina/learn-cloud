import { writable } from "svelte/store";
import { browser } from "$app/environment";
import type {
	LessonContent,
	QuizContent,
	StudyGuideContent,
	ExamContent,
	ProjectContent
} from "$data/types";

// Union type for all possible content types
export type ContentType =
	| LessonContent
	| QuizContent
	| StudyGuideContent
	| ExamContent
	| ProjectContent;

// Store state interface
export interface ContentState {
	currentContent: ContentType | null;
	isLoading: boolean;
	error: string | null;
	showWelcome: boolean;
	currentHash: string | null;
}

// Initial state - check for hash on load
const initialState: ContentState = {
	currentContent: null,
	isLoading: false,
	error: null,
	showWelcome: true,
	currentHash: null
};

// Create the store
export const contentStore = writable<ContentState>(initialState);

// Helper functions to update the store
export const contentActions = {
	// Show welcome screen
	showWelcome: () => {
		if (browser) {
			window.location.hash = "";
		}
		contentStore.update((state) => ({
			...state,
			currentContent: null,
			isLoading: false,
			error: null,
			showWelcome: true,
			currentHash: null
		}));
	},

	// Start loading content
	startLoading: (hash?: string) => {
		contentStore.update((state) => ({
			...state,
			isLoading: true,
			error: null,
			showWelcome: false,
			currentHash: hash || state.currentHash
		}));
	},

	// Set loaded content
	setContent: (content: ContentType, hash?: string) => {
		if (browser && hash) {
			window.location.hash = hash;
		}
		contentStore.update((state) => ({
			...state,
			currentContent: content,
			isLoading: false,
			error: null,
			showWelcome: false,
			currentHash: hash || state.currentHash
		}));
	},

	// Set error
	setError: (error: string) => {
		contentStore.update((state) => ({
			...state,
			currentContent: null,
			isLoading: false,
			error,
			showWelcome: false
		}));
	},

	// Clear error
	clearError: () => {
		contentStore.update((state) => ({
			...state,
			error: null
		}));
	},

	// Initialize from hash
	initFromHash: () => {
		if (browser && window.location.hash) {
			const hash = window.location.hash.slice(1); // Remove #
			contentStore.update((state) => ({
				...state,
				currentHash: hash,
				showWelcome: false
			}));
			return hash;
		}
		return null;
	}
};
