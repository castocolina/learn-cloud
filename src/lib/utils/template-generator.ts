/**
 * Template Generator Utility
 *
 * Pure template generation utility that creates lorem ipsum content for scaffolding.
 * Contains no CLI dependencies, file I/O operations, or Core API calls - only template generation logic.
 *
 * This utility is used by the ContentScaffoldingGenerator CLI coordination layer
 * and can be reused in other contexts that need template content generation.
 *
 * Features:
 * - Pure utility functions for content template generation
 * - Diverse lorem ipsum content with cloud-native themes
 * - Random question generation with multiple types
 * - Diverse Mermaid diagram generation
 * - Code block generation with multiple languages
 * - Configurable content generation based on settings
 *
 * Architecture:
 * - TemplateGenerator (pure utility) → ContentScaffoldingGenerator (CLI coordination) → Core API
 */

import { SETTINGS } from "$config/settings.js";
import type {
	ChapterType,
	QuestionType,
	MermaidDiagramType as DiagramType,
	SingleChoiceQuestion,
	MultipleChoiceQuestion,
	CodeCompletionQuestion,
	TrueFalseQuestion,
	DragAndDropQuestion,
	AnyQuestion,
	ValidatedScaffoldingArgs,
	LessonContent,
	QuizContent,
	StudyGuideContent,
	ExamContent,
	ProjectContent,
	Flashcard,
	ContentSection,
	ContentBlock,
	CodeBlock,
	DiagramBlock
} from "$types";

// ============================================================================
// LOREM IPSUM CONTENT BASE
// ============================================================================

/**
 * Lorem ipsum base text for generating placeholder content
 * Cloud-native themed content for educational scaffolding
 */
const LOREM_IPSUM_TEXT = `
Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions.

At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments across different platforms and infrastructure. Docker has become the de facto standard for containerization, enabling developers to package applications with their dependencies into lightweight, portable units. These containers can run anywhere - from local development environments to production clusters in the cloud.

Container orchestration platforms, particularly Kubernetes, have revolutionized how we manage containerized applications at scale. Kubernetes provides powerful abstractions for deployment, scaling, service discovery, load balancing, and automated failover. Its declarative configuration model allows teams to describe the desired state of their applications and let the platform handle the implementation details.

Microservices architecture breaks down monolithic applications into smaller, independently deployable services. Each microservice focuses on a specific business capability and communicates with other services through well-defined APIs. This approach enables teams to work independently, choose appropriate technologies for each service, and scale components based on demand.

Infrastructure as Code (IaC) treats infrastructure configuration as software, using tools like Terraform, CloudFormation, and Ansible to provision and manage resources programmatically. This approach brings version control, code review processes, and automated testing to infrastructure management, improving consistency and reducing manual errors.

Continuous Integration and Continuous Deployment (CI/CD) pipelines automate the software delivery process from code commit to production deployment. Modern CI/CD systems integrate security scanning, testing, and compliance checks into the deployment pipeline, ensuring that only validated code reaches production environments.

Observability becomes critical in distributed systems, requiring comprehensive monitoring, logging, and distributed tracing capabilities. The three pillars of observability - metrics, logs, and traces - provide the necessary visibility into system behavior and performance characteristics.

Security considerations permeate every aspect of cloud-native development, from secure container image builds and vulnerability scanning to runtime security monitoring and policy enforcement. Zero-trust security models and service mesh technologies help ensure secure communication between services.

Progressive delivery techniques, including blue-green deployments, canary releases, and feature flags, enable safer rollouts of new features and immediate rollback capabilities when issues arise. These practices reduce deployment risks and enable faster feedback cycles.

Service mesh technologies like Istio and Linkerd provide advanced traffic management, security, and observability capabilities for microservices communication. They handle cross-cutting concerns at the infrastructure level, reducing complexity in application code.
`.trim();

// ============================================================================
// CONFIGURATION
// ============================================================================

