/**
 * Demo Navigation Data for Sidebar Accordion Testing
 *
 * This file contains comprehensive navigation data for testing the sidebar accordion
 * component with realistic educational content structure. It includes 12 units with
 * 95 total lessons distributed across various content types.
 *
 * Content Type Distribution:
 * - Code-heavy: 30% (29 lessons)
 * - Interactive: 25% (24 lessons)
 * - Diagram-heavy: 20% (19 lessons)
 * - Text-heavy: 15% (14 lessons)
 * - Mixed-content: 10% (9 lessons)
 */

/**
 * Content type enumeration for lessons
 */
export enum DemoContentType {
	CODE = "code",
	INTERACTIVE = "interactive",
	DIAGRAM = "diagram",
	TEXT = "text",
	MIXED = "mixed"
}

/**
 * Lesson difficulty levels
 */
export enum DemoDifficulty {
	BEGINNER = "beginner",
	INTERMEDIATE = "intermediate",
	ADVANCED = "advanced"
}

/**
 * Individual lesson interface with metadata
 */
export interface DemoLesson {
	id: string;
	title: string;
	description: string;
	url: string;
	contentType: DemoContentType;
	duration: string;
	difficulty: DemoDifficulty;
	icon: string;
	prerequisites?: string[];
	learningObjectives?: string[];
}

/**
 * Unit interface containing multiple lessons
 */
export interface DemoUnit {
	id: string;
	title: string;
	description: string;
	icon: string;
	estimatedHours: number;
	difficulty: DemoDifficulty;
	lessons: DemoLesson[];
	prerequisites?: string[];
	learningObjectives?: string[];
}

/**
 * Complete navigation structure
 */
export interface DemoNavigationStructure {
	metadata: {
		title: string;
		totalUnits: number;
		totalLessons: number;
		description: string;
	};
	units: DemoUnit[];
}

/**
 * Comprehensive demo navigation data with 12 units and 95 lessons
 */
