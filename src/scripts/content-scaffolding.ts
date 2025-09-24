#!/usr/bin/env tsx

/**
 * Content Scaffolding Generator for Cloud-Native Learning Platform
 *
 * Modern TypeScript replacement for the Python content scaffolding generator.
 * Uses ts-morph for AST-based generation to ensure syntactic correctness and type safety.
 *
 * Features:
 * - CLI argument parsing for unit, type, and ID specification
 * - AST-based TypeScript code generation using ts-morph
 * - Type-safe content generation using unified TypeScript interfaces
 * - Configurable content requirements via src/config/settings.ts
 * - Diverse question types for quizzes and exams
 * - Diverse diagram types for lessons and projects
 * - Automatic placeholder content with lorem ipsum text
 * - Integration with project build system (package.json, Makefile)
 *
 * Usage:
 *   pnpm run scaffold-content -- --unit="python-backend" --type="lesson" --id="1-1"
 *   npx tsx src/scripts/content-scaffolding.ts --unit="python-backend" --type="quiz" --id="1-2"
 *
 * Generated files follow the pattern defined in CONTENT-STANDARDS.md and use
 * the unified type system from src/lib/types/ for maximum type safety.
 */

import {
	Project,
	SourceFile,
	VariableDeclarationKind,
	ModuleKind,
	ModuleResolutionKind,
	ScriptTarget
} from "ts-morph";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { dirname, join, basename } from "path";
import { parseArgs } from "util";
import { SETTINGS } from "../config/settings.js";
import { runContentValidation } from "../lib/utils/validation-utils.js";
import { generateNavigationPaths } from "../lib/utils/navigation-paths.js";
import { contentMenu } from "../data/generated/content-menu.js";
import type {
	MenuUnit,
	MenuChapter,
	ChapterType,
	QuestionType,
	MermaidDiagramType as DiagramType,
	SingleChoiceQuestion,
	MultipleChoiceQuestion,
	CodeCompletionQuestion,
	TrueFalseQuestion,
	DragAndDropQuestion,
	AnyQuestion,
	UnifiedPathConfig
} from "$types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// CLI argument interface - enhanced for flexible unit identification (used internally by parseArgs)
interface _ScaffoldingArgs {
	unit?: string;
	type?: ChapterType;
	id?: string;
	help?: boolean;
	"list-units"?: boolean;
	"list-chapters"?: boolean;
}

// Validated arguments interface - after parsing and validation
interface ValidatedScaffoldingArgs {
	unit: string;
	type: ChapterType;
	id: string;
}

// Unit identification interface for flexible matching
interface UnitIdentification {
	unitNumber?: number;
	technologyUnit?: string;
	isAmbiguous?: boolean;
	matchedUnits?: Array<{
		unitNumber: number;
		title: string;
		technologyUnit: string;
	}>;
}

// Get configuration from settings
const CONFIG = SETTINGS.contentScaffolding;

// ============================================================================
// LOREM IPSUM CONTENT BASE
// ============================================================================

// Lorem ipsum base text for generating placeholder content
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
// UTILITY FUNCTIONS FOR VALIDATION
// ============================================================================

/**
 * Normalize ID input to consistent zero-padded underscore format
 *
 * This function standardizes all ID variations into the project's consistent format:
 * - Converts dots to underscores: "1.1" → "01_01"
 * - Applies zero-padding: "1" → "01_01", "1.10" → "01_10"
 * - Preserves existing format if already correct: "01_01" → "01_01"
 * - Handles edge cases: "1-1" → "01_01", "1_1" → "01_01"
 *
 * @param idInput - Raw ID string from command line (e.g., "1", "1.1", "01_01")
 * @returns Normalized ID in format "XX_YY" (e.g., "01_01", "01_10")
 *
 * @example
 * normalizeId("1") → "01_01"
 * normalizeId("1.1") → "01_01"
 * normalizeId("1.10") → "01_10"
 * normalizeId("2.3") → "02_03"
 * normalizeId("01_01") → "01_01"
 */
function normalizeId(idInput: string): string {
	// Remove any whitespace
	const cleanInput = idInput.trim();

	// If input is empty or invalid, return default format
	if (!cleanInput) {
		return "01_01";
	}

	// Handle various separators: dots, dashes, underscores, or spaces
	const separatorRegex = /[.\-_\s]+/;
	const parts = cleanInput.split(separatorRegex);

	// If no separator found, treat as single number (assume it's the chapter)
	if (parts.length === 1) {
		const num = parseInt(parts[0], 10);
		if (isNaN(num) || num < 1) {
			return "01_01"; // Default fallback
		}
		// Single number becomes "0X_01" (unit X, chapter 1)
		return `${num.toString().padStart(2, "0")}_01`;
	}

	// Extract first two meaningful parts (unit and chapter)
	const unitPart = parts[0];
	const chapterPart = parts[1];

	// Parse unit number
	const unitNum = parseInt(unitPart, 10);
	const unit = isNaN(unitNum) || unitNum < 1 ? 1 : unitNum;

	// Parse chapter number
	const chapterNum = parseInt(chapterPart, 10);
	const chapter = isNaN(chapterNum) || chapterNum < 1 ? 1 : chapterNum;

	// Return zero-padded format
	return `${unit.toString().padStart(2, "0")}_${chapter.toString().padStart(2, "0")}`;
}

/**
 * Get human-readable description for content type
 */
function getTypeDescription(type: ChapterType): string {
	switch (type) {
		case "overview":
			return "Unit overview and introduction";
		case "lesson":
			return "Learning content with sections and examples";
		case "study_guide":
			return "Flashcards and study materials";
		case "quiz":
			return "Assessment with multiple question types";
		case "exam":
			return "Comprehensive examination";
		case "project":
			return "Hands-on project with requirements";
		default:
			return "Content type";
	}
}

// ============================================================================
// UNIT IDENTIFICATION FUNCTIONS
// ============================================================================

/**
 * Identify unit based on string or numeric input
 */