// Get configuration from settings
const CONFIG = SETTINGS.scripts.scaffolding;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract lorem ipsum text of specified length, ending at word boundary
 */
function extractLoremText(length: number): string {
	if (length >= LOREM_IPSUM_TEXT.length) {
		return LOREM_IPSUM_TEXT;
	}

	// Find the last complete word within the length limit
	let text = LOREM_IPSUM_TEXT.substring(0, length);
	const lastSpace = text.lastIndexOf(" ");
	if (lastSpace > 0) {
		text = text.substring(0, lastSpace);
	}

	// Clean up text and normalize whitespace
	return text.trim().replace(/\s+/g, " ");
}

/**
 * Generate diverse code blocks with cloud-native examples
 */
function generateCodeBlock(): CodeBlock {
	const codeExamples = [
		{
			language: "typescript",
			code: `// Cloud-native microservice configuration
import { Container } from 'typedi';
import { createConnection } from 'typeorm';

interface ServiceConfig {
	port: number;
	database: DatabaseConfig;
	redis: RedisConfig;
	metrics: MetricsConfig;
}

export class CloudNativeService {
	private readonly config: ServiceConfig;

	constructor(config: ServiceConfig) {
		this.config = config;
	}

	async start(): Promise<void> {
		try {
			await this.connectToDatabase();
			await this.initializeMetrics();
			await this.startServer();
			console.log(\`Service started on port \${this.config.port}\`);
		} catch (error) {
			console.error('Failed to start service:', error);
			throw error;
		}
	}

	private async connectToDatabase(): Promise<void> {
		await createConnection(this.config.database);
	}
}`,
			title: "Microservice Architecture",
			filename: "service.ts"
		},
		{
			language: "yaml",
			code: `# Kubernetes deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloud-native-app
  labels:
    app: cloud-native-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cloud-native-app
  template:
    metadata:
      labels:
        app: cloud-native-app
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"`,
			title: "Kubernetes Deployment",
			filename: "deployment.yaml"
		},
		{
			language: "dockerfile",
			code: `# Multi-stage Docker build for Node.js application
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production

# Add security: create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]`,
			title: "Production Dockerfile",
			filename: "Dockerfile"
		},
		{
			language: "go",
			code: `// Go microservice with graceful shutdown
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type Server struct {
	httpServer *http.Server
}

func NewServer(addr string) *Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/api/users", usersHandler)

	return &Server{
		httpServer: &http.Server{
			Addr:    addr,
			Handler: mux,
		},
	}
}

func (s *Server) Start() error {
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

func main() {
	server := NewServer(":8080")

	// Start server in a goroutine
	go func() {
		if err := server.Start(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server failed to start:", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}
}`,
			title: "Go Microservice",
			filename: "main.go"
		}
	];

	const randomExample = codeExamples[Math.floor(Math.random() * codeExamples.length)];
	return {
		type: "code",
		...randomExample
	};
}

/**
 * Generate diverse Mermaid diagrams with cloud-native architecture focus
 */