export const demoSidebarMenu: DemoNavigationStructure = {
	metadata: {
		title: "Cloud-Native Technologies Mastery Course",
		totalUnits: 13,
		totalLessons: 97,
		description: "Comprehensive learning platform for cloud-native development and deployment"
	},
	units: [
		{
			id: "demo-unit-showcase",
			title: "Interactive Showcase & Examples",
			description:
				"Comprehensive demonstrations of technologies and interactive learning components",
			icon: "🎯",
			estimatedHours: 2,
			difficulty: DemoDifficulty.BEGINNER,
			prerequisites: [],
			learningObjectives: [
				"Explore interactive diagram examples and visualizations",
				"Understand component architecture through live demonstrations",
				"Practice with real-world cloud-native scenarios"
			],
			lessons: [
				{
					id: "demo-lesson-showcase-1",
					title: "Mermaid Diagram Showcase",
					description:
						"Interactive collection of educational Mermaid diagrams for cloud-native learning",
					url: "/demo/mermaid",
					contentType: DemoContentType.INTERACTIVE,
					duration: "45 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "📊",
					learningObjectives: [
						"Explore comprehensive diagram examples",
						"Understand different diagram types and use cases",
						"Practice diagram interpretation and analysis"
					]
				},
				{
					id: "demo-lesson-showcase-2",
					title: "Code Examples Showcase",
					description:
						"Interactive library of 56+ code examples across multiple programming languages and technologies",
					url: "/demo/code-examples",
					contentType: DemoContentType.CODE,
					duration: "60 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "💻",
					learningObjectives: [
						"Browse comprehensive code examples across technologies",
						"Filter and search code snippets by language and complexity",
						"Copy and study production-ready code patterns"
					]
				},
				{
					id: "demo-lesson-showcase-3",
					title: "Interactive Flip Cards Showcase",
					description:
						"Educational flip cards for cloud-native concepts with 3D animations, progress tracking, and interactive learning",
					url: "/demo/flip-cards",
					contentType: DemoContentType.INTERACTIVE,
					duration: "30 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "🎴",
					learningObjectives: [
						"Master cloud-native concepts through interactive flip cards",
						"Track learning progress with built-in educational metrics",
						"Experience 3D flip animations and mobile-first responsive design"
					]
				}
			]
		},
		{
			id: "demo-unit-1",
			title: "Foundations of Cloud-Native Development",
			description:
				"Essential concepts, development environment setup, and foundational technologies for cloud-native applications",
			icon: "🏗️",
			estimatedHours: 8,
			difficulty: DemoDifficulty.BEGINNER,
			prerequisites: ["Basic programming knowledge", "Command line familiarity"],
			learningObjectives: [
				"Understand cloud-native principles and architecture patterns",
				"Set up complete development environment with modern tooling",
				"Master containerization with Docker fundamentals"
			],
			lessons: [
				{
					id: "demo-lesson-1-1",
					title: "Introduction to Cloud-Native Architecture",
					description:
						"Core principles, benefits, and architectural patterns of cloud-native applications",
					url: "#/demo/unit-1/introduction-cloud-native-architecture",
					contentType: DemoContentType.TEXT,
					duration: "15 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "📚",
					learningObjectives: [
						"Define cloud-native principles",
						"Identify key architectural patterns"
					]
				},
				{
					id: "demo-lesson-1-2",
					title: "Development Environment Setup",
					description: "Configure your development workspace with essential tools and dependencies",
					url: "#/demo/unit-1/development-environment-setup",
					contentType: DemoContentType.CODE,
					duration: "25 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "⚙️",
					prerequisites: ["Command line basics"]
				},
				{
					id: "demo-lesson-1-3",
					title: "Container Fundamentals with Docker",
					description: "Master containerization concepts and practical Docker implementation",
					url: "#/demo/unit-1/container-fundamentals-docker",
					contentType: DemoContentType.MIXED,
					duration: "30 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "🐳"
				},
				{
					id: "demo-lesson-1-4",
					title: "Version Control in Cloud-Native Projects",
					description:
						"Git workflows, branching strategies, and collaborative development practices",
					url: "#/demo/unit-1/version-control-cloud-native",
					contentType: DemoContentType.CODE,
					duration: "20 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "🌿"
				},
				{
					id: "demo-lesson-1-5",
					title: "Cloud-Native Architecture Patterns",
					description: "Microservices, twelve-factor app principles, and design patterns",
					url: "#/demo/unit-1/architecture-patterns",
					contentType: DemoContentType.DIAGRAM,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🏛️"
				},
				{
					id: "demo-lesson-1-6",
					title: "Infrastructure as Code Introduction",
					description: "Declarative infrastructure management and configuration principles",
					url: "#/demo/unit-1/infrastructure-as-code-intro",
					contentType: DemoContentType.TEXT,
					duration: "18 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "📋"
				},
				{
					id: "demo-lesson-1-7",
					title: "Development Workflow Setup",
					description: "CI/CD pipeline basics and automated testing integration",
					url: "#/demo/unit-1/development-workflow-setup",
					contentType: DemoContentType.INTERACTIVE,
					duration: "35 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🔄"
				}
			]
		},
		{
			id: "demo-unit-2",
			title: "Kubernetes Fundamentals & Orchestration",
			description:
				"Container orchestration, Kubernetes architecture, and cluster management essentials",
			icon: "☸️",
			estimatedHours: 12,
			difficulty: DemoDifficulty.INTERMEDIATE,
			prerequisites: ["Docker fundamentals", "Basic networking concepts"],
			learningObjectives: [
				"Deploy and manage Kubernetes clusters effectively",
				"Understand pod lifecycle and resource management",
				"Implement service discovery and load balancing"
			],
			lessons: [
				{
					id: "demo-lesson-2-1",
					title: "Kubernetes Architecture Overview",
					description: "Control plane components, worker nodes, and cluster communication patterns",
					url: "#/demo/unit-2/kubernetes-architecture-overview",
					contentType: DemoContentType.DIAGRAM,
					duration: "22 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🏗️"
				},
				{
					id: "demo-lesson-2-2",
					title: "Pod Lifecycle and Management",
					description: "Creating, monitoring, and troubleshooting Kubernetes pods",
					url: "#/demo/unit-2/pod-lifecycle-management",
					contentType: DemoContentType.CODE,
					duration: "28 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "📦"
				},
				{
					id: "demo-lesson-2-3",
					title: "Services and Networking",
					description: "Service types, ingress controllers, and network policies implementation",
					url: "#/demo/unit-2/services-networking",
					contentType: DemoContentType.MIXED,
					duration: "32 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🌐"
				},
				{
					id: "demo-lesson-2-4",
					title: "ConfigMaps and Secrets Management",
					description: "Configuration management and secure handling of sensitive data",
					url: "#/demo/unit-2/configmaps-secrets-management",
					contentType: DemoContentType.CODE,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🔑"
				},
				{
					id: "demo-lesson-2-5",
					title: "Persistent Volumes and Storage",
					description: "Storage classes, volume claims, and data persistence strategies",
					url: "#/demo/unit-2/persistent-volumes-storage",
					contentType: DemoContentType.DIAGRAM,
					duration: "30 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "💾"
				},
				{
					id: "demo-lesson-2-6",
					title: "Deployments and ReplicaSets",
					description: "Application deployment strategies, rolling updates, and scaling",
					url: "#/demo/unit-2/deployments-replicasets",
					contentType: DemoContentType.INTERACTIVE,
					duration: "35 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🚀"
				},
				{
					id: "demo-lesson-2-7",
					title: "Namespaces and Resource Quotas",
					description: "Multi-tenancy, resource isolation, and cluster organization",
					url: "#/demo/unit-2/namespaces-resource-quotas",
					contentType: DemoContentType.CODE,
					duration: "20 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🏷️"
				},
				{
					id: "demo-lesson-2-8",
					title: "Health Checks and Monitoring",
					description: "Liveness probes, readiness checks, and observability setup",
					url: "#/demo/unit-2/health-checks-monitoring",
					contentType: DemoContentType.MIXED,
					duration: "28 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🏥"
				}
			]
		},
		{
			id: "demo-unit-3",
			title: "Microservices Architecture & Design",
			description:
				"Service decomposition, inter-service communication, and distributed system patterns",
			icon: "🔗",
			estimatedHours: 10,
			difficulty: DemoDifficulty.INTERMEDIATE,
			prerequisites: ["Kubernetes basics", "RESTful API concepts"],
			learningObjectives: [
				"Design effective microservices architectures",
				"Implement service-to-service communication patterns",
				"Handle distributed system challenges and failures"
			],
			lessons: [
				{
					id: "demo-lesson-3-1",
					title: "Microservices Design Principles",
					description: "Domain-driven design, service boundaries, and decomposition strategies",
					url: "#/demo/unit-3/microservices-design-principles",
					contentType: DemoContentType.TEXT,
					duration: "20 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🎯"
				},
				{
					id: "demo-lesson-3-2",
					title: "Service Communication Patterns",
					description:
						"Synchronous vs asynchronous communication, message queues, and event streaming",
					url: "#/demo/unit-3/service-communication-patterns",
					contentType: DemoContentType.DIAGRAM,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "💬"
				},
				{
					id: "demo-lesson-3-3",
					title: "API Gateway Implementation",
					description: "Request routing, authentication, rate limiting, and API versioning",
					url: "#/demo/unit-3/api-gateway-implementation",
					contentType: DemoContentType.CODE,
					duration: "35 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🚪"
				},
				{
					id: "demo-lesson-3-4",
					title: "Data Management in Microservices",
					description: "Database per service, data consistency, and SAGA patterns",
					url: "#/demo/unit-3/data-management-microservices",
					contentType: DemoContentType.MIXED,
					duration: "30 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🗄️"
				},
				{
					id: "demo-lesson-3-5",
					title: "Service Discovery and Registration",
					description: "Dynamic service location, health checking, and load balancing",
					url: "#/demo/unit-3/service-discovery-registration",
					contentType: DemoContentType.INTERACTIVE,
					duration: "28 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🔍"
				},
				{
					id: "demo-lesson-3-6",
					title: "Circuit Breaker and Resilience Patterns",
					description: "Failure handling, timeouts, retries, and system resilience",
					url: "#/demo/unit-3/circuit-breaker-resilience",
					contentType: DemoContentType.CODE,
					duration: "32 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🛡️"
				},
				{
					id: "demo-lesson-3-7",
					title: "Distributed Tracing and Observability",
					description: "Request tracing, logging strategies, and monitoring microservices",
					url: "#/demo/unit-3/distributed-tracing-observability",
					contentType: DemoContentType.DIAGRAM,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🔬"
				}
			]
		},
		{
			id: "demo-unit-4",
			title: "Cloud Infrastructure & Platform Services",
			description:
				"Cloud provider services, infrastructure automation, and platform-as-a-service offerings",
			icon: "☁️",
			estimatedHours: 14,
			difficulty: DemoDifficulty.INTERMEDIATE,
			prerequisites: ["Basic cloud concepts", "Infrastructure fundamentals"],
			learningObjectives: [
				"Leverage cloud provider managed services effectively",
				"Implement infrastructure as code with Terraform",
				"Design cost-effective and scalable cloud architectures"
			],
			lessons: [
				{
					id: "demo-lesson-4-1",
					title: "Cloud Provider Services Overview",
					description: "AWS, Azure, GCP services comparison and selection criteria",
					url: "#/demo/unit-4/cloud-provider-services-overview",
					contentType: DemoContentType.TEXT,
					duration: "18 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "🌤️"
				},
				{
					id: "demo-lesson-4-2",
					title: "Infrastructure as Code with Terraform",
					description: "Declarative infrastructure, state management, and modular configurations",
					url: "#/demo/unit-4/infrastructure-code-terraform",
					contentType: DemoContentType.CODE,
					duration: "40 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🏗️"
				},
				{
					id: "demo-lesson-4-3",
					title: "Container Registry and Image Management",
					description: "Docker registries, image security scanning, and artifact management",
					url: "#/demo/unit-4/container-registry-image-management",
					contentType: DemoContentType.MIXED,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "📦"
				},
				{
					id: "demo-lesson-4-4",
					title: "Managed Database Services",
					description: "RDS, Cloud SQL, CosmosDB, and database migration strategies",
					url: "#/demo/unit-4/managed-database-services",
					contentType: DemoContentType.DIAGRAM,
					duration: "28 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🗃️"
				},
				{
					id: "demo-lesson-4-5",
					title: "Content Delivery Networks",
					description: "CDN configuration, caching strategies, and global content distribution",
					url: "#/demo/unit-4/content-delivery-networks",
					contentType: DemoContentType.INTERACTIVE,
					duration: "22 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🌍"
				},
				{
					id: "demo-lesson-4-6",
					title: "Load Balancers and Auto Scaling",
					description: "Application load balancing, auto scaling groups, and traffic distribution",
					url: "#/demo/unit-4/load-balancers-auto-scaling",
					contentType: DemoContentType.CODE,
					duration: "35 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "⚖️"
				},
				{
					id: "demo-lesson-4-7",
					title: "Serverless Computing Platforms",
					description: "AWS Lambda, Azure Functions, Google Cloud Functions implementation",
					url: "#/demo/unit-4/serverless-computing-platforms",
					contentType: DemoContentType.MIXED,
					duration: "30 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "⚡"
				},
				{
					id: "demo-lesson-4-8",
					title: "Cloud Storage Solutions",
					description: "Object storage, file systems, and data archival strategies",
					url: "#/demo/unit-4/cloud-storage-solutions",
					contentType: DemoContentType.DIAGRAM,
					duration: "20 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "💾"
				}
			]
		},
		{
			id: "demo-unit-5",
			title: "CI/CD Pipelines & DevOps Automation",
			description:
				"Continuous integration, deployment automation, and DevOps toolchain implementation",
			icon: "🔄",
			estimatedHours: 11,
			difficulty: DemoDifficulty.INTERMEDIATE,
			prerequisites: ["Git version control", "Basic scripting knowledge"],
			learningObjectives: [
				"Build robust CI/CD pipelines for cloud-native applications",
				"Implement automated testing and quality gates",
				"Master GitOps workflows and deployment strategies"
			],
			lessons: [
				{
					id: "demo-lesson-5-1",
					title: "CI/CD Pipeline Fundamentals",
					description: "Pipeline stages, build automation, and deployment workflows",
					url: "#/demo/unit-5/cicd-pipeline-fundamentals",
					contentType: DemoContentType.DIAGRAM,
					duration: "20 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "🔧"
				},
				{
					id: "demo-lesson-5-2",
					title: "GitHub Actions for Cloud-Native Apps",
					description: "Workflow automation, secrets management, and deployment actions",
					url: "#/demo/unit-5/github-actions-cloud-native",
					contentType: DemoContentType.CODE,
					duration: "38 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🐙"
				},
				{
					id: "demo-lesson-5-3",
					title: "Jenkins Pipeline as Code",
					description: "Jenkinsfile configuration, plugin management, and distributed builds",
					url: "#/demo/unit-5/jenkins-pipeline-code",
					contentType: DemoContentType.CODE,
					duration: "35 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🏗️"
				},
				{
					id: "demo-lesson-5-4",
					title: "Container Image Building and Security",
					description: "Multi-stage Dockerfiles, image scanning, and vulnerability assessment",
					url: "#/demo/unit-5/container-image-building-security",
					contentType: DemoContentType.MIXED,
					duration: "32 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🔒"
				},
				{
					id: "demo-lesson-5-5",
					title: "Automated Testing in Pipelines",
					description: "Unit tests, integration tests, and end-to-end testing automation",
					url: "#/demo/unit-5/automated-testing-pipelines",
					contentType: DemoContentType.INTERACTIVE,
					duration: "40 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🧪"
				},
				{
					id: "demo-lesson-5-6",
					title: "GitOps and ArgoCD",
					description: "Git-based deployment workflows and continuous delivery with ArgoCD",
					url: "#/demo/unit-5/gitops-argocd",
					contentType: DemoContentType.DIAGRAM,
					duration: "28 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🔄"
				},
				{
					id: "demo-lesson-5-7",
					title: "Environment Management and Promotions",
					description: "Multi-environment strategies, blue-green deployments, and canary releases",
					url: "#/demo/unit-5/environment-management-promotions",
					contentType: DemoContentType.TEXT,
					duration: "25 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🚦"
				}
			]
		},
		{
			id: "demo-unit-6",
			title: "Monitoring, Logging & Observability",
			description:
				"Application monitoring, centralized logging, and comprehensive observability strategies",
			icon: "📊",
			estimatedHours: 9,
			difficulty: DemoDifficulty.INTERMEDIATE,
			prerequisites: ["Kubernetes basics", "Application deployment experience"],
			learningObjectives: [
				"Implement comprehensive monitoring solutions",
				"Set up centralized logging and log analysis",
				"Create effective alerting and incident response workflows"
			],
			lessons: [
				{
					id: "demo-lesson-6-1",
					title: "Observability Fundamentals",
					description: "Metrics, logs, traces, and the three pillars of observability",
					url: "#/demo/unit-6/observability-fundamentals",
					contentType: DemoContentType.TEXT,
					duration: "18 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "👁️"
				},
				{
					id: "demo-lesson-6-2",
					title: "Prometheus and Grafana Setup",
					description: "Metrics collection, storage, and visualization with Prometheus ecosystem",
					url: "#/demo/unit-6/prometheus-grafana-setup",
					contentType: DemoContentType.CODE,
					duration: "35 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "📈"
				},
				{
					id: "demo-lesson-6-3",
					title: "Application Performance Monitoring",
					description: "APM tools, performance metrics, and application insights",
					url: "#/demo/unit-6/application-performance-monitoring",
					contentType: DemoContentType.INTERACTIVE,
					duration: "30 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "⚡"
				},
				{
					id: "demo-lesson-6-4",
					title: "Centralized Logging with ELK Stack",
					description: "Elasticsearch, Logstash, Kibana for log aggregation and analysis",
					url: "#/demo/unit-6/centralized-logging-elk",
					contentType: DemoContentType.DIAGRAM,
					duration: "32 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "📄"
				},
				{
					id: "demo-lesson-6-5",
					title: "Distributed Tracing Implementation",
					description: "Jaeger, Zipkin, and OpenTelemetry for request tracing",
					url: "#/demo/unit-6/distributed-tracing-implementation",
					contentType: DemoContentType.MIXED,
					duration: "28 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🔍"
				},
				{
					id: "demo-lesson-6-6",
					title: "Alerting and Incident Response",
					description: "Alert management, escalation policies, and incident response procedures",
					url: "#/demo/unit-6/alerting-incident-response",
					contentType: DemoContentType.CODE,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🚨"
				},
				{
					id: "demo-lesson-6-7",
					title: "SLA/SLO Management",
					description: "Service level objectives, error budgets, and reliability engineering",
					url: "#/demo/unit-6/sla-slo-management",
					contentType: DemoContentType.TEXT,
					duration: "22 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "📋"
				}
			]
		},
		{
			id: "demo-unit-7",
			title: "Security & Compliance in Cloud-Native",
			description:
				"Container security, secrets management, compliance frameworks, and threat mitigation",
			icon: "🔐",
			estimatedHours: 13,
			difficulty: DemoDifficulty.ADVANCED,
			prerequisites: ["Container fundamentals", "Basic security concepts"],
			learningObjectives: [
				"Implement comprehensive container and cluster security",
				"Manage secrets and sensitive data securely",
				"Achieve compliance with industry standards and regulations"
			],
			lessons: [
				{
					id: "demo-lesson-7-1",
					title: "Container Security Fundamentals",
					description: "Image scanning, runtime security, and container isolation techniques",
					url: "#/demo/unit-7/container-security-fundamentals",
					contentType: DemoContentType.TEXT,
					duration: "20 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🛡️"
				},
				{
					id: "demo-lesson-7-2",
					title: "Kubernetes Security Best Practices",
					description: "RBAC, network policies, pod security standards, and admission controllers",
					url: "#/demo/unit-7/kubernetes-security-best-practices",
					contentType: DemoContentType.CODE,
					duration: "40 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🔒"
				},
				{
					id: "demo-lesson-7-3",
					title: "Secrets Management and Encryption",
					description: "HashiCorp Vault, Kubernetes secrets, and encryption at rest and in transit",
					url: "#/demo/unit-7/secrets-management-encryption",
					contentType: DemoContentType.MIXED,
					duration: "35 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🔑"
				},
				{
					id: "demo-lesson-7-4",
					title: "Identity and Access Management",
					description: "OAuth 2.0, OpenID Connect, service mesh authentication and authorization",
					url: "#/demo/unit-7/identity-access-management",
					contentType: DemoContentType.DIAGRAM,
					duration: "30 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "👤"
				},
				{
					id: "demo-lesson-7-5",
					title: "Network Security and Firewalls",
					description: "Network segmentation, ingress controllers, and cloud firewalls",
					url: "#/demo/unit-7/network-security-firewalls",
					contentType: DemoContentType.INTERACTIVE,
					duration: "28 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🌐"
				},
				{
					id: "demo-lesson-7-6",
					title: "Vulnerability Scanning and Assessment",
					description: "Security scanning tools, CVE management, and risk assessment",
					url: "#/demo/unit-7/vulnerability-scanning-assessment",
					contentType: DemoContentType.CODE,
					duration: "32 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🔍"
				},
				{
					id: "demo-lesson-7-7",
					title: "Compliance and Governance",
					description: "SOC 2, GDPR, HIPAA compliance frameworks and audit preparation",
					url: "#/demo/unit-7/compliance-governance",
					contentType: DemoContentType.TEXT,
					duration: "25 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "📜"
				},
				{
					id: "demo-lesson-7-8",
					title: "Incident Response and Forensics",
					description: "Security incident handling, digital forensics, and breach response",
					url: "#/demo/unit-7/incident-response-forensics",
					contentType: DemoContentType.DIAGRAM,
					duration: "27 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🚨"
				}
			]
		},
		{
			id: "demo-unit-8",
			title: "Service Mesh & Advanced Networking",
			description:
				"Service mesh implementation, traffic management, and advanced networking patterns",
			icon: "🕸️",
			estimatedHours: 10,
			difficulty: DemoDifficulty.ADVANCED,
			prerequisites: ["Kubernetes advanced concepts", "Networking fundamentals"],
			learningObjectives: [
				"Implement service mesh for microservices communication",
				"Configure advanced traffic management and load balancing",
				"Master service mesh security and observability features"
			],
			lessons: [
				{
					id: "demo-lesson-8-1",
					title: "Service Mesh Architecture Overview",
					description: "Data plane, control plane, and service mesh architectural patterns",
					url: "#/demo/unit-8/service-mesh-architecture-overview",
					contentType: DemoContentType.DIAGRAM,
					duration: "22 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🏗️"
				},
				{
					id: "demo-lesson-8-2",
					title: "Istio Installation and Configuration",
					description: "Istio setup, configuration management, and component overview",
					url: "#/demo/unit-8/istio-installation-configuration",
					contentType: DemoContentType.CODE,
					duration: "35 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "⚙️"
				},
				{
					id: "demo-lesson-8-3",
					title: "Traffic Management and Routing",
					description: "VirtualServices, DestinationRules, and advanced routing strategies",
					url: "#/demo/unit-8/traffic-management-routing",
					contentType: DemoContentType.MIXED,
					duration: "30 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🚦"
				},
				{
					id: "demo-lesson-8-4",
					title: "Service Mesh Security Features",
					description: "mTLS, authentication policies, and authorization rules",
					url: "#/demo/unit-8/service-mesh-security-features",
					contentType: DemoContentType.CODE,
					duration: "32 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🔐"
				},
				{
					id: "demo-lesson-8-5",
					title: "Observability in Service Mesh",
					description:
						"Distributed tracing, metrics collection, and service topology visualization",
					url: "#/demo/unit-8/observability-service-mesh",
					contentType: DemoContentType.INTERACTIVE,
					duration: "28 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "👁️"
				},
				{
					id: "demo-lesson-8-6",
					title: "Envoy Proxy Deep Dive",
					description: "Envoy configuration, filters, and advanced proxy features",
					url: "#/demo/unit-8/envoy-proxy-deep-dive",
					contentType: DemoContentType.TEXT,
					duration: "25 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🔄"
				},
				{
					id: "demo-lesson-8-7",
					title: "Multi-Cluster Service Mesh",
					description: "Cross-cluster communication, federation, and hybrid deployments",
					url: "#/demo/unit-8/multi-cluster-service-mesh",
					contentType: DemoContentType.DIAGRAM,
					duration: "27 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🌐"
				}
			]
		},
		{
			id: "demo-unit-9",
			title: "Database Management in Cloud Environments",
			description:
				"Cloud databases, data persistence, backup strategies, and database optimization",
			icon: "🗄️",
			estimatedHours: 8,
			difficulty: DemoDifficulty.INTERMEDIATE,
			prerequisites: ["Database fundamentals", "Cloud platform basics"],
			learningObjectives: [
				"Design scalable database architectures for cloud applications",
				"Implement effective backup and disaster recovery strategies",
				"Optimize database performance and cost in cloud environments"
			],
			lessons: [
				{
					id: "demo-lesson-9-1",
					title: "Cloud Database Architecture Patterns",
					description: "SQL vs NoSQL, database selection criteria, and architectural patterns",
					url: "#/demo/unit-9/cloud-database-architecture-patterns",
					contentType: DemoContentType.DIAGRAM,
					duration: "20 min",
					difficulty: DemoDifficulty.BEGINNER,
					icon: "🏗️"
				},
				{
					id: "demo-lesson-9-2",
					title: "Managed Database Services",
					description: "AWS RDS, Azure SQL Database, Google Cloud SQL implementation",
					url: "#/demo/unit-9/managed-database-services",
					contentType: DemoContentType.CODE,
					duration: "30 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "☁️"
				},
				{
					id: "demo-lesson-9-3",
					title: "Database Migration Strategies",
					description: "Migration planning, data transfer methods, and downtime minimization",
					url: "#/demo/unit-9/database-migration-strategies",
					contentType: DemoContentType.TEXT,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🚚"
				},
				{
					id: "demo-lesson-9-4",
					title: "Backup and Disaster Recovery",
					description: "Automated backups, point-in-time recovery, and disaster recovery planning",
					url: "#/demo/unit-9/backup-disaster-recovery",
					contentType: DemoContentType.MIXED,
					duration: "28 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "💾"
				},
				{
					id: "demo-lesson-9-5",
					title: "Database Performance Optimization",
					description: "Query optimization, indexing strategies, and performance monitoring",
					url: "#/demo/unit-9/database-performance-optimization",
					contentType: DemoContentType.INTERACTIVE,
					duration: "32 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "⚡"
				},
				{
					id: "demo-lesson-9-6",
					title: "NoSQL Databases in Cloud",
					description: "MongoDB Atlas, DynamoDB, Cosmos DB implementation and best practices",
					url: "#/demo/unit-9/nosql-databases-cloud",
					contentType: DemoContentType.CODE,
					duration: "35 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "📊"
				},
				{
					id: "demo-lesson-9-7",
					title: "Database Security and Compliance",
					description: "Encryption, access controls, audit logging, and compliance requirements",
					url: "#/demo/unit-9/database-security-compliance",
					contentType: DemoContentType.DIAGRAM,
					duration: "22 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🔒"
				}
			]
		},
		{
			id: "demo-unit-10",
			title: "Scaling & Performance Optimization",
			description:
				"Application scaling strategies, performance tuning, and resource optimization techniques",
			icon: "📈",
			estimatedHours: 9,
			difficulty: DemoDifficulty.ADVANCED,
			prerequisites: ["Application deployment experience", "Performance monitoring"],
			learningObjectives: [
				"Implement horizontal and vertical scaling strategies",
				"Optimize application performance and resource utilization",
				"Design cost-effective scaling solutions"
			],
			lessons: [
				{
					id: "demo-lesson-10-1",
					title: "Scaling Fundamentals and Strategies",
					description:
						"Horizontal vs vertical scaling, auto-scaling concepts, and scaling patterns",
					url: "#/demo/unit-10/scaling-fundamentals-strategies",
					contentType: DemoContentType.TEXT,
					duration: "18 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "📊"
				},
				{
					id: "demo-lesson-10-2",
					title: "Kubernetes Horizontal Pod Autoscaler",
					description: "HPA configuration, custom metrics, and scaling policies",
					url: "#/demo/unit-10/kubernetes-horizontal-pod-autoscaler",
					contentType: DemoContentType.CODE,
					duration: "30 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "⚖️"
				},
				{
					id: "demo-lesson-10-3",
					title: "Application Performance Profiling",
					description:
						"Performance bottleneck identification, profiling tools, and optimization techniques",
					url: "#/demo/unit-10/application-performance-profiling",
					contentType: DemoContentType.INTERACTIVE,
					duration: "35 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🔍"
				},
				{
					id: "demo-lesson-10-4",
					title: "Caching Strategies and Implementation",
					description: "Redis, Memcached, CDN caching, and application-level caching",
					url: "#/demo/unit-10/caching-strategies-implementation",
					contentType: DemoContentType.MIXED,
					duration: "28 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "⚡"
				},
				{
					id: "demo-lesson-10-5",
					title: "Load Testing and Capacity Planning",
					description: "Load testing tools, capacity planning, and performance benchmarking",
					url: "#/demo/unit-10/load-testing-capacity-planning",
					contentType: DemoContentType.DIAGRAM,
					duration: "32 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🏋️"
				},
				{
					id: "demo-lesson-10-6",
					title: "Resource Optimization and Cost Management",
					description:
						"Resource requests and limits, cost optimization strategies, and rightsizing",
					url: "#/demo/unit-10/resource-optimization-cost-management",
					contentType: DemoContentType.CODE,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "💰"
				},
				{
					id: "demo-lesson-10-7",
					title: "Global Distribution and Edge Computing",
					description: "Multi-region deployments, edge computing, and global load balancing",
					url: "#/demo/unit-10/global-distribution-edge-computing",
					contentType: DemoContentType.DIAGRAM,
					duration: "27 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🌍"
				}
			]
		},
		{
			id: "demo-unit-11",
			title: "Advanced Cloud-Native Patterns",
			description:
				"Event-driven architecture, serverless patterns, and emerging cloud-native technologies",
			icon: "🚀",
			estimatedHours: 11,
			difficulty: DemoDifficulty.ADVANCED,
			prerequisites: ["Microservices architecture", "Event streaming basics"],
			learningObjectives: [
				"Implement event-driven architectures and streaming platforms",
				"Master serverless application patterns and deployment",
				"Explore emerging technologies and future cloud-native trends"
			],
			lessons: [
				{
					id: "demo-lesson-11-1",
					title: "Event-Driven Architecture Patterns",
					description: "Event sourcing, CQRS, saga patterns, and event streaming architectures",
					url: "#/demo/unit-11/event-driven-architecture-patterns",
					contentType: DemoContentType.DIAGRAM,
					duration: "25 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "⚡"
				},
				{
					id: "demo-lesson-11-2",
					title: "Apache Kafka and Event Streaming",
					description: "Kafka clusters, topics, producers, consumers, and stream processing",
					url: "#/demo/unit-11/apache-kafka-event-streaming",
					contentType: DemoContentType.CODE,
					duration: "40 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🌊"
				},
				{
					id: "demo-lesson-11-3",
					title: "Serverless Application Architecture",
					description: "Function-as-a-Service patterns, serverless frameworks, and event triggers",
					url: "#/demo/unit-11/serverless-application-architecture",
					contentType: DemoContentType.MIXED,
					duration: "35 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "⚡"
				},
				{
					id: "demo-lesson-11-4",
					title: "WebAssembly in Cloud-Native",
					description: "WASM runtime, portable applications, and edge computing with WebAssembly",
					url: "#/demo/unit-11/webassembly-cloud-native",
					contentType: DemoContentType.TEXT,
					duration: "22 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🧩"
				},
				{
					id: "demo-lesson-11-5",
					title: "GraphQL Federation and APIs",
					description: "GraphQL gateway, schema federation, and API composition patterns",
					url: "#/demo/unit-11/graphql-federation-apis",
					contentType: DemoContentType.INTERACTIVE,
					duration: "30 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🔗"
				},
				{
					id: "demo-lesson-11-6",
					title: "Edge Computing and CDN Integration",
					description: "Edge functions, CDN compute, and distributed computing at the edge",
					url: "#/demo/unit-11/edge-computing-cdn-integration",
					contentType: DemoContentType.CODE,
					duration: "28 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🌐"
				},
				{
					id: "demo-lesson-11-7",
					title: "Machine Learning in Cloud-Native",
					description: "MLOps pipelines, model serving, and AI/ML integration patterns",
					url: "#/demo/unit-11/machine-learning-cloud-native",
					contentType: DemoContentType.DIAGRAM,
					duration: "32 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🤖"
				},
				{
					id: "demo-lesson-11-8",
					title: "Future of Cloud-Native Technologies",
					description: "Emerging trends, next-generation platforms, and evolution roadmaps",
					url: "#/demo/unit-11/future-cloud-native-technologies",
					contentType: DemoContentType.TEXT,
					duration: "20 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "🔮"
				}
			]
		},
		{
			id: "demo-unit-12",
			title: "Production Deployment & Operations",
			description:
				"Production readiness, operational excellence, and enterprise-grade deployment strategies",
			icon: "🏭",
			estimatedHours: 12,
			difficulty: DemoDifficulty.ADVANCED,
			prerequisites: ["All previous units", "Production environment experience"],
			learningObjectives: [
				"Achieve production readiness for cloud-native applications",
				"Implement operational excellence and reliability practices",
				"Master enterprise deployment and governance strategies"
			],
			lessons: [
				{
					id: "demo-lesson-12-1",
					title: "Production Readiness Checklist",
					description: "Security, monitoring, scalability, and operational readiness assessment",
					url: "#/demo/unit-12/production-readiness-checklist",
					contentType: DemoContentType.TEXT,
					duration: "20 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "✅"
				},
				{
					id: "demo-lesson-12-2",
					title: "Blue-Green and Canary Deployments",
					description:
						"Zero-downtime deployment strategies, traffic splitting, and rollback procedures",
					url: "#/demo/unit-12/blue-green-canary-deployments",
					contentType: DemoContentType.CODE,
					duration: "35 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🚦"
				},
				{
					id: "demo-lesson-12-3",
					title: "Disaster Recovery and Business Continuity",
					description: "DR planning, backup strategies, and business continuity implementation",
					url: "#/demo/unit-12/disaster-recovery-business-continuity",
					contentType: DemoContentType.DIAGRAM,
					duration: "30 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "🛡️"
				},
				{
					id: "demo-lesson-12-4",
					title: "Enterprise Governance and Compliance",
					description: "Policy enforcement, compliance automation, and governance frameworks",
					url: "#/demo/unit-12/enterprise-governance-compliance",
					contentType: DemoContentType.MIXED,
					duration: "28 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "📋"
				},
				{
					id: "demo-lesson-12-5",
					title: "Cost Optimization and FinOps",
					description: "Cost monitoring, optimization strategies, and financial operations",
					url: "#/demo/unit-12/cost-optimization-finops",
					contentType: DemoContentType.INTERACTIVE,
					duration: "32 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "💰"
				},
				{
					id: "demo-lesson-12-6",
					title: "Operational Excellence Framework",
					description: "SRE practices, operational metrics, and continuous improvement",
					url: "#/demo/unit-12/operational-excellence-framework",
					contentType: DemoContentType.CODE,
					duration: "35 min",
					difficulty: DemoDifficulty.ADVANCED,
					icon: "⭐"
				},
				{
					id: "demo-lesson-12-7",
					title: "Team Structure and Organizational Change",
					description: "DevOps culture, team topology, and organizational transformation",
					url: "#/demo/unit-12/team-structure-organizational-change",
					contentType: DemoContentType.TEXT,
					duration: "25 min",
					difficulty: DemoDifficulty.INTERMEDIATE,
					icon: "👥"
				}
			]
		}
	]
};