function identifyUnit(unitInput: string): UnitIdentification {
	const units = contentMenu.units;

	// Check if input is numeric
	const numericUnit = parseInt(unitInput, 10);
	if (!isNaN(numericUnit)) {
		// Numeric identification (most precise)
		const matchedUnit = units.find((unit) => unit.unitNumber === numericUnit);
		if (matchedUnit) {
			return {
				unitNumber: matchedUnit.unitNumber,
				technologyUnit: matchedUnit.technologyUnit,
				isAmbiguous: false
			};
		} else {
			// Invalid unit number
			return {
				isAmbiguous: false,
				matchedUnits: []
			};
		}
	}

	// String-based identification
	const normalizedInput = unitInput.toLowerCase();
	const exactMatches = units.filter(
		(unit) => unit.technologyUnit.toLowerCase() === normalizedInput
	);

	if (exactMatches.length === 1) {
		// Unique string match
		const match = exactMatches[0];
		return {
			unitNumber: match.unitNumber,
			technologyUnit: match.technologyUnit,
			isAmbiguous: false
		};
	} else if (exactMatches.length > 1) {
		// Ambiguous string match
		return {
			isAmbiguous: true,
			matchedUnits: exactMatches.map((unit) => ({
				unitNumber: unit.unitNumber,
				title: unit.title,
				technologyUnit: unit.technologyUnit
			}))
		};
	}

	// No matches found
	return {
		isAmbiguous: false,
		matchedUnits: []
	};
}

/**
 * Display available units for discovery
 */
function displayAvailableUnits(): void {
	console.log("📋 Available Units:");
	console.log("===================");

	contentMenu.units.forEach((unit) => {
		console.log(`  ${unit.unitNumber}: ${unit.technologyUnit} - ${unit.title}`);
	});

	console.log("\nUsage Examples:");
	console.log("  --unit=1          (numeric - most precise)");
	console.log('  --unit="python"    (string - for unique technologies)');
	console.log('  --unit="go"        (string - for unique technologies)');
	console.log("  --unit=3          (numeric - required for microservices units)");
}

/**
 * Display available chapters for a specific unit
 */