function generateDiagram(preferredTypes: DiagramType[] = []): DiagramBlock {
	const diagramTemplates = {
		flowchart: {
			definition: `graph TB
    subgraph "Client Layer"
        Web["Web Application"]
        Mobile["Mobile Application"]
    end

    subgraph "API Gateway"
        Gateway["API Gateway"]
        LB["Load Balancer"]
    end

    subgraph "Microservices"
        Auth["Authentication Service"]
        User["User Management Service"]
        Order["Order Processing Service"]
        Payment["Payment Service"]
    end

    subgraph "Data Layer"
        AuthDB[("Authentication DB")]
        UserDB[("User Database")]
        OrderDB[("Order Database")]
        Cache[("Redis Cache")]
    end

    Web --> Gateway
    Mobile --> Gateway
    Gateway --> LB
    LB --> Auth
    LB --> User
    LB --> Order
    LB --> Payment
    Auth --> AuthDB
    User --> UserDB
    Order --> OrderDB
    Payment --> Cache`,
			title: "Microservices Architecture",
			caption: "Cloud-native microservices with API gateway pattern"
		},
		sequence: {
			definition: `sequenceDiagram
    participant Client
    participant "API Gateway" as Gateway
    participant "Auth Service" as Auth
    participant "Business Service" as Business
    participant "Database" as DB

    Client->>Gateway: "HTTP Request"
    Gateway->>Auth: "Validate Token"
    Auth->>Gateway: "Token Valid"
    Gateway->>Business: "Forward Request"
    Business->>DB: "Query Data"
    DB->>Business: "Return Data"
    Business->>Gateway: "Response"
    Gateway->>Client: "HTTP Response"`,
			title: "API Request Flow",
			caption: "Typical request flow in cloud-native architecture"
		},
		class: {
			definition: `classDiagram
    class PaymentProcessor {
        <<abstract>>
        +processPayment(amount: decimal): PaymentResult
        +validatePayment(details: PaymentDetails): boolean
        #logTransaction(transaction: Transaction): void
    }

    class CreditCardProcessor {
        -gateway: PaymentGateway
        -validator: CardValidator
        +processPayment(amount: decimal): PaymentResult
        +validateCard(cardNumber: string): boolean
        -encryptCardData(data: string): string
    }

    class PayPalProcessor {
        -apiClient: PayPalClient
        -tokenManager: TokenManager
        +processPayment(amount: decimal): PaymentResult
        +refreshToken(): string
        -makeAPICall(endpoint: string, data: object): APIResponse
    }

    class PaymentMethod {
        <<interface>>
        +getType(): string
        +getDetails(): PaymentDetails
    }

    PaymentProcessor <|-- CreditCardProcessor
    PaymentProcessor <|-- PayPalProcessor
    PaymentMethod <|.. CreditCardProcessor
    PaymentMethod <|.. PayPalProcessor`,
			title: "Payment System Classes",
			caption: "Object-oriented payment processing architecture"
		},
		er: {
			definition: `erDiagram
    USER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER_ITEM }o--|| PRODUCT : "references"
    PRODUCT }o--|| CATEGORY : "belongs_to"
    USER ||--o{ REVIEW : "writes"
    PRODUCT ||--o{ REVIEW : "reviewed"

    USER {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        datetime created_at
        boolean is_active
    }

    ORDER {
        uuid id PK
        string order_number UK
        uuid user_id FK
        decimal total_amount
        string status
        datetime created_at
    }

    PRODUCT {
        uuid id PK
        string sku UK
        string name
        text description
        uuid category_id FK
        decimal price
        integer stock_quantity
        boolean is_active
    }`,
			title: "E-commerce Database Schema",
			caption: "Entity relationship diagram for e-commerce platform"
		},
		state: {
			definition: `stateDiagram-v2
    [*] --> Draft : "Create Order"

    Draft --> Pending : "Submit Order"
    Draft --> Cancelled : "Cancel Draft"

    Pending --> PaymentProcessing : "Process Payment"
    Pending --> Cancelled : "Cancel Order"

    PaymentProcessing --> PaymentFailed : "Payment Declined"
    PaymentProcessing --> PaymentConfirmed : "Payment Success"

    PaymentFailed --> Pending : "Retry Payment"
    PaymentFailed --> Cancelled : "Cancel Order"

    PaymentConfirmed --> Processing : "Start Fulfillment"

    Processing --> Shipped : "Ship Order"
    Processing --> Cancelled : "Cancel Before Ship"

    Shipped --> Delivered : "Delivery Confirmed"
    Delivered --> Completed : "Auto Complete"

    Cancelled --> [*]
    Completed --> [*]`,
			title: "Order Lifecycle",
			caption: "State machine for order processing workflow"
		},
		gitgraph: {
			definition: `gitGraph
    commit id: "Initial Commit"
    commit id: "Setup Project"

    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add User Model"
    commit id: "Implement Login"
    commit id: "Add JWT Auth"

    checkout main
    commit id: "Update Dependencies"

    branch feature/product-catalog
    checkout feature/product-catalog
    commit id: "Add Product Model"
    commit id: "Create Product API"

    checkout feature/user-auth
    commit id: "Add Password Reset"

    checkout main
    merge feature/user-auth
    commit id: "Release v1.1.0"

    checkout feature/product-catalog
    commit id: "Add Product Search"

    checkout main
    merge feature/product-catalog
    commit id: "Release v1.2.0"`,
			title: "Development Workflow",
			caption: "Git branching strategy and release workflow"
		},
		architecture: {
			definition: `graph LR
    subgraph "Development"
        Dev["Developer"]
        Code["Source Code"]
        Git["Git Repository"]
    end

    subgraph "CI/CD Pipeline"
        Build["Build & Test"]
        Security["Security Scan"]
        Package["Container Build"]
        Deploy["Deployment"]
    end

    subgraph "Production"
        K8s["Kubernetes"]
        Monitor["Monitoring"]
        Logs["Logging"]
    end

    Dev --> Code
    Code --> Git
    Git --> Build
    Build --> Security
    Security --> Package
    Package --> Deploy
    Deploy --> K8s
    K8s --> Monitor
    K8s --> Logs`,
			title: "DevOps Pipeline",
			caption: "End-to-end development and deployment workflow"
		}
	};

	// Select diagram type - only from available templates
	const availableTypes = Object.keys(diagramTemplates) as Array<keyof typeof diagramTemplates>;
	let diagramType: keyof typeof diagramTemplates;

	if (preferredTypes.length > 0) {
		// Filter preferred types to only include available templates
		const validPreferredTypes = preferredTypes.filter((type) =>
			availableTypes.includes(type as keyof typeof diagramTemplates)
		) as Array<keyof typeof diagramTemplates>;

		if (validPreferredTypes.length > 0) {
			diagramType = validPreferredTypes[Math.floor(Math.random() * validPreferredTypes.length)];
		} else {
			diagramType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
		}
	} else {
		diagramType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
	}

	const template = diagramTemplates[diagramType];
	return {
		type: "diagram",
		diagramType: "mermaid",
		...template
	};
}

