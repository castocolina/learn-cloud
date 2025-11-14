/**
 * Learning Management System Types
 *
 * This module defines comprehensive types for learning management, progress tracking,
 * user analytics, and personalized education features. It supports adaptive learning,
 * competency-based assessment, and detailed learning analytics.
 *
 * The system integrates with all educational content types to provide
 * a unified learning experience with robust progress tracking.
 */

import type { DifficultyLevel, TechnologyUnit, ChapterType, ProgressStatus } from "./types.js";

/**
 * Learning style preferences for personalized education
 *
 * Based on established learning theory models including VARK,
 * Kolb's learning styles, and multiple intelligence theory.
 */
export type LearningStyle =
	| "visual" // Visual learner - diagrams, charts, images
	| "auditory" // Auditory learner - audio content, discussions
	| "kinesthetic" // Hands-on learner - interactive exercises
	| "reading" // Reading/writing learner - text-based content
	| "multimodal"; // Combination of multiple styles

/**
 * Learning pace preferences for adaptive content delivery
 *
 * Supports different learning speeds and scheduling preferences
 * for flexible educational experiences.
 */
export type LearningPace =
	| "self-paced" // User controls timing completely
	| "structured" // Fixed schedule with deadlines
	| "accelerated" // Faster than average pace
	| "extended" // Slower pace with more time
	| "intensive"; // High-intensity focused learning

/**
 * Mastery levels for competency-based assessment
 *
 * Progressive mastery system supporting skill development
 * and competency validation across different domains.
 */
export type MasteryLevel =
	| "none" // No exposure or understanding
	| "novice" // Basic awareness, requires guidance
	| "developing" // Growing competence, some independence
	| "proficient" // Solid competence, works independently
	| "advanced" // High competence, can guide others
	| "expert"; // Deep expertise, innovates and leads

/**
 * Assessment types for comprehensive evaluation
 *
 * Multiple assessment methods supporting different learning
 * objectives and validation requirements.
 */
export type AssessmentType =
	| "formative" // Ongoing feedback during learning
	| "summative" // Final evaluation of achievement
	| "diagnostic" // Initial assessment of prior knowledge
	| "peer" // Peer-to-peer evaluation
	| "self" // Self-assessment and reflection
	| "authentic" // Real-world application assessment
	| "adaptive"; // AI-powered adaptive assessment

/**
 * Learning analytics event types for detailed tracking
 *
 * Comprehensive event system for educational data mining
 * and learning analytics dashboard generation.
 */
export type LearningEventType =
	| "content_viewed" // User accessed content
	| "content_completed" // User finished content
	| "assessment_started" // User began assessment
	| "assessment_completed" // User finished assessment
	| "skill_demonstrated" // User showed competency
	| "milestone_reached" // User achieved learning milestone
	| "resource_accessed" // User accessed additional resource
	| "help_sought" // User requested assistance
	| "collaboration" // User engaged in collaborative learning
	| "reflection" // User engaged in reflective practice
	| "goal_set" // User set learning goals
	| "goal_achieved"; // User achieved learning goals

/**
 * User learning profile for personalized education
 *
 * Comprehensive learner profile supporting adaptive learning,
 * personalization, and educational recommendations.
 */
export interface LearnerProfile {
	/** Unique learner identifier */
	userId: string;

	/** Learning preferences and styles */
	preferences: {
		/** Preferred learning style */
		learningStyle: LearningStyle;

		/** Preferred learning pace */
		pace: LearningPace;

		/** Preferred content types */
		contentTypes: ("text" | "video" | "interactive" | "audio" | "visual")[];

		/** Preferred difficulty progression */
		difficultyProgression: "gradual" | "steep" | "adaptive";

		/** Notification preferences */
		notifications: {
			reminders: boolean;
			achievements: boolean;
			recommendations: boolean;
			deadlines: boolean;
		};

		/** Accessibility requirements */
		accessibility: {
			screenReader: boolean;
			highContrast: boolean;
			largeText: boolean;
			reducedMotion: boolean;
			keyboardOnly: boolean;
		};
	};

	/** Current learning goals and objectives */
	goals: {
		/** Short-term goals (weeks) */
		shortTerm: {
			description: string;
			targetDate: Date;
			progress: number; // 0-100
			completed: boolean;
		}[];

		/** Long-term goals (months/years) */
		longTerm: {
			description: string;
			targetDate: Date;
			progress: number;
			completed: boolean;
		}[];

		/** Career-related objectives */
		career: {
			targetRole?: string;
			targetSkills: string[];
			targetCertifications?: string[];
		};
	};

