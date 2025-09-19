/**
 * @file Comprehensive library of educational flip cards for cloud-native concepts
 * @description Interactive flip card content covering cloud-native technologies, programming patterns,
 * and best practices. Structured data for testing flip card animations, interactions, and learning objectives.
 * Follows the established TypeScript interface architecture from CONTENT-STANDARDS.md
 */

/**
 * Defines the complexity level of a flip card concept
 */
export type FlipCardComplexity = "beginner" | "intermediate" | "advanced";

/**
 * Defines the category of cloud-native concepts
 */
export type FlipCardCategory =
	| "containers"
	| "kubernetes"
	| "microservices"
	| "devops"
	| "security"
	| "monitoring"
	| "networking"
	| "storage"
	| "programming-patterns"
	| "best-practices"
	| "cloud-platforms"
	| "cicd";

/**
 * Animation configuration for flip card interactions
 */
export interface FlipCardAnimation {
	/** Duration of the flip animation in milliseconds */
	duration: number;
	/** CSS easing function for the flip transition */
	easing: string;
	/** Delay before animation starts in milliseconds */
	delay: number;
	/** Enable 3D flip effect */
	enable3D: boolean;
}

/**
 * Interactive configuration for flip card gestures and behaviors
 */
export interface FlipCardInteraction {
	/** Enable click to flip */
	clickToFlip: boolean;
	/** Enable touch/swipe to flip on mobile */
	touchToFlip: boolean;
	/** Enable keyboard navigation (space/enter to flip) */
	keyboardNav: boolean;
	/** Auto-flip back to front after specified milliseconds (0 = disabled) */
	autoFlipBack: number;
	/** Enable hover to flip on desktop */
	hoverToFlip: boolean;
}

/**
 * Progress tracking data for learning management
 */
export interface FlipCardProgress {
	/** Track if card has been viewed */
	viewed: boolean;
	/** Track if user has flipped to back side */
	flipped: boolean;
	/** Number of times this card has been viewed */
	viewCount: number;
	/** Timestamp of last interaction */
	lastViewed: Date | null;
	/** User marked as mastered/understood */
	mastered: boolean;
}

/**
 * Learning objectives and metadata for educational content
 */
export interface FlipCardEducation {
	/** Learning objectives this card addresses */
	learningObjectives: string[];
	/** Prerequisites knowledge required */
	prerequisites: string[];
	/** Related concepts and cross-references */
	relatedConcepts: string[];
	/** Estimated time to understand concept (in minutes) */
	estimatedLearningTime: number;
	/** Additional resources for deeper learning */
	additionalResources?: {
		title: string;
		url: string;
		type: "documentation" | "tutorial" | "video" | "article";
	}[];
}

/**
 * Represents a single educational flip card with front/back content
 */
export interface FlipCard {
	/** Unique identifier for the flip card */
	id: string;
	/** The front side content (usually the concept/question) */
	front: string;
	/** The back side content (usually the definition/answer) */
	back: string;
	/** Category of the cloud-native concept */
	category: FlipCardCategory;
	/** Complexity level of the concept */
	complexity: FlipCardComplexity;
	/** Tags for filtering and searching */
	tags: string[];
	/** Educational metadata and learning objectives */
	education: FlipCardEducation;
	/** Animation configuration for this card */
	animation?: FlipCardAnimation;
	/** Interactive behavior configuration */
	interaction?: FlipCardInteraction;
	/** Progress tracking data (initialized with defaults) */
	progress?: FlipCardProgress;
}

/**
 * Default animation configuration for flip cards
 */
export const defaultFlipCardAnimation: FlipCardAnimation = {
	duration: 600,
	easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
	delay: 0,
	enable3D: true
};

/**
 * Default interaction configuration for flip cards
 */
export const defaultFlipCardInteraction: FlipCardInteraction = {
	clickToFlip: true,
	touchToFlip: true,
	keyboardNav: true,
	autoFlipBack: 0,
	hoverToFlip: false
};

/**
 * Default progress state for new flip cards
 */