/**
 * Generate a content section with diverse content blocks
 */
function generateContentSection(
	sectionTitle: string,
	includeCodeBlock: boolean = false,
	includeDiagram: boolean = false,
	usedDiagramTypes: DiagramType[] = []
): ContentSection {
	const content: ContentBlock[] = [];

	// Always start with introductory paragraph
	content.push({
		type: "paragraph",
		content: [{ text: extractLoremText(CONFIG.contentLengths.paragraph) }]
	});

	// Add code block if required
	if (includeCodeBlock) {
		content.push(generateCodeBlock());
		content.push({
			type: "paragraph",
			content: [{ text: extractLoremText(CONFIG.contentLengths.paragraph) }]
		});
	}

	// Add diagram if required
	if (includeDiagram) {
		// Available diagram types excluding already used ones
		const allDiagramTypes: DiagramType[] = [
			"flowchart",
			"sequence",
			"class",
			"er",
			"state",
			"gitgraph",
			"architecture"
		];
		const availableTypes = allDiagramTypes.filter((type) => !usedDiagramTypes.includes(type));

		content.push(generateDiagram(availableTypes));
		content.push({
			type: "paragraph",
			content: [{ text: extractLoremText(CONFIG.contentLengths.paragraph) }]
		});
	}

	// Add callout for important information
	content.push({
		type: "callout",
		calloutType: "info",
		title: "Key Concept",
		content: [{ text: extractLoremText(CONFIG.contentLengths.explanation) }]
	});

	// Add concluding paragraph
	content.push({
		type: "paragraph",
		content: [{ text: extractLoremText(CONFIG.contentLengths.paragraph) }]
	});

	return {
		title: sectionTitle,
		content
	};
}