	/** Learning history and analytics */
	analytics: {
		/** Total learning time (hours) */
		totalLearningTime: number;

		/** Content completion rate */
		completionRate: number;

		/** Average session duration (minutes) */
		avgSessionDuration: number;

		/** Learning streak (consecutive days) */
		currentStreak: number;

		/** Longest learning streak achieved */
		longestStreak: number;

		/** Preferred learning times */
		preferredTimes: {
			dayOfWeek: number; // 0-6 (Sunday-Saturday)
			hourOfDay: number; // 0-23
		}[];

		/** Engagement patterns */
		engagement: {
			peakPerformanceHours: number[];
			averageAttentionSpan: number; // minutes
			preferredSessionLength: number; // minutes
		};
	};

	/** Metadata */
	metadata: {
		/** Profile creation date */
		createdAt: Date;

		/** Last update timestamp */
		updatedAt: Date;

		/** Last activity timestamp */
		lastActive: Date;

		/** Profile version for migration tracking */
		version: string;
	};
}

/**
 * Skill and competency tracking system
 *
 * Comprehensive skill management supporting competency-based education,
 * skill validation, and career development pathways.
 */
export interface SkillCompetency {
	/** Unique skill identifier */
	skillId: string;

	/** Skill name and description */
	name: string;
	description: string;

	/** Skill category and domain */
	category: {
		/** Primary domain (e.g., "cloud-computing", "programming") */
		domain: string;

		/** Sub-category (e.g., "containers", "javascript") */
		subcategory: string;

		/** Technology unit alignment */
		technologyUnit?: TechnologyUnit;
	};

	/** Current mastery level */
	masteryLevel: MasteryLevel;

	/** Mastery evidence and validation */
	evidence: {
		/** Content completed that demonstrates this skill */
		completedContent: string[];

		/** Assessments passed demonstrating competency */
		assessments: {
			assessmentId: string;
			score: number;
			completedAt: Date;
			type: AssessmentType;
		}[];

		/** Projects demonstrating practical application */
		projects: {
			projectId: string;
			description: string;
			completedAt: Date;
			validation?: "peer" | "instructor" | "industry";
		}[];

		/** External certifications or validation */
		certifications: {
			name: string;
			issuer: string;
			issuedAt: Date;
			expiresAt?: Date;
			credentialId?: string;
		}[];
	};

	/** Skill development tracking */
	development: {
		/** Date skill was first encountered */
		firstEncountered: Date;

		/** Date current mastery level was achieved */
		masteryAchievedAt: Date;

		/** Learning path that developed this skill */
		learningPaths: string[];

		/** Recommended next steps for advancement */
		nextSteps: string[];

		/** Prerequisites that enabled this skill */
		prerequisites: string[];

		/** Skills that this skill enables */
		enables: string[];
	};

	/** Skill validation and assessment */
	validation: {
		/** Whether skill is validated through assessment */
		validated: boolean;

		/** Validation method used */
		method?: AssessmentType;

		/** Validation confidence score (0-1) */
		confidence: number;

		/** Date of last validation */
		lastValidated?: Date;

		/** Peer or expert validation */
		externalValidation?: {
			validatorId: string;
			validatorType: "peer" | "instructor" | "industry-expert";
			validatedAt: Date;
			comments?: string;
		}[];
	};
}

/**
 * Learning progress tracking for content and courses
 *
 * Detailed progress system supporting granular tracking,
 * analytics, and adaptive learning recommendations.
 */
export interface LearningProgress {
	/** Unique progress record identifier */
	progressId: string;

	/** User identifier */
	userId: string;

	/** Content or course identifier */
	contentId: string;

	/** Content type being tracked */
	contentType: ChapterType;

	/** Overall progress information */
	overall: {
		/** Current progress status */
		status: ProgressStatus;

		/** Completion percentage (0-100) */
		completionPercentage: number;

		/** Current mastery level for this content */
		masteryLevel: MasteryLevel;

		/** Number of attempts */
		attempts: number;

		/** Time spent on content (minutes) */
		timeSpent: number;

		/** Date progress was started */
		startedAt: Date;

		/** Date content was completed */
		completedAt?: Date;

		/** Last interaction timestamp */
		lastInteraction: Date;
	};

	/** Detailed section-level progress */
	sections: {
		/** Section identifier */
		sectionId: string;

		/** Section completion status */
		completed: boolean;

		/** Time spent in this section (minutes) */
		timeSpent: number;

		/** Number of visits to this section */
		visits: number;

		/** Date first accessed */
		firstAccessed: Date;

		/** Date completed */
		completedAt?: Date;

		/** User's confidence rating for this section */
		confidenceRating?: number; // 1-5 scale
	}[];

