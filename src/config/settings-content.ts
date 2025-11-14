/**
 * Content Display Configuration
 *
 * Settings for educational content display and behavior, including quiz/exam
 * presentation, pagination, progress tracking, and timing configurations.
 *
 * Type definitions are centralized in the unified type system
 * at src/lib/types/config.ts and imported via the $types alias.
 *
 * @module settings-content
 */

import type { ContentSettings } from "$types";

/**
 * Content Display Settings - Educational Content Presentation
 *
 * Contains all configuration for:
 * - Quiz display (questions per attempt, pagination, progress)
 * - Exam display (questions per attempt, pagination, timing)
 * - Progress tracking (completion thresholds, mastery levels)
 * - Timer settings (default time limits per question type)
 *
 * Note: These are DISPLAY settings (how many questions to show per attempt).
 * Content pool sizes are defined in the content data files themselves.
 */
export const CONTENT_SETTINGS: ContentSettings = {
	/**
	 * Quiz Display Configuration
	 *
	 * Settings for quiz presentation and user experience.
	 * Quizzes are learning-focused with immediate feedback.
	 */
	quiz: {
		/**
		 * QuizEngine Behavior Configuration
		 * These settings control how the QuizEngine component processes and displays questions
		 */

		/**
		 * Passing score percentage
		 * @default 70 - C grade equivalent (70%)
		 */
		passingScore: 70,

		/**
		 * Time limit in minutes
		 * @default 15 - Reasonable for quick knowledge check (controlled by timer.enabled)
		 */
		timeLimit: 15,

		/**
		 * Shuffle questions to prevent memorization
		 * @default true - Randomize question order each attempt
		 */
		shuffleQuestions: true,

		/**
		 * Show results immediately after completion
		 * @default true - Provide immediate feedback for learning
		 */
		showResults: true,

		/**
		 * Allow retries for practice and learning
		 * @default true - Enable multiple attempts
		 */
		allowRetry: true,

		/**
		 * Number of questions to show from pool
		 * 0 = show all available questions
		 * N = show N random questions from pool
		 * @default 5 - Show 5 random questions per attempt
		 */
		questionsToShow: 5,

		/**
		 * Display Configuration
		 */

		/**
		 * Show progress bar during quiz
		 *
		 * Displays visual indicator of quiz completion progress.
		 * Helpful for user orientation and motivation.
		 *
		 * @default true
		 */
		showProgressBar: true,

		/**
		 * Show question numbers
		 *
		 * Display "Question 1 of 10" format.
		 * Provides clear context about quiz length.
		 *
		 * @default true
		 */
		showQuestionNumbers: true,

		/**
		 * Enable navigation between questions
		 *
		 * Allow users to jump back/forward between questions.
		 * Useful for review before submission.
		 *
		 * @default true - Enabled for learning-focused quizzes
		 */
		enableNavigation: true,

		/**
		 * Timer configuration for quizzes
		 */
		timer: {
			/**
			 * Enable timer for quizzes
			 * @default false - Quizzes are typically untimed for learning
			 */
			enabled: false,

			/**
			 * Default time limit in minutes (if enabled)
			 * @default 15 - Reasonable for quiz questions
			 */
			defaultLimit: 15,

			/**
			 * Show timer warning when time is running low
			 * @default true
			 */
			showWarning: true,

			/**
			 * Warning threshold in minutes
			 * Triggers warning indicator when remaining time drops below this value
			 * @default 2
			 */
			warningThreshold: 2
		}
	},

	/**
	 * Exam Display Configuration
	 *
	 * Settings for exam presentation and user experience.
	 * Exams are formal assessments with stricter controls.
	 */
	exam: {
		/**
		 * QuizEngine Behavior Configuration
		 * These settings control how the QuizEngine component processes and displays exam questions
		 */

		/**
		 * Passing score percentage
		 * @default 70 - C grade equivalent (70%)
		 */
		passingScore: 70,

		/**
		 * Time limit in minutes
		 * @default 60 - Standard exam duration (controlled by timer.enabled)
		 */
		timeLimit: 60,

		/**
		 * Shuffle questions for exam integrity
		 * @default true - Randomize question order to prevent cheating
		 */
		shuffleQuestions: true,

		/**
		 * Show results after exam completion
		 * @default true - Provide feedback after formal assessment
		 */
		showResults: true,

		/**
		 * Allow retries for exam
		 * @default false - Formal assessments typically don't allow retries
		 */
		allowRetry: false,

		/**
		 * Number of questions to show from pool
		 * 0 = show all available questions
		 * N = show N random questions from pool
		 * @default 25 - Show 25 random questions per attempt
		 */
		questionsToShow: 25,

		/**
		 * Display Configuration
		 */

		/**
		 * Show progress bar during exam
		 *
		 * Displays visual indicator of exam completion progress.
		 * Important for time management during timed exams.
		 *
		 * @default true
		 */
		showProgressBar: true,

		/**
		 * Show question numbers
		 *
		 * Display "Question 1 of 25" format.
		 * Critical for exam navigation and reference.
		 *
		 * @default true
		 */
		showQuestionNumbers: true,

		/**
		 * Enable navigation between questions
		 *
		 * Allow users to review and change answers before submission.
		 *
		 * @default true - Enabled for fairness and review
		 */
		enableNavigation: true,

		/**
		 * Timer configuration for exams
		 */
		timer: {
			/**
			 * Enable timer for exams
			 * @default true - Exams are typically timed
			 */
			enabled: true,

			/**
			 * Default time limit in minutes
			 * @default 60 - Standard exam duration
			 */
			defaultLimit: 60,

			/**
			 * Show timer warning when time is running low
			 * @default true
			 */
			showWarning: true,

			/**
			 * Warning threshold in minutes
			 * Triggers visual/audio warning when time drops below this value
			 * @default 5
			 */
			warningThreshold: 5
		}
	},

	/**
	 * Progress Tracking Configuration
	 *
	 * Settings for tracking and displaying user progress through content.
	 */
	progressTracking: {
		/**
		 * Completion threshold percentage
		 *
		 * Minimum score/completion to mark content as "completed"
		 * @default 70 - C grade equivalent
		 */
		completionThreshold: 70,

		/**
		 * Mastery threshold percentage
		 *
		 * Score required to mark content as "mastered"
		 * @default 90 - A grade equivalent
		 */
		masteryThreshold: 90,

		/**
		 * Enable progress persistence
		 *
		 * Save progress to localStorage for resume capability
		 * @default true
		 */
		enablePersistence: true,

		/**
		 * Progress persistence key prefix
		 *
		 * localStorage key prefix for storing progress data
		 * @default "progress_"
		 */
		persistenceKeyPrefix: "progress_"
	},

	/**
	 * Pagination Configuration
	 *
	 * General pagination behavior for multi-page content.
	 */
	pagination: {
		/**
		 * Enable keyboard navigation
		 *
		 * Allow arrow keys to navigate between pages
		 * @default true
		 */
		enableKeyboardNav: true,

		/**
		 * Enable swipe gestures on mobile
		 *
		 * Allow swipe left/right to navigate pages
		 * @default true
		 */
		enableSwipeGestures: true,

		/**
		 * Show page indicators (dots/numbers)
		 *
		 * Display visual indicators for current page
		 * @default true
		 */
		showPageIndicators: true,

		/**
		 * Animation duration in milliseconds
		 *
		 * Page transition animation speed
		 * @default 300
		 */
		animationDuration: 300
	}
};