export const defaultFlipCardProgress: FlipCardProgress = {
	viewed: false,
	flipped: false,
	viewCount: 0,
	lastViewed: null,
	mastered: false
};

/**
 * Comprehensive library of educational flip cards covering cloud-native concepts
 * Designed to test all interaction scenarios and provide educational value
 */
export const conceptCards: FlipCard[] = [
	// CONTAINERS CATEGORY
	{
		id: "container-01",
		front: "What is a Container?",
		back: "A container is a lightweight, portable unit that packages an application and its dependencies together, ensuring consistent execution across different environments. Unlike virtual machines, containers share the host OS kernel, making them more efficient.",
		category: "containers",
		complexity: "beginner",
		tags: ["docker", "containerization", "virtualization", "packaging"],
		education: {
			learningObjectives: [
				"Understand what containers are and their benefits",
				"Differentiate between containers and virtual machines",
				"Recognize container use cases in cloud-native applications"
			],
			prerequisites: [
				"Basic understanding of operating systems",
				"Familiarity with applications and dependencies"
			],
			relatedConcepts: ["Docker", "Container Registry", "Container Orchestration", "Microservices"],
			estimatedLearningTime: 10,
			additionalResources: [
				{
					title: "Docker Official Documentation",
					url: "https://docs.docker.com/get-started/",
					type: "documentation"
				}
			]
		}
	},
	{
		id: "container-02",
		front: "Container Registry",
		back: "A container registry is a centralized repository for storing and distributing container images. Examples include Docker Hub, Amazon ECR, Google Container Registry, and Azure Container Registry. Registries support versioning, access control, and vulnerability scanning.",
		category: "containers",
		complexity: "intermediate",
		tags: ["docker-hub", "ecr", "gcr", "acr", "image-storage", "versioning"],
		education: {
			learningObjectives: [
				"Understand the purpose of container registries",
				"Learn about popular registry services",
				"Understand image versioning and tagging strategies"
			],
			prerequisites: ["Container fundamentals", "Basic cloud platform knowledge"],
			relatedConcepts: ["Container Images", "CI/CD Pipelines", "Image Security Scanning"],
			estimatedLearningTime: 15
		}
	},
	{
		id: "container-03",
		front: "Multi-Stage Docker Builds",
		back: "Multi-stage builds allow you to use multiple FROM statements in a Dockerfile, enabling you to create smaller, more secure production images by separating build dependencies from runtime dependencies. The final image only contains what's needed to run the application.",
		category: "containers",
		complexity: "advanced",
		tags: ["dockerfile", "optimization", "security", "build-process"],
		education: {
			learningObjectives: [
				"Master advanced Dockerfile optimization techniques",
				"Understand security benefits of multi-stage builds",
				"Learn to minimize image size and attack surface"
			],
			prerequisites: ["Docker fundamentals", "Dockerfile syntax", "Build processes"],
			relatedConcepts: ["Image Layers", "Security Best Practices", "Build Optimization"],
			estimatedLearningTime: 25
		}
	},
	{
		id: "container-04",
		front: "Container Networking",
		back: "Container networking enables communication between containers and external services. Docker provides bridge, host, overlay, and none network drivers. In production, overlay networks enable multi-host communication, while service mesh solutions like Istio provide advanced traffic management.",
		category: "containers",
		complexity: "advanced",
		tags: ["networking", "bridge", "overlay", "service-mesh", "communication"],
		education: {
			learningObjectives: [
				"Understand different container networking models",
				"Learn about network drivers and their use cases",
				"Understand service mesh concepts for microservices"
			],
			prerequisites: [
				"Container fundamentals",
				"Basic networking concepts",
				"Microservices architecture"
			],
			relatedConcepts: ["Service Discovery", "Load Balancing", "Security Policies"],
			estimatedLearningTime: 30
		}
	},

	// KUBERNETES CATEGORY
	{
		id: "k8s-01",
		front: "What is Kubernetes?",
		back: "Kubernetes is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. It provides features like automatic scaling, rolling updates, service discovery, and self-healing capabilities.",
		category: "kubernetes",
		complexity: "beginner",
		tags: ["orchestration", "scaling", "deployment", "automation"],
		education: {
			learningObjectives: [
				"Understand Kubernetes purpose and benefits",
				"Learn about container orchestration concepts",
				"Recognize when to use Kubernetes"
			],
			prerequisites: ["Container fundamentals", "Basic distributed systems knowledge"],
			relatedConcepts: ["Pods", "Services", "Deployments", "Container Orchestration"],
			estimatedLearningTime: 15
		}
	},
	{
		id: "k8s-02",
		front: "Kubernetes Pod",
		back: "A Pod is the smallest deployable unit in Kubernetes, containing one or more tightly coupled containers that share storage, network, and a specification for how to run. Pods are ephemeral and managed by higher-level controllers like Deployments.",
		category: "kubernetes",
		complexity: "intermediate",
		tags: ["pod", "containers", "scheduling", "networking"],
		education: {
			learningObjectives: [
				"Understand Pod architecture and lifecycle",
				"Learn container relationships within Pods",
				"Understand Pod networking and storage"
			],
			prerequisites: ["Kubernetes basics", "Container networking"],
			relatedConcepts: ["Services", "Deployments", "Container Networking"],
			estimatedLearningTime: 20
		}
	},
	{
		id: "k8s-03",
		front: "Kubernetes Service",
		back: "A Service is an abstraction that provides a stable endpoint for accessing a set of Pods. Services enable service discovery and load balancing through ClusterIP, NodePort, LoadBalancer, and ExternalName types, decoupling consumers from Pod instances.",
		category: "kubernetes",
		complexity: "intermediate",
		tags: ["service", "networking", "load-balancing", "service-discovery"],
		education: {
			learningObjectives: [
				"Understand Service types and their use cases",
				"Learn service discovery mechanisms",
				"Master load balancing concepts in Kubernetes"
			],
			prerequisites: ["Pod concepts", "Networking fundamentals"],
			relatedConcepts: ["Ingress", "DNS", "Load Balancing"],
			estimatedLearningTime: 25
		}
	},
	{
		id: "k8s-04",
		front: "Helm Charts",
		back: "Helm is the package manager for Kubernetes that uses charts (collections of files describing related Kubernetes resources) to define, install, and upgrade applications. Charts enable templating, versioning, and dependency management for complex applications.",
		category: "kubernetes",
		complexity: "advanced",
		tags: ["helm", "package-manager", "templating", "deployment"],
		education: {
			learningObjectives: [
				"Master Helm chart development and deployment",
				"Understand templating and configuration management",
				"Learn application lifecycle management with Helm"
			],
			prerequisites: ["Kubernetes resources", "YAML templating", "Package management concepts"],
			relatedConcepts: ["ConfigMaps", "Secrets", "Application Deployment"],
			estimatedLearningTime: 35
		}
	},
	{
		id: "k8s-05",
		front: "Kubernetes Operators",
		back: "Operators are software extensions that use custom resources to manage applications and their components. They codify operational knowledge and automate complex tasks like backups, upgrades, and scaling by extending the Kubernetes API with custom controllers.",
		category: "kubernetes",
		complexity: "advanced",
		tags: ["operators", "custom-resources", "automation", "controllers"],
		education: {
			learningObjectives: [
				"Understand Operator pattern and its benefits",
				"Learn custom resource definitions (CRDs)",
				"Master complex application automation"
			],
			prerequisites: ["Kubernetes API", "Controllers", "Custom resources"],
			relatedConcepts: ["Custom Resource Definitions", "Controllers", "API Extensions"],
			estimatedLearningTime: 40
		}
	},

	// MICROSERVICES CATEGORY
	{
		id: "microservices-01",
		front: "Microservices Architecture",
		back: "Microservices architecture is a design approach where applications are built as a collection of small, independent services that communicate over well-defined APIs. Each service is responsible for a specific business capability and can be developed, deployed, and scaled independently.",
		category: "microservices",
		complexity: "intermediate",
		tags: ["architecture", "design-patterns", "scalability", "independence"],
		education: {
			learningObjectives: [
				"Understand microservices principles and benefits",
				"Learn service decomposition strategies",
				"Understand trade-offs vs monolithic architecture"
			],
			prerequisites: ["Software architecture basics", "API design", "Distributed systems"],
			relatedConcepts: ["API Gateway", "Service Mesh", "Domain-Driven Design"],
			estimatedLearningTime: 20
		}
	},
	{
		id: "microservices-02",
		front: "Service Discovery",
		back: "Service discovery is the process of automatically locating and connecting to services in a dynamic environment. It involves service registration (services announce their availability) and service lookup (clients find services), often implemented using tools like Consul, etcd, or Kubernetes DNS.",
		category: "microservices",
		complexity: "intermediate",
		tags: ["service-discovery", "dns", "consul", "registration"],
		education: {
			learningObjectives: [
				"Understand service discovery patterns",
				"Learn client-side vs server-side discovery",
				"Master service registry concepts"
			],
			prerequisites: ["Microservices fundamentals", "Networking", "DNS"],
			relatedConcepts: ["Load Balancing", "Health Checks", "Circuit Breakers"],
			estimatedLearningTime: 25
		}
	},
	{
		id: "microservices-03",
		front: "Circuit Breaker Pattern",
		back: "The Circuit Breaker pattern prevents cascading failures in distributed systems by monitoring calls to external services and 'opening' the circuit when failures exceed a threshold. It provides fast failure and automatic recovery, protecting upstream services from overload.",
		category: "microservices",
		complexity: "advanced",
		tags: ["resilience", "fault-tolerance", "patterns", "reliability"],
		education: {
			learningObjectives: [
				"Master resilience patterns for microservices",
				"Understand failure propagation prevention",
				"Learn automatic recovery mechanisms"
			],
			prerequisites: ["Distributed systems", "Error handling", "Microservices communication"],
			relatedConcepts: ["Bulkhead Pattern", "Timeout Pattern", "Retry Pattern"],
			estimatedLearningTime: 30
		}
	},
	{
		id: "microservices-04",
		front: "Event-Driven Architecture",
		back: "Event-driven architecture (EDA) is a design pattern where services communicate through events rather than direct calls. Producers emit events when state changes occur, and consumers react to relevant events, enabling loose coupling and better scalability.",
		category: "microservices",
		complexity: "advanced",
		tags: ["events", "messaging", "loose-coupling", "scalability"],
		education: {
			learningObjectives: [
				"Understand event-driven communication patterns",
				"Learn event sourcing and CQRS concepts",
				"Master asynchronous messaging systems"
			],
			prerequisites: ["Microservices architecture", "Message queues", "Asynchronous programming"],
			relatedConcepts: ["Message Brokers", "Event Sourcing", "CQRS"],
			estimatedLearningTime: 35
		}
	},

	// DEVOPS CATEGORY
	{
		id: "devops-01",
		front: "Infrastructure as Code (IaC)",
		back: "Infrastructure as Code is the practice of managing and provisioning infrastructure through machine-readable files rather than manual processes. Tools like Terraform, CloudFormation, and Pulumi enable version control, reproducibility, and automation of infrastructure deployment.",
		category: "devops",
		complexity: "intermediate",
		tags: ["terraform", "cloudformation", "automation", "versioning"],
		education: {
			learningObjectives: [
				"Understand IaC principles and benefits",
				"Learn declarative vs imperative approaches",
				"Master infrastructure automation tools"
			],
			prerequisites: ["Cloud platforms", "Version control", "Infrastructure basics"],
			relatedConcepts: ["GitOps", "Configuration Management", "Cloud Resources"],
			estimatedLearningTime: 25
		}
	},
	{
		id: "devops-02",
		front: "GitOps",
		back: "GitOps is a deployment methodology that uses Git repositories as the single source of truth for infrastructure and application configuration. Changes are made through pull requests, and automated agents ensure the actual state matches the desired state defined in Git.",
		category: "devops",
		complexity: "advanced",
		tags: ["git", "deployment", "automation", "declarative"],
		education: {
			learningObjectives: [
				"Master GitOps principles and workflow",
				"Understand declarative configuration management",
				"Learn continuous deployment automation"
			],
			prerequisites: ["Git workflows", "Kubernetes", "CI/CD pipelines"],
			relatedConcepts: ["ArgoCD", "Flux", "Infrastructure as Code"],
			estimatedLearningTime: 30
		}
	},
	{
		id: "devops-03",
		front: "Blue-Green Deployment",
		back: "Blue-Green deployment is a technique that reduces downtime and risk by running two identical production environments (Blue and Green). At any time, only one serves production traffic. Deployments switch traffic from the current environment to the idle one after validation.",
		category: "devops",
		complexity: "intermediate",
		tags: ["deployment", "zero-downtime", "risk-reduction", "production"],
		education: {
			learningObjectives: [
				"Understand zero-downtime deployment strategies",
				"Learn risk mitigation techniques",
				"Master production environment management"
			],
			prerequisites: ["Deployment processes", "Load balancing", "Production operations"],
			relatedConcepts: ["Canary Deployment", "Rolling Updates", "Feature Flags"],
			estimatedLearningTime: 20
		}
	},

	// SECURITY CATEGORY
	{
		id: "security-01",
		front: "Zero Trust Security",
		back: "Zero Trust is a security framework that assumes no implicit trust and verifies every transaction. It requires authentication and authorization for every access request, regardless of location, and applies the principle of least privilege access throughout the network.",
		category: "security",
		complexity: "advanced",
		tags: ["zero-trust", "authentication", "authorization", "least-privilege"],
		education: {
			learningObjectives: [
				"Understand Zero Trust security principles",
				"Learn identity-based security models",
				"Master least privilege access controls"
			],
			prerequisites: ["Network security", "Identity management", "Access control"],
			relatedConcepts: [
				"Identity and Access Management",
				"Network Segmentation",
				"Multi-Factor Authentication"
			],
			estimatedLearningTime: 35
		}
	},
	{
		id: "security-02",
		front: "Container Security Scanning",
		back: "Container security scanning involves analyzing container images for known vulnerabilities, malware, and compliance issues. Tools like Clair, Trivy, and cloud-native scanners examine image layers, dependencies, and configurations to identify security risks before deployment.",
		category: "security",
		complexity: "intermediate",
		tags: ["vulnerability-scanning", "container-security", "compliance", "static-analysis"],
		education: {
			learningObjectives: [
				"Understand container vulnerability assessment",
				"Learn security scanning tools and techniques",
				"Master secure container image practices"
			],
			prerequisites: ["Container fundamentals", "Security concepts", "CI/CD pipelines"],
			relatedConcepts: ["Image Signing", "Security Policies", "Compliance"],
			estimatedLearningTime: 25
		}
	},
	{
		id: "security-03",
		front: "Secrets Management",
		back: "Secrets management involves securely storing, accessing, and rotating sensitive data like passwords, API keys, and certificates. Solutions like HashiCorp Vault, AWS Secrets Manager, and Kubernetes Secrets provide encryption, access control, and audit logging.",
		category: "security",
		complexity: "intermediate",
		tags: ["secrets", "encryption", "vault", "api-keys"],
		education: {
			learningObjectives: [
				"Understand secrets lifecycle management",
				"Learn encryption and access control",
				"Master secrets rotation strategies"
			],
			prerequisites: ["Security fundamentals", "Encryption", "Access control"],
			relatedConcepts: ["Certificate Management", "Identity Management", "Compliance"],
			estimatedLearningTime: 30
		}
	},

	// MONITORING CATEGORY
	{
		id: "monitoring-01",
		front: "Observability vs Monitoring",
		back: "Monitoring tells you when something is wrong, while observability tells you why something is wrong. Observability encompasses metrics, logs, and traces (the three pillars) to provide deep insights into system behavior and enable understanding of complex distributed systems.",
		category: "monitoring",
		complexity: "intermediate",
		tags: ["observability", "metrics", "logs", "traces"],
		education: {
			learningObjectives: [
				"Differentiate between monitoring and observability",
				"Understand the three pillars of observability",
				"Learn system insight generation techniques"
			],
			prerequisites: ["System administration", "Logging concepts", "Performance metrics"],
			relatedConcepts: ["Prometheus", "Grafana", "Jaeger", "OpenTelemetry"],
			estimatedLearningTime: 20
		}
	},
	{
		id: "monitoring-02",
		front: "Distributed Tracing",
		back: "Distributed tracing tracks requests as they flow through multiple services in a microservices architecture. It creates a trace of the entire request journey, showing service dependencies, latencies, and errors, helping identify performance bottlenecks and failures.",
		category: "monitoring",
		complexity: "advanced",
		tags: ["tracing", "microservices", "performance", "debugging"],
		education: {
			learningObjectives: [
				"Master distributed system debugging techniques",
				"Understand request flow visualization",
				"Learn performance bottleneck identification"
			],
			prerequisites: ["Microservices architecture", "System performance", "Debugging"],
			relatedConcepts: ["Jaeger", "Zipkin", "OpenTelemetry", "Service Mesh"],
			estimatedLearningTime: 30
		}
	},
	{
		id: "monitoring-03",
		front: "SRE Error Budgets",
		back: "Error budgets define the acceptable level of service unreliability, calculated as (100% - SLO). They balance feature velocity with reliability by allowing teams to 'spend' the budget on changes while maintaining service quality. When budgets are exhausted, focus shifts to reliability.",
		category: "monitoring",
		complexity: "advanced",
		tags: ["sre", "slo", "reliability", "error-budget"],
		education: {
			learningObjectives: [
				"Master Site Reliability Engineering practices",
				"Understand service level objectives",
				"Learn reliability vs velocity balance"
			],
			prerequisites: ["SRE principles", "Service level concepts", "Reliability engineering"],
			relatedConcepts: ["SLI", "SLO", "SLA", "Incident Response"],
			estimatedLearningTime: 35
		}
	},

	// NETWORKING CATEGORY
	{
		id: "networking-01",
		front: "Service Mesh",
		back: "A service mesh is a configurable infrastructure layer that handles service-to-service communication in microservices. It provides features like load balancing, service discovery, encryption, authentication, and observability without requiring application code changes.",
		category: "networking",
		complexity: "advanced",
		tags: ["service-mesh", "istio", "communication", "security"],
		education: {
			learningObjectives: [
				"Understand service mesh architecture and benefits",
				"Learn traffic management and security features",
				"Master microservices communication patterns"
			],
			prerequisites: ["Microservices", "Networking", "Kubernetes"],
			relatedConcepts: ["Istio", "Linkerd", "Envoy Proxy", "mTLS"],
			estimatedLearningTime: 40
		}
	},
	{
		id: "networking-02",
		front: "API Gateway",
		back: "An API Gateway is a server that acts as an entry point for all client requests to microservices. It handles routing, composition, protocol translation, authentication, rate limiting, monitoring, and provides a unified API interface while hiding internal service complexity.",
		category: "networking",
		complexity: "intermediate",
		tags: ["api-gateway", "routing", "authentication", "rate-limiting"],
		education: {
			learningObjectives: [
				"Understand API Gateway patterns and benefits",
				"Learn request routing and transformation",
				"Master API security and rate limiting"
			],
			prerequisites: ["API design", "Microservices", "Authentication"],
			relatedConcepts: ["Load Balancing", "Service Discovery", "Authentication"],
			estimatedLearningTime: 25
		}
	},

	// STORAGE CATEGORY
	{
		id: "storage-01",
		front: "Persistent Volumes in Kubernetes",
		back: "Persistent Volumes (PV) provide storage resources in Kubernetes that exist beyond Pod lifecycles. Persistent Volume Claims (PVC) request storage resources, and StorageClasses define dynamic provisioning. This enables stateful applications with durable data storage.",
		category: "storage",
		complexity: "intermediate",
		tags: ["persistent-volumes", "storage", "stateful", "kubernetes"],
		education: {
			learningObjectives: [
				"Understand Kubernetes storage concepts",
				"Learn persistent storage management",
				"Master stateful application deployment"
			],
			prerequisites: ["Kubernetes basics", "Storage concepts", "Pod lifecycle"],
			relatedConcepts: ["StatefulSets", "Storage Classes", "Volume Types"],
			estimatedLearningTime: 30
		}
	},
	{
		id: "storage-02",
		front: "Object Storage vs Block Storage",
		back: "Object storage stores data as objects in a flat namespace with metadata (S3, GCS), ideal for unstructured data and web applications. Block storage provides raw block-level storage (EBS, Azure Disk) with filesystem management, suitable for databases and operating systems.",
		category: "storage",
		complexity: "beginner",
		tags: ["object-storage", "block-storage", "s3", "databases"],
		education: {
			learningObjectives: [
				"Differentiate between storage types",
				"Understand use cases for each storage type",
				"Learn cloud storage service options"
			],
			prerequisites: ["Basic storage concepts", "File systems"],
			relatedConcepts: ["File Storage", "Database Storage", "Content Delivery"],
			estimatedLearningTime: 15
		}
	},

	// PROGRAMMING PATTERNS CATEGORY
	{
		id: "patterns-01",
		front: "Bulkhead Pattern",
		back: "The Bulkhead pattern isolates elements of an application into pools so that if one fails, the others continue to function. Named after ship compartments, it prevents cascading failures by containing problems within specific resource boundaries.",
		category: "programming-patterns",
		complexity: "advanced",
		tags: ["resilience", "isolation", "fault-tolerance", "resource-management"],
		education: {
			learningObjectives: [
				"Master resilience design patterns",
				"Understand resource isolation techniques",
				"Learn fault containment strategies"
			],
			prerequisites: ["Distributed systems", "Resource management", "Error handling"],
			relatedConcepts: ["Circuit Breaker", "Timeout Pattern", "Thread Pools"],
			estimatedLearningTime: 25
		}
	},
	{
		id: "patterns-02",
		front: "Saga Pattern",
		back: "The Saga pattern manages distributed transactions across microservices using a sequence of local transactions. If any step fails, compensating actions undo previous steps. It ensures data consistency without requiring distributed locks or two-phase commits.",
		category: "programming-patterns",
		complexity: "advanced",
		tags: ["transactions", "distributed-systems", "consistency", "microservices"],
		education: {
			learningObjectives: [
				"Master distributed transaction management",
				"Understand eventual consistency patterns",
				"Learn compensating action design"
			],
			prerequisites: ["Distributed systems", "Transaction concepts", "Microservices"],
			relatedConcepts: ["Event Sourcing", "CQRS", "Distributed Transactions"],
			estimatedLearningTime: 35
		}
	},

	// BEST PRACTICES CATEGORY
	{
		id: "practices-01",
		front: "12-Factor App Methodology",
		back: "The 12-Factor App is a methodology for building SaaS applications that are portable, scalable, and maintainable. It includes principles like declarative setup, clean contracts, maximum portability, continuous deployment, and stateless processes.",
		category: "best-practices",
		complexity: "intermediate",
		tags: ["12-factor", "saas", "methodology", "scalability"],
		education: {
			learningObjectives: [
				"Understand cloud-native application principles",
				"Learn portable application design",
				"Master scalable application architecture"
			],
			prerequisites: ["Web application development", "Cloud platforms", "Configuration management"],
			relatedConcepts: ["Cloud-Native", "Configuration", "Backing Services"],
			estimatedLearningTime: 30
		}
	},
	{
		id: "practices-02",
		front: "Immutable Infrastructure",
		back: "Immutable infrastructure is an approach where servers are never modified after deployment. Instead of updating existing infrastructure, new infrastructure is built with changes and replaces the old. This reduces configuration drift and improves reliability.",
		category: "best-practices",
		complexity: "intermediate",
		tags: ["immutable", "infrastructure", "reliability", "configuration-drift"],
		education: {
			learningObjectives: [
				"Understand immutable infrastructure benefits",
				"Learn deployment strategy evolution",
				"Master configuration management practices"
			],
			prerequisites: [
				"Infrastructure management",
				"Deployment processes",
				"Configuration management"
			],
			relatedConcepts: ["Infrastructure as Code", "Blue-Green Deployment", "Container Images"],
			estimatedLearningTime: 25
		}
	},

	// CLOUD PLATFORMS CATEGORY
	{
		id: "cloud-01",
		front: "Multi-Cloud Strategy",
		back: "Multi-cloud strategy involves using services from multiple cloud providers to avoid vendor lock-in, improve redundancy, and leverage best-of-breed services. It requires careful consideration of data transfer costs, complexity, and integration challenges.",
		category: "cloud-platforms",
		complexity: "advanced",
		tags: ["multi-cloud", "vendor-lock-in", "redundancy", "strategy"],
		education: {
			learningObjectives: [
				"Understand multi-cloud architecture benefits and challenges",
				"Learn vendor lock-in mitigation strategies",
				"Master cloud service integration techniques"
			],
			prerequisites: ["Cloud platforms", "Vendor management", "Architecture design"],
			relatedConcepts: ["Hybrid Cloud", "Cloud Migration", "Disaster Recovery"],
			estimatedLearningTime: 30
		}
	},

	// CI/CD CATEGORY
	{
		id: "cicd-01",
		front: "Progressive Delivery",
		back: "Progressive delivery extends continuous delivery with fine-grained control over feature releases. It combines deployment techniques like feature flags, canary deployments, and A/B testing to gradually roll out changes while monitoring impact and user feedback.",
		category: "cicd",
		complexity: "advanced",
		tags: ["progressive-delivery", "feature-flags", "canary", "a-b-testing"],
		education: {
			learningObjectives: [
				"Master advanced deployment strategies",
				"Understand risk mitigation in releases",
				"Learn user-centric deployment techniques"
			],
			prerequisites: ["CI/CD pipelines", "Feature flags", "Monitoring"],
			relatedConcepts: ["Feature Flags", "Canary Deployment", "Blue-Green Deployment"],
			estimatedLearningTime: 35
		}
	}
];

