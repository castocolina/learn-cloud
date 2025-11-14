/**
 * Demo Question Examples for QuestionRenderer Showcase
 *
 * Provides representative examples of all 6 question types:
 * 1. single_choice - Radio button selection
 * 2. multiple_choice - Checkbox multi-select
 * 3. true_false - Boolean choice
 * 4. code_completion - Dropdown blanks in code
 * 5. drag_and_drop - Category matching
 * 6. short_answer - Text input
 *
 * Structure mirrors production quiz data for realistic testing.
 */

import type { AnyQuestion } from "$types";

export const questionExamples: AnyQuestion[] = [
	// ============================================================================
	// 1. SINGLE CHOICE - Radio button selection
	// ============================================================================
	{
		id: "demo-sc1",
		type: "single_choice",
		question: "What is Docker primarily used for in cloud-native development?",
		options: [
			"Containerization of applications",
			"Version control and Git repositories",
			"Database management systems",
			"Network security and firewalls"
		],
		correctAnswer: 0,
		explanation:
			"Docker is a containerization platform that packages applications and their dependencies into portable containers, ensuring consistency across different environments.",
		difficulty: "beginner",
		tags: ["docker", "containers", "fundamentals"]
	},

	// ============================================================================
	// 2. MULTIPLE CHOICE - Checkbox multi-select
	// ============================================================================
	{
		id: "demo-mc1",
		type: "multiple_choice",
		question: "Which of the following are core cloud-native principles? (Select all that apply)",
		options: [
			"Containerization of applications",
			"Microservices architecture",
			"Monolithic deployment strategies",
			"Infrastructure as Code (IaC)",
			"Manual server provisioning"
		],
		correctAnswers: [0, 1, 3],
		explanation:
			"Cloud-native principles emphasize containerization for portability, microservices for modularity, and Infrastructure as Code for reproducible deployments. Monolithic deployment and manual provisioning are traditional approaches that cloud-native design aims to replace.",
		difficulty: "intermediate",
		tags: ["cloud-native", "architecture", "principles"]
	},

	// ============================================================================
	// 3. TRUE/FALSE - Boolean choice
	// ============================================================================
	{
		id: "demo-tf1",
		type: "true_false",
		question:
			"Containers share the same operating system kernel, making them more lightweight than virtual machines.",
		correctAnswer: true,
		explanation:
			"Containers share the host OS kernel, requiring fewer resources than virtual machines which each run a complete operating system. This makes containers faster to start, more portable, and more efficient in resource utilization.",
		difficulty: "beginner",
		tags: ["containers", "virtualization", "fundamentals"]
	},

	// ============================================================================
	// 4. CODE COMPLETION - Dropdown blanks in code template
	// ============================================================================
	{
		id: "demo-cc1",
		type: "code_completion",
		question: "Complete the Kubernetes deployment configuration:",
		language: "yaml",
		codeTemplate:
			"apiVersion: apps/v1\nkind: _____\nmetadata:\n  name: web-app\nspec:\n  replicas: _____\n  selector:\n    matchLabels:\n      app: _____",
		blanks: [
			{
				id: "deployment-kind",
				expectedAnswer: "Deployment",
				hint: "Type of Kubernetes resource for managing pods",
				alternatives: ["Service", "Pod", "ConfigMap"]
			},
			{
				id: "replica-count",
				expectedAnswer: "3",
				hint: "Number of pod replicas for high availability",
				alternatives: ["1", "5", "10"]
			},
			{
				id: "app-label",
				expectedAnswer: "web-app",
				hint: "Label selector matching the application name",
				alternatives: ["frontend", "backend", "database"]
			}
		],
		explanation:
			"A Kubernetes Deployment manages a set of identical pods, ensuring the desired number of replicas are running. The selector's matchLabels must align with the pod template labels to enable proper pod management.",
		difficulty: "advanced",
		tags: ["kubernetes", "yaml", "deployment"]
	},

	// ============================================================================
	// 5. DRAG AND DROP - Category matching
	// ============================================================================
	{
		id: "demo-dd1",
		type: "drag_and_drop",
		question: "Match each cloud-native tool with its primary purpose:",
		items: [
			{ id: "docker", content: "Docker", category: "containerization" },
			{ id: "kubernetes", content: "Kubernetes", category: "orchestration" },
			{ id: "prometheus", content: "Prometheus", category: "monitoring" },
			{ id: "terraform", content: "Terraform", category: "infrastructure" }
		],
		categories: [
			{
				id: "containerization",
				title: "Containerization",
				description: "Tools for creating and managing containers"
			},
			{
				id: "orchestration",
				title: "Orchestration",
				description: "Tools for managing container clusters"
			},
			{
				id: "monitoring",
				title: "Monitoring",
				description: "Tools for observability and metrics"
			},
			{
				id: "infrastructure",
				title: "Infrastructure as Code",
				description: "Tools for provisioning infrastructure"
			}
		],
		explanation:
			"Each tool serves a specific purpose in the cloud-native ecosystem: Docker packages applications into containers, Kubernetes orchestrates container deployment at scale, Prometheus monitors system health and metrics, and Terraform provisions infrastructure through declarative code.",
		difficulty: "intermediate",
		tags: ["cloud-native", "tools", "architecture"]
	},

	// ============================================================================
	// 6. SHORT ANSWER - Text input with validation
	// ============================================================================
	{
		id: "demo-sa1",
		type: "short_answer",
		question: "What does IaC stand for in cloud-native development?",
		acceptedAnswers: ["Infrastructure as Code", "infrastructure as code", "Infrastructure As Code"],
		caseSensitive: false,
		explanation:
			"Infrastructure as Code (IaC) is the practice of managing infrastructure through machine-readable definition files rather than manual configuration. Tools like Terraform, CloudFormation, and Pulumi enable version-controlled, reproducible infrastructure provisioning.",
		difficulty: "beginner",
		tags: ["cloud-native", "infrastructure", "terminology"]
	}
];