/**
 * Generate diverse quiz questions with different types
 */
function generateDiverseQuestions(count: number, diverseTypes: boolean = true): AnyQuestion[] {
	const questions = [];
	const questionTypes: QuestionType[] = diverseTypes
		? ["single_choice", "multiple_choice", "code_completion", "true_false", "drag_and_drop"]
		: ["single_choice"];

	for (let i = 0; i < count; i++) {
		const questionType = questionTypes[i % questionTypes.length];
		const questionNumber = i + 1;

		switch (questionType) {
			case "single_choice":
				questions.push({
					id: `q${questionNumber}`,
					type: "single_choice",
					question: `${extractLoremText(CONFIG.contentLengths.question)}?`,
					options: [
						extractLoremText(40),
						extractLoremText(40),
						extractLoremText(40),
						extractLoremText(40)
					],
					correct: i % 4,
					explanation: extractLoremText(CONFIG.contentLengths.explanation),
					points: 5
				} as SingleChoiceQuestion);
				break;

			case "multiple_choice":
				questions.push({
					id: `q${questionNumber}`,
					type: "multiple_choice",
					question: `Which of the following are cloud-native principles? (Select all that apply)`,
					options: [
						"Containerization of applications",
						"Microservices architecture",
						"Monolithic deployment",
						"Infrastructure as Code",
						"Manual scaling processes"
					],
					correct: [0, 1, 3], // Multiple correct answers
					explanation: extractLoremText(CONFIG.contentLengths.explanation),
					points: 10
				} as MultipleChoiceQuestion);
				break;

			case "code_completion":
				questions.push({
					id: `q${questionNumber}`,
					type: "code_completion",
					question: "Complete the Kubernetes deployment configuration:",
					codeSnippet: `apiVersion: apps/v1
kind: _____
metadata:
  name: web-app
spec:
  replicas: _____
  selector:
    matchLabels:
      app: _____`,
					blanks: [
						{
							id: "deployment-kind",
							options: ["Deployment", "Service", "Pod", "ConfigMap"]
						},
						{
							id: "replica-count",
							options: ["1", "3", "5", "10"]
						},
						{
							id: "app-label",
							options: ["web-app", "frontend", "backend", "database"]
						}
					],
					correctAnswers: {
						"deployment-kind": "Deployment",
						"replica-count": "3",
						"app-label": "web-app"
					},
					explanation: extractLoremText(CONFIG.contentLengths.explanation),
					points: 15
				} as CodeCompletionQuestion);
				break;

			case "true_false":
				questions.push({
					id: `q${questionNumber}`,
					type: "true_false",
					question:
						"Containers share the same operating system kernel, making them more lightweight than virtual machines.",
					correct: true,
					explanation: extractLoremText(CONFIG.contentLengths.explanation),
					points: 5
				} as TrueFalseQuestion);
				break;

			case "drag_and_drop":
				questions.push({
					id: `q${questionNumber}`,
					type: "drag_and_drop",
					question: "Match each cloud-native tool with its primary purpose:",
					items: [
						{ id: "docker", content: "Docker", category: "containerization" },
						{ id: "kubernetes", content: "Kubernetes", category: "orchestration" },
						{ id: "prometheus", content: "Prometheus", category: "monitoring" },
						{ id: "terraform", content: "Terraform", category: "infrastructure" }
					],
					targets: [
						{ id: "containerization", label: "Containerization", acceptsItems: ["docker"] },
						{ id: "orchestration", label: "Orchestration", acceptsItems: ["kubernetes"] },
						{ id: "monitoring", label: "Monitoring", acceptsItems: ["prometheus"] },
						{ id: "infrastructure", label: "Infrastructure as Code", acceptsItems: ["terraform"] }
					],
					correctMatches: [
						{ itemId: "docker", targetId: "containerization" },
						{ itemId: "kubernetes", targetId: "orchestration" },
						{ itemId: "prometheus", targetId: "monitoring" },
						{ itemId: "terraform", targetId: "infrastructure" }
					],
					explanation: extractLoremText(CONFIG.contentLengths.explanation),
					points: 20
				} as DragAndDropQuestion);
				break;
		}
	}

	return questions;
}