	/** Assessment and quiz results */
	assessments: {
		/** Assessment identifier */
		assessmentId: string;

		/** Assessment type */
		type: AssessmentType;

		/** Score achieved (percentage) */
		score: number;

		/** Maximum possible score */
		maxScore: number;

		/** Number of attempts */
		attempts: number;

		/** Time taken (minutes) */
		timeTaken: number;

		/** Date completed */
		completedAt: Date;

		/** Detailed question-level results */
		questionResults?: {
			questionId: string;
			correct: boolean;
			timeSpent: number;
			attempts: number;
		}[];
	}[];

	/** Skills demonstrated through this content */
	skillsDemonstrated: {
		skillId: string;
		masteryLevel: MasteryLevel;
		demonstratedAt: Date;
		evidence: string[];
	}[];

	/** Learning analytics data */
	analytics: {
		/** Learning efficiency score */
		efficiency: number; // 0-1 scale

		/** Engagement level */
		engagement: number; // 0-1 scale

		/** Difficulty rating from user perspective */
		perceivedDifficulty: DifficultyLevel;

		/** Recommended next content */
		recommendations: string[];

		/** Identified knowledge gaps */
		knowledgeGaps: string[];

		/** Learning pattern insights */
		patterns: {
			peakPerformanceTime?: number; // hour of day
			optimalSessionLength?: number; // minutes
			preferredContentTypes?: string[];
		};
	};
}

/**
 * Learning analytics event for comprehensive tracking
 *
 * Granular event system for educational data collection,
 * analysis, and machine learning applications.
 */
export interface LearningEvent {
	/** Unique event identifier */
	eventId: string;

	/** User who generated the event */
	userId: string;

	/** Event type classification */
	eventType: LearningEventType;

	/** Event timestamp */
	timestamp: Date;

	/** Content or resource associated with event */
	contentId?: string;

	/** Content type if applicable */
	contentType?: ChapterType;

	/** Session identifier for grouping related events */
	sessionId: string;

	/** Event-specific data payload */
	data: {
		/** Duration of activity (seconds) */
		duration?: number;

		/** Score or performance metric */
		score?: number;

		/** User action details */
		action?: string;

		/** Page or section within content */
		location?: string;

		/** Device/platform information */
		device?: {
			type: "desktop" | "tablet" | "mobile";
			os: string;
			browser: string;
		};

		/** Additional context data */
		context?: Record<string, unknown>;
	};

	/** Event metadata */
	metadata: {
		/** Source system that generated event */
		source: string;

		/** Event processing status */
		processed: boolean;

		/** Data quality indicators */
		quality: {
			confidence: number; // 0-1
			validated: boolean;
			anomaly: boolean;
		};
	};
}

/**
 * Learning recommendation system
 *
 * AI-powered recommendation engine supporting personalized
 * learning paths, content suggestions, and adaptive education.
 */
export interface LearningRecommendation {
	/** Unique recommendation identifier */
	recommendationId: string;

	/** Target user for recommendation */
	userId: string;

	/** Recommendation type and priority */
	type: {
		/** Category of recommendation */
		category: "content" | "skill" | "path" | "resource" | "assessment" | "review";

		/** Priority level */
		priority: "low" | "medium" | "high" | "urgent";

		/** Confidence score for recommendation */
		confidence: number; // 0-1

		/** Reasoning behind recommendation */
		reasoning: string[];
	};

	/** Recommended content or action */
	recommendation: {
		/** Primary recommendation (content ID, skill, etc.) */
		primary: string;

		/** Alternative recommendations */
		alternatives?: string[];

		/** Recommended sequence if multiple items */
		sequence?: string[];

		/** Estimated time investment */
		estimatedTime?: number; // minutes

		/** Expected difficulty level */
		difficulty?: DifficultyLevel;
	};

	/** Recommendation context and triggers */
	context: {
		/** What triggered this recommendation */
		trigger: "completion" | "gap-analysis" | "goal-alignment" | "performance" | "time-based";

		/** Current user state that influenced recommendation */
		userState: {
			currentSkills: string[];
			recentActivity: string[];
			learningGoals: string[];
			timeAvailable?: number; // minutes
		};

		/** Performance data that influenced recommendation */
		performance?: {
			recentScores: number[];
			strugglingAreas: string[];
			strongAreas: string[];
		};
	};

	/** Recommendation lifecycle */
	lifecycle: {
		/** When recommendation was generated */
		generatedAt: Date;

		/** When recommendation expires */
		expiresAt?: Date;

		/** Whether user has seen this recommendation */
		viewed: boolean;

		/** When user viewed recommendation */
		viewedAt?: Date;

		/** User's response to recommendation */
		userResponse?: "accepted" | "dismissed" | "deferred";

		/** When user responded */
		respondedAt?: Date;
	};