/**
 * Get flip cards by category
 */
export function getFlipCardsByCategory(category: FlipCardCategory): FlipCard[] {
	return conceptCards.filter((card) => card.category === category);
}

/**
 * Get flip cards by complexity level
 */
export function getFlipCardsByComplexity(complexity: FlipCardComplexity): FlipCard[] {
	return conceptCards.filter((card) => card.complexity === complexity);
}

/**
 * Get random flip cards for practice sessions
 */
export function getRandomFlipCards(count: number): FlipCard[] {
	const shuffled = [...conceptCards].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, Math.min(count, conceptCards.length));
}

/**
 * Get flip cards by tags (intersection)
 */
export function getFlipCardsByTags(tags: string[]): FlipCard[] {
	return conceptCards.filter((card) => tags.some((tag) => card.tags.includes(tag)));
}

/**
 * Search flip cards by text content
 */
export function searchFlipCards(query: string): FlipCard[] {
	const lowerQuery = query.toLowerCase();
	return conceptCards.filter(
		(card) =>
			card.front.toLowerCase().includes(lowerQuery) ||
			card.back.toLowerCase().includes(lowerQuery) ||
			card.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
	);
}

/**
 * Get statistics about the flip card collection
 */
export function getFlipCardStats() {
	const categories = [...new Set(conceptCards.map((card) => card.category))];
	const complexities = [...new Set(conceptCards.map((card) => card.complexity))];

	const byCategory: Record<string, number> = {};
	const byComplexity: Record<string, number> = {};

	conceptCards.forEach((card) => {
		byCategory[card.category] = (byCategory[card.category] || 0) + 1;
		byComplexity[card.complexity] = (byComplexity[card.complexity] || 0) + 1;
	});

	return {
		total: conceptCards.length,
		categories: categories.length,
		complexities: complexities.length,
		byCategory,
		byComplexity,
		averageLearningTime: Math.round(
			conceptCards.reduce((sum, card) => sum + card.education.estimatedLearningTime, 0) /
				conceptCards.length
		)
	};
}
