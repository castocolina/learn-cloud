import type {
	LessonContent,
	QuizContent,
	StudyGuideContent,
	CodeBlock,
	Diagram,
	ContentSection
} from "./types";

// Demo code blocks
const demoCodeBlocks: CodeBlock[] = [
	{
		language: "dockerfile",
		code: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]`,
		title: "Multi-stage Docker Build",
		filename: "Dockerfile"
	},
	{
		language: "yaml",
		code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"`,
		title: "Kubernetes Deployment"
	}
];

// Demo diagrams
const demoDiagrams: Diagram[] = [
	{
		type: "mermaid",
		definition: `graph TD
    A[Client Request] --> B{Load Balancer}
    B --> C[Web Server 1]
    B --> D[Web Server 2]
    B --> E[Web Server 3]
    C --> F[(Database)]
    D --> F
    E --> F
    F --> G[Cache Layer]`,
		title: "Load Balancer Architecture",
		caption: "A typical web application architecture with load balancing and caching"
	},
	{
		type: "mermaid",
		definition: `sequenceDiagram
    participant C as Client
    participant LB as Load Balancer
    participant W1 as Web Server 1
    participant DB as Database

    C->>LB: HTTP Request
    LB->>W1: Forward Request
    W1->>DB: Query Data
    DB-->>W1: Return Results
    W1-->>LB: HTTP Response
    LB-->>C: Return Response`,
		title: "Request Flow Diagram",
		caption: "How requests flow through a load-balanced system"
	}
];

// Demo lesson content
export const demoLesson: LessonContent = {
	type: "lesson",
	title: "Introduction to Container Orchestration",
	summary:
		"Learn the fundamentals of container orchestration with Kubernetes, including deployments, services, and scaling strategies.",
	estimatedTime: 45,
	prerequisites: [
		"Basic Docker knowledge",
		"Understanding of containerization concepts",
		"Familiarity with YAML syntax"
	],
	learningObjectives: [
		"Understand the role of container orchestration",
		"Learn Kubernetes basic concepts and architecture",
		"Deploy applications using Kubernetes manifests",
		"Implement basic scaling and load balancing"
	],
	sections: [
		{
			heading: "What is Container Orchestration?",
			paragraphs: [
				"Container orchestration is the automated deployment, management, scaling, and networking of containers. As applications grow in complexity and scale, managing individual containers manually becomes impractical.",
				"Orchestration platforms like <strong>Kubernetes</strong> provide a declarative approach to managing containerized applications, allowing you to specify the desired state and letting the platform handle the implementation details.",
				"Key benefits include:"
			],
			callouts: [
				{
					type: "info",
					title: "Why Orchestration Matters",
					content:
						"In production environments, you might need to manage hundreds or thousands of containers across multiple hosts. Orchestration automates tasks like load balancing, service discovery, rolling updates, and failure recovery."
				}
			]
		},
		{
			heading: "Kubernetes Architecture Overview",
			paragraphs: [
				"Kubernetes follows a <em>master-worker</em> architecture where the control plane manages the cluster state, and worker nodes run your application containers.",
				"The main components include:"
			],
			diagrams: [demoDiagrams[0]],
			callouts: [
				{
					type: "warning",
					title: "Learning Curve",
					content:
						"Kubernetes has a steep learning curve, but understanding the core concepts will significantly improve your ability to build scalable applications."
				}
			]
		},
		{
			heading: "Your First Deployment",
			paragraphs: [
				"Let's create a simple deployment that runs multiple replicas of a web application. This example shows how Kubernetes manages application lifecycle:"
			],
			codeBlocks: [demoCodeBlocks[1]],
			callouts: [
				{
					type: "success",
					title: "Best Practice",
					content:
						"Always specify resource limits and requests for your containers to ensure proper resource allocation and prevent resource starvation."
				}
			]
		},
		{
			heading: "Request Flow and Load Balancing",
			paragraphs: [
				"Understanding how requests flow through your Kubernetes cluster is crucial for designing resilient applications. The following diagram illustrates the typical request path:"
			],
			diagrams: [demoDiagrams[1]]
		}
	]
};

