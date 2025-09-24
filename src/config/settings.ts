/**
 * Application Configuration Settings
 *
 * Centralized, type-safe configuration for the entire application.
 * This file exports a single SETTINGS object that contains all
 * global application parameters.
 */

// Defines the structure for the application settings for type safety.
interface AppSettings {
	mermaid: {
		debug: boolean;
		modalPagePercent: number; // Viewport percentage for modal dialogs (default: 90)
		// Add more Mermaid-specific settings here as needed
	};
	flipCard: {
		modalPagePercent: number; // Viewport percentage for flip card modal dialogs (default: 90)
		// Add more flip card-specific settings here as needed
	};
	ui: {
		breadcrumb: {
			showIcon: boolean; // Whether to show the emoji icon in breadcrumbs (default: true)
		};
		sidebar: {
			collapsible: boolean; // Whether sidebar can be collapsed on desktop (default: true)
			defaultCollapsed: boolean; // Default collapsed state (default: false)
		};
		// Future UI settings can be grouped here
	};
	contentScaffolding: {
		// Minimum content requirements for each content type
		lessons: {
			sections: number; // Minimum sections per lesson
			codeBlocks: number; // Minimum code blocks per lesson
			diagrams: number; // Minimum diagrams per lesson
		};
		quizzes: {
			questions: number; // Minimum questions per quiz
			diverseTypes: boolean; // Use diverse question types (single, multiple, code_completion, drag_drop)
		};
		exams: {
			questions: number; // Minimum questions per exam
			diverseTypes: boolean; // Use diverse question types
		};
		studyGuides: {
			flashcards: number; // Minimum flashcards per study guide
		};
		projects: {
			sections: number; // Minimum sections per project
			requirements: number; // Minimum requirements per project
			deliverables: number; // Minimum deliverables per project
		};
		// Content length configurations (in characters)
		contentLengths: {
			summary: number;
			paragraph: number;
			longParagraph: number;
			question: number;
			explanation: number;
			flashcardQuestion: number;
			flashcardAnswer: number;
			objective: number;
			requirement: number;
			deliverable: number;
			diagramTitle: number;
			diagramCaption: number;
		};
		// Validation settings
		validation: {
			runAfterGeneration: boolean; // Run validation after content generation
			includeFormat: boolean; // Run format validation
			includeCheck: boolean; // Run TypeScript check validation
			includeLint: boolean; // Run lint validation
		};
	};
	scriptValidation: {
		// Validation settings specifically for utility scripts (Task 3A-3E)
		runAfterGeneration: boolean; // Run validation after script generation
		includeFormat: boolean; // Run prettier format
		includeLint: boolean; // Run eslint
		includeSvelteCheck: boolean; // Run svelte-check (should be false for scripts)
		autoFix: boolean; // Use --fix automatically for simple errors
	};
	// Future settings can be grouped here (e.g., api, performance)
}

// Export a single, constant object with all settings.
export const SETTINGS: AppSettings = {
	mermaid: {
		debug: true, // Enabled for development - provides detailed error logging
		modalPagePercent: 90 // Default modal viewport percentage
	},
	flipCard: {
		modalPagePercent: 90 // Default modal viewport percentage for flip cards
	},
	ui: {
		breadcrumb: {
			showIcon: true // Show emoji icon in breadcrumbs by default
		},
		sidebar: {
			collapsible: true, // Enable sidebar collapse functionality
			defaultCollapsed: false // Sidebar expanded by default
		}
	},
	contentScaffolding: {
		lessons: {
			sections: 5, // Minimum 5 sections per lesson
			codeBlocks: 1, // Minimum 1 code block per lesson
			diagrams: 1 // Minimum 1 diagram per lesson
		},
		quizzes: {
			questions: 10, // Minimum 10 questions per quiz
			diverseTypes: true // Use diverse question types
		},
		exams: {
			questions: 30, // Minimum 30 questions per exam
			diverseTypes: true // Use diverse question types
		},
		studyGuides: {
			flashcards: 5 // Minimum 5 flashcards per study guide
		},
		projects: {
			sections: 5, // Minimum 5 sections per project
			requirements: 5, // Minimum 5 requirements per project
			deliverables: 3 // Minimum 3 deliverables per project
		},
		contentLengths: {
			summary: 200,
			paragraph: 500,
			longParagraph: 800,
			question: 80,
			explanation: 300,
			flashcardQuestion: 60,
			flashcardAnswer: 400,
			objective: 50,
			requirement: 100,
			deliverable: 80,
			diagramTitle: 60,
			diagramCaption: 150
		},
		// Validation settings
		validation: {
			runAfterGeneration: true, // Run validation after content generation (enabled by default)
			includeFormat: true, // Run format validation
			includeCheck: true, // Run TypeScript check validation
			includeLint: true // Run lint validation
		}
	},
	scriptValidation: {
		runAfterGeneration: true, // Run validation after script generation (enabled by default)
		includeFormat: true, // Run prettier format
		includeLint: true, // Run eslint
		includeSvelteCheck: false, // NO svelte-check for utility scripts
		autoFix: true // Use --fix automatically for simple errors (unused imports, format)
	}
};

// Export types for use in other parts of the application
export type { AppSettings };