	/** Machine learning model information */
	model: {
		/** Model version that generated recommendation */
		version: string;

		/** Model type used */
		type: "collaborative" | "content-based" | "hybrid" | "deep-learning";

		/** Model confidence in recommendation */
		confidence: number; // 0-1

		/** Features used in recommendation generation */
		features?: string[];
	};
}

/**
 * Learning achievement and milestone system
 *
 * Gamification and motivation system supporting badges,
 * achievements, and learning milestone recognition.
 */
export interface LearningAchievement {
	/** Unique achievement identifier */
	achievementId: string;

	/** User who earned the achievement */
	userId: string;

	/** Achievement details */
	achievement: {
		/** Achievement type/category */
		type: "completion" | "mastery" | "streak" | "collaboration" | "innovation" | "milestone";

		/** Achievement title */
		title: string;

		/** Achievement description */
		description: string;

		/** Achievement difficulty/rarity */
		rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";

		/** Points awarded for achievement */
		points: number;

		/** Badge or icon identifier */
		badge?: string;

		/** Achievement category */
		category: string;
	};

	/** Achievement criteria and evidence */
	criteria: {
		/** What conditions must be met */
		requirements: string[];

		/** Evidence that criteria were met */
		evidence: {
			contentCompleted?: string[];
			skillsDemonstrated?: string[];
			assessmentsPassed?: string[];
			timeInvested?: number;
			collaborations?: string[];
		};

		/** Validation of achievement */
		validation: {
			automated: boolean;
			verified: boolean;
			verifiedBy?: string;
			verifiedAt?: Date;
		};
	};

	/** Achievement timeline */
	timeline: {
		/** When user started working toward achievement */
		startedAt: Date;

		/** When achievement was earned */
		earnedAt: Date;

		/** Time taken to earn achievement */
		timeToEarn: number; // hours

		/** Related activities that contributed */
		activities: string[];
	};

	/** Social and sharing aspects */
	social: {
		/** Whether achievement is publicly visible */
		public: boolean;

		/** Whether user wants to share achievement */
		shareable: boolean;

		/** Congratulations from peers */
		congratulations?: {
			fromUserId: string;
			message: string;
			timestamp: Date;
		}[];
	};
}

/**
 * Default learning management configurations
 */

/** Default learner profile preferences */
export const defaultLearnerPreferences = {
	learningStyle: "multimodal" as LearningStyle,
	pace: "self-paced" as LearningPace,
	contentTypes: ["text", "interactive", "visual"],
	difficultyProgression: "gradual" as const,
	notifications: {
		reminders: true,
		achievements: true,
		recommendations: true,
		deadlines: true
	},
	accessibility: {
		screenReader: false,
		highContrast: false,
		largeText: false,
		reducedMotion: false,
		keyboardOnly: false
	}
};

/** Default progress tracking state */
export const defaultLearningProgress = {
	status: "not_started",
	completionPercentage: 0,
	masteryLevel: "none" as MasteryLevel,
	attempts: 0,
	timeSpent: 0,
	sections: [],
	assessments: [],
	skillsDemonstrated: []
};

/**
 * Type guards for learning management interfaces
 */

/** Type guard for LearnerProfile interface */
export function isLearnerProfile(obj: unknown): obj is LearnerProfile {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"userId" in obj &&
		"preferences" in obj &&
		"goals" in obj &&
		"analytics" in obj &&
		"metadata" in obj
	);
}

/** Type guard for SkillCompetency interface */
export function isSkillCompetency(obj: unknown): obj is SkillCompetency {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"skillId" in obj &&
		"name" in obj &&
		"category" in obj &&
		"masteryLevel" in obj &&
		"evidence" in obj &&
		"development" in obj &&
		"validation" in obj
	);
}

/** Type guard for LearningProgress interface */
export function isLearningProgress(obj: unknown): obj is LearningProgress {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"progressId" in obj &&
		"userId" in obj &&
		"contentId" in obj &&
		"contentType" in obj &&
		"overall" in obj &&
		"sections" in obj &&
		"assessments" in obj &&
		"analytics" in obj
	);
}

/** Type guard for LearningEvent interface */
export function isLearningEvent(obj: unknown): obj is LearningEvent {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"eventId" in obj &&
		"userId" in obj &&
		"eventType" in obj &&
		"timestamp" in obj &&
		"sessionId" in obj &&
		"data" in obj &&
		"metadata" in obj
	);
}
