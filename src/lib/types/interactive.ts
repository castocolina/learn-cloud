/**
 * Interactive Learning Component Types
 *
 * This module defines types for interactive educational components including
 * flip cards, quiz configurations, and learning progress tracking systems.
 *
 * These interfaces support comprehensive educational experiences with animations,
 * accessibility features, and detailed progress analytics.
 */

import type {
	ContentDifficulty,
	QuestionType,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	ContentStatus,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	ChapterType,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	TechnologyUnit,
	ThemeMode,
	FontSize,
	AspectRatio,
	Layout,
	CardStyle
} from "./types.js";

/**
 * Animation configuration for interactive components
 *
 * Provides fine-grained control over animation timing, easing,
 * and visual effects for educational interactions.
 */
export interface InteractiveAnimation {
	/** Duration of the animation in milliseconds */
	duration: number;

	/** CSS easing function for smooth transitions */
	easing: string;

	/** Delay before animation starts in milliseconds */
	delay: number;

	/** Enable 3D transform effects */
	enable3D: boolean;

	/** Animation direction for complex sequences */
	direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
}

/**
 * Interactive behavior configuration for educational components
 *
 * Defines how users can interact with educational content across
 * different input methods and accessibility requirements.
 */
export interface InteractiveConfiguration {
	/** Enable click/tap to interact */
	clickToInteract: boolean;

	/** Enable touch/swipe gestures on mobile */
	touchGestures: boolean;

	/** Enable keyboard navigation (space/enter to interact) */
	keyboardNavigation: boolean;

	/** Auto-return to initial state after specified milliseconds (0 = disabled) */
	autoReset: number;

	/** Enable hover interactions on desktop */
	hoverToInteract: boolean;

	/** Enable focus-based interactions for accessibility */
	focusToInteract: boolean;
}

/**
 * Learning progress tracking data
 *
 * Comprehensive tracking of user interactions and learning progress
 * with detailed analytics for educational assessment.
 */
export interface LearningProgress {
	/** Track if content has been viewed */
	viewed: boolean;

	/** Track if user has completed the interaction */
	completed: boolean;

	/** Number of times this content has been accessed */
	accessCount: number;

	/** Total time spent engaging with content (in seconds) */
	timeSpent: number;

	/** Timestamp of first access */
	firstAccessed: Date | null;

	/** Timestamp of last interaction */
	lastAccessed: Date | null;

	/** Timestamp when marked as completed */
	completedAt: Date | null;

	/** User marked as mastered/understood */
	mastered: boolean;

	/** User confidence level (1-5 scale) */
	confidenceLevel?: number;

	/** Number of attempts for assessment content */
	attempts?: number;

	/** Best score achieved (percentage) */
	bestScore?: number;
}

/**
 * Educational metadata for learning content
 *
 * Comprehensive educational context including objectives, prerequisites,
 * and learning analytics for effective content organization.
 */
export interface EducationalMetadata {
	/** Learning objectives this content addresses */
	learningObjectives?: string[];

	/** Prerequisites knowledge required */
	prerequisites?: string[];

	/** Related concepts and cross-references */
	relatedConcepts?: string[];

	/** Estimated time to complete/understand (in minutes) */
	estimatedTime?: number;

	/** Content difficulty level */
	difficulty?: ContentDifficulty;

	/** Keywords for search and categorization */
	keywords?: string[];

	/** Tags for flexible categorization */
	tags?: string[];

	/** Additional resources for deeper learning */
	additionalResources?: {
		title: string;
		url: string;
		type: "documentation" | "tutorial" | "video" | "article" | "exercise";
		estimatedTime?: number;
	}[];
}

/**
 * Flip card component configuration
 *
 * Comprehensive flip card system with 3D animations, progress tracking,
 * and educational metadata for concept learning.
 */
export interface FlipCard {
	/** Unique identifier for the flip card */
	id: string;

	/** The front side content (usually the concept/question) */
	front: string;

	/** The back side content (usually the definition/answer) */
	back: string;

	/** Content category for organization (optional) */
	category?: string;

	/** Educational metadata and learning context */
	education: EducationalMetadata;

	/** Animation configuration for this card */
	animation?: InteractiveAnimation;

	/** Interactive behavior configuration */
	interaction?: InteractiveConfiguration;

	/** Progress tracking data (initialized with defaults) */
	progress?: LearningProgress;

	/** Additional styling and display options */
	display?: {
		frontColor?: string;
		backColor?: string;
		borderColor?: string;
		fontSize?: FontSize;
		aspectRatio?: AspectRatio;
	};
}

/**
 * Quiz timing configuration options
 *
 * Flexible timing controls for educational assessments with
 * warnings and accessibility considerations.
 */
export interface QuizTiming {
	/** Time limit in minutes (optional) */
	timeLimit?: number;

	/** Whether to display countdown timer */
	showTimer: boolean;

	/** Minutes before warning is shown */
	warningThreshold?: number;

	/** Allow time extensions for accessibility */
	allowExtensions: boolean;

	/** Pause timer when window loses focus */
	pauseOnBlur: boolean;
}

/**
 * Quiz scoring and grading configuration
 *
 * Comprehensive scoring system with partial credit, attempts,
 * and feedback options for educational assessment.
 */
export interface QuizScoring {
	/** Percentage required to pass (0-100) */
	passingScore: number;

	/** Maximum attempts allowed (optional) */
	maxAttempts?: number;