/**
 * Generate flashcards for study guides
 */
function generateFlashcards(count: number): Flashcard[] {
	const flashcards = [];
	for (let i = 0; i < count; i++) {
		flashcards.push({
			id: `card${i + 1}`,
			front: `${extractLoremText(CONFIG.contentLengths.flashcardQuestion)}?`,
			back: extractLoremText(CONFIG.contentLengths.flashcardAnswer),
			tags: ["concept", "fundamentals", "cloud-native"],
			difficulty: "beginner" as const
		});
	}
	return flashcards;
}

// ============================================================================
// TEMPLATE GENERATOR CLASS
// ============================================================================

/**
 * TemplateGenerator - Pure template generation utility
 *
 * This class provides pure template generation functions without any CLI dependencies,
 * file I/O operations, or Core API integration. It's designed to be reusable
 * across different contexts that need template content generation.
 */
export class TemplateGenerator {
	private config: typeof CONFIG;

	constructor() {
		this.config = CONFIG;
	}

	/**
	 * Generate lesson content structure with diverse diagrams
	 */
	generateLessonContent(args: ValidatedScaffoldingArgs): LessonContent {
		const title = `Unit ${args.id}: Cloud-Native Development Environment`;
		const sections: ContentSection[] = [];
		const usedDiagramTypes: DiagramType[] = [];

		// Generate required minimum sections with varied titles
		const sectionTitles = [
			"Core Concepts",
			"Implementation Details",
			"Best Practices",
			"Advanced Topics",
			"Real-world Applications"
		];

		for (let i = 0; i < this.config.lessons.sections; i++) {
			const includeCodeBlock = i < this.config.lessons.codeBlocks;
			const includeDiagram = i < this.config.lessons.diagrams;
			const sectionTitle = `Section ${i + 1}: ${sectionTitles[i] || "Additional Concepts"}`;

			const section = generateContentSection(
				sectionTitle,
				includeCodeBlock,
				includeDiagram,
				usedDiagramTypes
			);

			// Track used diagram types for diversity
			if (includeDiagram) {
				const diagramBlock = section.content.find((block) => block.type === "diagram") as
					| DiagramBlock
					| undefined;
				if (diagramBlock) {
					// Extract diagram type (would need to parse from definition in real implementation)
					// For now, we'll use a simple approach
					const allTypes: DiagramType[] = [
						"flowchart",
						"sequence",
						"class",
						"er",
						"state",
						"gitgraph",
						"architecture"
					];
					const unusedType = allTypes.find((type) => !usedDiagramTypes.includes(type));
					if (unusedType) {
						usedDiagramTypes.push(unusedType);
					}
				}
			}

			sections.push(section);
		}

		return {
			type: "lesson",
			title,
			summary: extractLoremText(this.config.contentLengths.summary),
			status: "scaffold" as const,
			estimatedTime: 45,
			prerequisites: [
				"Basic understanding of cloud computing concepts",
				"Familiarity with software development principles",
				"Command line interface experience"
			],
			learningObjectives: [
				"Understand cloud-native development principles and their advantages",
				"Learn to implement containerized applications using Docker",
				"Master microservices architecture patterns and best practices",
				"Explore infrastructure as code and orchestration technologies"
			],
			difficulty: "beginner" as const,
			sections
		};
	}