function displayAvailableChapters(unitNumber: number): void {
	const unit = contentMenu.units.find((u) => u.unitNumber === unitNumber);
	if (!unit) {
		console.error(`Unit ${unitNumber} not found`);
		return;
	}

	console.log(`📋 Available Chapters for Unit ${unitNumber}: ${unit.title}`);
	console.log("=".repeat(80));

	const chaptersByType = unit.chapters.reduce(
		(acc, chapter) => {
			if (!acc[chapter.type]) acc[chapter.type] = [];
			acc[chapter.type].push(chapter);
			return acc;
		},
		{} as Record<ChapterType, MenuChapter[]>
	);

	Object.entries(chaptersByType).forEach(([type, chapters]) => {
		console.log(`\n📚 ${type.toUpperCase().replace("_", " ")}:`);
		chapters.forEach((chapter) => {
			console.log(`  ${chapter.id}: ${chapter.title}`);
		});
	});

	console.log("\nUsage Example:");
	console.log(`  --unit=${unitNumber} --type=lesson --id=${unit.chapters[0]?.id || "chapter-id"}`);
}

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
function generateCodeBlock(): Record<string, unknown> {
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
function generateDiagram(preferredTypes: DiagramType[] = []): Record<string, unknown> {
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
): Record<string, unknown> {
	const content = [];

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
function generateFlashcards(count: number): Record<string, unknown>[] {
	const flashcards = [];
	for (let i = 0; i < count; i++) {
		flashcards.push({
			id: `card${i + 1}`,
			front: `${extractLoremText(CONFIG.contentLengths.flashcardQuestion)}?`,
			back: extractLoremText(CONFIG.contentLengths.flashcardAnswer),
			tags: ["concept", "fundamentals", "cloud-native"],
			difficulty: "beginner"
		});
	}
	return flashcards;
}

// ============================================================================
// CONTENT GENERATORS
// ============================================================================

/**
 * Generate lesson content structure with diverse diagrams
 */
function generateLessonContent(args: ValidatedScaffoldingArgs): Record<string, unknown> {
	const title = `Unit ${args.id}: Cloud-Native ${args.unit} Development`;
	const sections = [];
	const usedDiagramTypes: DiagramType[] = [];

	// Generate required minimum sections
	for (let i = 0; i < CONFIG.lessons.sections; i++) {
		const includeCodeBlock = i < CONFIG.lessons.codeBlocks;
		const includeDiagram = i < CONFIG.lessons.diagrams;

		const section = generateContentSection(
			`Section ${i + 1}: Core Concepts`,
			includeCodeBlock,
			includeDiagram,
			usedDiagramTypes
		);

		// Track used diagram types for diversity
		if (includeDiagram) {
			const diagramBlock = (section.content as Record<string, unknown>[])?.find(
				(block: Record<string, unknown>) => block.type === "diagram"
			);
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
		summary: extractLoremText(CONFIG.contentLengths.summary),
		status: "scaffold" as const,
		estimatedTime: 45,
		prerequisites: [
			"Basic understanding of cloud computing concepts",
			"Familiarity with software development principles",
			"Command line interface experience"
		],
		learningObjectives: [
			extractLoremText(CONFIG.contentLengths.objective),
			extractLoremText(CONFIG.contentLengths.objective),
			extractLoremText(CONFIG.contentLengths.objective),
			extractLoremText(CONFIG.contentLengths.objective)
		],
		difficulty: "beginner" as const,
		sections
	};
}

/**
 * Generate quiz content structure with diverse question types
 */
function generateQuizContent(args: ValidatedScaffoldingArgs): Record<string, unknown> {
	const title = `Quiz: ${args.unit} - ${args.id}`;
	const questions = generateDiverseQuestions(CONFIG.quizzes.questions, CONFIG.quizzes.diverseTypes);

	return {
		type: "quiz",
		title,
		summary: extractLoremText(CONFIG.contentLengths.summary),
		status: "scaffold" as const,
		quiz: {
			description: extractLoremText(CONFIG.contentLengths.summary),
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
function generateStudyGuideContent(args: ValidatedScaffoldingArgs): Record<string, unknown> {
	const title = `Study Guide: ${args.unit} - ${args.id}`;
	const flashcards = generateFlashcards(CONFIG.studyGuides.flashcards);

	return {
		type: "study_guide",
		title,
		summary: extractLoremText(CONFIG.contentLengths.summary),
		status: "scaffold" as const,
		studyGuide: {
			description: extractLoremText(CONFIG.contentLengths.summary),
			flashcards,
			categories: ["fundamentals", "concepts", "implementation"],
			randomizeCards: true
		}
	};
}

/**
 * Generate exam content structure with diverse question types
 */
function generateExamContent(args: ValidatedScaffoldingArgs): Record<string, unknown> {
	const title = `Final Exam: ${args.unit}`;
	const questions = generateDiverseQuestions(CONFIG.exams.questions, CONFIG.exams.diverseTypes);

	return {
		type: "exam",
		title,
		summary: extractLoremText(CONFIG.contentLengths.summary),
		status: "scaffold" as const,
		duration: 90,
		passingScore: 75,
		exam: {
			description: extractLoremText(CONFIG.contentLengths.summary),
			instructions:
				"Read each question carefully and select the best answer. You have 90 minutes to complete all questions.",
			passingScore: 75,
			timeLimit: 90,
			questions,
			randomizeQuestions: true,
			questionsToShow: CONFIG.exams.questions,
			showResults: true
		}
	};
}

/**
 * Generate project content structure
 */
function generateProjectContent(args: ValidatedScaffoldingArgs): Record<string, unknown> {
	const title = `Project: ${args.unit} Implementation`;
	const sections = [];
	const usedDiagramTypes: DiagramType[] = [];

	// Generate project sections with code and diagrams
	for (let i = 0; i < CONFIG.projects.sections; i++) {
		const includeCodeBlock = i < CONFIG.lessons.codeBlocks;
		const includeDiagram = i < CONFIG.lessons.diagrams;

		const section = generateContentSection(
			`Phase ${i + 1}: Implementation`,
			includeCodeBlock,
			includeDiagram,
			usedDiagramTypes
		);

		sections.push(section);
	}

	const requirements = [];
	for (let i = 0; i < CONFIG.projects.requirements; i++) {
		requirements.push(extractLoremText(CONFIG.contentLengths.requirement));
	}

	const deliverables = [];
	for (let i = 0; i < CONFIG.projects.deliverables; i++) {
		deliverables.push(extractLoremText(CONFIG.contentLengths.deliverable));
	}

	return {
		type: "project",
		title,
		summary: extractLoremText(CONFIG.contentLengths.summary),
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
 * Get content generator function based on type
 */
function getContentGenerator(
	type: ChapterType
): (args: ValidatedScaffoldingArgs) => Record<string, unknown> {
	switch (type) {
		case "lesson":
		case "overview":
			return generateLessonContent;
		case "quiz":
			return generateQuizContent;
		case "study_guide":
			return generateStudyGuideContent;
		case "exam":
			return generateExamContent;
		case "project":
			return generateProjectContent;
		default:
			return generateLessonContent;
	}
}

// ============================================================================
// FILE GENERATION AND AST MANIPULATION
// ============================================================================

/**
 * Create TypeScript source file with proper imports and content structure
 */
function createContentFile(
	project: Project,
	filePath: string,
	args: ValidatedScaffoldingArgs
): SourceFile {
	// Create source file
	const sourceFile = project.createSourceFile(filePath, "", { overwrite: false });

	// Determine content type for imports
	const contentType = args.type;
	const importTypes: string[] = [];

	switch (contentType) {
		case "lesson":
		case "overview":
			importTypes.push("LessonContent", "ContentSection");
			break;
		case "quiz":
			importTypes.push(
				"QuizContent",
				"Quiz",
				"SingleChoiceQuestion",
				"MultipleChoiceQuestion",
				"CodeCompletionQuestion",
				"TrueFalseQuestion",
				"DragAndDropQuestion"
			);
			break;
		case "study_guide":
			importTypes.push("StudyGuideContent", "StudyGuide", "Flashcard");
			break;
		case "exam":
			importTypes.push(
				"ExamContent",
				"Exam",
				"SingleChoiceQuestion",
				"MultipleChoiceQuestion",
				"CodeCompletionQuestion",
				"TrueFalseQuestion",
				"DragAndDropQuestion"
			);
			break;
		case "project":
			importTypes.push("ProjectContent", "ContentSection");
			break;
		default:
			importTypes.push("LessonContent", "ContentSection");
			break;
	}

	// Add import statements with underscore prefix to indicate they're for type validation only
	if (importTypes.length > 0) {
		sourceFile.addImportDeclaration({
			moduleSpecifier: "$types",
			namedImports: importTypes.map((type) => ({
				name: type,
				alias: `_${type}`, // Use underscore prefix to avoid unused variable lint errors
				isTypeOnly: true
			}))
		});
	}

	// Add file header comment
	sourceFile.insertText(
		0,
		`/**
 * Generated content scaffolding for: ${args.unit} - ${args.type} - ${args.id}
 *
 * STATUS: This is scaffolded content with placeholder data.
 * Replace with real educational material following CONTENT-STANDARDS.md
 *
 * Content Requirements (from src/config/settings.ts):
 * - Lessons: ${CONFIG.lessons.sections} sections, ${CONFIG.lessons.codeBlocks} code blocks, ${CONFIG.lessons.diagrams} diagrams
 * - Quizzes: ${CONFIG.quizzes.questions} questions (diverse types: ${CONFIG.quizzes.diverseTypes})
 * - Exams: ${CONFIG.exams.questions} questions (diverse types: ${CONFIG.exams.diverseTypes})
 * - Study Guides: ${CONFIG.studyGuides.flashcards} flashcards
 * - Projects: ${CONFIG.projects.sections} sections, ${CONFIG.projects.requirements} requirements
 *
 * Generated by: content-scaffolding.ts
 * Generated at: ${new Date().toISOString()}
 */

`
	);

	return sourceFile;
}

/**
 * Parse CLI arguments with validation - enhanced for flexible unit identification
 *
 * CRITICAL: This function validates all arguments and terminates early with clear error messages
 * if any required arguments are missing or invalid. It will NEVER return undefined values
 * that could be used in path construction.
 */
async function parseCliArguments(): Promise<ValidatedScaffoldingArgs> {
	const { values } = parseArgs({
		args: process.argv.slice(2),
		options: {
			unit: {
				type: "string",
				short: "u"
			},
			type: {
				type: "string",
				short: "t"
			},
			id: {
				type: "string",
				short: "i"
			},
			help: {
				type: "boolean",
				short: "h"
			},
			"list-units": {
				type: "boolean"
			},
			"list-chapters": {
				type: "boolean"
			}
		},
		strict: false,
		allowPositionals: true
	});

	// Handle discovery options first
	if (values["list-units"]) {
		displayAvailableUnits();
		process.exit(0);
	}

	if (values["list-chapters"]) {
		if (!values.unit || typeof values.unit !== "string") {
			console.error("Error: --list-chapters requires --unit parameter");
			console.error("Use --list-units to see available units first");
			process.exit(1);
		}

		const unitIdentification = identifyUnit(values.unit);
		if (!unitIdentification.unitNumber) {
			console.error(`Error: Unit "${values.unit}" not found`);
			console.error("Use --list-units to see available units");
			process.exit(1);
		}

		displayAvailableChapters(unitIdentification.unitNumber);
		process.exit(0);
	}

	if (values.help) {
		console.log(`
Content Scaffolding Generator - Ultra-Flexible Batch Generation

USAGE:
  Data-driven mode (processes all chapters from content-menu.ts):
    pnpm run scaffold-content
    npx tsx src/scripts/content-scaffolding.ts

  Flexible batch mode (any combination of filters):
    pnpm run scaffold-content -- --unit=1                    # All content for Unit 1
    pnpm run scaffold-content -- --type=lesson               # All lessons across all units
    pnpm run scaffold-content -- --unit=1 --type=lesson      # All lessons for Unit 1
    pnpm run scaffold-content -- --id=01_01                  # All content types for chapter 01_01
    pnpm run scaffold-content -- --unit=1 --id=01_01         # All types for chapter 01_01 in Unit 1
    pnpm run scaffold-content -- --type=quiz --id=01_02      # Quiz for chapter 01_02 across all matching units

  Parameter-based mode (single chapter - all three parameters required):
    pnpm run scaffold-content -- --unit=1 --type="lesson" --id="01_01"

  Discovery mode (explore available content):
    pnpm run scaffold-content -- --list-units
    pnpm run scaffold-content -- --list-chapters --unit=1

MODES:
  🔄 Data-driven mode (default when no arguments provided):
     • Reads all chapters from src/data/generated/content-menu.ts
     • Creates only missing files (idempotent execution)
     • Scans for orphan files not referenced in content menu
     • Provides comprehensive summary report with statistics

  ⚡ Flexible batch mode (when partial arguments provided):
     • Any combination of --unit, --type, --id filters supported
     • Generates all matching content from content-menu.ts
     • Maximum flexibility: mix and match filters as needed
     • Idempotent execution (skips existing files)

  📋 Parameter-based mode (when all three arguments provided):
     • Creates a single content file with specified parameters
     • Supports flexible unit identification (numeric or string)

  🔍 Discovery mode:
     • --list-units: Shows all available units
     • --list-chapters --unit=N: Shows chapters for specific unit

UNIT IDENTIFICATION:
  Numeric (most precise):     --unit=1, --unit=2, --unit=3
  String (for unique techs):  --unit="python", --unit="go"
  Note: Units 3-9 use "microservices" - use numeric identification

ARGUMENTS:
  --unit, -u           Unit filter (number or string)
  --type, -t           Content type filter (lesson, quiz, study_guide, exam, project)
  --id, -i             Chapter ID filter (matches exact or base pattern like 01_01)
  --help, -h           Show this help message
  --list-units         Display all available units
  --list-chapters      Display chapters for specified unit

FLEXIBLE BATCH EXAMPLES:
  --unit=1                    Generate ALL content for Unit 1 (lessons, quizzes, etc.)
  --type=lesson               Generate ALL lessons across ALL units
  --unit=1 --type=lesson      Generate ALL lessons for Unit 1 only
  --id=01_01                  Generate ALL content types for chapter 01_01
  --unit=1 --id=01_01         Generate ALL types for chapter 01_01 in Unit 1
  --type=quiz --id=01_02      Generate quiz for chapter 01_02 (any matching unit)
  --unit="python" --type=quiz Generate ALL quizzes for Python unit

Current Configuration (from src/config/settings.ts):
  Lessons:      ${CONFIG.lessons.sections} sections, ${CONFIG.lessons.codeBlocks} code blocks, ${CONFIG.lessons.diagrams} diagrams
  Quizzes:      ${CONFIG.quizzes.questions} questions (diverse types: ${CONFIG.quizzes.diverseTypes})
  Exams:        ${CONFIG.exams.questions} questions (diverse types: ${CONFIG.exams.diverseTypes})
  Study Guides: ${CONFIG.studyGuides.flashcards} flashcards
  Projects:     ${CONFIG.projects.sections} sections, ${CONFIG.projects.requirements} requirements

Examples:
  pnpm run scaffold-content -- --unit=1 --type="lesson" --id="01_01"  # Single file
  pnpm run scaffold-content -- --unit=1                              # All Unit 1 content
  pnpm run scaffold-content -- --type=lesson                         # All lessons
  pnpm run scaffold-content -- --unit="python" --type="quiz"         # Python quizzes
  pnpm run scaffold-content -- --list-units
  pnpm run scaffold-content -- --list-chapters --unit=1
`);
		process.exit(0);
	}

	// CRITICAL INPUT VALIDATION: Ensure no undefined values can proceed
	// This prevents the creation of files with 'undefined' in their paths
	if (!values.unit && !values.type && !values.id) {
		console.error("❌ ERROR: Missing required arguments");
		console.error("");
		console.error(
			"The content scaffolding generator requires at least one of the following arguments:"
		);
		console.error("  --unit=<unit>     Unit identifier (number or string)");
		console.error("  --type=<type>     Content type (lesson, quiz, study_guide, exam, project)");
		console.error("  --id=<id>         Chapter ID");
		console.error("");
		console.error("Examples:");
		console.error(
			'  npx tsx src/scripts/content-scaffolding.ts --unit=1 --type=lesson --id="01_01"'
		);
		console.error(
			"  npx tsx src/scripts/content-scaffolding.ts --unit=1  # Show all Unit 1 content"
		);
		console.error("  npx tsx src/scripts/content-scaffolding.ts --type=quiz  # Show all quizzes");
		console.error("");
		console.error("For exploration:");
		console.error("  --help            Show full usage information");
		console.error("  --list-units      Show all available units");
		console.error("");
		process.exit(1);
	}

	// Check if this should trigger flexible batch generation
	const hasPartialArgs =
		(values.unit && typeof values.unit === "string") || values.type || values.id;
	const hasAllRequiredArgs = values.unit && values.type && values.id;

	// Handle flexible batch generation - any combination of unit, type, id (but not all three)
	if (hasPartialArgs && !hasAllRequiredArgs) {
		let unitNumber: number | undefined;

		// Validate unit if provided - handle string/boolean type issue
		if (values.unit && typeof values.unit === "string") {
			const unitIdentification = identifyUnit(values.unit);

			if (unitIdentification.isAmbiguous && unitIdentification.matchedUnits) {
				console.error(`Error: Ambiguous unit identifier "${values.unit}"`);
				console.error("Multiple units match this identifier:");
				unitIdentification.matchedUnits.forEach((unit) => {
					console.error(`  Unit ${unit.unitNumber}: ${unit.title}`);
				});
				console.error("\nUse numeric unit identifier for precision:");
				unitIdentification.matchedUnits.forEach((unit) => {
					console.error(`  --unit=${unit.unitNumber}`);
				});
				process.exit(1);
			}

			if (!unitIdentification.unitNumber) {
				console.error(`Error: Unit "${values.unit}" not found`);
				console.error("Use --list-units to see available units");
				process.exit(1);
			}

			unitNumber = unitIdentification.unitNumber;
		}

		// Execute flexible batch generation and exit
		// Normalize ID if provided to ensure consistent filtering
		const normalizedId = values.id ? normalizeId(values.id as string) : undefined;
		await executeFlexibleGeneration(
			unitNumber,
			values.type as ChapterType | undefined,
			normalizedId
		);
		process.exit(0);
	}

	// CRITICAL: Validate all required arguments are present and are proper strings
	// This is the final gate to prevent undefined values from proceeding to path generation
	if (
		!values.unit ||
		typeof values.unit !== "string" ||
		!values.type ||
		typeof values.type !== "string" ||
		!values.id ||
		typeof values.id !== "string"
	) {
		console.error("❌ ERROR: Missing or invalid required arguments for single content generation");
		console.error("");
		console.error("For single content file generation, all three arguments are required:");
		console.error("  --unit=<unit>     Unit identifier (number or string) - REQUIRED");
		console.error("  --type=<type>     Content type - REQUIRED");
		console.error("  --id=<id>         Chapter ID - REQUIRED");
		console.error("");
		console.error("Example:");
		console.error(
			'  npx tsx src/scripts/content-scaffolding.ts --unit=1 --type=lesson --id="01_01"'
		);
		console.error("");
		console.error("For batch generation or exploration:");
		console.error("  --unit=1                        # Generate all content for Unit 1");
		console.error("  --type=quiz                     # Generate all quizzes across all units");
		console.error("  --list-units                    # Show all available units");
		console.error("  --list-chapters --unit=1        # Show chapters for specific unit");
		console.error("");
		process.exit(1);
	}

	// Validate and resolve unit identification
	const unitIdentification = identifyUnit(values.unit);

	if (unitIdentification.isAmbiguous && unitIdentification.matchedUnits) {
		console.error(`Error: Ambiguous unit identifier "${values.unit}"`);
		console.error("Multiple units match this identifier:");
		unitIdentification.matchedUnits.forEach((unit) => {
			console.error(`  Unit ${unit.unitNumber}: ${unit.title}`);
		});
		console.error("\nUse numeric unit identifier for precision:");
		unitIdentification.matchedUnits.forEach((unit) => {
			console.error(`  --unit=${unit.unitNumber} --type="${values.type}" --id="${values.id}"`);
		});
		process.exit(1);
	}

	// CRITICAL: Ensure unit was successfully identified and is not undefined
	if (!unitIdentification.unitNumber) {
		console.error(`❌ ERROR: Unit "${values.unit}" not found`);
		console.error("");
		console.error("Available options:");
		console.error("  --list-units                    # Show all available units");
		console.error("  --unit=1, --unit=2, etc.       # Use numeric unit identifier");
		console.error('  --unit="python", --unit="go"    # Use string for unique technologies');
		console.error("");
		process.exit(1);
	}

	// CRITICAL: Validate content type to prevent undefined type values
	const validTypes: ChapterType[] = [
		"overview",
		"lesson",
		"study_guide",
		"quiz",
		"exam",
		"project"
	];
	if (
		!values.type ||
		typeof values.type !== "string" ||
		!validTypes.includes(values.type as ChapterType)
	) {
		console.error(`❌ ERROR: Invalid content type "${values.type}"`);
		console.error("");
		console.error("Valid content types:");
		validTypes.forEach((type) => {
			console.error(`  ${type.padEnd(12)} - ${getTypeDescription(type)}`);
		});
		console.error("");
		console.error("Example:");
		console.error(`  --type=lesson`);
		console.error("");
		process.exit(1);
	}

	// FINAL VALIDATION: Ensure all returned values are defined strings
	// This is the last checkpoint before values are used in path generation
	const unit = unitIdentification.unitNumber?.toString();
	const type = values.type as ChapterType;

	// CRITICAL: Normalize ID to ensure consistent format across all generated files
	// This converts various input formats (1, 1.1, 01_01) to standardized "01_01" format
	const id = normalizeId(values.id as string);

	if (!unit || !type || !id) {
		console.error("❌ CRITICAL ERROR: Validation failed - undefined values detected");
		console.error(`  unit: ${unit || "UNDEFINED"}`);
		console.error(`  type: ${type || "UNDEFINED"}`);
		console.error(`  id: ${id || "UNDEFINED"}`);
		console.error("");
		console.error("This is a bug in the argument validation logic. Please report this issue.");
		process.exit(1);
	}

	return { unit, type, id };
}

/**
 * Generate output file path based on arguments
 */
function generateFilePath(args: ValidatedScaffoldingArgs): string {
	// Use the unified navigation path generator to ensure consistency
	// with the content-menu-generator.ts
	const config: UnifiedPathConfig = {
		contentType: args.type,
		unitNum: args.unit,
		chapterNum: args.type === "overview" ? undefined : extractChapterFromId(args.id),
		titleSlug: generateTitleSlugForScaffolding(args)
	};

	const paths = generateNavigationPaths(config);

	// Return the data path but as a full file system path
	return join("src/data", paths.dataPath);
}

/**
 * Extract chapter number from scaffolding ID format
 */
function extractChapterFromId(id: string): string | undefined {
	// Handle formats like "01_01", "01_10", etc.
	const match = id.match(/^\d+_(\d+)$/);
	if (match) {
		return match[1];
	}
	// Fallback for other formats
	return "1";
}

/**
 * Generate a title slug for scaffolding based on type and unit
 */
function generateTitleSlugForScaffolding(args: ValidatedScaffoldingArgs): string {
	const unitTitle = findUnitTitle(args.unit) || `unit_${args.unit}`;

	switch (args.type) {
		case "overview":
			return unitTitle
				.toLowerCase()
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, "_");
		case "exam":
			return "final_exam";
		default:
			return `${args.type}_${args.unit}`;
	}
}

/**
 * Find unit title from content menu for better slug generation
 */
function findUnitTitle(unitNum: string): string | null {
	const unit = contentMenu.units.find((u) => u.unitNumber === parseInt(unitNum));
	if (unit) {
		// Extract title without "Unit X: " prefix
		return unit.title.replace(/^Unit \d+:\s*/, "");
	}
	return null;
}

/**
 * Add content object to source file using AST manipulation
 */
function addContentToSourceFile(
	sourceFile: SourceFile,
	content: Record<string, unknown>,
	args: ValidatedScaffoldingArgs
): void {
	// Determine variable name based on content type
	const variableName = `${args.type}Content`;

	// Create the variable declaration
	const variableDeclaration = sourceFile.addVariableStatement({
		declarationKind: VariableDeclarationKind.Const,
		isExported: true,
		declarations: [
			{
				name: variableName,
				type: getContentTypeAnnotation(args.type),
				initializer: JSON.stringify(content, null, "\t")
			}
		]
	});

	// Add JSDoc comment
	variableDeclaration.addJsDoc({
		description: `Generated ${args.type} content for ${args.unit} unit.

This is scaffolded placeholder content. Replace with real educational material
that follows the content standards defined in CONTENT-STANDARDS.md.

Content includes minimum required elements:
${getContentSummary(args.type)}

@status scaffold - Needs to be developed into final educational content
@unit ${args.unit}
@chapterId ${args.id}`
	});
}

/**
 * Get content summary for JSDoc based on type
 */
function getContentSummary(type: ChapterType): string {
	switch (type) {
		case "lesson":
			return `- ${CONFIG.lessons.sections} content sections with diverse diagrams
- ${CONFIG.lessons.codeBlocks} code block(s) with cloud-native examples
- ${CONFIG.lessons.diagrams} diagram(s) using different types (flowchart, sequence, class, etc.)
- Learning objectives and prerequisites`;
		case "quiz":
			return `- ${CONFIG.quizzes.questions} quiz questions
- Diverse question types: single choice, multiple choice, code completion, true/false, drag & drop
- Explanations for each question`;
		case "exam":
			return `- ${CONFIG.exams.questions} exam questions
- Diverse question types for comprehensive assessment
- Time limit and passing score`;
		case "study_guide":
			return `- ${CONFIG.studyGuides.flashcards} flashcards
- Question/answer format
- Categorization and tags`;
		case "project":
			return `- ${CONFIG.projects.sections} project phases
- ${CONFIG.projects.requirements} requirements
- ${CONFIG.projects.deliverables} deliverables`;
		default:
			return "- Placeholder content structure";
	}
}

/**
 * Get TypeScript type annotation for content type with underscore prefix
 */
function getContentTypeAnnotation(type: ChapterType): string {
	switch (type) {
		case "lesson":
		case "overview":
			return "_LessonContent";
		case "quiz":
			return "_QuizContent";
		case "study_guide":
			return "_StudyGuideContent";
		case "exam":
			return "_ExamContent";
		case "project":
			return "_ProjectContent";
		default:
			return "_LessonContent";
	}
}

// ============================================================================
// BATCH GENERATION FUNCTIONS
// ============================================================================

/**
 * Execute flexible batch generation based on provided filters
 */
async function executeFlexibleGeneration(
	unitFilter?: number,
	typeFilter?: ChapterType,
	idFilter?: string
): Promise<void> {
	console.log("🔄 Content Scaffolding Generator - Flexible Batch Mode");
	console.log("======================================================");
	console.log("");

	// Describe what we're generating
	let description = "📋 Generating content: ";
	const filters = [];

	if (unitFilter) filters.push(`Unit ${unitFilter}`);
	if (typeFilter) filters.push(`Type: ${typeFilter}`);
	if (idFilter) filters.push(`ID: ${idFilter}`);

	if (filters.length === 0) {
		description += "ALL content (all units, all types)";
	} else {
		description += filters.join(" + ");
	}

	console.log(description);
	console.log("");

	// Collect all chapters that match the filters
	const chaptersToProcess: Array<{ unit: MenuUnit; chapter: MenuChapter }> = [];

	// If specific ID is provided, find all related content
	if (idFilter) {
		for (const unit of contentMenu.units) {
			// Skip if unit filter is specified and doesn't match
			if (unitFilter && unit.unitNumber !== unitFilter) continue;

			for (const chapter of unit.chapters) {
				// Match by exact ID only - no base pattern matching for ID filtering
				if (chapter.id === idFilter) {
					// Skip if type filter is specified and doesn't match
					if (typeFilter && chapter.type !== typeFilter) continue;

					chaptersToProcess.push({ unit, chapter });
				}
			}
		}
	} else {
		// Process by unit and/or type filters
		for (const unit of contentMenu.units) {
			// Skip if unit filter is specified and doesn't match
			if (unitFilter && unit.unitNumber !== unitFilter) continue;

			for (const chapter of unit.chapters) {
				// Skip if type filter is specified and doesn't match
				if (typeFilter && chapter.type !== typeFilter) continue;

				chaptersToProcess.push({ unit, chapter });
			}
		}
	}

	if (chaptersToProcess.length === 0) {
		console.log("⚠️  No chapters found matching the specified filters");
		console.log("");
		console.log("Available options:");
		if (unitFilter) {
			const unit = contentMenu.units.find((u) => u.unitNumber === unitFilter);
			if (unit) {
				console.log(`   Unit ${unitFilter}: ${unit.title}`);
				const types = [...new Set(unit.chapters.map((c) => c.type))];
				console.log(`   Available types: ${types.join(", ")}`);
			}
		} else {
			console.log("   Use --list-units to see available units");
			console.log("   Available types: lesson, study_guide, quiz, project, exam");
		}
		return;
	}

	console.log(`🎯 Found ${chaptersToProcess.length} chapters to process`);
	console.log("");

	// Initialize TypeScript compiler
	const project = new Project({
		compilerOptions: {
			target: ScriptTarget.ES2022,
			module: ModuleKind.ESNext,
			moduleResolution: ModuleResolutionKind.Bundler,
			allowJs: true,
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
			forceConsistentCasingInFileNames: true
		}
	});

	const stats = {
		processed: 0,
		created: 0,
		skipped: 0,
		errors: 0
	};

	// Process each chapter
	for (const item of chaptersToProcess) {
		const { unit, chapter } = item;
		const dataLink = chapter.chapterDataLink;
		const fullPath = join(process.cwd(), "src", "data", dataLink);

		console.log(`   Processing: Unit ${unit.unitNumber} - ${chapter.id} - ${chapter.title}`);

		if (existsSync(fullPath)) {
			stats.skipped++;
			console.log(`     ✅ Exists - skipping`);
			continue;
		}

		try {
			// Parse chapter info
			const chapterInfo = parseChapterDataLink(dataLink);
			if (!chapterInfo) {
				stats.errors++;
				console.log(`     ❌ Failed to parse: ${dataLink}`);
				continue;
			}

			// Generate validated args from chapter data
			const args: ValidatedScaffoldingArgs = {
				unit: unit.unitNumber.toString(),
				type: chapter.type,
				id: chapter.id
			};

			// Ensure directory exists
			const dir = dirname(fullPath);
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
				console.log(`     📁 Created directory: ${dir}`);
			}

			// Create source file with imports
			const sourceFile = createContentFile(project, fullPath, args);

			// Generate content based on type
			const contentGenerator = getContentGenerator(args.type);
			const content = contentGenerator(args);

			// Add content to source file using AST
			addContentToSourceFile(sourceFile, content, args);

			// Format and save
			sourceFile.formatText();
			await sourceFile.save();

			stats.created++;
			console.log(`     ✅ Generated: ${basename(fullPath)}`);
		} catch (error) {
			stats.errors++;
			console.log(`     ❌ Error generating ${chapter.id}: ${error}`);
		}

		stats.processed++;
	}

	// Print final summary
	console.log("");
	console.log("📊 Batch Generation Summary:");
	console.log(`   Total processed: ${stats.processed}`);
	console.log(`   Files created:   ${stats.created}`);
	console.log(`   Files skipped:   ${stats.skipped}`);
	console.log(`   Errors:          ${stats.errors}`);
	console.log("");

	if (stats.created > 0) {
		console.log("✅ Batch generation completed successfully!");

		// Run validation if enabled and files were created
		const validationResults = await runContentValidation();
		const hasFailures = validationResults.some((result) => !result.success);
		if (hasFailures) {
			console.error("⚠️  Some validation checks failed, but generation was successful");
		}

		console.log("");
		console.log("Next steps:");
		console.log("1. Review the generated content structure");
		console.log("2. Replace placeholder content with real educational material");
	} else if (stats.skipped > 0 && stats.errors === 0) {
		console.log("ℹ️  All files already exist - no new content generated");
	} else if (stats.errors > 0) {
		console.log("⚠️  Batch generation completed with errors");
	}
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

// Validation logic moved to src/lib/utils/validation-utils.ts for reusability

// ============================================================================
// MAIN EXECUTION
// ============================================================================

// ============================================================================
// DATA-DRIVEN EXECUTION MODE
// ============================================================================

/**
 * Interface for tracking scaffolding statistics
 */
interface ScaffoldingStats {
	totalChapters: number;
	existingFiles: number;
	newFiles: number;
	orphanFiles: string[];
	errors: string[];
}

/**
 * Parse chapter data link to extract unit, chapter, and type information
 */
function parseChapterDataLink(chapterDataLink: string): {
	unitNum: string;
	chapterNum?: string;
	contentType: ChapterType;
	fileName: string;
} | null {
	// Expected formats:
	// 1. book/unit01/01_01_lesson_title.ts (lessons with title)
	// 2. book/unit01/01_01_quiz.ts (short format)
	// 3. book/unit01/01_99_exam_title.ts (exams)
	const longMatch = chapterDataLink.match(/book\/unit(\d+)\/(\d+)_(\d+|99)_(\w+)_.*\.ts$/);
	const shortMatch = chapterDataLink.match(/book\/unit(\d+)\/(\d+)_(\d+|99)_(\w+)\.ts$/);

	let unitNum: string;
	let fileChapter: string;
	let contentType: string;

	if (longMatch) {
		[, unitNum, , fileChapter, contentType] = longMatch;
	} else if (shortMatch) {
		[, unitNum, , fileChapter, contentType] = shortMatch;
	} else {
		console.warn(`⚠️  Unable to parse chapterDataLink: ${chapterDataLink}`);
		return null;
	}
	const fileName = basename(chapterDataLink);

	// Map content types from file names to our internal types
	const typeMapping: Record<string, ChapterType> = {
		lesson: "lesson",
		study_guide: "study_guide",
		quiz: "quiz",
		exam: "exam",
		project: "project",
		overview: "overview"
	};

	const mappedType = typeMapping[contentType] || "lesson";

	return {
		unitNum,
		chapterNum: fileChapter === "99" || fileChapter === "00" ? undefined : fileChapter,
		contentType: mappedType,
		fileName
	};
}

/**
 * Extract all chapters from content menu
 */
function extractAllChapters(): MenuChapter[] {
	const allChapters: MenuChapter[] = [];

	for (const unit of contentMenu.units) {
		allChapters.push(...unit.chapters);
	}

	return allChapters;
}

/**
 * Scan $data/book directory for existing files
 */
function scanBookDirectory(): string[] {
	const bookPath = join(process.cwd(), "src", "data", "book");
	const existingFiles: string[] = [];

	try {
		if (!existsSync(bookPath)) {
			return existingFiles;
		}

		// Scan unit directories
		const unitDirs = readdirSync(bookPath).filter((dir) => {
			const fullPath = join(bookPath, dir);
			return statSync(fullPath).isDirectory() && dir.startsWith("unit");
		});

		for (const unitDir of unitDirs) {
			const unitPath = join(bookPath, unitDir);
			const files = readdirSync(unitPath).filter((file) => file.endsWith(".ts"));

			for (const file of files) {
				// Store relative path from src/data/
				existingFiles.push(join("book", unitDir, file));
			}
		}
	} catch (error) {
		console.warn(`⚠️  Error scanning book directory: ${error}`);
	}

	return existingFiles;
}

/**
 * Find orphan files not referenced in content menu
 */
function findOrphanFiles(existingFiles: string[], chapterDataLinks: string[]): string[] {
	const normalizedDataLinks = chapterDataLinks.map((link) => link.replace(/^book\//, ""));

	const normalizedExisting = existingFiles.map((file) => file.replace(/^book\//, ""));

	return normalizedExisting.filter((file) => !normalizedDataLinks.includes(file));
}

/**
 * Execute data-driven scaffolding mode
 */
async function executeDataDrivenMode(): Promise<void> {
	console.log("🔄 Content Scaffolding Generator - Data-Driven Mode");
	console.log("==================================================");
	console.log("");

	console.log("📊 Analyzing content structure...");

	// Extract all chapters from content menu
	const allChapters = extractAllChapters();
	const stats: ScaffoldingStats = {
		totalChapters: allChapters.length,
		existingFiles: 0,
		newFiles: 0,
		orphanFiles: [],
		errors: []
	};

	console.log(`📋 Found ${stats.totalChapters} chapters in content menu`);
	console.log("");

	// Create ts-morph project
	const project = new Project({
		compilerOptions: {
			target: 2, // ES2015
			module: 1, // CommonJS
			strict: true,
			esModuleInterop: true,
			skipLibCheck: true,
			forceConsistentCasingInFileNames: true
		}
	});

	console.log("🔍 Processing chapters...");

	// Process each chapter
	for (const chapter of allChapters) {
		const dataLink = chapter.chapterDataLink;
		const fullPath = join(process.cwd(), "src", "data", dataLink);

		console.log(`   Checking: ${dataLink}`);

		if (existsSync(fullPath)) {
			stats.existingFiles++;
			console.log(`     ✅ Exists - skipping`);
			continue;
		}

		// Parse chapter info
		const chapterInfo = parseChapterDataLink(dataLink);
		if (!chapterInfo) {
			stats.errors.push(`Failed to parse: ${dataLink}`);
			continue;
		}

		try {
			// Generate scaffolding args from chapter data
			const args: ValidatedScaffoldingArgs = {
				unit: `unit${chapterInfo.unitNum}`,
				type: chapterInfo.contentType,
				id: chapterInfo.chapterNum || "0"
			};

			// Ensure directory exists
			const dir = dirname(fullPath);
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
				console.log(`     📁 Created directory: ${dir}`);
			}

			// Create source file with imports
			const sourceFile = createContentFile(project, fullPath, args);

			// Generate content based on type
			const contentGenerator = getContentGenerator(args.type);
			const content = contentGenerator(args);

			// Add content to source file using AST
			addContentToSourceFile(sourceFile, content, args);

			// Format and save
			sourceFile.formatText();
			await sourceFile.save();

			stats.newFiles++;
			console.log(`     ✨ Generated successfully`);
		} catch (error) {
			stats.errors.push(`Error generating ${dataLink}: ${error}`);
			console.log(`     ❌ Error: ${error}`);
		}
	}

	console.log("");
	console.log("🔍 Performing final validation...");

	// Scan for existing files and check for orphans
	const existingFiles = scanBookDirectory();
	const chapterDataLinks = allChapters.map((c) => c.chapterDataLink);
	stats.orphanFiles = findOrphanFiles(existingFiles, chapterDataLinks);

	// Print final report
	await printFinalReport(stats);
}

/**
 * Print comprehensive final report
 */
async function printFinalReport(stats: ScaffoldingStats): Promise<void> {
	console.log("");
	console.log("📊 SCAFFOLDING SUMMARY REPORT");
	console.log("=============================");
	console.log("");
	console.log(`📋 Total chapters defined in content-menu.ts: ${stats.totalChapters}`);
	console.log(`✅ Chapter data files that already existed: ${stats.existingFiles}`);
	console.log(`✨ New chapter data files created: ${stats.newFiles}`);
	console.log("");

	if (stats.errors.length > 0) {
		console.log("❌ ERRORS ENCOUNTERED:");
		stats.errors.forEach((error) => console.log(`   • ${error}`));
		console.log("");
	}

	if (stats.orphanFiles.length > 0) {
		console.log("⚠️  ORPHAN FILES DETECTED:");
		console.log(
			"   The following files exist in $data/book but are not mapped in content-menu.ts:"
		);
		stats.orphanFiles.forEach((file) => console.log(`   • ${file}`));
		console.log("");
		console.log("   Consider:");
		console.log("   • Adding these files to content-menu.ts if they should be included");
		console.log("   • Moving them to a different location if they're not content files");
		console.log("   • Removing them if they're no longer needed");
	} else {
		console.log("✅ No orphan files detected - all files are properly mapped!");
	}

	console.log("");

	if (stats.errors.length === 0) {
		console.log("🎉 Content scaffolding completed successfully!");

		// Run validation if enabled and files were created
		if (stats.newFiles > 0) {
			const validationResults = await runContentValidation();
			const hasFailures = validationResults.some((result) => !result.success);
			if (hasFailures) {
				console.error("⚠️  Some validation checks failed, but generation was successful");
			}
		}
	} else {
		console.log(`⚠️  Content scaffolding completed with ${stats.errors.length} error(s)`);
	}
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
	try {
		// Check if running in data-driven mode (no arguments provided)
		const hasArgs = process.argv.slice(2).length > 0;

		if (!hasArgs) {
			// Execute data-driven mode
			await executeDataDrivenMode();
			return;
		}

		// Original parameter-based mode
		console.log("🔄 Content Scaffolding Generator");
		console.log("================================");
		console.log("");
		console.log("📋 Configuration (from src/config/settings.ts):");
		console.log(
			`  Lessons:      ${CONFIG.lessons.sections} sections, ${CONFIG.lessons.codeBlocks} code blocks, ${CONFIG.lessons.diagrams} diagrams`
		);
		console.log(
			`  Quizzes:      ${CONFIG.quizzes.questions} questions (diverse types: ${CONFIG.quizzes.diverseTypes})`
		);
		console.log(
			`  Exams:        ${CONFIG.exams.questions} questions (diverse types: ${CONFIG.exams.diverseTypes})`
		);
		console.log(`  Study Guides: ${CONFIG.studyGuides.flashcards} flashcards`);
		console.log(
			`  Projects:     ${CONFIG.projects.sections} sections, ${CONFIG.projects.requirements} requirements`
		);
		console.log("");

		// Parse CLI arguments - may exit if flexible batch generation is triggered
		const args = await parseCliArguments();
		console.log(`Unit: ${args.unit}`);
		console.log(`Type: ${args.type}`);
		console.log(`ID: ${args.id}`);
		console.log("");

		// Generate file path
		const filePath = generateFilePath(args);
		console.log(`Target file: ${filePath}`);

		// Check if file already exists
		if (existsSync(filePath)) {
			console.log("⚠️  File already exists, skipping generation");
			console.log("Delete the existing file to regenerate content");
			process.exit(0);
		}

		// Ensure directory exists
		const dir = dirname(filePath);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
			console.log(`📁 Created directory: ${dir}`);
		}

		// Create ts-morph project
		const project = new Project({
			compilerOptions: {
				target: 2, // ES2015
				module: 1, // CommonJS
				strict: true,
				esModuleInterop: true,
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true
			}
		});

		// Create source file with imports
		const sourceFile = createContentFile(project, filePath, args);

		// Generate content based on type
		const contentGenerator = getContentGenerator(args.type);
		const content = contentGenerator(args);

		// Add content to source file using AST
		addContentToSourceFile(sourceFile, content, args);

		// Format and save
		sourceFile.formatText();
		await sourceFile.save();

		console.log("✅ Content scaffolding generated successfully!");

		// Run validation if enabled
		const validationResults = await runContentValidation();
		const hasFailures = validationResults.some((result) => !result.success);
		if (hasFailures) {
			console.error("⚠️  Some validation checks failed, but generation was successful");
		}

		console.log("");
		console.log("📊 Generated content summary:");
		console.log(`  ${getContentSummary(args.type)}`);
		console.log("");
		console.log("Next steps:");
		console.log("1. Review the generated content structure");
		console.log("2. Replace placeholder content with real educational material");
		console.log("3. Modify requirements in src/config/settings.ts if needed");
	} catch (error) {
		console.error("❌ Error generating content scaffolding:");
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

// Execute main function
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
}

export { main, parseCliArguments, generateFilePath, getContentGenerator };