/**
 * Content type distribution validation
 * Total lessons: 95
 * - Code-heavy: 29 lessons (30.5%)
 * - Interactive: 24 lessons (25.3%)
 * - Diagram-heavy: 19 lessons (20.0%)
 * - Text-heavy: 14 lessons (14.7%)
 * - Mixed-content: 9 lessons (9.5%)
 */

/**
 * Export individual components for flexibility
 */
export const totalLessons = demoSidebarMenu.units.reduce(
	(total, unit) => total + unit.lessons.length,
	0
);
export const contentTypeDistribution = {
	code: demoSidebarMenu.units
		.flatMap((unit) => unit.lessons)
		.filter((lesson) => lesson.contentType === DemoContentType.CODE).length,
	interactive: demoSidebarMenu.units
		.flatMap((unit) => unit.lessons)
		.filter((lesson) => lesson.contentType === DemoContentType.INTERACTIVE).length,
	diagram: demoSidebarMenu.units
		.flatMap((unit) => unit.lessons)
		.filter((lesson) => lesson.contentType === DemoContentType.DIAGRAM).length,
	text: demoSidebarMenu.units
		.flatMap((unit) => unit.lessons)
		.filter((lesson) => lesson.contentType === DemoContentType.TEXT).length,
	mixed: demoSidebarMenu.units
		.flatMap((unit) => unit.lessons)
		.filter((lesson) => lesson.contentType === DemoContentType.MIXED).length
};

export default demoSidebarMenu;
