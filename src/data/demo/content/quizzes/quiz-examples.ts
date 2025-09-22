/**
 * @file Comprehensive Quiz Library for Cloud-Native Learning Platform
 * @description Educational quiz content covering cloud fundamentals, containers,
 * microservices, DevOps practices, and security monitoring across multiple difficulty levels.
 *
 * This library provides a foundation for developing and testing interactive quiz components
 * with support for various question formats and comprehensive configuration options.
 */

// =============================================================================
// TYPESCRIPT INTERFACES - ROBUST AND EXTENSIBLE QUIZ DATA MODELING
// =============================================================================

// Import centralized types instead of defining duplicates
import type { ContentStatus, ContentDifficulty, QuestionType } from "$lib/types";
import { CONTENT_DIFFICULTIES, QUESTION_TYPES } from "$lib/types";

/**
 * Quiz categories for topic-based organization
 */
export enum QuizCategory {
	CLOUD_FUNDAMENTALS = "cloud_fundamentals",
	CONTAINER_TECHNOLOGIES = "container_technologies",
	MICROSERVICES_ARCHITECTURE = "microservices_architecture",
	DEVOPS_PRACTICES = "devops_practices",
	SECURITY_MONITORING = "security_monitoring"
}

/**
 * Base interface for all question types with common properties
 */
export interface BaseQuizQuestion {
	id: string;
	type: QuestionType;
	question: string;
	explanation: string;
	points: number;
	category: QuizCategory;
	difficulty: ContentDifficulty;
	tags: string[];
}

/**
 * Multiple choice question with single or multiple correct answers
 */
export interface MultipleChoiceQuestion extends BaseQuizQuestion {
	type: "multiple_choice";
	options: string[];
	correct: number | number[]; // Single choice (number) or multiple choice (array)
	multipleSelection: boolean; // Indicates if multiple answers are allowed
}

/**
 * True/False question format
 */
export interface TrueFalseQuestion extends BaseQuizQuestion {
	type: "true_false";
	correct: boolean;
	statement: string;
}

/**
 * Drag and drop question with items to match
 */
export interface DragAndDropQuestion extends BaseQuizQuestion {
	type: "drag_and_drop";
	items: Array<{
		id: string;
		content: string;
		category: string;
	}>;
	targets: Array<{
		id: string;
		label: string;
		acceptsItems: string[]; // Array of item IDs that belong in this target
	}>;
	correctMatches: Array<{
		itemId: string;
		targetId: string;
	}>;
}

/**
 * Code completion question with code snippets
 */
export interface CodeCompletionQuestion extends BaseQuizQuestion {
	type: "code_completion";
	codeSnippet: string;
	language: string;
	blanks: Array<{
		id: string;
		position: number; // Character position in code where blank appears
		options: string[];
		correct: number;
	}>;
}

/**
 * Discriminated union of all question types for type safety
 */
export type QuizQuestion =
	| MultipleChoiceQuestion
	| TrueFalseQuestion
	| DragAndDropQuestion
	| CodeCompletionQuestion;

/**
 * Quiz timing configuration options
 */
export interface QuizTiming {
	timeLimit?: number; // Time limit in minutes (optional)
	showTimer: boolean; // Whether to display countdown timer
	warningThreshold?: number; // Minutes before warning is shown
}

/**
 * Quiz scoring and grading configuration
 */
export interface QuizScoring {
	passingScore: number; // Percentage required to pass (0-100)
	maxAttempts?: number; // Maximum attempts allowed (optional)
	showCorrectAnswers: boolean; // Show correct answers after completion
	partialCredit: boolean; // Allow partial credit for multi-part questions
}

/**
 * Progress tracking configuration
 */
export interface ProgressTracking {
	saveProgress: boolean; // Save progress between sessions
	allowReview: boolean; // Allow reviewing questions before submission
	randomizeQuestions: boolean; // Randomize question order
	randomizeOptions: boolean; // Randomize option order for multiple choice
}

/**
 * Comprehensive quiz configuration interface
 */
export interface QuizConfig {
	timing: QuizTiming;
	scoring: QuizScoring;
	progress: ProgressTracking;
	accessibility: {
		highContrast: boolean;
		screenReaderSupport: boolean;
		keyboardNavigation: boolean;
	};
}

/**
 * Main quiz interface containing metadata and questions
 */
export interface Quiz {
	id: string;
	title: string;
	description: string;
	category: QuizCategory;
	difficulty: ContentDifficulty;
	estimatedTime: number; // Minutes
	prerequisites: string[];
	learningObjectives: string[];
	config: QuizConfig;
	questions: QuizQuestion[];
	status: ContentStatus;
	version: string;
	createdAt: string;
	updatedAt: string;
}

// =============================================================================
// COMPREHENSIVE QUIZ LIBRARY - 15+ EDUCATIONAL QUIZZES
// =============================================================================

/**
 * Cloud Fundamentals Quizzes
 */