	/**
	 * Generate quiz content structure with diverse question types
	 */
	generateQuizContent(args: ValidatedScaffoldingArgs): QuizContent {
		const title = `Quiz: Cloud-Native Development - ${args.id}`;
		const questions = generateDiverseQuestions(
			this.config.quizzes.questions,
			this.config.quizzes.diverseTypes
		);

		return {
			type: "quiz",
			title,
			summary:
				"Test your knowledge of cloud-native development concepts, containerization, and microservices architecture through this comprehensive quiz.",
			status: "scaffold" as const,
			quiz: {
				description:
					"This quiz covers fundamental cloud-native concepts including containerization with Docker, microservices patterns, infrastructure as code, and cloud deployment strategies.",
				passingScore: 70,
				timeLimit: 30,
				questions,
				randomizeQuestions: false,
				showResults: true
			}
		};
	}

	/**
	 * Generate study guide content structure
	 */
	generateStudyGuideContent(_args: ValidatedScaffoldingArgs): StudyGuideContent {
		const title = `Study Guide: Cloud-Native Development - ${_args.id}`;
		const flashcards = generateFlashcards(this.config.studyGuides.flashcards);

		return {
			type: "study_guide",
			title,
			summary:
				"Interactive flashcards and study materials to reinforce cloud-native development concepts and prepare for assessments.",
			status: "scaffold" as const,
			studyGuide: {
				description:
					"Comprehensive study materials covering cloud-native principles, containerization, microservices architecture, and deployment strategies through interactive flashcards.",
				flashcards,
				categories: ["fundamentals", "concepts", "implementation"],
				randomizeCards: true
			}
		};
	}

	/**
	 * Generate exam content structure with diverse question types
	 */
	generateExamContent(_args: ValidatedScaffoldingArgs): ExamContent {
		const title = `Final Exam: Cloud-Native Development`;
		const questions = generateDiverseQuestions(
			this.config.exams.questions,
			this.config.exams.diverseTypes
		);

		return {
			type: "exam",
			title,
			summary:
				"Comprehensive examination covering all aspects of cloud-native development, including containerization, microservices, orchestration, and deployment strategies.",
			status: "scaffold" as const,
			duration: 90,
			passingScore: 75,
			exam: {
				description:
					"Final assessment testing comprehensive understanding of cloud-native technologies, Docker containerization, Kubernetes orchestration, microservices architecture, and modern deployment practices.",
				instructions: [
					{
						text: "Read each question carefully and select the best answer. You have 90 minutes to complete all questions."
					}
				],
				passingScore: 75,
				timeLimit: 90,
				questions,
				randomizeQuestions: true,
				questionsToShow: this.config.exams.questions,
				showResults: true
			}
		};
	}

	/**
	 * Generate project content structure
	 */
	generateProjectContent(_args: ValidatedScaffoldingArgs): ProjectContent {
		const title = `Project: Cloud-Native Application Implementation`;
		const sections: ContentSection[] = [];
		const usedDiagramTypes: DiagramType[] = [];

		// Generate project sections with meaningful phase names
		const phaseNames = [
			"Setup & Environment Configuration",
			"Containerization & Docker Implementation",
			"Microservices Architecture Development",
			"Orchestration & Kubernetes Deployment",
			"Monitoring & Production Readiness"
		];

		for (let i = 0; i < this.config.projects.sections; i++) {
			const includeCodeBlock = i < this.config.lessons.codeBlocks;
			const includeDiagram = i < this.config.lessons.diagrams;
			const phaseName = phaseNames[i] || `Phase ${i + 1}: Implementation`;

			const section = generateContentSection(
				`Phase ${i + 1}: ${phaseName}`,
				includeCodeBlock,
				includeDiagram,
				usedDiagramTypes
			);

			sections.push(section);
		}

		const requirements = [
			"Implement containerized microservices using Docker and best practices",
			"Deploy application to Kubernetes cluster with proper resource management",
			"Configure CI/CD pipeline for automated testing and deployment",
			"Implement monitoring and logging solutions for production observability",
			"Ensure security best practices throughout the application stack"
		];

		const deliverables = [
			"Fully containerized application with multi-service architecture",
			"Kubernetes deployment manifests and configuration files",
			"CI/CD pipeline configuration and deployment automation"
		];

		return {
			type: "project",
			title,
			summary:
				"Build a comprehensive cloud-native application using modern containerization, orchestration, and deployment technologies.",
			status: "scaffold" as const,
			estimatedHours: 20,
			difficulty: "intermediate" as const,
			technologies: ["Docker", "Kubernetes", "TypeScript", "Node.js", "PostgreSQL"],
			requirements,
			deliverables,
			sections
		};
	}