// Demo quiz content
export const demoQuiz: QuizContent = {
	type: "quiz",
	title: "Container Orchestration Quiz",
	summary: "Test your knowledge of container orchestration concepts and Kubernetes fundamentals.",
	quiz: {
		passingScore: 70,
		questions: [
			{
				question: "What is the primary purpose of container orchestration?",
				options: [
					"To create container images",
					"To automate deployment, scaling, and management of containers",
					"To replace Docker",
					"To monitor container performance only"
				],
				correct: 1,
				explanation:
					"Container orchestration automates the complex tasks of deploying, scaling, and managing containers across multiple hosts, making it easier to run applications at scale."
			},
			{
				question: "Which of the following are core Kubernetes components? (Select all that apply)",
				options: ["Control Plane", "Worker Nodes", "Docker Engine", "etcd", "kubelet"],
				correct: [0, 1, 3, 4],
				explanation:
					"The Control Plane manages the cluster, Worker Nodes run workloads, etcd stores cluster data, and kubelet is the node agent. Docker Engine is a container runtime but not a core Kubernetes component."
			},
			{
				question: 'In Kubernetes, what does a "replica" refer to?',
				options: [
					"A backup of the cluster",
					"An identical copy of a pod running the same application",
					"A mirror of the container registry",
					"A duplicate node in the cluster"
				],
				correct: 1,
				explanation:
					"A replica in Kubernetes is an identical copy of a pod. When you specify replicas: 3 in a deployment, Kubernetes ensures three identical pods are running."
			},
			{
				question: "What happens when a node fails in a Kubernetes cluster?",
				options: [
					"All applications stop working",
					"The cluster automatically shuts down",
					"Kubernetes reschedules the pods to healthy nodes",
					"Manual intervention is always required"
				],
				correct: 2,
				explanation:
					"Kubernetes automatically detects node failures and reschedules affected pods to healthy nodes, ensuring application availability without manual intervention."
			}
		]
	}
};

// Demo study guide content
export const demoStudyGuide: StudyGuideContent = {
	type: "study_guide",
	title: "Container Orchestration Study Guide",
	summary:
		"Interactive flashcards to reinforce key container orchestration and Kubernetes concepts.",
	studyGuide: {
		description:
			"Review these flashcards to solidify your understanding of container orchestration fundamentals. Click on each card to reveal the answer.",
		minimumCards: 6,
		flashcards: [
			{
				front: "What is the difference between a Container and a Pod in Kubernetes?",
				back: "A **Container** is a single running instance of an application with its dependencies. A **Pod** is the smallest deployable unit in Kubernetes that can contain one or more containers that share storage and network resources.",
				tags: ["kubernetes", "containers", "pods"]
			},
			{
				front: 'Define "Declarative" vs "Imperative" approaches in Kubernetes.',
				back: "**Declarative**: You describe the desired state (what you want) using YAML manifests, and Kubernetes figures out how to achieve it.\\n\\n**Imperative**: You give direct commands (how to do it) using kubectl commands like `kubectl create deployment`.",
				tags: ["kubernetes", "concepts", "management"]
			},
			{
				front: "What is a Kubernetes Service and why is it needed?",
				back: "A **Service** is an abstraction that provides stable network access to a set of pods. It's needed because pods are ephemeral (they come and go), but services provide a consistent endpoint with load balancing across healthy pods.",
				tags: ["kubernetes", "networking", "services"]
			},
			{
				front: "Explain the purpose of a Deployment in Kubernetes.",
				back: "A **Deployment** manages the lifecycle of pods, ensuring the specified number of replicas are running. It handles rolling updates, rollbacks, and automatically replaces failed pods to maintain the desired state.",
				tags: ["kubernetes", "deployments", "management"]
			},
			{
				front: "What is the role of the kubelet?",
				back: "The **kubelet** is the primary node agent that runs on each worker node. It communicates with the control plane, manages pod lifecycle, monitors pod health, and ensures containers are running as specified.",
				tags: ["kubernetes", "architecture", "components"]
			},
			{
				front: "How does Kubernetes handle application scaling?",
				back: "Kubernetes can scale applications **horizontally** (adding/removing pod replicas) using Horizontal Pod Autoscaler (HPA) or **vertically** (adjusting CPU/memory limits) using Vertical Pod Autoscaler (VPA). Scaling can be manual or automatic based on metrics.",
				tags: ["kubernetes", "scaling", "performance"]
			},
			{
				front: "What is a Namespace in Kubernetes?",
				back: "A **Namespace** provides a way to divide cluster resources between multiple users or applications. It's like a virtual cluster within a physical cluster, providing scope for names and enabling resource quotas and access control.",
				tags: ["kubernetes", "organization", "namespaces"]
			},
			{
				front: 'Explain the concept of "desired state" in Kubernetes.',
				back: "**Desired state** is the configuration you define in your manifests (YAML files). Kubernetes continuously works to ensure the actual state matches your desired state through controllers and reconciliation loops.",
				tags: ["kubernetes", "concepts", "state-management"]
			}
		]
	}
};

// Export all demo data
export const demoContent = {
	lesson: demoLesson,
	quiz: demoQuiz,
	studyGuide: demoStudyGuide
} as const;
