import type { StudyGuideContent } from "./types";

// Demo study guide content
export const demoStudyGuide: StudyGuideContent = {
	type: "study_guide",
	title: "Cloud-Native Architecture Mastery",
	summary:
		"Comprehensive study guide covering container orchestration, microservices, CI/CD, monitoring, and cloud-native patterns with interactive flashcards.",
	studyGuide: {
		description:
			"Comprehensive study guide covering container orchestration, microservices, CI/CD, monitoring, and cloud-native patterns",
		minimumCards: 12,
		flashcards: [
			{
				front: "What is Kubernetes and why is it essential for cloud-native applications?",
				back: "Kubernetes is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications across clusters. It's essential because it provides declarative configuration, self-healing capabilities, horizontal scaling, service discovery, and load balancing - all critical for managing microservices at scale.",
				tags: ["kubernetes", "orchestration", "cloud-native"]
			},
			{
				front: "Explain the difference between a Pod, Deployment, and Service in Kubernetes",
				back: "• **Pod**: Smallest deployable unit containing one or more containers sharing storage/network\n• **Deployment**: Manages Pod replicas, rolling updates, and rollbacks declaratively\n• **Service**: Provides stable networking endpoint and load balancing to access Pods, abstracting away Pod IP changes",
				tags: ["kubernetes", "pods", "deployments", "services"]
			},
			{
				front: "What are the key differences between StatefulSets and Deployments?",
				back: "**StatefulSets** provide:\n• Stable, unique network identifiers\n• Persistent storage that follows the Pod\n• Ordered deployment and scaling\n• Ordered rolling updates\n\n**Deployments** are for stateless applications with interchangeable Pods, while StatefulSets are for stateful applications like databases that need persistent identity and storage.",
				tags: ["kubernetes", "statefulsets", "deployments"]
			},
			{
				front: "What is the Twelve-Factor App methodology and its key principles?",
				back: "The Twelve-Factor App is a methodology for building SaaS applications. Key principles:\n• **Codebase**: One codebase, many deploys\n• **Dependencies**: Explicitly declare dependencies\n• **Config**: Store config in environment\n• **Processes**: Execute as stateless processes\n• **Logs**: Treat logs as event streams\n• **Disposability**: Fast startup and graceful shutdown",
				tags: ["twelve-factor", "architecture", "best-practices"]
			},
			{
				front: "What is Service Mesh and how does it solve microservices communication challenges?",
				back: "A Service Mesh is a dedicated infrastructure layer that handles service-to-service communication. It provides:\n• **Traffic Management**: Load balancing, routing, retries\n• **Security**: mTLS, authentication, authorization\n• **Observability**: Metrics, tracing, logging\n• **Policy Enforcement**: Rate limiting, circuit breaking\n\nPopular implementations: Istio, Linkerd, Consul Connect",
				tags: ["service-mesh", "microservices", "istio"]
			},
			{
				front: "Explain Container Registry security best practices",
				back: "**Security Best Practices**:\n• **Image Scanning**: Scan for vulnerabilities before deployment\n• **Signed Images**: Use Docker Content Trust or Cosign\n• **Private Registries**: Keep sensitive images private\n• **Minimal Base Images**: Use distroless or scratch images\n• **Regular Updates**: Keep base images and dependencies updated\n• **Access Controls**: Implement RBAC and image policies",
				tags: ["security", "containers", "registries"]
			},
			{
				front: "What are Kubernetes Operators and when should you use them?",
				back: "**Operators** extend Kubernetes API to manage complex, stateful applications using custom resources and controllers. They encode operational knowledge into software.\n\n**Use Cases**:\n• Database management (PostgreSQL, MongoDB)\n• Monitoring stack deployment (Prometheus)\n• Certificate management (cert-manager)\n• Backup and recovery automation\n\n**Benefits**: Automate Day 2 operations, reduce operational complexity",
				tags: ["kubernetes", "operators", "automation"]
			},
			{
				front: "What is GitOps and how does it improve deployment practices?",
				back: "**GitOps** uses Git as the single source of truth for declarative infrastructure and applications.\n\n**Core Principles**:\n• **Declarative**: System described declaratively\n• **Versioned**: Stored in version control (Git)\n• **Automated**: Changes applied automatically\n• **Monitored**: Continuous drift detection\n\n**Tools**: ArgoCD, Flux, Jenkins X\n**Benefits**: Improved security, auditability, and rollback capabilities",
				tags: ["gitops", "deployment", "ci-cd"]
			},
			{
				front: "Explain the Circuit Breaker pattern and its implementation in microservices",
				back: "**Circuit Breaker** prevents cascading failures by monitoring service calls and 'opening' when failure threshold is reached.\n\n**States**:\n• **Closed**: Normal operation, calls pass through\n• **Open**: Calls fail immediately, service recovery time\n• **Half-Open**: Limited calls to test service recovery\n\n**Implementation**: Hystrix, resilience4j, Istio\n**Benefits**: Prevents cascade failures, faster failure detection, graceful degradation",
				tags: ["patterns", "resilience", "microservices"]
			},
			{
				front: "What are the key components of observability in cloud-native systems?",
				back: "**Three Pillars of Observability**:\n\n• **Metrics**: Quantitative data (CPU, memory, request rate)\n• **Logs**: Discrete events with context\n• **Traces**: Request flow across distributed services\n\n**Additional Components**:\n• **SLOs/SLIs**: Service level objectives and indicators\n• **Alerting**: Proactive issue notification\n• **Dashboards**: Visual representation of system health\n\n**Tools**: Prometheus, Grafana, Jaeger, ELK Stack",
				tags: ["observability", "monitoring", "metrics"]
			},
			{
				front: "What is Progressive Delivery and how does it differ from traditional deployment?",
				back: "**Progressive Delivery** gradually rolls out changes to reduce risk.\n\n**Strategies**:\n• **Blue-Green**: Switch between two environments\n• **Canary**: Gradual traffic shift to new version\n• **Feature Flags**: Control feature visibility\n• **A/B Testing**: Compare user behavior between versions\n\n**Benefits**: Risk mitigation, faster feedback, improved reliability\n**Tools**: Flagger, Argo Rollouts, Spinnaker",
				tags: ["deployment", "progressive-delivery", "blue-green"]
			},
			{
				front: "Explain Container Security scanning and vulnerability management",
				back: "**Container Security Layers**:\n\n• **Image Scanning**: Static analysis for known vulnerabilities\n• **Runtime Security**: Monitor container behavior for anomalies\n• **Network Policies**: Control pod-to-pod communication\n• **Pod Security Standards**: Enforce security contexts\n• **Supply Chain Security**: Verify image provenance and signatures\n\n**Tools**: Trivy, Clair, Twistlock, Falco, OPA Gatekeeper\n**Best Practice**: Shift-left security, continuous scanning",
				tags: ["security", "scanning", "vulnerabilities"]
			}
		]
	}
};