	/**
	 * Generate overview content (uses lesson structure)
	 */
	generateOverviewContent(args: ValidatedScaffoldingArgs): LessonContent {
		const content = this.generateLessonContent(args);
		content.title = `Unit Overview: Cloud-Native Development`;
		content.summary =
			"Comprehensive overview of cloud-native development principles, technologies, and practices covered in this unit.";
		content.learningObjectives = [
			"Gain a comprehensive understanding of cloud-native architecture principles",
			"Explore the ecosystem of cloud-native tools and technologies",
			"Understand the benefits and challenges of cloud-native development",
			"Preview key concepts that will be covered throughout this unit"
		];
		// Return with type override for test compatibility
		return { ...content, type: "overview" } as unknown as LessonContent;
	}

	/**
	 * Get content generator function based on type
	 */
	getContentGenerator(
		type: ChapterType
	): (
		args: ValidatedScaffoldingArgs
	) => LessonContent | QuizContent | StudyGuideContent | ExamContent | ProjectContent {
		switch (type) {
			case "lesson":
				return this.generateLessonContent.bind(this);
			case "overview":
				return this.generateOverviewContent.bind(this);
			case "quiz":
				return this.generateQuizContent.bind(this);
			case "study_guide":
				return this.generateStudyGuideContent.bind(this);
			case "exam":
				return this.generateExamContent.bind(this);
			case "project":
				return this.generateProjectContent.bind(this);
			default:
				return this.generateLessonContent.bind(this);
		}
	}
}

// ============================================================================
// UTILITY FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Create a default TemplateGenerator instance for standalone function usage
 */
const defaultGenerator = new TemplateGenerator();

/**
 * Generate lesson content (standalone function for backward compatibility)
 */
export function generateLessonContent(args: ValidatedScaffoldingArgs): LessonContent {
	return defaultGenerator.generateLessonContent(args);
}

/**
 * Generate quiz content (standalone function for backward compatibility)
 */
export function generateQuizContent(args: ValidatedScaffoldingArgs): QuizContent {
	return defaultGenerator.generateQuizContent(args);
}

/**
 * Generate study guide content (standalone function for backward compatibility)
 */
export function generateStudyGuideContent(args: ValidatedScaffoldingArgs): StudyGuideContent {
	return defaultGenerator.generateStudyGuideContent(args);
}

/**
 * Generate exam content (standalone function for backward compatibility)
 */
export function generateExamContent(args: ValidatedScaffoldingArgs): ExamContent {
	return defaultGenerator.generateExamContent(args);
}

/**
 * Generate project content (standalone function for backward compatibility)
 */
export function generateProjectContent(args: ValidatedScaffoldingArgs): ProjectContent {
	return defaultGenerator.generateProjectContent(args);
}

/**
 * Get content generator function (standalone function for backward compatibility)
 */
export function getContentGenerator(
	type: ChapterType
): (
	args: ValidatedScaffoldingArgs
) => LessonContent | QuizContent | StudyGuideContent | ExamContent | ProjectContent {
	return defaultGenerator.getContentGenerator(type);
}