	/** Show correct answers after completion */
	showCorrectAnswers: boolean;

	/** Allow partial credit for multi-part questions */
	partialCredit: boolean;

	/** Show detailed feedback for each question */
	detailedFeedback: boolean;

	/** Show score immediately after completion */
	immediateResults: boolean;

	/** Include performance analytics */
	includeAnalytics: boolean;
}

/**
 * Quiz progress tracking configuration
 *
 * Controls for quiz navigation, randomization, and progress persistence
 * to support various educational assessment strategies.
 */
export interface QuizProgressTracking {
	/** Save progress between sessions */
	saveProgress: boolean;

	/** Allow reviewing questions before submission */
	allowReview: boolean;

	/** Randomize question order */
	randomizeQuestions: boolean;

	/** Randomize option order for multiple choice */
	randomizeOptions: boolean;

	/** Allow skipping questions */
	allowSkipping: boolean;

	/** Show progress indicator */
	showProgress: boolean;

	/** Allow navigation between questions */
	allowNavigation: boolean;
}

/**
 * Accessibility configuration for interactive content
 *
 * Comprehensive accessibility support ensuring inclusive educational
 * experiences across different user needs and assistive technologies.
 */
export interface AccessibilityConfiguration {
	/** High contrast mode support */
	highContrast: boolean;

	/** Screen reader optimization */
	screenReaderSupport: boolean;

	/** Full keyboard navigation */
	keyboardNavigation: boolean;

	/** Alternative text for visual elements */
	altTextSupport: boolean;

	/** Reduced motion for sensitive users */
	reducedMotion: boolean;

	/** Large text/zoom support */
	scalableText: boolean;

	/** Focus indicators for navigation */
	focusIndicators: boolean;

	/** ARIA labels and descriptions */
	ariaLabels: boolean;
}

/**
 * Comprehensive quiz configuration interface
 *
 * Complete configuration system for educational quizzes with timing,
 * scoring, progress tracking, and accessibility support.
 */
export interface QuizConfiguration {
	/** Quiz timing and deadline settings */
	timing: QuizTiming;

	/** Scoring and grading configuration */
	scoring: QuizScoring;

	/** Progress tracking and navigation */
	progress: QuizProgressTracking;

	/** Accessibility and inclusion settings */
	accessibility: AccessibilityConfiguration;

	/** Educational metadata */
	education: EducationalMetadata;

	/** Visual and interaction customization */
	display?: {
		theme?: ThemeMode;
		layout?: Layout;
		cardStyle?: CardStyle;
	};
}

/**
 * Interactive assessment question base interface
 *
 * Foundation interface for all interactive question types with
 * comprehensive educational context and analytics support.
 */
export interface InteractiveQuestion {
	/** Unique question identifier */
	id: string;

	/** Question type discriminator */
	type: QuestionType;

	/** The question text or prompt */
	question: string;

	/** Detailed explanation of the answer */
	explanation: string;

	/** Points awarded for correct answer */
	points: number;

	/** Question category for organization */
	category: string;

	/** Educational metadata */
	education: EducationalMetadata;

	/** Question-specific configuration */
	config?: {
		/** Time limit for this question (seconds) */
		timeLimit?: number;

		/** Allow multiple attempts for this question */
		allowRetries?: boolean;

		/** Hint text for assistance */
		hint?: string;

		/** Related resources for this question */
		resources?: string[];
	};
}

/**
 * Default configurations for interactive components
 */

/** Default animation configuration for interactive elements */
export const defaultInteractiveAnimation: InteractiveAnimation = {
	duration: 600,
	easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
	delay: 0,
	enable3D: true,
	direction: "normal"
};

/** Default interaction configuration for educational components */
export const defaultInteractiveConfiguration: InteractiveConfiguration = {
	clickToInteract: true,
	touchGestures: true,
	keyboardNavigation: true,
	autoReset: 0,
	hoverToInteract: false,
	focusToInteract: true
};

/** Default progress state for new educational content */
export const defaultLearningProgress: LearningProgress = {
	viewed: false,
	completed: false,
	accessCount: 0,
	timeSpent: 0,
	firstAccessed: null,
	lastAccessed: null,
	completedAt: null,
	mastered: false
};

/** Default accessibility configuration */
export const defaultAccessibilityConfiguration: AccessibilityConfiguration = {
	highContrast: true,
	screenReaderSupport: true,
	keyboardNavigation: true,
	altTextSupport: true,
	reducedMotion: false,
	scalableText: true,
	focusIndicators: true,
	ariaLabels: true
};

/**
 * Type guards for interactive learning components
 */

/** Type guard for FlipCard interface */
export function isFlipCard(obj: unknown): obj is FlipCard {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"front" in obj &&
		"back" in obj &&
		"category" in obj &&
		"education" in obj
	);
}

/** Type guard for QuizConfiguration interface */
export function isQuizConfiguration(obj: unknown): obj is QuizConfiguration {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"timing" in obj &&
		"scoring" in obj &&
		"progress" in obj &&
		"accessibility" in obj &&
		"education" in obj
	);
}

/** Type guard for InteractiveQuestion interface */
export function isInteractiveQuestion(obj: unknown): obj is InteractiveQuestion {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"type" in obj &&
		"question" in obj &&
		"explanation" in obj &&
		"points" in obj &&
		"category" in obj &&
		"education" in obj
	);
}