export const cloudBasicsQuiz: Quiz = {
	id: "cloud-basics-001",
	title: "Cloud Computing Fundamentals",
	description:
		"Essential concepts of cloud computing including service models, deployment types, and core characteristics.",
	category: QuizCategory.CLOUD_FUNDAMENTALS,
	difficulty: "beginner",
	estimatedTime: 15,
	prerequisites: ["Basic understanding of computing concepts"],
	learningObjectives: [
		"Understand cloud service models (IaaS, PaaS, SaaS)",
		"Identify cloud deployment models",
		"Recognize key cloud characteristics"
	],
	config: {
		timing: {
			timeLimit: 20,
			showTimer: true,
			warningThreshold: 5
		},
		scoring: {
			passingScore: 70,
			maxAttempts: 3,
			showCorrectAnswers: true,
			partialCredit: false
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: false,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "cf-001",
			type: "multiple_choice",
			question: "Which of the following best describes Infrastructure as a Service (IaaS)?",
			options: [
				"Provides complete applications over the internet",
				"Offers virtualized computing resources over the internet",
				"Delivers development platforms and tools",
				"Manages only database services"
			],
			correct: 1,
			multipleSelection: false,
			explanation:
				"IaaS provides virtualized computing resources including servers, storage, and networking infrastructure that users can provision and manage.",
			points: 10,
			category: QuizCategory.CLOUD_FUNDAMENTALS,
			difficulty: "beginner",
			tags: ["iaas", "service-models", "infrastructure"]
		},
		{
			id: "cf-002",
			type: "true_false",
			question: "Public clouds are always less secure than private clouds.",
			statement: "Public clouds are always less secure than private clouds.",
			correct: false,
			explanation:
				"Security depends on implementation and management practices, not just the deployment model. Major public cloud providers often have more resources for security than individual organizations.",
			points: 10,
			category: QuizCategory.CLOUD_FUNDAMENTALS,
			difficulty: "beginner",
			tags: ["security", "public-cloud", "private-cloud"]
		},
		{
			id: "cf-003",
			type: "multiple_choice",
			question:
				"Which characteristics are essential features of cloud computing? (Select all that apply)",
			options: [
				"On-demand self-service",
				"Broad network access",
				"Resource pooling",
				"Physical server ownership"
			],
			correct: [0, 1, 2],
			multipleSelection: true,
			explanation:
				"The five essential characteristics of cloud computing are: on-demand self-service, broad network access, resource pooling, rapid elasticity, and measured service. Physical server ownership contradicts the cloud model.",
			points: 15,
			category: QuizCategory.CLOUD_FUNDAMENTALS,
			difficulty: "intermediate",
			tags: ["characteristics", "nist", "cloud-definition"]
		},
		{
			id: "cf-004",
			type: "drag_and_drop",
			question: "Match each cloud service model with its appropriate description:",
			items: [
				{ id: "iaas-item", content: "Virtual machines and storage", category: "service" },
				{ id: "paas-item", content: "Development platforms and tools", category: "service" },
				{ id: "saas-item", content: "Complete applications like Gmail", category: "service" }
			],
			targets: [
				{
					id: "iaas-target",
					label: "Infrastructure as a Service (IaaS)",
					acceptsItems: ["iaas-item"]
				},
				{ id: "paas-target", label: "Platform as a Service (PaaS)", acceptsItems: ["paas-item"] },
				{ id: "saas-target", label: "Software as a Service (SaaS)", acceptsItems: ["saas-item"] }
			],
			correctMatches: [
				{ itemId: "iaas-item", targetId: "iaas-target" },
				{ itemId: "paas-item", targetId: "paas-target" },
				{ itemId: "saas-item", targetId: "saas-target" }
			],
			explanation:
				"Each service model provides different levels of abstraction: IaaS provides infrastructure, PaaS provides development platforms, and SaaS provides complete applications.",
			points: 20,
			category: QuizCategory.CLOUD_FUNDAMENTALS,
			difficulty: "intermediate",
			tags: ["service-models", "iaas", "paas", "saas"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T10:00:00Z",
	updatedAt: "2024-01-15T10:00:00Z"
};

export const cloudSecurityBasicsQuiz: Quiz = {
	id: "cloud-security-001",
	title: "Cloud Security Fundamentals",
	description:
		"Core security principles and practices for cloud environments including shared responsibility and common threats.",
	category: QuizCategory.CLOUD_FUNDAMENTALS,
	difficulty: "intermediate",
	estimatedTime: 18,
	prerequisites: ["Cloud computing basics", "Basic security concepts"],
	learningObjectives: [
		"Understand shared responsibility model",
		"Identify common cloud security threats",
		"Apply security best practices"
	],
	config: {
		timing: {
			timeLimit: 25,
			showTimer: true,
			warningThreshold: 5
		},
		scoring: {
			passingScore: 75,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "cs-001",
			type: "multiple_choice",
			question:
				"In the cloud shared responsibility model, who is responsible for securing data in transit?",
			options: [
				"Cloud provider only",
				"Customer only",
				"Both cloud provider and customer",
				"Third-party security vendor"
			],
			correct: 2,
			multipleSelection: false,
			explanation:
				"Data in transit security is a shared responsibility. The cloud provider secures the underlying network infrastructure, while customers must implement proper encryption and secure protocols.",
			points: 15,
			category: QuizCategory.CLOUD_FUNDAMENTALS,
			difficulty: "intermediate",
			tags: ["shared-responsibility", "data-transit", "encryption"]
		},
		{
			id: "cs-002",
			type: "true_false",
			question: "Multi-factor authentication should be enabled for all cloud service accounts.",
			statement: "Multi-factor authentication should be enabled for all cloud service accounts.",
			correct: true,
			explanation:
				"MFA is a critical security control that should be enabled for all accounts, especially privileged accounts, to prevent unauthorized access even if passwords are compromised.",
			points: 10,
			category: QuizCategory.CLOUD_FUNDAMENTALS,
			difficulty: "beginner",
			tags: ["mfa", "authentication", "access-control"]
		},
		{
			id: "cs-003",
			type: "multiple_choice",
			question: "Which are common cloud security threats? (Select all that apply)",
			options: ["Data breaches", "Insecure APIs", "Account hijacking", "Unlimited bandwidth usage"],
			correct: [0, 1, 2],
			multipleSelection: true,
			explanation:
				"Data breaches, insecure APIs, and account hijacking are major cloud security threats. Unlimited bandwidth usage is a cost concern but not primarily a security threat.",
			points: 20,
			category: QuizCategory.CLOUD_FUNDAMENTALS,
			difficulty: "intermediate",
			tags: ["threats", "data-breach", "api-security", "account-security"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T11:00:00Z",
	updatedAt: "2024-01-15T11:00:00Z"
};

/**
 * Container Technologies Quizzes
 */

export const dockerBasicsQuiz: Quiz = {
	id: "docker-basics-001",
	title: "Docker Fundamentals",
	description:
		"Essential Docker concepts including containers, images, and basic Docker commands for containerization.",
	category: QuizCategory.CONTAINER_TECHNOLOGIES,
	difficulty: "beginner",
	estimatedTime: 20,
	prerequisites: ["Basic command line knowledge", "Understanding of virtualization concepts"],
	learningObjectives: [
		"Understand Docker containers and images",
		"Learn basic Docker commands",
		"Comprehend containerization benefits"
	],
	config: {
		timing: {
			timeLimit: 30,
			showTimer: true,
			warningThreshold: 10
		},
		scoring: {
			passingScore: 70,
			maxAttempts: 3,
			showCorrectAnswers: true,
			partialCredit: false
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: false,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "db-001",
			type: "multiple_choice",
			question: "What is the difference between a Docker image and a Docker container?",
			options: [
				"They are the same thing",
				"An image is a running instance of a container",
				"A container is a running instance of an image",
				"Images are stored locally, containers are stored remotely"
			],
			correct: 2,
			multipleSelection: false,
			explanation:
				"A Docker image is a read-only template that contains application code and dependencies. A container is a running instance of an image with its own filesystem, processes, and network.",
			points: 15,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "beginner",
			tags: ["docker", "images", "containers", "fundamentals"]
		},
		{
			id: "db-002",
			type: "code_completion",
			question: "Complete this Dockerfile to create a Node.js application container:",
			codeSnippet: `FROM node:18
WORKDIR /app
COPY package*.json ./
_____ npm install
COPY . .
_____ 3000
CMD ["node", "server.js"]`,
			language: "dockerfile",
			blanks: [
				{
					id: "blank-1",
					position: 58,
					options: ["RUN", "COPY", "ADD", "CMD"],
					correct: 0
				},
				{
					id: "blank-2",
					position: 98,
					options: ["EXPOSE", "PORT", "LISTEN", "BIND"],
					correct: 0
				}
			],
			explanation:
				"RUN executes commands during image build (like npm install), and EXPOSE documents which ports the container will listen on.",
			points: 20,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "intermediate",
			tags: ["dockerfile", "nodejs", "build", "ports"]
		},
		{
			id: "db-003",
			type: "true_false",
			question: "Docker containers share the host operating system kernel.",
			statement: "Docker containers share the host operating system kernel.",
			correct: true,
			explanation:
				"Unlike virtual machines, Docker containers share the host OS kernel, making them more lightweight and efficient in resource usage.",
			points: 10,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "beginner",
			tags: ["kernel", "virtualization", "efficiency"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T12:00:00Z",
	updatedAt: "2024-01-15T12:00:00Z"
};

export const kubernetesBasicsQuiz: Quiz = {
	id: "kubernetes-basics-001",
	title: "Kubernetes Fundamentals",
	description:
		"Core Kubernetes concepts including pods, services, deployments, and cluster architecture.",
	category: QuizCategory.CONTAINER_TECHNOLOGIES,
	difficulty: "intermediate",
	estimatedTime: 25,
	prerequisites: ["Docker knowledge", "Basic containerization concepts", "YAML syntax"],
	learningObjectives: [
		"Understand Kubernetes architecture",
		"Learn about pods and services",
		"Grasp deployment and scaling concepts"
	],
	config: {
		timing: {
			timeLimit: 35,
			showTimer: true,
			warningThreshold: 10
		},
		scoring: {
			passingScore: 75,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "kb-001",
			type: "drag_and_drop",
			question: "Match each Kubernetes component with its primary function:",
			items: [
				{ id: "pod-item", content: "Smallest deployable unit", category: "component" },
				{ id: "service-item", content: "Network abstraction for pods", category: "component" },
				{
					id: "deployment-item",
					content: "Manages replica sets and updates",
					category: "component"
				},
				{ id: "configmap-item", content: "Stores configuration data", category: "component" }
			],
			targets: [
				{ id: "pod-target", label: "Pod", acceptsItems: ["pod-item"] },
				{ id: "service-target", label: "Service", acceptsItems: ["service-item"] },
				{ id: "deployment-target", label: "Deployment", acceptsItems: ["deployment-item"] },
				{ id: "configmap-target", label: "ConfigMap", acceptsItems: ["configmap-item"] }
			],
			correctMatches: [
				{ itemId: "pod-item", targetId: "pod-target" },
				{ itemId: "service-item", targetId: "service-target" },
				{ itemId: "deployment-item", targetId: "deployment-target" },
				{ itemId: "configmap-item", targetId: "configmap-target" }
			],
			explanation:
				"Each Kubernetes object serves a specific purpose: Pods run containers, Services provide networking, Deployments manage scaling and updates, and ConfigMaps store configuration.",
			points: 25,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "intermediate",
			tags: ["kubernetes", "pods", "services", "deployments", "configmap"]
		},
		{
			id: "kb-002",
			type: "multiple_choice",
			question: "Which components make up the Kubernetes control plane? (Select all that apply)",
			options: ["kube-apiserver", "etcd", "kube-scheduler", "kubelet"],
			correct: [0, 1, 2],
			multipleSelection: true,
			explanation:
				"The control plane consists of kube-apiserver, etcd, kube-scheduler, and kube-controller-manager. Kubelet runs on worker nodes, not in the control plane.",
			points: 20,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "intermediate",
			tags: ["control-plane", "architecture", "components"]
		},
		{
			id: "kb-003",
			type: "code_completion",
			question: "Complete this Kubernetes Deployment YAML:",
			codeSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: _____
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:_____
        ports:
        - containerPort: _____`,
			language: "yaml",
			blanks: [
				{
					id: "blank-1",
					position: 95,
					options: ["3", "1", "5", "10"],
					correct: 0
				},
				{
					id: "blank-2",
					position: 280,
					options: ["latest", "1.20", "alpine", "stable"],
					correct: 1
				},
				{
					id: "blank-3",
					position: 340,
					options: ["80", "443", "8080", "3000"],
					correct: 0
				}
			],
			explanation:
				"This deployment creates 3 replicas of nginx containers using version 1.20, exposing port 80 which is the default HTTP port for nginx.",
			points: 25,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "intermediate",
			tags: ["yaml", "deployment", "nginx", "replicas"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T13:00:00Z",
	updatedAt: "2024-01-15T13:00:00Z"
};

export const containerOrchestrationQuiz: Quiz = {
	id: "container-orchestration-001",
	title: "Container Orchestration Advanced Concepts",
	description:
		"Advanced container orchestration patterns including service mesh, ingress controllers, and multi-cluster management.",
	category: QuizCategory.CONTAINER_TECHNOLOGIES,
	difficulty: "advanced",
	estimatedTime: 30,
	prerequisites: ["Kubernetes fundamentals", "Docker expertise", "Networking basics"],
	learningObjectives: [
		"Master advanced orchestration patterns",
		"Understand service mesh architecture",
		"Learn multi-cluster strategies"
	],
	config: {
		timing: {
			timeLimit: 45,
			showTimer: true,
			warningThreshold: 15
		},
		scoring: {
			passingScore: 80,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "co-001",
			type: "multiple_choice",
			question:
				"What are the primary benefits of implementing a service mesh in a microservices architecture?",
			options: [
				"Simplified service discovery and load balancing",
				"Enhanced security with mTLS and traffic encryption",
				"Improved observability with distributed tracing",
				"All of the above"
			],
			correct: 3,
			multipleSelection: false,
			explanation:
				"Service mesh provides comprehensive benefits including service discovery, security through mTLS, observability with tracing and metrics, traffic management, and policy enforcement.",
			points: 20,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "advanced",
			tags: ["service-mesh", "microservices", "mtls", "observability"]
		},
		{
			id: "co-002",
			type: "true_false",
			question:
				"Istio service mesh requires modification of application code to implement traffic routing policies.",
			statement:
				"Istio service mesh requires modification of application code to implement traffic routing policies.",
			correct: false,
			explanation:
				"Istio operates at the infrastructure level using sidecar proxies (Envoy), allowing traffic management, security, and observability without modifying application code.",
			points: 15,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "advanced",
			tags: ["istio", "sidecar", "traffic-routing", "infrastructure"]
		},
		{
			id: "co-003",
			type: "multiple_choice",
			question:
				"Which strategies are recommended for managing secrets in container orchestration? (Select all that apply)",
			options: [
				"Store secrets in container images",
				"Use Kubernetes Secrets with encryption at rest",
				"Implement external secret management systems",
				"Mount secrets as files instead of environment variables"
			],
			correct: [1, 2, 3],
			multipleSelection: true,
			explanation:
				"Best practices include using Kubernetes Secrets with encryption, external secret managers like HashiCorp Vault, and mounting secrets as files. Never store secrets in container images.",
			points: 25,
			category: QuizCategory.CONTAINER_TECHNOLOGIES,
			difficulty: "advanced",
			tags: ["secrets", "security", "encryption", "vault"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T14:00:00Z",
	updatedAt: "2024-01-15T14:00:00Z"
};

/**
 * Microservices Architecture Quizzes
 */

export const microservicesBasicsQuiz: Quiz = {
	id: "microservices-basics-001",
	title: "Microservices Architecture Fundamentals",
	description:
		"Core principles of microservices design including decomposition strategies, communication patterns, and data management.",
	category: QuizCategory.MICROSERVICES_ARCHITECTURE,
	difficulty: "beginner",
	estimatedTime: 22,
	prerequisites: ["Distributed systems basics", "API concepts", "Database fundamentals"],
	learningObjectives: [
		"Understand microservices principles",
		"Learn service decomposition strategies",
		"Grasp communication patterns"
	],
	config: {
		timing: {
			timeLimit: 30,
			showTimer: true,
			warningThreshold: 8
		},
		scoring: {
			passingScore: 70,
			maxAttempts: 3,
			showCorrectAnswers: true,
			partialCredit: false
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: false,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "mb-001",
			type: "multiple_choice",
			question: "What is the primary advantage of microservices over monolithic architecture?",
			options: [
				"Simpler deployment process",
				"Lower operational complexity",
				"Independent service scaling and development",
				"Reduced network communication"
			],
			correct: 2,
			multipleSelection: false,
			explanation:
				"Microservices enable teams to develop, deploy, and scale services independently, allowing for faster development cycles and technology diversity.",
			points: 15,
			category: QuizCategory.MICROSERVICES_ARCHITECTURE,
			difficulty: "beginner",
			tags: ["microservices", "monolith", "scaling", "independence"]
		},
		{
			id: "mb-002",
			type: "drag_and_drop",
			question: "Match each communication pattern with its appropriate use case:",
			items: [
				{ id: "sync-item", content: "Real-time user requests", category: "pattern" },
				{ id: "async-item", content: "Event notifications", category: "pattern" },
				{ id: "pubsub-item", content: "Broadcasting updates", category: "pattern" },
				{ id: "request-reply-item", content: "Data queries", category: "pattern" }
			],
			targets: [
				{
					id: "sync-target",
					label: "Synchronous HTTP/REST",
					acceptsItems: ["sync-item", "request-reply-item"]
				},
				{ id: "async-target", label: "Asynchronous Messaging", acceptsItems: ["async-item"] },
				{ id: "pubsub-target", label: "Publish-Subscribe", acceptsItems: ["pubsub-item"] }
			],
			correctMatches: [
				{ itemId: "sync-item", targetId: "sync-target" },
				{ itemId: "async-item", targetId: "async-target" },
				{ itemId: "pubsub-item", targetId: "pubsub-target" },
				{ itemId: "request-reply-item", targetId: "sync-target" }
			],
			explanation:
				"Synchronous communication works for real-time requests and queries, asynchronous messaging for event notifications, and pub-sub for broadcasting updates to multiple subscribers.",
			points: 20,
			category: QuizCategory.MICROSERVICES_ARCHITECTURE,
			difficulty: "intermediate",
			tags: ["communication", "patterns", "synchronous", "asynchronous"]
		},
		{
			id: "mb-003",
			type: "true_false",
			question:
				"In microservices architecture, services should share databases to ensure data consistency.",
			statement:
				"In microservices architecture, services should share databases to ensure data consistency.",
			correct: false,
			explanation:
				"Each microservice should own its data and have its own database to maintain loose coupling and service independence. Data consistency is achieved through eventual consistency patterns.",
			points: 15,
			category: QuizCategory.MICROSERVICES_ARCHITECTURE,
			difficulty: "intermediate",
			tags: ["database", "data-ownership", "coupling", "consistency"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T15:00:00Z",
	updatedAt: "2024-01-15T15:00:00Z"
};

export const microservicesPatternsQuiz: Quiz = {
	id: "microservices-patterns-001",
	title: "Microservices Design Patterns",
	description:
		"Advanced microservices patterns including circuit breaker, saga, CQRS, and event sourcing for resilient distributed systems.",
	category: QuizCategory.MICROSERVICES_ARCHITECTURE,
	difficulty: "advanced",
	estimatedTime: 28,
	prerequisites: [
		"Microservices basics",
		"Distributed systems patterns",
		"Event-driven architecture"
	],
	learningObjectives: [
		"Master resilience patterns",
		"Understand data management patterns",
		"Apply observability patterns"
	],
	config: {
		timing: {
			timeLimit: 40,
			showTimer: true,
			warningThreshold: 12
		},
		scoring: {
			passingScore: 80,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "mp-001",
			type: "multiple_choice",
			question:
				"Which pattern helps prevent cascading failures when a downstream service becomes unresponsive?",
			options: ["Bulkhead Pattern", "Circuit Breaker Pattern", "Retry Pattern", "Timeout Pattern"],
			correct: 1,
			multipleSelection: false,
			explanation:
				"Circuit Breaker Pattern monitors failures and 'opens' to prevent calls to failing services, allowing them to recover while protecting upstream services from cascading failures.",
			points: 20,
			category: QuizCategory.MICROSERVICES_ARCHITECTURE,
			difficulty: "advanced",
			tags: ["circuit-breaker", "resilience", "failure-handling", "patterns"]
		},
		{
			id: "mp-002",
			type: "multiple_choice",
			question:
				"What are the key benefits of implementing the CQRS pattern? (Select all that apply)",
			options: [
				"Simplified data model",
				"Independent scaling of read and write operations",
				"Optimized queries for different use cases",
				"Reduced complexity in business logic"
			],
			correct: [1, 2],
			multipleSelection: true,
			explanation:
				"CQRS (Command Query Responsibility Segregation) allows independent scaling and optimization of read and write operations, enabling different data models optimized for specific use cases.",
			points: 25,
			category: QuizCategory.MICROSERVICES_ARCHITECTURE,
			difficulty: "advanced",
			tags: ["cqrs", "scaling", "optimization", "separation"]
		},
		{
			id: "mp-003",
			type: "code_completion",
			question: "Complete this implementation of a basic circuit breaker pattern:",
			codeSnippet: `class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = '_____';
    this.nextAttempt = Date.now();
  }

  async call(service) {
    if (this.state === 'OPEN') {
      if (this.nextAttempt <= Date.now()) {
        this.state = '_____';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await service();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}`,
			language: "javascript",
			blanks: [
				{
					id: "blank-1",
					position: 140,
					options: ["CLOSED", "OPEN", "HALF_OPEN", "ACTIVE"],
					correct: 0
				},
				{
					id: "blank-2",
					position: 280,
					options: ["HALF_OPEN", "CLOSED", "RETRY", "TESTING"],
					correct: 0
				}
			],
			explanation:
				"Circuit breaker starts in CLOSED state (allowing calls). When failures exceed threshold, it opens. After timeout, it moves to HALF_OPEN to test if service has recovered.",
			points: 30,
			category: QuizCategory.MICROSERVICES_ARCHITECTURE,
			difficulty: "advanced",
			tags: ["circuit-breaker", "implementation", "states", "javascript"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T16:00:00Z",
	updatedAt: "2024-01-15T16:00:00Z"
};

/**
 * DevOps Practices Quizzes
 */

export const cicdBasicsQuiz: Quiz = {
	id: "cicd-basics-001",
	title: "CI/CD Pipeline Fundamentals",
	description:
		"Essential concepts of Continuous Integration and Continuous Deployment including pipeline design, automation, and best practices.",
	category: QuizCategory.DEVOPS_PRACTICES,
	difficulty: "beginner",
	estimatedTime: 20,
	prerequisites: ["Version control basics", "Software development lifecycle", "Basic scripting"],
	learningObjectives: [
		"Understand CI/CD principles",
		"Learn pipeline design patterns",
		"Apply automation best practices"
	],
	config: {
		timing: {
			timeLimit: 28,
			showTimer: true,
			warningThreshold: 8
		},
		scoring: {
			passingScore: 70,
			maxAttempts: 3,
			showCorrectAnswers: true,
			partialCredit: false
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: false,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "cd-001",
			type: "multiple_choice",
			question: "What is the primary goal of Continuous Integration (CI)?",
			options: [
				"Automate deployment to production",
				"Integrate code changes frequently and detect issues early",
				"Monitor application performance",
				"Manage infrastructure as code"
			],
			correct: 1,
			multipleSelection: false,
			explanation:
				"CI focuses on integrating code changes frequently (multiple times per day) and running automated tests to detect integration issues and bugs as early as possible in the development cycle.",
			points: 15,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "beginner",
			tags: ["ci", "integration", "testing", "automation"]
		},
		{
			id: "cd-002",
			type: "drag_and_drop",
			question: "Arrange these CI/CD pipeline stages in the correct order:",
			items: [
				{ id: "build-item", content: "Build & Compile", category: "stage" },
				{ id: "test-item", content: "Automated Testing", category: "stage" },
				{ id: "deploy-item", content: "Deploy to Production", category: "stage" },
				{ id: "source-item", content: "Source Code Commit", category: "stage" }
			],
			targets: [
				{ id: "stage-1", label: "Stage 1", acceptsItems: ["source-item"] },
				{ id: "stage-2", label: "Stage 2", acceptsItems: ["build-item"] },
				{ id: "stage-3", label: "Stage 3", acceptsItems: ["test-item"] },
				{ id: "stage-4", label: "Stage 4", acceptsItems: ["deploy-item"] }
			],
			correctMatches: [
				{ itemId: "source-item", targetId: "stage-1" },
				{ itemId: "build-item", targetId: "stage-2" },
				{ itemId: "test-item", targetId: "stage-3" },
				{ itemId: "deploy-item", targetId: "stage-4" }
			],
			explanation:
				"A typical CI/CD pipeline follows: 1) Source code commit triggers the pipeline, 2) Build and compile the application, 3) Run automated tests, 4) Deploy to production if all stages pass.",
			points: 20,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "beginner",
			tags: ["pipeline", "stages", "workflow", "sequence"]
		},
		{
			id: "cd-003",
			type: "true_false",
			question:
				"Feature branches should be long-lived to allow thorough development before integration.",
			statement:
				"Feature branches should be long-lived to allow thorough development before integration.",
			correct: false,
			explanation:
				"CI practices encourage short-lived feature branches that are integrated frequently to reduce merge conflicts and integration complexity. Long-lived branches contradict CI principles.",
			points: 15,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "intermediate",
			tags: ["branching", "integration", "feature-branches", "version-control"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T17:00:00Z",
	updatedAt: "2024-01-15T17:00:00Z"
};

export const infrastructureAsCodeQuiz: Quiz = {
	id: "iac-001",
	title: "Infrastructure as Code Fundamentals",
	description:
		"Core concepts of Infrastructure as Code including declarative vs imperative approaches, state management, and popular IaC tools.",
	category: QuizCategory.DEVOPS_PRACTICES,
	difficulty: "intermediate",
	estimatedTime: 25,
	prerequisites: ["Cloud computing basics", "YAML/JSON syntax", "Version control concepts"],
	learningObjectives: [
		"Understand IaC principles and benefits",
		"Compare IaC tools and approaches",
		"Learn state management concepts"
	],
	config: {
		timing: {
			timeLimit: 35,
			showTimer: true,
			warningThreshold: 10
		},
		scoring: {
			passingScore: 75,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "iac-001",
			type: "multiple_choice",
			question: "What are the key benefits of Infrastructure as Code? (Select all that apply)",
			options: [
				"Version control for infrastructure changes",
				"Consistent and repeatable deployments",
				"Reduced manual configuration errors",
				"Faster manual provisioning processes"
			],
			correct: [0, 1, 2],
			multipleSelection: true,
			explanation:
				"IaC provides version control, consistency, repeatability, and reduces manual errors through automation. It doesn't improve manual processes but replaces them with automated ones.",
			points: 20,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "intermediate",
			tags: ["iac", "benefits", "automation", "consistency"]
		},
		{
			id: "iac-002",
			type: "code_completion",
			question: "Complete this Terraform configuration for an AWS S3 bucket:",
			codeSnippet: `resource "aws_s3_bucket" "example" {
  bucket = "my-terraform-bucket"
}

resource "aws_s3_bucket_versioning" "example" {
  bucket = aws_s3_bucket.example._____
  versioning_configuration {
    status = "_____"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "_____"
    }
  }
}`,
			language: "hcl",
			blanks: [
				{
					id: "blank-1",
					position: 130,
					options: ["id", "arn", "name", "bucket"],
					correct: 0
				},
				{
					id: "blank-2",
					position: 190,
					options: ["Enabled", "Disabled", "Suspended", "Active"],
					correct: 0
				},
				{
					id: "blank-3",
					position: 380,
					options: ["AES256", "KMS", "SSE-S3", "NONE"],
					correct: 0
				}
			],
			explanation:
				"Terraform resource references use 'id' for bucket identification, versioning status should be 'Enabled' for version control, and AES256 provides standard S3 encryption.",
			points: 25,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "intermediate",
			tags: ["terraform", "aws", "s3", "encryption", "versioning"]
		},
		{
			id: "iac-003",
			type: "true_false",
			question:
				"Terraform state files should be stored in version control alongside the configuration code.",
			statement:
				"Terraform state files should be stored in version control alongside the configuration code.",
			correct: false,
			explanation:
				"Terraform state files contain sensitive information and can cause conflicts. They should be stored in remote backends like S3 with state locking, not in version control.",
			points: 15,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "intermediate",
			tags: ["terraform", "state", "security", "remote-backend"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T18:00:00Z",
	updatedAt: "2024-01-15T18:00:00Z"
};

export const devopsAdvancedQuiz: Quiz = {
	id: "devops-advanced-001",
	title: "Advanced DevOps Practices",
	description:
		"Advanced DevOps concepts including GitOps, chaos engineering, progressive delivery, and site reliability engineering practices.",
	category: QuizCategory.DEVOPS_PRACTICES,
	difficulty: "advanced",
	estimatedTime: 30,
	prerequisites: [
		"CI/CD expertise",
		"Infrastructure as Code",
		"Monitoring and observability",
		"Kubernetes knowledge"
	],
	learningObjectives: [
		"Master GitOps workflow patterns",
		"Understand chaos engineering principles",
		"Implement progressive delivery strategies"
	],
	config: {
		timing: {
			timeLimit: 45,
			showTimer: true,
			warningThreshold: 15
		},
		scoring: {
			passingScore: 80,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "da-001",
			type: "multiple_choice",
			question: "What is the core principle of GitOps deployment methodology?",
			options: [
				"Git repositories serve as the single source of truth for infrastructure and applications",
				"All deployments must be triggered manually through Git commits",
				"Git is only used for application code, not infrastructure",
				"Deployments are managed through traditional CI/CD pipelines"
			],
			correct: 0,
			multipleSelection: false,
			explanation:
				"GitOps treats Git repositories as the single source of truth for both infrastructure and application configurations, with automated systems continuously reconciling the actual state with the desired state defined in Git.",
			points: 20,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "advanced",
			tags: ["gitops", "deployment", "git", "automation"]
		},
		{
			id: "da-002",
			type: "multiple_choice",
			question:
				"Which chaos engineering practices help improve system resilience? (Select all that apply)",
			options: [
				"Randomly terminating service instances",
				"Simulating network latency and packet loss",
				"Disabling monitoring systems during experiments",
				"Injecting CPU and memory stress"
			],
			correct: [0, 1, 3],
			multipleSelection: true,
			explanation:
				"Chaos engineering involves controlled experiments like instance termination, network simulation, and resource stress testing. Disabling monitoring reduces observability and safety during experiments.",
			points: 25,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "advanced",
			tags: ["chaos-engineering", "resilience", "testing", "experiments"]
		},
		{
			id: "da-003",
			type: "drag_and_drop",
			question: "Match each progressive delivery strategy with its primary characteristic:",
			items: [
				{
					id: "blue-green-item",
					content: "Two identical production environments",
					category: "strategy"
				},
				{ id: "canary-item", content: "Gradual rollout to subset of users", category: "strategy" },
				{
					id: "feature-flag-item",
					content: "Runtime feature control without deployment",
					category: "strategy"
				},
				{ id: "rolling-item", content: "Sequential instance replacement", category: "strategy" }
			],
			targets: [
				{
					id: "blue-green-target",
					label: "Blue-Green Deployment",
					acceptsItems: ["blue-green-item"]
				},
				{ id: "canary-target", label: "Canary Release", acceptsItems: ["canary-item"] },
				{ id: "feature-flag-target", label: "Feature Flags", acceptsItems: ["feature-flag-item"] },
				{ id: "rolling-target", label: "Rolling Update", acceptsItems: ["rolling-item"] }
			],
			correctMatches: [
				{ itemId: "blue-green-item", targetId: "blue-green-target" },
				{ itemId: "canary-item", targetId: "canary-target" },
				{ itemId: "feature-flag-item", targetId: "feature-flag-target" },
				{ itemId: "rolling-item", targetId: "rolling-target" }
			],
			explanation:
				"Each progressive delivery strategy has distinct characteristics: Blue-Green uses parallel environments, Canary gradually increases traffic, Feature Flags control features at runtime, and Rolling Updates replace instances sequentially.",
			points: 30,
			category: QuizCategory.DEVOPS_PRACTICES,
			difficulty: "advanced",
			tags: [
				"progressive-delivery",
				"deployment-strategies",
				"blue-green",
				"canary",
				"feature-flags"
			]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T19:00:00Z",
	updatedAt: "2024-01-15T19:00:00Z"
};

/**
 * Security and Monitoring Quizzes
 */

export const cloudSecurityAdvancedQuiz: Quiz = {
	id: "cloud-security-advanced-001",
	title: "Advanced Cloud Security",
	description:
		"Advanced cloud security concepts including zero-trust architecture, compliance frameworks, and advanced threat protection.",
	category: QuizCategory.SECURITY_MONITORING,
	difficulty: "advanced",
	estimatedTime: 35,
	prerequisites: [
		"Cloud security basics",
		"Network security concepts",
		"Identity management",
		"Compliance frameworks"
	],
	learningObjectives: [
		"Master zero-trust security principles",
		"Understand compliance requirements",
		"Implement advanced threat protection"
	],
	config: {
		timing: {
			timeLimit: 50,
			showTimer: true,
			warningThreshold: 15
		},
		scoring: {
			passingScore: 85,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "csa-001",
			type: "multiple_choice",
			question: "What are the fundamental principles of Zero Trust security architecture?",
			options: [
				"Trust but verify all network traffic",
				"Never trust, always verify every transaction",
				"Trust internal networks, verify external access",
				"Verify once, trust for the session duration"
			],
			correct: 1,
			multipleSelection: false,
			explanation:
				"Zero Trust operates on the principle of 'never trust, always verify' - every user, device, and transaction must be authenticated and authorized regardless of location or previous trust status.",
			points: 20,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "advanced",
			tags: ["zero-trust", "authentication", "authorization", "security-architecture"]
		},
		{
			id: "csa-002",
			type: "multiple_choice",
			question:
				"Which security controls are essential for SOC 2 Type II compliance? (Select all that apply)",
			options: [
				"Access controls and authentication",
				"Data encryption in transit and at rest",
				"Continuous monitoring and logging",
				"Annual security awareness training"
			],
			correct: [0, 1, 2],
			multipleSelection: true,
			explanation:
				"SOC 2 Type II requires robust access controls, encryption, continuous monitoring, and regular auditing. While security training is important, it's not specifically mandated by SOC 2 Type II.",
			points: 25,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "advanced",
			tags: ["soc2", "compliance", "access-control", "encryption", "monitoring"]
		},
		{
			id: "csa-003",
			type: "code_completion",
			question: "Complete this AWS IAM policy that implements least privilege access:",
			codeSnippet: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "_____",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-app-bucket/*",
      "Condition": {
        "_____": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    },
    {
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "_____"
        }
      }
    }
  ]
}`,
			language: "json",
			blanks: [
				{
					id: "blank-1",
					position: 85,
					options: ["Allow", "Deny", "Grant", "Permit"],
					correct: 0
				},
				{
					id: "blank-2",
					position: 220,
					options: ["StringEquals", "StringLike", "NumericEquals", "Bool"],
					correct: 0
				},
				{
					id: "blank-3",
					position: 380,
					options: ["false", "true", "null", "undefined"],
					correct: 0
				}
			],
			explanation:
				"This policy allows specific S3 actions in us-east-1 region only, and denies all actions when MFA is not present (false), implementing least privilege and requiring MFA.",
			points: 30,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "advanced",
			tags: ["iam", "least-privilege", "mfa", "conditions", "aws"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T20:00:00Z",
	updatedAt: "2024-01-15T20:00:00Z"
};

export const observabilityQuiz: Quiz = {
	id: "observability-001",
	title: "Observability and Monitoring",
	description:
		"Comprehensive observability concepts including the three pillars of observability, distributed tracing, and SLO/SLI implementation.",
	category: QuizCategory.SECURITY_MONITORING,
	difficulty: "intermediate",
	estimatedTime: 26,
	prerequisites: ["Distributed systems basics", "Monitoring concepts", "Application performance"],
	learningObjectives: [
		"Understand the three pillars of observability",
		"Implement distributed tracing",
		"Define and measure SLOs and SLIs"
	],
	config: {
		timing: {
			timeLimit: 35,
			showTimer: true,
			warningThreshold: 10
		},
		scoring: {
			passingScore: 75,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "obs-001",
			type: "drag_and_drop",
			question: "Match each observability pillar with its primary purpose:",
			items: [
				{ id: "metrics-item", content: "Numerical measurements over time", category: "pillar" },
				{ id: "logs-item", content: "Discrete event records with context", category: "pillar" },
				{
					id: "traces-item",
					content: "Request flow through distributed systems",
					category: "pillar"
				}
			],
			targets: [
				{ id: "metrics-target", label: "Metrics", acceptsItems: ["metrics-item"] },
				{ id: "logs-target", label: "Logs", acceptsItems: ["logs-item"] },
				{ id: "traces-target", label: "Traces", acceptsItems: ["traces-item"] }
			],
			correctMatches: [
				{ itemId: "metrics-item", targetId: "metrics-target" },
				{ itemId: "logs-item", targetId: "logs-target" },
				{ itemId: "traces-item", targetId: "traces-target" }
			],
			explanation:
				"The three pillars of observability are: Metrics (time-series numerical data), Logs (structured event records), and Traces (request flow tracking across services).",
			points: 20,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "intermediate",
			tags: ["observability", "metrics", "logs", "traces", "pillars"]
		},
		{
			id: "obs-002",
			type: "multiple_choice",
			question: "What is the difference between SLI and SLO in site reliability engineering?",
			options: [
				"SLI is a target, SLO is a measurement",
				"SLI is a measurement, SLO is a target based on SLI",
				"They are the same concept with different names",
				"SLI applies to internal services, SLO applies to external services"
			],
			correct: 1,
			multipleSelection: false,
			explanation:
				"SLI (Service Level Indicator) is a quantitative measurement of service behavior, while SLO (Service Level Objective) is a target value or range for an SLI that represents desired service performance.",
			points: 20,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "intermediate",
			tags: ["sli", "slo", "sre", "reliability", "targets"]
		},
		{
			id: "obs-003",
			type: "true_false",
			question:
				"Distributed tracing requires modification of application code to inject trace context.",
			statement:
				"Distributed tracing requires modification of application code to inject trace context.",
			correct: true,
			explanation:
				"Distributed tracing requires applications to propagate trace context (trace ID, span ID) across service boundaries, typically through headers or instrumentation libraries, which requires some level of code modification.",
			points: 15,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "intermediate",
			tags: ["distributed-tracing", "instrumentation", "trace-context", "implementation"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T21:00:00Z",
	updatedAt: "2024-01-15T21:00:00Z"
};

export const incidentResponseQuiz: Quiz = {
	id: "incident-response-001",
	title: "Incident Response and Management",
	description:
		"Best practices for incident response including detection, escalation, communication, and post-incident review processes.",
	category: QuizCategory.SECURITY_MONITORING,
	difficulty: "advanced",
	estimatedTime: 32,
	prerequisites: ["Monitoring and alerting", "SRE practices", "Communication protocols"],
	learningObjectives: [
		"Master incident response workflows",
		"Understand escalation procedures",
		"Implement effective post-incident reviews"
	],
	config: {
		timing: {
			timeLimit: 45,
			showTimer: true,
			warningThreshold: 12
		},
		scoring: {
			passingScore: 80,
			maxAttempts: 2,
			showCorrectAnswers: true,
			partialCredit: true
		},
		progress: {
			saveProgress: true,
			allowReview: true,
			randomizeQuestions: true,
			randomizeOptions: true
		},
		accessibility: {
			highContrast: true,
			screenReaderSupport: true,
			keyboardNavigation: true
		}
	},
	questions: [
		{
			id: "ir-001",
			type: "multiple_choice",
			question: "What should be the first priority during a production incident?",
			options: [
				"Identify the root cause of the issue",
				"Restore service and minimize customer impact",
				"Document the incident timeline",
				"Notify all stakeholders immediately"
			],
			correct: 1,
			multipleSelection: false,
			explanation:
				"During an incident, the first priority is always to restore service and minimize customer impact. Root cause analysis and documentation come after service restoration.",
			points: 20,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "advanced",
			tags: ["incident-response", "priorities", "service-restoration", "customer-impact"]
		},
		{
			id: "ir-002",
			type: "multiple_choice",
			question:
				"Which elements are essential in an effective post-incident review? (Select all that apply)",
			options: [
				"Timeline of events and actions taken",
				"Identification of responsible individuals for blame",
				"Root cause analysis and contributing factors",
				"Action items to prevent similar incidents"
			],
			correct: [0, 2, 3],
			multipleSelection: true,
			explanation:
				"Effective post-incident reviews focus on timeline, root causes, and preventive actions. They should be blameless and focus on improving systems and processes, not assigning blame to individuals.",
			points: 25,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "advanced",
			tags: ["post-incident", "blameless", "root-cause", "prevention"]
		},
		{
			id: "ir-003",
			type: "drag_and_drop",
			question: "Arrange these incident severity levels from highest to lowest impact:",
			items: [
				{ id: "sev1-item", content: "Complete service outage", category: "severity" },
				{ id: "sev2-item", content: "Significant feature degradation", category: "severity" },
				{ id: "sev3-item", content: "Minor feature issues", category: "severity" },
				{ id: "sev4-item", content: "Cosmetic or documentation issues", category: "severity" }
			],
			targets: [
				{ id: "highest", label: "Highest Severity", acceptsItems: ["sev1-item"] },
				{ id: "high", label: "High Severity", acceptsItems: ["sev2-item"] },
				{ id: "medium", label: "Medium Severity", acceptsItems: ["sev3-item"] },
				{ id: "low", label: "Low Severity", acceptsItems: ["sev4-item"] }
			],
			correctMatches: [
				{ itemId: "sev1-item", targetId: "highest" },
				{ itemId: "sev2-item", targetId: "high" },
				{ itemId: "sev3-item", targetId: "medium" },
				{ itemId: "sev4-item", targetId: "low" }
			],
			explanation:
				"Incident severity typically follows: Sev1 (complete outage), Sev2 (significant degradation), Sev3 (minor issues), Sev4 (cosmetic issues). Each level determines response time and escalation procedures.",
			points: 25,
			category: QuizCategory.SECURITY_MONITORING,
			difficulty: "advanced",
			tags: ["severity", "classification", "escalation", "response-time"]
		}
	],
	status: "final",
	version: "1.0.0",
	createdAt: "2024-01-15T22:00:00Z",
	updatedAt: "2024-01-15T22:00:00Z"
};

// =============================================================================
// QUIZ LIBRARY EXPORTS AND UTILITIES
// =============================================================================

/**
 * Complete collection of all quizzes in the library
 */
export const allQuizzes: Quiz[] = [
	// Cloud Fundamentals
	cloudBasicsQuiz,
	cloudSecurityBasicsQuiz,

	// Container Technologies
	dockerBasicsQuiz,
	kubernetesBasicsQuiz,
	containerOrchestrationQuiz,

	// Microservices Architecture
	microservicesBasicsQuiz,
	microservicesPatternsQuiz,

	// DevOps Practices
	cicdBasicsQuiz,
	infrastructureAsCodeQuiz,
	devopsAdvancedQuiz,

	// Security and Monitoring
	cloudSecurityAdvancedQuiz,
	observabilityQuiz,
	incidentResponseQuiz
];

/**
 * Utility function to get quizzes by category
 */
export function getQuizzesByCategory(category: QuizCategory): Quiz[] {
	return allQuizzes.filter((quiz) => quiz.category === category);
}

/**
 * Utility function to get quizzes by difficulty
 */
export function getQuizzesByDifficulty(difficulty: ContentDifficulty): Quiz[] {
	return allQuizzes.filter((quiz) => quiz.difficulty === difficulty);
}

/**
 * Utility function to get quiz by ID
 */
export function getQuizById(id: string): Quiz | undefined {
	return allQuizzes.find((quiz) => quiz.id === id);
}

/**
 * Utility function to get random quiz
 */
export function getRandomQuiz(): Quiz {
	const randomIndex = Math.floor(Math.random() * allQuizzes.length);
	return allQuizzes[randomIndex];
}

/**
 * Utility function to get quiz statistics
 */
export function getQuizStatistics() {
	const stats = {
		totalQuizzes: allQuizzes.length,
		byCategory: {} as Record<QuizCategory, number>,
		byDifficulty: {} as Record<ContentDifficulty, number>,
		totalQuestions: 0,
		averageQuestionsPerQuiz: 0,
		questionTypes: {} as Record<QuestionType, number>
	};

	// Initialize counters
	Object.values(QuizCategory).forEach((category) => {
		stats.byCategory[category] = 0;
	});
	CONTENT_DIFFICULTIES.forEach((difficulty) => {
		stats.byDifficulty[difficulty] = 0;
	});
	QUESTION_TYPES.forEach((type) => {
		stats.questionTypes[type] = 0;
	});

	// Calculate statistics
	allQuizzes.forEach((quiz) => {
		stats.byCategory[quiz.category]++;
		stats.byDifficulty[quiz.difficulty]++;
		stats.totalQuestions += quiz.questions.length;

		quiz.questions.forEach((question) => {
			stats.questionTypes[question.type]++;
		});
	});

	stats.averageQuestionsPerQuiz = Math.round((stats.totalQuestions / stats.totalQuizzes) * 10) / 10;

	return stats;
}

/**
 * Validation function to ensure quiz data integrity
 */
export function validateQuizData(): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	allQuizzes.forEach((quiz) => {
		// Validate quiz structure
		if (!quiz.id || !quiz.title || !quiz.questions || quiz.questions.length === 0) {
			errors.push(`Quiz ${quiz.id || "unknown"} is missing required fields`);
		}

		// Validate questions
		quiz.questions.forEach((question, index) => {
			if (!question.id || !question.question || !question.explanation) {
				errors.push(`Question ${index + 1} in quiz ${quiz.id} is missing required fields`);
			}

			// Type-specific validations
			if (question.type === "multiple_choice") {
				const mcq = question as MultipleChoiceQuestion;
				if (!mcq.options || mcq.options.length < 2) {
					errors.push(`Multiple choice question ${question.id} needs at least 2 options`);
				}
			}

			if (question.type === "code_completion") {
				const ccq = question as CodeCompletionQuestion;
				if (!ccq.codeSnippet || !ccq.blanks || ccq.blanks.length === 0) {
					errors.push(`Code completion question ${question.id} needs code snippet and blanks`);
				}
			}
		});
	});

	return {
		isValid: errors.length === 0,
		errors
	};
}

// Export metadata for external use
export const QUIZ_LIBRARY_METADATA = {
	version: "1.0.0",
	totalQuizzes: allQuizzes.length,
	createdAt: "2024-01-15T10:00:00Z",
	lastUpdated: "2024-01-15T22:00:00Z",
	supportedQuestionTypes: QUESTION_TYPES,
	supportedCategories: Object.values(QuizCategory),
	supportedDifficulties: CONTENT_DIFFICULTIES
};
